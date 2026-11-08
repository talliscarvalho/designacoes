/* ================= Sorteio de varões (meio de semana, menos "Faça Seu Melhor no Ministério") ================= */
/* Regras:
   - só entra quem é irmão, está ativo e tem a categoria da parte marcada em Publicadores;
   - ninguém faz duas partes na mesma reunião;
   - pode ter parte em semanas seguidas (rotatividade maior), mas no máximo VAR_SEGUIDAS semanas; depois descansa uma
     (a oração, por ser curta, não conta para o descanso);
   - em cada parte vai primeiro quem está há mais tempo sem fazer aquela parte; no empate, quem teve menos partes
     nas últimas 8 semanas e quem está há mais tempo sem nenhuma parte. */
const VAR_SEGUIDAS=3;
const VAR_SLOTS=w=>{const tp=evTipo(w.data);if(SEM_REUNIAO(tp))return[];
  const s=[['presidente','presidente'],['tesouros.pub','tesouros'],['joias.pub','joias']];
  w.vida.forEach((p,i)=>s.push(['vida.'+i+'.pub','vida']));
  if(tp!=='visita')s.push(['estudo.dirigente','dirigente'],['estudo.leitor','leitor']);
  s.push(['leitura.pub','leitura'],['oracaoInicial','oracao'],['oracaoFinal','oracao']);return s};
const getF=(w,f)=>f.split('.').reduce((o,k)=>o==null?o:o[k],w)||'';
const setF=(w,f,v)=>{const ks=f.split('.');let o=w;ks.slice(0,-1).forEach(k=>o=o[k]);o[ks[ks.length-1]]=v};
const roleKey=f=>f.replace(/\.\d+\./,'.').replace(/^oracao(Inicial|Final)$/,'oracao');
function brotherPool(cat){return Object.entries(pubs).filter(([id,p])=>p&&p.ativo!==false&&p.sexo!=='F'&&(p.cats||[]).includes(cat)).map(([id])=>id)}
/* histórico: em quais semanas cada um teve parte (qualquer parte, inclusive no ministério) e quando fez cada tipo de parte */
function varHist(skip){const any={},por={};
  sortedWeeks().forEach(w=>{if(w.data===skip)return;roles(w).forEach(r=>{if(!/^oracao/.test(r.field))(any[r.pub]=any[r.pub]||new Set()).add(w.data);
    const k=roleKey(r.field);const m=por[r.pub]=por[r.pub]||{};if(!m[k]||m[k]<w.data)m[k]=w.data})});
  return{any,por}}
/* quantas semanas seguidas (com reunião) a pessoa teria parte, contando esta */
function seguidas(pid,date,H){const ws=sortedWeeks().filter(w=>!SEM_REUNIAO(evTipo(w.data))).map(w=>w.data);const i=ws.indexOf(date);if(i<0)return 1;
  const tem=d=>H.any[pid]&&H.any[pid].has(d);let n=1;for(let j=i-1;j>=0&&tem(ws[j]);j--)n++;for(let j=i+1;j<ws.length&&tem(ws[j]);j++)n++;return n}
function drawBrothers(w){
  const slots=VAR_SLOTS(w);if(!slots.length)return{n:0,empty:[],rest:[]};
  const H=varHist(w.data);const lim8=shiftDays(w.data,-56);
  const usados=new Set(roles(w).map(r=>r.pub));
  let n=0;const empty=[],rest=new Set();
  slots.forEach(([f,cat])=>{if(getF(w,f))return;
    const k=roleKey(f);
    const cand=brotherPool(cat).filter(id=>!usados.has(id));
    /* a oração é curta: o descanso não se aplica a ela */
    const livres=cat==='oracao'?cand:cand.filter(id=>{const ok=seguidas(id,w.data,H)<=VAR_SEGUIDAS;if(!ok)rest.add(id);return ok});
    const L=livres;
    if(!L.length){empty.push(CATNAME[cat]||cat);return}
    const score=id=>{const ult=(H.por[id]||{})[k]||'0000-00-00';const rec=[...(H.any[id]||[])].filter(d=>d>=lim8&&d<w.data).length;const ultAny=[...(H.any[id]||[])].filter(d=>d<w.data).sort().pop()||'0000-00-00';return[ult,rec,ultAny,Math.random()]};
    const cmp=(a,b)=>{const A=score(a),B=score(b);for(let i=0;i<4;i++){if(A[i]<B[i])return-1;if(A[i]>B[i])return 1}return 0};
    const id=L.sort(cmp)[0];
    setF(w,f,id);usados.add(id);if(cat!=='oracao')(H.any[id]=H.any[id]||new Set()).add(w.data);n++});
  return{n,empty,rest:[...rest].filter(id=>!roles(w).some(r=>r.pub===id))}}
function drawBrothersMsg(r,label){
  if(!r.n&&!r.empty.length)return'As partes dos varões já estavam preenchidas'+(label?' em '+label:'')+'.';
  let t=r.n+' parte'+(r.n===1?'':'s')+' preenchida'+(r.n===1?'':'s')+(label?' em '+label:'')+'.';
  if(r.empty.length){const u=[...new Set(r.empty)];t+=' Ficou vaga em: '+u.join(', ')+' — ninguém livre com essa categoria (confira as categorias em Publicadores).'}
  if(r.rest.length)t+=' Descansando por ter tido parte em '+VAR_SEGUIDAS+' semanas seguidas: '+r.rest.slice(0,6).map(id=>tc(shortName(pname(id)))).join(', ')+(r.rest.length>6?' e outros':'')+'.';
  return t}
