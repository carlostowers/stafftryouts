var CACHE = "cvvb-turnos-v11";
var CORE = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png",
  "icon-maskable-512.png", "apple-touch-icon.png", "logo.png", "og-image.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(CORE).catch(function () { return; });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k !== CACHE) { return caches.delete(k); }
      return null;
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") { return; }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put("index.html", copy); });
      return res;
    }).catch(function () {
      return caches.match("index.html").then(function (m) {
        return m || caches.match("./");
      });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    if (hit) { return hit; }
    return fetch(req).then(function (res) {
      if (res && (res.status === 200 || res.type === "opaque")) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () { return hit; });
  }));
});
