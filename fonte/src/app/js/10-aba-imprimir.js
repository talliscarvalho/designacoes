/* ================= Aba Imprimir ================= */
const ICONS={
  tes:'<svg viewBox="0 0 24 24"><path fill="#fff" d="M2.5 7c2.8-1.3 6-1.1 8.8.7v11.1c-2.8-1.7-6-1.9-8.8-.7zM21.5 7c-2.8-1.3-6-1.1-8.8.7v11.1c2.8-1.7 6-1.9 8.8-.7z"/></svg>',
  min:'<svg viewBox="0 0 24 24"><path d="M12 22.5V6.5" stroke="#fff" stroke-width="1.3"/><g fill="#fff"><ellipse cx="12" cy="4.2" rx="1.5" ry="2.6"/><ellipse cx="10" cy="8.6" rx="1.4" ry="2.6" transform="rotate(-28 10 8.6)"/><ellipse cx="14" cy="8.6" rx="1.4" ry="2.6" transform="rotate(28 14 8.6)"/><ellipse cx="10" cy="12.4" rx="1.4" ry="2.6" transform="rotate(-28 10 12.4)"/><ellipse cx="14" cy="12.4" rx="1.4" ry="2.6" transform="rotate(28 14 12.4)"/><ellipse cx="10" cy="16.2" rx="1.4" ry="2.6" transform="rotate(-28 10 16.2)"/><ellipse cx="14" cy="16.2" rx="1.4" ry="2.6" transform="rotate(28 14 16.2)"/></g></svg>',
  vida:'<svg viewBox="0 0 24 24"><g fill="#fff"><circle cx="10" cy="10.5" r="3"/><circle cx="13.5" cy="9.6" r="3.2"/><circle cx="16.8" cy="11" r="2.9"/><circle cx="11.5" cy="13.2" r="3"/><circle cx="15.3" cy="13.4" r="3"/><ellipse cx="6.4" cy="11" rx="2" ry="2.6"/><rect x="9.6" y="15" width="1.3" height="4.6" rx=".5"/><rect x="11.9" y="15.4" width="1.3" height="4.3" rx=".5"/><rect x="15" y="15.4" width="1.3" height="4.3" rx=".5"/><rect x="17.1" y="14.8" width="1.3" height="4.8" rx=".5"/></g><circle cx="5.9" cy="10.4" r=".45" fill="#B0182C"/></svg>'};
const PAPER={A4:[794,1123],Carta:[816,1056]};
function nm(id,suffix){const n=pname(id);return n?esc(n)+(suffix?` <small>(${suffix})</small>`:''):`<span class="empty">a designar</span>`}
function whoCls(id){return'who'+(pname(id)?'':' empty')}
function weekColor(w){
  const tp=evTipo(w.data),ev=evOf(w.data)||{},vis=tp==='visita';
  if(SEM_REUNIAO(tp))return`<div class="cw"><div class="dbar">Semana de ${br(w.data)}<span>${esc(EVENTOS[tp].toUpperCase())}</span></div><div class="noreu">Não haverá reunião nesta semana: ${esc(EVENTOS[tp])}</div></div>`;
  const L=(n,t,who,mid,tCls)=>`<div class="ln"><span>${n!==''&&n!=null?`<span class="n">${esc(n)}</span>`:''}</span><span class="${tCls||'t'}">${t}</span><span class="mid">${mid||''}</span>${who}</div>`;
  const W=(id,suf)=>`<span class="${whoCls(id)}">${nm(id,suf)}</span>`;
  return`<div class="cw">
   <div class="dbar">${br(meetDate(w))}${vis||w.leituraSemanal?`<span>${vis?'VISITA DO SUPERINTENDENTE DE CIRCUITO':''}${vis&&w.leituraSemanal?' · ':''}${esc((w.leituraSemanal||'').toUpperCase())}</span>`:''}</div>
   ${L('',esc(cant(w.canticoInicial)?'Cântico '+cant(w.canticoInicial):'Cântico'),W(w.oracaoInicial,'Oração'),'','c')}
   ${L(1,'Comentários Iniciais',W(w.presidente))}
   <div class="blk b-tes"><div class="bh"><div class="ic">${ICONS.tes}</div><h4>Tesouros da Palavra de Deus</h4></div>
     ${L(10,esc(w.tesouros.tema||'Discurso'),W(w.tesouros.pub))}${L(10,'Encontre Joias Espirituais',W(w.joias.pub))}${L(4,'Leitura da Bíblia',W(w.leitura.pub))}</div>
   <div class="blk b-min"><div class="bh"><div class="ic">${ICONS.min}</div><h4>Faça Seu Melhor no Ministério</h4></div>
     ${w.ministerio.map(p=>{const disc=isDiscurso(p);const who=isPres(p)?W(w.presidente):disc||!p.ajudante?W(p.pub):`<span class="${whoCls(p.pub)}">${nm(p.pub)} / ${nm(p.ajudante)}</span>`;return L(p.min,esc(temaLabel(p)),who)}).join('')}</div>
   <div class="blk b-vida"><div class="bh"><div class="ic">${ICONS.vida}</div><h4>Nossa Vida Cristã${cant(w.canticoMeio)?`<em>Cântico ${esc(cant(w.canticoMeio))}</em>`:''}</h4></div>
     ${w.vida.map(p=>L(p.min,esc(p.tema),W(p.pub))).join('')}
     ${vis?L(30,esc('Discurso do superintendente de circuito'+(ev.temaSC?': '+ev.temaSC:'')),ev.superintendente?`<span class="who">${esc(ev.superintendente)}</span>`:`<span class="who empty">a definir</span>`):L(30,'Estudo de Congregação',W(w.estudo.dirigente),w.estudo.leitor?nm(w.estudo.leitor,'Leitor'):'')}
     ${L(3,'Comentários Finais','<span></span>')}
     ${L('',esc(cant(w.canticoFinal)?'Cântico '+cant(w.canticoFinal):'Cântico'),W(w.oracaoFinal,'Oração'),'','c')}</div>
  </div>`}
