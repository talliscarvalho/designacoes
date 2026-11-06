/* ================= Armazenamento ================= */
const LS='vmc-designacoes-v1';
function lsRead(){try{return JSON.parse(localStorage.getItem(LS)||'null')}catch(e){return null}}
function lsWrite(){try{localStorage.setItem(LS,JSON.stringify({publicadores:pubs,semanas:weeks,fimdesemana:fds,eventos:evs,limpezaGrupos:lgr,limpeza:lmp,estoque:stk,av:avd,campo:cmp,config:cfg}))}catch(e){}}
const pending={},timers={},busy={};
function queueSave(coll,id,data){const k=coll+'/'+id;pending[k]={coll,id,data:clone(data)};clearTimeout(timers[k]);setStatus('Salvando…','saving');timers[k]=setTimeout(()=>flush(k),650)}
async function flush(k){if(busy[k]){timers[k]=setTimeout(()=>flush(k),300);return}const p=pending[k];if(!p)return;delete pending[k];busy[k]=true;
  if(mode==='db'&&window.FBX&&!navigator.onLine){store.set(p.coll,p.id,p.data).catch(()=>{});busy[k]=false;setStatus('Sem internet: salvo neste aparelho, será enviado quando a conexão voltar','saving');return}
  try{await store.set(p.coll,p.id,p.data);if(!Object.keys(pending).length)setStatus(mode==='db'?'Tudo salvo':'Salvo neste navegador')}
  catch(e){setStatus('Não foi possível salvar: '+(e&&(e.code==='invalid_argument'||e.code==='permission-denied')?'sem permissão de edição':(e&&e.message)||'erro'),'error')}
  finally{busy[k]=false}}
async function removeDoc(coll,id){try{await store.del(coll,id);setStatus(mode==='db'?'Tudo salvo':'Salvo neste navegador')}catch(e){setStatus('Não foi possível excluir'+(e&&e.code==='permission-denied'?': sem permissão de edição':''),'error')}}
const isLocalPending=(coll,id)=>!!(pending[coll+'/'+id]||busy[coll+'/'+id]);

