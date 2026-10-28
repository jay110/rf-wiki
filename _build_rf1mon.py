#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame 符文工厂 wiki 的「符文工厂1魔物数据表」页生成 js/rf1mon.js。

源：https://wiki.biligame.com/runefactory/符文工厂1魔物数据表 （BWIKI，MediaWiki）
表头：名字!!HP!!EXP!!ATK!!DEF!!物理!!火!!风!!水!!地!!吹飞!!倒地!!毒!!封印!!麻痹!!吸收!!手套!!特殊能力!!出现场所

产出：
    RF1_MON  [名, HP, EXP, ATK, DEF, 物理, 火, 风, 水, 地, 吹飞, 倒地, 毒, 封印, 麻痹, 吸收, 手套, 特殊能力, 出现场所]
    RF1_PLACE  日文洞窟名 -> 站内汉化定稿名的映射（用于展示与检索）
注意：本表译名沿用 wiki，与站内汉化定稿名（MON_RF1）体系不同，
      如 wiki「兽人」＝ 站内「野猪战士」；页面不做强行合并，各自独立呈现。
"""
import json
import os
import re
import sys

import _fetch_bwiki as F

SRC = "符文工厂1魔物数据表"
OUT = "G:/wit_tools/work/RF_WIKI/js/rf1mon.js"

# 日文洞窟名 -> 站内汉化定稿名（与 MON_RF1.loc 对齐）
PLACE = {
    "カーマイト洞窟": "卡麦特洞窟",
    "トロス洞窟": "特罗斯洞窟",
    "クレメンス洞窟": "克莱门斯洞窟",
    "ギガント山": "癸干忒山",
    "ミストブルーム洞窟": "密丝特布鲁姆",
    "カジミール遺跡": "卡西米尔遗迹",
    "ダーナ洞窟": "达努洞窟",
    "グリード洞窟": "格力德洞窟",
}


def clean(s):
    s = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"</?br\s*/?>", "、", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("'''", "").replace("''", "")
    return re.sub(r"\s+", " ", s).strip()


def place_cn(s):
    """日文洞窟（可能多个用「、」连）-> 中文"""
    parts = [p.strip() for p in s.split("、") if p.strip()]
    out = [PLACE.get(p, p) for p in parts]
    return "、".join(out)


def js(s):
    return json.dumps(s, ensure_ascii=False)


def num(v):
    v = v.strip()
    if v.lstrip("-").isdigit():
        return int(v)
    if v in ("-", "", "无"):
        return None
    return v


def main():
    cache = "G:/wit_tools/work/RF_WIKI/_rf1mon_raw.txt"
    raw = ""
    if "--fetch" in sys.argv or not os.path.exists(cache):
        try:
            raw = F.fetch_page(SRC)
        except Exception as e:
            print("抓取失败，回退本地快照:", e, file=sys.stderr)
    if not raw:
        if not os.path.exists(cache):
            print("无源数据", file=sys.stderr)
            return 1
        raw = open(cache, encoding="utf-8").read()
        print("使用本地快照:", cache)
    else:
        open(cache, "w", encoding="utf-8").write(raw)

    m = re.search(r"\{\|.*?\n\|\}", raw, re.S)
    if not m:
        print("未找到表格", file=sys.stderr)
        return 1
    lines = [l.strip() for l in m.group(0).split("\n")]
    data = [l for l in lines
            if l.startswith("|") and l not in ("|-", "|}")
            and not l.startswith("{|") and not l.startswith("|+")]

    rows = []
    for l in data:
        c = [clean(x) for x in l[1:].split("||")]
        if len(c) != 19:
            print("  ! 列数不符(%d):" % len(c), l[:80])
            continue
        rows.append([
            c[0], num(c[1]), num(c[2]), num(c[3]), num(c[4]),
            num(c[5]), num(c[6]), num(c[7]), num(c[8]), num(c[9]),
            num(c[10]), num(c[11]), num(c[12]), num(c[13]), num(c[14]), num(c[15]),
            num(c[16]),
            "—" if c[17] in ("-", "") else c[17],
            place_cn(c[18]),
        ])

    # 按 HP 降序（强度顺序）
    rows.sort(key=lambda x: -(x[1] if isinstance(x[1], int) else 0))

    w = []
    a = w.append
    a("/*")
    a(" * RF1（符文工房 新牧场物语）魔物战斗数值")
    a(" * 由 _build_rf1mon.py 生成，源：biligame 符文工厂 wiki「符文工厂1魔物数据表」页")
    a(" * https://wiki.biligame.com/runefactory/%E7%AC%A6%E6%96%87%E5%B7%A5%E5%8E%821%E9%AD%94%E7%89%A9%E6%95%B0%E6%8D%AE%E8%A1%A8")
    a(" * RF1_MON 格式：[名, HP, EXP, ATK, DEF, 物理, 火, 风, 水, 地,")
    a(" *               吹飞, 倒地, 毒, 封印, 麻痹, 吸收, 手套, 特殊能力, 出现场所]")
    a(" * 数值缺失为 null；「—」表示原表记为无。按 HP 从高到低排。")
    a(" * 译名沿用 wiki（与站内汉化定稿名体系不同，如 wiki「兽人」＝站内「野猪战士」）。")
    a(" */")
    a("const RF1_MON = [")
    for r in rows:
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
    a("/* 日文洞窟名 -> 站内汉化定稿名 */")
    a("const RF1_PLACE = %s;" % json.dumps(PLACE, ensure_ascii=False, indent=0).replace("\n", ""))

    open(OUT, "w", encoding="utf-8").write("\n".join(w) + "\n")
    print("行数:", len(rows))
    hp = [r[1] for r in rows if isinstance(r[1], int)]
    print("HP 范围:", min(hp), "-", max(hp))
    print("有特殊能力:", sum(1 for r in rows if r[17] != "—"))
    print("地点:", sorted({r[18] for r in rows}))
    print("写出:", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
