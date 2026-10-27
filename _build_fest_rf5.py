#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame 符文工厂 wiki 的「RF5festival」页生成 js/rf5cal.js。

源：https://wiki.biligame.com/runefactory/RF5festival （BWIKI，MediaWiki）
页面结构：每个节日一个 ==标题== 段，段内首行是「季X日」，随后若干行说明，
          部分节日嵌有 {| class="wikitable" |} 子表（躲哞哞/大胃王/堆雪人）。

产出：
    FEST_RF5   [季节, 日, 名称, 举办时间, 地点, 主办人, 玩法要点]
    RF5_MOO    躲哞哞比赛：牛种 / 移动速度 / 得分
    RF5_EAT    大胃王比赛：食物 / 得分 / 按键次数
    RF5_SNOW   堆雪人比赛：雪球尺寸 / 移动速度
"""
import json
import re
import sys

import _fetch_bwiki as F

SRC_PAGE = "RF5festival"
OUT = "G:/wit_tools/work/RF_WIKI/js/rf5cal.js"

# 子表标题 -> 变量名 / 列头
SUB_TABLES = {
    "躲哞哞比赛": ("RF5_MOO", ["牛种", "移动速度", "得分"]),
    "大胃王比赛": ("RF5_EAT", ["食物", "得分", "按键次数"]),
    "堆雪人比赛": ("RF5_SNOW", ["雪球尺寸", "移动速度"]),
}


def clean(s):
    """去掉 wiki 链接标记，只留显示文字。"""
    s = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    s = s.replace("'''", "").replace("''", "")
    return s.strip()


def parse_wikitable(block, name):
    """解析 {| class="wikitable" ... |} 返回 (表头, 数据行)。"""
    lines = [l.rstrip() for l in block.split("\n")]
    head, rows = [], []
    cur = None
    for l in lines:
        s = l.strip()
        if s.startswith("{|") or s.startswith("|+") or s == "|}" or s == "|-":
            continue
        if s.startswith("!"):
            head = [clean(x) for x in s[1:].split("!!")]
        elif s.startswith("|"):
            cells = [clean(x) for x in s[1:].split("||")]
            if cells and any(cells):
                rows.append(cells)
    return head, rows


def js(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    raw = F.fetch_page(SRC_PAGE)
    if not raw:
        print("抓取失败", file=sys.stderr)
        return 1
    open("G:/wit_tools/work/RF_WIKI/_rf5fest_src.txt", "w", encoding="utf-8").write(raw)

    parts = re.split(r"\n==([^=\n]+)==\n", raw)
    fests, subs = [], {}

    for i in range(1, len(parts), 2):
        name = parts[i].strip()
        body = parts[i + 1]
        if name in ("简介", "参考与注释"):
            continue
        m = re.search(r"(春|夏|秋|冬)\s*(\d+)\s*日", body)
        if not m:
            print("  ! 无日期，跳过:", name)
            continue
        season, day = m.group(1), int(m.group(2))

        # 抽出 wikitable —— 按所属节日归表。
        # 注意：源页里堆雪人那张表的 caption 被误写成「大胃王比赛」，
        # 所以不能靠 caption 判断，必须用本节的节日名归属。
        if name in SUB_TABLES:
            tb = re.search(r"\{\|\s*class=\"wikitable\".*?\|\}", body, re.S)
            if tb:
                h, r = parse_wikitable(tb.group(0), name)
                if r:
                    subs[name] = (h, r)
        body_notbl = re.sub(r"\{\|\s*class=\"wikitable\".*?\|\}", "", body, flags=re.S)

        # 去掉日期行
        txt = re.sub(r"[春夏秋冬]\s*\d+\s*日[：:]?", "", body_notbl)
        lines = [clean(x) for x in txt.split("\n")]
        lines = [x for x in lines if x]

        time_m = re.search(r"举办时间\s*([0-9：:~～\-]+)", txt)
        place_m = re.search(r"地点[：:]\s*([^\n]+)", txt)
        host_m = re.search(r"主办人\s*([^\n]+)", txt)
        tm = time_m.group(1).strip() if time_m else ""
        pl = place_m.group(1).strip() if place_m else ""
        ho = host_m.group(1).strip() if host_m else ""

        skip = set()
        for mm in (time_m, place_m, host_m):
            if mm:
                skip.add(mm.group(0).strip())
        desc = [x for x in lines if x not in skip and x not in ("举办时间" + tm,)]
        desc = [x for x in desc if x != tm and x != pl and x != ("主办人" + ho)]
        fests.append([season, day, name, tm, pl, ho, "｜".join(desc)])

    fests.sort(key=lambda x: ("春夏秋冬".index(x[0]), x[1]))

    out = []
    w = out.append
    w("/*")
    w(" * RF5（符文工房5）全年节日日程")
    w(" * 由 _build_fest_rf5.py 生成，源：biligame 符文工厂 wiki「RF5festival」页")
    w(" * https://wiki.biligame.com/runefactory/RF5festival")
    w(" * FEST_RF5 格式：[季节, 日, 名称, 举办时间, 地点, 主办人, 玩法要点]")
    w(" * RF5_MOO / RF5_EAT / RF5_SNOW 为三个节日的子表（牛种得分、大胃王计分、雪球速度）。")
    w(" */")
    w("const FEST_RF5 = [")
    for f in fests:
        w("    [%s, %d, %s, %s, %s, %s, %s]," % (
            js(f[0]), f[1], js(f[2]), js(f[3]), js(f[4]), js(f[5]), js(f[6])))
    w("];")
    w("")
    for key, (var, cols) in SUB_TABLES.items():
        if key not in subs:
            continue
        h, r = subs[key]
        w("/* %s：%s */" % (key, " / ".join(h or cols)))
        w("const %s = [" % var)
        for row in r:
            w("    [%s]," % ", ".join(js(c) for c in row))
        w("];")
        w("")

    open(OUT, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("节数:", len(fests))
    for f in fests:
        print("   %s%d日 %-12s %s %s %s" % (f[0], f[1], f[2], f[3], f[4], f[5]))
    print("子表:", {k: len(v[1]) for k, v in subs.items()})
    print("写出:", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
