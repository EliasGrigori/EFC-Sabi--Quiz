const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
const espera=async(p,fn,arg,ms=8000)=>{try{await p.waitForFunction(fn,arg,{timeout:ms});return true}catch(e){return false}};
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
 await p.evaluate(u=>{S.cfg.fbUrl=u;novaPessoa('Maria Silva','Packing');novaPessoa('José Wellington Souza','Campo');S.pessoas.find(x=>x.nome.startsWith('José')).apelidos=['José Wellington'];pesMudou&&pesMudou();salvar()},mock.url);
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');
 await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');
 ok('Aplicar oferece a lista do cadastro',(await p.locator('.reap').first().innerText()).includes('2 pessoas entram pela lista'));
 await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const chave=(await p.textContent('#cod')).replace(/\D/g,'');
 const link=await p.getAttribute('[data-act=copiar]','data-v');
 ok('A sala leva a lista do cadastro',await p.evaluate(()=>{const s=S.sessoes.find(x=>x.estado==='sala');return s.roster&&s.roster.length===2}));
 const pubRs=await espera(p,async()=>true,null);
 const pub=await (await fetch(mock.url+'/salas/'+chave+'/pub.json')).json();
 ok('A publicação da sala leva o setor de cada nome (rs)',pub&&pub.meta&&JSON.stringify(pub.meta.rs)==='["Packing","Campo"]'||pub&&pub.meta&&JSON.stringify(pub.meta.rs.slice().sort())==='["Campo","Packing"]',JSON.stringify(pub&&pub.meta&&pub.meta.rs));
 const A=await celular('A');await A.goto(link);await A.waitForSelector('#ce-n');
 await A.screenshot({path:OUT+'/s-cel-entrar.png'});
 await A.fill('#ce-n','Maria Silva');await A.click('button[type=submit]');
 ok('A entra pela lista',await tem(A,'Você está na sala'));
 await espera(p,()=>document.querySelectorAll('.pgrid .pp').length===1,null);
 const setorA=await p.evaluate(()=>{const s=S.sessoes.find(x=>x.estado==='sala');return s.part[0].setor});
 ok('O setor da Maria vem do cadastro sem ela escolher',setorA==='Packing',setorA);
 // ir ao pódio
 let g=0;await p.click('[data-act=proxima]');
 while(g++<30){await p.click('[data-act=proxima]');const et=await p.textContent('.etapa .chip');if(et.includes('Pódio'))break;}
 ok('Chegou ao pódio',(await p.textContent('.etapa .chip')).includes('Pódio'));
 ok('Celular mostra o bloco de comentário',await tem(A,'Deixe um comentário'));
 ok('Celular mostra 4 tipos de comentário',(await A.locator('[data-act=ccmtipo]').count())===4);
 ok('Sugestão vem marcada por padrão',(await A.locator('[data-act=ccmtipo][aria-pressed=true]').innerText())==='Sugestão');
 await A.click('[data-act=ccmenv]');
 ok('Enviar vazio pede ao menos 3 letras',await tem(A,'pelo menos 3 letras'));
 await A.click('[data-act=ccmtipo][data-k=reclamacao]');
 await A.fill('#cm-t','O telão estava difícil de ler');
 ok('Texto digitado fica guardado ao trocar o tipo',await A.evaluate(()=>CE.cm.texto==='O telão estava difícil de ler'));
 await A.screenshot({path:OUT+'/s-cel-comentario.png',fullPage:true});
 await A.click('[data-act=ccmenv]');
 ok('Comentário enviado aparece na lista do celular',await tem(A,'O telão estava difícil de ler','.cmt'));
 const veio=await espera(p,()=>S.mensagens.length===1,null,8000);
 ok('Instrutor recebe a mensagem com a sala aberta',veio);
 const m1=await p.evaluate(()=>S.mensagens[0]);
 ok('A mensagem tem tipo, nome e setor',m1&&m1.tipo==='reclamacao'&&m1.pessoa==='Maria Silva'&&m1.setor==='Packing',JSON.stringify(m1&&{t:m1.tipo,n:m1.pessoa,s:m1.setor}));
 ok('Instrutor vê aviso/contador de mensagem nova',await espera(p,()=>!!document.querySelector('.ri[href="#/mensagens"] .pdn-n'),null,4000));
 // a mensagem também fica na sala do instrutor
 ok('Sala mostra o cartão de mensagens no pódio',await tem(p,'1 mensagem','#app',4000)||await tem(p,'Mensagens','.sala',4000));
 await p.screenshot({path:OUT+'/s-sala-msg.png'});
 // mais 2 e limite
 for(const tx of ['Mais exemplos do dia a dia','Posso refazer amanhã?']){await A.fill('#cm-t',tx);await A.click('[data-act=ccmenv]');await tem(A,tx,'.cmt');}
 ok('Depois de 3 comentários o formulário some',await tem(A,'já enviou 3 comentários')&&(await A.locator('#cm-t').count())===0);
 ok('O instrutor recebeu os 3',await espera(p,()=>S.mensagens.length===3,null,8000));
 const noMock=await (await fetch(mock.url+'/salas/'+chave+'/part.json')).json();
 const pidA=Object.keys(noMock)[0];
 ok('No Firebase ficam 3 comentários dentro do participante',Object.keys(noMock[pidA].com||{}).length===3);
 ok('O participante continua com o nome (regra n)',noMock[pidA].n==='Maria Silva');
 // recarregar o celular: os comentários enviados voltam
 await A.reload();await tem(A,'Deixe um comentário',undefined,6000).catch(()=>{});
 ok('Recarregar o celular mantém os 3 enviados',await tem(A,'já enviou 3 comentários','body',8000));
 // responder pelo instrutor
 await p.evaluate(()=>{location.hash='#/mensagens'});await p.waitForSelector('.msg-i');
 const alvo=p.locator('.msg-i:has-text("O telão")');
 await alvo.locator('[data-act=msgresp]').click();await p.fill('#msg-r','Obrigado, vou trocar o telão.');await p.click('[data-act=msgenviar]');
 ok('A resposta chega ao celular da Maria',await tem(A,'Resposta do instrutor','.cmt',8000)&&await tem(A,'vou trocar o telão','.cmt',2000));
 await A.screenshot({path:OUT+'/s-cel-resposta.png',fullPage:true});
 const rspMock=await (await fetch(mock.url+'/salas/'+chave+'/part/'+pidA+'/rsp.json')).json();
 ok('Resposta gravada em part/{pid}/rsp',rspMock&&Object.values(rspMock)[0].x==='Obrigado, vou trocar o telão.');
 await p.screenshot({path:OUT+'/s-msg-resp.png'});
 // proxima pessoa
 await A.click('[data-act=cprox]');
 ok('Outra pessoa: volta para a tela de entrada',await tem(A,'Entrar','body',4000)&&(await A.locator('#ce-n').count())===1);
 ok('Outra pessoa: nada da anterior fica no aparelho',await A.evaluate(()=>CE.cm.env.length===0&&!CE.pid&&!Object.keys(localStorage).some(k=>/sabia-(p|cm|rv)-/.test(k)&&localStorage.getItem(k))));
 await A.fill('#ce-n','Jos');await A.waitForSelector('#ce-sug button');await A.click('#ce-sug button');await A.click('button[type=submit]');
 ok('A segunda pessoa entra no mesmo aparelho',await tem(A,'Você está na sala')||await tem(A,'Fim da sessão'));
 await espera(p,()=>document.querySelectorAll('.pgrid .pp').length===2||S.sessoes.find(x=>x.estado==='sala').part.length===2,null,6000);
 const partes=await p.evaluate(()=>S.sessoes.find(x=>x.estado==='sala').part.map(x=>[x.nome,x.setor]));
 ok('José entra com o setor do cadastro (nome antigo vale)',partes.length===2&&partes.some(x=>x[1]==='Campo'),JSON.stringify(partes));
 ok('O bloco de comentário da segunda pessoa começa vazio',await tem(A,'Deixe um comentário','body',6000)&&(await A.locator('.cmt-e').count())===0);
 await A.screenshot({path:OUT+'/s-cel-outra.png'});
 // foco: não repinta enquanto digita
 await A.click('#cm-t');await A.type('#cm-t','abc');
 await p.evaluate(()=>{const s=S.sessoes.find(x=>x.estado==='sala');s.part.forEach(x=>{});salvar();});
 await mock.set&&0;
 await A.waitForTimeout(1200);
 ok('Digitar no comentário não perde o foco nem o texto',await A.evaluate(()=>document.activeElement.id==='cm-t'&&document.querySelector('#cm-t').value==='abc'));
 ok('Sem erros de JS',errs.length===0,errs.join(' | ').slice(0,300));
 const f=log.filter(x=>x.startsWith('FALHA'));console.log(log.join('\n'));console.log(f.length?`\n${f.length} FALHAS de ${log.length}`:`\n${log.length} OK / 0 FALHAS`);
 await b.close();srv.close();mock.fechar&&mock.fechar();process.exit(0);
})();
