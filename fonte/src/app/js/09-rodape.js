/* ================= Rodapé: contato do desenvolvedor e links úteis ================= */
const DEV={zap:((window.DESIGNAR_CONFIG&&window.DESIGNAR_CONFIG.whatsapp)||'5575992799894').replace(/\D/g,'')};
const LINKS_UTEIS=[['JW.ORG','https://www.jw.org/pt/'],['JW Hub','https://hub.jw.org/'],['Biblioteca On-line','https://wol.jw.org/pt/']];
const EXT_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
/* "Fale com o desenvolvedor": abre o WhatsApp com a mensagem já começada e as informações que ajudam a achar um erro */
function devZap(){const F=window.FBX||{};const ap=/iPhone|iPad/.test(navigator.userAgent)?'iPhone/iPad':/Android/.test(navigator.userAgent)?'Android':/Windows/.test(navigator.userAgent)?'Windows':/Mac/.test(navigator.userAgent)?'Mac':'outro';
  const msg=`Olá! Sobre o sistema de designações${cfg&&cfg.congregacao?' da Congregação '+String(cfg.congregacao).replace(/^Congrega[cç][aã]o\s+/i,''):''}:\n\n(escreva aqui a sua dúvida ou sugestão; se for um erro, conte o que você fez e o que aconteceu)\n\n— Versão ${F.versao||'testes'} · tela ${location.hash||'#inicio'} · ${ap}`;
  return 'https://wa.me/'+DEV.zap+'?text='+encodeURIComponent(msg)}
function rodape(){if(document.querySelector('footer.appfoot'))return;setTimeout(()=>{const h=$('#hName'),f=document.querySelector('.appfoot .fcong');if(h&&f){const sync=()=>{f.textContent=h.textContent};sync();new MutationObserver(sync).observe(h,{childList:true,characterData:true,subtree:true})}},0);const F=window.FBX;
  const logo=document.querySelector('header.app .logo');
  document.body.insertAdjacentHTML('beforeend',`<footer class="appfoot"><div class="wrap ftop">
    <div class="fcol fbrandcol">${logo?`<span class="fhead"><span class="logo sm">${logo.innerHTML}</span><b class="fcong"></b></span>`:''}</div>
    <div class="fcol flinks"><h2>Links úteis</h2><div class="flinkrow">${LINKS_UTEIS.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${t}${EXT_IC}</a>`).join('')}</div></div>
    <div class="fcol fsup"><h2>Suporte</h2><p>Dúvidas, sugestões ou encontrou um erro?<br><a class="footmail" href="#" target="_blank" rel="noopener noreferrer">Fale com o desenvolvedor.</a></p></div>
  </div><div class="wrap fbot">${F?`<nav aria-label="Documentos"><a href="#" data-doc="sobre">Sobre</a><a href="#" data-doc="privacidade">Aviso de privacidade</a><a href="#" data-doc="termos">Termo de uso</a></nav>`:'<span></span>'}${F?`<span class="fver">Versão ${esc(F.versao||'')}</span>`:''}</div></footer>`);
  const fm=document.querySelector('footer.appfoot .footmail');fm.href='https://wa.me/'+DEV.zap;fm.addEventListener('click',e=>{e.currentTarget.href=devZap()})}
