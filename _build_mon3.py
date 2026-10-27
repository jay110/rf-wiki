# -*- coding: utf-8 -*-
"""从《RF3 符文工房3全攻略》（NW 旅团 qisiwole）的「全迷宫资料」抽出 RF3 魔物表。
输出 js/mon3.js：MON_RF3（迷宫魔物）+ BOSS_RF3（通信迷宫准 BOSS）+ ORE_RF3（迷宫可采矿石）
文本为 UTF-16LE，字段以制表符分隔：
  名称 等级 HP 物攻 物防 魔攻 魔防 抗性 采集 掉落 出现场所
"""
import json, re

SRC = 'G:/10257/Downloads/符文攻略/RF3 符文工房3全攻略.txt'
OUT = 'js/mon3.js'

s = open(SRC, 'rb').read().decode('utf-16')
lines = [l.rstrip('\r') for l in s.split('\n')]

start = next(i for i, l in enumerate(lines) if l.strip() == '全迷宫资料')
end = next(i for i in range(start, len(lines)) if lines[i].strip().startswith('BOSS战法'))


def cell(x):
    x = x.strip()
    return '' if x in ('', '-', '—') else x


def num(x):
    x = cell(x)
    if not x:
        return None
    try:
        return int(x)
    except ValueError:
        return x


rows = []       # [名, lv, hp, 物攻, 物防, 魔攻, 魔防, 抗性, 采集, 掉落, 场所, 迷宫]
ore = []        # [迷宫, 可采矿石]
boss = []       # [名, 抗性, 掉落]
dun = None
in_boss = False

for j in range(start, end):
    l = lines[j].strip()
    if not l:
        continue
    if l.startswith('可采集矿石'):
        if dun:
            ore.append([dun, l.split('：', 1)[1].strip()])
        continue
    if l.startswith('名称\t'):
        continue
    if l.startswith('名前') and '抗性' in l:
        in_boss = True
        dun = None
        continue
    if l.startswith('希雅莲斯的迷宫'):
        in_boss = False
        dun = None
        continue
    if l.startswith('只列出') or l.startswith('守卫系的怪物掉落'):
        continue
    c = l.split('\t')
    if len(c) >= 11:
        if len(c) == 12 and c[1] == '':
            c = c[:1] + c[2:]
        rows.append([cell(c[0]), num(c[1]), num(c[2]), num(c[3]), num(c[4]), num(c[5]),
                     num(c[6]), cell(c[7]), cell(c[8]), cell(c[9]), cell(c[10]), dun or ''])
    elif len(c) == 3 and in_boss:
        boss.append([cell(c[0]), cell(c[1]), cell(c[2])])
    else:
        if in_boss:
            boss.append([cell(c[0]), cell(c[1]) if len(c) > 1 else '', cell(c[2]) if len(c) > 2 else ''])
        else:
            dun = l

# 去重：同一迷宫内同名同数值只留一行，同名不同数值保留（不同形态）
seen = set()
uniq = []
for r in rows:
    k = tuple(r)
    if k in seen:
        continue
    seen.add(k)
    uniq.append(r)

print('rows', len(rows), 'uniq', len(uniq), 'ore', len(ore), 'boss', len(boss))
print('dungeons', [x[0] for x in ore])
for r in uniq[:3]:
    print(r)

js = '/* RF3 魔物表：由 _build_mon3.py 从《符文工房3全攻略》全迷宫资料生成，勿手改\n'
js += '   字段：[名, 等级, HP, 物攻, 物防, 魔攻, 魔防, 抗性, 采集, 掉落, 出现场所, 迷宫]\n'
js += '   空字符串/None 表示原表该格为空（多为不可加入的 Boss 与准 Boss） */\n'
js += 'const MON_RF3 = ' + json.dumps(uniq, ensure_ascii=False, separators=(',', ':')) + ';\n'
js += '/* 迷宫可采矿石：[迷宫, 矿石] */\n'
js += 'const ORE_RF3 = ' + json.dumps(ore, ensure_ascii=False, separators=(',', ':')) + ';\n'
js += '/* 通信迷宫 BOSS／准 BOSS：[名, 抗性, 掉落] */\n'
js += 'const BOSS_RF3 = ' + json.dumps(boss, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(OUT, 'w', encoding='utf-8').write(js)
print('wrote', OUT, len(js), 'chars')
