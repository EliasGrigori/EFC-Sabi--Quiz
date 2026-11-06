/* ===== v1.4.0 · bonecos: cada participante monta o seu bicho (animal, cor, roupa, detalhes, cosméticos) ===== */
/* As imagens ficam em bon/ (arquivos separados, 320 px, guardados pelo sw.js para funcionar sem internet).
   O boneco viaja como um código curto: animal.cor.roupa.detalhe+detalhe.cabeca.pescoco  (ex.: "cachorro.3.xadrez.sardas.mago.colar"). */
const BON = {
  bichos: ["cachorro", "gato", "guaxinim", "raposa", "onca", "veado", "jegue", "tatu", "prea", "moco", "teiu", "jacare", "tartaruga", "sabia", "carcara", "asa-branca", "cardeal"],
  nomeBicho: {cachorro: "Cachorro", gato: "Gato", guaxinim: "Guaxinim", raposa: "Raposa", onca: "Onça-parda", veado: "Veado-catingueiro", jegue: "Jegue", tatu: "Tatu-bola", prea: "Preá", moco: "Mocó", teiu: "Teiú", jacare: "Jacaré", tartaruga: "Tartaruga", sabia: "Sabiá", carcara: "Carcará", "asa-branca": "Asa-branca", cardeal: "Cardeal"},
  cores: [null, [60, 48, 44], [245, 240, 232], [150, 150, 155], [170, 95, 45], [110, 80, 60], [232, 202, 150], [110, 150, 210], [232, 150, 182], [120, 180, 120]],
  nomeCor: ["Natural", "Preto", "Branco", "Cinza", "Ruivo", "Chocolate", "Creme", "Azul", "Rosa", "Verde"],
  roupas: ["colete-refletivo", "colete-couro", "xadrez", "jaleco", "camiseta", "capa"],
  detalhes: ["brinco-argola", "brinco-perola", "piercing-sobrancelha", "piercing-orelha", "tatuagem-coracao", "tatuagem-estrela", "tatuagem-raio", "mancha-olho", "sardas", "mancha-testa", "pintas"],
  cabeca: ["mago", "oculos", "escuros", "coroa", "cangaceiro", "capacete", "bone", "laco", "pirata", "chef", "fone", "flor", "vaqueiro", "palha", "sombrinha", "oculos-protecao", "abafador", "capacete-lanterna", "gorro", "tiara", "aureola", "chifrinhos", "bone-tras"],
  pescoco: ["lenco", "cracha", "gravata", "cachecol", "medalha", "colar"],
  nome: {"colete-refletivo": "Colete refletivo", "colete-couro": "Colete de couro", xadrez: "Camisa xadrez", jaleco: "Jaleco", camiseta: "Camiseta da fazenda", capa: "Capa de herói",
    "brinco-argola": "Brinco de argola", "brinco-perola": "Brinco de pérola", "piercing-sobrancelha": "Piercing na sobrancelha", "piercing-orelha": "Piercing triplo", "tatuagem-coracao": "Tatuagem de coração", "tatuagem-estrela": "Tatuagem de estrela", "tatuagem-raio": "Tatuagem de raio", "mancha-olho": "Mancha no olho", sardas: "Sardas", "mancha-testa": "Mancha na testa", pintas: "Pintas",
    mago: "Chapéu de mago", oculos: "Óculos redondos", escuros: "Óculos escuros", coroa: "Coroa", cangaceiro: "Chapéu de cangaceiro", capacete: "Capacete", bone: "Boné", laco: "Laço", pirata: "Pirata", chef: "Chapéu de chef", fone: "Fone", flor: "Flor",
    vaqueiro: "Chapéu de vaqueiro", palha: "Chapéu de palha", sombrinha: "Sombrinha de frevo", "oculos-protecao": "Óculos de proteção", abafador: "Abafador", "capacete-lanterna": "Capacete com lanterna", gorro: "Gorro de Natal", tiara: "Tiara de orelhinhas", aureola: "Auréola", chifrinhos: "Chifrinhos", "bone-tras": "Boné para trás",
    lenco: "Lenço de cangaceiro", cracha: "Crachá", gravata: "Gravata-borboleta", cachecol: "Cachecol", medalha: "Medalha de ouro", colar: "Colar de flores"},
  semRoupa: ["tatu", "tartaruga"], semDetalhe: ["jacare", "teiu"], semNoRosto: ["jacare", "teiu"], noRosto: ["oculos", "escuros", "oculos-protecao", "pirata"],
  desce: {jacare: 23, teiu: 13},          // cabeças mais baixas que o cubo padrão (pixels na imagem de 320)
  MAX_DET: 4, img: new Map(), url: new Map(), base: "bon/"
};

