/* ================= Equilíbrio das designações ================= */
function equilibrio(de,ate){const c={};const add=(id,k)=>{if(!id||!pubs[id])return;const x=c[id]=c[id]||{meio:0,fds:0,av:0,campo:0,total:0,ult:''};x[k]++;x.total++};
  const last=(id,d)=>{if(c[id]&&d>c[id].ult)c[id].ult=d};
  sortedWeeks().forEach(w=>{const d=meetDate(w);if(d<de||d>ate)return;roles(w).forEach(r=>{add(r.pub,'meio');last(r.pub,d)})});
  sortedFds().forEach(f=>{if(f.data<de||f.data>ate)return;rolesFds(f).forEach(r=>{add(r.pub,'fds');last(r.pub,f.data)})});
  Object.values(avd).forEach(d0=>{const d=avNorm(d0);if(!d.data||d.data<de||d.data>ate)return;avIds(d).forEach(id=>{add(id,'av');last(id,d.data)})});
  Object.values(cmp).forEach(cw=>(cw.saidas||[]).forEach(r=>{const d=cDate(cw.semana,r.dia);if(d<de||d>ate||!r.dir)return;add(r.dir,'campo');last(r.dir,d)}));
  return c}
function rEquilibrio(){const v=$('#v-equilibrio');const M=ui.eqMeses||3;const hoje=iso(new Date());const fut=ui.eqFuturo!==false;const de=shiftMonth(hoje.slice(0,7),-M)+hoje.slice(7),ate=fut?shiftDays(hoje,62):hoje;
  const c=equilibrio(de,ate);const cat=ui.eqCat||'';const K=ui.eqTipo||'total';
  let ids=Object.keys(pubs).filter(id=>pubs[id].ativo!==false&&(!cat||(cat==='F'||cat==='M'?pubs[id].sexo===cat:(pubs[id].cats||[]).includes(cat))));
  ids=ids.filter(id=>(pubs[id].cats||[]).length||c[id]);
  const val=id=>(c[id]||{})[K]||0;ids.sort((a,b)=>(val(b)-val(a))||pname(a).localeCompare(pname(b),'pt'));
  const vals=ids.map(val).sort((a,b)=>a-b);const max=Math.max(1,...vals);
  const media=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
  const muito=id=>val(id)>=Math.max(3,Math.ceil(media*2)),nada=id=>val(id)===0;
  const nM=ids.filter(muito).length,nZ=ids.filter(nada).length;
  v.innerHTML=`<div style="display:flex;flex-direction:column;gap:14px;max-width:900px">
    <div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <div><h2 style="margin:0">Equilíbrio das designações</h2><p class="hint" style="margin:4px 0 0">Quantas partes cada um teve no período, somando meio de semana, fim de semana, A/V e indicadores e saídas de campo dirigidas. Ajuda a não sobrecarregar uns e esquecer outros.</p></div>
      <div class="eqf"><label class="f">Período<select id="eqmes">${[1,2,3,6,12].map(m=>`<option value="${m}" ${m===M?'selected':''}>Últimos ${m} ${m===1?'mês':'meses'}</option>`).join('')}</select></label>
        <label class="f">Contar<select id="eqtipo">${[['total','Todas as partes'],['meio','Meio de semana'],['fds','Fim de semana'],['av','A/V e indicadores'],['campo','Saídas de campo']].map(([k,l])=>`<option value="${k}" ${k===K?'selected':''}>${l}</option>`).join('')}</select></label>
        <label class="f">Quem<select id="eqcat"><option value="">Todos com alguma categoria</option><option value="M" ${cat==='M'?'selected':''}>Só irmãos</option><option value="F" ${cat==='F'?'selected':''}>Só irmãs</option><optgroup label="Pode ser designado para">${CATS.map(([k,l])=>`<option value="${k}" ${k===cat?'selected':''}>${l}</option>`).join('')}</optgroup></select></label>
        <label class="eqfut"><input type="checkbox" id="eqfut" ${fut?'checked':''}> Incluir os próximos 2 meses já designados</label></div>
      <div class="eqres">${nZ?`<span class="nao"><b>${nZ}</b> sem nenhuma parte</span>`:''}${nM?`<span class="mto"><b>${nM}</b> com o dobro da média ou mais</span>`:''}<span>Média: <b>${media.toFixed(1).replace('.',',')}</b> parte${media>0&&media<2?'':'s'} por pessoa</span><span class="muted">${br(de)} a ${br(ate)}</span></div>
    </div>
    <div class="panel tablewrap"><table class="pubs eqtab"><thead><tr><th>Nome</th><th>Partes</th><th class="eqnum">Meio</th><th class="eqnum">Fim de sem.</th><th class="eqnum">A/V</th><th class="eqnum">Campo</th><th>Última</th></tr></thead><tbody>
      ${ids.map(id=>{const x=c[id]||{meio:0,fds:0,av:0,campo:0,total:0,ult:''};return`<tr class="${muito(id)?'mto':nada(id)?'nao':''}"><td><b>${esc(tc(pname(id)))}</b></td><td><span class="eqbar"><i style="width:${Math.round(100*val(id)/max)}%"></i></span><b>${val(id)}</b></td><td class="eqnum" data-l="Meio">${x.meio}</td><td class="eqnum" data-l="Fim de sem.">${x.fds}</td><td class="eqnum" data-l="A/V">${x.av}</td><td class="eqnum" data-l="Campo">${x.campo}</td><td data-l="Última">${x.ult?br(x.ult).slice(0,5):'<span class="muted">—</span>'}</td></tr>`}).join('')||'<tr><td colspan="7" class="muted">Ninguém neste filtro.</td></tr>'}
    </tbody></table></div></div>`}
document.addEventListener('change',e=>{const t=e.target;if(t.id==='eqmes'){ui.eqMeses=+t.value;rEquilibrio()}if(t.id==='eqtipo'){ui.eqTipo=t.value;rEquilibrio()}if(t.id==='eqcat'){ui.eqCat=t.value;rEquilibrio()}if(t.id==='eqfut'){ui.eqFuturo=t.checked;rEquilibrio()}});
