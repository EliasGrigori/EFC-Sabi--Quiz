/* ===== v1.6.0 parte 2 · Fatia C: peças no padrão da família EFC =====
   Lista retrátil (escolha), aviso que entra e sai, Início "o que pede atenção". Janelas e gaveta são só CSS (pecas.css). */

/* ---------- lista retrátil: troca as fileiras de botões de escolha (Ajustes: tema, telão, som; Aplicar: formato) ----------
   As opções levam o mesmo data-act e data-v de antes: quem tratava o clique continua tratando. */
function escolha(o) {
  const at = o.ops.find(x => x.v === o.valor) || o.ops[0];
  const tx = (x, grande) => `${x.icone ? `<span class="esc-ic">${ic(x.icone)}</span>` : ""}<span class="esc-tx"><b>${esc(x.nome)}</b>${grande && x.desc ? `<small>${esc(x.desc)}</small>` : ""}</span>`;
  return `<div class="esc${o.grande ? " esc-g" : ""}">
    <button type="button" class="b esc-bt" id="${o.id}" data-act="escabre" aria-haspopup="listbox" aria-expanded="false" aria-controls="${o.id}-l" aria-label="${esc(o.rotulo)}: ${esc(at.nome)}">${tx(at, o.grande)}<svg class="i esc-sv" aria-hidden="true"><use href="#i-chevd"/></svg></button>
    <div class="esc-l t-dropdown" id="${o.id}-l" role="listbox" aria-label="${esc(o.rotulo)}">${o.ops.map(x => `<button type="button" role="option" class="esc-op" data-act="${o.act}" data-v="${x.v}" ${o.attrs || ""} aria-selected="${x.v === o.valor}"${x.dis ? " disabled aria-disabled=\"true\"" : ""}>${tx(x, true)}<svg class="i esc-ok" aria-hidden="true"><use href="#i-check"/></svg></button>`).join("")}</div></div>`;
}
let escAberta = null;
function escFecha(imediato, voltaFoco) {
  const l = escAberta; if (!l) return false; escAberta = null;
  const bt = document.querySelector(`[aria-controls="${l.id}"]`); if (bt) bt.setAttribute("aria-expanded", "false");
  l.classList.remove("is-open");
  if (!imediato && !Mov.reduzido()) { l.classList.add("is-closing"); setTimeout(() => l.classList.remove("is-closing"), 150); }
  if (voltaFoco && bt) bt.focus({preventScroll: true});
  return true;
}
function escAbre(bt) {
  const l = document.getElementById(bt.getAttribute("aria-controls")); if (!l) return;
  if (escAberta === l) { escFecha(false, true); return; }
  escFecha(true);
  /* abre para cima quando não cabe embaixo */
  const r = bt.getBoundingClientRect(), alto = Math.min(l.scrollHeight || 240, 360), raiz = bt.closest(".body") || document.documentElement;
  const fundo = raiz.getBoundingClientRect().bottom;
  l.dataset.origin = r.bottom + alto + 8 > fundo && r.top - alto - 8 > raiz.getBoundingClientRect().top ? "bottom-left" : "top-left";
  l.classList.remove("is-closing"); l.classList.add("is-open"); bt.setAttribute("aria-expanded", "true"); escAberta = l;
  const sel = l.querySelector('[aria-selected="true"]') || l.querySelector(".esc-op"); sel && sel.focus({preventScroll: true});
}
document.addEventListener("click", e => {
  const ab = e.target.closest('[data-act="escabre"]');
  if (ab) { e.preventDefault(); escAbre(ab); return; }
  if (escAberta && !e.target.closest(".esc-l")) escFecha();
  else if (escAberta && e.target.closest(".esc-op")) {
    const id = escAberta.id.replace(/-l$/, "");
    setTimeout(() => { escFecha(); const b = document.getElementById(id); if (b && (document.activeElement === document.body || !document.activeElement)) b.focus({preventScroll: true}); }, 0);   /* depois de quem trata a escolha; a tela pode ter sido refeita */
  }
});
document.addEventListener("keydown", e => {
  if (escAberta && !escAberta.isConnected) escAberta = null;   /* a tela foi refeita sem clique (voltar, atalho) */
  if (!escAberta) return;
  if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); escFecha(false, true); return; }
  if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
    const ops = [...escAberta.querySelectorAll(".esc-op")], i = ops.indexOf(document.activeElement);
    const n = e.key === "Home" ? 0 : e.key === "End" ? ops.length - 1 : e.key === "ArrowDown" ? Math.min(ops.length - 1, i + 1) : Math.max(0, i - 1);
    e.preventDefault(); ops[n] && ops[n].focus();
  } else if (e.key === "Tab") escFecha(true);
}, true);

/* ---------- aviso (a faixa de baixo): entra subindo e saindo do desfoque, sai do mesmo jeito (substitui o aviso() antigo) ---------- */
/* v1.6.0 parte 3: quem chama diz o tipo ("ok" = deu certo, "erro" = deu errado, nada = só informa); nada é adivinhado pelas palavras.
   O papel para o leitor de tela muda antes do texto entrar, para ele anunciar do jeito certo. */