/* ---------- código do boneco ---------- */
const bonCodigo = o => [o.a, o.cor || 0, o.roupa || "", (o.det || []).join("+"), o.cab || "", o.pes || ""].join(".");
function bonLer(cod) {
  if (typeof cod !== "string" || cod.length > 160 || !/^[a-z0-9.+-]+$/.test(cod)) return null;
  const p = cod.split("."); if (p.length !== 6 || !BON.bichos.includes(p[0])) return null;
  const a = p[0], cor = Number(p[1]);
  const o = {a, cor: Number.isInteger(cor) && cor >= 0 && cor < BON.cores.length ? cor : 0,
    roupa: BON.roupas.includes(p[2]) && !BON.semRoupa.includes(a) ? p[2] : "",
    det: BON.semDetalhe.includes(a) ? [] : [...new Set(p[3].split("+").filter(d => BON.detalhes.includes(d)))].slice(0, BON.MAX_DET),
    cab: BON.cabeca.includes(p[4]) && !(BON.semNoRosto.includes(a) && BON.noRosto.includes(p[4])) ? p[4] : "",
    pes: BON.pescoco.includes(p[5]) ? p[5] : ""};
  return o;
}
const bonValido = cod => { const o = bonLer(cod); return o ? bonCodigo(o) : ""; };
const sorteia = l => l[Math.floor(Math.random() * l.length)];
const bonInicial = () => bonCodigo({a: Math.random() < 0.5 ? "gato" : "cachorro", cor: 0});      // todos começam com gato ou cachorro
function bonSorteio() {
  const a = sorteia(BON.bichos), o = {a, cor: Math.random() < 0.5 ? 0 : Math.floor(Math.random() * BON.cores.length)};
  if (!BON.semRoupa.includes(a) && Math.random() < 0.6) o.roupa = sorteia(BON.roupas);
  if (!BON.semDetalhe.includes(a)) o.det = BON.detalhes.filter(() => Math.random() < 0.12).slice(0, 2);
  if (Math.random() < 0.75) o.cab = sorteia(BON.cabeca.filter(c => !(BON.semNoRosto.includes(a) && BON.noRosto.includes(c))));
  if (Math.random() < 0.4) o.pes = sorteia(BON.pescoco);
  return bonCodigo(o);
}

/* ---------- desenho (canvas, guardado por código) ---------- */
function bonImg(caminho) {
  if (!BON.img.has(caminho)) BON.img.set(caminho, new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = BON.base + caminho; }));
  return BON.img.get(caminho);
}
async function bonDesenha(cod) {
  if (BON.url.has(cod)) return BON.url.get(cod);
  const o = bonLer(cod); if (!o) return "";
  const pedido = (async () => {
    const cam = [`bichos/${o.a}.webp`];
    if (o.cor) cam.push(`camadas/${o.a}__pelagem.webp`);
    if (o.roupa) cam.push(`camadas/${o.a}__${o.roupa}.webp`);
    o.det.forEach(d => cam.push(`camadas/${o.a}__${d}.webp`));
    if (o.pes) cam.push(`cosmeticos/${o.pes}.webp`);
    if (o.cab) cam.push(`cosmeticos/${o.cab}.webp`);
    const im = await Promise.all(cam.map(bonImg)); if (!im[0]) return "";
    const W = im[0].naturalWidth || 320, cv = document.createElement("canvas"); cv.width = cv.height = W; const g = cv.getContext("2d");
    g.drawImage(im[0], 0, 0, W, W); let k = 1;
    if (o.cor) {                                        // pinta só a pelagem: cinza da camada x cor escolhida
      const pel = im[k++];
      if (pel) {
        const t = document.createElement("canvas"); t.width = t.height = W; const h = t.getContext("2d"), c = BON.cores[o.cor].map(v => Math.min(255, Math.round(v * 1.25)));
        h.drawImage(pel, 0, 0, W, W); h.globalCompositeOperation = "multiply"; h.fillStyle = `rgb(${c.join(",")})`; h.fillRect(0, 0, W, W);
        h.globalCompositeOperation = "destination-in"; h.drawImage(pel, 0, 0, W, W); g.drawImage(t, 0, 0);
      }
    }
    const dz = Math.round((BON.desce[o.a] || 0) * W / 320);
    for (; k < im.length; k++) {
      if (!im[k]) continue;
      const ehCos = cam[k].startsWith("cosmeticos/");
      g.drawImage(im[k], 0, ehCos ? dz : 0, W, W);
    }
    try { return cv.toDataURL("image/webp", 0.9); } catch (e) { return cv.toDataURL(); }
  })();
  BON.url.set(cod, pedido); return pedido;
}
const bonHtml = (cod, cls = "") => `<img class="bon ${cls}" data-bon="${esc(cod)}" alt="" width="320" height="320" decoding="async">`;
const avB = (n, c, b, cls = "") => b && bonLer(b) ? `<span class="avb ${cls}" aria-hidden="true">${bonHtml(b)}</span>` : av(n, c);
function bonHidrata(raiz) {
  (raiz || document).querySelectorAll("img[data-bon]:not([data-ok])").forEach(i => {
    i.dataset.ok = "1"; bonDesenha(i.dataset.bon).then(u => { if (u) i.src = u; else i.closest(".avb") && i.closest(".avb").classList.add("vazio"); });
  });
}
new MutationObserver(() => bonHidrata()).observe(document.documentElement, {childList: true, subtree: true});

