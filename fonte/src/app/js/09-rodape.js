/* ================= Rodapé: contato do desenvolvedor e links úteis ================= */
const DEV={mail:(window.DESIGNAR_CONFIG&&window.DESIGNAR_CONFIG.suporte)||['tallisdocarmo','gmail.com'].join('@')};
const LINKS_UTEIS=[['JW.ORG','https://www.jw.org/pt/'],['JW Hub','https://hub.jw.org/'],['Biblioteca On-line','https://wol.jw.org/pt/']];
const EXT_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
/* o e-mail sai com assunto e um roteiro já preenchidos; as informações técnicas ajudam a encontrar o erro */
function devMailto(){const F=window.FBX||{};const ua=navigator.userAgent.replace(/\s*\([^)]*\)\s*/,' ').replace(/\s+/g,' ').slice(0,160);
  const body=`Olá!\n\nEscreva aqui a sua dúvida ou sugestão. Se for um erro, conte o que você fez, o que esperava e o que aconteceu:\n\n\n\n— Para ajudar no atendimento (pode manter) —\nVersão: ${F.versao||'artifact'}\nTela: ${location.hash||'#inicio'}\nPerfil: ${F.papel||'—'}\nAparelho: ${ua}`;
  return 'mailto:'+DEV.mail+'?subject='+encodeURIComponent('Sistema de designações · dúvida ou problema')+'&body='+encodeURIComponent(body)}
function rodape(){if(document.querySelector('footer.appfoot'))return;setTimeout(()=>{const h=$('#hName'),f=document.querySelector('.appfoot .fcong');if(h&&f){const sync=()=>{f.textContent=h.textContent};sync();new MutationObserver(sync).observe(h,{childList:true,characterData:true,subtree:true})}},0);const F=window.FBX;
  const logo=document.querySelector('header.app .logo');
  document.body.insertAdjacentHTML('beforeend',`<footer class="appfoot"><div class="wrap ftop">
    <div class="fcol fbrandcol">${logo?`<span class="fhead"><span class="logo sm">${logo.innerHTML}</span><b class="fcong"></b></span>`:''}${F?`<p>Versão ${esc(F.versao||'')}</p>`:''}</div>
    <div class="fcol flinks"><h2>Links úteis</h2>${LINKS_UTEIS.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${t}${EXT_IC}</a>`).join('')}</div>
    <div class="fcol"><h2>Suporte</h2><p>Dúvidas, sugestões ou encontrou um erro? <a class="footmail" href="#">Fale com o desenvolvedor</a>.</p></div>
  </div><div class="wrap fbot">${F?`<nav aria-label="Documentos"><a href="#" data-doc="sobre">Sobre</a><a href="#" data-doc="privacidade">Aviso de privacidade</a><a href="#" data-doc="termos">Termo de uso</a></nav>`:''}</div></footer>`);
  document.querySelector('footer.appfoot .footmail').addEventListener('click',e=>{e.currentTarget.href=devMailto()});document.querySelector('footer.appfoot .footmail').href='mailto:'+DEV.mail}
