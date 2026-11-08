/* ================= Limpeza do Salão do Reino ================= */
const LCOR={A:'#2E7D4F',B:'#4D6873',C:'#C27A0E',D:'#B0182C',E:'#6B4E9B',F:'#2E8C8E',G:'#7A5C2E',H:'#5B6B2E',I:'#8C3B6B',J:'#3B5B8C'};
const lcor=L=>LCOR[L]||'#555555';
const LTIPO={reuniao:'Limpeza a cada reunião',semanal:'Limpeza semanal'};
const DIAS3=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function sortedGroups(){return Object.values(lgr).sort((a,b)=>a.letra<b.letra?-1:1)}
function shortName(n){const w=String(n||'').split(/\s+/).filter(Boolean);if(!w.length)return'';if(['maria','ana','josé','jose','joão','joao'].includes(w[0].toLowerCase())&&w[1]&&!['de','da','das','do','dos'].includes(w[1].toLowerCase()))return tc(w[0]+' '+w[1]);return tc(w[0])}
function groupMembers(g){return(g.membros||[]).map(m=>m.rotulo||shortName(pname(m.id))).filter(Boolean)}
/* Datas de limpeza do mês: semanal no dia configurado; a cada reunião nos dias das duas reuniões */
function limpSlots(ym){const[y,m]=ym.split('-').map(Number);const last=iso(new Date(y,m,0));const out=[];let d=weekMonday(ym+'-01');
  while(d<=last){const tp=evTipo(d);
    const add=(date,tipo)=>{if(date.slice(0,7)===ym)out.push({data:date,tipo,id:date+'_'+tipo,sem:tipo==='reuniao'&&SEM_REUNIAO(tp),ev:tp})};
    add(shiftDays(d,((+cfg.diaLimpeza)+6)%7),'semanal');
    let mid=shiftDays(d,((+cfg.dia)+6)%7);if(tp==='visita')mid=shiftDays(mid,-1);add(mid,'reuniao');
    add(shiftDays(d,((+cfg.diaFds)+6)%7),'reuniao');d=shiftDays(d,7)}
  Object.values(lmp).forEach(s=>{if(s.data.startsWith(ym)&&!out.some(o=>o.id===s.data+'_'+s.tipo))out.push({data:s.data,tipo:s.tipo,id:s.data+'_'+s.tipo,extra:true})});
  return out.sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:(a.tipo==='semanal'?-1:1))}
function limpMonths(){const s=new Set(Object.values(lmp).map(x=>x.data.slice(0,7)));s.add(iso(new Date()).slice(0,7));if(ui.limpMonth)s.add(ui.limpMonth);return[...s].sort()}
/* Preenche as vagas vazias do mês seguindo o rodízio de cada tarefa (ordem das letras), continuando de onde parou */
/* Ordem do rodízio de cada tarefa: definida em Grupos (pode repetir letras). Sem ordem salva, usa as letras em ordem. */
function limpOrder(tipo){const o=((cfg.limpOrdem||{})[tipo]||[]).filter(L=>lgr[L]);if(o.length)return o;return sortedGroups().filter(g=>(g.tarefas||[]).includes(tipo)).map(g=>g.letra)}
function parseOrder(txt){return String(txt||'').toUpperCase().split(/[^A-Z]+/).filter(Boolean)}
/* posição na sequência de uma designação já feita (guarda 'pos' quando o sistema preencheu) */
function seqPos(doc,order){if(doc.pos!=null&&order[doc.pos]===doc.grupo)return doc.pos;return order.indexOf(doc.grupo)}
/* Preenche as datas vazias do mês continuando a sequência a partir da última designação anterior */
function fillLimp(ym,only){const slots=limpSlots(ym).filter(s=>!s.sem);let n=0;
  ['reuniao','semanal'].filter(t=>!only||t===only).forEach(tipo=>{const order=limpOrder(tipo);if(!order.length)return;
    const mine=slots.filter(s=>s.tipo===tipo);if(!mine.length)return;
    let lastDoc=null;Object.values(lmp).filter(s=>s.tipo===tipo&&s.grupo&&s.data<mine[0].data).sort((a,b)=>a.data<b.data?-1:1).forEach(s=>lastDoc=s);
    let idx=lastDoc?seqPos(lastDoc,order):-1;
    mine.forEach(s=>{const cur=lmp[s.id];if(cur&&cur.grupo){const p=seqPos(cur,order);if(p>=0)idx=p;return}
      idx=(idx+1)%order.length;const doc={data:s.data,tipo,grupo:order[idx],pos:idx};lmp[s.id]=doc;queueSave('limpeza',s.id,doc);n++})});
  return n}
