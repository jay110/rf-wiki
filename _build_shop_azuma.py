# -*- coding: utf-8 -*-
"""从 gametoeasy《龙之天地 店铺可购买物品》(post/1827) 抓表，生成 js/shop_azuma.js

数据结构（照录原表，不做跨列翻译）：
    SHOP_AZUMA = {
      src:  "gametoeasy《符文工房：龙之天地》店铺可购买物品 (post/1827)",
      head: ["地点","商品","价格","库存","备注"],
      rows: [[地点, 商品, 价格, 库存, 备注], ...]
    }

原表「库存」「备注」两列 248 行全部是 —，照录不删。
用法：python3 _build_shop_azuma.py [html_path]
"""
import re, io, json, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else '_azuma_p1827.html'
OUT = 'js/shop_azuma.js'

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
assert len(head) == 5, head
rows = []
for tr in trs[1:]:
    c = cells(tr)
    if len(c) != 5:
        if any(c):
            print('跳过异常行', len(c), c[:3])
        continue
    rows.append(c)

rows = [r for r in rows if r[0] and r[1]]

body = ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rows)
txt = """/* 龙之天地 店铺可购买物品：由 _build_shop_azuma.py 生成，勿手改
   源：gametoeasy《符文工房：龙之天地》店铺可购买物品（post/1827）
   字段：[地点, 商品, 价格, 库存, 备注]
   说明：原表「库存」「备注」两列全部写 —，照录未删；价格照录为纯数字，未加 G。 */
const SHOP_AZUMA = {
    src: 'gametoeasy《符文工房：龙之天地》店铺可购买物品（post/1827）',
    head: %s,
    rows: [
%s
    ]
};
""" % (json.dumps(head, ensure_ascii=False), body)

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(txt)
print('rows', len(rows), '->', OUT)
