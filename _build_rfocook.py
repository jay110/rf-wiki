#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame wiki 构建《符文工房 海洋》料理与药学配方数据。

海洋汉化正在进行，译名以 wiki 中文显示名为准（[[日文页名|中文显示名]] 取显示名），
再用汉化名词表 js/cnterm.js 的 CN_RFO（日文→中文）覆盖能查到的词条。

源页：
    RFOrecipecook      181 条，6 类厨具（厨房/平底锅/锅子/烤箱/蒸笼/搅拌机）
    字段：中文!!料理lv!!配方书!!材料1..6!!持续时间!!HP恢复!!RP恢复!!特殊效果!!买价!!入手!!卖价
    RFOrecipepharmacy   16 条（药品 7 + 永久强化道具 9）
    字段：中文!!药学技能!!配方书!!总材料!!效果时间!!HP恢复!!RP恢复!!特殊效果!!买价!!卖价!!入手

产物 js/rfocook.js：
    RFO_COOK  [厨具, 名字, 料理lv, 配方书, [材料], 持续时间, HP, RP, 特殊效果, 买价, 入手, 卖价]
    RFO_MED   [类别, 名字, 技能lv, 配方书, [材料], 效果时间, HP, RP, 特殊效果, 买价, 卖价, 入手]
    RFO_BOOK  [配方书, 类别, 配方数, 等级范围]
    RFO_COOKNOTE
