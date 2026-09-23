import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface LazyImageProps {
  src?: string | null;
  alt: string;
  fallbackIcon: LucideIcon;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackIcon: FallbackIcon,
  width = 44,
  height = 44,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const style: React.CSSProperties = {
    width,
    height,
    minWidth: width,
    minHeight: height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  if (!src || hasError) {
    return (
      <div style={style} className={className} aria-label={alt}>
        <FallbackIcon size={20} style={{ opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--bg-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FallbackIcon size={18} style={{ opacity: 0.3 }} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 180ms ease-in-out',
        }}
      />
    </div>
  );
};
