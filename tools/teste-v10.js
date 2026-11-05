/* v1.0.0 · banco de perguntas, criar com IA, pergunta de teste, voz gravada, telão com voz, carimbo de tempo.
   uso: node teste-v10.js <dist> <pasta-de-prints>   (o Firebase de mentira roda COM as regras de docs/firebase-rules.json) */
const {chromium} = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const {criar} = require('./rtdb-mock.js');
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
  const Q1 = {tipo: 'multipla', enunciado: 'Quando lavar as mãos antes da ordenha?', alternativas: ['Só no fim do dia', 'Sempre, antes de tocar no animal', 'Quando estiverem sujas', 'Nunca'], correta: 1, tempo: 20, uso: 'avaliacao', porque: 'A mão limpa evita contaminar o leite.'};
  const Q2 = {tipo: 'vf', enunciado: 'Luva suja pode ser usada duas vezes.', alternativas: ['Verdadeiro', 'Falso'], correta: 1, tempo: 20, uso: 'avaliacao', porque: 'Luva suja contamina.'};

  // ---------- A. banco de perguntas
  const tid = await p.evaluate(([a, b]) => { const t = criarDoZero('Higiene da ordenha', 80); t.itens.push(clone(a), clone(b)); salvar(); return t.id }, [Q1, Q2]);
  await ir('#/editar/' + tid); await p.waitForSelector('.edit');
  ok('Editor mostra o botão do banco', (await p.locator('[data-act=bnabrir]').count()) === 1 && (await p.locator('[data-act=bnguardar]').count()) === 1);
  await p.click('[data-act=bnguardar]'); ok('Guardar a pergunta no banco', await p.evaluate(() => S.banco.length === 1 && S.banco[0].enunciado.startsWith('Quando lavar') && S.banco[0].de === 'Higiene da ordenha'));
  await p.click('[data-act=bnguardar]'); ok('A mesma pergunta não entra duas vezes', await p.evaluate(() => S.banco.length === 1) && await tem(p, 'já está no banco', '#toast'));
  await p.click('[data-act=bnabrir]'); await p.waitForSelector('.bn-i');
  ok('O banco abre e lista a pergunta', (await p.locator('.bn-i').count()) === 1);
  ok('A pergunta aparece como já está no treinamento', (await p.locator('.bn-a .chip.ok').count()) === 1);
  await p.click('[data-act=bntodas]'); await p.waitForSelector('.bn-i >> nth=1');
  ok('Guardar as deste treinamento só soma as novas', await p.evaluate(() => S.banco.length === 2));
  await p.fill('#bn-q', 'luva'); await p.waitForTimeout(150);
  ok('Busca acha por palavra', (await p.locator('.bn-i').count()) === 1 && (await p.locator('.bn-t b').first().innerText()).includes('Luva'));
  await p.fill('#bn-q', 'LAVAR MAOS'); await p.waitForTimeout(100);
  ok('Busca ignora maiúsculas e acentos, mas exige a palavra inteira na ordem', (await p.locator('.bn-i').count()) === 0 && await tem(p, 'Nenhuma pergunta encontrada', '#bn-l'));
  await p.fill('#bn-q', 'ordenha'); await p.selectOption('#bn-tp', 'vf'); await p.waitForTimeout(100);
  const fv = await p.locator('.bn-i').count(); await p.selectOption('#bn-tp', 'ordenar'); await p.waitForTimeout(100);
  ok('Filtro por formato', fv === 1 && (await p.locator('.bn-i').count()) === 0);
  await p.selectOption('#bn-tp', ''); await p.fill('#bn-q', '');
  const tid2 = await p.evaluate(() => criarDoZero('Outro treino', 80).id);
  await p.click('[data-act=fechar]'); await ir('#/editar/' + tid2); await p.waitForSelector('.edit');
  await p.click('[data-act=bnabrir]'); await p.waitForSelector('.bn-i');
  await p.screenshot({path: OUT + '/v-banco.png'});
  await p.locator('.bn-i').first().locator('[data-act=bninserir]').click(); await p.waitForTimeout(150);
  const ins = await p.evaluate(id => { const t = S.treinamentos.find(x => x.id === id); return {n: t.itens.length, bid: t.itens[0] && t.itens[0].bid, de: t.itens[0] && t.itens[0].de, sujo: t.sujo, sel: UI.ed.sel} }, tid2);
  ok('Inserir traz uma cópia limpa para o treinamento aberto', ins.n === 1 && !ins.bid && !ins.de && ins.sujo === true && ins.sel === 0, JSON.stringify(ins));
  ok('A inserção vira "já está aqui" sem fechar o banco', (await p.locator('.bn-a .chip.ok').count()) === 1 && await p.locator('#dlg').evaluate(d => d.open));
  await p.locator('.bn-i').first().locator('[data-act=bnexcluir]').click(); await p.waitForTimeout(150);
  ok('Excluir do banco', await p.evaluate(() => S.banco.length === 1));
  await p.click('[data-act=bndesfazer]'); await p.waitForTimeout(150);
  ok('Desfazer devolve a pergunta ao banco', await p.evaluate(() => S.banco.length === 2));
  await p.click('[data-act=fechar]');
  const exp = await p.evaluate(() => JSON.parse(JSON.stringify({sabia: 'tudo', dados: S})));
  ok('Exportar tudo leva o banco', exp.dados.banco.length === 2);
  await p.evaluate(async d => { S.banco = []; const f = new File([JSON.stringify({sabia: 'tudo', versao: '1.0.0', dados: d})], 'x.json'); importarArquivo(f); }, exp.dados);
  ok('Importar tudo traz o banco de volta', await espera(p, () => S.banco && S.banco.length === 2, null));

  // ---------- B. criar com IA
  await ir('#/treinos'); await p.waitForSelector('[data-act=novo]');
  await p.click('[data-act=novo]'); ok('O menu de novo treinamento oferece criar com IA', (await p.locator('#dlg [data-act=dlgia]').count()) === 1);
  await p.click('[data-act=dlgia]'); await p.waitForSelector('#ia-t');
  await p.click('#dlg .b.p[type=submit]'); ok('Sem assunto não monta o texto', (await p.locator('#ia-out').count()) === 0);
  await p.fill('#ia-t', 'Lavagem das mãos antes da ordenha'); await p.fill('#ia-p', 'ordenhadores novos'); await p.selectOption('#ia-n', '8'); await p.fill('#ia-m', 'POP 12: lavar as mãos por 20 segundos com sabão.');
  await p.click('#dlg .b.p[type=submit]'); await p.waitForSelector('#ia-out');
  const pr = await p.inputValue('#ia-out');
  ok('O texto para a IA leva assunto, público, quantidade e material', pr.includes('Lavagem das mãos antes da ordenha') && pr.includes('ordenhadores novos') && pr.includes('8 perguntas') && pr.includes('POP 12') && pr.includes('SOMENTE o material'));
  ok('O texto explica o formato JSON', pr.includes('"tipo":"multipla"') && pr.includes('"correta" é o número') && pr.includes('sem marcas de código'));
  ok('Os campos preenchidos sobrevivem a montar o texto', (await p.inputValue('#ia-t')).startsWith('Lavagem') && (await p.inputValue('#ia-n')) === '8');
  await p.screenshot({path: OUT + '/v-ia.png'});
  await p.click('[data-act=iacriar]'); ok('Criar sem colar a resposta avisa', await tem(p, 'Cole primeiro', '#ia-erro'));
  await p.fill('#ia-r', 'Claro! Aqui está sua resposta, mas sem JSON.'); await p.click('[data-act=iacriar]');
  ok('Resposta que não é JSON é recusada com explicação', await tem(p, 'Não consegui ler', '#ia-erro') && await p.evaluate(() => !S.treinamentos.some(t => t.ia)));
  const resp = 'Claro! Segue o treinamento:\n```json\n' + JSON.stringify({titulo: 'Lavagem das mãos', meta: 85, descricao: 'Antes da ordenha', itens: [
    {tipo: 'explicacao', enunciado: 'Por que lavar as mãos', texto: 'Evita contaminar o leite\nProtege o animal'},
    {tipo: 'multipla', enunciado: 'Por quanto tempo lavar as mãos?', alternativas: ['5 segundos', '20 segundos', '1 segundo'], correta: 1, tempo: 20, uso: 'avaliacao', porque: 'Segundo o POP 12.', audio: 'javascript:alert(1)'},
    {tipo: 'vf', enunciado: '<img src=x onerror="window.__xss=1"> Pode lavar só com água?', alternativas: ['x'], correta: 1, tempo: 20, uso: 'avaliacao', porque: 'Precisa de sabão.'},
    {tipo: 'ordenar', enunciado: 'Ordene a lavagem', alternativas: ['Molhar as mãos', 'Passar o sabão', 'Esfregar por 20 s', 'Enxaguar'], correta: 3, tempo: 45, uso: 'avaliacao', porque: ''},
    {tipo: 'inventado', enunciado: 'Isto não existe'}, {tipo: 'multipla', enunciado: '', alternativas: ['a', 'b'], correta: 0}]}) + '\n```\nEspero ter ajudado!';
  await p.fill('#ia-r', resp); await p.click('[data-act=iacriar]'); await p.waitForSelector('.edit');
  const ia = await p.evaluate(() => { const t = S.treinamentos.find(x => x.ia); return t && {tit: t.titulo, meta: t.meta, n: t.itens.length, tipos: t.itens.map(i => i.tipo).join(','), audio: t.itens.some(i => i.audio), vf: t.itens[2].alternativas.join('|'), ord: t.itens[3].correta, nota: t.versoes[0].nota} });
  ok('Criou o treinamento a partir da resposta da IA (com texto antes e depois e cercas)', ia && ia.tit === 'Lavagem das mãos' && ia.meta === 85 && ia.n === 4, JSON.stringify(ia));
  ok('Formato inventado e pergunta sem enunciado ficam de fora', ia && ia.tipos === 'explicacao,multipla,vf,ordenar');
  ok('Áudio malicioso e V ou F incompleto são corrigidos', ia && !ia.audio && ia.vf === 'Verdadeiro|Falso' && ia.ord === undefined);
  ok('A versão 0 diz que veio da IA', ia && ia.nota.includes('IA'));
  ok('O editor avisa que veio da IA e pede conferência', (await p.locator('.ia-av').count()) === 1 && await tem(p, 'confira antes de aplicar', '.ia-av'));
  ok('HTML dentro da pergunta não executa', await p.evaluate(() => window.__xss === undefined));
  await p.screenshot({path: OUT + '/v-ia-editor.png'});
  await ir('#/aplicar/' + await p.evaluate(() => S.treinamentos.find(x => x.ia).id)); await p.waitForSelector('.apl');
  ok('Aplicar repete o aviso de conferência', (await p.locator('.ia-av').count()) === 1);
  await ir('#/editar/' + await p.evaluate(() => S.treinamentos.find(x => x.ia).id)); await p.waitForSelector('.ia-av');
  await p.click('[data-act=iarevisei]'); await p.waitForTimeout(150);
  ok('Já revisei tira o aviso', (await p.locator('.ia-av').count()) === 0 && await p.evaluate(() => !S.treinamentos.some(t => t.ia)));

  // ---------- C. pergunta de teste no começo
  await ir('#/aplicar/' + tid); await p.waitForSelector('.apl');
  await p.click('details.adv summary'); ok('Aplicar oferece começar com pergunta de teste (desligado por padrão)', (await p.locator('[data-aj=aquece]').count()) === 1 && !(await p.locator('[data-aj=aquece]').isChecked()));
  await p.check('[data-aj=aquece]'); await p.click('[data-act=preparar]'); await p.waitForTimeout(250);
  const aq = await p.evaluate(() => { const s = S.sessoes[S.sessoes.length - 1]; return {n: s.itens.length, p: s.itens[0], vale: vale(s.itens[0]), r: s.itens.filter(vale).length} });
  ok('A sessão ganha a pergunta de teste no começo', aq.n === 3 && aq.p.aquece && aq.p.uso === 'ensaio' && !aq.vale && aq.r === 2, JSON.stringify({n: aq.n, r: aq.r}));
  ok('O treinamento em si não muda', await p.evaluate(id => S.treinamentos.find(t => t.id === id).itens.length === 2, tid));
  await p.evaluate(() => { const s = S.sessoes[S.sessoes.length - 1]; aquecer(s); aquecer(s); });
  ok('Chamar duas vezes não duplica', await p.evaluate(() => S.sessoes[S.sessoes.length - 1].itens.length === 3));

  // ---------- D. voz gravada
  await ir('#/editar/' + tid); await p.waitForSelector('.edit');
  ok('A pergunta tem o bloco de voz', (await p.locator('#vz-box [data-act=vozgravar]').count()) === 1 && (await p.locator('#vz-box [data-act=vozgravar]').isEnabled()));
  await p.click('[data-act=vozgravar]'); ok('Gravando mostra o cronômetro', await tem(p, 'Gravando', '#vz-t'));
  await p.screenshot({path: OUT + '/v-voz-gravando.png'});
  await p.waitForTimeout(1600); await p.click('[data-act=vozparar]');
  ok('A gravação é guardada na pergunta', await espera(p, () => { const t = S.treinamentos.find(x => x.titulo === 'Higiene da ordenha'); return t.itens[0].audio && /^data:audio\//.test(t.itens[0].audio) }, null, 6000));
  const tam = await p.evaluate(() => S.treinamentos.find(x => x.titulo === 'Higiene da ordenha').itens[0].audio.length);
  ok('A gravação cabe no limite', tam > 500 && tam < 600000, tam + ' caracteres');
  ok('O player e os botões Regravar e Remover aparecem', (await p.locator('#vz-box audio').count()) === 1 && (await p.locator('[data-act=vozdel]').count()) === 1);
  ok('Gravar marca o treinamento como alterado', await p.evaluate(() => S.treinamentos.find(x => x.titulo === 'Higiene da ordenha').sujo === true));
  ok('A prévia do telão mostra o botão Ouvir', (await p.locator('#edTel .tvoz').count()) === 1);
  await p.screenshot({path: OUT + '/v-voz-editor.png', fullPage: false});
  const impo = await p.evaluate(() => { const t = S.treinamentos.find(x => x.titulo === 'Higiene da ordenha'); const o = validaTreino(JSON.parse(JSON.stringify({titulo: t.titulo, meta: t.meta, itens: t.itens}))); return !!(o && o.itens[0].audio) });
  ok('Exportar e importar o treinamento mantém a voz', impo);
  ok('Banco não leva a voz', await p.evaluate(() => { guardarNoBanco(S.treinamentos.find(x => x.titulo === 'Higiene da ordenha').itens, 'x'); return S.banco.every(i => !i.audio) }));
  await p.click('[data-act=vozdel]'); ok('Remover a voz', await p.evaluate(() => !S.treinamentos.find(x => x.titulo === 'Higiene da ordenha').itens[0].audio));
  await p.click('#tAcao'); ok('Desfazer devolve a voz', await p.evaluate(() => !!S.treinamentos.find(x => x.titulo === 'Higiene da ordenha').itens[0].audio));

  // ---------- E. telão com voz e nada de voz no Firebase
  await p.evaluate(u => { S.cfg.fbUrl = u; salvar() }, mock.url);
  await ir('#/aplicar/' + tid); await p.waitForSelector('.apl'); await p.click('[data-act=abrirsala]'); await p.waitForSelector('.sala');
  const sid = await p.evaluate(() => AO.id);
  const chave = (await p.textContent('#cod')).replace(/\D/g, '');
  const link = await p.getAttribute('[data-act=copiar]', 'data-v');
  const T = await pagina(ctx, 'telao'); await T.goto(U + '#/telao/' + sid); await T.waitForSelector('.telfull');
  const C = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, serviceWorkers: 'block'});
  await C.addInitScript(() => { window.__fala = []; window.__canc = 0; try { Object.defineProperty(window, 'speechSynthesis', {value: {speak(u) { window.__fala.push(u.text); setTimeout(() => u.onend && u.onend(), 50) }, cancel() { window.__canc++ }, getVoices() { return [] }}, configurable: true}); } catch (e) {} });
  const A = await pagina(C, 'celular'); await A.goto(link); await A.waitForSelector('#ce-n');
  await A.fill('#ce-n', 'Maria Silva'); await A.click('button[type=submit]'); ok('Celular entra na sala', await tem(A, 'Você está na sala'));
  await espera(p, () => document.querySelectorAll('.pgrid .pp').length === 1, null);
  await p.click('[data-act=proxima]'); await A.waitForSelector('.ct2');
  ok('O telão mostra o botão Ouvir da voz gravada', await espera(T, () => !!document.querySelector('.tvoz'), null));
  ok('O telão toca a voz sozinho quando a pergunta abre', await espera(T, () => window.__plays.length >= 1, null) && (await T.evaluate(() => window.__plays[0])).startsWith('data:audio/'));
  const antes = await T.evaluate(() => window.__plays.length); await T.click('.tvoz');
  ok('O botão Ouvir toca de novo', await espera(T, n => window.__plays.length > n, antes));
  await T.screenshot({path: OUT + '/v-telao-voz.png'});
  const pub = await (await fetch(mock.url + '/salas/' + chave + '/pub.json')).json();
  ok('A voz NÃO vai para o Firebase', pub && pub.item && pub.item.voz === undefined && !JSON.stringify(pub).includes('data:audio'), JSON.stringify(pub && pub.item).slice(0, 80));
  ok('A publicação continua pequena', JSON.stringify(pub).length < 5000, String(JSON.stringify(pub).length));

  // ---------- F. ouvir no celular
  ok('Celular mostra o botão Ouvir a pergunta', (await A.locator('.ouv').count()) === 1 && (await A.locator('.ouv').innerText()).includes('Ouvir a pergunta'));
  await A.click('.ouv');
  const fala = await A.evaluate(() => window.__fala[0] || '');
  ok('Ouvir lê o enunciado e as opções na ordem da tela', fala.includes('Quando lavar as mãos') && fala.includes('primeira opção: Só no fim do dia') && fala.includes('quarta opção: Nunca'), fala.slice(0, 120));
  ok('A resposta certa não é lida antes da hora', !fala.includes('A resposta certa'));
  await A.screenshot({path: OUT + '/v-cel-ouvir.png'});
  await A.click('.ct2 >> nth=1'); ok('Responder funciona com o botão Ouvir na tela', await tem(A, 'Resposta enviada'));
  await p.click('[data-act=proxima]');
  ok('Ao mudar de tela a leitura é interrompida', await espera(A, () => window.__canc >= 1, null));
  await A.waitForSelector('.rs'); ok('Resultado oferece Ouvir a resposta', (await A.locator('.ouv[data-modo=r]').count()) === 1);
  await A.click('.ouv[data-modo=r]'); const fala2 = await A.evaluate(() => window.__fala[window.__fala.length - 1]);
  ok('Ouvir a resposta lê a certa e o porquê', fala2.includes('A resposta certa é: Sempre, antes de tocar no animal') && fala2.includes('A mão limpa evita contaminar o leite'), fala2.slice(0, 100));
  await A.screenshot({path: OUT + '/v-cel-ouvir-res.png'});
  const C2 = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, serviceWorkers: 'block'});
  await C2.addInitScript(() => { try { Object.defineProperty(window, 'speechSynthesis', {value: undefined, configurable: true}); delete window.SpeechSynthesisUtterance; } catch (e) {} });
  const A2 = await pagina(C2, 'celular-sem-voz'); await A2.goto(link); await A2.waitForSelector('#ce-n');
  ok('Sem leitura em voz alta, o botão não aparece (e nada quebra)', await A2.evaluate(() => !temVoz() && !document.querySelector('.ouv')));
  await C2.close();
  const ordTxt = await A.evaluate(() => textoPergunta({tipo: 'ordenar', enunciado: 'Ordene', alts: ['A', 'B', 'C'], ordem: [2, 0, 1]}));
  ok('Pergunta de ordenar lê os passos na ordem embaralhada da tela', ordTxt.includes('Passo 1: C') && ordTxt.includes('Passo 3: B'), ordTxt);
  await C.close();

  // ---------- G. carimbo de tempo (sob as regras reais) e sem as regras novas
  const sess = await p.evaluate(() => { const t = criarDoZero('Carimbo', 80); t.itens.push({tipo: 'multipla', enunciado: 'P1', alternativas: ['a', 'b'], correta: 0, tempo: 20, uso: 'avaliacao', porque: ''}, {tipo: 'vf', enunciado: 'P2', alternativas: ['Verdadeiro', 'Falso'], correta: 1, tempo: 20, uso: 'avaliacao', porque: ''}); salvar(); return __mk(t, {pessoas: [['Ana Souza', 'Packing', 100], ['Bia Lima', 'Campo', 50]]}) });
  await ir('#/relatorios/' + sess); await p.waitForSelector('.rl-selo');
  const cod = await p.evaluate(id => S.sessoes.find(s => s.id === id).cod, sess);
  ok('O relatório oferece carimbar o horário', (await p.locator('[data-act=selocar]').isEnabled()) && await tem(p, 'Sem carimbo', '.rl-selo'));
  await p.click('[data-act=selocar]'); ok('Carimbar grava o horário do servidor', await espera(p, id => !!S.sessoes.find(s => s.id === id).selo, sess, 8000));
  const selo = await p.evaluate(id => S.sessoes.find(s => s.id === id).selo, sess);
  ok('O horário é o do servidor, recente', Math.abs(selo.t - Date.now()) < 8000 && selo.antigo === false, JSON.stringify(selo));
  ok('O Firebase guardou só o horário, sob o código', JSON.stringify(Object.keys(mock.tree().selos[cod])) === '["t"]' && mock.tree().selos[cod].t === selo.t);
  ok('O relatório mostra data, hora e a origem', await tem(p, 'servidor do Firebase', '.rl-selo') && /\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}:\d{2}/.test(await p.locator('.rl-selo b').innerText()));
  await p.screenshot({path: OUT + '/v-carimbo.png'});
  const pdf = await p.evaluate(id => { const s = S.sessoes.find(x => x.id === id); const r = pdfRegistro(s); return typeof r === 'string' ? r : Array.from(r).map(c => String.fromCharCode(c)).join('') }, sess);
  ok('O PDF de registro traz o carimbo de tempo', pdf.includes('CARIMBO DE TEMPO') || pdf.includes('Carimbo de tempo'));
  await p.evaluate(id => { delete S.sessoes.find(s => s.id === id).selo; salvar(); }, sess);
  const r2 = await p.evaluate(id => carimbar(S.sessoes.find(s => s.id === id)), sess);
  const sel2 = await p.evaluate(id => S.sessoes.find(s => s.id === id).selo, sess);
  ok('Carimbar de novo mostra o horário original (só grava uma vez)', r2.ok && sel2.t === selo.t && sel2.antigo === true && r2.msg.includes('já tinha carimbo'), JSON.stringify(r2));
  const alt = await p.evaluate(async id => { const s = S.sessoes.find(x => x.id === id); delete s.selo; s.part[0].nome = 'Ana Souza Editada'; const r = await carimbar(s); return r }, sess);
  ok('Registro alterado depois do código não é carimbado', !alt.ok && alt.msg.includes('não confere'), alt.msg);
  await p.evaluate(id => { S.sessoes.find(x => x.id === id).part[0].nome = 'Ana Souza' }, sess);
  await ir('#/conferir'); await p.waitForSelector('#selo-cons');
  await p.fill('#cf-c', cod); await p.click('[data-act=selocons]');
  ok('Conferir consulta o carimbo de um código', await tem(p, 'Carimbado em', '.selo-r'));
  await p.fill('#cf-c', 'SAB-AAAA-BBBB-CCCC-DDDD-EEEE'); await p.click('[data-act=selocons]');
  ok('Código sem carimbo diz que não tem', await tem(p, 'Sem carimbo', '.selo-r'));
  await p.fill('#cf-c', 'bobagem'); await p.click('[data-act=selocons]'); ok('Código inválido é explicado', await tem(p, 'Código inválido', '.selo-r'));
  await p.evaluate(() => { S.cfg.fbUrl = ''; salvar(); }); await ir('#/relatorios/' + sess); await p.waitForSelector('.rl-selo');
  await p.evaluate(id => { delete S.sessoes.find(s => s.id === id).selo; render(); }, sess);
  ok('Sem Firebase configurado o botão fica desligado e explica', !(await p.locator('[data-act=selocar]').isEnabled()) && await tem(p, 'Precisa do Firebase', '.rl-selo'));
  const velho = await criar({regras: REGRAS_VELHAS});
  await p.evaluate(u => { S.cfg.fbUrl = u; salvar(); }, velho.url);
  const r3 = await p.evaluate(id => carimbar(S.sessoes.find(s => s.id === id)), sess);
  ok('Com as regras antigas o app manda publicar as regras novas', !r3.ok && r3.msg.includes('Publique as regras novas'), r3.msg);
  velho.fecha();
  ok('Nenhum carimbo ficou gravado sem regra', await p.evaluate(id => !S.sessoes.find(s => s.id === id).selo, sess));

  // ---------- H. regras do app, ajustes e erros
  ok('As regras exibidas em Ajustes são as do arquivo', await p.evaluate(r => JSON.stringify(JSON.parse(REGRAS_FIREBASE)) === JSON.stringify(r), REGRAS));
  ok('Nenhum pedido do app foi negado pelas regras', mock.negadas.filter(x => !/selos/.test(x)).length === 0, mock.negadas.filter(x => !/selos/.test(x)).slice(0, 3).join(' | '));
  ok('Sem erros de JS', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(log.join('\n')); console.log('\n' + log.filter(l => l.startsWith('OK')).length + ' OK / ' + log.filter(l => l.startsWith('FALHA')).length + ' FALHAS');
  await b.close(); srv.close(); mock.fecha();
})().catch(e => { console.log(log.join('\n')); console.error('ERRO', e); process.exit(1); });
