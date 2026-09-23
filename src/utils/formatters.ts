import type { ExtensionStatus } from '../models/repository';

/**
 * Formats byte counts into clean human-readable sizes (KB, MB, GB).
 */
export function formatBytes(bytes?: number | null, decimals = 1): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes <= 0) {
    return 'Unknown size';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);
  const value = parseFloat((bytes / Math.pow(k, index)).toFixed(dm));

  return `${value} ${sizes[index]}`;
}

/**
 * Maps CloudStream status integers to human status types
 * 0: Down
 * 1: Ok
 * 2: Slow
 * 3: Beta only
 */
export function mapPluginStatus(status?: number | null): ExtensionStatus {
  switch (status) {
    case 0:
      return 'down';
    case 1:
      return 'ok';
    case 2:
      return 'slow';
    case 3:
      return 'beta';
    default:
      return 'unknown';
  }
}

/**
 * Formats language code to uppercase tag or standard display
 */
export function formatLanguage(lang?: string | null): string {
  if (!lang || !lang.trim()) return 'MULTI';
  return lang.trim().toUpperCase();
}

/**
 * Formats unix timestamp into a relative or clean readable date
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Never';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
