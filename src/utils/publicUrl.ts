export const CANONICAL_PUBLIC_LIVE_URL = 'https://ais-pre-vljjlbev7xohu3c5pmg7v6-345055769930.asia-east1.run.app';

/**
 * Returns the reliable, universal public live origin for sharing, Google SEO, sitemaps, and external access.
 * Automatically resolves 'ais-dev' to the open 'ais-pre' public URL so that 403 Forbidden is prevented.
 */
export function getPublicLiveOrigin(): string {
  if (typeof window !== 'undefined') {
    try {
      const origin = window.location.origin;
      if (origin && origin !== 'null' && origin.startsWith('http')) {
        if (origin.includes('-dev-')) {
          return origin.replace('-dev-', '-pre-');
        }
        return origin;
      }
    } catch (e) {
      // Ignore and fallback
    }
  }
  return CANONICAL_PUBLIC_LIVE_URL;
}
