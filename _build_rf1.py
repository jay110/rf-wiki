# -*- coding: utf-8 -*-
"""生成 js/rf1data.js —— 数据源：RF1文本翻译对照表-校对7（删除易混淆列）.xlsx"""
import os
import _xlsx_read as X

SRC = r'G:/10257/Downloads/RF1文本翻译对照表-校对7（删除易混淆列）.xlsx'
OUT = r'G:/wit_tools/work/RF_WIKI/js/rf1data.js'

# 分段：按解包表中物品的排列顺序切分（左闭右开）
SEGS = [
    ('作物', 0, 19),
    ('草与花', 19, 48),
    ('药', 48, 73),
    ('料理与食材', 73, 254),
    # 武器段（254~330）在解包表里是按武器种类顺着排的，这里拆成五种，
    # 免得整段都标成笼统的「武器」——区间是照排布数出来的，一改前面的段就要重算
    ('单手剑', 254, 275),
    ('双手剑', 275, 296),
    ('长枪', 296, 317),
    ('锤', 317, 324),
    ('斧', 324, 330),
    ('农具与工具', 330, 361),
    ('盾与饰品', 361, 446),
    ('道具', 446, 465),
    ('种子', 465, 497),
    ('魔法书', 497, 512),
    ('素材', 512, 591),
    ('鱼', 591, 621),
    ('垃圾', 621, 623),
    ('书与贵重品', 623, 662),
]


def seg_of(i):
    for name, a, b in SEGS:
        if a <= i < b:
            return name
    return ''


z, sst, sheets = X.load(SRC)
d = dict(sheets)


def clean(s):
    import re
    if not s:
        return ''
    s = s.replace('{结束1}', '').replace('{结束2}', '')
    s = re.sub(r'\{换行\d*\}', '\n', s)
    s = re.sub(r'\{[^}]*\}', '', s)
    return s.strip()


def tab(name):
    return X.rows(z, sst, d[name])


# ---------- 物品 ----------
import re
items = {}
for r in tab('rfItemHelp')[1:]:
    if not r or not r[0]:
        continue
    m = re.match(r'rfItemHelp_(\d+)(?:_(\d+))?:?$', r[0].strip())
    if not m or m.group(2) is None:
        continue
    idx, sub = int(m.group(1)), int(m.group(2))
    it = items.setdefault(idx, {'name': '', 'lines': []})
    if len(r) > 4 and clean(r[4]) and not it['name']:
        it['name'] = clean(r[4])
    txt = clean(r[2]) if len(r) > 2 else ''
    if txt:
        it['lines'].append((sub, txt))

# 名字表（补全说明为空但有名字的条目，并核对一致性）
names = {}
for r in tab('rfItemName')[1:]:
    m = re.match(r'rfItemName_(\d+):?$', (r[0] or '').strip())
    if m and len(r) > 2:
        names[int(m.group(1))] = clean(r[2])

rows = []
skipped = []
for i in sorted(items):
    v = items[i]
    nm = v['name'] or names.get(i, '')
    if not nm:
        continue
    if nm.startswith('未使用') or nm.startswith('未定'):
        skipped.append(nm)
        continue
    txt = '\n'.join(t for _, t in sorted(v['lines']))
    first = (v['lines'][0][1] if v['lines'] else txt.split('\n')[0]) if v['lines'] else ''
    rows.append([nm, seg_of(i), first if txt else '—', txt if txt else '—'])

print('物品', len(rows), '跳过', len(skipped))
from collections import Counter
print(Counter(r[1] for r in rows))
print('无说明', sum(1 for r in rows if r[3] == '—'))


def simple(name, drop=()):
    out, seen = [], []
    for r in tab(name)[1:]:
        if len(r) > 2 and clean(r[2]):
            c = clean(r[2])
            if c in drop:
                continue
            out.append((clean(r[1]), c))
            if c not in seen:
                seen.append(c)
    return out, seen


kinds, kind_u = simple('rfTxtMonsterKind', drop=('身边没有一起的魔物',))
abils, abil_u = simple('rfTxtMonsterAbility')
places, place_u = simple('rfTxtSavePointName')
npcs, npc_u = simple('rfTxtNPCName')
sched, sched_u = simple('rfTxtSchedule')

print('种族', len(kind_u), kind_u)
print('特技', len(abil_u))
print('地名', len(place_u))
print('NPC', len(npc_u))
print('日程', len(sched_u))

evs = [c for c in sched_u if '生日' not in c]
bds = [c for c in sched_u if '生日' in c]
print('节日', len(evs), '生日', len(bds))
print(evs)
print(bds)


def js(o):
    import json
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


out = []
out.append('/* RF1《符文工房 新牧场物语》独立数据 —— 源：RF1 汉化工程文本对照表（校对7）')
out.append('   物品名与说明按 rfItemHelp 的「rfItemName 参照」列配对，非按索引猜测。 */')
out.append('const ITEM_RF1 = ' + js(rows) + ';')
out.append('')
out.append('/* 魔物种族：游戏内魔物图鉴的 10 个种族标签 */')
out.append('const KIND_RF1 = ' + js(kind_u) + ';')
out.append('')
out.append('/* 魔物特技：攻击属性 4 种 + 附加效果 7 种 */')
out.append('const ABIL_RF1 = ' + js(abil_u) + ';')
out.append('')
out.append('/* 存档点（含洞窟分层），即这一作的地名表 */')
out.append('const PLACE_RF1 = ' + js(place_u) + ';')
out.append('')
out.append('/* 居民姓名 */')
out.append('const NPC_RF1 = ' + js(npc_u) + ';')
out.append('')
out.append('/* 年度日程：解包表给的是顺序，不含日期 */')
out.append('const CAL_RF1 = ' + js(sched_u) + ';')

# 源表（RF1 汉化工程的文本对照表）写的是「蜜丝特」，第五十九次全站已统一成「密丝特」。
# 生成物要跟着站内口径走，否则重跑一次就把统一过的译名改回去了。
# 按整串文本替换，所以「蜜丝特布鲁姆」也会一并对上。
NAME_FIX = {'蜜丝特': '密丝特'}
for a, b in NAME_FIX.items():
    out = [ln.replace(a, b) for ln in out]

with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(out) + '\n')
print('写入', OUT, os.path.getsize(OUT), 'bytes')
