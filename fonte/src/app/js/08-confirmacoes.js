/* ================= Confirmações: quem confirmou, quem não pode e quem ainda não respondeu ================= */
function confItens(dias){const hoje=iso(new Date()),ate=shiftDays(hoje,dias);const out=[];
  Object.keys(pubs).forEach(pid=>{if(!pubs[pid]||pubs[pid].ativo===false)return;
    myItems(pid,hoje).forEach(it=>{if(it.date>ate)return;const r=resp[respKey(it.col,it.id,it.field,pid)];
      const ac=acessoDe(pid);out.push(Object.assign({},it,{pid,st:r&&r.status==='ok'?'ok':r&&r.status==='nao'?'nao':ac==='sem'?'sem':'pend',ac,em:r&&r.em}))})});
  return out.sort((a,b)=>(a.date+(a.hora||'')+a.titulo).localeCompare(b.date+(b.hora||'')+b.titulo)||pname(a.pid).localeCompare(pname(b.pid),'pt'))}
const CF_TXT={ok:'Confirmou',nao:'Não pode',pend:'Sem resposta',sem:'Sem acesso ao painel'};
function confLembrete(it){const p=pubs[it.pid]||{};const n=waNumber(p.tel);if(!n)return'';const d=parse(it.date);
  const msg=`Olá, ${tc(pname(it.pid)).split(' ')[0]}! Lembrete da sua designação: ${it.txt.split('\n')[0]} — ${DIAS[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}${it.hora&&/\d/.test(it.hora)?' às '+it.hora:''}.\n\nPor favor, confirme no seu painel (ou responda aqui).`;
  return`<a class="btn small" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(n)}?text=${encodeURIComponent(msg)}">Lembrar</a>`}
function rConfirm(){const v=$('#v-confirmacoes');
  if(!window.FBX){v.innerHTML=`<div class="panel" style="padding:20px;max-width:760px"><h2 style="margin:0 0 6px">Confirmações</h2><p class="muted" style="margin:0">As confirmações chegam pelo painel dos publicadores, que funciona na versão hospedada do sistema (site).</p></div>`;return}
  const D=ui.cfDias||30,F=ui.cfFiltro||'todas',T=ui.cfTipo||'reun';const TIPOS={reun:['meio','fds'],campo:['campo'],av:['av'],limp:['limp'],tudo:null};
  const all=confItens(D).filter(i=>!TIPOS[T]||TIPOS[T].includes(i.k));
  const n={ok:0,nao:0,pend:0,sem:0};all.forEach(i=>n[i.st]++);
  const lista=all.filter(i=>F==='todas'||i.st===F);
  const grupos=[];lista.forEach(i=>{const k=i.date+'|'+i.titulo;let g=grupos[grupos.length-1];if(!g||g.k!==k){g={k,date:i.date,titulo:i.titulo,hora:i.hora,itens:[]};grupos.push(g)}g.itens.push(i)});
  v.innerHTML=`<div style="display:flex;flex-direction:column;gap:14px;max-width:960px">
   <div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:12px">
    <div><h2 style="margin:0">Confirmações</h2><p class="hint" style="margin:4px 0 0">Respostas dadas pelos publicadores no painel. Quem está “sem acesso ao painel” não tem como responder: para esses, use “Lembrar” pelo WhatsApp.${window.FBX&&window.FBX.papel!=='admin'?' (Só administradores veem quem tem acesso.)':''}</p></div>
    <div class="eqf"><label class="f">Período<select id="cf-dias">${[[30,'Próximos 30 dias'],[60,'Próximos 60 dias'],[120,'Próximos 120 dias']].map(([k,l])=>`<option value="${k}" ${k===D?'selected':''}>${l}</option>`).join('')}</select></label>
      <label class="f">Designações<select id="cf-tipo">${[['reun','Reuniões (meio e fim de semana)'],['campo','Saídas de campo'],['av','A/V e indicadores'],['limp','Limpeza'],['tudo','Todas']].map(([k,l])=>`<option value="${k}" ${k===T?'selected':''}>${l}</option>`).join('')}</select></label>
      <label class="f">Mostrar<select id="cf-filtro">${[['todas','Todas ('+all.length+')'],['pend','Sem resposta ('+n.pend+')'],['nao','Não podem ('+n.nao+')'],['ok','Confirmadas ('+n.ok+')'],...(n.sem?[['sem','Sem acesso ao painel ('+n.sem+')']]:[])].map(([k,l])=>`<option value="${k}" ${k===F?'selected':''}>${l}</option>`).join('')}</select></label></div>
    <div class="cfres"><span><b>${n.ok}</b> confirmaram</span><span class="cf-nao-t"><b>${n.nao}</b> não podem</span><span><b>${n.pend}</b> sem resposta</span>${n.sem?`<span class="muted"><b>${n.sem}</b> sem acesso ao painel</span>`:''}</div>
   </div>
   ${grupos.length?grupos.map(g=>{const d=parse(g.date);return`<div class="panel cfg"><div class="cfh"><div class="dblock"><small>${DIAS[d.getDay()].slice(0,3).toUpperCase()}</small><b>${String(d.getDate()).padStart(2,'0')}</b></div><div><b>${esc(g.titulo)}</b><div class="hint">${d.getDate()} de ${MESES[d.getMonth()]}${g.hora&&/\d/.test(g.hora)?' · '+esc(g.hora):''}</div></div></div>
     <div class="cflist">${g.itens.map(i=>`<div class="cfrow"><span class="cfn"><b>${esc(tc(pname(i.pid)))}</b><span class="hint">${esc(i.txt.split('\n')[0])}${i.ac==='convidado'?' · convidado, ainda não entrou':''}</span></span><span class="cfst cf-${i.st}">${CF_TXT[i.st]}</span><span class="cfa">${i.st!=='ok'?confLembrete(i):''}</span></div>`).join('')}</div></div>`}).join('')
   :`<div class="panel" style="padding:20px"><p class="muted" style="margin:0">${all.length?'Nenhuma designação com esse filtro.':'Nenhuma designação nesse período.'}</p></div>`}
  </div>`}
document.addEventListener('change',e=>{const id=e.target.id;if(id==='cf-dias')ui.cfDias=+e.target.value;else if(id==='cf-tipo')ui.cfTipo=e.target.value;else if(id==='cf-filtro')ui.cfFiltro=e.target.value;else return;rConfirm()});