/* Apaga as designações a partir de uma data (de uma tarefa ou das duas) e preenche de novo seguindo a sequência */
function redoLimp(from,tipo){const del=Object.values(lmp).filter(s=>s.data>=from&&(!tipo||s.tipo===tipo));const months=new Set([from.slice(0,7)]);
  del.forEach(s=>{const id=s.data+'_'+s.tipo;months.add(s.data.slice(0,7));delete lmp[id];removeDoc('limpeza',id)});
  let n=0;[...months].sort().forEach(m=>{n+=fillLimp(m,tipo)});return n}
function saveGroup(g){lgr[g.letra]=g;queueSave('limpezaGrupos',g.letra,g)}
function rLimpeza(){
  if(!ui.limpMonth)ui.limpMonth=iso(new Date()).slice(0,7);const V=ui.limpView||'escala';const gs=sortedGroups();
  const seg=`<div class="seg" style="max-width:560px"><button data-a="lview" data-v="escala" aria-pressed="${V==='escala'}">Escala do mês</button><button data-a="lview" data-v="grupos" aria-pressed="${V==='grupos'}">Grupos</button><button data-a="lview" data-v="itens" aria-pressed="${V==='itens'}">Itens de higiene e limpeza</button></div>`;
  let body='';
  if(V==='itens'){body=itemsView()}
  else if(V==='escala'){const slots=limpSlots(ui.limpMonth);const empt=slots.filter(s=>!s.sem&&!(lmp[s.id]&&lmp[s.id].grupo)).length;
    body=`<div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between">
        <div class="monthnav" style="margin:0;gap:10px"><button class="btn small ghost" data-a="lprev" aria-label="Mês anterior">‹</button><strong>${monthLabel(ui.limpMonth)}</strong><button class="btn small ghost" data-a="lnext" aria-label="Próximo mês">›</button></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${gs.length?`<button class="btn small ${empt?'primary':''}" data-a="lfill" ${empt?'':'disabled'}>${empt?'Preencher '+empt+' data'+(empt>1?'s':'')+' pelo rodízio':'Escala completa'}</button>`:''}<a class="btn small" href="#imprimir" data-a="lgoprint">Imprimir / PDF</a><a class="btn small" href="#whatsapp" data-a="lgowa">Avisar pelo WhatsApp</a></div></div>
      ${gs.length?'':`<div class="drawres short">Cadastre os grupos de limpeza em "Grupos" primeiro.</div>`}
      <div class="tablewrap"><table class="pubs ltab"><thead><tr><th>Data</th><th>Dia</th><th>Tarefa</th><th>Grupo</th><th>Designados</th></tr></thead><tbody>
      ${slots.map(s=>{const a=lmp[s.id],g=a&&lgr[a.grupo];
        if(s.sem)return`<tr data-dia="${s.data}"><td style="font-variant-numeric:tabular-nums">${br(s.data).slice(0,5)}</td><td>${DIAS3[parse(s.data).getDay()]}</td><td colspan="3"><span class="evtag">${EVTAG[s.ev]}</span> <span class="muted">Sem reunião nesta semana</span></td></tr>`;
        return`<tr data-dia="${s.data}" style="cursor:default"><td style="font-variant-numeric:tabular-nums">${br(s.data).slice(0,5)}</td><td>${DIAS3[parse(s.data).getDay()]}</td><td>${LTIPO[s.tipo]}</td>
          <td><div style="display:flex;gap:6px;align-items:center"><span class="lpill" style="background:${g?lcor(g.letra):'transparent'}">${g?g.letra:''}</span><select class="lsel" data-id="${esc(s.id)}" data-date="${esc(s.data)}" data-tipo="${esc(s.tipo)}" aria-label="Grupo de ${br(s.data)}"><option value="">—</option>${gs.map(x=>`<option value="${x.letra}" ${a&&a.grupo===x.letra?'selected':''}>${x.letra} · ${esc(x.nome)}</option>`).join('')}</select></div></td>
          <td class="muted" style="font-size:13px;min-width:200px">${g?esc(groupMembers(g).join(', ')):''}</td></tr>`}).join('')||'<tr><td colspan="5" class="muted">Nenhuma data neste mês.</td></tr>'}
      </tbody></table></div>
      ${gs.length&&slots.some(s=>!s.sem)?`<div class="evbox" style="flex-direction:row;flex-wrap:wrap;align-items:flex-end;gap:10px">
        <label class="f" style="flex:0 1 180px">Refazer a partir de<select id="lredo-d">${slots.filter(s=>!s.sem).map(s=>s.data).filter((d,i,a)=>a.indexOf(d)===i).map(d=>`<option value="${d}" ${ui.lredoD===d?'selected':''}>${br(d)} (${DIAS3[parse(d).getDay()]})</option>`).join('')}</select></label>
        <label class="f" style="flex:0 1 220px">Tarefa<select id="lredo-t"><option value="">As duas</option>${Object.entries(LTIPO).map(([k,l])=>`<option value="${k}" ${ui.lredoT===k?'selected':''}>${l}</option>`).join('')}</select></label>
        ${ui.delAsk==='lredo'?`<span class="confirm">Apagar as designações dessa data em diante e refazer pela ordem do rodízio? <button class="btn small danger" data-a="lredook">Refazer</button><button class="btn small" data-a="lredono">Cancelar</button></span>`:`<button class="btn small" data-a="lredoask">Refazer daqui em diante</button>`}
        <span class="hint" style="flex-basis:100%">Use para corrigir uma troca: o sistema apaga as designações a partir da data escolhida (inclusive nos meses seguintes) e preenche de novo continuando a sequência.</span></div>`:''}
      <p class="hint" style="margin:0">Limpeza semanal: ${DIAS[cfg.diaLimpeza]}. Limpeza a cada reunião: ${DIAS[cfg.dia]} e ${DIAS[cfg.diaFds]}. O rodízio segue a ordem definida em Grupos e continua de onde parou no mês anterior. O dia da limpeza semanal fica em Ajustes.</p></div>`}
  else{
    const inG={};gs.forEach(g=>[g.dirigente,...(g.membros||[]).map(m=>m.id)].forEach(id=>{if(id)(inG[id]=inG[id]||new Set()).add(g.letra)}));
    const byName=(a,b)=>a[1].nome.localeCompare(b[1].nome,'pt');
    const sem=Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&!inG[id]).sort(byName);
    const bros=Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&p.sexo!=='F').sort(byName);
    const ordPanel=`<div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:12px"><b>Ordem do rodízio</b>
      <p class="hint" style="margin:0">Escreva as letras na ordem em que os grupos se revezam. Pode repetir letras para montar sequências mais longas. O sistema sempre continua do último grupo designado.</p>
      <div class="evgrid">${Object.entries(LTIPO).map(([k,l])=>{const o=limpOrder(k);return`<label class="f">${l}${k==='semanal'?' ('+DIAS[cfg.diaLimpeza]+')':' ('+DIAS[cfg.dia]+' e '+DIAS[cfg.diaFds]+')'}<input type="text" class="lord" data-k="${esc(k)}" value="${esc(o.join(', '))}" placeholder="Ex.: C, D, F, A" autocomplete="off">
        <span class="chips" style="margin-top:4px">${o.map((L,i)=>`<span class="lpill" style="background:${lcor(L)}">${L}</span>${i<o.length-1?'<span class="muted">→</span>':''}`).join('')}${o.length?'<span class="muted">↺</span>':''}</span></label>`}).join('')}</div>
      ${ui.ordErr?`<div class="warnline">${esc(ui.ordErr)}</div>`:''}</div>`;
    body=ordPanel+`<div class="lgrid">${gs.map(g=>`<div class="panel lgcard" style="border-top:4px solid ${lcor(g.letra)}">
        <div class="lgh"><span class="lpill" style="background:${lcor(g.letra)}">${g.letra}</span><input type="text" class="lg-f" data-l="${g.letra}" data-k="nome" value="${esc(g.nome)}" aria-label="Nome do grupo ${g.letra}"></div>
        <label class="f">Dirigente do grupo<select class="lg-f" data-l="${g.letra}" data-k="dirigente"><option value="">— escolher —</option>${bros.map(([id,p])=>`<option value="${id}" ${g.dirigente===id?'selected':''}>${esc(p.nome)}</option>`).join('')}</select></label>
        <div class="hint">${Object.keys(LTIPO).filter(k=>limpOrder(k).includes(g.letra)).map(k=>LTIPO[k]).join(' · ')||'Fora dos rodízios'}</div>
        <div><div class="hint" style="font-weight:600;margin-bottom:6px">${(g.membros||[]).length} membros</div><div class="chips">${(g.membros||[]).map((m,i)=>{const o=m.id&&inG[m.id]?[...inG[m.id]].filter(x=>x!==g.letra):[];
          return`<span class="chip${m.id?'':' nolink'}" title="${esc(m.id?pname(m.id):'Não cadastrado no sistema')}">${esc(m.rotulo||shortName(pname(m.id)))}${o.length?` <b class="dupg">também ${o.join(', ')}</b>`:''}${m.id?'':' <small>sem cadastro</small>'}<button data-a="lgdel" data-l="${g.letra}" data-i="${i}" aria-label="Tirar ${esc(m.rotulo)} do grupo">✕</button></span>`}).join('')||'<span class="muted">Nenhum membro.</span>'}</div></div>
        <label class="f">Adicionar membro<select class="lg-add" data-l="${g.letra}"><option value="">— escolher publicador —</option>${Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&!(g.membros||[]).some(m=>m.id===id)).sort(byName).map(([id,p])=>`<option value="${id}">${esc(p.nome)}${inG[id]?' · Grupo '+[...inG[id]].join(', '):''}</option>`).join('')}</select></label>
        <div>${ui.delAsk==='lg:'+g.letra?`<span class="confirm">Excluir o grupo ${g.letra}? <button class="btn small danger" data-a="lgrmok" data-l="${g.letra}">Excluir</button><button class="btn small" data-a="lgrmno">Cancelar</button></span>`:`<button class="btn small ghost danger" data-a="lgrm" data-l="${g.letra}">Excluir grupo</button>`}</div>
      </div>`).join('')}
      <div class="panel lgcard" style="justify-content:center;align-items:flex-start"><b>Novo grupo</b><p class="hint" style="margin:0">Cria o próximo grupo (letra ${String.fromCharCode((gs.length?gs[gs.length-1].letra.charCodeAt(0):64)+1)}).</p><button class="btn primary small" data-a="lgnew">+ Criar grupo</button></div></div>
      ${sem.length?`<div class="panel" style="padding:14px"><b>Sem grupo de limpeza (${sem.length})</b><p class="hint" style="margin:4px 0 0">${sem.map(([id,p])=>esc(p.nome)).join(' · ')}</p></div>`:''}`}
  $('#v-limpeza').innerHTML=`<div style="display:flex;flex-direction:column;gap:14px">${seg}${body}</div>`}
