// ROM Suite service worker — offline-first for the static shell.
const VERSION = 'rom-suite-v1'
const CORE = ['./', './index.html', './favicon.svg', './manifest.webmanifest']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(CORE)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(req).then(cached => {
      const fetchAndCache = fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone()
            caches.open(VERSION).then(cache => cache.put(req, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached || caches.match('./index.html'))
      return cached || fetchAndCache
    })
  )
})
