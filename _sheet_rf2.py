# -*- coding: utf-8 -*-
"""把 A6NJ（符文工房2）的立绘按组拼成对照图，方便人眼辨认谁是谁。"""
import os
import re
import glob
from PIL import Image, ImageDraw, ImageFont

SRC = r'G:/BaiduNetdiskDownload/A6NJ_NCER_extract'
OUT = r'G:/wit_tools/work/RF_WIKI/_sheet_rf2_%d.png'

groups = {}
for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    b = os.path.basename(f)
    m = re.match(r'(pic_[a-z]+\d+(?:_[A-Z0-9]+)?)_(\d+)\.NCER_\d+\.png$', b)
    if not m:
        continue
    groups.setdefault(m.group(1), []).append((int(m.group(2)), f))

def order(g):
    m = re.match(r'pic_([a-z]+)(\d+)', g)
    kind = 0 if m.group(1) == 'npc' else 1
    return (kind, int(m.group(2)), g)

gs = sorted(groups, key=order)
print('组数', len(gs))

try:
    font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 26)
except Exception:
    font = ImageFont.load_default()

COLS, TW, TH, PAD, LAB = 3, 512, 256, 10, 34
per = 9
for pi in range(0, len(gs), per):
    chunk = gs[pi:pi + per]
    rows = (len(chunk) + COLS - 1) // COLS
    W = COLS * (TW + PAD) + PAD
    H = rows * (TH + LAB + PAD) + PAD
    canvas = Image.new('RGB', (W, H), (245, 245, 245))
    d = ImageDraw.Draw(canvas)
    for i, g in enumerate(chunk):
        r, c = divmod(i, COLS)
        x = PAD + c * (TW + PAD)
        y = PAD + r * (TH + LAB + PAD)
        sub = groups[g]
        sub.sort()
        im = Image.open(sub[0][1]).convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        canvas.paste(bg.convert('RGB'), (x, y + LAB))
        d.text((x, y + 4), '%s  (%d帧)' % (g, len(sub)), fill=(20, 20, 20), font=font)
    path = OUT % (pi // per)
    canvas.save(path)
    print(path, canvas.size)
