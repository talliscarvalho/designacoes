/* ================= Listas suspensas com busca =================
   Toda lista com 8 opções ou mais vira um botão que abre uma caixa com campo de busca.
   O <select> original continua guardando o valor; ao escolher, ele recebe os mesmos eventos de antes. */
const fold=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const CBX_MIN=8;
function cbxLabel(sel){const o=sel.options[sel.selectedIndex];return o?o.textContent:''}
function enhanceSelects(){document.querySelectorAll('main select:not([data-cbx])').forEach(sel=>{if(sel.options.length<CBX_MIN||sel.classList.contains('nosrch'))return;
  sel.dataset.cbx='1';const b=document.createElement('button');b.type='button';b.className='cbx'+(sel.classList.contains('dup')?' dup':'');
  if(sel.dataset.f)b.dataset.f=sel.dataset.f;b.setAttribute('aria-haspopup','listbox');const lab=sel.getAttribute('aria-label')||(sel.closest('label')?sel.closest('label').firstChild.textContent.trim():'');if(lab)b.setAttribute('aria-label',lab+': '+cbxLabel(sel));
  b.innerHTML=`<span>${esc(cbxLabel(sel))}</span>`;b.disabled=sel.disabled;sel.after(b);b.addEventListener('click',e=>{e.preventDefault();cbxOpen(sel,b)})})}
let cbxCur=null;
function cbxClose(){if(!cbxCur)return;const c=cbxCur;cbxCur=null;c.wrap.remove();if(c.btn.isConnected)c.btn.focus()}
function cbxOpen(sel,btn){cbxClose();
  const items=[];[...sel.children].forEach(ch=>{if(ch.tagName==='OPTGROUP'){items.push({g:ch.label});[...ch.children].forEach(o=>items.push({o}))}else items.push({o:ch})});
  const host=btn.closest('section')||document.body;const wrap=document.createElement('div');wrap.className='cbxwrap';
  const sheet=innerWidth<=620;
  wrap.innerHTML=`<div class="cbxback ${sheet?'dim':''}"></div><div class="cbxpop ${sheet?'sheet':''}" role="dialog" aria-label="Escolher"><div class="cbxhead"><input type="search" class="cbxq" placeholder="Buscar…" autocomplete="off" aria-label="Buscar na lista"><button type="button" class="btn small ghost cbxx" aria-label="Fechar">✕</button></div><div class="cbxlist" role="listbox"></div></div>`;
  host.appendChild(wrap);const pop=wrap.querySelector('.cbxpop'),q=wrap.querySelector('.cbxq'),list=wrap.querySelector('.cbxlist');
  if(!sheet){const r=btn.getBoundingClientRect();const w=Math.min(Math.max(r.width,320),innerWidth-24);pop.style.width=w+'px';pop.style.left=Math.max(12,Math.min(r.left,innerWidth-w-12))+'px';
    const below=innerHeight-r.bottom-12,above=r.top-12;if(below>=300||below>=above){pop.style.top=(r.bottom+4)+'px';pop.style.maxHeight=Math.max(200,below)+'px'}else{pop.style.bottom=(innerHeight-r.top+4)+'px';pop.style.maxHeight=Math.max(200,above)+'px'}}
  let vis=[],act=-1;
  const draw=()=>{const words=fold(q.value).split(/\s+/).filter(Boolean);vis=[];let html='',grp=null;
    items.forEach(it=>{if(it.g){grp=it.g;return}const o=it.o;const txt=o.textContent;if(words.length&&!words.every(w=>fold(txt).includes(w)))return;
      if(grp!==null&&grp!==true){html+=`<div class="cbxg">${esc(grp)}</div>`;grp=true}
      const i=vis.length;vis.push(o);html+=`<div class="cbxo ${o.selected?'sel':''} ${o.disabled?'dis':''}" role="option" aria-selected="${o.selected}" data-i="${i}">${esc(txt)}</div>`});
    list.innerHTML=html||'<div class="cbxnone">Nada encontrado.</div>';act=words.length?(vis.length?0:-1):vis.findIndex(o=>o.selected);hi(true)};
  const hi=scroll=>{list.querySelectorAll('.cbxo').forEach(e=>e.classList.toggle('act',+e.dataset.i===act));const e=list.querySelector('.cbxo.act');if(e&&scroll)e.scrollIntoView({block:'nearest'})};
  const pick=i=>{const o=vis[i];if(!o||o.disabled)return;const changed=sel.value!==o.value;cbxCur=null;wrap.remove();
    if(changed){sel.value=o.value;sel.dispatchEvent(new Event('input',{bubbles:true}));if(sel.isConnected)sel.dispatchEvent(new Event('change',{bubbles:true}))}
    if(btn.isConnected){btn.querySelector('span').textContent=cbxLabel(sel);btn.focus()}};
  q.addEventListener('input',draw);
  q.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();act=Math.min(vis.length-1,act+1);hi(true)}else if(e.key==='ArrowUp'){e.preventDefault();act=Math.max(0,act-1);hi(true)}
    else if(e.key==='Enter'){e.preventDefault();if(act>=0)pick(act)}else if(e.key==='Escape'){e.preventDefault();cbxClose()}});
  list.addEventListener('click',e=>{const el=e.target.closest('.cbxo');if(el)pick(+el.dataset.i)});
  wrap.querySelector('.cbxback').addEventListener('click',cbxClose);wrap.querySelector('.cbxx').addEventListener('click',cbxClose);
  cbxCur={wrap,btn,sheet};draw();q.focus()}
window.addEventListener('resize',()=>{if(cbxCur&&!cbxCur.sheet)cbxClose()});
document.addEventListener('scroll',e=>{if(cbxCur&&!cbxCur.sheet&&!cbxCur.wrap.contains(e.target))cbxClose()},true);
document.addEventListener('keydown',e=>{const b=e.target;if(b.classList&&b.classList.contains('cbx')&&(e.key==='ArrowDown'||e.key==='ArrowUp'||(e.key.length===1&&/\S/.test(e.key)))){e.preventDefault();const sel=b.previousElementSibling;if(sel&&sel.tagName==='SELECT'){cbxOpen(sel,b);if(e.key.length===1){const q=cbxCur.wrap.querySelector('.cbxq');q.value=e.key;q.dispatchEvent(new Event('input'))}}}});
new MutationObserver(()=>enhanceSelects()).observe(document.querySelector('main'),{childList:true,subtree:true});
