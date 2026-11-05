const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path'),cp=require('child_process');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
const sh=(c)=>{try{return cp.execSync(c,{encoding:'utf8',stdio:['ignore','pipe','pipe']})}catch(e){return 'ERRO '+(e.stdout||'')+(e.stderr||'')}};
(async()=>{
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true,serviceWorkers:'block'});
 const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
 // ---- sem sessões
 await p.evaluate(()=>{location.hash='#/relatorios'});await p.waitForSelector('.rel');
 ok('Relatórios vazio explica',(await p.innerText('.rel')).includes('Nenhuma sessão encerrada'));
 // ---- monta uma sessão real e encerra de verdade pelo encerrar()
 const info=await p.evaluate(()=>{
  const jpg=(w,h,txt)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='#123';x.lineWidth=3;x.beginPath();x.moveTo(10,h-20);x.bezierCurveTo(60,10,120,h,w-20,20);x.stroke();return c.toDataURL('image/jpeg',0.6)};
  const t=S.treinamentos[0];fixarVersao(t);
  const nomes=[['Maria Aparecida Silva','Packing',1],['José Wellington','Campo',1],['Ana Beatriz','Packing',0.5],['Carlos Eduardo','Campo',0],['=cmd|calc!A1','Qualidade',1],['Luiza Souza','Packing',0.75]];
  const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:['Packing','Campo'],instrutor:'Elias Beserra',local:'Refeitório',horas:'1.5',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'482913',entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:t.itens.length,t0:0,dur:0},sim:{on:false,alvo:0}};
  const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));
  nomes.forEach(([n,st,hab],k)=>{const p={id:uid(),nome:n,setor:st,real:true,cor:k%8};if(k!==3)p.ass=jpg(300,120);s.part.push(p);s.resp[p.id]={};
   qs.forEach(([it,i],j)=>{if(k===3&&j>0)return;const acerta=((j*7+k*3)%10)/10<hab;let r;if(it.tipo==='ordenar')r=acerta?it.alternativas.map((_,x)=>x):it.alternativas.map((_,x)=>it.alternativas.length-1-x);else r=acerta?it.correta:((it.correta+1)%it.alternativas.length);s.resp[p.id][i]={r,ok:acerta,ms:3000+k*700+j*300,pts:acerta?1000:0}});});
  S.sessoes.push(s);encerrar(s);
  return {id:s.id,nq:qs.length,titulo:s.titulo,meta:s.meta,cod:S.sessoes.find(x=>x.id===s.id).cod,estado:S.sessoes.find(x=>x.id===s.id).estado,tp:S.sessoes.find(x=>x.id===s.id).aj.teste};
 });
 ok('Encerrar guarda código de conferência',/^SAB-[0-9A-F]{4}(-[0-9A-F]{4}){4}$/.test(info.cod),info.cod);
 ok('Sessão fica encerrada',info.estado==='encerrada');
 // ---- Encerradas tem link para o relatório
 await p.evaluate(()=>{UI.aba='encerradas';location.hash='#/treinos';render()});await p.waitForSelector('a[href^="#/relatorios/"]');
 ok('Encerradas mostra o botão Relatório',true);await p.screenshot({path:OUT+'/r-encerradas.png'});
 await p.click('a[href^="#/relatorios/"]');await p.waitForSelector('.rl-top');
 const txt=await p.innerText('.rel');
 ok('Relatório mostra indicadores',/Nota média/.test(txt)&&/Atingiram a meta/.test(txt)&&/Acerto geral/.test(txt)&&/Tempo médio/.test(txt));
 ok('Relatório mostra o código',txt.includes(info.cod));
 ok('Tabela com 6 pessoas',(await p.locator('.rtb tbody tr').count())===6);
 ok('Assinaturas aparecem (5 de 6)',(await p.locator('.asm').count())===5);
 ok('O que fazer agora cita abaixo da meta e sem assinatura',/abaixo da meta/.test(txt)&&/sem assinatura/.test(txt));
 await p.waitForTimeout(3700);await p.screenshot({path:OUT+'/r-resumo.png'});
 // ordenar
 await p.click('[data-act=relord][data-v=nome]');
 const primeiro=await p.innerText('.rtb tbody tr:first-child td:first-child');
 ok('Ordenar por nome (A a Z) põe a primeira em cima',primeiro.startsWith('=cmd')||primeiro.startsWith('Ana'),primeiro);
 // ver assinatura
 await p.click('.asm >> nth=0');await p.waitForSelector('#dlg[open] .assg img');ok('Ver assinatura abre a imagem',true);await p.keyboard.press('Escape');
 // abas
 await p.click('[data-act=relaba][data-v=mapa]');await p.waitForSelector('.mp');
 ok('Mapa da turma: uma linha por pessoa e uma coluna por pergunta',(await p.locator('.mp tbody tr').count())===6&&(await p.locator('.mp thead th.mc').count())===info.nq);
 ok('Mapa: tem acertos, erros e sem resposta',(await p.locator('td.mc.ok').count())>0&&(await p.locator('td.mc.no').count())>0&&(await p.locator('td.mc.nr').count())>0);
 await p.waitForTimeout(300);await p.screenshot({path:OUT+'/r-mapa.png'});
 await p.click('[data-act=relaba][data-v=pergunta]');await p.waitForSelector('.aslist');
 ok('Assertividade lista as perguntas',(await p.locator('.as').count())===info.nq);
 await p.click('[data-act=relas][data-v=dificil]');
 const pcts=await p.$$eval('.as .ap',els=>els.map(e=>parseInt(e.innerText)));
 ok('Mais difíceis primeiro ordena do menor para o maior',pcts.every((v,i)=>i===0||v>=pcts[i-1]),pcts.join(','));
 await p.screenshot({path:OUT+'/r-perguntas.png'});
 await p.click('[data-act=relaba][data-v=setor]');await p.waitForSelector('.sb');
 ok('Setores mostra 3 setores',(await p.locator('.rtb tbody tr').count())===3);
 await p.screenshot({path:OUT+'/r-setores.png'});
 await p.click('[data-act=relaba][data-v=resumo]');
 // ---- foto da turma
 const foto=OUT+'/foto.jpg';
 await p.evaluate(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1000;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,1600,1000);g.addColorStop(0,'#0E4A48');g.addColorStop(1,'#D45D17');x.fillStyle=g;x.fillRect(0,0,1600,1000);x.fillStyle='#fff';x.font='80px sans-serif';x.fillText('Turma',100,200);window.__foto=c.toDataURL('image/jpeg',0.9)});
 fs.writeFileSync(foto,Buffer.from((await p.evaluate(()=>window.__foto)).split(',')[1],'base64'));
 await p.setInputFiles('#rl-foto',foto);await p.waitForFunction(()=>!!sessaoRel(REL.sid).foto,null,{timeout:8000});
 ok('Foto da turma é guardada e reduzida',(await p.evaluate(()=>sessaoRel(REL.sid).foto.length))<460000);
 ok('Resumo passa a mostrar foto guardada',(await p.innerText('.acoes')).includes('Foto da turma guardada'));
 // ---- logotipo
 await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#c-logo');
 const logo=OUT+'/logo.png';
 await p.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=150;const x=c.getContext('2d');x.fillStyle='#0E4A48';x.beginPath();x.arc(75,75,60,0,7);x.fill();x.fillStyle='#D45D17';x.fillRect(160,50,200,50);window.__logo=c.toDataURL('image/png')});
 fs.writeFileSync(logo,Buffer.from((await p.evaluate(()=>window.__logo)).split(',')[1],'base64'));
 await p.setInputFiles('#c-logo',logo);await p.waitForSelector('.logo-pv');
 ok('Logotipo é guardado e aparece em Ajustes',(await p.evaluate(()=>S.cfg.logo.startsWith('data:image/jpeg'))));await p.waitForTimeout(3600);await p.screenshot({path:OUT+'/r-ajustes.png'});
 await p.fill('#c-emp','MERI POBO · Fazenda Matriz');
 await p.evaluate(()=>{location.hash='#/relatorios/'+REL.sid});await p.waitForSelector('.rl-top');
 // ---- downloads
 async function baixa(sel,nome){if(sel.includes('relcsv')||sel.includes('reljson'))await p.evaluate(()=>{document.querySelector('.mais').open=true});const [d]=await Promise.all([p.waitForEvent('download'),p.click(sel)]);const f=OUT+'/'+nome;await d.saveAs(f);return {f,nome:d.suggestedFilename()}}
 const reg=await baixa('[data-act=relpdf]','registro.pdf');
 ok('PDF de registro tem nome com título e data',/^registro-.+-\d{4}-\d{2}-\d{2}\.pdf$/.test(reg.nome),reg.nome);
 const q1=sh(`qpdf --check ${reg.f} 2>&1 | tail -3`);ok('PDF de registro é válido (qpdf)',/No syntax or stream encoding errors/.test(q1),q1.trim().split('\n').pop());
 const t1=sh(`pdftotext -layout ${reg.f} -`);
 ok('PDF registro: título, instrutor e local',t1.includes('Registro de treinamento')&&t1.includes('Elias Beserra')&&t1.includes('Refeitório'));
 ok('PDF registro: acentos corretos',t1.includes('Maria Aparecida Silva')&&t1.includes('José Wellington')&&t1.includes('Situação'));
 ok('PDF registro: código no rodapé',t1.includes(info.cod));
 ok('PDF registro: empresa do cabeçalho',t1.includes('MERI POBO'));
 ok('PDF registro: nome malicioso sai como texto',t1.includes('=cmd|calc!A1'));
 const pi=sh(`pdfimages -list ${reg.f}`);const nimg=(pi.match(/\bimage\b/g)||[]).length;
 ok('PDF registro: logotipo, foto e assinaturas embutidos',nimg>=3,pi.trim().split('\n').length+' linhas');
 sh(`pdftoppm -r 100 -png ${reg.f} ${OUT}/pdfreg`);
 const pres=await baixa('[data-act=relpres]','presenca.pdf');
 ok('Lista de presença tem nome certo',/^presenca-.+\.pdf$/.test(pres.nome),pres.nome);
 ok('Lista de presença é válida (qpdf)',/No syntax or stream encoding errors/.test(sh(`qpdf --check ${pres.f} 2>&1`)));
 const t2=sh(`pdftotext -layout ${pres.f} -`);
 ok('Lista de presença: carga horária e instrutor',t2.includes('1,5 h')&&t2.includes('Assinatura do instrutor: Elias Beserra'));
 ok('Lista de presença: pessoa sem assinatura marcada',t2.includes('sem assinatura'));
 ok('Lista de presença: mesmo código',t2.includes(info.cod));
 sh(`pdftoppm -r 100 -png ${pres.f} ${OUT}/pdfpres`);
 const csv=await baixa('[data-act=relcsv]','resultado.csv');const ct=fs.readFileSync(csv.f,'utf8');
 ok('Planilha começa com BOM e usa ponto e vírgula',ct.charCodeAt(0)===0xFEFF&&ct.includes('Nome;Setor;Acertos'));
 ok('Planilha neutraliza fórmula no nome',ct.includes("'=cmd|calc!A1")&&!/(^|;)=cmd/m.test(ct));
 ok('Planilha tem uma linha por pessoa',ct.trim().split(/\r?\n/).filter(l=>/;(Atingiu|Abaixo|Não respondeu)/.test(l)).length===6);
 const js=await baixa('[data-act=reljson]','sessao.json');const jo=JSON.parse(fs.readFileSync(js.f,'utf8'));
 ok('Sessão .json traz o código e os dados',jo.sabia==='sessao'&&jo.codigo===info.cod&&jo.sessao.part.length===6);
 // ---- abrir/imprimir
 await p.evaluate(()=>{document.querySelector('.mais').open=true});const [pop]=await Promise.all([ctx.waitForEvent('page',{timeout:8000}).catch(()=>null),p.click('[data-act=relabrir]')]);
 ok('Imprimir abre o PDF em outra aba',!!pop);if(pop)await pop.close().catch(()=>{});
 // ---- conferir
 await p.evaluate(()=>{location.hash='#/conferir'});await p.waitForSelector('#cf-c');
 ok('Conferir lista a sessão como íntegra',(await p.innerText('.rtb')).includes('Íntegro'));
 await p.fill('#cf-c',info.cod.toLowerCase().replace(/-/g,' '));await p.click('.cf-f button[type=submit]');
 await p.waitForSelector('.cf-r.ok');ok('Código correto confere (mesmo digitado em minúsculas e com espaços)',(await p.innerText('.cf-r')).includes('Registro confere'));
 await p.screenshot({path:OUT+'/r-conferir.png'});
 await p.fill('#cf-c','SAB-0000-0000-0000-0000-0000');await p.click('.cf-f button[type=submit]');await p.waitForSelector('.cf-r.no');
 ok('Código desconhecido é recusado',(await p.innerText('.cf-r')).includes('Nenhuma sessão'));
 await p.fill('#cf-c','abc');await p.click('.cf-f button[type=submit]');await p.waitForFunction(()=>document.querySelector('.cf-r')&&document.querySelector('.cf-r').innerText.includes('inválido'));
 ok('Código em formato errado é explicado',true);
 // arquivo exportado
 await p.setInputFiles('#cf-arq',js.f);await p.waitForSelector('.cf-r.ok');ok('Arquivo de sessão confere',(await p.innerText('.cf-r')).includes('O arquivo confere'));
 jo.sessao.part[0].nome='Fulano Adulterado';fs.writeFileSync(OUT+'/adulterado.json',JSON.stringify(jo));
 await p.setInputFiles('#cf-arq',OUT+'/adulterado.json');await p.waitForSelector('.cf-r.no');ok('Arquivo adulterado é denunciado',(await p.innerText('.cf-r')).includes('foi alterado'));
 fs.writeFileSync(OUT+'/lixo.json','{"a":1}');await p.setInputFiles('#cf-arq',OUT+'/lixo.json');await p.waitForFunction(()=>document.querySelector('.cf-r')&&document.querySelector('.cf-r').innerText.includes('Não consegui ler'));ok('Arquivo qualquer não quebra',true);
 // adulterar dados guardados
 await p.evaluate(()=>{const s=S.sessoes.find(x=>x.estado==='encerrada');s.part[1].nome='Pessoa Trocada'});
 await p.evaluate(()=>{render()});
 ok('Dado alterado depois de encerrar aparece como alterado',(await p.innerText('.rtb')).includes('Alterado depois de encerrar'));
 await p.screenshot({path:OUT+'/r-alterado.png'});
 await p.evaluate(()=>{const s=S.sessoes.find(x=>x.estado==='encerrada');s.part[1].nome='José Wellington';render()});
 ok('Voltando o dado, volta a ser íntegro',(await p.innerText('.rtb')).includes('Íntegro'));
 // sessão antiga sem código recebe código ao abrir
 const antigo=await p.evaluate(()=>{const s=clone(S.sessoes.find(x=>x.estado==='encerrada'));s.id=uid();delete s.cod;s.fim='2026-11-01T12:00:00.000Z';S.sessoes.unshift(s);return s.id});
 await p.evaluate((id)=>{location.hash='#/relatorios/'+id},antigo);await p.waitForSelector('.rl-top');
 ok('Sessão anterior à v0.5.0 recebe código marcado como gerado depois',(await p.innerText('.rl-cod')).includes('gerado depois'));
 await p.click('[data-act=relaba][data-v=pergunta]');await p.waitForSelector('.tmp');ok('Assertividade mostra a evolução entre sessões do mesmo treinamento',(await p.locator('.tl-s').count())===2);await p.waitForTimeout(3700);await p.screenshot({path:OUT+'/r-tempo.png'});await p.click('[data-act=relaba][data-v=resumo]');
 // ---- reaplicar
 await p.evaluate(()=>{location.hash='#/relatorios/'+S.sessoes.find(x=>x.estado==='encerrada'&&x.cod&&!x.codTardio).id});await p.waitForSelector('[data-act=reaplicar]');
 const abaixo=await p.evaluate(()=>estat(sessaoRel(REL.sid)).abaixo.map(p=>p.nome));
 await p.click('[data-act=reaplicar]');await p.waitForSelector('.reap');
 await p.waitForTimeout(3600);await p.screenshot({path:OUT+'/r-reaplicar.png'});ok('Reaplicar abre Aplicar com a lista de quem ficou abaixo',(await p.innerText('.reap')).includes(String(abaixo.length)+' nome'),abaixo.join('|'));
 await p.click('[data-act=preparar]');
 const sp=await p.evaluate(()=>S.sessoes.filter(x=>x.estado==='preparada').pop());
 ok('Sessão preparada leva a lista de nomes e a origem',sp.roster.length===abaixo.length&&!!sp.reaplicaDe);
 // ---- celular
 const m=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const q=await m.newPage();q.on('pageerror',e=>errs.push('cel '+e.message));
 await q.goto(U+'?demo=1');await q.waitForSelector('.coach');
 await q.evaluate((s)=>{S.sessoes.push(s);S.cfg.logo=null;salvar();location.hash='#/relatorios/'+s.id;render()},await p.evaluate(()=>S.sessoes.find(x=>x.estado==='encerrada'&&!x.codTardio)));
 await q.waitForSelector('.rl-top');
 for(const [aba,nome] of [['resumo','m-resumo'],['mapa','m-mapa'],['pergunta','m-perguntas'],['setor','m-setores']]){await q.click(`[data-act=relaba][data-v=${aba}]`);await q.waitForTimeout(150);
  const sw=await q.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);ok('Celular: '+aba+' sem rolagem lateral da página',sw<=1,'sobra '+sw+'px');await q.screenshot({path:OUT+'/'+nome+'.png',fullPage:false});}
 await q.evaluate(()=>{location.hash='#/conferir'});await q.waitForSelector('#cf-c');
 ok('Celular: Conferir sem rolagem lateral',(await q.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=1);await q.screenshot({path:OUT+'/m-conferir.png'});
 const tgt=await q.evaluate(()=>[...document.querySelectorAll('#app button,#app a.b,#app input,#app select')].filter(e=>e.offsetParent&&!e.classList.contains('sr')).map(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height)}).filter(v=>v<36).length);
 ok('Celular: alvos de toque >= 36px no Conferir',tgt===0,tgt+' pequenos');
 // ---- escuro
 await p.emulateMedia({colorScheme:'dark'});await p.evaluate(()=>{S.cfg.tema='escuro';aplicarTema();location.hash='#/relatorios/'+S.sessoes.find(x=>x.estado==='encerrada'&&!x.codTardio).id;render()});await p.waitForSelector('.rl-top');
 await p.click('[data-act=relaba][data-v=mapa]');await p.screenshot({path:OUT+'/r-escuro.png'});ok('Tema escuro renderiza',true);
 ok('Sem erros de JS',errs.length===0,errs.slice(0,3).join(' | '));
 await b.close();srv.close();
 console.log(log.join('\n'));console.log(log.filter(l=>l.startsWith('OK')).length+' OK / '+log.filter(l=>l.startsWith('FALHA')).length+' FALHAS');
})().catch(e=>{console.log(log.join('\n'));console.log('ERRO FATAL',e.message);process.exit(1)});
