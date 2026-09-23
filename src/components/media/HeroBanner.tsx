import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MediaItem } from '../../models/media';
import { Play, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

interface HeroBannerProps {
  item: MediaItem;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div className="hero-banner" role="banner" aria-label={`Featured: ${item.title}`}>
      <img
        src={item.backdropUrl || item.thumbnailUrl}
        alt={item.title}
        className="hero-backdrop-img"
        loading="eager"
      />
      <div className="hero-gradient" />

      <div className="hero-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Badge variant="accent">Featured</Badge>
          {item.rating && <Badge variant="neutral">{item.rating}</Badge>}
          {item.duration && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {item.duration}
            </span>
          )}
        </div>

        <h2 className="hero-title">{item.title}</h2>

        <p className="hero-desc">{item.description}</p>

        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/watch/${item.id}`)}
          >
            <Play size={16} fill="currentColor" />
            <span>Play Now</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/media/${item.id}`)}
          >
            <Info size={16} />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
