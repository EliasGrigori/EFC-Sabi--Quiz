/* prints do logotipo (v1.5.0). uso: node shot-logo.js <site> <saida> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})});
(async()=>{const mock=await criar();await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:2,serviceWorkers:'block'});const p=await ctx.newPage();
await p.goto(U+'?demo=1');await p.waitForSelector('.coach');await p.waitForTimeout(400);
await p.screenshot({path:OUT+'/inicio.png',clip:{x:0,y:0,width:820,height:300}});
await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await p.waitForTimeout(1200);
await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.fill('#f-ins','José Elias');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
const id=await p.evaluate(()=>AO.id);const link=await p.getAttribute('[data-act=copiar]','data-v');
const t=await ctx.newPage();await t.setViewportSize({width:1280,height:720});await t.goto(U+'#/telao/'+id);await t.waitForSelector('.telfull .tel');await t.waitForTimeout(800);
await t.screenshot({path:OUT+'/telao.png',clip:{x:0,y:0,width:820,height:110}});
const cc=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});const A=await cc.newPage();
await A.goto(link);await A.waitForSelector('#ce-n');await A.waitForTimeout(500);await A.screenshot({path:OUT+'/celular.png',clip:{x:0,y:0,width:390,height:150}});
await b.close();srv.close();process.exit(0)})();
