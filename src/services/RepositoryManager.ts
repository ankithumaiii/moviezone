import type {
  CloudStreamManifest,
  CloudStreamPlugin,
  Extension,
  Repository,
} from '../models/repository';
import { RepositoryStorage } from '../storage/RepositoryStorage';
import { ProviderManager } from './ProviderManager';
import { formatLanguage, mapPluginStatus } from '../utils/formatters';
import { generateRepoId, isValidHttpUrl, normalizeUrl, resolveUrl } from '../utils/url';

type Listener = () => void;

const REQUEST_TIMEOUT_MS = 15000;

export class RepositoryManager {
  private static instance: RepositoryManager;
  private repositories: Repository[] = [];
  private listeners: Set<Listener> = new Set();

  private constructor() {
    this.repositories = RepositoryStorage.loadRepositories();
  }

  public static getInstance(): RepositoryManager {
    if (!RepositoryManager.instance) {
      RepositoryManager.instance = new RepositoryManager();
    }
    return RepositoryManager.instance;
  }

  /**
   * Subscribe to repository state changes
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    RepositoryStorage.saveRepositories(this.repositories);
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[RepositoryManager] Listener execution failed:', err);
      }
    });
  }

  /**
   * Retrieve all currently loaded repositories with up-to-date installation status
   */
  public getRepositories(): Repository[] {
    const providerManager = ProviderManager.getInstance();
    return this.repositories.map((repo) => ({
      ...repo,
      extensions: repo.extensions.map((ext) => {
        const isWebCompatible = providerManager.isWebCompatible(ext.internalName) || providerManager.isWebCompatible(ext.name);
        return {
          ...ext,
          isWebCompatible,
          compatibilityLabel: isWebCompatible ? 'Web Compatible' : 'Web implementation unavailable',
          isInstalled: isWebCompatible && (providerManager.isInstalled(ext.internalName) || providerManager.isInstalled(ext.name)),
        };
      }),
    }));
  }

  /**
   * Find a specific repository by ID with up-to-date installation status
   */
  public getRepository(id: string): Repository | undefined {
    const repo = this.repositories.find((r) => r.id === id);
    if (!repo) return undefined;
    const providerManager = ProviderManager.getInstance();
    return {
      ...repo,
      extensions: repo.extensions.map((ext) => {
        const isWebCompatible = providerManager.isWebCompatible(ext.internalName) || providerManager.isWebCompatible(ext.name);
        return {
          ...ext,
          isWebCompatible,
          compatibilityLabel: isWebCompatible ? 'Web Compatible' : 'Web implementation unavailable',
          isInstalled: isWebCompatible && (providerManager.isInstalled(ext.internalName) || providerManager.isInstalled(ext.name)),
        };
      }),
    };
  }

  /**
   * Validates and adds a new repository by fetching its manifest and plugin lists.
   */
  public async addRepository(rawUrl: string): Promise<Repository> {
    const trimmed = rawUrl.trim();
    if (!isValidHttpUrl(trimmed)) {
      throw new Error('Please enter a valid HTTP or HTTPS repository URL.');
    }

    const normalized = normalizeUrl(trimmed);
    const existing = this.repositories.find(
      (r) => normalizeUrl(r.url) === normalized
    );

    if (existing) {
      throw new Error(`Repository "${existing.name}" is already added.`);
    }

    const repo = await this.fetchAndParseRepository(trimmed);

    this.repositories.push(repo);
    this.notify();
    return repo;
  }

  /**
   * Refreshes an existing repository by re-fetching its manifest and plugin lists.
   */
  public async refreshRepository(id: string): Promise<Repository> {
    const repoIndex = this.repositories.findIndex((r) => r.id === id);
    if (repoIndex === -1) {
      throw new Error('Repository not found.');
    }

    const currentRepo = this.repositories[repoIndex];
    // Mark as syncing
    this.repositories[repoIndex] = {
      ...currentRepo,
      status: 'syncing',
      error: undefined,
    };
    this.notify();

    try {
      const updated = await this.fetchAndParseRepository(currentRepo.url, currentRepo.id);
      this.repositories[repoIndex] = updated;
      this.notify();
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh repository.';
      this.repositories[repoIndex] = {
        ...currentRepo,
        status: 'error',
        error: message,
      };
      this.notify();
      throw err;
    }
  }

