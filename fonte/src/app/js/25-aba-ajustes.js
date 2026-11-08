/* ================= Aba Ajustes ================= */
const isAdm=()=>!window.FBX||window.FBX.papel==='admin';
function rAjustes(){
  if(!isAdm()){$('#v-ajustes').innerHTML=`<div class="panel settings"><div class="full"><h3 style="margin:0 0 6px;font-size:16px">Ajustes</h3><p class="muted" style="margin:0;font-size:14.5px">Só administradores mudam os ajustes gerais (dia e horário das reuniões, nome da congregação, mensagem do WhatsApp), a lista de acesso e as cópias de segurança.</p></div><div class="full" id="accBox"></div></div>`;drawAcc();return}
  const mis=misaligned(),nm2=mis.ws.length+mis.fs.length;
  $('#v-ajustes').innerHTML=`<div class="panel settings">
    ${nm2?`<div class="full drawres short" style="display:flex;flex-direction:column;gap:8px"><span>${mis.ws.length?`${mis.ws.length} semana${mis.ws.length>1?'s':''} do meio de semana (${mis.ws.slice(0,4).map(w=>br(w.data).slice(0,5)).join(', ')}${mis.ws.length>4?'…':''}) não ${mis.ws.length>1?'estão':'está'} em ${DIAS[cfg.dia]}. `:''}${mis.fs.length?`${mis.fs.length} reuni${mis.fs.length>1?'ões':'ão'} de fim de semana (${mis.fs.slice(0,4).map(f=>br(f.data).slice(0,5)).join(', ')}${mis.fs.length>4?'…':''}) não ${mis.fs.length>1?'estão':'está'} em ${DIAS[cfg.diaFds]}. `:''}Só datas de hoje em diante entram aqui; os nomes e a programação continuam iguais.</span>
      ${ui.delAsk==='align'?`<span class="confirm">Mover para o dia configurado, dentro da mesma semana? <button class="btn small primary" data-a="alignok">Mover</button><button class="btn small" data-a="alignno">Cancelar</button></span>`:`<span><button class="btn small" data-a="alignask">Ajustar datas</button></span>`}</div>`:''}
    <label class="f">Nome da congregação<input type="text" id="c-cong" value="${esc(cfg.congregacao)}"></label>
    <label class="f">Dia da reunião<select id="c-dia">${DIAS.map((d,i)=>`<option value="${i}" ${+cfg.dia===i?'selected':''}>${cap(d)}</option>`).join('')}</select></label>
    <label class="f">Horário de início<input type="time" id="c-hora" value="${esc(cfg.hora)}"></label>
    <label class="f">Dia da reunião de fim de semana<select id="c-diafds">${DIAS.map((d,i)=>`<option value="${i}" ${+cfg.diaFds===i?'selected':''}>${cap(d)}</option>`).join('')}</select></label>
    <label class="f">Horário do fim de semana<input type="time" id="c-horafds" value="${esc(cfg.horaFds||'09:00')}"></label>
    <label class="f">Dia da limpeza semanal<select id="c-dialimp">${DIAS.map((d,i)=>`<option value="${i}" ${+cfg.diaLimpeza===i?'selected':''}>${cap(d)}</option>`).join('')}</select></label>
    <label class="f">Sem repetir irmã no ministério por (meses)<input type="number" id="c-int" min="0" max="12" value="${esc(cfg.intervaloMeses??2)}" style="width:100%"></label>
    <label class="f">Papel<select id="c-papel"><option ${cfg.papel==='A4'?'selected':''}>A4</option><option ${cfg.papel==='Carta'?'selected':''}>Carta</option></select></label>
    <label class="f full">Link da reunião no Zoom<input type="url" id="c-zoom" value="${esc(cfg.zoom||'')}" placeholder="https://jworg.zoom.us/j/..." inputmode="url" autocomplete="off"><span class="hint">Aparece para todos no painel e no menu da conta, com o botão "Entrar no Zoom". Fica guardado só no banco da congregação.</span></label>
    <label class="f full">Mensagem do WhatsApp<textarea id="c-msg">${esc(cfg.mensagem)}</textarea>
      <span class="hint" style="font-weight:400">Use {nome}, {nome_completo}, {reuniao}, {data}, {dia_semana}, {hora}, {designacoes} e {congregacao}. Eles são trocados pelos dados de cada publicador.</span></label>
    <div class="full" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button class="btn" data-a="exportjson">Baixar cópia de segurança</button>
      <label class="btn" style="cursor:pointer">Restaurar cópia<input type="file" id="c-import" accept="application/json,.json" hidden></label>
      <label class="hint" style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" id="c-import-subst"> Substituir tudo (apaga o que não estiver na cópia)</label>
      <span class="hint" style="flex-basis:100%">A cópia guarda publicadores, semanas, fim de semana, limpeza, itens, A/V, campo e ajustes em um arquivo .json.</span>
    </div>${window.FBX&&window.FBX.email?`<div class="full accbox"><h3 style="margin:0 0 4px;font-size:16px">Aviso de privacidade (LGPD)</h3><p class="hint" style="margin:0 0 10px">Aparecem no aviso de privacidade e na página Sobre, inclusive na tela de login: é com quem os publicadores falam para ver, corrigir ou apagar os próprios dados.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px"><label class="f">Responsável pelos dados<input type="text" id="c-resp" value="${esc((window.FBX.pub||{}).responsavel||'')}" placeholder="Ex.: Corpo de anciãos da Congregação Jorrinho"></label>
      <label class="f">Contato para pedidos<input type="text" id="c-cont" value="${esc((window.FBX.pub||{}).contato||'')}" placeholder="E-mail ou telefone"></label></div>
      <div style="margin-top:8px;display:flex;gap:12px;flex-wrap:wrap;font-size:13.5px"><a href="#" data-doc="privacidade">Ver aviso de privacidade</a><a href="#" data-doc="termos">Ver termo de uso</a></div></div>
      <div class="full" id="copiasBox"></div><div class="full" id="accBox"></div><div class="full" id="diagBox"></div><div class="full" id="errBox"></div><div class="full" id="actBox"></div>`:''}</div>`;
  if(window.FBX&&window.FBX.email){drawAcc();drawAct();drawCopias();drawDiag();drawErros()}
}
/* ===== Registro de atividade (administradores) ===== */
const COLN={semanas:'Meio de semana',fimdesemana:'Fim de semana',publicadores:'Publicador',eventos:'Tipo de semana',limpezaGrupos:'Grupo de limpeza',limpeza:'Escala de limpeza',estoque:'Item de higiene e limpeza',av:'A/V e Indicadores',campo:'Saídas de campo',config:'Ajustes'};
const tsDate=t=>t&&(t.seconds!=null?new Date(t.seconds*1000):t.toDate?t.toDate():null);
const tsLabel=t=>{const d=tsDate(t);return d?pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes()):''};
const who=(e,n)=>esc(n||String(e||'').split('@')[0]);
function actItem(c,id){if(c==='publicadores')return pubs[id]?tc(pubs[id].nome):id;if(c==='config')return'';if(/^\d{4}-\d\d-\d\d/.test(id))return c==='campo'?campoLabel(id):br(id.slice(0,10))+(id.length>10?' ('+id.slice(11)+')':'');if(c==='estoque'&&stk[id])return stk[id].nome;return id}
function drawAct(){const box=$('#actBox');if(!box||!window.FBX)return;
  if(!ui.actSub){ui.actSub=true;window.FBX.recent(l=>{ui.act=l;drawAct()},()=>{ui.act=[]})}
  const l=ui.act;
  box.innerHTML=`<div class="accbox"><h3 style="margin:0 0 4px;font-size:16px">Atividade recente</h3><p class="hint" style="margin:0 0 8px">As últimas alterações feitas no sistema, com quem fez e quando.</p>
    ${l==null?'<div class="muted" style="font-size:14px">Carregando…</div>':l.length?`<div class="actlist">${l.map(a=>`<div class="actrow"><span class="muted">${tsLabel(a.em)}</span><span><b>${who(a.por,a.nome)}</b> ${a.acao==='restaurou'?'restaurou uma cópia de segurança':(a.acao==='excluiu'?'excluiu ':'alterou ')+esc(COLN[a.col]||a.col)+(actItem(a.col,a.id)?' · '+esc(actItem(a.col,a.id)):'')}</span></div>`).join('')}</div>`:'<div class="muted" style="font-size:14px">Nenhuma alteração registrada ainda.</div>'}</div>`}
