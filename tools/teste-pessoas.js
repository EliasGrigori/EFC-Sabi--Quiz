const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
(async()=>{
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
 const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{
  window.__mk=(t,o)=>{fixarVersao(t);
   const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:[],instrutor:'Elias Beserra',local:'Refeitório',horas:'1',aj:Object.assign({},AJ_PADRAO,o.aj||{}),estado:'sala',titulo:t.titulo,meta:t.meta,chave:String(100000+Math.floor(Math.random()*899999)),entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:t.itens.length,t0:0,dur:0},sim:{on:false,alvo:0}};
   if(o.mom)s.mom=o.mom;if(o.dias)s.dias=o.dias;if(o.base)s.base=o.base;
   const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));
   o.pessoas.forEach(([n,st,pct],k)=>{const p={id:uid(),nome:n,setor:st,real:true,cor:k%8};s.part.push(p);s.resp[p.id]={};const alvo=Math.round(qs.length*pct/100);
    qs.forEach(([it,i],j)=>{const a=j<alvo;let r;if(it.tipo==='ordenar')r=a?it.alternativas.map((_,x)=>x):it.alternativas.map((_,x)=>it.alternativas.length-1-x);else r=a?it.correta:((it.correta+1)%it.alternativas.length);s.resp[p.id][i]={r,ok:a,ms:3000,pts:a?1000:0}})});
   S.sessoes.push(s);encerrar(s);const x=S.sessoes.find(y=>y.id===s.id);x.fim=o.fim?new Date(o.fim).toISOString():new Date(Date.now()-(o.dias_atras||0)*86400000).toISOString();x.cod=codigoDe(x);return x.id};
 });
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 const ir=async h=>{await p.evaluate(h=>{location.hash=h},h);await p.waitForTimeout(250)};
 // ---------- A. cadastro
 await ir('#/pessoas');
 ok('Pessoas vazio explica o cadastro',(await p.locator('.vazio').innerText()).includes('Nenhuma pessoa cadastrada'));
 await p.screenshot({path:OUT+'/q-pessoas-vazio.png'});
 await p.click('.vazio [data-act=pesnova]');await p.fill('#pe-n','Maria Aparecida Silva');await p.selectOption('#pe-s','Packing');await p.click('#dlg button[type=submit]');
 await p.waitForTimeout(200);
 ok('Adiciona uma pessoa com setor',await p.evaluate(()=>S.pessoas.length===1&&S.pessoas[0].setor==='Packing'&&S.pessoas[0].ativo===true));
 await p.click('[data-act=pesnova]');await p.fill('#pe-n','maria aparecida silva');await p.click('#dlg button[type=submit]');
 ok('Nome repetido (sem acento e maiúscula) é recusado',await p.evaluate(()=>S.pessoas.length===1)&&(await p.locator('#dlg[open]').count())===1);
 await p.keyboard.press('Escape');
 await p.click('[data-act=pesimp]');await p.fill('#pi-t','José Wellington; Campo\nAna Cláudia Souza; Packing\nCarlos Eduardo Lima; Campo\nMaria Aparecida Silva; Packing\nLuiza Helena Costa; Laboratório novo');await p.click('#dlg button[type=submit]');
 await p.waitForTimeout(200);
 const st=await p.evaluate(()=>({n:S.pessoas.length,sets:S.cfg.setores.includes('Laboratório novo'),lh:(S.pessoas.find(x=>x.nome.startsWith('Luiza'))||{}).setor}));
 ok('Colar lista cadastra os novos e ignora quem já existe',st.n===5,JSON.stringify(st));
 ok('Setor novo da lista entra nos setores',st.sets&&st.lh==='Laboratório novo');
 ok('A lista mostra as 5 pessoas',(await p.locator('.pes-r').count())===5);
 await p.fill('#pes-q','jose');await p.waitForTimeout(250);
 ok('Busca ignora acento e maiúscula',(await p.locator('.pes-r').count())===1);
 ok('A caixa de busca mantém o foco ao digitar',await p.evaluate(()=>document.activeElement.id==='pes-q'));
 await p.fill('#pes-q','');await p.waitForTimeout(250);
 await p.click('[data-act=pesfiltro]');await p.selectOption('#pes-fo','Campo');await p.waitForTimeout(200);
 ok('Filtro por setor mostra só Campo',(await p.locator('.pes-r').count())===2);
 ok('O filtro mostra o resumo no botão',(await p.locator('[data-act=pesfiltro]').innerText()).includes('Campo'));
 await p.selectOption('#pes-fo','');await p.waitForTimeout(150);
 // editar: renomear guarda o nome antigo
 const idJ=await p.evaluate(()=>S.pessoas.find(x=>x.nome==='José Wellington').id);
 await p.click(`[data-act=pesedit][data-id="${idJ}"]`);await p.fill('#pe-n','José Wellington Souza');await p.fill('#pe-a','Zé');await p.click('#dlg button[type=submit]');await p.waitForTimeout(200);
 const ap=await p.evaluate(id=>S.pessoas.find(x=>x.id===id).apelidos,idJ);
 ok('Renomear guarda o nome antigo e o apelido',ap.includes('José Wellington')&&ap.includes('Zé'),JSON.stringify(ap));
 await p.screenshot({path:OUT+'/q-pessoas.png'});
 // arquivar tira do roster
 const idL=await p.evaluate(()=>S.pessoas.find(x=>x.nome.startsWith('Luiza')).id);
 await p.click(`[data-act=pesedit][data-id="${idL}"]`);await p.uncheck('#pe-at');await p.click('#dlg button[type=submit]');await p.waitForTimeout(200);
 ok('Arquivar tira a pessoa da lista de entrada',await p.evaluate(()=>!rosterCad([]).some(n=>n.startsWith('Luiza'))&&rosterCad([]).length===4));
 ok('Arquivada não aparece na lista padrão',(await p.locator('.pes-r').count())===4);
 // excluir + desfazer (arquivada só aparece em "Todas")
 await p.selectOption('#pes-fs','todas');await p.waitForTimeout(200);
 await p.click(`[data-act=pesdel][data-id="${idL}"]`);await p.waitForTimeout(150);
 ok('Excluir mostra Desfazer',await p.evaluate(()=>S.pessoas.length===4)&&(await p.locator('#toast button').count())===1);
 await p.click('#toast button');await p.waitForTimeout(150);
 ok('Desfazer devolve a pessoa',await p.evaluate(()=>S.pessoas.length===5));
 // ---------- B. sessões, sugeridas, juntar
 const t=await p.evaluate(()=>{const t=S.treinamentos[1];t.reav=[30,60,90];t.per=365;return t.id});
 const ids=await p.evaluate(tid=>{const t=S.treinamentos.find(x=>x.id===tid);const f=(d,pp)=>__mk(t,{dias_atras:d,pessoas:pp});
  f(20,[['Maria Aparecida Silva','Packing',100],['Zé','Campo',33],['Ana Cláudia Souza','Packing',100],['Carlos Eduardo Lima','Campo',50],['Pedro Novo','Campo',100]]);
  f(10,[['maria aparecida silva','Packing',100],['José Wellington Souza','Campo',100],['Ana Claudia Souza','Packing',83],['Carlos Eduardo Lima','Campo',100],['Pedro Novo','Campo',100]]);
  f(3,[['Maria Aparecida Silva','Packing',100],['José Wellington','Campo',83],['Ana Cláudia Souza','Packing',100],['Carlos Eduardo Lima','Campo',100],['Pedro Novo','Campo',100]]);
  return S.sessoes.map(s=>s.id)},t);
 ok('Maria com 3 grafias é uma pessoa só no relatório (chave)',await p.evaluate(()=>chaveNome('maria APARECIDA silva')===chaveNome('Maria Aparecida Silva')));
 ok('Apelido Zé vale como José Wellington Souza',await p.evaluate(()=>chaveNome('Zé')===chaveNome('José Wellington Souza')&&chaveNome('José Wellington')===chaveNome('Zé')));
 const sg=await p.evaluate(()=>sugeridas().map(x=>x.nome));
 ok('Sugeridas traz só quem ainda não está no cadastro',JSON.stringify(sg)==='["Pedro Novo"]',JSON.stringify(sg));
 await ir('#/pessoas');
 ok('Aviso de nome fora do cadastro aparece',(await p.locator('.pes-sug').innerText()).includes('1 nome apareceu'));
 await p.click('[data-act=pessugtog]');await p.waitForTimeout(150);
 ok('Dá para cadastrar ou juntar',(await p.locator('.pes-s [data-act=pessug]').count())===1&&(await p.locator('.pes-s select').count())===1);
 await p.screenshot({path:OUT+'/q-pessoas-sug.png'});
 await p.click('[data-act=pessug]');await p.waitForTimeout(200);
 ok('Cadastrar sugerida traz o setor da sessão',await p.evaluate(()=>{const x=S.pessoas.find(y=>y.nome==='Pedro Novo');return !!x&&x.setor==='Campo'}));
 ok('Sem mais sugeridas o aviso some',(await p.locator('.pes-sug').count())===0);
 // juntar: cria sessão com "Zeca" e junta com Pedro
 await p.evaluate(tid=>{__mk(S.treinamentos.find(x=>x.id===tid),{dias_atras:1,pessoas:[['Zeca Pedro','Campo',100]]})},t);
 await ir('#/pessoas');if((await p.locator('.pes-s').count())===0){await p.click('[data-act=pessugtog]');await p.waitForTimeout(150);}
 const idP=await p.evaluate(()=>S.pessoas.find(x=>x.nome==='Pedro Novo').id);
 await p.selectOption('.pes-s select',idP);await p.waitForTimeout(200);
 ok('Juntar põe o nome como apelido',await p.evaluate(()=>S.pessoas.find(x=>x.nome==='Pedro Novo').apelidos.includes('Zeca Pedro')));
 ok('Depois de juntar não resta sugerida',await p.evaluate(()=>sugeridas().length===0));
 // pendências com as grafias juntas: José (Zé 33% na 1ª, depois outra grafia...)
 const pd=await p.evaluate(()=>{const P=pendencias();return {ref:P.ref.map(x=>x.nome),esg:P.esgot.length,total:P.total}});
 ok('Reforço não duplica pessoa com grafias diferentes',pd.ref.length===0,JSON.stringify(pd));
 // ---------- C. perfil
 await ir('#/pessoas');
 const idM=await p.evaluate(()=>S.pessoas.find(x=>x.nome==='Maria Aparecida Silva').id);
 await p.click(`.pes-r:has-text("Maria") .pes-n`);await p.waitForTimeout(250);
 const h=await p.evaluate(id=>{const pe=S.pessoas.find(x=>x.id===id),h=histPessoa(pe);return {n:h.length,sel:selosDe(h).filter(x=>x.tem).map(x=>x.id)}},idM);
 ok('Perfil da Maria reúne as 3 sessões (3 grafias)',h.n===3,JSON.stringify(h));
 ok('Selos: primeira meta, constância e nota máxima',['meta1','const3','nota100'].every(k=>h.sel.includes(k))&&!h.sel.includes('pres5'),JSON.stringify(h.sel));
 ok('Perfil mostra o histórico, os selos e os indicadores',(await p.locator('.pfl-h > div').count())===3&&(await p.locator('.sel.tem').count())===h.sel.length&&(await p.locator('.rsm div').count())===4);
 ok('Perfil mostra "3 de 3" atingiu a meta',(await p.locator('.rsm').innerText()).includes('3 de 3'));
 await p.screenshot({path:OUT+'/q-perfil.png'});
 const idZ=idJ;await ir('#/pessoas/'+idZ);
 const hz=await p.evaluate(id=>{const pe=S.pessoas.find(x=>x.id===id),h=histPessoa(pe);return {n:h.length,pct:h.map(x=>x.pct)}},idZ);
 ok('José reúne Zé, José Wellington e José Wellington Souza',hz.n===3&&JSON.stringify(hz.pct)==='[33,100,83]',JSON.stringify(hz));
 ok('Selo de constância não vem de 3 sessões com uma abaixo da meta',await p.evaluate(id=>{const pe=S.pessoas.find(x=>x.id===id);return !selosDe(histPessoa(pe)).find(x=>x.id==='const3').tem},idZ));
 await ir('#/pessoas/inexistente');
 ok('Perfil de pessoa inexistente avisa',(await p.locator('.vazio').innerText()).includes('não encontrada'));
 // pendência no perfil e na lista
 await p.evaluate(tid=>{__mk(S.treinamentos.find(x=>x.id===tid),{dias_atras:0,pessoas:[['Carlos Eduardo Lima','Campo',33]]})},t);
 const idC=await p.evaluate(()=>S.pessoas.find(x=>x.nome.startsWith('Carlos')).id);
 await ir('#/pessoas/'+idC);
 ok('Perfil lista a pendência de reforço',(await p.locator('.pfl-pd').innerText()).includes('Reforço')&&(await p.locator('.pfl-pd').innerText()).includes('2ª tentativa'));
 await ir('#/pessoas');
 ok('Lista marca Reforço no status',(await p.locator('.pes-r:has-text("Carlos") .chip.warn').innerText())==='Reforço');
 // ---------- D. lista de entrada do cadastro em Aplicar
 await ir('#/aplicar/'+t);
 ok('Aplicar mostra a lista de entrada do cadastro',(await p.locator('.reap').first().innerText()).includes('pessoas entram pela lista'));
 await p.screenshot({path:OUT+'/q-aplicar-cad.png'});
 await p.click('[data-act=setor][data-v=Campo]');await p.waitForTimeout(150);
 ok('A lista respeita os setores escolhidos',(await p.locator('.reap').first().innerText()).includes('3 pessoas entram'));
 const ro=await p.evaluate(tid=>{UI.apl.setores=['Campo'];const r=rosterDe(UI.apl);return r},t);
 ok('rosterDe devolve só quem é do setor',JSON.stringify(ro)==='["Carlos Eduardo Lima","José Wellington Souza","Pedro Novo"]',JSON.stringify(ro));
 await p.click('[data-act=cadnao]');await p.waitForTimeout(150);
 ok('Não usar o cadastro desliga a lista',(await p.evaluate(()=>rosterDe(UI.apl)))===undefined);
 await p.click('[data-act=cadusar]');await p.waitForTimeout(150);
 await p.click('[data-act=preparar]');await p.waitForTimeout(250);
 ok('Sessão preparada leva a lista do cadastro',await p.evaluate(()=>{const s=S.sessoes[S.sessoes.length-1];return s.estado==='preparada'&&s.roster&&s.roster.length===3}));
 ok('Reforço mantém a lista própria de quem deve refazer',await p.evaluate(tid=>{aplicarPend('ref',tid);return UI.apl.roster.length===1&&UI.apl.roster[0].startsWith('Carlos')},t));
 // ---------- E. mensagens
 await ir('#/mensagens');
 ok('Mensagens vazio explica',(await p.locator('.vazio').innerText()).includes('Nenhuma mensagem ainda'));
 const sid=await p.evaluate(tid=>__mk(S.treinamentos.find(x=>x.id===tid),{dias_atras:0,pessoas:[['Maria Aparecida Silva','Packing',100],['Ana Cláudia Souza','Packing',83]]}),t);
 const n0=await p.evaluate(sid=>{const s=S.sessoes.find(x=>x.id===sid),a=s.part[0].id,b=s.part[1].id;let n=0;
  n+=ingerirCom(s,{[a]:{n:'x',com:{c1:{k:'reclamacao',x:'O telão estava difícil de ler',t:Date.now()-60000},c2:{k:'elogio',x:'Gostei da explicação',t:Date.now()-30000}}}});
  n+=ingerirCom(s,{[b]:{n:'x',com:{c1:{k:'pergunta',x:'Posso refazer amanhã?',t:Date.now()}}}});
  n+=ingerirCom(s,{[a]:{n:'x',com:{c1:{k:'reclamacao',x:'repetida',t:Date.now()}}}});   // mesmo id: não duplica
  return n},sid);
 ok('Ingere os 3 comentários e ignora o repetido',n0===3&&await p.evaluate(()=>S.mensagens.length===3),String(n0));
 const sane=await p.evaluate(sid=>{const s=S.sessoes.find(x=>x.id===sid),a=s.part[0].id;const L0=S.mensagens.length;
  ingerirCom(s,{[a]:{n:'x',com:{d1:{k:'hack',x:'tipo inválido',t:1},d2:{k:'elogio',x:'ok',t:1},d3:{k:'sugestao',x:'<img src=x onerror=alert(1)> '+'a'.repeat(500),t:9e15}}}});
  const novas=S.mensagens.slice(L0);return {n:novas.length,t:novas[0]&&novas[0].texto,em:novas[0]&&novas[0].em<=Date.now()+60000}},sid);
 ok('Tipo inválido e texto curto demais são recusados; texto é limpo e limitado',sane.n===1&&sane.t.length<=300&&!sane.t.includes('<')&&sane.em,JSON.stringify(sane));
 const l5=await p.evaluate(sid=>{const s=S.sessoes.find(x=>x.id===sid),a=s.part[0].id;const n=S.mensagens.length;ingerirCom(s,{[a]:{n:'x',com:{e1:{k:'elogio',x:'quarta'},e2:{k:'elogio',x:'quinta'},e3:{k:'elogio',x:'sexta'},e4:{k:'elogio',x:'sétima'}}}});return S.mensagens.length-n},sid);
 ok('Só os 3 primeiros comentários de uma pessoa entram por vez',l5<=3,String(l5));
 await p.evaluate(()=>{S.mensagens=S.mensagens.filter(m=>!['e1','e2','e3','e4'].includes(m.cid)&&m.cid!=='d3');S.mensagens.forEach(m=>{m.lida=false});salvar();render();menu('mensagens')});
 await ir('#/mensagens');
 ok('Lista as 3 mensagens, todas novas',(await p.locator('.msg-i').count())===3&&(await p.locator('.msg-i.nova').count())===3);
 ok('Menu mostra o número de mensagens novas',(await p.locator('.ri[href="#/mensagens"] .pdn-n').innerText())==='3');
 ok('Subtítulo diz "3 novas"',(await p.locator('#tb .sub').innerText()).includes('3 novas'));
 ok('Cada mensagem mostra nome, treinamento e versão',(await p.locator('.msg-i').first().innerText()).includes('Sobre')&&/v0\d/.test(await p.locator('.msg-i').first().innerText()));
 await p.screenshot({path:OUT+'/q-mensagens.png'});
 await p.click('[data-act=msgfiltro]');await p.selectOption('#ms-t','reclamacao');await p.waitForTimeout(200);
 ok('Filtro por tipo mostra só reclamações',(await p.locator('.msg-i').count())===1&&(await p.locator('[data-act=msgfiltro]').innerText()).includes('Reclamações'));
 await p.selectOption('#ms-t','');await p.waitForTimeout(150);
 await p.click('.msg-i >> nth=0 >> [data-act=msglida]');await p.waitForTimeout(200);
 ok('Marcar como lida tira o destaque e baixa o contador',(await p.locator('.msg-i.nova').count())===2&&(await p.locator('.ri[href="#/mensagens"] .pdn-n').innerText())==='2');
 await p.selectOption('#ms-s','novas');await p.waitForTimeout(150);
 ok('Filtro Novas mostra 2',(await p.locator('.msg-i').count())===2);
 await p.selectOption('#ms-s','');await p.waitForTimeout(150);
 await p.click('.msg-i >> nth=0 >> [data-act=msgresp]');await p.waitForSelector('#msg-r');await p.fill('#msg-r','Obrigado, vamos melhorar.');
 await p.click('[data-act=msgenviar]');await p.waitForTimeout(300);
 const rsp=await p.evaluate(()=>S.mensagens.filter(m=>m.resposta).map(m=>[m.resposta,m.lida]));
 ok('Responder guarda a resposta e marca como lida',rsp.length===1&&rsp[0][0]==='Obrigado, vamos melhorar.'&&rsp[0][1]===true,JSON.stringify(rsp));
 ok('A resposta aparece na lista',(await p.locator('.msg-r').innerText()).includes('Obrigado'));
 await p.click('.msg-i >> nth=0 >> [data-act=msgresp]');await p.click('[data-act=msgenviar]');await p.waitForTimeout(150);
 ok('Resposta vazia é recusada',await p.evaluate(()=>S.mensagens.filter(m=>m.resposta).length===1));
 const nM=await p.evaluate(()=>S.mensagens.length);
 await p.click('.msg-i >> nth=0 >> [data-act=msgdel]');await p.waitForTimeout(200);
 ok('Excluir remove e oferece Desfazer',await p.evaluate(n=>S.mensagens.length===n-1,nM)&&(await p.locator('#toast button').count())===1);
 await p.click('#toast button');await p.waitForTimeout(200);
 ok('Desfazer devolve a mensagem no mesmo lugar',await p.evaluate(n=>S.mensagens.length===n,nM));
 await ir('#/inicio');
 ok('Início prioriza pendências quando existem',(await p.locator('.coach').innerText()).includes('pendência'));
 await p.evaluate(()=>{window.__pend=pendencias;pendencias=()=>({total:0,ref:[],reav:[],esgot:[]});render()});await p.waitForTimeout(200);
 ok('Sem pendências, Início avisa das mensagens novas',(await p.locator('.coach').innerText()).includes('mensagens novas')||(await p.locator('.coach').innerText()).includes('mensagem nova'),(await p.locator('.coach').innerText()).slice(0,80));
 await p.evaluate(()=>{pendencias=window.__pend;render()});
 // perfil mostra mensagens
 await ir('#/pessoas/'+idM);
 ok('Perfil da Maria cita as mensagens enviadas por ela',(await p.locator('#app').innerText()).includes('mensagens enviadas')||(await p.locator('#app').innerText()).includes('mensagem enviada'));
 // ---------- F. desafio entre setores
 const hoje=new Date(),mes=hoje.getMonth(),ano=hoje.getFullYear();
 const ds=await p.evaluate(({tid,ano,mes})=>{
  S.sessoes=S.sessoes.filter(s=>s.estado!=='encerrada');S.mensagens=[];const t=S.treinamentos.find(x=>x.id===tid);const f=new Date(ano,mes,1,12).getTime();
  const dia=d=>f+d*86400000/2;   // dentro do mês
  __mk(t,{fim:dia(1),pessoas:[['A1','Packing',100],['A2','Packing',83],['A3','Packing',100],['B1','Campo',50],['B2','Campo',67],['B3','Campo',50],['C1','Lab',100],['C2','Lab',100]]});
  __mk(t,{fim:dia(2),aj:{teste:true},pessoas:[['T1','Lab',0],['T2','Lab',0],['T3','Lab',0]]});
  __mk(t,{fim:dia(2),mom:'pre',pessoas:[['P1','Lab',0],['P2','Lab',0],['P3','Lab',0]]});
  __mk(t,{fim:new Date(ano,mes-1,15).getTime(),pessoas:[['D1','Antigo',100],['D2','Antigo',100],['D3','Antigo',100]]});
  const M=mesDs(),D=dadosSetores(M);return {placar:D.placar.map(x=>[x.setor,x.pct,x.pess.size]),poucos:D.poucos.map(x=>x.setor)}},{tid:t,ano,mes});
 ok('Placar do mês ordena por acerto e exige 3 pessoas',JSON.stringify(ds.placar)===JSON.stringify([['Packing',94,3],['Campo',56,3]])&&JSON.stringify(ds.poucos)==='["Lab"]',JSON.stringify(ds));
 await ir('#/relatorios/desafio');
 ok('Tela do desafio abre com o seletor de modo',(await p.locator('.rel-modo button[aria-pressed=true]').innerText())==='Desafio entre setores');
 ok('Placar mostra 2 setores sem nomes de pessoas',(await p.locator('.ds-l li').count())===2&&!(await p.locator('.ds-k').innerText()).includes('A1'));
 ok('Avisa quem ficou fora por ter menos de 3 pessoas',(await p.locator('.ds-k').innerText()).includes('Fora do placar')&&(await p.locator('.ds-k').innerText()).includes('Lab'));
 ok('Teste e pré-teste não entram (Lab continua fora)',!(await p.locator('.ds-l').innerText()).includes('Lab'));
 await p.screenshot({path:OUT+'/q-desafio.png'});
 await p.click('[data-act=dsmes][data-v="-1"]');await p.waitForTimeout(200);
 ok('Mês anterior traz outro período (Antigo sozinho, sem placar)',(await p.locator('.ds-k').innerText()).includes('Ainda não há setor')||(await p.locator('.ds-l li').count())===1,(await p.locator('.ds-h h3').innerText()));
 await p.click('[data-act=dsmodo][data-v=ano]');await p.waitForTimeout(200);
 ok('Modo Ano soma o ano inteiro',(await p.locator('.ds-h h3').innerText()).includes('ano de'));
 await p.click('[data-act=dsmodo][data-v=mes]');await p.click('[data-act=dsmes][data-v="1"]');await p.waitForTimeout(200);
 await p.click('[data-act=dstela]');await p.waitForTimeout(250);
 ok('Tela grande mostra o placar sem os controles',(await p.locator('.ds-l.g li').count())===2&&(await p.locator('[data-act=dsmes]').count())===0);
 await p.screenshot({path:OUT+'/q-desafio-tela.png'});
 await p.click('[data-act=dssair]');await p.waitForTimeout(200);
 ok('Voltar da tela grande',(await p.locator('.ds-k').count())===1);
 await p.click('.rel-modo [data-act=relmodo][data-v=sessoes]');await p.waitForTimeout(250);
 ok('Alternar volta para as sessões',(await p.locator('.rl-top').count())===1);
 // ---------- G. celular
 const m=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const q=await m.newPage();
 q.on('pageerror',e=>errs.push('cel pageerror '+e.message));
 await q.addInitScript(()=>{});
 const sid2=await p.evaluate(tid=>__mk(S.treinamentos.find(x=>x.id===tid),{dias_atras:0,pessoas:[['Maria Aparecida Silva','Packing',100],['Ana Cláudia Souza','Packing',83]]}),t);
 await p.evaluate(()=>salvar());await p.waitForTimeout(300);
 const est=await p.evaluate(()=>JSON.stringify(S));
 await q.goto(U+'?demo=1');await q.waitForSelector('.coach');
 await q.evaluate(e=>{S=Object.assign(S,JSON.parse(e));salvar();render()},est);
 ok('Barra de baixo: Início, Treinos, Pendências, Mensagens, Mais',await q.evaluate(()=>[...document.querySelectorAll('.bnav a')].map(a=>a.textContent.replace(/\d+/g,'').trim()).join('|')==='Início|Treinos|Pendências|Mensagens|Mais'));
 await q.evaluate(()=>{location.hash='#/mais'});await q.waitForTimeout(250);
 ok('Mais lista Pessoas, Relatórios, Conferir e Ajustes',(await q.locator('.mais-i').count())===4);
 ok('No Mais a aba Mais fica marcada',(await q.locator('.bnav a[aria-current=page]').innerText()).includes('Mais'));
 await q.screenshot({path:OUT+'/q-cel-mais.png'});
 const semLat=async nome=>{const o=await q.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok('Celular: '+nome+' sem rolagem lateral',o<=0,o+'px')};
 const toque=async nome=>{const peq=await q.evaluate(()=>[...document.querySelectorAll('#app button,#app a.b,#app select,#app input:not([type=hidden]):not([type=checkbox]),.bnav a')].filter(e=>e.offsetParent&&!e.disabled).map(e=>{const r=e.getBoundingClientRect();return {t:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,22),w:Math.round(r.width),h:Math.round(r.height)}}).filter(x=>x.h<36||x.w<36));ok('Celular: '+nome+' com alvos de 36 px ou mais',peq.length===0,JSON.stringify(peq).slice(0,300))};
 for(const [nome,h] of [['Pessoas','#/pessoas'],['Perfil','#/pessoas/'+idM],['Mensagens','#/mensagens'],['Desafio','#/relatorios/desafio'],['Mais','#/mais']]){
  await q.evaluate(h=>{location.hash=h},h);await q.waitForTimeout(300);await semLat(nome);await toque(nome);await q.screenshot({path:OUT+'/q-cel-'+nome.toLowerCase()+'.png'});
 }
 await q.evaluate(()=>{S.mensagens=[];salvar()});
 await q.evaluate(sid=>{const s=S.sessoes.find(x=>x.id===sid);ingerirCom(s,{[s.part[0].id]:{n:'x',com:{z1:{k:'sugestao',x:'Mais exemplos do dia a dia',t:Date.now()}}}});location.hash='#/mensagens';render()},sid2);await q.waitForTimeout(300);
 await q.screenshot({path:OUT+'/q-cel-mensagens.png'});
 // tema escuro
 await q.evaluate(()=>{S.cfg.tema='escuro';aplicarTema();render()});
 for(const h of ['#/pessoas','#/mensagens','#/relatorios/desafio','#/pessoas/'+idM]){await q.evaluate(h=>{location.hash=h},h);await q.waitForTimeout(250)}
 await q.screenshot({path:OUT+'/q-cel-escuro.png'});
 ok('Tema escuro renderiza o perfil',(await q.locator('.pfl-top').count())===1);
 ok('Sem erros de JS',errs.length===0,errs.join(' | ').slice(0,300));
 const f=log.filter(x=>x.startsWith('FALHA'));console.log(log.join('\n'));console.log(f.length?`\n${f.length} FALHAS de ${log.length}`:`\n${log.length} OK / 0 FALHAS`);
 await b.close();srv.close();
})();
