/* ================= Painel do publicador ================= */
/* Quem entra com o nível "Publicador" vê só este painel: as próprias designações (com confirmação),
   as programações do mês e os próprios dados. Editores e administradores com e-mail no cadastro
   também têm "Meu painel" em Mais. */
const painelOnly=()=>!!(window.FBX&&window.FBX.papel==='publicador');
function myPubId(){const F=window.FBX;if(!F||!F.email)return null;if(F.pubId)return F.pubId;
  const e=F.email.toLowerCase();return Object.keys(pubs).find(id=>String(pubs[id].email||'').toLowerCase()===e)||null}
let resp={};               // respostas (confirmações) por id do documento
let nomesRemote=null;      // quadro/nomes como está no banco
const respKey=(col,id,field,pid)=>[col,id,field,pid].join('~').replace(/\//g,'_');
const horaDe=date=>parse(date).getDay()===+cfg.diaFds?(cfg.horaFds||''):(cfg.hora||'');
function myItems(pid,from){const out=[];const add=o=>out.push(o);
  sortedWeeks().forEach(w=>{const d=meetDate(w);if(d<from)return;roles(w).forEach(r=>{if(r.pub===pid)add({k:'meio',col:'semanas',id:w.data,field:r.field,date:d,hora:cfg.hora,titulo:'Reunião do meio de semana',txt:r.txt})})});
  sortedFds().forEach(f=>{if(f.data<from)return;rolesFds(f).forEach(r=>{if(r.pub===pid)add({k:'fds',col:'fimdesemana',id:f.data,field:r.field,date:f.data,hora:cfg.horaFds||'',titulo:'Reunião do fim de semana',txt:r.txt})})});
  Object.values(avd).forEach(d0=>{const d=avNorm(d0);if(!d.data||d.data<from)return;const A=(field,txt)=>add({k:'av',col:'av',id:d.data,field,date:d.data,hora:horaDe(d.data),titulo:'Áudio/vídeo e indicadores',txt});
    if(d.av===pid)A('av','Áudio e vídeo');if(d.palco===pid)A('palco','Palco');d.mic.forEach((x,i)=>{if(x===pid)A('mic.'+i,'Microfone volante')});d.ind.forEach((x,i)=>{if(x===pid)A('ind.'+i,'Indicador')})});
  Object.entries(lmp).forEach(([id,s])=>{if(!s||!s.data||s.data<from||!s.grupo)return;const g=lgr[s.grupo];if(!g)return;
    const dir=g.dirigente===pid;if(!dir&&!(g.membros||[]).some(m=>m.id===pid))return;
    add({k:'limp',col:'limpeza',id,field:'grupo',date:s.data,hora:s.tipo==='reuniao'?'após a reunião':'',titulo:'Limpeza do Salão do Reino',txt:(s.tipo==='semanal'?'Limpeza semanal':'Limpeza após a reunião')+' · Grupo '+(g.letra||s.grupo)+(dir?' (você dirige o grupo)':'')})});
  Object.values(cmp).forEach(c=>(c.saidas||[]).forEach(r=>{if(r.dir!==pid)return;const date=cDate(c.semana,r.dia);if(date<from)return;
    add({k:'campo',col:'campo',id:c.semana,field:'saida.'+r.dia+'.'+String(r.hora||'').replace(':','h'),date,hora:r.hora,titulo:'Saída de campo',txt:'Dirigir: '+r.mod+(r.terr?' · '+r.terr:'')})}));
  return out.sort((a,b)=>(a.date+(a.hora||'')).localeCompare(b.date+(b.hora||'')))}
const KCOR={meio:'var(--tes)',fds:'var(--pub)',av:'var(--sent)',limp:'var(--min)',campo:'var(--accent)'};
function icsFor(it){const p2=n=>String(n).padStart(2,'0');const d=it.date.replace(/-/g,'');const m=/^(\d{1,2}):(\d{2})$/.exec(it.hora||'');
  const st=m?d+'T'+p2(m[1])+m[2]+'00':null;let en=null;if(m){const t=new Date(parse(it.date));t.setHours(+m[1]+1,+m[2]);en=iso(t).replace(/-/g,'')+'T'+p2(t.getHours())+p2(t.getMinutes())+'00'}
  const txt=s=>String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c);
  return['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Designar//PT-BR','BEGIN:VEVENT','UID:'+respKey(it.col,it.id,it.field,'x')+'@designar',
    'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',st?'DTSTART:'+st:'DTSTART;VALUE=DATE:'+d,en?'DTEND:'+en:'',
    'SUMMARY:'+txt(it.txt.split('\n')[0]),'DESCRIPTION:'+txt(it.titulo+(cfg.congregacao?' · Congregação '+cfg.congregacao.replace(/^Congrega[cç][aã]o\s+/i,''):'')),'END:VEVENT','END:VCALENDAR'].filter(Boolean).join('\r\n')}
