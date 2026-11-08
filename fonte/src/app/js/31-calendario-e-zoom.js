/* ================= Calendário da congregação e reunião pelo Zoom ================= */
/* Os eventos ficam em config/geral › calendario (lista); o link do Zoom em config/geral › zoom.
   Todos que entram no sistema veem; só administradores editam. */
const CAL_TIPOS=[['assembleia','Assembleia de circuito','pub'],['congresso','Congresso','pub'],['celebracao','Celebração','vida'],['especial','Reunião especial','tes'],
  ['visita','Visita do superintendente de circuito','min'],['campanha','Campanha especial','sent'],['pregacao','Pregação','sent'],['outro','Outro evento','open']];
const CAL_T=Object.fromEntries(CAL_TIPOS.map(([k,l,c])=>[k,{l,c}]));
const CAL_SEMENTE=[
  {id:'e2026-11-15',tipo:'assembleia',ini:'2026-11-15',fim:'',titulo:'Assembleia de circuito com o representante de Betel',local:'Amélia Rodrigues, BA',obs:''},
  {id:'e2027-03-22',tipo:'celebracao',ini:'2027-03-22',fim:'',titulo:'Celebração',local:'',obs:''},
  {id:'e2027-04-03',tipo:'assembleia',ini:'2027-04-03',fim:'',titulo:'Assembleia de circuito com o superintendente de circuito',local:'Amélia Rodrigues, BA',obs:''},
  {id:'e2027-08-06',tipo:'congresso',ini:'2027-08-06',fim:'2027-08-08',titulo:'Congresso',local:'Salão de Assembleias - Amélia Rodrigues, BA',obs:''}];
const calLista=()=>(Array.isArray(cfg.calendario)?cfg.calendario:[]).filter(e=>e&&/^\d{4}-\d{2}-\d{2}$/.test(e.ini||'')).slice().sort((a,b)=>a.ini.localeCompare(b.ini));
/* na primeira vez que um administrador abre o sistema, o calendário começa com os eventos já informados */
function calSemear(){if(!isAdm()||!loaded.c||cfg.calendario!==undefined||calSemear.ok)return;calSemear.ok=true;cfg.calendario=CAL_SEMENTE.map(e=>Object.assign({},e));queueSave('config','geral',cfg)}
const MES3=['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.'];
function calQuando(e){const a=parse(e.ini),f=e.fim&&e.fim>e.ini?parse(e.fim):null;const D=d=>cap(DIAS[d.getDay()]);
  if(!f)return`${D(a)}, ${a.getDate()} de ${MESES[a.getMonth()]} de ${a.getFullYear()}`;
  if(a.getMonth()===f.getMonth()&&a.getFullYear()===f.getFullYear())return`${D(a)}, ${a.getDate()} a ${DIAS[f.getDay()]}, ${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`;
  return`${D(a)}, ${a.getDate()} de ${MESES[a.getMonth()]} a ${DIAS[f.getDay()]}, ${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`}
function calFalta(e){const hoje=iso(new Date());const fim=e.fim&&e.fim>e.ini?e.fim:e.ini;
  if(e.ini<=hoje&&fim>=hoje)return e.ini===fim?'Hoje':'Acontecendo agora';
  const n=Math.round((parse(e.ini)-parse(hoje))/864e5);if(n===1)return'Amanhã';if(n<=0)return'';if(n<14)return`Daqui a ${n} dias`;if(n<60)return`Daqui a ${Math.round(n/7)} semanas`;return`Daqui a ${Math.round(n/30.4)} meses`}
function calCard(e,edita){const t=CAL_T[e.tipo]||CAL_T.outro;const a=parse(e.ini);const falta=calFalta(e);
  return`<div class="calev" style="--evc:var(--${t.c})"><span class="cal" aria-hidden="true"><small>${DIAS[a.getDay()].slice(0,3).toUpperCase()}</small><b>${pad(a.getDate())}</b><small>${MES3[a.getMonth()].replace('.','').toUpperCase()}</small></span>
    <div class="calinfo"><span class="caltipo">${esc(t.l)}</span><b>${esc(e.titulo||t.l)}</b>
      <span class="calq">${esc(calQuando(e))} · O dia todo</span>${e.local?`<span class="calq">${esc(e.local)}</span>`:''}${e.obs?`<span class="calq">${esc(e.obs)}</span>`:''}
      <div class="calacts">${falta?`<span class="calfalta">${falta}</span>`:''}<button class="btn small ghost" data-a="calics" data-id="${esc(e.id)}">Adicionar à agenda</button>${edita?`<button class="btn small ghost" data-a="caledit" data-id="${esc(e.id)}">Editar</button>`:''}</div></div></div>`}
