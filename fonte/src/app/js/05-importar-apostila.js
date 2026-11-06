/* ================= Importar apostila ================= */
/* ===== Leitor de apostila (PDF/RTF) — compartilhado entre a página e os testes ===== */
const APO={};
APO.ACC={'´':'́','`':'̀','ˆ':'̂','˜':'̃','¸':'̧','¨':'̈','^':'̂','~':'̃'};
APO.itemsToText=function(items){
  const T=items.map(it=>({s:it.str,x:it.transform[4],y:it.transform[5],w:it.width||0,eol:!!it.hasEOL}));
  const isAcc=t=>t&&t.s.length===1&&APO.ACC[t.s]&&!/[A-Za-z]/.test(t.s);
  let out='',pend=null;
  for(let i=0;i<T.length;i++){const t=T[i];
    if(t.s.trim()===''&&t.s!==''&&t.w<1&&isAcc(T[i+1]))continue; // espaço falso antes do acento
    if(isAcc(t)){
      let j=i+1;while(j<T.length&&T[j].s==='')j++;const nx=T[j];
      let k=i-1;while(k>=0&&T[k].s.trim()==='')k--;const pv=T[k];
      if(!nx){continue}
      const join=pv&&Math.abs(pv.y-nx.y)<2&&(nx.x-(pv.x+pv.w))<1.5;
      if(join)out=out.replace(/[ \t]+$/,'');
      else if(pv&&Math.abs(pv.y-nx.y)>=2){out=out.replace(/[ \t]+$/,'');if(!/\n$/.test(out))out+='\n'}
      else if(!/[ \n]$/.test(out))out+=' ';
      pend=APO.ACC[t.s];i=j-1;continue}
    let s=t.s;
    if(pend&&s){const c=s[0]==='ı'?'i':s[0];s=(c+pend).normalize('NFC')+s.slice(1);pend=null}
    out+=s+(t.eol?'\n':'');
  }
  out=out.replace(/\s?¸\s?([cC])/g,(m,c)=>(c+'\u0327')).replace(/([´`ˆ˜¨])([A-Za-zı])/g,(m,a,c)=>(c==='ı'?'i':c)+APO.ACC[a]);
  return out.normalize('NFC')};
APO.rtfToText=function(rtf){
  let out='',i=0,depth=0;let skipDepth=-1;let uc=1,ucSkip=0;
  const cp1252={128:'€',130:'‚',131:'ƒ',132:'„',133:'…',134:'†',135:'‡',136:'ˆ',137:'‰',138:'Š',139:'‹',140:'Œ',142:'Ž',145:'‘',146:'’',147:'“',148:'”',149:'•',150:'–',151:'—',152:'˜',153:'™',154:'š',155:'›',156:'œ',158:'ž',159:'Ÿ'};
  const emit=s=>{if(skipDepth<0)out+=s};
  while(i<rtf.length){const ch=rtf[i];
    if(ch==='{'){depth++;i++;if(rtf.startsWith('\\*',i)&&skipDepth<0)skipDepth=depth;continue}
    if(ch==='}'){if(skipDepth===depth)skipDepth=-1;depth--;i++;continue}
    if(ch==='\\'){const m=/^\\([a-zA-Z]+)(-?\d+)? ?|^\\'([0-9a-fA-F]{2})|^\\(.)/.exec(rtf.slice(i,i+40));
      if(!m){i++;continue}i+=m[0].length;
      if(m[3]){if(ucSkip>0){ucSkip--;continue}const n=parseInt(m[3],16);emit(n>=128&&n<160?(cp1252[n]||''):String.fromCharCode(n));continue}
      if(m[4]){if(m[4]==='~')emit(' ');else if(m[4]==='-')emit('');else if(m[4]==='_')emit('-');else emit(m[4]);continue}
      const w=m[1],n=m[2]?+m[2]:null;
      if(['fonttbl','colortbl','stylesheet','info','pict','header','footer','listtable','listoverridetable','rsidtbl','generator','xmlnstbl','themedata','latentstyles','datastore'].includes(w)&&skipDepth<0)skipDepth=depth;
      else if(w==='par'||w==='line'||w==='sect'||w==='page'||w==='row')emit('\n');
      else if(w==='tab'||w==='cell')emit(' ');
      else if(w==='uc')uc=n??1;
      else if(w==='u'){let c=n<0?n+65536:n;emit(String.fromCharCode(c));ucSkip=uc}
      else if(w==='emdash')emit('—');else if(w==='endash')emit('–');else if(w==='lquote')emit('‘');else if(w==='rquote')emit('’');else if(w==='ldblquote')emit('“');else if(w==='rdblquote')emit('”');else if(w==='bullet')emit('•');
      continue}
    if(ch==='\r'||ch==='\n'){i++;continue}
    if(ucSkip>0){ucSkip--;i++;continue}
    emit(ch);i++}
  return out.normalize('NFC')};
APO.MESES=['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
APO.parse=function(text,opts){
  opts=opts||{};const dia=opts.dia??4;
  let t=text.replace(/ /g,' ').replace(/[ \t]+/g,' ').replace(/ ?\n ?/g,'\n');
  const M='(JANEIRO|FEVEREIRO|MARÇO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)';
  let year=opts.ano||null,ym2=null;const ym=new RegExp(M+'(?:\\s*[-–]\\s*'+M+')?\\s+DE\\s+(20\\d\\s?\\d)','i').exec(t);
  if(!year&&ym)year=+ym[3].replace(/\s/g,'');
  if(!year){const tz=t.replace(/[ \n]/g,'').toUpperCase();const y2=new RegExp(M+'(?:[-–]'+M+')?DE(20\\d\\d)').exec(tz);if(y2){year=+y2[3];ym2=y2}}
  const firstMonth=ym?APO.mi(ym[1]):(ym2?APO.mi(ym2[1]):null);
  const head=new RegExp('(\\d{1,2})\\s*(?:DE\\s+'+M+'\\s*)?[-–]\\s*(\\d{1,2})\\s+DE\\s+'+M+'\\s*(?:\\||\\n| )\\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9 .]*?\\s\\d+(?:\\s*[-–,]\\s*\\d+)*)\\s*$','gmi');
  const heads=[];let m;while((m=head.exec(t))){heads.push({idx:m.index,end:head.lastIndex,d1:+m[1],m1:m[2]?APO.mi(m[2]):null,d2:+m[3],m2:APO.mi(m[4]),leit:m[5].trim().replace(/\s+/g,' ').toUpperCase()})}
  const weeks=[];
  heads.forEach((h,k)=>{
    const body=t.slice(h.end,k+1<heads.length?heads[k+1].idx:t.length);
    const m1=h.m1!=null?h.m1:(h.d1<=h.d2?h.m2:(h.m2+11)%12);
    let y=year||new Date().getFullYear();
    if(year&&firstMonth===11&&m1===0)y=year+1;
    const start=new Date(y,m1,h.d1);const off=((+dia)+6)%7;const md=new Date(start);md.setDate(start.getDate()+off);
    const flat=body.replace(/\n/g,' ');
    const cants=[];const rc=/C[âa]ntico\s+(\d{1,3})(\s+e\s+ora[çc][ãa]o)?/gi;let c;while((c=rc.exec(flat)))cants.push({n:c[1],or:!!c[2],pos:c.index});
    const ini=cants.find(x=>x.or),fin=[...cants].reverse().find(x=>x.or&&x!==ini),mid=cants.find(x=>!x.or);
    const parts=[];const rp=/(?:^|\s)(\d{1,2})\.\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ“\"‘«](?:(?!\s\d{1,2}\.\s)[^()]){1,200}?)\s*\((\d{1,2})\s*min\)/g;let p;const seen=new Set();
    while((p=rp.exec(flat))){const n=+p[1];if(seen.has(n)||n<1||n>15)continue;seen.add(n);const af=flat.slice(rp.lastIndex,rp.lastIndex+60).trim();
      const tipo=/^Discurso a ser feito pelo presidente/i.test(af)?'presidente':/^Discurso\b/i.test(af)?'discurso':/^Considera/i.test(af)?'consideracao':/^Demonstra/i.test(af)?'demo':'';
      parts.push({n,tema:p[2].replace(/\s+/g,' ').trim(),min:+p[3],pos:p.index,tipo})}
    parts.sort((a,b)=>a.n-b.n);
    const est=parts.find(x=>/estudo b[íi]blico de congrega/i.test(x.tema));
    const rest=parts.filter(x=>x.n>3&&x!==est);
    let vida,mini;
    if(mid){vida=rest.filter(x=>x.pos>mid.pos);mini=rest.filter(x=>x.pos<mid.pos)}
    else{const f=rest.findIndex(x=>x.min>=10);mini=f<0?rest:rest.slice(0,f);vida=f<0?[]:rest.slice(f)}
    // sequência: ministério tem que vir antes da vida pelo número
    if(vida.length){const v0=Math.min(...vida.map(x=>x.n));mini=rest.filter(x=>x.n<v0);vida=rest.filter(x=>x.n>=v0)}
    const p1=parts.find(x=>x.n===1);
    const lb=/Leitura da B[íi]blia\s*\(\s*\d{1,2}\s*min\)\s*(.{2,60}?\(th\s+li[çc][ãa]o\s+\d{1,2}\))/i.exec(flat);
    weeks.push({semana:h.d1+'/'+(m1+1)+'–'+h.d2+'/'+(h.m2+1),data:md.getFullYear()+'-'+String(md.getMonth()+1).padStart(2,'0')+'-'+String(md.getDate()).padStart(2,'0'),
      leituraSemanal:h.leit,leituraTexto:lb?lb[1].replace(/\s+/g,' ').trim():'',canticoInicial:ini?ini.n:'',canticoMeio:mid?mid.n:'',canticoFinal:fin?fin.n:'',
      tesouros:p1?p1.tema:'',ministerio:mini.map(x=>({tema:x.tema,min:x.min,tipo:x.tipo})),vida:vida.map(x=>({tema:x.tema,min:x.min})),
      avisos:[!p1&&'tema de Tesouros não encontrado',!est&&'estudo bíblico não encontrado',!mini.length&&'partes do ministério não encontradas',!vida.length&&'partes da Vida Cristã não encontradas',!ini&&'cântico inicial não encontrado'].filter(Boolean)})
  });
  return{ano:year,semanas:weeks}};
APO.mi=s=>{const u=s.toUpperCase().replace('MARCO','MARÇO');return APO.MESES.indexOf(u)};


let imp=null; // {nome, semanas:[{...,on:true}], erro}
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
function loadScript(src){return new Promise((ok,no)=>{const sc=document.createElement('script');sc.src=src;sc.onload=ok;sc.onerror=()=>no(new Error('não carregou '+src));document.head.appendChild(sc)})}
async function ensurePdfjs(){if(window.pdfjsLib&&window.pdfjsWorker)return;await loadScript(PDFJS+'pdf.min.js');await loadScript(PDFJS+'pdf.worker.min.js');window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'}
/* O tipo do arquivo é decidido pelo conteúdo: no Android o nome muitas vezes chega sem extensão. */
async function fileToText(f){
  const buf=new Uint8Array(await f.arrayBuffer());
  const head=new TextDecoder('latin1').decode(buf.slice(0,1024));
  const name=(f.name||'').toLowerCase(),type=(f.type||'').toLowerCase();
  let kind='texto';
  if(head.includes('%PDF')||type.includes('pdf')||name.endsWith('.pdf'))kind='pdf';
  else if(/^\s*\{\\rtf/.test(head)||type.includes('rtf')||name.endsWith('.rtf'))kind='rtf';
  else if(buf[0]===0x50&&buf[1]===0x4B)kind='zip';
  impDiag.tipo=kind;impDiag.bytes=buf.length;
  if(kind==='zip')throw new Error(name.endsWith('.jwpub')||!name.includes('.')?'Este arquivo parece ser um JWPUB (ou outro arquivo compactado), que não pode ser lido aqui. Use o PDF ou o RTF da apostila.':'Este arquivo é compactado (ZIP, DOCX, JWPUB…) e não pode ser lido aqui. Use o PDF ou o RTF da apostila.');
  if(kind==='pdf'){await ensurePdfjs();const doc=await window.pdfjsLib.getDocument({data:buf,isEvalSupported:false}).promise;let t='';
    for(let i=1;i<=doc.numPages;i++){t+=APO.itemsToText((await (await doc.getPage(i)).getTextContent()).items)+'\n'}
    impDiag.paginas=doc.numPages;return t}
  if(kind==='rtf')return APO.rtfToText(new TextDecoder('windows-1252').decode(buf));
  return new TextDecoder('utf-8').decode(buf)}
let impDiag={};
function weekMonday(d){const x=parse(d);const off=(x.getDay()+6)%7;x.setDate(x.getDate()-off);return iso(x)}
function impTarget(date){const mon=weekMonday(date);const sun=parse(mon);sun.setDate(sun.getDate()+6);const s2=iso(sun);return sortedWeeks().find(w=>w.data>=mon&&w.data<=s2)||null}
function impPanel(){
  const head=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><h2>Importar apostila</h2><button class="btn small ghost" data-a="impclose">Fechar</button></div>`;
  const drop=`<label class="drop" for="impfile"><b>Escolha o arquivo da apostila</b><span class="hint">PDF ou RTF da Apostila da Reunião Vida e Ministério. O sistema lê as semanas, a leitura semanal da Bíblia, o texto da Leitura da Bíblia, os cânticos e os temas das partes. Os nomes não são preenchidos.</span><span class="btn primary dropbtn">Escolher arquivo</span><input type="file" id="impfile"></label>`;
  if(!imp)return`<div class="panel imp">${head}${drop}</div>`;
  if(imp.lendo)return`<div class="panel imp">${head}<p>Lendo ${esc(imp.nome)}…</p></div>`;
  if(imp.erro)return`<div class="panel imp">${head}${drop}<div class="drawres short">${esc(imp.erro)}</div>${impDiag.tipo?`<details class="hint"><summary>Detalhes técnicos (para enviar ao suporte)</summary><p style="margin:6px 0">Arquivo: ${esc(imp.nome||'sem nome')} · tipo identificado: ${esc(impDiag.tipo)} · ${impDiag.bytes||0} bytes${impDiag.paginas?' · '+impDiag.paginas+' páginas':''} · ${impDiag.chars??0} letras lidas</p>${impDiag.amostra?`<pre style="white-space:pre-wrap;font-size:12px;max-height:200px;overflow:auto;background:var(--surface);padding:8px;border-radius:6px">${esc(impDiag.amostra)}</pre>`:''}</details>`:''}</div>`;
  const on=imp.semanas.filter(x=>x.on);
  return`<div class="panel imp">${head}
    <p class="hint" style="margin:0">${esc(imp.nome)}: ${imp.semanas.length} semana${imp.semanas.length===1?'':'s'} encontrada${imp.semanas.length===1?'':'s'}. As datas usam o dia da reunião (${DIAS[cfg.dia]}). Confira e desmarque o que não quiser importar. Semanas que já existem são atualizadas e mantêm os nomes já escolhidos.</p>
    ${imp.semanas.map((x,i)=>{const tg=impTarget(x.data);return`<div class="impw ${x.on?'':'off'}">
      <input type="checkbox" class="impon" data-i="${i}" ${x.on?'checked':''} aria-label="Importar semana ${esc(x.semana)}">
      <div><div class="top"><input type="date" class="impdate" data-i="${i}" value="${x.data}" aria-label="Data da reunião"><b>${esc(x.leituraSemanal)}</b>${tg?`<span class="tagupd">atualiza ${br(tg.data).slice(0,5)}${tg.data!==x.data?' → '+br(x.data).slice(0,5):''}</span>`:'<span class="tagnew">nova</span>'}</div>
      <ul>
        <li><b>Cânticos:</b> ${esc(x.canticoInicial||'?')} · ${esc(x.canticoMeio||'?')} · ${esc(x.canticoFinal||'?')}</li>
        <li><b>Tesouros:</b> ${esc(x.tesouros||'—')}</li>
        <li><b>Leitura da Bíblia:</b> ${esc(x.leituraTexto||'—')}</li>
        <li><b>Ministério:</b> ${x.ministerio.map((m,j)=>esc((4+j)+'. '+m.tema+' ('+m.min+')'+(m.tipo&&m.tipo!=='demo'?' · '+(TIPOS.find(t=>t[0]===m.tipo)||['',''])[1].toLowerCase():''))).join('; ')||'—'}</li>
        <li><b>Vida Cristã:</b> ${x.vida.map(m=>esc(m.tema+' ('+m.min+')')).join('; ')||'—'}</li>
      </ul>${x.avisos.length?`<div class="warnline">Confira: ${esc(x.avisos.join('; '))}.</div>`:''}</div></div>`}).join('')}
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-a="impgo" ${on.length?'':'disabled'}>Importar ${on.length} semana${on.length===1?'':'s'}</button><button class="btn" data-a="impclose">Cancelar</button></div>
  </div>`}
async function impRead(f){
  imp={nome:f.name,lendo:true};impDiag={};rSemanas();
  try{const t=await fileToText(f);const r=APO.parse(t,{dia:cfg.dia});
    impDiag.chars=t.replace(/\s/g,'').length;impDiag.amostra=t.replace(/[ \t]+/g,' ').trim().slice(0,700);
    /* folha já preenchida (a programação do quadro), em vez da apostila */
    const folha=/Reuni[aã]o Vida e Minist[eé]rio Crist[aã]os?\s*[-–]\s*\p{L}+\s+\d{4}/iu.test(t)&&(t.match(/\b\d{2}\/\d{2}\/\d{4}\b/g)||[]).length>=2;
    if(!r.semanas.length&&folha)throw new Error('Este arquivo é uma programação já preenchida (a folha do quadro de anúncios), não a apostila. Para importar, use a Apostila da Reunião Vida e Ministério (arquivo mwb) baixada do jw.org, em PDF ou RTF.');
    if(!r.semanas.length)throw new Error(impDiag.tipo==='pdf'&&impDiag.chars<200?'Este PDF não tem texto que possa ser lido (parece ser uma imagem ou digitalização). Use o PDF original da apostila, baixado do jw.org, ou o RTF.':'Não encontrei semanas neste arquivo. Confira se é a Apostila da Reunião Vida e Ministério (PDF ou RTF).');
    imp={nome:f.name,ano:r.ano,semanas:r.semanas.map(x=>Object.assign(x,{on:true}))}}
  catch(e){imp={nome:f.name,erro:(e&&e.message)||'Não foi possível ler o arquivo.'};if(/carregou/.test(imp.erro))imp.erro='Não foi possível carregar o leitor de PDF. Verifique a internet e tente de novo.';else if(/Invalid PDF|PDF structure|password/i.test(imp.erro))imp.erro='Este PDF está danificado ou protegido e não pode ser lido. Baixe a apostila de novo no jw.org e tente outra vez.'}
  rSemanas()}
function impApply(){
  const list=imp.semanas.filter(x=>x.on);let first=null,n=0;
  list.forEach(x=>{const tg=impTarget(x.data);const base=tg?clone(tg):newWeek(x.data);
    const keepM=base.ministerio||[],keepV=base.vida||[];
    const w=norm(Object.assign(base,{data:x.data,leituraSemanal:x.leituraSemanal,canticoInicial:x.canticoInicial,canticoMeio:x.canticoMeio,canticoFinal:x.canticoFinal}));
    w.tesouros.tema=x.tesouros;if(x.leituraTexto)w.leitura=Object.assign({},w.leitura,{tema:x.leituraTexto});
    w.ministerio=x.ministerio.map((m,j)=>({tema:m.tema,min:m.min,tipo:m.tipo||'',pub:(keepM[j]||{}).pub||'',ajudante:(keepM[j]||{}).ajudante||''}));
    w.vida=x.vida.map((m,j)=>({tema:m.tema,min:m.min,pub:(keepV[j]||{}).pub||''}));
    if(tg&&tg.data!==x.data){delete weeks[tg.data];removeDoc('semanas',tg.data)}
    saveWeek(w);n++;if(!first||x.data<first)first=x.data});
  imp=null;ui.importing=false;if(first){ui.week=first;ui.month=first.slice(0,7)}buildHist();rSemanas();toast(n+' semana'+(n===1?'':'s')+' importada'+(n===1?'':'s'))}
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='impfile'&&t.files&&t.files[0])impRead(t.files[0]);
  if(t.classList&&t.classList.contains('impon')){imp.semanas[+t.dataset.i].on=t.checked;rSemanas()}
  if(t.classList&&t.classList.contains('impdate')&&t.value){imp.semanas[+t.dataset.i].data=t.value;rSemanas()}
});