function addMin(h,m){const[a,b]=(h||'19:30').split(':').map(Number);const t=a*60+b+m;return Math.floor(t/60)%24+':'+pad(t%60)}
function weekS140(w){
  const tp=evTipo(w.data),ev=evOf(w.data)||{},vis=tp==='visita';
  if(SEM_REUNIAO(tp))return`<div class="s1"><div class="wh"><b>Semana de ${br(w.data).slice(0,5)}</b></div><div class="noreu">Não haverá reunião nesta semana: ${esc(EVENTOS[tp])}</div><div class="sp"></div></div>`;
  let t=0;const T=()=>addMin(cfg.hora,t);const N=(id)=>`<span class="nm${pname(id)?'':' empty'}">${pname(id)?esc(pname(id)):'—'}</span>`;
  const R=(tx,lb,who,bul)=>`<div class="r"><span class="tm">${T()}</span><span class="tx${bul?' bul':''}">${tx}</span><span class="lb">${lb||''}</span>${who||'<span></span>'}</div>`;
  let h=`<div class="s1"><div class="wh"><b>${br(meetDate(w)).slice(0,5)}${w.leituraSemanal?' | '+esc(w.leituraSemanal.toUpperCase()):''}${vis?' | VISITA DO SUPERINTENDENTE':''}</b><div class="kv"><span>Presidente:</span>${N(w.presidente)}</div></div>`;
  h+=R('Cântico '+esc(cant(w.canticoInicial)||''),'Oração:',N(w.oracaoInicial),1);t+=5;
  h+=R('Comentários iniciais <small>(1 min)</small>','','',1);t+=1;
  h+=`<div class="bar"><b style="background:#575A5D">Tesouros da Palavra de Deus</b><span></span></div>`;
  h+=R('1. '+esc(w.tesouros.tema||'Discurso')+' <small>(10 min)</small>','',N(w.tesouros.pub));t+=10;
  h+=R('2. Joias espirituais <small>(10 min)</small>','',N(w.joias.pub));t+=10;
  h+=R('3. Leitura da Bíblia <small>(4 min)</small>','Estudante:',N(w.leitura.pub));t+=5;
  h+=`<div class="bar"><b style="background:#BE8900">Faça Seu Melhor no Ministério</b><span></span></div>`;
  let n=4;w.ministerio.forEach(p=>{const disc=isDiscurso(p);if(isPres(p)){h+=R(n+++'. '+esc(p.tema)+' <small>('+esc(p.min)+' min)</small>','Presidente:',N(w.presidente));t+=(+p.min||0);return}h+=R(n+++'. '+esc(temaLabel(p))+' <small>('+esc(p.min)+' min)</small>',partTipo(p)==='consideracao'?'':disc?'Estudante:':'Estudante/ajudante:',disc?N(p.pub):`<span>${N(p.pub)}${p.ajudante?' / '+N(p.ajudante):''}</span>`);t+=(+p.min||0)+1});
  h+=`<div class="bar"><b style="background:#7E0024">Nossa Vida Cristã</b><span></span></div>`;
  h+=R('Cântico '+esc(cant(w.canticoMeio)||''),'','',1);t+=5;
  w.vida.forEach(p=>{h+=R(n+++'. '+esc(p.tema)+' <small>('+esc(p.min)+' min)</small>','',N(p.pub));t+=(+p.min||0)});
  if(vis)h+=R(n+++'. Discurso do superintendente de circuito'+(ev.temaSC?': '+esc(ev.temaSC):'')+' <small>(30 min)</small>','',`<span class="nm">${esc(ev.superintendente||'—')}</span>`);
  else h+=R(n+++'. Estudo bíblico de congregação <small>(30 min)</small>','Dirigente/leitor:',`<span>${N(w.estudo.dirigente)} / ${N(w.estudo.leitor)}</span>`);t+=30;
  h+=R('Comentários finais <small>(3 min)</small>','','',1);t+=3;
  h+=R('Cântico '+esc(cant(w.canticoFinal)||''),'Oração:',N(w.oracaoFinal),1);
  return h+'</div>'}
