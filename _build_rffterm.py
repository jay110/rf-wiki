# -*- coding: utf-8 -*-
"""
生成 js/rffterm.js —— 符文工房 边境（RFF）汉化版定稿名词表
源：腾讯文档「边境汉化」→ 子表「名词（创建中）」
    https://docs.qq.com/sheet/DWHh3eWNNQVhLUENC （file_id: XxwycMAXKPCB）
列布局：人名 C:F / 地名节日 H:J / 物品 L:N / 其他名词 P:S
"""
import csv, io, json, re

BASE = r'G:/wit_tools/work/RF_WIKI/'
OUT = BASE + 'js/rffterm.js'

def load(fn):
    return list(csv.reader(io.open(BASE + fn, encoding='utf-8')))

a = load('_rff_terms.csv')     # 列 0..15
b = load('_rff_terms2.csv')    # 列 15..25

def c(r, i):
    return r[i].strip() if i < len(r) else ''

# ＜いせき：遺跡＞ -> 遺跡 ；＜まほう：魔法＞ -> 魔法
RUBY = re.compile(r'＜([^：]+)：([^＞]+)＞')
def deruby(s):
    return RUBY.sub(lambda m: m.group(2), s).strip()

def block(rows, idxs, has_note=False):
    out, seen = [], set()
    for r in rows[2:]:
        vals = [deruby(c(r, i)) for i in idxs]
        if not vals[0] or not vals[1]:
            continue
        key = (vals[0], vals[1])
        if key in seen:
            continue
        seen.add(key)
        out.append(vals)
    return out

person = block(a, [2, 3, 4, 5])       # 日文 / 中文 / 英文 / 形象
place = block(a, [7, 8, 9])           # 日文 / 中文 / 英文
item = block(a, [11, 12, 13])         # 日文 / 中文 / 英文
misc = block(b, [0, 1, 2])            # 日文 / 中文 / 英文

def esc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')

def dump(name, rows, comment):
    lines = ['/* %s */' % comment, 'const %s = [' % name]
    for r in rows:
        lines.append('    [' + ', '.join('"%s"' % esc(x) for x in r) + '],')
    lines.append('];')
    return '\n'.join(lines)

out = [
    '/*',
    ' * 符文工房 边境（RFF）汉化版定稿名词表',
    ' * 由 _build_rffterm.py 生成',
    ' * 源：腾讯文档「边境汉化」子表「名词（创建中）」',
    ' *      https://docs.qq.com/sheet/DWHh3eWNNQVhLUENC',
    ' * 边境无官方中文；民间汉化版已发布，本站边境相关条目统一采用该定稿译名。',
    ' * 格式：[日文原文, 汉化译名, 英文, 备注]（备注列仅人名／其他名词有）',
    ' */',
]
out.append(dump('CN_RFF_PERSON', person, '人名：日文 / 汉化译名 / 英文 / 形象说明'))
out.append('')
out.append(dump('CN_RFF_PLACE', place, '地名与节日：日文 / 汉化译名 / 英文'))
out.append('')
out.append(dump('CN_RFF_ITEM', item, '物品：日文 / 汉化译名 / 英文'))
out.append('')
out.append(dump('CN_RFF_MISC', misc, '其他名词（术语、星座、魔物）：日文 / 汉化译名 / 英文'))
io.open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(out) + '\n')

print('输出', OUT)
print('人名', len(person), '地名节日', len(place), '物品', len(item), '其他名词', len(misc))
print('合计', len(person) + len(place) + len(item) + len(misc))
