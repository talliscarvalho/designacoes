/* ================= Publicadores: importar e exportar listas ================= */
/* Aceita Excel (.xlsx/.xls/.csv), Word (.docx), PDF, RTF ou texto. Cada linha: nome, telefone e qualificações
   (ancião, servo ministerial, pioneiro), em qualquer ordem: "Fulano (ancião; pioneiro) +55 75 9999-9999". */
const XLSX_URL='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const JSZIP_URL='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
const foldTxt=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
const telDig=t=>{let d=String(t||'').replace(/\D/g,'');if(d.length===10||d.length===11)d='55'+d;return d};
const telFim=t=>String(t||'').replace(/\D/g,'').slice(-8);
function fmtTelBR(d){d=telDig(d);if(!d)return'';const m=/^55(\d{2})(\d{4,5})(\d{4})$/.exec(d);return m?`(${m[1]}) ${m[2]}-${m[3]}`:'+'+d}
/* nomes femininos que não terminam em "a" e masculinos que terminam (ajuste fino do palpite de irmão/irmã) */
const NOME_F=new Set(['isa','raquel','ester','rute','miriam','lilian','floranice','evelyn','rallyne','rafaelly','ketely','nikelle','idalecia','marismar','yasmin','gilmara','raline','luane','rosimeire','meire','michele','michelle','reijane','rejane','eunice','cleide','stephenie','tayane','ivone','iriene','marlene','milca','raimunda','vanusa','neve','neves','beatriz','isabel','carmem','ruth','ingrid','alice','aline','jaqueline','denise','elisa','elaine','irene','ines','lourdes','mercedes','nair','noemi','priscila','rosangela','simone','solange','suely','vitoria','tereza','terezinha','teresa']);
const NOME_M=new Set(['luca','lucca','joshua','elias','jonas','matias','tobias','isaias','jeremias','zacarias','nicolas','barnabe','jona','andrea','sasha']);
function palpiteSexo(nome,priv){if((priv||[]).some(p=>p==='anciao'||p==='servo'))return'M';const f=foldTxt(nome).split(' ')[0]||'';
  if(NOME_F.has(f))return'F';if(NOME_M.has(f))return'M';return /a$/.test(f)?'F':'M'}
function lerQualif(t){const f=foldTxt(t);const p=[];if(/\bancia|\banciao|\banciaos/.test(f))p.push('anciao');if(/\bservo|\bs\.?\s?m\b/.test(f))p.push('servo');if(/pioneir/.test(f))p.push('pioneiro');return p}
/* uma linha de texto solta → {nome, tel, priv} */
function linhaPub(raw){let s=String(raw||'').replace(/ /g,' ').trim();if(!s)return null;let priv=[];
  s=s.replace(/\(([^)]*)\)/g,(m,x)=>{const q=lerQualif(x);if(q.length){priv=priv.concat(q);return' '}return m});
  let tel='';s=s.replace(/(\+?\(?\d[\d\s().\-]{7,}\d)/,m=>{const d=telDig(m);if(d.length>=10){tel=d;return' '}return m});
  const resto=lerQualif(s);if(resto.length){priv=priv.concat(resto);s=s.replace(/\b(anci[aã]o|anci[aã]os|servo(?:\s+ministerial)?|pioneir[oa](?:\s+regular|\s+auxiliar)?)\b/gi,' ')}
  const nome=s.replace(/[;|,\-–—:]+/g,' ').replace(/\s+/g,' ').trim();
  if(!nome||nome.length<2||/^\d/.test(nome))return null;
  if(/^(nome|publicador(es)?|lista|congrega)/i.test(nome)&&!tel)return null;
  return{nome:tc(nome),tel,priv:[...new Set(priv)]}}
/* linhas de uma planilha: usa o cabeçalho se houver colunas reconhecíveis */
function linhasPlanilha(rows){rows=rows.map(r=>r.map(c=>String(c??'').trim())).filter(r=>r.some(Boolean));if(!rows.length)return[];
  const H=rows[0].map(foldTxt);const col=re=>H.findIndex(h=>re.test(h));
  const cN=col(/^nome|publicador/),cT=col(/telefone|whats|celular|fone|contato|numero/),cQ=col(/qualifica|privil|cargo|funcao|designa/);
  if(cN>=0){return rows.slice(1).map(r=>{const nome=r[cN]||'';if(!nome)return null;const x=linhaPub(nome)||{nome:tc(nome),tel:'',priv:[]};
    if(cT>=0&&r[cT])x.tel=telDig(r[cT])||x.tel;if(cQ>=0&&r[cQ])x.priv=[...new Set(x.priv.concat(lerQualif(r[cQ])))];return x}).filter(Boolean)}
  return rows.map(r=>linhaPub(r.filter(Boolean).join(' '))).filter(Boolean)}
