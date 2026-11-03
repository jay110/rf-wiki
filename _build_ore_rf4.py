# -*- coding: utf-8 -*-
"""RF4 矿石类的来源表 -> js/ore.js

源：biligame 符文工厂 wiki《鉱石類》条目（快照 _snap/RF4ore.txt，取自 api.php action=parse
prop=wikitext）。该条目只有 ==RF4== 一节带成表的来源列，其余作品节的表是空的，
所以本文件只出 RF4 一组。

源表四列：「分类 || 名字 || 重复获得方式」，获得方式里用 <br> 分「宝箱：」「魔物：」
「木箱：」「采集：」四类，每类内部用「、」分隔，行尾常多一个「、」（会产生空项，丢掉）。
「惊人的废铁」的采集列写的是「故意锻造失败」，不是地名——照录，调用方要能区分。
"""
import json
import re

SNAP = "_snap/RF4ore.txt"
OUT = "js/ore.js"


def strip_links(s):
    s = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    return s.strip()


def items(s):
    s = s.rstrip("、").strip()
    return [x for x in (strip_links(p).strip() for p in s.split("、")) if x]


def main():
    w = open(SNAP, encoding="utf-8").read()
    sec = w[w.find("==RF4=="):w.find("==用途==")]
    rows = []
    for line in sec.split("\n"):
        if not line.startswith("|[[矿石类]]"):
            continue
        cells = line.lstrip("|").split("||")
        name = strip_links(cells[1].split("|")[-1])
        rec = [name, [], [], [], []]
        for part in cells[2].split("<br>"):
            part = part.strip()
            if not part:
                continue
            key, _, val = part.partition("：")
            if key == "采集":
                rec[1] = items(val)
            elif key == "宝箱":
                rec[2] = items(val)
            elif key == "魔物":
                rec[3] = items(val)
            elif key == "木箱":
                rec[4] = items(val)
        rows.append(rec)

    head = (
        "/* RF4 矿石类（8 种）：源 biligame《鉱石類》条目 RF4 表，由 _build_ore_rf4.py 生成，勿手改。\n"
        "   字段：[矿石, 采集地点[], 宝箱[], 魔物[], 木箱[]]；源表四类来源照录，缺哪类就是空数组。\n"
        "   「惊人的废铁」的采集列源文写「故意锻造失败」，不是地名，原样保留。 */\n"
    )
    body = "const ORE_RF4 = " + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";\n"
    open(OUT, "w", encoding="utf-8", newline="\n").write(head + body)
    print(OUT, "rows", len(rows))


if __name__ == "__main__":
    main()
