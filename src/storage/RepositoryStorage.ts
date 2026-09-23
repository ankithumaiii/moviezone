import type { Repository } from '../models/repository';

const STORAGE_KEY = 'ankits_world_repositories_v1';

export class RepositoryStorage {
  /**
   * Retrieves all persisted repositories from local storage
   */
  public static loadRepositories(): Repository[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error('[RepositoryStorage] Failed to read repositories from localStorage:', err);
      return [];
    }
  }

  /**
   * Saves the entire list of repositories to local storage
   */
  public static saveRepositories(repositories: Repository[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(repositories));
    } catch (err) {
      console.error('[RepositoryStorage] Failed to save repositories to localStorage:', err);
    }
  }

  /**
   * Upserts a single repository into storage
   */
  public static saveRepository(repository: Repository): void {
    const list = this.loadRepositories();
    const index = list.findIndex((r) => r.id === repository.id);
    if (index >= 0) {
      list[index] = repository;
    } else {
      list.push(repository);
    }
    this.saveRepositories(list);
  }

  /**
   * Removes a repository by its unique identifier
   */
  public static removeRepository(repositoryId: string): void {
    const list = this.loadRepositories().filter((r) => r.id !== repositoryId);
    this.saveRepositories(list);
  }
}