function pageHead(sub,kind){
  const c=cfg.congregacao||'';const cn=esc(/^congrega/i.test(c)?c:'Congregação '+c);
  if(kind==='limp')return`<div class="ph"><h2>${cn}</h2><hr><p class="fdsub">DESIGNAÇÕES DE LIMPEZA</p></div>`;
  if(kind==='av')return`<div class="ph"><h2>${cn}</h2><hr><p class="fdsub">ÁUDIO/VÍDEO E INDICADORES</p></div>`;
  if(kind==='campo')return`<div class="ph"><h2>${cn}</h2><hr><p class="fdsub">SAÍDAS DE CAMPO</p></div>`;
  if(kind==='fds')return`<div class="ph"><h2>${cn}</h2><hr><p class="fdsub">REUNIÃO DO FIM DE SEMANA${sub?' &nbsp;·&nbsp; '+esc(sub.toUpperCase()):''}</p></div>`;
  if(cfg.modelo==='s140')return`<div class="s1h"><b>${esc(c)}</b><h2>Programação da reunião do meio de semana</h2></div>`;
  return`<div class="ph"><h2>${cn}</h2><hr><p>Reunião Vida e Ministério Cristãos&nbsp; - &nbsp;${esc(sub)}</p></div>`}
function printState(){const kind=ui.printKind||'meio';const C=kind==='campo',K=kind==='fds',L=kind==='limp'||kind==='av',AV=kind==='av';
  const all=C?sortedCampo().map(c=>({data:cThu(c.semana),mon:c.semana})):L?(AV?avMonths():limpMonths()).map(m=>({data:m+'-01',ym:m})):K?sortedFds():sortedWeeks();const key=C?'printSelC':AV?'printSelA':L?'printSelL':K?'printSelF':'printSel';
  /* seleção feita antes de os dados chegarem (ex.: abrir direto em Imprimir): refaz quando os dados mudam */
  if(ui[key]&&!ui[key].size&&ui[key+'N']!==all.length)ui[key]=null;
  if(!ui[key]){ui[key+'N']=all.length;const m=C?(ui.campoMonth||cThu(weekMonday(iso(new Date()))).slice(0,7)):AV?(ui.avMonth||iso(new Date()).slice(0,7)):L?(ui.limpMonth||iso(new Date()).slice(0,7)):((K?upcomingFds():upcomingWeek())||iso(new Date())).slice(0,7);ui[key]=new Set(all.filter(w=>w.data.startsWith(m)).map(w=>w.data))}
  const sel=all.filter(w=>ui[key].has(w.data));return{kind,C,K,L,AV,all,key,set:ui[key],sel,autoSub:L?sel.map(w=>cap(monthLabel(w.ym))).join(', '):sel.length?cap(monthLabel(sel[0].data.slice(0,7))):''}}
