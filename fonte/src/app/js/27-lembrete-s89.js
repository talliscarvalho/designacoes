/* ================= Lembrete do S-89: 3 semanas antes, avisa quem ainda não recebeu a designação de Faça Seu Melhor no Ministério ================= */
const S89_DIAS=21;
const podeEditarS89=()=>!window.FBX||['admin','editor'].includes(window.FBX.papel);
/* participantes de Faça Seu Melhor no Ministério de uma semana: quem faz a parte e o ajudante */
function s89Pendentes(w){const out={pend:[],vagas:0};
  (w.ministerio||[]).forEach((p,i)=>{const t=partTipo(p);if(t==='presidente'||t==='consideracao')return;
    if(!p.pub){out.vagas++;return}
    const quem=[[p.pub,'parte']];if(!isDiscurso(p)&&p.ajudante)quem.push([p.ajudante,'ajudante']);else if(!isDiscurso(p))out.vagas++;
    quem.forEach(([pid,papel])=>{if(!(w.enviados||{})[pid])out.pend.push({pid,papel,n:4+i,tema:temaLabel(p)})})});
  return out}
function s89Avisos(){const hoje=iso(new Date()),lim=shiftDays(hoje,S89_DIAS);const r=[];
  sortedWeeks().forEach(w=>{const d=meetDate(w);if(d<hoje||d>lim||SEM_REUNIAO(evTipo(w.data)))return;
    const x=s89Pendentes(w);if(!x.pend.length&&!x.vagas)return;
    let adiado=0;try{adiado=+localStorage.getItem('vmc-s89-adiar-'+w.data)||0}catch(e){}if(Date.now()<adiado)return;
    r.push({w,d,dias:Math.round((parse(d)-parse(hoje))/864e5),pend:x.pend,vagas:x.vagas})});
  return r}
function lembreteS89(){const box=$('#s89Box');if(!box)return;
  if(!podeEditarS89()||painelOnly()||!['semanas','fimdesemana','imprimir','confirmacoes'].includes(ui.tab)||!loaded.w){box.hidden=true;return}
  const av=s89Avisos();if(!av.length){box.hidden=true;return}
  poeHTML(box,av.map(a=>{const urg=a.dias<=7;const nomes=[...new Set(a.pend.map(p=>tc(pname(p.pid))))];
    const quando=a.dias===0?'hoje':a.dias===1?'amanhã':'em '+a.dias+' dias';
    return`<div class="s89av ${urg?'urg':''}"><div class="s89txt"><b>S-89 · reunião de ${br(a.d)} (${quando})</b>
      <span>${a.pend.length?`${a.pend.length} ${a.pend.length===1?'designação de Faça Seu Melhor no Ministério ainda não foi encaminhada':'designações de Faça Seu Melhor no Ministério ainda não foram encaminhadas'}: ${esc(nomes.join(', '))}.`:''}${a.vagas?` ${a.vagas===1?'Falta 1 designado':'Faltam '+a.vagas+' designados'} nas partes.`:''}</span></div>
      <span class="s89act"><a class="btn small ${urg?'primary':''}" href="#whatsapp" data-a="s89ir" data-w="${esc(a.w.data)}">Encaminhar</a><button class="btn small ghost" data-a="s89adiar" data-w="${esc(a.w.data)}">Lembrar amanhã</button></span></div>`}).join(''));
  box.hidden=false}
Object.assign(PACTS,{
  s89ir:b=>{ui.waKind='meio';ui.waWeek=b.dataset.w},
  s89adiar:b=>{try{localStorage.setItem('vmc-s89-adiar-'+b.dataset.w,String(Date.now()+864e5))}catch(e){}lembreteS89()}});
