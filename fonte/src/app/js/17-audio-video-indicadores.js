/* ================= Áudio/Vídeo & Indicadores ================= */
function avBlank(date){return{data:date,av:'',palco:'',mic:['',''],ind:['','','']}}
function avNorm(d){const b=avBlank(d.data);return Object.assign(b,d,{mic:[0,1].map(i=>(d.mic||[])[i]||''),ind:[0,1,2].map(i=>(d.ind||[])[i]||'')})}
const isElder=id=>((pubs[id]||{}).privilegios||[]).includes('anciao');
function bros(){return Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&p.sexo!=='F').sort((a,b)=>a[1].nome.localeCompare(b[1].nome,'pt')).map(([id])=>id)}
function avOps(){const l=bros().filter(id=>(pubs[id].cats||[]).includes('av'));return l.length?l:bros()}
/* Reuniões do mês: meio de semana (um dia antes na visita) e fim de semana */
function avSlots(ym){const[y,m]=ym.split('-').map(Number);const last=iso(new Date(y,m,0));const out=[];let d=weekMonday(ym+'-01');
  while(d<=last){const tp=evTipo(d);let mid=shiftDays(d,((+cfg.dia)+6)%7);if(tp==='visita')mid=shiftDays(mid,-1);
    [[mid,'meio'],[shiftDays(d,((+cfg.diaFds)+6)%7),'fds']].forEach(([dt,k])=>{if(dt.slice(0,7)===ym)out.push({data:dt,id:dt,kind:k,sem:SEM_REUNIAO(tp),ev:tp})});d=shiftDays(d,7)}
  return out.sort((a,b)=>a.data<b.data?-1:1)}
function avIds(d){return[d.av,d.palco,...d.mic,...d.ind].filter(Boolean)}
/* quem já tem parte nesta reunião (para não sobrecarregar) */
function avBusy(date,kind){const s=new Set();
  if(kind==='meio'){const w=impTarget(date);if(w)roles(w).forEach(r=>s.add(r.pub))}
  else{const mon=weekMonday(date);const f=sortedFds().find(x=>weekMonday(x.data)===mon);if(f){rolesFds(f).forEach(r=>s.add(r.pub));if(!f.discurso.visitante&&f.discurso.oradorId)s.add(f.discurso.oradorId)}}
  return s}
function avLast(id,before,field){let l='';Object.values(avd).forEach(d0=>{const d=avNorm(d0);if(d.data>=before)return;const hit=field?(field==='av'||field==='palco'?d[field]===id:d[field].includes(id)):avIds(d).includes(id);if(hit&&d.data>l)l=d.data});return l}
function avCount(id,from,to){let n=0;Object.values(avd).forEach(d0=>{const d=avNorm(d0);if(d.data>=from&&d.data<=to&&avIds(d).includes(id))n++});return n}
function avSince(id,date){const l=avLast(id,date);if(!l)return'nunca';const wk=Math.round((parse(date)-parse(l))/6048e5);return wk<=0?'esta semana':'há '+wk+' sem'}
/* Preenche as vagas vazias do mês: quem está há mais tempo sem servir vai primeiro */
function avFill(ym){let n=0;const shuffleTie=new Map();
  avSlots(ym).filter(s=>!s.sem).forEach(s=>{const d=avNorm(avd[s.id]||avBlank(s.data));const parts=avBusy(s.data,s.kind);const busy=new Set(avIds(d));
    const from=shiftDays(s.data,-90);
    /* primeiro quem está livre; se ninguém estiver, aceita quem tem parte na reunião (aparece o aviso) */
    const pick=(pool,field)=>{let c=pool.filter(id=>!busy.has(id)&&!parts.has(id));if(!c.length)c=pool.filter(id=>!busy.has(id));if(!c.length)return'';
      c.forEach(id=>{if(!shuffleTie.has(id))shuffleTie.set(id,Math.random())});
      c.sort((a,b)=>{const la=avLast(a,s.data,field),lb=avLast(b,s.data,field);if(la!==lb)return la<lb?-1:1;const ga=avLast(a,s.data),gb=avLast(b,s.data);if(ga!==gb)return ga<gb?-1:1;
        const ca=avCount(a,from,s.data),cb=avCount(b,from,s.data);if(ca!==cb)return ca-cb;return shuffleTie.get(a)-shuffleTie.get(b)});
      busy.add(c[0]);n++;return c[0]};
    if(!d.av)d.av=pick(avOps(),'av');
    if(!d.ind.some(id=>id&&isElder(id))){const i=d.ind.findIndex(x=>!x);if(i>=0)d.ind[i]=pick(bros().filter(isElder),'ind')}
    if(!d.palco)d.palco=pick(bros(),'palco');
    d.mic=d.mic.map(x=>x||pick(bros(),'mic'));
    d.ind=d.ind.map(x=>x||pick(bros(),'ind'));
    avd[s.id]=d;queueSave('av',s.id,d)});
  return n}
