/* capturas da v1.3.1 (publicada) para a página de aprovação da v1.4.0. uso: node shot-antes14.js <pasta-do-site> <saida> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/octet-stream'});r.end(b)})});
(async()=>{const mock=await criar();await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});const p=await ctx.newPage();
await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');
await p.fill('#f-ins','José Elias');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
await p.waitForFunction(()=>document.querySelectorAll('.pgrid .pp').length>=6,null,{timeout:10000}).catch(()=>{});
const id=await p.evaluate(()=>AO.id);const t=await ctx.newPage();await t.setViewportSize({width:1280,height:720});await t.goto(U+'#/telao/'+id);await t.waitForSelector('.telfull .tel');await t.waitForTimeout(1200);
await t.screenshot({path:OUT+'/telao-espera.png'});await p.screenshot({path:OUT+'/sala.png'});
for(let i=0;i<40;i++){const et=await p.evaluate(()=>sala(AO.id).fase.etapa);if(et==='podio')break;await p.evaluate(()=>{sala(AO.id).fase.t0-=999999});const dis=await p.locator('.go').isDisabled().catch(()=>true);if(!dis)await p.click('.go');await p.waitForTimeout(250);}
await t.waitForTimeout(2500);await t.screenshot({path:OUT+'/telao-podio.png'});await t.close();
await p.evaluate(()=>{const d=document.querySelector('#dlg');if(d&&d.open)d.close();const s=sala(AO.id);if(s){Rede.fechar&&Rede.fechar(s);s.estado='encerrada';AO.id=null;salvar();}});
await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await p.waitForTimeout(1500);
await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
const link=await p.getAttribute('[data-act=copiar]','data-v');
const cc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const A=await cc.newPage();
await A.goto(link);await A.waitForSelector('#ce-n');await A.fill('#ce-n','Maria Silva');await A.waitForTimeout(500);await A.screenshot({path:OUT+'/cel-nome.png'});
await A.click('button[type=submit]');await A.waitForFunction(()=>document.body.innerText.includes('Você está na sala'),null,{timeout:8000}).catch(()=>{});await A.waitForTimeout(500);await A.screenshot({path:OUT+'/cel-espera.png'});
await b.close();srv.close();mock.fechar&&mock.fechar();process.exit(0)})();
