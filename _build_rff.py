# -*- coding: utf-8 -*-
"""从腾讯文档「边境汉化」的 01718 表生成 RFF 物品与魔物库。

结构：ID 段 0000FB00~00014700 共 1282 条「名字」（日／中对照），
其中前 745 条是物品、其后 151 条是魔物种类名、再往后是宠物个体名（不收）。
说明段 00000C00~0000FB00 共 745 条，与物品条**按索引一一对应**（已验证）。
"""
import io, re, json, os

TMP = r"G:/wit_tools/work/_tdtmp"
OUT = r"G:/wit_tools/work/RF_WIKI/js"


def load(f):
    d = {}
    for line in io.open(os.path.join(TMP, f), encoding="utf-8"):
        p = line.rstrip("\n").split("\t")
        d[int(p[0])] = p[2]
    return d


def parse(s):
    m = re.match(r"^([0-9A-F]{8}),(\d+),(.*)$", s or "")
    return (m.group(1), int(m.group(2)), m.group(3)) if m else None


def clean(t):
    t = (t or "").replace("{换行}", "\n").replace("^00 0a^", "\n").replace("\r", "")
    t = re.sub(r"[ \u3000\t]+", " ", t)
    return re.sub(r"\n+", "\n", t).strip()


ja, zh = load("emkon5_c0.csv"), load("emkon5_c1.csv")
rows = []
for r in sorted(ja):
    a = parse(ja[r])
    if not a:
        continue
    b = parse(zh[r]) if r in zh else None
    rows.append((a[0], a[0] and int(a[0], 16), a[2], b[2] if b else ""))

names = [x for x in rows if int("0000FB00", 16) <= x[1] < int("00014700", 16)]
descs = [x for x in rows if int("00000C00", 16) <= x[1] < int("0000FB00", 16)]
print("名字 %d / 说明 %d" % (len(names), len(descs)))

# 物品分类区间（含首尾索引，按解包表的排列顺序切）
CATS = [
    (0, 36, "种子"), (37, 84, "作物与花草"), (85, 114, "鱼"), (115, 133, "食材"),
    (134, 335, "料理"), (336, 461, "药与素材"), (462, 503, "配方书"),
    (504, 624, "武器"), (625, 646, "农具"), (647, 732, "防具与饰品"),
    (733, 744, "杂货"),
]
cats = []
for a, b, c in CATS:
    cats += [c] * (b - a + 1)
assert len(cats) == 745, len(cats)

items = []
for i in range(745):
    nm = clean(names[i][3])
    if not nm or nm in ("未使用", "空白道具"):
        continue
    d = clean(descs[i][3]) if i < len(descs) else ""
    items.append([nm, cats[i], d.split("\n")[0].strip("，,") or "—", d.replace("\n", " ")[:120]])

# 魔物：745~895，剔除阶段变体与未完成条目
mon_raw = names[745:896]
bad = re.compile(r"第二阶段|第三阶段|最终BOSS|测试用|^$|未使用")
mons = []
for x in mon_raw:
    nm = clean(x[3])
    if bad.search(nm):
        continue
    if nm not in [m[0] for m in mons]:
        mons.append([nm])

print("物品 %d / 魔物 %d" % (len(items), len(mons)))
for x in items[:3]:
    print("  ", x)
print("  魔物样本", [m[0] for m in mons[:14]])


def dump(name, data, note):
    return "/* %s */\nconst %s = %s;\n" % (
        note, name, json.dumps(data, ensure_ascii=False, separators=(",", ":")))


with io.open(os.path.join(OUT, "rffdata.js"), "w", encoding="utf-8") as f:
    f.write("/* 符文工房 边境（RFF）数据：取自「边境汉化」工程表 01718 的日／中对照行，\n"
            "   物品取 ID 段 0000FB00~00014700 前 745 条，说明取 00000C00~0000FB00 段按索引配对 */\n")
    f.write(dump("ITEM_RFF", items, "物品：[名称, 分类, 说明首句, 说明全文]"))
    f.write(dump("MON_RFF", mons, "魔物：种类名"))
print("written rffdata.js")
