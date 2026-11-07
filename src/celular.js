/* ===== v0.4.0 · celular do participante (#/entrar/CHAVE/BANCO) ===== */
const CE = {chave: null, sg: null, base: null, pid: null, nome: "", cor: 0, pub: null, res: null, ouvPub: null, ouvRes: null, st: "off", visto: false, entrou: false, jaEntrou: false,
  resp: {}, t0: 0, kf: "", sel: null, ord: [], enviando: false, assinou: false, tracos: 0, html: "", erro: "", tela: "", rev: {}, ref: {}, vista: "", rf: null,
  cm: {tipo: "sugestao", texto: "", env: [], erro: ""}, rsp: null, ouvRsp: null};
const chaveLS = k => k + CE.chave;
const gravaLS = (k, o) => { try { localStorage.setItem(chaveLS(k), JSON.stringify(o)); } catch(e) {} };
const lerLS = k => { try { const o = JSON.parse(localStorage.getItem(chaveLS(k)) || "null"); return o && typeof o === "object" ? o : {}; } catch(e) { return {}; } };
const semAcento = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
function pararCel() {
  if (CE.ouvPub) CE.ouvPub.fechar(); if (CE.ouvRes) CE.ouvRes.fechar(); if (CE.ouvRsp) CE.ouvRsp.fechar();
  Object.assign(CE, {cm: {tipo: "sugestao", texto: "", env: [], erro: ""}, rsp: null, ouvRsp: null, chave: null, sg: null, base: null, pid: null, pub: null, res: null, ouvPub: null, ouvRes: null, st: "off", visto: false, entrou: false, jaEntrou: false, resp: {}, kf: "", sel: null, ord: [], enviando: false, assinou: false, tracos: 0, html: "", erro: "", tela: "", rev: {}, ref: {}, vista: "", rf: null});
}
function vCelular(chave, sg) {
  document.body.classList.add("modo-cel"); $("#app").className = "body cel";
  if (chave && CE.chave !== chave) { pararCel(); iniciarCel(chave, sg); }
  else if (!chave && CE.chave) pararCel();
  CE.html = ""; pintaCel();
}
function iniciarCel(chave, sg) {
  CE.chave = chave; CE.sg = sg || null;
  let base = Rede.desseg(sg);
  try { if (!base) base = localStorage.getItem("sabia-db"); } catch(e) {}
  if (!base && Rede.ok()) base = Rede.url();
  if (!base || !Rede.valida(base)) { CE.erro = "semdb"; return; }
  CE.base = base; try { localStorage.setItem("sabia-db", base); } catch(e) {}
  let salvo = null; try { salvo = JSON.parse(localStorage.getItem(chaveLS("sabia-p-")) || "null"); } catch(e) {}
  if (salvo && salvo.pid) { CE.pid = salvo.pid; CE.nome = salvo.nome; CE.cor = salvo.cor || 0; CE.entrou = true; CE.jaEntrou = true; }
  try { CE.assinou = localStorage.getItem(chaveLS("sabia-a-")) === "1"; } catch(e) {}
  CE.rev = lerLS("sabia-rv-"); CE.ref = lerLS("sabia-rf-"); CE.cm.env = Array.isArray(lerLS("sabia-cm-").l) ? lerLS("sabia-cm-").l : [];
  CE.ouvPub = Rede.ouvir(base, "/salas/" + chave + "/pub", M => { CE.pub = M && M.meta ? M : null; CE.visto = true; aoPub(); }, st => { CE.st = st; pintaCel(); });
  if (CE.entrou) {
    Rede.req(base, "GET", "/salas/" + chave + "/part/" + CE.pid).then(v => { if (!v) { CE.entrou = false; CE.jaEntrou = false; try { localStorage.removeItem(chaveLS("sabia-p-")); } catch(e) {} pintaCel(); } }).catch(() => {});
    ligarRes();
  }
}
function ligarRes() {
  if (CE.ouvRes || !CE.pid) return;
  CE.ouvRes = Rede.ouvir(CE.base, "/salas/" + CE.chave + "/res/" + CE.pid, M => { CE.res = M; guardaRev(); pintaCel(); });
  if (!CE.ouvRsp) CE.ouvRsp = Rede.ouvir(CE.base, "/salas/" + CE.chave + "/part/" + CE.pid + "/rsp", M => { CE.rsp = M && typeof M === "object" ? M : null; pintaCel(); });   // respostas do instrutor aos comentários (v0.7.0)
}
function aoPub() {
  const f = CE.pub && CE.pub.fase; if (!f) { pintaCel(); return; }
  const k = f.k + "|" + f.etapa;
  if (k !== CE.kf) {
    CE.kf = k; CE.t0 = Date.now(); CE.sel = null; CE.ord = []; CE.enviando = false; CE.tracos = 0;
    if (f.etapa !== "podio") { CE.vista = ""; CE.rf = null; }
    if (f.etapa === "pergunta" && CE.entrou && CE.resp[f.idx] === undefined) {
      const idx = f.idx;
      Rede.req(CE.base, "GET", "/salas/" + CE.chave + "/resp/" + CE.pid + "/" + idx).then(v => { if (v && v.r !== undefined) { CE.resp[idx] = v.r; pintaCel(); } }).catch(() => {});
    }
    if (f.etapa === "podio" && CE.entrou && !CE.assinou) {
      Rede.req(CE.base, "GET", "/salas/" + CE.chave + "/ass/" + CE.pid).then(v => { if (v) { CE.assinou = true; pintaCel(); } }).catch(() => {});
    }
  }
  guardaRev(); pintaCel();
}

