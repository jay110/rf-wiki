#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame 符文工厂 wiki 的「RF3monster」页生成 js/gift_rf3.js。

源：https://wiki.biligame.com/runefactory/RF3monster （BWIKI，MediaWiki）
首表表头：名字!!地点!!等级!!捕捉率!!总喜好物品!!生产物!!总掉落!!骑乘!!浇水!!劈柴!!砸石!!收获
只取「总喜好物品」这一列（魔物驯服/牧场偏爱的道具），与 RF4/RF5 的「魔物喜好」同义。

产出：
    GIFT_RF3  [名, 捕捉率, 喜好1, 喜好2, ...]   （喜好为可变长数组，按「、」拆分去重）
"""
import json
import re
import sys

import _fetch_bwiki as F

SRC = "RF3monster"
OUT = "G:/wit_tools/work/RF_WIKI/js/gift_rf3.js"
# 列序：0名字 1地点 2等级 3捕捉率 4总喜好物品 ...
IDX_NAME, IDX_RATE, IDX_FAV = 0, 3, 4


def clean(s):
    s = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"</?br\s*/?>", "、", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("'''", "").replace("''", "")
    return re.sub(r"\s+", " ", s).strip()


def split_fav(s):
    """把「总喜好物品」单元格拆成去重后的道具列表。"""
    if s in ("-", "", "无", "—"):
        return []
    parts = re.split(r"[、,，\s]+", s)
    out = []
    for p in parts:
        p = p.strip()
        if p and p not in out:
            out.append(p)
    return out


def main():
    raw = F.fetch_page(SRC)
    if not raw:
        print("抓取失败", file=sys.stderr)
        return 1
    open("G:/wit_tools/work/RF_WIKI/_rf3mon_raw.txt", "w", encoding="utf-8").write(raw)

    # 取含「总喜好物品」表头的第一张表
    blocks = re.findall(r"\{\|.*?\n\|\}", raw, re.S)
    if not blocks:
        print("未找到任何表格（wikitext 结构可能变化）", file=sys.stderr)
        return 1
    tb = None
    for b in blocks:
        if "总喜好物品" in b:
            tb = b
            break
    if not tb:
        print("未找到含「总喜好物品」的表格", file=sys.stderr)
        return 1

    rows = []
    no_fav = 0
    for line in tb.split("\n"):
        s = line.strip()
        if not s.startswith("|") or s in ("|-", "|}") or s.startswith("{|") or s.startswith("|+"):
            continue
        cells = [clean(x) for x in s[1:].split("||")]
        if len(cells) < 5:
            continue
        name = cells[IDX_NAME]
        if name in ("名字", "") or name.startswith("!"):
            continue
        rate_raw = cells[IDX_RATE].strip()
        rate = int(rate_raw) if rate_raw.lstrip("-").isdigit() else None
        fav = split_fav(cells[IDX_FAV])
        if not fav:
            no_fav += 1
        rows.append([name, rate] + fav)

    # 按等级降序、同名稳定；无等级的排最后
    rows.sort(key=lambda r: (-(r[1] if isinstance(r[1], int) else -1), r[0]))

    w = []
    a = w.append
    a("/*")
    a(" * 符文工房3（RF3）魔物喜好（驯服/牧场偏爱道具）")
    a(" * 由 _build_gift_rf3.py 生成，源：biligame 符文工厂 wiki「RF3monster」页")
    a(" * https://wiki.biligame.com/runefactory/RF3monster")
    a(" * GIFT_RF3 格式：[名, 捕捉率, 喜好1, 喜好2, ...]")
    a(" * 喜好为「总喜好物品」列按「、」拆分去重；原表为「-」或无记录则空数组。")
    a(" * 捕捉率为 biligame 原表数值（百分比基准，投喂好感/驯服的起始难度，非最终概率）。")
    a(" * 命名沿用 biligame 中文名，与站内魔物图鉴（MON_RF3，取自《符文工房3全攻略》）可能存在个别译名差异。")
    a(" */")
    a("const GIFT_RF3 = [")
    for r in rows:
        vals = [json.dumps(r[0], ensure_ascii=False)]
        vals.append("null" if r[1] is None else str(r[1]))
        for v in r[2:]:
            vals.append(json.dumps(v, ensure_ascii=False))
        a("    [%s]," % ", ".join(vals))
    a("];")
    a("")

    open(OUT, "w", encoding="utf-8").write("\n".join(w) + "\n")
    print("行数:", len(rows), "| 无喜好记录:", no_fav)
    print("写出:", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
