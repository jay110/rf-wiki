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
       逐张比对确认；花嫁候补 7 人与花婿候补 4 人各有一套 _W 婚礼差分，本表不用。 */
    rf2: {
        'カイル': 'kyle',
        'アルス': 'ars',
        'アリア': 'aria',
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
        'ハイリヒクス': 'herman',   /* 旧记录用过的日文名，条目已并入 ヘリチャコス */
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
    },
    /* 符文3：ROM 里的立绘是 NCGR/NSCR 索引色、没有文件名表，认不出谁是谁，改走官网。
       花嫁候补用 15 周年站的 560x940 立绘，镇民用发售时旧官网（marv.jp 2009）的 220x360，
       都是官方透明底全身立绘，按身高比例定裁切带（_build_faces.py 的 band_scale）。
       隐藏花嫁 クルルファ 官网没有立绘（通关才解锁、官方不做宣传），
       オンドルファ 与 ゼゼ 两张名单页里也没有，这三位宁可空着。 */
    rf3: {
        'マイス': 'mais',
        'シア': 'sia',
        'トゥーナ': 'toona',
        'マリオン': 'marion',
        'ショコラ': 'chocolat',
        'イオン': 'ion',
        'ペルシャ': 'persia',
        'ダリア': 'dahlia',
        'さくや': 'sakuya',
        'ソフィア': 'sophia',
        'カリン': 'karin',
        'ウェルズ': 'wells',
        'モニカ': 'monica',
        'マージョリー': 'marjorie',
        'ガジ': 'gadzhi',
        'グルテン': 'gluten',
        'ラスク': 'rusk',
        'しののめ': 'shinonome',
        'ヘーゼル': 'hazel',
        'ドンチャコス': 'donchacos',
        'エリザ': 'elisa',
        'カルロス': 'carlos'
    },
    /* 符文5：源是 PC 版（Unity）的 FaceIconSpriteAtlas，游戏内 HUD 头像，约 62px。
       由 _build_face_rf5.py 从 Addressables 的 bundle 里取出，ch 编号与人的对应
       见 _face_src/rf5_map.md（编号表 + 立绘目录 + 发色三条互相印证）。
       没核实的编号（ch016 / ch032 / ch033 / ch035）一律不接，宁可退回色块。 */
    rf5: {
        'アレス': 'ares',
        'アリス': 'alice',
        'プリシラ': 'priscilla',
        'ルーシー': 'lucy',
        'スカーレット': 'scarlett',
        'フーカ': 'fuqua',
        'ベアトリス': 'beatrice',
        'ルドミラ': 'ludmila',
        'マーティン': 'martin',
        'セシル': 'cecile',
        'むらくも': 'murakumo',
        'リュカ': 'lyka',
        'ラインハルト': 'reinhard',
        'ルーカス': 'lucas',
        'エルシェ': 'elsje',
        'ハインツ': 'heinz',
        'ランドルフ': 'randolph',
        'ユキ': 'yuki',
        'シモーヌ': 'simone',
        'みささぎ': 'misasagi',
        'テリー': 'terry',
        'リヴィア': 'rivia',
        'レディア': 'laedia',
        'ドグ': 'doug',
        'ジュリアン': 'julian',
        'ヒナ': 'hina',
        'オズワルド': 'oswald'
    }
};

/* 名单外角色，单独一张表，由剧情页按名字取用 */
var FACE_EXTRA = {
    'エゼルバード': 'xt_ethelberd',
    'ギルバート': 'xt_gilbert',
    '主角之子': 'xt_baby'
};
