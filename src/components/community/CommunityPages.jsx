import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

const SORTS = [
  ['latest', 'Latest'],
  ['discussed', 'Most discussed'],
]

export function PageFrame({ eyebrow = 'TOWN', title, children, actions }) {
  return (
    <section className="town-page">
      <div className="town-page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        {actions && <div className="town-page-actions">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

function Loading() {
  return <div className="town-state">Loading…</div>
}

function Empty({ children }) {
  return <div className="town-empty">{children}</div>
}

export function TownHomePage() {
  const [communities, setCommunities] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    let active = true
    const loadHomePreview = async () => {
      if (!supabase) { setLoading(false); return }
      try {
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('id,name,slug,description,category,icon_url,created_at')
          .eq('status', 'active')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(6)
        if (communityError) throw communityError
        const visibleCommunities = communityData || []
        let recentPosts = []
        if (visibleCommunities.length) {
          const communityIds = visibleCommunities.map(item => item.id)
          const { data: postData, error: postError } = await supabase
            .from('posts')
            .select('id,title,body,community_id,created_at')
            .eq('status', 'published')
            .in('community_id', communityIds)
            .order('created_at', { ascending: false })
            .limit(5)
          if (postError) throw postError
          const communityById = new Map(visibleCommunities.map(item => [item.id, item]))
          recentPosts = (postData || []).map(post => ({ ...post, community: communityById.get(post.community_id) }))
        }
        if (active) {
          setCommunities(visibleCommunities)
          setPosts(recentPosts)
          setPreviewError('')
        }
      } catch {
        if (active) setPreviewError('Live previews are unavailable right now. Open the downtown directory to explore.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadHomePreview()
    return () => { active = false }
  }, [])

  return (
    <section className="town-page town-home-page">
      <div className="town-home-layout">
        <div className="town-home-main">
          <section className="town-home-hero">
            <div className="town-home-copy">
              <p className="town-kicker">YOUR SPACE. YOUR CONVERSATIONS.</p>
              <h1 className="town-home-headline">A place for better conversations.</h1>
              <p className="town-home-subhead">
                Join communities, follow the topics you care about, and choose how discussions are sorted. Your attention stays yours.
              </p>
              <div className="town-hero-actions">
                <a className="button primary" href="#/communities">Explore downtowns <span aria-hidden="true">→</span></a>
                <a className="button secondary" href="#/create-post">Create a post</a>
              </div>
            </div>
            <span className="town-home-hero-caption">LOCAL VOICES · SHARED INTERESTS</span>
          </section>

          <section className="town-home-discover" aria-labelledby="town-home-discover-title">
            <div className="town-home-section-heading">
              <div><p className="eyebrow">FIND YOUR PEOPLE</p><h2 id="town-home-discover-title">Explore downtowns</h2></div>
              <a className="town-home-text-link" href="#/communities">View all <span aria-hidden="true">→</span></a>
            </div>
            {previewError && <p className="town-home-notice" role="status">{previewError}</p>}
            {loading && <div className="town-home-empty">Loading downtowns…</div>}
            {!loading && !communities.length && <div className="town-home-empty">No public downtowns to preview yet. Check the directory again soon.</div>}
            {!!communities.length && <div className="town-home-community-grid">
              {communities.map((community, index) => (
                <a className="town-home-community-card" href={`#/community/${community.slug}`} key={community.id}>
                  <div className={`town-home-community-art tone-${index % 5}`}>
                    {community.icon_url ? <img src={community.icon_url} alt="" loading="lazy" /> : <span aria-hidden="true">{(community.name || 'T').slice(0, 1).toUpperCase()}</span>}
                  </div>
                  <div className="town-home-community-copy">
                    <span className="town-home-community-category">{community.category || 'Downtown'}</span>
                    <h3>{community.name}</h3>
                    <p>{community.description || 'A place to ask questions and share what you know.'}</p>
                    <span className="town-home-card-link">Open downtown <span aria-hidden="true">→</span></span>
                  </div>
                </a>
              ))}
            </div>}
          </section>
        </div>

        <aside className="town-home-side-column" aria-label="Recent activity and Town guidance">
          <section className="town-home-side-card">
            <div className="town-home-section-heading compact">
              <div><p className="eyebrow">LATEST ACTIVITY</p><h2>Recent conversations</h2></div>
              <a className="town-home-text-link" href="#/feed" aria-label="View all conversations">View all</a>
            </div>
            {posts.map(post => (
              <a className="town-home-discussion" href={`#/post/${post.id}`} key={post.id}>
                <span className="town-home-discussion-community">{post.community?.name || 'Downtown'}</span>
                <strong>{post.title}</strong>
                {post.body && <span className="town-home-discussion-excerpt">{post.body}</span>}
                <span className="town-home-discussion-meta">{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent post'} <span aria-hidden="true">↗</span></span>
              </a>
            ))}
            {!loading && !posts.length && <div className="town-home-side-empty">No published discussions in the preview yet. Start with a downtown that interests you.</div>}
            {loading && <div className="town-home-side-empty">Loading recent discussions…</div>}
          </section>
          <section className="town-home-side-card town-home-principle-card">
            <p className="eyebrow">BUILT AROUND CHOICE</p>
            <h2>Your feed, your rules.</h2>
            <p>Choose a downtown and sort discussions by latest or most discussed. Town keeps the controls visible instead of hiding the ranking logic.</p>
            <a className="town-home-text-link" href="#/help">How Town works <span aria-hidden="true">→</span></a>
          </section>
        </aside>
      </div>
    </section>
  )
}

export function CommunitiesPage({ currentUserId }) {
  const [communities, setCommunities] = useState([]), [joinedIds, setJoinedIds] = useState(new Set())
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('latest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('communities')
      .select('id,name,slug,description,category,icon_url,creator_id,created_at,status')
      .eq('status', 'active')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
    if (fetchError) setError(fetchError.message)
    const ids=(data||[]).map(item=>item.id)
    const [{data:memberships},{data:posts},{data:joined}]=await Promise.all([
      ids.length?supabase.from('community_memberships').select('community_id').in('community_id',ids):Promise.resolve({data:[]}),
      ids.length?supabase.from('posts').select('community_id').in('community_id',ids).eq('status','published'):Promise.resolve({data:[]}),
      currentUserId?supabase.from('community_memberships').select('community_id').eq('user_id',currentUserId):Promise.resolve({data:[]})
    ])
    const memberCounts=new Map(),postCounts=new Map()
    ;(memberships||[]).forEach(row=>memberCounts.set(row.community_id,(memberCounts.get(row.community_id)||0)+1))
    ;(posts||[]).forEach(row=>postCounts.set(row.community_id,(postCounts.get(row.community_id)||0)+1))
    setCommunities((data||[]).map(item=>({...item,member_count:memberCounts.get(item.id)||0,post_count:postCounts.get(item.id)||0})))
    setJoinedIds(new Set((joined||[]).map(row=>row.community_id)))
    setLoading(false)
  }

  useEffect(() => { load() }, [currentUserId])

  const categories = useMemo(() => ['All', ...Array.from(new Set(communities.map(c => c.category).filter(Boolean))).sort()], [communities])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const result = communities.filter(c => {
      const matchesQuery = !needle || `${c.name} ${c.description} ${c.category}`.toLowerCase().includes(needle)
      const matchesCategory = category === 'All' || c.category === category
      return matchesQuery && matchesCategory
    })
    if (sort === 'members') return [...result].sort((a,b)=>b.member_count-a.member_count)
    if (sort === 'active') return [...result].sort((a,b)=>b.post_count-a.post_count)
    if (sort === 'name') return [...result].sort((a,b)=>a.name.localeCompare(b.name))
    return result
  }, [communities, query, category, sort])
  const curated = useMemo(() => {
    if (showAll || query.trim() || category !== 'All') return filtered
    return filtered.slice(0, 7)
  }, [filtered, showAll, query, category])

  return (
    <PageFrame
      eyebrow="DOWNTOWNS"
      title="Choose where to spend your attention."
      actions={currentUserId ? <a className="button primary" href="#/create-community">Create downtown</a> : <a className="button secondary" href="#/create-community">Sign in to create</a>}
    >
      <div className="town-directory-intro"><p>Start with a small set of downtowns. Explore the full directory whenever you want.</p><button type="button" className="button secondary" onClick={() => setShowAll(v => !v)}>{showAll ? 'Show curated selection' : `Show all ${communities.length} downtowns`}</button></div>
      <div className="town-directory-controls">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search downtowns…" aria-label="Search downtowns" />
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort downtowns">
          <option value="latest">Recently created</option>
          <option value="members">Most members</option>
          <option value="active">Most active</option>
          <option value="name">Name</option>
        </select>
      </div>

      {loading && <Loading />}
      {error && <div className="town-error">{error}<button className="button secondary" onClick={load}>Retry</button></div>}
      {!loading && !error && !filtered.length && <Empty>{query || category !== 'All' ? 'No downtowns match your filters.' : 'No downtowns have been seeded yet.'}</Empty>}
      <div className="community-grid">
        {curated.map(community => (
          <a className="community-card" href={`#/community/${community.slug}`} key={community.id}>
            <div className="community-card-icon">{community.icon_url ? <img src={community.icon_url} alt="" /> : community.name.slice(0, 1).toUpperCase()}</div>
            <div className="community-card-body">
              <div className="community-card-topline"><span>{community.category}</span></div>
              <h2>{community.name}</h2>
              <p>{community.description || 'A downtown in the town.'}</p>
              <div className="community-discovery-stats"><span>{community.member_count} members</span><span>{community.post_count} discussions</span></div><span className="community-open">{joinedIds.has(community.id) ? 'Joined downtown →' : 'Explore downtown →'}</span>
            </div>
          </a>
        ))}
      </div>
    </PageFrame>
  )
}

export function CommunityPage({ slug, currentUserId }) {
  const [community, setCommunity] = useState(null)
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [member, setMember] = useState(false), [membershipRole, setMembershipRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const { data: communityData, error: communityError } = await supabase
      .from('communities')
      .select('id,name,slug,description,rules,category,icon_url,creator_id,created_at')
      .eq('slug', slug)
      .maybeSingle()
    if (communityError || !communityData) {
      setError(communityError?.message || 'Downtown not found.')
      setLoading(false)
      return
    }
    const [{ data: categoryData, error: categoryError }, { data: postData, error: postError }, membership] = await Promise.all([
      supabase.from('community_categories').select('id,name,description,position').eq('community_id', communityData.id).order('position'),
      supabase.from('posts').select('id,title,body,post_type,created_at,is_pinned,author_id').eq('community_id', communityData.id).eq('status', 'published').order('created_at', { ascending: false }).limit(20),
      currentUserId ? supabase.from('community_memberships').select('role').eq('community_id', communityData.id).eq('user_id', currentUserId).maybeSingle() : Promise.resolve({ data: null })
    ])
    if (categoryError || postError) setError(categoryError?.message || postError?.message || 'Unable to load downtown.')
    setCommunity(communityData)
    setCategories(categoryData || [])
    setPosts(postData || [])
    setMember(Boolean(membership?.data)); setMembershipRole(membership?.data?.role || '')
    setLoading(false)
  }

  useEffect(() => { load(); window.dispatchEvent(new CustomEvent('town-pet-event', { detail: { kind: 'community-opened', label: slug } })) }, [slug, currentUserId])

  // Record foreground time in each downtown for members who have not published posts.
  useEffect(() => {
    if (!currentUserId || !community?.id || !supabase) return
    let cancelled = false
    const recordTime = async () => {
      if (cancelled || document.visibilityState !== 'visible') return
      const { data: existing, error: readError } = await supabase
        .from('community_time_spent')
        .select('seconds_spent')
        .eq('user_id', currentUserId)
        .eq('community_id', community.id)
        .maybeSingle()
      if (readError) {
        if (readError.code !== '42P01') console.warn('Could not read downtown time:', readError.message)
        return
      }
      const { error: writeError } = await supabase
        .from('community_time_spent')
        .upsert({
          user_id: currentUserId,
          community_id: community.id,
          seconds_spent: (existing?.seconds_spent || 0) + 15,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,community_id' })
      if (writeError) console.warn('Could not record downtown time:', writeError.message)
    }
    const timer = window.setInterval(recordTime, 15000)
    const onVisible = () => { if (document.visibilityState === 'visible') recordTime() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [currentUserId, community?.id])

  const changeCommunityIcon = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !community || community.creator_id !== currentUserId) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Choose a JPG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The image must be 5 MB or smaller.')
      return
    }
    setUploadingIcon(true)
    setError('')
    try {
      const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[file.type]
      const path = `${community.id}/icon-${Date.now()}.${extension}`
      const { error: uploadError } = await supabase.storage.from('community-media').upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      })
      if (uploadError) throw uploadError
      const { data: publicData } = supabase.storage.from('community-media').getPublicUrl(path)
      const iconUrl = publicData.publicUrl
      const { error: updateError } = await supabase.from('communities')
        .update({ icon_url: iconUrl })
        .eq('id', community.id)
        .eq('creator_id', currentUserId)
      if (updateError) throw updateError
      setCommunity(previous => ({ ...previous, icon_url: iconUrl }))
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to update the downtown profile picture.')
    } finally {
      setUploadingIcon(false)
    }
  }

  const toggleMembership = async () => {
    if (!currentUserId || !community) return
    setBusy(true)
    if (member) {
      const { error: leaveError } = await supabase.from('community_memberships').delete().eq('community_id', community.id).eq('user_id', currentUserId)
      if (leaveError) setError(leaveError.message)
      else setMember(false)
    } else {
      const { error: joinError } = await supabase.from('community_memberships').insert({ community_id: community.id, user_id: currentUserId, role: 'member' })
      if (joinError) setError(joinError.message)
      else setMember(true)
    }
    setBusy(false)
  }

  if (loading) return <PageFrame eyebrow="DOWNTOWN" title="Loading…"><Loading /></PageFrame>
  if (error && !community) return <PageFrame eyebrow="DOWNTOWN" title="Downtown unavailable"><div className="town-error">{error}<button className="button secondary" onClick={load}>Retry</button></div></PageFrame>

  return (
    <PageFrame
      eyebrow={community.category}
      title={community.name}
      actions={<>{/* New post button */}{currentUserId ? <a className="button primary" href="#/create-post">New post</a> : <a className="button secondary" href="#/create-post">Sign in to post</a>}{slug === 'city-mumbai' && (<>{/* Section links */}<a className="button secondary" href={`#/library/${slug}`}>Library</a><a className="button secondary" href={`#/wiki/${slug}`}>Wiki</a><a className="button secondary" href={`#/updates/${slug}`}>Updates</a></>)}{currentUserId && (<button className={`button ${member ? 'secondary' : 'primary'}`} disabled={busy} onClick={toggleMembership}>{busy ? 'Working…' : member ? 'Leave downtown' : 'Join downtown'}</button>)}</>}
    >
      <div className="community-header">
        <div className="community-profile-identity">
          <div className="community-profile-picture">
            {community.icon_url
              ? <img src={community.icon_url} alt={`${community.name} profile`} />
              : <span aria-hidden="true">{(community.name || 'D').slice(0, 1).toUpperCase()}</span>}
          </div>
          <div className="community-profile-details">
            <p>{community.description || 'No description yet.'}</p>
            <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        {community.creator_id === currentUserId && (
          <label className="button secondary community-icon-upload">
            {uploadingIcon ? 'Uploading…' : community.icon_url ? 'Change profile picture' : 'Add profile picture'}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={changeCommunityIcon} disabled={uploadingIcon} aria-label="Change downtown profile picture" />
          </label>
        )}
      </div>
      {error && <div className="town-error">{error}</div>}

      <div className="community-layout">
        <section>
          <div className="town-section-heading"><div><p className="eyebrow">DISCUSSION</p><h2>Recent posts</h2></div></div>
          {!posts.length ? <Empty>No posts yet. Be the first person to start a discussion.</Empty> : <div className="post-list">
            {posts.map(post => <article className="post-card" key={post.id} onClick={() => window.location.hash = `#/post/${post.id}`} style={{ cursor: 'pointer' }}>
              {post.is_pinned && <span className="post-pin">PINNED</span>}
              <span className="post-type">{post.post_type}</span>
              <h3><a className="post-title-link" href={`#/post/${post.id}`}>{post.title}</a></h3>
              <p>{post.body || 'No body text.'}</p>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </article>)}
          </div>}
        </section>
        <aside className="community-sidebar">
          <div className="town-side-card"><p className="eyebrow">TOPICS</p><h3>Downtown structure</h3>{categories.length ? <ul>{categories.map(c => <li key={c.id}><strong>{c.name}</strong><span>{c.description}</span></li>)}</ul> : <p>No categories yet.</p>}</div>
          <div className="town-side-card"><p className="eyebrow">RULES</p><h3>Downtown rules</h3><p>{community.rules || 'No rules have been published yet.'}</p></div>
        </aside>
      </div>
      <CommunityEventsPanel communityId={community.id} currentUserId={currentUserId} canManage={community.creator_id === currentUserId || ['owner','moderator','admin'].includes(membershipRole)} />
    </PageFrame>
  )
}

export function CreateCommunityPage({ currentUserId }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '', rules: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const slug = form.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const { data, error: createError } = await supabase.from('communities').insert({ ...form, category: 'General', name: form.name.trim(), slug, creator_id: currentUserId }).select('id,slug').single()
    if (createError) {
      setError(createError.message)
      setBusy(false)
      return
    }
    const { error: memberError } = await supabase.from('community_memberships').insert({ community_id: data.id, user_id: currentUserId, role: 'owner' })
    if (memberError) {
      setError(memberError.message)
      setBusy(false)
      return
    }
    window.location.hash = `#/community/${data.slug}`
  }

  return <PageFrame eyebrow="DOWNTOWNS" title="Create a downtown">
    <form className="town-form" onSubmit={submit}>
      <label>Name<input value={form.name} onChange={e => update('name', e.target.value)} minLength={2} maxLength={80} required placeholder="e.g. Bengaluru Builders" /></label>
      <label>Slug<input value={form.slug} onChange={e => update('slug', e.target.value)} maxLength={80} required placeholder="bengaluru-builders" /></label>
      <label>Description<textarea value={form.description} onChange={e => update('description', e.target.value)} maxLength={500} placeholder="What belongs here?" /></label>
      <label>Rules<textarea value={form.rules} onChange={e => update('rules', e.target.value)} maxLength={5000} placeholder="Keep the discussion useful and respectful." /></label>
      {error && <div className="town-error">{error}</div>}
      <div className="town-form-actions"><button className="button primary" disabled={busy}>{busy ? 'Creating…' : 'Create downtown'}</button><a className="button secondary" href="#/communities">Cancel</a></div>
    </form>
  </PageFrame>
}


