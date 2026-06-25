// Service worker for SB Sommar PWA.
// Provides offline caching: network-first for HTML and events.json,
// cache-first for static assets (CSS, JS, images).
// The PRE_CACHE_URLS list is injected at build time — see build.js.

const CACHE_NAME = 'sb-sommar-v6';

// Pages and assets to pre-cache on install.
// The build replaces the placeholder below with the full list of URLs.
const PRE_CACHE_URLS = [
  /* __PRE_CACHE_URLS__ */
];

// Paths that must never be cached (always fetched from network).
const NO_CACHE_PATTERNS = [
  '/add-event',
  '/edit-event',
  '/delete-event',
  '/verify-admin',
  '/api/',
];

// ── Install: pre-cache all site assets ────────────────────────────────────────

self.addEventListener('install', (event) => {
  // Activate the new worker immediately, bypassing the waiting state.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // `cache: 'reload'` bypasses the browser's HTTP cache for each fetch,
      // so a stale asset cached with a long max-age can't poison the SW cache.
      cache.addAll(
        PRE_CACHE_URLS.map((u) => new Request(u, { cache: 'reload' })),
      ),
    ),
  );
});

// ── Activate: remove old caches and take over existing clients ──────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// ── Fetch: route requests to network or cache ───────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore non-HTTP(S) schemes (e.g. chrome-extension://).
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache API calls or form-submission endpoints.
  if (NO_CACHE_PATTERNS.some((p) => url.pathname.includes(p))) return;

  // version.json: never cached. live.html polls it every 60 s to detect new
  // deploys and must always hit the network (the client also sends a
  // cache-busting query and `cache: 'no-store'`). Routing it through a cache
  // strategy would either serve a stale version or accumulate one cache entry
  // per poll.
  if (url.pathname.endsWith('version.json')) return;

  // events.json: network-first so offline still shows schedule data.
  if (url.pathname.endsWith('events.json')) {
    event.respondWith(networkFirstThenCache(request));
    return;
  }

  // Navigation requests (HTML): network-first, offline fallback page.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Static assets (CSS, JS, images): cache-first, network fallback.
  event.respondWith(cacheFirstThenNetwork(request));
});

// ── Strategy helpers ────────────────────────────────────────────────────────

async function networkFirstThenCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try the specific page from cache first.
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Fall back to the offline page.
    const offline = await caches.match('/offline.html');
    return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirstThenNetwork(request) {
  // Exact match only — a cache-busted URL (style.css?v=newHash) must
  // not satisfy from an older entry keyed at a different query string.
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback: try a query-stringless cache entry (e.g. pre-cached
    // `/style.css` when the request was `/style.css?v=<hash>`).
    const fallback = await caches.match(request, { ignoreSearch: true });
    return fallback || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
