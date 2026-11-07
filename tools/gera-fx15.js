/* gera os PDFs de exemplo da v1.5.0 (sem dados reais): slides deitados com título e um manual com marcadores */
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
const sl=[['Higiene das mãos','Por que lavar as mãos antes de colher'],['Lavagem das mãos','Molhe, ensaboe por 20 segundos, enxágue e seque'],['Uso de luvas','Troque a luva rasgada na hora'],['Ferramentas limpas','Lave a faca no fim de cada fileira'],['Resumo','Mãos limpas, fruta segura']];
const cores=['#0E4A48','#C85A1E','#2F6B3A','#6A3D8F','#1F4E79'];
await p.setContent(`<style>@page{size:1280px 720px;margin:0}body{margin:0;font-family:Arial}section{width:1280px;height:720px;page-break-after:always;box-sizing:border-box;padding:70px;color:#fff}h1{font-size:72px;margin:0 0 30px}p{font-size:36px}</style>`+sl.map((x,i)=>`<section style="background:${cores[i]}"><h1>${x[0]}</h1><p>${x[1]}</p><p style="font-size:22px">Slide ${i+1}</p></section>`).join(''));
await p.pdf({path:'fx15/slides.pdf',width:'1280px',height:'720px',printBackground:true});
await p.setContent(`<style>body{font-family:Arial;font-size:16px}h1{page-break-before:always;font-size:30px}h1:first-child{page-break-before:auto}</style><h1>Introdução</h1><p>${'Texto do manual. '.repeat(80)}</p><h1>Equipamentos</h1><p>${'Use os equipamentos certos. '.repeat(80)}</p><h1>Procedimento</h1><p>${'Siga cada passo. '.repeat(80)}</p><h1>Registros</h1><p>${'Anote no formulário. '.repeat(60)}</p>`);
await p.pdf({path:'fx15/manual-marcadores.pdf',format:'A4',outline:true,tagged:true,printBackground:true});
await b.close();
for(const f of ['slides.pdf','manual-marcadores.pdf'])console.log(f,fs.statSync('fx15/'+f).size);})();
