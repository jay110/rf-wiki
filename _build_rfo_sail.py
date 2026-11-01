# -*- coding: utf-8 -*-
"""生成 js/rfosail.js（RFO_SAIL / RFO_TIPS）——符文工房 海洋 岛屿与打捞 + 攻略本技巧。

单一来源：《符文工厂海洋（最强攻略）.xls》
  · 「岛屿」工作表：上半是中文表（固定 12 座 + 打捞 21 处），
    下半「以下↓为日版」是日文表（30 行，带精灵木数与魔物日文原名）。
    两半是两份不同的整理，坐标对得上、写法与魔物栏并不一致——照录，不合并。
  · 「技巧」工作表：16 条玩家投稿心得（帖体，含口语与颜文字式自嘲）。

只做摊平与分列，不改措辞、不补译名、不替作者改错。

用法：PYTHONPATH="G:/wit_tools/pylibs" python3 _build_rfo_sail.py
"""
import json
import re

import xlrd

XLS = r'G:/10257/Downloads/符文工房攻略/符文工厂海洋（最强攻略）.xls'
OUT = 'js/rfosail.js'


def clean(v):
    if isinstance(v, float):
        return '%g' % v
    return str(v).replace('\u3000', ' ').strip()


def split_coord(cell):
    """'e-5 verde island（lv1-2）' → ('e-5', 'verde island', 'lv1-2')"""
    s = clean(cell).replace('\t', ' ')
    s = re.sub(r'\s+', ' ', s)
    m = re.match(r'^([A-Ha-h]-\d)\s*(.*)$', s)
    assert m, '坐标解析失败: %r' % (cell,)
    coord, rest = m.group(1).lower(), m.group(2).strip()
    lv = ''
    m2 = re.match(r'^(.*?)（(约?lv[\d\-–~]+)）$', rest)
    if m2:
        rest, lv = m2.group(1).strip(), m2.group(2)
    else:
        # 原表有一行写成「（等级70）」，与其余「lv70」同义，归一成 lv 前缀
        m3 = re.match(r'^(.*?)（等级(\d+)）$', rest)
        if m3:
            rest, lv = m3.group(1).strip(), 'lv' + m3.group(2)
    return coord, rest, lv


def build_islands():
    bk = xlrd.open_workbook(XLS)
    sh = bk.sheet_by_name('岛屿')

    fix, salv = [], []
    mode = None
    for i in range(16, 51):
        c0 = clean(sh.cell_value(i, 0))
        if c0 == '固定':
            mode = 'fix'
            continue
        if c0 == '打捞':
            mode = 'salv'
            continue
        if not c0:
            continue
        assert mode, '第 %d 行没有归属块' % i
        coord, name, lv = split_coord(c0)
        boss = clean(sh.cell_value(i, 1))
        assert boss.startswith('光球'), '第 %d 行光球列异常: %r' % (i, boss)
        boss = boss[len('光球'):].lstrip('：:')
        mons = []
        box = ''
        for j in range(2, sh.ncols):
            v = clean(sh.cell_value(i, j))
            if not v:
                continue
            if v.startswith('鉴定箱'):
                box = v[len('鉴定箱'):].lstrip('：:')
            else:
                assert not box, '第 %d 行鉴定箱后又出现魔物列' % i
                mons.append(v)
        assert mons, '第 %d 行没有魔物' % i
        row = [coord, name, lv, boss, mons]
        if mode == 'fix':
            assert not box, '固定岛不该有鉴定箱: %r' % (c0,)
            fix.append(row)
        else:
            row.append(box)
            salv.append(row)

    jp = []
    for i in range(53, 83):
        coord, name, _ = split_coord(sh.cell_value(i, 0))
        mon = clean(sh.cell_value(i, 1))
        unk = clean(sh.cell_value(i, 2))
        wood = clean(sh.cell_value(i, 3))
        mon = [x.strip() for x in mon.split('/') if x.strip()]
        unk = [x.strip() for x in unk.split('/') if x.strip()]
        jp.append([coord, name, mon, unk, wood])

    return fix, salv, jp


def build_tips():
    bk = xlrd.open_workbook(XLS)
    sh = bk.sheet_by_name('技巧')
    tips, cur = [], None
    for i in range(sh.nrows):
        v = str(sh.cell_value(i, 0)).replace('\r\n', '\n').replace('\r', '\n')
        v = v.strip('\n')
        if not v.strip():
            continue
        if v.strip() == '入门技巧':   # 工作表首行是分节标题，不是条目
            continue
        lines = [x.strip() for x in v.split('\n')]
        m = re.match(r'^(\d+)\.\s*(.*)$', lines[0])
        if m:
            cur = {'n': int(m.group(1)), 't': m.group(2).strip(), 'paras': []}
            tips.append(cur)
            lines = lines[1:]
            if not any(lines):
                continue
        assert cur, '第 %d 行在标题之前: %r' % (i, v[:30])
        for para in lines:
            if not para:
                continue
            lab = ''
            m3 = re.match(r'^【([^】]+)】\s*(.*)$', para)
            if m3:
                lab, para = m3.group(1).strip(), m3.group(2).strip()
            cur['paras'].append([lab, para])
    assert [t['n'] for t in tips] == list(range(1, 17)), [t['n'] for t in tips]
    return tips


def main():
    fix, salv, jp = build_islands()
    tips = build_tips()

    # 自检：两块的坐标集合差异必须与「对不上」的说明一致
    cn = {}
    for r in fix + salv:
        cn.setdefault(r[0], 0)
        cn[r[0]] += 1
    jp_cnt = {}
    for r in jp:
        jp_cnt.setdefault(r[0], 0)
        jp_cnt[r[0]] += 1
    only_cn = {k: v for k, v in cn.items() if jp_cnt.get(k, 0) != v}
    print('中文表 %d+%d=%d 行，日版 %d 行' % (len(fix), len(salv), len(fix) + len(salv), len(jp)))
    print('坐标行数不一致的格:', only_cn)
    wood = [(r[0], r[1], r[4]) for r in jp if r[4] not in ('', '0')]
    print('有精灵木的岛:', len(wood), wood)

    data = {
        'src': '《符文工厂海洋（最强攻略）》xls「岛屿」「技巧」工作表',
        'fix': fix,
        'salv': salv,
        'jp': jp,
        'tips': tips,
    }
    body = json.dumps(data, ensure_ascii=False, indent=1)
    js = (
        '/* 符文工房 海洋（RFO）—— 岛屿与打捞 / 攻略本技巧\n'
        '   单一来源：《符文工厂海洋（最强攻略）》xls「岛屿」「技巧」工作表。\n'
        '   「岛屿」上半是中文整理（固定 %d + 打捞 %d），下半「以下↓为日版」是日文整理（%d 行），\n'
        '   两份坐标对得上但写法与魔物栏不同，照录不合并；\n'
        '   「技巧」是 %d 条玩家投稿心得，帖体原样。*/\n'
        'var RFO_SAIL = %s;\n'
    ) % (len(fix), len(salv), len(jp), len(tips), body)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js)
    print('写入', OUT, len(js), '字节')


if __name__ == '__main__':
    main()
