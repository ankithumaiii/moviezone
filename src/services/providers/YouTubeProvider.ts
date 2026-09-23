import type { IProvider } from './IProvider';
import type { MediaItem, VideoSource, CatalogSection } from '../../models/media';

/**
 * Curated list of 100% legal, authorized open-source cinema (Creative Commons by Blender Foundation)
 * and official studio trailers available for public embedding via YouTube's official player.
 */
const YOUTUBE_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'yt_R6MlUcmOul8',
    title: 'Tears of Steel',
    description:
      'Set in a dystopian future where humanity battles rogue robotic entities, a group of scientists and soldiers gather at the Oude Kerk in Amsterdam to stage a desperate attempt to rescue the world.',
    thumbnailUrl: 'https://img.youtube.com/vi/R6MlUcmOul8/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/R6MlUcmOul8/maxresdefault.jpg',
    type: 'open_movie',
    duration: '12m 14s',
    durationSeconds: 734,
    releaseYear: 2012,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Sci-Fi', 'VFX', 'Open Movie', '4K'],
    genres: ['Science Fiction', 'Action', 'Short'],
    isFeatured: true,
    rating: 'PG-13',
  },
  {
    id: 'yt_aqz-KE-bpKQ',
    title: 'Big Buck Bunny',
    description:
      'A large, gentle rabbit is pushed to his limits by three bullying woodland rodents. Deciding enough is enough, Bunny devises clever, comical contraptions to turn the tables in the forest.',
    thumbnailUrl: 'https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg',
    type: 'open_movie',
    duration: '9m 56s',
    durationSeconds: 596,
    releaseYear: 2008,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Animation', 'Comedy', '4K 60fps', 'Open Movie'],
    genres: ['Animation', 'Comedy'],
    isFeatured: false,
    rating: 'G',
  },
  {
    id: 'yt_eRsGyueVLvQ',
    title: 'Sintel',
    description:
      'The emotional story of a lonely young woman named Sintel who nurses an injured baby dragon back to health. When her companion is snatched by an adult dragon, she embarks on a dangerous quest across ancient lands.',
    thumbnailUrl: 'https://img.youtube.com/vi/eRsGyueVLvQ/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/eRsGyueVLvQ/maxresdefault.jpg',
    type: 'open_movie',
    duration: '14m 48s',
    durationSeconds: 888,
    releaseYear: 2010,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Fantasy', 'Emotional', 'Animation', 'Open Movie'],
    genres: ['Animation', 'Fantasy', 'Adventure'],
    isFeatured: false,
    rating: 'PG',
  },
  {
    id: 'yt_ux_nnnN_yZ8',
    title: 'Charge',
    description:
      'An old factory worker desperate to power up his beloved companion robotic dog risks everything to steal energy from a charging station defended by ruthless security droids in a gritty cyberpunk city.',
    thumbnailUrl: 'https://img.youtube.com/vi/ux_nnnN_yZ8/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/ux_nnnN_yZ8/maxresdefault.jpg',
    type: 'open_movie',
    duration: '3m 15s',
    durationSeconds: 195,
    releaseYear: 2022,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Cyberpunk', 'Real-time 4K', 'Action', 'Open Movie'],
    genres: ['Action', 'Sci-Fi'],
    isFeatured: false,
    rating: 'PG',
  },
  {
    id: 'yt_Y-rmzh0PI3c',
    title: 'Cosmos Laundromat',
    description:
      'On a desolate island, a despondent sheep named Franck meets an enigmatic salesman who offers him the deal of a lifetime: a surreal journey through thousands of alternative parallel lives.',
    thumbnailUrl: 'https://img.youtube.com/vi/Y-rmzh0PI3c/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/Y-rmzh0PI3c/maxresdefault.jpg',
    type: 'open_movie',
    duration: '12m 10s',
    durationSeconds: 730,
    releaseYear: 2015,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Surreal', 'Animation', 'Experimental', 'Award Winner'],
    genres: ['Drama', 'Surreal', 'Fantasy'],
    isFeatured: false,
    rating: 'PG-13',
  },
  {
    id: 'yt_FG0fTKAqZ5g',
    title: 'NASA | Earth in 4K from the ISS',
    description:
      'Stunning ultra-high-definition time-lapse cinematography captured by astronauts aboard the International Space Station showcasing continents, auroras, thunderstorms, and oceans.',
    thumbnailUrl: 'https://img.youtube.com/vi/FG0fTKAqZ5g/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/FG0fTKAqZ5g/maxresdefault.jpg',
    type: 'clip',
    duration: '1h 00m',
    durationSeconds: 3600,
    releaseYear: 2021,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['NASA', 'Documentary', 'Space', 'Earth', '4K UHD'],
    genres: ['Documentary', 'Nature'],
    isFeatured: false,
    rating: 'All Ages',
  },
  {
    id: 'yt_Way9Dexny3w',
    title: 'Dune: Part Two — Official Trailer 3',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and the fate of the known universe, he endeavors to prevent a terrible future.',
    thumbnailUrl: 'https://img.youtube.com/vi/Way9Dexny3w/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/Way9Dexny3w/maxresdefault.jpg',
    type: 'trailer',
    duration: '2m 54s',
    durationSeconds: 174,
    releaseYear: 2024,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Trailer', 'Sci-Fi', 'Warner Bros', '4K'],
    genres: ['Sci-Fi', 'Adventure'],
    isFeatured: false,
    rating: 'PG-13',
  },
  {
    id: 'yt_cqGjhVJWtEg',
    title: 'Spider-Man: Across the Spider-Verse — Trailer',
    description:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. But when the heroes clash on how to handle a threat, Miles must redefine what it means to be a hero.',
    thumbnailUrl: 'https://img.youtube.com/vi/cqGjhVJWtEg/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/cqGjhVJWtEg/maxresdefault.jpg',
    type: 'trailer',
    duration: '2m 45s',
    durationSeconds: 165,
    releaseYear: 2023,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Trailer', 'Marvel', 'Animation', 'Sony'],
    genres: ['Animation', 'Action', 'Adventure'],
    isFeatured: false,
    rating: 'PG',
  },
  {
    id: 'yt_zSWdZVtT7bQ',
    title: 'Interstellar — Official Trailer 2',
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humanity's survival.",
    thumbnailUrl: 'https://img.youtube.com/vi/zSWdZVtT7bQ/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/zSWdZVtT7bQ/maxresdefault.jpg',
    type: 'trailer',
    duration: '2m 33s',
    durationSeconds: 153,
    releaseYear: 2014,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Trailer', 'Nolan', 'Sci-Fi', 'Paramount'],
    genres: ['Sci-Fi', 'Drama'],
    isFeatured: false,
    rating: 'PG-13',
  },
  {
    id: 'yt_uYPbbksJxIg',
    title: 'Oppenheimer — Official Trailer',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II under the Manhattan Project.',
    thumbnailUrl: 'https://img.youtube.com/vi/uYPbbksJxIg/hqdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/uYPbbksJxIg/maxresdefault.jpg',
    type: 'trailer',
    duration: '3m 06s',
    durationSeconds: 186,
    releaseYear: 2023,
    providerId: 'youtube',
    providerName: 'YouTube',
    tags: ['Trailer', 'Historical', 'Drama', 'Universal'],
    genres: ['Biography', 'Drama', 'History'],
    isFeatured: false,
    rating: 'R',
  },
];

