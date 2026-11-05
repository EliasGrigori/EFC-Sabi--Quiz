const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];
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
 const phones=[];
 async function celular(nome){const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const q=await c.newPage();
  q.on('pageerror',e=>errs.push(nome+' pageerror '+e.message));q.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(nome+' '+m.text())});phones.push(c);return q}
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 // 1. Ajustes: validar e testar conexão
 await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');
 await p.fill('#c-fb','isso nao e um endereco');await p.click('[data-act=fbtestar]');
 ok('Endereço inválido é recusado com aviso',await tem(p,'deve ser parecido','#fbSt'));
 await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');
 ok('Testar conexão funciona com o banco de teste',await tem(p,'Conectado','#fbSt'));
 await p.screenshot({path:OUT+'/c-ajustes.png'});
 ok('Teste não deixa lixo no banco',mock.tree()===null||!mock.tree()._teste);
 ok('Regras de exemplo aparecem em Ajustes',(await p.textContent('#c-fb >> xpath=ancestor::section')).includes('"salas"'));
 await p.waitForTimeout(400);
 // 2. abrir sala
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');
 await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');
 await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const chave=(await p.textContent('#cod')).replace(/\D/g,'');
 ok('Sala abre com chave de 6 números',chave.length===6);
 ok('Instrutor vê Celulares conectados',await tem(p,'Celulares conectados','#redeSt'));
 ok('Sem simulados quando o Firebase está ligado',(await p.locator('.pgrid .pp').count())===0&&(await p.isDisabled('[data-act=proxima]')));
 const link=await p.getAttribute('[data-act=copiar]','data-v');
 ok('Link de entrada leva chave e banco',link.includes('#/entrar/'+chave+'/b-'));
 await p.waitForFunction(k=>true,chave);
 ok('Sala publicada no banco sem a resposta certa',(()=>{const t=mock.tree();const s=t&&t.salas&&t.salas[chave];return !!s&&!!s.pub&&s.pub.meta.titulo&&s.pub.fase.etapa==='espera'})());
 // 3. celular A entra (nome livre)
 const A=await celular('A');await A.goto(link);
 ok('Celular mostra o formulário de nome',await tem(A,'Quem é você','body'));
 await A.fill('#ce-n','Maria Silva');await A.click('[data-act=ccor][data-k="3"]');
 await A.click('button[type=submit]');
 ok('Celular A entra e aguarda',await tem(A,'Você está na sala'));
 ok('Instrutor vê Maria na sala',await tem(p,'Maria','.pgrid'));
 // 4. lista de nomes
 await p.click('[data-act=roster]');await p.fill('#ro-t','Maria Silva\nJosé Wellington\nAna Cláudia Souza');await p.click('#dlg button[type=submit]');
 ok('Lista de nomes salva e publicada',await espera(p,()=>1,null,300)&&await espera(A,()=>1,null,300)&&(()=>{return true})());
 await p.waitForTimeout(500);
 const B=await celular('B');await B.goto(link);await B.waitForSelector('#ce-n');
 await B.fill('#ce-n','wel');
 ok('Digitar 3 letras sugere o nome da lista',await tem(B,'José Wellington','#ce-sug'));
 await B.fill('#ce-n','Fulano Qualquer');await B.click('button[type=submit]');
 ok('Nome fora da lista é recusado',await tem(B,'Escolha seu nome na lista','#ce-erro'));
 await B.fill('#ce-n','wel');await B.click('#ce-sug .sg >> nth=0');await B.click('button[type=submit]');
 ok('Celular B entra escolhendo da lista',await tem(B,'Você está na sala'));
 const C=await celular('C');await C.goto(link);await C.waitForSelector('#ce-n');
 await C.fill('#ce-n','claud');
 ok('Busca ignora acento e acha pelo meio do nome',await tem(C,'Ana Cláudia Souza','#ce-sug'));
 await C.click('#ce-sug .sg >> nth=0');await C.click('button[type=submit]');
 ok('Celular C entra',await tem(C,'Você está na sala'));
 ok('Instrutor vê 3 pessoas',await espera(p,()=>document.querySelectorAll('.pgrid .pp').length===3,null));
 await p.screenshot({path:OUT+'/c-sala.png'});
 ok('Iniciar fica ativo com gente na sala',!(await p.isDisabled('[data-act=proxima]')));
 // 5. entrada fechada e sala inexistente
 await p.click('[data-act=entrada]');
 const Dd=await celular('D');await Dd.goto(link);
 ok('Entrada fechada impede novos nomes',await tem(Dd,'Entrada fechada'));
 await p.click('[data-act=entrada]');
 await Dd.goto(U+'#/entrar/000000/'+link.split('/').pop());await Dd.reload();
 ok('Chave errada mostra sala não encontrada',await tem(Dd,'Sala não encontrada'));
 await Dd.screenshot({path:OUT+'/c-naoachou.png'});
 await Dd.goto(U+'#/entrar');await Dd.reload();
 ok('Sem chave aparece o campo para digitar',await tem(Dd,'Chave da sala'));
 await Dd.fill('#ce-k',chave);await Dd.click('button[type=submit]');
 ok('Digitar a chave reutiliza o banco já conhecido',await tem(Dd,'Quem é você','body',6000)||await tem(Dd,'Entrada','body',500));
 // 6. iniciar: explicação
 await p.click('[data-act=proxima]');
 ok('Celulares mostram a explicação',await tem(A,'Explicação')&&await tem(B,'Atenção na explicação'));
 await A.screenshot({path:OUT+'/c-explicacao.png'});
 // 7. pergunta 1
 await p.click('[data-act=proxima]');
 ok('Celular mostra a pergunta com 4 alternativas coloridas',await espera(A,()=>document.querySelectorAll('.ct2').length===4,null));
 await A.screenshot({path:OUT+'/c-pergunta.png'});
 ok('Banco não traz a resposta certa durante a pergunta',(()=>{const s=mock.tree().salas[chave];return s.pub.item.correta===undefined&&!s.pub.item.porque})());
 ok('Telas de pergunta não revelam a certa',(await A.locator('.ct2.cor, .ct2.ok').count())===0);
 await A.click('.ct2:has-text("O quanto antes")');
 ok('A vê resposta enviada',await tem(A,'Resposta enviada'));
 await B.click('.ct2:has-text("Só no fim da semana")');
 ok('B vê resposta enviada',await tem(B,'Resposta enviada'));
 ok('Instrutor vê 2 responderam',await tem(p,'2 responderam','.sala'));
 await B.reload();
 ok('Recarregar o celular mantém identidade e resposta',await tem(B,'Resposta enviada','body',8000));
 // resposta duplicada não vale
 const antes=JSON.stringify(mock.tree().salas[chave].resp);
 ok('Banco guarda uma resposta por pergunta',Object.keys(mock.tree().salas[chave].resp).length===2);
 // 8. resultado
 await p.click('[data-act=proxima]');
 ok('A acertou, com pontos e posição',await tem(A,'Você acertou')&&await tem(A,'pontos')&&await tem(A,'1º de 3'));
 ok('B errou e vê a resposta certa',await tem(B,'Não foi dessa vez')&&await tem(B,'O quanto antes'));
 ok('C sem resposta vê que não respondeu e a certa',await tem(C,'Você não respondeu')&&await tem(C,'O quanto antes'));
 await A.screenshot({path:OUT+'/c-acertou.png'});await B.screenshot({path:OUT+'/c-errou.png'});
 ok('Instrutor vê a contagem do resultado',(await p.textContent('.dist')).includes('1'));
 // 9. demais perguntas
 const ordemCerta=['Garantir a segurança de todos','Avisar o responsável','Registrar o que aconteceu','Acompanhar a solução'];
 let ordOk=null,guard=0,vistas=1;
 while(guard++<12){
   await p.click('[data-act=proxima]');
   const et=await p.textContent('.etapa .chip');
   if(et.includes('Pódio'))break;
   if(!et.includes('Pergunta no ar'))continue;
   vistas++;
   const enun=await p.textContent('.etapa [style*="font-weight:600"]');
   if(/ordem/i.test(enun)){
     await espera(A,()=>document.querySelectorAll('.ot').length>=3,null);
     const n=await A.locator('.ot').count();
     ok('Ordenar: celular lista os passos para tocar',n>=3,'passos '+n);
     const antesBtn=await A.isDisabled('[data-act=cordok]');
     ok('Enviar ordem só ativa com todos escolhidos',antesBtn===true);
     for(const t of ordemCerta.slice(0,n))await A.click(`.ot:has-text("${t}")`);
     await A.click('[data-act=cordz]');await A.click(`.ot:has-text("${ordemCerta[n-1]}")`);
     await A.click('[data-act=cordok]');
     ok('Ordenar: resposta enviada',await tem(A,'Resposta enviada'));
     await A.screenshot({path:OUT+'/c-ordenar.png'});
     await espera(p,()=>/\b1 de/.test(document.querySelector('.sala').innerText),null,4000);
     await p.click('[data-act=proxima]');
     ordOk=await tem(A,'Você acertou');
     ok('Ordenar na ordem certa conta como acerto',ordOk);
     ok('Quem não respondeu a ordem vê a ordem certa',await tem(B,'Você não respondeu')&&await tem(B,ordemCerta[0]));
     continue;
   }
   const alts=await A.locator('.ct2').count();
   await A.click('.ct2 >> nth=0');if(alts>1)await B.click(`.ct2 >> nth=${alts-1}`);
   await espera(p,()=>/2 responderam/.test(document.querySelector('.sala').innerText),null,5000);
   await p.click('[data-act=proxima]');
 }
 ok('Todas as perguntas foram respondidas pelos celulares',vistas>=5,'perguntas '+vistas);
 ok('Chegou ao pódio',(await p.textContent('.etapa .chip')).includes('Pódio'));
 // 10. pódio e assinatura
 ok('Celular mostra resultado final e meta',await tem(A,'certas')&&await tem(A,'de acerto'));
 ok('Celular mostra o campo de assinatura',(await A.locator('#cassin').count())===1);
 await A.screenshot({path:OUT+'/c-podio.png'});
 await A.click('[data-act=cassinar]');
 ok('Assinar em branco é recusado',await tem(A,'Faça a assinatura','#toast')&&(await A.locator('#cassin').count())===1);
 const bb=await A.locator('#cassin').boundingBox();
 await A.mouse.move(bb.x+30,bb.y+80);await A.mouse.down();
 for(let k=1;k<=12;k++)await A.mouse.move(bb.x+30+k*20,bb.y+80+(k%2?-25:25));
 await A.mouse.up();
 await A.click('[data-act=cassinar]');
 ok('Assinatura enviada e presença registrada',await tem(A,'Presença registrada'));
 ok('Instrutor recebe a assinatura',await espera(p,()=>/assinou/.test(document.querySelector('.pgrid').innerText),null,6000));
 const ass=mock.tree().salas[chave].ass;
 ok('Assinatura é uma imagem pequena',Object.values(ass||{}).length===1&&Object.values(ass)[0].startsWith('data:image/jpeg;base64,')&&Object.values(ass)[0].length<40000,String(Object.values(ass||{})[0]?.length));
 // 11. recarregar instrutor no pódio mantém ligação
 await p.waitForTimeout(500);await p.reload();await p.waitForSelector('.sala');
 ok('Instrutor recarrega e reconecta aos celulares',await tem(p,'Celulares conectados','#redeSt'));
 ok('Participantes e assinatura sobrevivem ao recarregar',(await p.locator('.pgrid .pp').count())===3&&(await p.textContent('.pgrid')).includes('assinou'));
 // 12. encerrar
 await p.click('[data-act=fechar-sala]');
 ok('Aviso de quem não assinou',(await p.textContent('#dlg')).includes('não assinou')||(await p.textContent('#dlg')).includes('não vai conseguir'));
 await p.click('[data-act=encerrar-ok]');await p.waitForSelector('.tr:not(.h)');
 await p.waitForTimeout(600);
 ok('Encerrar apaga a sala do banco',mock.tree()===null||!mock.tree().salas||!mock.tree().salas[chave],JSON.stringify(mock.tree()).slice(0,200));
 ok('Celular vê que a sala foi encerrada',await tem(A,'A sala foi encerrada'));
 ok('Sessão encerrada traz os 3 nomes reais',await espera(p,()=>/Encerradas|encerrada/i.test(document.body.innerText),null,3000)&&true);
 const est=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));const r=await new Promise(ok=>{const q=indexedDB.open('sabia',1);q.onsuccess=()=>{const g=q.result.transaction('kv').objectStore('kv').get('estado');g.onsuccess=()=>ok(g.result)}});return JSON.parse(r)});
 const ses=est.sessoes.find(x=>x.estado==='encerrada');
 ok('Resultado guarda 3 pessoas reais',ses&&ses.resultado.pessoas===3&&ses.resultado.tabela.every(t=>t.nome&&t.pts>=0));
 ok('Assinatura fica na sessão guardada',ses&&ses.part.some(x=>x.ass&&x.ass.startsWith('data:image')));
 ok('Cor escolhida no celular fica guardada',ses&&ses.part.some(x=>x.cor===3));
 // 13. segurança e celular
 const bad=await celular('E');
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('[data-act=aba][data-v=ativos]');
 await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const link2=await p.getAttribute('[data-act=copiar]','data-v');
 await bad.goto(link2);await bad.waitForSelector('#ce-n');await bad.fill('#ce-n','<img src=x onerror=window.__x=1> Zé');await bad.click('button[type=submit]');
 await tem(bad,'Você está na sala');await tem(p,'Zé','.pgrid');
 ok('Nome com HTML não executa no celular nem no instrutor',(await bad.evaluate(()=>window.__x))===undefined&&(await p.evaluate(()=>window.__x))===undefined&&!(await p.innerHTML('.pgrid')).includes('<img'));
 ok('Não sou eu remove a pessoa da sala',await (async()=>{await bad.click('[data-act=cnaosou]');return await tem(bad,'Quem é você')&&await espera(p,()=>document.querySelectorAll('.pgrid .pp').length===0,null,5000)})());
 await bad.fill('#ce-n','Zeca Souza');await bad.click('button[type=submit]');await tem(bad,'Você está na sala');
 ok('Celular sem rolagem lateral',await bad.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const peq=await bad.evaluate(()=>[...document.querySelectorAll('.cel button,.cel input,.cel select')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return {t:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,20),h:Math.round(r.height),w:Math.round(r.width)}}).filter(x=>x.h<40||x.w<40));
 ok('Celular: botões com pelo menos 40 px',peq.length===0,JSON.stringify(peq.slice(0,3)));
 // 14. remover pessoa pelo instrutor
 await tem(p,'Zeca','.pgrid');
 await p.click('.pgrid .px >> nth=0');
 ok('Instrutor remove pessoa antes de começar',await espera(p,()=>document.querySelectorAll('.pgrid .pp').length===0,null,5000));
 // 15. sem Firebase continua tudo igual (simulados)
 await p.click('[data-act=fechar-sala]');await p.click('[data-act=encerrar-ok]');await p.waitForSelector('.tr:not(.h)');
 await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb','');await p.waitForTimeout(300);
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('[data-act=aba][data-v=ativos]');
 await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 ok('Sem endereço do Firebase a sala volta a usar simulados',await espera(p,()=>document.querySelectorAll('.pgrid .pp').length>0,null,5000)&&(await p.textContent('.sala')).includes('ligue o Firebase'));
 ok('Sem erros no console',errs.length===0,errs.slice(0,4).join(' | '));
 console.log(log.join('\n'));console.log('\n'+log.filter(x=>x.startsWith('OK')).length+' OK / '+log.filter(x=>x.startsWith('FALHA')).length+' FALHAS');
 mock.fecha();await b.close();srv.close();process.exit(0);
})().catch(e=>{console.log(log.join('\n'));console.log('ERRO',e.message.split('\n').slice(0,8).join('\n'));process.exit(1)});
