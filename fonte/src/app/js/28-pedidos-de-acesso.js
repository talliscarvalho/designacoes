/* ================= Pedidos de acesso: quem tentou entrar e ainda não está na lista ================= */
let pedidos=null;const pedVistos=new Set();
function pedidosInit(){const F=window.FBX;if(ui.pedSub||!F||F.papel!=='admin'||!F.pedidos)return;ui.pedSub=true;
  F.pedidos.listar(l=>{const novos=pedidos?l.filter(p=>!pedVistos.has(p.id)):[];l.forEach(p=>pedVistos.add(p.id));pedidos=l.sort((a,b)=>((tsDate(b.ultimo)||0)-(tsDate(a.ultimo)||0)));
    novos.forEach(avisarPedido);pedidosMudou()},()=>{pedidos=[]})}
function pedidosMudou(){pedidoBox();document.title=(pedidos&&pedidos.length?'('+pedidos.length+') ':'')+'Designar';if(ui.tab==='ajustes')drawAcc()}
/* com a permissão do aparelho, mostra uma notificação mesmo com o site em segundo plano (enquanto estiver aberto) */
function avisarPedido(p){try{if(!('Notification' in window)||Notification.permission!=='granted')return;
  new Notification('Pedido de acesso ao sistema',{body:(p.nome?p.nome+' · ':'')+idLbl(p.id)+' quer entrar.',tag:'pedido-'+p.id})}catch(e){}}
/* sugere o publicador do cadastro com o mesmo e-mail ou celular */
function pedidoPub(id){return Object.keys(pubs).find(k=>idDoPub(pubs[k])===id)||Object.keys(pubs).find(k=>pubs[k].tel&&telE164(pubs[k].tel)===id)||''}
function pedidoBox(){const box=$('#pedBox');if(!box)return;const l=pedidos||[];
  if(!l.length||!window.FBX||window.FBX.papel!=='admin'||ui.tab==='ajustes'||painelOnly()){box.hidden=true;return}
  poeHTML(box,`<span><b>${l.length===1?'1 pedido de acesso':l.length+' pedidos de acesso'}</b> aguardando: ${esc(l.slice(0,3).map(p=>p.nome||idLbl(p.id)).join(', '))}${l.length>3?'…':''}</span><a class="btn small primary" href="#ajustes" data-a="pedver">Ver pedidos</a>`);box.hidden=false}
function pedidosHTML(){const l=pedidos||[];if(!l.length)return'';
  const notif='Notification' in window&&Notification.permission==='default'?`<button class="btn small ghost" data-a="pednotif">Avisar neste aparelho quando chegar um pedido</button>`:'';
  return`<div class="pedlist" id="pedidos"><h3 style="margin:0 0 4px;font-size:16px">Pedidos de acesso</h3><p class="hint" style="margin:0 0 8px">Pessoas que tentaram entrar e ainda não estão na lista. Libere ou recuse.</p>
    ${l.map(p=>{const pu=pedidoPub(p.id);const pap=pu?'publicador':'leitor';return`<div class="pedrow"><span><b>${esc(p.nome||'(sem nome)')}</b> · ${esc(idLbl(p.id))}<br><small class="muted">${p.ultimo?'tentou entrar em '+tsLabel(p.ultimo):''}${p.vezes>1?' · '+p.vezes+' tentativas':''}${pu?' · parece ser '+esc(tc(pname(pu))):''}</small></span>
      <select class="pedpap" data-id="${esc(p.id)}" aria-label="Permissão">${Object.entries(PAPEIS).map(([k,v])=>`<option value="${k}" ${k===pap?'selected':''}>${v}</option>`).join('')}</select>
      <select class="pedpub" data-id="${esc(p.id)}" aria-label="Ligar ao publicador"><option value="">— sem ligação —</option>${Object.keys(pubs).sort((a,b)=>pname(a).localeCompare(pname(b),'pt')).map(k=>`<option value="${esc(k)}" ${k===pu?'selected':''}>${esc(tc(pname(k)))}</option>`).join('')}</select>
      <span class="pedbtns"><button class="btn small primary" data-a="pedok" data-id="${esc(p.id)}">Liberar</button><button class="btn small ghost danger" data-a="pedno" data-id="${esc(p.id)}">Recusar</button></span></div>`}).join('')}${notif?`<div style="margin-top:8px">${notif}</div>`:''}</div>`}
Object.assign(PACTS,{
  pedver:()=>{setTimeout(()=>{const e=$('#pedidos');if(e)e.scrollIntoView({behavior:'smooth',block:'start'})},300)},
  pedok:async b=>{const id=b.dataset.id;const row=b.closest('.pedrow');const pa=row.querySelector('.pedpap').value,pu=row.querySelector('.pedpub').value;
    if(pa==='publicador'&&!pu){toast('Escolha qual publicador é essa pessoa');return}
    b.disabled=true;try{await window.FBX.setAccess(id,pa,pu||null);await window.FBX.pedidos.apagar(id);toast('Acesso liberado para '+idLbl(id))}catch(e){b.disabled=false;toast('Não foi possível liberar ('+((e&&e.code)||'erro')+')')}},
  pedno:async b=>{try{await window.FBX.pedidos.apagar(b.dataset.id);toast('Pedido recusado')}catch(e){toast('Não foi possível recusar')}},
  pednotif:async()=>{try{const r=await Notification.requestPermission();toast(r==='granted'?'Pronto: este aparelho vai avisar quando chegar um pedido':'O aparelho não permitiu as notificações');drawAcc()}catch(e){}}});
