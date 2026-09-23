import type { IWebProvider, MediaItem, NormalizedSource, CatalogSection } from './IWebProvider';

const YOUTUBE_ITEMS: MediaItem[] = [
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
    isFeatured: true,
    rating: 'PG-13',
    downloadable: false,
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
    downloadable: false,
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
    downloadable: false,
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
    downloadable: false,
  },
];

export class YouTubeProvider implements IWebProvider {
  public id = 'youtube';
  public name = 'YouTube';
  public version = '1.0.0';
  public description = 'Official legal embedded playback for authorized open cinema and public promotional media.';
  public supportedTypes = ['trailer', 'clip', 'open_movie'];
  public supportsSearch = true;
  public supportsDownload = false;

  public async loadHome(): Promise<CatalogSection[]> {
    return [
      {
        id: 'yt_official_trailers',
        title: 'Official Studio Trailers',
        items: YOUTUBE_ITEMS,
      },
    ];
  }

  public async search(query: string): Promise<MediaItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [...YOUTUBE_ITEMS];

    return YOUTUBE_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      const matchGenres = item.genres?.some((g) => g.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags || matchGenres;
    });
  }

  public async loadDetails(id: string): Promise<MediaItem | null> {
    const item = YOUTUBE_ITEMS.find((m) => m.id === id);
    return item || null;
  }

  public async loadSources(id: string): Promise<NormalizedSource[]> {
    const rawId = id.startsWith('yt_') ? id.slice(3) : id;

    return [
      {
        id: `source_${id}`,
        url: `https://www.youtube-nocookie.com/embed/${rawId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1`,
        type: 'youtube_embed',
        quality: '1080p HD',
        language: 'en',
        downloadable: false,
      },
    ];
  }

  public canDownload(): boolean {
    return false;
  }
}
