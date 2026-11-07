/* ===== v1.5.0 · Apresentar o material e prompt padrão para a IA ===== */
/* Apresentar: o PDF passa a ser desenhado página por página (PDF.js guardado em lib/pdfjs, funciona sem internet),
   com setas, toque, lista de capítulos e tela cheia. Abre pelo painel do treinamento (nesta tela ou em outra janela),
   pelo controle da sala a qualquer momento (vai para o telão) e pelo capítulo ligado à explicação (como antes).
   O visor é o mesmo da v1.3.0 (.matov / .dl.mt); aqui só muda o desenho do PDF e entram as entradas novas.
   Prefixos: apr, ap- */
const APR = {lib: null, docs: new Map(), tarefa: 0, ctl: {on: false, pg: 0, n: 0, t: ""}, toque: null, redim: 0};
const APR_LIB = "lib/pdfjs/pdf.min.js", APR_WORKER = "lib/pdfjs/pdf.worker.min.js";

/* ---------- leitor de PDF (carrega só quando precisa) ---------- */
function aprLib() {
  const u = new URL(APR_LIB, location.href).href;
  /* se o navegador recusar o import direto, tenta pelo conteúdo do arquivo (mesmo arquivo, guardado pelo app) */
  if (!APR.lib) APR.lib = import(u).catch(() => fetch(u).then(r => { if (!r.ok) throw new Error("sem leitor"); return r.text(); }).then(t => import(URL.createObjectURL(new Blob([t], {type: "text/javascript"})))))
    .then(m => { m.GlobalWorkerOptions.workerSrc = new URL(APR_WORKER, location.href).href; return m; })
    .catch(e => { APR.lib = null; throw e; });
  return APR.lib;
}
async function aprDoc(chave, blob) {
  const k = chave + ":" + blob.size; if (APR.docs.has(k)) return APR.docs.get(k);
  const p = aprLib().then(lib => lib.getDocument({url: URL.createObjectURL(blob), isEvalSupported: false}).promise);
  APR.docs.set(k, p); p.catch(() => APR.docs.delete(k)); return p;
}
const aprCapDaPagina = (m, pg) => { let c = 0; (m.pg || []).forEach((p, i) => { if (p <= pg) c = i; }); return c; };

/* capítulos automáticos de um PDF: marcadores do arquivo; se for apresentação (página deitada), um por página com o título do slide */
function aprPrimeiraLinha(itens) {
  const t = itens.filter(x => x && typeof x.str === "string" && x.str.trim());
  if (!t.length) return "";
  const alto = t.reduce((a, x) => (x.height || 0) > (a.height || 0) ? x : a, t[0]), y = alto.transform ? alto.transform[5] : 0;
  const linha = t.filter(x => x.transform && Math.abs(x.transform[5] - y) < Math.max(2, (alto.height || 10) * 0.4)).sort((a, b) => a.transform[4] - b.transform[4]);
  return linha.map(x => x.str).join(" ").replace(/\s+/g, " ").trim().slice(0, 80);
}
async function aprCapsPdf(file) {
  const lib = await aprLib(), u = URL.createObjectURL(file);
  try {
    const doc = await lib.getDocument({url: u, isEvalSupported: false}).promise, n = doc.numPages;
    try {
      const out = await doc.getOutline().catch(() => null);
      if (out && out.length) {
        const caps = [];
        for (const o of out.slice(0, 300)) {
          let d = o.dest; if (typeof d === "string") d = await doc.getDestination(d).catch(() => null);
          if (!Array.isArray(d) || !d[0]) continue;
          const i = typeof d[0] === "number" ? d[0] : await doc.getPageIndex(d[0]).catch(() => -1);
          if (i >= 0 && i < n) caps.push({t: String(o.title || "").replace(/\s+/g, " ").trim().slice(0, 80) || "Página " + (i + 1), p: i + 1});
        }
        if (caps.length) return caps.sort((a, b) => a.p - b.p).filter((c, k, l) => !k || c.p !== l[k - 1].p);
      }
      const p1 = await doc.getPage(1), v = p1.getViewport({scale: 1});
      if (v.width > v.height && n <= 300) {
        const caps = [];
        for (let i = 1; i <= n; i++) { const pg = i === 1 ? p1 : await doc.getPage(i); const tc = await pg.getTextContent().catch(() => ({items: []})); caps.push({t: aprPrimeiraLinha(tc.items) || "Página " + i, p: i}); }
        return caps;
      }
      return null;
    } finally { doc.destroy(); }
  } finally { URL.revokeObjectURL(u); }
}

