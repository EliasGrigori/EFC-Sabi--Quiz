/* ===== v1.6.0 · casca no padrão da família EFC (EFCwork v0.6.16): tema, menu em grupos, caminho no topo, cabeçalho, abas =====
   Só muda a tela: rotas, dados e funções continuam os mesmos. Movimento pela escala da família (efc-movimento.css). */

/* ---------- tema Claro e Escuro ---------- */
const temaMQ = matchMedia("(prefers-color-scheme: dark)");
function temaEfetivo() { const t = S && S.cfg ? S.cfg.tema : "auto"; return t === "claro" || t === "escuro" ? t : (temaMQ.matches ? "escuro" : "claro"); }
function pintaTema() {
  const t = temaEfetivo(), el = document.documentElement;
  el.setAttribute("data-tema", t);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === "escuro" ? "#121524" : "#fffefb";
  const b = $("#btTema"); if (b) { b.dataset.state = t === "escuro" ? "b" : "a"; b.setAttribute("aria-label", t === "escuro" ? "Usar tema claro" : "Usar tema escuro"); b.title = b.getAttribute("aria-label"); }
}
/* troca de tema sem corte seco: as duas telas se cruzam em 250 ms (onde o navegador sabe fazer) */
function trocaTemaSuave(fn) {
  if (!document.startViewTransition || Mov.reduzido()) { fn(); return; }
  document.documentElement.classList.add("vt-tema");
  let vt; try { vt = document.startViewTransition(fn); } catch(e) { fn(); document.documentElement.classList.remove("vt-tema"); return; }
  vt.ready.catch(() => {}); vt.updateCallbackDone.catch(() => {});
  vt.finished.catch(() => {}).finally(() => document.documentElement.classList.remove("vt-tema"));
}
function aplicarTema() {
  if (document.documentElement.getAttribute("data-tema") && document.documentElement.getAttribute("data-tema") !== temaEfetivo() && casca.pronta) trocaTemaSuave(pintaTema);
  else pintaTema();
  try { localStorage.setItem("sabia-tema", S.cfg.tema); } catch(e) {}
}
temaMQ.addEventListener && temaMQ.addEventListener("change", () => { if (S && S.cfg.tema !== "claro" && S.cfg.tema !== "escuro") aplicarTema(); });

/* ---------- mapa do app: grupos do menu e caminho de cada tela ---------- */
const NAVG = [
  [null, [["inicio", "Início", "home"]]],
  ["Treinamentos", [["treinos", "Treinos", "list"], ["pendencias", "Pendências", "flag"]]],
  ["Turma", [["pessoas", "Pessoas", "people"], ["mensagens", "Mensagens", "chat"]]],
  ["Análise", [["relatorios", "Relatórios", "chart"], ["conferir", "Autenticar documento", "shield"]]]
];
const NAVPE = [["ajustes", "Ajustes", "gear"]];
const NAV = NAVG.flatMap(g => g[1]).concat(NAVPE);   /* lista plana (compatível com o código antigo) */
/* a que item do menu cada tela pertence (o Editor, o Aplicar e a Sala ficam dentro de Treinos) */
const DONO = {aplicar: "treinos", sala: "treinos", editar: "treinos", apresentar: "treinos"};
const ITEM = id => NAV.find(x => x[0] === id);
const GRUPO = id => (NAVG.find(g => g[1].some(x => x[0] === id)) || [null])[0];
const casca = {pronta: false, chave: "", abas: {}};
/* durações lidas uma vez dos tokens (ler a cada troca obrigaria o navegador a recalcular o estilo antes da hora) */
let DUR = null;
const dur = k => (DUR || (DUR = {fast: Mov.ms("--duration-fast", 250), quick: Mov.ms("--duration-quick", 150), medium: Mov.ms("--duration-medium", 350)}))[k];

