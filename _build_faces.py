# -*- coding: utf-8 -*-
"""从解包的 NCER 立绘图集批量切出角色头像（符文1 / 符文2）。

源：G:/BaiduNetdiskDownload/ARFJ_NCER_ext        （符文1，ARFJ）
    G:/BaiduNetdiskDownload/A6NJ_NCER_extract    （符文2，A6NJ）
    每张 512x256 RGBA，画的是一个人物的半身立绘，底部贴齐画布下沿；
    文件名 <内部代号>_<帧号>.NCER_0.png，同一人物有多帧（表情差分）。

做法：以「头顶」为锚点，水平取头顶下方 12~52 行这一带的中心，按该带宽度定边长，
      裁成正方形。同一个人物各帧的头顶位置一致，所以只算一次、套用到所有帧。

用法：
    python _build_faces.py              # 符文1，每人一张
    python _build_faces.py rf2          # 符文2
    python _build_faces.py rf1 --all    # 连表情差分一起出

输出：assets/face/<game>/<key>.png（默认帧）+ <key>_<n>.png（其余表情，可选）
"""
import os
import sys
import re
import glob
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))

# 符文1：源文件组名 -> 站内角色 key（key 同时是文件名与 FACE 表的取值）
RF1_GROUPS = {
    'ragna':      'ragna',
    'mist':       'mist',
    'a_rosetta':  'rosetta',
    'a_jeff':     'jeff',
    'b_camus':    'camus',
    'b_edo':      'edo',
    'c_anne':     'anne',
    'c_torte':    'torte',
    'c_zaha':     'zaha',
    'd_cecilia':  'cecilia',
    'd_russel':   'russel',
    'e_lapis':    'lapis',
    'e_white':    'white',
    'f_nicholl':  'nicholl',
    'f_sala':     'sala',
    'g_sebastian': 'sebastian',
    'H_MELODY':   'melody',
    'IVAN':       'ivan',
    'I_NEUMAN':   'neuman',
    'J_LEO':      'leo',
    'K_FIA':      'fil',
    'K_GODWIN':   'godwin',
    'LINET':      'linet',
    'L_MEI':      'mei',
    'L_RUDE':     'rude',
    'M_BIANCA':   'bianca',
    'M_JACOLNUS': 'jacolnus',
    'M_TABITHA':  'tabatha',
    'N_SHARON':   'sharon',
    # 名单外（非居民，剧情角色）——单独放，别混进居民名录
    'EZELBIRD':   'xt_ethelberd',
    'GILBERTH':   'xt_gilbert',
    'baby':       'xt_baby',
}

# 符文2：组名 -> key。归属依据见 _face_src/rf2_owners.json（wiki 页面引用）
# 与官网 15 周年立绘的人工比对；花嫁/花婿候补各有 _W 婚礼差分，这里不用。
RF2_GROUPS = {
    'pic_pc00':   'kyle',       # 凯尔（主角）
    'pic_pc01':   'ars',        # 阿鲁斯（子代·男）
    'pic_pc02':   'aria',       # 阿莉亚（子代·女，与阿鲁斯是双胞胎）
    'pic_npc01':  'douglas',    # 道格拉斯
    'pic_npc02':  'mana',       # 玛娜
    'pic_npc03':  'julia',      # 茱莉雅
    'pic_npc04':  'natalie',    # 娜塔莉
    'pic_npc05':  'alicia',     # 阿莉希亚
    'pic_npc06':  'ray',        # 雷
    'pic_npc09':  'gordon',     # 高顿
    'pic_npc10':  'dorothy',    # 多萝茜
    'pic_npc11':  'cammy',      # 卡农
    'pic_npc13':  'cecilia',    # 塞西莉娅
    'pic_npc14':  'jake',       # 杰克
    'pic_npc19':  'barrett',    # 巴瑞特
    'pic_npc21':  'herman',     # 赫理查科斯（日文 ヘリチャコス）
    'pic_npc22':  'rosalind',   # 罗萨琳德
    'pic_npc23':  'max',        # 麦克斯
    'pic_npc25':  'yue',        # 由绘
    # 下面这些站内没有单独的角色页，但人物名录里有，列表里一样要头像
    'pic_npc07':  'muu',        # 姆（与苏是双胞胎，立绘几乎一样）
    'pic_npc08':  'suu',        # 苏
    'pic_npc12':  'endor',      # 恩多尔
    'pic_npc15':  'orfas',      # 奥斐斯
    'pic_npc16':  'tanya',      # 塔喵
    'pic_npc17':  'roy',        # 罗伊
    'pic_npc18':  'brai',       # 布莱伊
    'pic_npc20':  'leen',       # 凌
    'pic_npc24':  'ramlia',     # 拉姆莉雅
}

