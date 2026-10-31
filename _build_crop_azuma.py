# -*- coding: utf-8 -*-
"""从 gametoeasy《龙之天地 种地攻略丨种子获取方式》(post/1808) 抓表，生成 js/crop_azuma.js

数据结构（照录原表，不做跨列翻译）：
    CROP_AZUMA = {
      src:  "gametoeasy《符文工房：龙之天地》种地攻略丨种子获取方式 (post/1808)",
      head: ["名称","种子买价","种子卖价","卖价","买价","生长天数","适宜季节","不适季节","解锁","商店"],
      rows: [[名称, 种子买价, 种子卖价, 卖价, 买价, 生长天数, 适宜季节, 不适季节, 解锁, 商店], ...]
    }

原表把「没有」写成 ×，「不适用」写成 —，两种都照录，由页面自己解释。
用法：python3 _build_crop_azuma.py [html_path]
"""
import re, io, json, sys, os

SRC = sys.argv[1] if len(sys.argv) > 1 else '_azuma_p1808.html'
OUT = 'js/crop_azuma.js'

h = io.open(SRC, encoding='utf-8').read()
tb = re.findall(r'<table.*?</table>', h, re.S)[0]
trs = re.findall(r'<tr.*?</tr>', tb, re.S)


def cells(tr):
    raw = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)
    out = []
    for c in raw:
        c = re.sub(r'<br\s*/?>', '、', c)
        c = re.sub(r'<[^>]+>', '', c)
        c = c.replace('\u00a0', ' ')
        out.append(re.sub(r'\s+', ' ', c).strip())
    return out


head = cells(trs[0])
assert len(head) == 10, head
rows = []
for tr in trs[1:]:
    c = cells(tr)
    if len(c) != 10:
        if any(c):
            print('跳过异常行', len(c), c[:3])
        continue
    rows.append(c)

# 只保留 10 列、名字非空的
rows = [r for r in rows if r[0]]

body = ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rows)
txt = """/* 龙之天地 作物与花木：由 _build_crop_azuma.py 生成，勿手改
   源：gametoeasy《符文工房：龙之天地》种地攻略丨种子获取方式（post/1808）
   字段：[名称, 种子买价, 种子卖价, 卖价, 买价, 生长天数, 适宜季节, 不适季节, 解锁, 商店]
   说明：原表「没有」写 ×、「不适用」写 —，两种都照录；原表没有单株产量，本页不推算。 */
const CROP_AZUMA = {
    src: 'gametoeasy《符文工房：龙之天地》种地攻略丨种子获取方式（post/1808）',
    head: %s,
    rows: [
%s
    ]
};
""" % (json.dumps(head, ensure_ascii=False), body)

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(txt)
print('rows', len(rows), '->', OUT)
