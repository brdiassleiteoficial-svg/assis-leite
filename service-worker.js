const CACHE_NAME = "assis-leite-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALAÇÃO DO APLICATIVO

self.addEventListener("install", function(event) {

  event.waitUntil(

    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })

  );

  self.skipWaiting();

});

// ATIVAÇÃO E LIMPEZA DE CACHES ANTIGOS

self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches.keys().then(function(nomes) {

      return Promise.all(

        nomes.map(function(nome) {

          if (nome !== CACHE_NAME) {
            return caches.delete(nome);
          }

        })

      );

    })

  );

  self.clients.claim();

});

// FUNCIONAMENTO ONLINE E OFFLINE

self.addEventListener("fetch", function(event) {

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(

    fetch(event.request).then(function(response) {

      if (response && response.ok) {

        const copia = response.clone();

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copia);
        });

      }

      return response;

    }).catch(function() {

      return caches.match(event.request).then(function(response) {

        return response || caches.match("./index.html");

      });

    })

  );

});