/* prints do celular para a página de aprovação da v1.4.1. uso: node shot-antes141.js <pasta-do-site> <saida> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
(async()=>{const mock=await criar();await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});const p=await ctx.newPage();
await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await p.waitForTimeout(1500);
await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.fill('#f-ins','José Elias');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
const link=await p.getAttribute('[data-act=copiar]','data-v');
const cc=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});const A=await cc.newPage();
await A.goto(link);await A.waitForSelector('#ce-n');await A.fill('#ce-n','Maria Silva');await A.waitForTimeout(500);await A.screenshot({path:OUT+'/nome.png'});
await A.click('[data-act=cbon]');await A.waitForSelector('.bon-op');await A.waitForTimeout(700);await A.screenshot({path:OUT+'/bicho.png'});
await A.click('[data-act=cbonaba][data-v=cor]');await A.waitForTimeout(500);await A.screenshot({path:OUT+'/cor.png'});
await A.click('[data-act=cbonaba][data-v=cab]');await A.waitForTimeout(700);await A.screenshot({path:OUT+'/cabeca.png'});
await A.click('[data-act=cbonok]');await A.waitForTimeout(400);await A.click('button[type=submit]');await A.waitForFunction(()=>document.body.innerText.includes('Você está na sala'),null,{timeout:8000}).catch(()=>{});await A.waitForTimeout(700);await A.screenshot({path:OUT+'/espera.png'});
await b.close();srv.close();process.exit(0)})();
