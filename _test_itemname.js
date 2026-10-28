/* 物品名一致性检查
   背景：人物名册（js/npcfull.js）的物品名是从 wiki 源页抄来的，村民喜好表
   （js/npcdata.js 的 NPC_RF4 / NPC_RF5）来自解包表，两边都可能抄错一个偏旁。
   参照物是站内自己维护的物品/料理/素材表——它们来自解包原始数据，最可信。

   判据：名字不在参照表里，但参照表里存在「同长度、只差一个字」的名字。
   这种多半是错字（飞瓣→飞溅），也可能是站内表本身没收这件物品（烤墨鱼）。
   后者列进 BASELINE 并写明理由，前者直接报错——新增一处就失败，
   避免第六十三次那种「同一件东西在三张表里三种写法」的病再犯。

   跑法：node _test_itemname.js
*/
const fs = require('fs');
const vm = require('vm');

const REF = ['js/items.js', 'js/items4.js', 'js/mat_rf3.js', 'js/cropdata.js',
    'js/recipes.js', 'js/recipes4.js', 'js/rf1cook.js', 'js/rf2cook.js',
    'js/rf3cook.js', 'js/rf3recipes.js', 'js/rf4cook.js', 'js/rf5cook.js',
    'js/rffcook.js', 'js/rfocook.js', 'js/fish.js', 'js/rf1data.js',
    'js/rf2data.js', 'js/rf3data.js', 'js/rffdata.js', 'js/rf3weapon.js'];

/* 允许存在的差异：站内参照表没收录这件物品，名字本身没错。
   加在这里要写清楚是哪件东西，别只写「保留」。 */
const BASELINE = {
    '烤墨鱼': 'RF4 确有炭烤墨鱼这道料理，站内料理表没收',
    '滑步靴': 'RF4 的靴类，站内装备表没收',
    '爱结晶': 'RF5 的爱之结晶，站内素材表没收',
    '粉宝石胸针': 'RF5 的粉宝石胸针，与红/蓝/绿宝石胸针并列的一种',
    '恶魔之角': 'RF5 的恶魔之角，站内素材表没收',
    '鲣鱼片': '鲣鱼片（かつおぶし），与生鱼片是两样东西',
    '龙蛇鳞片': '龙蛇鳞片，与「龙的鳞片」是两种素材，站内表没收前者',
    // 以下为「两套写法并存、但不敢断定是同一件东西」，暂不合并
    '至高咖喱': '咖喱有干咖喱／究极咖喱／至尊咖喱三档，站内没有「至高咖喱」，无法确定对应哪一档',
    '蓝水晶': '水晶有白／紫／红／绿／青五色，站内无「蓝水晶」，不能断定就是「青水晶」',
    '粉红猫咪': '站内是「粉红猫王」，但「粉红猫咪」可能是另一件布偶',
    '黄金戒指': 'RF4 物品表里就有「黄金戒指」，与「白金戒指」是两件东西',
    '铜手环': 'RF4 物品表作「铜手环」、RF5 作「铜手镯」，两作各自的叫法',
    '铁盾牌': 'RF4 物品表里就有「铁盾牌」，与「小盾牌」是两件东西',
    '尖锐之牙': '海洋的物品表不在站内，无法核对是「尖锐之牙」还是「尖锐之爪」',
    '粉宝石': '宝石有红／蓝／绿／白，站内无「粉宝石」，可能是另一档',
    '上等蛋': '上等蛋（上等たまご），站内食材表没收',
    '廉价布': '廉价布（安物の布），站内素材表没收',
    '龙之骨': '龙之骨，与龙之牙／龙之爪是三种素材',
    '龙之鳞': '龙之鳞，与「龙的鳞片」写法不同，站内表未收',
    '咖喱包': '站内是「咖喱面包」，「咖喱包」也可能指咖喱包子，不敢直接并',
};

/* 明显不是物品名的：类别名与范围词（「所有鱼」「烤鱼料理」「咖喱类」） */
const CATEGORY = /^(所有|各种|全部|两种)|(类|料理|碎片类)$/;

const canon = new Set();
REF.forEach(f => {
    if (!fs.existsSync(f)) return;
    const s = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    [...s.matchAll(/"([^"\\\n]{1,14})"|'([^'\\\n]{1,14})'/g)].forEach(m => {
        const v = m[1] || m[2];
        if (!/[0-9]/.test(v)) canon.add(v);
    });
});

const ctx = { console };
vm.createContext(ctx);
['js/npcfull.js', 'js/npcdata.js'].forEach(f =>
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));

function near(name) {
    const out = [];
    for (const c of canon) {
        if (c.length !== name.length) continue;
        let d = 0;
        for (let i = 0; i < name.length; i++) if (c[i] !== name[i]) { d++; if (d > 1) break; }
        if (d === 1) out.push(c);
    }
    return out;
}

// 收集：名册（7 作）+ 村民喜好表（RF4 / RF5）
const hits = new Map();
let checked = 0;
function feed(gid, who, name) {
    if (typeof name !== 'string') return;
    if (name.length < 3 || name.length > 12) return;   // 一两个字的多为档位名、类别名
    if (CATEGORY.test(name)) return;                   // 「所有鱼」「烤鱼料理」不是具体物品
    checked++;
    if (canon.has(name)) return;
    const cand = near(name);
    if (!cand.length) return;
    if (!hits.has(name)) hits.set(name, { cand: new Set(), who: new Set(), gid: new Set() });
    const h = hits.get(name);
    cand.forEach(c => h.cand.add(c));
    h.who.add(who); h.gid.add(gid);
}
Object.keys(ctx.NPC_FULL).forEach(gid => {
    ctx.NPC_FULL[gid].forEach(x => {
        [].concat(x.b || [], x.l || [], x.h || [], x.w || [],
            x.g ? [x.g] : [], x.bg ? [x.bg] : []).forEach(n => feed(gid, x.n, n));
    });
});
[['rf4', ctx.NPC_RF4], ['rf5', ctx.NPC_RF5]].forEach(([gid, arr]) => {
    (arr || []).forEach(r => {
        [].concat(r[1] || [], r[2] || [], r[3] || []).forEach(n => feed(gid, r[0], n));
    });
});

const extra = [];
const known = [];
[...hits.entries()].forEach(([n, h]) => {
    const row = [n, [...h.cand].join('/'), [...h.gid].join(','), [...h.who].join('、')];
    (BASELINE[n] ? known : extra).push(row);
});
const unused = Object.keys(BASELINE).filter(n => !hits.has(n));

console.log('参照物品名 %d 条，受检物品名 %d 处', canon.size, checked);
console.log('可疑写法 %d 处（白名单 %d，未登记 %d）', hits.size, known.length, extra.length);
if (known.length) {
    console.log('\n白名单内（站内表未收录，名字没错）：');
    known.forEach(r => console.log('  %s  疑似 %s  [%s] %s  —— %s',
        r[0], r[1], r[2], r[3], BASELINE[r[0]]));
}
if (extra.length) {
    console.log('\n!! 未登记的差异（多半是错字）：');
    extra.forEach(r => console.log('  %s  →  可能是 %s   [%s] %s', r[0], r[1], r[2], r[3]));
}
if (unused.length) {
    console.log('\n白名单里这些已经对不上了（可能是改名或数据变动，请清理）：');
    unused.forEach(n => console.log('  ' + n));
}
const bad = extra.length + unused.length;
console.log('\n结论：%s', bad === 0 ? '通过' : '异常 ' + bad + ' 处');
process.exit(bad === 0 ? 0 : 1);
