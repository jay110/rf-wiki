#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""解析 RFOpet.txt 的「生产物」表 -> PETPROD_RFO
源：biligame 符文工厂 wiki「RFOpet」（CC BY-SA）
列：魔物名 / 毛刷次数 / 产出物 / 产出天数 / 出现点
规则：
 - [[jp|cn]] / [[cn]] 取显示名 cn（取错会变日文，必须取显示名）
 - <br> 出现点多地点 -> 用「、」连接（tbl 渲染纯文本，<br> 不会当 HTML）
 - 源表「黄蜂」重复一行（与第 50 行逐字相同），按整行去重
"""
import re, sys

SRC = "G:/wit_tools/work/RF_WIKI/_snap/RFOpet.txt"

def disp(cell):
    cell = cell.strip()
    # [[jp|cn]] -> cn ; [[cn]] -> cn ；保留 ]] 之后的尾随文字（如 1F、2F）
    cell = re.sub(r'\[\[[^\]|]*\|([^\]]+)\]\]', r'\1', cell)
    cell = re.sub(r'\[\[([^\]]+)\]\]', r'\1', cell)
    cell = cell.replace('<br>', '、').replace('\n', '、')
    return cell.strip('、').strip()

def parse():
    text = open(SRC, encoding='utf-8').read()
    # 定位 ==生产物== 段
    m = re.search(r'==生产物==(.*?)(?=\n==|\n\|})', text, re.S)
    if not m:
        print("ERROR: 找不到 ==生产物== 段", file=sys.stderr); sys.exit(1)
    sec = m.group(1)
    rows = []
    for line in sec.splitlines():
        line = line.strip()
        if not line.startswith('|'):
            continue
        if line.startswith('|-') or line.startswith('|+') or line.startswith('!'):
            continue
        if line == '|}':
            break
        # 去掉首尾 |，按 || 拆
        body = line[1:]
        if body.endswith('|'):
            body = body[:-1]
        cells = [c.strip() for c in body.split('||')]
        if len(cells) < 5:
            continue
        mon = disp(cells[0])
        brush = disp(cells[1])
        prod = disp(cells[2])
        days = disp(cells[3])
        spot = disp(cells[4])
        if not mon or mon == '-':
            continue
        rows.append([mon, prod, brush, days, spot])
    # 去重
    seen = set(); uniq = []
    for r in rows:
        key = tuple(r)
        if key in seen:
            continue
        seen.add(key); uniq.append(r)
    return uniq

def emit(rows):
    items = ','.join('["%s","%s","%s","%s","%s"]' % (
        r[0].replace('"','\\"'), r[1].replace('"','\\"'),
        r[2].replace('"','\\"'), r[3].replace('"','\\"'),
        r[4].replace('"','\\"')) for r in rows)
    return "const PETPROD_RFO = [%s];" % items

if __name__ == '__main__':
    rows = parse()
    print("ROWS=%d" % len(rows), file=sys.stderr)
    for r in rows:
        print(r, file=sys.stderr)
    print(emit(rows))
