# -*- coding: utf-8 -*-
"""从 biligame 符文工厂 wiki 生成 js/fishspot_rf1.js / fishspot_rf2.js / fishspot_rff.js

这三作（初代 / 2 / 边境）的钓鱼数据结构和 RF4/RF5 不一样：没有逐钓点逐季的
「出现率」，而是一张「地图（钓点）× 鱼」目录，列随作不同：

  RF1  地图 / 鱼 / 地点 / 蓄力等级
  RF2  地图 / 区域(蓝红) / 季节 / 鱼 / 钓竿Lv
  RFF  地图 / 分区 / 鱼 / 季节 / 鱼等级 / Lv1卖价 / 最低卖价 / 最高卖价

输出三个归一化对象（SPOT_RF1 / SPOT_RF2 / SPOT_RFF），每个含：
  head  列名、colw  列宽、rows  展示单元数组、maps  去重钓点、fishes  去重鱼种、
  prices  是否带价格（仅 RFF）、topSell  RFF 最贵前 5（按 Lv1 卖价）。
由 pages.js 的 fishspotRf12fHtml(g) 统一渲染。
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
TAG = re.compile(r"<[^>]+>")


def cell(t):
    t = t.strip()
    t = LINK.sub(lambda m: m.group(1), t)   # [[a|b]] / [[a]] -> 显示名
    t = TAG.sub("", t)                       # 去 <font> 等标签
    return t.strip()


def split_tables(wikitext):
    out, depth, buf = [], 0, []
    for ln in wikitext.splitlines():
        s = ln.strip()
        if s.startswith("{|"):
            depth += 1
            buf = [ln]
        elif s.startswith("|}"):
            buf.append(ln)
            if depth == 1:
                out.append("\n".join(buf))
            depth -= 1
            buf = []
        elif depth >= 1:
            buf.append(ln)
    return out


def parse_table(block):
    lines = block.splitlines()
    header, rows = None, []
    for ln in lines:
        s = ln.strip()
        if s.startswith("!"):
            header = [cell(c) for c in s.lstrip("!").split("!!")]
        elif s.startswith("|-") or s.startswith("|+"):
            continue
        elif s.startswith("|"):
            rows.append([cell(c) for c in s[1:].split("||")])
    return header, rows


def distinct(seq):
    seen, out = set(), []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def build_rf1():
    wiki = fetch_page("RF1fishing")
    h, rows = parse_table(split_tables(wiki)[0])
    out = []
    for r in rows:
        if len(r) < 4:
            continue
        out.append([r[0], r[2], r[1], r[3]])   # 地图 / 地点 / 鱼 / 蓄力等级
    return {
        "game": "rf1",
        "title": "符文工房 新牧场物语（初代）",
        "head": ["钓点(地图)", "地点", "鱼", "蓄力等级"],
        "colw": ["8.2rem", "auto", "7rem", "5rem"],
        "rows": out,
        "maps": distinct([r[0] for r in out]),
        "fishes": distinct([r[2] for r in out]),
        "prices": False,
    }


def build_rf2():
    wiki = fetch_page("RF2fishing")
    h, rows = parse_table(split_tables(wiki)[0])
    out = []
    for r in rows:
        if len(r) < 6:
            continue
        out.append([r[0], r[2], r[3], r[4], r[5]])   # 地图 / 区域 / 季节 / 鱼 / 钓竿Lv
    return {
        "game": "rf2",
        "title": "符文工房2",
        "head": ["钓点(地图)", "区域", "季节", "鱼", "钓竿Lv"],
        "colw": ["9rem", "4.6rem", "5.6rem", "6.4rem", "5rem"],
        "rows": out,
        "maps": distinct([r[0] for r in out]),
        "fishes": distinct([r[3] for r in out]),
        "prices": False,
    }


def build_rff():
    wiki = fetch_page("RFFfishing")
    h, rows = parse_table(split_tables(wiki)[0])
    out = []
    top = []
    for r in rows:
        if len(r) < 8:
            continue
        p1 = r[5].strip()
        try:
            p1n = int(p1)
        except ValueError:
            p1n = None
        out.append([r[0], r[1], r[3], r[2], r[4], r[5], r[6], r[7]])
        # 地图 / 分区 / 季节 / 鱼 / 鱼等级 / Lv1卖价 / 最低 / 最高
        if p1n is not None:
            top.append([r[2], p1n])
    top.sort(key=lambda x: -x[1])
    top5 = top[:5]
    return {
        "game": "rff",
        "title": "符文工房 边境",
        "head": ["钓点(地图)", "分区", "季节", "鱼", "鱼等级", "Lv1卖价", "最低", "最高"],
        "colw": ["8rem", "6.4rem", "6rem", "6.4rem", "5rem", "5rem", "4.6rem", "4.6rem"],
        "rows": out,
        "maps": distinct([r[0] for r in out]),
        "fishes": distinct([r[3] for r in out]),
        "prices": True,
        "topSell": top5,
    }


def emit(name, obj):
    fname = "fishspot_" + name.split("_")[1].lower()   # SPOT_RF1 -> fishspot_rf1
    js = [
        "/* %s 钓点与季节分布：biligame 符文工厂 wiki（无出现率，钓点×鱼 目录），" % obj["title"],
        "   由 _build_fishspot_legacy.py 生成，勿手改。结构见该脚本顶部说明。 */",
        "var %s = %s;" % (name, json.dumps(obj, ensure_ascii=False, separators=(",", ":"))),
    ]
    open("js/%s.js" % fname, "w", encoding="utf-8").write("\n".join(js) + "\n")
    print("%s -> js/%s.js: 钓点 %d / 鱼种 %d / 条目 %d" % (name, fname, len(obj["maps"]), len(obj["fishes"]), len(obj["rows"])))


def main():
    emit("SPOT_RF1", build_rf1())
    emit("SPOT_RF2", build_rf2())
    emit("SPOT_RFF", build_rff())


if __name__ == "__main__":
    main()
