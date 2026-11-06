/* ================= Saídas de campo ================= */
const DIAS_C=['','Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const MODS_DEF=['Casa em casa','Testemunho nas ruas','Telefone e Cartas','Território isolado','Testemunho público'];
const TERRS_DEF=['Jorrinho','Tracupá','Arapuá','Vista Bela','Pedra Grande','Porteiras','Rua Nova','Zoom'];
const campoMods=()=>cfg.campoMods&&cfg.campoMods.length?cfg.campoMods:MODS_DEF;
const campoTerrs=()=>cfg.campoTerrs&&cfg.campoTerrs.length?cfg.campoTerrs:TERRS_DEF;
const isIso=r=>/isolad/i.test(r.mod||'');
const ISOS_DEF=['Poço Redondo','Sem Freio','Rio do Peixe','Lagoa Cavada','Canabrava','Rua Nova','Olhos D’água'];
const campoIsos=()=>cfg.campoIsos&&cfg.campoIsos.length?cfg.campoIsos:ISOS_DEF;
const campoIsoHora=()=>cfg.campoIsoHora||'07:40';
const CS=(dia,hora,mod,terr,dir)=>({dia,hora,mod,terr,dir});
/* modelos tirados da programação de setembro: as semanas se alternam entre A e B */
const CAMPO_MOD_DEF={
  A:[CS(1,'16:00','Testemunho nas ruas','Jorrinho','francisco'),CS(3,'08:15','Telefone e Cartas','Zoom','francisco'),
     CS(4,'08:30','Casa em casa','Jorrinho','ariosvaldo'),CS(4,'16:30','Casa em casa','Jorrinho','ademar-de-jesus'),
     CS(5,'08:30','Casa em casa','Tracupá','antonio'),CS(5,'16:30','Casa em casa','Jorrinho','guilherme-trajano'),
     CS(6,'08:30','Casa em casa','Arapuá','luis-pimentel'),CS(6,'08:30','Casa em casa','Vista Bela','ademar-de-jesus'),CS(6,'08:30','Casa em casa','Tracupá','antonio'),
     CS(7,'08:45','Casa em casa','Pedra Grande','hamilton'),CS(7,'08:45','Casa em casa','Tracupá','tallis'),CS(7,'08:30','Casa em casa','Porteiras','ademar-de-jesus'),
     CS(7,'08:30','Casa em casa','Rua Nova','ronaldo'),CS(7,'08:30','Casa em casa','Jorrinho','francisco')],
  B:[CS(1,'16:00','Testemunho nas ruas','Jorrinho','francisco'),CS(3,'08:15','Telefone e Cartas','Zoom','francisco'),
     CS(4,'08:30','Casa em casa','Jorrinho','ariosvaldo'),CS(4,'16:30','Casa em casa','Jorrinho','kaique'),
     CS(5,'08:30','Casa em casa','Tracupá','antonio'),CS(5,'16:30','Casa em casa','Jorrinho','ademar-de-jesus'),
     CS(6,'08:30','Casa em casa','Tracupá','luis-pimentel'),
     CS(7,'08:45','Casa em casa','Pedra Grande','ariosvaldo'),CS(7,'08:45','Casa em casa','Tracupá','antonio'),CS(7,'08:30','Casa em casa','Porteiras','luis-pimentel'),
     CS(7,'08:30','Casa em casa','Rua Nova','guilherme-trajano'),CS(7,'08:30','Casa em casa','Jorrinho','francisco')]};
const campoModelo=k=>(cfg.campoModelos&&cfg.campoModelos[k])||CAMPO_MOD_DEF[k];
const campoRef=()=>weekMonday(cfg.campoRef||'2026-09-07');
function campoAB(mon){const wk=Math.round((parse(mon)-parse(campoRef()))/6048e5);return((wk%2)+2)%2===0?'A':'B'}
const cThu=mon=>shiftDays(mon,3);
const cDate=(mon,dia)=>shiftDays(mon,dia-1);
/* a semana pertence ao mês da sua quinta-feira (28/09–04/10 é de outubro) */
function campoWeeks(ym){let d=weekMonday(ym+'-01');const out=[];for(let i=0;i<6;i++){if(cThu(d).slice(0,7)===ym)out.push(d);d=shiftDays(d,7)}return out}
function campoLabel(mon){const s=parse(mon),e=parse(shiftDays(mon,6));
  return s.getMonth()===e.getMonth()?pad(s.getDate())+'–'+pad(e.getDate())+' de '+MESES[e.getMonth()]:pad(s.getDate())+' de '+MESES[s.getMonth()]+' a '+pad(e.getDate())+' de '+MESES[e.getMonth()]}
function sortSaidas(a){return a.map((r,i)=>[r,i]).sort((x,y)=>(x[0].dia-y[0].dia)||(x[1]-y[1])).map(x=>x[0])}
function sortedCampo(){return Object.values(cmp).filter(c=>c&&c.semana).sort((a,b)=>a.semana<b.semana?-1:1)}
/* último fim de semana do mês (pelo sábado): o domingo vai para um território isolado */
const campoUltima=mon=>shiftDays(mon,12).slice(0,7)!==shiftDays(mon,5).slice(0,7);
const nrm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').trim();
function isoHist(before){const last={};sortedCampo().forEach(c=>{if(c.semana>=before)return;(c.saidas||[]).forEach(r=>{if(isIso(r)&&r.terr)last[nrm(r.terr)]=c.semana})});return last}
/* rodízio: vai o território isolado visitado há mais tempo (ou nunca visitado), na ordem da lista */
function nextIsolado(mon){const L=campoIsos(),h=isoHist(mon);return L.map((t,i)=>[t,h[nrm(t)]||'',i]).sort((a,b)=>a[1]<b[1]?-1:a[1]>b[1]?1:a[2]-b[2]).map(x=>x[0])[0]||''}
const isoSunday=c=>(c.saidas||[]).some(r=>r.dia===7&&isIso(r));
function campoSetIso(c){c.saidas=(c.saidas||[]).filter(r=>r.dia!==7);c.saidas.push(CS(7,campoIsoHora(),'Território isolado',nextIsolado(c.semana),''))}
function campoUnIso(c){c.saidas=(c.saidas||[]).filter(r=>r.dia!==7).concat(clone(campoModelo(c.modelo||campoAB(c.semana)).filter(r=>r.dia===7)))}
function campoNew(mon,k){k=k||campoAB(mon);const c={semana:mon,modelo:k,saidas:clone(campoModelo(k)),nota:'',enviados:{}};if(campoUltima(mon))campoSetIso(c);return c}
function saveCampo(c){c.saidas=sortSaidas(c.saidas||[]);cmp[c.semana]=c;queueSave('campo',c.semana,c)}
function campoDirs(){const B=bros();const d=B.filter(id=>(pubs[id].cats||[]).includes('campo'));return{d,o:B.filter(id=>!d.includes(id))}}
const dirName=id=>id?tc(pname(id))||'(removido)':'';
function normHora(v){const d=String(v||'').replace(/\D/g,'');if(!d)return'';let h,m;if(d.length<=2){h=+d;m=0}else{h=+d.slice(0,d.length-2);m=+d.slice(-2)}if(h>23||m>59)return String(v).trim();return pad(h)+':'+pad(m)}
/* nome curto para a folha: "Francisco", "Luis Carlos", "José Hamilton"; se dois dirigentes ficarem iguais, usa o nome completo */
function dirShort0(id){const w=dirName(id).split(/\s+/).filter(Boolean);if(!w.length)return'';const sn=shortName(w.join(' '));if(sn.includes(' '))return sn;
  if(w.length>=3&&!['de','da','das','do','dos','e'].includes(w[1].toLowerCase()))return w[0]+' '+w[1];return w[0]}
function dirShort(id){const s0=dirShort0(id);if(!s0)return'';const clash=campoDirs().d.some(o=>o!==id&&dirShort0(o)===s0);return clash?dirName(id):s0}
function campoWarn(c){const w=[];const seen={};
  (c.saidas||[]).forEach(r=>{if(!r.dir)return;const k=r.dia+'|'+r.hora+'|'+r.dir;if(seen[k])w.push(dirName(r.dir)+' dirige dois grupos '+DIAS_C[r.dia].toLowerCase()+' às '+r.hora);seen[k]=1});
  const vazio=(c.saidas||[]).filter(r=>!r.dir).length;if(vazio)w.push(vazio+' saída'+(vazio>1?'s':'')+' sem dirigente');
  const tp=evTipo(c.semana);if(SEM_REUNIAO(tp))w.push(EVENTOS[tp]+' nesta semana: confira as saídas do fim de semana');
  return w}
/* editor de linhas: serve para as semanas e para os modelos (chave #A / #B) */
function campoRowsEd(key,rows){const{d,o}=campoDirs();const mods=campoMods();
  const opt=(id,cur)=>`<option value="${id}" ${id===cur?'selected':''}>${esc(dirName(id))}</option>`;
  const dsel=cur=>`<select class="cin" data-f="dir" aria-label="Dirigente"><option value="">—</option>${cur&&!pubs[cur]?`<option value="${esc(cur)}" selected>(removido)</option>`:''}<optgroup label="Dirigentes de campo">${d.map(id=>opt(id,cur)).join('')}</optgroup>${o.length?`<optgroup label="Outros irmãos">${o.map(id=>opt(id,cur)).join('')}</optgroup>`:''}</select>`;
  let last=0;
  return`<div class="crows"><div class="crow chead"><span>Dia</span><span>Horário</span><span>Modalidade</span><span>Território</span><span>Dirigente</span><span></span></div>
    ${rows.map((r,i)=>{const first=r.dia!==last;last=r.dia;return`<div class="crow ${first?'first':''} ${/isolad/i.test(r.mod||'')?'iso':''}" data-k="${esc(key)}" data-i="${i}">
      <select class="cin" data-f="dia" aria-label="Dia">${DIAS_C.map((n,j)=>j?`<option value="${j}" ${j===r.dia?'selected':''}>${n}</option>`:'').join('')}</select>
      <input type="text" class="cin" data-f="hora" inputmode="numeric" maxlength="5" placeholder="08:30" value="${esc(r.hora||'')}" aria-label="Horário">
      <select class="cin" data-f="mod" aria-label="Modalidade">${(r.mod&&!mods.includes(r.mod)?[r.mod,...mods]:mods).map(m=>`<option ${m===r.mod?'selected':''}>${esc(m)}</option>`).join('')}</select>
      <input type="text" class="cin" data-f="terr" list="terrList" value="${esc(r.terr||'')}" placeholder="Território" aria-label="Território">
      ${dsel(r.dir)}
      <button class="btn small ghost danger cx" data-a="crowdel" data-k="${esc(key)}" data-i="${i}" aria-label="Remover saída" title="Remover">✕</button></div>`}).join('')}
    </div><div><button class="btn small" data-a="crowadd" data-k="${esc(key)}">+ Adicionar saída</button></div>`}
function campoGet(key){if(key[0]==='#'){const k=key.slice(1);return{saidas:clone(campoModelo(k)),_m:k}}return cmp[key]?clone(cmp[key]):null}
function campoPut(key,c){if(c._m){c.saidas=sortSaidas(c.saidas);cfg.campoModelos=Object.assign({},cfg.campoModelos||{},{[c._m]:c.saidas});queueSave('config','geral',cfg)}else saveCampo(c)}
function rCampo(){
  if(!ui.campoMonth){const t=iso(new Date());ui.campoMonth=cThu(weekMonday(t)).slice(0,7)}
  const V=ui.campoView||'semanas';
  const seg=`<div class="seg" style="max-width:560px"><button data-a="cview" data-v="semanas" aria-pressed="${V==='semanas'}">Programação</button><button data-a="cview" data-v="modelos" aria-pressed="${V==='modelos'}">Modelos</button><button data-a="cview" data-v="listas" aria-pressed="${V==='listas'}">Territórios</button></div>`;
  let body='';
  if(V==='modelos'){const cur=weekMonday(iso(new Date()));const k=campoAB(cur);
    body=`<div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:10px">
      <p class="hint" style="margin:0">As semanas se alternam entre o modelo A e o modelo B. Ao gerar uma semana nova, o sistema copia o modelo da vez; depois é só ajustar o que mudou. Mudanças aqui valem para as próximas semanas geradas, não alteram as que já existem.</p>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-weight:600">Esta semana (${esc(campoLabel(cur))}) usa o modelo</span><div class="seg" style="width:120px"><button data-a="cabset" data-k="A" aria-pressed="${k==='A'}">A</button><button data-a="cabset" data-k="B" aria-pressed="${k==='B'}">B</button></div></div></div>
      ${['A','B'].map(m=>`<div class="panel cweek"><div class="cwh"><h3>Modelo ${m}</h3>${ui.delAsk==='cmr'+m?`<span class="confirm">Voltar ao modelo original? <button class="btn small danger" data-a="cmresetok" data-k="${m}">Voltar</button><button class="btn small" data-a="cno">Cancelar</button></span>`:`<button class="btn small ghost" data-a="cmreset" data-k="${m}">Restaurar original</button>`}</div>${campoRowsEd('#'+m,campoModelo(m))}</div>`).join('')}`}
  else if(V==='listas'){
    body=`<div class="panel settings" style="padding:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
      <label class="f">Territórios (um por linha)<textarea id="cterrs" style="min-height:220px">${esc(campoTerrs().join('\n'))}</textarea></label>
      <label class="f">Territórios isolados, em rodízio (um por linha)<textarea id="cisos" style="min-height:220px">${esc(campoIsos().join('\n'))}</textarea></label>
      <label class="f">Modalidades (uma por linha)<textarea id="cmods" style="min-height:220px">${esc(campoMods().join('\n'))}</textarea></label>
      <label class="f" style="max-width:220px">Horário do território isolado<input type="text" id="cisohora" inputmode="numeric" maxlength="5" value="${esc(campoIsoHora())}"></label>
      <div style="grid-column:1/-1;font-size:13.5px">${(()=>{const h=isoHist('9999');return'<b>Última visita a cada território isolado</b> (inclui as semanas já programadas): '+campoIsos().map(t=>esc(t)+' — '+(h[nrm(t)]?br(shiftDays(h[nrm(t)],6)):'<span class="muted">nunca</span>')).join(' · ')+'<br><span class="muted">Próximo da vez: <b>'+esc(nextIsolado('9999'))+'</b></span>'})()}</div>
      <p class="hint" style="margin:0;grid-column:1/-1">No último fim de semana de cada mês, ao gerar a semana, o domingo vira uma saída única para o território isolado da vez: o que foi visitado há mais tempo, seguindo a ordem da lista. A lista de territórios aparece como sugestão ao digitar; também dá para escrever outro nome direto na saída. "Território isolado" sai em vermelho na folha. Os dirigentes são os irmãos com a categoria "Dirigente de campo" em Publicadores.</p></div>`}
  else{const ws=campoWeeks(ui.campoMonth);const miss=ws.filter(m=>!cmp[m]);
    body=`<div class="panel" style="padding:14px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between">
      <div class="monthnav" style="margin:0;gap:10px"><button class="btn small ghost" data-a="cprev" aria-label="Mês anterior">‹</button><strong>${monthLabel(ui.campoMonth)}</strong><button class="btn small ghost" data-a="cnext" aria-label="Próximo mês">›</button></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${miss.length?`<button class="btn small primary" data-a="cgen">Gerar ${miss.length} semana${miss.length>1?'s':''} pelos modelos</button>`:''}<a class="btn small" href="#imprimir" data-a="cgoprint">Imprimir / PDF</a><a class="btn small" href="#whatsapp" data-a="cgowa">Avisar pelo WhatsApp</a></div></div>
      ${ws.map(mon=>{const c=cmp[mon];const tp=evTipo(mon);const tag=tp?`<span class="evtag">${EVTAG[tp]}</span>`:'';
        if(!c)return`<div class="panel cweek empty" data-dia="${mon}" data-ate="${shiftDays(mon,6)}"><div class="cwh"><h3>${esc(campoLabel(mon))} ${tag}</h3></div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:14px">Semana ainda não montada.</span><button class="btn small primary" data-a="cnew" data-w="${mon}">Criar pelo modelo ${campoAB(mon)}${campoUltima(mon)?' (domingo: '+esc(nextIsolado(mon))+')':''}</button>${cmp[shiftDays(mon,-7)]?`<button class="btn small" data-a="ccopy" data-w="${mon}">Copiar a semana anterior</button>`:''}</div></div>`;
        const w=campoWarn(c);
        return`<div class="panel cweek" data-dia="${mon}" data-ate="${shiftDays(mon,6)}"><div class="cwh"><h3>${esc(campoLabel(mon))} <span class="abtag" title="Modelo usado">${esc(c.modelo||campoAB(mon))}</span> ${isoSunday(c)?'<span class="isotag">Território isolado</span>':''} ${tag}</h3>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${ui.delAsk==='cdel'+mon?`<span class="confirm">Apagar a semana? <button class="btn small danger" data-a="cdelok" data-w="${mon}">Apagar</button><button class="btn small" data-a="cno">Cancelar</button></span>`:ui.delAsk&&ui.delAsk.startsWith('cap'+mon)?`<span class="confirm">Substituir tudo pelo modelo ${ui.delAsk.slice(-1)}? <button class="btn small danger" data-a="capok" data-w="${mon}" data-k="${ui.delAsk.slice(-1)}">Substituir</button><button class="btn small" data-a="cno">Cancelar</button></span>`:`<button class="btn small ghost" data-a="ciso" data-w="${mon}">${isoSunday(c)?'Domingo normal':'Domingo em território isolado'}</button><button class="btn small ghost" data-a="capask" data-w="${mon}" data-k="${campoAB(mon)==='A'?'B':'A'}">Trocar para o modelo ${campoAB(mon)==='A'?'B':'A'}</button><button class="btn small ghost danger" data-a="cdel" data-w="${mon}">Apagar</button>`}</div></div>
          ${campoRowsEd(mon,c.saidas||[])}
          <label class="f">Observação na folha (opcional)<input type="text" class="cnota" data-w="${mon}" value="${esc(c.nota||'')}" placeholder="Ex.: domingo, saída única no território isolado"></label>
          ${w.length?`<div class="warnline">${esc(w.join(' · '))}</div>`:''}${respResumo('campo',mon,(c.saidas||[]).filter(r=>r.dir).map(r=>({pub:r.dir,field:'saida.'+r.dia+'.'+String(r.hora||'').replace(':','h'),txt:DIAS_C[r.dia]+' às '+String(r.hora||'').replace(':','h')})))}${lastMod(c)}</div>`}).join('')}`}
  $('#v-campo').innerHTML=`<div style="display:flex;flex-direction:column;gap:14px">${seg}${body}</div><datalist id="terrList">${[...new Set([...campoTerrs(),...campoIsos()])].map(t=>`<option value="${esc(t)}">`).join('')}</datalist>`}
Object.assign(PACTS,{
  cview:b=>{ui.campoView=b.dataset.v;ui.delAsk=null;rCampo()},
  cprev:()=>{ui.campoMonth=shiftMonth(ui.campoMonth,-1);ui.delAsk=null;rCampo()},
  cnext:()=>{ui.campoMonth=shiftMonth(ui.campoMonth,1);ui.delAsk=null;rCampo()},
  cgen:()=>{const m=campoWeeks(ui.campoMonth).filter(x=>!cmp[x]);m.forEach(x=>saveCampo(campoNew(x)));rCampo();toast(m.length+' semana'+(m.length>1?'s geradas':' gerada'))},
  cnew:b=>{saveCampo(campoNew(b.dataset.w));rCampo()},
  ccopy:b=>{const mon=b.dataset.w,p=cmp[shiftDays(mon,-7)];if(!p)return;saveCampo({semana:mon,modelo:p.modelo||campoAB(shiftDays(mon,-7)),saidas:clone(p.saidas||[]),nota:'',enviados:{}});rCampo()},
  cdel:b=>{ui.delAsk='cdel'+b.dataset.w;rCampo()},cno:()=>{ui.delAsk=null;rCampo()},
  cdelok:b=>{const mon=b.dataset.w;delete cmp[mon];removeDoc('campo',mon);ui.delAsk=null;rCampo();toast('Semana apagada')},
  ciso:b=>{const c=clone(cmp[b.dataset.w]);if(!c)return;if(isoSunday(c))campoUnIso(c);else campoSetIso(c);saveCampo(c);rCampo()},
  capask:b=>{ui.delAsk='cap'+b.dataset.w+b.dataset.k;rCampo()},
  capok:b=>{const c=campoNew(b.dataset.w,b.dataset.k);c.nota=(cmp[b.dataset.w]||{}).nota||'';saveCampo(c);ui.delAsk=null;rCampo()},
  crowadd:b=>{const k=b.dataset.k;const c=campoGet(k);const a=c.saidas;const l=a[a.length-1];a.push(l?CS(l.dia,l.hora,l.mod,'',''):CS(1,'08:30','Casa em casa','',''));campoPut(k,c);rCampo()},
  crowdel:b=>{const k=b.dataset.k;const c=campoGet(k);c.saidas.splice(+b.dataset.i,1);campoPut(k,c);rCampo()},
  cabset:b=>{const cur=weekMonday(iso(new Date()));cfg.campoRef=b.dataset.k==='A'?cur:shiftDays(cur,7);queueSave('config','geral',cfg);rCampo()},
  cmreset:b=>{ui.delAsk='cmr'+b.dataset.k;rCampo()},
  cmresetok:b=>{const m=Object.assign({},cfg.campoModelos||{});delete m[b.dataset.k];cfg.campoModelos=m;queueSave('config','geral',cfg);ui.delAsk=null;rCampo()},
  cgoprint:()=>{ui.printKind='campo';ui.printSelC=new Set(campoWeeks(ui.campoMonth).filter(m=>cmp[m]).map(cThu));ui.printSub=''},
  cgowa:()=>{ui.waKind='campo';const ws=campoWeeks(ui.campoMonth).filter(m=>cmp[m]);const t=weekMonday(iso(new Date()));ui.waCampo=ws.find(m=>m>=t)||ws[0]||null},
});
document.addEventListener('change',e=>{const t=e.target;
  if(t.classList&&t.classList.contains('cin')){const row=t.closest('.crow');const k=row.dataset.k,i=+row.dataset.i;const c=campoGet(k);if(!c||!c.saidas[i])return;
    const f=t.dataset.f;c.saidas[i][f]=f==='dia'?+t.value:f==='hora'?normHora(t.value):f==='terr'?t.value.trim():t.value;campoPut(k,c);rCampo();return}
  if(t.classList&&t.classList.contains('cnota')){const c=cmp[t.dataset.w];if(!c)return;c.nota=t.value.trim();saveCampo(c);return}
  if(t.id==='cisohora'){cfg.campoIsoHora=normHora(t.value)||'07:40';queueSave('config','geral',cfg);rCampo();return}
  if(t.id==='cterrs'||t.id==='cmods'||t.id==='cisos'){const l=[...new Set(t.value.split('\n').map(s=>s.trim()).filter(Boolean))];if(t.id==='cterrs')cfg.campoTerrs=l;else if(t.id==='cisos')cfg.campoIsos=l;else cfg.campoMods=l;queueSave('config','geral',cfg);toast('Lista salva');rCampo()}});
/* folha (prévia e PDF) */
function campoGroups(c){const g=[];sortSaidas(c.saidas||[]).forEach(r=>{const l=g[g.length-1];if(l&&l.dia===r.dia)l.rows.push(r);else g.push({dia:r.dia,rows:[r]})});return g}
function campoHTML(mon){const c=cmp[mon];if(!c)return'<div></div>';
  const body=campoGroups(c).map(g=>{const same=g.rows.length>1&&g.rows.every(r=>r.mod===g.rows[0].mod);const sun=g.dia===7;const red=g.rows.some(isIso);
    return g.rows.map((r,i)=>`<tr class="${sun?'sun':''}">${i===0?`<td rowspan="${g.rows.length}" class="cd ${red?'red':''}">${DIAS_C[g.dia]}</td>`:''}<td>${esc(r.hora)}</td>${same?(i===0?`<td rowspan="${g.rows.length}" class="cm ${isIso(r)?'red':''}">${esc(r.mod)}</td>`:''):`<td class="${isIso(r)?'red':''}">${esc(r.mod)}</td>`}<td class="ct">${esc(r.terr)}</td><td>${r.dir?esc(dirShort(r.dir)):'<span class="empty">—</span>'}</td></tr>`).join('')}).join('');
  return`<div class="cw"><div class="cwl">${esc(cap(campoLabel(mon)))}</div><table class="ctab"><thead><tr><th>Dia</th><th>Horário</th><th>Modalidade</th><th>Território</th><th>Dirigente</th></tr></thead><tbody>${body}</tbody></table>${c.nota?`<p class="cnote">${esc(c.nota)}</p>`:''}</div>`}
PV.headCampo=(x,W)=>{PV.text(PV.congName(),x+W/2,50,'bold',19,'#111111',{align:'center'});PV.rect(x,59,W,1.6,'#A3A3A3');
  PV.text('SAÍDAS DE CAMPO',x+W/2,76,'normal',10,'#111111',{align:'center',charSpace:0.6});return 98};
PV.campo=(mon,x,y,W)=>{const y0=y,d=PV.doc,c=cmp[mon];if(!c)return 0;
  const cw=[78,62,128,124];cw.push(W-cw.reduce((a,b)=>a+b,0));const cx=[x];cw.forEach((w,i)=>cx.push(cx[i]+w));const RH=17;
  PV.text(cap(campoLabel(mon)),x+W,y+10,'bold',11,'#1E8E45',{align:'right'});y+=16;
  const LN=[];const line=(x1,y1,x2,y2)=>LN.push([x1,y1,x2,y2]);
  PV.rect(x,y,W,18,'#E2EFDA');['DIA','HORÁRIO','MODALIDADE','TERRITÓRIO','DIRIGENTE'].forEach((t,i)=>PV.text(t,cx[i]+cw[i]/2,y+12.3,'bold',8.2,'#1B1B1B',{align:'center'}));
  line(x,y,x+W,y);y+=18;line(x,y,x+W,y);
  campoGroups(c).forEach(g=>{const n=g.rows.length,h=n*RH,sun=g.dia===7,red=g.rows.some(isIso);const same=n>1&&g.rows.every(r=>r.mod===g.rows[0].mod);
    PV.rect(x,y,W,h,'#F1F7ED');
    PV.text(DIAS_C[g.dia],cx[0]+cw[0]/2,y+h/2+3.2,sun||red?'bold':'normal',9,red?'#C00000':'#1B1B1B',{align:'center'});
    if(same)PV.text(g.rows[0].mod,cx[2]+cw[2]/2,y+h/2+3.2,sun?'bolditalic':'normal',9,isIso(g.rows[0])?'#C00000':'#1B1B1B',{align:'center',maxW:cw[2]-8});
    g.rows.forEach((r,i)=>{const ry=y+i*RH,ty=ry+RH/2+3.2;
      PV.text(r.hora,cx[1]+cw[1]/2,ty,'normal',9,'#1B1B1B',{align:'center'});
      if(!same)PV.text(r.mod,cx[2]+cw[2]/2,ty,isIso(r)?'bolditalic':'normal',9,isIso(r)?'#C00000':'#1B1B1B',{align:'center',maxW:cw[2]-8});
      PV.text(r.terr,cx[3]+cw[3]/2,ty,sun||isIso(r)?'bold':'normal',9,'#1B1B1B',{align:'center',maxW:cw[3]-8});
      PV.text(r.dir?dirShort(r.dir):'—',cx[4]+cw[4]/2,ty,'normal',9,r.dir?'#1B1B1B':'#B5B5B5',{align:'center',maxW:cw[4]-8});
      if(i){if(same){line(cx[1],ry,cx[2],ry);line(cx[3],ry,x+W,ry)}else line(cx[1],ry,x+W,ry)}});
    y+=h;line(x,y,x+W,y)});
  [0,1,2,3,4,5].forEach(i=>line(cx[i],y0+16,cx[i],y));
  if(!PV.dry){d.setDrawColor(150,170,145);d.setLineWidth(0.6);LN.forEach(a=>d.line(...a))}
  if(c.nota){PV.text(c.nota,x,y+12,'italic',8.8,'#333333',{maxW:W});y+=14}
  return y+22-y0};
/* WhatsApp */
function campoMsgs(mon){const c=cmp[mon];if(!c)return[];const by={};
  sortSaidas(c.saidas||[]).forEach(r=>{if(!r.dir)return;(by[r.dir]=by[r.dir]||[]).push('• '+DIAS_C[r.dia]+', '+br(cDate(mon,r.dia)).slice(0,5)+' às '+r.hora+' — '+r.mod+(r.terr?' ('+r.terr+')':''))});
  return Object.entries(by).map(([pid,list])=>{const p=pubs[pid]||{nome:'(removido)'};
    const msg=`Olá, ${tc(p.nome.split(' ')[0])}!\n\nVocê vai dirigir a saída de campo na semana de ${campoLabel(mon)}:\n\n${list.join('\n')}\n\nSe não puder em alguma, avise com antecedência, por favor. Obrigado!`;
    return{pid,p,msg}}).sort((a,b)=>a.p.nome.localeCompare(b.p.nome,'pt'))}
function campoGroupMsg(mon){const c=cmp[mon];if(!c)return'';
  return`*Saídas de campo — ${campoLabel(mon)}*\n\n`+campoGroups(c).map(g=>`*${DIAS_C[g.dia]} (${br(cDate(mon,g.dia)).slice(0,5)})*\n`+g.rows.map(r=>`${r.hora} · ${r.mod}${r.terr?' · '+r.terr:''}${r.dir?' · '+dirShort(r.dir):''}`).join('\n')).join('\n\n')+(c.nota?'\n\n'+c.nota:'')}
function rWaCampo(seg){const ws=sortedCampo().map(c=>c.semana);if(!ui.waCampo||!cmp[ui.waCampo]){const t=weekMonday(iso(new Date()));ui.waCampo=ws.find(m=>m>=t)||ws[ws.length-1]||null}
  const mon=ui.waCampo;const ms=mon?campoMsgs(mon):[];const env=(mon&&cmp[mon].enviados)||{};const sent=ms.filter(m=>env[m.pid]).length;
  $('#v-whatsapp').innerHTML=`<div class="wa-top">${seg}${ws.length?`<label class="f">Semana<select id="wacampo">${ws.map(m=>`<option value="${m}" ${m===mon?'selected':''}>${esc(cap(campoLabel(m)))}</option>`).join('')}</select></label>`:''}
     ${ms.length?`<span class="progress"><b>${sent}</b> de <b>${ms.length}</b> dirigentes avisados</span>`:''}</div>
   ${mon?`<p class="hint" style="margin:-6px 0 16px">Um cartão por dirigente com as saídas dele na semana. "Programação da semana" copia tudo para mandar no grupo da congregação.</p>
   <div class="walist"><div class="panel wacard"><h3>Programação da semana</h3><pre>${esc(campoGroupMsg(mon))}</pre><div class="acts"><button class="btn small primary" data-a="cwagrp">Copiar para o grupo</button></div></div>
   ${ms.map((m,i)=>{const n=waNumber(m.p.tel);return`<div class="panel wacard ${env[m.pid]?'sent':''}"><h3>${esc(m.p.nome)}<span class="tel ${n?'':'none'}">${n?esc(fmtTel(m.p.tel)):'sem telefone'}</span></h3><pre>${esc(m.msg)}</pre>
      <div class="acts">${n?`<a class="btn small wa" href="https://wa.me/${n}?text=${encodeURIComponent(m.msg)}" target="_blank" rel="noopener">Abrir no WhatsApp</a>`:''}<button class="btn small" data-a="cwacopy" data-i="${i}">Copiar</button><label><input type="checkbox" class="csent" data-pid="${esc(m.pid)}" ${env[m.pid]?'checked':''}> Enviado</label></div></div>`}).join('')}</div>`:'<p class="muted">Nenhuma semana de saídas montada. Monte a programação na aba Saídas de campo.</p>'}`}
Object.assign(PACTS,{cwacopy:b=>copyText(campoMsgs(ui.waCampo)[+b.dataset.i].msg),cwagrp:()=>copyText(campoGroupMsg(ui.waCampo))});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='wacampo'){ui.waCampo=t.value;rWa()}
  if(t.classList&&t.classList.contains('csent')){const c=cmp[ui.waCampo];if(!c)return;c.enviados=Object.assign({},c.enviados||{});if(t.checked)c.enviados[t.dataset.pid]=1;else delete c.enviados[t.dataset.pid];saveCampo(c);rWa()}});

