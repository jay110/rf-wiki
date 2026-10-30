# -*- coding: utf-8 -*-
"""统一生成 10 部作品的卡片横幅图（assets/title/<gid>.jpg|png）

站上卡片图区是 284x96 CSS（.wcard-fig 的 6rem 高），比例 2.96:1，
与输出图 960x325（2.95:1）基本同比例，所以 cover 几乎不裁。
每张源图按自身比例选择处理方式：
  cover      —— 全幅画面，直接按 2.95:1 居中裁切
  fill       —— 构图不能被切（带边框/圆形/竖构图），整体保留，两侧用同图模糊延伸
  native     —— rf1/rf2 专用：ROM 原生 256x192 原样输出（无损 PNG，零修图）
输出 960px 宽 JPEG（显示宽度只有 284px，够 3 倍屏）；rf1/rf2 例外，是 256x192 PNG。
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


def rf1_native():
    """RF1 横幅：直接用 ROM 原生 256x192 无损图，零修图。

    卡片图框的演进：
      v1 284x66（4.30:1）—— 与 960x325 的图同比例，但 4:3 的原生图在这框里按宽
         cover 后只露 59.5px 原生高，标题块 86px 必然被切，当时只能缩图 + 造侧边。
      v2 284x96（2.96:1）—— 可见原生高 86.5px，刚好装下标题块（86px，贴边）。
      v3 284x160（16:9，`.wcard-fig.is-tall`）—— 可见原生高 144px，标题块上下
         各留约 29px 金色底板，不再贴边；同时与同排的符文2（同走 is-tall）等高。

    可见带定位：标题块 RuneFactory 顶 y=62 → 「— 新牧場物語 —」底 y=147，
      中心 104.5；144px 窗口的中心要对齐 104.5 → 窗口 y=33..177，
      换算 object-position = 33/(213-160)×(284/256) ≈ 69%。用 center 69%。

    源图 src/rf1_native_256x192.png 的来历：
      从 ROM 图层合成结果（金色花纹底板 + 金字 + 假名 + 副标）里按 256x192 原尺寸
      裁出，未做任何缩放、插值、拼接、补边。是纯原生的屏幕像素。
    """
    src = Image.open(os.path.join(SRC, 'rf1_native_256x192.png')).convert('RGB')
    if src.size != (256, 192):
        raise SystemExit('rf1 原生图尺寸不对：%s（应为 256x192）' % (src.size,))
    p = os.path.join(OUT, 'rf1.png')
    src.save(p, optimize=True)          # 无损 PNG，不重采样
    return p


def rf2_native():
    """RF2 横幅：ROM 原生 256x192 无损图，零修图（做法同 rf1）。

    源图 src/rf2_native_256x192.png 的来历：
      从日版 ROM「符文工房123.rar」里的 符文工房2.nds 解出
      /res/obj/rune2_titleA01.{NCGR,NCLR,NSCR}，用 _nds_nitro.render() 渲染成
      256x256 后裁掉下半留白得到 256x192。未做任何缩放、插值、拼接、补边。

      为什么换掉旧图：旧 rf2.jpg 是从旧汉化版 ROM 解出的图（底部有「家在矿石镇
      汉化组汉化」水印、副标被改成了金色「符文工厂」），再叠蓝色渐变合成；
      日版原生图这两样都没有，是干净的官方画面。

    与 rf1 的差别：rf2 的 logo 块更高（龙翼尖 y=0 → 底部装饰三角 y=134，共 134px），
      在 86.5px 的可见带里放不下。解法不是修图，而是把这张卡的图框加高：
      卡上加 .wcard-fig.is-tall（aspect-ratio 16/9），284 宽时高 160px，按宽 cover
      可见原生高 160/(284/256) = 144px > 134px，整个 logo 块一次装下，
      只让出最底部 48px 的云/地插画（纯背景，不承载信息）。
      16:9 是比例而非固定高度，任何列宽下可见原生高恒为 144px，手机上也不会反过来切字。
    """
    src = Image.open(os.path.join(SRC, 'rf2_native_256x192.png')).convert('RGB')
    if src.size != (256, 192):
        raise SystemExit('rf2 原生图尺寸不对：%s（应为 256x192）' % (src.size,))
    p = os.path.join(OUT, 'rf2.png')
    src.save(p, optimize=True)          # 无损 PNG，不重采样
    return p


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

    # RF1：ROM 原生 256x192 无损图，零修图（不拼接、不补边、不缩放、不插值）。
    # 卡片图框已改为 284x96（2.96:1），与 960x325 同比例；在这个框里原生 4:3 的
    # 可见高度 86.5px 刚好装下标题块 86px（RuneFactory 62 → 新牧場物語 147）。
    p = rf1_native()
    made.append((p, Image.open(p).size))

    # RF2：ROM 原生 256x192 无损图，零修图（同 rf1）。
    # 旧做法是「透明 logo + 蓝色渐变底」，既有汉化组水印又被改过副标，已弃用。
    p = rf2_native()
    made.append((p, Image.open(p).size))

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
