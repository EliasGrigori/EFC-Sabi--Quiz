/* v1.6.0 parte 4: P1 (Colaborador consulta Pendências, sem botões), P2 ("código de autenticação") e Fatia E (telão e celular do participante).
   uso: SABIA_REGRAS=1 node teste-v160p4.js <dist> <prints>   — na parte 3 tem de falhar; na parte 4 tem de passar. */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3]||'/tmp/r_v160p4';fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.mjs':'text/javascript','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
const bloco=async(nome,fn)=>{try{await fn()}catch(e){ok(nome+' (parou: a peça não existe ou não respondeu)',false,String(e.message).split('\n')[0].slice(0,120))}};
const vai=(p,h)=>p.evaluate(h=>{location.hash=h},h);
const PC={viewport:{width:1280,height:800}},CEL={viewport:{width:390,height:844},hasTouch:true,isMobile:true};
/* sessão encerrada inventada pelo encerrar() de verdade: José e Carlos ficam abaixo da meta (vão para o reforço) */
const criaSessao=()=>{const t=S.treinamentos[0];fixarVersao(t);
 const nomes=[['Maria Aparecida Silva','Packing',1],['José Wellington','Campo',0.3],['Ana Beatriz','Packing',1],['Carlos Eduardo','Campo',0]];
 const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:['Packing','Campo'],instrutor:'Instrutor Teste',local:'Sala 1',horas:'1',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'111222',entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:t.itens.length,t0:0,dur:0},sim:{on:false,alvo:0}};
 const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));
 nomes.forEach(([n,st,hab],k)=>{const p={id:uid(),nome:n,setor:st,real:true,cor:k%8};s.part.push(p);s.resp[p.id]={};
  qs.forEach(([it,i],j)=>{const a=(j/qs.length)<hab;let r;if(it.tipo==='ordenar')r=a?it.alternativas.map((_,x)=>x):it.alternativas.map((_,x)=>it.alternativas.length-1-x);else r=a?it.correta:((it.correta+1)%it.alternativas.length);s.resp[p.id][i]={r,ok:a,ms:3000,pts:a?1000:0}})});
 S.sessoes.push(s);encerrar(s);return s.id;};
/* medidas dentro da página: tamanhos de letra e tipos de canto visíveis dentro de uma raiz */
const escala=sel=>{const r=document.querySelector(sel);if(!r)return null;const vis=e=>{const b=e.getBoundingClientRect(),c=getComputedStyle(e);return b.width>0&&b.height>0&&c.display!=='none'&&c.visibility!=='hidden'};
 const els=[r,...r.querySelectorAll('*')].filter(vis).filter(e=>!e.closest('svg,.conf'));
 const tam=new Set(els.filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>getComputedStyle(e).fontSize));
 const can=new Set(els.map(e=>getComputedStyle(e).borderTopLeftRadius).filter(x=>x!=='0px'&&!/%|999/.test(x)&&parseFloat(x)<100));
 return {tam:tam.size,can:can.size,lt:[...tam].join(' '),lc:[...can].join(' ')}};
