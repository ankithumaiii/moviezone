import React, { useState, useEffect, useRef } from 'react';
import type { VideoSource, MediaItem } from '../../models/media';
import { WatchProgressManager } from '../../services/WatchProgressManager';
import { AlertCircle, Film, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  media: MediaItem;
  source: VideoSource;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ media, source }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Initial record that this item was opened / watched
    const progressManager = WatchProgressManager.getInstance();
    const existing = progressManager.getProgress(media.id);
    const initialTime = existing?.currentTime || 10;
    const duration = media.durationSeconds || 600;

    progressManager.recordProgress(media, initialTime, duration);

    // Simulate steady progress updates while on player page
    const interval = setInterval(() => {
      const current = progressManager.getProgress(media.id);
      if (current && !current.completed) {
        const nextTime = Math.min(current.currentTime + 15, current.duration);
        progressManager.recordProgress(media, nextTime, current.duration);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [media, source]);

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('[VideoPlayer] Fullscreen request rejected:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="player-view-container" ref={containerRef}>
      <div className="player-stage">
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#090a0f',
              zIndex: 2,
              gap: '12px',
            }}
          >
            <div className="spinner" style={{ width: 28, height: 28 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Loading player...
            </span>
          </div>
        )}

        {hasError ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#090a0f',
              padding: '20px',
              textAlign: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={32} color="var(--status-danger)" />
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Playback Error</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 360 }}>
              Unable to load the video stream. This video may be restricted or temporarily unavailable.
            </p>
          </div>
        ) : !source.requiresEmbed && source.videoUrl ? (
          <video
            src={source.videoUrl}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <iframe
            src={source.embedUrl}
            title={media.title}
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>

      <div className="player-info-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--accent-surface)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Film size={18} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {media.title}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Provider: {source.providerName} • {source.quality || 'Auto'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleFullscreen}
          title="Toggle Fullscreen"
          style={{ height: '34px', padding: '0 10px', fontSize: '0.8rem' }}
        >
          <Maximize size={15} />
          <span>Fullscreen</span>
        </button>
      </div>
    </div>
  );
};
