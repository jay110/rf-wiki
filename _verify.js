/* 本地渲染校验：按 index.html 的顺序加载所有 js，逐页调 body() 检查异常 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const files = require('./_files.js')();
console.log('脚本数', files.length);

/* ---------- 0. 分包是否过期 ----------
   index.html 现在只引 js/k-*.js，改了源文件却没重打包，线上就是旧内容。
   这里按 js/_chunks.json 里记的指纹重算一遍，对不上直接判失败。 */
(function checkChunks() {
    const cp = ROOT + 'js/_chunks.json';
    if (!fs.existsSync(cp)) { console.log('!! 缺 js/_chunks.json，先跑 node _build_chunks.js'); process.exitCode = 1; return; }
    const plan = JSON.parse(fs.readFileSync(cp, 'utf8'));
    const crypto = require('crypto');
    const shaOf = l => crypto.createHash('sha1')
        .update(l.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n;\n') + '\n')
        .digest('hex').slice(0, 16);
    const pairs = [['core', plan.core], ['shared', plan.shared], ['cross', plan.cross], ['body', plan.body]];
    for (const gid of Object.keys(plan.games || {})) pairs.push(['game:' + gid, plan.games[gid]]);
    for (const k of Object.keys(plan.pages || {})) pairs.push(['page:' + k, plan.pages[k]]);
    const stale = pairs.filter(([k, l]) => plan.sha && plan.sha[k] !== shaOf(l));
    if (stale.length) {
        console.log('!! 包已过期（' + stale.map(x => x[0]).join('、') + '），跑 node _build_chunks.js');
        process.exitCode = 1;
    } else {
        console.log('分包 ' + pairs.length + ' 个，与源文件一致');
    }
})();


/* ---------- 0b. 行尾 ----------
   这四个文件是手改的主力，一直是 CRLF；某次用脚本/编辑器整篇重写会悄悄变成裸 LF，
   整份文件在 git 里就成了「全改」，review 时什么都看不出来。这里直接钉死。 */
{
    const must = ['js/pages.js', 'js/app.js', 'js/data.js', 'js/changelog.js'];
    const bad = [];
    for (const f of must) {
        const b = fs.readFileSync(ROOT + f);
        let crlf = 0, lf = 0;
        for (let i = 0; i < b.length; i++) if (b[i] === 10) (i > 0 && b[i - 1] === 13) ? crlf++ : lf++;
        if (lf) bad.push(f + '（裸 LF ' + lf + ' 行）');
    }
    if (bad.length) {
        console.log('!! 行尾不是 CRLF：' + bad.join('、'));
        process.exitCode = 1;
    } else {
        console.log('行尾 CRLF ' + must.length + ' 个文件');
    }
}

/* ---------- 0c. 离线预缓存清单 ----------
   sw.js 的 PRECACHE 里只要有一条路径不存在，装 SW 时就会白打一次 404；
   更早的写法用 cache.addAll，一条失败会让整套预缓存整体 reject，
   离线其实是坏的，但控制台只有一行被 catch 吞掉的报错。这里钉死清单与实际文件一致。 */
{
    const src = fs.readFileSync(ROOT + 'sw.js', 'utf8');
    const m = src.match(/const PRECACHE = \[([\s\S]*?)\];/);
    if (!m) {
        console.log('!! sw.js 里找不到 PRECACHE 清单');
        process.exitCode = 1;
    } else {
        const list = (m[1].match(/'[^']*'/g) || []).map(s => s.slice(1, -1));
        const miss = list.filter(u => u !== './' && !fs.existsSync(ROOT + u));
        if (miss.length) {
            console.log('!! 预缓存清单里有不存在的文件：' + miss.join('、'));
            process.exitCode = 1;
        } else {
            console.log('预缓存 ' + list.length + ' 项，全部存在');
        }
        if (/c\.addAll\(/.test(src)) {
            console.log('!! sw.js 又用回 cache.addAll：一条 404 会让整套预缓存失效');
            process.exitCode = 1;
        }
    }
}

const stubEl = { innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { } };
const ctx = {
    console,
    window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: {
        addEventListener() { }, getElementById: () => stubEl, querySelector: () => stubEl,
        querySelectorAll: () => [], createElement: () => stubEl, body: stubEl,
    },
};
vm.createContext(ctx);
let src = files.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n;\n');
const NAMES = ['PAGES', 'GAMES', 'GROUPS', 'CN_RFO', 'CN_RFF_PERSON', 'CN_RFF_PLACE', 'CN_RFF_ITEM', 'CN_RFF_MISC',
    'CN_RF1_ITEM', 'CN_RF1_NPC', 'CN_RF1_PLACE', 'CN_RF1_EVENT', 'CN_RF1_KIND', 'CN_RF1_ABI', 'CN_RF1_TYPE', 'CN_RF1_ATTR'];
src += '\n;' + NAMES.map(n => `__o.${n} = (typeof ${n} !== "undefined") ? ${n} : null;`).join('\n');
ctx.__o = {};
vm.runInContext(src, ctx, { filename: 'bundle.js' });
const O = ctx.__o;

NAMES.forEach(n => console.log('  ' + n, O[n] ? (Array.isArray(O[n]) ? O[n].length + ' 条' : 'ok') : '未定义'));

const GAMES = O.GAMES || [];
const PAGES = O.PAGES || [];
const only = process.argv[2];
let bad = 0, checked = 0;
for (const p of PAGES) {
    if (only && p.key !== only) continue;
    if (p.gms) {
        for (const gid of p.gms) {
            const g = GAMES.find(x => x.id === gid);
            if (!g) { console.log('!! 未知作品 ' + gid + ' @' + p.key); bad++; continue; }
            check(p.key + '/' + gid, p.body(g));
        }
    } else {
        for (const g of GAMES) check(p.key + '/' + g.id, p.body(g));
    }
}
function check(name, htmlstr) {
    checked++;
    const issues = [];
    if (/undefined/.test(htmlstr)) issues.push('undefined');
    if (/NaN/.test(htmlstr)) issues.push('NaN');
    if (/\[object Object\]/.test(htmlstr)) issues.push('[object Object]');
    if (/null/.test(htmlstr)) issues.push('null');
    if (issues.length) { console.log('!! ' + name + ' → ' + issues.join(', ')); bad++; }
}
console.log('检查页面实例', checked, '异常', bad);

/* 头像表自检：FACE 里写的每个键都得有对应的 png，且不是空文件。
   破图比没有头像难看得多——宁可退回首字色块，所以这里一律当错误报出来。 */
if (!only) {
    const FACE = ctx.FACE || {};
    let fok = 0, fbad = 0;
    for (const gid of Object.keys(FACE)) {
        for (const [jp, key] of Object.entries(FACE[gid])) {
            const p = ROOT + 'assets/face/' + gid + '/' + key + '.png';
            let sz = 0;
            try { sz = fs.statSync(p).size; } catch (e) { }
            if (sz > 100) { fok++; continue; }
            console.log('!! 头像缺失 ' + gid + '/' + key + '（' + jp + '）');
            fbad++;
        }
    }
    console.log('头像', Object.keys(FACE).length + ' 作', fok + ' 张，缺', fbad);
    bad += fbad;
}

// 抽查新页
if (!only) {
    const p = PAGES.find(x => x.key === 'zhname');
    ['rf1', 'rff', 'rfo'].forEach(id => {
        const g = GAMES.find(x => x.id === id);
        const h = p.body(g);
        console.log('zhname/' + id, '长度', h.length, '表格数', (h.match(/<table/g) || []).length,
            '行数', (h.match(/<tr data-s=/g) || []).length);
    });
}

/* 窄屏布局审计（回归项，默认关闭以免拖慢自检）。
   开启： RFWIKI_LAYOUT_AUDIT=1 node _verify.js
   依赖： 本机装有 Microsoft Edge（自动探测，或用 EDGE_BIN 指定）。
   说明： 用 Edge headless 在 520px 下渲染每页，量 scrollWidth-clientWidth；
          正值＝页面被撑破。宽表应在 .table 容器内横滑，不撑破页面。 */
if (!only && process.env.RFWIKI_LAYOUT_AUDIT) {
    const { execFileSync } = require('child_process');
    const audit = require('./_audit_narrow.js');
    const edge = audit.findEdge();
    if (!edge) {
        console.log('（窄屏审计跳过：未找到 Edge，可用 EDGE_BIN 指定）');
    } else {
        console.log('—— 窄屏布局审计（RFWIKI_LAYOUT_AUDIT=1）——');
        try {
            const out = execFileSync(process.execPath, [ROOT + '_audit_narrow.js', '--edge', edge],
                { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
            process.stdout.write(out);
            if (/溢出 \d+ 处/.test(out) && !/溢出 0 处/.test(out)) bad++;
        } catch (e) {
            process.stdout.write((e.stdout || '') + (e.stderr || ''));
            bad++;
        }
    }
}
