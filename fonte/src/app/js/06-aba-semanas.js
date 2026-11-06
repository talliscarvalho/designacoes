/* ================= Aba Semanas ================= */
function pubSelect(path,cat,val,date,extraCls,attr){
  let list=Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&(p.cats||[]).includes(cat));
  if(!list.length&&FDS_CATS.includes(cat))list=Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&p.sexo!=='F');
  list.sort((a,b)=>a[1].nome.localeCompare(b[1].nome,'pt'));
  if(val&&pubs[val]&&!list.find(([id])=>id===val))list.unshift([val,pubs[val]]);
  return `<select data-${attr||'f'}="${path}" class="${extraCls||''}" aria-label="${esc(CATNAME[cat])}"><option value="">— escolher —</option>${list.map(([id,p])=>`<option value="${id}" ${id===val?'selected':''}>${esc(p.nome)} · ${sinceLabel(id,date)}</option>`).join('')}${val&&!pubs[val]?`<option value="${esc(val)}" selected>(publicador removido)</option>`:''}</select>`}

function rSemanas(){
  const ws=sortedWeeks();
  if(!ui.month){const u=upcomingWeek();ui.month=(u||iso(new Date())).slice(0,7)}
  const inMonth=ws.filter(w=>w.data.startsWith(ui.month));
  if(!ui.week||!weeks[ui.week]){ui.week=(inMonth.find(w=>w.data>=iso(new Date()))||inMonth[0]||{}).data||null}
  const loadingTxt=mode==='db'&&!loaded.w?'Carregando semanas…':'Nenhuma semana neste mês ainda.';
  const list=`<div class="panel weeklist">
    <div class="monthnav"><button class="btn small ghost" data-a="mprev" aria-label="Mês anterior">‹</button><strong>${monthLabel(ui.month)}</strong><button class="btn small ghost" data-a="mnext" aria-label="Próximo mês">›</button></div>
    ${inMonth.length?'<div class="wklist">'+inMonth.map(w=>wkItem('pick',w.data,meetDate(w),filledCount(w),slotCount(w),w.data===ui.week)).join('')+'</div>':`<div class="empty">${loadingTxt}</div>`}
    <div class="wkacts"><button class="btn" data-a="addweek">+ Nova semana</button><button class="btn" data-a="impopen">Importar apostila</button>${inMonth.length?`<button class="btn" data-a="drawmonth">Sortear irmãs do mês</button>`:''}</div>
  </div>`;
  let ed='';
  const w=ui.week&&weeks[ui.week];
  if(ui.importing){ed=impPanel()}
  else if(!w){ed=`<div class="panel editor"><h2 style="margin:0;font-size:18px">Monte a programação da semana</h2><p class="muted" style="margin:0">Crie uma semana com <b>+ Nova semana</b>. Preencha os temas e cânticos da apostila e escolha quem faz cada parte. A lista de nomes mostra só quem está cadastrado naquela categoria, com o tempo desde a última designação.</p></div>`}
  else{
    const d=w.data;const tp=evTipo(d),ev=evOf(d)||{};const cnt={};roles(w).forEach(r=>cnt[r.pub]=(cnt[r.pub]||0)+1);
    const dup=id=>id&&cnt[id]>1?'dup':'';
    const S=(path,cat,val)=>pubSelect(path,cat,val,d,dup(val));
    const dups=Object.entries(cnt).filter(([k,v])=>v>1).map(([k])=>pname(k));
    const mh=minHist(d);const confl=[];
    w.ministerio.forEach(p=>{if(isDiscurso(p))return;[p.pub,p.ajudante].forEach(id=>{const c=minConflicts(id,d,mh);if(c.length)confl.push(tc(pname(id))+' ('+c.map(x=>br(x).slice(0,5)).join(', ')+')')})});
    const avail=availableSisters(w).length;
    const SM=(path,cat,val)=>{const c=minConflicts(val,d,mh).length?'dup':'';return pubSelect(path,cat,val,d,dup(val)||c)};
    ed=`<div class="panel editor" id="editor">
      ${sheetHead(meetDate(w),cfg.hora)}${respResumo('semanas',w.data,roles(w))}${lastMod(w)}<div class="ed-head">
        <label class="f">Data da reunião<input type="date" id="f-data" value="${d}" data-a="redate"></label>
        <label class="f">Leitura semanal da Bíblia<input type="text" id="f-leit" data-f="leituraSemanal" value="${esc(w.leituraSemanal)}" placeholder="Ex.: EZEQUIEL 1-5"></label>
        <label class="f">Presidente${S('presidente','presidente',w.presidente)}</label>
      </div>
      ${confl.length?`<div class="warnline">Menos de ${meses()} meses desde (ou até) outra parte no ministério: ${confl.map(esc).join('; ')}.</div>`:''}
      ${dups.length?`<div class="warnline">Atenção: ${dups.map(esc).join(', ')} aparece${dups.length>1?'m':''} em mais de uma parte nesta semana.</div>`:''}
      ${evBox(d)}
      ${SEM_REUNIAO(tp)?'':`<div class="sec open"><h3><i></i>Abertura</h3>
        <div class="row r2"><label class="f">Cântico inicial<input type="text" data-f="canticoInicial" list="cantList" autocomplete="off" value="${esc(w.canticoInicial)}" placeholder="1 - As qualidades de Jeová"></label><label class="f">Oração inicial${S('oracaoInicial','oracao',w.oracaoInicial)}</label></div>
      </div>
      <div class="sec tes"><h3><i></i>Tesouros da Palavra de Deus</h3>
        <div class="row r3"><label class="f">Tema do discurso<input type="text" data-f="tesouros.tema" value="${esc(w.tesouros.tema)}" placeholder="Tema da apostila"></label><div class="fixed">10 min</div><label class="f">Orador${S('tesouros.pub','tesouros',w.tesouros.pub)}</label></div>
        <div class="row r3"><div class="fixed">Encontre Joias Espirituais</div><div class="fixed">10 min</div><label class="f">Designado${S('joias.pub','joias',w.joias.pub)}</label></div>
        <div class="row r3"><div class="fixed">Leitura da Bíblia</div><div class="fixed">4 min</div><label class="f">Estudante${S('leitura.pub','leitura',w.leitura.pub)}</label></div>
      </div>
      <div class="sec min"><div class="sec-h"><h3><i></i>Faça Seu Melhor no Ministério</h3>
          <div class="drawbar"><span class="hint">${avail} irmã${avail===1?'':'s'} livre${avail===1?'':'s'} (${meses()} meses)</span><button class="btn small" data-a="draw">Sortear irmãs</button><button class="btn small ghost" data-a="redraw">Sortear de novo</button></div></div>
        ${lastDraw&&lastDraw.week===w.data?`<div class="drawres ${lastDraw.short?'short':''}">${esc(lastDraw.msg)}</div>`:''}
        ${w.ministerio.map((p,i)=>{const tpp=partTipo(p),disc=tpp!=='demo';return`<div class="row">
          <div style="display:flex;flex-direction:column;gap:6px;min-width:0"><label class="f">Parte ${4+i}<input type="text" list="minTemas" data-f="ministerio.${i}.tema" value="${esc(p.tema)}"></label>
            <select data-f="ministerio.${i}.tipo" aria-label="Tipo da parte ${4+i}" style="font-size:13px;padding:5px 8px">${TIPOS.map(([k,l])=>`<option value="${k}" ${tpp===k?'selected':''}>${l}</option>`).join('')}</select></div>
          <label class="f">Min<input type="number" min="1" max="15" data-f="ministerio.${i}.min" value="${esc(p.min)}"></label>
          ${tpp==='presidente'?`<div class="hint" style="padding-bottom:9px">Feita pelo presidente${w.presidente?': '+esc(tc(pname(w.presidente))):''}</div>`:`<label class="f">${tpp==='consideracao'?'Designado':disc?'Orador (estudante)':'Estudante'}${(disc?S:SM)('ministerio.'+i+'.pub',disc?'discurso':'ministerio',p.pub)}</label>`}
          ${disc?`<div class="hint" style="padding-bottom:9px">${tpp==='presidente'?'':'Sem ajudante'}</div>`:`<label class="f">Ajudante${SM('ministerio.'+i+'.ajudante','ministerio',p.ajudante)}</label>`}
          <button class="btn small ghost danger" data-a="delmin" data-i="${i}" aria-label="Remover parte ${4+i}">✕</button></div>`}).join('')}
        <div><button class="btn small" data-a="addmin">+ Parte</button></div>
      </div>
      <div class="sec vida"><h3><i></i>Nossa Vida Cristã</h3>
        <div class="row r3"><label class="f">Cântico do meio<input type="text" data-f="canticoMeio" list="cantList" autocomplete="off" value="${esc(w.canticoMeio)}" placeholder="44 - Oração de um servo aflito"></label></div>
        ${w.vida.map((p,i)=>`<div class="row" style="grid-template-columns:minmax(0,1.4fr) 70px minmax(0,1fr) 34px">
          <label class="f">Parte<input type="text" data-f="vida.${i}.tema" value="${esc(p.tema)}" placeholder="Tema da apostila"></label>
          <label class="f">Min<input type="number" min="1" max="30" data-f="vida.${i}.min" value="${esc(p.min)}"></label>
          <label class="f">Designado${S('vida.'+i+'.pub','vida',p.pub)}</label>
          <button class="btn small ghost danger" data-a="delvida" data-i="${i}" aria-label="Remover parte">✕</button></div>`).join('')}
        <div><button class="btn small" data-a="addvida">+ Parte</button></div>
        ${tp==='visita'?`<div class="row r3"><div class="fixed">Discurso do superintendente de circuito${ev.temaSC?': '+esc(ev.temaSC):''}${ev.superintendente?' · '+esc(ev.superintendente):''}</div><div class="fixed">30 min</div><div class="hint" style="padding:8px 0">Substitui o Estudo bíblico de congregação. Tema e nome ficam nos dados da visita, acima.</div></div>`:`<div class="row r2"><label class="f">Estudo de Congregação · Dirigente${S('estudo.dirigente','dirigente',w.estudo.dirigente)}</label><label class="f">Leitor${S('estudo.leitor','leitor',w.estudo.leitor)}</label></div>`}
        <div class="row r2"><label class="f">Cântico final<input type="text" data-f="canticoFinal" list="cantList" autocomplete="off" value="${esc(w.canticoFinal)}" placeholder="33 - Deixe Jeová levar seus fardos"></label><label class="f">Oração final${S('oracaoFinal','oracao',w.oracaoFinal)}</label></div>
      </div>`}
      <div class="ed-foot">
        ${ui.delAsk===w.data?`<div class="confirm">Excluir a semana de ${br(w.data)}? <button class="btn small danger" data-a="delweekok">Excluir</button><button class="btn small" data-a="delweekno">Cancelar</button></div>`:`<button class="btn small ghost danger" data-a="delweek">Excluir semana</button>`}
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn small" href="#whatsapp" data-a="gowa">Enviar pelo WhatsApp</a><a class="btn small primary" href="#imprimir">Imprimir / PDF</a></div>
      </div>
      <datalist id="minTemas">${MIN_TEMAS.map(t=>`<option value="${t}">`).join('')}</datalist>
    </div>`}
  $('#v-semanas').innerHTML=misBanner('ws')+`<div class="split">${list}${ed}</div>`;
}
function setPath(o,path,v){const ks=path.split('.');let c=o;for(let i=0;i<ks.length-1;i++)c=c[ks[i]];c[ks[ks.length-1]]=v}
function saveWeek(w){weeks[w.data]=w;queueSave('semanas',w.data,w);buildHist()}
function nextMeetingDate(){
  const ws=sortedWeeks();let d;
  if(ws.length){d=parse(ws[ws.length-1].data);d.setDate(d.getDate()+7)}else{d=new Date();d.setHours(0,0,0,0);while(d.getDay()!==+cfg.dia)d.setDate(d.getDate()+1)}
  if(ui.month&&!ws.some(w=>w.data.startsWith(ui.month))){const[a,b]=ui.month.split('-').map(Number);const f=new Date(a,b-1,1);while(f.getDay()!==+cfg.dia)f.setDate(f.getDate()+1);if(!weeks[iso(f)])d=f}
  while(weeks[iso(d)])d.setDate(d.getDate()+7);return iso(d)}

