const STORAGE_KEY = 'ankits_world_installed_providers_v1';

export class InstalledProvidersStorage {
  public static loadInstalled(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error('[InstalledProvidersStorage] Failed to read installed providers:', err);
      return [];
    }
  }

  public static isInstalled(providerId: string): boolean {
    const list = this.loadInstalled();
    return list.includes(providerId);
  }

  public static install(providerId: string): void {
    try {
      const list = this.loadInstalled();
      if (!list.includes(providerId)) {
        list.push(providerId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    } catch (err) {
      console.error('[InstalledProvidersStorage] Failed to save installed provider:', err);
    }
  }

  public static uninstall(providerId: string): void {
    try {
      const list = this.loadInstalled().filter((id) => id !== providerId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('[InstalledProvidersStorage] Failed to remove installed provider:', err);
    }
  }

  public static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[InstalledProvidersStorage] Failed to clear installed providers:', err);
    }
  }
}