  /**
   * Deletes a repository by ID and uninstalls any installed providers belonging to it.
   */
  public deleteRepository(id: string): boolean {
    const targetRepo = this.repositories.find((r) => r.id === id);
    if (targetRepo) {
      const extNames = targetRepo.extensions.map((e) => e.internalName || e.name);
      ProviderManager.getInstance().uninstallProvidersForRepository(extNames);
    }
    const initialLength = this.repositories.length;
    this.repositories = this.repositories.filter((r) => r.id !== id);
    if (this.repositories.length !== initialLength) {
      RepositoryStorage.removeRepository(id);
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Core engine: fetches manifest, validates structure, resolves pluginLists,
   * fetches each plugin list, and normalizes extensions.
   */
  public async fetchAndParseRepository(url: string, existingId?: string): Promise<Repository> {
    const repoId = existingId || generateRepoId(url);

    // 1. Fetch Manifest
    let manifestData: unknown;
    try {
      manifestData = await this.fetchJsonWithTimeout(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('timeout') || message.includes('Timeout')) {
        throw new Error('Connection timed out while fetching repository.');
      }
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        throw new Error('Unable to reach this repository. Please check your network connection or the URL.');
      }
      throw new Error(`Unable to fetch repository: ${message}`);
    }

    // 2. Validate Manifest
    const manifest = this.validateManifest(manifestData);

    // 3. Resolve plugin lists
    const pluginListUrls = manifest.pluginLists.map((item) => resolveUrl(item, url));

    // 4. Fetch all plugin lists concurrently
    const extensions: Extension[] = [];
    const pluginFetchErrors: string[] = [];

    await Promise.all(
      pluginListUrls.map(async (listUrl) => {
        try {
          const listJson = await this.fetchJsonWithTimeout(listUrl);
          const parsedExtensions = this.parsePluginList(listJson, repoId, manifest.name, listUrl);
          extensions.push(...parsedExtensions);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn(`[RepositoryManager] Failed to fetch plugin list at ${listUrl}:`, errMsg);
          pluginFetchErrors.push(`${listUrl} (${errMsg})`);
        }
      })
    );

    // Deduplicate extensions if identical internalName appears across lists
    const dedupedExtensions = this.deduplicateExtensions(extensions);

    const repository: Repository = {
      id: repoId,
      url,
      name: manifest.name.trim(),
      description: manifest.description?.trim() || '',
      iconUrl: manifest.iconUrl?.trim() || undefined,
      manifestVersion: manifest.manifestVersion || 1,
      pluginLists: pluginListUrls,
      extensions: dedupedExtensions,
      addedAt: Date.now(),
      lastSyncedAt: Date.now(),
      status: 'idle',
      error:
        pluginFetchErrors.length > 0 && dedupedExtensions.length === 0
          ? 'Some or all plugin lists could not be loaded.'
          : undefined,
    };

    return repository;
  }

  /**
   * Validates that raw JSON matches CloudStream repository manifest requirements.
   */
  private validateManifest(data: unknown): CloudStreamManifest {
    if (!data || typeof data !== 'object') {
      throw new Error('This repository returned invalid data (expected a JSON object).');
    }

    const obj = data as Record<string, unknown>;

    if (typeof obj.name !== 'string' || !obj.name.trim()) {
      throw new Error('This repository format is not supported (missing or invalid "name" field).');
    }

    if (!Array.isArray(obj.pluginLists)) {
      throw new Error('This repository format is not supported (missing or invalid "pluginLists" array).');
    }

    return {
      name: String(obj.name),
      iconUrl: typeof obj.iconUrl === 'string' ? obj.iconUrl : undefined,
      description: typeof obj.description === 'string' ? obj.description : undefined,
      manifestVersion: typeof obj.manifestVersion === 'number' ? obj.manifestVersion : 1,
      pluginLists: obj.pluginLists.filter((item): item is string => typeof item === 'string' && item.trim().length > 0),
    };
  }

  /**
   * Parses an array of plugins returned from a plugins.json endpoint.
   */
  private parsePluginList(
    data: unknown,
    repoId: string,
    repoName: string,
    listUrl: string
  ): Extension[] {
    if (!Array.isArray(data)) {
      console.warn('[RepositoryManager] Plugin list is not an array:', listUrl);
      return [];
    }

    const extensions: Extension[] = [];

    for (let index = 0; index < data.length; index++) {
      const raw = data[index];
      if (!raw || typeof raw !== 'object') continue;

      const p = raw as Partial<CloudStreamPlugin>;

      // A plugin must at least have a name or internalName to be presentable
      const name = (p.name || p.internalName || '').trim();
      if (!name) continue;

      const internalName = (p.internalName || p.name || `ext_${index}`).trim();
      const downloadUrl = p.url ? resolveUrl(p.url, listUrl) : '';

      const providerManager = ProviderManager.getInstance();
      const isKnownWeb =
        providerManager.isWebCompatible(internalName) ||
        providerManager.isWebCompatible(name);

      // Real capability detection: only web-compatible if an actual web adapter exists
      const isWebCompatible = Boolean(isKnownWeb);
      const compatibilityLabel = isWebCompatible ? 'Web Compatible' : 'Web implementation unavailable';
      const isInstalled = isWebCompatible && (providerManager.isInstalled(internalName) || providerManager.isInstalled(name));
      const webProviderId = isWebCompatible ? (providerManager.normalizeProviderId(internalName) || providerManager.normalizeProviderId(name) || undefined) : undefined;

      const extension: Extension = {
        id: `${repoId}_${internalName}`,
        repositoryId: repoId,
        repositoryName: repoName,
        name,
        internalName,
        version: typeof p.version === 'number' ? p.version : 1,
        apiVersion: typeof p.apiVersion === 'number' ? p.apiVersion : undefined,
        authors: Array.isArray(p.authors) ? p.authors.filter((a): a is string => typeof a === 'string') : [],
        description: typeof p.description === 'string' ? p.description.trim() : '',
        downloadUrl,
        repositoryUrl: typeof p.repositoryUrl === 'string' ? p.repositoryUrl : undefined,
        tvTypes: Array.isArray(p.tvTypes) ? p.tvTypes.filter((t): t is string => typeof t === 'string') : [],
        language: formatLanguage(p.language),
        iconUrl: typeof p.iconUrl === 'string' ? resolveUrl(p.iconUrl, listUrl) : undefined,
        fileSize: typeof p.fileSize === 'number' ? p.fileSize : undefined,
        fileHash: typeof p.fileHash === 'string' ? p.fileHash : undefined,
        status: mapPluginStatus(p.status),
        isWebCompatible,
        compatibilityLabel,
        isInstalled,
        webProviderId,
      };

      extensions.push(extension);
    }

    return extensions;
  }

  /**
   * Deduplicates extensions by internalName or ID
   */
  private deduplicateExtensions(extensions: Extension[]): Extension[] {
    const seen = new Map<string, Extension>();
    for (const ext of extensions) {
      if (!seen.has(ext.id)) {
        seen.set(ext.id, ext);
      } else {
        // Keep the one with higher version if duplicate
        const current = seen.get(ext.id)!;
        if (ext.version > current.version) {
          seen.set(ext.id, ext);
        }
      }
    }
    return Array.from(seen.values());
  }

  /**
   * Helper to fetch JSON with an enforced timeout and CORS handling.
   */
  private async fetchJsonWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`Repository server responded with status HTTP ${response.status} (${response.statusText || 'Error'}).`);
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('This repository returned invalid data (invalid JSON response).');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out. The repository server took too long to respond.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
