/* v1.4.0 · bonecos: código, desenho, celular (montar e trocar), sala, telão, pódio, regras. uso: SABIA_REGRAS=1 node teste-v14.js <dist> <prints> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const {criar}=require('./rtdb-mock.js');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
const espera=async(p,fn,arg,ms=8000)=>{try{await p.waitForFunction(fn,arg,{timeout:ms});return true}catch(e){return false}};
const tem=async(p,txt,sel='body',ms=8000)=>espera(p,([t,s])=>{const e=document.querySelector(s);return !!e&&e.innerText.includes(t)},[txt,sel],ms);
(async()=>{
 const mock=await criar();
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();const errs=[];
 const pg=async(ctx,nome)=>{const q=await ctx.newPage();q.on('pageerror',e=>errs.push(nome+' '+e.message));q.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(nome+' '+m.text())});return q};
 const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});const p=await pg(ctx,'instrutor');
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 // 1. código do boneco
 const u=await p.evaluate(()=>{const r={};
  r.ini=[...Array(40)].map(()=>bonLer(bonInicial()).a);
  r.ida=bonCodigo(bonLer('cachorro.3.xadrez.sardas+brinco-argola.mago.colar'));
  r.ruim=[bonLer('dragao.0....'),bonLer('cachorro.0.<script>....'),bonLer('x'),bonLer(42),bonLer('cachorro.1.2.3')].every(x=>x===null);
  r.casco=bonCodigo(bonLer('tatu.0.jaleco...'));r.jac=bonCodigo(bonLer('jacare.2..sardas.oculos.colar'));
  r.limite=bonLer('gato.0..'+['sardas','pintas','mancha-testa','brinco-argola','brinco-perola','tatuagem-raio'].join('+')+'..').det.length;
  r.cor=bonLer('gato.99....').cor;r.sort=[...Array(30)].map(()=>bonSorteio()).every(c=>bonValido(c)===c);return r});
 ok('Todos começam com gato ou cachorro (os dois aparecem)',u.ini.every(a=>a==='gato'||a==='cachorro')&&u.ini.includes('gato')&&u.ini.includes('cachorro'));
 ok('Código vai e volta sem perder nada',u.ida==='cachorro.3.xadrez.sardas+brinco-argola.mago.colar',u.ida);
 ok('Código inventado ou com caracteres estranhos é recusado',u.ruim);
 ok('Tatu não veste roupa (casco) e jacaré não usa óculos nem detalhes de rosto',u.casco==='tatu.0....'&&u.jac==='jacare.2....colar',u.casco+' '+u.jac);
 ok('No máximo 4 detalhes e cor fora da lista vira natural',u.limite===4&&u.cor===0);
 ok('Sortear sempre gera um código válido',u.sort);
 // 2. desenho
 const des=await p.evaluate(async()=>{const a=await bonDesenha('cachorro.0....');const c=await bonDesenha('cachorro.1....');const d=await bonDesenha('cachorro.1.capa.sardas.coroa.medalha');
  const px=async(u,x,y)=>{const i=new Image();i.src=u;await i.decode();const cv=document.createElement('canvas');cv.width=cv.height=320;const g=cv.getContext('2d');g.drawImage(i,0,0);return [...g.getImageData(x,y,1,1).data]};
  return {a:a.length>1000,c:c.length>1000,difere:a!==c,camadas:d!==c&&d.length>1000,cache:BON.url.size>=3,pa:await px(a,180,190),pc:await px(c,180,190)}});
 ok('Desenha o boneco a partir das imagens',des.a&&des.c);
 ok('Trocar a cor pinta a pelagem (o pixel do corpo fica bem mais escuro no preto)',des.difere&&(des.pc[0]+des.pc[1]+des.pc[2])<(des.pa[0]+des.pa[1]+des.pa[2])*0.6,JSON.stringify([des.pa,des.pc]));
 ok('Roupa, detalhe e cosméticos entram por cima',des.camadas);
 ok('Cada boneco desenhado fica guardado para não refazer',des.cache);
 // 3. sala com simulados e telão
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');
 await p.fill('#f-ins','José Elias');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 await espera(p,()=>document.querySelectorAll('.pgrid .pp').length>=6,null,10000);
 ok('Simulados entram com boneco sorteado',await espera(p,()=>document.querySelectorAll('.pgrid .pp .avb img[src]').length>=6,null,8000));
 const id=await p.evaluate(()=>AO.id);
 const t=await pg(ctx,'telao');await t.setViewportSize({width:1280,height:720});await t.goto(U+'#/telao/'+id);await t.waitForSelector('.telfull .tel');
 ok('Telão mostra os bonecos de quem entrou',await espera(t,()=>document.querySelectorAll('.tel .cw .avb img[src]').length>=6,null,8000));
 await t.screenshot({path:OUT+'/telao-espera.png'});await p.screenshot({path:OUT+'/sala.png'});
 // vai até o pódio respondendo tudo pelos simulados
 for(let i=0;i<40;i++){const et=await p.evaluate(()=>{const s=sala(AO.id);return s.fase.etapa});if(et==='podio')break;await p.evaluate(()=>{const s=sala(AO.id);s.fase.t0-=999999;});const dis=await p.locator('.go').isDisabled().catch(()=>true);if(!dis)await p.click('.go');await p.waitForTimeout(250);}
 ok('Pódio do telão mostra os bonecos grandes',await espera(t,()=>{const l=[...document.querySelectorAll('.tel .pl .avb img[src]')];return l.length>=3&&l[0].getBoundingClientRect().width>=120},null,10000));
 await t.screenshot({path:OUT+'/telao-podio.png'});
 ok('Ranking do controle mostra bonecos',await espera(p,()=>document.querySelectorAll('.rk .rr .avb').length>=3,null,4000));
 await t.close();await p.evaluate(()=>{const d=document.querySelector('#dlg');if(d&&d.open)d.close();const s=sala(AO.id);if(s){Rede.fechar&&Rede.fechar(s);s.estado='encerrada';AO.id=null;salvar();}});
 // 4. celular com Firebase de mentira (regras ligadas)
 await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock.url);await p.click('[data-act=fbtestar]');await tem(p,'Conectado','#fbSt');
 ok('Regras de exemplo trazem o campo do boneco',(await p.textContent('#c-fb >> xpath=ancestor::section')).includes('"b"'));
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const chave=(await p.textContent('#cod')).replace(/\D/g,'');const link=await p.getAttribute('[data-act=copiar]','data-v');
 const cc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const A=await pg(cc,'celular');
 await A.goto(link);await A.waitForSelector('#ce-n');
 ok('Tela de nome mostra o bicho inicial (gato ou cachorro)',await espera(A,()=>{const i=document.querySelector('.bon-m img[src]');const t=document.querySelector('.bon-esc').innerText;return !!i&&/Gato|Cachorro/.test(t)},null,6000));
 const ini=await A.evaluate(()=>localStorage.getItem('sabia-bon'));
 ok('O bicho inicial fica guardado no aparelho',/^(gato|cachorro)\.0\.\.\.\.$/.test(ini||''),ini);
 await A.fill('#ce-n','Maria Silva');await A.click('[data-act=cbon]');await A.waitForSelector('.bon-ed');
 ok('O nome digitado não se perde ao abrir o montador',await A.evaluate(()=>CE.nome==='Maria Silva'));
 ok('Montador tem as 6 abas',(await A.locator('.bon-aba').count())===6);
 await A.click('.bon-i[data-v=onca]');await A.click('.bon-aba[data-v=cor]');await A.click('.bon-i[data-v="4"]');
 await A.click('.bon-aba[data-v=roupa]');await A.click('.bon-i[data-v=xadrez]');
 await A.click('.bon-aba[data-v=det]');await A.click('.bon-i[data-v=sardas]');await A.click('.bon-i[data-v=brinco-argola]');
 await A.click('.bon-aba[data-v=cab]');await A.waitForSelector('.bon-i[data-v=mago]');
 ok('Miniaturas da aba Cabeça mostram o bicho com cada chapéu',await espera(A,()=>document.querySelectorAll('.bon-cab .bon-mini img[src]').length>=20,null,10000));
 await A.screenshot({path:OUT+'/cel-montar.png'});
 ok('Montador cabe na tela de 390 px sem rolar para o lado',await A.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 ok('Botões do montador com 40 px ou mais',await A.evaluate(()=>[...document.querySelectorAll('.bon-ed .b, .bon-aba, .bon-i')].filter(e=>e.offsetParent).every(e=>e.getBoundingClientRect().height>=40)));
 await A.click('.bon-i[data-v=mago]');await A.click('.bon-aba[data-v=pes]');await A.click('.bon-i[data-v=colar]');
 const ed=await A.evaluate(()=>CE.bonEd);ok('As escolhas montam o código certo',ed==='onca.4.xadrez.sardas+brinco-argola.mago.colar',ed);
 await A.click('.bon-aba[data-v=det]');await A.click('.bon-i[data-v=sardas]');ok('Tocar de novo tira o detalhe',await A.evaluate(()=>CE.bonEd==='onca.4.xadrez.brinco-argola.mago.colar'));
 await A.click('[data-act=cbonok]');await A.waitForSelector('#ce-n');
 ok('Ao voltar, o nome continua lá',(await A.inputValue('#ce-n'))==='Maria Silva');
 await A.click('button[type=submit]');ok('Entra na sala',await tem(A,'Você está na sala'));
 await A.screenshot({path:OUT+'/cel-espera.png'});
 const parte=()=>{const s=(mock.tree().salas||{})[chave];return s&&s.part?Object.values(s.part):[]};
 ok('O boneco vai para o Firebase como código curto (as regras aceitam)',parte().some(v=>v.b==='onca.4.xadrez.brinco-argola.mago.colar'),JSON.stringify(parte()).slice(0,200));
 ok('Instrutor vê o boneco da Maria',await espera(p,()=>{const s=sala(AO.id);const m=s.part.find(x=>x.nome==='Maria Silva');return m&&m.b==='onca.4.xadrez.brinco-argola.mago.colar'&&document.querySelector('.pgrid .pp .avb img[src]')},null,8000));
 // trocar depois de entrar
 await A.click('[data-act=cbon]');await A.waitForSelector('.bon-ed');await A.click('.bon-i[data-v=sabia]');await A.click('[data-act=cbonok]');
 ok('Trocar o bicho depois de entrar atualiza o instrutor',await espera(p,()=>{const s=sala(AO.id);const m=s.part.find(x=>x.nome==='Maria Silva');return m&&m.b&&m.b.startsWith('sabia.')},null,8000));
 ok('Ao trocar de bicho a roupa continua (ave também veste)',await p.evaluate(()=>{const m=sala(AO.id).part.find(x=>x.nome==='Maria Silva');return bonLer(m.b).roupa==='xadrez'}));
 // regras: código inválido é recusado pelo banco
 const pid=await A.evaluate(()=>CE.pid);
 const rec=await A.evaluate(async([base,ch,pid])=>{try{await Rede.req(base,'PATCH','/salas/'+ch+'/part/'+pid,{b:'<b>oi</b>'});return 'aceitou'}catch(e){return 'recusou'}},[await A.evaluate(()=>CE.base),chave,pid]);
 ok('Regras do banco recusam código com caracteres estranhos',rec==='recusou',rec);
 // recarregar mantém
 await A.reload();await A.waitForSelector('.eu2, .cb');ok('Recarregar o celular mantém o bicho escolhido',await A.evaluate(()=>(localStorage.getItem('sabia-bon')||'').startsWith('sabia.')));
 await A.click('[data-act=cprox]');await A.waitForSelector('#ce-n');
 ok('"Outra pessoa vai usar este celular" volta para gato ou cachorro sorteado',await A.evaluate(()=>/^(gato|cachorro)\.0\.\.\.\.$/.test(localStorage.getItem('sabia-bon')||'')));
 // participante sem boneco (versão antiga) cai no círculo de cor
 const sem=await p.evaluate(()=>{const s=sala(AO.id);s.part.push({id:uid(),nome:'Pessoa Antiga',setor:'',cor:2,real:true});salvar();return avB('Pessoa Antiga',2,undefined).includes('class="av"')});
 ok('Quem entra por um celular antigo, sem boneco, aparece com a cor de antes',sem);
 // regras antigas do Firebase: o celular entra mesmo assim, sem o boneco
 const antigas=JSON.parse(fs.readFileSync(path.join(__dirname,fs.existsSync(path.join(__dirname,'docs'))?'docs':'../docs','firebase-rules-v1.3.1-anterior.json'),'utf8'));
 const mock2=await criar({regras:antigas});
 await p.evaluate(()=>{const s=sala(AO.id);if(s){Rede.fechar&&Rede.fechar(s);s.estado='encerrada';AO.id=null;salvar();}location.hash='#/ajustes'});await p.waitForSelector('#c-fb');await p.fill('#c-fb',mock2.url);await p.click('[data-act=fbtestar]');await tem(p,'Conectado','#fbSt');
 await p.evaluate(()=>{location.hash='#/treinos'});await p.waitForSelector('.tr:not(.h)');await p.click('.tr:not(.h) .b.p >> nth=0');await p.waitForSelector('.apl');await p.click('[data-act=abrirsala]');await p.waitForSelector('.sala');
 const chave2=(await p.textContent('#cod')).replace(/\D/g,'');const link2=await p.getAttribute('[data-act=copiar]','data-v');
 const cc2=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const B=await pg(cc2,'celular-antigas');
 await B.goto(link2);await B.waitForSelector('#ce-n');await B.fill('#ce-n','José Antigo');await B.click('button[type=submit]');
 ok('Com as regras antigas o celular entra mesmo assim (sem o boneco)',await tem(B,'Você está na sala')&&(()=>{const s=(mock2.tree().salas||{})[chave2];const v=s&&s.part?Object.values(s.part):[];return v.length===1&&v[0].b===undefined})());
 mock2.fecha();
 ok('Sem erros de JS',errs.length===0,errs.slice(0,3).join(' | '));
 console.log(log.join('\n'));console.log('\n'+log.filter(l=>l.startsWith('OK')).length+' OK / '+log.filter(l=>l.startsWith('FALHA')).length+' FALHAS');
 mock.fecha();await b.close();srv.close();process.exit(0);
})().catch(e=>{console.log(log.join('\n'));console.error('ERRO',e);process.exit(1)});
