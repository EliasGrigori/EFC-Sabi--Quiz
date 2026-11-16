/* ===== v1.6.0 parte 3 · Fatia D: fluidez completa (adaptada do fluidez.js do EFCwork v0.6.14/15) =====
   Título que entra letra por letra, lista que se rearruma (FLIP), aviso com o visto e a tremida no erro,
   faíscas no botão dourado quando deu certo, itens do Painel em sequência, desfoque no fim do que rola.
   Tudo para com "movimento reduzido". Durações só da escala (efc-movimento.css). */
const FZ = {tit: null, chave: "", foto: null, bt: null, tr: 0};
const fzMov = () => !Mov.reduzido();
/* as durações são lidas uma vez só: ler o estilo da página no meio do desenho obriga o navegador a recalcular tudo (custava 4 ms por troca de tela) */
const FZ_MS = {}; const fzMs = (n, d) => FZ_MS[n] != null ? FZ_MS[n] : (FZ_MS[n] = Mov.ms(n, d));

/* ---------- título: entra letra por letra, saindo do desfoque, só quando a tela muda ----------
   Revisor (16/11): redesenho por mudança de dado não anima; o leitor de tela ouve o título inteiro (aria-label),
   não as letras soltas; a partir da 25ª letra todas entram juntas com a última, então nada aparece seco no fim;
   no escuro cada letra leva o seu pedaço do degradê, então o fim não troca de cor. */
const FZ_MAX = 24;
function fzTitulo(trocouTela) {
  const s = $("#tb .tb-h1"); if (!s) { FZ.tit = null; return; }
  const t = s.textContent, ant = FZ.tit; FZ.tit = t;
  if (ant == null || ant === t || !trocouTela || !casca.pronta || !fzMov() || s.children.length) return;
  const h = s.closest("h1"), passo = fzMs("--duration-stagger", 40);
  h.classList.add("fz-tt"); h.setAttribute("aria-label", t);
  s.innerHTML = `<span class="fz-ls" aria-hidden="true">${[...t].map((c, i) => c === " " ? " " : `<span class="fz-l" style="--i:${Math.min(i, FZ_MAX)}">${esc(c)}</span>`).join("")}</span>`;
  /* o pedaço do degradê de cada letra só importa no escuro; as medidas são lidas todas antes de escrever (uma conta de layout só) */
  if (document.documentElement.getAttribute("data-tema") === "escuro") {
    const ls = [...s.querySelectorAll(".fz-l")], w = h.clientWidth, xs = ls.map(l => l.offsetLeft);
    h.style.setProperty("--fz-w", w + "px"); ls.forEach((l, i) => l.style.setProperty("--fz-x", xs[i] + "px"));
  }
  const fim = Math.min(t.length - 1, FZ_MAX) * passo + fzMs("--duration-very-slow", 500) + 80;
  setTimeout(() => { if (s.isConnected && s.textContent === t) { s.textContent = t; h.classList.remove("fz-tt"); h.removeAttribute("aria-label"); h.style.removeProperty("--fz-w"); } }, fim);
}

/* ---------- lista que muda com a busca, o filtro, a ordem ou a vista: as linhas deslizam até o lugar novo (nas duas direções);
   as que saem da lista somem suavemente no lugar onde estavam ---------- */