function rPainel(){const v=$('#v-painel');const pid=myPubId();
  if(!pid){v.innerHTML=`<div class="panel" style="padding:20px"><h2 style="margin:0 0 6px">Meu painel</h2><p class="muted" style="margin:0">Sua conta ainda não está ligada a um cadastro de publicador. Peça a um administrador para conferir o seu e-mail na ficha de publicador.</p></div>`;return}
  const nome=pname(pid)||'';const V=ui.pnView||'minhas';
  const seg=`<div class="seg pseg"><button data-a="pnview" data-v="minhas" aria-pressed="${V==='minhas'}">Minhas designações</button><button data-a="pnview" data-v="prog" aria-pressed="${V==='prog'}">Programação</button><button data-a="pnview" data-v="dados" aria-pressed="${V==='dados'}">Meus dados</button></div>`;
  let body='';
  if(V==='minhas'){const from=shiftDays(iso(new Date()),-1);const its=myItems(pid,from);let lastM='';
    body=its.length?its.map((it,i)=>{const m=it.date.slice(0,7);const head=m!==lastM?`<h3 class="pmes">${cap(monthLabel(m))}</h3>`:'';lastM=m;const dt=parse(it.date);
      const r=resp[respKey(it.col,it.id,it.field,pid)];const st=r&&r.status;
      const acts=st==='ok'?`<span class="pst ok">Confirmado</span><button class="btn small ghost" data-a="pnresp" data-i="${i}" data-s="">Desfazer</button>`
        :st==='nao'?`<span class="pst nao">Você avisou que não pode</span><button class="btn small ghost" data-a="pnresp" data-i="${i}" data-s="">Desfazer</button>`
        :`<button class="btn small primary" data-a="pnresp" data-i="${i}" data-s="ok">Confirmar</button><button class="btn small" data-a="pnresp" data-i="${i}" data-s="nao">Não posso</button>`;
      return head+`<div class="pitem"><span class="cal" aria-hidden="true"><small>${DIAS[dt.getDay()].slice(0,3).toUpperCase()}</small><b>${pad(dt.getDate())}</b></span>
        <div class="pinfo"><small style="color:${KCOR[it.k]}">${esc(it.titulo)}${it.hora?' · '+esc(it.hora):''}</small><b>${esc(it.txt)}</b>
        <div class="pacts">${acts}<button class="btn small ghost" data-a="pnics" data-i="${i}">Adicionar à agenda</button></div></div></div>`}).join('')
      :`<div class="panel" style="padding:20px"><p class="muted" style="margin:0">Você não tem designações marcadas a partir de hoje. Quando alguém designar você, ela aparece aqui.</p></div>`;
    ui.pnItems=its}
  else if(V==='prog'){if(!ui.pnMonth)ui.pnMonth=iso(new Date()).slice(0,7);const K=ui.pnKind||'meio';
    const kinds=[['meio','Meio de semana'],['fds','Fim de semana'],['limp','Limpeza'],['av','A/V e Indicadores'],['campo','Pregação']];
    body=`<div class="seg seg4" style="max-width:520px">${kinds.map(([k,l])=>`<button data-a="pnkind" data-k="${esc(k)}" aria-pressed="${K===k}">${l}</button>`).join('')}</div>
      <div class="monthnav" style="margin:14px 0 10px;justify-content:flex-start;gap:12px"><button class="btn small ghost" data-a="pnprev" aria-label="Mês anterior">‹</button><strong>${monthLabel(ui.pnMonth)}</strong><button class="btn small ghost" data-a="pnnext" aria-label="Próximo mês">›</button></div>
      <div id="pnStage" class="pnstage"></div>`}
  else{body=`<div class="panel" style="padding:20px;display:flex;flex-direction:column;gap:10px" id="pnDados"><p class="muted" style="margin:0">Carregando…</p></div>`}
  const fz=fonteGet();const letra=`<div class="pfonte" role="group" aria-label="Tamanho da letra"><span>Letra</span>${FONTES.map(([v,l])=>`<button data-a="fonte" data-v="${v}" aria-pressed="${v===fz}" aria-label="Letra ${v===1?'normal':v<1.2?'grande':'maior'}" style="font-size:${13*v}px">${l}</button>`).join('')}</div>`;
  v.innerHTML=`<div class="pzoom"><div class="phead"><div><small>Meu painel</small><h2>Olá, ${esc(String(nome).split(' ')[0]||'irmão')}</h2></div>${letra}</div>${seg}<div class="pbodyp">${body}</div></div>`;
  if(V==='prog')requestAnimationFrame(pnStage);
  if(V==='dados')pnDados(pid)}
