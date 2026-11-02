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

    function plan() {
        return (typeof K_PLAN !== 'undefined' && K_PLAN) ? K_PLAN : null;
    }

    function one(src) {
        if (!src || loaded[src]) return Promise.resolve();
        if (pending[src]) return pending[src];
        pending[src] = new Promise(function (ok, fail) {
            var el = document.createElement('script');
            el.src = src;
            el.async = false;          /* 动态插入默认 async，会打乱「共用包在前」的顺序 */
            el.onload = function () { loaded[src] = 1; ok(); };
            el.onerror = function () { fail(new Error('载入失败：' + src)); };
            (document.head || document.documentElement).appendChild(el);
        });
        return pending[src];
    }

    /* 必须按顺序执行：包内是顶层 const，后一个包可能引用前一个包的全局 */
    function seq(list) {
        return list.reduce(function (p, s) {
            return p.then(function () { return one(s); });
        }, Promise.resolve());
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
        /* need = { game, page, cross } */
        ready: function (need) {
            var P = plan();
            if (!P) return Promise.resolve();
            var list = [P.shared];
            if (need.game && P.games[need.game]) list.push(P.games[need.game]);
            if (need.page && P.pages[need.page]) list.push(P.pages[need.page]);
            if (need.cross) {
                /* 跨作页要读所有作品的数据，一作都不能少 */
                Object.keys(P.games).forEach(function (k) { list.push(P.games[k]); });
                list.push(P.cross);
            }
            /* 去重，且保证共用包在最前 */
            var seen = {}, out = [];
            list.forEach(function (s) { if (s && !seen[s]) { seen[s] = 1; out.push(s); } });
            return seq(out);
        },
        /* 调试/审计用：报告当前载入了哪些包 */
        report: function () { return Object.keys(loaded); },
    };
})();
