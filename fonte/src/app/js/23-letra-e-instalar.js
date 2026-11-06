/* ================= Painel: letra maior e instalar como aplicativo ================= */
const FONTES=[[1,'A'],[1.15,'A+'],[1.3,'A++']];
function fonteGet(){try{const v=+localStorage.getItem('vmc-fonte');return FONTES.some(f=>f[0]===v)?v:1}catch(e){return 1}}
function fonteApply(){document.documentElement.style.setProperty('--pz',String(fonteGet()))}
fonteApply();
let instalarEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();instalarEvt=e;if(ui.tab==='painel')rPainel()});
window.addEventListener('appinstalled',()=>{instalarEvt=null;try{localStorage.setItem('vmc-instalado','1')}catch(e){}if(ui.tab==='painel')rPainel()});
const ehIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const ehApp=()=>window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function instalarCard(){if(!window.FBX||ehApp())return'';let ok=false;try{ok=localStorage.getItem('vmc-instalar-fechado')==='1'}catch(e){}if(ok)return'';
  if(instalarEvt)return`<div class="instcard"><div><b>Instale no celular</b><span>Ele fica na tela inicial, com ícone próprio, e abre direto, como um aplicativo.</span></div><div class="instacts"><button class="btn small primary" data-a="instalar">Instalar</button><button class="btn small ghost" data-a="instfechar">Agora não</button></div></div>`;
  if(ehIOS())return`<div class="instcard"><div><b>Coloque na tela inicial</b><span>No Safari, toque no botão <b>Compartilhar</b> (o quadrado com a seta para cima) e depois em <b>Adicionar à Tela de Início</b>. Na primeira vez que abrir pelo ícone, entre de novo com a sua conta.</span></div><div class="instacts"><button class="btn small ghost" data-a="instfechar">Entendi</button></div></div>`;
  return''}
Object.assign(PACTS,{
  fonte:b=>{try{localStorage.setItem('vmc-fonte',b.dataset.v)}catch(e){}fonteApply();rPainel()},
  instalar:async()=>{if(!instalarEvt)return;instalarEvt.prompt();try{await instalarEvt.userChoice}catch(e){}instalarEvt=null;rPainel()},
  instfechar:()=>{try{localStorage.setItem('vmc-instalar-fechado','1')}catch(e){}rPainel()}});
