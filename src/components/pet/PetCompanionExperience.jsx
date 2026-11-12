import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './PetCompanionExperience.css'
import PetSprite from './PetSprite'
import { getMembershipProgress, hasPetUnlock, isPetId, uniqueSouvenirs } from './petRules'

const PETS = [
  ['cat','Cat'],['dog','Dog'],['fox','Fox'],['rabbit','Rabbit'],['bear','Bear'],
  ['wolf','Wolf'],['owl','Owl'],['penguin','Penguin'],['frog','Frog'],['turtle','Turtle'],
  ['deer','Deer'],['panda','Panda'],['tiger','Tiger'],['raccoon','Raccoon'],['hedgehog','Hedgehog'],
  ['duck','Duck'],['squirrel','Squirrel'],['lion','Lion']
]
const CATALOG = [
  {key:'mint-coat',type:'color',label:'Mint coat',detail:'A fresh mint colour',source:'7 days as a Town member',color:'#9ed9bd'},
  {key:'sunset-coat',type:'color',label:'Sunset coat',detail:'Warm sunset tones',source:'5 positive community recognitions',color:'#df9a78'},
  {key:'reading-nook',type:'decoration',label:'Cloud-soft pet bed',detail:'A proper resting spot for your companion',source:'30 days as a Town member',emoji:'🛏️'},
  {key:'stargazer-outfit',type:'outfit',label:'Stargazer outfit',detail:'A little outfit for big ideas',source:'90 days as a Town member',emoji:'✨'},
  {key:'helpful-sparkle',type:'badge',label:'Community appreciation badge',detail:'A permanent badge recognising the positive feedback you have earned',source:'3 positive community recognitions',emoji:'♥'},
  {key:'friendly-trick',type:'trick',label:'Victory hop',detail:'A special celebratory move for your companion',source:'10 positive community recognitions',emoji:'★'},
  {key:'welcome-wave',type:'trick',label:'Hello wave',detail:'Your pet’s first trick',source:'Welcome gift',emoji:'👋'},
  {key:'toy-ball',type:'toy',label:'Play ball',detail:'A bright ball your pet can chase around its room',source:'Welcome gift',emoji:'⚽'}
]
const safeArray = value => Array.isArray(value) ? value : []