function fzAntes() {
  const k = rota().v + "|" + (rota().id || ""), app = $("#app");
  FZ.foto = null;
  if (!app || k !== FZ.chave || !fzMov()) return;
  const els = app.querySelectorAll("[data-fz]"); if (!els.length || els.length > 150) return;
  const m = {};
  els.forEach(e => { const r = e.getBoundingClientRect(); m[e.dataset.fz] = {x: r.left, y: r.top, w: r.width, h: r.height, el: e}; });
  FZ.foto = m;
}
function fzDepois() {
  const k = rota().v + "|" + (rota().id || ""), mesma = k === FZ.chave; FZ.chave = k;
  fzTitulo(!mesma);
  const foto = FZ.foto; FZ.foto = null;
  if (!mesma || !foto) return;
  const app = $("#app"), d = fzMs("--duration-fast", 250), ease = "cubic-bezier(.22,1,.36,1)", vivos = new Set();
  app.querySelectorAll("[data-fz]").forEach(e => {
    const f = foto[e.dataset.fz], r = e.getBoundingClientRect(); vivos.add(e.dataset.fz);
    if (!f) e.animate([{opacity: 0, transform: "scale(.98)"}, {opacity: 1, transform: "none"}], {duration: d, easing: ease});
    else if (Math.abs(f.x - r.left) > 1 || Math.abs(f.y - r.top) > 1) e.animate([{transform: `translate(${f.x - r.left}px,${f.y - r.top}px)`}, {transform: "none"}], {duration: d, easing: ease});
  });
  const cont = app.querySelector(".tbl") || app; let n = 0;
  for (const id in foto) {
    if (vivos.has(id) || ++n > 30) continue;
    const f = foto[id], g = f.el, c = cont.getBoundingClientRect();
    if (getComputedStyle(cont).position === "static") cont.style.position = "relative";
    g.setAttribute("aria-hidden", "true"); g.inert = true;
    Object.assign(g.style, {position: "absolute", margin: "0", pointerEvents: "none", zIndex: "1", left: (f.x - c.left - cont.clientLeft) + "px", top: (f.y - c.top - cont.clientTop) + "px", width: f.w + "px", height: f.h + "px"});
    cont.appendChild(g);
    g.animate([{opacity: 1, transform: "none"}, {opacity: 0, transform: "scale(.98)"}], {duration: fzMs("--duration-quick", 150), easing: ease, fill: "forwards"}).onfinish = () => g.remove();
  }
}

/* ---------- aviso: o visto que se desenha quando deu certo; a tremida curta quando é erro, depois que ele terminou de subir ---------- */
function avisoMov(el, tipo, novo) {
  clearTimeout(FZ.tr); el.classList.remove("fz-treme");
  if (tipo === "ok") {
    const v = el.querySelector(".av-vs");
    if (!fzMov()) { if (v) v.setAttribute("data-state", "in"); }
    else setTimeout(() => { if (v && v.isConnected) Mov.visto(v); }, 90);
    fzFaisca();
  } else if (tipo === "erro" && fzMov()) {
    FZ.tr = setTimeout(() => { void el.offsetWidth; el.classList.add("fz-treme"); FZ.tr = setTimeout(() => el.classList.remove("fz-treme"), fzMs("--duration-quick", 150) + 30); }, novo ? fzMs("--duration-medium", 350) : 0);
  }
}
/* faíscas: só no botão dourado (ação principal), e só quando o aviso diz que deu certo */
document.addEventListener("pointerdown", e => { const b = e.target.closest && e.target.closest(".b.p"); if (b) FZ.bt = {x: e.clientX, y: e.clientY, t: Date.now()}; }, true);
function fzFaisca() {
  const p = FZ.bt; FZ.bt = null; if (!p || Date.now() - p.t > 2500 || !fzMov()) return;
  const s = document.createElement("span"); s.className = "fz-spk"; s.setAttribute("aria-hidden", "true"); s.style.left = p.x + "px"; s.style.top = p.y + "px";
  for (let i = 0; i < 8; i++) { const r = document.createElement("i"); r.style.setProperty("--r", (i * 45) + "deg"); s.appendChild(r); }
  document.body.appendChild(s); setTimeout(() => s.remove(), fzMs("--duration-very-slow", 500) + 40);
}