/* ---------- visor: o PDF desenhado ---------- */
const matPintarV13 = matPintar;
matPintar = async function (box, m, cap, pg) {
  if (m.tipo !== "pdf") { await matPintarV13(box, m, cap); aprBarra(box, m); aprAvisaPos(); return; }
  const corpo = box.querySelector(".mt-c"), tit = box.querySelector(".mt-t"), ant = box.querySelector("[data-act=matant]"), prox = box.querySelector("[data-act=matprox]");
  const reg = await matLer(m.tid).catch(() => null);
  if (!MAT.aberto || !box.isConnected) return;
  if (!reg) { corpo.innerHTML = `<p class="mt-er">O arquivo não está neste aparelho (só o título veio junto). Anexe de novo o mesmo arquivo na aba Material do painel do treinamento.</p>`; return; }
  const meu = ++APR.tarefa;
  let doc;
  try { doc = await aprDoc(m.tid, reg.blob); }
  catch (e) {   // sem o leitor (navegador antigo ou nunca abriu com internet): volta ao leitor do navegador
    if (!box.isConnected || meu !== APR.tarefa) return;
    matSoltaUrls(); const u = matUrl(reg.blob), p = pg || (m.pg && m.pg[cap]) || 1;
    tit.textContent = m.caps[cap] || m.nome; box.querySelector(".mt-nav").hidden = true;
    corpo.innerHTML = `<p class="mt-er">Não consegui carregar o leitor de PDF do Sabiá. Abra o arquivo no leitor do navegador.</p><a class="b sm" href="${u}#page=${p}" target="_blank" rel="noopener">Abrir em outra aba</a>`; return;
  }
  if (!MAT.aberto || !box.isConnected || meu !== APR.tarefa) return;
  const n = doc.numPages, p = Math.max(1, Math.min(n, Math.round(pg || MAT.aberto.pg || (m.pg && m.pg[cap]) || 1)));
  MAT.aberto.pg = p; MAT.aberto.n = n; MAT.aberto.cap = aprCapDaPagina(m, p);
  const capT = m.caps[MAT.aberto.cap] || "";
  tit.textContent = "Página " + p + " de " + n + (capT && capT !== "Documento inteiro" ? " · " + capT : "");
  if (ant) ant.disabled = p <= 1; if (prox) prox.disabled = p >= n; box.querySelector(".mt-nav").hidden = n < 2;
  let cv = corpo.querySelector("canvas.ap-pg");
  if (!cv) { matSoltaUrls(); corpo.innerHTML = `<div class="ap-palco"><canvas class="ap-pg" role="img"></canvas></div>`; cv = corpo.querySelector("canvas.ap-pg"); }
  cv.setAttribute("aria-label", "Página " + p + " de " + n + " de " + m.nome);
  aprBarra(box, m);
  let page; try { page = await doc.getPage(p); } catch (e) { return; }
  if (!box.isConnected || meu !== APR.tarefa) return;
  const palco = corpo.querySelector(".ap-palco"), rc = corpo.getBoundingClientRect(), w = Math.max(200, Math.min(rc.width || 9999, Math.max(palco.clientWidth, rc.width))), h = Math.max(150, Math.max(palco.clientHeight, rc.height));   // o visor por cima ocupa a tela; na janela do controle o palco tem altura própria
  const v1 = page.getViewport({scale: 1}), esc1 = Math.min(w / v1.width, h / v1.height), dpr = Math.min(2, window.devicePixelRatio || 1), vp = page.getViewport({scale: esc1 * dpr});
  const tmp = document.createElement("canvas"); tmp.width = Math.floor(vp.width); tmp.height = Math.floor(vp.height);
  try { await page.render({canvasContext: tmp.getContext("2d"), viewport: vp}).promise; } catch (e) { return; }
  if (!box.isConnected || meu !== APR.tarefa) return;   // trocou de página enquanto desenhava: fica a mais nova
  cv.width = tmp.width; cv.height = tmp.height; cv.style.width = Math.floor(vp.width / dpr) + "px"; cv.style.height = Math.floor(vp.height / dpr) + "px";
  cv.getContext("2d").drawImage(tmp, 0, 0); cv.dataset.pg = p;
  aprAvisaPos();
};
function aprIr(d) {   // próxima/anterior: página no PDF, slide no PPTX
  const a = MAT.aberto, box = matCaixa(); if (!a || !box) return;
  if (a.m.tipo === "pdf") { const n = a.n || 1, p = Math.max(1, Math.min(n, (a.pg || 1) + d)); if (p !== a.pg) matPintar(box, a.m, a.cap, p); }
  else if (a.m.tipo === "pptx") { const c = Math.max(0, Math.min(a.m.caps.length - 1, a.cap + d)); if (c !== a.cap) matPintar(box, a.m, c); }
}
/* barra: lista de capítulos e tela cheia */
function aprBarra(box, m) {
  const bar = box.querySelector(".mt-bar"); if (!bar || !MAT.aberto) return;
  let sel = bar.querySelector(".ap-cap");
  if (m.caps.length > 1 && !sel) { bar.querySelector(".mt-nav").insertAdjacentHTML("afterend", `<label class="sr" for="ap-cap">Capítulo</label><select class="in ap-cap" id="ap-cap" data-apr="cap">${m.caps.map((c, i) => `<option value="${i}">${esc((m.tipo === "pptx" ? i + 1 + ". " : "") + c)}</option>`).join("")}</select>`); sel = bar.querySelector(".ap-cap"); }
  if (sel) sel.value = String(MAT.aberto.cap);
  if (!bar.querySelector("[data-act=aprtela]") && document.fullscreenEnabled !== false) bar.querySelector("[data-act=matfechar]").insertAdjacentHTML("beforebegin", `<button class="b sm" data-act="aprtela" aria-label="Tela cheia">${ic("screen", 'style="width:16px;height:16px"')}<span class="ap-lbl">Tela cheia</span></button>`);
}
function aprTelaCheia() {
  const alvo = document.querySelector(".matov") || document.documentElement;
  try { if (document.fullscreenElement) document.exitFullscreen(); else (alvo.requestFullscreen ? alvo.requestFullscreen() : Promise.reject()).catch(() => aviso("O navegador não deixou. Use F11.")); } catch (e) { aviso("O navegador não deixou. Use F11."); }
}
/* redesenha a página quando a janela muda de tamanho (tela cheia, girar o tablet) */
window.addEventListener("resize", () => { clearTimeout(APR.redim); APR.redim = setTimeout(() => { const a = MAT.aberto, box = matCaixa(); if (a && box && a.m.tipo === "pdf") matPintar(box, a.m, a.cap, a.pg); }, 150); });
document.addEventListener("fullscreenchange", () => window.dispatchEvent(new Event("resize")));

