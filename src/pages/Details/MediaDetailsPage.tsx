import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ProviderManager } from '../../services/ProviderManager';
import type { MediaItem } from '../../models/media';
import { ProviderSelector } from '../../components/player/ProviderSelector';
import { MediaRail } from '../../components/media/MediaRail';
import { Badge } from '../../components/common/Badge';
import { Play, ArrowLeft, AlertCircle, Clock, Calendar, Star, Download } from 'lucide-react';

export const MediaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const providerManager = ProviderManager.getInstance();
  const paramProvider = searchParams.get('provider');

  const [media, setMedia] = useState<MediaItem | undefined>(undefined);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    paramProvider || providerManager.getSelectedProviderId() || 'open_cinema'
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    const loadDetails = async () => {
      try {
        const item = await providerManager.getDetails(id, selectedProviderId);
        setMedia(item);

        if (item) {
          // If media item has its own providerId and it differs, align provider
          if (item.providerId && item.providerId !== selectedProviderId && !paramProvider) {
            setSelectedProviderId(item.providerId);
          }

          // Fetch catalog items for related rail
          const catalog = await providerManager.getCatalog(item.providerId || selectedProviderId);
          const allItems = catalog.flatMap((c) => c.items);
          const filtered = allItems.filter((m) => m.id !== id);
          setRelated(filtered.slice(0, 8));
        }
      } catch (err) {
        console.error('[MediaDetailsPage] Error loading details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [id, selectedProviderId, paramProvider, providerManager]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Loading details...
        </span>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="page-container">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigate('/')}
          style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-md)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={28} />
          </div>
          <h3 className="empty-state-title">Media Not Found</h3>
          <p className="empty-state-text">
            The requested title is not available or could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '960px' }}>
      {/* Back button */}
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => navigate(-1)}
        style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-md)', paddingLeft: 'var(--space-xs)' }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Hero Backdrop */}
      <div className="details-backdrop-hero">
        <img
          src={media.backdropUrl || media.thumbnailUrl}
          alt={media.title}
          className="details-hero-img"
          loading="eager"
        />
        <div className="details-hero-gradient" />
      </div>

      {/* Main Details Body */}
      <div className="details-content-box">
        <div className="details-title-row">
          <h1 className="details-title">{media.title}</h1>
        </div>

        {/* Metadata Badges */}
        <div className="details-meta-pills">
          <Badge variant="accent">{media.type.replace('_', ' ').toUpperCase()}</Badge>

          {media.rating && (
            <Badge variant="neutral" icon={<Star size={11} fill="currentColor" />}>
              {media.rating}
            </Badge>
          )}

          {media.duration && (
            <Badge variant="neutral" icon={<Clock size={11} />}>
              {media.duration}
            </Badge>
          )}

          {media.releaseYear && (
            <Badge variant="neutral" icon={<Calendar size={11} />}>
              {media.releaseYear}
            </Badge>
          )}

          {media.genres?.map((genre) => (
            <Badge key={genre} variant="neutral">
              {genre}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <p className="details-desc">{media.description}</p>

        {/* Play & Download Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/watch/${media.id}?provider=${selectedProviderId}`)}
              style={{ height: '46px', fontSize: '1rem', fontWeight: 600, minWidth: '180px' }}
            >
              <Play size={18} fill="currentColor" />
              <span>Play Video</span>
            </button>

            {/* Download button ONLY appears when explicitly permitted by source */}
            {media.downloadable && media.downloadUrl && (
              <a
                href={media.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="btn btn-secondary"
                style={{
                  height: '46px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  minWidth: '150px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  borderColor: 'var(--border-subtle)',
                }}
                title="Download authorized open video file"
              >
                <Download size={18} />
                <span>Download</span>
              </a>
            )}
          </div>

          <div>
            <ProviderSelector
              selectedProviderId={selectedProviderId}
              onSelectProvider={setSelectedProviderId}
            />
          </div>
        </div>

        {/* Related Titles */}
        {related.length > 0 && (
          <div style={{ marginTop: 'var(--space-2xl)' }}>
            <MediaRail title="Related Titles" items={related} />
          </div>
        )}
      </div>
    </div>
  );
};
