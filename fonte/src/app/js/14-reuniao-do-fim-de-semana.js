/* ================= Reunião do fim de semana ================= */
const ICONS2={mic:'<svg viewBox="0 0 24 24"><rect x="9" y="2.5" width="6" height="11.5" rx="3" fill="#fff"/><path d="M5.8 11a6.2 6.2 0 0 0 12.4 0" stroke="#fff" stroke-width="1.8" fill="none"/><path d="M12 17.2v3.6M8.6 21h6.8" stroke="#fff" stroke-width="1.8"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path fill="#fff" d="M4 3.5h16a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H9.5L5 21v-4H4a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 4 3.5z"/><path d="M7 8.5h10M7 12h7" stroke="#4D6A51" stroke-width="1.6"/></svg>'};
function newFds(date){return{data:date,presidente:'',discurso:{num:'',tema:'',oradorId:'',visitante:false,oradorNome:'',congregacao:''},canticoSentinela:'',sentinela:{tema:'',dirigente:'',leitor:''},canticoFinal:'',oracaoFinal:'',enviados:{}}}
function normF(f){const b=newFds(f.data);const o=Object.assign(b,f);o.discurso=Object.assign(newFds('').discurso,f.discurso);o.sentinela=Object.assign({tema:'',dirigente:'',leitor:''},f.sentinela);o.enviados=f.enviados||{};return o}
function sortedFds(){return Object.values(fds).sort((a,b)=>a.data<b.data?-1:1)}
function upcomingFds(){const t=iso(new Date());const a=sortedFds();return(a.find(f=>f.data>=t)||a[a.length-1]||{}).data||null}
function saveFds(f){fds[f.data]=f;queueSave('fimdesemana',f.data,f);buildHist()}
function discTema(f){const d=f.discurso;return d.tema||(d.num&&DISCURSOS[d.num-1])||''}
function visitantes(){const m={};sortedFds().forEach(f=>{const d=f.discurso;if(d&&d.visitante&&d.oradorNome)m[d.oradorNome.trim()]=(d.congregacao||'').trim()||m[d.oradorNome.trim()]||''});return m}
function oradorNome(f){const d=f.discurso;return d.visitante?(d.oradorNome||''):pname(d.oradorId)}
function oradorCong(f){const d=f.discurso;if(d.visitante)return d.congregacao||'';return d.oradorId?(cfg.congregacao||''):''}
function rolesFds(f){const tp=evTipo(f.data);if(SEM_REUNIAO(tp))return[];const vis=tp==='visita';const r=[];const add=(pub,field,txt)=>{if(pub)r.push({pub,field,txt})};
  const art=f.sentinela.tema?': “'+f.sentinela.tema+'”':'';
  add(f.presidente,'presidente','Presidente da reunião (cântico e oração inicial)');
  if(!f.discurso.visitante)add(f.discurso.oradorId,'discurso','Discurso público'+(f.discurso.num?' nº '+f.discurso.num:'')+': “'+(discTema(f)||'a definir')+'” (30 min)');
  add(f.sentinela.dirigente,'sentinela.dirigente',(vis?'Resumo de A Sentinela (30 min, sem leitor)':'Dirigente do Estudo de A Sentinela')+art);
  if(!vis)add(f.sentinela.leitor,'sentinela.leitor','Leitor do Estudo de A Sentinela'+art);
  add(f.oracaoFinal,'oracaoFinal','Oração final');return r}
function fdsSlots(f){const tp=evTipo(f.data);return SEM_REUNIAO(tp)?0:(tp==='visita'?4:5)}
function filledFds(f){return rolesFds(f).length+(f.discurso.visitante&&f.discurso.oradorNome?1:0)}
function talkHist(skip){const h={};Object.values(fds).forEach(f=>{if(f.data===skip||!f.discurso.num)return;(h[f.discurso.num]=h[f.discurso.num]||[]).push(f.data)});for(const k in h)h[k].sort();return h}
function shiftMonth(ym,n){const[y,m]=ym.split('-').map(Number);return iso(new Date(y,m-1+n,1)).slice(0,7)}
function nextFdsDate(){const a=sortedFds();let d;
  if(a.length)d=shiftDays(a[a.length-1].data,7);else{const x=new Date();x.setHours(0,0,0,0);while(x.getDay()!==+cfg.diaFds)x.setDate(x.getDate()+1);d=iso(x)}
  if(ui.fdsMonth&&!a.some(f=>f.data.startsWith(ui.fdsMonth))){const[y,m]=ui.fdsMonth.split('-').map(Number);const x=new Date(y,m-1,1);while(x.getDay()!==+cfg.diaFds)x.setDate(x.getDate()+1);if(!fds[iso(x)])d=iso(x)}
  while(fds[d])d=shiftDays(d,7);return d}
