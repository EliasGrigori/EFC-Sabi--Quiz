/* ===== v1.0.0 · acabamento: carimbo de tempo, banco de perguntas, criar com IA, voz e ouvir a pergunta ===== */
/* Compartilha o escopo com o resto do app. Prefixos novos: bn- (banco), ia- (criar com IA), vz- (voz), selo. */

/* ---------- carimbo de tempo do servidor ---------- */
const dhms = ms => { try { return new Date(ms).toLocaleString("pt-BR", {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"}); } catch (e) { return ""; } };
const segTxt = ms => { const s = Math.round(ms / 100) / 10; return (s > 0 ? "+" : s < 0 ? "−" : "") + Math.abs(s).toLocaleString("pt-BR") + " s"; };
const SELO_AVISO = "É o horário do servidor do Firebase do seu próprio projeto, gravado uma única vez. Não é carimbo de uma autoridade certificadora (como a ICP-Brasil).";
const SELO = {ocup: false, msg: "", cons: null, consOcup: false};
const MSG_REGRAS = "O Firebase não aceitou o carimbo. Publique as regras novas (Ajustes > Celulares na sala > Copiar as regras) e tente de novo.";
const codValido = c => /^SAB-[0-9A-F]{4}(-[0-9A-F]{4}){4}$/.test(c);
async function lerSelo(cod) {
  const v = await Rede.req(Rede.url(), "GET", "/selos/" + cod);
  return v && typeof v.t === "number" ? v.t : null;
}
async function carimbar(s) {
  if (!Rede.ok()) return {ok: false, msg: "Configure o Firebase em Ajustes para carimbar o horário."};
  const cod = garantirCodigo(s);
  if (!integra(s)) return {ok: false, msg: "Este registro não confere mais com o código. Não é seguro carimbar."};
  const a = Date.now(); let jaTinha = false;
  try { await Rede.req(Rede.url(), "PUT", "/selos/" + cod, {t: {".sv": "timestamp"}}); }
  catch (e) {
    if (e.status === 401 || e.status === 403) jaTinha = true;   // regra: só grava uma vez (ou as regras novas ainda não foram publicadas)
    else return {ok: false, msg: "Sem conexão com o Firebase. Confira a internet e tente de novo."};
  }
  const b = Date.now(); let t = null;
  try { t = await lerSelo(cod); } catch (e) { return {ok: false, msg: e.status === 401 || e.status === 403 ? MSG_REGRAS : "Sem conexão com o Firebase. Confira a internet e tente de novo."}; }
  if (t === null) return {ok: false, msg: MSG_REGRAS};
  s.selo = {t, dif: jaTinha ? null : t - Math.round((a + b) / 2), em: new Date().toISOString(), antigo: jaTinha};
  salvar();
  return {ok: true, msg: jaTinha ? "Este código já tinha carimbo. Mostrando o horário original." : "Horário carimbado."};
}
const seloCampo = s => s.selo ? [["Carimbo de tempo", dhms(s.selo.t) + " (servidor do Firebase)"]] : [];
function carimboHtml(s) {
  const nuvem = Rede.ok();
  if (s.selo) return `<div class="rl-selo sm"><span class="mut">Carimbo de tempo</span> <b>${esc(dhms(s.selo.t))}</b> <span class="chip ok" title="${esc(SELO_AVISO)}">${ic("check", 'style="width:14px;height:14px"')}servidor do Firebase</span>${s.selo.dif !== null && s.selo.dif !== undefined ? `<span class="mut">relógio deste aparelho ${segTxt(-s.selo.dif)} em relação ao servidor</span>` : ""}<button class="b sm g" data-act="selover" title="${esc(SELO_AVISO)}">Conferir de novo</button></div>`;
  return `<div class="rl-selo sm"><span class="mut">Carimbo de tempo</span> <span>Sem carimbo</span> <button class="b sm" data-act="selocar" ${nuvem && !SELO.ocup ? "" : "disabled"} title="${esc(nuvem ? SELO_AVISO : "Configure o Firebase em Ajustes")}">${ic("clock", 'style="width:16px;height:16px"')}${SELO.ocup ? "Carimbando..." : "Carimbar o horário"}</button>${nuvem ? "" : `<span class="mut">Precisa do Firebase configurado em Ajustes.</span>`}${SELO.msg ? `<span class="selo-m" role="status">${esc(SELO.msg)}</span>` : ""}</div>`;
}
function seloConsulta() {
  const nuvem = Rede.ok(), c = SELO.cons;
  return `<section class="k" id="selo-cons"><h3 class="rh">Consultar o carimbo de um código</h3>
    <p class="sm mut" style="margin:0 0 8px">Mostra o horário que o Firebase gravou para o código digitado acima, mesmo que a sessão não esteja neste aparelho. ${esc(SELO_AVISO)}</p>
    <button class="b sm" data-act="selocons" ${nuvem && !SELO.consOcup ? "" : "disabled"}>${ic("search", 'style="width:16px;height:16px"')}${SELO.consOcup ? "Consultando..." : "Consultar carimbo"}</button>${nuvem ? "" : ` <span class="sm mut">Precisa do Firebase configurado em Ajustes.</span>`}
    ${c ? `<p class="sm selo-r ${c.ok ? "ok" : "no"}" role="status" style="margin:10px 0 0"><b>${esc(c.titulo)}</b> ${esc(c.texto)}</p>` : ""}</section>`;
}
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "selocar" || a === "selover") {
    const s = sessaoRel(REL.sid); if (!s) return;
    if (a === "selover") {
      if (!Rede.ok()) { aviso("Configure o Firebase em Ajustes."); return; }
      try { const t = await lerSelo(garantirCodigo(s)); if (t === null) aviso("O Firebase não tem carimbo para este código."); else if (t !== s.selo.t) aviso("O horário no Firebase é diferente do guardado!"); else aviso("Confere: o Firebase tem o mesmo horário."); }
      catch (x) { aviso("Sem conexão com o Firebase."); }
      return;
    }
    SELO.ocup = true; SELO.msg = ""; render();
    const r = await carimbar(s); SELO.ocup = false; SELO.msg = r.ok ? "" : r.msg; if (rota().v === "relatorios") render(); aviso(r.msg);
  } else if (a === "selocons") {
    const campo = $("#cf-c"), c = normCodigo(campo ? campo.value : CF.cod);
    if (!c) { SELO.cons = {ok: false, titulo: "Código inválido.", texto: "Digite o código no campo acima (SAB-XXXX-XXXX-XXXX-XXXX-XXXX)."}; render(); return; }
    CF.cod = c; SELO.consOcup = true; render();
    try { const t = await lerSelo(c); SELO.cons = t === null ? {ok: false, titulo: "Sem carimbo.", texto: "O Firebase não tem horário gravado para " + c + "."} : {ok: true, titulo: "Carimbado em " + dhms(t) + ".", texto: "Horário do servidor do Firebase para " + c + ". Ele prova que este código já existia nesse momento."}; }
    catch (x) { SELO.cons = x.status === 401 || x.status === 403 ? {ok: false, titulo: "O Firebase não deixou consultar.", texto: "Publique as regras novas em Ajustes > Celulares na sala."} : {ok: false, titulo: "Sem conexão.", texto: "Não consegui falar com o Firebase."}; }
    SELO.consOcup = false; if (rota().v === "conferir") render();
  }
});

/* ---------- banco de perguntas ---------- */
const BANCO_MAX = 500;
const BN = {q: "", tipo: "", desf: null};
const bancoLista = () => (S.banco = Array.isArray(S.banco) ? S.banco : []);
const semAudio = it => { const c = clone(it); delete c.audio; delete c.aquece; return c; };
const chaveBn = it => it.tipo + "|" + chaveItem(it);
function guardarNoBanco(itens, de) {
  const b = bancoLista(), tem = new Set(b.map(chaveBn)); let novas = 0, repetidas = 0, vazias = 0;
  itens.forEach(it => {
    if (!String(it.enunciado || "").trim()) { vazias++; return; }
    if (tem.has(chaveBn(it))) { repetidas++; return; }
    if (b.length >= BANCO_MAX) return;
    b.unshift(Object.assign(semAudio(it), {bid: uid(), de: de || "", quando: agora()})); tem.add(chaveBn(it)); novas++;
  });
  if (novas) salvar();
  return {novas, repetidas, vazias};
}
function bnFiltrada() {
  const q = semAcento(BN.q.trim()), l = bancoLista();
  return l.filter(it => (!BN.tipo || it.tipo === BN.tipo) && (!q || semAcento([it.enunciado, it.texto || "", (it.alternativas || []).join(" "), it.de || ""].join(" ")).includes(q)));
}
function bnLinhas(t) {
  const desf = BN.desf ? `<div class="bn-d" role="status"><span>Pergunta excluída do banco.</span><button class="b sm" data-act="bndesfazer">Desfazer</button></div>` : "";
  const l = bnFiltrada(), dentro = new Set((t ? t.itens : []).map(chaveBn));
  if (!bancoLista().length) return desf + `<p class="sm mut" style="margin:6px 4px">O banco está vazio. Abra um treinamento, escolha uma pergunta e toque em "Guardar no banco", ou use "Guardar as deste treinamento".</p>`;
  if (!l.length) return desf + `<p class="sm mut" style="margin:6px 4px">Nenhuma pergunta encontrada.</p>`;
  return desf + l.slice(0, 60).map(it => `<div class="bn-i"><div class="bn-t"><b>${esc(it.enunciado)}</b><span class="sm mut">${TIPOS_CURTO[it.tipo] || it.tipo}${it.tipo !== "explicacao" ? " · " + (it.tempo || 20) + " s" : ""}${it.uso === "ensaio" ? " · teste" : ""}${it.de ? " · de " + esc(it.de) : ""}</span></div>
    <div class="bn-a">${dentro.has(chaveBn(it)) ? `<span class="chip ok">já está aqui</span>` : ""}<button class="b sm" data-act="bninserir" data-id="${esc(it.bid)}" ${t ? "" : "disabled"}>${ic("plus", 'style="width:16px;height:16px"')}Inserir</button><button class="b sm ic g bad" data-act="bnexcluir" data-id="${esc(it.bid)}" aria-label="Excluir do banco: ${esc(it.enunciado)}" title="Excluir do banco">${ic("trash", 'style="width:16px;height:16px"')}</button></div></div>`).join("") + (l.length > 60 ? `<p class="sm mut" style="margin:6px 4px">Mostrando 60 de ${l.length}. Use a busca para achar as outras.</p>` : "");
}
function dlgBanco() {
  const t = treino(UI.ed && UI.ed.id), d = $("#dlg"), n = bancoLista().length;
  d.innerHTML = `<div class="dl bn"><header><h2>Banco de perguntas</h2><button class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header>
    <p class="sm mut" style="margin:0">${n} pergunta${n === 1 ? "" : "s"} guardada${n === 1 ? "" : "s"} neste aparelho. Inserir traz uma cópia para ${t ? "o treinamento que você está editando" : "o treinamento (abra um no editor)"}.</p>
    <div class="bn-f"><div class="fd"><label for="bn-q">Buscar</label><input class="in" id="bn-q" type="search" value="${esc(BN.q)}" placeholder="Palavra da pergunta, alternativa ou treinamento" autocomplete="off"></div>
      <div class="fd"><label for="bn-tp">Formato</label><select class="in" id="bn-tp"><option value="">Todos</option>${Object.entries(TIPOS_CURTO).map(([k, v]) => `<option value="${k}" ${BN.tipo === k ? "selected" : ""}>${v}</option>`).join("")}</select></div></div>
    <div class="bn-l" id="bn-l" aria-live="polite">${bnLinhas(t)}</div>
    ${t ? `<button class="b" data-act="bntodas">${ic("book", 'style="width:16px;height:16px"')}Guardar as perguntas deste treinamento</button>` : ""}
    <p class="dica">O banco fica só neste aparelho e vai junto no "Exportar tudo". A voz gravada não vai para o banco.</p></div>`;
  if (!d.open) d.showModal();
}
function bnRepinta() { const l = $("#bn-l"); if (l) l.innerHTML = bnLinhas(treino(UI.ed && UI.ed.id)); }
document.addEventListener("input", e => { if (e.target.id === "bn-q") { BN.q = e.target.value; BN.desf = null; bnRepinta(); } });
document.addEventListener("change", e => { if (e.target.id === "bn-tp") { BN.tipo = e.target.value; bnRepinta(); } });
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (!["bnabrir", "bnguardar", "bntodas", "bninserir", "bnexcluir", "bndesfazer", "iarevisei"].includes(a)) return;
  const t = treino(UI.ed && UI.ed.id);
  if (a === "bnabrir") { if (!t) return; BN.q = ""; BN.tipo = ""; BN.desf = null; dlgBanco(); }
  else if (a === "bnguardar") { const it = t && t.itens[UI.ed.sel]; if (!it) return; const r = guardarNoBanco([it], t.titulo); aviso(r.novas ? "Pergunta guardada no banco" : r.repetidas ? "Essa pergunta já está no banco" : "Escreva o enunciado antes de guardar"); }
  else if (a === "bntodas") { if (!t) return; const r = guardarNoBanco(t.itens, t.titulo); dlgBanco(); aviso(r.novas ? r.novas + " guardada" + (r.novas === 1 ? "" : "s") + " no banco" + (r.repetidas ? ", " + r.repetidas + " já estava" + (r.repetidas === 1 ? "" : "m") : "") : "Nada novo para guardar"); }
  else if (a === "bninserir") {
    const it = bancoLista().find(x => x.bid === el.dataset.id); if (!t || !it) return;
    const c = semAudio(it); delete c.bid; delete c.de; delete c.quando;
    editou(t); t.itens.push(c); UI.ed.sel = t.itens.length - 1; pintaTudo(); bnRepinta(); aviso("Pergunta inserida no final");
  }
  else if (a === "bnexcluir") {
    const b = bancoLista(), i = b.findIndex(x => x.bid === el.dataset.id); if (i < 0) return; const [rem] = b.splice(i, 1); BN.desf = {rem, i}; salvar(); bnRepinta();
  }
  else if (a === "bndesfazer") { if (!BN.desf) return; const b = bancoLista(); b.splice(Math.min(BN.desf.i, b.length), 0, BN.desf.rem); BN.desf = null; salvar(); bnRepinta(); }
  else if (a === "iarevisei") { const tt = treino(el.dataset.id); if (tt) { delete tt.ia; salvar(); render(); aviso("Marcado como revisado"); } }
});
const iaAviso = t => t && t.ia ? `<section class="k ia-av" role="note"><b>Criado com IA: confira antes de aplicar</b><span class="sm">Leia cada pergunta e a resposta marcada com o POP da fazenda. A IA pode errar ou inventar regra.</span><button class="b sm" data-act="iarevisei" data-id="${esc(t.id)}">${ic("check", 'style="width:16px;height:16px"')}Já revisei</button></section>` : "";

