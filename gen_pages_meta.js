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
vm.runInContext(files.map(f => SRC[f]).join('\n;\n') + '\n;__o={PAGES:PAGES,GAMES:GAMES};', ctx,
    { filename: 'all.js' });

const PAGES = ctx.__o.PAGES, GAMES = ctx.__o.GAMES;
if (!Array.isArray(PAGES)) { console.error('!! 没取到 PAGES'); process.exit(1); }

const meta = PAGES.map(p => {
    const o = { key: p.key, group: p.group, title: p.title, icon: p.icon };
    if (p.gms) o.gms = p.gms.slice();
    return o;
});
const keys = new Set(meta.map(m => m.key));
if (keys.size !== meta.length) { console.error('!! PAGES key 有重复'); process.exit(1); }

const body = 'var PAGES_META = ' + JSON.stringify(meta, null, 4) + ';\n'
    + 'var PAGE_COUNT = PAGES_META.length;\n';
fs.writeFileSync(ROOT + 'js/pages-meta.js', body);
console.log('已写 js/pages-meta.js：' + meta.length + ' 条元数据 / 来自 ' + PAGES.length + ' 条 PAGES / 作品 '
    + GAMES.length + ' 部');
