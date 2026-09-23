import type { Extension, ExtensionStatus } from '../models/repository';
import { RepositoryManager } from './RepositoryManager';

export interface ExtensionFilterOptions {
  repositoryId?: string;
  query?: string;
  language?: string;
  tvType?: string;
  status?: ExtensionStatus;
}

export class ExtensionManager {
  private static instance: ExtensionManager;
  private repositoryManager: RepositoryManager;

  private constructor() {
    this.repositoryManager = RepositoryManager.getInstance();
  }

  public static getInstance(): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
    }
    return ExtensionManager.instance;
  }

  /**
   * Retrieves all extensions discovered across all repositories
   */
  public getAllExtensions(): Extension[] {
    const repos = this.repositoryManager.getRepositories();
    const all: Extension[] = [];
    for (const repo of repos) {
      all.push(...repo.extensions);
    }
    return all;
  }

  /**
   * Retrieves extensions belonging to a specific repository
   */
  public getExtensionsByRepository(repoId: string): Extension[] {
    const repo = this.repositoryManager.getRepository(repoId);
    return repo ? [...repo.extensions] : [];
  }

  /**
   * Finds an extension by its unique ID
   */
  public getExtensionById(extensionId: string): Extension | undefined {
    const all = this.getAllExtensions();
    return all.find((e) => e.id === extensionId);
  }

  /**
   * Filters and searches extensions dynamically
   */
  public filterExtensions(options: ExtensionFilterOptions): Extension[] {
    let list = options.repositoryId
      ? this.getExtensionsByRepository(options.repositoryId)
      : this.getAllExtensions();

    if (options.query && options.query.trim()) {
      const q = options.query.trim().toLowerCase();
      list = list.filter(
        (ext) =>
          ext.name.toLowerCase().includes(q) ||
          ext.internalName.toLowerCase().includes(q) ||
          ext.description.toLowerCase().includes(q) ||
          ext.authors.some((author) => author.toLowerCase().includes(q))
      );
    }

    if (options.language && options.language !== 'ALL') {
      list = list.filter((ext) => ext.language === options.language);
    }

    if (options.tvType && options.tvType !== 'ALL') {
      list = list.filter((ext) => ext.tvTypes.includes(options.tvType!));
    }

    if (options.status && options.status !== 'unknown') {
      list = list.filter((ext) => ext.status === options.status);
    }

    return list;
  }

  /**
   * Extracts distinct available languages for filter chips
   */
  public getAvailableLanguages(repoId?: string): string[] {
    const list = repoId ? this.getExtensionsByRepository(repoId) : this.getAllExtensions();
    const set = new Set<string>();
    for (const item of list) {
      if (item.language) set.add(item.language);
    }
    return Array.from(set).sort();
  }

  /**
   * Extracts distinct available TV types for filter chips
   */
  public getAvailableTvTypes(repoId?: string): string[] {
    const list = repoId ? this.getExtensionsByRepository(repoId) : this.getAllExtensions();
    const set = new Set<string>();
    for (const item of list) {
      for (const t of item.tvTypes) {
        if (t) set.add(t);
      }
    }
    return Array.from(set).sort();
  }
}
