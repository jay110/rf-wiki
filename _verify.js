/* 本地渲染校验：按 index.html 的顺序加载所有 js，逐页调 body() 检查异常 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const html = fs.readFileSync(ROOT + 'index.html', 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
console.log('脚本数', files.length);

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
const NAMES = ['PAGES', 'GAMES', 'GROUPS', 'CN_RFO', 'CN_RFF_PERSON', 'CN_RFF_PLACE', 'CN_RFF_ITEM', 'CN_RFF_MISC',
    'CN_RF1_ITEM', 'CN_RF1_NPC', 'CN_RF1_PLACE', 'CN_RF1_EVENT', 'CN_RF1_KIND', 'CN_RF1_ABI', 'CN_RF1_TYPE', 'CN_RF1_ATTR'];
src += '\n;' + NAMES.map(n => `__o.${n} = (typeof ${n} !== "undefined") ? ${n} : null;`).join('\n');
ctx.__o = {};
vm.runInContext(src, ctx, { filename: 'bundle.js' });
const O = ctx.__o;

NAMES.forEach(n => console.log('  ' + n, O[n] ? (Array.isArray(O[n]) ? O[n].length + ' 条' : 'ok') : '未定义'));

const GAMES = O.GAMES || [];
const PAGES = O.PAGES || [];
const only = process.argv[2];
let bad = 0, checked = 0;
for (const p of PAGES) {
    if (only && p.key !== only) continue;
    if (p.gms) {
        for (const gid of p.gms) {
            const g = GAMES.find(x => x.id === gid);
            if (!g) { console.log('!! 未知作品 ' + gid + ' @' + p.key); bad++; continue; }
            check(p.key + '/' + gid, p.body(g));
        }
    } else {
        for (const g of GAMES) check(p.key + '/' + g.id, p.body(g));
    }
}
function check(name, htmlstr) {
    checked++;
    const issues = [];
    if (/undefined/.test(htmlstr)) issues.push('undefined');
    if (/NaN/.test(htmlstr)) issues.push('NaN');
    if (/\[object Object\]/.test(htmlstr)) issues.push('[object Object]');
    if (/null/.test(htmlstr)) issues.push('null');
    if (issues.length) { console.log('!! ' + name + ' → ' + issues.join(', ')); bad++; }
}
console.log('检查页面实例', checked, '异常', bad);

// 抽查新页
if (!only) {
    const p = PAGES.find(x => x.key === 'zhname');
    ['rf1', 'rff', 'rfo'].forEach(id => {
        const g = GAMES.find(x => x.id === id);
        const h = p.body(g);
        console.log('zhname/' + id, '长度', h.length, '表格数', (h.match(/<table/g) || []).length,
            '行数', (h.match(/<tr data-s=/g) || []).length);
    });
}
