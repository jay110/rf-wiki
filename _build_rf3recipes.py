# -*- coding: utf-8 -*-
"""从 bilibili  wiki 的 RF3recipecook 页面原始 HTML 生成 js/rf3recipes.js。

源：https://wiki.biligame.com/runefactory/RF3recipecook （网络来源，非官方解包）
原始页面已抓取快照到 _rf3recipes_src.html。

页面 8 张表，按厨具分节：徒手 / 刀工 / 平底锅 / 搅拌机 / 锅 / 烤箱 / 蒸笼 / 其它。
每张表 15 列：中文名, 制造等级, 材料1-6, 买价, 成本价, Lv1卖价, 持续时间, HP恢复, RP恢复, 其它。

输出字段（数组，与 RF3_COOK 风格一致）：
  [厨具, 料理名, 制造等级, [材料...], Lv1卖价, 属性效果]
  - 制造等级：整数，无配方（其它类）为 '—'
  - Lv1卖价：整数，无则为 '—'
  - 属性效果：合并 HP恢复 + RP恢复 + 其它 三列（去空），无则为 '—'

注意：同一道菜用不同尺寸材料（小/中/大牛奶、普通/优质/每日健康蛋）会拆成多行，
      这是源表本来就这样，与本站 RF5/RF4 的呈现一致。
"""
import re
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SRC = '_rf3recipes_src.html'
OUT = 'js/rf3recipes.js'

SEC = {
    "徒手料理数据": "徒手", "刀工料理数据": "菜刀", "平底锅料理数据": "平底锅",
    "搅拌机料理数据": "搅拌机", "锅料理数据": "锅", "烤箱料理数据": "烤箱",
    "蒸笼料理数据": "蒸笼", "其它料理数据": "其它",
}
ORDER = ["徒手", "菜刀", "平底锅", "搅拌机", "锅", "烤箱", "蒸笼", "其它"]


def strip(t):
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("&nbsp;", " ").replace("&amp;", "&")
    return re.sub(r"\s+", " ", t).strip()


def clean_eff(hp, rp, oth):
    parts = [p for p in [hp, rp, oth] if p and p != "-"]
    return " ".join(parts) if parts else "—"


html = open(SRC, encoding="utf-8", errors="replace").read()

# 顺序扫描：记录当前节，把每个 <tr> 归到最近出现的节标题下（避免 wiki 表格嵌套错位）
events = []
for m in re.finditer(r"符文工厂3 (.+?料理数据)", html):
    events.append((m.start(), 'H', SEC.get(m.group(1))))
for m in re.finditer(r"<tr[^>]*>(.*?)</tr>", html, re.S):
    events.append((m.start(), 'R', m.group(1)))
events.sort()

cur = None
raw = []
for pos, kind, val in events:
    if kind == 'H':
        cur = val
    else:
        tds = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", val, re.S)
        if len(tds) < 11 or cur is None:
            continue
        name = strip(tds[0])
        if not name or name == "中文名":
            continue
        mats = [strip(tds[i]) for i in range(2, 8)]
        mats = [m for m in mats if m and m != "-"]
        lv = strip(tds[1])
        sell = strip(tds[10]) if len(tds) > 10 else ""
        hp = strip(tds[12]) if len(tds) > 12 else ""
        rp = strip(tds[13]) if len(tds) > 13 else ""
        oth = strip(tds[14]) if len(tds) > 14 else ""
        eff = clean_eff(hp, rp, oth)
        raw.append([cur, name, lv, mats, sell, eff])

# 排序：先按厨具顺序，再按制造等级（无等级放最后）
idx = {k: i for i, k in enumerate(ORDER)}


def lvl_num(x):
    try:
        return int(x)
    except ValueError:
        return 999


raw.sort(key=lambda r: (idx.get(r[0], 99), lvl_num(r[2])))

# 转成输出格式（等级/卖价 无则 '—'）
rows = []
for cur, name, lv, mats, sell, eff in raw:
    rows.append([cur, name, lv if lv and lv != "-" else "—", mats,
                 sell if sell and sell != "-" else "—", eff])

# 统计
from collections import Counter
cnt = Counter(r[0] for r in rows)
total = len(rows)
has_lv = sum(1 for r in rows if r[2] != "—")

js = [
    "/* 符文工房3（RF3）料理配方数据 —— 来源：哔哩哔哩 wiki《符文工房3》RF3recipecook 页面",
    "   链接：https://wiki.biligame.com/runefactory/RF3recipecook （网络来源，非官方解包，已汉化）",
    "   字段：[厨具, 料理名, 制造等级, [材料...], Lv1卖价, 属性效果]",
    "   说明：同一道菜用不同尺寸材料（小/中/大牛奶、普通/优质/每日健康蛋）会拆成多行，源表如此，与本站 RF5/RF4 一致。",
    "   「其它」类 %d 件是没有配方的成品（米饭、巧克力、失败之作等），只能买或掉落，制造等级与材料栏为 —。" % cnt.get("其它", 0),
    "   属性效果合并自源表 HP恢复 / RP恢复 / 其它 三列；效果仅作速查，精确数值以游戏内为准。 */",
    "const RF3_RECIPE = [",
]
for r in rows:
    mats = "[" + ", ".join('"%s"' % m for m in r[3]) + "]" if r[3] else "[]"
    js.append('    ["%s", "%s", "%s", %s, "%s", "%s"],' % (r[0], r[1], r[2], mats, r[4], r[5]))
js.append("];")
open(OUT, "w", encoding="utf-8").write("\n".join(js) + "\n")

print("写入 %s ：共 %d 行（含配方 %d，其它成品 %d）" % (OUT, total, has_lv, cnt.get("其它", 0)))
for k in ORDER:
    print("  %-4s %d" % (k, cnt.get(k, 0)))
