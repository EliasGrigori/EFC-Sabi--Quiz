/* ===== v0.8.0 · perfis, conta do EFClaudian, porta de entrada, Ajustes completo, observações (classes int-, aj-, obs-) =====
   A configuração do Firebase do EFClaudian NUNCA fica no código nem nas pastas do projeto: a pessoa cola uma vez neste aparelho
   e ela é guardada só no localStorage dele (chave sabia-efc-cfg), fora dos dados exportáveis. */
const PERFIS = {primario: "Primário", estrela: "Líder estrela", colaborador: "Colaborador"};
const LS_ICFG = "sabia-efc-cfg", LS_ICONTA = "sabia-efc-conta", LS_ATIV = "sabia-ativado", LS_SAIU = "sabia-efc-saiu";
const FB_SDK = "https://www.gstatic.com/firebasejs/10.12.0/";
const lsG = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsS = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };
const lsJ = k => { try { return JSON.parse(lsG(k)); } catch (e) { return null; } };

const INT = {estado: "off", erro: "", user: null, conta: lsJ(LS_ICONTA), p: null, ocup: false, msg: "", demo: false, db: null, auth: null};
try { INT.demo = new URLSearchParams(location.search).get("demo") === "1"; } catch (e) {}
const intSaiu = () => lsG(LS_SAIU) === "1";
const intCfg = () => { const c = lsJ(LS_ICFG); return c && c.apiKey && c.projectId ? c : null; };
const intSlug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");

/* ---------- perfil e permissões ---------- */
function contaAtiva() { return !!(INT.conta && !intSaiu()); }
function perfilAtual() { const p = contaAtiva() ? INT.conta.perfil : (S && S.cfg && S.cfg.perfil); return PERFIS[p] ? p : "primario"; }
const podeGerir = () => perfilAtual() !== "colaborador";
const podeObs = () => podeGerir();
const ROTAS_COL = ["inicio", "treinos", "relatorios", "conferir", "ajustes", "mais", "entrar"];
const rotaOk = v => podeGerir() || ROTAS_COL.includes(v);
const navOk = id => rotaOk(id);
const ACOES_GERIR = ["novo", "dlg", "usarmodelo", "excluir", "duplicar", "impor", "preparar", "apagartudo", "apagarok", "obsadd", "obsdel"];

/* ---------- ativação do aparelho ---------- */
const ativado = () => lsG(LS_ATIV) === "1" || contaAtiva();
function ativar() { lsS(LS_ATIV, "1"); }
const portaFechada = v => !!(S && S.cfg.porta) && !ativado() && !INT.demo && v !== "entrar";
function linkAtivar() { return location.origin + location.pathname + "?ativar=1"; }
(function () { try { if (new URLSearchParams(location.search).get("ativar") === "1") { ativar(); history.replaceState(null, "", location.pathname + location.hash); } } catch (e) {} })();