async function lerListaArquivo(f){const buf=new Uint8Array(await f.arrayBuffer());const name=(f.name||'').toLowerCase();
  const head=new TextDecoder('latin1').decode(buf.slice(0,8));const zip=buf[0]===0x50&&buf[1]===0x4B,ole=buf[0]===0xD0&&buf[1]===0xCF;
  const planilha=async()=>{await loadScript(XLSX_URL);const wb=window.XLSX.read(buf,{type:'array'});let out=[];
    wb.SheetNames.forEach(n=>{out=out.concat(linhasPlanilha(window.XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:false,defval:''})))});return out};
  if(/\.csv$/.test(name)){const t=new TextDecoder('utf-8').decode(buf);const l0=t.split('\n')[0];const sep=(l0.match(/;/g)||[]).length>(l0.match(/,/g)||[]).length?';':(l0.includes('\t')?'\t':',');return linhasPlanilha(t.split(/\r?\n/).map(l=>l.split(sep)))}
  if(ole){if(/\.doc$/.test(name))throw new Error('Arquivos .doc (Word antigo) não podem ser lidos. No Word, use "Salvar como" › Documento do Word (.docx) e envie de novo.');return planilha()}
  if(zip){await loadScript(JSZIP_URL);const z=await window.JSZip.loadAsync(buf);const x=z.file('word/document.xml');
    if(!x){if(z.file('xl/workbook.xml')||z.file('content.xml'))return planilha();throw new Error('Não reconheci este arquivo. Envie uma planilha do Excel, um documento do Word (.docx), PDF ou texto.')}
    const xml=await x.async('string');const doc=new DOMParser().parseFromString(xml,'application/xml');const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    const rows=[];[...doc.getElementsByTagNameNS(W,'tbl')].forEach(t=>[...t.getElementsByTagNameNS(W,'tr')].forEach(tr=>rows.push([...tr.getElementsByTagNameNS(W,'tc')].map(c=>[...c.getElementsByTagNameNS(W,'t')].map(n=>n.textContent).join('')))));
    if(rows.length)return linhasPlanilha(rows);
    return[...doc.getElementsByTagNameNS(W,'p')].map(p=>[...p.getElementsByTagNameNS(W,'t')].map(n=>n.textContent).join('')).map(linhaPub).filter(Boolean)}
  if(head.includes('%PDF')||/\.(pdf|rtf)$/.test(name)){const t=await fileToText(f);return t.split(/\n/).map(linhaPub).filter(Boolean)}
  return new TextDecoder('utf-8').decode(buf).split(/\r?\n/).map(linhaPub).filter(Boolean)}
/* compara cada linha com o cadastro: mesmo nome; ou primeiro e último nome; ou mesmo telefone com o mesmo primeiro nome */
function casarPub(x,usados){const fn=foldTxt(x.nome),tk=fn.split(' ');const L=Object.entries(pubs).filter(([id])=>!usados.has(id));
  let c=L.filter(([,p])=>foldTxt(p.nome)===fn);
  if(!c.length&&tk.length>1)c=L.filter(([,p])=>{const t=foldTxt(p.nome).split(' ');return t.length>1&&t[0]===tk[0]&&t[t.length-1]===tk[tk.length-1]});
  if(!c.length&&x.tel)c=L.filter(([,p])=>p.tel&&telFim(p.tel)===telFim(x.tel)&&foldTxt(p.nome).split(' ')[0]===tk[0]);
  return c.length===1?c[0][0]:null}
function planoImport(lista){const usados=new Set();const linhas=lista.map(x=>{const id=casarPub(x,usados);if(id)usados.add(id);const p=id?pubs[id]:null;const mud=[];
    if(p){if(x.nome&&x.nome!==p.nome&&foldTxt(x.nome)!==foldTxt(p.nome))mud.push('nome');else if(x.nome&&x.nome!==p.nome)mud.push('grafia');
      if(x.tel&&telFim(x.tel)!==telFim(p.tel))mud.push('tel');
      const a=[...(p.privilegios||[])].sort().join(),b=[...x.priv].sort().join();if(a!==b)mud.push('priv');if(p.ativo===false)mud.push('reativar')}
    const parecidos=id?[]:Object.keys(pubs).filter(k=>foldTxt(pubs[k].nome).split(' ')[0]===foldTxt(x.nome).split(' ')[0]);
    return Object.assign({},x,{id,acao:id?(mud.length?'atualizar':'igual'):'novo',mud,sexo:id?pubs[id].sexo:palpiteSexo(x.nome,x.priv),parecidos,privOk:true})});
  const fora=Object.keys(pubs).filter(id=>!usados.has(id)&&pubs[id].ativo!==false);
  return{linhas,fora,inativar:new Set()}}
