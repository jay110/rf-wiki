/* ============================================================
   路由与视图
   ============================================================ */

const LSKEY = 'rf_wiki_v1';

const S = {
    game: 'rf4',
    nick: '',
    cur: { s: 0, d: 1 },   // 游戏内当前日期
    bday: { s: 0, d: 1 },  // 主人公生日
    alert: 3,              // 提前提醒天数
};

function loadState() {
    try {
        const raw = localStorage.getItem(LSKEY);
        if (!raw) return;
        const o = JSON.parse(raw);
        if (o.game && GAMES.some(g => g.id === o.game)) S.game = o.game;
        if (typeof o.nick === 'string') S.nick = o.nick;
        if (o.cur && typeof o.cur.s === 'number' && typeof o.cur.d === 'number') S.cur = o.cur;
        if (o.bday && typeof o.bday.s === 'number' && typeof o.bday.d === 'number') S.bday = o.bday;
        if (typeof o.alert === 'number') S.alert = o.alert;
    } catch (e) { /* 忽略损坏的本地数据 */ }
}

function saveState() {
    try { localStorage.setItem(LSKEY, JSON.stringify(S)); } catch (e) { }
}

function cur() {
    return GAMES.find(g => g.id === S.game) || GAMES[0];
}

/* 平台短名，用于速览格这种窄容器 */
function platShort(p) {
    return p
        .replace(/Nintendo 3DS/g, '3DS')
        .replace(/Nintendo DS/g, 'NDS')
        .replace(/PlayStation 3/g, 'PS3')
        .replace(/PlayStation 4/g, 'PS4')
        .replace(/Xbox One/g, 'XB1')
        .replace(/Xbox Series X\|S/g, 'XsX')
        .replace(/Switch 2/g, 'NS2')
        .replace(/Windows/g, 'PC')
        .split('（')[0]
        .split('／')[0]
        .trim();
}

/* ---------- 日期工具：每季 30 天，一年 120 天 ---------- */
const YEAR_DAYS = 120;
function absDay(p) { return p.s * 30 + (p.d - 1); }
function diffDays(from, to) { return ((absDay(to) - absDay(from)) % YEAR_DAYS + YEAR_DAYS) % YEAR_DAYS; }
function fmtDay(p) { return `${SEASON_NAMES[p.s]} ${p.d} 日`; }

