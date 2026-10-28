/* 索引健康检查：异常名称、纯数字名、超长名 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const html = fs.readFileSync(ROOT + 'index.html', 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const stubEl = { innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { } };
const ctx = { console, window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: { addEventListener() { }, getElementById: () => stubEl, querySelector: () => stubEl, querySelectorAll: () => [], createElement: () => stubEl, body: stubEl } };
vm.createContext(ctx);
vm.runInContext(files.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n;\n'), ctx, { filename: 'bundle.js' });
const GAMES = vm.runInContext('GAMES', ctx);

for (const g of GAMES) {
    const idx = ctx.buildIndex(g);
    const numeric = idx.filter(e => /^[\d.,%+−-]+$/.test(e.n));
    const long = idx.filter(e => e.n.length > 24);
    const dup = new Map();
    for (const e of idx) { const k = e.k + '|' + e.n; dup.set(k, (dup.get(k) || 0) + 1); }
    const dupN = [...dup.values()].filter(v => v > 1).length;
    console.log(`${g.id}: ${idx.length} 行 | 数字名 ${numeric.length} | 超长名 ${long.length} | 同页重名 ${dupN}`);
    if (numeric.length) console.log('   数字例：', numeric.slice(0, 6).map(e => `${e.n}@${e.t}`).join(' '));
    if (long.length) console.log('   长名例：', long.slice(0, 2).map(e => e.n.slice(0, 30) + '…@' + e.t).join(' '));
}