function rPubImport(){const v=$('#v-pubimport');const P=ui.pimp;
  const drop=`<label class="drop" for="pimpfile"><b>Escolha a lista de publicadores</b><span class="hint">Planilha do Excel, documento do Word (.docx), PDF ou texto, com nome, telefone e qualificação (ancião, servo ministerial, pioneiro). Antes de gravar, você confere cada linha.</span><span class="btn primary dropbtn">Escolher arquivo</span><input type="file" id="pimpfile"></label>`;
  const exp=`<div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:10px"><h3 style="margin:0;font-size:18px">Exportar</h3><p class="hint" style="margin:0">Baixa a lista atual (nome, telefone, irmão/irmã, qualificações e em que partes cada um pode ser designado). O arquivo tem telefones: guarde com cuidado.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-a="pexpxlsx">Baixar planilha do Excel</button><button class="btn" data-a="pexpdocx">Baixar documento do Word</button></div></div>`;
  let body='';
  if(!P)body=drop;
  else if(P.lendo)body=`<p class="muted">Lendo ${esc(P.nome)}…</p>`;
  else if(P.erro)body=drop+`<div class="drawres short">${esc(P.erro)}</div>`;
  else{const L=P.linhas;const n={novo:0,atualizar:0,igual:0,ignorar:0};L.forEach(x=>n[x.acao]++);
    const opts=x=>`<select class="pimpact" data-i="${L.indexOf(x)}" aria-label="O que fazer com ${esc(x.nome)}"><option value="novo" ${x.acao==='novo'?'selected':''}>Cadastrar como novo</option>${x.id?`<option value="atualizar" ${x.acao==='atualizar'||x.acao==='igual'?'selected':''}>Atualizar ${esc(tc(pname(x.id)))}</option>`:''}${x.parecidos.filter(k=>k!==x.id).map(k=>`<option value="ligar:${k}">É o mesmo que ${esc(tc(pname(k)))}</option>`).join('')}<option value="ignorar" ${x.acao==='ignorar'?'selected':''}>Ignorar</option></select>`;
    const muda=x=>{if(x.acao==='novo')return`<span class="tagnew">novo</span>`;if(x.acao==='igual')return'<span class="muted">sem mudança</span>';if(x.acao==='ignorar')return'<span class="muted">ignorado</span>';const p=pubs[x.id]||{};const t=[];
      if(x.mud.includes('nome'))t.push('nome: '+esc(p.nome)+' → <b>'+esc(x.nome)+'</b>');if(x.mud.includes('grafia'))t.push('grafia do nome: <b>'+esc(x.nome)+'</b>');
      if(x.mud.includes('tel'))t.push('telefone: '+(p.tel?esc(fmtTelBR(p.tel)):'—')+' → <b>'+esc(fmtTelBR(x.tel))+'</b>');
      if(x.mud.includes('priv'))t.push('qualificação: '+esc((p.privilegios||[]).map(k=>PRIVNAME[k]).join(', ')||'nenhuma')+' → <b>'+esc(x.priv.map(k=>PRIVNAME[k]).join(', ')||'nenhuma')+'</b>');
      if(x.mud.includes('reativar'))t.push('<b>volta a ficar ativo</b>');return'<span class="tagupd">atualiza</span> '+t.join(' · ')};
    const show=ui.pimpTodos?L:L.filter(x=>x.acao!=='igual');
    body=`<div class="panel" style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <p style="margin:0"><b>${esc(P.nome)}</b>: ${L.length} pessoa${L.length===1?'':'s'} na lista · <b>${n.novo}</b> nova${n.novo===1?'':'s'} · <b>${n.atualizar}</b> com mudanças · ${n.igual} sem mudança${n.ignorar?' · '+n.ignorar+' ignorada'+(n.ignorar>1?'s':''):''}</p>
      <div class="pimplist">${show.map(x=>`<div class="pimprow"><div><b>${esc(x.nome)}</b>${x.tel?' <span class="muted">'+esc(fmtTelBR(x.tel))+'</span>':' <span class="muted">sem telefone</span>'}${x.priv.length?' <span class="muted">· '+esc(x.priv.map(k=>PRIVNAME[k]).join(', '))+'</span>':''}<div class="pimpch">${muda(x)}</div>
        ${x.acao==='novo'?`<div class="pimpsx"><label><input type="radio" name="sx${L.indexOf(x)}" class="pimpsx" data-i="${L.indexOf(x)}" value="M" ${x.sexo==='M'?'checked':''}> Irmão</label><label><input type="radio" name="sx${L.indexOf(x)}" class="pimpsx" data-i="${L.indexOf(x)}" value="F" ${x.sexo==='F'?'checked':''}> Irmã</label></div>`:''}</div>${opts(x)}</div>`).join('')||'<p class="muted" style="margin:0">Nada a mudar: a lista é igual ao cadastro.</p>'}</div>
      ${L.some(x=>x.acao==='igual')?`<label style="font-size:14px;display:flex;gap:8px;align-items:center"><input type="checkbox" id="pimptodos" ${ui.pimpTodos?'checked':''}> Mostrar também quem não muda (${n.igual})</label>`:''}
      ${P.fora.length?`<div class="drawres"><b>${P.fora.length} ${P.fora.length===1?'pessoa ativa do cadastro não está':'pessoas ativas do cadastro não estão'} na lista.</b> Marque quem deve ficar inativo (sai das listas de designação, mas o histórico fica guardado):<div class="pimpfora">${P.fora.map(id=>`<label><input type="checkbox" class="pimpfora" value="${id}" ${P.inativar.has(id)?'checked':''}> ${esc(tc(pname(id)))}</label>`).join('')}</div></div>`:''}
      <p class="hint" style="margin:0">Quem é cadastrado como novo entra sem categorias de designação: depois, abra a ficha e marque em que partes cada um pode ser designado.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-a="pimpgo" ${n.novo+n.atualizar+P.inativar.size?'':'disabled'}>Gravar ${n.novo+n.atualizar+P.inativar.size} alteraç${n.novo+n.atualizar+P.inativar.size===1?'ão':'ões'}</button><button class="btn" data-a="pimpcancel">Cancelar</button></div></div>`}
  v.innerHTML=`<div style="display:grid;gap:16px;max-width:900px"><div class="panel imp" style="padding:16px"><h2 style="margin:0">Importar lista</h2>${body}</div>${exp}</div>`}
