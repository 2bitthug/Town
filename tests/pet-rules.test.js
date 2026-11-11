import test from 'node:test'
import assert from 'node:assert/strict'
import { isPetId, getMembershipProgress, hasPetUnlock, uniqueSouvenirs } from '../src/components/pet/petRules.js'

test('pet selection accepts supported pets and the no-pet option only',()=>{
  assert.equal(isPetId('cat'),true)
  assert.equal(isPetId('none'),true)
  assert.equal(isPetId('dragon'),false)
})
test('membership milestones are elapsed-time based and never decay',()=>{
  const now=Date.parse('2026-11-11T00:00:00Z')
  const progress=getMembershipProgress('2026-11-01T00:00:00Z',now)
  assert.deepEqual(progress.map(x=>x.done),[true,false,false])
  assert.equal(getMembershipProgress('2026-11-01T00:00:00Z',now-86400000)[0].done,true)
})
test('unlock inventory is read from persisted unlock records',()=>{
  assert.equal(hasPetUnlock([{reward_key:'mint-coat'}],'mint-coat'),true)
  assert.equal(hasPetUnlock([{reward_key:'mint-coat'}],'stargazer-outfit'),false)
})
test('souvenir rendering removes duplicate community keepsakes',()=>{
  const items=[{community_id:'a',souvenir_key:'community-member'},{community_id:'a',souvenir_key:'community-member'},{community_id:'b',souvenir_key:'community-member'}]
  assert.equal(uniqueSouvenirs(items).length,2)
})