function rFds(){
  const all=sortedFds();
  if(!ui.fdsMonth)ui.fdsMonth=(upcomingFds()||iso(new Date())).slice(0,7);
  const inM=all.filter(f=>f.data.startsWith(ui.fdsMonth));
  if(!ui.fdsSel||!fds[ui.fdsSel])ui.fdsSel=(inM.find(f=>f.data>=iso(new Date()))||inM[0]||{}).data||null;
  const list=`<div class="panel weeklist">
    <div class="monthnav"><button class="btn small ghost" data-a="fprev" aria-label="Mês anterior">‹</button><strong>${monthLabel(ui.fdsMonth)}</strong><button class="btn small ghost" data-a="fnext" aria-label="Próximo mês">›</button></div>
    ${inM.length?'<div class="wklist">'+inM.map(f=>wkItem('fpick',f.data,f.data,filledFds(f),fdsSlots(f),f.data===ui.fdsSel)).join('')+'</div>':`<div class="empty">${mode==='db'&&!loaded.f?'Carregando…':'Nenhuma reunião neste mês ainda.'}</div>`}
    <div class="wkacts"><button class="btn" data-a="faddmonth">Criar datas do mês</button><button class="btn" data-a="faddone">+ Nova data</button></div>
  </div>`;
  const f=ui.fdsSel&&fds[ui.fdsSel];let ed;
  if(!f){ed=`<div class="panel editor"><h2 style="margin:0;font-size:18px">Programação do fim de semana</h2><p class="muted" style="margin:0">Use <b>Criar datas do mês</b> para criar as reuniões de ${+cfg.diaFds===0?'domingo':DIAS[cfg.diaFds]} do mês. Em cada uma, escolha o discurso público na lista, o orador, o artigo de A Sentinela e quem dirige e lê. O dia e o horário ficam em Ajustes.</p></div>`}
  else{
    const d=f.data,tp=evTipo(d),vis=tp==='visita',ev=evOf(d)||{};
    const cnt={};rolesFds(f).forEach(r=>cnt[r.pub]=(cnt[r.pub]||0)+1);const dupc=id=>id&&cnt[id]>1?'dup':'';
    const G=(path,cat,val)=>pubSelect(path,cat,val,d,dupc(val),'g');
    const th=talkHist(d);const num=+f.discurso.num||0;
    const lastT=n=>{const a=th[n]||[];return a.length?a[a.length-1]:''};
    const opts=DISCURSOS.map((t,i)=>{const n=i+1,l=lastT(n);return`<option value="${n}" ${num===n?'selected':''}>${n}. ${esc(t)}${l?' · feito em '+br(l):''}</option>`}).join('');
    const lt=num?lastT(num):'';const recent=lt&&(parse(d)-parse(lt))/864e5<365;
    let orList=Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&(p.cats||[]).includes('orador'));if(!orList.length)orList=Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&p.sexo!=='F');
    orList.sort((a,b)=>a[1].nome.localeCompare(b[1].nome,'pt'));
    const orSel=`<select data-g="discurso.orador" aria-label="Orador"><option value="">— escolher —</option>${orList.map(([id,p])=>`<option value="${id}" ${!f.discurso.visitante&&f.discurso.oradorId===id?'selected':''}>${esc(p.nome)} · ${sinceLabel(id,d)}</option>`).join('')}</select>`;
    const visMap=visitantes();const VIS=f.discurso.visitante;
    const dups=Object.entries(cnt).filter(([k,v])=>v>1).map(([k])=>pname(k));
    ed=`<div class="panel editor" id="feditor">
      ${sheetHead(f.data,cfg.horaFds||'09:00')}${respResumo('fimdesemana',f.data,rolesFds(f))}${lastMod(f)}<div class="ed-head">
        <label class="f">Data da reunião<input type="date" class="fdate" value="${d}"></label>
        <label class="f">Presidente${G('presidente','presidenteFds',f.presidente)}</label>
      </div>
      ${dups.length?`<div class="warnline">Atenção: ${dups.map(esc).join(', ')} aparece${dups.length>1?'m':''} em mais de uma parte nesta reunião.</div>`:''}
      ${evBox(d)}
      ${SEM_REUNIAO(tp)?'':`
      <div class="sec pub"><h3><i></i>Discurso público (30 min)</h3>
        <label class="f">Discurso da lista<select data-g="discurso.num"><option value="">— escolher —</option>${opts}</select></label>
        ${recent?`<div class="warnline">O discurso nº ${num} já foi feito nesta congregação em ${br(lt)}.</div>`:''}
        <label class="f">Tema especial (só se não estiver na lista)<input type="text" data-g="discurso.tema" value="${esc(f.discurso.tema)}" placeholder="${esc(num?DISCURSOS[num-1]:'Ex.: discurso especial')}"></label>
        <div class="orh"><span class="hint" style="font-weight:600">Orador</span><div class="seg" style="max-width:420px"><button data-a="fvis" data-v="0" aria-pressed="${!VIS}">Da congregação</button><button data-a="fvis" data-v="1" aria-pressed="${VIS}">Visitante de outra congregação</button></div></div>
        ${VIS?`<div class="row r2 vrow"><label class="f">Nome do orador<input type="text" data-g="discurso.oradorNome" list="visList" autocomplete="off" value="${esc(f.discurso.oradorNome)}" placeholder="${vis&&ev.superintendente?esc(ev.superintendente):'Digite o nome'}"></label><label class="f">Congregação do orador<input type="text" data-g="discurso.congregacao" list="congList" autocomplete="off" value="${esc(f.discurso.congregacao)}" placeholder="Ex.: Central (Tucano - BA)"></label></div>
        <datalist id="visList">${Object.keys(visMap).sort((a,b)=>a.localeCompare(b,'pt')).map(n=>`<option value="${esc(n)}">${esc(visMap[n])}</option>`).join('')}</datalist><datalist id="congList">${[...new Set(Object.values(visMap).filter(Boolean))].sort().map(c=>`<option value="${esc(c)}">`).join('')}</datalist>
        ${Object.keys(visMap).length?'<div class="hint">Ao digitar, aparecem os oradores que já vieram; escolhendo um deles, a congregação é preenchida sozinha.</div>':''}`
        :`<div class="row r2"><label class="f">Orador da congregação${orSel}</label>${vis?`<div class="hint" style="padding:8px 0">Na visita, deixe em branco para mostrar o superintendente como orador.</div>`:'<div></div>'}</div>`}
      </div>
      <div class="sec sent"><h3><i></i>${vis?'Resumo de A Sentinela (30 min, sem leitor)':'Estudo de A Sentinela (60 min)'}</h3>
        <div class="row r2"><label class="f">Cântico<input type="text" data-g="canticoSentinela" list="cantList" autocomplete="off" value="${esc(f.canticoSentinela)}" placeholder="Número ou nome do cântico"></label><label class="f">Título do artigo<input type="text" data-g="sentinela.tema" value="${esc(f.sentinela.tema)}" placeholder="Título do artigo de estudo"></label></div>
        <div class="row r2"><label class="f">Dirigente${G('sentinela.dirigente','dirigenteSentinela',f.sentinela.dirigente)}</label>${vis?'<div class="hint" style="padding:8px 0">Sem leitor nesta semana.</div>':`<label class="f">Leitor${G('sentinela.leitor','leitorSentinela',f.sentinela.leitor)}</label>`}</div>
      </div>
      ${vis?`<div class="sec pub"><h3><i></i>Discurso final (30 min)</h3><div class="hint">${esc(ev.temaFinal||'Tema a definir')} · ${esc(ev.superintendente||'Superintendente de circuito')}. Tema e nome ficam nos dados da visita, acima.</div></div>`:''}
      <div class="sec open"><h3><i></i>Encerramento</h3>
        <div class="row r2"><label class="f">Cântico final<input type="text" data-g="canticoFinal" list="cantList" autocomplete="off" value="${esc(f.canticoFinal)}" placeholder="Número ou nome do cântico"></label><label class="f">Oração final${G('oracaoFinal','oracao',f.oracaoFinal)}</label></div>
      </div>`}
      <div class="ed-foot">
        ${ui.delAsk==='f:'+d?`<div class="confirm">Excluir a reunião de ${br(d)}? <button class="btn small danger" data-a="fdelok">Excluir</button><button class="btn small" data-a="fdelno">Cancelar</button></div>`:`<button class="btn small ghost danger" data-a="fdel">Excluir reunião</button>`}
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn small" href="#whatsapp" data-a="fgowa">Enviar pelo WhatsApp</a><a class="btn small primary" href="#imprimir" data-a="fgoprint">Imprimir / PDF</a></div>
      </div>
    </div>`}
  $('#v-fimdesemana').innerHTML=misBanner('fs')+`<div class="split">${list}${ed}</div>`;
}
function weekFds(f){
  const tp=evTipo(f.data),ev=evOf(f.data)||{},vis=tp==='visita';
  const dw=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][parse(f.data).getDay()];
  const bar=`<div class="fbar"><span class="dw">${dw}</span>${br(f.data)}${tp?`<span class="ev">${esc(EVENTOS[tp].toUpperCase())}</span>`:''}</div>`;
  if(SEM_REUNIAO(tp))return`<div class="fw">${bar}<div class="noreu">Não haverá reunião: ${esc(EVENTOS[tp])}</div></div>`;
  const T=m=>addMin(cfg.horaFds||'09:00',m);
  const who=(name,role)=>name?`${esc(tc(name))}${role?` <small>(${esc(role)})</small>`:''}`:`<span class="empty">a designar</span>`;
  const Rw=(t,tx,w)=>`<div class="fr"><span class="tm">${t}</span><span class="tx">${tx}</span><span class="who">${w||''}</span></div>`;
  let orN=oradorNome(f),orC=oradorCong(f);if(vis&&!orN&&ev.superintendente){orN=ev.superintendente;orC='Superintendente de circuito'}
  let s=`<div class="fw">${bar}`+Rw(T(0),'Cântico &amp; Oração',who(pname(f.presidente),'Presidente'));
  s+=`<div class="fblk f-pub"><div class="fh"><div class="ic">${ICONS2.mic}</div><h4>DISCURSO PÚBLICO</h4></div>${Rw(T(5),'<b>'+esc(discTema(f)||'Tema a definir')+'</b>',who(orN,orC))}</div>`;
  s+=`<div class="fblk f-sent"><div class="fh"><div class="ic">${ICONS2.chat}</div><h4>${vis?'RESUMO DE A SENTINELA':'ESTUDO DE A SENTINELA'}${cant(f.canticoSentinela)?`<em>Cântico ${esc(cant(f.canticoSentinela))}</em>`:''}</h4></div>${Rw(T(40),'<b>'+esc(f.sentinela.tema||'Artigo de estudo')+'</b>',vis?who(pname(f.sentinela.dirigente),'Dirigente'):who(pname(f.sentinela.dirigente),'Dirigente')+'<br>'+who(pname(f.sentinela.leitor),'Leitor'))}</div>`;
  if(vis)s+=`<div class="fblk f-pub"><div class="fh"><div class="ic">${ICONS2.mic}</div><h4>DISCURSO FINAL</h4></div>${Rw(T(70),'<b>'+esc(ev.temaFinal||'Tema a definir')+'</b>',who(ev.superintendente||'','Superintendente de circuito'))}</div>`;
  s+=Rw(T(100),'Cântico '+esc(cant(f.canticoFinal)||'')+' &amp; Oração'+(pname(f.oracaoFinal)?` <i>(${esc(tc(pname(f.oracaoFinal)))})</i>`:''),'');
  return s+'</div>'}