/* ---------- abrir para apresentar ---------- */
const aprMatDe = t => t && t.material ? {tid: t.id, nome: t.material.nome, tipo: t.material.tipo, caps: t.material.caps.map(c => c.t), pg: t.material.caps.map(c => c.p)} : null;
async function aprAbrir(m, op) {   // op: {pg, cap, cheia, janela, livre}
  op = op || {}; const cap = op.cap || 0;
  /* matAbrir monta o visor antes da primeira espera: as marcas valem já no primeiro desenho, e a tela cheia sai ainda dentro do toque */
  const pr = matAbrir(m, cap, "tel", op.pg || (m.tipo === "pdf" ? (m.pg && m.pg[cap]) || 1 : undefined));
  if (MAT.aberto) { MAT.aberto.livre = op.livre !== false; MAT.aberto.janela = !!op.janela; }
  const o = document.querySelector(".matov"); if (o) { o.classList.add("ap-apr"); if (op.cheia) aprTelaCheia(); }
  await pr; aprAvisaPos();
}
function aprSair() {
  const a = MAT.aberto; if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
  matFechar(); aprAvisaPos();
  if (a && a.janela) { if (window.opener && !window.opener.closed) { try { window.close(); } catch (e) {} } ir("#/editar/" + a.m.tid); }
}
/* o capítulo ligado à explicação fecha ao sair da explicação; o que foi aberto por "Apresentar" fica até fechar */
matAtualizaTelao = function () {
  const b = $("#tvbar [data-act=tvmat]"), sn = AO.snap, tem = !!(sn && sn.mat && sn.item && sn.item.cap !== null && sn.item.cap !== undefined && sn.fase && sn.fase.etapa === "explicacao");
  if (b) b.hidden = !tem;
  if (!tem && MAT.aberto && MAT.aberto.onde === "tel" && !MAT.aberto.livre && sn && sn.fase && sn.fase.etapa !== "explicacao") matFechar();
};

