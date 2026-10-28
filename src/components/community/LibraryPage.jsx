import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PageFrame } from './CommunityPages';

export default function LibraryPage({ communitySlug, currentUserId }) {
  const [communityId, setCommunityId] = useState(null);
  const [resources, setResources] = useState([]);
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
        setCommunityId(community.id);
        const { data, error: resError } = await supabase
          .from('library_resources')
          .select('*')
          .eq('community_id', community.id);
        if (resError) throw resError;
        setResources(data || []);
      } catch (e) {
        setError(e.message || 'Failed to load library resources');
      } finally {
        setLoading(false);
      }
    }
    if (communitySlug) load();
  }, [communitySlug]);

  return (
    <PageFrame
      eyebrow="Library"
      title={`Resources for ${communitySlug}`}
      actions={
        currentUserId && (
          <a className="button secondary" href={`#/library/${communitySlug}/add`}>Add Resource</a>
        )
      }
    >
      {loading && <div className="town-state">Loading…</div>}
      {error && <div className="town-error">{error}</div>}
      {!loading && !error && (
        <div className="resource-list">
          {resources.length === 0 ? (
            <div className="town-empty">No resources found.</div>
          ) : (
            resources.map(r => (
              <div key={r.id} className="resource-card" style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
                <h3>{r.title}</h3>
                {r.thumbnail_url && <img src={r.thumbnail_url} alt={r.title} style={{ maxWidth: '100%', height: 'auto' }} />}
                <p>{r.description}</p>
                <p><strong>Category:</strong> {r.category}</p>
                <a href={r.source_url} target="_blank" rel="noopener noreferrer">Source</a>
              </div>
            ))
          )}
        </div>
      )}
    </PageFrame>
  );
}
