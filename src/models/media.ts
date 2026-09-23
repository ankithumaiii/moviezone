export type MediaType = 'movie' | 'trailer' | 'series' | 'clip' | 'open_movie';

export type PlaybackType = 'youtube_embed' | 'iframe' | 'hls' | 'mp4';

/**
 * Universal media representation used across catalogs, search, and details
 */
export interface MediaItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  backdropUrl?: string;
  type: MediaType;
  duration?: string;
  durationSeconds?: number;
  releaseYear?: number;
  providerId: string;
  providerName: string;
  tags?: string[];
  genres?: string[];
  isFeatured?: boolean;
  rating?: string;
  downloadable?: boolean;
  downloadUrl?: string;
}

/**
 * Playable source metadata returned by a provider
 */
export interface VideoSource {
  id: string;
  mediaId: string;
  title: string;
  providerId: string;
  providerName: string;
  playbackType: PlaybackType;
  embedUrl: string;
  videoUrl?: string;
  quality?: string;
  requiresEmbed: boolean;
  downloadable?: boolean;
  downloadUrl?: string;
}

/**
 * Normalized source returned by the backend web provider
 */
export interface NormalizedSource {
  id: string;
  url: string;
  type: PlaybackType;
  quality?: string;
  language?: string;
  subtitles?: Array<{ language: string; url: string }>;
  downloadable: boolean;
  downloadUrl?: string;
}

/**
 * Watch progress tracking record
 */
export interface WatchProgress {
  mediaId: string;
  title: string;
  thumbnailUrl: string;
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatchedAt: number;
  completed: boolean;
  providerId: string;
}

/**
 * Public provider registry descriptor
 */
export interface ProviderInfo {
  id: string;
  name: string;
  version: string;
  iconUrl?: string;
  description?: string;
  isDefault?: boolean;
  isEnabled: boolean;
  isInstalled: boolean;
  supportsSearch: boolean;
  supportsDownload: boolean;
  repositoryId?: string;
}

export interface CatalogSection {
  id: string;
  title: string;
  items: MediaItem[];
}
