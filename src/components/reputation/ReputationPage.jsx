import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

const badgeSymbols = {
  'first-post': '01', 'first-comment': '02', 'conversation-starter': '10',
  'prolific-publisher': '100', 'regular-voice': '25', 'helpful-contributor': '★',
  'community-builder': 'T', 'town-pillar': '500', 'trusted-moderator': 'M',
  'community-regular': '5×'
}
const tierLabels = { common: 'COMMON', uncommon: 'UNCOMMON', rare: 'RARE', epic: 'EPIC', legendary: 'LEGENDARY' }

export function ReputationPage({ currentUserId }) {
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [badges, setBadges] = useState([])
  const [stats, setStats] = useState({ posts: 0, comments: 0, votes: 0, helpful: 0, communities: 0, createdCommunities: 0, isModerator: false })
  const [daysJoined, setDaysJoined] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true); setError('')
      let timeoutId
      try {
        // Badge sync is best-effort; it must never prevent the profile from loading.
        const syncPromise = Promise.resolve(supabase.rpc('sync_my_badges')).catch(error => ({ error }))
        const requests = Promise.all([
          supabase.from('profiles').select('id,username,reputation_score,created_at,bio,interests').eq('id', currentUserId).single(),
          supabase.from('reputation_events').select('id,event_type,points,post_id,comment_id,created_at').eq('user_id', currentUserId).order('created_at', { ascending: false }).limit(50),
          supabase.from('user_badges').select('badge_id,awarded_at').eq('user_id', currentUserId).order('awarded_at', { ascending: false }),
          supabase.from('badges').select('id,slug,name,description,icon,criteria,tier,category').order('created_at'),
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', currentUserId).eq('status', 'published'),
          supabase.from('comments').select('id', { count: 'exact', head: true }).eq('author_id', currentUserId).eq('status', 'published'),
          supabase.from('post_votes').select('post_id', { count: 'exact', head: true }).eq('user_id', currentUserId),
          supabase.from('post_votes').select('post_id,posts!inner(author_id)', { count: 'exact', head: true }).eq('posts.author_id', currentUserId).eq('value', 1),
          supabase.from('comment_votes').select('comment_id,comments!inner(author_id)', { count: 'exact', head: true }).eq('comments.author_id', currentUserId).eq('value', 1),
          supabase.from('community_memberships').select('community_id', { count: 'exact', head: true }).eq('user_id', currentUserId),
          supabase.from('communities').select('id', { count: 'exact', head: true }).eq('creator_id', currentUserId).eq('status', 'active'),
          supabase.from('community_memberships').select('community_id').eq('user_id', currentUserId).in('role', ['moderator','admin']).limit(1),
          supabase.rpc('get_public_reputation_breakdown', { target_user_id: currentUserId })
        ])
        const results = await Promise.race([
          requests,
          new Promise((_, reject) => { timeoutId = window.setTimeout(() => reject(new Error('This is taking longer than expected. Check your connection and try again.')), 15000) })
        ])
        const [profileRes, eventsRes, badgesRes, catalogRes, postsRes, commentsRes, votesRes, helpfulPostsRes, helpfulCommentsRes, communitiesRes] = results
        const breakdownRes = results[12]
        if (!active) return
        const failed = results.find(result => result?.error)
        if (failed) throw failed.error
        const syncRes = await Promise.race([syncPromise, new Promise(resolve => window.setTimeout(() => resolve({ error: null }), 2500))])
        if (syncRes?.error) console.warn('Badge sync could not complete:', syncRes.error.message)
        setProfile(profileRes.data)
        const joinedAt = profileRes.data?.created_at ? new Date(profileRes.data.created_at) : null
        setDaysJoined(joinedAt && !Number.isNaN(joinedAt.getTime()) ? Math.max(0, Math.floor((Date.now() - joinedAt.getTime()) / 86400000)) : null)
        setEvents(eventsRes.data || [])
        setBreakdown(breakdownRes.data || [])
        const earned = new Map((badgesRes.data || []).map(x => [x.badge_id, x.awarded_at]))
        setBadges((catalogRes.data || []).map(b => ({ ...b, awarded_at: earned.get(b.id) || null })))
        setStats({
          posts: postsRes.count || 0, comments: commentsRes.count || 0, votes: votesRes.count || 0,
          helpful: (helpfulPostsRes.count || 0) + (helpfulCommentsRes.count || 0),
          communities: communitiesRes.count || 0
        })
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Unable to load your contribution profile.')
      } finally {
        window.clearTimeout(timeoutId)
        if (active) setLoading(false)
      }
    }
    if (currentUserId) load()
    return () => { active = false }
  }, [currentUserId])

  const positive = useMemo(() => breakdown.filter(e => e.points_total > 0).reduce((sum, e) => sum + Number(e.points_total), 0), [breakdown])
  const negative = useMemo(() => Math.abs(breakdown.filter(e => e.points_total < 0).reduce((sum, e) => sum + Number(e.points_total), 0)), [breakdown])
  const acceptedAnswers = useMemo(() => Math.max(0, breakdown.filter(e => e.event_type === 'answer_accepted').reduce((sum, e) => sum + Number(e.event_count), 0) - breakdown.filter(e => e.event_type === 'answer_unaccepted').reduce((sum, e) => sum + Number(e.event_count), 0)), [breakdown])
  const earnedBadges = badges.filter(b => b.awarded_at)
  const lockedBadges = badges.filter(b => !b.awarded_at)
  const label = (type) => ({ post_created: 'Published a post', comment_created: 'Added a comment', post_upvoted: 'Received a post upvote', comment_upvoted: 'Received a comment upvote', post_downvoted: 'Received a post downvote', comment_downvoted: 'Received a comment downvote', answer_accepted: 'Answer accepted', answer_unaccepted: 'Accepted answer replaced', moderator_recognition: 'Moderator recognition', badge_awarded: 'Badge awarded', manual_adjustment: 'Manual adjustment' }[type] || type)

  const progressFor = (badge) => {
    const values = {
      'first-post': [stats.posts, 1], 'first-comment': [stats.comments, 1],
      'conversation-starter': [stats.posts, 10], 'prolific-publisher': [stats.posts, 100],
      'regular-voice': [stats.comments, 25], 'helpful-contributor': [stats.helpful, 10],
      'community-builder': [0, 1], 'town-pillar': [profile?.reputation_score || 0, 500],
      'trusted-moderator': [0, 1], 'community-regular': [stats.communities, 5]
    }
    return values[badge.slug] || [0, 1]
  }

  const BadgeCard = ({ badge, locked = false }) => {
    const [value, target] = progressFor(badge)
    const percent = Math.min(100, Math.round((value / target) * 100))
    return <article className={`achievement-card ${locked ? 'is-locked' : 'is-earned'} tier-${badge.tier || 'common'}`}>
      <div className="achievement-card-top"><span className="achievement-tier">{tierLabels[badge.tier] || 'COLLECTIBLE'}</span><span className="achievement-serial">{badge.category?.toUpperCase()}</span></div>
      <div className="achievement-art"><span className="achievement-laurel">✦</span><strong>{badgeSymbols[badge.slug] || '★'}</strong><span className="achievement-laurel">✦</span></div>
      <div className="achievement-card-copy"><h3>{badge.name}</h3><p>{badge.description}</p></div>
      {locked ? <div className="achievement-progress"><div><span>UNLOCK CONDITION</span><b>{badge.criteria || 'Keep contributing'}</b></div><div className="achievement-progress-track"><i style={{ width: `${percent}%` }} /></div><small>{['community-builder','trusted-moderator'].includes(badge.slug) ? (badge.slug === 'community-builder' ? 'Create a downtown' : 'Become a downtown moderator') : `${Math.min(value,target)} / ${target}`}</small></div>
      : <div className="achievement-earned"><span>✓ VERIFIED TOWN ACHIEVEMENT</span><strong>Collected {new Date(badge.awarded_at).toLocaleDateString()}</strong></div>}
      <div className="achievement-card-footer"><span>TOWN • MEMBER COLLECTION</span><span>{locked ? 'NOT YET EARNED' : 'OWNED'}</span></div>
    </article>
  }

  if (loading) return <section className="card reputation-loading"><p className="eyebrow">CONTRIBUTION</p><h1>Loading your reputation…</h1><p className="status" role="status" aria-live="polite">Fetching your contribution history and achievements.</p></section>
  if (error) return <section className="card reputation-loading"><p className="eyebrow">CONTRIBUTION</p><h1>Reputation unavailable</h1><p className="status error" role="alert">{error}</p><button className="button secondary" type="button" onClick={() => window.location.reload()}>Reload reputation</button></section>

  return <div className="reputation-page">
    <section className="reputation-hero card">
      <div><p className="eyebrow">CONTRIBUTION</p><h1>{profile?.username || 'Member'}'s reputation</h1><p className="feature-text">Reputation reflects useful participation, not time spent on the platform.</p></div>
      <div className="reputation-score"><strong>{profile?.reputation_score || 0}</strong><span>reputation</span></div>
    </section>
    <div className="reputation-grid">
      <section className="card"><div className="card-heading"><div><p className="eyebrow">ACTIVITY</p><h2>Contribution</h2></div></div><div className="reputation-stat-grid"><div><strong>{daysJoined === null ? '—' : daysJoined}</strong><span>Days joined</span></div><div><strong>{stats.posts}</strong><span>Posts</span></div><div><strong>{stats.comments}</strong><span>Comments</span></div><div><strong>{stats.votes}</strong><span>Votes cast</span></div><div><strong>+{positive}</strong><span>Positive points</span></div><div><strong>-{negative}</strong><span>Negative points</span></div><div><strong>{acceptedAnswers}</strong><span>Accepted answers</span></div></div></section>
      <section className="card"><div className="card-heading"><div><p className="eyebrow">COLLECTION</p><h2>Achievement cabinet</h2><p className="feature-text">Collectible cards are awarded automatically from verified Town activity.</p></div><strong className="achievement-count">{earnedBadges.length} / {badges.length}</strong></div>
        {earnedBadges.length>0&&<><p className="achievement-section-label">YOUR COLLECTIBLES · {earnedBadges.length} EARNED</p><div className="achievement-collection">{earnedBadges.map(b=><BadgeCard key={b.id} badge={b}/>)}</div></>}
        <p className="achievement-section-label">STILL TO DISCOVER · {lockedBadges.length}</p>
        {lockedBadges.length?<div className="achievement-collection">{lockedBadges.map(b=><BadgeCard key={b.id} badge={b} locked/>)}</div>:<div className="empty-state"><strong>Collection complete.</strong><span>You have earned every available Town achievement.</span></div>}
      </section>
    </div>
    <section className="card"><div className="card-heading"><div><p className="eyebrow">POINT SOURCES</p><h2>Reputation breakdown</h2><p className="feature-text">Totals are calculated from the complete recorded ledger, not just recent activity.</p></div></div>{breakdown.length ? <div className="reputation-breakdown">{breakdown.map(item => <div className="reputation-breakdown-row" key={item.event_type}><div><strong>{label(item.event_type)}</strong><span>{Number(item.event_count).toLocaleString()} events</span></div><b className={Number(item.points_total) >= 0 ? 'points positive' : 'points negative'}>{Number(item.points_total) > 0 ? '+' : ''}{Number(item.points_total).toLocaleString()}</b></div>)}</div> : <div className="empty-state"><strong>No reputation activity yet.</strong><span>Recorded contributions will appear here.</span></div>}</section>
    <section className="card"><div className="card-heading"><div><p className="eyebrow">TRANSPARENT LEDGER</p><h2>Recent reputation</h2></div></div>{events.length ? <div className="reputation-events">{events.map(e => <div className="reputation-event" key={e.id}><div><strong>{label(e.event_type)}</strong><span>{new Date(e.created_at).toLocaleString()}</span></div><b className={e.points >= 0 ? 'points positive' : 'points negative'}>{e.points >= 0 ? '+' : ''}{e.points}</b></div>)}</div> : <div className="empty-state"><strong>No reputation events yet.</strong><span>Your contribution history will appear here.</span></div>}</section>
  </div>
}