export class YouTubeProvider implements IProvider {
  public id = 'youtube';
  public name = 'YouTube';
  public version = '1.0.0';
  public description = 'Official legal embedded playback for authorized open cinema and public promotional media.';
  public supportsSearch = true;
  public supportsDownload = false;

  public async getCatalog(): Promise<CatalogSection[]> {
    const openMovies = YOUTUBE_MEDIA_ITEMS.filter((item) => item.type === 'open_movie');
    const trailers = YOUTUBE_MEDIA_ITEMS.filter((item) => item.type === 'trailer');
    const documentary = YOUTUBE_MEDIA_ITEMS.filter((item) => item.type === 'clip');

    return [
      {
        id: 'popular_open_movies',
        title: 'Popular Open Cinema',
        items: openMovies,
      },
      {
        id: 'official_trailers',
        title: 'Official Movie Trailers',
        items: trailers,
      },
      {
        id: 'documentary_and_demos',
        title: 'Documentary & 4K Demos',
        items: documentary,
      },
    ];
  }

  public async getFeatured(): Promise<MediaItem | undefined> {
    return YOUTUBE_MEDIA_ITEMS.find((item) => item.isFeatured) || YOUTUBE_MEDIA_ITEMS[0];
  }

  public async search(query: string): Promise<MediaItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [...YOUTUBE_MEDIA_ITEMS];

    return YOUTUBE_MEDIA_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      const matchGenres = item.genres?.some((g) => g.toLowerCase().includes(q));
      const matchYear = item.releaseYear?.toString().includes(q);

      return matchTitle || matchDesc || matchTags || matchGenres || matchYear;
    });
  }

  public async getDetails(mediaId: string): Promise<MediaItem | undefined> {
    return YOUTUBE_MEDIA_ITEMS.find((item) => item.id === mediaId);
  }

  public async getVideoSources(mediaId: string): Promise<VideoSource[]> {
    const item = await this.getDetails(mediaId);
    if (!item) return [];

    // Extract pure video ID from prefix 'yt_'
    const rawVideoId = mediaId.startsWith('yt_') ? mediaId.slice(3) : mediaId;

    return [
      {
        id: `src_yt_${rawVideoId}`,
        mediaId,
        title: `${item.title} (Official YouTube Embed)`,
        providerId: this.id,
        providerName: this.name,
        playbackType: 'youtube_embed',
        embedUrl: `https://www.youtube-nocookie.com/embed/${rawVideoId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1`,
        quality: '1080p HD',
        requiresEmbed: true,
      },
    ];
  }
}
