const CACHE_NAME = "weexey-instant-v3";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/products.html",
  "/product.html",
  "/categories.html",
  "/wishlist.html",
  "/cart.html",
  "/checkout.html",
  "/account.html",
  "/orders.html",
  "/support.html",
  "/about.html",
  "/images/new/li.png",
  "/images/new/dark.png",
  "/css/styles.css",
  "/css/commerce.css",
  "/css/products.css",
  "/css/store-motion.css",
  "/js/store.js",
  "/js/catalog-data.js",
  "/js/commerce.js",
  "/js/store-motion.js",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        CORE_ASSETS.map((url) =>
          fetch(url, { cache: "reload" }).then((response) => {
            if (response.ok) return cache.put(url, response);
          }),
        ),
      ),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Only handle same-origin storefront requests (skip admin and APIs)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/health")) return;

  // For HTML navigation: race network (with fast timeout for weak internet) vs cache
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse =
          (await cache.match(url.pathname)) ||
          (await cache.match(request));

        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(url.pathname, response.clone());
            }
            return response;
          })
          .catch(() => null);

        if (cachedResponse) {
          // Wait up to 320ms for fresh network; if weak internet lags, serve cached HTML immediately
          const timeoutPromise = new Promise((resolve) =>
            setTimeout(() => resolve(null), 320),
          );
          const fastNetwork = await Promise.race([networkPromise, timeoutPromise]);
          return fastNetwork || cachedResponse;
        }

        const netResp = await networkPromise;
        return netResp || Response.error();
      })(),
    );
    return;
  }

  // For same-origin CSS, JS, and brand logos: Stale-While-Revalidate for 0ms load
  if (
    ["style", "script", "font"].includes(request.destination) ||
    url.pathname.startsWith("/images/new/")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request, { ignoreSearch: false }) || await cache.match(url.pathname);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      }),
    );
  }
});
