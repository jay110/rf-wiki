# -*- coding: utf-8 -*-
"""从 _snap/ 的 biligame wikitext 生成 js/furniture.js（FURN）。
源：RF4furniture.txt（符文工房4 家具与服装列表）、RFFfurniture.txt（符文工房边境 自家扩建 + 家具总表）
产出 LF、UTF-8。只记商店买价，卖价整列不取。
"""
import io
import json
import re

ROOT = 'G:/wit_tools/work/RF_WIKI/'


def load(name):
    return io.open(ROOT + '_snap/' + name, encoding='utf-8', errors='replace').read()


def cell(x):
    x = re.sub(r'\[\[([^\]\|]*)\|([^\]]*)\]\]', r'\2', x)
    x = re.sub(r'\[\[([^\]]*)\]\]', r'\1', x)
    x = re.sub(r'<br\s*/?>', '／', x)
    x = re.sub(r'<[^>]+>', '', x)
    x = x.replace("'''", '').replace("''", '')
    x = x.replace('&nbsp;', ' ')
    x = re.sub(r'\s*\n\s*', '', x)
    x = x.strip()
    return '—' if x in ('', '-', '－', '—') else x


def table_rows(text, ncol):
    """取第一张表的数据行，按 || 切开；空串丢掉后核对列数。"""
    tb = re.findall(r'\{\|.*?\n\|\}', text, re.S)[0]
    rows, cur = [], []
    for line in tb.split('\n'):
        if line.startswith('|-'):
            if cur:
                rows.append(cur)
                cur = []
        elif line.startswith('|}'):
            if cur:
                rows.append(cur)
                cur = []
        elif line.startswith('|') and not line.startswith('|+'):
            cur.extend([c for c in line[1:].split('||') if c.strip() != ''])
    if cur:
        rows.append(cur)
    bad = [r for r in rows if len(r) != ncol]
    assert not bad, ('列数不符', len(bad), [[cell(c) for c in r] for r in bad[:3]])
    return [[cell(c) for c in r] for r in rows]


# ---------------- RF4：商家 / 商品 / 解锁 / 价格 / 木材 / 石材 / 数量 ----------------
rf4_src = load('RF4furniture.txt')
rf4 = [[r[0], r[1], r[2], r[3], r[4], r[5]] for r in table_rows(rf4_src, 7)]

# ---------------- RFF：扩建表 + 家具总表 ----------------
rff_src = load('RFFfurniture.txt')
blocks = re.findall(r'\{\|.*?\n\|\}', rff_src, re.S)
# 三张表：自家扩建、家具总表、礼物配方。礼物那张跟家具无关，只取前两张。
assert len(blocks) == 3, len(blocks)
assert '种类' in blocks[0] and '商品中文' in blocks[1], '表的顺序变了'


def rows_from(tb, ncol):
    rows, cur = [], []
    for line in tb.split('\n'):
        if line.startswith('|-'):
            if cur:
                rows.append(cur)
                cur = []
        elif line.startswith('|}'):
            if cur:
                rows.append(cur)
                cur = []
        elif line.startswith('|') and not line.startswith('|+'):
            cur.extend([c for c in line[1:].split('||') if c.strip() != ''])
    if cur:
        rows.append(cur)
    bad = [r for r in rows if len(r) != ncol]
    assert not bad, ('RFF 列数不符', [[cell(c) for c in r] for r in bad[:3]])
    return [[cell(c) for c in r] for r in rows]


exp = rows_from(blocks[0], 3)          # 种类 / 金钱 / 木材
items = rows_from(blocks[1], 7)        # 商店 / 类别 / 商品 / 价格 / 售卖时间 / 解锁 / 物品Lv

# 商店名统一（源表只有卢特一家）；物品Lv 全为 —，丢掉；商店列也丢（只有一家）
items = [[r[1], r[2], r[3], r[4], r[5]] for r in items]
assert all(r[0] in ('家具', '厨具', '加工机') for r in items), set(r[0] for r in items)

# ---------------- RF5：帕尔摩工房（家具与扩建同表，只取家具） ----------------
rf5_src = load('RF5town.txt')
seg = rf5_src[rf5_src.index('==[[帕尔摩工房]]=='):rf5_src.index('==参考与注释==')]
rows5, cur = [], []
for line in seg.split('\n'):
    if line.startswith('|-'):
        if cur:
            rows5.append(cur)
            cur = []
    elif line.startswith('|') and not line.startswith('|+') and not line.startswith('|}'):
        cur.extend([c for c in line[1:].split('||') if c.strip() != ''])
if cur:
    rows5.append(cur)
bad5 = [r for r in rows5 if len(r) != 7]
assert not bad5, ('RF5 列数不符', [[cell(c) for c in r] for r in bad5[:3]])
rows5 = [[cell(c) for c in r] for r in rows5]
assert all(r[0] in ('家具', '扩建') for r in rows5), set(r[0] for r in rows5)
# 表头顺序是 类别/商品/金币/SEED点/石材/木材/备注 —— 与 RF4 表的「木材在前」相反，照录不改
rf5 = [[r[1], r[2], r[3], r[4], r[5], r[6]] for r in rows5 if r[0] == '家具']

out = {
    'rf4': {'cols': ['商家', '商品', '解锁', '价格', '木材', '石材'], 'rows': rf4},
    'rff': {
        'expand': {'cols': ['种类', '金钱', '木材'], 'rows': exp},
        'items': {'cols': ['类别', '商品', '价格', '售卖日', '解锁'], 'rows': items},
    },
    'rf5': {'cols': ['商品', '金币', 'SEED点', '石材', '木材', '备注'], 'rows': rf5},
}

body = json.dumps(out, ensure_ascii=False, indent=1)
js = (
    '/* 家具与服装：由 _build_furniture.py 从 _snap/RF4furniture.txt、_snap/RFFfurniture.txt 生成。\n'
    '   源：biligame《符文工厂4 家具与服装列表》(RF4furniture)、《符文工厂边境 自家扩建 + 家具总表》(RFFfurniture)、\n'
    '       《RF5 城镇店铺》(RF5town) 里的帕尔摩工房一节。\n'
    '   只收买价；源表里的卖价整列不取。RFF 的商品名源站仍是日文原名，照录不译。 */\n'
    'const FURN = ' + body + ';\n'
)
io.open(ROOT + 'js/furniture.js', 'w', encoding='utf-8', newline='\n').write(js)

print('rf4 rows', len(rf4))
print('rff expand', len(exp), 'items', len(items))
from collections import Counter
print('rf4 merchants', Counter(r[0] for r in rf4))
print('rff cats', Counter(r[0] for r in items))
print('rf5 rows', len(rf5), 'with material', sum(1 for r in rf5 if r[3] != '—' or r[4] != '—'))
