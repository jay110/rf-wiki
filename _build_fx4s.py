# -*- coding: utf-8 -*-
"""解析 RF4S 村民与魔物三张抗性表 -> js/fx4s.js (FX4S)。
源：biligame 符文工厂 wiki 的 RF4Smonsterresist 页所引三张模板表。
三张表各自独立、名字顺序不完全一致（按源顺序照录，不强行 join）。
数值原样保留（含小数，如 2.98%），全部非负——4 代没有「弱点」概念。
列序按源：属性 火水土风光暗无爱；异常 毒封印麻痹睡眠疲劳感冒即死吸收；暴击 暴击率/暴击抗/眩晕抗/攻击硬直/攻击吹飞/吹飞抗。
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))

def rows(fname):
    path = os.path.join(HERE, '_snap', fname + '.txt')
    txt = open(path, encoding='utf-8').read()
    out = []
    for line in txt.split('\n'):
        if not line.startswith('|'):
            continue
        if line.startswith('|-') or line.startswith('|}') or line.startswith('|+'):
            continue
        cells = [c.strip() for c in line.lstrip('|').split('||')]
        if cells and cells[-1].endswith('}'):
            cells[-1] = cells[-1][:-1].strip()
        while cells and cells[-1] == '':
            cells.pop()
        out.append(cells)
    return out

E = rows('RF4S村民与怪物抗性表_0')
A = rows('RF4S村民与怪物异常抗性表_0')
C = rows('RF4S村民与怪物暴击吹飞眩晕抗性表_0')

# 列数断言（含名字列）
assert set(len(r) for r in E) == {9}, set(len(r) for r in E)
assert set(len(r) for r in A) == {9}, set(len(r) for r in A)
assert set(len(r) for r in C) == {7}, set(len(r) for r in C)

elemHead = ["名字", "火抗性", "水抗性", "土抗性", "风抗性", "光抗性", "暗抗性", "无抗性", "爱抗性"]
ailHead  = ["名字", "毒抗性", "封印抗性", "麻痹抗性", "睡眠抗性", "疲劳抗性", "感冒抗性", "即死抗性", "吸收抗性"]
critHead = ["名字", "暴击率", "暴击抗", "眩晕抗", "攻击硬直", "攻击吹飞", "吹飞抗"]

def val(c):
    # 源表把负号写成 <font color=blue>-</font>25%，剥离标签还原成 -25%
    c = re.sub(r'<[^>]+>', '', c).strip()
    return c if re.search(r'-?\d', c) else '0%'

elem = [[r[0]] + [val(c) for c in r[1:]] for r in E]
ail  = [[r[0]] + [val(c) for c in r[1:]] for r in A]
crit = [[r[0]] + [val(c) for c in r[1:]] for r in C]

# ---- 统计（用于自检与文案核对）----
def fnum(s):
    m = re.search(r'(-?\d+\.?\d*)%', s)
    return float(m.group(1)) if m else 0.0

def per_col(arr, ncol):
    return [[fnum(r[i]) for r in arr] for i in range(1, ncol + 1)]

ne = [r[0] for r in elem]; na = [r[0] for r in ail]; nc = [r[0] for r in crit]
from collections import Counter
def dup_info(names):
    c = Counter(names)
    d = {k: v for k, v in c.items() if v > 1}
    return len(d), sum(d.values())
de, dre = dup_info(ne); da, dra = dup_info(na); dc, drc = dup_info(nc)

e_cols = per_col(elem, 8)
a_cols = per_col(ail, 8)
c_cols = per_col(crit, 6)

imm = [sum(1 for x in col if x >= 100) for col in e_cols]
cap = [sum(1 for x in col if x == 200) for col in e_cols]
ez  = [sum(1 for x in col if x == 0) for col in e_cols]
wk  = [sum(1 for x in col if x <= -100) for col in e_cols]
emx = [max(col) for col in e_cols]
emn = [min(col) for col in e_cols]
zeroAll = sum(1 for r in elem if all(fnum(r[i]) == 0 for i in range(1, 9)))
capAll  = sum(1 for r in elem if all(fnum(r[i]) == 200 for i in range(1, 9)))
negAny = sum(1 for r in elem if any(fnum(r[i]) < 0 for i in range(1, 9)))

aFull = [sum(1 for x in col if x >= 100) for col in a_cols]
aZeroAll = sum(1 for r in ail if all(fnum(r[i]) == 0 for i in range(1, 9)))

cZero = [sum(1 for x in col if x == 0) for col in c_cols]
cMax  = [max(col) for col in c_cols]

EK = ['火', '水', '土', '风', '光', '暗', '无', '爱']
AK = ['毒', '封印', '麻痹', '睡眠', '疲劳', '感冒', '即死', '吸收']
CK = ['暴击率', '暴击抗', '眩晕抗', '攻击硬直', '攻击吹飞', '吹飞抗']

print('行数 elem/ail/crit =', len(elem), len(ail), len(crit))
print('重复名 elem/ail/crit =', de, da, dc)
print('属性 imm', imm, 'cap', cap, 'weak', wk, 'zero', ez, 'mx', emx, 'mn', emn)
print('属性全0', zeroAll, '全200', capAll, '有负值行', negAny)
print('异常 aFull', aFull, '全0', aZeroAll)
print('暴击 cZero', cZero, 'cMax', cMax)
print('名字集 E-only', set(ne) - set(na), 'A-only', set(na) - set(ne))
print('天堂之门写法', [n for n in ne if '天堂' in n], [n for n in na if '天堂' in n], [n for n in nc if '天堂' in n])
print('宝珠类在E不在C', [n for n in set(ne) if '宝珠' in n and n not in set(nc)])

# ---- 输出 ----
def jval(v):
    return '"' + v.replace('\\', '\\\\').replace('"', '\\"') + '"'

def jrow(r):
    return '[' + ', '.join([jval(r[0])] + [jval(c) for c in r[1:]]) + ']'

lines = []
lines.append('/* RF4S 村民与魔物抗性三表（属性抗性／异常抗性／暴击吹飞眩晕抗性）')
lines.append('   来源：biligame 符文工厂 wiki 的 RF4Smonsterresist 页所引三张模板表，')
lines.append('   原始数据出自 RF4 Datamining Compendium（reddit r/runefactory）。')
lines.append('   结构：[名字, 数值字符串...]；数值原样保留（含小数，如 2.98%），全部非负——4 代无弱点概念。')
lines.append('   三张表各自独立、名字顺序不完全一致，按源顺序照录，不强行 join。由 _build_fx4s.py 生成，勿手改。 */')
lines.append('')
lines.append('const FX4S = {')
lines.append('    elemHead: ' + jrow(elemHead) + ',')
lines.append('    ailHead:  ' + jrow(ailHead) + ',')
lines.append('    critHead: ' + jrow(critHead) + ',')
lines.append('    elem: [')
lines.append('        ' + ',\n        '.join(jrow(r) for r in elem))
lines.append('    ],')
lines.append('    ail: [')
lines.append('        ' + ',\n        '.join(jrow(r) for r in ail))
lines.append('    ],')
lines.append('    crit: [')
lines.append('        ' + ',\n        '.join(jrow(r) for r in crit))
lines.append('    ]')
lines.append('};')
lines.append('')

out = '\n'.join(lines) + '\n'
with open(os.path.join(HERE, 'js', 'fx4s.js'), 'w', encoding='utf-8') as f:
    f.write(out)
print('written js/fx4s.js', len(out), 'bytes')
