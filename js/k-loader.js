/* 按需加载：进哪一作、打开哪一页，才下哪个包
 *
 * 原来 index.html 串了 100 个 <script>，首页也要把它们全下完（4.26MB / gzip 1.2MB）。
 * 现在只引本文件与 k-core.js 两个包，剩下的按路由要：
 *   - 进某作：k-shared.js + k-<作品>.js
 *   - 打开跨作页（系列对照／节日／战斗）：再加全部作品包 + k-cross.js
 *   - 打开更新日志：加 k-page-changelog.js
 *
 * 清单在 js/k-plan.js（打包时生成）。K_PLAN 允许为 null —— 离线单文件版和窄屏审计页
 * 会把所有包直接铺进页面，那时不需要、也不能再动态加载。
 */
var K = (function () {
    var loaded = {}, pending = {};

    /* 载入进度：只在「这一次真的要下几个包」时回调，界面拿它画进度条。
       粒度只能到包——SCRIPT 标签没有下载进度事件，一条 608KB 的正文包中间那几秒
       要由界面自己往前补，否则条子会停住，看着跟死了一样。 */
    var progressCbs = [];
    function emit(done, total) {
        for (var i = 0; i < progressCbs.length; i++) {
            try { progressCbs[i](done, total); } catch (e) { }
        }
    }

    function plan() {
        return (typeof K_PLAN !== 'undefined' && K_PLAN) ? K_PLAN : null;
    }

    /* 单个包的加载超时。SCRIPT 标签偶尔会既不 load 也不 error：
       切 Service Worker 版本时旧缓存被删、请求正卡在中间，就会这样。
       没有这道闸，K.ready 的 Promise 永远不落定，页面就一直停在「正在载入资料」。
       超时后 reject，render() 的 catch 会把页面画出来（缺数据的页自己有提示）。 */
    /* 20 秒：正文包 608KB 在很慢的网络上要这么久，闸门太紧会把正常加载误判成卡死。 */
    var TIMEOUT = 20000;

    function one(src) {
        if (!src || loaded[src]) return Promise.resolve();
        if (pending[src]) return pending[src];
        pending[src] = new Promise(function (ok, fail) {
            var el = document.createElement('script');
            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                delete pending[src];        /* 删掉才能重试；留着只是一句写死的 reject */
                fail(new Error('载入超时：' + src));
            }, TIMEOUT);
            el.src = src;
            el.async = false;          /* 动态插入默认 async，会打乱「共用包在前」的顺序 */
            el.onload = function () {
                clearTimeout(timer);
                loaded[src] = 1;            /* 超时后姗姗来迟也算载入成功，下次不必重下 */
                if (done) return;
                done = true; ok();
            };
            el.onerror = function () {
                clearTimeout(timer);
                if (done) return;
                done = true;
                delete pending[src];
                fail(new Error('载入失败：' + src));
            };
            (document.head || document.documentElement).appendChild(el);
        });
        return pending[src];
    }

    return {
        has: function (id) {
            var P = plan();
            if (!P) return true;
            var src = P.games && P.games[id];
            return src ? !!loaded[src] : true;
        },
        hasPage: function (key) {
            var P = plan();
            if (!P) return true;
            var src = P.pages && P.pages[key];
            return src ? !!loaded[src] : true;
        },
        hasCross: function () {
            var P = plan();
            if (!P) return true;
            return !!loaded[P.cross];
        },
        /* 人物档案包（NPC_FULL / NPC_AZUMA）：居民名册、角色详情、按人拆的页要它。
           首页与目录只要「N 位角色」这个数，已在 pages-meta.js 的 NPC_STAT 里备好。 */
        hasNpc: function () {
            var P = plan();
            if (!P) return true;
            return !P.npc || !!loaded[P.npc];
        },
        /* 正文包（PAGES + PAGE_MAP）：只有真正要画条目正文和跑搜索时才需要 */
        hasBody: function () {
            var P = plan();
            if (!P) return true;
            return !P.pagesAll || !!loaded[P.pagesAll];
        },
        /* need = { game, page, cross, pages, npc } */
        ready: function (need) {
            var P = plan();
            if (!P) return Promise.resolve();
            /* 人物包排在最前：正文包里不少页会读 NPC_FULL，顺序反了会读到空 */
            var list = [];
            if (need.npc && P.npc) list.push(P.npc);
            list.push(P.shared);
            if (need.game && P.games[need.game]) list.push(P.games[need.game]);
            if (need.page && P.pages[need.page]) list.push(P.pages[need.page]);
            if (need.pages && P.pagesAll) list.push(P.pagesAll);
            if (need.cross) {
                /* 跨作页要读所有作品的数据，一作都不能少 */
                Object.keys(P.games).forEach(function (k) { list.push(P.games[k]); });
                list.push(P.cross);
            }
            /* 去重，且保证共用包在最前 */
            var seen = {}, out = [];
            list.forEach(function (s) { if (s && !seen[s]) { seen[s] = 1; out.push(s); } });

            /* 已经在本地的包不用等，也别占进度：总分母只算这次真的要下的 */
            var todo = out.filter(function (s) { return !loaded[s]; });
            if (!todo.length) return Promise.resolve();
            emit(0, todo.length);
            var done = 0;
            /* 必须按顺序执行：包内是顶层 const，后一个包可能引用前一个包的全局 */
            return todo.reduce(function (p, s) {
                return p.then(function () {
                    return one(s).then(function () { emit(++done, todo.length); });
                });
            }, Promise.resolve());
        },
        /* 界面订阅载入进度（done, total）；ready 开始时先报一次 0/total */
        onProgress: function (f) {
            if (typeof f === 'function' && progressCbs.indexOf(f) < 0) progressCbs.push(f);
        },
        offProgress: function (f) {
            var i = progressCbs.indexOf(f);
            if (i >= 0) progressCbs.splice(i, 1);
        },
        /* 立刻取正文包：鼠标悬停到条目上时用。用户已经表现出「要点」的意图，
           这时候不该再等 idle——等到点击才发起，608KB 就是干等。 */
        now: function () {
            var P = plan();
            if (!P || !P.pagesAll || loaded[P.pagesAll] || pending[P.pagesAll]) return;
            one(P.pagesAll).catch(function () { });
        },
        /* 空闲预热：首屏画完后趁浏览器闲着把正文包取下来，点条目就不用等。
           只做一次；省流模式与 2G/3G 不碰——那是用户的流量，不是我们的带宽。 */
        warm: function () {
            var P = plan();
            if (!P || !P.pagesAll || loaded[P.pagesAll]) return;
            if (typeof requestIdleCallback !== 'function') return;
            var c = navigator.connection || navigator.mozConnection || null;
            if (c && (c.saveData || /^(slow-2g|2g|3g)$/.test(c.effectiveType || ''))) return;
            requestIdleCallback(function () { K.now(); }, { timeout: 4000 });
        },
        /* 调试/审计用：报告当前载入了哪些包 */
        report: function () { return Object.keys(loaded); },
    };
})();
