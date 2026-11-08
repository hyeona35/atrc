// Event Horizon PWA Service Worker (Installable App & Offline Shell Fallback)
const CACHE_NAME = "event-horizon-v2";
const SHELL_ASSETS = [
  "/",
  "/x-feed",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)))
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) {
    return;
  }

  const url = new URL(req.url);
  // Never cache dynamic API routes, auth cookies, or dev HMR streams
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (
          networkRes &&
          networkRes.ok &&
          url.origin === self.location.origin &&
          (req.mode === "navigate" ||
            /\.(png|ico|svg|woff2?)$/i.test(url.pathname))
        ) {
          const clone = networkRes.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(req, clone))
            .catch(() => {});
        }
        return networkRes;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const fallbackRoot = await caches.match("/");
          if (fallbackRoot) return fallbackRoot;
        }
        return Response.error();
      })
  );
});
