/* Servidor de teste que imita o Realtime Database (REST + eventos em tempo real). Só para os testes, não é o Firebase. */
const http = require("http");
function criar() {
  let tree = null; const ouvintes = new Set(); const reqs = [];
  const seg = p => p.split("/").filter(Boolean);
  const pega = (t, s) => { for (const k of s) { if (t === null || typeof t !== "object") return null; t = t[k] === undefined ? null : t[k]; } return t; };
  const poe = (s, v) => {
    if (!s.length) { tree = v; return; }
    if (tree === null || typeof tree !== "object") tree = {};
    let cur = tree;
    for (let i = 0; i < s.length - 1; i++) { if (cur[s[i]] === undefined || cur[s[i]] === null || typeof cur[s[i]] !== "object") cur[s[i]] = {}; cur = cur[s[i]]; }
    const k = s[s.length - 1]; if (v === null) delete cur[k]; else cur[k] = v;
    limpa(tree);
  };
  const limpa = t => { if (t && typeof t === "object") { for (const k of Object.keys(t)) { if (t[k] === null) { delete t[k]; continue; } limpa(t[k]); if (t[k] && typeof t[k] === "object" && !Object.keys(t[k]).length) delete t[k]; } } };
  const avisa = () => { ouvintes.forEach(o => { o.res.write("event: put\ndata: " + JSON.stringify({path: "/", data: pega(tree, o.seg)}) + "\n\n"); }); };
  const srv = http.createServer((q, r) => {
    const cors = {"access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,PUT,PATCH,DELETE,OPTIONS"};
    if (q.method === "OPTIONS") { r.writeHead(204, cors); return r.end(); }
    const u = new URL(q.url, "http://x"), caminho = decodeURIComponent(u.pathname).replace(/\.json$/, ""), s = seg(caminho);
    let corpo = ""; q.on("data", d => corpo += d); q.on("end", () => {
      reqs.push(q.method + " " + caminho);
      if (q.method === "GET" && (q.headers.accept || "").includes("text/event-stream")) {
        r.writeHead(200, Object.assign({"content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive"}, cors));
        const o = {res: r, seg: s}; ouvintes.add(o); r.write("event: put\ndata: " + JSON.stringify({path: "/", data: pega(tree, s)}) + "\n\n");
        r.on("close", () => ouvintes.delete(o)); return;
      }
      const j = (c, v) => { r.writeHead(c, Object.assign({"content-type": "application/json"}, cors)); r.end(JSON.stringify(v)); };
      if (q.method === "GET") return j(200, pega(tree, s));
      let v = null; try { v = corpo ? JSON.parse(corpo) : null; } catch(e) { return j(400, {error: "json"}); }
      if (q.method === "PUT") { poe(s, v); avisa(); return j(200, v); }
      if (q.method === "DELETE") { poe(s, null); avisa(); return j(200, null); }
      if (q.method === "PATCH") { Object.keys(v || {}).forEach(k => poe(s.concat(seg(k)), v[k] === undefined ? null : v[k])); avisa(); return j(200, v); }
      j(405, {});
    });
  });
  return new Promise(ok => srv.listen(0, "127.0.0.1", () => ok({url: "http://127.0.0.1:" + srv.address().port, tree: () => tree, reqs, fecha: () => { ouvintes.forEach(o => o.res.end()); srv.close(); }})));
}
module.exports = {criar};
if (require.main === module) criar().then(m => console.log(m.url));
