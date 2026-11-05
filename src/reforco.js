/* ===== v0.6.0 · pendências (reforço, reavaliação, validade), pré e pós-teste, comparativo ===== */
const DIA = 86400000;
const MOM_TXT = {pre: "Pré-teste", pos: "Pós-teste", ref: "Reforço", reav: "Reavaliação", ren: "Renovação"};
const REAV_DIAS = [30, 60, 90];
const VALIDADES = [[0, "Sem validade"], [180, "6 meses"], [365, "1 ano"], [730, "2 anos"]];
const PND = {aba: ""};
const nk = n => chaveNome(n);   // pessoas.js: nome, apelidos e acentos viram a mesma chave
const plural = (n, a, b) => n + " " + (n === 1 ? a : b);

/* ---------- o que a sessão carrega do Aplicar ---------- */
function momentoDe(s, a) {
  if (!a || !a.mom) return;
  s.mom = a.mom;
  if (a.dias) s.dias = a.dias;
  if (a.base) s.base = a.base;
  if (s.mom === "pre") { s.aj.ranking = false; s.aj.gincana = false; }
  if (s.mom === "ref" && a.refConteudo === "erradas" && Array.isArray(a.errados) && a.errados.length) s.somente = a.errados.slice();
}
/* reforço "só as perguntas que erraram": a sessão leva apenas essas perguntas, sem explicação */
function aplicaRecorte(s) {
  if (!s.somente || !s.itens || s.recortado) return;
  const f = s.itens.filter(it => ehPergunta(it) && s.somente.includes(it.enunciado));
  if (f.length) s.itens = f;
  s.recortado = true;
}
function itensDe(a, t) {
  if (a.mom === "ref" && a.refConteudo === "erradas" && Array.isArray(a.errados) && a.errados.length) { const f = t.itens.filter(it => ehPergunta(it) && a.errados.includes(it.enunciado)); if (f.length) return f; }
  return t.itens;
}
const fmtDia = ms => { const d = new Date(ms); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); };
const diaSeguinte = ms => { const d = new Date(ms); d.setHours(24, 0, 0, 0); return d.getTime(); };
function prePossiveis(treinoId) {
  return S.sessoes.filter(x => x.estado === "encerrada" && x.mom === "pre" && x.treinoId === treinoId && x.resultado && x.resultado.tabela).slice().reverse();
}
function baseDePre(sid) {
  const x = S.sessoes.find(y => y.id === sid); if (!x || !x.resultado) return undefined;
  return {rot: "Pré-teste", sid: x.id, fim: x.fim, itens: x.resultado.tabela.map(p => ({nome: p.nome, pct: p.pct}))};
}
function ajResumo(a, t) {
  const x = a.aj;
  return [a.mom ? MOM_TXT[a.mom].toLowerCase() : "aplicação normal", x.teste ? "sessão de teste" : "sessão real", `meta ${t.meta}%`, x.tempo === "fecha" ? "tempo fecha a pergunta" : "sem bloqueio de tempo", a.mom === "pre" ? "sem ranking, resposta certa escondida" : (x.ranking ? "ranking ligado" : "sem ranking")].join(" · ");
}
/* seletor de momento dentro do Aplicar */
function momAplicar(a, t) {
  if (a.mom === "ref") {
    const comExp = t.itens.some(it => !ehPergunta(it)), nErr = (a.errados || []).length, c = a.refConteudo === "erradas" && nErr ? "erradas" : "tudo";
    return `<div class="reap"><span class="sm">Reforço: 2ª ou 3ª tentativa de quem ficou abaixo da meta. A nota oficial continua sendo a da 1ª tentativa.</span><button class="b sm g" data-act="rmmom">Aplicação normal</button></div>
      <div class="fd"><label for="mom-rc">O que as pessoas refazem</label><select class="in" id="mom-rc" data-refc="1"><option value="tudo" ${c === "tudo" ? "selected" : ""}>${comExp ? "Rever a explicação e refazer o teste" : "Refazer o teste"}</option><option value="erradas" ${c === "erradas" ? "selected" : ""} ${nErr ? "" : "disabled"}>Só as perguntas que erraram${nErr ? " (" + nErr + ")" : ""}</option></select></div>`;
  }
  if (["reav", "ren"].includes(a.mom)) {
    const txt = a.mom === "reav" ? "O relatório mostra quanto cada pessoa reteve." : "Renovação da validade. Quem atingir a meta recomeça a contagem.";
    return `<div class="reap"><span class="sm">${a.dias ? "Reavaliação de " + a.dias + " dias. " : ""}${txt}</span><button class="b sm g" data-act="rmmom">Aplicação normal</button></div>`;
  }
  const pres = prePossiveis(t.id);
  const bt = (v, n, dis) => `<button type="button" data-act="mom" data-v="${v}" aria-pressed="${(a.mom || "") === v}" ${dis ? "disabled" : ""}>${n}</button>`;
  const ajuda = a.mom === "pre" ? "Mede o que a turma já sabe. Não mostra a resposta certa nem o ranking e não entra no reforço."
    : a.mom === "pos" ? "Aplica depois do conteúdo e mostra o ganho de aprendizado de cada pessoa."
    : pres.length ? "Normal, ou pós-teste de um pré-teste já feito." : "Para medir o ganho, aplique antes um pré-teste.";
  return `<div class="fd mom"><span class="lbl" id="mom-l">Momento da aplicação</span><div class="seg" role="group" aria-labelledby="mom-l">${bt("", "Normal")}${bt("pre", "Pré-teste")}${bt("pos", "Pós-teste", !pres.length)}</div>
    <span class="sm mut">${ajuda}</span>
    ${a.mom === "pos" ? `<label class="sr" for="mom-pre">Pré-teste para comparar</label><select class="in" id="mom-pre" data-preid="1">${pres.map(x => `<option value="${x.id}" ${a.base && a.base.sid === x.id ? "selected" : ""}>Pré-teste de ${dtd(x.fim)} · ${x.resultado.pessoas} pessoa${x.resultado.pessoas === 1 ? "" : "s"}${tipoSessao(x) !== "real" ? " (" + (tipoSessao(x) === "teste" ? "teste" : "ensaio") + ")" : ""}</option>`).join("")}</select>` : ""}</div>`;
}

