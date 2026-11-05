/* ===== v0.5.0 · relatórios, PDFs, planilha, foto da turma, logotipo e conferência ===== */
const REL = {sid: null, aba: "resumo", ord: {c: "pts", d: -1}, asOrd: "aula"};
const CF = {res: null, cod: ""};

const encerradas = () => S.sessoes.filter(x => x.estado === "encerrada").slice().reverse();
const tipoSessao = s => (s.aj && s.aj.teste) ? "teste" : (s.part || []).some(p => p.sim) ? "ensaio" : "real";
const TIPO_TXT = {teste: "Sessão de teste", ensaio: "Ensaio com simulados", real: "Registro oficial"};
const dtc = iso => { try { return new Date(iso).toLocaleString("pt-BR", {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"}); } catch (e) { return ""; } };
const dtd = iso => { try { return new Date(iso).toLocaleDateString("pt-BR"); } catch (e) { return ""; } };
const horasTxt = h => String(h || "").replace(".", ",") + " h";
const verTxt = s => "v" + String(s.versao ?? 0).padStart(2, "0");
const situ = (s, p) => s.mom === "pre" ? "Linha de base" : !(s.resp[p.id] && Object.keys(s.resp[p.id]).length) ? "Não respondeu" : p.pct >= s.meta ? "Atingiu a meta" : "Abaixo da meta";

/* ---------- números da sessão ---------- */
function estat(s) {
  const c = calc(s), qs = s.itens.map((it, i) => [it, i]).filter(([it]) => vale(it));
  let somaMs = 0, nMs = 0;
  const perg = qs.map(([it, i], k) => {
    let n = 0, ac = 0; const er = {};
    s.part.forEach(p => {
      const r = (s.resp[p.id] || {})[i]; if (!r) return;
      n++; if (r.ok) ac++; if (r.ms > 0) { somaMs += r.ms; nMs++; }
      if (!r.ok && it.tipo !== "ordenar") er[r.r] = (er[r.r] || 0) + 1;
    });
    const ks = Object.keys(er).sort((a, b) => er[b] - er[a]);
    return {n: k + 1, i, it, resp: n, ac, pct: n ? Math.round(100 * ac / n) : 0, errada: ks.length ? {alt: Number(ks[0]), n: er[ks[0]]} : null};
  });
  const nota = c.pessoas.length ? Math.round(c.pessoas.reduce((a, p) => a + p.pct, 0) / c.pessoas.length) : 0;
  const por = {}; c.pessoas.forEach(p => { const k = p.setor || "Sem setor"; (por[k] = por[k] || []).push(p); });
  const setores = Object.entries(por).map(([nome, l]) => ({nome, n: l.length, pct: Math.round(l.reduce((a, p) => a + p.pct, 0) / l.length), efic: l.filter(p => p.pct >= s.meta).length}))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const pessoas = c.pessoas.map(p => { const o = s.part.find(x => x.id === p.id) || {}; return Object.assign({}, p, {sim: !!o.sim, ass: o.ass || "", sit: situ(s, p)}); });
  return {c, perg, nota, tempo: nMs ? somaMs / nMs / 1000 : 0, setores, pessoas, abaixo: s.mom === "pre" ? [] : pessoas.filter(p => p.pct < s.meta), fracas: perg.filter(q => q.resp && q.pct < 60)};
}
const tempoTxt = t => t ? (Math.round(t * 10) / 10).toString().replace(".", ",") + " s" : "–";

/* ---------- código de conferência ---------- */
function canonSessao(s) {
  const c = calc(s), qs = s.itens.map((it, i) => [it, i]).filter(([it]) => vale(it));
  const pessoas = c.pessoas.map(p => {
    const o = s.part.find(x => x.id === p.id) || {}, rs = s.resp[p.id] || {};
    return [p.nome, p.setor || "", p.ac, p.pts, p.pct, qs.map(([, i]) => rs[i] ? (rs[i].ok ? "1" : "0") : "-").join(""), o.ass ? sha256(o.ass).slice(0, 16) : ""];
  }).sort((a, b) => a[0].localeCompare(b[0], "pt-BR") || a[1].localeCompare(b[1], "pt-BR") || a[6].localeCompare(b[6]));
  const perguntas = sha256(JSON.stringify(qs.map(([it]) => [it.tipo, it.enunciado, it.alternativas || null, it.correta ?? null]))).slice(0, 16);
  const o = {v: 1, t: s.titulo, ver: s.versao ?? 0, fim: s.fim, ins: s.instrutor || "", loc: s.local || "", h: String(s.horas || ""), meta: s.meta, np: qs.length, q: perguntas, teste: !!(s.aj && s.aj.teste), sim: s.part.some(p => p.sim), p: pessoas};
  if (s.mom) { o.mom = s.mom; o.dias = s.dias || 0; o.base = s.base && s.base.itens ? sha256(JSON.stringify(s.base.itens.map(x => [x.nome, x.pct]).sort())).slice(0, 16) : ""; }
  return JSON.stringify(o);
}
function codigoDe(s) { return "SAB-" + sha256(canonSessao(s)).slice(0, 20).toUpperCase().match(/.{4}/g).join("-"); }
function garantirCodigo(s) { if (!s.cod) { s.cod = codigoDe(s); s.codTardio = true; s.codEm = new Date().toISOString(); salvar(); } return s.cod; }
function normCodigo(t) {
  let x = String(t || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (x.length === 23 && x.startsWith("SAB")) x = x.slice(3);
  return /^[0-9A-F]{20}$/.test(x) ? "SAB-" + x.match(/.{4}/g).join("-") : "";
}
const integra = s => codigoDe(s) === garantirCodigo(s);

/* ---------- arquivos ---------- */
function baixarBlob(nome, blob) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
const nomeArq = (pre, s, ext) => `${pre}-${slug(s.titulo)}-${(s.fim || "").slice(0, 10)}.${ext}`;
const celCsv = v => { let t = String(v ?? ""); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return /[";\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
function csvSessao(s) {
  const e = estat(s);
  const cmp = comparativo(s), cm = cmp ? new Map(cmp.lin.map(x => [nk(x.nome), x])) : null;
  const cab = ["Nome", "Setor", "Acertos", "Perguntas", "Percentual", "Pontos", "Situação", "Assinou", ...e.perg.map(q => "P" + q.n), ...(cm ? [cmp.rot + " (%)", "Variação (pp)"] : [])];
  const linhas = e.pessoas.map(p => { const rs = s.resp[p.id] || {}; return [p.nome, p.setor || "", p.ac, e.c.nq, p.pct, p.pts, p.sit, p.ass ? "Sim" : "Não", ...e.perg.map(q => rs[q.i] ? (rs[q.i].ok ? "Certo" : "Errado") : "-"), ...(cm ? (() => { const x = cm.get(nk(p.nome)); return x ? [x.antes, x.dif] : ["", ""]; })() : [])]; });
  const topo = [["Treinamento", s.titulo], ["Versão", verTxt(s)], ["Data", dtc(s.fim)], ["Instrutor", s.instrutor || ""], ["Local", s.local || ""], ["Carga horária", horasTxt(s.horas)], ["Meta", s.meta + "%"], ["Tipo", TIPO_TXT[tipoSessao(s)]], ...(s.mom ? [["Momento", MOM_TXT[s.mom] + (s.dias ? " de " + s.dias + " dias" : "")]] : []), ["Código de conferência", garantirCodigo(s)], []];
  return "﻿" + topo.concat([cab], linhas).map(l => l.map(celCsv).join(";")).join("\r\n") + "\r\n";
}
function abrirPdf(bytes) { const u = URL.createObjectURL(new Blob([bytes], {type: "application/pdf"})); const w = window.open(u, "_blank"); if (!w) aviso("O navegador bloqueou a janela. Use o botão de baixar."); setTimeout(() => URL.revokeObjectURL(u), 60000); }

/* ---------- PDFs ---------- */
function pdfBase(s, nomeDoc) {
  const cod = garantirCodigo(s), d = novoPdf(nomeDoc + " · " + s.titulo), {W, H, M} = d;
  d.rodape = (d, n, N) => {
    d.linha(M, H - 42, W - M, H - 42, {cor: "#c4cfce"});
    d.texto(M, H - 30, d.corta("Sabiá " + VERSAO + " · " + s.titulo, 135, 8), {tam: 8, cor: "#5a6b6a"});
    d.texto(W / 2 + 30, H - 30, "Código de conferência " + cod, {tam: 8, neg: true, cor: "#0E4A48", al: "cen"});
    d.texto(W - M, H - 30, `Página ${n} de ${N}`, {tam: 8, cor: "#5a6b6a", al: "dir"});
  };
  d.cab = d => { d.texto(M, d.y + 8, d.corta(nomeDoc + " · " + s.titulo + " (continuação)", W - 2 * M, 9), {tam: 9, cor: "#5a6b6a"}); d.y += 22; };
  return d;
}
function pdfTopo(d, s, titulo) {
  const {W, M} = d, y = M; let hl = 0;
  if (S.cfg.logo) { const r = d.imgCabe(S.cfg.logo, M, y, 130, 46); hl = r ? 46 : 0; }
  d.texto(W - M, y + 14, titulo, {tam: 16, neg: true, cor: "#0E4A48", al: "dir"});
  if (S.cfg.empresa) d.texto(W - M, y + 30, d.corta(S.cfg.empresa, 330, 10), {tam: 10, cor: "#4a5c5b", al: "dir"});
  d.y = y + Math.max(hl, 38) + 8; d.linha(M, d.y, W - M, d.y, {cor: "#0E4A48", esp: 1.2}); d.y += 12;
  const tp = tipoSessao(s);
  if (tp !== "real") {
    d.ret(M, d.y, W - 2 * M, 24, {fundo: "#F7EACD", borda: "#9A6200"});
    d.texto(M + 8, d.y + 15.5, tp === "teste" ? "SESSÃO DE TESTE: não vale como registro oficial." : "ENSAIO com participantes simulados: não vale como registro oficial.", {tam: 9.5, neg: true, cor: "#6b4400"});
    d.y += 34;
  }
}
function pdfSecao(d, t, mais) { d.garante(48 + (mais || 0)); d.texto(d.M, d.y + 10, t, {tam: 11, neg: true, cor: "#0E4A48"}); d.y += 16; d.linha(d.M, d.y, d.W - d.M, d.y, {cor: "#c4cfce"}); d.y += 6; }
function pdfCampos(d, pares) {
  const {W, M} = d, lg = (W - 2 * M) / 2 - 8;
  for (let i = 0; i < pares.length; i += 2) {
    const linha = pares.slice(i, i + 2).map(([r, v]) => ({r, ls: d.quebra(v || "–", lg, 10, false).slice(0, 3)}));
    const alt = 12 + Math.max(...linha.map(c => c.ls.length)) * 13 + 4;
    d.garante(alt);
    linha.forEach((c, k) => { const x = M + k * (lg + 16); d.texto(x, d.y + 8, c.r.toUpperCase(), {tam: 7.5, neg: true, cor: "#6b7c7b"}); c.ls.forEach((t, j) => d.texto(x, d.y + 20 + j * 13, t, {tam: 10})); });
    d.y += alt;
  }
  d.y += 2;
}
function pdfIndicadores(d, itens) {
  const {W, M} = d, g = 8, w = (W - 2 * M - g * (itens.length - 1)) / itens.length; d.garante(54);
  itens.forEach(([v, r], k) => { const x = M + k * (w + g); d.ret(x, d.y, w, 44, {fundo: "#F2F6F6", borda: "#d5dedd"}); d.texto(x + 8, d.y + 22, v, {tam: 16, neg: true, cor: "#0E4A48"}); d.texto(x + 8, d.y + 36, r, {tam: 8, cor: "#4a5c5b"}); });
  d.y += 54;
}
const corSit = t => t === "Atingiu a meta" ? "#1B7A4B" : t === "Abaixo da meta" ? "#9A6200" : "#6b7c7b";

function pdfRegistro(s) {
  const e = estat(s), d = pdfBase(s, "Registro de treinamento"), {W, M} = d;
  pdfTopo(d, s, "Registro de treinamento");
  pdfCampos(d, [["Treinamento", `${s.titulo} (${verTxt(s)})`], ["Data e hora do encerramento", dtc(s.fim)], ["Instrutor", s.instrutor], ["Local", s.local], ["Carga horária", horasTxt(s.horas)], ["Meta de acerto", s.meta + "%"], ...(s.mom ? [["Momento", MOM_TXT[s.mom] + (s.dias ? " de " + s.dias + " dias" : "")]] : []), ...seloCampo(s), ["Setores", (s.setores || []).length ? s.setores.join(", ") : "Todos"], ["Perguntas que valem nota", String(e.c.nq)]]);
  pdfIndicadores(d, [[e.nota + "%", "Nota média"], s.mom === "pre" ? [String(e.c.pessoas.length), "Pessoas"] : [`${e.c.efic} de ${e.c.pessoas.length}`, "Atingiram a meta"], [e.c.pct + "%", "Acerto geral"], [tempoTxt(e.tempo), "Tempo médio por resposta"]]);
  pdfSecao(d, "Presença e resultado");
  const ord = e.pessoas.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  d.tabela([{t: "#", w: 22}, {t: "Nome", w: 150}, {t: "Setor", w: 80}, {t: "Acertos", w: 46, al: "cen"}, {t: "%", w: 34, al: "dir"}, {t: "Pontos", w: 46, al: "dir"}, {t: "Situação", w: 82}, {t: "Assinatura", w: 96, al: "cen"}],
    ord.map((p, i) => [String(i + 1), p.nome, p.setor || "–", `${p.ac}/${e.c.nq}`, p.pct + "%", String(p.pts), {txt: p.sit, neg: true, cor: corSit(p.sit)}, {img: p.ass, h: 22, vazio: "sem assinatura"}]));
  const cmp = comparativo(s);
  if (cmp && cmp.n) {
    pdfSecao(d, cmpTitulo(s), 40 + cmp.n * 18);
    d.tabela([{t: "Nome", w: 200}, {t: cmp.rot + " (%)", w: 90, al: "dir"}, {t: "Agora (%)", w: 70, al: "dir"}, {t: "Variacao (pp)", w: 80, al: "dir"}, {t: "Ganho norm.", w: 70, al: "dir"}],
      cmp.lin.map(x => [x.nome, String(x.antes), String(x.agora), {txt: sinal(x.dif), neg: true, cor: x.dif > 0 ? "#1B7A4B" : x.dif < 0 ? "#9A6200" : "#6b7c7b"}, x.g === null ? "-" : x.g + "%"]));
    d.par(M, d.y + 4, `Media antes ${cmp.antes}%, media agora ${cmp.agora}% (${sinal(cmp.dif)} pp).${cmp.g !== null ? " Ganho normalizado da turma: " + cmp.g + "%." : ""} Ganho normalizado = (agora - antes) / (100 - antes).`, W - 2 * M, {tam: 8, cor: "#5a6b6a"}); d.y += 22;
  }
  const rfz = resumoRefaz(s);
  if (rfz) {
    pdfSecao(d, "Treino feito no celular", 40 + rfz.lin.length * 18);
    d.tabela([{t: "Nome", w: 210}, {t: "Erros", w: 50, al: "cen"}, {t: "Treinou", w: 50, al: "cen"}, {t: "Recuperou", w: 70, al: "cen"}, {t: "Tentativas", w: 70, al: "cen"}], rfz.lin.map(x => [x.nome, String(x.erros), String(x.fez), String(x.rec), String(x.tent)]));
    d.par(M, d.y + 4, "O treino feito no celular nao altera a nota, o ranking, o codigo de conferencia nem a fila de reforco.", W - 2 * M, {tam: 8, cor: "#5a6b6a"}); d.y += 18;
  }
  if (e.perg.length) {
    pdfSecao(d, "Assertividade por pergunta");
    d.tabela([{t: "#", w: 22}, {t: "Pergunta", w: 230}, {t: "Respostas", w: 50, al: "cen"}, {t: "Acertos", w: 46, al: "cen"}, {t: "%", w: 36, al: "dir"}, {t: "Errada mais escolhida", w: 150}],
      e.perg.map(q => [String(q.n), q.it.enunciado, String(q.resp), String(q.ac), {txt: q.pct + "%", neg: true, cor: q.resp && q.pct < 60 ? "#B3302A" : "#1B7A4B"}, q.errada ? `${(q.it.alternativas || [])[q.errada.alt] ?? "alternativa " + (q.errada.alt + 1)} (${q.errada.n})` : "–"]));
  }
  if (e.setores.length > 1) {
    pdfSecao(d, "Resultado por setor", 20 + e.setores.length * 18);
    d.tabela([{t: "Setor", w: 200}, {t: "Pessoas", w: 60, al: "cen"}, {t: "Acerto médio", w: 80, al: "dir"}, {t: "Atingiram a meta", w: 110, al: "cen"}], e.setores.map(x => [x.nome, String(x.n), x.pct + "%", `${x.efic} de ${x.n}`]));
  }
  if (s.foto) {
    d.garante(220); pdfSecao(d, "Evidência: foto da turma");
    const r = d.imgCabe(s.foto, M, d.y, 300, 200); if (r) { d.y += 206; d.texto(M, d.y + 6, "Foto registrada em " + dtc(s.fotoEm || s.fim), {tam: 8, cor: "#5a6b6a"}); d.y += 16; }
  }
  d.garante(60); d.y += 6;
  d.par(M, d.y, "Para conferir este registro, digite o código do rodapé em Conferir, no menu do Sabiá. O código muda se qualquer nome, resultado, pergunta, data, instrutor ou assinatura for alterado. A foto da turma não entra no cálculo.", W - 2 * M, {tam: 8, cor: "#5a6b6a"});
  return d.saida();
}

function pdfPresenca(s) {
  const e = estat(s), d = pdfBase(s, "Lista de presença"), {W, M} = d;
  pdfTopo(d, s, "Lista de presença");
  pdfCampos(d, [["Treinamento", `${s.titulo} (${verTxt(s)})`], ["Data", dtd(s.fim)], ["Instrutor", s.instrutor], ["Local", s.local], ["Carga horária", horasTxt(s.horas)], ["Setores", (s.setores || []).length ? s.setores.join(", ") : "Todos"]]);
  pdfSecao(d, `Participantes (${e.pessoas.length})`);
  const ord = e.pessoas.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  d.tabela([{t: "#", w: 24}, {t: "Nome", w: 190}, {t: "Setor", w: 100}, {t: "Carga horária", w: 62, al: "cen"}, {t: "Assinatura", w: 160, al: "cen"}],
    ord.map((p, i) => [String(i + 1), p.nome, p.setor || "–", horasTxt(s.horas), {img: p.ass, h: 30, vazio: "sem assinatura"}]));
  d.garante(90); d.y += 22;
  d.linha(M, d.y + 28, M + 230, d.y + 28, {cor: "#334", esp: .7});
  d.texto(M, d.y + 40, "Assinatura do instrutor" + (s.instrutor ? ": " + s.instrutor : ""), {tam: 9, cor: "#334"});
  d.texto(W - M, d.y + 40, "Data: " + dtd(s.fim), {tam: 9, cor: "#334", al: "dir"});
  return d.saida();
}

/* ---------- ações ---------- */
function reaplicar(s) {
  const t = treino(s.treinoId); if (!t) { aviso("O treinamento desta sessão foi removido"); return; }
  const e = estat(s); if (!e.abaixo.length) { aviso("Todos atingiram a meta"); return; }
  UI.apl = {id: t.id, preset: "aovivo", setores: (s.setores || []).slice(), instrutor: s.instrutor || S.cfg.instrutor, local: s.local || S.cfg.local, horas: s.horas || "1", aj: Object.assign({}, AJ_PADRAO, PRESETS.aovivo.aj), roster: e.abaixo.map(p => p.nome), reaplicaDe: s.id, mom: "ref", base: {rot: "Resultado anterior", itens: e.abaixo.map(p => ({nome: p.nome, pct: p.pct, fim: s.fim}))}};
  ir("#/aplicar/" + t.id);
}
async function salvarFoto(s, arq) {
  try {
    let u = await imagemJpeg(arq, 1400, 0.72); if (u.length > 450000) u = await imagemJpeg(arq, 1000, 0.6);
    s.foto = u; s.fotoEm = new Date().toISOString(); salvar(); render(); aviso("Foto da turma guardada");
  } catch (err) { aviso("Não consegui abrir essa imagem"); }
}
async function salvarLogo(arq) {
  try { S.cfg.logo = await imagemJpeg(arq, 480, 0.85); salvar(); render(); aviso("Logotipo guardado"); } catch (err) { aviso("Não consegui abrir essa imagem"); }
}

/* ---------- tela: relatórios ---------- */
function sessaoRel(id) {
  const l = encerradas();
  return (id && l.find(x => x.id === id)) || (REL.sid && l.find(x => x.id === REL.sid)) || l.find(x => tipoSessao(x) === "real") || l[0] || null;
}
function vRelatorios(id) {
  if (id === "desafio") { vDesafio(); return; }
  const l = encerradas();
  topo("Relatórios", l.length ? `${l.length} sessão${l.length === 1 ? "" : "ões"} encerrada${l.length === 1 ? "" : "s"}` : "");
  $("#app").className = "body rel";
  if (!l.length) { $("#app").innerHTML = `${relModo("sessoes")}<section class="k vazio">${ic("chart", 'style="width:32px;height:32px;color:var(--brand-ink)"')}<b>Nenhuma sessão encerrada ainda</b><span class="sm">Quando você encerrar uma sala, o resultado, a lista de presença e o PDF de registro aparecem aqui.</span><a class="b p" href="#/treinos">${ic("list")}Ir para Treinos</a></section>`; return; }
  const s = sessaoRel(id); REL.sid = s.id; garantirCodigo(s);
  const e = estat(s), tp = tipoSessao(s), t = treino(s.treinoId);
  const opt = l.map(x => `<option value="${x.id}" ${x.id === s.id ? "selected" : ""}>${esc(x.titulo)} · ${dtd(x.fim)}${tipoSessao(x) === "teste" ? " (teste)" : tipoSessao(x) === "ensaio" ? " (ensaio)" : ""}</option>`).join("");
  const abas = [["resumo", "Resumo"], ["mapa", "Mapa da turma"], ["pergunta", "Assertividade"], ["setor", "Setores"]];
  let corpo = "";
  if (REL.aba === "resumo") corpo = relResumo(s, e, t);
  else if (REL.aba === "mapa") corpo = relMapa(s, e);
  else if (REL.aba === "pergunta") corpo = relPerguntas(s, e);
  else corpo = relSetores(s, e);
  $("#app").innerHTML = `${relModo("sessoes")}<section class="k rl-top">
      <div class="fd"><label for="rl-s">Sessão</label><select class="in" id="rl-s">${opt}</select></div>
      <div class="rl-meta" aria-label="Dados da sessão"><span class="chip ${tp === "real" ? "ok" : "warn"}">${TIPO_TXT[tp]}</span>${s.mom ? `<span class="chip br">${MOM_TXT[s.mom]}${s.dias ? " · " + s.dias + " dias" : ""}</span>` : ""}<span class="chip">${dtc(s.fim)}</span><span class="chip">${esc(s.instrutor || "sem instrutor")}</span>${s.local ? `<span class="chip">${esc(s.local)}</span>` : ""}<span class="chip">${horasTxt(s.horas)}</span><span class="chip">${verTxt(s)}</span>${s.reaplicaDe ? '<span class="chip br">Reaplicação</span>' : ""}</div>
      <div class="rl-docs"><button class="b p" data-act="relpdf">${ic("file")}PDF de registro</button><button class="b" data-act="relpres">${ic("file")}Lista de presença</button><details class="mais"><summary class="b">Mais${ic("down", 'style="width:16px;height:16px"')}</summary><div class="mp2"><button class="b g" data-act="relcsv">${ic("sheet")}Planilha (CSV)</button><button class="b g" data-act="reljson">${ic("download")}Sessão (.json)</button><button class="b g" data-act="relabrir" title="Abre o PDF de registro em outra aba para imprimir">${ic("print")}Imprimir</button></div></details></div>
      <div class="rl-cod sm"><span class="mut">Código de conferência</span> <b class="mono" id="relcod">${esc(s.cod)}</b> <button class="b sm g" data-act="copiacod" aria-label="Copiar o código" title="Copiar">${ic("copy", 'style="width:16px;height:16px"')}</button>${s.codTardio ? '<span class="chip warn" title="Sessão encerrada antes da v0.5.0: o código foi gerado quando você abriu o relatório pela primeira vez">gerado depois</span>' : ""}</div>
      ${carimboHtml(s)}
    </section>
    <div class="seg rl-abas" role="group" aria-label="Relatório">${abas.map(([k, n]) => `<button data-act="relaba" data-v="${k}" aria-pressed="${REL.aba === k}">${n}</button>`).join("")}</div>
    ${corpo}`;
}
function relResumo(s, e, t) {
  const ordp = e.pessoas.slice().sort((a, b) => {
    const c = REL.ord.c, va = c === "nome" || c === "setor" || c === "sit" ? String(a[c] || "").localeCompare(String(b[c] || ""), "pt-BR") : (a[c] - b[c]);
    return va * REL.ord.d || a.nome.localeCompare(b.nome, "pt-BR");
  });
  const th = (c, n, cl = "") => `<th class="${cl}"><button data-act="relord" data-v="${c}" aria-label="Ordenar por ${n}">${n}${REL.ord.c === c ? ic(REL.ord.d > 0 ? "up" : "down", 'style="width:14px;height:14px"') : ""}</button></th>`;
  const semAss = e.pessoas.filter(p => !p.ass && !p.sim).length;
  const ac = [];
  ac.push(s.mom === "pre"
    ? `<li><span class="ai">${ic("clock")}</span><span><b>Pré-teste: ponto de partida de ${e.nota}%</b><br><span class="sm mut">Nenhuma resposta certa foi mostrada. Depois do conteúdo, aplique o pós-teste para medir o ganho de aprendizado.</span></span><button class="b sm p" data-act="aplicarpos" data-id="${s.id}" ${t ? "" : "disabled"}>${ic("play", 'style="width:16px;height:16px"')}Aplicar pós-teste</button></li>`
    : e.abaixo.length
    ? `<li><span class="ai warn">${ic("warn")}</span><span><b>${e.abaixo.length} pessoa${e.abaixo.length === 1 ? "" : "s"} abaixo da meta de ${s.meta}%</b><br><span class="sm mut">${esc(e.abaixo.slice(0, 4).map(p => p.nome).join(", "))}${e.abaixo.length > 4 ? " e mais " + (e.abaixo.length - 4) : ""}</span></span><button class="b sm p" data-act="reaplicar" ${t ? "" : "disabled"}>${ic("play", 'style="width:16px;height:16px"')}Reaplicar para elas</button></li>`
    : `<li><span class="ai ok">${ic("check")}</span><span><b>Todos atingiram a meta de ${s.meta}%</b></span><span></span></li>`);
  if (e.fracas.length) ac.push(`<li><span class="ai warn">${ic("edit")}</span><span><b>${e.fracas.length} pergunta${e.fracas.length === 1 ? "" : "s"} com menos de 60% de acerto</b><br><span class="sm mut">${e.fracas.map(q => "P" + q.n).join(", ")}: vale rever o texto ou reforçar o conteúdo.</span></span>${t ? `<a class="b sm" href="#/editar/${t.id}">${ic("edit", 'style="width:16px;height:16px"')}Revisar no editor</a>` : "<span></span>"}</li>`);
  if (semAss) ac.push(`<li><span class="ai warn">${ic("warn")}</span><span><b>${semAss} pessoa${semAss === 1 ? "" : "s"} sem assinatura de presença</b><br><span class="sm mut">A lista de presença em PDF deixa o espaço em branco para assinar no papel.</span></span><span></span></li>`);
  ac.push(s.foto
    ? `<li><span class="ai ok">${ic("check")}</span><span><b>Foto da turma guardada</b><br><span class="sm mut">Sai no PDF de registro. ${dtc(s.fotoEm || s.fim)}</span></span><span class="acs"><label class="b sm" for="rl-foto">Trocar</label><button class="b sm bad" data-act="rmfoto">Remover</button></span></li>`
    : `<li><span class="ai">${ic("camera")}</span><span><b>Sem foto da turma</b><br><span class="sm mut">É a evidência impressa no PDF de registro.</span></span><label class="b sm" for="rl-foto">${ic("camera", 'style="width:16px;height:16px"')}Adicionar foto</label></li>`);
  return `<div class="k rsm q4"><div><b>${e.nota}%</b><span>Nota média</span></div>${s.mom === "pre" ? `<div><b>${e.c.pessoas.length}</b><span>Pessoas</span></div>` : `<div class="${e.c.efic < e.c.pessoas.length ? "w" : ""}"><b>${e.c.efic} de ${e.c.pessoas.length}</b><span>Atingiram a meta</span></div>`}<div><b>${e.c.pct}%</b><span>Acerto geral</span></div><div><b>${tempoTxt(e.tempo)}</b><span>Tempo médio por resposta</span></div></div>
    <section class="k"><h3 class="rh">O que fazer agora</h3><ul class="acoes">${ac.join("")}</ul><input type="file" id="rl-foto" accept="image/*" class="sr"></section>
    ${relCmp(s)}${relRefaz(s)}
    <section class="k"><h3 class="rh">Presença e resultado</h3><div class="rtw"><table class="rtb"><thead><tr>${th("nome", "Nome")}${th("setor", "Setor", "hide-m")}${th("ac", "Acertos", "n")}${th("pct", "%", "n")}${th("pts", "Pontos", "n hide-m")}${th("sit", "Situação")}<th class="n">Assinatura</th></tr></thead><tbody>${ordp.map(p => `<tr><td><b>${esc(p.nome)}</b>${p.sim ? ' <span class="chip">simulado</span>' : ""}</td><td class="hide-m">${esc(p.setor || "–")}</td><td class="n num">${p.ac}/${e.c.nq}</td><td class="n num">${p.pct}%</td><td class="n num hide-m">${p.pts}</td><td><span class="chip ${p.sit === "Atingiu a meta" ? "ok" : p.sit === "Abaixo da meta" ? "warn" : ""}">${p.sit}</span></td><td class="n">${p.ass ? `<button class="asm" data-act="verass" data-id="${p.id}" aria-label="Ver assinatura de ${esc(p.nome)}"><img src="${p.ass}" alt="" width="64" height="26"></button>` : '<span class="mut sm">–</span>'}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function relMapa(s, e) {
  if (!e.perg.length) return `<section class="k vazio"><b>Esta sessão não tem perguntas que valem nota</b></section>`;
  const col = e.perg.map(q => `<th class="mc" title="${esc(q.it.enunciado)}">P${q.n}</th>`).join("");
  const lin = e.pessoas.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map(p => {
    const rs = s.resp[p.id] || {};
    return `<tr><th scope="row" class="nm">${esc(p.nome)}</th>${e.perg.map(q => { const r = rs[q.i]; return r ? `<td class="mc ${r.ok ? "ok" : "no"}" title="${esc(q.it.enunciado)}: ${r.ok ? "acertou" : "errou"}">${ic(r.ok ? "check" : "x")}<span class="sr">${r.ok ? "acertou" : "errou"}</span></td>` : `<td class="mc nr" title="${esc(q.it.enunciado)}: sem resposta"><span aria-hidden="true">–</span><span class="sr">sem resposta</span></td>`; }).join("")}<td class="n num">${p.pct}%</td></tr>`;
  }).join("");
  return `<section class="k"><h3 class="rh">Mapa da turma</h3><p class="sm mut" style="margin:0 0 10px">Cada linha é uma pessoa e cada coluna uma pergunta que vale nota. Passe o dedo ou o mouse sobre a coluna para ver a pergunta.</p>
    <div class="mapa"><table class="rtb mp"><thead><tr><th class="nm">Nome</th>${col}<th class="n">%</th></tr></thead><tbody>${lin}</tbody><tfoot><tr><th class="nm">Acerto da pergunta</th>${e.perg.map(q => `<td class="mc num ${q.resp && q.pct < 60 ? "fr" : ""}">${q.resp ? q.pct + "%" : "–"}</td>`).join("")}<td class="n num">${e.c.pct}%</td></tr></tfoot></table></div>
    <div class="leg sm"><span><i class="mc ok">${ic("check")}</i>Acertou</span><span><i class="mc no">${ic("x")}</i>Errou</span><span><i class="mc nr">–</i>Sem resposta</span></div></section>`;
}
function relTempo(s) {
  const l = encerradas().filter(x => x.treinoId === s.treinoId && (x.id === s.id || tipoSessao(x) === "real") && x.mom !== "pre").sort((a, b) => String(a.fim).localeCompare(String(b.fim))).slice(-8);
  if (l.length < 2) return `<section class="k"><h3 class="rh">Ao longo do tempo</h3><p class="sm mut" style="margin:0">Só há uma sessão registrada deste treinamento. Quando houver mais, o acerto de cada uma aparece aqui, comparado com a meta.</p></section>`;
  return `<section class="k"><h3 class="rh">Ao longo do tempo</h3><p class="sm mut" style="margin:0 0 8px">Acerto geral de cada sessão deste treinamento (só registros oficiais e a sessão aberta). A linha vertical é a meta de ${s.meta}%.</p>
    <div class="tmp">${l.map(x => { const pc = x.resultado ? x.resultado.pct : 0; return `<div class="tl-s ${x.id === s.id ? "at" : ""}"><span class="sm">${dtd(x.fim)}${x.id === s.id ? ' <span class="chip br">esta</span>' : ""}</span><div class="bar" role="img" aria-label="${pc}% de acerto"><i style="width:${pc}%" class="${pc < x.meta ? "fr" : ""}"></i><u style="left:${x.meta}%"></u></div><b class="num">${pc}%</b></div>`; }).join("")}</div></section>`;
}
function relPerguntas(s, e) {
  if (!e.perg.length) return `<section class="k vazio"><b>Esta sessão não tem perguntas que valem nota</b></section>`;
  const l = REL.asOrd === "dificil" ? e.perg.slice().sort((a, b) => a.pct - b.pct || a.n - b.n) : e.perg;
  return relTempo(s) + `<section class="k"><div class="rh2"><h3 class="rh">Assertividade por pergunta</h3><div class="seg" role="group" aria-label="Ordem"><button data-act="relas" data-v="aula" aria-pressed="${REL.asOrd === "aula"}">Ordem da aula</button><button data-act="relas" data-v="dificil" aria-pressed="${REL.asOrd === "dificil"}">Mais difíceis primeiro</button></div></div>
    <div class="aslist">${l.map(q => `<div class="as"><span class="qn">P${q.n}</span><div class="aq"><b>${esc(q.it.enunciado)}</b><div class="bar" role="img" aria-label="${q.pct}% de acerto, meta ${s.meta}%"><i style="width:${q.pct}%" class="${q.resp && q.pct < 60 ? "fr" : ""}"></i><u style="left:${s.meta}%"></u></div><span class="sm mut">${q.resp} resposta${q.resp === 1 ? "" : "s"}, ${q.ac} certa${q.ac === 1 ? "" : "s"}${q.errada ? ` · errada mais escolhida: “${esc((q.it.alternativas || [])[q.errada.alt] ?? "alternativa " + (q.errada.alt + 1))}” (${q.errada.n})` : ""}</span></div><span class="ap num">${q.resp ? q.pct + "%" : "–"}${q.resp && q.pct < 60 ? '<span class="chip warn">revisar</span>' : ""}</span></div>`).join("")}</div>
    <p class="sm mut" style="margin:10px 0 0">A linha vertical marca a meta da sessão (${s.meta}%).</p></section>`;
}
function relSetores(s, e) {
  return `<section class="k"><h3 class="rh">Resultado por setor</h3><div class="rtw"><table class="rtb"><thead><tr><th>Setor</th><th class="n">Pessoas</th><th>Acerto médio</th><th class="n">Atingiram a meta</th></tr></thead><tbody>${e.setores.map(x => `<tr><td><b>${esc(x.nome)}</b></td><td class="n num">${x.n}</td><td><div class="bar sb" role="img" aria-label="${x.pct}%"><i style="width:${x.pct}%" class="${x.pct < s.meta ? "fr" : ""}"></i><u style="left:${s.meta}%"></u></div><span class="num sm">${x.pct}%</span></td><td class="n num">${x.efic} de ${x.n}</td></tr>`).join("")}</tbody></table></div>
    ${e.setores.length === 1 && e.setores[0].nome === "Sem setor" ? '<p class="sm mut" style="margin:10px 0 0">Ninguém escolheu setor nesta sessão. Cadastre os setores em Ajustes para ver a comparação.</p>' : ""}</section>`;
}

/* ---------- tela: conferir ---------- */
function vConferir() {
  topo("Conferir registro", "Prove que um PDF confere com os dados guardados");
  $("#app").className = "body page rel";
  const l = encerradas();
  const r = CF.res;
  const msg = !r ? "" : `<section class="k cf-r ${r.t}" role="status"><span class="ai ${r.t === "ok" ? "ok" : "warn"}">${ic(r.t === "ok" ? "shield" : "warn")}</span><div><b>${esc(r.titulo)}</b><p class="sm" style="margin:4px 0 0">${r.texto}</p></div></section>`;
  $("#app").innerHTML = `<section class="k"><h3 class="rh">Digite o código do rodapé do PDF</h3>
      <form data-form="conferir" class="cf-f"><div class="fd" style="flex:1;min-width:240px"><label for="cf-c">Código de conferência</label><input class="in mono" id="cf-c" value="${esc(CF.cod)}" placeholder="SAB-XXXX-XXXX-XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" spellcheck="false"></div><button class="b p" type="submit">${ic("shield")}Conferir</button></form>
      <div class="cf-ou sm mut">ou confira um arquivo de sessão exportado: <label class="b sm" for="cf-arq">${ic("upload", 'style="width:16px;height:16px"')}Escolher .json</label><input type="file" id="cf-arq" accept=".json,application/json" class="sr"></div></section>
    ${msg}
    ${seloConsulta()}
    <section class="k"><h3 class="rh">Sessões guardadas neste aparelho</h3>${l.length ? `<div class="rtw"><table class="rtb"><thead><tr><th>Sessão</th><th class="hide-m">Data</th><th>Código</th><th>Integridade</th></tr></thead><tbody>${l.map(x => { const ok = integra(x); return `<tr><td><b>${esc(x.titulo)}</b><br><span class="sm mut">${esc(TIPO_TXT[tipoSessao(x)])}</span></td><td class="hide-m sm">${dtc(x.fim)}</td><td class="mono sm">${esc(x.cod)}${x.codTardio ? ' <span class="chip">gerado depois</span>' : ""}</td><td><span class="chip ${ok ? "ok" : "bad"}">${ok ? "Íntegro" : "Alterado depois de encerrar"}</span></td></tr>`; }).join("")}</tbody></table></div>` : '<p class="sm mut" style="margin:0">Nenhuma sessão encerrada ainda.</p>'}</section>
    <section class="k"><h3 class="rh">Como funciona</h3><ul class="chg sm" style="margin:0">
      <li>O código sai de um cálculo (SHA-256) sobre o título, a versão e as perguntas, a data, o instrutor, o local, a carga horária, a meta e, para cada pessoa, nome, setor, acertos, pontos e assinatura. Mudou qualquer um, o código muda.</li>
      <li>Para uma auditoria, guarde o PDF e confira o código no aparelho em que a sessão foi aplicada, ou num aparelho onde você importou os dados em Ajustes.</li>
      <li>Limite: não há senha. O carimbo de tempo, que é opcional, usa o relógio do servidor do seu próprio Firebase e não vale como carimbo de uma autoridade certificadora. Quem tem o aparelho consegue gerar outro registro com outro código; o que o código prova é que o PDF impresso é igual ao que está guardado.</li></ul></section>`;
}
function conferirCodigo(txt) {
  CF.cod = txt;
  const c = normCodigo(txt);
  if (!c) { CF.res = {t: "no", titulo: "Código inválido", texto: "O código tem o formato SAB-XXXX-XXXX-XXXX-XXXX-XXXX, com letras de A a F e números."}; return; }
  const s = encerradas().find(x => garantirCodigo(x) === c);
  if (!s) { CF.res = {t: "no", titulo: "Nenhuma sessão deste aparelho tem esse código", texto: "Pode ser de outro aparelho (importe os dados em Ajustes) ou o PDF foi alterado. Se foi aplicada em outro aparelho, confira também pelo arquivo de sessão (.json)."}; return; }
  const e = estat(s);
  if (!integra(s)) { CF.res = {t: "no", titulo: "Atenção: a sessão foi alterada depois de encerrada", texto: `O código ${esc(c)} é de “${esc(s.titulo)}” (${dtc(s.fim)}), mas os dados guardados hoje geram outro código. Não use este registro sem explicar a diferença.`}; return; }
  CF.res = {t: "ok", titulo: "Registro confere", texto: `${esc(s.titulo)} (${verTxt(s)}), ${dtc(s.fim)}, instrutor ${esc(s.instrutor || "não informado")}. ${e.c.pessoas.length} pessoa${e.c.pessoas.length === 1 ? "" : "s"}, acerto geral de ${e.c.pct}%. Os dados guardados batem com o código do PDF. <a href="#/relatorios/${s.id}">Abrir o relatório</a>.${tipoSessao(s) !== "real" ? " <b>Esta sessão é " + (tipoSessao(s) === "teste" ? "de teste" : "um ensaio com simulados") + ", não é registro oficial.</b>" : ""}${s.codTardio ? " O código foi gerado depois do encerramento (sessão anterior à v0.5.0)." : ""}`};
}
function conferirArquivo(arq) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const o = JSON.parse(fr.result), s = o && o.sessao;
      if (!o || o.sabia !== "sessao" || !s || !Array.isArray(s.itens) || !Array.isArray(s.part) || !s.resp || typeof s.resp !== "object") throw new Error("formato");
      const dado = normCodigo(o.codigo), novo = codigoDe(s), local = encerradas().find(x => x.cod === novo);
      if (!dado) CF.res = {t: "no", titulo: "O arquivo não traz um código válido", texto: "Exporte a sessão de novo pelo relatório."};
      else if (dado !== novo) CF.res = {t: "no", titulo: "O arquivo foi alterado", texto: `O arquivo diz que o código é ${esc(dado)}, mas os dados dentro dele geram ${esc(novo)}.`};
      else CF.res = {t: "ok", titulo: "O arquivo confere", texto: `“${esc(s.titulo)}”, ${dtc(s.fim)}: os dados do arquivo geram o código ${esc(novo)}, igual ao registrado nele. ${local ? "Há uma sessão com o mesmo código neste aparelho." : "Esta sessão não está neste aparelho."}`};
      CF.cod = dado || "";
    } catch (err) { CF.res = {t: "no", titulo: "Não consegui ler esse arquivo", texto: "Escolha um arquivo de sessão (.json) exportado pelo relatório do Sabiá."}; }
    render();
  };
  fr.readAsText(arq);
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v;
  const s = ["relpdf", "relpres", "relcsv", "reljson", "relabrir", "reaplicar", "rmfoto", "verass", "copiacod"].includes(a) ? sessaoRel(REL.sid) : null;
  if (a === "relaba") { REL.aba = v; render(); }
  else if (a === "relas") { REL.asOrd = v; render(); }
  else if (a === "relord") { REL.ord = REL.ord.c === v ? {c: v, d: -REL.ord.d} : {c: v, d: v === "nome" || v === "setor" || v === "sit" ? 1 : -1}; render(); }
  else if (!s && a !== "rmlogo" && a !== "rmroster") return;
  else if (a === "relpdf") baixarBlob(nomeArq("registro", s, "pdf"), new Blob([pdfRegistro(s)], {type: "application/pdf"}));
  else if (a === "relpres") baixarBlob(nomeArq("presenca", s, "pdf"), new Blob([pdfPresenca(s)], {type: "application/pdf"}));
  else if (a === "relcsv") baixarBlob(nomeArq("resultado", s, "csv"), new Blob([csvSessao(s)], {type: "text/csv;charset=utf-8"}));
  else if (a === "reljson") baixarBlob(nomeArq("sessao", s, "json"), new Blob([JSON.stringify({sabia: "sessao", versao: VERSAO, codigo: garantirCodigo(s), sessao: s}, null, 2)], {type: "application/json"}));
  else if (a === "relabrir") abrirPdf(pdfRegistro(s));
  else if (a === "reaplicar") reaplicar(s);
  else if (a === "rmfoto") { delete s.foto; delete s.fotoEm; salvar(); render(); aviso("Foto removida"); }
  else if (a === "verass") {
    const p = s.part.find(x => x.id === el.dataset.id); if (!p || !p.ass) return;
    const d = $("#dlg"); d.innerHTML = `<div class="dl"><header><h2>Assinatura de ${esc(p.nome)}</h2><button class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header><div class="assg"><img src="${p.ass}" alt="Assinatura de ${esc(p.nome)}"></div><p class="sm mut" style="margin:0">${esc(s.titulo)}, ${dtc(s.fim)}</p></div>`; d.showModal();
  }
  else if (a === "copiacod") { try { navigator.clipboard.writeText(s.cod).then(() => aviso("Código copiado"), () => aviso("Não consegui copiar")); } catch (err) { aviso("Não consegui copiar"); } }
  else if (a === "rmlogo") { delete S.cfg.logo; salvar(); render(); aviso("Logotipo removido"); }
  else if (a === "rmroster") { if (UI.apl) { delete UI.apl.roster; delete UI.apl.reaplicaDe; render(); } }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "rl-s") { REL.sid = t.value; ir("#/relatorios/" + t.value); }
  else if (t.id === "rl-foto" && t.files[0]) { const s = sessaoRel(REL.sid); if (s) salvarFoto(s, t.files[0]); t.value = ""; }
  else if (t.id === "c-logo" && t.files[0]) { salvarLogo(t.files[0]); t.value = ""; }
  else if (t.id === "cf-arq" && t.files[0]) { conferirArquivo(t.files[0]); t.value = ""; }
});
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form='conferir']"); if (!f) return; e.preventDefault();
  conferirCodigo($("#cf-c").value); render();
});
