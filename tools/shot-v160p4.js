/* v1.6.0 parte 4: prints (P1, P2) e vídeos (telão e celular) do app de verdade para a página de aprovação.
   uso: SABIA_REGRAS=1 node shot-v160p4.js <dist> <saida> <a|d>   (a = antes, d = depois). Os prints do telão e do celular vêm de varredura-fatiaE.js. */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3],PX=process.argv[4]||'d';fs.mkdirSync(OUT,{recursive:true});const VID=OUT+'/_v';fs.mkdirSync(VID,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.mjs':'text/javascript','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const PC={viewport:{width:1280,height:800}},CEL={viewport:{width:390,height:844},hasTouch:true,isMobile:true};
const criaSessao=()=>{const t=S.treinamentos[0];fixarVersao(t);
 const nomes=[['Maria Aparecida Silva','Packing',1],['José Wellington','Campo',0.3],['Ana Beatriz','Packing',1],['Carlos Eduardo','Campo',0]];
 const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:['Packing','Campo'],instrutor:'Instrutor Teste',local:'Sala 1',horas:'1',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'111222',entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:t.itens.length,t0:0,dur:0},sim:{on:false,alvo:0}};
 const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));
 nomes.forEach(([n,st,hab],k)=>{const p={id:uid(),nome:n,setor:st,real:true,cor:k%8};s.part.push(p);s.resp[p.id]={};
  qs.forEach(([it,i],j)=>{const a=(j/qs.length)<hab;let r;if(it.tipo==='ordenar')r=a?it.alternativas.map((_,x)=>x):it.alternativas.map((_,x)=>it.alternativas.length-1-x);else r=a?it.correta:((it.correta+1)%it.alternativas.length);s.resp[p.id][i]={r,ok:a,ms:3000,pts:a?1000:0}})});
 S.sessoes.push(s);encerrar(s);return s.id;};
(async()=>{const mock=await criar();await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();
 const fimVideo=async(ctx,p,n)=>{const v=p.video();await ctx.close();fs.renameSync(await v.path(),`${OUT}/${PX}-${n}.webm`)};
 /* P1: Colaborador em Pendências */
 {const ctx=await b.newContext({...PC,serviceWorkers:'block'});const p=await ctx.newPage();await p.goto(U+'?demo=1');await p.waitForSelector('.coach');const id=await p.evaluate(criaSessao);
  await p.evaluate(()=>{S.cfg.perfil='colaborador';location.hash='#/pendencias';render()});await p.waitForTimeout(1300);await p.screenshot({path:`${OUT}/${PX}-pc-pendencias-colab.png`});
  await p.evaluate(()=>{S.cfg.perfil='primario';render()});
  await p.evaluate(id=>{location.hash='#/relatorios/'+id},id);await p.waitForSelector('#relcod');await p.waitForTimeout(1300);await p.locator('.rl-cod').scrollIntoViewIfNeeded();await p.waitForTimeout(300);
  const r=await p.locator('.rl-cod').boundingBox();await p.screenshot({path:`${OUT}/${PX}-pc-codigo.png`,clip:{x:Math.max(0,r.x-240),y:Math.max(0,r.y-120),width:900,height:260}});
  await p.evaluate(()=>{location.hash='#/conferir'});await p.waitForTimeout(1300);await p.screenshot({path:`${OUT}/${PX}-pc-autenticar.png`});
  await ctx.close();}
 /* vídeo do fluxo: telão e celular gravados juntos */
 if(PX==='d')for(const tema of ['escuro','claro']){const esq=tema==='claro'?'light':'dark';
  /* o telão precisa estar no mesmo navegador do instrutor: os dois ficam no contexto que grava (o vídeo do instrutor é jogado fora) */
  const ctx=await b.newContext({viewport:{width:1280,height:720},colorScheme:esq,serviceWorkers:'block',recordVideo:{dir:VID,size:{width:1280,height:720}}});const p=await ctx.newPage();await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await p.waitForTimeout(1200);
  await p.evaluate(()=>{location.hash='#/treinos';render()});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.fill('#f-ins','Instrutor Teste');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
  await p.evaluate(t=>{const s=sala(AO.id);s.aj.telao=t;s.aj.som='ligado';s.sim.on=false;s.part=[];mudou(s)},tema);await p.waitForTimeout(300);
  const link=await p.getAttribute('[data-act=copiar]','data-v');const id=await p.evaluate(()=>AO.id);
  const tl=await ctx.newPage();await tl.goto(U+'?demo=1#/telao/'+id);await tl.waitForSelector('.telfull .tel');
  const vc=await b.newContext({...CEL,colorScheme:esq,serviceWorkers:'block',recordVideo:{dir:VID,size:{width:390,height:844}}});const A=await vc.newPage();
  await tl.waitForTimeout(1600);await A.goto(link);await A.waitForSelector('#ce-n');await A.waitForTimeout(500);await A.fill('#ce-n','Maria Silva');await A.click('button[type=submit]');await A.waitForTimeout(2200);
  await p.evaluate(()=>{const s=sala(AO.id);s.sim.on=true;s.sim.alvo=3;mudou(s)});await tl.waitForTimeout(2600);
  const idx=await p.evaluate(()=>sala(AO.id).itens.findIndex(it=>it.tipo==='multipla'));
  await p.evaluate(i=>{const s=sala(AO.id);s.sim.on=false;entrarItem(s,i);mudou(s)},idx);await tl.waitForTimeout(2200);
  await A.locator('.ct2').nth(1).click().catch(()=>{});await tl.waitForTimeout(1500);
  await p.evaluate(()=>{const s=sala(AO.id);fimPergunta(s);mudou(s)});await tl.waitForTimeout(3600);
  await p.evaluate(()=>{const s=sala(AO.id);irPodio(s);mudou(s)});await tl.waitForTimeout(3600);
  const vtl=tl.video(),vp=p.video();await ctx.close();fs.renameSync(await vtl.path(),`${OUT}/${PX}-v-telao-${tema}.webm`);fs.unlinkSync(await vp.path());await fimVideo(vc,A,`v-cel-${tema}`);}
 await b.close();srv.close();mock.fecha&&mock.fecha();console.log('ok');process.exit(0)})();
