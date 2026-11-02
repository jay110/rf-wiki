/* 把海洋（rfo）可见页全部渲染成纯文本，落到 _snap/rfo_pages/ 便于逐页核对 */
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
const g = GAMES.find(x => x.id === 'rfo');

const dir = ROOT + '_snap/rfo_pages';
fs.mkdirSync(dir, { recursive: true });

const only = process.argv[2];
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

for (const p of PAGES) {
    if (p.gms && !p.gms.includes('rfo')) continue;
    if (only && p.key !== only) continue;
    let h;
    try { h = p.body(g); } catch (e) { console.log('!! ' + p.key + ' 抛异常 ' + e.message); continue; }
    const t = strip(h);
    fs.writeFileSync(path.join(dir, p.key + '.txt'), t, 'utf8');
    console.log(('      ' + p.key).slice(-8), String(t.length).padStart(6), t.split('\n').length + ' 行');
}
console.log('输出目录', dir);