/* ---------- pendências ---------- */
function pendencias(hoje) {
  hoje = hoje || Date.now();
  const cad = new Map(), val = new Map(), rb = new Map();
  S.sessoes.filter(x => x.estado === "encerrada" && tipoSessao(x) === "real" && x.mom !== "pre" && x.resultado && Array.isArray(x.resultado.tabela))
    .sort((a, b) => String(a.fim).localeCompare(String(b.fim))).forEach(s => {
      s.resultado.tabela.forEach(p => {
        const k = s.treinoId + "|" + nk(p.nome), ok = p.pct >= s.meta;
        const reg = {k, treinoId: s.treinoId, nome: p.nome, setor: p.setor || "", pct: p.pct, sid: s.id, fim: s.fim, meta: s.meta};
        const c = cad.get(k);
        if (s.mom === "ref" && c) c.r.push(reg); else cad.set(k, {n1: reg, r: []});   // a nota oficial é a da 1ª tentativa
        if (ok) val.set(k, reg);
        if (s.mom === "reav") { const b = rb.get(k); if (b) b.feito = Math.max(b.feito, s.dias || 0); }
        else rb.set(k, Object.assign({feito: 0}, reg));
      });
    });
  const bx = S.baixas || [];
  const baixado = (tipo, r) => bx.some(b => b.k === r.k && b.tipo === tipo && String(b.em) >= String(r.fim));
  const out = {ref: [], esgot: [], reav: [], val: []}, falha = new Set();
  cad.forEach((c, k) => {
    const ult = c.r.length ? c.r[c.r.length - 1] : c.n1;
    if (ult.pct >= ult.meta || !treino(ult.treinoId)) return;
    falha.add(k); if (baixado("ref", ult)) return;
    if (c.r.length >= 2) { out.esgot.push(Object.assign({}, ult, {n1: c.n1.pct, n2: c.r[0].pct})); return; }   // 3 tentativas usadas
    const rodada = c.r.length + 2, libera = rodada === 3 ? diaSeguinte(Date.parse(c.r[0].fim)) : 0;                // a 3ª só em outro dia
    out.ref.push(Object.assign({}, ult, {rodada, n1: c.n1.pct, n2: c.r.length ? c.r[0].pct : null, libera, bloqueada: libera > hoje, atras: Math.floor((hoje - Date.parse(ult.fim)) / DIA)}));
  });
  rb.forEach(b => {
    if (falha.has(b.k)) return; const t = treino(b.treinoId); if (!t || !Array.isArray(t.reav) || !t.reav.length) return;
    const d = t.reav.slice().sort((x, y) => x - y).find(x => x > b.feito); if (!d) return;
    const venc = Date.parse(b.fim) + d * DIA, falta = Math.ceil((venc - hoje) / DIA);
    if (falta > 14 || baixado("reav" + d, b)) return;
    out.reav.push(Object.assign({}, b, {d, venc, falta}));
  });
  val.forEach(v => {
    if (falha.has(v.k)) return; const t = treino(v.treinoId); if (!t || !(t.per > 0)) return;
    const venc = Date.parse(v.fim) + t.per * DIA, falta = Math.ceil((venc - hoje) / DIA);
    if (falta > 30 || baixado("val", v)) return;
    out.val.push(Object.assign({}, v, {venc, falta}));
  });
  out.total = out.ref.length + out.reav.length + out.val.length;
  out.atrasadas = out.reav.filter(r => r.falta < 0).length + out.val.filter(r => r.falta < 0).length;
  return out;
}
function gruposPend(tipo, P) {
  const m = new Map();
  P[tipo].forEach(r => { const g = tipo === "reav" ? r.treinoId + "|" + r.d : r.treinoId; if (!m.has(g)) m.set(g, {treinoId: r.treinoId, d: r.d, itens: []}); m.get(g).itens.push(r); });
  return [...m.values()].map(g => Object.assign(g, {t: treino(g.treinoId), itens: g.itens.sort((a, b) => (a.falta ?? 0) - (b.falta ?? 0) || a.nome.localeCompare(b.nome, "pt-BR"))}))
    .sort((a, b) => a.t.titulo.localeCompare(b.t.titulo, "pt-BR") || (a.d || 0) - (b.d || 0));
}
/* perguntas que as pessoas erraram na última tentativa (pelo enunciado, que vale entre versões) */
function errosDe(itens) {
  const m = new Set();
  itens.forEach(r => {
    const x = S.sessoes.find(y => y.id === r.sid), pt = x && x.part.find(q => nk(q.nome) === nk(r.nome)); if (!pt) return;
    x.itens.forEach((it, i) => { if (vale(it) && !((x.resp[pt.id] || {})[i] || {}).ok) m.add(it.enunciado); });
  });
  return [...m];
}
function aplicarPend(tipo, treinoId, d) {
  const t = treino(treinoId); if (!t) return;
  let itens = pendencias()[tipo].filter(r => r.treinoId === treinoId && (tipo !== "reav" || r.d === d));
  if (tipo === "ref") {
    const livres = itens.filter(r => !r.bloqueada);
    if (!livres.length && itens.length) { aviso(`A 3ª tentativa só pode ser a partir de ${fmtDia(Math.min(...itens.map(r => r.libera)))}`); return; }
    itens = livres;
  }
  if (!itens.length) { aviso("Nada pendente aqui"); return; }
  const mom = tipo === "ref" ? "ref" : tipo === "reav" ? "reav" : "ren";
  const base = tipo === "val" ? undefined : {rot: tipo === "ref" ? "Última nota" : "Sessão original", itens: itens.map(r => ({nome: r.nome, pct: r.pct, fim: r.fim}))};
  const errados = tipo === "ref" ? errosDe(itens) : undefined;
  UI.apl = {id: t.id, preset: "aovivo", setores: [...new Set(itens.map(r => r.setor).filter(Boolean))], instrutor: S.cfg.instrutor, local: S.cfg.local, horas: "1", aj: Object.assign({}, AJ_PADRAO, PRESETS.aovivo.aj),
    roster: itens.map(r => r.nome), mom, dias: tipo === "reav" ? d : undefined, base, errados, refConteudo: tipo === "ref" ? "tudo" : undefined};
  ir("#/aplicar/" + t.id);
}
function darBaixa(tipo, k, d) {
  const P = pendencias(), r = P[tipo].find(x => x.k === k && (tipo !== "reav" || x.d === d)); if (!r) return;
  const b = {k, tipo: tipo === "reav" ? "reav" + r.d : tipo, em: new Date().toISOString(), nome: r.nome};
  (S.baixas = S.baixas || []).push(b); salvar(); render();
  aviso(`Baixa registrada para ${r.nome.split(" ")[0]}`, "Desfazer", () => { S.baixas = S.baixas.filter(x => x !== b); salvar(); render(); });
}

