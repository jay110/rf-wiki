# -*- coding: utf-8 -*-
"""从《符文工厂海洋（最强攻略）》xls 的「鱼群」工作表，重建海洋（RFO）钓点与鱼种数据。

原表是一篇玩家实测记录（作者「威亚尔」），结构是：
    岛（含坐标）→ 子地点（白沙海滩／外滩／瀑布…）→ 时段（6:00am~4:59pm / 5:00pm~4:59am / 全天）→ 鱼名（中文（English））

原表**没有概率**，页面上不写概率；原表只覆盖普通鱼，稀有鱼后面带 *（原表自己标的）。
输出 js/rfo_fish.js：RFO_FISH_SPOT = [[岛, 地点, 季节, 时段, [[鱼名, 是否稀有], ...]], ...]
"""
import json
import re
import sys

import xlrd

XLS = r'G:/10257/Downloads/符文工房攻略/符文工厂海洋（最强攻略）.xls'
OUT = 'js/rfo_fish.js'

# 「名（English）」成对提取；英文里的 * 是原表的稀有标记
PAIR = re.compile(r'([^\s（）、：]+)（([^）]+)）')
# 子地点前缀，如「外滩：」「海边洞窟·泉水：」「岛内窟窿：」
PREFIX = re.compile(r'^([^\s：（）、]+(?:·[^\s：（）、]+)?)：')
TIME = {'6:00am~4:59pm': '昼', '5:00pm~4:59am': '夜', '全天': '全天'}
# 附录／后记之后是英文对照表与闲聊，正文到此为止。分割线不能用（正文开头也有一条）
STOP = ('附录：', '后记：', '帖子传送门')

ISLAND = re.compile(r'^([A-H]-\d)\s*(.*)$')


def cell_text(sh, r):
    return str(sh.cell_value(r, 0)).replace('\u3000', ' ').strip()


def parse():
    book = xlrd.open_workbook(XLS)
    sh = book.sheet_by_name('鱼群')
    recs = []           # [岛, 地点, 季节, 时段, [[鱼, 稀有]]]
    island, island_note = None, ''
    season = ''
    sub = ''
    time = ''
    pending_codes = []
    seen = set()

    def flush(fishes, raw):
        if not fishes:
            return
        key = (island, sub, season, time, tuple(f[0] for f in fishes))
        if key in seen:                     # 原表里同一格重复出现，只收一次
            return
        seen.add(key)
        recs.append([island, sub, season, time, fishes])

    for r in range(sh.nrows):
        line = cell_text(sh, r)
        if not line:
            continue
        if any(k in line for k in STOP):
            break
        if line.startswith('【') or line.startswith('—'):
            continue
        if line in TIME:
            time = TIME[line]
            continue

        # 岛标题：E-5翠色岛 / B-3沙漠岛 desert island（lv15）/ 芬尼斯岛【春】/ 无名岛
        if line.startswith('芬尼斯岛'):
            island = '芬尼斯岛'
            m = re.search(r'【(.)】', line)
            season = m.group(1) if m else ''
            sub, time = '', ''
            continue
        m = ISLAND.match(line)
        if m and not PAIR.search(line):
            code, name = m.group(1), m.group(2).strip()
            # 无名岛下面只列坐标，等「全天」那行再出鱼
            if not name:
                pending_codes.append(code)
                continue
            island = (code + ' ' + name) if name else code
            season, sub, time = '', '', ''
            continue
        if line == '无名岛':
            island = '无名岛'
            season, sub, time = '', '', ''
            continue

        # 鱼行（可能带子地点前缀，也可能一行里多组）
        fishes = [(n.strip().rstrip('*'), '*' in n or '*' in en) for n, en in PAIR.findall(line)]
        if fishes:
            pm = PREFIX.match(line)
            if pm:
                sub = pm.group(1)
            if not island:
                print('!! 无归属岛的鱼行：%r' % line, file=sys.stderr)
                continue
            flush(fishes, line)
            continue
    return recs


def main():
    recs = parse()
    # 无名岛只有坐标没有名字，原表把 D-4…F-9 都归在「无名岛」下、只有「全天」一档
    fish = sorted({f[0] for r in recs for f in r[4]})
    islands = []
    for r in recs:
        if r[0] not in islands:
            islands.append(r[0])

    body = json.dumps(recs, ensure_ascii=False, separators=(',', ':'))
    js = '/* 符文工房 海洋（RFO）钓点与鱼种 —— 由 _build_rfo_fish.py 从攻略本 xls「鱼群」表生成，勿手改\n' \
         '   源：《符文工厂海洋（最强攻略）.xls》→「鱼群」工作表（玩家实测记录，作者署「威亚尔」）\n' \
         '   字段：[岛, 地点, 季节, 时段, [[鱼名, 是否稀有], ...]]；原表无概率，本文件也不含概率；\n' \
         '   季节只在芬尼斯岛分春夏秋冬，其余岛原表没分季，存 ""。 */\n' \
         'const RFO_FISH_SPOT = ' + body + ';\n'
    open(OUT, 'w', encoding='utf-8', newline='').write(js)

    print('记录 %d 条 / 岛 %d 座 / 鱼 %d 种' % (len(recs), len(islands), len(fish)))
    for r in recs[:12]:
        print('  ', r[0], '|', r[1], '|', r[2], '|', r[3], '|', '、'.join(f[0] + ('*' if f[1] else '') for f in r[4]))
    print('岛：', '、'.join(islands))
    print('鱼：', '、'.join(fish))


if __name__ == '__main__':
    main()