Object.assign(PACTS,{
  fprev:()=>{ui.fdsMonth=shiftMonth(ui.fdsMonth,-1);ui.fdsSel=null;rFds()},
  fnext:()=>{ui.fdsMonth=shiftMonth(ui.fdsMonth,1);ui.fdsSel=null;rFds()},
  fpick:b=>{ui.fdsSel=b.dataset.id;ui.delAsk=null;rFds()},
  faddone:()=>{const d=nextFdsDate();saveFds(newFds(d));ui.fdsSel=d;ui.fdsMonth=d.slice(0,7);rFds();toast('Reunião de '+br(d)+' criada')},
  faddmonth:()=>{const[y,m]=ui.fdsMonth.split('-').map(Number);const x=new Date(y,m-1,1);while(x.getDay()!==+cfg.diaFds)x.setDate(x.getDate()+1);let n=0,first=null;
    while(x.getMonth()===m-1){const d=iso(x);if(!fds[d]){saveFds(newFds(d));n++;first=first||d}x.setDate(x.getDate()+7)}
    if(first)ui.fdsSel=first;rFds();toast(n?n+' reuniões criadas em '+monthLabel(ui.fdsMonth):'As datas deste mês já existem')},
  fdel:()=>{ui.delAsk='f:'+ui.fdsSel;rFds()},
  fdelno:()=>{ui.delAsk=null;rFds()},
  fdelok:()=>{const id=ui.fdsSel;delete fds[id];removeDoc('fimdesemana',id);ui.fdsSel=null;ui.delAsk=null;buildHist();rFds();toast('Reunião excluída')},
  fgowa:()=>{ui.waKind='fds';ui.waFds=ui.fdsSel},
  fgoprint:()=>{ui.printKind='fds';ui.printSelF=null},
});
document.addEventListener('input',e=>{const t=e.target;if(ui.tab!=='fimdesemana'||!t.dataset||!t.dataset.g||!ui.fdsSel)return;const f=fds[ui.fdsSel];if(!f)return;const g=t.dataset.g;
  if(g==='discurso.orador'){if(t.value==='__vis'){f.discurso.visitante=true;f.discurso.oradorId=''}else{f.discurso.visitante=false;f.discurso.oradorId=t.value}saveFds(f);rFds();return}
  if(g==='discurso.num'){f.discurso.num=t.value?+t.value:'';f.discurso.tema='';saveFds(f);rFds();return}
  setPath(f,g,t.value);saveFds(f);if(t.tagName==='SELECT')rFds()});
