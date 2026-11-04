const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
(async()=>{
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1366,height:800},acceptDownloads:true,serviceWorkers:'block'});
 const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('pageerror '+e.message));
 p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
 await p.goto(U+'?rapido=1');await p.waitForSelector('.coach');
 const toast=async()=>(await p.textContent('#toast'))||'';
 const hash=()=>p.evaluate(()=>location.hash);
 // 1. criar do zero abre o editor vazio
 await p.click('.tb [data-act=novo]');await p.click('[data-act=dlg][data-v=zero]');
 await p.fill('#z-t','Calibração do pHmetro');await p.fill('#z-m','85');await p.click('#dlg button[type=submit]');
 await p.waitForSelector('.edit');
 ok('Do zero abre o editor vazio',(await hash()).startsWith('#/editar/')&&(await p.locator('#edCentro .opcao').count())===4);
 // 2. múltipla incompleta mostra avisos
 await p.click('#edCentro [data-act=edadd][data-v=multipla]');
 ok('Pergunta nova ganha foco no enunciado',await p.evaluate(()=>document.activeElement.id)==='e-en');
 let av=await p.textContent('#edAv');
 ok('Avisa enunciado, alternativa em branco e certa',av.includes('Falta o enunciado')&&av.includes('alternativa em branco')&&av.includes('resposta certa'));
 ok('Lista mostra ícone de revisão',(await p.locator('.qi .qw').count())===1);
 await p.fill('#e-en','Qual é a faixa de pH do tampão 7?');
 const alts=['pH 4,00','pH 7,00','pH 10,00','pH 14,00'];
 for(let k=0;k<4;k++)await p.fill(`[data-ealt="${k}"]`,alts[k]);
 await p.check('input[name=cor][value="1"]');
 ok('Pergunta completa sem avisos',(await p.locator('#edAv .chip').count())===0);
 ok('Lista mostra o enunciado digitado',(await p.textContent('.qi[aria-current=true]')).includes('faixa de pH'));
 ok('Status mostra pronto para aplicar',(await p.textContent('#edSt')).includes('Pronto para aplicar'));
 // 3. prévia do telão
 let tel=await p.textContent('#edTel');
 ok('Prévia mostra enunciado e alternativas',tel.includes('faixa de pH')&&tel.includes('pH 10,00'));
 ok('Prévia na pergunta não revela a certa',(await p.locator('#edTel .tile.cor').count())===0);
 await p.click('[data-act=edprev][data-v=resultado]');
 ok('Prévia do resultado destaca só a certa',(await p.locator('#edTel .tile.cor').count())===1&&(await p.textContent('#edTel .tile.cor')).includes('pH 7,00'));
 await p.fill('#e-po','O tampão neutro fica em pH 7.');
 ok('Prévia mostra o porquê',(await p.textContent('#edTel')).includes('tampão neutro'));
 await p.screenshot({path:OUT+'/e-multipla.png'});
 // 4. verdadeiro/falso e ordenar
 await p.click('.adds [data-act=edadd][data-v=vf]');
 await p.fill('#e-en','O pHmetro pode ser guardado seco.');
 ok('V ou F começa sem certa marcada',(await p.textContent('#edAv')).includes('verdadeiro ou falso'));
 await p.check('input[name=cor][value="1"]');
 ok('V ou F tem 2 linhas fixas',(await p.locator('.alt.v').count())===2);
 await p.click('.adds [data-act=edadd][data-v=ordenar]');
 await p.fill('#e-en','Ordem de calibração');
 const passos=['Enxaguar o eletrodo','Mergulhar no tampão 7','Ajustar o ponto zero'];
 for(let k=0;k<3;k++)await p.fill(`[data-ealt="${k}"]`,passos[k]);
 await p.click('[data-act=altadd]');await p.fill('[data-ealt="3"]','Registrar no formulário');
 ok('Ordenar aceita até 5 passos',(await p.locator('.alt.o').count())===4);
 await p.click('.alt.o:nth-child(1) [data-act=altdown]');
 ok('Descer passo troca a ordem',await p.inputValue('[data-ealt="0"]')==='Mergulhar no tampão 7'&&await p.inputValue('[data-ealt="1"]')==='Enxaguar o eletrodo');
 await p.click('.alt.o:nth-child(2) [data-act=altup]');
 ok('Subir passo volta',await p.inputValue('[data-ealt="0"]')==='Enxaguar o eletrodo');
 await p.click('.alt.o:nth-child(4) [data-act=altdel]');
 ok('Remover passo funciona',(await p.locator('.alt.o').count())===3&&(await p.locator('.alt.o [data-act=altdel][disabled]').count())===3);
 // 5. explicação
 await p.click('.adds [data-act=edadd][data-v=explicacao]');
 await p.fill('#e-en','Por que calibrar todo dia');await p.fill('#e-tx','O eletrodo desvia com o uso.');
 ok('Explicação não tem alternativas nem tempo',(await p.locator('.alt').count())===0&&(await p.locator('#e-tp').count())===0);
 ok('Prévia da explicação mostra título e texto',(await p.textContent('#edTel')).includes('Por que calibrar'));
 // 6. mover, duplicar, excluir com desfazer, trocar formato
 await p.click('[data-act=edup]');
 const ord=async()=>p.$$eval('.qi .qt b',e=>e.map(x=>x.textContent));
 let o=await ord();ok('Mover para cima reordena',o[2]==='Por que calibrar todo dia'&&o[3]==='Ordem de calibração',o.join('|'));
 await p.click('[data-act=eddown]');
 await p.click('.qi >> nth=0');await p.click('[data-act=eddup]');
 o=await ord();ok('Duplicar cria cópia logo abaixo',o.length===5&&o[0]===o[1]);
 await p.click('[data-act=eddel]');
 ok('Excluir remove',(await ord()).length===4);
 await p.click('#tAcao');
 ok('Desfazer devolve a pergunta',(await ord()).length===5);
 await p.click('[data-act=eddel]');await p.click('#tAcao');await p.waitForTimeout(100);
 // duplicata removida de verdade
 await p.click('.qi >> nth=1');await p.click('[data-act=eddel]');
 ok('Exclusão mantém só 4',(await ord()).length===4);
 await p.click('.qi >> nth=0');
 await p.click('.seg [data-act=edtipo][data-v=vf]');
 ok('Trocar formato muda a tela',(await p.locator('.alt.v').count())===2);
 ok('Trocar formato avisa e permite desfazer',(await toast()).includes('Formato trocado'));
 await p.click('#tAcao');
 ok('Desfazer volta à múltipla com 4 alternativas',(await p.locator('.alt').count())===4);
 // 7. tempo e uso
 await p.selectOption('#e-tp','45');await p.selectOption('#e-us','ensaio');
 ok('Uso teste muda o rótulo',(await p.textContent('#edCentro .edh h2')).includes('teste'));
 await p.selectOption('#e-us','avaliacao');
 // 8. meta, título
 await p.fill('#et-meta','90');await p.fill('#et-titulo','pHmetro: calibração diária');
 ok('Título aparece no topo',(await p.textContent('.tb h1')).includes('diária'));
 // 9. persiste ao recarregar
 await p.waitForTimeout(400);await p.reload();await p.waitForSelector('.edit');
 ok('Edição sobrevive ao recarregar',(await ord()).length===4&&(await p.inputValue('#et-meta'))==='90');
 // 10. aplicável, lista mostra pronto
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');
 ok('Treinos mostra pronto para aplicar',(await p.textContent('.tr:not(.h)')).includes('Pronto para aplicar'));
 ok('Treinos mostra versão com asterisco (sem versão salva)',(await p.textContent('.tr:not(.h) .num')).includes('*'));
 // 11. XSS
 await p.click('.tr:not(.h) [aria-label^=Editar]');await p.waitForSelector('.edit');
 await p.click('.adds [data-act=edadd][data-v=vf]');await p.fill('#e-en','<img src=x onerror=window.__x=1>');
 await p.waitForTimeout(150);
 ok('HTML no enunciado vira texto no editor e no telão',(await p.evaluate(()=>window.__x))===undefined&&(await p.textContent('#edTel')).includes('<img'));
 await p.click('[data-act=eddel]');
 // 12. versões
 await p.click('[data-act=versoes]');
 ok('Diálogo de versões abre com v00 atual',(await p.textContent('#dlg')).includes('v00')&&(await p.textContent('#dlg .vr')).includes('atual'));
 ok('Botão de salvar versão pede v01',(await p.textContent('#dlg .vs button')).includes('v01'));
 await p.fill('#v-nota','Primeira versão revisada');await p.click('#dlg .vs button');
 await p.waitForTimeout(200);
 ok('Versão salva vira v01',(await toast()).includes('v01')&&(await p.textContent('.tb .sub')).includes('v01 · versão salva'));
 // alterar e comparar
 await p.click('.qi >> nth=0');await p.fill('#e-en','Qual é o pH do tampão neutro?');
 await p.click('.adds [data-act=edadd][data-v=vf]');await p.fill('#e-en','O eletrodo pode secar.');
 ok('Edição depois da versão marca alterações sem versão',(await p.textContent('.tb .sub')).includes('sem versão'));
 await p.click('[data-act=versoes]');
 await p.click('#dlg .vr[data-v="1"] [data-act=verscmp]');
 const df=await p.textContent('#dlg .df');
 ok('Comparar mostra nova e alterada',df.includes('+')&&df.includes('~')&&df.includes('O eletrodo pode secar'),df.slice(0,120));
 await p.screenshot({path:OUT+'/e-versoes.png'});
 // restaurar v01 traz de volta e permite desfazer
 await p.click('#dlg .vr[data-v="1"] [data-act=versrest]');await p.waitForTimeout(200);
 ok('Restaurar v01 descarta as alterações',(await ord()).length===4&&(await p.textContent('.tb .sub')).includes('v01 · versão salva'));
 await p.click('#tAcao');await p.waitForTimeout(150);
 ok('Desfazer a restauração devolve o rascunho',(await ord()).length===5);
 // 13. aplicar fixa a versão automaticamente
 await p.click('.tb a.b.p');await p.waitForSelector('.apl');
 ok('Roteiro de aplicar lista as perguntas do editor',(await p.textContent('.apl')).includes('Qual é o pH do tampão neutro'));
 await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const est=await p.evaluate(()=>JSON.parse(localStorage.getItem('sabia-estado')||'null'));
 await p.waitForTimeout(500);
 const sess=await p.evaluate(async()=>{const r=await new Promise(ok=>{const q=indexedDB.open('sabia',1);q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get('estado');g.onsuccess=()=>ok(g.result)}});return JSON.parse(r)});
 const s0=sess.sessoes[0],t0=sess.treinamentos[0];
 ok('Sessão guarda a versão v02 criada ao aplicar',s0.versao===2&&t0.versao===2&&t0.sujo===false,'v'+s0.versao);
 ok('Sessão tem cópia das perguntas',s0.itens.length===5);
 // 14. a sala usa a pergunta nova
 await p.click('.sala [data-act=iniciar], .sala .stagebtn, .sala button.p >> nth=0').catch(()=>{});
 await p.waitForTimeout(300);
 const txt=await p.textContent('.sala');
 ok('Sala abre com o treinamento editado',txt.includes('pHmetro: calibração diária')||txt.includes('Chave'));
 // 15. exportar/importar
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');
 const dl=p.waitForEvent('download');await p.click('.tr:not(.h) [data-act=exportar]');const d=await dl;
 await d.saveAs(OUT+'/ed-exp.json');const ex=JSON.parse(fs.readFileSync(OUT+'/ed-exp.json','utf8'));
 ok('Exportar leva as perguntas editadas',ex.itens.length===5&&ex.itens[0].enunciado==='Qual é o pH do tampão neutro?'&&ex.itens[0].correta===1);
 // 16. celular
 const m=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const q=await m.newPage();await q.goto(U+'?demo=1');await q.waitForSelector('.tr:not(.h), .card');
 await q.evaluate(()=>{const t=JSON.parse(JSON.stringify(1));});
 const href=await q.$eval('a[href^="#/editar/"]',a=>a.getAttribute('href'));await q.evaluate(h=>{location.hash=h},href);await q.waitForSelector('.edit');
 await q.waitForTimeout(300);
 ok('Celular sem rolagem lateral no editor',await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.body.scrollWidth<=innerWidth+1));
 const pequenos=await q.evaluate(()=>[...document.querySelectorAll('.edit button,.edit a,.edit input:not([type=radio]),.edit select,.edit textarea,.tb .b')].filter(e=>e.offsetParent&&!e.disabled).map(e=>{const r=e.getBoundingClientRect();return {t:(e.getAttribute('aria-label')||e.textContent||e.id).trim().slice(0,24),h:Math.round(r.height),w:Math.round(r.width)}}).filter(x=>x.h<36||x.w<36));
 ok('Celular: alvos de toque do editor com 36 px ou mais',pequenos.length===0,JSON.stringify(pequenos.slice(0,4)));
 const smallRows=await q.evaluate(()=>[...document.querySelectorAll('.edit .b.ic,.edit .seg button,.edit .rd')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect()).filter(r=>r.height<44||r.width<44).length);
 ok('Celular: botões de ação com 44 px',smallRows===0,String(smallRows));
 await q.click('.qi >> nth=1');await q.waitForTimeout(200);
 await q.screenshot({path:OUT+'/e-mobile.png',fullPage:false});
 ok('Sem erros no console',errs.length===0,errs.slice(0,3).join(' | '));
 console.log(log.join('\n'));console.log('\n'+log.filter(x=>x.startsWith('OK')).length+' OK / '+log.filter(x=>x.startsWith('FALHA')).length+' FALHAS');
 await b.close();srv.close();
})().catch(e=>{console.log(log.join('\n'));console.log('ERRO',e.message.split('\n').slice(0,6).join('\n'));process.exit(1)});