/* ---------- celular: montar o bicho ---------- */
const BON_LS = "sabia-bon";
function bonMeu() {
  if (!CE.bon) { let v = ""; try { v = localStorage.getItem(BON_LS) || ""; } catch (e) {} CE.bon = bonValido(v) || bonInicial(); try { localStorage.setItem(BON_LS, CE.bon); } catch (e) {} }
  return CE.bon;
}
const bonEscolhaCel = () => `<div class="fd bon-esc"><span class="lbl">Seu bicho</span><div class="bon-linha"><span class="avb bon-m">${bonHtml(bonMeu())}</span><span class="sm mut">${esc(BON.nomeBicho[bonLer(bonMeu()).a])}. Monte do seu jeito: cor, roupa, brincos, chapéu.</span><button type="button" class="b" data-act="cbon">Montar meu bicho</button></div></div>`;
const BON_ABAS = [["bicho", "Bicho"], ["cor", "Cor"], ["roupa", "Roupa"], ["det", "Detalhes"], ["cab", "Cabeça"], ["pes", "Pescoço"]];
function bonOpcoes(o, aba) {
  const com = mud => bonCodigo(Object.assign({}, o, mud));
  if (aba === "bicho") return BON.bichos.map(a => ({v: a, t: BON.nomeBicho[a], cod: bonCodigo({a, cor: 0}), on: o.a === a}));
  if (aba === "cor") return BON.cores.map((c, k) => ({v: String(k), t: BON.nomeCor[k], cod: com({cor: k}), on: o.cor === k}));
  if (aba === "roupa") return BON.semRoupa.includes(o.a) ? [] : [{v: "", t: "Sem roupa", cod: com({roupa: ""}), on: !o.roupa}].concat(BON.roupas.map(r => ({v: r, t: BON.nome[r], cod: com({roupa: r}), on: o.roupa === r})));
  if (aba === "det") return BON.semDetalhe.includes(o.a) ? [] : BON.detalhes.map(d => ({v: d, t: BON.nome[d], cod: com({det: o.det.includes(d) ? o.det : [...o.det, d].slice(-BON.MAX_DET)}), on: o.det.includes(d)}));
  if (aba === "cab") return [{v: "", t: "Nada", cod: com({cab: ""}), on: !o.cab}].concat(BON.cabeca.filter(c => !(BON.semNoRosto.includes(o.a) && BON.noRosto.includes(c))).map(c => ({v: c, t: BON.nome[c], cod: com({cab: c}), on: o.cab === c})));
  return [{v: "", t: "Nada", cod: com({pes: ""}), on: !o.pes}].concat(BON.pescoco.map(p => ({v: p, t: BON.nome[p], cod: com({pes: p}), on: o.pes === p})));
}
function bonEditorCel() {
  const o = bonLer(CE.bonEd) || bonLer(bonInicial()), aba = CE.bonAba || "bicho", op = bonOpcoes(o, aba);
  const vazio = aba === "roupa" ? "O casco não deixa vestir roupa neste bicho." : aba === "det" ? "Este bicho não tem brincos nem pintas." : "";
  return `<div class="cc bon-ed">${cabCel()}<div class="cb">
    <div class="bon-topo"><span class="avb bon-g">${bonHtml(bonCodigo(o))}</span><div class="bon-tt"><h1>Monte seu bicho</h1><b>${esc(BON.nomeBicho[o.a])}</b><span class="sm mut">${o.cor ? esc(BON.nomeCor[o.cor]) : "Cor natural"}${o.roupa ? " · " + esc(BON.nome[o.roupa]) : ""}${o.cab ? " · " + esc(BON.nome[o.cab]) : ""}</span>
      <button type="button" class="b sm" data-act="cbonsort">Sortear</button></div></div>
    <div class="bon-abas" role="tablist">${BON_ABAS.map(([k, t]) => `<button type="button" role="tab" class="bon-aba${k === aba ? " on" : ""}" aria-selected="${k === aba}" data-act="cbonaba" data-v="${k}">${t}${k === "det" && o.det.length ? ` <span class="num">${o.det.length}</span>` : ""}</button>`).join("")}</div>
    ${aba === "det" && op.length ? `<p class="sm mut" style="margin:0">Escolha até ${BON.MAX_DET}. Toque de novo para tirar.</p>` : ""}
    ${op.length ? `<div class="bon-op bon-${aba}">${op.map(x => `<button type="button" class="bon-i${x.on ? " on" : ""}" data-act="cbonset" data-aba="${aba}" data-v="${esc(x.v)}" aria-pressed="${x.on}" aria-label="${esc(x.t)}">${aba === "cor" ? `<span class="bon-cor" style="background:${BON.cores[x.v | 0] ? "rgb(" + BON.cores[x.v | 0].join(",") + ")" : "linear-gradient(135deg,#d9a35a,#8a5a2b)"}"></span>` : `<span class="bon-mini">${bonHtml(x.cod)}</span>`}<span class="bon-n">${esc(x.t)}</span></button>`).join("")}</div>` : `<p class="mut">${vazio}</p>`}
    <div class="bon-fim"><button type="button" class="b" data-act="cbonnao">Cancelar</button><button type="button" class="b p" data-act="cbonok">${ic("check")}Pronto</button></div>
  </div></div>`;
}
function bonAplica(aba, v) {
  const o = bonLer(CE.bonEd); if (!o) return;
  if (aba === "bicho") { o.a = v; Object.assign(o, bonLer(bonCodigo(o))); }
  else if (aba === "cor") o.cor = Number(v) || 0;
  else if (aba === "roupa") o.roupa = v;
  else if (aba === "det") o.det = o.det.includes(v) ? o.det.filter(d => d !== v) : [...o.det, v].slice(-BON.MAX_DET);
  else if (aba === "cab") o.cab = v;
  else if (aba === "pes") o.pes = v;
  CE.bonEd = bonValido(bonCodigo(o));
}
async function bonSalva() {
  CE.bon = bonValido(CE.bonEd) || CE.bon; try { localStorage.setItem(BON_LS, CE.bon); } catch (e) {}
  if (CE.entrou && CE.pid && CE.base && CE.chave) { try { await Rede.req(CE.base, "PATCH", "/salas/" + CE.chave + "/part/" + CE.pid, {b: CE.bon}); } catch (e) {} }
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const a = el.dataset.act;
  if (!a.startsWith("cbon")) return;
  if (a === "cbon") { const n = $("#ce-n"); if (n) CE.nome = n.value; CE.bonEd = bonMeu(); CE.bonAba = "bicho"; CE.bonAberto = true; }
  else if (a === "cbonaba") CE.bonAba = el.dataset.v;
  else if (a === "cbonset") bonAplica(el.dataset.aba, el.dataset.v);
  else if (a === "cbonsort") CE.bonEd = bonSorteio();
  else if (a === "cbonnao") CE.bonAberto = false;
  else if (a === "cbonok") { CE.bonAberto = false; bonSalva(); }
  CE.html = ""; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); pintaCel();
  if (a === "cbonok" || a === "cbonnao" || a === "cbon") window.scrollTo(0, 0);
});
