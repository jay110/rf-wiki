#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame 符文工厂 wiki 的「RFFmonster」页生成 js/rffmon.js。

源：https://wiki.biligame.com/runefactory/RFFmonster （BWIKI，MediaWiki）
表头：名字!!等级!!HP!!攻击力!!防御力!!魔法力!!元素属性!!出现地点!!总掉落物!!备注

产出：
    RFF_MON  [名, 等级, HP, 攻, 防, 魔法力, 元素, 出现地点, 总掉落物, 备注]
    RFF_MONNOTE 简介里记载的掉落等级上限机制说明
"""
import json
import re
import sys

import _fetch_bwiki as F

SRC = "RFFmonster"
OUT = "G:/wit_tools/work/RF_WIKI/js/rffmon.js"
HEAD = ["名字", "等级", "HP", "攻击力", "防御力", "魔法力", "元素属性", "出现地点", "总掉落物", "备注"]


def clean(s):
    """去掉 wiki 链接/粗体标记，只留显示文字。"""
    s = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"</?br\s*/?>", "、", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("'''", "").replace("''", "")
    return re.sub(r"\s+", " ", s).strip()


def js(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    raw = F.fetch_page(SRC)
    if not raw:
        print("抓取失败", file=sys.stderr)
        return 1
    open("G:/wit_tools/work/RF_WIKI/_rffmon_raw.txt", "w", encoding="utf-8").write(raw)

    m = re.search(r"\{\|.*?\n\|\}", raw, re.S)
    if not m:
        print("未找到表格", file=sys.stderr)
        return 1
    tb = m.group(0)

    # 简介：掉落等级上限机制
    intro = raw.split("==数据==")[0]
    intro = re.sub(r"==简介==", "", intro)
    intro = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", intro)
    intro = re.sub(r"\[\[([^\]]+)\]\]", r"\1", intro)
    intro = " ".join(x.strip() for x in intro.split("\n") if x.strip())

    rows = []
    for line in tb.split("\n"):
        s = line.strip()
        if not s.startswith("|") or s in ("|-", "|}") or s.startswith("{|") or s.startswith("|+"):
            continue
        cells = [clean(x) for x in s[1:].split("||")]
        if len(cells) != len(HEAD):
            print("  ! 列数不符(%d):" % len(cells), s[:80])
            continue
        rows.append(cells)

    # 数值列转 int
    out_rows = []
    for r in rows:
        name, lv, hp, atk, df, mg, el, place, drop, note = r
        def num(v):
            v = v.strip()
            return int(v) if v.lstrip("-").isdigit() else (None if v in ("-", "", "无") else v)
        out_rows.append([
            name, num(lv), num(hp), num(atk), num(df), num(mg),
            "—" if el in ("-", "") else el,
            "—" if place in ("-", "") else place,
            "—" if drop in ("-", "", "无") else drop,
            "" if note in ("-", "") else note,
        ])

    out_rows.sort(key=lambda x: (-(x[1] if isinstance(x[1], int) else 0)))

    w = []
    a = w.append
    a("/*")
    a(" * 边境（RFF／符文工房 边境）全魔物属性与掉落")
    a(" * 由 _build_rffmon.py 生成，源：biligame 符文工厂 wiki「RFFmonster」页")
    a(" * https://wiki.biligame.com/runefactory/RFFmonster")
    a(" * RFF_MON 格式：[名, 等级, HP, 攻击力, 防御力, 魔法力, 元素属性, 出现地点, 总掉落物, 备注]")
    a(" * 数值缺失为 null；「—」表示原表记为无。按等级从高到低排。")
    a(" */")
    a("const RFF_MON = [")
    for r in out_rows:
        vals = []
        for v in r:
            if v is None:
                vals.append("null")
            elif isinstance(v, int):
                vals.append(str(v))
            else:
                vals.append(js(v))
        a("    [%s]," % ", ".join(vals))
    a("];")
    a("")
    a("/* 原页「简介」记载的掉落等级机制 */")
    a("const RFF_MONNOTE = %s;" % js(intro))

    open(OUT, "w", encoding="utf-8").write("\n".join(w) + "\n")
    print("行数:", len(out_rows))
    print("简介:", intro[:160])
    lv = [r[1] for r in out_rows if isinstance(r[1], int)]
    print("等级范围:", min(lv), "-", max(lv))
    print("有备注:", sum(1 for r in out_rows if r[9]))
    print("元素非空:", sum(1 for r in out_rows if r[6] != "—"))
    print("写出:", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
