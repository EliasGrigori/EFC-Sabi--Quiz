/* v1.4.1 e v1.4.2: resposta que chega atrasada conta, iniciais sem hífen, bichos maiores no celular. uso: SABIA_REGRAS=1 node teste-v141.js <dist> <prints> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
(async()=>{const mock=await criar();await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});const p=await ctx.newPage();p.on('pageerror',e=>errs.push('instrutor '+e.message));
await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
const ini=await p.evaluate(()=>[iniciais('Teste - José Elias'),iniciais('Maria Silva'),iniciais('ana'),iniciais('- ?'),iniciais('João-Pedro Souza')]);
ok('Iniciais ignoram o hífen',ini[0]==='TJ'&&ini[1]==='MS'&&ini[2]==='A'&&ini[3]===''&&ini[4]==='JS',ini.join(' | '));
await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await p.waitForTimeout(1500);
await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.fill('#f-ins','José Elias');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
const link=await p.getAttribute('[data-act=copiar]','data-v');
const cc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const A=await cc.newPage();A.on('pageerror',e=>errs.push('celular '+e.message));
await A.goto(link);await A.waitForSelector('#ce-n');await A.fill('#ce-n','Maria - Silva');
// tamanhos na tela de nome
const m1=await A.evaluate(()=>{const e=document.querySelector('.bon-m');return e?e.getBoundingClientRect().width:0});
ok('Quadro do bicho na tela de nome maior (140 px)',m1>=138,String(m1));
const rc=await A.evaluate(async()=>{const u=await bonDesenha('jacare.0...mago.lenco');const im=new Image();im.src=u;await im.decode();return im.naturalWidth});
ok('Bicho recortado para ocupar mais o quadro (250 de 320 px)',rc===250,String(rc));
await A.screenshot({path:OUT+'/cel-nome.png'});
// montador em 2 colunas
await A.click('[data-act=cbon]');await A.waitForSelector('.bon-op');await A.waitForTimeout(600);
const g=await A.evaluate(()=>{const op=document.querySelector('.bon-op'),it=op.querySelectorAll('.bon-i'),cols=getComputedStyle(op).gridTemplateColumns.split(' ').length,w=it[0].getBoundingClientRect().width,mini=it[0].querySelector('.bon-mini').getBoundingClientRect(),topo=document.querySelector('.bon-g').getBoundingClientRect().width;return {cols,w,mini:mini.width,mh:mini.height,topo,sx:document.documentElement.scrollWidth>innerWidth+1}});
ok('Opções em 2 colunas',g.cols===2,String(g.cols));
ok('Miniaturas grandes (pelo menos 130 px) e quadradas',g.mini>=130&&Math.abs(g.mini-g.mh)<2,Math.round(g.mini)+'x'+Math.round(g.mh));
ok('Prévia do bicho maior (150 px)',g.topo>=148,String(g.topo));
ok('Sem rolagem para o lado no montador',!g.sx);
await A.screenshot({path:OUT+'/cel-montar-bicho.png'});
await A.click('[data-act=cbonaba][data-v=cab]');await A.waitForTimeout(700);await A.screenshot({path:OUT+'/cel-montar-cabeca.png'});
await A.click('[data-act=cbonaba][data-v=cor]');await A.waitForTimeout(400);await A.screenshot({path:OUT+'/cel-montar-cor.png'});
const cor=await A.evaluate(()=>{const a=[...document.querySelectorAll('.bon-i .bon-amostra')];return {n:a.length,w:Math.min(...a.map(x=>x.getBoundingClientRect().width)),op:document.querySelector('.bon-op').getBoundingClientRect().width}});
ok('Aba Cor mostra as 10 cores, cada uma visível',cor.n===10&&cor.w>=80&&cor.op>300,JSON.stringify(cor));
for(const k of ['roupa','det','pes']){await A.click('[data-act=cbonaba][data-v='+k+']');await A.waitForTimeout(500);const n=await A.evaluate(()=>document.querySelectorAll('.bon-i').length);ok('Aba '+k+' mostra opções',n>=5,String(n));await A.screenshot({path:OUT+'/cel-montar-'+k+'.png'});}
await A.click('[data-act=cbonaba][data-v=bicho]');
await A.click('[data-act=cbonok]');await A.waitForTimeout(400);
await A.click('button[type=submit]');await A.waitForFunction(()=>document.body.innerText.includes('Você está na sala'),null,{timeout:8000}).catch(()=>{});await A.waitForTimeout(700);
const e2=await A.evaluate(()=>{const e=document.querySelector('.eu2 .avb');return e?e.getBoundingClientRect().width:0});
ok('Bicho na espera bem maior, em cima do nome (pelo menos 220 px)',e2>=220,String(e2));
const emp=await A.evaluate(()=>{const a=document.querySelector('.eu2 .avb').getBoundingClientRect(),n=document.querySelector('.eu2 b').getBoundingClientRect();return n.top>=a.bottom-2});
ok('Nome fica embaixo do bicho na espera',emp);
await A.screenshot({path:OUT+'/cel-espera.png'});
await p.waitForFunction(()=>sala(AO.id).part.some(x=>x.real),null,{timeout:8000}).catch(()=>{});
// ---- resposta atrasada
const dados=await p.evaluate(()=>{const s=sala(AO.id),qs=s.itens.map((it,i)=>ehPergunta(it)?i:-1).filter(i=>i>=0);return {pid:s.part.find(x=>x.real).id,qs,chave:s.chave}});
ok('Há participante real e pelo menos 3 perguntas',!!dados.pid&&dados.qs.length>=3,JSON.stringify(dados.qs));
const q0=dados.qs[0],q1=dados.qs[1],q2=dados.qs[2];
const envia=(idx,usar)=>p.evaluate(async([pid,idx,usar])=>{const s=sala(AO.id),it=s.itens[idx];const r=usar==='certa'?it.correta:(it.correta+1)%it.alternativas.length;await Rede.req(Rede.url(),'PUT','/salas/'+s.chave+'/resp/'+pid+'/'+idx,{r});},[dados.pid,idx,usar]).catch(e=>String(e));
const A1=await p.evaluate(async([q0])=>{const s=sala(AO.id);entrarItem(s,q0);mudou(s);return {e:s.fase.etapa,i:s.fase.idx}},[q0]);
ok('Pergunta aberta para o teste',A1.e==='pergunta'&&A1.i===q0,JSON.stringify(A1));
// caso 1: instrutor passa; a resposta certa chega logo depois
await p.evaluate(()=>{const s=sala(AO.id);fimPergunta(s);mudou(s)});
const r1=await envia(q0,'certa');
const c1=await p.waitForFunction(([pid,q0])=>{const s=sala(AO.id);return s.resp[pid]&&s.resp[pid][q0]},[dados.pid,q0],{timeout:5000}).then(()=>true).catch(()=>false);
const v1=await p.evaluate(([pid,q0])=>{const s=sala(AO.id);return s.resp[pid]&&s.resp[pid][q0]},[dados.pid,q0]);
ok('Resposta certa que chegou logo depois de "passar" conta como acerto',c1&&v1&&v1.ok===true&&v1.pts>0,JSON.stringify(v1)+' '+(r1||''));
// caso 2: passou direto para a próxima (sem tela de resultado, como no pré-teste)
await p.evaluate(([q1])=>{const s=sala(AO.id);entrarItem(s,q1);mudou(s)},[q1]);
await p.evaluate(([q2])=>{const s=sala(AO.id);seguir(s);},[q2]);
const fase2=await p.evaluate(()=>{const s=sala(AO.id);return {i:s.fase.idx,u:s.ult&&s.ult.i}});
await envia(q1,'certa');
const c2=await p.waitForFunction(([pid,q1])=>{const s=sala(AO.id);return s.resp[pid]&&s.resp[pid][q1]},[dados.pid,q1],{timeout:5000}).then(()=>true).catch(()=>false);
ok('Também conta quando o instrutor já abriu a pergunta seguinte',c2,JSON.stringify(fase2));
// caso 3: muito depois (fora da janela) não conta
await p.evaluate(()=>{const s=sala(AO.id);fimPergunta(s);mudou(s);if(s.ult)s.ult.fim-=20000;});
const idxTarde=await p.evaluate(()=>{const s=sala(AO.id);return s.fase.idx});
await p.evaluate(async([pid,idx])=>{const s=sala(AO.id),it=s.itens[idx];await Rede.req(Rede.url(),'PUT','/salas/'+s.chave+'/resp/'+pid+'/'+idx,{r:it.correta});},[dados.pid,idxTarde]).catch(()=>{});
await p.waitForTimeout(1500);
const v3=await p.evaluate(([pid,i])=>{const s=sala(AO.id);return s.resp[pid]&&s.resp[pid][i]},[dados.pid,idxTarde]);
ok('Resposta que chega muito depois (mais de 10 s) não conta',!v3,JSON.stringify(v3));
// caso 4: pergunta antiga, sem ser a última fechada, não conta
const v4a=await p.evaluate(([pid,q2])=>{const s=sala(AO.id);return s.resp[pid]&&s.resp[pid][q2]},[dados.pid,q2]);
ok('Pergunta que nunca foi aberta não recebe resposta',!v4a);
ok('Sem erros de JavaScript',errs.length===0,errs.join(' | ').slice(0,300));
const f=log.filter(l=>l.startsWith('FALHA')).length;console.log(log.join('\n'));console.log((log.length-f)+' OK / '+f+' FALHAS');await b.close();srv.close();process.exit(0)})();
