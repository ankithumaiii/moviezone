/**
 * Normalized playable source returned by a web provider
 */
export interface NormalizedSource {
  id: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'youtube_embed' | 'iframe';
  quality?: string;
  language?: string;
  subtitles?: Array<{ language: string; url: string }>;
  downloadable: boolean;
  downloadUrl?: string;
}

/**
 * Universal media representation used across catalogs, search, and details
 */
export interface MediaItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  backdropUrl?: string;
  type: 'movie' | 'trailer' | 'series' | 'clip' | 'open_movie';
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

export interface CatalogSection {
  id: string;
  title: string;
  items: MediaItem[];
}

/**
 * Clean, decoupled Web Provider Interface
 */
export interface IWebProvider {
  id: string;
  name: string;
  icon?: string;
  repositoryId?: string;
  supportedTypes: string[];
  version: string;
  description?: string;
  supportsSearch: boolean;
  supportsDownload: boolean;

  search(query: string): Promise<MediaItem[]>;
  loadHome(): Promise<CatalogSection[]>;
  loadDetails(id: string): Promise<MediaItem | null>;
  loadSources(id: string): Promise<NormalizedSource[]>;

  canDownload?(source: NormalizedSource): boolean;
  download?(source: NormalizedSource): Promise<string | null>;
}
