/* rapidez da casca: abrir o app e trocar de tela (5 vezes, vale a mediana), com o processador normal e 4 vezes mais lento.
   uso: node medir-rapidez-v160.js <dist> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.json':'application/json'}[path.extname(f)]||'application/octet-stream'});r.end(b)})});
const med=a=>{a=[...a].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const out={};
for(const lento of [1,4]){const abrir=[],trocar=[],tema=[];
 for(let i=0;i<5;i++){const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});const p=await ctx.newPage();
  await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());   /* sem internet de fora: compara só o app */
  const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:lento});
  const t0=Date.now();await p.goto(U+'?demo=1');await p.waitForSelector('.coach');abrir.push(Date.now()-t0);
  for(const h of ['#/treinos','#/pessoas','#/relatorios','#/ajustes','#/inicio']){trocar.push(await p.evaluate(h=>{const t=performance.now();location.hash=h;render();return performance.now()-t},h));}
  tema.push(await p.evaluate(()=>{const t=performance.now();S.cfg.tema=S.cfg.tema==='escuro'?'claro':'escuro';aplicarTema();render();return performance.now()-t}));
  await ctx.close();}
 out['cpu x'+lento]={abrir_ms:med(abrir),trocar_tela_ms:Math.round(med(trocar)*10)/10,trocar_tema_ms:Math.round(med(tema)*10)/10};}
out.tamanho_kb=Math.round(fs.statSync(path.join(D,'index.html')).size/1024);
console.log(JSON.stringify(out));await b.close();srv.close();})();
