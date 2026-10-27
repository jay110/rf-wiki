#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame 符文工厂 wiki 的 RFOmonster 页构建《符文工房 海洋》魔物数值数据。

产物 js/rfomon.js：
    RFO_MON   基础数据  [名, LV, HP, 攻, 防, 魔攻, 魔防, EXP, 出现点]
    RFO_RES   抗性数据  [名, 攻火水地风光暗(6), 防火水地风光暗(6), 毒麻痹封印眩晕睡眠疲劳感冒吸血即死(9)]
    RFO_DROP  掉落概率  [名, [[物, 普通%, 高级%], ...], 出现点]
    RFO_CROP  农作物    [名, 自然育成, 巨大化率, [[作物, 好感度], ...], 毛刷次数, 出现点]
    RFO_PROD  生产物    [名, 毛刷次数, 产出物, 产出天数, 出现点]
    RFO_MONNOTE  脚注
"""
import io
import json
import re

SRC = "_rfomon_raw.txt"
OUT = "js/rfomon.js"

# ---------- wiki 文本清洗 ----------
RE_LINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_FONT = re.compile(r"</?font[^>]*>")
RE_TAG = re.compile(r"<[^>]{1,40}>")


def clean(v):
    """把一个 cell 洗成纯文本。"""
    if v is None:
        return None
    v = v.strip()
    v = RE_FONT.sub("", v)
    v = v.replace("<br>", "、").replace("<br/>", "、").replace("<br />", "、")
    v = RE_TAG.sub("", v)
    v = RE_LINK.sub(lambda m: (m.group(2) or m.group(1)).strip(), v)
    v = v.replace("'''", "").replace("''", "")
    # 楼层写法统一：1F -> 1层
    v = re.sub(r"(\d+)\s*F\b", r"\1层", v)
    v = re.sub(r"[、\s]{2,}", "、", v).strip("、 ").strip()
    if v in ("-", "—", "", "?"):
        return None
    return v


def num(v):
    if v is None:
        return None
    s = str(v).replace(",", "").strip()
    if re.fullmatch(r"-?\d+(\.\d+)?", s):
        f = float(s)
        return int(f) if f == int(f) else f
    return v


def get_sec(name):
    lines = io.open(SRC, encoding="utf-8").read().split("\n")
    secs = {}
    cur = None
    for l in lines:
        m = re.match(r"^==+ ?(.+?) ?==+$", l)
        if m:
            cur = m.group(1)
            secs[cur] = []
            continue
        if cur:
            secs[cur].append(l)
    return secs.get(name, [])


def rows_of(name):
    """取某节里的数据行，切成 cell 列表。"""
    out = []
    for l in get_sec(name):
        if not l.startswith("|"):
            continue
        if l.startswith("|-") or l.startswith("|}") or l.startswith("|+"):
            continue
        if "||" not in l:
            continue
        body = l[1:]
        if body.startswith("|"):
            body = body[1:]
        cells = [c.strip() for c in body.split("||")]
        out.append(cells)
    return out


def jstr(x):
    return json.dumps(x, ensure_ascii=False)


# ---------- 基础数据 ----------
mon = []
for c in rows_of("基础数据"):
    if len(c) < 9:
        continue
    mon.append([clean(c[0]), num(clean(c[1])), num(clean(c[2])), num(clean(c[3])),
                num(clean(c[4])), num(clean(c[5])), num(clean(c[6])), num(clean(c[7])),
                clean(c[8])])
# 去同名，保留先出现的
seen = set()
mon2 = []
for r in mon:
    if r[0] in seen:
        continue
    seen.add(r[0])
    mon2.append(r)
mon = mon2
mon.sort(key=lambda x: (-(x[1] if isinstance(x[1], (int, float)) else -1),
                        -(x[2] if isinstance(x[2], (int, float)) else -1)))
ORDER = {r[0]: i for i, r in enumerate(mon)}


def ordof(n):
    return ORDER.get(n, 9999)

# ---------- 抗性 ----------
res = []
seen = set()
for c in rows_of("抗性数据"):
    if len(c) < 22:
        continue
    n = clean(c[0])
    if not n or n in seen:
        continue
    seen.add(n)
    res.append([n] + [clean(x) for x in c[1:22]])
res.sort(key=lambda x: ordof(x[0]))

# ---------- 掉落 ----------
drop = []
seen = set()
for c in rows_of("掉落物"):
    if len(c) < 23:
        continue
    n = clean(c[0])
    if not n or n in seen:
        continue
    seen.add(n)
    items = []
    for i in range(7):
        nm = clean(c[1 + i * 3])
        if not nm:
            continue
        items.append([nm, num(clean(c[2 + i * 3])), num(clean(c[3 + i * 3]))])
    drop.append([n, items, clean(c[22])])
drop.sort(key=lambda x: ordof(x[0]))

# ---------- 农作物 ----------
crop = []
seen = set()
for c in rows_of("农作物"):
    if len(c) < 13:
        continue
    n = clean(c[0])
    if not n or n in seen:
        continue
    seen.add(n)
    cs = []
    for i in range(4):
        nm = clean(c[3 + i * 2])
        if not nm:
            continue
        cs.append([nm, num(clean(c[4 + i * 2]))])
    crop.append([n, clean(c[1]), num(clean(c[2])), cs, num(clean(c[11])), clean(c[12])])
crop.sort(key=lambda x: ordof(x[0]))

# ---------- 生产物 ----------
prod = []
seen = set()
for c in rows_of("生产物"):
    if len(c) < 5:
        continue
    n = clean(c[0])
    if not n or n in seen:
        continue
    seen.add(n)
    prod.append([n, num(clean(c[1])), clean(c[2]), num(clean(c[3])), clean(c[4])])

NOTE = (
    "本节数值全部取自 biligame 符文工厂 wiki 的「RFOmonster」页（含基础数据、抗性数据、"
    "掉落物、农作物、生产物五张子表）。原表里的 <b>〇</b> 表示该格<b>有此项</b>，"
    "<b>×</b> 表示<b>弱点（受到该属性伤害加倍）</b>，<b>-</b> 表示原表未记；"
    "掉落概率两列分别是<b>普通掉落率</b>与<b>带「高级」称号时的掉落率</b>，"
    "留「—」的是原表没给数值，<b>不代表不掉</b>。楼层写法已统一为「1层」，"
    "日文地名与魔物名按汉化版／站内定稿译名转写。"
)

# ---------- 输出 ----------
def block(var, data, indent=0):
    pad = " " * indent
    return "%sconst %s = [\n%s];\n" % (
        pad, var, "".join("    %s,\n" % jstr(r) for r in data))

head = """/* 符文工房 海洋（RFO）魔物数值
   RFO_MON   基础数据   [名, LV, HP, 攻, 防, 魔攻, 魔防, EXP, 出现点]           %(mon)d 条
   RFO_RES   抗性数据   [名, 攻火水地风光暗, 防火水地风光暗, 毒麻痹封印眩晕睡眠疲劳感冒吸血即死]  %(res)d 条
   RFO_DROP  掉落概率   [名, [[物, 普通%%, 高级%%], ...], 出现点]                %(drop)d 条
   RFO_CROP  农作物     [名, 自然育成, 巨大化率%%, [[作物, 好感度], ...], 毛刷次数, 出现点]  %(crop)d 条
   RFO_PROD  生产物     [名, 毛刷次数, 产出物, 产出天数, 出现点]                 %(prod)d 条
   取自 biligame 符文工厂 wiki「RFOmonster」页；基础数据按 LV、HP 降序排列。 */
""" % dict(mon=len(mon), res=len(res), drop=len(drop), crop=len(crop), prod=len(prod))

body = (head + "\n" + block("RFO_MON", mon) + "\n" + block("RFO_RES", res) + "\n"
        + block("RFO_DROP", drop) + "\n" + block("RFO_CROP", crop) + "\n"
        + block("RFO_PROD", prod) + "\n"
        + "const RFO_MONNOTE = %s;\n" % jstr(NOTE))

io.open(OUT, "w", encoding="utf-8", newline="\n").write(body)

print("基础数据 %d / 抗性 %d / 掉落 %d / 农作物 %d / 生产物 %d"
      % (len(mon), len(res), len(drop), len(crop), len(prod)))
lvs = [r[1] for r in mon if isinstance(r[1], int)]
print("LV 范围", min(lvs), "-", max(lvs))
hps = [r[2] for r in mon if isinstance(r[2], int)]
print("HP 范围", min(hps), "-", max(hps))
print("样例:", jstr(mon[0]), jstr(mon[-1]))
print("抗性样例:", jstr(res[0]))
print("掉落样例:", jstr(drop[0]))
print("农作物样例:", jstr(crop[1]))
print("生产物样例:", jstr(prod[0]))