/* guarda no aparelho cada pergunta já revelada, para rever e treinar depois */
function acertaRevPodio() {
  const r = CE.res; if (!CE.entrou || !r || r.i !== -1 || !Array.isArray(r.q)) return;
  const certas = new Set(r.q.map(Number)); let mudou = false;
  Object.keys(CE.rev).forEach(k => { const x = CE.rev[k], ok = certas.has(Number(k)); if (ok && x.ok !== 1) { x.ok = 1; mudou = true; } else if (!ok && x.ok === 1) { x.ok = 0; mudou = true; } });
  if (mudou) gravaLS("sabia-rv-", CE.rev);
}
function guardaRev() {
  acertaRevPodio();
  const f = CE.pub && CE.pub.fase, m = CE.pub && CE.pub.meta; if (!CE.entrou || !f || f.etapa !== "resultado" || !m || m.mom === "pre") return;
  const it = itemCel(); if (!it || it.ensaio) return;
  const r = CE.res && CE.res.i === f.idx ? CE.res : null; if (!r || ![1, 0, -1].includes(r.ok)) return;
  const mine = CE.resp[f.idx], ja = CE.rev[f.idx];
  /* já guardada: só atualiza se o instrutor mudou o resultado (resposta que chegou atrasada e virou acerto) */
  if (ja) { if (ja.ok === r.ok) return; ja.ok = r.ok; if (mine !== undefined) ja.m = typeof mine === "object" ? lista(mine).map(Number) : mine; gravaLS("sabia-rv-", CE.rev); return; }
  CE.rev[f.idx] = {n: f.numPerg, e: it.enunciado, t: it.tipo, a: it.alts, o: it.ordem || null, c: Number.isInteger(it.correta) ? it.correta : null, p: it.porque || "", m: mine === undefined ? null : (typeof mine === "object" ? lista(mine).map(Number) : mine), ok: r.ok};
  gravaLS("sabia-rv-", CE.rev);
}
const errosCel = () => Object.entries(CE.rev).map(([i, x]) => Object.assign({i: Number(i)}, x)).filter(x => x.ok !== 1).sort((a, b) => a.n - b.n);
const refFim = i => { const r = CE.ref[i]; return !!r && (r.ok === 1 || r.t >= 3); };
const certasCel = () => Object.values(CE.rev).filter(x => x.ok === 1).length;
function progCel(f) {
  const tot = f && f.totalPerg; if (!tot || (f.etapa !== "pergunta" && f.etapa !== "resultado")) return "";
  const rv = Object.values(CE.rev), fe = rv.length, ac = certasCel();
  const seg = Array.from({length: tot}, (_, k) => { const n = k + 1, r = rv.find(x => x.n === n); return `<i class="${r ? (r.ok === 1 ? "c" : "e") : n === f.numPerg ? "a" : ""}"></i>`; }).join("");
  return `<div class="prg" role="img" aria-label="Pergunta ${f.numPerg} de ${tot}${fe ? ", " + ac + " de " + fe + " certas até aqui" : ""}">${seg}</div>${fe ? `<div class="prgt"><b>${ac}</b> de ${fe} certa${fe === 1 ? "" : "s"} até aqui</div>` : ""}`;
}