Object.assign(PACTS,{
  lview:b=>{ui.limpView=b.dataset.v;ui.delAsk=null;rLimpeza()},
  lprev:()=>{ui.limpMonth=shiftMonth(ui.limpMonth,-1);rLimpeza()},
  lnext:()=>{ui.limpMonth=shiftMonth(ui.limpMonth,1);rLimpeza()},
  lredoask:()=>{ui.lredoD=$('#lredo-d').value;ui.lredoT=$('#lredo-t').value;ui.delAsk='lredo';rLimpeza()},
  lredono:()=>{ui.delAsk=null;rLimpeza()},
  lredook:()=>{const n=redoLimp(ui.lredoD,ui.lredoT);ui.delAsk=null;rLimpeza();toast(n+' data'+(n===1?'':'s')+' refeita'+(n===1?'':'s')+' a partir de '+br(ui.lredoD))},
  lfill:()=>{const n=fillLimp(ui.limpMonth);rLimpeza();toast(n+' data'+(n===1?'':'s')+' preenchida'+(n===1?'':'s')+' pelo rodízio')},
  lgoprint:()=>{ui.printKind='limp';ui.printSelL=new Set([ui.limpMonth+'-01']);ui.printSub=''},
  lgowa:()=>{ui.waKind='limp';ui.waLimp=ui.limpMonth},
  lgdel:b=>{const g=lgr[b.dataset.l];g.membros.splice(+b.dataset.i,1);saveGroup(g);rLimpeza()},
  lgrm:b=>{ui.delAsk='lg:'+b.dataset.l;rLimpeza()},
  lgrmno:()=>{ui.delAsk=null;rLimpeza()},
  lgrmok:b=>{const L=b.dataset.l;delete lgr[L];removeDoc('limpezaGrupos',L);ui.delAsk=null;rLimpeza();toast('Grupo '+L+' excluído')},
  lgnew:()=>{const gs=sortedGroups();const L=String.fromCharCode((gs.length?gs[gs.length-1].letra.charCodeAt(0):64)+1);saveGroup({letra:L,nome:'Grupo '+L,dirigente:'',tarefas:['reuniao'],membros:[],enviados:{}});rLimpeza()},
});
document.addEventListener('change',e=>{const t=e.target;if(!t.classList)return;
  if(t.classList.contains('lsel')){const id=t.dataset.id;if(t.value){const doc={data:t.dataset.date,tipo:t.dataset.tipo,grupo:t.value};lmp[id]=doc;queueSave('limpeza',id,doc)}else{delete lmp[id];removeDoc('limpeza',id)}rLimpeza()}
  if(t.classList.contains('lord')){const o=parseOrder(t.value);const bad=o.filter(L=>!lgr[L]);if(bad.length){ui.ordErr='Não existe grupo '+bad.join(', ')+'. Use só as letras dos grupos cadastrados.';rLimpeza();return}
    ui.ordErr='';cfg.limpOrdem=Object.assign({},cfg.limpOrdem||{},{[t.dataset.k]:o});queueSave('config','geral',cfg);rLimpeza();toast('Ordem do rodízio salva')}
  if(t.classList.contains('lg-add')&&t.value){const g=lgr[t.dataset.l];g.membros=g.membros||[];g.membros.push({id:t.value,rotulo:shortName(pname(t.value))});saveGroup(g);rLimpeza()}
  if(t.classList.contains('lg-f')&&t.dataset.k==='dirigente'){const g=lgr[t.dataset.l];g.dirigente=t.value;saveGroup(g)}
  if(t.id==='wawl'){ui.waLimp=t.value;rWa()}
  if(t.classList.contains('lwasent')){const g=lgr[t.dataset.l];g.enviados=g.enviados||{};if(t.checked)g.enviados[ui.waLimp]=new Date().toISOString();else delete g.enviados[ui.waLimp];saveGroup(g);rWa()}
});
document.addEventListener('input',e=>{const t=e.target;if(t.classList&&t.classList.contains('lg-f')&&t.dataset.k==='nome'){const g=lgr[t.dataset.l];g.nome=t.value;saveGroup(g)}});

