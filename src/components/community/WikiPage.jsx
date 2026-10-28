import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PageFrame } from './CommunityPages';

export default function WikiPage({ communitySlug, currentUserId }) {
  const [pages, setPages] = useState([]);
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
        const { data, error: wikiError } = await supabase
          .from('wiki_pages')
          .select('*')
          .eq('community_id', community.id);
        if (wikiError) throw wikiError;
        setPages(data || []);
      } catch (e) {
        setError(e.message || 'Failed to load wiki pages');
      } finally {
        setLoading(false);
      }
    }
    if (communitySlug) load();
  }, [communitySlug]);

  return (
    <PageFrame eyebrow="Wiki" title={`Wiki for ${communitySlug}`} actions={null}>
      {loading && <div className="town-state">Loading…</div>}
      {error && <div className="town-error">{error}</div>}
      {!loading && !error && (
        <div className="wiki-list">
          {pages.length === 0 ? (
            <div className="town-empty">No wiki pages found.</div>
          ) : (
            pages.map(p => (
              <div key={p.id} className="wiki-card" style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
                <h3>{p.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: p.content }} />
                {p.category && <p><strong>Category:</strong> {p.category}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </PageFrame>
  );
}
