/* 符文工房攻略百科 —— Service Worker
 *
 * 策略：stale-while-revalidate（先返回缓存、后台静默更新）。
 *   - 首访：缓存为空则走网络，并把资源存进缓存；
 *   - 回访：缓存命中，立即返回（秒开），同时后台拉新；
 *   - 离线：缓存兜底，整站可用（首屏壳 + 已浏览过的作品数据）。
 * 导航请求（index.html）同样先给缓存壳，后台刷新，离线也不白屏。
 *
 * 升级：改了 index.html / 本文件后，把下方 CACHE 版本号 +1，activate 会清掉旧缓存重预热。
 * 常规数据更新（k-*.js 内容变、文件名不变）由 SWR 自动处理，无需改版本号。
 */
const CACHE = 'rfwiki-swr-v5';
/* 预缓存清单：这里列出的每个路径都必须真实存在，否则会白白发一次 404。
 * 逐条 add 而不是 addAll —— addAll 只要有一条失败就整体 reject，
 * 一个失效路径就能让整套离线缓存悄悄失效。 */
const PRECACHE = [
    './',
    'index.html',
    'js/k-plan.js',
    'js/k-loader.js',
    'js/k-core.js',
    'css/main.css',
    'css/content.css',
    'assets/icon/icon-192.png',
    'assets/icon/apple-touch-icon.png',
    'favicon.ico',
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return Promise.all(PRECACHE.map(function (u) {
                /* 用 cache:'reload' 走网络，别让浏览器 HTTP 缓存把上一版的 index 塞进来。
                   预缓存里存的是旧 HTML —— 后面所有「新资源配旧壳」的怪问题都从这儿起。 */
                return c.add(new Request(u, { cache: 'reload' }))
                    .catch(function () { /* 单条失败不影响其余 */ });
            }));
        }).then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil((async function () {
        /* 顺序要紧：先接管页面，再清旧缓存。
           反过来（先删后 claim）会让页面正挂着的旧缓存请求中途失效 ——
           表现就是页面停在「正在载入资料」，刷新一次又好了。 */
        try { await self.clients.claim(); } catch (err) { }
        const ks = await caches.keys();
        await Promise.all(ks.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); }));
    })());
});

self.addEventListener('fetch', function (e) {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;     /* 跨域（图片 CDN 等）交给浏览器 */

    if (req.mode === 'navigate') {
        /* 导航：优先给缓存壳（离线/秒开），后台刷新 */
        e.respondWith((async function () {
            const cache = await caches.open(CACHE);
            const cached = await cache.match('index.html');
            const fresh = fetch(req).then(function (res) {
                if (res && res.ok) cache.put('index.html', res.clone());
                return res;
            }).catch(function () { return cached; });
            return cached || fresh;
        })());
        return;
    }

    /* 其余静态资源（css/js/图标/按需分包）：stale-while-revalidate */
    e.respondWith((async function () {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        const fresh = fetch(req).then(function (res) {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
        }).catch(function () { return cached; });
        return cached || fresh;
    })());
});
