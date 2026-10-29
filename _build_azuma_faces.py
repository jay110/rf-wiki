#!/usr/bin/env python3
"""龙之天地（azuma）头像构建：官方素材 → 160×160 头像。
两组源图，处理方式不同：

1) 主角/花嫁花婿/神（17 张，透明底）
   源：https://www.marv.jp/onlinemnl/ryu/jp/switch/img/ch/chNN_tn.jpg（490×560 头肩像）
       手册页角色顺序 cbtn01..17 = ch01..17，与官方角色介绍一一对应。
   背景统一米色 (243,242,238) → 从画面边缘 floodfill 抠掉，再按肤色定位「脸」居中裁切。

2) 里の住人（4 张，带樱花背景，不抠）
   源：https://jp.runefactory.com/ryu-no-kuni/assets/img/characters/sato/img_chara_sato_0N.jpg
       官方「里の住人」页的大图 950×950，是立绘＋樱花背景的合成图，边缘与树影交错，
       纯色键抠不干净（没有 AI 抠图环境），故保留原背景，只按实测坐标裁头。
   坐标是逐张量出来的（原图 950 见方，裁 340 见方），改图时按 _face_src/azuma/*.md 重测。

用法：python _build_azuma_faces.py
"""
import pathlib
import sys

from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "_face_src" / "azuma"
OUT = ROOT / "assets" / "face" / "azuma"

# 输出边长：与 rff/rf3 的 160 对齐
SIZE = 160
# 裁切时在头顶上方留的比例（占裁切框高度的百分比）。原图顶部留白 20-50px，
# 不留一点会被裁掉发饰/帽檐，留太多脸又会变小。
HEAD_ROOM = 0.07
# 裁切框边长相对原图宽度的比例：>1 时向外 pad 透明边，人物会略小、上下更松
FRAME_SCALE = 1.0
# 逐张水平微调（px，正数右移），用来修正「头部质心」被发型/肩甲拉偏的情况
DX = {
    # モコロン 是白色毛绒生物，肤色检测不适用 → 用 alpha 质心，见 SKIN_FALLBACK
}

MARK = (254, 3, 254)  # floodfill 标记色，理论上不会出现在这些图里

JOBS = [
    # (源文件, 输出名, 日文名备注)
    ("ch01.jpg", "subaru", "スバル"),
    ("ch02.jpg", "kaguya", "カグヤ"),
    ("ch03.jpg", "mokoron", "モコロン"),
    ("ch04.jpg", "iroha", "いろは"),
    ("ch05.jpg", "murasame", "ムラサメ"),
    ("ch06.jpg", "hina", "ひな"),
    ("ch07.jpg", "mauro", "マウロ"),
    ("ch08.jpg", "uraraka", "うららか"),
    ("ch09.jpg", "matsuri", "マツリ"),
    ("ch10.jpg", "kurama", "クラマ"),
    ("ch11.jpg", "fubuki", "フブキ"),
    ("ch12.jpg", "kanata", "カナタ"),
    ("ch13.jpg", "kai", "カイ"),
    ("ch14.jpg", "clarisse", "クラリス"),
    ("ch15.jpg", "ikaruga", "イカルガ"),
    ("ch16.jpg", "pirika", "ピリカ"),
    ("ch17.jpg", "tsuiran", "ツイラン"),
]

# 里の住人：官方「里の住人」页 950×950 立绘＋樱花背景，裁切框 (left, top, 边长) 逐张实测
JOBS_SATO = [
    ("sato_01.jpg", "suzu", "すず", (212, 100, 340)),
    ("sato_02.jpg", "sakaki", "サカキ", (274, 62, 340)),
    ("sato_03.jpg", "takumi", "タクミ", (291, 14, 340)),
    ("sato_04.jpg", "hisui", "ヒスイ", (198, 82, 340)),
]


