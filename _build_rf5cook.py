#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame wiki 构建《符文工房5》料理与药品配方数据。

源页：
    RF5recipecook_0       7 类厨具，184 条配方
    RF5药学配方_0         药物 / 农药，46 条配方
字段均为：名字 !! 技能要求 !! 材料1..6 !! 特效总

产物 js/rf5cook.js：
    RF5_COOK  [厨具分类, 料理名, 技能Lv, [材料...], 特效]
    RF5_MED   [类别, 药品名, 技能Lv, [材料...], 特效]
    RF5_COOKNOTE
"""
import io
import json
import re

OUT = "js/rf5cook.js"

RE_LINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_TAG = re.compile(r"<[^>]{1,40}>")


def clean(v):
    if v is None:
        return None
    v = v.strip()
    v = v.replace("<br>", "、").replace("<br/>", "、").replace("<br />", "、")
    v = RE_TAG.sub("", v)
    v = RE_LINK.sub(lambda m: (m.group(2) or m.group(1)).strip(), v)
    v = v.replace("'''", "").replace("''", "")
    v = v.strip().strip("、").strip()
    if v in ("-", "—", "–", "", "?"):
        return None
    # 特效末尾多余的逗号
    if v.endswith("，") or v.endswith(","):
        v = v[:-1]
    return v


def num(v):
    if v is None:
        return None
    s = str(v).strip()
    return int(s) if re.fullmatch(r"\d+", s) else v


def parse(path, kind_default):
    """返回 [(分类, [名字, 技能Lv, [材料], 特效]), ...]"""
    s = io.open(path, encoding="utf-8").read()
    cur = kind_default
    out = []
    for l in s.split("\n"):
        m = re.match(r"^==+ ?(.+?) ?==+$", l)
        if m:
            cur = m.group(1).strip()
            continue
        if not l.startswith("|") or "||" not in l:
            continue
        if l.startswith("|-") or l.startswith("|}") or l.startswith("|+"):
            continue
        body = l[1:]
        if body.startswith("|"):
            body = body[1:]
        c = [x.strip() for x in body.split("||")]
        if len(c) < 9:
            continue
        name = clean(c[0])
        if not name:
            continue
        lv = num(clean(c[1]))
        mats = [clean(x) for x in c[2:8]]
        mats = [x for x in mats if x]
        fx = clean(c[8])
        out.append((cur, [name, lv, mats, fx]))
    return out


def jstr(x):
    return json.dumps(x, ensure_ascii=False)


cook = parse("_rf5cook0.txt", "徒手料理")
med = parse("_rf5med0.txt", "药物")

# 分类内按技能 Lv 升序
ORDER_C = ["徒手料理", "刀工料理", "平底锅料理", "搅拌机料理", "火锅料理", "烤箱料理", "蒸笼"]


def sortkey(item):
    kind, r = item
    ki = ORDER_C.index(kind) if kind in ORDER_C else 99
    return (ki, r[1] if isinstance(r[1], int) else 0, r[0])


cook.sort(key=sortkey)
med.sort(key=lambda x: (x[0] != "药物", x[1][1] if isinstance(x[1][1], int) else 0, x[1][0]))

rows_c = [[k] + r for k, r in cook]
rows_m = [[k] + r for k, r in med]

NOTE = (
    "本节配方取自 biligame 符文工厂 wiki 的「RF5recipecook」与「RF5药学配方」两张子表，"
    "译名用官方简中。<b>「技能要求」是做出这道菜所需的料理／药学等级</b>，达不到就做不出来；"
    "<b>同一道菜可能有好几行</b>——那是同一道菜在不同等级下可用不同材料做"
    "（例如腌芜菁 Lv4 用芜菁、Lv12 用樱芜菁），成品特效相同，<b>高等级配方通常更省料</b>。"
    "特效列里「持续时间」指加成生效时长；百分比加成与固定值加成会叠加计算。"
)

head = """/* 符文工房5（RF5）料理与药品配方
   RF5_COOK  [厨具分类, 料理名, 技能Lv, [材料], 特效]   %(cook)d 条（%(ck)d 种厨具）
   RF5_MED   [类别, 药品名, 技能Lv, [材料], 特效]       %(med)d 条
   取自 biligame 符文工厂 wiki；按厨具分类、技能等级排序。 */
""" % dict(cook=len(rows_c), ck=len(set(k for k, _ in cook)), med=len(rows_m))


def block(var, data):
    return "const %s = [\n%s];\n" % (var, "".join("    %s,\n" % jstr(r) for r in data))


body = (head + "\n" + block("RF5_COOK", rows_c) + "\n" + block("RF5_MED", rows_m) + "\n"
        + "const RF5_COOKNOTE = %s;\n" % jstr(NOTE))
io.open(OUT, "w", encoding="utf-8", newline="\n").write(body)

print("料理 %d 条 / 药品 %d 条" % (len(rows_c), len(rows_m)))
from collections import Counter
for k, v in Counter(k for k, _ in cook).most_common():
    sub = [r for kk, r in cook if kk == k]
    lvs = [r[1] for r in sub if isinstance(r[1], int)]
    print("  %-8s %3d 条  Lv %d–%d" % (k, v, min(lvs), max(lvs)))
for k, v in Counter(k for k, _ in med).most_common():
    print("  %-8s %3d 条" % (k, v))
print("样例:", jstr(rows_c[0]))
print("药样例:", jstr(rows_m[0]))
