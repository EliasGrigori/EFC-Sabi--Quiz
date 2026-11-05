/* Sabiá · funciona sem internet: guarda a casca e as fontes na primeira visita */
const V = "sabia-1.0.1";
const CASCA = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CASCA)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return; /* Firebase e fontes passam direto, sem cache */
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => {
    const rede = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
    return hit || rede;
  }));
});