/* ---------- criar com uma IA ---------- */
const IA = {tema: "", publico: "", n: 6, material: "", resp: "", erro: "", prompt: ""};
const IA_NS = [4, 6, 8, 10];
function promptIA() {
  const mat = IA.material.trim();
  return `Você é um instrutor de segurança, higiene e qualidade em uma propriedade rural. Crie um treinamento curto sobre: ${IA.tema.trim()}.
${IA.publico.trim() ? "Público: " + IA.publico.trim() + ".\n" : ""}Quantidade: ${IA.n} perguntas que valem nota, mais 1 explicação no começo.
${mat ? `Use SOMENTE o material abaixo como fonte. Não invente regra, número ou prazo que não esteja nele.\n---\n${mat.slice(0, 6000)}\n---\n` : "Use apenas boas práticas amplamente aceitas. Quando não tiver certeza, deixe a pergunta de fora.\n"}
Responda SOMENTE com um JSON válido, sem texto antes ou depois e sem marcas de código. Formato:
{"titulo":"...","meta":80,"descricao":"...","itens":[
 {"tipo":"explicacao","enunciado":"título do assunto","texto":"pontos principais, um por linha"},
 {"tipo":"multipla","enunciado":"...","alternativas":["...","...","...","..."],"correta":0,"tempo":20,"uso":"avaliacao","porque":"..."},
 {"tipo":"vf","enunciado":"...","alternativas":["Verdadeiro","Falso"],"correta":0,"tempo":20,"uso":"avaliacao","porque":"..."},
 {"tipo":"ordenar","enunciado":"...","alternativas":["passo 1","passo 2","passo 3"],"tempo":45,"uso":"avaliacao","porque":"..."}]}
Regras:
- "correta" é o número da alternativa certa, começando em 0. Em "ordenar" as alternativas já vêm na ordem certa, de 3 a 5 passos.
- Múltipla escolha com 3 ou 4 alternativas; só uma certa; as erradas têm que parecer possíveis.
- Enunciado com até 400 letras e alternativas com até 200. Frases curtas e palavras simples, para quem lê pouco.
- Misture os formatos e coloque em "porque" uma ou duas frases explicando a resposta certa.
- Não use emojis.`;
}
function lerRespostaIA(txt) {
  let x = String(txt || "").trim().replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "");
  const a = x.indexOf("{"), b = x.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("sem json");
  const o = JSON.parse(x.slice(a, b + 1));
  const t = validaTreino(o); if (!t) throw new Error("formato");
  t.itens = t.itens.filter(i => String(i.enunciado || "").trim());
  if (!t.itens.some(isQ)) throw new Error("sem perguntas");
  t.itens.forEach(i => { if (i.tipo === "ordenar") delete i.correta; if (i.tipo === "vf" && (!i.alternativas || i.alternativas.length !== 2)) i.alternativas = ["Verdadeiro", "Falso"]; if (i.tipo === "explicacao") { delete i.alternativas; delete i.correta; } });
  t.ia = true; t.versoes = [{n: 0, nota: "Criado com IA (conferir)", quando: agora()}];
  return t;
}
function dlgIA() {
  const d = $("#dlg"), pronto = IA.prompt && IA.tema.trim();
  d.innerHTML = `<form class="dl ia" data-form="iaprompt"><header><button type="button" class="b ic g" data-act="dlg" data-v="menu" aria-label="Voltar">${ic("back")}</button><h2>Criar com uma IA</h2><button type="button" class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header>
    <p class="sm mut" style="margin:0">O Sabiá não conversa com nenhuma IA e não envia nada para fora. Ele monta um texto pronto para você colar na IA que quiser, e depois lê a resposta.</p>
    <ol class="ia-p sm"><li>Conte o assunto abaixo e toque em "Montar o texto".</li><li>Copie, cole na IA e peça a resposta.</li><li>Cole a resposta aqui embaixo e crie o treinamento.</li></ol>
    <div class="fd"><label for="ia-t">Assunto do treinamento</label><input class="in" id="ia-t" data-ia="tema" maxlength="140" required value="${esc(IA.tema)}" placeholder="Ex.: Lavagem das mãos antes da ordenha"></div>
    <div class="row2"><div class="fd"><label for="ia-p">Para quem (opcional)</label><input class="in" id="ia-p" data-ia="publico" maxlength="100" value="${esc(IA.publico)}" placeholder="Ex.: ordenhadores novos"></div>
      <div class="fd"><label for="ia-n">Perguntas</label><select class="in" id="ia-n" data-ia="n">${IA_NS.map(n => `<option value="${n}" ${IA.n === n ? "selected" : ""}>${n}</option>`).join("")}</select></div></div>
    <div class="fd"><label for="ia-m">Seu material ou POP (opcional)</label><textarea class="in ta" id="ia-m" data-ia="material" rows="3" maxlength="6000" placeholder="Cole aqui o texto do POP. Com ele, a IA não inventa regra.">${esc(IA.material)}</textarea></div>
    <button class="b p" type="submit">${ic("edit")}Montar o texto</button>
    ${pronto ? `<div class="fd"><label for="ia-out">Texto para colar na IA</label><textarea class="in ta mono" id="ia-out" readonly rows="6">${esc(IA.prompt)}</textarea></div><button type="button" class="b" data-act="iacopiar">${ic("copy")}Copiar o texto</button>` : ""}
    <div class="fd"><label for="ia-r">Resposta da IA</label><textarea class="in ta mono" id="ia-r" data-ia="resp" rows="5" placeholder='Cole aqui o JSON que a IA devolveu (começa com { )'>${esc(IA.resp)}</textarea></div>
    <p class="erro" id="ia-erro" role="alert">${esc(IA.erro)}</p>
    <button type="button" class="b p" data-act="iacriar">${ic("check")}Criar o treinamento</button></form>`;
  if (!d.open) d.showModal();
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "dlgia") { dlgIA(); }
  else if (a === "iacopiar") { try { navigator.clipboard.writeText(IA.prompt).then(() => aviso("Texto copiado. Cole na IA."), () => { const o = $("#ia-out"); if (o) { o.select(); } aviso("Selecionei o texto: use Copiar do celular."); }); } catch (x) { const o = $("#ia-out"); if (o) o.select(); } }
  else if (a === "iacriar") {
    try {
      const t = lerRespostaIA(IA.resp); const nq = t.itens.filter(isQ).length, prob = problemasTreino(t).length;
      S.treinamentos.unshift(t); salvar(); IA.erro = ""; IA.resp = ""; IA.prompt = ""; const d = $("#dlg"); if (d.open) d.close();
      ir("#/editar/" + t.id); aviso(`"${t.titulo}" criado com ${nq} pergunta${nq === 1 ? "" : "s"}${prob ? ". Há " + prob + " para revisar." : ". Confira cada uma."}`);
    } catch (x) { IA.erro = IA.resp.trim() ? "Não consegui ler essa resposta. Confira se você copiou o JSON inteiro, do primeiro { ao último }, ou peça à IA para responder só com o JSON." : "Cole primeiro a resposta da IA."; const m = $("#ia-erro"); if (m) m.textContent = IA.erro; }
  }
});
document.addEventListener("input", e => { const x = e.target; if (x.dataset && x.dataset.ia) { IA[x.dataset.ia] = x.dataset.ia === "n" ? Number(x.value) : x.value; } });
document.addEventListener("change", e => { const x = e.target; if (x.dataset && x.dataset.ia === "n") IA.n = Number(x.value); });
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form='iaprompt']"); if (!f) return; e.preventDefault();
  if (!IA.tema.trim()) return;
  IA.prompt = promptIA(); const sc = $(".ia"); const top = sc ? sc.scrollTop : 0; dlgIA(); const out = $("#ia-out"); if (out) out.scrollIntoView({block: "nearest"});
});

