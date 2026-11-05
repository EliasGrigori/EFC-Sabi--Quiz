/* ===== v0.3.0 · editor de perguntas e versões ===== */
const TIPOS = {multipla: "Múltipla escolha", vf: "Verdadeiro ou falso", ordenar: "Ordenar", explicacao: "Explicação"};
const TIPOS_CURTO = {multipla: "Múltipla", vf: "V ou F", ordenar: "Ordenar", explicacao: "Explicação"};
const USOS = {avaliacao: "Vale nota", gincana: "Gincana (vale nota)", ensaio: "Teste (não vale nota)"};
const TEMPOS = [10, 15, 20, 30, 45, 60, 90, 120];
const MAX_ALT = 4, MAX_ORD = 5;
const clone = o => JSON.parse(JSON.stringify(o));
const agora = () => new Date().toISOString();
const novoItem = tipo => ({
  explicacao: {tipo: "explicacao", enunciado: "", texto: ""},
  multipla: {tipo: "multipla", enunciado: "", alternativas: ["", "", "", ""], correta: null, tempo: 20, uso: "avaliacao", porque: ""},
  vf: {tipo: "vf", enunciado: "", alternativas: ["Verdadeiro", "Falso"], correta: null, tempo: 20, uso: "avaliacao", porque: ""},
  ordenar: {tipo: "ordenar", enunciado: "", alternativas: ["", "", ""], tempo: 45, uso: "avaliacao", porque: ""}
}[tipo]);

/* ---------- conferência de cada pergunta ---------- */
function problemasItem(it) {
  const p = [];
  if (!String(it.enunciado || "").trim()) p.push("Falta o enunciado");
  if (it.tipo === "multipla") {
    const a = it.alternativas || [];
    if (a.some(x => !String(x).trim())) p.push("Há alternativa em branco");
    if (!Number.isInteger(it.correta) || it.correta < 0 || it.correta >= a.length) p.push("Marque a resposta certa");
  } else if (it.tipo === "vf") {
    if (!Number.isInteger(it.correta) || it.correta < 0 || it.correta > 1) p.push("Marque verdadeiro ou falso");
  } else if (it.tipo === "ordenar") {
    const a = it.alternativas || [];
    if (a.length < 3) p.push("Use pelo menos 3 passos");
    if (a.some(x => !String(x).trim())) p.push("Há passo em branco");
  }
  return p;
}
const problemasTreino = t => t.itens.map((it, i) => ({i, m: problemasItem(it)})).filter(x => x.m.length);
const numeroItem = (t, i) => { const it = t.itens[i]; if (it.tipo === "explicacao") return "E"; if (it.uso === "ensaio") return "T"; return String(t.itens.slice(0, i + 1).filter(x => x.tipo !== "explicacao" && x.uso !== "ensaio").length); };

