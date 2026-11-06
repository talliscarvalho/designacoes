/* ================= Aba WhatsApp ================= */
function waDoc(){return ui.waKind==='fds'?fds[ui.waFds]:weeks[ui.waWeek]}
function waMsgs(){
  const K=ui.waKind==='fds';const w=waDoc();if(!w)return[];
  const rl=K?rolesFds(w):roles(w);const md=K?w.data:meetDate(w);const reu=K?'Reunião do Fim de Semana':'Reunião Vida e Ministério Cristão';
  const by={};rl.forEach(r=>{(by[r.pub]=by[r.pub]||[]).push(r.txt)});
  const dt=parse(md);
  return Object.entries(by).map(([pid,list])=>{const p=pubs[pid]||{nome:'(removido)'};
    let msg=(cfg.mensagem||DEF_MSG);if(K)msg=msg.replace(/Reunião Vida e Ministério Cristãos?/g,reu);
    msg=msg.replace(/\{nome\}/g,tc(p.nome.split(' ')[0])).replace(/\{nome_completo\}/g,tc(p.nome)).replace(/\{reuniao\}/g,reu)
      .replace(/\{data\}/g,br(md)).replace(/\{dia_semana\}/g,DIAS[dt.getDay()]).replace(/\{hora\}/g,K?(cfg.horaFds||''):cfg.hora)
      .replace(/\{designacoes\}/g,list.map(t=>'• '+t).join('\n')).replace(/\{congregacao\}/g,cfg.congregacao||'');
    return{pid,p,list,msg}}).sort((a,b)=>a.p.nome.localeCompare(b.p.nome,'pt'))}
function weekSummary(w){if(!w)return'';const tp=evTipo(w.data),ev=evOf(w.data)||{};
  let s=`*Vida e Ministério Cristão · ${br(meetDate(w))}*\n`;
  if(SEM_REUNIAO(tp))return s+`\nNão haverá reunião nesta semana: ${EVENTOS[tp]}.`;
  if(tp==='visita')s+=`Visita do superintendente de circuito\n`;
  if(w.leituraSemanal)s+=`Leitura: ${w.leituraSemanal}\n`;
  s+=`\nPresidente: ${pn(w.presidente)||'-'}\nOração inicial: ${pn(w.oracaoInicial)||'-'}\n\n*Tesouros da Palavra de Deus*\n• ${w.tesouros.tema||'Discurso'}: ${pn(w.tesouros.pub)||'-'}\n• Joias Espirituais: ${pn(w.joias.pub)||'-'}\n• Leitura da Bíblia: ${pn(w.leitura.pub)||'-'}\n\n*Faça Seu Melhor no Ministério*\n`;
  w.ministerio.forEach(p=>s+=`• ${temaLabel(p)}: ${isPres(p)?pn(w.presidente)||'-':pn(p.pub)||'-'}${p.ajudante&&!isDiscurso(p)?' / '+pn(p.ajudante):''}\n`);
  s+=`\n*Nossa Vida Cristã*\n`;w.vida.forEach(p=>s+=`• ${p.tema}: ${pn(p.pub)||'-'}\n`);
  s+=tp==='visita'?`• Discurso do superintendente de circuito${ev.temaSC?': '+ev.temaSC:''}\n`:`• Estudo de Congregação: ${pn(w.estudo.dirigente)||'-'} (leitor: ${pn(w.estudo.leitor)||'-'})\n`;
  s+=`\nOração final: ${pn(w.oracaoFinal)||'-'}`;return s}
function fdsSummary(f){if(!f)return'';const tp=evTipo(f.data),ev=evOf(f.data)||{},vis=tp==='visita';
  let s=`*Reunião do Fim de Semana · ${br(f.data)}*\n`;
  if(SEM_REUNIAO(tp))return s+`\nNão haverá reunião nesta semana: ${EVENTOS[tp]}.`;
  let orN=oradorNome(f),orC=oradorCong(f);if(vis&&!orN&&ev.superintendente){orN=ev.superintendente;orC='superintendente de circuito'}
  s+=`\nPresidente: ${pn(f.presidente)||'-'}\n\n*Discurso público*\n• ${discTema(f)||'-'}\n• Orador: ${tc(orN)||'-'}${orC?' ('+orC+')':''}\n\n*${vis?'Resumo de A Sentinela':'Estudo de A Sentinela'}*\n• ${f.sentinela.tema||'-'}\n• Dirigente: ${pn(f.sentinela.dirigente)||'-'}${vis?'':'\n• Leitor: '+(pn(f.sentinela.leitor)||'-')}\n`;
  if(vis)s+=`\n*Discurso final*\n• ${ev.temaFinal||'-'} (${ev.superintendente||'superintendente de circuito'})\n`;
  s+=`\nOração final: ${pn(f.oracaoFinal)||'-'}`;return s}
