# -*- coding: utf-8 -*-
"""统一生成 10 部作品的卡片横幅图（assets/title/<gid>.jpg）

站上卡片图区是 195x66（CSS 4.1rem 高），比例约 2.95:1。
每张源图按自身比例选择处理方式：
  cover      —— 全幅画面，直接按 2.95:1 居中裁切
  fill       —— 构图不能被切（带边框/圆形/竖构图），整体保留，两侧用同图模糊延伸
输出 960px 宽 JPEG（显示宽度只有 195px，够 2 倍屏）。
"""
import os
from PIL import Image, ImageFilter, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
WIKI = os.path.dirname(HERE)
OUT = os.path.join(WIKI, 'assets', 'title')
SRC_LOCAL = 'G:/10257/Desktop/符文工房/符文工房'
RATIO = 2.95
OUT_W = 960


def crop_ratio(im, ratio, wy=0.5):
    w, h = im.size
    if w / h > ratio:                      # 太宽 → 切两侧
        nw = int(round(h * ratio))
        x = int(round((w - nw) * 0.5))
        return im.crop((x, 0, x + nw, h))
    nh = int(round(w / ratio))             # 太高 → 切上下
    y = int(round((h - nh) * wy))
    return im.crop((0, y, w, y + nh))


def cover(im, wy=0.5):
    return crop_ratio(im, RATIO, wy)


