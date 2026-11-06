/* Conexão com o Firebase: login com Google, lista de acesso ("acesso"), aceite do termo de uso ("aceites")
   e dados públicos do aviso de privacidade ("publico/info"). O administrador principal também está fixo nas regras. */
(function(){try{const t=localStorage.getItem('vmc-tema');if(t==='claro')document.documentElement.dataset.theme='light';else if(t==='escuro')document.documentElement.dataset.theme='dark'}catch(e){}})();
(function(){
  /* dados desta instalação: ficam no arquivo config.js (veja o LEIAME para usar em outra congregação) */
  const CFG=window.DESIGNAR_CONFIG||{};
  const FIREBASE_CONFIG=CFG.firebase;
  const OWNER=String(CFG.dono||'').trim().toLowerCase();
  const APP="Designar", VERSAO="%%VERSAO%%", TERMOS_V=1, DOCS_DATA="5 de novembro de 2026";
  const FBX=window.FBX={papel:null,email:null,owner:OWNER,app:APP,versao:VERSAO,whatsapp:CFG.whatsapp||'',pub:{}};
  const t=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let resolveReady,rejectReady;const readyP=new Promise((r,j)=>{resolveReady=r;rejectReady=j});
  readyP.catch(()=>{}); /* o sistema trata a falha em init(); evita aviso de promessa sem tratamento */
  FBX.ready=()=>readyP;

  /* ---------- Textos: aviso de privacidade, termo de uso e sobre ---------- */
  const resp=()=>FBX.pub.responsavel?t(FBX.pub.responsavel):'os anciãos da congregação';
  const contato=()=>FBX.pub.contato?` pelo contato <b>${t(FBX.pub.contato)}</b>`:'';
  const cong=()=>FBX.pub.congregacao?'a Congregação '+t(String(FBX.pub.congregacao).replace(/^Congrega[cç][aã]o\s+/i,'')):'a congregação que usa este sistema';
  const DOCS={
    privacidade:()=>`<h2>Aviso de privacidade</h2><p class="fbdate">Atualizado em ${DOCS_DATA}</p>
      <p>Este aviso explica, de forma simples, quais dados pessoais o ${APP} guarda, para que eles servem e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).</p>
      <h3>Quem cuida dos dados</h3><p>O sistema é usado por ${cong()} para organizar os seus arranjos. Os responsáveis pelos dados são ${resp()}${contato()}.</p>
      <h3>Quais dados são guardados</h3><ul>
        <li><b>Dos publicadores:</b> nome, telefone (WhatsApp), em que partes cada um pode ser designado, privilégios de serviço (ancião, servo ministerial, pioneiro), histórico de designações, grupo de limpeza e saídas de campo que dirige.</li>
        <li><b>De quem tem acesso ao sistema:</b> e-mail e nome da conta Google, nível de permissão, data do aceite do termo de uso, último acesso e registro das alterações feitas.</li></ul>
      <p>Não são guardados endereço, data de nascimento, documentos nem dados financeiros.</p>
      <h3>Dado sensível</h3><p>Como essas informações revelam a vinculação religiosa das pessoas, a LGPD as trata como <b>dado pessoal sensível</b>. Por isso, o acesso é restrito e o uso se limita aos arranjos internos da congregação.</p>
      <h3>Para que são usados</h3><p>Exclusivamente para organizar e comunicar designações das reuniões, da limpeza do Salão do Reino, de áudio/vídeo e indicadores e das saídas de campo, além do controle de itens de limpeza. Os dados <b>não são vendidos, não são usados para propaganda e não são compartilhados</b> com terceiros para outros fins.</p>
      <h3>Quem pode ver</h3><p>Somente pessoas autorizadas por um administrador, com login pela conta Google. Há três níveis: só visualizar, editar e administrar. As folhas impressas para o quadro de anúncios mostram apenas o nome de quem tem cada designação. As mensagens de aviso são enviadas pelo WhatsApp do próprio usuário, a partir do celular dele.</p>
      <h3>Onde ficam guardados</h3><p>No Google Firebase (Cloud Firestore), com servidor em São Paulo (Brasil). O login é feito pelo Google. A página do sistema é hospedada no GitHub Pages, que não recebe os dados pessoais. Cópias de segurança baixadas por administradores ficam sob a responsabilidade de quem as baixou.</p>
      <h3>Por quanto tempo</h3><p>Enquanto forem necessários para os arranjos da congregação. Quando um publicador deixa a congregação ou pede a exclusão, os dados dele são removidos do cadastro. Quem deixa de ter acesso ao sistema é retirado da lista de acesso.</p>
      <h3>Seus direitos</h3><p>Você pode pedir para <b>saber quais dados seus estão guardados</b>, <b>corrigir</b> algo errado, <b>apagar</b> os seus dados ou <b>tirar dúvidas</b> sobre este aviso. Para isso, fale com ${resp()}${contato()}.</p>
      <h3>Segurança</h3><p>Conexão criptografada (HTTPS), acesso só com login e lista de autorizados, regras de permissão no servidor e registro de quem alterou cada informação.</p>
      <h3>Cookies e rastreamento</h3><p>O sistema não usa cookies de propaganda, não tem rastreamento e não coleta estatísticas de uso. O navegador guarda apenas o login e algumas preferências de tela.</p>`,
    termos:()=>`<h2>Termo de uso e confidencialidade</h2><p class="fbdate">Versão ${TERMOS_V} · ${DOCS_DATA}</p>
      <p>O ${APP} reúne nomes, telefones e informações dos publicadores da congregação. Ao usar o sistema, você se compromete a:</p><ol>
        <li><b>Usar os dados só para os arranjos da congregação</b> (designações, limpeza, áudio/vídeo e indicadores, saídas de campo e avisos), nunca para outros fins.</li>
        <li><b>Não compartilhar</b> telefones, listas, prints de tela, PDFs com dados pessoais ou cópias de segurança com quem não tem acesso autorizado.</li>
        <li><b>Não emprestar o seu acesso</b> e sair da conta em aparelhos de outras pessoas.</li>
        <li><b>Avisar um administrador</b> se perder o celular, se a sua conta Google for invadida ou se perceber algum uso indevido.</li>
        <li><b>Manter os dados corretos</b> e respeitar os pedidos de correção ou exclusão feitos pelos publicadores.</li>
        <li>Saber que <b>as alterações ficam registradas</b> com o seu nome, data e hora.</li></ol>
      <p>O acesso pode ser retirado a qualquer momento pelos administradores. Leia também o <a href="#" data-doc="privacidade">aviso de privacidade</a>.</p>`,
    sobre:()=>`<h2>Sobre o ${APP}</h2><p class="fbdate">Versão ${VERSAO}</p>
      <p><b>${APP}</b> reúne num só lugar as designações da congregação. O lema vem de 1 Pedro 4:10: cada um usa o dom que recebeu para servir aos outros, e tudo fica em seu lugar.</p>
      <p>O sistema organiza designações das reuniões do meio de semana e do fim de semana, limpeza do Salão do Reino, áudio/vídeo e indicadores, saídas de campo e itens de limpeza, com folhas em PDF para o quadro de anúncios e avisos pelo WhatsApp.</p>
      <p>É uma ferramenta independente, feita para uso interno das congregações, e não é um produto oficial de nenhuma organização.</p>
      <h3>Responsável</h3><p>${FBX.pub.responsavel?t(FBX.pub.responsavel)+(FBX.pub.contato?' · '+t(FBX.pub.contato):''):'Os anciãos da congregação.'}</p>
      <p><a href="#" data-doc="privacidade">Aviso de privacidade</a> · <a href="#" data-doc="termos">Termo de uso</a></p>`
  };
  function openDoc(k){let o=document.getElementById('fbdoc');if(!o){o=document.createElement('div');o.id='fbdoc';document.body.appendChild(o)}
    o.innerHTML=`<div class="fbdocback"></div><div class="fbdocbox" role="dialog" aria-modal="true"><button class="fbdocx" aria-label="Fechar">✕</button><div class="fbdoctxt">${DOCS[k]()}</div><div class="fbdocfoot"><button class="fbbtn fbsec" data-close>Fechar</button></div></div>`;
    o.hidden=false;const close=()=>{o.hidden=true};o.querySelector('.fbdocback').onclick=close;o.querySelector('.fbdocx').onclick=close;o.querySelector('[data-close]').onclick=close;
    o.querySelector('.fbdoctxt').scrollTop=0;o.querySelector('.fbdocx').focus()}
  FBX.openDoc=openDoc;
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-doc]');if(!a)return;e.preventDefault();openDoc(a.dataset.doc)});
  document.addEventListener('keydown',e=>{const o=document.getElementById('fbdoc');if(e.key==='Escape'&&o&&!o.hidden)o.hidden=true});

  const LOCKUP=`<div class="fblock"><span class="fbmark"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="%%MARCA%%"/></svg></span></div>`;
  const LINKS=`<nav class="fblinks" aria-label="Documentos"><a href="#" data-doc="privacidade">Privacidade</a><a href="#" data-doc="termos">Termo de uso</a><a href="#" data-doc="sobre">Sobre</a><a href="#" class="fbhelp" target="_blank" rel="noopener noreferrer">Ajuda</a></nav>`;
  /* "Ajuda": e-mail ao desenvolvedor com assunto e roteiro preenchidos */
  const helpMail=()=>{const n=String(CFG.whatsapp||'5575992799894').replace(/\D/g,'');const ap=/iPhone|iPad/.test(navigator.userAgent)?'iPhone/iPad':/Android/.test(navigator.userAgent)?'Android':/Windows/.test(navigator.userAgent)?'Windows':/Mac/.test(navigator.userAgent)?'Mac':'outro';
    return 'https://wa.me/'+n+'?text='+encodeURIComponent('Olá! Preciso de ajuda para entrar no sistema de designações.\n\n(conte o que aconteceu)\n\n— Versão '+VERSAO+' · '+ap)};
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('.fbhelp');if(a)a.href=helpMail()},true);
  if(!window.firebase||!FIREBASE_CONFIG||!FIREBASE_CONFIG.apiKey){const fail=()=>{gate('falha');const b=document.getElementById('fbRetry');if(b)b.onclick=()=>location.reload()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fail);else fail();rejectReady({code:'sem-firebase'});return}
  firebase.initializeApp(FIREBASE_CONFIG);
  const auth=firebase.auth(),fs=firebase.firestore();
  auth.languageCode='pt';
  const provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
  /* guarda os dados no aparelho: abre e mostra a última versão mesmo sem internet, e envia as alterações quando a conexão voltar */
  try{fs.enablePersistence({synchronizeTabs:true}).catch(()=>{})}catch(e){}
  const ts=()=>firebase.firestore.FieldValue.serverTimestamp();
  if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  const CACHEK='vmc-acesso-cache';const cacheGet=e=>{try{const c=JSON.parse(localStorage.getItem(CACHEK)||'{}');return c.email===e?c:null}catch(x){return null}};
  const cacheSet=d=>{try{localStorage.setItem(CACHEK,JSON.stringify(d))}catch(x){}};
  fs.doc('publico/info').get().then(d=>{if(d.exists)FBX.pub=d.data()||{}}).catch(()=>{});

  function gate(kind,msg){let g=document.getElementById('fbgate');
    if(!g){g=document.createElement('div');g.id='fbgate';document.body.appendChild(g)}
    if(kind==='termos'){g.innerHTML=`<div class="fbcard fbwide"><div class="fbdoctxt fbinline">${DOCS.termos()}</div>
        <label class="fbchk"><input type="checkbox" id="fbAgree"><span>Li e concordo com o termo de uso e com o <a href="#" data-doc="privacidade">aviso de privacidade</a>.</span></label>
        <button class="fbbtn fbprim" id="fbAccept" disabled>Aceitar e entrar</button><button class="fbbtn fbsec" id="fbOut">Não aceito, sair</button></div>`;
      g.hidden=false;const c=document.getElementById('fbAgree'),b=document.getElementById('fbAccept');c.onchange=()=>{b.disabled=!c.checked};
      b.onclick=async()=>{b.disabled=true;b.textContent='Salvando…';try{await fs.doc('aceites/'+FBX.email).set({versao:TERMOS_V,em:ts(),ultimo:ts(),nome:FBX.nome||''});cacheSet({email:FBX.email,papel:FBX.papel,pubId:FBX.pubId,aceite:TERMOS_V});enter()}catch(e){b.disabled=false;b.textContent='Aceitar e entrar';alertBox('Não foi possível registrar o aceite ('+(e.code||'erro')+'). Tente de novo.')}};
      document.getElementById('fbOut').onclick=()=>auth.signOut();return}
    const H=(t,p)=>`<h1 class="fbh">${t}</h1>${p?`<p class="fbsub">${p}</p>`:''}`;
    const body={
      login:H('Entrar','Entre com o e-mail ou o celular que você informou aos anciãos.')+`<button class="fbbtn" id="fbLogin"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continuar com Google</button>
        <div class="fbor"><span>ou receba um link no e-mail</span></div>
        <form id="fbMailForm" class="fbmail" novalidate><label for="fbMail" class="fblab">E-mail</label><input type="email" id="fbMail" required maxlength="254" placeholder="nome@exemplo.com" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"><button class="fbbtn fbprim" type="submit">Enviar link de acesso</button></form>
        <div class="fbor"><span>ou</span></div><button class="fbbtn" id="fbTelGo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/></svg>Entrar com o celular (SMS)</button>`,
      tel:H('Entrar com o celular','Enviaremos um código por SMS para o número que você informou aos anciãos.')+`<form id="fbTelForm" class="fbmail" novalidate><label for="fbTel" class="fblab">Celular com DDD</label><input type="tel" id="fbTel" required maxlength="20" placeholder="(75) 99999-9999" autocomplete="tel-national" inputmode="tel"><button class="fbbtn fbprim" type="submit" id="fbTelSend">Enviar código</button></form><button class="fbbtn fbsec" id="fbBack">Voltar</button>`,
      codigo:H('Digite o código',`Enviamos um SMS com 6 números para <b>${t(fmtTelBR(msg))}</b>.`)+`<form id="fbCodForm" class="fbmail" novalidate><label for="fbCod" class="fblab">Código</label><input type="text" id="fbCod" required maxlength="6" placeholder="000000" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]*" class="fbcod"><button class="fbbtn fbprim" type="submit">Entrar</button></form><button class="fbbtn fbsec" id="fbTelOutro">Usar outro número</button>`,
      link:H('Confira seu e-mail',`Enviamos um link de acesso para <b>${t(msg)}</b>.`)+`<p class="fbnote">Abra o e-mail <b>neste mesmo aparelho</b> e toque no link. Se não chegar em alguns minutos, veja a caixa de spam.</p><button class="fbbtn" id="fbBack">Usar outro e-mail</button>`,
      confirmar:H('Confirme o e-mail','Para terminar a entrada, digite o e-mail para o qual o link foi enviado.')+`<form id="fbConfForm" class="fbmail"><label for="fbConf" class="fblab">E-mail</label><input type="email" id="fbConf" required maxlength="254" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="nome@exemplo.com"><button class="fbbtn fbprim" type="submit">Entrar</button></form>`,
      espera:`<div class="fbwait" role="status"><span class="fbspin" aria-hidden="true"></span><p>${t(msg||'Conectando…')}</p></div>`,
      negado:H('Acesso ainda não liberado',`A conta <b>${t(String(msg||'').startsWith('+')?fmtTelBR(msg):msg)}</b> ainda não tem acesso ao sistema.`)+`<p class="fbnote">Seu pedido de acesso foi enviado aos administradores. Assim que ${String(msg||'').startsWith('+')?'este celular':'este e-mail'} for liberado, é só recarregar a página.</p>${CFG.whatsapp?`<a class="fbbtn fbprim" id="fbAvisar" target="_blank" rel="noopener noreferrer" href="https://wa.me/${String(CFG.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent('Olá! Pedi acesso ao sistema de designações com '+(String(msg||'').startsWith('+')?'o celular '+fmtTelBR(msg):'o e-mail '+msg)+'. Pode liberar, por favor?')}">Avisar pelo WhatsApp</a>`:''}<button class="fbbtn fbsec" id="fbOut">Entrar com outra conta</button>`,
      erro:H('Não foi possível entrar',t(msg))+`<button class="fbbtn" id="fbLogin">Tentar de novo</button>`,
      falha:H('Não foi possível carregar','Verifique a internet e tente de novo.')+`<p class="fbnote">Se continuar, desative bloqueadores de anúncios ou extensões de privacidade para este site, ou abra em outro navegador.</p><button class="fbbtn" id="fbRetry">Tentar de novo</button>`
    }[kind]||'';
    g.innerHTML=`<div class="fbshell">
      <aside class="fbside"><div class="fbsidein">${LOCKUP}<p class="fbtag">Gerencie o quadro de anúncios <br class="fbbr">da sua congregação em um só lugar.</p><p class="fbabout">O ${APP.toUpperCase()} é um apoio digital ao quadro de anúncios da congregação. Ele organiza as designações e faz com que cada publicador fique sabendo, a tempo, do que lhe cabe.</p></div>
        <figure class="fbverse"><blockquote>Mas que todas as coisas ocorram com decência e ordem.</blockquote><figcaption>1 Cor. 14:40.</figcaption></figure></aside>
      <main class="fbmain"><div class="fbpanel">${body}</div>${LINKS}</main></div>`;
    g.hidden=false;
    const lb=document.getElementById('fbLogin');if(lb)lb.onclick=login;
    const mf=document.getElementById('fbMailForm');if(mf)mf.onsubmit=e=>{e.preventDefault();const v=document.getElementById('fbMail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){alertBox('Digite um e-mail válido, como nome@exemplo.com.');document.getElementById('fbMail').focus();return}sendLink(v)};
    const cf=document.getElementById('fbConfForm');if(cf)cf.onsubmit=e=>{e.preventDefault();finishLink(document.getElementById('fbConf').value)};
    const bk=document.getElementById('fbBack');if(bk)bk.onclick=()=>gate('login');
    const tg=document.getElementById('fbTelGo');if(tg)tg.onclick=()=>gate('tel');
    const tf=document.getElementById('fbTelForm');if(tf)tf.onsubmit=e=>{e.preventDefault();const n=telE164(document.getElementById('fbTel').value);if(!n){alertBox('Digite o celular com DDD, como (75) 99999-9999.');document.getElementById('fbTel').focus();return}sendSms(n)};
    const cf2=document.getElementById('fbCodForm');if(cf2)cf2.onsubmit=e=>{e.preventDefault();const c=document.getElementById('fbCod').value.replace(/\D/g,'');if(c.length!==6){alertBox('O código tem 6 números.');return}confirmSms(c)};
    const to=document.getElementById('fbTelOutro');if(to)to.onclick=()=>gate('tel');
    const ob=document.getElementById('fbOut');if(ob)ob.onclick=()=>auth.signOut().then(()=>gate('login'));
  }
  function alertBox(m){const g=document.querySelector('#fbgate .fbpanel')||document.querySelector('#fbgate .fbcard');if(!g)return;let a=g.querySelector('.fberr');if(!a){a=document.createElement('p');a.className='fberr';a.setAttribute('role','alert');g.appendChild(a)}a.textContent=m}
  function hideGate(){const g=document.getElementById('fbgate');if(g)g.hidden=true}
  async function login(){
    gate('espera','Abrindo a janela do Google…');
    try{await auth.signInWithPopup(provider)}
    catch(e){
      if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment'){try{await auth.signInWithRedirect(provider);return}catch(e2){e=e2}}
      if(e.code==='auth/popup-closed-by-user'||e.code==='auth/cancelled-popup-request'){gate('login');return}
      if(e.code==='auth/unauthorized-domain'){gate('erro','Este endereço ainda não foi autorizado no Firebase (Authentication › Configurações › Domínios autorizados): '+location.hostname);return}
      if(e.code==='auth/network-request-failed'){gate('erro','Sem conexão com a internet. Verifique a rede e tente de novo.');return}
      gate('erro','Não foi possível entrar ('+(e.code||e.message||'erro')+').');
    }
  }
  /* entrada pelo celular: código por SMS (precisa do plano Blaze no Firebase) */
  const telE164=v=>{let d=String(v||'').replace(/\D/g,'');if(d.startsWith('0'))d=d.replace(/^0+/,'');if(d.length===10||d.length===11)d='55'+d;if(/^55\d{10}$/.test(d)&&/[6-9]/.test(d[4]))d=d.slice(0,4)+'9'+d.slice(4);return /^55\d{10,11}$/.test(d)?'+'+d:null};
  const fmtTelBR=v=>{const d=String(v||'').replace(/\D/g,'').replace(/^55/,'');return d.length===11?`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`:d.length===10?`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`:String(v||'')};
  FBX.telE164=telE164;FBX.fmtTel=fmtTelBR;
  let rv=null,confirmacao=null,telAtual='';
  async function sendSms(n){const btn=document.getElementById('fbTelSend');if(btn){btn.disabled=true;btn.textContent='Enviando…'}
    try{if(rv){try{rv.clear()}catch(e){}rv=null}rv=new firebase.auth.RecaptchaVerifier('fbTelSend',{size:'invisible'});
      confirmacao=await auth.signInWithPhoneNumber(n,rv);telAtual=n;gate('codigo',n)}
    catch(e){if(rv){try{rv.clear()}catch(x){}rv=null}
      const m={'auth/billing-not-enabled':'A entrada por SMS ainda não está liberada no Firebase: ela precisa do plano Blaze (pago por uso). Entre com Google ou pelo e-mail.','auth/operation-not-allowed':'A entrada pelo celular ainda não foi ativada no Firebase (Authentication › Método de login › Telefone).','auth/invalid-phone-number':'Esse número não parece válido. Confira o DDD.','auth/too-many-requests':'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.','auth/quota-exceeded':'O limite de SMS foi atingido. Tente mais tarde ou entre com Google.','auth/captcha-check-failed':'A verificação de segurança falhou. Recarregue a página e tente de novo.','auth/network-request-failed':'Sem conexão com a internet. Verifique a rede e tente de novo.'};
      gate('tel');alertBox(m[e.code]||'Não foi possível enviar o código ('+(e.code||'erro')+').')}}
  async function confirmSms(c){if(!confirmacao){gate('tel');return}gate('espera','Entrando…');
    try{await confirmacao.confirm(c)}
    catch(e){gate('codigo',telAtual);alertBox(e.code==='auth/invalid-verification-code'?'Código incorreto. Confira o SMS e digite de novo.':e.code==='auth/code-expired'?'O código expirou. Toque em "Usar outro número" e peça um novo.':'Não foi possível entrar ('+(e.code||'erro')+').')}}
  /* entrada por link no e-mail (sem senha) */
  const MAILKEY='vmc-mail-login';
  async function sendLink(email){email=String(email||'').trim().toLowerCase();if(!email)return;gate('espera','Enviando o link para '+email+'…');
    try{await auth.sendSignInLinkToEmail(email,{url:location.origin+location.pathname,handleCodeInApp:true});try{localStorage.setItem(MAILKEY,email)}catch(e){}gate('link',email)}
    catch(e){gate('erro',e.code==='auth/operation-not-allowed'?'A entrada por e-mail ainda não foi ativada no Firebase (Authentication › Método de login › E-mail/senha › Link do e-mail).':e.code==='auth/quota-exceeded'?'O limite diário de envio de links foi atingido. Tente amanhã ou entre com Google.':e.code==='auth/invalid-email'?'Esse e-mail não parece válido.':'Não foi possível enviar o link ('+(e.code||'erro')+').')}}
  let completingLink=false;
  async function finishLink(email){email=String(email||'').trim().toLowerCase();completingLink=true;gate('espera','Entrando…');
    try{await auth.signInWithEmailLink(email,location.href);try{localStorage.removeItem(MAILKEY)}catch(e){}history.replaceState(null,'',location.pathname+location.hash)}
    catch(e){completingLink=false;gate('erro',e.code==='auth/invalid-action-code'||e.code==='auth/expired-action-code'?'Este link já foi usado ou expirou. Peça um novo.':e.code==='auth/invalid-email'?'O e-mail não confere com o do link.':'Não foi possível entrar ('+(e.code||'erro')+').')}}
  if(auth.isSignInWithEmailLink(location.href)){completingLink=true;let em=null;try{em=localStorage.getItem(MAILKEY)}catch(e){}
    const go=()=>{if(em)finishLink(em);else gate('confirmar')};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()}
  let started=false;
  function enter(){started=true;hideGate();resolveReady(fs);
    fs.doc('aceites/'+FBX.email).set({ultimo:ts()},{merge:true}).catch(()=>{})}
  auth.onAuthStateChanged(async u=>{
    if(!u){if(started){location.reload();return}if(completingLink)return;gate('login');return}
    const email=String(u.email||u.phoneNumber||'').toLowerCase();
    if(started){if(email!==FBX.email)location.reload();return}
    gate('espera','Verificando acesso de '+(email.startsWith('+')?fmtTelBR(email):email)+'…');
    let papel=null;
    if(email===OWNER)papel='admin';
    let pubId=null,lido=false;
    try{const d=await fs.doc('acesso/'+email).get();lido=true;if(d.exists){const x=d.data()||{};if(email!==OWNER)papel=x.papel||'leitor';pubId=x.pub||null}}catch(e){}
    /* sem internet: usa o último acesso conferido neste aparelho */
    const cc=cacheGet(email);if(!lido&&cc){papel=papel||cc.papel;pubId=cc.pubId||null}
    if(!papel){
      /* registra o pedido de acesso para os administradores verem (e serem avisados) */
      if(lido)fs.doc('pedidos/'+email).set({nome:String(u.displayName||'').slice(0,120),ultimo:ts(),vezes:firebase.firestore.FieldValue.increment(1)},{merge:true}).catch(()=>{});
      gate('negado',email);return}
    FBX.email=email;FBX.papel=papel;FBX.pubId=pubId;FBX.nome=u.displayName||'';
    if(papel==='publicador'&&!pubId){gate('erro','Seu acesso ainda não foi ligado a um cadastro de publicador. Peça a um administrador para fazer a ligação em Ajustes › Acesso ao sistema.');return}
    let ok=false,lidoA=false;try{const a=await fs.doc('aceites/'+email).get();lidoA=true;ok=a.exists&&((a.data()||{}).versao||0)>=TERMOS_V}catch(e){}
    if(!lidoA&&cc&&cc.aceite>=TERMOS_V)ok=true;
    if(ok)cacheSet({email,papel,pubId,aceite:TERMOS_V});
    if(!ok){gate('termos');return}
    enter();
  });
  FBX.signOut=()=>{try{localStorage.removeItem(CACHEK)}catch(e){}return auth.signOut()};
  FBX.ts=ts;
  FBX.quiet=false;
  FBX.log=(acao,col,id)=>{if(FBX.quiet)return Promise.resolve();return fs.collection('registro').add({acao,col,id:String(id),por:FBX.email,nome:FBX.nome||'',em:ts()}).catch(()=>{})};
  FBX.recent=(cb,err)=>fs.collection('registro').orderBy('em','desc').limit(40).onSnapshot(s=>cb(s.docs.map(d=>d.data())),err);
  /* cópias automáticas, registro de erros e teste de conexão (veja "Cuidados do sistema") */
  FBX.copias={listar:(cb,err)=>fs.collection('copias').orderBy('em','desc').limit(12).onSnapshot(s=>cb(s.docs.map(d=>Object.assign({id:d.id},d.data()))),err),
    salvar:(id,dados,n,auto)=>fs.doc('copias/'+id).set({dados,n,auto:!!auto,por:FBX.email,em:ts()}),apagar:id=>fs.doc('copias/'+id).delete()};
  FBX.erro=d=>fs.collection('erros').add(Object.assign({},d,{por:FBX.email,em:ts()}));
  FBX.erros={listar:(cb,err)=>fs.collection('erros').orderBy('em','desc').limit(30).onSnapshot(s=>cb(s.docs.map(d=>Object.assign({id:d.id},d.data()))),err),apagar:id=>fs.doc('erros/'+id).delete()};
  FBX.ping=()=>fs.doc('publico/info').get({source:'server'});
  FBX.pedidos={listar:(cb,err)=>fs.collection('pedidos').onSnapshot(s=>cb(s.docs.map(d=>Object.assign({id:d.id},d.data()))),err),apagar:id=>fs.doc('pedidos/'+id).delete()};
  FBX.listAccess=(cb,err)=>fs.collection('acesso').onSnapshot(s=>cb(s.docs.map(d=>Object.assign({email:d.id},d.data()))),err);
  FBX.listAceites=(cb,err)=>fs.collection('aceites').onSnapshot(s=>{const m={};s.docs.forEach(d=>m[d.id]=d.data());cb(m)},err);
  FBX.setAccess=(email,papel,pub)=>{const d={papel,por:FBX.email,em:new Date().toISOString()};if(pub!==undefined)d.pub=pub||null;return fs.doc('acesso/'+email.toLowerCase()).set(d,{merge:true})};
  FBX.setResposta=(k,d)=>fs.doc('respostas/'+k).set(Object.assign({},d,{por:FBX.email,nome:FBX.nome||'',em:ts()}));
  FBX.delResposta=k=>fs.doc('respostas/'+k).delete();
  FBX.myPubDoc=()=>fs.doc('publicadores/'+FBX.pubId).get().then(d=>d.exists?d.data():null);
  FBX.delAccess=email=>fs.doc('acesso/'+email.toLowerCase()).delete();
  FBX.setPublic=d=>fs.doc('publico/info').set(Object.assign({},FBX.pub,d,{_por:FBX.email,_em:ts()})).then(()=>{FBX.pub=Object.assign({},FBX.pub,d)});
  document.addEventListener('DOMContentLoaded',()=>{if(!started&&!document.getElementById('fbgate'))gate('espera','Conectando…')});
})();