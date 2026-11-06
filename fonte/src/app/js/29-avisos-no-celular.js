/* ================= Avisos no celular (notificações) ================= */
/* Cada aparelho que ativar os avisos guarda em "avisos/{código}" quem é o dono do aparelho.
   Uma tarefa diária no GitHub (fonte/src/avisos/enviar.mjs) lê "quadro/agenda" e envia os lembretes
   uma semana antes e na véspera de cada designação. A agenda é mantida pelos editores e administradores. */
const fdb=()=>firebase.firestore();
const VAPID=((window.DESIGNAR_CONFIG||{}).vapid||'').trim();
const avisoSuporta=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const avisoLigado=()=>!!(window.FBX&&window.FBX.email&&VAPID&&window.isSecureContext);
const lsG=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsS=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
function avisoEstado(){if(ehIOS()&&!ehApp()&&!avisoSuporta())return'ios';if(!avisoSuporta()||ehEmbutido())return'sem';
  if(Notification.permission==='denied')return'negado';if(Notification.permission==='granted'&&lsG('vmc-aviso'))return'ativo';return'desligado'}
async function avisoReg(){let r=await navigator.serviceWorker.getRegistration();if(!r)r=await navigator.serviceWorker.register('sw.js');
  return await Promise.race([navigator.serviceWorker.ready,new Promise((_,no)=>setTimeout(()=>no(new Error('sw')),10000))])}
async function avisoMsg(){if(!(window.firebase&&firebase.messaging))await loadScript('lib/firebase-messaging-compat.js');return firebase.messaging()}
async function avisoGravar(tok){const F=window.FBX;await fdb().collection('avisos').doc(tok).set({quem:F.email,token:tok,em:F.ts(),aparelho:navigator.userAgent.slice(0,180)});lsS('vmc-aviso',tok);lsS('vmc-aviso-dia',iso(new Date()))}
function avisoCard(){const st=avisoEstado();const forc=ui.avisoForcar;
  if(!forc){if(st!=='desligado'||lsG('vmc-aviso-fechado')==='1')return'';
    /* sugestão automática: no aplicativo instalado, ou para o publicador; nunca junto com o aviso de instalar */
    if(!(ehApp()||painelOnly()))return'';if(!$('#instBox')||!$('#instBox').hidden)return''}
  const fechar=`<button class="btn small ghost" data-a="avisofechar">${st==='desligado'?'Agora não':'Fechar'}</button>`;
  const T={desligado:['Receba avisos das suas designações','O celular avisa <b>uma semana antes</b> e <b>na véspera</b> de cada designação, mesmo com o aplicativo fechado.',`<button class="btn small primary" data-a="avisoativar">Ativar avisos</button>`],
    ativo:['Avisos ativados neste aparelho','Você recebe aqui os lembretes das suas designações (uma semana antes e na véspera).'+(['admin'].includes(window.FBX.papel)?' Como administrador, também é avisado de novos pedidos de acesso.':''),`<button class="btn small" data-a="avisodesativar">Desativar</button>`],
    negado:['Os avisos estão bloqueados','O navegador está bloqueando as notificações deste site. Para liberar no Android: segure o ícone do aplicativo › <b>Informações do app</b> › <b>Notificações</b> › ativar. No navegador: toque no cadeado ao lado do endereço › <b>Permissões</b> › <b>Notificações</b>. Depois, volte aqui e toque em <b>Ativar avisos</b>.',''],
    ios:['Instale o aplicativo primeiro','No iPhone, os avisos só funcionam com o aplicativo na tela de início (iOS 16.4 ou mais novo). No Safari, toque em <b>Compartilhar</b> › <b>Adicionar à Tela de Início</b>, abra pelo ícone e ative os avisos no menu da sua conta.',''],
    sem:['Este navegador não recebe avisos','Abra o sistema no <b>Chrome</b> (ou no Samsung Internet), de preferência instalado como aplicativo, e ative os avisos no menu da sua conta.','']}[st];
  return`<div class="instcard"><div><b>${T[0]}</b><span>${T[1]}</span></div><div class="instacts">${T[2]}${fechar}</div></div>`}
