// LifeBoard — service worker simples (rede primeiro).
// Só cuida de arquivos do próprio site (mesma origem, dentro do escopo).
// Supabase, CDNs e qualquer outro domínio passam direto: nada de dados fica guardado aqui.
// A cópia guardada só é usada quando não há internet; com internet sempre vem a versão nova.
const CACHE = 'lifeboard-v1';
const ESCOPO = self.registration.scope;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !req.url.startsWith(ESCOPO)) return;
  const resto = req.url.slice(ESCOPO.length);
  if (resto.startsWith('teste/')) return; // o ambiente de teste tem o próprio service worker
  if (url.search.includes('code=') || url.hash) return; // volta do login: não interferir
  const chave = url.origin + url.pathname; // sem ?/# — cada página guarda só a última versão
  e.respondWith((async () => {
    try {
      const resp = await fetch(req);
      if (resp.ok && resp.type === 'basic') {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(chave, copia)).catch(() => {});
      }
      return resp;
    } catch (err) {
      const c = await caches.open(CACHE);
      const salvo = (await c.match(chave)) || (req.mode === 'navigate' ? await c.match(ESCOPO) : null);
      if (salvo) return salvo;
      throw err;
    }
  })());
});
