declare var self: ServiceWorkerGlobalScope
export {} // avoids 'self' redeclaration error

const EXPECTED_CACHES = ['app-v1']
const OFFLINE_URL = '/'

const iconSizes = [16, 24, 32, 48, 64, 96, 128, 192, 256, 512, 1024, 2048]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const allCaches = await caches.keys()
      const toDelete = allCaches.filter((cache) => !EXPECTED_CACHES.includes(cache))
      await Promise.all(toDelete.map((cache) => caches.delete(cache)))

      const cache = await caches.open('app-v1')
      await cache.addAll([
        new Request(OFFLINE_URL, { cache: 'reload' }),
        ...iconSizes.map((size) => `/icon/${size}.png`),
        '/manifest.json',
        '/WorkSans-alphanum.woff2',
      ])
    })()
  )
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.origin === location.origin && url.pathname === OFFLINE_URL) {
    event.respondWith(caches.match(OFFLINE_URL) as Promise<Response>)
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  )
})
