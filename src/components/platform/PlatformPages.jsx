import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { avatarUrl } from '../../avatar'

function Frame({ title, eyebrow = 'TOWN', actions, children }) {
  return <section className="town-page"><div className="town-page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{actions && <div className="town-page-actions">{actions}</div>}</div>{children}</section>
}
const reputationEventLabel = (type) => ({ post_created: 'Published a post', comment_created: 'Added a comment', post_upvoted: 'Received a post upvote', comment_upvoted: 'Received a comment upvote', post_downvoted: 'Received a post downvote', comment_downvoted: 'Received a comment downvote', answer_accepted: 'Answer accepted', answer_unaccepted: 'Accepted answer replaced', moderator_recognition: 'Moderator recognition', manual_adjustment: 'Reputation adjustment' }[type] || type)
const ago = (value) => { const d = new Date(value); const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000)); if (s < 60) return `${s}s ago`; const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const days = Math.floor(h / 24); if (days < 30) return `${days}d ago`; return d.toLocaleDateString() }
function State({ children }) { return <div className="town-state">{children}</div> }
function Empty({ children }) { return <div className="town-empty">{children}</div> }
function ErrorBox({ children }) { return <div className="town-error">{children}</div> }

export function SearchPage({ currentUserId }) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('posts')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const search = async (event) => {
    event?.preventDefault(); const q = query.trim(); if (!q) { setResults([]); return }
    setLoading(true); setError('')
    try {
      if (scope === 'communities') {
        const { data, error: e } = await supabase.from('communities').select('id,name,slug,description,category').eq('status','active').or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`).order('name').limit(50)
        if (e) throw e; setResults(data || [])
      } else if (scope === 'users') {
        const { data, error: e } = await supabase.from('profiles').select('id,username,display_name,bio').or(`username.ilike.%${q}%,display_name.ilike.%${q}%,bio.ilike.%${q}%`).limit(50)
        if (e) throw e; setResults(data || [])
      } else {
        const { data, error: e } = await supabase.from('posts').select('id,title,body,community_id,author_id,created_at,status').eq('status','published').textSearch('search_document', q, { config: 'english', type: 'websearch' }).order('created_at',{ascending:false}).limit(50)
        if (e) throw e
        const ids = [...new Set((data || []).map(p => p.community_id).filter(Boolean))]
        const { data: communities } = ids.length ? await supabase.from('communities').select('id,name,slug').in('id',ids) : { data: [] }
        const map = new Map((communities || []).map(c => [c.id,c])); setResults((data || []).map(p => ({ ...p, community: map.get(p.community_id) })))
      }
    } catch (e) { setError(e.message || 'Search failed.') } finally { setLoading(false) }
  }
  return <Frame title="Search" eyebrow="FIND DELIBERATELY"><form className="platform-search" onSubmit={search}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search posts, downtowns, or people…" /><select value={scope} onChange={e=>setScope(e.target.value)}><option value="posts">Posts</option><option value="communities">Downtowns</option><option value="users">People</option></select><button className="button primary">Search</button></form>{error && <ErrorBox>{error}</ErrorBox>}{loading ? <State>Searching…</State> : !query.trim() ? <Empty>Search the town by words you choose.</Empty> : !results.length ? <Empty>No results found.</Empty> : <div className="search-results">{results.map(item => scope === 'posts' ? <a className="search-result" href={`#/post/${item.id}`} key={item.id}><strong>{item.title}</strong><span>{item.community?.name || 'Downtown'} · {ago(item.created_at)}</span><p>{item.body || 'No body text.'}</p></a> : scope === 'communities' ? <a className="search-result" href={`#/community/${item.slug}`} key={item.id}><strong>{item.name}</strong><span>{item.category || 'Downtown'}</span><p>{item.description || 'No description.'}</p></a> : <a className="search-result" href={`#/profile/${item.id}`} key={item.id}><strong>{item.display_name || item.username}</strong><span>@{item.username}</span><p>{item.bio || 'Town member'}</p></a>)}</div>}</Frame>
}

export function SavedPostsPage({ currentUserId }) {
  const [items,setItems]=useState([]),[collections,setCollections]=useState([]),[selected,setSelected]=useState('all'),[newName,setNewName]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const load=async()=>{
    if(!currentUserId)return
    setLoading(true);setError('')
    const [{data:saves,error:se},{data:groups,error:ge}]=await Promise.all([
      supabase.from('saved_posts').select('post_id,created_at,collection_id').eq('user_id',currentUserId).order('created_at',{ascending:false}),
      supabase.from('saved_collections').select('id,name').eq('user_id',currentUserId).order('name')
    ])
    if(se||ge){setError((se||ge).message);setLoading(false);return}
    const ids=(saves||[]).map(x=>x.post_id)
    const {data:posts,error:pe}=ids.length?await supabase.from('posts').select('id,title,body,community_id,created_at,status').in('id',ids).neq('status','removed'):{data:[],error:null}
    if(pe)setError(pe.message)
    const map=new Map((posts||[]).map(p=>[p.id,p]))
    setItems((saves||[]).map(s=>({...s,post:map.get(s.post_id)})).filter(x=>x.post))
    setCollections(groups||[]);setLoading(false)
  }
  useEffect(()=>{load()},[currentUserId])
  const createCollection=async e=>{
    e.preventDefault();const name=newName.trim();if(!name)return
    const {error:e1}=await supabase.from('saved_collections').insert({user_id:currentUserId,name})
    if(e1){setError(e1.message);return}setNewName('');await load()
  }
  const assign=async(postId,collectionId)=>{
    const {error:e1}=await supabase.from('saved_posts').update({collection_id:collectionId||null}).eq('post_id',postId).eq('user_id',currentUserId)
    if(e1)setError(e1.message);else setItems(rows=>rows.map(row=>row.post_id===postId?{...row,collection_id:collectionId||null}:row))
  }
  const remove=async id=>{const {error:e1}=await supabase.from('saved_posts').delete().eq('post_id',id).eq('user_id',currentUserId);if(e1)setError(e1.message);else setItems(rows=>rows.filter(x=>x.post_id!==id))}
  const visible=items.filter(x=>selected==='all'||(selected==='uncategorised'?!x.collection_id:x.collection_id===selected))
  if(loading)return <Frame title="Saved posts"><State>Loading…</State></Frame>
  return <Frame title="Saved posts" actions={<a className="button primary" href="#/feed">Browse feed</a>}>
    {error&&<ErrorBox>{error}</ErrorBox>}
    <div className="saved-collection-tools"><form className="saved-collection-create" onSubmit={createCollection}><label htmlFor="saved-collection-name">New collection</label><input id="saved-collection-name" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Read later" maxLength={60} required/><button className="button secondary">Create collection</button></form>
      <div className="saved-collection-filters"><button className={selected==='all'?'active':''} onClick={()=>setSelected('all')}>All saved ({items.length})</button><button className={selected==='uncategorised'?'active':''} onClick={()=>setSelected('uncategorised')}>Uncategorised</button>{collections.map(group=><button className={selected===group.id?'active':''} key={group.id} onClick={()=>setSelected(group.id)}>{group.name}</button>)}</div>
    </div>
    {!visible.length?<Empty>{items.length?'No saved posts in this collection.':'You haven’t saved any posts yet. Save useful discussions from the feed to find them here.'}</Empty>:<div className="saved-post-list">{visible.map(({post,collection_id})=><article className="saved-post-card" key={post.id}><div><p className="eyebrow">SAVED · {ago(post.created_at)}</p><h2><a href={`#/post/${post.id}`}>{post.title}</a></h2><p>{post.body||'No body text.'}</p><label className="saved-collection-select">Collection<select value={collection_id||''} onChange={e=>assign(post.id,e.target.value)}><option value="">Uncategorised</option>{collections.map(group=><option value={group.id} key={group.id}>{group.name}</option>)}</select></label></div><button className="button secondary" onClick={()=>remove(post.id)}>Unsave</button></article>)}</div>}
  </Frame>
}

export function UserProfilePage({ userId, currentUserId }) {
  const [profile,setProfile]=useState(null)
  const [stats,setStats]=useState({posts:0,comments:0,reputation:0})
  const [reputationBreakdown,setReputationBreakdown]=useState([])
  const [recentReputation,setRecentReputation]=useState([])
  const [followState,setFollowState]=useState({following:false,followers:0,followingCount:0,busy:false})
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{
    let active=true
    ;(async()=>{
      setLoading(true);setError('')
      const [profileResult,postsResult,commentsResult,followResult,followerCount,followingCount,reputationResult,recentReputationResult]=await Promise.all([
        supabase.from('profiles').select('*').eq('id',userId).maybeSingle(),
        supabase.from('posts').select('id',{count:'exact',head:true}).eq('author_id',userId).neq('status','removed'),
        supabase.from('comments').select('id',{count:'exact',head:true}).eq('author_id',userId).neq('status','removed'),
        currentUserId && currentUserId !== userId ? supabase.from('user_follows').select('followed_id').eq('follower_id',currentUserId).eq('followed_id',userId).maybeSingle() : Promise.resolve({data:null}),
        supabase.from('user_follows').select('follower_id',{count:'exact',head:true}).eq('followed_id',userId),
        supabase.from('user_follows').select('followed_id',{count:'exact',head:true}).eq('follower_id',userId),
        supabase.rpc('get_public_reputation_breakdown',{target_user_id:userId}),
        supabase.from('reputation_events').select('id,event_type,points,post_id,comment_id,created_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(6)
      ])
      if(!active)return
      if(profileResult.error){setError(profileResult.error.message);setLoading(false);return}
      if(postsResult.error||commentsResult.error||reputationResult.error||recentReputationResult.error){setError((postsResult.error||commentsResult.error||reputationResult.error||recentReputationResult.error).message);setLoading(false);return}
      const p=profileResult.data
      setProfile(p)
      setStats({posts:postsResult.count??0,comments:commentsResult.count??0,reputation:p?.reputation_score??0})
      setReputationBreakdown(reputationResult.data||[])
      setRecentReputation(recentReputationResult.data||[])
      setFollowState({following:Boolean(followResult.data),followers:followerCount.count??0,followingCount:followingCount.count??0,busy:false})
      setLoading(false)
    })()
    return()=>{active=false}
  },[userId])
  const toggleFollow=async()=>{if(!currentUserId||currentUserId===userId||followState.busy)return;setFollowState(s=>({...s,busy:true}));const result=followState.following?await supabase.from('user_follows').delete().eq('follower_id',currentUserId).eq('followed_id',userId):await supabase.from('user_follows').insert({follower_id:currentUserId,followed_id:userId});if(result.error){setError(result.error.message);setFollowState(s=>({...s,busy:false}));return}setFollowState(s=>({...s,following:!s.following,followers:s.followers+(s.following?-1:1),busy:false}))}
  if(loading)return <Frame title="Member profile"><State>Loading…</State></Frame>
  if(error||!profile)return <Frame title="Member profile"><ErrorBox>{error||'Profile not found.'}</ErrorBox></Frame>
  const displayName=profile.display_name?.trim()||profile.username
  const interests=Array.isArray(profile.interests)?profile.interests:(typeof profile.interests==='string'?profile.interests.split(/[,;]+/).map(x=>x.trim()).filter(Boolean):[])
  const petNames={lion:'Lion',cat:'Cat',dog:'Dog',fox:'Fox',rabbit:'Rabbit',bear:'Bear',wolf:'Wolf',owl:'Owl',penguin:'Penguin',frog:'Frog',turtle:'Turtle',deer:'Deer',panda:'Panda',tiger:'Tiger',raccoon:'Raccoon',hedgehog:'Hedgehog',duck:'Duck',squirrel:'Squirrel'}
  const hasPet=Boolean(profile.pet_id&&profile.pet_id!=='none'&&petNames[profile.pet_id])
  return <Frame title="Member profile" eyebrow={`@${profile.username}`}>
    <div className="public-profile">
      <section className="public-profile-hero">
        <div className="public-profile-main">
          <div className="public-avatar"><img src={avatarUrl(profile.avatar_id)} alt="" /></div>
          <div className="public-profile-identity">
            <h2>{displayName}</h2>
            <p className="profile-joined">Member since {new Date(profile.created_at).toLocaleDateString()}</p>{currentUserId&&currentUserId!==userId&&<button className={`button ${followState.following?'secondary':'primary'}`} disabled={followState.busy} onClick={toggleFollow}>{followState.busy?'Working…':followState.following?'Following':'Follow'}</button>}
            {profile.bio&&<p className="public-profile-bio">{profile.bio}</p>}
          </div>
        </div>
        {hasPet&&<div className="public-profile-pet">
          <img src={`/pets/${profile.pet_id}.svg`} alt={petNames[profile.pet_id]} />
          <div><span>COMPANION</span><strong>{profile.pet_name?.trim()||petNames[profile.pet_id]}</strong><small>{petNames[profile.pet_id]}</small></div>
        </div>}
      </section>
      <div className="profile-stat-grid"><div><strong>{followState.followers.toLocaleString()}</strong><span>Followers</span></div><div><strong>{followState.followingCount.toLocaleString()}</strong><span>Following</span></div>
        <div><strong>{stats.posts.toLocaleString()}</strong><span>Posts published</span></div>
        <div><strong>{stats.comments.toLocaleString()}</strong><span>Comments made</span></div>
        <div><strong>{stats.reputation.toLocaleString()}</strong><span>Reputation points</span></div>
        <div><strong>{interests.length.toLocaleString()}</strong><span>Interests</span></div>
      </div>
      {interests.length>0&&<section className="public-profile-interests"><p className="eyebrow">INTERESTS</p><div className="profile-interest-list">{interests.map((x,i)=><span className="profile-interest-chip" key={`${x}-${i}`}>{x}</span>)}</div></section>}
      <section className="public-profile-contributions">
        <div className="town-section-heading"><div><p className="eyebrow">MEMBER CONTRIBUTIONS</p><h2>Reputation breakdown</h2></div><a className="button secondary" href={currentUserId===userId?'#/reputation':undefined} onClick={currentUserId===userId?undefined:e=>e.preventDefault()}>{currentUserId===userId?'View full ledger':''}</a></div>
        {reputationBreakdown.length ? <div className="profile-contribution-breakdown">{reputationBreakdown.map(item=><div className="profile-contribution-metric" key={item.event_type}><strong>{Number(item.points_total)>0?'+':''}{Number(item.points_total).toLocaleString()}</strong><span>{reputationEventLabel(item.event_type)}</span><small>{Number(item.event_count).toLocaleString()} events</small></div>)}</div> : <div className="town-empty">No recorded reputation events yet.</div>}
        <div className="profile-recent-contributions"><p className="eyebrow">RECENT CONTRIBUTIONS</p>{recentReputation.length ? recentReputation.map(event=><div className="profile-contribution-event" key={event.id}><div><strong>{reputationEventLabel(event.event_type)}</strong><span>{ago(event.created_at)}</span></div><b className={event.points>=0?'points positive':'points negative'}>{event.points>0?'+':''}{event.points}</b></div>) : <p className="town-empty">New contributions will appear here.</p>}</div>
      </section>
    </div>
  </Frame>
}

export function CommunityManagePage({ communityId, currentUserId }) {
  const [community,setCommunity]=useState(null),[members,setMembers]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[allowed,setAllowed]=useState(false)
  const load=async()=>{setLoading(true); const {data:c,error:ce}=await supabase.from('communities').select('id,name,slug,description,creator_id').eq('id',communityId).maybeSingle(); if(ce) {setError(ce.message);setLoading(false);return} setCommunity(c); const {data:m,error:me}=await supabase.from('community_memberships').select('community_id,user_id,role,joined_at').eq('community_id',communityId).order('joined_at',{ascending:true}); if(me){setError(me.message);setLoading(false);return} const ids=(m||[]).map(x=>x.user_id); const {data:p}=ids.length?await supabase.from('profiles').select('id,username,display_name').in('id',ids):{data:[]}; const pm=new Map((p||[]).map(x=>[x.id,x])); const rows=(m||[]).map(x=>({...x,profile:pm.get(x.user_id)})); setMembers(rows); setAllowed(c?.creator_id===currentUserId || rows.some(x=>x.user_id===currentUserId&&x.role==='owner'));setLoading(false)}
  useEffect(()=>{load()},[communityId,currentUserId])
  const changeRole=async(userId,role)=>{const {error:e}=await supabase.from('community_memberships').update({role}).eq('community_id',communityId).eq('user_id',userId);if(e)alert(e.message);else load()}
  if(loading)return <Frame title="Downtown management"><State>Loading…</State></Frame>
  if(error)return <Frame title="Downtown management"><ErrorBox>{error}</ErrorBox></Frame>
  if(!community||!allowed)return <Frame title="Downtown management"><ErrorBox>You do not have permission to manage this downtown.</ErrorBox></Frame>
  return <Frame title={community.name} eyebrow="DOWNTOWN MANAGEMENT" actions={<a className="button secondary" href={`#/community/${community.slug}`}>Back to downtown</a>}><div className="manage-layout"><div className="town-side-card"><p className="eyebrow">DOWNTOWN</p><h2>{community.name}</h2><p>{community.description||'No description.'}</p><a className="button primary" href={`#/create-post/${community.slug}`}>Create a post</a></div><div><div className="town-section-heading"><div><p className="eyebrow">MEMBERS</p><h2>{members.length} members</h2></div></div><div className="member-management">{members.map(m=><div className="member-row" key={m.user_id}><div><strong>{m.profile?.display_name||m.profile?.username||'Member'}</strong><span>@{m.profile?.username||'unknown'} · joined {new Date(m.joined_at).toLocaleDateString()}</span></div><select value={m.role} onChange={e=>changeRole(m.user_id,e.target.value)}><option value="member">Member</option><option value="moderator">Moderator</option><option value="owner">Owner</option></select></div>)}</div></div></div></Frame>
}