function avWarn(s,d){const w=[];const ids=avIds(d);const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);if(dup.length)w.push([...new Set(dup)].map(x=>tc(pname(x))).join(', ')+' em mais de uma função');
  if(d.ind.some(Boolean)&&!d.ind.some(id=>id&&isElder(id)))w.push('nenhum ancião entre os indicadores');
  const busy=avBusy(s.data,s.kind);const cf=ids.filter(id=>busy.has(id));if(cf.length)w.push([...new Set(cf)].map(x=>tc(pname(x))).join(', ')+' também tem parte nesta reunião');return w}
function rAV(){
  if(!ui.avMonth)ui.avMonth=iso(new Date()).slice(0,7);const slots=avSlots(ui.avMonth);
  const empt=slots.filter(s=>!s.sem).reduce((a,s)=>{const d=avNorm(avd[s.id]||avBlank(s.data));return a+[d.av,d.palco,...d.mic,...d.ind].filter(x=>!x).length},0);
  const sel=(s,field,idx,val,pool)=>{const ids=[...pool];if(val&&!ids.includes(val))ids.unshift(val);
    return`<select class="avsel" data-id="${esc(s.id)}" data-f="${field}" data-i="${idx==null?'':idx}" aria-label="${field} ${br(s.data)}"><option value="">—</option>${ids.map(id=>`<option value="${id}" ${id===val?'selected':''}>${esc(tc(pname(id)))}${isElder(id)?' · ancião':''} · ${avSince(id,s.data)}</option>`).join('')}</select>`};
  const B=bros(),O=avOps();
  const cards=slots.map(s=>{const lab=`<div class="avh"><b>${br(s.data).slice(0,5)}</b><span>${cap(DIAS[parse(s.data).getDay()])} · ${s.kind==='meio'?'Meio de semana':'Fim de semana'}</span>${s.ev&&!s.sem?`<span class="evtag">${EVTAG[s.ev]}</span>`:''}</div>`;
    if(s.sem)return`<div class="panel avcard" data-dia="${s.data}">${lab}<p class="muted" style="margin:0">Sem reunião nesta semana (${esc(EVENTOS[s.ev])}).</p></div>`;
    const d=avNorm(avd[s.id]||avBlank(s.data));const w=avWarn(s,d);
    return`<div class="panel avcard" data-dia="${s.data}">${lab}
      <div class="avgrid"><label class="f">Áudio/Vídeo${sel(s,'av',null,d.av,O)}</label><label class="f">Palco${sel(s,'palco',null,d.palco,B)}</label>
      <label class="f">Microfone${sel(s,'mic',0,d.mic[0],B)}${sel(s,'mic',1,d.mic[1],B)}</label>
      <label class="f">Indicadores${sel(s,'ind',0,d.ind[0],B)}${sel(s,'ind',1,d.ind[1],B)}${sel(s,'ind',2,d.ind[2],B)}</label></div>
      ${w.length?`<div class="warnline">${esc(w.join(' · '))}</div>`:''}</div>`}).join('');
  $('#v-av').innerHTML=`<div style="display:flex;flex-direction:column;gap:14px">
    <div class="panel" style="padding:14px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between">
      <div class="monthnav" style="margin:0;gap:10px"><button class="btn small ghost" data-a="avprev" aria-label="Mês anterior">‹</button><strong>${monthLabel(ui.avMonth)}</strong><button class="btn small ghost" data-a="avnext" aria-label="Próximo mês">›</button></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small ${empt?'primary':''}" data-a="avfill" ${empt?'':'disabled'}>${empt?'Preencher '+empt+' vaga'+(empt>1?'s':''):'Mês completo'}</button>${ui.delAsk==='avclr'?`<span class="confirm">Limpar todas as designações do mês? <button class="btn small danger" data-a="avclrok">Limpar</button><button class="btn small" data-a="avclrno">Cancelar</button></span>`:`<button class="btn small ghost danger" data-a="avclr">Limpar mês</button>`}<a class="btn small" href="#imprimir" data-a="avgoprint">Imprimir / PDF</a><a class="btn small" href="#whatsapp" data-a="avgowa">Avisar pelo WhatsApp</a></div></div>
    <p class="hint" style="margin:0">Áudio/Vídeo: só quem tem a categoria "Áudio e vídeo" em Publicadores (${O.map(id=>esc(tc(pname(id)).split(' ')[0])).join(', ')}). Palco, microfone e indicadores: todos os irmãos. Ao preencher, vai primeiro quem está há mais tempo sem servir, ninguém repete na mesma reunião, quem tem parte naquela reunião fica de fora e sempre entra um ancião entre os indicadores.</p>
    <div class="avlist">${cards||'<p class="muted">Nenhuma reunião neste mês.</p>'}</div></div>`}
