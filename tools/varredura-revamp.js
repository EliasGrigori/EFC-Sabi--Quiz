/* Fase 0 do revamp: entra em cada tela e aba (PC e celular, claro e escuro), mede e tira print. Não muda nada. uso: node varredura-revamp.js <dist> <saida> */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const criaSessao=()=>{const t=S.treinamentos[0];fixarVersao(t);const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:['Packing','Campo'],instrutor:'Instrutor Teste',local:'Sala 1',horas:'1',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'111222',entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:t.itens.length,t0:0,dur:0},sim:{on:false,alvo:0}};
 const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));['Maria Silva','José Lima','Ana Souza','Carlos Rocha'].forEach((n,k)=>{const p={id:uid(),nome:n,setor:k%2?'Campo':'Packing',real:true,cor:k};s.part.push(p);s.resp[p.id]={};qs.forEach(([it,i],j)=>{const a=(j+k)%3>0;s.resp[p.id][i]={r:a?it.correta:(it.correta+1)%it.alternativas.length,ok:a,ms:3000,pts:a?1000:0}})});
 S.sessoes.push(s);encerrar(s);return s.id};
const medir=()=>{const app=document.getElementById('app')||document.body;const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};
 const els=[...document.querySelectorAll('body *')].filter(vis);
 const tam=new Set(els.filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>getComputedStyle(e).fontSize));
 const cantos=new Set(els.map(e=>getComputedStyle(e).borderTopLeftRadius).filter(x=>x!=='0px'&&!/%|999|50%/.test(x)&&parseFloat(x)<100));
 const bts=[...document.querySelectorAll('button,a.b,.b,input:not([type=hidden]),select,textarea,[role=button]')].filter(vis);
 const peq=bts.map(e=>Math.round(e.getBoundingClientRect().height)).filter(h=>h<(matchMedia('(pointer:coarse)').matches?44:28));
 const fam=new Set(els.map(e=>getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g,'')));
 const tr=els.filter(e=>{const c=getComputedStyle(e);return c.transitionProperty.split(',').some(p=>p.trim()==='all')&&parseFloat(c.transitionDuration)>0}).length;
 const h1=(document.querySelector('.tb h1')||document.querySelector('h1')||{}).textContent||'';
 const abas=[...document.querySelectorAll('.seg button,.abas button,[data-act=aba],[data-act=relaba],.pn-t button')].filter(vis).map(b=>b.textContent.trim()).slice(0,8);
 return {h1:h1.trim().slice(0,40),abas,tamanhos:tam.size,cantos:cantos.size,botoes:bts.length,abaixoDoMinimo:peq.length,fontes:[...fam].slice(0,4),transAll:tr,ladoMais:document.documentElement.scrollWidth-innerWidth,tabelas:document.querySelectorAll('table,.tbl').length,dialogo:!!document.querySelector('dialog[open]')}};
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const res=[];
for(const [ap,opt] of [['pc',{viewport:{width:1280,height:800}}],['cel',{viewport:{width:390,height:844},hasTouch:true,isMobile:true}]])for(const tema of ['light','dark']){
 const ctx=await b.newContext({...opt,colorScheme:tema,serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(U+'?demo=1');await p.waitForSelector('.coach');const sid=await p.evaluate(criaSessao);const tid=await p.evaluate(()=>S.treinamentos[0].id);const pid=await p.evaluate(()=>(S.pessoas&&S.pessoas[0]&&S.pessoas[0].id)||'');
 const telas=[['Início','#/inicio'],['Treinos · Ativos','#/treinos'],/* v1.6.0 parte 3: Treinos ficou sem abas (Encerradas foi para Relatórios, Reforço fica em Pendências) */
  ['Aplicar','#/aplicar/'+tid],['Editor','#/editar/'+tid],['Pendências','#/pendencias'],['Pessoas','#/pessoas'],['Mensagens','#/mensagens'],['Desafio','#/desafio'],['Mais','#/mais'],['Conferir','#/conferir'],['Ajustes','#/ajustes'],
  ['Relatórios (lista)','#/relatorios'],['Relatório · Resumo','#/relatorios/'+sid,()=>{REL.aba='resumo'}],['Relatório · Mapa','#/relatorios/'+sid,()=>{REL.aba='mapa'}],['Relatório · Assertividade','#/relatorios/'+sid,()=>{REL.aba='pergunta'}],['Relatório · Setores','#/relatorios/'+sid,()=>{REL.aba='setor'}]];
 for(const [n,h,pre] of telas){await p.evaluate(([h,pre])=>{if(pre)eval('('+pre+')')();location.hash=h;render()},[h,pre?pre.toString():null]);await p.waitForTimeout(250);
  const m=await p.evaluate(medir);res.push({ap,tema,tela:n,...m});const f=`${ap}-${tema==='light'?'claro':'escuro'}-${n.replace(/[^a-zA-Zà-ú]+/g,'-').toLowerCase()}.png`;await p.screenshot({path:path.join(OUT,f)});}
 // janelas
 for(const [n,fn] of [['Janela Novo','dlgNovo()'],['Janela Versões','location.hash="#/editar/'+tid+'";render();dlgVersoes()'],['Gaveta Painel','location.hash="#/editar/'+tid+'";render();dlgPainel()'],['Janela Banco','dlgBanco()'],['Janela IA','dlgIA()']]){
  try{await p.evaluate((fn)=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());eval(fn)},fn);await p.waitForTimeout(400);const m=await p.evaluate(medir);res.push({ap,tema,tela:n,...m});await p.screenshot({path:path.join(OUT,`${ap}-${tema==='light'?'claro':'escuro'}-${n.replace(/ /g,'-').toLowerCase()}.png`)});}catch(e){res.push({ap,tema,tela:n,erro:String(e).slice(0,80)})}
  await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));}
 res.push({ap,tema,tela:'(erros de console)',erros:errs.slice(0,3)});await ctx.close()}
fs.writeFileSync(path.join(OUT,'varredura.json'),JSON.stringify(res,null,1));
for(const r of res.filter(r=>r.ap==='pc'&&r.tema==='light'||r.erro||r.erros&&r.erros.length))console.log(JSON.stringify(r));
const cel=res.filter(r=>r.ap==='cel'&&r.tema==='light');console.log('CEL', cel.map(r=>r.tela+': pequenos '+r.abaixoDoMinimo+', lado '+r.ladoMais).join(' | '));
await b.close();srv.close()})();