/* ---------- 路由解析 ---------- */
function parseRoute() {
    let h = location.hash.replace(/^#/, '');
    if (!h || h === '/') return { name: 'home', args: [] };
    const parts = h.split('/').filter(Boolean).map(decodeURIComponent);
    return { name: parts[0], args: parts.slice(1) };
}

function go(path) {
    if (location.hash === '#' + path) render();
    else location.hash = path;
}

/* ============================================================
   视图
   ============================================================ */

/* 从更新日志页里取最新的几条标题，给主页「最近更新」用。
   直接读 changelog 的正文，不另维护一份列表，免得又忘同步。 */
function latestUpdates(n) {
    try {
        const p = PAGE_MAP['changelog'];
        if (!p) return [];
        const hs = (p.body() || '').match(/<h2[^>]*>([\s\S]*?)<\/h2>/g) || [];
        return hs.slice(0, n).map(s => {
            let t = stripTags(s, true).replace(/^\d{4}-\d{1,2}-\d{1,2}[\s　]*/, '');
            if (t.length > 42) t = t.slice(0, 40) + '…';
            return t;
        }).filter(Boolean);
    } catch (e) { return []; }
}

/* 站点主页（#/）：站点层面的介绍与入口，不是某一部作品的攻略目录。
   攻略目录在 #/wiki，两者分开，跟版式参考站的结构一致。 */
function viewWelcome() {
    const g = cur();
    const chars = GAMES.reduce((s, x) => s + (x.chars ? x.chars.length : 0), 0);
    const ups = latestUpdates(3);

    return `
    <div class="wcover">
        <div class="wcover-jp">ルーンファクトリー</div>
        <div class="wcover-name">符文工房攻略百科</div>
        <div class="wcover-en">RUNE FACTORY WIKI</div>
        <div class="wcover-sub">非官方中文资料站</div>
        <div class="wcover-stat">
            <div><b>${GAMES.length}</b><span>部作品</span></div>
            <div><b>${PAGES.length}</b><span>个条目</span></div>
            <div><b>${chars}</b><span>位角色</span></div>
        </div>
        <a class="wcover-go" href="#/wiki">进入攻略　›</a>
    </div>

    <div class="section-title"><span>选择作品</span><span class="en">TITLES</span></div>
    <div class="wgrid">
        ${GAMES.map(x => `
            <a class="wcard${x.id === g.id ? ' cur' : ''}" href="#/switch/${x.id}"
               style="background:linear-gradient(140deg, ${x.grad[0]}, ${x.grad[1]})">
                <div class="wcard-no">${x.no}</div>
                <div class="wcard-name"><span class="wpre">符文工房</span>${x.name.replace(/^符文工房\s*/, '')}</div>
                <div class="wcard-stage">${x.stage}</div>
                <div class="wcard-meta">${x.date.slice(0, 4)}　${platShort(x.plat)}</div>
            </a>`).join('')}
    </div>

    ${ups.length ? `
    <div class="section-title"><span>最近更新</span><span class="en">UPDATES</span></div>
    <div class="wlist">
        ${ups.map(t => `<div class="witem">${t}</div>`).join('')}
        <a class="wmore" href="#/page/changelog">查看完整更新日志　›</a>
    </div>` : ''}

    <div class="section-title"><span>关于本站</span><span class="en">ABOUT</span></div>
    <div class="wabout">
        <p>玩家整理的《符文工房》系列中文资料站，按作品分册收录世界观、牧场生活、战斗与生产系统、物品与魔物数据。每部作品的数值互相独立，<b>没核实的字段一律留空</b>，不拿别作的数凑。</p>
        <div class="wrow"><span class="wk">数据来源</span><span class="wv">各作解包表格、biligame 符文工厂 wiki、Marvelous 官方作品页</span></div>
        <div class="wrow"><span class="wk">版式参考</span><span class="wv"><a class="link" href="https://wiki.mineraltown.net" target="_blank" rel="noopener">矿石镇的攻略百科</a>（WTFPL）</span></div>
        <div class="wrow"><span class="wk">源码</span><span class="wv"><a class="link" href="https://github.com/jay110/rf-wiki" target="_blank" rel="noopener">jay110/rf-wiki</a>　纯静态，可离线运行</span></div>
        <div class="wrow"><span class="wk">声明</span><span class="wv">非官方粉丝站，与 Marvelous Inc. 无隶属关系</span></div>
    </div>
    <div class="copyright">
        <div>符文工房攻略百科　·　非官方中文资料站</div>
        <div>收录 ${GAMES.length} 部作品　/　${PAGES.length} 个条目　/　${chars} 位角色</div>
        <div style="margin-top:0.4rem">本站为玩家整理性质，与 Marvelous Inc. 无隶属关系。所有游戏名称、角色名称版权归原权利人所有。</div>
    </div>`;
}

function viewHome(g) {
    const groups = GROUPS.map(grp => {
        const items = PAGES.filter(p => p.group === grp.key && pageVis(p, g));
        if (!items.length) return '';
        return `
        <div class="section-title">
            <span>${grp.title}</span><span class="en">${grp.en}</span>
        </div>
        <div class="menu">
            ${items.map(p => `
                <a class="item" href="#/page/${p.key}">
                    <div class="item-icon">${icon(p.icon)}</div>
                    <div class="item-text">${p.title}</div>
                </a>`).join('')}
        </div>`;
    }).join('');

    return `
    <div class="cover" style="background:linear-gradient(140deg, ${g.grad[0]}, ${g.grad[1]})">
        <div class="cover-jp">${g.jp}</div>
        <div class="cover-name">${g.name}</div>
        <div class="cover-en">${g.en}</div>
        <div class="cover-meta">
            <span>${g.plat}</span>
            <span>${g.date}</span>
        </div>
    </div>
    <div class="quick">
        <div><div class="qk">发售</div><div class="qv">${g.date.replace(/-/g, '.')}</div></div>
        <div><div class="qk">平台</div><div class="qv">${platShort(g.plat)}</div></div>
        <div><div class="qk">舞台</div><div class="qv">${g.stage}</div></div>
        <div><div class="qk">主角</div><div class="qv">${g.hero}</div></div>
    </div>
    <div class="search">
        <input id="q" type="search" autocomplete="off" placeholder="搜索条目，如「生命果冻」「锻造」" />
        <button id="qbtn">搜索</button>
    </div>
    <div class="qsug" id="qsug"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:0.2rem 1rem 0">
        <span style="font-size:0.68rem;color:#a4aeb4;letter-spacing:0.04em">
            ${g.stageJp}　·　${g.heroJp}
        </span>
        <a href="#/games" style="font-size:0.7rem;color:#198d44">切换作品 ›</a>
    </div>
    ${groups}
    <div class="wback"><a class="link" href="#/">‹ 站点主页</a></div>
    ${footer(g)}
    `;
}

function footer(g) {
    return `
    <div class="copyright">
        <div>符文工房攻略百科　·　非官方中文资料站</div>
        <div>当前收录：${g.name}　|　共 ${PAGES.filter(p => pageVis(p, g)).length} 个条目 / ${g.chars.length} 位角色</div>
        <div style="margin-top:0.4rem">本站为玩家整理性质，与 Marvelous Inc. 无隶属关系。所有游戏名称、角色名称版权归原权利人所有。</div>
    </div>`;
}

function viewCat(key) {
    const grp = GROUPS.find(x => x.key === key);
    if (!grp) return viewError('没有这个分类');
    const g = cur();
    const items = PAGES.filter(p => p.group === key && pageVis(p, g));
    if (!items.length) return viewError('这个分类下当前作品还没有条目');
    return `
    <div class="section-title"><span>${grp.title}</span><span class="en">${grp.en}</span></div>
    <div class="list">
        ${items.map(p => `
            <a class="list-item" href="#/page/${p.key}">
                <div class="li-ico">${icon(p.icon)}</div>
                <div class="list-item-title">${p.title}</div>
                ${icon('chev', 'chev')}
            </a>`).join('')}
    </div>`;
}

function viewPage(key) {
    const p = PAGE_MAP[key];
    if (!p) return viewError('没有这个条目');
    const g = cur();
    const grp = GROUPS.find(x => x.key === p.group);
    if (!pageVis(p, g)) {
        return `
    <div class="content">
        <div class="head">
            <div class="h1">${p.title}</div>
            <div class="time">${grp.title}　·　仅收录于《符文工房5》</div>
        </div>
        <p class="p">这一条的内容只对《符文工房5》成立，当前作品是<b>${g.name}</b>，所以没有可显示的正文——与其拿别作的数值凑一段，不如直接留白。</p>
        <div class="note">玩家整理的习惯是「没核实的宁可不写」。其他作品的同类内容（<b>${grp.title}</b> 一栏下的共通机制）仍然可以正常查看。</div>
        <p class="p">
            <a class="link" href="#/switch/rf5">› 切换到《符文工房5》查看本条目</a><br>
            <a class="link" href="#/cat/${grp.key}">› 回到「${grp.title}」目录</a>
        </p>
    </div>
    ${footer(g)}`;
    }
    return `
    <div class="content">
        <div class="head">
            <div class="h1">${p.title}</div>
            <div class="time">${grp.title}　·　更新于 2026年10月27日</div>
        </div>
        ${p.body(g)}
        <div class="hr"></div>
        <p class="p gray" style="font-size:0.74rem;line-height:1.9">
            本页对应作品：${g.name}（${g.plat}）。<br>
            文中机制为系列共通设计，个别数值与系统差异以游戏内为准。
        </p>
        <p class="p"><a class="link" href="#/page/series">› 查看系列作品一览</a></p>
    </div>
    ${footer(g)}`;
}

/* 从搜索结果跳进来时，把那一条行标出来并滚到眼前。
   索引里的名字可能取自第二格（首格是行号时），所以逐格比对。 */
function focusRow(name) {
    const norm = s => (s || '').replace(/\s+/g, '');
    const want = norm(name);
    const trs = document.querySelectorAll('#main .table tbody tr');
    for (const tr of trs) {
        const kids = tr.children || [];
        for (const c of kids) {
            if (norm(c.textContent) === want) {
                tr.classList.add('hit-row');
                /* 等这一帧布局完成再滚，否则刚写入 innerHTML 时位置还算不出来 */
                const defer = typeof requestAnimationFrame === 'function'
                    ? requestAnimationFrame : (f) => setTimeout(f, 16);
                defer(() => {
                    try { tr.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { }
                });
                setTimeout(() => tr.classList.remove('hit-row'), 3200);
                return;
            }
        }
    }
}

function viewResident(gameId, role) {
    const g = GAMES.find(x => x.id === gameId) || cur();
    const roles = ['全部', '主角', '花嫁候补', '花婿候补', '居民', '关键角色'];
    const active = role || '全部';
    const list = g.chars.filter(c => active === '全部' || c.role === active);

    return `
    <div class="section-title"><span>${g.short}　居民</span><span class="en">RESIDENTS</span></div>
    <div class="filter-bar">
        ${roles.map(r => `<a class="filter-btn ${r === active ? 'on' : ''}"
            href="#/resident/${g.id}/${encodeURIComponent(r)}">${r}</a>`).join('')}
    </div>
    ${list.length ? `<div class="menu-resident">
        ${list.map(c => {
            const i = g.chars.indexOf(c);
            return `<a class="resident" href="#/char/${g.id}/${i}">
                <div class="resident-icon" style="background:linear-gradient(150deg,
                    hsl(${(g.hue + i * 37) % 360} 42% 58%), hsl(${(g.hue + i * 37 + 26) % 360} 46% 44%))">
                    ${c.name.slice(0, 1)}
                </div>
                <div class="resident-text">${c.name}</div>
                <div class="resident-role">${c.role}</div>
            </a>`;
        }).join('')}
    </div>` : `<div class="empty">这个分类下暂未收录角色</div>`}
    ${g.chars.length <= 3 ? `<div class="content" style="margin-top:0;padding-top:0">
        <div class="note">《${g.short}》的角色名单尚未补全，目前只收录了与主线直接相关的几位。
        本站的原则是「没核实的宁可不写」——与其填一堆可能错的名字，不如留白，等有可靠来源再补。</div>
    </div>` : ''}
    <div class="copyright">
        <div>角色名单与声优取自 Marvelous 官方作品页 / 世嘉《符文工厂3豪华版》官网</div>
        <div>未核实的字段留空，不做推测填写</div>
    </div>`;
}

function viewChar(gameId, idx) {
    const g = GAMES.find(x => x.id === gameId) || cur();
    const c = g.chars[Number(idx)];
    if (!c) return viewError('没有这个角色');
    const hue = (g.hue + g.chars.indexOf(c) * 37) % 360;
    const rows = [
        ['原名', c.jp || '—'],
        ['身份', c.role],
        ['声优', c.cv || '未收录'],
        ['生日', c.bday || '未收录'],
        ['所属', `${g.short}　${g.stage}`],
    ];
    return `
    <div class="portrait">
        <div class="portrait-avatar" style="background:linear-gradient(150deg,
            hsl(${hue} 42% 58%), hsl(${(hue + 26) % 360} 46% 44%))">${c.name.slice(0, 1)}</div>
        <div class="portrait-name">${c.name}</div>
        <div class="portrait-jp">${c.jp || ''}</div>
    </div>
    <div class="kv">
        ${rows.map(([k, v]) => `<div class="kv-row"><div class="kv-k">${k}</div><div class="kv-v">${v}</div></div>`).join('')}
    </div>
    <div class="content">
        <h2 class="h2">简介</h2>
        <p class="p">${c.note || '暂无说明。'}</p>
        ${c.bday ? `<div class="key">生日：<b>${c.bday}</b>　·　生日当天送礼，好感加成显著。</div>`
            : `<div class="note">生日未收录。本站不填写未经核实的日期。</div>`}
        <p class="p"><a class="link" href="#/resident/${g.id}/全部">‹ 返回 ${g.short} 居民一览</a></p>
    </div>`;
}

function viewGames() {
    return `
    <div class="section-title"><span>选择作品</span><span class="en">TITLES</span></div>
    <div class="game-grid">
        ${GAMES.map(g => `
            <a class="game-card ${g.id === S.game ? 'cur' : ''}"
               href="#/switch/${g.id}"
               style="background:linear-gradient(140deg, ${g.grad[0]}, ${g.grad[1]})">
                <div class="gc-no ${g.no.length > 1 ? 'long' : ''}">${g.no}</div>
                <div class="gc-name">${g.name}</div>
                <div class="gc-sub">${g.plat.split('／')[0]}　${g.date.slice(0, 7)}</div>
            </a>`).join('')}
    </div>
    <div class="copyright">
        <div>切换作品后，攻略目录与居民名单会一并切换</div>
        <div>系列共 ${GAMES.length} 部作品收录于本站</div>
    </div>`;
}

function viewTodo() {
    const g = cur();
    const withBday = g.chars.filter(c => c.bday);
    const parsed = withBday.map(c => {
        const m = c.bday.match(/([春夏秋冬])\s*(\d+)/);
        if (!m) return null;
        return { c, s: SEASON_NAMES.indexOf(m[1]), d: Number(m[2]) };
    }).filter(Boolean);

    const upcoming = parsed
        .map(o => ({ ...o, left: diffDays(S.cur, { s: o.s, d: o.d }) }))
        .filter(o => o.left <= S.alert)
        .sort((a, b) => a.left - b.left);

    const bySeason = SEASON_NAMES.map((nm, si) => {
        const list = parsed.filter(o => o.s === si).sort((a, b) => a.d - b.d);
        if (!list.length) return '';
        return `
        <div class="section-title"><span>${nm}季生日</span><span class="en">SEASON ${si + 1}</span></div>
        <div class="todo-list">
            ${list.map(o => `
                <a class="todo-item" href="#/char/${g.id}/${g.chars.indexOf(o.c)}">
                    <div class="todo-badge">
                        <div class="tb-d">${o.d}</div>
                        <div class="tb-s">${nm}</div>
                    </div>
                    <div class="todo-body">
                        <div class="todo-name">${o.c.name}</div>
                        <div class="todo-meta">${o.c.role}${o.c.cv ? '　·　' + o.c.cv : ''}</div>
                    </div>
                    <div class="todo-days">${o.s === S.cur.s && o.d === S.cur.d ? '今天' : ''}</div>
                </a>`).join('')}
        </div>`;
    }).join('');

    const nextOne = parsed.length
        ? parsed.map(o => ({ ...o, left: diffDays(S.cur, { s: o.s, d: o.d }) }))
            .sort((a, b) => a.left - b.left)[0]
        : null;

    return `
    <div class="todo-head">
        <div>
            <div class="td-main">${S.nick ? S.nick + '　·　' : ''}第 1 年　${fmtDay(S.cur)}</div>
            <div class="td-sub">提前 ${S.alert} 天提醒　·　在「设置」里修改日期</div>
        </div>
        <div class="td-season">${SEASON_NAMES[S.cur.s]}</div>
    </div>

    ${upcoming.length ? `
        <div class="section-title"><span>即将到来</span><span class="en">UPCOMING</span></div>
        <div class="todo-list">
            ${upcoming.map(o => `
                <div class="todo-item">
                    <div class="todo-badge ${o.left === 0 ? 'today' : o.left <= 2 ? 'soon' : ''}">
                        <div class="tb-d">${o.left === 0 ? '今' : o.left}</div>
                        <div class="tb-s">${o.left === 0 ? '天' : '天后'}</div>
                    </div>
                    <div class="todo-body">
                        <div class="todo-name">${o.c.name} 的生日</div>
                        <div class="todo-meta">${fmtDay({ s: o.s, d: o.d })}　·　${o.c.role}</div>
                    </div>
                    <a href="#/char/${g.id}/${g.chars.indexOf(o.c)}" class="todo-days" style="color:#198d44">查看</a>
                </div>`).join('')}
        </div>` : `
        <div class="section-title"><span>即将到来</span><span class="en">UPCOMING</span></div>
        <div class="todo-list">
            <div class="todo-item">
                <div class="todo-badge soon">
                    <div class="tb-d">${nextOne ? nextOne.left : '—'}</div>
                    <div class="tb-s">${nextOne ? '天后' : '无'}</div>
                </div>
                <div class="todo-body">
                    <div class="todo-name">${nextOne ? '下一个生日：' + nextOne.c.name : '本作暂无已收录的生日'}</div>
                    <div class="todo-meta">${nextOne
                ? fmtDay({ s: nextOne.s, d: nextOne.d }) + '　·　超出提前提醒范围，可在设置里调大'
                : '角色生日未收录，本站不做推测填写'}</div>
                </div>
            </div>
            <div class="empty" style="padding:1.6rem 1rem 1rem">未来 ${S.alert} 天内没有生日</div>
        </div>`}

    ${bySeason}

    <div class="section-title"><span>节日</span><span class="en">FESTIVALS</span></div>
    <div class="content" style="margin-top:0.4rem">
        <div class="note">本站尚未收录《${g.short}》的节日日期表——各作节日名称与日期差异很大，且与原版《牧场物语》不通用。与其填一张可能出错的时间表，不如先记机制：</div>
        <ul class="ul">
            <li class="li"><b>一年四季，每季 30 天</b>，节日固定在特定日期，错过要等一年。</li>
            <li class="li"><b>竞技型节日</b>（赛马、料理大赛、钓鱼大会）要提前一季准备参赛品。</li>
            <li class="li"><b>恋爱型节日</b>需要提前邀请，关系不够会被拒绝。</li>
            <li class="li">游戏内日历（家里的日历 / 菜单）是唯一权威来源。</li>
        </ul>
        <p class="p"><a class="link" href="#/page/festival">› 节日机制详解</a></p>
    </div>
    ${footer(g)}`;
}

function viewSetting() {
    const g = cur();
    return `
    <div class="setting">
        <div class="setting-group">
            <div class="setting-group-title">作品</div>
            <div class="setting-row">
                <div>
                    <div class="setting-label">当前作品</div>
                    <div class="setting-hint">影响攻略目录与居民名单</div>
                </div>
                <a class="setting-value" href="#/games" style="color:#198d44">${g.short} ›</a>
            </div>
        </div>

        <div class="setting-group">
            <div class="setting-group-title">个人信息</div>
            <div class="setting-row">
                <div class="setting-label">昵称</div>
                <input id="nick" type="text" value="${S.nick}" placeholder="可不填" maxlength="12" />
            </div>
            <div class="setting-row">
                <div>
                    <div class="setting-label">主人公生日</div>
                    <div class="setting-hint">用于提醒自己的生日</div>
                </div>
                <div class="chip-row">
                    ${SEASON_NAMES.map((nm, i) =>
                        `<button class="chip season-${i} ${S.bday.s === i ? 'on' : ''}" data-bs="${i}">${nm}</button>`).join('')}
                </div>
            </div>
            <div class="setting-row">
                <div class="setting-label">日期</div>
                <div class="day-pick">
                    <button data-step="bday" data-dir="-1" aria-label="前一天">−</button>
                    <input id="bdayD" type="number" min="1" max="30" value="${S.bday.d}" />
                    <button data-step="bday" data-dir="1" aria-label="后一天">＋</button>
                </div>
            </div>
        </div>

        <div class="setting-group">
            <div class="setting-group-title">提醒</div>
            <div class="setting-row">
                <div>
                    <div class="setting-label">游戏内当前日期</div>
                    <div class="setting-hint">决定「即将到来」从哪天算起</div>
                </div>
                <div class="chip-row">
                    ${SEASON_NAMES.map((nm, i) =>
                        `<button class="chip season-${i} ${S.cur.s === i ? 'on' : ''}" data-cs="${i}">${nm}</button>`).join('')}
                </div>
            </div>
            <div class="setting-row">
                <div class="setting-label">日期</div>
                <div class="day-pick">
                    <button data-step="cur" data-dir="-1" aria-label="前一天">−</button>
                    <input id="curD" type="number" min="1" max="30" value="${S.cur.d}" />
                    <button data-step="cur" data-dir="1" aria-label="后一天">＋</button>
                </div>
            </div>
            <div class="setting-row">
                <div>
                    <div class="setting-label">提前提醒天数</div>
                    <div class="setting-hint">生日前多少天开始提示</div>
                </div>
                <div class="chip-row">
                    ${[1, 3, 7, 14].map(n =>
                        `<button class="chip ${S.alert === n ? 'on' : ''}" data-al="${n}">${n} 天</button>`).join('')}
                </div>
            </div>
        </div>

        <div class="setting-group">
            <div class="setting-group-title">其他</div>
            <div class="setting-row">
                <div>
                    <div class="setting-label">清除本地数据</div>
                    <div class="setting-hint">恢复默认作品与日期</div>
                </div>
                <button class="btn btn-danger" id="reset">清除</button>
            </div>
            <div class="setting-row">
                <div class="setting-label">版本</div>
                <div class="setting-value">v1.1.0 · 2026-10-28</div>
            </div>
        </div>

        <div class="copyright">
            <div>符文工房攻略百科</div>
            <div>非官方玩家资料站，与 Marvelous Inc. 无隶属关系。</div>
            <div>数据保存在本机浏览器，不联网、不上传。</div>
        </div>
    </div>`;
}

/* ------------------------------------------------------------
   全站条目搜索
   只匹配页面标题远远不够：站内四千多行数据表（武器·料理·素材·
   魔物·鱼类…）里的任何具体名字，按标题都搜不出来。这里把每页
   渲染出的 <tr> 抽成条目索引，首格作名称、整行作检索文本；命中
   后跳到该页并高亮那一行。索引按作品惰性构建（实测 25~35ms），
   构建一次后缓存在内存里，换作品才重建。
   ------------------------------------------------------------ */
const IDXCACHE = {};
const IDXORDER = [];

/* tight=true 时标签直接删掉，不退化成空格。
   条目名必须这么取：浏览器的 textContent 不插空格，名称若多出空格，
   跳转过来按名字找行就会对不上，高亮失效。 */
function stripTags(s, tight) {
    return (s || '')
        .replace(/<[^>]*>/g, tight ? '' : ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#x?[0-9a-f]+;/gi, '')
        .replace(/\s+/g, ' ').trim();
}

function buildIndex(g) {
    if (IDXCACHE[g.id]) return IDXCACHE[g.id];
    const list = [];
    for (const p of PAGES) {
        if (!pageVis(p, g)) continue;
        let h = '';
        try { h = p.body(g) || ''; } catch (e) { continue; }
        const trs = h.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
        if (!trs) continue;
        for (const tr of trs) {
            if (/<th[\s>]/.test(tr)) continue;
            const cells = tr.match(/<td[^>]*>[\s\S]*?<\/td>/g);
            if (!cells || !cells.length) continue;
            const ctext = cells.map(c => stripTags(c));
            /* 有些表首格是行号（系列一览、抗性表），拿它当名字毫无意义，
               退一格取真正的内容 */
            let ci = 0;
            if (/^\d{1,4}$/.test(ctext[0]) && ctext.length > 1) ci = 1;
            const name = ctext[ci].replace(/\s+/g, ' ').trim();
            if (!name || name === '—' || name === '-' || name === '?') continue;
            const text = stripTags(tr);
            list.push({
                k: p.key, t: p.title, i: p.icon, grp: p.group,
                n: name, cells: ctext, s: text.toLowerCase(), raw: text
            });
        }
    }
    IDXCACHE[g.id] = list;
    /* 只留最近两作：十作全缓存要几十 MB，手机上不值当 */
    IDXORDER.push(g.id);
    while (IDXORDER.length > 2) {
        const old = IDXORDER.shift();
        if (old !== g.id) delete IDXCACHE[old];
    }
    return list;
}

/* 所有词都要命中；首词落在名称里比落在数值里得分高得多 */
function scoreEntry(e, words) {
    for (const w of words) if (!e.s.includes(w)) return 0;
    const n = e.n.toLowerCase(), head = words[0];
    let sc = 30;
    if (n === head) sc = 100;
    else if (n.indexOf(head) === 0) sc = 82;
    else if (n.includes(head)) sc = 66;
    if (words.every(w => n.includes(w))) sc += 8;
    return sc;
}

function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markKw(text, head) {
    if (!head) return escHtml(text);
    const low = text.toLowerCase();
    let out = '', i = 0, j;
    while ((j = low.indexOf(head, i)) >= 0) {
        out += escHtml(text.slice(i, j)) + '<mark>' + escHtml(text.slice(j, j + head.length)) + '</mark>';
        i = j + head.length;
    }
    return out + escHtml(text.slice(i));
}

function snippetOf(text, head) {
    const i = text.toLowerCase().indexOf(head);
    if (i < 0) return text.slice(0, 48) + (text.length > 48 ? '…' : '');
    const a = Math.max(0, i - 16), b = Math.min(text.length, i + head.length + 30);
    return (a > 0 ? '…' : '') + text.slice(a, b) + (b < text.length ? '…' : '');
}

/* 搜索主逻辑：同一名字在多个页面重复出现时合并成一条，附页面标签与
   出现次数，免得「生命果冻」一次刷出四条同名结果；多词全部落空时
   退回首个关键词，好过直接报「没有找到」。 */
function searchEntries(g, words) {
    const idx = buildIndex(g);
    const run = ws => {
        const head = ws[0] || '';
        const hits = [];
        for (const e of idx) {
            const sc = scoreEntry(e, ws);
            if (!sc) continue;
            /* 首格是日文、中文在第二格的表（译名对照），
               展示成用户搜的那个名字才有意义 */
            let name = e.n;
            if (head && !name.toLowerCase().includes(head) && e.cells) {
                const alt = e.cells.find(c => c && c.toLowerCase().includes(head));
                if (alt) name = alt;
            }
            hits.push([sc, name === e.n ? e : Object.assign({}, e, { n: name })]);
        }
        return hits;
    };
    let used = words, relaxed = false;
    let hits = run(used);
    /* 多词搜索常常是「想找剑类里攻击高的」这种意图，而表头不在行内，
       真去 AND 匹配只会剩噪声。全词命中太少时改用首词，并给出提示。 */
    if (words.length > 1 && hits.length < 3) {
        const solo = run([words[0]]);
        if (solo.length > Math.max(3, hits.length * 3)) {
            used = [words[0]];
            relaxed = true;
            hits = solo;
        }
    }
    const merged = new Map();
    for (const [sc, e] of hits) {
        const m = merged.get(e.n);
        if (m) {
            m.c++;
            if (!m.pages.some(x => x.k === e.k)) m.pages.push({ k: e.k, t: e.t });
            if (sc > m.sc) { m.sc = sc; m.raw = e.raw; m.first = e; }
        } else {
            merged.set(e.n, { sc, n: e.n, raw: e.raw, c: 1, first: e, pages: [{ k: e.k, t: e.t }] });
        }
    }
    const list = [...merged.values()].sort((a, b) => b.sc - a.sc || a.n.length - b.n.length);
    return { list, relaxed, used, rows: hits.length };
}

function viewSearch(q) {
    const raw = (q || '').trim();
    const kw = raw.toLowerCase();
    const g = cur();
    const words = kw.split(/\s+/).filter(Boolean);

    const box = `
    <div class="search search-inline">
        <input id="q" type="search" value="${escHtml(raw)}"
               placeholder="搜条目名、素材、数值，如「生命果冻」「锻造」" />
        <button id="qbtn">搜索</button>
    </div>`;

    if (!words.length) {
        return `
        <div class="section-title"><span>搜索</span><span class="en">SEARCH</span></div>
        ${box}
        <div class="empty">输入关键词开始搜索<br>
            <span style="font-size:0.74rem">可以搜物品名（「生命果冻」）、页面名（「锻造」），也可以多个词一起搜（「剑 攻击」）</span>
        </div>`;
    }

    /* ① 页面级命中：标题 */
    const pgHit = PAGES.filter(p => pageVis(p, g) && (
        p.title.toLowerCase().includes(kw) || (p.en || '').toLowerCase().includes(kw)));

    /* ② 条目级命中：数据表每一行 */
    const { list, relaxed, used, rows } = searchEntries(g, words);
    const head = used[0];
    const LIMIT = 80;
    const shown = list.slice(0, LIMIT);
    const total = list.length;

    /* ③ 条目集中出现的页面，补进「页面」一栏 */
    const cnt = new Map();
    for (const it of list) for (const pg of it.pages) cnt.set(pg.k, (cnt.get(pg.k) || 0) + 1);
    const extra = [...cnt.entries()]
        .filter(([k]) => !pgHit.some(p => p.key === k))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k, n]) => ({ p: PAGE_MAP[k], n }))
        .filter(x => x.p);

    return `
    <div class="section-title"><span>搜索「${escHtml(raw)}」</span><span class="en">${total} ENTRIES</span></div>
    ${box}
    ${relaxed ? `<div class="sres-tip">同时含有「${escHtml(words.join('」「'))}」的条目没有，下面按「${escHtml(head)}」单独匹配。</div>` : ''}
    ${(pgHit.length || extra.length) ? `
        <div class="sres-head">页面　<span class="sres-n">${pgHit.length + extra.length}</span></div>
        <div class="list">
            ${pgHit.map(p => `
            <a class="list-item" href="#/page/${p.key}">
                <div class="li-ico">${icon(p.icon)}</div>
                <div class="list-item-title">${markKw(p.title, head)}</div>
                ${icon('chev', 'chev')}
            </a>`).join('')}
            ${extra.map(({ p, n }) => `
            <a class="list-item" href="#/page/${p.key}">
                <div class="li-ico">${icon(p.icon)}</div>
                <div class="list-item-title">${p.title}</div>
                <div class="list-item-sub">${n} 条命中</div>
                ${icon('chev', 'chev')}
            </a>`).join('')}
        </div>` : ''}
    ${total ? `
        <div class="sres-head">表内条目　<span class="sres-n">${total}</span>
            ${rows > total ? `<span class="sres-more">合并自 ${rows} 行</span>` : ''}
            ${total > LIMIT ? `<span class="sres-more">只列前 ${LIMIT} 条，加个词收窄</span>` : ''}
        </div>
        <div class="sres">
            ${shown.map(it => {
        const pg = it.pages[0];
        const more = it.pages.length > 1 ? ` +${it.pages.length - 1}` : '';
        /* 少数表的首格是整段描述，直接当标题会撑爆一行 */
        const label = it.n.length > 30
            ? (it.n.toLowerCase().includes(head) ? snippetOf(it.n, head) : it.n.slice(0, 26) + '…')
            : it.n;
        return `
            <a class="sres-item" href="#/page/${pg.k}/${encodeURIComponent(it.n)}">
                <div class="sres-top">
                    <span class="sres-name">${markKw(label, head)}</span>
                    ${it.c > 1 ? `<span class="sres-cnt">×${it.c}</span>` : ''}
                    <span class="sres-page">${pg.t}${more}</span>
                </div>
                <div class="sres-snip">${markKw(snippetOf(it.raw, head), head)}</div>
            </a>`;
    }).join('')}
        </div>` : ''}
    ${(!total && !pgHit.length && !extra.length) ? `<div class="empty">没有找到「${escHtml(raw)}」<br>
        <span style="font-size:0.74rem">本站只收录已核对的数据；换个别名或更短的关键词再试，例如「药草」「锻造」「结婚」</span></div>` : ''}
    <div style="padding:1rem"><a class="link" href="#/wiki" style="font-size:0.84rem">‹ 返回攻略目录</a></div>`;
}

