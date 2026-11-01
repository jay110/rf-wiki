# -*- coding: utf-8 -*-
"""生成 js/rfoquest.js（RFO_QUEST）——符文工房 海洋 委托任务。

单一来源：《符文工厂海洋（最强攻略）.xls》的「任务」工作表。

原表是块状表：18 位委托人各占一列，任务按「块」上下堆叠，每块 7 行
（任务名称 / 发生条件 / 难度 / 报酬 / 「任务内容」标签 / 任务内容值 / 空行），
第 0 行是委托人表头（「·莉莉(リリ)」这种写法）。

本脚本只做一件事：把块状表摊平成「一条任务一条记录」，不改内容——
任务名是攻略本的日文原文，报酬里的物品名也是日文原文，
攻略本没给中文译名，这里不代翻；条件与任务内容里的「？」「???」照录。

用法：python3 _build_rfoquest.py
依赖：xlrd（装在 G:/wit_tools/pylibs）
      PYTHONPATH="G:/wit_tools/pylibs" python3 _build_rfoquest.py
"""
import json
import os
import re

import xlrd

XLS = r'G:/10257/Downloads/符文工房攻略/符文工厂海洋（最强攻略）.xls'
OUT = 'js/rfoquest.js'
LABELS = ['任务名称', '发生条件', '难度', '报酬', '任务内容']


def one(s):
    """压掉单元格里的换行与多余空格——原表有些格内手动折过行"""
    return ' '.join(str(s).split())


def main():
    if not os.path.exists(XLS):
        raise SystemExit('找不到源文件：%s' % XLS)
    book = xlrd.open_workbook(XLS)
    sh = book.sheet_by_name('任务')

    # 委托人表头（第 0 行，列 1 起）
    people = []
    for c in range(1, sh.ncols):
        head = str(sh.cell_value(0, c)).strip().lstrip('★').lstrip('·').strip()
        if not head:
            continue
        m = re.match(r'^([^（(]+)[（(]([^）)]+)[）)]\s*$', head)
        if m:
            people.append({'n': m.group(1).strip(), 'j': m.group(2).strip()})
        else:
            people.append({'n': head, 'j': ''})

    # 块：以「任务名称」这格为锚，往下 5 行是任务内容的值
    quests = []
    for r in range(1, sh.nrows):
        if str(sh.cell_value(r, 0)).strip() != '任务名称':
            continue
        cells = {}
        for k, lab in enumerate(LABELS):
            cells[lab] = [str(sh.cell_value(r + k, c)).strip() for c in range(sh.ncols)]
        cells['内容值'] = [str(sh.cell_value(r + 5, c)).strip() for c in range(sh.ncols)]
        for i, p in enumerate(people):
            c = i + 1
            name = one(cells['任务名称'][c])
            if not name:
                continue
            quests.append({
                'w': p['n'],
                'n': name,
                'c': one(cells['发生条件'][c]),
                'd': cells['难度'][c].strip(),
                'r': one(cells['报酬'][c]),
                't': one(cells['内容值'][c]),
            })

    out = [
        '/* 符文工房 海洋（RFO）委托任务 —— 单一来源：《符文工厂海洋（最强攻略）》xls「任务」工作表',
        '   由 _build_rfoquest.py 生成，不要手改。',
        '   该表是「18 位委托人各一列、16 个任务批上下堆叠」的块状表，本文件按「一条任务一条记录」摊平。',
        '   任务名、报酬里的物品名是攻略本的日文原文，攻略本本身没给中文译名，本站不代为翻译；',
        '   发生条件与任务内容是原表自带的混合写法（中文为主），一律照录，含「？」「???」的问号与占位也照录。 */',
        'const RFO_QUEST = {',
        '    src: "《符文工厂海洋（最强攻略）》xls「任务」工作表（18 位委托人 × 16 个任务批，共 %d 条）",' % len(quests),
        '    people: ' + json.dumps(people, ensure_ascii=False, separators=(',', ':')) + ',',
        '    quests: [',
    ]
    for q in quests:
        out.append('        ' + json.dumps(q, ensure_ascii=False, separators=(',', ':')) + ',')
    out += ['    ]', '};', '']

    s = '\n'.join(out)
    open(OUT, 'w', encoding='utf-8', newline='\n').write(s)
    print('写入 %s：%d 字节，%d 位委托人，%d 条任务' % (OUT, len(s), len(people), len(quests)))


if __name__ == '__main__':
    main()
