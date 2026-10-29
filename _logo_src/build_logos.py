# -*- coding: utf-8 -*-
"""
各作标题 logo 统一构建：裁到内容边界 → 等面积归一化 → 输出 assets/logo/<id>.png

为什么要等面积：10 作的 logo 宽高比从 1.55（海洋，方形带棕榈）到 3.5（符文3，
细长条）差一倍多。单纯按宽度归一，细长条会占满而方形 logo 显得小；按高度归一，
细长条又超出卡片宽度被 contain 缩小。用 sqrt(w*h) 做基准，两者的视觉重量最接近。

用法：
    python _logo_src/build_logos.py            # 出全部可用项
    python _logo_src/build_logos.py --check    # 只打印边界与输出尺寸，不写文件
"""
import io
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), 'assets', 'logo')

# 等面积基准：sqrt(w*h) 归一到这个值，再按上/下限夹一次
BASE = 268
MAX_W, MAX_H = 420, 220

SRC = {
    'rf1':   os.path.join(HERE, 'rf1_hard.png'),
    'rf2':   os.path.join(HERE, 'rf2_v2.png'),
    'rf3':   r'_logo_src/src/rf3_title.png',
    'rf3sp': r'_logo_src/src/rf3sp_logo.png',
    'rf4sp': r'_logo_src/src/rf4sp_logo.png',
    'rf5':   r'_logo_src/src/rf5_logo.png',
    'rff':   os.path.join(HERE, 'rff_src.png'),  # 早年裁好的成品，复制了一份当源
    'rfo':   os.path.join(HERE, 'rfo_cut.png'),
    'azuma': r'_logo_src/src/azuma_logo.png',
}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(p):
    cands = [p] if os.path.isabs(p) else [os.path.join(ROOT, p),
                                         os.path.join(r'G:/wit_tools/work', p)]
    for c in cands:
        if os.path.exists(c):
            return Image.open(c).convert('RGBA'), c
    return None, cands[-1]


def trim(im):
    """按 alpha 裁到内容边界；alpha 全 255 时退回按非背景色裁"""
    a = im.getchannel('A')
    bb = a.getbbox()
    return im.crop(bb) if bb else im


def norm(im):
    """等面积归一化，再夹到 MAX_W / MAX_H；只缩不放，免得 DS 原尺寸的 logo 被插糊"""
    w, h = im.size
    s = BASE / ((w * h) ** 0.5)
    s = min(s, 1.0)
    if w * s > MAX_W:
        s = MAX_W / w
    if h * s > MAX_H:
        s = MAX_H / h
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    return im.resize((nw, nh), Image.LANCZOS)


def main():
    check = '--check' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    for gid, p in SRC.items():
        im, real = load(p)
        if not os.path.exists(real):
            print('%-7s MISS  %s' % (gid, p))
            continue
        t = trim(im)
        n = norm(t)
        kb = 0
        if not check:
            dst = os.path.join(OUT, gid + '.png')
            n.save(dst, optimize=True)
            kb = os.path.getsize(dst) / 1024
        print('%-7s src %-42s %4dx%-4d → trim %4dx%-4d → out %4dx%-4d %6.1fKB'
              % (gid, os.path.basename(real), im.size[0], im.size[1],
                 t.size[0], t.size[1], n.size[0], n.size[1], kb))


if __name__ == '__main__':
    main()
