const CACHE = "prayas-ai-v1";
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

// Network-first for map tiles / API calls, cache-first for app shell
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const isShell = ASSETS.some((a) => e.request.url.endsWith(a.replace("./", "")));

  if (isShell) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, resClone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notification handling (for real deployment with a push server)
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
