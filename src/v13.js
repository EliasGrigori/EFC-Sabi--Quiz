/* ===== v1.3.0 · material de apoio com capítulos ligados às explicações (PPTX, PDF ou HTML, neste aparelho) ===== */
/* O arquivo fica no IndexedDB "sabia-material" (chave = id do treinamento); no estado vai só t.material = {nome, tipo, bytes, caps:[{t,p}]}.
   PPTX: os slides viram capítulos e aparecem como texto + imagens (o arquivo é lido aqui, sem enviar a lugar nenhum).
   PDF: abre no leitor do navegador na página do capítulo. HTML: abre o documento inteiro, sem scripts. */
const MAT_MAX = 300 * 1024 * 1024, MAT_MAX_HTML = 30 * 1024 * 1024;   // arquivos grandes ficam só neste aparelho
const MAT = {aberto: null, urls: [], pn: null};
const MAT_TIPOS = {pptx: "PPTX", pdf: "PDF", html: "HTML"};

/* ---------- guardar o arquivo (IndexedDB à parte, para não pesar no estado) ---------- */
function matDb() {
  return new Promise((ok, no) => { try { const r = indexedDB.open("sabia-material", 1); r.onupgradeneeded = () => r.result.createObjectStore("arq"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } });
}
async function matOp(modo, fn) {
  const db = await matDb();
  return new Promise((ok, no) => { const tx = db.transaction("arq", modo), st = tx.objectStore("arq"); const r = fn(st); tx.oncomplete = () => { db.close(); ok(r && r.result); }; tx.onerror = tx.onabort = () => { db.close(); no(tx.error); }; });
}
const matGravar = (id, v) => matOp("readwrite", s => s.put(v, id));
const matLer = id => matOp("readonly", s => s.get(id));
const matApagar = id => matOp("readwrite", s => s.delete(id));
/* cópia do treinamento leva o arquivo junto; se o navegador não deixar, a cópia fica sem material */
async function matCopiar(de, c) { try { const r = await matLer(de); if (!r) throw 0; await matGravar(c.id, r); } catch (e) { delete c.material; c.itens.forEach(i => { delete i.cap; }); salvar(); } }
async function matLimpaOrfaos() {
  if (!S || !Array.isArray(S.treinamentos) || !S.treinamentos.length) return;
  try { const ks = await matOp("readonly", s => s.getAllKeys()); for (const k of ks || []) if (!S.treinamentos.some(t => t.id === k && t.material)) await matApagar(k); } catch (e) {}
}
setTimeout(matLimpaOrfaos, 4000);

/* ---------- ler PPTX (zip + XML) ---------- */
async function zipLer(blob) {
  const tam = blob.size, ini = Math.max(0, tam - 70000), cauda = new Uint8Array(await blob.slice(ini).arrayBuffer()), dc = new DataView(cauda.buffer);
  let e = cauda.length - 22; while (e >= 0 && dc.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error("O arquivo não é um zip válido.");
  const n = dc.getUint16(e + 10, true), cdTam = dc.getUint32(e + 12, true), cdOff = dc.getUint32(e + 16, true);
  if (cdOff === 0xFFFFFFFF || cdTam === 0xFFFFFFFF) throw new Error("PPTX grande demais para este leitor. Exporte como PDF.");
  const cd = new Uint8Array(await blob.slice(cdOff, cdOff + cdTam).arrayBuffer()), dv = new DataView(cd.buffer); let off = 0; const idx = {};
  for (let i = 0; i < n; i++) {
    if (off + 46 > cd.length || dv.getUint32(off, true) !== 0x02014b50) break;
    const met = dv.getUint16(off + 10, true), csz = dv.getUint32(off + 20, true), nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true), lh = dv.getUint32(off + 42, true);
    idx[new TextDecoder().decode(cd.subarray(off + 46, off + 46 + nl))] = {met, csz, lh}; off += 46 + nl + el + cl;
  }
  const bytes = async nome => {
    const z = idx[nome]; if (!z) return null;
    const h = new DataView(await blob.slice(z.lh, z.lh + 30).arrayBuffer()), ini2 = z.lh + 30 + h.getUint16(26, true) + h.getUint16(28, true), raw = blob.slice(ini2, ini2 + z.csz);
    if (z.met === 0) return new Uint8Array(await raw.arrayBuffer());
    if (z.met !== 8 || typeof DecompressionStream === "undefined") throw new Error("Este navegador não consegue abrir o PPTX. Use o PDF.");
    return new Uint8Array(await new Response(raw.stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
  };
  return {nomes: Object.keys(idx), bytes, texto: async n => { const b = await bytes(n); return b ? new TextDecoder().decode(b) : null; }};
}
const xmlDoc = s => new DOMParser().parseFromString(s, "application/xml");
const filhos = (n, nome) => Array.from(n.getElementsByTagNameNS("*", nome));
const caminhoRel = (base, alvo) => { if (alvo.startsWith("/")) return alvo.slice(1); const p = base.split("/"); p.pop(); alvo.split("/").forEach(x => { if (x === "..") p.pop(); else if (x !== ".") p.push(x); }); return p.join("/"); };
const MIME_IMG = {png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp", bmp: "image/bmp"};
async function pptxLer(blob, comImagens) {
  const z = await zipLer(blob), pres = await z.texto("ppt/presentation.xml"); if (!pres) throw new Error("Não achei os slides neste arquivo.");
  const rels = {}; filhos(xmlDoc(await z.texto("ppt/_rels/presentation.xml.rels") || "<r/>"), "Relationship").forEach(r => { rels[r.getAttribute("Id")] = r.getAttribute("Target"); });
  const ids = filhos(xmlDoc(pres), "sldId").map(x => x.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id") || x.getAttribute("r:id"));
  const slides = [];
  for (const rid of ids) {
    const alvo = rels[rid]; if (!alvo) continue; const cam = caminhoRel("ppt/presentation.xml", alvo), xml = await z.texto(cam); if (!xml) continue;
    const d = xmlDoc(xml), sl = {titulo: "", linhas: [], imgs: []};
    filhos(d, "sp").forEach(sp => {
      const ph = filhos(sp, "ph")[0], tipo = ph && ph.getAttribute("type"), ehTit = tipo === "title" || tipo === "ctrTitle";
      filhos(sp, "p").forEach(p => {
        const t = filhos(p, "t").map(x => x.textContent).join("").replace(/\s+/g, " ").trim(); if (!t) return;
        if (ehTit && !sl.titulo) sl.titulo = t; else sl.linhas.push({t, n: Number((filhos(p, "pPr")[0] || {getAttribute: () => 0}).getAttribute("lvl")) || 0});
      });
    });
    filhos(d, "tbl").forEach(tb => filhos(tb, "tr").forEach(tr => { const t = filhos(tr, "tc").map(c => filhos(c, "t").map(x => x.textContent).join("").trim()).filter(Boolean).join("  |  "); if (t) sl.linhas.push({t, n: 0}); }));
    if (comImagens) {
      const relS = {}; const rx = await z.texto(caminhoRel(cam, "_rels/" + cam.split("/").pop() + ".rels")); if (rx) filhos(xmlDoc(rx), "Relationship").forEach(r => { relS[r.getAttribute("Id")] = r.getAttribute("Target"); });
      for (const bl of filhos(d, "blip")) {
        const emb = bl.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed") || bl.getAttribute("r:embed"), t = emb && relS[emb]; if (!t) continue;
        const nome = caminhoRel(cam, t), ext = nome.split(".").pop().toLowerCase(), b = MIME_IMG[ext] ? await z.bytes(nome) : null; if (b) sl.imgs.push(new Blob([b], {type: MIME_IMG[ext]}));
      }
    }
    slides.push(sl);
  }
  return slides;
}

/* ---------- guardar o material de um treinamento ---------- */
const extDe = n => (String(n).split(".").pop() || "").toLowerCase();
const MB = n => n < 1048576 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1048576).toFixed(n >= 10485760 ? 0 : 1).replace(".", ",") + " MB";
async function matAnexar(t, file, manter) {   // manter = anexar de novo o mesmo arquivo (títulos e ligações ficam)
  const ext = extDe(file.name), tipo = ext === "pptx" ? "pptx" : ext === "pdf" ? "pdf" : ext === "html" || ext === "htm" ? "html" : "";
  if (!tipo) return {ok: false, msg: "Use um arquivo PPTX, PDF ou HTML."};
  if (manter && t.material && tipo !== t.material.tipo) return {ok: false, msg: "Anexe um arquivo do mesmo tipo (" + MAT_TIPOS[t.material.tipo] + ")."};
  if (file.size > (tipo === "html" ? MAT_MAX_HTML : MAT_MAX)) return {ok: false, msg: tipo === "html" ? "O HTML passa de 30 MB. Use um PDF." : "O arquivo passa de 300 MB. Exporte com imagens menores."};
  const u8 = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (tipo === "pptx" && !(u8[0] === 0x50 && u8[1] === 0x4B)) return {ok: false, msg: "Este arquivo não parece um PPTX (o formato antigo .ppt não serve; salve como .pptx)."};
  if (tipo === "pdf" && String.fromCharCode(...u8) !== "%PDF-") return {ok: false, msg: "Este arquivo não parece um PDF."};
  try { const e = navigator.storage && navigator.storage.estimate && await navigator.storage.estimate(); if (e && e.quota && e.quota - (e.usage || 0) < file.size * 1.05) return {ok: false, msg: "Não há espaço no navegador para este arquivo (" + MB(file.size) + "). Libere espaço ou use um arquivo menor."}; } catch (e) {}
  let caps;
  try {
    if (tipo === "pptx") { const sl = await pptxLer(file, false); if (!sl.length) return {ok: false, msg: "Não achei slides neste PPTX."}; caps = sl.map((x, i) => ({t: x.titulo || x.linhas.map(l => l.t)[0] || "Slide " + (i + 1), p: i})); }
    else if (tipo === "pdf") caps = (!manter && await Promise.race([aprCapsPdf(file).catch(() => null), new Promise(r => setTimeout(() => r(null), 20000))])) || [{t: "Documento inteiro", p: 1}];   // v1.5.0: marcadores ou um capítulo por slide
    else caps = [{t: "Documento inteiro", p: 0}];
  } catch (e) { return {ok: false, msg: String(e.message || "Não consegui ler o arquivo.")}; }
  if (manter && t.material && tipo === "pptx" && caps.length !== t.material.caps.length) return {ok: false, msg: "Este PPTX tem " + caps.length + " slides e o original tinha " + t.material.caps.length + ". Anexe o mesmo arquivo, ou use \"Trocar arquivo\" (desliga as ligações)."};
  try { try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {} await matGravar(t.id, {blob: file.slice(0, file.size, tipo === "pdf" ? "application/pdf" : tipo === "html" ? "text/html" : "application/vnd.openxmlformats-officedocument.presentationml.presentation"), nome: file.name, tipo}); }
  catch (e) { return {ok: false, msg: "O navegador não deixou guardar o arquivo (pouco espaço?)."}; }
  if (manter && t.material) { t.material.nome = file.name; t.material.bytes = file.size; t.material.em = new Date().toISOString(); if (tipo === "pptx") t.material.caps.forEach((c, i) => { if (/^Slide \d+$/.test(c.t)) c.t = caps[i].t; }); }
  else { t.itens.forEach(i => { delete i.cap; }); t.material = {nome: file.name, tipo, bytes: file.size, caps, em: new Date().toISOString()}; }
  salvar();
  return {ok: true, caps: t.material.caps.length};
}
async function matRemover(t) { t.itens.forEach(i => { delete i.cap; }); delete t.material; try { await matApagar(t.id); } catch (e) {} salvar(); }
const capTxt = (t, i) => { const c = t.material && t.material.caps[i]; return c ? (t.material.tipo === "pptx" ? "Slide " + (i + 1) + ": " : "") + c.t : ""; };

/* ---------- ver o material (dentro do telão ou numa janela do controle) ---------- */
function matSoltaUrls() { MAT.urls.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) {} }); MAT.urls = []; }
const matUrl = b => { const u = URL.createObjectURL(b); MAT.urls.push(u); return u; };
async function matPintar(box, m, cap) {
  const corpo = box.querySelector(".mt-c"), tit = box.querySelector(".mt-t"), ant = box.querySelector("[data-act=matant]"), prox = box.querySelector("[data-act=matprox]");
  const reg = await matLer(m.tid).catch(() => null);
  if (!MAT.aberto || !box.isConnected) return;   // fechou enquanto o arquivo era lido
  if (!reg) { corpo.innerHTML = `<p class="mt-er">O arquivo não está neste aparelho (só o título veio junto). Anexe de novo o mesmo arquivo na aba Material do painel do treinamento.</p>`; return; }
  matSoltaUrls(); const n = m.caps.length; cap = Math.max(0, Math.min(n - 1, cap)); MAT.aberto.cap = cap;
  tit.textContent = (m.tipo === "pptx" ? "Slide " + (cap + 1) + " de " + n + " · " : "") + m.caps[cap];
  if (ant) ant.disabled = cap <= 0; if (prox) prox.disabled = cap >= n - 1; box.querySelector(".mt-nav").hidden = m.tipo !== "pptx" || n < 2;
  if (m.tipo === "pdf") {
    const u = matUrl(reg.blob), p = (m.pg && m.pg[cap]) || (MAT.aberto.pg) || 1;
    corpo.innerHTML = `<iframe class="mt-fr" title="${esc(m.nome)}" src="${u}#page=${p}"></iframe><a class="b sm" href="${u}#page=${p}" target="_blank" rel="noopener">Abrir em outra aba</a>`;
  } else if (m.tipo === "html") {
    const f = document.createElement("iframe"); f.className = "mt-fr"; f.title = m.nome; f.setAttribute("sandbox", ""); f.srcdoc = await reg.blob.text(); corpo.innerHTML = ""; corpo.appendChild(f);
  } else {
    let sl; try { sl = (await pptxLer(reg.blob, true))[cap]; } catch (e) { if (box.isConnected) corpo.innerHTML = `<p class="mt-er">${esc(e.message || "Não consegui abrir o PPTX.")}</p>`; return; }
    if (!MAT.aberto || !box.isConnected || MAT.aberto.cap !== cap) return;   // fechou ou trocou de slide durante a leitura
    corpo.innerHTML = `<article class="mt-sl">${sl.titulo ? `<h2>${esc(sl.titulo)}</h2>` : ""}<ul>${sl.linhas.map(l => `<li style="margin-left:${Math.min(l.n, 4) * 22}px">${esc(l.t)}</li>`).join("")}</ul>${sl.imgs.length ? `<div class="mt-im">${sl.imgs.map(b => `<img alt="" src="${matUrl(b)}">`).join("")}</div>` : ""}</article><p class="sm mut mt-av">Versão em texto e imagens dos slides. Para ver o desenho exato, use o PDF.</p>`;
  }
}
function matCaixaHtml(m) {
  return `<div class="mt-bar"><b class="mt-t"></b><span class="mt-nav"><button class="b sm" data-act="matant" aria-label="Slide anterior">${ic("back", 'style="width:16px;height:16px"')}</button><button class="b sm" data-act="matprox" aria-label="Próximo slide">${ic("back", 'style="width:16px;height:16px;transform:scaleX(-1)"')}</button></span><button class="b sm" data-act="matfechar">${ic("x", 'style="width:16px;height:16px"')}Fechar</button></div><div class="mt-c" tabindex="0"></div>`;
}
function matFechar() { const o = document.querySelector(".matov"); if (o) o.remove(); const d = $("#dlg"); if (d && d.querySelector(".dl.mt") && d.open) d.close(); matSoltaUrls(); MAT.aberto = null; }
async function matAbrir(m, cap, onde, pg) {
  matFechar(); MAT.aberto = {m, cap, onde, pg};
  if (onde === "tel") { const o = document.createElement("div"); o.className = "matov" + (document.querySelector(".telfull.proj") ? " proj" : document.querySelector(".tel.claro") ? " claro" : ""); o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "Material de apoio"); o.innerHTML = matCaixaHtml(m); document.body.appendChild(o); await matPintar(o, m, cap); o.querySelector(".mt-c").focus(); }
  else { const d = $("#dlg"); d.innerHTML = `<div class="dl mt"><header><h2>Material de apoio</h2></header>${matCaixaHtml(m)}</div>`; if (!d.open) d.showModal(); await matPintar(d.querySelector(".dl.mt"), m, cap); }
}
const matCaixa = () => document.querySelector(".matov") || (document.querySelector("#dlg .dl.mt") || null);
document.addEventListener("close", e => { if (e.target && e.target.id === "dlg" && MAT.aberto && MAT.aberto.onde === "ctl") { matSoltaUrls(); MAT.aberto = null; } }, true);
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "matfechar") matFechar();
  else if ((a === "matant" || a === "matprox") && MAT.aberto) { const box = matCaixa(); if (box) matPintar(box, MAT.aberto.m, MAT.aberto.cap + (a === "matprox" ? 1 : -1)); }
  else if (a === "matver" || a === "mattel") {   // controle: ver aqui ou mandar para o telão
    const sn = AO.snap, it = sn && sn.item; if (!sn || !sn.mat || !it || it.cap === null || it.cap === undefined) return;
    if (a === "matver") matAbrir(sn.mat, it.cap, "ctl"); else if (AO.ch) { try { AO.ch.postMessage({t: "cmd", a: "material", id: sn.id, cap: it.cap}); } catch (e2) {} aviso("Material enviado ao telão"); }
  } else if (a === "tvmat") { const sn = AO.snap; if (sn && sn.mat && sn.item && sn.item.cap !== null && sn.item.cap !== undefined) matAbrir(sn.mat, sn.item.cap, "tel"); }
});
document.addEventListener("keydown", e => {
  if (!MAT.aberto) return; const box = matCaixa(); if (!box) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); matFechar(); }
  else if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); e.stopPropagation(); matPintar(box, MAT.aberto.m, MAT.aberto.cap + 1); }
  else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); e.stopPropagation(); matPintar(box, MAT.aberto.m, MAT.aberto.cap - 1); }
  else if (e.key === "m" || e.key === "M") { e.preventDefault(); e.stopPropagation(); matFechar(); }
}, true);
/* o controle manda o capítulo para o telão */
if (AO.ch) AO.ch.addEventListener("message", e => {
  const m = e.data || {}; if (m.t !== "cmd" || rota().v !== "telao") return;
  if (m.a === "material") { const sn = AO.snap; if (sn && sn.mat && (!m.id || m.id === sn.id)) matAbrir(sn.mat, Number(m.cap) || 0, "tel"); }
});
document.addEventListener("keydown", e => {
  if (rota().v !== "telao" || MAT.aberto || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "m" || e.key === "M") { const sn = AO.snap; if (sn && sn.mat && sn.item && sn.item.cap !== null && sn.item.cap !== undefined) { e.preventDefault(); matAbrir(sn.mat, sn.item.cap, "tel"); } }
});
/* botão do telão: aparece só quando a explicação atual tem capítulo */
function matAtualizaTelao() {
  const b = $("#tvbar [data-act=tvmat]"), sn = AO.snap, tem = !!(sn && sn.mat && sn.item && sn.item.cap !== null && sn.item.cap !== undefined && sn.fase && sn.fase.etapa === "explicacao");
  if (b) b.hidden = !tem;
  if (!tem && MAT.aberto && MAT.aberto.onde === "tel" && sn && sn.fase && sn.fase.etapa !== "explicacao") matFechar();
}
const matBtnCtl = sn => {
  const it = sn.item; if (!sn.mat || !it || it.cap === null || it.cap === undefined || sn.fase.etapa !== "explicacao") return "";
  return `<div class="mt-ctl"><span class="sm mut">Material: ${esc(sn.mat.caps[it.cap] || "")}</span><button class="b sm" data-act="mattel">${ic("screen", 'style="width:16px;height:16px"')}Mostrar no telão</button><button class="b sm" data-act="matver">Ver aqui</button></div>`;
};
const matDicaTel = (sn, it) => sn.mat && it.cap !== null && it.cap !== undefined ? `<p class="mt-dica">Material: ${esc(sn.mat.caps[it.cap] || "")} · tecla M</p>` : "";
function matSnap(s) {
  const t = treino(s.treinoId); return t && t.material ? {tid: t.id, nome: t.material.nome, tipo: t.material.tipo, caps: t.material.caps.map(c => c.t), pg: t.material.caps.map(c => c.p)} : null;
}

