import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PageFrame } from './CommunityPages';

export default function UpdatesPage({ communitySlug, currentUserId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data: community, error: commError } = await supabase
          .from('communities')
          .select('id')
          .eq('slug', communitySlug)
          .single();
        if (commError) throw commError;
        const { data, error: updError } = await supabase
          .from('community_updates')
          .select('*')
          .eq('community_id', community.id)
          .order('published_at', { ascending: false });
        if (updError) throw updError;
        setUpdates(data || []);
      } catch (e) {
        setError(e.message || 'Failed to load updates');
      } finally {
        setLoading(false);
      }
    }
    if (communitySlug) load();
  }, [communitySlug]);

  return (
    <PageFrame eyebrow="Updates" title={`Updates for ${communitySlug}`} actions={null}>
      {loading && <div className="town-state">Loading…</div>}
      {error && <div className="town-error">{error}</div>}
      {!loading && !error && (
        <div className="updates-list">
          {updates.length === 0 ? (
            <div className="town-empty">No updates posted.</div>
          ) : (
            updates.map(u => (
              <div key={u.id} className="update-card" style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
                <h3>{u.title}</h3>
                {u.image_url && <img src={u.image_url} alt={u.title} style={{ maxWidth: '100%', height: 'auto' }} />}
                {u.summary && <p>{u.summary}</p>}
                {u.source_url && <a href={u.source_url} target="_blank" rel="noopener noreferrer">Read more</a>}
                <p><small>{new Date(u.published_at).toLocaleDateString()}</small></p>
              </div>
            ))
          )}
        </div>
      )}
    </PageFrame>
  );
}