# 符文3：官网立绘。新官网（15 周年站）11 张 560x940，旧官网（marv.jp 2009）21 张 220x360。
# 两套都是官方全身立绘、透明底，谁能拿到大图就用谁：花嫁候补用新官网，镇民用旧官网。
# 隐藏花嫁 クルルファ 官网没有立绘（要通关才解锁，官方不做宣传），オンドルファ 与 ゼゼ
# 两张名单页里也没有，这三位宁可空着。
RF3_GROUPS = {
    # 新官网 runefactory.marv.jp/series/rf3/
    'マイス':     'mais',        # 主角
    'シア':       'sia',
    'トゥーナ':   'toona',
    'カリン':     'karin',
    'ショコラ':   'chocolat',
    'マリオン':   'marion',
    'ソフィア':   'sophia',
    'ペルシャ':   'persia',
    'さくや':     'sakuya',
    'イオン':     'ion',
    'ダリア':     'dahlia',
    # 旧官网 marv.jp/special/game/ds/runefactory3/chara/townspeople.html
    'ウェルズ':   'wells',
    'モニカ':     'monica',
    'マージョリー': 'marjorie',
    'ガジ':       'gadzhi',
    'グルテン':   'gluten',
    'ラスク':     'rusk',
    'しののめ':   'shinonome',
    'ヘーゼル':   'hazel',
    'ドンチャコス': 'donchacos',
    'エリザ':     'elisa',
    'カルロス':   'carlos',
}

# 符文4：主角与婚配候补 14 人用官网（RF4SP 官方站，540x1089 全身彩图）；
# 镇民 13 人官网没放，用 wiki 上解包出的游戏内立绘（NN NAME body 00 00.png，约 200x255）。
# 归属靠 imageusage 反查：每个文件被哪个日文名的页面引用，就是谁。
# 详细出处与编号对照见 _face_src/rf4/SOURCES.md。
RF4_GROUPS = {
    # 官网 www.marv.jp/special/game/runefactory4SP/character/
    'レスト':       'lest',        # 男主
    'フレイ':       'frey',        # 女主
    'マーガレット': 'margaret',
    'コハク':       'kohaku',
    'ビシュナル':   'vishnal',
    'ディラス':     'dylas',
    'フォルテ':     'forte',
    'ドルチェ':     'dolce',
    'アーサー':     'arthur',
    'キール':       'kiel',
    'シャオパイ':   'xiaopai',
    'クローリカ':   'clorica',
    'ダグ':         'doug',
    'レオン':       'leon',
    # 游戏内立绘（wiki 解包）
    'ヴォルカノン': 'volkanon',
    'バド':         'bado',
    'ポコリーヌ':   'porcoline',
    'リンファ':     'linfa',
    'エルミナータ': 'illuminata',
    'ブロッサム':   'blossom',
    'ジョーンズ':   'jones',
    'ナンシー':     'nancy',
    'セルザウィード': 'ventuswill',
    'バレット':     'barrett',     # 就是符文2 那位巴雷特，RF4 客串登场
    'トゥーナ':     'raven',       # 就是符文3 那位托娜，RF4 里来塞尔菲亚找矿；官方英文 Raven
    'ノエル':       'noel',        # 主角的孩子（子），站内原缺日文名
    'ルーナ':       'luna',        # 主角的孩子（女），站内原缺日文名
}

