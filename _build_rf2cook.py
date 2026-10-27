#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame wiki 构建《符文工房2》料理与药学配方数据。

RF2 没有汉化定稿名词表可用，译名直接取 wiki 的中文显示名，并在页面注明。

源页：
    RF2recipecook      207 条，8 节（徒手/菜刀/平底锅/锅子/烤箱/搅拌器/蒸笼/其它）
    多数节：中文名!!配方等级!!材料1..6!!配方课程!!使用总效果!!店铺!!卖价!!买价!!其它来源
    搅拌器节：种类!!中文名!!HP恢复!!RP恢复!!力量!!智力!!其它效果!!持续分!!配方等级!!
              总材料!!配方课程!!店铺!!卖价!!买价!!其它来源
    RF2recipepharmacy   27 条，字段同多数节
    注意：wiki 的「烤箱」节是「搅拌器」表的一份重复副本（17 条果汁类完全一致），
          真正的烤箱菜（披萨／蛋糕／曲奇／苹果派／奶油烤菜）被并进了「锅子」节，
          构建时剔除烤箱节，避免重复计数。

产物 js/rf2cook.js：
    RF2_COOK / RF2_MED
        [类别, 名字, 配方等级, [材料], 配方课程, 使用总效果, 店铺, 卖价, 买价, 其它来源]
    RF2_BOOK  [配方课程, 类别, 配方数, 等级范围]
    RF2_COOKNOTE
