import type { MediaItem, WatchProgress } from '../models/media';
import { WatchProgressStorage } from '../storage/WatchProgressStorage';

type ProgressListener = () => void;

export class WatchProgressManager {
  private static instance: WatchProgressManager;
  private items: WatchProgress[] = [];
  private listeners: Set<ProgressListener> = new Set();

  private constructor() {
    this.items = WatchProgressStorage.loadAll();
  }

  public static getInstance(): WatchProgressManager {
    if (!WatchProgressManager.instance) {
      WatchProgressManager.instance = new WatchProgressManager();
    }
    return WatchProgressManager.instance;
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[WatchProgressManager] Listener error:', err);
      }
    });
  }

  public getAll(): WatchProgress[] {
    return [...this.items];
  }

  public getProgress(mediaId: string): WatchProgress | undefined {
    return this.items.find((p) => p.mediaId === mediaId);
  }

  public recordProgress(media: MediaItem, currentTime: number, duration: number): void {
    if (!media || duration <= 0) return;

    const percentage = Math.min(100, Math.round((currentTime / duration) * 100));
    const completed = percentage >= 95;

    const record: WatchProgress = {
      mediaId: media.id,
      title: media.title,
      thumbnailUrl: media.thumbnailUrl,
      currentTime: Math.floor(currentTime),
      duration: Math.floor(duration),
      percentage,
      lastWatchedAt: Date.now(),
      completed,
      providerId: media.providerId,
    };

    const existingIndex = this.items.findIndex((p) => p.mediaId === media.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = record;
    } else {
      this.items.unshift(record);
    }

    // Sort by last watched descending
    this.items.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);

    WatchProgressStorage.saveProgress(record);
    this.notify();
  }

  public removeProgress(mediaId: string): void {
    this.items = this.items.filter((p) => p.mediaId !== mediaId);
    WatchProgressStorage.removeProgress(mediaId);
    this.notify();
  }
}
