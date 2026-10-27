#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame wiki 构建《符文工房4》料理与药学配方数据（官方简中·豪华版译名）。

源页：
    RF4srecipecook        170 条，17 列
        类型!!名字!!配方等级!!配方1..6!!卖价!!HP恢复!!RP恢复!!RP上限!!力量加成!!智力加成!!攻击特效!!属性抗性!!防御特效
    RF4srecipepharmacy    46 条
        农药：名字!!制造等级!!材料1..3!!其它特效
        药剂：类型!!名字!!制造等级!!材料1..6!!HP恢复!!RP恢复!!其它特效!!持续时间

产物 js/rf4cook.js：
    RF4_COOK  [类型, 名字, 配方Lv, [材料], 卖价, HP, RP, RP上限, 力量, 智力, 体力, 其它特效]
    RF4_MED   [类别, 名字, 制造Lv, [材料], 效果, 持续时间]
    RF4_COOKNOTE
"""
import io
import json
import re

OUT = "js/rf4cook.js"

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
    if v in ("-", "—", "–", "", "?", "—，"):
        return None
    return v


def num(v):
    if v is None:
        return None
    s = str(v).replace(",", "").strip()
    return int(s) if re.fullmatch(r"\d+", s) else v


def cells(l):
    b = l[1:]
    if b.startswith("|"):
        b = b[1:]
    return [x.strip() for x in b.split("||")]


def datarows(path):
    s = io.open(path, encoding="utf-8").read()
    out = []
    for l in s.split("\n"):
        if not l.startswith("|") or "||" not in l:
            continue
        if l.startswith("|-") or l.startswith("|}") or l.startswith("|+"):
            continue
        out.append(cells(l))
    return out


def strip_prefix(v, *prefixes):
    """把「HP恢复+220」压成「+220」，表头已写明含义。"""
    if not v:
        return None
    for p in prefixes:
        if v.startswith(p):
            return v[len(p):].strip()
    return v


ORDER = ["徒手", "刀工", "平底锅", "搅拌机", "锅", "烤箱", "蒸笼"]

cook = []
for c in datarows("_rf4cook.txt"):
    if len(c) < 17:
        continue
    kind = clean(c[0])
    name = clean(c[1])
    if not name:
        continue
    lv = num(clean(c[2]))
    mats = [x for x in (clean(v) for v in c[3:9]) if x]
    price = num(clean(c[9]))
    hp = strip_prefix(clean(c[10]), "HP恢复")
    rp = strip_prefix(clean(c[11]), "Rp恢复", "RP恢复")
    rmax = strip_prefix(clean(c[12]), "Rp上限", "RP上限")
    strb = strip_prefix(clean(c[13]), "力量")
    intb = strip_prefix(clean(c[14]), "智力")
    atk = clean(c[15])
    res = clean(c[16])
    vit = clean(c[17]) if len(c) > 17 else None
    if vit:
        vit = re.sub(r"体力\s*\+", "+", vit)
    extra = "；".join([x for x in [rmax and ("RP上限" + rmax), atk, res] if x]) or None
    cook.append([kind, name, lv, mats, price, hp, rp, rmax, strb, intb, vit, extra])

med = []
for c in datarows("_rf4med.txt"):
    if len(c) < 4:
        continue
    if len(c) >= 12:  # 药剂
        kind = clean(c[0]) or "药剂"
        name = clean(c[1])
        lv = num(clean(c[2]))
        mats = [x for x in (clean(v) for v in c[3:9]) if x]
        hp = clean(c[9])
        rp = clean(c[10])
        fx = clean(c[11])
        dur = clean(c[12]) if len(c) > 12 else None
        parts = []
        if hp and hp != "—":
            parts.append("HP+" + hp)
        if rp and rp != "—":
            parts.append("RP+" + rp)
        if fx:
            parts.append(fx)
        med.append([kind, name, lv, mats, "；".join(parts) or None, dur])
    else:  # 农药
        name = clean(c[0])
        lv = num(clean(c[1]))
        mats = [x for x in (clean(v) for v in c[2:5]) if x]
        fx = clean(c[5]) if len(c) > 5 else None
        med.append(["农药", name, lv, mats, fx, None])


def ordof(k):
    return ORDER.index(k) if k in ORDER else 99


cook.sort(key=lambda x: (ordof(x[0]), x[2] if isinstance(x[2], int) else 0, x[1]))
med.sort(key=lambda x: (x[0] != "药剂", x[2] if isinstance(x[2], int) else 0, x[1]))

NOTE = (
    "本节配方取自 biligame 符文工厂 wiki 的「RF4srecipecook」与「RF4srecipepharmacy」，"
    "译名用<b>《符文工房4 豪华版》官方简中</b>。两张效果表里的数值是<b>该料理／药品本身的成品值</b>，"
    "「HP／RP」列写「+220」即回复 220 点；带百分比的（如「+5000，100%」）表示<b>固定值 + 最大值的百分比</b>一并回复。"
    "力量／智力／体力同理——<b>「+60，3%」是固定 60 点再加 3% 上限</b>，持续 12 小时。"
    "卖价是基础售价，会随成品等级提高。<b>同一道菜出现多行</b>是不同配方等级下可换用更高级材料，成品效果相同。"
)


def jstr(x):
    return json.dumps(x, ensure_ascii=False)


head = """/* 符文工房4（RF4 豪华版）料理与药学配方
   RF4_COOK  [类型, 名字, 配方Lv, [材料], 卖价, HP, RP, RP上限, 力量, 智力, 体力, 其它特效]  %(cook)d 条
   RF4_MED   [类别, 名字, 制造Lv, [材料], 效果, 持续时间]                                %(med)d 条
   取自 biligame 符文工厂 wiki，官方简中译名；按厨具类型、配方等级排序。 */
""" % dict(cook=len(cook), med=len(med))


def block(var, data):
    return "const %s = [\n%s];\n" % (var, "".join("    %s,\n" % jstr(r) for r in data))


body = (head + "\n" + block("RF4_COOK", cook) + "\n" + block("RF4_MED", med) + "\n"
        + "const RF4_COOKNOTE = %s;\n" % jstr(NOTE))
io.open(OUT, "w", encoding="utf-8", newline="\n").write(body)

from collections import Counter
print("料理 %d 条 / 药学 %d 条" % (len(cook), len(med)))
for k, v in Counter(x[0] for x in cook).most_common():
    sub = [x for x in cook if x[0] == k]
    lvs = [x[2] for x in sub if isinstance(x[2], int)]
    print("  %-5s %3d 条  Lv %d–%d" % (k, v, min(lvs), max(lvs)))
for k, v in Counter(x[0] for x in med).most_common():
    print("  %-5s %3d 条" % (k, v))
print("料理样例:", jstr(cook[0]))
print("效果样例:", jstr([x for x in cook if x[11]][0]))
print("药剂样例:", jstr(med[0]))
print("农药样例:", jstr([x for x in med if x[0] == '农药'][0]))