async function init(){
  let db=null;
  try{if(window.claude&&window.claude.use){[db,dl]=await Promise.all([window.claude.use('db'),window.claude.use('downloads')])}}catch(e){}
  /* versão hospedada (GitHub Pages + Firebase): espera o login e usa o Firestore */
  if(!db&&window.FBX){setStatus('Aguardando login…');try{db=await window.FBX.ready()}catch(e){showBanner('Não foi possível conectar ao banco de dados ('+((e&&e.code)||'erro')+'). Recarregue a página.');setStatus('Sem conexão','error');return}
    if(window.FBX.papel==='leitor')showBanner('Você tem acesso só para visualizar. Alterações feitas aqui não são salvas.');
    contaInit();acessoInit();copiasInit();pedidosInit();
}
  rodape();
  /* aqui no Claude é só a versão de testes: os dados oficiais ficam no site */
  if(db&&!window.FBX){const tb=$('#testbar');tb.innerHTML=`<b>Versão de testes.</b> Os dados oficiais ficam no site <a href="${SITE_OFICIAL}" target="_blank" rel="noopener noreferrer">${SITE_OFICIAL.replace(/^https:\/\//,'').replace(/\/$/,'')}</a>. O que for alterado aqui não aparece lá.`;tb.hidden=false}
  if(db){mode='db';
    store={set:(c,id,d)=>db.collection(c).doc(id).set(d),del:(c,id)=>db.collection(c).doc(id).delete()};
    /* versão hospedada: cada gravação leva quem alterou e quando (conferido pelas regras) e entra no registro de atividade */
    if(window.FBX){const F=window.FBX;
      store={set:async(c,id,d)=>{await db.collection(c).doc(id).set(Object.assign({},d,{_por:F.email,_nome:F.nome||'',_em:F.ts()}));if(c!=='quadro')F.log('alterou',c,id)},
             del:async(c,id)=>{await db.collection(c).doc(id).delete();F.log('excluiu',c,id)}};
      F.onBk=()=>bkCheck()}
    const tm=setTimeout(()=>{if(!(loaded.p&&loaded.w))showBanner('Os dados ainda não carregaram. Verifique a conexão; a página continua tentando.')},10000);
    const done=()=>{if(loaded.p&&loaded.w&&loaded.c){clearTimeout(tm);hideBanner();setStatus('Tudo salvo')}};
    const err=e=>{clearTimeout(tm);showBanner('A conexão com os dados foi interrompida ('+(e.code||'erro')+'). Recarregue a página.')};
    const PO=painelOnly();
    /* no site, pede também o aviso de quando o servidor confirma a cópia do aparelho (senão o "carregando" nunca termina) */
    const OPT=window.FBX?[{includeMetadataChanges:true}]:[];
    if(window.FBX){
      db.doc('quadro/nomes').onSnapshot(...OPT,s=>{const m=limpa((s.exists&&s.data().nomes)||{});nomesRemote=m;if(PO){pubs={};Object.entries(m).forEach(([id,n])=>pubs[id]={nome:n});loaded.p=true;done()}changed()},err);
      const rq=PO?db.collection('respostas').where('pub','==',window.FBX.pubId||'-'):db.collection('respostas');
      rq.onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>n[d.id]=sane(d.data()));resp=n;changed()},()=>{});
    }
    if(!PO)db.collection('publicadores').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('publicadores',d.id)&&pubs[d.id]?pubs[d.id]:sane(d.data())});pubs=n;if(!s.metadata.fromCache||!navigator.onLine)loaded.p=true;done();changed()},err);
    db.collection('semanas').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('semanas',d.id)&&weeks[d.id]?weeks[d.id]:norm(sane(d.data()))});weeks=n;if(!s.metadata.fromCache||!navigator.onLine)loaded.w=true;done();changed()},err);
    db.collection('fimdesemana').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('fimdesemana',d.id)&&fds[d.id]?fds[d.id]:normF(sane(d.data()))});fds=n;if(!s.metadata.fromCache||!navigator.onLine)loaded.f=true;changed()},err);
    db.collection('limpezaGrupos').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('limpezaGrupos',d.id)&&lgr[d.id]?lgr[d.id]:sane(d.data())});lgr=n;changed()},err);
    db.collection('campo').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('campo',d.id)&&cmp[d.id]?cmp[d.id]:sane(d.data())});cmp=n;changed()},err);
    db.collection('av').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('av',d.id)&&avd[d.id]?avd[d.id]:sane(d.data())});avd=n;changed()},err);
    if(!PO)db.collection('estoque').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('estoque',d.id)&&stk[d.id]?stk[d.id]:sane(d.data())});stk=n;changed()},err);
    db.collection('limpeza').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('limpeza',d.id)&&lmp[d.id]?lmp[d.id]:sane(d.data())});lmp=n;changed()},err);
    db.collection('eventos').onSnapshot(...OPT,s=>{const n={};s.docs.filter(d=>okId(d.id)).forEach(d=>{n[d.id]=isLocalPending('eventos',d.id)&&evs[d.id]?evs[d.id]:sane(d.data())});evs=n;if(!s.metadata.fromCache||!navigator.onLine)loaded.e=true;changed()},err);
    db.doc('config/geral').onSnapshot(...OPT,s=>{if(!isLocalPending('config','geral'))cfg=Object.assign({},DEF_CFG,s.exists?sane(s.data()):{});if(!s.metadata.fromCache||!navigator.onLine)loaded.c=true;done();changed()},err);
  }else{mode='local';
    const d=limpa(lsRead());if(d){pubs=d.publicadores||{};weeks={};Object.entries(d.semanas||{}).forEach(([k,v])=>weeks[k]=norm(v));cfg=Object.assign({},DEF_CFG,d.config||{});fds={};Object.entries(d.fimdesemana||{}).forEach(([k,v])=>fds[k]=normF(v));evs=d.eventos||{};lgr=d.limpezaGrupos||{};lmp=d.limpeza||{};stk=d.estoque||{};avd=d.av||{};cmp=d.campo||{}}
    store={set:async(c,id,data)=>{if(c==='publicadores')pubs[id]=data;else if(c==='semanas')weeks[id]=data;else if(c==='fimdesemana')fds[id]=data;else if(c==='eventos')evs[id]=data;else if(c==='limpezaGrupos')lgr[id]=data;else if(c==='limpeza')lmp[id]=data;else if(c==='estoque')stk[id]=data;else if(c==='av')avd[id]=data;else if(c==='campo')cmp[id]=data;else cfg=data;lsWrite()},
           del:async(c,id)=>{if(c==='publicadores')delete pubs[id];else if(c==='semanas')delete weeks[id];else if(c==='fimdesemana')delete fds[id];else if(c==='eventos')delete evs[id];else if(c==='limpezaGrupos')delete lgr[id];else if(c==='limpeza')delete lmp[id];else if(c==='estoque')delete stk[id];else if(c==='av')delete avd[id];else if(c==='campo')delete cmp[id];lsWrite()}};
    loaded={p:true,w:true,c:true,f:true,e:true};setStatus('Salvo neste navegador');
    showBanner('Os dados estão salvos só neste aparelho. Faça uma cópia de segurança em Ajustes de vez em quando.');
    changed();
  }
}
/* sem internet: avisa e segue com o que está salvo no aparelho */
window.addEventListener('offline',()=>{if(mode==='db'&&window.FBX)setStatus('Sem internet: as alterações serão enviadas quando a conexão voltar','saving')});
window.addEventListener('online',()=>{if(mode==='db'&&window.FBX)setStatus(Object.keys(pending).length?'Salvando…':'Tudo salvo')});
function showBanner(t){const b=$('#banner');b.textContent=t;b.hidden=false}
function hideBanner(){$('#banner').hidden=true}