/* "última alteração" dentro dos editores */
function lastMod(d){if(!window.FBX||!d||!d._por)return'';return`<div class="lastmod">Última alteração: <b>${who(d._por,d._nome)}</b>${d._em?' · '+tsLabel(d._em):''}</div>`}
/* ===== Lembrete de cópia de segurança (administradores, a cada 30 dias) ===== */
function bkCheck(){const box=$('#bkBox');if(!box)return;if(!window.FBX||!isAdm()||!loaded.c){box.hidden=true;return}
  let snooze=0;try{snooze=+localStorage.getItem('vmc-bk-adiar')||0}catch(e){}
  const last=cfg.ultimoBackup;const dias=last?Math.floor((Date.now()-parse(last).getTime())/864e5):null;
  if((dias!=null&&dias<30)||Date.now()<snooze){box.hidden=true;return}
  /* com cópias automáticas recentes no servidor, o lembrete de baixar só aparece a cada 60 dias */
  if(typeof copias!=='undefined'&&copias===null){box.hidden=true;return} // espera saber se há cópias no servidor
  const ult=typeof copias!=='undefined'&&copias&&copias[0];if(ult&&Date.now()-parse(ult.id.slice(0,10)).getTime()<8*864e5&&(dias==null||dias<60)){box.hidden=true;return}
  box.innerHTML=`<span>${dias==null?'Ainda não há cópia de segurança dos dados.':'Faz '+dias+' dias desde a última cópia de segurança.'} Baixe uma e guarde com você: se algo for apagado por engano, é com ela que se recupera.</span><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small primary" data-a="exportjson">Baixar cópia agora</button><button class="btn small ghost" data-a="bkadiar">Lembrar daqui a 7 dias</button></span>`;box.hidden=false}
