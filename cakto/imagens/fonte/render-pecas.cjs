// Gera todas as imagens do painel e das capas quadradas.
// Renderiza em 4x e reduz com filtro Lanczos (Pillow) para o tamanho final:
// texto e bordas ficam mais nítidos do que uma captura direta em 1x.
// Uso: PW=$(npm root -g)/playwright node render-pecas.cjs
const {chromium}=require(process.env.PW);const path=require('path');const {execFileSync}=require('child_process');const fs=require('fs');
const ESCALA=4;
const tmp=path.join(require('os').tmpdir(),'pecas-hd');fs.mkdirSync(tmp,{recursive:true});
const painel=[
 ['produto-principal','01-principal-produto',300,250],['produto-calculadora','02-calculadora-produto',300,250],['produto-52semanas','03-52semanas-produto',300,250],
 ['info-principal','01-principal-info',300,500],['info-calculadora','02-calculadora-info',300,500],['info-52semanas','03-52semanas-info',300,500],
 ['modulo-principal','01-principal-modulo',400,600],['modulo-calculadora','02-calculadora-modulo',400,600],['modulo-52semanas','03-52semanas-modulo',400,600],
 ['banner-principal','01-principal-banner',1920,480],['banner-calculadora','02-calculadora-banner',1920,480],['banner-52semanas','03-52semanas-banner',1920,480],
];
const quadradas=[['principal','01-principal-quadrada',1080,1080],['calc','02-calculadora-quadrada',1080,1080],['semanas','03-52semanas-quadrada',1080,1080]];
async function lote(b,arquivo,itens,destino,com2x){
  const p=await b.newPage({viewport:{width:2200,height:1500},deviceScaleFactor:ESCALA});
  await p.goto('file://'+path.join(__dirname,arquivo));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
  for(const [id,nome,w,h] of itens){
    const hd=path.join(tmp,nome+'.png');
    await p.locator('#'+id).screenshot({path:hd});
    const saidas=[[w,h,`${nome}-${w}x${h}.png`]];
    if(com2x) saidas.push([w*2,h*2,`${nome}-${w}x${h}@2x.png`]);
    for(const [W,H,n] of saidas){
      execFileSync('python3',['-c',`from PIL import Image;im=Image.open(${JSON.stringify(hd)}).convert('RGB');im.resize((${W},${H}),Image.LANCZOS).save(${JSON.stringify(path.join(destino,n))},optimize=True)`]);
    }
  }
  await p.close();
}
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const painelDir=path.join(__dirname,'..','painel');const quadDir=path.join(__dirname,'..','quadradas');
  fs.mkdirSync(painelDir,{recursive:true});fs.mkdirSync(quadDir,{recursive:true});
  await lote(b,'pecas-painel.html',painel,painelDir,true);
  await lote(b,'capas.html',quadradas,quadDir,false);
  await b.close();console.log('ok');
})();
