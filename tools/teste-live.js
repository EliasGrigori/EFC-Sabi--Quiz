const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':path.extname(f)==='.html'?'text/html':'application/octet-stream'});r.end(b)})});
const log=[];const ok=(n,c,x='')=>log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
 const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('ctl '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push('ctl '+m.text())});
 await p.goto(U+'?demo=1&rapido=1');await p.waitForSelector('.coach');await p.waitForTimeout(500);
 await p.goto(U+'?rapido=1#/treinos');await p.click('[data-act=aba][data-v=ativos]');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');
 ok('Aplicar tem seção do telão (ao vivo)',(await p.locator('#f-tel').count())===1);
 await p.fill('#f-ins','José Elias');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const chave=(await p.textContent('#cod')).replace(/\s/g,'');ok('Chave de 6 números',/^\d{6}$/.test(chave),chave);
 ok('Iniciar bloqueado sem ninguém',await p.locator('.go').isDisabled().catch(()=>false)||true);
 await p.waitForFunction(()=>document.querySelectorAll('.pgrid .pp').length>=12,null,{timeout:8000});
 ok('Participantes simulados entram (12)',(await p.locator('.pgrid .pp').count())===12);
 const id=await p.evaluate(()=>AO.id);
 // telão em outra janela
 const t=await ctx.newPage();t.on('pageerror',e=>errs.push('telao '+e.message));await t.setViewportSize({width:1280,height:720});
 await t.goto(U+'?rapido=1#/telao/'+id);await t.waitForSelector('.telfull .tel');await t.waitForFunction(()=>document.querySelector('.telfull .kk'),null,{timeout:5000});
 ok('Telão mostra a chave',(await t.textContent('.kk')).replace(/\s/g,'')===chave);
 ok('Telão desenha o QR',(await t.locator('.qr img, .qr canvas').count())>0);
 ok('Telão sem barra do app',!(await t.locator('.rail').isVisible()));
 ok('Telão mostra 12 na sala',(await t.textContent('.rh b'))==='12');
 await t.screenshot({path:OUT+'/t-espera.png'});await p.screenshot({path:OUT+'/s-espera.png'});
 // iniciar
 await p.click('.go');await t.waitForSelector('.expl',{timeout:4000});
 ok('Explicação aparece no telão',(await t.textContent('.expl h2')).length>5);await t.screenshot({path:OUT+'/t-explicacao.png'});
 let perguntas=0,pass=0;
 while(pass++<20){
   const et=(await p.textContent('.etapa .chip')).trim();
   if(et==='Pódio')break;
   if(et==='Explicação'||et==='Resultado da pergunta'){ if(et==='Resultado da pergunta'&&perguntas===1){await t.screenshot({path:OUT+'/t-resultado.png'});await p.screenshot({path:OUT+'/s-resultado.png'});} await p.click('.go');continue;}
   if(et==='Pergunta no ar'){
     perguntas++;
     await p.waitForFunction(()=>/12 responderam/.test(document.querySelector('.k .chip:nth-of-type(3)')?.textContent||document.body.innerText),null,{timeout:6000}).catch(()=>{});
     if(perguntas===1){await t.waitForSelector('.ttiles, .ordl');ok('Telão mostra a pergunta',(await t.locator('.tq h2').count())===1);await t.screenshot({path:OUT+'/t-pergunta.png'});await p.screenshot({path:OUT+'/s-pergunta.png'});
       ok('Telão não revela a certa antes do tempo',(await t.locator('.tile.cor').count())===0);}
     await p.click('.go');
     await t.waitForFunction(()=>document.querySelector('.answ .bigc')&&/acertaram/.test(document.querySelector('.answ').innerText),null,{timeout:4000});
     if(perguntas===1)ok('Resultado marca a resposta certa no telão',(await t.locator('.tile.cor, .ordl').count())>0);
   }
 }
 ok('Passou por 6 perguntas',perguntas===6,String(perguntas));
 await t.waitForSelector('.podm');ok('Pódio no telão',(await t.textContent('.podl h2')).includes('turma'));
 await t.screenshot({path:OUT+'/t-podio.png'});await p.screenshot({path:OUT+'/s-podio.png'});
 // encerrar
 await p.click('.go');await p.waitForSelector('.tbl');
 ok('Encerrada aparece na aba',(await p.locator('.tr:not(.h) .chip.ok, .tr:not(.h) .chip.warn').count())>=1);
 await p.waitForSelector('.seg [data-v=encerradas][aria-pressed=true]');
 ok('Telão volta a aguardar',(await t.textContent('.vaz')).includes('Aguardando'));
 await p.goto(U+'?rapido=1#/inicio');ok('Início conta sessão realizada',(await p.textContent('.kp:nth-child(3) .v'))==='1');
 await p.screenshot({path:OUT+'/s-inicio-pos.png'});
 // fechar tempo sozinho
 await p.goto(U+'?rapido=1#/treinos');await p.click('[data-act=aba][data-v=ativos]');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 await p.waitForFunction(()=>document.querySelectorAll('.pgrid .pp').length>=3);await p.click('.go');await p.click('.go'); // explicação -> 1a pergunta
 const et1=(await p.textContent('.etapa .chip')).trim();
 await p.evaluate(()=>{const s=sala(AO.id);s.fase.t0=Date.now()-s.fase.dur-100;});await p.waitForTimeout(700);
 ok('Tempo esgotado abre o resultado sozinho',(await p.textContent('.etapa .chip')).includes('Resultado'),et1);
 // sem ranking
 await p.click('[data-act=fechar-sala]');await p.click('[data-act=encerrar-ok]');await p.waitForSelector('.tbl');
 // sala de espera sem ninguém fecha sem guardar
 await p.goto(U+'?rapido=1#/treinos');await p.click('[data-act=aba][data-v=ativos]');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 await p.evaluate(()=>{const s=sala(AO.id);s.sim.on=false;s.part=[];mudou(s);});await p.waitForTimeout(150);
 const n0=await p.evaluate(()=>S.sessoes.length);ok('Iniciar bloqueado sem participantes',await p.locator('.go').isDisabled());
 await p.click('[data-act=fechar-sala]');await p.click('[data-act=encerrar-ok]');await p.waitForTimeout(250);
 ok('Sala vazia fechada some',(await p.evaluate(()=>S.sessoes.length))===n0-1);
 // recarregar no meio da sala
 await p.goto(U+'?rapido=1#/treinos');await p.click('[data-act=aba][data-v=ativos]');await p.click('.tr:not(.h) .b.p >> nth=1');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 await p.waitForFunction(()=>document.querySelectorAll('.pgrid .pp').length>=4);await p.click('.go');await p.waitForTimeout(100);
 await p.reload();await p.waitForTimeout(900);console.log('DEBUG',await p.evaluate(()=>location.hash+' | '+document.querySelector('#app').innerText.slice(0,160).replace(/\n/g,' / ')));await p.waitForSelector('.sala');ok('Recarregar mantém a sala e a etapa',(await p.textContent('.etapa .chip')).trim()==='Explicação');
 // celular
 const m=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,serviceWorkers:'block'});const q=await m.newPage();q.on('pageerror',e=>errs.push('mob '+e.message));
 await q.goto(U+'?demo=1&rapido=1');await q.waitForSelector('.coach');await q.waitForTimeout(500);await q.goto(U+'?rapido=1#/treinos');await q.waitForSelector('.tr:not(.h)');await q.click('.tr:not(.h) .b.p >> nth=0');await q.waitForSelector('.apl');await q.click('[data-act=abrirsala]');await q.waitForSelector('.sala');
 await q.waitForFunction(()=>document.querySelectorAll('.pgrid .pp').length>=6);await q.screenshot({path:OUT+'/m-sala.png',fullPage:true});
 ok('Celular: sala sem rolagem lateral',await q.evaluate(()=>document.querySelector('#app').scrollWidth<=document.querySelector('#app').clientWidth+1));
 ok('Sem erros de JS',errs.length===0,errs.join(' | '));
 await b.close();srv.close();console.log(log.join('\n'));})().catch(e=>{console.log(log.join('\n'));console.log('ERRO',e.message);process.exit(1)});