/* ---------- reforço no celular, visto da sala ---------- */
function refCard(s) {
  if (s.mom === "pre" || !s.part.some(p => p.real)) return "";
  const c = calc(s), R = s.refaz || {};
  const quem = c.pessoas.filter(p => { const pt = s.part.find(x => x.id === p.id); return pt && pt.real && p.ac < c.nq; });
  if (!quem.length) return "";
  const fez = quem.filter(p => R[p.id] && Object.keys(R[p.id]).length).length;
  const tot = quem.reduce((a, p) => a + (c.nq - p.ac), 0), rec = quem.reduce((a, p) => a + Object.values(R[p.id] || {}).filter(x => x.ok).length, 0);
  return `<section class="k" id="refcard"><h3 style="font-size:16px;margin-bottom:4px">Treino no celular</h3><p class="sm mut" style="margin:0 0 8px">Quem errou pode rever e treinar de novo no próprio celular, com até 3 tentativas em cada pergunta. É só treino: não muda nota, ranking nem a fila de reforço. Espere um pouco antes de encerrar.</p>
    <div class="chips"><span class="chip ${fez === quem.length ? "ok" : ""}">${fez} de ${quem.length} já ${fez === 1 ? "treinou" : "treinaram"}</span><span class="chip">${rec} de ${tot} perguntas recuperadas</span></div></section>`;
}
function resumoRefaz(s) {
  const R = s.refaz; if (!R) return null;
  const e = estat(s), lin = [];
  e.pessoas.forEach(p => {
    const x = R[p.id]; if (!x) return;
    const erros = e.c.nq - p.ac, fez = Object.keys(x).length, rec = Object.values(x).filter(y => y.ok).length;
    if (fez) lin.push({nome: p.nome, setor: p.setor, erros, fez, rec, tent: Object.values(x).reduce((a, y) => a + y.t, 0)});
  });
  if (!lin.length) return null;
  lin.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return {lin, pessoas: lin.length, fez: lin.reduce((a, x) => a + x.fez, 0), rec: lin.reduce((a, x) => a + x.rec, 0)};
}

