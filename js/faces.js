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
    },
    /* 符文2：源是 A6NJ_NCER_extract。编号与人的对应来自 wiki 角色页引用的立绘
       （_face_src/rf2_owners.json 反查 imageusage 得到），再与官网 15 周年立绘
       逐张比对确认；花嫁候补 7 人与花婿候补 4 人各有一套 _W 婚礼差分，本表不用。
       注意「海齐利格斯」与「赫理查科斯」在站内是两条重名记录，立绘同一张。 */
    rf2: {
        'カイル': 'kyle',
        'アルス': 'ars',
        'マナ': 'mana',
        'ジュリア': 'julia',
        'アリシア': 'alicia',
        'セシリア': 'cecilia',
        'ロザリンド': 'rosalind',
        'ドロシー': 'dorothy',
        'ゆえ': 'yue',
        'マックス': 'max',
        'バレット': 'barrett',
        'レイ': 'ray',
        'ジェイク': 'jake',
        'ダグラス': 'douglas',
        'ゴードン': 'gordon',
        'ナタリー': 'natalie',
        'ハイリヒクス': 'herman',
        'ヘリチャコス': 'herman',
        'カノン': 'cammy',
        'ブライ': 'brai',
        'ターニャ': 'tanya',
        'エンドール': 'endor',
        'ロイ': 'roy',
        'オルファス': 'orfas',
        'リーン': 'leen',
        'ムー&スー': 'muu',
        'ラムリア': 'ramlia'
    }
};

/* 名单外角色，单独一张表，由剧情页按名字取用 */
var FACE_EXTRA = {
    'エゼルバード': 'xt_ethelberd',
    'ギルバート': 'xt_gilbert',
    '主角之子': 'xt_baby'
};