function viewError(msg) {
    return `<div class="empty">${msg}<br><a class="link" href="#/" style="font-size:0.8rem">返回首页</a></div>`;
}

/* ============================================================
   渲染
   ============================================================ */

let lastHash = null;

function render() {
    const r = parseRoute();
    const g = cur();

    let html = '';
    let title = '符文工房攻略百科';
    let showBack = true;
    let tab = 'wiki';

    switch (r.name) {
        case 'home':
            html = viewWelcome(); title = '符文工房攻略百科'; showBack = false; tab = 'wiki';
            break;
        case 'wiki':
            html = viewHome(g); title = g.name; showBack = false; tab = 'wiki';
            break;
        case 'cat':
            html = viewCat(r.args[0]); title = g.name; tab = 'wiki';
            break;
        case 'page':
            html = viewPage(r.args[0]); title = g.name; tab = 'wiki';
            break;        case 'news': /* 保留位 */
            html = viewHome(g); showBack = false; tab = 'wiki';
            break;
        case 'resident':
            html = viewResident(r.args[0], r.args[1]);
            title = g.name; tab = 'resident';
            break;
        case 'char':
            html = viewChar(r.args[0], r.args[1]); title = g.name; tab = 'resident';
            break;
        case 'games':
            html = viewGames(); title = '选择作品'; tab = 'setting';
            break;
        case 'switch':
            if (r.args[0] && GAMES.some(x => x.id === r.args[0])) {
                S.game = r.args[0]; saveState();
            }
            location.hash = '/wiki';
            return;
        case 'todo':
            html = viewTodo(); title = g.name; tab = 'todo';
            break;
        case 'setting':
            html = viewSetting(); title = '设置'; tab = 'setting';
            break;
        case 'search':
            html = viewSearch(r.args[0]); title = g.name; tab = 'wiki';
            break;
        default:
            html = viewError('页面不存在'); showBack = false;
    }

    document.getElementById('main').innerHTML = html;
    document.getElementById('titleText').textContent = title;
    document.getElementById('backBtn').hidden = !showBack;
    const mark = document.getElementById('mark');
    mark.textContent = showBack ? g.no : 'WIKI';

    document.querySelectorAll('.tabbar a').forEach(a => {
        a.classList.toggle('active', a.dataset.tab === tab);
    });

    /* 仅在路由变化时滚到顶部，设置页内的重渲染保持位置 */
    if (location.hash !== lastHash) {
        window.scrollTo(0, 0);
        lastHash = location.hash;
    }

    /* 首页搜索 + 边打字边出条目建议 */
    const q = document.getElementById('q');
    if (q) {
        const submit = () => {
            const v = q.value.trim();
            if (v) go('/search/' + encodeURIComponent(v));
        };
        q.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        const qb = document.getElementById('qbtn');
        if (qb) qb.addEventListener('click', submit);

        const sug = document.getElementById('qsug');
        if (sug) {
            let timer = null;
            const draw = () => {
                const v = q.value.trim().toLowerCase();
                if (!v) { sug.innerHTML = ''; return; }
                const words = v.split(/\s+/).filter(Boolean);
                const { list } = searchEntries(g, words);
                const top = list.slice(0, 6);
                sug.innerHTML = top.length
                    ? top.map(it => {
                        const pg = it.pages[0];
                        const more = it.pages.length > 1 ? ` +${it.pages.length - 1}` : (it.c > 1 ? ` ×${it.c}` : '');
                        const nm = it.n.length > 18
                            ? (it.n.toLowerCase().includes(words[0]) ? snippetOf(it.n, words[0]) : it.n.slice(0, 16) + '…')
                            : it.n;
                        return `
                        <a class="qsug-item" href="#/page/${pg.k}/${encodeURIComponent(it.n)}">
                            <span class="qsug-n">${markKw(nm, words[0])}</span>
                            <span class="qsug-p">${pg.t}${more}</span>
                        </a>`;
                    }).join('')
                    + `<a class="qsug-all" href="#/search/${encodeURIComponent(q.value.trim())}">查看全部 ${list.length} 条结果 ›</a>`
                    : `<div class="qsug-none">当前作品里没有匹配的条目</div>`;
            };
            q.addEventListener('input', () => {
                clearTimeout(timer);
                timer = setTimeout(draw, 60);
            });
        }
    }

    /* 从搜索结果点进来的条目：定位并高亮 */
    if (r.name === 'page' && r.args[1]) focusRow(r.args[1]);

    /* 从顶栏搜索按钮进来（无关键词）时直接聚焦输入框 */
    if (r.name === 'search' && !r.args[0] && q) {
        try { q.focus(); } catch (e) { }
    }

    /* 设置页交互 */
    if (r.name === 'setting') bindSetting();

    /* 魔物图鉴筛选 */
    const mq = document.getElementById('monQ');
    if (mq) {
        const allRows = Array.from(document.querySelectorAll('.mon-table tbody tr'));
        const mainRows = Array.from(document.querySelectorAll('.mon-table[data-list] tbody tr'));
        const cnt = document.getElementById('monCount');
        const chips = Array.from(document.querySelectorAll('#monChips [data-mk]'));
        let mk = 'all';

        const apply = () => {
            const v = mq.value.trim().toLowerCase();
            allRows.forEach(tr => {
                const hitText = !v || (tr.dataset.s || '').toLowerCase().includes(v);
                const inMain = tr.closest('.mon-table[data-list]');
                const hitKind = (mk === 'all' || !inMain) ? true : tr.dataset.ok === mk;
                tr.classList.toggle('hide', !(hitText && hitKind));
            });
            if (cnt) {
                const n = mainRows.filter(tr => !tr.classList.contains('hide')).length;
                cnt.textContent = (v || mk !== 'all')
                    ? n + ' / ' + mainRows.length + ' 条'
                    : mainRows.length + ' 条';
            }
        };

        mq.addEventListener('input', apply);
        chips.forEach(b => b.addEventListener('click', () => {
            mk = b.dataset.mk;
            chips.forEach(x => x.classList.toggle('on', x === b));
            apply();
        }));
    }

    /* 配方大全筛选 */
    const rq = document.getElementById('recQ');
    if (rq) {
        const rows = Array.from(document.querySelectorAll('.mon-table[data-rec] tbody tr'));
        const sel = document.getElementById('recSel');
        const cnt = document.getElementById('recCount');
        const apply = () => {
            const v = rq.value.trim().toLowerCase();
            const c = sel ? sel.value : 'all';
            let n = 0;
            rows.forEach(tr => {
                const hitText = !v || (tr.dataset.s || '').toLowerCase().includes(v);
                const hitCat = c === 'all' || tr.dataset.c === c;
                const on = hitText && hitCat;
                tr.classList.toggle('hide', !on);
                if (on) n++;
            });
            if (cnt) {
                cnt.textContent = (v || c !== 'all') ? n + ' / ' + rows.length + ' 条' : rows.length + ' 条';
            }
        };
        rq.addEventListener('input', apply);
        if (sel) sel.addEventListener('change', apply);
    }

    /* 鱼类图鉴筛选 */
    const fq = document.getElementById('fishQ');
    if (fq) {
        const rows = Array.from(document.querySelectorAll('.mon-table[data-fish] tbody tr'));
        const cnt = document.getElementById('fishCount');
        const chips = Array.from(document.querySelectorAll('#fishChips [data-fk]'));
        let fk = 'all';
        const apply = () => {
            const v = fq.value.trim().toLowerCase();
            let n = 0;
            rows.forEach(tr => {
                const hitText = !v || (tr.dataset.s || '').toLowerCase().includes(v);
                const hitCat = fk === 'all' || tr.dataset.fk === fk;
                const on = hitText && hitCat;
                tr.classList.toggle('hide', !on);
                if (on) n++;
            });
            if (cnt) {
                cnt.textContent = (v || fk !== 'all') ? n + ' / ' + rows.length + ' 条' : rows.length + ' 条';
            }
        };
        fq.addEventListener('input', apply);
        chips.forEach(b => b.addEventListener('click', () => {
            fk = b.dataset.fk;
            chips.forEach(x => x.classList.toggle('on', x === b));
            apply();
        }));
    }

    /* 物品清单筛选（武器／防具／农具／素材／料理／药品） */
    const eqq = document.getElementById('eqQ');
    if (eqq) {
        const rows = Array.from(document.querySelectorAll('.mon-table[data-eq] tbody tr'));
        const cnt = document.getElementById('eqCount');
        const chips = Array.from(document.querySelectorAll('#eqChips [data-ekk]'));
        const sel = document.getElementById('eqSel');
        const secs = Array.from(document.querySelectorAll('[data-eqsec]'));
        let ek = 'all';
        const apply = () => {
            const v = eqq.value.trim().toLowerCase();
            const k = sel ? sel.value : ek;
            let n = 0;
            rows.forEach(tr => {
                const hitText = !v || (tr.dataset.s || '').toLowerCase().includes(v);
                const hitCat = k === 'all' || tr.dataset.ek === k;
                const on = hitText && hitCat;
                tr.classList.toggle('hide', !on);
                if (on) n++;
            });
            /* 分节展示时，筛完没有内容的分类整节收起 */
            if (secs.length) {
                secs.forEach(sec => {
                    const vis = sec.querySelectorAll('tbody tr:not(.hide)').length;
                    sec.classList.toggle('hide', vis === 0);
                });
                const empty = document.getElementById('eqEmpty');
                if (empty) empty.hidden = n > 0 || !v;
            }
            if (cnt) {
                cnt.textContent = (v || k !== 'all') ? n + ' / ' + rows.length + ' 条' : rows.length + ' 条';
            }
        };
        eqq.addEventListener('input', apply);
        if (sel) sel.addEventListener('change', apply);
        chips.forEach(b => b.addEventListener('click', () => {
            ek = b.dataset.ekk;
            chips.forEach(x => x.classList.toggle('on', x === b));
            apply();
        }));
        /* 分类跳转 */
        Array.from(document.querySelectorAll('#eqNav [data-jump]')).forEach(b => {
            b.addEventListener('click', () => {
                const t = document.getElementById(b.dataset.jump);
                if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* 独立搜索表（一页多张表时用）：每块只管自己框里的输入 */
    Array.from(document.querySelectorAll('.eqown')).forEach(box => {
        const inp = box.querySelector('.eqown-q');
        if (!inp) return;
        const rows = Array.from(box.querySelectorAll('tbody tr'));
        const cnt = box.querySelector('.eqown-c');
        const apply = () => {
            const v = inp.value.trim().toLowerCase();
            let n = 0;
            rows.forEach(tr => {
                const on = !v || (tr.dataset.s || '').toLowerCase().includes(v);
                tr.classList.toggle('hide', !on);
                if (on) n++;
            });
            if (cnt) cnt.textContent = v ? n + ' / ' + rows.length + ' 条' : rows.length + ' 条';
        };
        inp.addEventListener('input', apply);
    });

    /* 战斗与弱点筛选 */
    const rsq = document.getElementById('resQ');
    if (rsq) {
        const rows = Array.from(document.querySelectorAll('.mon-table[data-res] tbody tr'));
        const cnt = document.getElementById('resCount');
        const chips = Array.from(document.querySelectorAll('#resChips [data-rk]'));
        let rk = 'all';
        const apply = () => {
            const v = rsq.value.trim().toLowerCase();
            let n = 0;
            rows.forEach(tr => {
                const hitText = !v || (tr.dataset.s || '').toLowerCase().includes(v);
                const hitCat = rk === 'all' || tr.dataset.rk === rk;
                const on = hitText && hitCat;
                tr.classList.toggle('hide', !on);
                if (on) n++;
            });
            if (cnt) {
                cnt.textContent = (v || rk !== 'all') ? n + ' / ' + rows.length + ' 只' : rows.length + ' 只';
            }
        };
        rsq.addEventListener('input', apply);
        chips.forEach(b => b.addEventListener('click', () => {
            rk = b.dataset.rk;
            chips.forEach(x => x.classList.toggle('on', x === b));
            apply();
        }));
    }
}

function bindSetting() {
    const rerender = () => { saveState(); render(); };

    const nick = document.getElementById('nick');
    if (nick) {
        nick.addEventListener('input', () => { S.nick = nick.value.trim(); saveState(); });
    }

    document.querySelectorAll('[data-bs]').forEach(b =>
        b.addEventListener('click', () => { S.bday.s = Number(b.dataset.bs); rerender(); }));

    document.querySelectorAll('[data-cs]').forEach(b =>
        b.addEventListener('click', () => { S.cur.s = Number(b.dataset.cs); rerender(); }));

    /* 日期：加减按钮 */
    document.querySelectorAll('[data-step]').forEach(b =>
        b.addEventListener('click', () => {
            const obj = b.dataset.step === 'bday' ? S.bday : S.cur;
            const v = obj.d + Number(b.dataset.dir);
            obj.d = v < 1 ? 30 : v > 30 ? 1 : v;
            rerender();
        }));

    /* 日期：直接输入 */
    [['bdayD', 'bday'], ['curD', 'cur']].forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', () => {
            let v = parseInt(el.value, 10);
            if (isNaN(v)) v = 1;
            S[key].d = Math.min(30, Math.max(1, v));
            rerender();
        });
    });

    document.querySelectorAll('[data-al]').forEach(b =>
        b.addEventListener('click', () => { S.alert = Number(b.dataset.al); rerender(); }));

    const reset = document.getElementById('reset');
    if (reset) reset.addEventListener('click', () => {
        S.game = 'rf4'; S.nick = ''; S.cur = { s: 0, d: 1 }; S.bday = { s: 0, d: 1 }; S.alert = 3;
        saveState(); go('/'); render();
    });
}

/* ============================================================
   启动
   ============================================================ */

loadState();
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('backBtn').addEventListener('click', () => {
        if (history.length > 1) history.back(); else go('/');
    });
    const sb = document.getElementById('searchBtn');
    if (sb) sb.addEventListener('click', () => go('/search'));
    render();
});
