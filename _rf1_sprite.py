# -*- coding: utf-8 -*-
"""符文工房1 标题飞龙精灵：NCER(NCGR/NCLR) 解析与渲染。

obj_title_bgA.NCER 是 extended(1) 型 cell bank，只有 1 个 cell、28 个 OAM：
  cell 描述 16 字节 = u16 numOAM / u16 attr / u32 oamOffset / s16 maxX,maxY,minX,minY
  oamOffset 相对「cell 描述数组之后」，每个 OAM 6 字节 = attr0/attr1/attr2
渲染时按 bbox 当画布，OBJ 坐标带负值，直接当相对偏移用。
"""
import struct, sys, os
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _nds_nitro import load_ncgr, load_nclr

SIZE = {
    0: [(8, 8), (16, 16), (32, 32), (64, 64)],      # square
    1: [(16, 8), (32, 8), (32, 16), (64, 32)],      # wide
    2: [(8, 16), (8, 32), (16, 32), (32, 64)],      # tall
}


def load_ncer(p):
    d = open(p, "rb").read()
    base = d.find(b"KBEC")
    if base < 0:
        base = d.find(b"CEBK") - 4
    nc, bt = struct.unpack_from("<HH", d, base + 0x08)
    doff = struct.unpack_from("<I", d, base + 0x0C)[0]
    cells_at = base + 0x08 + doff
    cells = []
    for i in range(nc):
        if bt == 1:
            no, ca, oo, mx, my, nx, ny = struct.unpack_from("<HHIhhhh", d, cells_at + i * 16)
            cells.append(dict(n=no, attr=ca, off=oo, box=(mx, my, nx, ny)))
        else:
            no, ca, oo = struct.unpack_from("<HHI", d, cells_at + i * 8)
            cells.append(dict(n=no, attr=ca, off=oo, box=None))
    oam_at = cells_at + nc * (16 if bt == 1 else 8)
    for c in cells:
        o = oam_at + c["off"]
        oams = []
        for k in range(c["n"]):
            a0, a1, a2 = struct.unpack_from("<HHH", d, o + k * 6)
            oams.append((a0, a1, a2))
        c["oam"] = oams
    return cells, bt


def render_cell(cell, tiles, pal, bpp=4, mapping="1d", bg=(0, 0, 0, 0)):
    """返回 RGBA 画布，坐标已按 bbox 平移。"""
    oams = cell["oam"]
    xs, ys = [], []
    for a0, a1, a2 in oams:
        shape = (a0 >> 14) & 3
        sz = (a1 >> 14) & 3
        w, h = SIZE[shape][sz]
        x = a1 & 0x1FF
        if x & 0x100:
            x -= 512
        y = a0 & 0xFF
        if y & 0x80:
            y -= 256            # 精灵坐标当带符号偏移用，否则上下两截中间会空 64px

        xs += [x, x + w]
        ys += [y, y + h]
    ox, oy = min(xs), min(ys)
    W, H = max(xs) - ox, max(ys) - oy
    im = Image.new("RGBA", (W, H), bg)
    px = im.load()
    for a0, a1, a2 in oams:
        shape = (a0 >> 14) & 3
        sz = (a1 >> 14) & 3
        w, h = SIZE[shape][sz]
        x = a1 & 0x1FF
        if x & 0x100:
            x -= 512
        y = a0 & 0xFF
        if y & 0x80:
            y -= 256
        hf, vf = (a1 >> 12) & 1, (a1 >> 13) & 1
        tid = a2 & 0x3FF
        pn = (a2 >> 12) & 0xF
        tw, th = w // 8, h // 8
        for ty in range(th):
            for tx in range(tw):
                if mapping == "1d":
                    ti = tid + ty * tw + tx
                else:
                    ti = tid + ty * 0x10 + tx
                if ti >= len(tiles):
                    continue
                t = tiles[ti]
                for yy in range(8):
                    sy = yy if not vf else 7 - yy
                    for xx in range(8):
                        sx = xx if not hf else 7 - xx
                        if bpp == 8:
                            ci = t[sy * 8 + sx]
                            col = pal[ci] if ci < len(pal) else (255, 0, 255)
                        else:
                            b = t[sy * 4 + (sx >> 1)]
                            ci = (b & 0xF) if sx % 2 == 0 else (b >> 4)
                            idx = pn * 16 + ci
                            col = pal[idx] if idx < len(pal) else (255, 0, 255)
                        if ci == 0:
                            continue                      # 0 号色当透明
                        px[x - ox + tx * 8 + xx, y - oy + ty * 8 + yy] = col + (255,)
    return im, (ox, oy)


if __name__ == "__main__":
    d = "_rf1_card"
    cells, bt = load_ncer(os.path.join(d, "obj_title_bgA.NCER"))
    tiles, bpp, _nx, _ny = load_ncgr(os.path.join(d, "obj_title_bgA.NCGR"))
    pal = load_nclr(os.path.join(d, "obj_title_bgA.NCLR"))
    print("bankType", bt, "cells", len(cells), "tiles", len(tiles), "bpp", bpp, "pal", len(pal))
    for i, c in enumerate(cells):
        print(" cell", i, "numOAM", c["n"], "box", c["box"])
    for mp in ("1d", "2d"):
        im, off = render_cell(cells[0], tiles, pal, bpp, mp)
        im.save(f"{d}/dragon_{mp}.png")
        print(mp, im.size, "origin", off)
