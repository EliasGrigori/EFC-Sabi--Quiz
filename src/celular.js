/* ===== v0.4.0 · celular do participante (#/entrar/CHAVE/BANCO) ===== */
const CE = {chave: null, sg: null, base: null, pid: null, nome: "", cor: 0, pub: null, res: null, ouvPub: null, ouvRes: null, st: "off", visto: false, entrou: false, jaEntrou: false,
  resp: {}, t0: 0, kf: "", sel: null, ord: [], enviando: false, assinou: false, tracos: 0, html: "", erro: "", tela: ""};
const chaveLS = k => k + CE.chave;
const semAcento = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
function pararCel() {
  if (CE.ouvPub) CE.ouvPub.fechar(); if (CE.ouvRes) CE.ouvRes.fechar();
  Object.assign(CE, {chave: null, sg: null, base: null, pid: null, pub: null, res: null, ouvPub: null, ouvRes: null, st: "off", visto: false, entrou: false, jaEntrou: false, resp: {}, kf: "", sel: null, ord: [], enviando: false, assinou: false, tracos: 0, html: "", erro: "", tela: ""});
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
  CE.ouvPub = Rede.ouvir(base, "/salas/" + chave + "/pub", M => { CE.pub = M && M.meta ? M : null; CE.visto = true; aoPub(); }, st => { CE.st = st; pintaCel(); });
  if (CE.entrou) {
    Rede.req(base, "GET", "/salas/" + chave + "/part/" + CE.pid).then(v => { if (!v) { CE.entrou = false; CE.jaEntrou = false; try { localStorage.removeItem(chaveLS("sabia-p-")); } catch(e) {} pintaCel(); } }).catch(() => {});
    ligarRes();
  }
}
function ligarRes() {
  if (CE.ouvRes || !CE.pid) return;
  CE.ouvRes = Rede.ouvir(CE.base, "/salas/" + CE.chave + "/res/" + CE.pid, M => { CE.res = M; pintaCel(); });
}
function aoPub() {
  const f = CE.pub && CE.pub.fase; if (!f) { pintaCel(); return; }
  const k = f.k + "|" + f.etapa;
  if (k !== CE.kf) {
    CE.kf = k; CE.t0 = Date.now(); CE.sel = null; CE.ord = []; CE.enviando = false; CE.tracos = 0;
    if (f.etapa === "pergunta" && CE.entrou && CE.resp[f.idx] === undefined) {
      const idx = f.idx;
      Rede.req(CE.base, "GET", "/salas/" + CE.chave + "/resp/" + CE.pid + "/" + idx).then(v => { if (v && v.r !== undefined) { CE.resp[idx] = v.r; pintaCel(); } }).catch(() => {});
    }
    if (f.etapa === "podio" && CE.entrou && !CE.assinou) {
      Rede.req(CE.base, "GET", "/salas/" + CE.chave + "/ass/" + CE.pid).then(v => { if (v) { CE.assinou = true; pintaCel(); } }).catch(() => {});
    }
  }
  pintaCel();
}

