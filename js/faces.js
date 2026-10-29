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
       改用 RF3S（Switch 豪华版）游戏内的 another_charaicon 头像（172px，官方画、换表情）。
       オンドルファ 与 ゼゼ 两张名单页里也没有，仍空着等村里的 charaicon 段。 */
    rf3: {
        'マイス': 'mais',
        'シア': 'sia',
        'トゥーナ': 'raven',
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
        'カルロス': 'carlos',
        'クルルファ': 'kururfa'
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
        'オズワルド': 'oswald',
        'パルモ': 'palmo',
        'ダグ': 'dag',
        'マーガレット': 'margaret'
    },
    /* 符文4：14 位主角与婚配候补用 RF4SP 旧官网（marv.jp/special/game/runefactory4SP）
       的 540x1098 全身彩图；镇民 13 人官网没放，用 wiki 解包出的游戏内立绘。
       归属靠 imageusage 反查，出处与编号对照见 _face_src/rf4/SOURCES.md。
       这批姿态花（鱼竿、宽檐帽、盘腿坐），自动量头宽会被道具带跑，
       所以 14 位都是人工标框裁出（_build_faces.py 的 face_box）。 */
    rf4: {
        'レスト': 'lest',
        'フレイ': 'frey',
        'マーガレット': 'margaret',
        'コハク': 'kohaku',
        'ビシュナル': 'vishnal',
        'ディラス': 'dylas',
        'フォルテ': 'forte',
        'ドルチェ': 'dolce',
        'アーサー': 'arthur',
        'キール': 'kiel',
        'シャオパイ': 'xiaopai',
        'クローリカ': 'clorica',
        'ダグ': 'doug',
        'レオン': 'leon',
        'ヴォルカノン': 'volkanon',
        'バド': 'bado',
        'ポコリーヌ': 'porcoline',
        'リンファ': 'linfa',
        'エルミナータ': 'illuminata',
        'ブロッサム': 'blossom',
        'ジョーンズ': 'jones',
        'ナンシー': 'nancy',
        'セルザウィード': 'ventuswill',
        'バレット': 'barrett',
        'トゥーナ': 'raven',
        'ノエル': 'noel',
        'ルーナ': 'luna'
    },
    /* 符文工房 边境（Wii）：源是游戏内对话立绘 FACE00–FACE31（480 高半身像，多表情），
       由 _build_rff_faces.py 从「边境图片导出」里按 FACE 编号裁头部成 160px 方图。
       FACE00 = 主角，FACE01–13 = 花嫁候补（エリス 白/黑 各一张），FACE14–31 = 居民。
       编号与人名的对应依据是站内名册顺序 +1，并用「ラピス＝教会修女(F03)」
       「ステラ＝老妇(F19)」「ミネルバ＝小妖精(F24)」「つぶて＝自称武蔵大和守(F28)」
       四条角色描述交叉核对过，详见 _face_src/rff_map.md。 */
    rff: {
        'ラグナ': 'ragna',
        'ミスト': 'mist',
        'ロゼッタ': 'rosetta',
        'ラピス': 'lapis',
        'メロディ': 'melody',
        'ビアンカ': 'bianca',
        'タバサ': 'tabatha',
        'ユーニ': 'yuni',
        'ドロップ': 'drop',
        'アネット': 'anette',
        'セルフィ': 'selphy',
        'うづき': 'uzuki',
        'エリス': 'iris_white',
        'ターナー': 'turner',
        'リタ': 'rita',
        'エリック': 'erik',
        'カンロ': 'kanro',
        'キャンディ': 'candy',
        'ステラ': 'stella',
        'ガネーシャ': 'ganesha',
        'マルコ': 'marco',
        'ダニー': 'danny',
        'ルート': 'lute',
        'ミネルバ': 'minerva',
        'クロス': 'cross',
        'ワーグナー': 'wagner',
        'ローランド': 'roland',
        'つぶて': 'tsubute',
        'ルシア': 'lucia',
        'レオナ': 'leona',
        'ジェルバイン': 'geruvain'
    },
    rfo: {
        /* 源：PS3 日版 RFF2.dat 块 1526 的 LUfaceNL_XX.hvt（72x72 游戏内头像），
           编号由游戏内「相遇标记」字符串表顺序反推：01/02 主角、10-18 女主、
           20-22 男主、30-38 居民。优米尔(ユミル)是巨人，无人物头像，留空。 */
        'アゼル': 'azel',
        'ソニア': 'sonia',
        'リリ': 'lily',
        'オデット': 'odette',
        'アイリス': 'iris',
        'エレクトラ': 'electra',
        'メルプリン': 'merupur',
        'エレナ': 'elena',
        'サラ': 'serra',
        'メイ': 'mikoto',
        'パンドラ': 'pandora',
        'ジョー': 'joel',
        'ジェームス': 'james',
        'ビスマルク': 'bismarc',
        'ボナパルト': 'bonapar',
        'バッカス': 'bacchus',
        'キルト': 'kilt',
        'ニット': 'nitte',
        'グレイ': 'gray',
        'ジャスリン': 'jaslyn',
        'アネット': 'anette',
        'キャンディ': 'candy',
        'タバサ': 'tabatha'
    }
};

/* 名单外角色，单独一张表，由剧情页按名字取用 */
var FACE_EXTRA = {
    'エゼルバード': 'xt_ethelberd',
    'ギルバート': 'xt_gilbert',
    '主角之子': 'xt_baby'
};