/* ---------- Painel: os itens entram em sequência (40 ms entre um e outro, até o 6º) e o fim desfoca quando tem mais ---------- */
function fzSequencia(raiz) {
  if (!raiz || !fzMov()) return;
  raiz.querySelectorAll(".pn-f > *, .pn-l > li, .pn-vr, .pn-cm").forEach((x, i) => { if (i < 12) { x.style.setProperty("--i", Math.min(i, 5)); x.classList.remove("fz-li"); void x.offsetWidth; x.classList.add("fz-li"); } });
}
function fzFimLista(c) { if (c) c.classList.toggle("fz-mais", c.scrollHeight - c.scrollTop - c.clientHeight > 6); }
document.addEventListener("scroll", e => { const c = e.target; if (c && c.id === "dlg" || (c && c.id === "rail")) fzFimLista(c); }, true);

/* ---------- janela: conteúdo novo começa do zero (a Versões não herda o deslize da gaveta que estava saindo) ---------- */
const fzShowModal = HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal = function () { if (this.id === "dlg" && !this.open) this.getAnimations().forEach(a => a.cancel()); return fzShowModal.call(this); };
new MutationObserver(() => {
  const d = $("#dlg"); if (!d) return;
  if (d.querySelector(".dl.pn")) setTimeout(() => { fzSequencia(d); fzFimLista(d); }, 0);
}).observe(document.getElementById("dlg"), {childList: true});
document.addEventListener("click", e => { if (e.target.closest('[data-act="pntab"]')) setTimeout(() => { fzSequencia($("#pn-corpo")); fzFimLista($("#dlg")); }, 0); });
document.addEventListener("click", e => { if (e.target.closest('[data-act="menuabre"]')) setTimeout(() => fzFimLista($("#rail")), 30); });

/* ===== v1.6.0 parte 4 · Fatia E: movimento do telão e do celular do participante =====
   O telão e o celular são redesenhados a cada novidade (alguém entra, alguém responde, uma resposta atrasada chega).
   A entrada só acontece quando a etapa muda. Se a tela for redesenhada no meio da entrada, as animações recomeçam do ponto
   em que estavam (atraso negativo, FZ_OFF), então nada pula nem apaga de novo. Sem animação, tudo aparece no estado final. */
