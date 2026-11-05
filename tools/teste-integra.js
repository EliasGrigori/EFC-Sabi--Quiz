const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
// SDK falso do Firebase (nada de rede real; nenhuma chave verdadeira)
const FAKE=`window.firebase={__falso:true,apps:[],initializeApp(c){this.apps.push({name:'[DEFAULT]'});window.__fbcfg=c;},
 appCheck:Object.assign(function(){return {activate(){window.__appcheck=true}}},{ReCaptchaEnterpriseProvider:function(k){window.__acKey=k}}),
 auth(){const A=window.__A||(window.__A={ls:[],cur(){const u=localStorage.getItem('fake-uid');return u?{uid:u,isAnonymous:false}:null},
  get currentUser(){return this.cur()},
  onAuthStateChanged(cb){this.ls.push(cb);setTimeout(()=>cb(this.cur()),0);return ()=>{this.ls=this.ls.filter(x=>x!==cb)}},
  async signInWithEmailAndPassword(e,s){if(!navigator.onLine)throw {code:'auth/network-request-failed'};const c={'maria@x.com':['u1','123456'],'lider@x.com':['u2','123456'],'joao@x.com':['u3','123456'],'bloq@x.com':['u4','123456'],'semperfil@x.com':['u5','123456']}[e];if(!c||c[1]!==s)throw {code:'auth/invalid-credential'};localStorage.setItem('fake-uid',c[0]);this.ls.slice().forEach(cb=>cb(this.cur()))},
  async signOut(){localStorage.removeItem('fake-uid');this.ls.slice().forEach(cb=>cb(null))}});return A},
 firestore(){const U={u1:{nome:'Maria Responsável',perfil:'principal',estrela:false},u2:{nome:'Lúcia Líder',perfil:'colaborador',estrela:true},u3:{nome:'João Colaborador',perfil:'colaborador'},u4:{nome:'Bloqueada',perfil:'principal',bloqueado:true}};const L={maria:{email:'maria@x.com'},lider:{email:'lider@x.com'},joao:{email:'joao@x.com'},bloq:{email:'bloq@x.com'}};
  const col=n=>({doc:id=>({async get(){const d=(n==='sv2_users'?U:L)[id];return {exists:!!d,data:()=>d}}})});return {collection:col}}};`;
