# -*- coding: utf-8 -*-
"""
生成 js/recipe_azuma.js —— 龙之天地（azuma）配方表。

数据源：gametoeasy《符文工房：龙之天地》系列配方页（post/1286、1811～1822）。
抓取件缓存在 _azuma_p<pid>.html，本脚本只做解析，不再联网。

输出结构（保留原表列序，不做跨列转译）：
    const RECIPE_AZUMA = {
      src: "gametoeasy《符文工房：龙之天地》配方表",
      cats: [
        { k: "单手剑", page: 1814, head: ["名称","材料1",...], rows: [["钝刀","铁×2",...], ...] },
        ...
      ]
    };

原表缺陷照录，不替它补：
  - 单元格写 "—" 表示原表就没有该项
  - 摆设表「神社」一行材料写成「木材×290120」「石材×」（数字粘连／缺数），照录并在页面提示
  - 行尾缺单元格时补空串，保持与表头等长
"""
import re
import io
import json

DIR = '.'
PAGES = [
    ('单手剑', 1814),
    ('大剑', 1815),
    ('双剑', 1813),
    ('符咒', 1812),
    ('弓', 1286),
    ('药学', 1811),
    ('头部装备', 1819),
    ('肩甲', 1818),
    ('饰品', 1817),
    ('建筑物', 1820),
    ('地形', 1821),
    ('摆设', 1822),
]


def clean(s):
    s = re.sub(r'<br\s*/?>', ' ', s, flags=re.I)
    s = re.sub(r'<[^>]+>', '', s)
    s = (s.replace('&nbsp;', ' ').replace('&amp;', '&')
         .replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"')
         .replace('\u200b', '').replace('\xa0', ' '))
    return re.sub(r'\s+', ' ', s).strip()


def cells(tr):
    return [clean(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)]


def parse(pid):
    h = io.open('%s/_azuma_p%d.html' % (DIR, pid), encoding='utf-8').read()
    tbs = re.findall(r'<table.*?</table>', h, re.S)
    if not tbs:
        raise SystemExit('post/%d 无表格' % pid)
    tb = tbs[0]
    trs = re.findall(r'<tr.*?</tr>', tb, re.S)
    head = cells(trs[0])
    rows = []
    for tr in trs[1:]:
        c = cells(tr)
        if not c or not c[0]:
            continue
        if len(c) < len(head):
            c = c + [''] * (len(head) - len(c))
        elif len(c) > len(head):
            c = c[:len(head)]
        rows.append(c)
    return head, rows


def js_str(s):
    return json.dumps(s, ensure_ascii=False)


out = []
out.append('/* 龙之天地（azuma）配方表 —— 由 _build_recipe_azuma.py 从 gametoeasy 生成，勿手改 */')
out.append('const RECIPE_AZUMA = {')
out.append('    src: %s,' % js_str('gametoeasy《符文工房：龙之天地》配方表（武器五类 / 防具三类 / 建筑三类 / 药学）'))
out.append('    cats: [')
total = 0
for k, pid in PAGES:
    head, rows = parse(pid)
    total += len(rows)
    out.append('        { k: %s, page: %d,' % (js_str(k), pid))
    out.append('          head: [%s],' % ', '.join(js_str(x) for x in head))
    out.append('          rows: [')
    for r in rows:
        out.append('            [%s],' % ', '.join(js_str(x) for x in r))
    out.append('          ] },')
    print('%-6s post/%-5d %2d 列 %3d 行' % (k, pid, len(head), len(rows)))
out.append('    ]')
out.append('};')
io.open('js/recipe_azuma.js', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('合计 %d 条配方' % total)
