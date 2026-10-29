# -*- coding: utf-8 -*-
"""把 assets/logo/*.png 按卡片真实尺寸+渐变底色拼一张预览，用来判断视觉是否协调。

卡片图区实测：宽约 195px、高 4.1rem≈66px（@1rem=16px）。
这里按 2x 出图（390x132 的图区 + 卡片名两行），看得清细节。
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'logo')
DATA = json.load(open(os.path.join(ROOT, '_logo_src', '_games.json'), encoding='utf-8'))

S = 2                 # 2x
CW, CH = 195 * S, 66 * S      # 图区
GAP = 14
COLS = 5

order = [g['id'] for g in DATA]
by = {g['id']: g for g in DATA}


def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def grad(w, h, c0, c1):
    im = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(im)
    a, b = hex2rgb(c0), hex2rgb(c1)
    # 140deg 近似：对角线性
    for y in range(h):
        for_x = y / max(1, h - 1)
        for x in range(0, w, 8):
            t = (x / max(1, w - 1) * 0.45 + for_x * 0.55)
            c = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
            d.rectangle([x, y, x + 7, y], fill=c)
    return im


def font(sz):
    for p in (r'C:/Windows/Fonts/msyhbd.ttc', r'C:/Windows/Fonts/msyh.ttc'):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, sz)
            except Exception:
                pass
    return ImageFont.load_default()


CELL_H = CH + 46 * S
rows = (len(order) + COLS - 1) // COLS
sheet = Image.new('RGBA', (COLS * (CW + GAP) + GAP, rows * (CELL_H + GAP) + GAP), (250, 250, 251, 255))
d = ImageDraw.Draw(sheet)
f1 = font(13 * S)
f2 = font(9 * S)

miss = []
for i, gid in enumerate(order):
    g = by[gid]
    x = GAP + (i % COLS) * (CW + GAP)
    y = GAP + (i // COLS) * (CELL_H + GAP)
    cell = grad(CW, CH, g['grad'][0], g['grad'][1]).convert('RGBA')
    p = os.path.join(OUT, gid + '.png')
    if os.path.exists(p):
        logo = Image.open(p).convert('RGBA')
        r = min(CW / logo.width, CH / logo.height)
        logo = logo.resize((max(1, round(logo.width * r)), max(1, round(logo.height * r))), Image.LANCZOS)
        cell.paste(logo, ((CW - logo.width) // 2, (CH - logo.height) // 2), logo)
    else:
        miss.append(gid)
        d.text((x + 6, y + CH // 2), 'MISSING', fill=(255, 255, 255, 255), font=f1)
    sheet.paste(cell, (x, y))
    d.text((x + 2, y + CH + 6 * S), g['name'], fill=(30, 30, 34, 255), font=f1)
    d.text((x + 2, y + CH + 24 * S), gid, fill=(150, 150, 158, 255), font=f2)

dst = sys.argv[1] if len(sys.argv) > 1 else '_logo_cards.png'
sheet.save(dst)
print(dst, sheet.size, '缺:', miss)