"""
import io
import json
import re

OUT = "js/rf2cook.js"

RE_LINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_TAG = re.compile(r"<[^>]{1,40}>")
RE_KANA = re.compile(r"[぀-ゟ゠-ヿ]")


def clean(v):
    if v is None:
        return None
    v = v.strip()
    # wiki 偶有 [[页名]|显示名] 的错写
    v = re.sub(r"\[\[([^\]|]+)\]\|([^\]]+)\]", r"[[\1|\2]]", v)
    v = v.replace("、<br>", "、").replace("、<br/>", "、").replace("、<br />", "、")
    v = v.replace("<br>", "、").replace("<br/>", "、").replace("<br />", "、")
    v = RE_TAG.sub("", v)
    v = RE_LINK.sub(lambda m: (m.group(2) or m.group(1)).strip(), v)
    v = v.replace("&nbsp;", " ").strip()
    v = re.sub(r"[、，]{2,}", "、", v).strip("、")
    if v in ("—", "-", "", "－", "#N/A"):
        return None
    return v


def num(v):
    v = clean(v)
    if v is None:
        return None
    try:
        return int(v.replace(",", ""))
    except ValueError:
        return v


def cells(line):
    b = line[1:]
    if b.startswith("|"):
        b = b[1:]
    return [x.strip() for x in b.split("||")]


def read_rows(path, skip=("简介", "参考与注释", "烤箱")):
    s = io.open(path, encoding="utf-8").read()
    sec, out = None, []
    for line in s.split("\n"):
        m = re.match(r"^==+ ?(.+?) ?==+$", line)
        if m:
            sec = RE_LINK.sub(lambda x: (x.group(2) or x.group(1)), m.group(1)).strip()
            continue
        if sec is None or sec in skip:
            continue
        if line.startswith("|") and "||" in line and not line.startswith("|-"):
            out.append((sec, line))
    return out


def mats_of(v):
    """材料串 → 列表；支持 [[a]]+[[b]] 与独立单元格两种写法。"""
    if not v:
        return []
    parts = [x for x in re.split(r"[+＋]", v) if x.strip()]
    return [m for m in (clean(p) for p in parts) if m]


def parse(sec, cells_, wide):
    """wide=True 表示搅拌器节那种 15 列布局。"""
    c = cells_
    if wide:
        name = clean(c[1])
        lv = num(c[8])
        mats = mats_of(c[9])
        course = clean(c[10])
        eff = []
        for label, idx in (("HP恢复", 2), ("RP恢复", 3), ("力量", 4), ("智力", 5)):
            v = clean(c[idx])
            if v not in (None, "-"):
                eff.append("%s%s" % (label, v))
        other = clean(c[6])
        if other:
            eff.append(other)
        dur = clean(c[7])
        if dur:
            eff.append("持续时间%s分" % dur)
        eff = "，".join(eff) + "。"
        shop = clean(c[11])
        sell, buy = num(c[12]), num(c[13])
        src = clean(c[14])
    else:
        name = clean(c[0])
        lv = num(c[1])
        mats = [m for m in (clean(x) for x in c[2:8]) if m]
        course = clean(c[8])
        eff = clean(c[9])
        shop = clean(c[10])
        sell, buy = num(c[11]), num(c[12])
        src = clean(c[13])
    if not name:
        return None
    return [sec, name, lv, mats, course, eff, shop, sell, buy, src]


cook = []
for sec, line in read_rows("_RF2recipecook.txt"):
    c = cells(line)
    r = parse(sec, c, len(c) >= 15)
    if r:
        cook.append(r)

med = []
for sec, line in read_rows("_RF2recipepharmacy.txt"):
    c = cells(line)
    r = parse("药学", c, len(c) >= 15)
    if r:
        med.append(r)

print("料理", len(cook), "药学", len(med))

# ---------- 配方课程汇总 ----------
books = {}
for r in cook + med:
    bk = r[4]
    if not bk:
        continue
    b = books.setdefault(bk, {"cat": set(), "n": 0, "lv": []})
    b["cat"].add(r[0])
    b["n"] += 1
    if isinstance(r[2], int):
        b["lv"].append(r[2])

ORDER = ["徒手", "菜刀", "平底锅", "锅子", "搅拌器", "蒸笼", "其它", "药学"]


def ordof(x):
    return ORDER.index(x) if x in ORDER else 99


book_rows = []
for bk, b in books.items():
    cat = sorted(b["cat"], key=ordof)[0]
    lv = b["lv"]
    book_rows.append([bk, cat, b["n"], ("Lv%d–%d" % (min(lv), max(lv))) if lv else "—"])
book_rows.sort(key=lambda x: (ordof(x[1]), -x[2], x[0]))
print("配方课程", len(book_rows))

cook.sort(key=lambda x: (ordof(x[0]), -(x[2] if isinstance(x[2], int) else -1), x[1]))
med.sort(key=lambda x: (-(x[2] if isinstance(x[2], int) else -1), x[1]))

NOTE = [
    "《符文工房2》的料理按<b>六类厨具</b>分：徒手、菜刀、平底锅、锅子、搅拌器、蒸笼；平底锅 51 条最多，蒸笼 11 条最少。",
    "<b>烤箱菜没有单列</b>：披萨、海鲜披萨、多利亚饭、奶油烤菜、曲奇饼干、蛋糕、巧克力蛋糕、奶酪蛋糕、苹果派、吐司等，原表把它们并进了「锅子」节，本页沿用该归类，共 46 条。",
    "另有 <b>「其它」24 条</b>——这些<b>没有配方</b>，是在杂货店直接买的成品（米饭、巧克力、红酒、艾丽草等），页面里单列一类。",
    "这一作的配方<b>不是买书、而是在阿尔瓦纳学园上课学</b>——「配方课程」列就是课程名（如「初步料理♪」「搅拌机的初步♪」）。没上过课，配方不会出现。",
    "药学里几条高阶配方（生命果冻、蛋・白・质、智力补品、心灵饮料、超级营养药、友情糖浆、ZOKKON）的「课程」列写的是<b>石像名</b>——在遗迹里参拜对应石像才能学会，不是上课。",
    "效果是<b>一整串写在一起</b>的（HP／RP 回复、HP 上限、力量、智力、解除异常、持续时间），按原表直录，靠搜索找关键词。",
    "卖价与买价差一倍是这个 wiki 表的记录方式；标「无法交易」的药品只能自己做出来，店里不买卖。",
    "译名说明：RF2 的译名取自 biligame wiki 的中文写法，<b>未经汉化定稿名词表校准</b>，可能与民间汉化版用字不同。",
]


def js(v):
    return json.dumps(v, ensure_ascii=False)


def block(var, rows):
    out = ["const %s = [" % var]
    for r in rows:
        out.append("    " + js(r) + ",")
    out.append("];")
    return "\n".join(out)


body = "\n\n".join([
    "// 《符文工房2》料理与药学配方数据（自动生成，勿手改）",
    "// 来源：biligame 符文工房 wiki RF2recipecook / RF2recipepharmacy",
    "// 元组：[类别, 名字, 配方等级, [材料], 配方课程, 使用总效果, 店铺, 卖价, 买价, 其它来源]",
    "// RF2_BOOK  [配方课程, 类别, 配方数, 等级范围]",
    block("RF2_COOK", cook),
    block("RF2_MED", med),
    block("RF2_BOOK", book_rows),
    block("RF2_COOKNOTE", NOTE),
])

io.open(OUT, "w", encoding="utf-8", newline="\n").write(body + "\n")
print("写出", OUT)

bad = set()


def go(v):
    if isinstance(v, str):
        if RE_KANA.search(v.replace("\u30fb", "")):
            bad.add(v)
    elif isinstance(v, list):
        for x in v:
            go(x)


for r in cook + med:
    go(r)
if bad:
    print("!! 假名残留", len(bad), list(bad)[:30])
