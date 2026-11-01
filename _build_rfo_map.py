#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""把 biligame RFOmap（wikitext）的四张表解析成 js/rfomap.js。

用法：python _build_rfo_map.py
源：_rfo_map2.txt（_fetch_bwiki.py page RFOMAP 的原始 wikitext）
规矩：只做「[[]] 链接取显示名」「<br> 转空格」这类清洗，不改数值、不补空格、不去重。
"""
import json
import os
import re

SRC = "_rfo_map_src.txt"
OUT_JS = "js/rfomap.js"

LINK = re.compile(r"\[\[([^\[\]]+)\]\]")


def clean(s):
    """[[中文|日文]] -> 中文；[[A]] -> A；<br> -> 、；去首尾空白。"""
    def sub(m):
        body = m.group(1)
        parts = body.split("|")
        # [[文件:xx.png|400px]] 这类不是实体，原样保留文件名
        if parts[0].startswith("文件:") or parts[0].startswith("File:"):
            return parts[0]
        # [[页面|显示名]] 显示的是第二个；单段链接显示的就是页面名
        return parts[1] if len(parts) >= 2 else parts[0]
    s = LINK.sub(sub, s)
    s = s.replace("<br>", "、").replace("<br/>", "、").replace("<br />", "、")
    # <br> 转顿号后可能与原文已有的「、」相邻，产生连续顿号——这是转换副作用，折叠掉
    s = re.sub("、{2,}", "、", s).strip("、")
    s = s.replace("'''", "").replace("''", "")
    return s.strip()


def rows_of(txt):
    """按行拆，返回 [(cell...)...]，跳过表头与分隔线。"""
    out = []
    head = None
    started = False
    for line in txt.split("\n"):
        line = line.rstrip()
        if not line.startswith("!"):
            pass
        if line.startswith("!"):
            head = [clean(x) for x in line.lstrip("!").split("!!")]
            started = True
            continue
        if not started:
            continue
        if line.startswith("|}"):
            break
        if line.startswith("|-"):
            continue
        if line.startswith("|"):
            cells = line.lstrip("|").split("||")
            out.append([clean(x) for x in cells])
    return head, out


def table_blocks(txt):
    """返回 [(caption, head, rows)]"""
    blocks = []
    cur = []
    cap = ""
    for line in txt.split("\n"):
        if line.startswith("|+"):
            cap = clean(line[2:])
        cur.append(line)
        if line.startswith("|}"):
            head, rows = rows_of("\n".join(cur))
            blocks.append((cap, head, rows))
            cur = []
            cap = ""
    return blocks


def main():
    txt = open(SRC, encoding="utf-8").read()
    blocks = table_blocks(txt)
    for cap, head, rows in blocks:
        print("%-42s head=%s rows=%d" % (cap[:42], head, len(rows)))

    chest, mon, spirit, sea = [], [], [], []
    for cap, head, rows in blocks:
        if "宝箱" in cap:
            for r in rows:
                if len(r) < 3:
                    continue
                chest.append([r[0], r[1], r[2]])
        elif "魔物分布" in cap:
            for r in rows:
                if len(r) < 4:
                    continue
                mon.append([r[0], r[1], r[2], r[3]])
        elif ("精灵" in cap or "石树" in cap) and "分布" in cap:
            for r in rows:
                if len(r) < 9:
                    continue
                spirit.append([r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]])
        elif "海怪" in cap:
            for r in rows:
                if len(r) < 3:
                    continue
                sea.append([r[0], r[1], r[2]])

    # ---- 断言：不合规就别写文件 ----
    assert chest and mon and spirit and sea, "四张表有一张没解析出来"
    for r in chest:
        assert r[0] and r[2], "宝箱行缺地点或内容: %r" % (r,)
    for r in mon:
        assert any(c.isdigit() for c in r[1]) or r[1] in ("-", "?"), "平均LV 不是数字: %r" % (r,)
    for r in spirit:
        for _i in (2, 3, 8):
            assert r[_i] == "" or r[_i] == "-" or r[_i].isdigit(), "精灵石数值列异常: %r" % (r,)
    for r in sea:
        assert r[2].endswith("%"), "海怪概率不是百分比: %r" % (r,)

    data = {
        "chest": chest,
        "mon": mon,
        "spirit": spirit,
        "sea": sea,
    }
    js = ["/* 符文工房 海洋：地图分布（宝箱陶罐 / 魔物 / 精灵石树 / 海怪）",
          "   源：biligame 符文工厂 wiki「RFOMAP」，法米通攻略书地图整理。",
          "   字段：",
          "     RFO_MAP_CHEST  [地点, 容器, 内容]",
          "     RFO_MAP_MON    [地点, 平均Lv, 魔物, 稀有魔物]",
          "     RFO_MAP_SPIRIT [地点, 场所, 精灵量, ±%, 黄%, 红%, 绿%, 蓝%, 再次采集]",
          "     RFO_MAP_SEA    [海域编号, 海怪, 概率]",
          "   清洗口径：[[]] 取显示名、<br> 转顿号，数值原样照录（含源表的 - 与空缺）。 */",
          ""]
    for key, name in [("chest", "RFO_MAP_CHEST"), ("mon", "RFO_MAP_MON"),
                      ("spirit", "RFO_MAP_SPIRIT"), ("sea", "RFO_MAP_SEA")]:
        js.append("const %s = %s;" % (name, json.dumps(data[key], ensure_ascii=False, separators=(",", ":"))))
        js.append("")
    open(OUT_JS, "w", encoding="utf-8", newline="\n").write("\n".join(js))
    print("\n写出 %s：宝箱 %d / 魔物 %d / 精灵石 %d / 海怪 %d"
          % (OUT_JS, len(chest), len(mon), len(spirit), len(sea)))


if __name__ == "__main__":
    main()
