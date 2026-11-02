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
const CACHE = 'rfwiki-swr-v1';
const PRECACHE = [
    './',
    'index.html',
    'js/k-plan.js',
    'js/k-loader.js',
    'js/k-core.js',
    'css/main.css',
    'css/content.css',
    'css/todo.css',
    'css/weui.min.css',
    'assets/icon/icon-192.png',
    'assets/icon/icon-512.png',
    'favicon.ico',
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return c.addAll(PRECACHE).catch(function () { /* 单文件/离线预缓存失败不阻塞安装 */ });
        }).then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (ks) {
            return Promise.all(ks.filter(function (k) { return k !== CACHE; })
                .map(function (k) { return caches.delete(k); }));
        }).then(function () { return self.clients.claim(); })
    );
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
