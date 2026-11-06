/* ================= Renderização geral ================= */
let renderQueued=false;
/* só redesenha a tela quando os dados mudaram de verdade (o Firebase também avisa quando só confirma o que já estava no aparelho) */
let lastSig='';
function dataSig(){try{return JSON.stringify([pubs,weeks,fds,evs,lgr,lmp,stk,avd,cmp,cfg,typeof resp==='undefined'?0:resp,loaded])}catch(e){return String(Math.random())}}
function changed(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;const sg=dataSig();if(sg===lastSig){syncNomes();syncAgenda();return}lastSig=sg;buildHist();renderAll(true);bkCheck();syncNomes();syncAgenda();copiaAuto()})}
function renderAll(fromData){
  $('#hName').textContent=cfg.congregacao&&cfg.congregacao!=='Congregação'?'Congregação '+cfg.congregacao.replace(/^Congrega[cç][aã]o\s+/i,''):'';
  if(painelOnly())ui.tab='painel';
  drawNav();contaSync();
  ['semanas','fimdesemana','limpeza','av','campo','publicadores','imprimir','whatsapp','ajustes','painel','pubimport','equilibrio','confirmacoes'].forEach(t=>$('#v-'+t).hidden=t!==ui.tab);
  const v=$('#v-'+ui.tab);
  lembreteS89();pedidoBox();instalarBox();avisoBox();
  if(fromData&&v.contains(document.activeElement)&&document.activeElement.matches('input,textarea,select'))return; // não atrapalha quem está digitando
  ({semanas:rSemanas,fimdesemana:rFds,limpeza:rLimpeza,av:rAV,campo:rCampo,publicadores:rPubs,imprimir:rPrint,whatsapp:rWa,ajustes:rAjustes,painel:rPainel,pubimport:rPubImport,equilibrio:rEquilibrio,confirmacoes:rConfirm})[ui.tab]();
}
/* Tema: segue o sistema (automático) ou fica fixo em claro/escuro; a escolha fica guardada neste aparelho */
const TEMAS=['auto','claro','escuro'];
const TEMA_ICO={auto:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/></svg>',
  claro:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
  escuro:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'};
const TEMA_TXT={auto:'Tema automático (segue o aparelho)',claro:'Tema claro',escuro:'Tema escuro'};
function temaGet(){try{const t=localStorage.getItem('vmc-tema');return TEMAS.includes(t)?t:'auto'}catch(e){return'auto'}}
function temaApply(t){const r=document.documentElement;if(t==='claro')r.dataset.theme='light';else if(t==='escuro')r.dataset.theme='dark';else delete r.dataset.theme;
  const b=$('#temaBtn');if(b){b.innerHTML=TEMA_ICO[t];b.setAttribute('aria-label',TEMA_TXT[t]+'. Toque para trocar.');b.title=TEMA_TXT[t]}}
temaApply(temaGet());
document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#temaBtn'))return;const n=TEMAS[(TEMAS.indexOf(temaGet())+1)%3];try{localStorage.setItem('vmc-tema',n)}catch(err){}temaApply(n);toast(TEMA_TXT[n])});
/* Navegação por áreas; cada área lembra a última aba aberta */
const NAVI={cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  casa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
  gente:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2 .2 3.6 1.5 4.3 4"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M7 14h10v6H7z"/></svg>',
  mais:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/></svg>'};
const AREAS=[{k:'reunioes',l:'Reuniões',i:'cal',t:[['semanas','Meio de semana'],['fimdesemana','Fim de semana']]},
  {k:'limpeza',l:'Limpeza',i:'casa',t:[['limpeza','Limpeza e itens'],['av','A/V e Indicadores']]},
  {k:'pregacao',l:'Pregação',i:'pin',t:[['campo','Saídas de campo']]},
  {k:'publicadores',l:'Publicadores',i:'gente',t:[['publicadores','Publicadores'],['confirmacoes','Confirmações'],['equilibrio','Equilíbrio'],['pubimport','Importar e exportar']]},
  {k:'imprimir',l:'Imprimir',i:'print',t:[['imprimir','Imprimir / PDF']]},
  {k:'mais',l:'Mais',i:'mais',t:[['whatsapp','WhatsApp'],['ajustes','Ajustes']]}];
function navAreas(){if(painelOnly())return[];if(!myPubId())return AREAS;return AREAS.map(a=>a.k==='mais'?Object.assign({},a,{t:[['painel','Meu painel'],...a.t]}):a)}
function drawNav(){const AR=navAreas();const cur=AR.find(a=>a.t.some(x=>x[0]===ui.tab))||AR[0]||{k:'',t:[]};ui.areaLast=ui.areaLast||{};ui.areaLast[cur.k]=ui.tab;
  const href=a=>'#'+(ui.areaLast[a.k]||a.t[0][0]);
  $('#areas').innerHTML=AR.map(a=>`<a href="${href(a)}" aria-current="${a===cur?'page':'false'}">${a.l}</a>`).join('');
  $('#bnav').innerHTML=AR.map(a=>`<a href="${href(a)}" aria-current="${a===cur?'page':'false'}">${NAVI[a.i]}${a.l}</a>`).join('');
  $('#subtabs').innerHTML=cur.t.length>1?cur.t.map(([k,l])=>`<a href="#${k}" aria-current="${k===ui.tab?'page':'false'}">${l}</a>`).join(''):''}
function route(){ui.delAsk=null;const h=location.hash.slice(1);ui.tab=['semanas','fimdesemana','limpeza','av','campo','publicadores','imprimir','whatsapp','ajustes','painel','pubimport','equilibrio','confirmacoes'].includes(h)?h:'semanas';renderAll()}
window.addEventListener('hashchange',route);

/* cabeçalho da folha e item da lista de semanas (bloco de calendário + situação) */
function sheetHead(date,hora){const d=parse(date);return`<div class="sheethead"><small>${DIAS[d.getDay()]} · ${esc(hora||'')}</small><h2>${d.getDate()} de ${MESES[d.getMonth()]}</h2></div>`}
function wkItem(act,id,date,n,t,sel){const tp=evTipo(id),off=SEM_REUNIAO(tp);const dt=parse(date);
  const title=off?EVENTOS[tp]:tp==='visita'?'Visita do superintendente':n>=t?'Semana completa':(t-n)+(t-n>1?' designações em aberto':' designação em aberto');
  const lab=cap(DIAS[dt.getDay()])+', '+dt.getDate()+' de '+MESES[dt.getMonth()]+': '+title;
  return`<button class="wk${off?' ev':''}" data-a="${act}" data-id="${esc(id)}" aria-current="${sel}" aria-label="${esc(lab)}"><span class="cal" aria-hidden="true"><small>${DIAS[dt.getDay()].slice(0,3).toUpperCase()}</small><b>${pad(dt.getDate())}</b></span>
    <span class="wi" aria-hidden="true"><span class="wt">${esc(title)}</span>${off?'<span class="wev">Sem reunião nesta semana</span>':`<span class="wbar"><i><span style="width:${t?Math.round(100*Math.min(n,t)/t):0}%"></span></i>${n} de ${t}</span>`}</span></button>`}
function sortedWeeks(){return Object.values(weeks).sort((a,b)=>a.data<b.data?-1:1)}
function upcomingWeek(){const t=iso(new Date());const ws=sortedWeeks();return(ws.find(w=>w.data>=t)||ws[ws.length-1]||{}).data||null}

