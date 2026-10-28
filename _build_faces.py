# -*- coding: utf-8 -*-
"""从 ARFJ_NCER_ext 的立绘图集批量切出符文1 角色头像。

源：G:/BaiduNetdiskDownload/ARFJ_NCER_ext/*.NCER_0.png
    每张 512x256 RGBA，画的是一个人物的半身立绘，底部贴齐画布下沿；
    文件名 <内部代号>_<帧号>.NCER_0.png，同一人物有多帧（表情差分）。

做法：以「头顶」为锚点，水平取头顶 10 行的中心，向左上各取半个边长，
      裁成正方形。同一个人物各帧的头顶位置一致，所以只算一次、套用到所有帧。

输出：assets/face/rf1/<key>.png（默认帧）+ <key>_<n>.png（其余表情，可选）
"""
import os
import sys
import re
import glob
import numpy as np
from PIL import Image

SRC = r'G:/BaiduNetdiskDownload/ARFJ_NCER_ext'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'face', 'rf1')
SIZE = 112          # 头像边长（原始像素，不放大）
TOP_PAD = 11        # 头顶到框顶留几像素（圆形裁切会吃掉四角，留少了头顶会被削）

# 源文件组名 -> 站内角色 key（key 同时是文件名与 FACE 表的取值）
GROUPS = {
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


def collect():
    """把散落的文件名按人物归组，兼容大小写混用与 m_bianca06 这种畸形名。"""
    files = {}
    for p in glob.glob(os.path.join(SRC, '*.png')):
        base = os.path.basename(p)
        m = re.match(r'^(.*?)[._]?(\d+)\.NCER_0\.png$', base)
        if m:
            name, idx = m.group(1), int(m.group(2))
        else:
            name, idx = base.replace('.NCER_0.png', ''), 0
        name = name.rstrip('._')
        files.setdefault(name, []).append((idx, p))
    for k in files:
        files[k].sort()
    # 大写单帧是首帧，小写多帧是其余；合并成一组
    merged = {}
    for name, lst in files.items():
        low = name.lower()
        target = None
        for g in GROUPS:
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
    band = a[y0 + 12:y0 + 52]
    xs = np.nonzero(band)[1]
    if len(xs) == 0:                      # 极矮的图（如婴儿）退回整体
        band = a[y0:]
        xs = np.nonzero(band)[1]
    cx = int(round((xs.min() + xs.max()) / 2))
    hw = int(xs.max() - xs.min() + 1)
    return y0, cx, hw


def cut(im, y0, cx, hw):
    """按头宽定裁框，保证每张头像里「头占多大」是一致的。

    一开始用固定边长 112，列表里的圆形头像只有 33px，脸缩得太小、五官糊成一片。
    改成边长 = 头宽 × 1.7：脸在框里稳定占六成左右。
    不做统一缩放——原始像素直接输出，放大反而糊（本作头宽只有 49~127 像素，
    放大到 128 就看得出来了）。输出尺寸因此不齐，交给 CSS 的 object-fit 处理。
    """
    side = int(round(hw * 1.7))
    side = max(72, min(224, side))
    left = cx - side // 2
    top = max(0, y0 - TOP_PAD)
    tile = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    tile.alpha_composite(im.crop((left, top, left + side, top + side)))
    return tile


def main():
    os.makedirs(OUT, exist_ok=True)
    merged = collect()
    missing = [g for g in GROUPS if g not in merged]
    if missing:
        print('缺组：', missing)
    # 默认只出每人一张（列表和详情页用得到的就是这一张）。
    # 表情差分 148 张合计约 1.5MB，眼下没人用，别往仓库里塞；
    # 哪天真要做「换表情」，加 --all 跑一遍就有。
    want_all = '--all' in sys.argv
    n = 0
    for gname, key in sorted(GROUPS.items(), key=lambda kv: kv[1]):
        lst = merged.get(gname)
        if not lst:
            continue
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
            tile = cut(im, y, c, w)
            name = f'{key}.png' if pos == 0 else f'{key}_{idx:02d}.png'
            tile.save(os.path.join(OUT, name))
            n += 1
        print(f'{gname:14s} -> {key:14s} {len(lst):2d} 帧可用  y0={y0} cx={cx} 头宽={hw} 边长={max(72,min(224,round(hw*1.7)))}')
    print(f'\n共写出 {n} 张，目录 {OUT}')


if __name__ == '__main__':
    main()
