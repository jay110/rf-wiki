#!/usr/bin/env python3
# 解析 RFO 钓鱼原始文本 -> SPOT_RFO，写回 js/fishspot.js
import re, json, io, os

RAW = open(os.path.join(os.path.dirname(__file__), 'rfo_fishing_raw.txt'), encoding='utf-8').read()

# 区域候选：带前缀的放前面，纯「海」放最后，避免「1海」被拆成「1」+「海」
AREA = r'(1海|2池|1池•喷水池|1浅滩|2沿岸|3深水|4外洋|海)'
pat = re.compile(r'(.+?)\s+' + AREA + r'\s+(春|夏|秋|冬)\s+(昼|夜)\s+((?:[^ ]+ [\d-]+ ){3}[^ ]+ [\d-]+)')

rows = []
for m in pat.finditer(RAW):
    loc = m.group(1).strip()
    area = m.group(2)
    season = m.group(3)
    t = m.group(4)
    toks = m.group(5).split()
    fish = []
    for i in range(0, 8, 2):
        nm, pr = toks[i], toks[i + 1]
        if nm != '-' and pr != '-':
            fish.append([nm, int(pr)])
    rows.append([loc, area, season, t, fish])

print('解析条数:', len(rows))
locs = sorted(set(r[0] + '·' + r[1] for r in rows))
print('地点数:', len(locs))
fishes = sorted(set(f[0] for r in rows for f in r[4]))
print('鱼种数:', len(fishes))
# 抽查
print('抽查前3条:', rows[:3])

# 写回 fishspot.js
SRC = os.path.join(os.path.dirname(__file__), '..', 'js', 'fishspot.js')
txt = open(SRC, encoding='utf-8').read()
js = 'const SPOT_RFO = ' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
block = ('/* 符文工房 海洋（RFO）钓点概率：源 biligame RFOfishing\n'
         '   格式：[地点, 区域, 季节, 时间, [[鱼名, 概率], ...]]，概率为该地点该季该时段的占比 */\n'
         + js)
marker = 'const SPOT_RFO'
if marker in txt:
    # 替换已有块（到下一个顶层 const 之前）
    idx = txt.index(marker)
    end = txt.find('\nconst ', idx + len(marker))
    if end == -1:
        end = len(txt)
    txt = txt[:idx] + block + txt[end:]
else:
    txt = txt.rstrip() + '\n\n' + block
open(SRC, 'w', encoding='utf-8').write(txt)
print('已写回', SRC)
