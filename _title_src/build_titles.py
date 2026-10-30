# -*- coding: utf-8 -*-
"""统一生成作品卡片横幅图（assets/title/）

卡片图区有两种高度：
  · 默认 .wcard-fig —— 284x96 CSS（6rem），比例 2.96:1 → 图 960x325
  · .wcard-fig.is-tall —— aspect-ratio 16:9（284x160）→ 图 960x540
每张源图按自身比例选择处理方式：
  cover      —— 全幅画面，直接居中裁切到目标比例
  fill       —— 构图不能被切（带边框/圆形/竖构图），整体保留，两侧用同图模糊延伸
  native     —— rf1/rf2/rf3/rfo 专用：游戏自己的标题画面原样输出（无损 PNG，零修图）
  wpair      —— RF4+RF4SP、RF5+龙之天地：两部一张卡，上下各一条 16:9（960x540）
输出宽度统一 960px（显示宽度只有 284px，够 3 倍屏）。
"""
import os
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
WIKI = os.path.dirname(HERE)
OUT = os.path.join(WIKI, 'assets', 'title')
SRC_LOCAL = 'G:/10257/Desktop/符文工房/符文工房'
RATIO = 2.95
OUT_W = 960
TALL = 16 / 9          # .wcard-fig.is-tall 的比例，输出 960x540


def crop_ratio(im, ratio, wy=0.5):
    w, h = im.size
    if w / h > ratio:                      # 太宽 → 切两侧
        nw = int(round(h * ratio))
        x = int(round((w - nw) * 0.5))
        return im.crop((x, 0, x + nw, h))
    nh = int(round(w / ratio))             # 太高 → 切上下
    y = int(round((h - nh) * wy))
    return im.crop((0, y, w, y + nh))


def cover(im, wy=0.5, ratio=None):
    return crop_ratio(im, ratio or RATIO, wy)


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


def rf3_native():
    """RF3 横幅：ROM 原生 256x192 无损图，零修图（做法同 rf1/rf2）。

    源图 src/rf3_native_256x192.png 的来历：
      本机 NDS 提取目录 G:/10257/Desktop/符文工房/符文工房/3/rf3Archive-8027.NCGR.BMP
      —— 从 符文工房3.nds 的 /res/obj/rf3Archive.arc 里解出的第 8027 号 NCGR
      （8bpp 调色板，256x192，即 NDS 上屏原生分辨率）。
      本脚本做的是「P 模式调色板图 → RGB → PNG」，像素值一一对应，无任何重采样。

      为什么换掉旧的 rf3.jpg：那张是 marv.jp 官网的大树村场景画，画面里只有树、
      没有 logo，卡片上根本认不出是哪一作。这张是游戏自己的标题屏：蓝天、发光树、
      金色 RuneFactory 3 加假名 ルーンファクトリー，是唯一「零修图又带 logo」的选择。

    可见带：logo 的暖色像素集中在 y=58..112（中心 85）。
      三列布局（.is-tall-lg → 16:9，可见 144px）配 object-position: center 35%
      → 可见 y≈17..161，logo 上下留白约 42/48，基本居中；
      双列布局（96px，可见 86.5px）→ 可见 y≈37..124，假名底 112 下方仍有 12px 余量，
      不会贴边。同一个 35% 在两档下都安全，所以只设一个 pos。
    """
    src = Image.open(os.path.join(SRC, 'rf3_native_256x192.png')).convert('RGB')
    if src.size != (256, 192):
        raise SystemExit('rf3 原生图尺寸不对：%s（应为 256x192）' % (src.size,))
    p = os.path.join(OUT, 'rf3.png')
    src.save(p, optimize=True)          # 无损 PNG，不重采样
    return p


