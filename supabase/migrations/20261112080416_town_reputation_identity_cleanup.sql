-- Remove the redundant reputation_events index; idx_reputation_user already covers this access path.
drop index if exists public.reputation_events_user_created_idx;

-- These are trigger entry points, not client-callable RPCs.
revoke all on function public.reputation_on_comment() from public, anon, authenticated;
revoke all on function public.reputation_on_comment_vote() from public, anon, authenticated;
revoke all on function public.reputation_on_post() from public, anon, authenticated;
revoke all on function public.reputation_on_post_vote() from public, anon, authenticated;
