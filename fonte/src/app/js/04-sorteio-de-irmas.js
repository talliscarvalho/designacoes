/* ================= Sorteio de irmãs (Faça Seu Melhor no Ministério) ================= */
const meses=()=>Math.max(0,+(cfg.intervaloMeses??2)||0);
function addMonths(s,m){const d=parse(s);const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+m);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return iso(d)}
function minHist(skip){const h={};Object.values(weeks).forEach(w=>{if(w.data===skip)return;w.ministerio.forEach(p=>{if(isDiscurso(p))return;[p.pub,p.ajudante].forEach(id=>{if(id)(h[id]=h[id]||[]).push(w.data)})})});return h}
function minConflicts(pid,date,h){if(!pid)return[];const m=meses();if(!m)return[];const lo=addMonths(date,-m),hi=addMonths(date,m);return(h[pid]||[]).filter(d=>d>lo&&d<hi).sort()}
function sisterPool(){return Object.entries(pubs).filter(([id,p])=>p.ativo!==false&&p.sexo==='F'&&(p.cats||[]).includes('ministerio')).map(([id])=>id)}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function availableSisters(w){const h=minHist(w.data);const used=new Set(roles(w).map(r=>r.pub));return sisterPool().filter(id=>!used.has(id)&&!minConflicts(id,w.data,h).length)}
/* Preenche as vagas de estudante/ajudante (não discursos). redo=true troca também as irmãs já escolhidas. */
function drawSisters(w,redo){
  const h=minHist(w.data);const slots=[];
  w.ministerio.forEach((p,i)=>{if(isDiscurso(p))return;['pub','ajudante'].forEach(k=>{const cur=p[k];const isF=cur&&pubs[cur]&&pubs[cur].sexo==='F';if(!cur||(redo&&isF)){p[k]='';slots.push([i,k])}})});
  const used=new Set(roles(w).map(r=>r.pub));
  const pool=sisterPool().filter(id=>!used.has(id));
  const ok=shuffle(pool.filter(id=>!minConflicts(id,w.data,h).length));
  const lastMin=id=>{const a=(h[id]||[]).filter(d=>d<w.data);return a.length?a[a.length-1]:'0000'};
  const backup=shuffle(pool.filter(id=>!ok.includes(id))).sort((a,b)=>lastMin(a)<lastMin(b)?-1:lastMin(a)>lastMin(b)?1:0);
  let n=0,short=[],empty=0;
  slots.forEach(([i,k])=>{let id=ok.shift();if(!id){id=backup.shift();if(id)short.push(id)}if(id){w.ministerio[i][k]=id;n++}else empty++});
  return{n,short,empty}}
function drawMsg(r,label){
  if(!r.n&&!r.empty)return'Todas as vagas já estavam preenchidas'+(label?' em '+label:'')+'.';
  let t=r.n+' irmã'+(r.n===1?'':'s')+' sorteada'+(r.n===1?'':'s')+(label?' em '+label:'')+'.';
  if(r.short.length)t+=' Faltaram irmãs livres: '+r.short.map(id=>tc(pname(id))).join(', ')+(r.short.length>1?' foram escolhidas por estarem':' foi escolhida por estar')+' há mais tempo sem parte, mesmo dentro de '+meses()+' meses.';
  if(r.empty)t+=' '+r.empty+' vaga'+(r.empty>1?'s ficaram':' ficou')+' vazia'+(r.empty>1?'s':'')+': não há irmãs suficientes cadastradas.';
  return t}
let lastDraw=null,lastDrawV=null;

