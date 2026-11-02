/* 全作品 dump：node _dump_all.js <gameId> [pageKey]
   把某作可见的全部页面渲染成纯文本，落到 _snap/<gameId>_pages/ 便于核查 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = __dirname + '/';
const files = require('./_files.js')();

const stubEl = { innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { } };
const ctx = {
    console,
    window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: { addEventListener() { }, getElementById: () => stubEl, querySelector: () => stubEl, querySelectorAll: () => [], createElement: () => stubEl, body: stubEl },
};
vm.createContext(ctx);
let src = files.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n;\n');
src += '\n;__o.PAGES=(typeof PAGES!=="undefined")?PAGES:null;__o.GAMES=(typeof GAMES!=="undefined")?GAMES:null;';
ctx.__o = {};
vm.runInContext(src, ctx, { filename: 'bundle.js' });
const { PAGES, GAMES } = ctx.__o;

const gid = process.argv[2] || 'rfo';
const g = GAMES.find(x => x.id === gid);
if (!g) { console.log('未找到作品 ' + gid + '，可选：' + GAMES.map(x => x.id).join(' ')); process.exit(1); }

const dir = ROOT + '_snap/' + gid + '_pages';
fs.mkdirSync(dir, { recursive: true });

const only = process.argv[3];
const strip = s => s
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/(tr|p|li|h1|h2|h3|div|table)>/g, '\n')
    .replace(/<\/(td|th)>/g, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

let n = 0, tot = 0;
for (const p of PAGES) {
    if (p.gms && !p.gms.includes(gid)) continue;
    if (only && p.key !== only) continue;
    let h;
    try { h = p.body(g); } catch (e) { console.log('!! ' + p.key + ' 抛异常 ' + e.message); continue; }
    const t = strip(h);
    fs.writeFileSync(path.join(dir, p.key + '.txt'), t, 'utf8');
    tot += t.length; n++;
    console.log(('      ' + p.key).slice(-10), String(t.length).padStart(7), String(t.split('\n').length).padStart(5) + ' 行');
}
console.log(gid + '：' + n + ' 页 / ' + tot + ' 字符 → ' + dir);
