/* Designar: guarda a página e as bibliotecas no aparelho para abrir rápido e funcionar com internet fraca.
   Os dados (Firebase) não passam por aqui: o próprio Firebase guarda uma cópia no aparelho. */
const CACHE='designar-2026.11.07-2242';
const BASE=['./','index.html','config.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const ESTATICO=/^https:\/\/(cdnjs\.cloudflare\.com|www\.gstatic\.com\/firebasejs|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=r.url;
  /* página: tenta a rede primeiro (para receber as atualizações) e usa a cópia quando não há internet */
  if(r.mode==='navigate'||(u.startsWith(self.location.origin)&&/\/(index\.html)?$/.test(new URL(u).pathname))){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./',c));return res}).catch(()=>caches.match('./').then(m=>m||caches.match('index.html'))));return}
  /* bibliotecas e fontes: usa a cópia e atualiza por trás */
  if(ESTATICO.test(u)||(u.startsWith(self.location.origin)&&/\.(png|webmanifest|js)$/.test(u))){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{const f=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>m);return m||f})))}});
/* avisos das designações (enviados pela tarefa diária do GitHub pelo Firebase Cloud Messaging) */
self.addEventListener('push',e=>{let j={};try{j=e.data?e.data.json():{}}catch(x){j={data:{corpo:e.data?e.data.text():''}}}
  const d=j.data||{},n=j.notification||{};const t=d.titulo||n.title||'Designar';
  e.waitUntil(self.registration.showNotification(t,{body:d.corpo||n.body||'',icon:'icon-192.png',tag:d.tag||undefined,renotify:!!d.tag,data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const alvo=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs.find(x=>x.url.startsWith(self.registration.scope));
    if(c){return c.focus().then(w=>w&&w.navigate?w.navigate(alvo).catch(()=>w):w)}return self.clients.openWindow(alvo)}))});