Object.assign(PACTS,{
  avprev:()=>{ui.avMonth=shiftMonth(ui.avMonth,-1);ui.delAsk=null;rAV()},
  avnext:()=>{ui.avMonth=shiftMonth(ui.avMonth,1);ui.delAsk=null;rAV()},
  avfill:()=>{const n=avFill(ui.avMonth);rAV();toast(n+' vaga'+(n===1?'':'s')+' preenchida'+(n===1?'':'s'))},
  avclr:()=>{ui.delAsk='avclr';rAV()},avclrno:()=>{ui.delAsk=null;rAV()},
  avclrok:()=>{avSlots(ui.avMonth).forEach(s=>{if(avd[s.id]){delete avd[s.id];removeDoc('av',s.id)}});ui.delAsk=null;rAV();toast('Designações do mês apagadas')},
  avgoprint:()=>{ui.printKind='av';ui.printSelA=new Set([ui.avMonth+'-01']);ui.printSub=''},
  avgowa:()=>{ui.waKind='av';ui.waAV=ui.avMonth},
});
document.addEventListener('change',e=>{const t=e.target;if(!t.classList||!t.classList.contains('avsel'))return;const id=t.dataset.id;const d=avNorm(avd[id]||avBlank(id));
  if(t.dataset.i==='')d[t.dataset.f]=t.value;else d[t.dataset.f][+t.dataset.i]=t.value;avd[id]=d;queueSave('av',id,d);rAV()});
/* folha (prévia e PDF) */
function avMonths(){const s=new Set(Object.keys(avd).map(k=>k.slice(0,7)));s.add(iso(new Date()).slice(0,7));if(ui.avMonth)s.add(ui.avMonth);return[...s].sort()}
function avHTML(ym){const N=id=>id?esc(tc(pname(id))):'<span class="empty">—</span>';
  return`<div class="lw"><div class="lbar">${esc(monthLabel(ym).toUpperCase())}</div><table class="lt avt"><thead><tr><th>Data</th><th>Dia</th><th>Áudio/Vídeo</th><th>Palco</th><th>Microfones</th><th>Indicadores</th></tr></thead><tbody>${avSlots(ym).map(s=>{
    if(s.sem)return`<tr class="sem"><td>${br(s.data)}</td><td>${DIAS3[parse(s.data).getDay()]}</td><td colspan="4">${esc(EVENTOS[s.ev])}: sem reunião</td></tr>`;
    const d=avNorm(avd[s.id]||avBlank(s.data));return`<tr><td>${br(s.data)}</td><td>${DIAS3[parse(s.data).getDay()]}</td><td>${N(d.av)}</td><td>${N(d.palco)}</td><td>${d.mic.map(N).join('<br>')}</td><td>${d.ind.map(N).join('<br>')}</td></tr>`}).join('')}</tbody></table></div>`}
PV.headAV=(x,W)=>{PV.text(PV.congName(),x+W/2,50,'bold',19,'#111111',{align:'center'});PV.rect(x,59,W,1.6,'#A3A3A3');
  PV.text('ÁUDIO/VÍDEO E INDICADORES',x+W/2,76,'normal',10,'#111111',{align:'center',charSpace:0.6});return 92};