/* Limpeza — folha impressa (prévia) */
function limpHTML(ym){const slots=limpSlots(ym);
  return`<div class="lw"><div class="lbar">${esc(monthLabel(ym).toUpperCase())}</div><table class="lt"><thead><tr><th>Data</th><th>Dia</th><th></th><th>Designados</th><th>Tarefa</th></tr></thead><tbody>${slots.map(s=>{const a=lmp[s.id],g=a&&lgr[a.grupo];
    if(s.sem)return`<tr class="sem"><td>${br(s.data)}</td><td>${DIAS3[parse(s.data).getDay()]}</td><td></td><td colspan="2">Semana de ${esc(EVENTOS[s.ev])}: sem limpeza de reunião</td></tr>`;
    return`<tr><td>${br(s.data)}</td><td>${DIAS3[parse(s.data).getDay()]}</td><td>${g?`<span class="lp" style="background:${lcor(g.letra)}">${g.letra}</span>`:''}</td><td>${g?`<b>${esc(g.nome)}</b><br>${esc(groupMembers(g).join(', '))}`:'<span class="empty">a designar</span>'}</td><td>${LTIPO[s.tipo]}</td></tr>`}).join('')}</tbody></table></div>`}
/* Limpeza — PDF vetorial */
PV.headLimp=(x,W)=>{PV.text(PV.congName(),x+W/2,50,'bold',19,'#111111',{align:'center'});PV.rect(x,59,W,1.6,'#A3A3A3');
  PV.text('DESIGNAÇÕES DE LIMPEZA',x+W/2,76,'normal',10,'#111111',{align:'center',charSpace:0.6});return 92};
