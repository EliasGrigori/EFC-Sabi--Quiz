/* ===== v1.2.0 · meta em pontos (ou em %) ===== */
/* A meta em pontos conta só os pontos de acerto: 1.000 por pergunta certa, sem o bônus de rapidez.
   A sessão guarda a meta já convertida em % (s.meta), então todos os cálculos de "atingiu a meta" continuam iguais. */
const PTS_ACERTO = 1000, PTS_MAX = 100000;
const metaPts = t => !!t && t.metaTipo === "pts";
const fmtPts = n => Number(n).toLocaleString("pt-BR");
const metaTxt = t => metaPts(t) ? fmtPts(t.meta) + " pontos" : t.meta + "%";
const metaTxtS = s => s.metaTipo === "pts" && s.metaPts ? fmtPts(s.metaPts) + " pontos" : s.meta + "%";
const metaMax = (t, itens) => PTS_ACERTO * (itens || t.itens).filter(vale).length;
/* % equivalente de uma meta em pontos: quem acerta ac perguntas tem pct = round(100*ac/nq), e isso passa da meta se e só se ac*1000 >= pontos */
function metaEq(t, itens) {
  if (!metaPts(t)) return t.meta;
  const nq = (itens || t.itens).filter(vale).length;
  return nq ? Math.min(100, Math.max(1, Math.round(100 * t.meta / (PTS_ACERTO * nq)))) : 100;
}
function trocarMetaTipo(t, tipo) {
  const max = metaMax(t);
  if (tipo === "pts" && !metaPts(t)) { t.metaTipo = "pts"; t.meta = Math.max(PTS_ACERTO, Math.round(max * t.meta / 100 / PTS_ACERTO) * PTS_ACERTO); }
  else if (tipo !== "pts" && metaPts(t)) { delete t.metaTipo; t.meta = max ? Math.min(100, Math.max(1, Math.round(100 * t.meta / max))) : 80; }
}
function metaAjuda(t) {
  if (!metaPts(t)) return "Percentual de acertos que cada pessoa precisa ter.";
  const max = metaMax(t), nq = max / PTS_ACERTO;
  if (!nq) return "Cada acerto vale 1.000 pontos. O bônus de rapidez não conta para a meta. Adicione perguntas para ver o máximo.";
  return `Cada acerto vale 1.000 pontos e o bônus de rapidez não conta. Máximo deste treinamento: ${fmtPts(max)} pontos (${nq} pergunta${nq === 1 ? "" : "s"}), então a meta pede ${Math.ceil(t.meta / PTS_ACERTO)} acerto${Math.ceil(t.meta / PTS_ACERTO) === 1 ? "" : "s"}.` + (t.meta > max ? " A meta passa do máximo: ninguém vai atingir." : "");
}
function metaCampoHtml(t) {
  const p = metaPts(t);
  return `<div class="fd full"><label for="et-meta">Meta</label><div class="mt-ln"><input class="in" id="et-meta" data-et="meta" type="number" min="${p ? PTS_ACERTO : 1}" max="${p ? PTS_MAX : 100}" step="${p ? PTS_ACERTO : 1}" inputmode="numeric" value="${t.meta}"><select class="in" id="et-mt" data-et="metaTipo" aria-label="Tipo de meta"><option value="pct" ${p ? "" : "selected"}>% de acertos</option><option value="pts" ${p ? "selected" : ""}>pontos</option></select></div><span class="sm mut" id="et-mta" aria-live="polite">${metaAjuda(t)}</span></div>`;
}
function metaRepinta(t, trocou) {
  const a = $("#et-mta"); if (a) { a.textContent = metaAjuda(t); a.classList.toggle("warn", metaPts(t) && t.meta > metaMax(t) && metaMax(t) > 0); }
  if (!trocou) return;
  const i = $("#et-meta"), p = metaPts(t); if (!i) return;
  i.min = p ? PTS_ACERTO : 1; i.max = p ? PTS_MAX : 100; i.step = p ? PTS_ACERTO : 1; i.value = t.meta;
}
function metaValida(t, m) { return metaPts(t) ? (m >= 1 && m <= PTS_MAX) : (m >= 1 && m <= 100); }