function CommunityEventsPanel({ communityId, currentUserId, canManage }) {
  const [events,setEvents]=useState([])
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const [startsAt,setStartsAt]=useState('')
  const [location,setLocation]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const load=async()=>{
    const {data,error:loadError}=await supabase.from('community_events').select('id,title,description,starts_at,location,created_by').eq('community_id',communityId).gte('starts_at',new Date().toISOString()).order('starts_at').limit(12)
    if(loadError)setError(loadError.message)
    setEvents(data||[])
  }
  useEffect(()=>{load()},[communityId])
  const create=async e=>{
    e.preventDefault()
    if(!currentUserId||!title.trim()||!startsAt)return
    setBusy(true);setError('')
    const {error:createError}=await supabase.from('community_events').insert({community_id:communityId,created_by:currentUserId,title:title.trim(),description:description.trim(),starts_at:new Date(startsAt).toISOString(),location:location.trim()})
    if(createError)setError(createError.message)
    else{setTitle('');setDescription('');setStartsAt('');setLocation('');await load()}
    setBusy(false)
  }
  const remove=async id=>{
    const {error:removeError}=await supabase.from('community_events').delete().eq('id',id)
    if(removeError)setError(removeError.message);else setEvents(rows=>rows.filter(x=>x.id!==id))
  }
  return <section className="card community-events"><div className="card-heading"><div><p className="eyebrow">MEET THE COMMUNITY</p><h2>Upcoming events</h2><p className="feature-text">Meetups, online sessions and community activities organised by downtown members.</p></div></div>
    {error&&<div className="town-error" role="alert">{error}</div>}
    {canManage&&<form className="community-event-form" onSubmit={create}><label>Event title<input value={title} onChange={e=>setTitle(e.target.value)} minLength={3} maxLength={100} placeholder="e.g. Monthly community meetup" required /></label><label>Date and time<input type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)} min={new Date().toISOString().slice(0,16)} required /></label><label>Location or meeting link<input value={location} onChange={e=>setLocation(e.target.value)} maxLength={160} placeholder="Venue or online link" /></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={1000} placeholder="What should members know?" /></label><button className="button primary" disabled={busy}>{busy?'Publishing…':'Publish event'}</button></form>}
    {!events.length?<div className="town-empty">No upcoming events have been scheduled.</div>:<div className="community-event-list">{events.map(event=><article className="community-event-item" key={event.id}><div className="community-event-date"><strong>{new Date(event.starts_at).toLocaleDateString(undefined,{day:'2-digit'})}</strong><span>{new Date(event.starts_at).toLocaleDateString(undefined,{month:'short'})}</span></div><div><h3>{event.title}</h3><p>{event.description}</p><span>{new Date(event.starts_at).toLocaleString()} {event.location&&'· '+event.location}</span></div>{(event.created_by===currentUserId||canManage)&&<button className="button secondary" onClick={()=>remove(event.id)}>Cancel event</button>}</article>)}</div>}
  </section>
}
