# -*- coding: utf-8 -*-
"""从 RF3 解包文本（TXET.txt）生成物品库。

rf3Archive-7721 = 物品名（869 条）
rf3Archive-7722 = 物品说明（888 条），与 7721 按索引一一对应
rf3Archive-7720 = 节日与生日（41 条）
两文件均为 UTF-16 编码，行格式「地址,宽度,文本」。
"""
import io, re, json, os

SRC = r"G:/10257/Desktop/符文工房/符文工房3文本"
OUT = r"G:/wit_tools/work/RF_WIKI/js"


def load(name):
    s = io.open(os.path.join(SRC, name), encoding="utf-16").read()
    rows = []
    for line in s.split("\n"):
        m = re.match(r"^\s*([0-9A-F]{8}),(\d+),(.*)$", line.rstrip())
        if m:
            rows.append(m.group(3))
    return rows


def clean(t):
    t = (t or "").replace("{换行}", "\n").replace("\r", "")
    t = re.sub(r"[ \u3000\t]+", " ", t)
    return re.sub(r"\n+", "\n", t).strip()


names = load("rf3Archive-7721.TXET.txt")
descs = load("rf3Archive-7722.TXET.txt")
print("名字 %d / 说明 %d" % (len(names), len(descs)))
assert len(names) == 869

# 分类区间（含首尾索引），按解包表的排列顺序人工划分
SEG = [
    (1, 39, "作物"), (40, 65, "草与花"), (66, 82, "药与香料"),
    (83, 106, "刺身"), (107, 243, "料理"), (244, 265, "食材"),
    (266, 275, "配方书"), (276, 423, "武器"), (424, 450, "农具"),
    (451, 510, "武器"), (511, 603, "防具与饰品"), (604, 610, "农具"),
    (611, 653, "种子"), (654, 706, "魔法与技能"), (707, 712, "药与香料"),
    (713, 798, "素材"), (799, 814, "特殊道具"), (815, 843, "鱼"),
    (844, 849, "垃圾"), (850, 868, "种子"),
]
cats = [""] * len(names)
for a, b, c in SEG:
    for i in range(a, b + 1):
        cats[i] = c
miss = [i for i in range(1, len(names)) if not cats[i]]
print("未归类", len(miss), miss[:10])

items = []
for i in range(1, len(names)):
    nm = clean(names[i])
    if not nm or nm.startswith("未使用"):
        continue
    d = clean(descs[i]) if i < len(descs) else ""
    if "アイテムは入っていません" in d:
        d = ""
    items.append([nm, cats[i] or "其他", d.split("\n")[0].strip("，,") or "—",
                  d.replace("\n", " ")[:120]])

ev = []
for x in load("rf3Archive-7720.TXET.txt"):
    n = clean(x)
    if n and n not in ev:
        ev.append(n)
print("物品 %d / 日程 %d" % (len(items), len(ev)))
for x in items[:3]:
    print("  ", x)
print("  节日", ev)


def dump(name, data, note):
    return "/* %s */\nconst %s = %s;\n" % (
        note, name, json.dumps(data, ensure_ascii=False, separators=(",", ":")))


with io.open(os.path.join(OUT, "rf3data.js"), "w", encoding="utf-8") as f:
    f.write("/* 符文工房3（RF3）数据：取自解包文本 rf3Archive-7721（物品名 869 条）\n"
            "   与 rf3Archive-7722（说明 888 条），两表按索引一一对应；\n"
            "   分类按解包排列顺序人工划分。日程取自 rf3Archive-7720 */\n")
    f.write(dump("ITEM_RF3", items, "物品：[名称, 分类, 说明首句, 说明全文]"))
    f.write(dump("CAL_RF3", ev, "全年节日与生日（按游戏内月份顺序）"))
print("written rf3data.js")