document.addEventListener('input',e=>{
  const t=e.target;if(!t.dataset)return;
  if(ui.tab==='semanas'&&t.dataset.f&&ui.week){const w=weeks[ui.week];let v=t.value;if(t.type==='number')v=v===''?'':Number(v);setPath(w,t.dataset.f,v);saveWeek(w);
    if(t.tagName==='SELECT'||/\.tema$/.test(t.dataset.f)&&/^ministerio/.test(t.dataset.f)){ if(t.tagName==='SELECT')rSemanas(); else{clearTimeout(rSemanas.t);rSemanas.t=setTimeout(()=>{const a=document.activeElement&&document.activeElement.dataset.f;rSemanas();if(a){const el=document.querySelector(`[data-f="${a}"]`);if(el){el.focus();if(el.setSelectionRange){const l=el.value.length;el.setSelectionRange(l,l)}}}},700)}}
  }
});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='f-data'&&ui.week){const nd=t.value;if(!nd||nd===ui.week)return;if(weeks[nd]){toast('Já existe uma semana em '+br(nd));t.value=ui.week;return}
    const w=weeks[ui.week];const old=w.data;w.data=nd;delete weeks[old];removeDoc('semanas',old);saveWeek(w);ui.week=nd;ui.month=nd.slice(0,7);rSemanas()}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  const w=ui.week&&weeks[ui.week];
  const acts={
    mprev:()=>{const[y,m]=ui.month.split('-').map(Number);const d=new Date(y,m-2,1);ui.month=iso(d).slice(0,7);ui.week=null;rSemanas()},
    mnext:()=>{const[y,m]=ui.month.split('-').map(Number);const d=new Date(y,m,1);ui.month=iso(d).slice(0,7);ui.week=null;rSemanas()},
    pick:()=>{ui.week=b.dataset.id;ui.delAsk=null;ui.importing=false;imp=null;rSemanas()},
    addweek:()=>{const d=nextMeetingDate();const nw=newWeek(d);saveWeek(nw);ui.week=d;ui.month=d.slice(0,7);rSemanas();toast('Semana de '+br(d)+' criada')},
    addmin:()=>{w.ministerio.push({tema:'',min:4,pub:'',ajudante:''});saveWeek(w);rSemanas()},
    delmin:()=>{w.ministerio.splice(+b.dataset.i,1);saveWeek(w);rSemanas()},
    addvida:()=>{w.vida.push({tema:'',min:10,pub:''});saveWeek(w);rSemanas()},
    delvida:()=>{w.vida.splice(+b.dataset.i,1);saveWeek(w);rSemanas()},
    delweek:()=>{ui.delAsk=w.data;rSemanas()},
    delweekno:()=>{ui.delAsk=null;rSemanas()},
    delweekok:()=>{const id=w.data;delete weeks[id];removeDoc('semanas',id);ui.week=null;ui.delAsk=null;buildHist();rSemanas();toast('Semana excluída')},
    gowa:()=>{ui.waWeek=ui.week},
    impopen:()=>{ui.importing=true;imp=null;rSemanas();const el=document.querySelector('.imp');if(el)el.scrollIntoView({block:'start',behavior:'smooth'})},
    impclose:()=>{ui.importing=false;imp=null;rSemanas()},
    impgo:()=>impApply(),
    draw:()=>{const r=drawSisters(w,false);saveWeek(w);lastDraw={week:w.data,msg:drawMsg(r),short:!!(r.short.length||r.empty)};rSemanas()},
    redraw:()=>{const r=drawSisters(w,true);saveWeek(w);lastDraw={week:w.data,msg:drawMsg(r),short:!!(r.short.length||r.empty)};rSemanas()},
    drawmonth:()=>{const ws=sortedWeeks().filter(x=>x.data.startsWith(ui.month)&&!SEM_REUNIAO(evTipo(x.data)));let n=0,sh=[],em=0;
      ws.forEach(x=>{const r=drawSisters(x,false);if(r.n){saveWeek(x)}n+=r.n;sh=sh.concat(r.short);em+=r.empty});
      const msg=drawMsg({n,short:sh,empty:em},monthLabel(ui.month));if(!ui.week&&ws[0])ui.week=ws[0].data;
      lastDraw={week:ui.week,msg,short:!!(sh.length||em)};rSemanas();toast(n+' irmãs sorteadas em '+monthLabel(ui.month))},
  };
  if(acts[a]){acts[a]();return}
  if(PACTS[a])PACTS[a](b,e);
});