async function pimpRead(f){ui.pimp={nome:f.name,lendo:true};rPubImport();
  try{const lista=await lerListaArquivo(f);if(!lista.length)throw new Error('Não encontrei nomes neste arquivo. Cada linha (ou linha da tabela) deve ter o nome da pessoa; telefone e qualificação são opcionais.');
    ui.pimp=Object.assign({nome:f.name},planoImport(lista))}
  catch(e){ui.pimp={nome:f.name,erro:(e&&e.message)||'Não foi possível ler o arquivo.'};if(/carregou|load/i.test(ui.pimp.erro))ui.pimp.erro='Não foi possível carregar o leitor de planilhas. Verifique a internet e tente de novo.'}
  rPubImport()}
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='pimpfile'&&t.files[0]){pimpRead(t.files[0]);return}
  if(!ui.pimp||!ui.pimp.linhas)return;const L=ui.pimp.linhas;
  if(t.classList.contains('pimpact')){const x=L[+t.dataset.i];const v=t.value;if(v.startsWith('ligar:')){x.id=v.slice(6);const p=pubs[x.id];x.mud=[];if(x.tel&&telFim(x.tel)!==telFim(p.tel))x.mud.push('tel');if(foldTxt(x.nome)!==foldTxt(p.nome))x.mud.push('nome');if([...(p.privilegios||[])].sort().join()!==[...x.priv].sort().join())x.mud.push('priv');x.acao=x.mud.length?'atualizar':'igual';x.sexo=p.sexo;ui.pimp.fora=ui.pimp.fora.filter(k=>k!==x.id)}else x.acao=v==='atualizar'&&!x.mud.length?'igual':v;rPubImport()}
  if(t.classList.contains('pimpsx')){L[+t.dataset.i].sexo=t.value}
  if(t.classList.contains('pimpfora')){if(t.checked)ui.pimp.inativar.add(t.value);else ui.pimp.inativar.delete(t.value);rPubImport()}
  if(t.id==='pimptodos'){ui.pimpTodos=t.checked;rPubImport()}});
