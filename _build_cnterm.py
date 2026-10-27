# -*- coding: utf-8 -*-
"""
生成 js/cnterm.js —— 符文工房 海洋（RFO）汉化版定稿术语表
源：海洋汉化项目 cn_terms.json（类别／日文／译名／备注）
"""
import json, io, collections

SRC = r'G:/wit_tools/work/RF_Oceans_CN/cn_terms.json'
OUT = r'G:/wit_tools/work/RF_WIKI/js/cnterm.js'

rows = json.load(open(SRC, encoding='utf-8'))
data = [r for r in rows[1:] if len(r) > 2 and r[1] and r[2]]

CATMAP = {'节日 / 活动': '节日活动', '说话方式': '其它', '地点': '地名',
          '常用词': '用词', '按键': '用词'}
for r in data:
    r[0] = CATMAP.get(r[0].strip(), r[0].strip())
    r[3] = (r[3] or '').strip().replace('\n', ' ')
data = [[r[0], r[1].strip(), r[2].strip(), r[3]] for r in data]

ORDER = ['人名', '地名', '设施', '节日活动', '用词', '其它']
data.sort(key=lambda r: (ORDER.index(r[0]) if r[0] in ORDER else 99,))


def esc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')


lines = [
    '/*',
    ' * 符文工房 海洋（RFO）汉化版定稿术语表',
    ' * 由 _build_cnterm.py 生成，源：海洋汉化项目 cn_terms.json',
    ' * 海洋 Wii 亚洲版自带官方中文；PS3 版汉化沿用同一套译名。',
    ' * CN_RFO 格式：[类别, 日文原文, 汉化译名, 备注]',
    ' * 类别：人名 / 地名 / 设施 / 节日活动 / 用词 / 其它',
    ' */',
    'const CN_RFO = [',
]
lines += ['    ["%s", "%s", "%s", "%s"],' % (esc(c), esc(j), esc(n), esc(t)) for c, j, n, t in data]
lines.append('];')
io.open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')

c = collections.Counter(r[0] for r in data)
print('输出', OUT, '总条数', len(data), dict(c))
