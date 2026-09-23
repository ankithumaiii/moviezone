/**
 * Raw manifest structure received from CloudStream-compatible repository index
 */
export interface CloudStreamManifest {
  name: string;
  iconUrl?: string | null;
  description?: string | null;
  manifestVersion: number;
  pluginLists: string[];
}

/**
 * Raw plugin item received from a plugin list JSON
 */
export interface CloudStreamPlugin {
  url: string;
  name: string;
  internalName?: string;
  version?: number;
  apiVersion?: number;
  authors?: string[];
  description?: string | null;
  repositoryUrl?: string | null;
  tvTypes?: string[] | null;
  language?: string | null;
  iconUrl?: string | null;
  fileSize?: number | null;
  fileHash?: string | null;
  status?: number; // 0: Down, 1: Ok, 2: Slow, 3: Beta only
  isWebCompatible?: boolean;
}

export type ExtensionStatus = 'ok' | 'down' | 'slow' | 'beta' | 'unknown';
export type ExtensionCompatibility = 'web_compatible' | 'unavailable';

/**
 * Normalized extension representation in Ankit's World
 */
export interface Extension {
  id: string;
  repositoryId: string;
  repositoryName: string;
  name: string;
  internalName: string;
  version: number;
  apiVersion?: number;
  authors: string[];
  description: string;
  downloadUrl: string;
  repositoryUrl?: string;
  tvTypes: string[];
  language: string;
  iconUrl?: string;
  fileSize?: number;
  fileHash?: string;
  status: ExtensionStatus;
  isWebCompatible: boolean;
  compatibilityLabel: string;
  isInstalled?: boolean;
  webProviderId?: string;
}

export type RepositorySyncStatus = 'idle' | 'syncing' | 'error';

/**
 * Fully parsed and persisted repository object
 */
export interface Repository {
  id: string;
  url: string;
  name: string;
  description: string;
  iconUrl?: string;
  manifestVersion: number;
  pluginLists: string[];
  extensions: Extension[];
  addedAt: number;
  lastSyncedAt: number;
  status: RepositorySyncStatus;
  error?: string;
}

export interface AddRepositoryOptions {
  url: string;
}
