/* 冒烟测试：只加载 k-core.js（不含 shared/pages.js），确认首页（viewWelcome）不依赖完整 PAGES。
 * 这是把 pages.js 挪出核心后的新风险点：核心里不该有 PAGES，但首页还要能画。 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const code = fs.readFileSync(ROOT + 'js/k-core.js', 'utf8');

const stubEl = new Proxy({ innerHTML: '', textContent: '', value: '', title: '', hidden: false,
    style: {}, dataset: {}, classList: { add(){}, remove(){}, toggle(){} },
    addEventListener(){}, appendChild(){}, removeChild(){}, setAttribute(){}, getAttribute(){return null;},
    querySelector(){return stubEl;}, querySelectorAll(){return [];}, scrollIntoView(){}, focus(){} }, {
    get(t,k){ return k in t ? t[k] : (()=>stubEl); }, set(t,k,v){ t[k]=v; return true; }
});
const storage = {};
const ctx = {
    console, setTimeout, clearTimeout, Promise, JSON, Math, Date, RegExp, Array, Object, String, Number,
    document: {
        addEventListener(){}, getElementById(){return stubEl;}, querySelector(){return stubEl;},
        querySelectorAll(){return [];}, createElement(){return stubEl;}, body: stubEl, documentElement: stubEl,
        addEventListener(){},
    },
    window: { addEventListener(){}, location: { hash: '#/' }, innerWidth: 1280, scrollTo(){},
        matchMedia(){return {matches:false, addEventListener(){}};}, localStorage: {
            getItem(k){return storage[k]||null;}, setItem(k,v){storage[k]=v;}, removeItem(k){delete storage[k];} } },
    location: { hash: '#/' },
    localStorage: { getItem(k){return storage[k]||null;}, setItem(k,v){storage[k]=v;}, removeItem(k){delete storage[k];} },
    navigator: { userAgent: 'node' },
};
vm.createContext(ctx);
try { vm.runInContext(code, ctx, { filename: 'k-core.js' }); }
catch (e) { console.error('核心求值抛错：', e.message); process.exit(1); }

console.log('PAGES 类型     :', typeof ctx.PAGES, '（应为 undefined，确认 pages.js 不在核心）');
console.log('PAGES_META 类型:', typeof ctx.PAGES_META, '条数', ctx.PAGES_META && ctx.PAGES_META.length);
console.log('PAGE_COUNT     :', typeof ctx.PAGE_COUNT, ctx.PAGE_COUNT);
console.log('GAMES 条数     :', ctx.GAMES && ctx.GAMES.length);
console.log('viewWelcome    :', typeof ctx.viewWelcome);

/* 核心里绝不能有 PAGES（完整渲染正文），否则首页就背着它了 */
if (typeof ctx.PAGES !== 'undefined') { console.error('!! 核心里出现了完整 PAGES，拆分失败'); process.exit(1); }
if (typeof ctx.PAGE_COUNT !== 'number' || ctx.PAGE_COUNT !== (ctx.PAGES_META && ctx.PAGES_META.length)) {
    console.error('!! PAGE_COUNT 与 PAGES_META 不一致'); process.exit(1);
}

/* 模拟首页渲染：cur() 默认作品 + viewWelcome() 不应抛错 */
try {
    const g = ctx.cur ? ctx.cur() : ctx.GAMES[0];
    const html = ctx.viewWelcome(g);
    if (typeof html !== 'string' || html.length < 100) throw new Error('首页输出异常短：' + JSON.stringify(html).slice(0,80));
    if (html.indexOf('符文工房') < 0) throw new Error('首页没出现作品名');
    console.log('viewWelcome 渲染 OK，长度', html.length, '，含「符文工房」✓');
} catch (e) {
    console.error('!! 首页渲染抛错：', e.message); process.exit(1);
}
console.log('\n核心冒烟测试通过：首页不依赖完整 PAGES，只载核心即可画。');
