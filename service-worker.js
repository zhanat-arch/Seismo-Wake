// [ВЕРСИЯ PWA] Меняйте вместе с APP_VERSION в index.html. Новое имя кэша
// заставляет браузер скачать свежие файлы и удалить кэш предыдущей версии.
const CACHE_NAME = "seismo-wake-v1.1.2";
const OFFLINE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./cities.json",
  "./translations-extra.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Кнопка «Обновить приложение» отправляет это сообщение только после того,
// как новый worker полностью установлен. Немедленная активация нужна, чтобы
// пользователь не ждал закрытия всех открытых вкладок старой версии.
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then(cached => {
      return (
        cached ||
        fetch(req).catch(() =>
          caches.match("./index.html")
        )
      );
    })
  );
});
