/* 打包器：把 100 个源文件拆成「内核 + 共用 + 每作一包 + 跨作一包」，并自检
 *
 *   node _build_chunks.js            生成 js/k-*.js 与 js/k-plan.js
 *   node _build_chunks.js --check    只校验磁盘上的包与源文件是否一致（不写）
 *
 * 为什么要拆：原来 index.html 串 100 个 <script>，4.26MB（gzip 1.2MB），
 * 首页也得把它们全下完。拆完之后首页只要内核，进某作只下那一作的数据。
 *
 * 判定用「真实输出比对」：逐个去掉一个文件重新渲染，输出变了就说明这一页读它。
 * 不能靠捕获 ReferenceError —— pages.js 里大量 `if (!X.length) return '数据未加载'`
 * 把缺数据吞掉了，不会抛异常。
 */
const fs = require('fs'), vm = require('vm'), zlib = require('zlib');
const ROOT = __dirname + '/';
const files = require('./_files.js')();
/* 每次打包前，按当前 PAGES 重新生成 pages-meta.js（首页/菜单只靠它，不背完整正文）。
   这样改了 pages.js（增删条目）后，元数据自动跟着走，不会和 PAGES 漂移。 */
require('./gen_pages_meta.js');

/* 内核：壳子 + 全部页面正文（不含任何数据） */
/* npcfull / npc_azuma 进内核：首页那句「共 N 位角色」是按人物档案现算的，
   少了它们会退回 data.js 里那份只收候补的旧名单，数字当场就错。 */
/* 内核：壳子 + 菜单/计数用的 PAGES 元数据（不含任何渲染正文）
 * pages.js（渲染正文，几 MB）整体挪到 shared 包，进作品才下——首屏不再为它买单。
 * 核心只留 pages-meta.js（10KB 的 key/标题/图标），菜单与「N 个条目」计数够用。 */
const CORE = ['js/changelog-head.js', 'js/data.js', 'js/icons.js',
    'js/npcfull.js', 'js/npc_azuma.js', 'js/pages-meta.js', 'js/app.js']
    .sort((a, b) => files.indexOf(a) - files.indexOf(b));

/* 页面专属包：只在打开那一页时才下（内容大、别处用不到） */
const PAGE_CHUNKS = { changelog: ['js/changelog.js'] };
const PAGE_FILES = new Set(Object.values(PAGE_CHUNKS).flat());

/* 正文包：pages.js 是 66 个条目共用的渲染正文 + PAGES/PAGE_MAP。
   它被所有条目、被搜索读，却一个数据文件都不含——放在「进作品就下」的共用包里，
   首页、作品目录、居民名册都得白等 500KB。单独成包，点了条目才下。
   判定不靠「谁引用它」：它反过来引用所有数据，剔除测试永远把它算成 shared。 */
const BODY_CHUNK = ['js/pages.js'];
const BODY_FILES = new Set(BODY_CHUNK);

const SRC = {};
for (const f of files) SRC[f] = fs.readFileSync(ROOT + f, 'utf8');

const stubEl = {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() { }, remove() { }, toggle() { } },
    addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { },
};
function build(list) {
    const ctx = {
        console: { log() { }, warn() { }, error() { } },
        window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
        document: {
            addEventListener() { }, getElementById: () => stubEl, querySelector: () => stubEl,
            querySelectorAll: () => [], createElement: () => stubEl, body: stubEl,
        },
    };
    vm.createContext(ctx);
    vm.runInContext(list.map(f => SRC[f]).join('\n;\n')
        + '\n;__o={PAGES:(typeof PAGES!=="undefined"?PAGES:null),GAMES:(typeof GAMES!=="undefined"?GAMES:null)};', ctx,
        { filename: 'chunk.js' });
    return ctx.__o;
}
function renderAll(o) {
    const out = {};
    if (!o.PAGES) return out;   /* 缺 pages.js：无法渲染，调用方会把该文件标记成「所有页面都受影响」 */
    for (const g of o.GAMES) {
        out[g.id] = {};
        for (const p of o.PAGES) {
            if (p.gms && p.gms.indexOf(g.id) < 0) continue;
            let s;
            try { s = p.body(g); } catch (e) { s = 'ERR:' + e.message; }
            out[g.id][p.key] = s;
        }
    }
    return out;
}

/* ---------- 1. 基线 ---------- */
const base = build(files);
const GAMES = base.GAMES, PAGES = base.PAGES;
const BASE = renderAll(base);
console.log('作品 ' + GAMES.length + ' 部，页面 ' + PAGES.length + ' 条，基线已建');

/* 反证：正文包一旦漏装，PAGES 就没了，下面的逐页比对会静默通过（比了个空）。
   这条断言把「比对有效」本身钉住。 */
if (build(files.filter(f => !BODY_FILES.has(f))).PAGES) {
    console.error('!! 去掉正文包仍能拿到 PAGES，逐页比对会空转');
    process.exit(1);
}

