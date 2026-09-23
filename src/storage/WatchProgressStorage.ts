import type { WatchProgress } from '../models/media';

const STORAGE_KEY = 'ankits_world_watch_progress_v1';

export class WatchProgressStorage {
  public static loadAll(): WatchProgress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
    } catch (err) {
      console.error('[WatchProgressStorage] Failed to read watch progress:', err);
      return [];
    }
  }

  public static getProgress(mediaId: string): WatchProgress | undefined {
    const list = this.loadAll();
    return list.find((p) => p.mediaId === mediaId);
  }

  public static saveProgress(progress: WatchProgress): void {
    try {
      const list = this.loadAll();
      const index = list.findIndex((p) => p.mediaId === progress.mediaId);
      if (index >= 0) {
        list[index] = progress;
      } else {
        list.unshift(progress);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('[WatchProgressStorage] Failed to save watch progress:', err);
    }
  }

  public static removeProgress(mediaId: string): void {
    try {
      const list = this.loadAll().filter((p) => p.mediaId !== mediaId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('[WatchProgressStorage] Failed to remove watch progress:', err);
    }
  }
}
