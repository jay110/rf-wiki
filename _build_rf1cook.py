#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 biligame wiki 构建《符文工房1》料理与药学配方数据。

译名优先采用 RF1 汉化定稿：wiki 链接页名是日文原名，先查 js/rf1term.js 的全部
CN_RF1_* 表（日文→中文定稿），查不到再用 wiki 的中文显示名，最后回退 EXTRA 直译。

源页：
    RF1recipecook      184 条，8 节（空手/菜刀套装/平底锅/搅拌机/烤箱/锅子/蒸笼/其它）
    字段：名字!!配方书!!配方等级!!材料1..6!!买价!!卖价!!店铺!!HP!!RP!!最大HP!!效果!!
          STR!!INT!!DEX!!VIT!!属性攻击!!属性防御!!中毒抗!!封印抗!!麻痹抗!!吹飞抗!!倒地抗!!持续秒
    RF1recipepharmacy   24 条
    字段：中文!!配方等级!!买价!!卖价!!店铺!!材料1..6!!HP!!RP!!最大HP!!效果!!
          STR!!INT!!DEX!!VIT!!属性攻击!!属性防御!!持续时间!!配方书

产物 js/rf1cook.js（COOK 与 MED 同构，24 元组）：
    [类别, 名字, 配方书, 等级, [材料], 买价, 卖价, 入手, HP, RP, 最大HP, 效果,
     STR, INT, DEX, VIT, 属性攻击, 属性防御, 中毒抗, 封印抗, 麻痹抗, 吹飞抗, 倒地抗, 持续秒]
    RF1_BOOK  [配方书, 类别, 配方数, 等级范围]
    RF1_COOKNOTE
