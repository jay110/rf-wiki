#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""BOSS 战数据构建：wikitext -> js/boss.js

来源（biligame 符文工厂 wiki，原始文本存 _boss_src/）：
    _boss_src/rf1.txt   ← [[RF1洞窟BOSS数据]]
    _boss_src/rf2.txt   ← [[RF2boss]]
    _boss_src/rfo.txt   ← [[RFOBOSS]]
RF3 没有独立 BOSS 页，数据取自 js/mon3.js 里的 BOSS_RF3（同源于 RF3魔物怪物抗性表）。

输出字段：
    rf1 [名, 地点, HP, EXP, 防御, 魔防, 物理抗, 火, 水, 地, 风]
    rf2 [名, 耐性, 属性, 掉落, HP, EXP, 地点]
    rf3 [名, 抗性, 掉落]
    rfo [名, LV, HP, 攻击, 防御, 魔攻, 魔防, EXP, 出现点, 组]
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "_boss_src")
OUT = os.path.join(ROOT, "js", "boss.js")


def clean(s):
    """[[日文|中文]] -> 中文；[[词条]] -> 词条；去 <br> 与多余空白"""
    s = s.strip()
    for m in re.finditer(r"\[\[([^\]|]+)\|([^\]]+)\]\]", s):
        pass
    s = re.sub(r"\[\[[^\]|]+\|([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    s = s.replace("<br>", "、").replace("<br/>", "、").replace("<br />", "、")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def rows(path):
    """把 wikitable 的数据行切成字段列表"""
    out = []
    for ln in open(path, encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.startswith("|"):
            continue
        if ln.startswith("|-") or ln.startswith("|+") or ln.startswith("!") or ln.startswith("|}"):
            continue
        f = ln[1:].split("||")
        out.append([clean(x) for x in f])
    return out


def num(s, d=0):
    s = (s or "").strip()
    if s in ("", "-", "—", "？", "?"):
        return d
    try:
        return int(float(s))
    except ValueError:
        return d


# ---------------- RF1 ----------------
rf1 = []
place1 = json.loads(re.search(
    r"RF1_PLACE = (\{.*?\});", open(os.path.join(ROOT, "js", "rf1mon.js"), encoding="utf-8").read(), re.S).group(1))
for f in rows(os.path.join(SRC, "rf1.txt")):
    if len(f) < 11:
        continue
    jp = f[10].strip()
    rf1.append([f[0], place1.get(jp, jp), num(f[1]), num(f[2]), num(f[3]),
                num(f[4]), num(f[5]), num(f[6]), num(f[7]), num(f[8]), num(f[9])])

# ---------------- RF2 ----------------
rf2 = []
for f in rows(os.path.join(SRC, "rf2.txt")):
    if len(f) < 7:
        continue
    rf2.append([f[0], f[1], f[2], f[3], num(f[4]), num(f[5]), f[6]])

# ---------------- RF3（复用 mon3.js） ----------------
src3 = open(os.path.join(ROOT, "js", "mon3.js"), encoding="utf-8").read()
rf3 = json.loads(re.search(r"BOSS_RF3\s*=\s*(\[.*?\]\]);", src3, re.S).group(1))
rf3 = [[x[0], x[1], x[2].rstrip("，")] for x in rf3]

# ---------------- RFO ----------------
rf4by = {"story": "剧情", "arena": "竞技场", "maze": "迷宫大型"}
rfo = []
for f in rows(os.path.join(SRC, "rfo.txt")):
    if len(f) < 9:
        continue
    spot = f[8]
    if "竞技场" in spot:
        grp = "arena"
    elif re.match(r"^[A-J]\d", spot):
        grp = "maze"
    else:
        grp = "story"
    rfo.append([f[0], num(f[1]), num(f[2]), num(f[3]), num(f[4]),
                num(f[5]), num(f[6]), num(f[7]), spot, grp])

# 剧情线按出现顺序排；竞技场按 BOSS 战 1~6 两轮；迷宫按字母
order = {"story": 0, "arena": 1, "maze": 2}
rfo = [x for _, x in sorted(enumerate(rfo), key=lambda t: (order[t[1][9]], t[0]))]

# ---------------- RF5（主线 BOSS，源 RF5mainstory） ----------------
def rows_pipe(path):
    """rf5.txt 用单竖线分隔，首尾各一个 |"""
    out = []
    for ln in open(path, encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.startswith("|"):
            continue
        out.append([clean(x) for x in ln.strip("|").split("|")])
    return out

rf5 = []
def num_or_none(s):
    s = (s or "").strip()
    if s in ("", "-", "—", "？", "?"):
        return None
    try:
        return int(float(s))
    except ValueError:
        return None
for f in rows_pipe(os.path.join(SRC, "rf5.txt")):
    if len(f) < 10:
        continue
    weak = f[8].strip()
    resist = f[9].strip()
    rf5.append([f[0], num(f[1]), num(f[2]), num_or_none(f[3]), num_or_none(f[4]),
                num_or_none(f[5]), num_or_none(f[6]), num(f[7]),
                "" if weak in ("", "-", "—", "？", "?") else weak,
                "" if resist in ("", "-", "—", "？", "?") else resist])


head = """/* BOSS 战数据
   来源：biligame 符文工厂 wiki（原始 wikitext 存 _boss_src/）
     rf1 ← [[RF1洞窟BOSS数据]]
     rf2 ← [[RF2boss]]
     rf3 ← [[RF3魔物怪物抗性表]]（经 js/mon3.js 的 BOSS_RF3）
     rfo ← [[RFOBOSS]]
     rf5 ← [[RF5mainstory]]（主线 BOSS，资料来源电玩巴士）
   字段：
     rf1 [名, 地点, HP, EXP, 防御, 魔防, 物理抗, 火, 水, 地, 风]
     rf2 [名, 耐性, 属性, 掉落, HP, EXP, 地点]
     rf3 [名, 抗性描述, 掉落]
     rfo [名, LV, HP, 攻击, 防御, 魔攻, 魔防, EXP, 出现点, 组]
     rf5 [名, Lv, HP, 攻击, 魔攻, 防御, 魔防, 狂暴%, 弱点, 抵抗]
   口径：RF1、RFO 的属性是「属性攻击／防御点数」，数值越高越抗打，最低的那项才是弱点；
        RF3 是等级制（−2 受伤 3 倍、−1 受伤 1.5 倍、1 减半、2 减 7/8、3 免疫、4 回血）。
   构建：python _build_boss.py（改了 _boss_src/*.txt 或 mon3.js 后重跑）
*/
"""


def js(v):
    return json.dumps(v, ensure_ascii=False, separators=(",", ":"))


body = "var BOSS = {\n"
body += "    rf1: " + js(rf1) + ",\n"
body += "    rf2: " + js(rf2) + ",\n"
body += "    rf3: " + js(rf3) + ",\n"
body += "    rfo: " + js(rfo) + ",\n"
body += "    rf5: " + js(rf5) + "\n};\n"

open(OUT, "w", encoding="utf-8", newline="\n").write(head + body)
print("rf1", len(rf1), "| rf2", len(rf2), "| rf3", len(rf3), "| rfo", len(rfo), "| rf5", len(rf5))
print("rfo 分组",
      {k: len([x for x in rfo if x[9] == k]) for k in ("story", "arena", "maze")})
print("写出", OUT, os.path.getsize(OUT), "bytes")
for x in rf1:
    print("  rf1", x[0], x[1], x[2], "弱点", min(x[7:11]))
for x in rf2:
    print("  rf2", x[0], x[3], x[4], x[6])
for x in rfo[:6]:
    print("  rfo", x[0], x[1], x[2], x[8])
for x in rf5:
    print("  rf5", x[0], "Lv" + str(x[1]), "HP" + str(x[2]), "弱[" + x[8] + "] 抗[" + x[9] + "]")