PV.limp=(ym,x,y,W)=>{const y0=y,d=PV.doc,slots=limpSlots(ym);
  const cD=x+6,cDia=x+64,cG=x+108,cT=x+W-6,cDes=x+146,desW=W-146-112;
  PV.rect(x,y,W,20,'#4F3A82');PV.text(monthLabel(ym).toUpperCase(),x+8,y+14,'bold',11.5,'#FFFFFF',{charSpace:0.4});y+=20;
  PV.rect(x,y,W,15,'#ECE7F5');[['DATA',cD],['DIA',cDia],['GRUPO',cG-3],['DESIGNADOS',cDes]].forEach(([t,xx])=>PV.text(t,xx,y+10.5,'bold',7,'#4A4360'));PV.text('TAREFA',cT,y+10.5,'bold',7,'#4A4360',{align:'right'});y+=15;
  slots.forEach((s,i)=>{const a=lmp[s.id],g=a&&lgr[a.grupo];
    if(s.sem){PV.rect(x,y,W,18,'#F3F3F3');PV.text(br(s.data),cD,y+12,'normal',8.5,'#666666');PV.text(DIAS3[parse(s.data).getDay()],cDia,y+12,'normal',8.5,'#666666');
      PV.text('Semana de '+EVENTOS[s.ev]+': sem limpeza de reunião',cDes,y+12,'italic',8.5,'#666666',{maxW:W-146-6});y+=18;return}
    d.setFont('helvetica','normal');d.setFontSize(8.3);const lines=g?d.splitTextToSize(groupMembers(g).join(', '),desW):[];
    const h=Math.max(20,10+(g?11:0)+lines.length*10);
    if(i%2)PV.rect(x,y,W,h,'#F8F7FB');
    PV.text(br(s.data),cD,y+13,'bold',8.8,'#1B1B1B');PV.text(DIAS3[parse(s.data).getDay()],cDia,y+13,'normal',8.8,'#333333');
    if(g){if(!PV.dry){d.setFillColor(...PV.hex(lcor(g.letra)));d.roundedRect(cG,y+4.5,17,12,2.5,2.5,'F')}PV.text(g.letra,cG+8.5,y+13,'bold',8.5,'#FFFFFF',{align:'center'});
      PV.text(g.nome,cDes,y+13,'bold',8.8,'#1B1B1B',{maxW:desW});lines.forEach((l,j)=>PV.text(l,cDes,y+24+j*10,'normal',8.3,'#444444'))}
    else PV.text('a designar',cDes,y+13,'normal',8.5,'#B5B5B5');
    PV.text(LTIPO[s.tipo],cT,y+13,s.tipo==='semanal'?'bold':'normal',8.3,s.tipo==='semanal'?'#4F3A82':'#555555',{align:'right'});
    y+=h;if(!PV.dry){d.setDrawColor(228,225,236);d.setLineWidth(0.5);d.line(x,y,x+W,y)}});
  return y+16-y0};
