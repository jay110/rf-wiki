#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""站点图标构建：把源图（游戏内的芜菁图标，23×24 透明 PNG）做成整套 favicon / 触屏图标 / 顶栏小图。

源图只有 23×24，够 16/32/48 用，但往 180、512 放大必然发虚——
所以大尺寸走 LANCZOS + 轻量 USM，边缘不糊成一团；不做「放大成像素块」那一套。

用法：python _build_icon.py [--sheet]
"""
import pathlib
import struct
import sys

from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "_icon_src" / "biligame_icon.png"
OUT = ROOT / "assets" / "icon"

# 透明底放大会变成黑底，apple-touch 需要不透明底：用比白略暖的奶色，芜菁的白才不会粘在底上
TOUCH_BG = (246, 244, 236)


def load_square() -> Image.Image:
    """裁到 alpha 包围盒，放进正方形画布（留 4% 边），避免缩放时主体贴着边。"""
    im = Image.open(SRC).convert("RGBA")
    bb = im.getchannel("A").getbbox()
    im = im.crop(bb)
    side = max(im.size)
    pad = int(side * 0.04)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, ((canvas.width - im.width) // 2, (canvas.height - im.height) // 2))
    return canvas


def scale(src: Image.Image, size: int) -> Image.Image:
    im = src.resize((size, size), Image.LANCZOS)
    if size >= 64:  # 放得越大越软，补一点锐度
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    return im


def on_bg(im: Image.Image, color) -> Image.Image:
    bg = Image.new("RGBA", im.size, color + (255,))
    bg.alpha_composite(im)
    return bg


def write_ico(dest: pathlib.Path, pngs: list) -> None:
    datas = [p.read_bytes() for p in pngs]
    head = struct.pack("<HHH", 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    entries = b""
    for p, d in zip(pngs, datas):
        w = Image.open(p).width
        entries += struct.pack("<BBBBHHII", 0 if w >= 256 else w, 0 if w >= 256 else w, 0, 0, 1, 32, len(d), offset)
        offset += len(d)
    dest.write_bytes(head + entries + b"".join(datas))


def main() -> None:
    if not SRC.exists():
        sys.exit(f"缺源图：{SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    src = load_square()

    made = {}
    for size in (16, 32, 48, 64, 192):
        im = scale(src, size)
        im.save(OUT / f"icon-{size}.png")
        made[size] = im

    touch = on_bg(scale(src, 180), TOUCH_BG)
    touch.save(OUT / "apple-touch-icon.png")

    write_ico(OUT / "favicon.ico", [OUT / "icon-16.png", OUT / "icon-32.png", OUT / "icon-48.png"])
    (ROOT / "favicon.ico").write_bytes((OUT / "favicon.ico").read_bytes())

    print("—— 自检 ——")
    ok = True
    for name in ("icon-16.png", "icon-32.png", "icon-48.png", "icon-64.png", "icon-192.png",
                 "apple-touch-icon.png"):
        im = Image.open(OUT / name).convert("RGBA")
        a = im.getchannel("A")
        op = sum(1 for v in a.getdata() if v > 200) / (im.width * im.height)
        corner = a.getpixel((0, 0))
        if "apple" in name:
            good = op > 0.95 and corner == 255
        else:  # 透明底：四角应基本透明（16px 缩下来会有 1~3 的抗锯齿残留）
            good = 0.25 < op < 0.85 and corner < 8
        ok &= good
        print(f"{'OK' if good else '!!'} {name:20s} {im.width:3d}px  不透明占比 {op:.2f}  角alpha={corner}")

    raw = (OUT / "favicon.ico").read_bytes()
    n = struct.unpack("<H", raw[4:6])[0]
    dims = [(raw[6 + 16 * k] or 256) for k in range(n)]
    print(f"{'OK' if dims == [16, 32, 48] else '!!'} favicon.ico          尺寸 {dims}")
    ok &= dims == [16, 32, 48]

    if "--sheet" in sys.argv:
        # 顶栏三种打法 + 触屏图标，肉眼看哪个在浅色顶栏上不糊
        W, H = 900, 460
        sheet = Image.new("RGB", (W, H), (243, 245, 244))
        # 顶栏模拟
        sheet.paste(Image.new("RGB", (W, 40), (255, 255, 255)), (0, 0))
        big = made[64]
        x = 40
        for label, plate in [("裸放", None), ("浅盘", (238, 246, 239)), ("绿盘", (25, 141, 68))]:
            ic = big.resize((22, 22), Image.LANCZOS)
            if plate:
                d = Image.new("RGBA", (30, 30), plate + (255,))
                d.alpha_composite(ic, (4, 4))
                ic = d
            sheet.paste(ic, (x, 5), ic)
            x += 90
        # 放大看 16/32/48
        x = 30
        for size, zoom in [(16, 10), (32, 6), (48, 4)]:
            im = made[size].resize((size * zoom, size * zoom), Image.NEAREST)
            sheet.paste(im, (x, 80), im)
            x += size * zoom + 30
        # 触屏图标 + 白/奶两版对照
        sheet.paste(touch.resize((170, 170), Image.LANCZOS), (30, 260), touch.resize((170, 170), Image.LANCZOS))
        white = on_bg(scale(src, 170), (255, 255, 255))
        sheet.paste(white, (230, 260), white)
        sheet.save(ROOT / "_icon_sheet.png")
        print("sheet -> _icon_sheet.png")

    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
