# -*- coding: utf-8 -*-
"""符文工房2 作品卡配图：直接从 NDS ROM 里取标题画面来合成。

源：F:\\2\\符文工房2.nds  ->  /res/obj/rune2_titleA01.{NCGR,NCLR,NSCR}
这是游戏真正的标题画面（彩虹渐变底 + 金色龙形纹章 + Rune Factory 2 logo +
日文副标题 + 中文"符文工厂"），比原来那张白底 logo 图更有画面感。

NDS 原图只有 256x256，卡片又只需要中间一条横带，所以做法是：
  1. 用源图左边缘（logo 从 x=10 才开始，左边 3px 是纯背景）按行取色，
     铺成一张"纯背景渐变图"；
  2. 背景和 logo 块按**同一个缩放比**放大——否则两者行号对不上，
     底图在 logo 块的位置显示的是源图别的行，接缝会非常明显；
  3. logo 块先用边缘行列复制加一圈留白，再高斯羽化，这样被吃掉的
     是留白而不是 "Rune Factory" 的字。

用法：python _build_rf2card.py            # 需先有 _title_src/src/rf2_titleA01.png
      python _build_rf2card.py --rom <路径>  # 直接从 ROM 解出源图
"""
import os
import sys
from PIL import Image, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "_title_src", "src", "rf2_titleA01.png")
OUT = os.path.join(ROOT, "assets", "title", "rf2.jpg")

# 卡片画布与"真正看得见的那条带"（实测：图框 284x66，cover + object-position 50% 42%）
W, H = 960, 325
VY0, VY1 = 43, 266

# logo 块在源图里的纵向范围（y=6..158）：上面是天空，下面 y192 起是汉化组水印，都避开
BY0, BY1 = 6, 158

# 定下来的参数：块高 285（含留白），留白 26、羽化 18
LOGO_H, PAD, FEATHER = 285, 26, 18
SAT, CON = 1.12, 1.05

# 源图本身就是奶油浅底，直接铺开会发白发灰，而且和卡片下半部的主题蓝接不上。
# 所以两侧用卡片主题蓝（#86bcd8 -> #2f6f93）罩染 72%，中间 logo 区留暖调，
# 过渡用 logo 遮罩高斯模糊 60px 做出来——金 logo 不被压暗，画面又有层次。
TINT_TOP, TINT_BOT = (158, 198, 226), (36, 94, 138)
TINT_AMT, TINT_SOFT = 0.72, 60


def load_src(rom=None):
    if rom:
        sys.path.insert(0, ROOT)
        from _nds_nitro import extract, render
        g = extract(rom, ["rune2_titleA01.NCGR", "rune2_titleA01.NCLR",
                          "rune2_titleA01.NSCR"],
                    os.path.join(ROOT, "_title_src", "src"))
        im = render(g["rune2_titleA01.NCGR"], g["rune2_titleA01.NCLR"],
                    g["rune2_titleA01.NSCR"], 256, 256)
        im.save(SRC)
        print("从 ROM 解出源图 ->", SRC)
        return im
    return Image.open(SRC).convert("RGB")


def grad_img(s):
    """按行取左边缘颜色，铺成纯背景渐变图（与源图同尺寸）"""
    strip = s.crop((0, 0, 3, s.height)).resize((1, s.height), Image.BOX)
    return strip.resize((s.width, s.height), Image.NEAREST)


def pad_edge(im, px):
    """四周各补 px 像素，用边缘行列复制填充"""
    w, h = im.size
    o = Image.new("RGB", (w + 2 * px, h + 2 * px))
    o.paste(im, (px, px))
    for i in range(px):
        o.paste(im.crop((0, 0, 1, h)).resize((1, h)), (i, px))
        o.paste(im.crop((w - 1, 0, w, h)).resize((1, h)), (w + px + i, px))
        o.paste(im.crop((0, 0, w, 1)).resize((w, 1)), (px, i))
        o.paste(im.crop((0, h - 1, w, h)).resize((w, 1)), (px, px + h + i))
    for i in range(px):
        for j in range(px):                      # 四个角
            o.putpixel((i, j), im.getpixel((0, 0)))
            o.putpixel((w + px + i, j), im.getpixel((w - 1, 0)))
            o.putpixel((i, px + h + j), im.getpixel((0, h - 1)))
            o.putpixel((w + px + i, px + h + j), im.getpixel((w - 1, h - 1)))
    return o


def build(src):
    blk0 = pad_edge(src.crop((0, BY0, src.width, BY1)), PAD)
    s = LOGO_H / blk0.height                     # 背景与 logo 块共用这个缩放比

    bg = grad_img(src).resize((W, max(int(src.height * s) + 1, H)), Image.LANCZOS)
    blk = blk0.resize((int(blk0.width * s), LOGO_H), Image.LANCZOS)

    bx = (W - blk.width) // 2
    by = int((VY0 + VY1) / 2 - LOGO_H / 2)
    top = by - int((BY0 - PAD) * s)              # 让 bg 的行号与 blk 对齐

    cv = Image.new("RGB", (W, H))
    cv.paste(bg, (0, top))
    layer = cv.copy()
    layer.paste(blk, (bx, by))

    m = Image.new("L", blk.size, 255).filter(ImageFilter.GaussianBlur(FEATHER))
    mask = Image.new("L", (W, H), 0)
    mask.paste(m, (bx, by))
    out = Image.composite(layer, cv, mask)

    out = ImageEnhance.Color(out).enhance(SAT)
    out = ImageEnhance.Contrast(out).enhance(CON)
    # ROM 源图只有 256 宽，放大 3.7 倍后金 logo 和龙纹发糊，补一刀锐化
    out = out.filter(ImageFilter.UnsharpMask(radius=2, percent=85, threshold=3))

    # 两侧罩卡片主题蓝，中间给 logo 留暖调
    tint = Image.new("RGB", (1, H))
    for y in range(H):
        t = y / (H - 1)
        tint.putpixel((0, y), tuple(int(TINT_TOP[i] + (TINT_BOT[i] - TINT_TOP[i]) * t) for i in range(3)))
    tint = tint.resize((W, H), Image.NEAREST)
    soft = mask.filter(ImageFilter.GaussianBlur(TINT_SOFT)).point(lambda v: 255 - v)
    out = Image.composite(Image.blend(out, tint, TINT_AMT), out, soft)

    # 下半部压暗，给卡片上的文字留底
    grad = Image.new("L", (W, H))
    for y in range(H):
        grad.paste(Image.new("L", (W, 1), 255 - int(70 * max(0, (y - H * 0.62) / (H * 0.38)))), (0, y))
    out = Image.composite(out, ImageEnhance.Brightness(out).enhance(0.6), grad)
    return out


if __name__ == "__main__":
    rom = None
    for i, a in enumerate(sys.argv):
        if a == "--rom" and i + 1 < len(sys.argv):
            rom = sys.argv[i + 1]
    src = load_src(rom)
    print("源图", src.size)
    out = build(src)
    out.save(OUT, quality=92)
    print("写出", OUT, "%dx%d  %.0f KB" % (out.width, out.height, os.path.getsize(OUT) / 1024))
