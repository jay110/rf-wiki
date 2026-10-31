# -*- coding: utf-8 -*-
"""RF1 / RF2 药学配方：把本地 biligame wikitext 快照解析成 js/recipe_rf12.js

源文件（.gitignore 里的抓取原件，本地保留）：
  _RF1recipepharmacy.txt  符文工厂：新牧场物语 药学配方
  _RF2recipepharmacy.txt  符文工厂2 药学配方
两页列位完全不同，故各自保留原表头原行，渲染时按表头找列（与 RF3 的做法一致），
不做列合并、不改数值；只把 wikitext 的链接语法降级成纯文本。
"""
import io
import json
import re

SRC = {
    'rf1': (u'_RF1recipepharmacy.txt', u'RF1recipepharmacy'),
    'rf2': (u'_RF2recipepharmacy.txt', u'RF2recipepharmacy'),
}


def clean(c):
    c = c.strip()
    # [[目标|显示]] -> 显示；[[目标]] -> 目标
    c = re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]', r'\2', c)
    c = re.sub(r'\[\[([^\]]+)\]\]', r'\1', c)
    c = re.sub(r'<ref[^>]*>.*?</ref>', '', c, flags=re.S)
    c = re.sub(r'<[^>]+>', '', c)
    c = re.sub(r"'{2,}", '', c)
    return c.strip()


def parse(path):
    head, rows = [], []
    for line in io.open(path, encoding='utf-8'):
        s = line.rstrip('\n').strip()
        if s.startswith('!'):
            head = [clean(x) for x in s.lstrip('!').split('!!')]
        elif s.startswith('|') and not s.startswith('|-') and not s.startswith('|}'):
            cells = [clean(x) for x in s.lstrip('|').split('||')]
            if len(cells) < 3:
                continue
            # 尾列可能因行尾多余 || 变空，按表头长度对齐
            if len(cells) < len(head):
                cells += [''] * (len(head) - len(cells))
            rows.append(cells[:len(head)] if len(cells) > len(head) else cells)
    return head, rows


out = {'source': u'biligame 符文工厂 wiki：RF1recipepharmacy／RF2recipepharmacy（网络来源，非官方解包，已汉化）'}
for k, (fn, src) in SRC.items():
    h, r = parse(fn)
    out[k] = {'src': src, 'head': h, 'rows': r}
    print(k, '列', len(h), '行', len(r))

with io.open('js/recipe_rf12.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(u'/* 符文工房1 / 2 的药学配方（本作配方大全只有这一类）。\n'
            u'   源：biligame 两张 RF1/RF2recipepharmacy 页，由 _build_recipe_rf12.py 生成，勿手改。\n'
            u'   两页列位不同，表头原样保留，渲染时按表头找列。 */\n')
    f.write(u'var RECIPE_RF12 = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + u';\n')
print('写出 js/recipe_rf12.js')