PV.av=(ym,x,y,W)=>{const y0=y,d0=PV.doc;const C=[['DATA',x+6],['DIA',x+64],['ÁUDIO/VÍDEO',x+112],['PALCO',x+212],['MICROFONES',x+312],['INDICADORES',x+420]];const cw=96;
  PV.rect(x,y,W,20,'#4F3A82');PV.text(monthLabel(ym).toUpperCase(),x+8,y+14,'bold',11.5,'#FFFFFF',{charSpace:0.4});y+=20;
  PV.rect(x,y,W,15,'#ECE7F5');C.forEach(([t,xx])=>PV.text(t,xx,y+10.5,'bold',7,'#4A4360'));y+=15;
  avSlots(ym).forEach((s,i)=>{if(s.sem){PV.rect(x,y,W,18,'#F3F3F3');PV.text(br(s.data),x+6,y+12,'normal',8.5,'#666666');PV.text(DIAS3[parse(s.data).getDay()],x+64,y+12,'normal',8.5,'#666666');
      PV.text(EVENTOS[s.ev]+': sem reunião',x+112,y+12,'italic',8.5,'#666666',{maxW:W-118});y+=18;return}
    const d=avNorm(avd[s.id]||avBlank(s.data));const h=Math.max(20,8+3*11);if(i%2)PV.rect(x,y,W,h,'#F8F7FB');
    const T=(id,xx,yy)=>id?PV.text(tc(pname(id)),xx,yy,'normal',8.6,'#1B1B1B',{maxW:cw}):PV.text('—',xx,yy,'normal',8.6,'#B5B5B5');
    PV.text(br(s.data),x+6,y+13,'bold',8.8,'#1B1B1B');PV.text(DIAS3[parse(s.data).getDay()],x+64,y+13,'normal',8.8,'#333333');
    T(d.av,x+112,y+13);T(d.palco,x+212,y+13);d.mic.forEach((m,j)=>T(m,x+312,y+13+j*11));d.ind.forEach((m,j)=>T(m,x+420,y+13+j*11));
    y+=h;if(!PV.dry){d0.setDrawColor(228,225,236);d0.setLineWidth(0.5);d0.line(x,y,x+W,y)}});
  return y+16-y0};
/* WhatsApp */
function avMsgs(ym){const by={};avSlots(ym).filter(s=>!s.sem).forEach(s=>{const d=avNorm(avd[s.id]||avBlank(s.data));
    const add=(id,f)=>{if(id)(by[id]=by[id]||[]).push('• '+cap(DIAS[parse(s.data).getDay()])+', '+br(s.data).slice(0,5)+' — '+f)};
    add(d.av,'Áudio e vídeo');add(d.palco,'Palco');d.mic.forEach(m=>add(m,'Microfone'));d.ind.forEach(m=>add(m,'Indicador'))});
  return Object.entries(by).map(([pid,list])=>{const p=pubs[pid]||{nome:'(removido)'};
    const msg=`Olá, ${tc(p.nome.split(' ')[0])}!\n\nSuas designações de apoio às reuniões em ${monthLabel(ym)}:\n\n${list.join('\n')}\n\nSe não puder em alguma data, avise com antecedência, por favor. Obrigado!`;
    return{pid,p,msg}}).sort((a,b)=>a.p.nome.localeCompare(b.p.nome,'pt'))}
function rWaAV(seg){const ym=ui.waAV||(ui.waAV=iso(new Date()).slice(0,7));const ms=avMsgs(ym);const env=(cfg.avEnviados||{})[ym]||{};const sent=ms.filter(m=>env[m.pid]).length;
  $('#v-whatsapp').innerHTML=`<div class="wa-top">${seg}<label class="f">Mês<select id="wawav">${avMonths().map(m=>`<option value="${m}" ${m===ym?'selected':''}>${cap(monthLabel(m))}</option>`).join('')}</select></label>
     ${ms.length?`<span class="progress"><b>${sent}</b> de <b>${ms.length}</b> marcados como enviados</span>`:''}</div>
   <p class="hint" style="margin:-6px 0 16px">Uma mensagem por irmão com todas as datas dele no mês.</p>
   <div class="walist">${ms.length?ms.map((m,i)=>{const n=waNumber(m.p.tel);return`<div class="panel wacard ${env[m.pid]?'sent':''}"><h3>${esc(m.p.nome)}<span class="tel ${n?'':'none'}">${n?esc(fmtTel(m.p.tel)):'sem telefone'}</span></h3><pre>${esc(m.msg)}</pre>
      <div class="acts">${n?`<a class="btn small wa" href="https://wa.me/${n}?text=${encodeURIComponent(m.msg)}" target="_blank" rel="noopener">Abrir no WhatsApp</a>`:''}<button class="btn small" data-a="avwacopy" data-i="${i}">Copiar</button><label><input type="checkbox" class="avsent" data-pid="${esc(m.pid)}" ${env[m.pid]?'checked':''}> Enviado</label></div></div>`}).join(''):'<p class="muted">Nenhuma designação neste mês. Monte a escala na aba A/V e Indicadores.</p>'}</div>`}
Object.assign(PACTS,{avwacopy:b=>copyText(avMsgs(ui.waAV)[+b.dataset.i].msg)});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='wawav'){ui.waAV=t.value;rWa()}
  if(t.classList&&t.classList.contains('avsent')){cfg.avEnviados=cfg.avEnviados||{};const m=cfg.avEnviados[ui.waAV]=Object.assign({},cfg.avEnviados[ui.waAV]||{});if(t.checked)m[t.dataset.pid]=1;else delete m[t.dataset.pid];queueSave('config','geral',cfg);rWa()}});