/* ---------- telas ---------- */
const cabCel = (extra = "") => `<header class="ch"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#logo"/></svg><div><b>${esc((CE.pub && CE.pub.meta && CE.pub.meta.titulo) || "Sabiá")}</b><span>${CE.pub && CE.pub.meta && CE.pub.meta.instrutor ? "instrutor " + esc(CE.pub.meta.instrutor) : "Sala " + (CE.chave ? esc(fmtChave(CE.chave)) : "")}</span></div>${extra}</header>`;
const eu = () => `<span class="eu">${av(CE.nome, CE.cor)}<b>${esc(CE.nome.split(" ")[0])}</b></span>`;
const itemCel = () => { const it = CE.pub && CE.pub.item; return it ? Object.assign({}, it, {alts: lista(it.alts), ordem: it.ordem ? lista(it.ordem).map(Number) : null}) : null; };
function pintaCel() {
  if (rota().v !== "entrar" || !$("#app").classList.contains("cel")) return;
  const a = document.activeElement;
  if (CE.tela === "nome" && a && a.closest && a.closest(".cel") && (a.tagName === "INPUT" || a.tagName === "SELECT")) return;
  if (CE.tela === "podio" && CE.tracos > 0) return;
  const {tela, html} = montaCel();
  if (html === CE.html && tela === CE.tela) return;
  CE.tela = tela; CE.html = html; $("#app").innerHTML = html; pintaTelaCel();
}
function pintaTelaCel() { tickTempo(); const c = $("#cassin"); if (c) prepararAssinatura(c); }
function montaCel() {
  const m = CE.pub && CE.pub.meta, f = CE.pub && CE.pub.fase;
  if (!CE.chave) return {tela: "chave", html: `<div class="cc">${cabCel()}<form class="cb" data-form="celchave"><h1>Entrar na sala</h1><p class="mut" style="margin:0">Digite a chave de 6 números que está no telão.</p>
    <div class="fd"><label for="ce-k">Chave da sala</label><input class="in big" id="ce-k" inputmode="numeric" pattern="[0-9 ]*" maxlength="7" autocomplete="off" placeholder="000 000"></div><button class="b p g2" type="submit">Entrar</button></form></div>`};
  if (CE.erro === "semdb") return {tela: "erro", html: `<div class="cc">${cabCel()}<div class="cb"><h1>Use o QR ou o link</h1><p class="mut" style="margin:0">Este aparelho ainda não sabe onde fica a sala. Aponte a câmera para o QR do telão ou abra o link que o instrutor enviou. Nas próximas vezes basta digitar a chave.</p><a class="b" href="#/entrar">Digitar outra chave</a></div></div>`};
  if (!CE.visto) return {tela: "conectando", html: `<div class="cc">${cabCel()}<div class="cb ct"><div class="rodar"></div><h1>${CE.st === "erro" ? "Não consegui conectar" : "Conectando à sala..."}</h1><p class="mut" style="margin:0">${CE.st === "erro" ? "Confira a internet e tente de novo." : "Aguarde um instante."}</p>${CE.st === "erro" ? `<button class="b" data-act="cretry">Tentar de novo</button>` : ""}</div></div>`};
  if (!CE.pub) return CE.jaEntrou
    ? {tela: "fim", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>A sala foi encerrada</h1><p class="mut" style="margin:0">Obrigado por participar.</p><a class="b" href="#/entrar">Entrar em outra sala</a></div></div>`}
    : {tela: "naoachou", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>Sala não encontrada</h1><p class="mut" style="margin:0">Confira a chave ${esc(fmtChave(CE.chave))} com o instrutor. A sala pode já ter sido encerrada.</p><a class="b p" href="#/entrar">Digitar outra chave</a></div></div>`};
  if (!CE.entrou) {
    if (!m.entrada) return {tela: "fechada", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>Entrada fechada</h1><p class="mut" style="margin:0">O instrutor fechou a entrada desta sala. Fale com ele para entrar.</p></div></div>`};
    const ro = lista(m.roster), se = lista(m.setores);
    return {tela: "nome", html: `<div class="cc">${cabCel()}<form class="cb" data-form="celentrar"><h1>Quem é você?</h1>
      <div class="fd"><label for="ce-n">${ro.length ? "Digite 3 letras do seu nome" : "Seu nome completo"}</label><input class="in big" id="ce-n" autocomplete="off" autocapitalize="words" maxlength="60" value="${esc(CE.nome)}"></div>
      <div id="ce-sug" class="sug" aria-live="polite"></div>
      ${se.length > 1 ? `<div class="fd"><label for="ce-s">Seu setor</label><select class="in" id="ce-s"><option value="">Escolha</option>${se.map(x => `<option>${esc(x)}</option>`).join("")}</select></div>` : ""}
      <div class="fd"><span class="lbl">Sua cor</span><div class="cores" role="radiogroup" aria-label="Sua cor">${CORES_AV.map((c, k) => `<button type="button" class="co" role="radio" data-act="ccor" data-k="${k}" aria-checked="${CE.cor === k}" aria-label="Cor ${k + 1}" style="background:${c}">${CE.cor === k ? ic("check", 'style="width:20px;height:20px"') : ""}</button>`).join("")}</div></div>
      <p class="erro" id="ce-erro" role="alert">${esc(CE.erro || "")}</p><button class="b p g2" type="submit">Entrar na sala</button></form></div>`};
  }
  const it = itemCel(), t = f.etapa, np = m.nPart || 0;
  const faixa = (txt, tm) => `<div class="fx"><span>${txt}</span>${eu()}</div>${tm || ""}`;
  if (t === "espera") return {tela: "espera", html: `<div class="cc">${cabCel()}<div class="cb ct"><div class="ok-i">${ic("check", 'style="width:34px;height:34px"')}</div><h1>Você está na sala</h1><div class="eu2">${av(CE.nome, CE.cor)}<b>${esc(CE.nome)}</b></div><p class="mut" style="margin:0">${np} ${np === 1 ? "pessoa na sala" : "pessoas na sala"}. Aguarde o instrutor iniciar.</p><button class="b g" data-act="cnaosou">Não sou eu</button></div></div>`};
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
    return {tela: "pergunta", html: `<div class="cc">${cabCel()}<div class="cb">${faixa(rot, tempo)}<h1 class="q">${esc(it.enunciado)}</h1>${corpo}</div></div>`};
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
    return {tela: "resultado", html: `<div class="cc">${cabCel()}<div class="cb">${faixa(it.ensaio ? "Pergunta de teste" : `Pergunta ${f.numPerg} de ${f.totalPerg}`)}${topo2}${porque}<p class="mut sm" style="margin:0">Aguarde a próxima pergunta.</p></div></div>`};
  }
  if (t === "podio") {
    const r = CE.res && CE.res.i === -1 ? CE.res : null;
    const fim = r ? `<div class="rs ${r.ok ? "ac" : "er"}"><h1>${r.ac} de ${r.nq} certas</h1><p class="pts ${r.ok ? "" : "w"}">${r.pct}% de acerto</p><span class="chip ${r.ok ? "ok" : "warn"}">${r.ok ? "Meta atingida" : "Abaixo da meta, vai para o reforço"}</span>${m.ranking && r.pos ? `<p class="rk2">Você ficou em <b>${r.pos}º</b> de ${r.np} · ${r.tot} pontos</p>` : ""}</div>` : `<div class="rs"><h1>Fim da sessão</h1><p class="mut" style="margin:0">Calculando seu resultado...</p></div>`;
    const ass = CE.assinou ? `<div class="rs ac"><div class="ok-i">${ic("check", 'style="width:34px;height:34px"')}</div><h1>Presença registrada</h1><p class="mut" style="margin:0">Obrigado por participar.</p></div>`
      : `<div class="as"><label class="lbl" for="cassin">Assine aqui para registrar a presença</label><canvas id="cassin" width="600" height="240" aria-label="Campo de assinatura"></canvas><div class="bar2"><button class="b" data-act="climpar">Limpar</button><button class="b p" data-act="cassinar">Assinar presença</button></div></div>`;
    return {tela: "podio", html: `<div class="cc">${cabCel()}<div class="cb">${faixa("Fim da sessão")}${fim}${ass}</div></div>`};
  }
  return {tela: "espera2", html: `<div class="cc">${cabCel()}<div class="cb ct"><h1>Aguarde</h1></div></div>`};
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
  const se = lista(m.setores); if (se.length > 1 && !setor) { CE.erro = "Escolha o seu setor."; return; }
  CE.erro = "";
  let pid = uid();
  try { const todos = await Rede.req(CE.base, "GET", "/salas/" + CE.chave + "/part"); const ex = Object.entries(todos || {}).find(([, v]) => v && semAcento(v.n) === semAcento(nome)); if (ex) pid = ex[0]; } catch(e) {}
  try { await Rede.req(CE.base, "PUT", "/salas/" + CE.chave + "/part/" + pid, {n: nome, c: CE.cor, s: setor || "", t: Date.now()}); }
  catch(e) { CE.erro = "Não consegui entrar. Confira a internet e tente de novo."; return; }
  Object.assign(CE, {pid, nome, entrou: true, jaEntrou: true, erro: ""});
  try { localStorage.setItem(chaveLS("sabia-p-"), JSON.stringify({pid, nome, cor: CE.cor})); } catch(e) {}
  ligarRes(); CE.html = ""; pintaCel();
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (!["ccor", "cresp", "cconf", "cord", "cordz", "cordok", "cnaosou", "cretry", "cassinar", "climpar", "csug"].includes(a)) return;
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
document.addEventListener("input", e => { if (e.target.id === "ce-n") { CE.nome = e.target.value; atualizaSug(); } });
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form]"); if (!f) return;
  if (f.dataset.form === "celchave") { e.preventDefault(); const k = $("#ce-k").value.replace(/\D/g, ""); if (k.length === 6) location.hash = "#/entrar/" + k; else aviso("A chave tem 6 números."); }
  else if (f.dataset.form === "celentrar") { e.preventDefault(); const s = $("#ce-s"); entrarCel($("#ce-n").value, s ? s.value : "").then(() => { CE.html = ""; if (CE.erro) { const el = $("#ce-erro"); if (el) el.textContent = CE.erro; } }); }
});
setInterval(() => { if (CE.chave && CE.tela === "pergunta" && CE.pub && CE.pub.fase.dur && Date.now() > CE.t0 + CE.pub.fase.dur && CE.resp[CE.pub.fase.idx] === undefined) { CE.html = ""; pintaCel(); } }, 500);
