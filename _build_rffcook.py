#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame wiki 构建《符文工房 边境》料理与药学配方数据。

译名优先采用汉化版定稿：wiki 的链接页名是日文原名，先查 js/rffterm.js 的
CN_RFF_ITEM（日文→汉化译名），查不到才回退到 wiki 自己的中文显示名。

源页：
    RFFrecipecook        207 条，6 类厨具
    RFFrecipepharmacy     46 条
    字段：名字!!材料1..6!!全效果!!配方lv!!配方书!!买价!!卖价!!入手

产物 js/rffcook.js：
    RFF_COOK  [厨具, 名字, 配方lv, [材料], 全效果, 配方书, 买价, 卖价, 入手]
    RFF_COOKNOTE
"""
import io
import json
import re

OUT = "js/rffcook.js"

# ---------- 汉化定稿译名 ----------
def load_cn():
    s = io.open("js/rffterm.js", encoding="utf-8").read()
    out = {}
    for var in ("CN_RFF_ITEM", "CN_RFF_MISC", "CN_RFF_PLACE", "CN_RFF_PERSON"):
        m = re.search(r"const %s = (\[.*?\n\]);" % var, s, re.S)
        if not m:
            continue
        # 数组末尾有尾随逗号，json.loads 会报错，改为逐行取前两列
        for a, b in re.findall(r'^\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)"', m.group(1), re.M):
            if a and b:
                out.setdefault(a.strip(), b.strip())
    return out


CN = load_cn()
print("汉化定稿词条", len(CN))

# ---------- 配方书名（wiki 原表为日文，按字面直译） ----------
BOOK = {
    "板前ロード": "厨师之路",
    "明日のおかず１巻": "明日的配菜 第1卷",
    "明日のおかず２巻": "明日的配菜 第2卷",
    "明日のおかず最終巻": "明日的配菜 最终卷",
    "今夜は一工夫": "今夜下点功夫",
    "続！今夜は一工夫": "续·今夜下点功夫",
    "さらば！今夜は一工夫": "告别·今夜下点功夫",
    "食卓を変える！": "改变餐桌！",
    "もっと食卓を変える！": "更要改变餐桌！",
    "さらに食卓を変える！": "进一步改变餐桌！",
    "最速！簡単クッキング": "最快！简单烹饪",
    "挑戦！上級クッキング": "挑战！高级烹饪",
    "ミキサー活用法！": "搅拌机活用法！",
    "真・ミキサー活用法！": "真·搅拌机活用法！",
    "上手な蒸し器の使い方": "蒸笼的熟练用法",
    "高度な蒸し器の使い方": "高级蒸笼用法",
    "調合白書": "调剂白皮书",
    "調合全書": "调剂全书",
    "快眠のヒケツ": "安眠的秘诀",
}

RE_LINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_TAG = re.compile(r"<[^>]{1,40}>")


def clean(v, use_cn=True):
    if v is None:
        return None
    v = v.strip()
    v = v.replace("<br>", "、").replace("<br/>", "、").replace("<br />", "、")
    v = RE_TAG.sub("", v)

    def sub(m):
        page = m.group(1).strip()
        disp = (m.group(2) or m.group(1)).strip()
        if disp in BOOK:
            return BOOK[disp]
        if page in BOOK:
            return BOOK[page]
        if use_cn and page in CN:
            return CN[page]
        return disp

    v = RE_LINK.sub(sub, v)
    v = v.replace("'''", "").replace("''", "")
    v = v.strip().strip("、").strip()
    if v in ("-", "—", "–", "", "?", "ー"):
        return None
    # 末尾多余逗号
    if v.endswith("，") or v.endswith(","):
        v = v[:-1]
    return v


def num(v):
    if v is None:
        return None
    s = str(v).replace(",", "").strip()
    return int(s) if re.fullmatch(r"\d+", s) else v


ORDER = ["料理台", "平底锅", "锅子", "烤箱", "搅拌机", "蒸笼"]


def parse(path, kind_default):
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
        b = l[1:]
        if b.startswith("|"):
            b = b[1:]
        c = [x.strip() for x in b.split("||")]
        if len(c) < 13:
            continue
        name = clean(c[0])
        if not name:
            continue
        lv = num(clean(c[8]))
        mats = [x for x in (clean(v) for v in c[1:7]) if x]
        fx = clean(c[7])
        book = clean(c[9])
        buy = num(clean(c[10]))
        sell = num(clean(c[11]))
        get = clean(c[12])
        out.append([cur, name, lv, mats, fx, book, buy, sell, get])
    return out


def jstr(x):
    return json.dumps(x, ensure_ascii=False)


cook = parse("_RFFrecipecook.txt", "料理台")
med = parse("_RFFrecipepharmacy.txt", "药学")
for r in med:
    r[0] = "药学"


def ordof(k):
    return ORDER.index(k) if k in ORDER else 99


cook.sort(key=lambda x: (ordof(x[0]), x[2] if isinstance(x[2], int) else 0, x[1]))
med.sort(key=lambda x: (x[2] if isinstance(x[2], int) else 0, x[1]))
rows = cook + med

NOTE = (
    "本节配方取自 biligame 符文工厂 wiki 的「RFFrecipecook」与「RFFrecipepharmacy」。"
    "配方名与材料名<b>优先采用汉化版定稿译名</b>（取自汉化名词表，日文原名能查到就用定稿名），"
    "查不到的才回退到 wiki 自己的中文写法；<b>配方书名</b>汉化名词表未收录，"
    "此处按字面直译，与汉化版实际用字可能不同。"
    "「配方 lv」是做这道菜所需的料理／药学等级；<b>「配方书」是必须先买到书才会出现的配方</b>，"
    "买价是书的售价、卖价是成品售价，「入手」写去哪儿买书。"
)

head = """/* 符文工房 边境（RFF）料理与药学配方
   RFF_COOK  [厨具, 名字, 配方lv, [材料], 全效果, 配方书, 买价, 卖价, 入手]  %(n)d 条
      厨具：料理台/平底锅/锅子/烤箱/搅拌机/蒸笼 + 药学
   取自 biligame 符文工厂 wiki；物品译名优先用汉化版定稿（js/rffterm.js 的 CN_RFF_ITEM）。 */
""" % dict(n=len(rows))

body = (head + "\nconst RFF_COOK = [\n" + "".join("    %s,\n" % jstr(r) for r in rows)
        + "];\n\nconst RFF_COOKNOTE = %s;\n" % jstr(NOTE))
io.open(OUT, "w", encoding="utf-8", newline="\n").write(body)

from collections import Counter
print("总计 %d 条（料理 %d / 药学 %d）" % (len(rows), len(cook), len(med)))
for k, v in Counter(x[0] for x in cook).most_common():
    sub = [x for x in cook if x[0] == k]
    lvs = [x[2] for x in sub if isinstance(x[2], int)]
    print("  %-5s %3d 条  Lv %d–%d" % (k, v, min(lvs), max(lvs)))
print("  药学    %3d 条" % len(med))
print("样例:", jstr(rows[0]))
print("带配方书:", sum(1 for x in rows if x[5]), "带入手:", sum(1 for x in rows if x[8]))
# 假名残留自检
pat = re.compile(r"[぀-ゟ゠-ヿ]")
bad = set()
for r in rows:
    def go(v):
        if isinstance(v, str):
            if pat.search(v.replace("\u30fb", "")):
                bad.add(v)
        elif isinstance(v, list):
            for x in v:
                go(x)
    go(r)
print("假名残留", len(bad), list(bad)[:15])
