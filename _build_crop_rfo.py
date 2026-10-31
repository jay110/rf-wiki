# -*- coding: utf-8 -*-
"""解析 biligame「RFOfarm」（符文工厂 海洋）的三张表 → js/crop_rfo.js

源页三张表：
  1) 符文工厂 海洋种地列表      4 座农业岛 × 11 项
  2) 符文工厂 海洋 精灵石树分布列表  39 行
  3) 符文工厂 海洋 魔物农作物列表    91 行 × 13 列

口径一律照录：源表写「-」就存 '-'，不换算、不补空。
源表把部分作物标成 <font color=red>，正文没有说明红字的含义，
这里只把「被标红」这个事实存成 flag，页面上写明白「源页没解释」。
"""
import io
import json
import re
import sys

SNAP = '_snap/RFOfarm.txt'
OUT = 'js/crop_rfo.js'

LINK = re.compile(r'\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]')
FONT = re.compile(r'<font[^>]*>(.*?)</font>', re.S)


def plain(s, sep='、'):
    """[[日文|中文]] → 中文；去 <font> 标签（保留内容）；<br> → sep。"""
    red = bool(FONT.search(s))
    s = FONT.sub(lambda m: m.group(1), s)
    s = LINK.sub(lambda m: (m.group(2) or m.group(1)).strip(), s)
    s = re.sub(r'<br\s*/?>', sep, s)
    s = s.replace('&nbsp;', ' ')
    s = re.sub(r'[ \t]+', ' ', s).strip()
    s = re.sub(r'、+', '、', s).strip('、')
    return s, red


def split_links(s):
    """把一格拆成条目数组（源表用「、」分隔多个名字）。"""
    s = FONT.sub(lambda m: m.group(1), s)
    s = re.sub(r'<br\s*/?>', '、', s)
    out = []
    pos = 0
    for m in LINK.finditer(s):
        # 链接之间的分隔符里如果有裸文本（如「、」）先收进来
        gap = s[pos:m.start()]
        for t in re.split(r'[、，,]', gap):
            t = t.strip()
            if t and t not in ('-', '—'):
                out.append((t, False))
        name = (m.group(2) or m.group(1)).strip()
        # 该链接前是否紧跟 <font color=red>
        head = s[max(0, m.start() - 60):m.start()]
        out.append((name, False))
        pos = m.end()
    tail = s[pos:]
    for t in re.split(r'[、，,]', tail):
        t = t.strip()
        if t and t not in ('-', '—'):
            out.append((t, False))
    return [x[0] for x in out if x[0]]


def tables(text):
    """极简 wikitext 表解析：先判 |} 再判 |，否则单元格会把表吃掉。"""
    out, cap, head, rows = [], '', [], []
    cells = None
    for raw in text.split('\n'):
        s = raw.strip()
        if s.startswith('{|'):
            cap, head, rows, cells = '', [], [], None
            continue
        if s.startswith('|}'):
            if cells:
                rows.append(cells)
            out.append((cap, head, rows))
            cap, head, rows, cells = '', [], [], None
            continue
        if s.startswith('|+'):
            cap = plain(s[2:])[0]
            continue
        if s.startswith('!'):
            head = [plain(c)[0] for c in s[1:].split('!!')]
            continue
        if s.startswith('|-'):
            if cells:
                rows.append(cells)
            cells = None
            continue
        if s.startswith('|'):
            body = s[1:]
            if body.endswith('||'):
                body = body[:-2] + '||'
            parts_txt = body.split('||')
            if cells is None:
                cells = []
            cells.extend(parts_txt)
            continue
    return out


def norm(v):
    v = v.strip()
    return v


def main():
    text = io.open(SNAP, encoding='utf-8').read()
    tabs = tables(text)
    got = {}
    for cap, head, rows in tabs:
        if '种地列表' in cap:
            got['soil'] = (cap, head, rows)
        elif '精灵' in cap and '石树' in cap:
            got['tree'] = (cap, head, rows)
        elif '农作物列表' in cap:
            got['mon'] = (cap, head, rows)

    # ---------------- 1) 四岛种地 ----------------
    # 这张表是「项目为行、岛屿为列」的竖表（表头是四座岛名），先转置成按岛一行。
    cap, head, rows = got['soil']
    soil = []
    for i in range(4):
        col = {}
        for r in rows:
            if len(r) < 5:
                continue
            col[plain(r[0])[0]] = norm(r[1 + i])
        isle = plain(head[1 + i])[0] if len(head) > 1 + i else '岛' + str(i + 1)
        pick = lambda k: col.get(k, '-')
        arr = lambda k: split_links(pick(k)) if pick(k) not in ('-', '') else []
        soil.append({
            'n': isle,
            'loc': plain(pick('地点'))[0],
            'se': plain(pick('季节'))[0],
            'sp': plain(pick('对应精灵'))[0],
            'germ': pick('农作物芽'),
            'treeg': pick('树木芽'),
            'ore': pick('矿石'),
            'crop': arr('农作物'),
            'plant': arr('种地宠物'),
            'tree': arr('种树宠物'),
            'harv': arr('收获宠物'),
        })

    # ---------------- 2) 精灵石树 ----------------
    cap, head, rows = got['tree']
    tree = []
    for c in rows:
        if len(c) < 9:
            print('[warn] 石树表列数不足', len(c), c[:2], file=sys.stderr)
            continue
        place, _ = plain(c[0])
        spot, _ = plain(c[1])
        vals = [norm(x) for x in c[2:9]]
        tree.append([place, spot] + vals)

    # ---------------- 3) 魔物农作物 ----------------
    cap, head, rows = got['mon']
    mon = []
    for c in rows:
        if len(c) < 13:
            print('[warn] 魔物表列数不足', len(c), c[:2], file=sys.stderr)
            continue
        name, _ = plain(c[0])
        breed = plain(c[1])[0]
        giant = norm(c[2])
        crops = []
        for i in range(4):
            cell = c[3 + i * 2]
            fav = norm(c[4 + i * 2])
            cn, red = plain(cell)
            if cn in ('', '-', '—'):
                continue
            crops.append([cn, '' if fav in ('-', '—') else fav, red])
        brush = norm(c[11])
        spots = plain(c[12])[0]
        mon.append([name, breed, giant, crops, brush, spots])

    js = io.open(OUT, 'w', encoding='utf-8', newline='\n')
    js.write('/* 符文工厂 海洋（RFO）农作数据\n')
    js.write('   来源：biligame 符文工厂 wiki「RFOfarm」页（CC BY-SA），\n')
    js.write('   由 _build_crop_rfo.py 解析生成。源表写「-」的一律存 \'-\'，不补、不换算。 */\n')
    js.write('const RFO_SOIL = ' + json.dumps(soil, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
    js.write('const RFO_TREE = ' + json.dumps(tree, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
    js.write('const RFO_MONCROP = ' + json.dumps(mon, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
    js.close()

    print('soil', len(soil), 'tree', len(tree), 'mon', len(mon))
    print('soil', [(r['n'], r['se'], r['germ'], r['treeg'], r['ore'], len(r['crop'])) for r in soil])
    print('crop counts', [len(r['crop']) for r in soil])
    print('tree 空再次采集', [r[8] for r in tree].count(''))
    print('breed', sorted(set(r[1] for r in mon)))
    print('red', sum(1 for r in mon for x in r[3] if x[2]))


if __name__ == '__main__':
    main()
