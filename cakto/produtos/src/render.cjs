// Gera os PDFs a partir dos HTMLs. Uso: PW=$(npm root -g)/playwright node render.cjs
const {chromium}=require(process.env.PW);
const path=require('path');
const docs=[
  ['guia-principal.html','01-Reserva-de-Emergencia-do-Zero-Guia.pdf','Reserva de Emergência do Zero'],
  ['52-semanas.html','03-52-Semanas-de-Deposito-Crescente.pdf','52 Semanas de Depósito Crescente'],
  ['calculadora-como-usar.html','02-Calculadora-do-Seu-Numero-Como-Usar.pdf','Calculadora do Seu Número'],
];
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const only=process.argv[2];
  for(const [src,out,titulo] of docs){
    if(only && !src.startsWith(only)) continue;
    const p=await b.newPage();
    await p.goto('file://'+path.join(__dirname,src));
    await p.evaluate(()=>document.fonts.ready);
    await p.pdf({path:path.join(__dirname,'..','entregaveis',out),format:'A4',printBackground:true,preferCSSPageSize:true,
      displayHeaderFooter:true,headerTemplate:'<span></span>',
      footerTemplate:`<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5px;color:#8A8F8B;padding:0 20mm;display:flex;justify-content:space-between"><span>${titulo}</span><span class="pageNumber"></span></div>`});
    await p.close();console.log('ok',out);
  }
  await b.close();
})();