/* ---------- versões ---------- */
function garantirSnap(t) {
  const v = (t.versoes || []).find(x => x.n === t.versao);
  if (v && !v.itens && !t.sujo) { v.itens = clone(t.itens); v.titulo = t.titulo; v.meta = t.meta; v.metaTipo = t.metaTipo; }
}
function editou(t) { garantirSnap(t); t.sujo = true; t.atualizado = agora(); salvar(); }
function salvarVersao(t, nota) {
  garantirSnap(t);
  const n = (t.versoes || []).reduce((m, x) => Math.max(m, x.n), -1) + 1;
  t.versoes.push({n, nota: nota || "Ajustes nas perguntas", quando: agora(), titulo: t.titulo, meta: t.meta, metaTipo: t.metaTipo, itens: clone(t.itens)});
  t.versao = n; t.sujo = false; salvar(); return n;
}
function fixarVersao(t) { if (t.sujo) salvarVersao(t, "Fixada ao aplicar"); }
const chaveItem = i => String(i.enunciado || "").trim().toLowerCase();
function difVersao(v, t) {
  const a = v.itens || [], b = t.itens, ma = new Map(a.map(i => [chaveItem(i), i])), mb = new Map(b.map(i => [chaveItem(i), i]));
  let novas = b.filter(i => !ma.has(chaveItem(i))), removidas = a.filter(i => !mb.has(chaveItem(i)));
  const alteradas = b.filter(i => ma.has(chaveItem(i)) && JSON.stringify(ma.get(chaveItem(i))) !== JSON.stringify(i));
  /* pergunta que só mudou o enunciado, na mesma posição e formato, conta como alterada e não como nova + removida */
  b.forEach((i, k) => { const o = a[k]; if (o && novas.includes(i) && removidas.includes(o) && o.tipo === i.tipo) { novas = novas.filter(x => x !== i); removidas = removidas.filter(x => x !== o); alteradas.push(i); } });
  const mesmas = !novas.length && !removidas.length;
  const reordenou = mesmas && a.length === b.length && a.some((i, k) => chaveItem(i) !== chaveItem(b[k]));
  return {novas, removidas, alteradas, reordenou, titulo: v.titulo !== undefined && v.titulo !== t.titulo, meta: v.meta !== undefined && (v.meta !== t.meta || (v.metaTipo || "pct") !== (t.metaTipo || "pct")), igual: mesmas && !alteradas.length && !reordenou && !(v.titulo !== undefined && v.titulo !== t.titulo) && !(v.meta !== undefined && (v.meta !== t.meta || (v.metaTipo || "pct") !== (t.metaTipo || "pct")))};
}
const curto = (s, n = 70) => { s = String(s || "(sem enunciado)"); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
function difHTML(d, v, t) {
  if (d.igual) return `<div class="df"><span>Igual ao rascunho atual.</span></div>`;
  const li = (c, s, l) => l.map(i => `<div class="${c}"><i>${s}</i><span>${esc(curto(i.enunciado))}</span></div>`).join("");
  return `<div class="df">${li("ad", "+", d.novas)}${li("rm", "−", d.removidas)}${li("ch", "~", d.alteradas)}${d.reordenou ? `<div class="ch"><i>~</i><span>Ordem das perguntas mudou</span></div>` : ""}${d.titulo ? `<div class="ch"><i>~</i><span>Título era "${esc(curto(v.titulo, 50))}"</span></div>` : ""}${d.meta ? `<div class="ch"><i>~</i><span>Meta era ${metaTxt({meta: v.meta, metaTipo: v.metaTipo})}</span></div>` : ""}<span class="mut">Comparado com o rascunho atual. + nova, − removida, ~ alterada.</span></div>`;
}
function dlgVersoes() {
  const t = treino(UI.ed && UI.ed.id); if (!t) return;
  garantirSnap(t);
  const d = $("#dlg"), prox = (t.versoes || []).reduce((m, x) => Math.max(m, x.n), -1) + 1;
  const vs = (t.versoes || []).slice().sort((a, b) => b.n - a.n);
  const p2 = n => "v" + String(n).padStart(2, "0");
  d.innerHTML = `<div class="dl"><header><h2>Versões</h2><button class="b ic g" data-act="fechar" aria-label="Fechar">${ic("x")}</button></header>
    <p class="sm mut" style="margin:0">${esc(t.titulo)} · versão atual ${p2(t.versao)}${t.sujo ? " · com alterações ainda sem versão" : ""}</p>
    <form class="vs" data-form="versao"><div class="fd"><label for="v-nota">Nota da versão (opcional)</label><input class="in" id="v-nota" maxlength="80" placeholder="Ex.: troquei a pergunta 3" ${t.sujo ? "" : "disabled"}></div><button class="b p" type="submit" ${t.sujo ? "" : "disabled"}>${ic("check")}Salvar ${p2(prox)}</button></form>
    ${t.sujo ? "" : `<p class="sm mut" style="margin:0">Sem alterações desde a ${p2(t.versao)}.</p>`}
    <div class="vl">${vs.map(v => {
      const tem = !!v.itens, atual = v.n === t.versao, nq = tem ? v.itens.filter(i => i.tipo !== "explicacao").length : null;
      return `<div class="vr" data-v="${v.n}"><div class="vh"><b class="num">${p2(v.n)}</b><span class="sm mut">${dm(v.quando)} ${new Date(v.quando).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})}${tem ? " · " + nq + " pergunta" + (nq === 1 ? "" : "s") : ""}</span>${atual ? `<span class="chip ok">atual</span>` : ""}<span class="grow"></span>
        <button class="b sm" data-act="verscmp" data-n="${v.n}" ${tem ? "" : "disabled"}>Comparar</button><button class="b sm" data-act="versrest" data-n="${v.n}" ${tem && !(atual && !t.sujo) ? "" : "disabled"}>Restaurar</button></div>
        <div class="nt">${esc(v.nota || "")}${tem ? "" : " (sem cópia das perguntas)"}</div>${UI.cmp === v.n && tem ? difHTML(difVersao(v, t), v, t) : ""}</div>`;
    }).join("")}</div>
    <p class="dica">Restaurar traz a versão para o rascunho. Para guardar, salve como nova versão.</p></div>`;
  if (!d.open) d.showModal();
}

