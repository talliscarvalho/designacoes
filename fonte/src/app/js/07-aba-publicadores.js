/* ================= Aba Publicadores ================= */
let draft=null;
const PRIVS=[['anciao','Ancião'],['servo','Servo ministerial'],['pioneiro','Pioneiro']];const PRIVNAME=Object.fromEntries(PRIVS);
function blankPub(){return{nome:'',tel:'',email:'',sexo:'M',cats:[],ativo:true,privilegios:[]}}
function rPubs(){
  if(!draft){draft=ui.pub&&pubs[ui.pub]?clone(pubs[ui.pub]):blankPub()}
  const q=ui.pubFilter.toLowerCase();
  const rows=Object.entries(pubs).filter(([id,p])=>(!q||p.nome.toLowerCase().includes(q))&&(!ui.pubCat||(ui.pubCat.startsWith('priv:')?(p.privilegios||[]).includes(ui.pubCat.slice(5)):ui.pubCat==='semtel'?!p.tel:(p.cats||[]).includes(ui.pubCat)))).sort((a,b)=>a[1].nome.localeCompare(b[1].nome,'pt'));
  const total=Object.keys(pubs).length;
  const today=iso(new Date());
  $('#v-publicadores').innerHTML=`<div class="pubgrid">
   <div>
    <div class="toolbar">
      <label class="f">Buscar<input type="text" id="pq" value="${esc(ui.pubFilter)}" placeholder="Nome"></label>
      <label class="f">Categoria<select id="pc"><option value="">Todos</option><optgroup label="Pode ser designado para">${CATS.map(([k,l])=>`<option value="${k}" ${k===ui.pubCat?'selected':''}>${l}</option>`).join('')}</optgroup><optgroup label="Privilégio">${PRIVS.map(([k,l])=>`<option value="priv:${k}" ${'priv:'+k===ui.pubCat?'selected':''}>${l}</option>`).join('')}</optgroup><optgroup label="Cadastro"><option value="semtel" ${ui.pubCat==='semtel'?'selected':''}>Sem telefone</option></optgroup></select></label>
      <button class="btn primary" data-a="pnew">+ Novo publicador</button>
    </div>
    <div class="panel tablewrap"><table class="pubs ptab"><thead><tr><th>Nome</th><th>WhatsApp</th><th>Pode fazer</th><th>Última parte</th></tr></thead><tbody>
      ${rows.length?rows.map(([id,p])=>{const l=(hist[id]||[]).filter(d=>d<=today).pop();return`<tr data-a="pedit" data-id="${esc(id)}" class="${id===ui.pub?'sel':''}"><td><b>${esc(p.nome)}</b>${p.ativo===false?' <span class="tag">inativo</span>':''}${(a=>a?` <span class="acchip ${a}">${{ativo:'painel ativo',convidado:'convidado',sem:'sem acesso'}[a]}</span>`:'')(acessoDe(id))}<div class="muted" style="font-size:12.5px">${[p.sexo==='F'?'Irmã':'Irmão',...(p.privilegios||[]).map(k=>PRIVNAME[k]||esc(k))].join(' · ')}</div></td><td style="font-variant-numeric:tabular-nums;white-space:nowrap">${p.tel?esc(fmtTel(p.tel)):'<span class="muted">—</span>'}</td><td><div class="tags">${(p.cats||[]).map(c=>`<span class="tag">${esc(CATNAME[c]||c)}</span>`).join('')}</div></td><td data-l="Última parte" style="white-space:nowrap;font-variant-numeric:tabular-nums">${l?br(l):'<span class="muted">—</span>'}</td></tr>`}).join('')
      :`<tr><td colspan="4" class="muted" style="padding:18px">${total?'Ninguém encontrado com esse filtro.':(mode==='db'&&!loaded.p?'Carregando publicadores…':'Nenhum publicador cadastrado. Use o formulário ao lado para adicionar o primeiro.')}</td></tr>`}
    </tbody></table></div>
    <p class="hint">${total} publicadores cadastrados. Clique em um nome para editar.</p>
   </div>
   <form class="panel pubform" id="pform">
     <h2>${ui.pub?'Editar publicador':'Novo publicador'}</h2>${ui.pub?lastMod(pubs[ui.pub]):''}
     <label class="f">Nome<input type="text" id="p-nome" value="${esc(draft.nome)}" required></label>
     <label class="f">WhatsApp (com DDD)<input type="tel" id="p-tel" value="${esc(draft.tel)}" placeholder="(75) 99999-9999"></label>
     <label class="f">E-mail (para entrar no painel)<input type="email" id="p-email" value="${esc(draft.email||'')}" placeholder="nome@gmail.com" autocomplete="off"></label>
     <div class="radios" role="radiogroup" aria-label="Sexo"><label><input type="radio" name="p-sexo" value="M" ${draft.sexo!=='F'?'checked':''}> Irmão</label><label><input type="radio" name="p-sexo" value="F" ${draft.sexo==='F'?'checked':''}> Irmã</label></div>
     <div><div class="f" style="font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:6px">Privilégios</div><div class="checks">${PRIVS.map(([k,l])=>`<label><input type="checkbox" name="p-priv" value="${k}" ${(draft.privilegios||[]).includes(k)?'checked':''}> ${l}</label>`).join('')}</div></div>
     <div><div class="f" style="font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:6px">Pode ser designado para</div>
       <div class="checks">${CATS.map(([k,l])=>`<label><input type="checkbox" name="p-cat" value="${k}" ${(draft.cats||[]).includes(k)?'checked':''}> ${l}</label>`).join('')}</div></div>
     <label class="confirm" style="font-weight:600"><input type="checkbox" id="p-ativo" ${draft.ativo!==false?'checked':''}> Ativo (aparece nas listas)</label>
     <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between">
       <button class="btn primary" type="submit">${ui.pub?'Salvar alterações':'Adicionar'}</button>
       ${ui.pub?(ui.delAsk==='p:'+ui.pub?`<span class="confirm">Excluir? <button type="button" class="btn small danger" data-a="pdelok">Sim</button><button type="button" class="btn small" data-a="pdelno">Não</button></span>`:`<button type="button" class="btn ghost danger" data-a="pdel">Excluir</button>`):''}
     </div>
   </form></div>`;
}
function readDraft(){const f=$('#pform');if(!f)return draft;return{nome:$('#p-nome').value.trim(),tel:$('#p-tel').value.trim(),email:(($('#p-email')||{}).value||'').trim().toLowerCase(),sexo:(f.querySelector('input[name=p-sexo]:checked')||{}).value||'M',cats:[...f.querySelectorAll('input[name=p-cat]:checked')].map(i=>i.value),privilegios:[...f.querySelectorAll('input[name=p-priv]:checked')].map(i=>i.value),ativo:$('#p-ativo').checked}}
const PACTS={
  pnew:()=>{ui.pub=null;draft=blankPub();ui.delAsk=null;rPubs();$('#p-nome').focus()},
  pedit:b=>{ui.pub=b.dataset.id;draft=null;ui.delAsk=null;rPubs()},
  pdel:()=>{draft=readDraft();ui.delAsk='p:'+ui.pub;rPubs()},
  pdelno:()=>{draft=readDraft();ui.delAsk=null;rPubs()},
  pdelok:()=>{const id=ui.pub;delete pubs[id];removeDoc('publicadores',id);ui.pub=null;draft=null;ui.delAsk=null;rPubs();toast('Publicador excluído')},
  pselall:b=>{const m=b.dataset.m;const P=printState();ui[P.key]=new Set(P.all.filter(w=>w.data.startsWith(m)).map(w=>w.data));rPrint()},
  fvis:b=>{const f=fds[ui.fdsSel];if(!f)return;const v=b.dataset.v==='1';if(f.discurso.visitante===v)return;f.discurso.visitante=v;if(v)f.discurso.oradorId='';saveFds(f);rFds()},
  pkind:b=>{ui.printKind=b.dataset.k;ui.printSub='';rPrint()},
  pmode:b=>{cfg.modelo=b.dataset.m;queueSave('config','geral',cfg);rPrint()},
  pdf:()=>makePdf(),
  wacopy:b=>copyText(waMsgs()[+b.dataset.i].msg),
  wasum:()=>copyText(ui.waKind==='fds'?fdsSummary(fds[ui.waFds]):weekSummary(weeks[ui.waWeek])),
  wakind:b=>{ui.waKind=b.dataset.k;rWa()},
  exportjson:()=>exportJson(),
  s89:async b=>{const w=weeks[ui.waWeek];const sp=studentParts(w).find(x=>x.n==b.dataset.n);if(!sp)return;const c=await drawS89(w,sp);
    const box=b.closest('.wacard').querySelector('.s89prev');box.innerHTML=`<img src="${c.toDataURL('image/png')}" alt="Cartão S-89 preenchido da parte ${sp.n}"><div><button class="btn small primary" data-a="s89dl" data-n="${sp.n}">Baixar imagem</button></div>`},
  s89dl:async b=>{const w=weeks[ui.waWeek];const sp=studentParts(w).find(x=>x.n==b.dataset.n);const c=await drawS89(w,sp);
    c.toBlob(bl=>saveFile(('S-89 '+w.data+' parte '+sp.n+' '+tc(pname(sp.pub))).normalize('NFD').replace(/[\u0300-\u036f]/g,'')+'.png',bl),'image/png')},
  s89pdf:()=>s89Pdf(),
};
document.addEventListener('submit',e=>{if(e.target.id!=='pform')return;e.preventDefault();const d=readDraft();if(!d.nome){toast('Escreva o nome');return}
  const id=ui.pub||(d.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)+'-'+Math.random().toString(36).slice(2,6));
  const was=!!ui.pub;pubs[id]=d;queueSave('publicadores',id,d);ui.pub=id;draft=null;rPubs();toast(was?'Alterações salvas':d.nome+' adicionado')});
document.addEventListener('input',e=>{if(e.target.id==='pq'){ui.pubFilter=e.target.value;draft=readDraft();const p=e.target.selectionStart;rPubs();const el=$('#pq');el.focus();el.setSelectionRange(p,p)}});
document.addEventListener('change',e=>{if(e.target.id==='pc'){ui.pubCat=e.target.value;draft=readDraft();rPubs()}});
function fmtTel(t){const d=String(t).replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'');if(d.length===11)return`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;if(d.length===10)return`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;return t}
function waNumber(t){let d=String(t||'').replace(/\D/g,'').replace(/^0+/,'');if(!d)return'';if(d.length<=11)d='55'+d;return d}
