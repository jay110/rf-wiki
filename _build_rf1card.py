# -*- coding: utf-8 -*-
"""作品卡配图：符文工房1 —— 蓝天 + 蓝色飞龙 + 金色 logo。

源头是 DeSmuME 里截下来的真机标题画面（上屏），存
_title_src/src/rf1_desmume_title.png（582x442，已切掉模拟器窗口边）。

关键几何：卡片图框实测 284x66，object-fit:cover + object-position:50% 42%，
960x325 的图被裁到只剩 y≈43~266 这 223px 一条（占 69%）。标题画面是 4:3，
整屏塞进去 logo 会被切掉，所以只取「logo + 环绕的龙」那条横带、拉到满宽。

本来想用 ROM 素材（_nds_nitro.py 已能解 NCGR/NSCR），但 title_bg 是逐行滚动视差层，
静态拼必出周期横条，出不来这个组合，改用实机截图。
"""
import os, sys
from PIL import Image, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "_title_src", "src", "rf1_desmume_title.png")
OUT = os.path.join(ROOT, "assets", "title", "rf1.jpg")
W, H = 960, 325

# 卡片可视带（按 284x66 的图框 + 42% 定位算出来的），改 CSS 就得重算
VIS_Y0, VIS_Y1 = 43, 266
BAND_H = VIS_Y1 - VIS_Y0                     # 223
# 源图横带：130~265 正好把金色 logo（165~250）框全，上方还能带出龙身和天空
SRC_Y0, SRC_Y1 = 130, 265
# 原图偏灰，提一档饱和/对比让龙纹和金字立起来；锐化别过，会有光晕
COLOR, CONTRAST, BRIGHT, SHARP = 1.45, 1.12, 1.03, 75


def trim_border(im):
    """切掉模拟器窗口的灰边：按「蓝远大于红」找画面的真实左右边界"""
    import numpy as np
    a = np.asarray(im).astype(int)
    cols = np.where((a[:, :, 2] - a[:, :, 0]).mean(axis=0) > 25)[0]
    if len(cols) == 0:
        return im
    return im.crop((int(cols.min()), 0, int(cols.max()) + 1, im.height))


def main():
    if not os.path.exists(SRC):
        sys.exit("缺源图 %s" % SRC)
    top = trim_border(Image.open(SRC).convert("RGB"))

    core = top.crop((0, SRC_Y0, top.width, SRC_Y1)).resize((W, BAND_H), Image.LANCZOS)
    core = ImageEnhance.Color(core).enhance(COLOR)
    core = ImageEnhance.Contrast(core).enhance(CONTRAST)
    core = ImageEnhance.Brightness(core).enhance(BRIGHT)
    core = core.filter(ImageFilter.UnsharpMask(radius=2, percent=SHARP, threshold=3))

    # 可视带外面那截（上下）用天空补，正常看不见，只是别让边缘露黑
    sky = top.crop((0, 0, top.width, 150)).resize((W, H), Image.LANCZOS)
    sky = sky.filter(ImageFilter.GaussianBlur(1.2))

    cv = Image.new("RGB", (W, H))
    cv.paste(sky, (0, 0))
    cv.paste(core, (0, VIS_Y0))
    cv.save(OUT, quality=93)
    print("出图", OUT, cv.size, os.path.getsize(OUT) // 1024, "KB")


if __name__ == "__main__":
    main()
