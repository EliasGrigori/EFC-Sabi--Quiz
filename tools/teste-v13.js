/* v1.3.0 · material com capítulos (PPTX, PDF, HTML), editor, painel, sala, telão.
   uso: node teste-v13.js <dist> <pasta-de-prints> */
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
  const pagina = async (ctx, nome) => { const p = await ctx.newPage(); p.on('pageerror', e => !/sandboxed and lacks/.test(e.message) && errs.push(nome + ' pageerror@' + log.length + ' ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource|Blocked script execution in 'about:srcdoc'/.test(m.text())) errs.push(nome + ' ' + m.text()) }); return p; };
  const GRANDE = path.resolve(OUT, 'grande.pdf'); fs.writeFileSync(GRANDE, Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(26 * 1024 * 1024)]));
  const FX = [path.join(__dirname, 'fx13/'), path.join(__dirname, '../fx13/')].find(fs.existsSync);
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'block'});
  const p = await pagina(ctx, 'instrutor');
  await p.goto(U + '?demo=1'); await p.waitForSelector('.coach');
  const ir = async h => { await p.evaluate(h => { location.hash = h }, h); await p.waitForTimeout(250) };
  const Q = (e, c) => ({tipo: 'multipla', enunciado: e, alternativas: ['Opção A', 'Opção B', 'Opção C', 'Opção D'], correta: c, tempo: 20, uso: 'avaliacao', porque: 'Porque sim.'});
  const EX = (e) => ({tipo: 'explicacao', enunciado: e, texto: 'Texto de apoio.', uso: 'avaliacao', tempo: 20});
  const tid = await p.evaluate(([a, b2, q1, q2]) => { const t = criarDoZero('Higiene da ordenha', 80); [a, b2, q1, q2].forEach(x => t.itens.push(clone(x))); salvar(); return t.id }, [EX('Lavar as mãos'), EX('Tempo de contato'), Q('Quando lavar?', 1), Q('Quanto tempo?', 2)]);
  const abrirMat = async () => { await ir('#/editar/' + tid); await p.waitForSelector('.edit'); await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]'); await p.waitForTimeout(150); };
  const anexar = async f => { await p.setInputFiles('#mt-arq', f.startsWith('/') ? f : FX + f); await p.waitForTimeout(700); };
  const temp = async () => await p.locator('#mt-st').innerText().catch(() => '');

  // ---------- A. painel: aba Material
  await abrirMat();
  ok('O painel tem a aba Material', (await p.locator('.pn-t [data-v=material]').count()) === 1 && (await p.locator('.pn-t .sc').count()) === 4);
  ok('Sem arquivo, explica o que anexar e que fica só neste aparelho', (await p.locator('#pn-corpo').innerText()).includes('só neste aparelho') && (await p.locator('#mt-arq').count()) === 1);
  ok('O campo aceita só PPTX, PDF e HTML', (await p.locator('#mt-arq').getAttribute('accept')) === '.pptx,.pdf,.html,.htm');

  // ---------- B. arquivos inválidos
  for (const [f, rx, nome] of [['falso.pdf', /não parece um PDF/, 'PDF falso'], ['falso.pptx', /não parece um PPTX/, 'PPTX falso'], ['velho.ppt', /PPTX, PDF ou HTML/, 'PPT antigo'], [GRANDE, /25 MB/, 'arquivo grande demais']]) {
    await anexar(f);
    ok('Recusa ' + nome + ' com aviso claro', rx.test(await temp()) && await p.evaluate(t => !treino(t).material, tid), (await temp()).slice(0, 60));
  }

  // ---------- C. PPTX
  await anexar('aula.pptx');
  const m = await p.evaluate(t => treino(t).material, tid);
  ok('PPTX anexado: 4 slides viram 4 capítulos', m && m.tipo === 'pptx' && m.caps.length === 4 && m.nome === 'aula.pptx', JSON.stringify(m && m.caps.map(c => c.t)));
  ok('Os títulos vêm dos slides (e o sem título usa a primeira linha)', m.caps[0].t === 'Higiene na ordenha' && m.caps[1].t === 'Lavagem das mãos' && m.caps[2].t === 'Tempos de contato' && m.caps[3].t === 'Foto sem título');
  ok('A lista mostra nome, tipo, tamanho e os capítulos', await p.evaluate(() => { const c = document.querySelector('#pn-corpo').innerText; return c.includes('aula.pptx') && c.includes('PPTX') && c.includes('MB') && c.includes('Lavagem das mãos') && document.querySelectorAll('.mt-caps li').length === 4 }));
  ok('O arquivo fica no IndexedDB "sabia-material", e não no estado', await p.evaluate(async t => { const r = await matLer(t); return !!r && r.blob.size > 1000 && !JSON.stringify(S).includes('UEsDB') && !('blob' in treino(t).material) }, tid));
  ok('Capítulos de PPTX não podem ser editados à mão', (await p.locator('.mt-add').count()) === 0 && (await p.locator('[data-act=mtcdel]').count()) === 0);
  await p.screenshot({path: path.join(OUT, 'painel-material.png')});

  // ---------- D. ligar a explicação ao capítulo
  await p.click('[data-act=fechar]'); await p.waitForTimeout(150);
  await p.locator('.qi').nth(0).click(); await p.waitForTimeout(150);
  ok('A explicação tem o seletor "Capítulo do material"', (await p.locator('#e-cap').count()) === 1 && (await p.locator('#e-cap option').count()) === 5);
  ok('As opções dizem Slide N: título', (await p.locator('#e-cap option').nth(2).innerText()) === 'Slide 2: Lavagem das mãos');
  await p.selectOption('#e-cap', '1'); await p.waitForTimeout(150);
  await p.locator('.qi').nth(1).click(); await p.selectOption('#e-cap', '2'); await p.waitForTimeout(150);
  ok('Cada explicação guarda seu capítulo', await p.evaluate(t => { const x = treino(t).itens; return x[0].cap === 1 && x[1].cap === 2 }, tid));
  await p.locator('.qi').nth(2).click(); await p.waitForTimeout(150);
  ok('Pergunta não mostra o seletor', (await p.locator('#e-cap').count()) === 0);
  await p.locator('.qi').nth(0).click(); await p.waitForTimeout(150);
  ok('Voltar à explicação mostra o capítulo escolhido', (await p.locator('#e-cap').inputValue()) === '1');
  await p.selectOption('#e-cap', ''); await p.waitForTimeout(100);
  ok('Escolher "Nenhum" apaga a ligação', await p.evaluate(t => treino(t).itens[0].cap === undefined, tid));
  await p.selectOption('#e-cap', '1'); await p.waitForTimeout(100);
  await p.screenshot({path: path.join(OUT, 'editor-capitulo.png')});
  await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]');
  ok('O painel conta as explicações por capítulo', await p.evaluate(() => { const l = [...document.querySelectorAll('.mt-caps li')]; return l[1].innerText.includes('1 explicação') && l[2].innerText.includes('1 explicação') && !l[0].innerText.includes('explicação') }));
  await p.click('[data-act=fechar]');

  // ---------- E. sala (controle) e telão
  const salaId = await p.evaluate(tid => { const t = treino(tid); const s = {id: uid(), treinoId: t.id, versao: t.versao, itens: clone(t.itens), preset: 'aovivo', setores: [], instrutor: 'Elias Beserra', local: '', horas: '1', aj: Object.assign({}, AJ_PADRAO), estado: 'sala', titulo: t.titulo, meta: t.meta, chave: '482915', entrada: true, part: [], resp: {}, fase: {etapa: 'espera', idx: -1, t0: 0, dur: 0}, sim: {on: false, alvo: 0}, criada: new Date().toISOString()}; S.sessoes.push(s); AO.id = s.id; s.part.push({id: uid(), nome: 'Maria Teste', setor: 'Campo', real: true, cor: 1}); salvar(); location.hash = '#/sala/' + s.id; return s.id }, tid);
  await p.waitForTimeout(500);
  const tl = await pagina(ctx, 'telao'); await tl.setViewportSize({width: 1280, height: 720});
  await tl.goto(U + '#/telao/' + salaId); await tl.waitForSelector('.telfull .tel');
  ok('Na espera não há botão de material', (await p.locator('.mt-ctl').count()) === 0 && await tl.evaluate(() => document.querySelector('[data-act=tvmat]').hidden));
  await p.click('[data-act=proxima]'); await p.waitForTimeout(500);
  ok('Na explicação ligada, o controle mostra o capítulo e os dois botões', await p.evaluate(() => { const c = document.querySelector('.mt-ctl'); return !!c && c.innerText.includes('Lavagem das mãos') && !!c.querySelector('[data-act=matver]') && !!c.querySelector('[data-act=mattel]') }));
  ok('O telão avisa a tecla M e mostra o botão Material', await tl.evaluate(() => document.querySelector('.mt-dica') && document.querySelector('.mt-dica').innerText.includes('Lavagem') && !document.querySelector('[data-act=tvmat]').hidden));
  await p.screenshot({path: path.join(OUT, 'controle-material.png')});
  await p.click('[data-act=matver]'); await p.waitForSelector('.dl.mt .mt-sl');
  ok('"Ver aqui" abre o capítulo na janela do controle', await p.evaluate(() => { const c = document.querySelector('.dl.mt').innerText; return c.includes('Slide 2 de 4') && c.includes('Lavagem das mãos') && c.includes('Molhe as mãos') && c.includes('Use sabão neutro') && c.includes('Seque com papel') }));
  ok('A sub-linha fica recuada', await p.evaluate(() => { const l = [...document.querySelectorAll('.mt-sl li')]; return parseInt(l[1].style.marginLeft) > parseInt(l[0].style.marginLeft) }));
  await p.screenshot({path: path.join(OUT, 'visor-controle.png')});
  await p.click('[data-act=matprox]'); await p.waitForTimeout(500);
  ok('Próximo mostra a tabela do slide 3 como texto', await p.evaluate(() => document.querySelector('.dl.mt').innerText.includes('Espuma') && document.querySelector('.dl.mt').innerText.includes('20 s')));
  await p.click('[data-act=matprox]'); await p.waitForTimeout(600);
  ok('O slide 4 mostra a imagem', await p.evaluate(() => { const i = document.querySelector('.mt-im img'); return !!i && i.src.startsWith('blob:') && i.naturalWidth > 0 }));
  ok('No último slide o botão Próximo desliga', await p.evaluate(() => document.querySelector('[data-act=matprox]').disabled));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok('Esc fecha o visor', await p.evaluate(() => !document.querySelector('#dlg').open));
  await p.click('[data-act=mattel]');
  ok('"Mostrar no telão" abre o capítulo por cima do telão', await espera(tl, () => { const o = document.querySelector('.matov'); return !!o && o.innerText.includes('Lavagem das mãos') && o.innerText.includes('Molhe as mãos') }, null, 4000));
  await tl.screenshot({path: path.join(OUT, 'telao-material.png')});
  const f0 = await p.evaluate(id => JSON.stringify(S.sessoes.find(x => x.id === id).fase), salaId);
  await tl.keyboard.press('ArrowRight'); await tl.waitForTimeout(400);
  ok('Seta dentro do material troca de slide, sem avançar a sala', await tl.evaluate(() => document.querySelector('.matov .mt-t').innerText.includes('Slide 3 de 4')) && await p.evaluate(id => JSON.stringify(S.sessoes.find(x => x.id === id).fase), salaId) === f0);
  await tl.keyboard.press('ArrowLeft'); await tl.waitForTimeout(300); await tl.keyboard.press('Escape'); await tl.waitForTimeout(200);
  ok('Esc fecha o material do telão', (await tl.locator('.matov').count()) === 0);
  await tl.keyboard.press('m'); await tl.waitForSelector('.matov');
  ok('A tecla M abre o capítulo da explicação atual', await tl.evaluate(() => document.querySelector('.matov .mt-t').innerText.includes('Slide 2 de 4')));
  await tl.keyboard.press('m'); await tl.waitForTimeout(200);
  ok('M de novo fecha', (await tl.locator('.matov').count()) === 0);
  ok('O material do telão usa o fundo escuro do telão', await tl.evaluate(() => { tvModo('padrao'); return true }) && await (async () => { await tl.keyboard.press('m'); await tl.waitForSelector('.matov'); const r = await tl.evaluate(() => getComputedStyle(document.querySelector('.matov')).backgroundColor); await tl.keyboard.press('m'); return r === 'rgb(10, 44, 43)' })());
  await tl.keyboard.press('p'); await tl.waitForTimeout(200); await tl.keyboard.press('m'); await tl.waitForSelector('.matov');
  ok('No modo projetor o material fica branco com texto preto', await tl.evaluate(() => { const c = getComputedStyle(document.querySelector('.matov')); return document.querySelector('.matov').classList.contains('proj') && c.backgroundColor === 'rgb(255, 255, 255)' && c.color === 'rgb(0, 0, 0)' }));
  await tl.waitForSelector('.matov .mt-sl'); await tl.screenshot({path: path.join(OUT, 'telao-material-projetor.png')}); await tl.keyboard.press('m'); await tl.keyboard.press('p'); await tl.waitForTimeout(200);
  await tl.keyboard.press('a'); await tl.waitForTimeout(300); await tl.keyboard.press('m'); await tl.waitForSelector('.matov'); await tl.keyboard.press(' '); await tl.keyboard.press('Enter'); await tl.waitForTimeout(500);
  ok('Em apresentação, Espaço e Enter no material não avançam a sala', await p.evaluate(id => JSON.stringify(S.sessoes.find(x => x.id === id).fase), salaId) === f0);
  await tl.keyboard.press('Escape'); await tl.keyboard.press('a'); await tl.waitForTimeout(200);
  await tl.click('.matov .mt-bar [data-act=matfechar]').catch(() => {});
  await p.click('[data-act=proxima]'); await p.waitForTimeout(500);
  ok('Na segunda explicação (slide 3) o controle mostra o outro capítulo', await p.evaluate(() => document.querySelector('.mt-ctl') && document.querySelector('.mt-ctl').innerText.includes('Tempos de contato')));
  await tl.keyboard.press('m'); await tl.waitForSelector('.matov');
  await p.click('[data-act=proxima]'); await p.waitForTimeout(700);
  ok('Ao ir para a pergunta o material fecha e o botão some', (await tl.locator('.matov').count()) === 0 && await tl.evaluate(() => document.querySelector('[data-act=tvmat]').hidden) && (await p.locator('.mt-ctl').count()) === 0);
  ok('A pergunta continua normal no telão', await tl.evaluate(() => document.querySelector('.tq h2') && document.querySelector('.tq h2').innerText.includes('Quando lavar')));

  // ---------- F. PDF com capítulos manuais
  const tp = await p.evaluate(() => { const t = criarDoZero('Manual em PDF', 80); t.itens.push({tipo: 'explicacao', enunciado: 'Ler o manual', texto: '', uso: 'avaliacao', tempo: 20}); salvar(); return t.id });
  await ir('#/editar/' + tp); await p.waitForSelector('.edit'); await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]');
  await anexar('manual.pdf');
  ok('PDF anexado com o capítulo "Documento inteiro"', await p.evaluate(t => { const m = treino(t).material; return m.tipo === 'pdf' && m.caps.length === 1 && m.caps[0].t === 'Documento inteiro' }, tp));
  ok('PDF mostra o formulário de capítulo (título e página)', (await p.locator('.mt-add').count()) === 1);
  await p.fill('#mt-ct', 'Parte prática'); await p.fill('#mt-cp', '3'); await p.click('.mt-add button[type=submit]'); await p.waitForTimeout(200);
  await p.fill('#mt-ct', 'Introdução'); await p.fill('#mt-cp', '2'); await p.click('.mt-add button[type=submit]'); await p.waitForTimeout(200);
  ok('Capítulos do PDF ficam em ordem de página', await p.evaluate(t => treino(t).material.caps.map(c => c.t + '@' + c.p).join(',') === 'Documento inteiro@1,Introdução@2,Parte prática@3', tp));
  await p.fill('#mt-ct', ''); await p.click('.mt-add button[type=submit]'); await p.waitForTimeout(150);
  ok('Título vazio não cria capítulo', await p.evaluate(t => treino(t).material.caps.length === 3, tp) && (await temp()).includes('título'));
  await p.fill('#mt-ct', 'Fora'); await p.fill('#mt-cp', '0'); await p.click('.mt-add button[type=submit]'); await p.waitForTimeout(150);
  ok('Página inválida é recusada', await p.evaluate(t => treino(t).material.caps.length === 3, tp));
  await p.click('[data-act=fechar]'); await p.waitForTimeout(150);
  await p.selectOption('#e-cap', '2'); await p.waitForTimeout(100);
  ok('A explicação liga ao capítulo do PDF', await p.evaluate(t => treino(t).itens[0].cap === 2, tp));
  await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]');
  await p.click('[data-act=mtcdel][data-i="1"]'); await p.waitForTimeout(200);
  ok('Apagar um capítulo anterior reajusta a ligação da explicação', await p.evaluate(t => { const x = treino(t); return x.material.caps.length === 2 && x.itens[0].cap === 1 && x.material.caps[1].t === 'Parte prática' }, tp));
  await p.click('[data-act=mtprev]'); await p.waitForSelector('.dl.mt iframe');
  ok('O visor do PDF usa o leitor do navegador (iframe blob na página 1)', await p.evaluate(() => { const f = document.querySelector('.dl.mt iframe'); return /^blob:.*#page=1$/.test(f.getAttribute('src')) && !!document.querySelector('.dl.mt a[target=_blank]') }));
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  const sp = await p.evaluate(tp => { const t = treino(tp); const s = {id: uid(), treinoId: t.id, versao: t.versao, itens: clone(t.itens), preset: 'aovivo', setores: [], instrutor: 'E', local: '', horas: '1', aj: Object.assign({}, AJ_PADRAO), estado: 'sala', titulo: t.titulo, meta: t.meta, chave: '111222', entrada: true, part: [{id: uid(), nome: 'M', setor: 'Campo', real: true, cor: 1}], resp: {}, fase: {etapa: 'espera', idx: -1, t0: 0, dur: 0}, sim: {on: false, alvo: 0}, criada: new Date().toISOString()}; S.sessoes.push(s); AO.id = s.id; salvar(); location.hash = '#/sala/' + s.id; return s.id }, tp);
  await p.waitForTimeout(400); await p.click('[data-act=proxima]'); await p.waitForTimeout(400); await p.click('[data-act=matver]'); await p.waitForSelector('.dl.mt iframe');
  ok('Capítulo do PDF abre na página dele', await p.evaluate(() => /#page=3$/.test(document.querySelector('.dl.mt iframe').getAttribute('src')) && document.querySelector('.dl.mt').innerText.includes('Parte prática')));
  ok('PDF não mostra setas de slide', await p.evaluate(() => document.querySelector('.mt-nav').hidden));
  await p.keyboard.press('Escape');

  // ---------- G. HTML sem scripts
  const th = await p.evaluate(() => { const t = criarDoZero('Manual HTML', 80); t.itens.push({tipo: 'explicacao', enunciado: 'Ler', texto: '', uso: 'avaliacao', tempo: 20}); salvar(); return t.id });
  await ir('#/editar/' + th); await p.waitForSelector('.edit'); await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]'); await anexar('doc.html');
  ok('HTML anexado com um capítulo', await p.evaluate(t => { const m = treino(t).material; return m.tipo === 'html' && m.caps.length === 1 }, th));
  await p.click('[data-act=mtprev]'); await p.waitForSelector('.dl.mt iframe');
  ok('O HTML abre isolado (sandbox vazio), sem rodar scripts', await p.evaluate(async () => { await new Promise(r => setTimeout(r, 600)); const f = document.querySelector('.dl.mt iframe'); return f.getAttribute('sandbox') === '' && !document.body.hasAttribute('x') }));
  await p.keyboard.press('Escape'); await p.click('[data-act=fechar]').catch(() => {});

  // ---------- H. trocar, remover, duplicar, excluir
  await ir('#/editar/' + tid); await p.waitForSelector('.edit'); await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]');
  await anexar('manual.pdf');
  ok('Trocar o arquivo desliga as ligações das explicações', await p.evaluate(t => { const x = treino(t); return x.material.tipo === 'pdf' && x.itens.every(i => i.cap === undefined) }, tid));
  await p.evaluate(t => { treino(t).itens[0].cap = 0; salvar(); }, tid);
  await p.evaluate(() => duplicar(UI.ed.id)); await p.waitForTimeout(600);
  ok('Duplicar o treinamento leva o material junto', await p.evaluate(async () => { const c = S.treinamentos[0]; const r = await matLer(c.id); return c.titulo.endsWith('(cópia)') && !!c.material && !!r && c.itens[0].cap === 0 }));
  await p.evaluate(() => document.querySelector('#dlg').close()); await ir('#/editar/' + tid); await p.waitForSelector('.edit'); await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]');
  await p.click('[data-act=mtdel]'); await p.waitForTimeout(300);
  ok('Remover apaga o arquivo, os capítulos e as ligações', await p.evaluate(async t => { const x = treino(t); return !x.material && x.itens.every(i => i.cap === undefined) && !(await matLer(t)) }, tid));
  ok('Sem material o seletor some do editor', await (async () => { await p.click('[data-act=fechar]'); await p.locator('.qi').nth(0).click(); return (await p.locator('#e-cap').count()) === 0 })());
  ok('Arquivo sem treinamento (órfão) é limpo', await p.evaluate(async () => { await matGravar('orfao-x', {blob: new Blob(['x']), nome: 'x.pdf', tipo: 'pdf'}); await matLimpaOrfaos(); return !(await matLer('orfao-x')) }));
  ok('Arquivo de treinamento existente não é limpo', await p.evaluate(async t => !!(await matLer(t)), th));
  ok('O estado continua leve (sem o arquivo dentro)', await p.evaluate(() => JSON.stringify(S).length < 200000));
  ok('Exportar o treinamento não leva o arquivo', await p.evaluate(t => { const o = treino(t); const v = validaTreino(JSON.parse(JSON.stringify({sabia: 'treinamento', titulo: o.titulo, meta: o.meta, itens: o.itens}))); return v && !v.material && v.itens.every(i => i.cap === undefined) }, tp));
  ok('Material de um aparelho sem o arquivo avisa em vez de quebrar', await p.evaluate(async () => { const t = criarDoZero('Sem arquivo', 80); t.itens.push({tipo: 'explicacao', enunciado: 'X', texto: '', uso: 'avaliacao', tempo: 20}); t.material = {nome: 'a.pdf', tipo: 'pdf', bytes: 10, caps: [{t: 'Tudo', p: 1}]}; t.itens[0].cap = 0; await matAbrir({tid: t.id, nome: 'a.pdf', tipo: 'pdf', caps: ['Tudo'], pg: [1]}, 0, 'ctl'); const r = document.querySelector('.dl.mt').innerText.includes('não está neste aparelho'); matFechar(); S.treinamentos.shift(); return r }));

  // ---------- I. celular e temas
  const pc = await pagina(await b.newContext({viewport: {width: 390, height: 800}, serviceWorkers: 'block', isMobile: true, hasTouch: true}), 'celular');
  await pc.goto(U + '?demo=1'); await pc.waitForSelector('.coach');
  await pc.evaluate(() => { location.hash = '#/inicio' });
  const idc = await pc.evaluate(async () => { const t = criarDoZero('Cel', 80); t.itens.push({tipo: 'explicacao', enunciado: 'A', texto: '', uso: 'avaliacao', tempo: 20}); salvar(); return t.id });
  await pc.evaluate(id => { location.hash = '#/editar/' + id }, idc); await pc.waitForSelector('.edit'); await pc.click('[data-act=painel]'); await pc.waitForSelector('.dl.pn'); await pc.click('.pn-t [data-v=material]');
  await pc.setInputFiles('#mt-arq', FX + 'aula.pptx'); await pc.waitForTimeout(900);
  ok('No celular a aba Material não rola para o lado', await pc.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('#dlg').scrollWidth <= document.querySelector('#dlg').clientWidth + 1));
  await pc.screenshot({path: path.join(OUT, 'painel-material-cel.png')});
  await pc.click('[data-act=mtprev]'); await pc.waitForSelector('.dl.mt .mt-sl');
  ok('No celular o visor ocupa a tela toda, sem rolar para o lado', await pc.evaluate(() => { const r = document.querySelector('#dlg').getBoundingClientRect(); return r.width >= innerWidth - 1 && document.documentElement.scrollWidth <= innerWidth }));
  await pc.screenshot({path: path.join(OUT, 'visor-cel.png')});
  ok('Botões do visor com 36 px ou mais', await pc.evaluate(() => [...document.querySelectorAll('.dl.mt .mt-bar .b')].every(b => b.getBoundingClientRect().height >= 36 && b.getBoundingClientRect().width >= 36)));
  await pc.emulateMedia({colorScheme: 'dark'}); await pc.waitForTimeout(200); await pc.screenshot({path: path.join(OUT, 'visor-cel-escuro.png')});
  ok('No escuro o visor usa fundo e texto do tema', await pc.evaluate(() => { const c = getComputedStyle(document.querySelector('.dl.mt')); return c.color !== 'rgb(0, 0, 0)' }));

  ok('Sem erros de JS', errs.length === 0, errs.slice(0, 3).join(' | '));
  fs.rmSync(GRANDE, {force: true}); console.log(log.join('\n')); console.log('\n' + log.filter(l => l.startsWith('OK')).length + ' OK / ' + log.filter(l => l.startsWith('FALHA')).length + ' FALHAS');
  await b.close(); srv.close(); mock.fecha();
})().catch(e => { console.log(log.join('\n')); console.error('ERRO', e); process.exit(1); });
