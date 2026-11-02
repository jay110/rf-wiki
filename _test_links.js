/* 内链健康检查（回归工具）
 *
 * 把 index.html 里所有 js/*.js 拼进 vm 沙箱，逐页渲染每个可见作品，
 * 抽出 href="#/page/<key>" 与 PAGES 的 key 对照：查不到的就是坏内链。
 * _verify.js 只查页面实例能不能渲染，不查链，这一支补的正是那块。
 *
 * 用法：node _test_links.js    （退出码 1 表示有坏链）
 */
'use strict';
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');
const srcs = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
let code = srcs.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n') + '\n;__o={PAGES,GAMES};';
const ctx = { console, window: { addEventListener() {}, matchMedia() { return { matches: false, addEventListener() {} }; }, location: { hash: '' }, localStorage: { getItem() { return null; }, setItem() {} } }, document: { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, body: { classList: { add() {}, remove() {} } }, documentElement: { classList: { add() {}, remove() {} } } }, localStorage: { getItem() { return null; }, setItem() {} }, location: { hash: '' }, navigator: { userAgent: 'node' }, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { PAGES, GAMES } = ctx.__o;
const keys = new Set(PAGES.map(p => p.key));
const charKeys = new Set();
let bad = [], n = 0;
for (const p of PAGES) {
  for (const g of GAMES) {
    if (p.gms && p.gms.indexOf(g.id) < 0) continue;
    const out = p.body(g);
    n++;
    for (const m of out.matchAll(/href="#\/([a-z]+)\/([^"?#]*)/g)) {
      const kind = m[1], rest = m[2];
      if (kind === 'page') {
        const k = rest.split('/')[0];
        if (!keys.has(k)) bad.push(p.key + '@' + g.id + ' -> page/' + k);
      }
    }
    for (const m of out.matchAll(/href="#\/page\/([a-z0-9]+)/g)) { }
  }
}
console.log('实例', n, '坏内链', bad.length);
bad.slice(0, 10).forEach(b => console.log(' ', b));
process.exit(bad.length ? 1 : 0);
