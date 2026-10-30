/* ============================================================
   目录与条目正文
   body(g) 中的 g 为当前作品对象；共通机制页不依赖 g。
   ============================================================ */

const GROUPS = [
    { key: 'basic', title: '基础知识', en: 'BASICS' },
    { key: 'life', title: '牧场生活', en: 'FARM LIFE' },
    { key: 'event', title: '活动事件', en: 'EVENTS' },
    { key: 'item', title: '物品道具', en: 'ITEMS' },
    { key: 'lore', title: '资料与设定', en: 'LORE' },
];

/* 快速生成表格 */
function tbl(head, rows, opts) {
    const o = opts || {};
    const w = o.colw || [];
    const st = i => (w[i] ? ` style="width:${w[i]}"` : '');
    const cls = o.cls ? ' ' + o.cls : '';
    const th = head.map((h, i) => `<th class="th${i === 0 && o.leftFirst ? ' left' : ''}"${st(i)}>${h}</th>`).join('');
    const tr = rows.map(r => '<tr>' + r.map((c, i) =>
        `<td class="td${i === 0 && o.leftFirst ? ' left' : ''}"${st(i)}>${c}</td>`).join('') + '</tr>').join('');
    return `<div class="table${cls}"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}
function stat(pairs) {
    return '<div class="stat">' + pairs.map(([k, v]) =>
        `<div><div class="k">${k}</div><div class="v">${v}</div></div>`).join('') + '</div>';
}

/* 把「张三（某某的儿子）　李四（镇长）」这种串里的人名做成链接。
   名录里查得到才变成链接，查不到原样输出——宁可不给入口，也不做出点了没反应的东西。 */
function npcLink(gid, s) {
    const all = (typeof NPC_FULL !== 'undefined' && NPC_FULL[gid]) || [];
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return String(s).split('　').map(cell => {
        const m = cell.match(/^([^（]+)(（[^）]*）)?$/);
        if (!m) return esc(cell);
        const nm = m[1].trim(), rest = m[2] || '';
        if (!all.some(x => x.n === nm)) return esc(cell);
        return `<a class="link" href="#/char/${gid}/${encodeURIComponent(nm)}">${esc(nm)}</a>${esc(rest)}`;
    }).join('　');
}



/* 物品大表：rows = [筛选键, 搜索文本, [单元格…]]
   opts.chips 用按钮筛选，opts.sel 用下拉筛选 */
/* 独立搜索表：与 ftable 同外观，但每块自带搜索框。
   一页有多张表时用它——#eqQ 只服务一张表，多张会互相抢行。 */
function ftableOwn(head, colw, rows, opts) {
    const o = opts || {};
    const w = colw || [];
    const th = head.map((h, i) =>
        `<th class="th${i === 0 ? ' left' : ''}"${w[i] ? ` style="width:${w[i]}"` : ''}>${h}</th>`).join('');
    const tr = rows.map(r => `<tr data-s="${r[0]}">` +
        r[1].map((c, i) => `<td class="td${i === 0 ? ' left' : ''}">${c}</td>`).join('') + '</tr>').join('');
    return `<div class="eqown">
        <div class="rec-filter">
            <input class="eqown-q" type="search" placeholder="${o.ph || '输入名称筛选'}" />
            <span class="mon-count eqown-c">${rows.length} 条</span>
        </div>
        <div class="table mon-table${o.cls ? ' ' + o.cls : ''}"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>
    </div>`;
}

/* ------------------------------------------------------------
   符文工房 2 / 边境 —— 鱼类表（fish 页的旧作分支）
   FISH_RF2 : [名, 卖价, 买价, 概率, 钓点]
   FISH_RFF : [名, 买价, 卖价, 等级范围, 钓点]
   两作买卖价列序相反，是源表原样，故分别渲染、不合并成同一套列。
   ------------------------------------------------------------ */
function fishOldHtml(g) {
    const id = g.id;
    /* 价格为「—」时不要拼成「—G」 */
    const money = v => (v === '—' || v === '' ? '<span class="mon-no">—</span>' : v + 'G');

    if (id === 'rf2') {
        const A = (typeof FISH_RF2 !== 'undefined') ? FISH_RF2 : [];
        if (!A.length) return '';
        const fish = A.filter(r => r[3] !== '—');
        const junk = A.filter(r => r[3] === '—');
        const rows = A.map(r => [r[0] + ' ' + r[4], [r[0], money(r[1]), money(r[2]), r[3], r[4]]]);
        const best = fish.slice().sort((a, b) => parseInt(b[1]) - parseInt(a[1])).slice(0, 5);
        return `
        <p class="p">本页是<b>《符文工房2》</b>的 ${fish.length} 种鱼${junk.length ? `，另有 ${junk.length} 种钓上杂物` : ''}。这一作的鱼<b>买得到也卖得掉</b>，但两边价差很大——指望低买高卖不是生意，是亏钱；鱼真正的用处是回 RP、做料理、喂宠物。</p>
        ${stat([['鱼种', fish.length + ' 种'], ['钓物', junk.length + ' 种'], ['字段', '买卖价·概率·钓点']])}
        <div class="key">最贵的是<b>${best.map(x => x[0] + '（卖 ' + x[1] + 'G）').join('、')}</b>。注意「卖价」永远低于「买价」，所以想要某条鱼，钓比买划算；反过来想换钱，钓上来直接出货，别绕商店。</div>

        <h2 class="h2">全鱼种</h2>
        <p class="p">「出现概率」是钓上该鱼的概率，标成区间的是随钓点或等级浮动。<b>家门口 100%</b> 指的是初始钓点只会出珠星三块鱼——所以别在自家门口刷稀有鱼，换个地方。</p>
        ${ftableOwn(['鱼种', '卖价', '买价', '出现概率', '钓点'],
            ['7rem', '3.8rem', '3.8rem', '5.4rem'],
            rows, { ph: '输入鱼名、价格或地名筛选' })}
        <div class="note">源表「钓点」一栏标注为<b>SOMA 版</b>地点。概率栏写「—」的四件（空罐、高筒靴、石头、树枝）是钓上来的杂物而非鱼，源表不给概率，此处照录。</div>

        <h2 class="h2">钓鱼在这作里是什么定位</h2>
        <p class="p">RF2 没有 RF4／RF5 那套鱼影读法（色泽、大小、抖动），操作更直接：抛竿、等咬钩、提竿。<b>真正要规划的是「在哪钓」而不是「怎么提竿」</b>——上表的钓点栏就是为这个准备的。想看鱼影机制，去鱼类图鉴的 RF4／RF5 段。</p>
        <div class="jump">
            <a href="#/page/mine">
                <div class="jp-t">采矿与钓鱼</div>
                <div class="jp-s">一天的体力怎么在锤子和鱼竿之间分</div>
            </a>
            <a href="#/page/rp">
                <div class="jp-t">体力与 RP</div>
                <div class="jp-s">鱼是 RP 的稳定来源之一</div>
            </a>
        </div>`;
    }

    if (id === 'rff') {
        const A = (typeof FISH_RFF !== 'undefined') ? FISH_RFF : [];
        if (!A.length) return '';
        const rows = A.map(r => [r[0] + ' ' + r[4], [r[0], money(r[1]), money(r[2]), r[3], r[4]]]);
        const best = A.slice().sort((a, b) => parseInt(b[2]) - parseInt(a[2])).slice(0, 5);
        const lv = A.map(r => parseInt((r[3] || '').split('~')[1] || 0));
        const lvMax = Math.max.apply(null, lv.filter(x => !isNaN(x)));
        return `
        <p class="p">本页是<b>《符文工房 边境》</b>的 ${A.length} 种鱼。<b>全部无法购买</b>——买价一栏一律是「—」，鱼只能自己钓；钓上来可以出货，也可以拿来喂魔物、做料理。</p>
        ${stat([['鱼种', A.length + ' 种'], ['可购买', '0 种'], ['钓点等级上限', lvMax + ' 级']])}
        <div class="key">最值钱的是<b>${best.map(x => x[0] + '（' + x[2] + 'G）').join('、')}</b>。注意「等级范围」不是鱼的实力，而是<b>它能出现的钓点等级区间</b>——同样一条鱼，在高级水域钓上来的等级更高，卖价按等级走。</div>

        <h2 class="h2">全鱼种</h2>
        <p class="p">这一作的钓点按<b>塔与遗迹的地下层数</b>划分，越深越高级。想刷某条鱼，直接看它的钓点栏里有哪几层，按层数排行程比乱跑省时间。</p>
        ${ftableOwn(['鱼种', '买价', '卖价', '等级范围', '钓点'],
            ['7rem', '3.8rem', '3.8rem', '5rem'],
            rows, { ph: '输入鱼名、价格或遗迹层数筛选' })}
        <div class="note">买价一栏全为「—」是源表原样：边境的鱼没有商店出售渠道。钓点里的「鲸鱼岛」各部位（胸鳍／侧腹／尾巴大树／空中回廊／四座塔庭院）与「若草／蔓草／雪草遗迹」地下层，都是游戏内实际地名。</div>

        <h2 class="h2">钓鱼在这里是「素材线」不是「赚钱线」</h2>
        <p class="p">边境的鱼更多是<b>料理与调合的原料</b>：高级鱼直接决定你能做出什么等级的料理。所以鱼竿的优先级跟着料理走——要做什么菜，就先去查那道菜要哪种鱼，再按上表的钓点去找。</p>
        <div class="jump">
            <a href="#/page/cook">
                <div class="jp-t">料理</div>
                <div class="jp-s">哪道菜要哪种鱼，料理等级怎么抬</div>
            </a>
            <a href="#/page/mine">
                <div class="jp-t">采矿与钓鱼</div>
                <div class="jp-s">一天的体力怎么在锤子和鱼竿之间分</div>
            </a>
        </div>`;
    }

    return '';
}

/* ------------------------------------------------------------
   RF3 鱼类图鉴（fish 页的 RF3 段）
   源：biligame wiki RF3fishing
   FISH_RF3 : [名, 买价, Lv1卖价, 鱼影, 钓点]
   FISH_RF3_RESORT : [鱼, Lv1卖价, 好感度总和门槛]
   ------------------------------------------------------------ */
function fishRf3Html() {
    const A = (typeof FISH_RF3 !== 'undefined') ? FISH_RF3 : [];
    const RES = (typeof FISH_RF3_RESORT !== 'undefined') ? FISH_RF3_RESORT : [];
    if (!A.length) return '';
    const money = v => (v === '—' || v === '') ? '<span class="mon-no">—</span>' : v + 'G';

    const locs = [];
    const byLoc = {};
    A.forEach(r => {
        const loc = r[4];
        if (!byLoc[loc]) { byLoc[loc] = []; locs.push(loc); }
        byLoc[loc].push(r);
    });
    const rows = A.map(r => [r[0] + ' ' + r[4], [r[0], r[4], r[3], money(r[1]), money(r[2])]]);
    const best = A.slice().sort((a, b) => parseInt(b[2]) - parseInt(a[2])).slice(0, 5);
    return `
        <p class="p">本页是<b>《符文工房3》</b>的 ${A.length} 种鱼，按钓点列出。RF3 的钓鱼没有 RF4／RF5 那种「鱼影尺寸＋金杯线」的精确数值，只有<b>鱼影大小的四档（最小／小／中／大）</b>；价格则是买价与 Lv1 卖价（卖价会随钓鱼等级上升而浮动）。</p>
        ${stat([['鱼种', A.length + ' 种'], ['钓点', locs.length + ' 处'], ['字段', '鱼影·买卖价·钓点']])}
        <div class="key">最值钱的是<b>${best.map(x => x[0] + '（卖 ' + x[2] + 'G）').join('、')}</b>。钓点分两类：<b>常驻钓点</b>（普利贝拉森林、索尔·提拉诺沙漠、奥德华山谷、茵瓦艾尔河、阿克娜湖）和<b>全地图通用</b>的乌贼／心动鲷鱼／三类空罐靴子——后者任何水面都能钓到。</div>

        <h2 class="h2">全鱼种（按钓点）</h2>
        <p class="p">「所有地点」那几行是任何水域都出的通用鱼／杂物；阿克娜湖的<b>百鱼王的鳞片</b>是稀有钓物，不是普通鱼。石池小道、阿克娜湖（普通）标注「当前季节的所有鱼」，龙玄洞标注「没有鱼」，都不计入下表。</p>
        ${ftableOwn(['鱼种', '钓点', '鱼影', '买价', 'Lv1卖价'],
            ['7rem', '8.5rem', '4.2rem', '4.2rem', '4.8rem'],
            rows, { ph: '输入鱼名或钓点筛选' })}
        <div class="note">鱼影栏「最小／小／中／大」是源表原样，对应鱼影的粗略尺寸档，没有 RF4／RF5 那种精确厘米数。买价与 Lv1 卖价取自 biligame wiki；实际卖价随钓鱼等级上升。部分鱼（如沙比目鱼、剧毒虹鳟）在 biligame 为红链页面，中文名以源表为准。</div>

        <h2 class="h2">卡尔洛斯度假村（付费钓场）</h2>
        <p class="p">向卡门或卡洛斯付 <b>入场费 1200G</b> 才能进的私人钓场，鱼种和好感度挂钩——伊奥与卡洛斯的好感度总和达到门槛才放对应的鱼。</p>
        ${tbl(['鱼', 'Lv1卖价', '解锁条件（好感度总和）'],
            RES.map(r => [r[0], money(r[1]), r[2]]),
            { leftFirst: true, colw: ['7rem', '5.5rem'] })}
        <div class="jump">
            <a href="#/page/cook">
                <div class="jp-t">料理</div>
                <div class="jp-s">高级鱼决定能做什么等级的料理</div>
            </a>
            <a href="#/page/mine">
                <div class="jp-t">采矿与钓鱼</div>
                <div class="jp-s">体力在锤子和鱼竿之间怎么分</div>
            </a>
        </div>`;
}

/* ------------------------------------------------------------
   RF1 钓鱼（fish 页的 RF1 段）
   数据：FISH_RF1 = [钓点中文名, 钓点备注, [[鱼中文名, 出现率, 卖价], ...]]
   出现率取自 Fandom Fishing_(RF)，卖价取自 Fish_(RF)。
   ------------------------------------------------------------ */
function fishRf1Html() {
    const S = (typeof FISH_RF1 !== 'undefined') ? FISH_RF1 : [];
    if (!S.length) return '';
    const money = v => (v === '—' || v === '' || v == null) ? '<span class="mon-no">—</span>' : v + 'G';

    const rows = [];
    const byFish = {};
    const priceOf = {};
    S.forEach(([spot, , fishes]) => {
        fishes.forEach(([name, rate, price]) => {
            rows.push([name + ' ' + spot, [name, spot, rate, money(price)]]);
            (byFish[name] = byFish[name] || []).push([spot, rate]);
            if (priceOf[name] === undefined) priceOf[name] = price;
        });
    });

    const fishNames = Object.keys(byFish).sort((a, b) => a.localeCompare(b, 'zh'));
    const fishRows = fishNames.map(n => {
        const spots = byFish[n].slice().sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        const detail = spots.map(s => s[0] + ' ' + s[1]).join('、');
        return [n, [n, money(priceOf[n]), spots.length + ' 处', detail]];
    });

    const totalFish = fishNames.length;
    const totalSpot = S.length;
    const best = fishNames.slice().sort((a, b) => parseInt(priceOf[b] || '0') - parseInt(priceOf[a] || '0')).slice(0, 5);

    return `
        <p class="p">本页是<b>《符文工房1》</b>的钓鱼数据：全 ${totalSpot} 个钓点、${totalFish} 种可钓物（含空罐、高筒靴等杂物）。RF1 <b>没有季节与昼夜机制</b>，所以只按钓点列；表格给出每处的<b>出现率（Catch Rate）</b>与<b>卖价</b>。</p>
        ${stat([['鱼种', totalFish + ' 种'], ['钓点', totalSpot + ' 处'], ['字段', '出现率·卖价·钓点']])}
        <div class="key">最值钱的是<b>${best.map(x => x + '（卖 ' + money(priceOf[x]) + '）').join('、')}</b>。海边、农场与河流是起点；各洞窟（卡麦特／特罗斯／克莱门斯／癸干忒／密丝特布鲁姆／卡西米尔／达努／格力德）与遗迹外则出高阶鱼和 Boss 级鲷鱼。</div>

        <h2 class="h2">钓点 × 鱼（出现率 · 卖价）</h2>
        <p class="p">每行是「某钓点里能钓到的某条鱼」。出现率来自 Fandom 的 Fishing_(RF)，卖价来自 Fish_(RF)。</p>
        ${ftableOwn(['鱼种', '钓点', '出现率', '卖价'],
            ['7rem', '9rem', '4.5rem', '4.5rem'],
            rows, { ph: '输入鱼名或钓点筛选' })}

        <h2 class="h2">鱼种 → 出没钓点</h2>
        <p class="p">倒过来查：某种鱼在哪些钓点出没、各处的出现率是多少。</p>
        ${ftableOwn(['鱼种', '卖价', '出没', '各钓点出现率'],
            ['7rem', '4.5rem', '4rem', '20rem'],
            fishRows, { ph: '输入鱼名筛选' })}

        <div class="note">中文名取自汉化版《RF1文本翻译对照表（校对7）》的日文→中文映射（<b>非 SE 官方</b>，汉化组译法，不同汉化组可能有出入），例如 鳟鱼=Cherry Salmon、鲭鱼=Mackerel、鰤鱼=Yellowtail、银鲫鱼=Crucian Carp、鲽鱼=Turbot、珠星鱼=Chub、黑毛鱼=Girella、西太公鱼=Pond Smelt、螯龙虾=Lobster、斑乌贼=Jamasquid、伊富鱼=Taimen、心动鲷鱼=Lover Snapper。事实层（出现率、卖价、钓点分布）来自 Fandom 双页交叉核对，可信。以下 4 种暂无汉化对照表直接对应，采用通用水产译名或系列原创名音译，作为本站定名（如有更准汉化对应可再替换）：基贝里奥(Gibelio·系列原创名)、秋比目鱼(Fall Flounder·秋生比目鱼)、狗鱼(Pike·狗鱼 Esox lucius)、真鳟(Masu Trout·马苏鲑类)。<b>钓点名</b>多数采用本站洞窟定稿（卡麦特／特罗斯／克莱门斯／癸干忒／密丝特布鲁姆／卡西米尔／达努／格力德），海边、农场与河流、密丝特布鲁姆洞窟外 为该表无存盘点记录者，用通译。</div>
    `;
}

/* ------------------------------------------------------------
   RF4 钓点与季节（fishspot 页的 RF4 段）
   表结构：[鱼名, 春,春·雨,夏,夏·雨,秋,秋·雨,冬,冬·雨,
             沙池, 伊德拉B2, 伊德拉B1, 约克米尔瀑布, 约克米尔池,
             水之遗迹, 玛雅之路, 塞克斯洞窟, 地点17~21]
   ------------------------------------------------------------ */
function fishspot4Html() {
    const R = (typeof SPOT4 !== 'undefined') ? SPOT4 : [];
    const SEA = ['春', '春·雨', '夏', '夏·雨', '秋', '秋·雨', '冬', '冬·雨'];
    const WAT = ['沙池', '伊德拉B2', '伊德拉B1', '约克米尔瀑布', '约克米尔池', '水之遗迹', '玛雅之路', '塞克斯洞窟'];
    const UNK = ['地点17', '地点18', '地点19', '地点20', '地点21'];
    const fmt = v => v < 0.1 ? '&lt;0.1%' : v.toFixed(1) + '%';
    const p = v => v > 0 ? fmt(v) : '<span class="mon-no">—</span>';
    const at = (n, i) => { const r = R.find(x => x[0] === n); return r ? r[1 + i] : 0; };
    const junk = i => Math.round((at('空罐', i) + at('高筒靴', i)) * 100) / 100;
    const mainAt = i => {
        const a = R.filter(r => r[1 + i] > 0).sort((x, y) => y[1 + i] - x[1 + i])[0];
        return a ? a[0] + ' <b>' + a[1 + i].toFixed(1) + '%</b>' : '—';
    };
    const watMax = r => {
        let m = 0, k = -1;
        for (let i = 8; i <= 15; i++) if (r[1 + i] > m) { m = r[1 + i]; k = i; }
        return [m, k];
    };
    const has = (r, i0, i1) => { for (let i = i0; i <= i1; i++) if (r[1 + i] > 0) return true; return false; };
    const pick = (i0, i1) => R.filter(r => has(r, i0, i1));
    const SEASI = [0, 2, 4, 6];
    const seasOf = r => SEASI.filter(i => r[1 + i] > 0);
    const envsOf = r => Array.from({ length: 21 }, (_, i) => i).filter(i => r[1 + i] > 0);
    const solo = R.filter(r => envsOf(r).length === 1);
    const oneS = R.filter(r => seasOf(r).length === 1);
    const fourS = R.filter(r => seasOf(r).length === 4);
    const cnt = (i0, i1) => R.filter(r => has(r, i0, i1)).length;
    const top = i => R.filter(r => r[1 + i] > 0).sort((a, b) => b[1 + i] - a[1 + i])[0];
    const seaRows = pick(0, 7), watRows = pick(8, 15), unkRows = pick(16, 20);

    const mk = (i0, names) => R.filter(r => has(r, i0, i0 + names.length - 1)).map(r => [
        r[0], [r[0]].concat(names.map((_, k) => p(r[1 + i0 + k]))),
    ]);
    const head = names => ['鱼／钓物'].concat(names);

    /* 雨天：同一季节晴/雨两列的种类数 */
    const pairs = [[0, 1, '春'], [2, 3, '夏'], [4, 5, '秋'], [6, 7, '冬']].map(([a, b, nm], k) => [
        nm, cnt(a, a) + ' / ' + cnt(b, b), cnt(a, a) === cnt(b, b) ? '相同' : '<b>不同</b>',
    ]);

    /* 晴天→雨天变动最大的几条 */
    const moves = [];
    [[0, 1, '春'], [2, 3, '夏'], [4, 5, '秋'], [6, 7, '冬']].forEach(([a, b, nm]) => {
        R.forEach(r => {
            const d = Math.round((r[1 + b] - r[1 + a]) * 10) / 10;
            if (r[1 + a] > 0 || r[1 + b] > 0) moves.push([d, r[0], nm, r[1 + a], r[1 + b]]);
        });
    });
    moves.sort((x, y) => y[0] - x[0]);
    const up = moves.slice(0, 4), down = moves.slice(-4).reverse();
    const mvRow = (d, n, s, a, b) => [
        n + '（' + s + '）', fmt(a), fmt(b),
        '<b>' + (d > 0 ? '+' : '−') + Math.abs(d) + '</b>',
    ];

    return `
            <h2 class="h2">RF4 的表拆成两套，而且是两套不同的坐标系</h2>
            <p class="p">RF5 的钓鱼数据是「钓点 × 季节」的二维网格。RF4 不是——它把 21 个环境列平铺在同一张表上：<b>前 8 列是「季节 × 天气」</b>（春、春·雨、夏、夏·雨、秋、秋·雨、冬、冬·雨），<b>后 13 列是固定水域</b>（沙池、伊德拉 B1/B2、约克米尔瀑布与池、水之遗迹、玛雅之路、塞克斯洞窟，外加 5 处原表未命名的地点）。</p>
            <p class="p">这两组不是同一个维度。前 8 列描述的是<b>野外随便一口水面</b>的产出；后 13 列是<b>特定坐标</b>的产出。所以「春天能钓什么」和「水之遗迹能钓什么」是两张不同的答案，不能相乘，也不能互相替代。</p>
            ${stat([['收录鱼与钓物', R.length + ' 种'], ['环境列', '21 个'], ['只在单点出现', solo.length + ' 种']])}

            <h2 class="h2">八处水域分成两类：两个综合池，六个专精池</h2>
            <p class="p">玛雅之路能钓到 <b>${cnt(14, 14)} 种</b>，水之遗迹 <b>${cnt(13, 13)} 种</b>——整个表才 ${R.length} 种。除了沙池特供的砂比目鱼、岩石鱼，以及水龙羽鳍、圆石，玛雅之路基本什么都有。</p>
            <p class="p">其余六处就窄得多——最窄的沙池只有 ${cnt(8, 8)} 种，最宽的塞克斯洞窟 ${cnt(15, 15)} 种，而且每一处都有压倒性的「主产」：约克米尔瀑布一半是剧毒虹鳟，伊德拉 B1 八成二是虾，沙池九成五是砂比目鱼。<b>综合池适合刷图鉴，专精池适合定点刷某一种</b>——这两种需求在 RF4 里被拆到了不同的水面。</p>
            ${tbl(['水域', '可钓', '垃圾率', '主产', '定位'], [
                ['玛雅之路', '<b>' + cnt(14, 14) + ' / ' + R.length + '</b>', fmt(junk(14)), mainAt(14), '综合池'],
                ['水之遗迹', '<b>' + cnt(13, 13) + ' / ' + R.length + '</b>', fmt(junk(13)), mainAt(13), '综合池'],
                ['塞克斯洞窟', cnt(15, 15) + ' / ' + R.length, fmt(junk(15)), mainAt(15), '专精池'],
                ['约克米尔池', cnt(12, 12) + ' / ' + R.length, fmt(junk(12)), mainAt(12), '专精池'],
                ['约克米尔瀑布', cnt(11, 11) + ' / ' + R.length, fmt(junk(11)), mainAt(11), '专精池'],
                ['伊德拉 B2', cnt(9, 9) + ' / ' + R.length, fmt(junk(9)), mainAt(9), '专精池'],
                ['伊德拉 B1', cnt(10, 10) + ' / ' + R.length, fmt(junk(10)), mainAt(10), '专精池'],
                ['沙池', cnt(8, 8) + ' / ' + R.length, fmt(junk(8)), mainAt(8), '专精池'],
            ], { leftFirst: true, colw: ['7.4rem', '4.2rem', '4.2rem', '9rem', '5rem'], cls: 'spot' })}
            <div class="key">最省事的用法是<b>反着查</b>：缺图鉴先去玛雅之路；想刷剧毒虹鳟去约克米尔瀑布或玛雅之路（30.8%，单一水面最高占比之一）；想刷乌贼去伊德拉 B2（两只乌贼合计九成）；想刷虾，伊德拉 B1 一竿八成是虾。</div>

            <h2 class="h2">固定水域不看季节——冬天的鱼，进洞窟随时能钓</h2>
            <p class="p">前 8 列和后 13 列不只是「地点不同」，<b>连时间维度都不一样</b>。看河豚：在季节列里它只在冬天出现（冬 ${fmt(at('河豚', 6))}）；可到了塞克斯洞窟那一列，河豚占 <b>13.5%</b>——比它在任何季节都高。西太公鱼、石川鲑鱼、虾也是一样，在季节列被锁死在某一季，在固定水域却全年都在。</p>
            ${tbl(['季节限定的鱼', '季节列', '固定水域最高'], oneS.map(r => {
                const s0 = seasOf(r)[0];
                const [m, k] = watMax(r);
                return [r[0], SEA[s0] + ' ' + fmt(r[1 + s0]), m > 0 ? WAT[k - 8] + ' <b>' + fmt(m) + '</b>' : '<span class="mon-no">—</span>'];
            }), { leftFirst: true, colw: ['8rem', '8rem', '10rem'] })}
            <div class="key">这条改变打法：<b>季节限定只约束野外那口通用水面</b>。与其等到冬天再去蹲河豚，不如直接跑一趟塞克斯洞窟——那儿一年四季都出，而且占比还更高。虾更极端：夏天野外 ${fmt(at('虾', 2))}，伊德拉 B1 直接 ${fmt(at('虾', 10))}。<br>RF5 不是这个机制。RF5 的「钓点」和「季节」是同一张二维表的两根轴，季节始终生效，所以那边必须等季。</div>

            <h2 class="h2">沙池：两种鱼包掉 99.7%</h2>
            <p class="p">沙池只有四样东西——砂比目鱼 <b>${fmt(at('砂比目鱼', 8))}</b>、岩石鱼 <b>${fmt(at('岩石鱼', 8))}</b>，剩下 ${fmt(junk(8))} 是空罐和高筒靴。这是全表最极端的单点池。而且砂比目鱼和岩石鱼<b>整个表里只在这一个地方出现</b>，连季节列里都没有。</p>
            ${tbl(['全表只在一处出现的', '在哪'], solo.map(r => [r[0], SEA.concat(WAT).concat(UNK)[envsOf(r)[0]]]), { leftFirst: true, colw: ['11rem', '8rem'] })}
            <div class="key">全表 ${R.length} 种里<b>只有 ${solo.length} 种是单点独占</b>，除沙池那两样之外就是圆石（约克米尔瀑布 ${fmt(at('圆石', 11))}）。这个比例远低于 RF5——RF5 有 17 种独占，其中 10 种在「一同垂钓」。<b>RF4 的鱼种分布是「广撒」型，同一种鱼好几个水域都有</b>；RF5 才改成「钓鱼点各有自己的名单」。</div>

            <h2 class="h2">五个未命名地点：一串整齐到可疑的递减</h2>
            <p class="p">原表最后 5 列只写了 <code>Loc 17</code> 到 <code>Loc 21</code>，没有地名。它们的内容高度一致——只有石川鲑鱼、空罐、高筒靴、罕见的空罐四种，而且数值排得过于整齐：</p>
            ${tbl(['地点', '石川鲑鱼', '空罐', '高筒靴', '罕见的空罐', '合计垃圾率'], UNK.map((n, k) => {
                const i = 16 + k;
                return [n, '<b>' + fmt(at('石川鲑鱼', i)) + '</b>', fmt(at('空罐', i)), fmt(at('高筒靴', i)), fmt(at('罕见的空罐', i)), fmt(junk(i))];
            }), { leftFirst: true, colw: ['6rem', '6.4rem', '5rem', '5rem', '7rem', '7rem'], cls: 'spot' })}
            <p class="p">石川鲑鱼从 ${fmt(at('石川鲑鱼', 16))} 一路涨到 ${fmt(at('石川鲑鱼', 20))}，垃圾率从 ${fmt(junk(16))} 一路掉到 ${fmt(junk(20))}，中间没有一次反复。这种单调性不像手工填写，更像<b>按某个参数（等级、深度、或地图内顺序）生成的五档</b>。</p>
            <div class="key">不必纠结这五个编号对应哪里，记住结论就够：<b>这五处是「石川鲑鱼 + 垃圾」的低级水洼</b>。要刷石川鲑鱼（春天野外最常见的鱼）在哪都一样；但如果你在攒钱、不想浪费抛竿次数，别在这五处耗——季节列的垃圾率只有 <b>${fmt(junk(0))}</b>，这里最高到 <b>${fmt(junk(16))}</b>，差六十倍。</div>

            <h2 class="h2">雨天只重新洗牌，不换名单</h2>
            <p class="p">每个季节在表里都占两列：晴天一列、雨天一列。四个季节里，<b>晴雨两列的种类数完全一样</b>——所以下雨不会「多出一种鱼」或「少掉一种鱼」，只是把同一批鱼的权重重新分配：</p>
            ${tbl(['季节', '晴天／雨天 种类数', '是否换名单'], pairs, { leftFirst: true, colw: ['5rem', '9rem', '6rem'] })}
            <p class="p">变化最大的是这几条（单位：百分点）：</p>
            ${tbl(['雨天变多的', '晴', '雨', '变化（百分点）'], up.map(x => mvRow(...x)), { leftFirst: true, colw: ['8.6rem', '4rem', '4rem', '7rem'], cls: 'spot' })}
            ${tbl(['雨天变少的', '晴', '雨', '变化（百分点）'], down.map(x => mvRow(...x)), { leftFirst: true, colw: ['8.6rem', '4rem', '4rem', '7rem'], cls: 'spot' })}
            <div class="key">变动的方向<b>并不统一</b>：狗鱼在秋天雨天掉 6.2 点，萤乌贼在春天反而涨了 2 点多。所以不存在「雨天更容易出稀有鱼」这种一句话结论——雨天是把池子往另一个方向推，推到哪取决于鱼种。真要抓某一种鱼，<b>先看它在晴天那列还是雨天那列更高</b>。</div>

            <h2 class="h2">野外只有 ${fourS.length} 种四季通吃</h2>
            <p class="p">把每种鱼在季节列里出现过的季节数一遍，真正四季常驻的只有 ${fourS.length} 种（含空罐、高筒靴这些钓物）：${fourS.map(r => r[0]).join('、')}。剩下的不是缺一季就是只在一季——这也是为什么「换季要换钓点」在 RF4 里比 RF5 更成立。</p>
            <p class="p">和 RF5 对照着看更有意思：RF5 的季节限定是 4 种（石川鲑鱼春、钩吻鲑秋、西太公鱼与河豚冬），<b>虾在 RF5 里四季都有</b>；RF4 的虾只在夏天。石川鲑鱼两作都是春限，钩吻鲑两作都是秋限。</p>
            <div class="key">所以「季节限定」是<b>每作各自定义</b>的，不能跨作套用。同一系列里，鱼的稀有度、季节、甚至出现的钓点都会重排——这也是本站每部作品各留一套数据的原因。</div>

            <h2 class="h2">全部 ${seaRows.length} 种：季节 × 天气</h2>
            <p class="p">百分比是该鱼在<b>这一列（这一季、这种天气）</b>里的出现率，<b>每一整列加起来 100%</b>。横着加没有意义，那是八种不同的天气。「—」是这一季不出。<b>另有 ${R.length - seaRows.length} 种不在这张表里</b>（${R.filter(r => !has(r, 0, 7)).map(r => r[0]).join('、')}），它们只出现在固定水域。</p>
            ${ftableOwn(head(SEA), ['6.2rem'].concat(Array(8).fill('3.3rem')), mk(0, SEA), { ph: '输入鱼名', cls: 'spot' })}

            <h2 class="h2">全部 ${watRows.length} 种：固定水域</h2>
            <p class="p">这一组<b>与季节无关</b>——只要站在这个水域，一年四季都是这套概率（表中不出现季节维度）。同样每列归一化到 100%，「—」是这个水域钓不到。<b>水龙羽鳍是唯一一种只挂在季节表里的鱼</b>——它在八个季节列各占 0.03% 上下，却不出现在任何固定水域。</p>
            ${ftableOwn(head(WAT), ['6.2rem'].concat(Array(8).fill('3.3rem')), mk(8, WAT), { ph: '输入鱼名', cls: 'spot' })}

            <div class="note">取自《RF4 数据解包汉化版 Datamining Compendium》的 <code>Fish Rates NS</code> 表，原始 38 行有效记录 × 21 个环境列。原表数值是裸权重（每列总量 1213 ~ 5918 不等），本页<b>逐列归一化成百分比</b>后再展示，所以列与列之间的绝对量不可比。不足 0.1% 的零星概率显示为 <code>&lt;0.1%</code>（原值保留两位小数，没有抬高）。<br><b>译名修正</b>：原表中文列在 <code>Pike</code> 之后整体错位一行，多插了「秋刀鱼」「高身鲫」两个本表没有的名字，导致狗鱼、河豚、青甘鱼、鲫鱼四条的中文名全部串位。本页按英文原名改回。<br><b>关于 3DS 版</b>：同文件另有一张 <code>Fish Rates 3DS</code>，与 NS 表只有 4 种鱼（乌贼、剧毒虹鳟、高身鲫、萤乌贼）共 27 个格子的权重不同，其中三种恰好缩到 NS 的十分之一，乌贼反而在伊德拉 B2 从 500 涨到 1020——方向不一致，更像录入时的量纲差异而非版本平衡。本页以 NS 表为准。</div>

            <div class="jump">
                <a href="#/page/fish">
                    <div class="jp-t">鱼类图鉴</div>
                    <div class="jp-s">鱼影读法、金杯线，以及全鱼种价格</div>
                </a>
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">钓鱼在一天的体力预算里占多少</div>
            </a>
        </div>`;
    }

    /* ------------------------------------------------------------
       RFO 钓点与季节（fishspot 页的 RFO 段）
       数据 SPOT_RFO：[地点, 区域, 季节, 时间, [[鱼名, 概率], ...]]
       源：biligame RFOfishing（地点 × 区域 × 季节 × 时间 × 4 鱼概率）
       ------------------------------------------------------------ */
    function fishspotRfoHtml() {
        const R = (typeof SPOT_RFO !== 'undefined') ? SPOT_RFO : [];
        if (!R.length) return '';
        const show = r => r[0] + (r[1] ? ' ' + r[1] : '');
        const locSet = {}; R.forEach(r => locSet[show(r)] = 1);
        const locs = Object.keys(locSet);
        const fishSet = {}; R.forEach(r => r[4].forEach(f => fishSet[f[0]] = 1));
        const fishes = Object.keys(fishSet).sort();
        const byFish = {};
        R.forEach(r => r[4].forEach(f => { (byFish[f[0]] = byFish[f[0]] || new Set()).add(show(r)); }));
        const cell = v => v > 0 ? v + '%' : '<span class="mon-no">—</span>';
        const fc = f => f[0] + ' <b>' + f[1] + '%</b>';
        const pad = arr => { const a = arr.slice(); while (a.length < 4) a.push(null); return a; };

        const rows = R.map(r => {
            const sc = pad(r[4]);
            return [show(r) + ' ' + r[2] + r[3], [
                show(r), r[2], r[3],
                sc[0] ? fc(sc[0]) : cell(0), sc[1] ? fc(sc[1]) : cell(0),
                sc[2] ? fc(sc[2]) : cell(0), sc[3] ? fc(sc[3]) : cell(0),
            ]];
        });
        const fishRows = fishes.map(n => {
            const ls = Array.from(byFish[n]);
            return [n, [n, ls.length + ' 处', ls.slice(0, 4).join('、') + (ls.length > 4 ? '…' : '')]];
        });

        return `
        <h2 class="h2">海洋的钓鱼是「地点 × 季节 × 时间」三重坐标</h2>
        <p class="p">和 RF4（环境列平铺）、RF5（钓点 × 季节）都不同，海洋把概率拆成了<b>地点、区域、季节、时段（昼／夜）四层</b>。同一个地点，白天和晚上出的鱼可能完全不一样——比如白沙海滩白天是沙丁鱼针鱼，晚上变成乌贼河豚。每一格内部归一化成 100%，格子之间不能比。</p>
        ${stat([['钓点', locs.length + ' 处'], ['鱼与钓物', fishes.length + ' 种'], ['有效条目', R.length + ' 条']])}
        <div class="key">最省事的用法是<b>反向查</b>：想钓某种鱼，直接去「鱼种 → 钓点」那张表看它常出没在哪，再对照上面的时间。比如<b>虾</b>几乎只在海边的洞窟 2 池（95%）和夜晚近海出现；<b>金枪鱼</b>只在外洋、封冰岛、触礁沉船这些远海点；<b>西太公鱼</b>系列（铜／银／金）是封冰岛 2 池的独占高阶鱼。</div>

        <h2 class="h2">全部 ${R.length} 条：地点 × 季节 × 时间</h2>
        <p class="p">百分比是该地点在该季节该时段的占比，<b>每一格内部加起来 100%</b>。空缺（—）是这个组合完全不出。「鱼1~4」按源表顺序，概率由高到低大致排列。</p>
        ${ftableOwn(['钓点', '季', '时', '鱼1', '鱼2', '鱼3', '鱼4'],
            ['9rem', '2.4rem', '2.4rem', 'auto', 'auto', 'auto', 'auto'],
            rows, { ph: '输入钓点或鱼名筛选' })}

        <h2 class="h2">${fishes.length} 种鱼：去哪钓</h2>
        <p class="p">下表按鱼种列出它出现过的钓点数量，并给出前几处。某鱼只在「鱼群 B」这类特殊点出现，说明它是乌贼系专属；只在封冰岛 2 池出现的，多为西太公鱼高阶变种。</p>
        ${ftableOwn(['鱼', '出现钓点', '常出没'], ['6rem', '4rem', 'auto'], fishRows, { ph: '输入鱼名筛选' })}

        <div class="note">源表来自 biligame 符文工厂 wiki《RFOfishing》。原表为「地点·区域·季节·时间·四鱼概率」的二维表，本页逐条录入共 ${R.length} 条、${locs.length} 个钓点、${fishes.length} 种鱼（含西太公鱼／铜／银／金 四种进阶变种）。概率栏为源表原值（百分比）。季节对海洋是「春／夏／秋／冬」四档，时间分昼（06:00–18:00）与夜（18:00–06:00）。</div>

        <div class="jump">
            <a href="#/page/mine">
                <div class="jp-t">采矿与钓鱼</div>
                <div class="jp-s">钓鱼在一天体力预算里占多少</div>
            </a>
            <a href="#/page/cook">
                <div class="jp-t">料理</div>
                <div class="jp-s">哪道菜要哪种鱼</div>
            </a>
        </div>`;
    }

    /* ------------------------------------------------------------
       RF4 农作（crop 页的 RF4 段）
   表结构：[名, [四段天数], 再生天数, 每株产量, 初始HP, 种子价, 单个卖价, [土综合,土速度,土品质,土尺寸,土数量]]
   ------------------------------------------------------------ */
function crop4Html() {
    const R = (typeof CROP_RF4 !== 'undefined') ? CROP_RF4 : [];
    const num = v => v.toLocaleString('en-US');
    const T = r => r[1].reduce((a, b) => a + b, 0);
    const gross = r => r[3] * r[6];                     // 单株一次收获的总价
    const day = r => { const t = T(r); return t ? (gross(r) - r[5]) / t : 0; };   // 首轮日收益
    const reg = r => r[2] > 0 ? gross(r) / r[2] : 0;    // 再生周期日收益
    const bk = r => gross(r) > 0 ? r[5] / gross(r) : 0; // 回本次数
    const soilSum = r => r[7].reduce((a, b) => a + b, 0);
    const get = n => R.filter(r => r[0] === n)[0] || null;
    const PB = get('菠萝'), GF = get('金刚花'), WD = get('白水晶'), GT = get('金芜菁');

    const dt = r => day(r).toFixed(1);

    const stageTxt = r => r[1].filter(x => x > 0).join(' · ');
    const segs = r => r[1].filter(x => x > 0).length;

    const mainRows = R.slice().sort((a, b) => T(a) - T(b) || a[0].localeCompare(b[0], 'zh'))
        .map(r => [r[0], [
            r[0], stageTxt(r),
            String(T(r)),
            r[2] ? r[2] + ' 天' : '<span class="mon-no">—</span>',
            r[3] ? String(r[3]) : '<span class="mon-no">—</span>',
            r[5] ? num(r[5]) : '<span class="mon-no">—</span>',
            r[6] ? num(r[6]) : '<span class="mon-no">—</span>',
            r[3] ? '<b>' + day(r).toFixed(1) + '</b>' : '<span class="mon-no">—</span>',
        ]]);

    const fast = R.filter(r => T(r) <= 10).length;
    const topDay = R.slice().sort((a, b) => day(b) - day(a)).slice(0, 8);
    const regRows = R.filter(r => r[2] > 0).sort((a, b) => reg(b) - reg(a));
    const lose = R.filter(r => r[3] > 0 && gross(r) < r[5]);

    const soilTop = R.slice().sort((a, b) => soilSum(b) - soilSum(a)).slice(0, 8);
    const crys = R.filter(r => /水晶/.test(r[0]));
    const SL = ['综合', '速度', '品质', '尺寸', '数量'];

    return `
        <h2 class="h2">${R.length} 种作物，从 ${Math.min.apply(null, R.map(T))} 天到 ${Math.max.apply(null, R.map(T))} 天</h2>
        <p class="p">下面这张表全都来自解包数据，不是估的。四个阶段的天数是原表给的，加起来就是一株从播种到成熟的总天数；「再生」是成熟后不收拔、继续结果的天数间隔。注意<b>阶段最多四段</b>，很多作物第三段满了就直接收获——${R.filter(r => r[1][3] === 0 && r[1][2] > 0).length} 种只走三段，菠菜甚至只有两段（1 + 1 = 2 天）。</p>
        ${stat([
        ['收录作物', R.length + ' 种'],
        ['10 天内成熟', fast + ' 种'],
        ['最长', Math.max.apply(null, R.map(T)) + ' 天'],
    ])}
        <p class="p">「日收益」= （每株产量 × 单个卖价 − 种子价）÷ 总天数，指的是<b>一株、一轮</b>的平均日产出，没有算你手里有几块地。</p>
        ${ftableOwn(['作物', '四段天数', '合计', '再生', '每株产量', '种子价', '单个卖价', '首轮日收益'],
        ['6.6rem', '8rem', '3.6rem', '4.2rem', '4.6rem', '5rem', '5rem', '6rem'],
        mainRows, { ph: '输入作物名', cls: 'crop' })}

        <h2 class="h2">长得最慢的反而最赚——代价是压在土里三个多月</h2>
        <p class="p">按单株日收益排，前八名全是<b>长周期高价值作物</b>，而且几乎全是金色系与水晶系：金刚花 ${dt(GF)} / 天，白水晶 ${dt(WD)}、金芜菁 ${dt(GT)} / 天。这和「短周期滚钱」的直觉相反，原因很简单——短周期作物的日收益被<b>种子价</b>摊得很薄，长周期作物的种子贵，但卖价贵得更多。</p>
        ${tbl(['作物', '总天数', '种子价', '单株卖', '首轮日收益'], topDay.map(r => [
        r[0], String(T(r)), num(r[5]), num(gross(r)), '<b>' + day(r).toFixed(1) + '</b>',
    ]), { leftFirst: true, colw: ['7rem', '5rem', '6rem', '6rem', '7rem'] })}
        <div class="key">但别忽略那张表没写的东西：<b>日收益高不等于周转快</b>。金刚花一株要 120 天、占一格地；同样一格地在 120 天里能轮 40 茬芜菁。真正该问的是「我这块地有多少天可以押」——<b>钱少的时候押不起长周期，钱多的时候短周期又填不满格子</b>。金刚花 5 万的种子钱本身就是一道门槛。</div>

        <h2 class="h2">再生型 ${regRows.length} 种，其中 ${lose.length} 种第一轮是亏的</h2>
        <p class="p">再生型作物收完不拔，隔固定天数再结一次。这类作物的正确算法不是首轮，而是<b>「回本次数」</b>：种子价 ÷ 一次收获的总价。大于 1 就说明第一轮还亏钱，必须收第二轮才回本。</p>
        ${tbl(['作物', '种子价', '一次收获', '回本还差', '再生间隔', '再生期日收益'], regRows.map(r => [
        r[0], num(r[5]), num(gross(r)),
        bk(r) > 1 ? '<b class="dn">' + (bk(r) * 100 - 100).toFixed(0) + '%</b>' : '<b class="up">已回本</b>',
        r[2] + ' 天', '<b>' + reg(r).toFixed(0) + '</b>',
    ]), { leftFirst: true, colw: ['6.6rem', '5.4rem', '5.4rem', '5.6rem', '5rem', '7rem'], cls: 'spot' })}
        <p class="p">${lose.map(r => r[0]).join('、')} 三种第一轮是负收益（种子比一茬收成还贵），但因为再生间隔只有 3 天，从第二轮开始就变成纯利润——${lose.map(r => r[0] + ' 每 ' + r[2] + ' 天 ' + num(gross(r))).join('、')}，而且不用再买种子。这类作物最怕的是种下去收一轮就拔掉，等于白亏种子钱。</p>
        <div class="key">再生型里的效率冠军是<b>菠萝</b>：单株一次 ${PB[3]} 个 × ${num(PB[6])} = ${num(gross(PB))}，再生只要 ${PB[2]} 天，<b>平均每天 ${reg(PB).toFixed(0)}</b>，比金刚花的 ${dt(GF)} 还高一截，而总天数只有 ${T(PB)} 天。唯一的问题是种子 ${num(PB[5])}，前期买不起。<br>另外一个极端是<b>牧草</b>：再生 1 天、单株只卖 60，看着可怜，但它是喂家畜的必需品——它的价值不在卖钱。</div>

        <h2 class="h2">土壤五项系数：每种作物吃的不是同一样东西</h2>
        <p class="p">原表给每种作物五个系数，对应田地的五项属性：综合、速度、品质、尺寸、数量。系数越大，说明这项属性对这一作物的影响越强。<b>原表没有给出计算公式，这里只按数值排，不猜机制</b>，但排列本身已经很说明问题。</p>
        ${tbl(['作物', '合计', '综合', '速度', '品质', '尺寸', '数量'], soilTop.map(r => [
        r[0], '<b>' + soilSum(r).toFixed(2) + '</b>',
    ].concat(r[7].map(v => v ? v.toFixed(2) : '<span class="mon-no">—</span>'))), {
        leftFirst: true, colw: ['7rem', '4.4rem', '4.4rem', '4.4rem', '4.4rem', '4.4rem', '4.4rem'], cls: 'spot',
    })}
        <p class="p">最吃地力的是${soilTop[0][0]}（合计 ${soilSum(soilTop[0]).toFixed(2)}），五项全 ${soilTop[0][7][1].toFixed(2)} 上下、综合 ${soilTop[0][7][0].toFixed(2)}，是唯一五项都被拉满的作物——它 ${T(soilTop[0])} 天的周期全靠田地加成往回抢。反过来<b>牧草五项全是 0</b>，种在什么地上都一样长，这也是它适合当「填充作物」的原因。</p>
        <p class="p">更有意思的是这 ${crys.length} 块水晶——它们各自只认一项：${crys.map(r => {
        const mx = Math.max.apply(null, r[7].slice(0, 5));
        const i = r[7].indexOf(mx);
        return r[0] + ' 偏 <b>' + SL[i] + '</b>（' + mx.toFixed(2) + '）';
    }).join('、')}。同样是「贵种子 + 长周期」，想刷其中哪一种，就得先把对应的那项土壤属性堆上去，堆错方向等于白施肥。</p>
        <div class="note">表里 ${R.filter(r => r[3] === 0).length} 种的产量列是 0（${R.filter(r => r[3] === 0).map(r => r[0]).join('、')}）：苹果、橘子、葡萄是树，种下去长成树之后按树收；剑草之剑、钢身花之盾是「长出来的装备」；闪耀树、田地迷宫是特殊设施。这几样不适用「每株产量」这个概念，页面上不硬填。<br>另外，<b>解包表里没有季节字段</b>，所以这一页不标哪季能种——不猜。</div>
    `;
}

function crop5Html() {
    const R = (typeof CROP_RF5 !== 'undefined') ? CROP_RF5 : [];
    const num = v => (v && v > 0) ? v.toLocaleString('en-US') : '—';
    const gross = r => r[4] * r[6];
    const day = r => (r[4] > 0 && r[5] > 0) ? (gross(r) - r[5]) / r[1] : 0;
    const regDay = r => r[7] > 0 ? gross(r) / r[7] : 0;
    const bk = r => gross(r) > 0 ? r[5] / gross(r) : 0;
    const tot = R.length;
    const buyable = R.filter(r => r[5] > 0).length;
    const regRows = R.filter(r => r[7] > 0 && r[4] > 0);
    const topDay = R.slice().filter(r => r[4] > 0 && r[5] > 0).sort((a, b) => day(b) - day(a)).slice(0, 8);
    const mainRows = R.slice().sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0], 'zh'))
        .map(r => [(r[0] + ' ' + (r[2] || '') + ' ' + (r[3] || '')).trim(), [
            r[0], r[2] || '—', r[3] || '—', String(r[1]),
            r[4] ? String(r[4]) : '<span class="mon-no">—</span>',
            r[5] > 0 ? num(r[5]) : '<span class="mon-no">—</span>',
            r[6] > 0 ? num(r[6]) : '<span class="mon-no">—</span>',
            (r[4] > 0 && r[5] > 0) ? '<b>' + day(r).toFixed(1) + '</b>' : '<span class="mon-no">—</span>',
        ]]);
    return `
        <h2 class="h2">${tot} 种作物，从 ${Math.min.apply(null, R.map(r => r[1]))} 天到 ${Math.max.apply(null, R.map(r => r[1]))} 天</h2>
        <p class="p">下面这张表来自官方资料（fandom 与 3DM 中文攻略交叉核对），不是估的。RF5 的作物没有 RF4 那种「四阶段天数」拆解，只有<b>总生长天数</b>；季节标的是「最好／最坏」，最坏季种下去也能长，只是慢。<b>果树（橘／葡／苹）与牧草成熟后每天可收</b>，不在「首轮」里算，单独放在再生型里。</p>
        ${stat([['收录作物', tot + ' 种'], ['可买种子', buyable + ' 种'], ['再生型', regRows.length + ' 种']])}
        <p class="p">「首轮日收益」= （单株产量 × 单价 − 种子价）÷ 总天数，指一株、一轮的平均日产出，没算你手里有几块地。产量或种子价记 0 的（树、装备、流星、辉树）不适用这个概念，页面不硬填。</p>
        ${ftableOwn(['作物', '最好季', '最坏季', '总天', '产量', '种子价', '卖价', '首轮日收益'],
            ['6.6rem', '5rem', '5rem', '3.6rem', '3.6rem', '5rem', '5rem', '6rem'],
            mainRows, { ph: '输入作物名或季节', cls: 'crop' })}

        <h2 class="h2">长得最慢的反而最赚——黄金系压在土里三个月起</h2>
        <p class="p">按首轮日收益排，前八名基本是<b>黄金系与高单价作物</b>：黄金芜菁、黄金卷心菜、黄金土豆、火热果、洋葱、大葱、黄金南瓜、卷心菜。和「短周期滚钱」的直觉相反——短周期作物的日收益被种子价摊得很薄，长周期作物种子贵但卖价贵得更多。</p>
        ${tbl(['作物', '总天', '种子价', '单株卖', '首轮日收益'], topDay.map(r => [
            r[0], String(r[1]), num(r[5]), num(gross(r)), '<b>' + day(r).toFixed(1) + '</b>',
        ]), { leftFirst: true, colw: ['7rem', '5rem', '6rem', '6rem', '7rem'] })}
        <div class="key">但日收益高不等于周转快：黄金芜菁一株要 120 天、占一格地；同样一格地在 120 天里能轮 40 茬芜菁。真正该问的是「我这块地有多少天可以押」。</div>

        <h2 class="h2">再生型 ${regRows.length} 种：种下去之后每天都有进项</h2>
        <p class="p">再生型作物（含果树与牧草）收完不拔，隔固定天数再结一次。果树与牧草成熟后<b>每天可收</b>（再生天记作 1），其余按表内天数。这类作物的正确算法是<b>「回本次数」</b>：种子价 ÷ 一次收获总价。大于 1 就说明第一轮还亏，必须收第二轮才回本。</p>
        ${tbl(['作物', '种子价', '一次收获', '回本还差', '再生间隔', '再生期日收益'], regRows.sort((a, b) => regDay(b) - regDay(a)).map(r => [
            r[0], num(r[5]), num(gross(r)),
            bk(r) > 1 ? '<b class="dn">' + (bk(r) * 100 - 100).toFixed(0) + '%</b>' : '<b class="up">已回本</b>',
            r[7] === 1 ? '每日' : r[7] + ' 天', '<b>' + regDay(r).toFixed(0) + '</b>',
        ]), { leftFirst: true, colw: ['6.6rem', '5.4rem', '5.4rem', '5.6rem', '5rem', '7rem'], cls: 'spot' })}
        <div class="note">番茄、青椒、少女蜜瓜、菠萝的首轮是负收益（种子比一茬收成还贵），但因为再生间隔只有 3 天，从第二轮开始就变纯利润。这类作物最怕种下去收一轮就拔掉，等于白亏种子钱。<br>另外，<b>流星作物</b>（流星玉米／南瓜／马铃薯／草莓）种子不在店里卖，只能挖陨石拿，卖价统一 10000G，是后期纯赚的特殊作物，这里只列名与卖价，不硬算收益。</div>
    `;
}

/* ------------------------------------------------------------
   符文工房1（RF1）作物段
   表结构：[名, 季节, 总生长天, 再生(1=可,0=否), 种子买价, 作物卖价, 食用效果]
   数据来自 biligame《RF1farm》作物详细表（仅取有生长天数的可种植作物，32 种）
   ------------------------------------------------------------ */
function crop1Html() {
    const R = (typeof CROP_RF1 !== 'undefined') ? CROP_RF1 : [];
    const num = v => (v && v > 0) ? v.toLocaleString('en-US') : '—';
    const tot = R.length;
    const buyable = R.filter(r => r[4] > 0).length;
    const regRows = R.filter(r => r[3] > 0);
    const bad = R.filter(r => /HP-5/.test(r[6]));
    const mainRows = R.slice().sort((a, b) => a[2] - b[2] || a[0].localeCompare(b[0], 'zh'))
        .map(r => [r[0], [
            r[0], r[1], String(r[2]),
            r[3] ? '可' : '<span class="mon-no">—</span>',
            r[4] > 0 ? num(r[4]) : '<span class="mon-no">—</span>',
            r[5] > 0 ? num(r[5]) : '<span class="mon-no">—</span>',
            r[6],
        ]]);
    return `
        <h2 class="h2">${tot} 种可种植作物，从 ${Math.min.apply(null, R.map(r => r[2]))} 天到 ${Math.max.apply(null, R.map(r => r[2]))} 天</h2>
        <p class="p">下面这张表来自 biligame《RF1farm》的作物详细表，只收<b>有生长天数</b>的可种植作物（野生草、采集物不列入农作表）。RF1 的作物按<b>季节</b>种：春、夏、秋各有一批，「连续收获」标「可」的收完不拔能再结。注意 RF1 原表<b>没有单列单株产量</b>，所以这里不推算日收益——不编没有的数据。</p>
        ${stat([['收录作物', tot + ' 种'], ['可买种子', buyable + ' 种'], ['再生型', regRows.length + ' 种']])}
        <p class="p">「种子买价／作物卖价」是 biligame 原表直接列的价格（买种子花多少、出货作物得多少）。它们看起来有些「种不如卖种子划算」，那是原表口径，本页不替它圆回来——RF1 作物的价值更多在<b>料理、送礼、任务</b>，不在于纯出货。</p>
        ${ftableOwn(['作物', '季节', '生长天', '再生', '种子买价', '作物卖价', '食用效果'],
            ['5.6rem', '4.4rem', '4rem', '3.4rem', '5rem', '5rem', '8rem'],
            mainRows, { ph: '输入作物名或季节', cls: 'crop' })}

        <h2 class="h2">再生型 ${regRows.length} 种：收完别拔</h2>
        <p class="p">「再生」列标「可」的 ${regRows.map(r => r[0]).join('、')} 收一轮后不拔，隔几天再结一次——和 RF4/RF5 的再生型一个道理，种子钱只花一次。其余一次性的拔了就没。</p>
        ${tbl(['作物', '季节', '生长天', '作物卖价'], regRows.map(r => [
            r[0], r[1], String(r[2]), num(r[5]),
        ]), { leftFirst: true, colw: ['6.6rem', '4.4rem', '4rem', '5rem'] })}

        <h2 class="h2">${bad.length} 种花与水晶：吃了掉血、换 RP</h2>
        <p class="p">樱草、灯草、青／绿／红水晶、金刚花、铁千轮、四叶草、原之焰火、树形草、红叶花、蒲公英这些——食用效果是 <b>HP-5、RP+21</b>。它们不是拿来吃的（吃下去掉血），而是<b>提升 RP 上限</b>的关键材料，通常种来送礼或交任务，或者提纯 RP 药剂。种子贵（金刚花 10000、四叶草 9000），属于后期高投入作物。</p>
        ${tbl(['作物', '季节', '生长天', '种子买价', '食用效果'], bad.map(r => [
            r[0], r[1], String(r[2]), num(r[4]), '<b>' + r[6] + '</b>',
        ]), { leftFirst: true, colw: ['6.6rem', '4.4rem', '4rem', '5.4rem', '9rem'], cls: 'spot' })}
        <div class="note">牧草（春夏秋，9 天）是喂家畜的必需品，原表没给出货价（价值不在卖钱），这里卖价记 —。季节里写「春夏秋」的是跨季作物，三季都能种。</div>
    `;
}

/* ------------------------------------------------------------
   符文工房 边境（RFF）作物段
   表结构：[季节, 作物名, [种,芽,叶,花], 十级出货额, 繁荣参考, 备注]
   数据来自 RFF各作物各阶段所需时间.xls，另有 5 条原表说明存于 RFF_TIPS。
   ------------------------------------------------------------ */
function cropRffHtml() {
    const R = (typeof RFF_CROP !== 'undefined') ? RFF_CROP : [];
    const TIPS = (typeof RFF_TIPS !== 'undefined') ? RFF_TIPS : [];
    const num = v => (v === null || v === undefined) ? '—' : v.toLocaleString('en-US');
    const T = r => r[2].reduce((a, b) => a + b, 0);
    const money = r => (r[3] === null || r[3] === undefined) ? '<span class="mon-no">—</span>' : num(r[3]);
    const cnt = s => R.filter(r => r[0] === s).length;
    const get = n => R.filter(r => r[1] === n)[0] || null;
    const fast = R.slice().sort((a, b) => T(a) - T(b));
    const slow = R.slice().sort((a, b) => T(b) - T(a));
    const noBonus = R.filter(r => r[4] === '（空）');
    const minT = Math.min.apply(null, R.map(T)), maxT = Math.max.apply(null, R.map(T));

    /* 长周期作物按「天数 + 单价」成套出现，整理成分档表 */
    const tier = {};
    R.forEach(r => { const k = T(r); if (k >= 40) (tier[k] = tier[k] || []).push(r); });
    const tierKeys = Object.keys(tier).sort((a, b) => a - b);
    const tierRows = tierKeys.map(k => {
        const L = tier[k];
        const miss = ['春', '夏', '秋'].filter(s => !L.some(r => r[0] === s));
        return [k + ' 天', num(L[0][3]),
            L.map(r => r[1] + '（' + r[0] + '）').join('、') +
            (miss.length ? ' <span class="mon-no">缺' + miss.join('、') + '</span>' : '')];
    });

    const K = {
        gain: R.filter(r => /繁荣收获$/.test(r[4])),
        regrow: R.filter(r => /繁荣连作$/.test(r[4])),
        cannot: R.filter(r => /繁荣收获不可$/.test(r[4])),
        fert: R.filter(r => /配合肥料/.test(r[4])),
        plain: noBonus,
    };
    const names = L => L.map(r => r[1]).join('、');

    const ORD = { '春': 0, '夏': 1, '秋': 2, '不论季节': 3 };
    const bySeason = R.slice().sort((a, b) => (ORD[a[0]] - ORD[b[0]]) || (T(a) - T(b)));
    const mainRows = bySeason.map(r => [r[1], [
        r[1], r[0], String(T(r)), money(r),
        r[4] === '（空）' ? '<span class="mon-no">无加成</span>' : r[4],
        r[2].join(' · '),
    ]]);
    const noteRows = bySeason.map(r => [r[1], [r[1], r[5] || '<span class="mon-no">—</span>']]);
    const tipRows = TIPS.map(t => {
        const m = t.match(/^\d+：([^：]+)：(.*)$/);
        return m ? [m[1], m[2]] : ['补充', t];
    });
    const GJ = get('金刚花'), YHC = get('樱花草'), BLD = get('白玫瑰');
    const t40 = tier[40] || [], t60 = tier[60] || [], t100 = tier[100] || [];

    return `
        <h2 class="h2">边境的 ${R.length} 种作物：四季里有一季是空的</h2>
        <p class="p">原表按季分组：春 ${cnt('春')} 种、夏 ${cnt('夏')} 种、秋 ${cnt('秋')} 种，另有 ${cnt('不论季节')} 种不分季节（${names(R.filter(r => r[0] === '不论季节'))}）。<b>冬季那一栏是空的</b>——整张表里没有一条冬季作物，所以冬天能种的只有这三种，其余地要么空着，要么留着等换季。</p>
        ${stat([
        ['收录作物', R.length + ' 种'],
        ['最快成熟', minT + ' 天'],
        ['最慢', maxT + ' 天'],
    ])}
        <p class="p">最快的 ${fast.filter(r => T(r) === minT).map(r => r[0]).join('、')} 四个阶段各 1 天，${minT} 天一轮；最慢的 ${slow[0][0]} 要 ${maxT} 天，同样是四个阶段，时间差了 ${Math.round(maxT / minT)} 倍。「四段天数」是原表给的种子／芽／叶／花各阶段天数，加起来就是总天数。</p>
        ${ftableOwn(['作物', '季节', '合计', '十级出货额', '繁荣参考', '四段天数'],
        ['5rem', '3.4rem', '3.2rem', '5.2rem', '8rem', '6.4rem'],
        mainRows, { ph: '输入作物名', cls: 'rffcrop' })}
        <div class="note">「十级出货额」是满级那一件的出货价，<b>不是每株收益</b>——这张原表没给种子价和每株产量，所以这里不算日收益，只列单价，不猜。<br>${get('牧草') ? '牧草那格是空的，它本来就不出货（价值在喂家畜）。' : ''}</div>

        <h2 class="h2">长周期作物是同一条价格线，一个季节一件</h2>
        <p class="p">把表按天数排开，后段不是零散的：<b>同一个天数对应同一个价格，而且春夏秋各有一件</b>。这是边境的「季节同款」设计——同一档装备不管你在哪季做，要的都是同一种作物，只是名字不同。</p>
        ${tbl(['合计天数', '十级出货额', '同款作物（按季节）'], tierRows, {
        leftFirst: true, colw: ['5.4rem', '5.6rem'], cls: 'rfftier',
    })}
        <p class="p">把单价摊到每天看（单价 ÷ 天数），只是为了把不同档位拉到同一尺度，<b>仍然不含种子成本</b>：${tierKeys.map(k => k + ' 天 ' + Math.round(tier[k][0][3] / Number(k))).join(' → ')}，天数越长这一项越高。所以后期只要有地有钱，就往最长那档种；前期种不起，${t40.length ? names(t40) + '（' + tierKeys[0] + ' 天）是性价比的第一道台阶' : ''}。</p>
        <div class="key">春季是唯一有 ${maxT} 天作物的季节（${GJ[1]}，${num(GJ[3])}），代价是春天<b>没有 40 天那一档</b>——它最短的长周期作物直接跳到 ${t60.length ? (T(t60[0]) + ' 天') : '60 天'}。换句话说，春季前期靠 ${names(noBonus)} 撑着，中期断档，后期最强。</div>

        <h2 class="h2">「繁荣」：边境把生长周期做成了一道缩放题</h2>
        <p class="p">其他作品里作物天数写死，边境不是。<b>生长周期取决于特兰普利亚有几个地区的精灵数量超过 35 只</b>，这个数字就是表里写的「N 繁荣」。地区越繁荣，四个阶段缩得越短，最短每段 1 天、共 4 天——但长周期作物压不到 4 天，得配肥料，所以表里给的是「配合肥料 N 日收获」。</p>
        ${tbl(['写法', '含义'], [
        ['N 繁荣收获<br><span class="mon-no">' + K.gain.length + ' 件</span>', 'N 个地区精灵全部超过 35 只时，压到 4 日收获。' + names(K.gain)],
        ['N 繁荣连作<br><span class="mon-no">' + K.regrow.length + ' 件</span>', '同上，且收完不拔、可以连续收。' + names(K.regrow)],
        ['N 繁荣收获不可<br><span class="mon-no">' + K.cannot.length + ' 件</span>', '光靠繁荣压不到 4 日，必须再配合肥料。' + names(K.cannot)],
        ['配合肥料 N 日收获<br><span class="mon-no">' + K.fert.length + ' 件</span>', '长周期作物：对应繁荣下再配合肥料，第 N 日收获。' + names(K.fert)],
        ['（空）<br><span class="mon-no">' + K.plain.length + ' 件</span>', '四段本来就各 1 天，繁荣和肥料都不起作用。' + names(K.plain)],
    ], { leftFirst: true, cls: 'rffrate', colw: ['6.6rem'] })}
        <h3 class="h3">原表对繁荣与肥料的五条说明</h3>
        <ul class="ul">
            ${tipRows.map(t => '<li class="li"><b>' + t[0] + '</b>：' + t[1] + '</li>').join('')}
        </ul>

        <h2 class="h2">三个容易漏掉的细节</h2>
        <ul class="ul">
            <li class="li"><b>白玫瑰会变色</b>：收获期放着不收，第三天变成<b>蓝玫瑰</b>，十级出货 2912（白玫瑰 ${num(BLD[3])}）。急着拔反而亏。</li>
            <li class="li"><b>迷之信件三个密码</b>：すごいかぶ → 金芜菁、すごいかぼちゃ → 金南瓜、はっぱばな → 花红叶，次日送达。三种拿到的都是种子，${get('金芜菁') ? '金芜菁只有 ' + T(get('金芜菁')) + ' 天却只能这样入手' : '金作物只能这样入手'}。</li>
            <li class="li"><b>牧草不出货</b>：没有卖价，价值在喂家畜、喂精灵；靠割草类怪物上班收割，<b>怪物好感直接等于收获数量的倍数</b>，好感越高一次收得越多。</li>
        </ul>

        <h2 class="h2">原表备注：要做什么，该种什么</h2>
        <p class="p">边境的装备材料大量来自作物，这 ${noteRows.length} 条备注最实用的就是这层对应——从装备反查要种什么，比按季翻作物快。</p>
        ${ftableOwn(['作物', '原表备注'], ['5.4rem'], noteRows, { ph: '输入装备名或作物名', cls: 'rffnote' })}
        <div class="note">备注里那句「无繁荣给肥料 N 日收获」是后期参考：到那时候大部分人已经不缺钱，维持每天的区域繁荣又要花时间管理精灵，所以原表专门给出了<b>放弃繁荣、只给肥料</b>的收获天数。</div>
    `;
}

/* ---------- RF4 配方大全（锻造 / 工艺 / 料理·药学 三表） ---------- */
function recipe4Html() {
    const rec = (typeof RECIPE4 !== 'undefined') ? RECIPE4 : [];
    const cats = (typeof RECIPE4_CATS !== 'undefined') ? RECIPE4_CATS : [];
    const kinds = (typeof RECIPE4_KIND !== 'undefined') ? RECIPE4_KIND : [];
    const cnt = (typeof RECIPE4_CNT !== 'undefined') ? RECIPE4_CNT : [];
    const KINDS = ['料理', '武器', '防具', '饰品', '农具', '药学'];
    const ksum = {};
    cats.forEach((c, i) => { const k = kinds[i]; ksum[k] = (ksum[k] || 0) + (cnt[i] || 0); });
    const forgeN = (ksum['武器'] || 0) + (ksum['农具'] || 0);
    const craftN = (ksum['饰品'] || 0) + (ksum['防具'] || 0);
    const cookN = (ksum['料理'] || 0) + (ksum['药学'] || 0);

    const opts = KINDS.map(k => {
        const inner = cats.map((c, i) => kinds[i] === k
            ? `<option value="${i}">${c}（${cnt[i]}）</option>` : '').join('');
        return inner ? `<optgroup label="${k}">${inner}</optgroup>` : '';
    }).join('');

    const matOf = m => m.indexOf('类') >= 0 ? `<i class="mk">${m}</i>` : m;
    /* 料理效果：从 RF4_COOK 反查（名字 → 紧凑效果摘要），仅料理类（c<=6）有，武器/防具/农具/药学留 — */
    const effMap4 = {};
    (typeof RF4_COOK !== 'undefined' ? RF4_COOK : []).forEach(r => {
        if (!r || r[0] === '药学' || r.length < 12) return;
        const p = [];
        if (r[5]) p.push('HP' + r[5]);
        if (r[6]) p.push('RP' + r[6]);
        if (r[7]) p.push('RP上限' + r[7]);
        if (r[8]) p.push('力量' + r[8]);
        if (r[9]) p.push('智力' + r[9]);
        if (r[10]) p.push('体力' + r[10]);
        if (r[11]) p.push(r[11]);
        effMap4[r[1]] = p.join(' ');
    });
    const rr = x => {
        const isCook = x.c >= 0 && x.c <= 6;
        const eff = isCook ? (effMap4[x.n] || '—') : '—';
        return `<tr data-c="${x.c}" data-s="${x.n} ${x.m.join(' ')} ${isCook ? (effMap4[x.n] || '') : ''}">
                <td class="td left rec-n">${x.n}</td>
                <td class="td rec-c">${cats[x.c]}</td>
                <td class="td rec-lv">${x.lv >= 900 ? '—' : x.lv}</td>
                <td class="td rec-m">${x.m.map(matOf).join('、')}</td>
                <td class="td rec-eff">${eff}</td>
            </tr>`;
    };

    const full = rec.filter(x => x.m.length >= 6);
    const catCnt = rec.reduce((s, x) => s + x.m.filter(m => m.indexOf('类') >= 0).length, 0);
    const catKinds = [];
    rec.forEach(x => x.m.forEach(m => { if (m.indexOf('类') >= 0 && catKinds.indexOf(m) < 0) catKinds.push(m); }));
    const topCat = rec.filter(x => x.lv < 900).sort((a, b) => b.lv - a.lv).slice(0, 3);

    return `
        <h2 class="h2">${rec.length} 条配方，三张表各算各的</h2>
        <p class="p">RF4 的配方不是一张表，而是按工作台分成的三张互不相干的表：<b>锻造台</b>出武器和农具（${forgeN} 条）、<b>工艺台</b>出饰品和防具（${craftN} 条）、<b>料理台与药学台</b>出食物和药品（${cookN} 条）。三套对应三种完全独立的技能——锻造练到 50 级，不会让料理也跟着变成 50 级，想做什么就得单独练那一门。</p>
        ${stat([['配方', rec.length + ' 条'], ['锻造 · 工艺', (forgeN + craftN) + ' 条'], ['料理 · 药学', cookN + ' 条']])}
        <div class="rec-filter">
            <input id="recQ" type="search" placeholder="输入配方名或素材筛选" />
            <select id="recSel" aria-label="按分类筛选"><option value="all">全部分类</option>${opts}</select>
            <span id="recCount" class="mon-count">${rec.length} 条</span>
        </div>
        <div class="table mon-table" data-rec><table><thead><tr>
            <th class="th left">配方</th><th class="th">类别</th><th class="th">技能Lv</th><th class="th">素材</th><th class="th">效果（料理）</th>
        </tr></thead><tbody>${rec.map(rr).join('')}</tbody></table></div>

            <div class="key">素材栏里 <i class="mk">矿石类</i> 这种带「类」字的，是<b>素材类别</b>——意思是这一类里的任意一种都行，不用凑齐。全表 ${catKinds.length} 种类别、出现 ${catCnt} 次，其中锻造表用得最狠：武器配方动不动就写「矿石类」「爪、牙类」，实际上你往里面塞什么都能做出来，只是成品的属性和最终等级会跟着素材走。</div>
        <p class="p"><b>等级是硬门槛</b>：技能等级不够，这条配方根本不会出现在可制作列表里；够了之后，成品的实际等级由「素材等级 + 你的技能等级」共同决定，所以同一张配方在不同阶段能做出差十几级的东西。<br>按等级排，${topCat.map(x => `<b>${x.n}</b>（${x.lv}）`).join('、')} 是常规配方的天花板，再往上的都是特殊品。</p>

        <h2 class="h2">四季头饰与那条被剔除的护符</h2>
        <p class="p">春季、夏季、秋季、冬季头饰这四件，原表的等级栏写的是 999，没有给出实际数值，页面上显示为「—」。四件都是「头饰 + 一种对应素材」的二料配方：<b>春=月落草、夏=粉红猫、秋=红水晶、冬=白水晶</b>，做出来是四件换季用的头饰。</p>
        <div class="note">另有 <b>赛尔泽的护符</b>（Venti's Charm）在原表里占了两行、素材栏全空、等级 999 —— 没有任何材料能做出来的东西不是配方，是剧情道具，已从表中剔除（Craft Recipes 原表 161 条，剔除这 2 行后 ${craftN} 条并入工艺台）。<br>表里素材最多 ${Math.max.apply(null, rec.map(x => x.m.length))} 项，满配的有 ${full.length} 条：${full.slice(0, 4).map(x => x.n).join('、')} 这类。</div>

        <div class="note">数据取自 RF4 数据解包表的三张配方表（Craft Recipes / Forge Recipes / Cook & Chem Recipes），配方名与素材名统一按《译名表》转成 RF4S 简体中文。RF4S 与 RF4 的配方基本一致，共用本表。</div>

        <div class="jump">
            <a href="#/page/cook">
                <div class="jp-t">料理</div>
                <div class="jp-s">七种器具的差别、料理等级怎么刷</div>
            </a>
            <a href="#/page/craft">
                <div class="jp-t">锻造与药学</div>
                <div class="jp-s">素材品质与技能等级怎么决定成品</div>
            </a>
            <a href="#/page/gear">
                <div class="jp-t">装备打造·毕业套</div>
                <div class="jp-s">知道配方之后：倍铁怎么把一件装备乘到极限</div>
            </a>
        </div>
    `;
}

function ftable(head, colw, rows, opts) {
    const o = opts || {};
    const w = colw || [];
    const th = head.map((h, i) =>
        `<th class="th${i === 0 ? ' left' : ''}"${w[i] ? ` style="width:${w[i]}"` : ''}>${h}</th>`).join('');
    const tr = rows.map(r => `<tr data-ek="${r[0]}" data-s="${r[1]}">` +
        r[2].map((c, i) => `<td class="td${i === 0 ? ' left' : ''}">${c}</td>`).join('') + '</tr>').join('');
    const bar = `<div class="rec-filter">
        <input id="eqQ" type="search" placeholder="${o.ph || '输入名称筛选'}" />
        ${o.sel ? `<select id="eqSel" aria-label="按分类筛选"><option value="all">全部</option>${
        o.sel.map(c => `<option value="${c}">${c}</option>`).join('')}</select>` : ''}
        <span id="eqCount" class="mon-count">${rows.length} 条</span>
    </div>
    ${o.chips ? `<div class="chip-row" id="eqChips">
        <button class="chip on" data-ekk="all">全部</button>
        ${o.chips.map(c => `<button class="chip" data-ekk="${c}">${c}</button>`).join('')}
    </div>` : ''}`;
    const cls = head.length >= 7 ? ' eqx' : (head.length >= 5 ? ' eqw' : '');
    const note = o.note || `<div class="note">名称取自《符文工房5》数据解包表的汉化字段，与官方中文版（2022 年 Switch／PC）的译名可能略有差异；数值为初版解包值，后续补丁若调过平衡，以游戏内为准。表内「—」表示该项为 0 或无。<b>列多放不下时，表格可以左右滑动</b>。</div>`;
    return bar + `<div class="table mon-table${cls}" data-eq><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>
    ${note}`;
}

/* 各作品「物品一览」的分类 → 六个分类页的归属
   键是 pages 里的页面 key；值是 ITEM_RFx 里要收进这一页的分类名。 */
const EQCAT = {
    rf1: {
        weapon: ['单手剑', '双手剑', '长枪', '锤', '斧'],
        armor: ['盾与饰品'], tool: ['农具与工具'], material: ['素材'],
        food: ['料理与食材'], potion: ['药']
    },
    rf2: {
        weapon: ['剑', '长枪', '锤', '斧', '魔杖'],
        armor: ['盾', '饰品'], tool: ['农具'], material: ['素材'],
        food: ['料理', '乳制品与食材'], potion: ['药品与香料']
    },
    rf3: {
        weapon: ['单手剑', '双手剑', '长枪', '锤', '斧', '魔杖', '双剑'],
        armor: ['盾', '防具与饰品'], tool: ['农具'], material: ['素材'],
        food: ['料理', '食材'], potion: ['药与香料']
    },
    rff: {
        weapon: ['单手剑', '双手剑', '长枪', '锤', '斧', '魔杖'],
        armor: ['防具与饰品'], tool: ['农具'], material: ['药与素材'],
        food: ['料理', '食材'], potion: ['药与素材']
    }
};

/* 取本作某类物品的文本数据（RF1／RF2／RF3／边境）。
   返回 { rows, cats, n }；rows 已是 ftable 要的 [筛选键, 搜索文本, [名称, 说明]]。
   没有该作数据时返回 null。 */
function txPack(id, key) {
    const IT = id === 'rf1' ? (typeof ITEM_RF1 !== 'undefined' ? ITEM_RF1 : [])
        : id === 'rf2' ? (typeof ITEM_RF2 !== 'undefined' ? ITEM_RF2 : [])
            : /^rf3/.test(id) ? (typeof ITEM_RF3 !== 'undefined' ? ITEM_RF3 : [])
                : id === 'rff' ? (typeof ITEM_RFF !== 'undefined' ? ITEM_RFF : [])
                    : [];
    const cats = (EQCAT[id] || EQCAT[String(id).replace(/sp$/, '')] || {})[key];
    if (!IT.length || !cats) return null;
    const list = IT.filter(r => cats.indexOf(r[1]) >= 0);
    if (!list.length) return null;
    const have = cats.filter(c => list.some(r => r[1] === c));
    return {
        n: list.length,
        cats: have,
        rows: list.map(r => [r[1], `${r[0]} ${r[1]} ${r[3]}`,
            [r[0], `<span class="txc">${r[1]}</span>${r[3]}`]])
    };
}

/* 武器种类名归一：RF4 叫「战锤／战斧／长枪」，RF5 叫「锤／斧／枪」 */
function nk(s) {
    return s === '战锤' ? '锤' : s === '战斧' ? '斧' : s === '枪' ? '长枪' : s;
}

/* 各武器类型的定位（讲解用），键是归一后的名字 */
const WKIND = {
    '单手剑': ['攻速与威力均衡，可配盾', '通用，一周目首选'],
    '双手剑': ['威力高、动作慢', '打大型魔物与 Boss'],
    '长枪': ['攻击距离长，可戳刺', '对付灵活的敌人'],
    '剑': ['单手与双手混排在同一段', '按名字判断，别只看种类'],
    '双剑': ['连击快、单次伤害低', '清小怪、刷连击'],
    '拳套': ['连段最多、位移大', '贴身高连击'],
    '斧': ['威力大，兼作采集工具', '兼顾砍树与战斗'],
    '锤': ['威力大，兼作采矿工具', '兼顾采矿与战斗'],
    '魔杖': ['施放魔法，消耗 RP', '远程与属性攻击'],
    '盾': ['防御用，配单手剑时效率最高', '这一作把它排在武器段里']
};

/* 物品一览的分节渲染（RF1／RF3／边境共用）
   IT = [名称, 分类, 首句, 全文]，按分类拆成若干 <section>，顶部给跳转条。
   返回 { CATS, cnt, nav, secs }；搜索与空节收起由 app.js 统一处理。 */
function eqblock(IT, opt) {
    const o = opt || {};
    const ti = o.txt === undefined ? 3 : o.txt;   /* 用哪一列当说明：2 首句 / 3 全文 */
    const cw = o.colw || '7rem';
    const CATS = [], cnt = {};
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    IT.forEach(r => { if (CATS.indexOf(r[1]) < 0) CATS.push(r[1]); });
    CATS.forEach(c => { cnt[c] = IT.filter(r => r[1] === c).length; });
    const dense = CATS.length >= 14 ? ' dense' : '';   /* 分类特别多时按钮收窄，少占一行 */
    const nav = `<div class="chip-row${dense}" id="eqNav">${CATS.map((c, i) =>
        `<button class="chip" data-jump="is-${i}">${c} ${cnt[c]}</button>`).join('')}</div>`;
    const secs = CATS.map((c, i) => {
        const list = IT.filter(r => r[1] === c);
        const trs = list.map(r => `<tr data-ek="${c}" data-s="${esc(r[0] + ' ' + r[1] + ' ' + r[ti])}">
                    <td class="td left mon-n">${r[0]}</td>
                    <td class="td">${r[ti]}</td>
                </tr>`).join('');
        return `<section class="eqsec" data-eqsec id="is-${i}">
                <h2 class="h2">${c}<span class="secn">${list.length} 件</span></h2>
                <div class="table mon-table" data-eq><table><thead><tr>
                    <th class="th left" style="width:${cw}">名称</th><th class="th">说明</th>
                </tr></thead><tbody>${trs}</tbody></table></div>
            </section>`;
    }).join('');
    return { CATS, cnt, nav, secs };
}

/* 分节模式的搜索栏（id 与 app.js 约定一致） */
function eqbar(n, ph) {
    return `<div class="rec-filter">
                <input id="eqQ" type="search" placeholder="${ph || '输入物品名或说明里的词，跨全部分类搜索'}" />
                <span id="eqCount" class="mon-count">${n} 条</span>
            </div>
            <div class="eq-empty" id="eqEmpty" hidden>没有匹配的物品。试试更短的词，或者换个说法（比如「剑」「种子」「生鱼片」）。</div>`;
}

/* 数值列：0 显示为破折号 */
function nz(v) { return (v === 0 || v === '' || v == null) ? '—' : v; }

/* ---------- 村民喜好：rf1 / rf2 / rf3 / rff / rfo 通用分支 ----------
   与「人物档案」同源（js/npcfull.js），字段：b 最喜欢 / l 喜欢 / h 讨厌 /
   w 最讨厌 / bg 生日礼物 / pf 喜欢的香水 / bd 生日。各作档位本来就不齐——
   rf1 没有讨厌档、rf2 没有最喜欢档，所以页面按该作实有的档位出列，
   不为了"看起来统一"去补一列空表头。 */
const GIFT_KEY = { rf3sp: 'rf3' };
const GIFT_SEAS = ['春', '夏', '秋', '冬'];

/* 各作机制差异，读者最容易在这里误会成"漏收" */
const GIFT_DIFF = {
    rf1: '这一作<b>只有「最喜欢」和「喜欢」两份清单</b>——送错了不掉好感，只是白送。所以本页的讨厌栏是空的，不是没查。',
    rf2: '<b>没有「最喜欢」档</b>，取而代之的是每人指定一件「生日礼物」，只在生日当天送才吃满收益。讨厌档齐备，这一作的雷区反而最值得记。',
    rf3: '四档里<b>讨厌档特别整齐</b>，另有每位候补的<b>喜欢的香水</b>——香水是独立于料理与素材的一条加成线，本作独有。',
    rff: '<b>没有「最讨厌」档</b>，只有最喜欢／喜欢／讨厌三份。人物与初代重叠很多，生日也大半沿用了初代的日期。',
    rfo: '<b>没有「最讨厌」档</b>。这一作的喜好清单偏长，几乎人人二十样起步，查的时候按人翻比按物品找快。'
};

function giftPage(g) {
    const k = GIFT_KEY[g.id] || g.id;
    const A = ((typeof NPC_FULL !== 'undefined') && NPC_FULL[k]) || [];
    if (!A.length) return '<div class="note">这一作的人物喜好数据尚未收录。</div>';

    const bdKey = s => {
        const m = /^([春夏秋冬])(\d+)日/.exec(s || '');
        return m ? GIFT_SEAS.indexOf(m[1]) * 100 + Number(m[2]) : 9999;
    };
    const hasList = f => A.some(x => x[f] && x[f].length);
    const HAS_B = hasList('b'), HAS_L = hasList('l');
    const HAS_PF = A.some(x => x.pf && String(x.pf).length);
    const HAS_H = hasList('h') || hasList('w');
    const HAS_BG = A.some(x => x.bg);
    const B_MULTI = A.some(x => (x.b || []).length > 2);   /* 各作"最喜欢"的粒度差很多：有的一人一件，有的列十几样 */
    const marryable = x => /花嫁|花婿|结婚/.test(x.r || '');
    const cut = (arr, n) => !arr || !arr.length ? '<span class="mon-no">—</span>'
        : arr.length > n ? arr.slice(0, n).join('、') + ` <span class="txc">等 ${arr.length} 样</span>`
            : arr.join('、');

    /* 生日年表：全年按季节日排，一行一个人 */
    const bdRows = A.filter(x => x.bd).slice().sort((a, b) => bdKey(a.bd) - bdKey(b.bd) || String(a.n).localeCompare(String(b.n)));
    const bdName = x => (HAS_B ? cut(x.b, 2) : (x.bg || '<span class="mon-no">—</span>'));

    /* 最喜欢 / 生日礼物的跨人频次 */
    const fb = {};
    A.forEach(x => (x.b || []).forEach(i => { const t = String(i).trim(); if (t) fb[t] = (fb[t] || 0) + 1; }));
    const topB = Object.entries(fb).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const multiB = topB.filter(x => x[1] > 1);

    /* 雷区频次：讨厌 + 最讨厌合并计数 */
    const withH = A.filter(x => (x.h || []).length || (x.w || []).length).length;
    const fh = {};
    A.forEach(x => (x.h || []).concat(x.w || []).forEach(i => { const t = String(i).trim(); if (t) fh[t] = (fh[t] || 0) + 1; }));
    const topH = Object.entries(fh).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const uniH = topH.filter(x => x[1] >= Math.max(2, Math.round(withH * 0.5)));

    const totL = A.reduce((s, x) => s + (x.l || []).length, 0);
    const avgL = totL / (A.filter(x => (x.l || []).length).length || 1);
    const CUT = avgL <= 6 ? 99 : 4;
    const longest = A.slice().sort((a, b) => (b.l || []).length - (a.l || []).length)[0];

    const head = ['村民', '生日'];
    const colw = ['6.6rem', '5rem'];
    if (HAS_B) { head.push('最喜欢'); colw.push('auto'); }
    if (HAS_BG && !HAS_B) { head.push('生日礼物'); colw.push('auto'); }
    if (HAS_L) { head.push('喜欢'); colw.push('auto'); }
    if (HAS_H) { head.push('讨厌'); colw.push('9rem'); }

    const rowOf = x => {
        const s = [x.n, x.bd || '', (x.b || []).join(' '), x.bg || '', (x.l || []).join(' '), (x.h || []).concat(x.w || []).join(' ')].join(' ');
        const cells = [npcLink(k, x.n) + (marryable(x) ? '' : ' <span class="txc">不可婚</span>'), x.bd || '<span class="mon-no">—</span>'];
        if (HAS_B) cells.push(cut(x.b, 8));
        if (HAS_BG && !HAS_B) cells.push(x.bg || '<span class="mon-no">—</span>');
        if (HAS_L) cells.push(cut(x.l, CUT));
        if (HAS_H) cells.push(cut((x.h || []).concat(x.w || []), 3));
        return [s, cells];
    };

    return `
    <h2 class="h2">先说清这一作有哪些档</h2>
    <p class="p">${GIFT_DIFF[k] || ''}</p>
    ${stat([['收录村民', A.length + ' 人'], ['有生日', bdRows.length + ' 人'], ['喜欢条目', totL + ' 条']])}
    <div class="key">下面先按<b>日历</b>排一遍——什么时候该备什么礼，一次看全；再按<b>人头</b>排一遍，点名的时候查。</div>

    <h2 class="h2">全年生日表：${bdRows.length} 个人，一年 ${bdRows.length} 次送礼机会</h2>
    <p class="p">生日当天送对东西，好感涨得比平时多得多——这是整个送礼系统里唯一有明确倍数收益的时刻。所以第一件事不是背清单，是<b>把日期排出来</b>。</p>
    ${tbl(['生日', '村民', HAS_B ? '最喜欢' : '生日礼物'], bdRows.map(x => [x.bd, npcLink(k, x.n), bdName(x)]), { leftFirst: true, cls: 'txt', colw: ['5.4rem', '8rem'] })}
    <div class="note" style="margin-top:.7rem">按 春夏秋冬 → 日 排序。${!HAS_B ? '「生日礼物」是源表单独指定的一件东西，不是他平时的喜欢品——生日当天送它才对。' : B_MULTI ? '「最喜欢」一列只取源表排在最前的两样——这一作有的人只有一件，有的人列了十几样，全量看下面的速查卡。' : '「最喜欢」一列就是他那件最想要的东西——这一作每人都只有一件，没有并列。'}</div>

    <h2 class="h2">${HAS_H ? (uniH.length ? (uniH.length === 1 ? '只有一样东西，人人讨厌' : `${uniH.length} 样东西，几乎人人讨厌`) : '雷区很散，没有公认的垃圾') : '这一作没有雷区'}</h2>
    ${!HAS_H ? `<p class="p">${k === 'rf1' ? '初代的机制里干脆没有「讨厌」这一档：递错东西不扣好感，只是不加。所以初代送礼可以随便试，试出喜欢的东西为止。' : '本作源表未收录讨厌档。'}</p>`
            : uniH.length ? `
        <p class="p">把 ${withH} 位有讨厌记录的村民并起来数一遍，${uniH.length} 样东西撞上了半数以上的人。这些东西有个共同点——<b>都是田里、路边、矿洞里随手捡的废料</b>。</p>
        ${tbl(['物品', '几个人讨厌', '占比'], uniH.map(([n2, c]) => [n2, `${c} / ${withH} 人`, Math.round(c / withH * 100) + '%']), { leftFirst: true, cls: 'txt', colw: ['10rem', '7rem', '4.4rem'] })}
        ${topH.length > uniH.length ? `<div class="note" style="margin-top:.6rem">表里只列命中过半数的那几样。第 ${uniH.length + 1} 名往后各只有 ${topH[uniH.length][1]} 人，${topH[uniH.length][1] <= 4 ? '已经不成规律，多半是真的个人口味' : '往下是一个连续的长尾'}。</div>` : ''}
        <div class="key">这份清单的用法不是"送礼时避开"，而是<b>整理背包时把它们单独塞一格</b>。${uniH[0] ? `<b>${uniH[0][0]}</b> 有 ${uniH[0][1]} 个人讨厌——` : ''}拿它当礼物递出去，好感是往下走的。</div>`
            : `<p class="p">${withH} 位村民的讨厌清单加起来 ${topH.reduce((s, x) => s + x[1], 0)} 条，最多的一样也只被 ${topH.length ? topH[0][1] : 0} 个人点名——说明<b>这一作的喜恶很个人化</b>，没有"公认垃圾"这回事。送礼前最好按名字查一下，别凭经验推。</p>
        ${tbl(['物品', '几个人讨厌'], topH.slice(0, 8).map(([n2, c]) => [n2, `${c} / ${withH} 人`]), { leftFirst: true, cls: 'txt', colw: ['10rem', '7rem'] })}`}

    <h2 class="h2">${HAS_B ? (multiB.length ? `${multiB.length} 样东西，不止一个人最喜欢` : '最喜欢全是一人一样，没有通用解') : '生日礼物：一人一件，不能通用'}</h2>
    ${!HAS_B ? `<p class="p">这一作没有"最喜欢"这一档，每人只有一件指定的生日礼物。${A.filter(x => x.bg).length} 个人对下来是 ${new Set(A.filter(x => x.bg).map(x => x.bg)).size} 种东西，${new Set(A.filter(x => x.bg).map(x => x.bg)).size === A.filter(x => x.bg).length ? '<b>没有一样重复</b>——完全是一对一的配置' : '<b>只有少数几样撞车</b>'}。所以不存在"备一样东西走天下"的捷径，只能在生日那天翻表。</p>`
            : multiB.length ? `
        <p class="p">${topB.length} 种被标成"最喜欢"的东西里，只有 ${multiB.length} 种被两个人以上同时点名：</p>
        ${tbl(['最喜欢', '几个人'], multiB.slice(0, 10).map(([n2, c]) => [n2, `${c} 人`]), { leftFirst: true, cls: 'txt', colw: ['10rem', '5rem'] })}
        <div class="key">其余 ${topB.length - multiB.length} 种<b>只被一个人点名</b>，也就是谁喜欢的东西基本只有他自己吃。这一作没有哪样东西能当通用礼物刷全场——想高效涨好感，只能照着名字送。</div>`
            : `<p class="p">${topB.length} 种"最喜欢"分摊到 ${A.filter(x => (x.b || []).length).length} 个人身上，<b>没有一种被重复点名</b>——每个人喜欢的都是自己的东西。这一作不存在"通用神物"，送礼只能按人查。</p>`}

    <h2 class="h2">每人一张速查卡</h2>
    <p class="p">要查特定的人就搜名字，要查"这东西能不能送"就搜物品名——下面这张表右边几列都参与搜索。标记 <span class="txc">不可婚</span> 的是店主、长辈与孩子，好感照涨，只是没有结婚线。</p>
    ${ftableOwn(head, colw, A.map(rowOf), { ph: '输入村民名或物品名', cls: 'npc' })}

    ${HAS_L ? `<details class="mon-fold">
        <summary>展开全部 ${A.length} 人的「喜欢」清单（共 ${totL} 条）</summary>
        <p class="p" style="padding:.2rem 0 .8rem">平均一人 ${avgL.toFixed(1)} 条${longest && (longest.l || []).length > CUT ? `，最长的是 <b>${longest.n}</b>，一个人 ${longest.l.length} 样` : ''}。这一档宽到没有筛选价值——基本等于"这一类他都吃"，送礼时按类别挑就行。</p>
        <div class="txt-list">${A.map(x => `<p><b>${x.n}</b>：${(x.l || []).join('、') || '<span class="mon-no">源表无记录</span>'}</p>`).join('')}</div>
        ${k === 'rf2' ? '<div class="note" style="margin-top:.6rem">RF2 的源表把两代分开记，个别条目带着「第一章：」「第二章无喜好物」这样的前缀，本页照原文保留、不删不改——那句话本身就是信息。</div>' : ''}
    </details>` : ''}

    ${HAS_PF ? `<details class="mon-fold">
        <summary>展开 ${A.filter(x => x.pf && String(x.pf).length).length} 位候补的「喜欢的香水」</summary>
        <p class="p" style="padding:.2rem 0 .8rem">香水在本作是独立于料理和素材的第三条加成线：同一个人对香水的反应，跟他的喜欢清单<b>不是一套</b>，不能互相推。</p>
        <div class="txt-list">${A.filter(x => x.pf && String(x.pf).length).map(x => `<p><b>${x.n}</b>：${[].concat(x.pf).join('、')}</p>`).join('')}</div>
    </details>` : ''}

    <div class="note">数据与「人物档案」是同一批源——biligame 符文工厂 wiki 各作人物页（CC BY-SA），由 <code>_build_npcfull.py</code> 生成到 <code>js/npcfull.js</code>。本页只是把同一份数据横过来看：<b>没有新增任何推断值</b>，所以你在人物页和这里看到的清单一定一致。<br>源表没给的字段就是空的：${A.length} 人里有 ${A.filter(x => !x.bd).length} 人查不到生日、${A.filter(x => !(x.b || []).length).length} 人没有最喜欢记录，本页留「—」，不按同族或同村推一个日期出来。</div>

    <div class="jump">
        <a href="#/resident/${g.id}/全部">
            <div class="jp-t">居民一览</div>
            <div class="jp-s">按身份、生日排序，点进去看完整档案</div>
        </a>
        <a href="#/page/love">
            <div class="jp-t">恋爱与结婚</div>
            <div class="jp-s">好感怎么涨、告白条件与婚后生活</div>
        </a>
    </div>`;
}

const PAGES = [
    /* ================= 基础知识 ================= */
    {
        key: 'intro', group: 'basic', title: '游戏简介', icon: 'scroll',
        body: g => `
            <h2 class="h2">${g.name}</h2>
            ${stat([['发售日', g.date], ['平台', g.plat.split('／')[0]], ['开发', g.dev], ['舞台', g.stage]])}
            <p class="p">${g.intro}</p>
            <div class="note">本文为本站整理的中文资料。作品名、角色名以官方中文版（世嘉／Marvelous 亚洲）译名为优先，未推出官方中文的作品保留常见译名并附原文。</div>
            <h2 class="h2">本作特色</h2>
            ${g.systems.map(([t, d]) => `<h3 class="h3">${t}</h3><p class="p">${d}</p>`).join('')}
            <div class="key">一句话定位：<b>${g.tagline}</b></div>
        `
    },
    {
        key: 'world', group: 'basic', title: '世界设定·符文', icon: 'globe',
        body: () => `
            <h2 class="h2">符文是什么</h2>
            <p class="p">符文（ルーン／Rune）是这个世界一切生命与土地的能量。它在大地、水、树木之间流动，肉眼可见时会像漂浮的光点或小精灵一样游走。土地肥沃、作物生长、魔物出没、魔法成立，靠的都是符文的循环。</p>
            <p class="p">符文一旦枯竭，土地就会失去产出、森林会凋零、连龙都会衰弱——系列每一作的主线冲突，几乎都能归结到「某个地方的符文循环被破坏了」。</p>
            <div class="key">这套设定的实用意义：游戏里的 <b>RP（符文点数）</b>就是主角身上能调动的符文量。它不是体力，而是「你能从大地借多少力」。</div>
            <h2 class="h2">大地之民</h2>
            <p class="p">能直接看见并操纵符文的血统被称为「大地之民」（アースメイト）。他们可以把符文灌注进农具与武器，让一把普通锄头翻出带符文的地，也能让一把剑带上属性。系列的主角几乎都是大地之民或具备同等资质的人——这是「主角一个人能同时种地和打怪」的设定依据。</p>
            <h2 class="h2">符文的三条循环</h2>
            <h3 class="h3">1. 土地 → 作物 → 出货</h3>
            <p class="p">耕作会消耗田地的符文，作物成熟时把符文固定进果实。收获、出货、再施肥，是一个可以维持的循环；长期不施肥、连续种植，地力会下降。</p>
            <h3 class="h3">2. 魔物 → 素材 → 锻造</h3>
            <p class="p">魔物本身就是符文浓度高的生物。击破后掉落的皮毛、牙、结晶，是把符文「凝固」后的材料，锻造与药学都依赖它们。</p>
            <h3 class="h3">3. 龙 → 大地 → 季节</h3>
            <p class="p">地区的季节与丰饶由守护龙维持。龙衰弱，季节就会失序——这是系列主线最常用的一条暗线（详见「国家与幻龙」）。</p>
            <div class="note">各作对符文的演出和叫法略有差异：<b>边境</b>把符文具象成可搬运的「符文精灵」，<b>龙之天地</b>则把它讲成需要以舞蹈唤醒的「大地之力」。底层逻辑是同一个。</div>
        `
    },
    {
        key: 'stage', group: 'basic', title: '舞台与主角', icon: 'flag',
        body: g => `
            <h2 class="h2">${g.stage}</h2>
            ${stat([['原文', g.stageJp], ['所属', g.id === 'azuma' ? '东国' : (g.id === 'rfo' ? '芬迪海域' : '诺鲁德王国')], ['主角', g.hero], ['守护', g.god]])}
            <p class="p">${g.intro}</p>
            <h2 class="h2">主角</h2>
            <p class="p">${g.hero}（${g.heroJp}）。系列主角在设定上大多有一个共同点：<b>失去记忆</b>。这不是偷懒，而是让玩家与主角同步认识这个世界——你不知道的事，主角也不知道，于是所有 NPC 的解释都变得合理。</p>
            <div class="note">主角的外貌与姓名可自定义。官方立绘只用于宣传，游戏内以玩家设定为准。</div>
            <h2 class="h2">本作角色一览</h2>
            <p class="p">完整名单、声优与生日见底部「居民」页。</p>
        `
    },
    {
        key: 'time', group: 'basic', title: '时间与季节', icon: 'clock',
        body: () => `
            <h2 class="h2">一天怎么过</h2>
            <p class="p">清晨起床（多数作品为 6:00），当天可以自由安排耕作、采集、下迷宫、送礼、接委托。时间在户外与迷宫内都会流逝，进入室内、菜单、对话时会暂停。</p>
            <p class="p">深夜之后仍不睡觉会开始扣体力，最终强制就寝。熬夜的代价通常是第二天起床变晚——而起床晚了，商店开门、NPC 出门的时间都会错过。</p>
            <div class="key">效率原则：<b>把「会随时间流逝的事」和「不会流逝的事」分开排</b>。送礼、整理背包、看配方放在室内做；下迷宫和跑图放在同一天连续做。</div>
            <h2 class="h2">季节</h2>
            <p class="p">一年分春、夏、秋、冬四季，<b>每季 30 天</b>，一年共 120 天。季节一换，能种的作物、出现的采集物、部分 NPC 的行为与节日都会变。</p>
            ${tbl(['季节', '主要作物类型', '注意'], [
                ['春', '叶菜、根菜类起步作物', '开局季，优先把田地和工具等级拉起来'],
                ['夏', '果菜、高价值作物', '高温作物收益高，但需要勤浇水'],
                ['秋', '薯类、瓜类', '收入最好的一季，尽量留足体力'],
                ['冬', '多数作物无法生长', '转向迷宫、采矿、锻造与小游戏产出'],
            ], { leftFirst: true })}
            <p class="p">冬季不能种地，是系列一贯设计。这段时间正好拿来刷迷宫素材、把锻造与药学的等级补上。</p>
            <h2 class="h2">天气</h2>
            <p class="p">晴、阴、雨、雪。雨天不必浇水，是推进迷宫与刷素材的好日子；暴风雨可能造成作物损失。天气预报可以在电视或公告处查看，前一天确认再决定第二天的安排。</p>
        `
    },
    {
        key: 'rp', group: 'basic', title: '体力与 RP', icon: 'bolt',
        body: () => `
            <h2 class="h2">两套数值</h2>
            <p class="p">系列的所有行动都挂在两套数值上：<b>HP（体力）</b>与 <b>RP（符文点数）</b>。</p>
            ${tbl(['数值', '消耗场景', '归零后果', '恢复方式'], [
                ['RP', '挥农具、使用技能、施放魔法、锻造、料理、药学', '开始扣 HP', '睡觉、泡澡、料理、药品、符文'],
                ['HP', '受到攻击、RP 透支后继续行动、饥饿', '晕倒，被送回家并损失当天时间', '睡觉、料理、药品、医院'],
            ], { leftFirst: true })}
            <div class="key">理解这一点很关键：<b>RP 是「行动预算」，HP 是「战斗预算」</b>。种地时 RP 见底就该收手，而不是硬撑到掉血——掉血会让当天下午整段报废。</div>
            <h2 class="h2">怎么把 RP 变多</h2>
            <ul class="ul">
                <li class="li"><b>升级</b>：等级提升会同时拉高 HP 与 RP 上限，这是最直接的来源。</li>
                <li class="li"><b>装备</b>：部分饰品带 RP 上限加成，前期很值。</li>
                <li class="li"><b>料理</b>：当场回复，也能当作迷宫补给带走。</li>
                <li class="li"><b>泡澡</b>：澡堂、温泉是系列传统的恢复点，夜晚去还能附带好感事件。</li>
            </ul>
            <h2 class="h2">SP 的另一套逻辑</h2>
            <p class="p">战斗侧的技能消耗 RP 而不是 MP，所以「练技能等级」本身就是在提升续航：技能等级越高，同一动作消耗的 RP 相对越少。前期不要太早把 RP 全部投在高级技能上。</p>
            <div class="note">各作的 RP 上限、消耗倍率、恢复点位置都不同。本文只讲机制，具体数值请以游戏内为准，本站不编造未公开的数值表。</div>
        `
    },
    {
        key: 'control', group: 'basic', title: '操作方式', icon: 'pad',
        body: g => `
            <h2 class="h2">基本操作逻辑</h2>
            <p class="p">系列的操作始终围绕同一套思路：一个键「用当前手上的东西」（农具／武器／道具），一个键「跳／冲刺」，一个键开菜单，方向键移动。真正需要记的只有三件事——</p>
            <ul class="ul">
                <li class="li"><b>切换道具</b>：L／R 或方向键循环，田里换锄头、迷宫里换武器，切换是否顺手直接决定手感。</li>
                <li class="li"><b>蓄力</b>：长按使用键可以蓄力，农具的蓄力等级决定一次能翻几格地；杖的蓄力决定魔法强度。</li>
                <li class="li"><b>锁定与闪避</b>：动作化的作品（3 代之后）有锁定目标与翻滚闪避，Boss 战几乎都靠这两个。</li>
            </ul>
            ${tbl(['平台', '本作操作要点'], [
                [g.plat, g.id === 'rff' ? 'Wii 遥控器体感挥动；也可接经典手柄用传统操作。' : (g.id === 'rf1' || g.id === 'rf2' || g.id === 'rf3' ? 'NDS 触屏可点选道具与地图，下屏常驻状态栏。' : '支持手柄与键鼠；键鼠可在设置里重绑全部按键。')],
            ], { leftFirst: true })}
            <h2 class="h2">不写在说明书里的三件事</h2>
            <p class="p">一、<b>跳跃能省时间</b>。很多地形可以跳过去，不必绕路。二、<b>背包要定期清</b>。素材堆满会挤掉任务道具的拾取位。三、<b>菜单里能看 NPC 当前位置</b>（后期作品），找人时先看一眼，比满镇跑快得多。</p>
        `
    },

    /* ================= 牧场生活 ================= */
    {
        key: 'battle', group: 'basic', title: '战斗与弱点', icon: 'bolt',
        body: () => {
            const R = (typeof RES_RF5 !== 'undefined') ? RES_RF5 : [];
            if (!R.length) return '<p class="p">抗性数据未加载。</p>';
            const ATTRS = ['火', '水', '土', '风', '光', '暗', '无', '爱'];
            const N = R.length;

            /* ---- RF4：同一套八属性，数值结构不同 ---- */
            const R4 = (typeof RES_RF4 !== 'undefined') ? RES_RF4 : [];
            const N4 = R4.length;
            /* 两作净差对照 */
            const netOf = T => ATTRS.map((a, i) => {
                const weak = T.filter(x => x.a[i] < 0).length;
                const res = T.filter(x => x.a[i] > 0).length;
                return { a, weak, res, d: weak - res, zero: T.filter(x => x.a[i] === 0).length };
            });
            const n4 = netOf(R4), n5 = netOf(R);
            const noWeak4 = R4.filter(x => x.a.every(v => v >= 0)).length;
            /* RF4 爱属性两端构成 */
            const loveWeak = R4.filter(x => x.a[7] < 0);
            const loveRes = R4.filter(x => x.a[7] > 0);
            /* RF4 控制抗性：c=[暴击率,暴击抗性,眩晕抗性,攻击硬直,攻击吹飞,吹飞抗性] */
            const immStun4 = R4.filter(x => x.c[2] >= 1).length;
            const immFly4 = R4.filter(x => x.c[5] >= 1).length;
            /* RF4 异常抗性：b=[中毒,封印,麻痹,睡眠,疲劳,感冒,即死,吸收] */
            const EK = ['中毒', '封印', '麻痹', '睡眠', '疲劳', '感冒', '即死', '吸收'];
            const ekImm = EK.map((e, k) => ({ e, n: R4.filter(x => x.b[k] >= 1).length }));
            /* RF4 弱点速查行 */
            const prep4 = R4.map(x => {
                let wi = -1, wv = 0, bi = -1, bv = 0;
                x.a.forEach((v, i) => { if (v < wv) { wv = v; wi = i; } if (v > bv) { bv = v; bi = i; } });
                return { n: x.n, a: x.a, c: x.c, wi, wv, bi, bv };
            });

            /* 每只魔物：最弱属性、最强抗性 */
            const prep = R.map(x => {
                let wi = -1, wv = 0, bi = -1, bv = 0;
                x.a.forEach((v, i) => { if (v < wv) { wv = v; wi = i; } if (v > bv) { bv = v; bi = i; } });
                return { n: x.n, a: x.a, c: x.c, wi, wv, bi, bv };
            });
            const noWeak = prep.filter(x => x.wi < 0).length;
            const immStun = R.filter(x => x.c[3] >= 100).length;
            const immFly = R.filter(x => x.c[4] >= 1).length;

            /* 八属性净收益 */
            const net = ATTRS.map((a, i) => ({
                a,
                weak: R.filter(x => x.a[i] < 0).length,
                res: R.filter(x => x.a[i] > 0).length,
                zero: R.filter(x => x.a[i] === 0).length,
            })).map(o => ({ ...o, d: o.weak - o.res }));

            /* chips 用「最怕什么」计数 */
            const chipCnt = {};
            prep.forEach(x => { if (x.wi >= 0) chipCnt[ATTRS[x.wi]] = (chipCnt[ATTRS[x.wi]] || 0) + 1; });

            /* 负号用排版减号，比 ASCII 连字符窄且不占基线 */
            const num = v => v < 0 ? '−' + Math.abs(v) : String(v);

            const row = x => {
                const tags = [];
                if (x.c[3] >= 100) tags.push('<span class="tag-imm">免疫眩晕</span>');
                if (x.c[4] >= 1) tags.push('<span class="tag-imm">免疫击飞</span>');
                if (!tags.length && x.c[5] >= 1) tags.push('<span class="tag-soft">有硬直</span>');
                return `<tr data-rk="${x.wi < 0 ? 'none' : ATTRS[x.wi]}" data-s="${x.n} ${x.wi >= 0 ? ATTRS[x.wi] : ''}${x.bi >= 0 ? ATTRS[x.bi] : ''}">
                    <td class="td left r-n">${x.n}</td>
                    <td class="td r-weak">${x.wi < 0 ? '<span class="mon-no">无</span>' : ATTRS[x.wi]}</td>
                    <td class="td r-wv">${x.wi < 0 ? '—' : num(x.wv)}</td>
                    <td class="td r-res">${x.bi < 0 ? '<span class="mon-no">—</span>' : ATTRS[x.bi]}</td>
                    <td class="td r-rv">${x.bi < 0 ? '—' : '+' + x.bv}</td>
                    <td class="td left r-t">${tags.join('') || '<span class="mon-no">—</span>'}</td>
                </tr>`;
            };

            const fullRow = x => '<tr><td class="td left r-n">' + x.n + '</td>' +
                x.a.map(v => `<td class="td rv ${v < 0 ? 'rv-neg' : v > 0 ? 'rv-pos' : 'rv-zero'}">${num(v)}</td>`).join('') +
                '</tr>';

            return `
            <h2 class="h2">属性打对了，不是加一点伤害</h2>
            <p class="p">符文工房没有「属性相克表」，只有一张抗性表：每个敌人对八种属性各有一个系数，<b>负数就是弱点，正数是抵抗，0 是既不疼也不痒</b>。数字的绝对值越大越极端，目前最大值到 2 倍。</p>
            <p class="p">本页用两作的解包数据：<b>RF5 ${N} 只</b>、<b>RF4 ${N4} 只</b>。属性种类相同，结构却不同——最大的分歧在爱属性：RF4 里它是唯一净正的属性，到 RF5 几乎废掉，后半段单独讲这件事。</p>
            ${tbl(['表里的值', '含义', '举例'], [
                ['负数（−0.1 ～ −2）', '打它更疼，绝对值越大倍率越高', '兽人对风 −1.5，风属性伤害显著高于面板'],
                ['0', '没有任何修正，按面板结算', '绝大多数魔物的绝大多数属性都是 0'],
                ['正数（+0.1 ～ +2）', '打它更轻，绝对值越大越抗', '火幽灵对火 +2，几乎打不动'],
            ], { leftFirst: true, cls: 'txt', colw: ['10rem'] })}
            <div class="key">关键在最后一行：<b>${N} 只魔物里有 ${noWeak} 只，八项抗性没有任何负值</b>。属性武器对它们既不加成也不减伤——所以别指望「带对属性」能通用，它只在特定对手身上才是倍率。</div>

            <h2 class="h2">八种属性，没有一个能通吃</h2>
            <p class="p">把每一列拉平来看：某个属性有多少敌人怕它、多少敌人抗它。差额越接近 0，说明这个属性越不容易被针对（也越不容易吃到红利）。</p>
            ${tbl(['属性', '怕它', '抗它', '净差', '全无反应', '评价'], net.map(o => [
                o.a, o.weak, o.res,
                `<b>${o.d > 0 ? '+' + o.d : '−' + Math.abs(o.d)}</b>`,
                o.zero,
                o.a === '无' ? '最稳：七成敌人对它毫无修正' :
                    o.a === '光' ? '最值得投：怕它的多、抗它的相对少' :
                        o.a === '土' ? '最差：将近四成敌人抗土' :
                            o.a === '水' ? '次差：抗水的高达三分之一' :
                                o.a === '爱' ? '几乎无人抵抗，但也几乎无人害怕' :
                                    o.a === '火' ? '怕它的最多（' + o.weak + ' 只），抗它的也不少' :
                                        o.a === '风' ? '对半开，不吃亏也不占便宜' :
                                            '抗它的远多于怕它的',
            ]), { leftFirst: true, cls: 'net', colw: ['3.4rem'] })}
            <div class="note">「怕它」＝该属性抗性为负的只数，「抗它」＝为正的只数。八列<b>净差全是负数</b>，说明这套数值整体偏向防御——不存在一把武器打遍全场的属性。真要选一个通用属性，是<b>无属性</b>（${net[6].zero} 只对它完全无反应，既不减伤也吃不到加成，最可控）；要收益上限，选<b>光</b>。</div>

            <h2 class="h2">两个值得单独说的地方</h2>
            <h3 class="h3">幽灵三兄弟：同族互相克制</h3>
            <p class="p">这是全表唯一一组 <b>±2 倍</b> 的极端数值，而且设计得很整齐——每只都抗自己的属性，怕另一只的属性：</p>
            ${tbl(['魔物', '抗（+2）', '怕（−2）', '怎么打'], [
                ['火幽灵', '火', '水', '用水属性武器，或让水系魔物伙伴上'],
                ['冰幽灵', '水', '火', '用火属性武器'],
                ['风幽灵', '风', '土', '用土属性武器'],
            ], { leftFirst: true, cls: 'txt', colw: ['6.4rem'] })}
            <p class="p">三只的抗性表完全对称，说明这是刻意设计的教学关卡——游戏在教你「属性不是随便带的」。同族的其他幽灵（鬼魂、地狱幽灵）都没有这么极端。</p>

            <h3 class="h3">史莱姆与传送门：爱属性唯二有反应的地方</h3>
            <p class="p">爱属性在 ${net[7].zero} 只魔物身上是完全 0，只有极少数例外：<b>史莱姆系</b>（普通／火焰／黑暗史莱姆）对爱 +0.5，<b>传送门系</b>对爱 +0.8～1（其中「虚无之传送门」直接免疫），<b>树魔人</b>是唯一怕爱的（−0.15）。</p>
            <div class="key">这解释了毕业套最后一步为什么放<b>爱之结晶</b>：它值钱的不是属性转换，而是<b>吸血攻击 +3%</b>。真要靠属性打伤害，光或无才是更好的选择。</div>

            <h2 class="h2">RF5 弱点速查：${N} 只魔物</h2>
            <p class="p">按「它最怕什么」筛选。没有弱点的 ${noWeak} 只单独归为一档——打它们不用挑属性，挑面板和异常状态就行。</p>
            ${stat([['收录', N + ' 只'], ['无任何弱点', noWeak + ' 只'], ['免疫眩晕', immStun + ' 只'], ['免疫击飞', immFly + ' 只']])}
            <div class="mon-filter">
                <input id="resQ" type="search" placeholder="输入魔物名或属性筛选" />
                <span id="resCount" class="mon-count">${N} 只</span>
            </div>
            <div class="chip-row" id="resChips">
                <button class="chip on" data-rk="all">全部</button>
                ${ATTRS.map(a => chipCnt[a] ? `<button class="chip" data-rk="${a}">${a} ${chipCnt[a]}</button>` : '').join('')}
                <button class="chip" data-rk="none">无弱点 ${noWeak}</button>
            </div>
            <div class="table mon-table" data-res><table><thead><tr>
                <th class="th left">魔物</th><th class="th">最怕</th><th class="th">值</th><th class="th">最抗</th><th class="th">值</th><th class="th left">行动要点</th>
            </tr></thead><tbody>${prep.map(row).join('')}</tbody></table></div>
            <div class="note">「值」是抗性系数本身，负数越大越疼。「行动要点」只标两类信息：<b>免疫眩晕／免疫击飞</b>（你的控制技能对它们无效），以及<b>有硬直</b>（被打会僵直，可以靠连击压制）。两者都没有的显示为横线。</div>

            <h2 class="h2">完整八属性数值</h2>
            <p class="p">上面那张表只给了最怕与最抗。完整数值在这里，负数标红、正数标绿、0 是灰的——扫一眼就能看出这只怪是哪一种壳。</p>
            <details class="mon-fold">
                <summary>展开 ${N} 只魔物的全部八项抗性（点一下）</summary>
                <div class="table mon-table" data-resfull><table><thead><tr>
                    <th class="th left">魔物</th>${ATTRS.map(a => `<th class="th">${a}</th>`).join('')}
                </tr></thead><tbody>${prep.map(fullRow).join('')}</tbody></table></div>
            </details>

            <h2 class="h2">暴击、眩晕、击飞与硬直</h2>
            <p class="p">抗性管的是「属性伤害」，这一组管的是<b>「能不能打断它」</b>。两者的用途完全不同：前者决定你打得疼不疼，后者决定你能不能安全地站着打。</p>
            ${tbl(['参数', '含义', '数据里长什么样'], [
                ['暴击率', '这只魔物打你时的暴击概率', `多数在 1%～7%，最高 50%（贪食箱、惊喜箱这类宝箱怪）`],
                ['暴击抵抗', '你打它时暴击率被削多少', '最多 0.99，但 90 只完全为 0'],
                ['击晕率', '它打你时让你眩晕的概率', '多数 0.1～0.2，最高 0.4'],
                ['眩晕抵抗', '你对它施加眩晕的难度', `<b>${immStun} 只标记为 100＝完全免疫</b>，其余多为 0～0.5`],
                ['吹飞抵抗', '你对它施加击飞的难度', `<b>${immFly} 只标记为 1.0＝完全免疫</b>`],
                ['硬直', '被打时会不会僵直', `${R.filter(x => x.c[5] >= 1).length} 只有硬直，${R.filter(x => x.c[5] === 0).length} 只没有`],
            ], { leftFirst: true, cls: 'txt', colw: ['6rem', '10rem'] })}
            <p class="p">把两列并排看会发现一件事：<b>两个名单几乎完全重叠</b>。${immStun} 只免疫眩晕，${immFly} 只免疫击飞，差的 ${immStun - immFly} 行都是<b>冈多亚杰</b>（同一只的两个等级变体）——它眩晕抗性 100，吹飞抗性却是 0.99，算「几乎免疫」而不是免疫。除它之外一只不多一只不少。构成上分两类——一类是 Boss 与大型敌人（龙族、九尾、蜥蜴系、刻耳柏洛斯、美杜莎、利维坦、鲸头鹳…），另一类是各种<b>传送门</b>（火／水／地／风／光／暗／爱之传送门，加上烈焰、寒冰、星、深渊等变体与吸收版，约三十种）。它们同时也是后期迷宫的主力，这意味着一件事：</p>
            <div class="key">你的控制链对三成敌人是无效的。<b>${immStun} 只免疫眩晕、${immFly} 只免疫击飞，几乎是同一批</b>——打这些只能靠闪避与走位，不能靠「打晕了再打」。反过来，${R.filter(x => x.c[5] >= 1).length} 只有硬直的魔物可以被连击压住，优先处理。</div>

            <h2 class="h2">RF4：同一套八属性，爱却是反过来的</h2>
            <p class="p">RF4S 的抗性表把村民和魔物混在一张表里——前 27 行是雷斯特、比修奈尔、库洛丽嘉这一批居民，从「兽人」开始才是战斗对象。把居民段切掉，再剔除活动种子、广告牌、宝珠这类非战斗条目，剩下 <b>${N4} 只魔物</b>。属性种类和 RF5 完全一样，可结构差得很远：</p>
            ${tbl(['属性', 'RF4 怕／抗', 'RF4 净差', 'RF5 怕／抗', 'RF5 净差', '两作怎么变'], ATTRS.map((a, i) => [
                a,
                n4[i].weak + ' ／ ' + n4[i].res,
                `<b>${n4[i].d > 0 ? '+' + n4[i].d : '−' + Math.abs(n4[i].d)}</b>`,
                n5[i].weak + ' ／ ' + n5[i].res,
                `<b>${n5[i].d > 0 ? '+' + n5[i].d : '−' + Math.abs(n5[i].d)}</b>`,
                a === '爱' ? '唯一位次翻转：RF4 唯一净正，RF5 变成负' :
                    a === '无' ? 'RF4 没有一只怕无属性，RF5 有 ' + n5[i].weak + ' 只' :
                        a === '光' ? '两作都是净差最接近零的负值，最稳的通用属性' :
                            a === '风' ? 'RF4 最接近对半，RF5 抗风的多了一截' :
                                a === '暗' ? '两作都极差，RF4 只有 ' + n4[i].weak + ' 只怕暗' :
                                    '两作方向一致',
            ]), { leftFirst: true, cls: 'net cmp', colw: ['3.2rem'] })}
            <div class="key">把八列并排看，只有<b>爱</b>翻了方向：RF4 净差 <b>+${n4[7].d}</b>（${n4[7].weak} 只怕、${n4[7].res} 只抗），RF5 是 <b>−${Math.abs(n5[7].d)}</b>（${n5[7].weak} 只怕、${n5[7].res} 只抗）。同一把爱属性武器，在 RF4 是通杀，在 RF5 基本白给。</div>

            <h3 class="h3">爱在 RF4 克的是「没有生命的东西」</h3>
            <p class="p">把 ${loveWeak.length} 只怕爱的魔物摊开看，规律非常清楚——它们几乎全是<b>人造物、亡灵、或魔法造出来的东西</b>：</p>
            ${tbl(['类别', '成员', '爱抗'], [
                ['魔法师系', '小魔术师、小巫术师、小魔导师、烈焰／冰结／元素魔导师、塞克斯魔法师', '−1'],
                ['塞克斯机械兵', '浮游兵、强化浮游兵、魔能履带炮、塞克斯石魔人、塞克斯坦克、悬丝傀儡、操手傀儡、要塞战车改', '−0.25 ～ −1'],
                ['亡灵与骨系', '鬼魂、大鬼魂、幽灵、内克罗、法乌斯托、石棺、远古之骨、死亡之墙、终末、埃塞尔巴德', '−0.1 ～ −0.5'],
                ['幽灵蔬菜', '洋葱／番茄／青椒／芜菁幽灵、大洋葱幽灵', '−0.25'],
                ['史莱姆与传送门', '史莱姆、黑暗史莱姆、传送门、巨大之传送门、虚无之传送门', '−0.5 ～ −1'],
                ['其他人造与异形', '狸、狸四郎、丙、乙、安布洛希亚、雷电马、霸王花、章鱼海盗、究极恶魔、可爱藤蔓／杉菜／花花', '−0.25'],
            ], { leftFirst: true, cls: 'txt lv', colw: ['7rem', '19rem', '4.6rem'] })}
            <p class="p">反过来，抗爱的 ${loveRes.length} 只正好是另一批：</p>
            ${tbl(['类别', '成员', '爱抗'], [
                ['精灵系', '红精灵、绿精灵、蓝精灵、黄精灵', '+0.75'],
                ['宝石系', '胭脂红、绿宝石、海蓝、橄榄黄', '+0.75'],
                ['妖精与妖兽', '小仙子、哈迪斯、巴姆猫人、玛姆虎人、塞克斯猫人、莱姆豹人、死亡树', '+0.25'],
                ['粉龙', '全属性表里唯一爱抗 +2 的魔物', '+2'],
                ['传送门（高阶）', '爱／深爱／慈爱／炎焰／冰冻／星／龙卷／天使／深渊之传送门', '+0.5 ～ +2'],
            ], { leftFirst: true, cls: 'txt lv', colw: ['7rem', '19rem', '4.6rem'] })}
            <div class="key">爱属性对<b>魔法与机械造物</b>是弱点，对<b>自带生命的自然精灵</b>反而无效——按设定读得通（「爱」是给没有爱的东西准备的），但从数值上讲，它让 RF4 的爱属性变成一把专杀法师与机械的刀。</div>

            <h3 class="h3">RF4 多一个维度：八种异常抗性</h3>
            <p class="p">RF5 那两张表只有属性抗性与控制抗性，<b>没有异常状态抗性</b>。RF4 有，而且是逐只给的精确系数。免疫（抗性 ＝ 1）的分布如下：</p>
            ${tbl(['异常', '免疫只数', '占比', '说明'], ekImm.map(o => [
                o.e, o.n + ' 只',
                Math.round(o.n / N4 * 100) + '%',
                o.e === '即死' ? '最难上：超过一半的敌人免疫，即死类技能不能当主力' :
                    o.e === '吸收' ? '最容易上：只有两成免疫，吸血与吸收类在 RF4 很吃香' :
                        o.e === '中毒' ? '近半数免疫，毒系武器只能当补充手段' :
                            o.e === '封印' ? '除吸收外免疫最少的一项，但它只对依赖技能的目标有意义' :
                                o.e === '麻痹' ? '和封印接近，人形与小型敌人多可麻痹' :
                                    o.e === '睡眠' ? '接近半数免疫；睡眠更适合偷袭与单挑' :
                                        o.e === '疲劳' ? '<b>与感冒完全共用一套抗性</b>：免疫名单一字不差' :
                                            '同上：这两项在数据里占的是同一个抗性位',
            ]), { leftFirst: true, cls: 'net ek', colw: ['4.4rem'] })}
            <div class="note">系数不只有 0 和 1 两个值——真实数据是 0、0.0999、0.25、0.5、0.7998、0.8999、0.99 这类连续值，1 才是完全免疫。表里只列免疫数量，完整系数逐只写在数据文件里（<code>js/resist4.js</code>）。</div>

            <h3 class="h3">控制抗性：两作用的是两套单位</h3>
            <p class="p">这是拿两作数据对比时最容易踩的坑——<b>字段含义和量纲都不一样</b>，不能直接把数字放一起比：</p>
            ${tbl(['项目', 'RF4', 'RF5'], [
                ['眩晕免疫', `抗性 ＝ 1，共 <b>${immStun4} 只</b>（${Math.round(immStun4 / N4 * 100)}%）`, `抵抗 ＝ 100，共 <b>${immStun} 只</b>（${Math.round(immStun / N * 100)}%）`],
                ['吹飞免疫', `抗性 ＝ 1，共 <b>${immFly4} 只</b>`, `抵抗 ＝ 1.0，共 <b>${immFly} 只</b>`],
                ['硬直', '表里叫「攻击硬直」，指<b>它打你时</b>施加的硬直，只有少数重击系敌人有值', '单独一列「硬直」，指<b>它被打时</b>会不会僵直'],
            ], { leftFirst: true, cls: 'txt', colw: ['5.6rem', '17rem'] })}
            <div class="note">RF4 的免疫比例（眩晕 ${Math.round(immStun4 / N4 * 100)}%、吹飞 ${Math.round(immFly4 / N4 * 100)}%）明显高于 RF5（眩晕 ${Math.round(immStun / N * 100)}%、吹飞 ${Math.round(immFly / N * 100)}%）。但两作的敌人构成不同——RF4 表里光是各种传送门与 Boss 变体就占了三成，不能据此说「RF4 的怪更难打晕」。</div>

            <h2 class="h2">RF4 弱点速查：${N4} 只魔物</h2>
            <p class="p">格式与上面的 RF5 速查表一致：最怕什么、最抗什么、值多少。没有弱点的 ${noWeak4} 只（占 ${Math.round(noWeak4 / N4 * 100)}%，比 RF5 的 ${Math.round(noWeak / N * 100)}% 低）不管你带什么属性都一样，挑面板打。</p>
            <details class="mon-fold">
                <summary>展开 RF4 的 ${N4} 只（点一下）</summary>
                <div class="table mon-table" data-res4><table><thead><tr>
                    <th class="th left">魔物</th><th class="th">最怕</th><th class="th">值</th><th class="th">最抗</th><th class="th">值</th>
                </tr></thead><tbody>${prep4.map(x => `<tr>
                    <td class="td left r-n">${x.n}</td>
                    <td class="td r-weak">${x.wi < 0 ? '<span class="mon-no">无</span>' : ATTRS[x.wi]}</td>
                    <td class="td r-wv">${x.wi < 0 ? '—' : num(x.wv)}</td>
                    <td class="td r-res">${x.bi < 0 ? '<span class="mon-no">—</span>' : ATTRS[x.bi]}</td>
                    <td class="td r-rv">${x.bi < 0 ? '—' : num(x.bv)}</td>
                </tr>`).join('')}</tbody></table></div>
            </details>
            <div class="note">RF4 数据来自三张解包表（属性抗性 279 行／异常抗性 371 行／暴击眩晕吹飞 276 行）。三表行数不同且都有重复行，<b>不能按行号硬对</b>——改用序列对齐，以属性表为主序列，异常表配对 278/279、控制表配对 272/279，零误配。异常抗性表里混入了「打开菜单」「输入名字」「商店」这类 UI 条目共 93 条，已全部排除；名字里的「（废案换皮XXX）」后缀也已剥掉。</div>

            <h2 class="h2">RF3：${(typeof BRES_RF3 !== 'undefined') ? BRES_RF3.length : 0} 只 Boss 的抗性</h2>
            ${(() => {
                    const B = (typeof BRES_RF3 !== 'undefined') ? BRES_RF3 : [];
                    if (!B.length) return '<p class="p">RF3 的抗性数据未加载。</p>';
                    const A8 = ['火', '水', '地', '风', '光', '暗', '爱', '无'];
                    const rows = B.map(([n, jp, v]) => {
                        let wi = -1, wv = 0, bi = -1, bv = 0;
                        v.forEach((x, i) => { if (x < wv) { wv = x; wi = i; } if (x > bv) { bv = x; bi = i; } });
                        return { n, jp, v, wi, wv, bi, bv };
                    });
                    const weak = rows.filter(x => x.wv < 0);
                    const tank = rows.filter(x => x.wv >= 0);
                    /* 按「爱抗性是否为负」判定，而不是「最怕是不是爱」——
                       古代龙骨的 −1 同时落在火／光／爱上，取第一个会把爱漏掉 */
                    const loveW = weak.filter(x => x.v[6] < 0);
                    const noLove = weak.filter(x => x.v[6] >= 0);
                    return `
            <p class="p">RF3 的资料只解出 Boss 一层：<b>${B.length} 只</b>，数值是整数倍率而不是小数系数——<b>−1 表示怕、+4 表示极抗、0 是无修正</b>。量纲和前两作不同，不能直接对比。</p>
            ${stat([['收录', B.length + ' 只'], ['有弱点', weak.length + ' 只'], ['无弱点', tank.length + ' 只']])}
            <p class="p">先记一条容易被忽略的事实：<b>${tank.length} 只 Boss 一个属性弱点都没有</b>——八项抗性全部非负。三只幻龙、水晶象、塞壬、奇美拉、蝾螈龙、哥勒姆都在这一档，属性武器对它们只剩「不减伤」的意义，拼的是纯面板。真正需要换属性的只有剩下 ${weak.length} 只：</p>
            ${tbl(['Boss', '最怕', '倍率', '最抗', '倍率'], weak.slice().sort((a, b) => a.wv - b.wv).map(x => [
                x.n,
                A8[x.wi],
                '<b>' + x.wv + '</b>',
                x.bi < 0 ? '—' : A8[x.bi],
                x.bv,
            ]), { leftFirst: true, cls: 'txt', colw: ['8rem', '3.6rem', '3.4rem', '3.6rem'] })}
            <div class="key"><b>${weak.length} 只里有 ${loveW.length} 只的软肋包含「爱」</b>（${loveW.map(x => x.n).join('、')}），系数统一 −1。唯一的例外是<b>${noLove.map(x => x.n).join('、')}</b>——它的爱抗性是 0，但<b>怕火 −2、怕风 −1</b>，是这批 Boss 里唯一能被两种属性同时克制的。换句话说：<b>打到卡关时先换上爱属性武器，十有八九能生效</b>。爱这把刀在 RF4 是通杀、在 RF5 基本废掉，到了 RF3 反而是 Boss 战的通用解。</div>

            <details class="mon-fold">
                <summary>展开 ${B.length} 只 Boss 的完整八项抗性（点一下）</summary>
                <div class="table mon-table"><table><thead><tr>
                    <th class="th left">Boss</th>${A8.map(a => `<th class="th">${a}</th>`).join('')}
                </tr></thead><tbody>${rows.map(x => '<tr>' +
                        '<td class="td left r-n">' + x.n + (x.jp ? '<span class="mon-desc">' + x.jp + '</span>' : '') + '</td>' +
                        x.v.map(v => `<td class="td rv ${v < 0 ? 'rv-neg' : v > 0 ? 'rv-pos' : 'rv-zero'}">${v}</td>`).join('') +
                        '</tr>').join('')}</tbody></table></div>
            </details>
            <div class="note">取自《符文工厂译名查询粗略表》的「RF3 魔物 boss 抗性」19 行，去掉表头后 ${B.length} 只。原表表头还列了 lv／HP／攻击／防御等列，但<b>数据行只填到「无抗性」为止</b>，属性面板是空的，所以本页只呈现抗性，不补数值。原表的「地抗性」在各作里也叫「土」，本页按原表写「地」。`;
                })()}


            <h2 class="h2">这和毕业套是同一套逻辑</h2>
            <p class="p">看完这张表就明白装备打造页里那些选择为什么那么排：</p>
            <ul class="ul">
                <li class="li"><b>属性攻击不堆满</b>。八列净差全负，堆单一属性一定有大量对手免疫，所以毕业套的武器只放一颗属性结晶，够用就行。</li>
                <li class="li"><b>异常状态攻击堆到 1</b>。毒／封印／麻痹／睡眠／疲劳／感冒这六种，在 RF5 那两张表里<b>找不到对应列</b>，看上去是「没有抗性可削」。但 RF4 的完整表把这一层露了出来：那边每种异常都有独立系数，且两成到一半的敌人直接免疫。所以更准确的说法是——<b>RF5 的异常抗性没被解包出来，而不是不存在</b>。这套数值并不比属性抗性宽松。</li>
                <li class="li"><b>防御端堆眩晕抗与击飞抗</b>。<b>${immStun} 只</b>敌人免疫眩晕（RF4 那边是 ${immStun4} 只，占比更高），说明眩晕在系统里是个强效果，对你同样成立。</li>
            </ul>
            <div class="note">数据来源：RF5 全怪物属性抗性表（272 行）与 RF5 全怪物暴击眩晕吹飞抗性表（269 行），数据解包汉化版，取两表行序对齐后的 ${N} 只。原表含 2 个空的 <code>#N/A</code> 行已剔除；「晚高峰」与「夜高峰」是同一只废案换皮怪的两处译名，已统一。抗性系数与伤害的实际换算公式未在资料中给出，本站只呈现系数本身，不推测百分比。RF4 的对应表见下方单独一节。</div>

            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">哪只在哪、能不能抓、打死掉什么</div>
                </a>
                <a href="#/page/gear">
                    <div class="jp-t">装备打造·毕业套</div>
                    <div class="jp-s">既然属性靠不住，那就把异常状态堆满</div>
                </a>
            </div>
        `
        }
    },
    /* ================= BOSS 战 ================= */
    {
        key: 'boss', group: 'basic', title: 'BOSS 战', icon: 'skull',
        gms: ['rf1', 'rf2', 'rf3', 'rfo', 'rf4', 'rf5', 'rff'],
        body: g => {
            const B = (typeof BOSS !== 'undefined') ? BOSS : null;
            if (!B) return '<p class="p">BOSS 数据未加载。</p>';
            const id = (g && g.id) || 'rf1';
            const n1 = B.rf1.length, n2 = B.rf2.length, n3 = B.rf3.length, no = B.rfo.length, n4 = B.rf4.length, nrff = B.rff.length;

            /* ---------- 共通开头 ---------- */
            const intro = `
            <h2 class="h2">这一页收的是什么</h2>
            <p class="p">「魔物图鉴」按种类收全表，这一页只收<b>剧情与迷宫里的 BOSS</b>：它们不进牧场，掉落也不按普通素材走，混在图鉴里反而最难查。</p>
            <p class="p">七作目前有可核实 BOSS 表的，一共 <b>${n1 + n2 + n3 + no + n4 + B.rf5.length + nrff} 位</b>——RF1 ${n1} 位、RF2 ${n2} 位、RF3 ${n3} 位、海洋 ${no} 条（含圆形竞技场两轮同名的复战）、四代 ${n4} 位、五代 ${B.rf5.length} 位、边境 ${nrff} 位。四代此前在 wiki 上没有集中的 BOSS 数值页，本次补齐主线 BOSS 表（数值取自 fandom 怪物数值表 + GameFAQs 主线流程，部分线上无源的 BOSS 留空标「待补」），抗性明细仍同步放在「战斗与弱点」页看。</p>
            <div class="note">数值全部取自各作 BOSS 页（RF1/RF2/RF3/五代/边境来自 biligame，四代来自 fandom + GameFAQs），<b>表里没有的列本页不填、不推算</b>。这七作对「属性」的记录方式根本不是一套量纲——一代/边境/海洋是点数、二代是克制、三代是等级、四代/五代是百分比系数——跨作比数值没有意义，最后一节单独讲这件事。</div>`;

            /* ---------- RF1 ---------- */
            const blk1 = () => {
                const EL4 = ['火', '水', '地', '风'];
                const rows = B.rf1.map(x => {
                    const el = x.slice(7, 11);
                    const mn = Math.min.apply(null, el);
                    const uni = el.every(v => v === mn);
                    const cells = el.map(v => (v === mn && !uni) ? '<b class="wk">' + v + '</b>' : String(v));
                    return [x[0], x[1], x[2], x[3], x[4], x[5], x[6]].concat(cells)
                        .concat([uni ? '<span class="mon-no">四项均等</span>' : '<b class="wk">' + EL4[el.indexOf(mn)] + '</b>']);
                });
                const tank = B.rf1.filter(x => { const el = x.slice(7, 11); return el.every(v => v === el[0]); });
                return `
            <h2 class="h2">符文工房1：${n1} 位洞窟 BOSS</h2>
            <p class="p">一代的属性是<b>属性防御点数</b>：火水地风各给一个 0～100 的数，<b>数越大越抗打，最小的那一项才是弱点</b>。所以看这张表别看谁的数大，要看谁有一项特别小。右侧「弱点」列已经把四项里最低的那项挑出来了。</p>
            ${stat([['收录', n1 + ' 位'], ['HP 区间', '250 ～ 2600'], ['无单一弱点', tank.length + ' 位']])}
            ${tbl(['BOSS', '地点', 'HP', 'EXP', '防御', '魔防', '物理抗', '火', '水', '地', '风', '弱点'], rows,
                    { leftFirst: true, cls: 'boss', colw: ['7rem'] })}
            <h3 class="h3">打之前先看三件事</h3>
            <ul class="ul">
                <li class="li"><b>属性打对不是加成，是能不能打得动</b>。克里莫亚火 100、水 15——拿火属性武器砍它等于白给，换成水才有效；塞壬同样水 100，霸王花则是水 80、火 15，怕火不怕水。</li>
                <li class="li"><b>有两场没有软肋</b>：${tank.map(x => x[0]).join('、')}的四项点数完全均等（${tank.map(x => x[0] + ' ' + x[7]).join('、')}），属性对它们只剩「不减伤」的意义，靠面板、回复和走位硬啃。</li>
                <li class="li"><b>物理抵抗这一列可以忽略</b>。八只全落在 8～12，差距不到五成，拿它做武器取舍没有意义；真正的分水岭在四项属性上。</li>
            </ul>
            <div class="note">表里 HP 从 250 一路排到 2600，正好是剧情顺序：卡麦特洞窟的究极恶魔是第一次教你怎么看属性，格力德洞窟的普罗戴格力德是通关前的门。EXP 一列同步上涨（40 → 600），前期刷它不划算，纯为推进。</div>`;
            };

            /* ---------- RF2 ---------- */
            const blk2 = () => {
                const rows = B.rf2.map(x => [x[0], x[6], x[2], x[1] === '-' ? '<span class="mon-no">无</span>' : x[1], x[4], x[5], x[3]]);
                const at = {};
                B.rf2.forEach(x => { at[x[2]] = (at[x[2]] || 0) + 1; });
                const atStr = Object.keys(at).map(k => k + ' ' + at[k]).join('、');
                return `
            <h2 class="h2">符文工房2：${n2} 位剧情 BOSS</h2>
            <p class="p">二代的 BOSS 表比一代干净：每只标一个<b>自身属性</b>，外加一条耐性（这里只有死亡树的「吹飞抗性」被记了下来）。HP 从 1000 到 3500，比一代高一档。</p>
            ${stat([['收录', n2 + ' 位'], ['HP 区间', '1000 ～ 3500'], ['属性分布', atStr]])}
            ${tbl(['BOSS', '地点', '自身属性', '耐性', 'HP', 'EXP', '掉落'], rows,
                    { leftFirst: true, cls: 'boss wraplast', colw: ['7rem'] })}
            <h3 class="h3">掉落全是石板碎片，这是设计上的取舍</h3>
            <p class="p">七只写明了掉落，七只全是石板碎片：前四只（树木的乐园、废船甲板、？？？、冰原）各掉一整色的 5/5 或 7/7，后四只掉「太古石板碎片 1/4 ～ 4/4」，凑齐才开门。弗雷克扎伊德一栏写「无」。</p>
            <div class="key">换句话说，<b>二代的 BOSS 战是关卡门锁，不是素材产地</b>。想刷素材回普通迷宫，别在 BOSS 房反复读档。</div>
            <h3 class="h3">属性在这代是克制，不是抗性</h3>
            <p class="p">二代是系列里唯一有<b>属性克制</b>的一作：同属性减伤、克制属性增伤。wiki 给的例子很直白——打一只地属性魔物，无属性武器约 70、<b>地属性武器只剩 50</b>、<b>风属性武器能到 100</b>。对照上表：死亡树是地属性，就别拿地属性武器；风属性的四只（电蝾螈龙、水晶长毛象、绿飞龙等）则要避开风。</p>
            <div class="note">表里有 5 处地名在 wiki 上仍是日文（一处祭坛、四座地下神殿的「最下层」），没有可靠中译，按本站口径保留原文、不做臆译。电蝾螈龙的所在地在原文就写作「？？？」，同样照抄。</div>`;
            };

            /* ---------- RF3 ---------- */
            const blk3 = () => {
                const rows = B.rf3.map(x => [x[0], x[1], x[2] || '<span class="mon-no">—</span>']);
                const wob = B.rf3.filter(x => x[1].indexOf('后仰抵抗') >= 0).length;
                const abs = B.rf3.filter(x => x[1].indexOf('吸收') >= 0).length;
                return `
            <h2 class="h2">符文工房3：${n3} 位 BOSS</h2>
            <p class="p">三代的抗性不是数值表，是一句<b>文字描述</b>：「地水吸收、光暗减半、部分后仰抵抗」这样。这比数字难比大小，但信息量更大——它同时告诉你<b>哪几个属性会回血</b>、哪几个只是减伤。</p>
            ${stat([['收录', n3 + ' 位'], ['带「后仰抵抗」', wob + ' 位'], ['带吸收属性', abs + ' 位']])}
            ${tbl(['BOSS', '抗性要点', '掉落'], rows, { leftFirst: true, cls: 'boss wraplast', colw: ['7rem', '15rem'] })}
            <h3 class="h3">三条硬结论</h3>
            <ul class="ul">
                <li class="li"><b>${wob} 位全部带「后仰抵抗」</b>。意思是打它不会出硬直——想靠连续平砍把 BOSS 按在原地是行不通的，得靠闪避和技能的空档。</li>
                <li class="li"><b>${abs} 位至少有一项属性被「吸收」</b>。吸收不是减伤，是<b>回血</b>：属性带错，你打得越猛它回得越多。开打前先确认自己武器上的属性不在吸收名单里。</li>
                <li class="li"><b>死亡树是这批里唯一写明「受伤倍率变高」的</b>：火 3 倍、风 1.5 倍，同时「地水无效」。其余各只写的都是「减半」「1/8 倍」「吸收」这类往抗性走的词。拿它当三代属性系统的说明书——倍率、无效、吸收三种状态一只就全看全了。</li>
            </ul>
            <div class="note">这里只收「一句话抗性」和掉落。八项抗性的<b>具体等级数值</b>在「战斗与弱点」页的 RF3 一节，两处数据同一来源、口径一致。另外 wiki 提到一句三代特有的设定：<b>最终迷宫里的魔物等级等于玩家等级</b>，所以后期不存在「练高了回头碾」这回事。</div>`;
            };

            /* ---------- RFO ---------- */
            const blkR = () => {
                const g1 = B.rfo.filter(x => x[9] === 'story');
                const g2 = B.rfo.filter(x => x[9] === 'arena');
                const g3 = B.rfo.filter(x => x[9] === 'maze');
                const H = ['BOSS', '出现点', 'LV', 'HP', '攻击', '防御', '魔攻', '魔防', 'EXP'];
                /* 编号区域的原始写法是「A01、A02、A03、A04、A05」这种罗列，
                   手机上一格里塞七个编号会把整张表撑到几屏宽，按首尾压成区间 */
                const short = s => {
                    const a = s.split('、').filter(Boolean);
                    if (a.length < 3) return s;
                    const h = x => x.replace(/\d+$/, '');
                    const seq = a.every(x => h(x) === h(a[0])) && a.every((x, i) => i === 0 || +x.slice(-2) === +a[i - 1].slice(-2) + 1);
                    return seq ? a[0] + '～' + a[a.length - 1] : s;
                };
                const row = x => [x[0], short(x[8]), x[1], x[2], x[3], x[4],
                    x[5] ? x[5] : '<span class="mon-no">—</span>',
                    x[6] ? x[6] : '<span class="mon-no">—</span>',
                    x[7]];
                /* 竞技场两轮对照 */
                const A = g2.map(x => ({ n: x[0], hp: x[2], spot: x[8] }));
                const first = A.filter(x => x.spot.indexOf('2回目') < 0);
                const second = A.filter(x => x.spot.indexOf('2回目') >= 0);
                const cmp = first.map(f => {
                    const s = second.find(x => x.n === f.n);
                    return s ? [f.n, f.hp, s.hp, Math.round(s.hp / f.hp * 10) / 10 + ' 倍'] : null;
                }).filter(Boolean);
                const top = g1.slice().sort((a, b) => b[2] - a[2])[0];
                return `
            <h2 class="h2">符文工房 海洋：${no} 条</h2>
            <p class="p">海洋的 BOSS 表是四作里最全的：LV、HP、攻击、防御、魔攻、魔防、EXP 七项全给，还带出现点。代价是它把<b>三类完全不同的战斗</b>混在一张表里——剧情推进、圆形竞技场六连战、编号区域的大型魔物，得拆开看才有用。</p>
            ${stat([['收录', no + ' 条'], ['剧情推进', g1.length + ' 条'], ['竞技场', g2.length + ' 条'], ['编号区域', g3.length + ' 条']])}

            <h3 class="h3">剧情推进（${g1.length} 条）</h3>
            <p class="p">顺着精灵殿往上走：土 4F → 炎 5F → 水 6F → 风 7F，然后是龙之祠堂、巨人的内部，最后是「创世纪之战·序曲」的两连。艾利岛的哥布林队长是开场教学，炎之精灵殿里又出现一次，但数值翻了十倍（HP 160 → 1600），不是同一场。</p>
            ${tbl(H, g1.map(row), { leftFirst: true, cls: 'boss', colw: ['8rem'] })}
            <p class="p">这十场里数值最高的是<b>${top[0]}</b>（LV ${top[1]}、HP ${top[2]}、攻击 ${top[3]}），和面具男一起守在最后一场「创世纪之战·序曲」。</p>

            <h3 class="h3">圆形竞技场（${g2.length} 条，两轮）</h3>
            <p class="p">同样的六只打两轮，第二轮的数值是重做的：</p>
            ${tbl(['BOSS', '第一轮 HP', '第二轮 HP', '倍率'], cmp, { leftFirst: true, cls: 'boss', colw: ['8rem'] })}
            <div class="key">六只里涨得最凶的是<b>决赛冰拳</b>（78000 → 137000），涨得最保守的是<b>大地巨人</b>（44000 → 76000）。等级也重给了：第一轮 45～60 级，第二轮 85～99 级——第一轮还能靠等级差碾，第二轮得按正式 BOSS 打。</div>
            ${tbl(H, g2.map(row), { leftFirst: true, cls: 'boss', colw: ['8rem'] })}

            <h3 class="h3">编号区域的大型魔物（${g3.length} 条）</h3>
            <p class="p">出现点写作 A01～D08 这类代号，是原表里的区域编号，具体地名 wiki 未标。这批要按「LV 1」去理解就会吃大亏：<b>HP 只有 1500～3000，攻击力却给到 380～500</b>——开场那只哥布林队长的攻击是 18，这里最弱的一只也有它的二十倍。</p>
            ${tbl(H, g3.map(row), { leftFirst: true, cls: 'boss', colw: ['8rem'] })}
            <div class="note">原表给这十二只的 LV 全写「1」，但攻击与防御明显不在 1 级的水准，<b>等级那一格不能当强度读</b>。另外这张表里没有属性一列——海洋的属性倍率是记在武器上、不在魔物身上的，所以无法从 BOSS 表判断弱点，得看手上那把武器。</div>`;
            };

            /* ---------- RF5 ---------- */
            const blk5 = () => {
                const H = ['BOSS', 'Lv', 'HP', '攻击', '魔攻', '防御', '魔防', '狂暴', '弱点', '抵抗'];
                const dash = v => (v === null || v === undefined) ? '<span class="mon-no">—</span>' : String(v);
                const wr = s => (s && s.trim()) ? s.trim() : '<span class="mon-no">—</span>';
                const rows = B.rf5.map(x => [x[0], x[1], x[2], dash(x[3]), dash(x[4]),
                    dash(x[5]), dash(x[6]), 'HP' + x[7] + '%以下', wr(x[8]), wr(x[9])]);
                const hpMin = Math.min.apply(null, B.rf5.map(x => x[2]));
                const hpMax = Math.max.apply(null, B.rf5.map(x => x[2]));
                const lvMin = Math.min.apply(null, B.rf5.map(x => x[1]));
                const lvMax = Math.max.apply(null, B.rf5.map(x => x[1]));
                const enrage = B.rf5.filter(x => x[7] >= 70).length;
                const top = B.rf5.slice().sort((a, b) => b[2] - a[2])[0];
                return `
            <h2 class="h2">符文工房5：${B.rf5.length} 位主线 BOSS</h2>
            <p class="p">五代的 BOSS 表是这一页字段最齐的一张：Lv、HP、攻击、魔攻、防御、魔防六项基础数值全给，还带<b>狂暴线</b>（HP 掉到某百分比以下进二阶段）和<b>弱点／抵抗</b>。数据来自 biligame 的 RF5 主线流程页（注明来源电玩巴士），全 ${B.rf5.length} 场主线按出场顺序排。</p>
            ${stat([['收录', B.rf5.length + ' 位'], ['Lv 区间', lvMin + ' ～ ' + lvMax], ['HP 区间', hpMin.toLocaleString() + ' ～ ' + hpMax.toLocaleString()], ['狂暴线 ≥70%', enrage + ' 位']])}
            ${tbl(H, rows, { leftFirst: true, cls: 'boss', colw: ['8rem'] })}
            <p class="p">数值最高的是<b>${top[0]}</b>（Lv ${top[1]}、HP ${top[2].toLocaleString()}），作为最终 BOSS 镇守奥迪亚。</p>
            <h3 class="h3">看这张表的三件事</h3>
            <ul class="ul">
                <li class="li"><b>弱点／抵抗是「百分比系数」体系</b>：负数弱（原表叫「较弱抗性」）、正数抗（「较强抗性」），绝对值越大越极端。例如九尾弱水·爱、抗火·地——水属性武器打它更疼，火属性被减伤。</li>
                <li class="li"><b>狂暴线是真二阶段</b>。前期 BOSS（九尾到石魔龙）在 HP 40% 触发；骨龙之后多 50%；最终 BOSS 黑暗来客要到 70% 才狂暴，意味着它大半血条是正常状态，最后三成才变脸。</li>
                <li class="li"><b>第二章后半段部分 BOSS 缺攻防</b>（骨龙、利维坦、赫克顿盖尔、死亡树・改、蕾瓦迪亚、美杜莎、衔尾蛇、树魔人、阿莉耶丝、奥德姆拉、芬布尔境界 BOSS）原表只给了 Lv／HP／双防／狂暴／弱抗，攻击与魔攻列留空，本页照实不推算。</li>
            </ul>
            <div class="note">五代八项属性的<b>具体百分比数值</b>（火水地风光暗爱各 +/- 多少）在「战斗与弱点」页 RF5 一节，与本表同源、口径一致——本表只收「哪几个属性弱、哪几个抗」的结论与基础数值。芬布尔境界的最终 BOSS 在原流程页未给专名，暂以「芬布尔境界 BOSS」指代。</div>`;
            };

            /* ---------- RF4 ---------- */
            const blk4 = () => {
                const EL7 = ['火', '水', '地', '风', '光', '暗', '爱'];
                const dash = v => (v === null || v === undefined) ? '<span class="mon-no">—</span>' : String(v);
                const parseR4 = s => {
                    if (!s || s === '待补') return { weak: '<span class="mon-no">待补</span>', resist: '<span class="mon-no">待补</span>' };
                    const m = {}; let hasNum = false;
                    const re = /(火|水|地|风|光|暗|爱)(-?\d+)/g;
                    let r; while ((r = re.exec(s)) !== null) { m[r[1]] = +r[2]; hasNum = true; }
                    if (hasNum) {
                        const wk = EL7.filter(e => m[e] < 0).map(e => '<b class="wk">' + e + m[e] + '%</b>');
                        const rs = EL7.filter(e => m[e] > 0).map(e => e + m[e] + '%');
                        return { weak: wk.length ? wk.join('、') : '无', resist: rs.length ? rs.join('、') : '无' };
                    }
                    const wk = (s.match(/([火水地风光暗爱])弱/g) || []).map(x => '<b class="wk">' + x[0] + '</b>');
                    const rs = (s.match(/([火水地风光暗爱])抗/g) || []).map(x => x[0]);
                    return { weak: wk.length ? wk.join('、') : '无', resist: rs.length ? rs.join('、') : '无' };
                };
                const H = ['BOSS', 'Lv', 'HP', '攻击', '防御', '魔攻', '魔防', '弱点', '抵抗', '出现点'];
                const rows = B.rf4.map(x => {
                    const p = parseR4(x[7]);
                    return [x[0], dash(x[1]), dash(x[2]), dash(x[3]), dash(x[4]), dash(x[5]), dash(x[6]), p.weak, p.resist, x[8]];
                });
                const all = B.rf4;
                const hpVals = all.filter(x => x[2] !== null).map(x => x[2]);
                const lvVals = all.filter(x => x[1] !== null).map(x => x[1]);
                const hpMin = hpVals.length ? Math.min.apply(null, hpVals) : 0;
                const hpMax = hpVals.length ? Math.max.apply(null, hpVals) : 0;
                const lvMin = lvVals.length ? Math.min.apply(null, lvVals) : 0;
                const lvMax = lvVals.length ? Math.max.apply(null, lvVals) : 0;
                const miss = all.filter(x => x[2] === null).length;
                const top = all.filter(x => x[2] !== null).slice().sort((a, b) => b[2] - a[2])[0];
                return `
            <h2 class="h2">符文工房4：${all.length} 位主线 BOSS</h2>
            <p class="p">四代（RF4）的 BOSS 表按主线出场顺序排，数值取自 fandom「therunefactory」怪物数值表与 GameFAQs 主线流程攻略。<b>抗性串是七项百分比系数</b>（火/水/地/风/光/暗/爱）：<b>负数弱、正数抗，绝对值越大越极端</b>——和五代同一套量纲。例如死亡树火 -200% 等于「极弱火」，拿火属性打它收益最高。</p>
            ${stat([['收录', all.length + ' 位'], ['Lv 区间', lvVals.length ? (lvMin + ' ～ ' + lvMax) : '部分待补'], ['HP 区间', hpVals.length ? (hpMin.toLocaleString() + ' ～ ' + hpMax.toLocaleString()) : '部分待补'], ['数值待补', miss + ' 位']])}
            ${tbl(H, rows, { leftFirst: true, cls: 'boss', colw: ['8rem'] })}
            ${top ? '<p class="p">数值最高的是<b>' + top[0] + '</b>（Lv ' + top[1] + '、HP ' + top[2].toLocaleString() + '），作为最终 BOSS 镇守浮游帝国城。</p>' : ''}
            <h3 class="h3">看这张表的三件事</h3>
            <ul class="ul">
                <li class="li"><b>弱点和五代一样是百分比系数</b>：负数是弱点（如埃塞尔巴德爱 -10%、弗雷克火龙水弱），正数是抗性（如阿克娜水龙水 50%、死亡树水/地 50%）。弱的那一项会放大你打出去的伤害。</li>
                <li class="li"><b>${miss} 位线上没有可靠的 HP／攻防源</b>（安布洛希亚、霸王花、左之、右乃、石棺、塞克斯龙等），本页<b>留空标「待补」、不推算</b>；它们的弱点／抵抗同样只在 GameFAQs 明确写到时才填（如普罗戴地龙风弱地抗、弗雷克火龙水弱火抗），其余标待补。</li>
                <li class="li"><b>双极值并列会同时标出</b>：死亡树同时火 -200%（极弱）与地/水 50%（抗），所以它在「弱点」列出现、又在「抵抗」列出现——一条 BOSS 同时占两列是正常的。</li>
            </ul>
            <div class="note">四代八项属性（含状态抗）的<b>完整百分比明细</b>在「战斗与弱点」页 RF4 一节（resist4.js），与本表同源。本表只收主线 BOSS 的 Lv/HP/攻防与「哪几个属性弱、哪几个抗」的结论。少数 BOSS 的弱点仅 GameFAQs 以「X弱Y抗」定性给出、未给百分比，本页照实不换算成数字。</div>`;
            };

            /* ---------- RFF（边境） ---------- */
            const blkRff = () => {
                const names = ['火', '水', '风', '地'];
                const wkOf = s => {
                    if (!s || s === '—') return '<span class="mon-no">无数据</span>';
                    const m = s.match(/火(\d+)水(\d+)风(\d+)地(\d+)/);
                    if (m) {
                        const el = [+m[1], +m[2], +m[3], +m[4]];
                        const mn = Math.min.apply(null, el);
                        const low = el.map((v, i) => v === mn ? names[i] : null).filter(Boolean);
                        if (low.length === el.length) return '<span class="mon-no">四属性均等</span>';
                        return '<b class="wk">' + low.join('、') + '</b>';
                    }
                    if (s.indexOf('全属性') >= 0) return '<span class="mon-no">四属性均等</span>';
                    return '<span class="mon-no">—</span>';
                };
                const H = ['BOSS', 'Lv', 'HP', '攻击', '防御', '魔攻', '抗性', '弱点', '出现点'];
                const rows = B.rff.map(x => [x[0], x[1], x[2], x[3], x[4], x[5], x[6], wkOf(x[6]), x[7]]);
                const tank = B.rff.filter(x => {
                    const s = x[6];
                    if (s.indexOf('全属性') >= 0) return true;
                    const m = s.match(/火(\d+)水(\d+)风(\d+)地(\d+)/);
                    if (m) { const el = [+m[1], +m[2], +m[3], +m[4]]; return el.every(v => v === el[0]); }
                    return false;
                }).length;
                const lvMin = Math.min.apply(null, B.rff.map(x => x[1]));
                const lvMax = Math.max.apply(null, B.rff.map(x => x[1]));
                const hpMin = Math.min.apply(null, B.rff.map(x => x[2]));
                const hpMax = Math.max.apply(null, B.rff.map(x => x[2]));
                return `
            <h2 class="h2">符文工房 边境：${B.rff.length} 位主线 BOSS</h2>
            <p class="p">边境（RFF）的 BOSS 数据来自 biligame 的 RFFmonster 页，与本站「魔物图鉴」同源——这 ${B.rff.length} 位是主线推进里会硬碰的 BOSS：若草遗迹的鸡鹫兽打头，雪草遗迹地下三层连着艾莉丝与四台魔力驱动单元，最后是雪草遗迹地下七层的冰蛇。字段和一代一样是<b>四属性点数</b>：<b>数越大越抗，最小的那项才是弱点</b>。</p>
            ${stat([['收录', B.rff.length + ' 位'], ['Lv 区间', lvMin + ' ～ ' + lvMax], ['HP 区间', hpMin.toLocaleString() + ' ～ ' + hpMax.toLocaleString()], ['四属性均等', tank + ' 位']])}
            ${tbl(H, rows, { leftFirst: true, cls: 'boss', colw: ['8rem'] })}
            <h3 class="h3">三件事先看</h3>
            <ul class="ul">
                <li class="li"><b>没有独立的魔防字段</b>。表的「魔攻」一列是魔物的魔法攻击力，防御力对物理与魔法通用——这一点和一代不同（一代魔防单列），别拿一代的直觉套过来。</li>
                <li class="li"><b>${tank} 位四属性均等</b>（瓦格纳、魔法生物、杰尔文），属性对它们只剩「不减伤」的意义，靠面板、回复和走位硬啃。</li>
                <li class="li"><b>瓦格纳「无视魔杖攻击」</b>——它不吃魔杖系的魔法攻击，得靠物理或剑技；魔力驱动单元 A～D 同场出现、数值各异，是一波多体战。</li>
            </ul>
            <div class="note">抗性一列原样保留 wiki 写法：「火10水30风10地15」是四属性点数，「全属性15」是四属性均等，「风20」只标注了风一项（其余按基准），「—」是原文未给。弱点列由本页从上述点数自动挑出最小值，双最小会并列标出（如冰蛇火、风同为 10）。</div>`;
            };

            /* ---------- 收尾：三套量纲 ---------- */
            const tail = `
            <h2 class="h2">四套量纲，别混着比</h2>
            <p class="p">同样是「写着抗火」这一件事，落到四作里可以是完全不同的话：一代是扣掉大部分伤害，三代可能变成「吸收」——打上去反而给它回血，四代则只是按百分比打个折。这就是本站把各作分开列表的原因：</p>
            ${tbl(['作品', '属性怎么记', '怎么读'], [
                    ['RF1 / 边境 / 海洋', '属性攻击・防御点数', '数值越高越抗，<b>最低的那项才是弱点</b>'],
                    ['RF2', '单一属性 + 克制', '同属性减伤、克制属性增伤（地属性魔物：无属性约 70、地属性约 50、风属性约 100）'],
                    ['RF3', '抗性等级（−2 ～ 4）', '−2 受伤 3 倍、−1 受伤 1.5 倍、1 级减半、2 级减 7/8、3 级免疫、4 级回血'],
                    ['RF4 / RF5', '百分比系数', '负数弱、正数抗，绝对值越大越极端（明细见「战斗与弱点」）'],
                ], { leftFirst: true, cls: 'txt', colw: ['8rem', '8rem'] })}
            <div class="note">这一节的分类与等级换算出自 wiki 的「元素属性」页，不是推算。通关后回头打高难度时，最常踩的坑就是拿上一作的直觉套这一作——尤其是从四代（百分比）回到一代（点数）的时候，数字看着都是两位数，含义完全不同。</div>

            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">普通怪在哪、能不能抓、掉什么</div>
                </a>
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">RF4／RF5 的八项抗性明细与状态抗</div>
                </a>
            </div>`;

            const per = { rf1: blk1, rf2: blk2, rf3: blk3, rfo: blkR, rf4: blk4, rf5: blk5, rff: blkRff };
            const mid = (per[id] || blk1)();
            return intro + mid + tail;
        }
    },
    {
        key: 'farm', group: 'life', title: '农场与田地', icon: 'sprout',
        body: () => `
            <h2 class="h2">田地的结构</h2>
            <p class="p">开局通常只有一小块地，需要通过剧情、委托或购买逐块扩张。田块按「格」计算，一格种一株。农具的蓄力等级决定一次能处理几格——这是前期最值得投资的能力。</p>
            ${tbl(['要素', '作用'], [
                ['耕地', '用锄头翻土后才能播种'],
                ['浇水', '每天一次；雨天免浇。作物缺水会停止生长'],
                ['施肥', '提升作物等级与品质，长期种植必须维护地力'],
                ['收获', '成熟后收获；部分作物可再生，收完不拔'],
                ['地力', '连作会下降，休耕或施肥恢复'],
            ], { leftFirst: true })}
            <h2 class="h2">种什么最划算</h2>
            <p class="p">判断标准不是「单价高」，而是<b>「单价 × 收获次数 ÷ 占地天数」</b>。生长周期短、能反复收获的作物，在前期的实际收益往往高于看着贵的稀有作物。</p>
            <div class="key">前期最稳的路线：<b>用短周期作物滚出第一笔钱 → 买肥料把地力拉起来 → 再换高价值作物</b>。反过来做，会卡在「有种子没钱买肥料」的死循环里。</div>
            <h2 class="h2">魔物帮忙</h2>
            <p class="p">驯服的魔物可以派到田里做浇水、收获的工作（各作开放程度不同）。第一只用于农活的魔物，实际收益远高于同期的战斗伙伴。</p>
        `
    },
    {
        key: 'home', group: 'life', title: '自宅与扩建', icon: 'house2',
        body: () => `
            <h2 class="h2">一开始的房子里有什么</h2>
            <p class="p">床（睡觉／存档）、日历（查节日与生日）、电视或公告（看天气预报）、储物箱、厨房（需要购买或扩建后开放）。</p>
            <h2 class="h2">扩建顺序建议</h2>
            ${tbl(['优先级', '项目', '理由'], [
                ['①', '厨房', '料理是中期最主要的 RP／HP 补给来源，也是送礼主力'],
                ['②', '储物箱扩容', '素材一多，背包与箱子不够用是最常见的卡点'],
                ['③', '锻造台／药学台', '自制装备与药品，性价比远高于商店购买'],
                ['④', '双人床', '结婚前置条件（各作要求不同）'],
                ['⑤', '装饰台', '家具与饰品属于后期内容，靠装饰提升舒适度与部分加成'],
            ], { leftFirst: true })}
            <div class="note">扩建需要素材与金钱，而素材大多来自迷宫。所以「下迷宫」和「扩建房子」不是两件事，是一条线的前后段。</div>
            <h2 class="h2">存档与时间管理</h2>
            <p class="p">系列传统是<b>只能在床上存档</b>。这意味着一天的行动是不可回退的（除个别作品有中断存档）。重要节点前——告白、求婚、Boss 战、节日比赛——先睡一觉存上。</p>
        `
    },
    {
        key: 'shop', group: 'life', title: '商店与设施', icon: 'shop',
        body: () => `
            <h2 class="h2">镇上的基本配置</h2>
            <p class="p">无论哪一作，一套完整的城镇都包含以下几类设施。名称随作品变化，功能基本一致。</p>
            ${tbl(['设施', '功能', '什么时候去'], [
                ['杂货店', '种子、肥料、基础道具', '每季初换季作物，务必第一天就去'],
                ['锻冶屋', '武器、防具、农具强化', '拿到新矿石之后'],
                ['诊所／医院', '买药、治疗、部分剧情', '体力管理失误后'],
                ['餐厅／食堂', '料理、食谱、部分委托', '补 RP、刷好感'],
                ['旅馆／澡堂', '住宿、泡澡恢复、情报', '夜晚，常触发好感事件'],
                ['教会', '结婚仪式、部分事件', '恋爱线后期'],
                ['委托板／依赖箱', '接任务、拿奖励', '每天出门先看'],
            ], { leftFirst: true })}
            <div class="key">逛镇子有个高效顺序：<b>委托板 → 杂货店 → 锻冶屋 → 逐个送礼</b>。前三个是资源，最后一个是时间，凑一趟走完。</div>
            <h2 class="h2">营业时间</h2>
            <p class="p">每家店都有开门与关门时间，晚上去会吃闭门羹。多数作品在店门口或菜单里能查到营业时间。换季第一天、节日当天，部分店铺不开。</p>
        `
    },
    {
        key: 'crop', group: 'life', title: '农作', icon: 'seed',
        body: g => `
            <h2 class="h2">一株作物的完整流程</h2>
            <p class="p">翻土 → 播种 → 每天浇水 → （施肥）→ 成熟 → 收获。看着简单，实际决定收益的是三个变量：<b>生长天数、收获次数、单次产量</b>。</p>
            ${tbl(['类型', '特点', '经营方式'], [
                ['单次收获型', '成熟后拔掉，地空出来', '适合赚快钱，前期主力'],
                ['反复收获型', '成熟后持续结果，不拔', '占地时间长，中期主力'],
                ['高价值型', '单价高但周期长', '需要先有地力与资金余量'],
            ], { leftFirst: true })}
            <h2 class="h2">品质与等级</h2>
            <p class="p">作物有等级，等级越高单价越高，也是料理与委托的要求。提升等级靠施肥与连续在同一块地上种植优良品。想稳定产出高等级作物，就要固定一块「种苗田」，专门循环优等品。</p>
            <div class="note">杂草与石头会占格，每天顺手清掉。别把清杂草当成杂活——它直接决定你当天能种多少。</div>
            ${g.id.indexOf('rf1') === 0 ? crop1Html() : (g.id.indexOf('rf5') === 0 ? crop5Html() : (g.id.indexOf('rf4') === 0 ? crop4Html() : (g.id === 'rff' ? cropRffHtml() : '')))}
        `
    },
    {
        key: 'beast', group: 'life', title: '魔物与伙伴', icon: 'monster',
        body: () => {
            const n5 = (typeof MON !== 'undefined' && MON.rf5) ? MON.rf5.length : 0;
            const n4 = (typeof MON !== 'undefined' && MON.rf4) ? MON.rf4.length : 0;
            const n1 = (typeof MON_RF1 !== 'undefined' && MON_RF1) ? MON_RF1.length : 0;
            return `
            <h2 class="h2">这个系列里没有「动物」，只有魔物</h2>
            <p class="p">《符文工房》的牧场里<b>没有牛，也没有鸡</b>。你以为在养家畜，其实养的每一只都是<b>魔物</b>：外形像牛、像鸡、像羊、像蜂的幻想生物，被你投喂收服之后住进小屋，第二天起开始产奶、下蛋、长毛、酿蜜。它们只是<b>长得像</b>而已，物种上依旧是魔物。</p>
            <div class="key">所以这里没有「动物」这个类别，<b>「家畜」是魔物的职能，不是物种</b>。同一只魔物，可以当牲畜产奶、当劳力种田、当战力陪你下迷宫——换个用途而已，本体不变。这一页讲的就是怎么把它从野地里的敌人变成伙伴，下一页的图鉴是名录。</div>

            <h2 class="h2">魔物从哪来：只能自己去抓</h2>
            <p class="p">系列里<b>没有卖魔物的店</b>。想要一头会产奶的、一只会下蛋的，只能带着它认的东西去野外找到它、投喂、收服。家畜、宠物、坐骑都一样，从第一作到最新作没有变过。</p>
            <div class="key">这正是它和《牧场物语》最根本的结构差异：《牧场物语》走进动物屋掏钱就能牵一头牛回来；《符文工房》<b>连动物屋都不存在</b>——牲畜全靠自己在野外一只一只抓。</div>
            <p class="p">所以牧场能扩到多大，取决于你愿不愿意花时间蹲点，而不是取决于攒了多少钱。开局想早点有稳定产出，唯一的路是<b>尽快学会驯服，并记住哪片野地有会产奶、会下蛋的魔物</b>。</p>

            <h2 class="h2">怎么驯服</h2>
            <p class="p">顺序是：<b>先刷毛把气氛拉起来 → 再投喂它认的东西 → 反复直到出现爱心</b>。刷毛反复刷到头顶不再冒音符就停手，这一步能明显减少后续投喂的次数。</p>
            ${tbl(['投喂后的反应', '含义', '下一步'], [
                ['爱心出现并逐渐变大', '驯服成功', '弹出起名界面，选择送回小屋或编入队伍'],
                ['出现骷髅', '这一次失败', '继续投喂，不要中断，中断会掉好感'],
                ['既无爱心也无骷髅', '无效', '物品不对／小屋已满／这只本来就不可驯服'],
            ], { leftFirst: true })}
            <h3 class="h3">三个影响成功率的因素</h3>
            <ul class="ul">
                <li class="li"><b>等级差</b>：主角等级高于目标时门槛下降；低于目标时，连投它的掉落物也要多喂好几份。</li>
                <li class="li"><b>投喂什么</b>：任何东西都能投，差别只在快慢。<b>投它自己掉的东西</b>最省事——打到它自然就捡到了，不用另外备料；杂草之类也能推进，只是要多喂好几次。</li>
                <li class="li"><b>小屋空位</b>：满员时投喂不会有反应，先扩建或清出隔间。</li>
            </ul>
            <div class="note">Boss 与部分精英／剧情敌人<b>无法驯服</b>，怎么投喂都没用，直接打死拿素材。高等级迷宫里的 Boss 宠即使理论上可驯，也往往要上百份投喂品，性价比极低。</div>

            <h2 class="h2">每天的四步</h2>
            ${tbl(['步骤', '做什么', '影响'], [
                ['喂食', '往小屋的饲料桶补牧草，每只每天约 1 份', '不喂会掉好感，长期不喂会生病甚至出走'],
                ['刷毛', '用刷子反复刷，刷到不再冒音符为止', '好感涨得最快的手段，也直接影响产物等级'],
                ['收获', '拿走当天的奶／蛋／毛／蜜', '不取走，第二天不会累积产出'],
                ['放牧', '晴天放出去吃草，雨天收回', '放牧提升好感与产出；雨天留在外面会生病'],
            ], { leftFirst: true })}
            <div class="key">前期最划算的投资不是多买几只，而是<b>把已有那几只的好感拉满</b>。同样的数量，满好感的产出可以是低好感的数倍——这是复利，不是加法。</div>

            <h2 class="h2">产物对照</h2>
            ${tbl(['产物', '来源（外形相似的魔物）', '主要用途'], [
                ['牛奶', '水牛型', '料理、加工、委托的常客'],
                ['蛋', '鸡型', '料理、委托；部分作品可孵化'],
                ['羊毛／软毛', '羊型', '纺织素材，高单价委托常见'],
                ['蜂蜜', '蜂型', '料理与药学两头都要'],
            ], { leftFirst: true })}
            <p class="p">RF5 的数据可以直接印证这个等式：全套畜牧产物由<b>四种魔物</b>包办——一头牛、一只鸡、两只羊（其中一只是换皮）。</p>
            ${typeof MON_BREED !== 'undefined' ? tbl(['魔物', '产物（普通 → 优质 → 顶级）'],
                MON_BREED.map(b => [b.n, b.o.replace(/→/g, ' → ')]), { leftFirst: true, colw: ['5.4rem'] }) : ''}
            <div class="note">产物的<b>等级</b>跟着好感走，而等级又决定单价与能否交委托。所以「刷毛」不是可有可无的日常，它等于在给产物加价。</div>

            <h2 class="h2">小屋里的三件事</h2>
            ${tbl(['用途', '细节'], [
                ['产出', '每天固定产出副产品，等级随好感上升'],
                ['农活', '派去照顾农田：1 只每天约消耗 1 份牧草，可照料约 1/3 块田；长期连轴会疲劳'],
                ['战斗', '跟随出战并同步升级，等级越高战力与劳作效率越好'],
            ], { leftFirst: true })}
            <p class="p"><b>换小屋</b>的做法比较绕：先把它编进队伍，人走到目标小屋门口，再让它「回到小屋」。想集中管理时，这一步比拆建小屋省事得多。</p>

            <h2 class="h2">按用途挑，而不是按战力挑</h2>
            <p class="p">优先级很明确：<b>先补齐产奶／蛋／毛／蜜的几种，再补 2～3 只劳力型，最后才考虑战斗型</b>。多一只攻击型只是让迷宫快一点，多一只产出型是每天多一份稳定收入。</p>

            <h2 class="h2">宠物与坐骑，也还是魔物</h2>
            <p class="p">能跟在你身边陪练的、能骑着跑的，同样不是普通动物，而是<b>被收服的魔物</b>——只不过它们不产奶下蛋，专职陪练、帮忙放牧或载你赶路。所以「宠物」在本系列里不是另一个物种分类，只是魔物的另一种用途。</p>
            <p class="p">骑乘一开放，先把全镇跑一遍重新认识距离——很多「走不到」的地方会突然变成顺路。</p>

            <h2 class="h2">顺带一提：有些「人」也是魔物</h2>
            <p class="p">系列里有一类特殊存在：主角或关键角色本身就是魔物／混血（RF3 的麦斯、RF4 的琥珀与朵儿洁、RF5 的芙佳）。<b>「人类与魔物的对立」</b>是这条支线的固定主题，也是多部作品主线的核心矛盾——这正解释了为什么本系列要把家畜设定成魔物，而不是直接沿用牛和鸡。</p>

            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">RF5 ${n5} 种、RF4 ${n4} 种、RF1 ${n1} 种：能否驯服、捕捉率、掉落道具</div>
                </a>
            </div>
        `;
        }
    },
    {
        key: 'mbook', group: 'life', title: '魔物图鉴', icon: 'paw',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const nm = (g && g.name) || '当前作品';
            const mon5 = (typeof MON !== 'undefined' && MON.rf5) || [];
            const mon4 = (typeof MON !== 'undefined' && MON.rf4) || [];
            const m4 = (typeof MON_RF4 !== 'undefined') ? MON_RF4 : [];
            const m1 = (typeof MON_RF1 !== 'undefined') ? MON_RF1 : [];
            const mro = (typeof MON_RFO !== 'undefined') ? MON_RFO : [];
            const m2 = (typeof MON_RF2 !== 'undefined') ? MON_RF2 : [];
            const mf = (typeof MON_RFF !== 'undefined') ? MON_RFF : [];
            const m3 = (typeof MON_RF3 !== 'undefined') ? MON_RF3 : [];
            const ore3 = (typeof ORE_RF3 !== 'undefined') ? ORE_RF3 : [];
            const boss3 = (typeof BOSS_RF3 !== 'undefined') ? BOSS_RF3 : [];
            const rfm = (typeof RFF_MON !== 'undefined') ? RFF_MON : [];
            const others = [
                ['rf1', '符文工房 新牧场物语', m1.length],
                ['rf2', '符文工房2', m2.length],
                ['rf3', '符文工房3', m3.length],
                ['rfo', '符文工房 海洋', (typeof RFO_MON !== 'undefined' ? RFO_MON.length : mro.length)],
                ['rff', '符文工房 边境', rfm.length || mf.length],
                ['rf4', '符文工房4', m4.length],
                ['rf5', '符文工房5', mon5.length],
            ].filter(x => x[2] > 0);

            const bar = n => `<div class="mon-filter">
                <input id="monQ" type="search" placeholder="输入魔物名、掉落或地点筛选" />
                <span id="monCount" class="mon-count">${n} 条</span>
            </div>`;

            /* ---------- RF5 ---------- */
            const block5 = () => {
                const can = mon5.filter(x => x.ok).length;
                const row = x => `<tr data-s="${x.n} ${x.f.join(' ')}" data-ok="${x.ok}">
                    <td class="td left mon-n">${x.n}</td>
                    <td class="td">${x.ok ? '<span class="mon-yes">可</span>' : '<span class="mon-no">—</span>'}</td>
                    <td class="td">${x.r || '—'}</td>
                    <td class="td mon-f">${x.f.length ? x.f.join('、') : '—'}</td>
                </tr>`;
                return `
            <p class="p">RF5 的魔物既是敌人也是家畜。下面这些是<b>能收进牧场的名单</b>，最后一列是打死它掉的东西；掉落物同时就是投喂时最省事的饵。</p>
            ${stat([['收录', mon5.length + ' 种'], ['可驯服', can + ' 种'], ['不可驯服', (mon5.length - can) + ' 种']])}
            ${bar(mon5.length)}
            <div class="chip-row" id="monChips">
                <button class="chip on" data-mk="all">全部</button>
                <button class="chip" data-mk="1">可驯服</button>
                <button class="chip" data-mk="0">不可驯服</button>
            </div>
            <div class="table mon-table" data-list="rf5"><table><thead><tr>
                <th class="th left">魔物</th><th class="th">可驯</th><th class="th">捕捉率</th><th class="th">掉落道具</th>
            </tr></thead><tbody>${mon5.map(row).join('')}</tbody></table></div>
            <p class="p">「捕捉率」是不带任何加成、直接投喂时的基准值，等级差会明显影响它。标 <span class="mon-no">—</span> 的是不可驯服，只能打。</p>`;
            };

            /* ---------- RF4 ---------- */
            const block4 = () => {
                const st = {};
                m4.forEach(x => { if (!st[x[0]]) st[x[0]] = x; });
                const list = mon4.slice().sort((x, y) => {
                    const lx = st[x.n] ? st[x.n][1] : -1, ly = st[y.n] ? st[y.n][1] : -1;
                    return ly - lx;
                });
                const matched = list.filter(x => st[x.n]).length;
                const lv = list.filter(x => st[x.n]).map(x => st[x.n][1]);
                const row = x => {
                    const v = st[x.n];
                    return `<tr data-s="${x.n} ${x.f.join(' ')}">
                    <td class="td left mon-n">${x.n}</td>
                    <td class="td">${v ? v[1] : '—'}</td>
                    <td class="td">${v ? v[2] : '—'}</td>
                    <td class="td">${v ? v[3] : '—'}</td>
                    <td class="td mon-f">${x.f.length ? x.f.join('、') : '—'}</td>
                </tr>`;
                };
                return `
            <p class="p">RF4 的怪物表能直接读出<b>基础等级、HP 与攻击</b>——这三项决定了它在你当前等级下「能不能碰」。默认按等级从高到低排，最上面那批就是终盘才该碰的。</p>
            ${stat([['收录', list.length + ' 种'], ['有基础数值', matched + ' 种'], ['等级范围', Math.min.apply(null, lv) + '–' + Math.max.apply(null, lv)]])}
            ${bar(list.length)}
            <div class="table mon-table" data-list="rf4"><table><thead><tr>
                <th class="th left">魔物</th><th class="th">等级</th><th class="th">HP</th><th class="th">攻击</th><th class="th">掉落道具</th>
            </tr></thead><tbody>${list.map(row).join('')}</tbody></table></div>
            <p class="p">表内数值是<b>基础值</b>，随迷宫与难度倍率变动。Boss、剧情敌人与塞克斯系机械兵不可驯服，投喂无效。属性抗性另见<a class="link" href="#/page/battle">战斗与弱点</a>。</p>
            <div class="note">掉落物取自怪物喜好表（旧汉化译名：兽人、哥布林、牛头人），等级／HP 取自 RF4S 解包表（官方简中译名：维京兽人、哥布林海盗）。两套译名只对上了 ${matched} 种，剩下的等级列留「—」——与其硬凑一个对应关系，不如标明缺口。</div>`;
            };

            /* ---------- RF1 ---------- */
            const block1 = () => {
                const rf1m = (typeof RF1_MON !== 'undefined') ? RF1_MON : [];
                const cell1 = v => (v == null || v === '' || v === '—') ? '—' : v;
                const hps1 = rf1m.map(x => x[1]).filter(v => typeof v === 'number');
                const places1 = [];
                rf1m.forEach(x => (x[18] || '').split('、').forEach(p => {
                    if (p && places1.indexOf(p) < 0) places1.push(p);
                }));
                const job = m1.filter(x => x.emp).length;
                const locs = [];
                m1.forEach(x => { if (locs.indexOf(x.loc) < 0) locs.push(x.loc); });
                const kinds = (typeof KIND_RF1 !== 'undefined') ? KIND_RF1 : [];
                const abils = (typeof ABIL_RF1 !== 'undefined') ? ABIL_RF1 : [];
                const atk = abils.filter(a => a.indexOf('属性攻击') >= 0);
                const extra = abils.filter(a => a.indexOf('属性攻击') < 0);
                const row1 = x => `<tr data-s="${x.n} ${x.f.join(' ')} ${x.emp} ${x.loc}">
                    <td class="td left mon-n">${x.n}</td>
                    <td class="td">${x.loc.replace(/洞窟|遗迹|山$/, '')}</td>
                    <td class="td mon-f">${x.f.length ? x.f.join('、') : '—'}</td>
                    <td class="td">${x.emp || '<span class="mon-no">—</span>'}</td>
                </tr>`;
                return `
            <p class="p">初代就已经把这份名单写成了「怪物表」，而且从第一作起就<b>分两套栏位</b>：一栏掉落物，一栏<b>雇佣能力</b>——协助收获、协助浇水、产羊毛、产蜂蜜、产蛋、可骑乘。魔物从初代起在数据层面就同时是敌人和劳力，这正是本系列「家畜即魔物」最早的证据。</p>
            ${stat([['收录', m1.length + ' 只'], ['可雇用', job + ' 只'], ['种族／洞窟', kinds.length + ' 类 · ' + locs.length + ' 座']])}

            <h2 class="h2">10 大种族：图鉴是按种族分页的</h2>
            <p class="p">游戏内的魔物图鉴不是一张长列表，而是按<b>种族标签</b>分页。初代一共 ${kinds.length} 个标签，这在本系列里算多的——后来的作品往往合并了几类。</p>
            ${tbl(['种族', '种族'], (() => {
                    const half = Math.ceil(kinds.length / 2);
                    return kinds.slice(0, half).map((k, i) => [
                        '<b>' + k + '</b>', kinds[half + i] ? '<b>' + kinds[half + i] + '</b>' : ''
                    ]);
                })(), { leftFirst: true, cls: 'txt', colw: ['50%', '50%'] })}
            <p class="p">用法很实际：<b>同一种族往往共享弱点与掉落素材</b>。想刷「虫皮」、「坚固的丝」，就直奔昆虫页；想找「豹爪」「怒之牙」，那是亚人页里的事。</p>

            <h2 class="h2">11 种特技：4 种属性 + 7 种附加效果</h2>
            <p class="p">魔物的攻击方式在数据里是一张独立表。它分两半——<b>上半是属性</b>（决定该穿什么抗性装备），<b>下半是附加效果</b>（决定你会不会被击飞、封印、麻痹）。</p>
            ${tbl(['属性攻击', '附加效果'], [
                    [atk.map(a => a.replace('攻击', '')).join('、'), extra.map(a => a.replace('攻击', '')).join('、')]
                ], { leftFirst: true, cls: 'txt', colw: ['10rem'] })}
            <div class="key">被<b>击飞</b>和<b>倒地</b>不是「伤害高」，而是硬直——这两下之后你有一小段时间动不了，接着挨的才是真伤害。<b>打会击飞的大体型怪，先手比防御重要</b>。</div>

            <h2 class="h2">全魔物清单</h2>
            <p class="p">按洞窟顺序排列。洞窟名用汉化定稿的全称，表内省略了「洞窟／遗迹」后缀。</p>
            ${bar(m1.length)}
            <div class="table mon-table" data-list="rf1"><table><thead><tr>
                <th class="th left">魔物</th><th class="th">洞窟</th><th class="th">掉落道具</th><th class="th">雇佣能力</th>
            </tr></thead><tbody>${m1.map(row1).join('')}</tbody></table></div>
            <p class="p">初代表里根本<b>没有「喜好」这一栏</b>，只有掉落物和雇佣能力——后来解包表把掉落物那栏命名成「喜好道具」，才引出了误解。</p>

            <h2 class="h2">战斗数值：血量与全套抗性</h2>
            <p class="p">初代的表比后来的作品还细——<b>五属性抗性、六种状态抗性、捕捉要摸几下</b>全写在一起。下面按 <b>HP 从高到低</b>排，越靠上越硬。</p>
            ${stat([['收录', rf1m.length + ' 条'], ['HP 范围', hps1.length ? Math.min.apply(null, hps1) + ' ～ ' + Math.max.apply(null, hps1) : '—'], ['带特殊能力', rf1m.filter(x => x[17] !== '—').length + ' 只'], ['洞窟', places1.length + ' 座']])}
            <h2 class="h2">血量与经验：先算一刀能砍几下</h2>
            ${ftableOwn(['魔物', 'HP', 'EXP', 'ATK', 'DEF'],
                    ['6.4rem', '3rem', '3rem', '3rem', '3rem'],
                    rf1m.map(x => [x[0] + ' ' + x[17] + ' ' + x[18],
                        [x[0], cell1(x[1]), cell1(x[2]), cell1(x[3]), cell1(x[4])]]),
                    { cls: 'mon-aux', ph: '输入名称/能力/洞窟筛选' })}
            <div class="note">HP 与 DEF 决定「要砍几刀」，ATK 决定「它砍你有多疼」。经验值（EXP）在这一作只影响<b>角色等级</b>，不影响魔物——魔物的强弱是写死的。</div>
            <h2 class="h2">五属性抗性：带对武器才打得动</h2>
            ${ftableOwn(['魔物', '物理', '火', '风', '水', '地'],
                    ['6.4rem', '2.6rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem'],
                    rf1m.map(x => [x[0] + ' ' + x[18],
                        [x[0], cell1(x[5]), cell1(x[6]), cell1(x[7]), cell1(x[8]), cell1(x[9])]]),
                    { cls: 'mon-aux', ph: '输入名称/洞窟筛选' })}
            <div class="note">数字越大越<b>抗</b>该属性。表里<b>物理抗性普遍是最低的那一项</b>（多在 8～18），四属性则在 20～30 上下——这就是初代「<b>物理最通用、属性武器要挑着用</b>」的由来。个别例外很关键：小小龙火 63、浮士德火 60，<b>拿火打它们几乎无效</b>。</div>
            <h2 class="h2">六种状态抗性：能不能被击飞、上毒</h2>
            ${ftableOwn(['魔物', '吹飞', '倒地', '毒', '封印', '麻痹', '吸收'],
                    ['5.6rem', '2.4rem', '2.4rem', '2.2rem', '2.4rem', '2.4rem', '2.4rem'],
                    rf1m.map(x => [x[0] + ' ' + x[18],
                        [x[0], cell1(x[10]), cell1(x[11]), cell1(x[12]), cell1(x[13]), cell1(x[14]), cell1(x[15])]]),
                    { cls: 'mon-aux', ph: '输入名称/洞窟筛选' })}
            <div class="note">同样是<b>数字越大越抗</b>。<b>毒／封印／麻痹大量是 0</b>——低阶怪基本随便上状态，越高阶越难（兽人领主三项都 20）。「吸收」是它对这类效果的承受上限值，不是回血。<b>吹飞与倒地是硬直</b>，被打中后你有一小段动不了。</div>
            <h2 class="h2">捕捉要摸几下，以及它有什么本事</h2>
            ${ftableOwn(['魔物', '手套', '特殊能力', '出现场所'],
                    ['5.6rem', '2.4rem', 'auto', '6rem'],
                    rf1m.map(x => [x[0] + ' ' + x[17] + ' ' + x[18],
                        [x[0], cell1(x[16]), cell1(x[17]), cell1(x[18])]]),
                    { cls: 'mon-aux', ph: '输入名称/能力/洞窟筛选' })}
            <div class="note"><b>「手套」是友好手套的标准抚摸次数</b>——想收服它，就得连摸这么多次（3 次最容易，8 次最磨人）。特殊能力一栏直接告诉你它<b>会用什么打你</b>：属性攻击决定你该穿什么抗性装，暴击／吸血／封印／麻痹这类附加效果决定你该不该先手。</div>
            <div class="note">本节数值取自 biligame 符文工厂 wiki 的「符文工厂1魔物数据表」，<b>译名沿用该 wiki</b>，与上方清单的汉化定稿名是两套体系（如这里的「兽人」＝上方清单的「野猪战士」），因此<b>不做强行合并</b>，两张表各自独立：上方看掉落与雇佣，这里看战斗数值。出现场所已按站内汉化名统一。原表留空的格子一律显示「—」，不补数。</div>
            <div class="note">种族与特技取自初代汉化工程的文本表（种族标签去掉「身边没有一起的魔物」这条界面提示后正好 10 条）；魔物个体名、洞窟、掉落与雇佣能力取自全资料整合的洞窟怪物表。洞窟译名已按汉化定稿统一为<b>卡麦特洞窟／特罗斯洞窟／克莱门斯洞窟／癸干忒山／密丝特布鲁姆／卡西米尔遗迹／达努洞窟／格力德洞窟</b>，与存档点地名表逐一对得上。</div>`;
            };

            /* ---------- RFO ---------- */
            const blockR = () => {
                const rm = (typeof RFO_MON !== 'undefined') ? RFO_MON : [];
                const rr = (typeof RFO_RES !== 'undefined') ? RFO_RES : [];
                const rd = (typeof RFO_DROP !== 'undefined') ? RFO_DROP : [];
                const rc = (typeof RFO_CROP !== 'undefined') ? RFO_CROP : [];
                const rp = (typeof RFO_PROD !== 'undefined') ? RFO_PROD : [];
                const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                const lvs = rm.map(x => x[1]).filter(v => typeof v === 'number');
                const hps = rm.map(x => x[2]).filter(v => typeof v === 'number');
                const boss = rm.filter(x => typeof x[1] === 'number' && x[1] >= 40);
                /* 抗性格：〇=有，×=弱点，—=原表未记 */
                const mk = v => v === '〇' ? '<span class="mon-yes">〇</span>'
                    : (v === '×' ? '<span class="mon-no">×</span>' : '<span class="mon-no">—</span>');
                const AREAS = ['土之精灵殿', '水之精灵殿', '炎之精灵殿', '风之精灵殿', '沉没船',
                    '无名岛', '神殿岛', '古代石像', '石像岛', '密林岛', '热沙岛', '封冰岛',
                    '艾利岛', '空中庭院', '石床庭院', '巨人的内部', '龙之祠堂', '圆形竞技场', '创世纪之战'];
                const areaCnt = AREAS.map(a => {
                    const n = rm.filter(x => (x[8] || '').indexOf(a) >= 0).length;
                    const extra = /^神殿$/.test(a) ? 0 : 0;
                    return [a, n + extra];
                }).filter(x => x[1] > 0).sort((x, y) => y[1] - x[1]);
                const dropStr = items => items.length
                    ? items.map(it => it[0] + ' <b>' + cell(it[1]) + '%</b>／<span class="mon-f">' + cell(it[2]) + '%</span>').join('、')
                    : '<span class="mon-no">—</span>';
                const cropStr = cs => cs.length
                    ? cs.map(c => c[0] + '（好感' + cell(c[1]) + '）').join('、')
                    : '<span class="mon-no">—</span>';

                const rowOld = x => `<tr data-s="${x[0]} ${x[1]} ${x[3].join(' ')} ${x[4].join(' ')} ${x[5].join(' ')}">
                    <td class="td left mon-n">${x[0]}</td>
                    <td class="td">${x[1]}</td>
                    <td class="td mon-f">${x[3].length ? x[3].join('、') : '—'}</td>
                    <td class="td mon-f">${x[4].length ? x[4].join('、') : '—'}</td>
                    <td class="td">${x[5].join('、') || '—'}</td>
                </tr>`;
                const sysList = [];
                mro.forEach(x => { if (x[1] && sysList.indexOf(x[1]) < 0) sysList.push(x[1]); });
                return `
            <p class="p">海洋这一作此前在站里<b>只有名字与喜好作物</b>——数值写死在程序里，攻略本只给了「怪日表」。现在补齐了<b>等级、HP、攻击／防御、魔攻／魔防、EXP、属性与状态抗性、掉落概率、能种的作物</b>，默认按等级从高到低排，最上面那批是终盘才该碰的。</p>
            ${stat([['收录', rm.length + ' 只'], ['等级范围', (lvs.length ? Math.min.apply(null, lvs) + ' ～ ' + Math.max.apply(null, lvs) : '—')], ['HP 范围', (hps.length ? Math.min.apply(null, hps).toLocaleString() + ' ～ ' + Math.max.apply(null, hps).toLocaleString() : '—')], ['高等级（LV40+）', boss.length + ' 只']])}
            <h2 class="h2">先按数值排：能不能碰一目了然</h2>
            <p class="p">等级、HP 与双攻双防直接决定它在你当前练度下「能不能打」，<b>EXP 列决定是否值得绕路去刷</b>。最上面几只（原生巨人 LV65／HP 55000）已经是剧情终盘的对手，不是练级对象。</p>
            ${ftableOwn(['魔物', 'LV', 'HP', '攻', '防', '魔攻', '魔防', 'EXP'],
                    ['6.4rem', '1.9rem', '3rem', '2.2rem', '2.2rem', '2.4rem', '2.4rem', '2.6rem'],
                    rm.map(x => [x[0] + ' ' + (x[8] || ''),
                        [x[0], cell(x[1]), cell(x[2]), cell(x[3]), cell(x[4]), cell(x[5]), cell(x[6]), cell(x[7])]]),
                    { cls: 'mon-aux', ph: '输入魔物名或地点筛选' })}
            <h2 class="h2">区域分布：哪个岛／哪座殿有多少只</h2>
            <p class="p">海洋的地图是<b>群岛 + 四座精灵殿</b>。下表按出现点统计每处能遇到多少种魔物，<b>数字越大越适合就近刷素材</b>——缺虫皮就守土之精灵殿，缺结晶就往深层走。</p>
            ${tbl(['区域', '魔物种数'], areaCnt.map(x => [x[0], x[1] + ' 种']), { leftFirst: true, cls: 'txt', colw: ['8rem', 'auto'] })}
            <h2 class="h2">属性抗性：带对武器才打得动</h2>
            <p class="p">前六列是<b>它的攻击带什么属性</b>（决定你该穿什么抗性装备），后六列是<b>它扛什么属性</b>（决定你该拿什么武器）。<b>〇 = 有这项，× = 该属性的弱点，— = 原表未记</b>。</p>
            ${ftableOwn(['魔物', '攻火', '攻水', '攻地', '攻风', '攻光', '攻暗', '防火', '防水', '防地', '防风', '防光', '防暗'],
                    ['5.4rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem', '1.6rem'],
                    rr.map(x => [x[0],
                        [x[0], mk(x[1]), mk(x[2]), mk(x[3]), mk(x[4]), mk(x[5]), mk(x[6]),
                            mk(x[7]), mk(x[8]), mk(x[9]), mk(x[10]), mk(x[11]), mk(x[12])]]),
                    { cls: 'mon-aux', ph: '输入魔物名筛选' })}
            <h2 class="h2">状态抗性：哪些异常能上、哪些免疫</h2>
            <p class="p">海洋的异常一共九种。下表<b>〇 = 能上这个状态，× = 无效（免疫），— = 原表未记</b>。想靠毒／麻痹拖住对手，先查这一张。</p>
            ${ftableOwn(['魔物', '毒', '麻痹', '封印', '眩晕', '睡眠', '疲劳', '感冒', '吸血', '即死'],
                    ['5.4rem', '1.7rem', '1.7rem', '1.7rem', '1.7rem', '1.7rem', '1.7rem', '1.7rem', '1.7rem', '1.7rem'],
                    rr.map(x => [x[0],
                        [x[0], mk(x[13]), mk(x[14]), mk(x[15]), mk(x[16]), mk(x[17]), mk(x[18]), mk(x[19]), mk(x[20]), mk(x[21])]]),
                    { cls: 'mon-aux', ph: '输入魔物名筛选' })}
            <h2 class="h2">掉落概率：刷素材前先算期望</h2>
            <p class="p">每格写成<b>「物品 普通%／高级%」</b>——前一个是不带称号时的掉率，后一个是<b>带「高级」称号时</b>的掉率。想提高稀有素材出货，先把称号刷出来比多打几只有效。</p>
            ${ftableOwn(['魔物', '掉落物（普通%／高级%）', '出现点'],
                    ['5.4rem', 'auto', '7rem'],
                    rd.map(x => [x[0] + ' ' + (x[2] || '') + ' ' + x[1].map(i => i[0]).join(' '),
                        [x[0], dropStr(x[1]), cell(x[2])]]),
                    { cls: 'mon-aux', ph: '按魔物名/掉落物/地点筛选' })}
            <h2 class="h2">能替你种什么：自然育成与巨大化率</h2>
            <p class="p">海洋的魔物收服后会<b>自己长东西</b>：「自然育成」写它长在哪一类上（作物／树木／生产），「巨大化率」是长成巨大作物的概率，<b>好感度越高、能种的作物种类越多</b>（好感 N 表示达到该值才解锁）。毛刷次数是刷到出产物所需的次数。</p>
            ${ftableOwn(['魔物', '自然育成', '巨大化率', '农作物（好感度）', '毛刷', '出现点'],
                    ['5rem', '2.4rem', '2.4rem', 'auto', '2rem', '6.4rem'],
                    rc.map(x => [x[0] + ' ' + (x[5] || '') + ' ' + x[3].map(c => c[0]).join(' '),
                        [x[0], cell(x[1]), (x[2] == null ? '—' : x[2] + '%'), cropStr(x[3]), cell(x[4]), cell(x[5])]]),
                    { cls: 'mon-aux', ph: '按魔物名/作物/地点筛选' })}
            <h2 class="h2">生产物：${rp.length} 只能固定产出</h2>
            <p class="p">蛋、奶、毛这类<b>周期性产出</b>只出自下面这几只——「产出天数」是<b>隔几天出一次</b>。想做料理不缺蛋奶，先把它们收齐。</p>
            ${ftableOwn(['魔物', '毛刷次数', '产出物', '产出天数', '出现点'],
                    ['5.4rem', '2.6rem', '4rem', '2.6rem', 'auto'],
                    rp.map(x => [x[0] + ' ' + (x[2] || '') + ' ' + (x[4] || ''),
                        [x[0], cell(x[1]), cell(x[2]), (x[3] == null ? '—' : x[3] + ' 天'), cell(x[4])]]),
                    { cls: 'mon-aux', ph: '按魔物名/产出物筛选' })}
            <h2 class="h2">攻略本怪日表：另一套译名，${mro.length} 种</h2>
            <p class="p">下面是站里原本就有的、来自《符文工厂海洋（最强攻略）》怪日表的名单，<b>译名与上面 wiki 表不完全一致</b>（例如「莫可莫可」＝「摩可摩可」、「小黄」＝「黄精灵」）。两张表都保留：这张的价值在<b>系别与功能分类</b>（树／收获／作物／产出／矿石），上面那些表的价值在<b>数值</b>。</p>
            ${bar(mro.length)}
            <div class="table mon-table" data-list="rfo"><table><thead><tr>
                <th class="th left">魔物</th><th class="th">系</th><th class="th">喜好作物</th><th class="th">产出</th><th class="th">捕捉地点</th>
            </tr></thead><tbody>${mro.map(rowOld).join('')}</tbody></table></div>
            <div class="note">${(typeof RFO_MONNOTE !== 'undefined') ? RFO_MONNOTE : ''}</div>
            <div class="note">怪日表的日文魔物名与地名已按系列通用译名转为中文，个别岛名（艾莉兰德、布利扎尔兰德、马格斯拉德）沿用意译或音译；它与 wiki 表只对上了 ${mro.filter(x => rm.some(y => y[0] === x[0])).length} 个名字，<b>不对上的不强行合并</b>——与其猜一个对应关系，不如两套并列。</div>`;
            };

            /* ---------- RF2 ---------- */
            const block2 = () => {
                const at = [];
                m2.forEach(x => { if (x[2] && x[2] !== '—' && at.indexOf(x[2]) < 0) at.push(x[2]); });
                const sk = [];
                m2.forEach(x => { if (x[3] && x[3] !== '—' && sk.indexOf(x[3]) < 0) sk.push(x[3]); });
                const row = x => `<tr data-s="${x[0]} ${x[1]} ${x[2]} ${x[3]} ${x[4]}">
                    <td class="td left mon-n">${x[0]}<span class="mon-desc">${x[4] || '—'}</span></td>
                    <td class="td">${x[1]}</td>
                    <td class="td">${x[2]}</td>
                    <td class="td">${x[3]}</td>
                </tr>`;
                const atTop = at.map(a => [a, m2.filter(x => x[2] === a).length])
                    .sort((x, y) => y[1] - x[1]);
                return `
            <p class="p">RF2 的怪物表有一件别作没有的东西：<b>每只魔物都带一条说明文</b>，末尾写明它的<b>特技</b>与<b>属性</b>。所以这一页能回答一个很实际的问题——<b>我打它之前该换哪把武器</b>。</p>
            ${stat([['收录', m2.length + ' 只'], ['属性', at.length + ' 种'], ['特技', sk.length + ' 种'], ['数据源', '游戏文本解包']])}
            <h2 class="h2">先看属性，再挑武器</h2>
            <p class="p">属性是这个名单里最有用的字段：<b>同一族的魔物往往同属性</b>——兽人与蚂蚁是地，哥布林与维京系列是火，水牛与陆龟是水。打一整片迷宫前先扫一眼属性分布，比带三把武器轮着换省事。</p>
            ${tbl(['属性', '只数'], atTop, { leftFirst: true, cls: 'txt', colw: ['6rem', '5rem'] })}
            <h2 class="h2">全魔物清单</h2>
            <p class="p">按解包顺序排列。名字是<b>个体名</b>（奥库伊奇、哥布欧），后面一列才是<b>种类</b>（兽人、哥布林）——同一只怪在这作里有自己的名字，这正是它能把魔物当伙伴养的前提。</p>
            ${bar(m2.length)}
            <div class="table mon-table" data-list="rf2"><table><thead><tr>
                <th class="th left" style="width:52%">魔物与简介</th><th class="th" style="width:16%">种类</th><th class="th" style="width:15%">属性</th><th class="th" style="width:17%">特技</th>
            </tr></thead><tbody>${m2.map(row).join('')}</tbody></table></div>
            <p class="p">简介里的描述常常直接点出打法：<b>「突进」的怪要提前横向闪，「连射攻击」的怪别站直线，「治愈」的怪拖久了会自己回满</b>。这些不是设定文字，是行为说明。</p>
            <div class="note">取自《符文工房2》汉化工程的游戏文本表（<b>monstername / monstercategory / monstercomment 三张表按行序配对</b>）。原表里另有两列数字，但解包工具没有标注它们的含义，本站不做推测、不展示。</div>`;
            };

            /* ---------- 边境 RFF ---------- */
            const blockF = () => {
                const rm = (typeof RFF_MON !== 'undefined') ? RFF_MON : [];
                const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                const lvs = rm.map(x => x[1]).filter(v => typeof v === 'number');
                const multi = rm.filter(x => /２回目|3回目|ED后/.test(x[0]));
                const notes = rm.filter(x => x[9]);
                return `
            <h2 class="h2">全魔物属性与掉落：${rm.length} 条，从等级 1 一路到等级 99</h2>
            <p class="p">边境这一作此前在站里<b>只有名字</b>——数值写死在程序里、汉化文本表里根本不存在。现在补齐了<b>等级、HP、攻击力、防御力、魔法力、元素属性、出没地点与掉落物</b>，默认按等级从高到低排，最上面那批是终盘才该碰的。</p>
            ${stat([['收录', rm.length + ' 条'], ['等级范围', (lvs.length ? Math.min.apply(null, lvs) + ' ～ ' + Math.max.apply(null, lvs) : '—')], ['有元素属性', rm.filter(x => x[6] !== '—').length + ' 只'], ['再战／ED 后形态', multi.length + ' 条']])}
            <h2 class="h2">先按数值排：能不能打一目了然</h2>
            <p class="p">等级与 HP 决定它在你当前练度下「能不能碰」，攻防与魔法力决定打得疼不疼。<b>名字带「２回目／3回目」的是同一只怪的再战形态</b>，等级与 HP 会跳一大截（瓦格纳 60 → 80 → 99）。</p>
            ${ftableOwn(['魔物', '等级', 'HP', '攻', '防', '魔法力', '元素属性'],
                    ['6.4rem', '2.2rem', '3rem', '2.4rem', '2.4rem', '2.6rem', '5.4rem'],
                    rm.map(x => [x[0] + ' ' + x[7] + ' ' + x[8],
                        [x[0], cell(x[1]), cell(x[2]), cell(x[3]), cell(x[4]), cell(x[5]), cell(x[6])]]),
                    { cls: 'mon-aux', ph: '输入名称/地点/掉落筛选' })}
            <div class="note">元素属性列写的是各属性的<b>抗性数值</b>：「火15水35风15地20」＝火 15／水 35／风 15／地 20，<b>数字越大越扛该属性</b>；「全属性N」表示四项统一。留「—」的是原表没记，<b>不是免疫</b>。</div>
            <h2 class="h2">出没地点与掉落：刷素材前先查这里</h2>
            <p class="p">掉落写成<b>「物品 LvN 概率」</b>，同一件材料常按 Lv 分档各占一个概率（例如冰蛇的舌头 Lv8 50%、Lv10 50%）——想要高 Lv 材料就得打对应的高等级形态。</p>
            ${ftableOwn(['魔物', '出现地点', '总掉落物'],
                    ['6.4rem', '8rem', 'auto'],
                    rm.map(x => [x[0] + ' ' + x[7] + ' ' + x[8],
                        [x[0], cell(x[7]), cell(x[8])]]),
                    { cls: 'mon-aux', ph: '按名称/地点/掉落筛选' })}
            <h2 class="h2">三只有特别备注的</h2>
            ${tbl(['魔物', '备注'], notes.map(x => [x[0], x[9]]), { leftFirst: true, cls: 'txt', colw: ['7rem', 'auto'] })}
            <div class="note">${(typeof RFF_MONNOTE !== 'undefined') ? RFF_MONNOTE : ''}</div>
            <div class="note">本节的数值、地点与掉落全部取自 biligame 符文工厂 wiki 的「RFFmonster」页；站里原有的 ${mf.length} 个汉化定稿名仍留作种类名对照。<b>有名字而没有数据时不编造数值</b>——这条规矩补齐数据后依然成立：原表留空的格子一律显示「—」。</div>`;
            };

            /* ---------- 无数据 ---------- */
            /* ---------- RF3 ---------- */
            const block3 = () => {
                const sorted = m3.slice().sort((x, y) =>
                    (y[1] == null ? -1 : (x[1] == null ? 1 : y[1] - x[1])));
                const joins = m3.filter(x => x[10]).length;
                const nojoin = m3.length - joins;
                const cell = v => (v == null || v === '') ? '—' : v;
                const rowA = x => `<tr data-s="${x[0]} ${x[7]} ${x[8]} ${x[9]} ${x[11]}">
                    <td class="td left mon-n">${x[0]}</td>
                    <td class="td">${cell(x[1])}</td><td class="td">${cell(x[2])}</td>
                    <td class="td">${cell(x[3])}</td><td class="td">${cell(x[4])}</td>
                    <td class="td">${cell(x[5])}</td><td class="td">${cell(x[6])}</td>
                </tr>`;
                const rowB = x => `<tr data-s="${x[0]} ${x[7]} ${x[9]} ${x[11]}">
                    <td class="td left mon-n">${x[0]}</td>
                    <td class="td mon-f">${cell(x[7])}</td>
                    <td class="td mon-f">${(x[8] && x[8] !== '无') ? x[8] : '—'}</td>
                    <td class="td mon-f">${cell(x[9])}</td>
                </tr>`;
                return `
            <h2 class="h2">全迷宫资料：这一作连数值都给了</h2>
            <p class="p">RF3 的怪物表是站里<b>信息最完整</b>的一张——等级、HP、物攻／物防、魔攻／魔防、属性抗性、可采集物、掉落物、出没迷宫全部列齐。默认按等级从高到低排，最上面那批是终盘才该碰的。</p>
            ${stat([['收录', m3.length + ' 种'], ['有出没地点', joins + ' 只'], ['不可加入（Boss／准 Boss）', nojoin + ' 只'], ['迷宫', ore3.length + ' 座']])}
            <h2 class="h2">先按数值排：能不能碰一目了然</h2>
            <p class="p">等级、HP 与双攻双防直接决定它在你当前等级下「能不能打」。Boss 与准 Boss 没有等级／HP（原表空格），排在最后。</p>
            ${ftableOwn(['魔物', '等级', 'HP', '物攻', '物防', '魔攻', '魔防'],
                ['5.4rem', '2rem', '2.8rem', '2.2rem', '2.2rem', '2.2rem', '2.2rem'],
                sorted.map(x => [x[0] + ' ' + x[7] + ' ' + x[9] + ' ' + x[11],
                    [x[0], cell(x[1]), cell(x[2]), cell(x[3]), cell(x[4]), cell(x[5]), cell(x[6])]]),
                { cls: 'mon-aux', ph: '输入名称/迷宫/掉落筛选' })}
            <h2 class="h2">属性抗性与掉落：打它之前先看这里</h2>
            <p class="p">抗性列写的是<b>倍率关系</b>：<b>数字 = 该属性伤害的倍数</b>（1.5 倍＝扛揍，减半＝弱点，吸收＝回血，无效＝免疫）。「后仰抵抗」不是属性，是「不会被击退／击倒」的标记。同一种族往往共享弱点——兽人系火 1.5 倍／地减半，哥布林系火减半／风 1.5 倍。</p>
            ${ftableOwn(['魔物', '抗性', '采集', '掉落'],
                ['5rem', 'auto', '5.2rem', '7rem'],
                sorted.map(x => [x[0] + ' ' + x[7] + ' ' + x[9] + ' ' + x[11],
                    [x[0], cell(x[7]), (x[8] && x[8] !== '无') ? x[8] : '—', cell(x[9])]]),
                { cls: 'mon-aux', ph: '按名称/抗性/掉落筛选' })}
            <h2 class="h2">五座迷宫各自能挖什么</h2>
            <p class="p">采矿是 RF3 装备与强化的命根子。下面是可采矿石清单——后期要白金、钻石、各色结晶，基本都卡在这几座迷宫的深层。</p>
            ${tbl(['迷宫', '可采集矿石'], ore3, { leftFirst: true, cls: 'txt', colw: ['8rem', 'auto'] })}
            <h2 class="h2">通信迷宫的 Boss／准 Boss</h2>
            <p class="p">树下的通信迷宫（DLC 向）只收录 Boss 与准 Boss 级，原表没给等级／HP，只列了抗性与掉落。它们大多<b>抗后仰</b>（不会被击退），且抗性多为「某属性吸收、其余减半」——带对属性才能破。</p>
            ${tbl(['名前', '抗性', '掉落'], boss3, { leftFirst: true, cls: 'txt', colw: ['7rem', 'auto', 'auto'] })}
            <div class="note">全部取自《符文工房3全攻略》（NW 旅团 qisiwole 整理，名词以 SOMA&游戏饭饭汉化版为准）。原表按迷宫分节，字段以制表符分隔；空格格为原表空（多为不可加入的 Boss）。抗性文字为原表直录，未做换算。</div>`;
            };

            const blockNone = () => `
            <p class="p">本站目前收录了 <b>多部作品</b>的魔物名单，${nm} 这一作还没有整理——不是因为难，而是因为手上缺这一作的怪物表：攻略本只有 RF5、海洋与边境三本，其余作品靠二手资料，逐只核对的工作还没做完。</p>
            <div class="note">与其拿别作的名单凑一页，不如空着。这是本站一贯的规矩：<b>没核实的宁可不写</b>。</div>
            <h2 class="h2">已经收录的作品</h2>
            <div class="jump">
                ${others.map(x => `<a href="#/switch/${x[0]}">
                    <div class="jp-t">${x[1]}</div>
                    <div class="jp-s">${x[2]} 种魔物，含掉落与捕捉信息</div>
                </a>`).join('')}
            </div>`;

            const rfoM = (typeof RFO_MON !== 'undefined') ? RFO_MON : [];
            const cnt = id === 'rf5' ? mon5.length
                : /^rf4/.test(id) ? new Set(m4.map(x => x[0])).size
                    : id === 'rf1' ? m1.length
                        : id === 'rf2' ? m2.length
                            : /^rf3/.test(id) ? m3.length
                                : id === 'rff' ? (rfm.length || mf.length)
                                    : id === 'rfo' ? rfoM.length
                                        : mro.length;
            const title = id === 'rf5' ? 'RF5' : (id === 'rfo' ? 'RFO'
                : (/^rf4/.test(id) ? 'RF4' : (id === 'rf1' ? 'RF1'
                    : (id === 'rf2' ? 'RF2' : (/^rf3/.test(id) ? 'RF3'
                        : (id === 'rff' ? 'RFF' : ''))))));
            const bodyText = id === 'rf5' ? block5()
                : /^rf4/.test(id) ? block4()
                    : id === 'rf1' ? block1()
                        : id === 'rf2' ? block2()
                            : /^rf3/.test(id) ? block3()
                                : id === 'rff' ? blockF()
                                    : id === 'rfo' ? blockR()
                                        : blockNone();

            return `
            <h2 class="h2">「图鉴」在符文工房里指的是伙伴名录</h2>
            <p class="p">系列里能收进牧场的魔物，才是这份表的主角——奶、蛋、毛、蜜全靠它们产出。怎么收服、怎么照料，在<a class="link" href="#/page/beast">魔物与伙伴</a>那一页；这边查具体是哪一只、它能给你什么。</p>
            ${title ? `<h2 class="h2">${title}：${cnt} 种魔物</h2>` : ''}
            ${bodyText}
            <div class="note">数据取自各作解包表与攻略本：RF5、RF4 来自数据解包汉化版，RF3 来自《符文工房3全攻略》（NW 旅团整理），RFO 的怪日表来自《符文工厂海洋（最强攻略）》，等级／HP／双攻双防／EXP／属性与状态抗性／掉落概率／农作物／生产物来自 biligame 符文工厂 wiki，RF1 的个体名单来自全资料整合的洞窟怪物表，种族与特技来自初代汉化文本表，战斗数值与全套抗性来自 biligame 符文工厂 wiki；RFF（边境）的等级／HP／双防／魔法力／元素属性／出没地点／掉落物来自 biligame 符文工厂 wiki。解包表把掉落那一列写作「喜好道具」，但内容与掉率表逐项对得上，本站按实质改称<b>掉落道具</b>。</div>
        `;
        }
    },
    {
        key: 'mine', group: 'life', title: '采矿与钓鱼', icon: 'pick',
        body: () => `
            <h2 class="h2">采矿</h2>
            <p class="p">用锤子敲矿石点获得矿石与宝石，深层会出稀有金属。挖矿消耗大量 RP，是「体力预算」最紧张的活。带上回复再进去，别空手深入。</p>
            ${tbl(['层级', '产出', '建议'], [
                ['浅层', '铜、铁、石材', '前期装备与扩建的主要来源'],
                ['中层', '银、金、宝石', '配合锻造等级提升'],
                ['深层', '稀有金属、秘银类', '需要回复道具与较好的武器'],
            ], { leftFirst: true })}
            <h2 class="h2">钓鱼</h2>
            <p class="p">钓竿在早期就能拿到，是零成本的收入与食材来源。鱼既能出货、也能做料理、还能送给喜欢鱼的居民——性价比极高。</p>
            <ul class="ul">
                <li class="li"><b>地点决定鱼种</b>：河、湖、海、地下水源各有一套鱼表。</li>
                <li class="li"><b>季节与天气</b>：部分鱼只在特定季节或雨天出现。</li>
                <li class="li"><b>竿的等级</b>：竿越好，能钓到的鱼种越多、成功率越高；RF4 起还能往竿里锻进鱼和罐头，直接改变刷出哪种鱼影的概率。</li>
                <li class="li"><b>鱼影先于咬钩</b>：水面下的影子在你下竿前就暴露了鱼的色泽、大小与抖动频率，看懂这三点基本就知道这一竿是什么——详见鱼类图鉴。</li>
            </ul>
            <div class="key">前期缺钱时的最优解通常是<b>钓鱼 + 短周期作物</b>双线并行，而不是硬冲迷宫。</div>
            <div class="jump">
                <a href="#/page/fish">
                    <div class="jp-t">鱼类图鉴</div>
                    <div class="jp-s">RF4 32 种鱼的长度、金杯线、钓点与金杯鱼影目标；RF5 42 种水产</div>
                </a>
            </div>
        `
    },
    {
        key: 'cook', group: 'life', title: '料理', icon: 'pot',
        body: (g) => {
            return `
            <h2 class="h2">为什么料理是核心系统</h2>
            <p class="p">因为它一次性解决三件事：<b>回复 RP／HP、送礼刷好感、完成委托</b>。中后期几乎所有日常都绕着料理转。</p>
            ${tbl(['作用', '说明'], [
                ['回复', '料理的回复量普遍高于原料，且能带进迷宫'],
                ['送礼', '大多数居民有喜欢的料理类型，是最稳定的好感来源'],
                ['委托', '大量委托要求「做出某道料理」，是主要收入之一'],
                ['加成', '部分料理带临时属性提升（力量、体力上限等）'],
            ], { leftFirst: true })}
            <h2 class="h2">怎么开始</h2>
            <p class="p">先买厨房，再拿基础食谱，用最便宜的材料反复做同一道菜。<b>料理等级会随制作次数提升</b>，等级高了才能做出高等级成品，高等级成品才能卖出好价。</p>
            <div class="note">食材来源三条线：自家作物、钓鱼、商店购买。前期最省事的是「买原料做差价」的食谱——不是为了赚钱，而是为了把料理等级刷上去。</div>
            ${(() => {
                    const ck = (typeof RF5_COOK !== 'undefined') ? RF5_COOK : [];
                    const md = (typeof RF5_MED !== 'undefined') ? RF5_MED : [];
                    if (!ck.length || !(g && /^rf5/.test(g.id))) return '';
                    const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                    const ORDER = ['徒手料理', '刀工料理', '平底锅料理', '搅拌机料理', '火锅料理', '烤箱料理', '蒸笼'];
                    const kinds = ORDER.filter(k => ck.some(x => x[0] === k));
                    const lvs = ck.map(x => x[2]).filter(v => typeof v === 'number');
                    const uniq = new Set(ck.map(x => x[1]));
                    const kindRows = kinds.map(k => {
                        const sub = ck.filter(x => x[0] === k);
                        const ls = sub.map(x => x[2]).filter(v => typeof v === 'number');
                        const easy = sub.slice().sort((a, b) => (a[2] || 0) - (b[2] || 0))[0];
                        return [k, sub.length + ' 条', 'Lv' + Math.min.apply(null, ls) + '–' + Math.max.apply(null, ls),
                            easy[1] + '（Lv' + easy[2] + '）'];
                    });
                    const rowC = x => [x[1] + ' ' + x[0] + ' ' + x[3].join(' ') + ' ' + (x[4] || ''),
                        [x[1], x[0], 'Lv' + cell(x[2]), x[3].join('、') || '—', cell(x[4])]];
                    const rowM = x => [x[1] + ' ' + x[0] + ' ' + x[3].join(' ') + ' ' + (x[4] || ''),
                        [x[1], x[0], 'Lv' + cell(x[2]), x[3].join('、') || '—', cell(x[4])]];
                    return `
            <h2 class="h2">RF5：${uniq.size} 道菜、${ck.length} 条配方</h2>
            <p class="p">下面这张表把<b>每一道菜怎么做、要多少料理等级、吃了有什么用</b>一次列全。「技能要求」是做出来所需的料理等级，<b>达不到等级就做不出</b>；同一道菜出现多行，是因为它在更高等级下可以换用更高级的材料（成品特效一样，但更省事）。</p>
            ${stat([['料理', uniq.size + ' 道 / ' + ck.length + ' 条配方'], ['厨具', kinds.length + ' 种'], ['技能范围', 'Lv' + Math.min.apply(null, lvs) + ' – Lv' + Math.max.apply(null, lvs)], ['药品配方', md.length + ' 条']])}
            <h2 class="h2">七口锅各做各的：先看分类</h2>
            <p class="p">RF5 的料理按<b>厨具</b>分成七类，得先有对应厨具才能做那一类。<b>平底锅是最大一类（${ck.filter(x => x[0] === '平底锅料理').length} 条）</b>，蒸笼最少；入门从每类的最低 Lv 那道开始练最划算。</p>
            ${tbl(['厨具', '配方数', '技能范围', '入门一道'], kindRows, { leftFirst: true, cls: 'txt', colw: ['5rem', '3rem', '4rem', 'auto'] })}
            <h2 class="h2">料理配方总表（可搜索）</h2>
            <p class="p">按厨具分类、技能等级排序。想找某道菜直接搜菜名；<b>想找某样食材能做啥就搜材料名</b>（例如搜「米饭」能列出所有用米饭的菜）。</p>
            ${ftableOwn(['料理', '厨具', '技能', '材料', '特效'],
                    ['5.4rem', '3.4rem', '2.4rem', '7rem', 'auto'],
                    ck.map(rowC), { cls: 'mon-aux', ph: '搜菜名、厨具或食材' })}
            <h2 class="h2">药品与农药：${md.length} 条配方</h2>
            <p class="p">药品归药学等级管，和料理是两条独立的练级线。<b>农药</b>那类是洒在田里改作物属性的，不属于回复药。</p>
            ${ftableOwn(['药品', '类别', '技能', '材料', '特效'],
                    ['5.4rem', '2.6rem', '2.4rem', '6.4rem', 'auto'],
                    md.map(rowM), { cls: 'mon-aux', ph: '搜药名或材料' })}
            <div class="note">${(typeof RF5_COOKNOTE !== 'undefined') ? RF5_COOKNOTE : ''}</div>`;
                })()}
            ${(() => {
                    const ck = (typeof RF4_COOK !== 'undefined') ? RF4_COOK : [];
                    const md = (typeof RF4_MED !== 'undefined') ? RF4_MED : [];
                    if (!ck.length || !(g && /^rf4/.test(g.id))) return '';
                    const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                    const ORDER = ['徒手', '刀工', '平底锅', '搅拌机', '锅', '烤箱', '蒸笼'];
                    const kinds = ORDER.filter(k => ck.some(x => x[0] === k));
                    const lvs = ck.map(x => x[2]).filter(v => typeof v === 'number');
                    const uniq = new Set(ck.map(x => x[1]));
                    const kindRows = kinds.map(k => {
                        const sub = ck.filter(x => x[0] === k);
                        const ls = sub.map(x => x[2]).filter(v => typeof v === 'number');
                        const easy = sub.slice().sort((a, b) => (a[2] || 0) - (b[2] || 0))[0];
                        return [k, sub.length + ' 条', 'Lv' + Math.min.apply(null, ls) + '–' + Math.max.apply(null, ls),
                            easy[1] + '（Lv' + easy[2] + '）'];
                    });
                    const rowC = x => [x[1] + ' ' + x[0] + ' ' + x[3].join(' '),
                        [x[1], x[0], 'Lv' + cell(x[2]), x[3].join('、') || '—', cell(x[4])]];
                    const rowE = x => [x[1] + ' ' + (x[11] || ''),
                        [x[1], cell(x[5]), cell(x[6]), cell(x[8]), cell(x[9]), cell(x[10]), cell(x[11])]];
                    const rowM = x => [x[1] + ' ' + x[0] + ' ' + x[3].join(' ') + ' ' + (x[4] || ''),
                        [x[1], x[0], 'Lv' + cell(x[2]), x[3].join('、') || '—', cell(x[4]), cell(x[5])]];
                    return `
            <h2 class="h2">RF4：${uniq.size} 道菜、${ck.length} 条配方</h2>
            <p class="p">下面按<b>配方表</b>与<b>效果表</b>两张分开列：前者回答「怎么做」，后者回答「吃了有什么用」。配方等级是做出这道菜所需的料理等级，<b>达不到就做不出</b>。</p>
            ${stat([['料理', uniq.size + ' 道 / ' + ck.length + ' 条配方'], ['厨具', kinds.length + ' 种'], ['技能范围', 'Lv' + Math.min.apply(null, lvs) + ' – Lv' + Math.max.apply(null, lvs)], ['药学配方', md.length + ' 条']])}
            <h2 class="h2">七类厨具：先看分类</h2>
            <p class="p">RF4 的料理同样按厨具分七类，先有对应厨具才能做那一类。<b>平底锅最大（${ck.filter(x => x[0] === '平底锅').length} 条），蒸笼最少</b>。想练料理等级，从每类最低 Lv 那道反复做最划算。</p>
            ${tbl(['厨具', '配方数', '技能范围', '入门一道'], kindRows, { leftFirst: true, cls: 'txt', colw: ['4.4rem', '3rem', '4rem', 'auto'] })}
            <h2 class="h2">配方表：怎么做（可搜索）</h2>
            <p class="p">按厨具、配方等级排序。搜菜名找做法，<b>搜食材名反查能做什么菜</b>。卖价是基础售价，成品等级越高卖得越贵。</p>
            ${ftableOwn(['料理', '厨具', '配方等级', '材料', '卖价'],
                    ['5.4rem', '3rem', '3rem', 'auto', '3rem'],
                    ck.map(rowC), { cls: 'mon-aux', ph: '搜菜名、厨具或食材' })}
            <h2 class="h2">效果表：吃了有什么用</h2>
            <p class="p">「+220」即回复 220 点；<b>带百分比的（如「+5000，11%」）＝固定值 + 最大值的百分比</b>一并回复。力量／智力／体力同理，「+60，3%」是固定 60 点再加 3% 上限，<b>持续 12 小时</b>。这一列决定了「带哪道菜进迷宫」。</p>
            ${ftableOwn(['料理', 'HP', 'RP', '力量', '智力', '体力', '其它特效'],
                    ['5.4rem', '3.4rem', '3rem', '2.6rem', '2.6rem', '2.6rem', 'auto'],
                    ck.map(rowE), { cls: 'mon-aux', ph: '搜菜名或特效' })}
            <h2 class="h2">药学：${md.length} 条配方</h2>
            <p class="p">药学是<b>独立于料理的第二条练级线</b>，管药品与调味料；<b>农药</b>那类洒在田里改作物属性（抗灾、成长速度、品质），不属于回复药。</p>
            ${ftableOwn(['名称', '类别', '制造等级', '材料', '效果', '持续'],
                    ['5rem', '2.6rem', '3rem', '6.4rem', 'auto', '2.2rem'],
                    md.map(rowM), { cls: 'mon-aux', ph: '搜药名或材料' })}
            <div class="note">${(typeof RF4_COOKNOTE !== 'undefined') ? RF4_COOKNOTE : ''}</div>`;
                })()}
            ${(() => {
                    const ck = (typeof RFF_COOK !== 'undefined') ? RFF_COOK : [];
                    if (!ck.length || !(g && g.id === 'rff')) return '';
                    const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                    const ORDER = ['料理台', '平底锅', '锅子', '烤箱', '搅拌机', '蒸笼', '药学'];
                    const kinds = ORDER.filter(k => ck.some(x => x[0] === k));
                    const dish = ck.filter(x => x[0] !== '药学');
                    const med = ck.filter(x => x[0] === '药学');
                    const lvs = ck.map(x => x[2]).filter(v => typeof v === 'number');
                    const uniq = new Set(ck.map(x => x[1]));
                    const books = new Set(ck.map(x => x[5]).filter(Boolean));
                    const kindRows = kinds.map(k => {
                        const sub = ck.filter(x => x[0] === k);
                        const ls = sub.map(x => x[2]).filter(v => typeof v === 'number');
                        const hasLv = sub.filter(x => x[2] != null);
                        const easy = (hasLv.length ? hasLv : sub).slice().sort((a, b) => (a[2] || 0) - (b[2] || 0))[0];
                        return [k, sub.length + ' 条', 'Lv' + Math.min.apply(null, ls) + '–' + Math.max.apply(null, ls),
                            easy[2] == null ? easy[1] : easy[1] + '（Lv' + easy[2] + '）'];
                    });
                    const rowC = x => [x[1] + ' ' + x[0] + ' ' + x[3].join(' '),
                        [x[1], x[0], x[2] == null ? '—' : 'Lv' + x[2], x[3].join('、') || '—', cell(x[7])]];
                    const rowE = x => [x[1] + ' ' + (x[4] || ''), [x[1], cell(x[4])]];
                    const rowB = x => [x[1] + ' ' + (x[5] || '') + ' ' + (x[8] || ''),
                        [x[1], cell(x[5]), cell(x[6]), cell(x[7]), cell(x[8])]];
                    return `
            <h2 class="h2">边境：${uniq.size} 道配方、${ck.length} 条</h2>
            <p class="p">边境这一作的配方表给得比别作多两样东西：<b>配方书</b>与<b>入手地点</b>。也就是说它不只告诉你「怎么做」，还告诉你<b>这本书去哪儿买、多少钱</b>——不买书，配方根本不会出现。</p>
            ${stat([['配方', uniq.size + ' 种 / ' + ck.length + ' 条'], ['料理 / 药学', dish.length + ' / ' + med.length], ['厨具', (kinds.length - 1) + ' 类'], ['配方书', books.size + ' 本']])}
            <h2 class="h2">六类厨具 + 药学</h2>
            <p class="p">料理按厨具分六类，<b>「料理台」是边境独有的一类</b>（不用开火、直接组合），平底锅最多。<b>药学单独算一类</b>，管药品与作物营养剂。</p>
            ${tbl(['分类', '配方数', '等级范围', '入门一道'], kindRows, { leftFirst: true, cls: 'txt', colw: ['4.4rem', '3rem', '4rem', 'auto'] })}
            <h2 class="h2">配方表：怎么做（可搜索）</h2>
            <p class="p">按分类与配方等级排序。搜菜名找做法，<b>搜食材名反查能做什么菜</b>。卖价是成品基础售价。</p>
            ${ftableOwn(['名称', '分类', '配方等级', '材料', '卖价'],
                    ['5.4rem', '3rem', '3.2rem', 'auto', '3rem'],
                    ck.map(rowC), { cls: 'mon-aux', ph: '搜菜名、厨具或食材' })}
            <h2 class="h2">效果表：吃了有什么用</h2>
            <p class="p">边境的效果是<b>一整串写在一起</b>的（HP／RP 回复、最大 HP、攻防、异常率一并列），所以不做成分列的数值表、按原表直录。想找「加防御」「带眩晕」这类效果的菜，直接搜关键词。</p>
            ${ftableOwn(['名称', '全效果'], ['5.4rem', 'auto'],
                    ck.map(rowE), { cls: 'mon-aux', ph: '搜菜名或效果关键词' })}
            <h2 class="h2">配方书与入手地点：${books.size} 本</h2>
            <p class="p">这是本作最实用的一张表——<b>先买书，配方才会出现在料理台／药学台上</b>。买价是书的售价，「入手」写去哪儿买（酒馆、教会医务室、杂货店等）。</p>
            ${ftableOwn(['名称', '配方书', '买价', '卖价', '入手'],
                    ['5.4rem', '7rem', '2.8rem', '2.8rem', 'auto'],
                    ck.map(rowB), { cls: 'mon-aux', ph: '搜书名或入手地点' })}
            <div class="note">${(typeof RFF_COOKNOTE !== 'undefined') ? RFF_COOKNOTE : ''}</div>
            <div class="note">表里另有一条<b>「失败之作」</b>——做失败时出的东西，卖价 30，没有配方等级也没有材料栏。原表保留它，本站照录不删。</div>`;
                })()}
            ${(() => {
                    const ck = (typeof RFO_COOK !== 'undefined') ? RFO_COOK : [];
                    const md = (typeof RFO_MED !== 'undefined') ? RFO_MED : [];
                    const bk = (typeof RFO_BOOK !== 'undefined') ? RFO_BOOK : [];
                    if (!ck.length || !(g && g.id === 'rfo')) return '';
                    const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                    const ORDER = ['厨房', '平底锅', '锅子', '烤箱', '蒸笼', '搅拌机'];
                    const kinds = ORDER.filter(k => ck.some(x => x[0] === k));
                    const drug = md.filter(x => x[0] === '药品');
                    const perm = md.filter(x => x[0] === '永久强化');
                    const lvs = ck.map(x => x[2]).filter(v => typeof v === 'number');
                    const uniq = new Set(ck.map(x => x[1]));
                    const buyable = ck.filter(x => x[10]);
                    const kindRows = kinds.map(k => {
                        const sub = ck.filter(x => x[0] === k);
                        const ls = sub.map(x => x[2]).filter(v => typeof v === 'number');
                        const easy = sub.slice().sort((a, b) => (a[2] || 0) - (b[2] || 0))[0];
                        return [k, sub.length + ' 条', 'Lv' + Math.min.apply(null, ls) + '–' + Math.max.apply(null, ls),
                            easy[1] + '（Lv' + easy[2] + '）'];
                    });
                    const effRFO = x => {
                        const p = [];
                        if (x[6] != null && x[6] !== '' && x[6] !== '—') p.push('HP' + x[6]);
                        if (x[7] != null && x[7] !== '' && x[7] !== '—') p.push('RP' + x[7]);
                        if (x[8] != null && x[8] !== '' && x[8] !== '—') p.push(x[8]);
                        if (x[5] != null && x[5] !== '' && x[5] !== '—') p.push(x[5] + '分');
                        return p.length ? p.join(' ') : '—';
                    };
                    const rowC = x => [x[1] + ' ' + x[0] + ' ' + x[4].join(' ') + ' ' + (x[3] || '') + ' ' + effRFO(x),
                        [x[1], x[0], x[2] == null ? '—' : 'Lv' + x[2], x[4].join('、') || '—', cell(x[11]), effRFO(x)]];
                    const rowE = x => [x[1] + ' ' + (x[8] || ''),
                        [x[1], x[5] == null ? '—' : x[5] + ' 分', cell(x[6]), cell(x[7]), cell(x[8])]];
                    const rowB = x => [x[0] + ' ' + x[1], [x[0], x[1], x[2] + ' 条', x[3]]];
                    const rowM = x => [x[1] + ' ' + x[0] + ' ' + x[4].join(' ') + ' ' + (x[8] || ''),
                        [x[0], x[1], x[2] == null ? '—' : 'Lv' + x[2], x[4].join('、') || '—',
                            cell(x[6]), cell(x[7]), cell(x[8]), cell(x[10]), cell(x[11])]];
                    const rowP = x => [x[1] + ' ' + (x[8] || '') + ' ' + (x[11] || ''),
                        [x[1], cell(x[8]), cell(x[10]), cell(x[11])]];
                    return `
            <h2 class="h2">海洋：${uniq.size} 道配方</h2>
            <p class="p">海洋把料理切成<b>六类厨具</b>，其中「<b>厨房</b>」一类是这作才有的叫法——指<b>不用开火、直接组合</b>的菜（生鱼片、寿司、饭团），对应别作的「料理台」。这一作鱼获极多，厨房类 40 道里绝大多数是鱼。</p>
            ${stat([['料理配方', uniq.size + ' 种'], ['厨具', kinds.length + ' 类'], ['料理等级', 'Lv' + Math.min.apply(null, lvs) + '–' + Math.max.apply(null, lvs)], ['配方书', bk.length + ' 本'], ['药学 / 永久强化', drug.length + ' / ' + perm.length]])}
            <h2 class="h2">六类厨具</h2>
            <p class="p">平底锅最多（47 道），蒸笼最少（13 道）。<b>入门一道</b>是该分类里料理等级最低的那道，从它开始练最省事。</p>
            ${tbl(['分类', '配方数', '等级范围', '入门一道'], kindRows, { leftFirst: true, cls: 'txt', colw: ['4.4rem', '3rem', '4rem', 'auto'] })}
            <h2 class="h2">配方表：怎么做（可搜索）</h2>
            <p class="p">按厨具与料理等级排序。搜菜名找做法，<b>搜食材名反查能做什么菜</b>，<b>搜「火抗性」「麻痹」等效果关键词</b>反查带该效果的菜——比如搜「闪光鲷鱼」能列出所有用它的料理。</p>
            ${ftableOwn(['名称', '厨具', '料理等级', '材料', '卖价', '属性效果'],
                    ['6rem', '3.2rem', '3.4rem', 'auto', '3rem', 'auto'],
                    ck.map(rowC), { cls: 'mon-aux', ph: '搜菜名、厨具、食材或效果' })}
            <h2 class="h2">效果表：吃了有什么用（可搜索）</h2>
            <p class="p">海洋的料理除了回 HP／RP，几乎都带一条<b>属性抗性或属性攻防加成</b>。「麻痹抗性+100%」＝进食后在持续时间内完全免疫麻痹。想找「免疫封印」「加暗属性防御」这类效果的菜，直接搜关键词。</p>
            ${ftableOwn(['名称', '持续时间', 'HP', 'RP', '特殊效果'],
                    ['6rem', '3.4rem', '2.6rem', '2.6rem', 'auto'],
                    ck.map(rowE), { cls: 'mon-aux', ph: '搜菜名或效果关键词' })}
            <h2 class="h2">配方书：${bk.length} 本</h2>
            <p class="p">海洋和边境一样，<b>不先买到配方书，配方就不会出现在料理列表里</b>。书按初级／中级／上级分档，每类厨具另有一本「奥义」收录 Lv95 以上的顶尖菜式。</p>
            ${ftableOwn(['配方书', '对应厨具', '涵盖配方', '等级范围'],
                    ['7rem', '3.4rem', '3.4rem', 'auto'],
                    bk.map(rowB), { cls: 'mon-aux', ph: '搜书名或厨具' })}
            <h2 class="h2">药学与永久强化：${md.length} 条</h2>
            <p class="p">可调制的药只有 7 种，且<b>层层递进</b>——恢复壶要用解毒药＋解麻药做，恢复壶S 要两个恢复壶，恢复壶X 要两个恢复壶S 加白草。另一类是 9 种<b>永久强化道具</b>，做不出来，只能靠开宝箱、砸陶壶、鉴定不明物品和竞技场奖励拿到。</p>
            ${ftableOwn(['类别', '名称', '药学技能', '材料', 'HP', 'RP', '效果', '卖价', '入手'],
                    ['3.4rem', '5rem', '3.2rem', 'auto', '2.4rem', '2.4rem', '6rem', '2.6rem', '5rem'],
                    drug.map(rowM), { cls: 'mon-aux', ph: '搜药名或材料' })}
            <h3 class="h3">永久强化道具：9 件（无法制作）</h3>
            <p class="p">这 9 件的效果<b>永久保留</b>，是全周目里最值得优先跑图收集的东西。元素类各加对应属性的攻防各 1 点，力量／体力／智力补品各加 1 点。</p>
            ${ftableOwn(['名称', '永久效果', '卖价', '入手'],
                    ['5rem', 'auto', '2.8rem', 'auto'],
                    perm.map(rowP), { cls: 'mon-aux', ph: '搜道具名或地点' })}
            <div class="note">${(typeof RFO_COOKNOTE !== 'undefined') ? RFO_COOKNOTE : ''}</div>
            <div class="note">另有 <b>${buyable.length}</b> 道菜（生鱼片、饭团、果汁、甜点等）可以不去自己做，直接在<b>三姐妹旅馆</b>买到成品——表里「入手」列标了「三姐妹旅馆」的就是。</div>`;
                })()}
            ${(() => {
                    const ck = (typeof RF1_COOK !== 'undefined') ? RF1_COOK : [];
                    const md = (typeof RF1_MED !== 'undefined') ? RF1_MED : [];
                    const bk = (typeof RF1_BOOK !== 'undefined') ? RF1_BOOK : [];
                    if (!ck.length || !(g && g.id === 'rf1')) return '';
                    const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                    const num = v => (v == null || v === '' || v === '—') ? '—' : v;
                    const ORDER = ['空手', '菜刀套装', '平底锅', '搅拌机', '烤箱', '锅子', '蒸笼', '其它'];
                    const kinds = ORDER.filter(k => ck.some(x => x[0] === k));
                    const dish = ck.filter(x => x[0] !== '其它');
                    const etc = ck.filter(x => x[0] === '其它');
                    const mats = new Set();
                    [...ck, ...md].forEach(x => x[4].forEach(m => mats.add(m)));
                    const lvs = ck.map(x => x[3]).filter(v => typeof v === 'number');
                    const kindRows = kinds.map(k => {
                        const sub = ck.filter(x => x[0] === k);
                        const ls = sub.map(x => x[3]).filter(v => typeof v === 'number');
                        const hasLv = sub.filter(x => x[3] != null);
                        const easy = (hasLv.length ? hasLv : sub).slice().sort((a, b) => (a[3] || 0) - (b[3] || 0))[0];
                        return [k, sub.length + ' 条', ls.length ? ('Lv' + Math.min.apply(null, ls) + '–' + Math.max.apply(null, ls)) : '—',
                            easy[3] == null ? easy[1] : easy[1] + '（Lv' + easy[3] + '）'];
                    });
                    const eff1 = x => {
                        const p = [];
                        if (x[8] != null && x[8] !== '' && x[8] !== '—') p.push('HP' + x[8]);
                        if (x[9] != null && x[9] !== '' && x[9] !== '—') p.push('RP' + x[9]);
                        if (x[10] != null && x[10] !== '' && x[10] !== '—') p.push('MHP' + x[10]);
                        if (x[16] != null && x[16] !== '' && x[16] !== '—') p.push('属性攻' + x[16]);
                        if (x[17] != null && x[17] !== '' && x[17] !== '—') p.push('属性防' + x[17]);
                        [['中毒',18],['封印',19],['麻痹',20],['吹飞',21],['倒地',22]].forEach(([k,i])=>{ const v=x[i]; if(v!=null&&v!==''&&v!=='—'&&v!==0&&v!=='0') p.push(k+(v>0?'+':'')+v); });
                        if (x[11] != null && x[11] !== '' && x[11] !== '—') p.push(x[11]);
                        if (x[23] != null && x[23] !== '' && x[23] !== '—') p.push(x[23] + '秒');
                        return p.length ? p.join(' ') : '—';
                    };
                    const rowC = x => [x[1] + ' ' + x[0] + ' ' + x[4].join(' ') + ' ' + (x[2] || '') + ' ' + (x[7] || '') + ' ' + eff1(x),
                        [x[1], x[0], cell(x[2]), x[3] == null ? '—' : 'Lv' + x[3], x[4].join('、') || '—', num(x[5]), num(x[6]), cell(x[7]), eff1(x)]];
                    const rowE = x => [x[1] + ' ' + (x[11] || ''),
                        [x[1], num(x[8]), num(x[9]), num(x[10]), cell(x[11]), num(x[12]), num(x[13]), num(x[14]), num(x[15]),
                            x[23] == null ? '—' : x[23] + ' 秒']];
                    const rowR = x => [x[1] + ' ' + (x[16] || '') + ' ' + (x[17] || ''),
                        [x[1], cell(x[16]), cell(x[17]), num(x[18]), num(x[19]), num(x[20]), num(x[21]), num(x[22])]];
                    const rowB = x => [x[0] + ' ' + x[1], [x[0], x[1], x[2] + ' 条', x[3]]];
                    const rowM = x => [x[1] + ' ' + x[4].join(' ') + ' ' + (x[11] || '') + ' ' + (x[7] || ''),
                        [x[1], x[3] == null ? '—' : 'Lv' + x[3], x[4].join('、') || '—', cell(x[11]),
                            num(x[12]), num(x[13]), num(x[14]), num(x[15]), cell(x[16]), num(x[6]), cell(x[7])]];
                    return `
            <h2 class="h2">符文1：${ck.length} 条料理 + ${md.length} 条药学</h2>
            <p class="p">初代的料理表是<b>全站字段最细的一档</b>：不只给 HP／RP 回复，还分列 STR／INT／DEX／VIT 四维加成、属性攻防（如「火+30」）、五种状态抗性（中毒／封印／麻痹／吹飞／倒地）与持续时间。想算准「进迷宫前吃哪道菜」，这一作的数据够你算到底。</p>
            ${stat([['料理 / 药学', ck.length + ' / ' + md.length], ['厨具', (kinds.length - 1) + ' 类 + 其它'], ['配方等级', 'Lv' + Math.min.apply(null, lvs) + '–' + Math.max.apply(null, lvs)], ['配方书', bk.length + ' 本'], ['素材种类', mats.size + ' 种']])}
            <h2 class="h2">七类厨具 + 「其它」</h2>
            <p class="p">平底锅 51 条最多，空手 12 条最少。末尾的<b>「其它」25 条没有配方</b>——它们是直接买来或打怪掉落的成品（米饭、巧克力、红酒、各尺寸的奶蛋奶酪等），页面里单列一类，别当成厨具。</p>
            ${tbl(['分类', '条数', '等级范围', '入门一道'], kindRows, { leftFirst: true, cls: 'txt', colw: ['4.6rem', '2.8rem', '4rem', 'auto'] })}
            <h2 class="h2">配方表：怎么做（可搜索）</h2>
            <p class="p">按厨具与配方等级排序。搜菜名找做法，<b>搜食材名反查能做什么菜</b>；「入手」列写着这道菜能直接在哪家店买到。最右「属性效果」列是这一作效果的<b>一句话摘要</b>（HP／RP／属性攻防／状态抗性／持续时间），要算细分项看下面两张专表。</p>
            ${ftableOwn(['名称', '分类', '配方书', '等级', '材料', '买价', '卖价', '入手', '属性效果'],
                    ['5.4rem', '3.4rem', '5.2rem', '2.6rem', 'auto', '2.4rem', '2.4rem', '5rem', 'auto'],
                    ck.map(rowC), { cls: 'mon-aux', ph: '搜菜名、厨具、食材或效果' })}
            <h2 class="h2">效果表一：回复与四维（可搜索）</h2>
            <p class="p">HP／RP／最大 HP 是回复量，STR／INT／DEX／VIT 是加成，「效果」列是额外的文字说明（如「命中率-20%」「解全部4个异常状态」）。<b>负数不是错误</b>——「失败之作」就是四维各 −5、RP −20。</p>
            ${ftableOwn(['名称', 'HP', 'RP', '最大HP', '效果', 'STR', 'INT', 'DEX', 'VIT', '持续时间'],
                    ['5.4rem', '2.4rem', '2.4rem', '2.8rem', 'auto', '2.2rem', '2.2rem', '2.2rem', '2.2rem', '3.2rem'],
                    ck.map(rowE), { cls: 'mon-aux', ph: '搜菜名或效果' })}
            <h2 class="h2">效果表二：属性与状态抗性（可搜索）</h2>
            <p class="p">「属性攻击／属性防御」写成「火+30」「火水地风-5」这类形式——元素是火／水／地／风，数值是加减值。右边五列是五种异常状态的抗性加减，<b>＋100 不等于免疫，但加到足够高就不会中招</b>。</p>
            ${ftableOwn(['名称', '属性攻击', '属性防御', '中毒', '封印', '麻痹', '吹飞', '倒地'],
                    ['5.4rem', '4.2rem', '4.6rem', '2.2rem', '2.2rem', '2.2rem', '2.2rem', '2.2rem'],
                    ck.map(rowR), { cls: 'mon-aux', ph: '搜菜名或属性' })}
            <h2 class="h2">配方书：${bk.length} 本</h2>
            <p class="p">初代的书比后来少，一本就覆盖一整类厨具：平底锅两类书（明日之菜 1、2 卷）加起来 51 条，菜刀套装的「职人道！初级／上级篇」各 13／12 条。药学只有一本《调合白皮书》，24 条全在里面。</p>
            ${ftableOwn(['配方书', '对应厨具', '涵盖配方', '等级范围'],
                    ['7.4rem', '3.6rem', '3.4rem', 'auto'],
                    bk.map(rowB), { cls: 'mon-aux', ph: '搜书名或厨具' })}
            <h2 class="h2">药学：${md.length} 条（可搜索）</h2>
            <p class="p">药学这边不是只有回血——<b>营养剂α／β／γ</b>是让作物提早成熟的东西，<b>蛋・白・质、智力补品、敏捷瓶</b>这类是永久强化。它们的材料多半要从特定魔物身上刷（表里「入手」列写了掉哪种怪）。</p>
            ${ftableOwn(['名称', '药学等级', '材料', '效果', 'STR', 'INT', 'DEX', 'VIT', '属性攻击', '卖价', '入手'],
                    ['5rem', '3.2rem', 'auto', '5.4rem', '2.2rem', '2.2rem', '2.2rem', '2.2rem', '4rem', '2.4rem', '5rem'],
                    md.map(rowM), { cls: 'mon-aux', ph: '搜药名、材料或掉落怪' })}
            <div class="note">${(typeof RF1_COOKNOTE !== 'undefined') ? RF1_COOKNOTE : ''}</div>
            <div class="note">「其它」类的 ${etc.length} 条（失败之作、米饭、巧克力、红酒、艾丽草与各尺寸的鸡蛋／牛奶／奶酪／酸奶／蛋黄酱）是<b>没有配方的成品</b>，只能买或掉落——别在料理台上找它们。</div>`;
                })()}
            ${(() => {
                    const ck = (typeof RF2_COOK !== 'undefined') ? RF2_COOK : [];
                    const md = (typeof RF2_MED !== 'undefined') ? RF2_MED : [];
                    const bk = (typeof RF2_BOOK !== 'undefined') ? RF2_BOOK : [];
                    if (!ck.length || !(g && g.id === 'rf2')) return '';
                    const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
                    const ORDER = ['徒手', '菜刀', '平底锅', '锅子', '搅拌器', '蒸笼', '其它'];
                    const kinds = ORDER.filter(k => ck.some(x => x[0] === k));
                    const dish = ck.filter(x => x[0] !== '其它');
                    const etc = ck.filter(x => x[0] === '其它');
                    const mats = new Set();
                    [...ck, ...md].forEach(x => x[3].forEach(m => mats.add(m)));
                    const lvs = ck.map(x => x[2]).filter(v => typeof v === 'number');
                    const kindRows = kinds.map(k => {
                        const sub = ck.filter(x => x[0] === k);
                        const ls = sub.map(x => x[2]).filter(v => typeof v === 'number');
                        const hasLv = sub.filter(x => x[2] != null);
                        const easy = (hasLv.length ? hasLv : sub).slice().sort((a, b) => (a[2] || 0) - (b[2] || 0))[0];
                        return [k, sub.length + ' 条', ls.length ? ('Lv' + Math.min.apply(null, ls) + '–' + Math.max.apply(null, ls)) : '—',
                            easy[2] == null ? easy[1] : easy[1] + '（Lv' + easy[2] + '）'];
                    });
                    const rowC = x => [x[1] + ' ' + x[0] + ' ' + x[3].join(' ') + ' ' + (x[4] || '') + ' ' + (x[5] || '') + ' ' + (x[9] || ''),
                        [x[1], x[0], x[2] == null ? '—' : 'Lv' + x[2], x[3].join('、') || '—', cell(x[4]), cell(x[5]), cell(x[9])]];
                    const rowE = x => [x[1] + ' ' + (x[5] || '') + ' ' + (x[4] || ''),
                        [x[1], cell(x[4]), cell(x[5])]];
                    const rowB = x => [x[0] + ' ' + x[1], [x[0], x[1], x[2] + ' 条', x[3]]];
                    const rowM = x => [x[1] + ' ' + x[3].join(' ') + ' ' + (x[5] || '') + ' ' + (x[9] || ''),
                        [x[1], x[2] == null ? '—' : 'Lv' + x[2], x[3].join('、') || '—', cell(x[5]),
                            cell(x[6]), cell(x[7]), cell(x[8]), cell(x[9])]];
                    const noTrade = md.filter(x => x[7] === '无法交易').length;
                    return `
            <h2 class="h2">符文2：${ck.length} 条料理 + ${md.length} 条药学</h2>
            <p class="p">这一作最不一样的地方是：<b>配方不是买书，是在阿尔瓦纳学园上课学会的</b>——「配方课程」列就是课程名。没上过那堂课，材料齐了也做不出来。另外几条高阶药学配方更特殊，要在遗迹里<b>参拜石像</b>才学得到。</p>
            ${stat([['料理 / 药学', ck.length + ' / ' + md.length], ['厨具', (kinds.length - 1) + ' 类 + 其它'], ['配方等级', 'Lv' + Math.min.apply(null, lvs) + '–' + Math.max.apply(null, lvs)], ['配方课程', bk.length + ' 门'], ['素材种类', mats.size + ' 种']])}
            <h2 class="h2">六类厨具 + 「其它」</h2>
            <p class="p">平底锅 51 条最多（光烤鱼就有 20 多种），蒸笼 11 条最少。<b>烤箱菜没有单列</b>：披萨、多利亚饭、奶油烤菜、蛋糕、曲奇饼干、苹果派、吐司这些，原表并进了「锅子」节（46 条）。末尾的<b>「其它」24 条没有配方</b>，是店里直接买的成品。</p>
            ${tbl(['分类', '条数', '等级范围', '入门一道'], kindRows, { leftFirst: true, cls: 'txt', colw: ['4.6rem', '2.8rem', '4rem', 'auto'] })}
            <h2 class="h2">配方表：怎么做（可搜索）</h2>
            <p class="p">按厨具与配方等级排序。搜菜名找做法，<b>搜食材名反查能做什么菜</b>；「所学课程」列告诉你要先上哪门课，「属性效果」列是这道菜食用后的总效果（HP／RP／上限／四维／解异常／持续时间都在里面），「其它来源」列写着任务奖励等特殊拿法。</p>
            ${ftableOwn(['名称', '厨具', '等级', '材料', '所学课程', '属性效果', '其它来源'],
                    ['5.4rem', '3.2rem', '2.6rem', 'auto', '6.2rem', 'auto', '6rem'],
                    ck.map(rowC), { cls: 'mon-aux', ph: '搜菜名、厨具、食材或效果' })}
            <h2 class="h2">效果表（可搜索）</h2>
            <p class="p">这一作的效果<b>一整串写在一起</b>（HP／RP 回复、HP 上限、力量／智力／体力、解除异常、持续时间），按原表直录，<b>搜关键词最好用</b>——比如搜「中毒抗性」就列出所有带抗性的药。</p>
            ${ftableOwn(['名称', '所学课程', '使用总效果'],
                    ['5.4rem', '7rem', 'auto'],
                    ck.map(rowE), { cls: 'mon-aux', ph: '搜菜名或效果关键词' })}
            <h2 class="h2">配方课程：${bk.length} 门</h2>
            <p class="p">课程按厨具分：平底锅的课程最多（${bk.filter(x => x[1] === '平底锅').length} 门），菜刀 5 门、锅子 4 门、搅拌器 3 门。药学末尾几行写的是<b>石像名而非课程</b>（斜光照射的腐朽神社石像、绵延至社石桥石像、过去纺织社迹石像）——那几条要参拜石像才学得到。</p>
            ${ftableOwn(['课程 / 习得来源', '对应类别', '涵盖配方', '等级范围'],
                    ['8.6rem', '3.4rem', '3.4rem', 'auto'],
                    bk.map(rowB), { cls: 'mon-aux', ph: '搜课程名或石像名' })}
            <h2 class="h2">药学：${md.length} 条（可搜索）</h2>
            <p class="p">药学这边同样不是只有回血：<b>营养剂α／β／γ</b>让作物提早 1／2／3 天成熟，<b>速速绿</b>直接给作物 +1 级，<b>蛋・白・质／智力补品／生命果冻</b>是永久强化四维，<b>符文药水</b>甚至能<b>提升角色等级 +1</b>。标「无法交易」的 ${noTrade} 件（三档恢复壶）只能自己做。</p>
            ${ftableOwn(['名称', '药学等级', '材料', '效果', '店铺', '卖价', '买价', '其它来源'],
                    ['5rem', '3.2rem', 'auto', 'auto', '2.8rem', '2.6rem', '2.6rem', '6rem'],
                    md.map(rowM), { cls: 'mon-aux', ph: '搜药名、材料或效果' })}
            <div class="note">${(typeof RF2_COOKNOTE !== 'undefined') ? RF2_COOKNOTE : ''}</div>
            <div class="note">「其它」类的 ${etc.length} 条（米饭、巧克力、红酒、艾丽草与各尺寸的鸡蛋／牛奶／奶酪／酸奶／蛋黄酱）是<b>没有配方的成品</b>，只能在店里买或打怪掉落——别在料理台上找它们。</div>`;
                })()}
            ${(() => {
                    if (!(g && /^rf3/.test(g.id))) return '';
                    const IT = (typeof ITEM_RF3 !== 'undefined') ? ITEM_RF3 : [];
                    const C = (typeof RF3_COOK !== 'undefined') ? RF3_COOK : [];
                    const rec = (typeof RF3_RECIPE !== 'undefined') ? RF3_RECIPE : [];
                    const ORDER_RF3 = ['徒手', '菜刀', '平底锅', '搅拌机', '锅', '烤箱', '蒸笼', '其它'];
                    const kinds = ORDER_RF3.filter(k => rec.some(x => x[0] === k));
                    const recipes = rec.filter(x => x[2] !== '—');
                    const etc = rec.filter(x => x[0] === '其它');
                    const lvs = recipes.map(x => parseInt(x[2], 10)).filter(v => !isNaN(v));
                    const kindRows = kinds.map(k => {
                        const sub = rec.filter(x => x[0] === k);
                        const hasLv = sub.filter(x => x[2] !== '—');
                        const ls = hasLv.map(x => parseInt(x[2], 10));
                        const easy = (hasLv.length ? hasLv : sub).slice().sort((a, b) => (parseInt(a[2], 10) || 0) - (parseInt(b[2], 10) || 0))[0];
                        return [k, sub.length + ' 条', ls.length ? ('Lv' + Math.min.apply(null, ls) + '–' + Math.max.apply(null, ls)) : '—',
                            easy[2] === '—' ? easy[1] : easy[1] + '（Lv' + easy[2] + '）'];
                    });
                    const rowR = x => [x[1] + ' ' + x[0] + ' ' + x[3].join(' ') + ' ' + x[5],
                        [x[1], x[0], x[2] === '—' ? '—' : 'Lv' + x[2], x[3].join('、') || '—', x[4] === '—' ? '—' : x[4] + 'G', x[5]]];
                    return `
            <h2 class="h2">符文3：${C.length} 道料理、${recipes.length} 条配方</h2>
            <p class="p">这一作现在把<b>「材料配方」也补上了</b>——每道菜要拿什么食材、几级能做、卖多少，全部来自 bilibili wiki 的 RF3 料理表（已汉化）。另外 ${C.length} 道菜的<b>名称与食用效果</b>来自 RF3 游戏文本 dump。两份来源合并，正好拼成「怎么做 + 吃了怎样」。</p>
            <div class="note"><b>怎么拿到这些配方？</b> RF3 没有「配方书」系统，改成吃<b>料理パン（配方面包）</b>。料理类配方统一来自 <b>Cooking Bread（料理パン）</b>：在 Blaise 的餐馆（トラレンス食堂）花 200G 买，每天随机上架 3–6 条。重点——<b>面包里装哪道配方是随机的，不能指定</b>：买完先存档再吃，不满意读档重抽；偶尔出「美味面包（Recipe Bread +）」一次教 2 道。吃面包时你的料理等级须在配方所需等级 <b>±9 以内</b> 才学得到（表里「制造等级」即该门槛）；没学到也能硬做，只是成功率低、RP 更费。另外无名旅人 NPC 卖 800G/条（随机、偏贵），由绘（Yue）在旅馆二楼偶尔也卖，比赛第一名奖品、迷宫宝箱、委托奖励也会给面包。</div>
            <h2 class="h2">配方面包种类（全 5 类）</h2>
            <p class="p">不只料理——锻造、药学、装饰的配方也都是吃面包学，只是面包种类不同。下表是 Blaise 处每日随机贩卖的五种，价格固定：</p>
            ${tbl(['面包（英 / 日）', '价格', '教到的配方类别'], [
                ['Cooking Bread 料理パン', '200G', '料理（本页全部）'],
                ['Medicine Bread 薬パン', '160G', '药学'],
                ['Accessory Bread 装飾パン', '300G', '装饰'],
                ['Weapon Bread 武器パン', '350G', '锻造·武器'],
                ['Farming Bread 農具パン', '450G', '锻造·农具'],
            ], { leftFirst: true, cls: 'txt', colw: ['auto', '3.2rem', 'auto'] })}
            <div class="note">配方来源是<b>网络 wiki（bilibili《符文工房3》RF3recipecook 页）</b>，并非官方解包，数值以游戏内为准。同一道菜用不同尺寸材料（小/中/大牛奶、普通/优质/每日健康蛋）会拆成多行，这是源表本来的写法。末尾<b>「其它」${etc.length} 件是没有配方的成品</b>（米饭、巧克力、失败之作等），只能买或掉落，制造等级与材料栏标 —。</div>
            ${stat([['料理效果', C.length + ' 道（游戏文本）'], ['配方 / 其它', recipes.length + ' / ' + etc.length], ['厨具', (kinds.length - 1) + ' 类 + 其它'], ['技能范围', 'Lv' + Math.min.apply(null, lvs) + '–' + Math.max.apply(null, lvs)], ['数据来源', 'bilibili wiki（汉化）']])}
            <h2 class="h2">七类厨具 + 「其它」</h2>
            <p class="p">先有对应厨具才能做那一类。<b>平底锅最多（${rec.filter(x => x[0] === '平底锅').length} 条），徒手最少</b>。「其它」是没有配方的成品，别在料理台上找它们。</p>
            ${tbl(['分类', '条数', '等级范围', '入门一道'], kindRows, { leftFirst: true, cls: 'txt', colw: ['4.6rem', '2.8rem', '4rem', 'auto'] })}
            <h2 class="h2">配方表：怎么做（可搜索）</h2>
            <p class="p">按厨具与制造等级排序。搜菜名找做法，<b>搜食材名反查能做什么菜</b>（例如搜「闪光鲷鱼」列出所有用它的菜）。卖价是 Lv1 基础售价，用更高级材料做出的成品卖得更贵。</p>
            ${ftableOwn(['名称', '厨具', '制造等级', '材料', '卖价', '属性效果'],
                    ['5.4rem', '3rem', '3.4rem', 'auto', '3rem', 'auto'],
                    rec.map(rowR), { cls: 'mon-aux', ph: '搜菜名、厨具或食材' })}
            <h2 class="h2">食用效果（游戏文本）</h2>
            <p class="p">这一张直接录 RF3 游戏文本 dump 里每道菜的<b>官方中文描述</b>，偏风味说明（「蘸上酱油等调味料食用」「食用后较易打出暴击」）。想找「加暴击」「火属性减半」这类具体数值效果，用上一张配方表的属性效果列搜更快。</p>
            ${ftableOwn(['料理名', '分类', '效果描述'],
                    ['5.4rem', '4.8rem', 'auto'],
                    C.map(x => [x[1] + ' ' + x[0], [x[1], x[0], x[2].replace(/\{换行\}/g, '<br>')]]),
                    { cls: 'mon-aux', ph: '搜菜名、分类或效果关键词' })}
            <div class="jump">
                <a href="#/page/rf3list">
                    <div class="jp-t">物品一览</div>
                    <div class="jp-s">RF3 全部 ${IT.length} 件，含料理成品与说明</div>
                </a>
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">RF3 全迷宫魔物数值</div>
                </a>
            </div>`;
                })()}
            <div class="jump">
                <a href="#/page/recipe">
                    <div class="jp-t">配方大全</div>
                    <div class="jp-s">RF5 全部 661 条配方：技能等级与所需素材</div>
                </a>
            </div>
        `;
        }
    },
    {
        key: 'craft', group: 'life', title: '锻造与药学', icon: 'hammer',
        body: (g) => `
            <h2 class="h2">三条生产线</h2>
            <p class="p">系列的「生产」分三块：<b>锻造</b>（武器、防具、农具强化）、<b>药学</b>（药品、部分素材）、<b>装饰</b>（家具、饰品）。三者共用同一套逻辑：配方 + 素材 + 等级。</p>
            ${tbl(['系统', '产出', '关键'], [
                ['锻造', '武器、防具、工具强化', '素材品质与锻造等级决定成品等级'],
                ['药学', '回复药、状态药、素材加工', '配方解锁依赖等级与剧情'],
                ['装饰', '家具、饰品、部分特殊道具', '多用于舒适度与后期收集'],
            ], { leftFirst: true })}
            <h2 class="h2">强化比换新更重要</h2>
            <p class="p">把一把武器强化到高等级，通常优于频繁换新武器——因为强化可以继承、材料可控。前期优先强化<b>你实际一直在用的那把</b>，而不是每把都摸一下。</p>
            <div class="key">生产系统的正确节奏：<b>先靠迷宫攒素材 → 把锻造／药学等级刷到能开下一档配方 → 再回头做装备</b>。反过来做，会一直卡在「素材不够、配方不开」。</div>
            <h2 class="h2">注意</h2>
            <p class="p">部分作品里，最强／次强武器<b>无法通过锻造获得</b>（例如 RF2 需要联机小游戏）。遇到「配方开到顶却做不出最强」的情况，先确认是不是这类例外。</p>
            ${(!g || g.id === 'rf5') ? `<p class="p">量产和「做一件毕业的」是两件事。前者看配方表，后者看强化顺序——<b>倍铁怎么排位置，比用什么配方更决定成败</b>，那套算法单独放在了装备打造那一页。</p>` : ''}
            <div class="jump">
                <a href="#/page/recipe">
                    <div class="jp-t">配方大全</div>
                    <div class="jp-s">RF5 全部 661 条配方：武器、防具、饰品、药学</div>
                </a>
                ${(!g || g.id === 'rf5') ? `<a href="#/page/gear">
                    <div class="jp-t">装备打造·毕业套</div>
                    <div class="jp-s">倍铁怎么把数值乘到 12000</div>
                </a>` : ''}
            </div>
        `
    },
    {
        key: 'gear', group: 'life', title: '装备打造·毕业套', icon: 'sword',
        gms: ['rf5'],
        body: () => `
            <h2 class="h2">「毕业套」不是一把更强的武器</h2>
            <p class="p">终端装备的面板能到配方表上限的好几倍，靠的不是更好的配方，而是<b>把强化栏填满、并且让每一格的效果都乘到最大</b>。这套算法只在 RF5 的终盘成立，理解了这条链，你自己也能算出来。</p>
            <div class="note">本页<b>只对应《符文工房5》</b>，且只在 RF5 的作品目录里出现——其他作品的终盘装备素材与数值都不同，不做跨作套用。</div>

            <h2 class="h2">核心：倍率是三块铁</h2>
            <p class="p">有三样素材不提供任何属性，它们只做一件事——<b>修改紧挨着它前面那一格</b>的强化效果。</p>
            ${tbl(['素材', '实际作用', '怎么用'], [
                ['倍铁', '把上一个材料的强化效果 <b>×2</b>', '放在目标素材紧后面'],
                ['10 倍铁', '把上一个材料的强化效果 <b>×8</b>', '同上，倍数最大，留给最值钱的那一格'],
                ['不明物体', '把上一个材料的强化效果 <b>×−1</b>', '专门用来把负面素材翻转成正收益'],
            ], { leftFirst: true, cls: 'txt', colw: ['9.6rem'] })}
            <div class="key">这条规则是全页的钥匙：<b>倍率铁只放大「它前一格」，不是放大全部</b>。所以素材的排列顺序本身就是数值设计——顺序错一格，成品就废了。</div>

            <h3 class="h3">拿 RF5 的鞋走一遍</h3>
            <p class="p">下面是 RF5 毕业鞋的强化顺序前四步。注意「发光的鳞片」被 10 倍铁放大那一下：</p>
            ${tbl(['步骤', '放进去的素材', '这一格实际得到什么'], [
                ['强化 1', '发光的鳞片', '力量 +300'],
                ['强化 2', '<b>10 倍铁</b>', '把前一格 ×8 → <b>力量 +2400</b>'],
                ['强化 3', '传说中的兽人布', '封印抗 +0.3、暴击抗 +0.15、晕眩抗 +0.15'],
                ['强化 4', '<b>倍铁</b>', '把前一格 ×2 → 封印抗 +0.6、暴击抗 +0.3、晕眩抗 +0.3'],
            ], { leftFirst: true, cls: 'txt', colw: ['4rem', '9rem'] })}
            <p class="p">后面接的「超级托伊药草」只给疲劳抗 +0.3，没有倍率铁跟着，就是原值——<b>好素材要留给倍率铁，次一点的素材排在倍率铁之后</b>，这就是整张表看起来排列古怪的原因。</p>

            <h2 class="h2">三步法：为什么不能直接造最强的</h2>
            <p class="p">终盘武器的「建造栏位」往往不够放这么多素材。于是社区摸索出一套绕法，两作通用：</p>
            ${tbl(['步骤', '做什么', '为什么'], [
                ['第一步', '先造一把低阶的<b>载体</b>（双刃大砍刀／迷你盾／衬衫／皮长靴／护符）', '载体等级低、栏位够，打造时能塞进 3 个追加素材'],
                ['第二步', '把这个载体的面板，替换成<b>高面板武器</b>（天之村丛云剑／乌龟盾／将军长袍…）', '面板跟素材强化是两条线，可以一条拿数值、一条拿抗性'],
                ['第三步', '再转成你想要的<b>外观与种类</b>', '外观和种类是第三步才决定的，所以最终长什么样不影响前面的计算'],
            ], { leftFirst: true, cls: 'txt', colw: ['4.6rem'] })}
            <div class="note">第三步跨种类转换<b>必须放梅西莱特矿石</b>，而且「要幻化成外观的那把武器」建造栏位不能超过 4 个。这是两步都不能省的硬条件。</div>

            <h2 class="h2">RF5 武器毕业套</h2>
            <p class="p">目标面板是这套流程算出来的终点，不是随手能到的：</p>
            ${stat([['攻击', '12000+'], ['魔法攻击', '9000+'], ['力量', '600'], ['晕眩', '12'], ['暴击', '0.1'], ['防御', '−150']])}
            <p class="p">代价是防御 −150、智力 −10，以及放弃爱属性。三种异常攻击（毒／封印／麻痹／睡眠／疲劳／疾病）全部堆到 1，等于打谁都能挂上状态。</p>
            ${tbl(['步骤', '通用武器', '风属性武器'], [
                ['外观', '任意武器（杖与风属性除外）', '风属性武器（杖除外）'],
                ['面板', '天之村丛云剑', '天之村丛云剑'],
                ['载体（第一步）', '双刃大砍刀', '双刃大砍刀'],
                ['追加 1', '会唱歌的小瓶子', '会唱歌的小瓶子'],
                ['追加 2', '闪耀石', '闪耀石'],
                ['追加 3', '闪耀石', '闪耀石'],
                ['强化 1', '会唱歌的小瓶子', '会唱歌的小瓶子'],
                ['强化 2', '10 倍铁', '10 倍铁'],
                ['强化 3', '闪耀石', '闪耀石'],
                ['强化 4', '倍铁', '倍铁'],
                ['强化 5', '罕见的空罐', '罕见的空罐'],
                ['强化 6', '发光的鳞片', '发光的鳞片'],
                ['强化 7', '蛇龙的鳞片', '蛇龙的鳞片'],
                ['强化 8', '危险的钳子', '危险的钳子'],
                ['强化 9', '除风属性外任意属性结晶', '<b>大巨人的指甲</b>'],
            ], { leftFirst: true, colw: ['6.4rem'] })}
            <p class="p">两种类型只在<b>最后一步</b>分岔：风属性武器不能吃风结晶，改用大巨人的指甲。前面十四步完全一致。</p>

            <h2 class="h2">RF5 防具毕业套</h2>
            <p class="p">五件套的分工很明确——饰品负责异常抗性全满，盾和帽子负责暴击／击飞／晕眩，鞋子补封抗与移速，铠甲只管元素抗性。按抗性反查更方便：</p>
            ${tbl(['抗性', '盾', '铠甲', '帽子', '鞋子', '饰品', '合计'], [
                ['毒抗', '—', '—', '—', '—', '1', '<b>1</b>'],
                ['封印抗', '—', '—', '—', '0.9', '1', '<b>1.9</b>'],
                ['麻痹抗', '—', '—', '—', '—', '1', '<b>1</b>'],
                ['睡眠抗', '—', '—', '0.3', '—', '1', '<b>1.3</b>'],
                ['疲劳抗', '—', '—', '—', '—', '1', '<b>1</b>'],
                ['疾病抗', '—', '—', '—', '—', '1', '<b>1</b>'],
                ['昏厥抗', '—', '—', '1', '—', '1', '<b>2</b>'],
                ['吸收抗', '—', '—', '—', '—', '1', '<b>1</b>'],
                ['暴击抗', '0.3', '—', '—', '0.55', '0.15', '<b>1</b>'],
                ['击飞抗', '0.75', '—', '—', '0.25', '—', '<b>1</b>'],
                ['晕眩抗', '—', '—', '0.75', '0.45', '0.15', '<b>1.35</b>'],
                ['元素抗（火风水地）', '0.3', '0.42', '0.3', '—', '—', '<b>1.02</b>'],
                ['光暗抗', '0.3', '0.42', '0.3', '—', '—', '<b>1.02</b>'],
                ['无抗', '0.1', '0.1', '0.1', '0.1', '0.1', '<b>0.5</b>'],
                ['爱抗', '1.05', '—', '—', '—', '—', '<b>1.05</b>'],
            ], { leftFirst: true, cls: 'wide', colw: ['9.6rem'] })}
            <div class="note">合计超过 1 不是笔误——抗性是可以溢出的，封印抗 1.9、昏厥抗 2 都远超满值。这说明这套配法<b>不是刚好够用，而是留了冗余</b>：换掉一两件也照样满抗。这也正是它能被称作「毕业套」的原因：不是极限堆某个数值，而是每一项都过线还有余量。</div>
            <p class="p">制作顺序（同一列从上到下依次放）：</p>
            ${tbl(['步骤', '盾', '铠甲', '帽子', '鞋子', '饰品'], [
                ['第三步 外观', '任意盾', '任意铠甲', '任意帽子', '任意鞋子', '任意饰品'],
                ['第二步 面板', '乌龟盾', '将军长袍', '皇冠', '重靴', '钻石胸针'],
                ['第一步 载体', '迷你盾', '衬衫', '蓝色蝴蝶结', '皮长靴', '护符'],
                ['追加 1', '无力苹果', '无力苹果', '无力苹果', '幽灵靴', '魔斗的咒符'],
                ['追加 2', '无力苹果', '无力苹果', '无力苹果', '火箭之翼', '辟邪符'],
                ['追加 3', '不明物体', '不明物体', '不明物体', '发光的鳞片', '魔法之道的秘诀'],
                ['强化 1', '无力苹果', '无力苹果', '无力苹果', '发光的鳞片', '发光的鳞片'],
                ['强化 2', '大芜菁', '无力苹果', '发光的鳞片', '10 倍铁', '10 倍铁'],
                ['强化 3', '10 倍铁', '不明物体', '10 倍铁', '传说中的兽人布', '蛇龙的鳞片'],
                ['强化 4', '发光的鳞片', '发光的鳞片', '天青色的毛皮', '倍铁', '倍铁'],
                ['强化 5', '倍铁', '10 倍铁', '倍铁', '超级托伊药草', '传说中的兽人布'],
                ['强化 6', '蓝核', '蓝核', '蓝核', '蓝核', '蓝核'],
                ['强化 7', '绿核', '绿核', '绿核', '绿核', '绿核'],
                ['强化 8', '黄核', '黄核', '黄核', '黄核', '黄核'],
                ['强化 9', '红核', '红核', '红核', '红核', '红核'],
            ], { leftFirst: true, cls: 'wide', colw: ['6.4rem'] })}

            <h2 class="h2">其他作品有没有同款</h2>
            <p class="p"><b>RF4S 用的是同一套算法</b>，只是素材译名不同（不明物体在 RF4S 里叫物体X、歌之小瓶对应会唱歌的小瓶子），最终也能做到万级面板。本站只收录 RF5 这张表——两代的具体素材顺序与数值有差异，混着看反而容易记错，需要 RF4S 的版本请另找该作的资料。</p>
            <div class="note">RF4S 的两张完整表（武器分通用／风属性／杖三线、防具五件套）曾经放在这一页，因为两代混排容易把素材名记串，已经撤下。同理，本站其他作品的终盘配装也不做跨作套用。</div>

            <h2 class="h2">素材小百科</h2>
            <p class="p">上面那些表之所以能成立，全靠这些素材的附加效果。记住它们，就能自己改配方：</p>
            ${tbl(['素材', '效果'], [
                ['发光的鳞片', '力量 +300'],
                ['蛇龙的鳞片', '力量 +300、智力 −10'],
                ['闪耀石', '攻击范围 +1'],
                ['会唱歌的小瓶子', '毒／封印／麻痹／睡眠／疲劳／疾病攻击各 +0.1，昏厥攻击 +0.01'],
                ['幽灵靴 / 火箭之翼', '移动速度 +1 / +2'],
                ['大芜菁', '爱属性抗性 +0.15'],
                ['红黄蓝绿核', '无属性抗性各 +0.1（四颗合起来 +0.4）'],
                ['无力苹果', '元素抗性与光暗抗性 <b>−0.1</b>（负面素材，靠不明物体翻转）'],
                ['天之村丛云剑', '攻 12000、魔攻 9000、晕眩 12、暴击 0.1、昏厥攻 0.5'],
                ['危险的钳子', '攻 +195、防 −50'],
                ['大巨人的指甲', '攻 +150'],
                ['魔法之道的秘诀', '无属性伤害减半，并加装备 50% 无属性抗（结算后约 75%）'],
                ['辟邪符', '异常状态反转——中毒掉 HP 改成回 HP'],
                ['奇妙的坠饰', '敌我双方防御与魔防归零，只剩抗性生效'],
                ['魔斗的咒符', '攻击时按物理与魔法中较高的一项结算'],
                ['爱之结晶', '武器转为爱属性，吸血攻击 +3%（一般留到最后一步）'],
            ], { leftFirst: true, cls: 'txt', colw: ['10rem'] })}

            <h2 class="h2">做之前先知道这四件事</h2>
            <ul class="ul">
                <li class="li"><b>强化不可撤销</b>。RF 系列的强化一旦装上就拿不下来，顺序错了只能重做一把。动手前存档，是这套流程唯一的安全网。</li>
                <li class="li"><b>倍率铁只看前一格</b>。放两个倍铁连着，第二个会把第一个的效果 ×2，而不是把更早的素材再放大一遍——中间夹一格无用素材，整条链就白搭。</li>
                <li class="li"><b>面板与抗性是两条线</b>。第二步换面板只搬数值，第三步换外观只改外形；素材强化的抗性在两条线之间都能继承。</li>
                <li class="li"><b>这是终盘内容</b>。需要天之村丛云剑、10 倍铁、各色核这类深层素材，正常流程要打到隐藏迷宫。前期别照着这个练，先把锻造等级和配方开出来。</li>
            </ul>
            <div class="note">本页数值来自玩家社区「里格巴斯武器商」的实测整表（RF4S／RF5 各一份），并非官方公开数据。倍率规则、材料效果在游戏内可复现，但具体成品数值会受锻造等级、素材品质与版本补丁影响，可能与表列有出入。原表给的是「这样做能达到这个量级」，不是「每一件都精确等于这个数」。</div>
        `
    },
    {
        key: 'decorate', group: 'life', title: '装饰与家具', icon: 'chair',
        body: () => `
            <h2 class="h2">装饰系统能干什么</h2>
            <p class="p">做家具、饰品、摆件，改变自宅与房间的样子。表面上只是外观，实际上有两层实用价值：部分饰品带属性加成，部分家具影响房间功能（储物、展示、双人床）。</p>
            ${tbl(['类别', '作用'], [
                ['家具', '储物、床、桌椅等基础功能'],
                ['饰品', '可装备，提供属性或 RP 加成'],
                ['摆件', '收集与美观，部分可出货'],
                ['装饰台', '以上三类的制作入口'],
            ], { leftFirst: true })}
            <div class="note">这是系列里最容易被忽略的系统。前期不用碰，中期开始做几件带属性的饰品，性价比意外地高。</div>
        `
    },

    /* ================= 活动事件 ================= */
    {
        key: 'festival', group: 'event', title: '年度节日', icon: 'calendar',
        body: () => `
            <h2 class="h2">节日的类型</h2>
            <p class="p">节日是「一年只有一次」的限时机会，通常兼有三种功能：<b>拿奖金／奖品、大幅提升全镇好感、解锁特殊剧情</b>。错过要等一年。</p>
            ${tbl(['类型', '例子', '怎么赢'], [
                ['竞技类', '赛马、斗鸡、料理大赛、钓鱼大会', '提前一季准备参赛品／把魔物好感拉满'],
                ['祭典类', '花祭、收获祭、烟火大会', '参加即可，重在好感与剧情'],
                ['恋爱类', '星夜祭、情人节类活动', '需要提前邀请特定对象，关系不够会被拒'],
                ['祈愿类', '新年、初梦、许愿', '结果随机，带少量加成'],
            ], { leftFirst: true })}
            <h2 class="h2">提前知道日期的方法</h2>
            <p class="p">家里的日历、镇上的公告板、菜单里的日历页都能查。请养成<b>每天出门前看一眼日历</b>的习惯——节日最大的坑不是输掉比赛，而是忘了那天是节日。</p>
            <div class="key">节日当天的取舍：<b>竞技型节日优先，祭典型节日看恋爱线需要</b>。一天只能做一件事，别为了凑热闹错过能赢的比赛。</div>
            <h2 class="h2">RF4／RF4 SP：全年日程</h2>
            <p class="p">系列里日程最常被查的一作。一天最多只能赶一场，提前按季节把要参赛的标出来。</p>
            ${tbl(['季节', '日期与节日'], [
                ['春', '1 新年　6 料理比赛　10 撒豆比赛　15 钓鱼比赛　19 摩可摩可感谢祭　28 春季蔬菜比赛'],
                ['夏', '1 湖畔开放日　11 芜菁入侵祭　15 钓大鱼比赛　19 萤火祭　24 宠物比赛　28 夏季蔬菜比赛'],
                ['秋', '4 大胃王比赛　12 情人节　15 全鱼种钓鱼比赛　19 锻造与装饰比赛　25 白色情人节　28 秋季蔬菜比赛'],
                ['冬', '5 芜菁大战　13 益智问答比赛　15 钓乌贼比赛　25 圣诞夜　28 冬季蔬菜比赛　30 除夕'],
            ], { leftFirst: true, colw: ['2.9rem'] })}
            <div class="note">竞赛名次会累积：<b>你拿过一次第一，来年 NPC 的实力会跟着上调</b>。所以第一次参赛是拿金奖杯最容易的一次，别拖到第二年才认真准备。</div>
            <h2 class="h2">RF1：全年日程</h2>
            ${tbl(['季节', '日期与节日'], [
                ['春', '1 元旦　18 春之感恩节　23 鸡蛋大赛　27 烹饪大赛'],
                ['夏', '1 开海　18 牛奶大赛　26 探险大赛'],
                ['秋', '7 收获祭　17 赏月日　24 软软毛节　28 钓鱼日'],
                ['冬', '6 冬之感恩节　24 圣夜祭　30 除夕'],
            ], { leftFirst: true, colw: ['2.9rem'] })}
            <p class="p">RF1 的节日当天<b>全镇商店休息</b>（医院除外），要买东西就提前一天。牛奶大赛、软软毛节这类比的就是家畜好感——换句话说，比的是你驯养魔物的水平。</p>
            ${(() => {
                    const cal = (typeof CAL_RF1 !== 'undefined') ? CAL_RF1 : [];
                    const at = k => cal.findIndex(x => x.indexOf(k) >= 0);
                    const cut = [at('元旦'), at('开海'), at('收获祭'), at('冬之感恩节')];
                    if (cut.indexOf(-1) >= 0) return '';
                    const seas = ['春', '夏', '秋', '冬'];
                    const rows = seas.map((s, i) => {
                        const a = cut[i], b = (i < 3 ? cut[i + 1] : cal.length);
                        const names = cal.slice(a, b)
                            .filter(x => x.indexOf('生日') >= 0)
                            .map(x => x.replace('的生日', ''));
                        return [s, names.length ? names.join('　·　') : '—', names.length + ' 位'];
                    });
                    const evs = cal.filter(x => x.indexOf('生日') < 0);
                    return `
            <h2 class="h2">RF1：${evs.length} 场节日与 26 位居民的生日</h2>
            <p class="p">解包文本把一年的日程按顺序排成一张表：<b>节日与生日混在同一条时间轴上</b>。上面那张日期表是攻略资料补的日期，这张是解包表给的<b>先后顺序</b>——两者可以互相对照。</p>
            ${tbl(['季节', '按顺序过生日的人', '人数'], rows, { leftFirst: true, cls: 'txt', colw: ['3rem', 'auto', '4rem'] })}
            <p class="p">生日在这作不看日期看顺序，所以更实用的用法是：<b>把生日当作季节的刻度</b>。比如「春之感恩节之后、鸡蛋大赛之前过生日的是拉塞尔」——这样即使不记具体日期，也能知道该在什么时候准备礼物。</p>
            <div class="note">节日名已按初代汉化定稿统一（年始祭→元旦、春のかんしゃ祭→春之感恩节、卵大会→鸡蛋大赛、料理大会→烹饪大赛、海開き→开海、ふわ毛祭り→软软毛节、釣りの日→钓鱼日、聖夜祭→圣夜祭）。</div>`;
                })()}
            <h2 class="h2">RF3／RF3 SP：全年日程</h2>
            <p class="p">这一作的日程能从攻略文本里读出<b>具体日期</b>（含居民生日），按游戏内月份排列。一天最多赶一场，提前按季节把要参赛的标出来。</p>
            ${tbl(['季节', '日期与事件（括号内为生日）'], (typeof RF3_CAL !== 'undefined' ? RF3_CAL : []), { leftFirst: true, colw: ['2.9rem'] })}
            <div class="note">蔬菜竞赛得分公式：<b>总分 = 成长日数×35 + 作物等级×40</b>，当季作物额外 +250 分；各季最高分的当季作物：春 LV10 金色卷心菜、夏 LV10 金色南瓜、秋 LV10 青椒、冬 LV10 温暖果实。钓鱼大会分四种——丰收(比数量)、大家伙(比尺寸,约 60cm 可胜)、猎乌贼(比数量,6 只可胜)、随处可钓(比种类,10 种可胜)。芜菁祭类(迫近芜菁祭 6000 分／芜菁合战 3000 分)最后时刻会刷出金色芜菁翻盘。</div>
            ${(() => {
                    const bg = (typeof RF3_BGIFT !== 'undefined') ? RF3_BGIFT : [];
                    if (!bg.length) return '';
                    return `<h2 class="h2">RF3：生日送礼偏好</h2>
            <p class="p">生日当天送一件「最喜欢的」礼物，好感涨幅远超平时。下表是对应的偏好物（取自攻略本人物表）：</p>
            ${tbl(['角色', '最爱礼物'], bg, { leftFirst: true, cls: 'txt', colw: ['5rem', 'auto'] })}`;
                })()}
            <div class="note">「自己的生日」由 NDS 主机设定的生日映射：现实 3-5 月→游戏春月、6-8 月→夏月、9-11 月→秋月、12-2 月→冬月（日期不变）。友好度 ≥6 的人物会在当天送你礼物。</div>

            <h2 class="h2">RFF（边境）：全年日程</h2>
            <p class="p">边境一年同样分<b>春·夏·秋·冬</b>四季，攻略记到具体日期的共 ${(typeof FEST_RFF !== 'undefined') ? FEST_RFF.length : 0} 场。和 RF4 那种「一天赶一场」不同，这里的节日更像<b>玩法事件</b>——多数要跑到特定地点、找特定 NPC 才触发，错过就等明年。</p>
            ${(() => {
                    const d = (typeof FEST_RFF !== 'undefined') ? FEST_RFF : [];
                    const rows = ['春', '夏', '秋', '冬'].map(s => {
                        const it = d.filter(x => x[0] === s).sort((a, b) => a[1] - b[1]);
                        return [s, it.map(x => x[1] + ' ' + x[2]).join('　')];
                    }).filter(r => r[1]);
                    return tbl(['季节', '日期与节日'], rows, { leftFirst: true, colw: ['2.9rem'] });
                })()}
            <p class="p">每一场怎么玩、要去哪触发：</p>
            ${(() => {
                    const d = (typeof FEST_RFF !== 'undefined') ? FEST_RFF : [];
                    return tbl(['节日', '玩法要点'], d.map(x => [x[0] + x[1] + '日　' + x[2], x[4]]), { leftFirst: true, cls: 'festnote', colw: ['6.4rem'] });
                })()}
            <div class="note">站内名单里还有<b>薇薇亚修节</b>与<b>海潮日</b>两场，攻略没记载日期，所以没进这张表。另外<b>年始祭与青叶祭要第二年以后才会发生</b>——第一年别空等。</div>
            <h2 class="h2">RFO（海洋）：全年日程</h2>
            <p class="p">海洋是系列里节日<b>玩法写得最细的一作</b>：几乎每场都标了触发时刻（AM10／PM6／PM8）和对话对象，过时不候。共 ${(typeof FEST_RFO !== 'undefined') ? FEST_RFO.length : 0} 场，四季都有。</p>
            ${(() => {
                    const d = (typeof FEST_RFO !== 'undefined') ? FEST_RFO : [];
                    const rows = ['春', '夏', '秋', '冬'].map(s => {
                        const it = d.filter(x => x[0] === s).sort((a, b) => a[1] - b[1]);
                        return [s, it.map(x => x[1] + ' ' + x[2]).join('　')];
                    }).filter(r => r[1]);
                    return tbl(['季节', '日期与节日'], rows, { leftFirst: true, colw: ['2.9rem'] });
                })()}
            <p class="p">每一场怎么玩、要去哪触发：</p>
            ${(() => {
                    const d = (typeof FEST_RFO !== 'undefined') ? FEST_RFO : [];
                    return tbl(['节日', '玩法要点'], d.map(x => [x[0] + x[1] + '日　' + x[2], x[4]]), { leftFirst: true, cls: 'festnote', colw: ['6.4rem'] });
                })()}
            <div class="note">译名取自这一作汉化工程的定稿名词表（如「精霊仮装祭」定稿为<b>精灵变装节</b>、「料理の鉄人」为<b>料理铁人赛</b>），不是音译。另有<b>特卖会</b>与<b>抽奖会</b>两场，属于商店活动而非节日，没有固定日期。</div>
            <h2 class="h2">RF2：全年日程</h2>
            <p class="p">RF2 的节日来自攻略的「节日全事件一览」，共 ${(typeof FEST_RF2 !== 'undefined') ? FEST_RF2.length : 0} 场，四季都有。这一作的节日几乎都由<b>公园的富豪</b>主持——要参赛，第一步几乎都是先到他那儿报到。</p>
            ${(() => {
                    const d = (typeof FEST_RF2 !== 'undefined') ? FEST_RF2 : [];
                    const rows = ['春', '夏', '秋', '冬'].map(s => {
                        const it = d.filter(x => x[0] === s && x[1] !== null).sort((a, b) => a[1] - b[1]);
                        return [s, it.map(x => x[1] + ' ' + x[2]).join('　')];
                    }).filter(r => r[1]);
                    return tbl(['季节', '日期与节日'], rows, { leftFirst: true, colw: ['2.9rem'] });
                })()}
            <p class="p">每一场怎么玩、冠军条件与奖品：</p>
            ${(() => {
                    const d = (typeof FEST_RF2 !== 'undefined') ? FEST_RF2 : [];
                    return tbl(['节日', '玩法要点'], d.map(x => [x[0] + (x[1] ? x[1] + '日' : '未载日期') + '　' + x[2], x[4]]), { leftFirst: true, cls: 'festnote', colw: ['6.4rem'] });
                })()}
            <div class="note"><b>魔物伙伴大会与魔物大会都以魔物为主角</b>——比的是你养的那几只的状态，不是主角的战力。另外这一作有「儿女辈」设定：到了第二代，<b>夏季的钓鱼大会会换成料理大会</b>，做出指定料理给富豪即可。<b>魔物伙伴大会</b>原攻略没有标注日期，所以没进上面的日期表。</div>
            <p class="p">节日当天大家在哪（参加比赛等特殊情况除外）：</p>
            ${(() => {
                    const p = (typeof RF2_FESTPOS !== 'undefined') ? RF2_FESTPOS : [];
                    return tbl(['地点', '在场的人'], p.map(([a, b]) => [a, npcLink('rf2', b)]), { leftFirst: true, cls: 'festnote', colw: ['5.4rem'] });
                })()}
            <div class="note">这张表是<b>节日当天找人的捷径</b>——想送礼或触发对话，直接照着地点去蹲就行。到了儿女辈，新登场的人物会改在学校附近或学校里。</div>

            <h2 class="h2">RF5：全年日程</h2>
            <p class="p">这一作一共 ${(typeof FEST_RF5 !== 'undefined') ? FEST_RF5.length : 0} 场，是系列活动里<b>节日密度最高</b>的一作——几乎每隔几天就有一场。绝大多数比赛的流程是同一个模子：<b>当天 11：00 到繁华广场找西蒙娜报到</b>，交一件东西或打一场小游戏，按评分发奖。</p>
            ${(() => {
                    const d = (typeof FEST_RF5 !== 'undefined') ? FEST_RF5 : [];
                    const rows = ['春', '夏', '秋', '冬'].map(s => {
                        const it = d.filter(x => x[0] === s).sort((a, b) => a[1] - b[1]);
                        return [s, it.map(x => x[1] + ' ' + x[2]).join('　')];
                    }).filter(r => r[1]);
                    return tbl(['季节', '日期与节日'], rows, { leftFirst: true, colw: ['2.9rem'] });
                })()}
            <p class="p">每一场的时间、地点和评分规则：</p>
            ${(() => {
                    const d = (typeof FEST_RF5 !== 'undefined') ? FEST_RF5 : [];
                    return tbl(['节日', '时间地点与玩法'], d.map(x => {
                        const meta = [x[3], x[4], x[5] ? '主办' + x[5] : ''].filter(Boolean).join('　');
                        const desc = x[6] || '（原资料未记玩法）';
                        return [x[0] + x[1] + '日　' + x[2], (meta ? meta + '｜' : '') + desc];
                    }), { leftFirst: true, cls: 'festnote', colw: ['6.4rem'] });
                })()}
            <div class="note"><b>同一套评分模组</b>贯穿四场蔬菜比赛（春28／夏28／秋28／冬28）：看<b>农作物等级、物品等级、是否巨大化、是否符合当季</b>四项。所以别拿反季的高等级作物去，季节不符直接扣分。</div>
            <p class="p">三场比赛有单独的计分表，值得对着练：</p>
            ${(() => {
                    const moo = (typeof RF5_MOO !== 'undefined') ? RF5_MOO : [];
                    return tbl(['躲哞哞：牛种', '移动速度', '得分'], moo, { leftFirst: true, cls: 'festnote', colw: ['6rem', '3.4rem', '3rem'] });
                })()}
            ${(() => {
                    const eat = (typeof RF5_EAT !== 'undefined') ? RF5_EAT : [];
                    return tbl(['大胃王：食物', '得分', '按键次数'], eat, { leftFirst: true, cls: 'festnote', colw: ['6rem', '3.4rem', '3rem'] });
                })()}
            ${(() => {
                    const sn = (typeof RF5_SNOW !== 'undefined') ? RF5_SNOW : [];
                    return tbl(['堆雪人：雪球尺寸', '移动速度'], sn, { leftFirst: true, cls: 'festnote', colw: ['7rem', '3.4rem'] });
                })()}
            <div class="note">躲哞哞是<b>越往后刷新的牛越快、分也越高</b>，所以别一开始就追求躲开，先吃分再保命。大胃王按<b>按键次数</b>吃分，亲子盖饭与巨大金芜菁同为 12 次但差 500 分，<b>失败作是 −500 分</b>，宁可不吃也别交。堆雪人<b>雪球越大推得越慢</b>（3M 以上只剩 0.85 倍速），但堆得大分才高——<b>紫色雪球能大幅提速</b>，看到就抢。本节日期与计分数据来自 biligame 符文工厂 wiki 的「RF5festival」页，与站内原有的 RF5 节日名单逐条对过，这里多出「大海开放日」「宠物比赛」「锻造与装饰比赛」三场。</div>

            <h2 class="h2">其他作品的节日名</h2>
            <p class="p">下面这一作暂时只有<b>节日名称</b>、没有可考的具体日期，请以游戏内日历为准。已经有日期表的（RF4／RF1／RF2／RF3／RF5／边境／海洋）见上文各节。</p>
            <ul class="ul">
                <li class="li"><b>龙之天地</b>：新年参拜、七夕、烟花大会、放河灯、雪屋大会、便当／咖喱／美食／蔬菜大赛，以及数场垂钓大会。整体从「西式祭典」转向「东方岁时记」。</li>
            </ul>
        `
    },
    {
        key: 'love', group: 'event', title: '恋爱与结婚', icon: 'ring',
        body: g => `
            <h2 class="h2">流程</h2>
            <p class="p">系列的标准流程是：<b>提升好感 → 触发爱情事件 → 告白成为恋人 → 求婚 → 结婚 → 婚后生活（部分作品有孩子）</b>。</p>
            ${tbl(['阶段', '条件', '常见坑'], [
                ['提升好感', '每天对话 + 送礼 + 节日互动', '送错东西会掉好感；生日当天送礼效果翻倍'],
                ['爱情事件', '好感达到门槛 + 特定时间地点', '时段错了就触发不到，要先确认条件'],
                ['告白', '好感足够 + 持有特定道具／剧情推进', '同时攻略多人会被拒绝'],
                ['求婚', '恋人关系 + 婚约道具 + 房屋条件', '双人床／扩建没做完，会被卡住'],
                ['婚后', '同住、日常加成、部分作品可生子', '婚后角色日程会变'],
            ], { leftFirst: true })}
            <h2 class="h2">本作候补规模</h2>
            ${stat([['花嫁候补', g.candF ? g.candF + ' 位' : '见居民页'], ['花婿候补', g.candM ? g.candM + ' 位' : '见居民页'], ['同性婚', (g.id === 'rf5' || g.id === 'azuma' || g.id === 'rf4sp') ? '可选' : '视版本']])}
            <div class="key">送礼的正确做法：<b>先找出「最喜欢」的那一件，而不是每天换着花样送</b>。同一件最爱的礼物每天送，好感增长远高于随机送五件普通礼物。</div>
            <h2 class="h2">生日</h2>
            <p class="p">每位居民都有固定生日。生日当天送礼，好感加成显著。把「本周谁过生日」写进日程，比每天盲送效率高得多——本站「提醒」页就是为此做的。</p>
        `
    },
    {
        key: 'request', group: 'event', title: '委托任务', icon: 'board',
        body: () => `
            <h2 class="h2">委托是什么</h2>
            <p class="p">居民或组织发布的短期任务：交素材、做料理、打倒某只魔物、送东西。完成得到金钱、道具与好感，部分作品还会给「点数」用于公共建设。</p>
            ${tbl(['奖励类型', '说明'], [
                ['金钱', '前期最稳定的现金流'],
                ['道具／素材', '有时会给买不到的稀有品'],
                ['好感', '接谁的委托就涨谁的好感'],
                ['点数', '用于举办节日、修建设施、取得许可'],
            ], { leftFirst: true })}
            <h2 class="h2">接委托的取舍</h2>
            <p class="p">不要全接。判断标准有两条：<b>顺路不顺手</b>和<b>给的东西现在用不用得上</b>。为了一个用不上的奖励跑半个地图，是典型的时间浪费。</p>
            <div class="note">限定委托（期限一天／只在特定天气出现）优先处理，它们不会保留到第二天。</div>
        `
    },

    /* ================= 物品道具（通用机制） ================= */
    {
        key: 'rf1list', group: 'item', title: '物品一览', icon: 'bottle',
        gms: ['rf1'],
        body: () => {
            const IT = (typeof ITEM_RF1 !== 'undefined') ? ITEM_RF1 : [];
            /* 分类分节：每类一张表，顶部给跳转条，搜索时自动收起空节 */
            const EQ = eqblock(IT, { colw: '7.6rem' });
            const SEGS = EQ.CATS, nav = EQ.nav, secHtml = EQ.secs;

            /* 四季种子：说明首句写明了播种季节，直接按季节归类 */
            const seed = IT.filter(r => r[1] === '种子');
            const flora = IT.filter(r => r[1] === '草与花').map(r => r[0]);
            const stem = n => n.replace(/的?种子$/, '');
            const pick = k => seed.filter(r => r[2].indexOf(k) >= 0).map(r => stem(r[0]));
            const split = arr => [
                arr.filter(n => flora.indexOf(n) < 0).join('、') || '—',
                arr.filter(n => flora.indexOf(n) >= 0).join('、') || '—'
            ];
            const seas = ['春', '夏', '秋'].map(s => [s].concat(split(pick(s + '季'))));
            const ever = seed.filter(r => r[2].indexOf('冬天以外') >= 0).map(r => stem(r[0]));
            const fishN = IT.filter(r => r[1] === '鱼').map(r => r[0]);
            const cook = IT.filter(r => r[1] === '料理与食材');
            const fishDish = cook.filter(r => fishN.some(f => r[0].indexOf(f) >= 0)).length;
            return `
            <p class="p">本页是<b>《符文工房 新牧场物语》</b>的完整物品清单，共 ${IT.length} 件，<b>每一件都带说明全文</b>。这一作是系列第一代，卡带容量最小，但物品说明反而写得相当长——三行是常态，还常常带一句玩笑。</p>
            ${stat([['收录', IT.length + ' 件'], ['分段', SEGS.length + ' 段'], ['带说明', IT.filter(r => r[3] !== '—').length + ' 件']])}

            <h2 class="h2">四季能种什么</h2>
            <p class="p">这一作的种子说明第一句就写明播种季节（「能在春季播种」），所以四季表可以直接从文本读出来，不用猜。<b>每季正好 5 种作物</b>，花草另算——想把牧场摆满，按这张表排就够。</p>
            ${tbl(['季节', '作物', '花与药草'], seas.concat([['全年', ever.join('、') || '—', '冬季不可种']]), { leftFirst: true, cls: 'txt', colw: ['3.4rem', '9.6rem'] })}
            <div class="key">春的种子有 11 种，夏秋各 10 种——多出来的那种是<b>春季独有的两种药草</b>（月落草、托伊药草）。前期想稳赚，春天下手最划算。</div>

            <h2 class="h2">这一作的物品构成</h2>
            <p class="p">最反直觉的一条：<b>料理是件数第二多的类别，而其中三成是鱼</b>。${fishN.length} 种鱼能做出 ${fishDish} 道菜——同一条鱼既可以切片生吃，也可以整条盐烤或照烧，一道原料变两三道成品。换句话说，<b>这一作的钓鱼不是副业，是料理的主干</b>。</p>
            <p class="p">武器 76 件、盾与饰品 85 件，比例上和后来的作品差不多。真正缺的是<b>双剑、拳套、魔杖</b>——这几类要到 RF2 之后才出现，初代只有<b>单手剑、双手剑、长枪、锤、斧</b>五种近战，上面的分类按钮就是这五种。</p>

            <h2 class="h2">按分类查</h2>
            <p class="p">${IT.length} 件按 ${SEGS.length} 类分开列，点下面的分类直接跳过去；要跨类找某样东西，用搜索框——它会在全部 ${IT.length} 件里筛，筛完只剩某几类时，空掉的分类自动收起。</p>
            ${nav}
            ${eqbar(IT.length)}
            ${secHtml}
            <div class="note">取自《符文工房》初代汉化工程文本表：物品名 673 条、说明 2693 行。两份表<b>自带参照关系</b>（说明表的「rfItemName 参照」列直接指向物品名），所以是逐条对上的，不是按顺序硬凑。<b>已剔除 20 条占位项</b>（「未使用…」9 条、「未定32～42」11 条），这些在游戏里拿不到。<br>分类依据是物品在解包表里的先后顺序——游戏内并没有把类型写在物品上，所以这里的分段是<b>按排列位置切出来的</b>，不是官方分类。</div>
            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">10 大种族、11 种特技与 65 只洞窟魔物</div>
                </a>
                <a href="#/page/festival">
                    <div class="jp-t">年度节日</div>
                    <div class="jp-s">全年日程与 26 位居民的生日顺序</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'weapon', group: 'item', title: '武器', icon: 'sword',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const is4 = /^rf4/.test(id);
            const TX = txPack(id, 'weapon');
            const W = /^rf3/.test(id) ? (typeof EQW_RF3 !== 'undefined' ? EQW_RF3 : [])
                : id === 'rf5' ? (typeof EQW_RF5 !== 'undefined' ? EQW_RF5 : [])
                : is4 ? (typeof EQW_RF4 !== 'undefined' ? EQW_RF4 : []) : [];

            /* 本作实际有的类型与件数：有结构化数据就按种类字段统计，否则按文本分类 */
            const kinds = W.length
                ? (is4 ? ['单手剑', '双手剑', '长枪', '战锤', '战斧', '魔杖', '双剑', '拳套']
                    : ['单手剑', '双手剑', '枪', '双剑', '拳套', '斧', '锤', '魔杖'])
                    .map(k => [k, W.filter(r => r[1] === k).length]).filter(x => x[1])
                : TX ? TX.cats.map(c => [c, TX.rows.filter(r => r[0] === c).length]) : [];
            const total = W.length || (TX ? TX.n : 0);

            const kindTbl = kinds.length
                ? tbl(['种类（件数）', '特点', '适合'], kinds.map(([k, n]) => {
                    const d = WKIND[nk(k)] || ['—', '—'];
                    return [`${k}（${n}）`, d[0], d[1]];
                }), { leftFirst: true, cls: 'txt', colw: ['6.6rem', '10.4rem'] })
                : '';

            /* ---- 数据表：RF4／RF5 走结构化数值表 ---- */
            if (W.length) {
                const RAW = is4
                    ? ['单手剑', '双手剑', '长枪', '战锤', '战斧', '魔杖', '双剑', '拳套']
                    : ['单手剑', '双手剑', '枪', '双剑', '拳套', '斧', '锤', '魔杖'];
                const rows = W.map(r => [r[1], `${r[0]} ${r[1]} ${r[2]}`,
                    is4 ? [r[0], r[1], r[2], nz(r[3]), nz(r[4]), nz(r[5]), nz(r[6])]
                        : [r[0], r[1], r[2], nz(r[3]), nz(r[4]), nz(r[6]), nz(r[7])]]);
                const top = RAW.map(c => {
                    const L2 = W.filter(r => r[1] === c);
                    const a = L2.slice().sort((x, y) => y[3] - x[3])[0];
                    const m = L2.slice().sort((x, y) => y[4] - x[4])[0];
                    return [`${c}（${L2.length}）`, a ? `${a[0]} ${a[3]}` : '—',
                        (m && m[4]) ? `${m[0]} ${m[4]}` : '—'];
                }).filter(x => x[0].indexOf('（0）') < 0);
                const nEl = W.filter(r => r[2] === '无').length;
                const best = W.slice().sort((a, b) => b[3] - a[3])[0];
                return `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的武器：<b>${total} 件、${kinds.length} 种</b>。上面是选法，下面是全表。</p>
            ${stat([['武器', W.length + ' 件'], ['种类', kinds.length + ' 种'], ['无属性', nEl + ' 件']])}

            <h2 class="h2">武器种类与定位</h2>
            ${kindTbl}
            <p class="p">几类的差别不在「谁更强」，而在<b>单次伤害与出手次数的换算方式</b>。同样一分钟，双手剑打三下、双剑打十下；对方防御高时前者划算，防御低时后者划算。所以真正决定用哪把的，是<b>你面对的那只怪的防御</b>，不是武器面板。</p>
            <div class="key">前期只练一到两种武器。<b>武器技能等级是独立成长的</b>，分散练等于每个都不够用。</div>

            <h2 class="h2">各类型的天花板</h2>
            <p class="p">每一类里物攻／魔攻的最高值。<b>先看自己要练哪一类，再看这一类能到什么程度</b>，比从头翻全表快得多：</p>
            ${tbl(['种类（件数）', '物攻最高', '魔攻最高'], top, { leftFirst: true, cls: 'txt', colw: ['7rem', '9rem', '9rem'] })}
            <p class="p">全表物攻最高的是<b>${best ? best[0] + '（' + best[3] + '）' : '—'}</b>。</p>
            <div class="note">${is4
                        ? '<b>RF4 与 RF5 的武器大量同名同值</b>——两作共用同一套装备基础表（同名 192 件，物攻一项不差），RF5 那张表比 RF4 多十几件。'
                        : '面板最高的是锤「飞溅之星」14000 与双手剑「王者之剑」13600，而魔杖的物攻一栏干脆是 0——「贤者之杖」12960 全在魔攻上。所以「哪把最强」这个问题，得先问清是<b>打物攻还是打魔攻</b>。'}</div>

            <h2 class="h2">全武器清单</h2>
            <p class="p">${W.length} 件，按种类、属性与面板列出。<b>「属性」是武器自带的攻击属性</b>——无属性不会被人免疫、也不会被吸收，是最稳的选择；带了属性就要接受「有人怕你、也有人完全不吃」。</p>
            ${ftable(['名称', '种类', '属性', '物攻', '魔攻', '暴击', '眩晕'],
                    ['8.6rem', '4rem', '3rem'],
                    rows, { chips: RAW, ph: '输入武器名或属性筛选' })}
            <p class="p">表里的<b>暴击</b>是这件武器自带的暴击率修正，<b>眩晕</b>是它每次命中给对手累积的眩晕值——${is4 ? '锤、斧与双手剑' : '双手剑与锤'}的眩晕普遍更高，这也是它们「慢但打得动」的原因。</p>
            <div class="jump">
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">属性到底该不该堆，看抗性净差</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">技能等级怎么刷、配方什么时候开</div>
                </a>
            </div>`;
            }

            /* ---- 数据表：RF1／RF2／边境／海洋 走各自的通用数值表（WEQ_ALL，列随作自定） ---- */
            const WX = (typeof WEQ_ALL !== 'undefined' && g && WEQ_ALL[id]) ? WEQ_ALL[id] : null;
            if (WX) {
                const rowsN = WX.rows.length;
                const kindRows = WX.kinds.map(([k, n]) => [`${k}（${n} 件）`]);
                return `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的武器：<b>${rowsN} 件、${WX.kinds.length} 种</b>。上面是种类分布，下面是全表。</p>
            ${stat([['武器', rowsN + ' 件'], ['种类', WX.kinds.length + ' 种'], ['数据来源', 'biligame 数值表']])}

            <h2 class="h2">武器种类分布</h2>
            <p class="p">这一作武器分成 <b>${WX.kinds.length} 类</b>，件数如下。先确定要练哪一类，再看全表里这一类能到多高。</p>
            ${tbl(['种类（件数）'], kindRows, { leftFirst: true, cls: 'txt', colw: ['12rem'] })}
            <div class="key">前期只练一到两种武器。<b>武器技能等级是独立成长的</b>，分散练等于每个都不够用。</div>

            <h2 class="h2">全武器清单</h2>
            <p class="p">${rowsN} 件，按原表的种类与面板列出。<b>列多放不下时可左右滑动</b>；「—」表示该项为 0、无，或原表未给。搜武器名、种类、属性或特效都能筛。</p>
            ${ftableOwn(WX.cols, WX.colw, WX.rows, { ph: '输入武器名、种类、属性或特效筛选' })}
            <div class="note">${WX.note || ''}</div>
            <div class="jump">
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">属性到底该不该堆，看抗性净差</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">技能等级怎么刷、配方什么时候开</div>
                </a>
            </div>`;
            }

            /* ---- 数据表：RF1／RF2／RF3／边境走文本表 ---- */
            if (TX) {
                return `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的武器：<b>${TX.n} 件、${kinds.length} 类</b>。上面是定位，下面是全表。</p>
            ${stat([['武器', TX.n + ' 件'], ['类别', kinds.length + ' 类'], ['分类依据', '解包顺序']])}

            <h2 class="h2">武器种类与定位</h2>
            ${kindTbl}
            <p class="p">几类的差别不在「谁更强」，而在<b>单次伤害与出手次数的换算方式</b>。同样一分钟，双手剑打三下、双剑打十下；对方防御高时前者划算，防御低时后者划算。所以真正决定用哪把的，是<b>你面对的那只怪的防御</b>，不是武器面板。</p>
            <div class="key">前期只练一到两种武器。<b>武器技能等级是独立成长的</b>，分散练等于每个都不够用。</div>

            <h2 class="h2">强化与属性</h2>
            <p class="p">素材强化可以给武器附加属性（火、水、风、地、光、暗等）。属性对特定敌人有额外伤害，但被克制的敌人也会减伤——迷宫深处再决定要不要走属性特化。</p>
            <div class="note">武器本身通常只带<b>攻击属性与暴击率</b>，面板上没有力量／体力加成——那部分要靠素材强化一点点叠上去。这也是终盘装备能比商店货强出好几倍的原因。</div>

            <h2 class="h2">全武器清单</h2>
            <p class="p">${TX.n} 件，按解包顺序排列。<b>类型名下的件数就是这一作真实的数量</b>——系列后来的双剑、拳套、魔杖，在这一作里不一定有。</p>
            ${ftable(['名称', '说明'], ['7.6rem'], TX.rows,
                    { chips: TX.cats, ph: '输入武器名或说明里的词筛选' })}
            <div class="note">分类依据是物品在解包表里的排列顺序——游戏内并没有把类型写在武器上。段边界按名字逐条核对过（例如这一作的单手剑从「阔剑」到「符文剑」是连续的 21 件），<b>不是按名字猜的</b>。</div>
            <div class="jump">
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">属性到底该不该堆，看抗性净差</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">技能等级怎么刷、配方什么时候开</div>
                </a>
            </div>`;
            }

            /* ---- 没有物品数据的两作 ---- */
            return `
            <p class="p">本页讲的是<b>武器的通用选择思路</b>。${g ? g.name : '这一作'}的物品数据还没有整理进来，所以下面没有全表。</p>
            <h2 class="h2">武器种类与定位</h2>
            ${tbl(['种类', '特点', '适合'], Object.keys(WKIND).filter(k => k !== '盾').map(k =>
                [k, WKIND[k][0], WKIND[k][1]]), { leftFirst: true, cls: 'txt', colw: ['6.6rem', '10.4rem'] })}
            <p class="p">几类的差别不在「谁更强」，而在<b>单次伤害与出手次数的换算方式</b>。对方防御高时重武器划算，防御低时快武器划算。</p>
            <div class="key">前期只练一到两种武器。<b>武器技能等级是独立成长的</b>，分散练等于每个都不够用。</div>
            <div class="jump">
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">属性到底该不该堆，看抗性净差</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">技能等级怎么刷、配方什么时候开</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'armor', group: 'item', title: '防具', icon: 'shield',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const is4 = /^rf4/.test(id);
            const TX = txPack(id, 'armor');
            const A = id === 'rf5' ? (typeof EQA_RF5 !== 'undefined' ? EQA_RF5 : [])
                : is4 ? (typeof EQA_RF4 !== 'undefined' ? EQA_RF4 : []) : [];
            const J = id === 'rf5' ? (typeof EQC_RF5 !== 'undefined' ? EQC_RF5 : [])
                : is4 ? (typeof EQJ_RF4 !== 'undefined' ? EQJ_RF4 : []) : [];
            const total = A.length + J.length || (TX ? TX.n : 0);

            const intro = `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的防具与饰品${total ? '：<b>' + total + ' 件</b>。上面是配装思路，下面是全表。' : '：配装思路。这一作还没有物品数据。'}</p>
            <h2 class="h2">防具的几个部位</h2>
            <p class="p">系列基本是「身体一件 + 头 + 盾 + 鞋」的结构，部分作品没有盾或鞋子，另有饰品栏。防御力之外，防具真正值钱的是<b>抗性</b>：暴击抗、晕眩抗、击飞抗决定了你会不会被一套连死，属性抗决定了挨法伤时掉多少血。</p>
            ${tbl(['部位', '优先看', '为什么'], [
                ['盾', '物防、暴击抗、击飞抗', '只在配单手剑时能用，是防御效率最高的一格'],
                ['帽子', '魔防、晕眩抗', '布甲类，魔防通常高于铠甲'],
                ['铠甲', '物防、元素抗性', '防御主力，但重甲会拖慢移动'],
                ['鞋子', '移速、晕眩抗、暴击抗', '唯一带移动速度的部位，跑图手感全靠它'],
                ['饰品', '功能性：攻击特效、RP、掉落率', '数值最杂的一格，靠特效而不是靠数字'],
            ], { leftFirst: true, cls: 'txt', colw: ['4rem', '11rem'] })}
            <div class="note">防御力不是越高越好：穿太重会拖慢移动与动作速度。中后期更看重「抗性对不对」和「有没有特效」。</div>
            <div class="key">配装的正确顺序是<b>先补抗性、再补防御</b>。防御再高，被眩晕一套连击照样秒；而抗性堆满之后，同样的伤害你会站着吃完还剩半血。</div>`;

            if (A.length || J.length) {
                const ORDER = is4 ? ['盾', '头', '身体', '鞋', '饰品'] : ['盾', '帽子', '铠甲', '鞋子', '饰品'];
                const extra = r => {
                    if (!is4) return r[7] || '—';
                    const t = [];
                    if (r[4]) t.push('暴击抗' + r[4]);
                    if (r[5]) t.push('眩晕抗' + r[5]);
                    return t.join(' ') || '—';
                };
                const rows = A.map(r => [r[1], `${r[0]} ${r[1]} ${r[6] || ''}`,
                    [r[0], r[1], nz(r[2]), nz(r[3]), r[6] || '—', extra(r)]])
                    .concat(J.map(r => ['饰品', `${r[0]} ${r[2] || ''}`,
                        [r[0], '饰品', '—', '—', r[2] || '—', is4 ? (r[1] || '—') : (r[3] || '—')]]));
                rows.sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]));
                const best = ORDER.slice(0, 4).map(k => {
                    const L2 = A.filter(r => r[1] === k);
                    const b = L2.slice().sort((x, y) => (y[2] + y[3]) - (x[2] + x[3]))[0];
                    return [k, b ? `${b[0]}　<b>${b[2]} / ${b[3]}</b>` : '—', L2.length + ' 件'];
                }).filter(x => x[2] !== '0 件');
                return intro + `
            ${stat([['防具', A.length + ' 件'], ['饰品', J.length + ' 件'], ['部位', ORDER.length + ' 类']])}
            <h2 class="h2">各部位的面板上限</h2>
            <p class="p">按「物防 + 魔防」取每一部位的头名：</p>
            ${tbl(['部位', '面板最高（物防 / 魔防）', '收录'], best, { leftFirst: true, cls: 'txt', colw: ['4rem', '14rem', '3.6rem'] })}
            <h2 class="h2">全防具与饰品</h2>
            <p class="p">「抗性·加成」一列是这件装备自带的抗性与属性加成摘要，<b>毒／封／麻这类异常抗性也会算在里面</b>。${is4 ? '最后一列是暴击抗与眩晕抗的具体数值。' : '最后一列是特效。'}</p>
            ${ftable(['名称', '部位', '物防', '魔防', '抗性·加成', '特效'],
                    ['9rem', '3.6rem', '3.4rem', '3.4rem', '9.6rem', '6rem'],
                    rows, { chips: ORDER, ph: '输入防具名或抗性筛选' })}
            <div class="jump">
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">抗性怎么算：属性与异常两条线</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">防具的素材强化与等级上限</div>
                </a>
                ${is4 ? `<a href="#/page/fx">
                    <div class="jp-t">状态与抗性</div>
                    <div class="jp-s">面板上看不到的附加率与十八种抗性</div>
                </a>` : ''}
            </div>`;
            }

            if (TX) {
                return intro + `
            ${stat([['防具与饰品', TX.n + ' 件'], ['类别', TX.cats.length + ' 类'], ['分类依据', '解包顺序']])}
            <h2 class="h2">全防具与饰品</h2>
            <p class="p">${TX.n} 件，按解包顺序排列。这一作的防具与饰品${TX.cats.length > 1 ? '分成 ' + TX.cats.join('、') + ' 两类' : '没有细分，归在「' + TX.cats[0] + '」一类里'}。</p>
            ${ftable(['名称', '说明'], ['7.6rem'], TX.rows,
                    { chips: TX.cats.length > 1 ? TX.cats : null, ph: '输入防具名或说明里的词筛选' })}
            <div class="note">分类依据是物品在解包表里的排列顺序，不是游戏里写的字段。<b>本作的防具与饰品目前只有解包文本（名称＋说明），防御力／抗性等数值暂无可靠来源</b>，所以只列名称与说明、不填数值——不做推算。</div>
            <div class="jump">
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">抗性怎么算：属性与异常两条线</div>
                </a>
            </div>`;
            }

            return intro + `<div class="note">${g ? g.name : '这一作'}的物品数据还没有整理进来，所以下面没有全表。</div>
            <div class="jump">
                <a href="#/page/battle">
                    <div class="jp-t">战斗与弱点</div>
                    <div class="jp-s">抗性怎么算：属性与异常两条线</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'fx', group: 'item', title: '状态与抗性', icon: 'bolt',
        gms: ['rf4', 'rf4sp'],
        body: g => {
            const D = (typeof FX_RF4 !== 'undefined') ? FX_RF4 : [];
            const ST = (typeof FX_ST !== 'undefined') ? FX_ST : [];
            const RS = (typeof FX_RS !== 'undefined') ? FX_RS : [];
            if (!D.length) return `<p class="p">这一作暂时没有装备隐藏数值的数据。</p>`;

            const hasA = D.filter(x => x[2].length);
            const hasR = D.filter(x => x[3].length);
            const ail = D.filter(x => x[2].some(v => v[0] < 8));
            const negL = D.filter(x => x[3].some(v => v[1] < 0));
            const full = D.filter(x => x[3].length && x[3].every(v => v[1] > 0));
            /* 两个表各自只列本表实际有的部位，避免下拉选出 0 条 */
            const kinds = [];
            hasA.forEach(x => { if (kinds.indexOf(x[1]) < 0) kinds.push(x[1]); });

            /* 数值标签：负值标红 */
            const chips = (arr, N) => arr.map(([i, v]) =>
                `<span class="fxk${v < 0 ? ' dn' : ''}">${N[i]}<b>${v}%</b></span>`).join('');
            const nz = v => v ? v + '%' : '—';

            /* 每种状态：件数与来源 */
            const stInfo = ST.map((n, i) => {
                const L = D.filter(x => x[2].some(v => v[0] === i))
                    .map(x => { const t = x[2].find(v => v[0] === i); return [x[0], t[1]]; })
                    .sort((a, b) => b[1] - a[1]);
                return { n, cnt: L.length, top: L.slice(0, 3) };
            });
            /* 每种抗性：件数与上限 */
            const rsInfo = RS.map((n, i) => {
                const all = D.filter(x => x[3].some(v => v[0] === i));
                const L = all.map(x => { const t = x[3].find(v => v[0] === i); return [x[0], t[1]]; })
                    .filter(v => v[1] > 0).sort((a, b) => b[1] - a[1]);
                return { n, cnt: all.length, top: L.slice(0, 2) };
            });
            const EFF = {
                '毒': '每回合持续掉血', '封印': '魔法被封，放不出来', '麻痹': '短时间内无法行动',
                '睡眠': '完全无法行动，受击会醒', '疲劳': '攻击力下降', '病': '各项能力值下降',
                '昏厥': '当场倒地，掉一大段 HP', '吸血': '把造成的伤害一部分回给自己',
                '暴击': '会心率，面板上看不到', '击飞': '把目标打飞出去，能打断动作',
                '晕眩': '硬直，敌人动作被打断'
            };

            const stTbl = tbl(['状态', '效果', '最强来源'], ST.map((n, i) => [`${n}（${stInfo[i].cnt}）`, EFF[n] || '—',
                stInfo[i].cnt ? stInfo[i].top.map(v => `${v[0]} ${v[1]}%`).join('、') : '全表没有'
            ]), { leftFirst: true, cls: 'txt', colw: ['5.4rem', '8.6rem'] });

            const rsTbl = tbl(['抗性', '数值最高的装备'], RS.map((n, i) => [`${n}（${rsInfo[i].cnt}）`,
                rsInfo[i].top.length ? rsInfo[i].top.map(v => `${v[0]} ${v[1]}%`).join('、') : '—'
            ]), { leftFirst: true, cls: 'txt', colw: ['5.4rem'] });

            const sRows = hasA.map(x => [x[1], x[0] + ' ' + x[1],
                [x[0], x[1], chips(x[2], ST)]]);
            const rRows = hasR.map(x => [x[0] + ' ' + x[1],
                [x[0], x[1], chips(x[3], RS)]]);

            return `
            <p class="p">本页是<b>${g ? g.name : ''}</b>装备面板上看不到的两组数：<b>附加率</b>（打中之后有多大概率给对方挂上状态）和<b>抗性</b>（对面挂你的时候抵掉多少）。这两列在游戏里从不显示，只有解包表里才有，也正好解释了为什么有些装备「面板一样，用起来完全不一样」。</p>
            ${stat([['收录装备', D.length + ' 件'], ['带附加率', hasA.length + ' 件'], ['带抗性', hasR.length + ' 件']])}

            <h2 class="h2">这两列原本是空气</h2>
            <p class="p">武器防具面板只写攻击、防御、属性，<b>附加率与抗性一个字都不提</b>。可它们是真实生效的：拿毒素剑砍人，那 25% 的毒就是这么来的；戴钻石胸针被睡眠魔法打，免疫也是这么来的。原表把这两组数放在 48 列的最后二十几列，正常玩一辈子也看不到。口径上，<b>100% ＝必定生效</b>，负值＝反而更脆弱。</p>
            <div class="note">数值取自《RF4 数据解包汉化版 Datamining Compendium》的 <code>Equipment List</code>（422 件装备，本页收有附加率或抗性的 ${D.length} 件）。原表存的是 float32 小数，<code>0.099853515625</code> 其实就是 0.1——本页先归整成一位小数再换算成百分比，所以看到的是干净的 10%，不是 9.99%。</div>

            <h2 class="h2">十一种附加率</h2>
            <p class="p">前八种是<b>状态异常</b>，后三种是会心、击飞、晕眩，严格说不算异常，但同样是「打中之后可能发生什么」的概率，一起列出来才看得全。</p>
            ${stTbl}
            <div class="key">${hasA.length} 件带附加率的装备里，<b>能真正挂上八种异常的只有 ${ail.length} 件</b>，其余 ${hasA.length - ail.length} 件全是会心／击飞／晕眩这类战斗手感项。换句话说，「毒剑」「麻痹枪」这种流派在 RF4 里是很窄的一条路，能选的武器一共就那二十来件。</div>

            <h2 class="h2">能上状态的 ${hasA.length} 件</h2>
            <p class="p">按部位排好了。同一件装备可能同时挂好几种，比如狂乱剑一次带麻痹、疲劳、病三项。</p>
            <div class="fxw">${ftable(['装备', '部位', '附加效果'], ['6.2rem', '3.2rem'], sRows, {
                ph: '输入装备名或部位', sel: kinds,
                note: `<div class="note">搜「毒」能把这 ${hasA.length} 件里带毒的全挑出来。数值是该效果的<b>触发概率</b>，不是伤害倍率；同一件装备的多项概率各自独立判定。</div>`
            })}</div>

            <h2 class="h2">十八种抗性</h2>
            <p class="p">前七种是属性抗，后十一种是异常抗。抗性不是「减伤多少」这么简单：属性抗直接按百分比抵伤害，异常抗按百分比抵触发概率，所以凑到 100% 就是真免疫。</p>
            ${rsTbl}
            <div class="key">覆盖最广的不是铠甲，是<b>盾和饰品</b>。件数最多的几项——封印 24 件、晕 17 件、暴击 17 件、毒与疲劳各 8 件——几乎全落在盾、戒指和胸针上。这也说明 RF4 的配装逻辑：<b>身体管防御，盾和饰品管「防什么」</b>。</div>

            <h2 class="h2">带抗性的 ${hasR.length} 件</h2>
            <p class="p">其中 ${full.length} 件全是正抗，另外 ${negL.length} 件带负项——穿上就是「换」而不是「加」，最后一节单独讲。</p>
            <div class="fxw">${ftableOwn(['装备', '部位', '抗性'], ['6.2rem', '3.2rem'], rRows, { ph: '输入装备名或抗性类型', cls: 'fx' })}</div>

            <h2 class="h2">几处反直觉的地方</h2>
            ${tbl(['现象', '实际情况'], [
                ['八种异常全免疫只要一件饰品', '<b>钻石胸针</b>：毒／封印／麻痹／睡眠／疲劳／病／昏厥／吸血，八项各 100%。全表唯一一件把异常抗性凑齐的装备'],
                ['覆盖面最广的反而不是满值', '<b>勇气徽章</b>扛 10 项：晕 20、暴击 50、毒 50、封印 50、麻痹 50、睡眠 50、疲劳 30、病 30、昏厥 30、吸 30。项数最多，但每一项都不封顶'],
                ['盾也能当异常盾用', '<b>魔术盾</b>：毒／封印／麻痹／睡眠／吸 各 50，疲劳／病 各 25。防御数值一般，价值全在这七项上'],
                ['睡眠只能防，不能攻', `能附加睡眠的装备 <b>0 件</b>，能抗睡眠的有 ${rsInfo[3].cnt} 件。八种异常里唯一一项「玩家使不出来」的`],
                ['农具的抗性比防具猛', '<b>喜悦的锄头</b> 土 100＋晕 25＋暴击 30；<b>幸福的洒水壶</b> 水 100＋晕 50＋暴击 50；<b>神木钓竿</b> 水 100＋晕 50＋暴击 50，还带击飞 100%。农具在原表里有 ATK 和抗性，本来就是按「能挥」配的数值'],
                ['晕眩能超过 100%', `<b>注射器</b>／<b>魔法注射器</b>：晕眩 150%，附赠击飞 50%、暴击 30／50%。全表只有这两件破了 100%`],
                ['斧锤类清一色带附加率', '43 件斧锤<b>全部</b>带会心或晕眩，但<b>一件抗性都没有</b>。这是武器类别的固有加成，不是个别装备的彩蛋'],
            ], { leftFirst: true, cls: 'txt', colw: ['9.4rem'] })}

            <h2 class="h2">负抗：用一项换另一项</h2>
            <p class="p">${negL.length} 件带负项，分成两种完全不同的设计。</p>
            ${tbl(['类型', '代表装备与代价'], [
                ['属性戒指：一属顶格、一属反噬',
                    '<b>火之戒指</b> 火 100／水 −50；<b>水之戒指</b> 水 100／火 −50；<b>风之戒指</b> 风 100／土 −50；<b>地之戒指</b> 土 100／风 −50。四件两两配对，专精一属的代价就是怕它的对头，戴之前先看这一趟要打什么属性'],
                ['鞋类：轻量化的代价',
                    '<b>火箭之翼</b> 晕 −50／暴击 −25／击飞 −50；<b>重靴</b> 疲劳 −30；<b>幽灵靴</b>、<b>溜冰鞋</b>、<b>羽毛长靴</b> 击飞 −10 ~ −25；<b>躲藏靴</b> 晕 −20。跑得快、藏得好，但被打飞得更远、更容易被晕——负抗几乎只出现在「机动性装备」上，是设计上有意做的平衡'],
            ], { leftFirst: true, cls: 'txt', colw: ['7.4rem'] })}
            <div class="note">例外：<b>熬夜戒指</b> 睡眠 −25，同时疲劳／病 各 +30。它把「熬夜」的代价写成了数值——抗疲劳抗病，但更容易被拖进睡眠。</div>

            <h2 class="h2">配装怎么用这两列</h2>
            <p class="p">防御够用之后，<b>抗性比防御值钱</b>。一件 1500 防御的铠甲挡不住一次睡眠，而 100% 睡眠抗的饰品能让你在睡眠魔法里站着走。所以配装的顺序是：先看这一带会挂什么状态 → 饰品／盾对症补满 → 剩下的位置再堆数值。</p>
            <div class="key">最省事的一步是先把<b>钻石胸针</b>做出来。八种异常全免只要一格饰品，之后你只需要操心属性抗和会心、击飞这几项，配装宽度立刻松一半。</div>

            <div class="jump">
                <a href="#/page/weapon">
                    <div class="jp-t">武器</div>
                    <div class="jp-s">全武器攻击、魔攻与属性一览</div>
                </a>
                <a href="#/page/armor">
                    <div class="jp-t">防具</div>
                    <div class="jp-s">盾、铠甲、头饰、鞋与饰品的防御数值</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'tool', group: 'item', title: '农具', icon: 'hoe',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const is4 = /^rf4/.test(id);
            const TX = txPack(id, 'tool');
            const T = id === 'rf5' ? (typeof EQT_RF5 !== 'undefined' ? EQT_RF5 : [])
                : is4 ? (typeof EQT_RF4 !== 'undefined' ? EQT_RF4 : []) : [];

            const intro = `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的农具${T.length || TX ? '：<b>' + (T.length || TX.n) + ' 件</b>。' : '：六件基础农具与蓄力思路。这一作还没有物品数据，所以只有思路、没有表。'}</p>
            <h2 class="h2">六件基础农具</h2>
            ${tbl(['农具', '用途', '强化方向'], [
                ['锄头', '翻土', '蓄力范围'],
                ['洒水壶', '浇水', '蓄力范围、水量'],
                ['镰刀', '割草、收割', '范围'],
                ['斧', '砍树、取木材', '威力'],
                ['锤', '碎矿、碎石', '威力'],
                ['钓竿', '钓鱼', '可钓鱼种、成功率'],
            ], { leftFirst: true })}
            <h2 class="h2">蓄力等级是核心</h2>
            <p class="p">农具的强化几乎都指向「蓄力等级」。一级蓄力处理一格，等级越高一次处理的格数越多。<b>把锄头和洒水壶的蓄力拉起来，是前期回报率最高的投资</b>——它直接把你每天花在田里的时间砍掉一半。</p>
            <div class="key">优先级：<b>洒水壶 ＞ 锄头 ＞ 镰刀 ＞ 斧／锤 ＞ 钓竿</b>。理由很简单——浇水和翻土是你每天都要做的事。</div>
            <h2 class="h2">农具也能打人</h2>
            <p class="p">农具的另一半价值是<b>它们也能当武器用</b>。高阶农具的物攻并不比同期武器低多少，而且挥农具不消耗 RP；部分作品还有专门加强农具伤害的饰品。早期没钱换武器时，一把升满的锤子或斧头比商店货好用得多。</p>
            <div class="note">同一种农具通常是「破 → 铁 → 银 → 金 → 高阶」的<b>替换关系</b>，不是同一把一直强化上去。所以别急着给低阶农具塞稀有素材。</div>`;

            if (T.length) {
                const KINDS = [];
                T.forEach(r => { if (KINDS.indexOf(r[1]) < 0) KINDS.push(r[1]); });
                const rows = T.map(r => [r[1], `${r[0]} ${r[1]} ${r[2]}`,
                    is4 ? [r[0], r[1], r[2], nz(r[3]), nz(r[4]), nz(r[5])]
                        : [r[0], r[1], r[2], nz(r[3]), nz(r[4]), r[5] || '—']]);
                return intro + `
            ${stat([['农具', T.length + ' 件'], ['类型', KINDS.length + ' 类']])}
            <h2 class="h2">全农具清单</h2>
            <p class="p">同一种农具分好几档，<b>每一档都是替换关系，不是强化关系</b>：换了新档，旧的那把就可以处理掉了。</p>
            ${ftable(['名称', '类型', '属性', '物攻', '魔攻', '眩晕'],
                    ['10rem', '4.2rem', '3.2rem'],
                    rows, { chips: KINDS, ph: '输入农具名筛选' })}
            ${is4
                        ? `<div class="note">RF4 的农具也带攻击属性，且每档都有独立的物攻数值——升级农具同时也是升级一把备用武器。</div>`
                        : `<div class="note">农具的「属性」是固定的，不随强化改变：锄头带地属性、洒水壶带水属性、镰刀带风属性，其余农具都是无属性。</div>`}
            <div class="jump">
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">锤与钓竿的等级决定你能拿到什么</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">农具的锻造与蓄力强化</div>
                </a>
            </div>`;
            }

            if (TX) {
                return intro + `
            ${stat([['农具与工具', TX.n + ' 件'], ['类别', TX.cats.length + ' 类']])}
            <h2 class="h2">全农具清单</h2>
            <p class="p">${TX.n} 件。这一作把农具和工具（毛刷、剪毛刀、挤奶器、放大镜这类）排在同一段里，所以「农具」一栏会比单纯的下地工具多。</p>
            ${ftable(['名称', '说明'], ['7.6rem'], TX.rows, { ph: '输入农具名或说明里的词筛选' })}
            <div class="jump">
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">锤与钓竿的等级决定你能拿到什么</div>
                </a>
            </div>`;
            }

            return intro + `<div class="note">${g ? g.name : '这一作'}的物品数据还没有整理进来，所以下面没有全表。</div>
            <div class="jump">
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">锤与钓竿的等级决定你能拿到什么</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'material', group: 'item', title: '素材与矿石', icon: 'gem',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const is4 = /^rf4/.test(id);
            const TX = txPack(id, 'material');
            const M = id === 'rf5' ? (typeof MAT_RF5 !== 'undefined' ? MAT_RF5 : [])
                : is4 ? (typeof MAT_RF4 !== 'undefined' ? MAT_RF4 : []) : [];

            const intro = `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的素材${M.length || TX ? '：<b>' + (M.length || TX.n) + ' 件</b>。' : '：从哪来、怎么用。这一作还没有物品数据，所以只有思路、没有表。'}</p>
            <h2 class="h2">素材从哪来</h2>
            ${tbl(['来源', '产出'], [
                ['采矿', '矿石、宝石、石材'],
                ['砍伐', '木材、树液、果实'],
                ['魔物掉落', '皮毛、牙、爪、结晶、液体'],
                ['采集', '药草、花、蘑菇、竹笋'],
                ['钓鱼', '鱼、贝壳、海藻'],
                ['作物', '作物本身与加工品'],
            ], { leftFirst: true })}
            <h2 class="h2">素材的价值不看买价，看稀有度</h2>
            <p class="p">素材表里有个容易被忽略的字段：<b>稀有度</b>。它直接决定两件事——用这件素材做出来的装备能到多少级，以及强化时能提供多少「格数」。同一种素材的稀有度越高，成品上限越高。<b>所以刷素材时要挑高稀有度的版本，而不是数量最多的那堆。</b></p>
            <div class="key">「买价 ÷ 卖价」的比值也很能说明问题：比值越大，说明这件东西<b>越不该卖</b>——它的真正用途在你手上，不在商店里。</div>
            <h2 class="h2">攒素材的原则</h2>
            <p class="p"><b>低阶素材不要全卖</b>。锻造与药学的配方常常需要大量基础素材，卖光之后再回来刷，成本更高。留一箱基础素材，比多几万块钱有用。</p>
            <div class="note">稀有素材（Boss 掉落、深层矿石）建议单独存放并记下出处，后期配方几乎都要用到。倍铁、10 倍铁、不明物体这类强化素材尤其要囤。</div>`;

            if (M.length) {
                const SUBS = [];
                M.forEach(r => { if (SUBS.indexOf(r[1]) < 0) SUBS.push(r[1]); });
                const rows = M.map(r => [r[1], `${r[0]} ${r[1]}`,
                    [r[0], r[1], nz(r[2]), nz(r[3]), r[4]]]);
                const gem = M.filter(r => r[4] >= 12).length;
                return intro + `
            ${stat([['素材', M.length + ' 件'], ['分类', SUBS.length + ' 类'], ['稀有度 ≥12', gem + ' 件']])}
            <p class="p"><b>稀有度 12 以上的只有 ${gem} 件</b>，那批就是后期配方的瓶颈：刷到就单独存起来，别顺手卖店。</p>
            <h2 class="h2">全素材清单</h2>
            ${ftable(['名称', '分类', '买价', '卖价', '稀有度'],
                    ['9rem', '4.4rem', '4.2rem', '4.2rem', '3.8rem'],
                    rows, { sel: SUBS, ph: '输入素材名或分类筛选' })}
            <div class="jump">
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">哪一层出什么矿，深层迷宫怎么进</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">素材等级怎么决定成品等级</div>
                </a>
            </div>`;
            }

            /* ---- RF3：素材强化属性表（biligame RF3item） ---- */
            if (/^rf3/.test(id) && typeof MAT_RF3 !== 'undefined' && MAT_RF3.length) {
                const A = MAT_RF3;
                const nz2 = v => v !== '—';
                const num = v => (v === '—' ? null : parseInt(v, 10));
                const cntAtk = A.filter(r => nz2(r[3]) || nz2(r[4])).length;
                const cntDef = A.filter(r => nz2(r[5]) || nz2(r[6])).length;
                const cntStat = A.filter(r => nz2(r[7]) || nz2(r[8]) || nz2(r[9])).length;
                const topDef = A.filter(r => num(r[5]) !== null).sort((a, b) => num(b[5]) - num(a[5]))[0];
                const negs = A.filter(r => [r[3], r[4], r[5], r[6], r[7], r[8], r[9]].some(v => (num(v) || 0) < 0));
                const eff = r => {
                    const t = [];
                    if (r[10] !== '—') t.push('攻:' + r[10]);
                    if (r[11] !== '—') t.push('防:' + r[11]);
                    return t.join(' ') || '—';
                };
                const rows = A.map(r => [
                    r[0],
                    [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], eff(r), r[12]]
                ]);
                return intro + `
            ${stat([['素材', A.length + ' 件'], ['带攻/魔攻', cntAtk + ' 件'], ['带防/魔防', cntDef + ' 件'], ['带力/智/体', cntStat + ' 件']])}
            <h2 class="h2">素材强化属性表</h2>
            <p class="p">RF3 的素材不只是「稀有度越高越好」——<b>每件素材作为强化材料时，会给装备加上固定的属性</b>（攻／魔攻／防／魔防／力量／智力／体力），而且<b>可以是负数</b>。表里「—」表示该项为 0 或无。</p>
            <div class="key">强化前先看这张表：<b>要堆物防就找「防」高的，要补力量就找力量素材，别拿会扣属性的去凑格数</b>。全表有 ${negs.length} 件带负属性（如废铁扣防、豹爪扣防），用错会倒扣。</div>
            <p class="p">「强化难度」是把它打进装备所需的强化等级——数字越大越难成功。${topDef ? '单件「防」最高的是<b>' + topDef[0] + '（' + topDef[5] + '）</b>。' : ''}</p>
            ${ftableOwn(['素材', '买价', '卖价', '攻', '魔攻', '防', '魔防', '力量', '智力', '体力', '特效', '强化难度'],
                    ['7rem', '4rem', '4rem', '3rem', '4rem', '3rem', '4rem', '3.6rem', '3.6rem', '3.6rem', '6rem', '4.4rem'],
                    rows, { ph: '输入素材名或特效筛选' })}
            <div class="note">取自 biligame《RF3item》${A.length} 条素材的强化属性表。数值是该素材<b>作为强化材料</b>时提供的加成，不是它自身的属性；「—」为 0 或无，负数会扣属性。强化难度为原表的强化等级要求。</div>
            <div class="jump">
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">素材等级怎么决定成品等级</div>
                </a>
            </div>`;
            }

            if (TX) {
                return intro + `
            ${stat([['素材', TX.n + ' 件'], ['类别', TX.cats.length + ' 类'], ['分类依据', '解包顺序']])}
            <h2 class="h2">全素材清单</h2>
            <p class="p">${TX.n} 件。${id === 'rff' ? '<b>这一作把药与素材合成一段</b>，所以药品页列出的是同一批条目里的药类。' : ''}</p>
            ${ftable(['名称', '说明'], ['7.6rem'], TX.rows,
                    { chips: TX.cats.length > 1 ? TX.cats : null, ph: '输入素材名或说明里的词筛选' })}
            <div class="jump">
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">素材等级怎么决定成品等级</div>
                </a>
            </div>`;
            }

            return intro + `<div class="note">${g ? g.name : '这一作'}的物品数据还没有整理进来，所以下面没有全表。</div>
            <div class="jump">
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">哪一层出什么矿，深层迷宫怎么进</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'food', group: 'item', title: '料理与食材', icon: 'bowl',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const is4 = /^rf4/.test(id);
            const TX = txPack(id, 'food');
            const D = id === 'rf5' ? (typeof DSH_RF5 !== 'undefined' ? DSH_RF5 : [])
                : is4 ? (typeof DSH_RF4 !== 'undefined' ? DSH_RF4 : []) : [];
            const I = id === 'rf5' ? (typeof ING_RF5 !== 'undefined' ? ING_RF5 : [])
                : is4 ? (typeof ING_RF4 !== 'undefined' ? ING_RF4 : []) : [];

            const intro = `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的料理与食材${D.length || TX ? '：<b>' + (D.length + I.length || TX.n) + ' 条</b>。' : '：食材来源与做法。这一作还没有物品数据，所以只有思路、没有表。'}</p>
            <h2 class="h2">食材的四个来源</h2>
            <p class="p">自家作物、钓鱼、商店购买、采集。同一道料理用不同等级的材料做出来，成品等级也不同。</p>
            ${tbl(['类别', '例子', '主要用途'], [
                ['主食类', '饭、面包、面', '高回复，迷宫补给'],
                ['菜品类', '炒、煮、烤', '回复 + 送礼'],
                ['点心类', '蛋糕、饼干、布丁', '送礼首选，多数居民喜欢'],
                ['饮品类', '果汁、茶、酒', '回复 + 特定居民喜好'],
            ], { leftFirst: true })}
            <div class="key">万能礼物策略：<b>先做一道材料便宜、等级容易刷高的点心</b>，当作日常通用礼物。对大多数居民都是「喜欢」以上，比逐个研究喜好省太多时间。</div>
            <h2 class="h2">做法决定上限，食材决定下限</h2>
            <p class="p">料理按<b>烹饪器具</b>分家：平底锅、刀工、火锅、烤箱、搅拌机、蒸笼、徒手等。器具越高级，同等级能做的料理卖价越高。<b>但成品等级永远受限于食材等级</b>——用 1 级土豆做不出 10 级料理，这是新手最容易忽略的一条。</p>
            <div class="note">同一种作物常有普通与大号两个条目（如「卷心菜」与「卷心菜王」），大号是<b>同一株长成的特大个体</b>，稀有度与卖价都高一个档，做出来的料理等级也更高。想刷等级就专门留大号作物。</div>`;

            if (D.length || I.length) {
                const KINDS = [];
                D.forEach(r => { if (KINDS.indexOf(r[1]) < 0) KINDS.push(r[1]); });
                I.forEach(r => { if (KINDS.indexOf(r[1]) < 0) KINDS.push(r[1]); });
                const rows = D.map(r => [r[1], `${r[0]} ${r[1]}`,
                    [r[0], r[1], nz(r[2]), nz(r[3]), r[4]]])
                    .concat(I.map(r => [r[1], `${r[0]} ${r[1]}`,
                        [r[0], r[1], nz(r[2]), nz(r[3]), r[4]]]));
                return intro + `
            ${stat([['料理', D.length + ' 道'], ['食材', I.length + ' 件'], ['类别', KINDS.length + ' 类']])}
            <h2 class="h2">全料理与食材</h2>
            <p class="p">共 ${rows.length} 条。<b>卖价就是送礼时的好感基准</b>：越贵的东西越容易被喜欢，但送礼每日只算一件，别拿最贵的当日常消耗品。</p>
            ${ftable(['名称', '类别', '买价', '卖价', '稀有度'],
                    ['9rem', '4.6rem', '4.2rem', '4.2rem', '3.8rem'],
                    rows, { sel: KINDS, ph: '输入料理名或类别筛选' })}
            <div class="jump">
                <a href="#/page/cook">
                    <div class="jp-t">料理</div>
                    <div class="jp-s">烹饪机制、料理等级怎么刷、食材三条来源</div>
                </a>
                <a href="#/page/fish">
                    <div class="jp-t">鱼类图鉴</div>
                    <div class="jp-s">鱼的位置、季节与金杯线</div>
                </a>
            </div>`;
            }

            if (TX) {
                return intro + `
            ${stat([['料理与食材', TX.n + ' 件'], ['类别', TX.cats.length + ' 类'], ['分类依据', '解包顺序']])}
            <h2 class="h2">全料理与食材</h2>
            <p class="p">${TX.n} 件，${TX.cats.join('、')}分开列。这一作的说明多半只写做法，不写回复量——回复量要看料理等级，而等级取决于食材等级。</p>
            ${ftable(['名称', '说明'], ['7.6rem'], TX.rows,
                    { chips: TX.cats.length > 1 ? TX.cats : null, ph: '输入料理名或说明里的词筛选' })}
            <div class="jump">
                <a href="#/page/cook">
                    <div class="jp-t">料理</div>
                    <div class="jp-s">烹饪机制、料理等级怎么刷、食材三条来源</div>
                </a>
                <a href="#/page/fish">
                    <div class="jp-t">鱼类图鉴</div>
                    <div class="jp-s">鱼的位置、季节与金杯线</div>
                </a>
            </div>`;
            }

            return intro + `<div class="note">${g ? g.name : '这一作'}的物品数据还没有整理进来，所以下面没有全表。</div>
            <div class="jump">
                <a href="#/page/cook">
                    <div class="jp-t">料理</div>
                    <div class="jp-s">烹饪机制、料理等级怎么刷、食材三条来源</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'potion', group: 'item', title: '药品', icon: 'bottle',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const is4 = /^rf4/.test(id);
            const TX = txPack(id, 'potion');
            const P = id === 'rf5' ? (typeof POT_RF5 !== 'undefined' ? POT_RF5 : [])
                : is4 ? (typeof POT_RF4 !== 'undefined' ? POT_RF4 : []) : [];

            /* RF2／RF3／边境／海洋 有完整的药品数值表，优先于文本清单；
               这里的件数要与下方表格一致，所以先算 OD 再写 intro */
            const OD = (typeof POT_OLD !== 'undefined')
                ? (POT_OLD[id] || (/^rf3/.test(id) ? POT_OLD.rf3 : null)) : null;
            const cnt = P.length || (OD ? OD.rows.length : (TX ? TX.n : 0));

            const intro = `
            <p class="p">本页是<b>${g ? g.name : ''}</b>的药品${cnt ? '：<b>' + cnt + ' 件</b>。' : '：带什么、怎么配。这一作还没有物品数据，所以只有思路、没有表。'}</p>
            <h2 class="h2">常用药</h2>
            ${tbl(['类型', '作用', '入手'], [
                ['回复药', '回复 HP', '购买／药学调配'],
                ['RP 回复', '回复符文点数', '药学调配为主'],
                ['状态治疗', '解毒、解麻痹等', '购买／调配'],
                ['强化药', '临时提升属性', '药学高级配方'],
            ], { leftFirst: true })}
            <h2 class="h2">迷宫必备清单</h2>
            <p class="p">进深层迷宫前至少带：回复药 ×3、RP 回复 ×2、解毒／解异常 ×1。这不是保险，是效率——回城一趟损失的是整天的时间。</p>
            <div class="note">医院／诊所能买到基础药品，但高级药只能靠药学台调配。把药学等级刷起来，等于给自己开了一家随身药店。</div>`;

            if (P.length) {
                const cats = [];
                P.forEach(r => { if (cats.indexOf(r[1]) < 0) cats.push(r[1]); });
                const rows = P.map(r => [r[1], `${r[0]} ${r[1]}`,
                    [r[0], r[1], nz(r[2]), nz(r[3]), r[4]]]);
                return intro + `
            ${stat([['药品', P.length + ' 件'], ['分类', cats.length + ' 类']])}
            <h2 class="h2">全药品清单</h2>
            <p class="p">${is4 ? 'RF4 的药不分「营养剂」这一类，永久属性道具归在素材与特殊道具里。' : '<b>营养剂是永久提升属性的道具</b>，不占用一天的时间、喝了就生效，是后期堆面板的主要手段；药则是迷宫里的即时补给。两者的价格差一个数量级，别买错。'}</p>
            ${ftable(['名称', '分类', '买价', '卖价', '稀有度'],
                    ['9rem', '4.4rem', '4.2rem', '4.2rem', '3.8rem'],
                    rows, { chips: cats.length > 1 ? cats : null, ph: '输入药品名筛选' })}
            <div class="jump">
                <a href="#/page/rp">
                    <div class="jp-t">体力与 RP</div>
                    <div class="jp-s">RP 上限与回复的全部来源</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">药学等级怎么刷、配方什么时候开</div>
                </a>
            </div>`;
            }

            /* ---- RF2／RF3／边境／海洋：完整药品数值表 ---- */
            if (OD && OD.rows.length) {
                const rows = OD.rows.map(r => [r.join(' '), r]);
                const OWN = {
                    rf2: '这一作的药分成两类：<b>回复 / 治疗类</b>（恢复壶、解毒药等）和<b>农用物资类</b>（营养剂、速速绿、中和剂）。后者不给人吃，是往田里用的——买之前先看清「其它效果」那一栏写的是回血还是催熟。',
                    rf3: '<b>同一个药名会出现两行，这不是重复</b>：一行是基础材料配方，另一行是用高级材料替代的配方，制造等级更高。等级越高，同样做一瓶药消耗的 RP 越少——所以配方表要连着「制造等级」一起看。',
                    rff: '边境的药品和素材在解包表里是同一段，所以这里的名字和「素材与矿石」页有重叠——同一件东西的两种用法。配方书分<b>调合白书</b>（入门）和<b>调合全书</b>（高级），买错书等于白花钱。',
                    rfo: '注意<b>元素类（火／水／风／地／光／暗）无法制作</b>，只能靠鉴定不明物品或特定敌人掉落；属性提升类（蛋白质、生命果冻、智力补品）同理。真正能自己调的是恢复系和状态治疗系。',
                };
                const keys = { rf2: 'rf2', rf3: 'rf3', rff: 'rff', rfo: 'rfo' };
                const own = OWN[keys[id] || (/^rf3/.test(id) ? 'rf3' : '')] || '';
                return intro + `
            ${stat([['药品', OD.rows.length + ' 条'], ['字段', OD.head.length + ' 项'], ['来源', 'biligame ' + id.toUpperCase() + ' 药品数据']])}
            <h2 class="h2">全药品清单</h2>
            <p class="p">${own}</p>
            ${ftableOwn(OD.head, null, rows, { ph: '输入药品名、材料或效果筛选' })}
            <div class="note">数值直接取自源表，未做推算：恢复量、配方材料、买卖价都是游戏内数值。表中「—」表示该字段在这一作不适用或源表未给，<b>不是 0</b>。</div>
            <div class="jump">
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">药学等级怎么刷、配方书什么时候买</div>
                </a>
                <a href="#/page/rp">
                    <div class="jp-t">体力与 RP</div>
                    <div class="jp-s">RP 上限与回复的全部来源</div>
                </a>
            </div>`;
            }

            if (TX) {
                return intro + `
            ${stat([['药品', TX.n + ' 件'], ['类别', TX.cats.length + ' 类']])}
            <h2 class="h2">全药品清单</h2>
            <p class="p">${TX.n} 件。${id === 'rff' ? '<b>这一作的药品与素材是同一段</b>，所以这里列出的条目和「素材与矿石」页有重叠——它们本来就是同一批东西的两种用法。' : ''}</p>
            ${ftable(['名称', '说明'], ['7.6rem'], TX.rows, { ph: '输入药品名或说明里的词筛选' })}
            <div class="jump">
                <a href="#/page/rp">
                    <div class="jp-t">体力与 RP</div>
                    <div class="jp-s">RP 上限与回复的全部来源</div>
                </a>
            </div>`;
            }

            return intro + `<div class="note">${g ? g.name : '这一作'}的物品数据还没有整理进来，所以下面没有全表。</div>
            <div class="jump">
                <a href="#/page/rp">
                    <div class="jp-t">体力与 RP</div>
                    <div class="jp-s">RP 上限与回复的全部来源</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'rf2list', group: 'item', title: '物品一览', icon: 'bottle',
        gms: ['rf2'],
        body: (g) => {
            const IT = (typeof ITEM_RF2 !== 'undefined') ? ITEM_RF2 : [];
            const EQ = eqblock(IT, { colw: '7rem' });
            const CATS = EQ.CATS;
            const hasDesc = IT.filter(r => r[2] && r[2] !== '—').length;
            /* 种子的说明写着「可以在X季播种」，这是这份表里最实在的字段 */
            const seaHit = IT.filter(r => /可以在[春夏秋冬]/.test(r[2] || '')).length;
            const seaRows = ['春', '夏', '秋', '冬'].map(se => {
                const L = IT.filter(r => (r[2] || '').indexOf('可以在' + se) >= 0).map(r => r[0].replace(/的?种子$/, ''));
                const uniq = L.filter((x, i) => L.indexOf(x) === i);
                return [se + '季（' + uniq.length + '）', uniq.join('、')];
            }).filter(x => x[0].indexOf('（0）') < 0);
            const big = CATS.map(c => [c, EQ.cnt[c]]).sort((x, y) => y[1] - x[1]).slice(0, 3);
            return `
            <p class="p">本页是<b>《符文工房2》</b>的完整物品清单，共 ${IT.length} 件、${CATS.length} 类，每件都带一句说明。这句说明不是装饰——<b>哪一季能种、是什么属性、拿来做什么</b>，都写在里面。</p>
            ${stat([['收录', IT.length + ' 件'], ['类别', CATS.length + ' 类'], ['写明播种季', seaHit + ' 件']])}

            <h2 class="h2">最有用的一栏：播种季节</h2>
            <p class="p">${seaHit} 种种子的说明直接写着「<b>可以在X季播种</b>」。这一栏比价格有用得多，因为季节是硬限制——<b>种错季就是一天白干</b>。下面按季分好了：</p>
            ${tbl(['季节', '种子'], seaRows, { leftFirst: true, cls: 'txt', colw: ['5.4rem'] })}
            <div class="note">这份分季表和别作的经验不一样，别照记忆种：<b>芜菁在这作是冬播</b>（多数作品是春），草莓是春播，马铃薯与胡萝卜是秋播。数据直接来自说明文本，不是推测。「金卷心菜种子」在表里出现两次，因为解包表里确实有<b>两条同名条目</b>（一春一冬），不是重复计数。</div>

            <h2 class="h2">说明怎么读</h2>
            <p class="p">非种子的说明短得像广告词，但定位很清楚：</p>
            ${tbl(['条目', '说明', '能读出什么'], [
                ['阔剑', '轻巧易用的剑，适合新手。', '入门武器，不是终盘货'],
                ['风之剑', '寄宿着风之魔力的剑。', '自带风属性，怕风的敌人会吃满'],
                ['卷心菜', '生吃、火烤、水煮皆可,', '食材，说明写的是吃法'],
            ], { leftFirst: true, cls: 'txt', colw: ['5rem', '11rem'] })}
            <p class="p">所以查法很直接：<b>想知道什么季节能种，搜种子名；想知道一件武器什么属性，搜它的名字看「寄宿着X之魔力」</b>。属性写在说明里的武器，强化时还能再叠一层。</p>

            <h2 class="h2">按分类查</h2>
            <p class="p">${IT.length} 件按 ${CATS.length} 类分开列，最大三类是${big.map(x => `<b>${x[0]}</b>（${x[1]} 件）`).join('、')}。点下面的按钮直接跳到对应分类；要跨类找某样东西，用搜索框——它会在全部 ${IT.length} 件里筛，筛完只剩某几类时，空掉的分类自动收起。</p>
            ${EQ.nav}
            ${eqbar(IT.length)}
            ${EQ.secs}
            <div class="note">取自《符文工房2》汉化工程的游戏文本表：<b>itemname 与 itemhelp 两张表按行序配对</b>，763 行逐条对应。<br><b>分类是按解包表里的排列顺序切出来的</b>——原表另有一列分类编号，但同一编号下混着蔬菜、料理和矿石，跟实际类别对不上，所以不用它。段边界逐条核对过名称（如 264 号起的「阔剑」到 319 号的「狂乱剑」是连续的剑类），<b>不是猜的</b>。</div>
            <div class="jump">
                <a href="#/page/potion">
                    <div class="jp-t">药品</div>
                    <div class="jp-s">回复药与营养剂的分工</div>
                </a>
                <a href="#/page/cook">
                    <div class="jp-t">料理与食材</div>
                    <div class="jp-s">器具分级与礼物策略</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'rfflist', group: 'item', title: '物品一览', icon: 'bottle',
        gms: ['rff'],
        body: (g) => {
            const IT = (typeof ITEM_RFF !== 'undefined') ? ITEM_RFF : [];
            const EQ = eqblock(IT, { colw: '7rem' });
            const CATS = EQ.CATS;
            const dayHit = IT.filter(r => /\d+\s*天/.test(r[2])).length;
            /* 件数最多的三类，用一句话带过，不做成表（与跳转条重复） */
            const big = CATS.map(c => [c, EQ.cnt[c]]).sort((x, y) => y[1] - x[1]).slice(0, 3);
            return `
            <p class="p">本页是<b>《符文工房 边境》</b>的物品清单，共 ${IT.length} 件、${CATS.length} 类。这一作的物品表<b>能按类别切开</b>——解包文本里物品是成段排列的，种子一段、鱼一段、料理一段、武器一段，段与段之间的边界很清楚。</p>
            ${stat([['收录', IT.length + ' 件'], ['类别', CATS.length + ' 类'], ['写明天数', dayHit + ' 件']])}

            <h2 class="h2">种子的说明最好用</h2>
            <p class="p">边境的作物说明几乎都写成「<b>某季蔬菜。N天即可收获</b>」的格式，有的还会补一句「收获后 N 天可再次收获」。这一句就是种田的全部计划依据——<b>按季节排一张轮作表，比记住每种作物叫什么更有用</b>。全表有 ${dayHit} 件物品的说明里带天数，多数是种子。</p>
            <div class="note">这一作的季节是硬限制：<b>换季时上一季的作物会枯死</b>。所以规划时先看季，再看天数，最后才看卖价。</div>

            <h2 class="h2">按分类查</h2>
            <p class="p">${IT.length} 件按 ${CATS.length} 类分开列，件数最多的是${big.map(x => `<b>${x[0]}</b>（${x[1]} 件）`).join('、')}。点下面的按钮直接跳到对应分类；要跨类找某样东西，用搜索框——它会在全部 ${IT.length} 件里筛，筛完只剩某几类时，空掉的分类自动收起。</p>
            ${EQ.nav}
            ${eqbar(IT.length)}
            ${EQ.secs}
            <div class="note">取自「边境汉化」工程表的日／中对照行：名字段 ${IT.length} 条与说明段 745 条<b>按索引一一对应</b>（已逐条核对）。原名一律用汉化组的定稿译名，未做二次改写。</div>
            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">本作 ${(typeof RFF_MON !== 'undefined' ? RFF_MON.length : 0)} 条魔物的属性与掉落</div>
                </a>
                <a href="#/page/cook">
                    <div class="jp-t">料理与食材</div>
                    <div class="jp-s">器具分级与礼物策略</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'rf3list', group: 'item', title: '物品一览', icon: 'bottle',
        gms: ['rf3', 'rf3sp'],
        body: (g) => {
            const IT = (typeof ITEM_RF3 !== 'undefined') ? ITEM_RF3 : [];
            const EQ = eqblock(IT, { colw: '7rem' });
            const CATS = EQ.CATS;
            const withTxt = IT.filter(r => (r[3] || r[2]) !== '—').length;
            const big = CATS.map(c => [c, EQ.cnt[c]]).sort((x, y) => y[1] - x[1]).slice(0, 2);
            return `
            <p class="p">本页是<b>《符文工房3》</b>的完整物品清单，共 ${IT.length} 件、${CATS.length} 类。这一作的说明写得比前后几作都厚——不是一句「好吃的蔬菜」，而是<b>三到四行带点玩笑的正文</b>，所以顺带把全文也收进来了。</p>
            ${stat([['收录', IT.length + ' 件'], ['类别', CATS.length + ' 类'], ['带说明', withTxt + ' 件']])}

            <h2 class="h2">说明里最有用的两类话</h2>
            <p class="p">一是<b>素材的出处</b>。掉落素材的说明会写明它从哪只怪身上来，比如「兽人的破布」「海盗哥布林的布」「维京肩甲」——名字本身就是线索，配合说明能直接反查该刷谁。</p>
            <p class="p">二是<b>武器的属性</b>。凡带「烈焰、寒冰、风、大地、光、暗」字样的武器，说明里通常有一句「寄宿着X之魔力」，那就是它自带的攻击属性。不带属性字样的多为无属性——<b>打无弱点的敌人时，无属性反而更稳</b>。</p>

            <h2 class="h2">按分类查</h2>
            <p class="p">${IT.length} 件按 ${CATS.length} 类分开列，最大两类是${big.map(x => `<b>${x[0]}</b>（${x[1]} 件）`).join('和')}。点下面的按钮直接跳到对应分类；要跨类找某样东西，用搜索框——它会在全部 ${IT.length} 件里筛，筛完只剩某几类时，空掉的分类自动收起。</p>
            ${EQ.nav}
            ${eqbar(IT.length)}
            ${EQ.secs}
            <div class="note">取自《符文工房3》解包文本：名字表 869 条、说明表 888 条，<b>两表按索引一一对应</b>（已抽样核对：卷心菜、樱芜菁、少女蜜瓜三组全部对上）。首条「(無し)」是空位，已剔除。<br>分类不是游戏给的，是<b>按解包表里的排列顺序</b>切出来的：作物一段、草一段、刺身一段、料理一段、武器一段……同一段内的物品性质一致，边界很清楚。</div>
            <div class="jump">
                <a href="#/page/festival">
                    <div class="jp-t">年度节日</div>
                    <div class="jp-s">本作全年日程与生日表</div>
                </a>
                <a href="#/page/cook">
                    <div class="jp-t">料理与食材</div>
                    <div class="jp-s">器具分级与礼物策略</div>
                </a>
            </div>`;
        }
    },
    /* ================= 魔物喜好与素材出处 ================= */
    {
        key: 'gift', group: 'life', title: '魔物喜好', icon: 'gift',
        gms: ['rf4', 'rf4sp', 'rf5'],
        body: g => {
            const is5 = g.id === 'rf5';
            const G4 = (typeof GIFT_RF4 !== 'undefined') ? GIFT_RF4 : [];
            const G5 = (typeof GIFT_RF5 !== 'undefined') ? GIFT_RF5 : [];

            /* 喜好道具的通用度：多少只魔物吃这一样，直接决定「背包里该常备什么」 */
            const freq = (rows, from) => {
                const m = {};
                rows.forEach(r => r.slice(from).forEach(x => { if (x) m[x] = (m[x] || 0) + 1; }));
                return Object.entries(m).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
            };

            if (is5) {
                const ok = G5.filter(r => r[1] === '可抓');
                const no = G5.filter(r => r[1] !== '可抓');
                const have = G5.filter(r => r[3]);
                const f5 = freq(G5, 3);
                const cf5 = k => { const x = f5.find(y => y[0] === k); return x ? x[1] : 0; };
                const rates = ok.map(r => parseInt(r[2], 10)).filter(v => !isNaN(v));
                const lo = Math.min.apply(null, rates), hi = Math.max.apply(null, rates);
                const top = ok.filter(r => parseInt(r[2], 10) === hi);
                const loN = ok.filter(r => parseInt(r[2], 10) === lo).length;

                return `
                <h2 class="h2">喂对东西，驯服才成立</h2>
                <p class="p">这一作的魔物伙伴不是打赢就收，而是<b>先投喂</b>：递一样它喜欢的东西，驯服成功率才会明显上来。表里给的是<b>初始捕捉成功率</b>——在不喂任何东西、不开 seed 环的情况下，一次投喂判定通过的概率。seed 环能临时把概率推高，但那是消耗品，常驻手段还是记住它吃什么。</p>
                ${stat([['收录', G5.length + ' 只'], ['可抓', ok.length + ' 只'], ['不可抓', no.length + ' 只']])}
                <p class="p">可抓的 ${ok.length} 只里，<b>${have.length} 只标了喜好道具</b>，其余没有记录。捕捉率区间是 <b>${lo}% ～ ${hi}%</b>：到顶的 ${hi}% 只有 ${top.length} 只，最末一档 ${lo}% 是 ${loN} 只。剩下 ${no.length} 只不可抓，它们<b>没有喜好道具</b>——表里那四列是空的，不是漏填。</p>

                <h2 class="h2">皮毛是通用货币</h2>
                <p class="p">把 ${G5.length} 只的喜好道具按出现次数排一遍，结论很直接：</p>
                ${tbl(['喜好道具', '多少只吃'], f5.slice(0, 10).map(([k, n]) => [k, n + ' 只']), { leftFirst: true, cls: 'txt', colw: ['11rem', '6rem'] })}
                <div class="key"><b>毛皮与上等皮毛各有 ${cf5('毛皮')} 只吃</b>，占全部魔物的 ${Math.round(cf5('毛皮') / G5.length * 100)}%。这两样在前期就能靠打兽人系稳定拿到，所以<b>背包里常驻一叠皮毛，等于对三分之一的魔物自带钥匙</b>。第三名鸟羽毛 ${cf5('鸟羽毛')} 只，档次立刻掉下来。</div>

                <h2 class="h2">全部 ${G5.length} 只魔物</h2>
                <p class="p">按名字或喜好道具搜索。「不可抓」的也留在表里——它们会掉素材，查掉落的时候有用。</p>
                ${ftableOwn(['魔物', '捕捉率', '喜好道具'], ['7.4rem', '4.4rem'], G5.map(r => [
                    r.slice(0, 3).concat(r.slice(3).filter(Boolean)).join(' '),
                    [
                        r[0] + (r[1] === '可抓' ? '' : ' <span class="txc">不可抓</span>'),
                        r[2] ? '<b>' + r[2] + '%</b>' : '<span class="mon-no">—</span>',
                        r.slice(3).filter(Boolean).join('、') || '<span class="mon-no">—</span>',
                    ],
                ]), { ph: '输入魔物名或喜好道具' })}
                <div class="note">取自《RF5 全怪物喜好表》272 行，按名字去重后 ${G5.length} 只。原表「喜好道具 1～4」列里的「无」按空处理；捕捉率为空的行是解包表里就没有值（多为不可抓个体）。<b>捕捉率是初始值</b>，实际投喂会被喜好、等级差、seed 环修正，本页只给初始值，不推算最终概率。</div>`;
            }

            /* ---- RF4 ---- */
            const have = G4.filter(r => r[1]);
            const none = G4.filter(r => !r[1]);
            const f4 = freq(G4, 1);
            const cf4 = k => { const x = f4.find(y => y[0] === k); return x ? x[1] : 0; };
            return `
            <h2 class="h2">喂对东西，驯服才成立</h2>
            <p class="p">这一作的魔物伙伴靠投喂驯服：递一样它喜欢的东西，成功率才会明显上来。表里每只最多给三样，<b>清单是固定的</b>——同一只怪喂错东西，喂多少次都不会变成功，只是白花素材。</p>
            ${stat([['收录', G4.length + ' 只'], ['有喜好', have.length + ' 只'], ['无喜好', none.length + ' 只']])}
            <p class="p">${none.length} 只没有喜好道具，全是<b>Boss、机械兵与宝箱类</b>（远古之骨、要塞战车改、塞克斯系列、各种宝箱、天堂之门…）——它们本来就不给驯服，表里那三列是空的。</p>

            <h2 class="h2">皮毛与胶：两样万金油</h2>
            <p class="p">把 ${G4.length} 只的喜好道具按出现次数排一遍：</p>
            ${tbl(['喜好道具', '多少只吃'], f4.slice(0, 10).map(([k, n]) => [k, n + ' 只']), { leftFirst: true, cls: 'txt', colw: ['11rem', '6rem'] })}
            <div class="key"><b>毛皮 ${cf4('毛皮')} 只、胶 ${cf4('胶')} 只、魔力结晶 ${cf4('魔力结晶')} 只、蛋糕 ${cf4('蛋糕')} 只</b>。毛皮依旧第一，而且是唯一一个「打怪自然掉、掉落率高、用量又大」的——兽人系遍地都是。胶和魔力结晶更偏中期，蛋糕要靠料理做。</div>

            <h2 class="h2">全部 ${G4.length} 只魔物</h2>
            <p class="p">按名字或喜好道具搜索。没有喜好的那些留在表里，方便你确认「这只确实不给驯服」，别在它身上浪费素材。</p>
            ${ftableOwn(['魔物', '喜好 1', '喜好 2', '喜好 3'], ['7rem', 'auto', 'auto', 'auto'], G4.map(r => [
                r.filter(Boolean).join(' '),
                [
                    r[0],
                    r[1] || '<span class="mon-no">—</span>',
                    r[2] || '<span class="mon-no">—</span>',
                    r[3] || '<span class="mon-no">—</span>',
                ],
            ]), { ph: '输入魔物名或喜好道具' })}
            <div class="note">取自《RF4 全怪物喜好表》998 行（含各级变体与重复行），按名字去重后 ${G4.length} 只，原表的 <code>???</code> 占位行已剔除。原表只给「喜好 1～3」三格，没有捕捉率——<b>RF4 不给初始概率数值</b>，所以本页不编造。</div>`;
        }
    },

    /* ================= 村民喜好（人，不是魔物） ================= */
    {
        key: 'npcgift', group: 'life', title: '村民喜好', icon: 'users',
        gms: ['rf1', 'rf2', 'rf3', 'rf3sp', 'rff', 'rfo', 'rf4', 'rf4sp', 'rf5'],
        body: g => {
            if (g.id !== 'rf4' && g.id !== 'rf4sp' && g.id !== 'rf5') return giftPage(g);
            const is5 = g.id === 'rf5';
            const P4 = (typeof NPC_RF4 !== 'undefined') ? NPC_RF4 : [];
            const P5 = (typeof NPC_RF5 !== 'undefined') ? NPC_RF5 : [];
            const H5 = (typeof HATE_RF5 !== 'undefined') ? HATE_RF5 : [];
            const cut = (arr, n) => !arr.length ? '<span class="mon-no">—</span>'
                : arr.length > n
                    ? arr.slice(0, n).join('、') + ` <span class="txc">等 ${arr.length} 样</span>`
                    : arr.join('、');

            if (is5) {
                const marry = P5.filter(r => r[2] && r[2].length);
                const cntHate = k => P5.filter(r => r[5].indexOf(k) >= 0 || r[6].indexOf(k) >= 0).length;
                const hate = H5.map(k => [k, cntHate(k)]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
                const avgFav = Math.round(P5.reduce((s, r) => s + r[4].length, 0) / P5.length);
                const per = P5.map(r => [r[0], r[5].filter(x => H5.indexOf(x) < 0)]);
                const worst = per.slice().sort((a, b) => b[1].length - a[1].length);
                const clean = per.filter(x => !x[1].length);
                const vfN = P5.reduce((s, r) => s + r[3].length, 0);
                const nbN = P5.reduce((s, r) => s + r[6].length, 0);
                const vfMin = Math.min.apply(null, P5.map(r => r[3].length));
                const vfMax = Math.max.apply(null, P5.map(r => r[3].length));
                const nfAvg = Math.round(P5.reduce((s, r) => s + r[5].length, 0) / P5.length);
                const nbMax = Math.max.apply(null, P5.map(r => r[6].length));

                return `
                <h2 class="h2">四份清单，只有两份值得背</h2>
                <p class="p">RF5 的每个村民在解包表里都挂着四份清单：<b>超喜欢、喜欢、不喜欢、极讨厌</b>。这四份的长度差得很远——喜欢清单动辄二十几样，等于「按类别喜欢」；超喜欢和极讨厌才是真正带个人色彩的，加起来一个人不到十样。</p>
                <p class="p">所以送礼的正确姿势不是查全表，是<b>记住两样东西：他最想要的那五样，和他绝对不能碰的那两三样</b>。中间那档「喜欢」随你怎么送，反正一大片都吃。</p>
                ${tbl(['档位', '每人多少样', '送礼时怎么用'], [
                    ['超喜欢', `平均 ${(vfN / P5.length).toFixed(1)} 样，${vfMin}～${vfMax} 样`, '生日和日常送礼的首选。数量少、固定、好记，背包里腾出几格专放这几样就够'],
                    ['喜欢', `平均 ${avgFav} 样`, '宽到没有筛选价值——基本等于「这一类他都吃」。想省事就照着这一档送'],
                    ['不喜欢', `平均 ${nfAvg} 条，大半是鱼`, '扣一点好感，但不会翻脸。手滑送了不用太在意'],
                    ['极讨厌', `平均 ${(nbN / P5.length).toFixed(1)} 样，最多 ${nbMax} 样`, `明确掉好感。这 ${nbN} 条是必须避开的部分`],
                ], { leftFirst: true, colw: ['5rem', '11rem'] })}
                ${stat([['收录村民', P5.length + ' 人'], ['可婚对象', marry.length + ' 人'], ['全员雷区', H5.length + ' 样']])}
                <div class="key">只有 ${marry.length} 个人带「节日花」和「婚后每日礼物」两份清单——其余 ${P5.length - marry.length} 位是店主、长辈、孩子和不可攻略角色，解包表里那两栏本来就是空的，不是漏收。</div>

                <h2 class="h2">${H5.length} 样垃圾，至少 ${Math.min.apply(null, hate.map(x => x[1]))} 个人都讨厌</h2>
                <p class="p">把 ${P5.length} 个人的「不喜欢」和「极讨厌」并起来数一遍，出现了很整齐的一幕：有 ${H5.length} 样东西几乎人人命中。这不是巧合——它们就是游戏里被标成<b>垃圾</b>的那一类。</p>
                ${tbl(['物品', '几个人讨厌'], hate.map(([k, n]) => [k, `${n} / ${P5.length} 人`]), { leftFirst: true, colw: ['10rem', '7rem'] })}
                <div class="key">这份清单的实际用途不是「送礼避开」，而是<b>反查背包里的垃圾</b>。石头、树枝、枯草、杂草、空罐、废铁、高筒靴——这些东西在田里和路边随手就捡，卖掉只值几个金币，但只要你把它们当礼物递出去，对方的好感是往下走的。<b>整理背包时把这一档单独塞一格，送礼时就不会拿错。</b></div>

                <h2 class="h2">每人一张速查卡</h2>
                <p class="p">下面这张表只放三列：<b>生日礼物</b>、<b>超喜欢</b>、<b>极讨厌</b>。生日礼物是解包表单独给的一件东西（每年生日送它收益最高）；超喜欢和极讨厌是日常送礼的两端。要查完整的「喜欢」清单，用下面的折叠区。</p>
                ${ftableOwn(['村民', '生日礼物', '超喜欢', '极讨厌'], ['6.4rem', '8rem', 'auto', '8rem'],
                    P5.map(r => [
                        [r[0], r[1], r[3].join(' '), r[6].join(' ')].join(' '),
                        [
                            npcLink('rf5', r[0]) + (r[2].length ? '' : ' <span class="txc">不可婚</span>'),
                            r[1] || '<span class="mon-no">—</span>',
                            cut(r[3], 6),
                            cut(r[6], 3),
                        ],
                    ]), { ph: '输入村民名或物品名', cls: 'npc' })}

                <details class="mon-fold">
                    <summary>展开 ${marry.length} 位可婚对象的节日花与婚后日常礼物</summary>
                    ${tbl(['村民', '节日花', '婚后每日礼物'], marry.map(r => [npcLink('rf5', r[0]), r[2].join('、'), r[7].join('、')]), { leftFirst: true, colw: ['5.6rem', '10rem'] })}
                    <div class="note" style="margin-top:.8rem">这三样东西的用法各不相同：<b>节日花</b>是节日当天送的花（三种，对应不同季节的品种），<b>婚后每日礼物</b>是结婚以后每天递给对方的那一份——它是固定清单，不是你挑的。</div>
                </details>

                <details class="mon-fold">
                    <summary>展开全部 ${P5.length} 人的「喜欢」清单（平均 ${avgFav} 样一个人）</summary>
                    <div class="txt-list">${P5.map(r => `<p><b>${r[0]}</b>：${r[4].join('、') || '<span class="mon-no">—</span>'}</p>`).join('')}</div>
                </details>

                <details class="mon-fold">
                    <summary>展开「个人禁忌」——去掉 ${H5.length} 样通用垃圾之后，每人真正独有的雷区</summary>
                    <p class="p" style="padding:0 0 .6rem">上面那 ${H5.length} 样是人人讨厌，记不记都行；<b>这一份才是各人自己的雷区</b>。${worst.length && worst[0][1].length ? `最需要注意的是 <b>${worst[0][0]}</b>，去掉垃圾后还有 ${worst[0][1].length} 样东西不能送——他讨厌的是一整批鱼。` : ''}${clean.length ? `另有 ${clean.length} 人（${clean.map(x => x[0]).join('、')}）除了垃圾之外什么都不挑，随便送。` : ''}</p>
                    <div class="txt-list">${per.map(([n, xs]) => `<p><b>${n}</b>：${xs.join('、') || '<span class="mon-no">除垃圾外无禁忌</span>'}</p>`).join('')}</div>
                </details>

                <div class="note">取自《RF5_Data 数据解包汉化版》的 <code>NPCGiftData</code> 表（${P5.length} 个角色块，每块六行）。原表是英文 1.0.1 版，物品名用同文件的「译名表」（1576 条英中对照）转成简中；译名表里缺的几个按日文原名补齐。<br><b>人名统一到站内口径</b>：解包表按英文名给出的译名与人物名册不一致，本页按名册显示——芙卡→<b>芙佳</b>、Cecil→<b>塞西尔</b>、Ryker→<b>流卡</b>、达洛奇→<b>道格</b>。对照表写在 <code>_build_npc.py</code>，所以表里的人名可以直接点进人物档案。<br>「儿子」「女儿」「儿子／女儿」三条是解包表的占位条目（对应孩子那几位），原表没有拆开，本页照原样保留、不做链接。原表中以 <code>-</code> 表示的「无」按空处理。<br>「超喜欢」「喜欢」等档位名称沿用解包字段 <code>VeryFavoriteItem / FavoriteItem / NotFavoriteItem / NotFavoriteBadlyItem</code>，<b>本页不给具体 FP 数值</b>——RF5 的解包表没有把这几档换算成数字，所以这里只描述方向，不编造档差。</div>

                <div class="jump">
                    <a href="#/page/gift">
                        <div class="jp-t">魔物喜好</div>
                        <div class="jp-s">魔物伙伴靠投喂驯服，另一套完全不同的清单</div>
                    </a>
                    <a href="#/page/love">
                        <div class="jp-t">恋爱与结婚</div>
                        <div class="jp-s">好感怎么涨、告白条件与婚后生活</div>
                    </a>
                </div>`;
            }

            /* ---- RF4 ---- */
            const vf4 = P4.reduce((s, r) => s + r[1].length, 0);
            const fav4 = P4.reduce((s, r) => s + r[2].length, 0);
            const dis4 = P4.reduce((s, r) => s + r[3].length, 0);
            const gold = P4.filter(r => r[1].some(x => x.indexOf('金') >= 0));
            const dn = {};
            P4.forEach(r => r[3].forEach(x => { dn[x] = (dn[x] || 0) + 1; }));
            const dtop = Object.entries(dn).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const maxFav = P4.slice().sort((a, b) => b[2].length - a[2].length)[0];
            const noFav = P4.filter(r => !r[2].length);

            return `
            <h2 class="h2">好感是分档的，送礼前先认清档位</h2>
            <p class="p">RF4 的村民喜好在解包表里带着明确的 <b>FP 数值</b>，这一点比 RF5 干净：同一件礼物递过去，落在哪一档、涨多少点，都是写死的。看懂这张分档表，剩下的就是查名字。</p>
            ${tbl(['档位', 'FP', '对应什么'], [
                ['超喜欢', '<b>+15</b>', `每人 ${(vf4 / P4.length).toFixed(1)} 样。多半是金作物、稀有矿石、特定料理——值钱或难做的东西`],
                ['喜欢（料理）', '<b>+9</b>', '成品料理、加工品，量最大的一档'],
                ['喜欢（普通）', '<b>+6</b>', '普通作物、素材，随手送也能涨'],
                ['不喜欢', '<b>−5</b>', '扣一点，不影响大局'],
                ['讨厌', '<b>−10</b>', `每人平均 ${(dis4 / P4.length).toFixed(1)} 样，明确的雷区`],
            ], { leftFirst: true, colw: ['6.4rem', '4.4rem'] })}
            ${stat([['收录村民', P4.length + ' 人'], ['超喜欢条目', vf4 + ' 条'], ['喜欢条目', fav4 + ' 条']])}
            <div class="key">注意到没有：<b>没有「+3」这种中间档</b>。要么 15，要么 9 或 6，要么往下扣。所以 RF4 送礼的策略只有一句话——<b>能送超喜欢就送超喜欢，实在没有就挑一样料理（+9），别送不认识的东西</b>。</div>

            <h2 class="h2">金作物是这一作的硬通货</h2>
            <p class="p">把 ${P4.length} 个人的超喜欢清单按出现次数排一遍，第一名全是「金」字开头的作物：金芜菁、金卷心菜王、金南瓜、超级金马铃薯……<b>${gold.length} / ${P4.length} 人的超喜欢清单里含金作物</b>。</p>
            <p class="p">原因不难理解：金作物要靠金色种子种出来，本身产量低、价格高，在游戏里就是「拿得出手的东西」。所以中期以后，<b>田里留一小块地专种金色种子，收成就是通用礼物</b>——不用记谁喜欢什么，一人一个金芜菁，全体 +15。</p>
            <div class="key">但金作物不是万能：上面那 ${gold.length} 人之外，还有 ${P4.length - gold.length} 人对此无感。他们的超喜欢集中在<b>矿石、核、鱼和特定料理</b>上——这些人得单独记，翻下面的表。</div>

            <h2 class="h2">芜菁是重灾区</h2>
            <p class="p">讨厌清单共 ${dis4} 条，按人数排下来，最扎眼的是三样芜菁制品——各有 3 个人明确讨厌，是并列第一：</p>
            ${tbl(['物品', '几个人讨厌'], dtop, { leftFirst: true, colw: ['10rem', '7rem'] })}
            <div class="note" style="margin-top:.6rem">表里只列前 8 条。第 4 名往后各只有 2 人讨厌，已经不成规律；第 1～3 名这三样芜菁制品是唯一达到 3 人的。</div>
            <div class="key">芜菁本身是最便宜的作物，很多人拿它当「随手礼」送——正好撞在枪口上。<b>芜菁天堂、芜菁酸菜、腌红白芜菁这三样，宁可不送也别送</b>；白送一个芜菁（−5）都比送芜菁天堂（−10）强。</div>

            <h2 class="h2">每人一张速查卡</h2>
            <p class="p">主表放「超喜欢」和「讨厌」两列。喜欢清单太长（${maxFav[0]}一个人就有 ${maxFav[2].length} 样），单独放在下面的折叠区里。</p>
            ${ftableOwn(['村民', '超喜欢', '讨厌'], ['6.4rem', 'auto', '10rem'],
                P4.map(r => [
                    [r[0], r[1].join(' '), r[3].join(' ')].join(' '),
                    [npcLink('rf4', r[0]), cut(r[1], 8), cut(r[3], 4)],
                ]), { ph: '输入村民名或物品名', cls: 'npc' })}

            <details class="mon-fold">
                <summary>展开全部 ${P4.length} 人的「喜欢」清单（共 ${fav4} 条）</summary>
                ${noFav.length ? `<p class="p" style="padding:.4rem 0 .8rem">${noFav.map(x => `<b>${x[0]}</b>`).join('、')} 在原表里没有逐条的「喜欢」记录——他们的 Likes 行填的是整类代码（比如「喜欢所有蔬菜」），解包表没有把类别拆成具体物品，所以本页只能留空，不是漏收。</p>` : ''}
                <div class="txt-list">${P4.map(r => `<p><b>${r[0]}</b>：${r[2].join('、') || '<span class="mon-no">原表为整类，未拆条</span>'}</p>`).join('')}</div>
            </details>

            <div class="note">取自《RF4 数据解包汉化版 Datamining Compendium》的「村民喜好」表（110 行，${P4.length} 人 × 四行一组）。物品名用同文件的「Item Values」表（1098 条英中对照）转成简中，《RF4S 简体》列直接作为中文名。<br>原表里有 <code>#8100</code>～<code>#8114</code> 这类分类代码，表示「对某一整类物品的反应」（多为 FP 0 的中性），因为无法可靠还原成具体物品，<b>本页未收录</b>；同理，FP 为 0 的条目一律不进表。<br><b>人名统一到站内口径</b>：这份解包表用的是它自己一套译名（沃尔卡农／基尔／巴特／铃华／艾尔米娜达／布罗萨姆／雷欧／赛尔泽薇德／多娜），人物名册用的是 wiki 的（沃卡农／奇尔／巴德／铃芳／艾露米娜塔／巴洛索姆／雷昂／瑟尔泽薇德／托娜）。本页按后者显示，对照表写在 <code>_build_npc.py</code> 里，所以表里的人名可以直接点进人物档案。<br><b>其中有四条不是人名</b>：「女儿」指双胞胎诺埃尔与露娜（解包表把两人合为一条），「儿子」原表另有一条、但这一作的子代是双胞胎女儿，归属未说明；「旅行者」是英文版泛指的 Traveler（原表中文列写作「男性旅行者」）。<b>「幻想的雾香」这次查清了</b>：她在两张解包表里都排在 27 位村民的最后（多娜之后），与英文原表 <code>0x1A</code> 的「Mistress Trupin」位置一一对应；喜好清一色是大芜菁、大樱芜菁、大金芜菁、金刚花、大金刚花，火水抗性都写着 100%。Mistress Trupin 是四代里<b>没有立绘</b>的 NPC，管的是「改玩家名字」，满口芜菁；名字本身是 Mist + Turnip 的变位，系列玩家普遍认为她就是一代的密丝特。中文解包把 Mist 意译成了「雾香」。wiki 没有她的人物页、日文名也没核实，所以站内暂不单独立条，这四行都不做链接。</div>

            <div class="jump">
                <a href="#/page/gift">
                    <div class="jp-t">魔物喜好</div>
                    <div class="jp-s">魔物伙伴靠投喂驯服，另一套完全不同的清单</div>
                </a>
                <a href="#/page/love">
                    <div class="jp-t">恋爱与结婚</div>
                    <div class="jp-s">好感怎么涨、告白条件与婚后生活</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'source', group: 'item', title: '素材出处与掉落', icon: 'gem',
        gms: ['rf4', 'rf4sp', 'rf5'],
        body: g => {
            const is5 = g.id === 'rf5';
            const S4 = (typeof SRC_RF4 !== 'undefined') ? SRC_RF4 : [];
            const M4 = (typeof MDROP_RF4 !== 'undefined') ? MDROP_RF4 : [];
            const D5 = (typeof DROP_RF5 !== 'undefined') ? DROP_RF5 : [];

            if (is5) {
                /* 稀有掉落：按素材名聚合，同时记住「谁掉」——只留最低概率 */
                const rareMap = {};
                D5.forEach(r => {
                    for (let i = 0; i < 4; i++) {
                        const n = r[3 + i * 2], p = r[4 + i * 2];
                        if (!n || typeof p !== 'number' || p >= 1) continue;
                        if (!rareMap[n]) rareMap[n] = { p, who: [] };
                        if (p < rareMap[n].p) rareMap[n].p = p;
                        if (rareMap[n].who.indexOf(r[0]) < 0) rareMap[n].who.push(r[0]);
                    }
                });
                const rareList = Object.keys(rareMap)
                    .map(n => [n, rareMap[n].p, rareMap[n].who.join('、')])
                    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
                return `
                <h2 class="h2">掉落是按概率给的，不是「打够数量就掉」</h2>
                <p class="p">这一作的掉落表每只魔物最多四件掉落，各带一个独立概率。数据来自 Hyperwiki 的实测统计，${D5.length} 只合计列出 ${D5.reduce((a, r) => a + [r[3], r[5], r[7], r[9]].filter(Boolean).length, 0)} 条掉落记录。</p>
                ${stat([['收录魔物', D5.length + ' 只'], ['掉落记录', D5.reduce((a, r) => a + [r[3], r[5], r[7], r[9]].filter(Boolean).length, 0) + ' 条'], ['低于 1%', rareList.length + ' 种']])}
                <p class="p">先看最容易亏时间的地方——<b>概率低于 1% 的掉落共 ${rareList.length} 种</b>。这些不是「刷一刷就有」，是按期望值算下来要打上百只的量：</p>
                ${tbl(['素材', '概率', '谁掉'], rareList.slice(0, 12).map(([n, p, who]) => [n, '<b>' + p + '%</b>', who]), { leftFirst: true, cls: 'txt', colw: ['8rem', '4.6rem'] })}
                <div class="key">最右边那列是关键：<b>同一件稀有素材往往只有一两个来源</b>。看到某件毕业素材卡在这里，先确认它掉不掉在别的怪身上——表里能搜。真的只有一个来源，那就别指望「顺手打到」，得专门去刷。</div>

                <h2 class="h2">全部 ${D5.length} 只魔物的掉落</h2>
                <p class="p">按魔物名、地点或素材名搜索。地点给两个：前者是主线迷宫，后者多为后期或里格巴斯迷宫出现的位置。</p>
                ${ftableOwn(['魔物', '地点', '掉落（概率）'], ['7.4rem', 'auto'], D5.map(r => {
                    const items = [];
                    for (let i = 0; i < 4; i++) {
                        const n = r[3 + i * 2], p = r[4 + i * 2];
                        if (n) items.push(n + (p !== '' && p !== null ? ' <span class="dr">' + p + '%</span>' : ''));
                    }
                    return [
                        r[0] + ' ' + r[1] + ' ' + r[2] + ' ' + items.join(' ').replace(/<[^>]+>/g, ''),
                        [
                            r[0],
                            [r[1], r[2]].filter(Boolean).join('／') || '<span class="mon-no">—</span>',
                            items.join('　') || '<span class="mon-no">—</span>',
                        ],
                    ];
                }), { ph: '输入魔物、地点或素材' })}
                <div class="note">取自《RF5 掉率表 Hyperwiki》226 行，剔除表头与「黑暗来客与后续 boss」这条汇总行后 ${D5.length} 只。原表概率是小数（0.12），本页已换成百分数（12%）；<b>同一条掉落可能同时出现在两只怪身上</b>，所以「低于 1%」按素材去重后只有 ${rareList.length} 种，比记录条数少。</div>`;
            }

            /* ---- RF4 ---- */
            /* 副行只留日文名：英文名一并塞进来会把行高撑成两三行 */
            const sub = (cn, jp) => (jp && jp !== cn) ? '<span class="mon-desc">' + jp + '</span>' : '';
            return `
            <h2 class="h2">素材有两条路：地上捡，或是打出来</h2>
            <p class="p">RF4 的素材来源分得很开：一部分<b>靠采集与生产</b>（挖矿、砍树、钓鱼、种地、商店买、冶炼失败），另一部分<b>只在特定魔物身上</b>。两张表分开列，因为查法完全不同——前者看地图，后者看怪。</p>
            ${stat([['采集合成类', S4.length + ' 件'], ['魔物来源', M4.length + ' 只'], ['覆盖', '主线至终盘']])}

            <h2 class="h2">采集与生产：${S4.length} 件素材从哪来</h2>
            <p class="p">「取得方式」一列是这一份资料最有价值的部分：它把「挖掘」「砍伐」「钓鱼」这类泛泛的说法，细化到了<b>具体地图的哪一类采集点</b>，甚至标了「罕见」。</p>
            ${ftableOwn(['素材', '取得方式'], ['9rem'], S4.map(r => [
                r.join(' '),
                [
                    r[0] + (sub(r[0], r[1])),
                    r[3] || '<span class="mon-no">—</span>',
                ],
            ]), { ph: '输入素材名或取得方式' })}
            <div class="note">取自《符文工厂 4 素材出处》收集品表 175 行。<b>日文名用小字附在素材名下方</b>；原表的英文名（欧美版）没有单列——太占宽度，但已并入搜索索引，<b>输入英文名同样能搜到</b>。表里的「１０倍铁」用的是全角数字，这是原表写法，未改。</div>

            <h2 class="h2">魔物：${M4.length} 只怪在哪、掉什么</h2>
            <p class="p">反向查：<b>缺某件素材时，先搜素材名</b>，就知道该去刷哪只怪；搜地点名，就能看这一片区域有哪些目标。掉落一列按原资料给的顺序排，<b>靠前的通常概率更高</b>——但这份资料没给具体概率，本站不补数字。</p>
            ${ftableOwn(['魔物', '地点', '掉落'], ['7.4rem', 'auto'], M4.map(r => [
                r.join(' '),
                [
                    r[0] + (sub(r[0], r[1])),
                    r[3] || '<span class="mon-no">—</span>',
                    r[4] || '<span class="mon-no">—</span>',
                ],
            ]), { ph: '输入魔物、地点或素材' })}
            <div class="note">取自同一份资料的怪物表 208 行，去掉无名字的汇总行后 ${M4.length} 只。<b>掉落列的顿号是原文分隔</b>，不代表先后概率；「深渊之门／慈爱之门」这类传送门只掉单一结晶，属于典型的定点刷取目标。</div>

            <div class="jump">
                <a href="#/page/material">
                    <div class="jp-t">素材与矿石</div>
                    <div class="jp-s">怎么拿、拿多少、什么时候该囤</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">装备打造·毕业套</div>
                    <div class="jp-s">这些素材最后都进了哪件装备</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'perfume', group: 'item', title: '香水与喜好', icon: 'bottle',
        gms: ['rf3', 'rf3sp'],
        body: () => {
            const P3 = (typeof PERF_RF3 !== 'undefined') ? PERF_RF3 : { scents: [], chars: [], m: [] };
            const SC = P3.scents, CH = P3.chars;
            if (!SC.length) return '<p class="p">香水数据未加载。</p>';

            /* 每款香味有几个人喜欢 / 每个人喜欢几款 */
            const byScent = SC.map((s, j) => ({
                s,
                list: CH.filter((c, i) => P3.m[j][i]),
            }));
            const byChar = CH.map((c, i) => ({
                c,
                list: SC.filter((s, j) => P3.m[j][i]),
            }));
            const male = byScent.find(x => x.s === '男士');
            const female = byScent.find(x => x.s === '女士');
            const avg = (byChar.reduce((a, x) => a + x.list.length, 0) / CH.length).toFixed(1);
            const picky = byChar.filter(x => x.list.length === 1);
            const easy = byChar.slice().sort((a, b) => b.list.length - a.list.length).slice(0, 3);
            const rare = byScent.slice().sort((a, b) => a.list.length - b.list.length);

            return `
            <h2 class="h2">香水是这一作最省事的送礼</h2>
            <p class="p">RF3 的居民对香水有明确的偏好，而香水可以自己做——这意味着<b>不用满世界找指定道具，只要知道对方喜欢哪一款香味</b>。全表是 ${SC.length} 款香味 × ${CH.length} 位角色的对应关系，共 ${byScent.reduce((a, x) => a + x.list.length, 0)} 个「喜欢」。</p>
            ${stat([['香味', SC.length + ' 款'], ['角色', CH.length + ' 位'], ['平均喜好', avg + ' 款'], ['最挑的', picky.length + ' 位']])}

            <h2 class="h2">男女款各占一半，送错等于白送</h2>
            <p class="p">第一件事要先看清：<b>${male.s}款有 ${male.list.length} 人喜欢，${female.s}款有 ${female.list.length} 人喜欢</b>，加起来正好 ${male.list.length + female.list.length} 位，和总人数一位不差。也就是说——<b>每个角色只认其中一款，不存在「两款都吃」的人</b>。</p>
            ${tbl(['款式', '喜欢的人', '人数'], [
                ['<b>' + male.s + '</b>', male.list.join('、'), male.list.length],
                ['<b>' + female.s + '</b>', female.list.join('、'), female.list.length],
            ], { leftFirst: true, cls: 'txt', colw: ['3.8rem', 'auto', '3.4rem'] })}
            <div class="key">这 ${male.list.length} 位与 ${female.list.length} 位正好是<b>按性别二分</b>的。所以送香水前的第一判断不是「他喜欢什么味道」，而是<b>「他吃男士款还是女士款」</b>——这一层猜错，味道再对也没用。</div>

            <h2 class="h2">${SC.length} 款香味，各自的受众</h2>
            <p class="p">除男女款外，其余 ${SC.length - 2} 款都是「味道」，一个人可以同时喜欢好几款。越靠前越通用，越靠后越偏门：</p>
            ${tbl(['香味', '人数', '喜欢的人'], byScent.slice().sort((a, b) => b.list.length - a.list.length).map(x => [
                x.s, x.list.length, x.list.join('、') || '<span class="mon-no">—</span>',
            ]), { leftFirst: true, cls: 'txt', colw: ['5.6rem', '3.4rem'] })}
            <div class="note">最冷门的是 <b>${rare[0].s}</b> 与 <b>${rare[1].s}</b>，各只有 ${rare[0].list.length} 人喜欢（${rare[0].list.join('、')}／${rare[1].list.join('、')}）。这类不求人多的香味，价值在于<b>精准</b>：想冲某一个人的好感，送他独占的那款，比送大众款有效得多。</div>

            <h2 class="h2">${CH.length} 位角色，各自吃哪几款</h2>
            <p class="p">反过来按人查更实用。平均每人 ${avg} 款，最多的 ${easy[0].c}／${easy[1].c}／${easy[2].c} 各有 ${easy[0].list.length} 款——<b>选择多的人反而好送礼</b>，因为随便挑一款都对。</p>
            ${ftableOwn(['角色', '款式', '喜欢的香味'], ['5.4rem', '4.2rem'], byChar.map(x => {
                const isM = male.list.indexOf(x.c) >= 0;
                return [
                    x.c + ' ' + x.list.join(' '),
                    [
                        x.c,
                        isM ? '男士' : '女士',
                        x.list.filter(s => s !== '男士' && s !== '女士').join('、') || '<span class="mon-no">只认基础款</span>',
                    ],
                ];
            }), { ph: '输入角色名或香味' })}
            <div class="key">只有 <b>${picky.map(x => x.c).join('、')}</b> 是「一款走天下」——${picky.map(x => x.list[0]).join('、')}款之外什么都不认。对这几位，别浪费素材做花样。</div>
            <div class="note">取自《符文工厂译名查询粗略表》的「RF3 香水表」：原表同时给了「香味 → 角色」矩阵与「角色 → 香味」清单两套排法，本站以矩阵为准生成两向查询，<b>两套排法逐条比对零差异</b>。原表另有一列「希雅蕾丝」在每位角色那行都出现，矩阵里找不到对应关系，推测为全员共通项，未并入统计。</div>`;
        }
    },
    {
        key: 'recipe', group: 'item', title: '配方大全', icon: 'book',
        gms: ['rf4', 'rf4sp', 'rf5'],
        body: g => {
            if (g.id.indexOf('rf4') === 0) return recipe4Html();
            const rec = (typeof RECIPE !== 'undefined') ? RECIPE : [];
            const cats = (typeof RECIPE_CATS !== 'undefined') ? RECIPE_CATS : [];
            const cnt = (typeof RECIPE_CNT !== 'undefined') ? RECIPE_CNT : [];
            const short = s => s.replace(/(食谱|设计图|配方)$/, '');
            const kindOf = s => s.indexOf('料理') >= 0 ? '料理'
                : s.indexOf('药学') >= 0 ? '药学'
                    : s.indexOf('农具') >= 0 ? '农具'
                        : s.indexOf('饰品') >= 0 ? '饰品'
                            : /^(盾|铠甲|帽子|鞋子)/.test(short(s)) ? '防具' : '武器';
            const KINDS = ['料理', '武器', '防具', '饰品', '农具', '药学'];
            const ksum = {};
            cats.forEach((c, i) => { const k = kindOf(c); ksum[k] = (ksum[k] || 0) + (cnt[i] || 0); });

            const opts = KINDS.map(k => {
                const inner = cats.map((c, i) => kindOf(c) === k
                    ? `<option value="${i}">${short(c)}（${cnt[i]}）</option>` : '').join('');
                return inner ? `<optgroup label="${k}">${inner}</optgroup>` : '';
            }).join('');

            const effMap5 = {};
            (typeof RF5_COOK !== 'undefined' ? RF5_COOK : []).forEach(r => { if (r && r.length >= 5) effMap5[r[1]] = r[4]; });
            const rr = x => {
                const isCook = x.c >= 0 && x.c <= 6;
                const eff = isCook ? (effMap5[x.n] || '—') : '—';
                return `<tr data-c="${x.c}" data-s="${x.n} ${x.m.join(' ')} ${isCook ? (effMap5[x.n] || '') : ''}">
                <td class="td left rec-n">${x.n}</td>
                <td class="td rec-c">${short(cats[x.c])}</td>
                <td class="td rec-lv">${x.lv}</td>
                <td class="td rec-m">${x.m.join('、')}</td>
                <td class="td rec-eff">${eff}</td>
            </tr>`;
            };

            return `
            <h2 class="h2">${rec.length} 条配方，一条不落</h2>
            <p class="p">这是 RF5 的完整配方表：料理六种做法、武器七种类型、防具四类、饰品、农具、药学，全在里面。<b>「技能等级」是做出这条配方所需的技能等级</b>——等级不够就直接做不出来；够了之后，成品的实际等级由素材等级和你的技能等级共同决定。</p>
            ${stat([['配方', rec.length + ' 条'], ['料理', (ksum['料理'] || 0) + ' 条'], ['武器·防具', ((ksum['武器'] || 0) + (ksum['防具'] || 0)) + ' 条'], ['饰品·农具·药学', ((ksum['饰品'] || 0) + (ksum['农具'] || 0) + (ksum['药学'] || 0)) + ' 条']])}
            <div class="rec-filter">
                <input id="recQ" type="search" placeholder="输入配方名或素材筛选" />
                <select id="recSel" aria-label="按分类筛选"><option value="all">全部分类</option>${opts}</select>
                <span id="recCount" class="mon-count">${rec.length} 条</span>
            </div>
            <div class="table mon-table" data-rec><table><thead><tr>
                <th class="th left">配方</th><th class="th">类别</th><th class="th">技能Lv</th><th class="th">素材</th><th class="th">效果（料理）</th>
            </tr></thead><tbody>${rec.map(rr).join('')}</tbody></table></div>

            <div class="key">用法很直接：<b>按技能等级排，做到哪一档就停在哪一档</b>。等级是连续的，做完 20 级那批才会自然刷到能做 30 级的水平——所以别跳过便宜的配方去硬凑贵的，那只会卡在「素材不够、等级也不够」。</div>
            <p class="p">素材最多六项，表里按原表顺序列出，<b>不区分主料与辅料</b>——RF 的配方里所有列出的都必须在包里，缺一样就做不了。</p>

            <div class="note">数据取自《符文工房5 全配方》表。RF5 之外的作品配方结构相同但条目与数值不同，本页暂以 RF5 为准，其余作待补。配方名沿用汉化版译名，与官方中文版可能存在个别差异。</div>

            <div class="jump">
                <a href="#/page/cook">
                    <div class="jp-t">料理</div>
                    <div class="jp-s">烹饪机制、料理等级怎么刷、食材三条来源</div>
                </a>
                <a href="#/page/craft">
                    <div class="jp-t">锻造与药学</div>
                    <div class="jp-s">素材品质与技能等级怎么决定成品</div>
                </a>
                <a href="#/page/gear">
                    <div class="jp-t">装备打造·毕业套</div>
                    <div class="jp-s">知道配方之后：倍铁怎么把一件装备乘到极限</div>
                </a>
            </div>
        `;
        }
    },

    {
        key: 'fish', group: 'item', title: '鱼类图鉴', icon: 'fish',
        body: (g) => {
            /* RF2 / 边境 有自身的鱼表，走专用分支，不套用 RF4／RF5 数据 */
            const oldFish = fishOldHtml(g || {});
            if (oldFish) return oldFish;
            if (g.id === 'rf3') return fishRf3Html();
            if (g.id === 'rf1') return fishRf1Html();
            const f4 = (typeof FISH_RF4 !== 'undefined') ? FISH_RF4 : [];
            const f5 = (typeof FISH_RF5 !== 'undefined') ? FISH_RF5 : [];
            const CATS = ['稀有鱼', '大型鱼', '中型鱼', '小型鱼', '钓物'];
            const fishes = f4.filter(x => x.c !== '钓物');

            const rowF = x => `<tr data-fk="${x.c}" data-s="${x.n} ${x.s.join(' ')} ${x.p.join(' ')}">
                <td class="td left f-n">${x.n}</td>
                <td class="td f-c">${x.c}</td>
                <td class="td f-l">${x.mn}–${x.mx}<span class="f-cup">金杯 ${x.cup}</span></td>
                <td class="td f-s">${x.s.length ? x.s.join('·') : '<span class="mon-no">—</span>'}</td>
                <td class="td f-p">${x.p.length ? x.p.join('、') : '<span class="mon-no">—</span>'}</td>
            </tr>`;

            const rowC = x => `<tr data-s="${x.n}">
                <td class="td left f-n">${x.n}</td>
                <td class="td f-l">${x.mx} cm</td>
                <td class="td f-c">${x.rod || '<span class="mon-no">—</span>'}</td>
                <td class="td f-p">${x.t || '<span class="mon-no">—</span>'}</td>
            </tr>`;

            const row5 = x => `<tr data-s="${x.n} ${x.p}">
                <td class="td left f-n">${x.n}</td>
                <td class="td f-b">${x.b}G</td>
                <td class="td f-v">${x.v}G</td>
                <td class="td f-p">${x.p || '<span class="mon-no">—</span>'}</td>
            </tr>`;

            const rfoFishNote = (g && g.id === 'rfo')
                ? `<div class="note"><b>海洋（RFO）</b>的鱼类尺寸与金杯线暂缺可靠来源，本页下方 RF4／RF5 鱼表仅作通用机制参考。但海洋的<b>钓点 × 鱼种 × 概率</b>分布已在 <a href="#/page/fishspot">钓点与季节</a> 页完整收录（共 28 处钓点、30 种鱼），要查「哪片海出什么鱼、概率多少」请直接去那页。</div>`
                : '';
            const crossNote = (g && !/^rf4/.test(g.id) && g.id !== 'rf5' && g.id !== 'rfo' && g.id !== 'rf3')
                ? `<div class="note"><b>${g.name}</b> 的鱼类专项数据暂缺可靠来源。本页鱼种全表是系列最完整的 <b>RF4／RF5</b> 数据，供横向参考；钓鱼机制（鱼影、四种状态、金杯线）全系列通用，可直接用在本作。</div>`
                : '';
            return `
            ${rfoFishNote}${crossNote}
            <h2 class="h2">钓鱼不是抽奖，鱼影早就把答案写在脸上</h2>
            <p class="p">RF 的钓鱼系统里，水面下那个影子在你下竿之前就暴露了三件事：<b>色泽、大小、抖动频率</b>。看懂这三点，你要的那条鱼一出现你就知道；反过来，不看鱼影硬拉，等于在随机池里捞——这不是运气问题，是信息问题。</p>
            ${tbl(['看什么', '怎么读', '意味着什么'], [
                ['色泽', '淡色／深色，清晨和中午最好分辨', '淡色＝稀有鱼（9 种水钓 + 1 种沙钓稀有鱼，另加龙虾这个历史遗留 BUG），深色＝其余普通鱼种'],
                ['大小', '10～100cm 之间平滑增长，超过 100cm 就不再变大', '直接对应鱼的实际长度，所以 100cm 以上一律显示为最大鱼影'],
                ['抖动', '尾巴抖得越凶，长度越接近该鱼种当前等级的上限', '金杯鱼影必定是高／极高抖动'],
            ], { leftFirst: true, colw: ['4.2rem', '12.6rem'] })}
            <div class="key">一句话记住：<b>金杯鱼影 ＝ (极) 高抖动</b>。想要金杯，先用色泽和大小筛到鱼种，再只拉抖得最凶的那一只。同一片水域里同时有好几条鱼时，这一条判断比什么都省时间。</div>

            <h2 class="h2">鱼影的四种状态</h2>
            <p class="p">提竿的时机错了不是「失败一次」，而是<b>让这条鱼从池子里消失</b>。四种状态对应四种完全不同的处理方式：</p>
            ${tbl(['状态', '鱼影的表现', '你该做什么'], [
                ['无目标', '不咬竿。随便提竿，鱼影也不会消失', '放心换饵、换位置'],
                ['瞄竿', '向浮标靠近，准备第一次触标。此时提竿会让它疯狂抖动并冲到水域边缘，之后很难再回瞄竿状态', '忍住，别急着提'],
                ['触标', '第一次触标后保持距离，准备再次触标。此时提竿鱼影直接消失', '等真正咬钩那一下'],
                ['惊竿', '触标或咬钩后没被拉上来（你去拉别的鱼了）。之后随便落竿再提竿都会让它消失', '换装备取消下竿——这样鱼影不会消失，是唯一的补救办法'],
            ], { leftFirst: true, colw: ['4.2rem', '14rem'] })}

            <h2 class="h2">RF4：${fishes.length} 种鱼，另有 ${f4.length - fishes.length} 种钓物</h2>
            <p class="p"><b>「金杯线」是拿金杯所需的最小长度</b>，长度必须严格超过它：88.8cm 的毒虹鳟只是银杯，88.9cm 才是金杯。算法是「最大 −（最大 − 最小）× 0.06」，也就是要钓到该鱼种长度区间超过 94% 的位置。</p>
            ${stat([['鱼种', fishes.length + ' 种'], ['钓物', (f4.length - fishes.length) + ' 种'], ['分类', '5 类'], ['最长', '金枪鱼 300cm']])}
            <div class="rec-filter">
                <input id="fishQ" type="search" placeholder="输入鱼名、季节或钓点筛选" />
                <span id="fishCount" class="mon-count">${f4.length} 条</span>
            </div>
            <div class="chip-row" id="fishChips">
                <button class="chip on" data-fk="all">全部</button>
                ${CATS.map(c => `<button class="chip" data-fk="${c}">${c}</button>`).join('')}
            </div>
            <div class="table mon-table" data-fish><table><thead><tr>
                <th class="th left">鱼种</th><th class="th">分类</th><th class="th">长度／金杯线</th><th class="th">季节</th><th class="th">钓点</th>
            </tr></thead><tbody>${f4.map(rowF).join('')}</tbody></table></div>
            <div class="note">季节栏里的春夏秋冬，已经包含了泉／湖／沼泽三处水域的产出；「泉／湖／沼泽」即指这四处。<b>鲷鱼、鲐鱼、斑鲅鱼、沙丁鱼</b>在原攻略里标为「国民鱼」——四泉到处都有，所以没有单独标注季节与钓点。钓物栏的六件东西不是鱼，但和鱼共用同一套鱼影与咬钩机制。</div>

            <h2 class="h2">金杯鱼影目标表</h2>
            <p class="p">同一个「100cm 特大淡鱼影」，在不同季节的泉里是不同的鱼。想刷哪条鱼的金杯，就照下表去找对应的鱼影——<b>看到别的鱼就放过，别浪费抖动次数</b>。</p>
            <details class="mon-fold">
                <summary>展开 ${f4.filter(x => x.t).length} 条金杯鱼影目标（点一下）</summary>
                <div class="table mon-table"><table><thead><tr>
                    <th class="th left">鱼种</th><th class="th">最大</th><th class="th">建议钓竿</th><th class="th">鱼影目标</th>
                </tr></thead><tbody>${f4.filter(x => x.t).map(rowC).join('')}</tbody></table></div>
            </details>
            <div class="key">金杯里的另一半功夫在鱼竿上：<b>锻造／强化鱼竿时加入某种垂钓产物，会提高该产物鱼影出现的概率</b>。加稀有罐头还会同时抬高所有稀有鱼的出现率。用的是自己钓上来的高级鱼，还是鱼店里 1 级的鱼，效果不一样——前者更好。</div>
            ${tbl(['鱼竿', '做法', '用来干什么'], [
                ['常规稀有鱼竿', '锻造 3 个稀有罐头，强化九类稀有鱼各 1 只', '通刷九种稀有鱼'],
                ['专杀特定鱼竿', '锻造 3 条目标鱼，强化 3 条目标鱼 + 3 个罐头', '只刷某一种鱼的金杯'],
                ['三拼钓竿', '锻造 3 类鱼各 1 只，强化 3 类鱼各 3 只', '一次覆盖三类鱼'],
                ['可乐钓竿', '锻造 3 个罐头，强化 3 个罐头', '罐头等钓物'],
            ], { leftFirst: true })}

            <h2 class="h2">RF5：${f5.length} 种水产</h2>
            <p class="p">RF5 把鱼按地区分池，还多了「一起钓鱼」这种多人玩法。<b>买价和卖价差得离谱</b>——鳕场蟹买价 10 万、卖价只有 5 千。买价是商店向你要的钱（主要用来做鱼竿），卖价才是你出货能拿到的钱，所以别想着低价买高价卖，这不是生意，是消耗。</p>
            <div class="table mon-table" data-fish5><table><thead><tr>
                <th class="th left">水产</th><th class="th">LV1 买价</th><th class="th">LV1 卖价</th><th class="th">主要钓点</th>
            </tr></thead><tbody>${f5.map(row5).join('')}</tbody></table></div>

            <div class="note">RF4 数据取自《RF4 鱼（终版）》钓鱼手册（作者「一竿满级」），由尺寸表、钓点表、金杯攻略表三表按鱼种合并而成；RF5 取自《RF5全鱼类水产一览》。RF4 的长宽与金杯线为实测值，RF5 的买卖价为 LV1 基准价，实际会随等级浮动。</div>

            <div class="jump">
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">钓鱼在体力预算里的位置、锤子与鱼竿的分工</div>
                </a>
                <a href="#/page/fishspot">
                    <div class="jp-t">钓点与季节</div>
                    <div class="jp-s">每条鱼在哪片水域、哪一季出现，以及固定水域为什么不分季节</div>
                </a>
            </div>
        `;
        }
    },

    /* ================= RF5 钓点与季节分布 ================= */
    {
        key: 'fishspot', group: 'item', title: '钓点与季节', icon: 'fish',
        gms: ['rf4', 'rf4sp', 'rf5', 'rfo'],
        body: g => {
            if (g.id === 'rfo') return fishspotRfoHtml();
            if (String(g.id).indexOf('rf5') !== 0) return fishspot4Html();
            const S = (typeof SPOT_RF5 !== 'undefined') ? SPOT_RF5 : [];
            const SH = (typeof SPOT_SHARE !== 'undefined') ? SPOT_SHARE : [];
            const SEA = ['春', '夏', '秋', '冬'];
            const spotName = r => r[0] === '其他' ? '其他水域' : (r[1] ? r[0] + '·' + r[1] : r[0]);
            const spots = Array.from(new Set(S.map(spotName)));
            const realSpots = spots.filter(x => x !== '其他水域');

            const byFish = {};
            S.forEach(r => {
                if (!byFish[r[2]]) byFish[r[2]] = new Set();
                byFish[r[2]].add(spotName(r));
            });
            const fishes = Object.keys(byFish);
            const seasonsOf = n => SEA.filter((_, i) => S.some(r => r[2] === n && r[4 + i * 2] > 0));
            const solo = fishes.filter(n => byFish[n].size === 1);
            const soloAt = n => Array.from(byFish[n])[0];
            const four = fishes.filter(n => seasonsOf(n).length === 4);
            const limited = fishes.filter(n => seasonsOf(n).length === 1);

            const grpAt = (spotKey, label) => {
                const arr = solo.filter(n => soloAt(n) === spotKey);
                return arr.length ? `<p class="p"><b>${label}（${arr.length} 种）</b>：${arr.join('、')}</p>` : '';
            };
            const together = solo.filter(n => soloAt(n) === '里格巴斯·一同垂钓');
            const pier = solo.filter(n => soloAt(n) === '里格巴斯·码头');
            const cellP = v => v > 0 ? v + '%' : '<span class="mon-no">—</span>';

            return `
            <h2 class="h2">每一口水面，每一季，都是一次独立的抽签</h2>
            <p class="p">RF5 的钓鱼不是全图共用一张概率表。解包表是按<b>「钓点 × 季节」</b>分块的：同一个钓点，春天和夏天的产出名单就不一样；同一季，希望之池和西海也完全不同。每一块的权重会各自归一化成 100%，所以<b>表里的百分比只在这个钓点的这一季内有效，不能跨池比较</b>。</p>
            ${tbl(['你看到的现象', '背后的机制'], [
                ['同一个池塘，换季就换鱼', '每个钓点每季有独立的权重表，鱼种名单本身就不同'],
                ['同一季，两个池塘的「常见鱼」不一样', '权重只在本块内归一化，A 池的 20% 和 B 池的 20% 不是同一件事'],
                ['有些鱼一年四季都在', '它的权重在四季四块里都非零'],
                ['金杯鱼影总在固定的几种鱼上', '鱼影的长度和抖动由该鱼种的等级与尺寸上限决定，与概率无关'],
            ], { leftFirst: true, colw: ['13rem'] })}
            ${stat([['固定水域', realSpots.length + ' 处'], ['鱼与钓物', fishes.length + ' 种'], ['有效条目', S.length + ' 条']])}
            <div class="key">这张表覆盖的是<b>里格巴斯周边</b>——希望之池、旋律湖、码头、西海、东海，加上「一同垂钓」的多人池。原表里另外 18 处地区（福洛斯森林、凯尔贝火山地带、尤米娜湖、梅利涅水晶洞窟……）的权重<b>全是 0</b>，是还没填的空块，本页不收，也不拿别的数据凑。</div>

            <h2 class="h2">0 档与 1 档：1 档的稀有鱼几乎翻倍</h2>
            <p class="p">原表把每个季节的概率拆成 <code>Spring0 / Spring1</code> 这样的两档。两档的<b>鱼种名单完全相同</b>，只有权重不同——而差异的方向很一致：</p>
            ${tbl(['季节', '0 档 稀有鱼占比', '1 档 稀有鱼占比'], SH.map(r => [r[0], r[1] + '%', '<b>' + r[2] + '%</b>']), { leftFirst: true, colw: ['5rem', '9rem'] })}
            <div class="key">这 ${SH.length} 行说的是同一件事：<b>切到 1 档，最稀有那一档（Rank 4）的总占比涨了将近一倍</b>，代价是普通鱼（Rank 1）的占比相应下降。解包表没有注明这两档对应什么操作——从数值形态看，是某种「提高稀有度」的条件（饵、钓竿等级、或钓点状态）。<b>本页主表取 0 档</b>，也就是没加任何条件的基准池；想知道「加了条件之后能高多少」，看上面这张表就够了。</div>

            <h2 class="h2">一同垂钓是另一口池子，${together.length} 种鱼单机钓不到</h2>
            <p class="p">「一同垂钓」（多人模式）不是把单机池塘搬过来，它有一份<b>独占名单</b>。这 ${together.length} 种鱼在整个表里只在这一处出现，而且全是四季常驻：</p>
            <p class="p">${together.join('、')}</p>
            <div class="key">名单里有<b>鳕场蟹、旗鱼、翻车鱼、红金眼鲷、鲍鱼</b>这类大物——单机怎么刷都刷不到，只能开多人。反过来说，如果你在单机里卡在某本鱼类图鉴的最后几格，先确认缺的是不是这几样。</div>

            <h2 class="h2">码头是溪流小鱼专场</h2>
            ${grpAt('里格巴斯·码头', '码头独占') || ''}
            <p class="p">这 ${pier.length} 种全是溪流系的小型鱼，和希望之池那套「什么都有」的池子完全不同。<b>想凑齐图鉴里的小鱼，码头是必须单独跑的地方</b>——在希望之池钓一辈子也出不来石川鲑鱼。</p>

            <h2 class="h2">${four.length} 种四季通吃，只有 ${limited.length} 种挑季节</h2>
            <p class="p">把每种鱼出现过的季节数一遍，结果有点意外：<b>${four.length} 种鱼四季都能钓</b>（乌贼、沙丁鱼、青花鱼这些基础种，加上空罐、高筒靴、人鱼的鳞片这些钓物），真正被季节锁住的只有 ${limited.length} 种。</p>
            ${tbl(['只在某一季出现', '季节'], limited.map(n => [n, seasonsOf(n)[0]]), { leftFirst: true, colw: ['9rem', '5rem'] })}
            <div class="key">所以「换季了，钓鱼清单要重排」这个印象只对了一小半：<b>真正换掉的是概率，不是名单</b>。春天 21.7% 的乌贼到了夏天只剩 5.5%，但它还在池子里。真要蹲季节限定，盯上面这 ${limited.length} 种就行。</div>

            <h2 class="h2">全部 ${S.length} 条：钓点 × 鱼 × 四季</h2>
            <p class="p">百分比是该鱼在<b>这个钓点的这一季</b>里的出现率。<b>同一钓点、同一季的一整列加起来正好 100%</b>（四舍五入后 ±0.5%）；同一行横着加没有意义，那是四个不同的池子。空格是这一季完全不出。带「稀有」标签的是 Rank 4。</p>
            ${ftableOwn(['钓点', '鱼', '春', '夏', '秋', '冬'], ['8.4rem', 'auto', '3.2rem', '3.2rem', '3.2rem', '3.2rem'],
                S.map(r => [
                    [spotName(r), r[2]].join(' '),
                    [
                        spotName(r),
                        r[2] + (r[3] === 4 ? ' <span class="txc">稀有</span>' : ''),
                        cellP(r[4]), cellP(r[6]), cellP(r[8]), cellP(r[10]),
                    ],
                ]), { ph: '输入钓点或鱼名', cls: 'spot' })}

            <div class="note">取自《RF5_Data 数据解包汉化版》的 <code>FishingRates</code> 表（341 行）。原表每处钓点都列了全部鱼种，其中 198 行四季权重全为 0（含 18 处整块为空的地区、以及福洛斯森林的 <code>?</code> 占位块 14 行），这些行已剔除，剩 <b>${S.length} 条</b>有效记录。鱼名用同文件「译名表」转简中（48 条日文名全部命中，译名表原写作「带魚」，已按简体习惯改为「带鱼」）；地名与水域名译名表未收，按官方中文习惯补译。<br><b>「其他水域」</b>是原表的 <code>HOME-P99 / All Other</code> 兜底块，只有 4 条（虾、鲑鱼、空罐、高筒靴）却同样归一化到 100%，所以那 4 条各自的占比高得不像话（空罐、高筒靴各 4.5%），<b>只表示「这个兜底池里只有这四样」，不代表在其他水域也这么常见</b>。</div>

            <div class="jump">
                <a href="#/page/fish">
                    <div class="jp-t">鱼类图鉴</div>
                    <div class="jp-s">鱼影读法、金杯线，以及 RF4 的全鱼种数据</div>
                </a>
                <a href="#/page/mine">
                    <div class="jp-t">采矿与钓鱼</div>
                    <div class="jp-s">钓鱼在一天的体力预算里占多少</div>
                </a>
            </div>`;
        }
    },

    /* ================= 资料与设定 ================= */
    {
        key: 'series', group: 'lore', title: '系列作品一览', icon: 'books',
        body: () => `
            <h2 class="h2">正传与外传</h2>
            ${tbl(['', '作品', '平台', '日版发售'], [
                ['1', '符文工房 -新牧场物语-', 'NDS', '2006-08-24'],
                ['2', '符文工房2', 'NDS', '2008-01-03'],
                ['外', '符文工房 边境', 'Wii', '2008-11-27'],
                ['3', '符文工房3', 'NDS', '2009-10-22'],
                ['外', '符文工房 海洋', 'Wii／PS3', '2011-02-24'],
                ['4', '符文工房4', '3DS', '2012-07-19'],
                ['4SP', '符文工房4 豪华版', 'Switch／PS4／XB1／PC', '2019-07-25'],
                ['5', '符文工房5', 'Switch／PC', '2021-05-20'],
                ['3SP', '符文工房3 特别版', 'Switch／PC', '2023-03-02'],
                ['—', '符文工房 龙之天地', 'Switch／Switch 2／PC', '2025-06-05'],
                ['6', '符文工房6', '未定', '未定'],
            ], { leftFirst: true })}
            <h2 class="h2">关联作品</h2>
            ${tbl(['作品', '平台', '发售', '关系'], [
                ['FREDERICA 芙蕾德利卡', 'Switch／PC', '2023-09-28', '同一世界观的独立作品，非正传'],
                ['符文工房外传 Another Day', 'i-mode 手机', '2007-05-18', '官方授权 LiveWare 开发'],
            ], { leftFirst: true })}
            <h2 class="h2">时间线怎么排</h2>
            <p class="p">系列内部时间线并不严格，但有一条主线：<b>边境是 RF1 的直接续作</b>，两者共享主角拉格那与密丝特；其余作品互相独立，各自在新的城镇展开。设定层面（国家、幻龙、种族）是共通的。</p>
            <div class="note">二〇二三年 Marvelous 在游戏展上同时公布了《符文工房6》与《龙之天地》。<b>《龙之天地》被定位为「安全但激进」的实验作品</b>，为 6 代积累经验——所以它离开诺鲁德、走向东国，并不是世界观断裂，而是一次刻意的试水。</div>
        `
    },
    {
        key: 'lore', group: 'lore', title: '国家与幻龙', icon: 'dragon',
        body: () => `
            <h2 class="h2">两个国家</h2>
            <h3 class="h3">诺鲁德王国（ノルド王国／Norad）</h3>
            <p class="p">系列的主要舞台所在。国土不大，但受四幻龙加护，王族与大地之民能够自由运用 RP——这是它在周边国家之间活下来的原因。已确认的领地包括王都，以及各作的城镇：卡尔迪亚（RF1）、阿尔巴那（RF2）、西亚廉斯（RF3）、赛尔菲亚（RF4）、里格巴斯（RF5）。</p>
            <h3 class="h3">塞克斯帝国（ゼークス帝国／Sechs）</h3>
            <p class="p">机械技术高度发达，几乎统治了整个世界。国内资源匮乏、常年冰雪，因此始终觊觎诺鲁德的幻龙之力。RF1 与 RF4 都提到过帝国的存在。</p>
            <div class="note">另有尤库拉夫特共和国与罗兰德王国，系列正传未作为舞台登场，只在人物出身与访谈里出现（例如边境里罗兰德的老国王常来泡澡）。</div>
            <h2 class="h2">四幻龙</h2>
            ${tbl(['幻龙', '属性', '备注'], [
                ['普罗戴格力德', '地', '陷入沉睡；其苏醒会惊动火之幻龙'],
                ['弗雷克扎伊德', '火', '象征破坏，被封印，千年一度苏醒'],
                ['阿克娜比特', '水', '—'],
                ['赛尔泽薇德（Ventuswill）', '风', 'RF4 赛尔菲亚的守护龙，收留了坠落的主角'],
            ], { leftFirst: true })}
            <h2 class="h2">一千年一次的循环</h2>
            <p class="p">火之幻龙代表「破坏」，它的职责是把整片大地分解回符文；随后地之幻龙苏醒，让大地重新肥沃。这是一个必要的循环。古代的大地之民知道这件事，出于能力所限（也出于别的考虑）只封印了一千年。</p>
            <div class="key">这条循环是理解整个系列的钥匙：<b>符文不是无限的</b>。当有人试图中断这个循环——无论是封印、夺取还是滥用——大地就开始枯竭，而主角要处理的正是这个后果。</div>
        `
    },
    {
        key: 'race', group: 'lore', title: '种族', icon: 'mask',
        body: () => `
            <h2 class="h2">这个世界住着谁</h2>
            ${tbl(['种族', '特征', '代表角色'], [
                ['人类', '数量最多，多数城镇的主体', '各作主角（多为大地之民）'],
                ['大地之民', '能看见并操纵符文，可将其灌入工具与武器', '拉格那、雷斯特／芙蕾'],
                ['精灵', '长寿、尖耳，与自然亲和', '玛格丽特（RF4）'],
                ['矮人', '擅长锻造与工艺', '各作锻冶屋工匠'],
                ['兽人／亚人', '兽耳与尾，体力与直觉出众', '芙佳、丛云（RF5）'],
                ['半精灵', '两边都不完全归属，常带身份矛盾', '丝卡蕾特（RF5）'],
                ['梦魔', '以他人的情感为食', '露德蜜拉（RF5）'],
                ['有角人／魔物侧', '被人类视为威胁的一方', 'RF3 的魔物居民'],
                ['龙', '大地的守护者，与季节和丰饶直接相关', '赛尔泽薇德'],
            ], { leftFirst: true })}
            <h2 class="h2">种族不是背景板</h2>
            <p class="p">系列用种族来承载具体的矛盾：<b>人类与魔物的对立</b>（RF3）、<b>混血者的身份认同</b>（麦斯、托娜）、<b>不归属任何一边的孤独</b>（丝卡蕾特、露德蜜拉）。主角往往站在这条裂缝的中间，这也是系列剧情比一般经营游戏更重的原因。</p>
            <div class="note">在玩法上，种族也直接决定机制：兽人可以靠直觉识破谎言、梦魔有特殊能力、大地之民能用符文强化工具。</div>
        `
    },
    {
        key: 'zhname', group: 'lore', title: '中文译名对照', icon: 'board',
        gms: ['rf1', 'rff', 'rfo'],
        body: g => {
            const id = (g && g.id) || 'rfo';
            const t2 = (rows, ph) => ftableOwn(
                ['日文原文', '汉化译名'], ['11rem', ''],
                rows.map(r => [r[0] + r[1], [r[0], r[1]]]),
                { ph: ph, cls: 'term-aux' });
            const t3 = (rows, ph) => ftableOwn(
                ['日文原文', '汉化译名', '英文原名'], ['9rem', '9rem', ''],
                rows.map(r => [r[0] + r[1] + (r[2] || ''), [r[0], r[1], r[2] || '—']]),
                { ph: ph, cls: 'term-aux' });

            /* ---------------- 符文1 ---------------- */
            if (id === 'rf1') {
                const I = (typeof CN_RF1_ITEM !== 'undefined') ? CN_RF1_ITEM : [];
                const N = (typeof CN_RF1_NPC !== 'undefined') ? CN_RF1_NPC : [];
                const L = (typeof CN_RF1_PLACE !== 'undefined') ? CN_RF1_PLACE : [];
                const E = (typeof CN_RF1_EVENT !== 'undefined') ? CN_RF1_EVENT : [];
                const K = (typeof CN_RF1_KIND !== 'undefined') ? CN_RF1_KIND : [];
                const A = (typeof CN_RF1_ABI !== 'undefined') ? CN_RF1_ABI : [];
                const T = (typeof CN_RF1_TYPE !== 'undefined') ? CN_RF1_TYPE : [];
                const AT = (typeof CN_RF1_ATTR !== 'undefined') ? CN_RF1_ATTR : [];
                const tot = I.length + N.length + L.length + E.length + K.length + A.length + T.length + AT.length;
                return `
            <h2 class="h2">符文1 的汉化译名</h2>
            ${stat([['官方中文', '无（2006・NDS）'], ['民间汉化', '已完成'], ['对照条目', tot + ' 条']])}
            <p class="p">《符文工房 新牧场物语》没有官方中文，民间汉化版已完成并逐条定稿。本站 RF1 相关条目以这份译名为准，下面共 <b>${tot} 条</b>：物品、角色、地点、节日与生日，外加系统用词。日文原文一并列出，方便对照日文版与日文攻略。</p>
            <div class="key">译名优先级：<b>汉化版定稿 &gt; 英文官方 &gt; 日文直译</b>。同一角色在不同作品的汉化版里可能用字不同（例如 RF1 的メロディ作「梅洛迪」，边境作「美乐蒂」），本表按各作自己的定稿列出，不作跨作统一。</div>
            <h2 class="h2">节日与生日（${E.length} 条）</h2>
            <p class="p">RF1 的年度日程：既有节庆，也把每位居民的生日单列成条目。送礼、蹲点、安排日程都靠这张表。</p>
            ${t2(E, '输入节日或角色名筛选')}
            <h2 class="h2">角色（${N.length} 条）</h2>
            ${t2(N, '输入角色名筛选')}
            <h2 class="h2">地点与存档点（${L.length} 条）</h2>
            <p class="p">洞窟、遗迹、山川与自宅。带「中层／下层／深处」的是同一区域的不同存档点。</p>
            ${t2(L, '输入地点名筛选')}
            <h2 class="h2">物品（${I.length} 条）</h2>
            <p class="p">作物、武器、道具与料理的全表译名。日文原文可与日文攻略的物品表直接对号。</p>
            ${t2(I, '输入物品名筛选')}
            <h2 class="h2">系统用词</h2>
            <h3 class="h3">物品分类（${T.length} 条）</h3>
            ${t2(T, '输入分类名筛选')}
            <h3 class="h3">属性词条（${AT.length} 条）</h3>
            ${t2(AT, '输入属性名筛选')}
            <h3 class="h3">魔物种类（${K.length} 条）</h3>
            ${t2(K, '输入种类名筛选')}
            <h3 class="h3">魔物能力（${A.length} 条）</h3>
            ${t2(A, '输入能力名筛选')}
            <div class="note">数据来源为 RF1 汉化工程的文本导出表，已剔除「未定」占位条目。物品译名以游戏内显示为准，与日文攻略书的俗称可能有出入。</div>
        `;
            }

            /* ---------------- 海洋 ---------------- */
            if (id === 'rfo') {
                const C = (typeof CN_RFO !== 'undefined') ? CN_RFO : [];
                const cats = [['人名', '人名'], ['地名', '地名'], ['设施', '设施'],
                ['节日活动', '节日与活动'], ['用词', '常用词与按键'], ['其它', '其它']];
                const blocks = cats.map(([k, label]) => {
                    const r = C.filter(t => t[0] === k);
                    if (!r.length) return '';
                    return `<h3 class="h3">${label}（${r.length} 条）</h3>` + ftableOwn(
                        ['日文原文', '汉化译名', '备注'], ['9rem', '9rem', ''],
                        r.map(t => [t[1] + t[2] + (t[3] || ''), [t[1], t[2], t[3] || '—']]),
                        { ph: '输入日文或中文筛选', cls: 'term-aux' });
                }).join('');
                return `
            <h2 class="h2">海洋的中文版与译名</h2>
            ${stat([['官方中文', 'Wii 亚洲版：有'], ['PS3 版', '沿用同一套译名'], ['对照条目', C.length + ' 条']])}
            <p class="p">《符文工房 海洋》是系列里唯一在亚洲发行过官方中文的正统作：Wii 版自带中文文本与中文贴图。后出的 PS3 版（Tides of Destiny）没有官方中文，汉化时沿用同一套译名，所以两边是<b>同一套用词</b>。本站海洋条目的人名、地名、设施、节日全部按这套定稿，共 <b>${C.length} 条</b>。</p>
            <div class="key">几个最容易对不上的：<b>アイリス＝艾伊莉丝</b>（不是爱丽丝）、<b>エレクトラ＝伊蕾克特拉</b>、<b>キルト＝琪芦多</b>、<b>ジョー＝乔</b>、<b>ソニア＝索妮亚</b>（不是索妮娅）。地名里「精霊殿」作<b>精灵神殿</b>、楼层用「N 层」；「ウェディングチャペル」是教堂前那座石拱门与钟，定名<b>婚礼钟台</b>，不是教堂本身。</div>
            ${blocks}
            <div class="note">备注栏里的「10-02 统一」等字样是汉化过程中的定稿时间标记，不是游戏内文本。按键一栏原表按 Wii 手柄键位记录，另一版汉化时统一改成了对应键名。</div>
        `;
            }

            /* ---------------- 边境 ---------------- */
            const P = (typeof CN_RFF_PERSON !== 'undefined') ? CN_RFF_PERSON : [];
            const L = (typeof CN_RFF_PLACE !== 'undefined') ? CN_RFF_PLACE : [];
            const I = (typeof CN_RFF_ITEM !== 'undefined') ? CN_RFF_ITEM : [];
            const M = (typeof CN_RFF_MISC !== 'undefined') ? CN_RFF_MISC : [];
            const tot = P.length + L.length + I.length + M.length;
            const person = ftableOwn(
                ['日文原文', '汉化译名', '英文原名', '形象'],
                ['7.5rem', '7.5rem', '7rem', ''],
                P.map(r => [r[0] + r[1] + (r[2] || '') + (r[3] || ''), [r[0], r[1], r[2] || '—', r[3] || '—']]),
                { ph: '输入日文、中文或英文筛选', cls: 'term-aux' });
            return `
            <h2 class="h2">边境的中文版与译名</h2>
            ${stat([['官方中文', '无（2008・Wii）'], ['民间汉化', '已发布'], ['对照条目', tot + ' 条']])}
            <p class="p">《符文工房 边境》（Rune Factory Frontier，Wii・2008）没有官方中文，但民间汉化版已经发布，词条名由汉化组逐条定稿。本站边境相关的角色、地点、节日、物品一律以这份定稿译名为准，下面 <b>${tot} 条</b>全部列出，日文原文与英文原名一并给出——这样无论你玩的是日文版、英文版还是汉化版，都能互相反查。</p>
            <div class="key">译名优先级：<b>汉化版定稿 &gt; 英文官方 &gt; 日文直译</b>。三座遗迹在汉化版里是<b>若草／蔓草／雪草遗迹</b>，季节活动「海開き」作<b>海滩开放日</b>、「鍋大会」作<b>火锅大会</b>、「クイズ大会」作<b>知识大赛</b>。</div>
            <h2 class="h2">角色（${P.length} 条）</h2>
            <p class="p">花嫁候补与主要居民。第四列是汉化组标注的形象，方便确认说的是哪一个人。</p>
            ${person}
            <h2 class="h2">地名与节日（${L.length} 条）</h2>
            ${t3(L, '输入地名或节日名筛选')}
            <h2 class="h2">物品（${I.length} 条）</h2>
            <p class="p">农具、道具与料理。日文原文可用于对照日文攻略里的物品表。</p>
            ${t3(I, '输入物品名筛选')}
            <h2 class="h2">术语、星座与魔物（${M.length} 条）</h2>
            <p class="p">系列术语与世界观名词，外加边境特有的星座名与几种魔物。最容易译错的是 <b>ルーニー</b>——它是「<b>符文精灵</b>」，不是「符文」本身（符文是ルーン）；<b>アースマイト</b>作「<b>大地之伴</b>」，<b>エルフ</b>作「艾尔夫」。</p>
            ${t3(M, '输入术语或魔物名筛选')}
            <div class="note">表中带「＠…＠」的是游戏内变量占位符，实际会替换成玩家输入的名字，不是屏幕上会出现的文字。同一角色在不同作品汉化版里用字可能不同。本站已统一：ミスト 一律作「密丝特」（沿用边境译法，第五十九次全站铺平），各表都按这个口径列。</div>
        `;
        }
    },
    {
        key: 'changelog', group: 'lore', title: '更新日志', icon: 'note',
        body: () => `
            <h2 class="h2">2026-10-30　第一百零五次：四部作品两两并卡（10 张变 8 张），RF4+RF4SP、RF5+龙之天地 各占一条</h2>
            <ul class="ul">
                <li class="li"><b>起因</b>：上一版末尾留着四张 2.96:1 的卡（RF4 / RF4SP / RF5 / 龙之天地）。它们单独放进 16:9 的框要切掉约三成高度（RF4SP、RF5 是群像，一切就切到人），留在矮框里又比同排的卡矮一截、被栅格拉出空白。用户给出的解法是「四个作品可以合成两个」。</li>
                <li class="li"><b>做法</b>：两部一张卡，配图上下各一条，整体 960×540（正好 16:9）。上条 / 下条各压一个透明链接，点哪半条进哪一部；文字区并排两行「作品名 … 年份 平台」，当前所在的那一部前面加一个 <code>›</code>。</li>
                <li class="li"><b>关键发现：这四张图有一半是虚的</b>。RF4SP / RF5 的 Steam capsule 是「中间一块清晰方图 + 两侧官方做的模糊延伸」，用逐列高频能量一量，清晰区只有 <b>x=192..766（574px）</b>，其余 386px 全是拉伸模糊。所以不能整张缩——那样会把官方的模糊再糊一遍。改成：只取清晰区等比缩到条高（636×270），两侧另用这块清晰区重度模糊 + 压暗补齐，清晰区一点不切。RF4（浮空船）与龙之天地是全幅画，直接按宽铺满、上下居中各切 27px。</li>
                <li class="li"><b>布局影响</b>：10 张卡变 8 张。三列布局从「3/3/3/1」（末行只剩一张、右边空两格）变成「3/3/2」；两列布局正好 4 行，不再有落单的那一张。</li>
                <li class="li"><b>旧的单卡图</b>：<code>assets/title/rf4.jpg</code>、<code>rf4sp.jpg</code>、<code>rf5.jpg</code>、<code>azuma.jpg</code> 已删除（两张新图里就是它们的内容，留着会让单文件版多内联 400KB 死图）。<code>_title_src/build_titles.py</code> 里原来生成这四张的代码换成 <code>wpair()</code>，源图仍从 <code>src/rf4w_1.jpg</code>、<code>src/rf4sp_capsule_616x353.jpg</code>、<code>src/rf5_capsule_616x353.jpg</code>、<code>src/azuma_library_hero.jpg</code> 现做，可复现。</li>
                <li class="li"><b>体积</b>：两张合并图 122KB / 125KB（960×540 q88）。</li>
            </ul>
            <h2 class="h2">2026-10-30　第一百零四次：海洋 换成 PS3 标题画面三层合成的原生 1280x720（logo + 藤蔓框 + 岛海图），第二行三张一起加高</h2>
            <ul class="ul">
                <li class="li"><b>起因</b>：海洋的卡一直是<b>只有景、没有 logo</b>——那张 960×720 的圆形插画（岛 + 海底）单独看认不出是哪一作，而且旧图是把圆构图硬裁成 2.96:1，圆的左右被切掉。用户说「海洋也重新弄」「可以两张合在一起 logo加背景」。</li>
                <li class="li"><b>素材在哪</b>：本机 <code>G:/10257/Desktop/海洋PS3版PSD/</code> 里是汉化时导出的 PS3 贴图 PSD，每个都带原始图层：
                    <code>02207_LUGTITLE_00_960x720</code>（标题底图：岛 + 海，圆形构图）、
                    <code>02896_LUGTITLE_01_1280x720</code>（藤蔓前景框）、
                    <code>02202_LLGTITLEJP_568x400</code>（官方 title logo，含假名行）。</li>
                <li class="li"><b>合成方式（全是 1:1 放置，零缩放、零插值、零补边）</b>：底图水平居中 <code>(1280−960)/2 = 160</code>；藤蔓 <code>(0,0)</code> 压在底图上（游戏里它也是前景遮罩）；logo 水平居中 <code>(1280−568)/2 = 356</code>、<code>y=150</code>（圆形画框垂直居中）。</li>
                <li class="li"><b>logo 用哪一版</b>：PSD 里有两层——<b>原版日文 logo</b>（<code>Rune Factory Oceans</code> + <code>ルーンファクトリー／オーシャンズ</code>，隐藏）和一版把假名抹掉、换成中文「符文工房；海洋」的图层。取<b>原版</b>那一层，与其余九张卡一致（都是官方原语言素材），也避免再引入汉化组加的字。</li>
                <li class="li"><b>水印</b>：两张底图的 PSD 里，汉化组水印是<b>独立图层</b>（底图上的文字层 + <code>icon_white_64</code>，藤蔓框左上角的说明文字层），只取底图那一层即可，不需要修补、不需要抹字。</li>
                <li class="li"><b>为什么卡上不裁</b>：PS3 标题画面原生就是 <b>1280×720 = 16:9</b>，和 <code>.wcard-fig.is-tall</code> 完全同比例，所以卡上是<b>整屏零裁切</b>显示——这次不是「选一条可见带」，是整张都在。圆形画框外那圈白是藤蔓贴图自带的底色（CI8 调色板、不带 alpha），原样保留。</li>
                <li class="li"><b>连锁：第二行也要一起加高</b>。海洋一变成 16:9，同排的 RF3SP、边境就被栅格拉长，文字区各空出一大块色块。所以这两张也改 16:9：
                    <b>RF3SP</b> 的源是 Steam capsule 616×353（1.745:1），转 16:9 纵向只切 10px，等于零裁切；
                    <b>边境</b>的天空底 550×523 是竖构图，16:9 下保留 54% 高度（旧的 2.95:1 版只保留 36%，反而把天空压掉更多）。
                    RF3SP 用 <code>.is-tall-lg</code>：双列时它的同行是 RF3（同样 <code>is-tall-lg</code>），两张同进退；<code>&lt;560px</code> 时一起回到 96px。</li>
                <li class="li"><b>现在 10 张的分组</b>：16:9 六张（RF1/RF2/RF3/RF3SP/边境/海洋）＋ 2.96:1 四张（RF4/RF4SP/RF5/龙之天地）。三列与双列下每一行内部都等高，不再有空色块。RF4SP/RF5 仍不能改 16:9——群像会切人。</li>
                <li class="li"><b>体积</b>：1280×720 的平滑插画存 PNG 要 776KB，存 JPEG q92 只有 190KB，卡片上无可见差异，故用 JPEG。</li>
            </ul>
            <h2 class="h2">2026-10-30　第一百零三次：符文3 换成 ROM 原生 256x192 标题屏（蓝天 + 发光树 + 金色 logo），第一行三张终于是同一套做法</h2>
            <ul class="ul">
                <li class="li"><b>起因</b>：第一百零二次把符文3 也加高到 16:9 后，卡上显示的是<b>大树村场景画</b>——只有树、没有 logo，认不出是哪一作。用户直接指出「符文3 不是有一张图可以当成 logo」，并把本机提取好的 <code>G:/10257/Desktop/符文工房/符文工房/3/rf3Archive-8027.NCGR.BMP</code> 发了过来。</li>
                <li class="li"><b>那张图是什么</b>：<code>符文工房3.nds</code> 的 <code>/res/obj/rf3Archive.arc</code> 里第 <b>8027 号 NCGR</b>，8bpp 调色板、<b>256×192</b>（NDS 上屏原生分辨率）。画面是蓝天、发光的白色巨树、金色 <code>RuneFactory 3</code> 加假名 <code>ルーンファクトリー</code>——正是 RF3 的标题屏。</li>
                <li class="li"><b>为什么之前没拿到</b>：RF3 的资源不像 RF1/RF2 那样是散文件，全部塞在 104MB 的 <code>rf3Archive.arc</code> 里（头部声明 8033 个条目，但表里没有文件名字符串、偏移也对不上常规 NARC），我解到一半就停了。本机这份 BMP 是早就解好的，直接拿来用，不必再啃归档格式。</li>
                <li class="li"><b>换图</b>：<code>assets/title/rf3.png</code> = 该 BMP 转 RGB 后按原尺寸存的无损 PNG（P 模式调色板 → RGB → PNG，像素值一一对应，不缩放/不插值/不拼接/不补边）；旧的 <code>rf3.jpg</code>（marv.jp 大树村场景画）删除。</li>
                <li class="li"><b>可见带定位</b>：logo 的暖色像素集中在 <b>y=58..112</b>（中心 85）。<code>object-position: center 35%</code> 下，三列 16:9 框可见 y≈17..161（上下留白 42/48，基本居中），双列 96px 框可见 y≈37..124（假名底 112 下方还有 12px 余量）。同一个 35% 在两档下都安全。</li>
                <li class="li"><b>中途试过并全部弃用的合成方案</b>：把 <code>assets/logo/rf3.png</code>（金色 logo，420×120）叠到大树村场景上，试了无处理 / 白色外发光 12px / 20px / 黑色投影 / 下移构图——金色 logo 压在明亮树冠上对比始终不够，加发光又像贴纸、发雾。既然有原生标题屏，这些就都没必要了。</li>
                <li class="li"><b>结果</b>：第一行三张（RF1 金底、RF2 白底龙翼、RF3 蓝天生辉树）现在走的是<b>同一套逻辑</b>——ROM 原生 256×192 无损 PNG + 16:9 加高框 + 各自的 object-position，全部零修图；第二行起仍是 2.96:1 的横图窄条。</li>
            </ul>
            <h2 class="h2">2026-10-30　第一百零二次：符文1 也改用 16:9 加高图框（标题块居中、不再贴边），符文3 补齐第一行</h2>
            <ul class="ul">
                <li class="li"><b>起因</b>：第一百零一次把符文2 的图框加高到 16:9 后，用户说「1 也试试看」。符文1 是 96px 框里<b>刚好贴边</b>塞下 86px 标题块的，加高后可以变成「居中、上下留白」。</li>
                <li class="li"><b>定位</b>：标题块 RuneFactory 顶 y=62 →「— 新牧場物語 —」底 y=147，中心 104.5；144px 可见窗口的中心要对齐它 → 窗口落 y=33..177，换算 <code>object-position: center 69%</code>（<code>33 / (213-160) ≈ 69%</code>）。结果上下各留约 29px 金色花纹底板，三行标题不再顶到底边。</li>
                <li class="li"><b>顺带暴露的问题</b>：符文1/2 一加高，第一行里的符文3 仍是 96px 窄条，被栅格 <code>stretch</code> 拉到同高后，紫色文字区空出 64px，很扎眼。</li>
                <li class="li"><b>符文3 补齐</b>：它是纯场景画（大树村），没有必须完整的 logo 或群像，走 16:9 后由 CSS 取中间约 60% 宽度（<code>577/960</code>），树干居中、构图仍成立，第一行三张恢复等高。</li>
                <li class="li"><b>但它的加高只该在三列时发生</b>：三列第一行是 RF1/RF2/RF3，RF3 必须跟着变高否则被 stretch 拉长留白；而双列时 RF3 的同行是 RF3SP（窄条图），跟着变高反而让 RF3SP 空出一截。故单独给它 <code>.is-tall-lg</code>，样式写在 <code>@media (min-width:560px)</code> 里，只在三列断点生效。</li>
                <li class="li"><b>其余六张不能同法（实测后否决）</b>：RF3SP / RF4SP / RF5 的图都是按 2.96:1 构图的横图，改 16:9 要裁掉左右各约 20%——RF4SP 的群像会切掉两端的角色，RF5 右侧人物只剩一半，RF3SP 构图变挤。RF4 浮空船、RFF 天空底虽勉强能看，但为一致性也没动。</li>
                <li class="li"><b>结论</b>：<code>.is-tall</code> 只挂在第一行三张（RF1/RF2/RF3）；第二行起仍是 284×96 的窄条，比例与原构图一致。图本身仍未做任何缩放或重采样。</li>
            </ul>
            <h2 class="h2">2026-10-30　第一百零一次：符文2 图框单独加高到 16:9，龙翼尖不再被切（仍是零修图，改的是框不是图）</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：第一百次把符文2 换成日版原生图后，只能用 <code>object-position: center 43%</code> 框住字标与假名，<b>龙翼上半被切</b>。用户说「你可以想象边缘是什么」——意思是<b>被切的部分应该挑「能靠想象补全的」，不要切主体</b>。</li>
                <li class="li"><b>先试了镜像补全，否决</b>：把整块 logo 缩到 71.6%（256→183 宽）以便 134px 内容装进 96px 框，再把两侧各约 50px 用边缘镜像补出。结果<b>镜像把字标末尾的 R 和蓝色大 2 原样复制了一份</b>，一眼假。任何「缩小 + 造侧边」的路线都会撞上同一堵墙：画面左右边缘本身就是内容，不可能凭空延伸。</li>
                <li class="li"><b>换思路：动框，不动图</b>。符文2 的 logo 块是<b>龙翼尖 y=0 → 底部装饰三角 y=134，共 134px 原生高</b>；而 96px 框按宽 cover 只露 86.5px。<b>把这张卡的图框单独加高</b>即可，图仍然一个像素都不改。</li>
                <li class="li"><b>为什么是 16:9</b>：<code>284 宽 / (284/256) = 144px</code> 原生可见高 &gt; 134px，整个 logo 块一次装下，只让出最底部 <b>48px 的云与地色插画</b>——那正是「可以想象」的纯背景。选 4:3 全显（284×213）也能零裁切，但卡高翻倍、栅格直接塌，16:9（284×160）是兼顾下限。</li>
                <li class="li"><b>用 aspect-ratio 而不是固定高度</b>：<code>.wcard-fig.is-tall { height:auto; aspect-ratio:16/9 }</code>。16:9 是比例，可见原生高<b>恒等于 144px</b>，与列宽无关——实测 284/340/400 宽列下都是 144px；若写死 160px，手机单列卡变宽后反而会把 logo 底部切回去。</li>
                <li class="li"><b>渲染侧</b>：<code>TITLE_ART</code> 增加可选 <code>tall</code> 字段，渲染时给图框加 <code>is-tall</code>；<code>rf2</code> 的 <code>pos</code> 由 <code>43%</code> 改为 <code>0%</code>（顶对齐，可见带 y=0..144）。其余九张卡不受影响。</li>
                <li class="li"><b>代价（需知）</b>：这张卡比同排其他卡高 64px。栅格是 <code>stretch</code>，同一行仍等高，视觉上是「符文2 图更大、其余卡文字区留白多一点」，实测三列与手机双列均不塌。</li>
            </ul>
            <h2 class="h2">2026-10-30　第一百次：符文2 也改用日版 ROM 原生 256x192 无损图，零修图</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：第九十九次把符文1 改成零修图后留了个尾巴——符文2 仍走「ROM 透明 logo 贴蓝色渐变」。用户指出「符文2 也有一样的图」，并给出本机压缩包 <code>F:\BaiduNetdiskDownload\符文工房123.rar</code>。</li>
                <li class="li"><b>旧图的两个硬伤</b>：原来的 <code>rf2.jpg</code> 取自<b>旧汉化版</b> ROM，底部 y≈165..190 带「家在矿石镇汉化组汉化」水印；日文副标 <code>ルーンファクトリー</code> 还被改成了金色中文「符文工厂」。无论怎么裁都躲不开水印，只能保留合成方案。</li>
                <li class="li"><b>找到干净源</b>：压缩包内是三个官方日版 ROM（各 128MB，2009 年日期）。<code>符文工房2.nds</code> 的 <code>/res/obj/rune2_titleA01.{NCGR,NCLR,NSCR}</code> 解出来是<b>干净的官方标题画面</b>——没有水印、没有中文副标、没有金色「符文工厂」。用 <code>_nds_nitro.extract()</code> + <code>render()</code> 渲染成 256×256，裁掉下半留白（游戏只用上屏 256×192）。</li>
                <li class="li"><b>与符文1 的几何差异</b>：符文1 标题块只有 86px 高，正好等于可见带 86.5px；符文2 的 logo 块从龙翼 y=4 到副标底 y=133 约 <b>130px</b>，<b>放不下全部</b>。实测取 <code>object-position: center 43%</code>（可见带 y≈45..131）时，<code>RuneFactory 2</code> 字标、假名 <code>ルーンファクトリー</code>、龙身都完整，只有龙翼上半被切——这是 2.96:1 卡框装 4:3 画面的必然取舍，不是修图。</li>
                <li class="li"><b>改法</b>：<code>assets/title/rf2.png</code> = ROM 原生 256x192 无损 PNG（不缩放/不插值/不拼接/不补边）；<code>rf2.jpg</code> 删除；<code>app.js</code> 的 <code>TITLE_ART.rf2</code> 改指 <code>.png</code>，并给 <code>TITLE_ART</code> 加了可选的 <code>pos</code> 字段（渲染时写成内联 <code>object-position</code>），让 rf1(58%) 与 rf2(43%) 各用各的可见带；<code>build_titles.py</code> 增 <code>rf2_native()</code>，删掉整段「渐变底 + 透明 logo」合成代码。</li>
                <li class="li"><b>清理</b>：<code>_build_rf1card.py</code>、<code>_build_rf2card.py</code> 两个已被 <code>build_titles.py</code> 完全取代的旧构卡脚本一并删除（它们生成的正是 <code>rf1.jpg</code>/<code>rf2.jpg</code>，且引用的源图已不存在）。</li>
            </ul>
            <h2 class="h2">2026-10-30　第九十九次：作品卡图框比例修正（4.30:1 → 2.96:1），符文1 改用 ROM 原生 256x192 无损图，零修图</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：用户追问「能不能做到原始分辨率、不做任何 P 图」。查下来发现根因不在图，<b>而在卡片图框的高宽比做错了</b>：<code>.wcard-fig</code> 高度是 <code>4.1rem</code>（66px），卡宽 284px → <b>4.30:1</b>；而所有配图都是 960x325（<b>2.95:1</b>）。两者差太多，<code>object-fit:cover</code> 的结果是<b>每张图都被上下各切掉约 31%</b>——不只是符文1，rf2 的龙翼顶部、rf3 的构图、rf4/rf5 的 logo 全都被切。</li>
                <li class="li"><b>几何账</b>：NDS 原生画面是 256x192（4:3），符文1 标题块（RuneFactory 顶 y=62 → 「— 新牧場物語 —」底 y=147）在原生图上只有 <b>86px 高</b>。旧框 284x66 下按宽 cover，可见的原生高度只有 <code>66 ÷ (284/256) = 59.5px</code>——<b>差 26.5px，副标必然被切</b>，这时只能靠缩图 + 造侧边（就是前几次的补天空/镜像/去天空留 logo），全部属于修图。</li>
                <li class="li"><b>改法</b>：把 <code>.wcard-fig</code> 高度 <code>4.1rem → 6rem</code>（96px，<b>2.96:1</b>，与 960x325 同比例），<code>object-position</code> 由 <code>center 42%</code> 改 <code>center 58%</code>。改后原生 256x192 的可见高度是 <code>96 ÷ (284/256) = 86.5px</code>，<b>刚好装下 86px 的标题块</b>（可见带落在 y≈61.2..147.7，与标题 62..147 精确对齐）。</li>
                <li class="li"><b>符文1 成品改为零修图</b>：<code>assets/title/rf1.png</code> 就是 ROM 图层合成结果的<b>原生 256x192 裁切</b>——不缩放、不插值、不拼接、不补边、去天空、不加模糊。<code>rf1.jpg</code> 已删除，<code>app.js</code> 的 <code>TITLE_ART.rf1</code> 改指 <code>.png</code>，<code>_inline.py</code> 的 <code>title_block()</code> 增补 <code>*.png</code> 扫描（MIME 用 image/png，保持无损）。</li>
                <li class="li"><b>附带收益</b>：另外 9 张 960x325 的图在新框下可见 <b>324.5/325 px</b>（几乎零裁切），全部比以前完整——rf2 龙翼不再切顶、rf3 绿树构图完整、rf4/rf5 的 "Rune Factory 4/5" 字不再只剩一半。</li>
                <li class="li"><b>说明（物理上限）</b>：原生像素只有 256px 宽，卡片在 2 倍屏上要 568 物理像素，浏览器必须放大 2.22 倍，理论上会比「用 582px 截图另做一张」略柔。这是「用原始像素」的必然代价；实测在 1x 真实卡面下三行标题均清晰可读，看不出柔化。</li>
                <li class="li"><b>未做（第一百次已补上）</b>：符文2 这次走不了这条路——当时的源图取自旧汉化版 ROM，logo 占 y≈5..145（要框高 ≥155px），且底部 y≈165..190 带「家在矿石镇汉化组汉化」水印。第一百次改用日版 ROM 的干净原生图后，rf2 也已换成零修图。<b>本条保留原貌，作为当时的决策记录</b>。</li>
            </ul>
            <h2 class="h2">2026-10-30　第九十八次：rf1 横幅去掉两侧模糊，改用「纯天空窄条逐行镜像」补齐（清晰、零色差接缝）</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：第九十七次为补出「— 新牧場物語 —」，把标题块缩入可见带后，两侧用高斯模糊底 + 大羽化过渡。用户反馈<b>不要模糊</b>——卡面上两侧确实是雾状，和中间清晰区对比明显。</li>
                <li class="li"><b>为什么侧边必须补</b>：卡片可见带折算回源图只有约 135px，而标题块（RUNE FACTORY 顶 y≈155 → 副标底 y≈320）要 165px，只能先缩到占宽约 78%，左右各留约 11%（约 107px）要补。而 4:3 的源画面在 4.3:1 画幅下<b>数学上不可能全幅铺满还保住副标</b>，侧边内容只能造。</li>
                <li class="li"><b>试过并否掉的补法</b>：① 逐行边缘色插值／纯色填充——面板边缘本身就是亮白云，铺开成一条白带，接缝反而更明显；② 镜像整块面板——会把 R 花饰镜像出来；③ 从 ROM 图层 A02 按洋红抠图——透明区是洋红＋蓝双色抖动，抠完剩一屏蓝条；④ 逐行取天空主色铺满再只叠金字的「去天空留 logo」——背景过浅，把金字的白描边吃掉，对比全失。</li>
                <li class="li"><b>最终做法</b>：每行取面板最外侧 <b>18px 纯天空</b>（源图上 R 花饰约从 x≈25 起，18px 内是纯天空），按 2K 周期镜像铺向两侧——接缝处像素与面板边缘<b>完全相同</b>，既零色差又是真实像素，全程无任何模糊；再对侧区沿 y 做 <b>3 行均值</b>压掉逐行镜像的纵向条纹（只作用于侧区，面板不动）。</li>
                <li class="li"><b>构建</b>：<code>_title_src/build_titles.py</code> 的 <code>rf1_banner()</code> 已换成该算法（参数 <code>strip=18, vs=1</code>），重跑可复现；其余 9 张未动。</li>
                <li class="li"><b>核验</b>：按真实卡面 284×66 出图确认——金字与「新牧場物語」清晰，两侧是清晰天空像素（无雾感）、无可见接缝。</li>
            </ul>
            <h2 class="h2">2026-10-30　第九十七次：符文1 作品卡横幅补出「— 新牧場物語 —」副标题（原先被卡片可见带切掉）</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：上一版 <code>assets/title/rf1.jpg</code> 直接按 2.95:1 裁横带，把标题画面下方的「—　新牧場物語　—」（符文1 的日版副标，中文圈即《符文工房：新牧场物语》）连同一截「ルーンファクトリー」切掉了，卡上只剩被放大的 RUNE FACTORY。</li>
                <li class="li"><b>约束算账</b>：卡片图框 284×66（4.30:1）＋<code>object-position:50% 42%</code>，960×325 里只有 <b>y≈43..266（223px）</b>可见，折算回源图（582×442）只剩约 <b>135px</b> 高度；而标题块从 RUNE FACTORY 顶（y≈155）到副标底（y≈320）需要 <b>165px</b>——<b>直接 cover 数学上必然切掉副标</b>，只能先等比缩小。</li>
                <li class="li"><b>做法</b>：源图裁 y=151..325 的标题整块（金字＋假名＋副标），等比缩到卡片可见带高度（占画布宽约 78%），再按<b>逐行取左右边界色向两侧插值</b>补出天空、整块做 56px 羽化——这样接缝处颜色严格相等，不会出现「一张照片贴在蓝底上」的硬边（试过镜像延展、边缘拉伸、加白边三种都留痕，已弃用）。</li>
                <li class="li"><b>构建</b>：<code>_title_src/build_titles.py</code> 新增 <code>rf1_banner()</code> 与 <code>card_band()</code>，rf1 改走该函数，重跑可复现；其余 9 张未动。</li>
                <li class="li"><b>核验</b>：按真实卡面 284×66 出图确认——RUNE FACTORY 左右花饰完整、未被切；下方「ルーンファクトリー」与「— 新牧場物語 —」两行在 1x 下可辨认；两侧天空过渡无可见接缝。</li>
            </ul>
            <h2 class="h2">2026-10-30　第九十六次：重做「符文工房1」「符文工房2」作品卡横幅（标题 logo），修掉符文2 的整幅横条纹</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：作品卡横幅（<code>assets/title/rf1.jpg</code>、<code>rf2.jpg</code>）上一版出图有缺陷——符文2 用「按行取左边缘色横向拉伸」铺底，出现满幅横条纹、小图块偏置；符文1 金字发虚、带光晕。</li>
                <li class="li"><b>做法</b>：符文1 改用 DeSmuME 实机标题截图（蓝天＋蓝飞龙＋金字全幅），按卡片真实可见带（图框 284×66、<code>object-fit:cover</code>＋<code>object-position:50% 42%</code> → 源图 y≈43..266 才可见）裁横带后轻锐化；符文2 改用 ROM 原生<b>透明</b> logo（龙形纹章 Rune Factory 2）贴卡片同色蓝渐变（#2f6f93→#86bcd8），因为 NDS 标题屏是 4:3，直接裁 2.95:1 会上下劈断龙翼。</li>
                <li class="li"><b>构建</b>：<code>_title_src/build_titles.py</code> 的 rf1/rf2 两处已改用上述源与方法（原先走桌面单层 <code>NCGR.BMP</code>、以及 <code>_build_rf2card.py</code> 的横向拉伸都会复现横条，已不再作为出图路径）；成品 <code>assets/title/rf1.jpg</code>/<code>rf2.jpg</code> 入库，standalone 同步内联，其余 8 张未动。</li>
                <li class="li"><b>核验</b>：按真实卡面 284×66 可见带出图确认——两作标题 logo 完整居中、无横条纹/错位；主品牌字「Runefactory」「Rune Factory 2」均完整可见。</li>
            </ul>
            <h2 class="h2">2026-10-30　第九十五次：补 BOSS 战「符文工房4（RF4）」14 位主线 BOSS，boss 页由六作扩到七作</h2>
            <ul class="ul">
                <li class="li"><b>数据源</b>：fandom「therunefactory」怪物数值表（每只 BOSS 给完整 HP/ATK/DEF/M.ATK/M.DEF + 七项百分比抗性）、GameFAQs 主线流程攻略（弗雷克火龙/普罗戴地龙弱点）、biligame RF4 主线页（出场顺序与 3DS 汉化版官方译名）。</li>
                <li class="li"><b>接入</b>：<code>boss.js</code> 新增 <code>BOSS.rf4</code>（14 条，按主线出场顺序：安布洛希亚→雷电→悬丝傀儡→死亡树→奇美拉→霸王花→左之/右乃→石棺→塞克斯龙→普罗戴地龙→弗雷克火龙→阿克娜水龙→埃塞尔巴德）；<code>pages.js</code> 新增 <code>blk4</code> 渲染（七项百分比弱点/抗解析：负弱正抗、绝对值越大越极端、双极值并列标红、定性「X弱Y抗」照实不换算数字）；boss 页 <code>gms</code> 加 <code>rf4</code>、<code>intro</code> 六作改七作、<code>per</code> 加 <code>rf4</code>。</li>
                <li class="li"><b>口径（铁律）</b>：7 位 BOSS（安布洛希亚、霸王花、左之、右乃、石棺、塞克斯龙，及只给弱点不给攻防的弗雷克火龙/普罗戴地龙）线上无可靠 HP/攻防源，数值<b>留空标「待补」、不推算</b>；弱点/抵抗只在 GameFAQs 明确写到时才填，其余标待补。rf4 与 rf5 同为百分比系数量纲，已并入「战斗与弱点」页 RF4 一节同源对照。</li>
                <li class="li"><b>覆盖第九十四次</b>：上条日志「rf4 仍缺…boss 页暂不实装」已被本条覆盖——四代现已实装，boss 页口径由「六作」更正为「七作」。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 354、异常 0；<code>node --check</code> 两文件 exit 0；头像 8 作 214 张、缺 0。</li>
            </ul>
            <h2 class="h2">2026-10-30　第九十四次：补 BOSS 战「符文工房 边境（RFF）」12 位主线 BOSS，boss 页由五作扩到六作</h2>
            <ul class="ul">
                <li class="li"><b>数据源纠正</b>：此前清单把 rff 标为「无数值源」，实际 biligame <code>RFFmonster</code> 页含 9 组主线 BOSS（鸡鹫兽/拟态史莱姆/艾莉丝/魔力驱动单元A-D/瓦格纳/魔法生物/杰尔文/冰蛇/电力海月乌贼）且带 Lv/HP/攻/防/魔攻/四属性点数——与本站魔物图鉴 <code>rffmon.js</code> 同源，数据混在图鉴里被漏看。</li>
                <li class="li"><b>接入</b>：<code>boss.js</code> 新增 <code>BOSS.rff</code>（12 条，按 Lv 升序，雪草遗迹地下3层同场的艾莉丝＋四台驱动单元合并列出）；<code>pages.js</code> 新增 <code>blkRff</code> 渲染（四属性点数弱点解析：双最小并列标红、全属性均等标无弱、单属性项与「—」照实不臆测）；boss 页 <code>gms</code> 加 <code>rff</code>、<code>intro</code> 文案五作改六作。</li>
                <li class="li"><b>rf4 仍缺</b>：biligame 无集中剧情 BOSS 数值页，四代抗性明细在 <code>battle</code> 页（resist4.js），boss 页暂不实装，需用户拍板英文名译法或提供源。</li>
                <li class="li"><b>校验</b>：node _verify 353 实例 0 异常；node --check 两文件 exit 0。</li>
            </ul>
            <h2 class="h2">2026-10-30　第九十三次：rf2/rf3 头像统一 160×160（脸占框≈65%，与 rf1/rf4 一致）；rf5/rfo 因源是游戏内小图标（64/72px）统一/保持 128 而非 160</h2>
            <ul class="ul">
                <li class="li"><b>背景</b>：符文1（第九十二次）按 rf4 口径统一成 160×160 后，剩 rf2（105～116px 乱跳）、rf3（20 张 160 + 5 张不足 160）、rf5（64/128px 混排）、rfo（23 张 128）规格不齐。</li>
            <li class="li"><b>rf2</b>：源是 A6NJ 512×256 立绘，与 rf1 同规格，直接套 <code>face_ratio: 0.65</code>+<code>exact_side</code>+<code>max_side: 160</code>，清空原 over（帽子/宽肩/大刀在头框外、不影响头框计算）。28 张全 160×160；头框高占比 0.48～0.55（均值 0.53），与 rf1 几乎逐张一致。</li>
                <li class="li"><b>rf3</b>：原有 <code>max_side:160</code> 但缺 <code>exact_side</code>，导致 5 张不足 160 的（129/151/156/158）没放大。补 <code>exact_side:True</code>，保留 <code>head_anchor</code> 自动测量与 over 微调；连同之前缺源的两张（kururfa/ondolfa）也强制 resize 到 160。26 张全 160×160；头框高占比 0.46～0.62（均值 0.55），与 rf1/rf4 一致。</li>
                <li class="li"><b>rf5 / rfo 源限制</b>：rf5 源是 PC 版 Unity HUD 图标（64/128px）、rfo 源是 PS3 72×72 游戏内小头像。这两作硬拉到 160 是负优化（小图插值放大比保持更糊）——故 rf5 把现有 30 张统一 resize 到 128（64 那批升级、128 保持），rfo 保持 128（已是 72→128 的合理上限）。如坚持 160 口径可再拉，代价是略糊。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0；重建 standalone（219 张头像内联，14.4MB）。</li>
            </ul>

            <h2 class="h2">2026-10-30　第九十二次：符文1 头像统一 160×160（脸占框≈65%）</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：符文4 已统一 160×160，但符文1 头像还在 83～216px 乱跳（camus/white 83、anne 107、jacolnus 216…），且没开 <code>exact_side</code>，小图在 2x 屏列表（2.1rem）/ 详情（5.4rem）下发虚。</li>
                <li class="li"><b>改法</b>：给 <code>_build_faces.py</code> 的 rf1 分支加 <code>face_ratio: 0.65</code> + <code>exact_side / max_side: 160</code>。新逻辑按「内容框上半部（剔除肩膀）的紧致头框较长边 ÷ (0.65×0.9)」定<b>源框</b>，再缩到 160——比把 83px 硬拉大到 160（约 2 倍插值必糊）锐得多，因为采样自 512 宽的高分辨率源。</li>
                <li class="li"><b>实测</b>：32 张全 160×160；头<b>高度</b>占比 0.44～0.55（均值 0.53）高度一致；头宽度 0.34～0.68 的差异主要是角色脸型本就不同（mist/ragna/rosetta 是真·瘦脸，leo 0.68 偏高是其自带大锤占左下角）。无空白、无裁脸事故。</li>
                <li class="li"><b>两处非事故说明</b>：<code>xt_baby</code> 是 Q 版斜躺豆荚（脸完整、举小手）；<code>leo</code> 扛大锤，头在右上、锤在左下，按头中心居中裁，脸完整——均属原画构图，不是裁切错误。</li>
                <li class="li"><b>待续</b>：rf2（105～116px）、rf3（5 张非 160）、rf5（64/128px 混排）仍待统一，等符文1 确认后逐作推进。改完已重建 standalone（<code>_inline.py</code> 把新头像内联进 FACE_DATA，218 张头像共 8.6MB）。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>

            <h2 class="h2">2026-10-30　第九十一次：符文1 卡片 logo 下缘被切——重算横带；符文2 补锐化</h2>
            <ul class="ul">
                <li class="li"><b>先说发现的问题</b>：把卡片真正看得见的那条带（<code>y≈43~266</code>）单独裁出来看，符文1 的金色 logo <b>下缘被切掉一截</b>。原因是横带取的是源图 <code>y=130~265</code>，而金色 logo 实测在源图 <code>y=184~275</code>（按金色像素统计，不靠眼睛估），底部 10 行落在带子外面。</li>
                <li class="li"><b>改法</b>：横带改成源图 <code>y=140~330</code>（190 行），logo 落到卡片 <code>y≈95~201</code>，上下都留得住，副标题也进来了；锐化从 75 提到 90。脚本 <code>_build_rf1card.py</code>。</li>
                <li class="li"><b>符文2</b>：ROM 源图只有 256 宽，放大 3.7 倍后金 logo 和龙纹发糊，补一刀 <code>UnsharpMask(radius=2, percent=85)</code>，其余几何（块高 285、留白 26、羽化 18、两侧罩蓝 72%）不动。</li>
                <li class="li"><b>飞龙还是没解开，这轮又试了一遍</b>：<code>obj_title_bgA</code> 的 NCER 是 extended(1) 型——cell 描述 16 字节（<code>numOAM / attr / oamOffset / maxX,maxY,minX,minY</code>），28 个 OAM 各 6 字节跟在描述数组后面。单个精灵确实能看出鳞羽云纹，<b>但整条拼出来仍是两块分离的斑块，中间空一块</b>：按无符号 y 摆是上下两团、按带符号 y 摆是一团碎块。又把图块映射穷举了一遍（1D、行列转置、2D 宽 4/8/12/16/20/24/32/48/64、固定行跨距 1~64），<b>没有任何一种能做到「图块不重叠」</b>，最少也要重叠 72 块——说明图块本来就是复用的，不是映射错。结论不变：<b>静态拼不出这条龙</b>（很可能靠代码逐帧挪 OAM，NANR 里只有 1 帧没有轨迹），符文1 卡片继续用实机截图。</li>
                <li class="li"><b>顺手记一笔</b>：<code>title_bgA.NCGR</code> 其实是 <b>8bpp / 1024 块</b> 的，不是 4bpp；三个 NSCR 都是 32×32 块（256×256），<b>只有上 192 行是真画面，下面全是洋红占位色</b>，别当成内容。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>

            <h2 class="h2">2026-10-30　第九十次：修掉 Nitro 图块的偏移 bug，符文2 作品卡改用 ROM 标题画面</h2>
            <ul class="ul">
                <li class="li"><b>先修一个真 bug</b>：NCGR 的 RAHC 头里，图块数据偏移是相对 <code>section+0x08</code> 的，之前写成 <code>base+0x18+off</code>，整体<b>偏后 16 字节</b>。8bpp 图块因此错开 1/4 块，画面出现周期性横条——<b>上一轮把它误判成「逐行滚动视差，静态拼不出来」，其实是纯偏移算错</b>。改回 <code>base+0x08+off</code> 之后，符文1 的天空、角色田野、金色 logo 全部干净无条纹。4bpp 文件因为图案规则，错 16 字节看不出来，所以才一直没被发现。</li>
                <li class="li"><b>符文1 的图层清单</b>（<code>title_bgA/B/C</code> 各 256×256，都是干净的）：<code>A+NSCR01</code>=蓝天白云；<code>A+NSCR02</code>=金色 <code>Rune Factory</code> logo 带日文副标题、透明底；<code>A+NSCR03</code>=天空+日文标题；<code>B+NSCR01</code>=男女主角与草原；<code>B+NSCR02</code>=菜单按钮；<code>B+NSCR03</code>=菜单文字与版权；<code>C</code>=金色华丽大 logo。</li>
                <li class="li"><b>飞龙没解开</b>：那一圈蓝色飞龙是 <code>obj_title_bgA</code> 精灵（384 块 4bpp、28 个 OAM、带 NANR 动画）。OAM 表能解出来（图块号 0→88 单调递增、坐标落在 32 像素栅格上），单个精灵也能看出鳞羽纹理，但整条拼出来对不上实机画面，试过 1D / 2D(8/16/32/64) 映射、图块基址扫描、按行偏移校正，都不成。<b>先按「没核实就不写」放着</b>，符文1 的卡片继续用实机截图——那份是 582×442，比 ROM 原生的 256×256 还清楚。</li>
                <li class="li"><b>符文2 换图</b>：原来的 <code>rf2.jpg</code> 是白底 logo 图，压在蓝渐变上像贴纸。改成 ROM 里的 <code>/res/obj/rune2_titleA01</code>——真正的标题画面：彩虹渐变底 + 金色龙形纹章 + <code>Rune Factory 2</code> + 日文副标题 + 中文「符文工厂」。合成脚本 <code>_build_rf2card.py</code>。</li>
                <li class="li"><b>三个合成要点</b>：① 背景用源图左边缘按行取色铺成渐变（logo 从 x=10 才开始，左边 3px 是纯背景）；② 背景和 logo 块必须按<b>同一个缩放比</b>放大，否则底图在 logo 块的位置显示的是源图别的行，接缝会非常扎眼；③ logo 块先用边缘行列复制补一圈留白再羽化，被吃掉的是留白而不是 <code>Rune Factory</code> 的字。</li>
                <li class="li"><b>浅底的处理</b>：这张标题画面本身是奶油浅底，直接铺开会发白发灰。所以两侧用卡片主题蓝（<code>#86bcd8 → #2f6f93</code>）罩染 72%，中间给 logo 留暖调，过渡用遮罩高斯模糊 60px 做——金 logo 不被压暗，画面又有层次，也和卡片下半部的蓝渐变接得上。</li>
                <li class="li"><b>符文3 取不了</b>：<code>符文工厂3nds（官中导入版）v1.5.3.nds</code> 的 FNT 只有 125 字节、FAT 只有 24 项，文件系统是被精简过的，素材拿不出来。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>

            <h2 class="h2">2026-10-30　第八十九次：符文1 作品卡改成实机标题画面（蓝天 + 飞龙 + 金色 logo）</h2>
            <ul class="ul">
                <li class="li"><b>起因</b>：上一版用 ROM 里的菱格纹 + 天空拼了一张，能看但"不像游戏画面"。符文1 真正的标题画面是蓝天白云 + 一条蓝色飞龙环绕金色 <code>Rune Factory</code> logo，那就照这个来做。</li>
                <li class="li"><b>素材</b>：ROM 里的 <code>title_bgA/B</code> 是逐行滚动的视差层，静态拼一定出周期横条，出不来这个组合；改用 DeSmuME 实机截图（上屏 582×442），存 <code>_title_src/src/rf1_desmume_title.png</code>。</li>
                <li class="li"><b>关键几何</b>：卡片图框实测只有 <b>284×66</b>，<code>object-fit:cover</code> + <code>object-position:50% 42%</code>，960×325 的图被裁到只剩 <code>y≈43~266</code> 这 223px（69%）。之前按 410px 宽估算成"只看到 47%"，logo 位置全算错。</li>
                <li class="li"><b>做法</b>：不塞整屏（4:3 塞进去 logo 必被切掉），只取源图 <code>y=130~265</code> 这条横带——刚好把金色 logo（165~250）框全，上方还能带出龙身——拉到满宽 960，再提一档饱和/对比（原图偏灰）让龙纹和金字立起来。</li>
                <li class="li"><b>踩坑</b>：模拟器截图左右各有约 3px 灰色窗口边，直接镜像延伸会在卡片右缘留一条黑线。改成按"蓝远大于红"自动找画面边界裁掉。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>

            <h2 class="h2">2026-10-30　第八十八次：作品卡试过一版模糊底图，看完撤回整图</h2>
            <ul class="ul">
                <li class="li"><b>起因</b>：十张卡里只有符文4 用整图垫着，其余九张是渐变 + 透明 logo，排在一起像一排色卡，于是给每张卡补了一层主视觉底图。</li>
                <li class="li"><b>试的做法</b>：各作取自己的标题画面模糊 7px 铺底，logo 清晰浮在上面，底图只显上半张、往下淡出到纯渐变。混合模式必须用正片叠底——符文2、5、3特别版、4豪华版的标题图是白底，正常叠加会把整张卡糊成一片白雾。</li>
                <li class="li"><b>撤掉的原因</b>：模糊之后画面信息全糊掉了，卡片只剩「一团色块 + 一个小 logo」，辨识度反而不如整张官方图。配图的目的是一眼认出是哪一作，不是做氛围，所以整图铺满更直接。</li>
                <li class="li"><b>现在的样子</b>：卡片顶部整张官方标题图 cover 铺满（<code>object-position: center 42%</code>，把 logo 主体留在可视区），底部叠一层暗角过渡到作品色渐变，再往下是名称与发售信息。也就是回到第八十五次「10 部全部配上官方图」的版式。</li>
                <li class="li"><b>留个坑</b>：CSS 变量里的 <code>url()</code> 是按样式表位置解析的，写进 <code>style</code> 属性会指向 <code>css/assets/...</code> 直接 404；以后要把图塞进自定义属性，得用真实元素内联 <code>background-image</code>。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>

            <h2 class="h2">2026-10-30　第八十七次：作品卡从截图改成透明 logo，九作统一</h2>
            <ul class="ul">
                <li class="li"><b>上一版的问题不是图不好，是不统一</b>：十张卡各用各的素材——符文3 和符文4 是纯背景画（压根没有 logo），符文3特别版、5 是从 Steam 胶囊图裁的，符文4豪华版只截到 logo 顶部一点，符文海洋那张圆窗两侧还压着白条。</li>
                <li class="li"><b>做法改成「透明 logo 浮在卡片渐变上」</b>：卡片的渐变本来就是每作主题色，logo 直接坐上去，不再铺底色、不再压暗角——那层暗角会把 logo 的白色外发光吃掉。</li>
                <li class="li"><b>图源</b>：符文3 取自 marv.jp 官方站的 <code>img/title.png</code>（616x176，干净透明）；符文3特别版、4豪华版、5、龙之天地取自 Steam 商店页的 <code>logo.png</code>（640 宽 RGBA，这条 CDN 直链在本机通，商店页本身仍是 000）；符文1、2、边境、海洋沿用之前从游戏本体解出来的四张。</li>
                <li class="li"><b>尺寸做了等面积归一</b>：十作 logo 的宽高比从 1.55（海洋，方形带棕榈）到 3.5（符文3，细长条）差一倍多。只按宽度归一，细长条会占满而方形显得小；只按高度归一，细长条又超出卡片被 contain 缩小。改用 <code>sqrt(w*h)</code> 做基准，视觉重量最接近。构建脚本 <code>_logo_src/build_logos.py</code>，只缩不放，免得 DS 原尺寸的 logo 被插糊。</li>
                <li class="li"><b>符文4 还是空白</b>：原版是 2012 年 3DS 独占，不在 Steam，官方站也只剩一个跳转页。试着从本机的 <code>符文工房4 汉化版.cci</code> 里解包，<code>ctrtool -p -n 0 --romfsdir</code> 能完整导出 1.4GB 的 romfs，里面确实有 <code>effect/tex/logo_rune4.bctex</code>（CGFX 容器，ETC1A4，512x256，左右眼各一张）。但 3DS 的 ETC1 块排布和标准 ETC1 不同，解出来颜色和形状都对、块是错位的，暂时没攻下来，先留着云海背景图过渡。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>

            <h2 class="h2">2026-10-29　第八十六次：符文4 的 27 张头像重新标框，脸的大小对齐了</h2>
            <ul class="ul">
                <li class="li"><b>起因是「同一个页面里头像大小不一」</b>：符文4 的立绘有两种来源——官网那批 540x1098 的全身彩图，和 wiki 上解包的 200x255 半身图。前一批是手工标框的，后一批走自动测量，两边标准不同，裁出来边长从 92 到 224 都有；脸占框的比例更乱，从 45% 到 80%。列表里 2.1rem 的圆形头像排下来，有的人脸撑满圆圈，有的人一张小脸浮在中间。</li>
                <li class="li"><b>四张是真的坏了，不只是不好看</b>：玛格丽特的框整个偏到了胸口，裁出来只剩右半张脸；雷斯特的框落在人物左侧的空白里，脸只占框的四成；芙蕾的框顶在下巴上，只有额头到眼睛；波可莉奴本来就走自动测量，半身特写的「头宽」量成了整幅画布（side 224），脸被压到左下角。另外琥珀的下巴正好压在框底、被削掉一线。</li>
                <li class="li"><b>自动测量在这批图上本来就不该用</b>：官网立绘的姿态太花——迪拉斯手上斜着一根鱼竿、朵儿洁顶着宽檐帽、奇尔盘腿坐着、两位主角半身还拿扇子和围巾，包围盒全被道具带跑；解包那批人物头顶直接贴着画布上沿（y0=0），band 量出来的「头宽」其实就是画布宽，钠茜那几张甚至算出 <code>left=-14</code>。<b>这次就一个不剩，27 张全部手标</b>，坐标写在 <code>_build_faces.py</code> 的 <code>face_box</code> 里。</li>
                <li class="li"><b>顺带定了一条规格</b>：脸高约占框宽的 <b>65%</b>，头顶留 6～8%。输出一律 <b>160x160</b>（详情页头像 5.4rem，2x 屏要 172px，160 够用），不足的放大补齐。以后补新角色按这个比例标就行，不会再出现「一张脸大一张脸小」。</li>
                <li class="li"><b>改了三个工具留在仓库里</b>：<code>_rf4_zoom.py</code>（源图放大＋原图像素网格，用来读头顶、下巴、脸中心的坐标）、<code>_rf4_try2.py</code>（同一角色多个候选框并排试裁，一次看六位）。标框时别凭换算，直接看裁出来的样子最快。</li>
                <li class="li"><b>代价</b>：<code>assets/face/rf4/</code> 从 950KB 涨到 1.37MB，单文件版从 11.1MB 到 11.9MB。换来的是同一页 27 张脸一样大。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>
            <h2 class="h2">2026-10-29　第八十五次：村民喜好扩到七作全线，生日排成一张全年表</h2>
            <ul class="ul">
                <li class="li"><b>这一页此前只有符文4／5</b>：两作靠解包表，带 FP 数值与四档清单，但另外五作（符文1／2／3／边境／海洋）在站内<b>根本没有「村民喜好」这一页</b>——查某个人喜欢什么，只能进他的人物档案，一个一个点。这次把这一页的适用范围接到七作，缺的是<b>页面</b>，不是数据。</li>
                <li class="li"><b>数据一点没新增</b>：五作用的是「人物档案」同一份 <code>js/npcfull.js</code>（字段 <code>b</code> 最喜欢／<code>l</code> 喜欢／<code>h</code> 讨厌／<code>w</code> 最讨厌／<code>bg</code> 生日礼物／<code>pf</code> 喜欢的香水／<code>bd</code> 生日），源页还是 biligame 符文工厂 wiki 的各作人物页。<b>本页只是把同一份数据横过来看</b>，所以你在人物页和这里读到的清单必然一致，不存在两套口径。</li>
                <li class="li"><b>各作档位本来就不齐，不硬凑成统一模板</b>：初代<b>没有「讨厌」档</b>（送错不掉好感，只是白送），符文2 <b>没有「最喜欢」档</b>（改用每人一件的生日礼物），边境与海洋<b>没有「最讨厌」档</b>。页面按该作实有的档位出列，缺的那一栏不摆空表头——并在开头单独说明一句，免得被当成漏收。</li>
                <li class="li"><b>加了「全年生日表」</b>：原来只有按人查的速查卡，这次多一张按 春夏秋冬 → 日 排序的日历，一行一个人，后面跟着「那天该送什么」。生日当天送礼是这套系统里<b>唯一有明确倍数收益</b>的时刻，把日期先排出来比背清单有用。同日多人时不做任何合并，各占一行。</li>
                <li class="li"><b>雷区按人数据实算，不写死结论</b>：符文3 的「垃圾」被 <b>22 / 24</b> 人讨厌、「杂草」13 人；边境的「枯草」「杂草」各 <b>25 / 26</b> 人、废铁与失败之作各 24 人——这两作的垃圾是真正的人人喊打。符文2 与海洋则相反，最多的一样也只被 3 个人点名，页面会直接说「没有公认垃圾，别凭经验推」。同一段文案，两种结论，全部由数据决定。</li>
                <li class="li"><b>「最喜欢」的粒度各作差很多</b>：符文1／边境基本是一人一件、互不重复，所以没有通用礼物；符文3 有人列到 25 样、且「白水晶」「金刚花」这类有 4 人同时点名。页面对这两种情况给的是相反的建议——前者「只能按人查」，后者「这几样可以当常备」。</li>
                <li class="li"><b>校验</b>：<code>node _verify.js</code> → 页面实例 352（原 346，新增六作各一页）、异常 0；头像 8 作 214 张、缺 0。</li>
            </ul>
            <h2 class="h2">2026-10-29　第八十四次：首页十张作品卡全部配上图，放弃抠 logo 改整图</h2>
            <ul class="ul">
                <li class="li"><b>先走错了一步</b>：起初的做法是把各作 logo 从标题画面里抠出来、透明背景贴在卡片上。做到符文1／2 时发现不对——这两代的标题画面本身就是「logo＋底纹＋日文副标题」一整套，抠掉底纹只留字，反而把原设计的层次拆散了；而且低分辨率的 NDS 标题图去掉底之后边缘全是锯齿。<b>改成每作只用一张整图</b>，不做抠图。</li>
                <li class="li"><b>十作的图源</b>：符文1／2／边境／海洋取自本机解包（<code>title_bgC</code>、<code>rune2_titleA01</code>、Wii 官网 <code>main.swf</code> 里内嵌的 JPEG、PS3 版 <code>LUGTITLE</code> PSD 关掉汉化组文字层）；符文3／4 取当年日文官网与攻略站的页面背景画；符文3SP／4SP／5 与龙之天地取 Steam CDN 的 <code>capsule_616x353</code>／<code>library_hero</code>。——<b>Steam 商店页本身在本地网络下 000 不通</b>，但 <code>cdn.cloudflare.steamstatic.com</code> 的图片直链是通的，所以按已知 appid 直接取图。</li>
                <li class="li"><b>统一成 2.95:1</b>：卡片图区是 195×66，比例正好 2.95。所有原图按这个比例裁切，输出 960×325 的 JPEG（质量 88），十张合计 659KB。构图用两种模式：能裁的用 <code>cover</code>（按比例裁，保留主体），构图不能动的用 <code>fill</code>（按高度铺满、左右用边缘色延伸并轻微模糊）。</li>
                <li class="li"><b>海洋单独调了裁切位置</b>：它的标题画面是个圆窗构图，按默认居中裁会把圆窗两端切掉、横条里只剩中间一截。改成 <code>cover</code> 并把纵向锚点下移到 0.45，圆窗才完整落在框内。</li>
                <li class="li"><b>构建可复现</b>：出图脚本 <code>_title_src/build_titles.py</code>、原图放在 <code>_title_src/src/</code>（已 gitignore，不进仓库），成品 <code>assets/title/*.jpg</code> 入库；<code>_inline.py</code> 同步把 <code>TITLE_DATA</code> 内联进 standalone，单文件版不会破图。</li>
            </ul>
            <h2 class="h2">2026-10-29　第八十三次：站点图标换成芜菁，favicon 全套</h2>
            <ul class="ul">
                <li class="li"><b>图标来自游戏内素材</b>：用的是一张 23×24 的芜菁（かぶ）RGBA 透明图标，1.1KB，来自 biligame wiki 的图片直链。尺寸远小于常规 favicon，所以按档位分别出图，不让工具统一重采样。</li>
                <li class="li"><b>三档各塞自己的 PNG</b>：<code>favicon.ico</code> 内嵌 16／32／48 三档，每档单独从原图缩放，而不是放大一份再让 PIL 统一采样——小图统一重采样会糊。另出 192 与 180（apple-touch）两张，分别给桌面与 iOS 主屏。</li>
                <li class="li"><b>体积</b>：<code>assets/icon/</code> 从 364KB 压到 130KB。</li>
            </ul>
            <h2 class="h2">2026-10-29　第八十二次：龙之天地头像补齐 21 张，全站八作 214 张缺 0</h2>
            <ul class="ul">
                <li class="li"><b>此前 azuma 一张头像都没有</b>：<code>faces.js</code> 里连段都没有，居民列表全靠首字色块。这次分两批补齐，都是官方素材。</li>
                <li class="li"><b>主角／候补／神 17 张</b>：取自官方 web manual（marv.jp）的角色卡 <code>ch01_tn</code>–<code>ch17_tn</code>，文件名带 <code>_tn</code> 但实际是 490×560 的头肩像，分辨率够。手册页按钮顺序即角色顺序，逐张核对外观。背景是统一米色，用边缘 floodfill 抠透明。</li>
                <li class="li"><b>水平居中不能用 alpha 质心</b>：肩膀、武器、马尾会把 alpha 质心拽偏——「凯」的鬼面、「斑鸠」的白帽最明显。改用<b>肤色质心</b>定位，才把人脸放到正中。</li>
                <li class="li"><b>里の住人 4 张保留原背景</b>：「榊／拓海／铃／翡翠」只有带樱花背景的合成立绘，同路径的透明版全 404；树影与人物边缘交错，抠不干净，所以只裁头、不抠底。这一条在脚本与源图说明里都写明了。</li>
                <li class="li"><b>踩到的坑</b>：<code>jp.runefactory.com</code> 走系统代理会 502，curl 必须加 <code>--noproxy '*'</code>。</li>
                <li class="li"><b>另记</b>：官方「里の住人」页还有燕／草津／八千代／小太郎／座座／绵柾 6 位，站内名册未收录，故未做头像；将来补名册可直接沿用同页 <code>sato_05</code>–<code>10</code>。</li>
            </ul>
            <h2 class="h2">2026-10-29　第八十一次：符文3 最后两位头像补齐，七作零缺</h2>
            <ul class="ul">
                <li class="li"><b>卡在反爬上</b>：neoseeker 的 RF3 角色表主站有 Cloudflare 人机校验，curl 与抓取工具拿到的都是校验页。改用内置浏览器打开，从页面 DOM 里取到图片落在 <code>cdn.staticneo.com</code> 的直链，再直接抓 CDN（不受校验），拿到两张 240×380 的官方半身像。</li>
                <li class="li"><b>不用猜编号</b>：页面明写 Japanese Name = <b>Ondolfa／Zeze</b>（英文版作 Ondorus／Zaid），身份描述也对得上——恩德珐是温维尔聚落的长老、爱读书，泽杰是住在那里的矮人、爱吹牛。</li>
                <li class="li"><b>为什么一直空着</b>：这两位新旧官网都没放（旧官网镇民页只有 11 张、新官网只宣传花嫁），此前一直等 RF3S 游戏内图标段。现在新建 <code>_build_rf3_extra.py</code>，160×160、取景与其余 rf3 头像一致（头顶贴边）。</li>
                <li class="li"><b>结果</b>：全站头像 7 作 193 张（原 191），七个正传 <b>零缺</b>。</li>
            </ul>
            <h2 class="h2">2026-10-29　第八十次：边境头像编号整段错位，8 张重出</h2>
            <ul class="ul">
                <li class="li"><b>是读者先看出来的</b>：「卢特、克罗斯画风偏女性」。核查后确认不是画风问题，是<b>编号对错人</b>——原来那句推法「FACE 编号 = 站内名册序号 + 1」在居民前段（14–23）成立，从 FACE24 起整段错位，因为站内名册把「砾」排在居民靠后、把「杰尔文」排最后，与游戏内真实顺序不同。</li>
                <li class="li"><b>不再靠文字描述猜</b>：改用 ranchstory wiki 的官方立绘逐张对印，重排 FACE14 起的真实顺序（14 特纳 → 31 雷欧娜），共订正 15 个编号、重出 8 张。</li>
                <li class="li"><b>几个认错的点</b>：原先判给 FACE28 的白须老者其实是<b>罗兰德</b>（美乐蒂祖父、抱黑猫）；<b>砾</b>是小妖精（红蝴蝶结帽＋白须＋细长四肢），「自称武蔵大和守」正是这个小东西的玩笑；<b>米涅鲁巴</b>是尖耳精灵女（塔芭莎之妹）。</li>
                <li class="li"><b>卢特那张本来就对</b>：红长发＋紫宽檐帽，官方设定就是「容易被误认为女性」（TVTropes 上有专门条目 Dude Looks Like a Lady），不动。</li>
                <li class="li"><b>顺带核实海洋 L36／L37</b>：阿涅多（金发＋红色飞行护目镜＋邮包）与糖糖（红兜帽斗篷＋紫眼）与官方立绘一一对应，两张都对，不改。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十九次：头像大补齐 58 张，边境／海洋两作整批接上</h2>
            <ul class="ul">
                <li class="li"><b>边境 31 键</b>：源为游戏内对话立绘 FACE00–31。认人靠四条角色描述交叉核对（「拉碧丝是教会修女→F03」「斯黛拉是老妇→F19」「米涅鲁巴是小妖精→F24」等）。双胞胎艾莉丝 白／黑 两张 alpha 包围盒一致、md5 不同，分 <code>iris_white</code>／<code>iris_black</code> 两键。</li>
                <li class="li"><b>海洋 23 键，走了不少弯路</b>：真图在 PS3 原档 <code>RFF2.dat</code> 的 TFAp 块 1526 里，是 72×72 的 CI8，共 51 张。必须用 <code>read_tfap()</code> 取块内成员——按纹理索引表的绝对偏移直读主 dat，解出来<b>全黑</b>。编号是两段式（10–18 九女主／20–22 三男主／30–38 九居民／01·02 主角／40·41 孩子），与文件里「相遇标记」字符串池的顺序一一对应，另做画面对印确认。</li>
                <li class="li"><b>推翻一个旧结论</b>：此前记的「海洋没有 2D 立绘」是错的——导出包里那些 <code>*_FACE</code> 其实是 512×256 的 DXT1 3D UV 贴脸图，难怪看着不像立绘。</li>
                <li class="li"><b>符文3 补克璐璐法</b>：官网完全没有她的立绘（隐藏花嫁不做宣传），改用 RF3S 游戏内 <code>another_charaicon</code>（172px）。</li>
                <li class="li"><b>同一批还上了 azuma BOSS 页</b>：可捕 18 个 + 主线 6 个，中文名与人物名册一致；三个暂无中文译名的按音译处理并附英文原名，等待核实。</li>
                <li class="li"><b>可重建</b>：新建 <code>_face_src/{rff,rfo,rf5_pc}/</code> 存源图 6.9MB 与证据链 md，克隆仓库后不需要游戏原档也能重出。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十八次：构建脚本收进仓库，路径全部相对化</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：几个脚本一直躺在仓库外（<code>_fish_src</code> 6 件含 <code>rfo_fishing_raw.txt</code> 源数据、<code>_azuma_src</code> 1 件），而且里面写死 <code>C:/Users/...</code> 的绝对路径——换台机器就跑不起来，等于数据只存在这一台上。</li>
                <li class="li"><b>改法</b>：全部收进仓库，硬编码路径改成 <code>__dirname</code>／<code>__file__</code> 相对定位，与已入库的 <code>_build_boss.py</code> 保持一致。目标是「克隆下来就能重跑、重跑结果逐字节一致」。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十七次：符文1 钓鱼最后 4 个译名定案</h2>
            <ul class="ul">
                <li class="li"><b>4 种没有汉化对照的，定为站点通译</b>：基贝里奥（Gibelio，系列原创鱼）、秋比目鱼（Fall Flounder）、狗鱼（Pike）、真鳟（Masu Trout）。此前一直挂着「待核实」，这次拍板为定名并去掉标记——<b>说明里保留「本站定名」的出处</b>，不冒充官方。</li>
                <li class="li"><b>顺带修两处旧注释</b>：<code>fish_old.js</code> 里的旧洞窟名「迷雾花洞窟」统一成站内定稿「密丝特布鲁姆」，钓点名措辞一并理顺。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十六次：龙之天地魔物喜好表 122 种</h2>
            <ul class="ul">
                <li class="li"><b>为什么单独建页</b>：这一作是动作 RPG 取向，没有前七作那套数值抗性图鉴，套模板会误导读者，所以另开 <code>azuma_mon</code> 页、只挂 azuma。</li>
                <li class="li"><b>122 种魔物</b>：字段为 名称／能否骑乘／出现区域／最爱／喜欢／讨厌，源是中文攻略站的《魔物喜好表》（2025-06-20），<b>纯中文，不需要译名拍板</b>。骑乘分布 99 不可、23 可骑乘。</li>
                <li class="li"><b>8 个 BOSS／精英源里没有区域与喜好</b>，只列名，不硬填。</li>
                <li class="li"><b>顺带更正一处漏看</b>：azuma 的人物名册其实早已在 <code>data.js</code> 里（17 名），不是缺项。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十五次：龙之天地数据可得性评估</h2>
            <ul class="ul">
                <li class="li"><b>结论先行</b>：这一作的系统与前七作<b>根本不同</b>，不能直接套现有页面模板——动作 RPG 取向，取消「王子点数」改为村长界面管理村庄，新增守护者系统，无传统「钓点×鱼×概率」表，也无逐小时村民行程。</li>
                <li class="li"><b>可做</b>：人物名册（14–16 名主要角色，中英文源齐全）、魔物喜好表。<b>有限做</b>：BOSS 只有英文源给 Lv 与弱点元素，没有 HP／攻防数值。<b>无源</b>：钓鱼、每日行程、数值抗性。</li>
                <li class="li"><b>译名要先拍板</b>：中文译名多源不一致（昴／昴流、辉夜／辉夜姬、希娜／妃那、玛罗拉／玛罗、乌拉拉卡／丽日、松里／祭…），所以建议先定译名框架再落库。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十四次：缺口清单 v2 复核，改掉三处误判</h2>
            <ul class="ul">
                <li class="li"><b>初版用 grep 扫常量名，漏看了整批文件</b>（<code>rf2cal.js</code>／<code>rf5cal.js</code>／<code>fish_old.js</code> 等），导致「节日」「钓点／鱼」「料理」三行整行误判。改成逐文件核对文件头注释 + 页面实际引用。</li>
                <li class="li"><b>属性抗性其实七作全覆盖</b>：各作早已通过魔物图鉴页、BOSS 页、战斗页三处落地，只是量纲不同（一代点数、二代克制、三代倍率、四五代百分比）——<b>跨作直接比数值没有意义</b>，现有分工本来就是合理形态，不必重复建设。</li>
                <li class="li"><b>每日行程只有初代有源</b>：其余六作的中文源都没有集中行程表，英文 fandom 仅有零星角色页，逐角色翻译工作量大且易错，按「没核实的不写」暂不落库。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十三次：符文5 主线 BOSS 21 位</h2>
            <ul class="ul">
                <li class="li"><b>数据</b>：21 位主线 BOSS 的 Lv／HP／双攻／双防／狂暴线／弱点／抵抗，源为主线流程页。</li>
                <li class="li"><b>缺的照留空</b>：第二章后半段约 11 位（骨龙、利维坦、赫克顿盖尔、死亡树・改、蕾瓦迪亚、美杜莎、衔尾蛇、树魔人、阿莉耶丝、奥德姆拉、芬布尔境界 BOSS）原表没有攻防数值，<b>一律留空不推算</b>。</li>
                <li class="li"><b>rf4／rff 暂缺并写明理由</b>：RF4 只有普通魔物数据表，没有集中的剧情 BOSS 数值页，中文攻略全是打法／捕获向；边境只有 BOSS 名单没有数值。两作都标注待补，不硬凑。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十二次：符文1 钓鱼译名用汉化对照表校准</h2>
            <ul class="ul">
                <li class="li"><b>对齐 7 种</b>：珠星鱼、黑毛鱼、西太公鱼、螯龙虾、斑乌贼、伊富鱼、心动鲷鱼，改用汉化版《RF1 文本翻译对照表（校对 7）》的写法。</li>
                <li class="li"><b>说清这张表是什么</b>：这是<b>汉化组的译法，不是官方简中</b>，不同汉化组可能不同——页面上照实标注，别让读者以为是官方名。</li>
                <li class="li"><b>钓点名统一</b>：全部采用站内洞窟定稿（密丝特布鲁姆／卡麦特／特罗斯／癸干忒／达努／格力德），避免同一处地名三种写法。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十一次：符文1 钓点与鱼接入（12 钓点／32 种／70 条）</h2>
            <ul class="ul">
                <li class="li"><b>两向都做</b>：钓点 × 鱼的正向表（这个钓点能钓到什么），加鱼种 → 钓点的反向表（这条鱼去哪钓）。查的时候两个方向都有人需要。</li>
                <li class="li"><b>译名分两层</b>：21 种用站内既有的官方名，11 种与钓点名当时挂「通译、待拍板」，后一次提交里收尾定案。</li>
            </ul>
            <h2 class="h2">2026-10-29　第七十次：符文3 钓点与鱼接入（36 条 + 度假村 9 条）</h2>
            <ul class="ul">
                <li class="li"><b>按钓点列鱼</b>：36 条常规钓点记录，另有卡尔洛斯度假村的<b>付费钓场 9 条</b>单独成段——那是花钱才能进的场子，混在普通钓点里会误导。</li>
                <li class="li"><b>鱼影四档</b>：源表给了鱼影大小分档，一并保留，比只给名字有用。</li>
            </ul>
            <h2 class="h2">2026-10-29　第六十九次：海洋钓点与鱼接入（28 钓点／30 种／172 条）</h2>
            <ul class="ul">
                <li class="li"><b>换了数据形态</b>：海洋的源是「地点 × 区域 × 季节 × 时段 × 四种鱼的概率」，与前几作的「鱼 × 钓点」不是一张表，所以单独建 <code>SPOT_RFO</code>，页面做正反两向渲染。</li>
                <li class="li"><b>钓鱼页只留引导</b>：海洋在「鱼」这一页不再硬塞表格，改成一段引导——这一作的鱼随季节与时段变，去钓点页查才准。</li>
            </ul>
            <h2 class="h2">2026-10-29　第六十八次：符文4 头像补齐 27 位，全站五作 133 张接满</h2>
            <ul class="ul">
                <li class="li"><b>两批来源拼齐 27 人</b>：主角与婚配候补 14 人用 RF4SP 旧官网（marv.jp/special/game/runefactory4SP）的全身彩图——每张图的文件名是流水号 <code>chara-img-01..14</code>，但人名图片的 <code>alt</code> 属性直接写着日文名，认人不用猜；镇民 13 人官网没放，用 biligame wiki 解包出的游戏内立绘，靠 MediaWiki 的 <code>imageusage</code> 反查归属。连主角之子诺艾尔、之女露娜都有，五作里头一回把居民头像<b>整批接满</b>。</li>
                <li class="li"><b>自动裁切在这批全面失灵，改成人工标框</b>：官网这批姿态花——迪拉斯斜着一根比人还长的鱼竿、朵儿洁顶着宽檐帽、奇尔盘腿坐着、两位主角半身带道具——按「头宽×1.7」定框，迪拉斯的框会跑到鱼竿上（量出头宽 463px）、朵儿洁量到帽檐、奇尔的头顶在半图高。列密度过滤也救不回来，最后 14 张全部人工标「框在哪」：先目测再换算回原图像素，注释里留了每人的框坐标（<code>_face_src/rf4/SOURCES.md</code>）。</li>
                <li class="li"><b>两位主角的图比别的小一号</b>：レスト 是 240×484、フレイ 是 267×485，不是官网其余的 540×1098，脸只有 50px 上下——第一版按大图比例换算坐标，裁出来全是空白和腿，改成 3 倍放大原图逐像素定框才对上。裁出的头像 90~95px，列表 33px、详情 64px 都够用。</li>
                <li class="li"><b>认出两位老熟人</b>：镇民里的<b>托娜</b>（トゥーナ）就是符文3 那位红发少女——官方英文叫 <b>Raven</b>，RF4 里她离开希雅蕾丝来塞尔菲亚找稀有矿、开了一间小店；<b>巴雷特</b>（バレット）也是符文2 那位铁匠的客串。两作的托娜头像文件统一用 <code>raven</code> 这个官方英文名做键（符文3 那张原名 <code>toona</code>，这次一并改名），各自的立绘仍在各作目录里。</li>
                <li class="li"><b>顺带补齐了两个孩子条目的日文名</b>：源页里诺埃尔、露娜的条目标题只写了中文名，名册里日文名一直是空的——头像映射按日文名取图，这两张头像此前实际接不上。判据是源页条目标题旁的图片名（<code>ノエル_f_4.png</code>／<code>ルーナ_f_4.png</code>），在生成脚本的补充表里按条目名补上 <code>ノエル</code>／<code>ルーナ</code>，顺带补官方默认英文名 Noel／Luna。重跑流水线，196 人里只有这两行变化。</li>
                <li class="li"><b>体积</b>：27 张合计约 500KB，与符文3 那批同规格（160px 上限、LANCZOS 缩）。</li>
            </ul>
            <h2 class="h2">2026-10-29　第六十七次：符文3 接上头像（22/25），ROM 拆不动改走官网</h2>
            <ul class="ul">
                <li class="li"><b>先把 ROM 这条路试到底了</b>：日版 <code>nrp-rf3j.nds</code> 的主档案 103MB，里面有 358 个 NCER、1546 个 NCGR、477 个调色板、257 张 512×256 的图，三件套（调色板＋图形＋图幅）确实是成组排的，渲染器也写得出来。<b>卡在认人上</b>：档案内部没有文件名表，块与块之间只有偏移，唯一的文字是 cell 名 <code>CellAnime01</code> 这种流水号——拼得出图，说不出是谁。站内的规矩是认不出的宁可空着，所以换路。</li>
                <li class="li"><b>官网分新旧两处，正好互补</b>：15 周年站 11 张 560×940（主角＋10 位花嫁候补）；发售时的旧官网（marv.jp 2009）角色页 21 张 220×360，而且 <code>img/townspeoplelist/&lt;英文名&gt;.png</code> 的 <code>alt</code> 属性<b>直接写着日文名</b>，不用猜。花嫁候补取大图、镇民取旧官网，共 <b>22 人</b>。</li>
                <li class="li"><b>缺的三位写清楚</b>：<b>克璐璐法</b>是通关才解锁的隐藏花嫁，官网两张名单页都不宣传她，没有立绘；<b>恩德珐</b>与<b>泽杰</b>在旧官网镇民页的 11 张里也没有（那一页只放了 11 位）。这三位宁可退回「首字色块」。</li>
                <li class="li"><b>顺带否掉的一个来源</b>：biligame 符文工厂 wiki 上确实有 <code>シア_f_3.png</code> 这种按「日文名＋作编号」命名的图，看着最省事，但原图只有 <b>24×23 像素</b>，是表格里的小图标，放大只会糊，没用。</li>
                <li class="li"><b>裁切算法跟着改了一次</b>：原来那套是给半身立绘页设计的，固定取头顶下方 12~52 行量头宽；官网这批是<b>全身立绘</b>，头只占身高的七八分之一，照原样量会一路量到肩膀上（达丽娅量出 301px 宽）。改成按「人物在画面里的实际高度」取 2%~10% 这一段，两套尺寸都适用。</li>
                <li class="li"><b>伊奥单独定了框</b>：她头上那顶宽檐帽把测量带撑到 204px，按帽子定框裁出来只剩一顶帽子、脸被挤到下边看不见。改成缩小取景、往右下挪，才把脸露出来。另外几张帽顶／呆毛贴着框沿的也各挪了几像素。</li>
                <li class="li"><b>体积</b>：裁出来有 224px，比符文1／2 的大一圈，而列表只显示 33px、详情页 64px，压到 160px 上限，22 张合计 908KB。</li>
            </ul>
            <h2 class="h2">2026-10-29　第六十六次：符文2 补上凯尔的女儿「雅莉亚」，子代双胞胎这才凑齐</h2>
            <ul class="ul">
                <li class="li"><b>一直缺的是女儿</b>：符文2 的人物名录此前 26 人，对照 fandom 的角色表（主角 3 + 花嫁 7 + 居民 11 + 二代候补 6）正好少一个——<b>凯尔之女 アリア</b>。上一轮做头像时把她和二代花婿「凌（リーン／Leonel）」弄混了，其实凌是二代的结婚候补，不是主角的孩子。</li>
                <li class="li"><b>立绘就在解包里</b>：<code>pic_pc02</code>（与儿子 <code>pic_pc01</code> 同为 6 帧、同构图），红棕短发、呆毛、黑裙，和阿鲁斯是同一张脸的女版——与官方说的「双胞胎、只在二代开场同框」对得上。裁出来的头像 105px，呆毛没被圆框削掉。</li>
                <li class="li"><b>译名取「雅莉亚」</b>：RF2 没有官方中文，biligame 符文工厂 wiki 用这个写法；「阿莉亚」「艾莉亚」留作别名。英文名两条都写了——官方日文站的罗马字是 <b>Ars / Alia</b>，美版是 <b>Aaron / Aria</b>，条目里按后者显示、前者写进说明。声优前田爱（阿鲁斯是粕谷雄太）。</li>
                <li class="li"><b>顺带说明的设定</b>：孩子的性别由玩家在一代末选定，儿子女儿是<b>二选一</b>，不会同时登场；女儿路线下，二代可与凌、奥斐斯、罗伊结为「过家家」伴侣。另外 <code>pic_pc03</code>／<code>pic_pc04</code> 两张<b>婴儿期立绘</b>留在文件里，游戏里并没有用到（wiki 也是这么记的），本次不接。</li>
                <li class="li"><b>补数据走了正规流水线</b>：人物名册是生成物，没有手改——先改 <code>js/data.js</code>，跑 <code>_build_sitechars.py</code> 再跑 <code>_build_npcfull.py</code>；英文名与别名源页没有，加进生成脚本的 <code>ADD_EN</code>／<code>ADD_AL</code> 补充表，这样重跑不会丢。重跑后 196 人中<b>只有这两行变化</b>，其余逐字节一致。README 人数 195 → 196。</li>
            </ul>
            <h2 class="h2">2026-10-29　第六十五次：符文5 也接上头像了，31 位居民接了 27 位</h2>
            <ul class="ul">
                <li class="li"><b>换了条路子</b>：符文5 是 Unity 游戏（PC 版现成），头像不在 NDS 那种 NCER 立绘里，而在 Addressables 的 <code>FaceIconSpriteAtlas</code>——就是游戏里 HUD 上那张小圆脸，约 62×64 像素。用 UnityPy 从两个 bundle 里取出 108 张精灵，按 <code>Icon_chNNN</code> 归类。</li>
                <li class="li"><b>难点在认人</b>：bundle 名和容器路径全是哈希，能读的只有对象名 <code>Icon_ch030</code> 这种流水号。三条线索互相印证才敢落笔——① 游戏里 <code>NpcLifeCycleTable/02_Prisila</code> 这套带编号的角色表；② 立绘目录 <code>BU_03Prs</code> 这类带编号的英文名；③ 把头像和官网立绘各自取主发色做色距比对。ch026=ドグ、ch027=ジュリアン、ch028=ヒナ 三连色距都在 3 以内，可以直接钉死。</li>
                <li class="li"><b>有一处三线索打架，按发色定案</b>：编号表写的是 15_Viviage、16_Heinz，但色距是 ch015=Heinz（亮黄，色距 6）、ch016=Viviage（橙红帽，色距 2），两个特征色都极鲜明，取发色；Viviage 站内名录没有，这一张<b>不接</b>。</li>
                <li class="li"><b>没接的四位写清楚</b>：帕尔摩、妃那、塔克、玛格丽特——官网没有这四位的立绘做参照，站内的中文／日文名又对不上任何一条编号线索，<b>宁可退回色块</b>。另外 ch030／ch031 是主角常服差分（各 36 张表情），与 ch000／ch001 同一张脸，暂不用。全部理由登记在 <code>_face_src/rf5_map.md</code>。</li>
                <li class="li"><b>顺带</b>：符文5 的头像比符文1／2 的小得多（62px 对 100～220px），列表里 33px、详情页 64px 都够用，但没有放大空间——等哪天能取到官网立绘再换。</li>
            </ul>
            <h2 class="h2">2026-10-28　第六十四次：村民喜好里的物品名跟物品表对了一遍，改正 26 个写法</h2>
            <ul class="ul">
                <li class="li"><b>为什么要对</b>：人物名册的物品名是从 wiki 源页抄的，村民喜好表来自解包表，两边都不是「物品表」本身——同一件东西，三处可能三种写法。这次拿站内自己维护的物品／料理／素材表（来自解包原始数据，最可信）当尺子，逐字比对：<b>同长度、只差一个字</b>的，基本就是抄错。</li>
                <li class="li"><b>真错字 10 个</b>：飞瓣之星→<b>飞溅之星</b>、奥利合钢与奥利哈刚→<b>奥利哈钢</b>、梅西菜特矿石→<b>梅西莱特矿石</b>、黏糊糊的液体→<b>粘糊糊的液体</b>、导雷之角→<b>引雷之角</b>、星之南瓜布丁→<b>星星南瓜布丁</b>、极上蘑菇→<b>极品蘑菇</b>、古代鱼的鱼鳍→<b>古代鱼的羽鳍</b>、盐烤山女→<b>盐烤山女鳟</b>。道格一个人身上就占了 5 个——他的喜好那一段整体抄歪了。</li>
                <li class="li"><b>同一件东西两种写法 7 处，也一并统一</b>：味增田乐烧→<b>味噌田乐烧</b>、芜菁天国→<b>芜菁天堂</b>、奶汁烤菜→<b>奶油烤菜</b>（含海鲜款）、魔人之角→<b>魔人的角</b>、野菜汁→<b>蔬菜汁</b>、混合果汁→<b>综合果汁</b>。这类不算错字，但站内物品表只有一种写法，不统一的话搜索会漏。</li>
                <li class="li"><b>还有 9 个是「型号半角」</b>：奶酪L型／牛奶S型／鸡蛋M型这类，源页用半角字母，物品表用全角 Ｌ／Ｍ／Ｓ，统一成全角。三类合计 26 个写法，落在 30 处（有人几条列表都命中）。</li>
                <li class="li"><b>没敢动的也写清楚了</b>：有 20 个名字站内物品表里根本没有（烤墨鱼、滑步靴、上等蛋、鲣鱼片、龙之骨…），那是表没收全，不是写错；另有「至高咖喱」「蓝水晶」「粉红猫咪」这种，站内有相近写法但不敢断定是同一件东西（咖喱就有干咖喱／究极咖喱／至尊咖喱三档），<b>宁可不动，也不合并成错的一件</b>。全部登记在新加的检查脚本里，写明每一条的理由。</li>
                <li class="li"><b>符文4 那个「幻想的雾香」查清了</b>：她在两张解包表里都排在 27 位村民的最后，与英文原表 <code>0x1A</code> 的 <b>Mistress Trupin</b> 一一对应；喜好清一色芜菁系（大芜菁、大樱芜菁、大金芜菁、金刚花、大金刚花），火水抗性都写着 100%。她是四代那位<b>没有立绘</b>、专管「改玩家名字」的 NPC，名字是 Mist + Turnip 的变位，系列玩家普遍认为就是一代的密丝特；中文解包把 Mist 意译成了「雾香」。wiki 没有她的人物页，站内暂不单独立条。</li>
                <li class="li"><b>带人名的物品名不动</b>：符文2 有「巴雷特的书」「寄给布莱的密信」这类，人名是旧译名（站内现在作巴瑞特、布莱伊）。<b>保持原样</b>——那是汉化版在游戏里就写着这几个字，改了玩家反而对不上；物品名跟人名是两套口径，不硬并。</li>
                <li class="li"><b>顺手修了两处「重跑就坏」的构建脚本</b>：<code>_build_extra.py</code> 与 <code>_build_rf1.py</code> 里 <code>xlsx_read</code> 的模块名写错（实际文件是 <code>_xlsx_read.py</code>），早就跑不起来了；另外 <code>_build_rf1.py</code> 重跑会把武器分类从「单手剑／双手剑／长枪／锤／斧」退回笼统的「武器」，还会把「密丝特」改回「蜜丝特」。现在重跑与线上文件<b>逐字节一致</b>。</li>
                <li class="li"><b>新增检查</b>：<code>_test_itemname.js</code>——把名册与两张喜好表的每件物品拿去物品表里查，出现新的「只差一个字」就报错并退出。第六十三次那类「同一件东西三种写法」的病，以后一犯就能看到。</li>
            </ul>
            <h2 class="h2">2026-10-28　第六十三次：合并一位「两条记录」的居民，节日表里的人名也能点了</h2>
            <ul class="ul">
                <li class="li"><b>合并的那位</b>：符文2 人物名录里「海齐利格斯」与「赫理查科斯」原本是两条，其实是同一人——薇薇亚修家当主，麦克斯与罗萨琳德之父。合并后按源页的 <b>赫理查科斯（ヘリチャコス）</b> 定名，站内名录从 27 人变 26 人，全站 195 人。</li>
                <li class="li"><b>顺带纠了一个日文名</b>：旧记录把他的日文写成 <code>ハイリヒクス</code>，源页写的是 <code>ヘリチャコス</code>。这两个读音对不上，按源页为准。同理，源页给的英文名「Herman」也从日文推不出来，<b>这次干脆不显示</b>——空着比写一个查不到的英文名好。</li>
                <li class="li"><b>旧名字没丢</b>：搜索打「海齐利格斯」「海利齐格斯」照样落在这一条上（查询时先归一到现名），改名前存下的链接也能打开。他本人生日冬 10 日、喜欢菠萝汁、讨厌玉米片、生日礼物咖喱饭，都是合并后才挂到这条上的——原来都散在源页那一份里。</li>
                <li class="li"><b>节日表里 9 个旧译名一起统一</b>：符文2 的「节日当天大家在哪」取自一部老攻略，用的是它自己的一套译名。这次统一到站内口径，并保留原攻略给的身份注：<b>卡侬→卡农、安德列→恩多尔、海利齐格斯→赫理查科斯、布莱→布莱伊、茱丽雅→茱莉雅、马库思→麦克斯、塔尼娅→塔喵、阿莉西娅→阿莉希亚、巴雷特→巴瑞特</b>。其中最容易被当成「写错了」的是安德列——源页的民译就叫这个，站内定稿是恩多尔，同一人。</li>
                <li class="li"><b>节日表现在能点人</b>：表里 19 个人名全部变成链接，直接进人物档案。想送礼之前不必先回名册翻一遍；名录里查不到的名字不会做成链接，宁可没入口，也不给一个点了没反应的东西。</li>
                <li class="li"><b>同一毛病在村民喜好页也有，一起治了</b>：那两张表来自解包数据，用的是解包方自己那套译名，和人物名册差得更远。符文4 有 9 个对不上（沃尔卡农→<b>沃卡农</b>、基尔→<b>奇尔</b>、巴特→<b>巴德</b>、铃华→<b>铃芳</b>、艾尔米娜达→<b>艾露米娜塔</b>、布罗萨姆→<b>巴洛索姆</b>、雷欧→<b>雷昂</b>、赛尔泽薇德→<b>瑟尔泽薇德</b>、多娜→<b>托娜</b>），符文5 有 4 个（芙卡→<b>芙佳</b>、Cecil→<b>塞西尔</b>、Ryker→<b>流卡</b>、达洛奇→<b>道格</b>）。<b>达洛奇这一条是比对喜好内容才敢定的</b>——超喜欢同样是飞溅之星、大地锤、龙幻石、奥利哈钢、绿宝石，与「道格」一字不差，才确认是同一个人。</li>
                <li class="li"><b>两页的人名也接上了档案</b>：符文4 的 23 人、符文5 的 26 人全部可点。剩下的「儿子」「女儿」「儿子／女儿」不是人名——那是解包表对孩子那几位的占位条目，符文4 的「女儿」其实对应双胞胎诺埃尔与露娜，页面上写明了，也没做成链接。</li>
                <li class="li"><b>数据链</b>：译名归一表写在 <code>_build_fest_rf2.py</code> 的 <code>FESTPOS_NAME</code> 与 <code>_build_npc.py</code> 的 <code>F4_NAME</code>／<code>EXTRA5</code> 里，改一次、重跑一次就生效，不用手改生成出来的 <code>rf2cal.js</code> 与 <code>npcdata.js</code>；<code>_build_npcfull.py</code> 新增两处：站内别名与源页民译会<b>合并去重</b>而不是互相覆盖，另有一张「英文名不可信就不用」的排除表。</li>
            </ul>
            <h2 class="h2">2026-10-28　第六十二次：符文2 的居民也换上立绘头像</h2>
            <ul class="ul">
                <li class="li"><b>素材</b>：另外一套解包出来的 NCER 立绘（173 张，512×256），编号是 <code>pic_npc01</code>～<code>pic_npc25</code> 加 <code>pic_pc00</code>～<code>pc04</code>，一人多帧表情。这套图<b>不带人名</b>，只有一个流水号，所以「谁是谁」得先查清楚。</li>
                <li class="li"><b>怎么认的人</b>：wiki 的角色页直接拿这些解包图当资料卡头像，于是反过来查「<b>这张图被哪个条目引用</b>」，一次就对上了 16 张（道格拉斯、娜塔莉、雷、高顿、卡农、恩多尔、杰克、塔喵、罗伊、布莱伊、巴瑞特、赫理查科斯、麦克斯等）。剩下没被引用的，用官网 15 周年立绘逐张比对——阿莉希亚的紫礼帽、茱莉雅的银绿发黑裙、多萝茜的兜帽、塞西莉娅的橙发双马尾、罗萨琳德的浅蓝长卷发、由绘的青和服，都对得上。</li>
                <li class="li"><b>一套意外的交叉验证</b>：这套图里还有 12 组带 <code>_W</code> 后缀的「婚礼装」差分，正好是<b>7 位花嫁候补 + 4 位花婿候补 + 主角</b>。也就是说能结婚的人才有多这一套，编号一一对得上，等于从侧面证明了上面的编号没串位。</li>
                <li class="li"><b>名录里 27 条记录全做了</b>：不止站内原来那 18 条，人物名录里的布莱伊、塔喵、恩多尔、罗伊、奥斐斯、凌、姆、苏、拉姆莉雅也一起切了——列表里每个人都一样有脸，不会一半有图一半是色块。姆与苏是双胞胎，立绘几乎一样，按同一张处理。</li>
                <li class="li"><b>改进了一处裁切逻辑</b>：上一轮靠「头顶留 11 像素」躲开圆形裁切，这一作有戴宽檐帽的（阿莉希亚的紫礼帽宽 160 像素）、扛大刀的（塔喵背后那把刀把测量带撑到 114 像素）、头顶两撮兽耳的。改成让程序自己算：<b>头顶这一段的横向跨度不能超出圆形边界</b>，超了就把裁框往上挪。这样帽子、兽耳、双马尾都不会被削掉一块。</li>
                <li class="li"><b>发现一处站内重名</b>：「海齐利格斯」与「赫理查科斯」在人物名录里是两条记录，说的其实是同一个人（薇薇亚修家的当主，麦克斯与罗萨琳德的父亲），立绘也只有一张。头像表先把两个日文名都指到同一张图，保证不管留哪个译名都不掉图；这两条已在下一次更新里合并。</li>
                <li class="li"><b>体积</b>：27 张共 268KB，与符文1 的 312KB 一起，头像目录总计 576KB。表情差分同样没进仓库。</li>
                <li class="li"><b>数据链路</b>：<code>_build_faces.py</code> 改成支持多作（<code>python _build_faces.py rf2</code>），归属表写死在脚本里并注明依据；<code>_probe_rf2_owners.py</code>、<code>_fetch_portraits.py</code> 是这一次取证用的，留着以便日后核对别的编号。</li>
            </ul>
            <h2 class="h2">2026-10-28　第六十一次：新增「BOSS 战」条目——四作 71 条剧情 BOSS，HP／抗性／掉落一次查完</h2>
            <ul class="ul">
                <li class="li"><b>为什么要单独一页</b>：「魔物图鉴」是按种类收全表的，BOSS 混在里面最难查——它不进牧场、掉落也不走普通素材那套。所以另开一页只收剧情与迷宫 BOSS：<b>符文1 8 位、符文2 9 位、符文3 20 位、海洋 34 条</b>，合计 71 条。</li>
                <li class="li"><b>符文1 的弱点是自己算出来的</b>：这作的属性是「防御点数」，数<b>越大越抗打</b>，最小那项才是弱点——和后面几代的直觉完全相反。页面按每只的四项取最小值，<b>在表里标红</b>，右侧再单列一栏「弱点」。八只里有两场四项完全均等（究极恶魔 30、普罗戴格力德 60），没有软肋可挑，标成「四项均等」而不是硬指一个。</li>
                <li class="li"><b>符文2 的掉落清一色是石板碎片</b>：七只写明掉落的，掉的都是开门用的石板（5/5、7/7 或太古碎片 1/4～4/4）。也就是说二代的 BOSS 战是<b>关卡门锁，不是素材产地</b>——想刷素材别在 BOSS 房反复读档。顺带把二代的属性克制也讲清楚了：同属性减伤、克制属性增伤，wiki 的例子是地属性魔物吃无属性约 70、地属性 50、风属性 100。</li>
                <li class="li"><b>符文3 的抗性是一句话，信息量反而更大</b>：20 位<b>全部</b>带「后仰抵抗」——打不出硬直，靠连续平砍压制 BOSS 在这作行不通；<b>14 位</b>至少有一项属性被「吸收」，那是给对面回血，不是减伤。唯一写明「受伤倍率变高」的是死亡树（火 3 倍、风 1.5 倍，同时地水无效），一只就把倍率／无效／吸收三种状态占全了。</li>
                <li class="li"><b>海洋那张表拆成了三块</b>：原表把剧情推进、圆形竞技场六连战、编号区域的大型魔物混在一起。拆开后各给一张表。竞技场两轮同名 BOSS 的数值是重做的，另做了一张「第一轮 HP → 第二轮 HP → 倍率」的对照：涨得最凶是决赛冰拳（78000 → 137000），最保守是大地巨人（44000 → 76000）。</li>
                <li class="li"><b>末节专门防误读</b>：四作对「属性」的记录方式根本不是一套量纲——一二三代分别是点数／克制／等级，四五代是百分比。同样是「写着抗火」，在三代可能是<b>回血</b>，在四代只是打个折。所以最后加了一张「四套量纲」对照表，等级换算（−2 打三倍、3 级免疫、4 级回血）照抄 wiki 的「元素属性」页，不推算。</li>
                <li class="li"><b>没核实的就不填</b>：四代、五代与边境在 wiki 上没有独立的 BOSS 数值页（只有「BOSS 宠物喜好」这类抓宠资料），这几作不硬凑，页面也不对它们显示——条目声明了只属于符文1／2／3／海洋四作。符文2 有 5 处迷宫名在源页仍是日文，没有可靠中译，保留原文并注明，不臆译。</li>
                <li class="li"><b>数据链路</b>：原始 wikitext 存在 <code>_boss_src/</code>（rf1／rf2／rfo 三份），符文3 复用已有的 <code>BOSS_RF3</code>，统一由 <code>_build_boss.py</code> 生成为 <code>js/boss.js</code>。改了源就重跑脚本，不手改产物。地名按站内已有对照表转（ミストブルーム洞窟 → 密丝特布鲁姆，与第五十九次的口径一致）。</li>
                <li class="li"><b>搜索也能搜到</b>：71 条 BOSS 全部进索引，搜「克里莫亚」「面具男」直接落在 BOSS 页那一行，和搜普通魔物一样的用法。</li>
                <li class="li"><b>顺手修了个老 bug</b>：在别的作品里打开「只属于某几作」的条目时，提示文案写死了「仅收录于《符文工房5》」、切换链接也固定跳 RF5——这个机制最早是为 RF5 独有条目做的，后来「状态与抗性」（RF4／RF4S）有了同样需求就露馅了。现在文案与切换入口都按条目声明的作品列表生成，本条会列出四作并给四条切换链接。</li>
            </ul>
            <h2 class="h2">2026-10-28　第六十次：符文1 的 29 位居民换上游戏里的立绘头像</h2>
            <ul class="ul">
                <li class="li"><b>素材</b>：解包出来的 NCER 立绘页，一张 512×256、一人一张，同一个人有 5~9 帧表情差分，一共 33 组 180 张。这些图是半身像，脚底贴着画布下沿，头顶高度各人不同。</li>
                <li class="li"><b>认人靠日文名</b>：文件名是游戏内部的罗马字代号，跟站里的英文译名对不上（拉碧丝写作 Lara、托尔蒂写作 Tori、怀特写作 Wesley，都跟文件名里的 lapis／torte／white 不是一回事），所以拿日文名去对，29 位居民一一对上，一个不差。</li>
                <li class="li"><b>还多认了三个</b>：EZELBIRD 是艾泽尔巴德（塞克斯帝国皇帝，本作最终反派）、GILBERTH 是吉尔伯特（诺拉德王国的国王，只在终盘露一面）、baby 是主角的孩子。三位都不是居民，头像切好了但没往名录里塞。</li>
                <li class="li"><b>怎么切的</b>：以头顶定位、边长按头宽算（约 1.7 倍），保持原始像素不放大——本作头宽只有 49~127 像素，放大就糊。裁框尺寸因此不齐，交给 CSS 自适应。</li>
                <li class="li"><b>两个坑</b>：一是有人头顶只有一撮呆毛（伊万顶端只有 9 像素宽），拿它当锚点会把脸推出框外，改成跳过最上面 12 行再算中心；二是头宽跨度太大（查克里努斯是咧嘴大笑的姿势，头宽 127），一开始想按头宽统一缩放到同一尺寸，结果脸的大小反而更不齐，最后改成「边长随头宽、输出不缩放」。</li>
                <li class="li"><b>没有图的照旧</b>：符文2 到 5 还没做头像，仍然显示原来的首字色块，不会出破图。</li>
                <li class="li"><b>体积</b>：只出每人一张（32 张 312KB），另外 148 张表情差分没进仓库——眼下没人用，占 1.5MB 不值。哪天真要做「换表情」，写生成脚本时加 <code>--all</code> 跑一遍就有。</li>
                <li class="li"><b>单文件版也跟着走</b>：standalone.html 没有外部文件可加载，构建时把头像转成 data URI 内联，离线打开照样有图。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十九次：ミスト 全站统一作「密丝特」——按边境的译法铺平，旧写法仍搜得到</h2>
            <ul class="ul">
                <li class="li"><b>起因</b>：站内同一个角色两种写法——符文1 作「蜜丝特」，符文2、边境、术语表作「密丝特」。上次收尾时把这处留着没动，等口径。现在定了：<b>用边境的「密丝特」</b>，全站按这一个写法走。</li>
                <li class="li"><b>改了多少</b>：正文与数据一共 76 处，涉及 12 个文件。其中 9 处是连带的——洞窟「<b>密丝特布鲁姆</b>」跟人名同源（日文 ミストブルーム），不跟着改就成了「密丝特」和「蜜丝特布鲁姆」并存，反倒更乱。</li>
                <li class="li"><b>旧写法没丢</b>：搜索框里打「蜜丝特」「蜜丝特布鲁姆」照样命中，做法是查询时先归一到现名（不是往索引里塞两套字，索引不会变胖）。改名前存下的链接 <code>#/char/rf1/蜜丝特</code> 也能打开，落在同一个角色上，不会变成「没有这个角色」。</li>
                <li class="li"><b>数据是从源上改的</b>：先改 <code>js/data.js</code> 与构建脚本里的映射表，再重跑名单与行程的生成链，产物和脚本保持一致——不直接改产物，免得下次重跑又倒回去。</li>
                <li class="li"><b>为什么这次敢改地名</b>：洞窟名之前是按汉化定稿统一的，但 ミスト 这半个词在两部作品里本来就是同一个角色。人名定了，地名跟着走才自洽；俗名「5洞」仍以括号缀在正名后面，查旧攻略照样对得上。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十八次：行程表加了反向查——选一个整点，看全村人在哪儿；地名改用站内定稿译名</h2>
            <ul class="ul">
                <li class="li"><b>原来的行程表只能正着查</b>：一行一个人，横着看某人一天去了哪儿。但找人时想的往往相反——「晚上八点还有谁在酒馆」「这个点去医院能不能碰上医生」。所以加了<b>按时段看</b>：挑一个整点，全村人按所在建筑分组，人头从多到少排，每处标出「待至几点」，赶时间就照这个算。点名字直接进人物档案。</li>
                <li class="li"><b>两种看法共用一个页面</b>：顶部「按人看／按时段看」切换，星期状态和筛选在两边通用。数据只有一份，反查是从同一张编码表算出来的，不存在两份数据对不上的问题。</li>
                <li class="li"><b>默认跟着今天走</b>：打开就选中今天对应的星期状态，标上「今天」；「按人看」的表头把<b>此刻</b>那一列标出颜色。周六周日源页没有单列，这两天退回周一，不猜。</li>
                <li class="li"><b>地名统一到站内定稿</b>：源页用的是玩家俗称——「1洞」「5洞」「6洞」。站内魔物图鉴早就有一张定稿对照表，所以改成正名：<b>卡麦特洞窟</b>、<b>密丝特布鲁姆</b>、<b>卡西米尔遗迹</b>，俗称用括号缀在后面备查（搜「6洞」照样搜得到）。</li>
                <li class="li"><b>顺带把地址也对齐了</b>：地址跟着人名走，统一成「密丝特的家」，免得同一张卡上一个人两种写法。</li>
                <li class="li"><b>行程进搜索</b>：搜「旅馆」能翻出谁在那儿出没，搜「6洞」能翻出谁去过，点进去落在那人的行程上。索引里每人一条，文本是他八天里去过的全部地点，只增加 28 条，对搜索速度没有影响。</li>
                <li class="li"><b>入口不再藏在居民页里</b>：攻略目录的「牧场生活」组多了一项「村民行程」，只有符文1 显示——其余六作没有源页。</li>
                <li class="li"><b>怎么验的</b>：新写了 <code>_test_schedat.js</code>，把反查结果和正向编码逐格对撞——8 种星期 × 19 个整点 = 152 个组合、4256 次「这个人在这个点到底在不在那儿」，全部一致；「待至」也逐个核过是不是那一段的结束时刻。光看渲染出来像是对的没用，得拿编码本身对。</li>
                <li class="li"><b>留着一处没动</b>：符文1 那份表用的字形跟其他作不一样——同一个角色，两套叫法。这属于跨作译名口径，没擅自改，留到口径定下来再动（第五十九次已按「用边境的密丝特」全站统一）。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十七次：符文1 的人物名单里混进了三位边境角色，已清出；另新增符文1 村民每日行程表</h2>
            <ul class="ul">
                <li class="li"><b>先说错的那件事</b>：有读者指出「艾莉丝不是边境里的吗，为什么放在符文1」。查了一下，<b>他是对的</b>。艾莉丝（エリス）、赛尔菲（セルフィ）、卯月（うづき）三个人的条目只出现在边境的 11 位花嫁候补里，符文1 的源页 28 位人物中没有她们。</li>
                <li class="li"><b>错在哪</b>：<code>data.js</code> 里符文1 的人物名单是最早手工录的 10 条，当时把边境的三位写了进去。后来合并源页数据时，「站内有、源页没有」的条目会被当成「源页漏收」保留下来——于是这三条一路留到了线上。根子在录入，合并逻辑只是忠实执行。</li>
                <li class="li"><b>改法</b>：删掉这三条，符文1 从 32 人变 <b>29 人</b>（源页 28 位 + 主角拉格那），全站 199 → <b>196 人</b>。同时把「data.js → 站内名单缓存」这一步固化成 <code>_build_sitechars.py</code>，以后改名单不用再敲临时命令，也就不会出现缓存和源码对不上的情况。</li>
                <li class="li"><b>顺手把七作都核了一遍</b>：逐作比对「站内有、源页没有」的条目。其余各作的差集都是<b>主角</b>（凯尔／阿鲁斯、麦斯、雷斯特／芙蕾、亚雷斯／爱丽丝、拉格那、优米尔）——源页本来就不列主角，这些是对的。只有 RF2 那位薇薇亚修家当主需要单独收尾：站内当时把他记成了两条（海齐利格斯／赫理查科斯），日文名还写成 ハイリヒクス，与源页的 ヘリチャコス 对不上。这一条后来做了合并，也不再沿用当时据英文维基推出来的那个英文名。</li>
                <li class="li"><b>新的一页</b>：符文1 的<b>村民每日行程表</b>。源页是一张 28 人 × 8 种星期 × 19 个整点的大表，直接搬过来没人看得下去。现在做成：横向 6:00 到次日 0:00 一格一小时，<b>同一地点的连续小时并成一格</b>——格子有多宽就是他在那儿待了多久。密丝特周一一眼看完：家 6 小时 → 牧场 6 小时 → 家 7 小时。</li>
                <li class="li"><b>八种星期状态</b>：周一至周五、祝日、雨天的工作日、雨天的祝日。雨天村民会改去室内，按晴天的表跑会扑空，所以雨天单独两版。</li>
                <li class="li"><b>找人用的小功能</b>：点任意一个地点格，会把<b>同一栋建筑</b>里的其他人一起点亮（按建筑合并，不分 1F／2F），想一次找齐几个人就不用挨行找；上方输入框按人名筛，日文名和源页旧译也认。</li>
                <li class="li"><b>译名统一</b>：源页用的是另一套译名（萝赛塔／塞希莉娅／琳妮特…），跟本站人物档案对不上。表里统一用人物档案的名字，旧译留作搜索别名，搜哪个都能筛到。</li>
                <li class="li"><b>没做的</b>：其余六作没有行程表源页，不硬凑。RF1 的 185 格「—」照源页留空，那是源页没标注，不猜。</li>
                <li class="li"><b>顺手修掉一个上次留下的视觉事故</b>：居民页的人物卡片显示成了「一个字一行 + 一个巨型箭头」。原因是卡片右侧那个 chevron 图标没有尺寸规则——<code>icon()</code> 产出的 <code>&lt;svg&gt;</code> 不带宽高属性，尺寸全靠 CSS 给，这一条当初漏了，浏览器就按 SVG 的默认尺寸撑满，把整张卡片的 flex 布局挤塌。补上 <code>.npc-card .chev</code> 的 1.1rem 定尺即可。<b>这个错误在 HTML 层测试里看不出来</b>（字符串全是对的），只有真的渲染一次才会露馅，算是个提醒。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十六次：人物板块从「十几位候补」扩到 7 部作品 199 人——生日、声优、四档送礼喜好、回礼全部落地</h2>
            <ul class="ul">
                <li class="li"><b>先纠正一个错</b>：前几次巡检一直判定「人物没有可达源」，理由是 <code>RF4npc</code>、<code>RF4人物</code> 全都打不开。真正的原因是<b>域名写错了</b>——符文工厂的 wiki 站是 <code>wiki.biligame.com/<b>runefactory</b>/</code>，不是 <code>rundefactory</code>。换对之后，<code>RF1characters</code>～<code>RFOcharacters</code> 七个页面全都在。</li>
                <li class="li"><b>拿到什么</b>：7 部作品共 185 人的人物页，解析后与站内既有名单合并（同名条目用<b>日文名</b>对齐，因为翻译不同源，「比修奈尔／彼修纳尔」这种差异靠中文名对不上），最终 <b>199 人</b>、<b>3458 条</b>礼物喜好。原本站内只有 149 人、生日只收录了 26 条，现在是 199 人、生日 173 条。</li>
                <li class="li"><b>居民页重做</b>：从「名字 + 定位」两列变成卡片——首字头像、日文名、定位标签、生日、声优、最喜欢的前三样；顶部加了人数统计条（总数／结婚候补／生日已知／声优已知），右上角一个「按生日排」把春→冬的顺序拉直。各作的定位叫法不一（花嫁候补／花婿候补／结婚候补），统一归到「结婚候补」这一个筛选下。</li>
                <li class="li"><b>角色详情重做</b>：原来是「原名／身份／声优／生日」四行加一句简介。现在有了四档礼物清单，按<b>最讨厌 → 讨厌 → 喜欢 → 最喜欢</b> 从冷到暖排成标签云，另列回礼、生日礼物、求婚道具、喜欢的香水。RF3 的香水、RF4 的回赠品、RF2 的生日礼物都是各作独有的机制，不缺项。</li>
                <li class="li"><b>各作机制的差异写在页面上</b>：RF1 <b>没有讨厌档</b>（送错不掉好感）、RF2 <b>没有最喜欢档</b>、边境与海洋<b>没有最讨厌档</b>。不写清楚，读者会以为是我们漏收了这几列。</li>
                <li class="li"><b>提醒页跟着变准</b>：生日日历此前只认 <code>data.js</code> 里那几条零散生日，RF5／边境／海洋一个都没有。改用人物档案后，RF5 从 0 条变 28 条、边境 0→27、海洋 0→26、RF4 6→24。</li>
                <li class="li"><b>搜人名终于搜得到</b>：人物不是独立页面（走 <code>#/resident</code> 与 <code>#/char</code> 路由），原先根本不进搜索索引。现在把人物作为条目补进索引——搜「比修奈尔」直达他的档案，搜「金刚花」能翻出谁最喜欢它。同名条目在旧解析表和人物档案里都存在时，人物档案排在第一位。</li>
                <li class="li"><b>没做的</b>：龙之天地（<code>azuma</code>）在源里没有人物页，仍用站内原名单 21 人，不硬凑。声优只覆盖 66 人——RF2、海洋、边境的人物页本身就不写声优，这一项留白。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十五次：加一页站点主页——「/」现在是站点介绍，攻略目录挪到「/wiki」</h2>
            <ul class="ul">
                <li class="li"><b>结构参照</b><a class="link" href="https://github.com/mineraltown/wiki" target="_blank" rel="noopener">矿石镇的攻略百科</a>（WTFPL）：它把 <code>/</code> 留给欢迎页、<code>/wiki</code> 才是攻略目录。本站此前一进站就是《符文工房4》的目录，没有站点层面的介绍，现在照这个分法拆开。</li>
                <li class="li"><b>主页内容</b>：站点封面（10 部作品 / 44 个条目 / 149 位角色，数字由数据实时统计，不写死）、10 张作品卡（点击即切到该作并进攻略）、最近更新、关于本站（数据来源 / 版式参考 / 源码 / 非官方声明）。</li>
                <li class="li"><b>「最近更新」不另维护列表</b>：直接从更新日志页的正文里抓最新三条标题。上次的教训是日志页落后了 13 个版本——再单独维护一份「最新几条」只会多一处忘记同步的地方。</li>
                <li class="li"><b>连带调整</b>：切换作品后落到 <code>/wiki</code>（原先是 <code>/</code>）；搜索页的「返回攻略目录」改指 <code>/wiki</code>；底部「攻略」标签也指向 <code>/wiki</code>。旧的 <code>#/</code> 链接不会失效，打开是主页，点「进入攻略」即可。</li>
                <li class="li"><b>没有照搬的部分</b>：参考站主页上的新作预告、微信小程序二维码、微博／公众号／B站账号都是它自己的，本站没有这些渠道，一概不填；只保留了「数据来源」「版式参考」「源码地址」「非官方声明」四项能落到实处的。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十四次：站内搜索此前只认页面标题——现在能搜到表里的每一行，四千多条数据都找得到</h2>
            <ul class="ul">
                <li class="li"><b>问题</b>：搜索框只做了「页面标题包含关键词」这一层。等于只能搜「锻造」「结婚」这种目录名；四千多行数据表（武器 447 条、料理、素材、鱼类、魔物……）里的具体名字一个都搜不出来，玩家搜「生命果冻」只会得到「没有找到」。</li>
                <li class="li"><b>做法</b>：把当前作品每个页面渲染一遍，抽出表格行建成条目索引——首格当名字、整行当检索文本，点结果跳到该页并高亮那一行。索引按作品惰性构建，实测 13~47ms，之后缓存在内存里，只在换作品时重建。</li>
                <li class="li"><b>同名合并</b>：一样东西常在多个页面出现（「生命果冻」在料理／药品／配方三页共 5 行），原样列出会刷出五条一样的结果。现在按名字合并成一条，标签显示主要来源页与「+N」，右侧「×N」是出现次数。RF4 搜「鱼」：442 行合并成 164 条。</li>
                <li class="li"><b>多词搜索会让步</b>：表头不在行内，所以「剑 攻击」这种按词 AND 匹配只剩噪声。全词命中少于 3 条时改用首词，并在结果上方写明「按『剑』单独匹配」——该例从 1 条噪声变成 54 条剑类。</li>
                <li class="li"><b>首格不是名字的表</b>：系列作品一览、抗性表首格是行号，取名字时自动退到第二格；中文译名对照表首格是日文，搜索时改用命中的那一格当标题，否则搜「生命果冻」会给你一条「バイタルグミ」。</li>
                <li class="li"><b>首页边打字边出建议</b>：输入即列前 6 条，附「查看全部 N 条」。高亮定位比对时忽略全部空白——渲染出的单元格文本带缩进换行，与索引名不完全一致就会定位失败；这一点用 8 种页面结构、2400 余条名字做了比对，匹配率 100%。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十三次：更新的内容都更新了，日志页却还停在第三十九次——补回中间 13 个版本</h2>
            <ul class="ul">
                <li class="li">第四十次到第五十二次全部缺失，玩家看到的还是九月底的进度。按 git 历史逐条补上，并把「biligame 用 <code>RF番号+英文类目</code> 命名」这条教训写进第五十二次条目，免得下次又误判「无源」。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十二次：鱼类与药品两条「以为没源」的缺口，其实是页面名找错了——补上 RF2／边境鱼表与 RF2／RF3／边境／海洋药品数值表</h2>
            <ul class="ul">
                <li class="li"><b>先把教训写在这里</b>：biligame 的符文工厂 wiki 用 <code>RF番号 + 英文类目</code> 命名（weapon／fish／medicine／item），中文名和 <code>farm</code> 后缀基本不通。此前拿「RF2作物」「RF1防具」这类名字探测全 404，就判定「无源」——<b>这是错的</b>，<code>RF2fish</code>、<code>RF3medicine</code> 一直都在。同一次探测里也顺手确认：作物与防具确实没有英文页（crop／seed／armor／shield／hat／boots 全 404），那两条「无源」的结论成立。</li>
                <li class="li"><b>鱼类图鉴不再「一页通吃」</b>：此前不管点哪一作，看到的都是 RF4／RF5 的鱼，只多一句「本作暂缺」的提示。现在 RF2（30 种鱼 + 4 种钓上杂物，含卖价／买价／出现概率／SOMA 版钓点）和边境（30 种，买价一栏全是「—」，鱼只能自己钓）各有自己的表。</li>
                <li class="li"><b>两作的买卖价列序是反的</b>：RF2 源表是「卖价→买价」，边境是「买价→卖价」。这是源表原样，没有统一，页面上也分开渲染——统一了反而误导。</li>
                <li class="li"><b>药品页从「只有名字和说明」升级成数值表</b>：RF2 27 条、RF3 43 条、边境 21 条、海洋 16 条，含恢复量、配方材料、配方等级、效果时间、买卖价。RF3SP 自动复用 RF3 的表。</li>
                <li class="li"><b>修掉一处数字自相矛盾</b>：药品页开头那句「共 N 件」取的是旧文本清单的条数，接上新表后边境会显示「126 件」而表里只有 21 条。现在件数以实际渲染的表为准。</li>
                <li class="li"><b>源表污染的处置</b>：RF2「生命果冻」的入手栏原文混进了一句对白（「…桃乐丝2-02要不要采来些药草呢……」），按上下文修回「挖矿比赛」；RF3 材料列里重复的同名材料记成「药草×2」；RF3 部分「效果」在源表里本身就截断（「全异常状态抗性+」），照录并在页内说明。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十一次：RF3SP 全线空白是个真 bug——7 处代码把 id 写死成「rf3」，特别版永远匹配不上</h2>
            <ul class="ul">
                <li class="li"><b>修前修后</b>：武器 10 → 205、防具 6 → 115、素材 7 → 94、药品 5 → 165、料理 5 → 416、魔物图鉴 ∅ → 231。改成前缀匹配 + 分类表去 sp 回退。</li>
                <li class="li"><b>新增 RF3 素材强化属性表 90 条</b>：攻／魔攻／防／魔防／力量／智力／体力／特效／强化难度，含负值——废铁会扣防、豹爪也扣防。这是「拿哪种素材强化，就得到哪种属性」的查询表，游戏里不显示。</li>
                <li class="li">fish 页给非 RF4／RF5 作品加了「本作数据暂缺」的提示（当时确实只有 RF4／RF5 有数据，第五十二次已补上 RF2 与边境）。</li>
                <li class="li">全站死链检查 0 条：所有 <code>#/page/</code> 与 <code>#/switch/</code> 链接都有对应页面，无重复 key。</li>
            </ul>
            <h2 class="h2">2026-10-28　第五十次：武器数值表七作闭环——RF1／RF2／边境／海洋 447 条战斗武器一次补齐</h2>
            <ul class="ul">
                <li class="li"><b>条数与字段</b>：RF1 77 条（20 列，保留连续攻击·蓄力·属性攻击·攻击速度）、RF2 126 条（源表按六种武器分七张表）、边境 109 条（保留消耗 SP·命中·攻防特效）、海洋 135 条（保留物防·魔防·六属性倍率）。</li>
                <li class="li"><b>不压成统一骨架</b>：四作字段差异太大，压成同一套列会丢信息，所以每作自定义列。RF5 的八字段骨架只用来接 RF3。</li>
                <li class="li"><b>农具全部排除</b>：洒水壶、锄头、钓竿、农具锤、农具斧、农具镰刀——它们属于农具不属武器。注意「战斗镰刀」是合法武器，保留。</li>
                <li class="li">接入前逐行核对了列数（RF1 20 列／RF2 15 列／边境 16 列／海洋 21 列），确认没有 colspan 错位——列错位会让整张表数据全错，这一步不能省。</li>
            </ul>
            <h2 class="h2">2026-10-28　第四十九次：RF3 武器 188 条完整数值表——从「只有名字清单」升级到可查攻击／魔攻／特效／价格</h2>
            <p class="p">源表 219 行，排除 30 条农具后剩 188 条战斗武器。字段：中文名／种类／制造等级／材料数／属性／攻击／魔攻／特效／买价／卖价。种类做了标准化（战斗锤→锤、战斗斧→斧、杖→魔杖），以便复用 RF5 的渲染分支。</p>
            <h2 class="h2">2026-10-28　第四十八次：农作页补 RF1 作物 32 种——花卉与水晶类不是吃的，它们 HP−5／RP+21</h2>
            <ul class="ul">
                <li class="li"><b>RF1 独有的「食用效果」列</b>：普通蔬果 HP+5、药草 RP+15，而<b>花卉与水晶类 12 种是 HP−5 且 RP+21</b>——它们不是食物，是提 RP 上限的消耗品。</li>
                <li class="li"><b>这一作不做日收益推算</b>：原表没有单株产量字段。RF4／RF5 能算「每天赚多少」是因为有产量列，没有就不硬填。</li>
                <li class="li">只收「有生长天数」的 32 种；野生草与采集物（竹笋、葡萄、苹果、各类杂草）没有生长天数，不列入农作表。</li>
            </ul>
            <h2 class="h2">2026-10-28　第四十七次：农作页补 RF5 作物 36 种——总生长天／最好最坏季／再生型日收益</h2>
            <p class="p">蔬果、树木、牧草与特殊作物（辉树、剑草之剑、钢身花之盾、4 种流星作物）共 36 种。再生型单独算「回本天数」而不是首轮日收益——番茄、青椒这类种子价比一茬收成还高的，首轮本来就是亏的。</p>
            <h2 class="h2">2026-10-28　第四十六次：配方大全页 RF4／RF5 料理段补上「效果」列——此前 cook 页有效果、recipe 页没有，同一个东西两个说法</h2>
            <h2 class="h2">2026-10-28　第四十五次：料理页 RF1／RF2／海洋 的配方表补「属性效果」列，与 RF3 对齐——三作各带一行效果摘要，数据全部取自已有效果字段</h2>
            <h2 class="h2">2026-10-28　第四十四次：RF3 配方面包机制再纠正——不是每道菜有专属面包，而是通用「料理パン」每天随机教 3～6 条，内容随机需存档重抽</h2>
            <h2 class="h2">2026-10-28　第四十三次：RF3 料理页补「配方面包」解锁机制——RF3 没有配方书，配方靠吃面包习得；表中制造等级只是做出成品的技能门槛，不是解锁条件</h2>
            <h2 class="h2">2026-10-28　第四十二次：RF3 料理材料配方补齐——8 类厨具 249 行（232 条可制作 + 17 件无配方成品），含材料组合／制造等级／Lv1 卖价／属性效果，配方表支持食材反查</h2>
            <h2 class="h2">2026-10-28　第四十一次：RF3 料理先用游戏文本 dump 补上 145 道「名称 + 效果」——材料配方当时无源，页面明确标注</h2>
            <h2 class="h2">2026-10-28　第四十次：RF3 料理页先给「配方表待补」的诚实指引——不编数据，指向物品一览与魔物图鉴</h2>
            <h2 class="h2">2026-10-28　第三十九次：「料理」页补上符文2（RF2）——190 条料理按六类厨具拆分 + 27 条药学。这一作的配方不靠买书、而是在阿尔瓦纳学园上课习得，故新增「配方课程」表（42 门：平底锅 16 门最多，菜刀 5、锅子 4、搅拌器 3），药学中 7 条高阶配方的习得来源是遗迹石像（斜光照射的腐朽神社石像、绵延至社石桥石像、过去纺织社迹石像）；效果沿用原表整串写法，可按关键词搜索。另修正原 wiki 表的一处重复：「烤箱」节实为「搅拌器」表的副本（17 条果汁类完全相同），已剔除，真正的烤箱菜（披萨／蛋糕／曲奇／苹果派／奶油烤菜）原表并入「锅子」节，页内已注明</h2>
            <h2 class="h2">2026-10-28　第三十八次：「料理」页补上符文1（RF1）——184 条料理按七类厨具拆分（平底锅 51 条最多、空手 12 条最少）另加 25 条无配方的成品（买来或掉落），效果栏是全站最细的一档：HP／RP／最大HP、STR／INT／DEX／VIT 四维、属性攻防（火+30 这类）、中毒／封印／麻痹／吹飞／倒地五种抗性、持续时间（秒）全部单列；外加 11 本配方书与 24 条药学（营养剂、解麻药、永久强化类及其掉落怪）。译名采用 RF1 汉化定稿</h2>
            <h2 class="h2">2026-10-28　第三十七次：「料理」页补上海洋（RFO）——181 道料理按六类厨具拆分（平底锅 47 道最多、蒸笼 13 道最少，其中「厨房」类是本作独有的不开火组合类，40 道里绝大多数是鱼），逐条给出料理等级、材料、持续时间、HP／RP 回复与抗性类特殊效果；外加 23 本配方书汇总（初级／中级／上级三档＋每类一本「奥义」）、7 种可调制药品（恢复壶层层递进到 X）与 9 件无法制作、效果永久保留的强化道具（六元素＋力量／体力／智力补品）及其掉落地点。另标注 31 道可直接在三姐妹旅馆买到成品的菜</h2>
            <h2 class="h2">2026-10-28　第三十六次：「料理」页补上边境（RFF）——228 条配方（料理 207／药学 21），六类厨具加药学各成一类，含边境独有的「配方书与入手地点」表：不先买到书，配方根本不会出现。物品译名优先采用汉化版定稿（能查到日文原名对应定稿的就用定稿名），配方书名汉化表未收录、按字面直译</h2>
            <h2 class="h2">2026-10-28　第三十五次：「料理」页补上 RF4——170 条料理配方按七类厨具拆分（平底锅 52 条最多），配方表与效果表分开列：前者给配方等级、材料与卖价，后者给 HP／RP 回复量与力量／智力／体力加成；外加 46 条药学配方（药剂 30／调味料 4／农药 12）。译名采用《符文工房4 豪华版》官方简中</h2>
            <h2 class="h2">2026-10-28　第三十四次：「料理」页补上 RF5 的真实配方——184 条料理配方按七口厨具分类（平底锅 59 条最多、蒸笼 12 条最少），逐条给出所需料理等级、材料与成品特效；外加 46 条药品与农药配方（药物 36／农药 10）。两张表都可搜索，搜食材名能反查「这东西能做什么菜」</h2>
            <h2 class="h2">2026-10-28　第三十三次：「魔物图鉴」补上海洋（RFO）的全套数值——此前只有 92 个名字与喜好作物，现在 115 只齐了等级／HP／攻防／魔攻魔防／EXP（LV1～65、HP 145～55000），外加 102 只的属性与状态抗性、92 只的掉落概率（普通／高级两档）、92 只的自然育成与巨大化率、19 只的周期产出物，并按出现点统计出「哪个岛／哪座殿有多少只」的区域分布表。攻略本怪日表作为另一套译名单独保留</h2>
            <h2 class="h2">2026-10-28　第三十二次：新增「中文译名对照」页（资料与设定组）——符文1、边境、海洋三作的汉化版定稿译名一次列全：符文1 818 条（物品 662、角色 27、地点与存档点 16、节日与生日 40、系统用词 73），边境 269 条（角色 33、地名与节日 45、物品 136、术语·星座·魔物 55），海洋 257 条（人名 55、地名 117、设施 44、节日活动 16、用词 24）。三张表都带搜索框，日文原文与英文原名并列，可中日英互查。同时按汉化定稿回改站内既有数据：边境节日改「海滩开放日／划船大赛／知识大赛／火锅大会」、角色名改「密丝特／萝赛塔／比安卡／塔芭莎／尤尼／阿涅多」、Boss「２回目」标为「（二次战）」；海洋魔物表的残留日文（サムライ、バッファムー 等）与「3F」楼层改为中文与「3层」；符文1 魔物特殊能力里的日文技能名（インフェルノ、ルフトメッサー 等）译成中文</h2>
            <h2 class="h2">2026-10-28　第三十一次：「魔物图鉴」补上 RF1 的战斗数值——63 只怪的 HP／经验／攻防、五属性抗性、六种状态抗性、捕捉所需抚摸次数与特殊能力一次列全，并说清「物理抗性普遍最低＝物理最通用」这条初代规律</h2>
            <h2 class="h2">2026-10-28　第三十次：「魔物图鉴」补上边境（RFF）——此前只有 101 个名字，现在 115 条齐了等级、HP、攻／防／魔法力、元素属性、出没地点与掉落物，等级从 1 一路到 99，并首次给出「掉落材料 Lv 有上限」这一机制（魔力结晶最高只到 Lv3）</h2>
            <h2 class="h2">2026-10-28　第二十九次：「年度节日」页收官——补上 RF5 全部 22 场带日期日程（四季各 6／6／5／5 场），逐场给出举办时间、地点与评分规则，外加躲哞哞牛种得分、大胃王计分、堆雪人雪球速度三张子表。新数据源：biligame 符文工厂 wiki</h2>
            <h2 class="h2">2026-10-27　第二十八次：「年度节日」页补上 RF2——13 场带日期日程、逐场冠军条件与奖品，外加一张别处没有的「节日当天 NPC 分布位置」表（东地区／公园／码头／西地区／北广场／流星小道／医院各有哪些人）</h2>
            <h2 class="h2">2026-10-27　第二十七次：「年度节日」页补上边境（RFF）与海洋（RFO）——两作此前只有节日名、没有日期，现在各有一张四季日期表，外加 23 场节日的逐场玩法要点（触发时刻、对话对象、奖品与扣分规则）</h2>
            <h2 class="h2">2026-10-27　第二十六次：「年度节日」页的 RF3 段升级——把「无日期顺序列表」换成具体日期表，四季的节日与居民生日一并标出；补上蔬菜竞赛得分公式、四场钓鱼大会规则，以及 24 位居民的生日送礼偏好</h2>
            <h2 class="h2">2026-10-27　第二十五次：「魔物图鉴」补齐 RF3——101 只迷宫魔物连同等级／HP／双攻双防／抗性／采集／掉落一次列全</h2>
            <ul class="ul">
                <li class="li"><b>RF3 进图鉴了</b>：从《符文工房3全攻略》（NW 旅团整理）的「全迷宫资料」抽出 <b>101 只</b>魔物，字段是全站最齐的一档——等级、HP、物攻／物防、魔攻／魔防、属性抗性、可采集物、掉落物、出没迷宫。默认按等级降序，终盘才该碰的排最上。</li>
                <li class="li"><b>抗性是倍率不是加减</b>：原表写的「火 1.5 倍、地减半」就是该属性伤害的倍数，吸收是回血、无效是免疫，「后仰抵抗」是「不会被击退」。这一列我原样保留没做换算，配一段说明教怎么读。</li>
                <li class="li"><b>不可加入的 Boss／准 Boss 单独拎出来</b>：原表这些格子是空的（没等级没 HP），分在五座主线迷宫里的 81 只「有出没地点」之外；通信迷宫的 20 个 Boss／准 Boss 单开一节，抗性多为「某属性吸收、其余减半」。</li>
                <li class="li"><b>五座迷宫各能挖什么</b>：可采矿石也抽成了表——后期要白金、钻石、各色结晶，基本卡在深层。补完这作后，图鉴覆盖到 RF1／RF2／RF3／RF4／RF5／RFO／RFF 七作。</li>
                <li class="li"><b>技术上</b>：源文本是 UTF-16 的 txt，字段以制表符分隔；构建脚本 <code>_build_mon3.py</code> 按迷宫分节解析、去重、归一化，导出 <code>js/mon3.js</code>。</li>
            </ul>
            <h2 class="h2">2026-10-27　第二十四次：「农作」页接上边境（RFF）的 36 种作物——四个阶段的天数、十级出货额，和一套别处没有的「繁荣」缩放机制</h2>
            <ul class="ul">
                <li class="li"><b>作物页多了一整节边境的</b>：春 12、夏 11、秋 10、不分季节 3，共 36 种。每种给出原表的<b>四阶段天数</b>（种／芽／叶／花）、<b>十级出货额</b>与<b>繁荣参考</b>，另附 36 条原表备注。</li>
                <li class="li"><b>冬季是空的</b>。整张表里没有一条冬季作物——冬天能种的只有牧草、白玫瑰、谜之花这三种不分季节的。这一条是翻表才发现的，攻略里很少有人写。</li>
                <li class="li"><b>长周期作物是「季节同款」</b>：40 天 9,800、60 天 18,200、90 天 30,800、100 天 36,400（三色水晶）、120 天 44,800（金刚花）。同一档天数必然同价，春夏秋各有一件，做同一件装备去哪季种都一样。<b>春季缺 40 天那一档</b>，却是唯一有 120 天作物的季节。</li>
                <li class="li"><b>「繁荣」是边境独有的一套时间缩放</b>：生长周期取决于特兰普利亚有几个地区的精灵数量超过 35 只，那个数字就是表里的「N 繁荣」。繁荣越高四个阶段越短，最短每段 1 天、共 4 天；长周期作物压不到 4 天，得配肥料。<b>原表附的五条说明</b>（阶段、肥料、繁荣读法、为什么写无繁荣版、备注怎么用）一并收进来了。</li>
                <li class="li"><b>三个容易漏的细节</b>：白玫瑰收获期不收，第三天变<b>蓝玫瑰</b>（十级出货 2,912，比白玫瑰 2,268 高）；<b>迷之信件三个密码</b>——すごいかぶ／すごいかぼちゃ／はっぱばな 分别换金芜菁、金南瓜、花红叶的种子；<b>牧草不出货</b>，靠割草类怪物上班收割，怪物好感等于收获数量的倍数。</li>
                <li class="li"><b>技术上新接了一种格式</b>：这份数据是 1997 年的 <code>.xls</code>（OLE2 复合文档），不是 zip 包着的 xlsx，原来的零依赖解析器读不了，改用 SheetJS 抽成 JSON 交给前端。构建脚本 <code>_build_rffcrop.js</code> 一并入库。</li>
            </ul>

            <h2 class="h2">2026-10-27　第二十三次：新增「状态与抗性」页——RF4 装备的 422 件里，180 件的附加率与十八种抗性第一次被整理出来</h2>
            <ul class="ul">
                <li class="li"><b>新页「状态与抗性」</b>，挂在物品道具分类下，只对 RF4／RF4S 显示。数据来自 <code>Equipment List</code> 的最后二十几列——游戏面板从不显示，只有解包表里才有：<b>十一种附加率</b>（八种状态异常 + 会心／击飞／晕眩）与<b>十八种抗性</b>（七属性 + 十一种异常）。422 件装备里有附加率或抗性的 180 件全部收录。</li>
                <li class="li"><b>能挂异常的只有 24 件</b>。105 件带附加率的装备里，其余 81 件全是会心／击飞／晕眩这类战斗手感项。「毒剑」「麻痹枪」这种流派在 RF4 里能选的武器一共就那二十来件，而<b>睡眠一项全表 0 件</b>——八种异常里唯一玩家使不出来的，只能防、不能攻。</li>
                <li class="li"><b>抗性扛把子是饰品，不是防具</b>。件数前几名 封印 24、晕 17、暴击 17、毒 8，大半是戒指和胸针。<b>钻石胸针</b>把毒／封印／麻痹／睡眠／疲劳／病／昏厥／吸血八项各给到 100%，是全表唯一一件把异常抗性凑齐的装备；<b>勇气徽章</b>覆盖 10 项但每项都不封顶。</li>
                <li class="li"><b>负抗只有 12 件，分两种设计</b>：属性戒指一属 +100、一属 −50（火之戒指 火 100／水 −50，四件两两配对）；鞋类则是轻量化的代价（火箭之翼 晕 −50／暴击 −25／击飞 −50）。<b>熬夜戒指</b> 睡眠 −25、疲劳／病 各 +30，把「熬夜」写成了数值。</li>
                <li class="li"><b>两个破表的特例</b>：<b>注射器</b>／<b>魔法注射器</b> 晕眩 150%，全表只有这两件超过 100%；<b>神木钓竿</b> 除水抗 100% 外还带击飞 100%、晕眩 50%。</li>
                <li class="li"><b>数值口径</b>：原表存的是 float32 小数，<code>0.099853515625</code> 其实就是 0.1。脚本先 round 到三位小数再换算成百分比，所以页面上是干净的 10%，不是 9.99%。</li>
            </ul>
            <h2 class="h2">2026-10-27　第二十二次：「配方大全」页接上 RF4 三张配方表——锻造、工艺、料理·药学共 635 条</h2>
            <ul class="ul">
                <li class="li"><b>「配方大全」页补上 RF4 段</b>。这一页原来只有 RF5 一套数据，现在把 <code>Craft Recipes</code>、<code>Forge Recipes</code>、<code>Cook &amp; Chem Recipes</code> 三张表合并接入：<b>锻造台 260 条</b>（七类武器 + 农具）、<b>工艺台 159 条</b>（饰品、铠甲、头饰、盾、鞋）、<b>料理·药学 216 条</b>（七种器具 + 化学）。三张表各自独立，筛选与搜索沿用同一套交互。</li>
                <li class="li"><b>三套技能互不相通</b>：锻造、工艺、料理、药学是四种独立技能，锻造练到 50 级不会顺带把料理也练上去。想做哪一类，就得单独练那一门——这也是页面按工作台分组、而不是按「等级从低到高」混排的原因。</li>
                <li class="li"><b>RF4 配方的核心是「素材类别」</b>：全表出现 <b>15 种类别、共 311 次</b>，包括矿石类、布、皮类、线、绳类、爪、牙类、棒、茎类、甲壳、骨类、羽毛类、鳞片类、结晶类、宝石类、石类、碎片类、液体类、粉末、秘药类、毛皮类。页面上把类别做了浅蓝底标记，与具体物品区分开——写「矿石类」时，往里面塞这一类的任意一种都算数。</li>
                <li class="li"><b>剔除 2 行剧情道具</b>：<code>Venti's Charm</code>（赛尔泽的护符）在 <code>Craft Recipes</code> 里占了两行，素材栏全空、等级 999——没有材料能做的不是配方。剔除后 Craft 由 161 条降到 159 条，三表合计 <b>635 条</b>。</li>
                <li class="li"><b>四季头饰没有等级</b>：春、夏、秋、冬头饰的等级栏是 999，页面上显示为「—」。四件都是「头饰 + 一种对应素材」的二料配方：春=月落草、夏=粉红猫、秋=红水晶、冬=白水晶。常规配方的等级上限是 99。</li>
                <li class="li"><b>素材最多的有 6 项</b>：放松茶的茶叶（六色草）、至尊咖喱、究极咖喱、蛋糕、巧克力蛋糕等 8 条满配。配方名与素材名全部按《译名表》转成 RF4S 简体中文，译名覆盖率 615/618 与 308/309，剩下的是原表编码乱码（<code>No Rot α/β</code> 等希腊字母），已在构建脚本里修正。</li>
            </ul>

            <h2 class="h2">2026-10-27　第二十一次：「农作」页接上 RF4 作物表——50 种作物的四段天数、再生周期与土壤系数</h2>
            <ul class="ul">
                <li class="li"><b>「农作」页补上 RF4 段</b>。这一页原来是通用散文，没有任何具体数字；这次接上 <code>Crop Values</code> 表：<b>50 种可种作物</b>，含四段成长天数、再生间隔、每株产量、初始 HP、五项土壤系数，再与 <code>Item Values</code> 的种子买价、果实卖价对接，算出单株日收益。</li>
                <li class="li"><b>阶段最多四段，但不是每种都走满</b>：11 种作物第三段满了就直接收获（第四段为 0），菠菜只有两段——1 + 1 = <b>2 天</b>成熟，是全表最快；最长的是金刚花与金芜菁，四段各 30 天、合计 <b>120 天</b>。</li>
                <li class="li"><b>长得最慢的反而单株最赚</b>：按（产量 × 卖价 − 种子价）÷ 总天数排，前八名全是金色系与水晶系——金刚花 <b>500 / 天</b>，白水晶与金芜菁 416.7 / 天。原因不是它们长得快，而是<b>种子价被摊得开、卖价又高得多</b>。但这条不能直接照着种：金刚花占一格地 120 天，同样一格地能轮 40 茬芜菁。</li>
                <li class="li"><b>再生型 10 种，其中 3 种第一轮是亏的</b>：少女蜜瓜、番茄、青椒的种子价高于一茬收成（分别差 25%／16%／7%），必须收第二轮才回本。正确指标不是首轮日收益，而是<b>「回本次数」= 种子价 ÷ 一次收获总价</b>。</li>
                <li class="li"><b>再生型的效率冠军是菠萝</b>：单株 3 个 × 1600 = 4800，再生只要 5 天，<b>平均每天 960</b>，比金刚花的 500 还高，总天数只有 28 天；门槛是 2800 的种子价。另一个极端是牧草，再生 1 天、单株只卖 60，价值在喂家畜而不在卖钱。</li>
                <li class="li"><b>土壤五项系数每种作物吃的不是同一样东西</b>：金刚花合计 21.25 最吃地力（综合 6.25 + 其余四项各 3.75），牧草五项全 0、种哪都一样。四块水晶各自只认一项——白水晶偏速度、红水晶偏品质、绿水晶偏数量、青水晶偏尺寸，<b>堆错方向等于白施肥</b>。原表没给公式，页面只按数值排，不猜机制。</li>
                <li class="li"><b>两处数据缺口照实写明</b>：7 种（苹果、橘子、葡萄、闪耀树、田地迷宫、剑草之剑、钢身花之盾）原表产量列为 0，树类与「长出来的装备」不适用「每株产量」；<b>解包表里没有季节字段，所以这一页不标哪季能种</b>。</li>
                <li class="li"><b>数据清洗</b>：<code>Item Values</code> 里「芜菁」有两条、后一条买卖价都是 0，直接按名字建字典会把卖价冲成 0；改为<b>取非零最大值</b>。种子名另有「葱的种子」「幸运草种子」两种不规整写法，做了别名映射（四叶草 ← 幸运草）。</li>
            </ul>

            <ul class="ul">
                <li class="li"><b>「钓点与季节」页扩展到 RF4</b>。这一页原来是 RF5 专属，RF4 侧只有「鱼类图鉴」的价格，没有分布。这次接上 <code>Fish Rates NS</code> 表：<b>38 条有效行 × 21 个环境列</b>，逐列归一化成百分比。</li>
                <li class="li"><b>RF4 的表是一张平铺表，不是二维网格</b>：前 8 列是「季节 × 天气」（春／春·雨／夏／夏·雨／秋／秋·雨／冬／冬·雨），后 13 列是固定水域（沙池、伊德拉 B1/B2、约克米尔瀑布与池、水之遗迹、玛雅之路、塞克斯洞窟 + 5 处原表未命名地点）。<b>这两组不是同一个维度，不能相乘也不能互相替代</b>。</li>
                <li class="li"><b>本批最硬的一条：固定水域不看季节。</b>河豚在季节列里只在冬天出（5.8%），可它在塞克斯洞窟占 <b>13.5%</b>，比任何一季都高；虾夏天野外 6.3%，在伊德拉 B1 是 <b>82.1%</b>。<b>季节限定只约束野外那口通用水面</b>——想蹲冬限鱼不必等冬天，进洞窟就行。RF5 不是这个机制，那边季节始终生效。</li>
                <li class="li"><b>八处水域分成两个综合池、六个专精池</b>：玛雅之路 34/38 种、水之遗迹 33/38，基本什么都钓得到；其余六处只有 4～22 种，但每处都有压倒性主产（瀑布 55.4% 剧毒虹鳟、伊德拉 B1 82.1% 虾、沙池 94.8% 砂比目鱼）。<b>刷图鉴去综合池，定点刷某一种去专精池。</b></li>
                <li class="li"><b>五个未命名地点有一串整齐到可疑的递减</b>：只写 <code>Loc 17</code>～<code>Loc 21</code>，内容是石川鲑鱼 86.2%→97.1%、垃圾率 13.4%→1.0%，中间没有一次反复，更像按某个参数生成的五档。实用结论：<b>这五处是「石川鲑鱼 + 垃圾」的低级水洼，垃圾率比季节列高六十倍</b>，攒钱时别在这耗。</li>
                <li class="li"><b>雨天只重新洗牌，不换名单</b>：四个季节里晴／雨两列的种类数完全一样（26/26、26/26、24/24、24/24），只是权重重排，而且方向不统一——狗鱼在秋雨掉 6.2 点，萤乌贼反而涨 2.1 点。<b>不存在「雨天更容易出稀有鱼」。</b></li>
                <li class="li"><b>修了一处原表的译名错位</b>：中文列在 <code>Pike</code> 之后整体串位一行（多插了「秋刀鱼」「高身鲫」两个本表没有的名字），导致狗鱼、河豚、青甘鱼、鲫鱼四条全错。已按英文原名改回，并在页注里写明。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十九次：新增「钓点与季节」——同一口池塘换季就换鱼，这次的数字来自解包表</h2>
            <ul class="ul">
                <li class="li"><b>新增「钓点与季节」</b>（RF5）。原来的「鱼类图鉴」只有鱼影、金杯线和 RF5 的买卖价，<b>没有「在哪钓、什么季节钓」</b>。这一页补的就是这块：<b>141 条有效记录</b>，覆盖里格巴斯周边 6 处固定水域。</li>
                <li class="li"><b>说明了一件容易被误解的事</b>：RF5 的钓鱼不是全图一张概率表，而是<b>「钓点 × 季节」各自一块，每块单独归一化到 100%</b>。所以 A 池的 20% 和 B 池的 20% 根本不是同一件事，跨池比概率没有意义。</li>
                <li class="li"><b>解包表的 0/1 两档被解开了</b>：原表每季都有 Spring0 / Spring1 两份权重，鱼种名单完全相同、只有权重不同。数下来方向很一致——<b>切到 1 档，最稀有的 Rank 4 总占比几乎翻倍</b>（春 1.3%→1.9%、夏 1.2%→2.1%、秋 0.9%→1.7%、冬 1.0%→1.8%），普通鱼相应下降。解包表没写这两档对应什么操作，本页不猜，只把差异摆出来。</li>
                <li class="li"><b>两个「独占池」</b>：<b>一同垂钓（多人）有 10 种鱼单机钓不到</b>——鳕场蟹、旗鱼、翻车鱼、红金眼鲷、鲍鱼、黄金三文鱼、黄金章鱼等，全是四季常驻；<b>码头独占 7 种</b>，清一色溪流小鱼（石川鲑鱼、山女鳟、高身鲫、剧毒虹鳟…）。想凑图鉴，这两个地方要单独跑。</li>
                <li class="li"><b>一个反直觉的统计</b>：<b>25 种鱼四季都能钓，真正被季节锁住的只有 4 种</b>（石川鲑鱼仅春、钩吻鲑仅秋、西太公鱼与河豚仅冬）。所以「换季要重排钓鱼清单」只对了一小半——<b>换掉的是概率，不是名单</b>：春天 21.7% 的乌贼，夏天只剩 5.5%，但它还在池子里。</li>
                <li class="li"><b>数据缺口如实标注</b>：原表另外 18 处地区（福洛斯森林、凯尔贝火山地带、尤米娜湖、梅利涅水晶洞窟…）的权重<b>全是 0</b>，是没填完的空块，本页不收、也不拿别的数据凑。表里 339 行中 198 行属于这种全 0 占位，已剔除。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十八次：补上「村民喜好」——魔物之外的另一套清单，人也要送对东西</h2>
            <ul class="ul">
                <li class="li"><b>新增「村民喜好」</b>（RF4／RF5）。之前站点只有魔物吃什么东西，没有<b>人</b>吃什么东西——这一页补的就是这块。RF5 收 <b>29 人</b>（超喜欢 130 条、喜欢 687 条、不喜欢 479 条、极讨厌 70 条），RF4 收 <b>27 人</b>（185／291／70）。</li>
                <li class="li"><b>RF5 的结论是「四份清单只有两份值得背」</b>：喜欢清单平均 24 样，宽到没有筛选价值；真正带个人色彩的只有超喜欢（平均 4.5 样）和极讨厌（平均 2.4 样）。所以送礼的正确姿势是记两头，不用查全表。</li>
                <li class="li"><b>翻出一个很整齐的规律</b>：把 29 人的「不喜欢 + 极讨厌」并起来数，有 <b>11 样东西至少 26 个人都讨厌</b>——石头、树枝、枯草、杂草、空罐、废铁、高筒靴、失败之作……正好就是游戏里标成「垃圾」的那一类。这张表的实际用途不是送礼避开，是<b>反查背包里哪些是垃圾</b>。</li>
                <li class="li"><b>RF4 那边有确切的 FP 数值</b>：+15 超喜欢、+9 料理、+6 普通物品、−5 不喜欢、−10 讨厌，<b>没有中间档</b>。所以策略只有一句话——能送超喜欢就送超喜欢，实在没有挑一样料理。</li>
                <li class="li"><b>金作物是 RF4 的硬通货</b>：<b>10 / 27 人</b>的超喜欢清单里含金作物（金芜菁、金卷心菜王、超级金马铃薯…）。中期以后田里留一小块地专种金色种子，收成就是通用礼物。反面则是<b>芜菁三兄弟</b>——芜菁天堂、芜菁酸菜、腌红白芜菁，各有 3 人明确讨厌，并列讨厌榜第一。</li>
                <li class="li"><b>技术上加了两样小东西</b>：可搜索的表现在能带样式类（用于给窄屏表格设下限宽度，不然「超喜欢」那列会被压成每字一行）；另外新增一种「名 + 长清单」的段落列表样式，用来放每人几十条的喜欢清单。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十七次：新收「符文攻略」资料包，补上魔物喜好、素材出处与 RF3 香水</h2>
            <ul class="ul">
                <li class="li"><b>新增「魔物喜好」</b>（RF4／RF5）。这是之前完全空白的一块：喂什么才能驯服。RF4 收 <b>189 只</b>（158 只有喜好），RF5 收 <b>237 只</b>（可抓 185、有喜好 184，另带初始捕捉率）。</li>
                <li class="li"><b>结论是皮毛类通吃</b>：RF5 里毛皮与上等皮毛各被 <b>24 只</b>魔物喜欢（占全部 237 只的 10%），RF4 里毛皮被 <b>12 只</b>喜欢，都排第一。所以背包常备一叠皮毛，等于对一大批怪自带钥匙。</li>
                <li class="li"><b>新增「素材出处与掉落」</b>（RF4／RF5）。RF4 拆成两半——<b>175 件采集与生产类素材</b>（挖掘／砍伐／钓鱼／种植／商店，标到具体地图，甚至标「罕见」）＋<b>205 只魔物的分布与掉落</b>；RF5 收 <b>223 只</b>的掉落率（Hyperwiki 实测）。RF5 那边单列了 <b>概率低于 1% 的稀有掉落</b>——这些不是刷一刷就有，是按期望值要打上百只的量。</li>
                <li class="li"><b>新增「香水与喜好」</b>（RF3／RF3 SP）。<b>16 款香味 × 24 位角色</b>，共 78 个对应关系。最实用的一条：男士款 <b>16 人</b>、女士款 <b>8 人</b>，加起来正好 24——<b>每个角色只认其中一款，不存在两款都吃的人</b>。所以送香水先判断性别款，味道反而是第二位。</li>
                <li class="li"><b>「战斗与弱点」补上 RF3</b>：<b>18 只 Boss</b> 的八项抗性。这里有个反直觉的结果——<b>11 只根本没有属性弱点</b>（三只幻龙、水晶象、塞壬、奇美拉、蝾螈龙、哥勒姆全在这一档），真正要换属性的只有 7 只，而其中 <b>6 只的软肋都包含「爱」</b>。爱属性在 RF4 是通杀、RF5 基本废掉，到 RF3 反倒成了 Boss 战的通用解。</li>
                <li class="li"><b>技术上补了一个缺口</b>：原来一页只能有一张可搜索的表（搜索框绑死了单一 id），现在每张表可以自带搜索框、互不干扰——RF4 的素材页现在两张表并存，搜第一张不会把第二张也筛掉。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十六次：「××一览」全部并入「××」，「武器」讲的终于就是本作的武器</h2>
            <ul class="ul">
                <li class="li"><b>六组重复的页面合成了一组</b>。「武器一览」并入「武器」、「防具一览」并入「防具」，农具、素材、料理、药品同理。<b>目录里的物品道具从 13 项缩到 7 项</b>，每个分类页现在是「先讲怎么选，再给本作全表」。老链接（<code>#/page/wlist</code> 之类）自动跳到新页面，不会失效。</li>
                <li class="li"><b>真正修掉的是一个事实错误</b>。原来的「武器」页对所有作品都列八类——<b>可初代只有五种</b>，双剑、拳套、魔杖要到 RF2 之后才出现。现在这张表按本作实际数据生成：RF1 是<b>单手剑 21、双手剑 21、长枪 21、锤 7、斧 6</b>；边境多一类魔杖；RF3 还有双剑；RFO 与龙之天地没有物品数据，就只讲机制，不再硬凑种类。</li>
                <li class="li"><b>顺带把三作的武器按解包顺序细分了</b>。段边界是逐条核对名字定出来的，不是按名字猜的——RF1 从「阔剑」到「符文剑」正好 21 件，接下 21 件是「大剑」到「元素之力」，再 21 件长枪、7 件锤、6 件斧，合计 76 件，与全表一条不差。RF3 的武器段中间还夹着 27 件农具，所以它分两截，靠首尾条目名断言兜底。</li>
                <li class="li"><b>有一处对不齐的地方干脆说明白了</b>：RF3 把 15 件盾排在武器段里（「迷你盾」到「魔术盾」），所以它单独成一类「盾」，没有硬塞进武器或防具。</li>
                <li class="li"><b>六页现在都带本作数据</b>：RF1 武器 76、防具 85、农具 31、素材 79、料理 181、药 25；RF2 武器 138、防具 86；RF3 武器 193、防具 108；边境武器 121、素材 126。这些数字与「物品一览」里的分类件数完全一致，两处不会再打架。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十五次：四部作品的物品一览全部改成按分类分节</h2>
            <ul class="ul">
                <li class="li"><b>「物品一览」不再是一张几千行的大表</b>。RF1、RF2、RF3 与边境四页，现在都按分类拆成独立小节：标题带件数，顶部一排分类按钮可以直接跳过去，点完不用往下翻。</li>
                <li class="li"><b>搜索改成跨全部分类</b>。以前下拉只能看一类，等于搜不到跨类的东西；现在一个输入框筛全部条目，<b>筛完没有内容的分类会自动收起</b>，输错词也不再是一片空白，会提示换个说法。</li>
                <li class="li"><b>RF2 的分类是从零补的</b>。它的解包文本里没有可用的分类字段——原表另有一列分类编号，但同一编号下混着蔬菜、料理和矿石，跟实际类别对不上。于是照 RF1 的老办法<b>按解包排列顺序切段</b>，763 条逐条核对名称定出 21 类：<b>料理 142、素材 78、饰品 71、剑 56、魔法与技能 44、种子 43</b>……连「镰刀／洒水壶／锄头／钓竿」这四小段也合并成了「农具」24 件。</li>
                <li class="li"><b>边境 11 类、RF3 16 类、RF1 14 类</b>。分类多少取决于解包表本身怎么排：边境把「药与素材」合成一段（126 件），RF3 的武器则是整段 208 件不再细分——这两作的解包文本里没有更细的边界，硬拆只会切错位置。分类数到 14 个以上时，页面会把按钮自动收窄一档，免得占掉半屏。</li>
                <li class="li"><b>有一处细节值得记一笔</b>：RF2 的「艾丽草」夹在料理段的末尾（第 243 条，紧接「红酒」之后），但说明写的是「开着深蓝色花朵的异国植物，普遍认为对美容有益」——它是花草，不是菜。这种位置在段内、性质在段外的条目单独拎出来归到了「草与花」。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十四次：初代（RF1）的物品库终于有了，四季种子表直接从说明里读出来</h2>
            <ul class="ul">
                <li class="li"><b>RF1 的物品一件不缺地进来了</b>：<b>653 件，每一件都带说明全文</b>，按解包顺序切成 14 段（料理与食材 181、盾与饰品 85、素材 79、武器 76、种子 32……）。这份表好在<b>不用猜配对</b>——说明表自带「rfItemName 参照」列，直接指向物品名，所以是逐条对上的。另有 20 条占位项（「未使用…」9 条、「未定32～42」11 条）在游戏里拿不到，已剔除。</li>
                <li class="li"><b>四季种子表是这一页最有用的东西</b>。初代的种子说明第一句就写「能在春季播种」，所以四季能种什么可以直接从文本读出来，不用查攻略：<b>春 11 种、夏 10 种、秋 10 种，牧草全年可种但冬季不行</b>。四季各<b>正好 5 种作物</b>，花草另算——春多出来的那种是两种专属药草（月落草、托伊药草）。</li>
                <li class="li"><b>查出一件反直觉的事：这一作的料理有三成是鱼</b>。30 种鱼能做出 54 道菜——同一条鱼可以切片生吃，也可以整条盐烤或照烧。所以初代的钓鱼不是副业，是料理的主干。</li>
                <li class="li"><b>魔物图鉴补上了「10 大种族」与「11 种特技」</b>。之前的 RF1 那份表只有名字、洞窟、掉落与雇佣能力，缺了图鉴真正的分组方式：游戏内按<b>亚人／昆虫／动物／植物／鱼／精灵／鬼魂／无机质／妖精／凋零</b>十页归类。另外魔物攻击在数据里是一张独立表：<b>4 种属性攻击（火风地水）+ 7 种附加效果（会心、击飞、倒地、吸收、毒素、封印、麻痹）</b>——被击飞与倒地不是伤害高，而是硬直，之后挨的才是真伤害。</li>
                <li class="li"><b>顺带把初代的洞窟译名全对了一遍</b>。之前用的是意译（巨神山脉、卡麦多），现在统一成汉化定稿：<b>卡麦特洞窟／特罗斯洞窟／克莱门斯洞窟／癸干忒山／密丝特布鲁姆／卡西米尔遗迹／达努洞窟／格力德洞窟</b>。改完拿存档点地名表核对——八座洞窟一个不差，连「中层／最下层」「山腰／山顶」这些分层都对得上。</li>
                <li class="li"><b>节日页补了 RF1 的 26 位居民生日</b>。解包表把节日与生日排在<b>同一条时间轴</b>上，一共 40 条。它的用法不是记日期，而是<b>当季节的刻度</b>：「春之感恩节之后、鸡蛋大赛之前过生日的是拉塞尔」——这样不记日期也能知道该在什么时候备礼物。节日名也换成了定稿：年始祭→元旦、ふわ毛祭り→软软毛节、聖夜祭→圣夜祭。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十三次：RF2／RF3／边境的物品与魔物全部补齐，译名改用汉化定稿</h2>
            <ul class="ul">
                <li class="li"><b>三份汉化工程表直接变成了数据</b>。你给的「符文工厂2」「边境汉化」两份腾讯表格，加上桌面上的 RF3 解包文本，现在都进了站：<b>RF2 物品 763 件加魔物 94 只</b>、<b>边境物品 743 件加魔物 97 种</b>、<b>RF3 物品 867 件</b>。加上原有的 RF4、RF5，物品清单已经覆盖五部作品。</li>
                <li class="li"><b>RF2 的魔物表是意外之喜</b>。它的解包文本里，每只怪都带一条<b>说明文</b>，末尾写着【特技】与【属性】——「连续攻击／地属性」「连射攻击／风属性」这样的组合。于是这张表能回答一个很实际的问题：<b>打它之前该换哪把武器</b>。属性分布也顺手统计了：无属性 19 只最多，地属性 18、火 16、暗 15、风 13、水 12，光属性只有 1 只。</li>
                <li class="li"><b>RF3 的物品说明比前后两作都厚</b>，一句「好吃的蔬菜」能写成三四行。所以这一页把说明全文都收进来了，867 件按解包顺序切成 16 类（武器 208、料理 137、防具与饰品 93、素材 86……）。说明里能直接读出素材出处（「兽人的破布」「维京肩甲」）和武器属性（「寄宿着X之魔力」）。</li>
                <li class="li"><b>边境的物品分季表最实用</b>。这作的作物说明几乎都写成「某季蔬菜。N 天即可收获」，还有「收获后 N 天可再次收获」。页里按 11 类分好（种子 37、作物与花草 48、鱼 30……），种田的人可以直接按季排轮作。</li>
                <li class="li"><b>RFO 的地名译名全部换成汉化组定稿</b>。上一轮那些自译名是错的：艾莉兰德→<b>翠绿胜地</b>、拉弗雷希亚兰德→<b>巨花胜地</b>、布利扎尔兰德→<b>暴雪胜地</b>、马格斯拉德→<b>岩浆胜地</b>；「X之精灵殿」一律改「<b>X精灵神殿</b>」，岩礁沉船→岩礁的沉船、石床庭园→铺石庭院。顺带补掉两个漏译的系别：パワー系→<b>力量系</b>、スライム系→<b>史莱姆系</b>。</li>
                <li class="li"><b>节日页补上了 RF3 的全年日程</b>（17 个节日加 24 位居民生日，按游戏内月份排序），RF2 与海洋的节日名也换成了各自汉化文本里的定稿写法——之前那些是照着记忆写的，和原文对不上。</li>
                <li class="li"><b>没数据的仍然空着</b>：RF3 的怪物名表不在解包文本里（只有物品名），所以这一作的魔物图鉴依旧给说明页，不拿别作的名单凑。RFF 的怪物只有名字、没有等级与掉落，页里也写明了。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十二次：物品与魔物改成「按作品各一套」，RF4 补齐全套</h2>
            <ul class="ul">
                <li class="li"><b>改掉了上一版最别扭的地方</b>：物品一览页原来只认 RF5，别的作品根本看不到这一条；魔物图鉴则把 RF5、RF4、RF1 三份名单堆在同一页上。现在两者都变成<b>按当前作品渲染</b>——选 RF4 看 RF4 的表，选 RF5 看 RF5 的表，互不串用。</li>
                <li class="li"><b>RF4 的物品数据补齐了</b>，来源是《RF4数据解包汉化版 Datamining Compendium》的 Item Values 与 Equipment List 两张表：武器 <b>231</b> 件、防具 <b>91</b> 件、饰品 <b>70</b> 件、农具 <b>30</b> 件、素材 <b>214</b> 件、料理 <b>171</b> 道、食材 <b>161</b> 件、药品 <b>17</b> 件、种子与农药 <b>60</b> 件。两张表按行序完全对得上（422 行装备，名字逐行一致），所以装备的数值与类别不会错位。</li>
                <li class="li"><b>顺带查出一件反直觉的事</b>：RF4 与 RF5 的武器<b>同名 192 件，物攻一项不差</b>；防具、素材的表则是两张不同的表。也就是说两作共用同一套装备基础表，RF5 那张比 RF4 多十几件。「RF4 的终盘武器在 RF5 能不能用」这种问题，答案是同一把。</li>
                <li class="li"><b>魔物图鉴按作品分家</b>：RF5（236 种，含捕捉率与可驯标记）、RF4（190 种，含基础等级／HP／攻击，按等级排序）、RF1（65 种，含洞窟与雇佣能力）、<b>RFO 海洋（92 种，含系别、喜好作物、产出与捕捉地点）</b>。RFO 这份是新加的，取自《符文工厂海洋（最强攻略）》的怪日表，日文魔物名、掉落物与岛名已按系列通用译名转为中文。</li>
                <li class="li"><b>没数据的作品就空着</b>。RF2、RF3、RFF、AZUMA 这四作点进魔物图鉴会看到一页说明，告诉你本站收了哪几作、为什么这一作还没有——攻略本只有 RF5、海洋与边境三本，其余作品只能靠二手资料逐只核对。物品一览页在这几作里干脆不出现，不再给空壳页面。</li>
                <li class="li"><b>RF4 的掉落列有个缺口</b>：掉落物来自旧汉化的怪物喜好表（兽人、哥布林、牛头人），等级／HP 来自 RF4S 解包表（维京兽人、哥布林海盗），两套译名只对上 <b>139</b> 种，剩下的等级列留「—」。页内写明了这件事，不硬凑对应关系。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十一次：物品道具拆成「讲解页 + 一览页」，不再让别作看见 RF5</h2>
            <ul class="ul">
                <li class="li"><b>上一版有个说不通的地方</b>：武器、防具、农具、素材、料理、药品这六页是通用条目，每部作品的物品目录里都有，但表只有 RF5 有——于是用 RF3 点进去，会看到半页 RF5 的统计、"RF5 共 247 件武器"这样的句子，还有一句「请先切换到 RF5」。既不像别作的页面，也不像 RF5 的页面。</li>
                <li class="li"><b>现在拆成两套</b>：六页原样保留为<b>跨作品通用的机制讲解</b>（武器八类怎么分工、防具几个部位、农具蓄力为什么优先、素材稀有度怎么读、料理器具分级、药与营养剂的分工），不再出现任何 RF5 的数据；另设六个<b>一览页</b>——武器一览 247 件、防具一览 159 条（92 件防具加 67 件饰品）、农具一览 34 件、素材一览 192 件、料理一览 323 条（190 道加 133 件食材）、药品一览 27 件，只在《符文工房5》的目录里出现。</li>
                <li class="li"><b>在 RF5 里两页是成对的</b>：物品目录按「武器 → 武器一览 → 防具 → 防具一览」这样排列，讲解页底部也多了一张指向对应一览页的卡片。非 RF5 作品里既看不到一览页，也看不到那张卡片——不会再出现点了跳进空白页的情况。</li>
                <li class="li"><b>「配方大全」也一起收了</b>。它本来就是 661 条 RF5 配方，挂在全作品下同样说不通，现在标注为 RF5 专属；其他作品的锻造页仍有那张跳转卡，只是不指向它。条目总数因此变成：<b>RF5 39 条 / 其他作品各 31 条</b>。</li>
                <li class="li"><b>顺带修了两个表格排版问题</b>：① 武器「各类型的天花板」原来是四列，末列「收录」被前面几列挤成竖排的「3 5 件」，现在改成三列，件数并进种类名下（「枪（35）」）；② 防具清单的「抗性·加成」列太窄，一条抗性摘要被拆成一行一个字，重新分配列宽之后一条摘要最多占两行。六张表下方也补了一句「列多放不下时，表格可以左右滑动」。</li>
            </ul>
            <h2 class="h2">2026-10-27　第十次：物品道具六页全部数据化，毕业套限定 RF5</h2>
            <ul class="ul">
                <li class="li"><b>物品道具一栏从「讲道理」变成「查表」</b>。武器、防具、农具、素材、料理、药品六页，原来每页只有两三百字加一张四行的小表，现在都挂上了 RF5 的完整清单：武器 <b>247</b> 件、防具 <b>92</b> 件加饰品 <b>67</b> 件、农具 <b>34</b> 件、素材 <b>192</b> 件、料理 <b>190</b> 道加食材 <b>133</b> 件、药品 <b>27</b> 件，合计 <b>1035</b> 条。数据取自《rf5简陋物品数据8_27.xlsx》的装备表与物品基础表。</li>
                <li class="li"><b>每页都能筛</b>：武器按八种类型分按钮，防具按部位分按钮，农具按九种工具分按钮，素材按十六类、料理与食材按十四类走下拉（分类太多时按钮会排三四行，下拉更省地方），药品只有药与营养剂两类，用按钮。搜索框认名称、类别、属性、抗性摘要，输入「火」就能筛出所有带火光抗的防具。</li>
                <li class="li"><b>查表查出了几条以前写不出来的结论</b>：① <b>武器全表的力量／体力加成都是 0</b>，那部分只能靠素材强化叠，这也解释了毕业套为什么要靠发光的鳞片堆力量；② 面板最高不是剑而是锤「飞溅之星」14000，双手剑「王者之剑」13600 次之，而魔杖物攻一栏干脆是 0，「贤者之杖」12960 全在魔攻上——「哪把最强」得先问打物攻还是魔攻；③ <b>农具也有属性且固定不变</b>：锄头地、洒水壶水、镰刀风，其余无属性，所以农具打怪时的属性加成是有规律的，不是玄学；④ 盾<b>只有配单手剑时才能装</b>，这条以前站内没写清楚。</li>
                <li class="li"><b>素材页补上了「稀有度」这个被忽略的字段</b>。稀有度同时决定成品等级上限与强化时能提供的格数，稀有度 12 以上的只有 74 件，那批就是后期配方的瓶颈。同页还加了「买价 ÷ 卖价」的读法：比值越大越不该卖——它的用途在你手上，不在商店里。</li>
                <li class="li"><b>「装备打造·毕业套」按你的要求收成 RF5 专属</b>。RF4S 的两张完整表（武器分通用／风属性／杖三线、防具五件套）已经撤下，页面只在 RF5 的作品目录里出现；页内「（RF5 ／ RF4S 译名）」这类双译名写法也一并清掉，物体X、奇妙的首饰等 RF4S 叫法改回 RF5 的「不明物体」「奇妙的坠饰」。RF4S 是否用同一套算法，页内留了一段说明，但不给表——两代素材名混排最容易记串。</li>
                <li class="li"><b>新增「条目级作品可见性」机制</b>。条目可以声明只属于某一部作品，首页目录、分类页、搜索都会跟着过滤，直接访问 URL 也不会看到错作品的正文——而是给一页留白说明加「切换到《符文工房5》」的入口。底部「共 N 个条目」的计数也改成按当前作品算：RF5 是 33 条，其余作品 32 条。</li>
                <li class="li"><b>顺带修了两处交叉引用</b>：「锻造与药学」页底那两张跳转卡（配方大全、装备打造）现在只在 RF5 下显示毕业套那一张，避免点了跳进空白页；武器页新增三张跳转卡，分指毕业套、战斗与弱点、配方大全。</li>
            </ul>
            <h2 class="h2">2026-10-27　第九次：RF4 抗性补上，爱属性原来是反的</h2>
            <ul class="ul">
                <li class="li"><b>第八次留下的 RF4 缺口补上了</b>。上次因为「村民与魔物混在一张表里」没有收录，这次找到了分界：三张表前 27 行固定是居民（雷斯特、比修奈尔、库洛丽嘉…幻想的雾香），从「兽人」起才是战斗对象。切掉居民段、再剔除活动种子×11／广告牌×2／宝珠×4／<code>???</code>×4／宝箱类，得 <b>228 只魔物</b>。</li>
                <li class="li"><b>最重要的发现：爱属性在两作里方向相反</b>。RF4 净差 <b>+27</b>（54 只怕、27 只抗），是八属性中唯一净正的；RF5 是 <b>−20</b>（1 只怕、21 只抗）。同一把爱属性武器，RF4 是通杀，RF5 基本白给。这也修正了第八次那句「爱属性几乎无人害怕」——那句话只对 RF5 成立。</li>
                <li class="li"><b>爱到底克什么，规律很整齐</b>：54 只怕爱的几乎全是人造与亡灵——魔法师系 −1、塞克斯机械兵 −0.25～−1、鬼魂／石棺／远古之骨／死亡之墙 −0.1～−0.5、幽灵蔬菜 −0.25、史莱姆与传送门 −0.5～−1。而抗爱的 27 只正好是自然侧：精灵系 +0.75、宝石系 +0.75、妖精与妖兽 +0.25、粉龙 +2。按设定读得通——爱是给「没有爱的东西」准备的。</li>
                <li class="li"><b>RF4 多一个维度：八种异常抗性</b>。RF5 的两张表没有这一层，RF4 有逐只系数。免疫比例：即死 116 只（过半）、睡眠 105、中毒 102、疲劳与感冒各 99、麻痹 89、封印 83、吸收仅 46。这条直接改写了上一轮的一个结论——「异常状态在数值上没有抗性去削它」是错的，那是 RF5 数据缺失，不是系统缺失。</li>
                <li class="li"><b>发现两作用了两套量纲</b>：RF4 眩晕抗性 0～1（免疫＝1），RF5 是 0～100（免疫＝100）；且 RF4 的「攻击硬直／攻击吹飞」指<b>它打你时</b>，RF5 的「硬直」指<b>它被打时</b>。字段位置也不同，硬套会算错——初算时把 RF4 的「攻击硬直」当成眩晕抗性，得到的免疫数直接是 0。</li>
                <li class="li"><b>对齐方法升级</b>：三张表行数不同（279／371／276）且都有重复行，按行号硬对会从第 200 行开始全错。改用序列对齐（以属性表为主序列），异常表配对 278/279、控制表配对 272/279，零误配。异常表里混入的「打开菜单」「输入名字」「商店」等 93 条 UI 条目全部排除。</li>
                <li class="li">新增两作净差对照表、爱属性两端构成表、异常免疫分布表、量纲差异表，以及 RF4 的 228 只弱点速查折叠表。RF5 表上那句「RF4 暂未收录」已改掉。</li>
                <li class="li"><b>顺带修正第八次的一个错判</b>：上次写「免疫眩晕与免疫击飞的名单完全一致，82 只」。复查后是 <b>82 与 80</b>——差的 2 行是「冈多亚杰」（等级变体共 2 只），它眩晕抗性 100、吹飞抗性 0.99，属「几乎免疫」而非免疫。原文已改为「几乎完全重叠」并点出这个例外。</li>
                <li class="li"><b>又一个数据巧合</b>：疲劳与感冒的抗性在 RF4 里<b>共用同一个抗性位</b>——99 只免疫，名单一字不差，毫无差异。这类「两列完全相同」的情况值得当作数据校验信号：要么设计上真绑在一起，要么其中一列是复制粘贴。</li>
            </ul>
            <h2 class="h2">2026-10-27　第八次：补上战斗抗性</h2>
            <ul class="ul">
                <li class="li"><b>新增「战斗与弱点」条目</b>（基础知识 · 全站 33 个条目）：RF5 全部 269 只魔物的八属性抗性，以及与驯服／掉率完全无关的另一半数据——暴击、击晕、眩晕抵抗、吹飞抵抗、硬直。</li>
                <li class="li"><b>不只列表格，先给三条结论</b>：① 269 只里有 88 只八项抗性没有任何负值，属性武器对它们既不加成也不减伤；② 八种属性的「怕它／抗它」净差<b>全是负数</b>，不存在通吃属性，最稳的是无属性（204 只对它毫无修正）、收益上限最高的是光；③ 免疫眩晕与免疫击飞的名单<b>完全一致</b>，82 只，占三成。</li>
                <li class="li"><b>抓到一组设计痕迹</b>：火幽灵（火 +2／水 −2）、冰幽灵（水 +2／火 −2）、风幽灵（风 +2／土 −2）——全表唯一的 ±2 倍数值，三只构成完美对偶，每只都抗自己、怕另一只。这是游戏在教「属性不能乱带」。</li>
                <li class="li"><b>解释了爱属性的误会</b>：247 只对它抗性为 0，只有史莱姆系（+0.5）、传送门系（+0.8～1）、树魔人（−0.15）有反应。所以毕业套最后放爱之结晶，值钱的是<b>吸血 +3%</b>，不是属性转换。</li>
                <li class="li">弱点速查表支持按「最怕什么」筛选（十个分类带计数）与名称／属性搜索；完整八项抗性另做折叠表，负数标红底、正数标绿底、0 灰，扫一眼就能看出这只怪是哪种壳。</li>
                <li class="li"><b>数据对齐过程</b>：属性表 272 行与暴击表 269 行需按行序合并。两表存在大量同名的等级变体（无法按名字 join），且有 2 个 <code>#N/A</code> 空行、「晚高峰／夜高峰」一字的译名差。剔除空行并统一译名后，269 对 269 零错位。</li>
                <li class="li">RF4 的对应表把村民与魔物混在同一张表里（281 行属性／373 行异常／277 行暴击），暂未收录，待能区分出村民后再补。</li>
            </ul>
            <h2 class="h2">2026-10-27　第七次：装备强化倍率与毕业套</h2>
            <ul class="ul">
                <li class="li"><b>新增「装备打造·毕业套」条目</b>（牧场生活 · 全站 32 个条目）：RF4S 与 RF5 两代终盘装备的完整制作链，含武器目标面板、五件套抗性合计表、逐步素材顺序表。</li>
                <li class="li"><b>把「倍率传递」写成本页核心</b>：倍铁（×2）、10 倍铁（×8）、不明物体／物体X（×−1）这三样本身不加属性，只修改<b>紧挨着它前面那一格</b>的强化效果。所以强化顺序本身就是数值设计——顺序错一格，成品就废了。这条规则之前站内、「锻造与药学」页里都只是一句「强化比换新重要」，完全没有落到可操作层面。</li>
                <li class="li">补上<b>三步法</b>：先造低阶载体塞满 3 个追加素材 → 换成高面板武器 → 最后转外观与种类（跨种类必须放梅西莱特矿石，目标武器栏位不超过 4 个）。它解释了「为什么不能直接造最强的那把」。</li>
                <li class="li">附<b>素材小百科</b> 16 条：发光的鳞片力量 +300、闪耀石攻击范围 +1、辟邪符把异常状态反转、奇妙的首饰让敌我防御归零、爱之结晶吸血 +3% 等。这些附加效果是整张表能成立的前提。</li>
                <li class="li">「锻造与药学」页改为双跳转：配方大全（查得到什么）与装备打造（怎么做出一件毕业的），并按两者分工补了一段说明。</li>
                <li class="li">数据来源：玩家社区「里格巴斯武器商」的 RF4S／RF5 实测整表。已在页脚注明非官方数值，成品会受锻造等级、素材品质与版本影响。</li>
            </ul>
            <h2 class="h2">2026-10-27　第六次：钓鱼与鱼影做成独立一页</h2>
            <ul class="ul">
                <li class="li"><b>新增「鱼类图鉴」条目</b>（物品资料 · 共 32 个条目）：RF4 收录 32 种鱼 + 6 种钓物，每条带长度区间、金杯线、季节与钓点；RF5 收录 42 种水产，带 LV1 买价／卖价与主要钓点。</li>
                <li class="li"><b>把「鱼影」写成主线</b>：色泽、大小、抖动三个维度分别怎么读，以及无目标／瞄竿／触标／惊竿四种状态各该怎么处理。提竿时机错了不是「失败一次」，而是让这条鱼从池子里直接消失——这一点在原攻略里也没被强调，但它是所有钓鱼技巧的前提。</li>
                <li class="li">附<b>金杯鱼影目标表</b>（35 条：同一种「100cm 特大淡鱼影」在不同季节的泉里是不同鱼）与<b>鱼竿打造配方表</b>（常规稀有／专杀／三拼／可乐）。锻造或强化时加入垂钓产物会提高对应鱼影出现率，这条机制原来站内完全没有。</li>
                <li class="li">RF4 支持按鱼名／季节／钓点搜索，并有五个分类快捷切换。金杯线算法写进正文：最大 −（最大 − 最小）× 0.06，因此必须超过区间 94% 才算金杯。</li>
            </ul>
            <h2 class="h2">2026-10-27　第五次：补上 RF5 全配方</h2>
            <ul class="ul">
                <li class="li"><b>新增「配方大全」条目</b>（物品资料 · 共 31 个条目）：RF5 全 661 条配方，按 22 个原始分类归并成料理／武器／防具／饰品／农具／药学六大类，支持分类下拉筛选，也能按配方名或素材实时搜索。</li>
                <li class="li">每条列出<b>制作技能等级</b>与全部素材（最多六项）。这里的等级是「做出这条配方所需的技能等级」，不是成品等级——成品等级由素材等级与技能等级共同决定，这一点表里没有、也不该混进来。</li>
                <li class="li"><b>分工明确</b>：「料理」「锻造与药学」两页保持概念与节奏，数据全交给本页，两边用跳转卡片互相连通，避免同一份表格在多个页面重复。</li>
                <li class="li">数据来源：《符文工房5 全配方》表。其余作品配方结构相同但条目与数值不同，本页暂以 RF5 为准。</li>
            </ul>
            <h2 class="h2">2026-10-27　第四次：图鉴那一列其实是掉落道具</h2>
            <ul class="ul">
                <li class="li"><b>「投喂物」改回「掉落道具」</b>：拿 RF5 掉率表逐只比对后确认，解包表那一栏（原本叫「喜好道具」）与掉率表的掉落项完全一致——兽人就是兽人的破布／廉价手镯／胶，一只不差。所以它<b>从来不是「它爱吃什么」</b>，就是打死它会掉什么。上一版按原表字面改称「投喂物」，方向错了，这次改回来。</li>
                <li class="li"><b>魔物没有独立的喜好表</b>：系列里只有居民有礼物好感，魔物没有「最爱之物」这类隐藏设定。已经删掉「投它认的东西」这种暗示存在喜好差异的写法。</li>
                <li class="li"><b>驯服机制保留，但与掉落物解耦</b>：投喂本身还在，任何物品都能推进，只是掉落物现捡现用最省事。相关措辞从「投喂物的选择」改为「投喂什么」。</li>
                <li class="li">参考佐证：RF1 的洞窟怪物表列的也正是「掉落物」一栏（另有雇佣能力），可见这一列在各作的资料体系里一直就是掉落。</li>
                <li class="li"><b>新增 RF1（新牧场物语）图鉴</b>：${typeof MON_RF1 !== 'undefined' ? MON_RF1.length : 0} 种洞窟怪物，按八座洞窟标注出处，并保留初代特有的<b>雇佣能力</b>栏（协助收获／协助浇水／产羊毛／产蜜／产蛋／可骑乘）——初代表里根本没有「喜好」这一栏，这是最直接的旁证。</li>
            </ul>
            <h2 class="h2">2026-10-27　第三次：魔物条目合并为一页</h2>
            <ul class="ul">
                <li class="li"><b>「喜好道具」改称「投喂物」</b>：这个词原本是数据表的列名，容易被读成给居民送礼那套「喜好物品」。魔物没有礼物好感，表里列的是<b>收服时往它身上投的东西</b>——投它认的进度快，投杂草也能推进。已改掉列名、搜索提示与说明，并补一句「游戏内没有查询界面，数据来自解包表」。<span class="mon-no">（此条判断有误，已在第四次改回「掉落道具」）</span></li>
                <li class="li"><b>「动物与家畜」＋「魔物与伙伴」合并为「魔物与伙伴」</b>：本系列没有「动物」这个类别，家畜只是魔物的职能，所以不再拆成两页。收服、照料、产出、派活四件事按顺序写在同一页里，「魔物图鉴」改为该页的附录并加了跳转卡片。</li>
                <li class="li"><b>删掉「购买魔物」这一错误说法</b>：系列里没有卖魔物的店，动物屋这种设施并不存在，所有牲畜只能野外投喂收服。已改写成与《牧场物语》的结构差异对照。</li>
                <li class="li">合并后条目总数由 30 调整为 29，旧链接 <code>#/page/animal</code> 与 <code>#/page/monster</code> 自动指向新页面，不会失效。</li>
                <li class="li">RF5 四种畜牧魔物（水牛哞哞／咕咕鸡／摩可摩可／摩奇摩奇）的三阶段产物表移入机制页，图鉴页不再重复。</li>
            </ul>
            <h2 class="h2">2026-10-27　第二次补充：接入本地攻略资料</h2>
            <ul class="ul">
                <li class="li"><b>新增「魔物图鉴」条目</b>（牧场生活 · 共 30 个条目）：RF5 收录 236 种（可驯 185 / 不可驯 51），带初始捕捉率与投喂物；RF4 收录 190 种，折叠展示。</li>
                <li class="li"><b>「家畜就是魔物」的直接证据</b>：图鉴开头列出 RF5 全部四种能产畜牧品的魔物——水牛哞哞（牛奶）、咕咕鸡（鸡蛋）、摩可摩可／摩奇摩奇（软软毛），各自的三阶段产物。</li>
                <li class="li">图鉴支持按名称／投喂物实时筛选，并有「全部 / 可驯服 / 不可驯服」三个快捷切换。</li>
                <li class="li"><b>数据来源升级</b>：改用 RF4／RF5 全怪物喜好表、RF5 魔物一览（数据解包汉化版），并与法米通官方攻略本交叉核对，取代此前的二手攻略站。</li>
            </ul>
            <h2 class="h2">2026-10-27　第一次内容补充</h2>
            <ul class="ul">
                <li class="li"><b>把「家畜就是魔物」写成主线</b>：原「动物与家畜」一条（现已并入「魔物与伙伴」）讲清本系列养的家畜其实都是驯服的魔物；原「魔物与伙伴」补上驯服判定（爱心／骷髅／无反应）、等级差与投喂物、小屋容量、农活消耗与疲劳、换小屋的做法。</li>
                <li class="li"><b>节日日期表落地</b>：RF4／RF4 SP 与 RF1 补齐全年日程，其余六作列出节日名称并注明日期以游戏内日历为准。</li>
                <li class="li"><b>角色补全</b>：RF2（7 花嫁 + 4 花婿 + 居民）、海洋（10 候补）、龙之天地（7+7 恋人与居民）补齐；海洋主角名统一为「亚赛尔」，龙之天地主角补全为「昴流」。</li>
            </ul>
            <h2 class="h2">2026-10-27　建站</h2>
            <p class="p">站点框架完成，收录系列十部作品的基础资料、二十九个条目页与各作角色名单。</p>
            <ul class="ul">
                <li class="li">结构参照「矿石镇的攻略百科」（wiki.mineraltown.net）：顶部标题栏 + 攻略／居民／提醒／设置四标签。</li>
                <li class="li">角色数据取自 Marvelous 官方作品页与世嘉《符文工厂3豪华版》官网，未核实项留空而不编造。</li>
                <li class="li">图标全部为本站自绘 SVG，不使用任何游戏素材。</li>
            </ul>
            <h2 class="h2">待补</h2>
            <ul class="ul">
                <li class="li">RF2／边境／海洋／RF5 的节日具体日期（目前只有节日名）</li>
                <li class="li">各作武器／料理完整数值表（本地已有配方表，待整理）</li>
                <li class="li">RF1／边境／海洋的魔物图鉴（目前已有 RF2／RF3／RF4／RF5／RFO／RFF，RF1 仅有洞窟怪物表，边境无数值）</li>
            </ul>
            <div class="note">本站在浏览器本地运行，数据全部内嵌，不联网、不上传任何信息。资料整理性质，仅供查阅。</div>
        `
    },
    {
        key: 'azuma_mon', group: 'life', title: '魔物与喜好', icon: 'monster',
        gms: ['azuma'],
        body: () => azumaMonHtml(),
    },
    {
        key: 'azuma_boss', group: 'life', title: 'BOSS 战', icon: 'boss',
        gms: ['azuma'],
        body: () => azumaBossHtml(),
    },
];

/* 龙之天地（azuma）专属：魔物喜好表（不混入七作模板，gms 仅 azuma） */
function azumaMonHtml() {
    const M = (typeof AZUMA_MON !== 'undefined') ? AZUMA_MON : [];
    if (!M.length) return '';
    const cell = s => (s && s.trim()) ? s : '<span class="mon-no">—</span>';
    const ride = r => r === '能' ? '可骑乘' : '<span class="mon-no">' + (r === '×' ? '不可' : '—') + '</span>';
    const rows = M.map(m => `
        <tr>
            <td class="td left mon-n">${m[0]}</td>
            <td class="td">${ride(m[1])}</td>
            <td class="td">${cell(m[2])}</td>
            <td class="td">${cell(m[3])}</td>
            <td class="td">${cell(m[4])}</td>
            <td class="td">${cell(m[5])}</td>
        </tr>`).join('');
    return `
        <div class="note">数据来自中文攻略站 gametoeasy.com《符文工房:龙之天地 魔物喜好表》（2025-06-20）。「骑乘」列：<b>可骑乘</b>表示可收服为坐骑／宠物，<b>不可</b>表示不能，BOSS／精英为「—」。出现区域与物品为原文中文列举，未作改写。本作系统是动作 RPG + 村庄建设，没有传统数值抗性表，故仅收录喜好与区域。</div>
        <div class="table mon-table"><table><thead><tr><th>名称</th><th>骑乘</th><th>出现区域</th><th>最爱物品</th><th>喜欢物品</th><th>讨厌物品</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* 龙之天地（azuma）专属：BOSS 战（不混入七作 boss.js 模板，gms 仅 azuma） */
function azumaBossHtml() {
    const CAP = (typeof AZUMA_BOSS_CAP !== 'undefined') ? AZUMA_BOSS_CAP : [];
    const MAIN = (typeof AZUMA_BOSS_MAIN !== 'undefined') ? AZUMA_BOSS_MAIN : [];
    const cell = s => (s && String(s).trim() && String(s).trim() !== '×') ? s : '<span class="mon-no">—</span>';
    const ride = r => r === '可' ? '可骑乘' : '<span class="mon-no">不可</span>';
    const capRows = CAP.map(b => `
        <tr>
            <td class="td left mon-n">${b[0]}</td>
            <td class="td">${cell(b[1])}</td>
            <td class="td">${cell(b[2])}</td>
            <td class="td">${ride(b[3])}</td>
            <td class="td">${cell(b[4])}</td>
            <td class="td">${cell(b[5])}</td>
            <td class="td">${cell(b[6])}</td>
        </tr>`).join('');
    const mainRows = MAIN.map(b => `
        <tr>
            <td class="td left mon-n">${b[0]}</td>
            <td class="td">${cell(b[1])}</td>
            <td class="td">${cell(b[2])}</td>
            <td class="td">${cell(b[3])}</td>
            <td class="td">${cell(b[4])}</td>
            <td class="td">${b[5]}</td>
        </tr>`).join('');
    return `
        <div class="note">龙之天地（azuma）无 RF4/RF5 式数值抗性表，本页仅收录 <b>武器弱点 + 属性弱点（地／火／风／水／光／暗）</b> 与可捕 Boss 的体型、喜好。属性克制为「同元素互克」：火↔水、风↔地、光↔暗（以相同元素攻击时伤害降低、显示为灰色数字）。</div>
        <h3>可捕获 BOSS（魔物 Boss）</h3>
        <div class="note">来源：biligame 中文 wiki《RRFmainstory》与 gametoeasy《BOSS 抓捕攻略》交叉核对（纯中文，与本站 data.js 译名一致）。「骑乘」可收服为坐骑／宠物者标「可骑乘」，其余为不可捕 Boss。「大小」为源标注体型档（数字 2/4）。</div>
        <div class="table mon-table"><table><thead><tr><th>名称</th><th>武器弱点</th><th>属性弱点</th><th>骑乘</th><th>大小</th><th>最喜欢</th><th>喜欢</th></tr></thead><tbody>${capRows}</tbody></table></div>
        <h3>主线剧情 BOSS</h3>
        <div class="note">来源：英文攻略 game8 / neoseeker（biligame 可捕表未含或仅标不可捕者）。按剧情顺序列出；「乌拉／卡慕罗崎（猎犬）／美星 羽爆」三名为本站音译定名（中文攻略站无权威译名，保留英文名对照）。「贝隆＝Veyron」「克拉丽丝＝Clarice」已在可捕表，此处补 Lv 与定位。</div>
        <div class="table mon-table"><table><thead><tr><th>名称</th><th>英文名</th><th>Lv</th><th>武器弱点</th><th>属性弱点</th><th>定位／备注</th></tr></thead><tbody>${mainRows}</tbody></table></div>`;
}

/* 物品道具：分类页在前，本作物品一览在后 */
(function () {
    const order = ['weapon', 'armor', 'tool', 'material', 'food', 'potion',
        'source', 'perfume',
        'rf1list', 'rf2list', 'rfflist', 'rf3list', 'recipe'];
    const idx = [];
    PAGES.forEach((p, i) => { if (p.group === 'item') idx.push(i); });
    const items = idx.map(i => PAGES[i]);
    items.sort((a, b) => {
        const ia = order.indexOf(a.key), ib = order.indexOf(b.key);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    idx.forEach((i, k) => { PAGES[i] = items[k]; });
})();

/* 建索引 */
const PAGE_MAP = {};
PAGES.forEach(p => { PAGE_MAP[p.key] = p; });

/* 旧条目别名：「动物与家畜」「魔物与伙伴」已合并为「魔物与伙伴」 */
['animal', 'monster'].forEach(k => { PAGE_MAP[k] = PAGE_MAP.beast; });
/* 旧条目别名：原来的「××一览」（wlist/alist…）已并入分类页，老链接照旧能用 */
['weapon', 'armor', 'tool', 'material', 'food', 'potion'].forEach((k, i) => {
    const old = ['wlist', 'alist', 'tlist', 'mlist', 'flist', 'plist'][i];
    PAGE_MAP['rf5' + k] = PAGE_MAP[k];
    PAGE_MAP[old] = PAGE_MAP[k];
    PAGE_MAP['rf5' + old] = PAGE_MAP[k];
});

/* 条目可见性：带 gms 的条目只在指定作品下出现 */
function pageVis(p, g) {
    return !p.gms || (g && p.gms.indexOf(g.id) >= 0);
}

