/* ===== v0.4.0 · celulares na sala (Firebase Realtime Database por REST) ===== */
/* Estrutura em /salas/{chave}:
   pub  {meta, fase, item}   instrutor escreve, celulares leem (nunca traz a resposta certa antes do resultado)
   res  {pid: {...}}         instrutor escreve o resultado de cada pessoa
   part {pid: {n, c, s, t}}  celular escreve ao entrar
   resp {pid: {idx: {r}}}    celular escreve a resposta (uma vez)
   ass  {pid: "data:image"}  celular escreve a assinatura                                  */
const REGRAS_FIREBASE = `{
  "rules": {
    ".read": false,
    ".write": false,
    "_teste": { ".read": true, ".write": true, ".validate": "newData.isString() && newData.val().length < 40" },
    "salas": {
      "$chave": {
        ".read": true,
        "pub": { ".write": true },
        "res": { ".write": true },
        "part": { "$pid": {
          ".write": true,
          ".validate": "newData.hasChildren(['n']) && newData.child('n').isString() && newData.child('n').val().length <= 60"
        } },
        "resp": { "$pid": { "$idx": {
          ".write": "!data.exists() || !newData.exists()",
          ".validate": "newData.hasChild('r')"
        } } },
        "ass": { "$pid": {
          ".write": "!data.exists() || !newData.exists()",
          ".validate": "newData.isString() && newData.val().length < 40000"
        } }
      }
    }
  }
}`;
const Rede = {
  tm: 0, ouv: null, chave: null, M: null, carregado: false, st: "off", ult: "",
  url() { return String((S && S.cfg && S.cfg.fbUrl) || "").trim().replace(/\/+$/, ""); },
  valida(u) { return /^https:\/\/[a-z0-9.-]+\.(firebaseio\.com|firebasedatabase\.app)$/i.test(u) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(u); },
  ok() { return Rede.valida(Rede.url()); },
  async req(base, metodo, caminho, corpo) {
    const r = await fetch(base + (caminho || "/") + ".json", {method: metodo, headers: corpo !== undefined ? {"content-type": "application/json"} : {}, body: corpo !== undefined ? JSON.stringify(corpo) : undefined});
    if (!r.ok) { const e = new Error("http " + r.status); e.status = r.status; throw e; }
    return r.status === 204 ? null : r.json();
  },
  seg(base) { // pedaço do endereço que vai no link de entrada
    const m = base.match(/^https:\/\/([a-z0-9-]+)-default-rtdb\.firebaseio\.com$/i);
    return m ? "p-" + m[1] : "b-" + btoa(base).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  desseg(sg) {
    if (!sg) return null;
    if (sg.startsWith("p-")) return "https://" + sg.slice(2) + "-default-rtdb.firebaseio.com";
    if (sg.startsWith("b-")) { try { return atob(sg.slice(2).replace(/-/g, "+").replace(/_/g, "/")); } catch(e) { return null; } }
    return null;
  },
  async testar() {
    const u = Rede.url();
    if (!u) return {ok: false, msg: "Cole o endereço do Realtime Database."};
    if (!Rede.valida(u)) return {ok: false, msg: "O endereço deve ser parecido com https://seu-projeto-default-rtdb.firebaseio.com"};
    const marca = "ok-" + Date.now().toString(36);
    try {
      await Rede.req(u, "PUT", "/_teste", marca);
      const v = await Rede.req(u, "GET", "/_teste");
      try { await Rede.req(u, "DELETE", "/_teste"); } catch(e) {}
      return v === marca ? {ok: true, msg: "Conectado. Os celulares já podem entrar nas salas."} : {ok: false, msg: "O banco respondeu, mas não gravou como esperado. Confira as regras."};
    } catch(e) {
      if (e.status === 401 || e.status === 403) return {ok: false, msg: "O Firebase recusou a gravação. Cole as regras do passo 4 e publique."};
      if (e.status === 404) return {ok: false, msg: "Endereço não encontrado. Confira se copiou o endereço do Realtime Database."};
      return {ok: false, msg: "Não alcancei o Firebase. Confira o endereço e a internet."};
    }
  },
  /* ouve um caminho: mantém uma cópia local e chama cb a cada mudança */
  ouvir(base, caminho, cb, st) {
    let M = null, es = null, fechado = false;
    const aplica = (path, data, junta) => {
      const seg = String(path || "/").split("/").filter(Boolean);
      if (!seg.length) { if (junta && data && typeof data === "object") { M = Object.assign(M && typeof M === "object" ? M : {}, data); Object.keys(M).forEach(k => { if (M[k] === null) delete M[k]; }); } else M = data; return; }
      if (!M || typeof M !== "object") M = {};
      let cur = M;
      for (let i = 0; i < seg.length - 1; i++) { if (!cur[seg[i]] || typeof cur[seg[i]] !== "object") cur[seg[i]] = {}; cur = cur[seg[i]]; }
      const k = seg[seg.length - 1];
      if (junta && data && typeof data === "object") { const alvo = cur[k] && typeof cur[k] === "object" ? cur[k] : (cur[k] = {}); Object.keys(data).forEach(x => { if (data[x] === null) delete alvo[x]; else alvo[x] = data[x]; }); }
      else if (data === null) delete cur[k]; else cur[k] = data;
    };
    const abrir = () => {
      if (fechado) return;
      es = new EventSource(base + caminho + ".json");
      es.addEventListener("open", () => st && st("on"));
      es.addEventListener("put", e => { try { const d = JSON.parse(e.data); aplica(d.path, d.data, false); st && st("on"); cb(M); } catch(x) {} });
      es.addEventListener("patch", e => { try { const d = JSON.parse(e.data); aplica(d.path, d.data, true); cb(M); } catch(x) {} });
      es.addEventListener("cancel", () => st && st("erro"));
      es.addEventListener("auth_revoked", () => st && st("erro"));
      es.onerror = () => { st && st(es.readyState === 2 ? "erro" : "off"); };
    };
    abrir();
    return {fechar() { fechado = true; if (es) es.close(); }, valor: () => M};
  },

  /* ---------- lado do instrutor ---------- */
  garantir(s) {
    if (!Rede.ok() || !s || s.estado !== "sala") return;
    if (Rede.chave === s.chave && Rede.ouv) return;
    Rede.parar(); Rede.chave = s.chave; Rede.carregado = false; Rede.st = "off";
    Rede.ouv = Rede.ouvir(Rede.url(), "/salas/" + s.chave, M => { Rede.M = M; Rede.carregado = true; const x = sala(s.id); if (x && x.estado === "sala") ingerir(x, M || {}); }, st => { if (Rede.st !== st) { Rede.st = st; if (rota().v === "sala") pintaRedeSt(); } });
    Rede.enviar(s);
  },
  parar() { if (Rede.ouv) Rede.ouv.fechar(); Rede.ouv = null; Rede.chave = null; Rede.M = null; clearTimeout(Rede.tm); },
  sync(s) { if (!Rede.ok() || !s || s.estado !== "sala") return; Rede.garantir(s); clearTimeout(Rede.tm); Rede.tm = setTimeout(() => Rede.enviar(s), 120); },
  async enviar(s) {
    const x = sala(s.id) || s; if (!Rede.ok() || x.estado !== "sala") return;
    try { await Rede.req(Rede.url(), "PATCH", "/salas/" + x.chave, {pub: pubDe(x), res: resDe(x)}); Rede.ult = ""; }
    catch(e) { Rede.ult = e.status === 401 || e.status === 403 ? "regras" : "rede"; if (rota().v === "sala") pintaRedeSt(); }
  },
  async fechar(s) {
    if (!Rede.ok() || !s.chave) return;
    const M = Rede.chave === s.chave ? (Rede.M || {}) : {}, up = {}, b = "salas/" + s.chave + "/";
    up[b + "pub"] = null; up[b + "res"] = null;
    Object.keys(M.part || {}).forEach(p => { up[b + "part/" + p] = null; });
    Object.keys(M.ass || {}).forEach(p => { up[b + "ass/" + p] = null; });
    Object.entries(M.resp || {}).forEach(([p, rs]) => Object.keys(rs || {}).forEach(i => { up[b + "resp/" + p + "/" + i] = null; }));
    Rede.parar();
    try { await Rede.req(Rede.url(), "PATCH", "", up); } catch(e) {}
  }
};
const lista = v => Array.isArray(v) ? v : (v && typeof v === "object" ? Object.keys(v).sort((a, b) => a - b).map(k => v[k]) : []);
function pubDe(s) {
  const sn = snap(s), f = s.fase;
  return {
    meta: {sid: s.id, titulo: s.titulo, instrutor: s.instrutor || "", meta: s.meta, entrada: !!s.entrada, ranking: !!s.aj.ranking, confirmar: !!s.aj.confirmar, setores: s.setores || [], roster: s.roster || [], nPart: s.part.length, nPerg: sn.nPerg},
    fase: {etapa: f.etapa, idx: f.idx, k: f.idx + ":" + f.t0, dur: f.dur || 0, numPerg: sn.numPerg, totalPerg: sn.totalPerg},
    item: sn.item || null
  };
}
function resDe(s) {
  const f = s.fase; if (f.etapa !== "resultado" && f.etapa !== "podio") return null;
  const c = calc(s), pos = new Map(c.ranking.map((p, k) => [p.id, k + 1])), out = {};
  c.pessoas.forEach(p => {
    const pt = s.part.find(x => x.id === p.id); if (!pt || !pt.real) return;
    const base = {tot: p.pts, np: s.part.length}; if (s.aj.ranking) base.pos = pos.get(p.id);
    if (f.etapa === "resultado") { const r = (s.resp[p.id] || {})[f.idx]; out[p.id] = Object.assign(base, {i: f.idx, ok: r ? (r.ok ? 1 : 0) : -1, pts: r ? r.pts : 0}); }
    else out[p.id] = Object.assign(base, {i: -1, ac: p.ac, nq: c.nq, pct: p.pct, ok: p.pct >= s.meta ? 1 : 0});
  });
  return Object.keys(out).length ? out : null;
}
const limpaNome = n => String(n || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
function respValida(r, it) {
  if (!it || !ehPergunta(it)) return null;
  const n = (it.alternativas || []).length;
  if (it.tipo === "ordenar") { const a = lista(r).map(Number); return a.length === n && a.every(v => Number.isInteger(v) && v >= 0 && v < n) && new Set(a).size === n ? a : null; }
  const v = Number(r); return r !== undefined && r !== null && Number.isInteger(v) && v >= 0 && v < n ? v : null;
}
function ingerir(s, M) {
  let mud = false;
  const partes = M.part && typeof M.part === "object" ? M.part : {};
  Object.entries(partes).forEach(([pid, v]) => {
    if (!v || typeof v.n !== "string" || s.part.some(p => p.id === pid)) return;
    const nome = limpaNome(v.n); if (!nome) return;
    const setor = (s.setores || []).includes(v.s) ? v.s : "";
    s.part.push({id: pid, nome, setor, cor: Number.isInteger(v.c) && v.c >= 0 && v.c < CORES_AV.length ? v.c : undefined, real: true}); mud = true;
  });
  if (Rede.carregado && s.fase.etapa === "espera") { const antes = s.part.length; s.part = s.part.filter(p => !p.real || partes[p.id]); if (s.part.length !== antes) mud = true; }
  Object.entries(M.resp && typeof M.resp === "object" ? M.resp : {}).forEach(([pid, rs]) => {
    const p = s.part.find(x => x.id === pid); if (!p || !rs) return;
    Object.entries(rs).forEach(([idx, o]) => {
      const i = Number(idx); if (!Number.isInteger(i) || (s.resp[pid] || {})[i] || !o) return;
      if (s.fase.etapa !== "pergunta" || s.fase.idx !== i) return;
      const r = respValida(o.r, s.itens[i]); if (r === null) return;
      registrar(s, p, i, r); mud = true;
    });
  });
  Object.entries(M.ass && typeof M.ass === "object" ? M.ass : {}).forEach(([pid, d]) => {
    const p = s.part.find(x => x.id === pid);
    if (p && !p.ass && typeof d === "string" && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(d) && d.length < 40000) { p.ass = d; mud = true; }
  });
  if (mud) mudou(s);
}
function pintaRedeSt() {
  const el = $("#redeSt"); if (!el) return;
  const t = Rede.ult === "regras" ? ["warn", "O Firebase recusou a gravação. Confira as regras em Ajustes."] : Rede.ult === "rede" ? ["warn", "Sem conexão com o Firebase."] : Rede.st === "on" ? ["ok", "Celulares conectados"] : Rede.st === "erro" ? ["bad", "Sem conexão com o Firebase"] : ["warn", "Conectando..."];
  el.className = "chip " + t[0]; el.textContent = t[1];
}

/* ---------- lista de nomes da sala ---------- */
function dlgRoster(s) {
  const d = $("#dlg");
  d.innerHTML = `<form class="dl" data-form="roster" data-id="${s.id}"><header><h2>Lista de nomes</h2><button type="button" class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header>
    <p class="sm mut" style="margin:0">Um nome por linha. Com a lista preenchida, quem entra pelo celular escolhe o próprio nome (basta digitar 3 letras). Sem lista, cada pessoa digita o nome.</p>
    <div class="fd"><label for="ro-t">Nomes</label><textarea class="in ta" id="ro-t" rows="8" maxlength="12000" placeholder="Maria Aparecida Silva&#10;José Wellington">${esc((s.roster || []).join("\n"))}</textarea></div>
    <button class="b p" type="submit">${ic("check")}Salvar lista</button></form>`;
  d.showModal(); const f = $("#ro-t"); if (f) f.focus();
}
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form='roster']"); if (!f) return; e.preventDefault();
  const s = sala(f.dataset.id); if (!s) return;
  const nomes = [...new Set($("#ro-t").value.split("\n").map(limpaNome).filter(Boolean))].slice(0, 300);
  s.roster = nomes; salvar(); $("#dlg").close(); mudou(s); aviso(nomes.length ? nomes.length + " nomes na lista" : "Lista removida");
});
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "roster") { const s = sala(rota().id); if (s) dlgRoster(s); }
  else if (a === "fbtestar") {
    const st = $("#fbSt"); if (st) { st.className = "chip"; st.textContent = "Testando..."; }
    Rede.testar().then(r => { const x = $("#fbSt"); if (x) { x.className = "chip " + (r.ok ? "ok" : "bad"); x.textContent = r.msg; } });
  }
  else if (a === "fbregras") { try { navigator.clipboard.writeText(REGRAS_FIREBASE).then(() => aviso("Regras copiadas"), () => aviso("Não deu para copiar. Selecione o texto e copie.")); } catch(x) { aviso("Não deu para copiar. Selecione o texto e copie."); } }
  else if (a === "rmpart") { const s = sala(rota().id); if (s && s.fase.etapa === "espera") { s.part = s.part.filter(p => p.id !== el.dataset.id); mudou(s); } }
});
