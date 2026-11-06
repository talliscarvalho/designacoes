/* ================= Painel: letra maior e instalar como aplicativo ================= */
const FONTES=[[1,'A'],[1.15,'A+'],[1.3,'A++']];
function fonteGet(){try{const v=+localStorage.getItem('vmc-fonte');return FONTES.some(f=>f[0]===v)?v:1}catch(e){return 1}}
function fonteApply(){document.documentElement.style.setProperty('--pz',String(fonteGet()))}
fonteApply();
let instalarEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();instalarEvt=e;instalarBox()});
window.addEventListener('appinstalled',()=>{instalarEvt=null;try{localStorage.setItem('vmc-instalado','1')}catch(e){}ui.instForcar=false;instalarBox();toast('Aplicativo instalado')});
const ehIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const ehApp=()=>window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
/* navegador "embutido" (aberto de dentro do WhatsApp, Instagram, Facebook...): não deixa instalar */
const ehEmbutido=()=>/; wv\)|WhatsApp|FBAN|FBAV|Instagram|Line\//i.test(navigator.userAgent);
const ehAndroid=()=>/Android/i.test(navigator.userAgent);
const ehSamsung=()=>/SamsungBrowser/i.test(navigator.userAgent);
function instalarTexto(){
  if(ehIOS())return['Coloque na tela inicial','No <b>Safari</b>, toque no botão <b>Compartilhar</b> (o quadrado com a seta para cima) e depois em <b>Adicionar à Tela de Início</b>. Na primeira vez que abrir pelo ícone, entre de novo com a sua conta.'];
  if(ehEmbutido())return['Abra no navegador para instalar','Você abriu o link de dentro de outro aplicativo (como o WhatsApp), que não permite instalar. Toque nos <b>três pontinhos ⋮</b> no alto e em <b>Abrir no Chrome</b> (ou <b>Abrir no navegador</b>). Lá aparece a opção de instalar.'];
  if(ehAndroid()&&ehSamsung())return['Instale no celular','No <b>Samsung Internet</b>, toque no menu <b>≡</b> (embaixo, à direita), depois em <b>Adicionar página a</b> › <b>Tela inicial</b>. Se aparecer um ícone de download na barra de endereço, também pode tocar nele.'];
  if(ehAndroid())return['Instale no celular','No <b>Chrome</b>, toque nos <b>três pontinhos ⋮</b> (no alto, à direita) e em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b> › <b>Instalar</b>.'];
  return['Instale no computador','No <b>Chrome</b> ou no <b>Edge</b>, clique no ícone de instalar no fim da barra de endereço (um monitor com uma seta) ou, no menu, em <b>Instalar Designar</b>.']}
function instalarCard(forcar){if(!window.FBX||ehApp())return'';let ok=false;try{ok=localStorage.getItem('vmc-instalar-fechado')==='1'}catch(e){}if(ok&&!forcar)return'';
  if(instalarEvt)return`<div class="instcard"><div><b>Instale como aplicativo</b><span>Ele fica na tela inicial, com ícone próprio, e abre direto, como um aplicativo.</span></div><div class="instacts"><button class="btn small primary" data-a="instalar">Instalar</button><button class="btn small ghost" data-a="instfechar">Agora não</button></div></div>`;
  const [t,d]=instalarTexto();
  return`<div class="instcard"><div><b>${t}</b><span>${d}</span></div><div class="instacts"><button class="btn small ghost" data-a="instfechar">Entendi</button></div></div>`}
/* aparece no topo de qualquer tela até a pessoa instalar ou tocar em "Entendi"; depois, fica no menu da conta */
function instalarBox(){const b=$('#instBox');if(!b)return;const h=window.FBX&&window.FBX.email?instalarCard(ui.instForcar):'';b.innerHTML=h;b.hidden=!h;if(typeof avisoBox==='function')avisoBox()}
Object.assign(PACTS,{
  fonte:b=>{try{localStorage.setItem('vmc-fonte',b.dataset.v)}catch(e){}fonteApply();rPainel()},
  instalar:async()=>{if(!instalarEvt)return;instalarEvt.prompt();try{await instalarEvt.userChoice}catch(e){}instalarEvt=null;instalarBox()},
  instmenu:()=>{const m=$('#contaMenu');if(m)m.hidden=true;ui.instForcar=true;instalarBox();window.scrollTo({top:0,behavior:'smooth'})},
  instfechar:()=>{try{localStorage.setItem('vmc-instalar-fechado','1')}catch(e){}ui.instForcar=false;instalarBox()}});
