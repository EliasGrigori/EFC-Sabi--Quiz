/* Fatia E (v1.6.0 parte 4): mede o telão e o celular do participante em cada etapa, nos dois temas, e tira print.
   Não muda nada. uso: SABIA_REGRAS=1 node varredura-fatiaE.js <dist> <saida>
   Medidas por tela: tamanhos de letra, tipos de canto, famílias de letra, textos abaixo do contraste (4,5; 3 para letra grande),
   alvos de toque abaixo de 44 px (celular), rolagem de lado, telão que transborda 1280 × 720, animações infinitas, transition: all. */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json','.mjs':'text/javascript'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
/* roda dentro da página: raiz = '.tel' (telão) ou '.cc' (celular) */
const medir=(sel)=>{const raiz=document.querySelector(sel);if(!raiz)return {erro:'sem '+sel};
 const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'&&+c.opacity>0};
 const els=[raiz,...raiz.querySelectorAll('*')].filter(vis).filter(e=>!e.closest('svg,.conf,.fz-spk'));
 const comTexto=els.filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));
 const tam=new Set(comTexto.map(e=>getComputedStyle(e).fontSize));
 const cantos=new Set(els.map(e=>getComputedStyle(e).borderTopLeftRadius).filter(x=>x!=='0px'&&!/%|999/.test(x)&&parseFloat(x)<100));
 const fam=new Set(comTexto.map(e=>getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g,'').trim()));
 const rgb=s=>{const m=s.match(/[\d.]+/g);if(!m)return [0,0,0,0];const n=m.map(Number);if(/^color\(srgb/.test(s))return [n[0]*255,n[1]*255,n[2]*255,n[3]===undefined?1:n[3]];return n};
 const lum=([r,g,b])=>{const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const mix=(a,b)=>{const t=a[3]===undefined?1:a[3];return [a[0]*t+b[0]*(1-t),a[1]*t+b[1]*(1-t),a[2]*t+b[2]*(1-t)]};
 const fundo=e=>{const pilha=[];for(let x=e;x;x=x.parentElement){const c=getComputedStyle(x);
  /* véu desenhado num ::before que cobre a caixa (alternativa errada no resultado): entra na conta por cima do fundo */
  const bf=getComputedStyle(x,'::before');if(bf.content!=='none'&&bf.position==='absolute'&&x!==e){const vb=rgb(bf.backgroundColor);if(vb[3]===undefined||vb[3]>0)pilha.push([vb[0],vb[1],vb[2],(vb[3]===undefined?1:vb[3])*(+bf.opacity)]);}if(c.backgroundImage!=='none'&&!/repeating/.test(c.backgroundImage))return null;const b=rgb(c.backgroundColor);if(b[3]===undefined||b[3]>0)pilha.push(b);if(b[3]===undefined||b[3]>=1)break}
  let cor=rgb(getComputedStyle(document.body).backgroundColor);for(let i=pilha.length-1;i>=0;i--)cor=mix(pilha[i],cor);return cor};
 const ruins=[];comTexto.forEach(e=>{const c=getComputedStyle(e);if(e.closest('[disabled],.sr,[aria-hidden=true]'))return;if(c.backgroundClip==='text'||/transparent/.test(c.webkitTextFillColor||''))return;
  /* opacidade dos pais (alternativa apagada no resultado) entra na conta */
  let op=1;for(let x=e;x&&x!==document.body;x=x.parentElement)op*=+getComputedStyle(x).opacity;
  const bg=fundo(e);if(!bg)return;const cc=rgb(c.color);const fg=mix([cc[0],cc[1],cc[2],(cc[3]===undefined?1:cc[3])*op],bg);const L1=lum(fg),L2=lum(bg);const cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const grande=parseFloat(c.fontSize)>=24||(parseFloat(c.fontSize)>=18.6&&+c.fontWeight>=700);if(cr<(grande?3:4.5))ruins.push(e.tagName.toLowerCase()+'.'+String(e.className).slice(0,14)+' "'+e.textContent.trim().slice(0,16)+'" '+cr.toFixed(2))});
 const toque=matchMedia('(pointer:coarse)').matches;
 const bts=[...raiz.querySelectorAll('button,a.b,.b,input:not([type=hidden]),select,textarea,[role=button],[role=radio]')].filter(vis).filter(e=>!e.closest('p,li'));
 const peq=toque?bts.filter(e=>e.getBoundingClientRect().height<44).map(e=>(e.getAttribute('aria-label')||e.textContent||e.className).trim().slice(0,18)+' '+Math.round(e.getBoundingClientRect().height)):[];
 const infin=document.getAnimations().filter(a=>a.effect&&a.effect.getComputedTiming&&a.effect.getComputedTiming().iterations===Infinity&&a.effect.target&&raiz.contains(a.effect.target)).filter(a=>a.animationName!=='ouroBrilho').map(a=>(a.animationName||'?')+'@'+String(a.effect.target.className).slice(0,14)); /* o reflexo do botão dourado é a exceção aprovada */
 const tr=els.filter(e=>{const c=getComputedStyle(e);return c.transitionProperty.split(',').some(p=>p.trim()==='all')&&parseFloat(c.transitionDuration)>0}).length;
 const tel=document.querySelector('.tel');const transb=tel&&sel==='.tel'?Math.max(0,tel.scrollHeight-tel.clientHeight)+Math.max(0,tel.scrollWidth-tel.clientWidth):0;
 return {tamanhos:tam.size,lista_tam:[...tam].sort((a,b)=>parseFloat(a)-parseFloat(b)),cantos:cantos.size,lista_cantos:[...cantos],fontes:[...fam],contraste:ruins.length,ruins:ruins.slice(0,6),pequenos:peq.length,lista_peq:peq.slice(0,6),lado:document.documentElement.scrollWidth-innerWidth,transborda:transb,infinitas:[...new Set(infin)],transAll:tr}};
(async()=>{const mock=await criar();await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const errs=[];const res=[];
 const mede=async(pg,sel,ap,tema,tela,arq,esp=1300)=>{await pg.waitForTimeout(esp);const m=await pg.evaluate(medir,sel);res.push({ap,tema,tela,...m});await pg.screenshot({path:`${OUT}/${arq}.png`})};
 for(const tema of ['claro','escuro']){const esq=tema==='claro'?'light':'dark';
  const ctx=await b.newContext({viewport:{width:1280,height:800},colorScheme:esq,serviceWorkers:'block'});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await p.waitForTimeout(1200);
  await p.evaluate(()=>{location.hash='#/treinos';render()});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.fill('#f-ins','Instrutor Teste');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
  await p.evaluate(t=>{const s=sala(AO.id);s.aj.telao=t;s.sim.on=false;s.part=[];mudou(s)},tema);await p.waitForTimeout(300);
  const link=await p.getAttribute('[data-act=copiar]','data-v');const id=await p.evaluate(()=>AO.id);
  const tl=await ctx.newPage();await tl.setViewportSize({width:1280,height:720});tl.on('pageerror',e=>errs.push('telão '+e.message));await tl.goto(U+'?demo=1#/telao/'+id);await tl.waitForSelector('.telfull .tel');await tl.waitForTimeout(700);
  await mede(tl,'.tel','telão',tema,'Espera vazia',`telao-${tema}-espera-vazia`);
  const cc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,colorScheme:esq,serviceWorkers:'block'});const A=await cc.newPage();A.on('pageerror',e=>errs.push('cel '+e.message));
  await A.goto(link);await A.waitForSelector('#ce-n');await mede(A,'.cc','celular',tema,'Nome',`cel-${tema}-nome`);
  await A.fill('#ce-n','Maria Silva');await A.click('button[type=submit]');await A.waitForTimeout(2500);await mede(A,'.cc','celular',tema,'Na sala',`cel-${tema}-espera`);
  await p.evaluate(()=>{const s=sala(AO.id);s.sim.on=true;s.sim.alvo=3;mudou(s)});await p.waitForTimeout(2500);
  await mede(tl,'.tel','telão',tema,'Espera com gente',`telao-${tema}-espera`);
  const idx=await p.evaluate(()=>{const s=sala(AO.id);const f=t=>s.itens.findIndex(it=>it.tipo===t);return {m:f('multipla'),v:f('vf'),o:f('ordenar'),e:f('explicacao')}});
  const vai=async i=>{await p.evaluate(i=>{const s=sala(AO.id);entrarItem(s,i);mudou(s)},i);await p.waitForTimeout(1800)};
  if(idx.e>=0){await vai(idx.e);await mede(tl,'.tel','telão',tema,'Explicação',`telao-${tema}-explicacao`);await mede(A,'.cc','celular',tema,'Explicação',`cel-${tema}-explicacao`);}
  if(idx.v>=0){await vai(idx.v);await mede(tl,'.tel','telão',tema,'Pergunta V ou F',`telao-${tema}-vf`);}
  if(idx.o>=0){await vai(idx.o);await mede(tl,'.tel','telão',tema,'Pergunta Ordenar',`telao-${tema}-ordenar`);await mede(A,'.cc','celular',tema,'Pergunta Ordenar',`cel-${tema}-ordenar`);}
  await vai(idx.m);await mede(tl,'.tel','telão',tema,'Pergunta Múltipla',`telao-${tema}-pergunta`);await mede(A,'.cc','celular',tema,'Pergunta Múltipla',`cel-${tema}-pergunta`);
  await A.locator('.ct2').nth(1).click().catch(()=>{});await A.waitForTimeout(900);await mede(A,'.cc','celular',tema,'Respondeu',`cel-${tema}-respondeu`);
  await p.evaluate(()=>{const s=sala(AO.id);fimPergunta(s);mudou(s)});await p.waitForTimeout(150);
  await mede(tl,'.tel','telão',tema,'Conferindo',`telao-${tema}-conferindo`,450);await mede(A,'.cc','celular',tema,'Conferindo',`cel-${tema}-conferindo`,0);
  await p.waitForTimeout(2000);await mede(tl,'.tel','telão',tema,'Resultado',`telao-${tema}-resultado`);await mede(A,'.cc','celular',tema,'Resultado',`cel-${tema}-resultado`);
  await p.evaluate(()=>{const s=sala(AO.id);irPodio(s);mudou(s)});await p.waitForTimeout(2200);
  await mede(tl,'.tel','telão',tema,'Pódio',`telao-${tema}-podio`);await mede(A,'.cc','celular',tema,'Fim (assinatura)',`cel-${tema}-fim`);
  await cc.close();await ctx.close()}
 fs.writeFileSync(OUT+'/varredura.json',JSON.stringify(res,null,1));
 for(const r of res)console.log([r.ap,r.tema,r.tela].join(' · ').padEnd(40),'letras',r.tamanhos,'cantos',r.cantos,'contraste',r.contraste,'peq',r.pequenos,'lado',r.lado,'transb',r.transborda,'inf',(r.infinitas||[]).join('|'),'fontes',(r.fontes||[]).join('|'));
 console.log('erros',errs.slice(0,6));await b.close();srv.close();mock.fecha&&mock.fecha();process.exit(0)})();