/* ---------- nuvem do EFClaudian (SDK carregado só quando há configuração) ---------- */
function intScript(src) { return new Promise((ok, no) => { const sc = document.createElement("script"); sc.src = src; sc.onload = ok; sc.onerror = () => no(new Error("sem internet")); document.head.appendChild(sc); }); }
async function intSdk() {
  if (window.firebase && firebase.auth && firebase.firestore) return;
  for (const f of ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js", "firebase-app-check-compat.js"]) await intScript(FB_SDK + f);
}
function intIniciar() {
  if (INT.p) return INT.p;
  const cfg = intCfg(); if (!cfg) return Promise.reject(new Error("sem configuração"));
  if (navigator.onLine === false && !(window.firebase && firebase.__falso)) { INT.estado = "offline"; return Promise.reject(new Error("sem internet")); }
  INT.estado = "carregando";
  INT.p = (async () => {
    await intSdk();
    const fbc = {apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId, appId: cfg.appId};
    if (!firebase.apps.length) firebase.initializeApp(fbc);
    try { if (cfg.appCheck && firebase.appCheck && firebase.appCheck.ReCaptchaEnterpriseProvider) firebase.appCheck().activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(cfg.appCheck), true); } catch (e) {}
    INT.auth = firebase.auth(); INT.db = firebase.firestore();
    await new Promise(ok => { const u = INT.auth.onAuthStateChanged(() => { u(); ok(); }); });
    INT.estado = "pronto";
    INT.auth.onAuthStateChanged(u => intAuthMudou(u));
    await intAuthMudou(INT.auth.currentUser);
  })().catch(e => { INT.estado = navigator.onLine === false ? "offline" : "erro"; INT.erro = e && (e.code || e.message) || "erro"; INT.p = null; throw e; });
  return INT.p;
}
async function intAuthMudou(u) {
  INT.user = u || null;
  if (!u || u.isAnonymous || intSaiu()) { if (INT.conta && (!u || u.isAnonymous)) { INT.conta = null; lsS(LS_ICONTA, null); } intRender(); return; }
  try {
    const d = await INT.db.collection("sv2_users").doc(u.uid).get(), x = d.exists ? d.data() : null;
    if (x && x.bloqueado !== true) {
      const raw = String(x.perfil || "");
      INT.conta = {uid: u.uid, nome: x.nome || x.login || "Responsável", perfil: /^principal/.test(raw) ? "primario" : x.estrela === true ? "estrela" : "colaborador"};
      lsS(LS_ICONTA, JSON.stringify(INT.conta)); ativar();
    } else { INT.conta = null; lsS(LS_ICONTA, null); }
  } catch (e) { /* sem rede ou sem permissão: mantém a última conta conhecida */ }
  intRender();
}
async function intEntrar(login, senha) {
  await intIniciar();
  const ent = String(login || "").trim(); let cands = [];
  if (ent.includes("@")) cands = [ent.toLowerCase()];
  else {
    try { const d = await INT.db.collection("sv2_login").doc(intSlug(ent)).get(); if (d.exists) { const x = d.data(); [x.email, x.emailNovo, x.interno].forEach(e => { if (e && !cands.includes(e)) cands.push(e); }); } } catch (e) {}
    if (!cands.length) cands = [intSlug(ent) + "@efclaudian.app"];
  }
  let ult = null;
  for (const e of cands) { try { await INT.auth.signInWithEmailAndPassword(e, senha); ult = null; break; } catch (er) { ult = er; } }
  if (ult) throw ult;
  lsS(LS_SAIU, null);
  await intAuthMudou(INT.auth.currentUser);
  if (!contaAtiva()) throw Object.assign(new Error("sem perfil"), {code: "sabia/sem-perfil"});
}
function intErroTexto(e) {
  const c = e && (e.code || e.message) || "";
  if (/invalid-credential|wrong-password|user-not-found|invalid-login|invalid-email/.test(c)) return "Login ou senha não conferem.";
  if (/sem-perfil/.test(c)) return "Esta conta não tem cadastro ativo no EFClaudian.";
  if (/network|sem internet|unavailable/.test(c)) return "Sem internet. Tente de novo quando a conexão voltar.";
  if (/too-many/.test(c)) return "Muitas tentativas. Espere alguns minutos.";
  if (/permission/.test(c)) return "A nuvem recusou o acesso. Confira as regras do Firebase do EFClaudian.";
  if (/sem configura/.test(c)) return "Cole antes a configuração do Firebase do EFClaudian.";
  return "Não foi possível falar com a nuvem (" + c + ").";
}
function intRender() {
  const foco = document.activeElement;
  if (foco && /^(INPUT|TEXTAREA)$/.test(foco.tagName) && foco.closest("#app")) return;
  render();
}
function intArrancar() { if (intCfg() && !intSaiu()) intIniciar().catch(() => {}); }
function lerConfigTexto(txt) {
  const g = k => { const m = String(txt).match(new RegExp("[\"']?" + k + "[\"']?\\s*[:=]\\s*[\"']([^\"']+)[\"']")); return m ? m[1].trim() : ""; };
  const o = {apiKey: g("apiKey"), authDomain: g("authDomain"), projectId: g("projectId"), appId: g("appId"), appCheck: g("appCheck") || g("appCheckKey") || g("recaptchaKey")};
  return o.apiKey && o.projectId ? o : null;
}

