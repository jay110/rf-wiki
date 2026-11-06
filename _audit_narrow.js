/* 窄屏横向溢出审计（回归工具）
 *
 * 用本机 Edge headless 在窄视口（默认 520px）下渲染每一个页面，
 * 量 documentElement.scrollWidth - clientWidth：正值＝页面被撑破（破版），
 * 0/负＝正常（宽表在 .table 容器内横滑，不撑破页面）。
 *
 * 用法：
 *   node _audit_narrow.js                 # 全部页面 × 各自可见作品
 *   node _audit_narrow.js --page battle   # 只看某页（含其全部可见作）
 *   node _audit_narrow.js --game rf5      # 某作下的全部页面
 *   node _audit_narrow.js --width 520     # 自定义窄屏宽度
 *   RFWIKI_LAYOUT_AUDIT=1 node _verify.js # 由 _verify 按需调用（需 Edge）
 *
 * 退出码：发现任意页面级溢出 → 1；全部干净 → 0。
 * 依赖：本机装有 Microsoft Edge（自动探测，或用 EDGE_BIN 指定 / --edge 传入）。
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const { spawn } = require('child_process');
const ROOT = __dirname + '/';

/* ---------- Edge 探测 ---------- */
function findEdge() {
  const cand = [
    process.env.EDGE_BIN,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].filter(Boolean);
  for (const c of cand) if (fs.existsSync(c)) return c;
  try {
    const p = require('child_process').execSync('command -v msedge 2>/dev/null || where msedge 2>nul', { encoding: 'utf8' }).trim();
    if (p) {
      let q = p.split(/\r?\n/)[0].trim();
      if (/^\/[a-z]\//.test(q)) q = q[1].toUpperCase() + ':' + q.slice(2);     // /c/... → C:/...
      if (fs.existsSync(q)) return q;
    }
  } catch (e) { /* 忽略 */ }
  return null;
}

/* ---------- 注入测量脚本，生成一次性审计页 ---------- */
function buildAuditHtml() {
  let h = fs.readFileSync(ROOT + 'index.html', 'utf8');
  const head = `<script>
    (function(){var m=location.search.match(/[?&]g=([^&]+)/);var g=m?m[1]:'rf5';try{localStorage.setItem('rf_wiki_v1',JSON.stringify({game:g}));}catch(e){}})();
  </script>\n`;
  const foot = `<script>
    window.addEventListener('load',function(){setTimeout(function(){
      try{
        /* 分包之后必须先确认页面真的画出来了：占位行没有宽度，量出来必然 0 溢出 */
        var mn=document.querySelector('#main');
        var txt=mn?mn.textContent.replace(/\s/g,''):'';
        if(!mn||txt.length<200||/正在载入资料/.test(txt)){
          var b0=document.createElement('div');b0.id='__audit';b0.setAttribute('data-overflow','notready');
          b0.textContent='NOTREADY';document.body.appendChild(b0);return;
        }
        var d=document.documentElement,cw=d.clientWidth,sw=d.scrollWidth,off=sw-cw;
        var b=document.createElement('div');b.id='__audit';b.setAttribute('data-overflow',String(off));
        b.textContent='OVERFLOW='+off;document.body.appendChild(b);
      }catch(e){var b2=document.createElement('div');b2.id='__audit';b2.setAttribute('data-overflow','-1');b2.textContent='ERR '+e;document.body.appendChild(b2);}
    },1200);});
  </script>\n`;
  h = h.replace('</head>', head + '</head>');
  /* 分包之后，若不在本地铺开所有包，量到的可能是「正在载入资料」那行占位，
     溢出永远 0，审计就白做了。把包全部铺进来。
     注意：不能再追加 `window.K_PLAN = null` 去「关掉按需加载」——loader 启动时读它，
     置空会抛异常、整个页面根本不渲染，#main 空着，量出来是 0，审计变成假通过
     （第一百七十七到二百三十六始终是这么跑的）。包铺齐之后 loader 照样能按需加载，
     重复加载是幂等的，不影响测量。 */
  const plan = JSON.parse(fs.readFileSync(ROOT + 'js/_chunks.json', 'utf8'));
  const all = [plan.shared, plan.cross]
    .concat(Object.keys(plan.games).map(g => 'js/k-' + g + '.js'))
    .concat(Object.keys(plan.pages || {}).map(k => 'js/k-page-' + k + '.js'));
  const burst = all.map(f => '<script src="' + f + '"></script>').join('\n') + '\n';
  h = h.replace('</body>', burst + foot + '</body>');
  return h;
}

/* ---------- 加载 bundle，枚举页面与作品 ---------- */
function loadBundle() {
  const files = require('./_files.js')();
  const ctx = {
    console,
    window: { addEventListener() { }, location: { hash: '' }, innerWidth: 1280, scrollTo() { } },
    document: { addEventListener() { }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({}), body: {} },
  };
  vm.createContext(ctx);
  const src = files.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n;\n') +
    '\n;__o.PAGES=(typeof PAGES!=="undefined")?PAGES:null; __o.GAMES=(typeof GAMES!=="undefined")?GAMES:null;';
  ctx.__o = {};
  vm.runInContext(src, ctx, { filename: 'bundle.js' });
  return ctx.__o;
}

/* ---------- 单页渲染并抽取溢出值 ---------- */
function execEdge(edge, url, width) {
  return new Promise((resolve) => {
    const args = ['--headless', '--disable-gpu', '--hide-scrollbars',
      `--window-size=${width},1200`, '--virtual-time-budget=5000', '--dump-dom', url];
    const cp = spawn(edge, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    cp.stdout.on('data', d => buf += d);
    cp.stderr.on('data', () => { });
    cp.on('close', () => resolve(buf));
    cp.on('error', () => resolve(''));
  });
}

/* 并发受限执行 */
async function mapLimit(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

/* ---------- 主审计 ---------- */
async function runAudit(opts) {
  const { width = 520, page = null, game = null, edge } = opts;
  const O = loadBundle();
  const PAGES = O.PAGES || [];
  const GAMES = O.GAMES || [];
  const tests = [];
  for (const p of PAGES) {
    if (page && p.key !== page) continue;
    const gids = p.gms ? p.gms : GAMES.map(g => g.id);
    for (const gid of gids) {
      if (game && gid !== game) continue;
      tests.push([p.key, gid]);
    }
  }
  const urlBase = 'file:///' + ROOT.replace(/\\/g, '/') + '_audit_run.html';
  const tmp = ROOT + '_audit_run.html';
  fs.writeFileSync(tmp, buildAuditHtml());
  let overflow = 0, fail = 0, total = 0;
  const found = [];
  await mapLimit(tests, 8, async ([key, gid]) => {
    const url = `${urlBase}?g=${gid}#/page/${key}`;
    const out = await execEdge(edge, url, width);
    const m = out.match(/data-overflow="(-?\d+)"/);
    const ov = m ? parseInt(m[1], 10) : -1;
    total++;
    if (ov > 0) { overflow++; found.push(`  !! ${key}/${gid} 页面级溢出 ${ov}px`); }
    else if (ov < 0) { fail++; found.push(`  ?? ${key}/${gid} 测量失败（未抓到 data-overflow）`); }
  });
  try { fs.unlinkSync(tmp); } catch (e) { }
  return { width, overflow, fail, total, found };
}

/* ---------- CLI ---------- */
function parseArgs(argv) {
  const o = { width: 520, page: null, game: null, edge: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--width') o.width = parseInt(argv[++i], 10) || 520;
    else if (a === '--page') o.page = argv[++i];
    else if (a === '--game') o.game = argv[++i];
    else if (a === '--edge') o.edge = argv[++i];
  }
  if (o.edge) process.env.EDGE_BIN = o.edge;
  return o;
}

if (require.main === module) {
  (async () => {
    const o = parseArgs(process.argv.slice(2));
    const edge = findEdge();
    if (!edge) {
      console.log('未找到 Microsoft Edge，无法做窄屏渲染审计。可用 EDGE_BIN 指定或加入 PATH。');
      process.exit(2);
    }
    o.edge = edge;
    const scope = (o.page ? `page=${o.page} ` : '') + (o.game ? `game=${o.game} ` : '');
    console.log(`窄屏审计 @${o.width}px ${scope}（Edge: ${edge}）`);
    const r = await runAudit(o);
    if (r.found.length) r.found.forEach(s => console.log(s));
    if (r.overflow === 0 && r.fail === 0) console.log(`✓ 全部干净：${r.total} 次渲染，0 页面级横向溢出。`);
    else console.log(`✗ 溢出 ${r.overflow} 处 / 测量失败 ${r.fail} 处（共 ${r.total} 次渲染）`);
    process.exit(r.overflow > 0 ? 1 : 0);
  })();
}

module.exports = { findEdge, runAudit, buildAuditHtml };
