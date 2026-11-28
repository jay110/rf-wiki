/* ============================================================
   各作片头动画（OP）索引
   不搬运视频文件，只用 B 站官方外链播放器嵌入；所有条目在 2026-11-28
   逐条用 api.bilibili.com/x/web-interface/view 核对过：bvid 存在、
   分 P 标题与曲名一致、时长对得上。UP 主删稿会让条目失效，届时把该作
   整条删掉即可 —— 首页按钮会自动消失，不留死链。
   ============================================================ */
var OP_DATA = {
    rf1: { bv: 'BV1po4y137dA', p: 1, song: 'Rune', sec: 192, up: '贴心琉依' },
    rf2: { bv: 'BV1po4y137dA', p: 2, song: 'Rune2', sec: 130, up: '贴心琉依' },
    rf3: { bv: 'BV1po4y137dA', p: 6, song: 'HAPPINESS', sec: 95, up: '贴心琉依' },
    rff: { bv: 'BV1po4y137dA', p: 4, song: 'The Sweetest Time', sec: 105, up: '贴心琉依' },
    rfo: { bv: 'BV1GW421d7ST', p: 1, song: '届きますように', sec: 101, up: '贴心琉依' },
    rf4: { bv: 'BV1po4y137dA', p: 10, song: '風のトラベラー', sec: 97, up: '贴心琉依' },
    rf5: { bv: 'BV1po4y137dA', p: 14, song: '空の彼方', sec: 94, up: '贴心琉依' },
    /* 龙之天地没有单独的游戏内 OP 投稿，退一步用官方发售预告片，条目里标明 kind: 'pv' */
    azuma: { bv: 'BV1R2Tjz6Esa', p: 1, song: '发售预告片', sec: 91, up: 'Marvelous_游戏', kind: 'pv' }
};

/* 系列合集：rf1/rf2/rf3/rff/rf4/rf5 六作共用一个 17 分 P 的视频，
   播放器里会露出分 P 列表，所以片尾要交代一句。 */
var OP_COLL = { bv: 'BV1po4y137dA', pages: 17, up: '贴心琉依' };
