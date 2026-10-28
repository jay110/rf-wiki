/* 搜索功能自测 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const html = fs.readFileSync(ROOT + 'index.html', 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const stubEl = { innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { } };
const ctx = {
    console,
    window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: { addEventListener() { }, getElementById: () => stubEl, querySelector: () => stubEl, querySelectorAll: () => [], createElement: () => stubEl, body: stubEl },
};
vm.createContext(ctx);
vm.runInContext(files.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n;\n'), ctx, { filename: 'bundle.js' });
const GAMES = vm.runInContext('GAMES', ctx);

const run = (gid, kw) => {
    const g = GAMES.find(x => x.id === gid);
    const words = kw.toLowerCase().split(/\s+/).filter(Boolean);
    const t0 = Date.now();
    const r = ctx.searchEntries(g, words);
    const ms = Date.now() - t0;
    const top = r.list.slice(0, 3).map(it => `${it.n}[${it.pages.map(p => p.t).join('/')}${it.c > 1 ? '×' + it.c : ''}]`).join(' ');
    console.log(`${gid}「${kw}」→ ${r.list.length}条(${r.rows}行, ${ms}ms)${r.relaxed ? ' [回退到' + r.used[0] + ']' : ''} │ ${top}`);
};

run('rf4', '生命果冻');
run('rf4', '生命果冻');   // 第二次应 0ms（缓存）
run('rf4', '剑 攻击');
run('rf4', '鱼');
run('rf1', '生命果冻');
run('rff', '生命果冻');
run('rf3', '生命果冻');
run('rf5', '生命果冻');
run('rfo', '生命果冻');
run('rf2', '生命果冻');
run('rf4', '星屑');
run('rf4', 'zzz不存在');

/* viewSearch 整体输出检查 */
vm.runInContext("S.game='rf4'", ctx);
['生命果冻', '锻造', '鱼', 'zzz'].forEach(kw => {
    const h = ctx.viewSearch(kw);
    const bad = [];
    if (/undefined/.test(h)) bad.push('undefined');
    if (/NaN/.test(h)) bad.push('NaN');
    if (/\[object Object\]/.test(h)) bad.push('object');
    console.log(`viewSearch「${kw}」长度 ${h.length}${bad.length ? ' !! ' + bad.join(',') : ' 干净'}`);
});
