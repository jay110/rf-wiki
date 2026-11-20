/* k-core.js —— 自动生成，勿手改（node _build_chunks.js）
   含 5 个源文件，按 js/_manifest.json 的顺序拼接：
     js/icons.js
     js/changelog-head.js
     js/data.js
     js/pages-meta.js
     js/app.js
*/
/* 自绘线性图标集 —— 统一 24x24 / stroke=currentColor，避免引用任何版权素材 */
const ICON_PATHS = {
    home: '<path d="M3 10.6 12 3.4l9 7.2V20a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 20z"/><path d="M9.4 21.2v-6.3h5.2v6.3"/>',
    users: '<circle cx="9" cy="8.2" r="3.3"/><path d="M2.8 20.4c0-3.1 2.8-5.3 6.2-5.3s6.2 2.2 6.2 5.3"/><path d="M16.2 5.4a3 3 0 0 1 0 5.9"/><path d="M17.4 15.4c2.3.5 3.9 2.2 3.9 5"/>',
    bell: '<path d="M18 8.6a6 6 0 1 0-12 0c0 5.2-2 6.7-2 6.7h16s-2-1.5-2-6.7"/><path d="M13.7 19.2a2 2 0 0 1-3.4 0"/>',
    gear: '<circle cx="12" cy="12" r="3.1"/><path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8M5.4 5.4l2 2M16.6 16.6l2 2M18.6 5.4l-2 2M7.4 16.6l-2 2"/>',
    back: '<path d="M15 5.2 8 12l7 6.8"/>',
    chev: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    scroll: '<path d="M6.5 4.5h11a2 2 0 0 1 2 2v11.4"/><path d="M6.5 4.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H17a2 2 0 0 1 2 2 2 2 0 0 0 2-2"/><path d="M8.6 8.6h7M8.6 12h7M8.6 15.4h4"/>',
    globe: '<circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2"/><path d="M12 3.2c2.4 2.4 3.6 5.6 3.6 8.8s-1.2 6.4-3.6 8.8c-2.4-2.4-3.6-5.6-3.6-8.8S9.6 5.6 12 3.2z"/>',
    flag: '<path d="M6 21.2V3.4"/><path d="M6 4.4h11.4l-1.9 3.6 1.9 3.6H6z"/>',
    clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.2V12l3.3 2"/>',
    bolt: '<path d="M13.4 2.6 5.6 13.4h5.2l-.8 8 7.8-11H12z"/>',
    pad: '<rect x="2.6" y="7" width="18.8" height="10.4" rx="3.6"/><path d="M7.4 10.6v3.2M5.8 12.2h3.2"/><circle cx="16.4" cy="11.4" r=".9" fill="currentColor" stroke="none"/><circle cx="18.4" cy="13.6" r=".9" fill="currentColor" stroke="none"/>',
    sprout: '<path d="M12 21v-8.4"/><path d="M12 12.6C12 8.9 9.3 6.4 4.6 6.4c0 4.2 2.9 6.2 7.4 6.2z"/><path d="M12 12.2c0-3.1 2.3-5.2 6.3-5.2 0 3.6-2.4 5.2-6.3 5.2z"/>',
    seed: '<path d="M3.6 19.9h16.8"/><path d="M12 19.9v-5.6"/><path d="M12 14.3c0-2.4-1.8-4.2-4.7-4.2 0 2.4 1.8 4.2 4.7 4.2z"/><path d="M12 14.3c0-2.4 1.8-4.2 4.7-4.2 0 2.4-1.8 4.2-4.7 4.2z"/>',
    house2: '<path d="M4 20.2V9.8l8-5.4 8 5.4v10.4z"/><path d="M9.6 20.2v-5.4h4.8v5.4"/>',
    shop: '<path d="M3.4 9.4h17.2v10.8H3.4z"/><path d="M2.6 9.4 5 4.4h14l2.4 5"/><path d="M9.4 20.2v-5.6h5.2v5.6"/>',
    cow: '<path d="M6 8.2c0-1.6 1.2-2.8 2.6-2.8"/><path d="M18 8.2c0-1.6-1.2-2.8-2.6-2.8"/><ellipse cx="12" cy="13" rx="6.2" ry="5.2"/><circle cx="9.8" cy="12.2" r=".9" fill="currentColor" stroke="none"/><circle cx="14.2" cy="12.2" r=".9" fill="currentColor" stroke="none"/><path d="M10.6 16.2c.9.7 1.9.7 2.8 0"/>',
    monster: '<path d="M6.2 9.2 4.4 4.8l4 1.8"/><path d="M17.8 9.2l1.8-4.4-4 1.8"/><ellipse cx="12" cy="13.4" rx="6.4" ry="6"/><circle cx="9.6" cy="12.2" r=".95" fill="currentColor" stroke="none"/><circle cx="14.4" cy="12.2" r=".95" fill="currentColor" stroke="none"/><path d="M10 16.4c1.2.9 2.8.9 4 0"/>',
    paw: '<ellipse cx="12" cy="16" rx="4.3" ry="3.5"/><ellipse cx="6.9" cy="9.4" rx="1.75" ry="2.1"/><ellipse cx="10.4" cy="6.9" rx="1.75" ry="2.1"/><ellipse cx="13.6" cy="6.9" rx="1.75" ry="2.1"/><ellipse cx="17.1" cy="9.4" rx="1.75" ry="2.1"/>',
    pick: '<path d="M4 20 14.6 9.4"/><path d="M9.6 4.2c4.4-1 8.6.4 10.8 3.2-3.4-1-6.6-.4-9.2 1.4"/><path d="M12.4 8.4 15 11"/>',
    fish: '<path d="M3.6 12c3-4 6.6-6 10-6s6 2.2 6.8 6c-.8 3.8-3.4 6-6.8 6s-7-2-10-6z"/><path d="M20.4 12 22 7.8v8.4z" fill="currentColor" stroke="none"/><circle cx="9.4" cy="11.2" r=".95" fill="currentColor" stroke="none"/>',
    pot: '<path d="M4 10.6h16"/><path d="M5.4 10.6v6.6a2.4 2.4 0 0 0 2.4 2.4h8.4a2.4 2.4 0 0 0 2.4-2.4v-6.6"/><path d="M9 10.6V8.4h6v2.2"/><path d="M2.4 13.2h1.6M20 13.2h1.6"/>',
    hammer: '<path d="M8.6 3.4 15 9.8l-2 2-6.4-6.4z"/><path d="M11.6 9.2 4 16.8a2 2 0 0 0 2.8 2.8l7.6-7.6"/>',
    flask: '<path d="M9.6 3.6h4.8"/><path d="M10.6 3.6v5.8L5.8 18a2 2 0 0 0 1.7 3h9a2 2 0 0 0 1.7-3l-4.8-8.6V3.6"/><path d="M7.4 15h9.2"/>',
    chair: '<path d="M5.4 3.4v17.2"/><path d="M5.4 12.4h13.2V6.2"/><path d="M18.6 12.4v8.2"/><path d="M8.6 15.4h10"/>',
    calendar: '<rect x="3.4" y="5.2" width="17.2" height="15.4" rx="1.6"/><path d="M3.4 10.2h17.2"/><path d="M8 2.8v4M16 2.8v4"/><circle cx="8.6" cy="14.4" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="14.4" r="1" fill="currentColor" stroke="none"/><circle cx="15.4" cy="14.4" r="1" fill="currentColor" stroke="none"/>',
    ring: '<circle cx="12" cy="15" r="5.4"/><path d="m9.4 5.2 2.6 3 2.6-3-2.6-2.6z"/>',
    board: '<path d="M4.4 4.6h15.2v9.6H4.4z"/><path d="M7.6 8h8.8M7.6 11h5.4"/><path d="M7.4 14.2 5.6 19M16.6 14.2 18.4 19"/>',
    sword: '<path d="M15.6 3.4h5v5L11 18l-5-5z"/><path d="m6 13-2.6 2.6L5 18l2 2 2.6-2.6"/>',
    shield: '<path d="M12 3.2 4.6 6v6.2c0 4 3 7.4 7.4 8.6 4.4-1.2 7.4-4.6 7.4-8.6V6z"/><path d="M12 8v6.6"/>',
    hoe: '<path d="M3.6 20.4 13 11"/><path d="M11.4 6.4h8.2v4.2"/><path d="M13.4 11 19.6 6.4"/>',
    gem: '<path d="m12 3.2 6.8 5.2-6.8 12.4L5.2 8.4z"/><path d="M5.2 8.4h13.6"/><path d="m12 3.2-1.8 5.2L12 20.8l1.8-12.4z"/>',
    bowl: '<path d="M3.6 11.4h16.8"/><path d="M4.6 11.4c0 4.4 3.3 8 7.4 8s7.4-3.6 7.4-8"/><path d="M9 8.2c0-1.8 1.3-3.2 3-3.2"/>',
    bottle: '<path d="M9.6 3.2h4.8v3.2H9.6z"/><path d="M9.6 6.4c0 1.6-2.6 3-2.6 6.4v5.4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5.4c0-3.4-2.6-4.8-2.6-6.4"/><path d="M8 14.6h8"/>',
    books: '<path d="M4.2 5.2h5.2v15.4H4.2z"/><path d="M9.4 5.2h5.2v15.4H9.4z"/><path d="M14.6 6.4l4.6-1.2 3 14.6-4.6 1.2z"/>',
    book: '<path d="M12 6.4C10 5 7.4 4.6 4.6 5.2v13c2.8-.6 5.4-.2 7.4 1.2"/><path d="M12 6.4c2-1.4 4.6-1.8 7.4-1.2v13c-2.8-.6-5.4-.2-7.4 1.2"/><path d="M12 6.4v13"/>',
    dragon: '<path d="M4.6 19.4c1.4-3 4.4-5 7.6-5 3.4 0 5.8 1.8 7.2 4.4"/><path d="M9.8 12.4c-1.6-1.6-2-3.8-1-5.6"/><path d="M14.4 6.8 16.6 3l1.4 4"/><circle cx="12" cy="9" r="4.2"/><circle cx="10.8" cy="8.4" r=".85" fill="currentColor" stroke="none"/>',
    mask: '<path d="M4.4 6.2c2.6-1 12.6-1 15.2 0v6c0 4.4-3.4 7.6-7.6 7.6S4.4 16.6 4.4 12.2z"/><circle cx="9.2" cy="11" r="1.05" fill="currentColor" stroke="none"/><circle cx="14.8" cy="11" r="1.05" fill="currentColor" stroke="none"/><path d="M9.8 15.2c1.5 1 2.9 1 4.4 0"/>',
    note: '<path d="M5.4 3.6h9.2l4.8 4.8v12H5.4z"/><path d="M14.4 3.6v5h5"/><path d="M8.6 12.6h6.8M8.6 16h4.6"/>',
    star: '<path d="m12 3.4 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9z"/>',
    gift: '<path d="M3.8 9.4h16.4v3.2H3.8z"/><path d="M5.4 12.6v8H18.6v-8"/><path d="M12 9.4v11.2"/><path d="M12 9.4C12 6 10.6 4 8.6 4 7 4 6 5 6 6.2c0 1.8 1.8 3.2 6 3.2z"/><path d="M12 9.4c0-3.4 1.4-5.4 3.4-5.4 1.6 0 2.6 1 2.6 2.2 0 1.8-1.8 3.2-6 3.2z"/>',
    key: '<circle cx="8.2" cy="15.8" r="4"/><path d="m11 13 8-8"/><path d="m16.4 7.6 2.2 2.2M19 5l1.6 1.6"/>',
    compass: '<circle cx="12" cy="12" r="8.8"/><path d="m15.4 8.6-2 4.8-4.8 2 2-4.8z"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.4 15.4 4.4 4.4"/>',
    trash: '<path d="M4.6 6.6h14.8"/><path d="M9.4 6.6V4.2h5.2v2.4"/><path d="M6.4 6.6 7.4 21h9.2l1-14.4"/>',
    check: '<path d="m4.6 12.6 5 5L19.4 7"/>',
    skull: '<path d="M12 2.8c-4.3 0-7.3 3-7.3 6.9 0 2.4 1.1 4.3 2.8 5.5v2.4c0 1.1.8 1.9 1.8 1.9h5.4c1 0 1.8-.8 1.8-1.9v-2.4c1.7-1.2 2.8-3.1 2.8-5.5 0-3.9-3-6.9-7.3-6.9z"/><circle cx="9.4" cy="9.9" r="1.15" fill="currentColor" stroke="none"/><circle cx="14.6" cy="9.9" r="1.15" fill="currentColor" stroke="none"/><path d="M10.9 13.4h2.2M10.4 19.5v-1.6M13.6 19.5v-1.6"/>',
};