Object.assign(PACTS,{bkadiar:()=>{try{localStorage.setItem('vmc-bk-adiar',String(Date.now()+7*864e5))}catch(e){}bkCheck()}});
/* ===== Conta no topo: quem está conectado e botão Sair (versão hospedada) ===== */
function contaInit(){const F=window.FBX;if(!F||!F.email||$('#contaBtn'))return;
  const nome=F.nome||F.email.split('@')[0];const ini=nome.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  $('#temaBtn').insertAdjacentHTML('afterend',`<div class="conta"><button class="contabtn" id="contaBtn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Sua conta: ${esc(F.email)}">${esc(ini)}</button>
    <div class="contamenu" id="contaMenu" hidden><div class="contaq"><b>${esc(nome)}</b><span>${esc(F.email)}</span><span class="abtag" style="align-self:flex-start;margin-top:4px">${esc(PAPEIS[F.papel]||F.papel)}</span></div>
    ${ehApp()?'':'<button type="button" class="contaitem" data-a="instmenu">Instalar como aplicativo</button>'}
    <button type="button" class="contaitem" id="zoomItem" data-a="zoomir" hidden>Reunião pelo Zoom</button>
    ${avisoLigado()?'<button type="button" class="contaitem" data-a="avisomenu">Avisos no celular</button>':''}
    <button type="button" class="contaitem" data-doc="privacidade">Aviso de privacidade</button>
    <button type="button" class="contaitem sair" data-a="fbout">Sair da conta</button></div></div>`)}