CONF = {
    'rf1': {
        'src': r'G:/BaiduNetdiskDownload/ARFJ_NCER_ext',
        'out': 'assets/face/rf1',
        'pattern': r'^(.*?)[._]?(\d+)\.NCER_0\.png$',
        'merge_case': True,      # 这套解包里同一人物有大写单帧与小写多帧两份
        'groups': RF1_GROUPS,
        'over': {},
        # 2026-10-30 统一规格：与符文4 口径一致——脸高约占框 65%，输出一律 160×160。
        # 之前只走 head_anchor + side=hw*1.7 且没开 exact_side，尺寸在 83~216px 乱跳、
        # 小图在 2x 屏发虚。开 face_ratio 后按「头高/0.65」反推源框（比脸大一圈，
        # 采样自 512 宽高分辨率源），再缩到 160，比把 83px 硬拉大锐得多。
        # 帽子/宽肩的个别角色若被压扁或裁掉，在 over 里微调（dx/dy/side）。
        'face_ratio': 0.65,
        'exact_side': True,
        'max_side': 160,
    },
    'rf2': {
        'src': r'G:/BaiduNetdiskDownload/A6NJ_NCER_extract',
        'out': 'assets/face/rf2',
        # 只认 <组>_<帧>.NCER_0.png，_W/_M（婚礼装）自动排除
        'pattern': r'^(pic_npc\d+|pic_pc\d+)_(\d+)\.NCER_0\.png$',
        'merge_case': False,
        'groups': RF2_GROUPS,
        'over': {
            # 紫礼帽两侧帽檐把它撑到 160px 宽，按帽子定框脸就太小；按脸定、再往上让出帽顶
            'pic_npc05': {'side': 150, 'dy': -12},
            # 这几位头顶有尖（双马尾、呆毛、发梢），框再往上挪几像素，免得圆形裁切削掉
            'pic_npc11': {'dy': -8},
            'pic_npc14': {'dy': -8},
            'pic_npc19': {'dy': -8},
            # 塔喵背后扛着大刀，把测量带撑到 114px，按它定框脸会缩成一点
            'pic_npc16': {'side': 140},
            # 草帽/发梢顶着画布上沿的两位
            'pic_npc12': {'dy': -6},
            'pic_npc24': {'dy': -8},
        },
    },
    'rf3': {
        # 官网立绘（源图连同出处清单见 _face_src/rf3/SOURCES.md）
        'src': r'G:/wit_tools/work/_rf3/_face_rf3_src',
        'out': 'assets/face/rf3',
        # 一人一张，文件名就是日文名，不带帧号
        'pattern': r'^(.+)\.png$',
        'merge_case': False,
        'groups': RF3_GROUPS,
        'over': {
            # 伊奥头上那顶宽檐帽把测量带撑到 204px，按它定框人只剩一顶帽子：
            # 脸在帽子右下方，缩框、右移再下移才露得出来
            'イオン': {'side': 180, 'dx': 22, 'dy': 45},
            # 主角头顶那撮呆毛贴着框顶
            'マイス': {'dy': -8},
            # 帽子/兜帽顶到画布上沿的几位
            'ガジ': {'dy': -6},
            'マリオン': {'dy': -10},
            'マージョリー': {'dy': -8},
            'ウェルズ': {'dy': -8},
        },
        # 这批是全身立绘，头在画面上部；测量带按图的高度缩放，别照搬立绘页的固定值
        'band_scale': True,
        'max_side': 160,
    },
    'rf4': {
        'src': r'G:/wit_tools/work/_rf3/_face_rf4_src',
        'out': 'assets/face/rf4',
        # 一人一张，文件名就是日文名
        'pattern': r'^(.+)\.png$',
        'merge_case': False,
        'groups': RF4_GROUPS,
        'over': {},
        # 27 位全部手标「框在哪」——(左上角 x, 左上角 y, 边长)，原图像素。
        #
        # 为什么一个不剩全手标：自动测量（head_anchor）对这批图不可靠。符文4 的
        # 立绘有两套规格——官网那批 540x1098 全身彩图，和 wiki 上解包的
        # 200x255 半身图。前者的姿态花得离谱：迪拉斯手上斜着一根鱼竿、朵儿洁
        # 顶着宽檐帽、奇尔盘腿坐着、两位主角半身还拿扇子围巾，包围盒全被道具
        # 带跑；后者人物头顶直接贴画布上沿（y0=0），band 量出来的「头宽」其实
        # 是画布宽，钠茜那几张甚至算出 left=-14 把右半张脸裁掉。
        #
        # 另一件事是**脸的占比**。这批裁出来脸占框的比例从 45% 到 80% 都有，
        # 同一页排下来有的人脸撑满圆圈、有的人一张小脸浮在中间。2026-10-29
        # 这轮统一收到「脸高约占框宽 65%」，2.1rem 的圆形列表头像才不会一半
        # 看不清五官。以后新增角色，照这个比例标就行。
        'face_box': {
            'レスト':       (76, 58, 88),
            'フレイ':       (100,  68,  92),
            'マーガレット': (208, 181, 153),
            'コハク':       (190, 250, 150),
            'ビシュナル':   (189, 122, 155),
            'ディラス':     (181, 121, 207),
            'フォルテ':     (321,  62, 214),
            'ドルチェ':     (152, 96, 153),
            'アーサー':     (182, 159, 145),
            'キール':       (196, 310, 148),
            'シャオパイ':   (242, 143, 179),
            'クローリカ':   (142, 202, 162),
            'ダグ':         (202, 179, 124),
            'レオン':       (204, 123, 180),
            'ヴォルカノン': ( 48,   4,  97),
            'バド':         ( 46,   0, 104),
            'ポコリーヌ':   ( 52,   8, 120),
            'リンファ':     ( 44,   8,  94),
            'エルミナータ': (55, 0, 116),
            'ブロッサム':   ( 36,   9, 101),
            'ジョーンズ':   (42, 0, 99),
            'ナンシー':     ( 14,   6,  92),
            'セルザウィード': ( 17,  23, 146),
            'バレット':     (  3,   0, 128),
            'トゥーナ':     ( 27,   5, 100),
            'ノエル':       (  5,   5,  98),
            'ルーナ':       ( 16,  12,  88),
        },
        # 两批都是全身立绘：官网那批 540x1089、解包那批 200x255，头都只占身高一小截
        'band_scale': True,
        # 官网这批姿态花（鱼竿、宽檐帽、盘腿坐），得先剔掉细长装饰再量
        'robust_band': True,
        'max_side': 160,
        # 输出一律 160x160（不足的放大），别让同一页里头像忽大忽小
        'exact_side': True,
    },
}

