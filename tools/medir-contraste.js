/* contraste de texto (meta 4,5; 3 para letra grande) em cada tela, claro e escuro, PC e celular. uso: node medir-contraste.js <dist> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const D=process.argv[2];
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.json':'application/json'}[path.extname(f)]||'application/octet-stream'});r.end(b)})});
const medir=()=>{const rgb=s=>{const m=s.match(/[\d.]+/g);if(!m)return [0,0,0,0];const n=m.map(Number);if(/^color\(srgb/.test(s)){return [n[0]*255,n[1]*255,n[2]*255,n[3]===undefined?1:n[3]]}return n};const lum=([r,g,b])=>{const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const mix=(a,b)=>{const t=a[3]===undefined?1:a[3];return [a[0]*t+b[0]*(1-t),a[1]*t+b[1]*(1-t),a[2]*t+b[2]*(1-t)]};
 const fundo=e=>{const pilha=[];for(let x=e;x;x=x.parentElement){const c=getComputedStyle(x);if(c.backgroundImage!=='none'&&!/repeating/.test(c.backgroundImage))return null;const b=rgb(c.backgroundColor);if(b[3]===undefined||b[3]>0)pilha.push(b);if(b[3]===undefined||b[3]===1)break}
  let cor=rgb(getComputedStyle(document.body).backgroundColor);for(let i=pilha.length-1;i>=0;i--)cor=mix(pilha[i],cor);return cor};
 const ruins=[];document.querySelectorAll('body *').forEach(e=>{if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;const c=getComputedStyle(e);if(c.visibility==='hidden'||+c.opacity===0)return;
  if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;const r=e.getBoundingClientRect();if(r.width<1||r.bottom<0||r.top>innerHeight)return;
  if(c.backgroundClip==='text'||/transparent/.test(c.webkitTextFillColor||''))return;if(e.closest('[disabled],.tel,.telwrap,svg,.sr,[aria-hidden=true]'))return;
  const bg=fundo(e);if(!bg)return;const fg=mix(rgb(c.color),bg);const L1=lum(fg),L2=lum(bg);const cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const grande=parseFloat(c.fontSize)>=24||(parseFloat(c.fontSize)>=18.6&&+c.fontWeight>=700);if(cr<(grande?3:4.5))ruins.push(e.tagName+'.'+String(e.className).slice(0,16)+' "'+e.textContent.trim().slice(0,18)+'" '+cr.toFixed(2))});return ruins};
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();let total=0;const lista=[];
for(const [ap,opt] of [['pc',{viewport:{width:1280,height:800}}],['cel',{viewport:{width:390,height:844},hasTouch:true,isMobile:true}]])for(const esq of ['light','dark']){
 const ctx=await b.newContext({...opt,colorScheme:esq,serviceWorkers:'block'});const p=await ctx.newPage();await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());await p.goto(U+'?demo=1');await p.waitForSelector('.coach');const t=await p.evaluate(()=>S.treinamentos[0].id);
 for(const h of ['#/inicio','#/treinos','#/editar/'+t,'#/aplicar/'+t,'#/pendencias','#/pessoas','#/mensagens','#/relatorios','#/conferir','#/ajustes']){await p.evaluate(h=>{location.hash=h},h);await p.waitForTimeout(450);const r=await p.evaluate(medir);total+=r.length;r.forEach(x=>lista.push(ap+' '+esq+' '+h.split('/')[1]+' '+x))}
 await ctx.close()}
console.log('abaixo do contraste:',total);console.log([...new Set(lista)].slice(0,40).join('\n'));await b.close();srv.close();})();
