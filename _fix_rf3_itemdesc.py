# -*- coding: utf-8 -*-
"""修 ITEM_RF3 的说明列：按解包记录序号重新配对名字与说明

背景：当年生成 js/rf3data.js 时，名字表（rf3Archive-7721）与说明表（rf3Archive-7722）
各 888 条，两个文件里同一个物品的记录序号一一对应（第 265 行都是「烤剧毒虹鳟」/「将剧毒虹鳟
用盐调味后火烤…」）。但旧数据是按「去重后的顺序」去取的说明，一旦某个物品被去重跳过，
后面的说明就整体错位一条。实测 867 条里只有 84 条说明本来就是对的。

本脚本不改名字、不改分类、不改顺序，只把说明（第 3、4 列）按名字重新对齐后换掉：
用双指针在 888 条原始名字里按顺序找现有 867 条，找得到的就把同一条记录的说明配回去。
对齐失败会直接报错退出（不留半套数据）。
"""
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = 'G:/10257/Desktop/符文工房/符文工房3文本/'
NAMES = SRC + 'rf3Archive-7721.TXET.txt'
DESCS = SRC + 'rf3Archive-7722.TXET.txt'
DATA = os.path.join(HERE, 'js', 'rf3data.js')


def parse(path):
    raw = open(path, 'rb').read()
    if raw[:2] in (b'\xff\xfe', b'\xfe\xff'):
        txt = raw.decode('utf-16', errors='replace')
    else:
        txt = raw.decode('utf-8', errors='replace')
    rows = []
    for line in txt.split('\n'):
        s = line.rstrip('\r')
        if not s.strip():
            continue
        m = re.match(r'^([0-9A-Fa-f]+(?:\s+[0-9A-Fa-f]+)*)\s*,\s*(\d+)\s*,\s*(.*)$', s)
        if not m:
            continue
        rows.append(m.group(3))
    return rows


def fmt(t):
    """{换行} 分段：短说明取第一段，全文用空格连起来（与旧数据的排版一致）"""
    segs = [x.strip() for x in t.split('{换行}')]
    segs = [x for x in segs if x]
    return (segs[0] if segs else ''), ' '.join(segs)


def main():
    nm = parse(NAMES)
    ds = parse(DESCS)
    assert len(nm) == len(ds) == 888, (len(nm), len(ds))

    s = io.open(DATA, encoding='utf8').read()
    i = s.index('const ITEM_RF3')
    j = s.index('[', i)
    depth = 0
    for k in range(j, len(s)):
        if s[k] == '[':
            depth += 1
        elif s[k] == ']':
            depth -= 1
            if depth == 0:
                end = k + 1
                break
    it = json.loads(s[j:end])
    print('现有条目', len(it), '原始条目', len(nm))

    # 双指针：现有名字序列应当是原始序列的子序列
    p = 0
    pos = []
    for idx, name in enumerate(nm):
        if p < len(it) and name == it[p][0]:
            pos.append(idx)
            p += 1
    assert p == len(it), '对齐到第 %d 条断了（现有第 %d 条是「%s」）' % (p, p, it[p][0] if p < len(it) else '-')
    print('对齐成功', p)

    fixed = 0
    out = []
    for k, r in enumerate(it):
        s1, full = fmt(ds[pos[k]])
        if full != r[3]:
            fixed += 1
        out.append([r[0], r[1], s1, full])
    print('说明被换掉的', fixed, '条（其余本来一致）')

    body = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    s = s[:j] + body + s[end:]
    io.open(DATA, 'w', encoding='utf8', newline='\n').write(s)
    print('写回', DATA, len(s), '字节')

    # 抽几条打印实际内容，便于人工确认
    for k in (0, 100, 275, 610, 860):
        print(' ', out[k][0], '→', out[k][3][:46])


if __name__ == '__main__':
    main()
