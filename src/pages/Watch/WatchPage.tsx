import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ProviderManager } from '../../services/ProviderManager';
import type { MediaItem, VideoSource } from '../../models/media';
import { VideoPlayer } from '../../components/player/VideoPlayer';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const providerParam = searchParams.get('provider') || undefined;
  const navigate = useNavigate();

  const [media, setMedia] = useState<MediaItem | undefined>(undefined);
  const [source, setSource] = useState<VideoSource | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedia = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const providerManager = ProviderManager.getInstance();

    try {
      const item = await providerManager.getDetails(id, providerParam);
      if (!item) {
        setError('Media details could not be found.');
        setIsLoading(false);
        return;
      }
      setMedia(item);

      const sources = await providerManager.getVideoSources(id, providerParam);
      if (sources.length === 0) {
        setError('No playable video source available for this item.');
        setIsLoading(false);
        return;
      }

      setSource(sources[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load video source';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [id, providerParam]);

  return (
    <div className="page-container" style={{ maxWidth: '1040px', paddingBottom: 'var(--space-2xl)' }}>
      {/* Top Header Bar */}
      <div className="player-header-bar">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigate(media ? `/media/${media.id}` : '/')}
          aria-label="Back to details"
          style={{ paddingLeft: 'var(--space-2xs)' }}
        >
          <ArrowLeft size={18} />
          <span>Back to Details</span>
        </button>

        {media && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Playing: <strong style={{ color: 'var(--text-primary)' }}>{media.title}</strong>
          </span>
        )}
      </div>

      {isLoading ? (
        <div
          style={{
            width: '100%',
            paddingBottom: '56.25%',
            position: 'relative',
            backgroundColor: '#000',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div className="spinner" style={{ width: 28, height: 28 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Preparing video stream...
            </span>
          </div>
        </div>
      ) : error || !media || !source ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={28} color="var(--status-danger)" />
          </div>
          <h3 className="empty-state-title">Playback Unavailable</h3>
          <p className="empty-state-text">
            {error || 'Unable to resolve video source.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadMedia}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            Retry
          </button>
        </div>
      ) : (
        <VideoPlayer media={media} source={source} />
      )}
    </div>
  );
};