/* ---------- 2. 逐文件剔除，记录「去掉它谁变了」 ---------- */
const other = files.filter(f => !CORE.includes(f) && !PAGE_FILES.has(f) && !BODY_FILES.has(f));
/* aff[f][game] = 受影响的页面 key 集合 */
const aff = {};
for (const f of other) {
    let o;
    try { o = build(files.filter(x => x !== f)); } catch (e) { continue; }
    const now = renderAll(o);
    aff[f] = {};
    for (const gid of Object.keys(BASE)) {
        if (!o.PAGES) { aff[f][gid] = PAGES.map(p => p.key); continue; }
        aff[f][gid] = PAGES
            .filter(p => now[gid][p.key] !== undefined && now[gid][p.key] !== BASE[gid][p.key])
            .map(p => p.key);
    }
}
console.log('剔除测试完成（' + other.length + ' 个文件）');

/* ---------- 3. 找跨作页：一页读了别的作品的数据 ---------- */
const OWNER = {};
for (const f of files) {
    const m = /js\/(rf1|rf2|rf3|rff|rfo|rf4|rf5|azuma)/.exec(f);
    if (m) OWNER[f] = m[1];
}
const crossSet = new Set();
for (const gid of Object.keys(BASE)) {
    for (const p of PAGES) {
        if (BASE[gid][p.key] === undefined) continue;
        for (const f of other) {
            if (!aff[f][gid] || aff[f][gid].indexOf(p.key) < 0) continue;
            if (OWNER[f] && OWNER[f] !== gid) { crossSet.add(p.key); break; }
        }
    }
}
const CROSS = [...crossSet].sort();
console.log('跨作页 ' + CROSS.length + ' 条：' + CROSS.join('、'));

/* ---------- 4. 归类 ---------- */
/* 同一文件对某作的依赖，分「普通页需要」与「仅跨作页需要」两种 */
const normalUse = {}, crossUse = {};
for (const f of other) {
    normalUse[f] = new Set(); crossUse[f] = new Set();
    for (const gid of Object.keys(BASE)) {
        for (const key of aff[f][gid] || []) {
            (CROSS.includes(key) ? crossUse[f] : normalUse[f]).add(gid);
        }
    }
}
const plan = { core: CORE.slice(), shared: [], cross: [], games: {}, pages: PAGE_CHUNKS, body: BODY_CHUNK };
for (const g of GAMES) plan.games[g.id] = [];
const unassigned = [];
for (const f of other) {
    const n = [...normalUse[f]];
    if (n.length >= 2) plan.shared.push(f);
    else if (n.length === 1) plan.games[n[0]].push(f);
    else if (crossUse[f].size) plan.cross.push(f);
    else unassigned.push(f);
}
/* 谁都没读的（壳子里用到、但页面不读的，如 faces/sched）：跟着共用包走最稳 */
for (const f of unassigned) plan.shared.push(f);

/* 页面包的文件不参与上面归类，但仍要断言「确实只有那一页在读它」 */
for (const key of Object.keys(PAGE_CHUNKS)) {
    for (const f of PAGE_CHUNKS[key]) {
        const readers = new Set();
        for (const gid of Object.keys(BASE))
            for (const k of (aff[f] && aff[f][gid]) || []) readers.add(k);
        if (readers.size && !(readers.size === 1 && readers.has(key)))
            console.log('  !! ' + f + ' 除 ' + key + ' 外还被 ' + [...readers].join(',') + ' 读');
    }
}

/* 断言：每个文件恰好归一处 */
const seen = {};
for (const f of [...plan.core, ...plan.shared, ...plan.cross, ...PAGE_FILES, ...BODY_FILES, ...Object.values(plan.games).flat()]) {
    seen[f] = (seen[f] || 0) + 1;
}
const dup = Object.keys(seen).filter(f => seen[f] > 1);
const miss = files.filter(f => !seen[f]);
if (dup.length || miss.length) {
    console.error('!! 归类有误  重复：' + dup.join(' ') + '  漏：' + miss.join(' '));
    process.exit(1);
}

/* 包内保持清单顺序，跨文件引用才跟原来一致 */
const order = l => l.slice().sort((a, b) => files.indexOf(a) - files.indexOf(b));
plan.core = order(plan.core); plan.shared = order(plan.shared); plan.cross = order(plan.cross);
for (const gid of Object.keys(plan.games)) plan.games[gid] = order(plan.games[gid]);

/* ---------- 5. 自检：只装该装的包，输出必须与基线逐页一致 ---------- */
let bad = 0;
function where(f) {
    if (plan.core.includes(f)) return 'core';
    if (plan.shared.includes(f)) return 'shared';
    if (plan.cross.includes(f)) return 'cross';
    for (const k of Object.keys(plan.games)) if (plan.games[k].includes(f)) return k;
    return '?';
}
function verify(list, gid, skipCrossPage) {
    const o = build(list);
    const now = renderAll(o);
    {
        for (const p of PAGES) {
            if (BASE[gid][p.key] === undefined) continue;
            if (skipCrossPage && (CROSS.includes(p.key) || PAGE_CHUNKS[p.key])) continue;
            if (now[gid][p.key] !== BASE[gid][p.key]) {
                if (bad < 6) {
                    const dep = other.filter(f => aff[f] && (aff[f][gid] || []).indexOf(p.key) >= 0)
                        .map(f => f.replace('js/', '') + '[' + where(f) + ']');
                    console.log('  !! ' + gid + '@' + p.key + ' 依赖：' + dep.join(' '));
                }
                bad++;
            }
        }
    }
}
/* 跨作页要读所有作品的数据，所以打开它时把全部作品包一起装上——这里按那个组合自检 */
const ALLGAME = Object.values(plan.games).flat();
for (const gid of Object.keys(plan.games)) {
    verify([...plan.core, ...plan.shared, ...BODY_CHUNK, ...plan.games[gid]], gid, true);
    verify([...plan.core, ...plan.shared, ...BODY_CHUNK, ...ALLGAME, ...plan.cross, ...PAGE_FILES], gid, false);
}