/* ---------- telas ---------- */
const cabCel = (extra = "") => `<header class="ch"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#logo"/></svg><div><b>${esc((CE.pub && CE.pub.meta && CE.pub.meta.titulo) || "Sabiá")}</b><span>${CE.pub && CE.pub.meta && CE.pub.meta.instrutor ? "instrutor " + esc(CE.pub.meta.instrutor) : "Sala " + (CE.chave ? esc(fmtChave(CE.chave)) : "")}</span></div>${extra}</header>`;
const eu = () => `<span class="eu">${avB(CE.nome, CE.cor, CE.bon)}<b>${esc(CE.nome.split(" ")[0])}</b></span>`;
const itemCel = () => { const it = CE.pub && CE.pub.item; return it ? Object.assign({}, it, {alts: lista(it.alts), ordem: it.ordem ? lista(it.ordem).map(Number) : null}) : null; };
function pintaCel() {
  if (rota().v !== "entrar" || !$("#app").classList.contains("cel")) return;
  const a = document.activeElement;
  if (CE.tela === "nome" && a && a.closest && a.closest(".cel") && (a.tagName === "INPUT" || a.tagName === "SELECT")) return;
  if (CE.tela === "podio" && CE.tracos > 0) return;
  if (a && a.id === "cm-t") return;   // não apaga o comentário que a pessoa está escrevendo
  const {tela, html} = montaCel();
  if (html === CE.html && tela === CE.tela) return;
  if (tela !== CE.tela) ouvirParar();
  CE.tela = tela; CE.html = html; $("#app").innerHTML = html; pintaTelaCel();
}
function pintaTelaCel() { tickTempo(); const c = $("#cassin"); if (c) prepararAssinatura(c); }
function montaCel() {
  const m = CE.pub && CE.pub.meta, f = CE.pub && CE.pub.fase;
  if (CE.bonAberto && CE.chave && CE.visto && CE.pub) return {tela: "bicho", html: bonEditorCel()};
  if (!CE.chave) return {tela: "chave", html: `<div class="cc">${cabCel()}<form class="cb" data-form="celchave"><h1>Entrar na sala</h1><p class="mut" style="margin:0">Digite a chave de 6 números que está no telão.</p>
    <div class="fd"><label for="ce-k">Chave da sala</label><input class="in big" id="ce-k" inputmode="numeric" pattern="[0-9 ]*" maxlength="7" autocomplete="off" placeholder="000 000"></div><button class="b p g2" type="submit">Entrar</button></form></div>`};
  if (CE.erro === "semdb") return {tela: "erro", html: `<div class="cc">${cabCel()}<div class="cb"><h1>Use o QR ou o link</h1><p class="mut" style="margin:0">Este aparelho ainda não sabe onde fica a sala. Aponte a câmera para o QR do telão ou abra o link que o instrutor enviou. Nas próximas vezes basta digitar a chave.</p><a class="b" href="#/entrar">Digitar outra chave</a></div></div>`};
  if (!CE.visto) return {tela: "conectando", html: `<div class="cc">${cabCel()}<div class="cb ct"><div class="rodar"></div><h1>${CE.st === "erro" ? "Não consegui conectar" : "Conectando à sala..."}</h1><p class="mut" style="margin:0">${CE.st === "erro" ? "Confira a internet e tente de novo." : "Aguarde um instante."}</p>${CE.st === "erro" ? `<button class="b" data-act="cretry">Tentar de novo</button>` : ""}</div></div>`};
  if (CE.vista && (CE.entrou || CE.jaEntrou) && errosCel().length) return CE.vista === "rever" ? telaRever() : telaRefazer();
  if (!CE.pub) return CE.jaEntrou
    ? {tela: "fim", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>A sala foi encerrada</h1><p class="mut" style="margin:0">Obrigado por participar.</p>${blocoRevisao()}<a class="b" href="#/entrar">Entrar em outra sala</a></div></div>`}
    : {tela: "naoachou", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>Sala não encontrada</h1><p class="mut" style="margin:0">Confira a chave ${esc(fmtChave(CE.chave))} com o instrutor. A sala pode já ter sido encerrada.</p><a class="b p" href="#/entrar">Digitar outra chave</a></div></div>`};
  if (!CE.entrou) {
    if (!m.entrada) return {tela: "fechada", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>Entrada fechada</h1><p class="mut" style="margin:0">O instrutor fechou a entrada desta sala. Fale com ele para entrar.</p></div></div>`};
    const ro = lista(m.roster), se = lista(m.setores);
    return {tela: "nome", html: `<div class="cc">${cabCel()}<form class="cb" data-form="celentrar"><h1>Quem é você?</h1>
      <div class="fd"><label for="ce-n">${ro.length ? "Digite 3 letras do seu nome" : "Seu nome completo"}</label><input class="in big" id="ce-n" autocomplete="off" autocapitalize="words" maxlength="60" value="${esc(CE.nome)}"></div>
      <div id="ce-sug" class="sug" aria-live="polite"></div>
      ${se.length > 1 ? `<div class="fd"><label for="ce-s">Seu setor</label><select class="in" id="ce-s"><option value="">Escolha</option>${se.map(x => `<option>${esc(x)}</option>`).join("")}</select></div>` : ""}
      ${bonEscolhaCel()}
      <p class="erro" id="ce-erro" role="alert">${esc(CE.erro || "")}</p><button class="b p g2" type="submit">Entrar na sala</button></form></div>`};
  }
  const it = itemCel(), t = f.etapa, np = m.nPart || 0;
  const faixa = (txt, tm) => `<div class="fx"><span>${txt}</span>${eu()}</div>${progCel(f)}${tm || ""}`;
  if (t === "espera") return {tela: "espera", html: `<div class="cc">${cabCel()}<div class="cb ct"><div class="ok-i">${ic("check", 'style="width:34px;height:34px"')}</div><h1>Você está na sala</h1><div class="eu2">${avB(CE.nome, CE.cor, bonMeu())}<b>${esc(CE.nome)}</b></div><button type="button" class="b" data-act="cbon">Mudar meu bicho</button><p class="mut" style="margin:0">${np} ${np === 1 ? "pessoa na sala" : "pessoas na sala"}. Aguarde o instrutor iniciar.</p><button class="b g" data-act="cnaosou">Não sou eu</button><button class="b g" data-act="cprox">Outra pessoa vai usar este celular</button></div></div>`};
  if (t === "explicacao") return {tela: "expl", html: `<div class="cc">${cabCel()}<div class="cb">${faixa("Explicação")}<h1>${esc(it ? it.enunciado : "")}</h1>${it && it.texto ? `<p style="margin:0;white-space:pre-line">${esc(it.texto)}</p>` : ""}<p class="mut" style="margin:0">Atenção na explicação do instrutor.</p></div></div>`};
  if (t === "pergunta" && it) {
    const idx = f.idx, resp = CE.resp[idx], tempo = f.dur ? `<div class="pbar"><i data-k="b" data-fim="${CE.t0 + f.dur}" data-dur="${f.dur}"></i></div>` : "";
    const rot = it.ensaio ? "Pergunta de teste" : `Pergunta ${f.numPerg} de ${f.totalPerg}`;
    const exp = f.dur && Date.now() > CE.t0 + f.dur;
    if (resp !== undefined) return {tela: "enviada", html: `<div class="cc">${cabCel()}<div class="cb ct">${faixa(rot)}<div class="ok-i">${ic("check", 'style="width:34px;height:34px"')}</div><h1>Resposta enviada</h1><p class="mut" style="margin:0">Aguarde o resultado no telão.</p></div></div>`};
    if (exp) return {tela: "tempo", html: `<div class="cc">${cabCel()}<div class="cb ct">${faixa(rot)}<h1>Tempo esgotado</h1><p class="mut" style="margin:0">Aguarde o resultado no telão.</p></div></div>`};
    let corpo;
    if (it.tipo === "ordenar") {
      const ord = it.ordem || it.alts.map((_, k) => k), pos = k => CE.ord.indexOf(k);
      corpo = `<div class="ords">${ord.map(k => `<button class="ot ${pos(k) >= 0 ? "on" : ""}" data-act="cord" data-k="${k}" ${pos(k) >= 0 ? "disabled" : ""}><b>${pos(k) >= 0 ? pos(k) + 1 : ""}</b><span>${esc(it.alts[k])}</span></button>`).join("")}</div>
        <div class="bar2"><button class="b" data-act="cordz" ${CE.ord.length ? "" : "disabled"}>Desfazer</button><button class="b p" data-act="cordok" ${CE.ord.length === ord.length && !CE.enviando ? "" : "disabled"}>${CE.enviando ? "Enviando..." : "Enviar ordem"}</button></div><p class="mut sm" style="margin:0">Toque nos passos na ordem certa.</p>`;
    } else {
      corpo = `<div class="tiles">${it.alts.map((a, k) => `<button class="ct2 ${CE.sel === k ? "sel" : ""}" style="background:${COR_ALT[k % 4]}" data-act="cresp" data-k="${k}" ${CE.enviando ? "disabled" : ""}><span class="sh2"><svg viewBox="0 0 24 24" aria-hidden="true">${FORMAS[k % 4]}</svg></span><span>${esc(a)}</span></button>`).join("")}</div>
        ${m.confirmar ? `<button class="b p g2" data-act="cconf" ${CE.sel === null || CE.enviando ? "disabled" : ""}>${CE.enviando ? "Enviando..." : "Confirmar resposta"}</button>` : ""}`;
    }
    return {tela: "pergunta", html: `<div class="cc">${cabCel()}<div class="cb">${faixa(rot, tempo)}<h1 class="q">${esc(it.enunciado)}</h1>${btnOuvir("p")}${corpo}</div></div>`};
  }
  if (t === "resultado" && it) {
    const r = CE.res && CE.res.i === f.idx ? CE.res : null, rank = m.ranking && r && r.pos ? `<p class="rk2">Você está em <b>${r.pos}º</b> de ${r.np}${it.ensaio ? "" : " · " + r.tot + " pontos"}</p>` : "";
    const certa = it.tipo === "ordenar" ? `<ol class="cert">${it.alts.map(a => `<li>${esc(a)}</li>`).join("")}</ol>` : (Number.isInteger(it.correta) ? `<p class="cert"><b>${esc(it.alts[it.correta] || "")}</b></p>` : "");
    const porque = it.porque ? `<p class="por">${esc(it.porque)}</p>` : "";
    let topo2;
    if (!r) topo2 = `<div class="rs"><h1>Resultado</h1><p class="mut" style="margin:0">Calculando...</p></div>`;
    else if (r.ok === 1) topo2 = `<div class="rs ac"><div class="ok-i">${ic("check", 'style="width:34px;height:34px"')}</div><h1>Você acertou</h1>${it.ensaio ? `<p class="mut" style="margin:0">Pergunta de teste, não vale nota.</p>` : `<p class="pts">+${r.pts} pontos</p>`}${rank}</div>`;
    else if (r.ok === 0) topo2 = `<div class="rs er"><div class="ok-i er">${ic("x", 'style="width:34px;height:34px"')}</div><h1>Não foi dessa vez</h1><p class="lbl" style="margin:6px 0 0">A resposta certa</p>${certa}${rank}</div>`;
    else topo2 = `<div class="rs er"><h1>Você não respondeu</h1><p class="lbl" style="margin:6px 0 0">A resposta certa</p>${certa}${rank}</div>`;
    return {tela: "resultado", html: `<div class="cc">${cabCel()}<div class="cb">${faixa(it.ensaio ? "Pergunta de teste" : `Pergunta ${f.numPerg} de ${f.totalPerg}`)}${topo2}${porque}${btnOuvir("r")}<p class="mut sm" style="margin:0">Aguarde a próxima pergunta.</p></div></div>`};
  }
  if (t === "podio") {
    const r = CE.res && CE.res.i === -1 ? CE.res : null;
    const fim = m.mom === "pre" ? `<div class="rs ac"><div class="ok-i">${ic("check", 'style="width:34px;height:34px"')}</div><h1>Pré-teste concluído</h1><p class="mut" style="margin:0">Suas respostas foram registradas. O resultado aparece depois do conteúdo.</p></div>` : r ? `<div class="rs ${r.ok ? "ac" : "er"}"><h1>${r.ac} de ${r.nq} certas</h1><p class="pts ${r.ok ? "" : "w"}">${r.pct}% de acerto</p><span class="chip ${r.ok ? "ok" : "warn"}">${r.ok ? "Meta atingida" : "Abaixo da meta, vai para o reforço"}</span>${m.ranking && r.pos ? `<p class="rk2">Você ficou em <b>${r.pos}º</b> de ${r.np} · ${r.tot} pontos</p>` : ""}</div>` : `<div class="rs"><h1>Fim da sessão</h1><p class="mut" style="margin:0">Calculando seu resultado...</p></div>`;
    const ass = CE.assinou ? `<div class="rs ac"><div class="ok-i">${ic("check", 'style="width:34px;height:34px"')}</div><h1>Presença registrada</h1><p class="mut" style="margin:0">Obrigado por participar.</p></div>`
      : `<div class="as"><label class="lbl" for="cassin">Assine aqui para registrar a presença</label><canvas id="cassin" width="600" height="240" aria-label="Campo de assinatura"></canvas><div class="bar2"><button class="b" data-act="climpar">Limpar</button><button class="b p" data-act="cassinar">Assinar presença</button></div></div>`;
    return {tela: "podio", html: `<div class="cc">${cabCel()}<div class="cb">${faixa("Fim da sessão")}${fim}${m.mom === "pre" ? "" : blocoRevisao()}${ass}${blocoComentario()}<button class="b g2 g" data-act="cprox">Outra pessoa vai usar este celular</button></div></div>`};
  }
  return {tela: "espera2", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>Aguarde</h1></div></div>`};
}


/* ---------- rever o que errei e treinar de novo (v0.6.0) ---------- */
function blocoRevisao() {
  const rv = Object.keys(CE.rev).length; if (!rv) return "";
  const er = errosCel(); if (!er.length) return `<div class="rv"><span class="chip ok">${ic("check", 'style="width:16px;height:16px"')}Você acertou tudo</span></div>`;
  const rec = er.filter(x => (CE.ref[x.i] || {}).ok === 1).length;
  return `<div class="rv"><h2>${er.length} ${er.length === 1 ? "pergunta para rever" : "perguntas para rever"}</h2>
    <div class="rv-b"><button class="b g2" data-act="crever">Rever o que errei</button><button class="b p g2" data-act="crefazer">${rec && rec === er.length ? "Treinar mais uma vez" : "Treinar de novo"}</button></div>
    <p class="mut sm" style="margin:0">${rec ? `Você já recuperou ${rec} de ${er.length}. ` : ""}É só treino: não muda sua nota. Em cada pergunta você tem até 3 tentativas.</p></div>`;
}
const minhaResp = x => {
  if (x.m === null || x.m === undefined) return null;
  if (x.t === "ordenar") return Array.isArray(x.m) ? x.m.map(k => x.a[k]).filter(Boolean) : null;
  return x.a[x.m] !== undefined ? x.a[x.m] : null;
};
const certaTxt = x => x.t === "ordenar" ? `<ol class="cert">${x.a.map(a => `<li>${esc(a)}</li>`).join("")}</ol>` : `<p class="cert"><b>${esc(x.a[x.c] || "")}</b></p>`;
function telaRever() {
  const er = errosCel();
  return {tela: "rever", html: `<div class="cc">${cabCel()}<div class="cb"><div class="fx"><span>Rever o que errei</span>${eu()}</div><h1>${er.length} ${er.length === 1 ? "pergunta" : "perguntas"}</h1>
    ${er.map(x => { const mr = minhaResp(x); return `<section class="rvq"><span class="lbl">Pergunta ${x.n}</span><h2>${esc(x.e)}</h2>
      <p class="lbl" style="margin:8px 0 2px">Você respondeu</p>${mr === null ? `<p class="rvm">Não respondeu</p>` : Array.isArray(mr) ? `<ol class="rvm">${mr.map(a => `<li>${esc(a)}</li>`).join("")}</ol>` : `<p class="rvm">${esc(mr)}</p>`}
      <p class="lbl" style="margin:8px 0 2px">A resposta certa</p>${certaTxt(x)}${x.p ? `<p class="por">${esc(x.p)}</p>` : ""}</section>`; }).join("")}
    <div class="rv-b"><button class="b g2" data-act="cvolta">Voltar</button><button class="b p g2" data-act="crefazer">Treinar de novo</button></div></div></div>`};
}
function proximoRefazer() { return errosCel().find(x => !refFim(x.i)); }
function telaRefazer() {
  const er = errosCel(), feitos = er.filter(x => refFim(x.i)).length, rec = er.filter(x => (CE.ref[x.i] || {}).ok === 1).length;
  CE.rf = CE.rf || {i: null, sel: null, ord: [], fb: null};
  const rf = CE.rf, atual = rf.i !== null && CE.rev[rf.i] ? Object.assign({i: rf.i}, CE.rev[rf.i]) : null;
  const cab = `<div class="fx"><span>Treino · ${Math.min(feitos + (atual && !rf.fb ? 1 : 0), er.length) || 1} de ${er.length}</span>${eu()}</div><div class="prg">${er.map(x => `<i class="${refFim(x.i) ? ((CE.ref[x.i] || {}).ok === 1 ? "c" : "e") : atual && x.i === atual.i ? "a" : ""}"></i>`).join("")}</div>`;
  if (!atual) {
    const prox = proximoRefazer();
    if (prox) { rf.i = prox.i; rf.fb = null; return telaRefazer(); }
    return {tela: "refeito", html: `<div class="cc">${cabCel()}<div class="cb ct"><div class="ok-i ${rec === er.length ? "" : "er"}">${ic(rec === er.length ? "check" : "x", 'style="width:34px;height:34px"')}</div><h1>${rec} de ${er.length} recuperada${rec === 1 ? "" : "s"}</h1><p class="mut" style="margin:0">${rec === er.length ? "Você acertou tudo que tinha errado." : "As que sobraram aparecem em Rever o que errei, com a resposta certa."}</p><div class="rv-b"><button class="b g2" data-act="crever">Rever o que errei</button><button class="b p g2" data-act="cvolta">Concluir</button></div></div></div>`};
  }
  const st = CE.ref[atual.i] || {t: 0, ok: 0}, tent = Math.min(3, st.t + (rf.fb ? 0 : 1));
  if (rf.fb) {
    const fb = rf.fb, ult = !fb.ok && st.t >= 3;
    return {tela: "refazfb", html: `<div class="cc">${cabCel()}<div class="cb">${cab}<h1 class="q">${esc(atual.e)}</h1>
      <div class="rs ${fb.ok ? "ac" : "er"}"><div class="ok-i ${fb.ok ? "" : "er"}">${ic(fb.ok ? "check" : "x", 'style="width:34px;height:34px"')}</div><h1>${fb.ok ? "Agora sim" : ult ? "Não foi dessa vez" : "Ainda não"}</h1>
        <p class="mut" style="margin:6px 0 0">Tentativa ${st.t} de 3</p>${fb.ok || ult ? `<p class="lbl" style="margin:8px 0 0">A resposta certa</p>${certaTxt(atual)}${atual.p ? `<p class="por">${esc(atual.p)}</p>` : ""}` : ""}</div>
      <button class="b p g2" data-act="${fb.ok || ult ? "crprox" : "crtenta"}">${fb.ok || ult ? (proximoRefazer() && proximoRefazer().i !== atual.i ? "Próxima" : "Ver o resultado") : "Tentar de novo"}</button></div></div>`};
  }
  let corpo;
  if (atual.t === "ordenar") {
    const ord = atual.o || atual.a.map((_, k) => k), pos = k => rf.ord.indexOf(k);
    corpo = `<div class="ords">${ord.map(k => `<button class="ot ${pos(k) >= 0 ? "on" : ""}" data-act="crord" data-k="${k}" ${pos(k) >= 0 ? "disabled" : ""}><b>${pos(k) >= 0 ? pos(k) + 1 : ""}</b><span>${esc(atual.a[k])}</span></button>`).join("")}</div>
      <div class="bar2"><button class="b" data-act="crordz" ${rf.ord.length ? "" : "disabled"}>Desfazer</button><button class="b p" data-act="crordok" ${rf.ord.length === ord.length ? "" : "disabled"}>Conferir ordem</button></div><p class="mut sm" style="margin:0">Toque nos passos na ordem certa.</p>`;
  } else corpo = `<div class="tiles">${atual.a.map((a, k) => `<button class="ct2" style="background:${COR_ALT[k % 4]}" data-act="crtoca" data-k="${k}"><span class="sh2"><svg viewBox="0 0 24 24" aria-hidden="true">${FORMAS[k % 4]}</svg></span><span>${esc(a)}</span></button>`).join("")}</div>`;
  return {tela: "refazer", html: `<div class="cc">${cabCel()}<div class="cb">${cab}<p class="mut sm" style="margin:0"><b>Tentativa ${tent} de 3</b> · não vale nota</p><h1 class="q">${esc(atual.e)}</h1>${corpo}<button class="b g" data-act="cvolta">Sair do treino</button></div></div>`};
}
function refazerResp(r) {
  const rf = CE.rf; if (!rf || rf.i === null || rf.fb) return; const x = CE.rev[rf.i]; if (!x) return;
  const st = CE.ref[rf.i] = CE.ref[rf.i] || {t: 0, ok: 0}; if (st.t >= 3 || st.ok === 1) return;
  const ok = x.t === "ordenar" ? (Array.isArray(r) && r.length === x.a.length && r.every((v, k) => v === k)) : r === x.c;
  st.t++; if (ok) st.ok = 1;
  gravaLS("sabia-rf-", CE.ref); enviarRef(rf.i, st);
  rf.fb = {ok}; rf.sel = null; rf.ord = []; CE.html = ""; pintaCel();
}
function enviarRef(i, st) {
  if (!CE.pub || !CE.base || !CE.pid) return;
  /* uma tentativa de cada vez: se duas fossem juntas, a mais antiga poderia chegar depois e apagar a mais nova */
  const corpo = {t: st.t, ok: st.ok === 1 ? 1 : 0}, cam = "/salas/" + CE.chave + "/part/" + CE.pid + "/ref/" + i, base = CE.base;
  CE.filaRef = (CE.filaRef || Promise.resolve()).then(() => Rede.req(base, "PUT", cam, corpo)).catch(() => {});
}

/* ---------- comentário rápido e aparelho compartilhado (v0.7.0) ---------- */
function blocoComentario() {
  const c = CE.cm, rsp = CE.rsp || {}, ja = c.env.length;
  const lista = c.env.map(x => `<div class="cmt-e"><span class="chip br">${esc(TIPO_MSG[x.k] || "")}</span><span>${esc(x.x)}</span>${rsp[x.id] && rsp[x.id].x ? `<p class="cmt-r"><b>Resposta do instrutor:</b> ${esc(rsp[x.id].x)}</p>` : ""}</div>`).join("");
  const form = ja >= 3 ? `<p class="mut sm" style="margin:0">Você já enviou 3 comentários nesta sala.</p>`
    : `<div class="cmt-t" role="group" aria-label="Tipo de comentário">${Object.entries(TIPO_MSG).map(([k, n]) => `<button type="button" data-act="ccmtipo" data-k="${k}" aria-pressed="${c.tipo === k}">${n}</button>`).join("")}</div>
      <label class="sr" for="cm-t">Seu comentário</label><textarea class="in ta" id="cm-t" rows="3" maxlength="300" placeholder="Escreva em poucas palavras">${esc(c.texto)}</textarea>
      <p class="erro" role="alert">${esc(c.erro || "")}</p><button class="b g2" data-act="ccmenv" ${c.enviando ? "disabled" : ""}>${c.enviando ? "Enviando..." : "Enviar comentário"}</button>`;
  return `<div class="cmt"><h2>Deixe um comentário</h2><p class="mut sm" style="margin:0">Elogio, sugestão, reclamação ou pergunta para o instrutor. Vai com o seu nome.</p>${lista}${form}</div>`;
}
async function enviarCom() {
  const c = CE.cm, tx = c.texto.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
  if (!CE.pid || !CE.pub || c.enviando || c.env.length >= 3) return;
  if (tx.length < 3) { c.erro = "Escreva pelo menos 3 letras."; CE.html = ""; pintaCel(); return; }
  const id = uid().replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || String(Date.now());
  c.enviando = true; c.erro = ""; CE.html = ""; pintaCel();
  try { await Rede.req(CE.base, "PUT", "/salas/" + CE.chave + "/part/" + CE.pid + "/com/" + id, {k: c.tipo, x: tx, t: Date.now()}); c.env.push({id, k: c.tipo, x: tx}); c.texto = ""; gravaLS("sabia-cm-", {l: c.env}); }
  catch (e) { c.erro = "Não enviou. Confira a internet e toque de novo."; }
  c.enviando = false; CE.html = ""; pintaCel();
}
/* o mesmo celular passa para outra pessoa: some tudo o que é da pessoa anterior neste aparelho */
function proxPessoaCel() {
  if (CE.ouvRes) CE.ouvRes.fechar(); if (CE.ouvRsp) CE.ouvRsp.fechar();
  ["sabia-p-", "sabia-a-", "sabia-rv-", "sabia-rf-", "sabia-cm-"].forEach(k => { try { localStorage.removeItem(chaveLS(k)); } catch (e) {} });
  try { localStorage.removeItem("sabia-bon"); } catch (e) {} CE.bon = ""; CE.bonAberto = false;   // a próxima pessoa começa com gato ou cachorro sorteado
  Object.assign(CE, {pid: null, nome: "", entrou: false, jaEntrou: false, res: null, rsp: null, ouvRes: null, ouvRsp: null, resp: {}, rev: {}, ref: {}, assinou: false, tracos: 0, vista: "", rf: null, sel: null, ord: [], erro: "", cm: {tipo: "sugestao", texto: "", env: [], erro: ""}, html: ""});
  pintaCel(); scrollTo(0, 0);
}

/* ---------- assinatura ---------- */
function prepararAssinatura(c) {
  const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#0A2C2B";
  let desenhando = false, ult = null;
  const pt = e => { const r = c.getBoundingClientRect(); return {x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height}; };
  c.addEventListener("pointerdown", e => { desenhando = true; ult = pt(e); try { c.setPointerCapture(e.pointerId); } catch(x) {} ctx.beginPath(); ctx.arc(ult.x, ult.y, 2.5, 0, 7); ctx.fillStyle = "#0A2C2B"; ctx.fill(); CE.tracos++; e.preventDefault(); });
  c.addEventListener("pointermove", e => { if (!desenhando) return; const p = pt(e); ctx.beginPath(); ctx.moveTo(ult.x, ult.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ult = p; CE.tracos++; e.preventDefault(); });
  const fim = () => { desenhando = false; };
  c.addEventListener("pointerup", fim); c.addEventListener("pointercancel", fim);
}
async function assinarCel() {
  const c = $("#cassin"); if (!c) return;
  if (CE.tracos < 8) { aviso("Faça a assinatura com o dedo antes de enviar."); return; }
  const o = document.createElement("canvas"); o.width = 300; o.height = 120; const x = o.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, 300, 120); x.drawImage(c, 0, 0, 300, 120);
  const d = o.toDataURL("image/jpeg", 0.6);
  try { await Rede.req(CE.base, "PUT", "/salas/" + CE.chave + "/ass/" + CE.pid, d); }
  catch(e) { if (e.status !== 401 && e.status !== 403) { aviso("Não enviou. Confira a internet e toque de novo."); return; } }
  CE.assinou = true; try { localStorage.setItem(chaveLS("sabia-a-"), "1"); } catch(e) {} CE.tracos = 0; CE.html = ""; pintaCel();
}

/* ---------- ações ---------- */
async function enviarResp(r) {
  const f = CE.pub && CE.pub.fase; if (!f || CE.enviando) return; const idx = f.idx;
  CE.enviando = true; CE.html = ""; pintaCel();
  try { await Rede.req(CE.base, "PUT", "/salas/" + CE.chave + "/resp/" + CE.pid + "/" + idx, {r}); CE.resp[idx] = r; try { navigator.vibrate && navigator.vibrate(30); } catch(e) {} }
  catch(e) { if (e.status === 401 || e.status === 403) CE.resp[idx] = r; else aviso("Não enviou. Confira a internet e toque de novo."); }
  CE.enviando = false; CE.html = ""; pintaCel();
}
async function entrarCel(nome, setor) {
  const m = CE.pub.meta, ro = lista(m.roster);
  nome = limpaNome(nome);
  if (nome.length < 3) { CE.erro = "Digite seu nome."; return; }
  if (ro.length) { const ach = ro.find(x => semAcento(x) === semAcento(nome)); if (!ach) { CE.erro = "Escolha seu nome na lista. Não achou? Fale com o instrutor."; return; } nome = ach; }
  const se = lista(m.setores);
  if (se.length > 1 && !setor && ro.length) { const i = ro.indexOf(nome), auto = i >= 0 ? lista(m.rs)[i] : ""; if (auto && se.includes(auto)) setor = auto; }   // setor vem do cadastro de Pessoas
  if (se.length > 1 && !setor) { CE.erro = "Escolha o seu setor."; return; }
  CE.erro = "";
  let pid = uid();
  try { const todos = await Rede.req(CE.base, "GET", "/salas/" + CE.chave + "/part"); const ex = Object.entries(todos || {}).find(([, v]) => v && semAcento(v.n) === semAcento(nome)); if (ex) pid = ex[0]; } catch(e) {}
  const dados = {n: nome, c: CE.cor, s: setor || "", t: Date.now()};
  try { await Rede.req(CE.base, "PUT", "/salas/" + CE.chave + "/part/" + pid, Object.assign({b: bonMeu()}, dados)); }
  catch(e) {   // regras antigas do Firebase (sem o campo do boneco): entra sem o boneco
    try { await Rede.req(CE.base, "PUT", "/salas/" + CE.chave + "/part/" + pid, dados); }
    catch(e2) { CE.erro = "Não consegui entrar. Confira a internet e tente de novo."; return; }
  }
  Object.assign(CE, {pid, nome, entrou: true, jaEntrou: true, erro: ""});
  try { localStorage.setItem(chaveLS("sabia-p-"), JSON.stringify({pid, nome, cor: CE.cor})); } catch(e) {}
  ligarRes(); CE.html = ""; pintaCel();
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (!["ccor", "cresp", "cconf", "cord", "cordz", "cordok", "cnaosou", "cretry", "cassinar", "climpar", "csug", "crever", "crefazer", "cvolta", "crtoca", "crord", "crordz", "crordok", "crprox", "crtenta", "ccmtipo", "ccmenv", "cprox"].includes(a)) return;
  const k = Number(el.dataset.k);
  if (a === "ccor") { CE.cor = k; const n = $("#ce-n"); if (n) CE.nome = n.value; CE.html = ""; pintaCel(); atualizaSug(); }
  else if (a === "csug") { const i = $("#ce-n"); if (i) { i.value = el.dataset.v; CE.nome = el.dataset.v; atualizaSug(); } }
  else if (a === "cresp") { if (CE.pub.meta.confirmar) { CE.sel = k; CE.html = ""; pintaCel(); } else enviarResp(k); }
  else if (a === "cconf") { if (CE.sel !== null) enviarResp(CE.sel); }
  else if (a === "cord") { if (!CE.ord.includes(k)) { CE.ord.push(k); CE.html = ""; pintaCel(); } }
  else if (a === "cordz") { CE.ord.pop(); CE.html = ""; pintaCel(); }
  else if (a === "cordok") { const n = (itemCel() || {alts: []}).alts.length; if (CE.ord.length === n) enviarResp(CE.ord.slice()); }
  else if (a === "cnaosou") { Rede.req(CE.base, "DELETE", "/salas/" + CE.chave + "/part/" + CE.pid).catch(() => {}); if (CE.ouvRes) CE.ouvRes.fechar(); CE.ouvRes = null; try { localStorage.removeItem(chaveLS("sabia-p-")); } catch(x) {} Object.assign(CE, {entrou: false, jaEntrou: false, pid: null, nome: "", res: null, resp: {}, html: ""}); pintaCel(); }
  else if (a === "cretry") { const c = CE.chave, s = CE.sg; pararCel(); iniciarCel(c, s); CE.html = ""; pintaCel(); }
  else if (a === "crever") { CE.vista = "rever"; CE.html = ""; pintaCel(); scrollTo(0, 0); }
  else if (a === "crefazer") { CE.vista = "refazer"; CE.rf = {i: null, sel: null, ord: [], fb: null}; CE.html = ""; pintaCel(); scrollTo(0, 0); }
  else if (a === "cvolta") { CE.vista = ""; CE.rf = null; CE.html = ""; pintaCel(); }
  else if (a === "crtoca") refazerResp(k);
  else if (a === "crord") { if (CE.rf && !CE.rf.ord.includes(k)) { CE.rf.ord.push(k); CE.html = ""; pintaCel(); } }
  else if (a === "crordz") { if (CE.rf) { CE.rf.ord.pop(); CE.html = ""; pintaCel(); } }
  else if (a === "crordok") { if (CE.rf) refazerResp(CE.rf.ord.slice()); }
  else if (a === "crprox") { if (CE.rf) { CE.rf.i = null; CE.rf.fb = null; CE.html = ""; pintaCel(); } }
  else if (a === "crtenta") { if (CE.rf) { CE.rf.fb = null; CE.html = ""; pintaCel(); } }
  else if (a === "ccmtipo") { CE.cm.tipo = el.dataset.k; CE.html = ""; pintaCel(); }
  else if (a === "ccmenv") enviarCom();
  else if (a === "cprox") proxPessoaCel();
  else if (a === "cassinar") assinarCel();
  else if (a === "climpar") { const c = $("#cassin"); if (c) { const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); CE.tracos = 0; } }
});
function atualizaSug() {
  const el = $("#ce-sug"), i = $("#ce-n"); if (!el || !i || !CE.pub) return;
  const ro = lista(CE.pub.meta.roster), q = semAcento(i.value);
  if (!ro.length || q.length < 3) { el.innerHTML = ""; return; }
  const ach = ro.filter(n => semAcento(n).split(" ").some(p => p.startsWith(q)) || semAcento(n).includes(q)).slice(0, 5);
  el.innerHTML = ach.length ? ach.map(n => `<button type="button" class="sg" data-act="csug" data-v="${esc(n)}">${esc(n)}</button>`).join("") : `<span class="mut sm">Nenhum nome encontrado. Fale com o instrutor.</span>`;
}
document.addEventListener("input", e => { if (e.target.id === "ce-n") { CE.nome = e.target.value; atualizaSug(); } else if (e.target.id === "cm-t") CE.cm.texto = e.target.value; });
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form]"); if (!f) return;
  if (f.dataset.form === "celchave") { e.preventDefault(); const k = $("#ce-k").value.replace(/\D/g, ""); if (k.length === 6) location.hash = "#/entrar/" + k; else aviso("A chave tem 6 números."); }
  else if (f.dataset.form === "celentrar") { e.preventDefault(); const s = $("#ce-s"); entrarCel($("#ce-n").value, s ? s.value : "").then(() => { CE.html = ""; if (CE.erro) { const el = $("#ce-erro"); if (el) el.textContent = CE.erro; } }); }
});
setInterval(() => { if (CE.chave && CE.tela === "pergunta" && CE.pub && CE.pub.fase.dur && Date.now() > CE.t0 + CE.pub.fase.dur && CE.resp[CE.pub.fase.idx] === undefined) { CE.html = ""; pintaCel(); } }, 500);
