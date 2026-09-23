import type { IWebProvider } from '../providers/IWebProvider';
import { OpenCinemaProvider } from '../providers/OpenCinemaProvider';
import { YouTubeProvider } from '../providers/YouTubeProvider';

export interface ProviderDescriptor {
  id: string;
  name: string;
  version: string;
  description?: string;
  supportedTypes: string[];
  supportsSearch: boolean;
  supportsDownload: boolean;
}

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, IWebProvider> = new Map();

  private constructor() {
    this.register(new OpenCinemaProvider());
    this.register(new YouTubeProvider());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(provider: IWebProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Normalizes arbitrary extension names or internal names to match a registered web provider ID
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
   * Real capability detection: returns true ONLY when an actual web adapter exists
   */
  public isWebCompatible(identifier: string): boolean {
    return this.normalizeProviderId(identifier) !== null;
  }

  public getProvider(idOrName: string): IWebProvider | undefined {
    const id = this.normalizeProviderId(idOrName) || idOrName;
    return this.providers.get(id);
  }

  public listProviders(): ProviderDescriptor[] {
    const list: ProviderDescriptor[] = [];
    this.providers.forEach((p) => {
      list.push({
        id: p.id,
        name: p.name,
        version: p.version,
        description: p.description,
        supportedTypes: p.supportedTypes,
        supportsSearch: p.supportsSearch,
        supportsDownload: p.supportsDownload,
      });
    });
    return list;
  }
}
