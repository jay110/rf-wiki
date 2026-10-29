# -*- coding: utf-8 -*-
"""NDS ROM 只读解包 + Nitro 2D 图形（NCGR/NCLR/NSCR）渲染。

不依赖 ndspy（装不上），FNT/FAT 手写解析。只读取 ROM，从不写回。

FNT 布局（GBATEK）：
  目录表 8 字节/项：u32 子表偏移 + u16 本目录首个文件号 + u16 父目录号（第 0 项是根）
  子表项：文件 = u8(名字长度, <0x80) + 名字
          目录 = u8(0x80|名字长度) + 名字 + u16 目录号
  子表项不存文件号，按 firstFileID 顺序递增。

用法：
  python _nds_nitro.py list  <rom>
  python _nds_nitro.py get   <rom> <outdir> <文件名>...
"""
import struct, sys, os


def read_index(rom):
    """返回 (fat, files)；files 是 [(路径, 文件号)]，按目录遍历顺序"""
    with open(rom, "rb") as fh:
        head = fh.read(0x4000)
        fnt_off, fnt_size, fat_off, fat_size = struct.unpack_from("<IIII", head, 0x40)
        fh.seek(fnt_off); fnt = fh.read(fnt_size)
        fh.seek(fat_off); fatb = fh.read(fat_size)
    fat = [struct.unpack_from("<II", fatb, i * 8) for i in range(fat_size // 8)]
    files = []

    def walk(dirid, prefix, depth=0):
        if depth > 12:
            return
        base = (dirid & 0xFFF) * 8
        if base + 8 > len(fnt):
            return
        off, firstfid, _parent = struct.unpack_from("<IHH", fnt, base)
        o = off & 0xFFFFF
        fidx = firstfid
        while 0 < o < len(fnt):
            n = fnt[o]
            if n == 0:
                return
            if n & 0x80:                       # 子目录
                ln = n & 0x7F
                nm = fnt[o + 1:o + 1 + ln].decode("ascii", "replace")
                walk(struct.unpack_from("<H", fnt, o + 1 + ln)[0], prefix + "/" + nm, depth + 1)
                o += 1 + ln + 2
            else:                              # 文件
                files.append((prefix + "/" + fnt[o + 1:o + 1 + n].decode("ascii", "replace"), fidx))
                fidx += 1
                o += 1 + n

    walk(0xF000, "")
    return fat, files


def extract(rom, names, outdir):
    fat, files = read_index(rom)
    idx = {p.rsplit("/", 1)[-1]: fid for p, fid in files}
    os.makedirs(outdir, exist_ok=True)
    got = {}
    with open(rom, "rb") as fh:
        for name in names:
            fid = idx.get(name)
            if fid is None:
                print("  缺文件:", name)
                continue
            s, e = fat[fid]
            fh.seek(s)
            p = os.path.join(outdir, name)
            open(p, "wb").write(fh.read(e - s))
            got[name] = p
    return got


# ---------------------------------------------------------------- Nitro 2D

def bgr555(v):
    r = (v & 0x1F) << 3
    g = ((v >> 5) & 0x1F) << 3
    b = ((v >> 10) & 0x1F) << 3
    return (r | r >> 5, g | g >> 5, b | b >> 5)


def load_nclr(p):
    d = open(p, "rb").read()
    base = d.find(b"TTLP")
    if base < 0:
        return [(0, 0, 0)] * 256
    size = struct.unpack_from("<I", d, base + 0x10)[0]
    off = struct.unpack_from("<I", d, base + 0x14)[0]
    start = base + 0x08 + off
    n = size // 2
    return [bgr555(struct.unpack_from("<H", d, start + i * 2)[0]) for i in range(max(n, 256))]


def load_ncgr(p):
    """返回 (tiles, bpp, nx, ny)。

    RAHC 头部：+0x08 u16 高(块) / +0x0A u16 宽(块) / +0x0C u32 色深(3=4bpp, 4=8bpp)
              +0x18 u32 图块数据字节数 / +0x1C u32 数据偏移（相对 +0x18）
    头里声明的块数未必等于实际块数（4bpp 尤其常见），一律按 tileDataSize 反推块数，
    用 nx*ny 会把起点算成负数。"""
    d = open(p, "rb").read()
    base = d.find(b"RAHC")
    if base < 0:
        base = d.find(b"CHAR") - 4
    nx, ny, fmt = struct.unpack_from("<HHI", d, base + 0x08)
    bpp = 8 if fmt in (4, 6) else 4
    tsz = 64 if bpp == 8 else 32
    dsz = struct.unpack_from("<I", d, base + 0x18)[0]
    doff = struct.unpack_from("<I", d, base + 0x1C)[0]
    start = base + 0x18 + doff
    if dsz <= 0 or start + dsz > len(d):       # 头部不可信就退回文件尾
        dsz = len(d) - start
    n = dsz // tsz
    return [d[start + i * tsz: start + (i + 1) * tsz] for i in range(n)], bpp, nx, ny


def load_nscr(p):
    d = open(p, "rb").read()
    base = d.find(b"NRCS")
    if base < 0:
        base = d.find(b"SCRN") - 4
    w, h = struct.unpack_from("<HH", d, base + 0x08)
    w, h = w // 8, h // 8                      # 头里是像素，map 按块存
    start = base + 0x14
    n = (len(d) - start) // 2
    return [struct.unpack_from("<H", d, start + i * 2)[0] for i in range(min(n, w * h))], w, h


def render(ncgr, nclr, nscr, sw=256, sh=192):
    """拼一张 RGB 图。注意：带逐行滚动视差的背景（如 title_bgA）静态拼必然出横条，
    选画面中部 + 模糊可以压下去，但根治不了。"""
    from PIL import Image
    tiles, bpp, _nx, _ny = load_ncgr(ncgr)
    pal = load_nclr(nclr)
    mapv, mw, _mh = load_nscr(nscr)
    im = Image.new("RGB", (sw, sh))
    px = im.load()
    for ty in range(sh // 8):
        for tx in range(sw // 8):
            if ty * mw + tx >= len(mapv):
                continue
            e = mapv[ty * mw + tx]
            ti = e & 0x3FF
            hf, vf, pn = (e >> 10) & 1, (e >> 11) & 1, (e >> 12) & 0xF
            if ti >= len(tiles):
                continue
            t = tiles[ti]
            for y in range(8):
                sy = 7 - y if vf else y
                for x in range(8):
                    sx = 7 - x if hf else x
                    if bpp == 8:
                        ci = t[sy * 8 + sx]
                    else:
                        b = t[sy * 4 + (sx >> 1)]
                        ci = (b & 0xF) if sx % 2 == 0 else (b >> 4)
                    px[tx * 8 + x, ty * 8 + y] = pal[pn * 16 + ci] if bpp == 4 else pal[ci]
    return im


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    rom = sys.argv[2]
    if cmd == "list":
        fat, files = read_index(rom)
        print("文件数", len(files))
        for p, fid in files:
            s, e = fat[fid] if fid < len(fat) else (0, 0)
            print("%-52s id=%-5d %9d" % (p, fid, e - s))
    elif cmd == "get":
        extract(rom, sys.argv[4:], sys.argv[3])
