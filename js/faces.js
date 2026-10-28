/* 角色头像映射：日文名 → 图片文件名（不含目录与扩展名）
 *
 * 图片在 assets/face/rf1/，由 _build_faces.py 从游戏立绘裁出：
 * 源是 ARFJ_NCER_ext 的 NCER 立绘页（512x256，一人一张，多帧表情），
 * 以头顶为锚点裁成正方形，同一角色的第 2 帧起存为 <key>_01.png、<key>_02.png…
 *
 * 用日文名作键：中文名会随译名调整而变（ミスト 就从「蜜丝特」改成过「密丝特」），
 * 日文名不会。
 *
 * 名单外角色（艾泽尔巴德、吉尔伯特、主角之子）也切好了，键名以 xt_ 开头，
 * 暂不接进居民名录，等做剧情角色页时再用。
 */
var FACE = {
    rf1: {
        'ラグナ': 'ragna',
        'ミスト': 'mist',
        'ロゼッタ': 'rosetta',
        'ラピス': 'lapis',
        'メロディ': 'melody',
        'ビアンカ': 'bianca',
        'タバサ': 'tabatha',
        'フィル': 'fil',
        'シャロン': 'sharon',
        'トルテ': 'torte',
        'めい': 'mei',
        'リネット少佐': 'linet',
        'ゴドウィン': 'godwin',
        'ホワイト': 'white',
        'ジャコリヌス': 'jacolnus',
        'ラッセル': 'russel',
        'セシリア': 'cecilia',
        'エド': 'edo',
        'カミュ': 'camus',
        'ジェフ': 'jeff',
        'セバスチャン': 'sebastian',
        'レディ·アン': 'anne',
        'ザッハ': 'zaha',
        'リュード': 'rude',
        'レオ': 'leo',
        'ノイマン': 'neuman',
        'サラ': 'sala',
        'ニコル': 'nicholl',
        'イヴァン': 'ivan'
    }
};

/* 名单外角色，单独一张表，由剧情页按名字取用 */
var FACE_EXTRA = {
    'エゼルバード': 'xt_ethelberd',
    'ギルバート': 'xt_gilbert',
    '主角之子': 'xt_baby'
};