def cut_background(im: Image.Image, thresh: int = 34) -> Image.Image:
    """从四边 floodfill 抠背景，返回带 alpha 的图。"""
    rgb = im.convert("RGB")
    W, H = rgb.size
    # 边缘取样点：四角 + 四边中点，覆盖所有与背景相连的区域
    seeds = [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1),
             (W // 2, 0), (0, H // 2), (W - 1, H // 2), (W // 2, H - 1)]
    for xy in seeds:
        if rgb.getpixel(xy) == MARK:
            continue
        ImageDraw.floodfill(rgb, xy, MARK, thresh=thresh)
    out = rgb.convert("RGBA")
    px = out.load()
    for y in range(H):
        for x in range(W):
            if px[x, y][:3] == MARK:
                px[x, y] = (0, 0, 0, 0)
    # 边缘半透明杂色（JPEG 抖动）再收一道：alpha 保留，颜色不做处理
    a = out.getchannel("A")
    a = a.filter(ImageFilter.MedianFilter(3))
    out.putalpha(a)
    return out


def crop_square(im: Image.Image, dx: int = 0) -> Image.Image:
    """按前景包围盒把头顶对齐，裁成正方形。"""
    pad = 80
    orig_w, orig_h = im.size
    canvas = Image.new("RGBA", (orig_w + pad * 2, orig_h + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    im = canvas

    W, H = im.size
    alpha = im.getchannel("A")
    # 二值化后再取包围盒：JPEG 毛边留下的低 alpha 杂点会把 bbox 撑到画面边缘
    mask = alpha.point(lambda v: 255 if v > 140 else 0)
    bbox = mask.getbbox()
    if not bbox:
        raise RuntimeError("整张图都被抠掉了，检查背景色阈值")
    left, top, right, bottom = bbox

    # 头部质心：优先用肤色定位「脸」，比 alpha 质心稳——
    # 肩甲、武器、马尾都会把 alpha 质心拽偏（凯的鬼面、伊卡鲁加的白帽最明显）。
    head_bottom = top + int((bottom - top) * 0.50)
    px = im.load()

    def is_skin(r, g, b):
        mx, mn = max(r, g, b), min(r, g, b)
        return (r > 95 and g > 40 and b > 20 and mx - mn > 15
                and r > g and r > b and abs(r - g) > 15)

    sx = sw = 0
    for y in range(top, head_bottom, 2):
        for x in range(left, right, 2):
            p = px[x, y]
            if p[3] > 200 and is_skin(p[0], p[1], p[2]):
                sx += x
                sw += 1

    if sw >= 400:                                    # 肤色足够（正常人脸）
        cx = sx // sw
    else:                                            # 毛绒生物 / 面具遮脸 → 退回 alpha 质心
        head = mask.crop((0, top, W, head_bottom))
        hpx = head.load()
        ax = aw = 0
        for y in range(0, head.height, 2):
            for x in range(0, head.width, 2):
                if hpx[x, y]:
                    ax += x
                    aw += 1
        cx = (ax // aw) if aw else (left + right) // 2
    cx += dx

    side = int(orig_w * FRAME_SCALE)
    y0 = top - int(side * HEAD_ROOM)
    x0 = cx - side // 2
    x0 = max(0, min(W - side, x0))
    y0 = max(0, min(H - side, y0))
    return im.crop((x0, y0, x0 + side, y0 + side))


def main():
    if not SRC.is_dir():
        sys.exit(f"缺源图目录：{SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    missing = [s for s, _, _ in JOBS if not (SRC / s).exists()]
    missing += [s for s, _, _, _ in JOBS_SATO if not (SRC / s).exists()]
    if missing:
        sys.exit("缺源图：" + ", ".join(missing))

    for src, name, jp in JOBS:
        im = Image.open(SRC / src)
        cut = cut_background(im)
        sq = crop_square(cut, DX.get(src, 0)).resize((SIZE, SIZE), Image.LANCZOS)
        sq.save(OUT / f"{name}.png")
        print(f"OK {name}.png  ({jp})  {im.size} → {SIZE}x{SIZE}")

    for src, name, jp, box in JOBS_SATO:
        x0, y0, side = box
        im = Image.open(SRC / src).convert("RGB")
        sq = im.crop((x0, y0, x0 + side, y0 + side)).resize((SIZE, SIZE), Image.LANCZOS)
        sq.save(OUT / f"{name}.png")
        print(f"OK {name}.png  ({jp})  {im.size} crop{box} → {SIZE}x{SIZE}")

    print(f"共 {len(JOBS) + len(JOBS_SATO)} 张 → {OUT}")


if __name__ == "__main__":
    main()
