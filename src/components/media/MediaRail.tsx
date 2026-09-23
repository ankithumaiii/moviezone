import React, { useRef } from 'react';
import type { MediaItem, WatchProgress } from '../../models/media';
import { MediaCard } from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaRailProps {
  title: string;
  items: MediaItem[];
  progressMap?: Map<string, WatchProgress>;
  icon?: React.ReactNode;
}

export const MediaRail: React.FC<MediaRailProps> = ({
  title,
  items,
  progressMap,
  icon,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 480;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="media-rail" aria-label={title}>
      <div className="media-rail-header">
        <h3 className="media-rail-title">
          {icon}
          <span>{title}</span>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleScroll('left')}
            aria-label={`Scroll ${title} left`}
            style={{ width: 28, height: 28 }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleScroll('right')}
            aria-label={`Scroll ${title} right`}
            style={{ width: 28, height: 28 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="media-rail-track" ref={trackRef}>
        {items.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            progress={progressMap?.get(item.id)}
          />
        ))}
      </div>
    </section>
  );
};
