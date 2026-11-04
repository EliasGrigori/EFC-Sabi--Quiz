const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const D=process.argv[2],OUT=process.argv[3];
const srv=http.createServer((q,r)=>{let f=path.join(D,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}const t={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(b)})});
const log=[];const ok=(n,c,x='')=>{log.push((c?'OK   ':'FALHA ')+n+(x?' · '+x:''));};
(async()=>{
 await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true,serviceWorkers:'block'});
 const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('pageerror '+e.message));
 p.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
 await p.goto(U);await p.waitForSelector('.coach');
 // vazio
 ok('Início vazio mostra convite',(await p.textContent('.coach h2')).includes('Comece'));
 await p.screenshot({path:OUT+'/d-inicio-vazio.png'});
 // criar de modelo pelo diálogo
 await p.click('.tb [data-act=novo]');await p.click('[data-act=dlg][data-v=modelos]');
 ok('Diálogo lista 3 modelos',(await p.locator('#dlg .opcao').count())===3);
 await p.click('#dlg [data-act=usarmodelo] >> nth=0');
 await p.waitForTimeout(200);
 ok('Modelo criado aparece na tabela',(await p.locator('.tr:not(.h)').count())===1);
 // do zero
 await p.locator('.tb [data-act=novo], .tbar [data-act=novo]').first().click();await p.click('[data-act=dlg][data-v=zero]');
 await p.fill('#z-t','Calibração do pHmetro');await p.fill('#z-m','85');await p.click('#dlg button[type=submit]');
 await p.waitForTimeout(200);
 ok('Do zero vira rascunho',(await p.locator('.chip.warn').count())===1);
 ok('Aplicar do rascunho desativado',(await p.locator('.tr .b.p[aria-disabled=true]').count())===1);
 // excluir + desfazer
 const antes=await p.locator('.tr:not(.h)').count();
 await p.click('.tr:not(.h) >> nth=0 >> [data-act=excluir]');
 ok('Excluir remove',(await p.locator('.tr:not(.h)').count())===antes-1);
 await p.click('#tAcao');await p.waitForTimeout(150);
 ok('Desfazer restaura',(await p.locator('.tr:not(.h)').count())===antes);
 // busca
 await p.goto(U+'#/treinos');await p.fill('#busca','calib');
 ok('Busca filtra',(await p.locator('.tr:not(.h)').count())===1);
 await p.fill('#busca','');
 // filtro único + ordenar
 await p.click('[data-act=filtro]');await p.selectOption('#ord','nome');
 ok('Ordenar A-Z',(await p.locator('.tr:not(.h) .t b >> nth=0').textContent()).startsWith('Calib'));
 // cartões
 await p.click('[data-act=vista][data-v=cartoes]');ok('Vista cartões',(await p.locator('.card').count())===2);
 await p.click('[data-act=vista][data-v=lista]');
 // exportar + importar ida e volta
 const [dl]=await Promise.all([p.waitForEvent('download'),p.click('.tr:not(.h) >> nth=1 >> [data-act=exportar]')]);
 const fp=OUT+'/exp.json';await dl.saveAs(fp);const j=JSON.parse(fs.readFileSync(fp,'utf8'));
 ok('Exportou .json válido',j.sabia==='treinamento'&&Array.isArray(j.itens)&&j.itens.length>0,dl.suggestedFilename());
 await p.setInputFiles('#arq',fp);await p.waitForTimeout(300);
 ok('Importou de volta',(await p.locator('.tr:not(.h)').count())===3);
 // importar JSON ruim
 fs.writeFileSync(OUT+'/ruim.json','{"a":1}');await p.setInputFiles('#arq',OUT+'/ruim.json');await p.waitForTimeout(200);
 ok('JSON inválido recusado',(await p.textContent('#toast')).includes('não parece'));
 // XSS no título
 await p.locator('.tb [data-act=novo], .tbar [data-act=novo]').first().click();await p.click('[data-act=dlg][data-v=zero]');
 await p.fill('#z-t','<img src=x onerror=window.__x=1>');await p.click('#dlg button[type=submit]');await p.waitForTimeout(200);
 ok('Título com HTML é escapado',(await p.evaluate(()=>window.__x))===undefined);
 // aplicar
 await p.click('.tr:not(.h) .b.p:not([aria-disabled]) >> nth=0');await p.waitForSelector('.apl');
 await p.screenshot({path:OUT+'/d-aplicar.png'});
 ok('Aplicar mostra 3 formatos',(await p.locator('.pr').count())===3);
 await p.click('.pr >> nth=1');
 ok('Preset ritmo marca sem ranking',(await p.locator('[data-aj=ranking]').isChecked())===false);
 await p.click('.sc >> nth=0');await p.click('.sc >> nth=1');
 await p.fill('#f-ins','José Elias');await p.fill('#f-loc','Refeitório');
 await p.click('details.adv summary');await p.check('[data-aj=teste]');
 ok('Resumo dos ajustes atualiza',(await p.textContent('#ajTxt')).includes('sessão de teste'));
 await p.screenshot({path:OUT+'/d-aplicar-ajustes.png'});
 await p.click('[data-act=preparar]');await p.waitForSelector('.coach');
 ok('Sessão guardada aparece em aberto no Início',(await p.locator('.mini .row .b:has-text("Abrir sala")').count())===1);
 // persistência
 await p.reload();await p.waitForSelector('.coach');
 ok('Dados sobrevivem ao reload',(await p.locator('.kp:nth-child(1) .v').textContent())==='4');
 await p.screenshot({path:OUT+'/d-inicio.png'});
 // ajustes + tema
 await p.goto(U+'#/ajustes');await p.click('[data-act=tema][data-v=escuro]');
 ok('Tema escuro aplicado',(await p.getAttribute('html','data-theme'))==='dark');
 await p.screenshot({path:OUT+'/d-ajustes-escuro.png'});
 await p.fill('#c-set','Estufa');await p.click('[data-form=setor] button');
 ok('Setor adicionado',(await p.locator('.sc:has-text("Estufa")').count())===1);
 await p.click('[data-act=tema][data-v=claro]');
 // futuras
 for(const r of['pessoas','mensagens','relatorios','conferir']){await p.goto(U+'#/'+r);ok('Página '+r+' abre',(await p.locator('.road').count())===1);}
 // rota inválida
 await p.goto(U+'#/xyz');await p.waitForTimeout(150);ok('Rota inválida volta ao Início',p.url().endsWith('#/inicio'));
 // celular
 const m=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,serviceWorkers:'block'});
 const q=await m.newPage();q.on('pageerror',e=>errs.push('mobile '+e.message));
 await q.goto(U+'?demo=1');await q.waitForSelector('.coach');
 await q.screenshot({path:OUT+'/m-inicio.png'});
 ok('Celular: sem rolagem lateral',await q.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 ok('Celular: menu inferior visível',await q.locator('#bnav').isVisible());
 await q.goto(U+'#/treinos');await q.screenshot({path:OUT+'/m-treinos.png'});
 await q.click('.tr:not(.h) .b.p >> nth=0');await q.waitForSelector('.apl');await q.screenshot({path:OUT+'/m-aplicar.png',fullPage:true});
 ok('Celular aplicar: sem rolagem lateral',await q.evaluate(()=>document.querySelector('#app').scrollWidth<=document.querySelector('#app').clientWidth+1));
 // alvos de toque
 const peq=await q.evaluate(()=>[...document.querySelectorAll("button,a.b,input:not([type=hidden]):not([type=checkbox]),select,.bnav a")].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<36||r.width<36)}).map(e=>e.className+'|'+e.textContent.trim().slice(0,15)));
 ok('Celular: alvos de toque >=36px',peq.length===0,peq.slice(0,5).join(' ; '));
 // demo desktop
 await p.goto(U+'?demo=1');
 ok('Sem erros de JS',errs.length===0,errs.join(' | '));
 await b.close();srv.close();
 console.log(log.join('\n'));
})();
