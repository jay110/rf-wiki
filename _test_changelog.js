/* 断言「更新日志摘要」与正文一致
 *
 * 正文（js/changelog.js，430KB）改成按需加载后，页脚日期与首页「最近更新」改用打包时
 * 生成的摘要（js/changelog-head.js）。两份数据分离就意味着可能对不上——
 * 改了正文忘了重生成摘要，首页就会显示旧标题。这个脚本就是那道闸：
 *
 *   node _test_changelog.js     不一致 → 退出码 1
 */
const fs = require('fs'), vm = require('vm');
const ROOT = __dirname + '/';
const files = require('./_files.js')();

const stubEl = {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() { }, remove() { }, toggle() { } },
    addEventListener() { }, appendChild() { }, querySelectorAll: () => [], scrollIntoView() { },
};
const ctx = {
    console,
    window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: {
        addEventListener() { }, getElementById: () => stubEl, querySelector: () => stubEl,
        querySelectorAll: () => [], createElement: () => stubEl, body: stubEl,
    },
};
vm.createContext(ctx);
const src = files.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n;\n')
    + '\n;__o = { latestUpdates: latestUpdates, siteUpdated: siteUpdated,'
    + ' HEAD: (typeof CHANGELOG_HEAD !== "undefined") ? CHANGELOG_HEAD : null,'
    + ' BODY: (typeof CHANGELOG_HTML !== "undefined") ? CHANGELOG_HTML : null };';
vm.runInContext(src, ctx, { filename: 'all.js' });
const O = ctx.__o;

let bad = 0;
function fail(msg) { console.log('  !! ' + msg); bad++; }

if (!O.HEAD) fail('CHANGELOG_HEAD 未定义（缺 js/changelog-head.js，或没加进 js/_manifest.json）');
if (!O.BODY) fail('CHANGELOG_HTML 未定义（缺 js/changelog.js，或没加进 js/_manifest.json）');

if (O.HEAD && O.BODY) {
    /* 1. 日期 */
    const m = /(\d{4})-(\d{2})-(\d{2})/.exec(O.BODY);
    const want = m ? `${+m[1]}年${+m[2]}月${+m[3]}日` : '';
    const got = O.siteUpdated();
    if (got !== want) fail(`页脚日期 ${got} ≠ 正文首条 ${want}`);

    /* 2. 最近 6 条标题：与 app.js 里 latestUpdates 的算法逐条比 */
    const live = O.latestUpdates(6);
    const head = O.HEAD.latest.slice(0, 6);
    if (live.length !== head.length) fail(`最近更新条数 ${head.length} ≠ 正文算出 ${live.length}`);
    for (let i = 0; i < Math.max(live.length, head.length); i++) {
        if (live[i] !== head[i]) fail(`最近更新第 ${i + 1} 条：摘要「${head[i] || '—'}」≠ 正文「${live[i] || '—'}」`);
    }
    console.log('日志条目 ' + (O.BODY.match(/<h2[^>]*>/g) || []).length + ' 条，摘要 updated=' + O.HEAD.updated);
}

if (bad) {
    console.log('\n摘要与正文不一致，跑一次 python _build_clhead.py 再提交');
    process.exit(1);
}
console.log('✓ 摘要与正文一致（日期 + 最近 6 条标题）');
