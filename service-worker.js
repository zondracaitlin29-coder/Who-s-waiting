const C='whoswaiting-v3';
const F=['./','./index.html','./manifest.json','./icon-192.png','./badge-96.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});

/* Notification taps. The follow-up data lives in the app's own storage, which the service worker cannot read,
   so every action is handed to the app: by message if it is open, or by a link (?open= / ?done=) if it is closed. */
function hand(type,id){
  return clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    const c=list.find(x=>x.visibilityState==='visible')||list[0];
    if(c){
      c.postMessage({type:type,id:id});
      if(type==='open'||c.visibilityState!=='visible')return c.focus();
      return;
    }
    return clients.openWindow('./?'+type+'='+encodeURIComponent(id));
  });
}
self.addEventListener('notificationclick',e=>{
  const d=e.notification.data||{};
  e.notification.close();
  if(!d.id)return e.waitUntil(clients.openWindow('./'));
  e.waitUntil(hand(e.action==='done'?'done':'open',d.id));
});
