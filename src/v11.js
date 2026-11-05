/* ===== v1.1.0 · telão (tela cheia, projetor, apresentação), folha de reforço em PDF, painel do treinamento ===== */

/* ---------- telão: tela cheia, modo projetor e modo apresentação ---------- */
const TV = {modo: "padrao", fs: false, idle: 0, dica: 0};
function tvLer() { try { const m = localStorage.getItem("sabia-telao-modo"); return m === "projetor" || m === "apresentacao" ? m : "padrao"; } catch (e) { return "padrao"; } }
function tvSalvar() { try { localStorage.setItem("sabia-telao-modo", TV.modo); } catch (e) {} }
const tvAtalhos = "Espaço ou seta para a direita avança · A sai da apresentação";
function tvBarra() {
  return `<div class="tvbar" id="tvbar" role="toolbar" aria-label="Opções do telão">
    <button class="b" data-act="tvfull" aria-pressed="false" title="Tela cheia (F)">${ic("screen")}<span>Tela cheia</span><kbd>F</kbd></button>
    <button class="b" data-act="tvmodo" data-v="projetor" aria-pressed="false" title="Fundo claro e contraste forte, para projetor fraco (P)"><span>Projetor</span><kbd>P</kbd></button>
    <button class="b" data-act="tvmodo" data-v="apresentacao" aria-pressed="false" title="Tela cheia, sem mouse e avanço pelo teclado (A)"><span>Apresentação</span><kbd>A</kbd></button></div>
    <div class="tvdica" id="tvdica" role="status" hidden></div>`;
}
function tvDica(t, ms) {
  const d = $("#tvdica"); if (!d) return; d.textContent = t; d.hidden = false; clearTimeout(TV.dica);
  TV.dica = setTimeout(() => { d.hidden = true; }, ms || 3500);
}
function tvAplicar() {
  const w = $(".telfull"); if (!w) return;
  w.classList.toggle("proj", TV.modo === "projetor"); w.classList.toggle("apr", TV.modo === "apresentacao");
  document.querySelectorAll("#tvbar [data-act=tvmodo]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === TV.modo)));
  const f = document.querySelector("#tvbar [data-act=tvfull]"); if (f) f.setAttribute("aria-pressed", String(!!document.fullscreenElement));
}
function tvMostrar() {
  const w = $(".telfull"), b = $("#tvbar"); if (!w || !b) return;
  b.classList.add("on"); w.classList.remove("idle"); clearTimeout(TV.idle);
  TV.idle = setTimeout(() => { b.classList.remove("on"); w.classList.add("idle"); }, 2800);
}
function tvFull() {
  try {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    const el = document.documentElement;
    if (el.requestFullscreen) { const p = el.requestFullscreen(); if (p && p.then) p.then(() => { TV.fs = true; tvAplicar(); }, () => tvDica("O navegador não liberou a tela cheia. Aperte F11.")); }
    else tvDica("Aperte F11 para a tela cheia.");
  } catch (e) { tvDica("O navegador não liberou a tela cheia. Aperte F11."); }
}
function tvModo(m) {
  TV.modo = TV.modo === m ? "padrao" : m; tvSalvar(); tvAplicar(); tvMostrar();
  if (TV.modo === "apresentacao") { if (!document.fullscreenElement) tvFull(); tvDica(tvAtalhos, 5000); }
  else if (m === "apresentacao" && document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
}
/* chamado por vTelao depois de montar a tela */
function tvIniciar() {
  TV.modo = tvLer(); tvAplicar(); tvMostrar();
  if (TV.modo === "apresentacao") tvDica(tvAtalhos, 5000);
}
document.addEventListener("fullscreenchange", () => {
  if (rota().v !== "telao") return;
  if (!document.fullscreenElement && TV.modo === "apresentacao" && TV.fs) { TV.modo = "padrao"; tvSalvar(); }
  if (!document.fullscreenElement) TV.fs = false;
  tvAplicar(); escalar();
});
["pointermove", "pointerdown", "touchstart"].forEach(ev => document.addEventListener(ev, () => { if (rota().v === "telao") tvMostrar(); }, {passive: true}));
document.addEventListener("keydown", e => {
  if (rota().v !== "telao" || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key, tg = e.target && e.target.tagName; if (tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT") return;
  if (k === "f" || k === "F") { e.preventDefault(); tvFull(); tvMostrar(); }
  else if (k === "p" || k === "P") { e.preventDefault(); tvModo("projetor"); }
  else if (k === "a" || k === "A") { e.preventDefault(); tvModo("apresentacao"); }
  else if (TV.modo === "apresentacao" && (k === " " || k === "Enter" || k === "ArrowRight" || k === "PageDown")) {
    e.preventDefault(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    const sn = AO.snap, id = sn && sn.id; if (!id) return;
    if (sn.fase && sn.fase.etapa === "podio") { tvDica("No pódio, encerre a sala pelo controle do instrutor."); return; }
    if (AO.ch) { try { AO.ch.postMessage({t: "cmd", a: "proxima", id}); } catch (e2) {} }
    tvDica("Avançando...", 900);
  }
});
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "tvfull") { tvFull(); el.blur(); } else if (a === "tvmodo") { tvModo(el.dataset.v); el.blur(); }
});
/* a janela de controle recebe o "avançar" do telão em modo apresentação */
if (AO.ch) AO.ch.addEventListener("message", e => {
  const m = e.data || {}; if (m.t !== "cmd" || m.a !== "proxima" || rota().v !== "sala") return;
  const s = AO.id && sala(AO.id); if (!s || s.estado !== "sala" || (m.id && m.id !== s.id)) return;
  if (s.fase.etapa === "podio" || (s.fase.etapa === "espera" && !s.part.length)) return;
  proxima(s);
});

/* ---------- folha de reforço em PDF ---------- */
function marcouPdf(it, r) {
  if (!r) return "Não respondeu";
  if (it.tipo === "ordenar") return r.ok ? "Ordem certa" : "Ordem diferente da certa";
  const a = (it.alternativas || [])[r.r]; return a !== undefined ? String(a) : "Não respondeu";
}
function certaPdf(it) {
  if (it.tipo === "ordenar") return (it.alternativas || []).map((a, k) => (k + 1) + ". " + a).join("   ");
  return Number.isInteger(it.correta) && (it.alternativas || [])[it.correta] !== undefined ? String(it.alternativas[it.correta]) : "";
}
/* perguntas que a pessoa errou ou não respondeu, com a explicação que vem antes delas */
function errosFolha(s, pid) {
  const out = []; let n = 0, expl = null;
  s.itens.forEach((it, i) => {
    if (!ehPergunta(it)) { expl = it; return; }
    if (!vale(it)) return; n++;
    const r = (s.resp[pid] || {})[i]; if (r && r.ok) return;
    out.push({n, it, marcou: marcouPdf(it, r), certa: certaPdf(it), expl});
  });
  return out;
}
const folhaPessoas = s => s.mom === "pre" ? [] : estat(s).abaixo;
function pdfFolhaReforco(s) {
  const e = estat(s), d = pdfBase(s, "Folha de reforço"), {W, M} = d, lg = W - 2 * M;
  pdfTopo(d, s, "Folha de reforço");
  const alvo = folhaPessoas(s).slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const bloco = partes => {
    const ls = partes.map(p => ({p, l: d.quebra(p.t, lg - (p.ind || 0), p.tam, p.neg).slice(0, p.max || 12)}));
    const alt = ls.reduce((a, x) => a + x.l.length * x.p.tam * 1.35 + (x.p.esp || 0), 0) + 8;
    d.garante(alt);
    ls.forEach(({p, l}) => { l.forEach((ln, k) => d.texto(M + (p.ind || 0), d.y + p.tam + k * p.tam * 1.35, ln, {tam: p.tam, neg: p.neg, cor: p.cor})); d.y += l.length * p.tam * 1.35 + (p.esp || 0); });
    d.y += 8;
  };
  alvo.forEach((p, k) => {
    if (k > 0) d.nova();
    d.garante(90);
    d.texto(M, d.y + 14, p.nome, {tam: 15, neg: true, cor: "#0E4A48"}); d.y += 22;
    d.texto(M, d.y + 8, `${p.setor ? p.setor + " · " : ""}acertou ${p.ac} de ${e.c.nq} (${p.pct}%) · meta ${s.meta}%`, {tam: 9, cor: "#4a5c5b"}); d.y += 16;
    d.y += d.par(M, d.y, "Leia com calma cada pergunta abaixo, a resposta certa e o porquê. Depois refaça o treino no celular. A nota oficial não muda.", lg, {tam: 9.5, cor: "#334"}) + 6;
    const er = errosFolha(s, p.id), vistas = new Set();
    if (!er.length) d.y += d.par(M, d.y, "Nenhuma resposta registrada para esta pessoa.", lg, {tam: 10}) + 4;
    er.forEach(x => {
      d.linha(M, d.y, W - M, d.y, {cor: "#d5dedd"}); d.y += 4;
      const ps = [{t: `P${x.n}. ${x.it.enunciado}`, tam: 10.5, neg: true, esp: 3}, {t: "Você marcou: " + x.marcou, tam: 9.5, cor: "#B3302A", ind: 10}];
      if (x.certa) ps.push({t: "Resposta certa: " + x.certa, tam: 9.5, neg: true, cor: "#1B7A4B", ind: 10});
      if (x.it.porque) ps.push({t: "Por quê: " + x.it.porque, tam: 9.5, cor: "#334", ind: 10});
      if (x.expl && x.expl.texto && !vistas.has(x.expl)) { vistas.add(x.expl); ps.push({t: "Para rever: " + (x.expl.enunciado ? x.expl.enunciado + ". " : "") + x.expl.texto.replace(/\s+/g, " ").slice(0, 420), tam: 8.5, cor: "#5a6b6a", ind: 10, max: 5}); }
      bloco(ps);
    });
    d.garante(60); d.y += 10;
    d.linha(M, d.y + 24, M + 240, d.y + 24, {cor: "#334", esp: .7});
    d.texto(M, d.y + 36, "Ciente: " + p.nome, {tam: 9, cor: "#334"}); d.texto(W - M, d.y + 36, "Data: ____/____/______", {tam: 9, cor: "#334", al: "dir"});
    d.y += 44;
  });
  return d.saida();
}
function folhaBtn(s) {
  const n = folhaPessoas(s).length;
  return n ? `<button class="b" data-act="relfolha" title="Uma página por pessoa abaixo da meta, com o que errou, a resposta certa e o porquê">${ic("file")}Folha de reforço (${n})</button>` : "";
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el || el.dataset.act !== "relfolha") return;
  const s = sessaoRel(REL.sid); if (!s) return;
  if (!folhaPessoas(s).length) { aviso("Todos atingiram a meta: não há folha de reforço"); return; }
  baixarBlob(nomeArq("folha-reforco", s, "pdf"), new Blob([pdfFolhaReforco(s)], {type: "application/pdf"}));
});

