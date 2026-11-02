/* 单页渲染导出（调试用）：把某个页面在某作下的 HTML 写到 _out.html，供截图或抽查
 *
 * 用法：node _test_render.js <page> <game> [输出文件]
 *   node _test_render.js rf3list rf3
 *   node _test_render.js rf3list rf3 _out.html
 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const page = process.argv[2] || 'rf3list';
const game = process.argv[3] || 'rf3';
const outp = process.argv[4] || '_out.html';

const html = fs.readFileSync(ROOT + 'index.html', 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);

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
src += '\n;__o = { PAGES: PAGES, GAMES: GAMES };';
vm.runInContext(src, ctx, { filename: 'bundle.js' });

const P = ctx.__o.PAGES.find(p => p.key === page);
if (!P) { console.error('没有页面 ' + page); process.exit(1); }
const G = ctx.__o.GAMES.find(g => g.id === game);
if (!G) { console.error('没有作品 ' + game); process.exit(1); }

const body = P.body(G);
const out = '<!DOCTYPE html><html lang="zh-Hans"><head><meta charset="UTF-8">'
    + '<link rel="stylesheet" href="css/main.css"><link rel="stylesheet" href="css/content.css">'
    + '</head><body><div id="app"><main class="main"><div class="content">' + body
    + '</div></main></div></body></html>';
fs.writeFileSync(outp, out);
console.log('写入', outp, '长度', body.length, '| 表格', (body.match(/<table>/g) || []).length, '| 行', (body.match(/<tr/g) || []).length);
