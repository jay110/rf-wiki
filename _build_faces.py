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

CONF = {
    'rf1': {
        'src': r'G:/BaiduNetdiskDownload/ARFJ_NCER_ext',
        'out': 'assets/face/rf1',
        'pattern': r'^(.*?)[._]?(\d+)\.NCER_0\.png$',
        'merge_case': True,      # 这套解包里同一人物有大写单帧与小写多帧两份
        'groups': RF1_GROUPS,
        'over': {},
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
        name, idx = m.group(1), int(m.group(2))
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


def head_anchor(im):
    """头顶 y、头部水平中心与头宽。

    两个坑都在「头顶」上：
    1) 有人头顶只有一撮呆毛/帽尖（IVAN 顶端只有 9px 宽），拿它当锚点会把脸推偏；
    2) 直接取包围盒中心，又会被人物垂下或举起的手臂带跑。
    所以跳过最上面 12 行，用下面 40 行（额头到下巴这一带）来定中心与宽度。
    头宽再用来定裁框边长，好让所有人的脸在头像里大小一致。
    """
    a = np.array(im)[:, :, 3] > 8
    ys = np.nonzero(a)[0]
    y0 = int(ys.min())
    band = a[y0 + BAND[0]:y0 + BAND[1]]
    xs = np.nonzero(band)[1]
    if len(xs) == 0:                      # 极矮的图（如婴儿）退回整体
        band = a[y0:]
        xs = np.nonzero(band)[1]
    cx = int(round((xs.min() + xs.max()) / 2))
    hw = int(xs.max() - xs.min() + 1)
    return y0, cx, hw


def cut(im, y0, cx, hw, over=None):
    """按头宽定裁框，保证每张头像里「头占多大」是一致的。

    一开始用固定边长 112，列表里的圆形头像只有 33px，脸缩得太小、五官糊成一片。
    改成边长 = 头宽 × 1.7：脸在框里稳定占六成左右。
    不做统一缩放——原始像素直接输出，放大反而糊（本作头宽只有 49~127 像素，
    放大到 128 就看得出来了）。输出尺寸因此不齐，交给 CSS 的 object-fit 处理。
    """
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
    band = a[y0:y0 + 40]
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
        y0, cx, hw = head_anchor(im0)
        for pos, (idx, p) in enumerate(lst):
            if pos > 0 and not want_all:
                continue
            if p == lst[0][1]:
                im, y, c, w = im0, y0, cx, hw
            else:
                im = Image.open(p).convert('RGBA')
                y, c, w = head_anchor(im)
            tile = cut(im, y, c, w, over)
            name = f'{key}.png' if pos == 0 else f'{key}_{idx:02d}.png'
            tile.save(os.path.join(out, name))
            n += 1
        print(f'{gname:14s} -> {key:10s} {len(lst):2d} 帧可用  y0={y0} cx={cx} 头宽={hw} 边长={tile.size[0]}')
    print(f'\n[{game}] 共写出 {n} 张，目录 {out}')


if __name__ == '__main__':
    main()
