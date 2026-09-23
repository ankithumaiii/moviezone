import type { IProvider } from './IProvider';
import type { MediaItem, VideoSource, CatalogSection } from '../../models/media';

/**
 * Curated list of 100% legal, Creative Commons-licensed open-source cinema
 * created by the Blender Foundation and independent open filmmakers.
 * These titles explicitly allow public streaming and downloads under Creative Commons.
 */
const OPEN_CINEMA_ITEMS: MediaItem[] = [
  {
    id: 'oc_big_buck_bunny',
    title: 'Big Buck Bunny',
    description:
      'A large, gentle rabbit is pushed to his limits by three bullying woodland rodents. Deciding enough is enough, Bunny devises clever, comical contraptions to turn the tables in the forest. Created entirely with open-source tools under CC-BY 3.0.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    type: 'open_movie',
    duration: '9m 56s',
    durationSeconds: 596,
    releaseYear: 2008,
    providerId: 'open_cinema',
    providerName: 'Open Cinema',
    tags: ['Animation', 'Comedy', 'Open Movie', 'Creative Commons'],
    genres: ['Animation', 'Comedy', 'Short'],
    isFeatured: true,
    rating: 'G',
    downloadable: true,
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'oc_tears_of_steel',
    title: 'Tears of Steel',
    description:
      'Set in a dystopian future where humanity battles rogue robotic entities, a group of scientists and soldiers gather at the Oude Kerk in Amsterdam to stage a desperate attempt to rescue the world.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    type: 'open_movie',
    duration: '12m 14s',
    durationSeconds: 734,
    releaseYear: 2012,
    providerId: 'open_cinema',
    providerName: 'Open Cinema',
    tags: ['Sci-Fi', 'VFX', 'Open Movie', '4K'],
    genres: ['Science Fiction', 'Action', 'Short'],
    isFeatured: false,
    rating: 'PG-13',
    downloadable: true,
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
  {
    id: 'oc_sintel',
    title: 'Sintel',
    description:
      'The emotional story of a lonely young woman named Sintel who nurses an injured baby dragon back to health. When her companion is snatched by an adult dragon, she embarks on a dangerous quest across ancient lands.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    type: 'open_movie',
    duration: '14m 48s',
    durationSeconds: 888,
    releaseYear: 2010,
    providerId: 'open_cinema',
    providerName: 'Open Cinema',
    tags: ['Fantasy', 'Emotional', 'Animation', 'Open Movie'],
    genres: ['Animation', 'Fantasy', 'Adventure'],
    isFeatured: false,
    rating: 'PG',
    downloadable: true,
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
  {
    id: 'oc_elephants_dream',
    title: 'Elephants Dream',
    description:
      'The worlds first open-source 3D animated film. Follows Proog and Emo as they navigate the giant, mysterious, mechanical machine room of a surreal universe.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=1200&auto=format&fit=crop&q=80',
    type: 'open_movie',
    duration: '10m 54s',
    durationSeconds: 654,
    releaseYear: 2006,
    providerId: 'open_cinema',
    providerName: 'Open Cinema',
    tags: ['Surreal', 'Animation', 'Open Source', 'Historic'],
    genres: ['Animation', 'Sci-Fi', 'Surreal'],
    isFeatured: false,
    rating: 'PG',
    downloadable: true,
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
];

export class OpenCinemaProvider implements IProvider {
  public id = 'open_cinema';
  public name = 'Open Cinema';
  public version = '1.0.0';
  public description = 'Authorized Creative Commons open cinema films featuring direct HD playback and permitted downloads.';
  public supportsSearch = true;
  public supportsDownload = true;

  public async getCatalog(): Promise<CatalogSection[]> {
    return [
      {
        id: 'open_cinema_highlights',
        title: 'Open Source Feature Films',
        items: OPEN_CINEMA_ITEMS,
      },
    ];
  }

  public async getFeatured(): Promise<MediaItem | undefined> {
    return OPEN_CINEMA_ITEMS.find((item) => item.isFeatured) || OPEN_CINEMA_ITEMS[0];
  }

  public async search(query: string): Promise<MediaItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [...OPEN_CINEMA_ITEMS];

    return OPEN_CINEMA_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      const matchGenres = item.genres?.some((g) => g.toLowerCase().includes(q));
      const matchYear = item.releaseYear?.toString().includes(q);

      return matchTitle || matchDesc || matchTags || matchGenres || matchYear;
    });
  }

  public async getDetails(mediaId: string): Promise<MediaItem | undefined> {
    return OPEN_CINEMA_ITEMS.find((item) => item.id === mediaId);
  }

  public async getVideoSources(mediaId: string): Promise<VideoSource[]> {
    const item = await this.getDetails(mediaId);
    if (!item) return [];

    return [
      {
        id: `src_oc_${mediaId}`,
        mediaId,
        title: `${item.title} (Direct HD Stream)`,
        providerId: this.id,
        providerName: this.name,
        playbackType: 'mp4',
        embedUrl: item.downloadUrl || '',
        videoUrl: item.downloadUrl,
        quality: '1080p Full HD',
        requiresEmbed: false,
        downloadable: item.downloadable,
        downloadUrl: item.downloadUrl,
      },
    ];
  }
}