function menu(v) {
  const at = DONO[v] || v;
  const atm = ["mais", "pessoas", "relatorios", "conferir", "ajustes"].includes(v) ? "mais" : at;   /* no celular, essas telas ficam sob "Mais" */
  const pd = pendencias().total, mg = novasMsgs(), cont = (n, t1, tn) => n ? `<b class="pdn-n" aria-label="${n} ${n === 1 ? t1 : tn}">${n > 99 ? "99+" : n}</b>` : "";
  const nb = id => id === "pendencias" ? cont(pd, "pendência", "pendências") : id === "mensagens" ? cont(mg, "mensagem nova", "mensagens novas") : "";
  const item = ([id, nome, i]) => `<a class="ri" href="#/${id}" ${at === id ? 'aria-current="page"' : ""} data-nome="${nome}"><span class="ri-ic">${ic(i)}</span><span class="ri-nm">${nome}</span>${nb(id)}</a>`;
  const grupos = NAVG.map(([g, its]) => { const ok = its.filter(x => navOk(x[0])); return ok.length ? `${g ? `<div class="gh">${g}</div>` : ""}${ok.map(item).join("")}` : ""; }).join("");
  $("#rail").innerHTML = `<div class="rl-topo"><a class="rl-marca" href="#/inicio" aria-label="Sabiá, ir para o Início"><span class="lg" aria-hidden="true"><svg viewBox="0 0 48 48"><use href="#logo"/></svg></span><span class="rl-nm"><b>Sabiá</b><span>treinamentos</span></span></a>
    <button class="b ic g rl-alt" type="button" data-act="menurecolhe" aria-label="${document.documentElement.classList.contains("m-ic") ? "Abrir o menu" : "Recolher o menu"}" title="${document.documentElement.classList.contains("m-ic") ? "Abrir o menu" : "Recolher o menu"}">${ic("chevl")}</button>
    <button class="b ic g rl-fecha" type="button" data-act="menufecha" aria-label="Fechar o menu">${ic("x")}</button></div>
    <nav class="rl-nav" aria-label="Menu principal">${grupos}</nav>
    <div class="rl-pe">${NAVPE.filter(x => navOk(x[0])).map(item).join("")}<div class="rl-v">Sabiá v${VERSAO}</div></div>`;
  const bi = ([id, nome, i]) => `<a href="#/${id}" ${atm === id ? 'aria-current="page"' : ""} ${id === "mais" ? 'data-act="menuabre" aria-haspopup="true" aria-expanded="false" aria-controls="rail"' : ""}><span class="pill">${ic(i)}${nb(id)}</span>${nome}</a>`;
  $("#bnav").innerHTML = NAV.filter(x => ["inicio", "treinos", "pendencias", "mensagens"].includes(x[0]) && navOk(x[0])).concat([["mais", "Mais", "grid"]]).map(bi).join("");
}

/* caminho no topo: Grupo / Tela / item aberto. Cada degrau que é tela abre ao tocar. */
function caminho(v, titulo) {
  if (v === "inicio") return [["Início"]];
  if (v === "mais") return [["Menu"]];
  const dono = DONO[v] || v, it = ITEM(dono), g = GRUPO(dono), nome = it ? it[1] : titulo;
  const passos = []; if (g) passos.push([g]);
  const fundo = DONO[v] || rota().id || (titulo && titulo !== nome && v !== "ajustes");
  passos.push(fundo ? [nome, "#/" + dono] : [nome]);
  if (fundo) passos.push([v === "editar" ? "Editor" : v === "aplicar" ? "Aplicar" : v === "sala" ? "Sala ao vivo" : v === "relatorios" && titulo === nome ? (rota().id === "desafio" ? "Desafio entre setores" : "Sessão") : titulo]);
  return passos;
}
function topo(titulo, sub, extra = "", voltar = "", pilulas = null) {
  const r = rota(), passos = caminho(r.v, titulo);
  const fa = document.activeElement, foco = fa && $("#topo").contains(fa) ? (fa.id ? "#" + fa.id : fa.dataset.act ? `[data-act="${fa.dataset.act}"]` : fa.getAttribute("href") ? `a[href="${fa.getAttribute("href")}"]` : "") : "";
  $("#topo").innerHTML = `<button class="b ic g tp-menu" type="button" data-act="menuabre" aria-label="Abrir o menu" aria-haspopup="true" aria-expanded="false" aria-controls="rail">${ic("menu")}</button>
    <nav class="tp-cam" aria-label="Você está em"><ol>${passos.map(([n, h], i) => `<li>${h ? `<a href="${h}">${esc(n)}</a>` : `<span ${i === passos.length - 1 ? 'aria-current="page"' : ""}>${esc(n)}</span>`}</li>`).join("")}</ol></nav>
    <span class="tp-sp"></span>
    <button class="b ic g t-icon-swap tp-tema" type="button" id="btTema" data-act="temaalterna" data-state="${temaEfetivo() === "escuro" ? "b" : "a"}"><span class="t-icon" data-icon="a">${ic("lua")}</span><span class="t-icon" data-icon="b">${ic("sol")}</span></button>`;
  pintaTema();
  if (foco) { const el = $("#topo").querySelector(foco); if (el) el.focus({preventScroll: true}); }
  const pls = pilulas ? `<div class="pls">${pilulas.map(([v, l]) => `<span class="tb-pl"><b class="num">${esc(String(v))}</b> ${esc(l)}</span>`).join("")}</div>` : "";
  $("#tb").innerHTML = `${voltar ? `<a class="b ic g tb-volta" href="${voltar}" aria-label="Voltar">${ic("back")}</a>` : ""}<div class="tb-t"><h1><span class="tb-h1">${esc(titulo)}</span></h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}${pls}</div><div class="grow"></div>${extra ? `<div class="tb-acts">${extra}</div>` : ""}`;
}