function icon(name, cls) {
    const p = ICON_PATHS[name] || ICON_PATHS.scroll;
    return `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

;
/* 更新日志摘要 —— 由 _build_clhead.py 生成，勿手改
   siteUpdated() 与 latestUpdates() 在正文未加载时用这份；
   正文加载后仍按原文计算，两者由 _test_changelog.js 断言一致。 */
const CHANGELOG_HEAD = {
    updated: "2026-11-20",
    latest: ["第两百五十八：首页轻了——首屏 gzip 82KB 压到 52KB，作品卡 86…", "第两百五十七：符文 1～5 的委托按人搬进人物页——3 代 280 条全挂在 2…", "第两百五十六：14 条「配方」从技能表里搬出来，单列成每人一行「牵绊道具」——1…", "第两百五十五：八作里只有六作能比周期——3 代没有作物表、海洋那 92 行是「魔…", "第两百五十四：八作武器摊平 1,224 行——只有「双手剑」八作全有，206 个…", "第两百五十三：操作方式页补两节——八作 13 行版本里只有 4 行带下屏、体感只…"],
};

;
/* ============================================================
   符文工房攻略百科 —— 内容数据
   资料来源：Marvelous 官方作品页 / SEGA 亚洲《符文工厂3豪华版》官网
            / 各作官方情报稿 / 系列公开设定（国家、幻龙、种族）
   本站为非官方中文资料整理，与 Marvelous Inc. 无隶属关系。
   ============================================================ */

const SEASON_NAMES = ['春', '夏', '秋', '冬'];

/* ---------------- 作品 ---------------- */
const GAMES = [
    {
        id: 'rf1', no: 'Ⅰ', name: '符文工房 新牧场物语', short: '新牧场物语',
        jp: 'ルーンファクトリー -新牧場物語-', en: 'Rune Factory: A Fantasy Harvest Moon',
        date: '2006-08-24', plat: 'Nintendo DS', dev: 'Neverland', pub: 'Marvelous Interactive',
        stage: '卡尔迪亚镇', stageJp: 'カルディア', hero: '拉格那', heroJp: 'ラグナ',
        god: '四幻龙（地·火·水·风）',
        grad: ['#2c7a4b', '#7cc38c'], hue: 148,
        tagline: '系列原点：把牧场种进迷宫旁边',
        intro: '《牧场物语》十周年衍生企划的第一作。失去记忆的青年拉格那在卡尔迪亚镇外醒来，接手了一间荒废的农场，一边耕作、一边接受委托深入地下迷宫，逐渐拼回自己与这座小镇的过去。系列此后所有作品的骨架——符文、RP、锻造、恋爱、迷宫——都在这里第一次成形。',
        systems: [
            ['剑与魔法的一体化', '系列首次把「牧场生活」与「即时战斗」放进同一个循环：白天种地挖矿，晚上下迷宫。武器分单手剑、双手剑、长枪、斧、锤，魔法靠杖施放。'],
            ['RP（符文点数）', '挥动农具、使用技能、施放魔法都消耗 RP。RP 见底后会开始扣体力，体力归零即晕倒。睡觉、泡温泉、吃料理是主要回复手段。'],
            ['分层地下迷宫', '镇外的洞窟、森林、遗迹按层推进，击破 Boss 后解锁新区域与新的可耕作地块。'],
            ['图书馆设定文本', '系列最早成体系的世界观资料，诺鲁德王国、塞克斯帝国与四幻龙的出处就在这里。'],
        ],
        candF: 10, candM: 0,
        chars: [
            { name: '拉格那', jp: 'ラグナ', role: '主角', cv: '朴璐美', note: '大地之民。失去记忆，被密丝特救起后留在卡尔迪亚。' },
            { name: '密丝特', jp: 'ミスト', role: '花嫁候补', cv: '小清水亚美', bday: '春 1', note: '在镇外发现倒下的主角的少女。说话跳脱、总能看见别人看不见的东西。' },
            { name: '萝洁塔', jp: 'ロゼッタ', role: '花嫁候补', cv: '鹿野优以', note: '杂货店的女儿，嘴硬心软，对生意很认真。' },
            { name: '拉碧丝', jp: 'ラピス', role: '花嫁候补', cv: '相泽舞', note: '教会的修女兼护士，温柔稳重。' },
            { name: '美乐蒂', jp: 'メロディ', role: '花嫁候补', cv: '神田朱未', note: '经营澡堂，最爱泡澡，性格开朗。' },
            { name: '碧安卡', jp: 'ビアンカ', role: '花嫁候补', cv: '有岛萌', note: '镇上富家的大小姐，总是一副提不起劲的样子。' },
            { name: '塔巴莎', jp: 'タバサ', role: '花嫁候补', cv: '佐藤朱', note: '宅邸的女仆，安静、慈爱。' },
        ],
    },
    {
        id: 'rf2', no: 'Ⅱ', name: '符文工房2', short: 'RF2',
        jp: 'ルーンファクトリー2', en: 'Rune Factory 2: A Fantasy Harvest Moon',
        date: '2008-01-03', plat: 'Nintendo DS', dev: 'Neverland', pub: 'Marvelous Interactive',
        stage: '阿尔巴那镇', stageJp: 'アルヴァーナ', hero: '凯尔', heroJp: 'カイル',
        god: '四幻龙（地·火·水·风）',
        grad: ['#2f6f93', '#86bcd8'], hue: 202,
        tagline: '系列唯一的跨代结构：故事交给孩子继续',
        intro: '舞台移到诺鲁德王国境内的阿尔巴那镇。主角凯尔在镇外定居、成家，而真正的主线——关于幻龙、封印与大地的循环——要等孩子长大后才展开。这让 RF2 成为系列中结构最特殊的一作。',
        systems: [
            ['跨代（子代）系统', '一周目以凯尔的身份生活、结婚、生子；二周目改为操作子代，主线剧情、部分迷宫与图书馆小游戏都在子代解禁。'],
            ['符文技能绑定武器', '技能树跟随武器种类走，换武器等于换一套战斗手段。这一限制在 RF3 被取消。'],
            ['学校与课程', '镇上有学校，可上课、参加考试，学业进度与部分剧情挂钩。'],
            ['联机小游戏', '需要联机的图书馆小游戏，是部分最强／次强武器的唯一来源——这些武器无法通过锻造获得。'],
        ],
        candF: 7, candM: 4,
        chars: [
            { name: '凯尔', jp: 'カイル', role: '主角', cv: '', note: '主角。系列里少见的「已成家立业」型主角，故事横跨父子两代。' },
            { name: '阿鲁斯', jp: 'アルス', role: '主角', cv: '粕谷雄太', note: '子代主角（凯尔之子），与雅莉亚是双胞胎。官方日文站的罗马字作 Ars，美版作 Aaron。二周目起由他承接主线。' },
            { name: '雅莉亚', jp: 'アリア', role: '主角', cv: '前田爱', note: '子代主角（凯尔之女），与阿鲁斯是双胞胎。官方日文站的罗马字作 Alia，美版作 Aria。一代末由玩家决定孩子的性别，选女儿就由她承接二代主线；二代里可与凌、奥斐斯、罗伊结为「过家家」伴侣。母方取决于凯尔娶了谁。婴儿期立绘留在文件里，游戏中并未用到。' },
            { name: '玛娜', jp: 'マナ', role: '花嫁候补', cv: '', note: '本作标题女主，杂货店帮忙的元气少女，对主角抱着近乎绝对的信任。' },
            { name: '茱莉雅', jp: 'ジュリア', role: '花嫁候补', cv: '', bday: '春 16', note: '温泉旅馆「智慧」的店主，爱打扮、偶尔冒失。' },
            { name: '阿莉希亚', jp: 'アリシア', role: '花嫁候补', cv: '', bday: '夏 28', note: '占卜师，狂热到连母亲反对也不放弃；只有天气与人物位置的占卜特别准。' },
            { name: '塞西莉娅', jp: 'セシリア', role: '花嫁候补', cv: '', bday: '夏 12', note: '半精灵女仆，也是 RF1 就登场过的角色。天然呆，喜欢所有宝石。' },
            { name: '罗萨琳德', jp: 'ロザリンド', role: '花嫁候补', cv: '', bday: '秋 27', note: '薇薇亚修家的千金，读书多、性格认真，公认较难追。' },
            { name: '多萝茜', jp: 'ドロシー', role: '花嫁候补', cv: '', bday: '冬 2', note: '神父的女儿，梦想当护士。极害羞，总抱着布娃娃、用帽子遮住眼睛。' },
            { name: '由绘', jp: 'ゆえ', role: '花嫁候补', cv: '', bday: '春 9', note: '流浪商人，稳重的大和抚子。本作的「替补」——其他候补若都嫁给了官配，由她顶上。' },
            { name: '麦克斯', jp: 'マックス', role: '花婿候补', cv: '', bday: '秋 6', note: '薇薇亚修家的少爷，高富帅、聪明又温柔，可惜相当自恋。' },
            { name: '巴瑞特', jp: 'バレット', role: '花婿候补', cv: '', bday: '春 5', note: '住在旅馆的青年，跑完他的事件后会变成主角最可靠的哥们。' },
            { name: '雷', jp: 'レイ', role: '花婿候补', cv: '', note: '阿莉希亚的弟弟。被任性姐姐折腾多年，决心独立，性格稳重。' },
            { name: '杰克', jp: 'ジェイク', role: '花婿候补', cv: '', note: '精灵族少年，武器店相关，喜欢洋葱。' },
            { name: '道格拉斯', jp: 'ダグラス', role: '居民', cv: '', note: '杂货店老板，玛娜的父亲。' },
            { name: '高顿', jp: 'ゴードン', role: '居民', cv: '', note: '教堂神父，多萝茜与卡农的父亲。' },
            { name: '娜塔莉', jp: 'ナタリー', role: '居民', cv: '', note: '医院护士长，阿莉希亚与雷的母亲。' },
            { name: '赫理查科斯', jp: 'ヘリチャコス', role: '居民', cv: '藤原启治', al: '海齐利格斯、海利齐格斯', note: '薇薇亚修家的当主，麦克斯与罗萨琳德的父亲。镇上出了名的美食家，也是美食节的评委。站内早先另立过一条「海齐利格斯」，日文名写作 ハイリヒクス，与 wiki 的 ヘリチャコス 对不上，已合并到本条；wiki 记的英文名「Herman」从日文读音也推不出来，按存疑处理。' },
            { name: '卡农', jp: 'カノン', role: '居民', cv: '', note: '多萝茜的妹妹，活泼好动。' },
        ],
    },
    {
        id: 'rf3', no: 'Ⅲ', name: '符文工房3/特别版', short: 'RF3/SP',
        jp: 'ルーンファクトリー3', en: 'Rune Factory 3: A Fantasy Harvest Moon',
        date: '2023-03-02', plat: 'Nintendo Switch／PC', dev: 'Neverland／HAKAMA', pub: 'Marvelous',
        orig: { date: '2009-10-22', plat: 'Nintendo DS', dev: 'Neverland', pub: 'Marvelous Entertainment' },
        ver: '日版 Switch 2023.03.02｜亚洲 2023.03.30｜欧美 Switch／PC 2023.09.05',
        pc: {
            note: 'Steam（Windows）版系统需求，数据取自 Steam 商店页各作页面。',
            rows: [
                ['操作系统', 'Windows 10', 'Windows 10'],
                ['处理器', 'Intel Core i5-1135G7', 'Intel Core i5-9300H'],
                ['内存', '8 GB RAM', '16 GB RAM'],
                ['显卡', 'Intel Iris Xe Graphics', 'NVIDIA GTX 1650Q'],
                ['DirectX', 'Version 12', 'Version 12'],
                ['存储空间', '4 GB 可用空间', '4 GB 可用空间']
            ]
        },
        stage: '西亚廉斯镇', stageJp: 'シアレンス', hero: '麦斯', heroJp: 'マイス',
        god: '希雅蕾斯之树',
        grad: ['#7a4f9e', '#b899d8'], hue: 272,
        tagline: '人类与魔物的混血，站在两边的中间',
        intro: '倒卧在花店门前的金色莫可莫可被少女希雅救回家，醒来时已经变成人形、并且失去记忆——他的本体是魔物。为了阻止人类与魔物之间延续五十年的对立，麦斯在希雅蕾斯之树下开始生活。本站把 2009 年 NDS 原版与 2023 年 Switch／PC 重制版（特别版）合在这一个条目下，两版差异见本页「版本」。',
        systems: [
            ['变身', '主角可在人形与莫可莫可形态间自由切换。形态改变战斗动作，也改变 NPC 的对话与反应——居民并不知道他的秘密。'],
            ['生活 AI', 'NPC 按各自的兴趣、性格、交友关系自主行动，不再是固定脚本站桩。时间带不同，全镇的分布会变。'],
            ['双剑与新技能体系', '新增双剑武器；符文技能取消武器绑定，用非对应武器施放只是消耗更多 RP。'],
            ['希雅蕾斯之树', '农作物只能在巨树加护的范围内生长，这构成本作的土地扩张逻辑。'],
        ],
        candF: 11, candM: 0,
        chars: [
            { name: '麦斯', jp: 'マイス', role: '主角', cv: '白石凉子', note: '人类与魔物的混血。人形与莫可莫可形态可切换。' },
            { name: '希雅', jp: 'シア', role: '花嫁候补', cv: '福井裕佳梨', bday: '春 11', note: '花店招牌店员，村长的孙女。名字来自希雅蕾斯之树。' },
            { name: '多娜', jp: 'トゥーナ', role: '花嫁候补', cv: '加藤英美里', bday: '春 29', note: '寄住在武器店工作，沉默寡言，怀抱着某个秘密。' },
            { name: '玛丽安', jp: 'マリオン', role: '花嫁候补', cv: '小泽亚李', bday: '夏 17', note: '实习魔女兼护士，热衷打针与突发奇想的疗法。' },
            { name: '小可拉', jp: 'ショコラ', role: '花嫁候补', cv: '喜多村英梨', bday: '秋 21', note: '食堂招牌店员，立志成为厨师，大胃王比赛常胜。' },
            { name: '伊奥', jp: 'イオン', role: '花嫁候补', cv: '户松遥', bday: '冬 22', note: '与哥哥一起经营钓场，极爱钓鱼，少年般的气场。' },
            { name: '佩露夏', jp: 'ペルシャ', role: '花嫁候补', cv: '远藤绫', bday: '夏 6', note: '旅馆负责澡堂，非常喜欢泡澡，对话常常驴唇不对马嘴。' },
            { name: '达丽娅', jp: 'ダリア', role: '花嫁候补', cv: '堀江由衣', bday: '春 24', note: '住在森林里的艺术家，强行任命主角为助手。' },
            { name: '咲耶', jp: 'さくや', role: '花嫁候补', cv: '新谷良子', bday: '夏 25', note: '与母亲经营旅馆，同时四处行商，一谈钱就变脸。' },
            { name: '索菲娅', jp: 'ソフィア', role: '花嫁候补', cv: '茅原实里', bday: '秋 7', note: '镇上第一豪宅的大小姐，习惯把心里话反过来说。' },
            { name: '卡琳', jp: 'カリン', role: '花嫁候补', cv: '伊藤静', bday: '冬 4', note: '在母亲经营的杂货店帮忙。' },
            { name: '克璐璐法', jp: 'クルルファ', role: '花嫁候补', cv: '中原麻衣', bday: '冬 17', note: '独角兽一族的女性，性子慢、心地软。' },
        ],
    },
    {
        id: 'rff', no: 'F', name: '符文工房未知大地', short: '未知大地',
        jp: 'ルーンファクトリー フロンティア', en: 'Rune Factory Frontier',
        date: '2008-11-27', plat: 'Wii', dev: 'Neverland', pub: 'Marvelous Entertainment',
        stage: '特兰鲁皮亚', stageJp: 'トランルピア', hero: '拉格那', heroJp: 'ラグナ',
        god: '鲸鱼岛（浮空岛）与其符文',
        grad: ['#1f6f7a', '#7fc9c4'], hue: 178,
        tagline: '系列首次 3D 化，以及那套让人又爱又恨的符文精灵',
        intro: 'RF1 的直接续作。密丝特某天不告而别，拉格那循着她的踪迹来到尚未开垦的特兰鲁皮亚。抬头能看见一座浮在空中的「鲸鱼岛」——它的符文正在流失，一旦坠落，整个村庄都会消失。',
        systems: [
            ['鲸鱼岛与符文精灵（Runeys）', '本作核心机制。符文精灵分水、岩、木、草四种，需要手持「收割器」在各区域之间调配。某个区域精灵归零，整片土地的收成都会下滑；调配到 Prosperity 状态则作物生长大幅加速。'],
            ['系列首个家用机作品', '画面全面 3D 化，支持 Wii 遥控器体感操作，也是系列第一次脱离掌机。'],
            ['十二少女', '12 位花嫁候补对应岛上石板的十二颗光球，恋爱线与主线绑定。'],
            ['季节迷宫', '绿之遗迹、熔岩遗迹等分别对应季节，鲸鱼岛则是全季节迷宫，任何作物都能种。'],
        ],
        candF: 12, candM: 0,
        chars: [
            { name: '拉格那', jp: 'ラグナ', role: '主角', cv: '朴璐美', note: '大地之民。为寻找密丝特来到特兰鲁皮亚。' },
            { name: '密丝特', jp: 'ミスト', role: '花嫁候补', cv: '小清水亚美', note: '「有人在呼唤我」——她循着梦里的声音而来。' },
            { name: '萝赛塔', jp: 'ロゼッタ', role: '花嫁候补', cv: '鹿野优以', note: '嘴上不饶人，心底很软的杂货店女儿。' },
            { name: '拉碧丝', jp: 'ラピス', role: '花嫁候补', cv: '相泽舞', note: '教会的修女兼护士。' },
            { name: '美乐蒂', jp: 'メロディ', role: '花嫁候补', cv: '神田朱未', note: '经营澡堂，泡澡狂热者。' },
            { name: '比安卡', jp: 'ビアンカ', role: '花嫁候补', cv: '有岛萌', note: '大小姐，名字全长到记不住。' },
            { name: '塔芭莎', jp: 'タバサ', role: '花嫁候补', cv: '佐藤朱', note: '宅邸女仆。' },
            { name: '尤尼', jp: 'ユーニ', role: '花嫁候补', cv: '植田佳奈', note: '旅馆的女儿，喜欢做家务。' },
            { name: '多洛普', jp: 'ドロップ', role: '花嫁候补', cv: '田中理惠', note: '沉默无干劲的学者。' },
            { name: '阿涅多', jp: 'アネット', role: '花嫁候补', cv: '阿澄佳奈', note: '天真烂漫的邮递员。' },
            { name: '赛尔菲', jp: 'セルフィ', role: '花嫁候补', cv: '折笠富美子', note: '住进图书馆的书虫。' },
            { name: '卯月', jp: 'うづき', role: '花嫁候补', cv: '泽城美雪', note: '东方武士之女。' },
            { name: '艾莉丝（白／黑）', jp: 'エリス', role: '花嫁候补', cv: '野川樱／佐藤利奈', note: '拥有不可思议力量的双子，与鲸鱼岛的命运相连。' },
        ],
    },
    {
        id: 'rfo', no: 'O', name: '符文工房 海洋', short: '海洋',
        jp: 'ルーンファクトリー オーシャンズ', en: 'Rune Factory: Tides of Destiny',
        date: '2011-02-24', plat: 'Wii／PlayStation 3', dev: 'Neverland', pub: 'Marvelous Entertainment',
        stage: '芬迪海域', stageJp: 'フェニス', hero: '亚赛尔／索妮娅', heroJp: 'アゼル／ソニア',
        god: '巨人优米尔（Ymir）',
        grad: ['#1c5f8f', '#6fb6d8'], hue: 205,
        tagline: '一个身体，两个灵魂，一片被巨人拖着走的海',
        intro: '青梅竹马的亚赛尔与索妮娅被卷进异世界，醒来时灵魂同居于一个身体。他们落脚在只能靠巨人优米尔拉动岛屿的芬迪海域，一边务农、一边寻找分离与归乡的办法。',
        systems: [
            ['一体两魂', '系列唯一一次让男女主角同时存在并互为搭档。前期共用亚赛尔的身体行动，中后期分身后才真正选择路线。'],
            ['巨人优米尔', '可骑乘、可从海底把整座岛与沉船捞起来——捞起的岛就是新的农田、迷宫与资源点。'],
            ['农业自动化', '田地由魔物自动耕作，玩家更偏向「指挥与探索」。系统复杂度也是本作当年争议最大的地方。'],
            ['后期才定性别', '开局不做性别选择，而是随剧情推进才决定以谁的身份继续。'],
        ],
        candF: 10, candM: 4,
        /* 名单照攻略本《符文工厂海洋（最强攻略）》xls「喜好」表的分组：
           女性结婚候补 10（含索妮娅）、男性结婚候补 4（含亚赛尔）、全体居民、边境客串 3。
           每人前面的短称号就是原表的「昵称」列，职务之外不加形容词——上一版写的
           「教会相关」「老练渔夫」「人鱼族」都是凭印象编的，与表对不上。 */
        chars: [
            { name: '亚赛尔', jp: 'アゼル', role: '主角·花婿候补', cv: '', note: '大地骑士。原表把他也列进了男性结婚候补——走索妮娅路线时他是对象。另译「阿杰尔」。' },
            { name: '索妮娅', jp: 'ソニア', role: '花嫁候补', cv: '', note: '青梅竹马。身体被夺走后以灵魂形式与亚赛尔共用一个身体，本作的核心悬念就在她身上。' },
            { name: '莉莉', jp: 'リリ', role: '花嫁候补', cv: '', note: '歌姬大姐。旅店三姐妹里的老大。' },
            { name: '奥黛特', jp: 'オデット', role: '花嫁候补', cv: '', note: '厨师二姐。三姐妹里的老二，旅店的厨娘，也是主角落脚处的介绍人。' },
            { name: '艾伊利斯', jp: 'アイリス', role: '花嫁候补', cv: '', note: '护士小妹。三姐妹里的老幺，在医院当护士。' },
            { name: '伊莱克特拉', jp: 'エレクトラ', role: '花嫁候补', cv: '', note: '打工贵族。' },
            { name: '莎拉', jp: 'サラ', role: '花嫁候补', cv: '', note: '摸鱼妹子。' },
            { name: '艾琳娜', jp: 'エレナ', role: '花嫁候补', cv: '', note: '魔像大师。巨人优米尔相关的一摊事都归她管。' },
            { name: '命', jp: 'メイ', role: '花嫁候补', cv: '', note: '护岛武士。' },
            { name: '梅尔普琳', jp: 'メルプリン', role: '花嫁候补', cv: '', note: '精灵女仆。' },
            { name: '潘多拉', jp: 'パンドラ', role: '花嫁候补', cv: '', note: '萝莉魔王。' },
            { name: '詹姆斯', jp: 'ジェームス', role: '花婿候补', cv: '', note: '牛仔行商。' },
            { name: '乔', jp: 'ジョー', role: '花婿候补', cv: '', note: '宝藏猎人。原表写作「乔伊」。' },
            { name: '俾斯麦', jp: 'ビスマルク', role: '花婿候补', cv: '', note: '杂货店主。' },
            { name: '优米尔', jp: 'ユミル', role: '关键角色', cv: '', note: '巨人。载着主角在海上移动、从海底把整座岛与沉船捞起来。不是居民，没有生日与喜好。' },
            { name: '巴克斯', jp: 'バッカス', role: '居民', cv: '', note: '钓鱼大爷。' },
            { name: '格雷', jp: 'グレー', role: '居民', cv: '', note: '教堂神父。' },
            { name: '琪芦多', jp: 'キルト', role: '居民', cv: '', note: '教堂女孩。' },
            { name: '尼特', jp: 'ニット', role: '居民', cv: '', note: '教堂男孩。' },
            { name: '波拿巴尔特', jp: 'ボナパルト', role: '居民', cv: '', note: '小岛市长。' },
            { name: '洁丝琳', jp: 'ジャスリン', role: '居民', cv: '', note: '考古学家。' },
            { name: '阿涅多', jp: 'アネット', role: '居民', cv: '', note: '急速邮差。原表注「每月 4 日来访」，属边境客串。' },
            { name: '塔芭莎', jp: 'タバサ', role: '居民', cv: '', note: '精灵女仆。原表注「市长、梅尔普琳、伊莱克特拉好感都满 6 心后，每周五 12:00~18:00 来访」，属边境客串。' },
            { name: '糖糖', jp: 'キャンディ', role: '居民', cv: '', note: '符文专家。原表注「男女主角分离后，每周二来访」，属边境客串。' },
        ],
    },
    {
        id: 'rf4', no: 'Ⅳ', name: '符文工房4/豪华版', short: 'RF4/DX',
        jp: 'ルーンファクトリー4', en: 'Rune Factory 4',
        date: '2019-07-25', plat: 'Nintendo Switch／PC／PS4／Xbox One', dev: 'Neverland／HAKAMA', pub: 'Marvelous',
        orig: { date: '2012-07-19', plat: 'Nintendo 3DS', dev: 'Neverland', pub: 'Marvelous AQL' },
        ver: '日版 Switch 2019.07.25｜中文·亚洲 2019.12.05｜欧美 Switch 2020.02｜PS4／Xbox One／PC 2021.12.07',
        pc: {
            note: 'Steam（Windows）版系统需求（60FPS 目标），数据取自 Steam 商店页与官网。需 64 位系统。',
            rows: [
                ['操作系统', 'Windows 10（64 位）', 'Windows 10（64 位）'],
                ['处理器', 'Intel Core i5-6400', 'Intel Core i5-9300H'],
                ['内存', '8 GB RAM', '16 GB RAM'],
                ['显卡', 'Intel HD Graphics HD530', 'NVIDIA GTX 1650Q'],
                ['DirectX', 'Version 11', 'Version 11'],
                ['存储空间', '5 GB 可用空间', '5 GB 可用空间']
            ]
        },
        stage: '赛尔菲亚', stageJp: 'セルフィア', hero: '雷斯特／芙蕾', heroJp: 'レスト／フレイ',
        god: '风幻龙 赛尔泽薇德（Ventuswill）',
        grad: ['#3f7f3a', '#93c977'], hue: 120,
        tagline: '掉在龙身上，然后当上了王子／公主',
        intro: '主角在前往赛尔菲亚的途中被盗贼袭击，失去记忆并从飞行船坠落，正好落在风幻龙赛尔泽薇德身上。为了回报收留之恩，主角代理王族职务，成了这座小镇的王子或公主。本站把 2012 年 3DS 原版与 2019 年起的豪华版合在这一个条目下，两版差异见本页「版本」。',
        systems: [
            ['王子／公主点数', '完成居民委托累积点数，用来举办节日、修建设施、推进开发计划。本作的「经营小镇」感是系列最强的一作。'],
            ['大地之绊', '主角与生俱来的天赋，能与龙对话——这也是整条主线的钥匙。'],
            ['依赖与随机迷宫', '居民依赖系统 + 记忆之路等随机迷宫，刷装备与素材的主要去处。'],
            ['6 花嫁 + 6 花婿', '候补规模系列最大之一，每人都配有独立爱情线与婚后生活。'],
        ],
        candF: 6, candM: 6,
        chars: [
            { name: '雷斯特', jp: 'レスト', role: '主角', cv: '内山昂辉', note: '男主角。拥有「大地之绊」的少年。' },
            { name: '芙蕾', jp: 'フレイ', role: '主角', cv: '斋藤千和', note: '女主角。同样拥有「大地之绊」，性格开朗。' },
            { name: '玛格丽特', jp: 'マーガレット', role: '花嫁候补', cv: '悠木碧', bday: '春 21', note: '精灵。在餐厅经营音乐屋，战斗中能以歌声施法。重度惧高。' },
            { name: '琥珀', jp: 'コハク', role: '花嫁候补', cv: '佐藤聪美', bday: '春 26', note: '原是蝴蝶形魔物，被主角击败后变回人形，寄住在花店。' },
            { name: '芙缇', jp: 'フォルテ', role: '花嫁候补', cv: '小林沙苗', bday: '夏 22', note: '守护赛尔菲亚的女骑士，奇尔的姐姐。认真到有点顽固。' },
            { name: '小白', jp: 'シャオパイ', role: '花嫁候补', cv: '金元寿子', bday: '夏 26', note: '温泉旅馆「小铃」的看板娘，努力过头就容易出错。' },
            { name: '朵儿洁', jp: 'ドルチェ', role: '花嫁候补', cv: '竹达彩奈', bday: '冬 18', note: '原为人偶形魔物，说话带刺，寄住在医院。' },
            { name: '库洛丽嘉', jp: 'クローリカ', role: '花嫁候补', cv: '生天目仁美', bday: '春 12', note: '见习执事，站着就能睡着。' },
            { name: '比修奈尔', jp: 'ビシュナル', role: '花婿候补', cv: '浪川大辅', note: '见习执事，老实到容易被人骗。' },
            { name: '迪拉斯', jp: 'ディラス', role: '花婿候补', cv: '杉田智和', note: '原为水之遗迹 Boss 的黑色独角兽，人形时没有角。' },
            { name: '亚瑟', jp: 'アーサー', role: '花婿候补', cv: '铃木达央', note: '出身名门的执务官，擅长谈判，通晓王子事务。' },
            { name: '奇尔', jp: 'キール', role: '花婿候补', cv: '下野纮', note: '芙缇的弟弟，书不离手，热衷魔法研究。' },
            { name: '塔克', jp: 'ダグ', role: '花婿候补', cv: '增田俊树', note: '热血又一丝不苟的青年。' },
            { name: '雷昂', jp: 'レオン', role: '花婿候补', cv: '鸟海浩辅', note: '从石棺里蹦出来的轻浮男，意外地认真。' },
        ],
    },
    {
        id: 'rf5', no: 'Ⅴ', name: '符文工房5', short: 'RF5',
        jp: 'ルーンファクトリー5', en: 'Rune Factory 5',
        date: '2021-05-20', plat: 'Switch／Windows（2022-07-13）', dev: 'HAKAMA', pub: 'Marvelous／世嘉（亚洲）',
        pc: {
            note: 'Steam（Windows）版系统需求，数据取自官网 runefactory-5.com 与 Steam 商店页。需 64 位系统。',
            rows: [
                ['操作系统', 'Windows 8.1 or later（64 位）', 'Windows 8.1 or later（64 位）'],
                ['处理器', 'Intel Core i5-6500', 'Intel Core i5-9400'],
                ['内存', '8 GB RAM', '16 GB RAM'],
                ['显卡', 'Nvidia GTX 660 Ti', 'Nvidia GTX 1660 Ti'],
                ['DirectX', 'Version 11', 'Version 11'],
                ['存储空间', '9 GB 可用空间', '9 GB 可用空间']
            ]
        },
        stage: '里格巴斯', stageJp: 'リグバース', hero: '亚雷斯／爱丽丝', heroJp: 'アレス／アリス',
        god: '诺鲁德王国的守护龙',
        grad: ['#9a5b3a', '#d8a37c'], hue: 24,
        tagline: '加入 Seed，在边境小镇当一名警备队员',
        intro: '失去记忆的主角来到诺鲁德王国边境的小镇里格巴斯，被卷进符文异变事件，随后加入警备组织 Seed。系列第一次全面 3D 化，也是第一次同步推出中日英韩多语言亚洲版。',
        systems: [
            ['Seed 点数', '完成居民委托获得点数，可用来举办祭典、考取锻造／料理许可、开发道具与设施。'],
            ['全 3D 与自由镜头', '系列首次采用完整的 3D 场景与可旋转视角，代价是 Switch 版的帧率与读取速度。'],
            ['6 花嫁 + 6 花婿', '候补规模与 RF4 持平，并支持同性婚。'],
            ['同步多语言', '亚洲版 2021-09-02 推出，中日英韩同步；Steam 版 2022-07-13。'],
        ],
        candF: 6, candM: 6,
        chars: [
            { name: '亚雷斯', jp: 'アレス', role: '主角', cv: '', note: '男主角。失去记忆后加入 Seed。' },
            { name: '爱丽丝', jp: 'アリス', role: '主角', cv: '雨宫天', note: '女主角。为回报镇民的照顾成为 Seed 实习队员。' },
            { name: '普莉希拉', jp: 'プリシラ', role: '花嫁候补', cv: '水濑祈', note: '在里格巴斯长大的温柔女孩，因某个事件害怕走出小镇。' },
            { name: '丝卡蕾特', jp: 'スカーレット', role: '花嫁候补', cv: '洲崎绫', note: 'Seed 精英队员，半精灵。极度重视规则。' },
            { name: '露西', jp: 'ルーシー', role: '花嫁候补', cv: '井口裕香', note: '普莉希拉的青梅竹马，运动万能、不服输，其实怕寂寞。' },
            { name: '芙佳', jp: 'フーカ', role: '花嫁候补', cv: '丰崎爱生', note: '兽耳族女孩。还不会说人类语言，靠野性直觉辨真伪。' },
            { name: '露德蜜拉', jp: 'ルドミラ', role: '花嫁候补', cv: '诸星堇', note: '梦魔。追求极限情境下的「幸福感」，对主角格外着迷。' },
            { name: '碧翠丝', jp: 'ベアトリス', role: '花嫁候补', cv: '', note: '出身特殊、拘谨有礼的少女。' },
            { name: '马丁', jp: 'マーティン', role: '花婿候补', cv: '福山润', note: '以一流锻冶师为目标的学徒，话少、匠人气。' },
            { name: '莱因哈特', jp: 'ラインハルト', role: '花婿候补', cv: '花江夏树', note: '向诺鲁德王国宣誓忠诚的骑士。' },
            { name: '塞西尔', jp: 'セシル', role: '花婿候补', cv: '村濑步', note: '马丁的弟弟，梦想成为侦探。' },
            { name: '丛云', jp: 'むらくも', role: '花婿候补', cv: '武内骏辅', note: '经营里格巴斯唯一旅馆的兽耳族青年，豪爽但赤字连连。' },
            { name: '卢卡斯', jp: 'ルーカス', role: '花婿候补', cv: '森久保祥太郎', note: '丧失记忆的神秘绅士，学识渊博。' },
            { name: '流卡', jp: 'リュカ', role: '花婿候补', cv: '', note: '在帕尔摩工房一带活动的青年。' },
            { name: '莉薇亚', jp: 'リヴィア', role: '居民', cv: '千本木彩花', note: 'Seed 里格巴斯署署长，外表年幼但年纪成谜。' },
            { name: '西蒙娜', jp: 'シモーヌ', role: '居民', cv: '高野麻里佳', note: '兼任镇长的女医生，会把新药若无其事地用在病人身上。' },
            { name: '泰瑞', jp: 'テリー', role: '居民', cv: '八代拓', note: '以侦探为本业的万事通。' },
            { name: '阳菜', jp: 'ヒナ', role: '居民', cv: '夏川椎菜', note: '被主角救下的兽人女孩，三天热度。' },
            { name: '艾尔榭', jp: 'エルシェ', role: '居民', cv: '鬼头明里', note: '餐厅经营者，普莉希拉的姐姐。' },
            { name: '奥兹华', jp: 'オズワルド', role: '居民', cv: '茶风林', note: '在里格巴斯附近活动的盗贼团头目。' },
        ],
    },
    {
        id: 'azuma', no: '龍', name: '符文工房 龙之天地', short: '龙之天地',
        jp: 'ルーンファクトリー 龍の国', en: 'Rune Factory: Guardians of Azuma',
        date: '2025-06-05', plat: 'Switch／Switch 2／Windows（PS5／XsX 2026-02-13）', dev: 'Marvelous', pub: 'Marvelous',
        pc: {
            note: 'Steam（Windows）版系统需求，数据取自 Steam 商店页。需 64 位系统。',
            rows: [
                ['操作系统', 'Windows 10／11', 'Windows 10／11'],
                ['处理器', 'Intel Core i5-10400', 'Intel Core i7-9700'],
                ['内存', '8 GB RAM', '16 GB RAM'],
                ['显卡', 'NVIDIA GeForce GTX 1650 SUPER', 'NVIDIA GeForce RTX 2060 SUPER'],
                ['DirectX', 'Version 11', 'Version 11'],
                ['存储空间', '20 GB 可用空间', '20 GB 可用空间']
            ]
        },
        stage: '东国', stageJp: 'アズマ', hero: '昴流／辉夜', heroJp: 'スバル／カグヤ',
        god: '东国的诸神',
        grad: ['#8f2f4a', '#d98aa0'], hue: 344,
        tagline: '舞台离开诺鲁德，第一次走向东方',
        intro: '系列第一次把舞台搬到充满东方风情的「东国」。世界因「龙星殒落」而大地能量枯竭，主角作为「大地舞者」，靠舞蹈与祭祀修复大地、唤回神明，并重建被灾害摧毁的村落。',
        systems: [
            ['大地舞者', '以「舞」为核心动作：舞蹈既是战斗手段，也是复兴大地的仪式。'],
            ['村落复兴', '重建东国各村，配置居民与设施，系列少见的经营比重。'],
            ['东国的神', '把既有的「幻龙」体系换成东国神祇，可与神结缘并获得加护。'],
            ['平台跨度', '2025-06-05 Switch／Switch 2／Windows，2026-02-13 追加 PS5 与 Xbox Series X|S。'],
        ],
        candF: 7, candM: 7,
        chars: [
            { name: '昴流', jp: 'スバル', role: '主角', cv: '榎木淳弥', note: '浪迹天涯的猎人，出身东国北方的贫苦村落，与辉夜是同乡的青梅竹马。' },
            { name: '辉夜', jp: 'カグヤ', role: '主角', cv: '石川由依', note: '漂泊的巫女，与昴流同乡。喜欢与自然里的花草和魔物说话。' },
            { name: '摩可绒', jp: 'モコロン', role: '关键角色', cv: '加隈亚衣／井上和彦（白龙形态）', note: '主角的搭档，调皮爱闹又贪吃，本名「天翔婿白命」，真身为白龙。' },
            { name: '玛罗', jp: 'マウロ', role: '花婿候补', cv: '梶裕贵', note: '乘飞艇从异国来的冒险家，自称寻宝猎人，泪点极低，是薇薇亚修一族的人。' },
            { name: '村雨', jp: 'ムラサメ', role: '花婿候补', cv: '古川慎', note: '立志成为天下无双的剑士，无念无想流真传，每天必保养配剑。' },
            { name: '鞍马', jp: 'クラマ', role: '花婿候补', cv: '三木真一郎', note: '掌管秋季与风的智神，冷静博学，被称作众神中的军师。' },
            { name: '吹雪', jp: 'フブキ', role: '花婿候补', cv: '齐藤壮马', note: '掌管冬季与流水的狼半兽神，性格温和，厌恶伤害他人。' },
            { name: '魁', jp: 'カイ', role: '花婿候补', cv: '诹访部顺一', note: '掌管根国的鬼神，鬼族大将，平日戴面具不以真面目示人。' },
            { name: '斑鸠', jp: 'イカルガ', role: '花婿候补', cv: '小林裕介', note: '幕府「阴阳寮」派来的阴阳师，统率式神军团「阵笠众」。' },
            { name: '追岚', jp: 'ツイラン', role: '花婿候补', cv: '河西健吾', note: '住在秋之里的沉默机关师，恋爱剧情在 DLC。' },
            { name: '妃那', jp: 'ひな', role: '花嫁候补', cv: '夏川椎菜', note: '狐族兽耳人，与玛罗同乘飞艇而来，自称考古学家——就是 RF5 的那个阳菜。' },
            { name: '伊吕波', jp: 'いろは', role: '花嫁候补', cv: '和气杏未', note: '春之里伊吕波茶屋的招牌店员，开朗热心，盼着春之里恢复生机。' },
            { name: '丽日', jp: 'うららか', role: '花嫁候补', cv: '上田丽奈', note: '掌管春季与音乐的和神，稳重温柔，只盼人人平安。' },
            { name: '祭', jp: 'マツリ', role: '花嫁候补', cv: '安济知佳', note: '掌管夏季与剑的战神，天真烂漫、爱动，遇事总想用力气解决。' },
            { name: '彼方', jp: 'カナタ', role: '花嫁候补', cv: 'Lynn', note: '掌管天与光的主神，众神的代表。头脑清晰、认真，也带点孩子气。' },
            { name: '克拉丽丝', jp: 'クラリス', role: '花嫁候补', cv: '菲鲁兹·蓝', note: '神秘组织「黎明」的首领，军装丽人，站在这场灾害的另一侧。' },
            { name: '皮莉卡', jp: 'ピリカ', role: '花嫁候补', cv: '古贺葵', note: '来自东国遥远北方的猎人，尊重生命法则，恋爱剧情在 DLC。' },
            { name: '坂木', jp: 'サカキ', role: '居民', cv: '大冢芳忠', note: '春之里的村长。' },
            { name: '拓弥', jp: 'タクミ', role: '居民', cv: '桧山修之', note: '春之里的木工，村落复兴的施工担当。' },
            { name: '铃', jp: 'すず', role: '居民', cv: '久野美咲', note: '伊吕波的妹妹，立志当偶像。' },
            { name: '翡翠', jp: 'ヒスイ', role: '居民', cv: '鲸', note: '擅长姓名占卜的占卜师。' },
        ],
    },
];

;
/* 与本页数据同源的分组表，供菜单与标题用；正文包里有同名的 GROUPS，
   所以这里换个名字，免得多一个 <script> 就撞一次 const 重声明。 */
var GROUPS_META = [
    {
        "key": "basic",
        "title": "基础知识",
        "en": "BASICS"
    },
    {
        "key": "life",
        "title": "牧场生活",
        "en": "FARM LIFE"
    },
    {
        "key": "event",
        "title": "活动事件",
        "en": "EVENTS"
    },
    {
        "key": "item",
        "title": "物品道具",
        "en": "ITEMS"
    },
    {
        "key": "lore",
        "title": "资料与设定",
        "en": "LORE"
    }
];
var PAGES_META = [
    {
        "key": "intro",
        "group": "basic",
        "title": "游戏简介",
        "icon": "scroll"
    },
    {
        "key": "diff",
        "group": "basic",
        "title": "移植版对照",
        "icon": "books",
        "gms": [
            "rf3",
            "rf4"
        ]
    },
    {
        "key": "spec",
        "group": "basic",
        "title": "配置与模拟器",
        "icon": "gear"
    },
    {
        "key": "world",
        "group": "basic",
        "title": "世界设定·符文",
        "icon": "globe"
    },
    {
        "key": "stage",
        "group": "basic",
        "title": "舞台与主角",
        "icon": "flag"
    },
    {
        "key": "time",
        "group": "basic",
        "title": "时间与季节",
        "icon": "clock"
    },
    {
        "key": "rp",
        "group": "basic",
        "title": "体力与 RP",
        "icon": "bolt"
    },
    {
        "key": "control",
        "group": "basic",
        "title": "操作方式",
        "icon": "pad"
    },
    {
        "key": "rfomain",
        "group": "basic",
        "title": "主线流程",
        "icon": "scroll",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "rfomap",
        "group": "basic",
        "title": "地图与出没",
        "icon": "compass",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "rfosail",
        "group": "basic",
        "title": "岛屿与打捞",
        "icon": "compass",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "rffevent",
        "group": "basic",
        "title": "主线与角色事件",
        "icon": "scroll",
        "gms": [
            "rff"
        ]
    },
    {
        "key": "rf3main",
        "group": "basic",
        "title": "主线流程",
        "icon": "scroll",
        "gms": [
            "rf3"
        ]
    },
    {
        "key": "battle",
        "group": "basic",
        "title": "战斗与弱点",
        "icon": "bolt"
    },
    {
        "key": "rfotip",
        "group": "basic",
        "title": "攻略本技巧",
        "icon": "star",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "boss",
        "group": "basic",
        "title": "BOSS 战",
        "icon": "skull",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rfo",
            "rf4",
            "rf5",
            "rff"
        ]
    },
    {
        "key": "farm",
        "group": "life",
        "title": "农场与田地",
        "icon": "sprout"
    },
    {
        "key": "home",
        "group": "life",
        "title": "自宅与扩建",
        "icon": "house2"
    },
    {
        "key": "shop",
        "group": "life",
        "title": "商店与设施",
        "icon": "shop"
    },
    {
        "key": "crop",
        "group": "life",
        "title": "农作",
        "icon": "seed"
    },
    {
        "key": "beast",
        "group": "life",
        "title": "魔物与伙伴",
        "icon": "monster"
    },
    {
        "key": "mbook",
        "group": "life",
        "title": "魔物图鉴",
        "icon": "paw"
    },
    {
        "key": "mine",
        "group": "life",
        "title": "采矿与钓鱼",
        "icon": "pick"
    },
    {
        "key": "cook",
        "group": "life",
        "title": "料理",
        "icon": "pot"
    },
    {
        "key": "craft",
        "group": "life",
        "title": "锻造与药学",
        "icon": "hammer"
    },
    {
        "key": "gear",
        "group": "life",
        "title": "装备打造·毕业套",
        "icon": "sword",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rff",
            "rfo",
            "rf4",
            "rf5"
        ]
    },
    {
        "key": "decorate",
        "group": "life",
        "title": "装饰与家具",
        "icon": "chair"
    },
    {
        "key": "rfosys",
        "group": "life",
        "title": "奖杯与许愿",
        "icon": "note",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "festival",
        "group": "event",
        "title": "年度节日",
        "icon": "calendar"
    },
    {
        "key": "love",
        "group": "event",
        "title": "恋爱与结婚",
        "icon": "ring"
    },
    {
        "key": "newly",
        "group": "event",
        "title": "新婚模式",
        "icon": "star",
        "gms": [
            "rf3",
            "rf4"
        ]
    },
    {
        "key": "request",
        "group": "event",
        "title": "委托任务",
        "icon": "board"
    },
    {
        "key": "weapon",
        "group": "item",
        "title": "武器",
        "icon": "sword"
    },
    {
        "key": "armor",
        "group": "item",
        "title": "防具",
        "icon": "shield"
    },
    {
        "key": "tool",
        "group": "item",
        "title": "农具",
        "icon": "hoe"
    },
    {
        "key": "material",
        "group": "item",
        "title": "素材与矿石",
        "icon": "gem"
    },
    {
        "key": "food",
        "group": "item",
        "title": "料理与食材",
        "icon": "bowl"
    },
    {
        "key": "potion",
        "group": "item",
        "title": "药品",
        "icon": "bottle"
    },
    {
        "key": "source",
        "group": "item",
        "title": "素材出处与掉落",
        "icon": "gem",
        "gms": [
            "rf1",
            "rf2",
            "rff",
            "rfo",
            "rf3",
            "rf4",
            "rf5",
            "azuma"
        ]
    },
    {
        "key": "perfume",
        "group": "item",
        "title": "香水与喜好",
        "icon": "bottle",
        "gms": [
            "rf3"
        ]
    },
    {
        "key": "rf1list",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rf1"
        ]
    },
    {
        "key": "rf2list",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rf2"
        ]
    },
    {
        "key": "rfflist",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rff"
        ]
    },
    {
        "key": "rf3list",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rf3"
        ]
    },
    {
        "key": "gift",
        "group": "life",
        "title": "魔物喜好",
        "icon": "gift",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rf4",
            "rf5",
            "rff",
            "rfo"
        ]
    },
    {
        "key": "produce",
        "group": "life",
        "title": "宠物产出",
        "icon": "pot",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rff",
            "rfo"
        ]
    },
    {
        "key": "npcgift",
        "group": "life",
        "title": "村民喜好",
        "icon": "users",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rff",
            "rfo",
            "rf4",
            "rf5",
            "azuma"
        ]
    },
    {
        "key": "recipe",
        "group": "item",
        "title": "配方大全",
        "icon": "book",
        "gms": [
            "rf1",
            "rf2",
            "rff",
            "rfo",
            "rf3",
            "rf4",
            "rf5",
            "azuma"
        ]
    },
    {
        "key": "fx",
        "group": "item",
        "title": "状态与抗性",
        "icon": "bolt",
        "gms": [
            "rf4",
            "rf5"
        ]
    },
    {
        "key": "rune",
        "group": "item",
        "title": "符文能力",
        "icon": "bolt",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rf4",
            "rf5",
            "rfo"
        ]
    },
    {
        "key": "fish",
        "group": "item",
        "title": "鱼类图鉴",
        "icon": "fish"
    },
    {
        "key": "fishspot",
        "group": "item",
        "title": "钓点与季节",
        "icon": "fish",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rf4",
            "rf5",
            "rfo",
            "rff",
            "azuma"
        ]
    },
    {
        "key": "series",
        "group": "lore",
        "title": "系列作品一览",
        "icon": "books"
    },
    {
        "key": "lore",
        "group": "lore",
        "title": "国家与幻龙",
        "icon": "dragon"
    },
    {
        "key": "race",
        "group": "lore",
        "title": "种族",
        "icon": "mask"
    },
    {
        "key": "zhname",
        "group": "lore",
        "title": "中文译名对照",
        "icon": "board",
        "gms": [
            "rf1",
            "rff",
            "rfo"
        ]
    },
    {
        "key": "seriescmp",
        "group": "lore",
        "title": "跨作机制对照",
        "icon": "compass"
    },
    {
        "key": "bdcheck",
        "group": "life",
        "title": "生日核对",
        "icon": "users"
    },
    {
        "key": "changelog",
        "group": "lore",
        "title": "更新日志",
        "icon": "note"
    },
    {
        "key": "azuma_skill",
        "group": "life",
        "title": "村民技能",
        "icon": "book",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_npc",
        "group": "life",
        "title": "角色详情",
        "icon": "users",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_mon",
        "group": "life",
        "title": "魔物与喜好",
        "icon": "monster",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_boss",
        "group": "life",
        "title": "BOSS 战",
        "icon": "boss",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_cook",
        "group": "life",
        "title": "料理配方",
        "icon": "pot",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_village",
        "group": "life",
        "title": "村庄升级",
        "icon": "flag",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_artifact",
        "group": "life",
        "title": "神器与舞",
        "icon": "note",
        "gms": [
            "azuma"
        ]
    }
];
var PAGE_COUNT = PAGES_META.length;

/* 条目可见性：带 gms 的条目只在指定作品下出现。
   放这里而不是 pages.js —— 首页、目录、名册都要用它，但那时正文包还没下。 */
function pageVis(p, g) {
    return !p.gms || (g && p.gms.indexOf(g.id) >= 0);
}

/* 每作角色档案条数与总数：构建时用 npcOf 现算后写死在这里，只为了
   首页／目录／页脚在人物档案包（k-npc.js）还没下来时也能显示正确的数。
   真正要读某个人物字段的地方仍然走 npcOf。 */
var NPC_STAT = {
    "total": 217,
    "byGame": {
        "rf1": 29,
        "rf2": 27,
        "rf3": 25,
        "rff": 31,
        "rfo": 24,
        "rf4": 27,
        "rf5": 33,
        "azuma": 21
    }
};

;
/* ============================================================
   路由与视图
   ============================================================ */

const LSKEY = 'rf_wiki_v1';

/* 作品卡配图：全部 16:9，铺满卡片顶部（不抠 logo、不做模糊底）。
   符文1/符文2 用 ROM 原生 256x192 无损 PNG（零修图：无拼接、无补边、无缩放、无插值），
   其余作是 960x540 的 JPG，两张双作卡预拼成 960x540（上下各一条）。
   单文件版没有外部文件可加载，_inline.py 会把 assets/title/*.jpg 与 *.png 转成 TITLE_DATA */
/* 每张都备一份 WebP（同尺寸、q84）：首页 8 张卡合计 860KB → 260KB，肉眼看不出差别。
   原图仍留在仓库里 —— 单文件版 _inline.py 按 src 打包成 TITLE_DATA，那条路不走 webp。 */
const TITLE_ART = {
    rf1:   { src: 'assets/title/rf1.png', webp: 'assets/title/rf1.webp', pos: '69%', tall: true },
    rf2:   { src: 'assets/title/rf2.png', webp: 'assets/title/rf2.webp', pos: '0%', tall: true },
    /* pair-rf3／pair-rf4 原是「本体＋移植版」双作合并卡的底图，两部 SP 并入本体后
       直接当作 3／4 的单卡图用；文件名沿用历史命名，内容仍是官方主视觉整图 */
    rf3:   { src: 'assets/title/pair-rf3.jpg', webp: 'assets/title/pair-rf3.webp', tall: true },
    rf4:   { src: 'assets/title/pair-rf4.jpg', webp: 'assets/title/pair-rf4.webp', tall: true },
    rf5:   { src: 'assets/title/rf5.jpg', webp: 'assets/title/rf5.webp', tall: true },
    rff:   { src: 'assets/title/rff.jpg', webp: 'assets/title/rff.webp', tall: true },
    rfo:   { src: 'assets/title/rfo.jpg', webp: 'assets/title/rfo.webp', tall: true },
    azuma: { src: 'assets/title/azuma.jpg', webp: 'assets/title/azuma.webp', tall: true },
};

/* 双作合并卡已取消：RF3／RF4 的移植版并入本体作品页，作品卡回归一作一张 */

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

/* 平台全名压缩（保留所有平台，不截断到第一个 ／） */
function platAll(p) {
    return p
        .replace(/Nintendo 3DS/g, '3DS')
        .replace(/Nintendo DS/g, 'NDS')
        .replace(/Nintendo Switch/g, 'Switch')
        .replace(/PlayStation 3/g, 'PS3')
        .replace(/PlayStation 4/g, 'PS4')
        .replace(/Xbox One/g, 'XB1')
        .replace(/Xbox Series X\|S/g, 'XsX')
        .replace(/Switch 2/g, 'NS2')
        .replace(/Windows/g, 'PC')
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
    /* 更新日志正文改成按需加载了，没载入时用打包时生成的摘要（_split_changelog.py）。
       载入之后仍按原文算；两份由 _test_changelog.js 断言一致。 */
    if (typeof CHANGELOG_HEAD !== 'undefined' && CHANGELOG_HEAD.latest
        && (typeof CHANGELOG_HTML === 'undefined')) {
        return CHANGELOG_HEAD.latest.slice(0, n);
    }
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

/* 页头的「更新于」：直接读更新日志第一条的日期，不再各处手写。
   以前是一串硬编码的 2026年10月27日，日志一天天往下加，这里却一直不动。 */
let _siteUpdated = '';
function siteUpdated() {
    if (_siteUpdated) return _siteUpdated;
    /* 同上：正文没载入时用摘要里的日期，别让每页页脚都去拉 400KB 的日志 */
    if (typeof CHANGELOG_HEAD !== 'undefined' && CHANGELOG_HEAD.updated
        && (typeof CHANGELOG_HTML === 'undefined')) {
        const h = CHANGELOG_HEAD.updated.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (h) _siteUpdated = `${h[1]}年${+h[2]}月${+h[3]}日`;
        if (_siteUpdated) return _siteUpdated;
    }
    try {
        const p = PAGE_MAP['changelog'];
        const m = ((p && p.body()) || '').match(/(\d{4})-(\d{2})-(\d{2})/);
        if (m) _siteUpdated = `${m[1]}年${+m[2]}月${+m[3]}日`;
    } catch (e) { }
    return _siteUpdated || '2026年10月27日';
}

/* 站点主页（#/）：站点层面的介绍与入口，不是某一部作品的攻略目录。
   攻略目录在 #/wiki，两者分开，跟版式参考站的结构一致。 */
/* 作品卡配图地址。单文件版没有外部文件可加载，_inline.py 会转成 TITLE_DATA */
function titleSrc(art) {
    if (!art) return '';
    /* 单文件版把图内联成 data URI，键是原图路径 */
    if (typeof TITLE_DATA !== 'undefined' && TITLE_DATA[art.src]) return TITLE_DATA[art.src];
    return art.webp || art.src;
}

function viewWelcome() {
    const g = cur();
    /* 用人物档案的总数，不是 data.js 里那份只收候补的旧名单 */
    const chars = npcTotal();
    const ups = latestUpdates(3);

    return `
    <div class="wcover">
        <div class="wcover-logo"><img src="assets/icon/icon-192.png" alt="" width="42" height="42"></div>
        <div class="wcover-jp">ルーンファクトリー</div>
        <div class="wcover-name">符文工房攻略百科</div>
        <div class="wcover-en">RUNE FACTORY WIKI</div>
        <div class="wcover-sub">非官方中文资料站</div>
        <div class="wcover-stat">
            <div><b>${GAMES.length}</b><span>部作品</span></div>
            <div><b>${PAGE_COUNT}</b><span>个条目</span></div>
            <div><b>${chars}</b><span>位角色</span></div>
        </div>
        <a class="wcover-go" href="#/wiki">进入攻略　›</a>
    </div>

    <div class="section-title"><span>选择作品</span><span class="en">TITLES</span></div>
    <div class="wgrid">
        ${GAMES.map(x => {
            const art = TITLE_ART[x.id];
            return `
            <a class="wcard${x.id === g.id ? ' cur' : ''}${art ? ' has-fig' : ''}" href="#/switch/${x.id}"
               style="background:linear-gradient(140deg, ${x.grad[0]}, ${x.grad[1]})">
                ${art ? `<div class="wcard-fig${art.tall ? ' is-tall' : ''}"><img src="${titleSrc(art)}" alt="" loading="lazy" decoding="async"${art.pos ? ` style="object-position:center ${art.pos}"` : ''}></div>` : ''}
                <div class="wcard-no">${x.no}</div>
                <div class="wcard-name"><span class="wpre">符文工房</span>${x.name.replace(/^符文工房\s*/, '')}</div>
                <div class="wcard-stage">${x.stage}</div>
                <div class="wcard-meta">${x.date.slice(0, 4)}　${platAll(x.plat)}${x.orig ? `　原版 ${platAll(x.orig.plat)} ${x.orig.date.slice(0, 4)}` : ''}</div>
            </a>`;}).join('')}
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
        <div>收录 ${GAMES.length} 部作品　/　${PAGE_COUNT} 个条目　/　${chars} 位角色</div>
        <div style="margin-top:0.4rem">本站为玩家整理性质，与 Marvelous Inc. 无隶属关系。所有游戏名称、角色名称版权归原权利人所有。</div>
    </div>`;
}

function viewHome(g) {
    const groups = GROUPS_META.map(grp => {
        const items = PAGES_META.filter(p => p.group === grp.key && pageVis(p, g));
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
            ${grp.key === 'life' && schedOf(g.id) ? `
                <a class="item" href="#/sched/${g.id}">
                    <div class="item-icon">${icon('clock')}</div>
                    <div class="item-text">村民行程</div>
                </a>` : ''}
        </div>`;
    }).join('');

    return `
    <div class="cover" style="background:linear-gradient(140deg, ${g.grad[0]}, ${g.grad[1]})">
        <div class="cover-jp">${g.jp}</div>
        <div class="cover-name">${g.name}</div>
        <div class="cover-en">${g.en}</div>
        <div class="cover-meta">
            <span>${platAll(g.plat)}</span>
            <span>${g.date}</span>
        </div>
    </div>
    <div class="quick">
        <div><div class="qk">发售</div><div class="qv">${g.date.replace(/-/g, '.')}</div></div>
        <div><div class="qk">平台</div><div class="qv">${platAll(g.plat)}</div></div>
        <div><div class="qk">舞台</div><div class="qv">${g.stage}</div></div>
        <div><div class="qk">主角</div><div class="qv">${g.hero}</div></div>
    </div>
    ${g.orig || g.pc ? `
    <div class="verhist">
        <div class="vh-title">版本与发行</div>
        ${g.orig ? `
        <div class="vh-sec">
            <div class="vh-sec-h">原版</div>
            <div class="vh-row"><span class="vh-k">发布平台</span><span class="vh-v">${platAll(g.orig.plat)}</span></div>
            <div class="vh-row"><span class="vh-k">发布时间</span><span class="vh-v">${g.orig.date.replace(/-/g, '.')}</span></div>
            <div class="vh-row"><span class="vh-k">开发商</span><span class="vh-v">${escHtml(g.orig.dev)}</span></div>
            <div class="vh-row"><span class="vh-k">发行商</span><span class="vh-v">${escHtml(g.orig.pub)}</span></div>
        </div>` : ''}
        <div class="vh-sec">
            <div class="vh-sec-h">${escHtml((g.name.split('/')[1] || '本作').trim())}</div>
            <div class="vh-row"><span class="vh-k">发布平台</span><span class="vh-v">${platAll(g.plat)}</span></div>
            <div class="vh-row"><span class="vh-k">发布时间</span><span class="vh-v">${g.date.replace(/-/g, '.')}</span></div>
            <div class="vh-row"><span class="vh-k">开发商</span><span class="vh-v">${escHtml(g.dev)}</span></div>
            <div class="vh-row"><span class="vh-k">发行商</span><span class="vh-v">${escHtml(g.pub)}</span></div>
        </div>
        ${g.pc ? `<div class="vh-note">PC 版系统配置、各平台模拟器设置见 <a class="link" href="#/page/spec">配置与模拟器 ›</a></div>` : ''}
        ${g.ver ? `<div class="vh-note">${escHtml(g.ver)}</div>` : ''}
    </div>` : ''}
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
        <div>当前收录：${g.name}　|　共 ${PAGES_META.filter(p => pageVis(p, g)).length} 个条目 / ${npcCount(g)} 位角色</div>
        <div style="margin-top:0.4rem">本站为玩家整理性质，与 Marvelous Inc. 无隶属关系。所有游戏名称、角色名称版权归原权利人所有。</div>
    </div>`;
}