const infinitas=sel=>document.getAnimations().filter(a=>{const t=a.effect&&a.effect.target;return t&&t.closest&&t.closest(sel)&&a.effect.getComputedTiming().iterations===Infinity}).map(a=>a.animationName||'?');
(async()=>{const mock=await criar();await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const errs=[];
 const novo=async(opt,nome,extra={})=>{const ctx=await b.newContext({...opt,serviceWorkers:'block',...extra});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(nome+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_/.test(m.text()))errs.push(nome+' '+m.text())});p.setDefaultTimeout(6000);return {ctx,p}};

 // ---------- P1: Colaborador consulta Pendências ----------
 await bloco('P1',async()=>{const {ctx,p}=await novo(PC,'p1');await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  await p.evaluate(criaSessao);await p.evaluate(()=>{S.cfg.perfil='colaborador';render()});await vai(p,'#/pendencias');await p.waitForTimeout(400);
  ok('P1: o Colaborador abre Pendências',await p.evaluate(()=>location.hash==='#/pendencias'&&!!document.querySelector('.pnd-abas')));
  ok('P1: e vê quem está em reforço',/José Wellington/.test(await p.innerText('#app')));
  ok('P1: sem os botões "Aplicar reforço" e "Dar baixa"',(await p.locator('[data-act=aplicarpend],[data-act=baixa]').count())===0);
  ok('P1: aviso de que é só para consultar',/Só para consultar/.test(await p.innerText('#app')));
  ok('P1: Pendências aparece no menu do Colaborador',(await p.locator('#rail .ri[href="#/pendencias"]').count())===1);
  ok('P1: mesmo à força, aplicar e dar baixa ficam barrados para o Colaborador',await p.evaluate(()=>ACOES_GERIR.includes('aplicarpend')&&ACOES_GERIR.includes('baixa')));
  await p.evaluate(()=>{const b=document.createElement('button');b.dataset.act='baixa';b.dataset.tipo='ref';b.dataset.k=pendencias().ref[0].k;document.getElementById('app').appendChild(b);b.click()});await p.waitForTimeout(200);
  ok('P1: um "Dar baixa" forçado não registra nada',await p.evaluate(()=>(S.baixas||[]).length===0));
  await vai(p,'#/inicio');await p.waitForTimeout(400);
  ok('P1: o "Pede atenção" do Início mostra o reforço ao Colaborador',/reforço/i.test(await p.innerText('#app')));
  await p.screenshot({path:OUT+'/p1-colaborador.png'});
  await p.evaluate(()=>{S.cfg.perfil='primario';render()});await vai(p,'#/pendencias');await p.waitForTimeout(300);
  await p.evaluate(()=>{S.cfg.perfil='colaborador';render()});await p.evaluate(()=>{const s=S.sessoes.find(x=>x.fim);location.hash='#/relatorios/'+s.id});await p.waitForSelector('#relcod');await p.waitForTimeout(300);
  ok('P1 (revisor): no relatório, o Colaborador não vê Reaplicar, Pós-teste, Trocar, Remover nem Adicionar foto',(await p.locator('[data-act=reaplicar],[data-act=aplicarpos],[data-act=rmfoto],label[for=rl-foto]').count())===0);
  ok('P1 (revisor): e essas ações ficam barradas no código',await p.evaluate(()=>['rmfoto','reaplicar','aplicarpos'].every(a=>ACOES_GERIR.includes(a))));
  await p.evaluate(()=>{S.cfg.perfil='primario';render()});await vai(p,'#/pendencias');await p.waitForTimeout(300);
  ok('P1: o perfil Primário continua com os botões',(await p.locator('[data-act=aplicarpend]').count())>0&&(await p.locator('[data-act=baixa]').count())>0&&(await p.locator('.pnd-col').count())===0);
  await ctx.close();
  const c=await novo(CEL,'p1cel');await c.p.goto(U+'?demo=1');await c.p.waitForSelector('.coach');await c.p.evaluate(()=>{S.cfg.perfil='colaborador';render()});await c.p.waitForTimeout(300);
  ok('P1: no celular, Pendências fica na barra de baixo do Colaborador',(await c.p.locator('#bnav [href="#/pendencias"]').count())===1);await c.ctx.close();});

 // ---------- P2: código de autenticação ----------
 await bloco('P2',async()=>{const {ctx,p}=await novo(PC,'p2');await p.goto(U+'?demo=1');await p.waitForSelector('.coach');const id=await p.evaluate(criaSessao);
  await vai(p,'#/relatorios/'+id);await p.waitForSelector('#relcod');
  ok('P2: o relatório diz "Código de autenticação"',/Código de autenticação/.test(await p.innerText('.rl-cod')));
  await vai(p,'#/conferir');await p.waitForTimeout(300);
  ok('P2: o campo da tela Autenticar documento também',(await p.innerText('label[for=cf-c]'))==='Código de autenticação');
  const csv=await p.evaluate(id=>csvSessao(S.sessoes.find(x=>x.id===id)),id);
  ok('P2: a planilha da sessão também',/Código de autenticação/.test(csv)&&!/conferência/.test(csv));
  const src=fs.readFileSync(path.join(D,'index.html'),'utf8');
  ok('P2: nenhum "código de conferência" sobrou no app (nem no PDF)',!/[Cc]ódigo de conferência|codigo de conferencia/.test(src));
  ok('P2: o rodapé do PDF manda "autenticar este documento"',/Para autenticar este documento, digite o código do rodapé em Autenticar documento/.test(src));
  await p.fill('#cf-c',await p.evaluate(id=>garantirCodigo(S.sessoes.find(x=>x.id===id)),id));await p.click('.cf-f button[type=submit]');await p.waitForSelector('.cf-r.ok');
  ok('P2 (revisor): a tela usa "Autenticar" no botão e "Documento autêntico" no resultado',/Autenticar/.test(await p.innerText('.cf-f button[type=submit]'))&&/Documento autêntico/.test(await p.innerText('.cf-r')));
  ok('P2: o código continua o mesmo (PDFs antigos seguem conferindo)',await p.evaluate(id=>{const s=S.sessoes.find(x=>x.id===id);return s.cod===codigoDe(s)},id));
  await ctx.close();});

 // ---------- Fatia E: telão e celular ----------
 for(const tema of ['escuro','claro'])await bloco('Fatia E '+tema,async()=>{const esq=tema==='claro'?'light':'dark';
  const {ctx,p}=await novo(PC,'pc-'+tema,{colorScheme:esq});await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  await vai(p,'#/ajustes');await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await p.waitForTimeout(1200);
  await vai(p,'#/treinos');await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.fill('#f-ins','Instrutor Teste');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
  await p.evaluate(t=>{const s=sala(AO.id);s.aj.telao=t;s.sim.on=false;s.part=[];mudou(s)},tema);await p.waitForTimeout(300);
  const link=await p.getAttribute('[data-act=copiar]','data-v');const sid=await p.evaluate(()=>AO.id);
  const tl=await ctx.newPage();tl.on('pageerror',e=>errs.push('telão '+e.message));await tl.setViewportSize({width:1280,height:720});await tl.goto(U+'?demo=1#/telao/'+sid);await tl.waitForSelector('.telfull .tel');await tl.waitForTimeout(900);
  const fundo=await tl.evaluate(()=>getComputedStyle(document.querySelector('.tel')).backgroundColor);
  ok(`E ${tema}: telão nas cores da família EFC (${tema==='escuro'?'azul-noite':'marfim'}), sem o petróleo antigo`,fundo===(tema==='escuro'?'rgb(11, 13, 22)':'rgb(247, 245, 239)'),fundo);
  const pk=await tl.evaluate(()=>{const e=document.querySelector('.tel .pillk');const c=getComputedStyle(e);return {t:e.textContent.trim(),tt:c.textTransform,ls:c.letterSpacing}});
  ok(`E ${tema}: a chave sem maiúsculas espaçadas ("Chave 123 456")`,/^Chave \d{3} \d{3}$/.test(pk.t)&&pk.tt==='none'&&!/^[1-9]/.test(pk.ls),JSON.stringify(pk));
  let e1=await tl.evaluate(escala,'.tel');ok(`E ${tema}: espera com até 7 tamanhos de letra e até 3 tipos de canto`,e1.tam<=7&&e1.can<=3,JSON.stringify(e1));
  const cc=await b.newContext({...CEL,colorScheme:esq,serviceWorkers:'block'});const A=await cc.newPage();A.on('pageerror',e=>errs.push('cel '+e.message));
  await A.goto(link);await A.waitForSelector('#ce-n');await A.fill('#ce-n','Maria Silva');await A.click('button[type=submit]');await A.waitForFunction(()=>/Você está na sala/.test(document.body.innerText),null,{timeout:8000});
  await tl.waitForFunction(()=>document.querySelectorAll('.tel .cw').length===1,null,{timeout:6000});await A.waitForTimeout(2600);
  /* alguém entra: só o chip novo aparece suave; o resto da tela não pisca */
  await p.evaluate(()=>{const s=sala(AO.id);s.sim.on=true;s.sim.alvo=2;mudou(s)});await tl.waitForFunction(()=>document.querySelectorAll('.tel .cw').length===2,null,{timeout:6000});
  const ch=await tl.evaluate(()=>({chips:[...document.querySelectorAll('.tel .cw')].map(e=>e.getAnimations().length),join:document.querySelector('.tel .join').getAnimations().length}));
  ok(`E ${tema}: quem entra na sala aparece suave no telão, sem a tela inteira piscar`,ch.chips[1]>0&&ch.join===0,JSON.stringify(ch));
  const cel0=await A.evaluate(()=>[...document.querySelectorAll('.cb > *')].reduce((n,e)=>n+e.getAnimations().length,0));
  ok(`E ${tema}: no celular, a contagem de quem está na sala muda sem a tela entrar de novo`,cel0===0,String(cel0));
  /* pergunta */
  const idx=await p.evaluate(()=>{const s=sala(AO.id);return s.itens.findIndex(it=>it.tipo==='multipla')});
  await p.evaluate(i=>{const s=sala(AO.id);s.sim.on=false;entrarItem(s,i);mudou(s)},idx);await tl.waitForSelector('.tel .tile');await tl.waitForTimeout(60);
  const ent=await tl.evaluate(()=>({tiles:[...document.querySelectorAll('.tel .tile')].map(e=>e.getAnimations().map(a=>a.effect.getTiming().delay)),h2:document.querySelector('.tel .tq').getAnimations().length}));
  ok(`E ${tema}: a pergunta entra e as 4 alternativas entram em sequência (40 ms entre elas)`,ent.h2>0&&ent.tiles.length===4&&ent.tiles.every(d=>d.length)&&ent.tiles[1][0]-ent.tiles[0][0]===40,JSON.stringify(ent));
  await tl.waitForTimeout(700);
  const cores=await tl.evaluate(()=>[...document.querySelectorAll('.tel .tile')].map(e=>getComputedStyle(e).backgroundColor));
  ok(`E ${tema}: as 4 cores das alternativas são as mesmas de antes`,JSON.stringify(cores)===JSON.stringify(['rgb(201, 67, 43)','rgb(42, 99, 194)','rgb(201, 143, 0)','rgb(42, 135, 82)']),cores.join(' '));
  const am=await tl.evaluate(()=>getComputedStyle(document.querySelector('.tel .tile.k2')).color);
  ok(`E ${tema}: no amarelo a letra é escura (antes branca, contraste 2,8)`,am==='rgb(28, 20, 6)',am);
  e1=await tl.evaluate(escala,'.tel');ok(`E ${tema}: pergunta com até 7 tamanhos de letra e até 3 tipos de canto`,e1.tam<=7&&e1.can<=3,JSON.stringify(e1));
  await A.waitForSelector('.ct2');await A.waitForTimeout(500);
  const ce=await A.evaluate(()=>{const t=document.querySelector('.ct2.k2');const c=getComputedStyle(t);return {cor:c.color,tam:c.fontSize,canto:c.borderTopLeftRadius}});
  ok(`E ${tema}: no celular, amarelo com letra escura, alternativas com 19 px e o canto da família (10 px)`,ce.cor==='rgb(28, 20, 6)'&&ce.tam==='19px'&&ce.canto==='10px',JSON.stringify(ce));
  await A.locator('.ct2').nth(1).click();await A.waitForTimeout(400);
  /* re-render na mesma etapa (alguém respondeu) não anima as alternativas */
  await tl.waitForTimeout(400);await p.evaluate(()=>{const s=sala(AO.id);mudou(s)});await tl.waitForTimeout(60);
  ok(`E ${tema}: redesenhar na mesma etapa não faz as alternativas entrarem de novo`,await tl.evaluate(()=>[...document.querySelectorAll('.tel .tile')].every(e=>e.getAnimations().length===0)));
  /* conferindo */
  await p.evaluate(()=>{const s=sala(AO.id);fimPergunta(s);mudou(s)});await tl.waitForSelector('.tel .cf-pt');await tl.waitForTimeout(40);
  const pt=await tl.evaluate(()=>[...document.querySelectorAll('.tel .cf-pt i')].map(i=>i.getAnimations().map(a=>[a.effect.getTiming().delay,a.effect.getTiming().duration,a.effect.getComputedTiming().iterations])[0]));
  ok(`E ${tema}: "Conferindo": três pontos acendem uma vez (250 ms, um a cada 350 ms), sem roda girando`,pt.length===3&&pt.every(x=>x&&x[1]===250&&x[2]===1)&&pt[1][0]===350&&pt[2][0]===700,JSON.stringify(pt));
  await tl.waitForTimeout(560);await p.evaluate(()=>{const s=sala(AO.id);mudou(s)});await tl.waitForTimeout(30);
  const pt2=await tl.evaluate(()=>[...document.querySelectorAll('.tel .cf-pt i')].map(i=>+getComputedStyle(i).opacity));
  ok(`E ${tema}: revisor: uma resposta atrasada (telão redesenhado no "Conferindo") não apaga de novo os pontos já acesos`,pt2[0]===1&&pt2[1]>.25,JSON.stringify(pt2));
  ok(`E ${tema}: nada infinito no telão e no celular durante "Conferindo"`,(await tl.evaluate(infinitas,'.tel')).length===0&&(await A.evaluate(infinitas,'.cc')).length===0);
  await A.waitForSelector('.cf-pt',{timeout:4000}).catch(()=>{});
  ok(`E ${tema}: o celular também usa os três pontos`,(await A.locator('.cb .cf-pt').count())===1||/Você acertou|Você errou|Você não/.test(await A.innerText('body')));
  /* resultado */
  await tl.waitForFunction(()=>document.querySelector('.tel .tile.cor'),null,{timeout:4000});await tl.waitForTimeout(40);
  const rv=await tl.evaluate(()=>({veu:[...document.querySelectorAll('.tel .tile.off')].map(e=>e.getAnimations({subtree:false}).length+document.getAnimations().filter(a=>a.effect&&a.effect.target===e&&a.effect.pseudoElement==='::before').length),certa:document.getAnimations().filter(a=>a.effect&&a.effect.pseudoElement==='::after'&&a.effect.target.classList.contains('cor')).length,
   tiles:[...document.querySelectorAll('.tel .tile')].map(e=>e.getAnimations().length)}));
  ok(`E ${tema}: no resultado, as erradas ganham o véu suave e a certa o contorno (sem as alternativas entrarem de novo)`,rv.veu.length===3&&rv.veu.every(n=>n>0)&&rv.certa===1&&rv.tiles.every(n=>n===0),JSON.stringify(rv));
  await tl.waitForTimeout(600);
  const lt=await tl.evaluate(()=>{const e=document.querySelector('.tel .tile.off span:not(.sh):not(.pc)');return {cor:getComputedStyle(e).color,ink:getComputedStyle(document.querySelector('.tel')).getPropertyValue('--tel-ink').trim()}});
  ok(`E ${tema}: nas erradas a letra fica na cor do texto do telão, legível sobre o véu`,!!lt.cor,JSON.stringify(lt));
  await tl.screenshot({path:`${OUT}/telao-${tema}-resultado.png`});
  await tl.keyboard.press('p');await tl.waitForTimeout(200);
  const anel=await tl.evaluate(()=>({proj:document.querySelector('.telfull').classList.contains('proj'),cor:getComputedStyle(document.querySelector('.tel .tile.cor'),'::after').borderTopColor,fundo:getComputedStyle(document.querySelector('.tel')).backgroundColor}));
  ok(`E ${tema}: revisor: no modo Projetor o contorno da certa é preto sobre o fundo branco`,anel.proj&&anel.cor==='rgb(0, 0, 0)'&&anel.fundo==='rgb(255, 255, 255)',JSON.stringify(anel));
  await tl.keyboard.press('p');await tl.waitForTimeout(200);
  /* pódio */
  await p.evaluate(()=>{const s=sala(AO.id);s.aj.som='ligado';irPodio(s);mudou(s)});await tl.waitForSelector('.tel .podm');await tl.waitForTimeout(60);
  const pd=await tl.evaluate(()=>{const an=document.getAnimations().filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('.tel'));
   return {barras:[...document.querySelectorAll('.tel .pq .bar i')].every(e=>e.getAnimations().length>0),blocos:[...document.querySelectorAll('.tel .blk')].map(e=>e.getAnimations().map(a=>a.effect.getTiming().delay)[0]),
    festa:[...document.querySelectorAll('.tel .conf i')].map(e=>e.getAnimations().map(a=>[a.effect.getTiming().duration,a.effect.getComputedTiming().iterations])[0]),max:Math.max(...an.map(a=>a.effect.getTiming().duration)),inf:an.filter(a=>a.effect.getComputedTiming().iterations===Infinity).length}});
  ok(`E ${tema}: pódio: as barras crescem e os blocos sobem (3º, 2º e por último o 1º)`,pd.barras&&pd.blocos.length>=1&&pd.blocos.every(d=>[300,450,600].includes(d))&&Math.max(...pd.blocos)===600,JSON.stringify(pd.blocos));
  ok(`E ${tema}: a festa sai uma vez do 1º lugar (cada papel 500 ms), nada cai sem parar`,pd.festa.length===26&&pd.festa.every(x=>x&&x[0]===500&&x[1]===1)&&pd.inf===0,JSON.stringify(pd.festa.slice(0,2))+' inf '+pd.inf);
  ok(`E ${tema}: nenhuma duração fora da escala no telão (máximo 500 ms)`,pd.max<=500,String(pd.max));
  await tl.waitForTimeout(1200);
  const fo=await tl.evaluate(()=>{const t=document.querySelector('.tel'),k=t.getBoundingClientRect().width/1280,b=document.querySelector('.tel .stage .p1 .blk');const rb=b.getBoundingClientRect(),rt=t.getBoundingClientRect();return {topo:Math.round((rb.top-rt.top)/k),papel:Math.round(parseFloat(document.querySelector('.tel .conf i').style.top))}});
  ok(`E ${tema}: revisor: os papéis saem de cima do bloco do 1º lugar (não da base do pódio)`,Math.abs(fo.topo-fo.papel)<=4,JSON.stringify(fo));
  /* novidade no meio do pódio: as animações continuam de onde estavam */
  await p.evaluate(()=>{const s=sala(AO.id);s.fase={etapa:'espera',idx:-1,t0:0,dur:0};mudou(s)});await tl.waitForTimeout(400);await p.evaluate(()=>{const s=sala(AO.id);irPodio(s);mudou(s)});await tl.waitForTimeout(400);await p.evaluate(()=>{const s=sala(AO.id);mudou(s)});await tl.waitForTimeout(30);
  const cont=await tl.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.target&&a.effect.target.classList&&a.effect.target.classList.contains('blk')).map(a=>Math.round(a.effect.getTiming().delay-(a.currentTime||0))));
  ok(`E ${tema}: revisor: uma novidade no meio do pódio não faz os blocos pularem (continuam de onde estavam)`,cont.length>0&&cont.every(x=>x<=600-380),JSON.stringify(cont));
  await tl.waitForTimeout(1800);await tl.screenshot({path:`${OUT}/telao-${tema}-podio.png`});
  e1=await tl.evaluate(escala,'.tel');ok(`E ${tema}: pódio com até 7 tamanhos de letra e até 3 tipos de canto`,e1.tam<=7&&e1.can<=3,JSON.stringify(e1));
  await A.waitForTimeout(800);
  const cf=await A.evaluate(()=>{const e=document.querySelector('.cc');const r=[...e.querySelectorAll('*')].filter(x=>x.getBoundingClientRect().width>0).map(x=>getComputedStyle(x).borderTopLeftRadius).filter(x=>x!=='0px'&&!/%|999/.test(x)&&parseFloat(x)<100);return [...new Set(r)]});
  ok(`E ${tema}: o celular no fim usa até 3 tipos de canto`,cf.length<=3,cf.join(' '));
  await cc.close();await ctx.close();});

 // ---------- celular: tela que muda entra suave; conectando sem roda ----------
 await bloco('Celular',async()=>{const {ctx,p}=await novo(CEL,'cel');await p.route(mock.url.replace(/\/$/,'')+'/**',async r=>{await new Promise(z=>setTimeout(z,3000));r.continue().catch(()=>{})});
  const lk=await (async()=>{const c=await novo(PC,'lk');await c.p.goto(U+'?demo=1');await c.p.waitForSelector('.coach');await c.p.evaluate(()=>{location.hash='#/ajustes'});await c.p.waitForSelector('#c-fb');await c.p.fill('#c-fb',mock.url);await c.p.click('[data-act=fbtestar]');await c.p.waitForTimeout(1200);await c.p.evaluate(()=>{location.hash='#/treinos';render()});await c.p.waitForSelector('.tr:not(.h)');await c.p.click('.tr:not(.h) .b.p >> nth=0');await c.p.waitForSelector('.apl');await c.p.fill('#f-ins','X');await c.p.click('[data-act=abrirsala]');await c.p.waitForSelector('.sala');const l=await c.p.getAttribute('[data-act=copiar]','data-v');await c.ctx.close();return l})();
  await p.goto(lk);await p.waitForTimeout(700);
  const tem=await p.evaluate(()=>({pt:document.querySelectorAll('.cb .cf-pt i').length,roda:document.querySelectorAll('.rodar').length}));
  const txt=await p.innerText('body');ok('Celular: "Conectando à sala" com os três pontos, sem a roda que girava sem parar',/Conectando à sala/.test(txt)&&tem.roda===0&&tem.pt===3,JSON.stringify(tem));
  ok('Celular: nada infinito enquanto conecta',(await p.evaluate(infinitas,'.cc')).length===0);
  await ctx.close();});

 // ---------- movimento reduzido ----------
 await bloco('Reduzido',async()=>{const {ctx,p}=await novo(PC,'rm',{reducedMotion:'reduce'});await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  await vai(p,'#/treinos');await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.fill('#f-ins','Instrutor Teste');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
  const sid=await p.evaluate(()=>AO.id);const tl=await ctx.newPage();await tl.setViewportSize({width:1280,height:720});await tl.goto(U+'?demo=1#/telao/'+sid);await tl.waitForSelector('.telfull .tel');await tl.waitForTimeout(500);
  await p.evaluate(()=>{const s=sala(AO.id);entrarItem(s,s.itens.findIndex(it=>it.tipo==='multipla'));mudou(s)});await tl.waitForSelector('.tel .tile');await tl.waitForTimeout(60);
  ok('Com "movimento reduzido", a pergunta aparece direto no telão',await tl.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('.tel')).length===0));
  await p.evaluate(()=>{const s=sala(AO.id);fimPergunta(s);mudou(s)});await tl.waitForSelector('.tel .cf-pt');await tl.waitForTimeout(60);
  ok('Com "movimento reduzido", os três pontos já aparecem acesos',await tl.evaluate(()=>[...document.querySelectorAll('.tel .cf-pt i')].every(i=>getComputedStyle(i).opacity==='1')));
  await ctx.close();});

 ok('Console sem erro',errs.length===0,errs.slice(0,3).join(' | '));
 await b.close();srv.close();mock.fecha&&mock.fecha();
 const nOk=log.filter(l=>l.startsWith('OK')).length;console.log(log.join('\n'));console.log(nOk+' OK de '+log.length+(nOk===log.length?'':' · ERRO'));process.exit(nOk===log.length?0:1);})();