"""
import io
import json
import re

OUT = "js/rf1cook.js"

# ---------- 汉化定稿译名 ----------
def load_cn():
    s = io.open("js/rf1term.js", encoding="utf-8").read()
    out = {}
    for name in re.findall(r"^const (CN_RF1\w+) = \[", s, re.M):
        m = re.search(r"const %s = (\[.*?\n\]);" % name, s, re.S)
        if not m:
            continue
        for a, b in re.findall(r'^\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)"', m.group(1), re.M):
            if a and b:
                out.setdefault(a.strip(), b.strip())
    return out


CN = load_cn()
print("RF1 汉化定稿词条", len(CN))

# 名词表未收录、按字面直译的补充（店铺名与少数书名）
EXTRA = {
    "酒場『スプリング•ラビット』": "酒馆『春兔』",
    "海の家『スピアーフィッシュ』": "海滨小屋『旗鱼』",
    "カミュズ·ファーム": "卡缪农场",
    "ノイマンズ•ファーム": "诺伊曼农场",
    "エド病院": "艾德医院",
}
CN.update(EXTRA)

RE_LINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_TAG = re.compile(r"<[^>]{1,40}>")
RE_KANA = re.compile(r"[぀-ゟ゠-ヿ]")


def clean(v):
    """把 wiki 单元格转成纯文本；返回 None 表示空。"""
    if v is None:
        return None
    v = v.strip()
    # wiki 偶有 [[页名]|显示名] 的错写，先修正为 [[页名|显示名]]
    v = re.sub(r"\[\[([^\]|]+)\]\|([^\]]+)\]", r"[[\1|\2]]", v)
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
        return v  # 形如「火+30」「水+2」按文本保留


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
            t = RE_LINK.sub(lambda x: (x.group(2) or x.group(1)), m.group(1)).strip()
            sec = t if t in CN else t
            if sec in CN:
                sec = CN[sec]
            continue
        if sec in ("参考与注释", None):
            continue
        if line.startswith("|") and "||" in line and not line.startswith("|-"):
            out.append((sec, line))
    return out


# ---------- 料理 ----------
cook = []
for sec, line in read_rows("_RF1recipecook.txt"):
    c = cells(line)
    if len(c) < 28:
        continue
    name = clean(c[0])
    if not name:
        continue
    mats = [clean(x) for x in c[3:9]]
    mats = [m for m in mats if m]
    cook.append([
        sec,                 # 0 类别（厨具）
        name,                # 1 名字
        clean(c[1]),         # 2 配方书
        num(c[2]),           # 3 配方等级
        mats,                # 4 材料
        num(c[9]),           # 5 买价
        num(c[10]),          # 6 卖价
        clean(c[11]),        # 7 店铺 / 入手
        num(c[12]),          # 8 HP
        num(c[13]),          # 9 RP
        num(c[14]),          # 10 最大HP
        clean(c[15]),        # 11 效果
        num(c[16]),          # 12 STR
        num(c[17]),          # 13 INT
        num(c[18]),          # 14 DEX
        num(c[19]),          # 15 VIT
        clean(c[20]),        # 16 属性攻击
        clean(c[21]),        # 17 属性防御
        num(c[22]),          # 18 中毒抗性
        num(c[23]),          # 19 封印抗性
        num(c[24]),          # 20 麻痹抗性
        num(c[25]),          # 21 吹飞抗性
        num(c[26]),          # 22 倒地抗性
        num(c[27]),          # 23 持续时间（秒）
    ])

print("料理", len(cook))

# ---------- 药学 ----------
med = []
for sec, line in read_rows("_RF1recipepharmacy.txt"):
    c = cells(line)
    if len(c) < 23:
        continue
    name = clean(c[0])
    if not name:
        continue
    mats = [clean(x) for x in c[5:11]]
    mats = [m for m in mats if m]
    med.append([
        "药学",               # 0 类别
        name,                 # 1 名字
        clean(c[22]),         # 2 配方书
        num(c[1]),            # 3 配方等级
        mats,                 # 4 材料
        num(c[2]),            # 5 买价
        num(c[3]),            # 6 卖价
        clean(c[4]),          # 7 店铺 / 入手
        num(c[11]),           # 8 HP
        num(c[12]),           # 9 RP
        num(c[13]),           # 10 最大HP
        clean(c[14]),         # 11 效果
        num(c[15]),           # 12 STR
        num(c[16]),           # 13 INT
        num(c[17]),           # 14 DEX
        num(c[18]),           # 15 VIT
        clean(c[19]),         # 16 属性攻击
        clean(c[20]),         # 17 属性防御
        None,                 # 18 中毒抗性
        None,                 # 19 封印抗性
        None,                 # 20 麻痹抗性
        None,                 # 21 吹飞抗性
        None,                 # 22 倒地抗性
        num(c[21]),           # 23 持续时间
    ])

print("药学", len(med))

# ---------- 配方书汇总 ----------
books = {}
for r in cook + med:
    bk = r[2]
    if not bk:
        continue
    b = books.setdefault(bk, {"cat": set(), "n": 0, "lv": []})
    b["cat"].add(r[0])
    b["n"] += 1
    if isinstance(r[3], int):
        b["lv"].append(r[3])

ORDER = ["空手", "菜刀套装", "平底锅", "搅拌机", "烤箱", "锅子", "蒸笼", "其它", "药学"]


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

cook.sort(key=lambda x: (ordof(x[0]), -(x[3] if isinstance(x[3], int) else -1), x[1]))
med.sort(key=lambda x: (-(x[3] if isinstance(x[3], int) else -1), x[1]))

NOTE = [
    "《符文工房1》的料理按<b>七类厨具</b>分：空手、菜刀套装、平底锅、搅拌机、烤箱、锅子、蒸笼；平底锅 51 道最多。",
    "另有 <b>「其它」25 条</b>——这些<b>没有配方</b>，是直接买来或打怪掉落的成品（米饭、巧克力、红酒、牛奶／鸡蛋／奶酪的各尺寸版本等），页面里单列一类。",
    "这一作的效果栏是<b>全站最细的一档</b>：除 HP／RP／最大 HP 外，还分列 STR／INT／DEX／VIT 四维、属性攻防（如「火+30」）、五种状态抗性（中毒／封印／麻痹／吹飞／倒地）与持续时间（秒）。",
    "数值出现<b>负数是正常的</b>——「失败之作」RP−20、最大HP−30、四维各 −5、五种抗性各 −10；红酒也是 RP−15、最大HP−5 换火属性攻击 +30。",
    "药学 24 条里的<b>永久强化类</b>（蛋・白・质、智力补品、敏捷瓶等）标了掉落它们的魔物，做出来之前得先刷到材料。",
    "译名采用 RF1 汉化定稿；名词表未收录的店铺名（酒馆『春兔』、海滨小屋『旗鱼』、卡缪农场、诺伊曼农场）为字面直译，可能与汉化版实际用字不同。",
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
    "// 《符文工房1》料理与药学配方数据（自动生成，勿手改）",
    "// 来源：biligame 符文工房 wiki RF1recipecook / RF1recipepharmacy",
    "// 元组：[类别, 名字, 配方书, 等级, [材料], 买价, 卖价, 入手, HP, RP, 最大HP, 效果,",
    "//       STR, INT, DEX, VIT, 属性攻击, 属性防御, 中毒抗, 封印抗, 麻痹抗, 吹飞抗, 倒地抗, 持续秒]",
    "// RF1_BOOK  [配方书, 类别, 配方数, 等级范围]",
    block("RF1_COOK", cook),
    block("RF1_MED", med),
    block("RF1_BOOK", book_rows),
    block("RF1_COOKNOTE", NOTE),
])

io.open(OUT, "w", encoding="utf-8", newline="\n").write(body + "\n")
print("写出", OUT)

# ---------- 自检 ----------
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