function viewCat(key) {
    const grp = GROUPS_META.find(x => x.key === key);
    if (!grp) return viewError('没有这个分类');
    const g = cur();
    const items = PAGES_META.filter(p => p.group === key && pageVis(p, g));
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
    const grp = GROUPS_META.find(x => x.key === p.group);
    if (!pageVis(p, g)) {
        /* 可用作品可能不止一部（例：BOSS 战收 4 作、状态与抗性收 RF4/RF4S），
           所以按 p.gms 逐个列出来，不再写死某一作 */
        const gs = (p.gms || []).map(id => GAMES.find(x => x.id === id)).filter(Boolean);
        const names = gs.map(x => '《' + x.name + '》').join('、');
        const links = gs.map(x =>
            `<a class="link" href="#/switch/${x.id}">› 切换到《${x.name}》查看本条目</a>`).join('<br>');
        return `
    <div class="content">
        <div class="head">
            <div class="h1">${p.title}</div>
            <div class="time">${grp.title}　·　收录于${names}</div>
        </div>
        <p class="p">这一条的内容只对${names}成立，当前作品是<b>${g.name}</b>，所以没有可显示的正文——与其拿别作的数值凑一段，不如直接留白。</p>
        <div class="note">玩家整理的习惯是「没核实的宁可不写」。其他作品的同类内容（<b>${grp.title}</b> 一栏下的共通机制）仍然可以正常查看。</div>
        <p class="p">
            ${links}<br>
            <a class="link" href="#/cat/${grp.key}">› 回到「${grp.title}」目录</a>
        </p>
    </div>
    ${footer(g)}`;
    }
    return `
    <div class="content">
        <div class="head">
            <div class="h1">${p.title}</div>
            <div class="time">${grp.title}　·　更新于 ${siteUpdated()}</div>
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

/* ============================================================
   人物：居民 / 结婚候补 / 主角
   NPC_FULL（js/npcfull.js）覆盖 7 部作品 199 人，字段来自 biligame
   符文工厂 wiki 的人物页；没有对应源的作品（龙之天地）回退到 GAMES[].chars
   ============================================================ */

/* 移植版已并入本体作品页，两版共用一份人物档案，不再需要别名映射 */
const NPC_KEY = {};

/* 只取「条数」的两处（首页统计、页脚）不加载人物档案包也能答：
   pages-meta.js 里的 NPC_STAT 是构建时用 npcOf 现算后写下的，口径同源。
   k-npc.js 没下来时若还去调 npcOf，会退回 data.js 那份只收候补的旧名单。 */
function npcCount(g) {
    if (typeof NPC_STAT !== 'undefined' && NPC_STAT.byGame && NPC_STAT.byGame[g.id] != null) return NPC_STAT.byGame[g.id];
    return npcOf(g).length;
}
function npcTotal() {
    if (typeof NPC_STAT !== 'undefined' && NPC_STAT.total != null) return NPC_STAT.total;
    return GAMES.reduce((s, x) => s + npcOf(x).length, 0);
}

function npcOf(g) {
    const k = NPC_KEY[g.id] || g.id;
    const full = (typeof NPC_FULL !== 'undefined') && NPC_FULL[k];
    if (full && full.length) return full;
    const base = (g.chars || []).map(c => ({
        n: c.name, j: c.jp || '', r: c.role || '', cv: c.cv, nt: c.note, bd: c.bday || ''
    }));
    /* 龙之天地没有进 npcfull 的七作模板：g.chars 只有名字，生日／喜好全空。
       角色页（post/1837–1852）与礼物表（post/1853）里有真数据，按日文名／中文名
       对上去合并，缺什么不补什么——合并不上就保持原样，不猜。 */
    if (g.id === 'azuma') {
        const C = (typeof NPC_AZUMA !== 'undefined') ? NPC_AZUMA.chars : [];
        const GF = (typeof AZUMA_GIFT !== 'undefined') ? AZUMA_GIFT : [];
        const put = (o, k2, v) => { if (v && (!o[k2] || !String(o[k2]).length)) o[k2] = v; };
        base.forEach(x => {
            const c = C.filter(y => y.jp && y.jp === x.j)[0];
            if (c) {
                put(x, 'e', c.en);
                put(x, 'cv', c.cvJp);
                put(x, 'bd', c.bd);
                put(x, 'nt', c.intro.join(''));
                put(x, 'b', c.like.best);
                put(x, 'l', c.like.good);
                put(x, 'h', c.like.bad);
                put(x, 'w', c.like.worst);
                put(x, 'g', (c.gift.ret || []).join('、'));
                put(x, 'bg', (c.gift.birthday || []).join('、'));
            }
            const f = GF.filter(y => y.n === x.n)[0];
            if (f) {
                put(x, 'bd', f.bd);
                put(x, 'b', f.b);
                put(x, 'l', f.l);
                put(x, 'h', f.h);
                put(x, 'w', f.w);
                put(x, 'g', (f.ret || []).join('、'));
                put(x, 'bg', (f.bgYou || []).join('、'));
            }
        });
    }
    return base;
}

/* 花嫁候补 / 花婿候补 / 结婚候补 统一归为「结婚候补」——各作源的叫法不一样 */
function roleGroup(r) {
    if (!r) return '居民';                    /* 源页是村民名册，非候补即居民 */
    if (r === '主角') return '主角';
    if (/花嫁|花婿|结婚/.test(r)) return '结婚候补';
    if (r === '关键角色') return '关键角色';
    return '居民';
}

const SEASON_I = { '春': 0, '夏': 1, '秋': 2, '冬': 3 };
function bdayKey(s) {
    const m = /^([春夏秋冬])月?(\d+)/.exec(s || '');
    return m ? SEASON_I[m[1]] * 100 + Number(m[2]) : 9999;
}

/* 每部作品的礼物机制差异——不写清楚，读者会以为我们漏收 */
const GIFT_NOTE = {
    rf1: 'RF1 的机制里<b>没有「讨厌」与「最讨厌」</b>两档：送错了不掉好感，只是不涨。所以本作只有最喜欢与喜欢两份清单。',
    rf2: 'RF2 <b>没有「最喜欢」档</b>，只有喜欢与讨厌；生日礼物是单独指定的一件东西，收益高于平时送的喜欢品。',
    rf3: 'RF3 除了四档礼物，每位候补还有<b>喜欢的香水</b>——香水是独立于料理与素材的一条加成线，本作独有。',
    rf4: 'RF4 的四档齐全，另有<b>回赠品</b>：送礼之后对方会回一件东西，类型因人而异（料理、素材、失败作……）。',
    rf5: 'RF5 把清单叫「喜欢的东西／讨厌的东西」，另设<b>回礼</b>与<b>生日礼物</b>两项。',
    rff: '边境<b>没有「最讨厌」档</b>，只有最喜欢／喜欢／讨厌三份；且同一件东西在不同作里的译名不一样，别名一栏收的是民间译法。',
    rfo: '海洋<b>没有「最讨厌」档</b>；本作角色名在 wiki 源里按 RF4S 官方译名写，与民间译法的差异记在别名一栏。'
};

function tasteTags(arr, cls) {
    if (!arr || !arr.length) return '<span class="mon-no">—</span>';
    return arr.map(x => `<span class="tag ${cls}">${escHtml(x)}</span>`).join('');
}

function viewResident(gameId, role, sort) {
    const g = GAMES.find(x => x.id === gameId) || cur();
    const all = npcOf(g);
    const active = role || '全部';
    const byBd = sort === 'bd';
    const roles = ['全部', '主角', '结婚候补', '居民'];
    const hasRole = k => all.some(x => roleGroup(x.r) === k);

    let list = all.filter(x => active === '全部' || roleGroup(x.r) === active);
    if (byBd) list = list.slice().sort((a, b) => bdayKey(a.bd) - bdayKey(b.bd) || String(a.n).localeCompare(String(b.n)));

    const withBd = all.filter(x => x.bd).length;
    const withCv = all.filter(x => x.cv).length;
    const marry = all.filter(x => roleGroup(x.r) === '结婚候补').length;
    const q = k => `#/resident/${g.id}/${encodeURIComponent(k)}${byBd ? '/bd' : ''}`;

    return `
    <div class="section-title"><span>${g.short}　居民</span><span class="en">RESIDENTS</span></div>
    <div class="filter-bar">
        ${roles.filter(k => k === '全部' || hasRole(k)).map(k => `<a class="filter-btn ${k === active ? 'on' : ''}"
            href="${q(k)}">${k}</a>`).join('')}
        <a class="filter-btn sort-btn ${byBd ? 'on' : ''}"
           href="#/resident/${g.id}/${encodeURIComponent(active)}${byBd ? '' : '/bd'}">${byBd ? '✓ 按生日排' : '按生日排'}</a>
        ${schedOf(g.id) ? `<a class="filter-btn" href="#/sched/${g.id}">每日行程</a>` : ''}
    </div>
    ${all.length ? `<div class="npc-sum">
        <span><b>${all.length}</b> 人</span>
        <span>结婚候补 <b>${marry}</b></span>
        <span>生日已知 <b>${withBd}</b></span>
        <span>声优已知 <b>${withCv}</b></span>
    </div>
    ${!list.length ? `<div class="empty">这个分类下暂无角色<br><span style="font-size:0.74rem">换个分类看看，或点「全部」</span></div>` : ''}
    <div class="npc-list">
        ${list.map(x => {
            const idx = all.indexOf(x);
            const rg = roleGroup(x.r);
            const fav = (x.b || x.l || []).slice(0, 3);
            const face = faceSrc(g.id, x.j);
            return `<a class="npc-card" href="#/char/${g.id}/${encodeURIComponent(x.n)}">
                ${face
                    ? `<div class="npc-av has-face"><img src="${face}" alt="" loading="lazy" decoding="async"></div>`
                    : `<div class="npc-av" style="background:linear-gradient(150deg,
                    hsl(${(g.hue + idx * 37) % 360} 42% 58%), hsl(${(g.hue + idx * 37 + 26) % 360} 46% 44%))">${String(x.n).slice(0, 1)}</div>`}
                <div class="npc-main">
                    <div class="npc-name">${escHtml(x.n)}<span class="npc-jp">${escHtml(x.j || '')}</span></div>
                    <div class="npc-meta">
                        ${rg ? `<span class="tag role-${rg === '结婚候补' ? 'marry' : rg === '主角' ? 'hero' : 'town'}">${escHtml(x.r)}</span>` : ''}
                        ${x.bd ? `<span class="npc-bd">🎂 ${x.bd}</span>` : ''}
                        ${x.cv ? `<span class="npc-cv">CV ${escHtml(x.cv)}</span>` : ''}
                    </div>
                    ${fav.length ? `<div class="npc-fav">${fav.map(f => `<span class="tag fav">${escHtml(f)}</span>`).join('')}${(x.b || x.l).length > 3 ? `<span class="npc-more">+${(x.b || x.l).length - 3}</span>` : ''}</div>` : ''}
                </div>
                ${icon('chev', 'chev')}
            </a>`;
        }).join('')}
    </div>` : `<div class="empty">这个分类下暂未收录角色</div>`}
    ${GIFT_NOTE[NPC_KEY[g.id] || g.id] ? `<div class="content" style="margin-top:0;padding-top:0">
        <div class="note">${GIFT_NOTE[NPC_KEY[g.id] || g.id]}</div>
    </div>` : ''}
    ${byBd ? `<div class="note" style="margin:0 0.9rem 0.6rem">已按游戏内日期排序：春 → 夏 → 秋 → 冬。生日当天送礼的好感加成显著高于平日，提前一天备好礼物即可。</div>` : ''}
    <div class="copyright">
        <div>角色档案改编自 biligame 符文工厂 wiki 的人物页（CC BY-SA），译名以作品官方中文版为准</div>
        <div>未核实的字段留空，不做推测填写</div>
    </div>`;
}

/* ---------- 这个人名下的委托／支线 ----------
   各作的委托数据里，有的按人挂了、有的没有。这里只做「照表归位」，不猜、不补：
     RF1  支线标题里有人名 → 整条列（8 条支线里只有 4 条的标题带人名）；标题没有、分步里提到的，
          只列该步并标明「由别人起头」
     RF2  委托条的 w 字段就是委托人
     RF3  总序号的前缀（希雅-布告栏-01）与中文名的「人名：」，都是委托人
     RF4  委托表只有物品／种子奖励三组，没有按人分的行；这一作按人挂的是恋爱页那 12 条结婚支线，
          数据在 NPC_EVENT.rf4，与恋爱页共用一份
     RF5  委托表没有委托人一列（序号／中文名／解锁／报酬），只说明与恋爱线的关系，不编归属
   匹配只用「这人叫什么」加别名；源表写法与站内名不同的两处（阿利希雅／多罗茜）单独对一下，
   显示仍是源表原文。 */
function personalEventHtml(gid, c) {
    const dash = '<span class="mon-no">—</span>';
    const cell = v => (v === null || v === undefined || v === '') ? dash : escHtml(v);
    const nm = String(c.n || '');
    if (!nm) return '';

    const alias = String(c.al || '').split(/[、,，／\/]/).map(x => x.trim()).filter(Boolean);
    /* 源表与站内名的写法差：只用于匹配 */
    const SRC = {
        '阿利希雅': '阿莉希亚', '多罗茜': '多萝茜',
        '塞希莉亚': '塞希莉娅', '萝赛塔': '萝洁塔', '夏萝思': '夏伦', '基尔': '奇尔'
    };
    const keys = [nm].concat(alias);
    Object.keys(SRC).forEach(k => { if (SRC[k] === nm) keys.push(k); });
    const isMe = s => keys.some(k => k && String(s || '') === k);
    const hasMe = s => keys.some(k => k && String(s || '').indexOf(k) >= 0);

    const table = (cols, rows, lefts, cls) => `
<div class="table ${cls || ''}"><table>
<thead><tr>${cols.map(h => `<th class="th">${escHtml(h)}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td class="td${lefts && lefts.indexOf(i) >= 0 ? ' left' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div>`;

    /* ===== 三代：总序号前缀即委托人，280 条全表按人切 ===== */
    if (gid === 'rf3') {
        const Q = (typeof RF3_REQUEST !== 'undefined') ? RF3_REQUEST : null;
        if (!Q || !Q.groups) return '';
        const mine = [];
        Q.groups.forEach(g => g.rows.forEach(r => {
            const who = String(r[0] || '').split('-')[0];
            if (isMe(who) || hasMe(r[1])) mine.push({ kind: g.name, r: r });
        }));
        if (!mine.length) return '';
        const ch = {};
        mine.forEach(x => { const p = String(x.r[0] || '').split('-'); const k = p[1] || x.kind; ch[k] = (ch[k] || 0) + 1; });
        const chain = mine.filter(x => String(x.r[2] || '').trim()).length;
        return `
        <h2 class="h2">这个人名下的委托：${mine.length} 条</h2>
        <p class="p">三代的委托不长在板上，长在人身上：<b>总序号</b>的前缀就是委托人，<b>前置支线</b>写着上一条的编号，照着串下去就是一条完整的人线。这位的 ${mine.length} 条里，<b>${chain} 条挂了前置</b>，入口分布是 ${Object.keys(ch).map(k => k + ' ' + ch[k] + ' 条').join('、')}。列与<a href="#/page/request">委托任务</a>页那张全表同一份，一字未改。</p>
        ${table(['总序号', '中文名', '前置支线', '好感度', '前置条件', '内容', '变化', '报酬'],
            mine.map(x => [cell(x.r[0]), '<b>' + escHtml(x.r[1]) + '</b>', cell(x.r[2]), cell(x.r[3]), cell(x.r[4]), cell(x.r[5]), cell(x.r[6]), cell(x.r[7])]),
            [1, 2, 3, 4, 5, 6, 7], 'pev')}
        <div class="note">「好感度」写成 <code>${escHtml(nm)}❤3</code> 这样，人名与心数在源表同一格里，照录不拆。空着的格子＝源表写「-」，本站显示为灰破折号；<b>前置支线空＝链条起点</b>，好感度空＝这一条不设门槛。</div>`;
    }

    /* ===== 二代：w 字段是委托人 ===== */
    if (gid === 'rf2') {
        const Q = (typeof RF2_QUEST !== 'undefined') ? RF2_QUEST : null;
        if (!Q || !Q.quests) return '';
        const mine = Q.quests.filter(q => isMe(q.w) || isMe(q.n));
        const extra = (Q.extra || []).filter(q => hasMe(q.w) || isMe(q.n));
        const marry = (Q.marriage || []).filter(m => hasMe(m.n));
        if (!mine.length && !extra.length && !marry.length) return '';
        return `
        <h2 class="h2">这个人名下的委托：${mine.length + extra.length} 条</h2>
        <p class="p">二代和三代一样，委托挂在人身上：源表的委托人一栏写谁，这条就是谁的。流程里的「→」是源表自己用来串步骤的，<b>本站没有重排顺序</b>。</p>
        ${mine.length ? table(['委托', '触发条件', '流程', '报酬'],
            mine.map(q => ['<b>' + escHtml(q.t) + '</b>', cell(q.c), cell(q.f), cell(q.r)]), [0, 1, 2, 3], 'pev') : ''}
        ${extra.length ? table(['补表条目', '内容', '为什么另收'],
            extra.map(q => ['<b>' + escHtml(q.t) + '</b>', cell(q.x), cell(q.why)]), [0, 1, 2], 'pev') : ''}
        ${marry.length ? `<div class="key">${marry.map(m => `与这个人的婚事挂在一条委托上：<b>${escHtml(m.item)}</b>——${escHtml(m.said)}（${escHtml(m.where)}）。`).join('')}</div>` : ''}
        <div class="note">第二代有两套来源（主表 118 条、补表 6 条），同一条在两套里译名不一定相同，<b>照录不合并</b>：例如站内档案写「阿莉希亚」，主表的委托人写「阿利希雅」。匹配按人名对上了，显示仍是源表原文。</div>`;
    }

    /* ===== 一代：8 条支线，标题带人名的只有 4 条 ===== */
    if (gid === 'rf1') {
        const Q = (typeof RF1_REQUEST !== 'undefined') ? RF1_REQUEST : null;
        if (!Q || !Q.items) return '';
        const main = Q.items.filter(it => hasMe(it.t));
        const side = Q.items.filter(it => !hasMe(it.t) && it.steps.some(s => hasMe(s)));
        if (!main.length && !side.length) return '';
        const block = it => `
        <h3 class="h3">${escHtml(it.t)}　${it.steps.length} 步</h3>
        <div style="margin:.2rem 0 .9rem 0">
        ${it.steps.map(s => `<p class="p" style="margin:.18rem 0 .18rem 1rem;padding-left:.9rem;border-left:3px solid var(--line,#ddd)">${escHtml(s)}</p>`).join('\n        ')}
        </div>`;
        const sideBlock = it => {
            const hitSteps = it.steps.filter(s => hasMe(s));
            return `
        <h3 class="h3">${escHtml(it.t)}（此人出现在其中几步）</h3>
        <div style="margin:.2rem 0 .9rem 0">
        ${hitSteps.map(s => `<p class="p" style="margin:.18rem 0 .18rem 1rem;padding-left:.9rem;border-left:3px solid var(--line,#ddd)">${escHtml(s)}</p>`).join('\n        ')}
        </div>`;
        };
        return `
        <h2 class="h2">这个人牵到的支线：${main.length + side.length} 条</h2>
        <p class="p">一代没有委托板，能给玩家的额外目标全在<b>支线剧情</b>里，而支线的起头往往就是某个村民的一句话。${main.length ? `<b>${main.length} 条</b>的标题直接写着这人的名字，整条列在下面；` : ''}${side.length ? `另有 <b>${side.length} 条</b>标题没写这个人的名字、只在其中几步里牵到此人，这里只摘那几步——<b>整条流程在<a href="#/page/request">委托任务</a>页</b>，不在这里重复。` : ''}</p>
        ${main.map(block).join('')}
        ${side.map(sideBlock).join('')}
        <div class="note">步骤前的「1、2、3」是源站自己的编号，本站没有重排；个别行不带号，那是源站的注意点或上一行的续写，原样留在原位。原文的标点、日文地名照录。</div>`;
    }

    /* ===== 四代：委托表没有按人分的行，按人挂的是 12 条结婚支线 ===== */
    if (gid === 'rf4') {
        const E = (typeof NPC_EVENT !== 'undefined' && NPC_EVENT.rf4) ? NPC_EVENT.rf4 : [];
        const m = E.filter(x => isMe(x.n))[0];
        if (!m) return '';
        return `
        <h2 class="h2">与这个人有关的事件：结婚支线 ${escHtml(m.t)}</h2>
        <p class="p">四代的委托表按<b>奖励类型</b>分组（物品／配方 54 条、杂货店种子 24 条、花店种子 15 条），<b>没有按人分的行</b>。按人挂的是另一套东西——<b>结婚支线</b>：每位候补一条，是「镇内事件全部看完」这句话的实际内容，<b>事件没跑完，求婚选项不会出现</b>，游戏也不提示差哪一段。</p>
        <div class="kv">
            <div class="kv-row"><div class="kv-k">结婚支线</div><div class="kv-v"><b>${escHtml(m.t)}</b></div></div>
            <div class="kv-row"><div class="kv-k">前置支线</div><div class="kv-v">${m.pre.length ? m.pre.map(escHtml).join('<br>') : '无（12 条里只有这一条不用前置）'}</div></div>
            <div class="kv-row"><div class="kv-k">共同门槛</div><div class="kv-v">先约会三次、好感 10</div></div>
        </div>
        <div class="note">支线名与前置照录<a href="#/page/love">恋爱与结婚</a>页那份源文，一字未改；好感数字是源文写的「3」「5」「6」档，本站不替它换算成心数。</div>`;
    }

    /* ===== 五代：委托表没有委托人一列 ===== */
    if (gid === 'rf5') {
        if (!/花嫁|花婿|结婚/.test(c.r || '')) return '';
        return `
        <h2 class="h2">这一作没有按人登记的委托</h2>
        <p class="p">五代的委托表四列（序号／中文名／解锁／报酬），<b>没有委托人一栏</b>，所以没有办法把某一条委托算到某个人头上——本站不按「解锁条件里提到谁」去猜归属，那是猜，不是记录。与这个人直接相关的是恋爱线：<b>3 条普通支线 + 1 条结婚支线</b>，支线的<b>名字</b>源页没有逐条列出，只给了这个口径。</p>
        <div class="key">能查的确数是这些：好感 <b>7 心可以告白、10 心可以结婚</b>；告白前要先完成该角色的 3 个普通支线；结婚要凑齐好感 10 以上、3 次特殊约会、订婚戒指、双人床。细节在<a href="#/page/love">恋爱与结婚</a>页。</div>`;
    }

    return '';
}

function viewChar(gameId, key) {
    const g = GAMES.find(x => x.id === gameId) || cur();
    const all = npcOf(g);
    let c = all.find(x => x.n === key);
    /* 旧链接 #/char/<作>/<序号> 仍然可用 */
    if (!c && /^\d+$/.test(key || '')) c = all[Number(key)] || (g.chars[Number(key)] ?
        { n: g.chars[Number(key)].name, j: g.chars[Number(key)].jp, r: g.chars[Number(key)].role } : null);
    /* 译名统一前存下的链接（蜜丝特 → 密丝特）跟着走 */
    if (!c) {
        const fixed = fixNames([key || ''])[0];
        if (fixed !== key) c = all.find(x => x.n === fixed);
    }
    if (!c) return viewError('没有这个角色');

    const idx = all.indexOf(c);
    const hue = (g.hue + Math.max(0, idx) * 37) % 360;
    const face = faceSrc(g.id, c.j);
    const kv = [
        ['原名', [c.j, c.e].filter(Boolean).join('　') || '—'],
        ['别名', c.al || '—'],
        ['身份', c.r || '居民'],
        ['声优', c.cv || '未收录'],
        ['生日', c.bd || '未收录'],
        ['住址', c.ad || '—'],
    ].filter(r => r[1] !== '—');

    const tastes = [
        ['最讨厌', c.w, 'worst'],
        ['讨厌', c.h, 'hate'],
        ['喜欢', c.l, 'like'],
        ['最喜欢', c.b, 'best'],
    ].filter(t => t[1] && t[1].length);

    const bonus = [
        ['回礼', c.g], ['生日礼物', c.bg], ['求婚道具', c.pr], ['喜欢的香水', c.pf],
    ].filter(t => t[1]);

    const cdRows = c.cd ? Object.entries(c.cd).map(([k, v]) => {
        const [cond, kk] = k.split('·');
        return `<div class="kv-row"><div class="kv-k">${cond}</div><div class="kv-v">${tasteTags(v, kk === 'hate' ? 'hate' : kk === 'worst' ? 'worst' : 'like')}</div></div>`;
    }).join('') : '';

    return `
    <div class="portrait">
        ${face
            ? `<div class="portrait-avatar has-face"><img src="${face}" alt=""></div>`
            : `<div class="portrait-avatar" style="background:linear-gradient(150deg,
            hsl(${hue} 42% 58%), hsl(${(hue + 26) % 360} 46% 44%))">${String(c.n).slice(0, 1)}</div>`}
        <div class="portrait-name">${escHtml(c.n)}</div>
        <div class="portrait-jp">${escHtml(c.j || '')}${c.e ? ' / ' + escHtml(c.e) : ''}</div>
    </div>
    <div class="kv">
        ${kv.map(([k, v]) => `<div class="kv-row"><div class="kv-k">${k}</div><div class="kv-v">${escHtml(v)}</div></div>`).join('')}
    </div>
    <div class="content">
        ${c.nt ? `<h2 class="h2">简介</h2><p class="p">${escHtml(c.nt)}</p>` : ''}
        ${tastes.length ? `<h2 class="h2">礼物喜好</h2>
        <p class="p">按「最讨厌 → 最喜欢」排；同一个人的清单是全游戏查得到的全部条目，不是节选。</p>
        <div class="taste">
            ${tastes.map(([label, arr, cls]) => `
            <div class="taste-row">
                <div class="taste-k ${cls}">${label}<span>${arr.length}</span></div>
                <div class="taste-v">${tasteTags(arr, cls)}</div>
            </div>`).join('')}
        </div>` : ''}
        ${cdRows ? `<h2 class="h2">特殊情况</h2><div class="kv">${cdRows}</div>` : ''}
        ${bonus.length ? `<h2 class="h2">送礼之外</h2>
        <div class="kv">${bonus.map(([k, v]) => `<div class="kv-row"><div class="kv-k">${k}</div><div class="kv-v">${escHtml(v)}</div></div>`).join('')}</div>` : ''}
        ${personalEventHtml(g.id, c)}
        ${!tastes.length && !bonus.length ? `<div class="note">这一位的礼物数据暂未收录。<b>不是查漏了就是源里没有</b>——本站不填推测值，等有可靠来源再补。</div>` : ''}
        ${c.bd ? `<div class="key">生日：<b>${c.bd}</b>　·　生日当天送礼，好感加成显著高于平日。</div>`
            : `<div class="note">生日未收录。本站不填写未经核实的日期。</div>`}
        <p class="p"><a class="link" href="#/resident/${g.id}/全部">‹ 返回 ${g.short} 居民一览</a>
            ${schedOf(g.id) ? `　·　<a class="link" href="#/sched/${g.id}/${encodeURIComponent(c.n)}">看这一位的每日行程 ›</a>` : ''}</p>
    </div>`;
}

/* ---------- 村民行程表 ----------
   数据在 js/sched.js，目前只有 RF1 有源（biligame「村民每日行程表」）。
   一格 = 一个小时；同一地点的连续小时合并成一格，待了多久一眼看得出。 */
let SCHD_DAY = null;   // 第几种星期状态；null = 还没定过，按今天算
let SCHD_HL = '';      // 当前高亮的建筑
let SCHD_GID = 'rf1';  // 当前看的作品
let SCHD_MODE = 'p';   // 'p' 按人看 / 'h' 按时段看
let SCHD_HOUR = -1;    // 时段视图选中的整点下标；-1 = 按现在算

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DAY_LABEL = {
    '一': '周一', '二': '周二', '三': '周三', '四': '周四', '五': '周五',
    '祝': '祝日', '平日（雨、雪）': '雨天·平日', '祝日（雨、雪）': '雨天·祝日',
};

function schedOf(gid) {
    return (typeof SCHED !== 'undefined' && SCHED[gid]) ? SCHED[gid] : null;
}

function schedSpot(d, ch) {
    return d.spots[B62.indexOf(ch)] || ['—', '', 'none', ''];
}

/* 把一串编码压成「连续同地点」的段 */
function schedRuns(code, di, len) {
    const out = [];
    const st = di * len;
    for (let i = 0; i < len; i++) {
        const c = code.charAt(st + i);
        const last = out[out.length - 1];
        if (last && last.c === c) last.n++;
        else out.push({ c: c, n: 1, i: i });
    }
    return out;
}

function schedSpan(d, i, n) {
    const a = d.times[i], b = d.times[(i + n) % d.times.length];
    return `${a}–${b}`;
}

/* 今天对应哪一种星期状态。源页只有平日（周一至周五同表）、祝日、
   两种雨天，周六周日没有单列，所以只对周一至周五自动定位。 */
function schedToday(d) {
    const w = new Date().getDay();          // 0 = 周日
    const want = ['日', '一', '二', '三', '四', '五', '六'][w];
    const i = d.days.indexOf(want);
    return i >= 0 ? i : -1;
}

/* 现在几点落在哪个整点格。早于 6 点算「还在昨天」，钳到第一格 */
function schedNowHour(d) {
    const h = new Date().getHours();
    const hit = d.times.findIndex(t => parseInt(t, 10) === h);
    if (hit >= 0) return hit;
    return h < 6 ? 0 : d.times.length - 1;
}

/* 反查：某个星期状态、某个整点，全村人分别在哪。
   返回按人数降序的建筑分组，顺带算出每人在那待到这个点。 */
function schedAt(d, di, hi) {
    const len = d.times.length;
    const map = new Map();
    for (const p of d.people) {
        const ch = p[3].charAt(di * len + hi);
        const s = schedSpot(d, ch);
        if (s[0] === '—') continue;         // 源页没标注的不进反查表
        let n = 0;
        while (hi + n < len && p[3].charAt(di * len + hi + n) === ch) n++;
        const key = s[0] + '\u0001' + s[1];
        if (!map.has(key)) map.set(key, { b: s[0], fl: s[1], cat: s[2], aka: s[3] || '', ppl: [] });
        map.get(key).ppl.push({ n: p[0], j: p[1], u: d.times[(hi + n) % len] });
    }
    return [...map.values()]
        .sort((a, b) => b.ppl.length - a.ppl.length || a.b.localeCompare(b.b));
}

const SCHD_CATN = { home: '住处', shop: '店铺', pub: '公共设施', out: '户外', cave: '洞窟', none: '未标注' };

/* 时段视图的分组卡片 */
function schedAtHtml(d, di, hi, id) {
    const groups = schedAt(d, di, hi);
    if (!groups.length) return `<div class="empty">这个时段源页没有标注任何人的去处</div>`;
    return groups.map(x => `
    <div class="sch-at">
        <div class="sch-at-hd">
            <span class="sch-at-b">${escHtml(x.b)}${x.fl ? `<i>${escHtml(x.fl)}</i>` : ''}${x.aka ? `<em>${escHtml(x.aka)}</em>` : ''}</span>
            <span class="sch-at-c c-${x.cat}">${SCHD_CATN[x.cat] || ''}</span>
            <span class="sch-at-n">${x.ppl.length} 人</span>
        </div>
        <div class="sch-at-ppl">
            ${x.ppl.map(p => `<a class="sch-chip" href="#/char/${id}/${encodeURIComponent(p.n)}"
                >${escHtml(p.n)}<b>待至 ${p.u.slice(0, 5)}</b></a>`).join('')}
        </div>
    </div>`).join('');
}

function schedStatsHtml(d, di, hi) {
    const groups = schedAt(d, di, hi);
    const total = groups.reduce((s, x) => s + x.ppl.length, 0);
    const live = schedToday(d) === di && schedNowHour(d) === hi;
    return `<span><b>${d.times[hi]}</b>　${DAY_LABEL[d.days[di]] || d.days[di]}</span>
        <span>在外 <b>${total}</b> 人</span>
        <span>${groups.length} 处</span>
        ${live ? '<span class="sch-live">此刻</span>' : ''}`;
}

/* 表格行：某人当天的行程 */
function schedRows(d, di, gid) {
    return d.people.map(p => {
        const runs = schedRuns(p[3], di, d.times.length);
        const tds = runs.map(r => {
            const s = schedSpot(d, r.c);
            const tip = s[0] + (s[1] ? ' ' + s[1] : '') + (s[3] ? '（' + s[3] + '）' : '') + '　' + schedSpan(d, r.i, r.n);
            const hl = SCHD_HL && SCHD_HL === s[0] ? ' hl' : '';
            return `<td class="c-${s[2]}${hl}" colspan="${r.n}" data-b="${escHtml(s[0])}"
                title="${escHtml(tip)}">${escHtml(s[0])}</td>`;
        }).join('');
        return `<tr data-n="${escHtml(p[0])}" data-j="${escHtml(p[1] || '')}" data-a="${escHtml(p[2] || '')}">
            <th class="sch-n"><a href="#/char/${gid}/${encodeURIComponent(p[0])}">${escHtml(p[0])}</a>
                ${p[1] ? `<span class="sch-jp">${escHtml(p[1])}</span>` : ''}</th>
            ${tds}
        </tr>`;
    }).join('');
}

function viewSched(gid, arg2, arg3) {
    const id = gid || 'rf1';
    const d = schedOf(id);
    const g = GAMES.find(x => x.id === id);
    if (!d || !g) return viewError('这部作品还没有行程数据');
    SCHD_GID = id;

    /* 第一次进来按今天定位；周六周日源页没有单列，落在周一 */
    if (SCHD_DAY === null) {
        const t = schedToday(d);
        SCHD_DAY = t >= 0 ? t : 0;
    }
    if (SCHD_DAY >= d.days.length) SCHD_DAY = 0;

    /* #/sched/rf1/h/12 → 时段视图第 12 格 */
    const who = (arg2 && arg2 !== 'h') ? arg2 : '';
    if (arg2 === 'h') {
        SCHD_MODE = 'h';
        const n = Number(arg3);
        SCHD_HOUR = Number.isFinite(n) ? Math.max(0, Math.min(d.times.length - 1, n)) : schedNowHour(d);
    } else {
        SCHD_MODE = 'p';
    }

    const kw = fixNames([who || ''])[0];
    const withSched = d.people.length;
    const nowH = schedNowHour(d);
    const nowD = schedToday(d);
    const isNow = SCHD_DAY === nowD;
    const url = (mode, h) => mode === 'h'
        ? `#/sched/${id}/h/${h == null ? (SCHD_HOUR >= 0 ? SCHD_HOUR : nowH) : h}`
        : `#/sched/${id}${kw ? '/' + encodeURIComponent(kw) : ''}`;

    const head = `
    <div class="section-title"><span>${g.short}　村民行程</span><span class="en">SCHEDULE</span></div>
    <div class="sch-mode">
        <a class="filter-btn ${SCHD_MODE === 'p' ? 'on' : ''}" href="${url('p')}">按人看</a>
        <a class="filter-btn ${SCHD_MODE === 'h' ? 'on' : ''}" href="${url('h')}">按时段看</a>
    </div>
    <div class="sch-days" id="schDays">
        ${d.days.map((k, i) => `<button class="filter-btn ${i === SCHD_DAY ? 'on' : ''}"
            data-d="${i}">${DAY_LABEL[k] || k}${i === nowD ? '<i class="sch-now">今天</i>' : ''}</button>`).join('')}
    </div>`;

    if (SCHD_MODE === 'h') {
        const hi = SCHD_HOUR >= 0 ? SCHD_HOUR : nowH;
        return `${head}
        <div class="sch-hours" id="schHours">
            ${d.times.map((t, i) => `<button class="sch-h ${i === hi ? 'on' : ''}" data-h="${i}">${t.replace(':00', '')}</button>`).join('')}
        </div>
        <div class="sch-stats" id="schStats">${schedStatsHtml(d, SCHD_DAY, hi)}</div>
        <div class="sch-at-list" id="schAt">${schedAtHtml(d, SCHD_DAY, hi, id)}</div>
        <div class="content" style="margin-top:0">
            <div class="note">
                这里是反过来查：选一个整点，看<strong>全村人此刻分别在哪儿</strong>，点名字直接进人物档案。
                找 NPC 送礼、触发事件的时候，比一行行扫表快。
                <br>每处建筑按人头从多到少排；「待至」是他会在那里待到几点，赶时间就照这个算。
                <br>共 <strong>${withSched} 位</strong>村民收录在内。源页没标注的时段不进这张表，不做推测。
            </div>
            <div class="copyright">
                <div>行程数据来自 biligame 符文工厂 wiki「村民每日行程表」（CC BY-SA）</div>
                <div>人名按作品官方中文版统一；源页未标注的时段记为「—」</div>
            </div>
        </div>`;
    }

    return `${head}
    <div class="sch-tools">
        <input id="schQ" class="sch-q" type="search" placeholder="输入人名筛选" value="${escHtml(kw)}">
        <span class="sch-tip">点格子高亮同建筑</span>
    </div>
    <div class="sch-wrap">
        <table class="sch-tb${SCHD_HL ? ' has-hl' : ''}" id="schTb">
            <thead><tr><th class="sch-n">村民</th>
                ${d.times.map((t, i) => `<th class="${isNow && i === nowH ? 'sch-col-now' : ''}">${t.replace(':00', '')}</th>`).join('')}
            </tr></thead>
            <tbody id="schBody">${schedRows(d, SCHD_DAY, id)}</tbody>
        </table>
    </div>
    <div class="sch-legend">
        <span class="lg c-home">住处</span><span class="lg c-shop">店铺</span>
        <span class="lg c-pub">公共设施</span><span class="lg c-out">户外</span>
        <span class="lg c-cave">洞窟</span><span class="lg c-none">源页未标注</span>
    </div>
    <div class="content" style="margin-top:0">
        <div class="note">
            横向是整点，从早上 6:00 到次日 0:00，一格一小时；同一地点连着几个小时就并成一格，格子的宽度就是<strong>他在这里待了多久</strong>。
            <br>「祝日」是本作的节日（晴天），雨天另外两版——村民在雨天会改去室内，找人的时候别按晴天的表跑。
            ${isNow ? '<br>表头标出的那一列是<strong>现在这个点</strong>。' : ''}
            <br>共 <strong>${withSched} 位</strong>村民收录在内。点表的某个地点格，会把<strong>同一栋建筑</strong>里的其他人一起点亮，方便一次找齐。
        </div>
        <div class="copyright">
            <div>行程数据来自 biligame 符文工厂 wiki「村民每日行程表」（CC BY-SA）</div>
            <div>人名按作品官方中文版统一；源页未标注的时段记为「—」，不做推测</div>
        </div>
    </div>`;
}

/* 行程表交互：换天、筛人、点亮同建筑 */
function bindSched() {
    const d = schedOf(SCHD_GID);
    if (!d) return;
    const id = SCHD_GID;
    const tb = document.getElementById('schTb');
    const tbody = document.getElementById('schBody');
    const hourBar = document.getElementById('schHours');
    const atList = document.getElementById('schAt');
    const stats = document.getElementById('schStats');
    const days = document.querySelectorAll('#schDays [data-d]');

    /* 时段视图：只换下面两块，不动滚动位置 */
    const paintAt = hi => {
        if (atList) atList.innerHTML = schedAtHtml(d, SCHD_DAY, hi, id);
        if (stats) stats.innerHTML = schedStatsHtml(d, SCHD_DAY, hi);
    };
    const curHour = () => (SCHD_HOUR >= 0 ? SCHD_HOUR : schedNowHour(d));

    if (hourBar) {
        hourBar.addEventListener('click', e => {
            const b = e.target.closest('[data-h]');
            if (!b) return;
            SCHD_HOUR = Number(b.dataset.h);
            hourBar.querySelectorAll('[data-h]').forEach(x => x.classList.toggle('on', x === b));
            paintAt(SCHD_HOUR);
        });
    }

    /* 换天：按人看要重画整张表，按时段看只换分组 */
    days.forEach(b => b.addEventListener('click', () => {
        SCHD_DAY = Number(b.dataset.d);
        days.forEach(x => x.classList.toggle('on', x === b));
        if (atList) paintAt(curHour());
        else redraw();
    }));

    /* 筛人：名字 / 日文名 / 源页旧译任一命中 */
    const q = document.getElementById('schQ');
    function applyFilter() {
        if (!tbody) return;
        const v = fixNames([(q ? q.value : '').trim().toLowerCase()])[0];
        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            const hay = (tr.dataset.n + '\u0001' + tr.dataset.j + '\u0001' + tr.dataset.a).toLowerCase();
            tr.hidden = !!v && !hay.includes(v);
        });
    }

    function redraw() {
        if (!tb || !tbody) return;
        tbody.innerHTML = schedRows(d, SCHD_DAY, id);
        tb.classList.toggle('has-hl', !!SCHD_HL);
        applyFilter();
    }

    if (q) q.addEventListener('input', applyFilter);

    /* 点亮同建筑 */
    if (tbody) tbody.addEventListener('click', e => {
        const td = e.target.closest('td');
        if (!td || !tb) return;
        const b = td.dataset.b || '';
        SCHD_HL = (SCHD_HL === b || b === '—') ? '' : b;
        tb.classList.toggle('has-hl', !!SCHD_HL);
        tbody.querySelectorAll('td').forEach(x => x.classList.toggle('hl', !!SCHD_HL && x.dataset.b === SCHD_HL));
        const tip = document.querySelector('.sch-tip');
        if (tip) tip.textContent = SCHD_HL ? `已点亮：${SCHD_HL}` : '点格子高亮同建筑';
    });

    if (q && q.value.trim()) {
        try { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } catch (e) { }
    }
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
                <div class="gc-sub">${platAll(g.plat)}</div>
                <div class="gc-date">${g.date.slice(0, 7)}${g.orig ? `　原版 ${platAll(g.orig.plat)} ${g.orig.date.slice(0, 7)}` : ''}</div>
            </a>`).join('')}
    </div>
    <div class="copyright">
        <div>切换作品后，攻略目录与居民名单会一并切换</div>
        <div>系列共 ${GAMES.length} 部作品收录于本站</div>
    </div>`;
}

