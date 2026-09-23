import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MediaItem, WatchProgress } from '../../models/media';
import { Play, Film } from 'lucide-react';
import { Badge } from '../common/Badge';

interface MediaCardProps {
  media: MediaItem;
  progress?: WatchProgress;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, progress }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    navigate(`/media/${media.id}`);
  };

  const formatTypeLabel = (type: string) => {
    switch (type) {
      case 'open_movie':
        return 'Movie';
      case 'trailer':
        return 'Trailer';
      case 'clip':
        return 'Short';
      default:
        return 'Video';
    }
  };

  return (
    <div
      className="media-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      aria-label={`Open ${media.title}`}
    >
      <div className="media-thumb-container">
        {imageError ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Film size={28} />
          </div>
        ) : (
          <img
            src={media.thumbnailUrl}
            alt={media.title}
            className="media-thumb-img"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        )}

        <div className="media-play-overlay">
          <div className="media-play-circle">
            <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
          </div>
        </div>

        {media.duration && (
          <span className="media-duration-tag">{media.duration}</span>
        )}

        {progress && progress.percentage > 0 && (
          <div className="media-progress-bar">
            <div
              className="media-progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}
      </div>

      <div className="media-card-body">
        <h4 className="media-card-title">{media.title}</h4>

        <div className="media-card-meta">
          <Badge variant="neutral">{formatTypeLabel(media.type)}</Badge>
          {media.releaseYear && <span>{media.releaseYear}</span>}
        </div>
      </div>
    </div>
  );
};