(async()=>{try{
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();const errs=[];
 const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
 await ctx.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('app-compat')?FAKE:''}));
 const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
 const ir=async h=>{await p.evaluate(h=>{location.hash=h},h);await p.waitForTimeout(250)};
 const nav=async()=>p.evaluate(()=>[...document.querySelectorAll('#rail .ri')].map(a=>a.textContent.replace(/\d+/g,'').trim()).join('|'));
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 // ---- perfis
 ok('Perfil padrão é Primário e o menu mostra tudo',(await nav())==='Início|Treinos|Pendências|Pessoas|Mensagens|Relatórios|Conferir|Ajustes',await nav());
 await ir('#/ajustes');
 ok('Ajustes tem o índice com 10 seções',(await p.locator('.aj-ind .sc').count())===10);
 const ids=await p.evaluate(()=>AJ_IND.map(x=>x[0]));
 ok('Cada item do índice leva a uma seção que existe',await p.evaluate(ids=>ids.every(i=>!!document.getElementById(i)),ids));
 await p.click('.aj-ind [data-v=aj-integra]');await p.waitForTimeout(500);
 ok('Tocar no índice foca a seção',await p.evaluate(()=>document.activeElement.id==='aj-integra'));
 await p.screenshot({path:OUT+'/i-ajustes.png',fullPage:true});
 await p.selectOption('#aj-pf','colaborador');await p.waitForTimeout(300);
 ok('Colaborador: menu só com Início, Treinos, Relatórios, Conferir e Ajustes',(await nav())==='Início|Treinos|Relatórios|Conferir|Ajustes',await nav());
 ok('Colaborador: barra de baixo sem Pendências nem Mensagens',await p.evaluate(()=>[...document.querySelectorAll('#bnav a')].map(a=>a.textContent.replace(/\d+/g,'').trim()).join('|')==='Início|Treinos|Mais'));
 for(const h of ['#/pessoas','#/pendencias','#/mensagens','#/aplicar/x','#/editar/x','#/sala/x','#/telao/x']){await ir(h);ok('Colaborador: '+h+' volta ao Início',(await p.evaluate(()=>location.hash))==='#/inicio');}
 ok('Colaborador: Início explica o perfil',(await p.locator('.coach').innerText()).includes('Colaborador'));
 ok('Colaborador: Início sem modelos para usar',(await p.locator('[data-act=usarmodelo]:visible').count())===0);
 await ir('#/treinos');
 ok('Colaborador: Treinos sem Novo, Editar, Aplicar, Excluir',await p.evaluate(()=>![...document.querySelectorAll('#app [data-act=novo], #app a[href^="#/aplicar"], #app a[href^="#/editar"], #app [data-act=excluir], #app [data-act=duplicar]')].some(e=>e.offsetParent)));
 await p.evaluate(()=>{const b=document.createElement('button');b.dataset.act='novo';b.id='fake-novo';b.textContent='x';document.body.appendChild(b)});
 await p.evaluate(()=>document.getElementById('fake-novo').click());await p.waitForTimeout(150);
 ok('Colaborador: ação de criar é barrada mesmo por fora da tela',(await p.locator('#dlg[open]').count())===0&&(await p.locator('#toast').innerText()).includes('Colaborador'));
 await ir('#/relatorios');ok('Colaborador: Relatórios abre',(await p.locator('#tb h1').innerText())==='Relatórios');
 await ir('#/mais');ok('Colaborador: Mais lista 3 itens',(await p.locator('.mais-i').count())===3);
 ok('API do EFClaudian devolve o perfil',await p.evaluate(()=>EFC_API.perfil()==='colaborador'&&EFC_API.versao()===VERSAO&&EFC_API.conta()===null));
 ok('Colaborador não edita observações',await p.evaluate(()=>podeObs()===false));
 await ir('#/ajustes');await p.selectOption('#aj-pf','estrela');await p.waitForTimeout(250);
 ok('Líder estrela volta a ter tudo',(await nav()).includes('Pessoas')&&await p.evaluate(()=>podeGerir()&&podeObs()));
 await p.selectOption('#aj-pf','primario');await p.waitForTimeout(200);
 // ---- observações
 const tid=await p.evaluate(()=>S.treinamentos[0].id);
 await ir('#/editar/'+tid);await p.waitForSelector('#obs-box');
 ok('Editor mostra Observações do treinamento',(await p.locator('#obs-box').innerText()).includes('Nenhuma observação'));
 await p.fill('#obs-t','Rever a pergunta 3 com o POP novo');await p.click('#obs-box [type=submit]');await p.waitForTimeout(200);
 ok('Anotar guarda com autor e data',await p.evaluate(()=>{const o=S.treinamentos[0].obs;return o&&o.length===1&&o[0].txt.includes('POP')&&o[0].por&&o[0].em}));
 ok('A observação aparece na lista',(await p.locator('.obs-i').innerText()).includes('Rever a pergunta 3'));
 ok('Observação não cria versão nova no treinamento',await p.evaluate(()=>!S.treinamentos[0].sujo));
 await p.click('[data-act=obsdel]');await p.waitForTimeout(200);
 ok('Excluir observação oferece Desfazer',await p.evaluate(()=>S.treinamentos[0].obs.length===0)&&(await p.locator('#toast button').count())===1);
 await p.click('#toast button');await p.waitForTimeout(200);
 ok('Desfazer devolve a observação',await p.evaluate(()=>S.treinamentos[0].obs.length===1));
 await p.screenshot({path:OUT+'/i-obs.png'});
 // ---- telão/som/demo/obs do Ajustes
 await ir('#/ajustes');
 await p.click('[data-act=padrao][data-c=telaoPadrao][data-v=claro]');await p.click('[data-act=padrao][data-c=somPadrao][data-v=desligado]');await p.waitForTimeout(200);
 ok('Padrões de telão e som viram o ponto de partida de Aplicar',await p.evaluate(()=>{UI.apl=null;return AJ_PADRAO.telao==='claro'&&AJ_PADRAO.som==='desligado'}));
 await ir('#/aplicar/'+tid);ok('Aplicar abre com telão claro',await p.evaluate(()=>UI.apl&&UI.apl.aj.telao==='claro'&&UI.apl.aj.som==='desligado'));
 await ir('#/ajustes');await p.click('[data-act=padrao][data-c=telaoPadrao][data-v=escuro]');await p.click('[data-act=padrao][data-c=somPadrao][data-v=ligado]');
 await p.fill('#c-obs','Lembrar de revisar o setor Packing');await p.waitForTimeout(200);
 ok('Observações do Ajustes ficam guardadas',await p.evaluate(()=>S.cfg.obs==='Lembrar de revisar o setor Packing'));
 await p.evaluate(()=>{S.treinamentos=[];S.sessoes=[{id:'t1',estado:'encerrada',aj:{teste:true},part:[],itens:[]},{id:'o1',estado:'encerrada',aj:{},part:[],itens:[]}];salvar();render()});await p.waitForTimeout(200);
 await p.click('[data-act=democarregar]');await p.waitForTimeout(200);
 ok('Carregar exemplos cria os modelos e desliga o botão',await p.evaluate(()=>MODELOS.every(m=>S.treinamentos.some(t=>t.titulo===m.titulo)))&&await p.locator('[data-act=democarregar]').isDisabled());
 await p.click('[data-act=demolimpar]');await p.waitForTimeout(200);
 ok('Apagar sessões de teste preserva as oficiais',await p.evaluate(()=>S.sessoes.length===1&&S.sessoes[0].id==='o1'));
 await p.click('#toast button');await p.waitForTimeout(200);
 ok('Desfazer devolve as sessões de teste',await p.evaluate(()=>S.sessoes.length===2));
 await p.evaluate(()=>{S.sessoes=[];salvar();render()});
 // ---- configuração e conta (SDK falso)
 const cfgTxt=`const firebaseConfig = { apiKey: "FAKEKEY-000", authDomain: "proj-teste.firebaseapp.com", projectId: "proj-teste", appId: "1:1:web:fake", appCheckKey: "FAKECHECK" };`;
 ok('Antes de configurar, não há login',await p.locator('#int-lg2').count()===0&&(await p.locator('#aj-integra').innerText()).includes('Sem configuração'));
 await p.fill('#int-cfg','texto qualquer sem chave');await p.click('#aj-integra [data-form=intcfg] [type=submit]');await p.waitForTimeout(150);
 ok('Configuração inválida mostra erro',(await p.locator('#aj-integra .int-er').innerText()).includes('apiKey'));
 await p.fill('#int-cfg',cfgTxt);await p.click('#aj-integra [data-form=intcfg] [type=submit]');await p.waitForTimeout(500);
 ok('Configuração guardada: mostra o projeto',(await p.locator('#aj-integra .int-st').innerText()).includes('proj-teste'));
 ok('A configuração fica só no localStorage e fora dos dados exportáveis',await p.evaluate(()=>!!localStorage.getItem('sabia-efc-cfg')&&!JSON.stringify(S).includes('FAKEKEY')));
 ok('O SDK foi iniciado com a configuração colada e o App Check',await p.evaluate(()=>window.__fbcfg&&window.__fbcfg.projectId==='proj-teste'&&window.__acKey==='FAKECHECK'));
 const entrar=async(l,s)=>{await p.fill('#int-lg2',l);await p.fill('#int-sn2',s);await p.click('#aj-integra [data-form=intlogin] [type=submit]');await p.waitForTimeout(500)};
 await entrar('maria','errada');
 ok('Senha errada: mensagem clara e continua sem conta',(await p.locator('#int-er2').innerText()).includes('não conferem')&&await p.evaluate(()=>!contaAtiva()));
 await entrar('bloq','123456');
 ok('Conta bloqueada não entra',(await p.locator('#int-er2').innerText()).includes('cadastro ativo')&&await p.evaluate(()=>!contaAtiva()));
 await entrar('maria','123456');
 ok('Login pelo apelido: conectado como Primário',await p.evaluate(()=>contaAtiva()&&INT.conta.nome==='Maria Responsável'&&perfilAtual()==='primario'));
 ok('Com conta, o perfil vem da conta e o seletor some',(await p.locator('#aj-perfil').innerText()).includes('Maria Responsável')&&await p.locator('#aj-pf').count()===0);
 ok('API conta() devolve o nome e o perfil',await p.evaluate(()=>EFC_API.conta().nome==='Maria Responsável'&&EFC_API.conta().perfil==='primario'));
 await p.screenshot({path:OUT+'/i-conta.png',fullPage:true});
 // recarrega: a conta continua (login do mesmo navegador)
 await p.reload();await p.waitForSelector('#app *');await p.waitForTimeout(800);
 ok('Depois de recarregar a conta continua conectada',await p.evaluate(()=>contaAtiva()&&INT.conta.nome==='Maria Responsável'));
 await ir('#/ajustes');
 await p.click('[data-act=intsair]');await p.waitForTimeout(250);
 ok('Sair só do Sabiá: volta ao perfil do aparelho',await p.evaluate(()=>!contaAtiva()&&perfilAtual()==='primario')&&(await p.locator('[data-act=intvoltar]').count())===1);
 await p.click('[data-act=intvoltar]');await p.waitForTimeout(400);
 ok('Voltar a usar a conta conectada, sem senha',await p.evaluate(()=>contaAtiva()));
 await p.click('[data-act=intsairtudo]');await p.waitForTimeout(400);
 ok('Sair de tudo desconecta',await p.evaluate(()=>!contaAtiva()&&!localStorage.getItem('fake-uid')));
 // líder e colaborador pela conta
 await entrar('lider','123456');
 ok('Conta com estrela vira Líder estrela',await p.evaluate(()=>perfilAtual()==='estrela'&&podeGerir()));
 await p.click('[data-act=intsairtudo]');await p.waitForTimeout(300);
 await entrar('joao@x.com','123456');
 ok('Login por e-mail; conta colaborador restringe o menu',(await nav())==='Início|Treinos|Relatórios|Conferir|Ajustes'&&await p.evaluate(()=>perfilAtual()==='colaborador'));
 await p.click('[data-act=intsairtudo]');await p.waitForTimeout(300);
 // ---- porta de entrada
 await p.evaluate(()=>{S.cfg.perfil='primario';salvar()});
 await ir('#/ajustes');await p.click('[data-act=porta][data-v="1"]');await p.waitForTimeout(250);
 ok('Ligar a porta ativa o aparelho atual',await p.evaluate(()=>S.cfg.porta===true&&ativado()));
 await p.evaluate(()=>{localStorage.removeItem('sabia-ativado');localStorage.removeItem('sabia-efc-conta')});
 await p.goto(U);await p.waitForSelector('.int-porta');
 ok('Aparelho sem ativação vê a porta (com login)',(await p.locator('.int-pc h1').innerText()).includes('não foi ativado')&&await p.locator('#int-lg').count()===1);
 ok('Na porta não aparece o menu',await p.evaluate(()=>getComputedStyle(document.querySelector('#rail')).display==='none'||!document.querySelector('#rail').offsetParent));
 await p.screenshot({path:OUT+'/i-porta.png'});
 await p.fill('#int-lg','maria');await p.fill('#int-sn','x');await p.click('.int-f [type=submit]');await p.waitForTimeout(500);
 ok('Porta: senha errada mostra o erro',(await p.locator('#int-er').innerText()).includes('não conferem'));
 await p.fill('#int-lg','maria');await p.fill('#int-sn','123456');await p.click('.int-f [type=submit]');await p.waitForTimeout(700);
 ok('Porta: conta de responsável ativa e abre o app',await p.locator('.int-porta').count()===0&&await p.evaluate(()=>ativado()&&lsG('sabia-ativado')==='1'));
 await p.evaluate(()=>{localStorage.removeItem('sabia-ativado');localStorage.removeItem('sabia-efc-conta');localStorage.removeItem('fake-uid')});
 await p.goto(U+'#/entrar/123456');await p.waitForTimeout(500);
 ok('A porta não bloqueia o participante (rota do celular)',await p.locator('.int-porta').count()===0&&await p.evaluate(()=>document.body.classList.contains('modo-cel')));
 await p.goto(U+'?ativar=1');await p.waitForSelector('.coach');
 ok('?ativar=1 ativa o aparelho e limpa o endereço',await p.evaluate(()=>ativado()&&!location.search));
 await p.evaluate(()=>{localStorage.removeItem('sabia-ativado')});
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 ok('?demo=1 abre a demonstração mesmo com a porta, marcada como teste',await p.evaluate(()=>document.body.classList.contains('int-demo')&&AJ_PADRAO.teste===true));
 await p.screenshot({path:OUT+'/i-demo.png'});
 await p.goto(U+'?ativar=1');await p.waitForSelector('.coach');await ir('#/ajustes');
 await p.click('[data-act=porta][data-v="0"]');await p.waitForTimeout(200);
 ok('Desligar a porta',await p.evaluate(()=>S.cfg.porta===false));
 await p.click('[data-act=intcfgrem]');await p.waitForTimeout(250);
 ok('Remover a configuração apaga o que foi guardado no aparelho',await p.evaluate(()=>!localStorage.getItem('sabia-efc-cfg'))&&(await p.locator('#aj-integra').innerText()).includes('Sem configuração'));
 // ---- sem SDK (sem internet): a conta guardada continua valendo
 await p.evaluate(c=>{localStorage.setItem('sabia-efc-cfg',JSON.stringify({apiKey:'FAKEKEY-000',projectId:'proj-teste'}));localStorage.setItem('sabia-efc-conta',JSON.stringify({uid:'u1',nome:'Maria Responsável',perfil:'primario'}))});
 await ctx.unroute('https://www.gstatic.com/firebasejs/**');await ctx.route('https://www.gstatic.com/firebasejs/**',r=>r.abort());
 await p.goto(U);await p.waitForSelector('.coach');await p.waitForTimeout(500);
 ok('Sem acesso à nuvem, o Sabiá abre e usa a última conta conhecida',await p.evaluate(()=>contaAtiva()&&perfilAtual()==='primario'));
 // ---- celular 390 px e escuro
 const m=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 await m.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('app-compat')?FAKE:''}));
 const q=await m.newPage();q.on('pageerror',e=>errs.push('cel '+e.message));
 await q.goto(U+'?demo=1');await q.waitForSelector('.coach');
 const lat=async n=>{const o=await q.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok('Celular: '+n+' sem rolagem lateral',o<=0,o+'px')};
 await q.evaluate(()=>{location.hash='#/ajustes'});await q.waitForTimeout(400);await lat('Ajustes');await q.screenshot({path:OUT+'/i-cel-ajustes.png',fullPage:true});
 const peq=await q.evaluate(()=>[...document.querySelectorAll('#app button,#app select,#app input:not([type=hidden])')].filter(e=>e.offsetParent&&!e.disabled&&e.type!=='file').map(e=>({t:(e.textContent||e.id||e.getAttribute('aria-label')||'').trim().slice(0,24),h:Math.round(e.getBoundingClientRect().height),w:Math.round(e.getBoundingClientRect().width)})).filter(x=>x.h<36));
 ok('Celular: itens do Ajustes com alvos de toque de 36 px ou mais',peq.length===0,JSON.stringify(peq).slice(0,300));
 await q.evaluate(()=>{S.cfg.perfil='colaborador';salvar();location.hash='#/treinos';render()});await q.waitForTimeout(300);await lat('Treinos como Colaborador');await q.screenshot({path:OUT+'/i-cel-col.png'});
 await q.evaluate(()=>{S.cfg.perfil='primario';S.cfg.porta=true;salvar()});await q.waitForTimeout(500);await q.evaluate(()=>{localStorage.removeItem('sabia-ativado')});
 await q.goto(U);await q.waitForSelector('.int-porta');await lat('Porta');await q.screenshot({path:OUT+'/i-cel-porta.png'});
 await q.evaluate(()=>{S.cfg.tema='escuro';aplicarTema();salvar()});await q.waitForTimeout(200);await q.screenshot({path:OUT+'/i-cel-porta-escuro.png'});
 ok('Sem erros de JS',errs.length===0,errs.join(' | ').slice(0,300));
 const f=log.filter(x=>x.startsWith('FALHA'));console.log(log.join('\n'));console.log(f.length?`\n${f.length} FALHAS de ${log.length}`:`\n${log.length} OK / 0 FALHAS`);
 await b.close();srv.close();
}catch(e){console.log(log.join('\n'));console.log('ERRO',e.message.split('\n')[0]);process.exit(1)}})();
