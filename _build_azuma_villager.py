# -*- coding: utf-8 -*-
"""解析 gametoeasy《符文工房:龙之天地》村民喜好页（_azuma_villager.html）为 js/azuma_gift.js

源：https://www.gametoeasy.com/post/1853.html （中文攻略站，与 azuma.js 的 AZUMA_MON 同源）
结构：每位村民 = <h2><span class="mw-headline" id="名">名</span></h2> + 后续 <p> 字段块，
      字段以全角「：」起头（生日／最喜欢／喜欢／讨厌／最讨厌／回礼／泡澡后的乐子／
      给你的生日礼物／最喜欢的话题／喜欢的话题／讨厌的话题／最讨厌的话题），值以「、」分列。

输出 AZUMA_GIFT：[{n, bd, b, l, h, w, ret?, bath?, bgYou?, tf?, tl?, th?, twh?}, ...]
  n   村民名
  bd  生日（春30日 等）
  b   最喜欢（数组）
  l   喜欢
  h   讨厌
  w   最讨厌
  ret 回礼（你送他、他回你的东西）
  bath 泡澡后的乐子
  bgYou 给你的生日礼物（他送你的生日礼）
  tf/tl/th/twh 最喜欢/喜欢/讨厌/最讨厌的话题
npcgift 页的通用 giftPage() 只吃 b/l/h/w/bd 四档；其余维度作 azuma 专属折叠区另显。
"""
import re, json

HTML = "_azuma_villager.html"
OUT = "js/azuma_gift.js"

def strip_tags(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    s = s.replace("&#039;", "'").replace("&quot;", '"').replace("&nbsp;", " ")
    return s.strip()

html = open(HTML, encoding="utf-8").read()
heads = list(re.finditer(
    r'<span class="mw-headline" id="[^"]*"[^>]*>([^<]*)</span>', html))

FIELD_KEYS = ["生日", "最喜欢", "喜欢", "讨厌", "最讨厌", "回礼", "泡澡后的乐子",
              "给你的生日礼物", "最喜欢的话题", "喜欢的话题", "讨厌的话题", "最讨厌的话题",
              "一起烹饪"]

def items(v):
    if not v:
        return []
    return [x.strip() for x in re.split(r"[、,，]", v) if x.strip()]

vills = []
for i, m in enumerate(heads):
    name = m.group(1).strip()
    start = m.end()
    end = heads[i + 1].start() if i + 1 < len(heads) else len(html)
    block = html[start:end]
    ps = re.findall(r"<p[^>]*>(.*?)</p>", block, re.S)
    text = "\n".join(strip_tags(p) for p in ps)
    fields = {}
    for line in text.split("\n"):
        mm = re.match(r"^([^：:]+)[：:](.*)$", line.strip())
        if mm:
            fields[mm.group(1).strip()] = mm.group(2).strip()
    if not fields:          # 跳过没有字段的空 h2
        continue
    e = {
        "n": name,
        "bd": fields.get("生日", ""),
        "b": items(fields.get("最喜欢", "")),
        "l": items(fields.get("喜欢", "")),
        "h": items(fields.get("讨厌", "")),
        "w": items(fields.get("最讨厌", "")),
    }
    for kk, src in [("ret", "回礼"), ("bath", "泡澡后的乐子"), ("bgYou", "给你的生日礼物"),
                    ("tf", "最喜欢的话题"), ("tl", "喜欢的话题"),
                    ("th", "讨厌的话题"), ("twh", "最讨厌的话题")]:
        v = items(fields.get(src, ""))
        if v:
            e[kk] = v
    vills.append(e)

print("parsed villagers:", len(vills))
# quick stats
nb = sum(1 for v in vills if v["b"])
nl = sum(1 for v in vills if v["l"])
nh = sum(1 for v in vills if v["h"] or v["w"])
nbd = sum(1 for v in vills if v["bd"])
print("with 最喜欢=%d 喜欢=%d 讨厌(含最讨厌)=%d 生日=%d" % (nb, nl, nh, nbd))
print("sample:", json.dumps(vills[0], ensure_ascii=False)[:300])

js = [
    "/* 符文工房 龙之天地（azuma）村民喜好",
    " * 源：gametoeasy.com《符文工房:龙之天地》村民喜好（post/1853.html，发布 2025-06，CC 转载）",
    " * 与 azuma.js 的 AZUMA_MON（魔物喜好）同源，但本文件专收「人」的礼物档。",
    " * 由 _build_azuma_villager.py 从 _azuma_villager.html 解析生成，勿手改。",
    " * 字段：n 名 / bd 生日 / b 最喜欢 / l 喜欢 / h 讨厌 / w 最讨厌",
    " *       ret 回礼 / bath 泡澡后的乐子 / bgYou 给你的生日礼物 / tf tl th twh 各档话题（作折叠区）",
    " */",
    "var AZUMA_GIFT = %s;" % json.dumps(vills, ensure_ascii=False, separators=(",", ":")),
]
open(OUT, "w", encoding="utf-8").write("\n".join(js) + "\n")
print("written", OUT, "(%d bytes)" % len("\n".join(js)))
