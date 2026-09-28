// Gera as peças do painel da Cakto no tamanho exato (deviceScaleFactor 1).
// Uso: PW=$(npm root -g)/playwright node render-pecas.cjs
const {chromium}=require(process.env.PW);const path=require('path');
const pecas=[
 ['info-principal','01-principal-info-300x500'],['info-calculadora','02-calculadora-info-300x500'],['info-52semanas','03-52semanas-info-300x500'],
 ['modulo-principal','01-principal-modulo-400x600'],['modulo-calculadora','02-calculadora-modulo-400x600'],['modulo-52semanas','03-52semanas-modulo-400x600'],
 ['banner-principal','01-principal-banner-1920x480'],['banner-calculadora','02-calculadora-banner-1920x480'],['banner-52semanas','03-52semanas-banner-1920x480'],
];
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:2100,height:1400},deviceScaleFactor:1});
 await p.goto('file://'+path.join(__dirname,'pecas-painel.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 for(const [id,n] of pecas){await p.locator('#'+id).screenshot({path:path.join(__dirname,'..','painel',n+'.png')});}
 await b.close();
})();
