const cacheName = "DEKSINA-APP";

// instalacija service worker-a
self.addEventListener("install", (event) => {
  console.log("service worker has been installed");
  event.waitUntil(
    (async () => {
      // console.log("event", event)
      const cache = await caches.open(cacheName);
      // console.log("[Service Worker] Caching all: app shell and content");
    })()
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});


self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    try{   
      const cache = await caches.open(cacheName)

      const response = await fetch(e.request)
      
      let myClone = response.clone()
      const newHeader = new Headers(myClone.headers);
      newHeader.set("cache", "true");
      const newResponse = new Response(myClone.body, {
        headers: newHeader
      })
      cache.put(e.request, newResponse)
      return response
    }

    catch(error){
      const r = await caches.match(e.request)
      
      if(r) {
        const client = await clients.get(e.clientId);
        client.postMessage({
          msg: "Hey I just got a fetch from you!",
          url: e.request.url,
        });
        return r
      }      
    }
  })());
});
