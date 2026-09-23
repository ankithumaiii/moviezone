import type { IProvider } from './providers/IProvider';
import { YouTubeProvider } from './providers/YouTubeProvider';
import { OpenCinemaProvider } from './providers/OpenCinemaProvider';
import { InstalledProvidersStorage } from '../storage/InstalledProvidersStorage';
import type { MediaItem, VideoSource, CatalogSection, ProviderInfo } from '../models/media';

type ProviderListener = () => void;

const SELECTED_PROVIDER_STORAGE_KEY = 'ankits_world_selected_provider';

export class ProviderManager {
  private static instance: ProviderManager;
  private providers: Map<string, IProvider> = new Map();
  private listeners: Set<ProviderListener> = new Set();

  private constructor() {
    // Register available web-compatible providers
    const yt = new YouTubeProvider();
    const oc = new OpenCinemaProvider();

    this.registerProvider(yt);
    this.registerProvider(oc);
  }

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  public subscribe(listener: ProviderListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[ProviderManager] Listener error:', err);
      }
    });
  }

  /**
   * Registers a provider into the internal registry
   */
  public registerProvider(provider: IProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Normalizes an extension name or identifier to a registered web provider ID
   */
  public normalizeProviderId(identifier: string): string | null {
    if (!identifier) return null;
    const clean = identifier.toLowerCase().replace(/[-_ \t]/g, '');

    for (const [id, provider] of this.providers.entries()) {
      const cleanId = id.toLowerCase().replace(/[-_ \t]/g, '');
      const cleanName = provider.name.toLowerCase().replace(/[-_ \t]/g, '');

      if (clean === cleanId || clean === cleanName || clean.includes(cleanId) || cleanId.includes(clean)) {
        return id;
      }
    }

    return null;
  }

  /**
   * Real capability detection: checks whether an extension has a registered web provider
   */
  public isWebCompatible(identifier: string): boolean {
    return this.normalizeProviderId(identifier) !== null;
  }

  /**
   * Checks whether a provider is installed
   */
  public isInstalled(providerIdOrName: string): boolean {
    const id = this.normalizeProviderId(providerIdOrName) || providerIdOrName;
    return InstalledProvidersStorage.isInstalled(id);
  }

  /**
   * Installs a web-compatible provider
   */
  public installProvider(providerIdOrName: string): boolean {
    const id = this.normalizeProviderId(providerIdOrName);
    if (!id || !this.providers.has(id)) {
      return false;
    }

    InstalledProvidersStorage.install(id);

    // If currently 'none', auto-select newly installed provider
    const current = this.getSelectedProviderId();
    if (current === 'none') {
      this.setSelectedProviderId(id);
    } else {
      this.notify();
    }

    return true;
  }

  /**
   * Uninstalls a provider
   */
  public uninstallProvider(providerIdOrName: string): void {
    const id = this.normalizeProviderId(providerIdOrName) || providerIdOrName;
    InstalledProvidersStorage.uninstall(id);

    // If the uninstalled provider was currently selected, reset to 'none'
    const current = this.getSelectedProviderId();
    if (current === id) {
      this.setSelectedProviderId('none');
    } else {
      this.notify();
    }
  }

  /**
   * Uninstalls all providers associated with a deleted repository
   */
  public uninstallProvidersForRepository(extensionIdentifiers: string[]): void {
    for (const identifier of extensionIdentifiers) {
      const id = this.normalizeProviderId(identifier);
      if (id && this.isInstalled(id)) {
        this.uninstallProvider(id);
      }
    }
  }

  /**
   * Returns metadata for all INSTALLED providers
   */
  public getInstalledProviders(): ProviderInfo[] {
    const installedIds = InstalledProvidersStorage.loadInstalled();
    const result: ProviderInfo[] = [];

    for (const id of installedIds) {
      const provider = this.providers.get(id);
      if (provider) {
        result.push({
          id: provider.id,
          name: provider.name,
          version: provider.version,
          iconUrl: provider.iconUrl,
          description: provider.description,
          isEnabled: true,
          isInstalled: true,
          supportsSearch: provider.supportsSearch,
          supportsDownload: provider.supportsDownload,
          repositoryId: provider.repositoryId,
        });
      }
    }

    return result;
  }

  /**
   * Returns all registered web providers
   */
  public getAllRegisteredProviders(): ProviderInfo[] {
    const result: ProviderInfo[] = [];
    this.providers.forEach((provider) => {
      result.push({
        id: provider.id,
        name: provider.name,
        version: provider.version,
        iconUrl: provider.iconUrl,
        description: provider.description,
        isEnabled: true,
        isInstalled: this.isInstalled(provider.id),
        supportsSearch: provider.supportsSearch,
        supportsDownload: provider.supportsDownload,
      });
    });
    return result;
  }

  /**
   * Returns currently selected provider ID: 'none', 'random', or specific provider ID
   */
  public getSelectedProviderId(): string {
    try {
      const saved = localStorage.getItem(SELECTED_PROVIDER_STORAGE_KEY);
      if (!saved || saved === 'none') return 'none';
      if (saved === 'random') {
        const installed = this.getInstalledProviders();
        if (installed.length >= 2) return 'random';
        if (installed.length === 1) return installed[0].id;
        return 'none';
      }

      // Check if saved ID is actually installed
      if (this.isInstalled(saved)) {
        return saved;
      }

      return 'none';
    } catch {
      return 'none';
    }
  }

  /**
   * Sets selected provider on Home ('none', 'random', or providerId)
   */
  public setSelectedProviderId(id: string): void {
    try {
      localStorage.setItem(SELECTED_PROVIDER_STORAGE_KEY, id);
    } catch (err) {
      console.error('[ProviderManager] Failed to persist selected provider:', err);
    }
    this.notify();
  }

  /**
   * Resolves the effective provider to load content from
   */
  public getEffectiveProvider(): IProvider | undefined {
    const selectedId = this.getSelectedProviderId();
    if (selectedId === 'none') {
      return undefined;
    }

    const installed = this.getInstalledProviders();
    if (installed.length === 0) {
      return undefined;
    }

    if (selectedId === 'random') {
      const randomIndex = Math.floor(Math.random() * installed.length);
      const chosen = installed[randomIndex];
      return this.providers.get(chosen.id);
    }

    return this.providers.get(selectedId);
  }

  /**
   * Gets catalog for Home feed, querying backend /api/home with local fallback
   */
  public async getCatalog(providerId?: string): Promise<CatalogSection[]> {
    const target = providerId || (this.getEffectiveProvider() ? this.getEffectiveProvider()!.id : null);
    if (!target) return [];

    try {
      const res = await fetch(`/api/home?provider=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections)) {
          return data.sections;
        }
      }
    } catch {
      // Backend request fallback to internal provider
    }

    const localProvider = this.providers.get(target);
    return localProvider ? localProvider.getCatalog() : [];
  }

  /**
   * Gets featured hero item
   */
  public async getFeatured(providerId?: string): Promise<MediaItem | undefined> {
    const target = providerId || (this.getEffectiveProvider() ? this.getEffectiveProvider()!.id : null);
    if (!target) return undefined;

    try {
      const res = await fetch(`/api/home?provider=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.featured) {
          return data.featured;
        }
      }
    } catch {
      // Fallback
    }

    const localProvider = this.providers.get(target);
    return localProvider ? localProvider.getFeatured() : undefined;
  }

  /**
   * Searches the provider querying backend /api/search with local fallback
   */
  public async search(query: string, providerId?: string): Promise<MediaItem[]> {
    const target = providerId || (this.getEffectiveProvider() ? this.getEffectiveProvider()!.id : null);
    if (!target) return [];

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&provider=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) {
          return data.results;
        }
      }
    } catch {
      // Fallback
    }

    const localProvider = this.providers.get(target);
    if (!localProvider) return [];
    return localProvider.search(query);
  }

  /**
   * Fetches details for a given mediaId querying backend /api/details with local fallback
   */
  public async getDetails(mediaId: string, providerId?: string): Promise<MediaItem | undefined> {
    const target = providerId || (this.getEffectiveProvider() ? this.getEffectiveProvider()!.id : '');

    try {
      const url = target
        ? `/api/details?id=${encodeURIComponent(mediaId)}&provider=${encodeURIComponent(target)}`
        : `/api/details?id=${encodeURIComponent(mediaId)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          return data.item;
        }
      }
    } catch {
      // Fallback
    }

    if (target && this.providers.has(target)) {
      return this.providers.get(target)!.getDetails(mediaId);
    }

    for (const p of this.providers.values()) {
      const item = await p.getDetails(mediaId);
      if (item) return item;
    }

    return undefined;
  }

  /**
   * Fetches video sources for playback querying backend /api/sources with local fallback
   */
  public async getVideoSources(mediaId: string, providerId?: string): Promise<VideoSource[]> {
    const target = providerId || (this.getEffectiveProvider() ? this.getEffectiveProvider()!.id : '');

    try {
      const url = target
        ? `/api/sources?id=${encodeURIComponent(mediaId)}&provider=${encodeURIComponent(target)}`
        : `/api/sources?id=${encodeURIComponent(mediaId)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sources) && data.sources.length > 0) {
          return data.sources.map((s: { id: string; url: string; type: string; quality?: string; language?: string; downloadable?: boolean; downloadUrl?: string }) => ({
            id: s.id,
            mediaId,
            title: `${mediaId} Stream`,
            providerId: target || 'web_provider',
            providerName: target || 'Web Provider',
            playbackType: s.type as VideoSource['playbackType'],
            embedUrl: s.url,
            videoUrl: s.url,
            quality: s.quality || 'HD',
            requiresEmbed: s.type === 'youtube_embed' || s.type === 'iframe',
            downloadable: Boolean(s.downloadable),
            downloadUrl: s.downloadUrl,
          }));
        }
      }
    } catch {
      // Fallback
    }

    if (target && this.providers.has(target)) {
      return this.providers.get(target)!.getVideoSources(mediaId);
    }

    for (const p of this.providers.values()) {
      const sources = await p.getVideoSources(mediaId);
      if (sources.length > 0) return sources;
    }

    return [];
  }

  public getAvailableProviders(): ProviderInfo[] {
    const installed = this.getInstalledProviders();
    if (installed.length > 0) return installed;
    return this.getAllRegisteredProviders();
  }

  public getActiveProviderId(): string {
    return this.getSelectedProviderId();
  }

  public setActiveProvider(providerId: string): void {
    this.setSelectedProviderId(providerId);
  }
}