"""
import io
import json
import re

OUT = "js/rfocook.js"

# ---------- 汉化名词表（日文 → 中文） ----------
def load_cn():
    s = io.open("js/cnterm.js", encoding="utf-8").read()
    out = {}
    m = re.search(r"const CN_RFO = (\[.*?\n\]);", s, re.S)
    if m:
        for cat, jp, cn in re.findall(r'^\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"', m.group(1), re.M):
            if jp and cn:
                out.setdefault(jp.strip(), cn.strip())
    return out


CN = load_cn()
print("海洋汉化词条", len(CN))

# 站内既有用词（与汉化名词表用字不同时，以站内已有页面为准，避免同一地点两套名字）
SITE = {
    "铺石庭院": "石床庭院",
    "沉船": "沉没船",
}

RE_LINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_TAG = re.compile(r"<[^>]{1,40}>")


def clean(v):
    """把 wiki 单元格转成纯文本；返回 None 表示空。"""
    if v is None:
        return None
    v = v.strip()
    v = v.replace("、<br>", "、").replace("、<br/>", "、").replace("、<br />", "、")
    v = v.replace("<br>", "、").replace("<br/>", "、").replace("<br />", "、")
    v = RE_TAG.sub("", v)

    def sub(m):
        page = m.group(1).strip()
        disp = (m.group(2) or m.group(1)).strip()
        if page in CN:
            return CN[page]
        return disp

    v = RE_LINK.sub(sub, v)
    v = v.replace("&nbsp;", " ").strip()
    for a, b in SITE.items():
        v = v.replace(a, b)
    v = re.sub(r"[、，]{2,}", "、", v)
    v = v.strip("、")
    if v in ("—", "-", "", "－"):
        return None
    return v


def num(v):
    v = clean(v)
    if v is None:
        return None
    try:
        return int(v.replace(",", ""))
    except ValueError:
        return None


def cells(line):
    b = line[1:]
    if b.startswith("|"):
        b = b[1:]
    return [x.strip() for x in b.split("||")]


def read_rows(path):
    s = io.open(path, encoding="utf-8").read()
    sec, out = None, []
    for line in s.split("\n"):
        m = re.match(r"^==+ ?(.+?) ?==+$", line)
        if m:
            sec = m.group(1).strip()
            continue
        if sec in ("参考与注释",):
            continue
        if line.startswith("|") and "||" in line and not line.startswith("|-"):
            out.append((sec or "", line))
    return out


def is_book(v):
    return bool(v) and ("行家" in v or "奥义" in v)


# ---------- 料理 ----------
cook = []
for sec, line in read_rows("_RFOrecipecook.txt"):
    c = cells(line)
    if len(c) < 16:
        continue
    name = clean(c[0])
    if not name:
        continue
    mats = [clean(x) for x in c[3:9]]
    # wiki 原表偶有 #N/A 占位（如吐司的材料2），视为空
    mats = [m for m in mats if m and m != "#N/A"]
    cook.append([
        sec,                 # 0 厨具
        name,                # 1 名字
        num(c[1]),           # 2 料理lv
        clean(c[2]),         # 3 配方书
        mats,                # 4 材料
        num(c[9]),           # 5 持续时间
        num(c[10]),          # 6 HP
        num(c[11]),          # 7 RP
        clean(c[12]),        # 8 特殊效果
        num(c[13]),          # 9 买价
        clean(c[14]),        # 10 入手
        num(c[15]),          # 11 卖价
    ])

print("料理", len(cook))

# ---------- 药学 ----------
med = []
for sec, line in read_rows("_RFOrecipepharmacy.txt"):
    c = cells(line)
    if len(c) < 11:
        continue
    name = clean(c[0])
    if not name:
        continue
    book = clean(c[2])
    raw_mat = clean(c[3])
    permanent = (raw_mat == "无法制作") or (clean(c[4]) == "永久")
    mats = [] if permanent else [m for m in re.split(r"[+＋]", raw_mat or "") if m]
    eff = clean(c[7])
    if permanent and book and not is_book(book):
        # 补品类的效果被填在「配方书」列（力量+1 / 体力+1 / 智力+1）
        eff = book + ("、" + eff if eff else "")
        book = None
    med.append([
        "永久强化" if permanent else "药品",   # 0 类别
        name,                                 # 1 名字
        num(c[1]),                            # 2 技能lv
        book,                                 # 3 配方书
        mats,                                 # 4 材料
        clean(c[4]),                          # 5 效果时间
        num(c[5]),                            # 6 HP
        num(c[6]),                            # 7 RP
        eff,                                  # 8 特殊效果
        num(c[8]),                            # 9 买价
        num(c[9]),                            # 10 卖价
        clean(c[10]),                         # 11 入手
    ])

print("药学", len(med), "药品", sum(1 for x in med if x[0] == "药品"),
      "永久强化", sum(1 for x in med if x[0] == "永久强化"))

# ---------- 配方书汇总（只统计真正的配方书） ----------
books = {}
for r in cook + med:
    bk = r[3]
    if not bk or not is_book(bk):
        continue
    b = books.setdefault(bk, {"cat": set(), "n": 0, "lv": []})
    b["cat"].add(r[0])
    b["n"] += 1
    if isinstance(r[2], int):
        b["lv"].append(r[2])

ORDER = ["厨房", "平底锅", "锅子", "烤箱", "蒸笼", "搅拌机", "药品", "永久强化"]


def ordof(x):
    return ORDER.index(x) if x in ORDER else 99


book_rows = []
for bk, b in books.items():
    cat = sorted(b["cat"], key=ordof)[0]
    lv = b["lv"]
    rng = ("Lv%d–%d" % (min(lv), max(lv))) if lv else "—"
    book_rows.append([bk, cat, b["n"], rng])
book_rows.sort(key=lambda x: (ordof(x[1]), -x[2], x[0]))

print("配方书", len(book_rows))

cook.sort(key=lambda x: (ordof(x[0]), -(x[2] or 0), x[1]))
med.sort(key=lambda x: (ordof(x[0]), -(x[2] or 0), x[1]))

NOTE = [
    "海洋（Rune Factory: Oceans）的料理按<b>六类厨具</b>划分：厨房、平底锅、锅子、烤箱、蒸笼、搅拌机。",
    "「厨房」是这个分类下<b>不开火、直接组合</b>的菜式（生鱼片、寿司、饭团等），对应别作的「料理台」。",
    "本作配方<b>必须先取得配方书</b>才会出现在料理列表里。配方书分初级／中级／上级三档，另有每类一本「奥义」收录最高等级的那几道菜；<b>配方书</b>表列出每本书涵盖多少配方与等级区间。",
    "<b>持续时间</b>为该料理增益的维持分钟数。<b>特殊效果</b>里「麻痹抗性+100%」表示进食后一段时间内完全免疫该异常。",
    "药学部分除 7 种可调制药品外，另有 9 种<b>永久强化道具</b>（火/水/风/地/光/暗元素与力量/体力/智力补品），<b>无法制作</b>，只能从宝箱、陶壶、不明物品鉴定与竞技场奖励中获得，效果永久保留。",
    "译名以海洋汉化名词表为准；配方书名（如「厨房行家・初级」「厨房的奥义」）由日文页名直译，可能与汉化版实际用字不同。",
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
    "// 《符文工房 海洋》料理与药学配方数据（自动生成，勿手改）",
    "// 来源：biligame 符文工房 wiki RFOrecipecook / RFOrecipepharmacy",
    "// RFO_COOK  [厨具, 名字, 料理lv, 配方书, [材料], 持续时间, HP, RP, 特殊效果, 买价, 入手, 卖价]",
    "// RFO_MED   [类别, 名字, 技能lv, 配方书, [材料], 效果时间, HP, RP, 特殊效果, 买价, 卖价, 入手]",
    "// RFO_BOOK  [配方书, 类别, 配方数, 等级范围]",
    block("RFO_COOK", cook),
    block("RFO_MED", med),
    block("RFO_BOOK", book_rows),
    block("RFO_COOKNOTE", NOTE),
])

io.open(OUT, "w", encoding="utf-8", newline="\n").write(body + "\n")
print("写出", OUT)

# ---------- 自检 ----------
pat = re.compile(r"[぀-ゟ゠-ヿ]")
bad = set()


def go(v):
    if isinstance(v, str):
        if pat.search(v.replace("\u30fb", "")):
            bad.add(v)
    elif isinstance(v, list):
        for x in v:
            go(x)


for r in cook + med:
    go(r)
if bad:
    print("!! 假名残留", len(bad), list(bad)[:20])
