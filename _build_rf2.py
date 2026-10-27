# -*- coding: utf-8 -*-
"""从腾讯文档导出的 RF2 汉化文本生成物品与魔物库。

注意：RF2 的 itemname / itemhelp、monstername / monstercategory / monstercomment
两组表内部 ID 互不相同（不同命名空间），但**行序严格对应**，因此一律按行序配对。
"""
import io, re, json, os

TMP = r"G:/wit_tools/work/_tdtmp"
OUT = r"G:/wit_tools/work/RF_WIKI/js"


def load(f):
    """按行号排序返回 [(id, num, text)]。"""
    rows = {}
    for line in io.open(os.path.join(TMP, f), encoding="utf-8"):
        p = line.rstrip("\n").split("\t")
        if len(p) < 3:
            continue
        parts = p[2].split(",", 2)
        if len(parts) < 3:
            continue
        rows[int(p[0])] = (parts[0], parts[1], parts[2])
    return [rows[k] for k in sorted(rows)]


def clean(t):
    t = t.replace("{换行}", "\n").replace("^00 0a^", "\n").replace("\r", "")
    t = re.sub(r"[ \u3000\t]+", " ", t)
    return re.sub(r"\n+", "\n", t).strip()


def first(t):
    return clean(t).split("\n")[0].strip("，,")


nm = load("XFOLXRrEjCsy_000016.csv")
hp = load("XFOLXRrEjCsy_000015.csv")
mn = load("XFOLXRrEjCsy_00000e.csv")
mc = load("XFOLXRrEjCsy_000010.csv")
md = load("XFOLXRrEjCsy_00000f.csv")
assert len(nm) == len(hp), (len(nm), len(hp))
assert len(mn) == len(mc) == len(md), (len(mn), len(mc), len(md))

bad = re.compile(r"未使用|テスト|ダミー|^？+$")
items, skipped = [], []
for (_, _, name), (_, _, desc) in zip(nm, hp):
    name = clean(name)
    d = clean(desc)
    if not name or bad.search(name):
        skipped.append(name)
        continue
    items.append([name, first(d) or "—", d.replace("\n", " ")[:140]])

mons = []
for (_, _, name), (_, _, kind), (_, _, body) in zip(mn, mc, md):
    name, kind, body = clean(name), clean(kind), clean(body)
    if not name:
        continue
    sk = re.search(r"【特技】\s*(.+?)(?:\s*【|$)", body)
    at = re.search(r"【属性】\s*(.+)$", body)
    txt = re.sub(r"【特技】.*$", "", body).strip().replace("\n", " ")
    mons.append([name, kind or "—", (at.group(1).strip() if at else "—"),
                 (sk.group(1).strip() if sk else "—"), txt])

print("物品 %d（跳过 %d）魔物 %d" % (len(items), len(skipped), len(mons)))
for x in items[:3]:
    print("  ", x[0], "|", x[1])
for x in mons[:3]:
    print("  ", x)


def dump(name, data, note):
    return "/* %s */\nconst %s = %s;\n" % (
        note, name, json.dumps(data, ensure_ascii=False, separators=(",", ":")))


with io.open(os.path.join(OUT, "rf2data.js"), "w", encoding="utf-8") as f:
    f.write("/* 符文工房2（RF2）数据：取自汉化工程文本表 "
            "rf2txtitemname / rf2txtitemhelp / rf2txtmonstername / "
            "rf2txtmonstercategory / rf2txtmonstercomment，按行序配对 */\n")
    f.write(dump("ITEM_RF2", items, "物品：[名称, 说明首句, 说明全文]"))
    f.write(dump("MON_RF2", mons, "魔物：[个体名, 种类, 属性, 特技, 简介]"))
print("written rf2data.js")
