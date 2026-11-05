/* v1.2.0 · meta em pontos: editor, versões, sessão, relatório, PDF, telão, exportar e importar.
   uso: node teste-v12.js <dist> <pasta-de-prints> */
const {chromium} = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const {criar} = require("./rtdb-mock.js"); const cp = require("child_process");
const D = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, {recursive: true});
const REGRAS = JSON.parse(fs.readFileSync([path.join(__dirname, 'docs/firebase-rules.json'), path.join(__dirname, '../docs/firebase-rules.json')].find(fs.existsSync), 'utf8'));
const REGRAS_VELHAS = JSON.parse(JSON.stringify(REGRAS)); delete REGRAS_VELHAS.rules.selos;
const srv = http.createServer((q, r) => { let f = path.join(D, q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } const t = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/json', '.png': 'image/png'}[path.extname(f)] || 'application/octet-stream'; r.writeHead(200, {'content-type': t}); r.end(b) }) });
const log = []; const ok = (n, c, x = '') => { log.push((c ? 'OK   ' : 'FALHA ') + n + (x ? ' · ' + x : '')); };
const espera = async (p, fn, arg, ms = 8000) => { try { await p.waitForFunction(fn, arg, {timeout: ms}); return true } catch (e) { return false } };
const tem = async (p, txt, sel = 'body', ms = 8000) => espera(p, ([t, s]) => { const e = document.querySelector(s); return !!e && e.innerText.includes(t) }, [txt, sel], ms);
(async () => {
  const mock = await criar({regras: REGRAS});
  await new Promise(r => srv.listen(0, r)); const U = 'http://localhost:' + srv.address().port + '/';
  const b = await chromium.launch({args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required']});
  const errs = [];
  const pagina = async (ctx, nome) => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(nome + ' pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push(nome + ' ' + m.text()) }); return p; };
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'block', permissions: ['microphone']});
  await ctx.addInitScript(() => {
    window.__plays = []; HTMLMediaElement.prototype.play = function () { window.__plays.push(String(this.src).slice(0, 24)); return Promise.resolve(); };
    window.__mk = (t, o) => { fixarVersao(t); const s = {id: uid(), treinoId: t.id, versao: t.versao, itens: clone(t.itens), preset: 'aovivo', setores: [], instrutor: 'Elias Beserra', local: 'Refeitório', horas: '1', aj: Object.assign({}, AJ_PADRAO, o.aj || {}), estado: 'sala', titulo: t.titulo, meta: (metaPts(t) ? metaEq(t, t.itens) : t.meta), metaTipo: metaPts(t) ? 'pts' : undefined, metaPts: metaPts(t) ? t.meta : undefined, chave: String(100000 + Math.floor(Math.random() * 899999)), entrada: true, part: [], resp: {}, fase: {etapa: 'espera', idx: -1, t0: 0, dur: 0}, sim: {on: false, alvo: 0}, criada: new Date().toISOString()};
      const qs = s.itens.map((it, i) => [it, i]).filter(([it]) => vale(it));
      o.pessoas.forEach(([n, st, pct], k) => { const p = {id: uid(), nome: n, setor: st, real: true, cor: k % 8}; s.part.push(p); s.resp[p.id] = {}; const alvo = Math.round(qs.length * pct / 100);
        qs.forEach(([it, i], j) => { const a = j < alvo; let r; if (it.tipo === 'ordenar') r = a ? it.alternativas.map((_, x) => x) : it.alternativas.map((_, x) => it.alternativas.length - 1 - x); else r = a ? it.correta : ((it.correta + 1) % it.alternativas.length); s.resp[p.id][i] = {r, ok: a, ms: 4000, pts: a ? 900 : 0} }) });
      S.sessoes.push(s); encerrar(s); const x = S.sessoes.find(y => y.id === s.id); x.fim = new Date().toISOString(); x.cod = codigoDe(x); location.hash = '#/inicio'; return x.id };
  });
  const p = await pagina(ctx, 'instrutor');
  await p.goto(U + '?demo=1'); await p.waitForSelector('.coach');
  const ir = async h => { await p.evaluate(h => { location.hash = h }, h); await p.waitForTimeout(250) };
  const Q = (e, c) => ({tipo: 'multipla', enunciado: e, alternativas: ['Opção A', 'Opção B', 'Opção C', 'Opção D'], correta: c, tempo: 20, uso: 'avaliacao', porque: 'Porque sim.'});
  const tid = await p.evaluate(qs => { const t = criarDoZero('Higiene da ordenha', 80); qs.forEach(q => t.itens.push(clone(q))); salvar(); return t.id }, [Q('P um', 1), Q('P dois', 2), Q('P três', 0), Q('P quatro', 3)]);

  // ---------- A. funções de conta
  ok('Meta em % continua igual', await p.evaluate(() => metaEq({meta: 80, itens: []}) === 80 && metaTxt({meta: 80}) === '80%'));
  ok('3.000 pontos com 4 perguntas valem 75%', await p.evaluate(() => metaEq({meta: 3000, metaTipo: 'pts', itens: [1, 2, 3, 4].map(() => ({tipo: 'vf', uso: 'avaliacao'}))}) === 75));
  ok('Pontos: quem acerta o número certo bate a meta e quem acerta um a menos não (de 1 a 40 perguntas)', await p.evaluate(() => { for (let nq = 1; nq <= 40; nq++) { const it = Array.from({length: nq}, () => ({tipo: 'vf', uso: 'avaliacao'})); for (let k = 1; k <= nq; k++) { const eq = metaEq({meta: k * 1000, metaTipo: 'pts', itens: it}); const pct = a => Math.round(100 * a / nq); if (!(pct(k) >= eq) || (k > 1 && pct(k - 1) >= eq)) return 'falhou nq=' + nq + ' k=' + k; } } return true }) === true);
  ok('Meta acima do máximo fica em 100% (limite)', await p.evaluate(() => metaEq({meta: 9000, metaTipo: 'pts', itens: [{tipo: 'vf', uso: 'avaliacao'}]}) === 100));
  ok('Perguntas de ensaio não entram na conta', await p.evaluate(() => metaMax({itens: [{tipo: 'vf', uso: 'avaliacao'}, {tipo: 'vf', uso: 'ensaio'}, {tipo: 'explicacao'}]}) === 1000));

  // ---------- B. editor
  await ir('#/editar/' + tid); await p.waitForSelector('.edit');
  ok('O editor tem o campo Meta com o tipo ao lado', (await p.locator('#et-meta').count()) === 1 && (await p.locator('#et-mt').count()) === 1 && await p.inputValue('#et-mt') === 'pct' && await p.inputValue('#et-meta') === '80');
  await p.selectOption('#et-mt', 'pts'); await p.waitForTimeout(200);
  ok('Trocar para pontos converte 80% de 4 perguntas em 3.000', await p.inputValue('#et-meta') === '3000' && await p.evaluate(id => { const t = treino(id); return t.metaTipo === 'pts' && t.meta === 3000 }, tid));
  ok('O campo passa a andar de 1.000 em 1.000', await p.evaluate(() => { const i = document.querySelector('#et-meta'); return i.step === '1000' && i.min === '1000' }));
  const aj = await p.locator('#et-mta').innerText();
  ok('A ajuda explica o valor do acerto, o máximo e quantos acertos pede', aj.includes('1.000 pontos') && aj.includes('bônus de rapidez não conta') && aj.includes('4.000 pontos') && aj.includes('3 acertos'), aj);
  ok('O resumo do editor mostra 3.000 pontos de meta', (await p.locator('.rsm').first().innerText()).includes('3.000 pontos'));
  await p.fill('#et-meta', '5000'); await p.waitForTimeout(150);
  const aj2 = await p.locator('#et-mta').innerText();
  ok('Meta acima do máximo avisa que ninguém atinge', aj2.includes('ninguém vai atingir') && await p.evaluate(() => document.querySelector('#et-mta').classList.contains('warn')), aj2);
  await p.fill('#et-meta', '3000'); await p.waitForTimeout(150);
  ok('Valor inválido não é gravado (zero fica de fora)', await (async () => { await p.fill('#et-meta', '0'); await p.waitForTimeout(100); const v = await p.evaluate(id => treino(id).meta, tid); await p.fill('#et-meta', '3000'); await p.waitForTimeout(100); return v === 3000 })());
  await p.evaluate(id => { salvarVersao(treino(id), 'Meta em pontos'); }, tid);
  await p.selectOption('#et-mt', 'pct'); await p.waitForTimeout(200);
  ok('Voltar para % converte 3.000 em 75%', await p.inputValue('#et-meta') === '75' && await p.evaluate(id => { const t = treino(id); return !t.metaTipo && t.meta === 75 }, tid));
  await p.click('[data-act=versoes]'); await p.waitForSelector('.vr');
  await p.click('.vr [data-act=verscmp]'); await p.waitForTimeout(250);
  ok('A comparação de versões mostra que a meta era em pontos', (await p.locator('#dlg').innerText()).includes('Meta era 3.000 pontos'));
  await p.click('.vr [data-act=versrest]'); await p.waitForTimeout(300);
  ok('Restaurar a versão traz de volta a meta em pontos', await p.evaluate(id => { const t = treino(id); return t.metaTipo === 'pts' && t.meta === 3000 }, tid));
  await p.screenshot({path: path.join(OUT, 'editor-pontos.png')});
  ok('Desfazer devolve a meta em %', await (async () => { await p.click('#toast button'); await p.waitForTimeout(300); return await p.evaluate(id => { const t = treino(id); return t.metaTipo !== 'pts' && t.meta === 75 }, tid) })());
  await p.evaluate(id => { const t = treino(id); t.metaTipo = 'pts'; t.meta = 3000; salvar() }, tid);
  await ir('#/treinos'); await p.waitForSelector('.tr');
  ok('A lista de treinamentos mostra 3.000 pontos', (await p.locator('body').innerText()).includes('3.000 pontos'));

  // ---------- C. sessão, relatório e PDF
  const sess = await p.evaluate(t => __mk(treino(t), {pessoas: [['Ana Souza', 'Ordenha', 100], ['Bruno Lima', 'Ordenha', 75], ['Carla Dias', 'Campo', 50], ['Davi Reis', 'Campo', 25]]}), tid);
  const s1 = await p.evaluate(id => { const s = S.sessoes.find(x => x.id === id); return {meta: s.meta, tipo: s.metaTipo, pts: s.metaPts, efic: s.resultado.efic, ok: s.resultado.metaOk, pct: s.resultado.pct} }, sess);
  ok('A sessão guarda a meta em % equivalente e os pontos originais', s1.meta === 75 && s1.tipo === 'pts' && s1.pts === 3000, JSON.stringify(s1));
  ok('Atingem a meta quem fez 3 ou 4 acertos (2 de 4 pessoas)', s1.efic === 2, JSON.stringify(s1));
  await ir('#/relatorios/' + sess); await p.waitForSelector('.rl-docs');
  const rel = await p.locator('body').innerText();
  ok('O relatório fala em pontos: "meta de 3.000 pontos"', rel.includes('meta de 3.000 pontos'));
  ok('Situação por pessoa usa a meta em pontos (2 atingiram, 2 abaixo)', (rel.match(/Atingiu a meta/g) || []).length === 2 && (rel.match(/Abaixo da meta/g) || []).length >= 2);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=relpdf]')]);
  const arq = path.join(OUT, 'registro-pontos.pdf'); await dl.saveAs(arq);
  const txt = cp.execFileSync('pdftotext', ['-layout', arq, '-'], {encoding: 'utf8'}).replace(/\s+/g, ' ');
  ok('O PDF de registro traz "Meta de acerto 3.000 pontos" e como a meta conta', /META DE ACERTO/.test(txt) && txt.includes('3.000 pontos') && /COMO A META CONTA/.test(txt) && txt.includes('1.000 pontos por acerto, sem o bônus de rapidez'));
  const csv = await p.evaluate(id => { const s = S.sessoes.find(x => x.id === id); return JSON.stringify(csvSessao ? csvSessao(s) : '') }, sess).catch(() => '""');
  ok('Sessão em % continua mostrando %', await p.evaluate(t => { const t2 = criarDoZero('Outro', 80); t2.itens.push(clone({tipo: 'vf', enunciado: 'X', alternativas: ['Verdadeiro', 'Falso'], correta: 0, tempo: 20, uso: 'avaliacao', porque: ''})); const id = __mk(t2, {pessoas: [['Ana', 'A', 100]]}); const s = S.sessoes.find(x => x.id === id); return metaTxtS(s) === '80%' && !s.metaTipo }, tid));

  // ---------- D. abrir a sala de verdade (abrirSalaDe) e telão
  const sala = await p.evaluate(tid => { const t = treino(tid); const s = {id: uid(), treinoId: t.id, preset: 'aovivo', setores: [], instrutor: 'Elias', local: '', horas: '1', aj: Object.assign({}, AJ_PADRAO), estado: 'preparada', part: [], resp: {}, sim: {on: false, alvo: 0}, criada: new Date().toISOString()}; S.sessoes.push(s); salvar(); abrirSalaDe(s); const x = S.sessoes.find(y => y.id === s.id); return {id: s.id, meta: x.meta, tipo: x.metaTipo, pts: x.metaPts, eq: x.metaEq} }, tid);
  ok('Abrir a sala converte a meta uma vez (75%) e guarda os 3.000 pontos', sala.meta === 75 && sala.tipo === 'pts' && sala.pts === 3000 && sala.eq === 75, JSON.stringify(sala));
  ok('Mudar a meta do treinamento com a sala aberta não muda a conversão já feita', await p.evaluate(([tid, sid]) => { const t = treino(tid); t.meta = 1000; const s = S.sessoes.find(x => x.id === sid); abrirSalaDe(s); const ok = s.meta === 75 && s.metaPts === 3000; t.meta = 3000; return ok }, [tid, sala.id]));
  const tl = await pagina(ctx, 'telao'); await tl.setViewportSize({width: 1280, height: 720});
  await tl.goto(U + '#/telao/' + sala.id); await tl.waitForSelector('.telfull .tel');
  ok('O telão mostra "3.000 pontos de meta"', await espera(tl, () => document.querySelector('.telfull').innerText.includes('3.000 pontos'), null, 5000));
  await tl.screenshot({path: path.join(OUT, 'telao-pontos.png')}); await tl.close();
  await p.evaluate(id => { S.sessoes = S.sessoes.filter(x => x.id !== id); AO.id = null; salvar() }, sala.id);

  // ---------- E. exportar e importar
  const exp = await p.evaluate(id => { let saida = null; const o = baixar; window.baixar = (n, d) => { saida = d }; try { document.dispatchEvent(new Event('x')); const el = document.createElement('button'); el.dataset.act = 'exportar'; el.dataset.id = id; document.body.appendChild(el); el.click(); el.remove(); } finally { window.baixar = o } return saida }, tid);
  ok('Exportar leva a meta em pontos', !!exp && exp.metaTipo === 'pts' && exp.meta === 3000, JSON.stringify(exp && {m: exp.meta, t: exp.metaTipo}));
  const imp = await p.evaluate(e => { const t = validaTreino(e); return t && {meta: t.meta, tipo: t.metaTipo} }, Object.assign({}, exp));
  ok('Importar traz de volta a meta em pontos', imp && imp.meta === 3000 && imp.tipo === 'pts');
  ok('Importar com meta em pontos fora do limite cai para 80%', await p.evaluate(e => { const t = validaTreino(Object.assign({}, e, {meta: 999999})); return t.meta === 80 && !t.metaTipo }, exp));
  ok('Importar arquivo antigo (só %) continua igual', await p.evaluate(e => { const t = validaTreino(Object.assign({}, e, {metaTipo: undefined, meta: 70})); return t.meta === 70 && !t.metaTipo }, exp));

  // ---------- F. celular de 390 px
  const pc = await pagina(await b.newContext({viewport: {width: 390, height: 800}, serviceWorkers: 'block'}), 'cel');
  await pc.goto(U + '?demo=1'); await pc.waitForSelector('.coach');
  const t5 = await pc.evaluate(() => { const t = criarDoZero('Luvas', 80); for (let i = 0; i < 3; i++) t.itens.push(clone({tipo: 'vf', enunciado: 'Q' + i, alternativas: ['Verdadeiro', 'Falso'], correta: 1, tempo: 20, uso: 'avaliacao', porque: ''})); salvar(); return t.id });
  await pc.evaluate(t => { location.hash = '#/editar/' + t }, t5); await pc.waitForSelector('.edit');
  await pc.selectOption('#et-mt', 'pts'); await pc.waitForTimeout(200);
  ok('Editor no celular sem rolagem lateral com a meta em pontos', await pc.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('.ed-meta').scrollWidth <= document.querySelector('.ed-meta').clientWidth + 1));
  ok('Campo e seletor da meta com área de toque de 36 px ou mais', await pc.evaluate(() => ['#et-meta', '#et-mt'].every(s => document.querySelector(s).getBoundingClientRect().height >= 36)));
  await pc.screenshot({path: path.join(OUT, 'editor-pontos-cel.png')});
  ok('Sem erros de JS', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(log.join('\n')); console.log('\n' + log.filter(l => l.startsWith('OK')).length + ' OK / ' + log.filter(l => l.startsWith('FALHA')).length + ' FALHAS');
  await b.close(); srv.close(); mock.fecha();
})().catch(e => { console.log(log.join('\n')); console.error('ERRO', e); process.exit(1); });
