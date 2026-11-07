/* prints para a aprovação da v1.5.0 (antes = site publicado, depois = dist). uso: node shot-antes15.js <site> <saida> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})});
const FX=[path.join(__dirname,'fx15/'),path.join(__dirname,'../fx15/')].find(fs.existsSync);
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,serviceWorkers:'block'});const p=await ctx.newPage();
await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
const tid=await p.evaluate(()=>{const t=criarDoZero('Higiene das mãos',80);t.itens.push({tipo:'explicacao',enunciado:'Abertura',texto:'Texto.',uso:'avaliacao',tempo:20},{tipo:'multipla',enunciado:'Quando lavar?',alternativas:['A','B','C','D'],correta:1,tempo:20,uso:'avaliacao',porque:'.'});salvar();return t.id});
await p.evaluate(h=>{location.hash=h},'#/editar/'+tid);await p.waitForSelector('.edit');await p.click('[data-act=painel]');await p.waitForSelector('.dl.pn');await p.click('.pn-t [data-v=material]');await p.waitForTimeout(200);
await p.setInputFiles('#mt-arq',FX+'slides.pdf');await p.waitForTimeout(400);await p.waitForFunction(()=>!/Lendo/.test((document.querySelector('#mt-st')||{}).textContent||''),null,{timeout:20000});await p.waitForTimeout(400);
await p.screenshot({path:OUT+'/painel.png'});
await p.click('[data-act=mtprev]');await p.waitForTimeout(2500);await p.screenshot({path:OUT+'/visor.png'});await p.keyboard.press('Escape');await p.waitForTimeout(300);
// sala na espera
const sid=await p.evaluate(tid=>{const t=treino(tid);const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:[],instrutor:'José Elias',local:'',horas:'1',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'482917',entrada:true,part:[],resp:{},fase:{etapa:'espera',idx:-1,t0:0,dur:0},sim:{on:false,alvo:0},criada:new Date().toISOString()};S.sessoes.push(s);AO.id=s.id;s.part.push({id:uid(),nome:'Maria Silva',setor:'Campo',real:true,cor:1});salvar();location.hash='#/sala/'+s.id;return s.id},tid);
await p.waitForSelector('.sala');const tl=await ctx.newPage();await tl.setViewportSize({width:1280,height:720});await tl.goto(U+'#/telao/'+sid);await tl.waitForSelector('.telfull .tel');await p.waitForTimeout(600);
if(await p.locator('[data-act=aprtel]').count()){await p.click('[data-act=aprtel]');await tl.waitForSelector('.matov canvas.ap-pg');await tl.waitForTimeout(1200);await p.waitForTimeout(500);}
await p.screenshot({path:OUT+'/controle.png',clip:{x:0,y:0,width:1280,height:520}});await tl.screenshot({path:OUT+'/telao.png'});
await tl.close();
await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForTimeout(300);await p.evaluate(()=>dlgIA());await p.waitForTimeout(400);await p.screenshot({path:OUT+'/ia.png'});
await b.close();srv.close();process.exit(0)})();
