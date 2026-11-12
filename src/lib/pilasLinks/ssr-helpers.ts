/**
 * Extrae el parámetro crudo `?d=` sin convertir signos `+` literales en espacio,
 * evitando corrupción en enlaces legacy Base64 compartidos sin `%2B`.
 */
export function extractRawDFromUrl(url: URL): string | null {
  const rawSearch = url.search;
  if (rawSearch) {
    const match = rawSearch.match(/(?:^\?|&)d=([^&#]*)/);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }
  const fallback = url.searchParams.get('d');
  return fallback && fallback.trim() ? fallback : null;
}

export function applyUniversalLinkResponseHeaders(
  headers: Headers,
  cacheLong: boolean,
): void {
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set(
    'Permissions-Policy',
    'camera=(), geolocation=(), microphone=(), focus-without-user-activation=()',
  );
  headers.set(
    'Cache-Control',
    cacheLong
      ? 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
      : 'public, max-age=60',
  );
}

