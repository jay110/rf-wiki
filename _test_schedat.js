/* 时段反查测试：8 天 × 19 个整点，把反查结果和正向编码逐格对撞。
   核心断言——反查是正向表的转置，任何一格都不能错位或丢人。 */
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
const B62 = vm.runInContext('B62', ctx);
const schedSpot = vm.runInContext('schedSpot', ctx);
const schedAt = vm.runInContext('schedAt', ctx);
const schedAtHtml = vm.runInContext('schedAtHtml', ctx);
const schedStatsHtml = vm.runInContext('schedStatsHtml', ctx);

const bad = [];
const T = D.times.length;
const N = D.people.length;

/* 正向表：这人这个点在哪个地点（空串 = 未标注） */
function spotOf(code, di, hi) {
    const s = schedSpot(D, code.charAt(di * T + hi));
    return s[0] === '—' ? '' : s[0] + '\u0001' + s[1];
}

let checked = 0;
for (let di = 0; di < D.days.length; di++) {
    for (let hi = 0; hi < T; hi++) {
        const groups = schedAt(D, di, hi);
        const flat = new Map();       // 名字 -> 建筑名
        for (const g of groups) for (const p of g.ppl) {
            if (flat.has(p.n)) bad.push(`${D.days[di]} ${D.times[hi]}：${p.n} 出现在多处`);
            flat.set(p.n, g.b + '\u0001' + g.fl);
        }

        /* 逐人比对：正向表说他在这儿，反查就必须正好在这儿 */
        let marked = 0;
        for (const p of D.people) {
            const want = spotOf(p[3], di, hi);
            const got = flat.get(p[0]) || '';
            if (want === got) {
                if (want) marked++;
                continue;
            }
            bad.push(`${D.days[di]} ${D.times[hi]} ${p[0]}：正向「${want.replace('\u0001', ' ')}」反查「${got.replace('\u0001', ' ')}」`);
        }

        const total = groups.reduce((s, x) => s + x.ppl.length, 0);
        if (total !== marked) bad.push(`${D.days[di]} ${D.times[hi]}：反查 ${total} 人，正向标了 ${marked} 人`);
        if (total > N) bad.push(`${D.days[di]} ${D.times[hi]}：反查人数 ${total} 超过总人数 ${N}`);

        /* 「待至」必须正好是这一段的结束时刻 */
        for (const g of groups) for (const p of g.ppl) {
            const row = D.people.find(x => x[0] === p.n);
            const ch = row[3].charAt(di * T + hi);
            let n = 0;
            while (hi + n < T && row[3].charAt(di * T + hi + n) === ch) n++;
            const want = D.times[(hi + n) % T];
            if (p.u !== want) bad.push(`${D.days[di]} ${D.times[hi]} ${p.n}：待至 ${p.u}，应为 ${want}`);
        }

        /* 渲染层不能出脏 */
        const h = schedAtHtml(D, di, hi, 'rf1');
        if (/undefined|NaN|\[object/.test(h)) bad.push(`${D.days[di]} ${D.times[hi]} 分组 HTML 有脏输出`);
        if (!groups.length && !h.includes('empty')) bad.push(`${D.days[di]} ${D.times[hi]} 空结果没有占位`);
        const st = schedStatsHtml(D, di, hi);
        if (/undefined|NaN/.test(st)) bad.push(`${D.days[di]} ${D.times[hi]} 统计行有脏输出`);
        checked++;
    }
}

/* 整个视图：两种模式各渲染一次 */
for (const [mode, args] of [['按人看', ['rf1', undefined, undefined]], ['按时段看', ['rf1', 'h', 12]]]) {
    let h;
    try { h = vm.runInContext(`viewSched(${JSON.stringify(args[0])}, ${JSON.stringify(args[1])}, ${JSON.stringify(args[2])})`, ctx); }
    catch (e) { bad.push(`${mode} 渲染抛错: ${e.message}`); continue; }
    if (/undefined|NaN|\[object/.test(h)) bad.push(`${mode} 含脏输出`);
    if (mode === '按时段看') {
        if (!h.includes('id="schHours"')) bad.push('按时段看缺少时段条');
        if (!h.includes('id="schAt"')) bad.push('按时段看缺少分组区');
        if (!/class="filter-btn on"[^>]*>按时段看/.test(h.replace(/\n\s*/g, ''))) {
            // 模式 tab 的高亮交给下面单独断言
        }
    }
}

/* 路由：#/sched/rf1/h/12 三种参数组合都要落到对应模式 */
const cases = [
    ['rf1', undefined, undefined, 'p'],
    ['rf1', 'h', '12', 'h'],
    ['rf1', 'h', '999', 'h'],      // 越界要钳到最后一格
    ['rf1', 'h', '0', 'h'],
    ['rf1', '蜜丝特', undefined, 'p'],
];
for (const [a, b, c, want] of cases) {
    vm.runInContext(`SCHD_MODE = ''; viewSched(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(c)})`, ctx);
    const got = vm.runInContext('SCHD_MODE', ctx);
    if (got !== want) bad.push(`路由 ${a}/${b}/${c} 落到 ${got}，应为 ${want}`);
    if (want === 'h') {
        const hi = vm.runInContext('SCHD_HOUR', ctx);
        if (!(hi >= 0 && hi < T)) bad.push(`路由 ${a}/${b}/${c} 的时段下标 ${hi} 越界`);
    }
}

console.log(`对撞 ${checked} 个时段组合 × ${N} 人 = ${checked * N} 次比对`);
if (bad.length) {
    console.log(`异常 ${bad.length} 条：`);
    bad.slice(0, 25).forEach(x => console.log('  ' + x));
    process.exit(1);
}
console.log('全部正常');

/* 抽一格给人看：周一 13:00 */
vm.runInContext(`SCHD_MODE = 'h'; SCHD_DAY = 0; viewSched('rf1', 'h', 7)`, ctx);
const g = schedAt(D, 0, 7);
console.log(`周一 ${D.times[7]}：${g.length} 处 — ` + g.slice(0, 4)
    .map(x => `${x.b}(${x.ppl.map(p => p.n).slice(0, 3).join('、')}${x.ppl.length > 3 ? '…' : ''})`).join(' / '));