Object.assign(PACTS,{
  pimpcancel:()=>{ui.pimp=null;rPubImport()},
  pimpgo:()=>{const P=ui.pimp;if(!P||!P.linhas)return;let novos=0,atual=0,inat=0;
    P.linhas.forEach(x=>{if(x.acao==='novo'){const id=foldTxt(x.nome).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)+'-'+Math.random().toString(36).slice(2,6);
        const d=Object.assign(blankPub(),{nome:x.nome,tel:x.tel?fmtTelBR(x.tel):'',sexo:x.sexo,privilegios:x.priv});pubs[id]=d;queueSave('publicadores',id,d);novos++}
      else if(x.acao==='atualizar'&&x.id&&pubs[x.id]){const p=Object.assign({},pubs[x.id]);if(x.mud.includes('nome')||x.mud.includes('grafia'))p.nome=x.nome;if(x.mud.includes('tel'))p.tel=fmtTelBR(x.tel);if(x.mud.includes('priv'))p.privilegios=x.priv;if(x.mud.includes('reativar'))p.ativo=true;pubs[x.id]=p;queueSave('publicadores',x.id,p);atual++}});
    P.inativar.forEach(id=>{if(!pubs[id])return;const p=Object.assign({},pubs[id],{ativo:false});pubs[id]=p;queueSave('publicadores',id,p);inat++});
    ui.pimp=null;buildHist();rPubImport();toast([novos?novos+' cadastrado'+(novos>1?'s':''):'',atual?atual+' atualizado'+(atual>1?'s':''):'',inat?inat+' inativado'+(inat>1?'s':''):''].filter(Boolean).join(' · ')||'Nada a gravar')},
  pexpxlsx:async()=>{try{await loadScript(XLSX_URL)}catch(e){toast('Não foi possível carregar o gerador de planilhas');return}
    const rows=[['Nome','Telefone','Irmão/Irmã','Qualificação','Pode ser designado para','Ativo']].concat(Object.values(pubs).sort((a,b)=>a.nome.localeCompare(b.nome,'pt')).map(p=>[tc(p.nome),p.tel||'',p.sexo==='F'?'Irmã':'Irmão',(p.privilegios||[]).map(k=>PRIVNAME[k]).join(', '),(p.cats||[]).map(c=>CATNAME[c]).filter(Boolean).join(', '),p.ativo===false?'Não':'Sim']));
    const ws=window.XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:28},{wch:18},{wch:10},{wch:30},{wch:60},{wch:7}];const wb=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(wb,ws,'Publicadores');
    const out=window.XLSX.write(wb,{bookType:'xlsx',type:'array'});await saveFile('publicadores-'+iso(new Date())+'.xlsx',new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))},
  pexpdocx:async()=>{try{await loadScript(JSZIP_URL)}catch(e){toast('Não foi possível carregar o gerador de documentos');return}
    const x=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const cell=(t,b)=>`<w:tc><w:tcPr><w:tcBorders><w:top w:val="single" w:sz="4" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/></w:tcBorders></w:tcPr><w:p><w:r>${b?'<w:rPr><w:b/></w:rPr>':''}<w:t xml:space="preserve">${x(t)}</w:t></w:r></w:p></w:tc>`;
    const lista=Object.values(pubs).filter(p=>p.ativo!==false).sort((a,b)=>a.nome.localeCompare(b.nome,'pt'));
    const rows=[['Nome','Telefone','Qualificação']].concat(lista.map(p=>[tc(p.nome),p.tel||'',(p.privilegios||[]).map(k=>PRIVNAME[k]).join(', ')])).map((r,i)=>`<w:tr>${r.map(c=>cell(c,i===0)).join('')}</w:tr>`).join('');
    const titulo=(cfg.congregacao&&cfg.congregacao!=='Congregação'?'Congregação '+cfg.congregacao.replace(/^Congrega[cç][aã]o\s+/i,'')+' · ':'')+'Publicadores';
    const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:spacing w:after="200"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${x(titulo)}</w:t></w:r></w:p><w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/></w:tblPr>${rows}</w:tbl><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
    const z=new window.JSZip();z.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    z.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    z.file('word/document.xml',doc);const blob=await z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
    await saveFile('publicadores-'+iso(new Date())+'.docx',blob)}});
