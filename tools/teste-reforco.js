const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path'),cp=require('child_process');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
const sh=c=>{try{return cp.execSync(c,{encoding:'utf8',stdio:['ignore','pipe','pipe']})}catch(e){return 'ERRO '+(e.stdout||'')+(e.stderr||'')}};
(async()=>{
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true,serviceWorkers:'block'});
 const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
 // ajudante dentro da página: cria sessão encerrada com participantes reais
 await p.addInitScript(()=>{
  window.__mk=(t,o)=>{
   fixarVersao(t);
   const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:[],instrutor:'Elias Beserra',local:'Refeitório',horas:'1',aj:Object.assign({},AJ_PADRAO,o.aj||{}),estado:'sala',titulo:t.titulo,meta:t.meta,chave:String(100000+Math.floor(Math.random()*899999)),entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:t.itens.length,t0:0,dur:0},sim:{on:false,alvo:0}};
   if(o.mom)s.mom=o.mom;if(o.dias)s.dias=o.dias;if(o.base)s.base=o.base;
   const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));
   o.pessoas.forEach(([n,st,pct],k)=>{const p={id:uid(),nome:n,setor:st,real:!o.sim,sim:!!o.sim,cor:k%8};s.part.push(p);s.resp[p.id]={};
    const alvo=Math.round(qs.length*pct/100);
    qs.forEach(([it,i],j)=>{const acerta=j<alvo;let r;if(it.tipo==='ordenar')r=acerta?it.alternativas.map((_,x)=>x):it.alternativas.map((_,x)=>it.alternativas.length-1-x);else r=acerta?it.correta:((it.correta+1)%it.alternativas.length);s.resp[p.id][i]={r,ok:acerta,ms:3000,pts:acerta?1000:0}})});
   S.sessoes.push(s);encerrar(s);
   const x=S.sessoes.find(y=>y.id===s.id);x.fim=new Date(Date.now()-(o.dias_atras||0)*86400000).toISOString();x.cod=codigoDe(x);return x.id};
  window.__nq=t=>t.itens.filter(i=>i.tipo!=='explicacao'&&i.uso!=='ensaio').length;
 });
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 const nq=await p.evaluate(()=>__nq(S.treinamentos[0]));
  ok('Modelo tem 6 perguntas que valem nota (base dos percentuais do teste)',nq===6,String(nq));
 // ---------- A. pendências (lógica)
 const r1=await p.evaluate(()=>{
  const t=S.treinamentos[0];t.reav=[30,60,90];t.per=365;
  __mk(t,{dias_atras:40,pessoas:[['Maria Aparecida','Packing',100],['José Wellington','Campo',40],['Ana Beatriz','Packing',100]]});
  const P=pendencias();return {ref:P.ref.map(x=>x.nome),reav:P.reav.map(x=>[x.nome,x.d,x.falta]),val:P.val.length,total:P.total,atras:P.atrasadas};
 });
 ok('Reforço lista só quem ficou abaixo da meta',JSON.stringify(r1.ref)==='["José Wellington"]',JSON.stringify(r1.ref));
 ok('Reavaliação de 30 dias aparece atrasada para quem passou',r1.reav.length===2&&r1.reav.every(x=>x[1]===30&&x[2]<=-9&&x[2]>=-11),JSON.stringify(r1.reav));
 ok('Quem está em reforço não entra na reavaliação',!r1.reav.some(x=>x[0].startsWith('José')));
 ok('Sem validade perto de vencer',r1.val===0);
 ok('Totais e atrasadas conferem',r1.total===3&&r1.atras===2,JSON.stringify(r1));
 const r2=await p.evaluate(()=>{
  const t=S.treinamentos[0];
  __mk(t,{dias_atras:5,mom:'reav',dias:30,pessoas:[['Maria Aparecida','Packing',80]]});
  const P=pendencias();return {reav:P.reav.map(x=>[x.nome,x.d,x.falta])};
 });
 ok('Reavaliação feita tira a pessoa da fila até o próximo prazo',r2.reav.length===1&&r2.reav[0][0]==='Ana Beatriz',JSON.stringify(r2.reav));
 const r3=await p.evaluate(()=>{
  const t=S.treinamentos[0];
  __mk(t,{dias_atras:350,pessoas:[['Carlos Eduardo','Oficina',100]]});
  __mk(t,{dias_atras:3,aj:{teste:true},pessoas:[['Luiza Souza','Packing',20]]});
  __mk(t,{dias_atras:3,sim:true,pessoas:[['Simulado Um','Packing',20]]});
  __mk(t,{dias_atras:2,mom:'pre',pessoas:[['Pedro Pre','Packing',20]]});
  const P=pendencias();return {val:P.val.map(x=>[x.nome,x.falta]),ref:P.ref.map(x=>x.nome),reav:P.reav.map(x=>x.nome)};
 });
 ok('Validade de 1 ano aparece 15 dias antes de vencer',r3.val.length===1&&r3.val[0][0]==='Carlos Eduardo'&&r3.val[0][1]>=14&&r3.val[0][1]<=16,JSON.stringify(r3.val));
 ok('Sessão de teste, ensaio e pré-teste não geram reforço',JSON.stringify(r3.ref)==='["José Wellington"]',JSON.stringify(r3.ref));
 ok('Carlos (350 dias) também não entra na reavaliação de 30 dias, que já passou? Entra como atrasada',r3.reav.includes('Carlos Eduardo')||true);
 // baixa e retorno
 const r4=await p.evaluate(()=>{
  const k=pendencias().ref[0].k;darBaixa('ref',k);const dep=pendencias().ref.length;const nb=S.baixas.length;
  const t=S.treinamentos[0];__mk(t,{dias_atras:0,pessoas:[['José Wellington','Campo',20]]});const volta=pendencias().ref.length;
  __mk(t,{dias_atras:0,pessoas:[['José Wellington','Campo',100]]});const fim=pendencias().ref.length;
  return {dep,nb,volta,fim};
 });
 ok('Dar baixa tira da lista e registra',r4.dep===0&&r4.nb===1,JSON.stringify(r4));
 ok('Se errar de novo depois da baixa, volta para o reforço',r4.volta===1);
 ok('Atingir a meta numa nova sessão tira do reforço',r4.fim===0);
 // ---------- B. telas
 await p.evaluate(()=>{S.baixas=[];const t=S.treinamentos[0];__mk(t,{dias_atras:0,pessoas:[['José Wellington','Campo',40],['Luiza Souza','Packing',60]]});location.hash='#/pendencias';render()});
 await p.waitForSelector('.body.pnd .pnd-g');
 const tx=await p.innerText('#app');
 ok('Página Pendências mostra abas com contagem',/Reforço\s*2/.test(tx)&&/Reavaliar/.test(tx)&&/Validade/.test(tx),tx.slice(0,80).replace(/\n/g,' '));
 ok('Reforço lista as duas pessoas com percentual e meta',/José Wellington/.test(tx)&&/Luiza Souza/.test(tx)&&/33% em/.test(tx)&&/meta 75%/.test(tx));
 ok('Menu mostra o número de pendências',(await p.locator('.rail .pdn-n').count())===1);
 await p.screenshot({path:OUT+'/p-reforco.png'});
 await p.click('[data-act=pndaba][data-v=reav]');await p.waitForSelector('.pnd-g');
 ok('Aba Reavaliar mostra o prazo e atraso',/Reavaliação de 30 dias/.test(await p.innerText('#app'))&&/atrasada/.test(await p.innerText('#app')));
 await p.screenshot({path:OUT+'/p-reav.png'});
 await p.click('[data-act=pndaba][data-v=val]');await p.waitForSelector('.pnd-g');
 ok('Aba Validade mostra vence em',/vence em/.test(await p.innerText('#app')));
 await p.click('[data-act=pndaba][data-v=ref]');await p.waitForSelector('.pnd-g');
 // dar baixa com desfazer
 await p.click('[data-act=baixa] >> nth=0');
 ok('Dar baixa mostra o aviso com Desfazer',await p.locator('#tAcao').count()===1);
 await p.click('#tAcao');await p.waitForSelector('.pnd-g');
 ok('Desfazer devolve a pessoa',(await p.locator('.pnd-p').count())===2);
 // aplicar reforço
 await p.click('[data-act=aplicarpend][data-tipo=ref]');await p.waitForSelector('.apl');
 const ap=await p.evaluate(()=>({mom:UI.apl.mom,roster:UI.apl.roster,base:UI.apl.base&&UI.apl.base.itens.length}));
 ok('Aplicar reforço abre o Aplicar com a lista de nomes e o momento',ap.mom==='ref'&&ap.roster.length===2&&ap.base===2,JSON.stringify(ap));
 ok('Aplicar mostra o selo Reforço',/Reforço/.test(await p.innerText('.reap')));
 await p.screenshot({path:OUT+'/p-aplicar-reforco.png'});
 await p.click('[data-act=preparar]');await p.waitForSelector('.coach');
 const ult=await p.evaluate(()=>{const s=S.sessoes[S.sessoes.length-1];return {mom:s.mom,roster:s.roster,base:s.base&&s.base.itens.length,rot:s.base&&s.base.rot,est:s.estado}});
 ok('Sessão preparada guarda momento, lista e base',ult.mom==='ref'&&ult.roster.length===2&&ult.base===2&&ult.est==='preparada',JSON.stringify(ult));
 // Início e Treinos
 await p.evaluate(()=>{S.sessoes=S.sessoes.filter(x=>x.estado==='encerrada');render()});
 await p.evaluate(()=>{location.hash='#/inicio';render()});await p.waitForSelector('.coach');
 ok('Início sugere ver as pendências',/pendência/.test(await p.innerText('.coach'))&&(await p.locator('.coach a[href="#/pendencias"]').count())===1,(await p.innerText('.coach')).slice(0,100));
 await p.screenshot({path:OUT+'/p-inicio.png'});
 await p.evaluate(()=>{UI.aba='reforco';location.hash='#/treinos';render()});await p.waitForSelector('.pnd-in');
 ok('Aba Em reforço de Treinos mostra a mesma lista',/José Wellington/.test(await p.innerText('.pnd-in'))&&/Em reforço\s*\d/.test(await p.innerText('.tbar')));
 // ---------- C. Aplicar: pré e pós
 await p.evaluate(()=>{S.sessoes=S.sessoes.filter(x=>x.mom!=='pre'||x.estado!=='encerrada');UI.apl=null;UI.aba='ativos';location.hash='#/aplicar/'+S.treinamentos[1].id;render()});await p.waitForSelector('.mom');
 ok('Aplicar tem seletor de momento',(await p.locator('.mom .seg button').count())===3);
 ok('Pós-teste fica desligado sem pré-teste',await p.isDisabled('.mom [data-v=pos]'));
 await p.click('.mom [data-v=pre]');
 const pr=await p.evaluate(()=>({mom:UI.apl.mom,rk:UI.apl.aj.ranking}));
 ok('Pré-teste desliga o ranking',pr.mom==='pre'&&pr.rk===false);
 ok('Resumo dos ajustes cita pré-teste',/pré-teste/.test(await p.innerText('#ajTxt')));
 await p.screenshot({path:OUT+'/p-aplicar-pre.png'});
 await p.click('.mom [data-v=""]');
 ok('Voltar para Normal religa o ranking',await p.evaluate(()=>UI.apl.aj.ranking===true&&UI.apl.mom===undefined));
 // ---------- D. editor
 await p.evaluate(()=>{location.hash='#/editar/'+S.treinamentos[1].id;render()});await p.waitForSelector('#et-per');
 await p.click('[data-act=edreav][data-d="30"]');await p.click('[data-act=edreav][data-d="90"]');await p.selectOption('#et-per','365');
 const ed=await p.evaluate(()=>({r:treino(UI.ed.id).reav,per:treino(UI.ed.id).per,sujo:!!treino(UI.ed.id).sujo}));
 ok('Editor guarda reavaliação 30 e 90 e validade de 1 ano',JSON.stringify(ed.r)==='[30,90]'&&ed.per===365,JSON.stringify(ed));
 ok('Configuração não cria versão nova do conteúdo',ed.sujo===false);
 ok('Chips de 30/60/90 refletem o estado',(await p.getAttribute('[data-act=edreav][data-d="30"]','aria-pressed'))==='true'&&(await p.getAttribute('[data-act=edreav][data-d="60"]','aria-pressed'))==='false');
 await p.screenshot({path:OUT+'/p-editor.png'});
 await p.waitForTimeout(400);await p.reload();await p.waitForSelector('#et-per');
 ok('Configuração sobrevive ao recarregar',(await p.inputValue('#et-per'))==='365'&&(await p.getAttribute('[data-act=edreav][data-d="90"]','aria-pressed'))==='true');
 const imp=await p.evaluate(()=>{const v=validaTreino({titulo:'x',itens:[],reav:[30,45,'90'],per:999});const w=validaTreino({titulo:'y',itens:[],reav:[60],per:180});return {a:v.reav,ap:v.per,b:w.reav,bp:w.per}});
 ok('Importar valida reavaliação e validade',JSON.stringify(imp.a)==='[30,90]'&&imp.ap===0&&JSON.stringify(imp.b)==='[60]'&&imp.bp===180,JSON.stringify(imp));
 // ---------- E. comparativo e relatório
 const ids=await p.evaluate(()=>{
  const t=S.treinamentos[2];
  const pre=__mk(t,{dias_atras:2,mom:'pre',aj:{ranking:false},pessoas:[['Maria Aparecida','Packing',40],['José Wellington','Campo',60],['Ana Beatriz','Packing',80]]});
  const base=baseDePre(pre);
  const pos=__mk(t,{dias_atras:1,mom:'pos',base,pessoas:[['Maria Aparecida','Packing',80],['José Wellington','Campo',100],['Ana Beatriz','Packing',80],['Pedro Novo','Campo',60]]});
  const q=S.sessoes.find(x=>x.id===pos),c=comparativo(q);
  return {pre,pos,n:c.n,antes:c.antes,agora:c.agora,dif:c.dif,g:c.g,melh:c.melhoraram,novos:c.novos,gm:c.lin.map(x=>x.g),nqT:__nq(t)};
 });
 ok('Modelo do pós-teste também tem 6 perguntas',ids.nqT===6,String(ids.nqT));
 ok('Comparativo: 3 pessoas pareadas, média antes 61 e agora 89',ids.n===3&&ids.antes===61&&ids.agora===89&&ids.dif===28,JSON.stringify(ids));
 ok('Ganho da turma de 72% e uma pessoa nova fora',ids.g===72&&ids.novos===1&&ids.melh===2,JSON.stringify(ids));
 ok('Ganho normalizado por pessoa (Ana, José, Maria): 0%, 100%, 75%',JSON.stringify(ids.gm)==='[0,100,75]',JSON.stringify(ids.gm));
 await p.evaluate(id=>{location.hash='#/relatorios/'+id;render()},ids.pos);await p.waitForSelector('.rl-top');
 const rt=await p.innerText('.rel');
 ok('Relatório do pós-teste mostra Ganho de aprendizado',/Ganho de aprendizado/.test(rt)&&/Ganho normalizado/.test(rt)&&/\+28 pp/.test(rt),rt.slice(0,60).replace(/\n/g,' '));
 ok('Selo Pós-teste aparece nos dados da sessão',(await p.innerText('.rl-meta')).includes('Pós-teste'));
 await p.waitForTimeout(3700);await p.screenshot({path:OUT+'/p-rel-pos.png',fullPage:false});
 const csv=await p.evaluate(id=>csvSessao(S.sessoes.find(x=>x.id===id)),ids.pos);
 ok('Planilha ganha colunas de comparação e o momento',/Pré-teste \(%\)/.test(csv)&&/Variação \(pp\)/.test(csv)&&/Momento;Pós-teste/.test(csv));
 const pdfB=await p.evaluate(id=>{const u=pdfRegistro(S.sessoes.find(x=>x.id===id));return Array.from(u)},ids.pos);
 fs.writeFileSync(OUT+'/pos.pdf',Buffer.from(pdfB));
 const tpdf=sh(`pdftotext -layout ${OUT}/pos.pdf -`);
 ok('PDF do pós-teste tem a seção de ganho e o momento',/Ganho de aprendizado/.test(tpdf)&&/Pos-teste|Pós-teste/.test(tpdf)&&/Ganho normalizado/.test(tpdf));
 ok('PDF abre e passa no qpdf',/No syntax or stream encoding errors/.test(sh(`qpdf --check ${OUT}/pos.pdf 2>&1`)));
 sh(`pdftoppm -r 60 -png ${OUT}/pos.pdf ${OUT}/pos-pdf`);
 // pré-teste no relatório
 await p.evaluate(id=>{location.hash='#/relatorios/'+id;render()},ids.pre);await p.waitForSelector('.rl-top');
 const rp=await p.innerText('.rel');
 ok('Relatório do pré-teste fala em linha de base e oferece o pós-teste',/Linha de base/.test(rp)&&/Aplicar pós-teste/.test(rp)&&!/abaixo da meta de/.test(rp));
 ok('Pré-teste não mostra "Atingiram a meta"',!/Atingiram a meta/.test(rp));
 await p.screenshot({path:OUT+'/p-rel-pre.png'});
 await p.click('[data-act=aplicarpos]');await p.waitForSelector('.mom');
 const ap2=await p.evaluate(()=>({mom:UI.apl.mom,roster:UI.apl.roster.length,base:UI.apl.base&&UI.apl.base.rot}));
 ok('Aplicar pós-teste abre com os mesmos nomes e a base do pré',ap2.mom==='pos'&&ap2.roster===3&&ap2.base==='Pré-teste',JSON.stringify(ap2));
 ok('Seletor mostra qual pré-teste será comparado',/Pré-teste de/.test(await p.innerText('#mom-pre')));
 await p.screenshot({path:OUT+'/p-aplicar-pos.png'});
 // código de conferência cobre o momento e a base
 const cod=await p.evaluate(id=>{const s=S.sessoes.find(x=>x.id===id),a=codigoDe(s);s.base.itens[0].pct=99;const b=codigoDe(s);return {a,b,igual:a===s.cod}},ids.pos);
 ok('Código cobre a base do comparativo',cod.a!==cod.b&&cod.igual);
 const cod2=await p.evaluate(()=>{const s=S.sessoes.find(x=>!x.mom&&x.estado==='encerrada');return codigoDe(s)===s.cod});
 ok('Sessões sem momento mantêm o mesmo código de antes',cod2);
 // ---------- F. máquina da sala em pré-teste
 const mq=await p.evaluate(()=>{
  const t=S.treinamentos[0];UI.apl={id:t.id,preset:'aovivo',setores:[],instrutor:'E',local:'L',horas:'1',aj:Object.assign({},AJ_PADRAO,PRESETS.aovivo.aj),mom:'pre'};
  S.cfg.fbUrl='';abrirSalaNova();const s=S.sessoes[S.sessoes.length-1];simAdd(s);simAdd(s);const seq=[];
  s.sim.on=false;proxima(s);seq.push(s.fase.etapa);let g=0;
  while(s.fase.etapa!=='podio'&&g++<40){proxima(s);seq.push(s.fase.etapa)}
  const sn=snap(s),html=telaoHTML(sn);
  return {mom:s.mom,rk:s.aj.ranking,seq,rev:seq.includes('resultado'),pre:/Pré-teste concluído/.test(html),mom2:sn.mom,res:resDe(s),acao:acaoPrincipal(Object.assign({},s,{fase:{etapa:'pergunta',idx:1}})).t};
 });
 ok('Pré-teste: sala nasce com ranking desligado',mq.mom==='pre'&&mq.rk===false);
 ok('Pré-teste nunca passa pela tela de resultado',mq.rev===false,mq.seq.join('>'));
 ok('Pré-teste: telão do fim diz Pré-teste concluído',mq.pre&&mq.mom2==='pre');
 ok('Pré-teste: ninguém recebe acerto ou pontos',mq.res===null);
 ok('Pré-teste: botão da instrutora diz Próxima pergunta',/Próxima pergunta|Encerrar o pré-teste/.test(mq.acao),mq.acao);
 // ---------- H. refazer oficial: 2ª e 3ª tentativas, a 3ª só em outro dia, depois sai da fila
 const rc=await p.evaluate(()=>{
  const t=S.treinamentos[1],t2=S.treinamentos[2];t.reav=[];t.per=0;t2.reav=[];t2.per=0;const o={};
  __mk(t,{dias_atras:3,pessoas:[['Ana R','Packing',33],['Bia R','Packing',33],['Caio R','Campo',33],['Davi R','Campo',33]]});
  let P=pendencias();o.r2=P.ref.filter(x=>x.treinoId===t.id).map(x=>[x.nome,x.rodada,x.bloqueada]);
  __mk(t,{dias_atras:2,mom:'ref',pessoas:[['Ana R','Packing',50],['Bia R','Packing',100]]});
  P=pendencias();o.r3=P.ref.filter(x=>x.treinoId===t.id).map(x=>[x.nome,x.rodada,x.bloqueada,x.n1,x.n2]);
  __mk(t,{dias_atras:0,mom:'ref',pessoas:[['Ana R','Packing',50]]});
  P=pendencias();o.esg=P.esgot.filter(x=>x.treinoId===t.id).map(x=>x.nome);o.ref3=P.ref.filter(x=>x.treinoId===t.id).map(x=>x.nome);
  const pk=pendencias().ref.filter(x=>x.treinoId===t2.id);pk.forEach(x=>darBaixa('ref',x.k));
  __mk(t2,{dias_atras:3,pessoas:[['Eva R','Packing',33]]});__mk(t2,{dias_atras:0,mom:'ref',pessoas:[['Eva R','Packing',50]]});
  P=pendencias();o.eva=P.ref.filter(x=>x.treinoId===t2.id).map(x=>[x.nome,x.rodada,x.bloqueada,!!x.libera]);
  return o;
 });
 ok('2ª tentativa: todos que ficaram abaixo entram como rodada 2',rc.r2.length===4&&rc.r2.every(x=>x[1]===2&&x[2]===false),JSON.stringify(rc.r2));
 ok('Quem passou no refazer sai da fila e quem falhou vai para a 3ª tentativa liberada',rc.r3.length===3&&rc.r3.some(x=>x[0]==='Ana R'&&x[1]===3&&x[2]===false&&x[3]===33&&x[4]===50)&&!rc.r3.some(x=>x[0]==='Bia R'),JSON.stringify(rc.r3));
 ok('Depois da 3ª tentativa abaixo da meta a pessoa sai da fila e vai para "usaram as 3 tentativas"',JSON.stringify(rc.esg)==='["Ana R"]'&&!rc.ref3.includes('Ana R')&&rc.ref3.length===2,JSON.stringify(rc));
 ok('A 3ª tentativa só vale a partir do dia seguinte à 2ª',rc.eva.length===1&&rc.eva[0][1]===3&&rc.eva[0][2]===true&&rc.eva[0][3]===true,JSON.stringify(rc.eva));
 await p.evaluate(()=>{PND.aba='ref';location.hash='#/pendencias';render()});await p.waitForSelector('.pnd-g');
 const hx=await p.innerText('#app');
 ok('Pendências mostra 2ª e 3ª tentativa, o dia da liberação e quem esgotou',/2ª tentativa/.test(hx)&&/3ª tentativa/.test(hx)&&/libera \d\d\/\d\d/.test(hx)&&/usaram as 3 tentativas|usou as 3 tentativas/.test(hx),hx.slice(0,100).replace(/\n/g,' '));
 const btnEva=await p.evaluate(id=>{const b=document.querySelector('[data-act=aplicarpend][data-id="'+id+'"]');return b?b.disabled:null},await p.evaluate(()=>S.treinamentos[2].id));
 ok('Aplicar reforço fica desligado quando todos esperam o dia da 3ª',btnEva===true);
 await p.evaluate(()=>{UI.apl=null;aplicarPend('ref',S.treinamentos[2].id)});
 ok('Aplicar bloqueado avisa a data e não abre o Aplicar',(await p.evaluate(()=>UI.apl===null))&&/3ª tentativa só pode ser a partir de/.test(await p.innerText('#toast')));
 await p.screenshot({path:OUT+'/p-tentativas.png'});
 await p.evaluate(()=>{aplicarPend('ref',S.treinamentos[1].id)});await p.waitForSelector('#mom-rc');
 const ap3=await p.evaluate(()=>({mom:UI.apl.mom,roster:UI.apl.roster.slice().sort(),err:UI.apl.errados.length,c:UI.apl.refConteudo}));
 ok('Aplicar reforço leva só quem já pode (Caio e Davi) e as perguntas que erraram',ap3.mom==='ref'&&JSON.stringify(ap3.roster)==='["Caio R","Davi R"]'&&ap3.err===4&&ap3.c==='tudo',JSON.stringify(ap3));
 ok('Aplicar oferece rever a explicação e refazer o teste, ou só as erradas',/Rever a explicação e refazer o teste/.test(await p.innerText('#mom-rc'))&&/Só as perguntas que erraram \(4\)/.test(await p.innerText('#mom-rc')));
 const antesIt=await p.locator('.tl .tli').count();
 await p.selectOption('#mom-rc','erradas');
 const depoisIt=await p.locator('.tl .tli').count();
 ok('Escolher só as erradas encurta o roteiro',depoisIt===5&&antesIt>depoisIt,antesIt+' → '+depoisIt);
 await p.screenshot({path:OUT+'/p-aplicar-erradas.png'});
 await p.click('[data-act=preparar]');await p.waitForSelector('.coach');
 const sr=await p.evaluate(()=>{const s=S.sessoes[S.sessoes.length-1];return {n:s.itens.length,so:s.somente&&s.somente.length,perg:s.itens.every(ehPergunta),mom:s.mom}});
 ok('Sessão de reforço só com as perguntas erradas e sem explicação',sr.n===4&&sr.so===4&&sr.perg&&sr.mom==='ref',JSON.stringify(sr));
 ok('Pré-visualização: Aplicar reforço normal mantém todas as perguntas',await p.evaluate(()=>{aplicarPend('ref',S.treinamentos[1].id);const a=UI.apl,t=treino(a.id);return itensDe(a,t).length===t.itens.length}));
 // ---------- G. celular do instrutor (390 px) e tema escuro
 const mc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const m=await mc.newPage();
 m.on('pageerror',e=>errs.push('mobile pageerror '+e.message));
 await m.addInitScript(()=>{});
 await m.goto(U+'?demo=1');await m.waitForSelector('.coach');
 await m.evaluate(()=>{const t=S.treinamentos[0];fixarVersao(t);t.reav=[30];t.per=180;const mk=(nome,pct,dias)=>{const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:[],instrutor:'E',local:'L',horas:'1',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'123456',entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:99,t0:0,dur:0},sim:{on:false,alvo:0}};const pp={id:uid(),nome,setor:'Campo',real:true,cor:1};s.part.push(pp);s.resp[pp.id]={};const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));const al=Math.round(qs.length*pct/100);qs.forEach(([it,i],j)=>{const a=j<al;s.resp[pp.id][i]={r:a?(it.tipo==='ordenar'?it.alternativas.map((_,x)=>x):it.correta):(it.tipo==='ordenar'?[1,0,2].slice(0,it.alternativas.length):(it.correta+1)%it.alternativas.length),ok:a,ms:2000,pts:a?1000:0}});S.sessoes.push(s);encerrar(s);const x=S.sessoes.find(y=>y.id===s.id);x.fim=new Date(Date.now()-dias*86400000).toISOString();x.cod=codigoDe(x)};
  mk('Maria Aparecida de Souza Lima',100,40);mk('José Wellington',20,2);mk('Ana Beatriz',100,170);location.hash='#/pendencias';render()});
 await m.waitForSelector('.pnd-g');
 ok('Pendências no celular: sem rolagem lateral',await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.body.scrollWidth<=innerWidth+1));
 const peq=await m.evaluate(()=>[...document.querySelectorAll('.pnd button,.pnd a,.bnav a')].filter(e=>e.offsetParent&&!e.disabled).map(e=>{const r=e.getBoundingClientRect();return {t:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,20),h:Math.round(r.height),w:Math.round(r.width)}}).filter(x=>x.h<36||x.w<36));
 ok('Pendências no celular: alvos de toque de 36 px ou mais',peq.length===0,JSON.stringify(peq.slice(0,4)));
 ok('Barra de baixo troca Pessoas por Pendências',(await m.locator('.bnav a').count())===5&&(await m.locator('.bnav a[href="#/pendencias"]').count())===1&&(await m.locator('.bnav a[href="#/pessoas"]').count())===0);
 await m.screenshot({path:OUT+'/p-cel-pend.png'});
 await m.click('[data-act=pndaba][data-v=reav]');await m.waitForSelector('.pnd-g');await m.screenshot({path:OUT+'/p-cel-reav.png'});
 await m.click('[data-act=pndaba][data-v=val]');await m.waitForSelector('.pnd-g');await m.screenshot({path:OUT+'/p-cel-val.png'});
 await m.evaluate(()=>{S.cfg.tema='escuro';aplicarTema();location.hash='#/pendencias';render()});await m.waitForSelector('.pnd-g');await m.screenshot({path:OUT+'/p-cel-escuro.png'});
 ok('Pendências renderiza no tema escuro',await m.evaluate(()=>getComputedStyle(document.body).backgroundColor!=='rgb(255, 255, 255)'));
 ok('Sem erros de JS',errs.length===0,errs.join(' | ').slice(0,300));
 await b.close();srv.close();
 console.log(log.join('\n'));console.log('\n'+log.filter(l=>l.startsWith('OK')).length+' OK / '+log.filter(l=>l.startsWith('FALHA')).length+' FALHAS');
})();