/* ---------- menu: recolher (PC) e abrir como gaveta (celular) ---------- */
const celular = () => matchMedia("(max-width:760px)").matches;
function menuRecolhe() {
  const html = document.documentElement, mn = $("#mn"), x0 = mn.getBoundingClientRect().left;
  const filhos = [...mn.children];
  html.classList.toggle("m-ic");
  try { localStorage.setItem("sabia-menu", html.classList.contains("m-ic") ? "ic" : ""); } catch(e) {}
  menu(rota().v);
  const dx = x0 - mn.getBoundingClientRect().left;   /* o conteúdo desliza até o lugar novo (só transform) */
  if (dx && !Mov.reduzido()) filhos.forEach(f => f.animate([{transform: `translateX(${dx}px)`}, {transform: "none"}], {duration: dur("medium"), easing: "cubic-bezier(.22,1,.36,1)"}));
  $("#rail").querySelectorAll(".ri-nm,.rl-nm,.gh,.rl-v").forEach(e => !Mov.reduzido() && e.animate([{opacity: 0}, {opacity: 1}], {duration: dur("quick"), easing: "ease-out"}));
}
let menuHist = false, menuVolta = null;
const menuAberto = () => document.documentElement.classList.contains("menu-aberto");
function menuMarca(aberto) {
  document.documentElement.classList.toggle("menu-aberto", aberto); $("#ladoFundo").setAttribute("aria-hidden", aberto ? "false" : "true");
  ["#mn", "#bnav"].forEach(q => { const el = $(q); if (el) el.inert = aberto; });   /* o que está atrás não recebe toque nem Tab */
  const rl = $("#rail"); if (aberto) { rl.setAttribute("role", "dialog"); rl.setAttribute("aria-modal", "true"); } else { rl.removeAttribute("role"); rl.removeAttribute("aria-modal"); }
  document.querySelectorAll('[data-act="menuabre"]').forEach(b => b.setAttribute("aria-expanded", String(aberto)));
}
function menuAbre() {
  if (!celular() || menuAberto()) return;
  menuVolta = document.activeElement;
  menuMarca(true);
  try { history.pushState({sabiaMenu: 1}, "", location.href); menuHist = true; } catch(e) {}   /* o voltar do celular fecha o menu primeiro */
  setTimeout(() => { const a = $("#rail .ri[aria-current]") || $("#rail .ri"); a && a.focus({preventScroll: true}); }, 30);
}
function menuFecha(doVoltar) {
  if (!menuAberto()) return false;
  menuMarca(false);
  if (menuHist && !doVoltar) { menuHist = false; history.back(); } else menuHist = false;
  const v = menuVolta; menuVolta = null; if (v && v.isConnected) v.focus({preventScroll: true});   /* o foco volta para quem abriu */
  return true;
}
window.addEventListener("popstate", () => { if (menuAberto()) menuFecha(true); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !document.querySelector("dialog[open]") && menuFecha()) e.stopPropagation(); }, true);
/* com o menu aberto no celular, o Tab gira só dentro dele */
document.addEventListener("keydown", e => {
  if (e.key !== "Tab" || !menuAberto()) return;
  const fs = [...$("#rail").querySelectorAll("a[href],button:not([disabled])")].filter(x => x.offsetParent); if (!fs.length) return;
  const i = fs.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); fs[fs.length - 1].focus(); } else if (!e.shiftKey && (i === -1 || i === fs.length - 1)) { e.preventDefault(); fs[0].focus(); }
});

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "menurecolhe") { e.preventDefault(); menuRecolhe(); }
  else if (a === "menuabre") { if (celular()) { e.preventDefault(); menuAbre(); } }
  else if (a === "menufecha") { e.preventDefault(); menuFecha(); }
  else if (a === "temaalterna") { S.cfg.tema = temaEfetivo() === "escuro" ? "claro" : "escuro"; salvar(); aplicarTema(); const sel = $("#app [data-act='tema'][data-v='" + S.cfg.tema + "']"); if (sel) render(); }
});
/* tocar num item do menu aberto no celular: a tela nova toma o lugar do registro do menu no histórico
   (assim o voltar do aparelho volta para a tela de antes, sem passo morto e sem depender da ordem de eventos do navegador) */
