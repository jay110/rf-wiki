/* 从 PAGES 自动抽出「仅元数据」桩（key/group/title/icon/gms），写进 js/pages-meta.js。
 *
 * 用途：pages.js 整体从首屏核心挪到 shared 包后，核心仍需 PAGES 的元数据来画菜单与计数，
 * 但不需要几 MB 的渲染正文。本脚本用与 _build_chunks.js 同源的 vm 方法直接求值 PAGES，
 * 取出元数据，不手工解析内联 body，避免出错。
 *
 *   node gen_pages_meta.js
 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const files = require('./_files.js')();

const SRC = {};
for (const f of files) SRC[f] = fs.readFileSync(ROOT + f, 'utf8');

const stubEl = {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() { }, remove() { }, toggle() { } },
    addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { },
};
const ctx = {
    console: { log() { }, warn() { }, error() { } },
    window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: {
        addEventListener() { }, getElementById: () => stubEl, querySelector: () => stubEl,
        querySelectorAll: () => [], createElement: () => stubEl, body: stubEl,
    },
};
vm.createContext(ctx);
vm.runInContext(files.map(f => SRC[f]).join('\n;\n')
    + '\n;__o={PAGES:PAGES,GAMES:GAMES,GROUPS:GROUPS,npcOf:(typeof npcOf==="function"?npcOf:null)};', ctx,
    { filename: 'all.js' });

const PAGES = ctx.__o.PAGES, GAMES = ctx.__o.GAMES, GROUPS = ctx.__o.GROUPS;
const npcOf = ctx.__o.npcOf;
if (!Array.isArray(PAGES)) { console.error('!! 没取到 PAGES'); process.exit(1); }
if (!Array.isArray(GROUPS)) { console.error('!! 没取到 GROUPS'); process.exit(1); }

const meta = PAGES.map(p => {
    const o = { key: p.key, group: p.group, title: p.title, icon: p.icon };
    if (p.gms) o.gms = p.gms.slice();
    return o;
});
const keys = new Set(meta.map(m => m.key));
if (keys.size !== meta.length) { console.error('!! PAGES key 有重复'); process.exit(1); }

/* 角色条数：直接用 app.js 的 npcOf 现算，口径与运行时完全一致（含龙之天地的合并逻辑）。
   首页、目录页、页脚都要这个数字，但那时 k-npc.js（人物档案包，gzip 33KB）还没下；
   少了它就会退回 data.js 那份只收候补的旧名单，数字当场变小。 */
const byGame = {};
let total = 0;
if (typeof npcOf === 'function') {
    for (const g of GAMES) { const n = npcOf(g).length; byGame[g.id] = n; total += n; }
} else {
    console.error('!! 取不到 npcOf，NPC_STAT 只能留空');
}

const body = '/* 与本页数据同源的分组表，供菜单与标题用；正文包里有同名的 GROUPS，\n'
    + '   所以这里换个名字，免得多一个 <script> 就撞一次 const 重声明。 */\n'
    + 'var GROUPS_META = ' + JSON.stringify(GROUPS, null, 4) + ';\n'
    + 'var PAGES_META = ' + JSON.stringify(meta, null, 4) + ';\n'
    + 'var PAGE_COUNT = PAGES_META.length;\n'
    + '\n/* 条目可见性：带 gms 的条目只在指定作品下出现。\n'
    + '   放这里而不是 pages.js —— 首页、目录、名册都要用它，但那时正文包还没下。 */\n'
    + 'function pageVis(p, g) {\n'
    + '    return !p.gms || (g && p.gms.indexOf(g.id) >= 0);\n'
    + '}\n'
    + '\n/* 每作角色档案条数与总数：构建时用 npcOf 现算后写死在这里，只为了\n'
    + '   首页／目录／页脚在人物档案包（k-npc.js）还没下来时也能显示正确的数。\n'
    + '   真正要读某个人物字段的地方仍然走 npcOf。 */\n'
    + 'var NPC_STAT = ' + JSON.stringify({ total: total, byGame: byGame }, null, 4) + ';\n';
fs.writeFileSync(ROOT + 'js/pages-meta.js', body);
console.log('已写 js/pages-meta.js：' + meta.length + ' 条元数据 / 来自 ' + PAGES.length + ' 条 PAGES / 作品 '
    + GAMES.length + ' 部 / 角色 ' + total + ' 位');
