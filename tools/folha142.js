const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const D=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html':f.endsWith('.webp')?'image/webp':'application/octet-stream'});r.end(b)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});
await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
const info=await p.evaluate(async()=>{const cods=[];for(const a of BON.bichos){cods.push(bonCodigo({a,cor:0,roupa:'',det:[],cab:'',pes:''}));const c=bonLer(a+'.3.'+(BON.semRoupa.includes(a)?'':BON.roupas[0])+'..mago.'+BON.pescoco[0]);cods.push(c?bonCodigo(c):a+'.0....');}
document.body.innerHTML='<div id=g style="display:grid;grid-template-columns:repeat(9,140px);gap:8px;padding:8px;background:#e9eeee"></div>';
const g=document.getElementById('g');const dims=[];for(const c of cods){const u=await bonDesenha(c);const im=new Image();im.src=u;await im.decode();dims.push(im.naturalWidth);const d=document.createElement('div');d.style.cssText='width:140px;height:140px;background:#fff;border-radius:12px;overflow:hidden';d.className='avb';d.appendChild(im);im.style.cssText='width:100%;height:100%';g.appendChild(d);}
return {n:cods.length,dims:[...new Set(dims)],cods:cods.slice(0,4)}});
console.log(JSON.stringify(info));await p.waitForTimeout(500);await p.screenshot({path:'../folha142.png',fullPage:true});await b.close();srv.close();})();