function calForm(e){const novo=!e;e=e||{id:'',tipo:'assembleia',ini:'',fim:'',titulo:'',local:'',obs:''};
  return`<div class="panel calform"><h3 style="margin:0 0 10px;font-size:17px">${novo?'Novo evento':'Editar evento'}</h3>
    <div class="calgrid"><label class="f">Tipo<select id="ce-tipo">${CAL_TIPOS.map(([k,l])=>`<option value="${k}" ${e.tipo===k?'selected':''}>${l}</option>`).join('')}</select></label>
    <label class="f">Título<input type="text" id="ce-tit" value="${esc(e.titulo)}" placeholder="${esc((CAL_T[e.tipo]||CAL_T.outro).l)}" maxlength="120"></label>
    <label class="f">Data (início)<input type="date" id="ce-ini" value="${esc(e.ini)}"></label>
    <label class="f">Até (se durar mais de um dia)<input type="date" id="ce-fim" value="${esc(e.fim)}"></label>
    <label class="f">Local<input type="text" id="ce-loc" value="${esc(e.local)}" maxlength="120" placeholder="Opcional"></label>
    <label class="f">Observação<input type="text" id="ce-obs" value="${esc(e.obs)}" maxlength="160" placeholder="Opcional"></label></div>
    <div class="calacts" style="margin-top:12px"><button class="btn primary" data-a="calsave" data-id="${esc(e.id)}">Salvar</button><button class="btn" data-a="calcancel">Cancelar</button>
    ${novo?'':ui.delAsk==='cal'+e.id?`<span class="confirm">Excluir este evento? <button class="btn small danger" data-a="caldelok" data-id="${esc(e.id)}">Excluir</button><button class="btn small" data-a="calcancel">Não</button></span>`:`<button class="btn ghost danger" data-a="caldel" data-id="${esc(e.id)}">Excluir</button>`}</div></div>`}
function calendarioHTML(){const edita=isAdm();const hoje=iso(new Date());const L=calLista();
  const prox=L.filter(e=>(e.fim&&e.fim>e.ini?e.fim:e.ini)>=hoje),ant=L.filter(e=>(e.fim&&e.fim>e.ini?e.fim:e.ini)<hoje).reverse();
  let lastY='';const grupo=e=>{const y=e.ini.slice(0,4);const h=y!==lastY?`<h3 class="pmes">${y}</h3>`:'';lastY=y;return h};
  const ed=ui.calEdit;const form=ed===''?calForm(null):ed?calForm(L.find(e=>e.id===ed)):'';
  return`<div class="calwrap"><div class="calhead"><div><h2 style="margin:0">Calendário da congregação</h2><p class="hint" style="margin:4px 0 0">Assembleias, Celebração, congressos, visitas e outras datas especiais.${edita?' Só administradores podem alterar.':''}</p></div>${edita&&ed==null?'<button class="btn primary" data-a="calnovo">+ Novo evento</button>':''}</div>
    ${form}
    ${prox.length?prox.map(e=>grupo(e)+calCard(e,edita)).join(''):`<div class="panel" style="padding:20px"><p class="muted" style="margin:0">Nenhum evento marcado.${edita?' Toque em "+ Novo evento" para incluir.':''}</p></div>`}
    ${ant.length?`<details class="calant"><summary>Eventos que já passaram (${ant.length})</summary>${ant.map(e=>calCard(e,edita)).join('')}</details>`:''}</div>`}
