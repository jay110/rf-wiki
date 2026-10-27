#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""把 RF1 / RF3 / 边境 的「武器」大类按解包顺序细分成具体类型。

段边界已按名称逐条核对：
  RF1   76 = 单手剑21(阔剑→符文剑) 双手剑21(大剑→元素之力) 长枪21(长枪→永恒之枪) 锤7(战斗锤→钉锤) 斧6(战斧→偃月斧)
  RF3  208 = 单手剑33(阔剑→隐形剑) 双手剑34(大剑→八岐大蛇) 长枪32(长枪→五节棍) 锤27(破锤子→飞溅之星)
              斧22(破斧→棒棒糖) 魔杖14(魔杖→魔法注射器) 双剑31(短剑→双重正义) 盾15(迷你盾→魔术盾)
  边境  121 = 单手剑22(阔剑→单手剑21) 双手剑22(双手剑→双手剑21) 长枪22(长枪→枪21)
              锤22(破锤子→锤子21) 斧22(破斧→斧21) 魔杖11(火焰之杖→风暴之杖)
"""
import io
import json
import re
import sys

TARGETS = [
    ('js/rf3data.js', 'ITEM_RF3', 'RF3', [
        ('单手剑', 33, '阔剑', '隐形剑'),
        ('双手剑', 34, '大剑', '八岐大蛇'),
        ('长枪', 32, '长枪', '五节棍'),
        ('锤', 27, '破锤子', '飞溅之星'),
        ('斧', 22, '破斧', '棒棒糖'),
        ('魔杖', 14, '魔杖', '魔法注射器'),
        ('双剑', 31, '短剑', '双重正义'),
        ('盾', 15, '迷你盾', '魔术盾'),
    ]),
    ('js/rffdata.js', 'ITEM_RFF', '边境', [
        ('单手剑', 22, '阔剑', '单手剑21'),
        ('双手剑', 22, '双手剑', '双手剑21'),
        ('长枪', 22, '长枪', '枪21'),
        ('锤', 22, '破锤子', '锤子21'),
        ('斧', 22, '破斧', '斧21'),
        ('魔杖', 11, '火焰之杖', '风暴之杖'),
    ]),
]

ROOT = 'G:/wit_tools/work/RF_WIKI/'

for rel, var, label, segs in TARGETS:
    P = ROOT + rel
    s = io.open(P, encoding='utf-8').read()
    m = re.search(r'const ' + var + r' = (\[.*?\]\]);\n', s, re.S)
    assert m, (label, '未找到', var)
    IT = json.loads(m.group(1))

    idx = [i for i, r in enumerate(IT) if r[1] == '武器']
    total = sum(x[1] for x in segs)
    assert len(idx) == total, (label, '武器件数不符', len(idx), total)
    # RF3 的武器段中间夹着 27 件农具（镰刀/洒水壶/锄头/钓竿），所以按出现顺序分段，
    # 不要求索引连续；靠每段首尾条目的名字断言兜底。

    k = 0
    for name, n, head, tail in segs:
        chunk = idx[k:k + n]
        assert IT[chunk[0]][0] == head, (label, name, '首条应为', head, '实际', IT[chunk[0]][0])
        assert IT[chunk[-1]][0] == tail, (label, name, '末条应为', tail, '实际', IT[chunk[-1]][0])
        for i in chunk:
            IT[i][1] = name
        k += n

    body = json.dumps(IT, ensure_ascii=False, separators=(',', ':'))
    s = s[:m.start()] + 'const ' + var + ' = ' + body + ';\n' + s[m.end():]
    io.open(P, 'w', encoding='utf-8', newline='\n').write(s)

    from collections import Counter
    c = Counter(r[1] for r in IT)
    order = []
    for r in IT:
        if r[1] not in order:
            order.append(r[1])
    print('%s: %d 类 / %d 件  →  %s' % (label, len(order), len(IT),
          ' · '.join('%s %d' % (k2, c[k2]) for k2 in order)))
