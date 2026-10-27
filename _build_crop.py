# -*- coding: utf-8 -*-
"""从 RF4 解包表生成 js/cropdata.js：作物成长与土壤系数"""
import io
import json
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import _xlsx_read as R

F = 'G:/10257/Downloads/符文攻略/RF4数据解包汉化版 Datamining Compendium八月22日.xlsx'
z, sst, sh = R.load(F)
d = {n: R.rows(z, sst, t) for n, t in sh}


def g(r, i):
    return ((r[i] if i < len(r) else '') or '').strip()


def f(v):
    try:
        return float(v)
    except (ValueError, TypeError):
        return 0.0


# ---------- 价格：卖价取非零的最大值（表里有重复的 0 价占位行） ----------
sell = {}
for r in d['Item Values'][2:]:
    cn, s = g(r, 1), f(g(r, 11))
    if cn and s > sell.get(cn, -1):
        sell[cn] = s

# 种子买价：种子名 -> 作物名
seed = {}
for r in d['Item Values'][2:]:
    cn, b = g(r, 1), f(g(r, 10))
    if not cn.endswith('种子'):
        continue
    base = cn[:-2]
    if base.endswith('的'):
        base = base[:-1]
    seed.setdefault(base, b)

# 名称对不上的人工对齐（作物名 <-> 种子名前缀）
ALIAS = {'四叶草': '幸运草'}
for k, v in ALIAS.items():
    if v in seed:
        seed.setdefault(k, seed[v])

rows = []
for r in d['Crop Values'][2:]:
    st = [f(g(r, i)) for i in (2, 3, 4, 5)]
    if sum(st) <= 0:
        continue
    nm = g(r, 1)
    rows.append([
        nm,
        [int(x) for x in st],
        f(g(r, 17)),            # 再生天数
        f(g(r, 18)),            # 每株产量
        f(g(r, 15)),            # 初始 HP
        seed.get(nm, 0),        # 种子买价
        sell.get(nm, 0),        # 单个卖价
        [f(g(r, i)) for i in (22, 23, 24, 25, 26)],  # 土：综合/速度/品质/尺寸/数量
    ])

js = ['/* RF4 作物成长：Crop Values %d 条 + Item Values 价格，由 _build_crop.py 生成，勿手改 */' % len(rows),
      '/* 字段：[名, [4 阶段天数], 再生天数, 每株产量, 初始HP, 种子价, 单个卖价, [土综合,土速度,土品质,土尺寸,土数量]] */',
      'var CROP_RF4 = ' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';']
open('js/cropdata.js', 'w', encoding='utf-8').write('\n'.join(js) + '\n')

# ---------- 统计 ----------
print('作物', len(rows))
no_seed = [x[0] for x in rows if x[5] == 0]
print('无种子价', len(no_seed), no_seed)
no_sell = [x[0] for x in rows if x[6] == 0]
print('无卖价', len(no_sell), no_sell)
zero_qty = [x[0] for x in rows if x[3] == 0]
print('产量 0', zero_qty)
reg = sorted((x[2], x[0]) for x in rows if x[2] > 0)
print('再生型', len(reg), reg)
tot = sorted((sum(x[1]), x[0]) for x in rows)
print('最短', tot[:4], '最长', tot[-4:])
equal = [x[0] for x in rows if len(set(x[1])) == 1 and sum(x[1]) > 0]
print('四阶等长', equal)


def per_day(x):
    d0 = sum(x[1])
    return (x[3] * x[6] - x[5]) / d0 if d0 else 0


print('--- 首轮日收益 top8 ---')
for x in sorted(rows, key=lambda y: -per_day(y))[:8]:
    print('  %-6s %5.1f  日数%d 产%g 种%g 卖%g' % (x[0], per_day(x), sum(x[1]), x[3], x[5], x[6]))
print('--- 首轮日收益 bottom5（不含产量0）---')
for x in sorted([y for y in rows if y[3] > 0], key=per_day)[:5]:
    print('  %-6s %5.1f  日数%d 产%g 种%g 卖%g' % (x[0], per_day(x), sum(x[1]), x[3], x[5], x[6]))
print('--- 再生周期日收益 top6 ---')
for x in sorted([y for y in rows if y[2] > 0], key=lambda y: -y[3] * y[6] / y[2])[:6]:
    print('  %-6s %.0f  再生%g天 产%g 卖%g' % (x[0], x[3] * x[6] / x[2], x[2], x[3], x[6]))
print('--- 土壤系数总和 top8 ---')
for x in sorted(rows, key=lambda y: -sum(y[7]))[:8]:
    print('  %-6s %6.2f %s' % (x[0], sum(x[7]), x[7]))
print('--- 土壤系数总和 bottom5 ---')
for x in sorted(rows, key=lambda y: sum(y[7]))[:5]:
    print('  %-6s %6.2f %s' % (x[0], sum(x[7]), x[7]))
# 各列谁的系数最大
lbl = ['综合', '速度', '品质', '尺寸', '数量']
for i, nm in enumerate(lbl):
    top = sorted(rows, key=lambda y: -y[7][i])[:3]
    print(nm, [(t[0], t[7][i]) for t in top])