/* nome mostrado: o da conta Google ou, se não houver (entrada por e-mail), o do cadastro de publicador */
function contaNome(){const F=window.FBX;if(!F||!F.email)return'';const p=myPubId();return F.nome||(p&&pname(p)?tc(pname(p)):'')||F.email.split('@')[0]}
function contaSync(){const b=$('#contaBtn');if(!b)return;const n=contaNome();const ini=n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  if(b.textContent!==ini)b.textContent=ini;const q=$('#contaMenu .contaq b');if(q&&q.textContent!==n)q.textContent=n}
function contaToggle(open){contaSync();const m=$('#contaMenu'),b=$('#contaBtn');if(!m)return;m.hidden=!open;b.setAttribute('aria-expanded',String(open));if(open){const f=m.querySelector('button');if(f)f.focus()}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#contaBtn');if(b){contaToggle($('#contaMenu').hidden);return}
  const m=$('#contaMenu');if(m&&!m.hidden&&!m.contains(e.target))contaToggle(false);if(m&&!m.hidden&&e.target.closest&&e.target.closest('.contaitem'))contaToggle(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('#contaMenu');if(m&&!m.hidden){contaToggle(false);$('#contaBtn').focus()}}});
/* ===== Acesso (só na versão hospedada com Firebase) ===== */
/* acesso por e-mail ou pelo celular (+55DDDNÚMERO, como o Firebase guarda quem entra por SMS) */
/* celulares antigos sem o 9 na frente (75 9300-4282) viram o formato atual (75 99300-4282), que é o que chega no SMS */
const telE164=v=>{let d=String(v||'').replace(/\D/g,'').replace(/^0+/,'');if(d.length===10||d.length===11)d='55'+d;if(/^55\d{10}$/.test(d)&&/[6-9]/.test(d[4]))d=d.slice(0,4)+'9'+d.slice(4);return /^55\d{11}$|^55\d{10}$/.test(d)?'+'+d:null};
const idAcesso=v=>{v=String(v||'').trim();if(v.includes('@'))return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?v.toLowerCase():null;return telE164(v)};
const idDoPub=p=>p.email?String(p.email).trim().toLowerCase():(p.tel?telE164(p.tel):null);
const idLbl=e=>String(e||'').startsWith('+')?fmtTel(e.replace(/^\+/,'')):String(e||'');
const PAPEIS={admin:'Administrador',editor:'Pode editar',leitor:'Só visualizar',publicador:'Publicador (só o painel)'};
function drawAcc(){const box=$('#accBox');if(!box)return;const F=window.FBX;const adm=F.papel==='admin';
  if(adm)acessoInit();
  const AC=ui.aceites||{};const accInfo=e=>{const a=AC[e];if(!a)return'<small class="muted">ainda não entrou</small>';return`<small class="muted">${a.ultimo?'último acesso '+tsLabel(a.ultimo):''}${a.em?' · aceitou o termo em '+tsLabel(a.em).slice(0,10):''}</small>`};
  const all=(ui.acc||[]).slice().sort((a,b)=>a.email.localeCompare(b.email));const list=all.filter(a=>a.papel!=='publicador');const pubAcc=all.filter(a=>a.papel==='publicador');
  const known=new Set(all.map(a=>a.email));const linked=new Set(all.map(a=>a.pub).filter(Boolean));const pend=Object.entries(pubs).filter(([id,p])=>{const e=idDoPub(p);return e&&p.ativo!==false&&!linked.has(id)&&!known.has(e)&&e!==F.owner});
  const pubOpts=cur=>'<option value="">— sem ligação —</option>'+Object.keys(pubs).sort((a,b)=>pname(a).localeCompare(pname(b),'pt')).map(id=>`<option value="${id}" ${id===cur?'selected':''}>${esc(tc(pname(id)))}</option>`).join('');
  const lig=a=>a.pub&&pubs[a.pub]?' · <span class="muted">'+esc(tc(pname(a.pub)))+'</span>':'';
  box.innerHTML=`<div class="accbox"><h3 style="margin:0 0 4px;font-size:16px">Acesso ao sistema</h3>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px">Conectado como <b>${esc(F.email)}</b><span class="abtag">${esc(PAPEIS[F.papel]||F.papel)}</span><button class="btn small ghost" data-a="fbout">Sair</button></div>
    ${adm?pedidosHTML():''}
    ${adm?`<p class="hint" style="margin:10px 0 6px">Só entram no sistema os e-mails e celulares desta lista (conta Google, link no e-mail ou código por SMS). Quem "pode editar" muda as designações; quem "só visualiza" vê tudo, mas não consegue salvar alterações. Administradores também mexem nesta lista.</p>
    <div class="acclist">${F.owner?`<div class="accrow"><span>${esc(idLbl(F.owner))}<br>${accInfo(F.owner)}</span><span class="muted" style="font-size:13px">Administrador principal (fixo)</span><span></span></div>`:''}
    ${list.filter(a=>a.email!==F.owner).map(a=>`<div class="accrow"><span>${esc(idLbl(a.email))}${lig(a)}<br>${accInfo(a.email)}</span><select class="accp" data-e="${esc(a.email)}" aria-label="Permissão de ${esc(a.email)}">${Object.entries(PAPEIS).map(([k,v])=>`<option value="${k}" ${a.papel===k?'selected':''}>${v}</option>`).join('')}</select>
      ${ui.delAsk==='acc'+a.email?`<span class="confirm"><button class="btn small danger" data-a="accdelok" data-e="${esc(a.email)}">Remover</button><button class="btn small" data-a="accno">Não</button></span>`:`<button class="btn small ghost danger" data-a="accdel" data-e="${esc(a.email)}">Remover</button>`}</div>`).join('')}
    ${ui.acc&&!list.filter(a=>a.email!==F.owner).length?'<div class="muted" style="font-size:14px;padding:6px 0">Ninguém além de você ainda.</div>':''}</div>
    <div class="accadd"><input type="text" id="accEmail" placeholder="e-mail ou celular com DDD" autocomplete="off" aria-label="E-mail ou celular"><select id="accPapel" aria-label="Permissão">${Object.entries(PAPEIS).map(([k,v])=>`<option value="${k}" ${k==='editor'?'selected':''}>${v}</option>`).join('')}</select><select id="accPub" aria-label="Ligar ao publicador">${pubOpts('')}</select><button class="btn small primary" data-a="accadd">Dar acesso</button></div>
    <p class="hint" style="margin:6px 0 0">"Ligar ao publicador" mostra as designações daquela pessoa em "Meu painel". Para o nível Publicador, é obrigatório.</p>
    <h3 style="margin:22px 0 4px;font-size:16px">Painel dos publicadores</h3>
    <p class="hint" style="margin:0 0 8px">Publicadores com acesso veem só as próprias designações, as programações do mês e os próprios dados. Não veem telefones nem dados de outros.</p>
    ${pend.length?`<div class="drawres" style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span>${pend.length} publicador${pend.length>1?'es têm':' tem'} e-mail ou celular no cadastro e ainda não ${pend.length>1?'têm':'tem'} acesso ao painel.</span><button class="btn small primary" data-a="accbulk">Liberar o painel para ${pend.length>1?'todos':'ele'}</button></div>`:''}
    <div class="acclist">${pubAcc.map(a=>`<div class="accrow conv"><span>${a.pub&&pubs[a.pub]?'<b>'+esc(tc(pname(a.pub)))+'</b> · ':''}${esc(idLbl(a.email))}<br>${a.pub?accInfo(a.email):'<small style="color:var(--err)">sem ligação com um publicador</small>'}</span><select class="accpub" data-e="${esc(a.email)}" aria-label="Publicador ligado a ${esc(a.email)}">${pubOpts(a.pub||'')}</select>${a.pub&&pubs[a.pub]&&waNumber(pubs[a.pub].tel||'')?`<a class="btn small wa" target="_blank" rel="noopener" href="https://wa.me/${waNumber(pubs[a.pub].tel)}?text=${encodeURIComponent(conviteMsg(a.email,a.pub))}">Convite</a>`:'<span></span>'}
      ${ui.delAsk==='acc'+a.email?`<span class="confirm"><button class="btn small danger" data-a="accdelok" data-e="${esc(a.email)}">Remover</button><button class="btn small" data-a="accno">Não</button></span>`:`<button class="btn small ghost danger" data-a="accdel" data-e="${esc(a.email)}">Remover</button>`}</div>`).join('')||'<div class="muted" style="font-size:14px;padding:6px 0">Nenhum publicador com acesso ainda. Com o e-mail ou o celular na ficha de cada publicador (aba Publicadores), use o botão acima.</div>'}</div>`:''}
  </div>`}
