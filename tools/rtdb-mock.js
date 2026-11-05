/* Servidor de teste que imita o Realtime Database (REST + eventos em tempo real). Só para os testes, não é o Firebase. */
const http = require("http");
function criar(opc) {
  opc = opc || {};
  const SIM = require("./rules-sim.js");
  let regras = opc.regras || (process.env.SABIA_REGRAS ? JSON.parse(require("fs").readFileSync(process.env.SABIA_REGRAS === "1" ? [__dirname + "/docs/firebase-rules.json", __dirname + "/../docs/firebase-rules.json"].find(x => require("fs").existsSync(x)) : process.env.SABIA_REGRAS, "utf8")) : null);
  const negadas = [];
  if (regras) process.on("exit", () => { if (negadas.length) console.error("REGRAS NEGARAM " + negadas.length + ":\n  " + negadas.slice(0, 12).join("\n  ")); });
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
      if (regras && q.method === "GET" && !(q.headers.accept || "").includes("text/event-stream") && !SIM.podeLer(regras, caminho, tree)) { negadas.push("GET " + caminho); return j(401, {error: "Permission denied"}); }
      if (q.method === "GET") return j(200, pega(tree, s));
      let v = null; try { v = corpo ? JSON.parse(corpo) : null; } catch(e) { return j(400, {error: "json"}); }
      const agoraSv = x => { if (x && typeof x === "object") { if (Object.keys(x).length === 1 && x[".sv"] === "timestamp") return Date.now(); for (const k of Object.keys(x)) x[k] = agoraSv(x[k]); } return x; };
      const tenta = (cam, val) => { if (!regras) { poe(seg(cam), val === null ? null : agoraSv(val)); return true; } const r = SIM.gravar(regras, tree, cam, val); if (!r.ok) { negadas.push(q.method + " " + cam + " :: " + r.motivo); return false; } tree = r.arvore; return true; };
      if (q.method === "PUT") { if (!tenta(caminho, v)) return j(401, {error: "Permission denied"}); avisa(); return j(200, v); }
      if (q.method === "DELETE") { if (!tenta(caminho, null)) return j(401, {error: "Permission denied"}); avisa(); return j(200, null); }
      if (q.method === "PATCH") { for (const k of Object.keys(v || {})) { if (!tenta("/" + s.concat(seg(k)).join("/"), v[k] === undefined ? null : v[k])) return j(401, {error: "Permission denied"}); } avisa(); return j(200, v); }
      j(405, {});
    });
  });
  return new Promise(ok => srv.listen(0, "127.0.0.1", () => ok({url: "http://127.0.0.1:" + srv.address().port, tree: () => tree, reqs, negadas, regras: () => regras, fecha: () => { ouvintes.forEach(o => o.res.end()); srv.close(); }})));
}
module.exports = {criar};
if (require.main === module) criar().then(m => console.log(m.url));