function waSeg(){const k=ui.waKind;return`<div><div class="hint" style="font-weight:600;margin-bottom:4px">Avisos de</div><div class="seg seg4"><button data-a="wakind" data-k="meio" aria-pressed="${k==='meio'}">Meio de semana</button><button data-a="wakind" data-k="fds" aria-pressed="${k==='fds'}">Fim de semana</button><button data-a="wakind" data-k="limp" aria-pressed="${k==='limp'}">Limpeza</button><button data-a="wakind" data-k="av" aria-pressed="${k==='av'}">A/V e Indicadores</button><button data-a="wakind" data-k="campo" aria-pressed="${k==='campo'}">Saídas de campo</button></div></div>`}
function rWa(){
  if(ui.waKind==='limp')return rWaLimp(waSeg());
  if(ui.waKind==='av')return rWaAV(waSeg());
  if(ui.waKind==='campo')return rWaCampo(waSeg());
  const K=ui.waKind==='fds';
  const list=K?sortedFds():sortedWeeks();
  if(K){if(!ui.waFds||!fds[ui.waFds])ui.waFds=upcomingFds()}else{if(!ui.waWeek||!weeks[ui.waWeek])ui.waWeek=upcomingWeek()}
  const cur=K?ui.waFds:ui.waWeek;const w=waDoc();const ms=waMsgs();const sent=ms.filter(m=>w&&w.enviados[m.pid]).length;
  const tp=w?evTipo(w.data):'';const sum=w?(K?fdsSummary(w):weekSummary(w)):'';
  $('#v-whatsapp').innerHTML=`<div class="wa-top">
     ${waSeg()}
     <label class="f">${K?'Data':'Semana'}<select id="waw">${list.map(x=>`<option value="${x.data}" ${x.data===cur?'selected':''}>${br(K?x.data:meetDate(x))}${evTipo(x.data)?' · '+EVTAG[evTipo(x.data)]:''}</option>`).join('')||'<option>Nada criado ainda</option>'}</select></label>
     ${w?`<span class="progress"><b>${sent}</b> de <b>${ms.length}</b> marcados como enviados</span>
     <span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">${K?'':`<button class="btn" data-a="s89pdf" id="s89pdfBtn">Cartões S-89 da semana (PDF)</button>`}<button class="btn" data-a="wasum">Copiar resumo</button><a class="btn" href="https://wa.me/?text=${encodeURIComponent(sum)}" target="_blank" rel="noopener">Resumo para um grupo</a></span>`:''}
   </div>
   <p class="hint" style="margin:-6px 0 16px">O botão verde abre a conversa do publicador com a mensagem já escrita. Confira e toque em enviar no WhatsApp, depois marque aqui como enviado.${K?' Oradores visitantes não aparecem aqui, porque não estão cadastrados.':' Para quem tem parte de estudante, o botão do cartão S-89 gera a imagem preenchida: baixe e anexe na mesma conversa.'}</p>
   <div class="walist">${w?(SEM_REUNIAO(tp)?`<p class="muted">Não haverá reunião nesta semana (${esc(EVENTOS[tp])}).</p>`:ms.length?ms.map((m,i)=>{const n=waNumber(m.p.tel);return`<div class="panel wacard ${w.enviados[m.pid]?'sent':''}">
      <h3>${esc(m.p.nome)}<span class="tel ${n?'':'none'}">${n?esc(fmtTel(m.p.tel)):'sem telefone'}</span></h3>
      <pre>${esc(m.msg)}</pre>
      <div class="acts">${n?`<a class="btn small wa" href="https://wa.me/${n}?text=${encodeURIComponent(m.msg)}" target="_blank" rel="noopener">Abrir no WhatsApp</a>`:`<a class="btn small" href="#publicadores" data-a="pedit" data-id="${esc(m.pid)}">Cadastrar telefone</a>`}
        <button class="btn small" data-a="wacopy" data-i="${i}">Copiar</button>
        ${K?'':studentParts(w).filter(sp=>sp.pub===m.pid||sp.ajudante===m.pid).map(sp=>`<button class="btn small" data-a="s89" data-n="${sp.n}">Cartão S-89 · parte ${sp.n}</button>`).join('')}
        <label><input type="checkbox" class="wasent" data-pid="${esc(m.pid)}" ${w.enviados[m.pid]?'checked':''}> Enviado</label></div><div class="s89prev"></div></div>`}).join(''):'<p class="muted">Ninguém designado nesta reunião ainda.</p>'):`<p class="muted">${K?'Crie as reuniões na aba Fim de semana primeiro.':'Crie uma semana na aba Meio de semana primeiro.'}</p>`}</div>`;
}
document.addEventListener('change',e=>{
  if(e.target.id==='waw'){if(ui.waKind==='fds')ui.waFds=e.target.value;else ui.waWeek=e.target.value;rWa()}
  if(e.target.classList&&e.target.classList.contains('wasent')){const w=waDoc();if(e.target.checked)w.enviados[e.target.dataset.pid]=new Date().toISOString();else delete w.enviados[e.target.dataset.pid];if(ui.waKind==='fds')saveFds(w);else saveWeek(w);rWa()}
});
async function copyText(t){try{await navigator.clipboard.writeText(t);toast('Copiado')}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('Copiado')}catch(_){toast('Selecione e copie manualmente')}ta.remove()}}