TOP_PAD = 11        # 头顶到框顶留几像素（圆形裁切会吃掉四角，留少了头顶会被削）
BAND = (12, 52)     # 用头顶下方这一带量头部中心与宽度（跳过呆毛与帽尖）


def collect(conf):
    """把散落的文件名按人物归组。"""
    files = {}
    for p in glob.glob(os.path.join(conf['src'], '*.png')):
        base = os.path.basename(p)
        m = re.match(conf['pattern'], base)
        if not m:
            continue
        g = m.groups()
        name = g[0]
        idx = int(g[1]) if len(g) > 1 and g[1] else 0
        files.setdefault(name, []).append((idx, p))

    groups = conf['groups']
    if not conf['merge_case']:
        merged = {g: sorted(v) for g, v in files.items() if g in groups}
        return merged

    for k in files:
        files[k].sort()
    # 大写单帧是首帧，小写多帧是其余；合并成一组
    merged = {}
    for name, lst in files.items():
        low = name.lower()
        target = None
        for g in groups:
            if g.lower() == low:
                target = g
                break
        if target is None:
            continue
        merged.setdefault(target, []).extend(lst)
    for k in merged:
        merged[k].sort()
    return merged


def head_anchor(im, band=None, robust=False):
    """头顶 y、头部水平中心与头宽。

    两个坑都在「头顶」上：
    1) 有人头顶只有一撮呆毛/帽尖（IVAN 顶端只有 9px 宽），拿它当锚点会把脸推偏；
    2) 直接取包围盒中心，又会被人物垂下或举起的手臂带跑。
    所以跳过最上面 12 行，用下面 40 行（额头到下巴这一带）来定中心与宽度。
    头宽再用来定裁框边长，好让所有人的脸在头像里大小一致。

    全身立绘（符文3 那批）图更大、头更小，固定 40 行会量到肩膀上，
    所以带 band 参数时按比例缩。

    robust=True 是给符文4 官网那批彩图准备的：它们姿态花得多——迪拉斯手上
    斜着一根鱼竿、朵儿洁顶着宽檐帽、奇尔盘腿坐着。鱼竿顶端比头还高，包围盒
    与中心会被它整个带跑（迪拉斯量出来的「头宽」是 463px 的鱼竿）。所以先按
    列密度把这类细长物剔掉：只留下「实心」的列再找头顶与中心。
    """
    lo, hi = band or BAND
    a = np.array(im)[:, :, 3] > 8
    cols = None
    if robust:
        col = a.sum(axis=0)
        keep = col >= max(3, col.max() * 0.25)
        if keep.sum() < 8:                 # 图太窄就别剔了
            keep = col > 0
        a = a[:, keep]
        cols = np.nonzero(keep)[0]
    ys = np.nonzero(a)[0]
    y0 = int(ys.min())
    _band = a[y0 + lo:y0 + hi]
    xs = np.nonzero(_band)[1]
    if len(xs) == 0:                      # 极矮的图（如婴儿）退回整体
        _band = a[y0:]
        xs = np.nonzero(_band)[1]
    if robust and cols is not None:
        xs = cols[xs]
    cx = int(round((xs.min() + xs.max()) / 2))
    hw = int(xs.max() - xs.min() + 1)
    return y0, cx, hw