function viewTodo() {
    const g = cur();
    /* 用人物档案的生日（覆盖 7 部作品 173 人），比 GAMES[].chars 里的零散几条完整得多 */
    const withBday = npcOf(g).filter(c => c.bd);
    const parsed = withBday.map(c => {
        const m = c.bd.match(/([春夏秋冬])月?\s*(\d+)/);
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
                <a class="todo-item" href="#/char/${g.id}/${encodeURIComponent(o.c.n)}">
                    <div class="todo-badge">
                        <div class="tb-d">${o.d}</div>
                        <div class="tb-s">${nm}</div>
                    </div>
                    <div class="todo-body">
                        <div class="todo-name">${o.c.n}</div>
                        <div class="todo-meta">${o.c.r || '居民'}${o.c.cv ? '　·　' + o.c.cv : ''}</div>
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
                        <div class="todo-name">${o.c.n} 的生日</div>
                        <div class="todo-meta">${fmtDay({ s: o.s, d: o.d })}　·　${o.c.r || '居民'}</div>
                    </div>
                    <a href="#/char/${g.id}/${encodeURIComponent(o.c.n)}" class="todo-days" style="color:#198d44">查看</a>
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
                    <div class="todo-name">${nextOne ? '下一个生日：' + nextOne.c.n : '本作暂无已收录的生日'}</div>
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
            /* 首格常嵌一段辅助文字（.mon-desc：日文名或魔物简介），
               stripTags 会把它与名字连成一长串，搜索结果的标题就毁了。
               取名字前先把这段辅助文字整块去掉；正文 s 仍是整行全文，搜索不受影响 */
            const nameCell = cells[ci].replace(/<span class="mon-desc">[\s\S]*?<\/span>/gi, '');
            const name = stripTags(nameCell).replace(/\s+/g, ' ').trim();
            if (!name || name === '—' || name === '-' || name === '?') continue;
            const text = stripTags(tr);
            list.push({
                k: p.key, t: p.title, i: p.icon, grp: p.group,
                n: name, cells: ctext, s: text.toLowerCase(), raw: text
            });
        }
    }
    /* 人物名册不是 PAGES 里的页面（走 #/resident 与 #/char 路由），
       但玩家最常搜的就是人名和「谁喜欢 X」，所以单独补进索引 */
    try {
        const ppl = npcOf(g);
        for (const x of ppl) {
            const tastes = ['最喜欢', '喜欢', '讨厌', '最讨厌']
                .map((k, i) => (x[['b', 'l', 'h', 'w'][i]] || []).length
                    ? k + '：' + x[['b', 'l', 'h', 'w'][i]].join('、') : '')
                .filter(Boolean).join(' ');
            const text = [x.n, x.j, x.e, x.al, x.bd, x.cv, x.r, tastes].filter(Boolean).join(' ');
            list.push({
                k: 'npc', t: '人物名册', i: 'users', grp: 'life',
                n: x.n, cells: [x.n, x.j || '', x.bd || '', x.cv || ''],
                s: text.toLowerCase(), raw: text,
                href: '#/char/' + g.id + '/' + encodeURIComponent(x.n)
            });
        }
    } catch (e) { }
    /* 行程表同理：#/sched 不在 PAGES 里，但「搜个地名看谁会去」很常用。
       每人一条，文本放他八天里去过的全部地点，点进去直接落在那人的行程上 */
    try {
        const d = schedOf(g.id);
        if (d && d.people) {
            const T = d.times.length;
            for (const p of d.people) {
                const seen = [];
                for (let di = 0; di < d.days.length; di++) {
                    for (let hi = 0; hi < T; hi++) {
                        const s = schedSpot(d, p[3].charAt(di * T + hi));
                        if (s[0] === '—') continue;
                        const full = s[0] + (s[1] ? ' ' + s[1] : '') + (s[3] ? '（' + s[3] + '）' : '');
                        if (seen.indexOf(full) < 0) seen.push(full);
                    }
                }
                if (!seen.length) continue;
                const text = [p[0], p[1], p[2], seen.join(' ')].filter(Boolean).join(' ');
                list.push({
                    k: 'sched', t: '村民行程', i: 'clock', grp: 'life',
                    n: p[0], cells: [p[0], p[1] || '', seen.slice(0, 4).join('、')],
                    s: text.toLowerCase(), raw: text,
                    href: '#/sched/' + g.id + '/' + encodeURIComponent(p[0])
                });
            }
        }
    } catch (e) { }
    IDXCACHE[g.id] = list;
    /* 只留最近两作：十作全缓存要几十 MB，手机上不值当 */
    IDXORDER.push(g.id);
    while (IDXORDER.length > 2) {
        const old = IDXORDER.shift();
        if (old !== g.id) delete IDXCACHE[old];
    }
    return list;
}

