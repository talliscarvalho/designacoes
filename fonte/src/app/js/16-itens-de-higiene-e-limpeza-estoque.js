/* ================= Itens de higiene e limpeza (estoque) ================= */
const brl=v=>v==null||v===''||isNaN(v)?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const numBR=v=>{if(v===''||v==null)return null;let s=String(v).trim().replace(/[R$\s]/g,'');if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const n=Number(s);return isNaN(n)?null:n};
const fmtQ=n=>n==null?'—':Number(n).toLocaleString('pt-BR',{maximumFractionDigits:2});
const UNIDADES=['unidade','frasco','litro','galão','rolo','pacote','fardo','caixa','par'];
const plu=(q,u)=>{u=u||'';if(!u||Math.abs(q)===1||/s$/i.test(u))return u;if(u==='galão')return'galões';return/(l|r|z)$/i.test(u)?u+'es':u+'s'};
const qU=(q,u)=>fmtQ(q)+(u?' '+plu(q,u):'');
const unitSelect=(id,cur)=>`<select id="${id}">${(cur&&!UNIDADES.includes(cur)?[cur]:[]).concat(UNIDADES).map(u=>`<option ${u===(cur||'unidade')?'selected':''}>${esc(u)}</option>`).join('')}</select>`;
function sortedItems(){return Object.entries(stk).map(([id,it])=>Object.assign({id},it)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt'))}
function compraTotal(h){return h.total!=null?h.total:(h.preco!=null&&h.qtd!=null?h.preco*h.qtd:0)}
/* Consumo estimado pelas contagens: entre duas contagens, o que sumiu = (contagem anterior + compras no meio) − contagem atual */
function consumo(it){
  const ev=[...(it.historico||[])].filter(h=>h.tipo==='compra'||h.tipo==='ajuste').sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:(a.tipo==='compra'?-1:1));
  let level=null,first=null,last=null,used=0;
  ev.forEach(h=>{if(h.tipo==='compra'){if(level!=null)level+=(+h.qtd||0)}else{if(level!=null&&first){used+=Math.max(0,level-(+h.qtd||0));last=h.data}else{first=h.data;last=h.data}level=+h.qtd||0}});
  if(!first||last===first)return{ok:false,counts:first?1:0};
  const days=(parse(last)-parse(first))/864e5;if(days<14)return{ok:false,counts:2,curto:true};
  const rate=used/days;if(rate<=0)return{ok:true,porMes:0,prev:null};
  return{ok:true,porMes:rate*30.4,prev:shiftDays(last,Math.floor((+it.qtd||0)/rate))}}
function itStatus(it){if(it.qtd==null)return'info';if(it.qtd<=0)return'zerado';if(it.minimo!=null&&it.qtd<=it.minimo)return'baixo';
  const c=consumo(it);if(c.ok&&c.prev&&c.prev<=shiftDays(iso(new Date()),30))return'breve';return'ok'}
const ITST={info:['Informe o estoque','tag'],zerado:['Em falta','st-err'],baixo:['Repor','st-warn'],breve:['Comprar em breve','st-warn'],ok:['Em estoque','st-ok']};
const REPOR=['zerado','baixo','breve'];
function previsaoTxt(it){const c=consumo(it);if(!c.ok)return c.counts?'Faça outra contagem daqui a algumas semanas para estimar':'Faça contagens periódicas para estimar';
  if(!c.porMes)return'Sem consumo entre as contagens';return`≈ ${qU(Math.round(c.porMes*10)/10,it.unidade)}/mês${c.prev?' · deve durar até '+br(c.prev).slice(3):''}`}
function saveItem(it){const id=it.id;const d=Object.assign({},it);delete d.id;stk[id]=d;queueSave('estoque',id,d)}
function shoppingList(){const its=sortedItems().filter(it=>REPOR.includes(itStatus(it)));
  return{its,text:`*Lista de compras · Limpeza do Salão do Reino*\n${PV.congName()} · ${br(iso(new Date()))}\n\n`+(its.length?its.map(it=>{const u=it.ultimaCompra,c=consumo(it);return`• ${it.nome} — tem ${qU(it.qtd,it.unidade)}${it.minimo!=null?' (mínimo '+fmtQ(it.minimo)+')':''}${c.ok&&c.porMes?' · gasta ≈ '+qU(Math.round(c.porMes*10)/10,it.unidade)+'/mês':''}${u&&u.preco!=null?' · última compra: '+brl(u.preco)+'/'+(it.unidade||'un')+' em '+br(u.data):''}`}).join('\n'):'Nenhum item precisa de reposição.')}}
function itemsView(){
  const its=sortedItems(),hoje=iso(new Date()),ym=hoje.slice(0,7),yy=hoje.slice(0,4);let gm=0,ga=0;
  its.forEach(it=>(it.historico||[]).forEach(h=>{if(h.tipo==='compra'){const t=compraTotal(h);if(h.data.startsWith(ym))gm+=t;if(h.data.startsWith(yy))ga+=t}}));
  const repor=its.filter(it=>REPOR.includes(itStatus(it))).length,semInfo=its.filter(it=>it.qtd==null).length;
  const lastCount=its.map(it=>(it.historico||[]).filter(h=>h.tipo==='ajuste').map(h=>h.data).sort().pop()).filter(Boolean).sort().pop();
  const A=ui.itAct||{};
  const panel=it=>{if(A.id!==it.id)return'';const u=it.ultimaCompra||{};
    if(A.mode==='compra')return`<tr class="itpanel"><td colspan="6"><div class="itform"><b>Registrar compra · ${esc(it.nome)}</b>
      <div class="evgrid"><label class="f">Data<input type="date" id="it-data" value="${hoje}"></label><label class="f">Quantidade (${esc(it.unidade||'unidade')})<input type="text" inputmode="decimal" id="it-qtd" placeholder="Ex.: 6"></label>
      <label class="f">Preço por ${esc(it.unidade||'unidade')}<input type="text" inputmode="decimal" id="it-preco" placeholder="${u.preco!=null?'Última: '+esc(brl(u.preco)):'Ex.: 4,90'}"></label><label class="f">Ou valor total pago<input type="text" inputmode="decimal" id="it-total" placeholder="Ex.: 29,40"></label>
      <label class="f">Onde comprou (opcional)<input type="text" id="it-local" value="${esc(u.local||'')}" placeholder="Ex.: Mercado Central"></label></div>
      <div style="display:flex;gap:8px"><button class="btn primary small" data-a="itsave">Salvar compra</button><button class="btn small" data-a="itcancel">Cancelar</button></div></div></td></tr>`;
    if(A.mode==='contagem')return`<tr class="itpanel"><td colspan="6"><div class="itform"><b>Contagem · ${esc(it.nome)}</b><p class="hint" style="margin:0">Anote quanto tem hoje no depósito. Com as contagens ao longo do tempo, o sistema calcula o consumo por mês.</p>
      <div class="evgrid"><label class="f">Data<input type="date" id="it-data" value="${hoje}"></label><label class="f">Quantidade que tem hoje (${esc(it.unidade||'unidade')})<input type="text" inputmode="decimal" id="it-qtd" value="${it.qtd==null?'':fmtQ(it.qtd)}"></label></div>
      <div style="display:flex;gap:8px"><button class="btn primary small" data-a="itsave">Salvar contagem</button><button class="btn small" data-a="itcancel">Cancelar</button></div></div></td></tr>`;
    if(A.mode==='editar')return`<tr class="itpanel"><td colspan="6"><div class="itform"><b>Editar item</b>
      <div class="evgrid"><label class="f">Nome<input type="text" id="it-nome" value="${esc(it.nome)}"></label><label class="f">Unidade${unitSelect('it-un',it.unidade)}</label>
      <label class="f">Estoque mínimo (avisa ao chegar nele)<input type="text" inputmode="decimal" id="it-min" value="${it.minimo==null?'':fmtQ(it.minimo)}" placeholder="Ex.: 2"></label></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between"><span style="display:flex;gap:8px"><button class="btn primary small" data-a="itsave">Salvar</button><button class="btn small" data-a="itcancel">Cancelar</button></span>
      ${ui.delAsk==='it:'+it.id?`<span class="confirm">Excluir este item e todo o histórico dele? <button class="btn small danger" data-a="itdelok">Excluir</button><button class="btn small" data-a="itdelno">Não</button></span>`:`<button class="btn small ghost danger" data-a="itdel">Excluir item</button>`}</div></div></td></tr>`;
    if(A.mode==='hist'){const hs=[...(it.historico||[])].sort((a,b)=>a.data<b.data?1:-1);return`<tr class="itpanel"><td colspan="6"><div class="itform"><b>Histórico · ${esc(it.nome)}</b>
      ${hs.length?`<div class="tablewrap"><table class="pubs" style="font-size:13px"><thead><tr><th>Data</th><th>Registro</th><th>Qtd.</th><th>Preço</th><th>Total</th><th>Obs.</th></tr></thead><tbody>${hs.slice(0,40).map(h=>`<tr style="cursor:default"><td>${br(h.data)}</td><td>${h.tipo==='compra'?'Compra':h.tipo==='uso'?'Uso':'Contagem'}</td><td>${h.tipo==='uso'?'−':h.tipo==='compra'?'+':''}${fmtQ(h.qtd)}</td><td>${h.tipo==='compra'?brl(h.preco):''}</td><td>${h.tipo==='compra'?brl(compraTotal(h)):''}</td><td class="muted">${esc(h.local||h.obs||'')}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted" style="margin:0">Nenhum registro ainda.</p>'}
      <div><button class="btn small" data-a="itcancel">Fechar</button></div></div></td></tr>`}
    return''};
  const countForm=ui.itCount?`<div class="itform"><b>Conferir estoque</b><p class="hint" style="margin:0">Anote a quantidade de cada item que tem hoje no depósito. Deixe em branco o que não conferiu.</p>
      <label class="f" style="max-width:200px">Data da conferência<input type="date" id="itc-data" value="${hoje}"></label>
      <div class="tablewrap"><table class="pubs" style="font-size:14px"><thead><tr><th>Item</th><th>Registro anterior</th><th>Tem hoje</th></tr></thead><tbody>${its.map(it=>`<tr style="cursor:default"><td><b>${esc(it.nome)}</b></td><td class="muted">${it.qtd==null?'—':esc(qU(it.qtd,it.unidade))}</td><td><span style="display:flex;gap:6px;align-items:center"><input type="text" inputmode="decimal" class="itc" data-id="${esc(it.id)}" style="width:90px"> <span class="muted">${esc(plu(2,it.unidade))}</span></span></td></tr>`).join('')}</tbody></table></div>
      <div style="display:flex;gap:8px"><button class="btn primary small" data-a="itcountsave">Salvar conferência</button><button class="btn small" data-a="itcount">Cancelar</button></div></div>`:'';
  return`<div class="kpis">
      <div class="panel kpi"><span>Itens cadastrados</span><b>${its.length}</b></div>
      <div class="panel kpi ${repor?'warn':''}"><span>Precisam de reposição</span><b>${repor}</b></div>
      <div class="panel kpi"><span>Gasto em ${MESES[+ym.slice(5)-1]}</span><b>${brl(gm)}</b></div>
      <div class="panel kpi"><span>Gasto em ${yy}</span><b>${brl(ga)}</b></div></div>
    ${semInfo?`<div class="drawres short">${semInfo} ite${semInfo>1?'ns ainda não têm':'m ainda não tem'} quantidade registrada. Use <b>Conferir estoque</b> para anotar todos de uma vez.</div>`:''}
    <div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;align-items:center"><span><b>Itens de higiene e limpeza</b>${lastCount?`<div class="hint">Última conferência: ${br(lastCount)}</div>`:''}</span>
        <span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small primary" data-a="itcount">Conferir estoque</button><button class="btn small" data-a="itnew">+ Novo item</button><button class="btn small" data-a="itlist">Lista de compras</button><button class="btn small" data-a="itpdf" id="itpdfBtn">Relatório em PDF</button><button class="btn small ghost danger" data-a="itclear">Limpar histórico</button></span></div>
      ${ui.delAsk==='itclear'?`<div class="drawres short" style="display:flex;flex-direction:column;gap:8px"><b>Limpar todo o histórico dos itens?</b><span>Apaga todas as compras e contagens registradas, a última compra e o gasto do mês e do ano. Os itens, as unidades e os estoques mínimos continuam cadastrados.</span>
        <label class="confirm"><input type="checkbox" id="itclear-qtd" checked> Manter a quantidade atual de cada item como ponto de partida</label>
        <span style="display:flex;gap:8px"><button class="btn small danger" data-a="itclearok">Apagar histórico</button><button class="btn small" data-a="itclearno">Cancelar</button></span></div>`:''}
      ${countForm}
      ${ui.itNew?`<div class="itform"><b>Novo item</b><div class="evgrid"><label class="f">Nome<input type="text" id="itn-nome" placeholder="Ex.: Água sanitária"></label><label class="f">Unidade${unitSelect('itn-un','unidade')}</label><label class="f">Quantidade que tem hoje<input type="text" inputmode="decimal" id="itn-qtd"></label><label class="f">Estoque mínimo<input type="text" inputmode="decimal" id="itn-min"></label></div><div style="display:flex;gap:8px"><button class="btn primary small" data-a="itnewsave">Adicionar</button><button class="btn small" data-a="itnewno">Cancelar</button></div></div>`:''}
      ${ui.itShop?(()=>{const sl=shoppingList();return`<div class="itform"><b>Lista de compras</b><pre style="white-space:pre-wrap;font-family:var(--f-ui);font-size:13.5px;background:var(--surface);border-radius:8px;padding:10px;margin:0">${esc(sl.text)}</pre>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small" data-a="itlistcopy">Copiar</button><a class="btn small wa" href="https://wa.me/?text=${encodeURIComponent(sl.text)}" target="_blank" rel="noopener">Enviar pelo WhatsApp</a><button class="btn small ghost" data-a="itlist">Fechar</button></div></div>`})():''}
      <div class="tablewrap"><table class="pubs ittab"><thead><tr><th>Item</th><th>Estoque</th><th>Mínimo</th><th>Última compra</th><th>Consumo e previsão</th><th></th></tr></thead><tbody>
      ${its.map(it=>{const st=itStatus(it),u=it.ultimaCompra;return`<tr style="cursor:default"><td><b>${esc(it.nome)}</b><div class="muted" style="font-size:12.5px">${esc(it.unidade||'')}</div></td>
        <td data-l="Estoque"><span class="${ITST[st][1]}">${it.qtd==null?ITST[st][0]:esc(qU(it.qtd,it.unidade))}</span>${REPOR.includes(st)?`<div class="${ITST[st][1]}" style="font-size:11.5px">${ITST[st][0]}</div>`:''}</td>
        <td data-l="Mínimo">${it.minimo==null?'<span class="muted">—</span>':fmtQ(it.minimo)}</td>
        <td data-l="Última compra" style="white-space:nowrap">${u?br(u.data)+`<div class="muted" style="font-size:12.5px">${u.preco!=null?brl(u.preco)+'/'+esc(it.unidade||'un')+' · ':''}${u.qtd?fmtQ(u.qtd)+' = '+brl(compraTotal(u)):''}</div>`+(u.local?`<div class="muted" style="font-size:12px">${esc(u.local)}</div>`:''):'<span class="muted">—</span>'}</td>
        <td data-l="Consumo e previsão" style="font-size:13px;max-width:230px">${esc(previsaoTxt(it))}</td>
        <td><div class="itacts"><button class="btn small" data-a="itcompra" data-id="${esc(it.id)}">Compra</button><button class="btn small" data-a="itconta" data-id="${esc(it.id)}">Contagem</button><button class="btn small ghost" data-a="itedit" data-id="${esc(it.id)}">Editar</button><button class="btn small ghost" data-a="ithist" data-id="${esc(it.id)}">Histórico</button></div></td></tr>${panel(it)}`}).join('')||'<tr><td colspan="6" class="muted">Nenhum item cadastrado.</td></tr>'}
      </tbody></table></div>
      <p class="hint" style="margin:0">Registre cada compra (soma ao estoque e guarda preço e data) e faça a conferência do estoque de tempos em tempos, por exemplo uma vez por mês. Comparando as conferências com as compras, o sistema calcula quanto se gasta por mês e até quando o estoque deve durar. O item entra na lista de compras quando chega no mínimo ou quando deve acabar nos próximos 30 dias.</p></div>`}
function itemId(n){return(n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'item')+'-'+Math.random().toString(36).slice(2,5)}
Object.assign(PACTS,{
  itcompra:b=>{ui.itAct={id:b.dataset.id,mode:'compra'};ui.delAsk=null;rLimpeza();const el=$('#it-qtd');if(el)el.focus()},
  itconta:b=>{ui.itAct={id:b.dataset.id,mode:'contagem'};ui.delAsk=null;rLimpeza();const el=$('#it-qtd');if(el)el.focus()},
  itedit:b=>{ui.itAct={id:b.dataset.id,mode:'editar'};ui.delAsk=null;rLimpeza()},
  ithist:b=>{ui.itAct={id:b.dataset.id,mode:'hist'};rLimpeza()},
  itcancel:()=>{ui.itAct=null;ui.delAsk=null;rLimpeza()},
  itsave:()=>{const A=ui.itAct;if(!A)return;const it=Object.assign({id:A.id},stk[A.id]);it.historico=[...(it.historico||[])];
    if(A.mode==='compra'){const q=numBR($('#it-qtd').value);let p=numBR($('#it-preco').value),t=numBR($('#it-total').value);const d=$('#it-data').value||iso(new Date()),loc=$('#it-local').value.trim();
      if(!q||q<=0){toast('Informe a quantidade comprada');return}if(p==null&&t!=null)p=Math.round(t/q*100)/100;if(t==null&&p!=null)t=Math.round(p*q*100)/100;
      it.qtd=(it.qtd||0)+q;it.historico.push({data:d,tipo:'compra',qtd:q,preco:p,total:t,local:loc});
      if(!it.ultimaCompra||d>=it.ultimaCompra.data)it.ultimaCompra={data:d,qtd:q,preco:p,total:t,local:loc};toast('Compra registrada')}
    if(A.mode==='contagem'){const q=numBR($('#it-qtd').value);if(q==null||q<0){toast('Informe a quantidade que tem hoje');return}
      it.qtd=q;it.historico.push({data:$('#it-data').value||iso(new Date()),tipo:'ajuste',qtd:q});toast('Contagem registrada')}
    if(A.mode==='editar'){const nome=$('#it-nome').value.trim();if(!nome){toast('Escreva o nome do item');return}it.nome=nome;it.unidade=$('#it-un').value;it.minimo=numBR($('#it-min').value);toast('Item salvo')}
    it.historico=it.historico.slice(-300);saveItem(it);ui.itAct=null;rLimpeza()},
  itcount:()=>{ui.itCount=!ui.itCount;rLimpeza()},
  itcountsave:()=>{const d=$('#itc-data').value||iso(new Date());let n=0;
    document.querySelectorAll('.itc').forEach(inp=>{const q=numBR(inp.value);if(q==null||q<0)return;const it=Object.assign({id:inp.dataset.id},stk[inp.dataset.id]);
      it.historico=[...(it.historico||[]),{data:d,tipo:'ajuste',qtd:q}].slice(-300);it.qtd=q;saveItem(it);n++});
    if(!n){toast('Preencha a quantidade de pelo menos um item');return}ui.itCount=false;rLimpeza();toast('Conferência salva: '+n+' ite'+(n>1?'ns':'m'))},
  itdel:()=>{ui.delAsk='it:'+ui.itAct.id;rLimpeza()},
  itdelno:()=>{ui.delAsk=null;rLimpeza()},
  itdelok:()=>{const id=ui.itAct.id;delete stk[id];removeDoc('estoque',id);ui.itAct=null;ui.delAsk=null;rLimpeza();toast('Item excluído')},
  itnew:()=>{ui.itNew=true;rLimpeza();const el=$('#itn-nome');if(el)el.focus()},
  itnewno:()=>{ui.itNew=false;rLimpeza()},
  itnewsave:()=>{const nome=$('#itn-nome').value.trim();if(!nome){toast('Escreva o nome do item');return}const q=numBR($('#itn-qtd').value);
    saveItem({id:itemId(nome),nome,unidade:$('#itn-un').value,qtd:q,minimo:numBR($('#itn-min').value),historico:q!=null?[{data:iso(new Date()),tipo:'ajuste',qtd:q}]:[]});ui.itNew=false;rLimpeza();toast(nome+' adicionado')},
  itlist:()=>{ui.itShop=!ui.itShop;rLimpeza()},
  itlistcopy:()=>copyText(shoppingList().text),
  itclear:()=>{ui.delAsk='itclear';ui.itAct=null;rLimpeza()},
  itclearno:()=>{ui.delAsk=null;rLimpeza()},
  itclearok:()=>{const keep=$('#itclear-qtd')&&$('#itclear-qtd').checked;const hoje=iso(new Date());let n=0;
    sortedItems().forEach(it=>{const x=Object.assign({},it);delete x.ultimaCompra;x.historico=keep&&x.qtd!=null?[{data:hoje,tipo:'ajuste',qtd:x.qtd,obs:'Ponto de partida'}]:[];if(!keep)x.qtd=null;saveItem(x);n++});
    ui.delAsk=null;rLimpeza();toast('Histórico apagado de '+n+' itens')},
  itpdf:()=>itemsPdf(),
});
async function itemsPdf(){
  if(!window.jspdf){toast('A biblioteca de PDF não carregou. Verifique a internet e recarregue a página.');return}
  const btn=$('#itpdfBtn');if(btn)btn.disabled=true;
  try{const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'pt',format:cfg.papel==='Carta'?'letter':'a4'});PV.doc=doc;PV.dry=false;
    const PW=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),x=32,W=PW-64;
    PV.text(PV.congName(),x+W/2,50,'bold',19,'#111111',{align:'center'});PV.rect(x,59,W,1.6,'#A3A3A3');
    PV.text('ITENS DE HIGIENE E LIMPEZA  ·  '+br(iso(new Date())),x+W/2,76,'normal',10,'#111111',{align:'center',charSpace:0.5});
    let y=96;const cols=[['ITEM',x+6],['ESTOQUE',x+168],['MÍN.',x+232],['ÚLTIMA COMPRA',x+266],['PREÇO (UN.)',x+336],['CONSUMO/MÊS',x+398]];
    PV.rect(x,y,W,20,'#4F3A82');cols.forEach(([t,xx])=>PV.text(t,xx,y+13.5,'bold',7.2,'#FFFFFF'));PV.text('SITUAÇÃO',x+W-6,y+13.5,'bold',7.2,'#FFFFFF',{align:'right'});y+=20;
    sortedItems().forEach((it,i)=>{const st=itStatus(it),u=it.ultimaCompra,c=consumo(it);if(y>PH-60){doc.addPage();y=50}
      if(i%2)PV.rect(x,y,W,22,'#F7F9F8');const by=y+14.5;
      PV.text(it.nome,x+6,by,'bold',8.8,'#1B1B1B',{maxW:158});
      PV.text(it.qtd==null?'—':qU(it.qtd,it.unidade),x+168,by,'normal',8.8,'#222222',{maxW:62});
      PV.text(it.minimo==null?'—':fmtQ(it.minimo),x+232,by,'normal',8.8,'#222222');
      PV.text(u?br(u.data):'—',x+266,by,'normal',8.8,'#222222');
      PV.text(u&&u.preco!=null?brl(u.preco):'—',x+336,by,'normal',8.8,'#222222');
      PV.text(c.ok&&c.porMes?'≈ '+fmtQ(Math.round(c.porMes*10)/10):'—',x+398,by,'normal',8.8,'#222222');
      const col={info:'#8A8A8A',zerado:'#B42318',baixo:'#B45309',breve:'#B45309',ok:'#2E7D4F'}[st];PV.text(ITST[st][0],x+W-6,by,'bold',8.2,col,{align:'right'});
      y+=22;doc.setDrawColor(225,230,228);doc.setLineWidth(0.5);doc.line(x,y,x+W,y)});
    const sl=shoppingList();y+=22;if(y>PH-100){doc.addPage();y=50}
    PV.text('LISTA DE COMPRAS',x,y,'bold',11,'#4F3A82',{charSpace:0.4});y+=14;
    if(!sl.its.length)PV.text('Nenhum item precisa de reposição.',x,y+4,'normal',9.5,'#444444');
    else sl.its.forEach(it=>{if(y>PH-40){doc.addPage();y=50}const u=it.ultimaCompra;doc.setDrawColor(120,120,120);doc.setLineWidth(0.7);doc.rect(x,y-1,9,9);
      PV.text(it.nome+' — tem '+qU(it.qtd,it.unidade)+(it.minimo!=null?' (mínimo '+fmtQ(it.minimo)+')':'')+(u&&u.preco!=null?' · última compra: '+brl(u.preco)+' em '+br(u.data):''),x+16,y+7,'normal',9.5,'#222222',{maxW:W-16});y+=17});
    await saveFile('Itens de limpeza - '+br(iso(new Date())).replace(/\//g,'-')+'.pdf',doc.output('blob'));
  }catch(e){toast('Erro ao gerar o PDF');console.error(e)}
  if(btn)btn.disabled=false}
