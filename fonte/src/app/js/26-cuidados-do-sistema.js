/* ================= Cuidados do sistema: cópias automáticas, quem tem acesso, erros nos aparelhos e diagnóstico ================= */

/* ----- Lista de acesso (só administradores conseguem ler): usada em Ajustes, Confirmações e Publicadores ----- */
function acessoInit(){const F=window.FBX;if(ui.accSub||!F||F.papel!=='admin'||!F.listAccess)return;ui.accSub=true;
  F.listAccess(l=>{ui.acc=l;acessoMudou()},()=>{ui.acc=null});
  if(F.listAceites)F.listAceites(m=>{ui.aceites=m;acessoMudou()},()=>{})}
function acessoMudou(){if(ui.tab==='ajustes')drawAcc();else if(['confirmacoes','publicadores'].includes(ui.tab))renderAll(true)}
/* situação de cada publicador no painel: 'ativo' (já entrou), 'convidado' (tem acesso, ainda não entrou), 'sem' (sem acesso); null = não dá para saber */
function acessoDe(pid){const F=window.FBX;if(!F||F.papel!=='admin'||!ui.acc)return null;
  const a=ui.acc.find(x=>x.pub===pid)||(F.owner&&F.pubId===pid?{email:F.owner}:null);if(!a)return'sem';
  return(ui.aceites||{})[a.email]?'ativo':'convidado'}

/* ----- Cópias automáticas no servidor: uma por semana, guardando as 8 mais recentes ----- */
const dadosAtuais=()=>({publicadores:pubs,semanas:weeks,fimdesemana:fds,eventos:evs,limpezaGrupos:lgr,limpeza:lmp,estoque:stk,av:avd,campo:cmp,config:cfg});
const contaRegs=d=>['publicadores','semanas','fimdesemana','eventos','limpezaGrupos','limpeza','estoque','av','campo'].reduce((a,k)=>a+Object.keys(d[k]||{}).length,0);
let copias=null;
function copiasInit(){const F=window.FBX;if(ui.copSub||!F||!F.copias||F.papel!=='admin')return;ui.copSub=true;
  F.copias.listar(l=>{copias=l;copiaAuto();bkCheck();if(ui.tab==='ajustes')drawCopias()},()=>{copias=[];bkCheck()})}
async function copiaAuto(){const F=window.FBX;if(!copias||copiaAuto.feito||!F||F.papel!=='admin')return;
  if(!(loaded.p&&loaded.w&&loaded.c&&loaded.f&&loaded.e))return; // só com todos os dados do servidor
  const ult=copias[0];const dias=ult?Math.floor((Date.now()-parse(ult.id.slice(0,10)).getTime())/864e5):999;
  copiaAuto.feito=true;if(dias<7)return;
  await guardarCopia(true)}
async function guardarCopia(auto){const F=window.FBX;const d=dadosAtuais();const n=contaRegs(d);
  if(n<5){if(!auto)toast('Não há dados suficientes para guardar');return false} // nunca guarda uma cópia vazia por cima das boas
  const id=iso(new Date())+(auto?'':'-'+pad(new Date().getHours())+pad(new Date().getMinutes()));
  try{await F.copias.salvar(id,JSON.stringify(d),n,!!auto);
    const velhas=(copias||[]).filter(c=>c.id!==id).slice(7);for(const c of velhas){try{await F.copias.apagar(c.id)}catch(e){}}
    if(!auto)toast('Cópia guardada');return true}catch(e){if(!auto)toast('Não foi possível guardar a cópia ('+((e&&e.code)||'erro')+')');return false}}
function drawCopias(){const box=$('#copiasBox');if(!box)return;const F=window.FBX;if(!F||F.papel!=='admin'||!F.copias){box.innerHTML='';return}
  copiasInit();const l=copias;
  box.innerHTML=`<div class="accbox"><h3 style="margin:0 0 4px;font-size:16px">Cópias guardadas no servidor</h3>
    <p class="hint" style="margin:0 0 10px">Uma cópia de tudo é guardada sozinha toda semana, quando um administrador entra. Ficam as 8 mais recentes. Para recuperar algo apagado por engano, use "Restaurar".</p>
    ${l==null?'<div class="muted" style="font-size:14px">Carregando…</div>':l.length?`<div class="acclist">${l.map(c=>`<div class="accrow cprow"><span><b>${br(c.id.slice(0,10))}</b>${c.id.length>10?' '+esc(c.id.slice(11,13)+':'+c.id.slice(13,15)):''}<br><small class="muted">${esc(String(c.n||'?'))} registros · ${c.auto?'automática':'guardada por '+who(c.por)}</small></span>
      ${ui.delAsk==='cop'+c.id?`<span class="confirm"><button class="btn small danger" data-a="coprestok" data-id="${esc(c.id)}">Restaurar esta cópia</button><button class="btn small" data-a="accno">Não</button></span>`:`<span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="btn small" data-a="copbaixar" data-id="${esc(c.id)}">Baixar</button><button class="btn small" data-a="coprest" data-id="${esc(c.id)}">Restaurar</button></span>`}</div>`).join('')}</div>`:'<div class="muted" style="font-size:14px">Nenhuma cópia ainda. A primeira é guardada assim que os dados terminam de carregar.</div>'}
    <div style="margin-top:10px"><button class="btn small" data-a="copagora">Guardar uma cópia agora</button></div></div>`}