def cut(im, y0, cx, hw, over=None, check=40, box=None, ratio=None):
    """按头宽定裁框，保证每张头像里「头占多大」是一致的。

    一开始用固定边长 112，列表里的圆形头像只有 33px，脸缩得太小、五官糊成一片。
    改成边长 = 头宽 × 1.7：脸在框里稳定占六成左右。
    不做统一缩放——原始像素直接输出，放大反而糊（本作头宽只有 49~127 像素，
    放大到 128 就看得出来了）。输出尺寸因此不齐，交给 CSS 的 object-fit 处理。

    box 给的是 (left, top, side)：图太难自动定位时（符文4 官网那批）直接按标好的框裁。

    ratio 给的是「脸高占框的比例」目标（如 0.65）：按头高 / ratio 反推源框边长，
    让脸在 160 框里稳定占这个比例；同时源框比脸大一圈，采样自高分辨率源、缩到
    160 比把小图硬拉大更锐。符文1 这轮用这个模式统一规格（与符文4 的 face_box
    口径一致，但自动算框、帽子/宽肩的几位再用 over 微调）。
    """
    if box:
        left, top, side = box
        tile = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        tile.alpha_composite(im.crop((left, top, left + side, top + side)))
        return tile
    if ratio:
        a = np.array(im)[:, :, 3] > 8
        ys, xs = np.nonzero(a)
        ytop = int(ys.min())
        y1b = int(ys.max())
        full_h = y1b - ytop + 1
        # 只取内容框上半部（约 0~62%）算「头部」紧致包围盒，剔除肩膀把框撑大的问题，
        # 让每个头的较长边都≈框的 ratio 比例，排在一起脸大小才一致。
        cut = ytop + int(full_h * 0.62)
        sub = a[ytop:cut]
        sy, sx = np.nonzero(sub)
        if len(sx) == 0:                  # 极端情况退回整框
            sy, sx = np.nonzero(a[ytop:cut + (y1b - cut)])
        hx0, hx1 = int(sx.min()), int(sx.max())
        hy0, hy1 = int(sy.min()), int(sy.max())
        hw_r = hx1 - hx0 + 1
        hh_r = hy1 - hy0 + 1
        side = max(hw_r, hh_r) / (ratio * 0.90)   # 留约 10% 余量，头不贴边
        side = int(round(side))
        side = max(84, min(248, side))
        if over:                          # 个别角色按帽子/宽肩覆盖
            side = over.get('side', side)
            cx = cx + over.get('dx', 0)
            ytop = ytop + over.get('dy', 0)
        hcx = (hx0 + hx1) // 2
        cx = cx if over and 'dx' in over else hcx
        left = cx - side // 2
        top = max(0, ytop - int(round(side * 0.12)))   # 头顶留约 12% 额头
        left = max(0, min(left, im.width - side))
        top = max(0, min(top, im.height - side))
        tile = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        tile.alpha_composite(im.crop((left, top, left + side, top + side)))
        return tile
    side = int(round(hw * 1.7))
    side = max(72, min(224, side))
    if over:                              # 个别角色按帽子量出来会过大，单独覆盖
        side = over.get('side', side)
        cx = cx + over.get('dx', 0)
        y0 = y0 + over.get('dy', 0)
    left = cx - side // 2
    top = y0 - TOP_PAD
    # 自检：头顶这 40 行的横向跨度不能超出圆形边界，超了就把框往上挪。
    # 圆形头像裁出的边不是直线，帽檐、兽耳、呆毛贴着框顶时会被削掉一块。
    a = np.array(im)[:, :, 3] > 8
    band = a[y0:y0 + check]
    xs = np.nonzero(band)[1]
    if len(xs):
        half = int(max(abs(xs.min() - cx), abs(xs.max() - cx)))
        r = side / 2.0
        if half < r - 1:
            need = r - (r * r - half * half) ** 0.5
            top = min(top, int(y0 - need) - 2)
    top = max(0, top)
    tile = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    tile.alpha_composite(im.crop((left, top, left + side, top + side)))
    return tile