/* 正文索引：行索引只收表格，讲解文字（小标题、段落、提示块）一个字都没进，
   于是「照录不改」「量纲不同」「没有一个能通吃」这类只写在正文里的说法，
   搜出来是 0 条 0 页。这里按页收一份「去掉表格后」的纯文本，
   与行索引同样只缓存最近两作（十作全留要几十 MB）。 */
const PROSECACHE = {};
const PROSEORDER = [];

function buildProse(g) {
    if (PROSECACHE[g.id]) return PROSECACHE[g.id];
    const out = [];
    for (const p of PAGES) {
        /* 更新日志什么都提一句，收进正文索引只会让每条查询都多出一条日志 */
        if (p.key === 'changelog' || !pageVis(p, g)) continue;
        let h = '';
        try { h = p.body(g) || ''; } catch (e) { continue; }
        const text = stripTags(h.replace(/<table[\s\S]*?<\/table>/gi, ' '))
            .replace(/\s+/g, ' ').trim();
        if (text.length < 24) continue;
        out.push({ k: p.key, t: p.title, i: p.icon, grp: p.group, s: text.toLowerCase(), raw: text });
    }
    PROSECACHE[g.id] = out;
    PROSEORDER.push(g.id);
    while (PROSEORDER.length > 2) {
        const old = PROSEORDER.shift();
        if (old !== g.id) delete PROSECACHE[old];
    }
    return out;
}

