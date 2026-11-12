-- Public member history replaces the former owner-only SELECT policy.
drop policy if exists "Users can view reputation events" on public.reputation_events;