function rCalendario(){calSemear();poeHTML($('#v-calendario'),calendarioHTML())}
function calIcs(e){const d=s=>s.replace(/-/g,'');const fim=parse(e.fim&&e.fim>e.ini?e.fim:e.ini);fim.setDate(fim.getDate()+1);
  const txt=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c);
  return['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Designar//PT-BR','BEGIN:VEVENT','UID:'+e.id+'@designar','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',
    'DTSTART;VALUE=DATE:'+d(e.ini),'DTEND;VALUE=DATE:'+d(iso(fim)),'SUMMARY:'+txt(e.titulo||(CAL_T[e.tipo]||CAL_T.outro).l),e.local?'LOCATION:'+txt(e.local):'',e.obs?'DESCRIPTION:'+txt(e.obs):'','END:VEVENT','END:VCALENDAR'].filter(Boolean).join('\r\n')}
function calRender(){if(ui.tab==='painel')rPainel();else rCalendario()}
Object.assign(PACTS,{
  calnovo:()=>{ui.calEdit='';ui.delAsk=null;calRender()},
  caledit:b=>{ui.calEdit=b.dataset.id;ui.delAsk=null;calRender();const f=document.querySelector('.calform');if(f)f.scrollIntoView({block:'start',behavior:'smooth'})},
  calcancel:()=>{ui.calEdit=null;ui.delAsk=null;calRender()},
  caldel:b=>{ui.delAsk='cal'+b.dataset.id;calRender()},
  caldelok:b=>{if(!isAdm())return;cfg.calendario=calLista().filter(e=>e.id!==b.dataset.id);queueSave('config','geral',cfg);ui.calEdit=null;ui.delAsk=null;calRender();toast('Evento excluído')},
  calsave:b=>{if(!isAdm())return;const v=id=>($('#'+id)||{}).value||'';const tipo=v('ce-tipo'),ini=v('ce-ini');let fim=v('ce-fim');
    if(!ini){toast('Informe a data do evento.');return}if(fim&&fim<=ini)fim='';
    const e={id:b.dataset.id||('e'+ini+'-'+Math.random().toString(36).slice(2,6)),tipo,ini,fim,titulo:v('ce-tit').trim()||(CAL_T[tipo]||CAL_T.outro).l,local:v('ce-loc').trim(),obs:v('ce-obs').trim()};
    cfg.calendario=calLista().filter(x=>x.id!==e.id).concat(e);queueSave('config','geral',cfg);ui.calEdit=null;calRender();toast('Evento salvo')},
  calics:async b=>{const e=calLista().find(x=>x.id===b.dataset.id);if(!e)return;await saveFile('evento-'+e.ini+'.ics',new Blob([calIcs(e)],{type:'text/calendar'}))},
  zoomir:()=>{const m=$('#contaMenu');if(m)m.hidden=true;const u=zoomUrl();if(u)window.open(u,'_blank','noopener,noreferrer')}});
document.addEventListener('change',e=>{if(e.target.id==='ce-tipo'){const t=$('#ce-tit');if(t)t.placeholder=(CAL_T[e.target.value]||CAL_T.outro).l}});

/* ---- Zoom: só aceita um endereço https do zoom.us ---- */
function zoomUrl(){const u=String(cfg.zoom||'').trim();try{const x=new URL(u);if(x.protocol==='https:'&&/(^|\.)zoom\.us$/i.test(x.hostname))return x.href}catch(e){}return''}
function zoomCard(){const u=zoomUrl();if(!u)return'';const d=cap(DIAS[+cfg.dia]||''),f=cap(DIAS[+cfg.diaFds]||'');
  const quando=`${esc(d)}${cfg.hora?' '+esc(cfg.hora):''} · ${esc(f)}${cfg.horaFds?' '+esc(cfg.horaFds):''}`;
  return`<a class="zoomlink" href="${esc(u)}" target="_blank" rel="noopener noreferrer" aria-label="Assistir à reunião pelo Zoom (abre o Zoom)">
    <span class="zico" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5l5-3v9l-5-3z"/></svg></span>
    <span class="ztx"><b>Assistir pelo Zoom</b><small>${quando}<span class="zpq"> · para quem não pode ir ao Salão do Reino</span></small></span>
    <span class="zgo" aria-hidden="true">Entrar <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></a>`}
function zoomMenu(){const i=$('#zoomItem');if(i)i.hidden=!zoomUrl()}
