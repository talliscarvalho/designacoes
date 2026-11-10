/* endereço antigo: apaga o cache, desliga o service worker e leva as telas abertas para o endereço novo */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())await caches.delete(k);
  await self.registration.unregister();
  for(const c of await self.clients.matchAll({type:'window'}))c.navigate('https://jorrinhotucano.github.io/').catch(()=>{});
})()));
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(Response.redirect('https://jorrinhotucano.github.io/',302))});
