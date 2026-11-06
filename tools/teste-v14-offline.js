/* v1.4.0: o sw guarda as imagens dos bonecos e elas aparecem sem internet. uso: node teste-v14-offline.js <dist> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const D=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();
await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
await p.waitForFunction(async()=>{const r=await navigator.serviceWorker.ready;const c=await caches.open('sabia-1.4.2');const k=await c.keys();return k.filter(x=>x.url.includes('/bon/')).length>=318},null,{timeout:30000}).catch(()=>{});
const n=await p.evaluate(async()=>{const c=await caches.open('sabia-1.4.2');return (await c.keys()).filter(x=>x.url.includes('/bon/')).length});
await ctx.setOffline(true);await p.reload();await p.waitForSelector('.coach');
const u=await p.evaluate(async()=>{BON.url.clear();BON.img.clear();const a=await bonDesenha('onca.4.xadrez.brinco-argola.mago.colar');return a.length});
console.log((n>=318?'OK   ':'FALHA ')+'Imagens dos bonecos guardadas pelo sw · '+n);
console.log((u>1000?'OK   ':'FALHA ')+'Sem internet, o boneco ainda é desenhado');
const f=(n>=318?0:1)+(u>1000?0:1);console.log((2-f)+' OK / '+f+' FALHAS');
await b.close();srv.close();})();
