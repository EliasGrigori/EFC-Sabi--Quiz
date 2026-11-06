/* ===== v0.2.0 · sala ao vivo, chave, QR e telão ===== */
const NOMES = ["Maria Aparecida","Antônio Carlos","Raimunda Souza","Francisca Lima","José Wellington","Luzia Rodrigues","Pedro Henrique","Ana Cláudia","Marcos Vinícius","Cícera Alves","Joaquim Neto","Terezinha Gomes","Paulo Roberto","Vanessa Costa","Edivan Silva","Socorro Pereira","Mateus Oliveira","Rejane Martins","Geraldo Freitas","Lúcia Helena","Carlos Eduardo","Rita de Cássia","Damião Araújo","Fátima Nogueira"];
const COR_ALT = ["#C9432B", "#2A63C2", "#C98F00", "#2A8752"];
const FORMAS = ['<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z" fill="currentColor"/>', '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" fill="currentColor"/>', '<circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', '<path d="M5 15l3-8h8l3 8-4 4H9z" fill="currentColor"/>'];
const CORES_AV = ["#0F5A56", "#B84D10", "#2A63C2", "#7A4FB0", "#2A8752", "#A1346A", "#8A6A00", "#C9432B"];
const RAPIDO = new URLSearchParams(location.search).get("rapido") === "1";
const AO = {id: null, ch: null, timers: [], snap: null, qrc: {}};
try { AO.ch = new BroadcastChannel("sabia-telao"); } catch(e) {}