/* ---------- comparativo: ganho, retenção, efeito do reforço ---------- */
function comparativo(s) {
  const b = s.base; if (!b || !Array.isArray(b.itens) || !b.itens.length) return null;
  const mapa = new Map(b.itens.map(x => [nk(x.nome), x])), lin = []; let novos = 0;
  estat(s).pessoas.forEach(p => {
    const k = nk(p.nome), x = mapa.get(k); if (!x) { novos++; return; }
    mapa.delete(k);
    lin.push({nome: p.nome, setor: p.setor, antes: x.pct, agora: p.pct, dif: p.pct - x.pct, g: x.pct < 100 ? Math.round(100 * (p.pct - x.pct) / (100 - x.pct)) : null});
  });
  if (!lin.length) return {rot: b.rot || "Antes", lin, n: 0, novos, ausentes: mapa.size};
  lin.sort((a, b2) => a.nome.localeCompare(b2.nome, "pt-BR"));
  const med = k => Math.round(lin.reduce((a, x) => a + x[k], 0) / lin.length);
  const antes = med("antes"), agora = med("agora");
  return {rot: b.rot || "Antes", lin, n: lin.length, antes, agora, dif: agora - antes, g: antes < 100 ? Math.round(100 * (agora - antes) / (100 - antes)) : null,
    melhoraram: lin.filter(x => x.dif > 0).length, iguais: lin.filter(x => x.dif === 0).length, pioraram: lin.filter(x => x.dif < 0).length, novos, ausentes: mapa.size};
}
const sinal = n => (n > 0 ? "+" : "") + n;
const CMP_TIT = {pos: "Ganho de aprendizado", reav: "Retenção depois de uma reavaliação", ref: "Efeito do reforço", ren: "Comparação com o resultado anterior"};
function cmpTitulo(s) { return (CMP_TIT[s.mom] || "Comparação") + (s.mom === "reav" && s.dias ? ` (${s.dias} dias)` : ""); }
function relCmp(s) {
  const c = comparativo(s); if (!c) return "";
  if (!c.n) return `<section class="k"><h3 class="rh">${esc(cmpTitulo(s))}</h3><p class="sm mut" style="margin:0">Ninguém desta sessão aparece no resultado anterior (${esc(c.rot)}), então não há o que comparar. Os nomes precisam ser os mesmos.</p></section>`;
  const nota = [c.novos ? `${plural(c.novos, "pessoa", "pessoas")} sem resultado anterior ${c.novos === 1 ? "ficou" : "ficaram"} de fora.` : "", c.ausentes ? `${plural(c.ausentes, "pessoa", "pessoas")} do resultado anterior não ${c.ausentes === 1 ? "veio" : "vieram"}.` : ""].filter(Boolean).join(" ");
  return `<div class="k rsm q4"><div><b>${c.antes}%</b><span>${esc(c.rot)} (média)</span></div><div><b>${c.agora}%</b><span>Agora (média)</span></div><div class="${c.dif < 0 ? "w" : ""}"><b>${sinal(c.dif)} pp</b><span>Variação</span></div><div><b>${c.melhoraram} de ${c.n}</b><span>Melhoraram</span></div></div>
    <section class="k"><h3 class="rh">${esc(cmpTitulo(s))}</h3><div class="rtw"><table class="rtb"><thead><tr><th>Nome</th><th class="n">${esc(c.rot)}</th><th class="n">Agora</th><th class="n">Variação</th><th class="n hide-m">Ganho normalizado</th></tr></thead><tbody>${c.lin.map(x => `<tr><td><b>${esc(x.nome)}</b></td><td class="n num">${x.antes}%</td><td class="n num">${x.agora}%</td><td class="n num"><span class="chip ${x.dif > 0 ? "ok" : x.dif < 0 ? "warn" : ""}">${sinal(x.dif)} pp</span></td><td class="n num hide-m">${x.g === null ? "–" : x.g + "%"}</td></tr>`).join("")}</tbody></table></div>
      <p class="sm mut" style="margin:10px 0 0">Variação em pontos percentuais (pp). Ganho normalizado = (agora − antes) ÷ (100 − antes): mostra quanto do que faltava aprender foi aprendido${c.g !== null ? `. Da turma: ${c.g}%` : ""}. ${esc(nota)}</p></section>`;
}
function relRefaz(s) {
  const r = resumoRefaz(s); if (!r) return "";
  return `<section class="k"><h3 class="rh">Treino feito no celular</h3><p class="sm" style="margin:0 0 8px"><b>${plural(r.pessoas, "pessoa treinou", "pessoas treinaram")}</b> perguntas que tinham errado e <b>recuperou${r.rec === 1 ? "" : "ram"} ${r.rec} de ${r.fez}</b>. É só treino: não altera nota, ranking, código de conferência nem a fila de reforço.</p>
    <div class="rtw"><table class="rtb"><thead><tr><th>Nome</th><th class="n">Erros</th><th class="n">Treinou</th><th class="n">Recuperou</th><th class="n hide-m">Tentativas</th></tr></thead><tbody>${r.lin.map(x => `<tr><td><b>${esc(x.nome)}</b></td><td class="n num">${x.erros}</td><td class="n num">${x.fez}</td><td class="n num">${x.rec}</td><td class="n num hide-m">${x.tent}</td></tr>`).join("")}</tbody></table></div></section>`;
}