/* ---------- porta de entrada ---------- */
function vPorta() {
  document.body.classList.add("modo-porta"); $("#app").className = "body";
  const cfg = intCfg();
  $("#app").innerHTML = `<div class="int-porta"><div class="k int-pc">
    <div class="int-lg" aria-hidden="true"><svg viewBox="0 0 48 48"><use href="#logo"/></svg></div>
    <h1>Este aparelho ainda não foi ativado</h1>
    <p class="sm mut">O Sabiá abre aqui só depois de ativado pelo menu do EFClaudian, ou com a conta de um responsável. Quem vai responder o treinamento entra pelo celular, com a chave da sala, sem conta.</p>
    ${cfg ? `<form data-form="intlogin" class="int-f" aria-label="Entrar com a conta do EFClaudian">
      <div class="fd"><label for="int-lg">Login ou e-mail</label><input class="in" id="int-lg" autocomplete="username" autocapitalize="none" required></div>
      <div class="fd"><label for="int-sn">Senha</label><input class="in" id="int-sn" type="password" autocomplete="current-password" required></div>
      <p class="sm int-er" id="int-er" role="alert">${esc(INT.msg)}</p>
      <button class="b p" type="submit" ${INT.ocup ? "disabled" : ""}>${ic("shield")}Entrar com a conta do EFClaudian</button></form>`
    : `<form data-form="intcfg" class="int-f"><div class="fd"><label for="int-cfg">Configuração do Firebase do EFClaudian</label><textarea class="in" id="int-cfg" rows="4" placeholder="apiKey, authDomain, projectId, appId" required></textarea></div>
      <p class="sm mut">Cole uma vez. Fica só neste aparelho.</p><p class="sm int-er" id="int-er" role="alert">${esc(INT.msg)}</p>
      <button class="b p" type="submit">${ic("check")}Guardar e continuar</button></form>`}
    <a class="b" href="?demo=1">Ver a demonstração</a></div></div>`;
}

/* ---------- observações do treinamento ---------- */
function obsHtml(t) {
  const l = t.obs || [], pode = podeObs();
  return `<div class="lbl" style="padding:0 4px">Observações do treinamento</div>
  ${pode ? `<form class="obs-f" data-form="obsadd" aria-label="Nova observação"><label class="sr" for="obs-t">Nova observação</label><input class="in" id="obs-t" maxlength="300" placeholder="Anote algo sobre este treinamento"><button class="b s" type="submit">${ic("plus")}Anotar</button></form>` : ""}
  <div class="obs-l">${l.length ? l.slice().reverse().map(o => `<div class="obs-i"><div><span>${esc(o.txt)}</span><span class="sm mut">${esc(o.por || "")} · ${new Date(o.em).toLocaleDateString("pt-BR")}</span></div>${pode ? `<button class="b ic g bad" data-act="obsdel" data-id="${esc(o.id)}" aria-label="Excluir observação" title="Excluir">${ic("trash")}</button>` : ""}</div>`).join("") : `<span class="sm mut" style="padding:0 4px">Nenhuma observação.</span>`}</div>`;
}

