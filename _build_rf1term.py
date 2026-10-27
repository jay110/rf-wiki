# -*- coding: utf-8 -*-
"""
生成 js/rf1term.js —— 符文工房 新牧场物语（RF1）汉化版译名表
源：RF1文本翻译对照表-校对7（删除易混淆列）.xlsx（RF1 汉化工程文本导出）
    子表 rfItemName / rfTxtNPCName / rfTxtSavePointName / rfTxtSchedule
        / rfTxtMonsterKind / rfTxtMonsterAbility / rfItemType / rfItemAttr
"""
import re, sys, io, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _xlsx_read import load, rows

SRC = r'G:/10257/Downloads/RF1文本翻译对照表-校对7（删除易混淆列）.xlsx'
OUT = r'G:/wit_tools/work/RF_WIKI/js/rf1term.js'

TAG = re.compile(r'\{[^}]*\}')          # {结束1} {换行} 等控制标记
UNDEF = re.compile(r'^未定\d*$')         # 占位未定条目


def clean(v):
    return TAG.sub('', (v or '')).strip().replace('　', ' ')


z, sst, sheets = load(SRC)
D = {n: rows(z, sst, t) for n, t in sheets}


def pairs(name):
    out, seen = [], set()
    for r in D[name][1:]:
        a = clean(r[1] if len(r) > 1 else '')
        b = clean(r[2] if len(r) > 2 else '')
        if not a or not b:
            continue
        if UNDEF.match(a) or UNDEF.match(b):
            continue
        if (a, b) in seen:
            continue
        seen.add((a, b))
        out.append([a, b])
    return out


item = pairs('rfItemName')
npc = pairs('rfTxtNPCName')
place = pairs('rfTxtSavePointName')
event = pairs('rfTxtSchedule')
kind = [p for p in pairs('rfTxtMonsterKind') if 'モンスター' not in p[0]]
abi = pairs('rfTxtMonsterAbility')
itype = pairs('rfItemType')
attr = pairs('rfItemAttr')


def esc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')


def dump(name, data, comment):
    out = ['/* %s */' % comment, 'const %s = [' % name]
    out += ['    ["%s", "%s"],' % (esc(a), esc(b)) for a, b in data]
    out.append('];')
    return '\n'.join(out)


head = [
    '/*',
    ' * 符文工房 新牧场物语（RF1）汉化版译名表',
    ' * 由 _build_rf1term.py 生成',
    ' * 源：RF1文本翻译对照表-校对7（删除易混淆列）.xlsx（RF1 汉化工程文本导出）',
    ' * RF1 无官方中文；民间汉化已完成，本站 RF1 相关条目采用该版译名。',
    ' * 格式：[日文原文, 汉化译名]',
    ' */',
]
blocks = [
    dump('CN_RF1_ITEM', item, '物品名：日文 / 汉化译名'),
    dump('CN_RF1_NPC', npc, 'NPC 名：日文 / 汉化译名'),
    dump('CN_RF1_PLACE', place, '地点与存档点：日文 / 汉化译名'),
    dump('CN_RF1_EVENT', event, '节日与生日：日文 / 汉化译名'),
    dump('CN_RF1_KIND', kind, '魔物种类：日文 / 汉化译名'),
    dump('CN_RF1_ABI', abi, '魔物能力：日文 / 汉化译名'),
    dump('CN_RF1_TYPE', itype, '物品分类：日文 / 汉化译名'),
    dump('CN_RF1_ATTR', attr, '属性词条：日文 / 汉化译名'),
]
io.open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(head + blocks) + '\n')

print('输出', OUT)
for n, d in [('物品', item), ('NPC', npc), ('地点', place), ('节日生日', event),
             ('魔物种类', kind), ('魔物能力', abi), ('物品分类', itype), ('属性', attr)]:
    print(' %s %d' % (n, len(d)))
print('合计', sum(len(d) for _, d in [('', item), ('', npc), ('', place), ('', event),
                                  ('', kind), ('', abi), ('', itype), ('', attr)]))