def rff_tall():
    """RFF（边境）：官网标题天空底（右侧有画框，先切掉）+ 官方透明 logo，16:9。

    卡上走 .wcard-fig.is-tall：双列时它的同行是 RFO（16:9 原生标题屏），
    三列时同一行是 RF3SP（同走 16:9）与 RFO，三张等高才不会出现空色块。
    天空源图 500x523 是竖构图，16:9 下按宽铺满后保留 540/1004 ≈ 54% 的高度
    （旧的 2.96:1 版只保留 36%，天空反而被压掉更多）。
    """
    sky = Image.open(os.path.join(SRC, 'rff_swf_01.jpg')).convert('RGB').crop((0, 0, 500, 523))
    logo = Image.open(os.path.join(WIKI, 'assets', 'logo', 'rff.png')).convert('RGBA')
    canvas = cover(sky, 0.5, TALL).convert('RGBA')
    cw, ch = canvas.size
    lw = int(cw * 0.54)
    lg = logo.resize((lw, int(round(logo.size[1] * lw / logo.size[0]))), Image.LANCZOS)
    canvas.paste(lg, ((cw - lg.size[0]) // 2, (ch - lg.size[1]) // 2), lg)
    return emit_tall(canvas.convert('RGB'), 'rff')


def rf3sp_tall():
    """RF3SP：Steam 官方 capsule 616x353（1.745:1）→ 16:9，纵向只切 10px。

    加高只为对齐：三列布局里它和 RFF、RFO 同一行；双列布局里它和 RF3 同一行，
    而 RF3 是 is-tall-lg（≥560px 才变高），所以 RF3SP 也用 is-tall-lg，两者同进退。
    """
    im = Image.open(os.path.join(SRC, 'rf3sp_capsule_616x353.jpg')).convert('RGB')
    return emit_tall(im, 'rf3sp', 0.5)


def rfo_native():
    """RFO（海洋）横幅：PS3 标题画面的原生三层合成，1280x720 原样输出。

    源图 src/rfo_title_1280x720.png 的来历（PS3 版贴图 PSD 里的三层，各自取底图图层、
    关掉汉化组后来加的水印层/图标层，再按游戏自己的叠放次序与位置合一次）：

      1. 02207_LUGTITLE_00_960x720_RGBA8 → 标题底图（岛 + 海，圆形构图）
         图层 1，去掉「家在矿石镇汉化组」文字层与 icon_white_64 图标层
      2. 02896_LUGTITLE_01_1280x720_CI8  → 藤蔓前景框（圆形遮罩）
         图层 1，去掉左上角「…汉化ROM免费…」文字层
      3. 02202_LLGTITLEJP_568x400_RGBA8  → 原版日文 logo
         「原版PS3贴图」层（含 ルーンファクトリー／オーシャンズ 假名行）

    合成路径（全为 1:1 放置，无缩放、无插值、无补边）：
      底图 → 水平居中 (1280-960)/2 = 160, y=0
      藤蔓 → (0,0)，压在底图上（游戏里也是前景遮罩）
      logo → 水平居中 (1280-568)/2 = 356，y=150（圆形画框垂直居中）

    尺寸说明：PS3 标题画面原生 1280x720 = 16:9，与 .wcard-fig.is-tall 完全同比例，
      所以卡上是整屏零裁切显示（不是裁出来的构图）。这也顺带解决了旧图的问题：
      旧 rfo.jpg 是把 960x720 的圆形构图硬裁成 2.96:1，圆的左右被切。

    留白：藤蔓框那一层是 CI8 调色板贴图、不带 alpha，本身就是「白底 + 一圈叶子」，
      所以圆形画框外面那圈白是游戏自己的底色，不是我们填的——原样保留，不填色、
      不模糊、不拉伸。输出 JPEG q92（1280x720 平滑插画，PNG 要 776KB，JPEG 190KB）。
    """
    src = Image.open(os.path.join(SRC, 'rfo_title_1280x720.png')).convert('RGBA')
    if src.size != (1280, 720):
        raise SystemExit('rfo 标题图尺寸不对：%s（应为 1280x720）' % (src.size,))
    flat = Image.new('RGBA', src.size, (255, 255, 255, 255))
    flat.alpha_composite(src)
    p = os.path.join(OUT, 'rfo.jpg')
    flat.convert('RGB').save(p, quality=92, optimize=True, progressive=True)
    return p


# ---- 双作合并卡（RF4+RF4SP、RF5+龙之天地）----
# 这两组四张官方图都是 960x325（2.95:1）。单独成卡时塞进 16:9 的框要切掉三成高度，
# 留在 2.96:1 的矮框里又和同排的 16:9 卡对不齐；两两并成一张 16:9 后，每条都零裁切，
# 作品卡总数也从 10 降到 8（两列布局正好 4 行，不再出现落单的一张）。
PAIR_H = 540                  # 960x540 = 16:9，与 .wcard-fig.is-tall 完全同比例
PAIR_BAND = PAIR_H // 2       # 上下各一条，270px
PAIR_CLEAN = {'rf4sp': (192, 766), 'rf5': (192, 766)}


def _fit296(im, wy=0.5, mode='cover'):
    """先在内存里做出与旧版单卡完全相同的 960x325 成品，供拼接复用。"""
    im = cover(im, wy, RATIO) if mode == 'cover' else fill(im)
    im = im.convert('RGB')
    w, h = OUT_W, int(round(OUT_W / RATIO))
    return im if im.size == (w, h) else im.resize((w, h), Image.LANCZOS)


def _band(gid, im296):
    """把一张 960x325 压成 960x270 的一条。
    · 有清晰区的（rf4sp / rf5 两侧是官方做的模糊延伸）→ 只取清晰区等比缩到条高，
      两侧用同一块清晰区重度模糊 + 压暗补齐，清晰区一点不切。
    · 全幅画（rf4 云海 / 龙之天地）→ 按宽铺满，上下居中各切 27px。"""
    W = OUT_W
    if gid in PAIR_CLEAN:
        x0, x1 = PAIR_CLEAN[gid]
        sq = im296.crop((x0, 0, x1, im296.size[1]))
        s = sq.resize((int(round(sq.size[0] * PAIR_BAND / sq.size[1])), PAIR_BAND), Image.LANCZOS)
        base = sq.resize((W, PAIR_BAND), Image.LANCZOS).filter(ImageFilter.GaussianBlur(24))
        base = ImageEnhance.Brightness(base).enhance(0.9)
        base.paste(s, ((W - s.size[0]) // 2, 0))
        return base
    s = im296.resize((W, int(round(im296.size[1] * W / im296.size[0]))), Image.LANCZOS)
    y = (s.size[1] - PAIR_BAND) // 2
    return s.crop((0, y, W, y + PAIR_BAND))


def wpair(name, gid_a, im_a, gid_b, im_b):
    """上下两条拼成 960x540。im_a / im_b 传 _fit296 的产物，也就是旧单卡的画面。"""
    c = Image.new('RGB', (OUT_W, PAIR_H))
    c.paste(_band(gid_a, im_a), (0, 0))
    c.paste(_band(gid_b, im_b), (0, PAIR_BAND))
    p = os.path.join(OUT, name + '.jpg')
    c.save(p, quality=88, subsampling=2, optimize=True, progressive=True)
    return p, c.size


def emit(im, gid, wy=0.5, mode='cover', ratio=None):
    r = ratio or RATIO
    im = cover(im, wy, r) if mode == 'cover' else fill(im)
    im = im.convert('RGB')
    if im.size[0] != OUT_W:
        im = im.resize((OUT_W, int(round(OUT_W / r))), Image.LANCZOS)
    p = os.path.join(OUT, gid + '.jpg')
    im.save(p, quality=88, optimize=True, progressive=True)
    return p, im.size


def emit_tall(im, gid, wy=0.35):
    """16:9（960x540）版，供 .wcard-fig.is-tall 的卡用。"""
    return emit(im, gid, wy, 'cover', TALL)


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

    # RFF：官网标题天空底 + 官方透明 logo（卡上走 is-tall，与同排 RFO 等高）
    made.append(rff_tall())

    # RFO：PS3 标题画面原生三层合成，1280x720 原样输出（零裁切、零修图）
    p = rfo_native()
    made.append((p, Image.open(p).size))

    # RF3：ROM 原生 256x192 标题屏，零修图（同 rf1/rf2）。
    # 旧图是 marv.jp 的大树村场景画，只有树没有 logo，卡上认不出是哪一作。
    p = rf3_native()
    made.append((p, Image.open(p).size))

    # RF3SP：Steam 官方 capsule 616x353（1.745:1）→ 16:9，几乎零裁切
    made.append(rf3sp_tall())

    # RF4 + RF4SP：并成一张 16:9 双作卡（上条浮空船、下条双子 + SPECIAL 字标）
    rf4 = _fit296(Image.open(os.path.join(SRC, 'rf4w_1.jpg')).convert('RGB'), 0.35)
    rf4sp = _fit296(Image.open(os.path.join(SRC, 'rf4sp_capsule_616x353.jpg')).convert('RGB'),
                    mode='fill')
    made.append(wpair('pair-rf4', 'rf4', rf4, 'rf4sp', rf4sp))

    # RF5 + 龙之天地：并成一张 16:9 双作卡（上条 RF5 群像、下条龙之天地主视觉）
    rf5 = _fit296(Image.open(os.path.join(SRC, 'rf5_capsule_616x353.jpg')).convert('RGB'),
                  mode='fill')
    azuma = _fit296(Image.open(os.path.join(SRC, 'azuma_library_hero.jpg')).convert('RGB'), 0.5)
    made.append(wpair('pair-rf5', 'rf5', rf5, 'azuma', azuma))

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
