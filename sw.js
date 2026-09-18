// 오프라인용 서비스워커.
// 앱 셸을 전부 미리 받아두고, 그 뒤엔 캐시 우선으로 낸다.
// 코드를 고쳤으면 VERSION 을 올릴 것. (옛 캐시는 activate 때 지운다)
const VERSION = 'v2';
const CACHE = `work-english-${VERSION}`;

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './src/main.js',
  './src/ui.js',
  './src/store.js',
  './src/sync.js',
  './src/a2hs.js',
  './src/engine.js',
  './src/screens/courses.js',
  './src/screens/learn.js',
  './src/screens/lesson.js',
  './src/screens/phrasebook.js',
  './src/screens/profile.js',
  './data/phrases.js',
  './data/pitfalls.js',
  './data/scenarios.js',
  './data/courses.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', e => {
  // cache:'reload' 로 받아야 브라우저 HTTP 캐시의 옛 파일을 그대로 집어넣지 않는다.
  const fresh = SHELL.map(u => new Request(u, { cache: 'reload' }));
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // 스피킹 앱과 AI 첨삭 API 는 서비스워커가 건드리지 않는다.
  const path = new URL(req.url).pathname;
  if (path.startsWith('/api/') || path.startsWith('/speaking')) return;

  // 페이지 이동은 네트워크 우선(새 버전 반영), 실패하면 캐시된 셸
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // 나머지는 캐시 우선 + 백그라운드 갱신
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
