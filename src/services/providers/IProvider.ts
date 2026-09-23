import type { MediaItem, VideoSource, CatalogSection } from '../../models/media';

/**
 * Standard interface that all media providers must implement.
 * This guarantees the UI layer remains 100% decoupled from any specific provider.
 */
export interface IProvider {
  id: string;
  name: string;
  version: string;
  iconUrl?: string;
  description?: string;
  supportsSearch: boolean;
  supportsDownload: boolean;
  repositoryId?: string;

  /**
   * Returns grouped sections for the Home / Browse discovery feed
   */
  getCatalog(): Promise<CatalogSection[]>;

  /**
   * Returns a featured highlight media item for the Home hero banner
   */
  getFeatured(): Promise<MediaItem | undefined>;

  /**
   * Searches the provider's collection for a matching keyword
   */
  search(query: string): Promise<MediaItem[]>;

  /**
   * Retrieves full details for a given media ID
   */
  getDetails(mediaId: string): Promise<MediaItem | undefined>;

  /**
   * Resolves playable video source(s) for a given media ID
   */
  getVideoSources(mediaId: string): Promise<VideoSource[]>;
}
