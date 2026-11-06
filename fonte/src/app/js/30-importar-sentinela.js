/* ================= Importar A Sentinela (edição de estudo) ================= */
/* Lê o PDF ou o RTF da revista de estudo e preenche, em cada reunião do fim de semana,
   o título do artigo e os cânticos (o do início do estudo e o final). Os nomes não mudam. */
const SEN={};
SEN.MESES=['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
SEN.mi=s=>SEN.MESES.indexOf(String(s||'').toUpperCase().replace('MARCO','MARÇO'));
SEN.limpa=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?”’])/g,'$1').replace(/([“‘])\s+/g,'$1')
  /* "l ínguas": letra solta antes de uma vogal acentuada, sobra de PDFs */
  .replace(/(^|\s)(\p{Ll}) ([áéíóúâêôãõ]\p{Ll}+)/gu,'$1$2$3').trim();
SEN.parse=function(text,opts){opts=opts||{};const dia=opts.dia??0;
  const t=String(text).replace(/[\x00-\x08\x0b-\x1f\x7f]+/g,'\n___\n').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/ ?\n ?/g,'\n');
  const M='(JANEIRO|FEVEREIRO|MARÇO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)';
  /* cabeçalho de cada artigo: "2-8 DE NOVEMBRO DE 2026" ou "30 DE NOVEMBRO–6 DE DEZEMBRO DE 2026" (só uma semana) */
  const rh=new RegExp('(\\d{1,2})\\s*(?:DE\\s+'+M+'\\s*)?[-–]\\s*(\\d{1,2})\\s+DE\\s+'+M+'\\s+DE\\s+(20\\d\\s?\\d)','g');
  const heads=[];let m;
  while((m=rh.exec(t))){const ano=+m[5].replace(/\s/g,''),m2=SEN.mi(m[4]),m1=m[2]?SEN.mi(m[2]):m2;const d1=+m[1],d2=+m[3];
    const ini=new Date(m1>m2?ano-1:ano,m1,d1),fim=new Date(ano,m2,d2);
    if(Math.round((fim-ini)/864e5)!==6||ini.getDay()!==1)continue;
    const seg=iso(ini);if(heads.some(h=>h.seg===seg))continue;heads.push({seg,idx:m.index,end:rh.lastIndex,ini,fim})}
  /* índice ("Estudo para 2-8 de novembro  2  Título") dá o título completo do artigo */
  const toc={};const rt=/Estudo para (\d{1,2})(?:\s+de\s+(\p{L}+))?\s*[-–]\s*(\d{1,2})\s+de\s+(\p{L}+)\s+\d{1,3}\s+([\s\S]+?)(?=\n?_{3,}|\n\s*Estudo para|\n\s*Esta publica|$)/giu;
  while((m=rt.exec(t))){const mm=SEN.mi(m[2]||m[4]);if(mm<0)continue;toc[(+m[1])+'/'+mm]=SEN.limpa(m[5])}
  const out=heads.sort((a,b)=>a.idx-b.idx).map((h,k)=>{
    const body=t.slice(h.end,k+1<heads.length?heads[k+1].idx:t.length).split(/\n\s*Estudo para \d/)[0];
    const cants=[...body.matchAll(/C[ÂA]NTICO\s+(\d{1,3})\b/gi)].map(x=>x[1]);
    let tema=toc[h.ini.getDate()+'/'+h.ini.getMonth()]||'';let aviso=[];
    /* o índice às vezes emenda o texto seguinte: fica só a parte do título que aparece no próprio artigo */
    if(tema){const N=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');const nb=N(t.slice(Math.max(0,h.idx-2500),h.end+1500));const ws=tema.split(' ');let ok='';
      for(let n=Math.min(ws.length,30);n>=1;n--){const pf=ws.slice(0,n).join(' ');if(nb.includes(N(pf))){ok=pf;break}}
      tema=ok.replace(/[—–-]\s*$/,'').trim()}
    if(!tema){/* sem índice: as linhas antes do texto-tema, tirando o cântico e o nome dele */
      const pre=body.split(/\n\s*[“"]/)[0].split(/\n\s*\n/).map(b=>b.trim()).filter(b=>b&&!/^C[ÂA]NTICO\s+\d/i.test(b));
      const antes=body.split(/C[ÂA]NTICO\s+\d{1,3}/i)[0].trim();
      tema=SEN.limpa(antes.length>8?antes:(pre[0]||''));if(tema)aviso.push('confira o título')}
    const md=new Date(h.ini);md.setDate(md.getDate()+((+dia)+6)%7);
    if(!cants.length)aviso.push('cânticos não encontrados');else if(cants.length<2)aviso.push('cântico final não encontrado');
    if(!tema)aviso.push('título não encontrado');
    return{semana:h.ini.getDate()+'/'+(h.ini.getMonth()+1)+'–'+h.fim.getDate()+'/'+(h.fim.getMonth()+1),seg:h.seg,data:iso(md),tema,
      canticoSentinela:cants[0]||'',canticoFinal:cants.length>1?cants[cants.length-1]:'',avisos:aviso,on:true}});
  return{semanas:out}};

let senImp=null;
function senTarget(date){const mon=weekMonday(date);const s2=shiftDays(mon,6);return sortedFds().find(f=>f.data>=mon&&f.data<=s2)||null}
function senPanel(){
  const head=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><h2>Importar A Sentinela</h2><button class="btn small ghost" data-a="senclose">Fechar</button></div>`;
  const drop=`<label class="drop" for="senfile"><b>Escolha o arquivo de A Sentinela</b><span class="hint">PDF ou RTF da edição de estudo, baixada do jw.org. O sistema lê, de cada semana, o título do artigo, o cântico do estudo e o cântico final. Os nomes não mudam.</span><span class="btn primary dropbtn">Escolher arquivo</span><input type="file" id="senfile"></label>`;
  const S=senImp;
  if(!S)return`<div class="panel imp">${head}${drop}</div>`;
  if(S.lendo)return`<div class="panel imp">${head}<p>Lendo ${esc(S.nome)}…</p></div>`;
  if(S.erro)return`<div class="panel imp">${head}${drop}<div class="drawres short">${esc(S.erro)}</div></div>`;
  const on=S.semanas.filter(x=>x.on);
  return`<div class="panel imp">${head}
    <p class="hint" style="margin:0">${esc(S.nome)}: ${S.semanas.length} artigo${S.semanas.length===1?'':'s'} de estudo. As datas usam o dia da reunião (${DIAS[cfg.diaFds]}). Reuniões que já existem são atualizadas e mantêm os nomes já escolhidos.</p>
    ${S.semanas.map((x,i)=>{const tg=senTarget(x.data);return`<div class="impw ${x.on?'':'off'}">
      <input type="checkbox" class="senon" data-i="${i}" ${x.on?'checked':''} aria-label="Importar a semana ${esc(x.semana)}">
      <div><div class="top"><input type="date" class="sendate" data-i="${i}" value="${x.data}" aria-label="Data da reunião"><b>Semana ${esc(x.semana)}</b>${tg?`<span class="tagupd">atualiza ${br(tg.data).slice(0,5)}</span>`:'<span class="tagnew">nova</span>'}</div>
      <ul><li><b>Artigo:</b> ${esc(x.tema||'—')}</li><li><b>Cânticos:</b> ${esc(x.canticoSentinela||'?')} (estudo) · ${esc(x.canticoFinal||'?')} (final)</li></ul>
      ${x.avisos.length?`<div class="warnline">Confira: ${esc(x.avisos.join('; '))}.</div>`:''}</div></div>`}).join('')}
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-a="sengo" ${on.length?'':'disabled'}>Importar ${on.length} semana${on.length===1?'':'s'}</button><button class="btn" data-a="senclose">Cancelar</button></div>
  </div>`}
async function senRead(f){senImp={nome:f.name,lendo:true};impDiag={};rFds();
  try{const t=await fileToText(f);const r=SEN.parse(t,{dia:cfg.diaFds});
    if(!r.semanas.length){
      if(APO.parse(t,{dia:cfg.dia}).semanas.length)throw new Error('Este arquivo é a Apostila da Reunião Vida e Ministério. Para importá-la, use a aba Meio de semana › Importar apostila.');
      throw new Error(impDiag.tipo==='pdf'&&t.replace(/\s/g,'').length<200?'Este PDF não tem texto que possa ser lido (parece ser uma imagem). Use o PDF original de A Sentinela, baixado do jw.org, ou o RTF.':'Não encontrei artigos de estudo neste arquivo. Confira se é A Sentinela (edição de estudo), em PDF ou RTF.')}
    senImp={nome:f.name,semanas:r.semanas}}
  catch(e){senImp={nome:f.name,erro:(e&&e.message)||'Não foi possível ler o arquivo.'};if(/carregou/.test(senImp.erro))senImp.erro='Não foi possível carregar o leitor de PDF. Verifique a internet e tente de novo.';else if(/Invalid PDF|PDF structure|password/i.test(senImp.erro))senImp.erro='Este PDF está danificado ou protegido e não pode ser lido. Baixe a revista de novo no jw.org e tente outra vez.'}
  rFds()}
function senApply(){const list=senImp.semanas.filter(x=>x.on);let n=0,first=null;
  list.forEach(x=>{const tg=senTarget(x.data);const f=normF(tg?clone(tg):newFds(x.data));
    if(x.tema)f.sentinela.tema=x.tema;if(x.canticoSentinela)f.canticoSentinela=x.canticoSentinela;if(x.canticoFinal)f.canticoFinal=x.canticoFinal;
    saveFds(f);n++;if(!first||f.data<first)first=f.data});
  senImp=null;ui.senImp=false;if(first){ui.fdsSel=first;ui.fdsMonth=first.slice(0,7)}rFds();toast(n+' reuni'+(n===1?'ão atualizada':'ões atualizadas'))}
Object.assign(PACTS,{
  senopen:()=>{ui.senImp=true;senImp=null;rFds();const el=document.querySelector('#v-fimdesemana .imp');if(el)el.scrollIntoView({block:'start',behavior:'smooth'})},
  senclose:()=>{ui.senImp=false;senImp=null;rFds()},
  sengo:()=>senApply()});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='senfile'&&t.files&&t.files[0])senRead(t.files[0]);
  if(t.classList&&t.classList.contains('senon')&&senImp){senImp.semanas[+t.dataset.i].on=t.checked;rFds()}
  if(t.classList&&t.classList.contains('sendate')&&t.value&&senImp){senImp.semanas[+t.dataset.i].data=t.value;rFds()}});