Object.assign(PACTS,{
  fbout:()=>window.FBX.signOut(),
  accadd:async()=>{const e=idAcesso($('#accEmail').value);if(!e){toast('Escreva um e-mail válido ou um celular com DDD');return}
    const pa=$('#accPapel').value,pu=$('#accPub').value;if(pa==='publicador'&&!pu){toast('Escolha qual publicador é essa pessoa');return}
    try{await window.FBX.setAccess(e,pa,pu||null);toast('Acesso liberado para '+idLbl(e))}catch(err){toast('Não foi possível salvar ('+((err&&err.code)||'erro')+')')}},
  accbulk:async b=>{b.disabled=true;const known=new Set((ui.acc||[]).map(a=>a.email));let n=0;
    const linked=new Set((ui.acc||[]).map(a=>a.pub).filter(Boolean));for(const [id,p] of Object.entries(pubs)){const e=idDoPub(p);if(!e||p.ativo===false||linked.has(id)||known.has(e)||e===window.FBX.owner)continue;try{await window.FBX.setAccess(e,'publicador',id);n++}catch(err){}}
    toast(n+' publicador'+(n===1?' liberado':'es liberados'))},
  accdel:b=>{ui.delAsk='acc'+b.dataset.e;drawAcc()},accno:()=>{ui.delAsk=null;drawAcc()},
  accdelok:async b=>{ui.delAsk=null;try{await window.FBX.delAccess(b.dataset.e);toast('Acesso removido')}catch(err){toast('Não foi possível remover');drawAcc()}}});
