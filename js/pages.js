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
    /* 左对齐列：首列由 leftFirst 控制，其余列用 left:[下标] 指定（表头一起左对齐） */
    const isL = i => (i === 0 && o.leftFirst) || (o.left && o.left.indexOf(i) >= 0);
    const th = head.map((h, i) => `<th class="th${isL(i) ? ' left' : ''}"${st(i)}>${h}</th>`).join('');
    const tr = rows.map(r => '<tr>' + r.map((c, i) =>
        `<td class="td${isL(i) ? ' left' : ''}"${st(i)}>${c}</td>`).join('') + '</tr>').join('');
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
    const isL = i => (i === 0) || (o.left && o.left.indexOf(i) >= 0);
    const th = head.map((h, i) =>
        `<th class="th${isL(i) ? ' left' : ''}"${w[i] ? ` style="width:${w[i]}"` : ''}>${h}</th>`).join('');
    const tr = rows.map(r => `<tr data-s="${r[0]}">` +
        r[1].map((c, i) => `<td class="td${isL(i) ? ' left' : ''}">${c}</td>`).join('') + '</tr>').join('');
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
   龙之天地（azuma）鱼类图鉴
   数据两处，同一条事实只存一处：
     SPOT_AZUMA.fishes（post/1829）→ 鱼种／卖价／买价／钓点／商店／解锁
     FISH_AZUMA（post/1830）      → 图鉴任务 5 档配方奖励 + 全满奖励
   鱼种表与「钓点与季节」页共用 SPOT_AZUMA，本页不另存一份鱼名。
   ------------------------------------------------------------ */
function fishAzumaHtml() {
    const F = (typeof SPOT_AZUMA !== 'undefined' && SPOT_AZUMA.fishes) ? SPOT_AZUMA.fishes : [];
    if (!F.length) return '';
    const RW = (typeof FISH_AZUMA !== 'undefined') ? FISH_AZUMA : { rewards: [], full: null };
    const N = v => /^\d+$/.test(String(v)) ? +v : null;
    const money = v => N(v) == null ? '<span class="mon-no">—</span>' : N(v).toLocaleString() + 'G';
    const dash = '<span class="mon-no">—</span>';

    /* 卖价档位 */
    const bySell = {};
    F.forEach(f => { const v = N(f.sell); if (v != null) (bySell[v] = bySell[v] || []).push(f.n); });
    const sells = Object.keys(bySell).map(Number).sort((a, b) => b - a);
    const topSell = sells[0], topNames = bySell[topSell];
    const lowSell = sells[sells.length - 1];
    const eq2 = F.filter(f => N(f.buy) === N(f.sell) * 2).length;

    /* 钓点 → 鱼 */
    const spotMap = {};
    F.forEach(f => f.spots.forEach(s => (spotMap[s] = spotMap[s] || []).push(f.n)));
    const spotKeys = Object.keys(spotMap).sort((a, b) => spotMap[b].length - spotMap[a].length || a.localeCompare(b, 'zh'));
    const condSpots = spotKeys.filter(s => /雨|夜晚/.test(s));
    const single = F.filter(f => f.spots.length === 1);

    /* 商店 */
    const shopMap = {};
    F.forEach(f => f.shops.forEach(s => (shopMap[s] = shopMap[s] || []).push(f.n)));
    const shopKeys = Object.keys(shopMap).sort((a, b) => shopMap[b].length - shopMap[a].length);
    const buyable = F.filter(f => f.shops.length);
    const unlock = F.filter(f => f.unlock);

    const rw = RW.rewards || [];
    const maxAt = rw.length ? N(rw[rw.length - 1].at) : null;
    const rwItems = rw.reduce((n, r) => n + r.items.length, 0);
    const gap = (maxAt != null) ? maxAt - F.length : null;

    const fishRows = F.map(f => [f.n + ' ' + f.spots.join(' ') + ' ' + f.shops.join(' '), [
        f.n, money(f.sell), money(f.buy),
        f.spots.length ? f.spots.join('、') : dash,
        f.shops.length ? f.shops.join('、') : dash,
        f.unlock || dash,
    ]]);

    return `
        <p class="p">本页是<b>《符文工房：龙之天地》</b>的鱼类专项数据，不收前作的鱼表——这一作的鱼、价格、钓点、商店通路都是另起一套，套 RF4／RF5 的名单只会误导。共 <b>${F.length} 种鱼与钓物</b>，全部能在<b>${spotKeys.length} 处钓点写法</b>里查到出没位置，其中 ${buyable.length} 种另有商店通路。要按「某片水域出哪几种鱼」翻，去 <a href="#/page/fishspot">钓点与季节</a> 页；这一页按<b>鱼</b>排，外加图鉴任务的奖励表。</p>
        ${stat([
        ['鱼种', F.length + ' 种'],
        ['钓点写法', spotKeys.length + ' 处'],
        ['能买到的', buyable.length + ' 种'],
        ['图鉴档位', rw.length + ' 档'],
    ])}
        <div class="key">价格上有一处极整齐的规律：<b>${F.length} 种鱼的买价全部正好是卖价的 2 倍（${eq2}/${F.length} 行）</b>。所以「买鱼再出货」是稳亏一半的生意——商店在这作里是补图鉴/凑料理的通道，不是赚钱通道。最贵的 <b>${topNames.join('、')}</b> 卖 ${money(topSell)}、买 ${money(topSell * 2)}，最便宜的只卖 ${money(lowSell)}。</div>

        <h2 class="h2">全鱼种：${F.length} 种，按名字排</h2>
        <p class="p">列序照源表：<b>卖价</b>是出货所得、<b>买价</b>是店里买入要付的钱；「钓点」带括号的是条件写法（雨天／夜晚），照录不展开成两行；「可买店」为「—」的只能自己钓。源表没有出现率与尺寸，本页也不编。</p>
        ${ftableOwn(['名称', '卖价', '买价', '钓点', '可买店', '解锁'],
        ['7.4rem', '5.2rem', '5.2rem', '13rem', '12rem', '9rem'],
        fishRows, { ph: '输入鱼名、钓点或店名筛选', cls: 'spot', left: [3, 4] })}

        <h2 class="h2">图鉴任务：钓到 ${rw.length ? rw.map(r => r.at).join('／') : '—'} 种时给配方</h2>
        <p class="p">龙之天地的鱼类图鉴不是纯收集——每攒到一个档位，任务会给一批<b>配方</b>，五个档位合计 ${rwItems} 项，全是钓竿与海鲜料理。注意奖励给的是<b>配方（会做）</b>，不是成品：拿到配方还得自己备料下厨。</p>
        ${tbl(['图鉴数量', '奖励配方（照源表顺序）'],
        rw.map(r => ['<b>' + r.at + '</b> 种', r.items.join('、')]),
        { leftFirst: true, colw: ['6.4rem', 'auto'], left: [1] })}
        ${RW.full ? `<div class="key">表后另有一句：<b>全满奖励是 ${RW.full.text}</b>。${RW.full.item ? '「' + RW.full.item + '」是钓具，不在上面五个档位的配方里，是独立的一件。' : ''}</div>` : ''}
        ${gap != null && gap !== 0 ? `<div class="note"><b>两篇源文的数字对不上，照录不改</b>：图鉴任务最高一档写的是 <b>${maxAt} 种</b>，而钓鱼攻略（post/1829）只列出 <b>${F.length} 种</b>鱼——差 ${Math.abs(gap)} 种。两端都是源站原文，本站既不给那 ${Math.abs(gap)} 种编名字，也不把 ${maxAt} 改成 ${F.length}；想确认缺的是哪几种，得回游戏里对图鉴。另有 ${unlock.length ? unlock.length + ' 种（' + unlock.map(f => f.n).join('、') + '）的解锁条件写着「' + unlock[0].unlock + '」' : '部分鱼有解锁条件'}——那是商店上架条件，不是钓取条件。</div>` : ''}

        <h2 class="h2">卖价 ${sells.length} 档：${topNames.length} 种并列 ${money(topSell)}，下面是 ${money(sells[1])} 的断层</h2>
        <p class="p">把卖价按档排开，最上面那一档是<b>${topNames.length} 种并列第一</b>，第二档只有 ${money(sells[1])}（${bySell[sells[1]].join('、')}）——差 ${(topSell / sells[1]).toFixed(1)} 倍，是个很硬的断层。这 ${topNames.length} 种全部出在<b>垂钓岛</b>与<b>妖怪岛</b>（含夜晚），没有例外：${topNames.map(n => n + '（' + F.filter(f => f.n === n)[0].spots.join('、') + '）').join('；')}。</p>
        ${tbl(['卖价', '种数', '鱼名'], sells.map(v => [money(v), '<b>' + bySell[v].length + '</b>', bySell[v].join('、')]), { leftFirst: true, colw: ['6rem', '4.2rem', 'auto'], left: [2] })}

        <h2 class="h2">钓点：竹笋岛 ${spotMap['竹笋岛'] ? spotMap['竹笋岛'].length : 0} 种最多，${single.length} 种只在一个地方出</h2>
        <p class="p">${spotKeys.length} 处写法里，${condSpots.length} 处带条件（${condSpots.map(s => '「' + s + '」' + spotMap[s].length + ' 种').join('、')}）——同一片地方，下雨或入夜才会换一批鱼，白天去是白跑。反过来看，<b>${single.length} 种鱼只在一个钓点出</b>：${single.map(f => f.n + '→' + f.spots[0]).join('、')}。想凑图鉴，这 ${single.length} 种得专门跑一趟。</p>
        ${tbl(['钓点', '种数', '能钓到的鱼'], spotKeys.map(s => [s, '<b>' + spotMap[s].length + '</b>', spotMap[s].join('、')]), { leftFirst: true, colw: ['11rem', '4.2rem', 'auto'], left: [2] })}
        <div class="note">「冬之原野」「冬之原野：海边」「冬之原野：池塘·河」在源表里是三处不同写法，本页照录不合并；同理「夏之里（雨）」与「夏之里（雨天）」是源表两种写法，各自成行。<b>${F.length - buyable.length} 种鱼没有商店通路</b>（${F.filter(f => !f.shops.length).map(f => f.n).join('、')}），只能钓。</div>

        <h2 class="h2">商店：${buyable.length} 种能买，${shopKeys.length} 处柜台</h2>
        <p class="p">可买的 ${buyable.length} 种集中在一处：<b>${shopKeys[0]}</b> 一家就占 ${shopMap[shopKeys[0]].length} 种，其余分给 ${shopKeys.slice(1).map(s => s + '（' + shopMap[s].length + ' 种）').join('、')}。按买价 2 倍算，凑齐这 ${buyable.length} 种要花 <b>${buyable.reduce((n, f) => n + (N(f.buy) || 0), 0).toLocaleString()}G</b>——而这些鱼全部卖掉只值 ${Math.round(buyable.reduce((n, f) => n + (N(f.sell) || 0), 0)).toLocaleString()}G。</p>
        ${tbl(['店', '种数', '在售鱼'], shopKeys.map(s => [s, '<b>' + shopMap[s].length + '</b>', shopMap[s].join('、')]), { leftFirst: true, colw: ['12rem', '4.2rem', 'auto'], left: [2] })}
        <div class="note">数据源：gametoeasy.com《符文工房:龙之天地》钓鱼攻略（post/1829，鱼种／价格／钓点／商店）与《鱼类图鉴 任务奖励》（post/1830，五档配方与全满奖励），分别由 <code>_build_fishspot_azuma.py</code>、<code>_build_fish_azuma.py</code> 生成 <code>js/fishspot_azuma.js</code>、<code>js/fish_azuma.js</code>。两篇是同站同系列，<b>没有第二个独立来源交叉核对</b>；<b>命名沿用 gametoeasy 中文译名</b>，与站内七作的 biligame 译名不完全一致。源表把河豚的商店一栏写成「夏之里 海之家水滨／妖怪岛」，本页照录为两处柜台，不改判。</div>
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

            <div class="note">取自《RF4 数据解包汉化版 Datamining Compendium》的 <code>Fish Rates NS</code> 表，原始 38 行有效记录 × 21 个环境列。原表数值是裸权重（每列总量 1213 ~ 5918 不等），本页<b>逐列归一化成百分比</b>后再展示，所以列与列之间的绝对量不可比。不足 0.1% 的零星概率显示为 <code>&lt;0.1%</code>（原值保留两位小数，没有抬高）。<br><b>译名修正</b>：原表中文列在 <code>Pike</code> 之后整体错位一行，多插了「秋刀鱼」「高身鲫」两个本表没有的名字，导致狗鱼、河豚、青甘鱼、鲫鱼四条的中文名全部串位。本页按英文原名改回。<br><b>关于 3DS 版</b>：同文件另有一张 <code>Fish Rates 3DS</code>，与 NS 表只有 4 种鱼（乌贼、剧毒虹鳟、高身鲫、萤乌贼）共 27 个格子的权重不同，其中三种恰好缩到 NS 的十分之一，乌贼反而在伊德拉 B2 从 500 涨到 1020——方向不一致，更像录入时的量纲差异而非版本平衡。本页以 NS 表为准。<br><b>与「钓鱼」页的鱼种表译名不同</b>：本页中文名取自解包表的中文列（已按英文原名修正错位），「钓鱼」页那张鱼种表来自另一份手工钓手册，两份资料对同一种鱼有 <b>25 处写法不同</b>——例如本页作「砂比目鱼／银鲫鱼／心动鲷鱼」，手册作「沙比目鱼／银鲋鱼／心跳鲷鱼」。两页各自照录自己那本来源，<b>本站没有强行统一</b>；按名字找鱼时两个写法都试一次。</div>

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
       数据 RFO_FISH_SPOT：[岛, 地点, 季节, 时段, [[鱼名, 稀有], ...]]
       源：攻略本《符文工厂海洋（最强攻略）》xls「鱼群」表（玩家实测，无概率）
       ------------------------------------------------------------ */
    /* ------------------------------------------------------------
       RFO 钓点与鱼（fishspot 页的 RFO 段）
       数据 RFO_FISH_SPOT：[岛, 地点, 季节, 时段, [[鱼名, 是否稀有], ...]]
       源：《符文工厂海洋（最强攻略）.xls》「鱼群」工作表（玩家实测，作者署「威亚尔」）
       原表没有概率，本段也不写概率；只有芬尼斯岛按春夏秋冬分，其余岛原表未分季。
       ------------------------------------------------------------ */
    function fishspotRfoHtml() {
        const R = (typeof RFO_FISH_SPOT !== 'undefined') ? RFO_FISH_SPOT : [];
        if (!R.length) return '';

        const islandOrder = [];
        const locSet = new Set();
        const fishMap = {};          /* 鱼名 → {rare, where:Set} */
        R.forEach(r => {
            if (islandOrder.indexOf(r[0]) < 0) islandOrder.push(r[0]);
            locSet.add(r[0] + '|' + r[1] + '|' + r[2]);
            (r[4] || []).forEach(f => {
                const o = fishMap[f[0]] = fishMap[f[0]] || { rare: false, where: new Set() };
                if (f[1]) o.rare = true;
                o.where.add(r[0] + (r[1] ? '·' + r[1] : ''));
            });
        });
        const fishNames = Object.keys(fishMap).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
        const rareN = fishNames.filter(n => fishMap[n].rare).length;

        /* 反查：鱼 → 出没地点 */
        const fishRows = fishNames.map(n => {
            const o = fishMap[n];
            const ls = Array.from(o.where);
            return [
                n + (o.rare ? ' <span class="txc">稀有</span>' : ''),
                ls.length + ' 处',
                ls.slice(0, 3).join('、') + (ls.length > 3 ? ' 等' : ''),
            ];
        });

        /* 全表：按 岛 → 地点 → 季节 → 时段 的原始顺序 */
        const seenR = new Set();
        const rows = R.filter(r => {
            const k = [r[0], r[1], r[2], r[3]].join('|');
            if (seenR.has(k)) return false;
            seenR.add(k);
            return true;
        }).map(r => [
            r[0] + (r[1] ? ' ' + r[1] : '') + (r[2] ? ' ' + r[2] : '') + ' ' + r[3],
            [r[0], r[1] || '—', r[2] || '—', r[3],
                (r[4] || []).map(f => f[0] + (f[1] ? '<span class="mon-no">*</span>' : '')).join('、')]
        ]);

        const seasonOnly = R.filter(r => r[2]).length ? new Set(R.filter(r => r[2]).map(r => r[0])) : new Set();

        return `
        <h2 class="h2">海洋的钓鱼：岛 × 地点 × 时段，原表没有概率</h2>
        <p class="p">海洋的地图是一整片芬迪海域，能钓的地方分散在<b>岛与海面坐标</b>上，所以这一页的查法和 RF4／RF5 都不一样：先认岛（或坐标），再看岛上的哪一处水（外滩、内流、瀑布、石潭、泉水……），最后看<b>白天还是夜里</b>。同一处水昼夜出的鱼常常完全不同——白沙海滩春天白天是比目鱼、针鱼、沙丁鱼、多宝鱼，入夜就换成针鱼、章鱼加一条心跳鲷鱼。</p>
        ${stat([['岛与海面', islandOrder.length + ' 处'], ['钓位（岛×地点×季）', locSet.size + ' 处'], ['鱼种', fishNames.length + ' 种'], ['记录', R.length + ' 条']])}
        <div class="key">本页数据<b>不含概率</b>：原表是玩家一趟趟钓出来的「这里有什么鱼」，不是解包出来的权重表。所以别指望它告诉你「金枪鱼几成」——它只保证<b>这一格里有这几条</b>。想要概率，得等有解包数据的那天。</div>

        <h2 class="h2">反查：${fishNames.length} 种鱼，各在哪出</h2>
        <p class="p">带 <span class="txc">稀有</span> 的是原表作者自己标星的那几样。它们不是「另一个池子」，而是同一格里的小概率成员——所以稀有鱼那一格通常只有两三样，普通鱼则满满四条。</p>
        ${tbl(['鱼种', '出没处', '举个例子'], fishRows, { colw: ['8rem', '5rem', ''], leftFirst: true, left: [2] })}

        <h2 class="h2">全表：${R.length} 条，按岛排</h2>
        <p class="p">顺序照原表：先近海与海岛，再芬尼斯岛本岛的四季，最后是几处特殊钓位。芬尼斯岛的七处水按季重复四遍（春／夏／秋／冬），其余各岛原表<b>没分季节</b>，季节栏写「—」——不是漏了，是那几座岛的鱼本来就与季节无关。</p>
        ${ftableOwn(['岛／地点／季／时', '岛', '地点', '季', '时段', '鱼种'],
            ['11rem', '8rem', '8rem', '2.6rem', '3rem', 'auto'],
            rows, { ph: '输入岛名、地点或鱼名筛选' })}

        <div class="note"><b>时段只有两档</b>：原表写「6:00am~4:59pm」与「5:00pm~4:59am」，也就是白天与夜里各 11 小时，中间那一小时作者认为你该睡了，没有数据。有几处特殊钓位（无名岛那一组坐标）标「全天」，昼夜不分。</div>
        <div class="note"><b>稀有鱼的记号是原表加的</b>，作者原话是「个人看法而已，欧皇请无视」，所以这不是官方稀有度。带 * 的鱼种在表里一格只出现一两样，与它同格的普通鱼仍然占满其余位置。</div>
        <div class="note">数据来自《符文工厂海洋（最强攻略）》的「鱼群」工作表，是一篇<b>玩家实测记录</b>（作者署「威亚尔」），不是解包表。作者自己写明<b>没有收全</b>：「鱼群不一定每天都会出现，收集完所有鱼群不现实，所以只收集了部分」。本站原样收录 ${R.length} 条、${islandOrder.length} 处岛与海面、${locSet.size} 个钓位、${fishNames.length} 种鱼（含 ${rareN} 种稀有）。原表两处笔误照录不改：芬尼斯岛秋季瀑布一栏的「鲷鱼（Char）」（Char 是鲑鱼）、附录里 Lobster 一行误写作「灯章鱼」。</div>

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
   符文工房 2 作物段
   数据：CROP_RF2 ← biligame「RF2farmdata」（13 列 60 行）
   注意：源页表头写的是「符文工厂1农作物数据」，但页名、内容与价格档都是 RF2 的；
        这处笔误照录并写在页面上，不替它改。
   ------------------------------------------------------------ */
function crop2Html() {
    const R = (typeof CROP_RF2 !== 'undefined') ? CROP_RF2 : [];
    if (!R.length) return '';
    const N = v => (v === null || v === undefined) ? '<span class="mon-no">—</span>' : v.toLocaleString('en-US');
    const tot = R.length;
    const cnt = s => R.filter(r => r.se === s).length;
    const kindN = k => R.filter(r => r.kind === k).length;
    const reg = R.filter(r => r.rep && r.rep !== '-');
    const noDay = R.filter(r => !r.d);
    const allSeason = R.filter(r => r.se === '全');
    const noSeason = R.filter(r => r.se === '-');
    const days = R.filter(r => r.d).map(r => r.d);
    const minD = Math.min.apply(null, days), maxD = Math.max.apply(null, days);
    const fast = R.filter(r => r.d === minD).map(r => r.n);
    const slow = R.filter(r => r.d === maxD).map(r => r.n);
    /* 三档单价：源表直接给 Lv1／Lv5／Lv10 */
    const withP = R.filter(r => r.p1);
    const std = withP.filter(r => r.p5 === Math.round(r.p1 * 1.1) && r.p10 === Math.round(r.p1 * 1.2));
    const odd = withP.filter(r => std.indexOf(r) < 0 && r.p5 && r.p10);
    const x2 = R.filter(r => r.p1 && r.bp && r.bp === r.p1 * 2);
    const notX2 = R.filter(r => r.p1 && r.bp && r.bp !== r.p1 * 2);
    const nobuy = R.filter(r => /买不到/.test(r.sbRaw || ''));

    const grow = R.slice().sort((a, b) => (a.d || 999) - (b.d || 999) || a.n.localeCompare(b.n, 'zh'))
        .map(r => [r.n, [
            r.n, r.se === '-' ? '<span class="mon-no">—</span>' : r.se,
            r.d ? String(r.d) : '<span class="mon-no">—</span>',
            r.rep && r.rep !== '-' ? '每 ' + r.rep + ' 天' : '<span class="mon-no">—</span>',
            r.kind,
            r.eff === '-' ? '<span class="mon-no">—</span>' : r.eff.replace(/，$/, ''),
        ]]);

    const price = R.map(r => [r.n, [
        r.n, N(r.sb), N(r.ss), N(r.p1), N(r.p5), N(r.p10), N(r.bp),
    ]]);

    return `
        <h2 class="h2">${tot} 种作物，其中 ${tot - noDay.length} 种能种、${noDay.length} 种没有生长天数</h2>
        <p class="p">RF2 的农作表比分作更细：同一种作物给出<b>首收天数、连续收获间隔、三个等级档的出货价</b>，还带食用效果与种类标签。表里 ${tot} 种作物按种类分成蔬菜 ${kindN('蔬菜')} 种、花卉 ${kindN('花卉')} 种、草 ${kindN('草')} 种、水果 ${kindN('水果')} 种。</p>
        <div class="note">源页表头写的是「<b>符文工厂1</b>农作物数据」，但页名（<code>RF2farmdata</code>）、价格档与作物构成都是 RF2 的。这处笔误照录在此，不替源页改字。</div>
        ${stat([['收录', tot + ' 种'], ['能种植', (tot - noDay.length) + ' 种'], ['连续收获', reg.length + ' 种'], ['生长跨度', minD + '～' + maxD + ' 天']])}
        <div class="key">最快的是 <b>${fast.join('、')}（${minD} 天）</b>，最慢的是 <b>${slow.join('、')}（${maxD} 天）</b>——相差 30 倍。慢的那批不是拿来卖的，是拿来交任务和做药剂的。</div>
        <h3 class="h3">成长、季节与食用效果</h3>
        <p class="p">按生长天数从小到大排。「连续收获」写「每 N 天」的，收完不拔、隔 N 天再结一次；标 — 的是一次性作物，收完地就空了。食用效果照源表原样（源表多数条目末尾带一个「，」，这里只去掉那个尾巴）。</p>
        ${ftableOwn(['作物', '季节', '生长天', '连续收获', '种类', '食用效果'],
            ['6.4rem', '4.4rem', '4.6rem', '5.6rem', '4.4rem', '13rem'],
            grow, { ph: '输入作物名、季节或种类', cls: 'crop2' })}

        <h2 class="h2">连续收获 ${reg.length} 种：种一次收好几轮</h2>
        <p class="p">这 ${reg.length} 种收完别拔。间隔最短的是<b>草莓与青椒</b>（每 2 天一次），最长的是<b>黄瓜</b>（每 6 天）。</p>
        ${tbl(['作物', '季节', '首收', '再收间隔', '种类'], reg.map(r => [
            r.n, r.se, r.d + ' 天', '每 ' + r.rep + ' 天', r.kind,
        ]), { leftFirst: true, colw: ['6.4rem', '4rem', '4.4rem', '6rem', '4.4rem'] })}

        <h2 class="h2">季节：${allSeason.length} 种草四季都能种，${noSeason.length} 种没有季节</h2>
        <p class="p">表里的季节栏除了春／夏／秋／冬，还有两种写法：<b>「全」</b>与 <b>「—」</b>。<b>全季的 ${allSeason.length} 种全是草</b>（${allSeason.map(r => r.n).join('、')}），一年四季都能下种——这也解释了为什么药草类从来不用囤。<b>没有季节的 ${noSeason.length} 种</b>是 ${noSeason.map(r => r.n).join('、')}：牧草是饲料，葡萄／苹果／橘子是<b>树上结的</b>，枯草是田里长出来的麻烦，都不走「播种→成熟」这条线，所以源表不给生长天数，本页也不替它们编一个。</p>
        ${tbl(['季节', '种数', '作物'], ['春', '夏', '秋', '冬', '全', '—'].map(s => [
            s === '-' ? '—（无季节）' : s,
            String(cnt(s)),
            R.filter(r => r.se === s).map(r => r.n).join('、') || '—',
        ]), { leftFirst: true, colw: ['6rem', '3.6rem', '26rem'], cls: 'txt' })}

        <h2 class="h2">价格：等级只加一成与两成，但 ${odd.length} 种不走这条线</h2>
        <p class="p">源表把同一件作物在 <b>Lv1／Lv5／Lv10</b> 三档的出货价都列了出来。${withP.length} 种里有 <b>${std.length} 种</b>完全符合「Lv5 = Lv1 × 1.1、Lv10 = Lv1 × 1.2」——<b>也就是说作物等级只值 +10% 和 +20%</b>，靠施肥把等级堆上去的收益远不如把地扩开。剩下的 ${odd.length} 种另一套比例：${odd.map(r => r.n + '（' + r.p5 + '／' + r.p10 + '）').join('、')}。</p>
        <div class="note">「买价」是作物本身在店里的售价（不是种子），与 Lv1 出货价的关系<b>并不统一</b>：${x2.length} 种正好是 2 倍，另外 ${notX2.length} 种不是——${notX2.slice(0, 6).map(r => r.n + '（' + Math.round(r.bp / r.p1 * 10) / 10 + ' 倍）').join('、')}…… 两列照录并排，不做换算，也不拿它推利润率。</div>
        <div class="note">${nobuy.length} 种的种子买价栏写着「买不到」：${nobuy.map(r => r.n + '（' + r.sbRaw + '）').join('、')}。数值仍照录在表里，但这一栏在原表就带着这个注，本页不替它解释成「在哪里能换到」。</div>
        ${ftableOwn(['作物', '种子买价', '种子卖价', 'Lv1 卖价', 'Lv5 卖价', 'Lv10 卖价', '作物买价'],
            ['6.4rem', '6rem', '6rem', '6rem', '6rem', '6.4rem', '6rem'],
            price, { ph: '输入作物名', cls: 'crop2' })}
    `;
}

/* ------------------------------------------------------------
   符文工房 3 农作段
   数据：SOIL_RF3（土地 6 档）、PEST_RF3（农药 4 种）、PLOVE_RF3（宠物好感 0–10 与四季作物）
   源页 RF3farm 没有作物总表，给的是「田怎么变好」与「宠物替你种什么」，
   故本段不列作物，只讲土质、农药与宠物种地。
   ------------------------------------------------------------ */
function crop3Html() {
    const S = (typeof SOIL_RF3 !== 'undefined') ? SOIL_RF3 : [];
    const P = (typeof PEST_RF3 !== 'undefined') ? PEST_RF3 : [];
    const L = (typeof PLOVE_RF3 !== 'undefined') ? PLOVE_RF3 : [];
    if (!S.length && !L.length) return '';

    /* 好感档位里作物完全相同的并成一组 */
    const sig = r => r.slice(1).join('|');
    const groups = [];
    L.forEach(r => {
        const g = groups.filter(x => x.sig === sig(r))[0];
        if (g) { g.lv.push(r[0]); } else { groups.push({ sig: sig(r), lv: [r[0]], crops: r.slice(1) }); }
    });

    return `
        <h2 class="h2">RF3 的田：六档土质，营养值与成长速度要一起看</h2>
        <p class="p">RF3 没有「作物一览」这种表，源页给的是<b>田本身</b>——同一块地会以六种状态之一存在，营养值决定能长多好，成长速度直接乘在生长天数上。最差的一档（营养 0～4）只有 <b>0.125 倍</b>速度，等于把 8 天的作物拖成 64 天。</p>
        ${tbl(['土地状态', '营养值', '成长速度'], S.map(r => [r[0], r[1], '<b>' + r[2] + '</b>']),
            { leftFirst: true, colw: ['13rem', '7rem', '9rem'], cls: 'txt' })}
        <div class="note">源表还并排给了日文原文与英文（<code>この土は作物が最高に育ちやすそうで</code>／<code>The soil is excellent</code>），本站只取中文那一列；两者是同一行数据的两种语言，不是两种状态。</div>
        <div class="key">六档从「完美」到「非常糟糕」，营养值区间是连续的 0～46，没有空档。所以施肥的目标很明确：<b>把这块地推过 30</b>，成长速度就从 2 倍以下跳到 2～3 倍。</div>

        <h2 class="h2">农药四种：营养值全是 16，差别只在健康值</h2>
        <p class="p">农药加的是<b>营养值</b>（16，四种全一样）与<b>健康值</b>（8／8／24／40）。所以「极速长」并不比「枯草」更能养地，它只是把健康值拉得更高。</p>
        ${tbl(['农药', '营养值', '健康值'], P.map(r => [r[0], r[1], '<b>' + r[2] + '</b>']),
            { leftFirst: true, colw: ['10rem', '5.6rem', '5.6rem'], cls: 'txt' })}
        <div class="note">源表里<b>「枯草」与「很会长」两行数值完全相同</b>（16／8），名字却是两样东西——照录两行，不合并、也不猜它们是不是同一件道具的两种叫法。</div>

        <h2 class="h2">宠物种地：好感越高，它替你种的作物越贵</h2>
        <p class="p">这 ${L.length} 档（好感 0～10）是<b>宠物自己下地时种什么</b>。作物不随机，按好感档位固定。${L.length} 档一共只换了 <b>${groups.length} 组</b>：${groups.map(g => '好感 ' + g.lv.join('／')).join('、')}。</p>
        ${tbl(['好感度', '春', '夏', '秋', '冬'], L.map(r => [r[0], r[1], r[2], r[3], r[4]]),
            { leftFirst: true, colw: ['5rem', '6rem', '6rem', '6rem', '6rem'], cls: 'crop2' })}
        <div class="key">低好感那三档原地不动（好感 0／1／2 都是樱芜菁·粉红猫·马铃薯·葱），说明<b>刷毛刷到 3 才开始有回报</b>；从好感 3 起<b>每升 1 档就换一批</b>，四条线一路往上换到当季最贵的那一件（春 少女蜜瓜、夏 南瓜、秋 番薯、冬 白菜）。</div>
        <div class="note">逐只的工作能力（浇水／劈柴／砸石／收获的等级、能否骑乘、捕捉率）不在本页，去<a class="link" href="#/page/produce">宠物产出</a>看那 90 只的工作表。</div>
    `;
}

/* ------------------------------------------------------------
   符文工房 边境（RFF）作物段
   表结构：[季节, 作物名, [种,芽,叶,花], 十级出货额, 繁荣参考, 备注]
   数据来自 RFF各作物各阶段所需时间.xls，另有 5 条原表说明存于 RFF_TIPS。
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   符文工厂 海洋（RFO）农作段
   这一作没有锄头、没有洒水壶、也买不到种子：种地靠「精灵杖 + 岛上的宠物」。
   数据 js/crop_rfo.js ← _build_crop_rfo.py 解析源页 RFOfarm 的三张表
   （种地列表 4 岛、精灵石树分布 39 处、魔物农作物列表 92 只）。
   ------------------------------------------------------------ */
function cropRfoHtml() {
    const S = (typeof RFO_SOIL !== 'undefined') ? RFO_SOIL : [];
    const T = (typeof RFO_TREE !== 'undefined') ? RFO_TREE : [];
    const M = (typeof RFO_MONCROP !== 'undefined') ? RFO_MONCROP : [];
    const cnt = f => M.filter(f).length;
    const isleCrop = new Set();
    S.slice(0, 3).forEach(r => r.crop.forEach(c => isleCrop.add(c)));
    const plantCrop = new Set();
    M.filter(r => r[1] === '作物').forEach(r => r[3].forEach(c => plantCrop.add(c[0])));
    const kinds = {};
    M.forEach(r => r[3].forEach(c => { kinds[c[0]] = (kinds[c[0]] || 0) + 1; }));
    const top = Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a] || a.localeCompare(b)).slice(0, 6);
    const brushMax = M.filter(r => r[4] === '12');
    const brushMin = M.filter(r => r[4] === '4');
    const giant = {};
    M.forEach(r => { giant[r[2]] = (giant[r[2]] || 0) + 1; });
    const n4 = M.filter(r => r[3].length === 4).length;
    const n3 = M.filter(r => r[3].length === 3).length;
    const n2 = M.filter(r => r[3].length === 2).length;
    const n1 = M.filter(r => r[3].length === 1).length;
    const none = M.filter(r => !r[3].length).length;
    const dash = v => (v === '' || v === '-' || v === undefined || v === null)
        ? '<span class="mon-no">—</span>' : v;
    const cropCell = r => r[3].length
        ? r[3].map(c => (c[2] ? '<b>' : '') + c[0] +
            '<span class="txc"> ' + (c[1] === '' ? '—' : c[1]) + '</span>' +
            (c[2] ? '</b>' : '')).join(' · ')
        : '<span class="mon-no">无（纯劳力）</span>';
    const dom = r => {
        const v = [r[4], r[5], r[6], r[7]].map(x => Number(x) || 0);
        const mx = Math.max.apply(null, v);
        return v.map((x, i) => (x === mx && mx > 0) ? '<b>' + dash(r[4 + i]) + '</b>' : dash(r[4 + i]));
    };
    const isleRows = S.map(r => [r.n, r.se, r.loc, r.sp, dash(r.germ), dash(r.treeg), dash(r.ore),
        (r.plant.length + r.tree.length + r.harv.length) + ' 只']);
    const cropRows = S.map(r => [r.n, r.crop.length ? r.crop.join('、') : '<span class="mon-no">—</span>']);
    const treeRows = T.map(r => {
        const d = dom(r);
        return [r[0] + r[1], [r[0], r[1], dash(r[2]), dash(r[3]), d[0], d[1], d[2], d[3], dash(r[8])]];
    });
    const monRows = M.map(r => [r[0], [r[0], r[1], dash(r[2]), cropCell(r), dash(r[4]),
        r[5] || '<span class="mon-no">—</span>']]);
    const winter = S[3] || null;
    const sum4 = r => [4, 5, 6, 7].reduce((a, k) => a + (Number(r[k]) || 0), 0);
    const badSum = T.filter(r => sum4(r) !== 100);

    return `
        <h2 class="h2">${S.length} 座农业岛：没有锄头、没有洒水壶，也买不到种子</h2>
        <p class="p">海洋的种地和别的作品不是一套操作。源页开头就把它和常规流程隔开了：<b>只能在 4 个主线解锁的岛上种地和采矿</b>；<b>没有洒水壶、没有锄头、无法购买种子</b>；锄头的位置由<b>精灵杖</b>顶替（幼小的／鲜嫩的／成长中的／发青的／成熟的精灵杖共五档）；农业岛上有<b>发芽点</b>。</p>
        <div class="key">最要紧的一条：<b>用精灵魔法播完种，岛上必须有对应的宠物，才会真的播种</b>。所以「能种什么」不是由你手里的种子决定，而是由<b>这座岛上养了哪几只魔物</b>决定——这也是本页把「岛」和「魔物」放在一起讲的原因。</div>
        <p class="p">另两条机制：杂货店买的<b>宠物曲奇</b>会直接送到饲料槽里；<b>树木成熟时有概率获得符文结晶</b>。</p>
        <div class="note">本页顶部那两段「翻土 → 播种 → 每天浇水」「施肥提升品级」是系列通用说明，<b>对本作不成立</b>——RFO 没有浇水这一环，也没有买种子这一步。</div>

        ${stat([
        ['农业岛', S.length + ' 座'],
        ['可种作物', isleCrop.size + ' 种'],
        ['精灵石树', T.length + ' 处'],
        ['魔物', M.length + ' 只'],
    ])}
        <h2 class="h2">三座岛种作物，第四座其实是矿场</h2>
        ${tbl(['岛', '季节', '坐标', '对应精灵', '农作物芽', '树木芽', '矿石', '可派宠物'], isleRows, {
        leftFirst: true, cls: 'rfoisle', colw: ['6rem', '3.4rem', '3.8rem', '7.4rem', '5rem', '4.6rem', '4rem', '4.4rem'],
    })}
        <p class="p"><b>农作物芽</b>三岛分别是 ${S.slice(0, 3).map(r => r.germ).join(' / ')}，秋实岛最高；<b>树木芽</b> ${S.slice(0, 3).map(r => r.treeg).join(' / ')}。<b>这几个数源页没给单位，也没解释含义</b>，这里只把栏名和数字照录。</p>
        ${winter ? `<p class="p">第四座<b>${winter.n}</b>是个例外：农作物芽与树木芽都是「-」，矿石那一栏却是 <b>${winter.ore}</b>，作物栏写的不是作物名而是「所有矿石、宝石、结晶」。它的五只宠物在魔物表里的「自然育成」栏也确实是<b>矿石</b>——这一座不是农田，是矿区。</p>` : ''}
        <div class="key">精灵的对应关系不是「季节色」：春芽岛配黄精灵、常夏岛配红精灵、<b>秋实岛配绿精灵</b>、冬冰岛配蓝精灵。而绿精灵就是<b>风</b>精灵（见下节，风之精灵殿出绿），所以「秋」在这作对应的是风属性，不是木。</div>

        <h2 class="h2">每座岛能种什么</h2>
        ${tbl(['岛', '作物'], cropRows, { leftFirst: true, cls: 'rfocrop', colw: ['6rem'] })}
        <div class="note">冬冰岛那一行原文就是「所有矿石、宝石、结晶」，<b>不是三件具体作物</b>，照录不替它列清单。<br>
        三座作物岛合计 <b>${isleCrop.size} 种</b>，而魔物表里 ${cnt(r => r[1] === '作物')} 只「作物」类魔物能种的也正好是 <b>${plantCrop.size} 种</b>——两个集合逐项比对<b>完全相同，双向都没有多出来的</b>。换句话说：这作能种的东西就这 ${isleCrop.size} 种，没有第 ${isleCrop.size + 1} 种，而每一种都得先抓到会对的那只魔物。</div>

        <h2 class="h2">精灵石树 ${T.length} 处：四个精灵殿各偏自己的颜色</h2>
        <p class="p">精灵石树的作用是刷精灵。每处石树给一个<b>精灵量</b>（一次出多少只）和四个颜色的<b>概率</b>；<b>再次采集</b>是隔多久能再采一次（天数）。把每个地点拆开看，规律很干脆：</p>
        <ul class="ul">
            <li class="li"><b>土之精灵殿</b>：黄 ${T.filter(r => /^土/.test(r[0])).map(r => r[4]).join('／')}%——几乎只出黄。</li>
            <li class="li"><b>炎之精灵殿</b>：红为主（最高 ${Math.max.apply(null, T.filter(r => /^炎/.test(r[0])).map(r => Number(r[5]) || 0))}%），层数越深越偏红。</li>
            <li class="li"><b>水之精灵殿</b>：蓝 ${T.filter(r => /^水/.test(r[0])).map(r => r[7]).join('／')}%。</li>
            <li class="li"><b>风之精灵殿</b>：<b>绿</b>为主（最高 ${Math.max.apply(null, T.filter(r => /^风/.test(r[0])).map(r => Number(r[6]) || 0))}%）。绿精灵即风精灵，和上一节秋实岛的配置对得上。</li>
            <li class="li"><b>野外岛</b>（艾利岛、热沙岛、密林岛、封冰岛、神殿岛、石像岛、空中庭院、触礁沉船）：四色都在 20～30% 之间，差别只有几个百分点，属于「随便刷」。<b>无名岛 D-6／E-8 与神殿 C-3</b> 三处最特殊：只给一种颜色 <b>10%</b>，其余三色全是「-」。</li>
        </ul>
        ${ftableOwn(['地点', '场所', '精灵量', '±%', '黄', '红', '绿', '蓝', '再次采集'],
        ['9rem', '6rem', '4.2rem', '3.4rem', '3.2rem', '3.2rem', '3.2rem', '3.2rem', '4.6rem'],
        treeRows, { ph: '输入地点或场所', cls: 'rfotree' })}
        <p class="p">精灵量最小 <b>${Math.min.apply(null, T.map(r => Number(r[2]) || 99))}</b>、最大 <b>${Math.max.apply(null, T.map(r => Number(r[2]) || 0))}</b>（风之精灵殿 5F／6F）；再次采集只有 <b>${[...new Set(T.map(r => r[8]).filter(Boolean))].sort().join(' / ')}</b> 天四档。四色相加，${T.length - badSum.length} 处正好 100%，${badSum.length} 处不到：${badSum.map(r => r[0] + r[1] + '（' + sum4(r) + '%）').join('、')}。<b>源页没解释缺的那部分，这里照录不补。</b></p>
        <div class="note">表里加粗的是该处概率最高的颜色，一眼能看出哪个殿偏什么色。风之精灵殿 5F 的「再次采集」源表是空格，本页记作「—」，<b>不推测成 0、也不继承上一行</b>。</div>

        <h2 class="h2">魔物 ${M.length} 只：只有 ${cnt(r => r[1] === '作物')} 只能种作物</h2>
        <p class="p">源表把每只魔物的「自然育成」分成六类，其中只有<b>作物</b>和<b>树木</b>会真的种出东西，<b>矿石</b>是挖矿，<b>收获</b>是替你收，<b>产出／生产</b>给的是牛奶鸡蛋这类副产品——后 ${none} 只的作物栏全是「-」，不是漏填。</p>
        ${stat([
        ['作物', cnt(r => r[1] === '作物') + ' 只'],
        ['树木', cnt(r => r[1] === '树木') + ' 只'],
        ['矿石', cnt(r => r[1] === '矿石') + ' 只'],
        ['收获', cnt(r => r[1] === '收获') + ' 只'],
        ['产出／生产', (cnt(r => r[1] === '产出') + cnt(r => r[1] === '生产')) + ' 只'],
    ])}
        <p class="p">「作物」类里出现最多的是<b>${top[0]}</b>（${kinds[top[0]]} 只），其后是 ${top.slice(1, 5).map(k => k + '（' + kinds[k] + ' 只）').join('、')}。<b>${top[0]}</b>同时也是「魔物图鉴」海洋段「喜好作物」栏里出现次数最多的那件，两张表在这一点上对得上。</p>
        <p class="p">作物件数：带满四件的 <b>${n4} 只</b>，三件 ${n3} 只、两件 ${n2} 只、一件 ${n1} 只。好感门槛从 0 到 7，其中<b>门槛为 0 的条目有 ${M.reduce((a, r) => a + r[3].filter(c => c[1] === '0').length, 0)} 件</b>——这些一上岛就能种，越往后门槛越高。</p>
        <p class="p"><b>巨大化率</b>：只有四只精灵给到 <b>30%</b>（黄／红／蓝／绿精灵），全场最高；其余是 5%（${giant['5'] || 0} 只）、8%（${giant['8'] || 0} 只）、12%（${giant['12'] || 0} 只），陆龟独占 <b>15%</b>，甲虫是唯一的 <b>0%</b>；另有 <b>${giant['-'] || 0} 只</b>写「-」。<b>毛刷次数</b>最少只要 4 次（${brushMin.map(r => r[0]).join('、')}），最多 ${brushMax.length} 只只要 12 次，而且<b>12 次那批全是高阶怪</b>——独角兽王、金龙、小飞龙、黑色独角兽、狰狞死神、恶魔一系、狼王、松鼠王、巨人王都在里面。</p>
        <div class="note">「作物」那列括号里的<b>数字是好感门槛</b>：好感刷到这个数，它才会种这一件。<b>加粗的作物</b>是源表用 <code>&lt;font color=red&gt;</code> 标过的——源页正文没有说明红字代表什么，本站只保留「被标红」这个事实（${M.filter(r => r[3].some(c => c[2])).length} 只各有一件），<b>不当成「最爱」或「最好」来解读</b>。<br>
        源表在「自然育成」里同时用了<b>「产出」与「生产」</b>两种写法：只有咕咕鸡、水牛哞哞写「生产」，其余 ${cnt(r => r[1] === '产出')} 只都写「产出」。两词是否指同一件事，源页没说明，这里照录成两类、<b>不合并</b>。</div>
        ${ftableOwn(['魔物', '自然育成', '巨大化率', '作物（数字＝好感门槛）', '毛刷次数', '出现点'],
        ['6.4rem', '4.4rem', '4.8rem', '19rem', '4.4rem', '15rem'],
        monRows, { ph: '输入魔物名、作物名或出现点', cls: 'rfomon' })}

        <h2 class="h2">两处源表用的不是同一套译名</h2>
        <p class="p">站内「魔物图鉴」的海洋段（<code>MON_RFO</code>）取自《最强攻略》怪日表，本页取自 wiki 的 <code>RFOfarm</code>——<b>两份独立表，同一件东西常有不同叫法</b>：马铃薯／土豆、金刚花／金剛花、白金／铂、绿宝石／翡翠、粉红猫／粉色猫咪、托伊药草／玩具香草、白萝卜／萝卜、原之焰火／野之花火、红叶花／花紅葉、树形草／树草。</p>
        <p class="p">条数也对不上：本页 <b>${Object.keys(kinds).length} 种</b>（含 19 种矿石类），图鉴页 <b>55 种</b>；逐项比还有几处差一（金 ${kinds['金'] || 0} 对 9、铁 ${kinds['铁'] || 0} 对 7、红宝石 ${kinds['红宝石'] || 0} 对 3）。<b>源站没给对照表，本页不与图鉴页相加、也不做自动对齐</b>——要用的时候以各自页面的表为准。</p>
    `;
}

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

/* ------------------------------------------------------------
   龙之天地（AZUMA）作物与花木段
   表结构：[名, 种子买价, 种子卖价, 卖价, 买价, 生长天数, 适宜季节, 不适季节, 解锁, 商店]
   数据来自 gametoeasy post/1808（82 条）。原表把「没有」写成 ×、「不适用」写成 —，
   两种一律照录；原表没有单株产量与品质等级，所以本页不推算日收益。
   ------------------------------------------------------------ */
function cropAzumaHtml() {
    const A = (typeof CROP_AZUMA !== 'undefined') ? CROP_AZUMA.rows : [];
    const N = v => /^\d+$/.test(String(v)) ? +v : null;
    const dash = '<span class="mon-no">—</span>';
    const pv = v => /^\d+$/.test(String(v)) ? String(v) : '<span class="mon-no">' + v + '</span>';
    /* 长名单列默认居中会参差不齐，单独拉成左对齐 */
    const L = s => '<span style="display:block;text-align:left">' + s + '</span>';
    const byName = {};
    A.forEach(r => { byName[r[0]] = r; });
    /* 名字成对：前缀 大／超级／惊悚／帝王／凯撒／甘草／巨，后缀 王。
       源表没有「变种」这一列——这是本站按名字做的归并，不是原表结构。 */
    const PRE = ['超级', '惊悚', '帝王', '凯撒', '甘草', '大', '巨'];
    const baseOf = n => {
        for (let i = 0; i < PRE.length; i++) {
            const p = PRE[i];
            if (n.indexOf(p) === 0 && n.length > p.length && byName[n.slice(p.length)]) return n.slice(p.length);
        }
        if (n.slice(-1) === '王' && byName[n.slice(0, -1)]) return n.slice(0, -1);
        return null;
    };
    const pairs = [];
    A.forEach(r => {
        const b = baseOf(r[0]);
        if (!b) return;
        const bs = N(byName[b][3]), vs = N(r[3]);
        pairs.push({ b: b, v: r[0], seed: byName[b][1], day: byName[b][5], bs: bs, vs: vs, r: (bs && vs) ? vs / bs : null });
    });
    const rat = pairs.map(p => p.r).filter(x => x != null);
    const rMin = Math.min.apply(null, rat), rMax = Math.max.apply(null, rat);

    const withDay = A.filter(r => N(r[5]) != null);
    const dMin = Math.min.apply(null, withDay.map(r => N(r[5])));
    const dMax = Math.max.apply(null, withDay.map(r => N(r[5])));
    const dayCnt = {};
    A.forEach(r => { dayCnt[r[5]] = (dayCnt[r[5]] || 0) + 1; });
    const dayKeys = Object.keys(dayCnt).filter(k => k !== '—').sort((a, b) => +a - +b);
    const dayMode = dayKeys.slice().sort((a, b) => dayCnt[b] - dayCnt[a])[0];
    const noDay = A.filter(r => r[5] === '—');

    const half = A.filter(r => { const s = N(r[1]), v = N(r[3]); return s && v && v * 2 === s; });
    const nearHalf = A.filter(r => { const s = N(r[1]), v = N(r[3]); return s && v && v * 2 !== s && Math.abs(v * 2 - s) <= 2; });
    const sap = A.filter(r => N(r[3]) === 1 && N(r[4]) === 1);
    const noSeed = A.filter(r => r[1] === '×');

    const season = {}; A.forEach(r => { season[r[6]] = (season[r[6]] || 0) + 1; });
    const badS = {}; A.forEach(r => { badS[r[7]] = (badS[r[7]] || 0) + 1; });
    const badFilled = A.filter(r => r[7] !== '×');
    const SE = ['春', '夏', '秋', '冬'];

    const shop = {}; A.forEach(r => { shop[r[9]] = (shop[r[9]] || 0) + 1; });
    const shopKeys = Object.keys(shop).filter(k => k !== '—').sort((a, b) => shop[b] - shop[a]);
    const shopNames = k => A.filter(r => r[9] === k).map(r => r[0]).join('、');

    const unl = {}; A.forEach(r => { unl[r[8]] = (unl[r[8]] || 0) + 1; });
    const unlKeys = Object.keys(unl).filter(k => k !== '—').sort((a, b) => unl[b] - unl[a]);
    const lvN = A.filter(r => /村等级/.test(r[8])).length;

    /* 金作物：种子价 400 的那批（金刚花种子 500，不会被带进来） */
    const gold = A.filter(r => N(r[1]) === 400);
    const goldBase = gold.filter(r => !baseOf(r[0]));
    const goldVar = gold.filter(r => baseOf(r[0]));
    const goldIsle = goldBase.map(r => r[8]).join('／');

    const sortBySell = A.filter(r => N(r[3])).slice().sort((a, b) => N(b[3]) - N(a[3]));
    const topSell = sortBySell.slice(0, 8);
    const over1k = A.filter(r => N(r[3]) >= 1000).length;
    const nextSell = N(sortBySell[over1k][3]);
    const maxSeed = A.filter(r => N(r[1])).sort((a, b) => N(b[1]) - N(a[1]))[0];
    const dblBuy = A.filter(r => { const b = N(r[4]), v = N(r[3]); return b && v && b === v * 2; }).length;

    const mainRows = A.map(r => [(r[0] + ' ' + r[6] + r[7] + r[8] + r[9]), [
        r[0], pv(r[1]), pv(r[2]), pv(r[3]), pv(r[4]),
        N(r[5]) != null ? r[5] + ' 天' : dash,
        r[6] === '×' ? dash : r[6],
        r[7] === '×' ? dash : r[7],
        r[8] === '—' ? dash : r[8],
        r[9] === '—' ? dash : r[9],
    ]]);

    return `
        <h2 class="h2">${A.length} 种作物与花木：${withDay.length} 种写了生长天数，最长 ${dMax} 天</h2>
        <p class="p">龙之天地的种子表比前几作平铺得多——<b>这张源表里没有四阶段天数、没有土壤系数、也没有品质等级列</b>，只有「种子多少钱、长几天、哪季是适宜季／不适季、哪家店卖、怎么解锁」这几列。表是源站按<b>种子</b>列的，所以同一株作物的花、果、树苗会各占一行：橘子与橘子树、樱花与樱花树都分开记。原表把「没有」写成 <b>×</b>、「不适用」写成 <b>—</b>，两种照录，本页不改。</p>
        ${stat([
        ['收录', A.length + ' 行'],
        ['写了生长天数', withDay.length + ' 行'],
        ['最短／最长', dMin + ' / ' + dMax + ' 天'],
        ['名字成对的', pairs.length + ' 组'],
    ])}
        <p class="p">四列价格按字面读：<b>种子买价／种子卖价</b>是种子本身的两个价，<b>卖价／买价</b>是收下来的成品（花、蔬菜、竹子）的两个价——卖价是出货所得，买价是买入要付的钱。这两对价之间还有一处很整齐的地方：<b>${dblBuy} 行的买价正好是卖价的 2 倍</b>。表按源站原顺序排，未按价格重排——方便你拿着源表对行。</p>
        ${ftableOwn(['名称', '种子买', '种子卖', '卖价', '买价', '生长天', '适宜季', '不适季', '解锁', '商店'],
        ['6.8rem', '5.2rem', '5.2rem', '5rem', '5rem', '4.8rem', '4.2rem', '4.2rem', '13rem', '11rem'],
        mainRows, { ph: '输入作物名、季节或商店', cls: 'crop' })}

        <h2 class="h2">卖价刚好是种子价一半的，有 ${half.length} 种</h2>
        <p class="p">把「种子买价」与「卖价」并排比，会发现一件很整齐的事：<b>${half.length} 种作物的出货价恰好是种子价的一半</b>——马铃薯 72 买、36 卖，番茄 44 买、22 卖，草莓 100 买、50 卖，金芜菁 400 买、200 卖，大米 120 买、60 卖。<b>${nearHalf.length} 种差 2G</b>（${nearHalf.map(r => r[0]).join('、')}，都是 50 买 24 卖）。按这张表的价目，买种子、种出来、原价出货，只能拿回种子钱的一半。</p>
        <div class="key">只要一颗种子对应一份收成，按这张表的价目，买种子种出来再原价出货就只能拿回一半——源表没给单株产量，所以这句话只在这个前提下成立。<b>真正让作物值钱的是下面那 ${pairs.length} 组成对的名字</b>：卖价一下抬到 5～6 倍，而种子价和生长天数一字不差。另外 ${sap.length} 种树苗的卖价与买价都写着「1」，那是观赏树，出货本来就不值钱，不在这一列里算。</div>

        <h2 class="h2">${pairs.length} 组同名作物：多个前缀或后缀，卖价 ${rMin.toFixed(1)}～${rMax.toFixed(1)} 倍</h2>
        <p class="p">表里有一批名字只差一两个字：芜菁／大芜菁、马铃薯／超级马铃薯、南瓜／惊悚南瓜、胡萝卜／帝王胡萝卜、黄瓜／凯撒黄瓜、草莓／甘草莓、葱／巨葱、少女蜜瓜／少女蜜瓜王。<b>每一组的种子买价与生长天数完全相同，只有卖价不同</b>——最低 ${rMin.toFixed(2)} 倍（金芜菁→大金芜菁，200→1,000），最高 ${rMax.toFixed(2)} 倍（青椒→大青椒，27→166）。</p>
        ${tbl(['基准', '升级版', '种子买价', '生长天', '基准卖价', '升级版卖价', '倍数'], pairs.slice().sort((a, b) => b.r - a.r).map(p => [
        p.b, '<b>' + p.v + '</b>', p.seed, p.day === '—' ? dash : p.day + ' 天',
        p.bs, '<b>' + p.vs + '</b>', p.r.toFixed(2) + ' 倍',
    ]), { leftFirst: true, colw: ['7rem', '9rem', '5.6rem', '5rem', '5.6rem', '6.4rem', '5.4rem'], cls: 'spot' })}
        <div class="note">这 ${pairs.length} 组是<b>本站按名字归的</b>（前缀「大／超级／惊悚／帝王／凯撒／甘草／巨」、后缀「王」），源表里并没有「升级版」这一列，也没有写升级版怎么拿到。所以这一页只列价差，不猜获得方式——要确认怎么种出来，得看游戏里或别的资料。</div>

        <h2 class="h2">生长天数：${dMin}～${dMax} 天，${dayMode} 天的最多</h2>
        <p class="p">写了天数的 ${withDay.length} 种里，${dayMode} 天成熟的就有 ${dayCnt[dayMode]} 种，占了快一半；最快的 ${dMin} 天（${A.filter(r => r[5] === String(dMin)).map(r => r[0]).join('、')}），最慢 ${dMax} 天。</p>
        ${tbl(['生长天数', '种数', '对应作物'], dayKeys.map(k => [k + ' 天', '<b>' + dayCnt[k] + '</b>', L(A.filter(r => r[5] === k).map(r => r[0]).join('、'))]), { leftFirst: true, colw: ['5.4rem', '4.2rem', 'auto'] })}
        <p class="p">另有 <b>${noDay.length} 种写「—」</b>，没给天数。看名单就知道不是漏填：${noDay.map(r => r[0]).join('、')}——这里面是<b>树</b>（橘子／葡萄／苹果／栗子／桃子及各自的树苗）、<b>花木</b>（樱花、梅花、紫藤）、以及红薯、葱、少女蜜瓜、菠萝、金南瓜、金卷心菜这几个，还有大米与糯米。源表没写它们几天成熟，本页不替它填。</p>

        <h2 class="h2">季节：适宜季 ${A.length - season['×']} 种，不适季只有 ${badFilled.length} 种填了</h2>
        <p class="p">「适宜季节」这一列 ${A.length - season['×']} 种有标注，其余 ${season['×']} 种写 ×（${A.filter(r => r[6] === '×').map(r => r[0]).join('、')} 这些花木、观赏树与金作物）。「不适季节」则大部分空着——<b>${badFilled.length} 种填了，${badS['×']} 种写 ×</b>。</p>
        ${tbl(['季节', '写在「适宜季节」', '写在「不适季节」'], SE.map(s => [s, (season[s] || 0) + ' 种', (badS[s] || 0) + ' 种']).concat([['×（未标注）', season['×'] + ' 种', badS['×'] + ' 种']]), { leftFirst: true, colw: ['8rem', '8rem', '8rem'] })}
        <div class="key">这张表里有一处很干净：<b>「不适季节」填过冬 ${badS['冬'] || 0} 次、夏 ${badS['夏'] || 0} 次、秋 ${badS['秋'] || 0} 次，春一次都没出现</b>。也就是说没有一种作物把春天列为「不适」——但源表本来就没填满这一列，所以只能说「表里如此」，不能当规律推。</div>

        <h2 class="h2">种子在谁家卖：春之里 伊吕波茶屋 ${shop[shopKeys[0]]} 种居首</h2>
        <p class="p">按「商店」列数，${A.length} 行里 <b>${A.filter(r => r[9] === '—').length} 行写「—」</b>，即源表没给出购买地点（树苗、野采果实、部分蔬菜）。剩下的集中在几处：</p>
        ${tbl(['商店／地点', '种数', '名单'], shopKeys.map(k => [k, '<b>' + shop[k] + '</b>', L(shopNames(k))]), { leftFirst: true, colw: ['13rem', '4.6rem', 'auto'] })}
        <div class="key">三座村子的店分工很清楚：<b>春之里 伊吕波茶屋</b>卖基础蔬菜与草莓（${shop['春之里 伊吕波茶屋'] || 0} 种），<b>夏之里 常夏杂货店</b>管玉米与番茄，<b>秋之里 八千代居酒屋</b>只有大米与糯米两种，<b>花店</b>卖全部 ${shop['花店'] || 0} 种花，<b>旅商</b>只卖 ${shop['旅商'] || 0} 种 400G 种子。想买齐种子，三个村子都得跑一遍，花店还得先建起来。</div>

        <h2 class="h2">解锁条件：${unl['—']} 行不用解锁，${lvN} 行卡村等级</h2>
        <p class="p">「解锁」列写的是「怎么才能买到这种种子」。<b>${unl['—']} 行写「—」</b>，也就是开局直接能买；其余按条件分：</p>
        ${tbl(['解锁条件', '行数', '名单'], unlKeys.map(k => [k, '<b>' + unl[k] + '</b>', L(A.filter(r => r[8] === k).map(r => r[0]).join('、'))]), { leftFirst: true, colw: ['15rem', '4.6rem', 'auto'] })}
        <div class="key">村等级是主要门槛，${lvN} 行要推村等级，其中<b>春之里 5 级（${A.filter(r => /达到5/.test(r[8])).length} 行）与 6 级（${A.filter(r => /6可购买/.test(r[8])).length} 行）最多</b>；另有 ${A.filter(r => r[8] === '建造花店后可购买').length} 行要先把花店建起来，${A.filter(r => /岛|小径/.test(r[8])).length} 行要在岛上或野地里拿（${A.filter(r => /岛|小径/.test(r[8])).map(r => r[0] + '＝' + r[8]).join('、')}）。</div>

        <h2 class="h2">种子价 400G 的 ${gold.length} 种：${goldBase.length} 种基础款卖了刚好赔一半</h2>
        <p class="p">种子买价全是 400G 的这 ${gold.length} 种是另一套体系：种子只在<b>旅商</b>手上，而且要先去特定岛屿才拿得到。</p>
        ${tbl(['名称', '种子买价', '卖价', '生长天', '解锁', '商店'], gold.map(r => [
        (baseOf(r[0]) ? '<b>' + r[0] + '</b>' : r[0]), r[1], r[3], r[5] === '—' ? dash : r[5] + ' 天',
        r[8] === '—' ? dash : r[8], r[9] === '—' ? dash : r[9],
    ]), { leftFirst: true, colw: ['8rem', '6rem', '5rem', '5rem', 'auto', '5rem'] })}
        <div class="key">算式摆在这儿：种子 400G，${goldBase.length} 种基础金作物（${goldBase.map(r => r[0]).join('、')}）只卖 200G，<b>买种子种一茬再出货，正好赔掉 200G</b>；换成升级版（${goldVar.map(r => r[0]).join('、')}）卖 1,000G，才变成每茬净赚 600G。这四种的解锁点分别在 ${goldIsle}——想靠金作物赚钱，顺序是「先去岛上拿到种子 → 再考虑怎么弄到升级版」。</div>

        <h2 class="h2">卖价最高的 ${topSell.length} 种</h2>
        <p class="p">不看倍数看绝对值：卖价到 1,000G 的只有 ${over1k} 种，全是这套里四个升级版；再往下一档直接掉到 ${nextSell}G（${sortBySell[over1k][0]}），差了一半还多。种子最贵的一种是 <b>${maxSeed[0]}（${maxSeed[1]}G）</b>，而它只卖 ${maxSeed[3]}G。</p>
        ${tbl(['名称', '卖价', '种子买价', '生长天', '商店'], topSell.map(r => [
        r[0], '<b>' + N(r[3]).toLocaleString() + '</b>', r[1], r[5] === '—' ? dash : r[5] + ' 天', r[9] === '—' ? dash : r[9],
    ]), { leftFirst: true, colw: ['9rem', '6rem', '6rem', '5.4rem', 'auto'] })}
        <div class="note">${noSeed.length} 种种子没有买价（${noSeed.map(r => r[0]).join('、')}）：源表这几行的「种子买价／种子卖价」都写 ×，也就是表里查不到买种子的价。<br><b>本页没算「每天赚多少」</b>：源表没有单株产量，也没有品质等级，拿卖价除以天数再减种子钱，等于替它假设「一颗种子只出一个、还按最高价出货」——那两步都是编的。要按天算收益，得先有产量这一列。</div>
        <div class="note">数据取自 ${(typeof CROP_AZUMA !== 'undefined') ? CROP_AZUMA.src : ''}，共 ${A.length} 行，逐行照录。原表没有出售概率、没有掉落、没有料理用量，本页不补。</div>
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
    const al = o.alias || {};   /* 别名（如日文原名）只进搜索键，不占显示列 */
    const nav = `<div class="chip-row${dense}" id="eqNav">${CATS.map((c, i) =>
        `<button class="chip" data-jump="is-${i}">${c} ${cnt[c]}</button>`).join('')}</div>`;
    const secs = CATS.map((c, i) => {
        const list = IT.filter(r => r[1] === c);
        const trs = list.map(r => `<tr data-ek="${c}" data-s="${esc(r[0] + ' ' + (al[r[0]] || '') + ' ' + r[1] + ' ' + r[ti])}">
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

/* ============================================================
   配方大全 · 边境（RFF）
   RFF_COOK [厨具, 名字, 配方lv, [材料], 全效果, 配方书, 买价, 卖价, 入手]
   全部统计在页面内现算，不另存衍生表。
   ============================================================ */
function recipeRffHtml() {
    const C = (typeof RFF_COOK !== 'undefined') ? RFF_COOK : [];
    if (!C.length) return '<p class="p">边境的配方数据未加载。</p>';
    const money = v => (v == null || v === '' || v === '—') ? '<span class="mon-no">—</span>' : Number(v).toLocaleString() + 'G';
    const cell = v => (v == null || v === '' || v === '—') ? '<span class="mon-no">—</span>' : v;
    const dash = v => (v == null || v === '') ? '—' : v;
    const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

    /* 厨具分组 */
    const tools = [];
    C.forEach(r => { if (tools.indexOf(r[0]) < 0) tools.push(r[0]); });
    const toolRows = tools.map(t => {
        const g = C.filter(r => r[0] === t);
        const lv = g.map(r => r[2]).filter(v => typeof v === 'number');
        return [t, g.length + ' 条',
        'Lv' + Math.min.apply(null, lv) + ' ～ ' + Math.max.apply(null, lv),
        money(med(g.map(r => r[7]).filter(v => typeof v === 'number')))];
    });

    /* 配方书：条数 + 覆盖的等级段 + 专属哪件厨具（边境同样是严格一一对应） */
    const bks = [];
    C.forEach(r => { if (r[5] && bks.indexOf(r[5]) < 0) bks.push(r[5]); });
    const bkMap = {};
    C.forEach(r => { (bkMap[r[5]] = bkMap[r[5]] || []).push(r[0]); });
    const own = b => { const s = new Set(bkMap[b] || []); return s.size === 1 ? bkMap[b][0] : [...s].join('、'); };
    /* 按厨具分组、组内按最低等级排，让「一套书 = 一件厨具」的阶梯露出来 */
    const bkRows = [];
    tools.forEach(t => {
        const g = bks.filter(b => own(b) === t).sort((a, b) => {
            const la = Math.min.apply(null, C.filter(r => r[5] === a).map(r => r[2]).filter(v => typeof v === 'number'));
            const lb = Math.min.apply(null, C.filter(r => r[5] === b).map(r => r[2]).filter(v => typeof v === 'number'));
            return la - lb;
        });
        g.forEach(b => {
            const gg = C.filter(r => r[5] === b);
            const lv = gg.map(r => r[2]).filter(v => typeof v === 'number');
            bkRows.push([b, t, gg.length + ' 条', 'Lv' + Math.min.apply(null, lv) + ' ～ ' + Math.max.apply(null, lv)]);
        });
    });

    /* 食材复用次数 */
    const mat = {};
    C.forEach(r => (r[3] || []).forEach(m => { mat[m] = (mat[m] || 0) + 1; }));
    const ms = Object.keys(mat).sort((a, b) => mat[b] - mat[a]);
    const BASE = ['小麦粉', '牛奶', '蛋', '油', '黄油', '米'];
    const onlyBase = C.filter(r => (r[3] || []).length && (r[3] || []).every(m => BASE.indexOf(m) >= 0));
    const anyBase = C.filter(r => (r[3] || []).some(m => BASE.indexOf(m) >= 0));
    const once = ms.filter(m => mat[m] === 1);
    /* 单材料配方 */
    const one = C.filter(r => (r[3] || []).length === 1);
    /* 能买到的：买价 vs 卖价 */
    const buy = C.filter(r => typeof r[6] === 'number' && typeof r[7] === 'number');
    const buyRows = buy.map(r => [r[1], money(r[6]), money(r[7]),
        Math.round(r[7] / r[6] * 100) + '%', dash(r[8])]);
    /* 卖价最高 */
    const top = C.slice().filter(r => typeof r[7] === 'number').sort((a, b) => b[7] - a[7]).slice(0, 6);

    return `
    <h2 class="h2">${C.length} 条配方：七件厨具，${bks.length} 本配方书</h2>
    <p class="p">边境的配方表结构很直白：<b>每件厨具对应一批配方，每本配方书教一批做法</b>。${tools.length} 件厨具里<b>平底锅最多（${C.filter(r => r[0] === '平底锅').length} 条）</b>。配方等级从 <b>Lv1 一路排到 Lv99</b>，跨度比后期作品大得多——这意味着「按等级顺序做」在这作是可行的，不会中途断档。</p>
    ${stat([['配方', C.length + ' 条'], ['食材', ms.length + ' 种'], ['配方书', bks.length + ' 本'], ['单材料配方', one.length + ' 条']])}
    <h2 class="h2">先决定练哪件厨具</h2>
    <p class="p">七件厨具的条数、等级跨度与成品售价中位数如下。<b>「卖价中位」是该厨具所有成品售价的中位数</b>，用来判断练它划不划算：</p>
    ${tbl(['厨具', '配方数', '等级跨度', '卖价中位'], toolRows,
            { leftFirst: true, cls: 'txt', colw: ['4.6rem', 'auto', 'auto', 'auto'] })}
    <div class="key"><b>烤箱只有 ${C.filter(r => r[0] === '烤箱').length} 条，卖价中位却最高（${money(med(C.filter(r => r[0] === '烤箱').map(r => r[7]).filter(v => typeof v === 'number')))}）</b>——条数少、单价高，是「练得慢但赚得快」的那类。<b>料理台条数多（${C.filter(r => r[0] === '料理台').length}）而卖价中位最低</b>，适合前期冲等级。想赚钱就走烤箱，想冲级就走料理台。</div>
    <h2 class="h2">${bks.length} 本配方书：每本只教一件厨具，但书名没告诉你</h2>
    <p class="p">这一列是重点。<b>${bks.length} 本配方书，每本都只属于某一件厨具</b>——没有一本是混着教的。问题是<b>边境的书名完全不透露这一点</b>：「明日的配菜」听不出是平底锅书，「今夜下点功夫」也听不出是锅子书。所以买书之前先看这张表：</p>
    ${tbl(['配方书', '实际教的是', '收录', '等级跨度'], bkRows,
            { leftFirst: true, cls: 'txt', colw: ['auto', '4.4rem', '3.2rem', 'auto'] })}
    <div class="key"><b>看第二列：每一件厨具的书加起来，条数正好等于那件厨具的全部配方</b>——料理台三本 ${C.filter(r => r[0] === '料理台').length} 条、平底锅三本 ${C.filter(r => r[0] === '平底锅').length} 条、锅子三本 ${C.filter(r => r[0] === '锅子').length} 条、烤箱三本 ${C.filter(r => r[0] === '烤箱').length} 条，一件不差。<b>平底锅那三卷还是首尾相接的台阶</b>：第 1 卷 Lv2～32 → 第 2 卷 Lv25～62 → 最终卷 Lv65～95，按这个顺序练不会断档。<b>收得最多的「厨师之路」有 ${C.filter(r => r[5] === '厨师之路').length} 条，但它是料理台书</b>——只想练平底锅的话，买了它没用。</div>
    <h2 class="h2">囤什么食材：${ms.length} 种里只有六样值得常备</h2>
    <p class="p">${C.length} 条配方一共用到 <b>${ms.length} 种食材</b>，但复用率极不平均。用得最多的六样是：</p>
    ${tbl(['食材', '被几条配方用到'], ms.slice(0, 8).map(m => [m, mat[m] + ' 条']),
            { leftFirst: true, cls: 'txt', colw: ['auto', 'auto'] })}
    <div class="key"><b>小麦粉 ${mat['小麦粉']} 条、牛奶 ${mat['牛奶']} 条、蛋 ${mat['蛋']} 条、油 ${mat['油']} 条、黄油 ${mat['黄油']} 条、米 ${mat['米']} 条</b>——这六样出现在 <b>${anyBase.length} 条</b>配方里（占 ${Math.round(anyBase.length / C.length * 100)}%），其中 <b>${onlyBase.length} 条只靠这六样就能做出来</b>。前期把小麦粉与牛奶囤住，等于提前解锁了四成配方。<b>另有 ${one.length} 条配方只要一种材料</b>（石川鲑鱼、鲷鱼、芜菁这些直接下锅），是冲等级最省事的取巧路径。</div>
    <details class="mon-fold">
        <summary>展开 ${once.length} 种「只用一次」的食材（点一下）</summary>
        <p class="p">${once.join('、')}</p>
        <p class="p">这批分四类：<b>宝石与结晶</b>（红宝石、海蓝宝石、绿宝石、紫水晶、绿／青／红水晶、地之结晶、水之结晶）、<b>拿成品再加工</b>（饭团、曲奇饼干、三种果酱、中和剂、感冒药、营养剂 α／β／γ）、<b>稀有鱼</b>（珠星三块鱼、高身鲫、鲋鱼、青花鱼）、<b>金作物</b>（金南瓜、金芜菁）。<b>看到配方里出现这些，说明它是那种只做一次就够了的东西</b>——不用为它专门囤货。</p>
    </details>
    <h2 class="h2">别买成品：${buy.length} 条能买到的全是亏</h2>
    <p class="p">${C.length} 条里只有 <b>${buy.length} 条能在店里直接买到</b>（酒馆 ${C.filter(r => r[8] === '酒馆').length} 条、教会医务室 ${C.filter(r => r[8] === '教会医务室购买').length} 条、杂货店『原质』 ${C.filter(r => r[8] === '杂货店『原质』').length} 条）。把它们的买价与卖价并排看，结论很干脆：</p>
    ${tbl(['成品', '买入', '卖出', '卖价／买价', '在哪买'], buyRows,
            { leftFirst: true, cls: 'txt', colw: ['auto', '3.6rem', '3.6rem', 'auto', 'auto'] })}
    <div class="key"><b>${buy.length} 条里没有一条是赚的</b>——卖出价普遍只有买入价的 <b>40%～50%</b>，最夸张的<b>「速速绿」买 ${money(9200)} 只能卖 ${money(1840)}（20%）</b>。所以成品只能自己做、自己用或自己送，<b>指望「店里买了转手卖」必亏一半</b>。真正值钱的是做出来卖：卖价最高的是<b>${top.slice(0, 3).map(r => r[1] + '（' + money(r[7]) + '）').join('、')}</b>。</div>
    <h2 class="h2">全部 ${C.length} 条，可按名字／材料／配方书筛选</h2>
    ${ftableOwn(['配方', '厨具', 'Lv', '材料', '配方书', '卖价'],
            ['auto', '4.2rem', '2.6rem', 'auto', 'auto', '3.6rem'],
            C.map(r => [r[1] + ' ' + r[0] + ' ' + (r[5] || '') + ' ' + (r[3] || []).join(' '),
                [r[1], r[0], dash(r[2]), (r[3] || []).length ? (r[3] || []).join('、') : '—', dash(r[5]),
                    typeof r[7] === 'number' ? money(r[7]) : '—']]),
            { ph: '输入配方名、材料或配方书筛选' })}
    <div class="note">取自 biligame 符文工厂 wiki 的「RFF 料理与药学配方」表 ${C.length} 行，物品译名优先采用汉化版定稿（<code>js/rffterm.js</code> 的 <code>CN_RFF_ITEM</code>）。<b>「全效果」一列原表部分留空</b>，本页不补；配方等级为原表的「配方 lv」，不是做出成品后的物品等级。<b>「只用一次」是按本表统计的复用次数</b>，不代表游戏内产出量。</div>
    <div class="jump">
        <a href="#/page/cook"><div class="jp-t">料理</div><div class="jp-s">烹饪机制与料理等级怎么刷</div></a>
        <a href="#/page/source"><div class="jp-t">素材出处与掉落</div><div class="jp-s">小麦粉、牛奶这些去哪打</div></a>
    </div>`;
}

/* ============================================================
   配方大全 · 海洋（RFO）
   RFO_COOK [厨具, 名字, 料理lv, 配方书, [材料], 持续时间, HP, RP, 特殊效果, 买价, 入手, 卖价]
   RFO_MED  [类别, 名字, 技能lv, 配方书, [材料], 效果时间, HP, RP, 特殊效果, 买价, 卖价, 入手]
   注意：两张表的「买价／卖价」列位不同（料理 9/11，药学 9/10）
   ============================================================ */
function recipeRfoHtml() {
    const C = (typeof RFO_COOK !== 'undefined') ? RFO_COOK : [];
    const M = (typeof RFO_MED !== 'undefined') ? RFO_MED : [];
    if (!C.length) return '<p class="p">海洋的配方数据未加载。</p>';
    const money = v => (v == null || v === '' || v === '—') ? '<span class="mon-no">—</span>' : Number(v).toLocaleString() + 'G';
    const dash = v => (v == null || v === '') ? '—' : v;
    const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

    const tools = [];
    C.forEach(r => { if (tools.indexOf(r[0]) < 0) tools.push(r[0]); });
    const toolRows = tools.map(t => {
        const g = C.filter(r => r[0] === t);
        const lv = g.map(r => r[2]).filter(v => typeof v === 'number');
        return [t, g.length + ' 条',
        'Lv' + Math.min.apply(null, lv) + ' ～ ' + Math.max.apply(null, lv),
        money(med(g.map(r => r[11]).filter(v => typeof v === 'number')))];
    });

    /* 配方书：这本属于哪件厨具 —— 海洋是严格一一对应的 */
    const bks = [];
    C.forEach(r => { if (r[3] && bks.indexOf(r[3]) < 0) bks.push(r[3]); });
    const bkMap = {};
    C.forEach(r => { (bkMap[r[3]] = bkMap[r[3]] || []).push(r[0]); });
    const oneTool = bks.filter(b => new Set(bkMap[b]).size === 1).length;
    const bkRows = bks.map(b => {
        const g = C.filter(r => r[3] === b);
        const lv = g.map(r => r[2]).filter(v => typeof v === 'number');
        return [b, new Set(bkMap[b]).size === 1 ? bkMap[b][0] : bkMap[b].join('、'),
        g.length + ' 条', 'Lv' + Math.min.apply(null, lv) + ' ～ ' + Math.max.apply(null, lv)];
    });

    const mat = {};
    C.forEach(r => (r[4] || []).forEach(m => { mat[m] = (mat[m] || 0) + 1; }));
    const ms = Object.keys(mat).sort((a, b) => mat[b] - mat[a]);
    const BASE = ['小麦粉', '牛奶', '蛋', '油', '黄油', '米'];
    const onlyBase = C.filter(r => (r[4] || []).length && (r[4] || []).every(m => BASE.indexOf(m) >= 0));
    const anyBase = C.filter(r => (r[4] || []).some(m => BASE.indexOf(m) >= 0));

    /* 持续时间分档 */
    const dur = {};
    C.forEach(r => { const k = r[5] == null ? '—' : r[5] + ' 秒'; dur[k] = (dur[k] || 0) + 1; });
    const durRows = Object.keys(dur).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0))
        .map(k => [k, dur[k] + ' 条']);

    const buy = C.filter(r => typeof r[9] === 'number' && typeof r[11] === 'number');
    const buyRows = buy.slice().sort((a, b) => b[11] - a[11]).slice(0, 12)
        .map(r => [r[1], money(r[9]), money(r[11]), Math.round(r[11] / r[9] * 100) + '%']);
    const top = C.slice().filter(r => typeof r[11] === 'number').sort((a, b) => b[11] - a[11]).slice(0, 5);
    const noLv = M.filter(r => typeof r[2] !== 'number');

    return `
    <h2 class="h2">${C.length} 道料理 ＋ ${M.length} 条药学，${bks.length} 本配方书</h2>
    <p class="p">海洋把料理与药学分开记账：<b>${C.length} 道料理分属 ${tools.length} 件厨具</b>，另有 <b>${M.length} 条药学</b>单独一套。料理等级同样是 Lv1～99。和边境比，这一作最大的区别在<b>配方书的组织方式</b>——下面第二节会说。</p>
    ${stat([['料理', C.length + ' 道'], ['药学', M.length + ' 条'], ['食材', ms.length + ' 种'], ['配方书', bks.length + ' 本']])}
    <h2 class="h2">六件厨具，条数与单价差得很开</h2>
    ${tbl(['厨具', '配方数', '等级跨度', '卖价中位'], toolRows,
            { leftFirst: true, cls: 'txt', colw: ['4.6rem', 'auto', 'auto', 'auto'] })}
    <div class="key">和边境同一个规律：<b>烤箱条数最少（${C.filter(r => r[0] === '烤箱').length}）而卖价中位最高（${money(med(C.filter(r => r[0] === '烤箱').map(r => r[11]).filter(v => typeof v === 'number')))}）</b>，<b>厨房条数最多（${C.filter(r => r[0] === '厨房').length}）而中位最低</b>。<b>蒸笼只有 ${C.filter(r => r[0] === '蒸笼').length} 条</b>，是六件里最冷门的——想凑齐图鉴别忘了它。</div>
    <h2 class="h2">${bks.length} 本配方书：每本只教一件厨具</h2>
    <p class="p">这一作和边境其实是<b>同一个规矩：一本配方书只教一件厨具，两边都是 ${bks.length} 本对 ${oneTool} 本、一件不差</b>。真正的差别在<b>命名</b>——海洋直接把厨具写进书名（「平底锅行家・初级」），买之前就知道它教什么；边境则藏进了「明日的配菜 第1卷」这类书名里，不查表根本看不出那是平底锅书。所以海洋是这套设计<b>被写明</b>的版本：</p>
    ${tbl(['配方书', '专属厨具', '收录', '等级跨度'], bkRows,
            { leftFirst: true, cls: 'txt', colw: ['auto', '4.4rem', '3.2rem', 'auto'] })}
    <div class="key">于是有一个很好用的推论：<b>想精通某件厨具，就把它的「初级＋中级＋上级＋奥义」四本买齐，条数正好等于那件厨具的全部配方</b>。比如<b>平底锅 ${C.filter(r => r[0] === '平底锅').length} 条 ＝ 初级 ${C.filter(r => r[3] === '平底锅行家・初级').length} ＋ 中级 ${C.filter(r => r[3] === '平底锅行家・中级').length} ＋ 上级 ${C.filter(r => r[3] === '平底锅行家・上级').length} ＋ 奥义 ${C.filter(r => r[3] === '平底锅的奥义').length}</b>，一分不差。反过来说，<b>「初级」那六本（${bks.filter(b => /初级$/.test(b)).length} 本）加起来 ${C.filter(r => /初级$/.test(r[3] || '')).length} 条，是前期最划算的一笔投资</b>。</div>
    <h2 class="h2">囤什么：和边境是同一份清单</h2>
    <p class="p">${C.length} 道料理用到 <b>${ms.length} 种食材</b>，用得最多的六样：</p>
    ${tbl(['食材', '被几道料理用到'], ms.slice(0, 8).map(m => [m, mat[m] + ' 道']),
            { leftFirst: true, cls: 'txt', colw: ['auto', 'auto'] })}
    <div class="key"><b>小麦粉、牛奶、蛋、油、黄油、米</b>——<b>和边境的前六名一字不差</b>，只是次数略少（小麦粉 ${mat['小麦粉']} 道）。这六样出现在 <b>${anyBase.length} 道</b>料理里（占 ${Math.round(anyBase.length / C.length * 100)}%），<b>${onlyBase.length} 道只靠它们就能做</b>。跨作结论很稳：<b>这两作都先把面粉和乳制品囤起来</b>。海洋的食材复用率还更高——只用一次的只有 <b>${ms.filter(m => mat[m] === 1).length} 种</b>，而边境有 34 种。</div>
    <h2 class="h2">效果持续多久：四档</h2>
    <p class="p">海洋的料理明确标了<b>持续时间</b>，而且只有四个值。这一列决定「这道菜是随手吃还是留着打 BOSS」：</p>
    ${tbl(['持续时间', '道数'], durRows, { leftFirst: true, cls: 'txt', colw: ['auto', 'auto'] })}
    <div class="key"><b>30 秒（${dur['30 秒'] || 0} 道）与 60 秒（${dur['60 秒'] || 0} 道）占了将近九成</b>，属于日常随手吃。<b>120 秒只有 ${dur['120 秒'] || 0} 道</b>，是真正的长效料理——打长时间的迷宫或 BOSS 就该带这几道。</div>
    <h2 class="h2">${buy.length} 道能在「三姐妹旅馆」买到，照样是亏的</h2>
    <p class="p">${C.length} 道里 <b>${buy.length} 道可以直接买</b>（全部出自三姐妹旅馆），其余 ${C.length - buy.length} 道只能自己做。按卖价从高到低列出前 12 道：</p>
    ${tbl(['成品', '买入', '卖出', '卖价／买价'], buyRows,
            { leftFirst: true, cls: 'txt', colw: ['auto', '3.6rem', '3.6rem', 'auto'] })}
    <div class="key">和边境一样：<b>卖价普遍是买价的 40%</b>（少数 50%，橘子汁是唯一的例外、57%）。<b>买现成的再卖掉必亏，成品只该自己做</b>。真要赚钱是做出来卖——卖价最高的是<b>${top.slice(0, 3).map(r => r[1] + '（' + money(r[11]) + '）').join('、')}</b>。</div>
    <h2 class="h2">药学 ${M.length} 条：另一套逻辑</h2>
    <p class="p">药学单独记账，靠「药品行家・初级／上级」两本书。<b>${M.length} 条里有 ${noLv.length} 条没有技能等级</b>（${noLv.map(r => r[1]).join('、')}）——这些不走「技能等级」这条路，原表就没给等级。</p>
    ${ftableOwn(['药品', '技能 Lv', '材料', '配方书', '卖价'],
            ['auto', '3.4rem', 'auto', 'auto', '3.4rem'],
            M.map(r => [r[1] + ' ' + (r[3] || '') + ' ' + (r[4] || []).join(' '),
                [r[1], dash(r[2]), (r[4] || []).length ? (r[4] || []).join('、') : '—',
                    dash(r[3]), typeof r[10] === 'number' ? money(r[10]) : '—']]),
            { ph: '输入药名或材料筛选' })}
    <h2 class="h2">全部 ${C.length} 道料理，可按名字／材料／配方书筛选</h2>
    ${ftableOwn(['料理', '厨具', 'Lv', '材料', '配方书', '持续', '卖价'],
            ['auto', '3.8rem', '2.4rem', 'auto', 'auto', '2.8rem', '3.4rem'],
            C.map(r => [r[1] + ' ' + r[0] + ' ' + (r[3] || '') + ' ' + (r[4] || []).join(' '),
                [r[1], r[0], r[2], (r[4] || []).length ? (r[4] || []).join('、') : '—',
                    dash(r[3]), r[5] == null ? '—' : r[5] + ' 秒',
                    typeof r[11] === 'number' ? money(r[11]) : '—']]),
            { ph: '输入料理名、材料或配方书筛选' })}
    <div class="note">取自 biligame 符文工房 wiki 的「RFO 料理与药学配方」表（料理 ${C.length} 行、药学 ${M.length} 行）。<b>料理表的「卖价」在第 11 列、药学表在第 10 列</b>，两表列位不同，本页按各自列位取值。<b>「处方书」指的不是同一件物品</b>：料理靠厨具行家系列、药学靠药品行家系列，两者不通用。未标等级的药学条目原表即为空，本页显示「—」，不补数。</div>
    <div class="jump">
        <a href="#/page/cook"><div class="jp-t">料理</div><div class="jp-s">烹饪机制与料理等级怎么刷</div></a>
        <a href="#/page/source"><div class="jp-t">素材出处与掉落</div><div class="jp-s">小麦粉、牛奶这些去哪打</div></a>
    </div>`;
}

/* ============================================================
   商店与设施 · 龙之天地（azuma）
   SHOP_AZUMA.rows = [[地点, 商品, 价格, 库存, 备注], ...]，248 行照录。
   源表「库存」「备注」两列 248 行全写 —，本站不补数；
   28 处地点写法里有三组商品与价格完全一致（火仙药店／药店、
   萨扎的铁匠铺／铁匠铺、木工樱屋／营造铺），照录不合并，只在页上点明。
   ============================================================ */
/* 符文工房 2 的商店：攻略本《RF2 攻略合辑》「商店及售价」一章，四家店。
   一条商品在源里是「日文名<TAB>中文名<TAB>」+ 下一行价格；诊所那节偶尔把中文名另起一行。
   本页只照录，不把攻略本的中文名换成站内叫法——两套写法并存，对照放在单独一节里讲。 */
/* ------------------------------------------------------------
   符文工房 3（RF3）镇内各店铺：源是同人全攻略「镇内各店铺」一章的八家店。
   RF3_SHOP = [{ n 店名, h 营业时间, secs:[{t,c,r}], notes:[], subs:[], extra:{} }]
   价格一律照原文显示（有的是纯数字，有的自带 G），不做统一格式化。
   ------------------------------------------------------------ */
function shopRf4Html() {
    const D = (typeof RF4_SHOP !== 'undefined') ? RF4_SHOP : null;
    if (!D || !D.shops || !D.shops.length) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const money = v => (v == null || v === '') ? dash : (/[GＧ]$/.test(String(v)) ? E(v) : E(v) + 'G');
    const pnum = v => { const m = String(v == null ? '' : v).replace(/[^0-9]/g, ''); return m ? Number(m) : null; };
    const idx = (sec, re) => { for (let i = 0; i < sec.c.length; i++) if (re.test(sec.c[i])) return i; return -1; };

    const all = [];
    D.shops.forEach(sp => sp.secs.forEach(sec => {
        const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/), di = idx(sec, /说明|作用|英文名/);
        sec.r.forEach(r => all.push({
            sp, sec, r, di,
            name: ni >= 0 ? r[ni] : r[0],
            price: pi >= 0 ? r[pi] : '',
            pl: pnum(pi >= 0 ? r[pi] : ''),
        }));
    }));

    const priced = all.filter(x => x.pl != null);
    const byP = priced.slice().sort((a, b) => b.pl - a.pl);
    const hi = byP[0], hi2 = byP[1], lo = byP[byP.length - 1];
    const noPrice = all.filter(x => x.pl == null);

    const stageOf = s => {
        const t = String(s || '');
        if (!t) return '开局可买';
        if (/开始即可|一开始|初期|初始/.test(t)) return '开局可买';
        if (/通关后/.test(t)) return '通关后';
        if (/击破后/.test(t)) return '剧情击破后';
        if (/限定|种子|委托箱/.test(t)) return '季节／种子／委托';
        return '备注（材料·解锁·分类）';
    };
    const STAGE_ORDER = ['开局可买', '季节／种子／委托', '剧情击破后', '通关后', '备注（材料·解锁·分类）'];
    const stageCount = {}, stageEg = {};
    let noCol = 0;
    const noColSecs = [];
    all.forEach(x => {
        if (x.di < 0) {
            noCol++;
            const k = x.sp.n + '·' + x.sec.t;
            if (noColSecs.indexOf(k) < 0) noColSecs.push(k);
            return;
        }
        const s = stageOf(x.r[x.di]);
        stageCount[s] = (stageCount[s] || 0) + 1;
        (stageEg[s] = stageEg[s] || []).push(x.name);
    });
    const pct = n => { const v = n / all.length * 100; return (v > 0 && v < 1) ? '<1%' : Math.round(v) + '%'; };
    const stageRows = STAGE_ORDER.filter(s => stageCount[s]).map(s => [s, stageCount[s] + ' 条', pct(stageCount[s]), stageEg[s].slice(0, 4).join('、')]);

    const fac = D.shops.filter(sp => !sp.secs.length);
    const spRows = D.shops.map((sp, i) => {
        let n = 0, mx = null;
        sp.secs.forEach(sec => sec.r.forEach(r => {
            n++;
            const pi = idx(sec, /售价|价格|费用/);
            const v = pi >= 0 ? pnum(r[pi]) : null;
            if (v != null && (!mx || v > mx.v)) mx = { v: v, s: r[idx(sec, /商品|名称|农具/)] };
        }));
        return [String(i + 1), E(sp.n), sp.h ? E(sp.h) : dash, (n ? n + ' 条' : '<span class="txc">纯设施</span>'),
            mx ? '<b>' + E(mx.s) + '</b> ' + money(String(mx.v)) : dash];
    });

    const allRows = all.map(x => {
        const st = x.di >= 0 ? (String(x.r[x.di]).trim() || '—') : '—';
        return [
            [x.name, x.sp.n, x.sec.t, st].join(' ').replace(/"/g, ''),
            [E(x.name), '<span class="txc">' + E(x.sp.n) + '</span>', '<span class="txc">' + E(x.sec.t) + '</span>', money(x.price), E(st)]
        ];
    });

    const shopBlocks = D.shops.map((sp, i) => {
        const secs = sp.secs.map(sec => {
            const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/);
            const cols = sec.c.map(h => /^(商品|名称|农具)$/.test(h) ? '8.4rem'
                : /^(属性)$/.test(h) ? '2.4rem'
                : /^(售价|价格|费用)$/.test(h) ? '4.8rem' : 'auto');
            const rows = sec.r.map(r => sec.c.map((h, j) =>
                (j === ni) ? '<b class="nw">' + E(r[j]) + '</b>'
                    : (j === pi) ? money(r[j]) : E(r[j])));
            const leftCols = [0];
            sec.c.forEach((h, j) => { if (/说明|作用|英文名|效果|所需材料/.test(h)) leftCols.push(j); });
            return `<h3 class="h3">${E(sec.t)}<span class="txc">　${sec.r.length} 条</span></h3>
            ${tbl(sec.c, rows, { leftFirst: true, left: leftCols, colw: cols, cls: 'rf3shop' })}`;
        }).join('');

        const desc = sp.desc ? `<p class="p">${E(sp.desc)}</p>` : '';
        const fnote = (!sp.secs.length) ? `<p class="p txc">—— 这处是纯设施，没有货架价目 ——</p>` : '';
        const notes = (sp.notes && sp.notes.length) ? `<div class="note">${sp.notes.map(E).join('<br>')}</div>` : '';
        return `
        <h2 class="h2">${i + 1}. ${E(sp.n)}${sp.full && sp.full !== sp.n ? `　<span class="txc">${E(sp.full)}</span>` : ''}${sp.h ? `　<span class="txc">${E(sp.h)}</span>` : ''}</h2>
        ${desc}${fnote}${secs}${notes}`;
    }).join('');

    const facList = fac.map(sp => `<p><b>${E(sp.n)}</b>${sp.full && sp.full !== sp.n ? '　<span class="txc">' + E(sp.full) + '</span>' : ''}${sp.h ? '　<span class="txc">' + E(sp.h) + '</span>' : ''}${sp.desc ? '　' + E(sp.desc) : ''}</p>`).join('');
    const facSec = fac.length ? `
    <h2 class="h2">纯设施（无货架）</h2>
    <p class="p">这 ${fac.length} 处只提供服务或场所，不卖货，所以没有价目表。它们的简介照录：</p>
    <div class="txt-list">${facList}</div>` : '';

    return `
    <h2 class="h2">RF4 的塞尔菲亚镇：${D.shops.length} 处设施，${D.shops.length - fac.length} 家带货${fac.length ? '，' + fac.length + ' 处纯设施' : ''}</h2>
    <p class="p">本页是 biligame《符文工厂4豪华版》城镇店铺商品列表（RF4Stown）、april2016 博客「符文工廠4 商店簡介(鍛治屋)」、guidestrats（Sincerity General Store／Clinic）三源交叉核实后整理出的<b>全部 ${all.length} 条</b>，按店铺、店内小节原样排。5 家店（诚心杂货店、锻造店闲人之家、餐厅伯克利奴厨房、花店康乃馨、医院小纱布）都带货，没有纯设施。</p>
    <p class="p"><b>这些数字是买价，不是卖价。</b>三源都只给商店售价、不给出货价，所以本页<b>不算买进再卖出赚多少</b>——少了一半，算出来的差价都是假的。三源没有的，这里也不补。</p>
    ${stat([
        ['设施', D.shops.length + ' 处'],
        ['带货店', (D.shops.length - fac.length) + ' 家'],
        ['商品行', all.length + ' 条'],
        ['有标价', priced.length + ' 条'],
        ['最贵一件', hi ? money(String(hi.pl)) : dash],
        ['最便宜', lo ? money(String(lo.pl)) : dash],
    ])}

    <h2 class="h2">${D.shops.length} 处一览</h2>
    <p class="p">先看规模：哪家东西最多、最贵的一件在谁家。营业时间照源文——锻造店周日只开到 14:00，杂货店周日只开到 13:30，花店周日只开到 13:00；医院与餐厅周日也营业但时间不同。</p>
    ${tbl(['#', '设施', '营业时间', '条目', '最贵的一件'], spRows, { leftFirst: true, left: [0, 1], colw: ['2.2rem', '10rem', '9rem', '3.8rem', 'auto'], cls: 'rf3shop' })}

    <h2 class="h2">价格的两头：${hi ? E(hi.name) + ' ' + money(String(hi.pl)) : ''}，和最便宜的 ${lo ? money(String(lo.pl)) : ''}</h2>
    <p class="p">全表 ${priced.length} 条有价商品，最贵的和最便宜的差 <b>${hi && lo ? Math.round(hi.pl / lo.pl).toLocaleString('en-US') : 0} 倍</b>：一头是锻造屋的白金披肩／巨锤这类顶级装备，另一头是杂货店 10G 的芜菁种子、医院 80G 的药草。装备是价格天花板，种子、常用药是地板。</p>
    ${tbl(['名次', '商品', '店', '价格'], [
        ['最贵', E(hi.name), E(hi.sp.n), money(String(hi.pl))],
        ['第二', E(hi2.name), E(hi2.sp.n), money(String(hi2.pl))],
        ['最便宜', E(lo.name), E(lo.sp.n), money(String(lo.pl))],
    ], { leftFirst: true, left: [1], colw: ['4.4rem', 'auto', '9.4rem', '6rem'], cls: 'rf3shop' })}
    <div class="key">${hi ? '<b>' + E(hi.name) + '</b>（' + money(String(hi.pl)) + '）是锻造屋王中王阶才解锁的顶级货，要推到浮空帝国城附近才会上架——RF4 最贵的一件卡着王子等级这道锁。' : ''}原表只给买价、不给卖价和属性细节（属性已尽量从鍛治屋源补），所以本站<b>不评价它值不值这个价</b>。</div>

    <h2 class="h2">什么进度能买到什么</h2>
    <p class="p">这张表把 ${all.length} 条按「什么时候上架」重新分一遍。RF4 的进度锁主要是<b>王子等级解锁</b>（武器防具越高级越贵），以及委托箱出货后解锁的种子——但本页多数行没有单列解锁说明，故大量归到「备注」档；种子类标了「初始／委托箱」的可据此判断。</p>
    ${tbl(['上架时点', '条数', '占比', '举例'], [['开局可买（说明空白或「初始」）', (stageCount['开局可买'] || 0) + ' 条', pct(stageCount['开局可买'] || 0), (stageEg['开局可买'] || []).slice(0, 4).join('、')]].concat(stageRows).concat([['原文未单列说明（视作随时可购）', noCol + ' 条', pct(noCol), noColSecs.join('、')]]), { leftFirst: true, left: [0, 3], colw: ['13rem', '4.6rem', '4rem', 'auto'], cls: 'rf3shop' })}
    <div class="key">真正卡进度的还是<b>武器与防具</b>：从初始的阔剑／皮长靴，到王中王阶的白金剑／巨锤／白金披肩，要一路把王子等级练到顶。种子的「委托箱」档要先把对应作物出货过才会在杂货店出现。</div>

    <h2 class="h2">一张表查全部 ${all.length} 条</h2>
    <p class="p">按商品名、店名、小节名或上架时点（如「委托箱」「初始」）搜都行。下面是摊平版，同一件东西在两家店出现就占两行。</p>
    <details class="mon-fold">
        <summary>展开／收起：${all.length} 条总表</summary>
        ${ftableOwn(['商品', '店', '小节', '价格', '上架时点'], ['8.4rem', '8.6rem', '7rem', '4.8rem', 'auto'], allRows, { ph: '输入商品名、店名或「委托箱」', cls: 'rf3shopall' })}
    </details>

    <h2 class="h2">逐店明细</h2>
    <p class="p">下面按<b>店铺</b>原样排，一家店一节，店内再按原文的小节分。表格里的字没改过——价格一律带 G，和源一致。</p>
    ${shopBlocks}

    ${facSec}

    <h2 class="h2">照录不改的几处</h2>
    <div class="txt-list">
        <p><b>武器防具随王子等级解锁</b>——锻造屋的货不是一次性全摆出来，要王子等级（努力的王子／出色的王子／备受信赖的王子／受人爱戴的王子／王中王）逐步解锁，越高级越贵；本页按类别排，没把解锁阶写进每一行。</p>
        <p><b>家具与料理台是「木材＋石材订做」</b>——价格列只记金钱，所需的木材／石材数量写在「所需材料」列，没有并入价格。</p>
        <p><b>价格一律带 G</b>——三源所有价格都写成「1000G」这种带单位的形式，本站不改写法、不去掉 G。</p>
        <p><b>跨源矛盾照录</b>——白金之剑 biligame 与 fandom 记 95730G，april2016 记 957300G（疑似多一位），本页采多数源一致的 95730G。</p>
    </div>
    <div class="note">数据文件 <code>js/rf4shop.js</code>（<code>RF4_SHOP</code>）由 <code>_build_rf4_shop.py</code> 从 biligame RF4Stown、april2016 鍛治屋、guidestrats 三源交叉整理，逐行校验；页面里的所有统计（条数、占比、最贵、最便宜）都是<b>现算</b>，没有一处写死。</div>`;
}

function shopRf5Html() {
    const D = (typeof RF5_SHOP !== 'undefined') ? RF5_SHOP : null;
    if (!D || !D.shops || !D.shops.length) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const money = v => (v == null || v === '') ? dash : (/[GＧ]$/.test(String(v)) ? E(v) : E(v) + 'G');
    const pnum = v => { const m = String(v == null ? '' : v).replace(/[^0-9]/g, ''); return m ? Number(m) : null; };
    const idx = (sec, re) => { for (let i = 0; i < sec.c.length; i++) if (re.test(sec.c[i])) return i; return -1; };

    const all = [];
    D.shops.forEach(sp => sp.secs.forEach(sec => {
        const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/), di = idx(sec, /说明|作用|英文名|解锁|阶段|备注/);
        sec.r.forEach(r => all.push({
            sp, sec, r, di,
            name: ni >= 0 ? r[ni] : r[0],
            price: pi >= 0 ? r[pi] : '',
            pl: pnum(pi >= 0 ? r[pi] : ''),
        }));
    }));

    const priced = all.filter(x => x.pl != null);
    const byP = priced.slice().sort((a, b) => b.pl - a.pl);
    const hi = byP[0], hi2 = byP[1], lo = byP[byP.length - 1];
    const noPrice = all.filter(x => x.pl == null);

    const stageOf = s => {
        const t = String(s || '');
        if (!t) return '开局可买';
        if (/初始|一开始|初期/.test(t)) return '开局可买';
        if (/3 阶|3 扩|通关/.test(t)) return '后期（3 阶／通关）';
        if (/1 扩|1 阶|2 扩|2 阶/.test(t)) return '扩建后（1～2 阶）';
        if (/委托|出货|收获|解锁/.test(t)) return '委托／出货解锁';
        return '备注（材料·分类）';
    };
    const STAGE_ORDER = ['开局可买', '委托／出货解锁', '扩建后（1～2 阶）', '后期（3 阶／通关）', '备注（材料·分类）'];
    const stageCount = {}, stageEg = {};
    let noCol = 0;
    const noColSecs = [];
    all.forEach(x => {
        if (x.di < 0) {
            noCol++;
            const k = x.sp.n + '·' + x.sec.t;
            if (noColSecs.indexOf(k) < 0) noColSecs.push(k);
            return;
        }
        const s = stageOf(x.r[x.di]);
        stageCount[s] = (stageCount[s] || 0) + 1;
        (stageEg[s] = stageEg[s] || []).push(x.name);
    });
    const pct = n => { const v = n / all.length * 100; return (v > 0 && v < 1) ? '<1%' : Math.round(v) + '%'; };
    const stageRows = STAGE_ORDER.filter(s => stageCount[s]).map(s => [s, stageCount[s] + ' 条', pct(stageCount[s]), stageEg[s].slice(0, 4).join('、')]);

    const fac = D.shops.filter(sp => !sp.secs.length);
    const spRows = D.shops.map((sp, i) => {
        let n = 0, mx = null;
        sp.secs.forEach(sec => sec.r.forEach(r => {
            n++;
            const pi = idx(sec, /售价|价格|费用/);
            const v = pi >= 0 ? pnum(r[pi]) : null;
            if (v != null && (!mx || v > mx.v)) mx = { v: v, s: r[idx(sec, /商品|名称|农具/)] };
        }));
        return [String(i + 1), E(sp.n), sp.h ? E(sp.h) : dash, (n ? n + ' 条' : '<span class="txc">纯设施</span>'),
            mx ? '<b>' + E(mx.s) + '</b> ' + money(String(mx.v)) : dash];
    });

    const allRows = all.map(x => {
        const st = x.di >= 0 ? (String(x.r[x.di]).trim() || '—') : '—';
        return [
            [x.name, x.sp.n, x.sec.t, st].join(' ').replace(/"/g, ''),
            [E(x.name), '<span class="txc">' + E(x.sp.n) + '</span>', '<span class="txc">' + E(x.sec.t) + '</span>', money(x.price), E(st)]
        ];
    });

    const shopBlocks = D.shops.map((sp, i) => {
        const secs = sp.secs.map(sec => {
            const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/);
            const cols = sec.c.map(h => /^(商品|名称|农具)$/.test(h) ? '8.4rem'
                : /^(属性)$/.test(h) ? '2.4rem'
                : /^(售价|价格|费用)$/.test(h) ? '4.8rem' : 'auto');
            const rows = sec.r.map(r => sec.c.map((h, j) =>
                (j === ni) ? '<b class="nw">' + E(r[j]) + '</b>'
                    : (j === pi) ? money(r[j]) : E(r[j])));
            const leftCols = [0];
            sec.c.forEach((h, j) => { if (/说明|作用|英文名|效果|所需材料|解锁|阶段|备注|季节|天数/.test(h)) leftCols.push(j); });
            return `<h3 class="h3">${E(sec.t)}<span class="txc">　${sec.r.length} 条</span></h3>
            ${tbl(sec.c, rows, { leftFirst: true, left: leftCols, colw: cols, cls: 'rf3shop' })}`;
        }).join('');

        const desc = sp.desc ? `<p class="p">${E(sp.desc)}</p>` : '';
        const fnote = (!sp.secs.length) ? `<p class="p txc">—— 这处是纯设施，没有货架价目 ——</p>` : '';
        const notes = (sp.notes && sp.notes.length) ? `<div class="note">${sp.notes.map(E).join('<br>')}</div>` : '';
        return `
        <h2 class="h2">${i + 1}. ${E(sp.n)}${sp.full && sp.full !== sp.n ? `　<span class="txc">${E(sp.full)}</span>` : ''}${sp.h ? `　<span class="txc">${E(sp.h)}</span>` : ''}</h2>
        ${desc}${fnote}${secs}${notes}`;
    }).join('');

    const facList = fac.map(sp => `<p><b>${E(sp.n)}</b>${sp.full && sp.full !== sp.n ? '　<span class="txc">' + E(sp.full) + '</span>' : ''}${sp.h ? '　<span class="txc">' + E(sp.h) + '</span>' : ''}${sp.desc ? '　' + E(sp.desc) : ''}</p>`).join('');
    const facSec = fac.length ? `
    <h2 class="h2">纯设施（无货架）</h2>
    <p class="p">这 ${fac.length} 处只提供服务或场所，不卖货，所以没有价目表。它们的简介照录：</p>
    <div class="txt-list">${facList}</div>` : '';

    return `
    <h2 class="h2">RF5 的里格巴斯镇：${D.shops.length} 处设施，全部带货</h2>
    <p class="p">本页是 neoseeker（Serendipity／Flowerstruck）、game8（The Crystalabra／True Strike Smithy／Sweet Hearth）、biligame 中文 wiki（Rigbarth Clinic）、therunefactory fandom 四源交叉核实后整理出的<b>全部 ${all.length} 条</b>，按店铺、店内小节原样排。6 家店（闪亮杂货店、克莱斯卓拉水晶店、斯特赖克锻造屋、里格巴斯诊所、幸せ面包店、花漾花店）都带货，没有纯设施。</p>
    <p class="p"><b>这些数字是买价，不是卖价。</b>四源都只给商店售价、不给出货价，所以本页<b>不算买进再卖出赚多少</b>——少了一半，算出来的差价都是假的。四源没有的，这里也不补。</p>
    ${stat([
        ['设施', D.shops.length + ' 处'],
        ['带货店', (D.shops.length - fac.length) + ' 家'],
        ['商品行', all.length + ' 条'],
        ['有标价', priced.length + ' 条'],
        ['最贵一件', hi ? money(String(hi.pl)) : dash],
        ['最便宜', lo ? money(String(lo.pl)) : dash],
    ])}

    <h2 class="h2">${D.shops.length} 处一览</h2>
    <p class="p">先看规模：哪家东西最多、最贵的一件在谁家。多数店工作日 9:00-18:00、节假日缩短（具体见各店营业时间一行）；诊所的营业时间源未单列，以游戏内为准。</p>
    ${tbl(['#', '设施', '营业时间', '条目', '最贵的一件'], spRows, { leftFirst: true, left: [0, 1], colw: ['2.2rem', '10rem', '11rem', '3.8rem', 'auto'], cls: 'rf3shop' })}

    <h2 class="h2">价格的两头：${hi ? E(hi.name) + ' ' + money(String(hi.pl)) : ''}，和最便宜的 ${lo ? money(String(lo.pl)) : ''}</h2>
    <p class="p">全表 ${priced.length} 条有价商品，最贵的和最便宜的差 <b>${hi && lo ? Math.round(hi.pl / lo.pl).toLocaleString('en-US') : 0} 倍</b>：一头是锻造屋的顶级饰品白金镯（1,020,000G）与魔法耳环（425,000G）、武器混沌刃（186,550G），另一头是锻造屋的阔剑 90G、矛 200G、衬衫 120G。装备是价格天花板，基础农具／衣物是地板。</p>
    ${tbl(['名次', '商品', '店', '价格'], [
        ['最贵', E(hi.name), E(hi.sp.n), money(String(hi.pl))],
        ['第二', E(hi2.name), E(hi2.sp.n), money(String(hi2.pl))],
        ['最便宜', E(lo.name), E(lo.sp.n), money(String(lo.pl))],
    ], { leftFirst: true, left: [1], colw: ['4.4rem', 'auto', '9.4rem', '6rem'], cls: 'rf3shop' })}
    <div class="key">${hi ? '<b>' + E(hi.name) + '</b>（' + money(String(hi.pl)) + '）是锻造屋初始货架上的顶级饰品，但真正把高端货全摆出来靠的是<b>Studio Palmo 的店铺扩建</b>——RF5 的进度锁主要是扩建与委托解锁，而非 RF4 那种王子等级。' : ''}原表只给买价、不给卖价和属性细节，所以本站<b>不评价它值不值这个价</b>。</div>

    <h2 class="h2">什么进度能买到什么</h2>
    <p class="p">这张表把 ${all.length} 条按「什么时候上架」重新分一遍。RF5 的进度锁主要是<b>Studio Palmo 的店铺扩建</b>（1～3 阶）与<b>委托／出货解锁</b>（种子、花草多在出货或完成委托后才上架）；标注「初始」的即开局可买。</p>
    ${tbl(['上架时点', '条数', '占比', '举例'], [['开局可买（说明空白或「初始」）', (stageCount['开局可买'] || 0) + ' 条', pct(stageCount['开局可买'] || 0), (stageEg['开局可买'] || []).slice(0, 4).join('、')]].concat(stageRows).concat([['原文未单列说明（视作随时可购）', noCol + ' 条', pct(noCol), noColSecs.join('、')]]), { leftFirst: true, left: [0, 3], colw: ['13rem', '4.6rem', '4rem', 'auto'], cls: 'rf3shop' })}
    <div class="key">真正卡进度的还是<b>武器与防具</b>：从初始的阔剑／皮靴，到顶级的白金剑／白金镯，要一路把 Studio Palmo 的锻造屋扩建推满；种子类的「委托／出货」档要先把对应作物出货或完成委托才会在杂货店／花店出现。</div>

    <h2 class="h2">一张表查全部 ${all.length} 条</h2>
    <p class="p">按商品名、店名、小节名或上架时点（如「1 扩」「委托」）搜都行。下面是摊平版，同一件东西在两家店出现就占两行。</p>
    <details class="mon-fold">
        <summary>展开／收起：${all.length} 条总表</summary>
        ${ftableOwn(['商品', '店', '小节', '价格', '上架时点'], ['8.4rem', '8.6rem', '7rem', '4.8rem', 'auto'], allRows, { ph: '输入商品名、店名或「1 扩」', cls: 'rf3shopall' })}
    </details>

    <h2 class="h2">逐店明细</h2>
    <p class="p">下面按<b>店铺</b>原样排，一家店一节，店内再按原文的小节分。表格里的字没改过——价格一律带 G，和源一致。</p>
    ${shopBlocks}

    ${facSec}

    <h2 class="h2">照录不改的几处</h2>
    <div class="txt-list">
        <p><b>进度锁是 Studio Palmo 扩建＋委托解锁</b>——RF5 不像 RF4 有王子等级，而是靠找 Palmo 花钱扩建店铺（每店 3 阶），每阶上新货；种子／花草还要先出货或完成委托才会在店中出现。</p>
        <p><b>营养剂价格跨度极大</b>——花店 Formula A 1,200G 到 Love Drink 3,000,000G，照源录入不修正（部分高阶剂确实标价百万级）。</p>
        <p><b>价格一律带 G</b>——四源所有价格都写成「1000G」这类带单位的形式，本站不改写法、不去掉 G。</p>
        <p><b>跨源矛盾照录</b>——水晶里的 Ice Crystal、Electro Crystal 在两源中均漏列单价，标「—」；General's Hoe（将军锄）game8 标 TBD，亦标「—」。诊所「获得过的花草」按草种而异、无统一货架价，标「—」。</p>
    </div>
    <div class="note">数据文件 <code>js/rf5shop.js</code>（<code>RF5_SHOP</code>）由 <code>_build_rf5_shop.py</code> 从 neoseeker、game8、biligame 中文、fandom 四源交叉整理，逐行校验；页面里的所有统计（条数、占比、最贵、最便宜）都是<b>现算</b>，没有一处写死。</div>`;
}

function shopRfoHtml() {
    const D = (typeof RFO_SHOP !== 'undefined') ? RFO_SHOP : null;
    if (!D || !D.shops || !D.shops.length) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const money = v => (v == null || v === '') ? dash : (/[GＧ]$/.test(String(v)) ? E(v) : E(v) + 'G');
    const pnum = v => { const m = String(v == null ? '' : v).replace(/[^0-9]/g, ''); return m ? Number(m) : null; };
    const idx = (sec, re) => { for (let i = 0; i < sec.c.length; i++) if (re.test(sec.c[i])) return i; return -1; };

    const all = [];
    D.shops.forEach(sp => sp.secs.forEach(sec => {
        const ni = idx(sec, /商品|名称/), pi = idx(sec, /售价|价格|费用/), di = idx(sec, /解锁|阶段|备注|说明/);
        sec.r.forEach(r => all.push({ sp, sec, r, di, name: ni >= 0 ? r[ni] : r[0], price: pi >= 0 ? r[pi] : '', pl: pnum(pi >= 0 ? r[pi] : '') }));
    }));

    const priced = all.filter(x => x.pl != null);
    const byP = priced.slice().sort((a, b) => b.pl - a.pl);
    const hi = byP[0], lo = byP[byP.length - 1];
    const fac = D.shops.filter(sp => !sp.secs.length);

    const spRows = D.shops.map((sp, i) => {
        let n = 0, mx = null;
        sp.secs.forEach(sec => { const pi = idx(sec, /售价|价格/); sec.r.forEach(r => { n++; const v = pi >= 0 ? pnum(r[pi]) : null; if (v != null && (!mx || v > mx.v)) mx = { v: v, s: r[idx(sec, /商品|名称/)] }; }); });
        return [String(i + 1), E(sp.n), sp.h ? E(sp.h) : dash, n ? n + ' 条' : '<span class="txc">纯设施</span>', mx ? '<b>' + E(mx.s) + '</b> ' + money(String(mx.v)) : dash];
    });

    const shopBlocks = D.shops.map((sp, i) => {
        const secs = sp.secs.map(sec => {
            const ni = idx(sec, /商品|名称/), pi = idx(sec, /售价|价格/);
            const cols = sec.c.map(h => /^(商品|名称)$/.test(h) ? '10rem' : /^(售价|价格|费用)$/.test(h) ? '4.8rem' : 'auto');
            const rows = sec.r.map(r => sec.c.map((h, j) => (j === ni) ? '<b class="nw">' + E(r[j]) + '</b>' : (j === pi) ? money(r[j]) : E(r[j])));
            const leftCols = [0]; sec.c.forEach((h, j) => { if (/解锁|阶段|备注|说明/.test(h)) leftCols.push(j); });
            return '<h3 class="h3">' + E(sec.t) + '<span class="txc">　' + sec.r.length + ' 条</span></h3>' +
                tbl(sec.c, rows, { leftFirst: true, left: leftCols, colw: cols, cls: 'rf3shop' });
        }).join('');
        const desc = sp.desc ? '<p class="p">' + E(sp.desc) + '</p>' : '';
        const fnote = (!sp.secs.length) ? '<p class="p txc">—— 这处是纯设施／服务，没有货架价目 ——</p>' : '';
        const notes = (sp.notes && sp.notes.length) ? '<div class="note">' + sp.notes.map(E).join('<br>') + '</div>' : '';
        return '<h2 class="h2">' + (i + 1) + '. ' + E(sp.n) + (sp.full && sp.full !== sp.n ? '　<span class="txc">' + E(sp.full) + '</span>' : '') + (sp.h ? '　<span class="txc">' + E(sp.h) + '</span>' : '') + '</h2>' + desc + fnote + secs + notes;
    }).join('');

    return '<h2 class="h2">海洋的芬尼斯岛：' + D.shops.length + ' 处设施</h2>' +
        '<p class="p">本页按 GameFAQs 商店指南与 freyashawk 攻略交叉核实，整理出海洋城镇全部商店的<b>' + all.length + ' 条</b>买价，按店铺、店内小节原样排。海洋的店少而集中：杂货店、达达罗斯铁匠铺、教会诊所三家带货，另有节庆日的广场摊位卖符文能力（无逐项标价，作说明）。</p>' +
        '<p class="p"><b>这些数字是买价，不是卖价。</b>源只给商店售价、不给出货价。海洋的货随剧情分阶段解锁（初始 → 春季岛 → 土之祠 → 火之祠），同件物品后期可能调价，已在「解锁」列注明。</p>' +
        stat([['设施', D.shops.length + ' 处'], ['带货店', (D.shops.length - fac.length) + ' 家'], ['商品行', all.length + ' 条'], ['有标价', priced.length + ' 条'], ['最贵一件', hi ? money(String(hi.pl)) : dash], ['最便宜', lo ? money(String(lo.pl)) : dash]]) +
        '<h2 class="h2">' + D.shops.length + ' 处一览</h2>' +
        '<p class="p">先看规模：哪家东西最多、最贵的一件在谁家。</p>' +
        tbl(['#', '设施', '营业时间', '条目', '最贵的一件'], spRows, { leftFirst: true, left: [0, 1], colw: ['2.2rem', '11rem', '12rem', '3.8rem', 'auto'], cls: 'rf3shop' }) +
        '<h2 class="h2">逐店明细</h2>' +
        '<p class="p">下面按<b>店铺</b>原样排，一家店一节，店内再按小节分。表格里的字没改过——价格一律带 G，和源一致。</p>' +
        shopBlocks +
        '<h2 class="h2">照录不改的几处</h2>' +
        '<div class="txt-list">' +
        '<p><b>只记买价</b>——源只给商店售价、不给出货价，本站不补卖价、不算差价。</p>' +
        '<p><b>阶段解锁</b>——本作商店货按剧情推进分档（初始／春季岛／土之祠／火之祠），「解锁」列照源标注；耳环、吊坠等后期调价也照录。</p>' +
        '<p><b>广场摊位无标价</b>——Joe 的符文能力按武器种类分项、无统一货架价，留作纯设施说明，不臆造数字。</p>' +
        '</div>' +
        '<div class="note">数据文件 <code>js/rfoshop.js</code>（<code>RFO_SHOP</code>）由 <code>_build_rfo_shop.py</code> 从 GameFAQs Store Guide 与 freyashawk 攻略交叉整理，逐行校验；页面统计（条数、最贵、最便宜）均为<b>现算</b>。</div>';
}

function shopRffHtml() {
    const D = (typeof RFF_SHOP !== 'undefined') ? RFF_SHOP : null;
    if (!D || !D.shops || !D.shops.length) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const money = v => (v == null || v === '') ? dash : (/[GＧ]$/.test(String(v)) ? E(v) : E(v) + 'G');
    const pnum = v => { const m = String(v == null ? '' : v).replace(/[^0-9]/g, ''); return m ? Number(m) : null; };
    const idx = (sec, re) => { for (let i = 0; i < sec.c.length; i++) if (re.test(sec.c[i])) return i; return -1; };

    const all = [];
    D.shops.forEach(sp => sp.secs.forEach(sec => {
        const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/), di = idx(sec, /说明|作用|英文名|解锁|阶段|备注/);
        sec.r.forEach(r => all.push({
            sp, sec, r, di,
            name: ni >= 0 ? r[ni] : r[0],
            price: pi >= 0 ? r[pi] : '',
            pl: pnum(pi >= 0 ? r[pi] : ''),
        }));
    }));

    const priced = all.filter(x => x.pl != null);
    const byP = priced.slice().sort((a, b) => b.pl - a.pl);
    const hi = byP[0], hi2 = byP[1], lo = byP[byP.length - 1];
    const noPrice = all.filter(x => x.pl == null);

    const stageOf = s => {
        const t = String(s || '');
        if (!t || /初始/.test(t)) return '开局可买';
        if (/绿废墟/.test(t)) return '绿废墟 boss 后';
        if (/熔岩废墟/.test(t)) return '熔岩废墟 boss 后';
        if (/FP/.test(t)) return '好感度（FP）门';
        return '其他';
    };
    const STAGE_ORDER = ['开局可买', '绿废墟 boss 后', '熔岩废墟 boss 后', '好感度（FP）门', '其他'];
    const stageCount = {}, stageEg = {};
    let noCol = 0;
    const noColSecs = [];
    all.forEach(x => {
        if (x.di < 0) {
            noCol++;
            const k = x.sp.n + '·' + x.sec.t;
            if (noColSecs.indexOf(k) < 0) noColSecs.push(k);
            return;
        }
        const s = stageOf(x.r[x.di]);
        stageCount[s] = (stageCount[s] || 0) + 1;
        (stageEg[s] = stageEg[s] || []).push(x.name);
    });
    const pct = n => { const v = n / all.length * 100; return (v > 0 && v < 1) ? '<1%' : Math.round(v) + '%'; };
    const stageRows = STAGE_ORDER.filter(s => stageCount[s]).map(s => [s, stageCount[s] + ' 条', pct(stageCount[s]), stageEg[s].slice(0, 4).join('、')]);

    const fac = D.shops.filter(sp => !sp.secs.length);
    const spRows = D.shops.map((sp, i) => {
        let n = 0, mx = null;
        sp.secs.forEach(sec => sec.r.forEach(r => {
            n++;
            const pi = idx(sec, /售价|价格|费用/);
            const v = pi >= 0 ? pnum(r[pi]) : null;
            if (v != null && (!mx || v > mx.v)) mx = { v: v, s: r[idx(sec, /商品|名称|农具/)] };
        }));
        return [String(i + 1), E(sp.n), sp.h ? E(sp.h) : dash, (n ? n + ' 条' : '<span class="txc">纯设施</span>'),
            mx ? '<b>' + E(mx.s) + '</b> ' + money(String(mx.v)) : dash];
    });

    const allRows = all.map(x => {
        const st = x.di >= 0 ? (String(x.r[x.di]).trim() || '—') : '—';
        return [
            [x.name, x.sp.n, x.sec.t, st].join(' ').replace(/"/g, ''),
            [E(x.name), '<span class="txc">' + E(x.sp.n) + '</span>', '<span class="txc">' + E(x.sec.t) + '</span>', money(x.price), E(st)]
        ];
    });

    const shopBlocks = D.shops.map((sp, i) => {
        const secs = sp.secs.map(sec => {
            const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/);
            const cols = sec.c.map(h => /^(商品|名称|农具)$/.test(h) ? '8.4rem'
                : /^(属性)$/.test(h) ? '2.4rem'
                : /^(售价|价格|费用)$/.test(h) ? '4.8rem' : 'auto');
            const rows = sec.r.map(r => sec.c.map((h, j) =>
                (j === ni) ? '<b class="nw">' + E(r[j]) + '</b>'
                    : (j === pi) ? money(r[j]) : E(r[j])));
            const leftCols = [0];
            sec.c.forEach((h, j) => { if (/说明|作用|英文名|效果|所需材料|解锁|阶段|备注|季节|天数/.test(h)) leftCols.push(j); });
            return `<h3 class="h3">${E(sec.t)}<span class="txc">　${sec.r.length} 条</span></h3>
            ${tbl(sec.c, rows, { leftFirst: true, left: leftCols, colw: cols, cls: 'rf3shop' })}`;
        }).join('');

        const desc = sp.desc ? `<p class="p">${E(sp.desc)}</p>` : '';
        const fnote = (!sp.secs.length) ? `<p class="p txc">—— 这处是纯设施，没有货架价目 ——</p>` : '';
        const notes = (sp.notes && sp.notes.length) ? `<div class="note">${sp.notes.map(E).join('<br>')}</div>` : '';
        return `
        <h2 class="h2">${i + 1}. ${E(sp.n)}${sp.full && sp.full !== sp.n ? `　<span class="txc">${E(sp.full)}</span>` : ''}${sp.h ? `　<span class="txc">${E(sp.h)}</span>` : ''}</h2>
        ${desc}${fnote}${secs}${notes}`;
    }).join('');

    const facList = fac.map(sp => `<p><b>${E(sp.n)}</b>${sp.full && sp.full !== sp.n ? '　<span class="txc">' + E(sp.full) + '</span>' : ''}${sp.h ? '　<span class="txc">' + E(sp.h) + '</span>' : ''}${sp.desc ? '　' + E(sp.desc) : ''}</p>`).join('');
    const facSec = fac.length ? `
    <h2 class="h2">纯设施（无货架）</h2>
    <p class="p">这 ${fac.length} 处只提供服务或场所，不卖货，所以没有价目表。它们的简介照录：</p>
    <div class="txt-list">${facList}</div>` : '';

    return `
    <h2 class="h2">边境的 Trampoli 镇：${D.shops.length} 处设施，${D.shops.length - fac.length} 家带货</h2>
    <p class="p">本页是 runefrontier 维基 Shops 页（runefrontier.fandom.com/wiki/Shops；2026-11 经搜索缓存核对）整理出的<b>全部 ${all.length} 条</b>，按店铺、店内小节原样排。7 家店（丹尼杂货、Damascus 锻冶屋、Snowstyle 酒场、Erik 种子店、Rune Archives 图书馆、Materia、Lara 教会药房）都带货，没有纯设施。</p>
    <p class="p"><b>这些数字是买价，不是卖价。</b>维基只给商店售价、不给出货价，所以本页<b>不算买进再卖出赚多少</b>——少了一半，算出来的差价都是假的。维基没有的，这里也不补。</p>
    ${stat([
        ['设施', D.shops.length + ' 处'],
        ['带货店', (D.shops.length - fac.length) + ' 家'],
        ['商品行', all.length + ' 条'],
        ['有标价', priced.length + ' 条'],
        ['最贵一件', hi ? money(String(hi.pl)) : dash],
        ['最便宜', lo ? money(String(lo.pl)) : dash],
    ])}

    <h2 class="h2">${D.shops.length} 处一览</h2>
    <p class="p">先看规模：哪家东西最多、最贵的一件在谁家。多数店工作日 9:00-18:00（酒场傍晚才开、Rune Archives 时间极不规律），具体见各店营业时间一行。</p>
    ${tbl(['#', '设施', '营业时间', '条目', '最贵的一件'], spRows, { leftFirst: true, left: [0, 1], colw: ['2.2rem', '10rem', '11rem', '3.8rem', 'auto'], cls: 'rf3shop' })}

    <h2 class="h2">价格的两头：${hi ? E(hi.name) + ' ' + money(String(hi.pl)) : ''}，和最便宜的 ${lo ? money(String(lo.pl)) : ''}</h2>
    <p class="p">全表 ${priced.length} 条有价商品，最贵的和最便宜的差 <b>${hi && lo ? Math.round(hi.pl / lo.pl).toLocaleString('en-US') : 0} 倍</b>：一头是 Rune Archives 的顶级配方书（Happy Toys 30000G）与 Materia 的进阶花草（Emeryflower 26000G、各色水晶 22000G），另一头是教会药房的草（20G）与锻冶屋的基础武器（500G）。花草与水晶是价格天花板，基础作物种子与草是地板。</p>
    ${tbl(['名次', '商品', '店', '价格'], [
        ['最贵', E(hi.name), E(hi.sp.n), money(String(hi.pl))],
        ['第二', E(hi2.name), E(hi2.sp.n), money(String(hi2.pl))],
        ['最便宜', E(lo.name), E(lo.sp.n), money(String(lo.pl))],
    ], { leftFirst: true, left: [1], colw: ['4.4rem', 'auto', '9.4rem', '6rem'], cls: 'rf3shop' })}
    <div class="key">真正把高端货全摆出来靠的是<b>剧情推进</b>——锻冶屋的 Lv3/Lv5 元素水晶、Rune Archives 的进阶配方书都要先击败绿废墟／熔岩废墟的 boss；Materia 与教会药房则要等 Rosetta、Lara 到镇才开。原表只给买价、不给卖价和属性细节，所以本站<b>不评价它值不值这个价</b>。</div>

    <h2 class="h2">什么进度能买到什么</h2>
    <p class="p">这张表把 ${all.length} 条按「什么时候上架」重新分一遍。边境的进度锁主要有三类：<b>废墟 boss</b>（绿废墟／熔岩废墟，对应上级水晶与进阶配方书）、<b>好感度（FP）</b>（教会药房的进阶花草）、以及<b>角色到镇</b>（Materia、药房随剧情开）；标注「初始」的即开局可买。</p>
    ${tbl(['上架时点', '条数', '占比', '举例'], [['开局可买（说明为「初始」）', (stageCount['开局可买'] || 0) + ' 条', pct(stageCount['开局可买'] || 0), (stageEg['开局可买'] || []).slice(0, 4).join('、')]].concat(stageRows).concat([['原文未单列说明（视作随时可购）', noCol + ' 条', pct(noCol), noColSecs.join('、')]]), { leftFirst: true, left: [0, 3], colw: ['13rem', '4.6rem', '4rem', 'auto'], cls: 'rf3shop' })}
    <div class="key">真正卡进度的还是<b>武器与配方书</b>：从初始的阔剑／基础配方书，到顶级的 Lv5 水晶与 Happy Toys（30000G），要一路把绿废墟、熔岩废墟的 boss 推过去；教会药房的进阶花草还要先把对应角色的 FP 刷上去。</div>

    <h2 class="h2">一张表查全部 ${all.length} 条</h2>
    <p class="p">按商品名、店名、小节名或上架时点（如「绿废墟」「3FP」）搜都行。下面是摊平版，同一件东西在两家店出现就占两行。</p>
    <details class="mon-fold">
        <summary>展开／收起：${all.length} 条总表</summary>
        ${ftableOwn(['商品', '店', '小节', '价格', '上架时点'], ['8.4rem', '8.6rem', '7rem', '4.8rem', 'auto'], allRows, { ph: '输入商品名、店名或「绿废墟」', cls: 'rf3shopall' })}
    </details>

    <h2 class="h2">逐店明细</h2>
    <p class="p">下面按<b>店铺</b>原样排，一家店一节，店内再按原文的小节分。表格里的字没改过——价格一律带 G，和源一致。</p>
    ${shopBlocks}

    ${facSec}

    <h2 class="h2">照录不改的几处</h2>
    <div class="txt-list">
        <p><b>进度锁是废墟 boss＋FP＋角色到镇</b>——边境不像 RF5 有 Studio Palmo 扩建，而是靠打通绿废墟／熔岩废墟解锁上级水晶与进阶配方书，靠刷 FP 解锁教会药房花草，靠 Rosetta／Lara 到镇开 Materia 与药房。</p>
        <p><b>水晶价格跨度大</b>——Lv1 元素水晶 2500G 到 Lv5 4500G，照源录入不修正。</p>
        <p><b>价格一律带 G</b>——维基所有价格都写成「500G」这类带单位的形式，本站不改写法、不去掉 G。</p>
        <p><b>单源未交叉</b>——本页仅 runefrontier 维基 Shops 页一源（2026-11 经搜索缓存核对），未做多源交叉；若与游戏内实机有出入，以游戏内为准，本站不臆测补价。</p>
    </div>
    <div class="note">数据文件 <code>js/rffshop.js</code>（<code>RFF_SHOP</code>）由 <code>_build_rff_shop.py</code> 从 runefrontier 维基 Shops 页整理，逐行校验；页面里的所有统计（条数、占比、最贵、最便宜）都是<b>现算</b>，没有一处写死。</div>`;
}

function shopRf3Html() {
    const D = (typeof RF3_SHOP !== 'undefined') ? RF3_SHOP : null;
    if (!D || !D.shops || !D.shops.length) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const money = v => (v == null || v === '') ? dash : (/[GＧ]$/.test(String(v)) ? E(v) : E(v) + 'G');
    const pnum = v => { const m = String(v == null ? '' : v).replace(/[^0-9]/g, ''); return m ? Number(m) : null; };
    const idx = (sec, re) => { for (let i = 0; i < sec.c.length; i++) if (re.test(sec.c[i])) return i; return -1; };

    /* 摊平：每条记下所属店与小节，价格列按各节自己的表头认 */
    const all = [];
    D.shops.forEach(sp => sp.secs.forEach(sec => {
        const ni = idx(sec, /商品|名称/), pi = idx(sec, /售价|价格/), di = idx(sec, /说明|作用/);
        sec.r.forEach(r => all.push({
            sp, sec, r, di,
            name: ni >= 0 ? r[ni] : r[0],
            price: pi >= 0 ? r[pi] : '',
            pl: pnum(pi >= 0 ? r[pi] : ''),
        }));
    }));

    const priced = all.filter(x => x.pl != null);
    const byP = priced.slice().sort((a, b) => b.pl - a.pl);
    const hi = byP[0], hi2 = byP[1], lo = byP[byP.length - 1];
    const noPrice = all.filter(x => x.pl == null);

    /* 解锁门槛：说明列里那句「初始商品／某某通过后出现／通关后」就是进度条 */
    const stageOf = s => {
        const t = String(s || '');
        if (!t) return '';
        if (/通关后/.test(t)) return '通关后';
        if (/茵瓦埃尔河/.test(t)) return '茵瓦埃尔河通过后';
        if (/奥德华山谷/.test(t)) return '奥德华山谷通过后';
        if (/索鲁·提拉诺沙漠/.test(t)) return '索鲁·提拉诺沙漠通过后';
        if (/普利贝拉之森/.test(t)) return '普利贝拉之森通过后';
        if (/大树成长后/.test(t)) return '大树成长后';
        if (/二楼/.test(t)) return '自宅二楼出现后';
        if (/菜刀|煎锅|搅拌器/.test(t)) return '买齐三件料理道具后';
        if (/免费领取/.test(t)) return '免费领取';
        if (/出货过之后随机出售/.test(t)) return '出货过之后随机出售';
        return '其他';
    };
    const STAGE_ORDER = ['普利贝拉之森通过后', '索鲁·提拉诺沙漠通过后', '奥德华山谷通过后', '茵瓦埃尔河通过后',
        '通关后', '大树成长后', '自宅二楼出现后', '买齐三件料理道具后', '免费领取', '出货过之后随机出售', '其他'];
    const stageCount = {}, stageEg = {}, stageInit = { v: 0 }, stageNoCol = { v: 0 };
    all.forEach(x => {
        if (x.di < 0) { stageNoCol.v++; return; }
        const s = stageOf(x.r[x.di]);
        if (!s) { stageNoCol.v++; return; }
        if (/^(初始商品|初期商品)$/.test(String(x.r[x.di]).trim())) { stageInit.v++; return; }
        stageCount[s] = (stageCount[s] || 0) + 1;
        (stageEg[s] = stageEg[s] || []).push(x.name);
    });
    const pct = n => { const v = n / all.length * 100; return (v > 0 && v < 1) ? '&lt;1%' : Math.round(v) + '%'; };
    const stageRows = STAGE_ORDER.filter(s => stageCount[s]).map(s => [s, stageCount[s] + ' 条',
        pct(stageCount[s]), stageEg[s].slice(0, 4).join('、')]);
    /* 原文没有说明列的那几张表：现算小节名，不写死 */
    const noColSecs = [];
    all.forEach(x => { const k = x.sp.n + '·' + x.sec.t; if (x.di < 0 && noColSecs.indexOf(k) < 0) noColSecs.push(k); });
    /* 开局就能买的 88 条摊在哪几家店 */
    const initByShop = {};
    all.forEach(x => {
        if (x.di < 0) return;
        if (!/^(初始商品|初期商品)$/.test(String(x.r[x.di]).trim())) return;
        const k = x.sp.n; initByShop[k] = (initByShop[k] || 0) + 1;
    });
    const initTop = Object.keys(initByShop).sort((a, b) => initByShop[b] - initByShop[a])[0];

    /* 「初始／初期商品」这一档原文有两种写法，是同一件事，先点出来 */
    const initVariants = {};
    all.forEach(x => {
        if (x.di < 0) return;
        const t = String(x.r[x.di]).trim();
        if (/^(初始商品|初期商品)$/.test(t)) initVariants[t] = (initVariants[t] || 0) + 1;
    });
    const initKeys = Object.keys(initVariants);

    /* 每店：条目数、最贵一件 */
    const spRows = D.shops.map((sp, i) => {
        let n = 0, mx = null;
        sp.secs.forEach(sec => sec.r.forEach(r => {
            n++;
            const pi = idx(sec, /售价|价格/);
            const v = pi >= 0 ? pnum(r[pi]) : null;
            if (v != null && (!mx || v > mx.v)) mx = { v: v, s: r[idx(sec, /商品|名称/)] };
        }));
        return [String(i + 1), sp.n, sp.h || dash, n + ' 条', mx ? '<b>' + E(mx.s) + '</b> ' + money(String(mx.v)) : dash];
    });

    /* 全表（可搜）：店 / 小节 / 商品 / 价格 / 门槛 */
    const allRows = all.map(x => {
        const st = x.di >= 0 ? (String(x.r[x.di]).trim().replace(/^(初始商品|初期商品)$/, '开局就有') || '—') : '—';
        return [
            [x.name, x.sp.n, x.sec.t, st].join(' ').replace(/"/g, ''),
            [E(x.name), '<span class="txc">' + E(x.sp.n) + '</span>', '<span class="txc">' + E(x.sec.t) + '</span>',
                money(x.price), E(st)]
        ];
    });

    /* 逐店明细 */
    const shopBlocks = D.shops.map((sp, i) => {
        const secs = sp.secs.map(sec => {
            const ni = idx(sec, /商品|名称/), pi = idx(sec, /售价|价格/);
            const cols = sec.c.map(h => /说明|作用/.test(h) ? 'auto' : /^(商品|名称)$/.test(h) ? '8.4rem'
                : /季节/.test(h) ? '3rem' : /售价|价格/.test(h) ? '4.8rem'
                    : /木材|资材/.test(h) ? '4.6rem' : /对应武器/.test(h) ? '5.4rem'
                        : /友好度/.test(h) ? '5.6rem' : 'auto');
            const rows = sec.r.map(r => sec.c.map((h, j) =>
                (j === ni) ? '<b class="nw">' + E(r[j]) + '</b>'
                    : (j === pi) ? money(r[j])
                        : (/木材|资材/.test(h) && r[j]) ? E(r[j]) : E(r[j])));
            const leftCols = [0];
            sec.c.forEach((h, j) => { if (/说明|作用/.test(h)) leftCols.push(j); });
            return `<h3 class="h3">${E(sec.t)}<span class="txc">　${sec.r.length} 条</span></h3>
            ${tbl(sec.c, rows, { leftFirst: true, left: leftCols, colw: cols, cls: 'rf3shop' })}`;
        }).join('');

        const subs = (sp.subs && sp.subs.length) ? `
            <h3 class="h3">这栋楼里的 ${sp.subs.length} 处（含本店）</h3>
            <p class="p">原文把旅馆与楼里这 ${sp.subs.length} 处并排写在同一节。<b>只有符文技能店有价目表</b>（上面那张），其余几处只写了在哪儿、卖什么。第一行就是本店所在的露天浴场，营业时间到 22 点，<b>比镇上那几家 18 点关门的晚四个钟头</b>。</p>
            <div class="txt-list">${sp.subs.map(x => '<p><b>' + E(x.n) + '</b>' +
                (x.h ? '　<span class="txc">' + E(x.h) + '</span>' : '') +
                (x.note ? '　' + E(x.note) : '') + '</p>').join('')}</div>` : '';

        const extra = sp.extra ? `
            <h3 class="h3">${E(sp.extra.t)}</h3>
            ${tbl(sp.extra.c, sp.extra.r.map(r => r.map(E)), { leftFirst: true, left: [0, 1], colw: ['5.4rem', 'auto'], cls: 'rf3shop' })}` : '';

        const notes = (sp.notes && sp.notes.length) ? `
            <div class="note">${sp.notes.map(E).join('<br>')}</div>` : '';

        return `
        <h2 class="h2">${i + 1}. ${E(sp.n)}${sp.h ? `　<span class="txc">${E(sp.h)}</span>` : ''}</h2>
        ${secs}${subs}${extra}${notes}`;
    }).join('');

    return `
    <h2 class="h2">3 代的八家店，价目全在这一页</h2>
    <p class="p">本页是《符文工房3全攻略》（NW 旅团 qisiwole）「镇内各店铺」那一章的<b>全部 ${all.length} 条</b>，外加旅馆里那张神签表 ${D.shops[6] && D.shops[6].extra ? D.shops[6].extra.r.length : 0} 档。八家店分别是花店、杂货屋、锻冶屋、魔法医院、艾莉莎的流行商店、食堂、旅馆（含楼里四处子铺）与钓鱼池。</p>
    <p class="p"><b>这些数字是买价，不是卖价。</b>本站的 3 代物品一览没有价格列，两边对不上，所以本页<b>不算「买进再卖出赚多少」</b>——少了卖价那一半，算出来的差价都是假的。原文没有的东西，这里也不补。</p>
    ${stat([
        ['商店', D.shops.length + ' 家'],
        ['商品行', all.length + ' 条'],
        ['有标价', priced.length + ' 条'],
        ['最贵一件', hi ? money(String(hi.pl)) : dash],
        ['最便宜', lo ? money(String(lo.pl)) : dash],
    ])}

    <h2 class="h2">八家店一览</h2>
    <p class="p">先看规模：哪家店东西最多、最贵的一件在谁家。营业时间照原文，<b>艾莉莎的店一周只开三天</b>，其余七家天天开。</p>
    ${tbl(['#', '店', '营业时间', '条目', '最贵的一件'], spRows, { leftFirst: true, left: [0, 1], colw: ['2.2rem', '11rem', '9rem', '3.8rem', 'auto'], cls: 'rf3shop' })}

    <h2 class="h2">价格的两头：${hi ? E(hi.name) + ' ' + money(String(hi.pl)) : ''}，和一件 8G 的枯草</h2>
    <p class="p">全表 ${priced.length} 条有价商品，最贵的和最便宜的差 <b>${hi && lo ? Math.round(hi.pl / lo.pl).toLocaleString('en-US') : 0} 倍</b>：一头是锻冶屋饰品柜里的一枚戒指，另一头是花店里成把卖的枯草。这两样都不是消耗品，价格差到这个地步，说明<b>3 代的饰品与花草根本不是同一套定价逻辑</b>。</p>
    ${tbl(['名次', '商品', '店', '价格'], [
        ['最贵', E(hi.name), E(hi.sp.n), money(String(hi.pl))],
        ['第二', E(hi2.name), E(hi2.sp.n), money(String(hi2.pl))],
        ['最便宜', E(lo.name), E(lo.sp.n), money(String(lo.pl))],
    ], { leftFirst: true, left: [1], colw: ['4.4rem', 'auto', '9.4rem', '6rem'], cls: 'rf3shop' })}
    <div class="key">${hi ? '<b>' + E(hi.name) + '</b>（' + money(String(hi.pl)) + '）比第二名贵出 ' + (hi2 ? Math.round(hi.pl / hi2.pl * 10) / 10 : 0) + ' 倍，它就在锻冶屋的饰品柜里。' : ''}原表只给价格、不给效果说明，所以本站<b>不评价它值不值这个价</b>——要对照属性，去「防具」页看——那一页名叫防具，实际是把防具与饰品一起收的（3 代 108 件）。另有 <b>${noPrice.length} 条没标价</b>：${noPrice.map(x => E(x.name)).filter((v, i, a) => a.indexOf(v) === i).join('、')}，原文那一格本来就是空的。</div>

    <h2 class="h2">什么进度能买到什么</h2>
    <p class="p">这张表是本页最该先看的：把 ${all.length} 条按「什么时候上架」重新分一遍，就知道<b>开局能买的其实很少，大半要等剧情</b>。原文的档位写法照录，没有合并。</p>
    ${tbl(['上架时点', '条数', '占比', '举例'], [
        ['开局就有' + (initKeys.length > 1 ? '（「' + initKeys.join('／') + '」两种写法）' : ''), stageInit.v + ' 条',
            pct(stageInit.v),
            all.filter(x => x.di >= 0 && /^(初始商品|初期商品)$/.test(String(x.r[x.di]).trim())).slice(0, 4).map(x => E(x.name)).join('、')],
    ].concat(stageRows).concat([['表里没有说明列', stageNoCol.v + ' 条',
        pct(stageNoCol.v), noColSecs.join('、')]]), { leftFirst: true, left: [0, 3], colw: ['11rem', '4.6rem', '4rem', 'auto'], cls: 'rf3shop' })}
    <p class="p">开局那一档共 <b>${stageInit.v} 条</b>（${pct(stageInit.v)}），摊到各店是：${Object.keys(initByShop).sort((a, b) => initByShop[b] - initByShop[a]).map(k => '<b>' + E(k) + '</b> ' + initByShop[k] + ' 条').join('、')}。锻冶屋这一档里剑、盾、六种农具全都有，所以<b>3 代开局不缺工具，缺的是钱和后面的剧情</b>——剩下 ${all.length - stageInit.v - stageNoCol.v} 条全被主线进度锁着。</p>
    <div class="key">顺序就是原文出现剧情的顺序：<b>普利贝拉之森 → 索鲁·提拉诺沙漠 → 奥德华山谷 → 茵瓦埃尔河 → 通关后</b>。<b>「出货过之后随机出售」那一档是另一套机制</b>——不是进度，是「你先卖过一次，店里才会摆出来」，${stageCount['出货过之后随机出售'] || 0} 条都在这一档上，花店那 ${D.shops[0].secs[2] ? D.shops[0].secs[2].r.length : 0} 种花全在里面。</div>

    <h2 class="h2">一张表查全部 ${all.length} 条</h2>
    <p class="p">按商品名、店名、小节名或上架时点搜都行。下面是摊平版，同一件东西在两家店出现就占两行。</p>
    <details class="mon-fold">
        <summary>展开／收起：${all.length} 条总表</summary>
        ${ftableOwn(['商品', '店', '小节', '价格', '上架时点'], ['9rem', '8.6rem', '7rem', '4.8rem', 'auto'], allRows, { ph: '输入商品名、店名或「通关后」', cls: 'rf3shopall' })}
    </details>

    <h2 class="h2">逐店明细</h2>
    <p class="p">下面按<b>原文的店序</b>原样排，一家店一节，店内再按原文的小节分。表格里的字没改过——原文写「售价 300」就是 300，写「15000G」就带 G，两种写法都留着。</p>
    ${shopBlocks}

    <h2 class="h2">照录不改的几处</h2>
    <p class="p">下面这些是原表的写法，看着别扭但不是本站打错，一律没动：</p>
    <div class="txt-list">
        <p><b>「爆弓单瓜种子」</b>——原文如此拆字，一般写作「爆弹瓜」。</p>
        <p><b>「水场草种子」</b>——站内物品一览里这一件叫「水生草的种子」，两边是同一件东西，本页照源。</p>
        <p><b>「使用尖尖碰碰拳（大误）」</b>——括注是原作者的自嘲，一起抄下来了。</p>
        <p><b>「似乎是随机出现……清单未整理（或者说无从整理囧）」</b>——锻冶屋的「掘出物」那一栏原文就没给清单，所以本页也没有那张表。</p>
        <p><b>「如果哪位买到了火龙之鳞的话，请PM本人……」</b>——咲夜土产店那条说明的原话。</p>
        <p><b>价格格留空的</b>——烹饪台（说明写「免费领取」）与五条「建造饲育小屋」（一条本体 ＋ 四条「（增筑）」），原文价格栏是空的，本页显示「—」而不是补 0。</p>
        <p><b>「初始商品」与「初期商品」</b>——同一份资料里两种写法，花店／杂货屋／锻冶屋／艾莉莎用前者，魔法医院用后者，本页没统一。</p>
        <p><b>「指环」与「戒指」、「手环」与「手镯」</b>——商店表写「紫水晶指环」「绿宝石指环」「海蓝宝石指环」「水之指环」「钻石指环」「白金手环」，站内防具页同一批东西写作「戒指」「手镯」。这两组是同一个词的不同译法，搜的时候换个词再试。其余对不上的名字（皮革靴、飘飘凉鞋、手编帽子、魔斗咒符等）本站<b>没逐条核过</b>，不写结论。</p>
    </div>
    <div class="note">数据文件 <code>js/rf3shop.js</code>（<code>RF3_SHOP</code>）由 <code>_build_rf3_shop.py</code> 按原文行区间切出，逐行校验列数；页面里的所有统计（条数、占比、最贵、最便宜）都是<b>现算</b>，没有一处写死。</div>`;
}

function shopRf1Html() {
    const D = (typeof RF1_SHOP !== 'undefined') ? RF1_SHOP : null;
    if (!D || !D.shops || !D.shops.length) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const money = v => (v == null || v === '') ? dash : (/[GＧ]$/.test(String(v)) ? E(v) : E(v) + 'G');
    const pnum = v => { const m = String(v == null ? '' : v).replace(/[^0-9]/g, ''); return m ? Number(m) : null; };
    const idx = (sec, re) => { for (let i = 0; i < sec.c.length; i++) if (re.test(sec.c[i])) return i; return -1; };

    /* 摊平：每条记下所属店与小节，价格列按各节自己的表头认（售价／费用都是价格） */
    const all = [];
    D.shops.forEach(sp => sp.secs.forEach(sec => {
        const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/), di = idx(sec, /说明|作用/);
        sec.r.forEach(r => all.push({
            sp, sec, r, di,
            name: ni >= 0 ? r[ni] : r[0],
            price: pi >= 0 ? r[pi] : '',
            pl: pnum(pi >= 0 ? r[pi] : ''),
        }));
    }));

    const priced = all.filter(x => x.pl != null);
    const byP = priced.slice().sort((a, b) => b.pl - a.pl);
    const hi = byP[0], hi2 = byP[1], lo = byP[byP.length - 1];
    const noPrice = all.filter(x => x.pl == null);

    /* 上架时点：说明列里的「XX击破后／通关后／春限定／种子」就是进度条 */
    const stageOf = s => {
        const t = String(s || '');
        if (!t) return '开局可买';
        if (/开始即可|一开始|初期/.test(t)) return '开局可买';
        if (/通关后/.test(t)) return '通关后';
        if (/击破后/.test(t)) return '剧情击破后';
        if (/限定|种子/.test(t)) return '季节／种子';
        return '备注（尺寸·增筑·分类）';
    };
    const STAGE_ORDER = ['开局可买', '季节／种子', '剧情击破后', '通关后', '备注（尺寸·增筑·分类）'];
    const stageCount = {}, stageEg = {};
    let noCol = 0;
    const noColSecs = [];
    all.forEach(x => {
        if (x.di < 0) {
            noCol++;
            const k = x.sp.n + '·' + x.sec.t;
            if (noColSecs.indexOf(k) < 0) noColSecs.push(k);
            return;
        }
        const s = stageOf(x.r[x.di]);
        stageCount[s] = (stageCount[s] || 0) + 1;
        (stageEg[s] = stageEg[s] || []).push(x.name);
    });
    const pct = n => { const v = n / all.length * 100; return (v > 0 && v < 1) ? '<1%' : Math.round(v) + '%'; };
    const stageRows = STAGE_ORDER.filter(s => stageCount[s]).map(s => [s, stageCount[s] + ' 条', pct(stageCount[s]), stageEg[s].slice(0, 4).join('、')]);

    /* 纯设施（无货架） */
    const fac = D.shops.filter(sp => !sp.secs.length);

    /* 每店：条目数、最贵一件 */
    const spRows = D.shops.map((sp, i) => {
        let n = 0, mx = null;
        sp.secs.forEach(sec => sec.r.forEach(r => {
            n++;
            const pi = idx(sec, /售价|价格|费用/);
            const v = pi >= 0 ? pnum(r[pi]) : null;
            if (v != null && (!mx || v > mx.v)) mx = { v: v, s: r[idx(sec, /商品|名称|农具/)] };
        }));
        return [String(i + 1), E(sp.n), sp.h ? E(sp.h) : dash, (n ? n + ' 条' : '<span class="txc">纯设施</span>'),
            mx ? '<b>' + E(mx.s) + '</b> ' + money(String(mx.v)) : dash];
    });

    /* 全表（可搜） */
    const allRows = all.map(x => {
        const st = x.di >= 0 ? (String(x.r[x.di]).trim() || '—') : '—';
        return [
            [x.name, x.sp.n, x.sec.t, st].join(' ').replace(/"/g, ''),
            [E(x.name), '<span class="txc">' + E(x.sp.n) + '</span>', '<span class="txc">' + E(x.sec.t) + '</span>', money(x.price), E(st)]
        ];
    });

    /* 逐店明细 */
    const shopBlocks = D.shops.map((sp, i) => {
        const secs = sp.secs.map(sec => {
            const ni = idx(sec, /商品|名称|农具/), pi = idx(sec, /售价|价格|费用/);
            const cols = sec.c.map(h => /说明|作用/.test(h) ? 'auto' : /^(商品|名称|农具)$/.test(h) ? '8.4rem'
                : /季节/.test(h) ? '3rem' : /售价|价格|费用/.test(h) ? '4.8rem' : 'auto');
            const rows = sec.r.map(r => sec.c.map((h, j) =>
                (j === ni) ? '<b class="nw">' + E(r[j]) + '</b>'
                    : (j === pi) ? money(r[j]) : E(r[j])));
            const leftCols = [0];
            sec.c.forEach((h, j) => { if (/说明|作用/.test(h)) leftCols.push(j); });
            return `<h3 class="h3">${E(sec.t)}<span class="txc">　${sec.r.length} 条</span></h3>
            ${tbl(sec.c, rows, { leftFirst: true, left: leftCols, colw: cols, cls: 'rf3shop' })}`;
        }).join('');

        const desc = sp.desc ? `<p class="p">${E(sp.desc)}</p>` : '';
        const fnote = (!sp.secs.length) ? `<p class="p txc">—— 这处是纯设施，没有货架价目 ——</p>` : '';
        const notes = (sp.notes && sp.notes.length) ? `<div class="note">${sp.notes.map(E).join('<br>')}</div>` : '';
        return `
        <h2 class="h2">${i + 1}. ${E(sp.n)}${sp.full && sp.full !== sp.n ? `　<span class="txc">${E(sp.full)}</span>` : ''}${sp.h ? `　<span class="txc">${E(sp.h)}</span>` : ''}</h2>
        ${desc}${fnote}${secs}${notes}`;
    }).join('');

    const facList = fac.map(sp => `<p><b>${E(sp.n)}</b>${sp.full && sp.full !== sp.n ? '　<span class="txc">' + E(sp.full) + '</span>' : ''}${sp.h ? '　<span class="txc">' + E(sp.h) + '</span>' : ''}${sp.desc ? '　' + E(sp.desc) : ''}</p>`).join('');

    return `
    <h2 class="h2">1 代的镇子：13 处设施，9 家带货，4 处纯设施</h2>
    <p class="p">本页是《RF1 符文工房·新牧场物语 全资料整合》（91KB 中文编译本）「商店」各节的<b>全部 ${all.length} 条</b>，按原文的店序、店内的小节原样排。13 处里，浴场、卡尔迪亚教会、旅馆、怪物小屋是<b>纯设施</b>（只有营业时间和简介，不摆价目表）；其余 9 家带货。</p>
    <p class="p"><b>这些数字是买价，不是卖价。</b>原文没有「出货价／卖价」那一列，所以本页<b>不算买进再卖出赚多少</b>——少了一半，算出来的差价都是假的。原文没有的，这里也不补。</p>
    ${stat([
        ['设施', D.shops.length + ' 处'],
        ['带货店', (D.shops.length - fac.length) + ' 家'],
        ['商品行', all.length + ' 条'],
        ['有标价', priced.length + ' 条'],
        ['最贵一件', hi ? money(String(hi.pl)) : dash],
        ['最便宜', lo ? money(String(lo.pl)) : dash],
    ])}

    <h2 class="h2">13 处一览</h2>
    <p class="p">先看规模：哪家东西最多、最贵的一件在谁家。营业时间照原文——<b>伊万的流动店只在祝日（节日）开</b>，平时不在；浴场全年无休但只开到晚上 11 点。</p>
    ${tbl(['#', '设施', '营业时间', '条目', '最贵的一件'], spRows, { leftFirst: true, left: [0, 1], colw: ['2.2rem', '10rem', '9rem', '3.8rem', 'auto'], cls: 'rf3shop' })}

    <h2 class="h2">价格的两头：${hi ? E(hi.name) + ' ' + money(String(hi.pl)) : ''}，和最便宜的 60G 那档</h2>
    <p class="p">全表 ${priced.length} 条有价商品，最贵的和最便宜的差 <b>${hi && lo ? Math.round(hi.pl / lo.pl).toLocaleString('en-US') : 0} 倍</b>：一头是锻冶屋的奥尔德鲁，另一头是艾德医院的药草、海之家的沙丁鱼那一档 60G。武器和魔法书是价格天花板，种子、零食、常用药是地板。</p>
    ${tbl(['名次', '商品', '店', '价格'], [
        ['最贵', E(hi.name), E(hi.sp.n), money(String(hi.pl))],
        ['第二', E(hi2.name), E(hi2.sp.n), money(String(hi2.pl))],
        ['最便宜', E(lo.name), E(lo.sp.n), money(String(lo.pl))],
    ], { leftFirst: true, left: [1], colw: ['4.4rem', 'auto', '9.4rem', '6rem'], cls: 'rf3shop' })}
    <div class="key">${hi ? '<b>' + E(hi.name) + '</b>（' + money(String(hi.pl)) + '）比第二名贵出 ' + (hi2 ? Math.round(hi.pl / hi2.pl * 10) / 10 : 0) + ' 倍，它就在锻冶屋的武器柜里，而且<b>要等赛壬击破、且只在冬季卖</b>——1 代最贵的一件同时卡着剧情和季节两道锁。' : ''}原表只给买价、不给卖价和属性，所以本站<b>不评价它值不值这个价</b>。</div>

    <h2 class="h2">什么进度能买到什么</h2>
    <p class="p">这张表是本页最该先看的：把 ${all.length} 条按「什么时候上架」重新分一遍，就知道<b>开局能买的其实不少，但大半好东西要等剧情或季节</b>。原文的档位写法照录，没有合并。「说明」列为空（或写「开始即可购买」）的就是开局就能买；写「XX击破后」要推剧情；写「春／夏／秋／冬限定」或「种子」是季节货。</p>
    ${tbl(['上架时点', '条数', '占比', '举例'], [['开局可买（说明空白或「开始即可购买」）', (stageCount['开局可买'] || 0) + ' 条', pct(stageCount['开局可买'] || 0), (stageEg['开局可买'] || []).slice(0, 4).join('、')]].concat(stageRows).concat([['原文未单列说明（视作随时可购）', noCol + ' 条', pct(noCol), noColSecs.join('、')]]), { leftFirst: true, left: [0, 3], colw: ['13rem', '4.6rem', '4rem', 'auto'], cls: 'rf3shop' })}
    <div class="key">剧情锁最重的是<b>武器与魔法书</b>：长剑要等巨大恶魔，双手剑要等奇美拉，巨剑／防御者要等戈勒姆，风之剑／水之剑还要再叠「春季限定」；魔法书从「传送」开局就有，到「爆炸／地震」「陨石／暴风」要一路推到戈勒姆、钢之战车。<b>种子则卡季节＋通关</b>——樱花草、油灯草、金刚花这些「通关后有售」的，前期根本买不到。</div>

    <h2 class="h2">一张表查全部 ${all.length} 条</h2>
    <p class="p">按商品名、店名、小节名或上架时点（如「击破后」「冬季限定」）搜都行。下面是摊平版，同一件东西在两家店出现就占两行。</p>
    <details class="mon-fold">
        <summary>展开／收起：${all.length} 条总表</summary>
        ${ftableOwn(['商品', '店', '小节', '价格', '上架时点'], ['8.4rem', '8.6rem', '7rem', '4.8rem', 'auto'], allRows, { ph: '输入商品名、店名或「击破后」', cls: 'rf3shopall' })}
    </details>

    <h2 class="h2">逐店明细</h2>
    <p class="p">下面按<b>原文的店序</b>原样排，一家店一节，店内再按原文的小节分。表格里的字没改过——价格一律带 G，和原文一致。</p>
    ${shopBlocks}

    <h2 class="h2">纯设施（无货架）</h2>
    <p class="p">这 ${fac.length} 处只提供服务或场所，不卖货，所以没有价目表。它们的简介照录：</p>
    <div class="txt-list">${facList}</div>

    <h2 class="h2">照录不改的几处</h2>
    <div class="txt-list">
        <p><b>农具升级是「要求」不是「售价」</b>——锻冶屋那张表四列是「农具／材料／费用／日数」，本站把「费用」当价格列用，原表的「材料」「日数」两列照原样保留，没有合并进价格。</p>
        <p><b>伊万的流动店按「每月 N 日」轮换货架</b>——同一家店分五张小表（1/7/13/19/25 日），不是一张大表，本站照原样拆开。</p>
        <p><b>价格一律带 G</b>——原表所有价格都写成「1000G」这种带单位的形式，本站不改写法、不去掉 G。</p>
        <p><b>源文件里有一处孤立的「海边」二字</b>（夹在锻冶屋与海之家之间、不属于任何表格），本站立不成农具升级的行，也没另开条目，按非数据跳过。</p>
    </div>
    <div class="note">数据文件 <code>js/rf1shop.js</code>（<code>RF1_SHOP</code>）由 <code>_build_rf1_shop.py</code> 按原文行区间切出，逐行校验；页面里的所有统计（条数、占比、最贵、最便宜）都是<b>现算</b>，没有一处写死。源文件为 UTF-16LE 单文件，商店章未单独署名，故只记到「全资料整合」这一层。</div>`;
}

function shopRf2Html() {
    const D = (typeof RF2_SHOP !== 'undefined') ? RF2_SHOP : null;
    if (!D || !D.secs || !D.secs.length) return '';
    const esc = t => String(t == null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const money = v => (v == null) ? dash : Number(v).toLocaleString('en-US') + 'G';
    const L = s => '<span style="display:block;text-align:left;width:100%">' + s + '</span>';
    const num = v => (v == null) ? dash : String(v);

    const sec = k => D.secs.filter(s => s.k === k)[0];
    const flat = s => { const a = []; s.subs.forEach(su => su.items.forEach(it => a.push(it))); return a; };

    const gro = sec('杂货屋'), wug = sec('武具行'), ped = sec('行商'), cli = sec('诊所');
    const groAll = flat(gro), wugAll = flat(wug), pedAll = flat(ped), cliAll = flat(cli);
    const all = groAll.concat(wugAll, pedAll, cliAll);

    /* 一件商品出现在哪几季（按日文原名认，同一件四季都有就是「春夏秋冬」） */
    const seasonsOf = jp => gro.subs.filter(su => su.items.some(x => x.j === jp)).map(su => su.k);
    const order = '春夏秋冬';

    /* ---- 种子：按季节展开，同一件在几季上架就出现几次 ---- */
    const seedRows = [];
    const seedKey = {};
    gro.subs.forEach(su => su.items.forEach(it => {
        if (it.d == null) return;
        seedRows.push({ se: su.k, it: it });
        seedKey[it.j] = it;
    }));
    const seedU = Object.keys(seedKey).map(k => seedKey[k]);

    /* ---- 杂货屋里的非种子商品 ---- */
    const goods = [];
    const goodsKey = {};
    groAll.forEach(it => {
        if (it.d != null) return;
        if (!goodsKey[it.c]) {
            goodsKey[it.c] = { it: it, se: seasonsOf(it.j) };
            goods.push(goodsKey[it.c]);
        }
    });
    const fourSeason = goods.filter(g => g.se.length === 4);
    const oneSeason = goods.filter(g => g.se.length < 4);

    /* ---- 两源互校：种子价与天数 vs 站内农作页 ---- */
    const cmp = seedU.filter(it => it.x);
    const noCrop = seedU.filter(it => !it.x);
    const pSame = cmp.filter(it => it.p === it.xb);
    const dSame = cmp.filter(it => it.d === it.xd);
    const bothDiff = cmp.filter(it => it.p !== it.xb || it.d !== it.xd);

    /* ---- 其余商品：站内物品表里找不找得到 ---- */
    const oth = [];
    const othKey = {};
    groAll.concat(wugAll, pedAll, cliAll).forEach(it => {
        if (it.d != null) return;                 // 种子另有互校，不混进这一节
        if (othKey[it.c]) return;
        othKey[it.c] = it;
        oth.push(it);
    });
    const othMiss = oth.filter(it => !it.x);

    /* ---- 价格与天数 ---- */
    const priced = all.filter(it => it.p != null);
    const byPrice = priced.slice().sort((a, b) => b.p - a.p || (a.c < b.c ? -1 : 1));
    const priciest = byPrice[0];
    const cheapest = priced.slice().sort((a, b) => a.p - b.p || (a.c < b.c ? -1 : 1))[0];
    const nCheap = priced.filter(it => it.p === cheapest.p).length;
    const storeMax = s => Math.max.apply(null, flat(s).map(it => it.p == null ? 0 : it.p));
    const dayVals = seedU.map(it => it.d).filter(v => v != null);
    const minDay = Math.min.apply(null, dayVals), maxDay = Math.max.apply(null, dayVals);
    const fastSeeds = seedU.filter(it => it.d === minDay);
    const slowSeeds = seedU.filter(it => it.d === maxDay);

    /* 诊所：草与成药 */
    const grass = cliAll.filter(x => /草/.test(x.c));
    const med = cliAll.length - grass.length;
    const cliMax = cliAll.slice().sort((a, b) => b.p - a.p || (a.c < b.c ? -1 : 1))[0];

    return `
    <h2 class="h2">2 代的商店一共四家</h2>
    <p class="p">本页是攻略本「商店及售价」那一章的<b>全部 ${all.length} 行</b>：杂货屋（四季各一批）、武具行、行商、诊所。<b>杂货屋按季节换货</b>，所以同一种种子在表里会出现一两次；其余三家不分季节。</p>
    ${stat([
        ['商店', '4 家'],
        ['商品行', all.length + ' 行'],
        ['种子', seedU.length + ' 种'],
        ['最贵一件', money(priciest.p)],
        ['最便宜', money(cheapest.p)],
    ])}
    <div class="key"><b>全表最贵的是种子，不是武器。</b>最贵一件是 ${esc(priciest.c)}（${money(priciest.p)}），武具行最贵只到 ${money(storeMax(wug))}，行商最贵 ${money(storeMax(ped))}。前三名全是种子：${byPrice.slice(0, 3).map((it, i) => (i ? '、' : '') + esc(it.c) + ' ' + money(it.p)).join('')}。前期缺钱时最容易被种子价吓到，这个顺序别搞反。</div>

    <h2 class="h2">杂货屋 · 按季卖种子，共 ${seedU.length} 种</h2>
    <p class="p">种子一季一批，<b>换季就换货</b>，所以「这一季能种什么」得看季节列。生长天数是原文附在种子名后的括注（如「4天」），本站只把它拆成一列，数字不动。<b>${esc(Object.keys(seedKey).filter(j => seasonsOf(j).length > 1).map(j => seedKey[j].c).join('、') || '没有')}</b> 是唯一跨季卖的种子（${Object.keys(seedKey).filter(j => seasonsOf(j).length > 1).map(j => seasonsOf(j).join('／')).join('、') || '—'}），冬天没有它。</p>
    ${tbl(['季节', '种子', '日文原名', '生长', '售价'], seedRows.map(r => [
        esc(r.se),
        L('<b>' + esc(r.it.c) + '</b>'),
        L(esc(r.it.j)),
        num(r.it.d) + ' 天',
        money(r.it.p),
    ]), { leftFirst: true, left: [1, 2], colw: ['2.8rem', '7.4rem', '8.4rem', '3.6rem', '4.4rem'], cls: 'rf2shop' })}
    <div class="note">生长天数从 <b>${minDay} 天</b>到 <b>${maxDay} 天</b>，差 ${Math.round(maxDay / minDay)} 倍。最短的一档是 ${fastSeeds.map(x => esc(x.c)).join('、')}（${minDay} 天）；最长的是 ${slowSeeds.map(x => esc(x.c)).join('、')}（${maxDay} 天，${money(slowSeeds[0].p)}）。<b>原文只给天数与种价，没给产量与卖价，所以本站不算回本天数</b>——少这两样算出来的都是假数。</div>

    <h2 class="h2">杂货屋 · 除了种子，还卖 ${goods.length} 件吃的用的</h2>
    <p class="p">这 ${goods.length} 件里 <b>${fourSeason.length} 件四季都摆</b>，原文把它们<b>在四季里各抄了一遍</b>（${fourSeason.length} 件 × 4 季 = ${fourSeason.length * 4} 行），价格一处都没变。本站合成一张表，省得读四遍同样的数字。</p>
    ${tbl(['商品', '日文原名', '上架季节', '售价'], goods.map(g => [
        L('<b>' + esc(g.it.c) + '</b>'),
        L(esc(g.it.j)),
        esc(g.se.join('')) + (g.se.length === 4 ? '（四季）' : '（单季）'),
        money(g.it.p),
    ]), { leftFirst: true, left: [0, 1, 2], colw: ['7rem', '8.4rem', '7rem', '4.6rem'], cls: 'rf2shop' })}
    <div class="note">表里只有 ${esc(oneSeason.map(g => g.it.c).join('、') || '—')} 是<b>单季限定</b>，其余 ${fourSeason.length} 件四季同价。${fourSeason.length ? fourSeason.slice(0, 2).concat(fourSeason.slice(-1)).map(g => esc(g.it.c) + ' ' + money(g.it.p)).join('、') + ' 这几件' : ''}不用等哪一季。</div>

    <h2 class="h2">武具行：${wugAll.length} 条，卖的是「类别」不是「名字」</h2>
    <p class="p">这一节原文写得很省：中文列给的是<b>片手剑、两手剑、枪、锤子、斧子、杖、盾、护腕、靴子</b>——九个<b>武器类别</b>，不是具体哪一把。日文列倒是给了具体型号。<b>本站照录这个不对称</b>，只在末列给出站内同名的具体武器，方便你顺着去找属性。</p>
    ${tbl(['日文原名', '原文中文', '售价', '站内同名的武器'], wugAll.map(it => [
        L(esc(it.j)),
        L('<b>' + esc(it.c) + '</b>'),
        money(it.p),
        it.x ? L(esc(it.x)) : dash,
    ]), { leftFirst: true, left: [0, 1, 3], colw: ['8.4rem', '5.6rem', '4.6rem', '6.6rem'], cls: 'rf2shop' })}
    <div class="note">第一行「ブロードゾード」是原文写法，<b>ソ 的位置写成了 ゾ</b>（一般作 ブロードソード）；第二行「ク雷（レイ）モア」把读音注进了名字里（クレイモア）。两处都照录，没改。</div>

    <h2 class="h2">行商：${pedAll.length} 条，卖吃的和首饰</h2>
    <p class="p">行商是流动摊，卖的全是成品——饭、果汁、戒指胸针，<b>不卖材料也不卖种子</b>。价格比杂货屋的食材贵一截：杂货屋的白饭 ${money((groAll.filter(x => x.c === '白饭')[0] || {}).p)}，行商最贵一件 ${money(storeMax(ped))}。适合懒得下厨的时候，不适合囤货。</p>
    ${tbl(['日文原名', '原文中文', '售价'], pedAll.map(it => [
        L(esc(it.j)),
        L('<b>' + esc(it.c) + '</b>'),
        money(it.p),
    ]), { leftFirst: true, left: [0, 1], colw: ['9rem', '6.6rem', '4.6rem'], cls: 'rf2shop' })}

    <h2 class="h2">诊所：${cliAll.length} 条，${med} 种药加 ${grass.length} 种草</h2>
    <p class="p">前 ${med} 条是成药，后 ${grass.length} 条是草。原文只给其中 ${cliAll.filter(x => x.n).length} 种药加了括注说明用途，本站单列一栏照录；<b>没加括注的，本站也不替它补</b>——原表没写就是没写。</p>
    ${tbl(['日文原名', '原文中文', '原文备注', '售价'], cliAll.map(it => [
        L(esc(it.j)),
        L('<b>' + esc(it.c) + '</b>'),
        it.n ? L(esc(it.n)) : dash,
        money(it.p),
    ]), { leftFirst: true, left: [0, 1, 2], colw: ['7.6rem', '6rem', '8.4rem', '4.4rem'], cls: 'rf2shop' })}
    <div class="note">最便宜的一档是草，<b>${nCheap} 种都卖 ${money(cheapest.p)}</b>；诊所里最贵的一味是 ${esc(cliMax.c)}（${money(cliMax.p)}）。原文里「マヒロン」「ペラペラ丸」两条把中文名<b>另起一行</b>写，和其余条目排版不一样，本站照原样拆成两列，没统一格式。</div>

    <h2 class="h2">和站内数据对了一遍：${pSame.length} 种种子价格一致</h2>
    <p class="p">站内「农作」页有 2 代的种子买价与生长天数（来自另一份整理），正好能交叉核对。<b>${cmp.length} 种两边都找得到的种子里，价格一致 ${pSame.length} 种，生长天数也一致 ${dSame.length} 种</b>。下面把对不上的全列出来——<b>两边都照录，不判定谁对</b>。</p>
    ${tbl(['种子', '攻略本', '站内农作页', '差在哪'], bothDiff.map(it => [
        L('<b>' + esc(it.c) + '</b>'),
        money(it.p) + ' / ' + it.d + ' 天',
        money(it.xb) + ' / ' + it.xd + ' 天',
        L([
            it.p !== it.xb ? '价格：' + (it.xb === it.p * 2 ? '站内正好是本站的两倍' : '两边各写一个数') : '',
            it.d !== it.xd ? '天数：差 ' + Math.abs(it.d - it.xd) + ' 天' : '',
        ].filter(Boolean).join('；')),
    ]), { leftFirst: true, left: [0, 3], colw: ['6.4rem', '6.4rem', '7rem', 'auto'], cls: 'rf2shop' })}
    <div class="note">${noCrop.length ? '还有一种站内农作页<b>根本没有同名作物</b>：' + noCrop.map(it => esc(it.c) + '（' + esc(it.j) + '，' + money(it.p) + ' / ' + it.d + ' 天）').join('、') + '——站内表里没有它，不是本站把它删了。' : ''}差额最扎眼的是赤水晶种子：攻略本 17,400G，站内 34,800G，<b>正好一半</b>；可同季另三种水晶站内都写三万上下（青 32,400／绿 29,700／白 39,800），所以十七万这一档看着像少写了一位数。但<b>这只是推测，不是结论</b>，表里照录原文。</div>

    <h2 class="h2">名字：攻略本一套，站内一套</h2>
    <p class="p">非种子的 ${oth.length} 件里，<b>${oth.length - othMiss.length} 件能在站内物品表找到对应物</b>${othMiss.length ? '，只有 ' + othMiss.map(it => esc(it.c) + '（' + esc(it.j) + '）').join('、') + ' 找不到' : ''}。但名字常常不是同一个写法。本页<b>一律显示攻略本的字</b>，站内叫法只在下面举例——不替换、不合并。</p>
    ${tbl(['攻略本写法', '站内物品表', '差在哪'], [
        ['蓝色草', '靛草', '「藍」译成了颜色，站内按染料叫靛'],
        ['大阪烧', '什锦烧', '两种常见译法'],
        ['蓝宝石胸针', '海蓝宝石胸针', 'アクアマリン 是海蓝宝石，不是蓝宝石'],
        ['海鲜皮萨', '海鲜披萨', '「皮」是「披」的误写'],
        ['海鲜锔饭', '海鲜奶焗饭', '「锔」应为「焗」，站内还换了整个叫法'],
        ['牛奶S／鸡蛋S', '牛奶Ｓ型／鸡蛋Ｓ型', '半角 S 对全角 Ｓ，还多一个「型」'],
        ['白饭', '米饭', '同物异名'],
        ['艾莉草', '艾丽草', '莉／丽'],
        ['丸子粉', '糯米粉', 'だんご粉 站内按原料叫'],
        ['四叶草种子', '幸运草种子', '同一件：站内物品表叫幸运草、农作页叫四叶草，站内自己也不统一'],
        ['片手剑', '阔剑', 'ブロードソード 就是阔剑，原文却写成类别'],
    ], { leftFirst: true, left: [0, 1, 2], colw: ['7.6rem', '8.4rem', 'auto'], cls: 'rf2shop' })}

    <h2 class="h2">照录不改的几处</h2>
    <ul class="ul">
        <li class="li"><b>两个日文名都是原文的错</b>：「ブロードゾード」（ソ 写成 ゾ）、「ク雷（レイ）モア」（读音混进名字）。不动。</li>
        <li class="li"><b>武具行卖类别</b>：中文列九条全是「片手剑／两手剑／枪…」，不是具体武器名。不替它补型号。</li>
        <li class="li"><b>「海鲜皮萨」「海鲜锔饭」</b>：错字照录，不改成「披萨」「焗饭」。</li>
        <li class="li"><b>诊所两条排版不一致</b>：マヒロン、ペラペラ丸把中文名写在下一行，其余写在同行。照原样拆列，不统一。</li>
        <li class="li"><b>赤水晶种子 17,400G</b> 与站内农作页 34,800G 差一倍；另有 <b>${bothDiff.filter(it => it.d !== it.xd).length} 种种子的生长天数</b>与站内写的不一样——照录，不断言哪个错。</li>
        <li class="li"><b>原文不给的一律不补</b>：没有产量、没有作物卖价、没有回本天数、没有营业时间。这四项本站都不替它算、不替它编。</li>
    </ul>
    <div class="note">数据源：${esc(D.src)}。原文是 UTF-16LE 的单文件，一章里拼了好几份攻略，这一章没有署名，所以只能记到「合辑」这一层。</div>
    `;
}

function shopAzumaHtml() {
    const R = (typeof SHOP_AZUMA !== 'undefined') ? SHOP_AZUMA.rows : [];
    if (!R.length) return '';
    const dash = '<span class="mon-no">—</span>';
    const N = v => /^\d+$/.test(String(v)) ? +v : null;
    const money = v => v == null ? dash : Number(v).toLocaleString() + 'G';
    const L = s => '<span style="display:block;width:100%;text-align:left">' + s + '</span>';

    /* 按地点汇总 */
    const shops = {};
    R.forEach(r => {
        const v = N(r[2]);
        const o = shops[r[0]] = shops[r[0]] || { n: 0, lo: Infinity, hi: 0, sum: 0 };
        o.n++;
        if (v != null) { o.sum += v; o.lo = Math.min(o.lo, v); o.hi = Math.max(o.hi, v); }
    });
    const shopList = Object.keys(shops).sort((a, b) => shops[b].n - shops[a].n || (a < b ? -1 : 1));

    /* 按商品反查：一种商品在几家店卖、价格是否一致 */
    const byItem = {};
    R.forEach(r => { (byItem[r[1]] = byItem[r[1]] || []).push([r[0], N(r[2])]); });
    const items = Object.keys(byItem);
    const multi = items.filter(k => byItem[k].length > 1)
        .map(k => ({
            n: k, at: byItem[k],
            prices: byItem[k].map(x => x[1]).filter(v => v != null).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b)
        }))
        .sort((a, b) => b.at.length - a.at.length || (a.n < b.n ? -1 : 1));
    const priced = multi.filter(m => m.prices.length > 1);
    const soloN = items.length - multi.length;

    /* 商品与价格完全一致的地点对（同店异写） */
    const sig = a => R.filter(r => r[0] === a).map(r => r[1] + '/' + r[2]).sort().join(',');
    const same = [];
    for (let i = 0; i < shopList.length; i++) {
        for (let j = i + 1; j < shopList.length; j++) {
            if (shops[shopList[i]].n !== shops[shopList[j]].n) continue;
            if (sig(shopList[i]) === sig(shopList[j])) same.push([shopList[i], shopList[j]]);
        }
    }

    /* 价格两端 */
    const allP = R.map(r => N(r[2])).filter(v => v != null);
    const hiP = Math.max.apply(null, allP), loP = Math.min.apply(null, allP);
    const top = R.filter(r => N(r[2]) === hiP);
    const bottom = R.filter(r => N(r[2]) === loP);
    const dearest = shopList.slice().sort((a, b) => (shops[b].sum / shops[b].n) - (shops[a].sum / shops[a].n))[0];

    /* 种子交叉核对：商店表的种子售价 vs 农作页的「种子买价」
       两张表来自同一站点的两篇文章，数值并不完全一致——这里只把差异摆出来，不改任何一边。 */
    const cropSeed = {}, cropSeason = {};
    if (typeof CROP_AZUMA !== 'undefined') {
        CROP_AZUMA.rows.forEach(r => { cropSeed[r[0]] = r[1]; cropSeason[r[0]] = r[6]; });
    }
    const seedRows = R.filter(r => /种子$/.test(r[1])).map(r => {
        const base = r[1].replace(/种子$/, '');
        const cv = cropSeed[base];
        const sp = N(r[2]);
        return {
            shop: r[0], n: r[1], base: base, sp: sp,
            cv: (cv != null && /^\d+$/.test(String(cv))) ? +cv : null,
            r: (cv != null && /^\d+$/.test(String(cv)) && +cv > 0 && sp != null) ? sp / +cv : null
        };
    }).filter(x => x.r != null);
    const seedBand = seedRows.filter(x => x.r >= 1.28 && x.r <= 1.35);
    const seedOff = seedRows.filter(x => x.r < 1.28 || x.r > 1.35).sort((a, b) => b.r - a.r);
    /* 每家店卖的种子分属哪些季节 */
    const seedByShop = {};
    seedRows.forEach(x => { (seedByShop[x.shop] = seedByShop[x.shop] || []).push(x); });
    const seedShopSeasons = {};
    seedRows.forEach(x => {
        const s = cropSeason[x.base];
        if (!s) return;
        (seedShopSeasons[x.shop] = seedShopSeasons[x.shop] || []).push(s);
    });
    const seasonOnly = Object.keys(seedShopSeasons).filter(k => {
        const s = seedShopSeasons[k].filter(v => v && v !== '×' && v !== '—');
        return s.length >= 3 && s.every(v => v === s[0]);
    });

    return `
        <h2 class="h2">${R.length} 行在售商品分在 ${shopList.length} 处地点${same.length ? '，其中 ' + same.length + ' 组是同一家店的两种写法，实为 ' + (shopList.length - same.length) + ' 家' : ''}</h2>
        <p class="p">这一作的商店不是「一家店卖一大类」，而是<b>按村子与街区铺开的小铺子</b>：种苗店只卖树苗与金作物、豆腐店只有两样、木工樱屋只卖木材与石材。想买齐一套东西得跑好几家，这跟 RF4／RF5 那种「杂货店一站买完」的节奏完全不同。</p>
        ${stat([['在售条目', R.length + ' 条'], ['地点写法', shopList.length + ' 处'], ['去重商品', items.length + ' 种'], ['价格区间', money(loP) + ' ～ ' + money(hiP)]])}
        <p class="p">表里 <b>${items.length}</b> 种商品有 <b>${soloN}</b> 种只在一家店出现，占 ${Math.round(soloN / items.length * 100)}%；剩下 ${multi.length} 种跨店重复，其中<b>只有 ${priced.length} 种在不同店价格不一样</b>。</p>

        <h2 class="h2">哪家店卖什么：${shopList.length} 处地点的商品数与价位</h2>
        <p class="p">按商品数排。均价那列能看出店铺的档次——<b>咒术屋翡翠</b>只卖 9 样却均价 ${money(Math.round(shops[dearest].sum / shops[dearest].n))}，因为它卖的是属性结晶：</p>
        ${tbl(['地点', '商品数', '价格区间', '均价'], shopList.map(k => {
            const o = shops[k];
            return [k, '<b>' + o.n + '</b> 种', money(o.lo) + ' ～ ' + money(o.hi), money(Math.round(o.sum / o.n))];
        }), { leftFirst: true, colw: ['auto', '6rem', '10rem', '7rem'] })}
        ${same.length ? `<div class="key">这三组<b>商品与价格完全一致</b>：${same.map(p => '<b>' + p[0] + '</b> 与 <b>' + p[1] + '</b>').join('、')}。源表把它们当两个地点分开列，本页照录未合并——你如果只看到其中一家，买到的东西是一样的。</div>` : ''}

        <h2 class="h2">${multi.length} 种跨店商品里，只有 ${priced.length} 种有价差</h2>
        <p class="p">把同一种商品在各店的标价排在一起，<b>${multi.length - priced.length} 种在每家店都同价</b>——铁、铜、银、金在矿石店与两家铁匠铺同价，米饭在三家卖吃食的地方同价，小麦粉与黄油在三家店同价。有价差的只有下面这 ${priced.length} 种：</p>
        ${tbl(['商品', '在哪几家', '价差'], priced.map(m => [m.n, L(m.at.map(x => x[0] + ' ' + money(x[1])).join('、')), money(m.prices[m.prices.length - 1] - m.prices[0])]), { leftFirst: true, colw: ['7rem', 'auto', '5.4rem'] })}
        <div class="key">分两类：<b>恢复类道具是杂货店贵</b>——恢复壶药店 ${money(427)}、杂货店 ${money(475)}；疗愈壶药店 ${money(854)}、杂货店 ${money(950)}，各贵 ${money(48)} 与 ${money(96)}，要补 RP 就往药店走。<b>种子则是杂货店的价明显不合群</b>——白萝卜种子杂货店 ${money(380)}、渡濑鱼店 ${money(95)}，南瓜种子杂货店 ${money(95)}、常夏杂货店 ${money(87)}。这两条与下一节的交叉核对正好对上，先别急着照杂货店的价算成本。</div>

        <h2 class="h2">种子不只在种苗店卖：${Object.keys(seedByShop).length} 家店分季上货</h2>
        <p class="p">把 ${R.length} 行里带「种子」的挑出来（${seedRows.length} 行），按店归堆会发现<b>种子是按季节分给对应村子的店在卖</b>，不是全塞在种苗店。种苗店反倒只卖树苗与金作物：</p>
        ${tbl(['店铺', '种子数', '卖的是哪些（括号内为农作页的适宜季）'], Object.keys(seedByShop).sort((a, b) => seedByShop[b].length - seedByShop[a].length || (a < b ? -1 : 1)).map(k => {
            const g = seedByShop[k];
            return [k, '<b>' + g.length + '</b> 种', L(g.map(x => x.base + (cropSeason[x.base] && cropSeason[x.base] !== '×' ? '（' + cropSeason[x.base] + '）' : '')).join('、'))];
        }), { leftFirst: true, colw: ['9.4rem', '5.4rem', 'auto'] })}
        <div class="key">${seasonOnly.length ? seasonOnly.map(k => '<b>' + k + '</b> 卖的 ' + seedByShop[k].length + ' 种' + (cropSeason[seedByShop[k][0].base] ? '全是' + cropSeason[seedByShop[k][0].base] + '作物' : '')).join('，') + '——村子对着季节上货，这条是齐的' : ''}。另外几家混了季（常夏杂货店的南瓜是秋作物、八千代居酒屋的青椒是夏作物），花店则按四季各两种铺开、外加金刚花这种不分季的。想买当季种子，先看这一季的村口那家店。</div>

        <h2 class="h2">与农作页对一遍：${seedRows.length} 行种子里 ${seedOff.length} 行的价对不上</h2>
        <p class="p">本站农作页那张表（同源的另一篇）给的是<b>种子买价</b>，本页是<b>商店售价</b>，两者本来不必相等。但把 ${seedRows.length} 行并排比，<b>${seedBand.length} 行都落在 ${(Math.min.apply(null, seedBand.map(x => x.r))).toFixed(2)}～${(Math.max.apply(null, seedBand.map(x => x.r))).toFixed(2)} 倍</b>这个很窄的带里，只有 ${seedOff.length} 行跳出去——这个反差本身就指出哪几行可疑：</p>
        ${tbl(['店铺', '种子', '本页售价', '农作页种子买价', '售价 ÷ 买价'], seedOff.map(x => [x.shop, x.n, '<b>' + money(x.sp) + '</b>', money(x.cv), x.r.toFixed(2) + ' 倍']), { leftFirst: true, colw: ['9.4rem', 'auto', '6.2rem', '8rem', 'auto'] })}
        <div class="key">这 ${seedOff.length} 行集中在两家店：<b>杂货店的三种种子全部跳带</b>（白萝卜 ${(380 / 72).toFixed(2)} 倍、南瓜 ${(95 / 66).toFixed(2)} 倍、胡萝卜 ${(87 / 76).toFixed(2)} 倍），<b>种苗店的金马铃薯与金南瓜则是低于 1 倍</b>——同一个店的另两种金作物（金芜菁、金卷心菜）都是 ${(532 / 400).toFixed(2)} 倍。名目上像同一列数被串了行，但<b>哪一边是游戏里的实际数字，本站没有第三个源可以判定</b>，所以两处都照录原值，不做改正。</div>

        <h2 class="h2">最贵的是宝石，${money(hiP)} 五种并列</h2>
        <p class="p">矿石店的宝石柜是全作最贵的柜台，<b>${top.length} 种并列 ${money(hiP)}</b>：</p>
        ${tbl(['商品', '价格', '在哪买'], top.map(r => [r[1], '<b>' + money(N(r[2])) + '</b>', r[0]]), { leftFirst: true, colw: ['9rem', '7rem', 'auto'] })}
        <div class="key">往下一档是咒术屋翡翠的<b>属性结晶 ${money(9500)}</b>（风、水、火、地、暗……），再往下才轮到 ${money(8170)} 的舶来品与 ${money(4560)} 的高档食材。最便宜的一头是<b>石块 ${money(loP)}</b>——矿石店连这个都卖，做建筑时缺石料可以直接买。整张表从 ${money(loP)} 到 ${money(hiP)}，最贵一件是最便宜一件的 ${Math.round(hiP / loP).toLocaleString()} 倍。</div>

        <h2 class="h2">全部 ${R.length} 条在售清单（可搜索）</h2>
        <p class="p">按源表原顺序排列，<b>未按价格或店名重排</b>，方便拿着源表对行。搜店名或商品名都能筛：</p>
        ${ftableOwn(['地点', '商品', '价格', '库存', '备注'],
            ['9.4rem', 'auto', '6.4rem', '5rem', '5rem'],
            R.map(r => [r[1] + ' ' + r[0], [r[0], r[1], '<b>' + money(N(r[2])) + '</b>', r[3] || dash, r[4] || dash]]),
            { ph: '输入店名或商品名筛选' })}
        <div class="note">取自 ${(typeof SHOP_AZUMA !== 'undefined') ? SHOP_AZUMA.src : 'gametoeasy'}，共 ${R.length} 行。<b>「库存」与「备注」两列源表 248 行全部写「—」</b>，本页照录，不推算补货频率或限购数量；价格照录原表数字，页内统一加「G」显示。<b>本页没有「营业时间」数据</b>——源表只列在售商品，几点开门、哪天休息都没写，这一栏空着比编一个准。</div>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">种子买价与卖价对照</div></a>
            <a href="#/page/recipe"><div class="jp-t">配方大全</div><div class="jp-s">这些素材做成什么</div></a>
        </div>`;
}

/* ============================================================
   配方大全 · 龙之天地（azuma）
   RECIPE_AZUMA.cats = [{ k: 类目, page: 源文号, head: [列名…], rows: [[原表单元格…]] }]
   源表十二张的列位并不一致：武器 13 列、防具 13 列、建筑 12 列、药学 15 列，
   连表头用词都不同（「武器攻击」/「攻击」、「买价」/「价格-买价」）。
   所以一律按表头找列，不硬编码下标；统计全部现算，不另存衍生表。
   ============================================================ */
function recipeAzumaHtml() {
    const R = (typeof RECIPE_AZUMA !== 'undefined') ? RECIPE_AZUMA : null;
    if (!R || !R.cats || !R.cats.length) return '<p class="p">龙之天地的配方数据未加载。</p>';
    const C = R.cats;
    const num = v => { const s = String(v).replace(/,/g, ''); return /^-?\d+$/.test(s) ? +s : null; };
    const money = v => v == null ? '<span class="mon-no">—</span>' : Number(v).toLocaleString() + 'G';
    const dash = v => (!v || v === '—') ? '<span class="mon-no">—</span>' : v;
    const col = (c, kw) => c.head.findIndex(h => h.indexOf(kw) >= 0);
    const iBuy = c => col(c, '买价');
    const iSell = c => col(c, '卖价');
    const iUnlock = c => col(c, '解锁');
    const iAtk = c => c.head.findIndex(h => h.indexOf('攻击') >= 0);

    /* 全部摊平：{ 类目, 名, 材料[], 买价, 卖价, 解锁 } */
    const flat = [];
    C.forEach(c => {
        const bi = iBuy(c), si = iSell(c), ui = iUnlock(c);
        c.rows.forEach(r => flat.push({
            k: c.k, n: r[0], head: c.head,
            m: r.slice(1, 5).filter(x => x && x !== '—'),
            b: bi >= 0 ? num(r[bi]) : null,
            s: si >= 0 ? num(r[si]) : null,
            u: (ui >= 0 && r[ui] && r[ui] !== '—') ? r[ui] : ''
        }));
    });
    const total = flat.length;

    /* 类目一览 */
    const catRows = C.map(c => {
        const si = iSell(c);
        const g = c.rows.map(r => ({ n: r[0], s: si >= 0 ? num(r[si]) : null })).filter(x => x.s != null);
        const top = g.slice().sort((a, b) => b.s - a.s)[0];
        return [c.k, c.rows.length + ' 条', top ? top.n + '（' + money(top.s) + '）' : '<span class="mon-no">—</span>', 'post/' + c.page];
    });
    const bigCat = C.slice().sort((a, b) => b.rows.length - a.rows.length)[0];

    /* 材料复用 */
    const mat = {};
    flat.forEach(x => x.m.forEach(s => { const nm = s.split('×')[0].trim(); if (nm) mat[nm] = (mat[nm] || 0) + 1; }));
    const matList = Object.keys(mat).sort((a, b) => mat[b] - mat[a]);
    const base3 = ['木材', '石材', '铁'];
    const base3n = base3.reduce((a, k) => a + (mat[k] || 0), 0);
    const single = flat.filter(x => x.m.length === 1).length;
    const emptyMat = flat.filter(x => !x.m.length).length;

    /* 武器五类：攻击上限。wStat 保留算好的对象，文案里一律从这里取数，不写死数字 */
    const W = C.slice(0, 5);
    const wStat = W.map(c => {
        const ai = iAtk(c), si = iSell(c);
        const g = c.rows.map(r => ({ n: r[0], a: ai >= 0 ? num(r[ai]) : null, s: si >= 0 ? num(r[si]) : null }))
            .filter(x => x.a != null);
        const bot = g.slice().sort((x, y) => x.a - y.a)[0];
        const top = g.slice().sort((x, y) => y.a - x.a)[0];
        return {
            k: c.k, n: c.rows.length, has: g.length, bot: bot, top: top,
            span: (bot && top && bot.a > 0) ? top.a / bot.a : null
        };
    });
    const wRows = wStat.map(s => [s.k, s.has + ' / ' + s.n,
        s.bot ? s.bot.a.toLocaleString() : '—',
        s.top ? '<b>' + s.top.n + '</b>（' + s.top.a.toLocaleString() + '）' : '—',
        s.top && s.top.s != null ? money(s.top.s) : '—']);
    const allW = [];
    W.forEach(c => { const ai = iAtk(c); c.rows.forEach(r => { const a = ai >= 0 ? num(r[ai]) : null; if (a != null) allW.push({ n: r[0], k: c.k, a }); }); });
    const wTop = allW.slice().sort((a, b) => b.a - a.a)[0];
    const bgStat = wStat.filter(s => s.k === '大剑')[0];
    const ssStat = wStat.filter(s => s.k === '单手剑')[0];
    /* 符咒：攻击列整列空；数值在「魔攻」 */
    const charm = C.filter(c => c.k === '符咒')[0];
    const charmAtkEmpty = charm ? charm.rows.filter(r => { const ai = iAtk(charm); return ai >= 0 && (r[ai] === '—' || !r[ai]); }).length : 0;
    const iMatk = charm ? charm.head.findIndex(h => h.indexOf('魔攻') >= 0) : -1;
    const charmTop = (charm && iMatk >= 0)
        ? charm.rows.map(r => ({ n: r[0], v: num(r[iMatk]) })).filter(x => x.v != null).sort((a, b) => b.v - a.v)[0]
        : null;

    /* 卖价高于买价 */
    const over = flat.filter(x => x.b != null && x.s != null && x.b > 0 && x.s > x.b);
    const decor = C.filter(c => c.k === '摆设')[0];
    /* 建筑三类（建筑物／地形／摆设）的买价整列是同一个固定值，只有卖价与制作花费逐件不同 */
    const buildCats = C.filter(c => c.k === '建筑物' || c.k === '地形' || c.k === '摆设');
    const buildBuy = {};
    buildCats.forEach(c => {
        const bi = iBuy(c);
        if (bi < 0) return;
        c.rows.forEach(r => { const v = r[bi] || '—'; buildBuy[v] = (buildBuy[v] || 0) + 1; });
    });
    const buildBuyTop = Object.keys(buildBuy).sort((a, b) => buildBuy[b] - buildBuy[a])[0];
    const buildFixed = buildBuy[buildBuyTop] || 0;
    const buildBuyNone = buildBuy['—'] || 0;
    const isBuild = k => k === '建筑物' || k === '地形' || k === '摆设';
    const overNoDecor = over.filter(x => !isBuild(x.k));
    const zero = flat.filter(x => x.b === 0 && x.s === 0);
    const buildRange = (kw) => {
        const g = [];
        buildCats.forEach(c => {
            const i = c.head.findIndex(h => h.indexOf(kw) >= 0);
            if (i < 0) return;
            c.rows.forEach(r => {
                const v = num(String(r[i]).replace(/G$/, ''));
                if (v != null) g.push({ n: r[0], v: v, k: c.k });
            });
        });
        if (!g.length) return null;
        return { lo: g.slice().sort((a, b) => a.v - b.v)[0], hi: g.slice().sort((a, b) => b.v - a.v)[0] };
    };
    const decoSell = buildRange('卖价');
    const decoCost = buildRange('制作花费');
    /* 各类卖价头名，供文案引用 */
    const topOf = k => {
        const c = C.filter(x => x.k === k)[0];
        if (!c) return null;
        const si = iSell(c);
        const g = c.rows.map(r => ({ n: r[0], s: si >= 0 ? num(r[si]) : null })).filter(x => x.s != null);
        return g.length ? g.slice().sort((a, b) => b.s - a.s)[0] : null;
    };
    const topShoulder = topOf('肩甲'), topAcc = topOf('饰品'), topTerrain = topOf('地形');
    const ceilStat = wStat.slice().sort((a, b) => (b.top ? b.top.a : 0) - (a.top ? a.top.a : 0))[0];
    const floorStat = wStat.slice().sort((a, b) => (a.bot ? a.bot.a : 1e9) - (b.bot ? b.bot.a : 1e9))[0];
    const spanSorted = wStat.filter(s => s.span != null).slice().sort((a, b) => b.span - a.span);
    const overSorted = overNoDecor.slice().sort((a, b) => (b.s / b.b) - (a.s / a.b));
    const weaponCat = W.reduce((a, c) => a + c.rows.length, 0);
    const buildCat = C.filter(c => c.k === '建筑物' || c.k === '地形' || c.k === '摆设').reduce((a, c) => a + c.rows.length, 0);
    const matSlots = flat.reduce((a, x) => a + x.m.length, 0);
    const buildMaxSell = Math.max.apply(null, flat.filter(x => isBuild(x.k) && x.s != null).map(x => x.s));
    /* 建筑三类里要用木材/竹材或石材的有多少条 */
    const buildWood = flat.filter(x => x.k === '建筑物' || x.k === '地形' || x.k === '摆设')
        .filter(x => x.m.some(m => m.indexOf('木材') >= 0 || m.indexOf('竹材') >= 0 || m.indexOf('石材') >= 0)).length;

    /* ---------- 药学（15 条）：两条四级链、两处合流、五种解状态秘药 ----------
       判据全部来自源表的「材料」列：某条的材料里出现本表另一件的名字，就是「拿上一级做下一级」。
       只引用一件＝升级；引用两件＝两条链合流；不引用任何本表成品、且自己没有下级＝独立条目。 */
    const MED = C.filter(c => c.k === '药学')[0] || null;
    const med = (() => {
        if (!MED) return null;
        const h = MED.head;
        const ix = kw => h.findIndex(x => x.indexOf(kw) >= 0);
        const iHP = ix('恢复HP'), iHPp = ix('恢复HP%'), iRP = ix('恢复RP'), iRPp = ix('恢复RP%');
        const iEff = ix('特效'), iUnl = ix('解锁'), iBox = ix('宝箱'), iShop = ix('商店');
        const iB = iBuy(MED), iS = iSell(MED);
        const rows = MED.rows, names = rows.map(r => r[0]);
        const has = v => !!v && v !== '—';
        const refs = rows.map(r => {
            const out = [];
            for (let i = 1; i <= 4; i++) {
                if (!has(r[i])) continue;
                const nm = String(r[i]).split('×')[0].trim();
                if (names.indexOf(nm) >= 0 && out.indexOf(nm) < 0) out.push(nm);
            }
            return out;
        });
        const nextOf = {};
        refs.forEach((rf, i) => { if (rf.length === 1) nextOf[rf[0]] = names[i]; });
        const starts = names.filter((n, i) => refs[i].length === 0 && nextOf[n]);
        const chainOf = st => { const out = []; let cur = st; while (cur && out.indexOf(cur) < 0) { out.push(cur); cur = nextOf[cur]; } return out; };
        const chains = starts.map(st => {
            const r0 = rows[names.indexOf(st)];
            return { k: has(r0[iRP]) ? 'RP' : 'HP', list: chainOf(st) };
        });
        const pos = {};
        chains.forEach(ch => ch.list.forEach((n, i) => { pos[n] = { k: ch.k, lv: i + 1 }; }));
        const byName = n => rows[names.indexOf(n)];
        const rec = r => {
            const p = [];
            if (has(r[iHP])) p.push('HP ' + r[iHP]);
            if (has(r[iHPp])) p.push('HP ' + r[iHPp]);
            if (has(r[iRP])) p.push('RP ' + r[iRP]);
            if (has(r[iRPp])) p.push('RP ' + r[iRPp]);
            return p.length ? p.join('・') : '';
        };
        const mats = r => r.slice(1, 5).filter(has).join('、') || '<span class="mon-no">—</span>';
        const merges = names.filter((n, i) => refs[i].length > 1);
        const indep = names.filter((n, i) => refs[i].length === 0 && !nextOf[n] && has(rows[i][iEff]));
        const fixedRows = rows.filter(r => has(r[iHP]) || has(r[iRP]));
        const pctRows = rows.filter(r => has(r[iHPp]) || has(r[iRPp]));
        const noSrc = rows.filter(r => !has(r[iUnl]) && !has(r[iBox]) && !has(r[iShop]));
        const indepUnl = {}, indepShop = {};
        indep.forEach(n => {
            const r = byName(n);
            indepUnl[r[iUnl]] = (indepUnl[r[iUnl]] || 0) + 1;
            indepShop[r[iShop]] = (indepShop[r[iShop]] || 0) + 1;
        });
        const sameUnl = Object.keys(indepUnl).length === 1 ? Object.keys(indepUnl)[0] : null;
        const sameShop = Object.keys(indepShop).length === 1 ? Object.keys(indepShop)[0] : null;
        const chainRows = [], mergeRows = [], indepRows = [];
        const chainText = ch => ch.list.map(n => n + ' ' + (rec(byName(n)) || '—')).join(' → ');
        const hpCh = chains.filter(c => c.k === 'HP')[0] || null;
        const rpCh = chains.filter(c => c.k === 'RP')[0] || null;
        chains.forEach(ch => ch.list.forEach((n, i) => {
            const r = byName(n);
            chainRows.push([ch.k + ' 链', (i + 1) + ' 级', '<b>' + n + '</b>', mats(r),
                rec(r) || '<span class="mon-no">—</span>', money(num(r[iB])), money(num(r[iS]))]);
        }));
        merges.forEach(n => {
            const r = byName(n);
            const from = refs[names.indexOf(n)].map(x => x + '（' + pos[x].k + ' 链 ' + pos[x].lv + ' 级）').join(' ＋ ');
            mergeRows.push(['<b>' + n + '</b>', from, mats(r), rec(r) || '<span class="mon-no">—</span>',
                money(num(r[iB])), money(num(r[iS]))]);
        });
        indep.forEach(n => {
            const r = byName(n);
            indepRows.push(['<b>' + n + '</b>', mats(r), r[iEff]]);
        });
        return {
            rows, names, refs, chains, pos, byName, rec, mats, merges, indep,
            fixedRows, pctRows, noSrc, indepUnl, indepShop, sameUnl, sameShop,
            chainRows, mergeRows, indepRows, chainText, hpCh, rpCh, nChain: Object.keys(pos).length,
            buyOf: n => { const r = byName(n); return r ? num(r[iB]) : null; },
            sellOf: n => { const r = byName(n); return r ? num(r[iS]) : null; },
        };
    })();

    /* 卖价最高 */
    const sellTop = flat.filter(x => x.s != null).slice().sort((a, b) => b.s - a.s).slice(0, 8);
    const topAllWeapon = sellTop.every(x => W.some(c => c.k === x.k));

    /* 解锁条件 */
    const noUnlock = flat.filter(x => !x.u).length;
    const spotRe = /^(龙柩城|罗刹峡|根之国|奇缘殿|雪狼岳|秋之草原|勿忘竹林|翠风洞|天之国|樱幻异乡|结缘神社|春之台地|夏之海边|冬之原野|金华坑道|终末之森|宵暗之牢|冰牙洞|机关迷宫|竹笋岛|垂钓岛|妖怪岛|朦胧岛|东三龟岛)/;
    const task = flat.filter(x => x.u.indexOf('任务') === 0).length;
    const kizuna = flat.filter(x => x.u.indexOf('牵绊') >= 0).length;
    const frog = flat.filter(x => x.u.indexOf('青蛙石') >= 0).length;
    const spotCnt = {};
    flat.forEach(x => { const m = x.u.match(spotRe); if (m) spotCnt[m[1]] = (spotCnt[m[1]] || 0) + 1; });
    const spotList = Object.keys(spotCnt).sort((a, b) => spotCnt[b] - spotCnt[a]);
    /* 建筑三类的解锁条件构成：青蛙石 / 任务 / 村等级 / 无 */
    const buildStat = (() => {
        const B = flat.filter(x => x.k === '建筑物' || x.k === '地形' || x.k === '摆设');
        if (!B.length) return null;
        const s = { n: B.length, frog: 0, task: 0, lv: 0, none: 0, other: 0 };
        B.forEach(x => {
            if (!x.u) s.none++;
            else if (x.u.indexOf('青蛙石') >= 0) s.frog++;
            else if (x.u.indexOf('任务') >= 0) s.task++;
            else if (x.u.indexOf('等级') >= 0) s.lv++;
            else s.other++;
        });
        return s;
    })();

    return `
    <h2 class="h2">${total} 条配方，十二张表：武器五类、防具三类、建筑三类、药学</h2>
    <p class="p">龙之天地的配方没有一张总表，源站是<b>按品类拆成十二篇</b>的——五类武器各一篇、头部／肩甲／饰品各一篇、建筑物／地形／摆设各一篇，药学单独一篇。<b>这十二张表的列位并不一致</b>：武器的「攻击」「魔攻」、防具换成「防御力」「魔防」、建筑换成「所属系列」「制作花费」，药学的恢复量还分 HP／HP%／RP／RP% 四列。本页把它们并成一张可搜索的总目录，同时保留各表的原列。</p>
    ${stat([['配方', total + ' 条'], ['品类', C.length + ' 类'], ['素材名', matList.length + ' 种'], ['无解锁条件', noUnlock + ' 条']])}
    <h2 class="h2">十二类各多少条：${bigCat.k}最多，占了 ${Math.round(bigCat.rows.length / total * 100)}%</h2>
    <p class="p">按条数排，<b>${bigCat.k}</b> 一类就有 ${bigCat.rows.length} 条${bigCat.rows.length > weaponCat ? '，比武器五类加起来（' + weaponCat + ' 条）还多' : ''}。每一类的卖价头名各不相同，下表最后一列就是各类卖价最高的成品：</p>
    ${tbl(['品类', '条数', '该类卖价最高', '源文'], catRows, { leftFirst: true, colw: ['7rem', '5rem', 'auto', '6.4rem'] })}
    <div class="key"><b>卖价的天花板全在武器上</b>：全表最贵的是 <b>${sellTop[0].n}（${sellTop[0].k}，${money(sellTop[0].s)}）</b>${topAllWeapon ? '，前八名清一色是武器' : ''}。${topShoulder && topAcc ? '防具里最高的是肩甲的 <b>' + topShoulder.n + '（' + money(topShoulder.s) + '）</b>，是饰品头名「' + topAcc.n + '」的 ' + (topShoulder.s / topAcc.s).toFixed(1) + ' 倍。' : ''}<b>建筑／地形／摆设的卖价${buildMaxSell < 10000 ? '全在五位数以下' : '最高也只有 ' + money(buildMaxSell)}</b>${topTerrain ? '——地形这一类里最贵的「' + topTerrain.n + '」只卖 ' + money(topTerrain.s) : ''}，这三类不是拿来卖的。</div>

    <h2 class="h2">五类武器：攻击力阶梯与各类型的顶配</h2>
    <p class="p">武器五类的攻击列都能读到数（<b>只有符咒例外</b>：${charm && charmAtkEmpty === charm.rows.length ? '它的「攻击」列整列 ' + charm.rows.length + ' 条全是「—」，数值只写在「魔攻」列' : charmAtkEmpty + ' 条的「攻击」写的是「—」'}）。各类型的下限与上限：</p>
    ${tbl(['类型', '有攻击数值', '最低攻击', '最高攻击', '该件卖价'], wRows, { leftFirst: true, colw: ['5.6rem', '6.4rem', '5.6rem', 'auto', '5.4rem'] })}
    <div class="key">全表攻击最高的是 <b>${wTop.n}（${wTop.k}，${wTop.a.toLocaleString()}）</b>，也就是${ceilStat.k}的上限；下限最低的是${floorStat.k}的 <b>${floorStat.bot.n}（${floorStat.bot.a}）</b>。<b>跨度最大的是${spanSorted[0].k}</b>：从「${spanSorted[0].bot.n} ${spanSorted[0].bot.a.toLocaleString()}」到「${spanSorted[0].top.n} ${spanSorted[0].top.a.toLocaleString()}」，${spanSorted[0].span.toFixed(0)} 倍；${spanSorted[1].k}紧随其后（${spanSorted[1].span.toFixed(0)} 倍），跨度最窄的是${spanSorted[spanSorted.length - 1].k}（${spanSorted[spanSorted.length - 1].span.toFixed(0)} 倍）。<b>符咒别按攻击挑</b>，它的数值全在「魔攻」列${charmTop ? '，最高那条是「' + charmTop.n + '」（魔攻 ' + charmTop.v.toLocaleString() + '）' : ''}。</div>

    <h2 class="h2">屯什么素材：${matList.length} 种里，前三样占了 ${Math.round(base3n / matSlots * 100)}% 的材料位</h2>
    <p class="p">${total} 条配方一共用到 <b>${matList.length} 种素材</b>、${matSlots} 个材料位。用得最多的十二种：</p>
    ${tbl(['素材', '被几条配方用到'], matList.slice(0, 12).map(k => [k, mat[k] + ' 条']), { leftFirst: true, colw: ['auto', 'auto'] })}
    <div class="key"><b>${base3.map(k => k + ' ' + (mat[k] || 0) + ' 条').join('、')}</b>——这三样出现在 ${base3n} 个材料位里，占全部材料位的 ${Math.round(base3n / matSlots * 100)}%。<b>它们主要不是被武器消耗的，是被建筑吃掉的</b>：建筑物／地形／摆设三类共 ${buildCat} 条配方，其中 <b>${buildWood} 条（${Math.round(buildWood / buildCat * 100)}%）</b>要用到木材／竹材或石材。想把村庄建起来，先备木材石材；想锻武器，要的是白金 ${mat['白金'] || 0} 条、银 ${mat['银'] || 0} 条这一档。<b>另有 ${single} 条配方只要一种材料</b>${emptyMat ? '，' + emptyMat + ' 条一个材料都不填（' + flat.filter(x => !x.m.length).map(x => x.k + '「' + x.n + '」').join('、') + '，原表如此）' : ''}。</div>

    <h2 class="h2">卖价高于买价的，去掉建筑三类只剩 ${overNoDecor.length} 条</h2>
    <p class="p">把每一类的买价与卖价并排比，绝大多数成品卖出去只有买价的五到七成。剩下的例外只有 ${overNoDecor.length} 条，落在 ${new Set(overNoDecor.map(x => x.k)).size} 个品类里：</p>
    ${tbl(['成品', '品类', '买入', '卖出', '卖价／买价'], overSorted.map(x => [x.n, x.k, money(x.b), money(x.s), (x.s / x.b).toFixed(2) + ' 倍']), { leftFirst: true, colw: ['auto', '5.4rem', '5.4rem', 'auto', '5.4rem'] })}
    <div class="key">${overSorted.length ? '价差最大的是<b>' + overSorted[0].k + '的「' + overSorted[0].n + '」，买 ' + money(overSorted[0].b) + ' 卖 ' + money(overSorted[0].s) + '，差 ' + (overSorted[0].s / overSorted[0].b).toFixed(1) + ' 倍</b>' : ''}${overSorted.length > 1 ? '；其次是' + overSorted.slice(1, 3).map(x => x.k + '「' + x.n + '」（' + (x.s / x.b).toFixed(1) + ' 倍）').join('与') : ''}。<b>但源表只给了这两个价，没写这些成品能不能重复购买</b>——本页只照录，不做「买来倒卖」的结论。</div>
    <details class="mon-fold">
        <summary>建筑三类的「买价」是整列固定值（点开看为什么）</summary>
        <p class="p">建筑物／地形／摆设三类共 ${buildCat} 条里，<b>${buildFixed} 条的买价全写同一个数「${buildBuyTop}」</b>，${buildBuyNone} 条写「—」，<b>没有一条是逐件定价</b>。拿这个数算利润率没有意义。</p>
        <p class="p">这也解释了为什么「卖价 > 买价」的 ${over.length} 条里有 ${over.length - overNoDecor.length} 条落在摆设——不是摆设能套利，而是这一列的买价本来就没填真实价格。这三类真正逐件不同的是卖价与制作花费两列${decoSell ? '：卖价从' + decoSell.lo.k + '的「' + decoSell.lo.n + '」' + money(decoSell.lo.v) + ' 到' + decoSell.hi.k + '的「' + decoSell.hi.n + '」' + money(decoSell.hi.v) : ''}${decoCost ? '；制作花费从「' + decoCost.lo.n + '」的 ' + decoCost.lo.v + 'G 到「' + decoCost.hi.n + '」的 ' + decoCost.hi.v.toLocaleString() + 'G' : ''}。</p>
    </details>

    ${med ? `
    <h2 class="h2">药学 ${med.rows.length} 条：两条四级链，末端合成同一种「万能药」</h2>
    <p class="p">上一段那张「卖价高于买价」的榜里，<b>「高扬秘药」是唯一一条药学</b>（买 ${money(med.buyOf('高扬秘药'))}、卖 ${money(med.sellOf('高扬秘药'))}）。它不是孤立的漏网条目——这张表其实是<b>按「上一级 ＋ 一两种草」一级级叠出来的</b>：${med.rows.length} 条里 <b>${med.nChain} 条构成两条四级链</b>，<b>${med.merges.length} 条是两条链合流</b>，剩下 <b>${med.indep.length} 条</b>互不相干、各自用原料做。</p>
    <p class="p">下面的判据<b>不用猜</b>：源表的「材料」列里出现了本表另一件的名字，那就是拿它当原料。只引用一件＝上一级；引用两件＝两条链并到一起。</p>
    ${tbl(['链', '级别', '成品', '材料（原文）', '恢复量', '买入', '卖出'], med.chainRows, { leftFirst: true, cls: 'azuq', colw: ['3.6rem', '3.6rem', '6.4rem', 'auto', '7rem', '5.2rem', '5.2rem'] })}
    <div class="key"><b>前三级全是定值，到第四级才换成百分比。</b>两条链读下来是这样——<b>HP</b>：${med.chainText(med.hpCh)}；<b>RP</b>：${med.chainText(med.rpCh)}。<b>百分比只出现在链尾与合流件上</b>（${med.pctRows.map(r => r[0]).join('、')}，共 ${med.pctRows.length} 条），中间三级一条都没有——推链的时候别指望「越往上数字越大就行」，第四级换的是量纲，不是继续加数。</div>

    <h2 class="h2">合流：两条链在半路并一次，在终点又并一次</h2>
    <p class="p">两条链不是平行的死线，<b>各有一条合流件</b>——把 HP 链与 RP 链当原料吃到一起。而这两件，也正好是<b>整张药学表里买价最高的两条</b>：</p>
    ${tbl(['成品', '由哪几级合成', '材料（原文）', '恢复量', '买入', '卖出'], med.mergeRows, { leftFirst: true, cls: 'azuq', colw: ['6.4rem', 'auto', 'auto', '7rem', '5.4rem', '5.2rem'] })}
    <div class="key"><b>两条合流件的位置不一样</b>：<b>无敌秘药接在两条链的终点</b>（魔宝壶 ＋ 高扬秘药），所以它要先把两条链都推满；<b>醒神药只接第三级</b>（神秘壶×2 ＋ 一瓶满足×2），但额外要「心跳菇」与「白草」两件采集物，并且它的恢复量只写在 HP 上（${med.rec(med.byName('醒神药'))}）、RP 列是空的——<b>别以为买下药学里最贵的那瓶（${money(med.buyOf('醒神药'))}）就 HP／RP 一起满</b>。</div>

    <h2 class="h2">剩下 ${med.indep.length} 条：只差「解的是哪一种状态」</h2>
    <p class="p">这 ${med.indep.length} 条的原料互不相同、也不吃任何成品，共同点只有一个——<b>都是解状态</b>，而且<b>四条恢复列全空</b>：不回复 HP，也不回复 RP，纯粹拿来治病。</p>
    ${tbl(['成品', '材料（原文）', '解除'], med.indepRows, { leftFirst: true, cls: 'azuq', colw: ['6.4rem', 'auto', '8rem'] })}
    <div class="key">这 ${med.indep.length} 条的「解锁条件」与「商店」<b>完全一样，一个字都不差</b>：${med.sameUnl ? '解锁全写「' + med.sameUnl + '」' : '解锁条件不统一'}、${med.sameShop ? '商店全是「' + med.sameShop + '」' : '商店不统一'}。<b>所以关键不是跑五个地方，是把那处地方跑一次、把五味草都备齐</b>；做出来之后五瓶在同一家店都能补货。<b>另有 ${med.noSrc.length} 条（${med.noSrc.map(r => r[0]).join('、')}）三列来源全空</b>——源表没写哪买、哪捡、哪个宝箱，本页照录为空，不补。</div>
    ` : ''}

    <h2 class="h2">解锁条件：${noUnlock} 条没有条件，${task} 条靠任务，${frog} 条靠青蛙石</h2>
    <p class="p">源表的「解锁条件」一列写法很杂：地名、任务名、牵绊等级、宝箱、青蛙石、NPC 对话都混在一起。<b>${noUnlock} 条（${Math.round(noUnlock / total * 100)}%）这一列是「—」</b>，也就是一开局就能做。能归到地名上的按地方数一遍：</p>
    ${tbl(['解锁地点', '解锁了几条'], spotList.slice(0, 12).map(k => [k, spotCnt[k] + ' 条']), { leftFirst: true, colw: ['auto', 'auto'] })}
    <div class="key">${spotList.length ? '归到地名上最多的是 <b>' + spotList[0] + '</b>（' + spotCnt[spotList[0]] + ' 条），意味着主线要推到那里才解锁对应配方。' : ''}另有 <b>${task} 条</b>要完成委托任务、<b>${kizuna} 条</b>要刷某人牵绊、<b>${frog} 条</b>要去敲青蛙石拿。${buildStat ? '拆开看，建筑／地形／摆设这三类 ' + buildStat.n + ' 条里，<b>' + buildStat.frog + ' 条靠青蛙石、' + buildStat.task + ' 条靠任务、' + buildStat.lv + ' 条看村子等级</b>，剩下 ' + buildStat.none + ' 条不写条件——想建村庄，敲石头与推村等级比刷怪重要得多。' : ''}</div>

    <h2 class="h2">全部 ${total} 条，可按名字／素材／解锁条件搜索</h2>
    <p class="p">十二张表并成一张。材料列照原表列到第 4 个材料位为止，原表写「—」的不显示。<b>建筑三类的买价会一律显示「10,000G」</b>，那是原表的固定值，不是真实定价（见上方折叠块）：</p>
    ${ftableOwn(['成品', '品类', '材料', '买价', '卖价', '解锁条件'],
        ['auto', '5.2rem', 'auto', '5rem', '5.4rem', 'auto'],
        flat.map(x => [x.n + ' ' + x.k + ' ' + x.m.join(' ') + ' ' + x.u,
            [x.n, x.k, x.m.length ? x.m.join('、') : '<span class="mon-no">—</span>',
                money(x.b), money(x.s), dash(x.u)]]),
        { ph: '输入成品名、素材或解锁条件' })}
    <div class="note">取自 ${R.src}，十二篇共 ${total} 行，逐篇解析后合并；每类条数与源文号见上方「十二类各多少条」表。<b>本页不改原表数值</b>：「—」照录为「—」${zero.length ? '，「买价 0／卖价 0」的照录为 0（' + zero.map(x => x.k + x.n).join('、') + ' 共 ' + zero.length + ' 条）' : ''}，摆设表里「木材×290120」「石材×」这种数字粘连与缺数的格子也照录未改。<b>龙之天地的料理配方源页是图片，没有可解析的表格</b>，所以本页不含料理——缺的是这一块，不是漏抓。</div>
    <div class="jump">
        <a href="#/page/source"><div class="jp-t">素材出处与掉落</div><div class="jp-s">这些材料打谁掉</div></a>
        <a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">素材品质与技能等级怎么决定成品</div></a>
        <a href="#/page/fishspot"><div class="jp-t">钓点与季节</div><div class="jp-s">药学要用的鱼在哪钓</div></a>
    </div>`;
}

/* ------------------------------------------------------------
   符文工房3（RF3 / RF3SP）配方大全
   源：js/recipe_rf3.js（biligame 四张 RF3recipe* 页，_build_recipe_rf3.py 生成）
   四组表列位各不相同，故按组分别渲染：武器 15 列、防具与饰品 17 列、
   农具 7 列（一种农具一张表）、药学 12 列（自带「类别」）。
   ⚠️ RF3 与 RF3SP 共用这一份数据：两版用 /^rf3/ 判断，不各列一遍。
   ------------------------------------------------------------ */
function recipeRf3Html() {
    const D = (typeof RECIPE_RF3 !== 'undefined') ? RECIPE_RF3 : null;
    if (!D || !D.groups) return '';
    const G = D.groups;
    const grp = k => (G.filter(x => x.k === k)[0] || { cats: [] }).cats;
    const N = v => /^\d+$/.test(String(v).replace(/G$/, '')) ? +String(v).replace(/G$/, '') : null;
    const dash = '<span class="mon-no">—</span>';
    const money = v => N(v) == null ? dash : N(v).toLocaleString() + 'G';
    const clean = v => (v == null || v === '' || v === '—' || v === '-' || v === '–') ? '' : v;
    const idx = (h, kw) => h.findIndex(x => x.indexOf(kw) >= 0);
    const mats = (r, h) => h.map((x, i) => ({ x: x, i: i }))
        .filter(o => o.x.indexOf('材料') === 0).map(o => clean(r[o.i])).filter(Boolean);

    /* ---------- 武器：7 类，列位相同 ---------- */
    const WC = grp('武器');
    const wRow = c => {
        const h = c.head;
        const iL = idx(h, '等级'), iA = idx(h, '攻击'), iM = idx(h, '魔法攻击'), iAt = idx(h, '属性'),
            iE = idx(h, '其它特效'), iB = idx(h, '买价'), iS = idx(h, '卖价');
        return c.rows.map(r => ({
            k: c.n, n: r[0], lv: N(r[iL]), m: mats(r, h),
            a: clean(r[iA]), mg: clean(r[iM]), at: clean(r[iAt]), e: clean(r[iE]),
            b: N(r[iB]), s: N(r[iS])
        }));
    };
    const wFlat = [];
    WC.forEach(c => wRow(c).forEach(x => wFlat.push(x)));

    /* ---------- 防具与饰品：4 类 ---------- */
    const AC = grp('防具与饰品');
    const aRow = c => {
        const h = c.head;
        const iL = idx(h, '等级'), iD = idx(h, '防御力'), iMd = idx(h, '魔法防御力'),
            iR1 = idx(h, '属性抗性'), iR2 = idx(h, '异常状态抗性'), iAt = idx(h, '攻击属性'),
            iE = idx(h, '其它效果'), iB = idx(h, '买价'), iS = idx(h, '卖价');
        return c.rows.map(r => ({
            k: c.n, n: r[0], lv: N(r[iL]), m: mats(r, h),
            d: clean(r[iD]), md: clean(r[iMd]), r1: clean(r[iR1]), r2: clean(r[iR2]),
            at: clean(r[iAt]), e: clean(r[iE]), b: N(r[iB]), s: N(r[iS])
        }));
    };
    const aFlat = [];
    AC.forEach(c => aRow(c).forEach(x => aFlat.push(x)));

    /* ---------- 农具：一种农具一张表，5 档 ---------- */
    const TC = grp('农具');
    const tFlat = [];
    TC.forEach(c => {
        const h = c.head;
        const iJp = idx(h, '官译'), iCn = idx(h, 'NDS'), iShop = idx(h, '商店'),
            iAt = idx(h, '属性'), iL = idx(h, '等级'), iM = idx(h, '材料'), iC = idx(h, '蓄力');
        c.rows.forEach(r => tFlat.push({
            k: c.n, n: r[iJp], cn: r[iCn], shop: r[iShop], at: r[iAt],
            lv: N(r[iL]), m: clean(r[iM]), ch: clean(r[iC])
        }));
    });

    /* ---------- 药学：自带类别列 ---------- */
    const PC = grp('药学');
    const pFlat = [];
    PC.forEach(c => {
        const h = c.head;
        const iK = idx(h, '类别'), iL = idx(h, '等级'), iE = idx(h, '效果'),
            iB = idx(h, '买价'), iS = idx(h, '卖价');
        c.rows.forEach(r => pFlat.push({
            k: r[iK], n: r[1], lv: N(r[iL]), m: mats(r, h),
            e: clean(r[iE]), b: N(r[iB]), s: N(r[iS])
        }));
    });

    /* ---------- 现算的统计 ---------- */
    const lvAll = wFlat.concat(aFlat, pFlat, tFlat).map(x => x.lv).filter(v => v != null);
    const lvLo = Math.min.apply(null, lvAll), lvHi = Math.max.apply(null, lvAll);
    const rng = a => {
        const v = a.map(x => x.lv).filter(x => x != null);
        return v.length ? 'Lv' + Math.min.apply(null, v) + '–' + Math.max.apply(null, v) : '—';
    };

    const matCnt = {};
    wFlat.forEach(x => x.m.forEach(m => { matCnt[m] = (matCnt[m] || 0) + 1; }));
    aFlat.forEach(x => x.m.forEach(m => { matCnt[m] = (matCnt[m] || 0) + 1; }));
    pFlat.forEach(x => x.m.forEach(m => { matCnt[m] = (matCnt[m] || 0) + 1; }));
    tFlat.forEach(x => String(x.m).split(/[+＋]/).map(s => s.trim()).filter(s => s && s !== '—')
        .forEach(m => { matCnt[m] = (matCnt[m] || 0) + 1; }));
    const matKeys = Object.keys(matCnt).sort((a, b) => matCnt[b] - matCnt[a]);
    const matTop = matKeys.slice(0, 6);

    /* 链式锻造：配方材料里出现另一件武器的行数 */
    const wNames = new Set(wFlat.map(x => x.n));
    const chainRows = wFlat.filter(x => x.m.some(m => wNames.has(m)));
    const chainPrev = {};
    chainRows.forEach(x => x.m.filter(m => wNames.has(m)).forEach(m => { chainPrev[m] = (chainPrev[m] || 0) + 1; }));
    const prevTop = Object.keys(chainPrev).sort((a, b) => chainPrev[b] - chainPrev[a]).slice(0, 4);

    const wTop = wFlat.filter(x => x.s != null).slice().sort((a, b) => b.s - a.s)[0];
    const aTop = aFlat.filter(x => x.s != null).slice().sort((a, b) => b.s - a.s)[0];
    const wCost = wFlat.filter(x => x.b != null).slice().sort((a, b) => b.b - a.b)[0];
    const pKind = {};
    pFlat.forEach(x => { pKind[x.k] = (pKind[x.k] || 0) + 1; });
    const pKeys = Object.keys(pKind).sort((a, b) => pKind[b] - pKind[a]);

    /* 材料位占用：6 格用满的有多少 */
    const slotUse = {};
    wFlat.concat(aFlat, pFlat).forEach(x => { slotUse[x.m.length] = (slotUse[x.m.length] || 0) + 1; });
    const slotKeys = Object.keys(slotUse).map(Number).sort((a, b) => a - b);
    const slotFull = slotUse[6] || 0;
    const slotTotal = wFlat.length + aFlat.length + pFlat.length;

    /* 农具的档位与材料递进 */
    const toolLv = TC.length && TC[0].rows.length ? TC[0].rows.map(r => N(r[idx(TC[0].head, '等级')])) : [];

    /* 与站内「武器数值表」交叉核对（EQW_RF3，188 件） */
    const eqw = (typeof EQW_RF3 !== 'undefined') ? EQW_RF3.map(x => x[0]) : [];
    const lackInRecipe = eqw.filter(n => !wNames.has(n));
    const onlyInRecipe = Array.from(wNames).filter(n => eqw.indexOf(n) < 0);
    const toolish = onlyInRecipe.filter(n => /锤|斧/.test(n));

    const rowW = x => [x.n + ' ' + x.k + ' ' + x.m.join(' '), [
        x.n, x.k, x.lv == null ? dash : 'Lv' + x.lv,
        x.m.length ? x.m.join('＋') : dash,
        (x.a || '—') + ' / ' + (x.mg || '—'),
        x.at || dash,
        x.e || dash,
        money(x.b), money(x.s),
    ]];
    const rowA = x => [x.n + ' ' + x.k + ' ' + x.m.join(' '), [
        x.n, x.k, x.lv == null ? dash : 'Lv' + x.lv,
        x.m.length ? x.m.join('＋') : dash,
        (x.d || '—') + ' / ' + (x.md || '—'),
        [x.r1, x.r2].filter(Boolean).join('／') || '—',
        [x.at, x.e].filter(Boolean).join('／') || '—',
        x.b == null ? dash : money(x.b), money(x.s),
    ]];
    const rowT = x => [x.n + ' ' + x.cn + ' ' + x.k, [
        x.n, x.cn === x.n ? dash : x.cn, x.k, 'Lv' + x.lv,
        x.m ? x.m.split(/[+＋]/).join('＋') : dash, x.ch || dash, x.shop || dash,
    ]];
    const rowP = x => [x.n + ' ' + x.k + ' ' + x.m.join(' '), [
        x.k, x.n, x.lv == null ? dash : 'Lv' + x.lv,
        x.m.length ? x.m.join('＋') : dash, x.e || dash, money(x.b), money(x.s),
    ]];

    return `
        <p class="p">本页是<b>《符文工房3》</b>的配方大全：武器 ${wFlat.length} 条、防具与饰品 ${aFlat.length} 条、农具 ${tFlat.length} 条、药学 ${pFlat.length} 条，合计 <b>${wFlat.length + aFlat.length + tFlat.length + pFlat.length} 条</b>，分 ${WC.length + AC.length + TC.length + PC.length} 类。每条的「材料」是锻造／调合台上的实际投入，照源表逐格录，没有折算合成素材。</p>
        <div class="key"><b>本页不为 RF3 与 RF3SP 各列一份</b>：源站的四张配方表本身不分版本，站内也只维护这一份数据（两版都按 <code>rf3</code> 前缀取同一张表）。特别版相对本体以追加内容为主，但<b>本站没有两个版本的配方表可以逐条比对</b>，所以这里既不声称「SP 一条没改」，也不给任何一条配方标「SP 新增」——只把这一份照录。名字用 biligame 汉化版译法，与站内其它作的译名不一定一致。</div>
        ${stat([
        ['配方总数', (wFlat.length + aFlat.length + tFlat.length + pFlat.length) + ' 条'],
        ['类别', (WC.length + AC.length + TC.length + PC.length) + ' 类'],
        ['等级跨度', 'Lv' + lvLo + '–' + lvHi],
        ['素材种类', matKeys.length + ' 种'],
    ])}

        <h2 class="h2">四组配方：各组的列不一样，分开列</h2>
        <p class="p">四张源表的列位本来就不同——武器表带<b>攻击／魔攻／属性／其它特效</b>，防具表换成<b>防御／魔防／两种抗性</b>，农具表按<b>一种农具一张</b>竖着排还带两套译名，药学表自带<b>类别</b>列。合成一张大表会丢列，所以按组分四张，每张都能单独搜。</p>
        ${tbl(['组', '类别数', '条数', '等级范围', '代表性类别'],
        [
            ['武器', WC.length + ' 类', wFlat.length + ' 条', rng(wFlat), WC.map(c => c.n).join('／')],
            ['防具与饰品', AC.length + ' 类', aFlat.length + ' 条', rng(aFlat), AC.map(c => c.n + '（' + c.rows.length + '）').join('／')],
            ['农具', TC.length + ' 种', tFlat.length + ' 条', rng(tFlat), TC.map(c => c.n).join('／')],
            ['药学', pKeys.length + ' 类', pFlat.length + ' 条', rng(pFlat), pKeys.map(k => k + '（' + pKind[k] + '）').join('／')],
        ], { leftFirst: true, cls: 'txt', colw: ['7rem', '4.6rem', '4.6rem', '6.4rem', 'auto'], left: [4] })}

        <h2 class="h2">武器 ${wFlat.length} 条：${chainRows.length} 条拿另一件武器当材料</h2>
        <p class="p">这是 RF3 锻造最要紧的一条：<b>${chainRows.length} 条配方（${Math.round(100 * chainRows.length / wFlat.length)}%）的材料里写着另一件武器</b>，也就是「先打一把，再拿它当底料往上叠」。被当底料最多的是 <b>${prevTop.map(n => n + '（' + chainPrev[n] + ' 次）').join('、')}</b>——它们都是各类武器的第一、第二级，等于全系的起手件。所以锻造不是「凑齐材料做一把」，而是<b>沿着一条链往上爬</b>；中间哪一级漏了，后面那一串都做不了。</p>
        ${ftableOwn(['名称', '类别', '等级', '材料（＋分隔）', '攻击 / 魔攻', '属性', '其它特效', '买价', '卖价'],
        ['6.6rem', '5rem', '4.8rem', 'auto', '5.8rem', '4.2rem', 'auto', '6rem', '5.4rem'],
        wFlat.map(rowW), { ph: '搜武器名、类别或材料', cls: 'rec3', left: [3, 6] })}
        <div class="note">「攻击 / 魔攻」两列合成一格是为了省宽度；属性写「—」的是无属性武器。<b>买价最高的是 ${wCost.n}（${money(wCost.b)}）</b>，卖价最高的是 <b>${wTop.n}（${money(wTop.s)}）</b>——两者不是同一件，买价高得多是锻造铺的成品价，卖价只按 Lv1 品质折算，别拿买价当成本估收益。</div>

        <h2 class="h2">防具与饰品 ${aFlat.length} 条：饰品一项就占 ${AC.filter(c => c.n === '饰品').length ? AC.filter(c => c.n === '饰品')[0].rows.length : 0} 条</h2>
        <p class="p">四类里<b>饰品最多</b>，盾牌与头部装备反而最少——这一作的戒指与项链是主要战力来源（抗性、属性攻击、特殊效果都从这里出），防具本身只堆防御。卖价最高的是 <b>${aTop.n}（${money(aTop.s)}，${aTop.k}）</b>。</p>
        ${ftableOwn(['名称', '类别', '等级', '材料（＋分隔）', '防御 / 魔防', '抗性（属性／异常）', '攻击属性／其它效果', '买价', '卖价'],
        ['6.6rem', '5rem', '4.8rem', 'auto', '5.8rem', 'auto', 'auto', '6rem', '5.4rem'],
        aFlat.map(rowA), { ph: '搜防具名、类别或材料', cls: 'rec3', left: [3, 5, 6] })}

        <h2 class="h2">农具 ${tFlat.length} 条：${TC.length} 种 × ${TC.length ? TC[0].rows.length : 0} 档，等级固定 ${toolLv.filter(v => v != null).join('／')}</h2>
        <p class="p">六种农具都是 <b>5 档</b>，等级固定 <b>${toolLv.filter(v => v != null).map(v => 'Lv' + v).join('、')}</b>；从第 2 档起，材料的主料一律是<b>上一档的那把农具</b>（破洒水壶→马口铁洒水壶→狮子→彩虹→幸福的），追加材料则按档位换代。<b>五种用金属的农具都是 铜→银→金→白金 这一条线</b>，只有<b>钓竿例外</b>：强韧的蜘蛛丝→漂亮的蜘蛛丝→海盗哥布林的布→龟壳→古代鱼之骨，它不用金属。每档要几块也不统一——洒水壶每档 2 块、镰刀 1～2 块、锤子 3～5 块，蓄力效果同样不齐（洒水壶 3X3→3X9→6X9、锄头到 3X9 为止、锤子与斧头一律停在 3X3），这些逐行看表，别按一种农具推六种。表里同时给了<b>官译（简体）与 NDS 汉化版两套译名</b>。</p>
        ${ftableOwn(['官译（简体）', 'NDS 汉化译名', '农具', '锻造等级', '锻造材料', '蓄力', '商店贩卖'],
        ['7.6rem', '7.6rem', '4.6rem', '5.4rem', 'auto', 'auto', '5rem'],
        tFlat.map(rowT), { ph: '搜农具名或材料', cls: 'rec3', left: [4, 5] })}
        <div class="note">「NDS 汉化译名」列<b>只在与官译不同时留字</b>，两版一致的地方显示破折号——不是没查到，是同一把农具。已知不同的是这几处：${tFlat.filter(x => x.cn !== x.n).map(x => x.n + '→' + x.cn).join('、')}。<b>「商店贩卖」的 ○／×</b>是源表写法（能不能在店里直接买到），照录不改。</div>

        <h2 class="h2">药学 ${pFlat.length} 条：药剂 ${pKind['药剂'] || 0}、农药 ${pKind['农药'] || 0}、调味料 ${pKind['调味料'] || 0}</h2>
        <p class="p">源表把农药与调味料也算进药学——<b>农药</b>是喷在田里的，<b>调味料</b>是料理台上的，两者都不回血，所以别在战斗前翻这一栏找药。真正的恢复与强化类在「药剂」${pKind['药剂'] || 0} 条里。</p>
        ${ftableOwn(['类别', '名称', '等级', '材料（＋分隔）', '效果', '买价', '卖价'],
        ['4.6rem', '7.4rem', '4rem', 'auto', 'auto', '6rem', '5.4rem'],
        pFlat.map(rowP), { ph: '搜药名、类别或效果', cls: 'rec3', left: [3, 4] })}

        <h2 class="h2">材料位：6 格用满的有 ${slotFull} 条</h2>
        <p class="p">锻造／调合台一共 6 个材料位。${slotTotal} 条非农具配方里，用满 6 格的有 <b>${slotFull} 条</b>；只占 1 格的 <b>${slotUse[1] || 0} 条</b>多是最基础的起手件（阔剑只要一块铁）。出现次数最多的素材是 <b>${matTop.map(m => m + '（' + matCnt[m] + ' 次）').join('、')}</b>——贵金属之所以排在前头，是因为它们既当主料又当每级农具的加固件。</p>
        ${tbl(['占用材料位', '条数'], slotKeys.map(k => [k + ' 格', '<b>' + slotUse[k] + '</b> 条']), { leftFirst: true, colw: ['7rem', '6rem'] })}

        <h2 class="h2">与站内「武器数值表」对一遍：${onlyInRecipe.length} 件只在配方里，${lackInRecipe.length} 件对不上</h2>
        <p class="p">本站另有一张从 biligame《RF3weapon》抓的武器数值表（<code>EQW_RF3</code>，<b>${eqw.length} 件</b>）。两边并排对：<b>数值表里每一件在配方表里都查得到（缺 ${lackInRecipe.length} 件）</b>；反过来配方表多出 <b>${onlyInRecipe.length} 件</b>——${onlyInRecipe.join('、')}。这 ${toolish.length} 件全是<b>锤与斧</b>：数值表把农具锤／农具斧归进了农具页，配方页仍把它们列在锤／斧下，是<b>归类口径不同，不是缺数据</b>。两边数字差 ${onlyInRecipe.length} 件，正好等于这一批。</p>
        <div class="note"><b>料理配方不在这页</b>：RF3 的 ${(typeof RF3_RECIPE !== 'undefined') ? RF3_RECIPE.length : 0} 条料理配方（含「其它」成品）在 <a href="#/page/cook">料理</a> 页，那里按厨具分七类、并带食用效果。本页只收锻造、装饰与调合三类。<br>数据源：biligame 符文工厂 wiki 的 <code>RF3recipeweapon</code>／<code>RF3recipeornament</code>／<code>RF3recipefarmtool</code>／<code>RF3recipepharmacy</code> 四页，<code>_build_recipe_rf3.py</code> 生成 <code>js/recipe_rf3.js</code>。这是<b>网络 wiki，非官方解包</b>，数值以游戏内为准；源表空格写「—」或「-」，本页统一按破折号显示。RF3SP 与本体共用本表，不另列。</div>
        <div class="jump">
            <a href="#/page/cook"><div class="jp-t">料理</div><div class="jp-s">RF3 全套料理配方与食用效果</div></a>
            <a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">素材品质与技能等级怎么决定成品</div></a>
        </div>
    `;
}

/* ------------------------------------------------------------
   配方大全：符文工房1 / 符文工房2 —— 本站只有「药学」这一类
   源：biligame RF1recipepharmacy／RF2recipepharmacy（本地快照 _RF1recipepharmacy.txt 等），
   由 _build_recipe_rf12.py 生成 js/recipe_rf12.js。两作列位完全不同，各按表头找列、不合并列。
   ------------------------------------------------------------ */
/* 毕业装备（RF5 以外八作）：把 js/gearbest.js 的数据铺成页。
   各作源页的完成度差得很远——RF1 两张表填满、RF3 整篇文字没有表、
   RF2／边境／海洋的配方表在源站就是空壳——所以页面按「简介 → 搭配表 → 正文分块 →
   源站空壳 → 照录不改」的固定顺序铺，缺哪段跳过哪段，空壳单独点名。 */
function runeAllHtml(g) {
    const id = (g && g.id) || '';
    const D = (typeof RUNE_ALL !== 'undefined') ? RUNE_ALL[id] : null;
    if (!D) return `<p class="p">这一作暂时没有符文能力与魔法书的获取数据。RF4／RF4S 的内容在本页另有一版带筛选的呈现。</p>`;
    const T = D.tbl;
    const dash = c => (c === '—' || c === '') ? '<span class="mon-no">—</span>' : c;
    const rows = T.rows.map(r => [r.join(' '), r.map(dash)]);
    const left = T.head.map((_, i) => i);
    const li = x => x;

    const blockHtml = b => {
        let h = `<h2 class="h2">${b.h}</h2>`;
        if (b.p) h += b.p.map(t => `<p class="p">${t}</p>`).join('');
        if (b.ul) h += `<ul class="ul">${b.ul.map(x => `<li class="li">${li(x)}</li>`).join('')}</ul>`;
        if (b.note) h += `<div class="key">${b.note}</div>`;
        return h;
    };

    return `
        <p class="p">${(D.intro || []).join('')}</p>
        ${stat(D.stat || [])}
        <div class="note">源：<b>${D.src}</b>。${D.tag}。</div>

        <h2 class="h2">全表：${T.rows.length} 条</h2>
        ${ftableOwn(T.head, T.widths || [], rows, {
        ph: T.ph || '输入名字筛选',
        left: left,
        cls: 'runeall' + (T.wide ? ' runeall-w' : '')
    })}

        ${(D.blocks || []).map(blockHtml).join('')}

        ${(D.keeps || []).length ? `<h2 class="h2">照录不改的地方</h2>
        <ul class="ul">${D.keeps.map(t => `<li class="li">${t}</li>`).join('')}</ul>` : ''}

        <div class="note">这一页<b>只搬源站写了的东西</b>：源表不给数值的列就空着，不写效果的就不编效果。符文能力的效果与伤害数字在各作页里都缺失——想要具体数值，只能回游戏里试。</div>
        <div class="jump">
            <a href="#/page/weapon">
                <div class="jp-t">武器</div>
                <div class="jp-s">符文槽与武器属性一览</div>
            </a>
            <a href="#/page/mbook">
                <div class="jp-t">魔物图鉴</div>
                <div class="jp-s">打哪种魔物掉哪种符文</div>
            </a>
        </div>`;
}
function fx4sHtml(g) {
    const F = (typeof FX4S !== 'undefined') ? FX4S : null;
    if (!F || !F.elem || !F.elem.length) return `<p class="p">这一作暂时没有魔物与村民抗性的数据。</p>`;
    const EK = ['火', '水', '土', '风', '光', '暗', '无', '爱'];
    const AK = ['毒', '封印', '麻痹', '睡眠', '疲劳', '感冒', '即死', '吸收'];
    const CK = ['暴击率', '暴击抗', '眩晕抗', '攻击硬直', '攻击吹飞', '吹飞抗'];
    const E = F.elem, A = F.ail, C = F.crit, n = E.length;

    /* 数值原样保留（含小数），全部非负——4 代没有「弱点」概念。0% 压浅灰 */
    const fnum = s => { const m = String(s).match(/(-?\d+\.?\d*)%/); return m ? parseFloat(m[1]) : 0; };
    const v4 = s => {
        if (s === '0%') return '<span class="mon-no">0%</span>';
        if (String(s).indexOf('-') >= 0) return '<span class="dn">−' + String(s).replace('-', '') + '</span>';
        return s;
    };
    const col = (arr, i) => arr.map(r => fnum(r[i]));
    const cntIf = (arr, i, f) => col(arr, i).filter(f).length;
    const mxOf = arr => arr.reduce((a, b) => (b > a ? b : a), arr[0]);
    const mnOf = arr => arr.reduce((a, b) => (b < a ? b : a), arr[0]);

    const imm = EK.map((_, i) => cntIf(E, i + 1, x => x >= 100));
    const cap = EK.map((_, i) => cntIf(E, i + 1, x => x === 200));
    const wk = EK.map((_, i) => cntIf(E, i + 1, x => x <= -100));
    const ez = EK.map((_, i) => cntIf(E, i + 1, x => x === 0));
    const emx = EK.map((_, i) => mxOf(col(E, i + 1)));
    const emn = EK.map((_, i) => mnOf(col(E, i + 1)));
    const zeroAll = E.filter(r => EK.every((_, i) => fnum(r[i + 1]) === 0)).length;
    const capAll = E.filter(r => EK.every((_, i) => fnum(r[i + 1]) === 200)).length;
    const negAny = E.filter(r => EK.some((_, i) => fnum(r[i + 1]) < 0)).length;
    const aFull = AK.map((_, i) => cntIf(A, i + 1, x => x >= 100));
    const aZeroAll = A.filter(r => AK.every((_, i) => fnum(r[i + 1]) === 0)).length;
    const cZero = CK.map((_, i) => cntIf(C, i + 1, x => x === 0));
    const cMax = CK.map((_, i) => mxOf(col(C, i + 1)));

    const nameCnt = {};
    E.forEach(r => { nameCnt[r[0]] = (nameCnt[r[0]] || 0) + 1; });
    const dups = Object.keys(nameCnt).filter(k => nameCnt[k] > 1);

    const eStat = tbl(['属性', '免疫（≥100%）', '满抗（=200%）', '弱点（≤−100%）', '全 0%', '最高', '最低'],
        EK.map((k, i) => [k, imm[i] + ' 条', cap[i] + ' 条', wk[i] + ' 条', ez[i] + ' 条', v4(emx[i] + '%'), v4(emn[i] + '%')]),
        { leftFirst: true, colw: ['4rem', '7rem', '7.4rem', '7.4rem', '4.4rem', '4.4rem', '4.4rem'] });

    const aStat = tbl(['状态', '满 100%', '该属性 0%'],
        AK.map((k, i) => [k, aFull[i] + ' 条', (n - cntIf(A, i + 1, x => x !== 0)) + ' 条']),
        { leftFirst: true, colw: ['4.4rem', '5.6rem', '5.6rem'] });

    const cStat = tbl(['项目', '为 0 的条目', '最高值'],
        CK.map((k, i) => [k, cZero[i] + ' 条', v4(cMax[i] + '%')]),
        { leftFirst: true, colw: ['6.4rem', '7rem', '4.4rem'] });

    const rowsOf = arr => arr.map(r => [r[0], r.map((c, i) => (i === 0 ? c : v4(c)))]);
    const W9 = ['9.2rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem'];
    const W7 = ['9.2rem', '2.6rem', '2.6rem', '2.6rem', '2.6rem', '2.6rem', '2.6rem'];
    const tE = ftableOwn(F.elemHead, W9, rowsOf(E), { ph: '输入名字，如「幽灵」或「雷斯特」', cls: 'fx5' });
    const tA = ftableOwn(F.ailHead, W9, rowsOf(A), { ph: '输入名字，如「龙」或「芙缇」', cls: 'fx5' });
    const tC = ftableOwn(F.critHead, W7, rowsOf(C), { ph: '输入名字，如「传送门」或「比修奈尔」', cls: 'fx5' });

    return `
    <p class="p">这一节是 4 代<b>魔物与村民那一侧</b>的底牌：打它该用什么属性、状态挂不挂得上、能不能打晕打飞。源站 <code>RF4Smonsterresist</code> 把数据拆成<b>三张独立模板表</b>，这里照原样分三张列出来——三张表的名字顺序并不一致，所以不强行拼成一张。</p>
    <p class="p">上一节讲的是<b>装备</b>面板上看不到的附加率与抗性，这一节换到<b>魔物与村民</b>。两边口径不同，分两部分写在同一页。源条目名是 <code>RF4Smonsterresist</code>（挂在 4 豪华版名下），<b>原版 3DS 没有可对照的同名表</b>，这里照源表原样录，不替原版另标一套。</p>
    <p class="p">这份表最特别的地方是<b>含村民</b>：雷斯特、芙缇、比修奈尔、库洛丽嘉、沃尔卡农这些可操作角色和重要 NPC 也在里面——其它作的抗性表只列魔物，没有这一份。和 5 代一样，数值<b>有正也有负</b>：源表把弱点用蓝字负号写（如 −25%、−200%），本页统一标红；<b>0%</b> 压成浅灰。百分比还带小数（如 2.98%），原样保留。难度选择会影响<b>天堂之门</b>等魔物的抗性，困难难度的天堂之门只能受到弱点属性伤害。</p>
    ${stat([['属性表', n + ' 条'], ['异常表', A.length + ' 条'], ['暴击表', C.length + ' 条']])}

    <h2 class="h2">八项属性：正抗、负弱</h2>
    <p class="p">火、水、土、风、光、暗、无、爱。<b>正数是抗性，负数就是弱点</b>——源表用蓝字负号写，本页统一标红；<b>0%</b> 压成浅灰，让有数的格子自己跳出来。抗性百分比怎么折算成实际伤害，源表没给公式，本页不替它算。</p>
    ${eStat}
    <div class="key"><b>风</b>免疫（≥100%）最多（${imm[3]} 条），<b>无</b>抗最少（${imm[6]} 条）；<b>水</b>满抗（=200%）最多（${cap[1]} 条）。弱点（≤−100%）也最多落在<b>风</b>（${wk[3]} 条）——风这一栏两极分化最明显；<b>无</b>属性零弱点（${wk[6]} 条，从不被克）。全表 <b>${negAny}</b> 行至少有一项负抗性，最深的像<b>幻想的雾香</b>爱 −200%、<b>兽人</b>族风 −150%。同时有 <b>${zeroAll}</b> 条八项全 0（完全平），没有八项全满抗的。</div>
    ${tE}

    <h2 class="h2">八项异常：一格负数也没有</h2>
    <p class="p">毒、封印、麻痹、睡眠、疲劳、感冒、即死、吸收。${A.length} 行 × 8 栏，<b>一格负数也没有</b>——和属性那张一样，只有「抗」和「不抗」两档。</p>
    ${aStat}
    <div class="key">挑几个数：<b>即死</b>满 100% 最多（${aFull[6]} 条），几乎把幽灵、龙、箱子、传送门扫了一遍；<b>吸收</b>最少（${aFull[7]} 条）。反过来八项全 0% 的 ${aZeroAll} 行里，常见杂兵和一干村民基本都在。</div>
    ${tA}

    <h2 class="h2">暴击、眩晕、吹飞、硬直</h2>
    <p class="p">六栏的列名如上：暴击率、暴击抗、眩晕抗、攻击硬直、攻击吹飞、吹飞抗。源表没给每列一句释义，本页只把数字搬过来。能直接看出来的是这几处：</p>
    ${cStat}
    <div class="key"><b>攻击硬直</b>这一栏最空——${cZero[3]} 条是 0%，真正有值的只有二十来条；<b>攻击吹飞</b>反而全部有值、最高 ${v4(cMax[4] + '%')}。<b>暴击抗</b>最高 ${v4(cMax[1] + '%')}（没到 100%），<b>眩晕抗</b>最高 ${v4(cMax[2] + '%')}。</div>
    ${tC}

    <h2 class="h2">看表之前的三件事</h2>
    ${tbl(['情形', '怎么处理'], [
        ['三张表各自独立', `属性表 ${n} 条、异常表 ${A.length} 条、暴击表 ${C.length} 条，名字顺序各表不完全一致（名字集也有小出入，比如宝珠类只在属性表，天堂之门在三张表写法不同）。本页照源顺序分三张列，搜名字时各表各自搜，不强行拼成一张对照表`],
        ['天堂之门写法不同', '属性表写「天堂之门(抗性变化)」，异常表与暴击表写「天堂之门」（且后者出现多行，对应不同难度／形态）。难度确实会改变它的抗性，所以源站这么标；本页照录不改名'],
        [`${dups.length} 个名字出现两次`, `属性表里 ${dups.length} 个名字不止出现一次（合计 ${dups.reduce((s, k) => s + nameCnt[k], 0)} 行），是同一只怪的另一种出场版本。源表排了两行，本页照录不合并`],
    ], { leftFirst: true, cls: 'txt', colw: ['9.4rem'] })}
    <div class="note">数据取自 biligame 符文工厂 wiki 的 <code>RF4Smonsterresist</code> 页所引三张模板表，原始出处是 reddit r/runefactory 的 <b>RF4 Datamining Compendium（Values for Everything）</b>；正文只有三行模板引用，表本身在 <code>RF4S村民与怪物抗性表_0</code> 等三页。由 <code>_build_fx4s.py</code> 解析成 <code>js/fx4s.js</code>。数值为解包初版，后续补丁若调过平衡，以游戏内为准；<b>列多放不下时，表格可以左右滑动</b>。</div>

    <div class="jump">
        <a href="#/page/weapon">
            <div class="jp-t">武器</div>
            <div class="jp-s">全武器攻击、魔攻与属性一览</div>
        </a>
        <a href="#/page/mbook">
            <div class="jp-t">魔物图鉴</div>
            <div class="jp-s">出现地点、等级与掉落</div>
        </a>
        <a href="#/page/armor">
            <div class="jp-t">防具</div>
            <div class="jp-s">盾、铠甲、头饰、鞋与饰品的防御数值</div>
        </a>
    </div>`;
}

/* RF5 魔物抗性三表：属性抗性／异常抗性／暴击眩晕吹飞。
   FX5 由 _build_fx5.py 从 biligame 源表生成，三张表行号一一对应。 */
function fx5Html(g) {
    const F = (typeof FX5 !== 'undefined') ? FX5 : null;
    if (!F || !F.elem || !F.elem.length) return `<p class="p">这一作暂时没有魔物抗性的数据。</p>`;
    const EK = ['火', '水', '土', '风', '光', '暗', '爱', '无'];
    const AK = ['毒', '封印', '麻痹', '睡眠', '疲劳', '感冒', '即死', '吸收'];
    const CK = ['暴击率', '暴击抵抗', '击晕率', '眩晕抵抗', '吹飞抵抗', '硬直'];
    const E = F.elem, A = F.ail, C = F.crit, n = E.length;

    /* 负值＝弱点（源表用蓝字负号写，这里改标红）；0 压成浅灰，让有数的格子自己跳出来 */
    const v = x => (x < 0 ? `<span class="dn">−${-x}%</span>`
        : (x === 0 ? '<span class="mon-no">0%</span>' : x + '%'));
    const col = (arr, i) => arr.map(r => r[i]);
    const cntIf = (arr, i, f) => col(arr, i).filter(f).length;
    const mxOf = arr => arr.reduce((a, b) => (b > a ? b : a), arr[0]);
    const mnOf = arr => arr.reduce((a, b) => (b < a ? b : a), arr[0]);

    const imm = EK.map((_, i) => cntIf(E, i + 1, x => x >= 100));
    const wk = EK.map((_, i) => cntIf(E, i + 1, x => x <= -100));
    const mx = EK.map((_, i) => mxOf(col(E, i + 1)));
    const mn = EK.map((_, i) => mnOf(col(E, i + 1)));
    const wuPos = cntIf(E, 8, x => x > 0), wuNeg = cntIf(E, 8, x => x < 0);
    const zeroE = E.filter(r => EK.every((_, i) => r[i + 1] === 0)).length;
    const immRows = E.filter(r => EK.some((_, i) => r[i + 1] >= 100)).length;
    const capRows = E.filter(r => EK.some((_, i) => r[i + 1] === 200)).length;

    const aNz = AK.map((_, i) => cntIf(A, i + 1, x => x !== 0));
    const aFull = AK.map((_, i) => cntIf(A, i + 1, x => x >= 100));
    const aZero = A.filter(r => AK.every((_, i) => r[i + 1] === 0)).length;

    const cZero = CK.map((_, i) => cntIf(C, i + 1, x => x === 0));
    const cMax = CK.map((_, i) => mxOf(col(C, i + 1)));
    const stunImm = cntIf(C, 4, x => x >= 100);
    const stunTenK = cntIf(C, 4, x => x >= 10000);
    const stiff0 = cntIf(C, 6, x => x === 0);
    const stiffBoth = C.filter(r => r[6] === 0 && r[4] >= 100).length;
    const stiffOnly = C.filter(r => r[6] === 0 && r[4] < 100).map(r => r[0]);

    const nameCnt = {};
    E.forEach(r => { nameCnt[r[0]] = (nameCnt[r[0]] || 0) + 1; });
    const dups = Object.keys(nameCnt).filter(k => nameCnt[k] > 1);
    const dupRows = dups.reduce((s, k) => s + nameCnt[k], 0);
    const dupSame = dups.filter(k =>
        new Set(E.filter(r => r[0] === k).map(r => r.slice(1).join('|'))).size === 1).length;
    const feiRows = E.filter(r => r[0].indexOf('废案') >= 0).length;

    const eStat = tbl(['属性', '免疫（≥100%）', '弱点（≤−100%）', '最高', '最低'],
        EK.map((k, i) => [k, imm[i] + ' 条', wk[i] + ' 条', v(mx[i]), v(mn[i])]),
        { leftFirst: true, colw: ['4rem', '7rem', '7.4rem', '4.4rem', '4.4rem'] });

    const aStat = tbl(['状态', '有数值', '满 100%', '全 0%'],
        AK.map((k, i) => [k, aNz[i] + ' 条', aFull[i] + ' 条', (n - aNz[i]) + ' 条']),
        { leftFirst: true, colw: ['4.4rem', '5.6rem', '5.6rem', '4.6rem'] });

    const cStat = tbl(['项目', '为 0 的条目', '最高值'],
        CK.map((k, i) => [k, cZero[i] + ' 条', v(cMax[i])]),
        { leftFirst: true, colw: ['6.4rem', '7rem', '4.4rem'] });

    const W9 = ['8.6rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem', '2.4rem'];
    const headOf = h => ['怪物名字'].concat(h.slice(1));
    const rowsOf = arr => arr.map(r => [r[0], r.map((c, i) => (i === 0 ? c : v(c)))]);

    const tE = ftableOwn(headOf(F.elemHead), W9, rowsOf(E), { ph: '输入魔物名，如「幽灵」', cls: 'fx5' });
    const tA = ftableOwn(headOf(F.ailHead), W9, rowsOf(A), { ph: '输入魔物名，如「龙」', cls: 'fx5' });
    const tC = ftableOwn(headOf(F.critHead), W9, rowsOf(C), { ph: '输入魔物名，如「传送门」', cls: 'fx5' });

    return `
    <p class="p">本页是《符文工房5》<b>魔物那一侧</b>的底牌：打它该用什么属性、状态挂不挂得上、能不能打晕打飞。源站给的是一组三张表，共 ${n} 行，三张表行号一一对应——同一行就是同一只怪。</p>
    <p class="p">4 代那一页看的是<b>装备</b>：面板上不显示、却真实生效的附加率与抗性。5 代这里换了一侧，讲的是<b>魔物</b>。两边口径不同，所以按作分开写，不硬合成一张表。</p>
    <p class="p">站内「魔物图鉴」其实已经收着其中两张（属性、暴击眩晕吹飞）。这一页把它们与第三张<b>异常抗性</b>并排放，顺便把两份数据逐格核了一遍——同源、数值零差异，只有名字写法与两行重复的区别，写在最后。</p>
    ${stat([['魔物条目', n + ' 条'], ['属性', EK.length + ' 项'], ['异常', AK.length + ' 项'], ['至少一项属性免疫', immRows + ' 条']])}

    <h2 class="h2">八项属性：正抗、负弱</h2>
    <p class="p">火、水、土、风、光、暗、爱、无。<b>正数是抗性，负数就是弱点</b>——源表把负号写成蓝字，本页统一标红；<b>0%</b> 压成浅灰，让有数的格子自己跳出来。抗性百分比怎么折算成实际伤害，源表没有给公式，本页不替它算。</p>
    ${eStat}
    <div class="key">被<b>光</b>克的条目最多（${wk[4]} 条落在 ≤−100%），其次风 ${wk[3]} 条、土 ${wk[2]} 条；反过来免疫<b>暗</b>的最多（${imm[5]} 条），<b>爱</b>只有 ${imm[6]} 条、<b>无</b>只有 ${imm[7]} 条。<b>无</b>这一栏本身也冷门：全表只有 ${wuPos} 行给出正数、${wuNeg} 行是负的（树魔人 −15%），其余 ${n - wuPos - wuNeg} 行一律 0%。</div>
    <p class="p">幽灵系把两头都拉满：<b>火幽灵</b> 火 +200／水 −200，<b>冰幽灵</b> 水 +200／火 −200，<b>风幽灵</b> 风 +200／土 −200，<b>大地幽灵</b> 土 +200／风 −100。同一只怪，本属性满额、克它的属性双倍吃伤。全表 <b>−200%</b> 只有 4 行（火幽灵同名占两行），<b>+200%</b> 有 ${capRows} 行，以幽灵、龙、传送门这三类为主。</p>
    <p class="p">另一头是<b>八项全 0</b>：${zeroE} 行，属性这一侧完全平。巨人、大锤巨人、凯撒巨人、终极巨人、巨魔领主、杀戮巨人这一串近亲都在里面；同族的泰坦却是风 −100%，不是整族都平。</p>
    ${tE}

    <h2 class="h2">八项异常：一格负数都没有</h2>
    <p class="p">毒、封印、麻痹、睡眠、疲劳、感冒、即死、吸收。表头和 4 代那张不是一套：这里没有会心／击飞／晕眩（那三项挪到第三张表去了），第 6～8 栏写作<b>感冒</b>、<b>即死</b>、<b>吸收</b>——4 代那张表同位置是「病」「昏厥」「吸血」。名字不一样，本页照录各自的表头，不统一改写。</p>
    <p class="p">${n} 行 × ${AK.length} 栏，<b>一格负数都没有</b>。魔物这一侧只有「抗」和「不抗」两档，没有「更怕某种状态」这回事。</p>
    ${aStat}
    <div class="key">挑几个数：<b>即死</b>满 100% 的 ${aFull[6]} 行，幽灵、龙、箱子、传送门几乎一个不落；<b>吸收</b>满 100% 的 ${aFull[7]} 行，另有 ${cntIf(A, 8, x => x === 0)} 行是 0%。反过来八项全 0% 的 ${aZero} 行里，哥布林、摩可摩可一族（摩可摩可、莫夫莫夫、摩奇摩奇）这类常见杂兵基本都在。</div>
    ${tA}

    <h2 class="h2">暴击、眩晕、吹飞、硬直</h2>
    <p class="p">六栏的列名如上：暴击率、暴击抵抗、击晕率、眩晕抵抗、吹飞抵抗、硬直。源表没给每列一句释义，本页只把数字搬过来，「是它打你、还是你打它」这一层不猜。能直接看出来的是这几处：</p>
    ${cStat}
    <div class="key">眩晕抵抗 ≥100% 的 ${stunImm} 行，其中 ${stunTenK} 行直接写 <b>10000%</b>——Boss、龙、传送门基本都在这一批，打晕这条路对它们不通。硬直 <b>0%</b> 的 ${stiff0} 行里，${stiffBoth} 行正好也在那批眩晕免疫的里面，剩下 ${stiffOnly.length} 行不免疫眩晕却硬直 0%。</div>
    <div class="note">补两处极值：暴击抵抗最高 ${v(cMax[1])}，只有 3 条（奥德姆拉、利维坦、提阿玛特），没有一条到 100%；暴击率最高 ${v(cMax[0])}（贪食箱、惊喜箱），击晕率最高 ${v(cMax[2])}（死亡菌菇）。硬直 0% 但不免疫眩晕的那 ${stiffOnly.length} 行是：${stiffOnly.join('、')}。</div>
    ${tC}

    <h2 class="h2">看表之前的四件事</h2>
    ${tbl(['情形', '怎么处理'], [
        ['同名出现两行', `${n} 行里有 ${dups.length} 个名字不止出现一次（合计 ${dupRows} 行），其中 ${dupSame} 个是同名两行数值完全一样——同一只怪的另一种出场版本。源表排了两行，本页照录不合并；搜名字时两行会一起出来`],
        ['第 210 行名字写法不同', '三张表行号对齐，只有这一行不一致：属性表写「巨型奥德姆拉(废案换皮奥德姆拉)」，异常表与暴击表写「巨型奥德姆拉(废案奥德姆拉)」。照录原样，不改名'],
        [`带「(废案换皮××)」的 ${feiRows} 条`, '源表自己把这些标成废案换皮的残留条目。本页不删、不改名——留着，是为了让这一行还能和其它表对上号'],
        ['站内另有一份，已逐格核过', '「魔物图鉴」的 RF5 抗性栏（<code>RES_RF5</code>，269 行）与本页同源。267 行一一对上，<b>属性八项与暴击六项零差异</b>；差别只有两点：那边用简名（「黑暗鹈鹕」而不是「黑暗鹈鹕(废案换皮鲸头鹳)」），并且多出两行重复的「绿凯撒熊」「阿拉克涅」。<b>异常那八栏只有本页有</b>，图鉴里没有'],
    ], { leftFirst: true, cls: 'txt', colw: ['9.4rem'] })}
    <div class="note">数据取自 biligame 符文工厂 wiki 的 <code>RF5monsterresist</code> 页所引三张模板表，原始出处是 therunefactory.fandom.com 论坛的 <b>RF5 Datamine Spreadsheet（GentlemanBones）</b>；正文只有三行模板引用，表本身在 <code>RF5怪物抗性表_0</code> 等三页。由 <code>_build_fx5.py</code> 解析成 <code>js/fx5.js</code>。数值为解包初版，后续补丁若调过平衡，以游戏内为准；<b>列多放不下时，表格可以左右滑动</b>。</div>

    <div class="jump">
        <a href="#/page/weapon">
            <div class="jp-t">武器</div>
            <div class="jp-s">全武器攻击、魔攻与属性一览</div>
        </a>
        <a href="#/page/mbook">
            <div class="jp-t">魔物图鉴</div>
            <div class="jp-s">出现地点、等级与掉落</div>
        </a>
    </div>`;
}

function gearBestHtml(g) {
    const id = (g && g.id);
    const D = (typeof GEAR_BEST !== 'undefined') ? GEAR_BEST[id] : null;
    if (!D) return '';
    const B = D.blocks || [];
    const nTbl = (D.sets ? 1 : 0) + B.filter(b => b.tbl).length;
    const nEmpty = (D.stub || []).length;
    const li = x => Array.isArray(x) ? `<b>${x[0]}</b>：${x[1]}` : x;
    const blockHtml = b => {
        let h = `<h2 class="h2">${b.h}</h2>`;
        if (b.p) h += b.p.map(t => `<p class="p">${t}</p>`).join('');
        if (b.ul) h += `<ul class="ul">${b.ul.map(x => `<li class="li">${li(x)}</li>`).join('')}</ul>`;
        if (b.tbl) h += tbl(b.tbl.head, b.tbl.rows, { colw: b.tbl.widths || [], left: b.tbl.head.map((_, i) => i), cls: 'gearbest' + (b.tbl.w ? ' gearbest-w' : '') });
        if (b.note) h += `<div class="key">${b.note}</div>`;
        return h;
    };

    return `
        <p class="p">源站这一页的标题是<b>「毕业装备」</b>，但各作的完成度完全不是一回事：有的把配方和材料都算好了，有的只写了几段「往哪个方向堆」，还有几页的表格<b>在源站就是空的</b>。本站照实分节，空的地方就写明是空的。</p>
        ${(nTbl || nEmpty) ? stat([['表格', nTbl + ' 张'], ['源站缺项', nEmpty ? nEmpty + ' 处' : '无'], ['性质', '社区／wiki 整理，非官方数值']]) : ''}
        <div class="note">源：<b>${D.src}</b>。${D.tag}。</div>

        <p class="p">${(D.intro || []).join('')}</p>
        ${D.sets ? tbl(D.sets.head, D.sets.rows, { colw: D.sets.widths || [], left: D.sets.head.map((_, i) => i), cls: 'gearbest' }) : ''}
        ${B.map(blockHtml).join('')}

        ${nEmpty ? `<h2 class="h2">源站缺的部分</h2>
        <p class="p">下面这些，要么在源条目里<b>只有表头、没有一行数据</b>，要么是源站用模板挂在别处的表、本站没有并进来。空着的地方没有替它补——补出来的每一条都是编的。</p>
        <ul class="ul">${D.stub.map(t => `<li class="li">${t}</li>`).join('')}</ul>` : ''}

        ${(D.keeps || []).length ? `<h2 class="h2">照录不改的地方</h2>
        <ul class="ul">${D.keeps.map(t => `<li class="li">${t}</li>`).join('')}</ul>` : ''}

        <div class="note">这一页只搬源站写了的东西：没给数值的地方留空，没写的表留空表。RF5 的毕业套不在这一页——它的倍率算法（倍铁、10 倍铁、不明物体）是独立一篇，在该作品下切到「符文工房5」才看得到。</div>
        <div class="jump">
            <a href="#/page/craft">
                <div class="jp-t">锻造与药学</div>
                <div class="jp-s">强化格子怎么开、素材效果怎么叠</div>
            </a>
            <a href="#/page/weapon">
                <div class="jp-t">武器</div>
                <div class="jp-s">这一作武器本身的数值与招式</div>
            </a>
        </div>
    `;
}
function recipeRf12Html(g) {
    const D = (typeof RECIPE_RF12 !== 'undefined') ? RECIPE_RF12 : null;
    const id = (g && g.id === 'rf2') ? 'rf2' : 'rf1';
    if (!D || !D[id] || !D[id].rows.length) return '';
    const T = D[id], H = T.head, R = T.rows;
    const O = (id === 'rf1') ? D.rf2 : D.rf1;
    const nm = (id === 'rf1') ? '符文工房1' : '符文工房2';
    const oNm = (id === 'rf1') ? '符文工房2' : '符文工房1';
    const dash = '<span class="mon-no">—</span>';
    const idx = kw => H.findIndex(x => String(x).indexOf(kw) >= 0);
    const num = v => /^\d+$/.test(String(v)) ? +String(v) : null;
    const blank = v => (v == null || v === '' || v === '-' || v === '—') ? '' : v;
    const money = v => num(v) == null ? (blank(v) ? String(v) : dash) : num(v).toLocaleString() + 'G';
    const mats = r => H.map((h, i) => i).filter(i => String(H[i]).indexOf('材料') === 0)
        .map(i => blank(r[i])).filter(Boolean);

    const iL = idx('配方等级'), iB = idx('买价'), iS = idx('卖价'), iShop = idx('店铺');
    const lv = R.map(r => num(r[iL])).filter(v => v != null);
    const lvLo = Math.min.apply(null, lv), lvHi = Math.max.apply(null, lv);
    const buyable = R.filter(r => num(r[iB]) != null).length;
    const matCnt = {};
    R.forEach(r => mats(r).forEach(m => { matCnt[m] = (matCnt[m] || 0) + 1; }));
    const matTop = Object.keys(matCnt).sort((a, b) => matCnt[b] - matCnt[a]).slice(0, 6);
    const sTop = R.filter(r => num(r[iS]) != null).slice().sort((a, b) => num(b[iS]) - num(a[iS]))[0];
    const bTop = R.filter(r => num(r[iB]) != null).slice().sort((a, b) => num(b[iB]) - num(a[iB]))[0];
    const slot = {};
    R.forEach(r => { slot[mats(r).length] = (slot[mats(r).length] || 0) + 1; });
    const slotKeys = Object.keys(slot).map(Number).sort((a, b) => a - b);

    /* 两作同名的药：等级与效果各按各自源表列，不做换算 */
    const oMap = {};
    O.rows.forEach(r => { oMap[r[0]] = { lv: num(r[1]), eff: r[1] }; });
    const both = R.map(r => r[0]).filter(n => oMap[n]);
    const lvDiff = both.filter(n => { const a = num(R.filter(r => r[0] === n)[0][iL]); return a != null && oMap[n].lv != null; });

    /* ---------- 两作各一套行：列位不同，不合并 ---------- */
    const iHp = idx('HP恢复'), iRp = idx('RP恢复'), iMhp = idx('最大HP'), iEff = idx('效果'), iBook = idx('配方书');
    const iEff2 = idx('使用总效果'), iCourse = idx('配方课程'), iSrc2 = idx('其它来源');
    const ENH = ['STR', 'INT', 'DEX', 'VIT', '属性攻击', '属性防御', '持续时间']
        .map(k => [k, idx(k)]).filter(x => x[1] >= 0);
    const hpCell = r => {
        const ps = [];
        if (blank(r[iHp])) ps.push('HP ' + blank(r[iHp]));
        if (blank(r[iRp])) ps.push('RP ' + blank(r[iRp]));
        if (blank(r[iMhp])) ps.push('最大HP ' + blank(r[iMhp]));
        return ps.length ? ps.join('／') : dash;
    };
    const enhCell = r => {
        const on = ENH.map(x => [x[0], blank(r[x[1]])]).filter(x => x[1]);
        return on.length ? on.map(x => x[1] === '1' ? x[0] : x[0] + '（' + x[1] + '）').join('、') : dash;
    };

    const lvCell = r => num(r[iL]) == null ? dash : 'Lv' + num(r[iL]);
    const matCell = r => mats(r).length ? mats(r).join('＋') : dash;

    /* 拆两张：主表放「怎么做、做出什么」，副表放「多少钱、从哪来」。
       十列并一张在手机宽度下只能横滑，拆开后主表六列、副表四～五列，各自都能读。 */
    const rows1a = R.map(r => [r[0] + ' ' + mats(r).join(' ') + ' ' + (blank(r[iEff]) || ''), [
        r[0], lvCell(r), matCell(r), hpCell(r), blank(r[iEff]) || dash, enhCell(r)]]);
    const rows1b = R.map(r => [r[0] + ' ' + (blank(r[iShop]) || ''), [
        r[0], money(r[iB]), money(r[iS]), blank(r[iShop]) || dash]]);
    const rows2a = R.map(r => [r[0] + ' ' + mats(r).join(' ') + ' ' + (blank(r[iEff2]) || ''), [
        r[0], lvCell(r), matCell(r), blank(r[iEff2]) || dash, blank(r[iCourse]) || dash]]);
    const rows2b = R.map(r => [r[0] + ' ' + (blank(r[iSrc2]) || ''), [
        r[0], money(r[iB]), money(r[iS]), blank(r[iShop]) || dash, blank(r[iSrc2]) || dash]]);

    const cmpRows = (id === 'rf1')
        ? both.map(n => {
            const a = R.filter(r => r[0] === n)[0], b = O.rows.filter(r => r[0] === n)[0];
            return [n, ['Lv' + num(a[iL]), 'Lv' + num(b[1])]];
        })
        : both.map(n => {
            const a = R.filter(r => r[0] === n)[0], b = O.rows.filter(r => r[0] === n)[0];
            return [n, ['Lv' + num(b[1]), 'Lv' + num(a[iL])]];
        });

    return `
        <p class="p">这一页对<b>${nm}</b>只收「药学」一类：<b>${R.length} 条</b>，等级 Lv${lvLo}–${lvHi}。不是本站偷懒——两作的配方页在源站上<b>只有药学这一张表</b>，武器、防具、农具没有可核实的逐条配方，拿别作的表凑过来只会把材料写错。</p>
        <div class="key">配方等级不是「你能做它的等级」：<b>它决定的是技能等级门槛</b>——等级不到，材料齐了也调不出来。等级越高也不代表越强：${bTop ? '源表给了买价的 <b>' + buyable + ' 条</b>里最贵的是 <b>' + bTop[0] + '（' + money(bTop[iB]) + '）</b>，' : ''}卖价最高的是 <b>${sTop ? sTop[0] + '（' + money(sTop[iS]) + '）' : '—'}</b>。</div>
        ${stat([
        ['配方条数', R.length + ' 条'],
        ['等级跨度', 'Lv' + lvLo + '–' + lvHi],
        ['有买价', buyable + ' 条'],
        ['材料种类', Object.keys(matCnt).length + ' 种'],
    ])}

        <h2 class="h2">全部 ${R.length} 条药学配方</h2>
        <p class="p">按源表原顺序排列，未按等级重排——方便拿着源表对行。搜药名、材料或效果都能筛；<b>材料用「＋」连起来</b>，是源表 6 个材料位的实际内容，空位不占格。</p>
        ${(id === 'rf1') ? ftableOwn(['名称', '等级', '材料（＋分隔）', 'HP／RP／最大HP', '效果', '强化项'],
        ['7rem', '4rem', 'auto', '8.6rem', 'auto', '8rem'],
        rows1a, { ph: '搜药名、材料或效果', cls: 'rec12', left: [2, 4, 5] })
            : ftableOwn(['名称', '等级', '材料（＋分隔）', '使用总效果', '配方课程'],
                ['7rem', '4rem', 'auto', 'auto', '7.6rem'],
                rows2a, { ph: '搜药名、材料或效果', cls: 'rec12', left: [2, 3] })}
        <div class="note">${(id === 'rf1')
            ? '「强化项」列是把源表的 <b>STR／INT／DEX／VIT／属性攻击／属性防御／持续时间</b> 七个格子并成一列：源表在这些格里<b>打「1」表示这项有效</b>，并不是「+1 点」，所以这里只列项名、不写数字，免得被读成加成量。'
            : '「配方课程」是源表的课名，做这味药之前得在学院上过对应的课——<b>上课时选错配方，材料对了也会失败</b>，这条是源页开头写明的机制，不是本站推断。'}</div>

        <h2 class="h2">买价、卖价与来源</h2>
        <p class="p">同一批药，另一面：<b>能买到多少、卖掉回多少、剩下的只能去哪找</b>。源表把价格与来源放在同一行里，这里单独列一张，免得和材料挤在一格。</p>
        ${(id === 'rf1') ? ftableOwn(['名称', '买价', '卖价', '店铺／掉落'],
        ['7rem', '5.6rem', '5.2rem', 'auto'],
        rows1b, { ph: '搜药名或来源', cls: 'rec12', left: [3] })
            : ftableOwn(['名称', '买价', '卖价', '店铺', '其它来源'],
                ['7rem', '5.6rem', '5.2rem', '6rem', 'auto'],
                rows2b, { ph: '搜药名或来源', cls: 'rec12', left: [4] })}
        <div class="note">${(id === 'rf1')
            ? '买价只有医院卖的那几瓶有（' + buyable + ' 条），其余是「-」，即店里不卖。来源列写「某某掉落」的，意思是这瓶药<b>只能靠打怪掉</b>，不是店里卖，别拿买价去找。'
            : '买价写「无法交易」的是源表原话，照录——这类只能自己调合，或按「其它来源」去换。「其它来源」里的「第一章某某比赛」指获奖奖励，不是商店。'}</div>

        <h2 class="h2">材料：${matTop.slice(0, 4).map(m => m + '（' + matCnt[m] + '）').join('、')} 出现最多</h2>
        <p class="p">出现次数最多的几样：<b>${matTop.map(m => m + ' ' + matCnt[m] + ' 次').join('、')}</b>。药草与各色草是底座——这也是为什么前期在田边多薅几把草，比攒钱买药划算。</p>
        ${tbl(['占用材料位', '条数'], slotKeys.map(k => [k + ' 格', '<b>' + slot[k] + '</b> 条']), { leftFirst: true, colw: ['7rem', '6rem'] })}

        <h2 class="h2">两作都有的 ${both.length} 味药：等级各算各的</h2>
        <p class="p">${nm}与${oNm}共 <b>${both.length} 味同名药</b>（占本作 ${Math.round(100 * both.length / R.length)}%）。同名不等于同一条：<b>两作的配方等级、材料与效果各按各自源表</b>，下面的对照只并排放等级，<b>不做换算、不假设哪一作更高</b>——${lvDiff.length} 味两边都有等级可比的，其余有一边源表没给。</p>
        ${tbl([id === 'rf1' ? '符文工房1' : '符文工房2', id === 'rf1' ? '符文工房2' : '符文工房1'], cmpRows, { leftFirst: true, colw: ['9rem', '5.6rem', '5.6rem'], cls: 'txt' })}

        <h2 class="h2">这一页为什么这么短</h2>
        <p class="p">前几作的配方大全动不动几百条，是因为那些作品的锻造／装饰／调合都有成表的攻略页可核。<b>RF1 与 RF2 在源站只有药学一张表</b>：武器、防具、农具的逐条配方本站没有第二份能对上的来源，所以不写——页面短，但每一条都能回到源表。</p>
        <div class="note">数据源：biligame 符文工厂 wiki 的 <code>RF1recipepharmacy</code>／<code>RF2recipepharmacy</code> 两页，<code>_build_recipe_rf12.py</code> 解析本地快照生成 <code>js/recipe_rf12.js</code>。这是<b>网络 wiki，非官方解包</b>，数值以游戏内为准；源表空格写「-」的，本页一律显示破折号。<b>「調合白書」是源文原文（日文汉字写法）</b>，未转成简体，以免与站内其它译名混起来；RF2 的 <b>ZOKKON</b> 也是源表原样（拉丁字母写法），同样没有替它另起中文名。</div>
        <div class="jump">
            <a href="#/page/cook"><div class="jp-t">料理</div><div class="jp-s">这一作的料理配方与食用效果</div></a>
            <a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">配方等级与技能门槛的关系</div></a>
        </div>
    `;
}

/* ------------------------------------------------------------
   素材出处与掉落：边境（RFF）
   源：js/rffmon.js 的 RFF_MON[8]「总掉落物」，每段形如「白金Lv1 100%」。
   中间那个 Lv 是<b>物品等级</b>，不是件数；同一素材常按等级分档各占一段，
   所以下面的统计全部现解现算，不再另存一份衍生表。
   ------------------------------------------------------------ */
function sourceRffHtml() {
    const R = (typeof RFF_MON !== 'undefined') ? RFF_MON : [];
    const RE = /^(.+?)Lv(\d+)\s+(\d+)%$/;
    const recs = [];
    R.forEach(r => {
        const s = r[8];
        if (!s || s === '—') return;
        String(s).split('、').forEach(seg => {
            seg = seg.trim(); if (!seg) return;
            const m = RE.exec(seg); if (!m) return;
            recs.push({ mon: r[0], mlev: r[1], loc: r[7], item: m[1], lv: +m[2], p: +m[3] });
        });
    });
    if (!recs.length) return '';

    const byItem = {};
    recs.forEach(x => { (byItem[x.item] = byItem[x.item] || []).push(x); });
    const items = Object.keys(byItem).sort();
    const withDrop = R.filter(r => r[8] && r[8] !== '—');

    /* 物品等级档：这件素材有哪几档，每档的掉落者平均等级是多少 */
    const tier = {};
    items.forEach(n => {
        const t = {};
        byItem[n].forEach(x => { (t[x.lv] = t[x.lv] || []).push(x.mlev); });
        const ks = Object.keys(t).map(Number).sort((a, b) => a - b);
        const avg = ks.map(k => Math.round(t[k].reduce((a, b) => a + b, 0) / t[k].length));
        let mono = true;
        for (let i = 1; i < avg.length; i++) if (avg[i] <= avg[i - 1]) mono = false;
        tier[n] = { ks, avg, mono };
    });
    const multi = items.filter(n => tier[n].ks.length > 1);
    const three = items.filter(n => tier[n].ks.length >= 3);
    const monoN = three.filter(n => tier[n].mono).length;

    const full = recs.filter(x => x.p === 100);
    const fullItem = {};
    full.forEach(x => { fullItem[x.item] = (fullItem[x.item] || 0) + 1; });
    const fullTop = Object.keys(fullItem).map(n => [n, fullItem[n]])
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);

    const solo = items.filter(n => new Set(byItem[n].map(x => x.mon)).size === 1);
    const lowAll = items.filter(n => byItem[n].every(x => x.p <= 10));

    /* 表一：素材 → 谁掉 */
    const itemRows = items.map(n => {
        const arr = byItem[n];
        const ms = Array.from(new Set(arr.map(x => x.mon)));
        const hi = Math.max.apply(null, arr.map(x => x.p));
        return [n + ' ' + ms.join(' '), [
            n,
            ms.length + ' 只',
            '<b>' + hi + '%</b>',
            tier[n].ks.map(k => 'Lv' + k).join('／'),
            ms.slice(0, 3).join('、') + (ms.length > 3 ? '…' : ''),
        ]];
    });

    /* 表二：怪 → 掉什么 */
    const monRows = withDrop.map(r => {
        const hits = recs.filter(x => x.mon === r[0]);
        return [r[0] + ' ' + r[7] + ' ' + hits.map(x => x.item).join(' '), [
            r[0],
            String(r[1]),
            r[7] || '<span class="mon-no">—</span>',
            hits.map(x => x.item + ' Lv' + x.lv + ' <b>' + x.p + '%</b>').join('　'),
        ]];
    });

    const tierRows = three.map(n => {
        const t = tier[n];
        return [n, [
            n,
            t.ks.map((k, i) => 'Lv' + k + '→' + t.avg[i]).join('　'),
            t.mono ? '<span class="txc">单调</span>' : '<b>倒挂</b>',
        ]];
    });

    const claw = tier['锐利的爪子'];

    return `
            <h2 class="h2">中间那个 Lv 是物品等级，不是件数</h2>
            <p class="p">边境的掉落书写成<b>「素材 Lv8 50%」</b>，很多人把中间的 Lv 读成了数量。它是<b>物品等级</b>——决定这件素材的成色，跟一次给几件无关。同一件素材常以两三个等级各占一段：<b>冰蛇的舌头就是 Lv8 50% 与 Lv10 50% 两段并列</b>，看上去像重复记录，其实是同一件东西的两种成色。<b>这两段是一次只出其中一个、还是各判各的，原表没写</b>，本页不猜——只保证表里每个百分比都是原样抄下来的。</p>
            ${stat([['收录魔物', R.length + ' 条'], ['有掉落记录', withDrop.length + ' 只'], ['掉落记录', recs.length + ' 条'], ['素材种类', items.length + ' 种']])}
            <div class="key">所以「怎么刷高等级素材」这个问题，答案不是<b>多打几只</b>，而是<b>打对哪一只</b>。往下第二张表就是把这件事算清楚的。</div>

            <h2 class="h2">物品等级基本就是「怪的等级档次」：${three.length} 件里有 ${monoN} 件对得上</h2>
            <p class="p">把每件素材的等级档摊开，算每个档位掉落者的<b>平均等级</b>，再看这个平均值是不是随物品等级往上走。${items.length} 种素材里有 ${multi.length} 种存在多个等级档，其中 <b>${three.length} 种有三个档以上</b>——这 ${three.length} 种里 <b>${monoN} 种是严格单调的</b>，物品等级越高，掉它的怪平均越高级。</p>
            ${ftableOwn(['素材', '物品等级 → 掉落者平均等级', '单调'],
                ['6.2rem', 'auto', '3.6rem'], tierRows, { ph: '输入素材名筛选' })}
            <div class="note">读法：<code>Lv8→50</code> 表示「物品等级 8 这一档，掉它的怪平均 50 级」。平均等级是把该档所有掉落者的等级取算术平均后四舍五入，<b>只用来判断趋势，不是游戏内数值</b>；一档只有一只怪时，那个数就是那只怪的等级。</div>
            <div class="key">唯一的例外是<b>锐利的爪子</b>：物品 Lv1 档平均 ${claw.avg[0]} 级、Lv${claw.ks[1]} 档平均 ${claw.avg[1]} 级、Lv${claw.ks[2]} 档平均 ${claw.avg[2]} 级，前两档倒挂。原因很具体——<b>鸡鹫兽的 ED 后形态是 95 级，却只给 Lv1 的爪子、而且 100% 必给</b>，一个高等级样本把 Lv1 档的平均值硬拉了回来。所以「高等级怪给高等级素材」是<b>大致规律而不是定律</b>，遇到 ED 后与再战形态要单独看。</div>

            <h2 class="h2">${full.length} 条是 100% 必给，基础补给几乎不用刷</h2>
            <p class="p">${recs.length} 条记录里 ${full.length} 条写着 100%。这些不是「概率很高」，是<b>打就必给</b>——集中在米、小麦粉、油、白金、巧克力这类补给与食材，以及几只剧情 BOSS 身上。只按「有多少只怪必给这件东西」排，前 ${fullTop.length} 名是：</p>
            ${tbl(['素材', '必给它的怪'], fullTop.map(([n, c]) => [n, c + ' 只']), { leftFirst: true, cls: 'txt', colw: ['8rem', '6rem'] })}
            <div class="key">反过来说，<b>缺米、缺小麦粉的时候应该去刷这几种怪，而不是回田里种</b>——它们打就必给，不用赌概率。</div>

            <h2 class="h2">只有 ${solo.length} 件素材是全作独一份</h2>
            <p class="p">把每件素材的来源数一遍，${solo.length} 件<b>只出一种怪身上</b>：</p>
            ${tbl(['素材', '唯一的来源', '等级档', '概率'], solo.map(n => {
                const x = byItem[n][0];
                return [n, x.mon, 'Lv' + x.lv, x.p + '%'];
            }), { leftFirst: true, cls: 'txt', colw: ['6rem', 'auto', '4.4rem', '4rem'] })}
            <div class="key">三件里有两件是矿石线（<b>铁、银</b>），而且同出<b>迷你石魔人</b>——想同时囤这两样，打它一只就够，不必分开跑。第三件是<b>龟壳</b>，只出陆龟，概率 10%，属于典型要专门刷的东西。</div>

            <h2 class="h2">${lowAll.length} 件素材，所有来源都在 10% 以下</h2>
            <p class="p">这批是真正需要「刷」的：没有一处来源能一次给到两位数以上，只能靠次数堆。</p>
            ${tbl(['素材', '来源', '最高概率'], lowAll.map(n => {
                const arr = byItem[n];
                const ms = Array.from(new Set(arr.map(x => x.mon)));
                return [n, ms.slice(0, 4).join('、') + (ms.length > 4 ? '…' : ''), Math.max.apply(null, arr.map(x => x.p)) + '%'];
            }), { leftFirst: true, cls: 'txt', colw: ['7rem', 'auto', '5rem'] })}

            <h2 class="h2">反向查：${items.length} 种素材各从哪来</h2>
            <p class="p">按素材名或魔物名搜索。「等级档」一列说明这件素材有几个物品等级、分别是多少；「主要来源」只给前三个，完整名单在下一张表里。</p>
            ${ftableOwn(['素材', '来源数', '最高概率', '等级档', '主要来源'],
                ['7.4rem', '4.2rem', '4.6rem', '6.4rem', 'auto'], itemRows, { ph: '输入素材名或魔物名' })}

            <h2 class="h2">正向查：${withDrop.length} 只怪各掉什么</h2>
            <p class="p">每件素材后面跟的是<b>它的物品等级</b>与概率。同名的读作「同一件东西的不同成色」，不是重复条目。</p>
            ${ftableOwn(['魔物', '等级', '出现地点', '掉落（物品等级／概率）'],
                ['6.6rem', '3.8rem', '8rem', 'auto'], monRows, { ph: '输入魔物、地点或素材' })}

            <div class="note">数据源：biligame 符文工厂 wiki 的「RFFmonster」页，与站内「魔物图鉴」的边境段同源。原表 ${R.length} 条魔物里 ${withDrop.length} 只带掉落记录，其余 ${R.length - withDrop.length} 只原表就写「—」，本页照录不补。掉落的 <code>物品LvN 概率%</code> 由页面现解，共解析出 ${recs.length} 条、${items.length} 种素材；<b>没有任何一条是推算或补写的</b>。</div>

            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">边境全魔物的数值、抗性与出没地点</div>
                </a>
                <a href="#/page/material">
                    <div class="jp-t">素材与矿石</div>
                    <div class="jp-s">这些素材最后进了哪种装备</div>
                </a>
            </div>`;
}

/* ------------------------------------------------------------
   素材出处与掉落：海洋（RFO）
   源：js/rfomon.js 的 RFO_DROP，格式 [名, [[物, 普通%, 高级%], …], 出现点]。
   「高级」是带「高级」称号时的掉率（与「魔物图鉴」海洋段同一口径）。
   ------------------------------------------------------------ */
function sourceRfoHtml() {
    const D = (typeof RFO_DROP !== 'undefined') ? RFO_DROP : [];
    if (!D.length) return '';
    const recs = [];
    D.forEach(r => (r[1] || []).forEach(t => recs.push({ mon: r[0], loc: r[2], item: t[0], a: t[1], b: t[2] })));
    if (!recs.length) return '';

    const byItem = {};
    recs.forEach(x => { (byItem[x.item] = byItem[x.item] || []).push(x); });
    const items = Object.keys(byItem).sort();
    const empty = D.filter(r => !r[1] || !r[1].length);

    const pc = v => (v == null || v === '') ? '<span class="mon-no">—</span>' : v + '%';
    const num = v => (typeof v === 'number');

    const up = recs.filter(x => num(x.a) && num(x.b) && x.b > x.a);
    const eq = recs.filter(x => num(x.a) && num(x.b) && x.b === x.a);
    const down = recs.filter(x => num(x.a) && num(x.b) && x.b < x.a)
        .sort((a, b) => (a.b - a.a) - (b.b - b.a));
    const bigUp = recs.filter(x => num(x.a) && num(x.b) && x.b - x.a >= 10)
        .sort((a, b) => (b.b - b.a) - (a.b - a.a));
    /* 涨得最狠的那批里有多少条是结晶——缺结晶时开不开称号，全靠这一条 */
    const cryCnt = {};
    bigUp.forEach(x => { if (/结晶/.test(x.item)) cryCnt[x.item] = (cryCnt[x.item] || 0) + 1; });
    const cryTxt = Object.keys(cryCnt).map(n => n + ' ' + cryCnt[n] + ' 条').join('、');

    const solo = items.filter(n => new Set(byItem[n].map(x => x.mon)).size === 1);
    /* 概率没写的（null）不参与「都很低」的判断——「—」不是 0 */
    const lowAll = items.filter(n => byItem[n].every(x => num(x.a) && x.a <= 5));

    /* 每只怪给几件 —— 分布比平均值有用：它说明「一只怪能不能一并补齐」 */
    const dist = {};
    D.forEach(r => { const k = (r[1] || []).length; dist[k] = (dist[k] || 0) + 1; });
    const distRows = Object.keys(dist).map(Number).sort((a, b) => a - b).map(k => [k === 0 ? '0 件' : k + ' 件', dist[k] + ' 只']);
    const hi5 = D.filter(r => (r[1] || []).length >= 5).length;

    const itemRows = items.map(n => {
        const arr = byItem[n];
        const ms = Array.from(new Set(arr.map(x => x.mon)));
        const hia = Math.max.apply(null, arr.map(x => num(x.a) ? x.a : -1));
        const hib = Math.max.apply(null, arr.map(x => num(x.b) ? x.b : -1));
        return [n + ' ' + ms.join(' '), [
            n,
            ms.length + ' 只',
            hia < 0 ? '<span class="mon-no">—</span>' : hia + '%',
            hib < 0 ? '<span class="mon-no">—</span>' : hib + '%',
            ms.slice(0, 3).join('、') + (ms.length > 3 ? '…' : ''),
        ]];
    });

    const monRows = D.map(r => [r[0] + ' ' + (r[2] || '') + ' ' + (r[1] || []).map(t => t[0]).join(' '), [
        r[0],
        r[2] || '<span class="mon-no">—</span>',
        (r[1] || []).length
            ? r[1].map(t => t[0] + ' ' + (t[1] == null ? '—' : t[1] + '%') + '／' + (t[2] == null ? '—' : t[2] + '%')).join('　')
            : '<span class="mon-no">—</span>',
    ]]);

    return `
            <h2 class="h2">每件掉落并排两个数：常态，和带「高级」称号时</h2>
            <p class="p">海洋的掉落表不像别作只给一个概率，它给<b>两列</b>：前一个是常态掉率，后一个是<b>带「高级」称号时</b>的掉率（与站内「魔物图鉴」海洋段同一口径）。${recs.length} 条记录里 <b>${up.length} 条高级更高、${eq.length} 条持平、${down.length} 条反而更低</b>——最后这一小撮是最容易踩坑的地方，下面单独列。</p>
            ${stat([['收录魔物', D.length + ' 只'], ['有掉落', (D.length - empty.length) + ' 只'], ['掉落记录', recs.length + ' 条'], ['素材种类', items.length + ' 种']])}
            <div class="key">两列都要看的前提下，判断顺序应该是：<b>先确认这件素材在不在「反降」名单里，再决定要不要开称号</b>。开了称号结果掉率腰斩，比不开还难受。</div>

            <h2 class="h2">${down.length} 条反着来：开高级称号反而更难出</h2>
            <p class="p">这 ${down.length} 条的「高级」数值比常态还低。跌幅最大的一批：</p>
            ${tbl(['素材', '掉落者', '常态', '高级'], down.slice(0, 14).map(x => [x.item, x.mon, x.a + '%', '<b>' + x.b + '%</b>']), { leftFirst: true, cls: 'txt', colw: ['7rem', 'auto', '4rem', '4rem'] })}
            <div class="key">最扎眼的两条都是<b>30% → 10%</b>：松鼠王的<b>龟壳</b>、狼王的<b>金</b>。想刷这两样，<b>别开高级称号</b>——同一只怪、同样的打法，掉率差三倍。注意这不是「高级称号整体更差」，而是<b>具体到这一条掉落</b>上数值就是这么写的；原表没有解释原因，本站也不猜。</div>

            <h2 class="h2">反过来，涨得最狠的 ${bigUp.length} 条</h2>
            <p class="p">以「高级比常态至少高 10 个百分点」为门槛，全表只有 ${bigUp.length} 条达标——数量比想象中少，说明<b>高级称号带来的主要是小幅上调</b>，而不是普遍翻倍。</p>
            ${tbl(['素材', '掉落者', '常态 → 高级'], bigUp.map(x => [x.item, x.mon, x.a + '% → <b>' + x.b + '%</b>']), { leftFirst: true, cls: 'txt', colw: ['7rem', 'auto', '7rem'] })}
            <div class="key">这 ${bigUp.length} 条里有 ${bigUp.length - bigUp.filter(x => !/结晶/.test(x.item)).length} 条是结晶类（${cryTxt}）——结晶在这套表里对称号最敏感。缺结晶的时候，开称号是值的。</div>

            <h2 class="h2">${empty.length} 只精灵什么都不掉</h2>
            <p class="p">${empty.map(r => r[0]).join('、')}——这几只的掉落栏在源表里就是<b>空数组</b>，不是本站漏收。至于它们到底给什么，原表没写，本页也不补。</p>
            <div class="key">看到「精灵」两个字就先别指望素材。真要凑草类素材，去找<b>火焰史莱姆</b>（黄草、红草）和<b>水牛哞哞</b>（蓝草）——这两条在表里各有 5%。</div>

            <h2 class="h2">${solo.length} 件素材只有一个来源</h2>
            ${tbl(['素材', '唯一的来源', '常态', '高级'], solo.map(n => {
                const x = byItem[n][0];
                return [n, x.mon, pc(x.a), pc(x.b)];
            }), { leftFirst: true, cls: 'txt', colw: ['6.4rem', 'auto', '4.4rem', '4.4rem'] })}
            <p class="p">这批里有<b>鸡蛋、牛奶</b>这种产出型素材，也有<b>暗元素</b>这种只在浮士德身上、常态 4% 的东西。产出型那几样其实不用靠打——把它们收进牧场按期刷毛就有稳定产出，比刷怪省事。</p>

            <h2 class="h2">${lowAll.length} 件素材，所有来源都在 5% 以下</h2>
            <p class="p">这些是海洋里真正难凑的一批。表里给的是<b>各来源中的最高常态概率</b>，也就是说最好的一处也只有这么点。</p>
            ${tbl(['素材', '来源', '最高常态'], lowAll.map(n => {
                const arr = byItem[n];
                const ms = Array.from(new Set(arr.map(x => x.mon)));
                const hi = Math.max.apply(null, arr.map(x => num(x.a) ? x.a : -1));
                return [n, ms.slice(0, 4).join('、') + (ms.length > 4 ? '…' : ''), hi < 0 ? '<span class="mon-no">—</span>' : hi + '%'];
            }), { leftFirst: true, cls: 'txt', colw: ['7rem', 'auto', '5.4rem'] })}

            <h2 class="h2">每只怪给几件：三件与四件是主流</h2>
            <p class="p">掉落件数不是平均分布的。${distRows.length} 档里，<b>3 件与 4 件占了绝大多数</b>，5 件以上的一共只有 ${hi5} 只——想一次补齐多种素材，只能盯箱类与史莱姆。</p>
            ${tbl(['掉落件数', '魔物数'], distRows, { leftFirst: true, cls: 'txt', colw: ['6.6rem', '6rem'] })}
            <div class="key"><b>魔物箱、贪食箱</b>各给 7 件，是全表最多的两只；史莱姆系（史莱姆、黑暗史莱姆、火焰史莱姆）各 6 件。缺杂项素材时先找它们，比按素材逐个找怪快得多。</div>

            <h2 class="h2">反向查：${items.length} 种素材各从哪来</h2>
            <p class="p">「最高常态／最高高级」两列取的是这件素材所有来源里的最大值。同一件素材常有多处来源，完整名单看「来源」列或下一张表。</p>
            ${ftableOwn(['素材', '来源数', '最高常态', '最高高级', '来源'],
                ['7.4rem', '4.2rem', '4.6rem', '4.6rem', 'auto'], itemRows, { ph: '输入素材名或魔物名' })}

            <h2 class="h2">正向查：全部 ${D.length} 只，谁是必掉、谁概率低得离谱</h2>
            <p class="p">每件掉落后面括注的是<b>「常态 ／ 高级」</b>两个百分比。掉落件数为 0 的那几只也留在表里，方便确认「它真的不掉东西」。</p>
            ${ftableOwn(['魔物', '出现点', '掉落（常态／高级）'],
                ['6.4rem', '8rem', 'auto'], monRows, { ph: '输入魔物、地点或素材' })}

            <div class="note">数据源：biligame 符文工厂 wiki 的「RFOmonster」页掉落概率表，与站内「魔物图鉴」海洋段同源。<b>${D.length} 只、${recs.length} 条</b>为本页现解；${empty.length} 只（${empty.map(r => r[0]).join('、')}）原表为空数组，本页显示「—」而不补。<b>「高级」只表示带该称号时的数值</b>，原表未说明其它修正项，本站不叠加推算。</div>

            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">海洋全魔物的数值、抗性与能替你种什么</div>
                </a>
                <a href="#/page/material">
                    <div class="jp-t">素材与矿石</div>
                    <div class="jp-s">这些素材最后进了哪种装备</div>
                </a>
            </div>`;
}

/* ------------------------------------------------------------
   素材出处与掉落：RF3 / RF3 特别版（MAT_RF3）
   源：js/mat_rf3.js 的第 14 列「入手」。
   与边境／海洋两节的关键差别：这一列只写「从哪来」，**没有概率**。
   原表没给概率，页面也就一个数字都不补。
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   素材出处与掉落：RF1／RF2
   源：biligame 符文工房 wiki「RF1itemdata」「RF2item」两张材料表
   两表都只写「从哪来、值多少」，<b>没有任何掉率数字</b>——与边境／海洋那种
   「打这只怪、掉这件东西、百分之几」不是同一种表，页上照此说明。
   RF1 表头是 买价→卖价，RF2 是 卖价→买价，故按表头找列，不按下标硬取。
   ------------------------------------------------------------ */
function sourceRf12Html(g) {
    const id = g.id;
    const D = (typeof SOURCE_RF12 !== 'undefined') ? SOURCE_RF12[id] : null;
    if (!D || !(D.rows || []).length) return '';
    const H = D.head, R = D.rows;
    const ci = kw => H.findIndex(h => h.indexOf(kw) >= 0);
    const iMon = ci('掉落'), iLoc = ci(id === 'rf1' ? '获取地点' : '所在地');
    const iBuy = ci('买价'), iSell = ci('卖价'), iShop = ci('店铺'), iUse = ci('配方');

    const has = v => !!v && v !== '-' && v !== '无';
    const DASH = '<span class="mon-no">—</span>';
    const money = v => has(v) ? v + 'G' : DASH;
    const cell = v => has(v) ? v : DASH;

    const N = R.length;
    const monR = R.filter(r => has(r[iMon]));
    const buyR = R.filter(r => has(r[iBuy]));
    const shopR = R.filter(r => has(r[iShop]));
    const useR = R.filter(r => has(r[iUse]));

    /* 洞窟编号：RF1 源表把洞窟简写成「3洞」「8洞」 */
    const caveCnt = {};
    R.forEach(r => {
        if (!has(r[iLoc])) return;
        r[iLoc].split('、').forEach(x => {
            const m = /^(\d+)洞/.exec(x.trim());
            if (m) caveCnt[m[1]] = (caveCnt[m[1]] || 0) + 1;
        });
    });
    const caveKeys = Object.keys(caveCnt).sort((a, b) => +a - +b);
    const caveR = R.filter(r => has(r[iLoc]) && /\d+洞/.test(r[iLoc]));

    /* 按魔物反查：把「摩可摩可1~3心生产」这类后缀去掉再归并 */
    const byMon = {};
    R.forEach(r => {
        if (!has(r[iMon])) return;
        r[iMon].split('、').forEach(x => {
            const n = x.replace(/\d+~\d+心生产$/, '').replace(/心生产$/, '').trim();
            if (!n) return;
            const arr = byMon[n] = byMon[n] || [];
            if (arr.indexOf(r[0]) < 0) arr.push(r[0]);
        });
    });
    const monKeys = Object.keys(byMon).sort((a, b) => byMon[b].length - byMon[a].length || a.localeCompare(b));

    /* 配方用途 */
    const useArr = useR.map(r => [r[0], r[iUse].split('、').filter(Boolean)])
        .sort((a, b) => b[1].length - a[1].length);
    const useTop = useArr.slice(0, 12);
    const useTotal = useArr.reduce((s, x) => s + x[1].length, 0);

    /* 卖价榜（按数值排，不按字符串） */
    const sellTop = R.filter(r => has(r[iSell])).map(r => [r[0], +r[iSell]])
        .filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const allRows = R.map(r => [
        r[0] + ' ' + (has(r[iMon]) ? r[iMon] : '') + ' ' + (has(r[iLoc]) ? r[iLoc] : ''),
        [r[0], cell(r[iMon]), cell(r[iLoc]), money(r[iBuy]), money(r[iSell]),
        has(r[iUse]) ? r[iUse].split('、').filter(Boolean).length : DASH]]);

    const monRows = monKeys.map(n => [
        n + ' ' + byMon[n].join(' '),
        [n, byMon[n].length + ' 种', byMon[n].join('、')]]);

    /* tbl 的行是「扁平单元格数组」；[搜索词, [单元格…]] 那套是 ftableOwn 的格式，混用会把整行塞进一格 */
    const useRows = useTop.map(([n, list]) => [
        n, list.length + ' 项',
        list.slice(0, 5).join('、') + (list.length > 5 ? ' 等 ' + list.length + ' 项' : '')]);

    /* 跨作同名对照：两表都读同一份 SOURCE_RF12 */
    const OTHER = (typeof SOURCE_RF12 !== 'undefined') ? SOURCE_RF12[id === 'rf1' ? 'rf2' : 'rf1'] : null;
    let crossRows = [], crossN = 0, onlyMine = [], onlyOther = [];
    if (OTHER && OTHER.rows) {
        const oSell = OTHER.head.findIndex(h => h.indexOf('卖价') >= 0);
        const oMap = {};
        OTHER.rows.forEach(r => { oMap[r[0]] = r; });
        const mine = {};
        R.forEach(r => { mine[r[0]] = r; });
        const shared = R.map(r => r[0]).filter(n => oMap[n]);
        crossN = shared.length;
        /* 列序固定成 RF1 在前、RF2 在后，倍数固定 RF2÷RF1——
           两作的「卖价」列下标不同（RF1 是第 5 列、RF2 是第 4 列），
           必须各按自己表的表头取，不能共用当前作的 iSell */
        const iS1 = SOURCE_RF12.rf1.head.findIndex(h => h.indexOf('卖价') >= 0);
        const iS2 = SOURCE_RF12.rf2.head.findIndex(h => h.indexOf('卖价') >= 0);
        const r1row = n => (id === 'rf1' ? mine[n] : oMap[n]);
        const r2row = n => (id === 'rf1' ? oMap[n] : mine[n]);
        crossRows = shared.map(n => {
            const a = r1row(n), b = r2row(n);
            const sa = has(a[iS1]) ? +a[iS1] : null;
            const sb = has(b[iS2]) ? +b[iS2] : null;
            const k = (sa && sb) ? sb / sa : null;
            let ratio = DASH;
            if (k != null) ratio = (Math.abs(k - 1) < 0.005) ? '<span class="txc">同价</span>' : '×' + k.toFixed(2);
            return [n, money(a[iS1]), money(b[iS2]), ratio];
        });
        onlyMine = R.map(r => r[0]).filter(n => !oMap[n]);
        onlyOther = OTHER.rows.map(r => r[0]).filter(n => !mine[n]);
    }

    /* 两作口径不同，导语与统计分开写 */
    const is1 = id === 'rf1';

    const caveLine = is1
        ? `源表的「获取地点」有 <b>${caveR.length}</b> 种写着「N 洞」——这是<b>第 N 个洞窟</b>的简写，不是第 N 层。全表能在店里买到的只有 <b>${buyR.length}</b> 种（${buyR.map(r => r[0]).join('、')}），其中 3 种还是<b>医院</b>卖的。`
        : `源表的「所在地」铺得很开：<b>${N}</b> 种里有 <b>${R.filter(r => has(r[iLoc]) && !/种地|田地|钓鱼|探索华尔兹|加工机/.test(r[iLoc])).length}</b> 种落在具体地图区域，剩下的是田地／钓鱼、加工机与「探索华尔兹」这几种非地图来源。`;

    const priceNote = is1
        ? `医院那 3 种，<b>买价一律是卖价的 30 倍</b>：${buyR.filter(r => has(r[iShop]) && r[iShop].indexOf('病院') >= 0).map(r => r[0] + ' 买 ' + r[iBuy] + 'G／卖 ' + r[iSell] + 'G').join('、')}。买来再卖是纯亏，别当倒卖货源。`
        : `源表给 <b>${buyR.length}</b> 种全填了买价，却只在 <b>${shopR.length}</b> 种上标了店铺（${shopR.map(r => r[0] + '→' + r[iShop]).join('、')}）——所以「买价」是源表给的一个数，<b>不等于每种都买得到</b>。`;

    return `
    <p class="p">这一页在前面几作讲的是「打这只怪、掉这件东西、<b>概率多少</b>」。${is1 ? 'RF1' : 'RF2'} 的源表<b>一个概率数字都没有</b>——只写了「从哪来」和「值多少」。所以下面只回答<b>去哪弄</b>、<b>能卖多少</b>，不回答打几次能出；原表没给的，本站不替它补。</p>
    ${stat(is1
        ? [['素材', N + ' 种'], ['标了魔物来源', monR.length + ' 种'], ['店里能买到', buyR.length + ' 种'], ['配方里用得到', useR.length + ' 种']]
        : [['素材', N + ' 种'], ['标了魔物来源', monR.length + ' 种'], ['填了买价', buyR.length + ' 种'], ['配方里用得到', useR.length + ' 种']])}

    <h2 class="h2">${N} 种素材，${is1 ? '来源几乎全靠打和挖' : '铺在大小地图与三种设施里'}</h2>
    <p class="p">${caveLine}</p>
    <p class="p">${priceNote}</p>
    ${is1 && caveKeys.length ? `<p class="p">各洞摊到多少种：${caveKeys.map(k => '<b>' + k + ' 洞</b> ' + caveCnt[k] + ' 种').join('、')}。后三个洞最密，6、7、8 洞各 ${caveCnt['6'] || 0} 种，前五个洞明显稀疏。</p>` : ''}
    ${ftableOwn(['名称', '魔物掉落', is1 ? '获取地点' : '所在地', '买价', '卖价', '配方数'],
        ['6.4rem', '10rem', 'auto', '5.6rem', '5.2rem', '4.4rem'],
        allRows, { ph: '搜素材、魔物或地点', cls: 'src12', left: [1, 2] })}
    <div class="note">「配方数」是源表「${is1 ? '配方需求' : '配方用得到'}」那一列里列了几件成品，不是件数上限——一件素材能被多少配方用到，就是多少。买价写「—」的，是源表这一格空着或写「-」，本站不按卖价折算。</div>

    <h2 class="h2">谁掉什么：反过来查</h2>
    <p class="p">${is1
            ? `按魔物归并后有 <b>${monKeys.length}</b> 只怪、共 <b>${monKeys.reduce((s, n) => s + byMon[n].length, 0)}</b> 条「怪→素材」关系，平均一只掉 ${(monKeys.reduce((s, n) => s + byMon[n].length, 0) / monKeys.length).toFixed(2)} 种。掉得最多的是 ${monKeys.slice(0, 3).map(n => n + '（' + byMon[n].length + ' 种）').join('、')}；结晶类没有专属怪——水之结晶 7 只、地／风之结晶各 6 只都能掉，缺结晶就地找怪，不必守着一只刷。`
            : `按魔物归并后有 <b>${monKeys.length}</b> 只怪、共 <b>${monKeys.reduce((s, n) => s + byMon[n].length, 0)}</b> 条「怪→素材」关系，平均一只掉 ${(monKeys.reduce((s, n) => s + byMon[n].length, 0) / monKeys.length).toFixed(2)} 种——比 RF1 碎得多，绝大多数怪只出一种。出得最多的是 ${monKeys.slice(0, 3).map(n => n + '（' + byMon[n].length + ' 种）').join('、')}，其中摩可摩可的三种软软毛是<b>心数分档生产</b>，不是打怪掉。`}</p>
    ${ftableOwn(['魔物', '能掉几种', '素材'], ['9rem', '5.4rem', 'auto'],
        monRows, { ph: '搜魔物或素材', cls: 'src12', left: [2] })}
    ${is1 ? '' : '<div class="note">源表「骷髅」那一格的魔物列写的是「哥布林流氓、哥布林大佬、<b>哥布林大佬</b>」——同一个名字写了两遍。此处照录原样，统计时按一只算。</div>'}

    <h2 class="h2">配方里用得最多的素材</h2>
    <p class="p">${useR.length} 种素材被写进了配方，合计 <b>${useTotal}</b> 处引用，平均每种 ${(useTotal / useR.length).toFixed(1)} 处。${is1 ? '铁' : '铁'}排第一（${useArr[0][1].length} 处）——${is1 ? '金、银、铜紧随其后，四种金属就占了 124 处' : '金、银紧随其后，三种金属合计 130 处'}。想攒材料，先攒金属。</p>
    ${tbl(['素材', '配方数', '主要用途'], useRows, { leftFirst: true, colw: ['8rem', '5rem', 'auto'], cls: 'src12', left: [2] })}

    ${crossN ? `<details class="mon-fold">
        <summary>与 ${id === 'rf1' ? 'RF2' : 'RF1'} 同名的 ${crossN} 种素材，卖价并排看（点一下）</summary>
        <p class="p">两作共 <b>${crossN}</b> 种同名素材（${id === 'rf1' ? 'RF1 ' + N + ' 种里占 ' + Math.round(crossN / N * 100) + '%' : 'RF2 ' + N + ' 种里占 ' + Math.round(crossN / N * 100) + '%'}）。<b>倍数那一列固定是「RF2 卖价 ÷ RF1 卖价」</b>，大于 1 表示同一件东西在 RF2 更值钱，小于 1 则相反——两页方向一致，不随本作翻转。差价最大的几项不一定是同一件东西真变了价——两作的素材用途本来就不同，这里只并排数字，不做换算、也不推断谁更划算。</p>
        ${tbl(['素材', id === 'rf1' ? 'RF1 卖价' : 'RF1 卖价', id === 'rf1' ? 'RF2 卖价' : 'RF2 卖价', '倍数'],
            crossRows, { leftFirst: true, colw: ['9rem', '6rem', '6rem', '5rem'], cls: 'src12' })}
        <p class="p">另有只在一作出现的：${id === 'rf1' ? 'RF1' : 'RF2'} 独有 <b>${onlyMine.length}</b> 种（${onlyMine.join('、') || '—'}），${id === 'rf1' ? 'RF2' : 'RF1'} 独有 <b>${onlyOther.length}</b> 种（${onlyOther.join('、') || '—'}）。其中「软软毛 S／M／L 型」与「软软毛 S／M／L」、「毛线球 S／M／L 型」与「毛线球 S／M／L」其实是同一批东西，只是一边带「型」字——按名字对不上，不代表两作少了这些素材。</p>
    </details>` : ''}

    <div class="note">${is1
            ? '数据取自 biligame 符文工房 wiki 的「RF1itemdata」页（源页表头：' + H.join('／') + '）。三处照录不修：源页的表格说明写的是「<b>符文工厂1药学配方</b>」，可表里装的是全部材料，说明与内容对不上；表里混着几件看着不像采集素材的东西（' + (R.filter(r => !has(r[iSell])).map(r => r[0]).join('、') || '—') + '），它们没有卖价，来源写着温泉、豪宅、铁匠铺或干脆空着，本站照录、不猜它们干什么用；店名与店址里的「ノイマンズ•ファーム」「エド病院」原文未译，照写。'
            : '数据取自 biligame 符文工房 wiki 的「RF2item」页（源页表头：' + H.join('／') + '）。两处照录：地名里混着未译的日文（パレルモ神殿 穏やかな春、新緑の地下神殿 一層、渓谷の地下神殿 八層……），源表只给日文名，本站不替它编中文；来源写「<b>探索华尔兹</b>」的 5 种（丝绸、引火药、毒粉、结实的藤蔓、坏掉的柄）不是地图地点，源表就这么归类，具体是什么设施本页不解释。'}</div>`;
}

function sourceRf3Html() {
    const A = (typeof MAT_RF3 !== 'undefined') ? MAT_RF3 : [];
    if (!A.length) return '';
    const num = v => (v === '—' || v === '' || v == null) ? null : parseInt(v, 10);
    const money = v => (v == null ? '<span class="mon-no">—</span>' : v + 'G');
    const dash = v => (v == null ? '<span class="mon-no">—</span>' : v);
    const srcOf = r => (!r[13] || r[13] === '—') ? null : r[13];

    const N = A.length;
    const noSrc = A.filter(r => !srcOf(r));
    const mine = A.filter(r => srcOf(r) && /挖矿/.test(r[13]));
    const synth = A.filter(r => srcOf(r) && /合成/.test(r[13]));
    const lvTier = A.filter(r => srcOf(r) && /Lv/.test(r[13]));

    /* 魔物来源：按怪名聚合，去掉「Lv1~10」这类后缀 */
    const byMon = {};
    A.forEach(r => {
        const s = srcOf(r); if (!s) return;
        if (/^(挖矿|合成)$/.test(s)) return;
        s.split('、').forEach(x => {
            const k = x.replace(/Lv.*$/, '').trim(); if (!k) return;
            (byMon[k] = byMon[k] || []).push(r[0]);
        });
    });
    const monNames = Object.keys(byMon);
    const oneKind = monNames.filter(k => byMon[k].length === 1).length;
    const monTop = monNames.slice().sort((a, b) => byMon[b].length - byMon[a].length || a.localeCompare(b)).slice(0, 12);
    const dropCount = A.filter(r => srcOf(r) && !/^(挖矿|合成)$/.test(r[13])).length;

    /* 单一出处：来源串里没有顿号 */
    const solo = A.filter(r => { const s = srcOf(r); return s && s.indexOf('、') < 0; });
    const soloSell = solo.map(r => num(r[2])).filter(v => v != null).sort((a, b) => a - b);
    const soloMed = soloSell[Math.floor(soloSell.length / 2)];
    const multi = A.filter(r => { const s = srcOf(r); return s && s.indexOf('、') >= 0; });
    const multiSell = multi.map(r => num(r[2])).filter(v => v != null).sort((a, b) => a - b);
    const multiMed = multiSell[Math.floor(multiSell.length / 2)];

    /* 负属性：作为强化材料时会倒扣 */
    const NEG = [['攻', 3], ['魔攻', 4], ['防', 5], ['魔防', 6], ['力', 7], ['智', 8], ['体', 9]];
    const negOf = r => NEG.filter(([k, i]) => (num(r[i]) || 0) < 0).map(([k, i]) => k + num(r[i])).join(' ');
    const negAll = A.filter(r => negOf(r));
    const negSolo = negAll.filter(r => negOf(r) && srcOf(r) && r[13].indexOf('、') < 0).length;

    /* 卖价 × 强化难度 */
    const both = A.filter(r => num(r[12]) != null && num(r[2]) != null);
    const corr = (() => {
        const xs = both.map(r => num(r[12])), ys = both.map(r => num(r[2]));
        const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
        let n = 0, dx = 0, dy = 0;
        xs.forEach((x, i) => { n += (x - mx) * (ys[i] - my); dx += (x - mx) * (x - mx); dy += (ys[i] - my) * (ys[i] - my); });
        return dx && dy ? n / Math.sqrt(dx * dy) : 0;
    })();
    const top10 = A.slice().sort((a, b) => (num(b[2]) || 0) - (num(a[2]) || 0)).slice(0, 10);
    const topNeg = top10.filter(r => negOf(r)).length;

    /* ---- 各表 ---- */
    const kindRows = [
        ['魔物掉落', dropCount + ' 件', '占绝大多数'],
        ['挖矿', mine.length + ' 件', mine.map(r => r[0]).join('、') || '—'],
        ['合成', synth.length + ' 件', synth.map(r => r[0]).join('、') || '—'],
        ['原表未标', noSrc.length + ' 件', noSrc.map(r => r[0]).join('、') || '—'],
    ];

    const soloRows = solo.slice().sort((a, b) => (num(b[2]) || 0) - (num(a[2]) || 0)).map(r => [
        r[0] + ' ' + r[13], [r[0], r[13].replace(/Lv.*$/, '') + (/Lv/.test(r[13]) ? '<span class="mon-no">（' + r[13].replace(/^.*?(Lv.*)$/, '$1') + '）</span>' : ''),
        money(num(r[2])), dash(r[12])]
    ]);

    const tierRows = lvTier.map(r => [
        r[0], r[13].replace(/^.*?(Lv.*)$/, '$1'), money(num(r[2])), dash(r[12])
    ]);

    const monRows = monTop.map(k => [
        k + ' ' + byMon[k].join(' '),
        [k, byMon[k].length + ' 件', Array.from(new Set(byMon[k])).join('、')]
    ]);

    const topRows = top10.map(r => [
        r[0], '<b>' + money(num(r[2])) + '</b>', dash(r[12]), r[13], negOf(r) ? '<b>' + negOf(r) + '</b>' : '<span class="txc">无</span>'
    ]);

    const negRows = negAll.map(r => [
        r[0] + ' ' + (r[13] || ''),
        [r[0], '<b>' + negOf(r) + '</b>', money(num(r[2])), dash(r[12]), srcOf(r) ? r[13] : '<span class="mon-no">原表未标</span>']
    ]);

    const allRows = A.slice().sort((a, b) => (num(b[2]) || 0) - (num(a[2]) || 0)).map(r => [
        r[0] + ' ' + (r[13] || '') + ' ' + negOf(r),
        [r[0], srcOf(r) ? r[13] : '<span class="mon-no">原表未标</span>', money(num(r[1])), money(num(r[2])), dash(r[12]), negOf(r) ? '<b>' + negOf(r) + '</b>' : '<span class="txc">无</span>']
    ]);

    return `
        <p class="p">先说清楚这一节跟前面几作<b>不是同一种表</b>：边境与海洋给的是「打这只怪，掉这件东西的概率」，RF3 的源表<b>只写了「从哪来」，一个概率都没有</b>。所以下面所有内容都只回答「去哪弄」，不回答「打几次能出」——原表没给的东西，本站不替它编。</p>
        ${stat([['素材', N + ' 件'], ['标了来源', (N - noSrc.length) + ' 件'], ['魔物来源', monNames.length + ' 种'], ['只有一个出处', solo.length + ' 件']])}

        <h2 class="h2">来源就这四类</h2>
        <p class="p">${N} 件素材里 ${dropCount} 件靠打怪，<b>挖矿只出一件（废铁），合成只出一件（毛线球）</b>。剩下 ${noSrc.length} 件原表根本没写来源，页面显示「原表未标」。</p>
        ${tbl(['来源类型', '件数', '都是什么'], kindRows, { leftFirst: true, cls: 'txt', colw: ['5rem', '3.4rem', 'auto'] })}
        <div class="key">别指望靠挖矿凑强化材料——<b>全表只有废铁一件来自挖矿，而且它还扣攻扣防</b>。要凑素材就是刷怪，没有第二条路。</div>

        <h2 class="h2">${solo.length} 件素材，全作只有这一个出处</h2>
        <p class="p">这是这一页最该先看的一张表：${N} 件里有 ${solo.length} 件的来源栏<b>没有顿号</b>，也就是说——<b>缺了它就必须去打那一只怪，没有替代品</b>。按卖价从高到低排：</p>
        ${ftableOwn(['素材', '唯一出处', '卖价', '强化难度'],
            ['7rem', 'auto', '4.4rem', '4.4rem'], soloRows, { ph: '输入素材名或魔物名筛选' })}
        <div class="key">这张表基本就是<b>一份 BOSS 清单</b>：排在前面的是火龙鳞片←弗雷克扎伊德、地龙鳞片←普罗戴格力德、水龙羽鳍←阿克娜比特、克里莫亚的鳞片←克里莫亚、冰壁的碎片←死亡之墙——<b>卖价越靠前，出处越像主线必经的那几场硬仗</b>。而且单源素材的卖价中位 ${money(soloMed)}，是 ${multi.length} 件多源素材（中位 ${money(multiMed)}）的 ${Math.round(soloMed / multiMed)} 倍：能随手刷到的都不值钱，值钱的都得专门去打。</div>

        <h2 class="h2">摩可摩可：同一只怪按等级给三种不同的毛</h2>
        <p class="p">全表<b>唯一一组按怪物等级分档</b>的素材。同一只摩可摩可，等级不同掉的东西完全不同：</p>
        ${tbl(['素材', '掉落条件', '卖价', '强化难度'], tierRows, { leftFirst: true, cls: 'txt', colw: ['7.4rem', 'auto', '4.4rem', '4.4rem'] })}
        <div class="key">想要最值钱的那件<b>毛茸茸的软软毛（${money(700)}）</b>，得把牧场里的摩可摩可<b>练到 21 级以上</b>；Lv1~10 只掉软软毛（${money(120)}），Lv11~20 掉软绒毛（${money(500)}）。同一只怪、同一个掉落位，等级差一档收入差 ${Math.round(700 / 120)} 倍。</div>

        <h2 class="h2">掉最多素材的 ${monTop.length} 只</h2>
        <p class="p">${monNames.length} 种魔物来源里，有 ${oneKind} 只<b>只掉一种素材</b>；掉得最多的是这几只：</p>
        ${ftableOwn(['魔物', '件数', '能掉出什么'],
            ['6.4rem', '3.2rem', 'auto'], monRows, { ph: '输入魔物名或素材名筛选' })}
        <div class="key">摩可摩可虽然挂着 4 件，但其中 3 件是<b>同一种毛的三个等级档</b>，去重后只剩 2 种。真要说「一只怪能凑齐一套」的，是<b>迷你石魔人</b>（银／金／白金／钻石，全是矿石类）和<b>沙漠蝎／死亡蝎</b>（虫皮、漂亮的虫皮、蝎子的尾巴、蝎子的钳子）。</div>

        <h2 class="h2">越贵越难打进去，而且多半带减益</h2>
        <p class="p">${both.length} 件同时标了卖价与强化难度，两者的相关系数是 <b>${corr.toFixed(2)}</b>——卖得越贵，想把它打进装备越难。卖价前十里<b>有 ${topNeg} 件带负属性</b>，也就是说最贵那批几乎都是「加一大截、扣一小截」。</p>
        ${tbl(['素材', '卖价', '强化难度', '出处', '倒扣'], topRows,
            { leftFirst: true, cls: 'txt', colw: ['7rem', '4.4rem', '4.4rem', 'auto', '4rem'] })}
        <div class="key">卖价最高的<b>火龙鳞片</b>（${money(10000)}，难度 87）扣 4 点防御；<b>地龙鳞片</b>扣 3 点攻击却加 26 防御。<b>别只看卖价决定用不用</b>——差的那一两点可能正好抵消你堆了半天的方向。</div>

        <h2 class="h2">${negAll.length} 件素材会倒扣属性</h2>
        <p class="p">RF3 的素材当强化材料时会把数值<b>直接加到装备上，负数就是减</b>。全表 ${negAll.length} 件带负值，其中 <b>${negSolo} 件是单一来源</b>——好东西几乎都带减益，这是这一作强化系统的基本脾气。</p>
        <details class="mon-fold">
            <summary>展开全部 ${negAll.length} 件（点一下）</summary>
            ${ftableOwn(['素材', '倒扣', '卖价', '强化难度', '出处'],
                ['6.6rem', '4.6rem', '4rem', '4.4rem', 'auto'], negRows, { ph: '输入素材名或魔物名筛选' })}
        </details>

        <h2 class="h2">${noSrc.length} 件原表没写来源</h2>
        <p class="p">${noSrc.map(r => '<b>' + r[0] + '</b>').join('、')}——这 ${noSrc.length} 件的「入手」栏在源表里就是空的。石头、树枝、木材属于随手捡的基础材料，但<b>牧草、紫水晶、地之结晶</b>原表同样空着，本站不替它补。</p>

        <h2 class="h2">全 ${N} 件（可搜索）</h2>
        ${ftableOwn(['素材', '出处', '买价', '卖价', '强化难度', '倒扣'],
            ['6.6rem', 'auto', '3.6rem', '3.6rem', '4.4rem', '4rem'], allRows, { ph: '输入素材名、魔物名或「挖矿」筛选' })}
        <div class="note">「出处」一栏照抄源表原样，<b>包括它自己的笔误</b>——比如「龙牙」把克里莫亚列了两遍、「优质毛皮」把究极恶魔列了两遍，本站不去重也不改写。买价为空的只有<b>火之结晶</b>一件（原表未标）。</div>
        <div class="note">本页数据适用于 <b>RF3 与 RF3 特别版</b>：特别版沿用原作主线与素材体系，未收录特别版可能新增的部分。</div>
        <div class="jump">
            <a href="#/page/material">
                <div class="jp-t">素材与矿石</div>
                <div class="jp-s">这些素材加的是什么属性、强化难度怎么用</div>
            </a>
            <a href="#/page/mbook">
                <div class="jp-t">魔物图鉴</div>
                <div class="jp-s">上面那些怪在哪出没、数值多少</div>
            </a>
        </div>`;
}

/* ------------------------------------------------------------
   3 代出货清单（极击网）—— 日文原名与另一套译名
   RF3_GOODS.rows : [日文原名, 源译名, 大类, 子类, 季节, 站内同名, 匹配方式]
   匹配方式 1 = 中文名完全相同，2 = 译名规范化（刺身→生鱼片／仗→杖／去「的」）后相同，
   0 = 未配。译名不同但可能是同一件东西的，本节一律不猜——按条数比得出的差，
   只有逐条核过的那一类才写成「真的少」。
   ------------------------------------------------------------ */

/* 物品一览的搜索键顺带收日文原名：玩日版的按原文也能搜到。
   只收配对成功的（m=1/2），未配的没有可靠的落点。 */
function rf3GoodsAlias() {
    const D = (typeof RF3_GOODS !== 'undefined') ? RF3_GOODS : null;
    if (!D || !D.rows) return null;
    const m = {};
    D.rows.forEach(r => {
        if (!r[5]) return;
        const cur = m[r[5]] ? m[r[5]].split(' ') : [];
        if (cur.indexOf(r[0]) < 0) cur.push(r[0]);
        m[r[5]] = cur.join(' ');
    });
    return m;
}

function rf3GoodsHtml() {
    const D = (typeof RF3_GOODS !== 'undefined') ? RF3_GOODS : null;
    if (!D || !D.rows) return '<p class="p">极击网的出货清单未加载。</p>';
    const R = D.rows;
    const IT = (typeof ITEM_RF3 !== 'undefined') ? ITEM_RF3 : [];
    const gEsc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

    const cats = Array.from(new Set(R.map(r => r[2])));
    const subs = Array.from(new Set(R.map(r => r[2] + '\u00b7' + r[3])));
    const nSame = R.filter(r => r[6] === 1).length;
    const nNorm = R.filter(r => r[6] === 2).length;
    const nHit = nSame + nNorm;
    const nMiss = R.length - nHit;

    /* 武器八类：源子类与站内类别一一对应，可以只比条数 */
    const WMAP = [['双剑', '双剑'], ['杖', '魔杖'], ['单手剑', '单手剑'], ['双手剑', '双手剑'],
        ['枪', '长枪'], ['锤', '锤'], ['斧', '斧'], ['盾', '盾']];
    const wRows = WMAP.map(p => {
        const L = R.filter(r => r[3] === p[0]);
        const b = IT.filter(r => r[1] === p[1]).length;
        const m = L.filter(r => r[5]).length;
        const d = b - L.length;
        return [p[0], L.length + ' 种', p[1], b + ' 种',
            d === 0 ? '—' : (d > 0 ? '+' : '') + d + ' 种', m + ' / ' + L.length];
    });
    const wDlt = wRows.reduce((s, r) => s + (parseInt(r[3], 10) - parseInt(r[1], 10)), 0);
    const wSame = wRows.filter(r => r[1] === r[3]).map(r => r[0]);

    /* 鱼的季节标注 */
    const fish = R.filter(r => r[3] === '鱼');
    const SEAS = ['春', '夏', '秋', '冬'];
    const seRows = SEAS.map(s => {
        const L = fish.filter(r => r[4] === s).map(r => r[1]);
        return [s, L.length + ' 种', L.join('、')];
    });
    const noSe = fish.filter(r => !r[4]).map(r => r[1]);

    /* 791 条全表：日文名、源译名、类别、子类、季节、站内同名 */
    const tRows = R.map(r => [
        r[0] + ' ' + r[1] + ' ' + r[2] + ' ' + r[3] + ' ' + (r[4] || '') + ' ' + (r[5] || ''),
        [gEsc(r[0]), gEsc(r[1]), r[2], r[3],
            r[4] ? '<span class="nw">' + r[4] + '</span>' : '<span class="mon-no">—</span>',
            r[5] ? gEsc(r[5]) + (r[6] === 2 ? '<span class="mon-no">（规范化）</span>' : '')
                : '<span class="mon-no">—</span>']
    ]);

    return `
    <h2 class="h2">另一份清单：极击网的出货列表</h2>
    <p class="p">上面那张表是解包文本，只有中文名，分类是<b>按解包表的排列顺序</b>切的。极击网那份《RF3 全出货列表》（<b>樱桃小乐乐</b> 整理）换了个口径：按<b>出货箱</b>把能卖的东西分成 7 大类 38 子类，每一条都写<b>日文原名</b>和中文译名，鱼还标了季节。</p>
    <p class="p">两边名字、分类、条数都对不上，但正好互补——<b>日文原名是本站此前完全没有的</b>。791 条全收在下面那张表里，其中 ${nHit} 条能确定落到站内某一件上（另有 ${nMiss} 条译名不同，不猜）。物品一览的搜索框也顺带收了这 ${nHit} 条的日文名，玩日版的可以直接按原文搜。</p>
    ${stat([['源条目', R.length + ' 条'], ['大类 / 子类', cats.length + ' / ' + subs.length], ['与站内对上', nHit + ' 条'], ['未配', nMiss + ' 条']])}

    <h3 class="h3">口径不一样：站内比它多出两整类</h3>
    <p class="p">站内 ${IT.length} 条是解包全表，连<b>魔法与技能</b>（53 条）和<b>配方书</b>（10 本）都收；出货清单里这两类<b>一条都没有</b>——它们进不了出货箱，按「能卖什么」的角度不需要。反过来，源是按<b>出货箱</b>分的，同一件东西在两边的归类会挪位——「伞」和「猴子布偶」源里算<b>盾</b>，站内归<b>防具与饰品</b>；「战斗镰刀」源里算<b>斧</b>，站内归<b>农具</b>。所以两份表<b>不是包含关系</b>，别拿 ${IT.length} 减 ${R.length} 当「缺了多少」。</p>

    <h3 class="h3">武器八类：条数能比，名字比不了</h3>
    <p class="p">装备里最好比的是武器，源这边每一类对站内一类。后两列一个是条数差，一个是<b>按名字真正配上几条</b>——这两件事差得很远，往下一看就明白：</p>
    ${tbl(['源子类', '源条数', '站内类别', '站内条数', '差', '按名字配上'], wRows, { left: [0], colw: ['5rem', '4.2rem', '5.2rem', '4.6rem', '3.6rem', '5.4rem'] })}
    <p class="p"><b>${wSame.join('、')}</b>这 ${wSame.length} 类条数一模一样，说明两边是同一套武器、同一套分类粒度。另 ${wRows.length - wSame.length} 类合计差 ${Math.abs(wDlt)} 件，而且<b>查得清来路</b>：<b>盾</b>差的那 2 件是<b>口径不同</b>——源把「伞」（かさ）和「猴子布偶」（さるのぬいぐるみ）算进盾，站内这两件归<a href="#/page/rf3list">防具与饰品</a>；<b>斧</b>差 3 件里也有 1 件同因（源「战斗镰刀」在斧类，站内归农具），剩下「恶魔手指」「毒蜥之牙」两条站内查不到同名，可能是译名不同，没核。</p>
    <p class="p"><b>但条数相等不等于逐条对得上。</b>看最后一列：枪 ${wRows[4][5]}、单手剑 ${wRows[2][5]}、斧 ${wRows[6][5]}——两边译名差得太远（<b>死翔枪</b>／ゲイボルグ、<b>奥丁神枪</b>／グングニル、<b>刃灵</b>／レギオン、<b>粉碎之锤</b>／ミョルニル）。所以这张表只能当「两边是不是同一套武器」的粗查，<b>不能当逐条对照表用</b>；要日文名就翻下面那张全表。</p>

    <h3 class="h3">791 条全表（日文原名 ＋ 另一套译名）</h3>
    <p class="p">按源里的大类与子类原样排列。「站内同名」一列只有定得下来的才填；填了「（规范化）」的，是把源译名按 <b>刺身→生鱼片、仗→杖、去掉「的」</b> 换过之后才与站内对上的——每一次替换都能在表里复核，不是按意思猜的。</p>
    ${ftableOwn(['日文原名', '中文译名（源）', '类别', '子类', '季节', '站内同名'],
        ['8.6rem', '8.4rem', '3.8rem', '4.6rem', '3.4rem', 'auto'], tRows,
        { cls: 'rf3goods', left: [1, 5], ph: '输入日文原名或中文译名筛选，如「スピア」「芜菁」' })}

    <h3 class="h3">鱼的季节：${fish.length} 种里 ${fish.length - noSe.length} 种标了季节</h3>
    <p class="p">这一列是源独有的。站内<a href="#/page/fishspot">钓点与季节</a>页是按<b>钓点</b>分的（哪个水塘出什么鱼），没有逐鱼的季节；源按<b>鱼</b>给，正好反过来，两边能对着用。</p>
    ${tbl(['季节', '种数', '鱼'], seRows, { left: [0, 2], colw: ['3.6rem', '4.2rem', 'auto'] })}
    <p class="p">另有 <b>${noSe.length} 种没标季节</b>：${noSe.map(x => '<b>' + gEsc(x) + '</b>').join('、')}。原文这四行后面就是空的，没写「全年」，所以这里也只留空。</p>

    <h3 class="h3">同名不同物：两个「龙牙」</h3>
    <p class="p">源里有两条中文都叫<b>龙牙</b>，日文却不是同一个词：「<b>竜の牙</b>」在「枪」这一类，是件<b>武器</b>；「<b>ドラゴンの牙</b>」在「收集品」，是<b>素材</b>。站内现在也是两条，但名字差一个字：素材那条叫<b>龙牙</b>（一直都有），长枪那条叫<b>龙之牙</b>（2026-11-02 才补进站内，见上面的说明框）。</p>
    <p class="p">补进来的「龙之牙」不是孤证：站内<a href="#/page/weapon">武器</a>页那张数值表（来自 biligame 的 218 条）<b>一直就有它</b>——物攻 347、魔攻 140、归在枪类；锤类的「试力石」也在（物攻 58）。也就是说这两件武器在武器页看得见、在物品一览里却查不到，是同一样东西在两个页面不一致，这轮把物品表补齐才对上。它的说明是「<b>参考锐利的龙牙打造出的枪</b>」，与源把它归在「枪」这一节也吻合，基本可以认定与「竜の牙」是同一条。但站内没有物品编号、日文原名也对不上（只有中文），<b>没有能直接核实的凭据</b>，所以全表里「龙牙」这一行的「站内同名」格<b>仍然留空</b>——按站内一贯的做法，宁可空着，也不把「很像」当「就是」。</p>
    <p class="p">这也是配对时<b>先按子类限定候选范围</b>的原因：不限定的话，那把叫「竜の牙」的枪会被错配到素材「龙牙」上，一错就是两行。上面「未配」那 ${nMiss} 条里没有强行配对，也是同一个道理。</p>

    <h3 class="h3">照录不改</h3>
    <ul class="ul">
        <li class="li"><b>把「杖」写成「仗」</b>：源里「银仗」（シルバーロッド）、「贤者之仗」（ウィザードスタッフ）、「符文之仗」（ルーンスタッフ）三处。其中只有「符文之仗」在把「仗」换回「杖」之后与站内<b>符文之杖</b>对上（表里标了「规范化」）；「银仗」站内写作<b>银之杖</b>（多一个「之」），「贤者之仗」站内没有这个名字，两条都没配。</li>
        <li class="li"><b>「水場草」译成「水厂草」</b>：源里「水厂草种子」「枯掉的水厂草种子」两条（都在「特效种子」一节），日文是 水場草の種，中文把「場」写成了「厂」。站内这两条叫<b>水生草的种子</b>「干枯的水生草种子」，所以没配上——错字看得明白，但本站不改原文，也不拿它当对应依据。</li>
        <li class="li"><b>两条日文拼错</b>：「ドグニジマス」「ドクニジマウさし」应是 <b>ドク</b>ニジマス（毒虹鳟），源里第二个假名写成 グ。</li>
        <li class="li"><b>「大肥金枪鱼/大舌头」</b>：大トロ 这一条给了两个中文名，「大舌头」与金枪鱼无关。站内没有对应项，未配。</li>
        <li class="li"><b>六行「蘑菇」一模一样</b>：源的「蔬菜」一节里 きのこ（蘑菇）连写 6 行，没有任何区分；站内也正好 6 条「蘑菇」。两边都这样，说明游戏里有 6 个占位同名的蘑菇，不是录入重复。</li>
        <li class="li"><b>毛线球两边不一致</b>：站内「素材」里有 3 条「毛线球」，源里只有 1 条（收集品）。这是两表少见的<b>对不上</b>，原文都如此，仅记录。</li>
    </ul>`;
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
/* 特别版／豪华版已并入本体作品页，两版共用同一份数据，不再需要别名映射 */
const GIFT_KEY = {};
const GIFT_SEAS = ['春', '夏', '秋', '冬'];

/* 各作机制差异，读者最容易在这里误会成"漏收" */
const GIFT_DIFF = {
    rf1: '这一作<b>只有「最喜欢」和「喜欢」两份清单</b>——送错了不掉好感，只是白送。所以本页的讨厌栏是空的，不是没查。',
    rf2: '<b>没有「最喜欢」档</b>，取而代之的是每人指定一件「生日礼物」，只在生日当天送才吃满收益。讨厌档齐备，这一作的雷区反而最值得记。',
    rf3: '四档里<b>讨厌档特别整齐</b>，另有每位候补的<b>喜欢的香水</b>——香水是独立于料理与素材的一条加成线，本作独有。',
    rff: '<b>没有「最讨厌」档</b>，只有最喜欢／喜欢／讨厌三份。人物与初代重叠很多，生日也大半沿用了初代的日期。',
    rfo: '<b>没有「最讨厌」档</b>，只有最喜欢／喜欢／讨厌三份。清单照攻略本「喜好」表原文：原表常把一类东西写成一条（「全部甜点」「全部烤鱼」「除宝石外的全部饰品素材」），本页就照这个粒度写，<b>不拿别作的道具名去替它展开</b>——展开出来的往往是别的作品才有的东西。',
    azuma: '这一作（龙之天地）的送礼体系和前作<b>骨架一致、细节多出四条线</b>：最喜欢／喜欢／讨厌／最讨厌四档都齐，但多了<b>话题</b>、<b>回礼</b>、<b>泡澡后的乐子</b>、<b>给你的生日礼物</b>（本页在折叠区单列，前作没有）。源站给的生日只覆盖 10 位——剩下 7 位（空／海／陆／花／露／夜／摩可绒，多为精灵系）源表本就未列，本页留「—」，不替它编一个。'
};

/* ------------------------------------------------------------
   村民喜好：RF1 / RF2
   RF1 只有「最喜欢」「喜欢」两档（源页原话：RF1 没有最讨厌和讨厌的礼物），
   另附住址、其它加好感手段、求婚条件与婚后便当。
   RF2 没有「最喜欢」档，改成每人指定一件「生日礼物」；讨厌档齐备。
   两作字段互不相同，各渲染各的，不套一张表、不把别作机制搬过来。
   源：biligame 符文工房 wiki「RF1characters」「RF2characters」；2026-10-31 复核，
   wikitext 与本地快照逐字节相同。由 _build_gift_rf12.py 生成 js/gift_rf12.js。
   ------------------------------------------------------------ */
function giftRf12Html(g) {
    const id = g.id;
    const D = (typeof GIFT_RF12 !== 'undefined') ? GIFT_RF12 : {};
    const A = (D[id] || []).slice();
    if (!A.length) return '<div class="note">这一作的人物喜好数据尚未收录。</div>';

    const SEAS = '春夏秋冬';
    const bdKey = s => {
        const m = /^([春夏秋冬])月?(\d+)日/.exec(s || '');
        return m ? SEAS.indexOf(m[1]) * 100 + Number(m[2]) : 9999;
    };
    const dash = '<span class="mon-no">—</span>';
    const cut = (arr, n) => !arr || !arr.length ? dash
        : arr.length > n
            ? arr.slice(0, n).join('、') + ` <span class="txc">等 ${arr.length} 样</span>`
            : arr.join('、');
    const who = x => npcLink(id, x.n);
    const byBd = A.slice().sort((a, b) => bdKey(a.bd) - bdKey(b.bd) || a.n.localeCompare(b.n));

    /* 源站与站内的中文译名不一定一样。本页按日文名对齐到站内名，差异集中说明一次。 */
    const diff = A.filter(x => x.src);
    const diffNote = diff.length
        ? `源站与站内对其中 ${diff.length} 位的译名不同（本页按<b>日文名</b>逐一对齐，不靠中文名猜）：` +
        diff.map(x => `源「${x.src}」→ 本站「${x.n}」`).join('、') + '。'
        : '';

    if (id === 'rf1') {
        const withBd = byBd.filter(x => x.bd);
        const noBd = byBd.filter(x => !x.bd);
        const totL = A.reduce((s, x) => s + x.l.length, 0);
        const seasonCnt = withBd.reduce((a, x) => { a[x.bd[0]] = (a[x.bd[0]] || 0) + 1; return a; }, {});
        const seasonTxt = SEAS.split('').filter(s => seasonCnt[s]).map(s => s + seasonCnt[s]).join('／');
        const bAll = A.reduce((s, x) => s.concat(x.b), []);
        const noB = A.filter(x => !x.b.length);
        const prop = A.filter(x => x.prop);
        const extras = A.filter(x => x.extra);
        const most = A.slice().sort((a, b) => b.l.length - a.l.length)[0];
        const nf = (typeof NPC_FULL !== 'undefined' && NPC_FULL[id]) || [];
        const roleOf = n => ((nf.filter(x => x.n === n)[0] || {}).r) || '';
        const gap = prop.filter(x => !roleOf(x.n));

        const rows = byBd.map(x => [
            [x.n, x.b.join(' '), x.l.join(' '), x.bd, x.prop, x.bento].join(' '),
            [x.bd || dash, who(x), cut(x.b, 2),
                (x.lq ? `<span class="txc">（${x.lq}${x.lnotes && x.lnotes.length ? '，' + x.lnotes.join('；') : ''}）</span><br>` : '')
                + cut(x.l, 12)],
        ]);
        const propRows = prop.map(x => [
            [x.n, x.prop, x.bento].join(' '),
            [who(x), x.prop, x.bento || dash],
        ]);

        return `
        <h2 class="h2">这一作只有两档：最喜欢，和「喜欢」</h2>
        <p class="p">源页开头一句就是结论：<b>RF1 没有最讨厌和讨厌的礼物</b>。送错了不掉好感，只是白送一份东西——所以本页没有讨厌栏，不是漏收。真正要记的只有两样：他在生日那天最想要的那一件，和平常随手都送得出手的那一类。</p>
        ${stat([
            ['收录村民', A.length + ' 人'],
            ['有生日', withBd.length + ' 人'],
            ['最喜欢', bAll.length + ' 件'],
            ['喜欢合计', totL + ' 条'],
        ])}
        <div class="key">每人只指定 <b>一件</b> 最喜欢的东西，${bAll.length} 件<b>互不重复</b>——没有「一样东西通吃全村」的捷径，背一包草莓换不来几个人的心。反倒「喜欢」那一档宽得多：平均每人 ${(totL / A.length).toFixed(1)} 样，最宽的 ${most.n} 有 ${most.l.length} 样。</div>

        <h2 class="h2">生日一览：${withBd.length} 人有日子，${noBd.length} 人源页写「无」</h2>
        <p class="p">生日当天送「最喜欢」是这一作最划算的一步。表按季节和日期排好，谁的日子快到了就从上往下找。四季分布 ${seasonTxt} 人，冬天最挤，${seasonCnt['冬'] || 0} 个人过生日。</p>
        ${ftableOwn(['生日', '村民', '最喜欢', '喜欢'], ['5rem', '7.4rem', '9rem', 'auto'],
            rows, { ph: '搜村民或礼物', cls: 'gfill', left: [2, 3] })}
        <div class="note">${noB.length ? noB.map(x => x.n).join('、') + ' 在源页里「最喜欢」「喜欢」两栏都写「无」——照录，不是漏收。' : ''}${noBd.length ? noBd.map(x => x.n).join('、') + ' 的生日源页也写「无」。' : ''}</div>

        <h2 class="h2">${prop.length} 位能结婚的人：求婚条件与婚后便当</h2>
        <p class="p">源页对这 ${prop.length} 位各给了一条求婚条件和一份「结婚后的便当」。便当是配偶每天给你带的午饭，也是这一作婚姻里唯一实打实拿到手的东西。两栏名单<b>完全重合</b>——能求婚的，就是会给便当的。</p>
        ${ftableOwn(['村民', '求婚条件', '婚后便当'], ['7.4rem', 'auto', '9rem'],
            propRows, { ph: '搜村民', cls: 'gfill', left: [1] })}
        ${gap.length ? `<div class="key">这 ${prop.length} 位里有 ${gap.length} 位在站内「角色」页的身份栏还是空的（${gap.map(x => x.n).join('、')}），而源页明确给了她们的求婚条件。两处对不上，本页照源页列，不据此给谁补一个身份。</div>` : ''}

        <h2 class="h2">${extras.length} 个人除了送礼还有别的门路</h2>
        <p class="p">源页给这几个人单列了「其它提升好感度手段」——对他们来说送礼不是最快的路。其中两条是<b>扣分</b>的：在女澡堂撞见美乐蒂会掉好感，拉碧丝则会因为你在这座城镇里 HP 归零而掉好感。</p>
        ${tbl(['村民', '手段'], extras.map(x => [who(x), x.extra]),
            { leftFirst: true, colw: ['7.4rem', 'auto'], left: [1] })}
        <div class="note">数据取自 biligame 符文工房 wiki「RF1characters」页。三处照录不改：「冥」的喜欢写的是<b>除心动鲷鱼、封印乌贼、龙虾、西太公鱼外的所有鱼</b>并列出 26 种；「莎拉」写的是<b>所有菜刀食物</b>并列出 25 种——源页的分类式写法，本站只把物品一条条拆出来，<b>「菜刀食物」这个词没改</b>（原文如此，疑为「包丁料理」的直译），也没替它补全清单外的品种。求婚条件里还夹着没译的日文原文（「グリード通行書」「クレメンス山」），照录；同一页对同一人前后写法也不统一——标题写「萝赛塔」、琉特那栏写「罗塞塔」，两处都保留，没替源站抹平。${diffNote}</div>`;
    }

    const totL = A.reduce((s, x) => s + x.l.length, 0);
    const hAll = A.reduce((s, x) => s.concat(x.h), []);
    const hUniq = new Set(hAll).size;
    const prop = A.filter(x => x.prop);
    /* 源页的「民译」有 3 条与站内名逐字相同（多萝茜／高顿／麦克斯），列出来只会像打错字 */
    const aliasAll = A.filter(x => x.alias && x.alias !== x.n);
    const srcMap = {};
    A.forEach(x => { if (x.src) srcMap[x.src] = x.n; });
    const fix = s => srcMap[s] || s;

    const marry = [];
    A.forEach(x => (x.notes || []).forEach(t => {
        const m = /^第(\d)年([春夏秋冬]\d+日)\s*[　 ](.+?)和(.+?)结婚$/.exec(t.trim());
        if (m) {
            const a = fix(m[3]), b = fix(m[4]);
            if (!marry.some(y => (y.a === a && y.b === b) || (y.a === b && y.b === a))) {
                marry.push({ y: m[1], d: m[2], a: a, b: b });
            }
        }
    }));
    const kids = [];
    A.forEach(x => (x.notes || []).forEach(t => {
        const m = /^母：(.+?)，父：(.+)$/.exec(t.trim());
        if (m) kids.push({ child: x.n, mom: fix(m[1]), dad: fix(m[2]) });
    }));

    const rows = byBd.map(x => [
        [x.n, x.l.join(' '), x.h.join(' '), x.bg].join(' '),
        [x.bd || dash, who(x),
            cut(x.l, 6) + (x.ch2 ? ` <span class="txc">${x.ch2}</span>` : ''),
            cut(x.h, 3)],
    ]);
    const bgRows = byBd.map(x => [
        [x.n, x.bg, x.prop].join(' '),
        [who(x), x.bd || dash, x.bg || dash, x.prop || dash],
    ]);

    return `
    <h2 class="h2">这一作没有「最喜欢」，换成了一件生日礼物</h2>
    <p class="p">源页写的是：<b>RF2 没有最讨厌和最喜欢的礼物</b>。取而代之，每个人指定<b>一样生日礼物</b>——只在生日当天送才吃满收益，平时送就是普通的「喜欢」。所以本页的「最喜欢」栏换成「生日礼物」，别拿它当日常清单用。</p>
    ${stat([
        ['收录村民', A.length + ' 人'],
        ['喜欢合计', totL + ' 条'],
        ['讨厌', hAll.length + ' 件'],
        ['求婚道具', prop.length + ' 件'],
    ])}
    <div class="key">这一作的雷区反而最值得记：${A.length} 个人各讨厌 <b>一样</b>东西，${hAll.length} 件<b>一件都没撞车</b>——不像 RF5 那样有「垃圾」清单能一刀切，这里必须逐人记，送错就是明着掉好感。</div>

    <h2 class="h2">生日与喜好：${A.length} 人</h2>
    <p class="p">${(() => {
        const c = {};
        A.forEach(x => { if (x.bd) c[x.bd[0]] = (c[x.bd[0]] || 0) + 1; });
        const v = SEAS.split('').map(s => c[s] || 0);
        return v.every(n => n === v[0])
            ? `这一作生日排得很匀：春夏秋冬<b>各 ${v[0]} 人</b>，平均一个季节 ${(v[0] / 3).toFixed(1)} 个。`
            : `四季分布 ${SEAS.split('').map((s, i) => s + v[i]).join('／')} 人。`;
    })()}表按日期排。</p>
    ${ftableOwn(['生日', '村民', '喜欢', '讨厌'], ['5rem', '7.4rem', 'auto', '10rem'],
        rows, { ph: '搜村民或礼物', cls: 'gfill', left: [2, 3] })}
    <div class="note">「喜欢」平均每人 ${(totL / A.length).toFixed(1)} 样，比 RF1 的清单短得多——这一作不靠堆礼物，靠记准。${A.filter(x => x.ch2).map(x => x.n + ' 的源页分章节写：' + x.ch2).join('；')}。</div>

    <h2 class="h2">生日礼物与求婚道具</h2>
    <p class="p">${A.length} 件生日礼物同样<b>互不重复</b>，没有两个人想要同一样。求婚道具只有 ${prop.length} 件，每人一样、彼此不同。其中「${prop.filter(x => /特製|特制/.test(x.prop)).map(x => x.prop).join('、') || '—'}」是限定兑换券，别当普通道具用掉。</p>
    ${ftableOwn(['村民', '生日', '生日礼物', '求婚道具'], ['7.4rem', '5rem', 'auto', '9rem'],
        bgRows, { ph: '搜村民或物品', cls: 'gfill', left: [2, 3] })}

    <h2 class="h2">第二代：${marry.length} 对婚礼、${kids.length} 个孩子</h2>
    <p class="p">这一作的时间跨度横跨两代，源页把婚礼的日子和孩子的父母都写进了人物栏。${marry.length} 对夫妻、${kids.length} 个孩子之间的对应关系整理如下——孩子也是可对话的村民，喜好单独算。</p>
    ${tbl(['夫妻', '婚礼', '孩子'],
        marry.map(m => {
            const k = kids.filter(k => (k.mom === m.a && k.dad === m.b) || (k.mom === m.b && k.dad === m.a))[0];
            return [npcLink(id, m.a) + ' ＆ ' + npcLink(id, m.b),
                '第' + m.y + '年' + m.d, k ? npcLink(id, k.child) : dash];
        }),
        { leftFirst: true, colw: ['auto', '8rem', 'auto'], left: [2] })}
    <div class="note">婚礼按源页写的「第几年」计，四个日子分散在第 2～4 年，不是开局就能看到的剧情。数据取自 biligame 符文工房 wiki「RF2characters」页。照录不合并几处：源页给 ${aliasAll.length} 位另标了<b>民译</b>（${aliasAll.map(x => x.n + '＝' + x.alias).join('、')}；另有 3 条的民译与站内名同字，未重复列），本站不采用这些别译、也不合并成条目；${(A.filter(x => x.lnotes && x.lnotes.length).map(x => x.n + ' 的『' + x.lnotes.join('；') + '』')).join('；')}——都是源页原话。${diffNote}</div>`;
}

function giftPage(g, arr) {
    const k = GIFT_KEY[g.id] || g.id;
    const A0 = arr || ((typeof NPC_FULL !== 'undefined') && NPC_FULL[k]) || [];
    /* 「非居民」是海洋的巨人优米尔：会出现在人物页，但不是村民，没有生日与喜好，不进这张表 */
    const A = A0.filter(x => !/非居民/.test(x.r || ''));
    if (!A.length) return '<div class="note">这一作的人物喜好数据尚未收录。</div>';

    /* azuma（龙之天地）的村民数据不进 npcfull 的七作模板，单独成表，且比前作多了
       话题／回礼／泡澡后的乐子／给你的生日礼物 四个维度，前作页不收，这里单列。 */
    const azumaExtras = (k === 'azuma') ? (
        '<details class="mon-fold"><summary>展开 azuma 专属的 4 个维度（话题／回礼／泡澡／生日礼）</summary>' +
        '<p class="p" style="padding:.2rem 0 .8rem">龙之天地比前作多了几条「送礼之外」的亲密度线：<b>话题</b>（共度时光聊什么涨最快）、<b>回礼</b>（你送他、他回你什么）、<b>泡澡后的乐子</b>（一起泡澡时递什么）、<b>给你的生日礼物</b>（他送你的生日礼，反过来记）。这几样前作没有，前作页也不收，这里单独列。</p>' +
        '<div class="txt-list">' + A.map(x => '<p><b>' + x.n + '</b>' +
            ((x.tf || x.tl || x.th || x.twh) ? ' ｜ 话题：最喜欢 ' + (x.tf || []).join('、') + '／喜欢 ' + (x.tl || []).join('、') + '／讨厌 ' + (x.th || []).join('、') + (x.twh ? '／最讨厌 ' + (x.twh || []).join('、') : '') : '') +
            (x.ret ? ' ｜ 回礼：' + x.ret.join('、') : '') +
            (x.bath ? ' ｜ 泡澡：' + x.bath.join('、') : '') +
            (x.bgYou ? ' ｜ 给你的生日礼：' + x.bgYou.join('、') : '') +
            '</p>').join('') + '</div></details>'
    ) : '';


    const bdKey = s => {
        const m = /^([春夏秋冬])月?(\d+)日/.exec(s || '');
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
        <p class="p" style="padding:.2rem 0 .8rem">平均一人 ${avgL.toFixed(1)} 条${longest && (longest.l || []).length > CUT ? `，最长的是 <b>${longest.n}</b>，一个人 ${longest.l.length} 样` : ''}。${avgL >= 10 ? '这一档宽到没有筛选价值——基本等于"这一类他都吃"，送礼时按类别挑就行。' : '这一作的原表本来就是把一类东西写成一条（「全部甜点」「全部矿石」这种），所以条数少不代表清单短。'}</p>
        <div class="txt-list">${A.map(x => `<p><b>${x.n}</b>：${(x.l || []).join('、') || '<span class="mon-no">源表无记录</span>'}</p>`).join('')}</div>
        ${k === 'rf2' ? '<div class="note" style="margin-top:.6rem">RF2 的源表把两代分开记，个别条目带着「第一章：」「第二章无喜好物」这样的前缀，本页照原文保留、不删不改——那句话本身就是信息。</div>' : ''}
    </details>` : ''}

    ${HAS_PF ? `<details class="mon-fold">
        <summary>展开 ${A.filter(x => x.pf && String(x.pf).length).length} 位候补的「喜欢的香水」</summary>
        <p class="p" style="padding:.2rem 0 .8rem">香水在本作是独立于料理和素材的第三条加成线：同一个人对香水的反应，跟他的喜欢清单<b>不是一套</b>，不能互相推。</p>
        <div class="txt-list">${A.filter(x => x.pf && String(x.pf).length).map(x => `<p><b>${x.n}</b>：${[].concat(x.pf).join('、')}</p>`).join('')}</div>
    </details>` : ''}

    <div class="note">${k === 'azuma' ? '数据源自中文攻略站 gametoeasy.com《符文工房:龙之天地》村民喜好页（post/1853，CC 转载），由 <code>_build_azuma_villager.py</code> 解析生成 <code>js/azuma_gift.js</code>；龙之天地是动作 RPG＋村庄建设，体系与七作不同，本页<b>不混入</b> npcfull 的七作模板，单独成表' : '数据与「人物档案」是同一批源——biligame 符文工厂 wiki 各作人物页（CC BY-SA），由 <code>_build_npcfull.py</code> 生成到 <code>js/npcfull.js</code>'}。本页只是把同一份数据横过来看：<b>没有新增任何推断值</b>，所以你在人物页和这里看到的清单一定一致。<br>源表没给的字段就是空的：${A.length} 人里有 ${A.filter(x => !x.bd).length} 人查不到生日、${A.filter(x => !(x.b || []).length).length} 人没有最喜欢记录，本页留「—」，不按同族或同村推一个日期出来。</div>

    ${azumaExtras}

    <div class="jump">
        ${k !== 'azuma' ? `<a href="#/resident/${g.id}/全部">
            <div class="jp-t">居民一览</div>
            <div class="jp-s">按身份、生日排序，点进去看完整档案</div>
        </a>` : ''}
        <a href="#/page/love">
            <div class="jp-t">恋爱与结婚</div>
            <div class="jp-s">好感怎么涨、告白条件与婚后生活</div>
        </a>
    </div>`;
}

/* ===== 原作与移植版对照 =====
   RF3／RF3SP、RF4／RF4SP 各是同一部作品的两个版本，读者最常问的是「移植版到底多了什么」。
   两组共用一条条目，靠 g.id 分流；表里只写两版不一样的地方，各自的系统介绍留给「游戏简介」。
   事实来源：Marvelous／XSEED Games 官方发布、世嘉亚洲商品说明、任天堂 eShop 与 Steam 的 DLC 说明。 */

function diffRf3(g) {
    return `
    <h2 class="h2">同一部作品，两个版本</h2>
    <p class="p">RF3 与 RF3 特别版不是两部作品：舞台西亚廉斯镇、主角麦斯、11 位花嫁候补、主线流程都一致，特别版是把 2009 年的 NDS 版整部重做之后搬到 Switch 与 PC。下表只列两版<b>不一样的地方</b>。</p>
    ${tbl(['项目', 'RF3（2009／NDS）', 'RF3 特别版（2023／Switch・PC）'], [
        ['画面', 'NDS 原生 256×192，双屏', '角色、背景全部 HD 化；角色模组、道具、魔物模组、特效<b>全部重新制作</b>'],
        ['新婚模式', '—', '与 11 位花嫁候补各解锁一段婚后剧情；对话采用 Live2D，配新语音、新插画与新影片'],
        ['Another Episode', '—', '11 段全语音绘本事剧，按候补各自的视角展开（付费 DLC，见下）'],
        ['难度', '—', '追加最高难度「地狱」'],
        ['开场动画', '原版 OP', '由制作历代 OP 的 Point Pictures 重制'],
        ['联机功能', '支持无线连线与 Wi-Fi 连线', '本作<b>未收录</b>——官方商品说明里专门注明这一点'],
        ['存档联动', '—', '同机有 RF4 豪华版存档 → 雷斯特服装；有 RF5 → 亚雷斯服装'],
        ['中文', '无', 'Switch 亚洲版 2023-03-30，繁中／简中／韩文字幕，日语语音'],
    ], { leftFirst: true, colw: ['15%', '30%', '55%'] })}
    <h2 class="h2">Another Episode 怎么收费</h2>
    <p class="p">这 11 段追加剧情不是无条件白送，各地政策不一样：</p>
    <ul class="ul">
        <li class="li"><b>日版 Switch</b>：2023-03-02 上市当天配信，<b>2023-04-03 之前免费</b>，之后 648 日元。</li>
        <li class="li"><b>欧美与 PC 版</b>：2023-09-05 上市，上市后一个月内免费，<b>2023-10-02 起 4.99 美元</b>。</li>
        <li class="li"><b>亚洲中文版</b>：没有单独的免费期公告，以商店页当期标价为准。</li>
    </ul>
    <div class="note">另有一份与本篇无关的付费内容「大家一起穿泳装模式」，随中文限定版附赠。它不含任何剧情，只是换装。</div>
    <h2 class="h2">只玩一版的话</h2>
    <p class="p">想一次看完故事、又在意画面，选特别版：新婚模式与地狱难度是它独有的，追加剧情另买即可。反过来，NDS 版的无线／Wi-Fi 连线功能在特别版里被拿掉了，想联机只能回到原版；双屏与触控在单屏上也复现不了，这正是原版唯一还没被替代的部分。</p>
    <div class="note"><b>译名</b>：两作的日文名都叫「スペシャル」。中文官方商品名把这一部写作「符文工廠3豪華版」（世嘉自己的说明文字里也出现过「特別版」的写法），本站为区分两部，RF3 一律称「特别版」、RF4 称「豪华版」。</div>
    <div class="note">新婚模式怎么解锁、Another Episode 是几段怎么进，单开了一页讲：<a class="link" href="#/page/newly">新婚模式</a>。</div>
    <div class="key">本站<b>不按版本分页</b>：3 与 3 特别版共用这一条作品页，其余各页（BOSS、农场、锻造、物品……）也是两版合一份数据。<b>两版不一样的地方只在本页这张表里</b>，看完这张表，下面各页按需看哪一版都能对。特别版新增的「新婚模式」与「Another Episode」怎么开，见：<a class="link" href="#/page/newly">新婚模式</a>。</div>
    `;
}

function diffRf4(g) {
    return `
    <h2 class="h2">同一部作品，两个版本</h2>
    <p class="p">RF4 与 RF4 豪华版的故事、舞台赛尔菲亚、12 位候补、主线流程完全一致，豪华版是把 2012 年的 3DS 版重做后的版本。下表只列两版<b>不一样的地方</b>。</p>
    ${tbl(['项目', 'RF4（2012／3DS）', 'RF4 豪华版（2019／Switch・2021／PC・PS4・Xbox）'], [
        ['画面', '3DS 双屏', 'HD 化；2021 年的 PC／PS4／Xbox 版再提升分辨率与帧率'],
        ['新婚模式', '—', '12 位候补各一段独立婚后剧情，新录语音与新动画'],
        ['Another Episode', '—', '12 位候补 + 风幻龙共 13 段全语音绘本事剧；风幻龙那一话随本篇收录'],
        ['难度', '—', '在原有难度之上追加「地狱」'],
        ['语音', '日语', '日语／英语双语音；另加「Voice Comment」声优评论'],
        ['动画', '原版', '新制作片头；部分过场重制'],
        ['中文', '无官方中文', 'Switch 亚洲版 2019-12-05 繁中，系列首次官方中文'],
    ], { leftFirst: true, colw: ['15%', '22%', '63%'] })}
    <h2 class="h2">Another Episode 怎么收费</h2>
    <ul class="ul">
        <li class="li"><b>Switch 版（日版）</b>：2019-07-25 上市起配信，<b>2019-08-26 之前免费</b>，之后 700 日元。</li>
        <li class="li"><b>Switch 版（欧美）</b>：2020-02-25 起单独上架。</li>
        <li class="li"><b>PC／PS4／Xbox One</b>：2021-12-07 版<b>直接内含</b>，不需要另外下载、也不另收费。</li>
    </ul>
    <div class="note">只有风幻龙那一话例外：它从 Switch 版首发起就写在本篇里，不用买。</div>
    <h2 class="h2">只玩一版的话</h2>
    <p class="p">直接玩豪华版。它把原作内容整套保留，新增部分全部是多出来的，没有删减；如果买的是 PC／PS4／Xbox 版，连 Another Episode 都不用另买。原版 3DS 的价值只剩下双屏布局与当年的手感。</p>
    <div class="note"><b>译名</b>：两作的日文名都叫「スペシャル」。中文官方商品名把这一部写作「符文工廠4豪華版」，所以本站沿用「豪华版」；RF3 那部本站称「特别版」，是为了跟这部区分开，两者的层级其实相同。</div>
    <div class="note">新婚模式为什么「结了婚还要再买一次」、Another Episode 与新婚模式的差别，单开了一页讲：<a class="link" href="#/page/newly">新婚模式</a>。</div>
    <div class="key">本站<b>不按版本分页</b>：4 与 4 豪华版共用这一条作品页，其余各页（BOSS、农场、锻造、物品……）也是两版合一份数据。<b>两版不一样的地方只在本页这张表里</b>。豪华版新增的「新婚模式」与「Another Episode」怎么开，见：<a class="link" href="#/page/newly">新婚模式</a>。</div>
    `;
}

/* ===== 新婚模式与追加剧情（RF3 特别版／RF4 豪华版独有） =====
   这两块都是移植版新增、原作没有。上一页「移植版对照」只交代了它们存在，
   读者看完还是不知道「怎么开、进去玩什么」，所以单开一条。
   事实来源：Marvelous／XSEED 的官方发表与商品说明、世嘉亚洲商店页、
   Fandom 的 RF3S 条目（列出 11 位新婚模式角色）、Siliconera 的系统评测与结婚流程。
   凡是各版本可能有出入的数值（解锁点数、单段时长）都不写死，只给区间或「以游戏内显示为准」。 */

function newlywedRf3(g) {
    return `
    <h2 class="h2">这一页讲的是原作没有的部分</h2>
    <p class="p">RF3 特别版在 2009 年 NDS 版之上只加了三样东西：<b>新婚模式</b>、<b>地狱难度</b>、<b>Another Episode</b>。难度那项在「战斗与弱点」里已经说过，这一页专门讲前两样——它们都是原作玩不到的内容，也都有自己的解锁门槛。两版到底差在哪，见「移植版对照」。</p>
    <div class="note">下面的解锁链条、材料数量与等级要求，都是<b>原版 RF3 就有的规则</b>，特别版没有改。所以拿 NDS 时代的攻略来对本页也对得上，唯一多出来的是最后那一步「新婚模式」。</div>

    <h2 class="h2">新婚模式：婚后才能打开的那扇门</h2>
    <p class="p">它不是「多一段结局动画」，而是一个<b>独立于本篇的支线模式</b>：结婚之后，在标题画面或自宅的日记里会多出入口，进去以后以新生活为舞台，跟伴侣过一段有目标、有对话、有演出的婚后剧情。台词全部新录，立绘用 Live2D 会动，还配了新插画与新影片。</p>
    ${tbl(['步骤', '要做到什么', '容易卡在哪'], [
        ['① 推完主线', '打到两族和解的那场祭典之后', '指轮配方就在这之后的事件里给，提前做不出来'],
        ['② 好感拉满', '目标角色好感 10 心，并做完她的全部委托', '委托按好感分档解锁，光送礼不涨委托'],
        ['③ 备好双人床', '木材 80 ＋ 15,000G，向家具商买', '要等奥德瓦溪谷的 BOSS 打完后家具商才开始卖'],
        ['④ 打造婚约指轮', '红宝石 ×1 ＋ 银 ×2，锻造等级 20', '配方来自两族和解后的事件，没推到位就没有'],
        ['⑤ 求婚', '带指轮在约会地点提出', '同意之后立刻接一段剧情，别急着存档'],
        ['⑥ 救人', '未婚妻被掳走 → 龙之洞窟 → 打倒水龙', '要能走水面才过得去，魔法种子约 3,200G'],
    ], { leftFirst: true, colw: ['16%', '44%', '40%'] })}
    <div class="key">第 ⑤ 步之后那段剧情是本作最容易被误当成「坏档」的一处：<b>求婚成功不等于当晚就能结婚</b>，中间隔着一整个迷宫。把装备与恢复品备齐再求婚，免得剧情推进到一半打不过。</div>

    <h3 class="h3">最后那只拦路的</h3>
    <p class="p">挡在婚礼前的是水龙<b>阿库纳比特</b>：<b>水属性完全吸收、没有单一弱点</b>，地／风／暗三系只有 1/8 伤害，火与光减半。也就是说，靠属性克制打它基本没有便宜可占，硬碰硬的物理与无属性输出更稳；水属性武器在这一战里等于给自己回血。它同时是本站 BOSS 表里 RF3 的最后一条。</p>
    <div class="note">这一战之前记得先存档，并把「浮在水面行走」的手段备好——龙之洞窟在水上，没有它进不去。具体道具名各语言版译法不同，认「能让角色踩在水面上」的那个魔法种子即可。</div>

    <h2 class="h2">11 段婚后剧情，对应 11 位花嫁候补</h2>
    <p class="p">新婚模式不是通用剧本换张脸：11 位候补各有一段，与主线可攻略名单<b>一一对应</b>，一个不多一个不少。所以「我能不能看某某的新婚模式」这个问题，答案就是「能不能娶她」。</p>
    ${tbl(['花嫁候补', '日文', '生日'], [
        ['希雅', 'シア', '春 11'],
        ['多娜', 'トゥーナ', '春 29'],
        ['玛丽安', 'マリオン', '夏 17'],
        ['小可拉', 'ショコラ', '秋 21'],
        ['伊奥', 'イオン', '冬 22'],
        ['佩露夏', 'ペルシャ', '夏 6'],
        ['达丽娅', 'ダリア', '春 24'],
        ['咲耶', 'さくや', '夏 25'],
        ['索菲娅', 'ソフィア', '秋 7'],
        ['卡琳', 'カリン', '冬 4'],
        ['克璐璐法', 'クルルファ', '冬 17'],
    ], { leftFirst: true, colw: ['34%', '33%', '33%'] })}

    <h2 class="h2">想看全部 11 段，不用打通 11 遍</h2>
    <p class="p">一个存档只能跟一个人结婚，但<b>新婚模式的入口只看「这个档里跟谁结了婚」</b>。所以做法是：在求婚之前多存几个档，或者直接用旧档，换一个人重走 ⑤～⑥ 两步，就能解锁另一个人的新婚模式。主线不用重打——这是特别版相对原版最省事的一点。</p>
    <div class="note">新娘被掳走那段剧情每次都会重演，所以每换一个人都要再打一次水龙。装备好一点的存档可以省很多时间，别把手上的档覆盖掉。</div>

    <h2 class="h2">Another Episode：11 段全语音绘本</h2>
    <p class="p">与上面完全是两回事。<b>新婚模式是「婚后生活」，Another Episode 是「候补视角的独白」</b>——11 段绘本事短篇，全语音，配新插画，一段一个候补讲自己的心事。它不依赖存档进度，跟主线、跟新婚模式都独立，买了就能看。入口同样在标题画面。</p>
    <ul class="ul">
        <li class="li"><b>数量</b>：11 段，与 11 位花嫁候补对应。</li>
        <li class="li"><b>形式</b>：有声绘本，读过去就结束，没有操作、没有战斗。</li>
        <li class="li"><b>收费</b>：付费 DLC，各地免费期与价格不同（日版 2023-04-03 前免费、之后 648 日元；欧美与 PC 版 2023-10-02 起 4.99 美元）。明细见「移植版对照」。</li>
        <li class="li"><b>与本篇的关系</b>：不影响主线，也不解锁任何游戏内道具。</li>
    </ul>
    <div class="note">另有一份与本篇无关的付费内容「大家一起穿泳装模式」（随中文限定版／数字豪华版附赠），只换装、不含任何剧情，别和上面两个搞混。</div>

    <div class="jump">
        <a href="#/page/diff">
            <div class="jp-t">移植版对照</div>
            <div class="jp-s">特别版到底比原作多了什么，逐项列</div>
        </a>
        <a href="#/page/love">
            <div class="jp-t">恋爱与结婚</div>
            <div class="jp-s">好感怎么涨、告白与求婚的通用流程</div>
        </a>
        <a href="#/page/boss">
            <div class="jp-t">BOSS 战</div>
            <div class="jp-s">阿库纳比特与其余 19 位 BOSS 的属性表</div>
        </a>
    </div>`;
}

function newlywedRf4(g) {
    return `
    <h2 class="h2">这一页讲的是原作没有的部分</h2>
    <p class="p">RF4 豪华版在 2012 年 3DS 版之上加了四样东西：<b>新婚模式</b>、<b>Another Episode</b>、<b>Voice Comment</b>、<b>地狱难度</b>。后两样一个是声优评论、一个是难度选项，这里只带一句；重点是前两样——尤其是「新婚模式」，它的开启方式和一般人的想象不太一样。</p>

    <h2 class="h2">新婚模式：结婚之后还要再买一次</h2>
    <p class="p">这是本作最容易走错的一步：<b>结了婚不等于解锁</b>。婚礼结束后，要回城里的指示牌（ORDER）在追加项目里用王子／公主点数把该角色的新婚模式<b>买下来</b>，之后标题画面才会出现「新婚模式」这个选单。也就是说，它是「婚后 ＋ 花点数」两道门。</p>
    ${tbl(['步骤', '要做到什么', '容易卡在哪'], [
        ['① 结婚', '好感 10 心 ＋ 双人床 ＋ 婚约指轮，与 3DS 原版条件相同', '该角色的镇内事件没看完，求婚选项根本不会出现'],
        ['② 回城买解锁', '城内指示牌 → 追加项目 → 花王子／公主点数购入', '只解锁<b>当前伴侣</b>那一段，不是一次开全部'],
        ['③ 进模式', '标题画面 →「新婚模式」', '本篇存档里没有这个入口，别在游戏内找'],
    ], { leftFirst: true, colw: ['15%', '47%', '38%'] })}
    <div class="note"><b>点数到底要多少</b>：公开资料里有「按角色计费」和「一次性大额解锁全部」两种说法，且各语言版、后续更新可能不同，本站不写死一个数字。到指示牌前看一眼实际标价即可——反正点数在本作里攒得很快（对话、种田、打怪都给），不用为它刻意刷。</div>
    <h3 class="h3">进去以后是什么</h3>
    <p class="p">不是过场动画，是一段可以走动的独立小剧场：起个名字（自己的昵称、伴侣的昵称），在赛尔菲亚城里自由行动、跟居民聊天，居民会针对「你们刚结婚」这件事说新台词，屏幕上有持续的指引告诉你下一步去哪，走到最后给一段新演出。全程语音，立绘是 Live2D，配新 CG。</p>
    ${stat([['单段时长', '20 ～ 30 分钟'], ['存档', '完全独立，不继承本篇'], ['语音', '日语／英语双语音'], ['份数', '12 位候补各一段']])}
    <div class="key">它最大的价值不是「甜」，而是<b>补完主线结尾没讲完的部分</b>——很多候补的个人线在本篇里是悬着的，新婚模式才是收尾。所以别把它当甜点跳过。</div>

    <h2 class="h2">12 位候补，一段一位</h2>
    <h3 class="h3">花嫁候补 6 位</h3>
    ${tbl(['花嫁候补', '日文', '在城里的位置'], [
        ['库洛丽嘉', 'クローリカ', '见习执事'],
        ['玛格丽特', 'マーガレット', '餐厅的音乐屋'],
        ['琥珀', 'コハク', '花店'],
        ['芙缇', 'フォルテ', '骑士'],
        ['小白', 'シャオパイ', '温泉旅馆「小铃」'],
        ['朵儿洁', 'ドルチェ', '医院'],
    ], { leftFirst: true, colw: ['34%', '36%', '30%'] })}
    <h3 class="h3">花婿候补 6 位</h3>
    ${tbl(['花婿候补', '日文', '在城里的位置'], [
        ['比修奈尔', 'ビシュナル', '见习执事'],
        ['迪拉斯', 'ディラス', '水之遗迹事件后入城'],
        ['亚瑟', 'アーサー', '执务官'],
        ['奇尔', 'キール', '图书馆'],
        ['塔克', 'ダグ', '杂货店'],
        ['雷昂', 'レオン', '石棺事件后入城'],
    ], { leftFirst: true, colw: ['34%', '36%', '30%'] })}
    <p class="p">一档只能跟一个人结婚，所以想看别人的那段，得另开存档或读回婚礼前的档。迪拉斯、雷昂、琥珀、朵儿洁这四位要先在剧情里救出来／接进城里才谈得上，道格则要接近通关才肯谈婚论嫁。</p>

    <h2 class="h2">Another Episode：13 段，比新婚模式短得多</h2>
    <p class="p">同样是从标题画面进入，但它<b>不是</b>新婚模式：没有操作、没有城可逛，纯粹是一段几分钟的有声绘本，讲两人婚后过了一阵子的某个片段，不少还带着孩子。12 位候补各一段，第 13 段是风幻龙。</p>
    ${tbl(['项目', '新婚模式', 'Another Episode'], [
        ['入口', '标题画面「新婚模式」', '标题画面「Another Episode」'],
        ['前置', '结婚 ＋ 花点数解锁', '无，买了就能看'],
        ['形式', '可走动的独立小剧场', '有声绘本，一次读完'],
        ['时长', '20 ～ 30 分钟', '约 5 分钟'],
        ['份数', '12 段', '13 段（12 候补 ＋ 风幻龙）'],
        ['收费', '本篇内容，不另收费', 'Switch 版为付费 DLC；PC／PS4／Xbox 版内含'],
    ], { leftFirst: true, colw: ['16%', '42%', '42%'] })}
    <div class="note">风幻龙那一话是例外：它从 Switch 版首发起就写在本篇里，不用买 DLC 也能看。免费期与价格明细见「移植版对照」。</div>

    <h2 class="h2">另外两样，一句话带过</h2>
    <ul class="ul">
        <li class="li"><b>Voice Comment</b>：声优评论，标题画面另有入口，内容是配音演员聊自己演的角色。纯花絮，与本篇进度无关。</li>
        <li class="li"><b>地狱难度</b>：在原有难度之上再加一档，敌人更强、RP 更吃紧，但掉落与经验也更好。开局与读档时都能选，本页不展开，战斗细节见「战斗与弱点」。</li>
    </ul>

    <div class="jump">
        <a href="#/page/diff">
            <div class="jp-t">移植版对照</div>
            <div class="jp-s">豪华版到底比原作多了什么，逐项列</div>
        </a>
        <a href="#/page/love">
            <div class="jp-t">恋爱与结婚</div>
            <div class="jp-s">好感怎么涨、告白与求婚的通用流程</div>
        </a>
    </div>`;
}

    /* ------------------------------------------------------------
       宠物产出（produce 页）：派它干什么，它每天给你什么
         RF1   RF1petfarm  32 只魔物工作表（工作＋出现地点）
         RFF   RFFpet      生产概率（花型／矿石组／蘑菇组）＋好感度工作范围＋宠物生蛋
       源站这两作之外没有产出表：RF2／RFO 的 pet 页只有抚摸次数与喜好；
       RF5「同伴怪物生产道具一览」是一张残页（七行散句＋「待补充」），不编。
       ------------------------------------------------------------ */
function produceHtml(g) {
    const id = (g && g.id) || 'rf1';
    const W = (typeof PETWORK_RF1 !== 'undefined') ? PETWORK_RF1 : [];
    const PD = (typeof PETPROD_RFF !== 'undefined') ? PETPROD_RFF : [];
    const JB = (typeof PETJOB_RFF !== 'undefined') ? PETJOB_RFF : [];
    const EG = (typeof PETEGG_RFF !== 'undefined') ? PETEGG_RFF : [];

    /* ================= RF1 ================= */
    if (id === 'rf1') {
        const isProd = v => ['牛奶', '软软毛', '蜂蜜', '鸡蛋'].indexOf(v) >= 0;
        const prod = W.filter(x => isProd(x[1]));
        const ride = W.filter(x => x[1] === '骑乘');
        const water = W.filter(x => x[1] === '浇水');
        const harv = W.filter(x => x[1] === '收获');
        const dex = (typeof RF1_MON !== 'undefined') ? RF1_MON.length : 0;
        const pl = {};
        W.forEach(x => String(x[2]).split('、').forEach(p => { pl[p] = (pl[p] || 0) + 1; }));
        const top = Object.entries(pl).sort((a, b) => b[1] - a[1])[0] || ['', 0];

        return `
        <h2 class="h2">RF1：${W.length} 只认领了农活，其中只有 ${prod.length} 只负责产出</h2>
        <p class="p">初代把魔物的工作分得很粗：<b>产出型</b>每天固定给你一样东西（奶、毛、蜜、蛋），<b>劳力型</b>替你下地——浇水、收获，或者干脆当坐骑。<b>一只只干一件事</b>：又想让它产奶、又想让它浇水，只能养两只。</p>
        ${stat([['工作表', W.length + ' 只'], ['图鉴总数', dex + ' 只'], ['产出型', prod.length + ' 只'], ['劳力型', (W.length - prod.length) + ' 只']])}
        <div class="key">图鉴里 ${dex} 只，只有 ${W.length} 只有工作表，<b>其余 ${dex - W.length} 只既不干活也不产东西</b>——它们只在迷宫里当敌人和素材库。想要稳定产出，认准下面这 ${prod.length} 只就够：${prod.map(x => x[0] + '（' + x[1] + '）').join('、')}。</div>
        <p class="p">劳力这边分两种：<b>浇水 ${water.length} 只</b>（清一色的法师型与水栖型，名字带「小魔」的三只都在）、<b>收获 ${harv.length} 只</b>（兽人一系与哥布林一系几乎全包）。骑乘只有 ${ride.length} 只：${ride.map(x => x[0]).join('、')}。</p>
        ${tbl(['魔物', '工作', '出现地点'],
            W.map(x => [x[0], isProd(x[1]) ? '<b>' + x[1] + '</b>' : x[1], x[2]]),
            { leftFirst: true, cls: 'petwork' })}
        <div class="note">源表把地点写成「4洞」「2洞、6洞」，指的是<b>第几个洞窟</b>，本站照此写成「第 4 洞窟」。按出现点统计，${top[0]}最挤（${top[1]} 只），第 6 洞窟只有冰幽灵一只。</div>
        <div class="note">一处对不上，照录不合并：工作表中的<b>「幽灵」</b>在图鉴里没有同名条目（图鉴另有「鬼魂」）。两者是不是同一只，源页没有说明，本站不替它认定。</div>`;
    }

    /* ================= RF3 ================= */
    if (id === 'rf3') {
        const W3 = (typeof PWORK_RF3 !== 'undefined') ? PWORK_RF3 : [];
        if (!W3.length) return '<p class="p">这一作的宠物工作表未加载。</p>';
        const prod3 = W3.filter(r => r[2] && r[2] !== '-');
        const multi = prod3.filter(r => r[2].indexOf('、') >= 0);
        const ride3 = W3.filter(r => r[8] === '可骑乘');
        const dash = W3.filter(r => [4, 5, 6, 7].every(i => r[i] === '-'));
        const probs = W3.map(r => r[3]).filter(v => /^\d+$/.test(v)).map(Number);
        const pMin = Math.min.apply(null, probs), pMax = Math.max.apply(null, probs);
        const lv = k => W3.filter(r => r[k] === '优').length;

        return `
        <h2 class="h2">RF3：${W3.length} 只的农活能力表——产什么、能不能骑、活干得好不好</h2>
        <p class="p">RF3 的宠物一张表全包了：<b>生产物</b>（它在小屋里给你什么）、<b>捕捉率</b>，以及<b>浇水／劈柴／砸石／收获</b>四项农活的等级。等级的写法是「中／良／优」，源表本来就是这三个字，<b>没有数字</b>，本页也不替它折算成百分比。</p>
        ${stat([['收录', W3.length + ' 只'], ['有生产物', prod3.length + ' 只'], ['可骑乘', ride3.length + ' 只'], ['捕捉率', pMin + '～' + pMax]])}
        <div class="key">能产东西的只有 <b>${prod3.length} 只</b>（${Math.round(prod3.length / W3.length * 100)}%），其余 ${W3.length - prod3.length} 只生产物栏写「-」——它们是<b>纯劳力</b>：下地浇水、劈柴、砸石、收获，或者当坐骑。想凑齐奶蛋毛蜜那一套，得先认准这 ${prod3.length} 只里的那几种。</div>
        <p class="p">四项农活里，<b>砸石最难练到「优」</b>（只有 ${lv(6)} 只），<b>浇水与收获</b>各有 ${lv(4)} 只和 ${lv(7)} 只；劈柴在中间，${lv(5)} 只。四项全是「-」的只有 ${dash.length} 只，那是连农活都不干的。</p>
        ${ftableOwn(['名字', '地点', '生产物', '捕捉率', '浇水', '劈柴', '砸石', '收获', '骑乘'],
            ['6.4rem', '10rem', '10rem', '4.2rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem', '4.4rem'],
            W3.map(r => [r[0], [
                r[0], r[1], r[2] === '-' ? '<span class="mon-no">—</span>' : r[2], r[3],
                r[4], r[5], r[6], r[7],
                r[8] === '可骑乘' ? '<span class="mon-yes">可骑</span>' : '<span class="mon-no">—</span>',
            ]]),
            { ph: '输入名字、地点或生产物', cls: 'rf3work' })}
        <div class="note">三处照录不修：<b>生产物</b>一列有 ${multi.length} 只写了 2～3 件（如「${multi[0] ? multi[0][2] : ''}」），源表就是一格多件，本页不拆行；<b>捕捉率</b>是 ${pMin}～${pMax} 的整数，源表没写单位，也不说明是百分比还是档位；<b>地点</b>栏有多处用「、」并了三四个地名，原样保留。</div>
        <div class="note">特别版（RF3SP）沿用本表——源页只有一份 <code>RF3farm</code>，<b>没有单列特别版的差异</b>，所以这里不假装两作数值不同。</div>`;
    }

    /* ================= RF2 ================= */
    if (id === 'rf2') {
        const PR = (typeof PETPROD_RF2 !== 'undefined') ? PETPROD_RF2 : [];
        const JB2 = (typeof PETJOB_RF2 !== 'undefined') ? PETJOB_RF2 : [];
        const byMon = {};
        PR.forEach(r => { (byMon[r[0]] = byMon[r[0]] || []).push(r); });
        const monNames = Object.keys(byMon);
        return `
        <h2 class="h2">RF2：${monNames.length} 种魔物按好感度分三档给你东西</h2>
        <p class="p">RF2 的宠物产出比初代精细：初代是一天固定一样，RF2 是<b>好感度越高、产出的尺寸越大</b>。软软毛、牛奶、鸡蛋都分 S／M／L 三档，只有蜂蜜不分（黄蜂全程给蜂蜜）。把同一只养到 8~10 好感，拿到的货明显更大。</p>
        ${stat([['会产出的魔物', monNames.length + ' 种'], ['产出档位', '3 档（S／M／L）'], ['工作时段', JB2.length + ' 种']])}
        <div class="key">${monNames.length} 种产出魔物：${monNames.join('、')}。其余魔物在 RF2 只干活（浇水／收获／伐木／砸石）不产出——它们按「友好手套抚摸次数」收服，清单在<a class="link" href="#/page/gift">魔物喜好</a>的「RF2 收服」表里。</div>
        ${tbl(['魔物', '好感度', '产物'], PR.map(r => [r[0], r[1], '<b>' + r[2] + '</b>']), { leftFirst: true })}
        <div class="note">尺寸写法（软软毛S／牛奶M／鸡蛋L 等）取自源表日文原名（ふわ毛Ｓサイズ 等），按站内通用译名显示。黄蜂的好感度区间是 1~10（其余三种从 0 起），源表如此，照录不统一。</div>

        <h2 class="h2">四种工作，各有固定时段</h2>
        <p class="p">派去干活的时段是写死的：浇水从凌晨 4 点干到午夜，收获从下午 4 点到午夜，伐木和砸石只在白天（上午 8 点~下午 4 点）。想让一只魔物兼顾多项，得按时段排班，或干脆多养几只。</p>
        ${tbl(['工作', '可工作时段'], JB2.map(r => [r[0], r[1]]), { leftFirst: true })}
        <div class="note">时段取自 biligame「RF2pet」页的「宠物工作」表。源表的「上午0点」指当日午夜（24:00），本站照录不折算。源表只给了这四种工作的起止时间，没有写「产出」与「工作」之间的好感门槛差异，本页不另作换算。</div>`;
    }

    /* ================= 海洋 ================= */
    if (id === 'rfo') {
        const PO = (typeof PETPROD_RFO !== 'undefined') ? PETPROD_RFO : [];
        if (!PO.length) return '<p class="p">这一作暂时没有宠物产出数据。</p>';
        const prods = {};
        PO.forEach(r => { prods[r[1]] = (prods[r[1]] || 0) + 1; });
        const prodNames = Object.keys(prods).sort((a, b) => prods[b] - prods[a]);
        const days = PO.map(r => parseInt(r[3], 10)).filter(v => !isNaN(v));
        const dMin = Math.min.apply(null, days), dMax = Math.max.apply(null, days);
        const gem = PO.filter(r => /宝石|金|银/.test(r[1])).length;
        return `
        <h2 class="h2">海洋：${PO.length} 只魔物每天被你刷毛、隔几天给你产一样东西</h2>
        <p class="p">海洋的宠物产出跟 RF2 的「好感度分档」不同：<b>每只固定产一种东西</b>，靠「毛刷次数」（每天能刷几次涨好感）和「产出天数」（每隔几天收一次）两个参数描述。奶蛋毛蜜是每天稳定来源，宝石与金属来自宝箱系魔物，产出周期长得多（10 天一次）。</p>
        ${stat([['会产出的魔物', PO.length + ' 只'], ['产出物种类', prodNames.length + ' 种'], ['产出天数', dMin + '～' + dMax + ' 天']])}
        <div class="key">${prodNames.length} 种产出物：${prodNames.join('、')}。其中奶／蛋／毛／蜜每天都有；宝石与金属来自 ${gem} 只宝箱系魔物（红宝石／蓝宝石／金／银），产出天数一律 10 天。</div>
        ${tbl(['魔物', '产出物', '毛刷次数', '产出天数', '出现点'], PO.map(r => [r[0], '<b>' + r[1] + '</b>', r[2], r[3], r[4]]), { leftFirst: true, left: [4], cls: 'rfoprod' })}
        <div class="note">源表「黄蜂」在原文里重复出现两次（两行逐字相同），本站已合并为一行。毛刷次数与产出天数取自 biligame「RFOpet」页的「魔物生产物列表」。出现点里的「精灵殿／沉船／岛屿」等都是游戏内实际地名，源表用「[[日文|中文]]」链接，本站只取中文显示名。</div>`;
    }

    /* ================= 边境 ================= */
    if (!PD.length) return '<p class="p">这一作暂时没有宠物产出数据。</p>';

    const grp = {};
    PD.forEach(r => { (grp[r[2]] = grp[r[2]] || []).push(r); });
    const keys = Object.keys(grp);
    const flowers = keys.filter(k => /花$/.test(k));
    const oreKey = keys.filter(k => k.indexOf('小小龙') >= 0)[0];
    const mushKey = keys.filter(k => k.indexOf('蘑菇') >= 0)[0];
    const fixed = keys.filter(k => grp[k].every(r => !/\d%$/.test(r[1])));
    const pct = k => grp[k].filter(r => /\d%$/.test(r[1]));

    /* 概率写在表头，格子里只放产物名——同一格再标一遍百分比只会把表撑高 */
    const frow = k => [k].concat(pct(k).map(r => r[0]));
    const orow = k => {
        const rows = pct(k);
        return [k, rows[0][0], rows[1][0], rows.slice(2, 7).map(r => r[0]).join('／'), rows[7][0]];
    };

    return `
        <h2 class="h2">边境：三只花型魔物就是三台换季种子抽奖机</h2>
        <p class="p">边境的宠物分两种活法：<b>产出型</b>（花、矿石、蘑菇、毛、蜜、奶、蛋）每天按概率吐东西，<b>劳力型</b>（采伐、收获、浇水、割草、砸石头）按好感决定能干多大一片地。先看产出。</p>
        ${tbl(['魔物', '50%', '30%', '15%', '4%', '1%'], flowers.map(frow), { leftFirst: true, cls: 'prod' })}
        <div class="key">三只花的第一档都是<b>芜菁种子 50%</b>，往后的档位才换成当季作物——所以它们本质上是<b>按季节发的种子袋</b>，芜菁保底、稀有种子靠 1% 那一档碰运气。每只的概率合计都是 100%（50+30+15+4+1）。</div>

        <h2 class="h2">矿石与蘑菇：两组共用同一张概率表</h2>
        <p class="p">这两组的产物不同，<b>概率结构一模一样</b>：头两样 34%／33%，中间五种宝石各 6%，钻石垫底 3%。</p>
        ${tbl(['魔物', '34%', '33%', '六种宝石', '3%'], [orow(oreKey), orow(mushKey)], { leftFirst: true, cls: 'prod' })}
        <div class="note">矿石组与蘑菇组都是 34+33+6×5+3 = 100%。源表把红宝石、绿宝石、蓝宝石、紫水晶、海蓝宝石各列一行，本页压成一格，浓度相同。</div>

        <h2 class="h2">四样没有概率的产出</h2>
        <p class="p">毛、蜜、奶、蛋在源表里概率栏写的是「-」——<b>不是漏填，是这四样不摇号</b>，养了每天就有。</p>
        ${tbl(['产物', '魔物'], fixed.map(k => [grp[k][0][0], k]), { leftFirst: true, cls: 'prod' })}

        <h2 class="h2">劳力：好感决定它能干多大一片地</h2>
        <p class="p">工作范围跟好感走，<b>好感 8 是 1 时的四倍多</b>（85 格 → 405 格）。干完的时间固定，所以范围越大，等于同样一天里替你省下越多跑腿。</p>
        ${tbl(['工作', '好感度', '范围', '完成时间'], JB.map(r => [r[0], r[1] === '-' ? '—' : r[1], r[2], r[3]]), { leftFirst: true, cls: 'prod' })}
        <div class="note">收获与浇水四档数值完全相同，只有完成时间差 4 小时。割草源表只列了<b>好感 1 一档</b>（300 格），山菜收集／伐木／砸石头三行的好感与范围都写「-」，源页没给数值——这里照录，不推算。</div>

        <h2 class="h2">宠物生蛋：喂什么符文石，下一代就偏什么</h2>
        <p class="p">好感 1 起，给宠物吃<b>符文石</b>就会生蛋，<b>10 天后自动出生</b>，不用孵化。蛋孵出来的下一代按父母提升好感，吃哪种石头就多一项能力。</p>
        ${tbl(['符文石', '能力提升'], EG.map(r => [r[0], r[1]]), { leftFirst: true, cls: 'prod' })}
        <div class="note">四种石头都只加 15%，没有「全能力」的选项——想让孩子全面，只能分别配。抓它之前要准备的东西（毛刷、魔物小屋、等级差 &lt; 10）与场地属性喜好，分别在<a class="link" href="#/page/beast">魔物与伙伴</a>和<a class="link" href="#/page/gift">魔物喜好</a>两页。</div>
        <div class="note">RF5 也有「同伴怪物生产道具一览」，但源页只有七行散句（「位于森林地带的白色黄毛牛才生产牛奶」「森林的粉色青蛙出液体类」……）加一句「待补充」，没有表也没有概率，本站不据此编表。</div>`;
}

    /* ------------------------------------------------------------
       旧四作（RF1／RF2／RFF／RFO）：这一作到底怎么把魔物带回家
       这四作在源站都没有 RF3 以后那种「投喂喜好物」表——
         RF1／RF2  收服＝友好手套抚摸固定次数，毛刷只涨好感
         RFF       收服＝毛刷刷固定次数，另有「场地属性喜好」（去喜欢的场地好感涨）
         RFO       旧四作里唯一有「喜好作物」的一份（《最强攻略》怪日表）
       数据：PET_RF2（RF2pet）、PET_RFF／RFF_SITE（RFFpet）
             RF1_MON 第 17 列「手套」、MON_RFO 第 4 列「喜好作物」（站内原有）
       ------------------------------------------------------------ */
function giftOldHtml(g) {
    const id = g.id;
    const nm = { rf1: 'RF1', rf2: 'RF2', rff: '边境', rfo: '海洋' }[id] || '';
    const dash = '<span class="mon-no">—</span>';
    const cell = v => (v == null || v === '' || v === '—' || v === '无') ? dash : v;

    /* 通用的「次数分布」：把数字列做成 次数 → 只数 */
    const dist = (arr, idx) => {
        const m = {};
        arr.forEach(x => { const v = x[idx]; if (typeof v === 'number') m[v] = (m[v] || 0) + 1; });
        const ks = Object.keys(m).map(Number).sort((a, b) => a - b);
        const top = ks.slice().sort((a, b) => m[b] - m[a] || a - b)[0];
        const total = ks.reduce((s, k) => s + m[k], 0);
        return { m, ks, top, total, min: ks[0], max: ks[ks.length - 1] };
    };

    /* ================= RF1 ================= */
    if (id === 'rf1') {
        const R1 = (typeof RF1_MON !== 'undefined') ? RF1_MON : [];
        const D = dist(R1, 16);
        return `
    <h2 class="h2">初代没有「喜好道具」，只有「摸几下」</h2>
    <p class="p">「魔物喜好」这个说法是后来才有的。初代的怪物表里<b>根本没有喜好这一栏</b>——它只有两样东西：掉落物，和<b>雇佣能力</b>（协助收获、浇水、产毛、产蛋、可骑乘）。你要把一只魔物带回家，靠的是<b>友好手套</b>：对着它反复<b>抚摸</b>，摸够这一只规定的手套次数，它才跟你走。所以在这作，问题不是「它喜欢吃什么」，而是「<b>我要摸它几下</b>」。</p>
    ${stat([['收录', R1.length + ' 只'], ['手套次数区间', D.min + ' ～ ' + D.max + ' 次'], ['最费手', '摸 ' + D.max + ' 次（' + D.m[D.max] + ' 只）'], ['最常见', '摸 ' + D.top + ' 次（' + D.m[D.top] + ' 只）']])}
    <p class="p">把 ${D.total} 只有次数的魔物按「要摸几下」分组：</p>
    ${tbl(['手套次数', '多少只', '说明'], D.ks.map(k => [
            '<b>' + k + ' 次</b>',
            D.m[k] + ' 只',
            k === D.min ? '最少，几下就成' : (k === D.max ? '最磨人，得备足耐心与时间' : (k === D.top ? '这一档只数最多' : ''))
        ]), { leftFirst: true, cls: 'txt', colw: ['6rem', '6rem', 'auto'] })}
    <div class="key">次数越多的通常越强——高等级魔物不会三两下就跟走。<b>但「摸」本身不看等级差</b>，你可以带着手套去摸一只远超自己等级的怪，只要它不先把你打死。这是初代和后续作品最不一样的地方：后来几作用等级差卡你能不能抓，初代只卡你摸的次数。</div>
    <p class="p"><b>毛刷在初代不管收服</b>，只管好感：每刷一次好感 +1 心，好感满 10 心封顶。源页还记了一个偏门练法——<b>对着空气刷毛</b>把「宠物交流」技能刷到 Lv20（原文把这件事和「在医院买解毒药恢复 HP」写在同一句里，本站照录，不替它解释因果关系）。</p>

    <h2 class="h2">这几样工具去哪拿</h2>
    <p class="p">四样宠物工具<b>都要先建好魔物小屋</b>，之后分别找不同的人要——不是买，是对话就给。注意「毛刷」与「友好手套」在两处：毛刷涨好感，手套才是收服用的。</p>
    ${tbl(['道具', '干什么用', '找谁拿'], [
            ['友好手套', '抚摸魔物、收服', '薇薇亚修豪宅 · 塔芭莎'],
            ['毛刷', '刷毛涨好感（+1 心／次）', '诺伊曼农场 · 菲尔'],
            ['挤奶器', '挤奶', '薇薇亚修豪宅 · 查克里努斯'],
            ['剪毛刀', '剪毛', '卡缪农场 · 卡缪'],
            ['筐', '捡蛋', '诺伊曼农场 · 诺伊曼'],
        ], { leftFirst: true, colw: ['6rem', 'auto', 'auto'] })}
    <div class="note">道具领取条件与对话对象取自 biligame 符文工厂 wiki「RF1pet」页，五个条目逐一照录，未补别处听来的说法。产奶、产毛、下蛋要靠对应工具才收得到，光把魔物养在屋里不会自动进袋子。</div>

    <div class="note">逐只的手套次数、特殊能力与出现场所，站内「魔物图鉴」的 RF1 段已经整张列过（<code>RF1_MON</code> 第 17 列，取自 biligame「符文工厂1魔物数据表」），本页不重复抄一遍，只回答「这一作到底怎么收」这个问题。次数统计：${D.ks.map(k => k + ' 次 ' + D.m[k] + ' 只').join('、')}，合计 ${D.total} 只。</div>`;
    }

    /* ================= RF2 ================= */
    if (id === 'rf2') {
        const P = (typeof PET_RF2 !== 'undefined') ? PET_RF2 : [];
        if (!P.length) return '';
        const D = dist(P, 2);
        const jobs = {};
        P.forEach(x => { jobs[x[1]] = (jobs[x[1]] || 0) + 1; });
        const jobList = Object.entries(jobs).sort((a, b) => b[1] - a[1]);
        const wk = {};
        P.forEach(x => { wk[x[5]] = (wk[x[5]] || 0) + 1; });
        const dup = P.filter((x, i) => P.findIndex(y => y[0] === x[0]) !== i).map(x => x[0]);
        return `
    <h2 class="h2">RF2 也是「摸」，不是「喂」</h2>
    <p class="p">RF2 收服魔物的流程是：先建<b>魔物小屋</b>、保证屋里有<b>饲料</b>（自己种牧草或在杂货店买），然后拿<b>友好手套</b>对着魔物摸——<b>摸到这一只规定的次数</b>，它才肯住进去。也就是说：<b>饲料只是小屋的前提条件，「喂它什么」不决定收服</b>，决定收服的是抚摸次数。所以这张表和 RF3 以后那几张不是同一个东西：那边列的是<b>喜好物品</b>，这边列的是<b>抚摸次数</b>。</p>
    ${stat([['收录', P.length + ' 条'], ['手套次数区间', D.min + ' ～ ' + D.max + ' 次'], ['最常见', D.top + ' 次（' + D.m[D.top] + ' 只）'], ['工作种类', jobList.length + ' 种']])}
    <p class="p">次数分布：${D.ks.map(k => k + ' 次 ' + D.m[k] + ' 只').join('、')}。最少的是 <b>${D.min} 次</b>，最多的是 <b>${D.max} 次</b>（${D.m[D.max]} 只：${P.filter(x => x[2] === D.max).map(x => x[0]).join('、')}）。和初代一样，次数多少基本跟着强度走——摸 ${D.max} 下的就是这一作最难收的那${P.filter(x => x[2] === D.max).length > 1 ? '几' : ''}只。</p>

    <h2 class="h2">按工作分：先抓谁最能省事</h2>
    <p class="p">收服之后它替你干的活写在第二列。${jobList.map(j => '<b>' + j[0] + '</b> ' + j[1] + ' 只').join('、')}——工作定死了，同一只魔物不会两样都会，所以<b>要凑齐全套农活就得抓不同种的</b>。</p>
    ${tbl(['工作', '只数'], jobList.map(j => [j[0], j[1] + ' 只']), { leftFirst: true, cls: 'txt', colw: ['7rem', '5rem'] })}
    <div class="key">探索类型同理：<b>地上／空中／水中</b>决定它能陪你进哪种地形。<b>水中</b>那几只（天空鱼、希拉鱼、陆龟）是这作少见的「能下水」的伙伴，别只按工作挑。</div>

    <h2 class="h2">${P.length} 条：摸几下、在哪摸、会什么特技</h2>
    <p class="p">「第一部／第二部」是剧情分段：第二部（七年后）地图与出没点会变，同一种魔物可能换地方。<b>写「—」的是原表填「无」</b>——那一部真的没有，不是漏填。特技是它做敌人时打你的招式，收服后同一套动作就是它的战斗方式。</p>
    ${ftableOwn(['魔物', '工作', '手套', '第一部地点', '第二部地点', '探索', '特技'],
            ['6rem', '3.4rem', '2.6rem', '8rem', '8rem', '2.6rem', '4.4rem'],
            P.map(r => [r[0] + ' ' + r[1] + ' ' + r[3] + ' ' + r[4] + ' ' + r[6],
                [r[0], r[1], '<b>' + r[2] + '</b>', cell(r[3]), cell(r[4]), cell(r[5]), cell(r[6])]]),
            { cls: 'pet12', ph: '输入魔物名／工作／地点／特技' })}
    <div class="note">取自 biligame 符文工厂 wiki「RF2pet」页（CC BY-SA），由 <code>_build_pet_old.py</code> 解析生成 <code>js/pet_old.js</code>。原表共 ${P.length} 行${dup.length ? '，其中 <b>' + dup.join('、') + '</b> 出现两次——两次的第二部地点不同（一座神殿的两个季节间），源表就是这么列的两行，本站照录不合并' : ''}。地名里混着未译的日文（パレルモ神殿 穏やかな春、氷山の地下神殿 三層……），源表只给日文名，<b>本站不替它编中文</b>；「白天／夜晚」也是源表直接写在地名后面的，本页只在两者之间加了个空格。</div>`;
    }

    /* ================= RFF 边境 ================= */
    if (id === 'rff') {
        const P = (typeof PET_RFF !== 'undefined') ? PET_RFF : [];
        const S = (typeof RFF_SITE !== 'undefined') ? RFF_SITE : [];
        if (!P.length) return '';
        const D = dist(P, 4);
        const ride = P.filter(x => x[6] === '可以');
        const jobs = {};
        P.forEach(x => { jobs[x[1]] = (jobs[x[1]] || 0) + 1; });
        const jobList = Object.entries(jobs).sort((a, b) => b[1] - a[1]);
        const attr = {};
        P.forEach(x => { if (x[5]) attr[x[5]] = (attr[x[5]] || 0) + 1; });
        return `
    <h2 class="h2">边境不收「礼物」，收「刷毛」</h2>
    <p class="p">边境没有「投喂某样东西驯服」这套。流程是：先建<b>魔物小屋</b>（木匠处 1000G ＋ 10 根木材），拿起<b>毛刷</b>对着魔物刷——<b>刷够这一只规定的次数</b>，它才跟你回家。等级也卡：<b>要抓的魔物等级必须低于玩家等级 + 10</b>；抚摸时出现 <b>Miss</b> 就是等级过高，先练级再来。</p>
    ${stat([['收录', P.length + ' 只'], ['刷毛次数区间', D.min + ' ～ ' + D.max + ' 次'], ['最常见', D.top + ' 次（' + D.m[D.top] + ' 只）'], ['可骑乘', ride.length + ' 只']])}
    <p class="p">次数分布：${D.ks.map(k => k + ' 次 ' + D.m[k] + ' 只').join('、')}。<b>刷毛次数就是这只怪的收服难度</b>，和「它喜欢吃什么」无关——这作根本没有那一栏。</p>

    <h2 class="h2">真正算「喜好」的，是场地</h2>
    <p class="p">边境把「喜好」做成了<b>地点 × 属性</b>：每片地都偏向某一种属性，把对应属性的魔物带过去，好感涨得快。源页把这行的效果写成「去喜欢的场地：随动」（原文如此，本页照录，不替它换算具体数值）。</p>
    ${tbl(['地点', '无属性', '火', '水', '风', '地'], S.map(r => [
            r[0],
            r[1] === '大' ? '<b>大</b>' : (r[1] || dash),
            r[2] === '大' ? '<b>大</b>' : (r[2] || dash),
            r[3] === '大' ? '<b>大</b>' : (r[3] || dash),
            r[4] === '大' ? '<b>大</b>' : (r[4] || dash),
            r[5] === '大' ? '<b>大</b>' : (r[5] || dash)
        ]), { leftFirst: true, colw: ['8rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem'] })}
    <div class="key">表里带<b>加粗的「大」</b>就是该地偏好的那一项：${S.length} 片地里有 ${S.filter(r => r.slice(1).some(v => v === '大')).length} 片各标了一项「大」，<b>大家的广场是唯一标在「无属性」上的</b>——不挑属性的魔物带到那儿最稳。其余有记录的格子一律是「小」，<b>原表的「-」本页显示为「—」，表示这一格没有记录，不是「不涨」</b>。</div>

    <h2 class="h2">${P.length} 只可收服：刷几次、什么属性、能不能骑</h2>
    <p class="p">按源表的工作分组排列。工作写了它收服后替你干什么，等级是野外出没时的等级（抓之前先对照自己的等级 + 10）。</p>
    ${tbl(['工作', '只数'], jobList.map(j => [j[0], j[1] + ' 只']), { leftFirst: true, cls: 'txt', colw: ['7rem', '5rem'] })}
    ${ftableOwn(['魔物', '工作', '等级', '刷毛', '属性', '骑乘', '出现地点'],
            ['6.4rem', '3.6rem', '2.4rem', '2.4rem', '2.4rem', '2.6rem', 'auto'],
            P.map(r => [r[0] + ' ' + r[1] + ' ' + r[2] + ' ' + (r[5] || '') + ' ' + r[7],
                [r[0] + (r[7] ? '<span class="mon-desc">' + r[7] + '</span>' : ''), r[1],
                    cell(r[3]), '<b>' + r[4] + '</b>', cell(r[5]),
                    r[6] === '可以' ? '可以' : dash, cell(r[2])]]),
            { cls: 'pet12', ph: '输入魔物名／工作／属性／地点' })}
    <p class="p">属性分布：${Object.entries(attr).sort((a, b) => b[1] - a[1]).map(a => a[0] + ' ' + a[1] + ' 只').join('、')}，其余无属性。可骑乘的 ${ride.length} 只是：${ride.map(x => x[0]).join('、')}——<b>骑乘只影响跑图，不加快移动以外的任何东西</b>。</p>
    <div class="note">取自 biligame 符文工厂 wiki「RFFpet」页（CC BY-SA），由 <code>_build_pet_old.py</code> 解析生成 <code>js/pet_old.js</code>。「能否骑乘」源表只写「可以」或「-」，本页照录为「可以／—」。同一页另有<b>宠物生产</b>（产物与概率）与<b>好感度对应的工作范围</b>（好感 1 时 85 格，8 时 405 格），那两块不属于「喜好」，本页不重复。<b>一处不一致照实说明</b>：源页另单独点出「雪草遗迹地下 6 层被冰封的红色微小龙，等级 88，需要刷毛 27 次捕捉」，与表内 4～8 次的量级差很远，源页没有解释这两处「刷毛次数」是不是同一回事，本站不替它换算，也不把它塞进表里。</div>`;
    }

    /* ================= RFO 海洋 ================= */
    if (id === 'rfo') {
        const M = (typeof MON_RFO !== 'undefined') ? MON_RFO : [];
        if (!M.length) return '';
        const fav = M.filter(x => (x[3] || []).length);
        const none = M.filter(x => !(x[3] || []).length);
        const f = {};
        M.forEach(x => (x[3] || []).forEach(c => { (f[c] = f[c] || []).push(x[0]); }));
        const rank = Object.entries(f).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
        const many = rank.filter(r => r[1].length >= 3);
        const one = rank.filter(r => r[1].length === 1).length;
        const ore = ['铜', '银', '金', '铁'];
        const oreHit = rank.filter(r => ore.indexOf(r[0]) >= 0);
        return `
    <h2 class="h2">旧四作里，只有海洋给了「喜好作物」</h2>
    <p class="p">RF1、RF2、边境三作的表里都没有「喜好物品」这一栏，海洋是个例外：它的怪日表带一列<b>喜好作物</b>——把这一样东西递过去，好感涨得比别的快。这也是旧四作里唯一能与 RF3 以后那几张「喜好表」对齐的一份数据。</p>
    ${stat([['收录魔物', M.length + ' 只'], ['有喜好记录', fav.length + ' 只'], ['无记录', none.length + ' 只'], ['不同「喜好」条目', rank.length + ' 种']])}
    <p class="p">反查比正查有用：下面按「<b>递这样东西能讨好多少只</b>」排。带三只以上的全列，只对上一只的长尾合并到最后一行（共 ${one} 种）。</p>
    ${tbl(['递这样东西', '几只买账', '分别是'], many.map(r => [
            '<b>' + r[0] + '</b>', r[1].length + ' 只', r[1].join('、')
        ]).concat(one ? [['其余 ' + one + ' 种', '各 1 只', rank.filter(r => r[1].length === 1).map(r => r[0]).join('、')]] : []),
            { leftFirst: true, cls: 'txt', colw: ['8rem', '5rem', 'auto'] })}
    <div class="key">排第一的是<b>菠菜</b>（${(f['菠菜'] || []).length} 只），前几名几乎全是<b>四季都能种的常见作物</b>——洋葱、茄子、菠萝、玉米、南瓜、黄瓜。也就是说：<b>前期背包里塞一把菠菜，就是这作最好用的万能饵</b>，比去刷稀有作物划算。</div>
    <p class="p">另有一条要留意：这一列里混进了 <b>${oreHit.map(r => r[0]).join('、')}</b> 这类矿石（各 ${oreHit.map(r => r[1].length).join('／')} 只）——它们不是作物，但源表就写在「喜好作物」这一列里。本页<b>照录不改</b>，不替它把矿石挪到别处，因为挪了就不再是原表。</p>
    <div class="note">取自站内原有的 <code>MON_RFO</code>（《符文工厂海洋（最强攻略）》怪日表，日文名与地名已按系列通用译名转为中文）。这份数据一直挂在<a class="link" href="#/page/mbook">魔物图鉴</a>的海洋段里，是<b>按魔物看</b>；本页只是把它横过来<b>按物品反查</b>，没有新增任何推断值。${none.length} 只没有喜好记录（${none.map(x => x[0]).join('、')}），原表那一格是空的，本页不给它们补一个。毛刷次数与产出作物另见「魔物图鉴」海洋段的自然育成表。</div>`;
    }

    return `<p class="p">${nm} 这一作的收服资料还没有整理。</p>`;
}

    /* ------------------------------------------------------------
       RF3 魔物喜好（gift 页的 RF3 段）
       数据 GIFT_RF3 = [名, 捕捉率, 喜好1, 喜好2, ...]
       源：biligame 符文工厂 wiki「RF3monster」页「总喜好物品」列
       ------------------------------------------------------------ */
    function giftRf3Html() {
        const G3 = (typeof GIFT_RF3 !== 'undefined') ? GIFT_RF3 : [];
        if (!G3.length) return '';
        /* 喜好道具的通用度：多少只魔物吃这一样，决定「背包里该常备什么」 */
        const freq = (rows, from) => {
            const m = {};
            rows.forEach(r => r.slice(from).forEach(x => { if (x) m[x] = (m[x] || 0) + 1; }));
            return Object.entries(m).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        };
        const have = G3.filter(r => r.length > 2);
        const none = G3.filter(r => r.length <= 2);
        const f3 = freq(G3, 2);
        const cf3 = k => { const x = f3.find(y => y[0] === k); return x ? x[1] : 0; };
        const rates = G3.map(r => r[1]).filter(v => typeof v === 'number');
        const lo = rates.length ? Math.min.apply(null, rates) : null;
        const hi = rates.length ? Math.max.apply(null, rates) : null;
        const top = have.filter(r => (typeof r[1] === 'number') && r[1] === hi);

        return `
            <h2 class="h2">喂对东西，它才肯跟你回家</h2>
            <p class="p">RF3 收服魔物靠的是<b>刷子刷好感 + 投喂偏爱道具</b>。biligame 的怪物页给每只都列了「总喜好物品」——这些就是投喂时爱心涨得最快的那几样。表里也给的是<b>初始捕捉率</b>，是不刷毛、不喂任何东西时的基准；实际投喂与等级差会显著抬高，本页只给基准，不推算最终概率。</p>
            ${stat([['收录', G3.length + ' 只'], ['有喜好记录', have.length + ' 只'], ['无记录', none.length + ' 只']])}
            <p class="p">${none.length} 只没有喜好记录（多为 Boss 与不可收服个体，biligame 原表「总喜好物品」栏为「-」），它们<b>本来就不给驯服</b>，表里那两列是空的，不是漏填。</p>

            <h2 class="h2">先看哪几样最通用</h2>
            <p class="p">把 ${have.length} 只有记录的魔物喜欢的道具按出现次数排一遍：</p>
            ${tbl(['高频喜好道具', '多少只吃'], f3.slice(0, 10).map(([k, n]) => [k, n + ' 只']), { leftFirst: true, cls: 'txt', colw: ['11rem', '6rem'] })}
            <div class="key">出现最多的是<b>${f3[0][0]}</b>，有 ${cf3(f3[0][0])} 只吃；前几名多为「自身掉落物」——刷对应魔物时顺手拾取，抓同种时直接用掉落物投喂，一两份就能收服。biligame 没有单列「杂草」这种全游戏通用物，但它仍是前期最省事的万能钥匙。</div>

            <h2 class="h2">捕捉率：基准区间 ${lo}% ～ ${hi}%</h2>
            <p class="p">到顶的 ${hi}% 只有 ${top.length} 只，最末一档 ${lo}% 是 ${G3.filter(r => (typeof r[1] === 'number') && r[1] === lo).length} 只。捕捉率只是起始难度，<b>玩家等级高于魔物时门槛会降，低于则要多投好几份</b>——高等级强怪先去迷宫刷几级再回头抓更稳。</p>

            <h2 class="h2">全部 ${G3.length} 只魔物</h2>
            <p class="p">按名字或喜好道具搜索。没有记录的也留在表里，方便你确认「这只确实不给驯服」，别在它身上浪费素材。</p>
            ${ftableOwn(['魔物', '捕捉率', '喜好道具'], ['7.4rem', '4.4rem'], G3.map(r => [
                r[0] + (r.length > 2 ? '' : ' 无记录') + ' ' + r.slice(2).filter(Boolean).join(' '),
                [
                    r[0] + (r.length > 2 ? '' : ' <span class="txc">无记录</span>'),
                    (typeof r[1] === 'number' ? '<b>' + r[1] + '%</b>' : '<span class="mon-no">—</span>'),
                    r.slice(2).filter(Boolean).join('、') || '<span class="mon-no">—</span>',
                ],
            ]), { ph: '输入魔物名或喜好道具' })}
            <div class="note">取自 biligame 符文工厂 wiki「RF3monster」页的「总喜好物品」列（${G3.length} 行），由 <code>_build_gift_rf3.py</code> 生成。原表「捕捉率」为整数百分比基准；「总喜好物品」按「、」拆分为可变长列表，原表为「-」或无记录者显示「—」。<b>命名沿用 biligame 中文名</b>；站内魔物图鉴（MON_RF3）取自《符文工房3全攻略》另一套译名，个别魔物名会有出入（如 biligame「摩可摩可」对应图鉴「莫可莫可」），本页以 biligame 译名为准。</div>`;
    }

    /* ------------------------------------------------------------
       RF3 钓点与季节（fishspot 页的 RF3 段）
       数据 SPOT_RF3：biligame「RF3fishing」页（钓点×鱼 目录，无出现率）
       结构：spots(固定钓点) / seasonal(季节轮换钓点) / everywhere(全地点) / none(无鱼) / resort(度假村)
       ------------------------------------------------------------ */
    function fishspotRf3Html() {
        const D = (typeof SPOT_RF3 !== 'undefined') ? SPOT_RF3 : null;
        if (!D) return '';
        const money = v => (v === null || v === undefined) ? '<span class="mon-no">—</span>' : v + 'G';
        const shadow = s => (s === '-' || !s) ? '—' : s;

        /* 目录行：[搜索串, [钓点, 鱼, 鱼影, 买价, 卖价]] */
        const rows = [];
        D.spots.forEach(([spot, fish]) => {
            fish.forEach(f => rows.push([spot + ' ' + f[0], [spot, f[0], shadow(f[1]), money(f[2]), money(f[3])]]));
        });
        D.seasonal.forEach(s => {
            if (s.flag) rows.push([s.name, [s.name, '当前季节的所有鱼（随季轮换）', '—', '—', '—']]);
            s.fish.forEach(f => rows.push([s.name + ' ' + f[0], [s.name, f[0] + ' <span class="txc">固定稀有</span>', shadow(f[1]), money(f[2]), money(f[3])]]));
        });
        D.everywhere.forEach(f => rows.push(['所有地点 ' + f[0], ['全地点通用', f[0], shadow(f[1]), money(f[2]), money(f[3])]]));
        D.none.forEach(spot => rows.push([spot, [spot, '没有鱼', '—', '—', '—']]));

        const allFish = new Set();
        D.spots.forEach(([_, f]) => f.forEach(x => allFish.add(x[0])));
        D.seasonal.forEach(s => s.fish.forEach(x => allFish.add(x[0])));
        D.everywhere.forEach(x => allFish.add(x[0]));
        const spotCount = D.spots.length + D.seasonal.length + D.none.length;

        const topSell = (() => {
            const arr = [];
            D.spots.forEach(([_, f]) => f.forEach(x => arr.push([x[0], x[3]])));
            D.seasonal.forEach(s => s.fish.forEach(x => arr.push([x[0], x[3]])));
            arr.sort((a, b) => (b[1] || 0) - (a[1] || 0));
            return arr.slice(0, 5);
        })();
        const bySpot = D.spots.map(([n, f]) => [n, f.length]).sort((a, b) => b[1] - a[1]);

        return `
            <h2 class="h2">RF3 的钓鱼没有「出现率」，只有一张钓点目录</h2>
            <p class="p">和 RF4／RF5 那种「钓点 × 季节 × 概率」的解包表不同，三代的钓鱼数据是一张<b>钓点 × 鱼</b>的目录：每个钓点列了能钓上来的鱼、鱼影大小、买价与 Lv1 卖价，但<b>没有逐钓点的出现概率</b>。所以这一页是「<b>在哪能钓到什么</b>」的索引，不是「钓多少次能出」的概率表——原表没给的，本站不替它编。</p>
            ${stat([['钓点', spotCount + ' 处'], ['去重鱼种', allFish.size + ' 种'], ['全地点通用钓物', D.everywhere.length + ' 种'], ['卡尔洛斯度假村', D.resort.fish.length + ' 种']])}
            <p class="p">三代的钓点分三种：<b>固定钓点</b>的鱼名单常年不变；<b>石池小道、阿克娜湖</b>两处写的是「<b>当前季节的所有鱼</b>」——随季节轮换，源表不列明细；<b>龙玄洞</b>则没有鱼。另有<b>乌贼、心动鲷鱼、空罐、高筒靴、罕见的空罐</b>五种出现在<b>所有地点</b>，是全图通用的杂项（前两种是真鱼，后三种是垃圾钓物）。</p>

            <h2 class="h2">最值钱的几样</h2>
            <p class="p">按 Lv1 卖价排，最贵的几乎都出自<b>茵瓦艾尔河</b>与<b>索尔·提拉诺沙漠</b>两条大河：</p>
            ${tbl(['最贵鱼（Lv1卖价）', '卖价'], topSell.map(([n, v]) => [n, '<b>' + v + 'G</b>']), { leftFirst: true, colw: ['11rem', '6rem'] })}
            <div class="key">${topSell[0][0]} 卖价最高，且是<b>大河独占</b>——在森林或沙漠的小池塘里钓一辈子也出不来。反过来，想凑齐图鉴里的便宜小鱼（石川鲑鱼、西太公鱼这类），得去对应的小钓点。</div>

            <h2 class="h2">哪个钓点的鱼最多</h2>
            <p class="p">把固定钓点的鱼数排一遍，<b>${bySpot[0][0]}</b> 一家就占了 ${bySpot[0][1]} 种：</p>
            ${tbl(['固定钓点', '鱼种数'], bySpot.map(r => [r[0], r[1] + ' 种']), { leftFirst: true, colw: ['9rem', '5rem'] })}

            <h2 class="h2">全部钓点 × 鱼 目录</h2>
            <p class="p">按钓点或鱼名搜索。固定钓点列出全部鱼；季节钓点标「当前季节的所有鱼」，若另有固定稀有（如阿克娜湖的<b>百鱼王的鳞片</b>）则额外列出；龙玄洞标「没有鱼」。</p>
            ${ftableOwn(['钓点', '鱼', '鱼影', '买价', 'Lv1卖价'], ['7.6rem', 'auto', '4.2rem', '4.6rem', '4.6rem'], rows, { ph: '输入钓点或鱼名' })}

            <h2 class="h2">卡尔洛斯度假村：好感门槛比入场费更难</h2>
            <p class="p">这是一处<b>付费钓点</b>，单次入场费 ${money(D.resort.entry)}。里面的鱼和外面重复，但能不能钓要看<b>伊奥与卡尔洛斯的好感度总和</b>——门槛从 4 到 15 不等，最高的金枪鱼要好感总和 15 以上。</p>
            ${tbl(['鱼', '入场费', 'Lv1卖价', '好感门槛'], D.resort.fish.map(f => [f[0], money(f[1]), money(f[2]), f[3]]), { leftFirst: true, colw: ['7rem', '5rem', '5rem', 'auto'] })}

            <div class="note">取自 biligame 符文工厂 wiki「RF3fishing」页（${rows.length} 条目录记录，由 <code>_build_fishspot_rf3.py</code> 生成）。原表<b>没有逐钓点出现率</b>，本页只做「在哪能钓到什么」的索引，不推算概率。两处季节钓点（石池小道、阿克娜湖）原表写「当前季节的所有鱼」，随季节轮换的具体名单源表未列，本页照录不展开。「全地点通用」五项（乌贼／心动鲷鱼／空罐／高筒靴／罕见的空罐）在所有钓点都能钓到，已并入目录的「全地点通用」钓点。<b>命名沿用 biligame 中文名</b>。</div>`;
    }

    /* ------------------------------------------------------------
       钓点与季节：RF1 / RF2 / 边境（RFF）—— biligame 钓点×鱼 目录，无出现率
       数据 SPOT_RF1 / SPOT_RF2 / SPOT_RFF：由 _build_fishspot_legacy.py 生成。
       三作列不同（见各自 head），统一用一张可搜索目录表渲染；RFF 另带价格。
       ------------------------------------------------------------ */
    function fishspotRf12fHtml(g) {
        const MAP = {
            rf1: (typeof SPOT_RF1 !== 'undefined') ? SPOT_RF1 : null,
            rf2: (typeof SPOT_RF2 !== 'undefined') ? SPOT_RF2 : null,
            rff: (typeof SPOT_RFF !== 'undefined') ? SPOT_RFF : null
        };
        const D = MAP[g.id];
        if (!D) return '';
        const rows = D.rows.map(r => [r.join(' '), r]);

        const intro = `
            <h2 class="h2">${D.title} 的钓鱼没有「出现率」，只有一张钓点目录</h2>
            <p class="p">和 RF4／RF5 那种「钓点 × 季节 × 概率」的解包表不同，<b>${D.title}</b> 的钓鱼数据是一张<b>「钓点(地图) × 鱼」</b>的目录：每个钓点列了能钓上来的鱼${D.prices ? '、鱼等级与三档卖价' : ''}，但<b>没有逐钓点的出现概率</b>。所以这一页是「<b>在哪能钓到什么</b>」的索引，不是「钓多少次能出」的概率表——原表没给的，本站不替它编。</p>
            ${stat([['钓点(地图)', D.maps.length + ' 处'], ['去重鱼种', D.fishes.length + ' 种'], ['目录条目', D.rows.length + ' 条']])}
            <p class="p">${g.name} 的钓点（地图）共 <b>${D.maps.length}</b> 处，去重鱼与钓物 <b>${D.fishes.length}</b> 种。下面按钓点或鱼名搜索全部目录。</p>`;

        let priceTbl = '';
        if (D.prices && D.topSell && D.topSell.length) {
            priceTbl = `
            <h2 class="h2">最值钱的几样（Lv1 卖价）</h2>
            <p class="p">边境的钓点自带卖价，按 Lv1 卖价排，最贵的几乎都出自<b>自家门口两桥</b>与<b>赛尔提亚湖</b>：</p>
            ${tbl(['鱼（Lv1卖价）', '卖价'], D.topSell.map(([n, v]) => [n, '<b>' + v + 'G</b>']), { leftFirst: true, colw: ['11rem', '6rem'] })}
            <div class="key">${D.topSell[0][0]} 卖价最高（${D.topSell[0][1]}G），且<b>城镇门口两桥独占</b>——在偏远分区钓一辈子也出不来。最低价鱼多是不值钱的杂鱼与垃圾钓物。</div>`;
        }

        const wikiName = g.id === 'rf1' ? 'RF1fishing' : (g.id === 'rf2' ? 'RF2fishing' : 'RFFfishing');
        const note = `<div class="note">取自 biligame 符文工厂 wiki「${wikiName}」页（${D.rows.length} 条目录记录，由 <code>_build_fishspot_legacy.py</code> 生成）。原表<b>没有逐钓点出现率</b>，本页只做「在哪能钓到什么」的索引，不推算概率。${D.prices ? '边境每张记录带鱼等级与三档卖价（Lv1／最低／最高）。' : ''}<b>命名沿用 biligame 中文名</b>；地图名已取链接显示名（如「1洞」＝卡麦特洞窟、「自家门口」＝自宅前）。</div>`;

        return `
            ${intro}
            ${priceTbl}
            <h2 class="h2">全部钓点 × 鱼 目录</h2>
            <p class="p">按钓点、地点、鱼名或等级搜索。${g.id === 'rf2' ? '同一地图分<b>蓝色／红色</b>两片水域，季节也随区域不同；' : ''}${g.id === 'rff' ? '季节栏「春、冬」＝该钓点夏秋不出，「春~冬」＝全年。' : ''}同一鱼在多处出现的，会各自成行。</p>
            ${ftableOwn(D.head, D.colw, rows, { ph: '输入钓点或鱼名' })}
            ${note}`;
    }

    /* ------------------------------------------------------------
       龙之天地（azuma）钓点与季节 —— gametoeasy 钓鱼攻略
       数据 SPOT_AZUMA：fishes[{n,buy,sell,spots,shops,unlock}]
       注意方向与 RF1/RF2/RF3/边境 相反：源表是「鱼 → 钓点」，
       这里现反查出「钓点 → 鱼」再渲染。同样没有出现率。
       ------------------------------------------------------------ */
    function fishspotAzumaHtml() {
        const D = (typeof SPOT_AZUMA !== 'undefined') ? SPOT_AZUMA : null;
        if (!D || !(D.fishes || []).length) return '';
        const F = D.fishes;
        const money = v => v ? v + 'G' : '<span class="mon-no">—</span>';

        /* 鱼 → 钓点 反查成 钓点 → 鱼 */
        const bySpot = {};
        F.forEach(f => f.spots.forEach(s => { (bySpot[s] = bySpot[s] || []).push(f.n); }));
        const allSpots = Object.keys(bySpot);
        const baseOf = s => s.replace(/（[^）]*）$/, '');
        const isCond = s => s !== baseOf(s);
        const condSpots = allSpots.filter(isCond).sort((a, b) => bySpot[b].length - bySpot[a].length);
        const plainSpots = allSpots.filter(s => !isCond(s)).sort((a, b) => bySpot[b].length - bySpot[a].length);

        /* 商店 */
        const byShop = {};
        F.forEach(f => f.shops.forEach(s => { (byShop[s] = byShop[s] || []).push(f.n); }));
        const shops = Object.keys(byShop).sort((a, b) => byShop[b].length - byShop[a].length);

        /* 最贵（并列全收） */
        const maxSell = Math.max.apply(null, F.map(f => +f.sell || 0));
        const top = F.filter(f => (+f.sell || 0) === maxSell);

        /* 买价恒为卖价的 2 倍？现算，别写死 */
        const doubleAll = F.length > 0 && F.every(f => +f.buy === (+f.sell || 0) * 2);

        /* 目录行：鱼名 / 钓点 / 商店 / 买价 / 卖价 */
        const rows = F.map(f => {
            const sp = f.spots.length ? f.spots.join('、') : '—';
            const sh = f.shops.length ? f.shops.join('、') : '—';
            return [f.n + ' ' + sp + ' ' + sh, [f.n, sp, sh, money(f.buy), money(f.sell)]];
        }).sort((a, b) => a[1][0].localeCompare(b[1][0], 'zh'));

        const topN = plainSpots[0];
        const condFish = new Set();
        condSpots.forEach(s => bySpot[s].forEach(n => condFish.add(n)));
        /* 只在条件钓点出现的鱼（常驻钓点钓不到） */
        const condOnly = F.filter(f => f.spots.length && f.spots.every(isCond)).map(f => f.n);
        /* 顶级鱼的大本营：按基础钓点（去掉雨天／夜晚后缀）归并，取覆盖 top 最多者 */
        const topAt = {};
        top.forEach(f => f.spots.forEach(s => { const b = baseOf(s); topAt[b] = (topAt[b] || 0) + 1; }));
        const topHome = Object.keys(topAt).sort((a, b) => topAt[b] - topAt[a])[0];
        const minSell = Math.min.apply(null, F.map(f => +f.sell || 0));
        const cheap = F.filter(f => (+f.sell || 0) === minSell).map(f => f.n);

        return `
            <h2 class="h2">龙之天地的钓鱼，源站按「鱼」列钓点，本站反着做成了两种索引</h2>
            <p class="p">和 RF4／RF5 那种「钓点 × 季节 × 概率」的解包矩阵不同，<b>龙之天地</b>的这份攻略是<b>按鱼种</b>写的：每种鱼后面列「在哪能钓到」「哪家店能买到」「买价／卖价」「解锁条件」，<b>没有出现率</b>。所以这一页还是「<b>在哪能钓到什么</b>」的索引——原表没给的，本站不替它编。</p>
            ${stat([['鱼与钓物', F.length + ' 种'], ['钓点写法', allSpots.length + ' 处'], ['其中需天气／时段', condSpots.length + ' 处'], ['商店在售', shops.length + ' 处']])}
            <p class="p">钓点按东国的地形散开：<b>夏之里</b>与<b>冬之里</b>两座村子、<b>春之台地／秋之草原／冬之原野</b>三片原野、以及<b>竹笋岛／垂钓岛／妖怪岛／朦胧岛／东三龟岛</b>等离岛，另有<b>雪狼岳</b>与<b>翠风洞</b>。其中 <b>${condSpots.length}</b> 处在钓点名后带条件——<b>${condSpots.filter(s => s.indexOf('雨') >= 0).length}</b> 处只有雨天、<b>${condSpots.filter(s => s.indexOf('夜晚') >= 0).length}</b> 处只有夜晚才出对应的鱼，条件钓点与同名常驻钓点的鱼名单<b>分开列</b>，不合并。「冬之原野」还细分成海边、池塘·河两片水域，鱼种完全不同。</p>

            <h2 class="h2">最值钱的鱼：${maxSell.toLocaleString()}G，${top.length} 种并列</h2>
            <p class="p">按卖价排，塔尖是<b>整 ${top.length} 种并列</b>${topAt[topHome] === top.length ? '，而且这 ' + top.length + ' 种<b>全都能在' + topHome + '</b>钓到（含其夜晚／雨天钓位）' : '，其中 ' + topAt[topHome] + ' 种在 ' + topHome}——离岛与海边的鱼价明显高于里山的淡水鱼：</p>
            ${tbl(['鱼', '卖价', '能钓到的钓点'], top.map(f => [f.n, '<b>' + money(f.sell) + '</b>', f.spots.join('、')]), { leftFirst: true, colw: ['8rem', '6rem', 'auto'] })}
            <div class="key">${top.map(f => f.n).join('、')} 是这一作的顶级鱼，卖价 ${maxSell.toLocaleString()}G 封顶；最便宜的 ${cheap.join('、')} 只值 ${minSell}G，一头一尾差 <b>${Math.round(maxSell / minSell)} 倍</b>——想赚钱就别在里山磨。${doubleAll ? '另外注意：源表里 <b>' + F.length + ' 种鱼的买价恰好都是卖价的 2 倍</b>，一家不漏——买来倒卖是纯亏一半的。' : ''}</div>

            <h2 class="h2">哪个钓点鱼最多</h2>
            <p class="p">只数不带天气／时段条件的常驻钓点，<b>${topN}</b> 以 ${bySpot[topN].length} 种居首，比第二名（${plainSpots[1]} ${bySpot[plainSpots[1]].length} 种）多 ${bySpot[topN].length - bySpot[plainSpots[1]].length} 种：</p>
            ${tbl(['钓点', '鱼种数', '能钓到的鱼'], plainSpots.map(s => [s, bySpot[s].length + ' 种', bySpot[s].join('、')]), { leftFirst: true, colw: ['8.4rem', '4.6rem', 'auto'] })}

            <h2 class="h2">雨天与夜晚：${condSpots.length} 处条件钓点</h2>
            <p class="p">源表把天气与时段直接写进钓点名，意思是这份名单<b>只有在那个条件下才成立</b>。其中 <b>${condOnly.length} 种</b>（${condOnly.join('、')}）<b>只在条件钓点出现</b>——常驻钓点怎么钓都出不来；剩下 ${condFish.size - condOnly.length} 种只是在这里多一个来源。</p>
            ${tbl(['条件钓点', '鱼种数', '能钓到的鱼'], condSpots.map(s => [s, bySpot[s].length + ' 种', bySpot[s].join('、')]), { leftFirst: true, colw: ['9.6rem', '4.6rem', 'auto'] })}
            <div class="key">源表把雨天写成「（雨）」和「（雨天）」两种写法（如<b>夏之里（雨）</b>与<b>夏之里（雨天）</b>），本站照录不改——两处指的是同一个村子在同一天气下的两个钓位，鱼名单并不相同，合并会丢信息。</div>

            <h2 class="h2">全部鱼 × 钓点 目录</h2>
            <p class="p">按鱼名、钓点或商店搜索。同一鱼在多处能钓到的，钓点列以「、」并列；「商店」列是可以<b>直接买</b>的地方，不是钓点。</p>
            ${ftableOwn(['鱼', '钓点', '商店', '买价', '卖价'], ['6.4rem', 'auto', 'auto', '4.4rem', '4.4rem'], rows, { ph: '输入鱼名、钓点或商店' })}

            <h2 class="h2">商店里能买到什么</h2>
            <p class="p">共 ${F.filter(f => f.shops.length).length} 种鱼能直接买，${shops.length} 处店铺，其中最全的是<b>${shops[0]}</b>（${byShop[shops[0]].length} 种）：</p>
            ${tbl(['店铺', '在售', '鱼'], shops.map(s => [s, byShop[s].length + ' 种', byShop[s].join('、')]), { leftFirst: true, colw: ['11rem', '4.6rem', 'auto'] })}
            <div class="note">取自 gametoeasy.com《符文工房:龙之天地》钓鱼攻略（post/1829，与本站 <code>azuma_gift.js</code>／<code>AZUMA_MON</code> 同源），由 <code>_build_fishspot_azuma.py</code> 解析生成 <code>js/fishspot_azuma.js</code>，收录 <b>${F.length} 种鱼与钓物、${allSpots.length} 处钓点（含条件写法）</b>。源表<b>没有逐钓点出现率</b>，本页只做「在哪能钓到什么」的索引，不推算概率。${F.filter(f => f.unlock).length ? '有解锁条件的 ' + F.filter(f => f.unlock).length + ' 种（' + F.filter(f => f.unlock).map(f => f.n).join('、') + '）原表写在「解锁条件」列，本页照录。' : ''}<b>命名沿用 gametoeasy 中文译名</b>，与站内七作的 biligame 译名不完全一致。</div>`;
    }

    /* ------------------------------------------------------------
       龙之天地（azuma）素材出处与掉落 —— gametoeasy 掉落表
       数据 DROP_AZUMA：rows [[魔物, 区域, [素材...]], ...]（无概率）
       要点：同一只魔物在不同区域各成一行，掉落品质随区域升档
       ------------------------------------------------------------ */
    function sourceAzumaHtml() {
        const D = (typeof DROP_AZUMA !== 'undefined') ? DROP_AZUMA : null;
        if (!D || !(D.rows || []).length) return '';
        const R = D.rows;

        /* 素材名的品质前缀；表里出现的就这几档，从低到高 */
        const TIERS = ['结实', '优质', '顶级', '极品', '神秘'];
        const tierOf = it => {
            for (let i = 0; i < TIERS.length; i++) if (it.indexOf(TIERS[i]) === 0) return TIERS[i];
            return '';
        };

        const mons = {}, areas = {};
        R.forEach(([n, a]) => { mons[n] = (mons[n] || 0) + 1; if (a) areas[a] = (areas[a] || 0) + 1; });
        const monList = Object.keys(mons);
        const areaList = Object.keys(areas);

        /* 区域 → 各档出现次数，取最多的那档当「主力档」 */
        const areaTier = {};
        R.forEach(([n, a, its]) => {
            if (!a) return;
            const m = areaTier[a] = areaTier[a] || {};
            its.forEach(it => { const t = tierOf(it); if (t) m[t] = (m[t] || 0) + 1; });
        });
        const mainTier = a => {
            const m = areaTier[a] || {};
            let best = '', bv = 0;
            TIERS.forEach(t => { const v = m[t] || 0; if (v > bv) { bv = v; best = t; } });
            return { tier: best, n: bv, total: Object.keys(m).reduce((s, t) => s + m[t], 0) };
        };
        const areaSorted = areaList.slice().sort((a, b) => {
            const ta = mainTier(a).tier, tb = mainTier(b).tier;
            const i = TIERS.indexOf(ta), j = TIERS.indexOf(tb);
            return (i - j) || (areas[b] - areas[a]);
        });

        /* 素材 → 出处（魔物·区域） */
        const byItem = {};
        R.forEach(([n, a, its]) => its.forEach(it => {
            (byItem[it] = byItem[it] || []).push(a ? n + '·' + a : n + '（未标注）');
        }));
        const itemList = Object.keys(byItem).sort((a, b) => byItem[a].length - byItem[b].length || a.localeCompare(b, 'zh'));
        const soloItems = itemList.filter(k => byItem[k].length === 1);

        /* 示例怪：覆盖档次种类最多、且至少出现在 3 个区域的那只 */
        const spread = n => {
            const s = {};
            R.forEach(([m, a, its]) => { if (m === n) its.forEach(it => { const t = tierOf(it); if (t) s[t] = 1; }); });
            return Object.keys(s).length;
        };
        const sample = monList
            .filter(n => mons[n] >= 3)
            .sort((a, b) => spread(b) - spread(a) || mons[b] - mons[a])[0] || monList[0];
        const sampleRows = R.filter(r => r[0] === sample);

        /* 目录行 */
        const monRows = R.map(([n, a, its]) => [
            n + ' ' + (a || ''),
            [n, a || '<span class="mon-no">未标注</span>', its.length ? its.join('、') : '<span class="mon-no">无掉落</span>'],
        ]);
        const itemRows = itemList.map(k => [k + ' ' + byItem[k].join(' '), [k, byItem[k].length + ' 条', byItem[k].join('、')]]);

        const noArea = R.filter(r => !r[1]).length;
        const noDrop = R.filter(r => !r[2].length).length;

        /* 按主力档把区域分组，文案跟着数据走，不写死地名 */
        const grp = {};
        areaSorted.forEach(a => { const t = mainTier(a).tier || '—'; (grp[t] = grp[t] || []).push(a); });
        const grpTxt = (t, sep) => (grp[t] || []).join(sep || '、');
        /* 主力档占比不到六成的，当「混档区域」单独点出来 */
        const mixed = areaSorted.filter(a => { const m = mainTier(a); return m.total && m.n / m.total < 0.6; });
        const sampleTiers = (() => {
            const s = {};
            sampleRows.forEach(r => r[2].forEach(it => { const t = tierOf(it); if (t) s[t] = 1; }));
            return TIERS.filter(t => s[t]);
        })();

        return `
            <h2 class="h2">同一只魔物，换个区域，掉的东西就换一档</h2>
            <p class="p">龙之天地的掉落表不是「一只怪一张清单」，而是<b>「魔物 × 区域」</b>：同一只魔物在不同区域各占一行，<b>掉落名单并不相同</b>——越深的区域，掉的素材前缀越高级（结实 → 优质 → 顶级 → 神秘）。所以「这素材谁掉」这个问题，答案必须带上区域，否则等于没答。</p>
            ${stat([['魔物', monList.length + ' 只'], ['区域', areaList.length + ' 处'], ['收录行', R.length + ' 条'], ['去重素材', itemList.length + ' 种']])}
            <p class="p">表里 <b>${R.length - monList.length}</b> 条记录是「同一只怪在另一个区域再出现」，去重后只有 <b>${monList.length}</b> 只魔物、${R.length} 条记录。<b>${soloItems.length}</b> 种素材只有一个来源，${itemList.length - soloItems.length} 种多处都有——查毕业素材先看这个数字：只有一处来源的，刷怪点没有第二个选择。</p>

            <h2 class="h2">区域决定档次：${areaList.length} 处地方的「主力品质」</h2>
            <p class="p">把每个区域里出现过的素材按前缀归类，取出现最多的那一档，就是这一区的主产档位：</p>
            ${tbl(['区域', '主力档', '主力档条数'], areaSorted.map(a => {
                const m = mainTier(a);
                return [a, m.tier ? '<b>' + m.tier + '</b>' : '<span class="mon-no">—</span>', m.n + ' / ' + m.total];
            }), { leftFirst: true, colw: ['10rem', '5.4rem', 'auto'] })}
            <div class="key">按主力档聚起来看：<b>结实</b>档 ${grpTxt('结实')}；<b>优质</b>档 ${grpTxt('优质')}；<b>顶级</b>档 ${grpTxt('顶级')}${grp['极品'] ? '；<b>极品</b>档 ' + grpTxt('极品') : ''}；<b>神秘</b>档 ${grpTxt('神秘')}。${mixed.length ? '<b>' + mixed.join('、') + '</b> 的主力档占比不到六成，掉落是混着的——那底下挂着一串不同等级的副本，不能当一整片地方看。' : ''}</div>

            <h2 class="h2">一只怪的多档掉落：以 ${sample} 为例（${sampleRows.length} 处区域 / ${sampleTiers.length} 个档次）</h2>
            <p class="p">${sample} 在表里出现在 ${sampleRows.length} 个区域，掉的东西跟着区域一路升档（${sampleTiers.join(' → ')}）：</p>
            ${tbl(['区域', '掉落'], sampleRows.map(([n, a, its]) => [a || '<span class="mon-no">未标注</span>', its.length ? its.join('、') : '<span class="mon-no">无掉落</span>']), { leftFirst: true, colw: ['9rem', 'auto'] })}
            <div class="key">想凑「顶级／神秘」的素材，就得跟着区域走——在春之台地支起帐篷刷一辈子，也只能拿到结实档。反过来，前期要「结实」类素材，别跑去终末之森送死。</div>

            <h2 class="h2">素材 → 出处（${itemList.length} 种，按来源多少排）</h2>
            <p class="p">按素材名搜索。出处写成「魔物·区域」，<b>排在前面的只有一两个来源</b>，那些就是最难凑的；区域写「未标注」的，说明源表那一行没给地方，只能确定是哪只怪掉。</p>
            ${ftableOwn(['素材', '来源条数', '谁掉（魔物·区域）'], ['7rem', '4.6rem', 'auto'], itemRows, { ph: '输入素材名或魔物名' })}

            <h2 class="h2">全部魔物 × 区域 掉落（${R.length} 条）</h2>
            <p class="p">按魔物名、区域或素材名搜索。同一只怪有多行，是因为它在多个区域出现且掉落不同。</p>
            ${ftableOwn(['魔物', '区域', '掉落'], ['8rem', '7.4rem', 'auto'], monRows, { ph: '输入魔物、区域或素材' })}

            <div class="note">取自 gametoeasy.com《符文工房:龙之天地》魔物掉落表（post/1816，${R.length} 条记录，由 <code>_build_drop_azuma.py</code> 生成 <code>js/drop_azuma.js</code>）。同一张表 biligame「龙之天地 材料掉落」（RRFSitemdrop）也有收录，本站已抽 6 只魔物逐行对照，内容一致。<b>原表不带掉落概率</b>，本页只做「谁掉什么、在哪掉」的索引，不推算掉率。「上空」是游戏后期浮空副本的分区，属正常区域名；${noArea} 条记录的源表区域写「???」，本页标<b>未标注</b>；${noDrop} 条源表掉落写「×」，本页标<b>无掉落</b>——都照录，不替它补。<b>命名沿用 gametoeasy 中文译名</b>，与站内七作的 biligame 译名不完全一致。</div>`;
    }

/* 农场与田地：rf1 / rf3 / rf4 / rfo 四作有专门资料，各走自己的内容；其余四作沿用系列通用说明。
   资料源（快照存 _snap/）：biligame《种地解说》RF1farm.txt、RF3farm.txt、RF4Sfarm.txt、
   RF4farm_explain.txt、RFOfarm.txt。只记商店买价，卖价一律不列。 */
function farmDeepHtml(id) {
    if (id === 'rf1') return `
        <h2 class="h2">先说结论：本作种地不赚钱</h2>
        <p class="p">源站开篇就写了这句——<b>本作种地收益极低</b>。如果就是想种，只种当季高收益的三种：<b>春草莓、夏菠萝、秋番薯</b>。其余作物在本作里更像「料理与送礼的原料」，指望它们滚钱会失望。</p>
        <div class="note">本作有一条绕开种地的捷径：在「不思议贝壳」联机交换物品，<b>每交换一次物品 Lv 就 +1</b>，靠这个可以轻松堆到 Lv100 的物品（melonds 模拟器支持本地联机）。这条不是种地，但它是本作拿到高 Lv 素材最快的路。</div>

        <h2 class="h2">开局要凑齐的十三件农活道具</h2>
        <p class="p">本作的农具不是买来的，是<b>跑到指定地点跟指定的人说话</b>拿的。顺序错不开——破锤子要求先在卡麦多洞窟耕过 50 块地，破镰刀要求全岛累计耕过 50 块地，所以「先种地才有农具、有农具才好种地」这个循环得靠初始那把破锄头顶过去。</p>
        ${tbl(['道具', '怎么拿'], [
            ['破镰刀', '耕地累计 50 块以上后，在杂货店与萝赛塔对话'],
            ['破锤子', '在卡麦多洞窟内耕地 50 块以上后，在铁匠铺与雷昂对话'],
            ['破斧', '在薇薇亚修豪宅与比安卡对话'],
            ['破钓竿', '镇子海岸码头尽头，莎拉剧情赠送'],
            ['友好手套', '建起魔物小屋后，在薇薇亚修豪宅与塔芭莎对话'],
            ['挤奶器', '建起魔物小屋后，在薇薇亚修豪宅与查克里努斯对话'],
            ['剪毛刀', '建起魔物小屋后，在卡缪农场与卡缪对话'],
            ['毛刷', '建起魔物小屋后，在诺伊曼农场与菲尔对话'],
            ['筐', '建起魔物小屋后，在诺伊曼农场与诺伊曼对话'],
            ['空瓶', '在密丝特家对话后调查壁炉旁的架子；或薇薇亚修豪宅地下室'],
            ['瞬移', '第一次进入洞窟时密丝特赠送'],
            ['齿轮雷达', '卡麦多洞窟探险途中遇到伊万对话'],
            ['破睡袋', '卡麦多洞窟 BOSS 房间前遇到萨赫对话'],
        ], { leftFirst: true })}
        <p class="p">注意<b>友好手套、挤奶器、剪毛刀、毛刷、筐</b>这五件都要求先有<b>魔物小屋</b>——本作的牧场线（养牛剪毛）和农田线绑在一起，只种地不收魔物产出，等于放弃一半收益。空瓶则是在密丝特家与薇薇亚修豪宅地下室<b>调查</b>出来的，跟牧场无关。</p>

        <h2 class="h2">肥料只有五种</h2>
        <p class="p">全部在医院买或调和，效果分两类：改土（中和剂）、升 Lv（速速绿）、催熟（营养剂 α／β／γ）。营养剂是一条链——α 是 β 的材料，β 是 γ 的材料，所以三级催熟本质是同一瓶东西叠出来的。</p>
        ${tbl(['名称', '配方 Lv', '买价', '材料', '效果'], [
            ['中和剂', '5', '250', '小仙子的粉末＋小结晶＋药草', '解除 1 格毒地'],
            ['速速绿', '30', '700', '地之结晶＋植物的茎＋小结晶＋根＋恶魔之血', '作物 Lv+1'],
            ['营养剂 α', '40', '400', '魔力结晶＋地之结晶＋结实的藤蔓', '作物早 1 天成熟'],
            ['营养剂 β', '60', '—', '营养剂 α＋魔力结晶＋地之结晶', '作物早 2 天成熟'],
            ['营养剂 γ', '70', '—', '营养剂 β＋魔力结晶＋地之结晶＋虫皮＋恶魔之血', '作物早 3 天成熟'],
        ], { leftFirst: true })}
        <div class="note">β 与 γ 在源站没有买价（只能调和）。这不是漏抄——源站该格本来就是「-」，本站照录成破折号，没有当成 0。</div>

        <h2 class="h2">种子加工机：作物变回种子</h2>
        <p class="p">部分作物成熟后不要直接卖，丢进<b>种子加工机</b>变回种子，收益更高——源站为此专门列了一张「种子卖价 vs 作物卖价」的对比表，差价最大的一项是樱草。</p>
        <div class="note">那张表整张是<b>卖价</b>，与本站「只记买价」的规则冲突，所以不录数值，只保留结论：<b>能变回种子的作物，先变种子再卖</b>。具体差价请回源站看。</div>

        <h2 class="h2">宠物干活</h2>
        <p class="p">魔物小屋建好后可以把魔物派去浇水、收获。本作的宠物劳作分工见<a href="#/page/produce">宠物产出</a>页，那里按魔物列了能干什么活。</p>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作 27 种作物的季节、天数、连续收获</div></a>
            <a href="#/page/produce"><div class="jp-t">宠物产出</div><div class="jp-s">哪些魔物能浇水、能收获</div></a>
        </div>
    `;

    if (id === 'rf3') return `
        <h2 class="h2">两块田，各 9×18</h2>
        <p class="p">本作的田地是固定的两块，<b>左侧 9×18、右侧 9×18</b>，合计 324 格。田块位置固定，能自己定的只有「哪块地种什么」——一块走短周期轮作，一块留着种高价值作物。</p>

        <h2 class="h2">天气：原版会连着刮台风</h2>
        <p class="p">原版天气<b>每 3 小时变一次</b>，因此会出现连着几天台风的情况，田里的作物跟着遭殃。<b>RF3S（移植版）把台风间隔改成最少 10 天</b>，这一条是移植版实打实的体验差异，不是错觉。</p>

        <h2 class="h2">土地状态：六档营养、三档健康</h2>
        <p class="p">对着田看，游戏会给一句描述。那句话背后是两个数——<b>营养值</b>（决定成长倍率）与<b>健康值</b>（决定枯死率）。营养值越高，作物长得越快，最高一档是 2～3 倍速。</p>
        ${tbl(['游戏里的描述', '营养值', '成长速度'], [
            ['这块土地状态完美', '30～46', '2～3 倍'],
            ['这块土地状态非常良好', '23～29', '1.5625～1.9375 倍'],
            ['这块土地状态良好', '18～22', '1.25～1.5 倍'],
            ['这块土地状态一般', '13～17', '0.9375～1.1875 倍'],
            ['这块土地状态糟糕', '5～12', '0.475～0.875 倍'],
            ['这块土地状态非常糟糕', '0～4', '0.375～0.125 倍'],
        ], { leftFirst: true })}
        <p class="p">健康值只有三档，管的是<b>枯死概率</b>：</p>
        ${tbl(['状态', '健康值', '枯死率'], [
            ['充满活力', '40～63', '−20%'],
            ['普通', '—', '基准'],
            ['疲劳', '—', '＋20%'],
        ], { leftFirst: true })}
        <div class="note">源文在这里把健康值写作「精神值」，两个词指的是同一个数。疲劳档的具体数值区间源站没给，所以那一格留破折号。</div>

        <h2 class="h2">肥料：全部只加 16 点营养</h2>
        <p class="p">本作的肥料设计得很朴素——<b>所有肥料和枯草都只加 16 点营养值</b>，区别只在附带多少健康值。也就是说，贵的肥料不是「更肥」，是「更不伤地」。</p>
        ${tbl(['名称', '营养值', '健康值'], [
            ['枯草', '16', '8'],
            ['很会长', '16', '8'],
            ['快速长', '16', '24'],
            ['极速长', '16', '40'],
        ], { leftFirst: true })}
        <p class="p">另外，<b>每次收获农作物，营养值 −3</b>。所以连作不是「收着收着产量变低」，而是地在实打实地被抽干，得靠施肥补回来。</p>

        <h2 class="h2">有几块地天生不用养</h2>
        <p class="p">源站列了几处「不用锄枯草、不用施肥，作物 Lv 也能 +1」的地。这类地适合放长周期的高价值作物，把肥料全省下来给主田：</p>
        <div class="key">夏迷宫「浴水荒骨」右边的地／秋迷宫「风纹洞」与「避风岗」／冬迷宫「止风洞」／<b>龙玄洞全部</b>。</div>
        <p class="p">顺带一条本作特有的操作：<b>锄掉枯草，之后在这块地上播种的作物 Lv+1</b>。下田第一件事是清枯草，不是直接撒种。</p>

        <h2 class="h2">宠物播种：好感度决定种什么</h2>
        <p class="p">委托宠物种地时，它撒什么种子由<b>好感度</b>决定，而且只撒 Lv1 的种子。好感度 0～10 对应的作物如下：</p>
        ${tbl(['好感度', '春', '夏', '秋', '冬'], [
            ['0', '樱芜菁', '粉红猫', '马铃薯', '葱'],
            ['1', '樱芜菁', '粉红猫', '马铃薯', '葱'],
            ['2', '樱芜菁', '粉红猫', '马铃薯', '葱'],
            ['3', '托伊药草', '黄瓜', '菠菜', '葱'],
            ['4', '托伊药草', '黄瓜', '菠菜', '白萝卜'],
            ['5', '卷心菜', '黄瓜', '青椒', '白萝卜'],
            ['6', '卷心菜', '玉米', '青椒', '白萝卜'],
            ['7', '洋葱', '玉米', '胡萝卜', '白萝卜'],
            ['8', '洋葱', '玉米', '胡萝卜', '芜菁'],
            ['9', '草莓', '南瓜', '番薯', '芜菁'],
            ['10', '少女蜜瓜', '南瓜', '番薯', '白菜'],
        ], { leftFirst: true })}
        <div class="note">两个限制要记住：① 宠物<b>只会播 Lv1</b> 的种子，靠它刷不了作物等级；② 宠物<b>不收获连作作物</b>（黄瓜、玉米这类），得自己去收。想靠宠物全自动管田的，会在连作作物上卡住。</div>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作作物的季节、天数、连续收获</div></a>
            <a href="#/page/produce"><div class="jp-t">宠物产出</div><div class="jp-s">魔物的浇水／劈柴／砸石／收获评级</div></a>
        </div>
    `;

    if (id === 'rf4') return `
        <h2 class="h2">一块地有六个参数</h2>
        <p class="p">本作的土地不是「肥／不肥」两档，而是六个独立数值。全部要用<b>放大镜</b>看（把放大镜强化到装备上同样生效），不看就只能凭感觉种：</p>
        ${tbl(['参数', '管什么', '上限'], [
            ['质', '决定收获作物的 Lv', '2.0'],
            ['大', '决定作物能否巨大化', '2.0'],
            ['数', '决定收获数量', '—'],
            ['速', '成长速度', '5.0'],
            ['健康度', '决定枯死概率', '255'],
            ['抗灾', '抗台风等灾害', '63'],
        ], { leftFirst: true })}
        <p class="p"><b>质与大每天各自然衰减 0.015</b>，所以「施肥一次管到底」是不成立的，得当成日常维护来做。</p>

        <h2 class="h2">土地 Lv：上限只能「无限接近 17」</h2>
        <p class="p">除了上面六个参数，土地本身还有一个土地 Lv，靠收获作物积累经验。这条曲线有个反直觉的地方：<b>Lv 只能无限接近 17，真到 17 会掉回 16</b>。</p>
        ${tbl(['项目', '数值'], [
            ['Lv16 时的成长速度', '3.9 倍'],
            ['Lv16 时健康度／抗灾', '255／50'],
            ['Lv16 时「数」', '+1.00，收获数 +3'],
            ['Lv16 时闲置恢复', '大、质、数缓慢回复至 +1.00'],
            ['单次收获苹果', '土地经验 200，速／大／质／数各 32'],
        ], { leftFirst: true })}
        <div class="note">苹果树是升土地 Lv 最高效的手段——一次收获给土地经验 200，速／大／质／数各 32，源文称这种方式「最为均衡高效」。<b>但宠物收的菜不给土地经验</b>——想让地升级，得自己动手收。</div>
        <p class="p">另外两条容易搞错的：游戏里显示的「综合 Lv」<b>不是六项平均</b>，而是健康度＋抗灾；季节适应也有硬倍率，<b>应季 1.5 倍、非应季 0.5 倍</b>，差三倍。</p>

        <h2 class="h2">镰刀决定能刷到多少 Lv</h2>
        <p class="p">用镰刀割成熟的作物，能得到<b>种子 Lv+1</b> 的种子。作物 Lv 越高，要求的镰刀越高级——这是本作作物 Lv 链条的闸门：</p>
        ${tbl(['镰刀', '材质', '等级'], [
            ['破镰刀', '铁', 'Lv3'],
            ['除草镰刀', '铜', 'Lv4'],
            ['上等镰刀', '银', 'Lv6'],
            ['利刃镰刀', '金', 'Lv8'],
            ['名匠镰鼬', '白金', 'Lv10'],
        ], { leftFirst: true })}
        <p class="p">低级作物（比如芜菁）不需要镰刀，光靠把「质」拉到 2.0 就能一路升到 Lv10；高级作物则必须两样都到位，而且<b>当天施的肥对即将成熟的高级作物不生效</b>——想让它吃上，得提前几天把质拉满。</p>

        <h2 class="h2">农药十四种</h2>
        <p class="p">本作的农药（肥料）是调和出来的，效果直接写在名称里。下表只记<b>买价</b>，卖价不列：</p>
        ${tbl(['名称', '技能要求', '材料', '效果', '买价'], [
            ['很会长', '29', '枯草＋蓝草＋黑草', '健康度 −26，速 +0.4（上限 5）', '1200'],
            ['快速长', '41', '黄草＋粉红猫＋四叶草', '健康度 −36，速 +1（上限 5）', '3600'],
            ['极速长', '72', '白草＋原之焰火＋玉米', '健康度 −36，速 +2（上限 5）', '9800'],
            ['速速绿', '34', '枯草＋靛草＋月落草', '健康度 −24，质 +0.06', '3000'],
            ['速速绿疾风', '64', '枯草＋苦橙草＋玉米', '健康度 −36，质 +0.5', '12000'],
            ['要长大', '57', '灯草', '健康度 −12，大 +0.31', '12000'],
            ['要变小', '53', '铁千轮', '健康度 +60，大 −1', '8000'],
            ['植物保护剂', '30', '魅蓝草＋樱草', '抗灾 +32（上限 63）', '2000'],
            ['不会烂 α', '26', '枯草＋托伊药草', '减轻作物 HP 降低', '2000'],
            ['不会烂 β', '50', '枯草＋红草＋四叶草', '减轻作物 HP 降低', '8000'],
            ['枯草', '—', '—', '健康度 +60', '100'],
            ['玉米', '—', '—', '健康度 +180', '3000'],
            ['四叶草', '—', '—', '健康度 +180', '4000'],
            ['大四叶草', '—', '—', '健康度 +180', '20000'],
        ], { leftFirst: true })}
        <div class="note">农药的 Lv <b>不会</b>提升肥料效果，强化它没有意义。另外每块田<b>每天第一次施肥不扣健康度</b>，第二次扣一点，第三次全额扣——一天往同一块地连施三次肥，是在自己拆地。</div>

        <h2 class="h2">巨大作物：四步，一步都不能省</h2>
        <p class="p">巨大作物不是随机长出来的，是「大」到 2.0 之后四株合体。源站把流程写得很死，顺序错了就白种：</p>
        ${tbl(['步骤', '要做什么'], [
            ['① 关宠物种田', '宠物会把还没合体的作物收走，直接毁掉这一轮'],
            ['② 把「大」拉到 2.0', '用「要长大」（12000G，大 +0.31），配放大镜确认数值'],
            ['③ 同田 2×2 种同一种作物', '必须在同一个四方田的 2×2 范围内，跨田不能合体'],
            ['④ 施完肥补健康度', '枯草／玉米／四叶草，健康度不够作物撑不到合体'],
        ], { leftFirst: true })}
        <p class="p">作物是<b>分阶段变大</b>的：先单株变大，再四株合体，最后才成为巨大作物。中间任何一株被收走，这一组就废了。自由农业鞋在同一个四方田内也能合体，跨田依旧不行。</p>

        <h2 class="h2">商店里的种子 Lv 怎么解锁</h2>
        <p class="p">想让商店卖高 Lv 的种子，规则是「<b>出货同 Lv 的东西</b>」，但普通作物和树木的判定不一样：</p>
        ${tbl(['对象', '解锁条件'], [
            ['普通作物（如芜菁）', '出货 Lv10 的作物 或 Lv10 的种子，任选其一，商店两者都会变成 Lv10'],
            ['树木（如苹果树）', '必须出货 Lv10 的「种子」；只出货 Lv10 的果实，商店不会上架 Lv10 种子'],
        ], { leftFirst: true })}
        <p class="p">这条规则决定了赚钱路线：<b>先把某一种作物刷到 Lv10 → 商店就能直接买 Lv10 种子 → 用 Lv10 作物做料理批发</b>。Lv10 素材的卖价是 Lv1 的两倍，而 Lv10 料理是 Lv1 的三倍，批发价却不变——差额全在等级上。</p>

        <h2 class="h2">天气与宠物</h2>
        <p class="p">台风天看的是「土地＋作物」的最大抵抗值，上限 63（即 100%）；<b>低于 77% 时作物有可能被直接消灭</b>。想稳过台风季，抗灾溶剂（+32）要提前上。</p>
        <p class="p">另一种是<b>符文精灵天气</b>——天上飘着石头、树木、水滴、小草的精灵。当天已经种下的作物<b>成长速度 ×4</b>，作物 HP 回复 0～150，并且当天享受肥料全满效果，收获数与作物 Lv 也会涨。这种天气是可遇不可求的加速窗口，看到就该把最贵的作物种下去。</p>
        ${tbl(['宠物行为', '条件'], [
            ['委托干活（除草、清石木、浇水、收获）', '好感度 3'],
            ['协助播种', '好感度 8'],
            ['砍巨大树桩', '一天只砍一下，共需 9 天'],
        ], { leftFirst: true })}
        <div class="note">宠物会把牧草自动送进饲料箱、杂草送进肥料箱。牧草消耗量 ≈ <b>宠物数 ÷ 4 ＋ 正在工作的宠物数</b>，养一堆闲宠物也在吃草。</div>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作作物的季节、天数、售价与收获数</div></a>
            <a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">农药的调和配方与技能要求</div></a>
            <a href="#/page/produce"><div class="jp-t">宠物产出</div><div class="jp-s">各魔物的干活评级</div></a>
        </div>
    `;

    if (id === 'rfo') return `
        <h2 class="h2">本作没有锄头，也没有洒水壶</h2>
        <p class="p">这是海洋最容易被忽略的一条：<b>本作不能买种子、没有洒水壶、也没有锄头</b>。翻地这件事被<b>精灵杖</b>接手，五级精灵杖就是五级「锄头」：</p>
        <p class="p">源站把这五把杖<b>并列</b>成锄头的替代品，顺序照抄原文：<b>幼小的精灵杖／鲜嫩的精灵杖／成长中的精灵杖／发青的精灵杖／成熟的精灵杖</b>。各级之间翻地范围的差别，源站一个字没写，所以这里不排等级、不猜高低。</p>
        <div class="note">「升级农具」在本作等于「换精灵杖」，而精灵杖是锻造出来的——农活强度直接挂在本作的锻造线上。</div>

        <h2 class="h2">种地只能在四座岛</h2>
        <p class="p">全作只有四座主线解锁的岛能种地、能采矿，对应四季，靠岛上的<b>发芽点</b>播种。而且有一条硬限制：<b>在农业岛用精灵魔法播下种子后，岛上必须有对应的宠物，才会真的种下去</b>——没有宠物，魔法放出去等于空放。</p>
        ${tbl(['项目', '春芽岛', '常夏岛', '秋实岛', '冬冰岛'], [
            ['位置', 'E-5', 'C-7', 'G-4', 'C-3'],
            ['季节', '春', '夏', '秋', '冬'],
            ['对应精灵', '幼小黄精灵', '幼小红精灵', '幼小绿精灵', '幼小蓝精灵'],
            ['农作物芽', '100', '100', '150', '—'],
            ['树木芽', '16', '20', '15', '—'],
            ['矿石', '—', '—', '—', '20'],
        ], { leftFirst: true })}
        <p class="p">冬冰岛是个例外：<b>没有农作物芽、也没有树木芽，只有「矿石」一栏写着 20</b>，它本质是采矿岛，别指望在那儿种东西。反过来，秋实岛的农作物芽最多（150），是主产地。</p>

        <h2 class="h2">四座岛各能种什么、派谁去</h2>
        ${tbl(['岛', '可种作物', '岛上工作宠物'], [
            ['春芽岛', '马铃薯、卷心菜、黄瓜、草莓、月落草、樱草、金刚花', '春日花、黄精灵、狼王'],
            ['常夏岛', '番茄、洋葱、玉米、菠萝、菠菜、托伊药草、四叶草、原之焰火、魅蓝草', '夏日花、红精灵、猛犸象'],
            ['秋实岛', '大豆、南瓜、青椒、茄子、白萝卜、芜菁、胡萝卜、粉红猫、红叶花、灯草、树形草、蒲公英', '秋日花、绿精灵、蓝精灵、独角兽王'],
            ['冬冰岛', '所有矿石、宝石、结晶（不产作物）', '死亡蝎、狰狞死神、浮士德、石魔人、鬼魂'],
        ], { leftFirst: true })}
        <p class="p">种树与收获的宠物是通用的：<b>松鼠王</b>负责春／夏／秋三岛的树，<b>兽人射手</b>负责这三岛的收获；冬冰岛两样都没有。换句话说，想在冬冰岛产出作物是不可能的，那儿的活只有挖矿。</p>

        <h2 class="h2">树上会掉符文结晶</h2>
        <p class="p">本作一条容易被当成谣言的真规则：<b>树木成熟时有概率获得符文结晶</b>。所以「种树 → 收结晶」在海洋里是稳定产出线，尤其是常夏岛树木芽 20、秋实岛 15 这两处。</p>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作作物的季节、天数、连续收获</div></a>
            <a href="#/page/rfomap"><div class="jp-t">地图与出没</div><div class="jp-s">四岛的精灵石树、宝箱与区域分布</div></a>
            <a href="#/page/produce"><div class="jp-t">宠物产出</div><div class="jp-s">能派去种地／种树／收获的魔物</div></a>
        </div>
    `;

    if (id === 'rf2') return `
        <h2 class="h2">台风是可以跳过的</h2>
        <p class="p">本作的天气系统有个可钻的空子：<b>第 N 天决定第 N+1 天有没有台风</b>。所以在第 N−1 天睡前存档，第二天读档就能刷掉那场台风。除了第二章开头那场强制台风，其余台风全部可以跳。</p>
        ${tbl(['手段', '怎么做'], [
            ['SL', '第 N−1 天睡前存档，之后读档重刷第 N+1 天的天气'],
            ['占卜', '找占卜女占卜，可以强制改变第二天的天气'],
            ['睡袋／进医院', '野外使用睡袋；或在城镇内让 HP 归 0 进医院，都能强制第二天晴天'],
        ], { leftFirst: true })}
        <div class="note">前两条是「刷」，第三条是「换」——睡袋和进医院是花代价买一个确定的晴天，赶在收获前一天用才划算。</div>

        <h2 class="h2">本作数据崩坏：作物做成种子再卖</h2>
        <p class="p">源站对二代数值的评价只有一句——<b>「本作数据极端崩坏」</b>。具体表现是：草莓这类作物成熟后<b>做成种子再卖</b>，利润远高于直接卖作物。这条不是小技巧，是本作赚钱的主路。</p>
        <div class="note">「做成种子」的价格差属于卖价，本站不列数值；机制本身记在这里，想核数字请回源站对表。</div>

        <h2 class="h2">十二件农具：能蓄力的只有六件</h2>
        <p class="p">二代的农具分两批：<b>「用惯的」六件</b>靠开局剧情购买与早期委托报酬到手，能蓄力；<b>「破」六件</b>要等第二部，在「牧场的家」1F 调查箱子一次性拿全，且<b>无法蓄力</b>。技能门槛一律是 Lv10——农耕、采伐、采掘、钓鱼各管各的。</p>
        ${tbl(['农具', '入手', '技能要求', '蓄力'], [
            ['用惯的锄头', '开局剧情，100G 购买', '农耕 Lv10', '2（范围 3×3）'],
            ['用惯的洒水壶', '开局剧情，100G 购买', '农耕 Lv10', '2（范围 3×3）'],
            ['惯用镰刀', '杰克 1-01「来一下」报酬', '农耕 Lv10', '2（范围 3×3）'],
            ['惯用斧', '塔喵 1-01「兽人消灭作战」报酬', '采伐 Lv10', '2'],
            ['惯用锤', '戈登 1-01「想让你取紫水晶」报酬', '采掘 Lv10', '2'],
            ['用惯的钓竿', '巴雷特 1-01「有要寻找的东西……」报酬', '钓鱼 Lv10', '2'],
            ['破锄头', '第 2 部「牧场的家」1F 调查箱子', '农耕 Lv10', '无法蓄力'],
            ['破洒水壶', '第 2 部「牧场的家」1F 调查箱子', '农耕 Lv10', '无法蓄力'],
            ['破镰刀', '第 2 部「牧场的家」1F 调查箱子', '农耕 Lv10', '无法蓄力'],
            ['破斧', '第 2 部「牧场的家」1F 调查箱子', '采伐 Lv10', '无法蓄力'],
            ['破锤子', '第 2 部「牧场的家」1F 调查箱子', '采掘 Lv10', '无法蓄力'],
            ['破钓竿', '第 2 部「牧场的家」1F 调查箱子', '钓鱼 Lv10', '无法蓄力'],
        ], { leftFirst: true })}
        <p class="p">也就是说：<b>能蓄力的只有「用惯的」六件</b>（锄头、洒水壶、镰刀是 2 级蓄力、范围 3×3），「破」六件虽然名字像是升级，实际一次蓄力都用不了。别看到「破」就以为换掉了旧的。</p>

        <h2 class="h2">宠物只在特定时段干活</h2>
        <p class="p">二代的宠物不是全天候待命，不同活有各自的上班时间。安排委托时对不上点，等于白派：</p>
        ${tbl(['工作', '时间段'], [
            ['浇水', '上午 4 点～上午 0 点'],
            ['收获', '下午 4 点～上午 0 点'],
            ['伐木', '上午 8 点～下午 4 点'],
            ['砸石', '上午 8 点～下午 4 点'],
        ], { leftFirst: true })}
        <div class="note">「上午 0 点」按源表原样照录，没有换算成 24 小时制——源站写的就是 0 点。浇水从凌晨 4 点就能开工，是一天里最早的活。</div>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作作物的季节、天数与连续收获</div></a>
            <a href="#/page/produce"><div class="jp-t">宠物产出</div><div class="jp-s">哪些魔物能浇水、伐木、砸石</div></a>
        </div>
    `;

    if (id === 'rf5') return `
        <h2 class="h2">六块田，全挂在农场龙身上</h2>
        <p class="p">五代的田不是「自宅后院一块地」，而是<b>六处农场龙各管一片</b>。而且农场龙不是季节田——<b>它随天气走</b>，不随季节走，别按四季去记。</p>
        ${tbl(['地点', '解锁', '初始大格', '扩建 1 次', '消耗', '扩建 2 次', '消耗'], [
            ['门口', '—', '16', '—', '—', '—', '—'],
            ['土龙', '细语森林', '24', '35', '1', '48', '3'],
            ['火龙', '科尔布熔岩洞', '24', '35', '3', '48', '5'],
            ['冰龙', '梅利涅冰洞', '40', '55', '4', '72', '6'],
            ['风龙', '贝尔法遗迹深处', '16', '25', '2', '36', '4'],
            ['地龙', '雷鸣荒野', '16', '25', '2', '36', '4'],
        ], { leftFirst: true })}
        <p class="p"><b>冰龙初始就有 40 格</b>，是六块里最大的，扩建到 72 也最贵（消耗 4 与 6）；土龙与火龙初始 24，扩建消耗 1／3 与 3／5，性价比最高。想快速铺开田地，先扩土龙。</p>

        <h2 class="h2">水晶：五代的田地靠喂水晶改</h2>
        <p class="p">这是五代最省事也最烧钱的一套——把水晶喂给农场龙，效果是全田范围的，不用一格一格施肥：</p>
        ${tbl(['水晶', '喂法', '效果'], [
            ['地水晶', '每条龙喂 2 次', '永久把田地面积扩到最大'],
            ['火水晶', '每条龙喂 2 次（一次 5 个）', '全部田 5 倍速生长（会像肥料一样衰减）'],
            ['土水晶', '先把健康度施肥降到 0，再喂 3 个', '健康度群体恢复到 64（64 属低健康度区间）'],
            ['风水晶', '每条龙喂 2 个，每天一次，最多 3 次', '所有作物收获数量 +3'],
        ], { leftFirst: true })}
        <div class="note">「最直接、最耗钱」是源站给这套写的小标题。前期肥料很贵，源站建议<b>把肥料集中在一小块地上</b>，先把委托板任务刷完，别全田撒。</div>

        <h2 class="h2">商店解锁：五代对树木放宽了</h2>
        <p class="p">四代有个坑——树木必须出货 Lv10 的<b>种子</b>，商店才卖 Lv10 种子，光卖果实没用。<b>五代取消了这个限制</b>：普通作物出货 Lv10 的作物或种子任意一个即可，树木也不再要求出货种子。</p>
        <p class="p">赚钱逻辑还是那一套：先把一种作物刷到 Lv10 → 商店就能直接买 Lv10 种子 → 用 Lv10 作物做料理批发。Lv10 素材卖价是 Lv1 的两倍、Lv10 料理是三倍，而批发价不变。</p>

        <h2 class="h2">巨大作物与土地参数</h2>
        <p class="p">土地照样要用<b>放大镜</b>看（强化到装备上同样生效）。巨大作物的流程与四代一致：关掉宠物种田（宠物会收走没合体的作物）→ 用「变大大」把「大」拉到 2.0 → 同一个四方格 2×2 种同一种作物 → 施完肥补健康度。</p>
        ${tbl(['农药／肥料', '效果', '买价'], [
            ['速速绿', '质 +0.06，健康度 −24（质上限 2，每天 −0.015）', '3000'],
            ['速速绿疾风', '质 +0.5，健康度 −36', '12000'],
            ['变大大', '大 +0.31，健康度 −12（大每天 −0.015）', '12000'],
            ['变小小', '大 −1，健康度 +60', '12000'],
            ['抗灾溶剂', '抗灾 +32（上限 63）', '2000'],
            ['枯草', '健康度 +60（上限 255）', '—'],
            ['玉米（Lv10）', '健康度 +180', '—'],
            ['四叶草（Lv10）', '健康度 +180（巨大化效果不增加）', '—'],
        ], { leftFirst: true })}
        <p class="p">台风天照旧看「土地＋作物」抵抗值，上限 63（100%），<b>低于 77% 时作物可能被消灭</b>。枯草、玉米、四叶草要先<b>放在对应四方格上，再用锄头锄掉</b>才生效——直接使用是没用的。</p>

        <h2 class="h2">流星天气：25～55 天一次</h2>
        <p class="p">本作特有的天气事件。<b>每 25～55 天来一次</b>（旧版本有 BUG：流星天气会被台风覆盖，而且照样算作「已经发生过」）。第二天会在三张大地图的数个固定地点里各落一颗流星，砸掉随机得到流星种子；<b>重启游戏可以再获取一次</b>。</p>
        <p class="p">流星作物<b>跨季节会枯萎</b>，别囤着不收。把它投进里格巴斯塔下的青蛙池塘，可以换到季节头饰。隐藏种子也可以刷：SL 能改变「当天有没有隐藏种子」，但改不了种子的种类。</p>

        <h2 class="h2">快速升农耕等级</h2>
        <p class="p">源站给的办法很直白：<b>去家具店买八九个沙袋摆在一起，用锄头不停打</b>。同样的手法也能升武器等级，但<b>钓竿无效</b>。</p>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作作物的季节、天数与收获</div></a>
            <a href="#/page/produce"><div class="jp-t">宠物产出</div><div class="jp-s">宠物种地：好感 3 干活、好感 8 播种</div></a>
        </div>
    `;

    if (id === 'rff') return `
        <h2 class="h2">本作的种子 Lv 永远不会涨</h2>
        <p class="p">边境和后面几代最大的差别就在这里：<b>商店卖的种子等级永远不会升级</b>。四代、五代那套「出货 Lv10 作物 → 商店卖 Lv10 种子」的循环，在本作不成立。要高级种子，只能靠镰刀割、靠作物自己升。</p>

        <h2 class="h2">农药：当天生效，而且能叠</h2>
        <p class="p">效果本身不复杂，特殊的是结算方式——<b>生长加速当天立即生效，并且每天使用可以叠加</b>。后几代的肥料是「加了就等」，本作是「天天喂天天快」。</p>
        ${tbl(['农药', '效果'], [
            ['速速绿', '作物 Lv+1（同一个作物只生效一次）'],
            ['营养剂 α', '生长日加速 1 天'],
            ['营养剂 β', '生长日加速 2 天'],
            ['营养剂 γ', '生长日加速 3 天'],
        ], { leftFirst: true })}
        <p class="p">但加速有硬上限：作物生长分<b>种子、出芽、长大、成熟四个阶段</b>，<b>加速不能跳过阶段</b>，所以再怎么喂，最快也要四天才能成熟。想靠营养剂把七天作物压到两天，本作做不到。</p>

        <h2 class="h2">八件初始农具全是剧情／好感给的</h2>
        <p class="p">边境的农具不卖，全靠推进剧情与刷好感：</p>
        ${tbl(['道具', '怎么拿'], [
            ['破锄头', '开局密丝特赠送'],
            ['破洒水壶', '开局密丝特赠送'],
            ['破锤子', '鲸鱼岛遇见美乐蒂后赠送'],
            ['破斧', '老修女斯黛拉好感度 20% 后对话赠送'],
            ['破镰刀', '农场帅哥埃里克好感度 20% 后对话赠送'],
            ['破钓竿', '和正在钓鱼的多洛普对话赠送'],
            ['收集器', '糖糖对话赠送'],
            ['友好毛刷', '调查鲸鱼岛开头的石板后，木匠赠送'],
        ], { leftFirst: true })}
        <div class="note">两件好感道具的门槛都只是 20%。破斧砍树、破镰刀割草，是本作最实用的两件——早期优先刷这两个人的好感。</div>

        <h2 class="h2">野外田地 24 处，都按季节分</h2>
        <p class="p">本作的田不在自宅后院，而是散在各个迷宫里，<b>按季节分区</b>：鲸鱼岛六处全年可种，若草遗迹（春）、蔓草遗迹（夏）、雪草遗迹（秋）各按季节开放。面积以「大格」计：</p>
        ${tbl(['地图', '季节', '田地面积', '捷径'], [
            ['鲸鱼岛 洞窟表层', '全', '5 大格', '左上角有通往活力之塔的绳子；右下角通往鲸鱼岛侧腹'],
            ['鲸鱼岛 洞窟深层', '全', '6 大格', '—'],
            ['鲸鱼岛 胸鳍', '全', '5 大格', '祝日通往路匹亚湖'],
            ['鲸鱼岛 侧腹', '全', '4 大格', '左上角通往鲸鱼岛洞窟表层'],
            ['鲸鱼岛 尾巴大树', '全', '2 大格', '—'],
            ['鲸鱼岛 水路桥', '全', '12 大格', '—'],
            ['鲸鱼岛 空中回廊', '全', '28 大格', '通往鲸鱼岛洞窟入口的传送门'],
            ['若草遗迹 B1', '春', '20 大格', '—'],
            ['若草遗迹 B2', '春', '9 大格', '—'],
            ['若草遗迹 B3', '春', '8 大格', '—'],
            ['若草遗迹 B4', '春', '4 大格', '—'],
            ['蔓草遗迹 B1', '夏', '11 大格', '—'],
            ['蔓草遗迹 B2', '夏', '8 大格', '—'],
            ['蔓草遗迹 B3', '夏', '12 大格', '—'],
            ['蔓草遗迹 B4', '夏', '18 大格', '—'],
            ['蔓草遗迹 B5', '夏', '14 大格', '—'],
            ['蔓草遗迹 B6', '夏', '6 大格', '—'],
            ['雪草遗迹 B1', '秋', '18 大格', '通往 B3、B7 的传送门'],
            ['雪草遗迹 B2', '秋', '12 大格', '—'],
            ['雪草遗迹 B3', '秋', '8 大格', '—'],
            ['雪草遗迹 B4', '秋', '16 大格', '—'],
            ['雪草遗迹 B5', '秋', '12 大格', '—'],
            ['雪草遗迹 B6', '秋', '10 大格', '—'],
            ['雪草遗迹 B7', '秋', '8 大格', '—'],
        ], { leftFirst: true })}
        <p class="p"><b>鲸鱼岛空中回廊 28 大格</b>是全作最大的一块，且全年可种；季节区里最大的是<b>若草遗迹 B1（20 格）</b>与<b>雪草遗迹 B1（18 格）</b>。种长周期作物优先放这几处，短周期的丢小地块。</p>
        <div class="note">表中「B1～B7」是本站对「地下 1 层～7 层」的缩写，源表写的是「地下 N 层」。</div>
        <div class="jump">
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作作物的季节、天数与连续收获</div></a>
            <a href="#/page/produce"><div class="jp-t">宠物产出</div><div class="jp-s">本作种地必抓的宠物</div></a>
        </div>
    `;

    if (id === 'azuma') return `
        <h2 class="h2">这一作没有农具，农活是跳舞</h2>
        <p class="p">龙之天地是系列里唯一<b>取消整套农具</b>的一作：锄头、镰刀、洒水壶全都不存在，下地干活靠神器的舞——七种舞里有六种对口农活。具体「哪件农活对应哪支舞」在<a href="#/page/tool">农具</a>页有逐条对照，这一页不重复。</p>
        <p class="p">真正影响种田节奏的是两条冷却规则：<b>鼓之舞一天只能用一次</b>（催生长、救活枯萎作物），而<b>扇之舞能一次把田里的作物全收</b>。所以本作的田不是「每天巡一遍浇水」，而是「先催后收」——一天只有一次催的机会，浪费了就少一天。</p>

        <h2 class="h2">田是跟着村子开的</h2>
        <p class="p">本作没有一座统一的村，春／夏／秋／冬四个里各算各的。开垦田地属于<b>村庄满级条件</b>之一：<b>每个里 30 块田</b>，<b>秋之里另需 30 块水田</b>——水田与普通田地分开计算，别以为在秋之里开 60 块普通田就能抵。</p>
        ${tbl(['满级条件里的农活项', '要求'], [
            ['开垦的田地', '每里 30 块；秋之里另需 30 块水田，两者独立计算'],
            ['该区收成巨大作物', '每里 5 种'],
            ['该区收成金色作物', '每里 4 种，4 种都要种，金刚花不算'],
        ], { leftFirst: true })}
        <p class="p">这三项是四季都要各做一遍的——也就是说，巨大作物与金色作物在四个里各要凑齐一次，是本作最费时的农活目标。完整条件表见<a href="#/page/azuma_village">村庄升级</a>页。</p>
        <div class="jump">
            <a href="#/page/azuma_village"><div class="jp-t">村庄升级</div><div class="jp-s">四个里的满级条件与建村效果</div></a>
            <a href="#/page/tool"><div class="jp-t">农具</div><div class="jp-s">六件农活分别用哪支舞</div></a>
            <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">本作作物的季节与天数</div></a>
        </div>
    `;

    return '';
}

const PAGES = [
    /* ================= 基础知识 ================= */
    {
        key: 'intro', group: 'basic', title: '游戏简介', icon: 'scroll',
        body: g => `
            <h2 class="h2">${g.name}</h2>
            ${stat([['发售日', g.date], ['平台', platAll(g.plat)], ['舞台', g.stage]])}
            <p class="p">${g.intro}</p>
            <div class="note">本文为本站整理的中文资料。作品名、角色名以官方中文版（世嘉／Marvelous 亚洲）译名为优先，未推出官方中文的作品保留常见译名并附原文。</div>
            <h2 class="h2">本作特色</h2>
            ${g.systems.map(([t, d]) => `<h3 class="h3">${t}</h3><p class="p">${d}</p>`).join('')}
            <div class="key">一句话定位：<b>${g.tagline}</b></div>
        `
    },
    {
        key: 'diff', group: 'basic', title: '移植版对照', icon: 'books',
        gms: ['rf3', 'rf4'],
        body: g => (g.id === 'rf3') ? diffRf3(g) : diffRf4(g)
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
        body: g => {
            /* 海洋（Wii／PS3）没有键鼠：旧版这里落到通用分支，写了「支持手柄与键鼠」，
               是模板套话，与平台事实不符。海洋另有巨人一套按键，单列。 */
            const isRfo = g && g.id === 'rfo';
            const platNote = isRfo
                ? 'Wii 遥控器＋双节棍（也可接经典手柄）或 PS3 手柄；两版都不支持键鼠。巨人另有一套按键，见「奖杯与许愿」页。'
                : g.id === 'rff' ? 'Wii 遥控器体感挥动；也可接经典手柄用传统操作。'
                    : (g.id === 'rf1' || g.id === 'rf2' || g.id === 'rf3' ? '双屏，下屏显示地图与状态，可触屏点选；这作没有键鼠。'
                        : g.id === 'rf4' ? '双屏，下屏可触屏操作；这作<b>没有键鼠</b>。'
                            : '支持手柄与键鼠；键鼠可在设置里重绑全部按键。');
            return `
            <h2 class="h2">基本操作逻辑</h2>
            <p class="p">系列的操作始终围绕同一套思路：一个键「用当前手上的东西」（农具／武器／道具），一个键「跳／冲刺」，一个键开菜单，方向键移动。真正需要记的只有三件事——</p>
            <ul class="ul">
                <li class="li"><b>切换道具</b>：L／R 或方向键循环，田里换锄头、迷宫里换武器，切换是否顺手直接决定手感。</li>
                <li class="li"><b>蓄力</b>：长按使用键可以蓄力，农具的蓄力等级决定一次能翻几格地；杖的蓄力决定魔法强度。</li>
                <li class="li"><b>锁定与闪避</b>：动作化的作品（3 代之后）有锁定目标与翻滚闪避，Boss 战几乎都靠这两个。</li>
            </ul>
            ${tbl(['平台', '本作操作要点'], [[g.plat, platNote]], { leftFirst: true })}
            ${isRfo ? `<h2 class="h2">海洋独有的两套操作</h2>
            <p class="p">这一作要同时操作<b>人物</b>与<b>巨人</b>，两者按键完全分开。巨人这边最常按的是四个：</p>
            ${tbl(['操作', '作用'], [
                ['<b>AB</b>', '拍击海面引起冲击波，可发现海底岛屿或沉船'],
                ['<b>A</b>', '挥拳战斗，三连击'],
                ['<b>B</b>', '挖掘海底岩石、岛屿或沉船'],
                ['<b>地图键</b>', '调出海图，选中位置后进入海图模式规划路线，比直接开过去省时间'],
            ], { leftFirst: true })}
            <div class="key">海图模式里提示<b>问号</b>可以 AB 调查、提示<b>礁石</b>可以拿起来调查，都可能出符文球或海怪——很多人只把它当导航，白丢了这些点。</div>` : ''}
            <h2 class="h2">不写在说明书里的三件事</h2>
            <p class="p">${isRfo
                    ? '一、<b>巨人自带传送门</b>，可以直接回家与四季牧场岛，不必每次开回港口。二、<b>每个岛只能养 5 只魔物</b>，巨人体内 10 只——养满之前先想清楚放哪。三、<b>挖岛有次数奖杯</b>，10／20／30 次各一个，前期顺手多挖几次能一起拿。'
                    : '一、<b>跳跃能省时间</b>。很多地形可以跳过去，不必绕路。二、<b>背包要定期清</b>。素材堆满会挤掉任务道具的拾取位。三、<b>菜单里能看 NPC 当前位置</b>（较新的作品才有），找人时先看一眼，比满镇跑快得多。'}</p>
        `;
        }
    },
    {
        key: 'rfomain', group: 'basic', title: '主线流程', icon: 'scroll',
        gms: ['rfo'],
        body: () => rfoMainHtml()
    },
    {
        key: 'rfomap', group: 'basic', title: '地图与出没', icon: 'compass',
        gms: ['rfo'],
        body: () => rfoMapHtml()
    },
    {
        key: 'rfosail', group: 'basic', title: '岛屿与打捞', icon: 'compass',
        gms: ['rfo'],
        body: () => rfosailHtml()
    },
    {
        key: 'rffevent', group: 'basic', title: '主线与角色事件', icon: 'scroll',
        gms: ['rff'],
        body: () => rffEventHtml()
    },
    {
        key: 'rf3main', group: 'basic', title: '主线流程', icon: 'scroll',
        gms: ['rf3'],
        body: () => rf3MainHtml()
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
            <h2 class="h2">先看六作怎么读抗性（速览）</h2>
            <p class="p">本页把六作的抗性数据做成能横比的分析，但<b>六作是六套体系，读法各不相同</b>——把 RF5 的「找负数」直接套到 RF1 上，会得出「初代没弱点」的错结论。下面这张表是总览：先记住每作「弱点长什么样」，再往下看各自的细表。</p>
            ${tbl(['作品', '抗性体系', '弱点怎么读', '收录', '细表'], [
                ['RF5 / RF4', '八属性小数系数', '负数＝弱点，正数＝抗，0＝无；爱属性两作分歧最大', N + ' / ' + N4 + ' 只', '本页前两节'],
                ['RF3', '八属性整数倍率', '−1＝怕、+4＝极抗、0＝无修正；量纲不同，不能和前两作比', (((typeof BRES_RF3 !== 'undefined') ? BRES_RF3.length : 0)) + ' 只（仅 Boss）', 'RF3 节'],
                ['RF1', '五列减伤值（全正数）', '没有负数——数字越小越脆、越大越抗；物理是通解', (((typeof RF1_MON !== 'undefined') ? RF1_MON.length : 0)) + ' 只', 'RF1 节'],
                ['海洋', '三档记号 〇／×／空', '无数值；×＝弱点、〇＝有该项、空＝原表未标注', (((typeof RFO_RES !== 'undefined') ? RFO_RES.length : 0)) + ' 只', '海洋节'],
                ['边境（RFF）', '四属性耐性点（火水风地）', '全正数、无负数——越高越抗，没有「软肋」这一说', (((typeof RFF_MON !== 'undefined') ? RFF_MON.length : 0)) + ' 只', 'RFF 节'],
            ], { leftFirst: true, cls: 'txt', colw: ['5.5rem', '9rem', 'auto', '8rem', '6rem'] })}
            <div class="key">一条贯穿六作的提醒：<b>没有任何一作的属性弱点能「通吃」</b>。RF5/RF4 八成以上魔物八项抗性全非负，RF3 近半 Boss 无弱点，海洋只有几只带 ×，RFF 一张负数都没有。<b>本站只呈现数值与记号本身，不推测实际减伤百分比</b>——原表没给换算公式的，一律不推算。</div>

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

            <h2 class="h2">RF1：${(typeof RF1_MON !== 'undefined') ? RF1_MON.length : 0} 只，抗性的读法和上面三作正好相反</h2>
            ${(() => {
                    const M1 = (typeof RF1_MON !== 'undefined') ? RF1_MON : [];
                    if (!M1.length) return '<p class="p">RF1 的数据未加载。</p>';
                    const AX = [[5, '物理'], [6, '火'], [7, '风'], [8, '水'], [9, '地']];
                    const col = i => M1.map(x => x[i]).filter(v => typeof v === 'number');
                    const avg = a => Math.round(a.reduce((p, q) => p + q, 0) / a.length * 10) / 10;
                    /* 每只最脆的那一项：这套数越小越脆，不是「负数＝弱点」 */
                    const soft = {};
                    M1.forEach(x => {
                        let mn = Infinity;
                        AX.forEach(a => { if (x[a[0]] < mn) mn = x[a[0]]; });
                        AX.forEach(a => { if (x[a[0]] === mn) soft[a[1]] = (soft[a[1]] || 0) + 1; });
                    });
                    /* 四属性数值完全一样 = 对火风水地一视同仁 */
                    const flat = M1.filter(x => new Set([x[6], x[7], x[8], x[9]]).size === 1);
                    const attrRows = AX.map(a => {
                        const v = col(a[0]);
                        const full = M1.filter(x => x[a[0]] === 100);
                        return [a[1], Math.min.apply(null, v), avg(v), Math.max.apply(null, v),
                            full.length ? full.length + ' 只（' + full.map(x => x[0]).join('、') + '）' : '0 只',
                        (soft[a[1]] || 0) + ' 只'];
                    });
                    const SX = [[10, '吹飞'], [11, '倒地'], [12, '毒'], [13, '封印'], [14, '麻痹'], [15, '吸收']];
                    const stRows = SX.map(a => {
                        const v = col(a[0]);
                        const lo = Math.min.apply(null, v), hi = Math.max.apply(null, v);
                        const lw = M1.filter(x => x[a[0]] === lo), hw = M1.filter(x => x[a[0]] === hi);
                        return [a[1],
                            v.filter(x => x === 0).length + ' 只',
                            avg(v),
                            lo + '（' + lw.slice(0, 3).map(x => x[0]).join('、') + (lw.length > 3 ? ' 等 ' + lw.length + ' 只' : '') + '）',
                            hi + '（' + hw.slice(0, 3).map(x => x[0]).join('、') + (hw.length > 3 ? ' 等 ' + hw.length + ' 只' : '') + '）'];
                    });
                    const immune3 = M1.filter(x => x[12] === 0 && x[13] === 0 && x[14] === 0);
                    return `
            <p class="p">这一节的数字<b>不能按上面的读法看</b>。RF5／RF4／RF3 给的是系数，负数＝弱点；RF1 给的是<b>减伤值，而且全是正数，一个负数都没有</b>——所以这里的规矩正好反过来：<b>数字越小越脆、越大越抗</b>。照搬「找负数」的读法会得出「RF1 没有弱点」的错结论，实际是「要找最小值」。</p>
            ${stat([['收录', M1.length + ' 只'], ['最脆是物理', (soft['物理'] || 0) + ' 只'], ['四属性等值', flat.length + ' 只'], ['毒封麻全吃', immune3.length + ' 只']])}
            <h3 class="h3">五列抗性：物理是通解</h3>
            <p class="p">五列里<b>物理的平均值最低（${avg(col(5))}），火的平均值最高（${avg(col(6))}）</b>。换句话说，拿无属性的物理武器打，平均而言比任何属性武器都疼。最后一列是「这只魔物身上数值最小的那一项」的统计：</p>
            ${tbl(['抗性项', '最低', '平均', '最高', '满值 100', '成为最脆项'], attrRows,
                    { leftFirst: true, cls: 'txt', colw: ['4.4rem', '3rem', '3rem', '3rem', 'auto'] })}
            <div class="key">两个数字合起来就是结论：<b>${soft['物理'] || 0} 只魔物最脆的那一栏是物理</b>，而且 <b>${M1.filter(x => x[5] < Math.min(x[6], x[7], x[8], x[9])).length} 只的物理抗性比它最脆的属性还要低</b>。再叠上 ${flat.length} 只四属性数值完全相同（${flat.slice(0, 4).map(x => x[0]).join('、')} 等等，对火风水地一视同仁），真正值得为它换属性武器的只剩 <b>${M1.length - flat.length} 只</b>。</div>
            <p class="p">满值 100 的格子全表只有三处：火幽灵的火、鬼火与冰幽灵的水。原表没有给出这套数值与最终伤害的换算公式，本站只呈现数值本身，<b>不把 100 直接说成免疫</b>。</p>
            <h3 class="h3">硬直与异常：能打断，也很好上状态</h3>
            <p class="p">后六项里，<b>吹飞与倒地是硬直</b>（打中后它僵一下），毒／封印／麻痹是异常，吸收是它对这类效果的承受上限。<b>为 0 表示完全不抵抗</b>——想上状态就看这一列：</p>
            ${tbl(['项目', '为 0', '平均', '最低', '最高'], stRows,
                    { leftFirst: true, cls: 'txt', colw: ['3.6rem', '2.8rem', '2.8rem', 'auto', 'auto'] })}
            <div class="key"><b>${immune3.length} 只（占 ${Math.round(immune3.length / M1.length * 100)}%）对毒／封印／麻痹三项全是 0</b>——三种异常随便上，没有任何抵抗。其中<b>封印最宽松</b>（${col(13).filter(x => x === 0).length} 只为 0），<b>毒最难上</b>（为 0 的只有 ${col(12).filter(x => x === 0).length} 只）。这和 RF4／RF5 完全是两个世界：那边两成到一半的敌人直接免疫眩晕，这边四成多的怪三种异常全吃。</div>
            <p class="p">硬直则相反，<b>倒地平均 ${avg(col(11))} 比吹飞 ${avg(col(10))} 难得多</b>：${M1.filter(x => x[11] === 100).length} 只的倒地抗性顶到 100，全是飞行系与幽灵系（浮士德、哈迪斯、风鸟、咕咕鸡、女王蜂、黄蜂、鬼火、鬼魂、火幽灵、冰幽灵…）。吹飞顶到 100 的只有<b>陆龟与小石魔人</b>两只——重量级，推不动。</p>
            <details class="mon-fold">
                <summary>展开 ${M1.length} 只的全部抗性（点一下）</summary>
                <div class="table mon-table"><table><thead><tr>
                    <th class="th left">魔物</th>${AX.concat(SX).map(a => `<th class="th">${a[1]}</th>`).join('')}
                </tr></thead><tbody>${M1.map(x => '<tr>' +
                            '<td class="td left r-n">' + x[0] + '</td>' +
                            AX.concat(SX).map(a => '<td class="td">' + (x[a[0]] == null ? '—' : x[a[0]]) + '</td>').join('') +
                            '</tr>').join('')}</tbody></table></div>
            </details>
            <div class="note">取自 biligame 符文工厂 wiki「符文工厂1魔物数据表」${M1.length} 行，字段为物理／火／风／水／地抗性，加吹飞、倒地、毒、封印、麻痹、吸收六项。<b>译名沿用该 wiki</b>，与魔物图鉴里的汉化定稿名是两套体系（这里的「兽人」＝图鉴里的「野猪战士」），因此不做强行合并。<b>本页呈现的是抗性排序与分布，不是伤害公式</b>——原表没给换算方式，本站不推算实际减伤百分比。</div>`;
                })()}

            ${(() => {
                const RM = (typeof RFF_MON !== 'undefined') ? RFF_MON : [];
                if (!RM.length) return '<p class="p">边境（RFF）的数据未加载。</p>';
                const KEYS = ['火', '水', '风', '地'];
                const elParse = s => {
                    const o = { 火: 0, 水: 0, 风: 0, 地: 0 };
                    if (!s || s === '—') return null;
                    const m = s.match(/^全属性(\d+)$/);
                    if (m) { const v = +m[1]; o.火 = o.水 = o.风 = o.地 = v; return o; }
                    const re = /(火|水|风|地)(\d+)/g; let mm;
                    while ((mm = re.exec(s))) o[mm[1]] = +mm[2];
                    return o;
                };
                const parsed = RM.map(r => {
                    const e = elParse(r[6]);
                    let mx = -Infinity, mxk = [];
                    if (e) KEYS.forEach(k => { if (e[k] > mx) { mx = e[k]; mxk = [k]; } else if (e[k] === mx) mxk.push(k); });
                    const flat = e ? (e.火 === e.水 && e.水 === e.风 && e.风 === e.地) : false;
                    return { name: r[0], lv: r[1], hp: r[2], atk: r[3], def: r[4], e, mx, mxk, flat, loc: r[7] };
                });
                const rffN = parsed.length;
                const rffNoData = parsed.filter(x => !x.e).length;
                const rffHas = rffN - rffNoData;
                const rffFlat = parsed.filter(x => x.flat).length;
                const rffResist = { 火: 0, 水: 0, 风: 0, 地: 0 };
                const rffResistEx = { 火: [], 水: [], 风: [], 地: [] };
                parsed.forEach(x => { if (x.e && !x.flat) { const k = x.mxk[0]; rffResist[k]++; if (rffResistEx[k].length < 6) rffResistEx[k].push(x.name); } });
                const rffResistOrder = KEYS.map(k => ({ k, n: rffResist[k] })).sort((a, b) => b.n - a.n);
                const cell = (k, x) => {
                    if (!x.e) return '<td class="td rv-zero">—</td>';
                    const v = x.e[k];
                    let cls = 'rv-zero';
                    if (v === x.mx && x.mx > 0) cls = 'rv-pos';
                    return '<td class="td ' + cls + '">' + v + '</td>';
                };
                const rffRows = parsed.map(x => '<tr>' +
                    '<td class="td left r-n">' + x.name + '</td>' +
                    '<td class="td">' + x.lv + '</td>' +
                    '<td class="td">' + x.hp + '</td>' +
                    '<td class="td">' + x.atk + '</td>' +
                    '<td class="td">' + x.def + '</td>' +
                    cell('火', x) + cell('水', x) + cell('风', x) + cell('地', x) +
                    '<td class="td r-res">' + (x.e ? (x.flat ? '—' : x.mxk.join('/')) : '—') + '</td>' +
                    '<td class="td left">' + (x.loc || '—') + '</td>' +
                    '</tr>');
                return `
            <h2 class="h2">边境（RFF）：${rffN} 只，四属性耐性点，没有负数是正常的</h2>
            <p class="p">边境比 RF4/RF5 早一代，抗性体系更原始：只有<b>火／水／风／地</b>四属性，而且给的是<b>耐性点数</b>——<b>数值越高越抗，未列出的属性按 0（无特殊耐性）计</b>。这和 RF5/RF4「负数＝弱点」的读法是两码事：边境的表里<b>一个负数都没有</b>，所以这里没有真正的属性弱点，只有「<b>更抗什么</b>」——想打疼就避开它最抗的那一项。</p>
            ${stat([['收录', rffN + ' 只'], ['有元素数据', rffHas + ' 只'], ['四属性等值', rffFlat + ' 只'], ['原表未给(—)', rffNoData + ' 只']])}
            <p class="p">原表只给 ${rffHas} 只标注了元素属性，其余 ${rffNoData} 只记为「—」（未给，不解读为 0 或免疫）。在有数据的 ${rffHas} 只里，先数它们的<b>最抗方向</b>——数值最高那一栏（同高则并列）：</p>
            ${tbl(['最抗(耐性最高)', '只数', '占比', '例子'], rffResistOrder.map(a => [
                    a.k, a.n + ' 只', Math.round(a.n / rffHas * 100) + '%',
                    rffResistEx[a.k].slice(0, 5).join('、') + (rffResistEx[a.k].length > 5 ? ' 等' : '')
                ]), { leftFirst: true, cls: 'txt', colw: ['5rem', 'auto', 'auto', 'auto'] })}
            <div class="key">${rffFlat} 只四属性完全等值（如「全属性9」的瓦格纳、「全属性15」的小小龙），它们<b>没有最抗方向</b>——任何属性武器对它们都是「不减伤」的意义。剩下 ${rffHas - rffFlat} 只各有突出抗性，<b>火</b>与<b>水</b>是最常被拿来当壳的属性（各 ${rffResist['火']}／${rffResist['水']} 只），打这些怪时别带对应属性。</div>
            <details class="mon-fold">
                <summary>展开 ${rffN} 只魔物的四属性耐性（点一下）</summary>
                <div class="table mon-table" data-rff><table><thead><tr>
                    <th class="th left">魔物</th><th class="th">LV</th><th class="th">HP</th><th class="th">攻</th><th class="th">防</th>
                    <th class="th">火</th><th class="th">水</th><th class="th">风</th><th class="th">地</th>
                    <th class="th">最抗</th><th class="th left">出现地点</th>
                </tr></thead><tbody>${rffRows.join('')}</tbody></table></div>
            </details>
            <div class="note">取自 biligame 符文工厂 wiki「RFFmonster」页，${rffN} 行，字段为 等级／HP／攻击／防御／魔法力／元素属性／出现地点／总掉落物／备注。<b>元素属性</b>列原表即如此标注，本站按「耐性点数、越高越抗」解读（与 RF4/RF5 同向）；<b>未列出的属性按 0 计，原表记为「—」的按无数据显示</b>，不擅自解读为免疫或弱点。「二次战」「ED后」「的蛋」等是同一只怪的变体或阶段，原表分行列，此处照录不合并。掉落物与能否驯服见魔物图鉴页。</div>`;
            })()}

            <h2 class="h2">海洋：${(typeof RFO_RES !== 'undefined') ? RFO_RES.length : 0} 只，抗性只有「〇／×／空」三档</h2>
            ${(() => {
                    const RS1 = (typeof RFO_RES !== 'undefined') ? RFO_RES : [];
                    if (!RS1.length) return '<p class="p">海洋的抗性数据未加载。</p>';
                    const AK = [['火', 1], ['水', 2], ['地', 3], ['风', 4], ['光', 5], ['暗', 6]];
                    const DF = [['火', 7], ['水', 8], ['地', 9], ['风', 10], ['光', 11], ['暗', 12]];
                    const SB = [['毒', 13], ['麻痹', 14], ['封印', 15], ['眩晕', 16], ['睡眠', 17], ['疲劳', 18], ['感冒', 19], ['吸血', 20], ['即死', 21]];
                    const cO = i => RS1.filter(r => r[i] === '〇').length;
                    const cX = i => RS1.filter(r => r[i] === '×').length;
                    const defIdx = DF.map(a => a[1]), sbIdx = SB.map(a => a[1]), akIdx = AK.map(a => a[1]);
                    /* 防御侧有 × 的就是有属性弱点的 */
                    const weak1 = RS1.filter(r => defIdx.some(i => r[i] === '×'));
                    const defRows = DF.map(a => [a[0], cO(a[1]) + ' 只', cX(a[1]) + ' 只']);
                    /* 异常：九项里 〇 的个数 */
                    const nOf = r => sbIdx.filter(i => r[i] === '〇').length;
                    const all9 = RS1.filter(r => nOf(r) === 9);
                    const none9 = RS1.filter(r => nOf(r) === 0);
                    const mid = RS1.filter(r => nOf(r) > 0 && nOf(r) < 9);
                    const sbRows = SB.map(a => [a[0], cO(a[1]) + ' 只']);
                    const mkW = v => v === '〇' ? '<span class="mon-yes">〇</span>'
                        : (v === '×' ? '<span class="mon-no">×</span>' : '<span class="mon-f">·</span>');
                    return `
            <p class="p">海洋这份表和前几作<b>不是一个体系</b>：没有数值，只有三种记号——<b>〇＝有这一项、×＝这一项的弱点、空＝原表未标注</b>。它分三块：<b>前六列是它打你带什么属性</b>（决定你穿什么抗性装），<b>中六列是它扛什么属性</b>（决定你拿什么武器），<b>后九列是它会不会中异常</b>。</p>
            ${stat([['收录', RS1.length + ' 只'], ['有属性弱点', weak1.length + ' 只'], ['九种异常全中', all9.length + ' 只'], ['异常全无', none9.length + ' 只']])}
            <h3 class="h3">先说结论：属性武器在这里基本派不上用场</h3>
            <p class="p">${RS1.length} 只里<b>只有 ${weak1.length} 只存在属性弱点</b>，其余 ${RS1.length - weak1.length} 只一个 × 都没有。更关键的是——<b>这 ${weak1.length} 只每只都只有恰好一个弱点，没有一只能被两种属性同时克</b>：</p>
            ${tbl(['防御属性', '〇 有抗性', '× 是弱点'], defRows,
                    { leftFirst: true, cls: 'txt', colw: ['4.4rem', 'auto', 'auto'] })}
            <div class="key">真要挑一把属性武器，只有<b>火（${cX(7)} 只）与水（${cX(8)} 只）</b>值得做，<b>暗是 0</b>——没有一只魔物怕暗。完整名单：${weak1.map(r => r[0] + '（' + DF.filter(a => r[a[1]] === '×').map(a => a[0]).join('') + '）').join('、')}。<b>挑不出来的时候就用无属性</b>，这一作不存在「带对属性就翻倍」的通用解。</div>
            <p class="p">攻击侧的分布也一样扁平：${RS1.filter(r => akIdx.every(i => !r[i])).length} 只<b>不带任何属性</b>（纯物理），${RS1.filter(r => akIdx.filter(i => r[i]).length === 1).length} 只只带一种，带满五种的只有<b>${RS1.filter(r => akIdx.filter(i => r[i]).length === 5).map(r => r[0]).join(' 与 ')}</b>——这两只也是全表攻击手段最杂的，抗性装要按它们配。</p>
            <h3 class="h3">异常是二分设计：要么全吃，要么全免</h3>
            <p class="p">后九列最能说明问题。<b>${all9.length} 只九种异常全中，${none9.length} 只一种都不中，夹在中间的只有 ${mid.length} 只</b>（${mid.filter(r => nOf(r) === 1).length} 只中 1 种、${mid.filter(r => nOf(r) === 2).length} 只中 2 种）。这不是随机分布，是刻意的两分设计：</p>
            ${tbl(['异常', '〇 有效'], sbRows, { leftFirst: true, cls: 'txt', colw: ['4.4rem', 'auto'] })}
            <div class="key">九项各自的「〇」只数都在 ${Math.min.apply(null, SB.map(a => cO(a[1])))}～${Math.max.apply(null, SB.map(a => cO(a[1])))} 之间，<b>差别极小</b>——因为只要能上状态，就是九种一起生效，不存在「只免疫其中两种」的设计。<b>能全上的 ${all9.length} 只名单</b>：${all9.map(r => r[0]).join('、')}。<b>「王」类（哥布林王、摩可摩可王、巨人王、松鼠王、狼王、独角兽王、哥布林队长、大师恶魔）与四只精灵（黄／红／蓝／绿）几乎全在这一档</b>——越像头目，越吃状态。</div>
            <p class="p">中间那 ${mid.length} 只反而是特例，值得单独记：<b>牛头人与牛头人王只中眩晕、三种史莱姆只中睡眠、螳武士与螳护卫只中即死、三只幽灵只中麻痹</b>；小魔术师、小巫术师、女王蜂、黄蜂各中两种。这些是「只有特定打法才成立」的对手。</p>
            <details class="mon-fold">
                <summary>展开 ${RS1.length} 只的属性抗性（攻 6 列 ＋ 防 6 列，点一下）</summary>
                <div class="table mon-table"><table><thead><tr>
                    <th class="th left">魔物</th>${AK.map(a => '<th class="th">攻' + a[0] + '</th>').join('')}${DF.map(a => '<th class="th">防' + a[0] + '</th>').join('')}
                </tr></thead><tbody>${RS1.map(r => '<tr>' +
                            '<td class="td left r-n">' + r[0] + '</td>' +
                            akIdx.concat(defIdx).map(i => '<td class="td">' + mkW(r[i]) + '</td>').join('') +
                            '</tr>').join('')}</tbody></table></div>
            </details>
            <details class="mon-fold">
                <summary>展开 ${RS1.length} 只的九种异常抗性（点一下）</summary>
                <div class="table mon-table"><table><thead><tr>
                    <th class="th left">魔物</th>${SB.map(a => `<th class="th">${a[0]}</th>`).join('')}
                </tr></thead><tbody>${RS1.map(r => '<tr>' +
                            '<td class="td left r-n">' + r[0] + '</td>' +
                            sbIdx.map(i => '<td class="td">' + mkW(r[i]) + '</td>').join('') +
                            '</tr>').join('')}</tbody></table></div>
            </details>
            <div class="note">取自 biligame 符文工厂 wiki「RFOmonster」页的抗性块，${RS1.length} 行。<b>空着的格子是原表未标注</b>，不是本站漏填——本页按「无此抗性或未收录」显示成「·」，<b>不擅自解读为免疫</b>。属性与异常的实际效果强度（减伤多少／持续几秒）这份表完全没有，本站不补。</div>`;
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
        key: 'rfotip', group: 'basic', title: '攻略本技巧', icon: 'star',
        gms: ['rfo'],
        body: () => rfotipHtml()
    },
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
            <p class="p">本站一共 <b>七份</b> 可核实的 BOSS 表，合计 <b>${n1 + n2 + n3 + no + n4 + B.rf5.length + nrff} 位</b>——RF1 ${n1} 位、RF2 ${n2} 位、RF3 ${n3} 位、海洋 ${no} 条（含圆形竞技场两轮同名的复战）、四代 ${n4} 位、五代 ${B.rf5.length} 位、边境 ${nrff} 位。<b>七份表覆盖九部作品</b>：3 特别版与 4 豪华版<b>没有新增任何 BOSS</b>，按官方公布的新增要素清单，两作各自沿用原作名单，所以不另立表——但<b>难度会改数值</b>，两作新增的「地狱」模式都让表里这些数字不再准确，各节开头单独讲。四代此前在 wiki 上没有集中的 BOSS 数值页，本次补齐主线 BOSS 表（数值取自 fandom 怪物数值表 + GameFAQs 主线流程，部分线上无源的 BOSS 留空标「待补」），抗性明细仍同步放在「战斗与弱点」页看。</p>
            <div class="note">数值全部取自各作 BOSS 页（RF1/RF2/RF3/五代/边境来自 biligame，四代来自 fandom + GameFAQs），<b>表里没有的列本页不填、不推算</b>；除特别说明外，各表数值对应的是<b>普通难度</b>——两个特别版新增的「地狱」模式会另行放大，见各节。这七份表对「属性」的记录方式根本不是一套量纲——一代/边境/海洋是点数、二代是克制、三代是等级、四代/五代是百分比系数——跨作比数值没有意义，最后一节单独讲这件事。</div>`;

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

            /* ---------- RF3 特别版：名单沿用三代，但地狱难度会改数值 ----------
               SP 已并入 RF3 一条作品页，这一节跟着挂在三代 BOSS 表后面，不再单开作品 */
            const blk3sp = () => `
            <h2 class="h2">3 特别版（2023 重制）：名单不变，变的是难度</h2>
            <p class="p">3 特别版是三代的重制版。官方公布的新增要素一共这些：<b>HD 画面与重新制作的 3D 模组、新开场动画与新 BGM、新婚模式（与 Live2D 合作的动态立绘）、地狱难度、主角生日可自定、双屏合一与 ZL／ZR 快捷键、连续收获与跳过调和动画、泳装模式</b>——<b>没有任何一项是新增 BOSS</b>。所以上一节那张表在特别版里可以照着用，这里不另列第二遍。</p>
            <p class="p">真正会变的是<b>难度</b>。特别版在普通／困难之上又加了<b>地狱</b>，三档的差别是公开的：</p>
            ${tbl(['难度', '魔物 HP', '你受到的伤害', '你打出的伤害'], [
                ['普通', '基准', '基准', '基准'],
                ['困难', '<b>1.5 倍</b>', '基准', '基准'],
                ['地狱', '<b>1.7 倍</b>', '<b>120%</b>', '<b>75%</b>'],
            ], { leftFirst: true, cls: 'txt', colw: ['4.6rem', 'auto', 'auto', 'auto'] })}
            <div class="key">地狱模式这三项是<b>叠着来的</b>：BOSS 血多七成、打你疼两成、你打它还少四分之一——实际体感远不止「多了 70% 血」。表里这些数值是<b>普通难度的基准</b>，开地狱请自己按这三项折算，本页<b>不替你算好填进表里</b>。</div>
            <p class="p">难度也不是开局选完就锁死的：特别版里<b>在地下室翻那本书就能切换</b>，随时可以调回来——这一条在玩家整理的新增要素说明里写明了。</p>
            <h3 class="h3">希雅蕾斯迷宫少了联机，没少内容</h3>
            <p class="p">希雅蕾斯迷宫（家里地下室左边那道门）在三代就能<b>单人进</b>，特别版保留了单人模式，<b>删掉的只是联机多人入口</b>与联网排行榜。所以上面这批 BOSS 在特别版里照样能单机打到，不必找人联机；只是少了「时间暂停、把村民当角色用」那套联机专属的玩法。</p>
            <div class="note">三档倍率取自官方与中文／日文玩家整理的新增要素说明：<b>「1.5 倍／1.7 倍」是魔物体力的倍率</b>。本站没有困难／地狱下逐只 BOSS 的实测数值，因此不在表里另开一列、也不按倍率推算。</div>`;

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

            /* ---------- RF4 豪华版：名单沿用四代，地狱难度改等级、改伤害、还改招式 ----------
               SP 已并入 RF4 一条作品页，这一节跟着挂在四代 BOSS 表后面，不再单开作品 */
            const blk4sp = () => `
            <h2 class="h2">4 豪华版（2019 重制）：名单不变，难度与招式会变</h2>
            <p class="p">4 豪华版官方公布的新增要素一共五项：<b>HD 画面、首次加入日语语音的双语音、新婚模式、Another Episode（12 段，每位结婚候补一段）、地狱难度</b>——<b>没有新增 BOSS</b>。上一节那张表的名单在豪华版里同样成立，这里不另列第二遍。</p>
            <p class="p">四档难度的差异由玩家长期实测比对整理而来，官方只笼统一句「敌人强横到你可能被送回起始之森」：</p>
            ${tbl(['难度', '敌人等级', '敌人的 AI 与攻击性', '伤害修正'], [
                ['简单', '基础等级', '<b>降低</b>', '你受到的伤害约 <b>−40%</b>'],
                ['普通', '基础等级', '基础', '无'],
                ['困难', '<b>按区域提升数级</b>', '<b>提升</b>', '无（但毒的跳伤可以致死）'],
                ['地狱', '同困难', '同困难', '你打出的 <b>−25%</b>；你受到的 <b>+25%</b>'],
            ], { leftFirst: true, cls: 'txt', colw: ['4.4rem', 'auto', 'auto', 'auto'] })}
            <div class="key">困难那档的等级提升<b>不是全游戏一个数字</b>，而是按区域各不相同：玩家实测的例子是<b>约克米尔之森 +2 级、水之遗迹 +4 级、雷昂・卡纳克 +15 级</b>——越到后期加得越狠。表里这 ${n4} 位的 Lv 是<b>基础等级</b>，困难／地狱下的实际等级<b>没有公开的完整清单，本页不填</b>。</div>
            <h3 class="h3">地狱还会改 BOSS 的招式</h3>
            <p class="p">这一条比数值更要命：有玩家报告<b>部分 BOSS 在困难／地狱下的招式不是同一套</b>。最明确的例子是<b>安布洛希亚的音波</b>——普通难度下范围大约跟睡眠粉尘相当、且不吸血；地狱难度下<b>范围扩到大半个战场，还带吸血</b>。同样的现象在<b>雷电</b>与<b>霸王花</b>上也有报告。</p>
            <div class="key">所以豪华版打地狱，<b>拿普通难度的走位经验去套会吃亏</b>：同一个招式，判定范围和附带效果可能都变了。上面这张表的 Lv／HP／攻防只保证在普通难度下成立。</div>
            <div class="note">难度差异与招式变化取自 GameFAQs 上 RF4S 难度讨论帖中多位玩家的实测与比对，<b>不是官方公布的数据</b>——官方 what's new 页对地狱难度只有一句宣传语。本站没有地狱难度下逐只 BOSS 的实测数值，不另开列、不推算。Another Episode 是付费／随版本附带的剧情 DLC，<b>内容是 12 段语音短剧，不含战斗</b>，与本节无关。</div>`;

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
                    ['RF3（含 3 特别版）', '抗性等级（−2 ～ 4）', '−2 受伤 3 倍、−1 受伤 1.5 倍、1 级减半、2 级减 7/8、3 级免疫、4 级回血'],
                    ['RF4（含 4 豪华版）/ RF5', '百分比系数', '负数弱、正数抗，绝对值越大越极端（明细见「战斗与弱点」）'],
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

            const per = { rf1: blk1, rf2: blk2, rf3: () => blk3() + blk3sp(), rfo: blkR, rf4: () => blk4() + blk4sp(), rf5: blk5, rff: blkRff };
            const mid = (per[id] || blk1)();
            return intro + mid + tail;
        }
    },
    {
        key: 'farm', group: 'life', title: '农场与田地', icon: 'sprout',
        body: (g) => farmDeepHtml(g && g.id) || (`
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
        `)
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
        body: g => `
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
            ${g.id === 'azuma' ? shopAzumaHtml()
            : g.id === 'rf2' ? shopRf2Html()
            : g.id === 'rf3' ? shopRf3Html()
            : g.id === 'rf1' ? shopRf1Html()
            : g.id === 'rf5' ? shopRf5Html()
            : g.id === 'rf4' ? shopRf4Html()
            : g.id === 'rff' ? shopRffHtml()
            : g.id === 'rfo' ? shopRfoHtml() : ''}
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
            ${g.id === 'azuma' ? cropAzumaHtml()
            : g.id.indexOf('rf1') === 0 ? crop1Html()
                : g.id.indexOf('rf2') === 0 ? crop2Html()
                    : g.id.indexOf('rf3') === 0 ? crop3Html()
                        : g.id.indexOf('rf5') === 0 ? crop5Html()
                            : g.id.indexOf('rf4') === 0 ? crop4Html()
                                : g.id === 'rfo' ? cropRfoHtml()
                                    : g.id === 'rff' ? cropRffHtml()
                                        : ''}
        `
    },
    {
        key: 'beast', group: 'life', title: '魔物与伙伴', icon: 'monster',
        body: g => {
            if (g && g.id === 'azuma') return azumaBeastHtml();
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

            /* ---------- 龙之天地：本作没有七作那张数值图鉴，只留门牌 ---------- */
            const blockAz = () => {
                const M = (typeof AZUMA_MON !== 'undefined') ? AZUMA_MON : [];
                const C = (typeof AZUMA_BOSS_CAP !== 'undefined') ? AZUMA_BOSS_CAP : [];
                const N = (typeof AZUMA_BOSS_MAIN !== 'undefined') ? AZUMA_BOSS_MAIN : [];
                const ride = M.filter(x => x[1] === '能');
                return `
            <p class="p">龙之天地是动作 RPG ＋ 村庄建设，<b>没有七作那张数值图鉴</b>——等级、HP、双攻双防、EXP、属性与状态抗性这一整套，本作既没有官方公开表，也没有能逐只对上的攻略本。本站能核实的是三份名单：<b>${M.length} 只魔物</b>（出现区域＋最爱／喜欢／讨厌物品＋能否骑乘）、<b>${C.length} 只可捕获 BOSS</b>（武器弱点／属性弱点／体型／最爱）、<b>${N.length} 场主线 BOSS</b>（等级与弱点）。</p>
            ${stat([['收录魔物', M.length + ' 只'], ['可骑乘', ride.length + ' 只'], ['不可骑乘', (M.length - ride.length) + ' 只']])}
            <div class="key">本作的魔物明细不挂在这一页：区域与喜好道具在<a class="link" href="#/page/azuma_mon">魔物与喜好</a>，可捕与主线 BOSS 的弱点在<a class="link" href="#/page/azuma_boss">BOSS 战</a>。这一页只留门牌，免得你按七作的列名来找一张本作并不存在的表。</div>
            <div class="note">为什么不套七作的模板：那张表的核心列（等级／HP／抗性）在本作缺失，而本作的「骑乘」这一维度七作又没有。硬套的结果只有两种——满屏「—」，或者把七作的抗性数值当成通用规律读；两种都比不写更糟。</div>`;
            };

            const rfoM = (typeof RFO_MON !== 'undefined') ? RFO_MON : [];
            const cnt = id === 'rf5' ? mon5.length
                : /^rf4/.test(id) ? new Set(m4.map(x => x[0])).size
                    : id === 'rf1' ? m1.length
                        : id === 'rf2' ? m2.length
                            : /^rf3/.test(id) ? m3.length
                                : id === 'rff' ? (rfm.length || mf.length)
                                    : id === 'rfo' ? rfoM.length
                                        : id === 'azuma' ? ((typeof AZUMA_MON !== 'undefined') ? AZUMA_MON.length : 0)
                                            : mro.length;
            const title = id === 'rf5' ? 'RF5' : (id === 'rfo' ? 'RFO'
                : (/^rf4/.test(id) ? 'RF4' : (id === 'rf1' ? 'RF1'
                    : (id === 'rf2' ? 'RF2' : (/^rf3/.test(id) ? 'RF3'
                        : (id === 'rff' ? 'RFF' : (id === 'azuma' ? '龙之天地' : '')))))));
            const bodyText = id === 'rf5' ? block5()
                : /^rf4/.test(id) ? block4()
                    : id === 'rf1' ? block1()
                        : id === 'rf2' ? block2()
                            : /^rf3/.test(id) ? block3()
                                : id === 'rff' ? blockF()
                                    : id === 'rfo' ? blockR()
                                    : id === 'azuma' ? blockAz()
                                        : blockNone();

            return `
            <h2 class="h2">「图鉴」在符文工房里指的是伙伴名录</h2>
            ${id === 'azuma'
                ? '<p class="p">前七作能收进牧场的魔物就是这份表的主角——奶、蛋、毛、蜜全靠它们产出。龙之天地没有牧场，魔物收服之后是<b>坐骑与同行战力</b>，所以本页只报名单与数量，明细拆到「魔物与喜好」「BOSS 战」两页看。</p>'
                : '<p class="p">系列里能收进牧场的魔物，才是这份表的主角——奶、蛋、毛、蜜全靠它们产出。怎么收服、怎么照料，在<a class="link" href="#/page/beast">魔物与伙伴</a>那一页；这边查具体是哪一只、它能给你什么。</p>'}
            ${title ? `<h2 class="h2">${title}：${cnt} 种魔物</h2>` : ''}
            ${bodyText}
            <div class="note">数据取自各作解包表与攻略本：RF5、RF4 来自数据解包汉化版，RF3 来自《符文工房3全攻略》（NW 旅团整理），RFO 的怪日表来自《符文工厂海洋（最强攻略）》，等级／HP／双攻双防／EXP／属性与状态抗性／掉落概率／农作物／生产物来自 biligame 符文工厂 wiki，RF1 的个体名单来自全资料整合的洞窟怪物表，种族与特技来自初代汉化文本表，战斗数值与全套抗性来自 biligame 符文工厂 wiki；RFF（边境）的等级／HP／双防／魔法力／元素属性／出没地点／掉落物来自 biligame 符文工厂 wiki。解包表把掉落那一列写作「喜好道具」，但内容与掉率表逐项对得上，本站按实质改称<b>掉落道具</b>。${id === 'azuma' ? '龙之天地的魔物名单取自中文攻略站 gametoeasy.com《魔物喜好表》，可捕 BOSS 取自 biligame 中文 wiki 可捕表与 gametoeasy《BOSS 抓捕攻略》，主线 BOSS 取自 game8／neoseeker。' : ''}</div>
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
                    <div class="jp-s">${(g && g.id !== 'rf5') ? '本作的配方与所需素材' : 'RF5 全部 661 条配方：技能等级与所需素材'}</div>
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
            ${(g && /^rf3/.test(g.id)) ? craftRf3Html() : ''}
            ${(g && /^rf4/.test(g.id)) ? craftRf4Html() : ''}
            ${(g && g.id === 'rfo') ? rfoCraftHtml() : ''}
            ${(g && g.id === 'rff') ? craftRffHtml() : ''}
            ${(g && g.id === 'rf2') ? craftRf2Html() : ''}
            ${(g && g.id === 'rf1') ? craftRf1Html() : ''}
            ${(g && g.id === 'azuma') ? craftAzumaHtml() : ''}
            ${(!g) ? `<p class="p">量产和「做一件毕业的」是两件事。前者看配方表，后者看强化顺序——<b>倍铁怎么排位置，比用什么配方更决定成败</b>，那套算法单独放在了装备打造那一页。</p>` : ''}
            ${(g && g.id === 'rf5') ? craftRf5Html() : ''}
            <div class="jump">
                <a href="#/page/recipe">
                    <div class="jp-t">配方大全</div>
                    <div class="jp-s">${(g && g.id !== 'rf5') ? '本作的配方：武器、防具、饰品、药学' : 'RF5 全部 661 条配方：武器、防具、饰品、药学'}</div>
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
        gms: ['rf1', 'rf2', 'rf3', 'rff', 'rfo', 'rf4', 'rf5'],
        body: g => {
            if (g.id !== 'rf5') return gearBestHtml(g);
            return `
            <h2 class="h2">「毕业套」不是一把更强的武器</h2>
            <p class="p">终端装备的面板能到配方表上限的好几倍，靠的不是更好的配方，而是<b>把强化栏填满、并且让每一格的效果都乘到最大</b>。这套算法只在 RF5 的终盘成立，理解了这条链，你自己也能算出来。</p>
            <div class="note">这一页<b>只写《符文工房5》</b>：倍率铁这套算法是五代特有的。其他作品的毕业配装在同一个条目下各有各的一页，素材与数值都不同，不做跨作套用。</div>

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
        `;
        }
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
    {
        key: 'rfosys', group: 'life', title: '奖杯与许愿', icon: 'note',
        gms: ['rfo'],
        body: () => rfoSysHtml()
    },

    /* ================= 活动事件 ================= */
    {
        key: 'festival', group: 'event', title: '年度节日', icon: 'calendar',
        body: g => `
            ${(g && g.id === 'azuma') ? `<div class="note" style="border-left-width:3px">你当前在<b>龙之天地</b>名下打开这一页，但本页收的是<b>前七作</b>的日程——RF1、RF2、RF3、RF4、边境、海洋、RF5 各一节，<b>没有龙之天地</b>。原因很具体：本作的节庆挂在四季村落与「大地舞者」的祭祀上，日程在版本更新里改过，本站手上没有能逐条核对的完整表。拿七作的日历凑一节出来，日期全是错的，所以宁可空着。<br>本作能查的相邻内容：<a class="link" href="#/page/request">委托任务</a>（东国六条线 37 条记录）、<a class="link" href="#/page/azuma_npc">角色详情</a>（含各自生日）。</div>` : ''}
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
            ${stat([['花嫁候补', g.candF ? g.candF + ' 位' : '见居民页'], ['花婿候补', g.candM ? g.candM + ' 位' : '见居民页'], ['同性婚', (g.id === 'rf5' || g.id === 'azuma') ? '可选' : (g.id === 'rf4' ? '豪华版可选' : '视版本')]])}
            ${g.id === 'rfo' ? `<div class="note"><b>海洋的候补是成对算的</b>：花嫁 10 位里包括索妮娅（灵魂与主角共处一室的青梅竹马），花婿 4 位里包括亚赛尔——通关后可以选择以索妮娅的身份继续，这时亚赛尔就变成对象。所以两边都各含主角之一，合计 14 位，名单与分组照攻略本「喜好」表原样。</div>` : ''}
            <div class="key">送礼的正确做法：<b>先找出「最喜欢」的那一件，而不是每天换着花样送</b>。同一件最爱的礼物每天送，好感增长远高于随机送五件普通礼物。</div>
            <h2 class="h2">生日</h2>
            <p class="p">每位居民都有固定生日。生日当天送礼，好感加成显著。把「本周谁过生日」写进日程，比每天盲送效率高得多——本站「提醒」页就是为此做的。</p>
        `
    },
    {
        key: 'newly', group: 'event', title: '新婚模式', icon: 'star',
        gms: ['rf3', 'rf4'],
        body: g => (g.id === 'rf3' ? newlywedRf3(g) : newlywedRf4(g))
    },
    {
        key: 'request', group: 'event', title: '委托任务', icon: 'board',
        body: (g) => {
            /* 龙之天地有六篇专属的东国任务（post/1831–1836），走专用分支，
               不再套下面这段七作通用的委托机制说明 */
            if (g && g.id === 'azuma') return requestAzumaHtml();
            /* 海洋的委托表在《符文工厂海洋（最强攻略）》xls 里是完整的 188 条，单独分支 */
            if (g && g.id === 'rfo') return requestRfoHtml();
            /* 边境没有依赖板，委托走邮件 + 角色事件链，单独说明 */
            if (g && g.id === 'rff') return requestRffHtml();
            /* 二代没有任务板，委托挂在人身上；两套攻略源拼成一张表，单独一页 */
            if (g && g.id === 'rf2') return requestRf2Html();
            /* 四代的委托在门口委托箱里，源站按「报酬去向」分成三张子表，单独一页 */
            if (g && g.id === 'rf4') return requestRf4Html();
            /* 三代的委托挂在村民身上，三条入线（布告栏／邮箱／猫头鹰），另有一张 280 条大表 */
            if (g && g.id === 'rf3') return requestRf3Html();
            /* 五代的委托是一根长链，解锁列基本都写着「完成上一条」，源站是单表 173 条 */
            if (g && g.id === 'rf5') return requestRf5Html();
            /* 一代没有委托板，任务以支线剧情形式存在，源站是 8 条支线的分步流程 */
            if (g && g.id === 'rf1') return requestRf1Html();
            return `
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
        `;
        }
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
                        if (id === 'azuma' && typeof AZUMA_FORGE !== 'undefined') { const h = weaponAzumaHtml(); if (h) return h; }
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
            ${id === 'rfo' ? rfoStyleHtml() : ''}
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
                        if (id === 'rfo' && typeof RFO_ITEMS !== 'undefined') { const h = rfoArmorHtml(); if (h) return h; }
                        if (id === 'azuma' && typeof AZUMA_ARMOR !== 'undefined') { const h = azumaArmorHtml(); if (h) return h; }
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
        gms: ['rf4', 'rf5'],
        body: g => {
            /* 5 代这一栏在源站是魔物抗性三张表（属性／异常／暴击眩晕吹飞），
               与 4 代那套装备隐藏数值不是一套，分头渲染。
               4 代一页出两套：先装备面板，后魔物与村民（源条目挂豪华版名下）。 */
            if (g && g.id === 'rf5') return fx5Html(g);
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
            </div>
            <h2 class="h2">换一侧：魔物与村民的抗性</h2>
            ${fx4sHtml(g)}`;
        }
    },
    {
        key: 'rune', group: 'item', title: '符文能力', icon: 'bolt',
        gms: ['rf1', 'rf2', 'rf3', 'rf4', 'rf5', 'rfo'],
        body: (g) => {
            /* 四代（本体／豪华版合并为一条作品页）是同一张「地点×出处」表，另有带筛选的专属版式；其余五作走通用版式 */
            if (!g || g.id !== 'rf4') return runeAllHtml(g);
            const D = (typeof RUNE_RF4 !== 'undefined') ? RUNE_RF4 : [];
            const id = (g && g.id) || 'rf4';
            const nm = (g && g.name) || '符文工房4';
            if (!D.length) return `<p class="p">这一作暂时没有符文能力的获取数据。</p>`;
            const abil = D.filter(x => x[2] === '符文能力');
            const magic = D.filter(x => x[2] === '魔法');
            const lvd = D.filter(x => x[4]);
            const byCat = c => D.filter(x => x[2] === c).map(x => x[3]).join('、');
            const rows = D.map(x => {
                const key = x[2] + ' ' + x[3] + ' ' + x[1] + ' ' + x[0] + ' ' + x[4];
                return [key, [x[2], x[3], x[1], (x[0] || '—'), (x[4] || '—')]];
            });
            return `
            <p class="p"><b>${nm}</b>的武器有<b>符文槽</b>：打怪、开宝箱捡到的<b>符文能力</b>可以装到武器上，给普攻附加效果（横扫、升龙、一心一刀这类）；另一类是<b>符文魔法</b>（螺旋石锥、彗星暴雨、大治愈……），来自魔法书，能<b>升级 Lv</b>而符文能力不能。下面这张表是<b>去哪拿每一个</b>——按地点与出处排好，找某个符文前先查这里。</p>
            ${stat([['符文能力', abil.length + ' 个'], ['符文魔法', magic.length + ' 个'], ['合计', D.length + ' 个'], ['需 Lv 才能用', lvd.length + ' 个']])}

            <h2 class="h2">两类不是一回事</h2>
            <p class="p"><b>符文能力</b>装在武器符文槽上，是被动／主动的攻击附加效果，<b>不能升级</b>——高 Lv 的只能靠随机掉落碰运气。<b>符文魔法</b>来自魔法书，可以拿给雷欧（手持魔法递给他）逐 Lv 强化：Lv2 500G、Lv3 3000G、Lv4 粉宝石、Lv5 白金、Lv6 奥利哈钢、Lv7 芜菁的奇迹、Lv8 龙幻石、Lv9 符文结晶、Lv10 小结晶。两者都走「地图上找」这条路，下面一并列出。</p>
            <div class="key">升级加的是<b>固定伤害</b>不是百分比威力：彗星暴雨攻击力 52，Lv1 倍率 1、Lv10 倍率 30.5，基础伤害 1000 时 Lv10 是 1000+1586。所以魔法攻击越高，Lv10 的固定加成收益反而越小；火／水／风／地这类属性技能加的是对应属性伤害，对固定伤害同样有效。</div>

            <h2 class="h2">全部 ${D.length} 个：去哪拿</h2>
            <p class="p">按「类别 → 名字」排。出处一栏是<b>宝箱</b>或<b>特殊事件</b>（少数要解谜，如双子岩 8 字绕圈）。参数一栏写 <b>Lv2／Lv3</b> 的是该能力本身有等级门槛，多数写「—」表示装上即用。地点为空「—」的，出处栏里通常已写明区域。</p>
            <div class="table rune">
            ${ftableOwn(['类别', '名字', '出处', '地点', '参数'],
                ['3.6rem', '8rem', '4rem', 'auto', '3rem'],
                rows, {
                    ph: '输入符文名／类别／地点／出处筛选',
                    cls: 'rune',
                    note: `<div class="note">源表（biligame 符文工厂 wiki「RF4runeability」）只给<b>获取地点与出处</b>，<b>不写每个符文能力／魔法的具体效果</b>——想看「横扫千军到底造成什么」，源页没有，本页不编。4 代与 4 豪华版共用同一张本体获取表，本站只有这一份，两版同页显示。<b>五代不是这一套</b>：五代的符文是「宝箱／透明宝箱／任务／通缉／商店」的获取表，没有地点分列，切到「符文工房5」看它自己那一版。</div>`
                })}
            </div>
            <h2 class="h2">两类各有哪些</h2>
            <p class="p">先按类别认全貌，再回上面的表查地点。</p>
            ${tbl(['类别', '全部名字'], [
                ['符文能力（' + abil.length + '）', byCat('符文能力')],
                ['符文魔法（' + magic.length + '）', byCat('魔法')],
            ], { leftFirst: true, cls: 'txt', colw: ['8rem', 'auto'] })}
            <div class="jump">
                <a href="#/page/fx">
                    <div class="jp-t">状态与抗性</div>
                    <div class="jp-s">RF4 装备面板上看不到的隐藏数值</div>
                </a>
                <a href="#/page/weapon">
                    <div class="jp-t">武器</div>
                    <div class="jp-s">全武器攻击、魔攻与属性一览</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'tool', group: 'item', title: '农具', icon: 'hoe',
        body: (g) => {
            const id = (g && g.id) || 'rf5';
            const is4 = /^rf4/.test(id);
                        if (id === 'rfo' && typeof RFO_ITEMS !== 'undefined') { const h = rfoToolHtml(); if (h) return h; }
                        if (id === 'azuma' && typeof AZUMA_FORGE !== 'undefined') { const h = toolAzumaHtml(); if (h) return h; }
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
                        if (id === 'rfo' && typeof RFO_ITEMS !== 'undefined') { const h = rfoMatHtml(); if (h) return h; }
                        if (id === 'azuma' && typeof AZUMA_FORGE !== 'undefined') { const h = matAzumaHtml(); if (h) return h; }
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
                        if (id === 'rfo' && typeof RFO_ITEMS !== 'undefined') { const h = rfoFoodHtml(); if (h) return h; }
                        if (id === 'azuma' && typeof AZUMA_FORGE !== 'undefined') { const h = foodAzumaHtml(); if (h) return h; }
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
                        if (id === 'azuma' && typeof AZUMA_ARMOR !== 'undefined') { const h = azumaPotionHtml(); if (h) return h; }
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
        gms: ['rf3'],
        body: (g) => {
            const IT = (typeof ITEM_RF3 !== 'undefined') ? ITEM_RF3 : [];
            const EQ = eqblock(IT, { colw: '7rem', alias: (typeof rf3GoodsAlias === 'function') ? rf3GoodsAlias() : null });
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
            <div class="note">取自《符文工房3》解包文本：名字表（rf3Archive-7721）与说明表（rf3Archive-7722）<b>各 888 条记录</b>，按<b>同一条记录的序号</b>一一对应。首条「(無し)」是空位、第 722 条「未使用フレンド」是未使用数据，这两条剔除，其余 <b>886 条全收</b>（2026-11-02 补齐此前漏掉的 19 条：「超级失败之作」「龙之牙」「光／暗／爱之结晶」「会唱歌的小瓶子」「杰克南瓜的种子」等）。<br><b>说明列在 2026-11-02 重配过</b>：此前那版从第 83 条（石川鲑鱼生鱼片）起整体错位一条，783 条说明对错了名字——比如「阔剑」底下写的是配方面包的做法、「芜菁种子」底下写的是靴子的说明。现在按记录序号配回去，每一类都前后抽检过。<br>分类不是游戏给的，是<b>按解包表里的排列顺序</b>切出来的：作物一段、草一段、刺身一段、料理一段、武器一段……同一段内的物品性质一致，边界很清楚。<br>搜索框除了中文名与说明，还收了<b>日文原名</b>（来自下面那份极击网出货清单，能对上的 ${(typeof RF3_GOODS !== 'undefined') ? RF3_GOODS.rows.filter(r => r[5]).length : 0} 条），玩日版的可以按原文搜。</div>
            ${(typeof rf3GoodsHtml === 'function') ? rf3GoodsHtml() : ''}
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
        gms: ['rf1', 'rf2', 'rf3', 'rf4', 'rf5', 'rff', 'rfo'],
        body: g => {
            if (g.id === 'rf3') return giftRf3Html();
            /* 旧四作没有「投喂喜好物」这套：收服靠抚摸／刷毛固定次数（RFO 另有喜好作物） */
            if (g.id === 'rf1' || g.id === 'rf2' || g.id === 'rff' || g.id === 'rfo') return giftOldHtml(g);
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

    /* ================= 宠物产出（派它干什么，它给你什么） ================= */
    {
        key: 'produce', group: 'life', title: '宠物产出', icon: 'pot',
        gms: ['rf1', 'rf2', 'rf3', 'rff', 'rfo'],
        body: g => {
            if (g.id === 'rf1' || g.id === 'rf2' || g.id === 'rf3' || g.id === 'rff' || g.id === 'rfo') return produceHtml(g);
            return `<p class="p">这一作暂时没有「派魔物干活／收产物」的表。</p>
            <div class="note">源站给得出产出表的有五作：初代（<code>RF1petfarm</code> 32 只魔物工作表）、RF2（<code>RF2pet</code> 的宠物生产＋宠物工作表）、RF3（<code>RF3farm</code> 90 只的工作＋农活等级）、边境（<code>RFFpet</code> 生产概率＋工作范围＋生蛋）、海洋（<code>RFOpet</code> 的魔物生产物列表）。RF5 的「同伴怪物生产道具一览」是一张残页（只有七行散句加一句「待补充」、没有完整表），所以这一作本页留空，去<a class="link" href="#/page/beast">魔物与伙伴</a>看收服流程。</div>`;
        }
    },

    /* ================= 村民喜好（人，不是魔物） ================= */
    {
        key: 'npcgift', group: 'life', title: '村民喜好', icon: 'users',
        gms: ['rf1', 'rf2', 'rf3', 'rff', 'rfo', 'rf4', 'rf5', 'azuma'],
        body: g => {
            if (g.id === 'azuma') return giftPage(g, (typeof AZUMA_GIFT !== 'undefined') ? AZUMA_GIFT : []);
            if (g.id === 'rf1' || g.id === 'rf2') return giftRf12Html(g);
            if (g.id !== 'rf4' && g.id !== 'rf5') return giftPage(g);
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
        gms: ['rf1', 'rf2', 'rff', 'rfo', 'rf3', 'rf4', 'rf5', 'azuma'],
        body: g => {
            if (g.id === 'rf1' || g.id === 'rf2') return sourceRf12Html(g);
            if (g.id === 'azuma') return sourceAzumaHtml();
            if (g.id === 'rff') return sourceRffHtml();
            if (g.id === 'rfo') return sourceRfoHtml();
            if (g.id === 'rf3') return sourceRf3Html();
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
        gms: ['rf3'],
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
        gms: ['rf1', 'rf2', 'rff', 'rfo', 'rf3', 'rf4', 'rf5', 'azuma'],
        body: g => {
            if (g.id === 'rf1' || g.id === 'rf2') return recipeRf12Html(g);
            if (g.id === 'rff') return recipeRffHtml();
            if (g.id === 'rfo') return recipeRfoHtml();
            if (g.id === 'azuma') return recipeAzumaHtml();
            /* RF3 与 RF3SP 共用一份配方表（特别版没改锻造/药学体系），不各列一遍 */
            if (/^rf3/.test(g.id)) return recipeRf3Html();
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
            /* 龙之天地另起一套鱼表，分支写最前：漏过去就会落进 RF4／RF5 的通用表 */
            if (g.id === 'azuma') return fishAzumaHtml();
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

            /* 数字现场算，别写死：钓点表补过数据后这里会自动跟上 */
            /* 数字现场算，别写死：海洋那份换成了攻略本「鱼群」实测表（无概率） */
            const rfoSpotStat = (() => {
                const R = (typeof RFO_FISH_SPOT !== 'undefined') ? RFO_FISH_SPOT : [];
                const I = new Set(R.map(r => r[0]));
                const L = new Set(R.map(r => r[0] + '|' + r[1] + '|' + r[2]));
                const F = new Set(); R.forEach(r => (r[4] || []).forEach(f => F.add(f[0])));
                return { isle: I.size, loc: L.size, fish: F.size, rec: R.length };
            })();
            const rfoFishNote = (g && g.id === 'rfo')
                ? `<div class="note"><b>海洋（RFO）</b>的鱼类尺寸与金杯线暂缺可靠来源，本页下方 RF4／RF5 鱼表仅作通用机制参考。海洋自己那份<b>岛 × 地点 × 时段 × 鱼种</b>的实测记录在 <a href="#/page/fishspot">钓点与季节</a> 页（${rfoSpotStat.rec} 条记录、${rfoSpotStat.isle} 处岛与海面、${rfoSpotStat.fish} 种鱼）。<b>那份表没有概率</b>——它是玩家钓出来的「这里有什么」，不是解包权重，别拿它当掉率用。</div>`
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
        gms: ['rf1', 'rf2', 'rf3', 'rf4', 'rf5', 'rfo', 'rff', 'azuma'],
        body: g => {
            if (g.id === 'azuma') return fishspotAzumaHtml();
            if (g.id === 'rf3') return fishspotRf3Html();
            if (g.id === 'rfo') return fishspotRfoHtml();
            if (g.id === 'rf1' || g.id === 'rf2' || g.id === 'rff') return fishspotRf12fHtml(g);
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
        key: 'seriescmp', group: 'lore', title: '跨作机制对照', icon: 'compass',
        body: () => seriesCmpHtml()
    },
    {
        key: 'bdcheck', group: 'life', title: '生日核对', icon: 'users',
        body: () => bdCheckHtml()
    },
    {
        key: 'changelog', group: 'lore', title: '更新日志', icon: 'note',
        body: () => (typeof CHANGELOG_HTML === 'undefined'
            ? '<p class="p">更新日志正在载入……稍等一下会自动出现。</p>'
            : CHANGELOG_HTML)
    },
    {
        key: 'azuma_skill', group: 'life', title: '村民技能', icon: 'book',
        gms: ['azuma'],
        body: () => azumaSkillHtml(),
    },
    {
        key: 'azuma_npc', group: 'life', title: '角色详情', icon: 'users',
        gms: ['azuma'],
        body: () => azumaNpcHtml(),
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
    {
        key: 'azuma_cook', group: 'life', title: '料理配方', icon: 'pot',
        gms: ['azuma'],
        body: () => azumaCookHtml(),
    },
    {
        key: 'azuma_village', group: 'life', title: '村庄升级', icon: 'flag',
        gms: ['azuma'],
        body: () => azumaVillageHtml(),
    },
    {
        key: 'azuma_artifact', group: 'life', title: '神器与舞', icon: 'note',
        gms: ['azuma'],
        body: () => azumaArtifactHtml(),
    },
];

/* ============================================================
   龙之天地（azuma）的物品四页：武器／农具／素材／料理
   四页都不另引数据源，只把站内已有的三份数据换一个角度看：
     AZUMA_FORGE（js/azuma_forge.js，111 件五类武器）
     AZUMA_COOK （js/azuma_cook.js，313 条五类料理）
     DROP_AZUMA （js/drop_azuma.js，458 行魔物掉落，124 种可掉素材）
   完整表都在各自的原页（锻造／料理配方／素材出处），这四页只做纵向比较与倒排，
   所以不会再抄一遍全表。所有计数、排名、区间都是现算的。
   ============================================================ */
function azEsc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* 「铁×2」-> 「铁」；材料串统一拆成名字数组 */
function azMatNames(s) {
    return String(s == null ? '' : s).split(/[／\/、]/)
        .map(x => x.replace(/×\s*\d+\s*$/, '').trim())
        .filter(x => x && x !== '—');
}

function azNum(v) {
    const n = parseFloat(String(v == null ? '' : v).replace(/[^\d.\-]/g, ''));
    return isFinite(n) ? n : null;
}

/* 龙之天地（azuma）的防具与药品：数据在 js/azuma_armor.js（AZUMA_ARMOR，
   由 _build_azuma_armor.py 从 gametoeasy 四篇文章的 HTML 表生成）。
   防具在这作只有头部／肩甲／饰品三类，源站也是三篇文章，本页逐篇出表、不合并成一张。 */
function azumaArmorHtml() {
    const D = (typeof AZUMA_ARMOR !== 'undefined') ? AZUMA_ARMOR : null;
    if (!D || !D.fams || !D.fams.length) return '';
    const E = azEsc;
    const all = D.fams.reduce((a, f) => a.concat(f.rows.map(r => r[1])), []);
    const n = all.length;
    const withEff = all.filter(r => r[6] !== '—').length;
    const withUp = all.filter(r => r[5] !== '—').length;
    const noUnlock = all.filter(r => r[7] === '—' && r[8] === '—').length;
    /* 每类的防御／魔防天花板：源表在饰品那一栏写的是百分比，原样带出来 */
    const top = (f, i) => {
        let best = null;
        f.rows.forEach(r => {
            const v = azNum(r[1][i]);
            if (v === null) return;
            if (!best || v > best.v) best = { v: v, s: r[1][i], n: r[1][0] };
        });
        return best;
    };
    let out = '';
    out += '<h2 class="h2">龙之天地的防具：三张表，三类</h2>';
    out += '<p class="p">这一作的防具只有 <b>头部、肩甲、饰品</b> 三类，源站也是三篇文章各一张表：' +
        D.fams.map(f => E(f.name) + ' ' + f.n + ' 条').join('、') + '，合计 <b>' + n + ' 件</b>。' +
        '源站没有「铠甲／鞋／盾」的独立条目，本页不补一张出来——补出来的只能靠猜。</p>';
    out += stat([['防具', n + ' 件'], ['类别', D.fams.length + ' 类'],
        ['带特殊效果', withEff + ' 件'], ['带升级增加', withUp + ' 件']]);
    out += '<h3 class="h3">三类的高度</h3>';
    out += '<p class="p">每类里防御力／魔防最高的那一件。<b>饰品那一栏源表给的是百分比</b>（「1%」「8%」这种写法），' +
        '头部与肩甲是数值——两套单位并存是源表本来的样子，本页<u>没有换算成同一套</u>，' +
        '所以只能横着比「同一类里谁更高」，不能拿饰品的 8% 去比肩甲的 800。</p>';
    out += tbl(['类别', '件数', '防御力最高', '魔防最高'],
        D.fams.map(f => {
            const a = top(f, 3), b = top(f, 4);
            return [E(f.name), String(f.n),
                a ? E(a.n) + '（' + E(a.s) + '）' : '—',
                b ? E(b.n) + '（' + E(b.s) + '）' : '—'];
        }), { leftFirst: true, cls: 'txt', colw: ['6rem', '4rem', '11rem', '11rem'] });
    D.fams.forEach(f => {
        out += '<h2 class="h2">' + E(f.name) + '（' + f.n + ' 件）</h2>';
        out += ftableOwn(f.cols.map(E), f.colw, f.rows, { ph: '输入' + E(f.name) + '名称、材料或解锁条件筛选', left: [0] });
    });
    out += '<div class="key">这一作换防具的动机和七作不同：<b>面板差距其实不大，差距在「防具特殊效果」那一栏</b>。' +
        '抗性、属性减伤、状态免疫都写在那里，而「升级增加」只是每次强化能加多少。' +
        '所以配装顺序是<b>先挑效果，再看防御</b>。</div>';
    out += '<div class="note">源：<b>' + E(D.src) + '</b>。' + E(D.note) + '</div>';
    if (noUnlock) {
        out += '<div class="note">表里有 ' + noUnlock + ' 条<b>解锁条件与宝箱获取栏都是「—」</b>的条目' +
            '（如饰品的闪身绑腿），源站就是空的——本页不替它补「大概在哪拿」。</div>';
    }
    out += '<div class="jump">' +
        '<a href="#/page/potion"><div class="jp-t">药品</div><div class="jp-s">同站的药学配方表</div></a>' +
        '<a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">武器与药的做法</div></a>' +
        '<a href="#/page/weapon"><div class="jp-t">武器</div><div class="jp-s">五类武器与面板</div></a>' +
        '</div>';
    return out;
}

function azumaPotionHtml() {
    const D = (typeof AZUMA_ARMOR !== 'undefined') ? AZUMA_ARMOR.potion : null;
    if (!D || !D.rows.length) return '';
    const E = azEsc;
    const n = D.n;
    const rows = D.rows.map(r => r[1]);
    const inShop = rows.filter(r => r[10] !== '—').length;
    const inBox = rows.filter(r => r[9] !== '—').length;
    const hasEff = rows.filter(r => r[7] !== '—').length;
    const hasPct = rows.filter(r => r[4] !== '—' || r[6] !== '—').length;
    let out = '';
    out += '<h2 class="h2">药品：' + n + ' 味，一半靠配、一半靠买</h2>';
    out += '<p class="p">这一作的药学配方共 <b>' + n + ' 条</b>：' + inShop + ' 条商店有售、' + inBox + ' 条能在宝箱里开出来，' +
        '其余只能自己配。恢复量分两套写法——<b>固定值（HP／RP）与百分比（HP%／RP%）</b>，' +
        '源表把两套并列成四列，本页照录，不替它折算。</p>';
    out += stat([['药品', n + ' 条'], ['商店有售', inShop + ' 条'], ['宝箱可得', inBox + ' 条'],
        ['带特效', hasEff + ' 条'], ['带百分比恢复', hasPct + ' 条']]);
    out += '<div class="key">带百分比的那几条是<b>终盘才有意义</b>的：固定值恢复在 HP／RP 上限高起来之后就不够看了，' +
        '而百分比恢复永远按比例来。<b>看一瓶药值不值得带，先看它有没有百分比那一栏。</b></div>';
    out += '<h2 class="h2">全表（' + n + ' 条）</h2>';
    out += '<p class="p">材料四列已合成一列（源表的「—」占位丢掉）；<b>只记商店买价、不记卖价</b>。' +
        '「解锁条件」是配方怎么拿到，「宝箱获取」「商店获取」是成品在哪捡／哪买——三栏各管一件事，别混着看。</p>';
    out += ftableOwn(D.cols.map(E), D.colw, D.rows, { ph: '输入药品名、材料、特效或获取方式筛选', left: [0] });
    out += '<div class="note">源：<b>' + E(D.src) + '</b>。同站另有《魔物掉落表》与《料理配方》，' +
        '药学材料的来源可到<a href="#/page/material">素材与矿石</a>页反查。' +
        '源表「醒神药」一行的商店获取一栏写了三段位置（用空格连着），本页照录不拆。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">药学技能怎么刷</div></a>' +
        '<a href="#/page/rp"><div class="jp-t">体力与 RP</div><div class="jp-s">RP 上限与回复来源</div></a>' +
        '<a href="#/page/food"><div class="jp-t">料理与食材</div><div class="jp-s">不喝药也能回的那条路</div></a>' +
        '</div>';
    return out;
}

function weaponAzumaHtml() {
    const F = (typeof AZUMA_FORGE !== 'undefined') ? AZUMA_FORGE : null;
    if (!F || !F.families.length) return '';
    const E = azEsc;
    const all = F.families.reduce((a, f) => a.concat(f.rows.map(r => ({ f: f.name, r: r }))), []);
    const n = all.length;
    const withElem = all.filter(x => x.r[3] !== '—').length;
    const withEff = all.filter(x => x.r[4] !== '—').length;
    const priced = all.filter(x => azNum(x.r[2]) !== null);
    const perFam = F.families.map(f => {
        const rows = f.rows;
        const best = k => rows.slice().sort((a, b) => (azNum(b[k]) || 0) - (azNum(a[k]) || 0))[0];
        const ps = rows.map(r => azNum(r[2])).filter(v => v !== null);
        return {
            name: f.name, n: rows.length,
            atk: best(5), mgc: best(6),
            pmin: ps.length ? Math.min.apply(null, ps) : null,
            pmax: ps.length ? Math.max.apply(null, ps) : null,
            top: rows.slice().sort((a, b) => (azNum(b[5]) || 0) - (azNum(a[5]) || 0)).slice(0, 3)
        };
    });
    let out = '';
    out += '<h2 class="h2">龙之天地的武器：只有五类</h2>';
    out += '<p class="p">这一作的武器是 <b>五类 ' + n + ' 件</b>：' +
        perFam.map(x => E(x.name) + ' ' + x.n).join('、') + '。' +
        '长枪、锤、斧、拳套、魔杖这些前面几作的常客在本作<b>一件都没有</b>——这不是表不全，是游戏本身就没有。' +
        '全表在<a href="#/page/craft">锻造与药学</a>页（同一份数据），这一页只做纵向比较：<b>每类能到多高、买价跨度多大</b>。</p>';
    out += stat([['武器', n + ' 件'], ['类别', F.families.length + ' 类'],
        ['带攻击属性', withElem + ' 件'], ['带特效', withEff + ' 件'],
        ['标了买价', priced.length + ' 件']]);
    out += '<h3 class="h3">各类的天花板与买价跨度</h3>';
    out += '<p class="p">「最高攻击／最高魔攻」是各类里那项数值最高的一件；<b>买价跨度</b>是该类最便宜与最贵之间的区间——' +
        '跨度大的类别，说明它从初期到终盘一路都有东西可做，不用等解锁。</p>';
    out += tbl(['类别', '件数', '最高攻击', '最高魔攻', '买价最低', '买价最高'],
        perFam.map(x => [E(x.name), String(x.n),
            (x.atk && x.atk[5] !== '—') ? E(x.atk[0]) + '（' + E(x.atk[5]) + '）' : '—',
            (x.mgc && x.mgc[6] !== '—') ? E(x.mgc[0]) + '（' + E(x.mgc[6]) + '）' : '—',
            x.pmin == null ? '—' : x.pmin + 'G',
            x.pmax == null ? '—' : x.pmax + 'G']),
        { leftFirst: true, cls: 'txt', colw: ['7rem', '3.6rem', '9rem', '9rem', '6rem', '6rem'] });
    out += '<h3 class="h3">各类攻击前三</h3>';
    out += '<p class="p">按攻击从高到低取前三。<b>符咒一栏的物理攻击是「—」</b>，它的数值全在魔攻上，' +
        '所以这一类的「前三」按攻击排会出现一整列空值——那不是漏数据。</p>';
    out += tbl(['类别', '名称', '攻击', '魔攻', '买价'],
        perFam.reduce((a, x) => a.concat(x.top.map(r =>
            [E(x.name), E(r[0]), E(r[5]), E(r[6]), E(r[2])])), []),
        { leftFirst: true, cls: 'txt', colw: ['7rem', '9rem', '4.4rem', '4.4rem', '5rem'] });
    out += '<div class="key">五类里<b>没有「谁最强」这回事</b>：这一作的伤害主要挂在「舞」与神器的属性和特效上，' +
        '武器更像载体。选武器先看<b>有没有你要的属性／特效</b>，再看面板——' +
        '这一条和锻造页的说明是同一套判断。</div>';
    out += '<div class="note">数据同<a href="#/page/craft">锻造与药学</a>页：<code>js/azuma_forge.js</code> 的 <code>AZUMA_FORGE</code>' +
        '（' + n + ' 件，源：<b>' + E(F.src) + '</b>）。<b>只记买价、不记卖价</b>；「—」照录，意思是源表没写。' +
        '「升级+」是源表的一列强化值，不是可叠加次数上限，本页不据此推算。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">五类武器全表与材料</div></a>' +
        '<a href="#/page/azuma_artifact"><div class="jp-t">神器与舞</div><div class="jp-s">本作真正的战力在舞上</div></a>' +
        '<a href="#/page/material"><div class="jp-t">素材与矿石</div><div class="jp-s">这些武器的材料从哪来</div></a>' +
        '</div>';
    return out;
}

function toolAzumaHtml() {
    let out = '';
    out += '<h2 class="h2">这一作没有农具表，因为它没有农具</h2>';
    out += '<p class="p">龙之天地是系列里唯一<b>取消整套农具</b>的一作：<b>锄头、镰刀、洒水壶这一整套都不存在</b>，' +
        '农活改由「神器」承担——主角是大地舞者，下地干活是<b>跳一支对应的舞</b>，不是换一把工具。' +
        '所以这一页没有物品表可列，<a href="#/page/craft">锻造页</a>里也没有农具这一类（那一页的五类全是武器）。</p>';
    out += stat([['农具', '0 件'], ['农具锻造', '无'], ['替代系统', '神器（舞）']]);
    out += '<h3 class="h3">六件农活，六种舞</h3>';
    out += '<p class="p">神器页把七种舞的「生活面」逐条写开了，正好对上农活里最费时的六件事——' +
        '<b>要干什么 → 跳哪支舞</b>：</p>';
    out += tbl(['要干的事', '用哪种舞', '原文要点'], [
        ['促进作物生长、救活枯萎作物', '鼓之舞', '每天一次，还能让枯萎的作物恢复生机'],
        ['取种子（含更高品质）', '剑之舞', '对可收成的作物挥舞，概率升级'],
        ['一口气全收', '扇之舞', '旋风吹向田里，把作物全部收成'],
        ['大范围浇水', '伞之舞', '轻松为大范围田地浇水'],
        ['破坏挡路的巨石', '鬼面之舞', '用鬼的怪力破坏挡路的巨石'],
        ['揭开隐藏之物', '锡杖之舞', '昭示真相，显形隐藏物'],
    ], { leftFirst: true, cls: 'txt', colw: ['11rem', '6rem'] });
    out += '<h3 class="h3">七作的农具，到本作对应到哪</h3>';
    out += '<p class="p">按前面几作的六件基础农具逐条对照。<b>只有原文写到的才标对应</b>，其余一律记「原文没写」，' +
        '不替它猜——猜出来的对应关系一旦错了，玩家会照着去跳半天舞。</p>';
    out += tbl(['七作的农具', '干什么', '本作对应'], [
        ['锄头', '翻土', '原文没写'],
        ['洒水壶', '浇水', '伞之舞（大范围浇水）'],
        ['镰刀', '割草、收割', '扇之舞（一口气全收）'],
        ['斧', '砍树、取木材', '原文没写'],
        ['锤', '碎矿、碎石', '原文没写'],
        ['钓竿', '钓鱼', '原文没写（本作另有钓鱼玩法）'],
    ], { leftFirst: true, cls: 'txt', colw: ['7rem', '9rem'] });
    out += '<div class="key">本作的农活节奏和七作完全不同：<b>一天只能催一次生长（鼓之舞每天都在冷却）</b>，' +
        '而收成可以一次性全收（扇之舞）。所以「先催后收」的时间安排比七作重要得多——' +
        '七作里可以来回补浇，这里每一支舞都带冷却或一次性限制。</div>';
    out += '<div class="note">农活与舞的对应关系取自<b>神器介绍</b>（gametoeasy.com，post/1809，2025-06-22）；' +
        '「本作取消传统农具、改由神器替代」这句在<b>武器配方五帖</b>（同站）与<b>官方站 asia.runefactory.com</b> 两边都写过，' +
        '本站<a href="#/page/craft">锻造页</a>也按此处理。七作农具的六项用途来自本站其他作品的农具页，属跨作对照，' +
        '不是本作的表——请勿当成「本作也有锄头」。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/azuma_artifact"><div class="jp-t">神器与舞</div><div class="jp-s">七种舞的战斗面与生活面</div></a>' +
        '<a href="#/page/crop"><div class="jp-t">作物与种子</div><div class="jp-s">舞催什么、田怎么开</div></a>' +
        '<a href="#/page/azuma_village"><div class="jp-t">村庄升级</div><div class="jp-s">开垦田地与金色作物</div></a>' +
        '</div>';
    return out;
}

function matAzumaHtml() {
    const D = (typeof DROP_AZUMA !== 'undefined') ? DROP_AZUMA : null;
    if (!D || !D.rows.length) return '';
    const E = azEsc;
    /* 素材 -> 掉落它的「魔物（区域）」 */
    const idx = {};
    D.rows.forEach(r => {
        (r[2] || []).forEach(raw => {
            const k = String(raw).replace(/×\s*\d+\s*$/, '').trim();
            if (!k) return;
            const a = idx[k] = idx[k] || [];
            const tag = r[0] + '（' + r[1] + '）';
            if (a.indexOf(tag) < 0) a.push(tag);
        });
    });
    /* 素材 -> 用到它的武器件数 / 料理道数（字面同名才算，不做同义词合并） */
    const useW = {}, useC = {};
    if (typeof AZUMA_FORGE !== 'undefined') {
        AZUMA_FORGE.families.forEach(f => f.rows.forEach(r => {
            azMatNames(r[1]).forEach(m => { useW[m] = (useW[m] || 0) + 1; });
        }));
    }
    if (typeof AZUMA_COOK !== 'undefined') {
        AZUMA_COOK.cats.forEach(c => c.rows.forEach(r => {
            r.slice(1, 5).forEach(v => azMatNames(v).forEach(m => {
                useC[m] = (useC[m] || 0) + 1;
            }));
        }));
    }
    const names = Object.keys(idx).sort((a, b) =>
        (useW[b] || 0) - (useW[a] || 0) || (useC[b] || 0) - (useC[a] || 0) || (a < b ? -1 : 1));
    const inForge = names.filter(m => useW[m]).length;
    const inCook = names.filter(m => useC[m]).length;
    const rows = names.map(m => {
        const src = idx[m];
        const head = src.slice(0, 3).join('、');
        return [m, src.length > 3 ? head + ' 等 ' + src.length + ' 处' : head,
            useW[m] ? useW[m] + ' 件' : '—', useC[m] ? useC[m] + ' 道' : '—'];
    });
    let out = '';
    out += '<h2 class="h2">素材：' + names.length + ' 种靠打，' + inForge + ' 种喂给锻造</h2>';
    out += '<p class="p"><a href="#/page/source">素材出处与掉落</a>页是<b>按魔物查</b>（' + D.rows.length +
        ' 行，一只怪在哪张图掉什么）；这一页反过来<b>按素材查</b>：这东西是哪几只怪掉的、它们在哪张图，' +
        '以及它被哪几件武器、哪几道料理用掉。两页同一份源（<b>' + E(D.source || D.title) + '</b>），只是查的方向不同。</p>';
    out += stat([['可掉素材', names.length + ' 种'], ['用于锻造', inForge + ' 种'],
        ['用于料理', inCook + ' 种'], ['掉落记录', D.rows.length + ' 行']]);
    out += '<div class="key">缺材料的正确顺序是<b>先查这张表看它喂不喂锻造</b>：喂锻造的（前几十行）才值得专门去刷；' +
        '不喂锻造也不进料理的素材，多半只是换钱或送礼用——别为它绕路。</div>';
    out += '<h3 class="h3">素材 → 掉落 → 用途</h3>';
    out += '<p class="p">按「用于锻造的件数」降序，「掉落」一栏最多列三处，多的用「等 N 处」收尾（全列出来这页就没法看了）。' +
        '<b>用途是按名字字面对上的</b>：源表把同一样东西写成两种叫法时这里对不上，本页不做同义词合并，也不猜。</p>';
    out += tbl(['素材', '掉落（魔物／区域）', '用于锻造', '用于料理'],
        rows.map(r => [E(r[0]), E(r[1]), r[2], r[3]]),
        { leftFirst: true, cls: 'txt', colw: ['8rem', 'auto', '5rem', '5rem'] });
    out += '<div class="note">源：<b>' + E(D.source || '') + '</b>（' + D.rows.length + ' 行，' + names.length + ' 种素材）。' +
        '「用于锻造」统计的是 <code>js/azuma_forge.js</code> 材料栏里出现这个名字的武器件数，' +
        '「用于料理」统计 <code>js/azuma_cook.js</code> 的 ' +
        (typeof AZUMA_COOK !== 'undefined' ? AZUMA_COOK.cats.reduce((a, c) => a + c.rows.length, 0) : 0) +
        ' 道菜。两条都是现算的，不是另一份数据。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/source"><div class="jp-t">素材出处与掉落</div><div class="jp-s">同一份数据，按魔物查</div></a>' +
        '<a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">这些素材做成什么</div></a>' +
        '<a href="#/page/azuma_cook"><div class="jp-t">料理配方</div><div class="jp-s">食材与做法</div></a>' +
        '</div>';
    return out;
}

function foodAzumaHtml() {
    const C = (typeof AZUMA_COOK !== 'undefined') ? AZUMA_COOK : null;
    if (!C || !C.cats.length) return '';
    const E = azEsc;
    const all = [];
    C.cats.forEach(c => c.rows.forEach(r => all.push({ k: c.k, r: r })));
    const n = all.length;
    const idx = {};
    all.forEach(x => {
        x.r.slice(1, 5).forEach(v => azMatNames(v).forEach(m => {
            const a = idx[m] = idx[m] || [];
            if (a.indexOf(x.r[0]) < 0) a.push(x.r[0]);
        }));
    });
    const names = Object.keys(idx).sort((a, b) => idx[b].length - idx[a].length || (a < b ? -1 : 1));
    const multi = names.filter(m => idx[m].length >= 3);
    const byHp = all.filter(x => azNum(x.r[7]) !== null).sort((a, b) => azNum(b.r[7]) - azNum(a.r[7])).slice(0, 8);
    const byRp = all.filter(x => azNum(x.r[9]) !== null).sort((a, b) => azNum(b.r[9]) - azNum(a.r[9])).slice(0, 8);
    let out = '';
    out += '<h2 class="h2">食材：' + n + ' 道菜里哪样材料用得最多</h2>';
    out += '<p class="p">' + n + ' 道料理已经按五类（' + C.cats.map(c => E(c.k) + ' ' + c.rows.length).join('、') +
        '）列在<a href="#/page/azuma_cook">料理配方</a>页，本页不抄一遍——这一页做的是倒排：' +
        '<b>把每道菜的材料拆开、按材料归并</b>，看哪几样东西被反复用到。</p>';
    out += stat([['料理', n + ' 道'], ['不同食材', names.length + ' 种'],
        ['出现在 3 道以上', multi.length + ' 种'],
        ['最常用', names[0] ? names[0] + '（' + idx[names[0]].length + ' 道）' : '—']]);
    out += '<h3 class="h3">常用食材（3 道以上）</h3>';
    out += '<p class="p">按出现道数降序，最后一列只列前四道菜——要查某道菜的完整配方，去料理配方页。' +
        '<b>道数是用到它的不同料理数</b>，同名条目已去重。</p>';
    out += tbl(['食材', '道数', '用到的料理（前四道）'],
        multi.map(m => [E(m), String(idx[m].length), idx[m].slice(0, 4).map(E).join('、')]),
        { leftFirst: true, cls: 'txt', colw: ['8rem', '4rem'] });
    out += '<h3 class="h3">回复最高的几道</h3>';
    out += '<p class="p">HP 与 RP 分开排。本作有「恢复HP%／恢复RP%」两栏，<b>百分比与固定值不是一回事</b>——' +
        '固定值在高等级时会显得很弱，百分比才是终盘的主力，所以两张榜都只取固定值那一栏，' +
        '按百分比吃饭的菜这里排不上去，去配方页看。</p>';
    out += tbl(['HP 最高', 'HP', 'RP 最高', 'RP'],
        byHp.map((x, i) => [E(x.r[0]), E(x.r[7]),
            byRp[i] ? E(byRp[i].r[0]) : '—', byRp[i] ? E(byRp[i].r[9]) : '—']),
        { leftFirst: true, cls: 'txt', colw: ['9rem', '4.4rem', '9rem', '4.4rem'] });
    out += '<div class="note">数据同<a href="#/page/azuma_cook">料理配方</a>页：<code>js/azuma_cook.js</code> 的 <code>AZUMA_COOK</code>' +
        '（' + n + ' 条，源：gametoeasy.com《符文工房：龙之天地》料理配方，post/1810）。' +
        '<b>只记买价、不记卖价</b>；材料名照录源表，同一样东西两种叫法时这里会分成两行，本页不合并。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/azuma_cook"><div class="jp-t">料理配方</div><div class="jp-s">' + n + ' 道菜的材料与恢复量</div></a>' +
        '<a href="#/page/material"><div class="jp-t">素材与矿石</div><div class="jp-s">这些食材哪只怪掉</div></a>' +
        '<a href="#/page/fish"><div class="jp-t">鱼类图鉴</div><div class="jp-s">本作的鱼也是食材</div></a>' +
        '</div>';
    return out;
}

/* 龙之天地（azuma）村庄升级：四个里各自的满级条件。
 * 唯一来源 gametoeasy.com《龙之天地》村庄满级条件丨村庄升级攻略（post/1806，2025-06-21，极特攻略）。
 * 原表按「春/夏/秋/冬」四列给数值，「皆为 X」表示四季相同；本页照录，不替原文解释
 * 「达成条件」与「建村效果」的因果（原文未说明），也不把「满级＝10 级」写死。 */
function azumaVillageHtml() {
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    /* [条件, 春, 夏, 秋, 冬, 原文补充]；四季顺序固定 春/夏/秋/冬 */
    const REQ = [
        ['讨伐魔物', '150', '210', '300', '300', ''],
        ['完成绘马架委托', '50', '40', '40', '40', ''],
        ['净化率', '100%', '100%', '100%', '100%', '皆为 100%'],
        ['景观评分', '60000', '50000', '60000', '50000', ''],
        ['店铺一天收入', '2000', '3600', '4400', '2000', ''],
        ['该区收成巨大作物', '5 种', '5 种', '5 种', '5 种', '皆为 5 种'],
        ['该区收成金色作物', '4 种', '4 种', '4 种', '4 种', '4 种都要种，金刚花不算'],
        ['摆放的摆饰', '70', '70', '70', '70', '皆为 70'],
        ['开垦的田地', '30', '30', '30', '30', '秋之里另需 30 块水田；田地、水田独立计算'],
        ['完成个人委托数量', '15', '15', '15', '15', '皆为 15'],
        ['举办大会', '1 次', '1 次', '1 次', '1 次', '都一样'],
    ];
    const EFF = [
        ['HP', '30', '30', '30', '30', '皆为 30'],
        ['RP', '30', '20', '30', '30', ''],
        ['力量', '200', '200', '200', '200', '皆为 200'],
        ['体力', '100', '100', '100', '100', '皆为 100'],
        ['智力', '200', '200', '200', '200', '皆为 200'],
        ['精神力', '100', '100', '100', '100', '皆为 100'],
        ['农业', '7%', '7%', '7%', '7%', '皆为 7%'],
        ['林业', '4%', '4%', '4%', '4%', '皆为 4%'],
        ['渔业', '3%', '3%', '3%', '3%', '皆为 3%'],
        ['矿业', '5%', '5%', '5%', '5%', '皆为 5%'],
        ['商业', '7%', '7%', '7%', '7%', '皆为 7%'],
        ['收成作物种类', '19 种', '19 种', '19 种', '19 种', '全部作物各收成一次，不含花卉、水稻、果树'],
        ['制作摆饰种类', '100 种', '100 种', '100 种', '100 种', '全村共享'],
        ['收成适合作物／花卉数量', '每种 300', '每种 300', '每种 300', '每种 300', '依各里作物不同，每种独立计算'],
    ];
    const HEAD = ['条件', '春之里', '夏之里', '秋之里', '冬之里', '原文补充'];
    const rowsOf = arr => arr.map(r => [esc(r[0]), r[1], r[2], r[3], r[4], r[5] ? '<span class="mon-desc">' + esc(r[5]) + '</span>' : '']);
    const CW = ['8.6rem', '3.8rem', '3.8rem', '3.8rem', '3.8rem', 'auto'];
    /* 季节限定：只对特定里生效 */
    const LIMIT = [
        ['春之里', '撤除瓦砾 30 处'],
        ['夏之里', '撤除瓦砾 15 处'],
        ['冬之里', '撤除瓦砾 15 处'],
        ['秋之里', '建造 3 间牧场、1 间风车小屋'],
        ['冬之里', '建造 1 间药局、1 间水车小屋'],
    ];
    const UNLOCK = [
        ['春之里', '神乐殿'],
        ['夏之里', '活火山模型（摆饰）'],
        ['秋之里', '宝物殿'],
        ['冬之里', '根国高塔'],
    ];
    return `
            <p class="p">龙之天地和七作不是一套：<b>没有一座统一的「村」，而是春／夏／秋／冬四个里各算各的村庄等级</b>。每个里都有一条「故乡任务」链，把条件一条条刷满，村子才升级；满级后在那个里解锁专属建筑或摆饰。进游戏后从<b>「村子状态 → 故乡任务」</b>就能看到每条还差多少。</p>
            ${stat([['村庄', '4 个里'], ['满级条件', REQ.length + ' 项'], ['建村效果', EFF.length + ' 项'], ['满级解锁', UNLOCK.length + ' 样']])}
            <p class="p">下面的数值<b>按原文的春／夏／秋／冬四列照录</b>：「皆为 X」表示四个里条件一样；写具体数字的就是各里不同。原文标题是「村庄满级条件」，末段另写「10 级后可解锁建筑物／摆饰」——这两句都照录，本站不把它们合并成「满级＝10 级」一句话。</p>

            <h2 class="h2">满级条件：${REQ.length} 项，四季对照</h2>
            <p class="p">讨伐魔物、景观评分、店铺收入这几项<b>四季不同</b>；净化率、巨大作物、摆饰数量、个人委托、大会次数<b>四季一样</b>。最容易被忽略的是金色作物——<b>4 种都要种，金刚花不算</b>；另外秋之里要多种 30 块水田，水田与普通田地分开算。</p>
            ${tbl(HEAD, rowsOf(REQ), { leftFirst: true, cls: 'txt', colw: CW })}

            <h2 class="h2">建村效果：${EFF.length} 项</h2>
            <p class="p">原文这一段的小标题是<b>「建村效果达成以下条件」</b>，随后列了 HP／RP／力量／体力／智力／精神力，以及农／林／渔／矿／商五项产出的百分比。这些数值是「达标条件」还是「满级后获得的效果」，<b>原文没有说明</b>——本页照录数值与原文小标题，不代为定性，实际以游戏内「村子状态」界面为准。</p>
            ${tbl(HEAD, rowsOf(EFF), { leftFirst: true, cls: 'txt', colw: CW })}

            <h2 class="h2">只有某一个里才有的条件</h2>
            <p class="p">除了上面四里通用的项，还有几条<b>只对特定里生效</b>——尤其秋、冬两个里各要建特定建筑，别在别的里白刷：</p>
            ${tbl(['里', '限定条件'], LIMIT.map(r => [r[0], esc(r[1])]), { leftFirst: true, cls: 'txt', colw: ['6rem', 'auto'] })}

            <h2 class="h2">10 级后解锁的建筑与摆饰</h2>
            <p class="p">每个里到 10 级各解锁一样，是本作「满级」最直接的回报：</p>
            ${tbl(['里', '解锁'], UNLOCK.map(r => [r[0], esc(r[1])]), { leftFirst: true, cls: 'txt', colw: ['6rem', 'auto'] })}

            <div class="note">取自中文攻略站 gametoeasy.com《符文工房：龙之天地》<b>村庄满级条件丨村庄升级攻略</b>（post/1806，2025-06-21，极特攻略）。原表把四季数值写成「150/210/300/300」这种斜杠串，本页拆成春／夏／秋／冬四列，<b>数值一字未改</b>；「皆为 X」按原文保留为备注。<b>原文没有单列「满级＝10 级」这句</b>，只说标题「满级条件」、末段「10 级后可解锁」——两处并存照录。本页不换算、不补原文没写的项。</div>`;
}

/* 龙之天地（azuma）神器与舞：7 种舞，6 种按「战斗／生活」两栏写，必胜之舞只有一句。
 * 唯一来源 gametoeasy.com《龙之天地》神器介绍（post/1809，2025-06-22，极特攻略）。
 * 原文按战斗／生活分栏，本页照录；必胜之舞原文未分栏，不代补、不猜用途。
 * 另一篇（post/1854 赚钱攻略）称「火焰刀神器」「鼓之神器」，与本页「剑之舞／鼓之舞」
 * 是两套说法，本站不擅自认定二者等同，两处各自照录。 */
function azumaArtifactHtml() {
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    /* [舞, 神器, 战斗, 生活, 原文补充] */
    const D = [
        ['必胜之舞', '—', '—', '—', '原文只有一句「根据村民数量增加威力」，未分战斗／生活'],
        ['鼓之舞', '鼓',
            '挥舞神器「鼓」展开震撼舞姿，可以为主角与周围的伙伴恢复HP。此外，鼓之舞的冲击波还能短暂阻挡敌人行动！',
            '每天可以对作物施展一次鼓之舞，促进作物生长。甚至还能让枯萎的作物恢复生机！', ''],
        ['剑之舞', '剑',
            '挥舞神器「剑」翩然起舞，可以释放强大的火焰之力对敌人展开攻击！',
            '对已经可以收成的作物挥舞，可以得到种子。还有机会获得比作物更高品质的种子！',
            '种子是概率升级，最高 lv9。使用弓箭配合时也算割掉种子的判定。'],
        ['扇之舞', '扇',
            '挥舞神器「扇」翩然起舞，可以掀起强力旋风，对敌人展开攻击！',
            '将扇之舞掀起的旋风吹向田里的作物，就能够一口气将作物全部收成！', ''],
        ['伞之舞', '伞',
            '挥舞神器「伞」展开华丽舞姿，释放强大的水之力量，对敌人造成伤害！',
            '使用伞之舞，可以轻松为大范围的田地浇水，让作物茁壮成长！', ''],
        ['鬼面之舞', '鬼面',
            '可以使用鬼的怪力对敌人发动攻击。在鬼面之舞期间，即便受到敌方攻击也不会退缩。还能使出各种相扑的招式。',
            '使用鬼面之舞，可以破坏挡在道路上的巨石。', ''],
        ['锡杖之舞', '锡杖',
            '召唤天之国的使者【光之蝶】，能自动搜寻敌人并发动攻击。',
            '通过锡杖神器所拥有的能昭示真相的力量，可以揭开隐藏之物的真面目。', ''],
    ];
    const dual = D.filter(r => r[2] !== '—').length;
    /* 战斗面里原文写明属性的只有三处：剑＝火焰、扇＝旋风、伞＝水 */
    const ELEM = [
        ['火', '剑之舞', '释放强大的火焰之力'],
        ['风', '扇之舞', '掀起强力旋风'],
        ['水', '伞之舞', '释放强大的水之力量'],
    ];
    /* 生活面的六件事，逐条对应原文动作 */
    const LIFE = [
        ['促进作物生长', '鼓之舞', '每天一次，还能让枯萎的作物恢复生机'],
        ['拿种子（含更高品质）', '剑之舞', '对可收成的作物挥舞，概率升级'],
        ['一口气全收', '扇之舞', '旋风吹向田里，把作物全部收成'],
        ['大范围浇水', '伞之舞', '轻松为大范围田地浇水'],
        ['破坏路上的巨石', '鬼面之舞', '用鬼的怪力破坏挡路的巨石'],
        ['揭开隐藏之物', '锡杖之舞', '昭示真相，显形隐藏物'],
    ];
    const rows = D.map(r => [
        '<b>' + esc(r[0]) + '</b>', r[1] === '—' ? '<span class="mon-no">—</span>' : esc(r[1]),
        r[2] === '—' ? '<span class="mon-no">—</span>' : esc(r[2]),
        r[3] === '—' ? '<span class="mon-no">—</span>' : esc(r[3]),
        r[4] ? '<span class="mon-desc">' + esc(r[4]) + '</span>' : '',
    ]);
    return `
            <p class="p">龙之天地的主角身份是<b>「大地舞者」</b>，力量不挂在武器上，而是<b>用「舞」把神器里蕴藏的力量激发出来</b>。所以本作的「神器」不是拿在手里砍的装备，而是<b>一套七种舞</b>——每种舞都同时有一套战斗用法和一套生活用法，两套分开算。</p>
            ${stat([['舞（神器）', D.length + ' 种'], ['战斗／生活两栏', dual + ' 种'], ['写明属性的攻击', ELEM.length + ' 种'], ['生活面覆盖农活', LIFE.length + ' 项']])}
            <p class="p">七种里<b>有 ${dual} 种是「战斗／生活」两栏俱全</b>，剩下一种是<b>必胜之舞</b>——原文对它只有一句「根据村民数量增加威力」，<b>没分栏、也没写怎么发动</b>。本页照录这一句，不替它补用途。</p>
            ${tbl(['舞', '神器', '战斗', '生活', '原文补充'], rows, { leftFirst: true, cls: 'txt', colw: ['5.6rem', '3.6rem', 'auto', 'auto', 'auto'] })}

            <h2 class="h2">战斗面：${ELEM.length} 种带属性，其余靠召唤与怪力</h2>
            <p class="p">原文在战斗描述里<b>写明了属性的只有三种</b>，正好是火／风／水各一：</p>
            ${tbl(['属性', '舞', '原文'], ELEM.map(r => [r[0], r[1], esc(r[2])]), { leftFirst: true, cls: 'txt', colw: ['4.4rem', '6rem', 'auto'] })}
            <div class="key">另外三种战斗用法<b>不带属性</b>，靠的是别的东西：<b>鼓之舞</b>不给伤害，给的是<b>为主角与周围伙伴回 HP ＋ 冲击波短暂阻挡敌人</b>（七种舞里唯一写明「群体回复」的一种）；<b>鬼面之舞</b>是<b>用鬼的怪力攻击</b>，卖点在「受到攻击也不会退缩」外加各种相扑招式；<b>锡杖之舞</b>是<b>召唤光之蝶自动索敌</b>，交给它打就行。要打属性弱点只有剑／扇／伞三把能选，另外三把管的是续航、硬直与自动攻击。</div>

            <h2 class="h2">生活面：${LIFE.length} 种舞，刚好六件最费时的农活</h2>
            <p class="p">这作把农活拆成了六个动作，一种舞正好包一件——<b>不用切换工具，切舞就行</b>：</p>
            ${tbl(['要干的事', '用哪种舞', '原文要点'], LIFE.map(r => [esc(r[0]), r[1], esc(r[2])]), { leftFirst: true, cls: 'txt', colw: ['10rem', '6rem', 'auto'] })}
            <div class="note" style="border-left-width:3px">两处限制原文写得很具体，别按「随时能用」记：<b>鼓之舞对作物每天只能施展一次</b>；<b>剑之舞取种是概率升级</b>，最高只到 <b>lv9</b>，并且<b>用弓箭配合时也算割掉种子的判定</b>——想刷高品质种子，弓箭那一刀同样算数。</div>

            <div class="note">取自中文攻略站 gametoeasy.com《符文工房：龙之天地》<b>神器介绍</b>（post/1809，2025-06-22，极特攻略）。原文按<b>「战斗／生活」两栏</b>逐舞写，本页原样照录，只把长句拆进表格、不改字。三件事本站<b>没有替原文补</b>：① <b>必胜之舞</b>只有「根据村民数量增加威力」一句，未分栏，故其战斗／生活两格记「—」；② 战斗属性只写火／风／水三种，<b>鼓、鬼面、锡杖的战斗用法原文未写属性，本页也不替它归类</b>；③ 同一站的《赚钱攻略》（post/1854）把神器称作「<b>火焰刀神器</b>」「<b>鼓之神器</b>」，与本页的「剑之舞／鼓之舞」是两套说法，<b>本站不认定二者等同，两处各自照录</b>。</div>`;
}

/* 龙之天地（azuma）专属：料理配方（313 道，五类，不混入七作「料理」页的厨具/等级模板）
 * 数据 AZUMA_COOK（js/azuma_cook.js）：cats=[{k,rows}]，rows 每行 15 字段见 _build_azuma_cook.py */
function azumaCookHtml() {
    const A = (typeof AZUMA_COOK !== 'undefined') ? AZUMA_COOK : null;
    if (!A || !A.cats.length) return '';
    const cell = v => (v == null || v === '' || v === '—') ? '—' : v;
    const money = v => (v === '—' || v === '') ? '<span class="mon-no">—</span>' : v + 'G';
    const cats = A.cats;
    const total = cats.reduce((s, c) => s + c.rows.length, 0);
    const kindRows = cats.map(c => {
        const head = c.rows.slice(0, 3).map(r => r[0]).join('、');
        return [c.k, c.rows.length + ' 道', head + (c.rows.length > 3 ? '…' : '')];
    });
    const all = [];
    cats.forEach(c => c.rows.forEach(r => {
        const mats = [r[1], r[2], r[3], r[4]].filter(x => x && x !== '—').join('、') || '—';
        const hp = (r[7] && r[7] !== '—') ? (r[8] && r[8] !== '—' ? r[7] + '(+' + r[8] + '%)' : r[7]) : '—';
        const rp = (r[9] && r[9] !== '—') ? (r[10] && r[10] !== '—' ? r[9] + '(+' + r[10] + '%)' : r[9]) : '—';
        const eff = cell(r[11]);
        const get = [r[12], r[13], r[14]].map((x, i) => (x && x !== '—') ? (['解锁:', '宝箱:', '商店:'][i] + x) : null)
            .filter(Boolean).join('；') || '—';
        const key = r[0] + ' ' + c.k + ' ' + mats + ' ' + eff + ' ' + get;
        all.push([key, [r[0], c.k, mats, money(r[5]), money(r[6]), hp, rp, eff, get]]);
    }));
    return `
        <h2 class="h2">共 ${total} 道可制作物</h2>
        <p class="p">龙之天地的料理按<b>品类</b>分成五块：<b>菜肴、便当、加工品、甜点、酒</b>。和前作按「厨具 / 料理等级」组织不同，这一作<b>没有厨具分类、也没有料理等级门槛</b>——只要拿到食谱（任务奖励、青蛙石、商店购买），就能做。下面把「怎么做、要什么材料、吃了回多少、从哪拿」一次列全。</p>
        ${stat([['可制作物', total + ' 道'], ['品类', cats.length + ' 类'], ['菜肴', cats[0].rows.length + ' 道'], ['甜点', cats[3].rows.length + ' 道']])}
        <h2 class="h2">五类先看分类</h2>
        <p class="p">菜肴与甜点是大头（共 ${cats[0].rows.length + cats[3].rows.length} 道），便当和酒偏少。加工品是调味料与半成品（蛋黄酱、番茄酱、奶酪等），是做菜的上游——先备齐它们，后面的菜才做得出来。</p>
        ${tbl(['品类', '道数', '代表'], kindRows, { leftFirst: true, cls: 'txt', colw: ['4.4rem', '3rem', 'auto'] })}
        <h2 class="h2">全部 ${total} 道（可搜索）</h2>
        <p class="p">按品类排序。搜菜名找做法，<b>搜食材名反查能做什么菜</b>（例如搜「米饭」能列出所有用到米饭的便当）；搜「青蛙石」或具体地名，能找出在那处青蛙石能捡到的菜谱。</p>
        ${ftableOwn(['名称', '品类', '材料', '买价', '卖价', '恢复HP', '恢复RP', '特效', '获取'],
                ['5rem', '3rem', '11rem', '3rem', '3rem', '4.6rem', '4.6rem', '8rem', '11rem'],
                all, { cls: 'azcook', ph: '搜菜名、品类、食材或地名' })}
        <div class="note">取自 gametoeasy.com《符文工房：龙之天地》料理配方（post/1810）。原表<b>没有逐道菜的星级或难度</b>，本站不补。材料格式照录（如「芜菁×1」，缺项写「—」）；「恢复HP / 恢复RP」两列源表分固定值与百分比两格，本页合并为一格（如「280(+11%)」）。「获取」一栏合并了源表的「解锁条件 / 宝箱获取 / 商店获取」三列，任一为空即不显示该来源。<b>命名沿用 gametoeasy 中文译名</b>，与站内七作的 biligame 译名不完全一致。</div>`;
}

/* 龙之天地（azuma）专属：村民技能表（502 行，两套解锁体系，不混入七作模板） */
function azumaSkillHtml() {
    const R = (typeof SKILL_AZUMA !== 'undefined') ? SKILL_AZUMA.rows : [];
    if (!R.length) return '';
    const dash = '<span class="mon-no">—</span>';
    const L = s => '<span style="display:block;width:100%;text-align:left">' + s + '</span>';
    const blank = v => (!v || v === '—' || v === '0') ? dash : v;
    const isKizuna = lv => /^牵绊Lv\d+$/.test(lv);
    const isLevel = lv => lv === '初始' || /^\d+$/.test(lv);

    /* 按村民汇总 */
    const people = {};
    R.forEach(r => {
        const o = people[r[0]] = people[r[0]] || { n: 0, lv: [], kz: [], none: 0, desc: 0 };
        o.n++;
        if (isKizuna(r[2])) o.kz.push(r[2]);
        else if (isLevel(r[2])) o.lv.push(r[2]);
        else o.none++;
        if (r[3] !== '—' && r[3] !== '0' && r[3]) o.desc++;
    });
    const names = Object.keys(people);
    const withLv = names.filter(k => people[k].lv.length > 0);
    const onlyKz = names.filter(k => people[k].lv.length === 0);
    const maxNum = k => {
        const ns = people[k].lv.map(v => v === '初始' ? 0 : +v).filter(v => !isNaN(v));
        return ns.length ? Math.max.apply(null, ns) : null;
    };
    const kzFull = names.filter(k => people[k].kz.length === 10);
    const kzNone = names.filter(k => people[k].kz.length === 0);
    const kzAll = R.filter(r => isKizuna(r[2]));
    const kzQ = kzAll.filter(r => r[1].indexOf('强化') === 0);
    const lvAll = R.filter(r => isLevel(r[2]));
    const lvQ = lvAll.filter(r => r[1].indexOf('强化') === 0);

    /* 同一村民名下的同名技能（源表在不同牵绊等级重复列） */
    const cntKey = {};
    R.forEach(r => { const k = r[0] + '|' + r[1]; cntKey[k] = (cntKey[k] || 0) + 1; });
    const dupGroups = Object.keys(cntKey).filter(k => cntKey[k] > 1);
    const dupMax = dupGroups.slice().sort((a, b) => cntKey[b] - cntKey[a])[0];
    const dupMaxName = dupMax ? dupMax.split('|') : null;

    /* 等级分布 */
    const byLevel = {};
    R.forEach(r => { if (isLevel(r[2])) byLevel[r[2]] = (byLevel[r[2]] || 0) + 1; });
    const lvKeys = Object.keys(byLevel).sort((a, b) => (a === '初始' ? -1 : +a) - (b === '初始' ? -1 : +b));
    const lvTop = lvKeys.filter(k => k !== '初始').slice().sort((a, b) => +b - +a)[0];
    const hiHolders = R.filter(r => r[2] === lvTop).map(r => r[0] + '·' + r[1]);

    /* 描述覆盖 */
    const descRows = R.filter(r => r[3] !== '—' && r[3] !== '0' && r[3]);
    const dashRows = R.filter(r => r[3] === '—').length;
    const zeroRows = R.filter(r => r[3] === '0').length;
    const descTop = names.slice().sort((a, b) => people[b].desc - people[a].desc)[0];

    /* 与站内角色名单对照 */
    const G = (typeof GAMES !== 'undefined') ? GAMES.filter(x => x.id === 'azuma')[0] : null;
    const siteNames = (G && G.chars) ? G.chars.map(c => c.name) : [];
    const notSite = siteNames.length ? names.filter(n => siteNames.indexOf(n) < 0) : [];
    const notTable = siteNames.length ? siteNames.filter(n => names.indexOf(n) < 0) : [];
    const nearSame = notSite.filter(n => n.length >= 2 && siteNames.some(s => s.length === n.length && s !== n
        && s.split('').filter((ch, i) => ch !== n.charAt(i)).length === 1));
    const topTotal = names.slice().sort((a, b) => people[b].n - people[a].n || (a < b ? -1 : 1))[0];
    const lvCounts = lvKeys.filter(k => k !== '初始').map(k => byLevel[k]);
    const lvDense = lvKeys.filter(k => k !== '初始' && byLevel[k] === Math.max.apply(null, lvCounts));
    /* 档位表两两并排，免得 17 行的两列表在宽屏上左空一大片 */
    const lvLabel = k => k === '初始' ? '初始（开局）' : k + ' 级';
    const lvHalf = Math.ceil(lvKeys.length / 2);
    const lvGrid = [];
    for (let i = 0; i < lvHalf; i++) {
        const a = lvKeys[i], b = lvKeys[i + lvHalf];
        lvGrid.push([lvLabel(a), '<b>' + byLevel[a] + '</b> 条',
            b ? lvLabel(b) : '', b ? '<b>' + byLevel[b] + '</b> 条' : '']);
    }

    return `
        <h2 class="h2">${names.length} 位村民、${R.length} 条技能，分成两套完全分开的解锁体系</h2>
        <p class="p">这张表不是「一个技能树」，而是<b>两套体系并排</b>：一套是<b>角色自身等级</b>（初始、5、10……一直到 ${lvTop} 级）解锁的战斗技能，另一套是<b>牵绊等级</b>（牵绊Lv1～Lv10）解锁的强化。前者只有主角与恋人候补才有，后者几乎人人都有——两套的条数几乎一比二。</p>
        ${stat([['收录村民', names.length + ' 位'], ['技能条目', R.length + ' 条'], ['等级解锁', Object.keys(byLevel).reduce((a, k) => a + byLevel[k], 0) + ' 条'], ['牵绊解锁', R.filter(r => isKizuna(r[2])).length + ' 条']])}
        <p class="p">分开得很干净：<b>${withLv.length} 位有等级型技能、${onlyKz.length} 位一条都没有</b>。有等级型的正好是主角两位加全部 14 位恋人候补；没有的是村民——他们不参战，只靠牵绊给你加成。${kzNone.length ? '<b>' + kzNone.join('、') + '</b> 是唯一没有牵绊线的人，只走等级。' : ''}</p>

        <h2 class="h2">谁的技能最多：${topTotal} 一人 ${people[topTotal].n} 条</h2>
        <p class="p">按条数排。等级型条数多的人不代表更强，只代表他的成长线拉得更细（等级档位多则条数多）：</p>
        ${tbl(['村民', '等级解锁', '牵绊解锁', '最高等级'], names.slice().sort((a, b) => people[b].n - people[a].n || (a < b ? -1 : 1)).map(k => {
            const m = maxNum(k);
            return [k, people[k].lv.length ? '<b>' + people[k].lv.length + '</b> 条' : dash,
                people[k].kz.length ? '<b>' + people[k].kz.length + '</b> 条' : dash,
                m == null ? dash : (m === 0 ? '初始' : m + ' 级')];
        }), { leftFirst: true, colw: ['9rem', '9rem', '9rem', '9rem'] })}
        <div class="key"><b>${withLv.slice().sort((a, b) => people[b].lv.length - people[a].lv.length)[0]}</b> 的等级线有 ${people[withLv.slice().sort((a, b) => people[b].lv.length - people[a].lv.length)[0]].lv.length} 条，是全表最长的；${kzFull.length ? '<b>' + kzFull.length + ' 位</b>的牵绊线正好各 10 条（Lv1～Lv10 一格不缺）' : ''}。表里还有 <b>${dupGroups.length} 组同名技能</b>——同一村民在<b>不同牵绊等级</b>拿到同名的「强化能力值·某某」，最夸张的是 ${dupMaxName ? dupMaxName[0] + ' 的「' + dupMaxName[1] + '」进了 ' + cntKey[dupMax] + ' 个等级' : '—'}。源表把同名项分开列在不同等级下，本页照录不去重。</div>

        <h2 class="h2">等级线：从 5 级一档爬到 ${lvTop} 级</h2>
        <p class="p">等级型的技能按档位挂，${lvKeys.length} 个档位里「${lvKeys[0]}」是开局就有的。最高档 ${lvTop} 级只有 ${hiHolders.length} 条：<b>${hiHolders.join('、')}</b>——想拿这条，得先把对应角色练到 ${lvTop} 级。${lvQ.length === 0 ? '这 ' + lvAll.length + ' 条<b>没有一条</b>以「强化」开头，全是具名战技（猎追箭、升龙连击、流星雨这类），命名体系与牵绊线分得很干净。' : ''}</p>
        ${tbl(['档位', '技能数', '档位', '技能数'], lvGrid, { leftFirst: true, colw: ['9rem', '7rem', '9rem', '7rem'] })}
        <div class="key">档位密度差得不少：<b>${lvDense.join('、')} 级各 ${Math.max.apply(null, lvCounts)} 条</b>是最挤的，而 ${lvKeys.filter(k => k !== '初始' && byLevel[k] === Math.min.apply(null, lvCounts)).join('、')} 级只有 ${Math.min.apply(null, lvCounts)} 条。这说明不同角色的成长线并不一样长——档位密的那几级是多人共有的门槛，疏的那几级只有个别人能到。</div>

        <h2 class="h2">牵绊线：Lv1 到 Lv10，一人一条强化带</h2>
        <p class="p">牵绊型的 ${kzAll.length} 条里有 <b>${kzQ.length} 条</b>是「强化某某」的格式——强化战技、强化能力值这类；剩下的 ${kzAll.length - kzQ.length} 条是「配方某某」与「解锁战技」，即达到牵绊等级后开放某个配方或招式。${kzFull.length} 位的牵绊线正好是 Lv1～Lv10 十格，一格不缺${kzNone.length ? '；' + kzNone.join('、') + ' 没有牵绊线，只走等级' : ''}。</p>
        <div class="key">这条路比等级线省事：<b>牵绊靠送礼、同住、一起出战就能涨</b>，不用练级。村民不能上战场，但他们的牵绊技能全是给你的加成，想拿干净就得把村里人一个个喂上去。送什么、喜欢什么，在<a href="#/page/npcgift">村民喜好</a>页。</div>

        <h2 class="h2">${R.length} 条里只有 ${descRows.length} 条带描述</h2>
        <p class="p">源表的「描述」列<b>大部分是空的</b>：${dashRows} 行写「—」、${zeroRows} 行写「0」，两者在源站都是「这一格没填」。本页把这两种写法<b>统一显示为灰色破折号</b>，不替它编说明。真正有描述的只有 <b>${descRows.length} 条</b>，集中在战斗技能的攻击类——描述也多是一句「以某某武器发动的强力攻击」。</p>
        <div class="key">带描述最多的是 <b>${descTop}</b>（${people[descTop].desc} 条）。反过来，牵绊线的「强化某某」几乎全没描述——名字本身已经把效果说完了，源站就没再写。</div>

        ${notSite.length ? `<h2 class="h2">与站内角色名单对一遍：${notSite.length} 位还不在名单里</h2>
        <p class="p">这张表有 ${names.length} 人，本站「龙之天地」的角色名单有 ${siteNames.length} 位，两者并不是一套：技能表<b>多出 ${notSite.length} 位</b>，名单里也有 ${notTable.length} 位在技能表里没有。</p>
        ${tbl(['情况', '是谁'], [
            ['技能表有、名单没有', L(notSite.join('、'))],
            ['名单有、技能表没有', L(notTable.join('、'))]
        ], { leftFirst: true, colw: ['12rem', 'auto'] })}
        <div class="key">${nearSame.length ? '注意 <b>' + nearSame.join('、') + '</b>——名单里写作' + nearSame.map(n => '「' + siteNames.filter(s => s.length === n.length && s !== n && s.split('').filter((ch, i) => ch !== n.charAt(i)).length === 1)[0] + '」').join('、') + '，<b>一字之差</b>。哪一个是正确译名本站没有第三份源可以判定，两边都按各自原样照录，未强行统一。' : ''}多出来的这几位都是店主与村里人（技能表按游戏内 NPC 表列全，名单只收有剧情的角色），不是录错。</div>` : ''}

        <h2 class="h2">全部 ${R.length} 条技能（可搜索）</h2>
        <p class="p">按源表原顺序排列，<b>未按村民或等级重排</b>，方便拿着源表对行。搜村民名或技能名都能筛：</p>
        ${ftableOwn(['村民', '技能', '等级', '描述'],
            ['7rem', 'auto', '8rem', 'auto'],
            R.map(r => [r[0] + ' ' + r[1], [r[0], r[1], isKizuna(r[2]) ? '<b>' + r[2] + '</b>' : (r[2] === '初始' ? '<b>初始</b>' : ('<b>' + r[2] + '</b>')), L(blank(r[3]))]]),
            { ph: '输入村民名或技能名筛选' })}
        <div class="note">取自 ${(typeof SKILL_AZUMA !== 'undefined') ? SKILL_AZUMA.src : 'gametoeasy'}，共 ${R.length} 行。<b>描述列的「—」与「0」都按灰色破折号显示</b>（源站两种写法都表示未填），原文数值一个未改；等级列照录——数字与「初始」为角色等级，「牵绊LvN」为牵绊等级，两套体系不互相换算。</div>
        <div class="jump">
            <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">送什么涨牵绊</div></a>
            <a href="#/page/azuma_npc"><div class="jp-t">角色详情</div><div class="jp-s">主角与候补一人一页</div></a>
            <a href="#/page/azuma_boss"><div class="jp-t">BOSS 战</div><div class="jp-s">练级路上的对手</div></a>
        </div>`;
}

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
        <div class="table mon-table"><table><thead><tr><th>名称</th><th style="width:4.4rem">骑乘</th><th>出现区域</th><th>最爱物品</th><th>喜欢物品</th><th>讨厌物品</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* 龙之天地（azuma）专属：魔物与伙伴——本作没有牧场与产出，伙伴＝坐骑／同行。
   与前七作「刷毛→投喂→爱心→每天四步」的流程页分开，七作的流程没有可核实源说明在本作通用，故不搬。 */
function azumaBeastHtml() {
    const M = (typeof AZUMA_MON !== 'undefined') ? AZUMA_MON : [];
    const C = (typeof AZUMA_BOSS_CAP !== 'undefined') ? AZUMA_BOSS_CAP : [];
    const N = (typeof AZUMA_BOSS_MAIN !== 'undefined') ? AZUMA_BOSS_MAIN : [];
    if (!M.length && !C.length) return '';
    const ride = M.filter(x => x[1] === '能');
    const capRide = C.filter(x => x[3] === '可');
    const cell = v => (v && v !== '×') ? v : '<span class="mon-no">—</span>';
    return `
        <h2 class="h2">本作的「伙伴」是坐骑，不是牲畜</h2>
        <p class="p">前七作把魔物收进牧场产奶下蛋，龙之天地没有这套循环：收服之后它跟你出门，能骑的还能当脚力。源表记这件事的方式就是「骑乘：能／×」，<b>所以本页也只按这一列说事</b>，不拿前七作的产出表往本作身上套。</p>
        ${stat([['收录魔物', M.length + ' 只'], ['可骑乘', ride.length + ' 只'], ['不可骑乘', (M.length - ride.length) + ' 只'], ['可捕 BOSS', C.length + ' 只']])}
        <h2 class="h2">能骑的 ${ride.length} 只</h2>
        <p class="p">源表标「能」的全部 ${ride.length} 只，按原表顺序排，附出现区域与最爱物品——<b>骑着它跑图，顺手喂最爱的东西，好感涨得最快</b>。</p>
        ${tbl(['魔物', '出现区域', '最爱物品'], ride.map(x => [x[0], x[2] || '—', x[3] || '—']), { leftFirst: true, colw: ['7.2rem', 'auto', 'auto'], cls: 'txt', left: [1, 2] })}
        <h2 class="h2">可捕获 BOSS：${C.length} 只，其中 ${capRide.length} 只能骑</h2>
        <p class="p">BOSS 级的也能收，只是门槛高。弱点列决定你拿什么打，最爱列决定收服时喂什么；体型是源表的档位标注，不是数值。</p>
        ${tbl(['BOSS', '武器弱点', '属性弱点', '可骑', '体型', '最爱'], C.map(x => [x[0], cell(x[1]), cell(x[2]), x[3] === '可' ? '<span class="mon-yes">可</span>' : '<span class="mon-no">—</span>', cell(x[4]), cell(x[5])]), { leftFirst: true, colw: ['7.4rem', '5rem', '5rem', '3rem', '3rem', 'auto'], cls: 'txt', left: [1, 2, 5] })}
        <div class="note">这里为什么没有「怎么驯服」：前七作那套<b>刷毛 → 投喂 → 爱心 → 每天四步</b>的流程，在本作是否通用、数值怎么算，本站没有可核实的流程源，所以不把七作的步骤搬过来充数。上面两张表只回答两件事：<b>谁能骑、打它该带什么</b>。</div>
        <div class="jump">
            <a href="#/page/azuma_mon"><div class="jp-t">魔物与喜好</div><div class="jp-s">${M.length} 只的区域与最爱／喜欢／讨厌物品</div></a>
            <a href="#/page/azuma_boss"><div class="jp-t">BOSS 战</div><div class="jp-s">可捕 ${C.length} 只＋主线 ${N.length} 场</div></a>
        </div>`;
}

/* 龙之天地（azuma）专属：角色详情 16 位（post/1837–1852，一页一人）
   与「村民喜好」页的 17 位村民是两批人，两页零重叠，这里不重复收录村民。 */
function azumaNpcHtml() {
    const A = (typeof NPC_AZUMA !== 'undefined') ? NPC_AZUMA.chars : [];
    if (!A.length) return '';
    const SEA = ['春', '夏', '秋', '冬'];
    const bdKey = c => {
        const m = /^([春夏秋冬])月?(\d+)日$/.exec(c.bd || '');
        return m ? SEA.indexOf(m[1]) * 100 + Number(m[2]) : 9999;
    };
    const list = A.slice().sort((a, b) => bdKey(a) - bdKey(b) || a.n.localeCompare(b.n));
    const isBond = v => /牵绊/.test(v);
    const dash = '<span class="mon-no">—</span>';
    const J = a => (a && a.length) ? a.join('、') : dash;
    const has = (a, k) => a && a[k] && a[k].length;

    const nIntro = A.reduce((s, c) => s + c.intro.length, 0);
    const nSkill = A.reduce((s, c) => s + c.skills.length, 0);
    const nCvJp = A.filter(c => c.cvJp).length;
    const nCvEn = A.filter(c => c.cvEn).length;
    const nBond = A.filter(c => c.skills.some(x => isBond(x[1]))).length;

    /* 按季节数一遍生日，不手写数字 */
    const bySea = SEA.map(k => [k, list.filter(c => (c.bd || '').charAt(0) === k).length]);
    const noBd = list.filter(c => !c.bd).length;
    const mostSkill = list.slice().sort((a, b) => b.skills.length - a.skills.length)[0];
    const mostLv = list.slice().sort((a, b) =>
        b.skills.filter(x => !isBond(x[1])).length - a.skills.filter(x => !isBond(x[1])).length)[0];

    /* 与「村民技能」页（post/1828）逐人对一遍：同一批人、同一套技能，两页的条数与档位对不上 */
    const SR = (typeof SKILL_AZUMA !== 'undefined') ? SKILL_AZUMA.rows : [];
    const byP = {};
    SR.forEach(r => { (byP[r[0]] = byP[r[0]] || []).push([r[1], r[2]]); });
    const cnt2 = arr => [arr.filter(x => !isBond(x[1])).length, arr.filter(x => isBond(x[1])).length];
    const tier = arr => {
        const m = {};
        arr.forEach(x => { const g = /牵绊Lv(\d+)/.exec(x[1]); if (g) m[g[1]] = x[0]; });
        return m;
    };
    const lvOnly = arr => arr.filter(x => !isBond(x[1])).map(x => x[1]);
    const cmp = list.map(c => {
        const mine = c.skills.map(x => [x[0], x[1]]), other = byP[c.n] || [];
        if (!other.length) return null;
        const a = cnt2(mine), b = cnt2(other);
        const ta = tier(mine), tb = tier(other);
        const diff = Object.keys(ta).filter(k => tb[k] && tb[k] !== ta[k]).sort((x, y) => Number(x) - Number(y));
        /* 本页多出来的等级档（技能页在这一档没有条目） */
        const extra = lvOnly(mine).filter(v => lvOnly(other).indexOf(v) < 0);
        /* 举个能验证的例子：找一档「本页这招在技能页被排到别的档」的 */
        const base = v => String(v).replace(/·(强|5%|10%)$/, '');
        let ex = null;
        diff.forEach(k => {
            if (ex) return;
            const nm = ta[k], b = base(nm);
            const hit = other.filter(x => isBond(x[1]) && x[0] !== nm && x[0].indexOf(b) >= 0)[0];
            if (!hit) return;
            const lv2 = /牵绊Lv(\d+)/.exec(hit[1])[1];
            if (Number(lv2) !== Number(k)) ex = { lv: k, mine: nm, other: tb[k], moved: lv2, otherName: hit[0] };
        });
        return { n: c.n, a: a, b: b, diff: diff, extra: extra, ex: ex };
    }).filter(x => x && (x.a[0] !== x.b[0] || x.a[1] !== x.b[1] || x.diff.length));
    const tierDiff = cmp.filter(x => x.diff.length);
    const cntDiff = cmp.filter(x => x.a[0] !== x.b[0] || x.a[1] !== x.b[1]);
    const extraLv = [];
    cmp.forEach(x => x.extra.forEach(v => { if (extraLv.indexOf(v) < 0) extraLv.push(v); }));
    extraLv.sort((x, y) => Number(x) - Number(y));
    const exOne = tierDiff.filter(x => x.ex && x.ex.moved)[0];

    const card = c => {
        const lvN = c.skills.filter(x => !isBond(x[1])).length;
        const bdN = c.skills.filter(x => isBond(x[1])).length;
        const tasteRow = (o, k1, k2) => (has(o, k1) || has(o, k2))
            ? `${has(o, k1) ? '<b>最喜欢</b> ' + J(o[k1]) : ''}${has(o, k1) && has(o, k2) ? '　／　' : ''}${has(o, k2) ? '<b>喜欢</b> ' + J(o[k2]) : ''}`
            : '';
        const badRow = (o, k1, k2) => (has(o, k1) || has(o, k2))
            ? `${has(o, k1) ? '<b>讨厌</b> ' + J(o[k1]) : ''}${has(o, k1) && has(o, k2) ? '　／　' : ''}${has(o, k2) ? '<b>最讨厌</b> ' + J(o[k2]) : ''}`
            : '';
        const g = c.gift || {};
        const giftBits = [
            has(g, 'ret') ? '<b>回礼</b> ' + J(g.ret) : '',
            has(g, 'birthday') ? '<b>给你的生日礼物</b> ' + J(g.birthday) : '',
            has(g, 'bath') ? '<b>泡澡后的乐子</b> ' + J(g.bath) : '',
            has(g, 'bento') ? '<b>便当</b> ' + J(g.bento) : '',
            has(g, 'cook') ? '<b>一起烹饪</b> ' + J(g.cook) : '',
        ].filter(Boolean);
        const rows = [
            ['礼物喜好', [tasteRow(c.like, 'best', 'good'), badRow(c.like, 'bad', 'worst')].filter(Boolean).join('<br>') || dash],
            ['共度时光', [tasteRow(c.topic, 'best', 'good'), badRow(c.topic, 'bad', 'worst')].filter(Boolean).join('<br>') || dash],
            ['互动', giftBits.length ? giftBits.join('<br>') : dash],
            ['技能', `等级型 <b>${lvN}</b> 条${bdN ? '／牵绊型 <b>' + bdN + '</b> 条' : '／<b>无牵绊型</b>'}`],
        ];
        return `
        <h3 class="h3">${c.n}${c.jp ? '（' + c.jp + (c.en ? '、' + c.en : '') + '）' : ''}</h3>
        ${c.intro.length ? c.intro.map(x => `<p class="p">${x}</p>`).join('') : ''}
        ${tbl(['项目', '内容'], rows, { leftFirst: true, colw: ['6.2rem', 'auto'], left: [1], cls: 'azuq' })}
        <details class="mon-fold"><summary>展开 ${c.n} 的技能表（${c.skills.length} 条）</summary>
        ${tbl(['技能', '等级', '描述'], c.skills.map(x => [
        x[0], x[1], (x[2] && x[2] !== '0' && x[2] !== '—') ? x[2] : dash,
    ]), { colw: ['auto', '5.6rem', 'auto'], left: [0, 2], cls: 'azuq' })}
        </details>`;
    };

    return `
        <h2 class="h2">16 个人，一人一页，和村里那 17 位不是同一批</h2>
        <p class="p">龙之天地有 16 位角色在源站各占一篇单独的角色页（post/1837–1852），这里按<b>生日</b>排一遍收全。「村民喜好」页收录的 17 位（坂木、拓弥、铃、飞燕、翡翠、草津、小太郎、八千代、萨扎、渡濑、空、海、陆、花、露、夜、摩可绒）与这 16 位<b>零重叠</b>——两页各查各的，本页不重复列村民的礼物清单。</p>
        ${stat([
        ['角色', A.length + ' 人'],
        ['简介', nIntro + ' 段'],
        ['技能', nSkill + ' 条'],
        ['有日语配音', nCvJp + ' 人'],
    ])}
        <p class="p">源文有两种版式：<b>1837–1846</b> 是「生日、喜好物品、喜欢的话题、互动赠礼以及技能表」，<b>1847–1852</b> 是「角色图鉴」。两边字段一致，差别只在后者没有「英语配音」那一行——所以全篇只有 <b>${nCvEn} 人</b>有英配记录，其余留空，不替它们补。</p>
        <p class="p">生日按季节排开是 ${bySea.map(x => x[0] + ' ' + x[1] + ' 人').join('、')}${noBd ? '，另有 ' + noBd + ' 人源文没写生日' : '，16 人一个不缺'}；技能最多的是<b>${mostSkill.n}</b>（${mostSkill.skills.length} 条），其中等级型最多的是<b>${mostLv.n}</b>（${mostLv.skills.filter(x => !isBond(x[1])).length} 条）；有牵绊技能的 <b>${nBond} 人</b>，无牵绊的 <b>${A.length - nBond} 人</b>。</p>
        ${tbl(['生日', '名字', '原名', '日语配音', '技能'], list.map(c => [
        c.bd || dash, '<b>' + c.n + '</b>', c.jp + (c.en ? '、' + c.en : ''),
        c.cvJp || dash,
        c.skills.filter(x => !isBond(x[1])).length + (c.skills.some(x => isBond(x[1])) ? ' + 牵绊 ' + c.skills.filter(x => isBond(x[1])).length : ''),
    ]), { colw: ['5.4rem', '6.4rem', 'auto', '9rem', '7.4rem'], left: [2], cls: 'azuq' })}
        <div class="note">「原名」列照源文写法，日文在前、英文在后。「日语配音」一列<b>${A.filter(c => !c.cvJp).map(c => c.n).join('、') || '全数齐全'}</b>${A.filter(c => !c.cvJp).length ? ' 的源文是空的（写了「日语配音：」后面没填人），照录不补。' : ' 全部有记录。'}</div>

        <h2 class="h2">一位一位看</h2>
        <p class="p">简介是源文原文，<b>繁体字照录、未转简体、未改写</b>——这类人物介绍一旦顺手改成简体，就跟原文对不上了，也对不上别的资料站。礼物四档、话题四档、互动五项都是原表内容；技能表收在折叠区里，点开才展开。</p>
        ${list.map(card).join('')}

        <h2 class="h2">同一批人，「村民技能」页的数字对不上</h2>
        <p class="p">站内另有一页「村民技能」（源 post/1828），收的是同一批人的技能表。<b>两页逐人对下来，${cmp.length} 人条数或档位不一致</b>——不是解析漏了，是两份源文本身写得不一样。这里把差异原样摆出来，两边都不改：</p>
        ${tbl(['角色', '本页（等级型／牵绊型）', '技能页（等级型／牵绊型）', '同一档牵绊技名不同'], cmp.map(x => [
        '<b>' + x.n + '</b>',
        x.a[0] + ' ／ ' + x.a[1],
        x.b[0] + ' ／ ' + x.b[1],
        x.diff.length ? '<b>' + x.diff.length + '</b> 档' + (x.ex ? '（Lv' + x.ex.lv + '：本页「' + x.ex.mine + '」／技能页「' + x.ex.other + '」）' : '') : dash,
    ]), { colw: ['6.4rem', 'auto', 'auto', 'auto'], left: [1, 2, 3], cls: 'azuq' })}
        ${cntDiff.length ? `<div class="key">条数上的差有两种：<b>${cntDiff.filter(x => x.a[1] === 0).map(x => x.n).join('、') || '无'}</b>在本页一条牵绊型技能都没有（源文那一篇就没列牵绊那一段），技能页却有 10 条；其余 ${cntDiff.filter(x => x.a[1] > 0).length} 位的<b>等级型</b>比技能页多，多出来的档位是 <b>${extraLv.map(v => 'Lv' + v).join('、')}</b>——本页有，技能页没有。</div>` : ''}
        ${tierDiff.length ? `<div class="note">最后一列的「同一档牵绊技名不同」是更要紧的一种，里面其实混着两类：<b>一类只是译法不同</b>——同一招在本页叫「暗黑斩」、技能页叫「暗斩」，或本页写「强化能力值·物理攻击力·10%」、技能页写「强化能力值·物理攻击力」；<b>另一类看着是换了招</b>${exOne ? `，比如 <b>${exOne.n}</b> 的牵绊Lv${exOne.ex.lv}：本页是「${exOne.ex.mine}」，技能页同一档是「${exOne.ex.other}」，而「${exOne.ex.mine}」这招在技能页被排到了 <b>Lv${exOne.ex.moved}</b>（写作「${exOne.ex.otherName}」）` : ''}。两页因此<b>没法一条一条对上</b>，能对上的只有档位。没有第三份来源能判谁对，所以两页各留各的，谁也不合并、谁也不改——按自己信的那份用。</div>` : ''}

        <div class="jump">
            <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">村里那 17 位的礼物清单</div></a>
            <a href="#/page/azuma_skill"><div class="jp-t">村民技能</div><div class="jp-s">全作 502 条技能按人列出</div></a>
            <a href="#/page/request"><div class="jp-t">委托任务</div><div class="jp-s">东国任务六条线</div></a>
        </div>
        <div class="note">数据取自 ${(typeof NPC_AZUMA !== 'undefined') ? NPC_AZUMA.src : 'gametoeasy'}，一页一人、共 16 篇，由 <code>_build_npc_azuma.py</code> 解析生成。<b>源页 1842 的标题写的是「伊吕波」，正文其实是玛罗（マウロ、Mauro）</b>——标题串了页，内容为准，这里按正文收录玛罗。字段一律照录：空着的配音、没写的生日、只有两个字的列，都不替它补。</div>`;
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

/* 符文工房 海洋（RFO）主线流程：单一来源《符文工厂海洋（最强攻略）》xls「主线」工作表。
   原表是攻略本作者的中文整理稿，人名与任务名夹日文原文、写法不统一，本页照录原文，
   不统一译名、不补缺字；原表自身对不上的地方（人名与括注日文不匹配）只在页尾点出，不改正文。 */
function rfoMainHtml() {
    const M = (typeof RFO_MAIN !== 'undefined') ? RFO_MAIN : null;
    if (!M || !M.steps.length) return '<p class="p">主线数据未加载。</p>';
    const S = M.steps;
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const nDep = S.reduce((a, s) => a + (s.d.join('').match(/依赖/g) || []).length, 0);
    const upg = S.filter(s => /巨人强化/.test(s.t));
    const TPL = ['土精灵神殿', '火精灵神殿', '水精灵神殿', '风精灵神殿'];
    const tpl = S.filter(s => TPL.some(k => s.t.indexOf(k) >= 0 || s.d.join('').indexOf(k) >= 0));
    const tplOf = k => S.filter(s => s.t.indexOf(k) >= 0 || s.d.join('').indexOf(k) >= 0).map(s => s.i);

    /* 原表在每个步骤里夹着「注意／记得／需要」这类提醒，摘出来单列，标回步号，不改一字 */
    const TIP = /注意|记得|需要|必须先|抓一只|建议|别忘了|请先/;
    const tips = [];
    S.forEach(s => s.d.forEach(d => {
        (d.match(/[^。]+。?/g) || []).forEach(x => {
            const t = x.trim();
            if (TIP.test(t) && t.replace(/。$/, '').length > 6) tips.push({ i: s.i, t });
        });
    }));

    const rows = S.map(s => [s.i, esc(s.t), s.d.map(esc).join('<br>')]);
    return `
            <p class="p">海洋的主线是<b>「依赖驱动」</b>的：几乎每一步推进都挂在某位 NPC 的依赖上——做完依赖，海图上才出现新坐标；挖出岛或打通神殿，拿到核心强化巨人，才开得动下一片海域。全程 <b>${S.length} 步</b>，下面照攻略本原样一步一段。</p>
            ${stat([['步骤', S.length + ' 步'], ['「依赖」出现', nDep + ' 次'], ['巨人强化', upg.length + ' 次'], ['四座神殿', tpl.length + ' 步']])}

            <h2 class="h2">主线全流程</h2>
            <p class="p">左列是原表的步号，右列是原表正文。<b>原表把「关键道具」「在哪触发」写在同一段里</b>，所以段落偏长——按步号跳着看即可，不必逐句读。</p>
            ${tbl(['#', '步骤', '原表正文'], rows, { leftFirst: true, left: [2], cls: 'rfomain', colw: ['2.6rem', '9.5rem', ''] })}

            <h2 class="h2">三次巨人强化，卡在主线中间</h2>
            <p class="p">巨人不是一次升级到位的。前三个精灵神殿各掉一个颜色的核心，<b>交给伊莲娜（エレナ）</b>巨人才解锁一种新的移动能力：土殿的 グリーンコア → 过洋流（第 ${tplOf('土精灵神殿')[0]}～${upg[0].i} 步）、火殿的 レッドコア → 进深水（第 ${tplOf('火精灵神殿')[0]}～${upg[1].i} 步）、水殿的 ブルーコア（第 ${upg[2].i} 步）。三次强化就到此为止——风殿之后直接进终局。</p>
            <p class="p">这也是海洋最容易卡住的地方：<b>核心要先交给伊莲娜才会生效</b>，尤其第二次原表专门注明「这次是不会自动拿走的」，背包里放着不会升级，还得每天去追问进度，否则要拖好几天。</p>

            <h2 class="h2">原表夹在正文里的 ${tips.length} 处提醒</h2>
            <p class="p">下面这些句子是从上面正文里摘出来的，<b>只摘不改、句尾保留原标点</b>；漏了往往要多跑一趟：</p>
            ${tbl(['位置', '原句'], tips.map(t => ['第 ' + t.i + ' 步<span class="mon-desc">' + esc(S[t.i - 1] ? S[t.i - 1].t : '') + '</span>', esc(t.t)]), { leftFirst: true, left: [1], cls: 'rfomain', colw: ['5.4rem', ''] })}

            <h2 class="h2">照录不改的几处</h2>
            <ul class="ul">
                <li class="li"><b>人名与括注日文对不上的地方不修</b>：第 15 步写「伊蕾克拉（バッカス）」，可「伊蕾克拉」在第 13 步对应的是<b>エレクトラ</b>，而バッカス 在别处是「巴克斯」——原表这一处把中文名和日文名配错了，本页照录，不替它选一个。</li>
                <li class="li"><b>日文任务名不译</b>：正文里的「はじめてのかわら版」「海の神殿の海図」等一律保留原文，攻略本本身没有给中文名，本站不代翻。</li>
                <li class="li"><b>原表的时间写法照抄</b>：「晚上8.00」这种用点号当冒号的写法不改；第 24 步冰壁的「ワカサギ銅、銀、金各一匹」是三条不同的鱼，不是同一条。</li>
                <li class="li"><b>第 31 步的 12 人名单是「全部结婚候补」</b>——原表列了 リリ、オデット、アイリス、エレクトラ、メルプリン、エレナ、セーラ、パンドラ、命、ジョー、ジェームス、ビスマルク 共 12 位，与「喜好」表的分组口径不同（那边花嫁 10／花婿 4，合计 14 位），两处数字并存，不合并。</li>
            </ul>
            <div class="note">主线之外，攻略本另收了 <b>${(typeof RFO_QUEST !== 'undefined' && RFO_QUEST.quests) ? RFO_QUEST.quests.length : 0} 条委托</b>（18 位委托人）与 <b>${(typeof RFO_FISH_SPOT !== 'undefined') ? RFO_FISH_SPOT.length : 0} 条钓点记录</b>，各在对应页。</div>
            <div class="jump">
                <a href="#/page/request">
                    <div class="jp-t">委托任务</div>
                    <div class="jp-s">18 位委托人、188 条任务的条件与报酬</div>
                </a>
                <a href="#/page/rfosys">
                    <div class="jp-t">奖杯与许愿</div>
                    <div class="jp-s">38 个奖杯、龙庭四项许愿、巨人怎么开</div>
                </a>
            </div>`;
}

/* ---------- 边境（RFF）主线与角色事件 ----------
   数据只有一份来源：《边境主线支线流程机翻.txt》（机翻，GB18030，原文 20,896 字）。
   RFF_EVENT 由 _build_rff_event.py 生成：主线 37 条 + 角色事件 210 条 + 特殊 23 条。
   文本是机翻，本页只做「分节 + 可检索」，不改写、不润色、不补全。 */
function rffEventHtml() {
    const E = (typeof RFF_EVENT !== 'undefined') ? RFF_EVENT : null;
    if (!E) return '<p class="p">边境的事件数据未加载。</p>';
    const esc = t => String(t === undefined || t === null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const M = E.main;
    const OTHERS = ['鲸鱼', '遗迹', '结婚'];
    const CG = E.groups.filter(x => OTHERS.indexOf(x.who) < 0);
    const OG = E.groups.filter(x => OTHERS.indexOf(x.who) >= 0);
    const sumOf = arr => arr.reduce((a, x) => a + x.list.length, 0);
    const nChar = sumOf(CG), nOther = sumOf(OG);
    const all = M.concat.apply(M, E.groups.map(x => x.list));
    const nQ = all.filter(x => x.q).length;

    /* 七次做梦：全主线里唯一贯穿始终的叙事线，条件都是「早上 5 点之前在自家睡觉」 */
    const dreams = M.filter(x => /做梦/.test(x.c + x.r));
    /* 不是「上一步发生过 + 找谁说话」就能推进的节点，逐条挑出来 */
    const GATE = [5, 7, 11, 14, 19, 23, 29, 30, 36].map(n => M.filter(x => x.n === n)[0]).filter(Boolean);
    /* 角色组按条数排，最多的放前面 */
    const CGsort = CG.slice().sort((a, b) => b.list.length - a.list.length || a.who.localeCompare(b.who));

    /* 机翻名 → 站内「居民」页定稿译名（能一一对上的才列） */
    const NAME_MAP = [
        ['蜜斯特', '密丝特', 'ミスト'], ['罗洁塔', '萝赛塔', 'ロゼッタ'],
        ['梅罗迪', '美乐蒂', 'メロディ'], ['塔巴萨', '塔芭莎', 'タバサ'],
        ['尤妮', '尤尼', 'ユーニ'], ['桃乐普', '多洛普', 'ドロップ'],
        ['阿奈特', '阿涅多', 'アネット'], ['赛露菲', '赛尔菲', 'セルフィ'],
        ['迦娜莎', '甘妮萨', 'ガネーシャ'], ['马鲁克', '马尔科', 'マルコ'],
        ['罗兰', '罗兰德', 'ローランド'], ['拉格纳', '拉格那', 'ラグナ'],
    ];

    return `
            <p class="p">边境的主线与支线在游戏里<b>没有任何列表可查</b>——不显示条件、不记录进度，触发全靠碰。这一页把攻略资料里的 <b>${all.length} 条事件</b>摊平成两张表：主线 ${M.length} 步，角色与结局支线 ${nChar + nOther} 条。</p>
            ${stat([['主线', M.length + ' 步'], ['角色事件', nChar + ' 条 / ' + CG.length + ' 人'], ['结局与遗迹', nOther + ' 条'], ['合计', all.length + ' 条']])}
            <div class="note"><b>这一页的文字是机翻，照录。</b>来源《边境主线支线流程机翻.txt》（20,896 字）只有这一份，没有第二个来源可校，所以语句不通、译名与站内定稿不一致的地方<b>一处都没有改</b>——改了就成了本站自己写的东西。译名对照放在页尾，找人对不上时先看那张表。</div>

            <h2 class="h2">主线：${M.length} 步，从踏上鲸鱼岛到虚无世界</h2>
            <p class="p">一步一行，条件与结果都照原文。整条主线只有一处真正的分支：<b>第 14 步触发过，第 19 步就能回避与黑艾莉丝的战斗</b>；不打也可以，原表专门补了一句「这个事件不发生也没关系」，代价是少一段艾莉丝的剧情。</p>
            ${tbl(['步', '条件', '结果'], M.map(x => ['第 ' + x.n + ' 步', esc(x.c), esc(x.r)]),
        { left: [1, 2], cls: 'rfomain', colw: ['5.6rem', '19rem', ''] })}

            <h2 class="h2">七次做梦，是主线真正的骨架</h2>
            <p class="p">主线里有一类步骤，条件永远写着同一句：<b>早上 5 点之前在自家睡觉</b>。睡着之后是梦，梦醒之后剧情才往前走——艾莉丝那条线几乎全靠这个推。共 ${dreams.length} 次，漏掉不会立刻卡住，但会一直等下去。</p>
            ${tbl(['步', '这一觉醒来'], dreams.map(x => ['第 ' + x.n + ' 步', esc(x.r)]),
            { left: [1], cls: 'rfomain', colw: ['5.6rem', ''] })}

            <h2 class="h2">九个不是「说句话就过」的节点</h2>
            <p class="p">其余步骤的条件基本都是「上一步已经发生，然后找某人说话」。下面这 ${GATE.length} 条不是——它们要等日期、要种地、要好感、要别人先登场，或者要背包留空。卡住的时候先看这里。</p>
            ${tbl(['步', '原表条件'], GATE.map(x => ['第 ' + x.n + ' 步', esc(x.c)]),
                { left: [1], cls: 'rfomain', colw: ['5.6rem', ''] })}

            <h2 class="h2">角色事件：${CG.length} 人、${nChar} 条</h2>
            <p class="p">按条数从多到少排。每个人的事件链都是一条线：前一条不发生，后一条不会出现。表里「条件」一栏写的「【某某-N】已经发生」就是这条线的锁。<b>点人名展开</b>。</p>
            ${CGsort.map(g => `
                <details class="mon-fold">
                    <summary>${esc(g.who)}　${g.list.length} 条</summary>
                    ${tbl(['事件', '条件', '结果'], g.list.map(x => [
                    (g.who + '·' + x.n) + (x.sub ? '<span class="mon-desc">' + esc(x.sub) + '</span>' : ''),
                    esc(x.c), esc(x.r)]),
                    { left: [1, 2], cls: 'rfomain', colw: ['7.4rem', '18rem', ''] })}
                </details>`).join('')}

            <h2 class="h2">另外三块：鲸鱼、遗迹、结婚</h2>
            <p class="p">这三块在原文里不是某个人的事件链，而是<b>另一套流程</b>——鲸鱼岛的对话与许愿、四座遗迹依次开放的顺序、以及从告白到结婚的步骤。</p>
            ${OG.map(g => `
                <h3 class="h3">${esc(g.who)}（${g.list.length} 条）</h3>
                ${tbl(['#', '条件', '结果'], g.list.map(x => [
                    (g.who + '·' + x.n) + (x.sub ? '<span class="mon-desc">' + esc(x.sub) + '</span>' : ''),
                    esc(x.c), esc(x.r)]),
                    { left: [1, 2], cls: 'rfomain', colw: ['7.4rem', '18rem', ''] })}`).join('')}
            <div class="note">「遗迹」这 7 条里<b>有两个「遗迹·6」</b>——原文的编号就是这么写的（一条是「蔓草遗迹可以进入」，一条是「雪草遗迹可以进入」），照录不改。这两条不是重复，是原整理者漏了改号。</div>

            <h2 class="h2">机翻名与站内译名对照</h2>
            <p class="p">页面正文里的名字沿用机翻写法（蜜斯特、罗洁塔、梅罗迪…），站内「居民」页用的是定稿译名（密丝特、萝赛塔、美乐蒂…）。同一人两套写法，这里给对照，<b>正文不改</b>——改了就没法按原文回查。</p>
            ${tbl(['机翻（本页）', '站内定稿', '日文'], NAME_MAP.map(([a, b, j]) => [esc(a), esc(b), esc(j)]),
                { leftFirst: true, cls: 'txt', colw: ['9rem', '9rem'] })}
            <div class="note"><b>「卡侬」「布兰迪克」两位，站内「居民」页没有收录</b>——前者是教拉格纳魔法的人（火球杖、燃烧之杖、深红之杖都从他这儿拿，等级门槛 2／10／20／30／65），后者是村里那个专门找麻烦的人（弄乱田地、堵家门、若草遗迹决斗，16 条）。两人的日文名在这份机翻里没有标，本站不猜，先照机翻名字放着。
            ${nQ ? '<br>原文里有 <b>' + nQ + ' 条标签带问号</b>（如「艾莉丝-06?」），是原整理者自己也不确定的，照录。' : ''}</div>`;
}

/* ---------- 符文工房 3（RF3 / RF3SP）主线流程 ----------
   单一来源：《符文工房3全攻略》（NW 旅团 qisiwole 原创+整理）「简要攻略」章节，8 章 56 步。
   数据 RF3_MAIN 由 _build_rf3_main.py 切分生成；本页只加「由这 56 步本身算得出来」的统计，
   不补写原表没有的判断；标点、表情、译名一律照录。 */
function rf3MainHtml() {
    const M = (typeof RF3_MAIN !== 'undefined') ? RF3_MAIN : null;
    if (!M || !M.chapters.length) return '<p class="p">主线数据未加载。</p>';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const CH = M.chapters;
    const N = CH.reduce((a, c) => a + c.steps.length, 0);

    /* 摊平：记下每一步属于哪章、是本章第几步，后面所有统计都从这张表出，不再硬编码 */
    const flat = [];
    CH.forEach(c => c.steps.forEach((s, i) => flat.push({ ch: c.t, n: i + 1, s })));

    /* BOSS：原文只有「遇到BOSS…」「引出BOSS…」两种写法（「战胜BOSS后…」不是出场，要排掉）；
       名字包在「」里，最后一只写成「遇到BOSS水神龙『阿库纳比特』」，称呼留在句里不拆。 */
    const boss = [];
    flat.forEach(x => {
        const m = x.s.match(/(遇到|引出)BOSS([^。]*)/);
        if (!m) return;
        const names = (m[2].match(/「[^」]*」/g) || []).map(v => v.slice(1, -1));
        boss.push({ ch: x.ch, n: x.n, names, sent: x.s });
    });
    const nBossName = boss.reduce((a, b) => a + b.names.length, 0);

    /* 通行门槛：原文反复出现的三类前置，各自数一遍 */
    const summon = flat.filter(x => /召唤点/.test(x.s));
    const lotus = flat.filter(x => /荷叶骑士/.test(x.s));
    const lotusCh = CH.filter(c => c.steps.some(s => /荷叶骑士/.test(s))).map(c => c.t);
    const dais = flat.filter(x => /台座/.test(x.s))
        .map(x => ({ ch: x.ch, n: x.n, t: (x.s.match(/「([^」]*台座)」/) || [])[1] }))
        .filter(x => x.t);

    /* 龙玄洞四色作物：带一项 + 四处「奉上…之后开门」，数量从原文里读 */
    const cropList = (flat.filter(x => /进入前带好/.test(x.s))
        .map(x => (x.s.match(/进入前带好(.+?)。/) || [])[1])[0] || '');
    const offer = flat.map(x => {
        const m = x.s.match(/「([^」]*之间)」.*?奉上(.+?)之后开门/);
        return m ? { room: m[1], give: m[2] } : null;
    }).filter(Boolean);
    const cropTotal = offer.reduce((a, o) => {
        const m = o.give.match(/×(\d+)/);
        return a + (m ? +m[1] : 0);
    }, 0);

    const longest = CH.slice().sort((a, b) => b.steps.length - a.steps.length)[0];
    const shortest = CH.slice().sort((a, b) => a.steps.length - b.steps.length)[0];

    /* 译名对照：攻略本写法 → 站内「居民」页定稿。依据写进表里，别让人以为本站随便配的。 */
    const NAME_MAP = [
        ['希娅', '希雅', 'シア', '同音；且都是花店'],
        ['咲夜', '咲耶', 'さくや', '站内别名栏已收「咲夜」'],
        ['库露露法', '克璐璐法', 'クルルファ', '站内别名栏已收「克鲁鲁法」'],
        ['欧德鲁法', '恩德珐', 'オンドルファ', '站内别名栏已收「恩多鲁法」'],
        ['玛乔莉', '玛洁莉', 'マージョリー', '同音'],
        ['伽吉', '加基', 'ガジ', '同音；且都是锻冶屋'],
        ['达莉雅', '达丽娅', 'ダリア', '站内别名栏已收「达丽亚」'],
        ['泽泽', '泽杰', 'ゼゼ', '站内别名栏已收「泽泽」'],
        ['伊昂', '伊奥', 'イオン', '站内别名栏已收「伊欧」'],
        ['库鲁丁', '格尔汀', 'グルテン', '同音；且都是食堂'],
    ];

    return `
            <p class="p">RF3 的主线是<b>按章节推进</b>的，没有编号式的任务列表：一章打完进下一章，章内每一步都是「去某地、触发、打掉挡路的东西」。攻略本把整条线写成 <b>${CH.length} 章 ${N} 步</b>，下面照原样一章一段。</p>
            ${stat([['章节', CH.length + ' 章'], ['步骤', N + ' 步'], ['BOSS', boss.length + ' 处 / ' + nBossName + ' 只'], ['最长的章', longest.t + '（' + longest.steps.length + ' 步）'], ['最短的章', shortest.t + '（' + shortest.steps.length + ' 步）']])}
            <div class="note"><b>这一页的文字是攻略本原文，照录。</b>来源《符文工房3全攻略》（NW 旅团 qisiwole 原创+整理，bbs.newwise.com/thread-482165）。原文里的小标题、「·」起头的步骤、括号里的吐槽（如「求婚吧XD」「（囧）」）都没有改，只把「·」去掉换成了表格的行号。</div>

            <h2 class="h2">基本操作：${M.ops.length} 条，原表照录</h2>
            <p class="p">这一作是双屏掌机，按键说明本身也是攻略的一部分——尤其是 <b>L＋某键</b>那三组快捷列表，游戏里不提示。</p>
            ${tbl(['按键', '作用'], M.ops.map(([k, v]) => ['<code>' + esc(k) + '</code>', esc(v)]),
        { left: [1], cls: 'txt', colw: ['9rem', ''] })}

            <h2 class="h2">八章流程</h2>
            <p class="p">每章一张表，行号是本章内的第几步（原表没有全局编号，本站也不替它编）。<b>章的先后就是流程顺序</b>；章内多数步骤也是串着的，只有第 6 章「交流祭」里那几件凑材料的事先后随意——缎带和胸针都归到花束里，两件可以倒着办。</p>
            ${CH.map((c, ci) => `
            <h3 class="h3">第 ${ci + 1} 章　${esc(c.t)}　<span class="mon-desc">${c.steps.length} 步</span></h3>
            ${tbl(['#', '原文'], c.steps.map((s, i) => [String(i + 1), esc(s)]),
            { left: [1], cls: 'rfomain', colw: ['2.6rem', ''] })}`).join('')}

            <h2 class="h2">${boss.length} 处 BOSS，${nBossName} 只</h2>
            <p class="p">原表只在句子里点一句「遇到BOSS『某某』」，没有等级、没有弱点、也没有战法。这里把它们按出现顺序抽出来，<b>右边保留原句</b>，方便按句回查；数值与弱点在<a class="link" href="#/page/beast">魔物与伙伴</a>页。</p>
            ${tbl(['章', 'BOSS', '原句'], boss.map(b => [
            esc(b.ch),
            b.names.length ? b.names.map(n => '<b>' + esc(n) + '</b>').join('　＋　') : '—',
            esc(b.sent)]),
        { leftFirst: true, left: [2], cls: 'rfomain', colw: ['9rem', '9rem', ''] })}
            <div class="note">最后一行那句，原文是「遇到BOSS水神龙『阿库纳比特』」——<b>「水神龙」是称呼不是名字</b>，本页只把引号里的当名字，称呼留在原句里。</div>

            <h2 class="h2">四座台座：第 2～5 章各有一次</h2>
            <p class="p">第 2 到第 5 章，每章最后一步都是「进『台座』→ 调查宝玉 → 恢复一段记忆」。四座台座就是这四章的收尾标记——<b>看到台座，说明这一章打完了</b>。第 1 章是序幕、第 6～8 章没有台座，所以不能拿它当全流程的进度尺。</p>
            ${tbl(['章', '台座'], dais.map(d => [esc(d.ch), '<b>' + esc(d.t) + '</b>']),
            { leftFirst: true, cls: 'txt', colw: ['11rem', ''] })}

            <h2 class="h2">挡路的三类门槛</h2>
            <p class="p">这 ${N} 步里有相当一部分不是「走过去」而是「先清场」。按原文里反复出现的三种写法数一遍：</p>
            ${tbl(['门槛', '出现', '原文怎么写'], [
            ['清空场景', summon.length + ' 步', '「消灭所有怪物和召唤点」——不清完，门不开、路不通'],
            ['同一件移动道具', lotus.length + ' 步 / ' + lotusCh.length + ' 章', '「需要荷叶骑士（活跃种子）或者水蜘蛛（鞋）」——' + lotusCh.join('、') + ' 两章共用这一条'],
            ['四色作物', offer.length + ' 处 / 共 ' + cropTotal + ' 个', '「奉上…之后开门」——' + (cropList ? '进洞前一次带齐：' + esc(cropList) : '四场各交一种')],
        ], { leftFirst: true, left: [2], cls: 'txt', colw: ['9rem', '11rem', ''] })}
            ${offer.length ? `<p class="p">四场「季节之间」各自要的东西不一样，顺序是春→夏→秋→冬：</p>
            ${tbl(['场景', '奉上'], offer.map(o => ['<b>' + esc(o.room) + '</b>', esc(o.give)]),
            { leftFirst: true, cls: 'txt', colw: ['13rem', ''] })}` : ''}
            <div class="note">作物数量是两个来源对得上的：进洞前那句写「带好樱芜菁×4、黄瓜×4、菠菜×6、芜菁×4」，四处「奉上」写的也是 4／4／6／4，合计 <b>${cropTotal}</b> 个——一次带够就不用跑第二趟，这一点原表没有明说，是从两处数字对出来的。</div>

            <h2 class="h2">这一作的特殊之处：结婚在主线里</h2>
            <p class="p">按这份流程的写法，<b>第 7 章就是结婚</b>：交流祭第二天谈婚事 → 求婚 → 妻子失踪 → 才知道最终迷宫「龙玄洞」在哪。也就是说<b>不结婚就进不了第 8 章，也就看不到结局</b>。</p>
            <p class="p">第 7 章原文把条件写在一句里：需要<b>双人床、订婚戒指、对方的爱情任务全部完成</b>，然后到指定约会地点回答问题。这四项缺一项都推不动，而其中「爱情任务」在各角色自己的事件链里。</p>

            <h2 class="h2">译名对照：攻略本写法 → 站内定稿</h2>
            <p class="p">这一章的正文用一套较早的译名（希娅、咲夜、库露露法…），站内「居民」页用另一套（希雅、咲耶、克璐璐法…）。<b>正文不改</b>——改了就没法按攻略本回查；对照放这里，最后一列写明凭什么认定是同一人。</p>
            ${tbl(['攻略本（本页）', '站内定稿', '日文', '对照依据'], NAME_MAP.map(r => [esc(r[0]), esc(r[1]), esc(r[2]), '<span class="mon-desc">' + esc(r[3]) + '</span>']),
            { leftFirst: true, cls: 'txt', colw: ['9rem', '9rem', '9rem', ''] })}

            <h2 class="h2">照录不改的几处</h2>
            <ul class="ul">
                <li class="li"><b>第 5 章「死亡冰壁」那句没有句号</b>：「最深处场景『阻止步伐的仰天大道』遇到BOSS『死亡冰壁』」——原文断在这里，不补标点。</li>
                <li class="li"><b>「青狮乙」「赤狮丙」是原文的编号式命名</b>，不是错字也不是两个人名拆错了：同一场战斗里两只狮子，原表用甲乙丙区分。</li>
                <li class="li"><b>第 7 章的表情符号照留</b>：「去追求你喜欢的女孩子并求婚吧XD」「求婚的第二天会听说未来的妻子失踪了（囧）」——这是原整理者的话，不是本站的调侃。</li>
                <li class="li"><b>同一处地方三个写法并存</b>：第 7 章写「湖中的龙玄洞」，第 8 章标题写「龙玄洞」、句中又出现「玄泳的龙之巢」。三个写法都照录，不统一。</li>
                <li class="li"><b>「希雅莲斯之花」按原文写</b>：第 5、6 两章都这么写。站内「居民」页讲希雅名字来历那句写的是「希雅蕾斯之树」——<b>花与树、两种写法</b>，本站没有源能把它们并成一件东西，所以不合并。</li>
                <li class="li"><b>原表不给数值</b>：BOSS 没有等级／HP／弱点，作物只给数量不给季节限制，装备与等级一路没提。这些都<b>不补</b>——补了就是本站自己写的东西。</li>
            </ul>
            <div class="note">数据文件：<code>js/rf3main.js</code>（<code>RF3_MAIN</code>），由 <code>_build_rf3_main.py</code> 从 UTF-16LE 原文切分生成，脚本只做「定位章节 + 去掉行首的『·』」，一个字都没改。RF3 与 RF3SP 共用这一份——<b>本站没有两版的主线差异资料</b>，既不声称「SP 一样」，也不给任何一步标「SP 新增」。</div>
            <div class="jump">
                <a href="#/page/beast">
                    <div class="jp-t">魔物与伙伴</div>
                    <div class="jp-s">BOSS 的等级、HP、抗性与掉落在这页</div>
                </a>
                <a href="#/page/request">
                    <div class="jp-t">委托任务</div>
                    <div class="jp-s">揭示板与信箱的委托、报酬</div>
                </a>
            </div>`;
}

/* 边境（RFF）的「委托」：不像别作有依赖板，走的是邮件 + 角色事件链。
   来源：《RFF 攻略.txt》（邮件三种分法）＋ 站内 RFF_EVENT（依赖在事件里的位置）。 */
function requestRffHtml() {
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const E = (typeof RFF_EVENT !== 'undefined') ? RFF_EVENT : null;
    const all = E ? E.main.concat.apply(E.main, E.groups.map(x => x.list.map(y => ({ ...y, who: x.who })))) : [];
    const dep = all.filter(x => /依赖/.test(x.r));
    const byWho = {};
    dep.forEach(x => { byWho[x.who] = (byWho[x.who] || 0) + 1; });
    const whoList = Object.keys(byWho).map(k => [k, byWho[k]]);

    return `
            <h2 class="h2">边境的委托不走公告板，走邮筒</h2>
            <p class="p">和别的作品不同，边境<b>没有依赖板</b>。委托是以<b>「依赖信件」</b>的形式随邮件一起送到的：信里写明要什么，把东西准备好之后<b>直接交给派送员</b>就行，不必跑回委托人那里。</p>
            ${tbl(['邮件类型', '里面是什么'], [
                ['一般问候', '日常寒暄，读了不亏但也没奖励'],
                ['依赖信件', '要某样东西。<b>物品直接交给派送员</b>，不用自己送到委托人手上'],
                ['需要回信的信件', '要写字回复，不回就一直挂着'],
                ['不可思议信件', '随机送到，回某些特定单词能拿到礼物'],
            ], { leftFirst: true, cls: 'txt', colw: ['9rem'] })}
            <div class="key">容易漏的是第四种：<b>不可思议信件是随机的</b>，收信时不留神就过去了；回信内容还得答对特定词，答错没有第二封。攻略资料只写了「回某些特定单词可以拿到不可思议的礼物」，没有列词表，本站也不猜。</div>

            <h2 class="h2">大部分「依赖」其实是角色事件的一环</h2>
            <p class="p">边境的依赖不全是随机刷的——很多是<b>某人事件链里的固定一步</b>：先要一样东西，交了之后再要下一样，中间还夹着等级或好感门槛。这类依赖在本站「主线与角色事件」页里按人排好，条件与结果都照原文。</p>
            ${dep.length ? `${tbl(['谁', '事件链里的依赖条数'], whoList.map(([k, v]) => [esc(k), '<b>' + v + '</b> 条']), { leftFirst: true, cls: 'txt', colw: ['9rem', '8rem'] })}
            <div class="note">原表里明写「依赖」二字的共 ${dep.length} 条。其余「被委托找某物」「拿来某物」的写法没算进这张表——它们算同一种东西，但原文用词不统一，本站按字面统计，不合并。</div>` : ''}
            <div class="jump">
                <a href="#/page/rffevent">
                    <div class="jp-t">主线与角色事件</div>
                    <div class="jp-s">${all.length} 条事件：主线 ${E ? E.main.length : 0} 步，角色与结局支线 ${all.length - (E ? E.main.length : 0)} 条</div>
                </a>
            </div>`;
}

/* 符文工房 海洋（RFO）奖杯·回忆·许愿·巨人操作：单一来源 xls「其他」工作表。
   奖杯等级、日文名、条件三项原表分列写的，照录；回忆影像与许愿、巨人操作是原表的段落，逐条摊开。 */
/* 符文工房 海洋（RFO）地图分布：单一来源 biligame《RFOMAP》，内容为法米通攻略书地图整理。
   四张表原样落库（宝箱陶罐 189 处 / 魔物 55 区 / 精灵石 39 处 / 海怪 28 海域），
   本页只做「换一种更紧凑的读法」，数值、空档与「-」全部照录：不推算、不归一化、不去重。 */
function rfoMapHtml() {
    const C = (typeof RFO_MAP_CHEST !== 'undefined') ? RFO_MAP_CHEST : [];
    const M = (typeof RFO_MAP_MON !== 'undefined') ? RFO_MAP_MON : [];
    const S = (typeof RFO_MAP_SPIRIT !== 'undefined') ? RFO_MAP_SPIRIT : [];
    const E = (typeof RFO_MAP_SEA !== 'undefined') ? RFO_MAP_SEA : [];
    if (!C.length || !M.length || !S.length || !E.length) return '<p class="p">地图数据未加载。</p>';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    /* 源表用「-」与空串表示「这一格没有」，统一显示成破折号，不当作 0 或「无此物」 */
    const dash = v => (v === '' || v === '-' || v === '?' || v == null) ? '—' : esc(v);

    /* ---------- 一、魔物分布 ---------- */
    const monAll = [];
    M.forEach(r => r[2].split('、').forEach(x => {
        const t = x.trim();
        if (t && t !== '-' && t !== '混合') monAll.push(t);
    }));
    const monWiki = {};
    monAll.forEach(t => { monWiki[t] = (monWiki[t] || 0) + 1; });
    const monUniq = Object.keys(monWiki).length;
    const rareAll = [];
    M.forEach(r => r[3].split('、').forEach(x => {
        const t = x.trim();
        if (t && t !== '-') rareAll.push(t);
    }));
    const rareWiki = {};
    rareAll.forEach(t => { rareWiki[t] = (rareWiki[t] || 0) + 1; });
    const rareUniq = Object.keys(rareWiki).length;
    const rareTop = Object.keys(rareWiki).sort((a, b) => rareWiki[b] - rareWiki[a])[0] || '';
    const noRare = M.filter(r => r[3] === '-' || r[3] === '');
    const wideTop = Object.keys(monWiki).sort((a, b) => monWiki[b] - monWiki[a]).slice(0, 3);
    const onlyOne = Object.keys(monWiki).filter(k => monWiki[k] === 1);
    const lvRows = M.filter(r => r[1] !== '-' && /^\d+$/.test(r[1]));
    const lvMax = lvRows.reduce((a, r) => Math.max(a, +r[1]), 0);
    const lvMin = lvRows.reduce((a, r) => Math.min(a, +r[1]), 999);
    const lvTop = lvRows.filter(r => +r[1] === lvMax);
    const lvBottom = lvRows.filter(r => +r[1] === lvMin);
    const gob = M.filter(r => /哥布林/.test(r[2]));

    /* ---------- 二、精灵石树 ---------- */
    const spNum = v => (v === '' || v === '-' || v == null) ? 0 : (parseInt(v, 10) || 0);
    const spQty = S.reduce((a, r) => a + spNum(r[2]), 0);
    const spMax = S.reduce((a, r) => Math.max(a, spNum(r[2])), 0);
    const spTop = S.filter(r => spNum(r[2]) === spMax);
    const spPlaces = {};
    S.forEach(r => { spPlaces[r[0]] = 1; });
    const COLOR = [[4, '黄'], [5, '红'], [6, '绿'], [7, '蓝']];
    const colStat = COLOR.map(function (c) {
        const vs = S.map(r => r[c[0]]).filter(v => v !== '' && v !== '-').map(v => parseInt(v, 10));
        return {
            n: c[1], cnt: vs.length,
            avg: vs.length ? Math.round(vs.reduce((a, b) => a + b, 0) / vs.length) : 0,
            max: vs.length ? Math.max.apply(null, vs) : 0
        };
    });
    const oneColor = S.filter(r => COLOR.filter(c => r[c[0]] !== '' && r[c[0]] !== '-').length === 1);
    const reVals = S.map(r => spNum(r[8])).filter(v => v > 0);
    const reMax = reVals.reduce((a, b) => Math.max(a, b), 0);
    const reMin = reVals.reduce((a, b) => Math.min(a, b), 99);
    const emptyRe = S.filter(r => r[8] === '');
    const wind = S.filter(r => r[0].indexOf('风之精灵殿') === 0);

    /* ---------- 三、海怪：按海域重排成一行三只 ---------- */
    const seaOrder = [];
    const seaMap = {};
    E.forEach(r => {
        if (!seaMap[r[0]]) { seaMap[r[0]] = []; seaOrder.push(r[0]); }
        seaMap[r[0]].push(r);
    });
    const seaZones = {};
    seaOrder.forEach(k => {
        const z = k.charAt(0);
        (seaZones[z] = seaZones[z] || []).push(k);
    });
    const seaPct = {};
    E.forEach(r => { seaPct[r[2]] = (seaPct[r[2]] || 0) + 1; });
    const seaPctKeys = Object.keys(seaPct).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    /* 每片海域的三只怪（按概率从高到低），以及「同一字母区是否恒为同样三只」 */
    /* 同区三只怪的「集合」是否一致；展示时按该区第一个海域的 70/20/10 顺序 */
    const zoneTriple = z => {
        const set = {};
        seaZones[z].forEach(k => {
            set[seaMap[k].map(x => x[1]).sort().join('／')] = 1;
        });
        const first = seaMap[seaZones[z][0]].slice().sort((a, b) => parseInt(b[2], 10) - parseInt(a[2], 10));
        return Object.keys(set).length > 1
            ? Object.keys(set).map(x => x.replace(/／/g, ' / ')).join(' 或 ')
            : first.map(x => x[1]).join(' / ');
    };
    const zLetters = Object.keys(seaZones).sort();

    /* ---------- 四、宝箱与陶壶 ---------- */
    const kindOf = r => /宝箱/.test(r[1]) ? '宝箱' : (/陶壶/.test(r[1]) ? '陶壶' : '其他');
    const kCnt = { 宝箱: 0, 陶壶: 0, 其他: 0 };
    C.forEach(r => { kCnt[kindOf(r)]++; });
    const TEMPLE = ['土之精灵殿', '炎之精灵殿', '水之精灵殿', '风之精灵殿'];
    const FIXED = ['艾利岛', '热沙岛', '密林岛', '封冰岛', '神殿岛', '石像岛', '岩礁上的沉船', '空中庭院'];
    const zOf = p => {
        for (let i = 0; i < TEMPLE.length; i++) if (p.indexOf(TEMPLE[i]) === 0) return TEMPLE[i];
        if (FIXED.indexOf(p) >= 0) return '固定岛／固定区域';
        if (/^(无名岛|神殿[A-Z]-|沉没船|古代石像|石床庭院)/.test(p)) return '打捞点';
        return '其他';
    };
    const zones = {};
    C.forEach(r => { const z = zOf(r[0]); zones[z] = (zones[z] || 0) + 1; });
    const zKeys = Object.keys(zones).sort((a, b) => zones[b] - zones[a]);
    const templeSum = TEMPLE.reduce((a, k) => a + (zones[k] || 0), 0);
    const itemAll = [];
    C.forEach(r => r[2].split('、').forEach(x => { const t = x.trim(); if (t) itemAll.push(t); }));
    const itemWiki = {};
    itemAll.forEach(t => { itemWiki[t] = (itemWiki[t] || 0) + 1; });
    const itemUniq = Object.keys(itemWiki).length;
    const itemTop = Object.keys(itemWiki).sort((a, b) => itemWiki[b] - itemWiki[a]).slice(0, 5);
    const mystery = C.filter(r => /不明物品/.test(r[2]));
    /* 「不明物品（A、B、C）」括注里给几件就是几件，件数并不固定，按件数统计 */
    const mystCount = k => mystery.filter(r => {
        const a = r[2].indexOf('（'), z = r[2].lastIndexOf('）');
        if (a < 0 || z < a) return false;
        return r[2].slice(a + 1, z).split('、').length === k;
    }).length;
    const multi = C.filter(r => r[1] && /、/.test(r[1]));
    const noKind = C.filter(r => r[1] === '-');
    const depth = { '土之精灵殿': 4, '炎之精灵殿': 5, '水之精灵殿': 5, '风之精灵殿': 6 };

    return `
            <p class="p">这一页是海洋的<b>地图侧数据</b>：哪个区域刷什么怪、精灵石在哪、哪个海域会遇哪种海怪、哪一格能开出什么。四张表原本各占攻略本一页，本站按「进图前想知道什么」的顺序重排，<b>数值一格未改</b>。</p>
            ${stat([
        ['地图区域', M.length + ' 个'], ['容器', C.length + ' 处'],
        ['精灵石', S.length + ' 处'], ['海域', seaOrder.length + ' 个']
    ])}

            <h2 class="h2">魔物分布：${M.length} 个区域</h2>
            <p class="p">每个区域给三样东西：<b>平均等级</b>（该区怪的大致水平，不是逐只数值）、<b>常见魔物</b>、<b>稀有魔物</b>。海洋的稀有怪不是「低概率替换」，而是<b>单独一档、会在同区一起出现</b>的强敌——表里写的是「这区也会出」，不是出现率。</p>
            ${stat([
        ['常见魔物（去重）', monUniq + ' 种'], ['稀有魔物（去重）', rareUniq + ' 种'],
        ['平均等级跨度', 'Lv' + lvMin + ' ～ ' + lvMax], ['没有稀有怪的区域', noRare.length + ' 个']
    ])}
            <p class="p"><b>刷得最广的三只</b>：${wideTop.map(k => esc(k) + '（' + monWiki[k] + ' 区）').join('、')}。哥布林这一族（含队长、海盗、大哥布林等）一共占了 <b>${gob.length}</b> 个区域，是海洋分布最广的一族。<b>${onlyOne.length} 种</b>魔物全作只在一个区域出现——想找某只特定的怪，直接在表里搜名字即可。</p>
            <p class="p">稀有怪里 <b>${esc(rareTop)}</b> 最广（${rareWiki[rareTop] || 0} 个区域）。全表 <b>${noRare.length} 个区域一只稀有怪都没有</b>：${noRare.map(r => esc(r[0])).join('、')}——多是神殿顶层、终局区域与外洋，本来就不安排稀有。</p>
            ${ftableOwn(['地点', '平均Lv', '常见魔物', '稀有魔物'], ['14rem', '5rem', '', '15rem'],
        M.map(r => [r[0], [esc(r[0]), dash(r[1]), dash(r[2]), dash(r[3])]]),
        { ph: '搜地点或魔物名', cls: 'rfomap-mon' })}
            <div class="key"><b>等级跨度 ${lvMin}～${lvMax}</b>：最高的是 ${lvTop.map(r => esc(r[0])).join('、')}，最低的是 ${lvBottom.map(r => esc(r[0])).join('、')}。海洋没有「等级墙」，打不过就换海域，不必原地练。</div>

            <h2 class="h2">精灵石树：${S.length} 处采集点</h2>
            <p class="p">精灵是海洋的核心资源，四个颜色分别对应四种属性。<b>「精灵量」是一次采集能给多少</b>，<b>「±%」是浮动幅度</b>，四色列是<b>出该色的概率</b>，最后一列是<b>隔多久能再采</b>（源表只给数字，没写单位）。</p>
            ${stat([
        ['采集点', S.length + ' 处 / ' + Object.keys(spPlaces).length + ' 个地点'],
        ['单次精灵量', Math.min.apply(null, S.map(r => spNum(r[2]))) + ' ～ ' + spMax],
        ['四色平均概率（%）', colStat.map(c => c.n + ' ' + c.avg).join(' · ')],
        ['再采集间隔', reMin + ' ～ ' + reMax]
    ])}
            <p class="p"><b>四色的平均概率几乎持平</b>（黄 ${colStat[0].avg}%／红 ${colStat[1].avg}%／绿 ${colStat[2].avg}%／蓝 ${colStat[3].avg}%），不存在「某色天生难出」。真正拉开差距的是单点极值：黄最高 ${colStat[0].max}%、红 ${colStat[1].max}%、绿 ${colStat[2].max}%、蓝 ${colStat[3].max}%。<b>要哪种颜色就找那种颜色的高概率点，而不是反复刷同一个石树。</b></p>
            <p class="p"><b>精灵量最高的是 ${spMax}</b>，共 ${spTop.length} 处：${spTop.map(r => esc(r[0]) + '·' + esc(r[1])).join('、')}——都在风之精灵殿，而且都在高层。风殿自下而上的精灵量是 ${wind.map(r => esc(r[0]).replace('风之精灵殿', '') + ' ' + esc(r[2])).join('、')}，<b>越往上越多</b>，这是全作刷精灵最集中的一段路。</p>
            <p class="p"><b>${oneColor.length} 处只出单色</b>：${oneColor.map(r => {
        const hit = COLOR.filter(c => r[c[0]] !== '' && r[c[0]] !== '-');
        return esc(r[0]) + '·' + esc(r[1]) + '（' + hit.map(c => c[1] + ' ' + esc(r[c[0]]) + '%').join(' ') + '）';
    }).join('、')}。其中 ${oneColor.filter(r => COLOR.filter(c => r[c[0]] !== '' && r[c[0]] !== '-').some(c => r[c[0]] === '100')).length} 处直接给到 100%，其余几处只有 10%。<b>没列的颜色是「不出」还是「源表没记」，原表没区分，本站也不替它区分</b>。</p>
            ${tbl(['地点', '采集点', '精灵量', '±%', '黄%', '红%', '绿%', '蓝%', '再采集'], S.map(r => [
        esc(r[0]), esc(r[1]), esc(r[2]), dash(r[3]),
        dash(r[4]), dash(r[5]), dash(r[6]), dash(r[7]), r[8] === '' ? '—' : esc(r[8])
    ]), { leftFirst: true, cls: 'rfomap-sp', colw: ['11rem', '6rem', '4rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem', '4.2rem'] })}

            <h2 class="h2">海怪：${seaOrder.length} 个海域</h2>
            <p class="p">海图上的 A／B／C／D 是四片海域，每片里再编号。原表<b>一只怪一行</b>共 ${E.length} 行，本站按海域合成一行三只，方便「到这片海域会撞上谁」一眼看完。概率<b>全表只有 70／20／10 三档</b>（分别 ${seaPct[seaPctKeys[0]] || 0}／${seaPct[seaPctKeys[1]] || 0}／${seaPct[seaPctKeys[2]] || 0} 行），<b>没有一个例外</b>。</p>
            ${tbl(['海域', '70%（主）', '20%', '10%'], seaOrder.map(k => {
        const g = seaMap[k].slice().sort((a, b) => parseInt(b[2], 10) - parseInt(a[2], 10));
        return [esc(k), g[0] ? esc(g[0][1]) : '—', g[1] ? esc(g[1][1]) : '—', g[2] ? esc(g[2][1]) : '—'];
    }), { leftFirst: true, cls: 'rfomap-sea', colw: ['4.6rem', '', '', ''] })}
            <div class="key"><b>三只怪的组合只由海域字母决定</b>：${zLetters.map(z => z + ' 区 ' + zoneTriple(z) + '（' + seaZones[z].length + ' 个海域）').join('；')}。<b>同一区内换的只是「谁占 70%」</b>——想刷哪只，先看它在哪个字母的区，再挑它当主怪的那几号海域。</div>

            <h2 class="h2">宝箱与陶壶：${C.length} 处容器</h2>
            <p class="p">这一张是攻略本最琐碎的一页：<b>逐格标出每个容器里有什么</b>。宝箱 ${kCnt.宝箱} 处、陶壶 ${kCnt.陶壶} 处，另有 ${kCnt.其他} 处被记成「—」或「奖励」。「总物品」列写几件就是几件，<b>原表没给数量与概率，本站不补</b>。</p>
            ${stat([
        ['容器', C.length + ' 处'], ['物品条目', itemAll.length + ' 条 / ' + itemUniq + ' 种'],
        ['不明物品', mystery.length + ' 处'], ['最多的一区', zKeys[0] + ' ' + zones[zKeys[0]] + ' 处']
    ])}
            <p class="p"><b>按区域看密度</b>：${zKeys.slice(0, 5).map(k => k + ' ' + zones[k] + ' 处').join('、')}。四座精灵殿合计 ${templeSum} 处，占全表 ${Math.round(templeSum * 100 / C.length)}%；其中水殿 ${zones['水之精灵殿'] || 0} 处、风殿 ${zones['风之精灵殿'] || 0} 处最多，土殿只有 ${zones['土之精灵殿'] || 0} 处——<b>跟四殿的层数同向</b>（${TEMPLE.map(k => k.replace('之精灵殿', '殿') + ' ' + depth[k] + ' 层').join('、')}）——层数越多、容器越多，前期不必指望靠翻箱发财。</p>
            <p class="p"><b>开出来最多的是 ${itemTop.map(k => esc(k) + '（' + itemWiki[k] + ' 次）').join('、')}</b>——货币与强化素材占了大头，前期靠翻箱凑第一笔钱是可行的。<b>${mystery.length} 处是「不明物品」</b>：打开时从括注的清单里随机给一件，不是固定掉落。清单<b>件数不固定</b>——3 件 ${mystCount(3)} 处最多，另有 2 件 ${mystCount(2)} 处、4 件 ${mystCount(4)} 处、5 件 ${mystCount(5)} 处，本站把括注原样列出。另有 <b>${multi.length} 处</b>一个容器记了多只（如「陶壶1、2、3、4」合写一份内容），源表原本就是这么合的，照录。</p>
            <details class="mon-fold">
                <summary>展开 ${C.length} 处容器清单（点一下）</summary>
                ${ftableOwn(['地点', '容器', '内容'], ['12rem', '8rem', ''],
        C.map(r => [r[0] + ' ' + r[1], [esc(r[0]), dash(r[1]), esc(r[2])]]),
        { ph: '搜地点或物品名', cls: 'rfomap-chest' })}
            </details>

            <h2 class="h2">照录不改的地方</h2>
            <ul class="ul">
                <li class="li"><b>「大海原」整行是破折号</b>：平均等级、常见魔物、稀有魔物三格源表都写「-」。外洋是航行中随机遭遇，攻略本没有按区域统计，本站不填、不推测。</li>
                <li class="li"><b>「圆形竞技场」写「14~99／混合」</b>：等级是区间、魔物写「混合」，因为竞技场按轮次出不同对手。照录，不拆成平均值。</li>
                <li class="li"><b>两处容器名是「-」</b>：${noKind.map(r => esc(r[0]) + '（' + esc(r[2]) + '）').join('、')}——攻略本没写它是宝箱还是陶壶。照录成「—」，<b>不猜它是箱子</b>。</li>
                <li class="li"><b>精灵石「再采集」有 ${emptyRe.length} 格空着</b>：${emptyRe.map(r => esc(r[0]) + '·' + esc(r[1])).join('、')}，源表这一格没填，显示「—」。</li>
                <li class="li"><b>四色概率写「-」的那几格</b>显示成「—」，<b>没有当成 0%</b>——「这色不出」与「源表没记」是两件事，不合并。</li>
                <li class="li"><b>「再采集」的单位本站没有补</b>：源表只写 2～6 这样的数字，没写是天、小时还是次数，表格照原样只放数字。</li>
            </ul>
            <div class="note">数据源：biligame 符文工厂 wiki《RFOMAP》（法米通攻略书地图整理），与站内魔物图鉴、钓点页同源。魔物名、物品名沿用该站写法，与站内其他页的中文译名可能有一两个字的出入，各页各自照录、不强行统一。</div>`;
}
/* ------------------------------------------------------------
   符文工房 海洋 —— 岛屿与打捞（RFO_SAIL）
   来源：《符文工厂海洋（最强攻略）》xls「岛屿」工作表。
   上半是中文整理（固定 12 座 + 打捞 21 处），下半「以下↓为日版」
   是另一份日文整理（30 行，带精灵木数与魔物日文原名）。
   两份坐标对得上、写法与魔物栏并不一致，两表并列照录，不合并。
   ------------------------------------------------------------ */
function rfosailHtml() {
    const D = (typeof RFO_SAIL !== 'undefined') ? RFO_SAIL : null;
    if (!D || !D.fix || !D.salv) return '<p class="p">岛屿数据未加载。</p>';
    const esc = t => String(t === undefined || t === null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = v => (v === '' || v === '-' || v == null) ? '<span class="mon-no">—</span>' : esc(v);
    const FIX = D.fix, SALV = D.salv, JP = D.jp;

    /* 等级写成「lv1-2」「lv4-9」「约lv70」三种，比大小取上限 */
    const lvHi = s => {
        const m = String(s || '').match(/(\d+)(?:\s*[-–~]\s*(\d+))?/);
        return m ? +(m[2] || m[1]) : 0;
    };

    /* 光球 BOSS：一格里可能并列好几只（四座精灵殿就是三只），等级写在末尾的括号里 */
    const bossName = s => s.replace(/（[^）]*）/g, '').split('，').map(x => x.trim()).filter(Boolean);
    const bossLv = s => {
        const all = s.match(/（lv(\d+)(?:\s*[-–]\s*(\d+))?）/g);
        if (!all) return 0;
        const d = all[all.length - 1].match(/(\d+)(?:\s*[-–]\s*(\d+))?/);
        return +(d[2] || d[1]);
    };
    const all = FIX.concat(SALV);
    const lvNums = all.map(r => bossLv(r[3])).filter(v => v > 0);
    const bossMax = Math.max.apply(null, lvNums);
    const bossMin = Math.min.apply(null, lvNums);
    const bossMaxRows = all.filter(r => bossLv(r[3]) === bossMax);
    const bossKind = {};
    all.forEach(r => bossName(r[3]).forEach(n => { bossKind[n] = (bossKind[n] || 0) + 1; }));
    const bossKinds = Object.keys(bossKind).sort(function (a, b) { return bossKind[b] - bossKind[a]; });

    /* 中文表的等级台阶 */
    const fixHi = FIX.map(r => lvHi(r[2]));
    const fixMax = Math.max.apply(null, fixHi);
    const fixTop = FIX.filter(r => lvHi(r[2]) === fixMax);
    const fixBottom = FIX.filter(r => lvHi(r[2]) === Math.min.apply(null, fixHi));
    const salvHi = SALV.map(r => lvHi(r[2]));
    const salvMin = Math.min.apply(null, salvHi.filter(v => v > 0));
    const salvLow = SALV.filter(r => lvHi(r[2]) === salvMin);
    const salvTop = SALV.filter(r => lvHi(r[2]) === Math.max.apply(null, salvHi));

    /* 鉴定箱：打捞岛特有，开出随机一件 */
    const boxed = SALV.filter(r => r[5]);
    const boxN = boxed.map(r => r[5].split('，').length);
    const boxMin = Math.min.apply(null, boxN), boxMax = Math.max.apply(null, boxN);

    /* 精灵木数只在日版表里；跟地图页「精灵石树」是同一件事 */
    const WOOD = JP.filter(r => r[4] && r[4] !== '0');
    const woodSum = WOOD.reduce((a, r) => a + parseInt(r[4], 10), 0);
    const WOOD_MAP = WOOD.filter(r => r[0] !== 'b-4');   /* 圆形竞技场在地图页的精灵石表里没有这一处 */

    /* 日版表的魔物栏把光球 BOSS 也算在里面，统计时去掉括号里的日文原名 */
    const monKind = {};
    JP.forEach(r => r[2].forEach(m => {
        const n = m.replace(/（[^）]*）/g, '').trim();
        if (n && n !== '-') monKind[n] = (monKind[n] || 0) + 1;
    }));
    const monKindN = Object.keys(monKind).length;
    const monTop = Object.keys(monKind).sort(function (a, b) { return monKind[b] - monKind[a]; })[0] || '';
    const unkKind = {};
    JP.forEach(r => r[3].forEach(u => { if (u && u !== '-') unkKind[u] = (unkKind[u] || 0) + 1; }));
    const unkKindN = Object.keys(unkKind).length;
    const unkTop = Object.keys(unkKind).sort(function (a, b) { return unkKind[b] - unkKind[a]; })[0] || '';

    const M = (typeof RFO_MAP_MON !== 'undefined') ? RFO_MAP_MON : [];
    const floorN = k => M.filter(r => r[0].indexOf(k) === 0).length;
    const TEMPLE = [['土', '土之精灵殿'], ['炎', '炎之精灵殿'], ['水', '水之精灵殿'], ['风', '风之精灵殿']];

    /* 中文表与日版表指的是同一座岛时，站内地图页用的是哪个名字（按坐标对上的才有） */
    const ALIAS = [
        ['e-5', 'verde island', 'アイリーランド', '艾利岛'],
        ['f-6', 'shrine island', '神殿の島', '神殿岛'],
        ['d-3', '沉船岛', '岩礁の沈没船', '岩礁上的沉船'],
        ['b-3', '沙漠岛 desert island', 'マーグスランド', '热沙岛'],
        ['e-8', 'jungle island', 'ラフレシアンランド', '密林岛'],
        ['g-6', 'statue island', '石像の島', '石像岛'],
        ['h-4（日版写 H-3）', 'mystic ruins 空中庭院', '空中庭園', '空中庭院'],
        ['g-2', 'frost island', 'ブリザールランド', '封冰岛'],
        ['e-7', '土精灵神殿', '土の精霊殿', '土之精灵殿·' + floorN('土之精灵殿') + ' 层'],
        ['b-6', '火精灵神殿', '火の精霊殿', '炎之精灵殿·' + floorN('炎之精灵殿') + ' 层'],
        ['h-5', '水精灵神殿', '水の精霊殿', '水之精灵殿·' + floorN('水之精灵殿') + ' 层'],
        ['e-2', '风精灵神殿', '風の精霊殿', '风之精灵殿·' + floorN('风之精灵殿') + ' 层']
    ];

    return `
            <p class="p">海洋的地图不是一张画，而是<b>一片海加一堆岛</b>——岛有的本来就在那儿（四季岛、四座精灵神殿、空中庭院），有的是骑巨人优米尔从海底<b>整座捞上来</b>的（沉船、遗迹、无名岛）。这一页把攻略本《最强攻略》里那张「岛屿」表摊平成三张：<b>固定岛 ${FIX.length} 座、打捞岛 ${SALV.length} 处，外加日版原始表 ${JP.length} 行</b>。</p>
            ${stat([['固定岛', FIX.length + ' 座'], ['打捞岛', SALV.length + ' 处'], ['精灵木', woodSum + ' 棵 / ' + WOOD.length + ' 岛'], ['光球 BOSS', bossKinds.length + ' 种']])}
            <div class="note"><b>每座岛都有一个「光球」。</b>打掉光球会掉出 BOSS，等级跟着岛屿等级走，全表从 <b>lv${bossMin}</b> 到 <b>lv${bossMax}</b>；最高的 lv${bossMax} 一共 ${bossMaxRows.length} 处（${bossMaxRows.map(r => esc(r[0])).join('、')}）。四座精灵神殿的光球不只一只，是两三只一起上。</div>

            <h2 class="h2">一、固定岛：${FIX.length} 座，出海就能去</h2>
            <p class="p">这一批不用捞，坐标就是海图上的位置。等级最低的是 <b>${fixBottom.map(r => esc(r[0]) + '（' + esc(r[2]) + '）').join('、')}</b>，开局落脚处；最高的是 <b>${fixTop.map(r => esc(r[0]) + ' ' + esc(r[1]) + '（' + esc(r[2]) + '）').join('、')}</b>。名字是中文表原样，英文名与中文名混着写也没统一——「沙漠岛 desert island」这种一行里两种写法的情况，原表就是这么记的。</p>
            ${ftableOwn(['坐标', '岛名（原表写法）', '等级', '光球 BOSS（等级照原文）', '常见魔物'], ['4.4rem', '11rem', '5.2rem', '15rem', ''],
        FIX.map(r => [r[0] + ' ' + r[1], [esc(r[0]), esc(r[1]), dash(r[2]), esc(r[3]), esc(r[4].join('、'))]]),
        { ph: '搜坐标或岛名', cls: 'rfosail' })}

            <h2 class="h2">二、打捞岛：${SALV.length} 处，得靠巨人捞</h2>
            <p class="p">沉船、遗迹、无名岛都在海底，捞上来才能上岸。等级跨度比固定岛大得多：<b>${salvLow.map(r => esc(r[0]) + ' ' + esc(r[1]) + '（' + esc(r[2]) + '）').join('、')}</b> 还在新手段，<b>${salvTop.map(r => esc(r[0]) + '（' + esc(r[2]) + '）').join('、')}</b> 已经是通关后才打得动的段位。最后列是<b>鉴定箱</b>——打捞岛特有的箱子，开出来随机给一件，${boxed.length} 处都有记，${boxMin}～${boxMax} 件不等。</p>
            ${ftableOwn(['坐标', '名称', '等级', '光球 BOSS', '常见魔物', '鉴定箱（随机给一件）'], ['4.4rem', '9rem', '5.2rem', '13rem', '', '12rem'],
        SALV.map(r => [r[0] + ' ' + r[1], [esc(r[0]), esc(r[1]), dash(r[2]), esc(r[3]), esc(r[4].join('、')), dash(r[5])]]),
        { ph: '搜坐标或岛名', cls: 'rfosail' })}

            <h2 class="h2">三、同一座岛，三个名字：中文表 / 日版表 / 站内地图页</h2>
            <p class="p">中文表写 <code>verde island</code>，日版表写 <code>アイリーランド</code>，站内「地图与出没」页写<b>艾利岛</b>——同一座。下面这张对照只收<b>坐标对得上、名字能落定</b>的 ${ALIAS.length} 处；对不上的不猜。</p>
            ${tbl(['坐标', '中文表写法', '日版表写法', '站内地图页写法'], ALIAS.map(a => [esc(a[0]), esc(a[1]), esc(a[2]), esc(a[3])]),
        { left: [1, 2, 3], colw: ['7rem', '12rem', '11rem', ''] })}
            <p class="p">四座精灵神殿在日版表里<b>没有整岛行</b>，因为它们按层拆在地图页里：${TEMPLE.map(t => t[1] + ' ' + floorN(t[1]) + ' 层').join('、')}。中文表反倒给它们各记一行，等级写成 <b>${FIX.filter(r => /精灵神殿/.test(r[1])).map(r => esc(r[2])).join(' / ')}</b>——四殿的推荐等级台阶一目了然。</p>

            <h2 class="h2">四、日版原始表：${JP.length} 行，带精灵木数</h2>
            <p class="p">这张表的独有价值是两列：<b>魔物栏带日文原名</b>（哥布林（ゴブリン）、怪物箱（モンスターボックス）），以及<b>精灵木数</b>——那座岛上能采几棵精灵木。${JP.length} 行里只有 <b>${WOOD.length} 座岛有精灵木，合计 ${woodSum} 棵</b>：三棵的四座全是四季岛（热沙 B-3、艾利 E-5、密林 E-8、封冰 G-2），其余是 1～2 棵。</p>
            <div class="note"><b>精灵木数跟地图页的「精灵石树」逐岛对得上。</b>除圆形竞技场外的 ${WOOD_MAP.length} 处，棵数与地图页海岛部分的精灵石数量一字不差：<b>3 棵的 ${WOOD_MAP.filter(r => r[4] === '3').length} 处、2 棵的 ${WOOD_MAP.filter(r => r[4] === '2').length} 处、1 棵的 ${WOOD_MAP.filter(r => r[4] === '1').length} 处</b>。唯一多出来的是<b>圆形竞技场 2 棵</b>——地图页的精灵石表里没有这一处。</div>
            ${ftableOwn(['坐标', '名称', '魔物（含日文原名，光球 BOSS 也列在这里）', '不明品', '精灵木数'], ['4.4rem', '8.5rem', '', '12rem', '5.4rem'],
        JP.map(r => [r[0] + ' ' + r[1], [esc(r[0]), esc(r[1]), r[2].map(esc).join('、'), r[3].map(dash).join('、'), dash(r[4])]]),
        { ph: '搜坐标、岛名或魔物', cls: 'rfosail rfosail-jp' })}
            <p class="p">魔物栏去重后 <b>${monKindN} 种</b>，出得最广的是<b>${esc(monTop)}</b>（${monKind[monTop]} 处）——跟地图页「哥布林一族刷得最广」的结论同向。不明品共 <b>${unkKindN} 种</b>，给得最多的是 <b>${esc(unkTop)}</b>（${unkKind[unkTop]} 处），其次是水之结晶与橡木。</p>

            <h2 class="h2">五、两张表对不上的地方（照录，不合并）</h2>
            <ul class="ul">
                <li class="li"><b>空中庭院的坐标打架</b>：中文表标 <b>h-4</b>，日版表标 <b>H-3</b>；而 h-4 在日版表里是另一处「沉没船」。两处都留着，没替谁改。</li>
                <li class="li"><b>行数本来就不等</b>：中文表 ${FIX.length + SALV.length} 行、日版表 ${JP.length} 行。差在<b>四座精灵神殿</b>（只有中文表有整岛行）与<b>圆形竞技场</b>（只有日版表有，B-4）。</li>
                <li class="li"><b>圆形竞技场那行很空</b>：日版表的魔物、不明品都写「-」，精灵木数却写 2；地图页那边写的是「14~99／混合」。三处说法各不相同，全部原样保留。</li>
                <li class="li"><b>同一个地方两种叫法</b>：中文表把「石床庭園」写成 <code>ancient ruins</code>（a-5、c-3），到 g-3 又写成「ancient ruins古代遗址」；「古代石像」有的写 <code>ancient statue</code>、有的写「古代雕像」。日版表一律用汉字原名。</li>
                <li class="li"><b>魔物栏粒度不同</b>：中文表只列常见怪（3～10 只），把光球 BOSS 单列一栏；日版表把 BOSS 也算进魔物（例如 E-5 的莫可王）。所以两边「几只怪」不能直接比。</li>
                <li class="li"><b>各有一半信息</b>：等级只有中文表有，精灵木数只有日版表有。想要完整的一岛一档，得把两张表并排看。</li>
                <li class="li"><b>日版表保留日文原名</b>：魔物与物品都是「中文（日文）」的写法，日文原文里还有「風の結晶」「超栄水」这种没翻的。原样留着，方便对着日文攻略或游戏内图鉴找。</li>
            </ul>

            <div class="note">来源：《符文工厂海洋（最强攻略）》xls「岛屿」工作表（上半中文整理、下半「以下↓为日版」）。本站只做了分列、去多余空格、把日版表的 <code>/</code> 分隔改成顿号；措辞、错字、混写的英文名一处未改。</div>
            <div class="jump">
                <a href="#/page/rfomap">
                    <div class="jp-t">地图与出没</div>
                    <div class="jp-s">每一层刷什么怪、精灵石概率、海怪三选一</div>
                </a>
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">表里的译名与图鉴对不上时，去这里对日文名</div>
                </a>
            </div>
    `;
}

/* ------------------------------------------------------------
   符文工房 海洋 —— 攻略本「技巧」页（RFO_SAIL.tips）
   16 条玩家投稿帖，帖体原样：口语、错字、括号里的自嘲都不动。
   ------------------------------------------------------------ */
function rfotipHtml() {
    const D = (typeof RFO_SAIL !== 'undefined') ? RFO_SAIL : null;
    const T = (D && D.tips) ? D.tips : null;
    if (!T || !T.length) return '<p class="p">技巧数据未加载。</p>';
    const esc = t => String(t === undefined || t === null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const SECTIONS = [
        { t: '一、钱与技能：前三条都在讲「怎么把 RP 换成钱」', from: 1, to: 3 },
        { t: '二、上手小技巧：魔杖、敲门、换 BGM', from: 4, to: 9 },
        { t: '三、结婚与生子：分开之后才开始', from: 10, to: 11 },
        { t: '四、系统杂项：书架、星标、作息', from: 12, to: 16 }
    ];

    /* 原帖把「【料理】」当成小标题用，冒号在括号外，所以照原样接一个全角冒号 */
    const paraHtml = t => t.paras.map(p => p[0]
        ? `<p class="p"><b class="rfotip-lb">${esc(p[0])}</b>${esc(p[1])}</p>`
        : `<p class="p">${esc(p[1])}</p>`).join('');

    const body = SECTIONS.map(s => {
        const list = T.filter(t => t.n >= s.from && t.n <= s.to);
        return `<h2 class="h2">${esc(s.t)}</h2>` + list.map(t =>
            `\n            <h3 class="h3">${t.n}. ${esc(t.t)}</h3>\n            ${paraHtml(t)}`).join('');
    }).join('\n');

    const ALIAS = [
        ['丽丽', '莉莉（リリ）', '旅店三姐妹的老大'],
        ['撒拉', '莎拉（サラ）', ''],
        ['爱丽丝（小护士）', '艾伊利斯（アイリス）', '旅店三姐妹的老幺，在医院当护士'],
        ['詹姆斯', '詹姆斯（ジェームス）', '花婿候补，牛仔行商'],
        ['奥黛特', '奥黛特（オデット）', '旅店二姐、厨娘'],
        ['阿奈特（アネット）', '阿涅多', '每月 4 日来访的邮差'],
        ['乔伊', '乔（ジョー）', '宝藏猎人'],
        ['罗伊德／红毛男', '（站内没有能对上的条目）', '原样保留，不猜']
    ];

    return `
            <p class="p">这 ${T.length} 条是攻略本收录的<b>玩家投稿</b>：讲讨价还价的 7 档价位、四条刷钱路线、五个制作技能的刷法，也有「在开始菜单发呆能看到女主 MV」这种纯玩心。文字是帖体，口语、错别字、括号里的自嘲<b>一处没改</b>。</p>
            <div class="note">这一页跟站内其他页的性质不同：<b>它是玩家经验，不是游戏内数值表。</b>像「卖价一共 7 个价位 0.4～1.6」「怀孕 20 天」这类说法，站内没有第二来源可核，所以只当「有人这么玩」照录，不当定论；真按这个刷，结果以游戏内显示为准。</div>
            <p class="p">四条刷钱路线里，作者自己标了来源的一条是方法②（<b>由 bus 会员 kw2179053 提供</b>）——原帖连这个都写着，照录。方法③④是「顺手」型的：刷锻造时顺便刷钱、拿 300G 的布做成 60 级窗帘卖 8000G。</p>
${body}

            <h2 class="h2">五、帖里的名字对不上站内译名时看这里</h2>
            <p class="p">原帖是民间汉化年代的写法，跟站内定稿译名有几处不同。下面只收<b>能确定是同一个人的</b>，对不上的原样留着。</p>
            ${tbl(['帖中写法', '站内条目', '备注'], ALIAS.map(a => [esc(a[0]), esc(a[1]), esc(a[2])]),
        { left: [0, 1, 2], colw: ['9rem', '11rem', ''] })}
            <div class="note"><b>「爱丽丝」在帖里出现两次，指的不是同一个人。</b>方法④里的「爱丽丝（小护士）」是护士艾伊利斯，在她那儿买白草；第 12 条里的「爱丽丝（男主，选择女主是詹姆斯）」讲的是一个委托的委托人——按帖里的说法，走男主线由爱丽丝委托你，走女主线换成詹姆斯。两位都是结婚候补，不是「主角可以改名」的意思。</div>
            <div class="jump">
                <a href="#/page/request">
                    <div class="jp-t">委托任务</div>
                    <div class="jp-s">方法②刷的那个「配達のアルバイト」在 188 条委托里</div>
                </a>
                <a href="#/page/love">
                    <div class="jp-t">恋爱与结婚</div>
                    <div class="jp-s">第 10、11 条讲的约会与生子流程</div>
                </a>
            </div>
    `;
}
function rfoSysHtml() {
    const M = (typeof RFO_MISC !== 'undefined') ? RFO_MISC : null;
    if (!M) return '<p class="p">数据未加载。</p>';
    const T = M.trophies || [], MEM = M.memory || [], W = M.wish || [], G = M.giant || [];
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cnt = {};
    T.forEach(t => { cnt[t.g] = (cnt[t.g] || 0) + 1; });
    const ord = ['白金', '金', '银', '铜'].filter(k => cnt[k]);
    const gcnt = ord.map(k => k + ' ' + cnt[k]).join(' · ');
    const plat = T.filter(t => t.g === '白金');
    const story = T.filter(t => /主线剧情/.test(t.c));

    return `
            <p class="p">这一页是攻略本「其他」表里的四块系统内容：<b>奖杯、回忆影像、龙庭许愿、巨人操作</b>。都是散在攻略本最后、游戏里又不明说的部分，照原表整理。</p>
            ${stat([['奖杯', T.length + ' 个'], ['等级构成', gcnt], ['回忆影像', MEM.length + ' 段'], ['许愿项目', W.length + ' 项']])}

            <h2 class="h2">奖杯 ${T.length} 个</h2>
            <p class="p">原表把「等级／奖杯名／取得条件」写在一起，本页拆成三列。<b>奖杯名是日文原名</b>——PS3／Wii 版的奖杯语言跟主机语言走，攻略本也只记了日文。</p>
            ${tbl(['奖杯名（原文）', '等级', '取得条件'], T.map(t => [
        esc(t.jp), t === plat[0] ? '<b>白金</b>' : t.g, esc(t.c)]),
        { leftFirst: true, left: [2], cls: 'rfosys', colw: ['15rem', '3.4rem', ''] })}
            <div class="key"><b>白金只有一个</b>：${plat.map(p => esc(p.jp) + '（' + esc(p.c) + '）').join('、')}。另有 <b>${story.length} 个</b>是「${esc(story[0] ? story[0].c : '')}」的白送杯——跟着主线走必然拿到，不用单独刷。</div>

            <h2 class="h2">回忆影像 ${MEM.length} 段</h2>
            <p class="p">游戏内的回顾片单，原表按序号一口气列完。想补看剧情、或者确认自己漏了哪段，照这个顺序对：</p>
            ${tbl(['#', '片段'], MEM.map(m => [m.n, esc(m.t)]), { leftFirst: true, left: [1], cls: 'rfosys', colw: ['2.6rem', ''] })}

            <h2 class="h2">龙庭许愿 ${W.length} 项</h2>
            <p class="p">许愿不是花现金，而是<b>消耗你已经捐出去的金额</b>——捐得越多，能开的项目越多。四项的价码与效果如下（金额是原表写的解锁价，效果括注也是原表原话）：</p>
            ${tbl(['许愿项目（原文）', '捐款额', '效果'], W.map(w => [
            esc(w.jp), '<b>' + w.g + 'G</b>', esc(w.d)]),
        { leftFirst: true, left: [2], cls: 'rfosys', colw: ['13rem', '4.6rem', ''] })}
            <div class="note">四项里最实用的是<b>第一项</b>：能直接看到各植岛还差多少繁荣度才解除石化——不用反复试种。第二项查居民喜好，第三项挪巨人，第四项只在许愿当天把掉宝率拉高。</div>

            <h2 class="h2">巨人操作</h2>
            <p class="p">巨人既是载具也是战力，按键跟人物完全两套。原表这几条是按 <b>Wii 版</b>写的（有「长按 A」「跳跃键」「地图键」这类说法）：</p>
            ${tbl(['操作', '作用'], G.map(x => [x.k ? '<b>' + esc(x.k) + '</b>' : '<span class="mon-no">（通用）</span>', esc(x.d)]), { leftFirst: true, left: [1], cls: 'rfosys', colw: ['6.4rem', ''] })}
            <div class="key">两条最容易漏：<b>装 5 只／10 只的上限</b>——每个岛只能养 5 只魔物，巨人体内 10 只；以及<b>巨人自带传送门</b>，可以直接回家和四季牧场岛，不必每次开回港口。</div>
            <div class="jump">
                <a href="#/page/rfomain">
                    <div class="jp-t">主线流程</div>
                    <div class="jp-s">32 步、三次巨人强化卡在哪</div>
                </a>
                <a href="#/page/request">
                    <div class="jp-t">委托任务</div>
                    <div class="jp-s">18 位委托人的 188 条任务</div>
                </a>
            </div>`;
}

/* 符文工房 海洋（RFO）七种武器的招式：单一来源 xls「战斗」工作表。
   原表按武器分块写「基本攻击 5 条 + 技能 3～4 条 + 总评」，本页照块还原，不拆 RP 与 Hit 数另立列
   （那些数字是夹在句子里的，硬拆容易拆错，整句照录反而可查）。 */
function rfoStyleHtml() {
    const M = (typeof RFO_MISC !== 'undefined') ? RFO_MISC : null;
    const L = (M && M.wstyle) ? M.wstyle : [];
    if (!L.length) return '';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const nSkill = L.reduce((a, w) => a + w.skill.length, 0);
    const nMove = L.reduce((a, w) => a + w.basic.length, 0);

    const blocks = L.map(w => `
            <h3 class="h3">${esc(w.n)}${w.sk ? `<span class="mon-no">　相关技能：${esc(w.sk)}</span>` : ''}</h3>
            <p class="p">${esc(w.desc)}</p>
            ${tbl(['基本攻击', '原表说明'], w.basic.map(b => [b.k ? '<b>' + esc(b.k) + '</b>' : '—', esc(b.d)]), { leftFirst: true, left: [1], cls: 'rfosys', colw: ['9rem', ''] })}
            ${tbl(['技能', '原表说明'], w.skill.map(b => [b.k ? '<b>' + esc(b.k) + '</b>' : '—', esc(b.d)]), { leftFirst: true, left: [1], cls: 'rfosys', colw: ['9rem', ''] })}
            ${w.note ? `<div class="note"><b>原表总评</b>：${esc(w.note)}</div>` : ''}`).join('');

    return `
            <h2 class="h2">七种武器的招式与 RP</h2>
            <p class="p">上面那张全表只有数值，<b>没有招式</b>——同一把双剑，普攻 11 Hit 与蓄力挑空的用法是两套东西。这一节照攻略本「战斗」表把每种武器的<b>普通／冲刺／蓄力／空中／奥义</b>与技能（各 3 条，魔杖 4 条）摊开，RP 消耗就写在句子里。</p>
            ${stat([['武器块', L.length + ' 块（斧与锤合并写）'], ['基本攻击', nMove + ' 条'], ['技能', nSkill + ' 条']])}
            <div class="key"><b>奥义的门槛不是等级，是武器技能等级</b>：杖只要 <b>6 级</b>，其余近战全都要 <b>13 级</b>；原表还注明奥义过程中主角无敌（杖除外）——所以奥义既是输出也是保命。冲刺／蓄力／空中则分别卡在技能 2／3／5 级。</div>
            ${blocks}
            <div class="note">原表末尾有两处主观评价照录不改：「打小龙一刀9999」与「最强武器，没有之一」（指魔杖）。这是攻略本作者当年的判断，不是本站结论——魔杖的强来自奥义是<b>被动</b>（装上就一直生效），而不是面板。</div>
            <div class="note">攻略本对武器的叫法与上面那张全表<b>不完全一致</b>：这里写「两手剑／长枪／武士刀」，全表按解包分类写「双手剑／枪／居合刀」；「斧头、锤子」在全表里是两类，只是攻略本合并成一节讲。<b>同一件东西的两个名字，本节照攻略本原文，全表照分类名，不做统一。</b></div>`;
}

/* 符文工房 海洋（RFO）合成难度：单一来源 xls「其他」表「合成指南」。
   原表的分段区间本身不闭合（Ⅵ 写「<0&≤-10」，把 0～-10 那段漏了），照录并点出，不替它补。 */
/* 符文工房 4 的锻造：成品上限由「材料等级总数」与「材料稀有度总数」两个数决定，
   强化栏共九格。源：《RF4 装备锻造/强化详解》（百度贴吧·呼兒將出換美酒）。
   数据由 _build_rf4_forge.py 从源文本拆出，存在 RF4_FORGE 里。 */
function craftRf1Html() {
    const D = (typeof RF1_CRAFT !== 'undefined') ? RF1_CRAFT : null;
    if (!D) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const famRows = D.families.reduce((a, f) => a + f.rows.length, 0);
    let out = '';
    out += '<h2 class="h2">一代锻造：七大类装备，逐级进化</h2>';
    out += '<p class="p">RF1 的锻造是「拿上一阶的成品当下一阶的素材」——每把武器、每件农具都不是孤立配方，而是一条<b>进化链</b>。下面是源里按大类排的全表，<b>照原文顺序</b>，连「初始素材」那行也留着。源里长枪系、战锤系各有一处换行断掉的效果词（「封印攻击」「毒素攻击」），已并入上一行的「附加效果」，不另起、不丢字。</p>';
    out += stat([['装备大类', D.families.length + ' 系'], ['锻造配方', famRows + ' 条'], ['饰品·睡袋', D.accessory.rows.length + ' 条'], ['药学', D.pharmacy.rows.length + ' 条']]);
    D.families.forEach(f => {
        out += '<h3 class="h3">' + E(f.name) + '（' + f.rows.length + ' 条）</h3>';
        out += tbl(f.cols.map(E), f.rows.map(r => r.map(E)), { cls: 'rf1craft' });
    });
    out += '<details class="rf1craft-detail"><summary>各系「终级」配方所需全部素材（从最初级算起）</summary>';
    D.families.forEach(f => {
        if (!f.totals.length) return;
        out += '<h4 class="h4">' + E(f.name.replace('系', '')) + '</h4>';
        out += tbl(['名称', '所需素材一览'], f.totals.map(t => [E(t[0]), E(t[1])]), { cls: 'rf1craft', leftFirst: true, left: [1] });
    });
    out += '</details>';
    out += '<h3 class="h3">饰品与睡袋（' + D.accessory.rows.length + ' 条）</h3>';
    out += '<p class="p">指轮、腕轮、胸针、吊坠、靴子、腰带与睡袋——大多是<b>抗性／属性加成</b>，毕业向的「幸运指轮」「星之吊坠」都在这一栏。</p>';
    out += tbl(D.accessory.cols.map(E), D.accessory.rows.map(r => r.map(E)), { cls: 'rf1craft' });
    out += '<h3 class="h3">药学（' + D.pharmacy.rows.length + ' 条）</h3>';
    out += '<p class="p">HP／RP 回复药、异常状态解除药，以及火／水／风／土四元素与作物营养剂。作用是<b>调和素材直接给</b>，等级门槛写在「药学LV」。</p>';
    out += tbl(D.pharmacy.cols.map(E), D.pharmacy.rows.map(r => r.map(E)), { cls: 'rf1craft' });
    out += '<div class="note">源：<b>' + E(D.src) + '</b>。料理（刀／煎锅／锅／烤箱／蒸锅／搅拌器／无厨具）本页不收，归到<a href="#/page/cook">料理配方</a>页。</div>';
    return out;
}

function craftAzumaHtml() {
    const D = (typeof AZUMA_FORGE !== 'undefined') ? AZUMA_FORGE : null;
    if (!D) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const famRows = D.families.reduce((a, f) => a + f.rows.length, 0);
    let out = '';
    out += '<h2 class="h2">龙之天地锻造：五类武器，无农具</h2>';
    out += '<p class="p">《符文工房 龙之天地》（2025）的锻造只覆盖<b>五类武器</b>：单手剑、双手剑、双剑、弓、符咒。本作<b>取消了传统农具</b>（锄头／镰刀／水壶），改由「神器」系统替代，所以这一页<b>没有农具锻造</b>。武器配方主要来自各地「祠堂」献舞解锁，再于铁匠铺锻造；表里「买价」为商店／直接购入价，卖价不录。符咒一栏的物理攻击记「—」、数值记在「魔攻」列。</p>';
    out += stat([['武器大类', D.families.length + ' 类'], ['武器配方', famRows + ' 条']]);
    D.families.forEach(f => {
        out += '<h3 class="h3">' + E(f.name) + '（' + f.rows.length + ' 条）</h3>';
        out += tbl(f.cols.map(E), f.rows.map(r => r.map(E)), { cls: 'rf1craft' });
    });
    out += '<div class="note">源：<b>' + E(D.src) + '</b>。' + E(D.note) + ' 料理配方归到<a href="#/page/cook">料理配方</a>页，本页不收。</div>';
    return out;
}

function craftRffHtml() {
    const D = (typeof RFF_FORGE !== 'undefined') ? RFF_FORGE : null;
    if (!D) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const famRows = D.families.reduce((a, f) => a + f.rows.length, 0);
    let out = '';
    const G_W = ['单手剑', '双手剑', '长枪', '战锤', '战斧', '法杖'];
    const G_F = ['农具'];
    const G_A = ['饰品', '头饰', '颈饰', '服饰', '指环与手环', '玩具', '泳装'];
    const G_P = ['药学'];
    const inG = (f, ks) => ks.some(k => f.name.indexOf(k) === 0);
    const grp = ks => D.families.filter(f => inG(f, ks)).reduce((a, f) => a + f.rows.length, 0);
    out += '<h2 class="h2">边境锻造：买配方书逐级解锁</h2>';
    out += '<p class="p">《符文工房 边境》的配方靠买「配方书」解锁，书本身标着价格与解锁阶段：入门锻造书 1,000G 一本包办单手剑／双手剑／枪／锤／斧的初级配方，法杖书 2,000G；进阶书按武器各买一本（8,000～10,000G），农具进阶书 12,000G。饰品走 Crafting（制作）技能、药学走 Pharmacy（药学）技能，跟锻造不是同一条技能线，本页一并收。</p>';
    out += '<p class="p">技能按源表拆两列：<b>锻造Lv</b>是做这件东西本身要的等级，<b>需求武器／魔力／工具Lv</b>是源表最右列的配套门槛——两者不等时（Broadsword 锻造 1／武器 3、Gungnir 锻造 94／需求 99）必须分开看。同一配方在表里出现两次，是源站并列的两种材料组合。</p>';
    out += stat([['配方书', D.families.length + ' 本'], ['配方合计', famRows + ' 条'],
        ['武器', grp(G_W) + ' 条'], ['农具', grp(G_F) + ' 条'],
        ['饰品', grp(G_A) + ' 条'], ['药学', grp(G_P) + ' 条']]);
    let curGrp = '';
    D.families.forEach(f => {
        const c = inG(f, G_W) ? '武器（锻造）'
            : inG(f, G_F) ? '农具（锻造）'
                : inG(f, G_A) ? '饰品（Crafting 制作）' : '药学（Pharmacy）';
        if (c !== curGrp) { curGrp = c; out += '<h2 class="h2">' + E(c) + '</h2>'; }
        out += '<h3 class="h3">' + E(f.name) + '（' + f.rows.length + ' 条）</h3>';
        out += tbl(f.cols.map(E), f.rows.map(r => r.map(E)), { cls: 'rf1craft' });
    });
    out += '<div class="note">源：<b>' + E(D.src) + '</b>。' + E(D.note) + ' 料理配方归到<a href="#/page/cook">料理配方</a>页，本页不收。</div>';
    return out;
}

function craftRf5Html() {
    const rec = (typeof RECIPE !== 'undefined') ? RECIPE : [];
    const cats = (typeof RECIPE_CATS !== 'undefined') ? RECIPE_CATS : [];
    const cnt = (typeof RECIPE_CNT !== 'undefined') ? RECIPE_CNT : [];
    if (!rec.length) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const short = s => s.replace(/(食谱|设计图|配方)$/, '');
    const kindOf = s => /^(盾|铠甲|帽子|鞋子)/.test(short(s)) ? '防具'
        : s.indexOf('农具') >= 0 ? '农具'
        : s.indexOf('饰品') >= 0 ? '饰品'
        : s.indexOf('药学') >= 0 ? '药学' : '武器';
    const idxByKind = {};
    cats.forEach((c, i) => { if (i >= 7) (idxByKind[kindOf(c)] = idxByKind[kindOf(c)] || []).push(i); });
    const forgeCount = cats.reduce((a, c, i) => i >= 7 ? a + (cnt[i] || 0) : a, 0);
    let out = '';
    out += '<h2 class="h2">五代锻造：先做配方，再用倍铁乘到顶</h2>';
    out += '<p class="p">RF5 的「锻造」分两层：<b>第一层是配方</b>——下面的武器／防具／饰品／农具／药学设计图，靠技能等级解锁、凑齐素材做出成品；<b>第二层是强化</b>——把成品丢进强化栏，用「倍铁／10 倍铁／不明物体」把数值乘上去，那套算法单独放在<a href="#/page/gear">装备打造·毕业套</a>页。所以这一页只列<b>基础配方</b>，不做强化。</p>';
    out += stat([['锻造·药学配方', forgeCount + ' 条'], ['武器类型', (idxByKind['武器'] || []).length + ' 类'], ['防具', (idxByKind['防具'] || []).length + ' 类'], ['饰品·农具·药学', ((idxByKind['饰品'] || []).length + (idxByKind['农具'] || []).length + (idxByKind['药学'] || []).length) + ' 类']]);
    ['武器', '防具', '饰品', '农具', '药学'].forEach(k => {
        const idxs = idxByKind[k] || [];
        if (!idxs.length) return;
        out += '<h3 class="h3">' + E(k) + '（' + idxs.reduce((a, i) => a + (cnt[i] || 0), 0) + ' 条）</h3>';
        idxs.forEach(i => {
            const rows = rec.filter(x => x.c === i).map(x => [E(x.n), E(x.lv), E(x.m.join('、'))]);
            out += '<h4 class="h4">' + E(short(cats[i])) + '（' + (cnt[i] || 0) + ' 条）</h4>';
            out += tbl(['配方', '技能Lv', '素材'], rows, { cls: 'rf1craft' });
        });
    });
    out += '<div class="note">数据取自《符文工房5 全配方》表（<code>js/recipes.js</code> 的 <code>RECIPE</code>，661 条中的锻造／药学部分），与<a href="#/page/recipe">配方大全</a>页同源；配方名沿用汉化版译名，与官方中文版可能个别差异。<b>技能等级不够做不出</b>，成品实际等级由素材等级与技能等级共同决定。</div>';
    return out;
}

function craftRf2Html() {
    const D = (typeof RF2_CRAFT !== 'undefined') ? RF2_CRAFT : null;
    if (!D) return '';
    const E = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const famRows = D.families.reduce((a, f) => a + f.rows.length, 0);
    let out = '';
    out += '<h2 class="h2">二代锻造：八系装备，逐级进化</h2>';
    out += '<p class="p">《符文工房2》没有官方中文译名，所以<b>武器和工具名一律保留英文</b>；材料名用中文圈通用叫法（青铜、铁、银、金、白金……）。锻造同样是「拿上一阶成品当下一阶素材」的<b>进化链</b>——表里「素材一览」若出现前一级武器／工具名，就是从那把升级而来。源里 7 个武器系（短剑／长剑／斧／战锤／枪／法杖／盾）＋ 1 个农具系，全表照原文顺序排。</p>';
    out += stat([['装备大类', D.families.length + ' 系'], ['锻造配方', famRows + ' 条'], ['药学', D.pharmacy.rows.length + ' 条']]);
    D.families.forEach(f => {
        out += '<h3 class="h3">' + E(f.name) + '（' + f.rows.length + ' 条）</h3>';
        out += tbl(f.cols.map(E), f.rows.map(r => r.map(E)), { cls: 'rf1craft' });
    });
    out += '<h3 class="h3">药学（' + D.pharmacy.rows.length + ' 条）</h3>';
    out += '<p class="p">HP／RP 回复、异常状态解除，以及火／水／风／土四元素与作物营养剂。作用是<b>调和素材直接给</b>，等级门槛写在「等级」；卖价／买价照 biligame 中文 wiki 录入。</p>';
    out += tbl(D.pharmacy.cols.map(E), D.pharmacy.rows.map(r => r.map(E)), { cls: 'rf1craft' });
    out += '<div class="note">源：<b>' + E(D.src) + '</b>。' + E(D.note) + ' 料理配方归到<a href="#/page/cook">料理配方</a>页，本页不收。</div>';
    return out;
}

function craftRf4Html() {
    const D = (typeof RF4_FORGE !== 'undefined') ? RF4_FORGE : null;
    if (!D) return '';
    const esc = t => String(t == null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const n = v => Number(v).toLocaleString('en-US');

    const pos = D.base.pos + D.base.enh;          // 六个制作位 + 九个强化位
    const tluMax = pos * 10;                      // 每位最高 10 级
    const trpMax = pos * 15;                      // 稀有度 0–15

    /* ---- 四种段位表 ---- */
    /* 门槛并进「段位」格，所以表头比数据源少一列 */
    const tluRows = D.tlu.rows.map(r =>
        [`第 ${r[0]} 段（${r[1]}）`, n(r[2]), n(r[3]), n(r[4]), n(r[5])]);
    const trpRows = D.trp.rows.map(r =>
        [`第 ${r[0]} 段（${r[1]}）`, n(r[2]), n(r[3])]);
    const staffRows = D.staff.rows.map(r => [`第 ${r[0]} 段（${r[1]}）`, n(r[2])]);
    const mdefRows = D.mdef.rows.map(r => [`第 ${r[0]} 段（${r[1]}）`, n(r[2])]);
    const H_TLU = ['段位', '武器物攻', '武器魔攻', '防具物防', '防具魔防'];
    const H_TRP = ['段位', '武器物攻', '防具物防'];
    const H_STAFF = ['段位', '法杖魔攻'];
    const H_MDEF = ['段位', '魔防'];

    const last = a => a[a.length - 1];
    const tluW = last(D.tlu.rows), tluA = last(D.tlu.rows);
    const trpW = last(D.trp.rows), trpA = last(D.trp.rows);
    const armorTop = trpA[3];                    // 防具物防在第四格
    const staffTop = last(D.staff.rows), mdefTop = last(D.mdef.rows);

    /* ---- 素材稀有度对照（源里那份英文清单 vs 站内解包表）---- */
    const rp = D.rp || [];
    const mine = rp.filter(x => x.mine != null);
    const same = mine.filter(x => x.mine === x.v);
    const diff = mine.filter(x => x.mine !== x.v);
    const noid = rp.filter(x => x.mine == null);

    /* 同一件素材在清单里出现两次、数值不同 */
    const byKey = {};
    rp.forEach(x => { const k = x.cn || x.en.toLowerCase(); (byKey[k] = byKey[k] || []).push(x); });
    const dup = Object.keys(byKey).filter(k => byKey[k].length > 1 &&
        new Set(byKey[k].map(x => x.v)).size > 1).map(k => byKey[k]);

    /* 分类汇总 */
    const cats = [];
    rp.forEach(x => { if (cats.indexOf(x.cat) < 0) cats.push(x.cat); });
    const catRows = cats.map(c => {
        const all = rp.filter(x => x.cat === c);
        const m = all.filter(x => x.mine != null);
        return [esc(c), all.length, m.length, m.filter(x => x.mine === x.v).length];
    });

    /* ---- 理论最高攻击那把：和站内解包表对一下 ---- */
    const W = (typeof EQW_RF4 !== 'undefined') ? EQW_RF4 : [];
    const splash = W.filter(w => /溅/.test(w[0]));
    const topBase = W.reduce((a, w) => (a && w[3] > a[3]) ? w : a, null);

    const specRows = D.spec.map(s => [
        (s.pre ? esc(s.pre) + ' ' : '') + '<b>' + esc(s.en) + '</b>',
        s.cn ? esc(s.cn) : '—',
        esc(s.note)
    ]);

    return `
    <p class="p">四代的锻造有一层别作没有的东西：成品的最终面板<b>不只取决于配方</b>，还取决于你往里面塞了什么料——把材料的<b>等级</b>和<b>稀有度</b>各自加总，两个总数各自跨过门槛，就额外送一段攻击或防御。这一页把这套算法按原文拆开。</p>
    ${stat([
        ['总格数', pos + ' 格'],
        ['等级总数上限', n(tluMax)],
        ['稀有度总数上限', n(trpMax)],
        ['稀有度对照', rp.length + ' 条']
    ])}
    <div class="note">源：<b>${esc(D.src)}</b>。作者自述「以下各项是我看了前人的攻略后自己用游戏资料去证明、推论而补充得出」，其中 TLU／TRP 一段转自 gamefaqs 的 Kirbye2006 与 Anketam，末尾的素材稀有度清单是外国论坛玩家自记。<b>这是社区整理，不是官方数值。</b></div>

    <h2 class="h2">一、先记两个总数：TLU 与 TRP</h2>
    <p class="p">一件装备的材料位置一共 <b>${pos} 个</b>：制作时的 6 个，加上强化的 9 个。每个位置上放的材料都带着自己的<b>等级</b>与<b>稀有度</b>（原文说稀有度是藏在材料说明里、0 到 15 之间的隐藏值），把这些数分别加起来，就得到「材料等级总数」<b>TLU</b> 与「材料稀有度总数」<b>TRP</b>。</p>
    ${tbl(['位置', '格数'], [
        ['制作（配方本身）', D.base.pos + ' 格'],
        ['强化', D.base.enh + ' 格'],
        ['合计', '<b>' + pos + ' 格</b>']
    ], { leftFirst: true, colw: ['9rem', '5rem'] })}
    <p class="p">原文给的上限是 TLU <b>${n(tluMax)}</b>、TRP <b>${n(trpMax)}</b>。按 ${pos} 格折算回去，等于每格最高 10 级、15 点稀有度——和原文另一句「稀有度在 0 至 15 之间」正好对上，这两个数不是随口给的。</p>
    <div class="key">这套分段收益<b>要制作技能到 50 才开始生效</b>（原文：「制作技能到50后」）。技能等级没到之前，塞再好的料也拿不到这几段加成。</div>

    <h2 class="h2">二、TLU 到了哪一段，送多少</h2>
    <p class="p">武器与防具共用同一套 TLU 门槛，但送的东西不一样：武器送物攻与魔攻，防具送物防与魔防。</p>
    ${tbl(H_TLU, tluRows, { leftFirst: true, colw: ['', '5rem', '5rem', '5rem', '5rem'] })}
    <p class="p">满段（${tluMax}）是武器 <b>${n(tluW[2])} 物攻 + ${n(tluW[3])} 魔攻</b>、防具 <b>${n(tluA[4])} 物防 + ${n(tluA[5])} 魔防</b>。注意武器这一档<b>同时给物攻和魔攻</b>，防具那一档给的是物防和魔防，两列别记混。</p>
    <div class="note">原文列的是「第几段给多少」，<b>没写这些段是否累加</b>（即到了第 3 段是只拿第 3 段的 70，还是把前两段也叠上）。本页不替它判断，也不替它求和。</div>

    <h2 class="h2">三、TRP 是另一条线，八段</h2>
    <p class="p">稀有度总数走的是完全独立的一条：门槛从 25 起，八段，最后一档（200）直接把武器物攻从 ${n(D.trp.rows[6][2])} 抬到 ${n(trpW[2])}——比前一档翻了一倍。</p>
    ${tbl(H_TRP, trpRows, { leftFirst: true, colw: ['', '6rem', '6rem'] })}
    <p class="p">满段（门槛 ${trpW[1]}）武器送 <b>${n(trpW[2])} 物攻</b>、防具送 <b>${n(armorTop)} 物防</b>。也就是说，一件装备的最终面板＝配方基础值 ＋ TLU 那一段 ＋ TRP 那一段 ＋ 强化材料自己给的点数。想堆面板，两条线得<b>同时</b>推——只把等级塞满，TRP 那 ${n(trpW[2])} 一分都拿不到。</p>

    <h2 class="h2">四、法杖与魔防走的是第三套表</h2>
    <p class="p">原文正文只写了一句「法杖的TRP奖励对应为法术强度，最高段奖励测试为 1800」，前七段没给。它末尾抄来的那份外国论坛清单里才有完整的八段，魔防也另有一套：</p>
    ${tbl(H_STAFF, staffRows, { leftFirst: true, colw: ['', '6rem'] })}
    ${tbl(H_MDEF, mdefRows, { leftFirst: true, colw: ['', '6rem'] })}
    <p class="p">法杖满段 <b>${n(staffTop[2])} 魔攻</b>，与正文那句「最高段奖励测试为 1800」一致。魔防满段 <b>${n(mdefTop[2])}</b>，比防具物防的 ${n(armorTop)} 少 ${armorTop - mdefTop[2]}——原文自己也注了一句「除第 8 段外与 DEF 的段位相同」，这 20 点的差是作者照抄的原文差异，不是本站算错。</p>
    <div class="note"><b>两张表的来源不同，得分开看：</b>上面「武器／防具」那四张是作者正文里自己整理的；法杖与魔防这两张是他附在末尾的英文清单（原文说「下面是外国论坛上玩家自己记下的一些数据」）。本站按来源分成两节，不把两份混成一套。</div>

    <h2 class="h2">五、饰品看属性归哪一类</h2>
    <p class="p">饰品也吃 TRP，但吃哪一档要看它加的是什么属性。原文按三类列了清单：</p>
    ${tbl(['送哪一项', '哪些饰品'], D.acc.map(a => ['<b>' + esc(a[0]) + '</b>', esc(a[1])]), {
        leftFirst: true, left: [1], colw: ['5rem', '']
    })}
    <p class="p">所以给饰品堆稀有度之前，先确认它送的是哪一项——往一枚加魔防的戒指（MDEF 那一类）里堆料，涨的是魔防那一档，不会变成物攻。</p>

    <h2 class="h2">六、强化：同一种料重复用，效果会衰减</h2>
    <p class="p">规则很干脆：<b>同一材料重复使用，效果不断减半</b>。原文举的例子是「一个材料写着加 10 防，第一次是 10，然后便是 5、2、1、0」。照这个例子，同一件料塞到<b>第五格就归零</b>了（10 → 5 → 2 → 1 → 0）——<b>九格要凑不同材料，不是同一件堆九次</b>。</p>
    <p class="p">除了一般的数值材料，还有一批<b>带特殊功用</b>的料，原文列了 ${D.spec.length} 条：</p>
    ${tbl(['原名', '中文名', '作用（原文）'], specRows, {
        leftFirst: true, left: [1, 2], colw: ['9rem', '5rem', '']
    })}
    <div class="note">这一节原文自己写了「原文英文，我自己翻译的，如果对不上汉化版的文字请见谅」——所以中文名以原文译法为准，本站不换成解包表里的叫法。有 ${D.spec.filter(x => !x.cn).length} 条<b>只有英文名</b>（${D.spec.filter(x => !x.cn).map(x => esc(x.en)).join('、')}），原文就没给中文，本页不替它起名——站内解包表里能查到对应的可能是「遮光石」「四叶草」「倍铁」「10倍铁」，但那是对照出来的，不是原文写的。</div>
    <div class="key">两条连招是原文点名的：<b>毒素X</b> 会让后续所有材料功效相反，<b>黑苹果</b> 是大量负属性——两个凑一起是「负得更多」还是「负负得正」，原文只说「和上述的X一起用」，没给结论，本页也不猜。</div>

    <h2 class="h2">七、站内素材表的「稀有度」，就是这里的 TRP</h2>
    <p class="p">「素材与矿石」页那张表有一列<b>稀有度</b>（取自解包数据），它在这套算法里就是算 TRP 用的那个数。原文末尾附了一份 ${rp.length} 条的英文稀有度清单，拿它跟站内表逐条对，能对上的有 <b>${mine.length}</b> 条：</p>
    ${tbl(['分类', '清单条数', '站内查得到', '数值一致'], catRows, { leftFirst: true, colw: ['4.4rem', '4.6rem', '4.6rem', '4.2rem'] })}
    <p class="p">对上的 ${mine.length} 条里 <b>${same.length} 条数值一致</b>，${diff.length} 条不一致：</p>
    ${tbl(['素材', '清单里写作', '清单值', '站内稀有度'], diff.map(x => [
        '<b>' + esc(x.cn) + '</b>', esc(x.en), x.v, x.mine
    ]), { leftFirst: true, left: [1], colw: ['6rem', '8.4rem', '4rem', '4.6rem'] })}
    <div class="note"><b>三处是清单自己打架，不是站内抄错：</b>${dup.map(g =>
        esc(g[0].cn || g[0].en) + '（' + g.map(x => esc(x.en) + ' ' + x.v).join(' / ') + '）').join('、')}——同一件素材在同一份清单里出现两次、数值不同，而<b>站内这三个数都等于每件的第一条（Glitta Augite 8、Raccoon Leaf 10、10-Fold Steel 10）</b>。两组都留着，不判定后面那三行是不是笔误。</div>
    <p class="p">剩下 <b>${noid.length} 条对不上</b>：${noid.map(x => esc(x.en) + '（' + x.v + '）').join('、')}。这些英文名在站内解包表里<b>找不到唯一对应</b>——比如 Small／Big／Rune Crystal 三个都可能对上好几件结晶，本站不硬配；<b>「对不上」不等于站内没有这件素材</b>。</p>

    <h2 class="h2">八、理论最高攻击的一把</h2>
    <p class="p">原文最后算了一把「理论攻击最高的武器」，逐项拆开：</p>
    <ul class="ul">${D.maxw.slice(1).map(l => `<li class="li">${esc(l)}</li>`).join('')}</ul>
    ${splash.length ? `<p class="p">站内解包表里这把写作<b>${esc(splash[0][0])}</b>（${esc(splash[0][1])}，${esc(splash[0][2])}属性，基础物攻 <b>${n(splash[0][3])}</b>、魔攻 ${n(splash[0][4])}），和原文「基础 14000 Atk」对得上。而站内全部 ${W.length} 把武器里，基础物攻最高的也正是它${topBase && topBase[3] === splash[0][3] ? '——这一条是现算的，不是照抄原文' : ''}。</p>` : ''}
    <div class="note">「总共 18133 Atk + 3440 STR」是作者按自己那套式子加出来的，<b>不是官方数值</b>；其中「镶嵌」「强化」那几项的乘算关系（哪些乘 2、哪些乘 8）原文只列了括号里的写法，本站照录，不重新推。</div>

    <h2 class="h2">九、原文给的两条实操</h2>
    <ul class="ul">
        <li class="li"><b>法杖升到 Lv.3 后才能多段蓄力</b>；初期拿「闪电马 Boss 的掉落物」去强化，蓄力放出的法术比同期其他法术好用。</li>
        <li class="li"><b>收尾三件是绿龙牙、龙骨、彩虹水壶</b>（原文写作「彩虹水壸」）——绿龙牙是因为法术本身强，龙骨是无视抗性，水壶是第一段蓄力很快。这是原文说的「外国攻略比较推荐」。</li>
    </ul>
    <p class="p">另有一条只跟农具有关：把能蓄力四段的鱼竿用<b>光明石</b>继承替换到农具里，农具也能蓄力四段，而且<b>第四段不花 RP</b>。原文说「这里涉及关于法杖的继承，有时间搜集数据后将于楼下补充」——也就是说这部分他一直没补完，本页照录现状。</p>

    <h2 class="h2">十、照录不改的地方</h2>
    <ul class="ul">
        <li class="li"><b>错字留着：</b>「增加武器攻击<b>笵</b>围」（范围）、「能<b>畜</b>力四段」（蓄力）、「强化到水<b>壸</b>中」（水壶）、「<b>遊</b>戏」（游戏）。原文就这么写，本页一处都没改。</li>
        <li class="li"><b>「PLU满级」：</b>原文谈红萝卜剑时写「就有一把PLU满级(奖励700物攻 + 650魔攻)的单手剑」——而全文只有 TLU／TRP 两个缩写，PLU 应是把两者混写。照录，不改写成 TLU。</li>
        <li class="li"><b>「红萝卜剑」对不上站内任何一把：</b>原文说它是「某把单手剑」「材料只要单一块红萝卜」；站内解包表里带萝卜字样的武器只有「白萝卜」，而且归在<b>双手剑</b>（基础物攻 78）。两边照录，<b>不断言是不是同一把</b>，也不断言原文写错了类别。</li>
        <li class="li"><b>人名：</b>原文写「Barrett段奖励(头巾男)」，站内居民表里这位叫<b>巴雷特</b>（バレット）。表里不换成人名，只在正文点一句。</li>
        <li class="li"><b>译名两套并存：</b>原文叫「溅耀星辰 Splash Star」，站内解包表叫「飞溅之星」；原文「彩虹水壸」，站内农具里叫「彩虹洒水壶」。各在各位，不统一。</li>
        <li class="li"><b>清单里的重复条目照录：</b>同一份英文清单里，${dup.length} 件素材各出现两次且数值不同（见上一节那张提示）。不合并成一行。</li>
        <li class="li"><b>原文没给的，本页也没有：</b>九格强化栏里各位置的<b>固定加成</b>（哪些料加攻、加多少）、各段是否累加、镶嵌与强化的乘算细则，原文都没列。这些地方都空着。</li>
    </ul>

    <p class="p">素材的稀有度在哪查、每把武器的基础物攻是多少，分别到<a href="#/page/material">素材与矿石</a>和<a href="#/page/weapon">武器</a>两页对着看。</p>
`;
}

/* 符文工房 3 的素材强化：每件素材当强化料时加哪些能力、带哪些状态效果（含数值与触发率）、
   以及强化难度，加上原文开头那一段「各项上限」。
   源：《符文3素材强化效果不包括法杖》（GB18030，社区整理，原文无署名）。
   数据由 _build_rf3_mat.py 拆出，存在 RF3_MAT 里；对照列取自站内 MAT_RF3。 */
function craftRf3Html() {
    const D = (typeof RF3_MAT !== 'undefined') ? RF3_MAT : null;
    if (!D || !D.rows.length) return '';
    const esc = t => String(t == null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const K = ['攻', '魔攻', '防', '魔防', '筋力', '知力', '体力'];
    const sgn = v => (v > 0 ? '+' : '') + v;
    /* 每项加成／效果各包一层 nowrap：中文本来到处可断，不包就会把「知力+8」拆成「知／力+8」 */
    const nw = t => '<span class="nw">' + t + '</span>';
    const modStr = ms => (ms && ms.length) ? ms.map(m => nw(m[0] + sgn(m[1]))).join(' ') : '—';
    /* 搜索键必须是纯文本：data-s 是属性，塞进带引号的 span 会把行标签截断 */
    const effTxt = es => (es && es.length) ? es.map(e => e[0] + '（' + e[1] + '）' + e[2]).join(' ') : '';
    const effStr = es => (es && es.length)
        ? es.map(e => nw(e[0] + '（' + e[1] + '）' + e[2])).join('　') : '—';

    const R = D.rows;
    const uniq = [];
    R.forEach(r => { if (uniq.indexOf(r[0]) < 0) uniq.push(r[0]); });
    const MAP = R.filter(r => r[4]);
    const mapped = MAP.length;
    const unmapped = uniq.filter(n => !R.some(r => r[0] === n && r[4]));

    /* 难度：站内给了值的行才算可比 */
    const dCmp = MAP.filter(r => r[5] != null);
    const dSame = dCmp.filter(r => r[5] === r[1]);
    const dDiff = dCmp.filter(r => r[5] !== r[1]);

    /* 加点：七项逐项比，源里没写的项按 0 计 */
    const sum = ms => { const o = {}; K.forEach(k => o[k] = 0); ms.forEach(m => o[m[0]] += m[1]); return o; };
    const mSame = [], mDiff = [];
    MAP.forEach(r => {
        const a = sum(r[3]), b = sum(r[6]);
        (K.every(k => a[k] === b[k]) ? mSame : mDiff).push(r);
    });

    /* 名称写法不一样的那些（源名 ≠ 站内名） */
    const nmDiff = MAP.filter(r => r[4] !== r[0]);

    /* 源里同一件料被分节抄过几遍，差异表按名字去重，否则同一行会连出两次 */
    const uniqBy = (arr, f) => {
        const seen = {}, out = [];
        arr.forEach(x => { const k = f(x); if (!seen[k]) { seen[k] = 1; out.push(x); } });
        return out;
    };
    const dDiffU = uniqBy(dDiff, r => r[0]);
    const mDiffU = uniqBy(mDiff, r => r[0]);
    const nmDiffU = uniqBy(nmDiff, r => r[0]);

    /* 按效果反查：效果 -> 素材（同名同值只留一条，原文是分节重复抄的） */
    const grp = {}, gord = [];
    R.forEach(r => r[2].forEach(e => {
        if (!grp[e[0]]) { grp[e[0]] = []; gord.push(e[0]); }
        const key = r[0] + '|' + e[1] + '|' + e[2];
        if (!grp[e[0]].some(x => x[3] === key)) grp[e[0]].push([r[0], e[1], e[2], key]);
    }));
    const isRes = n => /抗性|耐性|耐吸收/.test(n);
    const atkG = gord.filter(n => !isRes(n));
    const resG = gord.filter(n => isRes(n));
    const gRow = n => [
        '<b>' + esc(n) + '</b>',
        grp[n].length,
        grp[n].map(x => esc(x[0]) + '（' + x[1] + '）' + esc(x[2])).join('、'),
        Math.max.apply(null, grp[n].map(x => x[1]))
    ];
    const maxOf = n => Math.max.apply(null, grp[n].map(x => x[1]));

    return `
    <h2 class="h2">三代的强化：加成之外还带状态效果</h2>
    <p class="p">三代把强化料分成两类作用：一类是<b>直接改面板</b>（攻、防、魔攻、魔防、筋力、知力、体力），另一类是<b>往成品上挂状态效果</b>——中毒、麻痹、气绝、吸血，或者反过来挂抗性。第二类在菜单里只写「攻击中毒＋」，看不出<b>多强、多容易触发</b>，而这一份源把每个数都写出来了：<b>（数值）（触发率）</b>两个数并排。</p>
    ${stat([
        ['条目', R.length + ' 行'],
        ['素材', uniq.length + ' 件'],
        ['站内对得上', MAP.length + ' 行'],
        ['站内素材表', ((typeof MAT_RF3 !== 'undefined') ? MAT_RF3.length : 90) + ' 件']
    ])}
    <div class="note">源：<b>${esc(D.src)}</b>，社区整理，<b>原文没有署名</b>，也没写出处。文件名自述「不包括法杖」，正文里确实只有素材、没有法杖那套规则——<b>法杖怎么强化，这份源里没有</b>。站内对照列取自<a href="#/page/material">素材与矿石</a>页的强化表（解包数据）。两份都是民间整理，不是官方手册。</div>

    <h2 class="h2">一、原文先划的几条上限</h2>
    <p class="p">表里所有（数值）都不是越大越好，原文开头先给了各项天花板：</p>
    ${tbl(['项目', '上限', '说明'], [
        ['气绝值', '<b>99</b>', '单列一项，比别的状态低一截'],
        ['暴击率', '<b>128</b>', ''],
        ['状态攻击（吸血／疲劳／感冒／睡眠／毒／气绝／封印）', '<b>255</b>', '原文把七项并成一行'],
        ['各类抗性（吸血／气绝／毒／吹飞／麻痹／感冒／疲劳／封印／睡眠／即死／暴击）', '<b>128</b>', '十一种，原文同样并成一行'],
        ['耐性技能', '+63（49%）', '「满级」时的加成'],
        ['硬直', '<b>128</b>', '另起一行写的'],
        ['属性抗性（爱／水／火／风／土／光／暗／无）', '4 级', '1 级伤害 1/2；2 级 1/8；3 级免疫；4 级吸收']
    ], { leftFirst: true, left: [2], cls: 'rf3mat', colw: ['auto', '4.4rem', 'auto'] })}
    <p class="p">按这张表回看下面的数据：<b>离上限最近的是气绝</b>——表里最高「动枝 气绝（6）」，上限只有 99；而 255 那一档（毒、麻痹、吸血）表里最高也只到 <b>25</b>（百鱼王的鳞片，吸血），连十分之一都没到。也就是说，靠单件素材堆满状态攻击，在这份表里做不到。</p>
    <div class="note">「属性抗性共 4 级」这段原文只写了等级与倍率，<b>没写每种属性各是哪一级、也没写怎么升</b>；而这张素材表里<b>一条属性抗性都没有</b>（全是状态抗性）。所以这一段在本页只作上限记录，不往素材上套。</div>

    <h2 class="h2">二、${R.length} 行全表</h2>
    <p class="p">这一张就是源里的全部数据，<b>按原文顺序</b>排——原文自己就是按效果分节的（毒一节、暴击一节、睡眠一节……），同一件素材在几节里各抄一遍，所以会出现名字重复。表里「难度」是<b>强化难度</b>，数值越高越难成功。</p>
    ${ftableOwn(['素材', '状态效果（数值）触发率', '能力加成', '难度'],
        ['6.2rem', 'auto', '8.6rem', '3.4rem'],
        R.map(r => [r[0] + ' ' + effTxt(r[2]), [esc(r[0]), effStr(r[2]), modStr(r[3]), r[1]]]),
        { cls: 'rf3mat', ph: '搜素材名或效果（毒／气绝／吸血…）', left: [1, 2] })}
    <div class="note">同一件素材重复出现<b>不是排版事故</b>：源按「带哪种效果」分节，每节把整行重抄一次。比如「会唱歌的小瓶子」在毒、睡眠、即死、麻痹、封印五节里各有一行，数值完全一致；本表不合并，因为合并就得替它挑一行。</div>

    <h2 class="h2">三、想挂某个效果，用哪件料</h2>
    <p class="p">把上表按效果倒过来排。攻击类 ${atkG.length} 种、抗性类 ${resG.length} 种，「最高」是这一列里出现过的最大数值（含负数，负数就是副作用）：</p>
    ${tbl(['攻击类效果', '素材数', '素材（数值）触发率', '最高'], atkG.map(gRow), {
        leftFirst: true, left: [2], cls: 'rf3mat', colw: ['5.4rem', '3.6rem', 'auto', '3.2rem']
    })}
    <p class="p">抗性侧同理：</p>
    ${tbl(['抗性类效果', '素材数', '素材（数值）触发率', '最高'], resG.map(gRow), {
        leftFirst: true, left: [2], cls: 'rf3mat', colw: ['5.4rem', '3.6rem', 'auto', '3.2rem']
    })}
    <div class="key">想同时挂两种效果，最省料的两件是<b>奇美拉的尾巴</b>（毒 20 ＋ 麻痹 20，还带攻＋9／魔攻＋8／筋力＋4／知力＋8）和<b>锤子的碎片</b>（气绝 5 ＋ 硬直 3）。想一次挂一大片，只有<b>会唱歌的小瓶子</b>一件——七种状态全带，代价是防 −10。</div>
    <div class="note">「数值」与「触发率」是原文并排给的两个数，<b>原文没说两者怎么换算</b>。拿同一效果横着比就能看出分母不统一：麻痹（20）写 7.8%（约等于 ÷255），麻痹（5）写 3.9%（约等于 ÷128），气绝（2）写 2%（÷99 才勉强靠近）。所以<b>别拿数值直接折算概率</b>，那是本站算不出来、原文也没交代的东西。</div>

    <h2 class="h2">四、和站内那张素材表对着看</h2>
    <p class="p">站内的<a href="#/page/material">素材与矿石</a>页有一张同样题材的表（解包数据，${(typeof MAT_RF3 !== 'undefined') ? MAT_RF3.length : 90} 件，带买价卖价与入手地点）。两边能对上名字的有 <b>${MAP.length} 行</b>，对不上的 ${unmapped.length} 件是「${unmapped.map(esc).join('、')}」——站内没有这个写法（见下一节的推测，<b>只写推测</b>）。</p>

    <h3 class="h3">难度：${dSame.length} 一致、${dDiffU.length} 不一致</h3>
    <p class="p">站内那 ${dCmp.length} 行给了强化难度，其中 ${dSame.length} 行与源<b>完全相同</b>。不同的 ${dDiffU.length} 件（源里共 ${dDiff.length} 行，有 ${dDiff.length - dDiffU.length} 行是分节重抄）全部列在下面——两套数都摆着，<b>本站不判定谁对</b>：</p>
    ${tbl(['源里写作', '站内写作', '源：难度', '站内：难度'], dDiffU.map(r => [
        esc(r[0]), esc(r[4]), '<b>' + r[1] + '</b>', r[5]
    ]), { leftFirst: true, cls: 'rf3mat', colw: ['6.4rem', '6.4rem', '4.2rem', '4.6rem'] })}

    <h3 class="h3">加点：${mSame.length} 一致、${mDiffU.length} 不一致</h3>
    <p class="p">把七项加成逐项比（一边没写的按 0 算），<b>${mSame.length} 行完全一致</b>。剩下的 ${mDiffU.length} 件里，多数是「源写这一项、站内写另一项」，不是数值差：</p>
    ${tbl(['源里写作', '站内写作', '源：加成', '站内：加成'], mDiffU.map(r => [
        esc(r[0]), esc(r[4]), modStr(r[3]), modStr(r[6].filter(m => m[1] !== 0))
    ]), { leftFirst: true, left: [2, 3], cls: 'rf3mat', colw: ['6.4rem', '6.4rem', 'auto', 'auto'] })}
    <div class="note"><b>看这几行的规律，别急着说谁抄错：</b>「上质的毛皮」源写防 +4、站内写在攻列；「鸟之羽」源写魔防 +6、站内写在防列；「狮子的红毛」「究极的胸毛」源写魔防为负、站内写在魔攻列。三组的共同点是<b>数值没差、只是落在不同的属性列上</b>——这更像是两份资料的列定义不一致（或者其中一边录入时错列），<b>不是谁算错了</b>。本站两套都留着，不合并。</div>

    <h3 class="h3">名字写法：${nmDiffU.length} 件两边叫法不同</h3>
    <p class="p">表里一律用源里的写法。想回站内查这件料的买价、卖价、入手地点，按右边那个名字搜：</p>
    ${tbl(['源里写作', '站内写作'], nmDiffU.map(r => [esc(r[0]), esc(r[4])]), {
        leftFirst: true, cls: 'rf3mat', colw: ['8rem', '8rem']
    })}

    <h2 class="h2">五、照录不改的地方</h2>
    <ul class="ul">
        <li class="li"><b>「京护肩」站内没有：</b>源里这一行与「维京护肩」那一行<b>除了名字，其余完全相同</b>（暴击抗性 6／气绝抗性 8／吹飞抗性 5、防 +5、难度 62）。像是「维京护肩」漏了一个字，但<b>这只是推测</b>，本页不合并、也不改名。</li>
        <li class="li"><b>排版粘连照录：</b>「维京护肩 暴击抗性（6）4.7%气&nbsp;&nbsp;绝抗性（8）8%」——原文把「气绝抗性」拆成「气」＋两个空格＋「绝抗性」，上一项的百分号与下一项的标签之间又没空格。本页按两条抗性解析，原文长什么样记在这里。</li>
        <li class="li"><b>百分号写成 &amp;：</b>「恶魔之血 吸血（12）4.7&amp;」。照录，不改写成 %。</li>
        <li class="li"><b>同一行两个魔防：</b>「狮子红毛 攻+13 防+2 <b>魔防-2 魔防-6</b>」——站内对应的「狮子的红毛」写的是「魔攻-2、魔防-6」，也就是前一个大概本来是魔攻，但源里写的是魔防。照录。</li>
        <li class="li"><b>「气绝耐性」与「气绝抗性」并存：</b>别处一律写「抗性」，只有「龙骨 气绝耐性（-6）-4.7%」写成「耐性」。照录。</li>
        <li class="li"><b>同一件料重复出现：</b>「会唱歌的小瓶子」5 行、「蝎子的尾巴」「锤子碎片」「豪迈胸毛」「龟壳」各 2 行，都是分节重抄。其中「即死」那一节的行里，「即死（2）0.8%」写了<b>两遍</b>（首尾各一次）。照录，不删重复。</li>
        <li class="li"><b>没有法杖：</b>这份源只讲素材强化，<b>法杖的强化规则一个字都没有</b>，本页也就不写。</li>
        <li class="li"><b>原文没给的，本页也没有：</b>各效果的<b>持续时间</b>、抗性叠到 128 之后是不是免疫、同一效果多件料叠加怎么算——都没写。</li>
    </ul>

    <p class="p">要按强度反查每把武器／防具该怎么配料，去<a href="#/page/gear">装备打造</a>页；要查某件素材在哪打，去<a href="#/page/material">素材与矿石</a>页。</p>
`;
}

function rfoCraftHtml() {
    const M = (typeof RFO_MISC !== 'undefined') ? RFO_MISC : null;
    const C = M && M.craft;
    if (!C || !C.levels.length) return '';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lv = C.levels;

    let out = `
            <h2 class="h2">海洋的合成难度：看「物品等级 − 技能等级」</h2>
            <p class="p">这一作的成败不看运气条怎么按，而是先看一个差值：<b>要做的物品等级，减去你对应的技能等级</b>。差值落在哪一档，就决定了这一步是「根本做不了」还是「几乎必成」——</p>
            ${tbl(['差值（物品等级 − 技能等级）', '原表写的难度'],
        lv.map(l => ['<b>' + esc(l.cond) + '</b>', esc(l.d)]),
        { leftFirst: true, left: [1], cls: 'rfosys', colw: ['12rem', ''] })}
            <div class="key">合成时把光标停在<b>合成条的蓝色段</b>即可成功；连续失败时浮标会越来越慢，等于给你留出反应时间。除料理会出「失败作」外，其他生产失败<b>不损材料</b>，所以技能等级够了就可以放心试。</div>
            <div class="note"><b>原表这一段区间不闭合，本站照录不补</b>：第Ⅵ档写「&lt;0&amp;≤−10」，字面是「≤−10」，可这样 0 到 −10 之间就没有归属；按第Ⅳ档「≤5&amp;&gt;0」的写法类推，第Ⅵ档本来应该是「&lt;0&amp;&gt;−10」。两边并存，读者自己判断。</div>

            <h3 class="h3">带 ☆ 的优质品</h3>
            <p class="p">成品有一定概率变成带 ☆ 的「优质品」，售价与能力值都更高，高级装备能差出几十点。原表说出现率由<b>难度</b>与<b>原材料里的优质品个数</b>共同决定，并明说这两组数是<b>网上资料、未经验证</b>，只作参考：</p>
            <ul class="ul">
                ${C.starA.map(s => `<li class="li">${esc(s)}</li>`).join('')}
                ${C.starB.map(s => `<li class="li">${esc(s)}</li>`).join('')}
            </ul>
            <div class="note">这两组数字本站不做任何推演：原表自己标了「未经验证」，而且第一组只给了 6 个难度对应的概率，没说两者怎么叠加。真要靠优质品做装备，实际做法还是<b>把技能等级刷高、用带 ☆ 的素材</b>，比记概率可靠。</div>`;

    /* ---- 锻造配方表。单一来源 crimsontear 的 recipes/forge；各类武器原表列数不同，按原表出表。 ---- */
    const D = (typeof RFO_FORGE !== 'undefined') ? RFO_FORGE : null;
    if (D && D.families && D.families.length) {
        const E2 = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const famRows = D.families.reduce((a, f) => a + f.rows.length, 0);
        out += '<h2 class="h2">锻造配方表：' + D.families.length + ' 类，' + famRows + ' 条</h2>';
        out += '<p class="p">下面每张表的<b>表头长得不一样，不是漏列</b>：原攻略页里各类武器的列数本来就不同——斧、锤、双手剑、镰刀有「攻击·防御·魔攻·魔防」四列，双剑、武士刀、长枪只有「攻击·魔防」，法杖是「攻击·魔攻·魔防」，魔杖只有「魔攻·魔防」，钓竿则连战斗属性和效果列都没有。缺的列本站<b>不补 0</b>，免得把「原表没写」看成「数值是 0」。</p>';
        out += stat([['武器大类', D.families.length + ' 类'], ['配方条目', famRows + ' 条']]);
        D.families.forEach(f => {
            out += '<h3 class="h3">' + E2(f.name) + '（' + f.rows.length + ' 条）</h3>';
            out += tbl(f.cols.map(E2), f.rows.map(r => r.map(E2)), { cls: 'rf1craft' });
        });
        out += '<div class="note"><b>「锻造Lv」是原表的 Skill 列</b>——做出这件东西所要求的锻造技能等级，不是物品等级。<b>「配方书」</b>是原表最后一列，本站只剥掉与类目重复的前缀（原表写「Axes Lv 1」，这里记「Lv1」），LvS 即最高级配方书。<b>「价值」是原表的 Value 列（物品价值），不是商店买价</b>，本页不据此换算任何买卖价；商店实际卖多少，看<a href="#/page/shop">商店</a>页。</div>';
        if (D.warns && D.warns.length) {
            out += '<div class="note"><b>录表时遇到的矛盾与异常，一律照录、不作裁决：</b><ul class="ul">';
            D.warns.forEach(w => { out += '<li class="li">' + E2(w) + '</li>'; });
            out += '</ul></div>';
        }
        out += '<div class="note">源：<b>' + E2(D.src) + '</b>。' + E2(D.note) + '</div>';
    }
    return out;
}

/* ============================================================
   符文工房 海洋（RFO）的四个物品页：装备／农具／素材／料理
   数据在 js/rfoitems.js（RFO_ITEMS，由 _build_rfo_items.py 从 biligame wikitext 生成）。
   源站把这几类拆成四张独立页、各页列也不统一，所以四页各自出表、各自筛选，
   不拼成一张「物品总表」——拼起来必然有空列，空列等于把「没写」当成「没有」。
   页内所有计数与排名都是现算的，不写死数字。
   ============================================================ */
function rfoEsc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* 把某一类的名字按原表顺序串成升级链：同名相邻两条合成「名字（2 条）」 */
function rfoChain(rows, cat) {
    const names = rows.filter(r => r[1][0] === cat).map(r => r[1][1]);
    const out = [];
    names.forEach(n => {
        const last = out[out.length - 1];
        if (last && last[0] === n) last[1]++;
        else out.push([n, 1]);
    });
    return out.map(x => rfoEsc(x[0]) + (x[1] > 1 ? '（' + x[1] + ' 条）' : '')).join('→');
}

function rfoArmorHtml() {
    const D = (typeof RFO_ITEMS !== 'undefined') ? RFO_ITEMS.armor : null;
    if (!D || !D.rows.length) return '';
    const E = rfoEsc;
    const n = D.n;
    const rows = D.rows.map(r => r[1]);
    const cn = k => rows.filter(r => r[0] === k).length;
    const withEff = rows.filter(r => r[7] !== '—' || r[8] !== '—').length;
    const withPrice = rows.filter(r => r[9] !== '—').length;
    const atkInHand = rows.filter(r => r[0] === '手部' && r[3] !== '—').length;
    let out = '';
    out += '<h2 class="h2">海洋的装备：源站只整理了四个部位</h2>';
    out += '<p class="p">这一页在源站叫「饰品数据」，里面四类——' +
        D.cats.map(c => E(c) + ' ' + cn(c)).join('、') + '——合起来 <b>' + n + ' 件</b>，' +
        '是除武器之外能穿的全部东西。<b>本作没有单独的铠甲／盾／鞋表</b>，源站也没有另开一页，所以这里不补一张出来：' +
        '补出来的表只能靠猜，猜错比空着更坏。</p>';
    out += tbl(['部位', '件数', '这一栏装什么', '数值在哪'], [
        ['头部', String(cn('头部')), '帽子、头巾、眼镜一类', '防御与魔防为主，攻击几乎不出现'],
        ['颈部', String(cn('颈部')), '围巾、项链', '防御、魔防与最大 HP'],
        ['身体', String(cn('身体')), '斗篷、腰带、徽章', '元素抗性集中在这一栏'],
        ['手部', String(cn('手部')), '戒指、手环、手套', '攻击几乎全在这一栏（' + atkInHand + ' 件带攻击）'],
    ], { leftFirst: true, cls: 'txt', colw: ['4rem', '4rem', '11rem'] });
    out += stat([['装备', n + ' 件'], ['部位', D.cats.length + ' 个'],
        ['带特效', withEff + ' 件'], ['源站给了买价', withPrice + ' 件']]);
    out += '<div class="key">这一作的装备思路和后面几作不同：<b>数值差距主要来自「装饰Lv」与特效，而不是部位</b>。' +
        '同一件东西的高质版本会换一条特效，所以表里「普通效果／高质效果」两栏要一起看——' +
        '高质那条往往才是你真正想要的东西。</div>';
    out += '<div class="note">源站《毕业装备》页给的极限防御组合是超级毛茸茸围腰＋超级毛茸茸围巾＋超级摩可摩可的帽子＋钻石戒指，' +
        '四件分别落在身体、颈部、头部、手部，正好一件一位，<b>全在这张表里</b>。也就是说本作的「毕业装」不是换一整套，而是把四个部位各换成那一栏的最优件。</div>';
    out += '<h2 class="h2">全表（' + n + ' 件）</h2>';
    out += '<p class="p">按源表顺序，列名沿用源站：<b>装饰Lv</b> 是源站的「装饰技能」，即做这件东西需要的技能等级；' +
        '<b>总材料</b> 照录原文，日文原名不译。搜名称、部位、效果或材料都能筛。</p>';
    out += ftableOwn(D.cols.map(E), D.colw, D.rows, { ph: '输入名称、部位、效果或材料筛选', left: [0, 1] });
    out += '<div class="note">源：<b>' + E(D.src || '') + '</b>。<b>只记商店买价、不记卖价</b>；' +
        '源站记为「—」的格子照录为「—」，意思是「源站没写」，不是 0，也不是免费。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/gear"><div class="jp-t">装备打造</div><div class="jp-s">强化怎么叠，星号怎么来</div></a>' +
        '<a href="#/page/weapon"><div class="jp-t">武器</div><div class="jp-s">这一作十类武器与面板</div></a>' +
        '<a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">配方书与技能等级</div></a>' +
        '</div>';
    return out;
}

function rfoToolHtml() {
    const D = (typeof RFO_ITEMS !== 'undefined') ? RFO_ITEMS.tool : null;
    if (!D || !D.rows.length) return '';
    const E = rfoEsc;
    const n = D.n;
    const cn = k => D.rows.filter(r => r[1][0] === k).length;
    let out = '';
    out += '<h2 class="h2">海洋的农具：五类 ' + n + ' 件，一条链一级</h2>';
    out += '<p class="p">这一作的农具是<b>锻造出来的</b>，不是买来的：' +
        D.cats.map(c => E(c) + ' ' + cn(c) + ' 件').join('、') + '。' +
        '名字会重复——金锤两条、砍柴用斧两条、铁镰刀两条——<b>这不是抄重</b>：源站把「用上一级农具＋材料再锻一次」的每一级都单列一行，' +
        '同名两行的差别在材料和买价上，升级路线因此是断在表里的、不是一条直线。</p>';
    out += stat([['农具', n + ' 件'], ['类别', D.cats.length + ' 类'],
        ['带消耗RP', D.rows.filter(r => r[1][10] !== '—').length + ' 件'],
        ['带高质特效', D.rows.filter(r => r[1][9] !== '—').length + ' 件']]);
    out += '<h3 class="h3">逐级的升级链</h3>';
    out += '<p class="p">下面按原表顺序把同名相邻项合成一条，括号里的「2 条」表示这一级源表列了两种做法。' +
        '<b>链是按表里的行序排的，不是按数值排的</b>——源表本身就是升级顺序。</p>';
    out += tbl(['类别', '件数', '链路（按原表顺序）'],
        D.cats.map(c => [E(c), String(cn(c)), rfoChain(D.rows, c)]),
        { leftFirst: true, cls: 'txt', colw: ['6rem', '4rem'] });
    out += '<h2 class="h2">全表（' + n + ' 件）</h2>';
    out += '<p class="p"><b>锻造Lv</b> 是做这一级要的技能等级，<b>消耗RP</b> 是挥一次要的 RP——' +
        '本作的农具要耗 RP，这是它和后面几作最大的手感差别：RP 见底连地都种不了，' +
        '所以「消耗RP」这一列比攻击力更值得看。</p>';
    out += ftableOwn(D.cols.map(E), D.colw, D.rows, { ph: '输入名称、类别、特效或材料筛选', left: [0, 1] });
    out += '<div class="note"><b>镰刀、钓竿、锤、斧在锻造页里也当成武器类收录</b>（那一页的「镰刀」「钓竿」两族就是这几件），' +
        '本页是农具视角：多了「消耗RP」与农具专属的高质特效，并按「农具锤子／农具斧／精灵杖／镰刀／钓竿」分类。' +
        '<b>精灵杖只在农具表里出现</b>，锻造页没有这一类。</div>';
    out += '<div class="note">源：<b>' + E(D.src || '') + '</b>。只记商店买价、不记卖价；「—」照录，意思是源站没写。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">农具的配方书与技能门槛</div></a>' +
        '<a href="#/page/farm"><div class="jp-t">种田</div><div class="jp-s">蓄力范围与田地管理</div></a>' +
        '<a href="#/page/fish"><div class="jp-t">钓鱼</div><div class="jp-s">钓竿等级与鱼种</div></a>' +
        '</div>';
    return out;
}

function rfoMatHtml() {
    const D = (typeof RFO_ITEMS !== 'undefined') ? RFO_ITEMS.mat : null;
    if (!D || !D.rows.length) return '';
    const E = rfoEsc;
    const n = D.n;
    const rows = D.rows.map(r => r[1]);
    const has = i => rows.filter(r => r[i] !== '—').length;
    let out = '';
    out += '<h2 class="h2">海洋的素材：四条来路，全写在表里</h2>';
    out += '<p class="p">这一作的材料共 <b>' + n + ' 件</b>，源站对每一件都标了七件事：买价、哪家店卖、宠物能不能生产、' +
        '哪只怪掉、那只怪在哪个地图、以及哪个地图的宝箱罐子开得出。<b>没有「说不清从哪来」的格子</b>——' +
        '这在本系列里是少见的完整。</p>';
    out += stat([['材料', n + ' 件'], ['能直接买', has(1) + ' 件'], ['魔物掉落', has(4) + ' 件'],
        ['宠物生产', has(3) + ' 件'], ['宝箱·罐子', has(6) + ' 件']]);
    out += tbl(['来源', '在这张表里怎么读'], [
        ['店铺', '有店名的就是能直接买，买价一栏才有数字；买价是「—」的就是买不到'],
        ['宠物生产', '让魔物在牧场干活产出，不花买价，但要先养对怪'],
        ['魔物掉落', '打哪只怪会掉；「魔物在哪」一栏是那只怪出现的地图'],
        ['宝箱·罐子', '地图坐标照录源站写法（如「古代石像G-7」），不是本页换算的'],
    ], { leftFirst: true, cls: 'txt', colw: ['5rem'] });
    out += '<div class="key">缺材料时的搜索顺序：<b>先看能不能买，再看宠物生产，最后才去打怪</b>。' +
        '同一件材料往往三条路都通，打怪是最慢的一条——除非你要的正是那只怪的别的掉落。</div>';
    out += '<h2 class="h2">全表（' + n + ' 件）</h2>';
    out += '<p class="p">「魔物在哪」和「宝箱·罐子」两栏很长，因为源站把每张图的每个点位都列了出来，' +
        '本页<b>不合并、不去重</b>，照录。列多放不下时可左右滑动。</p>';
    out += ftableOwn(D.cols.map(E), D.colw, D.rows, { ph: '输入材料名、店铺、掉落魔物或地图筛选' });
    out += '<div class="note">源：<b>' + E(D.src || '') + '</b>。只记商店买价、不记卖价；' +
        '地图名与坐标照录源站，源站没译的日文原名也照录。源站表头的「地图宝箱、罐子」在本页记作「宝箱·罐子」。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/crop"><div class="jp-t">作物与种子</div><div class="jp-s">作物也是材料的一部分</div></a>' +
        '<a href="#/page/mbook"><div class="jp-t">魔物图鉴</div><div class="jp-s">掉落按怪查，这一页按材料查</div></a>' +
        '<a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">这些材料都喂给谁</div></a>' +
        '</div>';
    return out;
}

/* 料理页不抄「料理配方」页的 181 道菜，改做倒排：食材 → 用到它的菜。
   数据仍是同一份 RFO_COOK（js/rfocook.js），没有第二套来源。 */
function rfoFoodHtml() {
    const C = (typeof RFO_COOK !== 'undefined') ? RFO_COOK : [];
    if (!C.length) return '';
    const E = rfoEsc;
    const idx = {};
    C.forEach(r => {
        (r[4] || []).forEach(m => {
            if (!m) return;
            const a = idx[m] = idx[m] || [];
            /* 源表里有同名条目（沙丁鱼串出现三次），这里按菜名去重，不然「前四道」会串成同一个名字 */
            if (a.indexOf(r[1]) < 0) a.push(r[1]);
        });
    });
    const names = Object.keys(idx).sort((a, b) => idx[b].length - idx[a].length || (a < b ? -1 : 1));
    const multi = names.filter(m => idx[m].length >= 3);
    const hp = C.slice().sort((a, b) => (b[6] || 0) - (a[6] || 0)).slice(0, 8);
    const rp = C.slice().sort((a, b) => (b[7] || 0) - (a[7] || 0)).slice(0, 8);
    let out = '';
    out += '<h2 class="h2">食材：哪样东西用得最多</h2>';
    out += '<p class="p">' + C.length + ' 道料理已经按厨具列在<a href="#/page/cook">料理配方</a>页，本页不再抄一遍——' +
        '这一页回答另一个问题：<b>食材都用到哪去了</b>。做法是把每道菜的材料栏拆开、按材料归并，' +
        '就得到下面这张倒排表。用得越多，越值得囤。</p>';
    out += stat([['料理', C.length + ' 道'], ['不同食材', names.length + ' 种'],
        ['出现在 3 道以上', multi.length + ' 种'],
        ['最常用', names[0] ? names[0] + '（' + idx[names[0]].length + ' 道）' : '—']]);
    out += '<h3 class="h3">常用食材（出现在 3 道以上）</h3>';
    out += '<p class="p">按出现次数降序。<b>后面一列只列前四道菜</b>，不是全部——全列出来这一页就没法看了，' +
        '要查某道菜用什么，去料理配方页。源表里有同名条目（同一道菜被列了三次），本页按菜名去重后再计数——' +
        '所以「道数」是<b>用到它的不同料理数</b>，不是源表的行数。</p>';
    out += tbl(['食材', '道数', '用到的料理（前四道）'],
        multi.map(m => [E(m), String(idx[m].length), idx[m].slice(0, 4).map(E).join('、')]),
        { leftFirst: true, cls: 'txt', colw: ['7rem', '4rem'] });
    out += '<h3 class="h3">回复最高的几道</h3>';
    out += '<p class="p">HP 与 RP 分开排，因为<b>两者在迷宫里的稀缺程度不一样</b>：HP 可以靠药草硬顶，' +
        'RP 见底就只能回城。所以 RP 榜比 HP 榜更实用。</p>';
    out += tbl(['HP 最高', 'HP', 'RP 最高', 'RP'],
        hp.map((r, i) => [E(r[1]), String(r[6] == null ? '—' : r[6]),
            rp[i] ? E(rp[i][1]) : '—', rp[i] ? String(rp[i][7] == null ? '—' : rp[i][7]) : '—']),
        { leftFirst: true, cls: 'txt', colw: ['9rem', '4rem', '9rem', '4rem'] });
    out += '<div class="note">这张表是<b>现算的</b>：数据来自 <code>js/rfocook.js</code> 的 <code>RFO_COOK</code>（' +
        C.length + ' 条，与料理配方页同源），没有第二套食材数据。材料名照录源表——同一样东西在源站有两种写法时' +
        '（译名与日文原名并存）这里会分成两行，本页不做合并，也不猜它们是不是同一样。</div>';
    out += '<div class="jump">' +
        '<a href="#/page/cook"><div class="jp-t">料理配方</div><div class="jp-s">' + C.length + ' 道菜的做法与配方书</div></a>' +
        '<a href="#/page/crop"><div class="jp-t">作物与种子</div><div class="jp-s">种出来的东西都喂给谁</div></a>' +
        '<a href="#/page/fish"><div class="jp-t">钓鱼</div><div class="jp-s">鱼也是主要食材之一</div></a>' +
        '<a href="#/page/potion"><div class="jp-t">药品与香料</div><div class="jp-s">RP 不够时靠这个补</div></a>' +
        '</div>';
    return out;
}

/* 符文工房 海洋（RFO）委托任务：单一来源《符文工厂海洋（最强攻略）》xls「任务」工作表。
   原表是 18 位委托人各占一列、16 个任务批上下堆叠的块状表，本站只做「摊平成一任务一记录」，
   任务名与报酬里的物品名保留攻略本的日文原文（攻略本自己没给译名，本页不代为翻译），
   发生条件与任务内容里的「？」「???」也是原表自带的，一律照录。 */
/* 符文工房 2 的委托任务：两套来源拼起来的一张表。
   主表＝终有依天《【RF2】【一周目】任务大全》（贴吧，118 条，带触发条件与奖励，只写一周目）；
   补表＝安打《任务、居民、怪物攻略》（TGBUS，123 条，奖励混在内容里，含二代）。
   两源大面积重叠，所以只补主表没覆盖的 6 条，不做同名合并——译名两套、口径两套，合并不了就照录。 */
function requestRf1Html() {
    const Q = (typeof RF1_REQUEST !== 'undefined') ? RF1_REQUEST : null;
    if (!Q || !Q.items || !Q.items.length) return '';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const nItem = Q.items.length;
    const nStep = Q.items.reduce((a, i) => a + i.steps.length, 0);
    /* 提到「求婚」的支线有几条：现算，不写死 */
    const nMar = Q.items.filter(i => i.steps.some(s => /求婚/.test(s))).length;
    /* 不按「1、2、3」开头写的行（注意点、续行）有几行 */
    const nRaw = Q.items.reduce((a, i) => a + i.steps.filter(s => !/^\d+[、.]/.test(s)).length, 0);

    return `
    <div class="note">源：<b>${esc(Q.src)}</b>。${esc(Q.note)}</div>
    ${stat([
        ['支线', nItem + ' 条'],
        ['分步流程', nStep + ' 步'],
        ['牵到求婚道具', nMar + ' 条'],
        ['非编号行', nRaw + ' 行'],
    ])}

    <h2 class="h2">一、一代没有委托板，任务都藏在支线里</h2>
    <p class="p">RF1 和后面几作不一样：<b>没有委托箱、没有任务板、也没有「接一条做一条」的委托列表</b>。这一作能给玩家的额外目标，是<b>支线剧情</b>——多半由某个村民的一句话起头，按顺序跑几个地点、交几样东西，最后给一件道具，其中好几件直接就是<b>求婚道具</b>。</p>
    ${Q.friendly ? `<div class="key"><b>先记住这条机制：</b>${esc(Q.friendly)}　也就是说好感度是<b>进支线的前置</b>，不是支线的奖励——人没混熟，有些门根本不会对你打开。</div>` : ''}
    <p class="p">所以看这一页的方式和别的作不同：不是「我现在能接什么」，而是<b>「我知道这件事之后该按什么顺序跑」</b>。下面每条都按源站的分步顺序照录，编号是源站自己的。</p>

    <h2 class="h2">二、${nItem} 条支线，逐条分步</h2>
    <p class="p">步骤前面的「1、2、3」是源站写的，<b>本站没有重新编号</b>——所以你会看到个别行不带号（那是源站的「注意点」或上一行的续写），这类共 ${nRaw} 行，原样留在它该在的位置上。</p>
    ${Q.items.map(it => `<h3 class="h3">${esc(it.t)}　${it.steps.length} 步</h3>
    <div style="margin:.2rem 0 .9rem 0">
    ${it.steps.map(s => `<p class="p" style="margin:.18rem 0 .18rem 1rem;padding-left:.9rem;border-left:3px solid var(--line,#ddd)">${esc(s)}</p>`).join('\n    ')}
    </div>`).join('\n')}

    <h2 class="h2">三、本站照录、不动手的几处</h2>
    <div class="note"><b>标点与口语一律不改：</b>原文里有「在居民中打听，。」（逗号后面直接跟句号）、「得知圣杯被扔在了カジミール遺跡,」（半角逗号）、「1、…」「其它、…」混用等写法，<b>全部照录</b>。本站不改攻略作者的标点习惯。</div>
    <div class="note"><b>地名与人名保留原文写法：</b><code>カジミール遺跡</code>、<code>トロス洞窟</code> 这类没译的日文原名照抄不译——源站同一段里既有中文译名也有日文原名，本站不替它统一，也不猜对应关系。</div>
    <div class="note"><b>「只能通关前完成」这类限制照录在步骤位置：</b>它不是一句概括，而是<b>那条支线的第一条</b>。所以「被丢弃的圣杯」的第 1 行没有编号——源站就是那么排的，本站没有把它提出来单列成「注意事项」。</div>
    <div class="note"><b>这一页不追求「全」：</b>源站只收了这 ${nItem} 条。RF1 还有大量村民对话事件、节日事件、以及每条洞窟的通行证条件，那些不在本页，<b>本站也不拿别处资料硬凑成一张「全任务表」</b>——凑出来的表看着完整，错一条就会把人带沟里。</div>

    <div class="jump">
        <a href="#/page/love"><div class="jp-t">恋爱与结婚</div><div class="jp-s">求婚道具与爱情度门槛</div></a>
        <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">先把好感度刷上去</div></a>
        <a href="#/page/boss"><div class="jp-t">BOSS 战</div><div class="jp-s">支线里要打的那几只</div></a>
        <a href="#/page/request"><div class="jp-t">委托任务</div><div class="jp-s">其他作品的委托结构</div></a>
    </div>
    <div class="note">数据文件 <code>js/rf1request.js</code>（<code>RF1_REQUEST</code>），由 <code>_build_rf1_request.py</code> 从源站 wikitext 按章节解析生成（8 条／35 步内嵌在脚本里，可离线复现）。脚本只拆章节、去 wiki 链接标记，不改写、不合并、不补全。</div>`;
}

function requestRf5Html() {
    const Q = (typeof RF5_REQUEST !== 'undefined') ? RF5_REQUEST : null;
    if (!Q || !Q.rows || !Q.rows.length) return '';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const Lf = s => '<span style="display:block;text-align:left;width:100%">' + esc(s) + '</span>';
    const cell = v => (v === null || v === undefined || v === '') ? dash : Lf(v);

    const nAll = Q.rows.length;
    /* 下面几个数全从行数据现算，不写死 */
    const nChain = Q.rows.filter(r => /完成/.test(r[2] || '')).length;
    const nShop = Q.rows.filter(r => /商店追加/.test(r[3] || '')).length;
    const nFav = Q.rows.filter(r => /好感度|友好度|爱情度/.test(r[2] || '')).length;
    const nEmptyR = Q.rows.filter(r => !r[3]).length;
    const nRnd = Q.rows.filter(r => /随机/.test(r[3] || '')).length;
    const seqOk = Q.rows.every((r, i) => String(r[0]) === String(i + 1));

    return `
    <div class="note">源：<b>${esc(Q.src)}</b>。${esc(Q.note)}</div>
    ${stat([
        ['委托条目', nAll + ' 条'],
        ['解锁靠「完成上一条」', nChain + ' 条'],
        ['报酬带「商店追加」', nShop + ' 条'],
        ['解锁卡好感度', nFav + ' 条'],
    ])}

    <h2 class="h2">一、五代是一根主线串到底，不是一堆散任务</h2>
    <p class="p">把「解锁」那一列当成线索看，形状就很清楚了：<b>${nAll} 条里有 ${nChain} 条的前置就是「某某委托完成」</b>。也就是说这张表基本是一条长链——不做前面的，后面的根本不出现。其中 <b>${nShop} 条</b>的报酬是「商店追加」，即做完之后杂货店／花店才开卖新品种；<b>${nFav} 条</b>把门槛卡在好感度上。</p>
    <div class="key">新手最容易卡住的地方在这儿：<b>委托不是「有事没事去刷一刷」</b>，而是被链条锁着。屏幕上没有新委托，通常不是 bug，是链上某一条没交。报酬写「商店追加」的那几条尤其别跳过——它们是种子和材料能不能买到的开关。</div>

    <h2 class="h2">二、${nAll} 条委托全表</h2>
    <p class="p">序号是源站自己的编号，${seqOk ? '<b>1 到 ' + nAll + ' 连续、无重复</b>' : '存在跳号或重复'}。中文名与报酬里括号内的日文原名一并保留（源站就是这么写的），方便对着游戏里的日文界面找。</p>
    ${tbl(Q.cols.map(esc), Q.rows.map(r => r.map(cell)), { cls: 'rf1craft', left: [1, 2, 3], colw: ['4.6rem', '15rem', 'auto', 'auto'] })}

    <h2 class="h2">三、本站照录、不动手的几处</h2>
    <div class="note"><b>${nEmptyR} 条报酬是空的：</b>页面上显示「—」。源站那两格写的就是占位符，不是本站漏抄——<b>也正因为查不到报酬，本站不去别处搬一个数字填进来</b>。</div>
    <div class="note"><b>${nRnd} 条报酬写「随机」：</b>照录。遇到这种就别指望刷指定道具，它给的是随机池。</div>
    <div class="note"><b>解锁条件里带「后」「以上」的写法一律照录：</b>「在床上休息后去旅馆后」这种连着两个「后」的句子是源站原话，本站不改。条件是「完成某某」的，指的就是同表里那一条，按序号找过去即可。</div>
    <div class="note"><b>本页只有委托表：</b>源站这一页没有按入口（布告栏／侦探事务所／警署）分类，也没有单列「通缉魔物」——本站不替它补一层分类，保持原表一层平铺。</div>

    <div class="jump">
        <a href="#/page/shop"><div class="jp-t">商店与设施</div><div class="jp-s">「商店追加」到底追加了什么</div></a>
        <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">种子解锁与等级作物</div></a>
        <a href="#/page/craft"><div class="jp-t">锻造与药学</div><div class="jp-s">委托给的配方面包用来做什么</div></a>
        <a href="#/page/request"><div class="jp-t">委托任务</div><div class="jp-s">其他作品的委托结构</div></a>
    </div>
    <div class="note">数据文件 <code>js/rf5request.js</code>（<code>RF5_REQUEST</code>），由 <code>_build_rf5_request.py</code> 从源站 wikitext 表解析生成（173 条内嵌在脚本里，可离线复现）。脚本只拆字段、去 wiki 链接与换行标记、把空的「-」统一成「—」。</div>`;
}

function requestRf3Html() {
    const Q = (typeof RF3_REQUEST !== 'undefined') ? RF3_REQUEST : null;
    if (!Q || !Q.groups || !Q.groups.length) return '';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const Lf = s => '<span style="display:block;text-align:left;width:100%">' + esc(s) + '</span>';
    const cell = v => (v === null || v === undefined || v === '') ? dash : Lf(v);

    const nAll = Q.groups.reduce((a, g) => a + g.rows.length, 0);
    /* 村民 × 渠道统计与最高好感：全部从行数据现算，不写死 */
    const P = {};
    Q.groups.forEach(g => g.rows.forEach(r => {
        const parts = String(r[0] || '').split('-');
        const who = parts[0] || '（未编号）', ch = parts[1] || '';
        const p = P[who] || (P[who] = { n: who, c: 0, k: {}, maxLv: 0 });
        p.c++;
        p.k[ch] = (p.k[ch] || 0) + 1;
        const m = String(r[3] || '').match(/❤(\d+)/);
        if (m) p.maxLv = Math.max(p.maxLv, +m[1]);
    }));
    const ppl = Object.keys(P).map(k => P[k]).sort((a, b) => b.c - a.c || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0));
    const chKey = ['布告栏', '邮箱', '猫头鹰'];
    /* 每类实际覆盖到多少人，也现算 */
    const gStat = Q.groups.map(g => {
        const set = {};
        g.rows.forEach(r => { set[String(r[0] || '').split('-')[0]] = 1; });
        const lv = g.rows.map(r => { const m = String(r[3] || '').match(/❤(\d+)/); return m ? +m[1] : 0; });
        return { name: g.name, n: g.rows.length, ppl: Object.keys(set).length, maxLv: Math.max.apply(null, lv.concat([0])) };
    });

    return `
    <div class="note">源：<b>${esc(Q.src)}</b>。${esc(Q.note)}</div>
    ${stat([
        ['委托条目', nAll + ' 条'],
        ['支线／惩治／简单', Q.groups.map(g => g.rows.length).join(' ／ ')],
        ['涉及村民', ppl.length + ' 位'],
        ['入线渠道', '布告栏／邮箱／猫头鹰'],
    ])}

    <h2 class="h2">一、三代没有公共委托板，任务挂在人身上</h2>
    <p class="p">RF3 的委托分三条线进来：<b>布告栏</b>（村口的板）、<b>邮箱</b>（送到家里的信）、<b>猫头鹰</b>（第三方转交）。同一个人身上往往两条线并行，所以下面的「总序号」写成 <code>希雅-布告栏-02</code> 这种形式——<b>前缀是人名，中段是入口，末尾是这条链上的第几环</b>。这个编号是源站自己的写法，本站照录。</p>
    <p class="p">按编号就能读出链条形状：<code>前置支线</code>那一列写着上一条是哪一号，<b>照着串下去就是一条完整的角色线</b>。写成两个编号的是<b>两条线并到了一条</b>（比如「希雅-邮箱-02」要同时接完「希雅-布告栏-04」和「莫妮卡-邮箱-01」）。</p>

    <h2 class="h2">二、三种委托，条数和覆盖面对不上是有原因的</h2>
    <p class="p">源表用「种类」分成三类。三类不是同一套东西，所以人数、条数都不一样——下面这几个数字全是从表里数出来的：</p>
    ${tbl(['种类', '条数', '覆盖村民', '好感度要求', '这一类的特征（从表里看得出）'], gStat.map(g => [
        '<b>' + esc(g.name) + '</b>',
        String(g.n),
        g.ppl + ' 位',
        g.maxLv ? '最高 ❤' + g.maxLv : dash,
        g.name === '支线' ? '一条链一环扣一环，多数带好感度门槛，走到最后往往触发剧情或正体暴露'
            : g.name === '【惩治委托】' ? '清一色「打败指定数量／种类的魔物」，入口多为布告栏，集中在少数几位村民身上'
            : '可反复接的杂活，报酬常写「随机」，主要用来刷素材和好感',
    ]), { leftFirst: true, left: [1, 2, 3, 4], colw: ['8rem', '5rem', '6rem', '7rem', 'auto'], cls: 'rf1craft' })}
    <div class="key">别把三类混着刷：<b>支线</b>是推进角色线的唯一办法（很多人结婚前必须走完）；<b>惩治委托</b>只认「打倒某只／某几只」，不认素材；<b>简单委托</b>给的东西大多是随机，指望它出指定道具会很难受。</div>

    <h2 class="h2">三、${ppl.length} 位村民的委托数量一览</h2>
    <p class="p">按条数从多到少排。<b>条数差异很大</b>——有的村民三十条上下，有的只有几条，这跟他在剧情里的分量有关，<b>不是本站漏收</b>。</p>
    ${tbl(['村民', '合计', '布告栏', '邮箱', '猫头鹰', '最高好感'], ppl.map(p => [
        '<b>' + esc(p.n) + '</b>',
        String(p.c),
        p.k['布告栏'] ? String(p.k['布告栏']) : dash,
        p.k['邮箱'] ? String(p.k['邮箱']) : dash,
        p.k['猫头鹰'] ? String(p.k['猫头鹰']) : dash,
        p.maxLv ? '❤' + p.maxLv : dash,
    ]), { colw: ['9rem', '4.6rem', '4.6rem', '4.6rem', '4.6rem', '5.6rem'], left: [0], cls: 'rf1craft' })}

    <h2 class="h2">四、${nAll} 条委托，按种类分三张表</h2>
    <p class="p">表头照源站：<b>总序号／中文名／前置支线／好感度／前置条件／内容／变化／报酬</b>。<code>内容</code>里的 ①②③ 是<b>步骤顺序</b>，不是并列选项；<code>变化</code>写的是「这条任务会因什么而不同」，空着就是没有变化。</p>
    ${Q.groups.map(g => `<h3 class="h3">${esc(g.name)}　${g.rows.length} 条</h3>
    ${tbl(g.cols.map(esc), g.rows.map(r => r.map(cell)), { cls: 'rf1craft', left: [0, 1, 2, 3, 4, 5, 6, 7], colw: ['9rem', '12rem', '9rem', '5.6rem', '10rem', 'auto', '9rem', '9rem'] })}`).join('\n')}

    <h2 class="h2">五、本站照录、不动手的几处</h2>
    <div class="note"><b>源表有一行是残行：</b>wikitext 里混进了一行只有一个单元格的内容，凑不成一条委托，<b>本站未收</b>——所以总数是 ${nAll} 条，不是源页行数减一那么整齐。</div>
    <div class="note"><b>「—」不是缺数据：</b>源站用单个半角减号表示「这一格没有」，本站统一显示为「—」。<code>前置支线</code>为空＝这条是链条起点；<code>好感度</code>为空＝不设门槛（多见于【简单委托】和【惩治委托】）。</div>
    <div class="note"><b>好感度那一列是源站写法：</b>写成 <code>希雅❤3</code> 这样，把人名和心数写在同一格里。本站照录，<b>没有拆成两列</b>——因为一拆就得替源站决定「空着的心数算 0 还是算无要求」，那是本站无权替它判的。</div>
    <div class="note"><b>人名译法与别页不完全一致：</b>源站这里写作「恩德珐」「泽杰」「威尔兹」「克璐璐法」，站内别处可能用别的音译。本站不跨页统一译名，各页照各自来源的写法。</div>

    <div class="jump">
        <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">委托要送的东西谁喜欢</div></a>
        <a href="#/page/love"><div class="jp-t">恋爱与结婚</div><div class="jp-s">好感度门槛与结婚线</div></a>
        <a href="#/page/request"><div class="jp-t">委托任务</div><div class="jp-s">其他作品的委托结构</div></a>
        <a href="#/page/source"><div class="jp-t">素材出处</div><div class="jp-s">报酬里的素材去哪打</div></a>
    </div>
    <div class="note">数据文件 <code>js/rf3request.js</code>（<code>RF3_REQUEST</code>），由 <code>_build_rf3_request.py</code> 从源站 wikitext 表解析生成（280 条内嵌在脚本里，可离线复现）。脚本只拆字段、去 wiki 链接与换行标记、把空的「-」统一成「—」，不改写、不合并、不补全。</div>`;
}

function requestRf4Html() {
    const Q = (typeof RF4_REQUEST !== 'undefined') ? RF4_REQUEST : null;
    if (!Q || !Q.groups || !Q.groups.length) return '';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const Lf = s => '<span style="display:block;text-align:left;width:100%">' + esc(s) + '</span>';
    const cell = v => (v === null || v === undefined || v === '') ? dash : Lf(v);

    const nAll = Q.groups.reduce((a, g) => a + g.rows.length, 0);
    const claim = 92;
    /* ??? 与空单元格数量一律现算，不写死 */
    let nQ = 0, nEmpty = 0;
    Q.groups.forEach(g => g.rows.forEach(r => r.forEach(v => {
        if (v === '???') nQ++;
        else if (v === null || v === undefined || v === '') nEmpty++;
    })));
    const nRep = (Q.repeat && Q.repeat.rows) ? Q.repeat.rows.length : 0;
    const cnt = Q.groups.map(g => g.rows.length);

    return `
    <div class="note">源：<b>${esc(Q.src)}</b>。${esc(Q.note)}</div>
    ${stat([
        ['不可重复委托', nAll + ' 条'],
        ['三张子表', cnt.join(' ／ ')],
        ['可重复委托', nRep + ' 条'],
        ['源站自述总数', claim + ' 条'],
    ])}

    <h2 class="h2">一、委托箱的规矩（原文照录）</h2>
    <p class="p">RF4 的委托不走人物链，走<b>自宅门口的委托箱</b>。它的规则源站写得很直白，照录如下：</p>
    ${Q.mech.map(m => `<p class="p" style="padding-left:1.2rem;border-left:3px solid var(--line,#ddd)">${esc(m)}</p>`).join('')}
    <div class="key">能直接用的是前两句：<b>一开始一天只能接一条</b>，做下去才放开到两三条；<b>同时只能挂着一条委托箱任务</b>——接错了要放弃，当天的次数就废了。第三句（「先把条件做完再接也算」）原文写得绕，本站照录、<b>不替它解释成确定规则</b>。还有一条容易忽略：<b>做完不可重复委托不涨好感</b>，别指望靠刷委托攻略角色。</div>

    <h2 class="h2">二、三种委托，本站只收了前两种</h2>
    <p class="p">源站把 RF4 的委托分成三类。前两类源头都在委托箱、结构清楚，本站全收；第三类没有表，本站不补。</p>
    ${tbl(['种类', '从哪来', '本站收了多少', '说明'], [
        ['<b>解锁型</b><br><span class="mon-no">Unlockable</span>', '自宅门口委托箱', '<b>' + nAll + '</b> 条', '一次性的成长任务：教你系统、解锁商店货、给配方。做完不涨好感，但会开新东西'],
        ['<b>可重复</b><br><span class="mon-no">Repeatable</span>', '委托箱，每天早上换一批', '<b>' + nRep + '</b> 类', '出货／打怪／送东西，报酬随机且多半是便宜货，主要拿来刷王子点数'],
        ['<b>个人</b><br><span class="mon-no">Personal</span>', '直接和居民对话时被拜托', '<span class="mon-no">未收</span>', '源站这里<b>只有一段说明、没有表</b>——没数据就不编，见第五节'],
    ], { leftFirst: true, left: [1, 2, 3], colw: ['8.6rem', '9rem', '6.4rem', 'auto'], cls: 'rf1craft' })}

    <h2 class="h2">三、${nAll} 条解锁型委托，按奖励去向分三张表</h2>
    <p class="p">源站不是按「委托人」分，而是<b>按报酬把你引到哪里去</b>分：给物品／配方的、放开杂货店种子的、放开花店种子的。这个分法比按人名分有用——想解锁某种种子，直接查后面两张表就行。</p>
    <p class="p">每张表里「解锁条件」那一列是<b>前置委托</b>；写 <code>Complete XXX</code> 的意思就是「把 XXX 做完」。多条前置用 <code>/</code> 并列的，原文就是这么写的。</p>
    ${Q.groups.map(g => `<h3 class="h3">${esc(g.name)}　${g.rows.length} 条</h3>
    ${tbl(g.cols.map(esc), g.rows.map(r => r.map(cell)), { cls: 'rf1craft', left: [0, 1, 2, 3, 4], colw: ['11rem', '12rem', 'auto', '12rem', '13rem'] })}`).join('\n')}

    <h2 class="h2">四、${nRep} 类可重复委托</h2>
    <p class="p">每天早上换一批，要的东西和数量都不一样。源站对它的定位说得很清楚，照录：</p>
    <p class="p" style="padding-left:1.2rem;border-left:3px solid var(--line,#ddd)">${esc(Q.repeatIntro)}</p>
    ${tbl(Q.repeat.cols.map(esc), Q.repeat.rows.map(r => r.map(cell)), { cls: 'rf1craft', left: [0, 1, 2, 3], colw: ['10rem', 'auto', '6rem', 'auto'] })}
    <div class="key">两条容易踩的：<b>「出货」类要等到早上 8:00 出货结算才算完成</b>，当天放进去当晚不会结账；<b>报酬是随机的</b>，接之前不知道给什么——所以它<u>不是</u>刷特定道具的路子，是刷王子点数用的。</div>

    <h2 class="h2">五、本站照录、不动手的几处</h2>
    <div class="note"><b>源站自己数不对：</b>正文写「共 ${claim} 条」，可三张子表逐行数下来是 <b>${nAll} 条</b>（${cnt.join(' ＋ ')}）。差 ${nAll - claim} 条，<b>无法确认是哪一条没被算进去</b>——本站既不改数字、也不删行去凑，两个数字都摆出来。</div>
    <div class="note"><b>${nQ} 处写的是 <code>???</code>：</b>那是源站没查到解锁条件（<i>Raise a skill level to 80!</i>、<i>Complete the Sharance Maze!</i>）或没写完成方式（<i>Prepare for Marriage!</i>）的地方。表里保留 <code>???</code>，<b>不拿别的攻略猜填</b>。</div>
    <div class="note"><b>${nEmpty} 个空单元格：</b>页面上显示为「—」。其中 <i>First Task!</i> 那一行源站只写了四格（首条委托没有「解锁条件」），不是本站漏抄。</div>
    <div class="note"><b>原文的错字与怪写法一律照录，不修：</b><i>Comeplete</i>（Complete 拼错）、<i>A Cheep Axe</i>（Cheap）、<i>Raise at least on skill</i>（one）、<i>Grow and orange tree</i>（a）、<i>available at the General.</i>（漏 Store）、<i>Complete Harvest a large gold Crop!</i>（别处都写 crop）、<i>Complete ship a level 5 veggie!</i>（句首小写）、<i>Dylas is such a horse.</i>（备注是句玩笑话）。同类的小写／单复数不一还有几处，都在表里原样躺着。</div>
    <div class="note"><b>没收到的那两类：</b>①<b>个人委托（Personal）</b>——源站只有一段描述，明说「通常是给一件不常见的魔物掉落」，没有逐条表，本站不编；②源站另有一张按角色排的 <i>Special Requests</i> 表，但它把「要的物品／魔物／物品」三格挤成了一串、行内互相错位，<b>抽取结果不可靠，本站宁可不收</b>，也不拿错位数据凑数。</div>

    <div class="jump">
        <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">委托要送的东西谁喜欢</div></a>
        <a href="#/page/source"><div class="jp-t">素材出处</div><div class="jp-s">委托要的素材去哪打</div></a>
        <a href="#/page/crop"><div class="jp-t">农作</div><div class="jp-s">种子解锁与等级作物</div></a>
        <a href="#/page/love"><div class="jp-t">恋爱与结婚</div><div class="jp-s">结婚前置那条委托</div></a>
    </div>
    <div class="note">数据文件 <code>js/rf4request.js</code>（<code>RF4_REQUEST</code>），由 <code>_build_rf4_request.py</code> 生成。脚本只做三件事：拆字段、去掉 wiki 的斜体星号与 <code>Note =</code> 前缀、把空单元格留空。不改写、不合并、不翻译。</div>`;
}

function requestRf2Html() {
    const Q = (typeof RF2_QUEST !== 'undefined') ? RF2_QUEST : null;
    if (!Q || !Q.quests || !Q.quests.length) return '';
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const Lf = s => '<span style="display:block;text-align:left;width:100%">' + esc(s) + '</span>';
    const JP = {};
    (Q.people || []).forEach(p => { JP[p.n] = p.j || ''; });

    const all = Q.quests, ex = Q.extra || [];
    const nAll = all.length, nEx = ex.length;
    const CAND = Q.cand || [];

    /* ---- 按委托人分组，顺序按主表里第一次出现的先后 ---- */
    const ppl = [];
    all.forEach(q => {
        let p = ppl.filter(x => x.n === q.n)[0];
        if (!p) { p = { n: q.n, j: JP[q.n] || '', list: [] }; ppl.push(p); }
        p.list.push(q);
    });
    ppl.forEach(p => {
        p.cnt = p.list.length;
        const lv = p.list.map(q => { const m = (q.c || '').match(/爱情度(\d+)/); return m ? +m[1] : 0; });
        p.maxLv = Math.max.apply(null, lv.concat([0]));
        p.cand = CAND.indexOf(p.n) >= 0;
    });
    const nPpl = ppl.length;
    /* 补表里的委托人：只算主表完全没有的那几位（玛娜是主表有的，她那一条属于「链条没写完」） */
    const exPpl = [];
    ex.forEach(q => {
        if (ppl.some(p => p.n === q.n)) return;
        if (!exPpl.some(x => x.n === q.n)) exPpl.push({ n: q.n, cnt: ex.filter(y => y.n === q.n).length });
    });

    /* ---- 计数全部现算 ---- */
    const nNone = all.filter(q => q.r === '无').length;
    const nNoR = all.filter(q => !q.r).length;
    const nHave = nAll - nNone - nNoR;
    const candRows = ppl.filter(p => p.cand);
    const candTen = candRows.filter(p => p.cnt === 10).length;
    const candNine = candRows.every(p => p.maxLv === 9);

    /* ---- 求婚道具：攻略本 vs 站内村民表，逐条比对（只比字面，不判同一物） ---- */
    const mar = Q.marriage || [];
    const marSame = mar.filter(m => m.prop && m.prop === m.item).length;
    const marDiff = mar.filter(m => m.prop && m.prop !== m.item);

    return `
    <div class="note">本页把两套来源拼成一张表。<b>主表</b>是《【RF2】【一周目】任务大全》（百度贴吧·终有依天）的 ${nAll} 条——它有「触发条件／流程／奖励」三列，但<b>只写一周目</b>；<b>补表</b>是《符文工房2 任务、居民、怪物攻略》（TGBUS 巴士速攻·安打）的 ${nEx} 条——奖励混写在内容里，却有主表完全没有的三位二代委托人。<b>两套对同一批任务各写各的</b>（译名不同、奖励记法也不同），本站不合并、不判定谁对，只在主表缺的地方用另一套补上，并标明是哪一套。</div>
    ${stat([
        ['任务条目', (nAll + nEx) + ' 条'],
        ['主表／补表', nAll + ' ／ ' + nEx],
        ['委托人', (nPpl + exPpl.filter(x => !ppl.some(p => p.n === x.n)).length) + ' 位'],
        ['候选人', CAND.length + ' 位'],
        ['写「无」奖励', nNone + ' 条'],
    ])}

    <h2 class="h2">一、这个作的委托是一个人一条链，不是一块任务板</h2>
    <p class="p">RF2 没有公共的委托板，任务挂在<b>具体的人</b>名下：接谁的、做完才能接下一个。攻略本自己的说法照录如下——</p>
    ${Q.mech.map(m => `<p class="p" style="padding-left:1.2rem;border-left:3px solid var(--line,#ddd)">${esc(m)}</p>`).join('')}
    ${tbl(['开启条件（原文四条）'], Q.cond.map(c => [esc(c)]), { leftFirst: true })}
    <div class="key"><b>七位候选人的链条长度完全一样</b>：${candRows.every(p => p.cnt === candRows[0].cnt) ? '每人 ' + candRows[0].cnt + ' 条' : candRows.map(p => p.cnt).join('、') + ' 条'}，且${candNine ? '每人的最高一档都停在<b>爱情度 9</b>' : '最高一档并不一致'}。也就是说<b>没有谁的任务更多更好追</b>，差别只在最后那件求婚道具怎么拿——见下一节。</div>

    <h2 class="h2">二、七件求婚道具，${marSame} 件和站内村民表一字不差</h2>
    <p class="p">攻略本每写到链条最后一步，会写明「给她什么就能结婚」。这七件东西，站内「村民喜好」页每人也有一个「求婚道具」栏，两边可以对着核：</p>
    ${tbl(['候选人', '求婚道具', '攻略本原话（照录）', '站内村民表'], mar.map(m => [
        '<b>' + esc(m.n) + '</b>',
        esc(m.item),
        '<span class="mon-no" style="display:block;text-align:left">' + esc(m.said) + '</span>',
        m.prop ? (m.prop === m.item ? '一致' : '<b>' + esc(m.prop) + '</b>') : dash,
    ]), { colw: ['5.4rem', '9rem', 'auto', '9rem'], left: [0, 1, 2, 3], cls: 'rf2qs' })}
    <p class="p">七件里 <b>${marSame} 件两边一字不差</b>；剩下 ${mar.length - marSame} 件各写各的：${marDiff.map(m => '<b>' + esc(m.n) + '</b>的「' + esc(m.item) + '」对站内的「' + esc(m.prop) + '」').join('、')}。<b>两种写法都照录</b>——本站不替它们统一，也不断言「婚约戒指」与「订婚戒指」是不是同一件。</p>
    <div class="note"><b>两处坑，都是原文写明的：</b>一是<b>多萝茜</b>的「祝福挂饰」不在她自己的链上，而是<b>高顿</b>那条【有要给的东西】发出来的（触发条件还写着「多罗茜所有任务完成」）；二是<b>朱丽雅</b>的「回忆戒指」要先经手<b>由绘</b>、再搭 10000G、等 3 天。只做她一个人的任务，这两件都拿不到。</div>
    <div class="note">罗萨琳德那件更绕：原文是一行夹在任务条目之间的<b>独立说明</b>，不是一条任务——${esc((Q.quotes && Q.quotes[0]) || '')}</div>

    <h2 class="h2">三、链条的形状：爱情度一级一条，一级一道坎</h2>
    <p class="p">主表给的条件写得很有规律：第一条是「剧情后」这类触发，之后一条一个「爱情度 N」，从 1 排到 9。下面这张表把七位候选人的起始条件和最高档摆在一起——<b>七个数字一样，说明流程设计是同一套</b>。</p>
    ${tbl(['候选人', '条数', '首条触发条件', '最高爱情度'], candRows.map(p => [
        '<b><a class="link" href="#/char/rf2/' + encodeURIComponent(p.n) + '">' + esc(p.n) + '</a></b>' + (p.j ? '（' + esc(p.j) + '）' : ''),
        String(p.cnt),
        Lf(p.list[0].c || '—'),
        p.maxLv ? String(p.maxLv) : dash,
    ]), { colw: ['10.6rem', '3.4rem', 'auto', '6rem'], left: [0, 2] })}
    <div class="note">「最高爱情度 9」不等于「9 就结婚」：结婚那一步要么是<b>第 10 条任务</b>（把求婚道具交出去），要么根本不在任务里（罗萨琳德是把花束直接送）。主表只到 9 为止，所以本页不给任何人补第 10 条。</div>

    <h2 class="h2">四、${nAll} 条主表任务，按委托人分节</h2>
    <p class="p">每节的顺序是攻略本<b>从上到下</b>的顺序。<b>主表这 ${nAll} 条任务名全是中文译名</b>（终有依天这一套就是这么写的）；补来的 ${nEx} 条反过来，<b>全是日文原名</b>。两套写法并存，本页各在各的位置上照录：不把中文名翻回日文，也不把日文名译成中文。「好感度」「友好度」「爱情度」三种叫法都是原文的，同样没统一。</p>
    <div class="note"><b>原文的错字与怪写法一律照录，不修：</b>玛娜第一条写作「把金刚花交给<b>的</b>罗萨琳德」（多一个「的」）；阿莉希亚第一条的触发条件写作「与阿利希亚<b>雅</b>对话后」（多一个「雅」，跟她的名字都对不上）；多罗茜那条写作「奖励<b>，</b>：无」（冒号前多一个逗号）；罗萨琳德的触发条件里「维维安筑」也不是本站的「薇薇安邸」。这些都能在下面的表里原样找到——<b>本站不动手改攻略本的错</b>。</div>
    <p class="p">奖励这一列有 ${nNone} 条写的是「无」${nNoR ? '，' + nNoR + ' 条干脆空着——空的不是本站漏填，<b>原文那里就没有</b>' : '——那是原文自己写的「无」，不是本站漏填'}。</p>
    ${ppl.map(p => `<h3 class="h3">${p.cand ? '<span class="mon-no">候选</span> ' : ''}<a class="link" href="#/char/rf2/${encodeURIComponent(p.n)}">${esc(p.n)}</a>${p.j ? '（' + esc(p.j) + '）' : ''}　${p.cnt} 条</h3>
    ${tbl(['任务', '触发条件', '流程', '奖励'], p.list.map(q => [
        '<b>' + esc(q.t) + '</b>', Lf(q.c || '—'), Lf(q.f || '—'), q.r ? esc(q.r) : dash,
    ]), { colw: ['10rem', '8rem', 'auto', '8.6rem'], left: [0, 1, 2, 3], cls: 'rf2qs' })}`).join('\n')}

    <h2 class="h2">五、主表没有、从另一套补来的 ${nEx} 条</h2>
    <p class="p">补的这 ${nEx} 条分两种：一是<b>主表一位都没收的委托人</b>（${exPpl.map(x => esc(x.n) + ' ' + x.cnt + ' 条').join('、')}）——这三位都是<b>二代</b>的角色，主表只写一周目，自然没有他们；二是<b>玛娜的求婚那一步</b>，主表链条停在爱情度 9 就没往下写。</p>
    ${tbl(['委托人', '任务', '内容（照录）', '为什么补'], ex.map(q => [
        esc(q.n), '<b>' + esc(q.t) + '</b>', Lf(q.x || '—'), esc(q.why),
    ]), { colw: ['8rem', '11rem', 'auto', '11rem'], left: [0, 1, 2, 3], cls: 'rf2qs' })}

    <h2 class="h2">六、两套都没说全的地方（照录，不补）</h2>
    <div class="note"><b>补表作者自述不全：</b>「${esc(Q.mech[Q.mech.length - 1] || '')}」——他自己追的是女仆，别的候选人的部分任务就没触发、也没记。所以<b>本页不是 RF2 任务的完整清单</b>，只是这两套资料加起来的全部。</div>
    <div class="note"><b>塔妮亚的任务被作者略过了：</b>「${esc(Q.tanya || '')}」——她的条目只有 ${(ppl.filter(p => p.n === '塔喵')[0] || {}).cnt || 0} 条，不是她只有这么多任务。</div>
    <div class="note"><b>补表里那几位会员补的任务也照收：</b>${(Q.contrib || []).map(c => '「' + esc(c) + '」').join('、')}。这些是帖子里别人补的，原作者没写，<b>本页不改写、也不并进正文</b>，原样记在这里。</div>
    <div class="note"><b>「一周目」是主表的边界：</b>主表标题就是《【一周目】任务大全》，二代那批角色（${exPpl.map(x => esc(x.n)).join('、')}）一个任务都没收。想知道二代的任务，只有补表这 ${ex.filter(q => exPpl.some(x => x.n === q.n)).length} 条可用——<b>本站没有更全的二代任务资料</b>。</div>

    <div class="jump">
        <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">求婚道具与生日礼物</div></a>
        <a href="#/page/love"><div class="jp-t">恋爱与结婚</div><div class="jp-s">爱情度怎么涨</div></a>
        <a href="#/page/source"><div class="jp-t">素材出处</div><div class="jp-s">任务要的东西去哪打</div></a>
        <a href="#/page/rf2list"><div class="jp-t">物品一览</div><div class="jp-s">奖励里的那些东西</div></a>
    </div>
    <div class="note">数据文件 <code>js/rf2quest.js</code>（<code>RF2_QUEST</code>），由 <code>_build_rf2_quest.py</code> 从 UTF-16LE 原文切分生成，脚本只拆字段：不补标点、不统一译名、不改口语。原始文件里这两段之间的作者署名是<b>三个人</b>（终有依天、安打、以及同文件里泡芙的上手指南），别当成一份攻略的两个版本。</div>`;
}

function requestRfoHtml() {
    const Q = (typeof RFO_QUEST !== 'undefined') ? RFO_QUEST : null;
    if (!Q || !Q.quests.length) return '';
    const all = Q.quests;
    const ppl = Q.people;
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const dash = '<span class="mon-no">—</span>';
    const Lf = s => '<span style="display:block;text-align:left;width:100%">' + esc(s) + '</span>';

    /* ---- 基础计数，全部现算，不手写数字 ---- */
    const nAll = all.length;
    const nPpl = ppl.length;

    /* 难度符号按原表照录。★ 系（★/★★/★★★）与 ☆ 系（☆/☆☆/☆☆☆）是两套记法，
       表头图例只写了一句「★为主线任务」，没有解释 ☆ 系是什么，本页不替它解释。 */
    const starOf = d => (d.indexOf('★') >= 0 ? '★' : (d.indexOf('☆') >= 0 ? '☆' : ''));
    const nStar = all.filter(q => starOf(q.d) === '★').length;
    const nCirc = nAll - nStar;
    const DIFF_ORDER = ['☆', '☆☆', '☆☆☆', '★', '★★', '★★★'];
    const diffCnt = {};
    all.forEach(q => { const k = q.d || '（空）'; diffCnt[k] = (diffCnt[k] || 0) + 1; });
    const diffKeys = DIFF_ORDER.filter(k => diffCnt[k]) 
        .concat(Object.keys(diffCnt).filter(k => DIFF_ORDER.indexOf(k) < 0));

    const isRecipe = q => /配方|レシピ/.test(q.r);
    const nRecipe = all.filter(isRecipe).length;
    const nRepeat = all.filter(q => q.n.indexOf('可重复') >= 0).length;
    const nNoReward = all.filter(q => !q.r || q.r === '无').length;
    const nQ = all.filter(q => /[？?]/.test(q.c)).length;
    const nPlace = all.filter(q => /^\?+$/.test(q.n) || /^\?+$/.test(q.c)).length;

    /* ---- 任务名集合：用来把「发生条件」里引号括起来的其他任务名认成前置任务 ---- */
    const nameIdx = {};
    all.forEach((q, i) => { if (!nameIdx[q.n]) nameIdx[q.n] = []; nameIdx[q.n].push(i); });
    const links = [];          // {to, from, same}
    const cited = {};          // 被引用次数
    const outside = [];        // 引用了但不在表里
    all.forEach(q => {
        const re = /「([^」]+)」/g;
        let m;
        while ((m = re.exec(q.c))) {
            const t = m[1];
            if (nameIdx[t]) {
                nameIdx[t].forEach(i => {
                    if (i === all.indexOf(q)) return;
                    links.push({ to: q, from: all[i], same: all[i].w === q.w });
                    cited[t] = (cited[t] || 0) + 1;
                });
            } else if (!outside.some(x => x.t === t && x.q === q)) {
                outside.push({ t: t, q: q });
            }
        }
    });
    const nSame = links.filter(l => l.same).length;
    const nCross = links.length - nSame;

    /* ---- 每位委托人的汇总 ---- */
    const byWho = {};
    ppl.forEach(p => { byWho[p.n] = []; });
    all.forEach(q => { (byWho[q.w] = byWho[q.w] || []).push(q); });
    const whoRows = ppl.map(p => {
        const list = byWho[p.n] || [];
        const dc = {};
        list.forEach(q => { dc[q.d] = (dc[q.d] || 0) + 1; });
        const dcTxt = diffKeys.filter(k => dc[k]).map(k => k + '×' + dc[k]).join(' ');
        return {
            n: p.n, j: p.j, list: list, cnt: list.length, dc: dcTxt,
            nStar: list.filter(q => starOf(q.d) === '★').length,
            nRec: list.filter(isRecipe).length,
        };
    }).sort((a, b) => b.cnt - a.cnt);
    const maxCnt = whoRows[0].cnt;

    /* 任务名绝大多数是日文原名，但有少数几条被攻略本写成了中文。
       纯汉字日文（依頼／購入希望…）与中文靠「简体高频字」区分，不靠有没有汉字。 */
    const cnName = all.filter(q => /[你请这说愿怪兽个把够]/.test(q.n));
    const nameCnt = {};
    all.forEach(q => { nameCnt[q.n] = (nameCnt[q.n] || 0) + 1; });
    const dups = Object.keys(nameCnt).filter(k => nameCnt[k] > 1).map(k => ({ n: k, list: all.filter(q => q.n === k) }));

    /* ---- 18 张分组表 ---- */
    const groupHtml = whoRows.map(w => {
        const rows = w.list.map(q => [
            '<b>' + esc(q.n) + '</b>',
            Lf(q.c || '—'),
            q.d || dash,
            Lf(q.r || '—'),
            Lf(q.t || '—'),
        ]);
        return `<h3>${w.n}${w.j ? '（' + esc(w.j) + '）' : ''}　${w.cnt} 条　<span class="mon-no" style="font-size:0.86em">${w.dc}</span></h3>
        ${tbl(['任务名（日文原文）', '发生条件', '难度', '报酬', '任务内容'], rows, {
            colw: ['12rem', '9.4rem', '3.6rem', '11.6rem', 'auto'],
            left: [0, 1, 3, 4], cls: 'rfoq',
        })}`;
    }).join('\n');

    return `
        <div class="note">海洋的委托没有一块统一的任务板，任务分散在 <b>18 位委托人</b>手里。本页把攻略本那张「18 列 × 16 块」的大表<b>摊平成 ${nAll} 条记录</b>，一位委托人一节。<b>任务名与报酬里的物品名保留日文原文</b>——攻略本本身没给中文译名，本站不代为翻译；<b>发生条件与任务内容是攻略本自带的中文</b>，照录不改，里面那些「友好度5？」的问号也是原表就有的（它自己就没把握）。</div>
        ${stat([
        ['委托任务', nAll + ' 条'],
        ['委托人', nPpl + ' 位'],
        ['给配方', nRecipe + ' 条'],
        ['可重复接取', nRepeat + ' 条'],
        ['无报酬', nNoReward + ' 条'],
    ])}

        <h2 class="h2">一、18 位委托人，任务数从 ${whoRows[whoRows.length - 1].cnt} 到 ${maxCnt} 条</h2>
        <p class="p">任务最多的是<b>${whoRows[0].n}</b>（${whoRows[0].cnt} 条），最少的是<b>${whoRows[whoRows.length - 1].n}</b>（${whoRows[whoRows.length - 1].cnt} 条）。十八个人的任务加起来 ${nAll} 条，平均每人 ${(nAll / nPpl).toFixed(1)} 条——分布相当平，没有谁是「任务大户」。</p>
        ${tbl(['委托人', '日文名', '任务数', '难度分布', '给配方'], whoRows.map(w => [
        '<b>' + w.n + '</b>', w.j ? esc(w.j) : dash, String(w.cnt),
        w.dc ? w.dc : dash, w.nRec ? w.nRec + ' 条' : dash,
    ]), { colw: ['6rem', '8rem', '4.4rem', '', '5rem'], leftFirst: true })}

        <h2 class="h2">二、★ 和 ☆ 是两套记法，不是难度递增</h2>
        <p class="p">原表表头只写了一行图例：<b>「★为主线任务」</b>，再没有第二句解释。照表面读，难度列里 ★ 系共 <b>${nStar} 条</b>、☆ 系共 <b>${nCirc} 条</b>，两套各分三档。</p>
        ${tbl(['记号', '条数', '表里是什么任务'], diffKeys.map(k => {
        const list = all.filter(q => q.d === k);
        const sample = list.slice(0, 3).map(q => esc(q.n)).join('、');
        return [k, String(diffCnt[k]), '<span class="mon-no" style="display:block;text-align:left">例：' + sample + (list.length > 3 ? ' 等' : '') + '</span>'];
    }), { colw: ['5rem', '4.4rem', ''], left: [2] })}
        <div class="key"><b>图例和表对不齐，本站照录这个矛盾，不替它圆。</b>按「★为主线任务」这句读，★ 系 ${nStar} 条应该都是推进剧情的关键任务，可表里有 ${diffCnt['☆☆☆'] || 0} 条 <b>☆☆☆</b> 的任务内容同样是「挖岛／挖沉船后报告」，和 ★★ 那批干的是同一件事；反过来，★ 系里也混着「与某人对话即可」这种零门槛的收尾任务。所以本页<b>只报每个记号有多少条、分别是什么任务</b>，不把记号翻译成「难度等级」——照表读才是最安全的。</div>

        <h2 class="h2">三、任务链：${links.length} 处前置关系，${nCross} 处跨委托人</h2>
        <p class="p">「发生条件」列里凡是用「」括起来的，多半是另一条任务的名字。全表能这样接上的有 <b>${links.length} 处</b>，其中 <b>${nSame} 处</b>是同一个人自己串的，<b>${nCross} 处</b>要跑到别人那儿先做完再回来。</p>
        ${tbl(['要先做完', '才能接', '委托人', '同人'], links.map(l => [
        '<span class="mon-no">' + esc(l.from.n) + '</span>',
        '<b>' + esc(l.to.n) + '</b>',
        esc(l.to.w) + (l.from.w !== l.to.w ? '（前置在' + esc(l.from.w) + '）' : ''),
        l.same ? '是' : '<b>否</b>',
    ]), { colw: ['11rem', '', 'auto', '3.8rem'], left: [0, 1, 2] })}
        <div class="note">这条链是按<b>任务名精确匹配</b>算出来的：条件里引号内的字串要跟表里某条任务名一字不差才算数，对不上就<b>不认</b>。全表只有 ${outside.length} 处引用了表外的名字${outside.length ? '（' + outside.map(x => '「' + esc(x.t) + '」（' + esc(x.q.w) + '的任务）').join('、') + '，这几条任务本表没收' : ''}。另外还有 ${nQ} 条任务的条件只写「友好度N？」这类描述、不引用别的任务名，那些关系本页不猜。</div>

        <h2 class="h2">四、原表自己的不确定，占了 ${nQ} 条</h2>
        <p class="p">${nQ} 条任务的发生条件带问号（「友好度5？」「无？」「友好度3？潘多拉复活后」这种），占全表 <b>${(nQ / nAll * 100).toFixed(0)}%</b>。这不是本站打错，是攻略本当年就没确认——它把「大概是这样」直接写成了带问号的条目。</p>
        <div class="note">另有 <b>${nPlace} 条</b>连任务名都是占位：${all.filter(q => /^\?+$/.test(q.n)).map(q => '<b>' + esc(q.w) + '</b>的「' + esc(q.n) + '」（报酬 ' + esc(q.r) + '，内容「' + esc(q.t).slice(0, 26) + '…」）').join('、')}。原表只留了问号，本站<b>不替它补任务名</b>，也不从奖励反推它叫什么。</div>

        <h2 class="h2">五、${nAll} 条任务，按委托人分节</h2>
        <p class="p">下面十八节就是原表的十八列。每节的顺序是攻略本<b>从上到下</b>的顺序，不是游戏里的解锁顺序——原表没有给解锁序号，本站不排。</p>
        <p class="p">任务名绝大多数是日文原名，但有 <b>${cnName.length} 条被攻略本直接写成了中文</b>：${cnName.map(q => '「' + esc(q.n) + '」').join('、')}。这几条大多标着「可重复接取」，报酬也改用了星号写法（「卷心菜蛋糕*1」），跟其余各条的「×」不一样。<b>两种写法都照录</b>，本站不把星号改成乘号，也不把手写的中文名翻回日文。</p>
        <div class="note">有一处会让人以为数据重复：<b>${dups.map(d => d.list[0].w).join('、')}</b>的「${dups.map(d => esc(d.n)).join('、')}」在原表里出现了 <b>${dups.map(d => d.list.length).join('、')} 次</b>，报酬分别是 ${dups.map(d => d.list.map(q => '「' + esc(q.r) + '」').join('与')).join('、')}。两条都落在同一列里，分属原表上下的两个任务块，本站<b>按两条收，没有合并、没有去重</b>——合并掉就凭空少了一条可接的任务。</div>
        ${groupHtml}
        <div class="jump">
            <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">交东西之前先看谁爱吃什么</div></a>
            <a href="#/page/source"><div class="jp-t">素材出处</div><div class="jp-s">任务要的素材去哪打</div></a>
            <a href="#/page/fish"><div class="jp-t">鱼类图鉴</div><div class="jp-s">委托里点名的鱼</div></a>
            <a href="#/page/recipe"><div class="jp-t">配方大全</div><div class="jp-s">任务奖励里的那些配方</div></a>
        </div>
        <div class="note">数据取自 ${esc(Q.src)}，单一来源，无第二份资料可交叉核对，所以本页<b>只搬运不解释</b>：任务名不译、报酬不折算、难度记号不改写成等级、条件里的问号不删。<b>有 ${nNoReward} 条任务的报酬在原表里就是「无」</b>，不是本站漏填。</div>`;
}

/* 龙之天地（azuma）专属：东国任务（gametoeasy post/1831–1836 六篇）
   六篇表结构互不相同：6 列／2 列／没有表／3 列／2 列／3 列，所以不合并成一张表，
   按篇保留各自表头。表头一律照录，包括源文没解释的「大」「小」两列。 */
function requestAzumaHtml() {
    const Q = (typeof QUEST_AZUMA !== 'undefined') ? QUEST_AZUMA.tasks : [];
    if (!Q.length) return '';
    const G = pg => Q.filter(t => t.pg === pg)[0];
    const sp = s => String(s == null ? '' : s).split('、').map(x => x.trim()).filter(Boolean);
    const dash = '<span class="mon-no">—</span>';
    const Lf = s => '<span style="display:block;text-align:left;width:100%">' + s + '</span>';
    const q = G(1831), frog = G(1832), shroom = G(1833), tgt = G(1834), jizo = G(1835), sweet = G(1836);

    /* 奖励项统一数一遍，不手写数字。饭团那篇的「配方／大／小」三列都算奖励 */
    const pool = [];
    q.rows.forEach(r => { [3, 4, 5].forEach(i => { pool.push.apply(pool, sp(r[i])); }); });
    frog.rows.forEach(r => { pool.push.apply(pool, sp(r[1])); });
    tgt.rows.forEach(r => { pool.push.apply(pool, sp(r[2])); });
    jizo.rows.forEach(r => { pool.push.apply(pool, sp(r[1])); });
    sweet.rows.forEach(r => { pool.push.apply(pool, sp(r[2])); });
    const uniq = [];
    pool.forEach(x => { if (uniq.indexOf(x) < 0) uniq.push(x); });
    const nRow = Q.reduce((a, t) => a + t.rows.length, 0);

    /* 与「配方大全」的摆设表交叉：能查到同名条目的就是摆设 */
    const deco = {};
    if (typeof RECIPE_AZUMA !== 'undefined') {
        RECIPE_AZUMA.cats.forEach(c => {
            if (c.k !== '摆设') return;
            c.rows.forEach(r => { deco[r[0]] = 1; });
        });
    }
    const decoHit = uniq.filter(x => deco[x]);

    /* 青蛙石：档位差与每档项数 */
    const th = frog.rows.map(r => +r[0]);
    const gaps = th.slice(1).map((v, i) => v - th[i]);
    const per = frog.rows.map(r => sp(r[1]).length);
    const maxPer = Math.max.apply(null, per);
    const maxTier = th.filter((v, i) => per[i] === maxPer);
    const frogPool = frog.rows.reduce((a, r) => a.concat(sp(r[1])), []);
    const frogDeco = frogPool.filter(x => deco[x]);

    /* 甜点翁：哪道题正是另一道题发出来的 */
    const sName = sweet.rows.map(r => r[0]);
    const sGive = sweet.rows.map(r => sp(r[2]));
    const chain = [];
    sName.forEach((n, i) => {
        sGive.forEach((list, k) => {
            if (k !== i && list.indexOf(n) >= 0) chain.push({ t: n, i: i, from: k });
        });
    });
    const orphan = sName.filter((n, i) => !chain.some(x => x.i === i));
    const milkTier = frog.rows.filter(r => sp(r[1]).indexOf('草莓牛奶') >= 0).map(r => r[0]);

    return `
        <h2 class="h2">东国任务不是一张清单，是六条各自独立的线</h2>
        <p class="p">龙之天地的委托任务就是「东国任务」，但没有一块统一的任务板：<b>${Q.map(t => t.n).join('、')}</b>六条线各自计数、各自发奖。有的按地图上的点逐个交付（饭团滚滚、与一的射靶），有的按收集数量累计（青蛙石爱好家、打扫地藏），甜点翁是按 6 道题逐个交菜，鉴定蘑菇那条干脆只做鉴定、没有奖励表。</p>
        ${stat([
        ['任务线', Q.length + ' 条'],
        ['表内记录', nRow + ' 条'],
        ['蘑菇清单', shroom.list.length + ' 种'],
        ['点名的奖励', uniq.length + ' 项'],
    ])}
        <p class="p">六篇加起来的奖励项 <b>${pool.length}</b> 项，<b>一项不重复</b>——同一件东西不会在两条线里各给一次。这条对规划有用：想凑齐配方，不能指望一条线补另一条线的漏，六条都得各跑一遍。</p>
        ${tbl(['任务', '形态', '接取／领取处', '记录', '收尾奖励'], Q.map(t => [
        '<b>' + t.n + '</b>',
        t.type,
        Lf(t.where),
        t.rows.length ? t.rows.length + ' 条' : t.list.length + ' 种',
        t.full.t === '—' ? dash : '<b>' + t.full.t + '</b><br><span class="mon-no" style="font-size:0.82em">' + t.full.why + '</span>',
    ]), { colw: ['7.4rem', '6rem', 'auto', '4.4rem', '9.6rem'], left: [2], cls: 'azuq' })}
        <div class="note">「形态」是本站按<b>表的形状</b>分的（分点交付／数量累计／按题目提交／纯鉴定），不是游戏里的官方分类名。最后一列的小字说明那项奖励是<b>源文自己写明的「全部完成／全满」</b>，还是<b>只是表里最后一档</b>——六篇里只有饭团滚滚与鉴定蘑菇两篇写了「全部完成」「全满奖励」，其余四篇的末档奖励是照表位置读的，不替它升级成「全满」。</div>

        <h2 class="h2">饭团滚滚：六处各一句话，听它念完就知道该做什么</h2>
        <p class="p">${q.intro.join('')}六个区域<b>一处不重复</b>：${q.rows.map(r => r[0]).join('、')}。「问题」列记的是它说的那句话，「要什么」列是要交给它的那件东西——把这两列对着读，就是「它点的是什么、你该做哪一道」。</p>
        ${tbl(q.head, q.rows, {
        colw: ['9.6rem', 'auto', '6.6rem', 'auto', '7.8rem', '7.2rem'],
        left: [0, 1, 3], cls: 'azuq',
    })}
        <div class="key"><b>「大」「小」这两列，本站没法核实。</b>源表就写两个单字，源文一句解释都没有；biligame 的「东国任务」页目前是<b>空页（无内容）</b>，也没有第二个来源能对。所以两列<b>照录：不合并、不改名、不替它俩编含义</b>。能确定只有两件事——两列都是素材（金×3、优质角×1 这种），而且六行各不相同。</div>

        <h2 class="h2">青蛙石爱好家：12 档，从 5 个到 204 个</h2>
        <p class="p">${frog.intro.join('')}档位是 ${th.join(' → ')}：前两档差 ${gaps[0]} 与 ${gaps[1]}，从第三档起<b>每 20 个一档</b>一直排到 190，唯一破例的是最后一档 204——比前一档多 ${gaps[gaps.length - 1]} 个，全表就这一处不按 20 走。</p>
        ${tbl(frog.head, frog.rows, { colw: ['5.4rem', 'auto'], leftFirst: true, left: [1], cls: 'azuq' })}
        <p class="p">每档给 2～6 项，<b>不随档位递增</b>：给得最多的是 ${maxTier.map(v => v + ' 个').join(' 与 ')}这两档，各 ${maxPer} 项；而 130 个往后每档只剩 3～4 项。这一篇 ${frogPool.length} 项奖励里有 ${frogDeco.length} 项是<b>摆设</b>（${frogDeco.join('、')}），能在「配方大全」的摆设表里查到同名条目与做法；其余是料理，本站配方大全不含料理（源页没有表），只能对到名字、对不到配方。</p>

        <h2 class="h2">鉴定蘑菇：30 种，这条线没有奖励表</h2>
        <p class="p">${shroom.intro.join('')}</p>
        <p class="p">30 种菇的名字按源文列表顺序照录，未按季节或稀有度重排：<br>${shroom.list.join('、')}。</p>
        <div class="note">这条线跟另外五条不同：<b>没有数量档位、没有配方奖励</b>，也没有「鉴定 10、15、20 个就送配方」那套（源文专门写了这句）。名字里带季节的四种（春之菇、夏之菇、秋之菇、冬之菇）与「每个采集点固定出几种」的设定对得上，但源文没给每个点具体出哪几种，所以本页<b>不按季节分组、也标不出采集点</b>。</div>

        <h2 class="h2">与一的射靶：8 处，茄子等级一路升到 Lv8</h2>
        <p class="p">8 个射靶按序号排，前七处给的全是茄子相关（种子／茄子／大茄子／茄子的配方），<b>等级随序号往上走</b>：Lv1 → Lv3 → Lv6 → Lv7 → Lv8。配方只有三处——第 2、第 4、第 8，最后一处的奖励是<b>配方与一之弓</b>。</p>
        ${tbl(tgt.head, tgt.rows, { colw: ['4.4rem', 'auto', 'auto'], left: [1, 2], cls: 'azuq' })}

        <h2 class="h2">打扫地藏：5 档，扫完第二天早上发</h2>
        <p class="p">${jizo.intro.join('')}档位只有五档：${jizo.rows.map(r => r[0] + ' 个').join('、')}。米是主线奖励，等级从 Lv1 一路给到 Lv5，到第 30 个那档还多一株桃树苗。</p>
        ${tbl(jizo.head, jizo.rows, { colw: ['5.4rem', 'auto'], leftFirst: true, left: [1], cls: 'azuq' })}
        <div class="note">第 30 个那档的「桃树苗Lv×1」<b>源文 Lv 后面没有数字</b>，照录不改——这里不替它补等级。</div>

        <h2 class="h2">甜点翁：6 道题，先交的菜正好是后一题发出来的</h2>
        <p class="p">${sweet.intro.join('')}题目按「等级要求」从 Lv1 排到 Lv4：${sweet.rows.map(r => r[0] + ' ' + r[1]).join('、')}。每题给 4 个配方，六题合计 ${sweet.rows.length * 4} 个，也<b>一个不重复</b>。「等级要求」四个字照录——源文没说明这是这道菜本身的等级，还是要求的料理等级，两说都留着。</p>
        ${tbl(sweet.head, sweet.rows, { colw: ['7.4rem', '6rem', 'auto'], left: [2], cls: 'azuq' })}
        <p class="p">把「题目」和同一篇的「奖励」对起来，<b>三道题要交的菜正是另一道题发出来的</b>：${chain.map(c => '「' + c.t + '」（第 ' + (c.i + 1) + ' 题）来自第 ' + (c.from + 1) + ' 题的奖励').join('；')}。也就是说这三道题不能按顺序硬推，得先做给出配方的那一道。</p>
        <div class="key">剩下三道题<b>不是自家人发的</b>：${orphan.join('、')}。其中「草莓牛奶」的来路源文自己写了——<b>青蛙石爱好家 ${milkTier.join('、')} 个那档的奖励</b>（上一节 50 档的奖励里确实有它）；<b>「${orphan.filter(x => x !== '草莓牛奶').join('」「')}」的配方六篇里都查不到出处</b>，本站不替它们编。所以这条线是串着的：<b>不先把青蛙石攒到 ${milkTier.join('、')} 个，甜点翁的第 5 题就交不了</b>。</div>

        <h2 class="h2">四件可以从表里读出来的事</h2>
        <ul class="ul">
            <li class="li"><b>奖励一项不重复</b>：六篇 ${pool.length} 项奖励去重后还是 ${uniq.length} 项。这不是巧合——六条线各有各的奖池，谁都不补谁。</li>
            <li class="li"><b>${decoHit.length} 项奖励是摆设</b>：${decoHit.join('、')}。这些在「配方大全」的摆设表里有同名条目与材料，是本文与配方表唯一能对上的部分。</li>
            <li class="li"><b>料理配方对不上，不是缺数据</b>：奖励里绝大多数是料理，而本站配方大全<b>本来就不含料理</b>——源站的料理页正文零表格，只有一段文字，所以那一块一直是空的。这里只列菜名，不往配方表里硬塞。</li>
            <li class="li"><b>两条线是串着的</b>：草莓牛奶既是青蛙石 50 个的奖励，又是甜点翁第 5 题要交的菜；甜点翁内部还有三条「前一题发后一题」的链。规划顺序时先跑青蛙石，再跑甜点翁。</li>
        </ul>
        <div class="jump">
            <a href="#/page/recipe"><div class="jp-t">配方大全</div><div class="jp-s">上面那些摆设怎么做</div></a>
            <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">交菜之外怎么涨牵绊</div></a>
            <a href="#/page/azuma_boss"><div class="jp-t">BOSS 战</div><div class="jp-s">跑图路上的对手</div></a>
        </div>
        <div class="note">数据取自 ${(typeof QUEST_AZUMA !== 'undefined') ? QUEST_AZUMA.src : 'gametoeasy'}，六篇各一张表，<b>表头与「—」「×」一律照录</b>；六篇都没有给奖励的数量区间或概率，所以本页不算期望收益。</div>`;
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

/* 跨作机制对照：把各作放在一张表里并排看。
   所有数字取自已加载的数据全局（GAMES / 各作料理与钓鱼数据表），零臆造；
   系统机制差异是建站过程中逐作核实过的发现，每条都标了出处，不跨作换算。*/
/* 生日核对：站内七作的人物生日 × 外部两份资料，逐人对照。

   外部两个源，性质不同，页面里分开标：
     docx = 《RFF 新手篇+人物喜好+星座》（docx，日文名 + 日文生日「秋の1日」），一手日文原表，边境 26 人；
     mem  = 《Rune Factory Official Memoirs》角色攻略（txt，民间翻译，逐人「诞生日：秋之月的25日」），二手，47 人。
   两份合并去重 61 人：边境 26（其中 12 人两源均载，可交叉印证）+ RF1 11 + RF2 13 + RF3 11。

   对齐只认「同一个角色」，靠站内别名 al 与人工核对过的译名表（见 _build_bd.py 的 ALIAS），
   对不上的记录直接不收——宁可少 10 个人，也不拿生日相近去猜谁是谁。
   数据由 _build_bd.py 生成 js/bd_ext.js，本函数只做比对与渲染。 */
function bdCheckHtml() {
    const N = (typeof NPC_FULL !== 'undefined') ? NPC_FULL : {};
    const B = (typeof BD_EXT !== 'undefined') ? BD_EXT : {};
    const GM = (typeof GAMES !== 'undefined') ? GAMES : [];
    const SEA = '春夏秋冬';
    const ORDER = ['rf1', 'rf2', 'rf3', 'rff', 'rf4', 'rf5', 'rfo'];
    /* 本页统一用「RF1／RF2…边境／海洋」，不取 GAMES.short——那里 rf1 写作「新牧场物语」，
       摆在表头会让人以为多了个作品。 */
    const SHORT = { rf1: 'RF1', rf2: 'RF2', rf3: 'RF3', rff: '边境', rf4: 'RF4', rf5: 'RF5', rfo: '海洋' };
    const nmOf = id => SHORT[id] || id;
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const norm = s => String(s || '').replace(/[月日]/g, '');
    const bdK = s => { const m = /^([春夏秋冬])月?(\d+)/.exec(s || ''); return m ? SEA.indexOf(m[1]) * 100 + Number(m[2]) : 9999; };
    const dash = '<span class="mon-no">—</span>';
    const SRC = { docx: '边境人物表', mem: 'Memoirs' };

    const siteOf = (id, n) => ((N[id] || []).filter(x => x.n === n)[0] || {}).bd || '';
    const siteN = id => (N[id] || []).filter(x => x.bd).length;
    const extN = id => (B[id] || []).length;

    /* 逐人比对：state = ok 一致 / miss 站内缺 / bad 冲突 */
    const all = [];
    ORDER.forEach(id => (B[id] || []).forEach(v => {
        const s = siteOf(id, v.n);
        const st = !s ? 'miss' : (norm(s) === v.bd ? 'ok' : 'bad');
        all.push({ g: id, n: v.n, on: v.on, e: v.bd, s: s, src: v.s, st: st, sv: v.sv, onv: v.onv });
    }));
    const tot = all.length;
    const nOk = all.filter(x => x.st === 'ok').length;
    const nMiss = all.filter(x => x.st === 'miss').length;
    const nBad = all.filter(x => x.st === 'bad').length;
    const nBoth = all.filter(x => x.src.length > 1).length;
    const nSite = ORDER.reduce((a, id) => a + siteN(id), 0);
    const nDocx = all.filter(x => x.src.indexOf('docx') >= 0).length;
    const nMem = all.filter(x => x.src.indexOf('mem') >= 0).length;

    const tagOf = st => st === 'ok' ? '<span class="tag g">一致</span>'
        : st === 'miss' ? '<span class="tag y">站内缺</span>'
            : '<span class="tag r">不一致</span>';
    const srcOf = s => s.length > 1
        ? '<span class="tag b">两源均载</span>'
        : (s[0] === 'docx' ? '边境人物表' : 'Memoirs');

    const rowOf = x => [
        npcLink(x.g, x.n),
        x.s ? x.s : dash,
        x.e + '日',
        x.on === x.n ? dash : esc(x.on),
        srcOf(x.src),
        tagOf(x.st)
    ];

    const blocks = ORDER.filter(id => (B[id] || []).length).map(id => {
        const rows = (B[id] || []).map(v => all.filter(a => a.g === id && a.n === v.n)[0]).map(rowOf);
        const n = rows.length;
        const ok = (B[id] || []).filter(v => (all.filter(a => a.g === id && a.n === v.n)[0] || {}).st === 'ok').length;
        return `<h3 class="h3">${nmOf(id)}：可核 ${n} 人，${ok} 人一致</h3>
        ${tbl(['角色', '站内', '外部', '外部写法', '来源', '结论'], rows,
            { colw: ['7rem', '4.6rem', '4.6rem', '9rem', '6.6rem', '4.6rem'], leftFirst: true, left: [3] })}`;
    }).join('');

    /* 两源交叉：同一人两份资料都写了生日，还对得上 */
    const miss = all.filter(x => x.st === 'miss');
    const both = all.filter(x => x.src.length > 1).sort((a, b) => bdK(a.e) - bdK(b.e) || a.n.localeCompare(b.n));
    const bothOk = both.filter(x => x.st === 'ok').length;

    /* 站内缺生日的人（不含外部也没写的） */
    const noBd = [];
    ORDER.forEach(id => (N[id] || []).forEach(x => { if (!x.bd) noBd.push([id, x.n, x.r || '']); }));

    /* 覆盖边界：每作多少人、外部能核多少 */
    const covRows = ORDER.map(id => {
        const s = siteN(id), e = extN(id);
        return [nmOf(id), String(s), String(e),
            s ? (e ? Math.round(e / s * 100) + '%' : '<span class="mon-no">0%</span>') : dash];
    });

    /* 顺带：全站同日生日（3 人及以上） */
    const cal = {};
    ORDER.forEach(id => (N[id] || []).forEach(x => {
        if (!x.bd) return;
        const k = bdK(x.bd);
        if (k === 9999) return;
        (cal[k] = cal[k] || []).push([id, x.n, x.bd]);
    }));
    const calKeys = Object.keys(cal).map(Number).sort((a, b) => a - b);
    const day3 = calKeys.filter(k => cal[k].length >= 3);
    const day2 = calKeys.filter(k => cal[k].length === 2);

    return `
    <h2 class="h2">生日核对</h2>
    <p class="p">这一页只做一件事：把<b>本站人物档案里的生日</b>和<b>外部资料里的生日</b>摆在一起，逐人看对不对。站内 ${ORDER.length} 部作品共 <b>${nSite} 位</b>角色登记了生日；外部两份资料能对上的有 <b>${tot} 位</b>——其余 ${nSite - nOk} 位<b>外部根本没有可比对的记录</b>，本页不替他们编一个。</p>
    ${stat([['站内有生日', nSite + ' 位'], ['外部可核', tot + ' 位'],
        ['逐人一致', nOk + ' 位'], ['站内缺', nMiss + ' 位'], ['互相冲突', nBad + ' 位']])}

    <h2 class="h2">一、两份外部资料是什么</h2>
    ${tbl(['来源', '文件', '性质', '逐人记录'], [
        ['边境人物表', 'RFF 新手篇＋人物喜好＋星座（docx）', '日文原表，格式「秋の1日」', '26 条（边境 26 人）'],
        ['Memoirs', 'Rune Factory Official Memoirs·角色攻略（txt）', '中文民间翻译，格式「诞生日：秋之月的25日」', '47 条（RF1／2／3／边境）']
    ], { colw: ['6.4rem', '', '13rem', '11rem'], leftFirst: true, left: [1, 2, 3] })}
    <div class="note">两份合并去重后 <b>${tot} 位</b>：边境 26（其中 <b>${nBoth} 位</b>两源都写了）＋ RF1 11 ＋ RF2 13 ＋ RF3 11。<b>「边境人物表」是日文原表，属一手；「Memoirs」是民间翻译的中文版，属二手</b>——两者结论完全一致，这本身是最强的一条证据。RF4／RF5／海洋三作的外部生日只散在攻略本扫描件里，本站没做 OCR，所以那三作<b>一条外部记录都没有</b>，不是「核过没问题」。</div>

    <h2 class="h2">二、逐人对照（${tot} 位）</h2>
    <p class="p">按作品分组，组内按生日先后排。「外部写法」一列有两种含义：<b>边境那组是日文原表的日文名</b>（拿去对日站原文最省事），<b>Memoirs 那组是译本里的中文名</b>，与站内同名的不重复写。同一角色两三种译名，本来就是这个资料圈最常见的事。</p>
    ${blocks}

    <h2 class="h2">三、两份资料互相印证的 ${both.length} 位</h2>
    <p class="p">这 ${both.length} 位在日文原表和中文译本里都写了生日，${bothOk === both.length ? `而且<b>两份写的完全一样</b>，同时又和站内一致——三个独立记录指向同一天，这基本没有出错的空间` : `其中 ${both.length - bothOk} 位对不上，已在第二节标出`}。</p>
    ${tbl(['角色', '边境人物表（日文名 · 生日）', 'Memoirs（中译名 · 生日）', '站内'],
        both.map(x => [npcLink(x.g, x.n),
            esc(x.onv.docx) + ' · <b>' + x.sv.docx + '日</b>',
            esc(x.onv.mem) + ' · <b>' + x.sv.mem + '日</b>',
            '<b>' + x.s + '</b>']),
        { colw: ['7rem', '11rem', '11rem', '6rem'], leftFirst: true, left: [1, 2] })}
    <div class="note">同一人在两源里写法不同（日文「秋の1日」／中文「秋之月的1日」），生日是同一天，只是表达方式不同。本表统一折成「秋1日」这种简写。</div>

    <h2 class="h2">四、站内缺的 ${nMiss} 条</h2>
    <p class="p">${nMiss ? `<b>${miss.map(x => nmOf(x.g) + '「' + x.n + '」').join('、')}</b> 在站内人物档案里 <code>bd</code> 为空（源站页面本身没写），而外部资料记的是 <b>${miss.map(x => x.e + '日').join('、')}</b>。` : '没有「外部有、站内缺」的记录。'}</p>
    <p class="p">处理方式：<b>不往数据文件里补</b>。理由很直接——Memoirs 是民间翻译，RF1 的生日在原版攻略本、日文 wiki 上有没有同一说法，本站没有第二份源可对；单源记录一旦写进 <code>NPC_FULL</code>，后面所有人都会当它是既定事实。所以这条只在本页照录，标明出处，等你哪天拿到日文原表再定。</p>
    <div class="note">对照着看：同作其他人在<b>站内</b>都登记了生日，外部的 Memoirs 也对得上，等于两条腿站着；只有莉妮特是「站内空着、外部只有一份中文译本说了个数」——<b>单源孤证</b>。她本来就是隐藏角色（要先通关古里多洞窟、全镇友好度 8 以上才登场），资料少也是这个原因。</div>

    <h2 class="h2">五、外部为什么核不了另外 ${nSite - nOk} 位</h2>
    <p class="p">不是这些人的生日有问题，是<b>手上没有能比对的第二份记录</b>。按作看覆盖率：</p>
    ${tbl(['作品', '站内有生日', '外部可核', '覆盖率'], covRows, { colw: ['8rem', '7rem', '7rem', '6rem'], leftFirst: true })}
    <div class="note">本页统计只含 <code>NPC_FULL</code> 里这七作。<b>龙之天地</b>的角色存在另一套表（角色详情 16 位＋村民喜好 10 位共 26 人有生日），与这七作零重叠、外部也没有可比记录，<b>没有并进本页</b>，想知道它的生日请进该作人物页。</div>
    <p class="p">边境覆盖率 100%——26 位有生日的人，外部 26 条全对上，一位不差。RF1／RF2／RF3 只覆盖到 Memoirs 挑出来讲的那批（多为结婚候补）。<b>RF4／RF5／海洋是 0%，这三作的生日只有站内一个来源</b>，也就是说：它们对错，本页验不了。</p>

    <h2 class="h2">六、站内还没登记生日的 ${noBd.length} 位</h2>
    <p class="p">这些人在人物档案里 <code>bd</code> 字段是空的——源站页面本身没写，不是本站漏抄。名单列出来，是为了让「本站缺什么」这件事有个明确的边界：</p>
    ${tbl(['作品', '角色', '身份'], noBd.map(x => [nmOf(x[0]), npcLink(x[0], x[1]), x[2] ? x[2] : dash]), { colw: ['6rem', '8rem', ''], leftFirst: true, left: [2] })}

    <h2 class="h2">七、顺带核出来的：同日生日</h2>
    <p class="p">${nSite} 位角色分布在 <b>${calKeys.length} 个日期</b>上，其中 <b>${day3.length} 天挤了 3 人以上</b>，另有 ${day2.length} 天是两人同天。同一天生日的角色，礼物准备一份就够两三个人用——这是这份数据最实用的一处副产品。</p>
    <p class="p">口径先说清楚：<b>按各作人物档案里的条目数算，不跨作合并</b>。初代和边境本来就是重制关系，同名角色两边都有（美乐蒂、拉碧丝、塔巴莎……），所以表里会看到同一个名字出现两次、前面挂两个不同作品名——那是<b>同一角色在两作出场</b>，不是重名，也不是数据错了。</p>
    ${tbl(['日期', '同一天生日的人'], day3.map(k => {
        const d = cal[k][0][2].replace(/\d+日$/, '');
        const n = cal[k][0][2].replace(/^[春夏秋冬]/, '');
        return [d + n, cal[k].map(x => `<span class="tag">${nmOf(x[0])}</span>${npcLink(x[0], x[1])}`).join('　')];
    }), { colw: ['6rem', ''], leftFirst: true, left: [1] })}
    <div class="note">只有 3 人及以上的 ${day3.length} 天在这张表里；两人同天的 ${day2.length} 天不列，太散。每个名字前面的小标签是<b>作品</b>，不是称号。想确认某位到底在哪一作登场、什么身份，点名字进人物页看。</div>

    <div class="jump">
        <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">生日当天送什么最划算</div></a>
        <a href="#/page/seriescmp"><div class="jp-t">跨作机制对照</div><div class="jp-s">八作并排看</div></a>
    </div>
    <div class="note">本页不判断「哪个生日才是对的」：站内数据照录源站，外部数据照录两份资料，两边一致就记一致，不一致就记不一致，<b>不替任何一方改数字</b>。想查某位的完整档案（喜好、住址、求婚条件），点名字进人物页。</div>
    `;
}

function seriesCmpHtml() {
    const G = (typeof GAMES !== 'undefined') ? GAMES : [];
    const baseId = id => id;
    const ckN = id => ({
        rf1: typeof RF1_COOK !== 'undefined' ? RF1_COOK.length : 0,
        rf2: typeof RF2_COOK !== 'undefined' ? RF2_COOK.length : 0,
        rf3: typeof RF3_COOK !== 'undefined' ? RF3_COOK.length : 0,
        rf4: typeof RF4_COOK !== 'undefined' ? RF4_COOK.length : 0,
        rf5: typeof RF5_COOK !== 'undefined' ? RF5_COOK.length : 0,
        rff: typeof RFF_COOK !== 'undefined' ? RFF_COOK.length : 0,
        rfo: typeof RFO_COOK !== 'undefined' ? RFO_COOK.length : 0,
        azuma: typeof AZUMA_COOK !== 'undefined'
            ? AZUMA_COOK.cats.reduce((s, c) => s + (c.rows ? c.rows.length : 0), 0) : 0
    }[baseId(id)] || 0);
    const fishN = id => {
        const b = baseId(id);
        if (b === 'rfo') {
            // RFO_FISH_SPOT：攻略本「鱼群」实测表 [岛, 地点, 季节, 时段, [[鱼名, 稀有], ...]]
            if (typeof RFO_FISH_SPOT === 'undefined' || !RFO_FISH_SPOT.length) return 0;
            const set = {};
            RFO_FISH_SPOT.forEach(r => { (r[4] || []).forEach(f => { set[f[0]] = 1; }); });
            return Object.keys(set).length;
        }
        if (b === 'azuma') {
            // 注意：FISH_AZUMA 是「图鉴任务奖励」对象（rewards/full），不是鱼种数组，
            // 取 .length 会得 undefined。鱼种在 SPOT_AZUMA.fishes
            // （钓鱼攻略：鱼名／买价／卖价／钓点／商店／解锁条件）。
            return (typeof SPOT_AZUMA !== 'undefined' && SPOT_AZUMA.fishes)
                ? SPOT_AZUMA.fishes.length : 0;
        }
        return ({
            rf1: typeof FISH_RF1 !== 'undefined' ? FISH_RF1.length : 0,
            rf2: typeof FISH_RF2 !== 'undefined' ? FISH_RF2.length : 0,
            rf3: (typeof FISH_RF3 !== 'undefined' ? FISH_RF3.length : 0)
                + (typeof FISH_RF3_RESORT !== 'undefined' ? FISH_RF3_RESORT.length : 0),
            rff: typeof FISH_RFF !== 'undefined' ? FISH_RFF.length : 0,
            rf4: typeof FISH_RF4 !== 'undefined' ? FISH_RF4.length : 0,
            rf5: typeof FISH_RF5 !== 'undefined' ? FISH_RF5.length : 0,
        }[b] || 0);
    };
    const marryN = g => (g.chars || []).filter(c => /候补/.test(c.role || '')).length;
    const nm = g => (g.short || g.name || g.id);

    const infoRows = G.map(g => [
        nm(g), g.date || '—', g.plat || '—',
        (g.hero || '—') + (g.heroJp ? '（' + g.heroJp + '）' : ''),
        g.stage || '—'
    ]);
    const scaleRows = G.map(g => [nm(g), String(ckN(g.id)), String(fishN(g.id))]);
    const marryRows = G.map(g => [nm(g), String(marryN(g)), String((g.chars || []).length)]);
    const candRows = G.map(g => {
        const cs = (g.chars || []).filter(c => /候补/.test(c.role || ''));
        const F = cs.filter(c => /花嫁/.test(c.role)).map(c => c.name);
        const M = cs.filter(c => /花婿/.test(c.role)).map(c => c.name);
        return [nm(g), F.length ? F.join('、') : '—', M.length ? M.join('、') : '—'];
    });
    const prodRows = G.map(g => [nm(g), g.dev || '—', g.pub || '—', g.god || '—']);
    // 主角结构：由 hero 字段与主角人数派生，不臆造
    const heroStruct = g => {
        if (g.id === 'rfo') return '一体两魂（双魂共用一躯）';
        if ((g.hero || '').indexOf('／') >= 0) return '可选性别（开局选男／女）';
        const mc = (g.chars || []).filter(c => c.role === '主角').length;
        if (mc > 1) return '跨代多主角（' + mc + ' 名）';
        return '固定单人主角';
    };
    const nameRows = G.map(g => [nm(g), g.jp || '—', g.en || '—', g.tagline || '—', heroStruct(g)]);

    return `
    <h2 class="h2">跨作机制对照</h2>
    <p class="p">把 ${G.length} 部作品放在一张表里并排看。基础信息、结婚候补、角色数直接取自本站数据文件（<code>GAMES</code>）；料理与钓鱼规模是各作数据表的<b>真实条数</b>；系统机制差异是建站过程中逐作核实过的发现，每条都标了出处作，<b>不跨作换算、不替没核实的填数字</b>。</p>

    <h2 class="h2">一、基础信息</h2>
    ${tbl(['作品', '发售日', '平台', '主角', '舞台'], infoRows, { colw: ['6.4rem', '6.6rem', '7.2rem', '9rem', ''], left: [3, 4] })}

    <h2 class="h2">二、结婚候补与角色规模</h2>
    <p class="p">「结婚候补」＝花嫁候补＋花婿候补的人数（取自数据文件 <code>chars[].role</code>）；「角色总数」含主角、候补与居民。</p>
    ${tbl(['作品', '结婚候补', '角色总数'], marryRows, { colw: ['9rem', '5rem', '5rem'], leftFirst: true })}

    <h2 class="h2">三、内容体量（真实条数）</h2>
    <p class="p">料理条数为各作料理／药学数据表条目数：RF3／RF4／RF5 此处是料理主表（药品单列、未计入）；RF1／RF2／RFF／RFO 的主表含药学，数字略高。<b>RF3 SP／RF4 SP 与对应本体共用同一份数据</b>，条数与本体一致。鱼与钓物种数为各作钓鱼表的去重鱼名数（海洋 rfo 取钓点表展开去重，共 29 种；<b>龙之天地 azuma 取钓鱼攻略 <code>SPOT_AZUMA.fishes</code>，共 42 种</b>）。这些数字只说明「这一作有多少可查的条目」，不代表品质高低。</p>
    ${tbl(['作品', '料理条数', '鱼与钓物种数'], scaleRows, { colw: ['9rem', '6rem', '8rem'], leftFirst: true })}

    <h2 class="h2">四、系统机制差异（逐作核实）</h2>

    <h3 class="h3">钓鱼</h3>
    <ul class="ul">
        <li class="li"><b>RF4／RF5</b>：有「钓点 × 季节 × 概率」的解包表，能做成百分比矩阵（第 119 次核实）。</li>
        <li class="li"><b>RF1／RF2／RF3／边境</b>：是「钓点 × 鱼」目录，原表<b>没有逐钓点出现率</b>，只做索引不推概率（第 119／120 次）。</li>
        <li class="li"><b>海洋（RFO）</b>：钓点表 <b>257 条</b>「地点 × 区域 × 季节 × 时段」记录，覆盖 <b>20 个地点</b>（按「地点＋区域」拆为 39 处），去重鱼名 <b>29 种</b>，每条带出现概率（第 120 次收录，第 147 次校正条数）。</li>
        <li class="li"><b>龙之天地（azuma）</b>：<b>有钓鱼</b>——钓鱼攻略收录 <b>42 种鱼／钓物</b>，附买价／卖价／钓点（含季节、雨天限定）／在售商店／解锁条件；表是「鱼 → 钓点」目录，<b>没有逐钓点出现率</b>。另有「鱼类图鉴」任务按累计 10／20／30／40／45 档给钓竿与料理，全图鉴给鱼笼（第 122 次收录数据，第 147 次更正「无钓鱼」的错误说法）。</li>
    </ul>

    <h3 class="h3">农作</h3>
    <ul class="ul">
        <li class="li"><b>RF1～5／边境</b>：传统种地——锄头、洒水壶、买种子、按季播收。</li>
        <li class="li"><b>海洋（RFO）</b>：<b>无锄头／洒水壶／买种子</b>，种地靠「精灵杖魔法播种」＋岛上对应宠物才真种（第 139 次）。</li>
        <li class="li"><b>龙之天地（azuma）</b>：动作 RPG，农作页有专属分支（82 行）但机制与前七作根本不同（第 125 次）。</li>
    </ul>

    <h3 class="h3">魔物收服</h3>
    <ul class="ul">
        <li class="li"><b>RF1</b>：靠掉落物＋雇佣能力，<b>没有「喜好道具」这一栏</b>（第 136 次）。</li>
        <li class="li"><b>RF2／边境</b>：靠友好手套／毛刷刷到固定次数收服（第 136 次）。</li>
        <li class="li"><b>海洋（RFO）</b>：旧四作里<b>唯一给「喜好作物」</b>的（第 136 次）。</li>
        <li class="li"><b>RF4／RF5／azuma</b>：各有收服／骑乘体系（azuma 的魔物喜好与可骑乘已单独成页）。</li>
    </ul>

    <h3 class="h3">符文／魔法</h3>
    <ul class="ul">
        <li class="li"><b>RF4</b>：有独立「符文能力」系统——效果装到武器符文槽、魔法书能升级 Lv（第 140 次新开 <code>rune</code> 页，54 个符文）。</li>
        <li class="li"><b>龙之天地（azuma）</b>：改「守护者（Guardians）」系统，火／水／光／地元素关联，无 RF4／RF5 式数值抗性表（第 132 次）。</li>
        <li class="li"><b>RF1～3</b>：符文文字／符文瓶颈等系列共通设计。</li>
    </ul>

    <h3 class="h3">节日与战斗</h3>
    <ul class="ul">
        <li class="li"><b>节日</b>：七作全覆盖年度节日日程；azuma 无传统节日，只列名称（第 132 次）。</li>
        <li class="li"><b>属性抗性</b>：量纲各作不同——一代点数、二代克制、三代倍率、四五代百分比，<b>跨作直接比数字无意义</b>（第 ③ 类缺口核实）。</li>
    </ul>

    <h2 class="h2">五、结婚候补名单（真实姓名）</h2>
    <p class="p">仅列本站数据文件 <code>chars[].role</code> 标为「花嫁候补／花婿候补」的角色真实姓名，与表二的「结婚候补」计数一一对应。RFO 的索妮娅同时是女主角兼候补，按数据原文列入花嫁列；azuma 的花婿候补多为东国诸神，属该作设定。</p>
    ${tbl(['作品', '花嫁候补', '花婿候补'], candRows, { colw: ['7.5rem', '', ''], left: [1, 2] })}

    <h2 class="h2">六、制作与世界观核心</h2>
    <p class="p">开发商／发行商取自数据文件 <code>GAMES</code> 的 <code>dev</code>／<code>pub</code>；「世界观核心」取各作的幻龙或神明设定（<code>god</code> 字段）。这部分是系列「并排看」的制作与设定背景，与前面几节的玩法机制互为参照。</p>
    ${tbl(['作品', '开发商', '发行商', '世界观核心'], prodRows, { colw: ['7rem', '6rem', '8rem', ''], left: [3] })}

    <h2 class="h2">七、原名与主角结构</h2>
    <p class="p">「日文原名／英文原名」取数据文件 <code>GAMES</code> 的 <code>jp</code>／<code>en</code>；「一句话定位」取各作 <code>tagline</code>。「主角结构」由 <code>hero</code> 字段与主角人数派生：含「／」为开局可选男／女（RF4 起），海洋（RFO）为数据原文记载的「一体两魂」，RF2 因含父代＋子代共三名主角列为跨代多主角，其余为固定单人。均不臆造。</p>
    ${tbl(['作品', '日文原名', '英文原名', '一句话定位', '主角结构'], nameRows, { colw: ['6rem', '10rem', '10rem', '', '9.5rem'], left: [3] })}

    <div class="note">本页只做「并排看」与「逐作核实发现」的汇总，不构成跨作评测。某项在某作显示 0 或空白，多半是「该作此系统与前作机制不同、或本站尚未收录」，不是「没有」。具体数据请进对应作品的相关条目页查看。</div>
    `;
}