const AV_ICO = {
  ok: '<span class="av-vs t-success-check" data-state="out" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>',
  erro: '<span class="av-er" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.6v.1"/></svg></span>'
};
function aviso(msg, acao, fn, tipo) {
  const el = $("#toast"); clearTimeout(tToast); clearTimeout(el._sai);
  tipo = tipo === "ok" || tipo === "erro" ? tipo : "";
  el.setAttribute("role", tipo === "erro" ? "alert" : "status"); el.setAttribute("aria-live", tipo === "erro" ? "assertive" : "polite");
  el.dataset.tipo = tipo;
  el.innerHTML = `${AV_ICO[tipo] || ""}<span>${esc(msg)}</span>${acao ? `<button type="button" id="tAcao">${esc(acao)}</button>` : ""}`;
  const novo = el.hidden; el.hidden = false; el.classList.add("t-toast");
  if (novo) { el.classList.remove("is-open"); el.getBoundingClientRect(); }
  el.classList.add("is-open");
  const some = () => { el.classList.remove("is-open"); el._sai = setTimeout(() => { el.hidden = true; }, Mov.reduzido() ? 0 : 250); };
  if (acao) $("#tAcao").onclick = () => { clearTimeout(tToast); some(); fn && fn(); };
  tToast = setTimeout(some, acao ? 3000 : 3500);
  if (typeof avisoMov === "function") avisoMov(el, tipo, novo);
}

/* ---------- Início: o que pede atenção e as últimas sessões (no lugar da lista repetida de Treinos) ---------- */
function inicioAtencao() {
  const vePend = navOk("pendencias"), P0 = vePend ? (pendencias() || {}) : {}, P = {ref: P0.ref || [], reav: P0.reav || [], val: P0.val || []}, mg = navOk("mensagens") ? novasMsgs() : 0;   /* tela sem permissão some (Colaborador) */
  const linhas = [];
  /* salas abertas ficam em "Sessões em aberto", logo ao lado: aqui não repetem */
  if (P.ref.length) linhas.push(`<button class="at-l" data-act="pndir" data-v="ref"><span class="dot cr" aria-hidden="true"></span><span class="at-t"><b>${plural(P.ref.length, "pessoa precisa", "pessoas precisam")} de reforço</b><span>Ficaram abaixo da meta</span></span><svg class="i at-sv" aria-hidden="true"><use href="#i-chevr"/></svg></button>`);
  if (P.reav.length) linhas.push(`<button class="at-l" data-act="pndir" data-v="reav"><span class="dot wa" aria-hidden="true"></span><span class="at-t"><b>${plural(P.reav.length, "reavaliação", "reavaliações")} para fazer</b><span>Medir de novo depois de 30, 60 ou 90 dias</span></span><svg class="i at-sv" aria-hidden="true"><use href="#i-chevr"/></svg></button>`);
  if (P.val.length) linhas.push(`<button class="at-l" data-act="pndir" data-v="val"><span class="dot wa" aria-hidden="true"></span><span class="at-t"><b>${plural(P.val.length, "treinamento vencendo", "treinamentos vencendo")}</b><span>Validade perto do fim ou vencida</span></span><svg class="i at-sv" aria-hidden="true"><use href="#i-chevr"/></svg></button>`);
  if (mg) linhas.push(`<a class="at-l" href="#/mensagens"><span class="dot ok" aria-hidden="true"></span><span class="at-t"><b>${plural(mg, "mensagem nova", "mensagens novas")} da turma</b><span>Elogios, sugestões, reclamações e perguntas</span></span><svg class="i at-sv" aria-hidden="true"><use href="#i-chevr"/></svg></a>`);
  const enc = S.sessoes.filter(x => x.estado === "encerrada" && x.resultado && tipoSessao(x) === "real").slice().sort((a, b) => String(b.fim).localeCompare(String(a.fim))).slice(0, 3);
  const data = f => { try { return new Date(f).toLocaleDateString("pt-BR", {day: "2-digit", month: "2-digit"}); } catch(e) { return ""; } };
  const ult = enc.map(x => { const ok = x.resultado.pct >= x.meta, pre = x.mom === "pre"; return `<a class="at-l" href="#/relatorios/${x.id}"><span class="at-t"><b>${esc(x.titulo)}</b><span>${data(x.fim)} · ${plural(x.resultado.tabela ? x.resultado.tabela.length : 0, "pessoa", "pessoas")}</span></span><span class="sit ${pre ? "" : ok ? "ok" : "cr"}">${pre ? "pré-teste · " : ""}${x.resultado.pct}%${ok || pre ? "" : " · abaixo da meta"}</span></a>`; }).join("");
  return `<section class="k mini at" aria-labelledby="h-at"><div class="kh"><h3 id="h-at">Pede atenção</h3>${linhas.length ? `<span class="chip">${linhas.length}</span>` : ""}</div>
      ${linhas.length ? `<div class="at-ls">${linhas.join("")}</div>` : `<p class="at-vz"><span class="dot ok" aria-hidden="true"></span>Tudo em dia. Nenhuma pendência nem mensagem nova.</p>`}</section>
    <section class="k mini at" aria-labelledby="h-ult"><div class="kh"><h3 id="h-ult">Últimas sessões</h3><a class="b sm g at-mais" href="#/relatorios">Ver todas</a></div>
      ${enc.length ? `<div class="at-ls">${ult}</div>` : `<p class="at-vz">Nenhuma sessão encerrada ainda. Os resultados aparecem aqui e em Relatórios.</p>`}</section>`;
}
document.addEventListener("click", e => {
  const el = e.target.closest('[data-act="pndir"]'); if (!el) return;
  PND.aba = el.dataset.v; ir("#/pendencias");
});

window.addEventListener("hashchange", () => { if (escAberta) escFecha(true); });
/* 13 · a janela (#dlg) leva o nome do seu título para o leitor de tela */
new MutationObserver(() => { const d = $("#dlg"), h = d && d.querySelector("h2"); if (!d) return; if (h) { if (!h.id) h.id = "dlg-tt"; d.setAttribute("aria-labelledby", h.id); } else d.removeAttribute("aria-labelledby"); }).observe(document.getElementById("dlg"), {childList: true});