function rPrint(){
  const P=printState(),{C,K,L,all,sel}=P;
  const months=[...new Set(all.map(w=>w.data.slice(0,7)))];
  $('#v-imprimir').innerHTML=`<div class="printctl">
    <div class="panel pc-side">
      <div><div class="hint" style="font-weight:600;margin-bottom:6px">O que imprimir</div><div class="seg seg4"><button data-a="pkind" data-k="meio" aria-pressed="${!K&&!L&&!C}">Meio de semana</button><button data-a="pkind" data-k="fds" aria-pressed="${K}">Fim de semana</button><button data-a="pkind" data-k="limp" aria-pressed="${L&&!P.AV}">Limpeza</button><button data-a="pkind" data-k="av" aria-pressed="${!!P.AV}">A/V e Indicadores</button><button data-a="pkind" data-k="campo" aria-pressed="${C}">Saídas de campo</button></div></div>
      ${K||L||C?'':`<div><div class="hint" style="font-weight:600;margin-bottom:6px">Modelo da folha</div><div class="seg"><button data-a="pmode" data-m="cores" aria-pressed="${cfg.modelo!=='s140'}">Colorido</button><button data-a="pmode" data-m="s140" aria-pressed="${cfg.modelo==='s140'}">S-140</button></div></div>`}
      ${L||C?'':`<label class="f">Subtítulo (mês)<input type="text" id="psub" value="${esc(ui.printSub)}" placeholder="${esc(P.autoSub)}"></label>`}
      <div><div class="hint" style="font-weight:600;margin-bottom:6px">${L?'Meses na folha':K?'Reuniões na folha':C?'Semanas de saída na folha':'Semanas na folha'}</div>
        <div class="wkchecks">${L?all.map(w=>`<label><input type="checkbox" class="pw" value="${w.data}" ${P.set.has(w.data)?'checked':''}> ${cap(monthLabel(w.ym))}</label>`).join(''):months.length?months.map(m=>`<div class="mg">${monthLabel(m)}<button data-a="pselall" data-m="${m}">só este mês</button></div>${all.filter(w=>w.data.startsWith(m)).map(w=>{const tp=evTipo(w.data);return`<label><input type="checkbox" class="pw" value="${w.data}" ${P.set.has(w.data)?'checked':''}> ${C?esc(campoLabel(w.mon)):br(K?w.data:meetDate(w))}${tp?` <span class="evtag">${EVTAG[tp]}</span>`:''}</label>`}).join('')}`).join(''):`<p class="muted">${K?'Nenhuma reunião de fim de semana criada.':C?'Nenhuma semana de saídas montada.':'Nenhuma semana criada.'}</p>`}</div></div>
      <button class="btn primary" data-a="pdf" id="pdfBtn" ${sel.length?'':'disabled'} style="justify-content:center">Baixar PDF para imprimir</button>
      <p class="hint" style="margin:0">Papel ${esc(cfg.papel)}${L?'':' · '+(K?'quatro reuniões':'duas semanas')+' por folha'}. Abra o PDF e imprima normalmente.</p>
    </div>
    <div class="stage" id="printStage"></div></div>`;
  layoutPages(sel,ui.printSub||P.autoSub,P.kind);
}
function layoutPages(sel,sub,kind,stage){
  const st=stage||$('#printStage');if(!st)return;st.innerHTML='';
  if(!sel.length){st.innerHTML=`<p class="muted">Marque o que deve aparecer na folha.</p>`;return}
  const[PW,PH]=PAPER[cfg.papel]||PAPER.A4;
  const avail=Math.min(st.clientWidth||PW,PW);const s=avail/PW;
  let page,body;
  const newPage=()=>{const wrap=document.createElement('div');wrap.className='pagewrap';wrap.style.width=PW*s+'px';wrap.style.height=PH*s+'px';
    page=document.createElement('div');page.className='page';page.style.width=PW+'px';page.style.height=PH+'px';page.style.transform=`scale(${s})`;
    page.innerHTML=pageHead(sub,kind)+'<div class="pbody"></div>';body=page.querySelector('.pbody');wrap.appendChild(page);st.appendChild(wrap)};
  newPage();
  sel.forEach(w=>{const d=document.createElement('div');d.innerHTML=kind==='campo'?campoHTML(w.mon):kind==='av'?avHTML(w.ym):kind==='limp'?limpHTML(w.ym):kind==='fds'?weekFds(w):(cfg.modelo==='s140'?weekS140(w):weekColor(w));const el=d.firstElementChild;body.appendChild(el);
    if(body.scrollHeight>body.clientHeight+1&&body.children.length>1){el.remove();newPage();body.appendChild(el)}});
}
document.addEventListener('change',e=>{if(e.target.classList&&e.target.classList.contains('pw')){const P=printState();e.target.checked?P.set.add(e.target.value):P.set.delete(e.target.value);rPrint()}});
document.addEventListener('input',e=>{if(e.target.id==='psub'){ui.printSub=e.target.value;clearTimeout(ui.psubT);ui.psubT=setTimeout(()=>{if(ui.tab!=='imprimir')return;const P=printState();layoutPages(P.sel,ui.printSub||P.autoSub,P.kind)},200)}});
let rzT;window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(ui.tab==='imprimir')rPrint()},200)});

async function saveFile(filename,blob){
  if(dl){try{await dl.save({filename,data:blob});toast('Arquivo pronto');return true}catch(e){if(e&&e.code==='declined')return false;toast('Não foi possível baixar o arquivo aqui ('+(e&&e.code||'erro')+')');return false}}
  try{const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);return true}catch(e){toast('Download indisponível nesta visualização');return false}}