document.addEventListener('change',e=>{const t=e.target;
  if(t.classList&&t.classList.contains('fdate')&&ui.fdsSel){const nd=t.value;if(!nd||nd===ui.fdsSel)return;if(fds[nd]){toast('Já existe uma reunião em '+br(nd));t.value=ui.fdsSel;return}
    const f=fds[ui.fdsSel];const old=f.data;f.data=nd;delete fds[old];removeDoc('fimdesemana',old);saveFds(f);ui.fdsSel=nd;ui.fdsMonth=nd.slice(0,7);rFds()}
  if(t.classList&&t.classList.contains('ev-tipo')){setEvent(t.dataset.date,{tipo:t.value});renderAll()}
  if(t.dataset&&t.dataset.g==='discurso.oradorNome'&&ui.fdsSel&&fds[ui.fdsSel]){const f=fds[ui.fdsSel];const c=visitantes()[t.value.trim()];if(c&&!f.discurso.congregacao){f.discurso.congregacao=c;saveFds(f);rFds()}}
});
document.addEventListener('input',e=>{const t=e.target;if(t.classList&&t.classList.contains('ev-f'))setEvent(t.dataset.date,{[t.dataset.k]:t.value})});

/* Semanas futuras que estão em outro dia da semana que o configurado */
function misaligned(){const t=iso(new Date());
  return{ws:sortedWeeks().filter(w=>w.data>=t&&parse(w.data).getDay()!==+cfg.dia),fs:sortedFds().filter(f=>f.data>=t&&parse(f.data).getDay()!==+cfg.diaFds)}}