document.addEventListener("click", e => {
  const a = e.target.closest("#rail a[href]"); if (!a || !menuAberto()) return;
  const h = a.getAttribute("href"), tinha = menuHist && history.state && history.state.sabiaMenu;
  menuHist = false; menuVolta = null; menuMarca(false);
  if (tinha) { e.preventDefault(); history.replaceState(null, "", h); window.dispatchEvent(new HashChangeEvent("hashchange")); }
}, true);

/* ---------- abas: o traço desliza da aba anterior até a nova ---------- */
function abasTraco() {
  document.querySelectorAll(".seg.abas").forEach(g => {
    const on = g.querySelector('button[aria-pressed="true"]'); let ln = g.querySelector(".abas-linha");
    if (!ln) { ln = document.createElement("i"); ln.className = "abas-linha"; ln.setAttribute("aria-hidden", "true"); g.appendChild(ln); }
    if (!on) { ln.style.opacity = "0"; return; }
    const gr = g.getBoundingClientRect(), r = on.getBoundingClientRect(), x = r.left - gr.left + g.scrollLeft, w = r.width;
    const k = g.getAttribute("aria-label") || "", ant = casca.abas[k];
    casca.abas[k] = {x, w};
    const pos = (p) => `translateX(${p.x}px) scaleX(${p.w / 100})`;
    ln.style.opacity = "1";
    if (ant && (ant.x !== x || ant.w !== w) && !Mov.reduzido()) {
      ln.style.transition = "none"; ln.style.transform = pos(ant); ln.getBoundingClientRect();
      ln.style.transition = ""; ln.style.transform = pos({x, w});
    } else { ln.style.transition = "none"; ln.style.transform = pos({x, w}); ln.getBoundingClientRect(); ln.style.transition = ""; }
  });
}

/* ---------- troca de tela e de aba sem corte seco ----------
   Só anima quando muda a tela ou a aba de dentro; redesenhar porque um dado mudou não anima. */
const ORDEM = ["inicio", "treinos", "editar", "aplicar", "sala", "pendencias", "pessoas", "mensagens", "relatorios", "conferir", "ajustes", "mais"];
function chaveTela() { const r = rota(); return [r.v, r.id || "", ...[...document.querySelectorAll(".seg.abas")].map(g => (g.querySelector('button[aria-pressed="true"]') || {}).dataset?.v || "")].join("|"); }
function cascaDepois() {
  requestAnimationFrame(abasTraco);   /* mede no próximo quadro: o render não força o navegador a montar a tela duas vezes */
  const k = chaveTela(), ant = casca.chave; casca.chave = k;
  if (!casca.pronta || !ant || ant === k || Mov.reduzido()) return;
  const [v0] = ant.split("|"), [v1] = k.split("|");
  let dir = 0;
  if (v0 !== v1) dir = ORDEM.indexOf(v1) >= ORDEM.indexOf(v0) ? 1 : -1;
  else { const a0 = ant.split("|").slice(2), a1 = k.split("|").slice(2); const g = [...document.querySelectorAll(".seg.abas")]; for (let i = 0; i < a1.length; i++) if (a0[i] !== a1[i]) { const bs = [...(g[i] || document).querySelectorAll("button")].map(b => b.dataset.v); dir = bs.indexOf(a1[i]) >= bs.indexOf(a0[i]) ? 1 : -1; break; } }
  const alvo = $("#app"); if (!alvo) return;
  alvo.animate([{opacity: 0, transform: `translateX(${12 * dir}px)`}, {opacity: 1, transform: "none"}], {duration: dur("fast"), easing: "cubic-bezier(.22,1,.36,1)"});
  /* o título entra letra por letra (fluidez.js, fzTitulo) */
}
let rzW = innerWidth, rzF = 0;
window.addEventListener("resize", () => { if (innerWidth === rzW || rzF) return; rzF = requestAnimationFrame(() => { rzF = 0; rzW = innerWidth; casca.abas = {}; abasTraco(); if (!celular()) menuFecha(); }); });
