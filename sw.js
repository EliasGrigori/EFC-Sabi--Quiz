/* Sabiá · funciona sem internet: guarda a casca e as fontes na primeira visita */
const V = "sabia-1.5.0";
const CASCA = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CASCA)
  .then(() => c.addAll(["lib/pdfjs/pdf.min.js", "lib/pdfjs/pdf.worker.min.js"]).catch(() => {}))   /* v1.5.0: leitor de PDF do Apresentar */
  .then(() => fetch("bon/lista.json").then(r => r.json()).then(l => c.addAll(l.map(x => "bon/" + x))).catch(() => {}))   /* bonecos (v1.4.0): guardados para funcionar sem internet */
).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return; /* Firebase e fontes passam direto, sem cache */
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => {
    const rede = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
    return hit || rede;
  }));
});
