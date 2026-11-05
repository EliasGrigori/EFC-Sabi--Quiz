/* ===== v0.7.0 · pessoas, perfil e selos, mensagens, desafio entre setores ===== */
const PES = {v: 0, q: "", filtro: false, setor: "", st: "ativas", sug: false, todos: false,
  msgTipo: "", msgSt: "", msgFiltro: false, msgTodas: false, resp: null, respTxt: "",
  ds: null, dsTela: false};
const TIPO_MSG = {elogio: "Elogio", sugestao: "Sugestão", reclamacao: "Reclamação", pergunta: "Pergunta"};
const nk0 = n => semAcento(n).replace(/\s+/g, " ");

/* ---------- cadastro: o mesmo nome, apelidos e acentos viram uma pessoa só ---------- */
let pesIdx = null, pesRef = null, pesLen = -1, pesVer = -1;
function mapaPessoas() {
  const l = S.pessoas || (S.pessoas = []);
  if (pesIdx && pesRef === l && pesLen === l.length && pesVer === PES.v) return pesIdx;
  pesIdx = new Map(); pesRef = l; pesLen = l.length; pesVer = PES.v;
  l.forEach(p => { pesIdx.set(nk0(p.nome), p); });
  l.forEach(p => (p.apelidos || []).forEach(a => { if (!pesIdx.has(nk0(a))) pesIdx.set(nk0(a), p); }));
  return pesIdx;
}
const pessoaPorNome = nome => mapaPessoas().get(nk0(nome)) || null;
/* chave estável de uma pessoa nos relatórios e nas pendências (usada por nk) */
function chaveNome(nome) { const k = nk0(nome), p = mapaPessoas().get(k); return p ? nk0(p.nome) : k; }
function pesMudou() { PES.v++; salvar(); }
function novaPessoa(nome, setor) {
  nome = limpaNome(nome); if (!nome) return null;
  const ex = pessoaPorNome(nome); if (ex) return ex;
  const p = {id: uid(), nome, setor: setor || "", apelidos: [], ativo: true, criada: new Date().toISOString()};
  S.pessoas.push(p); pesMudou(); return p;
}
/* lista de entrada do celular, montada do cadastro */
function rosterCad(setores) {
  const ss = setores || [];
  return (S.pessoas || []).filter(p => p.ativo !== false && (!ss.length || ss.includes(p.setor))).map(p => p.nome).sort((a, b) => a.localeCompare(b, "pt-BR")).slice(0, 300);
}
function rosterDe(a) { if (a.roster) return a.roster.slice(); if (a.semCad) return undefined; const l = rosterCad(a.setores); return l.length ? l : undefined; }
function cadAplicar(a) {
  if (a.roster) return "";
  const tot = (S.pessoas || []).filter(p => p.ativo !== false).length;
  if (!tot) return `<div class="reap"><span class="sm">Cadastre as pessoas em <a href="#/pessoas">Pessoas</a> e a lista de entrada do celular se monta sozinha.</span></div>`;
  const n = rosterCad(a.setores).length;
  if (a.semCad) return `<div class="reap"><span class="sm">Cada pessoa digita o próprio nome no celular.</span><button class="b sm g" data-act="cadusar">Usar o cadastro</button></div>`;
  return `<div class="reap"><span class="chip br">Cadastro</span><span class="sm">${n ? plural(n, "pessoa entra", "pessoas entram") + " pela lista, digitando 3 letras do nome." : "Nenhuma pessoa cadastrada nos setores escolhidos."}</span><button class="b sm g" data-act="cadnao">Não usar</button></div>`;
}
/* quem aparece nas sessões e ainda não está no cadastro */
function sugeridas() {
  const m = new Map();
  (S.sessoes || []).filter(x => x.estado === "encerrada" && tipoSessao(x) === "real" && x.resultado && Array.isArray(x.resultado.tabela)).forEach(s => {
    s.resultado.tabela.forEach(p => { const k = nk0(p.nome); if (!k || pessoaPorNome(p.nome)) return; const g = m.get(k) || {nome: p.nome, setor: p.setor || "", n: 0}; g.n++; if (!g.setor && p.setor) g.setor = p.setor; m.set(k, g); });
  });
  return [...m.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/* ---------- histórico e selos ---------- */
function histPessoa(p) {
  const k = chaveNome(p.nome), out = [];
  S.sessoes.filter(x => x.estado === "encerrada" && tipoSessao(x) === "real" && x.resultado && Array.isArray(x.resultado.tabela)).sort((a, b) => String(a.fim).localeCompare(String(b.fim))).forEach(s => {
    const i = s.resultado.tabela.findIndex(r => chaveNome(r.nome) === k); if (i < 0) return;
    const r = s.resultado.tabela[i];
    out.push({s, r, pct: r.pct, ok: r.pct >= s.meta, pre: s.mom === "pre", pos: i + 1, n: s.resultado.tabela.length, nq: s.resultado.nq || 0});
  });
  return out;
}
const SELOS = [
  {id: "meta1", nome: "Primeira meta", regra: "Atingir a meta numa sessão", ic: '<path d="M5 12l4 4 10-10"/>'},
  {id: "const3", nome: "Constância", regra: "3 sessões seguidas na meta", ic: '<path d="M4 18h4v-4H4ZM10 18h4V10h-4ZM16 18h4V6h-4Z"/>'},
  {id: "pres5", nome: "Presença", regra: "5 treinamentos concluídos", ic: '<path d="M4 5h16v14H4Z"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3"/>'},
  {id: "nota100", nome: "Nota máxima", regra: "100% numa sessão", ic: '<path d="M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1Z"/>'},
  {id: "recup", nome: "Recuperou", regra: "Atingir a meta no reforço", ic: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/>'},
  {id: "top1", nome: "Primeiro lugar", regra: "1º lugar numa sessão com ranking", ic: '<path d="M5 18h14M6 15l-2-9 5 4 3-6 3 6 5-4-2 9Z"/>'}];
function selosDe(h) {
  const v = h.filter(x => !x.pre); let seq = 0, mx = 0;
  v.forEach(x => { seq = x.ok ? seq + 1 : 0; mx = Math.max(mx, seq); });
  const tem = {meta1: v.some(x => x.ok), const3: mx >= 3, pres5: v.length >= 5, nota100: v.some(x => x.pct === 100 && x.nq > 0), recup: v.some(x => x.s.mom === "ref" && x.ok),
    top1: v.some(x => x.pos === 1 && x.n >= 3 && x.s.aj && x.s.aj.ranking && x.r.pts > 0)};
  return SELOS.map(x => ({...x, tem: !!tem[x.id]}));
}
const seloHtml = x => `<div class="sel${x.tem ? " tem" : ""}" title="${esc(x.regra)}"><span class="sel-f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${x.ic}</svg></span><b>${esc(x.nome)}</b><span class="sm mut">${x.tem ? "conquistado" : esc(x.regra)}</span></div>`;

/* pendências abertas de uma pessoa */
function pendDe(p) {
  const k = chaveNome(p.nome), P = pendencias(), l = [];
  P.ref.forEach(r => { if (nk(r.nome) === k) l.push({tipo: "Reforço", txt: `${r.rodada}ª tentativa de ${esc(treino(r.treinoId).titulo)}${r.bloqueada ? " (libera " + fmtDia(r.libera) + ")" : ""}`}); });
  P.esgot.forEach(r => { if (nk(r.nome) === k) l.push({tipo: "Reforço", txt: `usou as 3 tentativas de ${esc(treino(r.treinoId).titulo)}`}); });
  P.reav.forEach(r => { if (nk(r.nome) === k) l.push({tipo: "Reavaliar", txt: `${esc(treino(r.treinoId).titulo)}, ${r.d} dias (${r.falta < 0 ? "atrasada " + plural(-r.falta, "dia", "dias") : "em " + plural(r.falta, "dia", "dias")})`}); });
  P.val.forEach(r => { if (nk(r.nome) === k) l.push({tipo: "Validade", txt: `${esc(treino(r.treinoId).titulo)} ${r.falta < 0 ? "venceu há " + plural(-r.falta, "dia", "dias") : "vence em " + plural(r.falta, "dia", "dias")}`}); });
  return l;
}

/* ---------- tela: pessoas ---------- */
const nomeSetores = () => ["", ...S.cfg.setores];
function statusPessoa(p, h, pd) {
  if (pd.some(x => x.tipo === "Reforço")) return `<span class="chip warn">Reforço</span>`;
  if (pd.some(x => x.tipo === "Reavaliar")) return `<span class="chip br">Reavaliar</span>`;
  if (pd.some(x => x.tipo === "Validade")) return `<span class="chip br">Validade</span>`;
  const v = h.filter(x => !x.pre);
  return v.length ? `<span class="chip ok">Em dia</span>` : `<span class="chip">Sem sessão</span>`;
}
function vPessoas(id) {
  if (id) return vPerfil(id);
  const l0 = S.pessoas || [], q = nk0(PES.q), sug = sugeridas();
  const l = l0.filter(p => (PES.st === "todas" || (PES.st === "arquivadas" ? p.ativo === false : p.ativo !== false)) && (!PES.setor || (PES.setor === "-" ? !p.setor : p.setor === PES.setor)) && (!q || nk0(p.nome).includes(q) || (p.apelidos || []).some(a => nk0(a).includes(q))))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  topo("Pessoas", l0.length ? `${plural(l0.filter(p => p.ativo !== false).length, "pessoa cadastrada", "pessoas cadastradas")}` : "Cadastro por setor");
  $("#app").className = "body pes";
  const resumoF = [PES.st === "arquivadas" ? "Arquivadas" : PES.st === "todas" ? "Todas" : "Ativas", PES.setor ? (PES.setor === "-" ? "Sem setor" : PES.setor) : "Todos os setores"].join(" · ");
  const linhas = l.map(p => {
    const h = histPessoa(p), pd = pendDe(p), v = h.filter(x => !x.pre), ult = v[v.length - 1];
    return `<div class="pes-r${p.ativo === false ? " off" : ""}"><a class="pes-n" href="#/pessoas/${p.id}">${av(p.nome, hash(p.nome) % CORES_AV.length)}<span><b>${esc(p.nome)}</b><span class="sm mut">${p.setor ? esc(p.setor) : "Sem setor"}${(p.apelidos || []).length ? " · também: " + esc(p.apelidos.join(", ")) : ""}</span></span></a>
      <span class="sm mut pes-u hide-m">${ult ? `${ult.pct}% em ${dtd(ult.s.fim)}` : "nenhuma sessão ainda"}</span>${p.ativo === false ? `<span class="chip">Arquivada</span>` : statusPessoa(p, h, pd)}
      <span class="pes-a"><button class="b sm ic" data-act="pesedit" data-id="${p.id}" aria-label="Editar ${esc(p.nome)}" title="Editar">${ic("edit", 'style="width:18px;height:18px"')}</button><button class="b sm ic bad" data-act="pesdel" data-id="${p.id}" aria-label="Excluir ${esc(p.nome)}" title="Excluir">${ic("trash", 'style="width:18px;height:18px"')}</button></span></div>`;
  }).join("");
  const vazio = !l0.length
    ? `<div class="vazio">${ic("people", 'style="width:32px;height:32px;color:var(--brand-ink)"')}<b>Nenhuma pessoa cadastrada</b><span class="sm">Adicione uma por uma, cole uma lista de nomes ou cadastre quem já apareceu nas sessões. Com o cadastro, o celular mostra os nomes para escolher e os relatórios reconhecem a mesma pessoa.</span><div class="pes-bt"><button class="b p" data-act="pesnova">${ic("plus")}Adicionar pessoa</button><button class="b" data-act="pesimp">${ic("upload")}Colar uma lista</button></div></div>`
    : !l.length ? `<div class="vazio"><b>Ninguém encontrado</b><span class="sm">Mude a busca ou o filtro.</span></div>` : "";
  $("#app").innerHTML = `${sug.length ? `<section class="k pes-sug"><div class="pes-sh"><div><b>${plural(sug.length, "nome apareceu", "nomes apareceram")} nas sessões e não ${sug.length === 1 ? "está" : "estão"} no cadastro</b><span class="sm mut">Cadastre ou junte com uma pessoa que já existe (por exemplo Zé e José).</span></div><div class="pes-bt"><button class="b sm" data-act="pessugall">Cadastrar ${sug.length === 1 ? "" : "todos"}</button><button class="b sm g" data-act="pessugtog" aria-expanded="${PES.sug}">${PES.sug ? "Esconder" : "Ver nomes"}</button></div></div>
      ${PES.sug ? `<div class="pes-sl">${sug.map(g => `<div class="pes-s">${av(g.nome, hash(g.nome) % CORES_AV.length)}<span class="pes-sn"><b>${esc(g.nome)}</b><span class="sm mut">${g.setor ? esc(g.setor) + " · " : ""}${plural(g.n, "sessão", "sessões")}</span></span><button class="b sm" data-act="pessug" data-nome="${esc(g.nome)}" data-setor="${esc(g.setor)}">Cadastrar</button>${l0.length ? `<label class="sr" for="jn-${hash(g.nome)}">Juntar ${esc(g.nome)} com</label><select class="in sm" id="jn-${hash(g.nome)}" data-jn="${esc(g.nome)}"><option value="">É a mesma pessoa de...</option>${l0.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join("")}</select>` : ""}</div>`).join("")}</div>` : ""}</section>` : ""}
    <section class="k tbl pes-t" aria-label="Pessoas"><div class="tbar"><label class="srch"><span class="sr">Procurar pessoa</span>${ic("search")}<input class="in" type="search" id="pes-q" placeholder="Procurar pessoa" value="${esc(PES.q)}" autocomplete="off"></label>
      <button class="b" data-act="pesfiltro" aria-expanded="${PES.filtro}">${ic("filter")}Filtro <span class="mut sm">${esc(resumoF)}</span></button>
      <button class="b" data-act="pesimp">${ic("upload")}Colar lista</button><button class="b s" data-act="pesnova">${ic("plus")}Adicionar pessoa</button></div>
      ${PES.filtro ? `<div class="fpan"><div class="fd" style="min-width:200px"><label for="pes-fs">Situação</label><select class="in" id="pes-fs"><option value="ativas" ${PES.st === "ativas" ? "selected" : ""}>Ativas</option><option value="arquivadas" ${PES.st === "arquivadas" ? "selected" : ""}>Arquivadas</option><option value="todas" ${PES.st === "todas" ? "selected" : ""}>Todas</option></select></div>
        <div class="fd" style="min-width:200px"><label for="pes-fo">Setor</label><select class="in" id="pes-fo"><option value="">Todos os setores</option>${S.cfg.setores.map(s => `<option ${PES.setor === s ? "selected" : ""}>${esc(s)}</option>`).join("")}<option value="-" ${PES.setor === "-" ? "selected" : ""}>Sem setor</option></select></div></div>` : ""}
      ${linhas ? `<div class="pes-l">${linhas}</div>` : vazio}</section>`;
}
function vPerfil(id) {
  const p = (S.pessoas || []).find(x => x.id === id);
  if (!p) { topo("Pessoa", "", "", "#/pessoas"); $("#app").className = "body"; $("#app").innerHTML = `<div class="k vazio"><b>Pessoa não encontrada</b><a class="b" href="#/pessoas">Voltar para Pessoas</a></div>`; return; }
  const h = histPessoa(p), v = h.filter(x => !x.pre), selos = selosDe(h), conq = selos.filter(x => x.tem).length, pd = pendDe(p);
  const med = v.length ? Math.round(v.reduce((a, x) => a + x.pct, 0) / v.length) : null, efi = v.filter(x => x.ok).length;
  const msgs = (S.mensagens || []).filter(m => m.pessoa && chaveNome(m.pessoa) === chaveNome(p.nome));
  topo(p.nome, p.setor || "Sem setor", `<button class="b" data-act="pesedit" data-id="${p.id}">${ic("edit")}Editar</button>`, "#/pessoas");
  $("#app").className = "body pes pfl";
  const hist = h.slice().reverse(), vis = PES.todos ? hist : hist.slice(0, 6);
  $("#app").innerHTML = `<section class="k pfl-top">${av(p.nome, hash(p.nome) % CORES_AV.length)}<div><b class="pfl-n">${esc(p.nome)}</b><span class="sm mut">${p.setor ? esc(p.setor) : "Sem setor"}${p.ativo === false ? " · arquivada" : ""}${(p.apelidos || []).length ? " · também aparece como " + esc(p.apelidos.join(", ")) : ""}</span></div></section>
    <div class="k rsm q4"><div><b>${v.length}</b><span>Sessões</span></div><div><b>${med === null ? "–" : med + "%"}</b><span>Nota média</span></div><div><b>${v.length ? efi + " de " + v.length : "–"}</b><span>Atingiu a meta</span></div><div><b>${plural(conq, "selo", "selos")}</b><span>de ${SELOS.length}</span></div></div>
    ${pd.length ? `<section class="k"><h3 class="rh">Pendências desta pessoa</h3><ul class="pfl-pd">${pd.map(x => `<li><span class="chip ${x.tipo === "Reforço" ? "warn" : "br"}">${x.tipo}</span><span>${x.txt}</span></li>`).join("")}</ul><a class="b sm" style="justify-self:start" href="#/pendencias">${ic("flag", 'style="width:16px;height:16px"')}Abrir Pendências</a></section>` : ""}
    <section class="k"><h3 class="rh">Selos de constância · ${conq} de ${SELOS.length}</h3><div class="sels">${selos.map(seloHtml).join("")}</div></section>
    <section class="k"><h3 class="rh">Histórico</h3>${hist.length ? `<div class="pfl-h">${vis.map(x => `<div><span class="pfl-t"><b>${esc(x.s.titulo)}</b><span class="sm mut">${dtd(x.s.fim)}${x.s.mom ? " · " + MOM_TXT[x.s.mom] : ""} · <a href="#/relatorios/${x.s.id}">relatório</a></span></span><span class="pfl-p"><b class="num">${x.pre ? "–" : x.pct + "%"}</b>${x.pre ? `<span class="chip">Linha de base</span>` : `<span class="chip ${x.ok ? "ok" : "warn"}">${x.ok ? "Atingiu a meta" : "Abaixo da meta"}</span>`}</span></div>`).join("")}</div>${hist.length > 6 ? `<button class="b sm" style="justify-self:start" data-act="pestodos">${PES.todos ? "Mostrar só as 6 últimas" : "Mostrar todas (" + hist.length + ")"}</button>` : ""}` : `<p class="sm mut" style="margin:0">Aparece aqui depois que a pessoa participar de uma sessão oficial encerrada. O nome precisa ser o mesmo do cadastro ou de um apelido.</p>`}</section>
    ${msgs.length ? `<section class="k"><h3 class="rh">Mensagens</h3><p class="sm" style="margin:0">${plural(msgs.length, "mensagem enviada", "mensagens enviadas")} por esta pessoa. <a href="#/mensagens">Abrir Mensagens</a></p></section>` : ""}`;
}
function dlgPessoa(id) {
  const p = id ? (S.pessoas || []).find(x => x.id === id) : null, d = $("#dlg");
  d.innerHTML = `<form class="dl" data-form="pessoa" data-id="${p ? p.id : ""}"><header><h2>${p ? "Editar pessoa" : "Nova pessoa"}</h2><button type="button" class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header>
    <div class="fd"><label for="pe-n">Nome completo</label><input class="in" id="pe-n" maxlength="60" required value="${esc(p ? p.nome : "")}" autocomplete="off"></div>
    <div class="fd"><label for="pe-s">Setor</label><select class="in" id="pe-s">${nomeSetores().map(s => `<option value="${esc(s)}" ${p && p.setor === s ? "selected" : ""}>${s ? esc(s) : "Sem setor"}</option>`).join("")}${p && p.setor && !S.cfg.setores.includes(p.setor) ? `<option value="${esc(p.setor)}" selected>${esc(p.setor)}</option>` : ""}</select></div>
    <div class="fd"><label for="pe-a">Outros jeitos de escrever o nome (um por linha)</label><textarea class="in ta" id="pe-a" rows="3" maxlength="400" placeholder="Zé">${esc(p ? (p.apelidos || []).join("\n") : "")}</textarea><span class="sm mut">Sessões com esses nomes contam para esta pessoa.</span></div>
    ${p ? `<label class="opt"><input type="checkbox" id="pe-at" ${p.ativo === false ? "" : "checked"}><span>Pessoa ativa<small>Arquivada, ela deixa de entrar na lista do celular, mas o histórico fica.</small></span></label>` : ""}
    <button class="b p" type="submit">${ic("check")}${p ? "Salvar" : "Adicionar"}</button></form>`;
  d.showModal(); const f = $("#pe-n"); if (f) f.focus();
}
function dlgImportar() {
  const d = $("#dlg");
  d.innerHTML = `<form class="dl" data-form="pesimp"><header><h2>Colar lista de nomes</h2><button type="button" class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header>
    <p class="sm mut" style="margin:0">Uma pessoa por linha. Para já indicar o setor, escreva o nome, um ponto e vírgula e o setor. Nomes que já existem são ignorados.</p>
    <div class="fd"><label for="pi-t">Nomes</label><textarea class="in ta" id="pi-t" rows="9" maxlength="20000" placeholder="Maria Aparecida Silva; Packing&#10;José Wellington; Campo"></textarea></div>
    <button class="b p" type="submit">${ic("check")}Cadastrar</button></form>`;
  d.showModal(); const f = $("#pi-t"); if (f) f.focus();
}
function pesDel(id) {
  const i = S.pessoas.findIndex(p => p.id === id); if (i < 0) return;
  const [p] = S.pessoas.splice(i, 1); pesMudou(); render();
  aviso(`${p.nome} excluída do cadastro`, "Desfazer", () => { S.pessoas.splice(Math.min(i, S.pessoas.length), 0, p); pesMudou(); render(); });
}

/* ---------- mensagens: comentários rápidos que a turma envia pelo celular ---------- */
const novasMsgs = () => (S.mensagens || []).filter(m => !m.lida).length;
function ingerirCom(s, partes) {
  let n = 0; const L = (S.mensagens = S.mensagens || []);
  Object.entries(partes).forEach(([pid, v]) => {
    const p = s.part.find(x => x.id === pid); if (!p || !v || typeof v.com !== "object" || !v.com || !p.real) return;
    Object.entries(v.com).slice(0, 3).forEach(([cid, o]) => {
      const id = s.id + "." + pid + "." + cid; if (!o || L.some(m => m.id === id)) return;
      const tp = TIPO_MSG[o.k] ? o.k : "", tx = String(o.x || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
      if (!tp || tx.length < 3) return;
      const em = Number(o.t) > 0 && Number(o.t) <= Date.now() + 60000 ? Number(o.t) : Date.now();
      L.push({id, sid: s.id, pid, cid, pessoa: p.nome, setor: p.setor || "", tipo: tp, texto: tx, em, treinoId: s.treinoId, titulo: s.titulo, versao: s.versao, teste: tipoSessao(s) === "teste", lida: false, resposta: "", respEm: 0}); n++;
    });
  });
  return n;
}
function pesAviso() {
  const r = rota().v; menu(r);
  if (r === "mensagens" && PES.resp === null && !document.activeElement.closest("#app textarea")) render();
}
function cmCard(s) {
  const n = (S.mensagens || []).filter(m => m.sid === s.id).length; if (!s.part.some(p => p.real)) return "";
  return `<section class="k" id="cmcard"><h3 style="font-size:16px;margin-bottom:4px">Comentários da turma</h3><p class="sm mut" style="margin:0 0 8px">No fim da sessão cada pessoa pode deixar um elogio, sugestão, reclamação ou pergunta no celular. Eles chegam em Mensagens. Responda antes de encerrar para a pessoa ver no celular.</p><div class="chips"><span class="chip ${n ? "ok" : ""}">${plural(n, "comentário recebido", "comentários recebidos")}</span>${n ? `<a class="b sm" href="#/mensagens">Abrir Mensagens</a>` : ""}</div></section>`;
}
function vMensagens() {
  const todas = (S.mensagens || []).slice().sort((a, b) => (a.lida === b.lida ? 0 : a.lida ? 1 : -1) || b.em - a.em), nov = novasMsgs();
  topo("Mensagens", todas.length ? (nov ? plural(nov, "nova", "novas") : "Tudo lido") : "Comentários da turma");
  $("#app").className = "body page msg";
  const l = todas.filter(m => (!PES.msgTipo || m.tipo === PES.msgTipo) && (!PES.msgSt || (PES.msgSt === "novas" ? !m.lida : PES.msgSt === "respondidas" ? !!m.resposta : (m.lida && !m.resposta))));
  const vis = PES.msgTodas ? l : l.slice(0, 20);
  const resumoF = [PES.msgTipo ? {elogio: "Elogios", sugestao: "Sugestões", reclamacao: "Reclamações", pergunta: "Perguntas"}[PES.msgTipo] : "Todas", PES.msgSt ? {novas: "novas", respondidas: "respondidas", lidas: "lidas sem resposta"}[PES.msgSt] : "qualquer situação"].join(" · ");
  const corpo = !todas.length
    ? `<section class="k vazio">${ic("chat", 'style="width:32px;height:32px;color:var(--brand-ink)"')}<b>Nenhuma mensagem ainda</b><span class="sm">No fim de cada sessão, a turma pode deixar um comentário rápido no celular: elogio, sugestão, reclamação ou pergunta. Eles chegam aqui com o nome, o treinamento e a versão.</span></section>`
    : !l.length ? `<section class="k vazio"><b>Nenhuma mensagem com esse filtro</b></section>`
    : `<section class="k msg-l">${vis.map(m => {
      const pe = pessoaPorNome(m.pessoa), ab = PES.resp === m.id;
      return `<div class="msg-i${m.lida ? "" : " nova"}"><button class="b sm ic bad msg-x" data-act="msgdel" data-id="${esc(m.id)}" aria-label="Excluir mensagem de ${esc(m.pessoa)}" title="Excluir">${ic("trash", 'style="width:18px;height:18px"')}</button>
        <div class="msg-h">${av(m.pessoa, hash(m.pessoa) % CORES_AV.length)}<span class="msg-q"><b>${pe ? `<a href="#/pessoas/${pe.id}">${esc(m.pessoa)}</a>` : esc(m.pessoa)}</b><span class="sm mut">${m.setor ? esc(m.setor) + " · " : ""}${dtc(new Date(m.em).toISOString())}</span></span><span class="chip ${m.tipo === "reclamacao" ? "warn" : m.tipo === "elogio" ? "ok" : "br"}">${TIPO_MSG[m.tipo]}</span>${m.teste ? `<span class="chip">Sessão de teste</span>` : ""}</div>
        <span class="sm mut">Sobre ${esc(m.titulo || "um treinamento")}${typeof m.versao === "number" ? " · v" + String(m.versao).padStart(2, "0") : ""}</span><p class="msg-t">${esc(m.texto)}</p>
        ${m.resposta ? `<p class="msg-r"><b>Sua resposta:</b> ${esc(m.resposta)}</p>` : ab ? `<div class="fd"><label for="msg-r">Resposta</label><textarea class="in ta" id="msg-r" rows="3" maxlength="300" data-resptxt="1">${esc(PES.respTxt)}</textarea><span class="sm mut">Se a sala ainda estiver aberta, a pessoa vê a resposta no celular. Depois disso, a resposta fica só aqui.</span></div><div class="pes-bt"><button class="b sm p" data-act="msgenviar" data-id="${esc(m.id)}">Enviar resposta</button><button class="b sm g" data-act="msgresp" data-id="">Cancelar</button></div>`
          : `<div class="pes-bt"><button class="b sm" data-act="msgresp" data-id="${esc(m.id)}">Responder</button>${m.lida ? "" : `<button class="b sm g" data-act="msglida" data-id="${esc(m.id)}">${ic("check", 'style="width:16px;height:16px"')}Marcar como lida</button>`}</div>`}</div>`;
    }).join("")}${l.length > 20 ? `<div class="msg-mais"><button class="b sm" data-act="msgtodas">${PES.msgTodas ? "Mostrar só 20" : "Mostrar todas (" + l.length + ")"}</button></div>` : ""}</section>`;
  $("#app").innerHTML = todas.length ? `<div class="tbar msg-b"><button class="b" data-act="msgfiltro" aria-expanded="${PES.msgFiltro}">${ic("filter")}Filtro <span class="mut sm">${esc(resumoF)}</span></button></div>
    ${PES.msgFiltro ? `<div class="fpan"><div class="fd" style="min-width:200px"><label for="ms-t">Tipo</label><select class="in" id="ms-t"><option value="">Todos os tipos</option>${Object.entries(TIPO_MSG).map(([k, n]) => `<option value="${k}" ${PES.msgTipo === k ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      <div class="fd" style="min-width:200px"><label for="ms-s">Situação</label><select class="in" id="ms-s"><option value="">Qualquer</option><option value="novas" ${PES.msgSt === "novas" ? "selected" : ""}>Novas</option><option value="respondidas" ${PES.msgSt === "respondidas" ? "selected" : ""}>Respondidas</option><option value="lidas" ${PES.msgSt === "lidas" ? "selected" : ""}>Lidas sem resposta</option></select></div></div>` : ""}${corpo}` : corpo;
}
async function enviarRsp(m, tx) {
  const s = (S.sessoes || []).find(x => x.id === m.sid);
  if (!s || s.estado !== "sala" || !Rede.ok() || !m.pid || !m.cid) return false;
  try { await Rede.req(Rede.url(), "PUT", "/salas/" + s.chave + "/part/" + m.pid + "/rsp/" + m.cid, {x: tx}); return true; } catch (e) { return false; }
}

/* ---------- desafio entre setores (placar do mês, sem nomes) ---------- */
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MIN_SETOR = 3;
function mesDs() { if (!PES.ds) { const d = new Date(); PES.ds = {a: d.getFullYear(), m: d.getMonth(), ano: false}; } return PES.ds; }
const perDs = M => M.ano ? "ano de " + M.a : MESES[M.m] + " de " + M.a;
function dadosSetores(M) {
  const ini = new Date(M.a, M.ano ? 0 : M.m, 1).getTime(), fim = M.ano ? new Date(M.a + 1, 0, 1).getTime() : new Date(M.a, M.m + 1, 1).getTime(), g = new Map();
  (S.sessoes || []).filter(x => x.estado === "encerrada" && tipoSessao(x) === "real" && x.mom !== "pre" && x.resultado && Array.isArray(x.resultado.tabela) && Date.parse(x.fim) >= ini && Date.parse(x.fim) < fim).forEach(s => {
    s.resultado.tabela.forEach(r => {
      const pe = pessoaPorNome(r.nome), st = r.setor || (pe && pe.setor) || "Sem setor", o = g.get(st) || {setor: st, pess: new Set(), n: 0, ac: 0, sess: new Set()};
      o.pess.add(chaveNome(r.nome)); o.sess.add(s.id); o.n += s.resultado.nq || 0; o.ac += r.ac || 0; g.set(st, o);
    });
  });
  const todos = [...g.values()].map(o => ({...o, pct: o.n ? Math.round(100 * o.ac / o.n) : 0}));
  return {placar: todos.filter(o => o.pess.size >= MIN_SETOR && o.n).sort((a, b) => b.pct - a.pct || b.n - a.n || a.setor.localeCompare(b.setor, "pt-BR")), poucos: todos.filter(o => o.pess.size < MIN_SETOR)};
}
function placarHtml(D, grande) {
  if (!D.placar.length) return `<p class="sm mut" style="margin:0">Ainda não há setor com ${MIN_SETOR} pessoas ou mais neste período.</p>`;
  return `<ol class="ds-l${grande ? " g" : ""}">${D.placar.map((g, i) => `<li><span class="ds-p num">${i + 1}º</span><b class="ds-s">${esc(g.setor)}</b><span class="ds-b" role="img" aria-label="${g.pct}% de acerto"><i style="width:${g.pct}%"></i></span><b class="num ds-c">${g.pct}%</b><span class="sm mut ds-n">${plural(g.pess.size, "pessoa", "pessoas")} · ${plural(g.n, "resposta", "respostas")}</span></li>`).join("")}</ol>`;
}
function relModo(at) { return `<div class="seg rel-modo" role="group" aria-label="Relatórios"><button data-act="relmodo" data-v="sessoes" aria-pressed="${at === "sessoes"}">Sessões</button><button data-act="relmodo" data-v="desafio" aria-pressed="${at === "desafio"}">Desafio entre setores</button></div>`; }
function vDesafio() {
  const M = mesDs(), D = dadosSetores(M);
  if (PES.dsTela) {
    topo("Desafio entre setores", perDs(M), `<button class="b" data-act="dssair">${ic("back")}Voltar</button>`);
    $("#app").className = "body ds dst";
    $("#app").innerHTML = `<section class="k ds-g"><span class="lbl">% de acerto ${M.ano ? "do ano" : "do mês"} por setor · sem nomes</span>${placarHtml(D, true)}</section>`; return;
  }
  topo("Relatórios", "Desafio entre setores");
  $("#app").className = "body rel ds";
  $("#app").innerHTML = `${relModo("desafio")}<section class="k ds-k"><div class="ds-h"><h3 class="rh" style="margin:0">Desafio entre setores, ${perDs(M)}</h3><div class="pes-bt"><div class="seg" role="group" aria-label="Período"><button data-act="dsmodo" data-v="mes" aria-pressed="${!M.ano}">Mês</button><button data-act="dsmodo" data-v="ano" aria-pressed="${!!M.ano}">Ano</button></div>
    <button class="b sm ic" data-act="dsmes" data-v="-1" aria-label="Período anterior">${ic("back", 'style="width:18px;height:18px"')}</button><button class="b sm ic" data-act="dsmes" data-v="1" aria-label="Próximo período">${ic("back", 'style="width:18px;height:18px;transform:scaleX(-1)"')}</button><button class="b sm p" data-act="dstela">${ic("screen", 'style="width:16px;height:16px"')}Mostrar em tela grande</button></div></div>
    ${placarHtml(D, false)}
    ${D.poucos.length ? `<p class="sm mut" style="margin:0">Fora do placar por ter menos de ${MIN_SETOR} pessoas no período, para não identificar ninguém: ${D.poucos.map(g => esc(g.setor)).join(", ")}.</p>` : ""}
    <p class="sm mut" style="margin:0">% de acerto nas perguntas que valem nota do ${M.ano ? "ano" : "mês"}, por setor. Só entram sessões oficiais encerradas, sem pré-teste, teste nem ensaio. O setor vem da sessão ou do cadastro de Pessoas.</p></section>`;
}

/* ---------- menu "Mais" do celular ---------- */
function vMais() {
  topo("Mais", "");
  $("#app").className = "body page mais";
  const it = ([h, n, i, d]) => `<a class="k mais-i" href="#/${h}"><span class="mais-ic">${ic(i)}</span><span><b>${n}</b><span class="sm mut">${d}</span></span></a>`;
  $("#app").innerHTML = [["pessoas", "Pessoas", "people", "Cadastro por setor, histórico e selos"], ["relatorios", "Relatórios", "chart", "Resultado de cada sessão e desafio entre setores"], ["conferir", "Conferir", "shield", "Confirmar um registro pelo código"], ["ajustes", "Ajustes", "gear", "Identificação, perfil, integração, setores e dados"]].filter(x => rotaOk(x[0])).map(it).join("");
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act, id = el.dataset.id, v = el.dataset.v;
  if (a === "cadusar" && UI.apl) { UI.apl.semCad = false; render(); }
  else if (a === "cadnao" && UI.apl) { UI.apl.semCad = true; render(); }
  else if (a === "pesfiltro") { PES.filtro = !PES.filtro; render(); }
  else if (a === "pesnova") dlgPessoa("");
  else if (a === "pesedit") dlgPessoa(id);
  else if (a === "pesimp") dlgImportar();
  else if (a === "pesdel") pesDel(id);
  else if (a === "pestodos") { PES.todos = !PES.todos; render(); }
  else if (a === "pessugtog") { PES.sug = !PES.sug; render(); }
  else if (a === "pessug") { const p = novaPessoa(el.dataset.nome, el.dataset.setor); if (p) { render(); aviso(`${p.nome} cadastrada`); } }
  else if (a === "pessugall") { const l = sugeridas(); l.forEach(g => novaPessoa(g.nome, g.setor)); render(); aviso(plural(l.length, "pessoa cadastrada", "pessoas cadastradas")); }
  else if (a === "msgfiltro") { PES.msgFiltro = !PES.msgFiltro; render(); }
  else if (a === "msgtodas") { PES.msgTodas = !PES.msgTodas; render(); }
  else if (a === "msgresp") { PES.resp = id || null; PES.respTxt = ""; render(); const t = $("#msg-r"); if (t) t.focus(); }
  else if (a === "msglida") { const m = (S.mensagens || []).find(x => x.id === id); if (m) { m.lida = true; salvar(); render(); menu(rota().v); } }
  else if (a === "msgdel") {
    const i = (S.mensagens || []).findIndex(x => x.id === id); if (i < 0) return;
    const [m] = S.mensagens.splice(i, 1); salvar(); render(); menu(rota().v);
    aviso("Mensagem excluída", "Desfazer", () => { S.mensagens.splice(Math.min(i, S.mensagens.length), 0, m); salvar(); render(); menu(rota().v); });
  }
  else if (a === "msgenviar") {
    const m = (S.mensagens || []).find(x => x.id === id), tx = String(PES.respTxt || "").replace(/\s+/g, " ").trim().slice(0, 300);
    if (!m) return; if (tx.length < 2) { aviso("Escreva a resposta antes de enviar."); return; }
    m.resposta = tx; m.respEm = Date.now(); m.lida = true; PES.resp = null; PES.respTxt = ""; salvar(); render(); menu(rota().v);
    enviarRsp(m, tx).then(ok => aviso(ok ? "Resposta enviada ao celular" : "Resposta guardada. A sala já está fechada, então ela fica só aqui."));
  }
  else if (a === "relmodo") { location.hash = v === "desafio" ? "#/relatorios/desafio" : "#/relatorios"; }
  else if (a === "dsmodo") { const M = mesDs(); M.ano = v === "ano"; render(); }
  else if (a === "dsmes") { const M = mesDs(), d = Number(v); if (M.ano) M.a += d; else { M.m += d; if (M.m < 0) { M.m = 11; M.a--; } else if (M.m > 11) { M.m = 0; M.a++; } } render(); }
  else if (a === "dstela") { PES.dsTela = true; render(); }
  else if (a === "dssair") { PES.dsTela = false; render(); }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "pes-q") { PES.q = t.value; const p = t.selectionStart; render(); const b = $("#pes-q"); if (b) { b.focus(); b.setSelectionRange(p, p); } }
  else if (t.dataset.resptxt) PES.respTxt = t.value;
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "pes-fs") { PES.st = t.value; render(); }
  else if (t.id === "pes-fo") { PES.setor = t.value; render(); }
  else if (t.id === "ms-t") { PES.msgTipo = t.value; render(); }
  else if (t.id === "ms-s") { PES.msgSt = t.value; render(); }
  else if (t.dataset.jn && t.value) {
    const p = S.pessoas.find(x => x.id === t.value); if (!p) return;
    const ap = new Set(p.apelidos || []); ap.add(t.dataset.jn); p.apelidos = [...ap]; pesMudou(); render(); aviso(`"${t.dataset.jn}" agora conta como ${p.nome}`);
  }
});
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form='pessoa'],[data-form='pesimp']"); if (!f) return; e.preventDefault();
  if (f.dataset.form === "pessoa") {
    const nome = limpaNome($("#pe-n").value); if (!nome) return;
    const setor = $("#pe-s").value, ap = [...new Set($("#pe-a").value.split("\n").map(limpaNome).filter(x => x && nk0(x) !== nk0(nome)))].slice(0, 10);
    const outra = pessoaPorNome(nome);
    if (f.dataset.id) {
      const p = S.pessoas.find(x => x.id === f.dataset.id); if (!p) return;
      if (outra && outra !== p) { aviso("Já existe outra pessoa com esse nome."); return; }
      const ant = p.nome, apl = new Set(ap); if (nk0(ant) !== nk0(nome)) apl.add(ant);   // o nome antigo continua valendo para o histórico
      p.nome = nome; p.setor = setor; p.apelidos = [...apl].slice(0, 12); const at = $("#pe-at"); p.ativo = at ? at.checked : true;
      pesMudou(); $("#dlg").close(); render(); aviso("Pessoa salva");
    } else {
      if (outra) { aviso("Já existe uma pessoa com esse nome."); return; }
      const p = novaPessoa(nome, setor); if (p) { p.apelidos = ap; pesMudou(); } $("#dlg").close(); render(); aviso(`${nome} cadastrada`);
    }
  } else {
    let n = 0; const sets = new Set(S.cfg.setores);
    $("#pi-t").value.split("\n").slice(0, 600).forEach(ln => {
      const [a, b] = ln.split(/[;\t]/); const nome = limpaNome(a); if (!nome || pessoaPorNome(nome)) return;
      const st = limpaNome(b); if (st && !sets.has(st)) { S.cfg.setores.push(st); sets.add(st); }
      novaPessoa(nome, st); n++;
    });
    $("#dlg").close(); render(); aviso(n ? plural(n, "pessoa cadastrada", "pessoas cadastradas") : "Nenhum nome novo na lista");
  }
});