Object.assign(PACTS,{
  copagora:async()=>{await guardarCopia(false)},
  copbaixar:async b=>{const c=(copias||[]).find(x=>x.id===b.dataset.id);if(!c)return;await saveFile('designacoes-copia-'+c.id+'.json',new Blob([c.dados],{type:'application/json'}))},
  coprest:b=>{ui.delAsk='cop'+b.dataset.id;drawCopias()},
  coprestok:async b=>{const c=(copias||[]).find(x=>x.id===b.dataset.id);ui.delAsk=null;if(!c)return;
    await guardarCopia(false); // antes, guarda o estado atual (para poder desfazer)
    try{const x=await restaurarDados(JSON.parse(c.dados),true);toast('Cópia de '+br(c.id.slice(0,10))+' restaurada ('+x.n+' registros)')}catch(e){toast('Não foi possível restaurar ('+((e&&e.code)||'erro')+')')}
    rAjustes()}});

/* ----- Erros nos aparelhos: quando algo falha no celular de alguém, fica um aviso que só administradores veem ----- */
let errN=0;const errVistos=new Set();
function regErro(msg,pilha,onde){const F=window.FBX;if(!F||!F.erro||!F.email||errN>=5)return;const k=String(msg||'').slice(0,200);if(!k||errVistos.has(k))return;errVistos.add(k);errN++;
  F.erro({msg:k,pilha:String(pilha||'').slice(0,1900),onde:String(onde||'').slice(0,200),versao:String(F.versao||''),tela:String(location.hash||'#').slice(0,40),aparelho:navigator.userAgent.slice(0,300)}).catch(()=>{})}
