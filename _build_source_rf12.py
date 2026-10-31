# -*- coding: utf-8 -*-
"""把 biligame 符文工房 wiki 的 RF1itemdata / RF2item 两张材料表
   解析成 js/source_rf12.js，供「素材出处与掉落」页的 RF1／RF2 分支使用。

   源：
     https://wiki.biligame.com/runefactory/RF1itemdata  （80 行，7 列，买价在前）
     https://wiki.biligame.com/runefactory/RF2item      （71 行，7 列，卖价在前）
   两页买卖价顺序相反，故各留原表头，渲染时按表头找列，不按下标硬取。
"""
import io
import json
import re

PAIRS = [
    ('rf1', '_RF1itemdata.txt'),
    ('rf2', '_RF2item.txt'),
]


def clean(cell):
    """wikitext 单元格 → 纯文本。`[[a|b]]` 取 b，`[[a]]` 取 a。"""
    s = cell
    s = re.sub(r'<br\s*/?>', '', s, flags=re.I)
    s = re.sub(r'\[\[([^\]\|]+)\|([^\]]+)\]\]', r'\2', s)
    s = re.sub(r'\[\[([^\]]+)\]\]', r'\1', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('&nbsp;', ' ').replace("'''", '').replace("''", '')
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.strip('、').strip()
    return s


def parse(path):
    text = io.open(path, encoding='utf-8').read()
    head, rows = None, []
    for line in text.splitlines():
        t = line.strip()
        if t.startswith('!!'):
            continue
        if t.startswith('!'):
            head = [clean(x) for x in t[1:].split('!!')]
            continue
        if t.startswith('|-') or t.startswith('|}') or t.startswith('|+'):
            continue
        if not t.startswith('|'):
            continue
        cells = [clean(x) for x in t[1:].split('||')]
        if len(cells) != 7:
            raise SystemExit('列数异常：%s -> %r' % (path, cells))
        rows.append(cells)
    if head is None or len(head) != 7:
        raise SystemExit('表头异常：%s -> %r' % (path, head))
    return head, rows


def build():
    out = {
        'source': 'biligame 符文工房 wiki：RF1itemdata / RF2item',
    }
    for gid, path in PAIRS:
        head, rows = parse(path)
        out[gid] = {'head': head, 'rows': rows}

    body = 'const SOURCE_RF12 = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
    io.open('js/source_rf12.js', 'w', encoding='utf-8', newline='\n').write(body)
    for gid, _ in PAIRS:
        print(gid, 'head', out[gid]['head'], 'rows', len(out[gid]['rows']))


if __name__ == '__main__':
    build()