document.addEventListener('change',async e=>{const t=e.target;if(!t.classList||!t.classList.contains('accpub'))return;try{await window.FBX.setAccess(t.dataset.e,'publicador',t.value||null);toast('Ligação alterada')}catch(err){toast('Não foi possível alterar')}});
document.addEventListener('change',async e=>{const t=e.target;if(!t.classList||!t.classList.contains('accp'))return;try{await window.FBX.setAccess(t.dataset.e,t.value);toast('Permissão alterada')}catch(err){toast('Não foi possível alterar')}});
document.addEventListener('input',e=>{const id=e.target.id;const map={'c-cong':'congregacao','c-dia':'dia','c-hora':'hora','c-papel':'papel','c-msg':'mensagem','c-int':'intervaloMeses','c-diafds':'diaFds','c-horafds':'horaFds','c-dialimp':'diaLimpeza','c-zoom':'zoom'};
  if((id==='c-resp'||id==='c-cont'||id==='c-cong')&&window.FBX&&window.FBX.setPublic){clearTimeout(rAjustes.pt);rAjustes.pt=setTimeout(()=>{const d={congregacao:cfg.congregacao||''};const r=$('#c-resp'),c=$('#c-cont');if(r)d.responsavel=r.value.trim();if(c)d.contato=c.value.trim();window.FBX.setPublic(d).then(()=>setStatus('Tudo salvo')).catch(()=>setStatus('Não foi possível salvar o aviso de privacidade','error'))},800)}
  if(map[id]){cfg[map[id]]=(id==='c-dia'||id==='c-int'||id==='c-diafds'||id==='c-dialimp')?+e.target.value:e.target.value;if(id==='c-dia'||id==='c-diafds')setTimeout(rAjustes,0);queueSave('config','geral',cfg);$('#hName').textContent=cfg.congregacao?'Congregação '+cfg.congregacao.replace(/^Congrega[cç][aã]o\s+/i,''):'';}});
