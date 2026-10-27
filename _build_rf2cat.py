#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""给 ITEM_RF2 补分类列：按解包排列顺序分段（边界已逐条核对名称）。

ITEM_RF2 由 [名称, 首句, 全文] 改为 [名称, 分类, 首句, 全文]。
"""
import io
import json
import re

P = 'G:/wit_tools/work/RF_WIKI/js/rf2data.js'
s = io.open(P, encoding='utf-8').read()

m = re.search(r'const ITEM_RF2 = (\[.*?\]\]);\n', s, re.S)
assert m, 'ITEM_RF2 未找到'
IT = json.loads(m.group(1))
assert len(IT) == 763, len(IT)
assert len(IT[0]) == 3, IT[0]

# 索引区间（含端点）→ 分类
SEGS = [
    ('作物与果树', 0, 28),
    ('草与花', 29, 58),
    ('药品与香料', 59, 75),
    ('刺身', 76, 100),
    ('料理', 101, 242),
    ('乳制品与食材', 244, 263),
    ('剑', 264, 319),
    ('长枪', 320, 347),
    ('锤', 348, 368),
    ('斧', 369, 389),
    ('农具', 390, 413),
    ('魔杖', 414, 425),
    ('盾', 426, 440),
    ('饰品', 441, 511),
    ('魔法与技能', 512, 514),
    ('道具与工具', 515, 525),
    ('种子', 526, 568),
    ('魔法与技能', 569, 609),
    ('素材', 610, 687),
    ('贵重品与剧情道具', 688, 727),
    ('鱼', 728, 757),
    ('垃圾', 758, 762),
]
# 个别条目位置在段内但性质不同：艾丽草夹在料理段末尾，实际是花草
OVERRIDE = {243: '草与花'}

cat = [None] * len(IT)
for name, a, b in SEGS:
    for i in range(a, b + 1):
        assert cat[i] is None, ('重叠', i)
        cat[i] = name
for i, c in OVERRIDE.items():
    cat[i] = c
missing = [i for i, c in enumerate(cat) if c is None]
assert not missing, ('未归类', missing)

OUT = [[r[0], cat[i], r[1], r[2]] for i, r in enumerate(IT)]

# 统计
from collections import Counter
c = Counter(x[1] for x in OUT)
order = []
for x in OUT:
    if x[1] not in order:
        order.append(x[1])
print('分类数', len(order), '总计', len(OUT))
for k in order:
    print('  %-10s %3d' % (k, c[k]))
print('排序后:', ' '.join('%s %d' % (k, c[k]) for k in c.most_common()))

body = json.dumps(OUT, ensure_ascii=False, separators=(',', ':'))
new = 'const ITEM_RF2 = ' + body + ';\n'
s = s[:m.start()] + new + s[m.end():]
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('written', len(new), 'bytes')
