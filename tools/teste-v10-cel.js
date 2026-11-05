/* v1.0.0 no celular de 390 px: banco, criar com IA, voz no editor, carimbo no relatório. uso: node teste-v10-cel.js <dist> <prints> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
(async()=>{
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 for(const tema of ['light','dark']){
 const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',permissions:['microphone'],colorScheme:tema});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 const sx=async n=>ok(n+': sem rolagem lateral ('+tema+')',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.body.scrollWidth<=innerWidth+1));
 const alvos=async(sel,n)=>{const r=await p.evaluate(s=>[...document.querySelectorAll(s)].filter(e=>e.offsetParent&&!e.disabled).map(e=>{const r=e.getBoundingClientRect();return {h:Math.round(r.height),w:Math.round(r.width),t:(e.innerText||e.getAttribute('aria-label')||'').slice(0,24)}}).filter(x=>x.h<36||x.w<36),sel);ok(n+': alvos de toque >=36px ('+tema+')',r.length===0,JSON.stringify(r.slice(0,4)))};
 const tid=await p.evaluate(()=>{const t=criarDoZero('Higiene da ordenha',80);t.itens.push({tipo:'multipla',enunciado:'Quando lavar as mãos antes da ordenha, e por quanto tempo, segundo o POP da fazenda?',alternativas:['Só no fim do dia','Sempre, antes de tocar no animal','Quando estiverem sujas','Nunca'],correta:1,tempo:20,uso:'avaliacao',porque:'A mão limpa evita contaminar o leite.'});salvar();guardarNoBanco(t.itens,t.titulo);return t.id});
 await p.evaluate(h=>{location.hash=h},'#/editar/'+tid);await p.waitForSelector('.edit');await p.waitForTimeout(300);
 await sx('Editor com voz');await p.locator('#vz-box').scrollIntoViewIfNeeded();await p.screenshot({path:OUT+'/c-'+tema+'-editor-voz.png'});
 await alvos('.edit .b, .edit button','Editor');
 await p.click('[data-act=bnabrir]');await p.waitForSelector('.bn-i');await p.waitForTimeout(200);
 await sx('Banco');await alvos('#dlg .b, #dlg button','Banco');await p.screenshot({path:OUT+'/c-'+tema+'-banco.png'});await p.click('[data-act=fechar]');
 await p.evaluate(h=>{location.hash=h},'#/treinos');await p.waitForSelector('[data-act=novo]');await p.click('[data-act=novo]');await p.click('[data-act=dlgia]');await p.waitForSelector('#ia-t');
 await p.fill('#ia-t','Lavagem das mãos antes da ordenha');await p.click('#dlg .b.p[type=submit]');await p.waitForSelector('#ia-out');await p.waitForTimeout(250);
 await sx('Criar com IA');await alvos('#dlg .b, #dlg button, #dlg select, #dlg input','Criar com IA');
 ok('O diálogo cabe na altura da tela e rola ('+tema+')',await p.evaluate(()=>{const d=document.querySelector('#dlg');return d.getBoundingClientRect().height<=innerHeight+1}));
 await p.screenshot({path:OUT+'/c-'+tema+'-ia.png'});await p.click('[data-act=fechar]');
 const sid=await p.evaluate(()=>{const t=criarDoZero('Carimbo',80);t.itens.push({tipo:'multipla',enunciado:'P1',alternativas:['a','b'],correta:0,tempo:20,uso:'avaliacao',porque:''});salvar();const id=(function(t){fixarVersao(t);const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:[],instrutor:'Elias',local:'',horas:'1',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'123456',entrada:true,part:[{id:uid(),nome:'Ana Souza',setor:'Packing',real:true,cor:1}],resp:{},fase:{etapa:'espera',idx:-1,t0:0,dur:0},sim:{on:false,alvo:0},criada:new Date().toISOString()};s.resp[s.part[0].id]={0:{r:0,ok:true,ms:3000,pts:900}};S.sessoes.push(s);encerrar(s);const x=S.sessoes.find(y=>y.id===s.id);x.fim=new Date().toISOString();x.cod=codigoDe(x);x.selo={t:Date.now()-5000,dif:-300,em:new Date().toISOString(),antigo:false};S.cfg.fbUrl='http://127.0.0.1:9';salvar();return x.id})(t);return id});
 await p.evaluate(h=>{location.hash=h},'#/relatorios/'+sid);await p.waitForSelector('.rl-selo');await p.waitForTimeout(300);
 await sx('Relatório com carimbo');await alvos('.rl-selo .b','Carimbo');await p.locator('.rl-selo').scrollIntoViewIfNeeded();await p.screenshot({path:OUT+'/c-'+tema+'-carimbo.png'});
 await p.evaluate(h=>{location.hash=h},'#/conferir');await p.waitForSelector('#selo-cons');await sx('Conferir');await alvos('#selo-cons .b','Conferir');
 ok('Sem erros de JS ('+tema+')',errs.length===0,errs.slice(0,2).join(' | '));
 await ctx.close();}
 console.log(log.join('\n'));console.log('\n'+log.filter(l=>l.startsWith('OK')).length+' OK / '+log.filter(l=>l.startsWith('FALHA')).length+' FALHAS');
 await b.close();srv.close();
})().catch(e=>{console.log(log.join('\n'));console.error('ERRO',e);process.exit(1)});