/* ---------- tela do editor ---------- */
function vEditar(id) {
  const t = treino(id); if (!t) { ir("#/treinos"); return; }
  garantirSnap(t);
  if (!UI.ed || UI.ed.id !== id) UI.ed = {id, sel: 0, prev: "pergunta"};
  UI.ed.sel = Math.max(0, Math.min(UI.ed.sel, t.itens.length - 1));
  topo(t.titulo || "Treinamento", "", "", "#/treinos");
  $("#app").className = "body";
  $("#app").innerHTML = `<div class="edit">
    <div class="edl">
      <section class="k ed-meta">
        <div class="fd full"><label for="et-titulo">Título</label><input class="in" id="et-titulo" data-et="titulo" maxlength="120" value="${esc(t.titulo)}"></div>
        <div class="fd"><label for="et-desc">Descrição</label><input class="in" id="et-desc" data-et="descricao" maxlength="400" value="${esc(t.descricao || "")}" placeholder="Opcional"></div>
        ${metaCampoHtml(t)}
        <div class="fd full"><label for="et-per">Validade do treinamento</label><select class="in" id="et-per">${VALIDADES.map(([d, n]) => `<option value="${d}" ${(t.per || 0) === d ? "selected" : ""}>${n}</option>`).join("")}</select><span class="sm mut">Depois desse prazo a pessoa aparece em Pendências para renovar.</span></div>
        <div class="fd full"><span class="lbl" id="et-rv-l">Reavaliar depois de</span><div class="chips" role="group" aria-labelledby="et-rv-l">${REAV_DIAS.map(d => `<button type="button" class="sc" data-act="edreav" data-d="${d}" aria-pressed="${(t.reav || []).includes(d)}">${d} dias</button>`).join("")}</div><span class="sm mut">Quem passou aparece em Pendências 14 dias antes de cada prazo, para medir o que ficou.</span></div>
      </section>
      ${iaAviso(t)}
      <section class="k" id="obs-box" style="display:grid;gap:8px;padding:10px 10px 12px">${obsHtml(t)}</section>
      <section class="k" style="display:grid;gap:8px;padding:10px 10px 12px"><div class="lbl" style="padding:0 4px">Perguntas</div><div class="qlist" id="edLista"></div><div class="stt" id="edSt"></div>
        <div class="adds">${["multipla", "vf", "ordenar", "explicacao"].map(k => `<button class="b" data-act="edadd" data-v="${k}">${ic("plus", 'style="width:16px;height:16px"')}${TIPOS_CURTO[k]}</button>`).join("")}</div>
        <button class="b" data-act="bnabrir" style="justify-self:start">${ic("book", 'style="width:16px;height:16px"')}Inserir do banco de perguntas</button></section>
    </div>
    <div class="edc" id="edCentro"></div>
    <aside class="edr" id="edDir"></aside></div>`;
  pintaTudo();
}
function pintaTudo() { pintaTopo(); pintaLista(); pintaCentro(); pintaPrev(); }
function pintaTopo() {
  const t = treino(UI.ed.id); if (!t) return;
  const v = "v" + String(t.versao).padStart(2, "0");
  topo(t.titulo || "Sem título", `${t.itens.filter(i => i.tipo !== "explicacao").length} perguntas · ${v}${t.sujo ? " · alterações sem versão" : " · versão salva"}`,
    `<button class="b" data-act="painel" aria-label="Painel do treinamento">${ic("chart")}<span class="lbl-m">Painel</span></button><button class="b" data-act="versoes" aria-label="Versões">${ic("clock")}<span class="lbl-m">Versões</span></button><a class="b p" href="#/aplicar/${t.id}" aria-label="Aplicar" ${t.itens.some(i => i.tipo !== "explicacao") ? "" : 'aria-disabled="true" style="opacity:.5;pointer-events:none"'}>${ic("play")}<span class="lbl-m">Aplicar</span></a>`, "#/treinos");
}
function pintaLista() {
  const t = treino(UI.ed.id), el = $("#edLista"); if (!t || !el) return;
  el.innerHTML = t.itens.length ? t.itens.map((it, i) => {
    const pr = problemasItem(it), sel = i === UI.ed.sel;
    return `<button class="qi" data-act="edsel" data-i="${i}" ${sel ? 'aria-current="true"' : ""}><span class="qn">${numeroItem(t, i)}</span><span class="qt"><b>${esc(it.enunciado || "Sem enunciado")}</b><span>${TIPOS_CURTO[it.tipo]}${it.tipo !== "explicacao" ? " · " + (it.tempo || 20) + " s" : ""}${it.uso === "ensaio" ? " · teste" : ""}</span></span>${pr.length ? `<span class="qw" title="${esc(pr.join(". "))}">${ic("warn", 'style="width:18px;height:18px"')}<span class="sr">${pr.length} ponto(s) a revisar</span></span>` : ""}</button>`;
  }).join("") : `<span class="sm mut" style="padding:6px 4px">Nenhuma pergunta ainda.</span>`;
  const pt = problemasTreino(t), nq = t.itens.filter(i => i.tipo !== "explicacao").length;
  $("#edSt").innerHTML = t.itens.length ? (pt.length ? `<span class="chip warn">${pt.length} para revisar</span>` : (nq ? `<span class="chip ok">Pronto para aplicar</span>` : `<span class="chip warn">Só explicações</span>`)) + `<span>${nq} pergunta${nq === 1 ? "" : "s"}</span>` : "";
  const ac = el.querySelector('[aria-current="true"]'); if (ac && ac.scrollIntoView && el.scrollHeight > el.clientHeight) ac.scrollIntoView({block: "nearest"});
}
function altLinha(it, k) {
  const a = it.alternativas[k], tp = it.tipo;
  const shape = `<span class="shp" style="background:${COR_ALT[k % 4]}"><svg viewBox="0 0 24 24" aria-hidden="true">${FORMAS[k % 4]}</svg></span>`;
  const radio = `<label class="rd" title="Marcar como certa"><input type="radio" name="cor" data-e="correta" value="${k}" ${it.correta === k ? "checked" : ""} aria-label="Marcar a alternativa ${"ABCD"[k]} como certa"></label>`;
  if (tp === "vf") return `<div class="alt v">${radio}${shape}<span class="vfx">${esc(a)}</span></div>`;
  if (tp === "ordenar") return `<div class="alt o"><span class="qn">${k + 1}</span><input class="in" data-ealt="${k}" maxlength="200" value="${esc(a)}" placeholder="Passo ${k + 1}" aria-label="Passo ${k + 1}">
    <button class="b ic g" data-act="altup" data-k="${k}" aria-label="Subir passo ${k + 1}" ${k === 0 ? "disabled" : ""}>${ic("up")}</button><button class="b ic g" data-act="altdown" data-k="${k}" aria-label="Descer passo ${k + 1}" ${k === it.alternativas.length - 1 ? "disabled" : ""}>${ic("down")}</button>
    <button class="b ic g bad" data-act="altdel" data-k="${k}" aria-label="Remover passo ${k + 1}" ${it.alternativas.length <= 3 ? "disabled" : ""}>${ic("x")}</button></div>`;
  return `<div class="alt">${radio}${shape}<input class="in" data-ealt="${k}" maxlength="200" value="${esc(a)}" placeholder="Alternativa ${"ABCD"[k]}" aria-label="Alternativa ${"ABCD"[k]}"><button class="b ic g bad" data-act="altdel" data-k="${k}" aria-label="Remover alternativa ${"ABCD"[k]}" ${it.alternativas.length <= 2 ? "disabled" : ""}>${ic("x")}</button></div>`;
}
function pintaCentro() {
  const t = treino(UI.ed.id), el = $("#edCentro"); if (!t || !el) return;
  if (!t.itens.length) {
    el.innerHTML = `<section class="k" style="display:grid;gap:10px"><h2 style="font-size:19px">Comece pela primeira pergunta</h2><p class="mut" style="margin:0">Escolha o formato. Dá para trocar depois.</p>
      ${["multipla", "vf", "ordenar", "explicacao"].map(k => `<button class="opcao" data-act="edadd" data-v="${k}"><span class="pic">${ic(k === "explicacao" ? "book" : "plus")}</span><span><b>${TIPOS[k]}</b><span class="d">${{multipla: "Até 4 alternativas, uma certa.", vf: "Uma afirmação para marcar verdadeiro ou falso.", ordenar: "A turma coloca os passos na ordem certa.", explicacao: "Um slide de conversa do instrutor, sem nota."}[k]}</span></span></button>`).join("")}</section>`;
    return;
  }
  const i = UI.ed.sel, it = t.itens[i], q = it.tipo !== "explicacao";
  let corpo = `<div class="fd"><label for="e-en">Enunciado</label><textarea class="in ta" id="e-en" data-e="enunciado" rows="2" maxlength="400" placeholder="${q ? "Escreva a pergunta como a turma vai ler" : "Título do assunto que o instrutor vai explicar"}">${esc(it.enunciado)}</textarea></div>`;
  if (it.tipo === "explicacao") corpo += `<div class="fd"><label for="e-tx">Texto de apoio no telão (opcional)</label><textarea class="in ta" id="e-tx" data-e="texto" rows="4" maxlength="4000" placeholder="Pontos principais, um por linha">${esc(it.texto || "")}</textarea></div>`;
  else {
    const dica = it.tipo === "ordenar" ? "Escreva os passos na ordem certa. O telão embaralha para a turma." : "Marque o círculo da resposta certa. A cor e a forma de cada alternativa aparecem no telão.";
    corpo += `<div class="alts" role="group" aria-label="Alternativas">${it.alternativas.map((_, k) => altLinha(it, k)).join("")}</div>
      ${(it.tipo === "multipla" && it.alternativas.length < MAX_ALT) || (it.tipo === "ordenar" && it.alternativas.length < MAX_ORD) ? `<button class="b sm" style="justify-self:start" data-act="altadd">${ic("plus", 'style="width:16px;height:16px"')}Adicionar ${it.tipo === "ordenar" ? "passo" : "alternativa"}</button>` : ""}<p class="dica">${dica}</p>
      <div class="row2"><div class="fd"><label for="e-tp">Tempo para responder</label><select class="in" id="e-tp" data-e="tempo">${TEMPOS.concat(TEMPOS.includes(it.tempo) ? [] : [it.tempo]).sort((a, b) => a - b).map(x => `<option value="${x}" ${x === it.tempo ? "selected" : ""}>${x >= 60 ? (x / 60) + " min" : x + " s"}</option>`).join("")}</select></div>
      <div class="fd"><label for="e-us">Como conta</label><select class="in" id="e-us" data-e="uso">${Object.entries(USOS).map(([k, v]) => `<option value="${k}" ${it.uso === k ? "selected" : ""}>${v}</option>`).join("")}</select></div></div>
      <div class="fd"><label for="e-po">Por que está certa (aparece depois da resposta)</label><textarea class="in ta" id="e-po" data-e="porque" rows="2" maxlength="600" placeholder="Explique em uma ou duas frases">${esc(it.porque || "")}</textarea></div>`;
  }
  el.innerHTML = `<section class="k" style="display:grid;gap:12px">
    <div class="edh"><h2>${it.tipo === "explicacao" ? "Explicação" : (it.uso === "ensaio" ? "Pergunta de teste" : "Pergunta " + numeroItem(t, i))}</h2>
      <button class="b ic g" data-act="edup" aria-label="Mover para cima" title="Mover para cima" ${i === 0 ? "disabled" : ""}>${ic("up")}</button><button class="b ic g" data-act="eddown" aria-label="Mover para baixo" title="Mover para baixo" ${i === t.itens.length - 1 ? "disabled" : ""}>${ic("down")}</button>
      <button class="b ic g" data-act="eddup" aria-label="Duplicar pergunta" title="Duplicar">${ic("copy")}</button><button class="b ic g" data-act="bnguardar" aria-label="Guardar no banco de perguntas" title="Guardar no banco">${ic("book")}</button><button class="b ic g bad" data-act="eddel" aria-label="Excluir pergunta" title="Excluir">${ic("trash")}</button></div>
    <div class="seg" role="group" aria-label="Formato">${["multipla", "vf", "ordenar", "explicacao"].map(k => `<button type="button" data-act="edtipo" data-v="${k}" aria-pressed="${it.tipo === k}">${TIPOS_CURTO[k]}</button>`).join("")}</div>
    <div class="avs" id="edAv"></div>${corpo}${vozHtml(it)}</section>`;
  pintaAvisos();
}
function pintaAvisos() {
  const t = treino(UI.ed.id), el = $("#edAv"); if (!t || !el) return; const it = t.itens[UI.ed.sel]; if (!it) return;
  el.innerHTML = problemasItem(it).map(m => `<span class="chip warn">${ic("warn", 'style="width:14px;height:14px"')}${esc(m)}</span>`).join("");
}
function snapPrev(t, i, modo) {
  const it = t.itens[i], qs = t.itens.filter(x => x.tipo !== "explicacao"), q = it.tipo !== "explicacao", rev = q && modo === "resultado";
  const alts = (it.alternativas || []).map(a => String(a).trim() || "…"), n = alts.length, ok = Number.isInteger(it.correta) ? it.correta : -1;
  let dist = null;
  if (rev) dist = it.tipo === "ordenar" ? {acertos: 7, total: 10} : alts.map((_, k) => ok < 0 ? Math.round(10 / n) : (k === ok ? 6 : Math.floor(4 / (n - 1)) + (k === (ok === 0 ? 1 : 0) ? 4 % (n - 1) : 0)));
  return {id: "prev", chave: "482915", titulo: t.titulo || "Treinamento", instrutor: S.cfg.instrutor || "", meta: t.meta, tela: S.cfg.telao || "escuro", metaTxt: metaTxt(t), som: "desligado", ranking: true, entrada: true,
    fase: {etapa: !q ? "explicacao" : (rev ? "resultado" : "pergunta"), idx: i, t0: 0, dur: 0}, min: 5, nPart: 12, part: [], nPerg: qs.length, totalPerg: qs.length, numPerg: q ? qs.indexOf(it) + 1 : 0, resp: rev ? 10 : 0, dist, url: "",
    item: {tipo: it.tipo, enunciado: it.enunciado || (q ? "Escreva o enunciado da pergunta" : "Título da explicação"), texto: it.texto || "", alts, ordem: it.tipo === "ordenar" ? embaralhado(n, i) : null, correta: rev && ok >= 0 ? ok : null, porque: rev ? (it.porque || "") : "", ensaio: it.uso === "ensaio", voz: audioOk(it.audio) ? it.audio : ""}};
}
function resumoTreino(t) {
  const r = roteiro(t), vale = t.itens.filter(i => i.tipo !== "explicacao" && i.uso !== "ensaio").length, teste = t.itens.filter(i => i.uso === "ensaio").length, ex = t.itens.filter(i => i.tipo === "explicacao").length, pr = problemasTreino(t).length;
  return `<section class="k rsm"><div><b>${vale}</b><span>valem nota</span></div><div><b>${r.min} min</b><span>de duração</span></div><div><b>${metaTxt(t)}</b><span>de meta</span></div><div><b>${ex}</b><span>explicaç${ex === 1 ? "ão" : "ões"}</span></div><div><b>${teste}</b><span>de teste</span></div><div class="${pr ? "w" : ""}"><b>${pr}</b><span>a revisar</span></div></section>`;
}
function pintaPrev() {
  const t = treino(UI.ed.id), el = $("#edDir"); if (!t || !el) return;
  if (!t.itens.length) { el.innerHTML = `<section class="k"><p class="pvn" style="margin:0">A prévia do telão aparece aqui quando houver uma pergunta.</p></section>`; return; }
  const it = t.itens[UI.ed.sel], q = it.tipo !== "explicacao";
  const modo = q ? UI.ed.prev : "pergunta";
  el.innerHTML = `<section class="k" style="display:grid;gap:8px"><div class="pvh"><b>Como aparece no telão</b>${q ? `<div class="seg" role="group" aria-label="Momento"><button type="button" data-act="edprev" data-v="pergunta" aria-pressed="${modo === "pergunta"}">Pergunta</button><button type="button" data-act="edprev" data-v="resultado" aria-pressed="${modo === "resultado"}">Resultado</button></div>` : ""}</div>
    <div class="telwrap" id="edTel">${telaoHTML(snapPrev(t, UI.ed.sel, modo))}</div><p class="pvn">Prévia com 12 pessoas de exemplo. A resposta certa só aparece no Resultado.</p></section>${resumoTreino(t)}`;
  escalar();
}