/* ---------- telão <-> controle ---------- */
function aprAvisaPos() {
  if (rota().v !== "telao" || !AO.ch || !AO.snap) return; const a = MAT.aberto;
  const on = !!(a && a.livre && a.onde === "tel");
  try { AO.ch.postMessage({t: "aprpos", id: AO.snap.id, on, pg: on ? (a.m.tipo === "pdf" ? a.pg || 1 : a.cap + 1) : 0, n: on ? (a.m.tipo === "pdf" ? a.n || 0 : a.m.caps.length) : 0, tt: on ? a.m.caps[a.cap] || a.m.nome : ""}); } catch (e) {}
}
if (AO.ch) AO.ch.addEventListener("message", e => {
  const m = e.data || {}, r = rota();
  if (m.t === "cmd" && r.v === "telao") {
    const sn = AO.snap; if (!sn || (m.id && m.id !== sn.id)) return;
    if (m.a === "apr" && sn.mat) { const c = Number(m.cap) || 0; aprAbrir(sn.mat, {cap: c, pg: Number(m.pg) || undefined}); }
    else if (m.a === "aprir" && MAT.aberto) aprIr(Number(m.d) || 0);
    else if (m.a === "aprfim" && MAT.aberto) aprSair();
    else if (m.a === "aprquem") aprAvisaPos();
  } else if (m.t === "oi" && r.v === "sala") { APR.ctl = {on: false, pg: 0, n: 0, t: ""};   // telão aberto de novo: nada apresentando
  } else if (m.t === "aprpos" && r.v === "sala" && AO.snap && m.id === AO.snap.id) {
    APR.ctl = {on: !!m.on, pg: Number(m.pg) || 0, n: Number(m.n) || 0, t: String(m.tt || "")};
    const el = $(".ap-ctl"); if (el) el.outerHTML = aprCtlHtml(AO.snap);
  }
});
/* bloco do controle: apresentar no telão a qualquer momento */
function aprCtlHtml(sn) {
  if (!sn || !sn.mat) return "";
  const c = APR.ctl, n = c.n, tipo = sn.mat.tipo, un = tipo === "pdf" ? "página" : tipo === "pptx" ? "slide" : "";
  if (!c.on) return `<div class="ap-ctl"><span class="sm mut">Material: ${esc(sn.mat.nome)}</span><button class="b sm" data-act="aprtel">${ic("screen", 'style="width:16px;height:16px"')}Apresentar no telão</button><button class="b sm g" data-act="aprver">Ver aqui</button></div>`;
  return `<div class="ap-ctl on" role="group" aria-label="Apresentação no telão"><span class="sm"><b>No telão:</b> ${un ? un + " " + c.pg + " de " + n : esc(sn.mat.nome)}${c.t && c.t !== "Documento inteiro" ? " · " + esc(c.t) : ""}</span>
    <span class="ap-nav"><button class="b sm" data-act="aprctl" data-d="-1" aria-label="Anterior" ${c.pg <= 1 ? "disabled" : ""}>${ic("back", 'style="width:16px;height:16px"')}</button><button class="b sm" data-act="aprctl" data-d="1" aria-label="Próxima" ${c.pg >= n ? "disabled" : ""}>${ic("back", 'style="width:16px;height:16px;transform:scaleX(-1)"')}</button></span>
    <button class="b sm" data-act="aprparar">${ic("x", 'style="width:16px;height:16px"')}Voltar ao quiz</button></div>`;
}

