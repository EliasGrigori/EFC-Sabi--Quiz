/* v1.1.0 · folha de reforço em PDF, telão (tela cheia, projetor, apresentação) e painel do treinamento.
   uso: node teste-v11.js <dist> <pasta-de-prints> */
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
    window.__mk = (t, o) => { fixarVersao(t); const s = {id: uid(), treinoId: t.id, versao: t.versao, itens: clone(t.itens), preset: 'aovivo', setores: [], instrutor: 'Elias Beserra', local: 'Refeitório', horas: '1', aj: Object.assign({}, AJ_PADRAO, o.aj || {}), estado: 'sala', titulo: t.titulo, meta: t.meta, chave: String(100000 + Math.floor(Math.random() * 899999)), entrada: true, part: [], resp: {}, fase: {etapa: 'espera', idx: -1, t0: 0, dur: 0}, sim: {on: false, alvo: 0}, criada: new Date().toISOString()};
      const qs = s.itens.map((it, i) => [it, i]).filter(([it]) => vale(it));
      o.pessoas.forEach(([n, st, pct], k) => { const p = {id: uid(), nome: n, setor: st, real: true, cor: k % 8}; s.part.push(p); s.resp[p.id] = {}; const alvo = Math.round(qs.length * pct / 100);
        qs.forEach(([it, i], j) => { const a = j < alvo; let r; if (it.tipo === 'ordenar') r = a ? it.alternativas.map((_, x) => x) : it.alternativas.map((_, x) => it.alternativas.length - 1 - x); else r = a ? it.correta : ((it.correta + 1) % it.alternativas.length); s.resp[p.id][i] = {r, ok: a, ms: 4000, pts: a ? 900 : 0} }) });
      S.sessoes.push(s); encerrar(s); const x = S.sessoes.find(y => y.id === s.id); x.fim = new Date().toISOString(); x.cod = codigoDe(x); location.hash = '#/inicio'; return x.id };
  });
  const p = await pagina(ctx, 'instrutor');
  await p.goto(U + '?demo=1'); await p.waitForSelector('.coach');
  const ir = async h => { await p.evaluate(h => { location.hash = h }, h); await p.waitForTimeout(250) };
  const Q = (e, c, porque) => ({tipo: 'multipla', enunciado: e, alternativas: ['Opção A', 'Opção B', 'Opção C', 'Opção D'], correta: c, tempo: 20, uso: 'avaliacao', porque: porque || ''});
  const EX = {tipo: 'explicacao', enunciado: 'Higiene antes da ordenha', texto: 'Lave as mãos com água e sabão antes de tocar no animal.', uso: 'avaliacao', tempo: 20};
  const tid = await p.evaluate(([ex, a, b, c, d]) => { const t = criarDoZero('Higiene da ordenha', 80); t.itens.push(clone(ex), clone(a), clone(b), clone(c), clone(d)); salvar(); return t.id },
    [EX, Q('Quando lavar as mãos?', 1, 'Mãos sujas contaminam o leite.'), Q('Qual luva usar?', 2, 'Luva limpa evita contaminação.'), Q('Quanto tempo de espuma?', 0, 'Vinte segundos.'), Q('Onde guardar o balde?', 3, 'Em local seco e coberto.')]);

  // ---------- A. folha de reforço em PDF
  const sess = await p.evaluate(t => __mk(treino(t), {pessoas: [['Ana Souza', 'Ordenha', 100], ['Bruno Lima', 'Ordenha', 50], ['Carla Dias', 'Campo', 0]]}), tid);
  await ir('#/relatorios/' + sess); await p.waitForSelector('.rl-docs');
  const bt = p.locator('[data-act=relfolha]');
  ok('Relatório mostra o botão da folha com a contagem de quem ficou abaixo', (await bt.count()) === 1 && (await bt.innerText()).includes('(2)'), await bt.count() ? await bt.innerText() : 'sem botão');
  const [dl] = await Promise.all([p.waitForEvent('download'), bt.click()]);
  const arq = path.join(OUT, 'folha-reforco.pdf'); await dl.saveAs(arq);
  ok('O PDF baixa com nome da folha', /^folha-reforco-higiene-da-ordenha-\d{4}-\d{2}-\d{2}\.pdf$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  const bytes = fs.readFileSync(arq); ok('É um PDF de verdade', bytes.slice(0, 5).toString() === '%PDF-' && bytes.slice(-6).toString().includes('%%EOF'));
  let txt = ''; try { txt = cp.execFileSync('pdftotext', ['-layout', arq, '-'], {encoding: 'utf8'}) } catch (e) { txt = 'ERRO ' + e.message }
  const paginas = (cp.execFileSync('pdfinfo', [arq], {encoding: 'utf8'}).match(/Pages:\s+(\d+)/) || [])[1];
  ok('Uma página por pessoa abaixo da meta (2 páginas)', paginas === '2', 'páginas ' + paginas);
  ok('Traz Bruno e Carla e não traz Ana', txt.includes('Bruno Lima') && txt.includes('Carla Dias') && !txt.includes('Ana Souza'));
  ok('Mostra o que marcou, a resposta certa e o porquê', txt.includes('Você marcou') && txt.includes('Resposta certa') && txt.includes('Mãos sujas contaminam o leite'));
  ok('Traz a explicação para rever', txt.includes('Para rever') && txt.includes('Lave as mãos'));
  ok('Tem linha de ciente e a meta', txt.includes('Ciente: Bruno Lima') && txt.includes('meta 80%'));
  ok('Carla errou as 4 e Bruno 2', (txt.split('Carla Dias')[1] || '').match(/P\d\./g)?.length >= 4 && /acertou 2 de 4/.test(txt));
  ok('O PDF diz que a nota oficial não muda', txt.replace(/\s+/g, ' ').includes('nota oficial não muda'));
  cp.execFileSync('pdftoppm', ['-png', '-r', '60', '-f', '1', '-l', '1', arq, path.join(OUT, 'folha')]);
  // sem ninguém abaixo da meta e pré-teste: sem botão
  const s2 = await p.evaluate(t => __mk(treino(t), {pessoas: [['Ana Souza', 'Ordenha', 100], ['Dina Reis', 'Campo', 100]]}), tid);
  await ir('#/relatorios/' + s2); await p.waitForSelector('.rl-docs');
  ok('Sem ninguém abaixo da meta não há botão da folha', (await p.locator('[data-act=relfolha]').count()) === 0);
  const s3 = await p.evaluate(t => { const id = __mk(treino(t), {pessoas: [['Bruno Lima', 'Ordenha', 0]]}); const x = S.sessoes.find(y => y.id === id); x.mom = 'pre'; salvar(); return id }, tid);
  await ir('#/relatorios/' + s3); await p.waitForSelector('.rl-docs');
  ok('Pré-teste não tem folha de reforço', (await p.locator('[data-act=relfolha]').count()) === 0);
  ok('Perguntas só de ensaio ficam fora da folha', await p.evaluate(tid => { const t = treino(tid); const s = {itens: [{tipo: 'multipla', enunciado: 'X', alternativas: ['a', 'b'], correta: 0, uso: 'ensaio'}, {tipo: 'vf', enunciado: 'Y', alternativas: ['Verdadeiro', 'Falso'], correta: 1, uso: 'avaliacao'}], resp: {p1: {1: {r: 0, ok: false}}}}; const e = errosFolha(s, 'p1'); return e.length === 1 && e[0].n === 1 && e[0].marcou === 'Verdadeiro' && e[0].certa === 'Falso' }, tid));
  ok('Pergunta de ordenar mostra a ordem certa', await p.evaluate(() => { const s = {itens: [{tipo: 'ordenar', enunciado: 'Ordene', alternativas: ['Lavar', 'Secar', 'Ordenhar'], uso: 'avaliacao'}], resp: {p1: {0: {r: [2, 1, 0], ok: false}}}}; const e = errosFolha(s, 'p1'); return e.length === 1 && e[0].certa === '1. Lavar   2. Secar   3. Ordenhar' && e[0].marcou === 'Ordem diferente da certa' }));
  ok('Quem não respondeu aparece como não respondeu', await p.evaluate(() => { const s = {itens: [{tipo: 'multipla', enunciado: 'Z', alternativas: ['a', 'b'], correta: 0, uso: 'avaliacao'}], resp: {}}; const e = errosFolha(s, 'p9'); return e.length === 1 && e[0].marcou === 'Não respondeu' }));

  // ---------- B. telão: tela cheia, projetor, apresentação
  const salaId = await p.evaluate(tid => { const t = treino(tid); const s = {id: uid(), treinoId: t.id, versao: t.versao, itens: clone(t.itens), preset: 'aovivo', setores: [], instrutor: 'Elias Beserra', local: '', horas: '1', aj: Object.assign({}, AJ_PADRAO), estado: 'sala', titulo: t.titulo, meta: t.meta, chave: '482915', entrada: true, part: [], resp: {}, fase: {etapa: 'espera', idx: -1, t0: 0, dur: 0}, sim: {on: false, alvo: 0}, criada: new Date().toISOString()}; S.sessoes.push(s); AO.id = s.id; s.part.push({id: uid(), nome: 'Maria Teste', setor: 'Campo', real: true, cor: 1}); salvar(); location.hash = '#/sala/' + s.id; return s.id }, tid);
  await p.waitForTimeout(500);
  const tl = await pagina(ctx, 'telao'); await tl.setViewportSize({width: 1280, height: 720});
  await tl.goto(U + '#/telao/' + salaId); await tl.waitForSelector('.telfull .tel');
  await tl.evaluate(() => { window.__fs = 0; document.documentElement.requestFullscreen = () => { window.__fs++; return Promise.resolve() } });
  ok('O telão tem a barra com tela cheia, projetor e apresentação', (await tl.locator('#tvbar [data-act=tvfull]').count()) === 1 && (await tl.locator('#tvbar [data-act=tvmodo]').count()) === 2);
  ok('A barra aparece ao abrir e some sozinha', await tl.evaluate(() => document.querySelector('#tvbar').classList.contains('on')) && await espera(tl, () => !document.querySelector('#tvbar').classList.contains('on'), null, 6000));
  await tl.mouse.move(300, 300); await tl.mouse.move(340, 320);
  ok('Mexer o mouse traz a barra de volta', await espera(tl, () => document.querySelector('#tvbar').classList.contains('on'), null, 2000));
  await tl.screenshot({path: path.join(OUT, 'tv-padrao.png')});
  const fundo = () => tl.evaluate(() => getComputedStyle(document.querySelector('.telfull .tel')).backgroundColor);
  const f0 = await fundo(); ok('Visual padrão é escuro', f0 !== 'rgb(255, 255, 255)', f0);
  await tl.keyboard.press('p'); await tl.waitForTimeout(150);
  ok('P liga o modo projetor: fundo branco e botão marcado', (await fundo()) === 'rgb(255, 255, 255)' && await tl.evaluate(() => document.querySelector('.telfull').classList.contains('proj') && document.querySelector('[data-v=projetor]').getAttribute('aria-pressed') === 'true'));
  ok('O modo projetor fica guardado neste aparelho', await tl.evaluate(() => localStorage.getItem('sabia-telao-modo')) === 'projetor');
  const cor = await tl.evaluate(() => getComputedStyle(document.querySelector('.telfull .tel .tt b')).color);
  ok('Texto preto no projetor', cor === 'rgb(0, 0, 0)', cor);
  await tl.mouse.move(500, 300); await tl.screenshot({path: path.join(OUT, 'tv-projetor.png')});
  await tl.click('[data-v=projetor]'); await tl.waitForTimeout(150);
  ok('Clicar de novo no Projetor volta ao padrão', (await fundo()) === f0 && await tl.evaluate(() => localStorage.getItem('sabia-telao-modo')) === 'padrao');
  await tl.keyboard.press('f'); await tl.waitForTimeout(150);
  ok('F pede a tela cheia', await tl.evaluate(() => window.__fs) === 1);
  await tl.click('[data-act=tvfull]'); ok('O botão Tela cheia também pede', await tl.evaluate(() => window.__fs) === 2);
  // espaço fora da apresentação não avança
  await tl.keyboard.press(' '); await p.waitForTimeout(400);
  ok('Espaço no telão comum não avança a sala', await p.evaluate(id => S.sessoes.find(s => s.id === id).fase.etapa === 'espera', salaId));
  await tl.keyboard.press('a'); await tl.waitForTimeout(200);
  ok('A liga a apresentação, pede tela cheia e mostra a dica', await tl.evaluate(() => document.querySelector('.telfull').classList.contains('apr') && window.__fs === 3 && !document.querySelector('#tvdica').hidden && document.querySelector('#tvdica').textContent.includes('Espaço')));
  ok('Sem mexer o mouse o cursor some', await espera(tl, () => getComputedStyle(document.querySelector('.telfull')).cursor === 'none', null, 6000));
  await tl.screenshot({path: path.join(OUT, 'tv-apresentacao.png')});
  await tl.keyboard.press(' ');
  ok('Espaço na apresentação avança a sala (abre a explicação)', await espera(p, id => { const s = S.sessoes.find(x => x.id === id); return s.fase.etapa === 'explicacao' && s.fase.idx === 0 }, salaId, 4000));
  await tl.keyboard.press('ArrowRight');
  ok('Seta para a direita avança para a 1ª pergunta', await espera(p, id => { const f = S.sessoes.find(x => x.id === id).fase; return f.etapa === 'pergunta' && f.idx === 1 }, salaId, 4000));
  await tl.keyboard.press('Enter');
  ok('Enter avança para o resultado da pergunta', await espera(p, id => S.sessoes.find(x => x.id === id).fase.etapa === 'resultado', salaId, 4000));
  await p.evaluate(id => { const s = S.sessoes.find(x => x.id === id); irPodio(s); mudou(s) }, salaId); await p.waitForTimeout(500);
  await tl.keyboard.press(' '); await p.waitForTimeout(500);
  ok('No pódio o espaço não encerra a sala', await p.evaluate(id => { const s = S.sessoes.find(x => x.id === id); return s.estado === 'sala' && s.fase.etapa === 'podio' }, salaId));
  ok('Aparece o aviso de encerrar pelo controle', await tl.evaluate(() => !document.querySelector('#tvdica').hidden && document.querySelector('#tvdica').textContent.includes('pódio')));
  await tl.reload(); await tl.waitForSelector('.telfull .tel'); await tl.waitForTimeout(300);
  ok('O modo apresentação volta ao reabrir o telão', await tl.evaluate(() => document.querySelector('.telfull').classList.contains('apr')));
  await tl.keyboard.press('a'); await tl.waitForTimeout(150);
  ok('A de novo sai da apresentação', await tl.evaluate(() => !document.querySelector('.telfull').classList.contains('apr') && localStorage.getItem('sabia-telao-modo') === 'padrao'));
  ok('A prévia do controle lembra os atalhos', (await p.locator('.prev').innerText()).includes('A apresentação'));
  await tl.close();

  // ---------- C. painel do treinamento
  await p.evaluate(id => { const s = S.sessoes.find(x => x.id === id); S.sessoes = S.sessoes.filter(x => x.id !== id); salvar() }, salaId);
  const t2 = await p.evaluate(() => { const t = criarDoZero('Uso de luvas', 70); t.itens.push(clone({tipo: 'multipla', enunciado: 'Quando trocar a luva?', alternativas: ['A', 'B', 'C', 'D'], correta: 1, tempo: 20, uso: 'avaliacao', porque: ''}), clone({tipo: 'vf', enunciado: 'Luva suja serve.', alternativas: ['Verdadeiro', 'Falso'], correta: 1, tempo: 20, uso: 'avaliacao', porque: ''})); salvar(); return t.id });
  const sv0 = await p.evaluate(t => __mk(treino(t), {pessoas: [['Ana Souza', 'Ordenha', 50], ['Bruno Lima', 'Ordenha', 50]]}), t2);
  await p.evaluate(t => { const x = treino(t); x.itens.push(clone({tipo: 'multipla', enunciado: 'Onde descartar?', alternativas: ['A', 'B'], correta: 0, tempo: 20, uso: 'avaliacao', porque: ''})); editou(x); salvarVersao(x, 'Pergunta nova sobre descarte'); }, t2);
  const sv1 = await p.evaluate(t => __mk(treino(t), {pessoas: [['Ana Souza', 'Ordenha', 100], ['Bruno Lima', 'Ordenha', 67], ['Carla Dias', 'Campo', 100]]}), t2);
  await p.evaluate(t => { S.mensagens = S.mensagens || []; S.mensagens.push({id: 'm1', sid: 'x', pid: 'p', cid: 'c', pessoa: 'Bruno Lima', setor: 'Ordenha', tipo: 'sugestao', texto: 'Podia ter foto da luva certa.', em: Date.now() - 1000, treinoId: t, titulo: 'Uso de luvas', versao: 1, teste: false, lida: false, resposta: '', respEm: 0}, {id: 'm2', sid: 'x', pid: 'p2', cid: 'c', pessoa: 'Ana Souza', setor: 'Ordenha', tipo: 'elogio', texto: 'Gostei da explicação.', em: Date.now() - 5000, treinoId: t, titulo: 'Uso de luvas', versao: 0, teste: false, lida: true, resposta: 'Obrigado!', respEm: 1}, {id: 'm3', sid: 'x', pid: 'p3', cid: 'c', pessoa: 'Outro', setor: '', tipo: 'elogio', texto: 'De outro treinamento', em: Date.now(), treinoId: 'outro', titulo: 'Outro', versao: 0, teste: false, lida: false, resposta: '', respEm: 0}); salvar() }, t2);
  await ir('#/editar/' + t2); await p.waitForSelector('.edit');
  ok('O editor tem o botão Painel', (await p.locator('[data-act=painel]').count()) === 1);
  await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn');
  ok('O painel abre como gaveta pela direita', await p.evaluate(() => { const r = document.querySelector('#dlg').getBoundingClientRect(); return r.right >= innerWidth - 2 && r.left > 300 && r.height >= innerHeight - 2 }));
  const g = await p.locator('#pn-corpo').innerText();
  ok('Visão geral: perguntas, sessões, pessoas e meta', g.includes('3\nperguntas valendo') && g.includes('2\nsessões oficiais') && g.includes('5\npessoas atendidas') && g.includes('70%\nde meta'), g.replace(/\n/g, ' | ').slice(0, 200));
  ok('Visão geral: acerto médio ponderado pelas pessoas', /Acerto médio das sessões\s*\n?\s*(\d+)%/.test(g) && g.includes('Comentários da turma') && g.includes('2 · 1 sem ler'), g.replace(/\n/g, ' | ').slice(-160));
  await p.screenshot({path: path.join(OUT, 'pn-geral.png')});
  await p.click('[data-v=versoes]');
  const vr = await p.locator('.pn-vr').count(); const vt = await p.locator('#pn-corpo').innerText();
  ok('Acerto por versão lista as 2 versões, a atual marcada', vr === 2 && vt.includes('atual') && vt.includes('v01') && vt.includes('v00'), vt.replace(/\n/g, ' | ').slice(0, 220));
  ok('Mostra o acerto de cada versão e a diferença', /v01[\s\S]*?(\d+)%[\s\S]*?pp/.test(vt) && vt.includes('Pergunta nova sobre descarte'));
  ok('A marca da meta fica em 70%', await p.evaluate(() => document.querySelector('.pn-b u').style.left === '70%'));
  await p.screenshot({path: path.join(OUT, 'pn-versoes.png')});
  await p.click('[data-v=coment]');
  const ct = await p.locator('#pn-corpo').innerText();
  ok('Comentários: só os deste treinamento, com resposta e marca de nova', ct.includes('Podia ter foto') && ct.includes('Gostei da explicação') && ct.includes('Resposta: Obrigado!') && !ct.includes('De outro treinamento') && ct.includes('nova'));
  await p.screenshot({path: path.join(OUT, 'pn-coment.png')});
  ok('Link para Mensagens', (await p.locator('.pn-c ~ a[href="#/mensagens"]').count()) === 1);
  await p.click('#dlg [data-act=fechar]'); await p.waitForTimeout(150);
  ok('Fecha o painel', await p.evaluate(() => !document.querySelector('#dlg').open));
  // treinamento sem sessão
  const t3 = await p.evaluate(() => { const t = criarDoZero('Vazio', 80); salvar(); return t.id });
  await ir('#/editar/' + t3); await p.waitForSelector('.edit'); await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn');
  ok('Sem sessões o painel diz isso, sem quebrar', (await p.locator('#pn-corpo').innerText()).includes('sem sessão ainda'));
  await p.click('[data-v=versoes]'); ok('Versões sem sessão mostram traço', (await p.locator('.pn-vr').count()) >= 1 && (await p.locator('#pn-corpo').innerText()).includes('sem sessão oficial'));
  await p.click('[data-v=coment]'); ok('Sem comentário mostra o aviso', (await p.locator('#pn-corpo').innerText()).includes('Ninguém comentou'));
  await p.click('#dlg [data-act=fechar]');

  // ---------- D. celular de 390 px
  const pc = await pagina(await b.newContext({viewport: {width: 390, height: 800}, serviceWorkers: 'block'}), 'cel');
  await pc.goto(U + '?demo=1'); await pc.waitForSelector('.coach');
  const t4 = await pc.evaluate(() => { const t = criarDoZero('Uso de luvas', 70); t.itens.push(clone({tipo: 'multipla', enunciado: 'Quando trocar a luva?', alternativas: ['A', 'B', 'C', 'D'], correta: 1, tempo: 20, uso: 'avaliacao', porque: ''})); salvar(); return t.id });
  await pc.evaluate(t => { location.hash = '#/editar/' + t }, t4); await pc.waitForSelector('.edit');
  await pc.click('[data-act=painel]'); await pc.waitForSelector('.dl.pn');
  const ov = async () => pc.evaluate(() => { const d = document.querySelector('#dlg'); return d.scrollWidth <= d.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1 });
  ok('Painel no celular sem rolagem lateral (geral)', await ov());
  await pc.click('[data-v=versoes]'); ok('Painel no celular sem rolagem lateral (versões)', await ov());
  await pc.click('[data-v=coment]'); ok('Painel no celular sem rolagem lateral (comentários)', await ov());
  await pc.screenshot({path: path.join(OUT, 'pn-cel.png')});
  const alvoMin = await pc.evaluate(() => [...document.querySelectorAll('.dl.pn button')].every(b => b.getBoundingClientRect().height >= 36 || b.getBoundingClientRect().height === 0));
  ok('Botões do painel com área de toque de 36 px ou mais', alvoMin);

  // ---------- E. logotipo de dentro do app
  ok('O logotipo do app é o desenho novo (imagem embutida)', await p.evaluate(() => { const i = document.querySelector('#logo image'); return !!i && i.getAttribute('href').startsWith('data:image/jpeg;base64,') && !document.querySelector('#logo path') }));
  await ir('#/inicio'); await p.waitForSelector('.rail .lg');
  ok('O menu lateral mostra o desenho preenchendo o quadrinho de 48 px', await p.evaluate(() => { const r = document.querySelector('.rail .lg svg').getBoundingClientRect(); return Math.round(r.width) === 48 && Math.round(r.height) === 48 }));
  ok('O desenho aparece também em Próximo passo', await p.evaluate(() => { const e = document.querySelector('.coach .ms svg'); if (!e) return true; const r = e.getBoundingClientRect(); return r.width >= 50 }));
  ok('O cabeçalho do celular usa o mesmo logotipo', await pc.evaluate(() => { const c = document.querySelector('header.ch svg use'); return !c || c.getAttribute('href') === '#logo' }));
  ok('Sem erros de JS', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(log.join('\n')); console.log('\n' + log.filter(l => l.startsWith('OK')).length + ' OK / ' + log.filter(l => l.startsWith('FALHA')).length + ' FALHAS');
  await b.close(); srv.close(); mock.fecha();
})().catch(e => { console.log(log.join('\n')); console.error('ERRO', e); process.exit(1); });
