const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
const LENTO=Number(process.env.SABIA_ATRASO||0)*8;
const espera=async(p,fn,arg,ms=8000)=>{try{await p.waitForFunction(fn,arg,{timeout:ms+LENTO});return true}catch(e){return false}};
/* lê part/pid/ref da Maria no banco, esperando até a condição valer (o banco pode ser lento) */
const refMaria=async(mock,chave,cond)=>{let r=null;for(let k=0;k<40+LENTO/250;k++){const sl=mock.tree()&&mock.tree().salas&&mock.tree().salas[chave];const pt=(sl&&sl.part)||{};const pid=Object.keys(pt).find(x=>pt[x].n==='Maria Silva');r=pid?pt[pid].ref:null;if(r&&cond(r))return r;await new Promise(z=>setTimeout(z,250));}return r||{};};
const tem=async(p,txt,sel='body',ms=8000)=>espera(p,([t,s])=>{const e=document.querySelector(s);return !!e&&e.innerText.includes(t)},[txt,sel],ms);
(async()=>{
 const mock=await criar();
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
 const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('instrutor pageerror '+e.message));
 p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push('instrutor '+m.text())});
 async function celular(nome){const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const q=await c.newPage();
  q.on('pageerror',e=>errs.push(nome+' pageerror '+e.message));q.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(nome+' '+m.text())});return q}
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 await p.evaluate(u=>{S.cfg.fbUrl=u;salvar()},mock.url);
 // ---------- sessão normal
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');
 await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');
 await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const chave=(await p.textContent('#cod')).replace(/\D/g,'');
 const link=await p.getAttribute('[data-act=copiar]','data-v');
 const A=await celular('A');await A.goto(link);await A.waitForSelector('#ce-n');await A.fill('#ce-n','Maria Silva');await A.click('button[type=submit]');
 ok('A entra',await tem(A,'Você está na sala'));
 const B=await celular('B');await B.goto(link);await B.waitForSelector('#ce-n');await B.fill('#ce-n','José Wellington');await B.click('button[type=submit]');
 ok('B entra',await tem(B,'Você está na sala'));
 await espera(p,()=>document.querySelectorAll('.pgrid .pp').length===2,null);
 const item=()=>p.evaluate(()=>{const s=S.sessoes.find(x=>x.estado==='sala');const it=s.itens[s.fase.idx];return {tipo:it.tipo,c:it.correta,alts:it.alternativas||[],n:(it.alternativas||[]).length,etapa:s.fase.etapa,idx:s.fase.idx}});
 let guard=0,nresp=0,primeiraProg=false,progB=false;
 await p.click('[data-act=proxima]');// explicação
 while(guard++<14){
   await p.click('[data-act=proxima]');
   const et=await p.textContent('.etapa .chip');
   if(et.includes('Pódio'))break;
   if(!et.includes('Pergunta no ar'))continue;
   const it=await item();nresp++;
   await espera(A,()=>document.querySelectorAll('.ct2,.ot').length>=2,null);
   if(it.tipo==='ordenar'){
     for(const t of [...it.alts].reverse())await A.click(`.ot:has-text("${t}")`);
     await A.click('[data-act=cordok]');
     for(const t of it.alts)await B.click(`.ot:has-text("${t}")`);
     await B.click('[data-act=cordok]');
   }else{
     await A.click(`.ct2 >> nth=${(it.c+1)%it.n}`);
     await B.click(`.ct2 >> nth=${it.c}`);
   }
   await espera(p,()=>/2 responderam/.test(document.querySelector('.sala').innerText),null,5000);
   if(nresp===1){ok('Durante a pergunta o celular mostra a linha de progresso',(await A.locator('.prg i').count())>=5);await A.screenshot({path:OUT+'/r-prog-pergunta.png'});}
   await p.click('[data-act=proxima]');
   await tem(A,'Aguarde a próxima');
   if(nresp===1){
     ok('Depois do resultado A vê 0 de 1 certa até aqui',await tem(A,'0 de 1 certa'));
     ok('Depois do resultado B vê 1 de 1 certa até aqui',await tem(B,'1 de 1 certa'));
     ok('A linha de progresso marca a errada e a certa',(await A.locator('.prg i.e').count())===1&&(await B.locator('.prg i.c').count())===1);
     await A.screenshot({path:OUT+'/r-prog-errou.png'});await B.screenshot({path:OUT+'/r-prog-acertou.png'});
   }
 }
 ok('Todas as perguntas foram respondidas',nresp>=5,String(nresp));
 ok('Chegou ao pódio',(await p.textContent('.etapa .chip')).includes('Pódio'));
 await tem(A,'certas');
 const revA=await A.evaluate(()=>Object.keys(CE.rev).length),errA=await A.evaluate(()=>errosCel().length);
 ok('Celular guardou todas as perguntas reveladas',revA===nresp,revA+' de '+nresp);
 ok('A errou todas e vê quantas rever',errA===nresp&&await tem(A,errA+' perguntas para rever'),String(errA));
 ok('A tem os botões Rever e Refazer',(await A.locator('[data-act=crever]').count())===1&&(await A.locator('[data-act=crefazer]').count())===1);
 await A.screenshot({path:OUT+'/r-podio-a.png',fullPage:true});
 ok('B acertou tudo e não vê botões de reforço',await tem(B,'Você acertou tudo')&&(await B.locator('[data-act=crefazer]').count())===0);
 await B.screenshot({path:OUT+'/r-podio-b.png'});
 ok('Sala mostra o cartão Treino no celular',await tem(p,'Treino no celular','.sala')&&await tem(p,'0 de 1 já','#refcard'));
 // rever
 await A.click('[data-act=crever]');
 ok('Rever lista as perguntas erradas com a resposta certa',await tem(A,'A resposta certa')&&(await A.locator('.rvq').count())===errA);
 ok('Rever mostra o que A respondeu',(await A.locator('.rvq .rvm').count())===errA);
 ok('Rever mostra a explicação (porque)',(await A.locator('.rvq .por').count())>=1);
 await A.screenshot({path:OUT+'/r-rever.png',fullPage:true});
 await A.click('[data-act=cvolta]');await tem(A,'Rever o que errei');
 // refazer: primeira pergunta (não ordenar, se possível) errando uma vez e acertando
 await A.click('[data-act=crefazer]');
 ok('Treinar mostra tentativa 1 de 3',await tem(A,'Tentativa 1 de 3'));
 const qA=await A.evaluate(()=>{const x=errosCel().find(y=>!refFim(y.i));return {i:x.i,t:x.t,c:x.c,n:x.a.length,a:x.a}});
 await A.screenshot({path:OUT+'/r-refazer.png'});
 const dar=async(acerta)=>{
   const q=await A.evaluate(()=>{const x=CE.rev[CE.rf.i];return {i:CE.rf.i,t:x.t,c:x.c,a:x.a,n:x.a.length}});
   if(q.t==='ordenar'){const l=acerta?q.a:[...q.a].reverse();for(const t of l)await A.click(`.ot:has-text("${t}")`);await A.click('[data-act=crordok]');}
   else await A.click(`.ct2 >> nth=${acerta?q.c:(q.c+1)%q.n}`);
   return q;
 };
 let q1=await dar(false);
 ok('Errar mostra Ainda não e tentativa 1 de 3',await tem(A,'Ainda não')&&await tem(A,'Tentativa 1 de 3'));
 ok('Errar não entrega a resposta certa',(await A.locator('.cert').count())===0);
 await A.screenshot({path:OUT+'/r-ainda-nao.png'});
 await A.click('[data-act=crtenta]');
 ok('Tentar de novo mostra tentativa 2 de 3',await tem(A,'Tentativa 2 de 3'));
 await dar(true);
 ok('Acertar na 2ª tentativa mostra Agora sim com a explicação',await tem(A,'Agora sim')&&await tem(A,'Tentativa 2 de 3'));
 await A.screenshot({path:OUT+'/r-agora-sim.png'});
 await espera(p,i=>1,null,200);
 const ref1=await refMaria(mock,chave,r=>r[q1.i]&&r[q1.i].t===2);
 ok('Tentativas são enviadas ao banco em part/pid/ref',ref1&&ref1[q1.i]&&ref1[q1.i].t===2&&ref1[q1.i].ok===1,JSON.stringify(ref1));
 ok('Instrutor vê que 1 pessoa já refez e 1 pergunta recuperada',await tem(p,'1 de 1 já','#refcard',6000+LENTO)&&await tem(p,'1 de '+errA+' perguntas recuperadas','#refcard',6000+LENTO));
 await p.screenshot({path:OUT+'/r-sala-refcard.png'});
 // próxima: errar três vezes
 await A.click('[data-act=crprox]');
 ok('Próxima pergunta recomeça na tentativa 1',await tem(A,'Tentativa 1 de 3'));
 const q2=await dar(false);await A.click('[data-act=crtenta]');await dar(false);await A.click('[data-act=crtenta]');
 ok('Terceira tentativa é a última',await tem(A,'Tentativa 3 de 3'));
 await dar(false);
 ok('Errar 3 vezes mostra a resposta certa e a explicação',await tem(A,'Não foi dessa vez')&&await tem(A,'A resposta certa')&&(await A.locator('.cert').count())===1);
 await A.screenshot({path:OUT+'/r-tres-erros.png'});
 const ref2=await refMaria(mock,chave,r=>r[q2.i]&&r[q2.i].t===3);
 ok('Banco guarda t=3 e ok=0 para a que não recuperou',ref2[q2.i]&&ref2[q2.i].t===3&&ref2[q2.i].ok===0,JSON.stringify(ref2));
 // recarregar: tentativas persistem e a 3x errada não volta
 await A.reload();await tem(A,'certas','body',8000);
 const st=await A.evaluate(()=>({ref:CE.ref,rev:Object.keys(CE.rev).length}));
 ok('Recarregar mantém as tentativas e as perguntas guardadas',st.rev===errA&&Object.keys(st.ref).length===2,JSON.stringify(st.ref));
 await A.click('[data-act=crefazer]');
 const prox=await A.evaluate(()=>CE.rf.i);
 ok('Refazer depois de recarregar pula as já resolvidas e as esgotadas',prox!==q1.i&&prox!==q2.i,String(prox));
 ok('A pergunta nova começa na tentativa 1',await tem(A,'Tentativa 1 de 3'));
 await A.click('[data-act=cvolta]');
 // aviso: contagem final no instrutor
 // ---------- encerra a sala e confere relatório
 await espera(p,()=>{const s=S.sessoes.find(x=>x.estado==='sala');return !!s&&!!s.refaz&&Object.values(s.refaz).some(o=>Object.values(o).some(x=>x&&x.t===3))},null,4000);
 await p.click('[data-act=fechar-sala]');await p.click('[data-act=encerrar-ok]');await p.waitForSelector('.tr:not(.h)');
 const sres=await p.evaluate(()=>{const s=S.sessoes.find(x=>x.estado==='encerrada');const r=resumoRefaz(s);return {refaz:s.refaz?Object.keys(s.refaz).length:0,r:r&&{pessoas:r.pessoas,fez:r.fez,rec:r.rec},id:s.id,cod:s.cod,integra:integra(s)}});
 ok('Sessão encerrada guarda o treino feito',sres.refaz===1&&sres.r&&sres.r.fez===2&&sres.r.rec===1,JSON.stringify(sres));
 ok('Treino no celular não muda o código de conferência',sres.integra);
 await p.evaluate(id=>{location.hash='#/relatorios/'+id;render()},sres.id);await p.waitForSelector('.rl-top');
 ok('Relatório mostra Treino feito no celular',/Treino feito no celular/.test(await p.innerText('.rel'))&&/Maria Silva/.test(await p.innerText('.rel')));
 await p.waitForTimeout(3700);await p.screenshot({path:OUT+'/r-rel-refaz.png'});
 for(let k=0;k<LENTO/250&&!(mock.tree()===null||!mock.tree().salas||!mock.tree().salas[chave]);k++)await new Promise(z=>setTimeout(z,250));
 ok('Banco foi limpo ao encerrar',mock.tree()===null||!mock.tree().salas||!mock.tree().salas[chave]);
 // celular depois do encerramento
 await tem(A,'A sala foi encerrada');
 ok('Depois do encerramento o celular ainda oferece Rever e Refazer',(await A.locator('[data-act=crever]').count())===1&&(await A.locator('[data-act=crefazer]').count())===1);
 await A.screenshot({path:OUT+'/r-encerrada-cel.png'});
 await A.click('[data-act=crever]');
 ok('Rever funciona sem a sala',(await A.locator('.rvq').count())===errA);
 await A.click('[data-act=cvolta]');await A.click('[data-act=crefazer]');
 const reqsAntes=mock.reqs?mock.reqs.length:0;
 const outro=await A.evaluate(()=>CE.rf.i);
 await A.click(`.ct2 >> nth=0`).catch(()=>{});
 ok('Refazer sem a sala não recria nada no banco',mock.tree()===null||!mock.tree().salas||!mock.tree().salas[chave]);
 // ---------- pré-teste com celular real
 await p.evaluate(()=>{S.sessoes=S.sessoes.filter(x=>x.estado==='encerrada');location.hash='#/treinos';render()});await p.waitForSelector('.tr:not(.h)');
 await p.evaluate(()=>{UI.aba='ativos';render()});
 await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.mom');
 await p.click('.mom [data-v=pre]');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const chave2=(await p.textContent('#cod')).replace(/\D/g,'');const link2=await p.getAttribute('[data-act=copiar]','data-v');
 ok('Sala do pré-teste mostra o momento',/Pré-teste/.test(await p.innerText('#tb')));
 const C=await celular('C');await C.goto(link2);await C.waitForSelector('#ce-n');await C.fill('#ce-n','Carlos Pre');await C.click('button[type=submit]');
 ok('C entra no pré-teste',await tem(C,'Você está na sala'));
 ok('Banco recebe o momento pré no meta',mock.tree().salas[chave2].pub.meta.mom==='pre');
 await p.click('[data-act=proxima]');
 let g2=0,vistas=0,vazou=false,gabarito=false;
 while(g2++<20){
   const et=await p.textContent('.etapa .chip');
   if(et.includes('Pódio'))break;
   if(!et.includes('Pergunta no ar')){await p.click('[data-act=proxima]');continue;}
   vistas++;
   const it=await item();
   await espera(C,()=>document.querySelectorAll('.ct2,.ot').length>=2,null);
   if(it.tipo==='ordenar'){for(const t of it.alts)await C.click(`.ot:has-text("${t}")`);await C.click('[data-act=cordok]');}
   else await C.click(`.ct2 >> nth=${it.c}`);
   await tem(C,'Resposta enviada');
   await espera(p,()=>/1 responderam/.test(document.querySelector('.sala').innerText),null,5000);
   await p.click('[data-act=proxima]');
   await C.waitForTimeout(250);
   const t=await C.innerText('body');
   if(/Você acertou|Não foi dessa vez|A resposta certa/.test(t))vazou=true;
   const tree=mock.tree().salas[chave2];
   if(tree&&tree.res)gabarito=true;
   if(tree&&tree.pub&&tree.pub.item&&(tree.pub.item.correta!==undefined&&tree.pub.item.correta!==null))gabarito=true;
 }
 ok('Pré-teste respondeu todas as perguntas',vistas>=5,String(vistas));
 ok('Pré-teste nunca mostra acerto, erro nem resposta certa no celular',!vazou);
 ok('Pré-teste nunca publica resultado nem gabarito no banco',!gabarito);
 ok('No fim do pré-teste o celular diz Pré-teste concluído',await tem(C,'Pré-teste concluído'));
 ok('Pré-teste não oferece rever nem refazer',(await C.locator('[data-act=crever]').count())===0&&(await C.locator('.rv').count())===0);
 await C.screenshot({path:OUT+'/r-pre-fim.png'});
 ok('Sala do pré-teste não mostra cartão de treino',(await p.locator('#refcard').count())===0);
 await p.screenshot({path:OUT+'/r-pre-sala.png'});
 await p.click('[data-act=fechar-sala]');await p.click('[data-act=encerrar-ok]');await p.waitForSelector('.tr:not(.h)');
 const pre=await p.evaluate(()=>{const s=S.sessoes[S.sessoes.length-1];return {mom:s.mom,estado:s.estado,pessoas:s.resultado.pessoas,pct:s.resultado.pct}});
 ok('Pré-teste encerrado guarda momento e resultado',pre.mom==='pre'&&pre.estado==='encerrada'&&pre.pessoas===1&&pre.pct===100,JSON.stringify(pre));
 ok('Sem erros de JS',errs.length===0,errs.join(' | ').slice(0,300));
 console.log(log.join('\n'));console.log('\n'+log.filter(l=>l.startsWith('OK')).length+' OK / '+log.filter(l=>l.startsWith('FALHA')).length+' FALHAS');
 mock.fecha();await b.close();srv.close();process.exit(0);
})();
