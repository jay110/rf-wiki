# -*- coding: utf-8 -*-
"""
构建 js/fish_old.js —— 符文工房 2 / 边境 的鱼类数值表

源：biligame wiki
  RF2fish   https://wiki.biligame.com/runefactory/RF2fish
  RFFfish   https://wiki.biligame.com/runefactory/RFFfish

字段保留源表原貌（不推断、不换算）：
  FISH_RF2 : [名, 卖价, 买价, 概率, 钓点]      —— 源表列序即「卖价 / 买价」
  FISH_RFF : [名, 买价, 卖价, 等级范围, 钓点]  —— 源表列序即「买价 / 卖价」，与 RF2 相反

两作的买价/卖价列序相反是源表本身如此，不是笔误，故不统一。
"""
import re, json, io

def cells(r):
    return [re.sub(r'<[^>]+>', '', c).strip()
            for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]

def trows(fn, idx=0):
    t = open(fn, encoding='utf-8', errors='ignore').read()
    tb = re.findall(r'<table.*?</table>', t, re.S)[idx]
    return [cells(r) for r in re.findall(r'<tr.*?</tr>', tb, re.S)]

def clean(s):
    s = (s or '').strip().replace('　', ' ')
    if s in ('', '-', '--', '－', '—', '–', '/'):
        return '—'
    return s

# ---------- RF2 ----------
rf2_rows = trows('_tmp_RF2fish.html')[1:]
FISH_RF2 = []
for r in rf2_rows:
    if len(r) < 5:
        continue
    name = clean(r[0])
    sell, buy, prob, place = clean(r[1]), clean(r[2]), clean(r[3]), clean(r[4])
    # 概率为「-」的四条是钓物（空罐/高筒靴/石头/树枝），源表即如此
    FISH_RF2.append([name, sell, buy, prob, place])

# ---------- RFF ----------
rff_rows = trows('_tmp_RFFfish.html')[1:]
FISH_RFF = []
for r in rff_rows:
    if len(r) < 5:
        continue
    FISH_RFF.append([clean(r[0]), clean(r[1]), clean(r[2]), clean(r[3]), clean(r[4])])

def dump(name, arr, note=''):
    lines = [f'const {name} = [']
    for row in arr:
        lines.append('    ' + json.dumps(row, ensure_ascii=False) + ',')
    lines.append('];')
    return '\n'.join(lines)

head = '''/* ============================================================
   符文工房 2 / 边境 —— 鱼类数值表（源：biligame wiki）
   FISH_RF2  https://wiki.biligame.com/runefactory/RF2fish
   FISH_RFF  https://wiki.biligame.com/runefactory/RFFfish

   FISH_RF2 : [名, 卖价, 买价, 概率, 钓点]
   FISH_RFF : [名, 买价, 卖价, 等级范围, 钓点]

   注意两作买卖价列序相反，这是源表原样，未做统一。
   RF2 的「概率」列里「-」的四条（空罐/高筒靴/石头/树枝）是钓上杂物，
   源表本身不标概率，如实保留。
   ============================================================ */
'''

body = '\n\n'.join([
    f'/* RF2：{len(FISH_RF2)} 条（含 4 条钓上杂物） */',
    dump('FISH_RF2', FISH_RF2),
    '',
    f'/* 边境 RFF：{len(FISH_RFF)} 条，买价一律「—」（钓上即得，无出售渠道） */',
    dump('FISH_RFF', FISH_RFF),
])

with io.open('js/fish_old.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(head + '\n' + body + '\n')

print('FISH_RF2:', len(FISH_RF2), 'FISH_RFF:', len(FISH_RFF))
print('rf2 钓物（概率为—）:', [r[0] for r in FISH_RF2 if r[3] == '—'])
print('rff 买价非— 的:', [r[0] for r in FISH_RFF if r[1] != '—'])