/* aviso na própria aba quando há reuniões futuras fora do dia configurado em Ajustes */
function misBanner(k){if(mode==='db'&&!(loaded.w&&loaded.c))return'';const m=misaligned()[k];if(!m.length)return'';const dia=k==='ws'?+cfg.dia:+cfg.diaFds;
  const dias=[...new Set(m.map(x=>DIAS[parse(x.data).getDay()]))].join(' e ');
  return`<div class="drawres short misb" style="margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between"><span>${m.length} ${k==='ws'?'semana'+(m.length>1?'s':''):'reuni'+(m.length>1?'ões':'ão')} marcada${m.length>1?'s':''} para ${esc(dias)} (${m.slice(0,4).map(x=>br(x.data).slice(0,5)).join(', ')}${m.length>4?'…':''}), mas em Ajustes a reunião é ${k==='ws'?'de':'aos'} ${esc(DIAS[dia])}${k==='ws'?'':'s'}.</span><button class="btn small primary" data-a="alignone" data-k="${esc(k)}">Mover para ${esc(DIAS[dia])}</button></div>`}
function alignDates(only){const {ws,fs}=misaligned();let n=0;
  if(only!=='fs')ws.forEach(w=>{const nd=shiftDays(weekMonday(w.data),((+cfg.dia)+6)%7);if(nd===w.data||weeks[nd])return;const old=w.data;w.data=nd;delete weeks[old];removeDoc('semanas',old);saveWeek(w);n++});
  if(only!=='ws')fs.forEach(f=>{const nd=shiftDays(weekMonday(f.data),((+cfg.diaFds)+6)%7);if(nd===f.data||fds[nd])return;const old=f.data;f.data=nd;delete fds[old];removeDoc('fimdesemana',old);saveFds(f);n++});
  ui.week=null;ui.fdsSel=null;return n}
Object.assign(PACTS,{alignone:b=>{const n=alignDates(b.dataset.k);renderAll();toast(n+' data'+(n===1?'':'s')+' ajustada'+(n===1?'':'s'))},alignask:()=>{ui.delAsk='align';rAjustes()},alignno:()=>{ui.delAsk=null;rAjustes()},alignok:()=>{const n=alignDates();ui.delAsk=null;rAjustes();toast(n+' data'+(n===1?'':'s')+' ajustada'+(n===1?'':'s'))}});
