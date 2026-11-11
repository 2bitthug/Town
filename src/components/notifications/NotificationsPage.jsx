import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function NotificationsPage({ currentUserId }) {
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [filter,setFilter]=useState('all')
  const load=async()=>{
    if(!currentUserId)return
    setLoading(true);setError('')
    const {data,error:fetchError}=await supabase.from('town_notifications')
      .select('id,kind,title,body,href,read_at,created_at,actor_id')
      .eq('user_id',currentUserId).order('created_at',{ascending:false}).limit(100)
    if(fetchError)setError(fetchError.message)
    setItems(data||[]);setLoading(false)
  }
  useEffect(()=>{load()},[currentUserId])
  const markRead=async item=>{
    const {error:writeError}=await supabase.from('town_notifications').update({read_at:new Date().toISOString()}).eq('id',item.id).eq('user_id',currentUserId)
    if(writeError){setError(writeError.message);return}
    setItems(rows=>rows.map(row=>row.id===item.id?{...row,read_at:new Date().toISOString()}:row))
  }
  const markAll=async()=>{
    const ids=items.filter(x=>!x.read_at).map(x=>x.id)
    if(!ids.length)return
    const {error:writeError}=await supabase.from('town_notifications').update({read_at:new Date().toISOString()}).in('id',ids).eq('user_id',currentUserId)
    if(writeError){setError(writeError.message);return}
    await load()
  }
  const visible=items.filter(x=>filter==='all'||(filter==='unread'?!x.read_at:Boolean(x.read_at)))
  return <section className="town-page">
    <div className="town-page-heading"><div><p className="eyebrow">YOUR TOWN</p><h1>Notifications</h1><p className="feature-text">Replies, accepted answers and activity on your contributions.</p></div>
      <div className="town-page-actions"><button className="button secondary" onClick={markAll} disabled={!items.some(x=>!x.read_at)}>Mark all read</button></div>
    </div>
    <div className="notification-toolbar"><div className="segmented-control" role="group" aria-label="Filter notifications"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button><button className={filter==='unread'?'active':''} onClick={()=>setFilter('unread')}>Unread</button><button className={filter==='read'?'active':''} onClick={()=>setFilter('read')}>Read</button></div><span className="meta">{items.filter(x=>!x.read_at).length} unread</span></div>
    {error&&<div className="town-error" role="alert">{error}<button className="button secondary" onClick={load}>Retry</button></div>}
    {loading?<div className="town-state" role="status">Loading notifications…</div>:!visible.length?<div className="town-empty"><strong>You’re all caught up.</strong><p>Replies to your posts and accepted answers will appear here.</p><a className="button secondary" href="#/feed">Browse the feed</a></div>:<div className="notification-list">{visible.map(item=><article className={`notification-item ${item.read_at?'is-read':'is-unread'}`} key={item.id}>
      <div className="notification-copy"><span className="eyebrow">{item.kind.replaceAll('_',' ').toUpperCase()} · {new Date(item.created_at).toLocaleString()}</span><strong>{item.title}</strong>{item.body&&<p>{item.body}</p>}</div>
      <div className="notification-actions">{!item.read_at&&<button className="button secondary" onClick={()=>markRead(item)}>Mark read</button>}<a className="button primary" href={item.href||'#/feed'} onClick={()=>{if(!item.read_at)markRead(item)}}>Open</a></div>
    </article>)}</div>}
  </section>
}
