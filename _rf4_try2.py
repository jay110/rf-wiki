# -*- coding: utf-8 -*-
"""符文4 头像候选框批量试裁（多角色 × 多候选，一张图看完）。

用法：
    python _rf4_try2.py "マーガレット:135,150,200|163,172,188" "フレイ:103,62,102|100,55,110"
输出：G:/wit_tools/work/_try.png
"""
import os
import sys
from PIL import Image, ImageDraw

SRC = r'G:/wit_tools/work/_rf3/_face_rf4_src'
OUT = r'G:/wit_tools/work/_try.png'
CELL = 180
GAP = 10


def main():
    items = []
    for a in sys.argv[1:]:
        name, rest = a.split(':', 1)
        boxes = [tuple(int(v) for v in b.split(',')) for b in rest.split('|')]
        items.append((name, boxes))
    cols = max(len(b) for _, b in items)
    W = GAP + cols * (CELL + GAP)
    H = GAP + len(items) * (CELL + 26 + GAP)
    sheet = Image.new('RGBA', (W, H), (245, 245, 245, 255))
    d = ImageDraw.Draw(sheet)
    for r, (name, boxes) in enumerate(items):
        im = Image.open(os.path.join(SRC, name + '.png')).convert('RGBA')
        for c, (l, t, s) in enumerate(boxes):
            tile = im.crop((l, t, l + s, t + s)).resize((CELL, CELL), Image.LANCZOS)
            x = GAP + c * (CELL + GAP)
            y = GAP + r * (CELL + 26 + GAP)
            for yy in range(0, CELL, 14):
                for xx in range(0, CELL, 14):
                    if (xx // 14 + yy // 14) % 2 == 0:
                        d.rectangle([x + xx, y + 16 + yy, x + xx + 13, y + 16 + yy + 13], fill=(222, 222, 222, 255))
            sheet.paste(tile, (x, y + 16), tile)
            d.rectangle([x, y + 16, x + CELL, y + 16 + CELL], outline=(210, 210, 210, 255))
            d.text((x, y + 2), '%s %d: %s' % (name[:6], c + 1, (l, t, s)), fill=(0, 0, 0, 255))
    sheet.save(OUT)
    print('written', OUT, sheet.size)


if __name__ == '__main__':
    main()
