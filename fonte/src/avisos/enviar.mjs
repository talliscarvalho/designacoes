/* Designar · envio dos avisos no celular
   Roda no GitHub (.github/workflows/avisos.yml), várias vezes ao dia:
   - na primeira vez do dia, envia os lembretes das designações de daqui a 7 dias e de amanhã;
   - em todas as vezes, avisa os administradores de pedidos de acesso novos.
   Precisa do segredo FIREBASE_SERVICE_ACCOUNT (a chave da conta de serviço do Firebase, em JSON). */
import admin from 'firebase-admin';
import {readFileSync} from 'node:fs';

const bruto=process.env.FIREBASE_SERVICE_ACCOUNT||'';
if(!bruto.trim()){console.log('O segredo FIREBASE_SERVICE_ACCOUNT ainda não foi configurado no GitHub. Nada foi enviado.');process.exit(0)}
let sa=null;try{const i=bruto.indexOf('{'),f=bruto.lastIndexOf('}');sa=JSON.parse(bruto.slice(i,f+1))}catch(e){}
if(!sa||sa.type!=='service_account'||!sa.private_key){console.log('O segredo FIREBASE_SERVICE_ACCOUNT não tem a chave certa. Ele deve conter o arquivo .json inteiro baixado em Firebase › Configurações do projeto › Contas de serviço › "Gerar nova chave privada" (começa com { "type": "service_account", ...), e não o trecho de código mostrado nessa página.');process.exit(1)}
admin.initializeApp({credential:admin.credential.cert(sa)});
const db=admin.firestore(),fcm=admin.messaging();
const TESTE=process.env.TESTE==='true',FORCAR=process.env.FORCAR==='true';

let DONO='';try{const c=readFileSync(new URL('../../../config.js',import.meta.url),'utf8');DONO=((/dono\s*:\s*"([^"]+)"/.exec(c)||[])[1]||'').toLowerCase()}catch(e){}
const agoraSP=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));
const hoje=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
const soma=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
const DIAS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const dataBr=d=>{const t=new Date(d+'T12:00:00Z');return DIAS[t.getUTCDay()]+', '+d.slice(8)+'/'+d.slice(5,7)};
const horaTxt=h=>/^\d{1,2}:\d{2}$/.test(h)?' às '+h.replace(':','h').replace(/h00$/,'h'):h?' ('+h+')':'';

const [tokS,acS,pubS,agS,pedS,estS]=await Promise.all([db.collection('avisos').get(),db.collection('acesso').get(),db.collection('publicadores').get(),
  db.doc('quadro/agenda').get(),db.collection('pedidos').get(),db.doc('avisoslog/estado').get()]);
const estado=estS.exists?estS.data():{};
const acesso={};acS.docs.forEach(d=>acesso[d.id]=d.data()||{});
const porEmail={};pubS.docs.forEach(d=>{const e=String((d.data()||{}).email||'').toLowerCase().trim();if(e)porEmail[e]=d.id});
const ehAdmin=q=>q===DONO||(acesso[q]&&acesso[q].papel==='admin');
const pidDe=q=>(acesso[q]&&acesso[q].pub)||porEmail[q]||null;
const agenda=(agS.exists&&agS.data().itens)||{};
/* aparelhos por pessoa */
const aparelhos={};tokS.docs.forEach(d=>{const x=d.data()||{};if(!x.quem||!x.token)return;(aparelhos[x.quem]=aparelhos[x.quem]||[]).push(x.token)});

let enviados=0,falhas=0,removidos=0;
async function enviar(quem,titulo,corpo,url,tag){for(const token of [...(aparelhos[quem]||[])]){
  try{await fcm.send({token,webpush:{headers:{TTL:'86400',Urgency:'high'},data:{titulo,corpo,url:url||'./',tag:tag||''}}});enviados++}
  catch(e){const c=(e&&e.code)||'';if(/registration-token-not-registered|invalid-registration-token/.test(c)){await db.doc('avisos/'+token).delete().catch(()=>{});aparelhos[quem]=aparelhos[quem].filter(t=>t!==token);removidos++}else{falhas++;console.log('Falha ao enviar:',c||e.message)}}}}

if(TESTE){
  const alvo=Object.keys(aparelhos).filter(ehAdmin);
  for(const q of alvo)await enviar(q,'Teste do Designar','Se você está vendo isto, os avisos no celular estão funcionando.','./','designar-teste');
  console.log(`Teste: ${enviados} aviso(s) enviado(s) para ${alvo.length} administrador(es) com avisos ativados.`);process.exit(0)}

/* 1) lembretes das designações: uma vez por dia */
const jaHoje=estado.dia===hoje&&!FORCAR;
if(jaHoje)console.log('Os lembretes de hoje já foram enviados.');
else if(agoraSP.getHours()<7&&!FORCAR)console.log('Ainda é cedo; os lembretes saem a partir das 7h.');
else{
  const QUANDO={[soma(hoje,1)]:'Amanhã',[soma(hoje,7)]:'Daqui a uma semana'};
  for(const quem of Object.keys(aparelhos)){const pid=pidDe(quem);if(!pid||!agenda[pid])continue;
    const its=agenda[pid].map(s=>{const [date,hora,titulo,txt]=String(s).split('|');return{date,hora,titulo,txt}}).filter(it=>QUANDO[it.date]);
    const dias=[...new Set(its.map(it=>it.date))];
    for(const d of dias){const doDia=its.filter(it=>it.date===d);const q=QUANDO[d];
      const titulo=doDia.length===1?`${q}: ${doDia[0].txt}`:`${q}: ${doDia.length} designações`;
      const corpo=doDia.length===1?`${doDia[0].titulo} · ${dataBr(d)}${horaTxt(doDia[0].hora)}`:doDia.map(it=>`${it.txt} (${it.titulo}${horaTxt(it.hora)})`).join('\n')+`\n${dataBr(d)}`;
      await enviar(quem,titulo.slice(0,120),corpo.slice(0,400),'./#painel','designar-'+d)}}
  estado.dia=hoje}

/* 2) pedidos de acesso novos (para os administradores) */
const desde=estado.pedidosAte||0;let maisNovo=desde;
const novos=pedS.docs.map(d=>({id:d.id,...d.data()})).filter(p=>{const t=p.ultimo&&p.ultimo.toMillis?p.ultimo.toMillis():0;if(t>maisNovo)maisNovo=t;return t>desde});
if(novos.length&&desde){const adm=Object.keys(aparelhos).filter(ehAdmin);
  const titulo=novos.length===1?'Pedido de acesso':`${novos.length} pedidos de acesso`;
  const corpo=novos.slice(0,5).map(p=>(p.nome?p.nome+' · ':'')+p.id).join('\n')+'\nAbra Ajustes › Acesso ao sistema para liberar.';
  for(const q of adm)await enviar(q,titulo,corpo,'./#ajustes','designar-pedidos')}
estado.pedidosAte=maisNovo||Date.now();

await db.doc('avisoslog/estado').set({...estado,ultimaVez:admin.firestore.FieldValue.serverTimestamp(),enviados,falhas,removidos},{merge:true});
console.log(`Pronto: ${enviados} aviso(s) enviado(s), ${falhas} falha(s), ${removidos} aparelho(s) desativado(s) removido(s).`);