/* ---------- pergunta de teste no começo da sessão ---------- */
const ITEM_AQUECE = () => ({tipo: "multipla", enunciado: "Pergunta de teste: qual destas é uma fruta?", alternativas: ["Banana", "Cadeira", "Martelo", "Porta"], correta: 0, tempo: 20, uso: "ensaio", porque: "Era só para treinar o toque no celular. A partir da próxima, vale nota.", aquece: true});
function aquecer(s) {
  if (!s || !s.aj || !s.aj.aquece || s.aqueceu || !Array.isArray(s.itens)) return;
  s.aqueceu = true;
  if (s.itens.some(i => i && i.aquece)) return;
  if (!s.itens.some(i => ehPergunta(i) && i.uso !== "ensaio")) return;
  s.itens.unshift(ITEM_AQUECE());
}

/* ---------- ouvir a pergunta no celular ---------- */
const temVoz = () => { try { return !!(window.speechSynthesis && window.SpeechSynthesisUtterance); } catch (e) { return false; } };
const ORD_TXT = ["primeira", "segunda", "terceira", "quarta", "quinta"];
function textoPergunta(it) {
  if (!it) return "";
  const ordem = it.tipo === "ordenar" ? (it.ordem || it.alts.map((_, k) => k)) : it.alts.map((_, k) => k);
  const partes = [it.enunciado];
  if (it.tipo === "ordenar") partes.push("Coloque os passos na ordem certa. Os passos são:");
  ordem.forEach((k, pos) => partes.push((it.tipo === "ordenar" ? "Passo " : ORD_TXT[pos] + " opção: ") + (it.tipo === "ordenar" ? (pos + 1) + ": " : "") + it.alts[k]));
  return partes.join(". ").replace(/\.\s*\./g, ".");
}
function textoResultado(it) {
  if (!it) return "";
  const c = it.tipo === "ordenar" ? "A ordem certa é: " + it.alts.map((a, k) => (k + 1) + ", " + a).join(". ") : (Number.isInteger(it.correta) && it.alts[it.correta] !== undefined ? "A resposta certa é: " + it.alts[it.correta] : "");
  return [c, it.porque ? "Por quê: " + it.porque : ""].filter(Boolean).join(". ");
}
function ouvirTexto(txt) {
  if (!temVoz() || !txt) return false;
  try {
    const sy = window.speechSynthesis; sy.cancel();
    const u = new SpeechSynthesisUtterance(txt); u.lang = "pt-BR"; u.rate = 0.95;
    const vs = sy.getVoices ? sy.getVoices() : []; const v = vs.find(x => /^pt[-_]BR/i.test(x.lang)) || vs.find(x => /^pt/i.test(x.lang)); if (v) u.voice = v;
    u.onend = u.onerror = () => { OUV.falando = false; const b = document.querySelector(".ouv"); if (b) b.setAttribute("aria-pressed", "false"); };
    OUV.falando = true; sy.speak(u); return true;
  } catch (e) { return false; }
}
const OUV = {falando: false};
function ouvirParar() { try { if (temVoz()) window.speechSynthesis.cancel(); } catch (e) {} OUV.falando = false; }
function btnOuvir(modo) { return temVoz() ? `<button type="button" class="b ouv g2" data-act="couvir" data-modo="${modo || "p"}" aria-pressed="false">${ic("vol", 'style="width:18px;height:18px"')}${modo === "r" ? "Ouvir a resposta" : "Ouvir a pergunta"}</button>` : ""; }
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act='couvir']"); if (!el) return;
  if (OUV.falando) { ouvirParar(); el.setAttribute("aria-pressed", "false"); return; }
  const it = typeof itemCel === "function" ? itemCel() : null;
  if (ouvirTexto(el.dataset.modo === "r" ? textoResultado(it) : textoPergunta(it))) el.setAttribute("aria-pressed", "true"); else aviso("Este celular não consegue ler em voz alta.");
});