/* ---------- tela "#/apresentar/:id" (outra janela, para o projetor) ---------- */
function vApresentar(id) {
  const t = treino(id), m = aprMatDe(t);
  document.body.classList.add("modo-telao"); $("#app").className = "body";
  if (!m) { $("#app").innerHTML = `<div class="ap-ini"><p>Este treinamento não tem material.</p><a class="b" href="#/treinos">Voltar</a></div>`; return; }
  $("#app").innerHTML = `<div class="ap-ini"><h1>${esc(t.titulo)}</h1><p class="mut">${esc(m.nome)}</p><button class="b p" data-act="aprcomecar" data-id="${esc(id)}">${ic("screen")}Começar em tela cheia</button><button class="b" data-act="aprcomecar" data-id="${esc(id)}" data-v="0">Começar nesta janela</button><p class="sm mut">Setas ou toque para passar · F tela cheia · Esc sai</p></div>`;
}

/* ---------- cliques ---------- */
window.addEventListener("click", e => {   // fase de captura: o PDF troca de página antes do clique chegar ao visor antigo
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if ((a === "matant" || a === "matprox") && MAT.aberto && MAT.aberto.m.tipo === "pdf") { e.stopPropagation(); aprIr(a === "matprox" ? 1 : -1); }
  else if (a === "matfechar" && MAT.aberto && (MAT.aberto.livre || MAT.aberto.janela)) { e.stopPropagation(); aprSair(); }
}, true);
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "aprtela") aprTelaCheia();
  else if (a === "aprpainel") { const m = aprMatDe(treino(UI.ed && UI.ed.id)); if (!m) return; const d = $("#dlg"); if (d && d.open) d.close(); aprAbrir(m, {cheia: true}); }   // o painel é modal: fechado, o visor recebe o toque
  else if (a === "aprjanela") { const t = treino(UI.ed && UI.ed.id); if (!t) return; const w = window.open(location.pathname + location.search + "#/apresentar/" + t.id, "sabia-apresentar"); if (!w) aviso("O navegador bloqueou a janela. Permita janelas para este site."); }
  else if (a === "aprcomecar") { const m = aprMatDe(treino(el.dataset.id)); if (m) aprAbrir(m, {cheia: el.dataset.v !== "0", janela: true}); }
  else if (a === "aprtel") { const sn = AO.snap; if (!sn || !sn.mat) return; if (!AO.ch) { aviso("Abra o telão primeiro."); return; } const c = sn.item && sn.item.cap !== null && sn.item.cap !== undefined ? sn.item.cap : 0; try { AO.ch.postMessage({t: "cmd", a: "apr", id: sn.id, cap: c}); } catch (x) {}
    /* o telão responde com a página aberta; sem resposta, ele não está aberto */
    setTimeout(() => { if (!APR.ctl.on && rota().v === "sala") aviso("O telão não respondeu. Toque em Abrir telão e depois em Apresentar no telão."); }, 2000); }
  else if (a === "aprver") { const sn = AO.snap; if (sn && sn.mat) matAbrir(sn.mat, sn.item && sn.item.cap != null ? sn.item.cap : 0, "ctl"); }
  else if (a === "aprctl") { const sn = AO.snap; if (sn && AO.ch) try { AO.ch.postMessage({t: "cmd", a: "aprir", id: sn.id, d: Number(el.dataset.d) || 0}); } catch (x) {} }
  else if (a === "aprparar") { const sn = AO.snap; if (sn && AO.ch) try { AO.ch.postMessage({t: "cmd", a: "aprfim", id: sn.id}); } catch (x) {} APR.ctl = {on: false, pg: 0, n: 0, t: ""}; const c = $(".ap-ctl"); if (c) c.outerHTML = aprCtlHtml(sn); }
});
document.addEventListener("change", e => {
  const x = e.target; if (!x.dataset || x.dataset.apr !== "cap" || !MAT.aberto) return;
  const i = Number(x.value), a = MAT.aberto, box = matCaixa(); if (!box) return;
  if (a.m.tipo === "pdf") matPintar(box, a.m, i, (a.m.pg && a.m.pg[i]) || 1); else matPintar(box, a.m, i);
  setTimeout(() => { const c = box.querySelector(".mt-c"); if (c) c.focus(); }, 0);
});
/* teclado: no PDF as setas trocam de página; no material aberto por "Apresentar", Espaço e Enter também passam (e não avançam a sala) */
window.addEventListener("keydown", e => {
  const a = MAT.aberto; if (!a || !matCaixa() || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target && e.target.closest && e.target.closest("select")) return;
  const k = e.key, pdf = a.m.tipo === "pdf", livre = a.livre || a.janela;
  const seg = k === "ArrowRight" || k === "PageDown" || k === "ArrowDown" || (livre && (k === " " || k === "Enter")), vol = k === "ArrowLeft" || k === "PageUp" || k === "ArrowUp";
  if ((seg || vol) && (pdf || livre)) { e.preventDefault(); e.stopPropagation(); aprIr(seg ? 1 : -1); }
  else if ((k === "Escape" || k === "m" || k === "M") && livre) { e.preventDefault(); e.stopPropagation(); aprSair(); }
  else if ((k === "f" || k === "F") && livre) { e.preventDefault(); e.stopPropagation(); aprTelaCheia(); }
  else if (k === " " && pdf) { e.preventDefault(); e.stopPropagation(); }   // não avança a sala por baixo do material
}, true);
/* toque: arrastar para o lado passa a página; tocar no terço da direita ou da esquerda também */
document.addEventListener("pointerdown", e => { if (!MAT.aberto || !e.target.closest || !e.target.closest(".mt-c")) return; APR.toque = {x: e.clientX, y: e.clientY, t: Date.now()}; }, {passive: true});
document.addEventListener("pointerup", e => {
  const s = APR.toque; APR.toque = null; if (!s || !MAT.aberto || !e.target.closest || !e.target.closest(".mt-c")) return;
  if (e.target.closest("a,button,iframe,select")) return;
  const dx = e.clientX - s.x, dy = e.clientY - s.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { aprIr(dx < 0 ? 1 : -1); return; }
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - s.t < 400) { const box = e.target.closest(".mt-c").getBoundingClientRect(), x = (e.clientX - box.left) / box.width; if (x > 0.67) aprIr(1); else if (x < 0.33) aprIr(-1); }
}, {passive: true});

