# -*- coding: utf-8 -*-
"""作品卡配图：符文工房1 用 NDS ROM 里自己的素材合成（背景 + 图案 + logo）。

三层从 ROM 里取：
  背景  title_bgA  —— 标题画面的天空/海崖，取画面下部避开逐行滚动的横条
  图案  camp_bg02  —— 游戏 UI 的深蓝菱格纹，平铺 2x 当纹理
  logo  assets/logo/rf1.png —— 官方标题字（带蓝冰裂底纹）

产到 assets/title/rf1.jpg（960x325，与其余九作同规格）。
用法：python _build_rf1card.py [rom路径]
"""
import os, sys
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw

from _nds_nitro import extract, render

ROM = sys.argv[1] if len(sys.argv) > 1 else r"F:\符文工房1.nds"
ROOT = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(ROOT, "_rf1_card")
OUT = os.path.join(ROOT, "assets", "title", "rf1.jpg")
W, H = 960, 325

# 反复比对定下来的参数：取景 0.70（避开顶部横条）、模糊 4、花纹 0.35
# logo 竖直中心放在 0.42H：卡片是 cover 裁切（object-position: center 42%），
# 960x325 的图在卡上只看得到中间约 52% 那一条，logo 居中放会被切掉下缘。
BG_POS, BG_BLUR, PAT_ALPHA = 0.70, 3.5, 0.46
LOGO_SCALE, LOGO_CY = 1.55, 0.42


def cover(im, pos=0.5):
    s = max(W / im.width, H / im.height)
    i2 = im.resize((max(int(im.width * s) + 1, W), max(int(im.height * s) + 1, H)), Image.LANCZOS)
    x = (i2.width - W) // 2
    y = int((i2.height - H) * pos)
    return i2.crop((x, y, x + W, y + H))


def tile(im, scale=1):
    i2 = im.resize((im.width * scale, im.height * scale), Image.LANCZOS) if scale != 1 else im
    sh = Image.new("RGB", (W, H))
    for y in range(0, H, i2.height):
        for x in range(0, W, i2.width):
            sh.paste(i2, (x, y))
    return sh


def main():
    print("从 ROM 取素材:", ROM)
    got = extract(ROM, [
        "title_bgA.NCGR", "title_bgA01.NCLR", "title_bgA01.NSCR",
        "camp_bg02.NCGR", "camp_bg02.NCLR", "camp_bg02.NSCR",
    ], TMP)
    need = ("title_bgA.NCGR", "camp_bg02.NCGR")
    if any(n not in got for n in need):
        sys.exit("素材没取齐，停")

    sky = render(got["title_bgA.NCGR"], got["title_bgA01.NCLR"], got["title_bgA01.NSCR"])
    pat = render(got["camp_bg02.NCGR"], got["camp_bg02.NCLR"], got["camp_bg02.NSCR"])
    sky.save(os.path.join(TMP, "src_sky.png"))
    pat.save(os.path.join(TMP, "src_pattern.png"))

    b = cover(sky, BG_POS).filter(ImageFilter.GaussianBlur(BG_BLUR))
    b = Image.blend(b, tile(pat, 2), PAT_ALPHA)
    b = ImageEnhance.Color(b).enhance(1.12)
    b = ImageEnhance.Contrast(b).enhance(1.06)

    # 底部压暗，接住卡片下半部的作品色渐变
    grad = Image.new("L", (W, H))
    for y in range(H):
        grad.paste(Image.new("L", (W, 1), 255 - int(70 * max(0.0, (y - H * 0.62) / (H * 0.38)))), (0, y))
    b = Image.composite(b, ImageEnhance.Brightness(b).enhance(0.55), grad)

    logo = Image.open(os.path.join(ROOT, "assets", "logo", "rf1.png")).convert("RGBA")
    lw, lh = int(logo.width * LOGO_SCALE), int(logo.height * LOGO_SCALE)
    l = logo.resize((lw, lh), Image.LANCZOS)
    lx, ly = (W - lw) // 2, int(H * LOGO_CY - lh / 2)
    sh = Image.new("RGBA", b.size, (0, 0, 0, 0))
    sh.paste((10, 25, 45, 200), (lx - 2, ly + 4),
             l.split()[3].filter(ImageFilter.GaussianBlur(7)))
    out = Image.alpha_composite(b.convert("RGBA"), sh)
    out.paste(l, (lx, ly), l)

    out.convert("RGB").save(OUT, quality=90)
    print("出图", OUT, out.size, os.path.getsize(OUT) // 1024, "KB")


if __name__ == "__main__":
    main()
