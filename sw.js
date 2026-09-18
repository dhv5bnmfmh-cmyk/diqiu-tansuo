const CACHE="diqiu-shell-v3";
const SHELL=[
  "./manifest.webmanifest",
  "./assets/app-icon.svg",
  "./assets/apple-touch-icon.png",
  "./assets/scenes/s01-night.svg",
  "./assets/scenes/s02-home.svg",
  "./assets/scenes/s03-leave.svg",
  "./assets/scenes/s04-bell.svg",
  "./assets/scenes/s05-wake.svg",
  "./assets/scenes/s06-porridge.svg",
  "./assets/scenes/s07-city.svg",
  "./assets/scenes/s08-end.svg",
  "./assets/scenes/bj002/s01-arrival.svg",
  "./assets/scenes/bj002/s02-qianmen.svg",
  "./assets/scenes/bj002/s03-street.svg",
  "./assets/scenes/bj002/s04-dashilar.svg",
  "./assets/scenes/bj002/s05-ask.svg",
  "./assets/scenes/bj002/s06-clothshop.svg",
  "./assets/scenes/bj002/s07-firstwork.svg",
  "./assets/scenes/bj002/s08-night.svg"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  const url=new URL(req.url);

  // Never intercept narration media. Safari handles byte-range audio directly,
  // which is required for stable background and lock-screen playback.
  if(req.headers.has("range") || url.pathname.endsWith(".mp3")) return;
  if(req.method!=="GET" || url.origin!==self.location.origin) return;

  // Navigations are network-first so users immediately receive the newest app.
  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(cache=>cache.put("./",copy));
        return res;
      }).catch(()=>caches.match("./"))
    );
    return;
  }

  // Static visual shell is cache-first.
  event.respondWith(
    caches.match(req).then(hit=>hit || fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(cache=>cache.put(req,copy));
      return res;
    }))
  );
});