/* ---------- ações ---------- */
function comUndo(t, msg, fn) {
  const antes = JSON.stringify({itens: t.itens, sel: UI.ed.sel, sujo: t.sujo});
  editou(t); fn(); salvar();
  aviso(msg, "Desfazer", () => { const o = JSON.parse(antes); t.itens = o.itens; UI.ed.sel = o.sel; t.sujo = o.sujo; salvar(); if (rota().v === "editar") pintaTudo(); });
}
function trocarTipo(it, tipo) {
  const base = novoItem(tipo), vel = it.alternativas || [];
  const r = Object.assign({}, base, {enunciado: it.enunciado || "", texto: it.texto || ""});
  if (tipo !== "explicacao") { r.tempo = it.tempo || base.tempo; r.uso = it.uso || "avaliacao"; r.porque = it.porque || ""; }
  if (tipo === "multipla") { const f = vel.filter(x => String(x).trim()); if (f.length >= 2 && it.tipo !== "ordenar") { r.alternativas = vel.slice(0, MAX_ALT); while (r.alternativas.length < 2) r.alternativas.push(""); r.correta = Number.isInteger(it.correta) && it.correta < r.alternativas.length ? it.correta : null; } }
  if (tipo === "vf" && it.tipo === "multipla" && Number.isInteger(it.correta) && it.correta < 2) r.correta = it.correta;
  if (tipo === "ordenar" && it.tipo === "multipla") { r.alternativas = vel.slice(0, MAX_ORD); while (r.alternativas.length < 3) r.alternativas.push(""); }
  if (tipo === "ordenar") delete r.correta;
  return r;
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v;
  if (!["edsel", "edtipo", "edadd", "edup", "eddown", "eddup", "eddel", "altadd", "altdel", "altup", "altdown", "edprev", "versoes", "verscmp", "versrest"].includes(a)) return;
  const t = treino(UI.ed && UI.ed.id); if (!t) return;
  const i = UI.ed.sel, it = t.itens[i], k = Number(el.dataset.k);
  if (a === "edsel") { UI.ed.sel = Number(el.dataset.i); pintaLista(); pintaCentro(); pintaPrev(); }
  else if (a === "edprev") { UI.ed.prev = v; pintaPrev(); }
  else if (a === "edadd") { editou(t); t.itens.push(novoItem(v)); UI.ed.sel = t.itens.length - 1; pintaTudo(); const f = $("#e-en"); if (f) f.focus(); }
  else if (a === "edtipo") { if (it.tipo === v) return; comUndo(t, "Formato trocado", () => { t.itens[i] = trocarTipo(it, v); }); pintaTudo(); }
  else if (a === "edup" || a === "eddown") { const j = a === "edup" ? i - 1 : i + 1; if (j < 0 || j >= t.itens.length) return; editou(t); [t.itens[i], t.itens[j]] = [t.itens[j], t.itens[i]]; UI.ed.sel = j; pintaTudo(); const b = $(`[data-act="${a}"]`); if (b && !b.disabled) b.focus(); }
  else if (a === "eddup") { editou(t); const c = clone(it); t.itens.splice(i + 1, 0, c); UI.ed.sel = i + 1; pintaTudo(); aviso("Pergunta duplicada"); }
  else if (a === "eddel") { comUndo(t, "Pergunta excluída", () => { t.itens.splice(i, 1); UI.ed.sel = Math.min(i, t.itens.length - 1); }); pintaTudo(); }
  else if (a === "altadd") { editou(t); it.alternativas.push(""); pintaCentro(); pintaLista(); pintaPrev(); const f = $(`[data-ealt="${it.alternativas.length - 1}"]`); if (f) f.focus(); }
  else if (a === "altdel") {
    const min = it.tipo === "ordenar" ? 3 : 2; if (it.alternativas.length <= min) return;
    editou(t); it.alternativas.splice(k, 1);
    if (it.tipo === "multipla") { if (it.correta === k) it.correta = null; else if (Number.isInteger(it.correta) && it.correta > k) it.correta--; }
    pintaCentro(); pintaLista(); pintaPrev();
  }
  else if (a === "altup" || a === "altdown") { const j = a === "altup" ? k - 1 : k + 1; if (j < 0 || j >= it.alternativas.length) return; editou(t); [it.alternativas[k], it.alternativas[j]] = [it.alternativas[j], it.alternativas[k]]; pintaCentro(); pintaPrev(); const b = $(`[data-act="${a}"][data-k="${j}"]`); if (b) b.focus(); }
  else if (a === "versoes") { UI.cmp = null; dlgVersoes(); }
  else if (a === "verscmp") { const n = Number(el.dataset.n); UI.cmp = UI.cmp === n ? null : n; dlgVersoes(); }
  else if (a === "versrest") {
    const n = Number(el.dataset.n), ver = t.versoes.find(x => x.n === n); if (!ver || !ver.itens) return;
    const antes = JSON.stringify({itens: t.itens, titulo: t.titulo, meta: t.meta, metaTipo: t.metaTipo || "pct", sujo: t.sujo});
    t.itens = clone(ver.itens); if (ver.titulo !== undefined) t.titulo = ver.titulo; if (ver.meta !== undefined) { t.meta = ver.meta; if (ver.metaTipo === "pts") t.metaTipo = "pts"; else delete t.metaTipo; }
    t.sujo = n !== t.versao; t.atualizado = agora(); UI.ed.sel = 0; UI.cmp = null; salvar();
    $("#dlg").close(); render();
    aviso(`v${String(n).padStart(2, "0")} trazida para o rascunho`, "Desfazer", () => { const o = JSON.parse(antes); Object.assign(t, o); salvar(); if (rota().v === "editar") render(); });
  }
});
document.addEventListener("input", e => {
  const x = e.target; if (rota().v !== "editar" || !UI.ed) return;
  const t = treino(UI.ed.id); if (!t) return;
  if (x.dataset.et) {
    const f = x.dataset.et; editou(t);
    if (f === "meta") { const m = Math.round(Number(x.value)); if (metaValida(t, m)) t.meta = m; }
    else if (f === "metaTipo") trocarMetaTipo(t, x.value);
    else t[f] = x.value;
    if (f === "titulo") pintaTopo(); else if (f === "meta" || f === "metaTipo") { metaRepinta(t, f === "metaTipo"); pintaPrev(); }
  } else if (x.dataset.ealt !== undefined) {
    const it = t.itens[UI.ed.sel]; if (!it) return; editou(t); it.alternativas[Number(x.dataset.ealt)] = x.value; pintaLista(); pintaAvisos(); pintaPrev();
  } else if (x.dataset.e && x.tagName !== "SELECT" && x.type !== "radio") {
    const it = t.itens[UI.ed.sel]; if (!it) return; editou(t); it[x.dataset.e] = x.value; pintaLista(); pintaAvisos(); pintaPrev();
  }
});
document.addEventListener("change", e => {
  const x = e.target; if (rota().v !== "editar" || !UI.ed || !x.dataset.e) return;
  const t = treino(UI.ed.id), it = t && t.itens[UI.ed.sel]; if (!it) return;
  if (x.type === "radio") { editou(t); it.correta = Number(x.value); }
  else if (x.tagName === "SELECT") { editou(t); it[x.dataset.e] = x.dataset.e === "tempo" ? Number(x.value) : x.value; if (x.dataset.e === "uso") pintaCentro(); }
  else return;
  pintaTopo(); pintaLista(); pintaAvisos(); pintaPrev();
});
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form='versao']"); if (!f) return; e.preventDefault();
  const t = treino(UI.ed && UI.ed.id); if (!t || !t.sujo) return;
  const n = salvarVersao(t, $("#v-nota").value.trim()); UI.cmp = null; $("#dlg").close(); pintaTopo(); aviso(`Versão v${String(n).padStart(2, "0")} salva`);
});
