/* 人物板块渲染测试：每作 × 每分类 × 每人详情 */
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const stub = { innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { } };
const ctx = { console, window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } }, document: { addEventListener() { }, getElementById: () => stub, querySelector: () => stub, querySelectorAll: () => [], createElement: () => stub, body: stub } };
vm.createContext(ctx);
vm.runInContext(files.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n'), ctx, { filename: 'b.js' });
const G = vm.runInContext('GAMES', ctx);

const bad = [];
let pages = 0, chars = 0;
for (const g of G) {
    for (const role of ['全部', '主角', '结婚候补', '居民']) {
        for (const sort of [undefined, 'bd']) {
            pages++;
            let h;
            try { h = ctx.viewResident(g.id, role, sort); }
            catch (e) { bad.push(`resident ${g.id}/${role}/${sort} 抛错: ${e.message}`); continue; }
            if (/undefined|NaN|\[object Object\]/.test(h)) bad.push(`resident ${g.id}/${role}/${sort} 含脏输出`);
            if (!/class="npc-card"|class="empty"/.test(h)) bad.push(`resident ${g.id}/${role}/${sort} 既无卡片也无空态`);
        }
    }
    const list = ctx.npcOf(g);
    for (const c of list) {
        chars++;
        let h;
        try { h = ctx.viewChar(g.id, c.n); }
        catch (e) { bad.push(`char ${g.id}/${c.n} 抛错: ${e.message}`); continue; }
        if (/undefined|NaN|\[object Object\]/.test(h)) bad.push(`char ${g.id}/${c.n} 含脏输出`);
        if (/没有这个角色/.test(h)) bad.push(`char ${g.id}/${c.n} 找不到`);
    }
}
console.log(`渲染 ${pages} 个名册视图 + ${chars} 个角色详情`);
console.log(bad.length ? bad.slice(0, 15).join('\n') : '全部正常');

/* 抽样输出 */
const g = G.find(x => x.id === 'rf4');
const h = ctx.viewResident(g.id, '结婚候补', 'bd');
const names = [...h.matchAll(/class="npc-name">([^<]+)/g)].map(m => m[1]);
console.log('RF4 结婚候补按生日排:', names.join(' → '));
const c1 = ctx.viewChar('rf4', '比修奈尔');
console.log('RF4 比修奈尔 页长', c1.length,
    '| 标签数', (c1.match(/class="tag /g) || []).length,
    '| 有喜好区', /class="taste"/.test(c1));
