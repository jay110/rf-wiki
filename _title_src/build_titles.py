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
    """RF3 的 ROM 原生 256x192 标题屏（不单独出卡，只作为 pair-rf3 的上条源）。

    源图 src/rf3_native_256x192.png 的来历：
      本机 NDS 提取目录 G:/10257/Desktop/符文工房/符文工房/3/rf3Archive-8027.NCGR.BMP
      —— 从 符文工房3.nds 的 /res/obj/rf3Archive.arc 里解出的第 8027 号 NCGR
      （8bpp 调色板，256x192，即 NDS 上屏原生分辨率）。
      本脚本做的是「P 模式调色板图 → RGB → PNG」，像素值一一对应，无任何重采样。

    画面：蓝天雪花 + 发光大树 + 金色 RuneFactory 3 + 假名 ルーンファクトリー3，
    logo 的暖色像素集中在 y=58..112（中心 85）。

    2026-10-30 起 RF3 与 RF3SP 并成一张双作卡，这张图不再单独出 assets/title/rf3.png，
    改由 pair_rf3() 取来做上条（放大到 960 宽后纵向裁剪，让 logo 落在条带正中）。
    """
    src = Image.open(os.path.join(SRC, 'rf3_native_256x192.png')).convert('RGB')
    if src.size != (256, 192):
        raise SystemExit('rf3 原生图尺寸不对：%s（应为 256x192）' % (src.size,))
    return src


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


def rf3sp_src():
    """RF3SP 的 Steam 官方 capsule 616x353（不单独出卡，只作为 pair-rf3 的下条源）。

    2026-10-30 起 RF3SP 与 RF3 并成一张双作卡，这张图不再单独出 assets/title/rf3sp.jpg。
    """
    return Image.open(os.path.join(SRC, 'rf3sp_capsule_616x353.jpg')).convert('RGB')


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


# ---- 双作合并卡（RF3+RF3SP、RF4+RF4SP）----
# 「本作 + 它的强化版」各并成一张 16:9：上下各一条，卡上图区一眼能看出是同一作的两个版本，
# 作品卡总数也从 10 降到 8（三列 3/3/2、两列正好 4 行，不再出现落单的一张）。
PAIR_H = 540                  # 960x540 = 16:9，与 .wcard-fig.is-tall 完全同比例
PAIR_BAND = PAIR_H // 2       # 上下各一条，270px


def _band_cover(im, posy=0.5):
    """任意比例的源图 → 按宽铺满 960，纵向按 posy 取 PAIR_BAND 高（会裁上下）。
    posy=0 取最上、1 取最下；比条带还矮的图居中留白（不会拉伸变形）。

    为什么每条都满宽铺满、而不是「中间实图 + 两侧模糊延伸」：条带比例是 3.56:1，
    4:3 的 RF3 若按高缩只占 360px 宽，1.75:1 的 RF3SP 占 471px，两者宽度差 111px，
    上下叠在卡上像贴了两张不齐的画框；满宽后接缝只是一条直线，更像一张完整的双作横幅。
    代价是每条都要裁掉约一半高度，所以每条单独标 posy，把最该露的部分框进来。"""
    s = im.resize((OUT_W, int(round(im.size[1] * OUT_W / im.size[0]))), Image.LANCZOS)
    if s.size[1] <= PAIR_BAND:
        c = Image.new('RGB', (OUT_W, PAIR_BAND), (255, 255, 255))
        c.paste(s, (0, (PAIR_BAND - s.size[1]) // 2))
        return c
    y = int(round((s.size[1] - PAIR_BAND) * posy))
    return s.crop((0, y, OUT_W, y + PAIR_BAND))


def wpair(name, im_a, posy_a, im_b, posy_b):
    """上下两条满宽拼成 960x540。参数是原始源图和各自的纵向取景比例。"""
    c = Image.new('RGB', (OUT_W, PAIR_H))
    c.paste(_band_cover(im_a, posy_a), (0, 0))
    c.paste(_band_cover(im_b, posy_b), (0, PAIR_BAND))
    p = os.path.join(OUT, name + '.jpg')
    c.save(p, quality=88, subsampling=2, optimize=True, progressive=True)
    return p, c.size


def pair_rf3():
    """RF3 + RF3SP → 一张 960x540 双作卡（上条本作标题屏、下条特别版主视觉）。

    上条 RF3：256x192 放大到 960x720（3.75 倍）后取中间 270。
      logo 暖色区在源 y=58..112（中心 85），缩放后中心落在 318.75，
      要让它在 270 高的条带里居中 → 裁剪起点 183.75 / 可裁范围 450 = 0.408。
    下条 RF3SP：616x353 放大到 960x550 后取 270。源图角色头在上、logo 在下，
      posy=0.22（源 y≈40..213）同时保住头顶与「RuneFactory 3 SPECIAL」两行字。
    """
    return wpair('pair-rf3', rf3_native(), 0.408, rf3sp_src(), 0.22)


def pair_rf4():
    """RF4 + RF4SP → 一张 960x540 双作卡（上条浮空船、下条豪华版标题 logo）。

    上条 RF4：官方背景画 756x425 铺满 960（539 高）后居中取 270，浮空船整体在位。
    下条 RF4SP：**豪华版（PC 版）OP 视频第 675 帧**——官方 720p 的金色
      「RuneFactory 4 SPECIAL」字标 + 绿龙 + 粉花，紫蓝天白云底，无水印无字幕。
      1280x720 铺满 960（540 高）后 posy=0.49 取 270，logo 上下各留约 55px。
      为什么不用 Steam capsule 的角色特写：那张图脸与 logo 分居上下两端，270 高的条
      装不下两者，只能二选一；OP 这一帧本身就是「一整个标题画面」，横条一裁正好是字标。
    """
    return wpair('pair-rf4',
                 Image.open(os.path.join(SRC, 'rf4w_1.jpg')).convert('RGB'), 0.5,
                 Image.open(os.path.join(SRC, 'rf4sp_op_logo_1280x720.png')).convert('RGB'), 0.45)


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

    # RF3 + RF3SP：并成一张 16:9 双作卡（上条本作标题屏、下条特别版主视觉）
    made.append(pair_rf3())

    # RF4 + RF4SP：并成一张 16:9 双作卡（上条浮空船、下条双子特写）
    made.append(pair_rf4())

    # RF5：Steam 官方 capsule 616x353（1.745:1）→ 16:9，纵向只切 3px
    im = Image.open(os.path.join(SRC, 'rf5_capsule_616x353.jpg')).convert('RGB')
    made.append(emit_tall(im, 'rf5', 0.5))

    # 龙之天地：Steam 官方 library hero 1920x620（3.1:1）→ 16:9 居中切掉左右各 21%
    im = Image.open(os.path.join(SRC, 'azuma_library_hero.jpg')).convert('RGB')
    made.append(emit_tall(im, 'azuma', 0.5))

    for p, size in made:
        print('%-12s %s  %4d KB' % (os.path.basename(p), size,
                                    os.path.getsize(p) // 1024))
    print('total %d KB' % (sum(os.path.getsize(p) for p, _ in made) // 1024))
    return made


def preview(made):
    """按卡片真实显示尺寸的 1.5 倍出对照图（284x160 的 16:9 图区）"""
    box = (426, 240)
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