async function exportJson(){const blob=new Blob([JSON.stringify({publicadores:pubs,semanas:weeks,fimdesemana:fds,eventos:evs,limpezaGrupos:lgr,limpeza:lmp,estoque:stk,av:avd,campo:cmp,config:cfg},null,1)],{type:'application/json'});const ok=await saveFile('designacoes-vmc-'+iso(new Date())+'.json',blob);if(ok&&window.FBX&&isAdm()){cfg.ultimoBackup=iso(new Date());queueSave('config','geral',cfg);bkCheck()}}
/* restaura uma cópia (arquivo ou cópia guardada no servidor); com "subst", apaga o que não estiver na cópia */
async function restaurarDados(d,subst){if(window.FBX)window.FBX.quiet=true;let n=0,del=0;
  try{
    if(subst){const M={publicadores:pubs,semanas:weeks,fimdesemana:fds,eventos:evs,limpezaGrupos:lgr,limpeza:lmp,estoque:stk,av:avd,campo:cmp};
      for(const[c,m]of Object.entries(M)){if(!d[c])continue;for(const id of Object.keys(m)){if(!(id in d[c])){delete m[id];await store.del(c,id);del++}}}}
    for(const[id,p]of Object.entries(d.publicadores||{})){pubs[id]=p;await store.set('publicadores',id,p);n++}
    for(const[id,w]of Object.entries(d.semanas||{})){weeks[id]=norm(w);await store.set('semanas',id,weeks[id]);n++}
    for(const[id,f]of Object.entries(d.fimdesemana||{})){fds[id]=normF(f);await store.set('fimdesemana',id,fds[id]);n++}
    for(const[id,v]of Object.entries(d.eventos||{})){evs[id]=v;await store.set('eventos',id,v);n++}
    for(const[id,v]of Object.entries(d.limpezaGrupos||{})){lgr[id]=v;await store.set('limpezaGrupos',id,v);n++}
    for(const[id,v]of Object.entries(d.limpeza||{})){lmp[id]=v;await store.set('limpeza',id,v);n++}
    for(const[id,v]of Object.entries(d.estoque||{})){stk[id]=v;await store.set('estoque',id,v);n++}
    for(const[id,v]of Object.entries(d.av||{})){avd[id]=v;await store.set('av',id,v);n++}
    for(const[id,v]of Object.entries(d.campo||{})){cmp[id]=v;await store.set('campo',id,v);n++}
    if(d.config){const ub=cfg.ultimoBackup;cfg=Object.assign({},DEF_CFG,d.config);if(ub)cfg.ultimoBackup=ub;await store.set('config','geral',cfg)}
  }finally{if(window.FBX)window.FBX.quiet=false}
  buildHist();if(window.FBX)window.FBX.log('restaurou','config','copia');return{n,del}}
document.addEventListener('change',e=>{if(e.target.id!=='c-import')return;if(!isAdm()){toast('Só administradores restauram cópias');return}const f=e.target.files[0];if(!f)return;const r=new FileReader();
  const subst=!!($('#c-import-subst')||{}).checked;
  if(subst&&!confirm('Substituir tudo: o que estiver no sistema e não estiver na cópia será apagado (publicadores, semanas, fim de semana, limpeza, itens, A/V e campo). Continuar?')){e.target.value='';return}
  r.onload=async()=>{let d;try{d=JSON.parse(r.result)}catch(err){toast('Arquivo inválido');e.target.value='';return}
    try{const x=await restaurarDados(d,subst);toast(x.n+' registros restaurados'+(x.del?', '+x.del+' removidos':''))}catch(err){toast('Não foi possível restaurar tudo ('+((err&&err.code)||'erro')+')')}
    e.target.value='';rAjustes()};r.readAsText(f)});

document.body.insertAdjacentHTML('beforeend','<datalist id="cantList">'+CANTICOS.map((t,i)=>'<option value="'+esc((i+1)+' - '+t)+'">').join('')+'</datalist>');
/* ao sair do campo, só o número vira número + título */
document.addEventListener('change',e=>{const t=e.target;if(!t.matches||!t.matches('[list=cantList]'))return;const v=cant(t.value);if(v!==t.value){t.value=v;t.dispatchEvent(new Event('input',{bubbles:true}))}});
/* (o início do sistema fica no fim do último arquivo: 99-inicio.js) */