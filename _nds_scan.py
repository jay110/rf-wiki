# -*- coding: utf-8 -*-
"""不落地解包，直接扫 ROM 里所有 NCGR/NSCR/NCLR 的头部，按像素面积排序。

用法： python _nds_scan.py <rom.nds> [关键字]
目的是先摸清"哪些图够大"，再决定提取哪几个，避免把 5000 个文件全倒出来。
"""
import sys, struct, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _nds_nitro import read_index

def head(fh, off, sig):
    """读一小段并找签名"""
    fh.seek(off)
    d = fh.read(min(0x80, max(0, 0)))
    return d

def scan(rom):
    fat, files = read_index(rom)
    fh = open(rom, "rb")
    out = []
    for name, fid in files:
        if not name.upper().endswith((".NCGR", ".NSCR", ".NCLR")):
            continue
        start, end = fat[fid]
        size = end - start
        if size < 0x40:
            continue
        fh.seek(start)
        head = fh.read(0x40)
        sig = head[:4]
        rec = {"name": name, "size": size, "sig": sig.decode("latin1")}
        if sig == b"RGCN":
            b = head.find(b"RAHC")
            if b < 0:
                b = head.find(b"CHAR")
                b = b - 4 if b >= 4 else 0x10
            nx, ny, fmt = struct.unpack_from("<HHI", head, b + 0x08)
            dsz = struct.unpack_from("<I", head, b + 0x18)[0]
            bpp = 8 if fmt in (4, 6) else 4
            tsz = 64 if bpp == 8 else 32
            n = (dsz or size) // tsz
            rec.update(kind="NCGR", bpp=bpp, tiles=n, px=n * 64)
        elif sig == b"RCSN":
            b = head.find(b"NRCS")
            if b < 0:
                continue
            w, h = struct.unpack_from("<HH", head, b + 0x08)
            rec.update(kind="NSCR", bpp=0, tiles=0, px=w * h)
        elif sig == b"RLCN":
            rec.update(kind="NCLR", bpp=0, tiles=0, px=0)
        out.append(rec)
    return out

if __name__ == "__main__":
    rom = sys.argv[1]
    kw = sys.argv[2].lower() if len(sys.argv) > 2 else ""
    recs = scan(rom)
    print("图形资源总数:", len(recs))
    for kind in ("NCGR", "NSCR"):
        sub = [r for r in recs if r["kind"] == kind and kw in r["name"].lower()]
        sub.sort(key=lambda r: -r["px"])
        print("\n== %s 按面积前 30%s ==" % (kind, (" 关键字:%s" % kw) if kw else ""))
        print("%-42s %8s %4s %7s %6s %s" % ("文件", "字节", "bpp", "图块", "像素", "尺寸"))
        for r in sub[:30]:
            print("%-42s %8d %4s %7d %6d %dx%d" % (
                r["name"], r["size"], r["bpp"] or "-", r["tiles"], r["px"],
                int(r["px"] ** 0.5) if r["kind"] == "NCGR" else 0, 0))