function pnStage(){const st=$('#pnStage');if(!st)return;const ym=ui.pnMonth,K=ui.pnKind||'meio';let sel=[];
  if(K==='meio')sel=sortedWeeks().filter(w=>w.data.startsWith(ym));else if(K==='fds')sel=sortedFds().filter(f=>f.data.startsWith(ym));
  else if(K==='limp'||K==='av')sel=[{data:ym+'-01',ym}];else sel=campoWeeks(ym).filter(m=>cmp[m]).map(m=>({data:cThu(m),mon:m}));
  if(!sel.length){st.innerHTML='<p class="muted">Nada programado neste mês ainda.</p>';return}
  layoutPages(sel,cap(monthLabel(ym)),K,st)}
async function pnDados(pid){const box=$('#pnDados');if(!box)return;let p=pubs[pid];
  if(painelOnly()){try{p=await window.FBX.myPubDoc()}catch(e){p=null}}
  const I=(window.FBX&&window.FBX.pub)||{};
  if(!p){box.innerHTML='<p class="muted" style="margin:0">Não foi possível carregar os seus dados.</p>';return}
  const cats=(p.cats||[]).map(c=>CATNAME[c]).filter(Boolean);
  box.innerHTML=`<h3 style="margin:0;font-size:18px">Seus dados no sistema</h3>
    <div class="pdl"><span>Nome</span><b>${esc(p.nome||'')}</b><span>WhatsApp</span><b>${esc(p.tel||'—')}</b><span>E-mail</span><b>${esc(p.email||window.FBX.email||'')}</b><span>Pode ser designado para</span><b>${cats.length?esc(cats.join(', ')):'—'}</b></div>
    <p class="hint" style="margin:6px 0 0">Algo errado ou quer que seus dados sejam apagados? Fale com ${esc(I.responsavel||'os anciãos da congregação')}${I.contato?' ('+esc(I.contato)+')':''}. <a href="#" data-doc="privacidade">Aviso de privacidade</a></p>`}
Object.assign(PACTS,{
  pnview:b=>{ui.pnView=b.dataset.v;rPainel()},
  pnkind:b=>{ui.pnKind=b.dataset.k;rPainel()},
  pnprev:()=>{ui.pnMonth=shiftMonth(ui.pnMonth,-1);rPainel()},pnnext:()=>{ui.pnMonth=shiftMonth(ui.pnMonth,1);rPainel()},
  pnics:async b=>{const it=(ui.pnItems||[])[+b.dataset.i];if(!it)return;await saveFile('designacao-'+it.date+'.ics',new Blob([icsFor(it)],{type:'text/calendar'}))},
  pnresp:async b=>{const it=(ui.pnItems||[])[+b.dataset.i];const pid=myPubId();if(!it||!pid||!window.FBX)return;const k=respKey(it.col,it.id,it.field,pid);const s=b.dataset.s;
    try{if(!s){await window.FBX.delResposta(k);delete resp[k]}
      else{const d={pub:pid,col:it.col,id:it.id,field:it.field,date:it.date,txt:it.txt.split('\n')[0],status:s};await window.FBX.setResposta(k,d);resp[k]=Object.assign({},d,{em:null})}
      rPainel();toast(!s?'Resposta desfeita':s==='ok'?'Designação confirmada':'Aviso enviado aos responsáveis')}catch(e){toast('Não foi possível salvar ('+((e&&e.code)||'erro')+')')}}});
/* resumo das confirmações dentro dos editores (meio e fim de semana) */
function respResumo(col,id,rs){if(!window.FBX)return'';let ok=0;const nao=[];
  rs.forEach(r=>{const x=resp[respKey(col,id,r.field,r.pub)];if(!x)return;if(x.status==='ok')ok++;else if(x.status==='nao')nao.push(tc(pname(r.pub))+' ('+r.txt.split(/[:(\n]/)[0].trim()+')')});
  if(!ok&&!nao.length)return'';
  return`<div class="respbox">${ok?`<span><b>${ok}</b> de ${rs.length} confirmaram</span>`:''}${nao.length?`<span class="nao">Não podem: ${esc(nao.join('; '))}</span>`:''}</div>`}
/* mantém a lista de nomes (sem telefones) que o painel dos publicadores usa */
function syncNomes(){const F=window.FBX;if(!F||!['admin','editor'].includes(F.papel)||!loaded.p||nomesRemote===null)return;
  const map={};Object.entries(pubs).forEach(([id,p])=>{if(p&&p.nome)map[id]=tc(p.nome)});
  /* compara sem depender da ordem: o Firebase pode devolver os nomes em outra ordem, e isso não é mudança */
  const can=o=>JSON.stringify(Object.keys(o||{}).sort().map(k=>[k,o[k]]));
  if(can(map)===can(nomesRemote))return;clearTimeout(syncNomes.t);
  /* trava de segurança: no máximo uma gravação a cada 30 s, mesmo que algo volte a parecer diferente */
  const espera=Math.max(1200,(syncNomes.ultima||0)+30000-Date.now());
  syncNomes.t=setTimeout(()=>{if(can(map)===can(nomesRemote))return;syncNomes.ultima=Date.now();nomesRemote=map;store.set('quadro','nomes',{nomes:map}).catch(()=>{nomesRemote=null})},espera)}