/* ---------- painel do treinamento (lateral, no editor) ---------- */
const PN = {aba: "geral"};
const pnV = n => "v" + String(n).padStart(2, "0");
function pnDados(t) {
  const ss = S.sessoes.filter(x => x.treinoId === t.id && x.estado === "encerrada" && x.resultado && tipoSessao(x) === "real" && x.mom !== "pre");
  const porV = new Map();
  ss.forEach(x => {
    const n = x.versao ?? 0, o = porV.get(n) || {n, sessoes: 0, pessoas: 0, soma: 0, ult: ""};
    o.sessoes++; o.pessoas += x.resultado.pessoas || 0; o.soma += (x.resultado.pct || 0) * (x.resultado.pessoas || 0); o.ult = o.ult > x.fim ? o.ult : x.fim; porV.set(n, o);
  });
  (t.versoes || []).forEach(v => { if (!porV.has(v.n)) porV.set(v.n, {n: v.n, sessoes: 0, pessoas: 0, soma: 0, ult: ""}); });
  const vs = [...porV.values()].sort((a, b) => b.n - a.n).map(o => Object.assign(o, {pct: o.pessoas ? Math.round(o.soma / o.pessoas) : null, nota: ((t.versoes || []).find(v => v.n === o.n) || {}).nota || "", meta: ((t.versoes || []).find(v => v.n === o.n) || {}).meta ?? t.meta}));
  const msgs = (S.mensagens || []).filter(m => m.treinoId === t.id && !m.teste).sort((a, b) => b.em - a.em);
  return {ss, vs, msgs, pessoas: ss.reduce((a, x) => a + (x.resultado.pessoas || 0), 0), pct: ss.length && ss.reduce((a, x) => a + (x.resultado.pessoas || 0), 0) ? Math.round(ss.reduce((a, x) => a + (x.resultado.pct || 0) * (x.resultado.pessoas || 0), 0) / ss.reduce((a, x) => a + (x.resultado.pessoas || 0), 0)) : null};
}
function pnGeral(t, D) {
  const nq = t.itens.filter(vale).length, ex = t.itens.filter(i => !ehPergunta(i)).length, ens = t.itens.filter(i => ehPergunta(i) && !vale(i)).length;
  const min = Math.max(1, Math.round(t.itens.reduce((a, x) => a + (ehPergunta(x) ? (x.tempo || 20) + 8 : 120), 0) / 60));
  const ult = D.ss.map(x => x.fim).sort().slice(-1)[0];
  const f = (v, r) => `<div><b>${v}</b><span>${r}</span></div>`;
  const nl = D.msgs.filter(m => !m.lida).length;
  return `<div class="pn-f">${f(nq, "perguntas valendo")}${f(ex, ex === 1 ? "explicação" : "explicações")}${f(min + " min", "de duração")}${f(t.meta + "%", "de meta")}${f(D.ss.length, D.ss.length === 1 ? "sessão oficial" : "sessões oficiais")}${f(D.pessoas, "pessoas atendidas")}</div>
    <ul class="pn-l"><li><span>Acerto médio das sessões</span><b>${D.pct === null ? "sem sessão ainda" : D.pct + "%"}</b></li>
    <li><span>Última aplicação</span><b>${ult ? dtd(ult) : "nunca aplicado"}</b></li>
    <li><span>Versão atual</span><b>${pnV(t.versao)}${t.sujo ? " (com alterações sem versão)" : ""}</b></li>
    <li><span>Validade</span><b>${(VALIDADES.find(v => v[0] === (t.per || 0)) || [0, "Sem validade"])[1]}</b></li>
    <li><span>Reavaliação</span><b>${(t.reav || []).length ? (t.reav || []).join(", ") + " dias" : "não configurada"}</b></li>
    ${ens ? `<li><span>Perguntas só de ensaio</span><b>${ens}</b></li>` : ""}
    <li><span>Comentários da turma</span><b>${D.msgs.length}${nl ? " · " + nl + " sem ler" : ""}</b></li></ul>`;
}
function pnVersoes(t, D) {
  if (!D.vs.length) return `<p class="sm mut">Este treinamento ainda não tem versões.</p>`;
  return `<p class="sm mut" style="margin:0">Acerto médio das sessões oficiais aplicadas em cada versão. A marca vertical é a meta daquela versão.</p><div class="pn-v">${D.vs.map((v, k) => {
    const ant = D.vs.slice(k + 1).find(x => x.pct !== null), dif = v.pct !== null && ant ? v.pct - ant.pct : null;
    return `<div class="pn-vr"><div class="pn-vh"><b class="num">${pnV(v.n)}</b>${v.n === t.versao ? '<span class="chip br">atual</span>' : ""}<span class="sm mut">${v.sessoes ? v.sessoes + (v.sessoes === 1 ? " sessão" : " sessões") + " · " + v.pessoas + " pessoas" : "sem sessão oficial"}</span></div>
      <div class="pn-b" role="img" aria-label="${v.pct === null ? "sem dados" : v.pct + "% de acerto"}"><i style="width:${v.pct || 0}%" class="${v.pct !== null && v.pct < v.meta ? "fr" : ""}"></i><u style="left:${v.meta}%"></u></div>
      <div class="pn-vf"><b class="num">${v.pct === null ? "–" : v.pct + "%"}</b>${dif === null ? "" : `<span class="chip ${dif >= 0 ? "ok" : "warn"}">${dif >= 0 ? "+" : "−"}${Math.abs(dif)} pp</span>`}${v.nota ? `<span class="sm mut">${esc(v.nota)}</span>` : ""}</div></div>`;
  }).join("")}</div>`;
}
function pnComentarios(t, D) {
  if (!D.msgs.length) return `<p class="sm mut">Ninguém comentou ainda. No fim de cada sessão a turma pode mandar um comentário pelo celular.</p>`;
  return `<div class="pn-c">${D.msgs.slice(0, 40).map(m => `<div class="pn-cm"><div class="pn-ch"><span class="chip">${esc(TIPO_MSG[m.tipo] || "Comentário")}</span><b>${esc(m.pessoa)}</b><span class="sm mut">${pnV(m.versao ?? 0)} · ${dtd(new Date(m.em).toISOString())}</span>${m.lida ? "" : '<span class="chip br">nova</span>'}</div><p>${esc(m.texto)}</p>${m.resposta ? `<p class="pn-r">Resposta: ${esc(m.resposta)}</p>` : ""}</div>`).join("")}</div>
    <a class="b sm" href="#/mensagens">${ic("chat", 'style="width:16px;height:16px"')}Abrir Mensagens</a>`;
}
function pnCorpo(t) {
  const D = pnDados(t);
  return PN.aba === "versoes" ? pnVersoes(t, D) : PN.aba === "coment" ? pnComentarios(t, D) : pnGeral(t, D);
}
function dlgPainel() {
  const t = treino(UI.ed && UI.ed.id); if (!t) return;
  const d = $("#dlg"), ab = [["geral", "Visão geral"], ["versoes", "Acerto por versão"], ["coment", "Comentários"]];
  d.innerHTML = `<div class="dl pn"><header><h2>Painel do treinamento</h2><button class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header>
    <p class="sm mut" style="margin:0">${esc(t.titulo)}</p>
    <div class="chips pn-t" role="group" aria-label="Seções do painel">${ab.map(([k, n]) => `<button type="button" class="sc" data-act="pntab" data-v="${k}" aria-pressed="${PN.aba === k}">${n}</button>`).join("")}</div>
    <div id="pn-corpo">${pnCorpo(t)}</div></div>`;
  if (!d.open) d.showModal();
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "painel") { PN.aba = "geral"; dlgPainel(); }
  else if (a === "pntab") { const t = treino(UI.ed && UI.ed.id); if (!t) return; PN.aba = el.dataset.v; document.querySelectorAll(".pn-t .sc").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === PN.aba))); $("#pn-corpo").innerHTML = pnCorpo(t); }
});
