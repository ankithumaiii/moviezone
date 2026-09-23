import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProviderManager } from '../../services/ProviderManager';
import type { MediaItem } from '../../models/media';
import { SearchBar } from '../../components/search/SearchBar';
import { MediaCard } from '../../components/media/MediaCard';
import { ArrowLeft, Search as SearchIcon, AlertCircle } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const providerParam = searchParams.get('provider') || undefined;
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if queryParam changes
  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(async () => {
      // Update URL query param quietly
      if (trimmed !== queryParam) {
        const nextParams: Record<string, string> = {};
        if (trimmed) nextParams.q = trimmed;
        if (providerParam) nextParams.provider = providerParam;
        setSearchParams(nextParams, { replace: true });
      }

      setIsLoading(true);
      setError(null);

      try {
        const providerManager = ProviderManager.getInstance();
        const items = await providerManager.search(trimmed, providerParam);
        setResults(items);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Search failed';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, providerParam]);

  const filteredResults = results.filter((item) => {
    if (selectedType === 'ALL') return true;
    if (selectedType === 'MOVIES') return item.type === 'open_movie';
    if (selectedType === 'TRAILERS') return item.type === 'trailer';
    if (selectedType === 'SHORTS') return item.type === 'clip';
    return true;
  });

  return (
    <div className="page-container" style={{ maxWidth: '1080px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          marginBottom: 'var(--space-md)',
        }}
      >
        <button
          type="button"
          className="btn-icon"
          onClick={() => navigate('/')}
          aria-label="Back to Home"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Search Media</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Search authorized movies, trailers, and public video sources
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Type a title, genre, or keyword..."
        autoFocus
      />

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          marginBottom: 'var(--space-lg)',
          paddingBottom: '2px',
        }}
      >
        {[
          { id: 'ALL', label: 'All Content' },
          { id: 'MOVIES', label: 'Movies' },
          { id: 'TRAILERS', label: 'Trailers' },
          { id: 'SHORTS', label: 'Shorts & Demos' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn ${selectedType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: '30px', padding: '0 12px', fontSize: '0.75rem' }}
            onClick={() => setSelectedType(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results View */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-3xl) 0',
            gap: '12px',
          }}
        >
          <div className="spinner" style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching providers...</span>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={24} color="var(--status-danger)" />
          </div>
          <h4 className="empty-state-title">Search Error</h4>
          <p className="empty-state-text">{error}</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <SearchIcon size={24} />
          </div>
          <h4 className="empty-state-title">No matches found</h4>
          <p className="empty-state-text">
            {query.trim()
              ? `No media items found matching "${query.trim()}". Try another title or genre.`
              : 'Type keywords above to discover videos.'}
          </p>
        </div>
      ) : (
        <div className="media-grid">
          {filteredResults.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </div>
  );
};