/* ---------- tela: pendências ---------- */
function linhaPend(tipo, r) {
  let det, ch = "";
  if (tipo === "ref" || tipo === "esgot") {
    det = `Última nota ${r.pct}% em ${dtd(r.fim)} · meta ${r.meta}%${r.n2 !== null && r.n2 !== undefined ? ` · 1ª ${r.n1}%, 2ª ${r.n2}%` : ""}`;
    ch = tipo === "esgot" ? `<span class="chip warn">3 tentativas usadas</span>` : `<span class="chip br">${r.rodada}ª tentativa</span>${r.bloqueada ? `<span class="chip warn">libera ${fmtDia(r.libera)}</span>` : ""}`;
  }
  else if (tipo === "reav") { det = `Sessão de ${dtd(r.fim)} com ${r.pct}%`; ch = r.falta < 0 ? `<span class="chip warn">atrasada ${plural(-r.falta, "dia", "dias")}</span>` : r.falta === 0 ? `<span class="chip warn">vence hoje</span>` : `<span class="chip">em ${plural(r.falta, "dia", "dias")}</span>`; }
  else { det = `Última vez em ${dtd(r.fim)} com ${r.pct}%`; ch = r.falta < 0 ? `<span class="chip warn">venceu há ${plural(-r.falta, "dia", "dias")}</span>` : r.falta === 0 ? `<span class="chip warn">vence hoje</span>` : `<span class="chip">vence em ${plural(r.falta, "dia", "dias")}</span>`; }
  return `<div class="pnd-p">${av(r.nome, hash(r.nome) % CORES_AV.length)}<div class="pnd-n"><b>${esc(r.nome)}</b><span class="sm mut">${r.setor ? esc(r.setor) + " · " : ""}${det}</span></div>${ch}<button class="b sm g" data-act="baixa" data-tipo="${tipo === "esgot" ? "ref" : tipo}" data-k="${esc(r.k)}" data-d="${r.d || ""}" aria-label="Dar baixa em ${esc(r.nome)}">Dar baixa</button></div>`;
}
function corpoPend(tipo, P) {
  const exp = {ref: "Quem ficou abaixo da meta. A nota oficial é a da 1ª tentativa. A 2ª pode ser no mesmo dia e a 3ª só em outro dia. Depois da 3ª a pessoa sai da fila.",
    reav: "Quem deve refazer a avaliação nos prazos escolhidos no editor (30, 60 ou 90 dias). Aparecem as que vencem em até 14 dias e as atrasadas.",
    val: "Treinamentos com validade escolhida no editor. Aparecem os que vencem em até 30 dias e os vencidos."}[tipo];
  const gs = gruposPend(tipo, P), esg = tipo === "ref" ? P.esgot : [];
  const bloco = esg.length ? `<details class="k pnd-esg"><summary><b>${plural(esg.length, "pessoa usou", "pessoas usaram")} as 3 tentativas e continua abaixo da meta</b><span class="sm mut">Decida fora do Sabiá, por exemplo um treinamento presencial. Dar baixa registra que isso foi resolvido.</span></summary><div class="pnd-l">${esg.map(r => linhaPend("esgot", r)).join("")}</div></details>` : "";
  if (!gs.length) {
    const cfg = tipo === "ref" ? "" : S.treinamentos.some(t => tipo === "reav" ? (t.reav || []).length : t.per > 0) ? "" : `<br>Nenhum treinamento tem ${tipo === "reav" ? "reavaliação" : "validade"} configurada. Abra um treinamento no editor para escolher.`;
    return `<p class="sm mut pnd-ex">${exp}</p><section class="k vazio">${ic("check", 'style="width:32px;height:32px;color:var(--ok)"')}<b>${tipo === "ref" ? "Ninguém em reforço" : tipo === "reav" ? "Nenhuma reavaliação para os próximos dias" : "Nenhuma validade perto de vencer"}</b><span class="sm">${tipo === "ref" ? "Só entram aqui as sessões oficiais encerradas com gente abaixo da meta." : "Só contam sessões oficiais encerradas."}${cfg}</span></section>${bloco}`;
  }
  return `<p class="sm mut pnd-ex">${exp}</p>` + gs.map(g => {
    const n2 = g.itens.filter(r => r.rodada === 2).length, n3 = g.itens.filter(r => r.rodada === 3 && !r.bloqueada).length, bl = g.itens.filter(r => r.bloqueada), livres = g.itens.length - bl.length;
    const sub = tipo === "reav" ? `Reavaliação de ${g.d} dias · ${plural(g.itens.length, "pessoa", "pessoas")}` : tipo === "ref" ? [n2 && `${n2} na 2ª tentativa`, n3 && `${n3} na 3ª`, bl.length && `${bl.length} espera o dia da 3ª (a partir de ${fmtDia(Math.min(...bl.map(r => r.libera)))})`].filter(Boolean).join(" · ") : plural(g.itens.length, "pessoa", "pessoas");
    return `<section class="k pnd-g"><div class="pnd-h"><div><b>${esc(g.t.titulo)}</b><span class="sm mut">${sub}</span></div>
      <button class="b p" data-act="aplicarpend" data-tipo="${tipo}" data-id="${g.treinoId}" data-d="${g.d || ""}" ${tipo === "ref" && !livres ? "disabled" : ""}>${ic("play", 'style="width:16px;height:16px"')}${tipo === "ref" ? "Aplicar reforço" : tipo === "reav" ? "Aplicar reavaliação" : "Aplicar renovação"}</button></div>
      <div class="pnd-l">${g.itens.map(r => linhaPend(tipo, r)).join("")}</div></section>`;
  }).join("") + bloco;
}
function vPendencias() {
  const P = pendencias(), n = P.total;
  topo("Pendências", n ? `${plural(n, "pendência", "pendências")}${P.atrasadas ? ` · ${P.atrasadas} atrasada${P.atrasadas === 1 ? "" : "s"}` : ""}` : "Tudo em dia");
  $("#app").className = "body pnd";
  if (!PND.aba || !["ref", "reav", "val"].includes(PND.aba)) PND.aba = P.ref.length ? "ref" : P.reav.length ? "reav" : P.val.length ? "val" : "ref";
  const abas = [["ref", "Reforço", P.ref.length], ["reav", "Reavaliar", P.reav.length], ["val", "Validade", P.val.length]];
  $("#app").innerHTML = `<div class="seg pnd-abas" role="group" aria-label="Tipo de pendência">${abas.map(([k, nm, c]) => `<button data-act="pndaba" data-v="${k}" aria-pressed="${PND.aba === k}">${nm}<i>${c}</i></button>`).join("")}</div>${corpoPend(PND.aba, P)}`;
}
/* usado na aba "Em reforço" de Treinos */
function reforcoEmTreinos() {
  const P = pendencias();
  return `<div class="pnd pnd-in">${corpoPend("ref", P)}</div>`;
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "pndaba") { PND.aba = el.dataset.v; render(); }
  else if (a === "aplicarpend") aplicarPend(el.dataset.tipo, el.dataset.id, Number(el.dataset.d) || undefined);
  else if (a === "baixa") darBaixa(el.dataset.tipo, el.dataset.k, Number(el.dataset.d) || undefined);
  else if (a === "mom" && UI.apl) {
    const v = el.dataset.v; UI.apl.mom = v || undefined;
    if (v === "pre") { if (UI.apl.preRank === undefined) UI.apl.preRank = UI.apl.aj.ranking; UI.apl.aj.ranking = false; }
    else if (UI.apl.preRank !== undefined) { UI.apl.aj.ranking = UI.apl.preRank; UI.apl.preRank = undefined; }
    if (v === "pos") { const p = prePossiveis(UI.apl.id)[0]; UI.apl.base = p ? baseDePre(p.id) : undefined; }
    else UI.apl.base = undefined;
    render();
  }
  else if (a === "edreav" && rota().v === "editar" && UI.ed) {
    const tr = treino(UI.ed.id); if (!tr) return; const d = Number(el.dataset.d), l = new Set(tr.reav || []);
    if (l.has(d)) l.delete(d); else l.add(d);
    tr.reav = [...l].sort((x, y) => x - y); tr.atualizado = new Date().toISOString(); salvar(); el.setAttribute("aria-pressed", String(l.has(d)));
  }
  else if (a === "rmmom" && UI.apl) { UI.apl.mom = undefined; UI.apl.dias = undefined; UI.apl.base = undefined; render(); }
  else if (a === "aplicarpos") {
    const x = S.sessoes.find(y => y.id === el.dataset.id), t = x && treino(x.treinoId); if (!t) { aviso("O treinamento desta sessão foi removido"); return; }
    UI.apl = {id: t.id, preset: "aovivo", setores: (x.setores || []).slice(), instrutor: x.instrutor || S.cfg.instrutor, local: x.local || S.cfg.local, horas: x.horas || "1", aj: Object.assign({}, AJ_PADRAO, PRESETS.aovivo.aj),
      roster: x.resultado.tabela.map(p => p.nome), mom: "pos", base: baseDePre(x.id)};
    ir("#/aplicar/" + t.id);
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.preid && UI.apl) { UI.apl.base = baseDePre(t.value); }
  else if (t.dataset.refc && UI.apl) { UI.apl.refConteudo = t.value; render(); }
  else if (t.id === "et-per" && rota().v === "editar" && UI.ed) {
    const tr = treino(UI.ed.id); if (!tr) return; const n = Number(t.value); tr.per = VALIDADES.some(v => v[0] === n) ? n : 0; tr.atualizado = new Date().toISOString(); salvar();
  }
});