/* ---------- voz gravada pelo instrutor (toca no telão) ---------- */
const VOZ = {rec: null, stream: null, chunks: [], it: null, tm: 0, t0: 0, tick: 0};
const VOZ_MAX = 30, VOZ_BYTES = 450000;
const audioOk = a => typeof a === "string" && a.length <= 600000 && /^data:audio\/[a-z0-9.+-]+(;[a-z0-9=.+-]+)*;base64,/i.test(a);
const podeGravar = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
function vozHtml(it) {
  const gr = VOZ.rec && VOZ.it === it;
  const corpo = gr
    ? `<div class="vz-g" role="status"><i class="vz-d"></i><b id="vz-t">Gravando 0:00</b><button class="b sm bad" data-act="vozparar">${ic("check", 'style="width:16px;height:16px"')}Parar e guardar</button></div>`
    : it.audio
    ? `<div class="vz-a"><audio controls preload="metadata" src="${it.audio}" aria-label="Voz gravada da pergunta"></audio><button class="b sm" data-act="vozgravar" ${podeGravar() ? "" : "disabled"}>Regravar</button><button class="b sm g bad" data-act="vozdel">Remover</button></div>`
    : `<button class="b sm" data-act="vozgravar" style="justify-self:start" ${podeGravar() ? "" : "disabled"}>${ic("mic", 'style="width:16px;height:16px"')}Gravar a voz</button>`;
  return `<div class="fd vz" id="vz-box"><span class="lbl">Voz da pergunta (opcional)</span>${corpo}<span class="sm mut">${podeGravar() ? `Até ${VOZ_MAX} segundos. Toca no telão quando a pergunta abre. Nos celulares, o participante usa o botão "Ouvir".` : "Este navegador não grava voz."}</span></div>`;
}
function vozRepinta() { const b = $("#vz-box"), t = treino(UI.ed && UI.ed.id), it = t && t.itens[UI.ed.sel]; if (b && it) b.outerHTML = vozHtml(it); }
async function vozGravar() {
  const t = treino(UI.ed && UI.ed.id), it = t && t.itens[UI.ed.sel]; if (!it || VOZ.rec) return;
  if (!podeGravar()) { aviso("Este navegador não grava voz."); return; }
  try { VOZ.stream = await navigator.mediaDevices.getUserMedia({audio: true}); } catch (e) { aviso("Sem permissão para usar o microfone."); return; }
  try {
    const rec = new MediaRecorder(VOZ.stream); VOZ.chunks = []; VOZ.it = it; VOZ.rec = rec; VOZ.t0 = Date.now();
    rec.ondataavailable = ev => { if (ev.data && ev.data.size) VOZ.chunks.push(ev.data); };
    rec.onstop = () => vozFim(t);
    rec.start(); VOZ.tm = setTimeout(vozParar, VOZ_MAX * 1000);
    VOZ.tick = setInterval(() => { const el = $("#vz-t"); if (el) { const s = Math.floor((Date.now() - VOZ.t0) / 1000); el.textContent = "Gravando " + Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); } }, 250);
    vozRepinta();
  } catch (e) { vozLimpa(); aviso("Não consegui gravar neste aparelho."); }
}
function vozParar() { clearTimeout(VOZ.tm); clearInterval(VOZ.tick); try { if (VOZ.rec && VOZ.rec.state !== "inactive") VOZ.rec.stop(); } catch (e) { vozLimpa(); } }
function vozLimpa() { clearTimeout(VOZ.tm); clearInterval(VOZ.tick); try { if (VOZ.stream) VOZ.stream.getTracks().forEach(x => x.stop()); } catch (e) {} VOZ.rec = null; VOZ.stream = null; }
function vozFim(t) {
  const it = VOZ.it, tipo = (VOZ.rec && VOZ.rec.mimeType) || "audio/webm", chunks = VOZ.chunks; vozLimpa(); VOZ.it = null;
  const blob = new Blob(chunks, {type: tipo}); if (!blob.size) { vozRepinta(); aviso("Não gravou nada. Tente de novo."); return; }
  const fr = new FileReader();
  fr.onload = () => {
    const url = String(fr.result);
    if (!audioOk(url) || blob.size > VOZ_BYTES) { vozRepinta(); aviso("A gravação ficou grande demais. Fale por menos tempo."); return; }
    if (!t.itens.includes(it)) { aviso("A pergunta mudou antes de terminar. Grave de novo."); return; }
    editou(t); it.audio = url; if (UI.ed && rota().v === "editar") { vozRepinta(); pintaPrev(); } aviso("Voz guardada");
  };
  fr.readAsDataURL(blob);
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (a === "vozgravar") vozGravar();
  else if (a === "vozparar") vozParar();
  else if (a === "vozdel") { const t = treino(UI.ed && UI.ed.id), it = t && t.itens[UI.ed.sel]; if (!it) return; const antes = it.audio; editou(t); delete it.audio; vozRepinta(); pintaPrev(); aviso("Voz removida", "Desfazer", () => { it.audio = antes; salvar(); if (rota().v === "editar") { vozRepinta(); pintaPrev(); } }); }
  else if (a === "tvoz") { const s = AO.snap && AO.snap.item; if (s && s.voz) tocarVoz(s.voz); }
});
let audioTel = null, vozTocada = "";
function tocarVoz(url) { try { if (audioTel) audioTel.pause(); audioTel = new Audio(url); const p = audioTel.play(); if (p && p.catch) p.catch(() => {}); return true; } catch (e) { return false; } }
/* o telão toca sozinho a voz quando a pergunta abre (se o navegador deixar); o botão fica sempre disponível */
function vozAuto() {
  if (rota().v !== "telao" || !AO.snap || !AO.snap.item || !AO.snap.item.voz) return;
  const f = AO.snap.fase; if (f.etapa !== "pergunta" && f.etapa !== "explicacao") return;
  const k = AO.snap.id + ":" + f.idx + ":" + f.t0; if (k === vozTocada) return; vozTocada = k; tocarVoz(AO.snap.item.voz);
}
const btnTelVoz = it => it && it.voz ? `<button type="button" class="tvoz" data-act="tvoz" aria-label="Tocar a voz da pergunta">${ic("vol", 'style="width:26px;height:26px"')}<span>Ouvir</span></button>` : "";