/* ---------- painel: botões Apresentar e dica do PPTX ---------- */
const pnMaterialV13 = pnMaterial;
pnMaterial = function (t) {
  let h = pnMaterialV13(t); if (!t.material) return h;
  h = h.replace('<button class="b sm g" data-act="mtprev">', `<button class="b sm p" data-act="aprpainel">${ic("screen", 'style="width:16px;height:16px"')}Apresentar</button><button class="b sm" data-act="aprjanela">Abrir em outra tela</button><button class="b sm g" data-act="mtprev">`);
  if (t.material.tipo === "pptx") h = h.replace('<div id="mt-falta"></div>', '<div id="mt-falta"></div><p class="ap-dica sm"><b>Para apresentar com o desenho dos slides,</b> salve como PDF no PowerPoint (Arquivo &gt; Exportar &gt; PDF) e anexe o PDF. O PPTX aparece só como texto e imagens.</p>');
  return h;
};

/* ---------- prompt padrão para a IA ---------- */
const PROMPT_PADRAO = `Você vai criar as atividades de um treinamento para o app Sabiá (treinamentos de segurança, higiene e qualidade em uma propriedade rural). O conteúdo do treinamento está no fim desta mensagem (texto colado) ou no arquivo anexo.

O QUE FAZER
1. Leia todo o conteúdo e separe os assuntos principais.
2. Para cada assunto, escreva 1 explicação curta (os pontos principais, um por linha) e, logo depois dela, as perguntas desse assunto.
3. Crie de 8 a 12 perguntas que valem nota (10, se o conteúdo der). Misture os 3 formatos, mais ou menos nesta proporção: 4 de múltipla escolha, 3 de verdadeiro ou falso e 3 de sequência (colocar os passos na ordem certa). Evite dois formatos iguais seguidos.
4. Use SOMENTE o conteúdo enviado. Não invente regra, número, prazo, produto ou nome que não esteja nele. Se o conteúdo não der para um formato, use outro.

COMO ESCREVER
- Frases curtas e palavras simples, para quem lê pouco. Enunciado com até 400 letras e alternativa com até 200. Sem emojis.
- Múltipla escolha: 4 alternativas (ou 3), só uma certa. As erradas têm que parecer possíveis. Varie a posição da certa.
- Verdadeiro ou falso: uma afirmação clara, sem pegadinha. Equilibre verdadeiras e falsas.
- Sequência: de 3 a 5 passos, já na ordem certa (o app embaralha para a turma).
- Em todas as perguntas, "porque": 1 ou 2 frases explicando a resposta certa.
- Tempo: 20 segundos na múltipla escolha, 15 no verdadeiro ou falso e 45 na sequência.

COMO ENTREGAR
Entregue um arquivo chamado treinamento-sabia.json para eu baixar. Se você não puder criar arquivo, responda SOMENTE com o JSON, sem nenhum texto antes ou depois e sem marcas de código.
Formato (siga exatamente):
{"origem":"sabia-ia","titulo":"...","meta":80,"descricao":"uma frase sobre o treinamento","itens":[
 {"tipo":"explicacao","enunciado":"título do assunto","texto":"ponto 1\\nponto 2\\nponto 3"},
 {"tipo":"multipla","enunciado":"...","alternativas":["...","...","...","..."],"correta":0,"tempo":20,"uso":"avaliacao","porque":"..."},
 {"tipo":"vf","enunciado":"...","alternativas":["Verdadeiro","Falso"],"correta":1,"tempo":15,"uso":"avaliacao","porque":"..."},
 {"tipo":"ordenar","enunciado":"Coloque na ordem: ...","alternativas":["passo 1","passo 2","passo 3"],"tempo":45,"uso":"avaliacao","porque":"..."}
]}
"correta" é o número da alternativa certa, começando em 0 (0 é a primeira). No verdadeiro ou falso, 0 = Verdadeiro e 1 = Falso. A sequência não tem "correta".

CONTEÚDO DO TREINAMENTO
(cole aqui o texto, ou anexe o arquivo PPTX, PDF ou Word)
`;
const dlgIAV10 = dlgIA;
dlgIA = function () {
  dlgIAV10(); const f = $("#dlg .dl.ia"); if (!f || f.querySelector(".ia-pad")) return;
  const p = f.querySelector(":scope > p.sm.mut"); if (!p) return;
  p.insertAdjacentHTML("afterend", `<section class="ia-pad" aria-labelledby="ia-pad-t"><b id="ia-pad-t">Prompt padrão</b>
    <span class="sm">Copie e cole na IA que quiser, junto com o conteúdo do treinamento (cole o texto ou anexe o PPTX, PDF ou Word). A IA devolve um arquivo <b>.json</b> com explicações e perguntas de múltipla escolha, verdadeiro ou falso e sequência.</span>
    <span class="sm">Depois, importe o arquivo em <b>Novo &gt; Importar arquivo</b>, ou cole a resposta no fim desta tela.</span>
    <div class="ia-pad-b"><button type="button" class="b p" data-act="iapadrao">${ic("copy")}Copiar prompt padrão</button></div>
    <details><summary class="sm">Ver o texto do prompt</summary><textarea class="in ta mono" id="ia-pad-txt" readonly rows="8" aria-label="Texto do prompt padrão">${esc(PROMPT_PADRAO)}</textarea></details></section>
    <p class="sm mut ia-ou" style="margin:0">Ou monte um texto sob medida:</p>`);
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act=iapadrao]"); if (!el) return;
  const sel = () => { const d = el.closest(".ia-pad").querySelector("details"), o = $("#ia-pad-txt"); if (d) d.open = true; if (o) { o.focus(); o.select(); } aviso("Selecionei o texto: use Copiar."); };
  try { navigator.clipboard.writeText(PROMPT_PADRAO).then(() => aviso("Prompt copiado. Cole na IA com o conteúdo do treinamento."), sel); } catch (x) { sel(); }
});
/* importar: aceita o arquivo da IA mesmo com texto ou marcas de código em volta, e marca "Criado com IA" */
function jsonSolto(txt) {
  try { return JSON.parse(txt); } catch (e) {}
  const x = String(txt || "").trim().replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, ""), a = x.indexOf("{"), b = x.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("sem json");
  return JSON.parse(x.slice(a, b + 1));
}
function iaDeObjeto(o) { try { return lerRespostaIA(JSON.stringify(o)); } catch (e) { return null; } }
