# -*- coding: utf-8 -*-
"""从 _snap/RF5town.txt 的「帕尔摩工房」一节切出「扩建」表 → js/expand.js（RF5_EXPAND）。
   源表列：类别｜商品｜金币｜SEED点｜石材｜木材｜备注
   只取 类别 == 扩建 的行（73 条：8 处店铺 23 条 + 魔物小屋 50 条）。
   备注列对店铺是「N阶段」，对魔物小屋是「土龙A／土龙A1」这种栏位代号，合并到「阶段/栏位」一列。
   输出 LF。"""
import re, json

SRC = '_snap/RF5town.txt'
OUT = 'js/expand.js'


def strip_links(x):
    x = re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]', r'\2', x)
    x = re.sub(r'\[\[([^\]]+)\]\]', r'\1', x)
    return x.strip()


def main():
    s = open(SRC, encoding='utf-8').read()
    sec = s[s.find('==[[帕尔摩工房]]=='):]
    rows, bad = [], 0
    for line in sec.split('\n'):
        if not line.startswith('|扩建||'):
            continue
        c = line.lstrip('|').split('||')
        if len(c) != 7:
            bad += 1
            continue
        c = [strip_links(x) for x in c]
        rows.append([c[1], c[6], c[2], c[3], c[4], c[5]])

    assert not bad, bad
    assert len(rows) == 73, len(rows)
    shop = [r for r in rows if r[0] != '魔物小屋']
    barn = [r for r in rows if r[0] == '魔物小屋']
    assert len(shop) == 23 and len(barn) == 50, (len(shop), len(barn))
    # 魔物小屋整列金币都是破折号；店铺整列 SEED 点都有值
    assert all(r[2] == '—' for r in barn), '魔物小屋出现金币'
    assert all(r[3] != '—' for r in shop), '店铺缺 SEED 点'

    data = {'cols': ['设施', '阶段/栏位', '金币', 'SEED点', '石材', '木材'], 'rows': rows}
    js = ('/* RF5 扩建：由 _build_rf5_expand.py 从 _snap/RF5town.txt「帕尔摩工房」一节生成。\n'
          '   源表列 类别｜商品｜金币｜SEED点｜石材｜木材｜备注，只取 类别=扩建 的 73 行。\n'
          '   店铺 23 行（8 处，备注列是 N 阶段）、魔物小屋 50 行（5 属性 × A/B 两条 × 5 档，备注列是栏位代号）。\n'
          '   金币与 SEED 点照录，破折号保留为「—」，不补 0。 */\n'
          'const RF5_EXPAND = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    open(OUT, 'w', encoding='utf-8', newline='\n').write(js)
    print('rows', len(rows), 'shop', len(shop), 'barn', len(barn), 'bytes', len(js))


if __name__ == '__main__':
    main()
