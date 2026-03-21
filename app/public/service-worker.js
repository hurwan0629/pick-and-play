self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open('app-v1').then((cache) => {
            return cache.addAll(['/','/offline.html'])
        })
    )
})

self.addEventListener("fetch", (event) => {
    event.respondWith(
        cache.match(event.request).then((cached) => cached || fetch(event.request))
    )
})