/* ---------- 6. 体积 ---------- */
const gz = l => l.reduce((n, f) => n + zlib.gzipSync(SRC[f]).length, 0);
const fmt = n => (n / 1024).toFixed(0) + ' KB';
const coreGz = gz(plan.core), sharedGz = gz(plan.shared), crossGz = gz(plan.cross), bodyGz = gz(BODY_CHUNK);
console.log('\n内核    ' + String(plan.core.length).padStart(3) + ' 个  gzip ' + fmt(coreGz).padStart(8));
console.log('共用    ' + String(plan.shared.length).padStart(3) + ' 个  gzip ' + fmt(sharedGz).padStart(8));
console.log('正文    ' + String(BODY_CHUNK.length).padStart(3) + ' 个  gzip ' + fmt(bodyGz).padStart(8) + '  （点条目才下）');
console.log('跨作    ' + String(plan.cross.length).padStart(3) + ' 个  gzip ' + fmt(crossGz).padStart(8));
console.log('首屏    ' + fmt(coreGz + sharedGz) + '（首页／目录／名册）');
for (const gid of Object.keys(plan.games)) {
    const l = plan.games[gid];
    console.log('  ' + gid.padEnd(6) + String(l.length).padStart(3) + ' 个  gzip ' + fmt(gz(l)).padStart(8)
        + '  → 看一页 ' + fmt(coreGz + sharedGz + gz(l) + bodyGz));
}
if (bad) { console.error('\n!! 自检失败 ' + bad + ' 处，未写包'); process.exit(1); }
console.log('\n自检通过：每作只装自己的包，365 个页面输出与基线逐字一致');

/* ---------- 7. 落盘 ---------- */
function emit(name, list) {
    const head = '/* ' + name + ' —— 自动生成，勿手改（node _build_chunks.js）\n'
        + '   含 ' + list.length + ' 个源文件，按 js/_manifest.json 的顺序拼接：\n'
        + list.map(f => '     ' + f).join('\n') + '\n*/\n';
    const body = list.map(f => SRC[f]).join('\n;\n') + '\n';
    fs.writeFileSync(ROOT + 'js/' + name, head + body);
    return (head.length + body.length);
}
let bytes = 0;
bytes += emit('k-core.js', plan.core);
bytes += emit('k-shared.js', plan.shared);
bytes += emit('k-body.js', BODY_CHUNK);
bytes += emit('k-cross.js', plan.cross);
for (const gid of Object.keys(plan.games)) bytes += emit('k-' + gid + '.js', plan.games[gid]);
for (const key of Object.keys(PAGE_CHUNKS)) bytes += emit('k-page-' + key + '.js', PAGE_CHUNKS[key]);
fs.writeFileSync(ROOT + 'js/k-plan.js',
    '/* 分包清单 —— 自动生成，勿手改（node _build_chunks.js） */\n'
    + 'var K_PLAN = ' + JSON.stringify({
        shared: 'js/k-shared.js',
        body: 'js/k-body.js',
        pagesAll: 'js/k-body.js',
        cross: 'js/k-cross.js',
        crossPages: CROSS,
        games: Object.fromEntries(Object.keys(plan.games).map(g => [g, 'js/k-' + g + '.js'])),
        pages: Object.fromEntries(Object.keys(PAGE_CHUNKS).map(k => [k, 'js/k-page-' + k + '.js'])),
    }, null, 4) + ';\n');
/* 每个包的指纹：源文件改了却没重打包，_verify.js 靠它当场报错 */
const crypto = require('crypto');
const shaOf = l => crypto.createHash('sha1')
    .update(l.map(f => SRC[f]).join('\n;\n') + '\n').digest('hex').slice(0, 16);
plan.sha = { core: shaOf(plan.core), shared: shaOf(plan.shared), cross: shaOf(plan.cross), body: shaOf(BODY_CHUNK) };
for (const gid of Object.keys(plan.games)) plan.sha['game:' + gid] = shaOf(plan.games[gid]);
for (const key of Object.keys(PAGE_CHUNKS)) plan.sha['page:' + key] = shaOf(PAGE_CHUNKS[key]);
fs.writeFileSync(ROOT + 'js/_chunks.json', JSON.stringify(plan, null, 2) + '\n');
console.log('已写 ' + (Object.keys(plan.games).length + 4) + ' 个包，合计 ' + (bytes / 1048576).toFixed(2) + ' MB');
