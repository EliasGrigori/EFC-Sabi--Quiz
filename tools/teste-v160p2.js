/* v1.6.0 parte 2: respostas da parte 1 (P3, P5) e Fatia C (peças) + S05, S07, S08, S09, S13 do relatório de 15/11.
   uso: node teste-v160p2.js <dist> <prints>   — na v1.6.0 parte 1 tem de falhar; na parte 2 tem de passar. */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3]||'/tmp/r_v160p2';fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{let f=path.join(D,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
const bloco=async(nome,fn)=>{try{await fn()}catch(e){ok(nome+' (parou: a peça não existe ou não respondeu)',false,String(e.message).split('\n')[0].slice(0,120))}};
const vai=(p,h)=>p.evaluate(h=>{location.hash=h},h);
const PC={viewport:{width:1280,height:800}},CEL={viewport:{width:390,height:844},hasTouch:true,isMobile:true};
/* sessão encerrada inventada: 6 pessoas, algumas abaixo da meta (nomes fictícios) */
const criaSessao=()=>{const t=S.treinamentos[0];fixarVersao(t);
 const nomes=[['Maria Aparecida Silva','Packing',1],['José Wellington','Campo',1],['Ana Beatriz','Packing',0.5],['Carlos Eduardo','Campo',0],['Luiza Souza','Packing',0.75],['Pedro Henrique','Campo',0.6]];
 const s={id:uid(),treinoId:t.id,versao:t.versao,itens:clone(t.itens),preset:'aovivo',setores:['Packing','Campo'],instrutor:'Instrutor Teste',local:'Sala 1',horas:'1',aj:Object.assign({},AJ_PADRAO),estado:'sala',titulo:t.titulo,meta:t.meta,chave:'111222',entrada:true,part:[],resp:{},fase:{etapa:'podio',idx:t.itens.length,t0:0,dur:0},sim:{on:false,alvo:0}};
 const qs=s.itens.map((it,i)=>[it,i]).filter(([it])=>vale(it));
 nomes.forEach(([n,st,hab],k)=>{const p={id:uid(),nome:n,setor:st,real:true,cor:k%8};s.part.push(p);s.resp[p.id]={};
  qs.forEach(([it,i],j)=>{const a=((j*7+k*3)%10)/10<hab;let r;if(it.tipo==='ordenar')r=a?it.alternativas.map((_,x)=>x):it.alternativas.map((_,x)=>it.alternativas.length-1-x);else r=a?it.correta:((it.correta+1)%it.alternativas.length);s.resp[p.id][i]={r,ok:a,ms:3000+k*700,pts:a?1000:0}})});
 S.sessoes.push(s);encerrar(s);salvar();const el=document.getElementById('toast');el.hidden=true;clearTimeout(tToast);UI.aba='ativos';return s.id;};
(async()=>{await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();const errs=[];
 const novo=async(opt,nome,extra={})=>{const ctx=await b.newContext({...opt,serviceWorkers:'block',...extra});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(nome+' '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(nome+' '+m.text())});p.setDefaultTimeout(5000);return {ctx,p}};

 // ---------- P3: cor ao passar o mouse em 150 ms ----------
 await bloco('P3',async()=>{const {ctx,p}=await novo(PC,'p3');await p.goto(U+'?demo=1#/treinos');await p.waitForSelector('.tr:not(.h)');
  const bt='.tr:not(.h) [aria-label^="Editar"]';
  const d=await p.evaluate(q=>{const c=getComputedStyle(document.querySelector(q));return {pr:c.transitionProperty,du:c.transitionDuration}},bt);
  ok('P3: botões trocam cor, fundo e borda em 150 ms ao passar o mouse (como no EFCwork)',/border-color/.test(d.pr)&&/background-color/.test(d.pr)&&d.du.split(',').every(x=>['0.15s'].includes(x.trim())),JSON.stringify(d));
  await p.hover(bt);await p.waitForTimeout(40);
  ok('P3: ao passar o mouse, a troca acontece aos poucos (há transição rodando)',await p.evaluate(q=>document.querySelector(q).getAnimations().length>0,bt));
  await ctx.close();});

 // ---------- P5: Início sem a lista repetida ----------
 await bloco('Início',async()=>{const {ctx,p}=await novo(PC,'ini');await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  const v=await p.evaluate(()=>({tr:document.querySelectorAll('#app .tr').length,abas:document.querySelectorAll('#app .seg.abas').length,hs:[...document.querySelectorAll('#app .mini h3')].map(h=>h.textContent)}));
  ok('P5: Início sem a lista de Treinos (ela fica só em Treinos)',v.tr===0&&v.abas===0,JSON.stringify(v));
  ok('P5: Início com "Pede atenção" e "Últimas sessões"',v.hs.includes('Pede atenção')&&v.hs.includes('Últimas sessões'),v.hs.join(' | '));
  ok('P5: sem nada pendente, "Pede atenção" diz que está tudo em dia',await p.evaluate(()=>/Tudo em dia/.test(document.querySelector('.at').textContent)));
  const sid=await p.evaluate(criaSessao);await vai(p,'#/inicio');await p.waitForTimeout(300);
  const at=await p.evaluate(()=>[...document.querySelectorAll('.at')].map(s=>[...s.querySelectorAll('.at-l')].map(l=>l.textContent.replace(/\s+/g,' ').trim())));
  const nref=await p.evaluate(()=>pendencias().ref.length);
  ok('P5: com pessoas abaixo da meta, "Pede atenção" mostra quantas precisam de reforço',nref>0&&at[0].some(x=>new RegExp(nref+' pessoas? precisa').test(x)),nref+' · '+at[0].join(' | '));
  ok('P5: "Últimas sessões" mostra a sessão com o acerto',at[1].length===1&&/%/.test(at[1][0]),at[1].join(' | '));
  await p.click('.at-l[data-act=pndir][data-v=ref]');await p.waitForTimeout(350);
  ok('P5: tocar no reforço abre Pendências já na aba Reforço',await p.evaluate(()=>location.hash==='#/pendencias'&&document.querySelector('.pnd-abas [aria-pressed=true]').dataset.v==='ref'));
  await vai(p,'#/inicio');await p.waitForTimeout(300);await p.click(`.at-l[href="#/relatorios/${sid}"]`);await p.waitForTimeout(300);
  ok('P5: tocar na sessão abre o relatório dela',await p.evaluate(s=>location.hash==='#/relatorios/'+s,sid));
  await p.evaluate(()=>{S.cfg.perfil='colaborador';salvar();location.hash='#/inicio';render()});await p.waitForTimeout(300);
  const col=await p.evaluate(()=>({pnd:document.querySelectorAll('.at-l[href="#/mensagens"]').length,podeGerir:podeGerir()}));
  ok('Revisor 3: o perfil Colaborador não vê em "Pede atenção" telas que não pode abrir (Mensagens; Pendências ele abre para consultar desde a v1.6.0 parte 4)',!col.podeGerir&&col.pnd===0,JSON.stringify(col));
  await ctx.close();});

 // ---------- lista retrátil ----------
 await bloco('Lista retrátil',async()=>{const {ctx,p}=await novo(PC,'esc');await p.goto(U+'?demo=1');await p.waitForSelector('.coach');const t=await p.evaluate(()=>S.treinamentos[0].id);
  await vai(p,'#/ajustes');await p.waitForSelector('#aj-tema');
  ok('Ajustes: tema, telão e som viram lista retrátil (botão que abre a lista)',await p.evaluate(()=>['aj-tema','aj-telaoPadrao','aj-somPadrao'].every(id=>{const b=document.getElementById(id);return b&&b.getAttribute('aria-haspopup')==='listbox'})&&!document.querySelector('#aj-aparencia .seg, #aj-telao .seg')));
  ok('Lista fechada: as opções não aparecem nem recebem Tab',await p.evaluate(()=>getComputedStyle(document.getElementById('aj-tema-l')).visibility==='hidden'));
  await p.click('#aj-tema');await p.waitForTimeout(30);
  const ab=await p.evaluate(()=>{const l=document.getElementById('aj-tema-l');return {cls:l.className,exp:document.getElementById('aj-tema').getAttribute('aria-expanded'),an:l.getAnimations().length,foco:document.activeElement.getAttribute('aria-selected')}});
  ok('Abre crescendo do botão (lista retrátil com animação), com aria-expanded e o foco na opção escolhida',/is-open/.test(ab.cls)&&ab.exp==='true'&&ab.an>0&&ab.foco==='true',JSON.stringify(ab));
  await p.waitForTimeout(300);await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');
  ok('Setas movem entre as opções',await p.evaluate(()=>document.activeElement.dataset.v==='escuro'));
  await p.keyboard.press('Escape');await p.waitForTimeout(60);
  ok('Esc fecha a lista (com animação de saída) e devolve o foco ao botão',await p.evaluate(()=>{const l=document.getElementById('aj-tema-l');return !l.classList.contains('is-open')&&l.classList.contains('is-closing')&&document.activeElement.id==='aj-tema'}));
  await p.waitForTimeout(250);await p.click('#aj-tema');await p.waitForTimeout(250);await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');await p.waitForTimeout(300);
  ok('Revisor 1: escolher pelo teclado aplica e devolve o foco ao botão da lista',await p.evaluate(()=>S.cfg.tema==='claro'&&document.activeElement&&document.activeElement.id==='aj-tema'));
  await p.click('#aj-tema');await p.waitForTimeout(100);await p.evaluate(()=>{location.hash='#/pessoas'});await p.waitForTimeout(300);
  const tx=await p.evaluate(()=>{const i=document.createElement('input');i.id='tx-t';document.body.appendChild(i);i.focus();return true});await p.keyboard.type('abc');await p.keyboard.press('Home');await p.keyboard.type('X');
  ok('Revisor 2: lista aberta e a tela muda sem clique: as teclas voltam a funcionar',await p.evaluate(()=>{const v=document.getElementById('tx-t').value;document.getElementById('tx-t').remove();return v==='Xabc'}));
  await p.evaluate(()=>{location.hash='#/ajustes'});await p.waitForSelector('#aj-tema');await p.waitForTimeout(250);
  await p.click('#aj-tema');await p.click('#aj-tema-l [data-v=escuro]');await p.waitForTimeout(400);
  ok('Escolher "Escuro" aplica o tema e fecha a lista',await p.evaluate(()=>document.documentElement.getAttribute('data-tema')==='escuro'&&S.cfg.tema==='escuro'&&document.getElementById('aj-tema').getAttribute('aria-expanded')==='false'));
  await p.click('#aj-tema');await p.waitForTimeout(100);await p.click('#aj-ident h3');await p.waitForTimeout(200);
  ok('Tocar fora fecha a lista',await p.evaluate(()=>!document.getElementById('aj-tema-l').classList.contains('is-open')));
  await p.click('#aj-telaoPadrao');await p.click('[data-act=padrao][data-c=telaoPadrao][data-v=claro]');await p.waitForTimeout(250);
  ok('Telão ao aplicar: a escolha na lista grava como antes',await p.evaluate(()=>S.cfg.telaoPadrao==='claro'&&/Claro/.test(document.getElementById('aj-telaoPadrao').textContent)));
  await p.click('#aj-tema');await p.click('#aj-tema-l [data-v=claro]');await p.waitForTimeout(300);
  await vai(p,'#/aplicar/'+t);await p.waitForSelector('#apl-formato');
  ok('Aplicar: o formato vira lista retrátil com nome e explicação',await p.evaluate(()=>!document.querySelector('.pres')&&document.querySelectorAll('#apl-formato-l .esc-op').length===3&&/Você projeta/.test(document.getElementById('apl-formato').textContent)));
  await p.click('#apl-formato');await p.click('#apl-formato-l [data-v=ritmo]');await p.waitForTimeout(300);
  ok('Aplicar: escolher "No ritmo de cada um" muda o formato e desliga o ranking como antes',await p.evaluate(()=>UI.apl.preset==='ritmo'&&UI.apl.aj.ranking===false&&/No ritmo/.test(document.getElementById('apl-formato').textContent)));
  await ctx.close();});

 // ---------- situação, janelas, gaveta, aviso ----------
 await bloco('Peças',async()=>{const {ctx,p}=await novo(PC,'pecas');await p.goto(U+'?demo=1#/treinos');await p.waitForSelector('.tr:not(.h)');const t=await p.evaluate(()=>S.treinamentos[0].id);
  const ch=await p.evaluate(()=>{const c=document.querySelector('.chip.ok');const s=getComputedStyle(c),a=getComputedStyle(c,'::before');return {bg:s.backgroundColor,w:a.width,h:a.height,r:a.borderRadius}});
  ok('Situação "Pronto para aplicar": bolinha de 8 px + texto, sem caixa (R6)',ch.bg==='rgba(0, 0, 0, 0)'&&ch.w==='8px'&&ch.h==='8px'&&ch.r==='50%',JSON.stringify(ch));
  await vai(p,'#/editar/'+t);await p.waitForSelector('.edit');await p.click('[data-act=versoes]');await p.waitForTimeout(30);
  const j=await p.evaluate(()=>{const d=document.getElementById('dlg');return {open:d.open,an:d.getAnimations().length,op:+getComputedStyle(d).opacity}});
  ok('Janela (Versões) abre saindo do transparente e crescendo um pouco',j.open&&j.an>0&&j.op<1,JSON.stringify(j));
  await p.waitForTimeout(300);await p.keyboard.press('Escape');await p.waitForTimeout(60);
  const f=await p.evaluate(()=>{const d=document.getElementById('dlg');return {open:d.open,disp:getComputedStyle(d).display,op:+getComputedStyle(d).opacity}});
  ok('Janela fecha com movimento (fica na tela uns 150 ms sumindo)',!f.open&&f.disp!=='none'&&f.op<1,JSON.stringify(f));
  await p.waitForTimeout(250);ok('Depois some de vez',await p.evaluate(()=>getComputedStyle(document.getElementById('dlg')).display==='none'));
  await p.click('[data-act=painel]');await p.waitForTimeout(40);
  ok('Painel: gaveta entra deslizando da direita (400 ms)',await p.evaluate(()=>{const d=document.getElementById('dlg');return d.getAnimations().some(a=>a.effect.getTiming().duration===400||(a.transitionProperty==='transform'))}));
  await p.waitForTimeout(450);
  const g=await p.evaluate(()=>{const d=document.getElementById('dlg').getBoundingClientRect(),x=document.querySelector('.dl.pn [data-act=fechar]').getBoundingClientRect(),h=document.querySelector('.dl.pn h2').getBoundingClientRect();return {w:Math.round(d.width),dir:Math.round(d.right),xb:x.bottom,ht:h.top}});
  ok('Painel: gaveta de 420 px colada à direita, com o X acima do título (R8)',g.w===420&&g.dir===1280&&g.xb<=g.ht,JSON.stringify(g));
  await p.keyboard.press('Escape');await p.waitForTimeout(450);
  await p.evaluate(()=>aviso('Teste de aviso'));await p.waitForTimeout(30);
  const a=await p.evaluate(()=>{const e=document.getElementById('toast'),r=e.getBoundingClientRect();return {cls:e.className,props:e.getAnimations().map(x=>x.transitionProperty).sort().join(','),ty:new DOMMatrix(getComputedStyle(e).transform).m42,cx:Math.round(r.left+r.width/2)}});
  ok('Aviso entra subindo (transform), saindo do desfoque e do transparente, centralizado',/is-open/.test(a.cls)&&/transform/.test(a.props)&&/filter/.test(a.props)&&/opacity/.test(a.props)&&a.ty>0&&Math.abs(a.cx-640)<=2,JSON.stringify(a));
  await p.waitForTimeout(3600);
  ok('Aviso sai com movimento e depois some',await p.evaluate(()=>{const e=document.getElementById('toast');return !e.classList.contains('is-open')&&!e.hidden&&e.getAnimations().length>0}));
  await p.waitForTimeout(300);ok('…e some de vez',await p.evaluate(()=>document.getElementById('toast').hidden));
  await ctx.close();});
 await bloco('Gaveta no celular',async()=>{const {ctx,p}=await novo(CEL,'gcel');await p.goto(U+'?demo=1#/treinos');await p.waitForSelector('.tr:not(.h)');const t=await p.evaluate(()=>S.treinamentos[0].id);
  await vai(p,'#/editar/'+t);await p.waitForSelector('.edit');await p.click('[data-act=painel]');await p.waitForTimeout(500);
  const g=await p.evaluate(()=>{const d=document.getElementById('dlg').getBoundingClientRect();return {l:Math.round(d.left),w:Math.round(d.width),b:Math.round(d.bottom),ih:innerHeight}});
  ok('Painel no celular: folha que sobe de baixo, com a largura toda',g.l===0&&g.w===390&&g.b===g.ih,JSON.stringify(g));
  await ctx.close();});

 // ---------- itens do relatório ----------
 await bloco('S05',async()=>{for(const w of [768,900,1152]){const {ctx,p}=await novo({viewport:{width:w,height:1024}},'s05');await p.goto(U+'?demo=1#/treinos');await p.waitForSelector('.tr:not(.h)');
  const r=await p.evaluate(()=>{const row=document.querySelector('.tr:not(.h)'),t=row.querySelector('.t b').getBoundingClientRect(),lx=[...row.querySelectorAll('.acts > *')].pop().getBoundingClientRect(),tb=document.querySelector('.tbl').getBoundingClientRect();return {nome:Math.round(t.width),lix:Math.round(lx.right),tbl:Math.round(tb.right)}});
  ok(`S05 (${w} px): nome do treino inteiro e a lixeira dentro da tabela`,r.nome>=250&&r.lix<=r.tbl,JSON.stringify(r));await ctx.close();}});
 await bloco('S07',async()=>{const {ctx,p}=await novo({viewport:{width:844,height:390},hasTouch:true,isMobile:true},'s07');await p.goto(U+'?demo=1#/treinos');await p.waitForSelector('.tr:not(.h)');
  await p.mouse.move(600,300);await p.mouse.wheel(0,800);await p.waitForTimeout(300);
  const r=await p.evaluate(()=>({sy:scrollY,sh:document.documentElement.scrollHeight,ih:innerHeight,rail:getComputedStyle(document.getElementById('rail')).overflowY==='auto',topo:Math.round(document.getElementById('topo').getBoundingClientRect().bottom)}));
  ok('S07: celular deitado, a janela não rola, o menu rola por dentro',r.sy===0&&r.sh===r.ih&&r.rail,JSON.stringify(r));
  ok('S07 + R1: com pouca altura, o cabeçalho sobe junto com o conteúdo (a tela inteira fica para a lista)',r.topo<=0,JSON.stringify(r));await ctx.close();});
 await bloco('S08',async()=>{const {ctx,p}=await novo({viewport:{width:384,height:790},hasTouch:true,isMobile:true},'s08');await p.goto(U+'?demo=1#/treinos');await p.waitForSelector('.tr:not(.h)');const t=await p.evaluate(()=>S.treinamentos[0].id);
  await vai(p,'#/editar/'+t);await p.waitForSelector('.edit');await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const h=document.querySelector('#tb h1').getBoundingClientRect(),bs=[...document.querySelectorAll('#tb .tb-acts > .b')].map(b=>Math.round(b.getBoundingClientRect().top));return {w:Math.round(h.width),tops:bs}});
  ok('S08: no celular o título do Editor tem a largura da tela e os 3 botões ficam numa linha só',r.w>=240&&r.tops.length===3&&r.tops.every(x=>x===r.tops[0]),JSON.stringify(r));
  const cl=await p.evaluate(()=>{const s=document.querySelector('#tb .tb-h1'),h=document.querySelector('#tb h1');if(!s)return null;const lh=parseFloat(getComputedStyle(s).lineHeight);return {alt:Math.round(s.getBoundingClientRect().height),lh,corte:getComputedStyle(s).webkitLineClamp}});
  ok('Revisor 5: título longo no celular corta em 2 linhas inteiras, sem pedaço da 3ª',cl&&cl.corte==='2'&&cl.alt<=Math.ceil(cl.lh*2)+1,JSON.stringify(cl));
  ok('S08: o caminho no celular não começa com uma barra solta',await p.evaluate(()=>{const li=[...document.querySelectorAll('.tp-cam li')].filter(l=>getComputedStyle(l).display!=='none')[0];return getComputedStyle(li,'::before').content==='none'}));
  await ctx.close();});
 await bloco('S09',async()=>{const {ctx,p}=await novo(CEL,'s09');await p.goto(U+'?demo=1');await p.waitForSelector('.coach');const t=await p.evaluate(()=>S.treinamentos[0].id);const ruins=[];
  for(const h of ['#/inicio','#/treinos','#/editar/'+t,'#/aplicar/'+t,'#/pendencias','#/pessoas','#/mensagens','#/relatorios','#/conferir','#/ajustes']){await vai(p,h);await p.waitForTimeout(350);
   const r=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>1&&c.visibility!=='hidden'&&c.display!=='none'};return [...document.querySelectorAll('button,a[href]:not(p a):not(.sm a),input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea,[role=button]')].filter(vis).filter(e=>e.getBoundingClientRect().height<44).map(e=>(e.getAttribute('aria-label')||e.textContent).trim().slice(0,18)+' '+Math.round(e.getBoundingClientRect().height))});
   r.forEach(x=>ruins.push(h.split('/')[1]+': '+x));}
  ok('S09: no toque, nenhum botão, link ou campo abaixo de 44 px nas 10 telas',ruins.length===0,ruins.slice(0,5).join(' | '));
  await ctx.close();});
 await bloco('S13',async()=>{const {ctx,p}=await novo(CEL,'s13');await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  await p.evaluate(()=>{const t=S.treinamentos[0];UI.apl=null;location.hash='#/aplicar/'+t.id});await p.waitForSelector('[data-act=abrirsala], .b.p');
  await p.evaluate(()=>{const b=[...document.querySelectorAll('.b.p')].find(x=>/Abrir sala/.test(x.textContent));b&&b.click()});await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{const a=[...document.querySelectorAll('#app a[href="#/ajustes"]')][0];if(!a)return null;const c=getComputedStyle(a);return {cor:c.color,peso:c.fontWeight,sub:c.textDecorationThickness,off:c.textUnderlineOffset,disp:c.display}});
  ok('S13: o link "Ajustes" da Sala no estilo de link do app (cor, peso, sublinhado fino) e sem abrir buraco no texto',r&&r.cor==='rgb(125, 90, 28)'&&r.peso==='600'&&r.sub==='1px'&&r.off==='3px'&&r.disp==='inline',JSON.stringify(r));
  await ctx.close();});

 // ---------- regras fixas ----------
 await bloco('Regras',async()=>{const {ctx,p}=await novo(PC,'reg');await p.goto(U+'?demo=1');await p.waitForSelector('.coach');
  const ESC=[0,40,80,150,250,350,400,500];
  const r=await p.evaluate(ESC=>{const ruim=[];const anda=l=>{for(const x of l){if(x.cssRules&&!x.selectorText)anda(x.cssRules);if(!x.style||!x.selectorText)continue;if(!/esc-|#dlg|#toast|\.at-|\.sit|\.dot|\.chip\.|\.pn-t|gv-|sc-x/.test(x.selectorText))continue;
   [x.style.transitionDuration,x.style.animationDuration].filter(Boolean).join(',').split(',').map(s=>s.trim()).forEach(d=>{if(!d||/var\(/.test(d)||d==='auto'||d==='initial')return;const ms=/ms$/.test(d)?parseFloat(d):parseFloat(d)*1000;if(!ESC.includes(ms))ruim.push(x.selectorText+' '+d)});
   if(/transition[^;]*\ball\b/.test(x.cssText))ruim.push(x.selectorText+' all')}};for(const s of document.styleSheets)anda(s.cssRules);return ruim},ESC);
  ok('Peças novas: durações só da escala e nada de transition: all',r.length===0,r.slice(0,3).join(' | '));
  const t=await p.evaluate(()=>S.treinamentos[0].id);const lado=[];
  for(const [w,h] of [[1280,800],[390,844]]){await p.setViewportSize({width:w,height:h});for(const x of ['#/inicio','#/treinos','#/aplicar/'+t,'#/ajustes','#/editar/'+t]){await vai(p,x);await p.waitForTimeout(320);const d=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(d>0)lado.push(w+' '+x+' +'+d)}}
  ok('Nenhuma tela rola para o lado (1280 e 390 px)',lado.length===0,lado.join(' | '));
  await ctx.close();
  const c=await novo(PC,'rm',{reducedMotion:'reduce'});await c.p.goto(U+'?demo=1');await c.p.waitForSelector('.coach');const tt=await c.p.evaluate(()=>S.treinamentos[0].id);
  await vai(c.p,'#/editar/'+tt);await c.p.waitForSelector('.edit');await c.p.click('[data-act=versoes]');await c.p.waitForTimeout(30);
  ok('Com "movimento reduzido", a janela abre sem animar',await c.p.evaluate(()=>document.getElementById('dlg').getAnimations().length===0));
  await c.ctx.close();});
 ok('Console sem erro',errs.length===0,errs.slice(0,3).join(' | '));
 await b.close();srv.close();
 const nOk=log.filter(l=>l.startsWith('OK')).length;console.log(log.join('\n'));console.log(nOk+' OK de '+log.length+(nOk===log.length?'':' · ERRO'));process.exit(nOk===log.length?0:1);})();