def main():
    game = 'rf1'
    for a in sys.argv[1:]:
        if a in CONF:
            game = a
    conf = CONF[game]
    out = os.path.join(ROOT, conf['out'])
    os.makedirs(out, exist_ok=True)
    merged = collect(conf)
    missing = [g for g in conf['groups'] if g not in merged]
    if missing:
        print('缺组：', missing)
    # 默认只出每人一张（列表和详情页用得到的就是这一张）。
    # 表情差分上百张，眼下没人用，别往仓库里塞；
    # 哪天真要做「换表情」，加 --all 跑一遍就有。
    want_all = '--all' in sys.argv
    n = 0
    for gname, key in sorted(conf['groups'].items(), key=lambda kv: kv[1]):
        lst = merged.get(gname)
        if not lst:
            continue
        over = conf['over'].get(gname)
        im0 = Image.open(lst[0][1]).convert('RGBA')
        # 符文3 是全身立绘，头只占身高的七八分之一，固定 40 行会一路量到肩膀上。
        # 改成按「人物在画面里的实际高度」取 2%~10% 这一段（额头到下巴），两套尺寸都适用。
        if conf.get('band_scale'):
            a0 = np.array(im0)[:, :, 3] > 8
            ys0 = np.nonzero(a0)[0]
            bh = int(ys0.max() - ys0.min())
            bd = (max(4, int(round(bh * 0.02))), max(12, int(round(bh * 0.10))))
        else:
            bd = None
        y0, cx, hw = head_anchor(im0, bd, conf.get('robust_band', False))
        chk = (bd[1] - bd[0]) if bd else 40
        # 标了绝对框的几位：直接用标好的框裁，不再走「头宽 × 1.7」那套
        box = conf.get('face_box', {}).get(gname)
        ratio = conf.get('face_ratio')
        for pos, (idx, p) in enumerate(lst):
            if pos > 0 and not want_all:
                continue
            if p == lst[0][1]:
                im, y, c, w = im0, y0, cx, hw
            else:
                im = Image.open(p).convert('RGBA')
                y, c, w = head_anchor(im, bd)
            tile = cut(im, y, c, w, over, chk, box if pos == 0 else None, ratio)
            # 符文3 官网立绘裁出来有 224px，比符号1／2 的（92~224）大一圈，
            # 列表里 33px、详情页 64px 都用不到这么多像素，压到 160 省一半体积
            # 符文4 用 exact_side：源图两种规格（官网 540x1098 全身、解包 200x255
            # 半身），裁出来的边长从 92 到 224 不等，不统一的话同一个页面里头像
            # 一个比一个大。全部落到 160（详情页 5.4rem 在 2x 屏要 172，够用）。
            cap = conf.get('max_side')
            if cap and (tile.width > cap or conf.get('exact_side')):
                tile = tile.resize((cap, cap), Image.LANCZOS)
            name = f'{key}.png' if pos == 0 else f'{key}_{idx:02d}.png'
            tile.save(os.path.join(out, name))
            n += 1
        print(f'{gname:14s} -> {key:10s} {len(lst):2d} 帧可用  y0={y0} cx={cx} 头宽={hw} 边长={tile.size[0]}')
    print(f'\n[{game}] 共写出 {n} 张，目录 {out}')


if __name__ == '__main__':
    main()
