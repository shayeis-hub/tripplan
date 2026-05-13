// ── טיולון Service Worker ─────────────────────────────────────────
const CACHE = "tulon-v1";

// נכסים שנרצה לשמור ב-cache מיד בהתקנה
const PRECACHE = [
  "/",
  "/login",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// ── Install: שמירת נכסי בסיס ───────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: ניקוי cache ישן ──────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: Network first, cache fallback ──────────────────────────
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // API calls — תמיד דרך הרשת, לא cache
  if (url.pathname.startsWith("/api/")) return;

  // נכסים סטטיים (_next/static) — cache first
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // ניווט (דפים HTML) — network first, fallback לcache, אחרי זה offline
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }
});

// ── Push Notifications ────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "טיולון", body: "התראה חדשה", url: "/" };
  try {
    data = e.data?.json() ?? data;
  } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
      dir: "rtl",
      vibrate: [100, 50, 100],
    })
  );
});

// ── Notification click: פתיחת האפליקציה ──────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        const existing = wins.find((w) => w.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(url);
        } else {
          clients.openWindow(url);
        }
      })
  );
});