function limpMsgs(ym){const by={};limpSlots(ym).forEach(s=>{const a=lmp[s.id];if(!s.sem&&a&&a.grupo&&lgr[a.grupo])(by[a.grupo]=by[a.grupo]||[]).push(s)});
  return Object.keys(by).sort().map(L=>{const g=lgr[L],ss=by[L],p=pubs[g.dirigente]||null;
    const lista=ss.map(s=>'• '+cap(DIAS[parse(s.data).getDay()])+', '+br(s.data).slice(0,5)+' — '+LTIPO[s.tipo]).join('\n');
    const msgL=`Olá, ${p?tc(p.nome.split(' ')[0]):'irmão'}!\n\nO ${g.nome} (Grupo ${L}) está designado para a limpeza do Salão do Reino em ${monthLabel(ym)}:\n\n${lista}\n\nPor favor, avise os irmãos do grupo. Obrigado!`;
    const msgG=`*Limpeza do Salão do Reino · ${g.nome} (Grupo ${L})*\n${cap(monthLabel(ym))}\n\n${lista}\n\nIrmãos do grupo: ${groupMembers(g).join(', ')}.\nObrigado pela ajuda!`;
    return{L,g,p,msgL,msgG}})}
function rWaLimp(seg){
  const ym=ui.waLimp||(ui.waLimp=iso(new Date()).slice(0,7));const ms=limpMsgs(ym);const sent=ms.filter(m=>(m.g.enviados||{})[ym]).length;
  $('#v-whatsapp').innerHTML=`<div class="wa-top">${seg}
     <label class="f">Mês<select id="wawl">${limpMonths().map(m=>`<option value="${m}" ${m===ym?'selected':''}>${cap(monthLabel(m))}</option>`).join('')}</select></label>
     ${ms.length?`<span class="progress"><b>${sent}</b> de <b>${ms.length}</b> grupos avisados</span>`:''}</div>
   <p class="hint" style="margin:-6px 0 16px">Cada cartão é de um grupo. O botão verde abre a conversa com o dirigente do grupo. "Mensagem para o grupo" copia um aviso com as datas e os nomes, para mandar no grupo de WhatsApp dos irmãos.</p>
   <div class="walist">${ms.length?ms.map((m,i)=>{const n=m.p?waNumber(m.p.tel):'';return`<div class="panel wacard ${(m.g.enviados||{})[ym]?'sent':''}">
      <h3><span style="display:flex;gap:8px;align-items:center"><span class="lpill" style="background:${lcor(m.L)}">${m.L}</span>${esc(m.g.nome)}</span><span class="tel ${n?'':'none'}">${m.p?(n?esc(fmtTel(m.p.tel)):'sem telefone'):'sem dirigente'}</span></h3>
      <pre>${esc(m.msgL)}</pre>
      <div class="acts">${n?`<a class="btn small wa" href="https://wa.me/${n}?text=${encodeURIComponent(m.msgL)}" target="_blank" rel="noopener">Abrir no WhatsApp</a>`:''}
        <button class="btn small" data-a="lwacopy" data-i="${i}">Copiar</button><button class="btn small" data-a="lwagrp" data-i="${i}">Mensagem para o grupo</button>
        <label><input type="checkbox" class="lwasent" data-l="${m.L}" ${(m.g.enviados||{})[ym]?'checked':''}> Avisado</label></div></div>`}).join(''):'<p class="muted">Nenhuma limpeza designada neste mês. Monte a escala na aba Limpeza.</p>'}</div>`}
Object.assign(PACTS,{lwacopy:b=>copyText(limpMsgs(ui.waLimp)[+b.dataset.i].msgL),lwagrp:b=>copyText(limpMsgs(ui.waLimp)[+b.dataset.i].msgG)});
