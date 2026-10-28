/* 行程表渲染测试：8 种星期 × 全部村民，重点校验 colspan 总和不能错位 */
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const stub = {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() { }, remove() { }, toggle() { } },
    addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { }, focus() { }, setSelectionRange() { }
};
const ctx = {
    console, window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: {
        addEventListener() { }, getElementById: () => stub, querySelector: () => stub,
        querySelectorAll: () => [], createElement: () => stub, body: stub
    }
};
vm.createContext(ctx);
vm.runInContext(files.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n'), ctx, { filename: 'b.js' });

const D = vm.runInContext('SCHED.rf1', ctx);
const bad = [];
const T = D.times.length;

if (T !== 19) bad.push(`时段应为 19，实为 ${T}`);
if (D.days.length !== 8) bad.push(`星期应有 8 种，实为 ${D.days.length}`);

/* 1. 数据层：每人每天 19 格，编码长度对得上 */
for (const p of D.people) {
    if (p[3].length !== 8 * T) bad.push(`${p[0]} 编码长 ${p[3].length}，应为 ${8 * T}`);
    for (const ch of p[3]) {
        if (vm.runInContext('B62', ctx).indexOf(ch) < 0) { bad.push(`${p[0]} 含非法编码字符 ${ch}`); break; }
    }
}

/* 2. 视图层：8 种星期各渲染一次，逐行核对 colspan 总和 */
let rows = 0, cells = 0;
for (let day = 0; day < 8; day++) {
    vm.runInContext(`SCHD_DAY = ${day}`, ctx);
    let h;
    try { h = ctx.viewSched('rf1'); }
    catch (e) { bad.push(`第 ${day} 天渲染抛错: ${e.message}`); continue; }
    if (/undefined|NaN|\[object Object\]/.test(h)) bad.push(`第 ${day} 天含脏输出`);

    const ths = (h.match(/<thead><tr>([\s\S]*?)<\/tr><\/thead>/) || [, ''])[1];
    const colCount = (ths.match(/<th[ >]/g) || []).length - 1;
    if (colCount !== T) bad.push(`第 ${day} 天表头时段列 ${colCount}，应为 ${T}`);

    const trs = h.match(/<tr data-n=[\s\S]*?<\/tr>/g) || [];
    if (trs.length !== D.people.length) bad.push(`第 ${day} 天行数 ${trs.length}，应 ${D.people.length}`);
    for (const tr of trs) {
        const name = (tr.match(/data-n="([^"]*)"/) || [, '?'])[1];
        const spans = [...tr.matchAll(/colspan="(\d+)"/g)].map(m => Number(m[1]));
        const sum = spans.reduce((a, b) => a + b, 0);
        cells += spans.length;
        rows++;
        if (sum !== T) bad.push(`第 ${day} 天 ${name} 的 colspan 合计 ${sum}，应为 ${T}`);
    }
}

/* 3. 带人名过滤 / 无数据作品 / 错误路由 */
vm.runInContext('SCHD_DAY = 0', ctx);
const one = ctx.viewSched('rf1', '蜜丝特');
if (!/value="蜜丝特"/.test(one)) bad.push('带人名进入时未预填筛选框');
if (!/已收录|位<\/strong>/.test(one)) bad.push('缺少人数说明');

const none = ctx.viewSched('rf2');
if (!/还没有行程数据/.test(none)) bad.push('无数据作品未给出提示');

/* 4. 样本：周一蜜丝特的一天 */
const mist = D.people.find(p => p[0] === '蜜丝特');
const runs = ctx.schedRuns(mist[3], 0, T);
const seq = runs.map(r => {
    const s = ctx.schedSpot(D, r.c);
    return `${s[0]}(${r.n}h)`;
}).join(' → ');

console.log(`渲染 8 种星期 × ${D.people.length} 人 = ${rows} 行 / ${cells} 段`);
console.log(bad.length ? '异常：\n' + bad.slice(0, 15).join('\n') : '全部正常');
console.log('周一 蜜丝特：' + seq);