function avisoBox(){const b=$('#avisoBox');if(!b)return;const h=avisoLigado()?avisoCard():'';if(b.innerHTML!==h)b.innerHTML=h;b.hidden=!h}
/* renova o código uma vez por dia (o Firebase pode trocá-lo) e mantém o registro em nome de quem está conectado */
async function avisoRenovar(){if(!avisoLigado()||avisoEstado()!=='ativo'||lsG('vmc-aviso-dia')===iso(new Date()))return;
  try{const reg=await avisoReg();const m=await avisoMsg();const tok=await m.getToken({vapidKey:VAPID,serviceWorkerRegistration:reg});const ant=lsG('vmc-aviso');
    if(tok){await avisoGravar(tok);if(ant&&ant!==tok)fdb().collection('avisos').doc(ant).delete().catch(()=>{})}}catch(e){}}
Object.assign(PACTS,{
  avisomenu:()=>{ui.avisoForcar=true;avisoBox();window.scrollTo({top:0,behavior:'smooth'})},
  avisofechar:()=>{if(avisoEstado()==='desligado')lsS('vmc-aviso-fechado','1');ui.avisoForcar=false;avisoBox()},
  avisoativar:async b=>{b.disabled=true;b.textContent='Ativando…';
    try{const p=await Notification.requestPermission();if(p!=='granted'){ui.avisoForcar=true;avisoBox();return}
      const reg=await avisoReg();const m=await avisoMsg();const tok=await m.getToken({vapidKey:VAPID,serviceWorkerRegistration:reg});if(!tok)throw new Error('sem código');
      await avisoGravar(tok);lsS('vmc-aviso-fechado',null);
      reg.showNotification('Avisos ativados',{body:'Você vai receber aqui os lembretes das suas designações.',icon:'icon-192.png',tag:'designar-ativado'}).catch(()=>{});
      ui.avisoForcar=true;avisoBox();toast('Avisos ativados neste aparelho')}
    catch(e){if(typeof regErro==='function')regErro(e,'avisos');b.disabled=false;b.textContent='Ativar avisos';toast('Não foi possível ativar os avisos agora. Tente de novo em instantes.')}},
  avisodesativar:async b=>{b.disabled=true;const tok=lsG('vmc-aviso');
    try{const m=await avisoMsg();await m.deleteToken()}catch(e){}
    if(tok)await fdb().collection('avisos').doc(tok).delete().catch(()=>{});lsS('vmc-aviso',null);lsS('vmc-aviso-fechado','1');ui.avisoForcar=false;avisoBox();toast('Avisos desativados neste aparelho')}
});

/* ===== Agenda para os avisos: um resumo das designações de cada publicador, do mês atual em diante ===== */
let agendaRemote=null;
function agendaMapa(){const from=iso(new Date()).slice(0,7)+'-01';const m={};const L=s=>String(s==null?'':s).replace(/\|/g,'/').replace(/\s+/g,' ').trim();
  Object.keys(pubs).forEach(pid=>{const its=myItems(pid,from).slice(0,60);if(its.length)m[pid]=its.map(it=>[it.date,L(it.hora),L(it.titulo),L(String(it.txt).split('\n')[0])].join('|'))});return m}
function syncAgenda(){const F=window.FBX;if(!F||!VAPID||!['admin','editor'].includes(F.papel)||agendaRemote===null||!(loaded.p&&loaded.w))return;
  clearTimeout(syncAgenda.t);
  /* espera os dados assentarem (todas as coleções chegarem) e grava no máximo uma vez a cada 30 s */
  const espera=Math.max(5000,(syncAgenda.ultima||0)+30000-Date.now());
  syncAgenda.t=setTimeout(()=>{let map;try{map=agendaMapa()}catch(e){return}
    const can=o=>JSON.stringify(Object.keys(o||{}).sort().map(k=>[k,o[k]]));if(can(map)===can(agendaRemote))return;
    syncAgenda.ultima=Date.now();const ant=agendaRemote;agendaRemote=map;store.set('quadro','agenda',{itens:map}).catch(()=>{agendaRemote=ant})},espera)}
function agendaInit(){const F=window.FBX;if(!F||!VAPID||!['admin','editor'].includes(F.papel)||agendaInit.ok)return;agendaInit.ok=true;
  fdb().doc('quadro/agenda').onSnapshot(s=>{if(s.metadata.hasPendingWrites)return;agendaRemote=(s.exists&&s.data().itens)||{};syncAgenda()},()=>{})}
