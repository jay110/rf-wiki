#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""RF5 魔物抗性三表 -> js/fx5.js

源：biligame 符文工厂 wiki 的 RF5monsterresist 页，正文只有三行模板引用：
    {{:RF5怪物抗性表_0}} / {{:RF5怪物异常抗性表_0}} / {{:RF5怪物暴击眩晕吹飞抗性_0}}
三张表的 wikitext 已另存在 _snap/。三表行序一致（同一只怪同一行号），
只有一处名字写法不同：
    RF5怪物抗性表_0   巨型奥德姆拉(废案换皮奥德姆拉)
    RF5怪物异常抗性表_0 巨型奥德姆拉(废案奥德姆拉)
    暴击表             巨型奥德姆拉(废案奥德姆拉)
故按行号对齐取数，属性表沿用属性表自己的名字，差异在页面上点名。

负值在源表写作 <font color=blue>-</font>150%（蓝字负号，即弱点）。
本脚本只取数字与符号，颜色交给前端。
"""
import json
import os
import re

SNAP = "G:/wit_tools/work/RF_WIKI/_snap"
OUT = "G:/wit_tools/work/RF_WIKI/js/fx5.js"

FILES = [
    ("elem", "RF5怪物抗性表_0", 9),
    ("ail", "RF5怪物异常抗性表_0", 9),
    ("crit", "RF5怪物暴击眩晕吹飞抗性_0", 7),
]


def parse(fn, ncol):
    txt = open(os.path.join(SNAP, fn + ".txt"), encoding="utf-8").read()
    head = None
    rows = []
    for line in txt.split("\n"):
        s = line
        if s.startswith("!") and head is None:
            head = [c.strip() for c in s.lstrip("!").split("!!")]
            continue
        if not s.startswith("|") or s.startswith("|-") or s.startswith("|}") or s.startswith("|+"):
            continue
        cells = [c.strip() for c in s.lstrip("|").split("||")]
        # 末行表格结束符「|}」会粘在最后一格后面，剥掉后可能留下空串
        if cells and cells[-1].endswith("}"):
            cells[-1] = cells[-1][:-1].strip()
        while cells and cells[-1] == "":
            cells.pop()
        assert len(cells) == ncol, (fn, len(cells), cells)
        rows.append(cells)
    return head, rows


def val(s):
    neg = "blue" in s
    m = re.search(r"(\d+)%", s)
    if not m:
        raise ValueError("无法解析数值: " + s)
    v = int(m.group(1))
    return -v if neg else v


data = {}
heads = {}
for key, fn, ncol in FILES:
    head, rows = parse(fn, ncol)
    assert head is not None and len(head) == ncol, (fn, head)
    heads[key] = head
    data[key] = [[r[0]] + [val(c) for c in r[1:]] for r in rows]

n = len(data["elem"])
assert len(data["ail"]) == n and len(data["crit"]) == n, "三表行数不一致"

# 名字差异点名（按行号比对）
diff = [(i + 1, data["elem"][i][0], data["ail"][i][0])
        for i in range(n) if data["elem"][i][0] != data["ail"][i][0]]

js = []
js.append("/* RF5 魔物抗性三表（属性抗性／异常抗性／暴击眩晕吹飞）")
js.append("   来源：biligame 符文工厂 wiki 的 RF5monsterresist 页所引三张表，")
js.append("   原始数据出自 therunefactory.fandom.com 论坛的 RF5 Datamine Spreadsheet（GentlemanBones）。")
js.append("   结构：[名字, 数值...]；负值＝弱点（源表以蓝字负号标注），0＝无抗性。")
js.append("   三表按行号一一对应，%d 行。由 _build_fx5.py 生成，勿手改。 */" % n)
js.append("")
js.append("const FX5 = {")
js.append("    elemHead: %s," % json.dumps(heads["elem"], ensure_ascii=False))
js.append("    ailHead: %s," % json.dumps(heads["ail"], ensure_ascii=False))
js.append("    critHead: %s," % json.dumps(heads["crit"], ensure_ascii=False))
for key in ("elem", "ail", "crit"):
    body = ",\n".join("        " + json.dumps(r, ensure_ascii=False) for r in data[key])
    js.append("    %s: [\n%s\n    ]," % (key, body))
js.append("};")
js.append("")

open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(js))
print("写出", OUT, os.path.getsize(OUT), "字节；行数", n)
print("名字差异：", diff)