export function PetCompanionExperience({ currentUserId }) {
  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [profile,setProfile] = useState({pet_id:'none',pet_name:'Pixel',created_at:null})
  const [companion,setCompanion] = useState({color_id:'default',outfit_id:'none',home_items:[],active_emote:'wave'})
  const [unlocks,setUnlocks] = useState([])
  const [souvenirs,setSouvenirs] = useState([])
  const [communities,setCommunities] = useState([])
  const [joinedCommunityIds,setJoinedCommunityIds] = useState([])
  const [posts,setPosts] = useState([])
  const [activeTab,setActiveTab] = useState('home')
  const [playKey,setPlayKey] = useState(0)
  const [refreshKey,setRefreshKey] = useState(0)

  const load = useCallback(async () => {
    if (!currentUserId) return
    setLoading(true); setError(''); setNotice('')
    try {
      const {error:rewardError}=await supabase.rpc('refresh_pet_rewards')
      if (rewardError) throw rewardError
      const {error:souvenirError}=await supabase.rpc('sync_pet_community_souvenirs')
      if (souvenirError) throw souvenirError
      const [p,c,u,s,m] = await Promise.all([
        supabase.from('profiles').select('pet_id,pet_name,created_at,interests').eq('id',currentUserId).single(),
        supabase.from('pet_companions').select('*').eq('user_id',currentUserId).maybeSingle(),
        supabase.from('pet_unlocks').select('reward_key,reward_type,source,unlocked_at').eq('user_id',currentUserId),
        supabase.from('pet_souvenirs').select('id,community_id,souvenir_key,collected_at,communities(name,slug)').eq('user_id',currentUserId).order('collected_at',{ascending:false}),
        supabase.from('community_memberships').select('community_id,communities(id,name,slug,description,category)').eq('user_id',currentUserId).limit(6)
      ])
      if (p.error) throw p.error
      if (c.error && !/does not exist|schema cache/i.test(c.error.message || '')) throw c.error
      if (u.error) throw u.error
      if (s.error) throw s.error
      if (m.error) throw m.error
      setProfile(p.data || {pet_id:'none',pet_name:'Pixel'})
      if (c.data) setCompanion({...c.data,home_items:safeArray(c.data.home_items)})
      setUnlocks(u.data || [])
      setSouvenirs(s.data || [])
      const joined = (m.data || []).map(x=>x.communities).filter(Boolean)
      setJoinedCommunityIds((m.data || []).map(x=>x.community_id))
      if (joined.length) setCommunities(joined)
      else {
        const {data,error:communityError}=await supabase.from('communities').select('id,name,slug,description,category').eq('status','active').eq('visibility','public').limit(6)
        if (communityError) throw communityError
        setCommunities(data || [])
      }
      const {data:postData,error:postError}=await supabase.from('posts').select('id,title,body,community_id,created_at,communities(name,slug)').eq('status','published').order('created_at',{ascending:false}).limit(8)
      if (postError) throw postError
      setPosts(postData || [])
    } catch (e) { setError(e.message || 'Could not load your companion.') }
    finally { setLoading(false) }
  },[currentUserId,refreshKey])

  useEffect(()=>{load()},[load])

  const owned = useMemo(()=>new Set(unlocks.map(x=>x.reward_key)),[unlocks])
  const membershipProgress = getMembershipProgress(profile.created_at)
  const days = profile.created_at ? Math.max(0,Math.floor((Date.now()-new Date(profile.created_at).getTime())/86400000)) : 0
  const positive = unlocks.filter(x=>x.source?.includes('recognition')).length
  const selectedPet = PETS.find(x=>x[0]===profile.pet_id)
  const safePetId = isPetId(profile.pet_id) ? profile.pet_id : 'none'
  const visibleSouvenirs = uniqueSouvenirs(souvenirs)
  const collectedCommunityIds = useMemo(()=>new Set(visibleSouvenirs.map(x=>x.community_id)),[visibleSouvenirs])
  const progress = membershipProgress.map(x=>({label:`${x.days}-day member`,done:x.done,detail:`${Math.min(days,x.days)}/${x.days} days`}))

  const savePet = async (patch={}) => {
    setSaving(true);setError('');setNotice('')
    try {
      const nextProfile={...profile,...patch,pet_name:String(patch.pet_name ?? profile.pet_name ?? '').trim().slice(0,20) || 'Pixel'}
      const {error:pError}=await supabase.from('profiles').update({pet_id:nextProfile.pet_id,pet_name:(nextProfile.pet_name||'Pixel').trim().slice(0,20)||'Pixel'}).eq('id',currentUserId)
      if(pError) throw pError
      setProfile(nextProfile)
      const {error:cError}=await supabase.from('pet_companions').upsert({user_id:currentUserId,selected_pet:nextProfile.pet_id,pet_name:nextProfile.pet_name||'Pixel',...companion,updated_at:new Date().toISOString()},{onConflict:'user_id'})
      if(cError) throw cError
      setNotice('Companion saved.')
      window.dispatchEvent(new CustomEvent('town-profile-saved',{detail:{pet_id:nextProfile.pet_id}}))
    } catch(e){setError(e.message || 'Could not save your companion.')}
    finally{setSaving(false)}
  }
  const saveCompanion = async patch => {
    setSaving(true);setError('');setNotice('')
    const next={...companion,...patch}
    try{
      const {error:e}=await supabase.from('pet_companions').upsert({user_id:currentUserId,selected_pet:profile.pet_id,pet_name:profile.pet_name||'Pixel',...next,updated_at:new Date().toISOString()},{onConflict:'user_id'})
      if(e) throw e
      setCompanion(next);setNotice('Home updated.')
    }catch(e){setError(e.message || 'Could not update the pet home.')}
    finally{setSaving(false)}
  }
  const refreshRewards = async () => {
    setSaving(true);setError('');setNotice('')
    try{
      const {data,error:e}=await supabase.rpc('refresh_pet_rewards')
      if(e) throw e
      await supabase.rpc('sync_pet_community_souvenirs')
      setNotice(data?.new_unlocks ? `${data.new_unlocks} new reward(s) unlocked.` : 'Progress checked. Keep exploring at your own pace.')
      setRefreshKey(x=>x+1)
    }catch(e){setError(e.message || 'Could not check your progress.')}
    finally{setSaving(false)}
  }
  const collectFromCommunity = async id => {
    setSaving(true);setError('');setNotice('')
    try{
      const {data,error:e}=await supabase.rpc('record_pet_community_visit',{p_community_id:id})
      if(e) throw e
      setNotice(data?.collected ? 'A new community souvenir was added to your collection.' : 'You already have this community souvenir.')
      setRefreshKey(x=>x+1)
    }catch(e){setError(e.message || 'Could not collect this souvenir.')}
    finally{setSaving(false)}
  }
  const addDecoration = key => saveCompanion({home_items:[...new Set([...safeArray(companion.home_items),key])]})
  const removeDecoration = key => saveCompanion({home_items:safeArray(companion.home_items).filter(x=>x!==key)})
  const playWithPet = () => setPlayKey(x=>x+1)

  if(loading) return <section className="pet-experience"><p className="eyebrow">COMPANION</p><h1>Your pet’s corner</h1><p role="status">Loading your companion…</p></section>
  if(error && !profile) return <section className="pet-experience"><h1>Your pet’s corner</h1><p className="pet-error" role="alert">{error}</p><button className="button secondary" onClick={load}>Try again</button></section>

  return <section className="pet-experience">
    <header className="pet-exp-header"><div><p className="eyebrow">OPTIONAL COMPANION · NO STREAKS</p><h1>Your pet’s corner</h1><p>Explore Town together. Your companion keeps every reward you earn, even when you take a break.</p></div><button className="button secondary" onClick={refreshRewards} disabled={saving}>Check progress</button></header>
    {error && <p className="pet-error" role="alert">{error}</p>}
    {notice && <p className="pet-notice" role="status">{notice}</p>}
    <div className="pet-exp-tabs" role="tablist" aria-label="Pet sections">
      {['home','customize','souvenirs','discover'].map(t=><button key={t} role="tab" aria-selected={activeTab===t} className={activeTab===t?'active':''} onClick={()=>setActiveTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}
    </div>
    {activeTab==='home' && <div className="pet-exp-grid">
      <article className="pet-room">
        <div className="pet-room-sky" aria-label="Your pet’s decorated home">
          <div className="pet-room-sign">PET HOME</div>
          {safeArray(companion.home_items).map(k=><div className={`pet-room-decoration pet-decor-${k}`} key={k} aria-label={CATALOG.find(x=>x.key===k)?.label || 'Decoration'}><span>{CATALOG.find(x=>x.key===k)?.emoji || '✦'}</span></div>)}
          {profile.pet_id!=='none' ? <div key={playKey} className={`pet-room-character ${playKey ? "pet-playing" : ""}`} style={{filter:companion.color_id==='mint-coat'?'hue-rotate(55deg)':companion.color_id==='sunset-coat'?'hue-rotate(315deg)':'none'}}><PetSprite id={profile.pet_id} className="pet-sprite-art" title={selectedPet?.[1] || 'Your pet'}/></div> : <div className="pet-room-empty">Choose a pet to move in.</div>}
          <div className="pet-room-floor"/>
        </div>
        <div className="pet-room-caption"><div><strong>{profile.pet_name || 'Pixel'} {companion.outfit_id==='stargazer-outfit'?'✦':''}</strong><span>{selectedPet?.[1] || 'No pet selected'} · always happy to see you</span></div><button className="button secondary" onClick={()=>setActiveTab('customize')}>Decorate home</button></div>
        <div className="pet-emotes"><span>Give {profile.pet_name || "your pet"} something to do</span><button onClick={playWithPet} disabled={profile.pet_id==='none'}>▶ Make {profile.pet_name || "your pet"} jump across</button></div>
      </article>
      <article className="pet-progress-card"><p className="eyebrow">YOUR JOURNEY</p><h2>Progress that stays</h2><p>Membership milestones are based on time since joining—not daily visits.</p>{progress.map(x=><div className="pet-milestone" key={x.label}><span>{x.done?'✓':'○'} {x.label}</span><small>{x.detail}</small></div>)}<div className="pet-milestone"><span>Helpful community recognition</span><small>{unlocks.some(x=>x.reward_key==='helpful-sparkle')?'Reward unlocked':'Earned through positive feedback'}</small></div><a className="button secondary" href="#/reputation">View reputation</a></article>
    </div>}
    {activeTab==='customize' && <div className="pet-customize-grid">
      <article className="pet-panel"><h2>Choose your companion</h2><p>Change your pet whenever you like. No pet is required.</p><div className="pet-choice-grid">{[['none','No pet'],...PETS].map(([id,label])=><button key={id} className={profile.pet_id===id?'selected':''} aria-pressed={profile.pet_id===id} onClick={()=>savePet({pet_id:id})} disabled={saving}>{id==='none'?'×':<PetSprite id={id} className="pet-sprite-thumb" title={label}/>}<small>{label}</small></button>)}</div><label className="pet-name-field">Pet name<input value={profile.pet_name ?? ''} placeholder="Give your pet a name" maxLength={20} onChange={e=>setProfile(x=>({...x,pet_name:e.target.value}))}/></label><button className="button primary" disabled={saving} onClick={()=>savePet()}>{saving?'Saving…':'Save name and pet'}</button></article>
      <article className="pet-panel"><h2>Unlockables</h2><p>Earn cosmetics through membership and constructive recognition. Locked rewards show their requirements.</p><div className="pet-catalog">{CATALOG.map(item=>{const got=hasPetUnlock(unlocks,item.key);return <div className={got?'unlocked':'locked'} key={item.key}><span className={`pet-catalog-icon pet-icon-${item.type}`} style={{'--item-color':item.color||'var(--accent)'}}>{item.emoji||'◈'}</span><div><strong>{item.label}</strong><small>{got?'Unlocked':item.source}</small><p>{item.detail}</p></div>{got?<div className="pet-catalog-actions"><span className="pet-owned">Owned</span>{item.type==='color'&&<button className="button secondary" disabled={saving} onClick={()=>saveCompanion({color_id:item.key})}>{companion.color_id===item.key?'Equipped':'Equip'}</button>}{item.type==='outfit'&&<button className="button secondary" disabled={saving} onClick={()=>saveCompanion({outfit_id:item.key})}>{companion.outfit_id===item.key?'Equipped':'Equip'}</button>}</div>:<span className="pet-lock">Locked</span>}</div>})}</div></article>
      <article className="pet-panel"><h2>Home decorations</h2><p>Place unlocked items in your pet’s room.</p>{CATALOG.filter(x=>x.type==='decoration'||x.type==='toy').map(item=>{const got=hasPetUnlock(unlocks,item.key),placed=safeArray(companion.home_items).includes(item.key);return <div className="pet-home-item" key={item.key}><span>{item.emoji}</span><div><strong>{item.label}</strong><small>{got?'Available to place':item.source}</small></div><button className="button secondary" disabled={!got||saving} onClick={()=>placed?removeDecoration(item.key):addDecoration(item.key)}>{placed?'Remove':'Place'}</button></div>})}</article>
    </div>}
    {activeTab==='souvenirs' && <article className="pet-panel"><h2>Souvenir shelf</h2><p>Keep a memento of the downtowns you join. Each item shows where it came from.</p>{visibleSouvenirs.length ? <div className="pet-souvenir-grid">{visibleSouvenirs.map(s=><article className="pet-collectible-card" key={s.id}><div className="pet-collectible-art"><span className="pet-collectible-stamp">TOWN<br/>MEMBER</span><span className="pet-collectible-mark">✦</span><small>COMMUNITY SERIES · 01</small></div><div className="pet-collectible-info"><span className="pet-collectible-kicker">DOWNTOWN COLLECTIBLE</span><strong>{s.communities?.name || 'Town community'}</strong><p>A keepsake marking your membership in this downtown. This collectible is permanently yours.</p><div className="pet-collectible-meta"><span>COLLECTED</span><b>{new Date(s.collected_at).toLocaleDateString()}</b></div><a href={s.communities?.slug? `#/community/${s.communities.slug}`:'#/communities'}>Visit downtown ↗</a></div></article>)}</div>:<div className="pet-empty">No souvenirs yet. Explore a downtown below and collect your first keepsake.</div>}</article>}
    {activeTab==='discover' && <div className="pet-discovery-grid"><article className="pet-panel"><h2>Downtowns to explore</h2>{communities.length?communities.map(c=><div className="pet-discovery-item" key={c.id}><div><strong>{c.name}</strong><small>{c.category || 'Community'} · {c.description || 'A place to meet and exchange ideas.'}</small></div><div className="pet-inline-actions"><a className="button secondary" href={`#/community/${c.slug}`}>Explore</a>{collectedCommunityIds.has(c.id)?<span className="pet-collected-state" aria-label="Souvenir collected">✓ Souvenir collected</span>:joinedCommunityIds.includes(c.id)?<button className="button secondary" disabled={saving} onClick={()=>collectFromCommunity(c.id)}>Collect souvenir</button>:<a className="button secondary" href={`#/community/${c.slug}`}>Join downtown</a>}</div></div>):<p>No public downtowns are available yet.</p>}</article><article className="pet-panel"><h2>Conversations worth a look</h2>{posts.length?posts.map(p=><div className="pet-discovery-item" key={p.id}><div><strong>{p.title}</strong><small>{p.communities?.name || 'Town discussion'} · {(p.body||'').slice(0,120)}</small></div><a className="button secondary" href={`#/post/${p.id}`}>Read</a></div>):<p>No published discussions to recommend yet.</p>}</article></div>}
    <p className="pet-footnote">Town companion is optional. No streaks, decay, illness or inactivity penalties. Rewards are permanent once earned.</p>
  </section>
}
