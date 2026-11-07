/* v1.5.0 · Apresentar (PDF desenhado página por página, painel, outra janela, controle -> telão) e prompt padrão da IA.
   uso: node teste-v15.js <dist> <pasta-de-prints> */
const {chromium} = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const D = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, {recursive: true});
const TIPOS = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json'};
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, {'content-type': TIPOS[path.extname(f)] || 'application/octet-stream'}); r.end(b) }) });
const log = []; const ok = (n, c, x = '') => { log.push((c ? 'OK   ' : 'FALHA ') + n + (x ? ' · ' + x : '')); };
const espera = async (p, fn, arg, ms = 10000) => { try { await p.waitForFunction(fn, arg, {timeout: ms}); return true } catch (e) { return false } };
const FX13 = [path.join(__dirname, 'fx13/'), path.join(__dirname, '../fx13/')].find(fs.existsSync);
const FX15 = [path.join(__dirname, 'fx15/'), path.join(__dirname, '../fx15/')].find(fs.existsSync);
/* cor do pixel a 8% da largura e no meio da altura da página desenhada */
const corPg = p => p.evaluate(() => { const c = document.querySelector('canvas.ap-pg'); if (!c || !c.width) return null; const d = c.getContext('2d').getImageData(Math.floor(c.width * 0.08), Math.floor(c.height * 0.5), 1, 1).data; return [d[0], d[1], d[2]] });
const perto = (a, b) => !!a && a.every((v, i) => Math.abs(v - b[i]) < 40);
const COR = [[14, 74, 72], [200, 90, 30], [47, 107, 58], [106, 61, 143], [31, 78, 121]];
const pgDe = p => p.evaluate(() => { const c = document.querySelector('canvas.ap-pg'); return c ? Number(c.dataset.pg || 0) : 0 });
const naPg = (p, n) => espera(p, n => { const c = document.querySelector('canvas.ap-pg'); return !!c && Number(c.dataset.pg) === n }, n);
(async () => {
  await new Promise(r => srv.listen(0, r)); const U = 'http://localhost:' + srv.address().port + '/';
  const b = await chromium.launch(); const errs = [];
  const pagina = async (ctx, nome) => { const p = await ctx.newPage(); p.on('pageerror', e => !/sandboxed and lacks/.test(e.message) && errs.push(nome + ': ' + e.message)); return p; };
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'block', permissions: ['clipboard-read', 'clipboard-write']});
  const p = await pagina(ctx, 'instrutor');
  await p.goto(U + '?demo=1'); await p.waitForSelector('.coach');
  const ir = async h => { await p.evaluate(h => { location.hash = h }, h); await p.waitForTimeout(250) };
  const novo = (titulo) => p.evaluate(t => { const x = criarDoZero(t, 80); x.itens.push({tipo: 'explicacao', enunciado: 'Abertura', texto: 'Texto.', uso: 'avaliacao', tempo: 20}, {tipo: 'multipla', enunciado: 'Quando lavar?', alternativas: ['A', 'B', 'C', 'D'], correta: 1, tempo: 20, uso: 'avaliacao', porque: 'Porque sim.'}); salvar(); return x.id }, titulo);
  const abrirMat = async tid => { await ir('#/editar/' + tid); await p.waitForSelector('.edit'); await p.click('[data-act=painel]'); await p.waitForSelector('.dl.pn'); await p.click('.pn-t [data-v=material]'); await p.waitForTimeout(150); };
  const anexar = async f => { await p.setInputFiles('#mt-arq', f); await espera(p, () => !/Lendo/.test((document.querySelector('#mt-st') || {}).textContent || ''), null, 15000); await p.waitForTimeout(300); };

  // ---------- A. PDF exportado de apresentação: capítulos automáticos, um por slide
  const t1 = await novo('Higiene das mãos');
  await abrirMat(t1); await anexar(FX15 + 'slides.pdf');
  const caps = await p.evaluate(t => treino(t).material.caps, t1);
  ok('PDF de slides ganha um capítulo por página, com o título do slide', caps.length === 5 && caps[0].t === 'Higiene das mãos' && caps[1].t === 'Lavagem das mãos' && caps[4].t === 'Resumo' && caps.every((c, i) => c.p === i + 1), JSON.stringify(caps));
  ok('O painel tem Apresentar e Abrir em outra tela', (await p.locator('[data-act=aprpainel]').count()) === 1 && (await p.locator('[data-act=aprjanela]').count()) === 1);
  ok('Sem a dica do PPTX quando o material é PDF', (await p.locator('.ap-dica').count()) === 0);
  await p.click('[data-act=aprpainel]'); await p.waitForSelector('.matov.ap-apr canvas.ap-pg'); await naPg(p, 1);
  ok('Apresentar abre por cima, com a página desenhada (não o leitor do navegador)', (await p.locator('.matov iframe').count()) === 0 && perto(await corPg(p), COR[0]), JSON.stringify(await corPg(p)));
  ok('O título mostra a página e o capítulo', (await p.locator('.matov .mt-t').innerText()).includes('Página 1 de 5') && (await p.locator('.matov .mt-t').innerText()).includes('Higiene das mãos'));
  ok('A página cabe inteira na tela, sem rolagem', await p.evaluate(() => { const c = document.querySelector('canvas.ap-pg').getBoundingClientRect(); return c.bottom <= innerHeight + 1 && c.right <= innerWidth + 1 && c.width > 600 }));
  await p.screenshot({path: path.join(OUT, 'apresentar-pdf.png')});
  await p.keyboard.press('ArrowRight'); await naPg(p, 2);
  ok('Seta para a direita passa para a página 2 (cor do slide 2)', perto(await corPg(p), COR[1]), JSON.stringify(await corPg(p)));
  await p.keyboard.press(' '); await naPg(p, 3);
  ok('Espaço também passa', await pgDe(p) === 3);
  await p.keyboard.press('ArrowLeft'); await naPg(p, 2);
  ok('Seta para a esquerda volta', await pgDe(p) === 2);
  await p.selectOption('.ap-cap', '4'); await naPg(p, 5);
  ok('A lista de capítulos pula para o slide escolhido', perto(await corPg(p), COR[4]) && (await p.locator('.matov .mt-t').innerText()).includes('Resumo'));
  ok('Na última página o botão Próximo fica desligado', await p.locator('.matov [data-act=matprox]').isDisabled());
  const box = await p.locator('.matov .mt-c').boundingBox();
  await p.mouse.click(box.x + box.width * 0.1, box.y + box.height * 0.5); await naPg(p, 4);
  ok('Tocar no lado esquerdo volta uma página', await pgDe(p) === 4);
  await p.mouse.click(box.x + box.width * 0.9, box.y + box.height * 0.5); await naPg(p, 5);
  ok('Tocar no lado direito passa uma página', await pgDe(p) === 5);
  await p.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5); await p.mouse.down(); await p.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5, {steps: 5}); await p.mouse.up(); await naPg(p, 4);
  ok('Arrastar para a direita volta uma página', await pgDe(p) === 4);
  ok('A barra tem Tela cheia', (await p.locator('.matov [data-act=aprtela]').count()) === 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok('Esc sai da apresentação', (await p.locator('.matov').count()) === 0);
  ok('Apresentar fecha o painel (que é modal) para o visor receber o toque', (await p.locator('#dlg[open]').count()) === 0);
  await abrirMat(t1);
  await p.click('[data-act=mtprev]'); await p.waitForSelector('.dl.mt canvas.ap-pg'); await naPg(p, 1);
  ok('"Ver o material" também desenha o PDF, dentro da janela', perto(await corPg(p), COR[0]) && (await p.locator('.dl.mt iframe').count()) === 0);
  await p.click('.dl.mt [data-act=matprox]'); await naPg(p, 2);
  ok('O botão Próximo do visor troca a página do PDF', await pgDe(p) === 2);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);

  // ---------- B. manual com marcadores: capítulos pelos marcadores
  const t2 = await novo('Manual');
  await abrirMat(t2); await anexar(FX15 + 'manual-marcadores.pdf');
  const caps2 = await p.evaluate(t => treino(t).material.caps, t2);
  ok('PDF com marcadores ganha os capítulos dos marcadores, em ordem de página', caps2.length === 4 && caps2.map(c => c.t).join('|') === 'Introdução|Equipamentos|Procedimento|Registros' && caps2.every((c, i) => !i || c.p > caps2[i - 1].p), JSON.stringify(caps2));
  await p.click('[data-act=fechar]').catch(() => {});

  // ---------- C. PPTX: dica de salvar como PDF; Apresentar mostra texto e imagens
  const t3 = await novo('Ordenha');
  await abrirMat(t3); await anexar(FX13 + 'aula.pptx');
  ok('Com PPTX, o painel ensina a salvar como PDF para apresentar', /salve como PDF no PowerPoint/.test(await p.locator('.ap-dica').innerText().catch(() => '')));
  await p.click('[data-act=aprpainel]'); await p.waitForSelector('.matov.ap-apr .mt-sl');
  ok('Apresentar o PPTX mostra o slide em texto', (await p.locator('.matov .mt-t').innerText()).includes('Slide 1 de'));
  await p.keyboard.press(' '); await espera(p, () => document.querySelector('.matov .mt-t').innerText.includes('Slide 2 de'));
  ok('No PPTX, Espaço passa para o próximo slide', (await p.locator('.matov .mt-t').innerText()).includes('Slide 2 de'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.click('[data-act=fechar]').catch(() => {});

  // ---------- D. outra janela (#/apresentar/:id)
  const w = await pagina(ctx, 'janela'); await w.goto(U + '#/apresentar/' + t1); await w.waitForSelector('.ap-ini');
  ok('A tela de apresentar em outra janela mostra o treinamento e os dois botões', (await w.locator('.ap-ini').innerText()).includes('Higiene das mãos') && (await w.locator('[data-act=aprcomecar]').count()) === 2);
  await w.click('[data-act=aprcomecar][data-v="0"]'); await w.waitForSelector('.matov canvas.ap-pg'); await naPg(w, 1);
  ok('Começar nesta janela abre a página 1', perto(await corPg(w), COR[0]));
  await w.keyboard.press('Escape'); await w.waitForTimeout(300);
  ok('Esc na outra janela (sem janela de origem) volta ao editor', /#\/editar\//.test(w.url()));
  await w.close();

  // ---------- E. sala: o controle apresenta no telão a qualquer momento
  const sid = await p.evaluate(tid => { const t = treino(tid); const s = {id: uid(), treinoId: t.id, versao: t.versao, itens: clone(t.itens), preset: 'aovivo', setores: [], instrutor: 'Elias', local: '', horas: '1', aj: Object.assign({}, AJ_PADRAO), estado: 'sala', titulo: t.titulo, meta: t.meta, chave: '482916', entrada: true, part: [], resp: {}, fase: {etapa: 'espera', idx: -1, t0: 0, dur: 0}, sim: {on: false, alvo: 0}, criada: new Date().toISOString()}; S.sessoes.push(s); AO.id = s.id; s.part.push({id: uid(), nome: 'Maria Teste', setor: 'Campo', real: true, cor: 1}); salvar(); location.hash = '#/sala/' + s.id; return s.id }, t1);
  await p.waitForSelector('.sala .ap-ctl');
  ok('Na espera, o controle já oferece Apresentar no telão', (await p.locator('.ap-ctl [data-act=aprtel]').count()) === 1);
  const tl = await pagina(ctx, 'telao'); await tl.setViewportSize({width: 1280, height: 720});
  await tl.goto(U + '#/telao/' + sid); await tl.waitForSelector('.telfull .tel'); await p.waitForTimeout(400);
  await p.click('[data-act=aprtel]'); await tl.waitForSelector('.matov.ap-apr canvas.ap-pg'); await naPg(tl, 1);
  ok('O telão abre a apresentação na página 1', perto(await corPg(tl), COR[0]));
  ok('O controle mostra o que está no telão', await espera(p, () => { const c = document.querySelector('.ap-ctl.on'); return !!c && c.innerText.includes('página 1 de 5') }));
  await tl.screenshot({path: path.join(OUT, 'telao-apresentar.png')}); await p.screenshot({path: path.join(OUT, 'controle-apresentar.png')});
  await p.click('.ap-ctl [data-act=aprctl][data-d="1"]'); await naPg(tl, 2);
  ok('Próxima no controle passa a página do telão', await pgDe(tl) === 2 && await espera(p, () => document.querySelector('.ap-ctl.on').innerText.includes('página 2 de 5')));
  await tl.keyboard.press('ArrowRight'); await naPg(tl, 3);
  ok('Passar no teclado do telão atualiza o controle', await espera(p, () => document.querySelector('.ap-ctl.on').innerText.includes('página 3 de 5')));
  await p.click('[data-act=proxima]'); await p.waitForTimeout(700);
  ok('Avançar a sala não fecha a apresentação aberta pelo controle', (await tl.locator('.matov.ap-apr').count()) === 1);
  await tl.keyboard.press(' '); await naPg(tl, 4);
  ok('No telão, Espaço passa a página e não avança a sala', await pgDe(tl) === 4 && await p.evaluate(id => S.sessoes.find(x => x.id === id).fase.idx, sid) === 0);
  await p.click('[data-act=aprparar]'); await espera(tl, () => !document.querySelector('.matov'));
  ok('Voltar ao quiz fecha o material no telão', (await tl.locator('.matov').count()) === 0 && (await p.locator('.ap-ctl.on').count()) === 0);
  await tl.close();

  // ---------- F. prompt padrão
  await ir('#/treinos'); await p.evaluate(() => dlgIA()); await p.waitForSelector('.ia-pad');
  const pr = await p.evaluate(() => PROMPT_PADRAO);
  ok('A tela "Criar com uma IA" tem o prompt padrão', (await p.locator('.ia-pad [data-act=iapadrao]').count()) === 1);
  ok('O prompt pede os 3 formatos misturados', /múltipla escolha/.test(pr) && /verdadeiro ou falso/.test(pr) && /sequência/.test(pr) && /4 de múltipla escolha, 3 de verdadeiro ou falso e 3 de sequência/.test(pr));
  ok('O prompt pede arquivo .json no formato do Sabiá e termina no conteúdo', /treinamento-sabia\.json/.test(pr) && pr.includes('"origem":"sabia-ia"') && /CONTEÚDO DO TREINAMENTO\n\(cole aqui/.test(pr));
  ok('O prompt manda usar só o conteúdo enviado', /SOMENTE o conteúdo enviado/.test(pr));
  await p.click('[data-act=iapadrao]'); await p.waitForTimeout(300);
  const cola = await p.evaluate(() => navigator.clipboard.readText()).catch(() => '');
  ok('Copiar prompt padrão põe o texto inteiro na área de transferência', cola === pr, String(cola.length));
  ok('O campo do material aceita até 50 mil letras', (await p.locator('#ia-m').getAttribute('maxlength')) === '50000');
  await p.screenshot({path: path.join(OUT, 'prompt-padrao.png')});
  await p.click('#dlg [data-act=fechar]').catch(() => {});

  // ---------- G. importar o arquivo que a IA devolve
  const resposta = 'Aqui está o arquivo:\n```json\n' + JSON.stringify({origem: 'sabia-ia', titulo: 'Higiene na colheita', meta: 80, descricao: 'Treino curto', itens: [
    {tipo: 'explicacao', enunciado: 'Mãos limpas', texto: 'Lave antes\nSeque bem'},
    {tipo: 'multipla', enunciado: 'Quando lavar as mãos?', alternativas: ['Antes de colher', 'Só no fim', 'Nunca', 'Uma vez por semana'], correta: 0, tempo: 20, uso: 'avaliacao', porque: 'Antes de tocar na fruta.'},
    {tipo: 'vf', enunciado: 'Luva rasgada pode continuar.', alternativas: ['Verdadeiro', 'Falso'], correta: 1, tempo: 15, uso: 'avaliacao', porque: 'Troque na hora.'},
    {tipo: 'ordenar', enunciado: 'Coloque na ordem', alternativas: ['Molhar', 'Ensaboar', 'Enxaguar', 'Secar'], correta: 2, tempo: 45, uso: 'avaliacao', porque: 'É a ordem certa.'}]}) + '\n```\nBom treinamento!';
  const imp = await p.evaluate(async txt => { const n0 = S.treinamentos.length; importarArquivo(new File([txt], 'treinamento-sabia.json', {type: 'application/json'})); await new Promise(r => setTimeout(r, 600)); const t = S.treinamentos[0]; return {novo: S.treinamentos.length === n0 + 1, ia: !!t.ia, titulo: t.titulo, tipos: t.itens.map(i => i.tipo).join(','), ordCorreta: t.itens[3].correta, vf: t.itens[2].alternativas, tempoVf: t.itens[2].tempo} }, resposta);
  ok('Importar o arquivo da IA (mesmo com texto e marcas em volta) cria o treinamento', imp.novo && imp.titulo === 'Higiene na colheita' && imp.tipos === 'explicacao,multipla,vf,ordenar', JSON.stringify(imp));
  ok('O treinamento importado da IA vem marcado para conferir', imp.ia && imp.ordCorreta === undefined && imp.vf.join() === 'Verdadeiro,Falso' && imp.tempoVf === 15);
  const imp2 = await p.evaluate(async () => { const n0 = S.treinamentos.length; importarArquivo(new File(['isto não é json'], 'x.json')); await new Promise(r => setTimeout(r, 400)); return S.treinamentos.length === n0 });
  ok('Arquivo que não é treinamento continua recusado', imp2);

  // ---------- H. celular (390 px): apresentar cabe na tela
  const cel = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, serviceWorkers: 'block'});
  const c = await pagina(cel, 'celular-instrutor'); await c.goto(U + '?demo=1'); await c.waitForSelector('.coach');
  await c.evaluate(async b64 => { const t = criarDoZero('No celular', 80); salvar(); const bin = Uint8Array.from(atob(b64), x => x.charCodeAt(0)); const r = await matAnexar(t, new File([bin], 'slides.pdf', {type: 'application/pdf'})); window.__t = t.id; return r }, fs.readFileSync(FX15 + 'slides.pdf').toString('base64'));
  await c.evaluate(() => aprAbrir(aprMatDe(treino(window.__t)), {})); await c.waitForSelector('.matov canvas.ap-pg'); await naPg(c, 1);
  ok('No celular a página cabe na largura, sem rolagem para o lado', await c.evaluate(() => { const r = document.querySelector('canvas.ap-pg').getBoundingClientRect(); return r.right <= innerWidth + 1 && r.width > 300 && document.documentElement.scrollWidth <= innerWidth + 1 }));
  ok('No celular os botões da barra têm 36 px ou mais', await c.evaluate(() => [...document.querySelectorAll('.matov .mt-bar .b')].filter(x => x.offsetParent).every(x => { const r = x.getBoundingClientRect(); return r.height >= 36 && r.width >= 36 })));
  await c.screenshot({path: path.join(OUT, 'celular-apresentar.png')});
  const cb = await c.locator('.matov .mt-c').boundingBox();
  await c.touchscreen.tap(cb.x + cb.width * 0.9, cb.y + cb.height * 0.5); await naPg(c, 2);
  ok('No celular, tocar à direita passa a página', await pgDe(c) === 2);
  await cel.close();

  // ---------- I. sem internet: o leitor de PDF fica guardado
  const off = await b.newContext({viewport: {width: 1280, height: 800}});
  const o = await pagina(off, 'offline'); await o.goto(U + '?demo=1'); await o.waitForSelector('.coach');
  const guardou = await espera(o, async () => { await navigator.serviceWorker.ready; const ks = await caches.keys(); for (const k of ks) { const c2 = await caches.open(k); const l = (await c2.keys()).map(r => r.url); if (l.some(u => u.endsWith('lib/pdfjs/pdf.min.js')) && l.some(u => u.endsWith('lib/pdfjs/pdf.worker.min.js'))) return true; } return false }, null, 30000);
  ok('O app guarda o leitor de PDF para usar sem internet', guardou);
  await off.setOffline(true); await o.reload(); await o.waitForSelector('.coach');
  await o.evaluate(async b64 => { const t = criarDoZero('Sem internet', 80); salvar(); const bin = Uint8Array.from(atob(b64), x => x.charCodeAt(0)); await matAnexar(t, new File([bin], 'slides.pdf', {type: 'application/pdf'})); window.__t = t.id; }, fs.readFileSync(FX15 + 'slides.pdf').toString('base64'));
  await o.evaluate(() => aprAbrir(aprMatDe(treino(window.__t)), {}));
  ok('Sem internet o PDF é desenhado e ganha capítulos', await o.waitForSelector('.matov canvas.ap-pg', {timeout: 15000}).then(() => naPg(o, 1)).catch(() => false) && perto(await corPg(o), COR[0]) && await o.evaluate(() => treino(window.__t).material.caps.length === 5));
  await off.close();

  ok('Sem erros de JavaScript', errs.length === 0, errs.slice(0, 4).join(' | '));
  await b.close(); srv.close();
  const f = log.filter(l => l.startsWith('FALHA')).length; console.log(log.join('\n')); console.log((log.length - f) + ' OK / ' + f + ' FALHAS'); process.exit(0);
})();
