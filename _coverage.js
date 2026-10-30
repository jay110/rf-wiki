// 覆盖率自查：打印「每条攻略条目对哪些作品可见」的矩阵（只读，不改站点）
const fs = require('fs'), vm = require('vm');
const ctx = { console };
vm.createContext(ctx);
let src = '';
for (const f of ['js/data.js', 'js/pages.js']) src += fs.readFileSync(f, 'utf8') + '\n;\n';
src += '\nglobalThis.__PAGES = PAGES; globalThis.__GROUPS = (typeof GROUPS !== "undefined" ? GROUPS : null);\n';
try { vm.runInContext(src, ctx, { filename: 'bundle.js' }); } catch (e) { console.log('ERR', e.message); }
const PAGES = ctx.__PAGES, GROUPS = ctx.__GROUPS;
const IDS = ['rf1', 'rf2', 'rf3', 'rf3sp', 'rf4', 'rf4sp', 'rff', 'rfo', 'rf5', 'azuma'];
const vis = (p, gid) => !p.gms || p.gms.indexOf(gid) >= 0;
console.log('总条目', PAGES.length);
for (const g of (GROUPS || [])) {
  console.log('--- ' + g.title);
  for (const p of PAGES.filter(x => x.group === g.key)) {
    const cells = IDS.map(i => (vis(p, i) ? ' ✓  ' : ' ·  ')).join('');
    console.log('  ' + String(p.title).padEnd(16, '　') + cells);
  }
}
console.log('');
console.log('各作可见条目数：');
for (const i of IDS) {
  const n = PAGES.filter(p => vis(p, i)).length;
  console.log('  ' + i.padEnd(7) + n + ' / ' + PAGES.length);
}