/* ---------- blocos do Ajustes ---------- */
function ajPerfil() {
  const conta = contaAtiva(), cfg = intCfg();
  return `<section class="k" id="aj-perfil"><h3>Perfil e conta</h3>
    ${conta ? `<div class="int-conta"><span class="chip ok">Conectado</span><b>${esc(INT.conta.nome)}</b><span class="sm mut">${PERFIS[INT.conta.perfil]} · conta do EFClaudian</span></div>
      <div class="int-ac"><button class="b sm" data-act="intsair">Sair só do Sabiá</button><button class="b sm" data-act="intsairtudo">Sair de tudo</button></div>
      <p class="sm mut" style="margin:10px 0 0">O perfil vem da conta. Para mudar, altere o cadastro no EFClaudian.</p>`
    : `<div class="fd"><label for="aj-pf">Perfil neste aparelho</label><select class="in" id="aj-pf" data-act-change="perfil">${Object.entries(PERFIS).map(([k, n]) => `<option value="${k}" ${perfilAtual() === k ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      <p class="sm mut" style="margin:10px 0 0">Primário e Líder estrela criam, editam e aplicam. Colaborador só consulta treinamentos e relatórios. ${cfg ? "Entre com a conta do EFClaudian, na seção Integração, para o perfil vir da conta." : ""}</p>
      ${intSaiu() && INT.user && !INT.user.isAnonymous ? `<div class="int-ac"><span class="chip">Fora do Sabiá</span><button class="b sm" data-act="intvoltar">Voltar a usar a conta conectada</button></div>` : ""}`}
  </section>`;
}
function ajTelao() {
  const seg = (campo, lista) => `<div class="seg" role="group" style="display:flex">${lista.map(([k, n]) => `<button style="flex:1" data-act="padrao" data-c="${campo}" data-v="${k}" aria-pressed="${(S.cfg[campo] || lista[0][0]) === k}">${n}</button>`).join("")}</div>`;
  return `<section class="k" id="aj-telao"><h3>Telão e sala</h3>
    <div class="fd"><span class="lbl">Telão ao aplicar</span>${seg("telaoPadrao", [["escuro", "Escuro"], ["claro", "Claro"]])}</div>
    <div class="fd" style="margin-top:10px"><span class="lbl">Som ao aplicar</span>${seg("somPadrao", [["ligado", "Ligado"], ["desligado", "Desligado"]])}</div>
    <p class="sm mut" style="margin:10px 0 0">Vale como ponto de partida em cada nova sessão. Em Aplicar você ainda pode mudar.</p></section>`;
}
function ajDemo() {
  const nt = S.sessoes.filter(s => s.aj && s.aj.teste).length, tem = MODELOS.every(m => S.treinamentos.some(t => t.titulo === m.titulo));
  return `<section class="k" id="aj-demo"><h3>Demonstração</h3>
    <p class="sm mut" style="margin:0 0 10px">Treinamentos de exemplo para mostrar o Sabiá, e sessões de teste, que ficam fora do registro oficial. Abrir o endereço com <b>?demo=1</b> faz o mesmo.</p>
    <div class="int-ac"><button class="b sm" data-act="democarregar" ${tem ? "disabled" : ""}>${ic("book")}Carregar exemplos</button><button class="b sm bad" data-act="demolimpar" ${nt ? "" : "disabled"}>${ic("trash")}Apagar ${nt} ${nt === 1 ? "sessão de teste" : "sessões de teste"}</button></div></section>`;
}
function ajIntegra() {
  const cfg = intCfg(), est = INT.estado, rot = contaAtiva() ? "ok" : "";
  return `<section class="k" id="aj-integra" style="grid-column:1/-1"><h3>Integração com o EFClaudian</h3>
    <div class="int-st"><span class="chip ${contaAtiva() ? "ok" : cfg ? "" : "warn"}" role="status">${contaAtiva() ? "Conta conectada: " + esc(INT.conta.nome) : cfg ? "Configurado · projeto " + esc(cfg.projectId) : "Sem configuração"}</span>${est === "erro" ? `<span class="chip warn">Nuvem indisponível</span>` : est === "offline" ? `<span class="chip">Sem internet</span>` : ""}</div>
    <div class="int-g">
      <div><h4>Configuração do Firebase</h4>
        ${cfg ? `<p class="sm mut">A configuração está guardada só neste aparelho e não entra nos arquivos exportados.</p><button class="b sm bad" data-act="intcfgrem">${ic("trash")}Remover configuração</button>`
        : `<form data-form="intcfg"><div class="fd"><label for="int-cfg">Cole a configuração do Firebase do EFClaudian</label><textarea class="in" id="int-cfg" rows="4" placeholder="apiKey, authDomain, projectId, appId (e a chave do App Check, se houver)"></textarea></div><p class="sm int-er" id="int-er" role="alert">${esc(INT.msg)}</p><button class="b s" type="submit">${ic("check")}Guardar neste aparelho</button></form>`}</div>
      <div><h4>Conta do responsável</h4>
        ${contaAtiva() ? `<p class="sm mut">${esc(INT.conta.nome)} · ${PERFIS[INT.conta.perfil]}</p>` : cfg ? `<form data-form="intlogin"><div class="fd"><label for="int-lg2">Login ou e-mail</label><input class="in" id="int-lg2" autocomplete="username" autocapitalize="none" required></div><div class="fd" style="margin-top:8px"><label for="int-sn2">Senha</label><input class="in" id="int-sn2" type="password" autocomplete="current-password" required></div><p class="sm int-er" id="int-er2" role="alert">${esc(INT.msg)}</p><button class="b s" type="submit" ${INT.ocup ? "disabled" : ""}>${ic("shield")}Entrar</button></form>` : `<p class="sm mut">Guarde a configuração para entrar.</p>`}</div>
      <div><h4>Porta de entrada</h4>
        <div class="seg" role="group" aria-label="Porta de entrada" style="display:flex"><button style="flex:1" data-act="porta" data-v="0" aria-pressed="${!S.cfg.porta}">Desligada</button><button style="flex:1" data-act="porta" data-v="1" aria-pressed="${!!S.cfg.porta}">Ligada</button></div>
        <p class="sm mut" style="margin:8px 0 6px">Ligada: o Sabiá só abre em aparelhos ativados pelo EFClaudian ou por conta de responsável. Os participantes entram pelo celular sem conta. É uma trava de uso, não um sistema de segurança.</p>
        <div class="int-ac"><button class="b sm" data-act="ativarcopiar">${ic("copy", 'style="width:16px;height:16px"')}Copiar link de ativação</button></div></div>
    </div>
    <p class="sm mut" style="margin:12px 0 0">Para o EFClaudian conversar com o Sabiá, a página expõe <b>EFC_API</b> com versao(), perfil(), conta() e abrir(rota).</p></section>`;
}
function ajObs() {
  return `<section class="k" id="aj-obs"><h3>Observações</h3><div class="fd"><label for="c-obs">Anotações suas sobre o uso do app</label><textarea class="in" id="c-obs" data-c="obs" rows="4" maxlength="1000" placeholder="Fica só neste aparelho">${esc(S.cfg.obs || "")}</textarea></div></section>`;
}
const AJ_IND = [["aj-ident", "Identificação"], ["aj-perfil", "Perfil e conta"], ["aj-aparencia", "Aparência"], ["aj-telao", "Telão e sala"], ["aj-demo", "Demonstração"], ["aj-setores", "Setores e pessoas"], ["aj-nuvem", "Celulares"], ["aj-armaz", "Armazenamento"], ["aj-integra", "Integração"], ["aj-obs", "Observações"]];
const ajIndice = () => `<nav class="aj-ind k" aria-label="Seções dos Ajustes" style="grid-column:1/-1">${AJ_IND.map(([id, n]) => `<button class="sc" data-act="ajir" data-v="${id}">${n}</button>`).join("")}</nav>`;

/* ---------- ganchos do render ---------- */
function intPosRender() {
  const r = rota();
  document.body.classList.toggle("perfil-col", !podeGerir());
  document.body.classList.toggle("int-demo", !!(S.cfg.porta && !ativado() && INT.demo));
  AJ_PADRAO.telao = S.cfg.telaoPadrao || "escuro"; AJ_PADRAO.som = S.cfg.somPadrao || "ligado";
  AJ_PADRAO.teste = !!(S.cfg.porta && !ativado() && INT.demo);
}
function intAntesRender(v) {   // devolve true se já tratou a tela
  document.body.classList.remove("modo-porta");
  if (portaFechada(v)) { vPorta(); return true; }
  if (!rotaOk(v)) { aviso("O perfil Colaborador não abre esta tela."); location.replace("#/inicio"); return true; }
  return false;
}
window.EFC_API = {
  versao: () => VERSAO, perfil: () => perfilAtual(), conta: () => contaAtiva() ? {nome: INT.conta.nome, perfil: INT.conta.perfil} : null,
  abrir: h => { if (typeof h === "string" && /^#\/[a-z]/.test(h)) ir(h); }
};

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  if (!podeGerir()) { const g = e.target.closest("[data-act]"); if (g && ACOES_GERIR.includes(g.dataset.act)) { e.stopPropagation(); e.preventDefault(); aviso("O perfil Colaborador só consulta."); return; } }
}, true);
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act, v = el.dataset.v, id = el.dataset.id;
  if (a === "ajir") { const s = document.getElementById(v); if (s) { s.scrollIntoView({behavior: "smooth", block: "start"}); s.setAttribute("tabindex", "-1"); s.focus({preventScroll: true}); } }
  else if (a === "padrao") { S.cfg[el.dataset.c] = v; salvar(); intPosRender(); render(); }
  else if (a === "porta") { S.cfg.porta = v === "1"; if (S.cfg.porta) ativar(); salvar(); render(); aviso(S.cfg.porta ? "Porta ligada. Este aparelho já está ativado." : "Porta desligada."); }
  else if (a === "ativarcopiar") { const t = linkAtivar(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => aviso("Link copiado"), () => aviso("Link: " + t)); }
  else if (a === "intcfgrem") { lsS(LS_ICFG, null); lsS(LS_ICONTA, null); lsS(LS_SAIU, null); INT.conta = null; INT.p = null; INT.estado = "off"; INT.msg = ""; render(); aviso("Configuração removida"); }
  else if (a === "intsair") { lsS(LS_SAIU, "1"); render(); aviso("Você saiu só do Sabiá. O EFClaudian continua conectado."); }
  else if (a === "intsairtudo") { lsS(LS_SAIU, null); lsS(LS_ICONTA, null); INT.conta = null; (INT.auth ? INT.auth.signOut() : Promise.resolve()).catch(() => {}).then(() => render()); }
  else if (a === "intvoltar") { lsS(LS_SAIU, null); intAuthMudou(INT.user); }
  else if (a === "democarregar") { MODELOS.forEach(m => { if (!S.treinamentos.some(t => t.titulo === m.titulo)) criarDeModelo(m); }); salvar(); render(); aviso("Exemplos carregados"); }
  else if (a === "demolimpar") { const ant = S.sessoes.slice(); S.sessoes = S.sessoes.filter(s => !(s.aj && s.aj.teste)); salvar(); render(); aviso("Sessões de teste apagadas", "Desfazer", () => { S.sessoes = ant; salvar(); render(); }); }
  else if (a === "obsdel" && UI.ed) { const t = treino(UI.ed.id); if (t && podeObs()) { const ant = (t.obs || []).slice(); t.obs = ant.filter(o => o.id !== id); salvar(); pintaObs(); aviso("Observação excluída", "Desfazer", () => { t.obs = ant; salvar(); pintaObs(); }); } }
});
function pintaObs() { const b = $("#obs-box"), t = UI.ed && treino(UI.ed.id); if (b && t) b.innerHTML = obsHtml(t); }
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-form]"); if (!f) return; const k = f.dataset.form;
  if (k === "intcfg") { e.preventDefault(); const c = lerConfigTexto(($("#int-cfg") || {}).value || ""); if (!c) { INT.msg = "Não achei apiKey e projectId no texto colado."; const er = $("#int-er"); if (er) er.textContent = INT.msg; return; } lsS(LS_ICFG, JSON.stringify(c)); INT.msg = ""; INT.p = null; render(); intArrancar(); aviso("Configuração guardada neste aparelho"); }
  else if (k === "intlogin") {
    e.preventDefault(); if (INT.ocup) return;
    const lg = ($("#int-lg") || $("#int-lg2") || {}).value, sn = ($("#int-sn") || $("#int-sn2") || {}).value;
    INT.ocup = true; INT.msg = "";
    try { await intEntrar(lg, sn); INT.msg = ""; INT.ocup = false; render(); aviso("Conectado como " + INT.conta.nome); }
    catch (er) { INT.ocup = false; INT.msg = intErroTexto(er); render(); }
  }
  else if (k === "obsadd") { e.preventDefault(); const t = UI.ed && treino(UI.ed.id), i = $("#obs-t"); if (!t || !podeObs() || !i) return; const tx = i.value.trim(); if (!tx) return; (t.obs = t.obs || []).push({id: uid(), txt: tx.slice(0, 300), por: (contaAtiva() ? INT.conta.nome : S.cfg.instrutor) || PERFIS[perfilAtual()], em: Date.now()}); salvar(); pintaObs(); }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "aj-pf") { S.cfg.perfil = t.value; salvar(); intPosRender(); render(); aviso("Perfil: " + PERFIS[perfilAtual()]); }
});