/* ---------- editor: ligar a explicação a um capítulo ---------- */
function capHtml(t, it) {
  if (it.tipo !== "explicacao" || !t.material || !t.material.caps.length) return "";
  return `<div class="fd"><label for="e-cap">Capítulo do material</label><select class="in" id="e-cap" data-e="cap"><option value="">Nenhum</option>${t.material.caps.map((c, i) => `<option value="${i}" ${it.cap === i ? "selected" : ""}>${esc(capTxt(t, i))}</option>`).join("")}</select><span class="sm mut">Na sala, o instrutor abre este capítulo por cima do telão.</span></div>`;
}

/* ---------- painel: aba Material ---------- */
function pnMaterial(t) {
  const m = t.material;
  if (!m) return `<p class="sm mut" style="margin:0">Anexe a apresentação (PPTX, de preferência), um PDF ou um HTML. O arquivo fica só neste aparelho, funciona sem internet e não vai para o Firebase nem para os celulares. Cada explicação pode abrir um capítulo por cima do telão.</p>
    <label class="b p mt-up" for="mt-arq">${ic("upload")}Anexar arquivo</label><input type="file" id="mt-arq" class="sr" accept=".pptx,.pdf,.html,.htm" data-mt="arq"><span class="sm mut" id="mt-st" role="status"></span>`;
  const usos = i => t.itens.map((x, k) => [x, k]).filter(([x]) => x.tipo === "explicacao" && x.cap === i).map(([, k]) => numeroItem(t, k) + (t.itens.slice(0, k + 1).filter(y => y.tipo === "explicacao").length));
  setTimeout(() => mtVerifica(t), 30);
  return `<div class="mt-arq"><b>${esc(m.nome)}</b><span class="chip">${MAT_TIPOS[m.tipo]}</span><span class="sm mut">${MB(m.bytes)}</span></div><div id="mt-falta"></div>
    <div class="mt-acoes"><label class="b sm" for="mt-arq">${ic("upload", 'style="width:16px;height:16px"')}Trocar arquivo</label><input type="file" id="mt-arq" class="sr" accept=".pptx,.pdf,.html,.htm" data-mt="arq"><button class="b sm g" data-act="mtprev">Ver o material</button><button class="b sm g" data-act="mtdel">${ic("trash", 'style="width:16px;height:16px"')}Remover</button></div>
    <span class="sm mut" id="mt-st" role="status">Trocar ou remover o arquivo desliga as ligações com as explicações.</span>
    <ul class="mt-caps" aria-label="Capítulos">${m.caps.map((c, i) => { const u = usos(i); return `<li><span class="mt-n">${m.tipo === "pptx" ? i + 1 : ""}</span><span class="mt-ct">${esc(c.t)}${m.tipo === "pdf" ? ` <span class="sm mut">página ${c.p}</span>` : ""}</span>${u.length ? `<span class="chip ok">${u.length} explicaç${u.length === 1 ? "ão" : "ões"}</span>` : ""}${m.tipo === "pdf" && m.caps.length > 1 ? `<button class="b ic g" data-act="mtcdel" data-i="${i}" aria-label="Apagar o capítulo ${esc(c.t)}">${ic("x", 'style="width:16px;height:16px"')}</button>` : ""}</li>`; }).join("")}</ul>
    ${m.tipo === "pdf" ? `<form class="mt-add" data-form="mtcap"><div class="fd"><label for="mt-ct">Novo capítulo</label><input class="in" id="mt-ct" maxlength="80" placeholder="Ex.: Lavagem das mãos"></div><div class="fd"><label for="mt-cp">Página</label><input class="in" id="mt-cp" type="number" min="1" max="2000" value="1" inputmode="numeric"></div><button class="b" type="submit">Adicionar</button></form>` : ""}`;
}
/* material que veio de outro aparelho: só o título e os capítulos estão aqui, o arquivo precisa ser anexado de novo */
async function mtVerifica(t) {
  const el = $("#mt-falta"); if (!el || !t.material) return;
  const r = await matLer(t.id).catch(() => null); if (r || !$("#mt-falta")) return;
  $("#mt-falta").innerHTML = `<div class="mt-falta"><b>O arquivo não está neste aparelho.</b><span class="sm">Só o título e os capítulos vieram com o treinamento. Anexe de novo o mesmo arquivo (${esc(t.material.nome)}) e as ligações com as explicações continuam valendo.</span><label class="b p sm" for="mt-re">${ic("upload", 'style="width:16px;height:16px"')}Anexar o mesmo arquivo</label><input type="file" id="mt-re" class="sr" accept=".pptx,.pdf,.html,.htm" data-mt="re"></div>`;
}
function mtRepinta() { const t = treino(UI.ed && UI.ed.id); const c = $("#pn-corpo"); if (t && c && PN.aba === "material") c.innerHTML = pnMaterial(t); }
document.addEventListener("change", async e => {
  const x = e.target; if (!x.dataset || x.dataset.mt !== "arq" && x.dataset.mt !== "re" || !x.files[0]) return;
  const t = treino(UI.ed && UI.ed.id); if (!t) return; const st = $("#mt-st"); if (st) st.textContent = "Lendo o arquivo...";
  const r = await matAnexar(t, x.files[0], x.dataset.mt === "re"); x.value = "";
  if (!r.ok) { const s2 = $("#mt-st"); if (s2) { s2.textContent = r.msg; s2.classList.add("warn"); } return; }
  mtRepinta(); aviso(r.caps > 1 ? `Material anexado: ${r.caps} capítulos` : "Material anexado"); if (rota().v === "editar") pintaCentro();
});
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act, t = treino(UI.ed && UI.ed.id);
  if (a === "mtdel" && t) { await matRemover(t); mtRepinta(); pintaCentro(); aviso("Material removido"); }
  else if (a === "mtcdel" && t && t.material) { const i = Number(el.dataset.i); t.material.caps.splice(i, 1); t.itens.forEach(x => { if (x.cap === i) delete x.cap; else if (x.cap > i) x.cap--; }); salvar(); mtRepinta(); pintaCentro(); }
  else if (a === "mtprev" && t && t.material) matAbrir({tid: t.id, nome: t.material.nome, tipo: t.material.tipo, caps: t.material.caps.map(c => c.t), pg: t.material.caps.map(c => c.p)}, 0, "ctl");
});
document.addEventListener("submit", e => {
  if (e.target.dataset.form !== "mtcap") return; e.preventDefault();
  const t = treino(UI.ed && UI.ed.id); if (!t || !t.material || t.material.tipo !== "pdf") return;
  const nome = $("#mt-ct").value.trim().slice(0, 80), pg = Math.round(Number($("#mt-cp").value));
  if (!nome || !(pg >= 1 && pg <= 2000)) { const s = $("#mt-st"); if (s) { s.textContent = "Escreva o título e uma página entre 1 e 2000."; s.classList.add("warn"); } return; }
  const lig = t.itens.map(x => t.material.caps[x.cap]);   // guarda as ligações pelo capítulo, não pelo número, porque a lista é reordenada
  t.material.caps.push({t: nome, p: pg}); t.material.caps.sort((p, q) => p.p - q.p);
  t.itens.forEach((x, k) => { if (lig[k]) x.cap = t.material.caps.indexOf(lig[k]); }); salvar(); mtRepinta(); pintaCentro();
});

/* título e capítulos viajam na exportação do treinamento; o arquivo não (importar leva ao "anexe de novo") */
function matValida(m) {
  if (!m || typeof m !== "object" || !MAT_TIPOS[m.tipo] || typeof m.nome !== "string" || !Array.isArray(m.caps) || !m.caps.length || m.caps.length > 1000) return null;
  const caps = m.caps.map(c => c && typeof c.t === "string" && Number.isInteger(c.p) && c.p >= 0 && c.p <= 5000 ? {t: c.t.slice(0, 80), p: c.p} : null);
  if (caps.some(c => !c)) return null;
  return {nome: m.nome.slice(0, 200), tipo: m.tipo, bytes: Number(m.bytes) > 0 ? Number(m.bytes) : 0, caps, em: new Date().toISOString()};
}