const TEL = {chave: null, ant0: null, t0: 0};
const CELM = {tela: null, t0: 0};
const FZ_JANELA = 2400;   /* depois disso, a entrada já terminou: redesenho não refaz nada */
let FZ_OFF = 0;
const fzEase = "cubic-bezier(.22,1,.36,1)";
const fzA = (el, kf, o) => el && el.animate ? el.animate(kf, Object.assign({easing: fzEase, fill: "backwards"}, o, {delay: (o.delay || 0) - FZ_OFF})) : null;
function fzEntra(els, o = {}) {
  const d = o.d || fzMs("--duration-medium", 350), passo = o.passo == null ? fzMs("--duration-stagger", 40) : o.passo, max = o.max == null ? 6 : o.max, y = o.y == null ? 14 : o.y, base = o.atraso || 0;
  [...els].filter(Boolean).forEach((e, i) => fzA(e, [{opacity: 0, transform: `translateY(${y}px)${o.esc ? " scale(" + o.esc + ")" : ""}`}, {opacity: 1, transform: "none"}], {duration: d, delay: base + Math.min(i, max) * passo}));
}
/* três pontos que acendem uma vez, um depois do outro (Conferindo, Conectando); acesos é o estado normal */
function fzPontos(raiz) { raiz.querySelectorAll(".cf-pt i").forEach((i, n) => fzA(i, [{opacity: .25}, {opacity: 1}], {duration: fzMs("--duration-fast", 250), delay: n * fzMs("--duration-medium", 350)})); }
function telChave(sn) { if (!sn) return "nada"; const f = sn.fase || {}; return [sn.id, f.etapa, f.idx, f.conf ? "c" : (f.etapa === "resultado" ? "r" : "")].join("|"); }
function telAntes(w) { return {nomes: new Set([...w.querySelectorAll(".cw")].map(e => e.dataset.n || e.textContent))}; }
function telMov(w, sn, antes) {
  const k = telChave(sn), agora = performance.now(), novo = k !== TEL.chave;
  if (novo) { TEL.ant0 = TEL.chave; TEL.chave = k; TEL.t0 = agora; }
  const t = w.querySelector(".tel"); if (!t || !fzMov()) return;
  const desde = agora - TEL.t0;
  if (!novo) {   /* mesma etapa: quem acabou de entrar na sala aparece suave */
    if (antes) w.querySelectorAll(".cw").forEach(e => { if (!antes.nomes.has(e.dataset.n || e.textContent)) fzA(e, [{opacity: 0, transform: "scale(.9)"}, {opacity: 1, transform: "none"}], {duration: fzMs("--duration-fast", 250)}); });
    if (desde > FZ_JANELA) return;
  }
  FZ_OFF = novo ? 0 : desde;
  try { telEntrada(t, sn, TEL.ant0, antes && !novo ? antes.nomes : null); } finally { FZ_OFF = 0; }
}
function telEntrada(t, sn, ant, jaTinha) {
  const f = sn && sn.fase || {}, et = f.etapa, pa = (ant || "").split("|"), mesmoItem = !!sn && pa[0] === sn.id && +pa[2] === f.idx && ["pergunta", "resultado"].includes(pa[1]) && ["pergunta", "resultado"].includes(et);
  if (!mesmoItem) fzEntra(t.querySelectorAll(".tt > b, .tt > span:not(.pillk), .tt .tprog"), {d: fzMs("--duration-quick", 150), y: 0, passo: 0});
  if (!sn) { fzEntra(t.querySelectorAll(".vaz > div")); return; }
  if (et === "espera") fzEntra([t.querySelector(".join"), t.querySelector(".rh"), ...[...t.querySelectorAll(".cw")].filter(e => !jaTinha || jaTinha.has(e.dataset.n || e.textContent)), ...t.querySelectorAll(".facts > div")], {max: 12});
  else if (et === "explicacao") fzEntra(t.querySelectorAll(".expl > *"));
  else if (et === "pergunta" || et === "resultado") {
    if (!mesmoItem) {
      fzEntra([t.querySelector(".tq")]);
      fzEntra(t.querySelectorAll(".tile, .ordl > div"), {d: fzMs("--duration-fast", 250), y: 0, esc: .96, atraso: 80});
      fzEntra(t.querySelectorAll(".answ > *"), {d: fzMs("--duration-fast", 250), y: 0, passo: 0, atraso: 150});
    }
    if (f.conf) fzPontos(t);
    else if (et === "resultado") {   /* revelar: véu nas erradas, contorno na certa; a letra das erradas some e volta já na cor nova (não troca seca) */
      const d = fzMs("--duration-medium", 350);
      t.querySelectorAll(".tile.off").forEach(e => { try { e.animate([{opacity: 0}, {opacity: .72}], {duration: d, easing: fzEase, pseudoElement: "::before", fill: "backwards", delay: -FZ_OFF}); } catch (x) {} fzEntra(e.children, {d: fzMs("--duration-fast", 250), y: 0, passo: 0, atraso: 100}); });
      t.querySelectorAll(".tile.cor").forEach(e => { try { e.animate([{opacity: 0, transform: "scale(1.04)"}, {opacity: 1, transform: "none"}], {duration: d, easing: fzEase, pseudoElement: "::after", fill: "backwards", delay: -FZ_OFF}); } catch (x) {} });
      fzEntra(t.querySelectorAll(".tile.cor .pc, .ordl > div"), {d: fzMs("--duration-fast", 250), y: 0, esc: .96});
      fzEntra(t.querySelectorAll(".answ > *"), {d: fzMs("--duration-fast", 250), y: 6, passo: 0});
    }
  } else if (et === "podio") {
    fzEntra(t.querySelectorAll(".podl > div:first-child, .podr"));
    t.querySelectorAll(".pq .bar i").forEach((b, i) => fzA(b, [{transform: "scaleY(0)"}, {transform: "none"}], {duration: fzMs("--duration-very-slow", 500), delay: 150 + Math.min(i, 10) * fzMs("--duration-stagger", 40)}));
    fzEntra(t.querySelectorAll(".pq b, .pq > div > span:last-child"), {d: fzMs("--duration-fast", 250), y: 0, passo: 0, atraso: 400});
    /* blocos do pódio sobem: 3º, 2º e por último o 1º */
    const ord = {p3: 300, p2: 450, p1: 600};
    t.querySelectorAll(".stage .pl").forEach(pl => {
      const pos = pl.classList.contains("p1") ? "p1" : pl === pl.parentElement.firstElementChild ? "p2" : "p3", at = ord[pos];
      fzA(pl.querySelector(".blk"), [{transform: "scaleY(0)"}, {transform: "none"}], {duration: fzMs("--duration-very-slow", 500), delay: at});
      fzA(pl.querySelector(".avb, .av"), [{opacity: 0, transform: "translateY(20px)"}, {opacity: 1, transform: "none"}], {duration: fzMs("--duration-medium", 350), delay: at + 300});
    });
    fzFesta(t, t.querySelector(".stage .p1 .blk") || t.querySelector(".podl h2"), 1000);
  }
}
/* festa do pódio: os papéis coloridos saem uma vez de cima do 1º lugar e somem (500 ms cada), nada que cai sem parar.
   O bloco ainda está achatado quando a festa é marcada: o topo é calculado pela base e pela altura de verdade dele. */
