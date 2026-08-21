const CACHE = "prayas-ai-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for static map tiles, cache-first for PWA app shell, network-only bypass for /api/ and POST requests
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Bypass cache completely for POST/PUT requests and serverless API endpoints
  if (e.request.method !== "GET" || url.pathname.includes("/api/") || url.pathname.includes("/.netlify/functions/")) {
    e.respondWith(fetch(e.request));
    return;
  }

  const isShell = ASSETS.some((a) => e.request.url.endsWith(a.replace("./", "")));

  if (isShell) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
    return;
  }

  // Network-first policy for Leaflet map tiles and other third-party GET assets
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, resClone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notification handling
self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : { title: "Prayas AI", body: "New alert in your area" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "icons/icon.svg",
      badge: "icons/icon.svg",
      vibrate: [200, 100, 200]
    })
  );
});