const sala = id => S.sessoes.find(x => x.id === id);
const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const iniciais = n => n.split(/\s+/).filter(x => /[\p{L}\p{N}]/u.test(x)).slice(0, 2).map(x => x.match(/[\p{L}\p{N}]/u)[0]).join("").toUpperCase();
const av = (n, c) => `<span class="av" style="background:${CORES_AV[Number.isInteger(c) && c >= 0 && c < CORES_AV.length ? c : hash(n) % CORES_AV.length]}" aria-hidden="true">${esc(iniciais(n))}</span>`;
const embaralhado = (n, seed) => { // ordem fixa por pergunta, nunca igual à certa
  const a = [...Array(n).keys()]; let x = seed + 7;
  for (let i = n - 1; i > 0; i--) { x = (x * 1103515245 + 12345) & 0x7fffffff; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  if (n > 1 && a.every((v, i) => v === i)) a.push(a.shift());
  return a;
};
const linkBase = () => location.href.split("#")[0].split("?")[0];
const linkEntrar = s => linkBase() + "#/entrar/" + s.chave + (Rede.ok() ? "/" + Rede.seg(Rede.url()) : "");
const linkTelao = s => linkBase() + "#/telao/" + s.id;
const fmtChave = c => c.slice(0, 3) + " " + c.slice(3);

/* ---------- criar a sala ---------- */
function novaChave() {
  let c; const usadas = new Set(S.sessoes.filter(x => x.estado === "sala").map(x => x.chave));
  do { c = String(Math.floor(100000 + Math.random() * 900000)); } while (usadas.has(c));
  return c;
}
function abrirSalaDe(sessao) {
  const t = treino(sessao.treinoId); if (!t) { aviso("O treinamento dessa sessão foi removido"); return; }
  if (!sessao.itens) { fixarVersao(t); sessao.itens = clone(t.itens); }
  if (metaPts(t) && sessao.metaEq == null) { sessao.metaTipo = "pts"; sessao.metaPts = t.meta; sessao.metaEq = metaEq(t, sessao.itens); }   // v1.2.0: antes do recorte, para a meta não mudar com menos perguntas
  aplicaRecorte(sessao); aquecer(sessao);
  Object.assign(sessao, {titulo: t.titulo, meta: sessao.metaEq != null ? sessao.metaEq : t.meta, versao: t.versao, estado: "sala", chave: sessao.chave || novaChave(), entrada: true,
    part: sessao.part || [], resp: sessao.resp || {}, fase: sessao.fase || {etapa: "espera", idx: -1, t0: 0, dur: 0}, sim: sessao.sim || {on: !Rede.ok(), alvo: 12}});
  Rede.garantir(sessao);
  AO.id = sessao.id; salvar(); ir("#/sala/" + sessao.id);
}
function abrirSalaNova() {
  const a = UI.apl, t = treino(a.id); if (!t) return;
  const s = {id: uid(), treinoId: t.id, preset: a.preset, setores: a.setores.slice(), instrutor: a.instrutor.trim(), local: a.local.trim(), horas: a.horas, aj: Object.assign({}, a.aj), roster: rosterDe(a), reaplicaDe: a.reaplicaDe, estado: "preparada", criada: new Date().toISOString()};
  momentoDe(s, a);
  S.sessoes.push(s); if (a.instrutor.trim() && !S.cfg.instrutor) S.cfg.instrutor = a.instrutor.trim();
  UI.apl = null; abrirSalaDe(s);
}

/* ---------- regras da sessão ---------- */
const ehPergunta = it => it.tipo !== "explicacao";
const vale = it => ehPergunta(it) && it.uso !== "ensaio";
function entrarItem(s, i) {
  const it = s.itens[i], agora = Date.now();
  fechouPerg(s); limparSim();
  if (!ehPergunta(it)) s.fase = {etapa: "explicacao", idx: i, t0: agora, dur: 0};
  else {
    const dur = s.aj.tempo === "fecha" ? (it.tempo || 20) * 1000 * (s.aj.extra ? 1.5 : 1) : 0;
    s.fase = {etapa: "pergunta", idx: i, t0: agora, dur};
    agendaSim(s);
  }
}
/* resposta que sai do celular antes do toque "passar" mas só chega depois: guardamos a pergunta que acabou de fechar */
const GRACA_RESP = 4000;
function fechouPerg(s) { if (s.fase && s.fase.etapa === "pergunta") s.ult = {i: s.fase.idx, tp: s.fase.t0, dur: s.fase.dur || 0, fim: Date.now()}; }
function irResultado(s) { fechouPerg(s); limparSim(); s.fase = Object.assign({}, s.fase, {etapa: "resultado", t0: Date.now(), dur: 0}); beep(660); }
function irPodio(s) { fechouPerg(s); limparSim(); s.fase = {etapa: "podio", idx: s.itens.length, t0: Date.now(), dur: 0}; beep(880); }
function seguir(s) { const i = s.fase.idx + 1; if (i >= s.itens.length) irPodio(s); else entrarItem(s, i); }
/* no pré-teste a resposta certa não aparece: depois da pergunta vai direto para a próxima etapa */
function fimPergunta(s) { if (s.mom === "pre") seguir(s); else irResultado(s); }
function proxima(s) {
  const f = s.fase;
  if (f.etapa === "pergunta") fimPergunta(s);
  else if (f.etapa === "podio") return encerrar(s);
  else seguir(s);
  mudou(s);
}
function calc(s) {
  const qs = s.itens.map((it, i) => [it, i]).filter(([it]) => vale(it)), nq = qs.length;
  const pessoas = s.part.map(p => {
    let ac = 0, pts = 0; const rs = s.resp[p.id] || {};
    qs.forEach(([, i]) => { const r = rs[i]; if (r) { if (r.ok) ac++; pts += r.pts; } });
    return {id: p.id, nome: p.nome, setor: p.setor, cor: p.cor, b: p.b, ac, pts, pct: nq ? Math.round(100 * ac / nq) : 0};
  });
  const tot = pessoas.reduce((a, p) => a + p.ac, 0);
  const pct = nq && pessoas.length ? Math.round(100 * tot / (nq * pessoas.length)) : 0;
  const efic = pessoas.filter(p => p.pct >= s.meta).length;
  const ranking = pessoas.slice().sort((a, b) => b.pts - a.pts || b.ac - a.ac || a.nome.localeCompare(b.nome, "pt-BR"));
  return {nq, pessoas, pct, efic, reforco: pessoas.length - efic, ranking, metaOk: pct >= s.meta};
}
function encerrar(s) {
  limparSim(); Rede.fechar(s);
  if (!s.part.length && s.fase.etapa === "espera") { S.sessoes = S.sessoes.filter(x => x.id !== s.id); AO.id = null; salvar(); publicar(null); ir("#/inicio"); aviso("Sala fechada sem ninguém"); return; }
  const c = calc(s);
  s.estado = "encerrada"; s.fim = new Date().toISOString();
  s.resultado = {nq: c.nq, pct: c.pct, pessoas: c.pessoas.length, efic: c.efic, reforco: c.reforco, metaOk: c.metaOk, tabela: c.ranking.map(p => ({nome: p.nome, setor: p.setor, ac: p.ac, pts: p.pts, pct: p.pct}))};
  s.cod = codigoDe(s);
  if (AO.id === s.id) AO.id = null;
  salvar(); publicar(null, s.id); UI.aba = "encerradas"; ir("#/treinos"); aviso("Sessão encerrada e guardada em Encerradas");
}
function registrar(s, p, i, r, tarde) {
  /* tarde: a resposta saiu do celular antes de fechar a pergunta e chegou logo depois; conta como se tivesse chegado no último instante */
  const it = s.itens[i], f = tarde ? {t0: s.ult.tp, dur: s.ult.dur} : s.fase, ms = (tarde ? s.ult.fim : Date.now()) - f.t0;
  const ok = it.tipo === "ordenar" ? (Array.isArray(r) && r.every((v, k) => v === k)) : r === it.correta;
  const bonus = s.aj.gincana && f.dur ? Math.round(500 * Math.max(0, 1 - ms / f.dur)) : 0;
  (s.resp[p.id] = s.resp[p.id] || {})[i] = {r, ok, ms, pts: vale(it) && ok ? 1000 + bonus : 0};
}

/* ---------- participantes simulados ---------- */
function limparSim() { AO.timers.forEach(clearTimeout); AO.timers = []; }
function simAdd(s) {
  const usados = new Set(s.part.map(p => p.nome)); const livres = NOMES.filter(n => !usados.has(n)); if (!livres.length) return false;
  const nome = livres[Math.floor(Math.random() * livres.length)], setores = s.setores.length ? s.setores : (S.cfg.setores.length ? S.cfg.setores : ["Geral"]);
  s.part.push({id: uid(), nome, setor: setores[Math.floor(Math.random() * setores.length)], sim: true, hab: 0.45 + Math.random() * 0.5, b: bonSorteio()});
  return true;
}
function agendaSim(s) {
  const i = s.fase.idx, it = s.itens[i], dur = s.fase.dur;
  s.part.filter(p => p.sim && !(s.resp[p.id] || {})[i]).forEach(p => {
    const d = RAPIDO ? 20 + Math.random() * 80 : (dur ? (0.12 + Math.random() * 0.75) * dur : 2000 + Math.random() * 14000);
    AO.timers.push(setTimeout(() => {
      if (s.estado !== "sala" || s.fase.idx !== i || s.fase.etapa !== "pergunta") return;
      const ok = Math.random() < p.hab; let r;
      if (it.tipo === "ordenar") { const n = it.alternativas.length; r = ok ? [...Array(n).keys()] : embaralhado(n, hash(p.id + i)); }
      else { const n = it.alternativas.length; r = ok ? it.correta : (() => { const o = [...Array(n).keys()].filter(k => k !== it.correta); return o[Math.floor(Math.random() * o.length)]; })(); }
      registrar(s, p, i, r); mudou(s);
    }, d));
  });
}

/* ---------- comunicação com o telão ---------- */
function snap(s) {
  if (!s) return null;
  const f = s.fase, it = s.itens[f.idx], c = calc(s);
  const nPerg = s.itens.filter(vale).length;
  const numPerg = it && ehPergunta(it) ? s.itens.slice(0, f.idx + 1).filter(ehPergunta).length : 0;
  const totalPerg = s.itens.filter(ehPergunta).length;
  const revela = f.etapa === "resultado";
  let item = null, dist = null, resp = 0;
  if (it) {
    item = {tipo: it.tipo, enunciado: it.enunciado, texto: it.texto || "", alts: it.alternativas || [], ordem: it.tipo === "ordenar" ? embaralhado(it.alternativas.length, f.idx) : null, correta: revela ? it.correta : null, porque: revela ? (it.porque || "") : "", ensaio: it.uso === "ensaio", voz: audioOk(it.audio) ? it.audio : "", cap: Number.isInteger(it.cap) ? it.cap : null};
    if (ehPergunta(it)) {
      const rs = s.part.map(p => (s.resp[p.id] || {})[f.idx]).filter(Boolean); resp = rs.length;
      if (revela) dist = it.tipo === "ordenar" ? {acertos: rs.filter(r => r.ok).length, total: rs.length} : it.alternativas.map((_, k) => rs.filter(r => r.r === k).length);
    }
  }
  return {id: s.id, chave: s.chave, titulo: s.titulo, instrutor: s.instrutor, meta: s.meta, metaTxt: metaTxtS(s), mom: s.mom || "", tela: s.aj.telao, som: s.aj.som, ranking: s.aj.ranking, entrada: s.entrada,
    mat: matSnap(s), fase: f, min: Math.max(1, Math.round(s.itens.reduce((a, x) => a + (ehPergunta(x) ? (x.tempo || 20) + 8 : 120), 0) / 60)), nPart: s.part.length, part: s.part.slice(-60).map(p => ({n: p.nome, c: p.cor, b: p.b})), item, numPerg, totalPerg, nPerg, resp, dist, url: linkEntrar(s),
    resumo: f.etapa === "podio" ? {porPerg: s.itens.map((x, i) => [x, i]).filter(([x]) => vale(x)).map(([, i], k) => ({n: k + 1, pct: s.part.length ? Math.round(100 * s.part.filter(p => ((s.resp[p.id] || {})[i] || {}).ok).length / s.part.length) : 0})), pct: c.pct, efic: c.efic, reforco: c.reforco, metaOk: c.metaOk, nq: c.nq, top: c.ranking.slice(0, 10).map(p => ({n: p.nome, c: p.cor, b: p.b, ac: p.ac, pts: p.pts}))} : null};
}
function publicar(s, vazioId) {
  const sn = snap(s); AO.snap = sn;
  if (AO.ch) { try { AO.ch.postMessage({t: "estado", id: s ? s.id : vazioId || null, snap: sn}); } catch(e) {} }
}
if (AO.ch) AO.ch.onmessage = e => {
  const m = e.data || {};
  if (m.t === "oi") { const s = AO.id && sala(AO.id); if (s && s.estado === "sala") publicar(s); }
  else if (m.t === "estado" && rota().v === "telao") { const r = rota(); if (!r.id || m.id === r.id || m.id === null) { AO.snap = m.snap; if (m.snap || m.id === r.id) pintarTelao(); } }
};
function mudou(s) { salvar(); publicar(s); Rede.sync(s); if (rota().v === "sala" || rota().v === "telao") render(); }

/* ---------- som ---------- */
let ac = null;
function beep(f) {
  try { const s = AO.id && sala(AO.id); if (!s || s.aj.som !== "ligado") return; ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = .06; o.connect(g); g.connect(ac.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + .25); o.stop(ac.currentTime + .26); } catch(e) {}
}

/* ---------- telão (1280×720) ---------- */
const forma = k => `<span class="sh"><svg viewBox="0 0 24 24" aria-hidden="true">${FORMAS[k % 4]}</svg></span>`;
function telaoHTML(sn) {
  const claro = sn && sn.tela === "claro" ? " claro" : "";
  if (!sn) return `<div class="tel${claro}"><div class="tt"><svg viewBox="0 0 48 48" style="width:34px;height:34px"><use href="#logo"/></svg><b>Sabiá</b></div><div class="vaz"><div><b style="font-family:var(--f-disp);font-size:44px;color:var(--tel-ink)">Aguardando a sala</b><br>O instrutor abre a sala no Sabiá e esta tela se liga sozinha.</div></div></div>`;
  const f = sn.fase, it = sn.item, topo = (mid, dir) => `<div class="tt"><svg viewBox="0 0 48 48" style="width:34px;height:34px"><use href="#logo"/></svg>${mid}<div class="grow"></div>${dir || `<span class="pillk">CHAVE ${fmtChave(sn.chave)}</span>`}</div>`;
  const prog = n => `<div class="tprog">${Array.from({length: sn.totalPerg}, (_, k) => `<i class="${k + 1 < n ? "d" : k + 1 === n ? "c" : ""}"></i>`).join("")}</div>`;
  let corpo = "";
  if (f.etapa === "espera") {
    corpo = `${topo(`<b>${esc(sn.titulo)}</b><span>${sn.instrutor ? "instrutor " + esc(sn.instrutor) : ""}</span>`)}
      <div class="lobm"><div class="join"><div class="qr" data-qr="${esc(sn.url)}"></div><div><div class="kl">ou abra o Sabiá e digite</div><div class="kk">${fmtChave(sn.chave)}</div></div>
        <div class="how"><div><b>1</b>Aponte a câmera para o QR</div><div><b>2</b>Toque no seu nome</div><div><b>3</b>Monte seu bicho e aguarde</div></div></div>
        <div class="room"><div class="rh"><b>${sn.nPart}</b><span>${sn.nPart === 1 ? "pessoa na sala" : "pessoas na sala"}${sn.entrada ? "" : " · entrada fechada"}</span></div>
        <div class="crowd ${sn.nPart <= 14 ? "g" : ""}">${sn.part.map(p => `<span class="cw">${avB(p.n, p.c, p.b)}${esc(p.n.split(" ")[0])}</span>`).join("") || `<span style="font-size:22px;color:var(--tel-ink2)">Ninguém entrou ainda.</span>`}</div>
        <div class="facts"><div><b>${sn.nPerg}</b><span>perguntas valendo</span></div><div><b>${sn.min} min</b><span>de duração</span></div><div><b>${sn.metaTxt || sn.meta + "%"}</b><span>de meta</span></div></div></div></div>
      <div class="tfoot"><span>Começa quando o instrutor tocar em <b>Iniciar</b> · ${sn.nPerg} perguntas</span></div>`;
  } else if (f.etapa === "explicacao") {
    corpo = `${topo(`<b>${esc(sn.titulo)}</b>`)}<div class="expl"><h2>${esc(it.enunciado)}${btnTelVoz(it)}</h2>${it.texto ? `<p>${esc(it.texto)}</p>` : ""}${matDicaTel(sn, it)}</div><div class="tfoot"><span>Atenção na explicação do instrutor</span></div>`;
  } else if (f.etapa === "pergunta" || f.etapa === "resultado") {
    const rev = f.etapa === "resultado", n = it.alts.length;
    const rel = f.dur ? `<div class="ring"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="48" fill="none" stroke="var(--tel-line)" stroke-width="9"/><circle data-k="c" data-fim="${f.t0 + f.dur}" data-dur="${f.dur}" cx="55" cy="55" r="48" fill="none" stroke="#D45D17" stroke-width="9" stroke-linecap="round" stroke-dasharray="301.6" stroke-dashoffset="0"/></svg><span data-k="n" data-fim="${f.t0 + f.dur}" data-dur="${f.dur}">${Math.ceil(f.dur / 1000)}</span></div>` : "";
    let tiles;
    if (it.tipo === "ordenar") {
      const ordem = rev ? [...Array(n).keys()] : it.ordem;
      tiles = `<div class="ordl">${ordem.map((k, pos) => `<div><b>${pos + 1}</b>${esc(it.alts[k])}</div>`).join("")}</div>`;
    } else {
      tiles = `<div class="ttiles">${it.alts.map((a, k) => { const pc = rev && sn.dist ? Math.round(100 * sn.dist[k] / Math.max(1, sn.resp)) : null; const cls = rev ? (k === it.correta ? " cor" : " off") : "";
        return `<div class="tile${cls}" style="background:${COR_ALT[k % 4]}">${forma(k)}<span>${esc(a)}</span>${pc !== null ? `<span class="pc">${pc}%</span>` : ""}</div>`; }).join("")}</div>`;
    }
    const rodape = rev ? (it.tipo === "ordenar" && sn.dist ? `<span class="bigc">${sn.dist.acertos} de ${sn.dist.total}</span><span>acertaram a ordem</span>` : `<span class="bigc">${sn.dist ? sn.dist[it.correta] : 0} de ${sn.resp}</span><span>acertaram</span>`) + (it.porque ? `<span style="margin-left:18px;color:var(--tel-ink2);flex:1;font-size:19px">${esc(it.porque)}</span>` : "")
      : `<span class="bigc">${sn.resp} de ${sn.nPart}</span><span style="color:var(--tel-ink2)">já responderam</span>`;
    corpo = `${topo(`<b>${it.ensaio ? "Pergunta de teste" : "Pergunta " + sn.numPerg + " de " + sn.totalPerg}</b>${prog(sn.numPerg)}`)}<div class="tq"><h2>${esc(it.enunciado)}${rev ? "" : btnTelVoz(it)}</h2>${rev ? "" : rel}</div>${tiles}<div class="answ">${rodape}</div>`;
  } else if (f.etapa === "podio") {
    const r = sn.resumo, t = r.top, bl = (p, pos, h) => p ? `<div class="pl ${pos === 1 ? "p1" : ""}">${avB(p.n, p.c, p.b)}<div class="blk" style="height:${h}px"><b>${pos}º</b><strong>${esc(p.n)}</strong>${p.ac} de ${r.nq} · ${p.pts} pts</div></div>` : "";
    const conf = sn.som === "ligado" ? `<div class="conf">${Array.from({length: 26}, (_, k) => `<i style="left:${(k * 37) % 100}%;background:${COR_ALT[k % 4]};animation-delay:${(k % 9) * .35}s"></i>`).join("")}</div>` : "";
    corpo = `${topo(`<b>Resultado da turma</b><span>${esc(sn.titulo)}</span>`, `<span class="pillk">${sn.nPart} PESSOAS</span>`)}
      <div class="podm"><div class="podl"><div>${sn.mom === "pre" ? `<h2>Pré-teste concluído</h2><div class="res"><span>${r.pct}% de acerto médio</span><span>ponto de partida da turma</span></div>` : `<h2>${r.metaOk ? "A turma bateu a meta" : "A turma ficou abaixo da meta"}</h2><div class="res"><span class="${r.metaOk ? "g" : "r"}">${r.pct}% de acerto · meta ${sn.metaTxt || sn.meta + "%"}</span><span>${r.efic} de ${sn.nPart} eficazes</span>${r.reforco ? `<span>${r.reforco} vão para o reforço</span>` : ""}</div>`}</div>
        <div class="pq">${r.porPerg.map(q => `<div><span class="bar"><i style="height:${Math.max(4, q.pct)}%;background:${q.pct >= sn.meta ? "var(--ok)" : "var(--sabia)"}"></i></span><b>${q.pct}%</b><span>P${q.n}</span></div>`).join("")}</div>
        ${sn.ranking ? `<div class="stage">${bl(t[1], 2, 150)}${bl(t[0], 1, 205)}${bl(t[2], 3, 112)}</div>` : ""}</div>
        <div class="podr"><h3>${sn.ranking ? "Do 4º ao 10º" : "Resultado"}</h3>${sn.ranking ? t.slice(3).map((p, k) => `<div class="pr2"><b>${k + 4}º</b>${avB(p.n, p.c, p.b)}<span>${esc(p.n.split(" ").length > 1 ? p.n.split(" ")[0] + " " + p.n.split(" ").slice(-1)[0] : p.n)}</span><span class="num">${p.pts}</span></div>`).join("") || `<span style="color:var(--tel-ink2);font-size:17px">Sem mais participantes.</span>` : `<span style="color:var(--tel-ink2);font-size:17px">O ranking está desligado nesta sessão.</span>`}</div></div>${conf}`;
  }
  return `<div class="tel${claro}">${corpo}</div>`;
}
function hidratarQR(root) {
  root.querySelectorAll("[data-qr]").forEach(el => {
    const url = el.dataset.qr;
    if (AO.qrc[url]) { el.innerHTML = `<img src="${AO.qrc[url]}" alt="QR para entrar na sala">`; return; }
    try { new QRCode(el, {text: url, width: 220, height: 220, colorDark: "#0A2C2B", colorLight: "#FFFFFF", correctLevel: QRCode.CorrectLevel.M});
      const cv = el.querySelector("canvas"); if (cv) AO.qrc[url] = cv.toDataURL(); } catch(e) { el.textContent = "QR indisponível"; }
  });
}
function escalar() {
  document.querySelectorAll(".telwrap").forEach(w => { const k = w.clientWidth / 1280, t = w.firstElementChild; if (!t) return; w.style.height = (720 * k) + "px"; t.style.transform = `scale(${k})`; });
  document.querySelectorAll(".telfull").forEach(w => { const k = Math.min(innerWidth / 1280, innerHeight / 720), t = w.firstElementChild; if (!t) return; t.style.transform = `translate(${-640 * k}px,${-360 * k}px) scale(${k})`; });
}
function pintarTelao() { const w = $(".telfull"); if (!w) return; w.innerHTML = telaoHTML(AO.snap); matAtualizaTelao(); hidratarQR(w); escalar(); tickTempo(); vozAuto(); }
function vTelao(id) {
  document.body.classList.add("modo-telao"); $("#app").className = "body";
  $("#app").innerHTML = `<div class="telfull" role="img" aria-label="Telão da sala"></div>${tvBarra()}`;
  if (AO.snap && AO.snap.id !== id) AO.snap = null;
  pintarTelao(); tvIniciar();
  if (AO.ch) AO.ch.postMessage({t: "oi", id});
}
function tickTempo() {
  const agora = Date.now();
  document.querySelectorAll("[data-fim]").forEach(el => {
    const fim = +el.dataset.fim, dur = +el.dataset.dur, rest = Math.max(0, fim - agora), fr = dur ? rest / dur : 0, k = el.dataset.k;
    if (k === "n") el.textContent = Math.ceil(rest / 1000);
    else if (k === "c") el.setAttribute("stroke-dashoffset", String(301.6 * (1 - fr)));
    else if (k === "b") el.style.width = (100 * (1 - fr)) + "%";
    else if (k === "t") { const s = Math.ceil(rest / 1000); el.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  });
}
function loopLive() {
  tickTempo();
  const s = AO.id && sala(AO.id);
  if (s && s.estado === "sala" && s.fase.etapa === "pergunta" && s.fase.dur && Date.now() >= s.fase.t0 + s.fase.dur) { fimPergunta(s); mudou(s); }
}
setInterval(loopLive, 250);
setInterval(() => { const s = AO.id && sala(AO.id); if (s && s.estado === "sala" && s.fase.etapa === "espera" && s.entrada && s.sim.on && s.part.length < s.sim.alvo && simAdd(s)) mudou(s); }, RAPIDO ? 40 : 700);
window.addEventListener("resize", escalar);

/* ---------- tela de controle ---------- */
function acaoPrincipal(s) {
  const f = s.fase, u = f.idx >= s.itens.length - 1;
  if (f.etapa === "espera") return {t: "Iniciar", i: "play", dis: !s.part.length};
  if (f.etapa === "pergunta") return s.mom === "pre" ? {t: u ? "Encerrar o pré-teste" : "Próxima pergunta", i: "play"} : {t: "Encerrar tempo e mostrar resposta", i: "check"};
  if (f.etapa === "podio") return {t: "Encerrar sessão e guardar", i: "check"};
  return {t: u ? "Ver o pódio" : "Próxima", i: "play"};
}
const ETAPA = {espera: "Sala de espera", explicacao: "Explicação", pergunta: "Pergunta no ar", resultado: "Resultado da pergunta", podio: "Pódio"};
function vSala(id) {
  const s = sala(id);
  if (!s || s.estado !== "sala") { topo("Sala ao vivo", "", "", "#/inicio"); $("#app").className = "body"; $("#app").innerHTML = `<div class="k vazio"><b>${s && s.estado === "encerrada" ? "Esta sessão já foi encerrada" : "Sala não encontrada"}</b><a class="b" href="#/treinos">Ir para Treinos</a></div>`; return; }
  AO.id = s.id; const f = s.fase, ap = acaoPrincipal(s), c = calc(s), it = s.itens[f.idx], sn = snap(s); AO.snap = sn;
  const respondeu = it && ehPergunta(it) ? s.part.filter(p => (s.resp[p.id] || {})[f.idx]) : [];
  let n = 0;
  const passos = s.itens.map((x, i) => { const e = !ehPergunta(x), t = x.uso === "ensaio"; if (!e && !t) n++; const rot = e ? "E" : t ? "T" : String(n); const cls = (f.idx > i || f.etapa === "podio") ? "fe" : (f.idx === i ? "at" : ""); return `<span class="nd ${e ? "e" : ""} ${cls}" title="${esc(x.enunciado)}">${rot}</span>`; }).join("");
  let dist = "";
  if (it && ehPergunta(it) && (f.etapa === "pergunta" || f.etapa === "resultado")) {
    if (it.tipo === "ordenar") { const ac = respondeu.filter(p => s.resp[p.id][f.idx].ok).length; dist = `<div class="sm mut">${respondeu.length} de ${s.part.length} responderam${f.etapa === "resultado" ? " · " + ac + " acertaram a ordem" : ""}</div>`; }
    else dist = `<div class="dist">${it.alternativas.map((a, k) => { const q = respondeu.filter(p => s.resp[p.id][f.idx].r === k).length, pc = respondeu.length ? Math.round(100 * q / respondeu.length) : 0; const certa = f.etapa === "resultado" && k === it.correta;
      return `<div class="dr" title="${esc(a)}"><span class="nd" style="background:${COR_ALT[k % 4]};color:#fff;border-color:transparent;width:22px;height:22px">${"ABCD"[k]}</span><div class="db"><i style="width:${pc}%;background:${certa ? "var(--ok)" : COR_ALT[k % 4]}"></i></div><span class="num">${q}</span></div>`; }).join("")}</div>`;
  }
  const tempo = f.etapa === "pergunta" && f.dur ? `<span class="tm" data-k="t" data-fim="${f.t0 + f.dur}" data-dur="${f.dur}">0:${String(Math.ceil(f.dur / 1000)).padStart(2, "0")}</span>` : "";
  const barra = f.etapa === "pergunta" && f.dur ? `<div class="pbar"><i data-k="b" data-fim="${f.t0 + f.dur}" data-dur="${f.dur}"></i></div>` : "";
  const msgWa = encodeURIComponent(`Treinamento "${s.titulo}". Entre pelo link: ${linkEntrar(s)} ou digite a chave ${fmtChave(s.chave)}.`);
  topo("Sala ao vivo", `${s.titulo}${s.mom ? " · " + MOM_TXT[s.mom] : ""} · ${s.part.length} pessoa${s.part.length === 1 ? "" : "s"}`, `<button class="b" data-act="telao" aria-label="Abrir telão">${ic("screen")}<span class="lbl-m">Abrir telão</span></button>`, "#/inicio");
  $("#app").className = "body sala";
  $("#app").innerHTML = `<div class="lc">
    <section class="k etapa" aria-live="polite"><div class="eh"><span class="chip br">${ETAPA[f.etapa]}</span>${it && f.etapa !== "espera" && f.etapa !== "podio" ? `<span class="sm mut">${ehPergunta(it) ? (it.uso === "ensaio" ? "pergunta de teste" : "pergunta " + sn.numPerg + " de " + sn.totalPerg) : "explicação"}</span>` : ""}${tempo}</div>
      ${it && f.etapa !== "espera" && f.etapa !== "podio" ? `<div style="font-weight:600">${esc(it.enunciado)}</div>` : ""}${barra}
      <button class="b p go" data-act="proxima" ${ap.dis ? "disabled" : ""}>${ic(ap.i)}${ap.t}</button>
      ${matBtnCtl(sn)}
      ${ap.dis ? `<span class="sm mut">Espere alguém entrar, ou ligue os participantes simulados abaixo.</span>` : ""}
      <div class="tl2" role="list" aria-label="Etapas">${passos}</div></section>
    <section class="k"><div class="chave"><div><div class="lbl">Chave da sala</div><div class="cod" id="cod">${fmtChave(s.chave)}</div></div><span class="chip ${s.entrada ? "ok" : "warn"}">${s.entrada ? "entrada aberta" : "entrada fechada"}</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="b sm" data-act="entrada">${s.entrada ? "Fechar entrada" : "Abrir entrada"}</button><button class="b sm" data-act="copiar" data-v="${esc(linkEntrar(s))}">${ic("copy", 'style="width:16px;height:16px"')}Copiar link</button><a class="b sm" target="_blank" rel="noopener" href="https://wa.me/?text=${msgWa}">Convidar no WhatsApp</a></div>
      ${Rede.ok()
        ? `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px"><span class="chip" id="redeSt">Conectando...</span><button class="b sm" data-act="roster">${ic("list", 'style="width:16px;height:16px"')}Lista de nomes${(s.roster || []).length ? " (" + s.roster.length + ")" : ""}</button></div><p class="sm mut" style="margin:8px 0 0">Os participantes entram pelo QR do telão ou por este link, no celular.</p>`
        : `<p class="sm mut" style="margin:10px 0 0">Para os celulares entrarem, ligue o Firebase em <a href="#/ajustes">Ajustes</a>. Sem isso, ensaie com participantes simulados.</p>`}</section>
    <section class="k"><div class="kh" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">${ic("people", 'style="color:var(--brand-ink)"')}<h3 style="font-size:16px">Participantes</h3><span class="chip">${s.part.length}</span>${respondeu.length || f.etapa === "pergunta" ? `<span class="chip ${respondeu.length === s.part.length && s.part.length ? "ok" : ""}">${respondeu.length} responderam</span>` : ""}</div>
      <div class="pgrid">${s.part.map(p => `<span class="pp ${respondeu.includes(p) ? "ok" : ""}">${avB(p.nome, p.cor, p.b)}${esc(p.nome.split(" ")[0])}${p.real && f.etapa === "espera" ? `<button class="px" data-act="rmpart" data-id="${esc(p.id)}" aria-label="Remover ${esc(p.nome)}">${ic("x", 'style="width:12px;height:12px"')}</button>` : ""}${p.real && f.etapa === "podio" ? `<span class="sm mut" title="${p.ass ? "assinou" : "ainda não assinou"}">${p.ass ? "assinou" : "..."}</span>` : ""}</span>`).join("") || '<span class="sm mut">Ninguém entrou ainda.</span>'}</div>
      <div class="sim" style="margin-top:10px"><label class="opt" style="min-height:40px"><input type="checkbox" data-sim="on" ${s.sim.on ? "checked" : ""}><span>Simular participantes</span></label><label class="sr" for="simn">Quantidade</label><input class="in" id="simn" type="number" min="1" max="24" value="${s.sim.alvo}" data-sim="alvo" style="width:84px"><button class="b sm" data-act="simmais">${ic("plus", 'style="width:16px;height:16px"')}Mais um</button></div></section>
    ${f.etapa === "podio" ? refCard(s) + cmCard(s) : ""}
    ${dist ? `<section class="k"><h3 style="font-size:16px;margin-bottom:8px">Respostas desta pergunta</h3>${dist}</section>` : ""}
    ${s.part.length && s.aj.ranking && f.etapa !== "espera" ? `<section class="k"><h3 style="font-size:16px;margin-bottom:6px">Ranking ao vivo</h3><div class="rk">${c.ranking.slice(0, 5).map((p, k) => `<div class="rr"><b class="num">${k + 1}º</b>${avB(p.nome, p.cor, p.b)}<span>${esc(p.nome)}</span><span class="num">${p.pts}</span></div>`).join("")}</div></section>` : ""}
    <button class="b g bad" data-act="fechar-sala" style="justify-self:start">${ic("x")}Encerrar sala</button></div>
    <aside class="k prev" aria-label="O que a turma vê"><div style="display:flex;align-items:center;gap:8px"><b style="font-family:var(--f-disp)">O que a turma vê</b><span class="grow" style="flex:1"></span><button class="b sm" data-act="telao">${ic("screen", 'style="width:16px;height:16px"')}Abrir em outra tela</button></div>
      <div class="telwrap">${telaoHTML(sn)}</div><span class="sm mut">Esta prévia mostra o mesmo que o telão. Em outra janela ou projetor, use "Abrir em outra tela". No telão: F tela cheia, P modo projetor, A apresentação (espaço avança).</span></aside>`;
  hidratarQR($("#app")); escalar(); tickTempo(); pintaRedeSt(); Rede.garantir(s);
}

/* ---------- eventos da sala ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  const r = rota(), s = r.id ? sala(r.id) : null;
  if (a === "abrirsala") abrirSalaNova();
  else if (a === "voltarsala") { const x = sala(el.dataset.id); if (x) { x.estado === "sala" ? (AO.id = x.id, ir("#/sala/" + x.id)) : abrirSalaDe(x); } }
  else if (a === "proxima" && s) {
    if (s.fase.etapa === "espera" && !s.part.length) return;
    proxima(s);
  }
  else if (a === "entrada" && s) { s.entrada = !s.entrada; mudou(s); }
  else if (a === "simmais" && s) { if (!simAdd(s)) aviso("Todos os nomes de teste já entraram"); else { s.sim.alvo = Math.max(s.sim.alvo, s.part.length); mudou(s); } }
  else if (a === "copiar") { try { navigator.clipboard.writeText(el.dataset.v).then(() => aviso("Link copiado"), () => aviso("Não deu para copiar. Selecione o link e copie.")); } catch(e2) { aviso("Não deu para copiar. Selecione o link e copie."); } }
  else if (a === "telao" && s) {
    const w = window.open(linkTelao(s), "sabia-telao", "popup,width=1280,height=720");
    if (!w) { try { navigator.clipboard.writeText(linkTelao(s)); } catch(e3) {} aviso("O navegador bloqueou a janela. Libere pop-ups ou cole o link do telão (copiado) em outra aba."); }
  }
  else if (a === "fechar-sala" && s) {
    const d = $("#dlg"); d.innerHTML = `<div class="dl"><header><h2>Encerrar a sala?</h2><button class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header><p style="margin:0">${s.part.length ? "O que foi respondido até aqui fica guardado em Encerradas." : "Ninguém entrou, então a sala será apenas fechada."}${s.part.some(p => p.real && !p.ass) && s.fase.etapa === "podio" ? " Quem ainda não assinou a presença não vai conseguir assinar depois." : ""}</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="b" data-act="fechar">Continuar a sessão</button><button class="b p" data-act="encerrar-ok" data-id="${s.id}">Encerrar sala</button></div></div>`; d.showModal();
  }
  else if (a === "encerrar-ok") { const x = sala(el.dataset.id); $("#dlg").open && $("#dlg").close(); if (x) encerrar(x); }
});
document.addEventListener("change", e => {
  const t = e.target; if (!t.dataset.sim) return; const s = sala(rota().id); if (!s) return;
  if (t.dataset.sim === "on") s.sim.on = t.checked; else s.sim.alvo = Math.min(24, Math.max(1, Math.round(Number(t.value)) || 1));
  salvar(); render();
});
