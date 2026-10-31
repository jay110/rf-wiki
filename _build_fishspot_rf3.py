# -*- coding: utf-8 -*-
"""从 biligame 符文工厂 wiki「RF3fishing」页生成 js/fishspot_rf3.js

RF3 的钓鱼数据结构和 RF4/RF5 不一样：没有逐钓点逐季的「出现率」，
而是一张「钓点 × 鱼（鱼影 / 买价 / Lv1卖价）」目录；其中两个钓点
（石池小道、阿克娜湖）写的是「当前季节的所有鱼」（随季节轮换，源表不列明细），
另有「所有地点」一组（乌贼／心动鲷鱼／空罐／高筒靴／罕见的空罐）全图通用，
龙玄洞没有鱼。再单独一张「卡尔洛斯度假村」表（入场费 + 好感门槛）。

输出 SPOT_RF3 结构化对象，由 pages.js 的 fishspotRf3Html() 渲染。
"""
import io
import json
import re
import subprocess
import sys
import urllib.parse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
BASE = "https://wiki.biligame.com/runefactory/api.php"


def api(**kw):
    kw.setdefault("format", "json")
    kw.setdefault("action", "query")
    url = BASE + "?" + urllib.parse.urlencode(kw)
    r = subprocess.run(["curl", "-k", "-s", "-A", UA, url], capture_output=True)
    return json.loads(r.stdout.decode("utf-8", "replace"))


def fetch_page(title):
    d = api(prop="revisions", rvprop="content", rvslots="main", titles=title, formatversion=2)
    pg = d["query"]["pages"][0]
    if "revisions" not in pg:
        raise RuntimeError("页面不存在: " + title)
    return pg["revisions"][0]["slots"]["main"]["content"]


LINK = re.compile(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]")


def cell(t):
    t = t.strip()
    t = LINK.sub(lambda m: m.group(1), t)  # [[a|b]] / [[a]] -> a
    return t


def parse_table(block):
    """block 是单张 {| ... |} 的 wikitext（含首尾）。返回 (header, rows)。"""
    lines = block.splitlines()
    header = None
    rows = []
    for ln in lines:
        s = ln.strip()
        if s.startswith("!"):
            header = [cell(c) for c in s.lstrip("!").split("!!")]
        elif s.startswith("|-"):
            continue
        elif s.startswith("|+"):
            continue
        elif s.startswith("|"):
            parts = [cell(c) for c in s[1:].split("||")]
            rows.append(parts)
    return header, rows


def split_tables(wikitext):
    out = []
    depth = 0
    buf = []
    for ln in wikitext.splitlines():
        if ln.strip().startswith("{|"):
            depth += 1
            buf = [ln]
        elif ln.strip().startswith("|}"):
            buf.append(ln)
            if depth == 1:
                out.append("\n".join(buf))
            depth -= 1
            buf = []
        elif depth >= 1:
            buf.append(ln)
    return out


def num(v):
    v = v.strip()
    if v in ("", "-", "—"):
        return None
    try:
        return int(v)
    except ValueError:
        try:
            return float(v)
        except ValueError:
            return None


def clean_fish(row):
    """首表一行 [地点, 中文名, 鱼影, 买价, Lv1卖价] -> 结构化。"""
    loc = row[0].strip()
    name = row[1].strip()
    shadow = row[2].strip()
    buy = num(row[3])
    sell = num(row[4])
    return loc, name, shadow, buy, sell


def main():
    wiki = fetch_page("RF3fishing")
    tables = split_tables(wiki)
    assert len(tables) >= 2, "期望至少两张表，实际 %d" % len(tables)

    h1, r1 = parse_table(tables[0])
    h2, r2 = parse_table(tables[1])

    spots = []          # 纯固定钓点： [名称, [[鱼,鱼影,买价,卖价], ...]]
    spot_map = {}
    seasonal = {}       # 石池小道 / 阿克娜湖： 名称 -> {'flag':bool, 'fish':[...]}
    everywhere = []     # 所有地点通用钓物
    none = []           # 没有鱼的钓点

    SEASONAL = {"石池小道", "阿克娜湖"}

    for row in r1:
        if len(row) < 5:
            continue
        loc, name, shadow, buy, sell = clean_fish(row)
        if loc == "所有地点":
            everywhere.append([name, shadow, buy, sell])
            continue
        if loc == "龙玄洞":
            if name not in ("没有鱼", "-"):
                # 理论上龙玄洞只有「没有鱼」
                pass
            none.append(loc)
            continue
        if name == "当前季节的所有鱼":
            seasonal.setdefault(loc, {"flag": True, "fish": []})
            continue
        # 普通固定钓点（含阿克娜湖的百鱼王的鳞片这类固定稀有）
        if loc in SEASONAL:
            seasonal.setdefault(loc, {"flag": False, "fish": []})
            seasonal[loc]["fish"].append([name, shadow, buy, sell])
        else:
            if loc not in spot_map:
                spot_map[loc] = []
                spots.append((loc, spot_map[loc]))
            spot_map[loc].append([name, shadow, buy, sell])

    # 度假村（第二张表）： [鱼, 入场费, Lv1卖价, 备注]
    resort = {"name": "卡尔洛斯度假村", "entry": None, "fish": []}
    for row in r2:
        if len(row) < 4:
            continue
        nm, fee, sell, note = row[0].strip(), row[1].strip(), row[2].strip(), row[3].strip()
        if nm == "入场费":
            resort["entry"] = num(fee)
            continue
        resort["fish"].append([nm, num(fee), num(sell), note])

    spots.sort(key=lambda x: x[0])
    seasonal_list = [{"name": k, "flag": v["flag"], "fish": v["fish"]}
                    for k, v in seasonal.items()]
    none = sorted(set(none))

    SPOT_RF3 = {
        "spots": spots,
        "seasonal": seasonal_list,
        "everywhere": everywhere,
        "none": none,
        "resort": resort,
    }

    js = [
        "/* RF3 钓点与季节分布：biligame 符文工厂 wiki「RF3fishing」页（钓点×鱼 目录，无出现率），",
        "   由 _build_fishspot_rf3.py 生成，勿手改。结构见 _build_fishspot_rf3.py 顶部说明。 */",
        "var SPOT_RF3 = " + json.dumps(SPOT_RF3, ensure_ascii=False, separators=(",", ":")) + ";",
    ]
    open("js/fishspot_rf3.js", "w", encoding="utf-8").write("\n".join(js) + "\n")

    # 统计
    fixed_fish = sum(len(f) for _, f in spots)
    seas_fish = sum(len(s["fish"]) for s in seasonal_list)
    all_fish = sorted({fish[0] for _, fl in spots for fish in fl}
                      | {f[0] for s in seasonal_list for f in s["fish"]}
                      | {f[0] for f in everywhere})
    print("固定钓点", len(spots), "条鱼", fixed_fish)
    print("季节轮换钓点", len(seasonal_list), "其中固定稀有", seas_fish)
    print("全地点通用钓物", len(everywhere))
    print("空集钓点", none)
    print("去重鱼种", len(all_fish))
    print("度假村鱼", len(resort["fish"]), "入场费", resort["entry"])
    print("样例 spot", spots[0])


if __name__ == "__main__":
    main()
