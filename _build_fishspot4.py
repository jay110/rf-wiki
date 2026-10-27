# -*- coding: utf-8 -*-
"""从 RF4 解包表 Fish Rates NS 生成 js/fishspot4.js

表结构：行 = 鱼/钓物（38 条），列 2-9 = 季节×天气，10-17 = 具名水域，18-22 = 未命名地点。
原表数值是裸权重，每列总量不同（1213 ~ 5918），必须逐列归一化成百分比。
"""
import io
import json
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import _xlsx_read as R

SRC = 'G:/10257/Downloads/符文攻略/RF4数据解包汉化版 Datamining Compendium八月22日.xlsx'
z, sst, sheets = R.load(SRC)
d = {n: R.rows(z, sst, t) for n, t in sheets}
rs = d['Fish Rates NS']

# 原表 col1「RF4S简体」在 Pike 之后整体错位一行（多插了「秋刀鱼」「高身鲫」两个不存在的名字），
# 按英文原名修正这四条。
FIX = {
    'Pike': '狗鱼',
    'Blowfish': '河豚',
    'Yellowtail': '青甘鱼',
    'Crucian Carp': '鲫鱼',
}

COLS = [
    ('春', 2), ('春·雨', 3), ('夏', 4), ('夏·雨', 5),
    ('秋', 6), ('秋·雨', 7), ('冬', 8), ('冬·雨', 9),
    ('沙池', 10), ('伊德拉 B2', 11), ('伊德拉 B1', 12), ('约克米尔瀑布', 13),
    ('约克米尔池', 14), ('水之遗迹', 15), ('玛雅之路', 16), ('塞克斯洞窟', 17),
    ('地点 17', 18), ('地点 18', 19), ('地点 19', 20), ('地点 20', 21), ('地点 21', 22),
]


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


rows = []
for r in rs[2:]:
    if len(r) < 2 or not r[0] or r[0] == 'Offset':
        continue
    g = lambda i: ((r[i] if i < len(r) else '') or '').strip()
    en, cn = g(0), g(1)
    cn = FIX.get(en, cn)
    vals = [num(g(i)) for _, i in COLS]
    rows.append([cn, en] + vals)

# 逐列归一化
totals = [sum(r[2 + k] for r in rows) for k in range(len(COLS))]
out = []
for r in rows:
    cn, en = r[0], r[1]
    pct = []
    for k, tot in enumerate(totals):
        v = r[2 + k]
        # 保留两位：0.03% 这种零星概率若四舍五入到 0.1% 会夸大十倍，
        # 页面上再按「不足 0.1」显示
        pct.append(round(v / tot * 100, 2) if tot and v else 0.0)
    out.append([cn] + pct)

# 每列的种类数，给页面做表头提示
kinds = [sum(1 for r in out if r[1 + k] > 0) for k in range(len(COLS))]

js = [
    '/* RF4 钓点与季节分布：Fish Rates NS 38 条有效行 × 21 个环境列，由 _build_fishspot4.py 生成，勿手改 */',
    '/* 行格式：[鱼名, 春, 春·雨, 夏, 夏·雨, 秋, 秋·雨, 冬, 冬·雨, 沙池, 伊德拉B2, 伊德拉B1,',
    '           约克米尔瀑布, 约克米尔池, 水之遗迹, 玛雅之路, 塞克斯洞窟, 地点17~21]（百分比，逐列归一化） */',
    'var SPOT4 = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';',
    'var SPOT4_KINDS = ' + json.dumps(kinds, ensure_ascii=False, separators=(',', ':')) + ';',
]
open('js/fishspot4.js', 'w', encoding='utf-8').write('\n'.join(js) + '\n')
print('rows', len(out))
for i, (nm, _) in enumerate(COLS):
    print('%-12s kinds=%2d tot=%.0f' % (nm, kinds[i], totals[i]))
print('sample', out[0][:6])
