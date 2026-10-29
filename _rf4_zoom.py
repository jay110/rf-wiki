# -*- coding: utf-8 -*-
"""单张源图放大 + 原图像素网格，用于目测定 face_box。

用法：python _rf4_zoom.py マーガレット フレイ [--h 800] [--grid 25]
输出：G:/wit_tools/work/_zoom_src.png
"""
import os
import sys
from PIL import Image, ImageDraw

SRC = r'G:/wit_tools/work/_rf3/_face_rf4_src'
OUT = r'G:/wit_tools/work/_zoom_src.png'


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    h = 800
    grid = 25
    for a in sys.argv[1:]:
        if a.startswith('--h='):
            h = int(a.split('=')[1])
        if a.startswith('--grid='):
            grid = int(a.split('=')[1])
    ims = []
    for n in args:
        p = os.path.join(SRC, n + '.png')
        im = Image.open(p).convert('RGBA')
        s = h / im.size[1]
        im = im.resize((int(im.size[0] * s), h), Image.LANCZOS)
        ims.append((n, im, s))
    W = sum(i.size[0] for _, i, _ in ims) + 20 * (len(ims) + 1)
    H = h + 40
    sheet = Image.new('RGBA', (W, H), (250, 250, 250, 255))
    d = ImageDraw.Draw(sheet)
    x = 20
    for n, im, s in ims:
        # 棋盘格
        for yy in range(0, h, 16):
            for xx in range(0, im.size[0], 16):
                if (xx // 16 + yy // 16) % 2 == 0:
                    d.rectangle([x + xx, 40 + yy, x + xx + 15, 40 + yy + 15], fill=(228, 228, 228, 255))
        sheet.paste(im, (x, 40), im)
        d.text((x, 4), n, fill=(180, 0, 0, 255))
        for gx in range(0, int(im.size[0] / s) + 1, grid):
            px = x + gx * s
            if px > x + im.size[0]:
                break
            major = (gx % (grid * 4) == 0)
            d.line([(px, 40), (px, 40 + h)], fill=(255, 90, 90, 160) if major else (185, 185, 185, 130), width=1)
            if major:
                d.text((px + 1, 42), str(gx), fill=(0, 100, 200, 255))
        for gy in range(0, int(h / s) + 1, grid):
            py = 40 + gy * s
            if py > 40 + h:
                break
            major = (gy % (grid * 4) == 0)
            d.line([(x, py), (x + im.size[0], py)], fill=(255, 90, 90, 160) if major else (185, 185, 185, 130), width=1)
            if major:
                d.text((x + 2, py + 1), str(gy), fill=(0, 100, 200, 255))
        x += im.size[0] + 20
    sheet.save(OUT)
    print('written', OUT, sheet.size)
    for n, im, s in ims:
        print(n, 'src', int(im.size[0] / s), 'x', int(h / s))


if __name__ == '__main__':
    main()