def fill(im, bg_rgb=(18, 18, 20)):
    """整图保留（按高度铺满），两侧用左右边缘色延伸 + 轻模糊补齐"""
    im = im.convert('RGB')
    W, H = OUT_W, int(round(OUT_W / RATIO))
    fh = H
    fw = int(round(im.size[0] * H / im.size[1]))
    if fw > W:
        fw, fh = W, int(round(im.size[1] * W / im.size[0]))
    fg = im.resize((fw, fh), Image.LANCZOS)
    x0 = (W - fw) // 2

    base = Image.new('RGB', (W, H), bg_rgb)
    if x0 > 0:
        # 取边缘若干列，横向拉伸后铺在两侧（胶囊图两侧本来就是渐变纯色）
        sw = max(2, im.size[0] // 60)
        left = im.crop((0, 0, sw, im.size[1])).resize((x0, H), Image.BILINEAR)
        right = im.crop((im.size[0] - sw, 0, im.size[0], im.size[1])).resize(
            (W - x0 - fw, H), Image.BILINEAR)
        base.paste(left, (0, 0))
        base.paste(right, (x0 + fw, 0))
        base = base.filter(ImageFilter.GaussianBlur(9))
    base.paste(fg, (x0, (H - fh) // 2))
    return base


def diag_grad(w, h, c0, c1):
    """对角线渐变（用于把透明 logo 贴成横幅底）。"""
    a = tuple(int(c0.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
    b = tuple(int(c1.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
    im = Image.new('RGB', (w, h))
    px = im.load()
    for y in range(h):
        for x in range(0, w, 4):
            t = x / max(1, w - 1) * 0.5 + y / max(1, h - 1) * 0.5
            c = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
            for k in range(4):
                if x + k < w:
                    px[x + k, y] = c
    return im


def emit(im, gid, wy=0.5, mode='cover'):
    im = cover(im, wy) if mode == 'cover' else fill(im)
    im = im.convert('RGB')
    if im.size[0] != OUT_W:
        im = im.resize((OUT_W, int(round(OUT_W / RATIO))), Image.LANCZOS)
    p = os.path.join(OUT, gid + '.jpg')
    im.save(p, quality=88, optimize=True, progressive=True)
    return p, im.size


def build():
    os.makedirs(OUT, exist_ok=True)
    made = []

    # RF1：DeSmuME 实机标题（蓝天+蓝飞龙+金字全幅），按 2.95:1 裁横带后轻锐化。
    # 不用桌面单层 NCGR.BMP —— 那批是单层渲染，裁切+放大后出横条纹/劈开龙翼。
    im = Image.open(os.path.join(SRC, 'rf1_desmume_title.png')).convert('RGB')
    im = cover(im, 0.45).resize((OUT_W, int(round(OUT_W / RATIO))), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=3))
    p = os.path.join(OUT, 'rf1.jpg')
    im.convert('RGB').save(p, quality=90, optimize=True, progressive=True)
    made.append((p, im.size))

    # RF2：ROM 原生透明 logo（龙形纹章 Rune Factory 2）贴蓝色渐变，与卡片蓝调一致。
    # NDS 标题屏是 4:3，直接裁 2.95:1 会把龙翼上下劈断，所以走「logo + 渐变底」。
    THE_H = int(round(OUT_W / RATIO))
    bg = diag_grad(OUT_W, THE_H, '#2f6f93', '#86bcd8').convert('RGBA')
    glow = Image.new('L', bg.size, 0)
    gw, gh = bg.size
    ImageDraw.Draw(glow).ellipse([gw * 0.16, -gh * 0.4, gw * 0.84, gh * 1.4], fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    wl = Image.new('RGBA', bg.size, (255, 255, 255, 255))
    wl.putalpha(glow)
    bg.alpha_composite(wl)
    lg = Image.open(os.path.join(WIKI, 'assets', 'logo', 'rf2.png')).convert('RGBA')
    tw = int(gw * 0.70)
    th = int(round(lg.size[1] * tw / lg.size[0]))
    if th > gh * 0.9:
        th = int(gh * 0.9)
        tw = int(round(lg.size[0] * th / lg.size[1]))
    lg = lg.resize((tw, th), Image.LANCZOS)
    bg.alpha_composite(lg, ((gw - tw) // 2, (gh - th) // 2))
    p = os.path.join(OUT, 'rf2.jpg')
    bg.convert('RGB').save(p, quality=90, optimize=True, progressive=True)
    made.append((p, bg.size))

    # RFF：官网标题天空底（右侧有画框，先切掉）+ 官方透明 logo
    sky = Image.open(os.path.join(SRC, 'rff_swf_01.jpg')).convert('RGB').crop((0, 0, 500, 523))
    logo = Image.open(os.path.join(WIKI, 'assets', 'logo', 'rff.png')).convert('RGBA')
    canvas = cover(sky, 0.5).convert('RGBA')
    cw, ch = canvas.size
    lw = int(cw * 0.54)
    lg = logo.resize((lw, int(round(logo.size[1] * lw / logo.size[0]))), Image.LANCZOS)
    canvas.paste(lg, ((cw - lg.size[0]) // 2, (ch - lg.size[1]) // 2), lg)
    made.append(emit(canvas.convert('RGB'), 'rff'))

    # RFO：PS3 标题背景（已去汉化组水印），圆形构图 → 不切，模糊延伸
    im = Image.open(os.path.join(SRC, 'rfo_title_clean.png')).convert('RGBA')
    bg = Image.new('RGBA', im.size, (26, 40, 62, 255))
    bg.alpha_composite(im)
    made.append(emit(bg.convert('RGB'), 'rfo', 0.45))

    # RF3：官网场景画（大树村全景）
    im = Image.open(os.path.join(SRC, 'rf3_jp_top_bg1.jpg')).convert('RGB')
    made.append(emit(im, 'rf3', 0.45))

    # RF4：biligame 官方背景画（浮空船）
    im = Image.open(os.path.join(SRC, 'rf4w_1.jpg')).convert('RGB')
    made.append(emit(im, 'rf4', 0.35))

    # RF3SP / RF4SP / RF5：Steam 官方 capsule（含 logo，构图不能切）
    for gid in ('rf3sp', 'rf4sp', 'rf5'):
        im = Image.open(os.path.join(SRC, gid + '_capsule_616x353.jpg')).convert('RGB')
        made.append(emit(im, gid, mode='fill'))

    # 龙之天地：Steam 官方 hero（3.1:1，几乎不用裁）
    im = Image.open(os.path.join(SRC, 'azuma_library_hero.jpg')).convert('RGB')
    made.append(emit(im, 'azuma', 0.5))

    for p, size in made:
        print('%-12s %s  %4d KB' % (os.path.basename(p), size,
                                    os.path.getsize(p) // 1024))
    print('total %d KB' % (sum(os.path.getsize(p) for p, _ in made) // 1024))
    return made


def preview(made):
    """按卡片真实显示尺寸的 2 倍出对照图"""
    box = (394, 134)
    cols, pad, lab = 2, 10, 18
    rows = (len(made) + cols - 1) // cols
    W = cols * box[0] + (cols + 1) * pad
    H = rows * (box[1] + lab + pad) + pad
    cv = Image.new('RGB', (W, H), (245, 245, 247))
    d = ImageDraw.Draw(cv)
    for i, (p, _) in enumerate(made):
        r, c = divmod(i, cols)
        x = pad + c * (box[0] + pad)
        y = pad + r * (box[1] + lab + pad)
        d.text((x, y), os.path.basename(p), fill=(20, 20, 20))
        im = Image.open(p).convert('RGB')
        sw, sh = im.size
        s = max(box[0] / sw, box[1] / sh)
        im2 = im.resize((int(sw * s + .5), int(sh * s + .5)), Image.LANCZOS)
        left = (im2.size[0] - box[0]) // 2
        top = (im2.size[1] - box[1]) // 2
        cv.paste(im2.crop((left, top, left + box[0], top + box[1])), (x, y + lab))
    out = os.path.join(HERE, '_cards_preview.png')
    cv.save(out)
    print('preview ->', out)


if __name__ == '__main__':
    preview(build())
