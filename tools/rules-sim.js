/* Avaliador das regras do Realtime Database, só para os testes.
   Implementa o que o Sabiá usa: .read, .write (cascata), .validate (no caminho gravado, nos pais e nos filhos), $curingas,
   data, newData, root, now, hasChild, hasChildren, isString, isNumber, isBoolean, exists, val, child, parent, matches.
   Não é o Firebase: é uma conferência extra. A palavra final é o Simulador de regras do console do Firebase. */
String.prototype.matches = String.prototype.matches || function (re) { return re.test(String(this)); };
String.prototype.beginsWith = String.prototype.beginsWith || function (x) { return String(this).startsWith(x); };
String.prototype.contains = String.prototype.contains || function (x) { return String(this).includes(x); };
const seg = p => String(p).split("/").filter(Boolean);
const pega = (t, s) => { for (const k of s) { if (t === null || t === undefined || typeof t !== "object") return null; t = t[k] === undefined ? null : t[k]; } return t === undefined ? null : t; };
const clona = o => o === null || o === undefined ? null : JSON.parse(JSON.stringify(o));
function limpa(t) { if (t && typeof t === "object") { for (const k of Object.keys(t)) { if (t[k] === null) { delete t[k]; continue; } limpa(t[k]); if (t[k] && typeof t[k] === "object" && !Object.keys(t[k]).length) delete t[k]; } } return t; }
function poe(tree, s, v) {
  if (!s.length) return v === undefined ? null : v;
  if (tree === null || typeof tree !== "object") tree = {};
  let cur = tree;
  for (let i = 0; i < s.length - 1; i++) { if (cur[s[i]] === undefined || cur[s[i]] === null || typeof cur[s[i]] !== "object") cur[s[i]] = {}; cur = cur[s[i]]; }
  const k = s[s.length - 1]; if (v === null || v === undefined) delete cur[k]; else cur[k] = v;
  limpa(tree); return tree && typeof tree === "object" && !Object.keys(tree).length ? null : tree;
}
function sv(v, agora) { if (v && typeof v === "object") { if (Object.keys(v).length === 1 && v[".sv"] === "timestamp") return agora; for (const k of Object.keys(v)) v[k] = sv(v[k], agora); } return v; }
class Snap {
  constructor(raiz, caminho, valor) { this.raiz = raiz; this.caminho = caminho; this.v = valor === undefined ? null : valor; }
  val() { return this.v; }
  exists() { return this.v !== null && this.v !== undefined; }
  child(p) { const s = seg(p); return new Snap(this.raiz, this.caminho.concat(s), pega(this.v, s)); }
  parent() { return new Snap(this.raiz, this.caminho.slice(0, -1), pega(this.raiz, this.caminho.slice(0, -1))); }
  hasChild(p) { return pega(this.v, seg(p)) !== null; }
  hasChildren(l) { if (this.v === null || typeof this.v !== "object") return false; return l ? l.every(k => this.v[k] !== undefined && this.v[k] !== null) : Object.keys(this.v).length > 0; }
  isString() { return typeof this.v === "string"; }
  isNumber() { return typeof this.v === "number"; }
  isBoolean() { return typeof this.v === "boolean"; }
  getPriority() { return null; }
}
function aval(expr, ctx) {
  if (expr === true || expr === false) return expr;
  const nomes = Object.keys(ctx.vars), f = new Function("data", "newData", "root", "now", "auth", ...nomes, "return (" + expr + ");");
  try { return !!f(ctx.data, ctx.newData, ctx.root, ctx.now, null, ...nomes.map(n => ctx.vars[n])); } catch (e) { return false; }
}
/* devolve a lista de nós de regra que valem para o caminho, de cima para baixo: [{no, vars, caminho}] */
function desce(regras, s) {
  const cadeia = []; let no = regras.rules, vars = {};
  cadeia.push({no, vars: Object.assign({}, vars), caminho: []});
  for (let i = 0; i < s.length; i++) {
    if (!no) { cadeia.push(null); continue; }
    let prox = no[s[i]] && typeof no[s[i]] === "object" && !s[i].startsWith(".") ? no[s[i]] : null;
    if (!prox) { const w = Object.keys(no).find(k => k.startsWith("$") && typeof no[k] === "object"); if (w) { prox = no[w]; vars = Object.assign({}, vars, {[w]: s[i]}); } }
    no = prox; cadeia.push(no ? {no, vars: Object.assign({}, vars), caminho: s.slice(0, i + 1)} : null);
  }
  return cadeia;
}
function ctxDe(item, antes, depois, agora) {
  return {data: new Snap(antes, item.caminho, pega(antes, item.caminho)), newData: new Snap(depois, item.caminho, pega(depois, item.caminho)), root: new Snap(antes, [], antes), now: agora, vars: item.vars};
}
function podeLer(regras, caminho, arvore) {
  const cad = desce(regras, seg(caminho));
  return cad.some(it => it && it.no[".read"] !== undefined && aval(it.no[".read"], ctxDe(it, arvore, arvore, Date.now())));
}
function validaSubarvore(no, vars, caminho, depois, antes, agora, falhas) {
  const val = pega(depois, caminho);
  if (val === null) return;
  const ctx = {data: new Snap(antes, caminho, pega(antes, caminho)), newData: new Snap(depois, caminho, val), root: new Snap(antes, [], antes), now: agora, vars};
  if (no && no[".validate"] !== undefined && !aval(no[".validate"], ctx)) falhas.push("/" + caminho.join("/") + " .validate: " + no[".validate"]);
  if (val && typeof val === "object") {
    for (const k of Object.keys(val)) {
      let prox = null, v2 = vars;
      if (no) { if (no[k] && typeof no[k] === "object" && !k.startsWith(".")) prox = no[k]; else { const w = Object.keys(no).find(x => x.startsWith("$") && typeof no[x] === "object"); if (w) { prox = no[w]; v2 = Object.assign({}, vars, {[w]: k}); } } }
      validaSubarvore(prox, v2, caminho.concat([k]), depois, antes, agora, falhas);
    }
  }
}
/* tenta gravar: devolve {ok, arvore, motivo} */
function gravar(regras, arvore, caminho, valor, agora = Date.now()) {
  const s = seg(caminho), v = valor === null || valor === undefined ? null : sv(clona(valor), agora);
  const depois = poe(clona(arvore), s, v);
  const cad = desce(regras, s);
  const autorizado = cad.some(it => it && it.no[".write"] !== undefined && aval(it.no[".write"], ctxDe(it, arvore, depois, agora)));
  if (!autorizado) return {ok: false, motivo: "Permission denied (write) em /" + s.join("/")};
  const falhas = [];
  if (v !== null) {
    cad.forEach(it => { if (it && it.caminho.length < s.length && it.no[".validate"] !== undefined && pega(depois, it.caminho) !== null) { const c = ctxDe(it, arvore, depois, agora); if (!aval(it.no[".validate"], c)) falhas.push("/" + it.caminho.join("/") + " .validate: " + it.no[".validate"]); } });
    const topo = cad[cad.length - 1];
    validaSubarvore(topo ? topo.no : null, topo ? topo.vars : {}, s, depois, arvore, agora, falhas);
  }
  if (falhas.length) return {ok: false, motivo: "Validação negada: " + falhas[0]};
  return {ok: true, arvore: depois};
}
module.exports = {gravar, podeLer, seg, pega};
