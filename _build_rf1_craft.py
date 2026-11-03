# -*- coding: utf-8 -*-
"""从《RF1 全资料整合》的「锻造配方一览」+「药学列表」切出 RF1 锻造/药学数据。

输出 js/rf1craft.js —— 7 个装备系（单手剑/双手剑/长枪/战锤/战斧/护盾/农具）
各一张原文字段表 + 各系「终级素材累计」+ 饰品睡袋表 + 药学表。
料理手册（刀/煎锅/锅/烤箱/蒸锅/搅拌器/无厨具料理）属于 cook 页，不进本文件。

铁律：照原文字段，不润色、不臆造；材料分隔符 ＋→+ 归一。
"""
import os

SRC = 'G:/10257/Downloads/符文攻略/RF1 符文工房·新牧场物语 全资料整合.txt'
OUT = 'js/rf1craft.js'

raw = open(SRC, encoding='utf-16').read()
lines = raw.splitlines()

start = lines.index('【锻造配方一览】')
end = lines.index('【钓鱼地点一览】')
block = lines[start + 1:end]

FAMILIES = ['单手剑系', '双手剑系', '长枪系', '战锤系', '战斧系', '护盾系', '农具系']
ACCESSORY = '装饰品及睡袋锻造列表'
PHARM = '药学列表'
COOK = '料理手册'

SECTION_NAMES = FAMILIES + [ACCESSORY, PHARM, COOK]


def norm(s):
    return s.replace('＋', '+').replace('　', ' ').strip()


# 按段标题切分；各段内首行是列头，其后是数据行，遇「终级…所需全部素材统计」转入统计子块
sections = []
cur = None
for line in block:
    s = norm(line)
    if not s:
        continue
    if s in SECTION_NAMES:
        cur = {'key': s, 'name': s, 'cols': None, 'rows': [], 'totals': [], 'in_totals': False}
        sections.append(cur)
        continue
    if cur is None:
        continue
    if '所需全部素材统计' in s:
        cur['in_totals'] = True
        continue
    if cur['cols'] is None:
        # 跳过 [注]… 说明行；主列头（名称\t锻造LV…）保留。
        # 「名称\t所需素材一览」这种统计子表头只出现在 in_totals 分支，那里已单独处理。
        if s.startswith('['):
            continue
        cur['cols'] = line.split('\t')
        continue
    if cur['in_totals']:
        if s.startswith('名称') or s.startswith('['):
            continue
        parts = line.split('\t')
        if len(parts) >= 2 and ('*' in parts[1] or '、' in parts[1]):
            cur['totals'].append([norm(parts[0]), norm(parts[1])])
        continue
    # 普通数据行
    parts = line.split('\t')
    # 源里少数「换行断掉」的孤立效果词（如长枪系「封印攻击」、战锤系「毒素攻击」）
    # —— 单字段行，并入上一行末列（附加效果），避免丢数据
    if len(parts) == 1 and cur['rows'] and not cur['in_totals']:
        cur['rows'][-1][-1] = (cur['rows'][-1][-1] + '、' + norm(parts[0])).strip('、')
        continue
    if len(parts) >= 2:
        cur['rows'].append([norm(p) for p in parts])


families = [s for s in sections if s['name'] in FAMILIES]
accessory = next((s for s in sections if s['name'] == ACCESSORY), None)
pharmacy = next((s for s in sections if s['name'] == PHARM), None)


def js_str(s):
    return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'") + "'"


def emit_table(name, cols, rows):
    n = len(cols)
    out = []
    out.append("    cols: [%s]," % ', '.join(js_str(c) for c in cols))
    out.append("    rows: [")
    for r in rows:
        row = (r + [''] * n)[:n]
        out.append("      [%s]," % ', '.join(js_str(c) for c in row))
    out.append("    ],")
    return out


out = []
out.append("/* RF1 锻造配方 + 药学 —— craft 页 RF1 分支用")
out.append(" * 源：《RF1 全资料整合》「锻造配方一览」+「药学列表」（照原文字段，未润色）")
out.append(" */")
out.append("var RF1_CRAFT = {")
out.append("  src: '《RF1 全资料整合》锻造配方一览＋药学列表',")
out.append("  families: [")
for f in families:
    out.append("    {")
    out.append("      name: %s," % js_str(f['name']))
    out.extend(emit_table(f['name'] + '_cols', f['cols'], f['rows']))
    out.append("      totals: [")
    for t in f['totals']:
        out.append("        [%s, %s]," % (js_str(t[0]), js_str(t[1])))
    out.append("      ]")
    out.append("    },")
out.append("  ],")
out.append("  accessory: {")
out.extend(emit_table('accessory', accessory['cols'], accessory['rows']))
out.append("  },")
out.append("  pharmacy: {")
out.extend(emit_table('pharmacy', pharmacy['cols'], pharmacy['rows']))
out.append("  }")
out.append("};")

with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('\n'.join(out) + '\n')

# ---- 报告 ----
print("已写", OUT)
print("装备系:", [(f['name'], len(f['rows']), len(f['totals'])) for f in families])
print("饰品睡袋:", len(accessory['rows']))
print("药学:", len(pharmacy['rows']))
total = sum(len(f['rows']) for f in families) + len(accessory['rows']) + len(pharmacy['rows'])
print("合计数据行:", total)
