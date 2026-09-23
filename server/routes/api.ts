import { Router, Request, Response } from 'express';
import { ProviderRegistry } from '../services/ProviderRegistry';

const router = Router();
const registry = ProviderRegistry.getInstance();

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: "Ankit's World Media Backend", timestamp: Date.now() });
});

/**
 * GET /api/providers
 * Returns all registered web-compatible provider adapters
 */
router.get('/providers', (_req: Request, res: Response) => {
  res.json({ providers: registry.listProviders() });
});

/**
 * GET /api/providers/capability?name=...
 * Capability detection endpoint to verify if an extension has a web implementation
 */
router.get('/providers/capability', (req: Request, res: Response) => {
  const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
  if (!name) {
    return res.status(400).json({ error: 'Missing name parameter' });
  }

  const isWebCompatible = registry.isWebCompatible(name);
  const normalizedId = registry.normalizeProviderId(name);

  return res.json({
    identifier: name,
    isWebCompatible,
    providerId: normalizedId,
    status: isWebCompatible ? 'web_compatible' : 'unavailable',
  });
});

/**
 * GET /api/home?provider=...
 * Loads home catalog sections from the selected provider
 */
router.get('/home', async (req: Request, res: Response) => {
  const providerId = typeof req.query.provider === 'string' ? req.query.provider : '';
  const provider = registry.getProvider(providerId);

  if (!provider) {
    return res.status(404).json({ error: `Provider "${providerId}" not found or not web-compatible.` });
  }

  try {
    const sections = await provider.loadHome();
    const allItems = sections.flatMap((s) => s.items);
    const featured = allItems.find((i) => i.isFeatured) || allItems[0] || null;

    return res.json({ provider: provider.id, sections, featured });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load home catalog';
    return res.status(500).json({ error: message });
  }
});

/**
 * GET /api/search?q=...&provider=...
 * Searches the provider for matching titles
 */
router.get('/search', async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const providerId = typeof req.query.provider === 'string' ? req.query.provider : '';
  const provider = registry.getProvider(providerId);

  if (!provider) {
    return res.status(404).json({ error: `Provider "${providerId}" not found or not web-compatible.` });
  }

  if (!provider.supportsSearch) {
    return res.status(400).json({ error: `Search is not supported by ${provider.name}.` });
  }

  try {
    const results = await provider.search(q);
    return res.json({ provider: provider.id, query: q, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    return res.status(500).json({ error: message });
  }
});

/**
 * GET /api/details?id=...&provider=...
 * Fetches media item details
 */
router.get('/details', async (req: Request, res: Response) => {
  const mediaId = typeof req.query.id === 'string' ? req.query.id : '';
  const providerId = typeof req.query.provider === 'string' ? req.query.provider : '';

  if (!mediaId) {
    return res.status(400).json({ error: 'Missing media id parameter' });
  }

  // If providerId supplied, check it; otherwise search across registered providers
  let item = null;
  if (providerId) {
    const provider = registry.getProvider(providerId);
    if (provider) {
      item = await provider.loadDetails(mediaId);
    }
  } else {
    for (const desc of registry.listProviders()) {
      const p = registry.getProvider(desc.id);
      if (p) {
        item = await p.loadDetails(mediaId);
        if (item) break;
      }
    }
  }

  if (!item) {
    return res.status(404).json({ error: 'Media details not found.' });
  }

  return res.json({ item });
});

/**
 * GET /api/sources?id=...&provider=...
 * Resolves normalized playable video source(s)
 */
router.get('/sources', async (req: Request, res: Response) => {
  const mediaId = typeof req.query.id === 'string' ? req.query.id : '';
  const providerId = typeof req.query.provider === 'string' ? req.query.provider : '';

  if (!mediaId) {
    return res.status(400).json({ error: 'Missing media id parameter' });
  }

  let sources: Array<unknown> = [];
  if (providerId) {
    const provider = registry.getProvider(providerId);
    if (provider) {
      sources = await provider.loadSources(mediaId);
    }
  } else {
    for (const desc of registry.listProviders()) {
      const p = registry.getProvider(desc.id);
      if (p) {
        sources = await p.loadSources(mediaId);
        if (sources.length > 0) break;
      }
    }
  }

  return res.json({ mediaId, sources });
});

export default router;
