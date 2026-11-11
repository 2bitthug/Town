export const PET_IDS = ['none','lion','cat','dog','fox','rabbit','bear','wolf','owl','penguin','frog','turtle','deer','panda','tiger','raccoon','hedgehog','duck','squirrel']
export function isPetId(value) { return PET_IDS.includes(value) }
export function getMembershipProgress(createdAt, now = Date.now()) {
  if (!createdAt) return [7,30,90].map(days=>({days,done:false,progress:0}))
  const elapsed = Math.max(0,Math.floor((now-new Date(createdAt).getTime())/86400000))
  return [7,30,90].map(days=>({days,done:elapsed>=days,progress:Math.min(100,Math.floor(elapsed/days*100))}))
}
export function hasPetUnlock(unlocks, key) {
  return Array.isArray(unlocks) && unlocks.some(item=>item.reward_key===key)
}
export function uniqueSouvenirs(items) {
  const seen=new Set()
  return (Array.isArray(items)?items:[]).filter(item=>{
    const key=`${item.community_id}:${item.souvenir_key}`
    if(seen.has(key)) return false
    seen.add(key); return true
  })
}
