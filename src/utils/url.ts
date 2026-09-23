/**
 * Validates that an input string is a syntactically valid HTTP or HTTPS URL.
 */
export function isValidHttpUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL by trimming whitespace, lowercasing the scheme/hostname,
 * and removing trailing slashes for stable matching.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    // remove trailing slash from pathname if length > 1
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.href;
  } catch {
    return trimmed;
  }
}

/**
 * Resolves a potentially relative URL against a base repository URL.
 * Handles both absolute URLs and relative paths.
 */
export function resolveUrl(relativeOrAbsolute: string, baseUrl: string): string {
  const trimmed = relativeOrAbsolute.trim();
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return trimmed;
  }
}

/**
 * Generates a stable deterministic ID from a URL using a simple fast hash.
 */
export function generateRepoId(url: string): string {
  const normalized = normalizeUrl(url);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positive = Math.abs(hash).toString(36);
  return `repo_${positive}_${normalized.length.toString(36)}`;
}