window.addEventListener('error',e=>{if(e.filename&&!e.filename.startsWith(location.origin))return;regErro(e.message,e.error&&e.error.stack,(e.filename||'').split('/').pop()+':'+(e.lineno||''))});
window.addEventListener('unhandledrejection',e=>{const r=e.reason||{};if(r&&r.code==='permission-denied')return;regErro(r.message||String(r),r.stack,'promessa')});
function drawErros(){const box=$('#errBox');if(!box)return;const F=window.FBX;if(!F||F.papel!=='admin'||!F.erros){box.innerHTML='';return}
  if(!ui.errSub){ui.errSub=true;F.erros.listar(l=>{ui.erros=l;if(ui.tab==='ajustes')drawErros()},()=>{ui.erros=[]})}
  const l=ui.erros;const disp=u=>/iPhone|iPad/.test(u)?'iPhone/iPad':/Android/.test(u)?'Android':/Windows/.test(u)?'Windows':/Mac/.test(u)?'Mac':'outro';
  box.innerHTML=`<div class="accbox"><h3 style="margin:0 0 4px;font-size:16px">Erros nos aparelhos</h3><p class="hint" style="margin:0 0 8px">Falhas que aconteceram enquanto alguém usava o sistema. Se aparecer algo aqui, envie ao desenvolvedor pelo link do rodapé.</p>
    ${l==null?'<div class="muted" style="font-size:14px">Carregando…</div>':l.length?`<div class="actlist">${l.map(x=>`<div class="actrow"><span class="muted">${tsLabel(x.em)}</span><span><b>${who(x.por)}</b> · ${esc(disp(x.aparelho||''))} · ${esc(x.tela||'')} · v${esc(x.versao||'?')}<br><span style="font-family:ui-monospace,monospace;font-size:12.5px;word-break:break-word">${esc(x.msg)}</span></span></div>`).join('')}</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn small" data-a="errcopiar">Copiar para enviar</button><button class="btn small ghost" data-a="errlimpar">Limpar a lista</button></div>`:'<div class="muted" style="font-size:14px">Nenhum erro registrado.</div>'}</div>`}
Object.assign(PACTS,{
  errcopiar:()=>copyText((ui.erros||[]).map(x=>[tsLabel(x.em),x.por,x.tela,'v'+x.versao,x.onde,x.msg,x.aparelho,(x.pilha||'').split('\n').slice(0,4).join(' | ')].join(' · ')).join('\n')),
  errlimpar:async()=>{for(const x of ui.erros||[]){try{await window.FBX.erros.apagar(x.id)}catch(e){}}toast('Lista limpa')}});

/* ----- Diagnóstico: confere o site publicado (arquivos, versão, banco, PDF e planilhas) ----- */
const ARQS=['config.js','manifest.webmanifest','sw.js','icon-180.png','icon-192.png','icon-512.png','icon-maskable-512.png','404.html',
  'lib/firebase-app-compat.js','lib/firebase-auth-compat.js','lib/firebase-firestore-compat.js','lib/jspdf.umd.min.js','lib/jszip.min.js','lib/xlsx.full.min.js','lib/pdfjs/pdf.min.js','lib/pdfjs/pdf.worker.min.js'];
async function versaoPublicada(){try{const r=await fetch('versao.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return null;return(await r.json()).versao||null}catch(e){return null}}
async function diagnostico(){const out=[];const add=(ok,t,d)=>out.push({ok,t,d});const F=window.FBX;
  const pub=await versaoPublicada();
  if(!pub)add(false,'Versão','Não encontrei o arquivo versao.json no site. Envie todos os arquivos da última versão.');
  else if(pub!==F.versao)add(false,'Versão',`Este aparelho está com a versão ${F.versao}, e a publicada é ${pub}. Recarregue a página.`);
  else add(true,'Versão',`Atualizada (${pub}).`);
  const falta=[];await Promise.all(ARQS.map(async a=>{try{const r=await fetch(a+'?t='+Date.now(),{method:'HEAD',cache:'no-store'});if(!r.ok)falta.push(a)}catch(e){falta.push(a)}}));
  add(!falta.length,'Arquivos do site',falta.length?'Faltam no GitHub: '+falta.join(', ')+'.':`Todos os ${ARQS.length} arquivos estão no lugar.`);
  try{await F.ping();add(true,'Banco de dados','Conectado ao Firebase.')}catch(e){add(false,'Banco de dados','Sem resposta do Firebase ('+((e&&e.code)||'erro')+'). Verifique a internet.')}
  add(loaded.p&&loaded.w&&loaded.c,'Dados carregados',loaded.p&&loaded.w&&loaded.c?`${Object.keys(pubs).length} publicadores e ${Object.keys(weeks).length} semanas.`:'Os dados ainda não terminaram de carregar.');
  add(!!window.jspdf,'Gerar PDF',window.jspdf?'Gerador de PDF carregado.':'O gerador de PDF não carregou (lib/jspdf.umd.min.js).');
  try{await ensurePdfjs();add(true,'Ler apostila em PDF','Leitor de PDF funcionando.')}catch(e){add(false,'Ler apostila em PDF','O leitor de PDF não carregou.')}
  try{await loadScript(XLSX_URL);add(!!window.XLSX,'Planilhas (Excel)','Leitor de planilhas funcionando.')}catch(e){add(false,'Planilhas (Excel)','O leitor de planilhas não carregou.')}
  const sw='serviceWorker' in navigator&&location.protocol==='https:';let swOk=false;if(sw){try{swOk=!!(await navigator.serviceWorker.getRegistration())}catch(e){}}
  add(swOk||!sw,'Aplicativo e uso sem internet',swOk?'Instalável e com cópia no aparelho.':sw?'Ainda não ativado neste aparelho. Recarregue a página uma vez.':'Disponível só no endereço https do site.');
  return out}
function drawDiag(){const box=$('#diagBox');if(!box)return;const F=window.FBX;if(!F||F.papel!=='admin'||!F.ping){box.innerHTML='';return}
  const r=ui.diag;box.innerHTML=`<div class="accbox"><h3 style="margin:0 0 4px;font-size:16px">Conferir o site</h3><p class="hint" style="margin:0 0 10px">Use depois de cada publicação no GitHub: confere se todos os arquivos estão lá, se a versão é a mais nova e se banco, PDF e planilhas funcionam neste aparelho.</p>
    ${r==='rodando'?'<div class="muted" style="font-size:14px">Conferindo…</div>':Array.isArray(r)?`<div class="diaglist">${r.map(x=>`<div class="diagrow ${x.ok?'ok':'falha'}"><span class="diagic" aria-hidden="true">${x.ok?'✓':'!'}</span><span><b>${esc(x.t)}</b><br><small>${esc(x.d)}</small></span></div>`).join('')}</div>`:''}
    <div style="margin-top:10px"><button class="btn small" data-a="diagrodar">${Array.isArray(r)?'Conferir de novo':'Conferir agora'}</button></div></div>`}
Object.assign(PACTS,{diagrodar:async()=>{ui.diag='rodando';drawDiag();try{ui.diag=await diagnostico()}catch(e){ui.diag=[{ok:false,t:'Diagnóstico',d:'Não foi possível concluir ('+e.message+').'}]}drawDiag()}});

/* ----- Aviso de versão nova publicada (site): confere ao abrir e a cada 30 minutos ----- */
async function checarVersaoNova(){const F=window.FBX;if(!F||!F.versao||location.protocol!=='https:')return;const v=await versaoPublicada();
  if(v&&v!==F.versao&&!$('#novaVersao')){document.body.insertAdjacentHTML('beforeend',`<div id="novaVersao" class="novaver" role="status"><span>Há uma versão nova do sistema.</span><button class="btn small primary" data-a="recarregar">Atualizar agora</button></div>`)}}
Object.assign(PACTS,{recarregar:()=>location.reload()});
setTimeout(checarVersaoNova,8000);setInterval(checarVersaoNova,30*60*1000);