function fzFesta(t, alvo, atraso) {
  const c = t.querySelector(".conf"); if (!c || !alvo) return;
  const rt = t.getBoundingClientRect(), k = rt.width / 1280 || 1, ra = alvo.getBoundingClientRect();
  const x0 = (ra.left + ra.width / 2 - rt.left) / k, y0 = (ra.bottom - rt.top) / k - alvo.offsetHeight;
  [...c.children].forEach((p, n) => {
    const ang = (-90 + ((n * 47) % 140) - 70) * Math.PI / 180, dist = 120 + (n * 53) % 150, dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist + 40, rot = ((n * 97) % 360) - 180;
    p.style.left = x0 + "px"; p.style.top = y0 + "px";
    fzA(p, [{opacity: 1, transform: "translate(-50%,0) rotate(0deg)"}, {opacity: 0, transform: `translate(calc(-50% + ${dx}px),${dy}px) rotate(${rot}deg)`}], {duration: fzMs("--duration-very-slow", 500), delay: atraso + (n % 6) * fzMs("--duration-stagger", 40), easing: "cubic-bezier(.16,1,.3,1)", fill: "both"});
  });
}
/* celular do participante: a tela nova entra; as alternativas em sequência; o visto e o cartão do resultado aparecem.
   Redesenho na mesma tela (alguém entrou, chegou a contagem) continua de onde estava. */
function celMov(antes, tela) {
  const agora = performance.now();
  if (tela !== CELM.tela) { CELM.tela = tela; CELM.t0 = agora; }
  if (!fzMov()) return;
  const desde = antes === tela ? agora - CELM.t0 : 0;
  if (antes === tela && desde > FZ_JANELA) return;
  const cb = $("#app .cb"); if (!cb) return;
  FZ_OFF = desde;
  try {
    fzEntra(cb.children, {d: fzMs("--duration-fast", 250), y: 10});
    fzEntra(cb.querySelectorAll(".ct2, .ot"), {d: fzMs("--duration-fast", 250), y: 0, esc: .97, atraso: 80});
    cb.querySelectorAll(".ok-i").forEach(e => fzA(e, [{opacity: 0, transform: "scale(.8)"}, {opacity: 1, transform: "none"}], {duration: fzMs("--duration-fast", 250), delay: 80}));
    fzPontos(cb);
  } finally { FZ_OFF = 0; }
}