/* 正文命中：所有词都要出现才算，按首词出现次数排序——讲得最多的一页排最前 */
function searchProse(g, words) {
    const hits = [];
    const head = words[0];
    for (const e of buildProse(g)) {
        if (!words.every(w => e.s.includes(w))) continue;
        let c = 0;
        for (let i = e.s.indexOf(head); i >= 0; i = e.s.indexOf(head, i + head.length)) c++;
        hits.push({ e, c });
    }
    return hits.sort((a, b) => b.c - a.c || a.e.t.length - b.e.t.length);
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

/* 角色头像地址。查不到就返回空串，视图退回「首字色块」——宁可显示色块，
   也不要给一张破图或 404。表在 js/faces.js，键是日文名。
   单文件版（standalone.html）没有外部文件可加载，_inline.py 会把图片转成
   data URI 塞进 FACE_DATA，这里优先取它。 */
function faceSrc(gid, jp) {
    const m = (typeof FACE !== 'undefined') && FACE[gid];
    if (!(m && jp && m[jp])) return '';
    const path = `assets/face/${gid}/${m[jp]}.png`;
    if (typeof FACE_DATA !== 'undefined' && FACE_DATA[path]) return FACE_DATA[path];
    return path;
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
/* 全站统一译名后留下的旧写法：查询时先归一到现名，老读者按记忆里的字也搜得到。
   只做查询侧归一，不动索引文本，索引里也不留两套写法 */
const NAME_FIX = { '蜜丝特布鲁姆': '密丝特布鲁姆', '蜜丝特': '密丝特',
    '海齐利格斯': '赫理查科斯' };

function fixNames(words) {
    return words.map(w => {
        let s = String(w || '');
        for (const k in NAME_FIX) if (s.indexOf(k) >= 0) s = s.split(k).join(NAME_FIX[k]);
        return s;
    });
}

function searchEntries(g, words) {
    words = fixNames(words);
    const idx = buildIndex(g);
    const run = ws => {
        const head = ws[0] || '';
        const hits = [];
        for (const e of idx) {
            const sc = scoreEntry(e, ws);
            if (!sc) continue;
            /* 首格是日文、中文在第二格的表（译名对照），
               展示成用户搜的那个名字才有意义。
               行程条目例外：那里人名的下一格是一串地点，换了标题就看不出是谁 */
            let name = e.n;
            if (head && e.k !== 'sched' && !name.toLowerCase().includes(head) && e.cells) {
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
            /* 同名条目在「村民喜好」和「人物名册」里都有时，人物档案信息更全，
               排在前面，用户点进去才不会被过时的解析表挡在门外；
               行程排在档案之后——先看人是谁，再看他几点在哪 */
            if (!m.pages.some(x => x.k === e.k)) {
                if (e.k === 'npc') m.pages.unshift({ k: e.k, t: e.t, href: e.href });
                else m.pages.push({ k: e.k, t: e.t, href: e.href });
            }
            if (sc > m.sc) { m.sc = sc; m.raw = e.raw; m.first = e; }
        } else {
            merged.set(e.n, { sc, n: e.n, raw: e.raw, c: 1, first: e, pages: [{ k: e.k, t: e.t, href: e.href }] });
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
            <span style="font-size:0.74rem">可以搜物品名（「生命果冻」）、页面名（「锻造」）、正文里的说法（「量纲」），也可以多个词一起搜（「剑 攻击」）</span>
        </div>`;
    }

    /* ① 页面级命中：标题 */
    const pgHit = PAGES_META.filter(p => pageVis(p, g) && (
        p.title.toLowerCase().includes(kw) || (p.en || '').toLowerCase().includes(kw)));

    /* ② 条目级命中：数据表每一行 */
    const { list, relaxed, used, rows } = searchEntries(g, words);
    const head = used[0];
    const LIMIT = 80;
    /* ③ 正文命中：只写在讲解里、表格里一个字都没有的说法（「照录不改」「量纲不同」） */
    const prAll = searchProse(g, used);
    const PRLIMIT = 12;
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
    <div class="section-title"><span>搜索「${escHtml(raw)}」</span><span class="en">${total ? total + ' ENTRIES' : (pgHit.length + extra.length + prAll.length) + ' PAGES'}</span></div>
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
    ${prAll.length ? `
        <div class="sres-head">正文提到　<span class="sres-n">${prAll.length}</span>
            ${prAll.length > PRLIMIT ? `<span class="sres-more">只列前 ${PRLIMIT} 页</span>` : ''}
        </div>
        <div class="sres">
            ${prAll.slice(0, PRLIMIT).map(({ e, c }) => `
            <a class="sres-item" href="#/page/${e.k}">
                <div class="sres-top">
                    <span class="sres-name">${escHtml(e.t)}</span>
                    ${c > 1 ? `<span class="sres-cnt">×${c}</span>` : ''}
                    <span class="sres-page">正文</span>
                </div>
                <div class="sres-snip">${markKw(snippetOf(e.raw, head), head)}</div>
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
            <a class="sres-item" href="${pg.href || '#/page/' + pg.k + '/' + encodeURIComponent(it.n)}">
                <div class="sres-top">
                    <span class="sres-name">${markKw(label, head)}</span>
                    ${it.c > 1 ? `<span class="sres-cnt">×${it.c}</span>` : ''}
                    <span class="sres-page">${pg.t}${more}</span>
                </div>
                <div class="sres-snip">${markKw(snippetOf(it.raw, head), head)}</div>
            </a>`;
    }).join('')}
        </div>` : ''}
    ${(!total && !pgHit.length && !extra.length && !prAll.length) ? `<div class="empty">没有找到「${escHtml(raw)}」<br>
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

/* ---------- 分包：这一路由要什么，先下齐再画 ----------
   首页与「选择作品」不碰任何作品数据，所以打开最快；进某作才下那一作的数据；
   跨作页（系列对照／节日／战斗）与更新日志各自单独一包，用到才下。 */
function chunkNeed(r) {
    if (typeof K === 'undefined' || typeof K_PLAN === 'undefined' || !K_PLAN) return null;
    const none = { game: null, page: null, cross: false, pages: false, npc: false };
    if (r.name === 'home' || r.name === 'games' || r.name === 'switch') return none;
    const g = cur();
    const need = { game: g.id, page: null, cross: false, pages: false, npc: false };
    /* 搜索要逐页调 body() 建条目索引与正文索引，正文包同样躲不掉 */
    if (r.name === 'search') { need.cross = true; need.pages = true; need.npc = true; return need; }
    if (r.name === 'resident' || r.name === 'char' || r.name === 'sched') {
        const gg = GAMES.find(x => x.id === r.args[0]);
        need.game = gg ? gg.id : g.id;
        need.npc = true;
        return need;
    }
    if (r.name === 'page') {
        const key = r.args[0];
        /* 正文包：PAGES 与 PAGE_MAP 都在里面，任何条目（含 beast/animal 这类旧别名）都要 */
        need.pages = true;
        /* 条目正文里读 NPC_FULL／NPC_AZUMA 的地方很多（人物、生日、恋爱、种族……），
           正文包已经在下了，这 33KB 就别再按页去猜哪些要哪些不要 */
        need.npc = true;
        if (K_PLAN.pages && K_PLAN.pages[key]) need.page = key;
        if (K_PLAN.crossPages && K_PLAN.crossPages.indexOf(key) >= 0) need.cross = true;
    }
    return need;
}

function showLoading() {
    const m = document.getElementById('main');
    if (!m) return;
    /* 首屏骨架（index.html 里 #boot）本身就在说这件事，替换掉只会让人多读一行字 */
    if (document.getElementById('boot')) return;
    m.innerHTML = '<div class="content"><p class="p gray">正在载入资料……</p></div>';
}

let _waitingFor = '';
function render() {
    const r = parseRoute();
    const need = chunkNeed(r);
    if (need) {
        const lack = (need.game && !K.has(need.game))
            || (need.page && !K.hasPage(need.page))
            || (need.pages && !K.hasBody())
            || (need.npc && !K.hasNpc())
            || (need.cross && !K.hasCross());
        if (lack) {
            const sig = location.hash;
            if (_waitingFor !== sig) { _waitingFor = sig; showLoading(); }
            K.ready(need).then(() => {
                _waitingFor = '';
                if (location.hash === sig) render();
            }).catch(() => {
                /* 包没下来就照常画：缺数据的页自带「数据未加载」提示，总比一直转圈强 */
                _waitingFor = '';
                renderNow();
            });
            return;
        }
    }
    renderNow();
    maybeWarm(r);
}

/* 正文包（608KB）什么时候取？
   只在目录页（#/wiki、#/cat）才预热：首页点任何一张作品卡都只是换目录，正文包用不上，
   白下 608KB 拿不到任何速度。到了目录页，下一步多半就是点条目，这时候预热才划算。 */
let _warmed = false;
function maybeWarm(r) {
    if (_warmed) return;
    if (typeof K === 'undefined' || !K.warm) return;
    if (r.name !== 'wiki' && r.name !== 'cat') return;
    _warmed = true;
    setTimeout(() => K.warm(), 600);
}

function renderNow() {
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
            html = viewResident(r.args[0], r.args[1], r.args[2]);
            /* 路径里带着作品，标题要跟着它走；用 cur() 会留着上一个作品的标题 */
            title = (GAMES.find(x => x.id === r.args[0]) || g).name; tab = 'resident';
            break;
        case 'char':
            html = viewChar(r.args[0], r.args[1]);
            title = (GAMES.find(x => x.id === r.args[0]) || g).name; tab = 'resident';
            break;
        case 'sched':
            html = viewSched(r.args[0], r.args[1], r.args[2]);
            title = (GAMES.find(x => x.id === (r.args[0] || 'rf1')) || g).name;
            tab = 'resident';
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
                        <a class="qsug-item" href="${pg.href || '#/page/' + pg.k + '/' + encodeURIComponent(it.n)}">
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

    /* 行程表 */
    if (r.name === 'sched') bindSched();

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

/* 指针落到条目链接上就把正文包发起下载——比 idle 预热更快，也不用等点击。
   移动端没有悬停，那条路仍靠 maybeWarm 的 idle 预热。 */
document.addEventListener('pointerover', e => {
    const t = e.target;
    const a = t && t.closest && t.closest('a[href^="#/page/"]');
    if (a && typeof K !== 'undefined' && K.now) K.now();
}, { passive: true });
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('backBtn').addEventListener('click', () => {
        if (history.length > 1) history.back(); else go('/');
    });
    const sb = document.getElementById('searchBtn');
    if (sb) sb.addEventListener('click', () => go('/search'));
    render();
});

