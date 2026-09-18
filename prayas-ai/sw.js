const CACHE = "prayas-ai-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./expert.html",
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

// Network-first for HTML/navigation requests, bypass for API, cache fallback for offline
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Bypass cache completely for POST/PUT requests and serverless API endpoints
  if (e.request.method !== "GET" || url.pathname.includes("/api/") || url.pathname.includes("/.netlify/functions/")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Network-first policy for HTML pages and app shell so users always see the latest deployed updates online
  const isHtml = e.request.mode === "navigate" ||
                 e.request.destination === "document" ||
                 url.pathname.endsWith(".html") ||
                 url.pathname === "/" ||
                 url.pathname.endsWith("/expert") ||
                 url.pathname.endsWith("/kavk");

  if (isHtml) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, resClone)).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          return caches.match(e.request).then((cached) => {
            if (cached) return cached;
            if (url.pathname.includes("expert") || url.pathname.includes("kavk")) {
              return caches.match("./expert.html");
            }
            return caches.match("./index.html");
          });
        })
    );
    return;
  }

  // Network-first with cache fallback for static assets
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
