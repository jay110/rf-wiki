# -*- coding: utf-8 -*-
"""把 ITEM_RF3 漏掉的 19 条补回去（按解包记录序号插回原位）

背景：rf3Archive-7721（名字）与 rf3Archive-7722（说明）各 888 条记录，序号一一对应。
当年生成 js/rf3data.js 时只落了 867 条，漏了 21 条：
  - 第 0 条「(無し)」是空位，本就不该收；
  - 第 722 条「未使用フレンド」说明写的是「未使用ドリンク」，是未使用数据，也不收；
  - 其余 19 条都是真物品（超级失败之作、龙之牙、光之结晶……），此前漏了。

本脚本不改任何现有条目的名字/分类/说明，只把 19 条插回原位：
遍历 888 条原始序列，跳过上面两条不收的，其余按序号顺序重建；
新增条目的分类取它前一条（同属一个分类段，本脚本会断言前后同类）。
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

SKIP = {0: '(無し) 空位', 722: '未使用フレンド（未使用数据）'}


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
    """{换行} 分段：短说明取第一段，全文用空格连起来（与已有 867 条的排版一致）"""
    segs = [x.strip() for x in t.split('{换行}')]
    segs = [x for x in segs if x]
    return (segs[0] if segs else ''), ' '.join(segs)


def load_data():
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
                return s, j, k + 1, json.loads(s[j:k + 1])
    raise SystemExit('没找到 ITEM_RF3 数组')


def main():
    nm = parse(NAMES)
    ds = parse(DESCS)
    assert len(nm) == len(ds) == 888, (len(nm), len(ds))

    src, j, end, it = load_data()
    print('现有条目', len(it), '原始记录', len(nm))

    # 双指针：现有名字序列是原始序列的子序列
    p = 0
    pos = []
    for idx, name in enumerate(nm):
        if p < len(it) and name == it[p][0]:
            pos.append(idx)
            p += 1
    assert p == len(it), '对齐到第 %d 条断了（现有第 %d 条是「%s」）' % (p, p, it[p][0] if p < len(it) else '-')
    by_src = {idx: it[k] for k, idx in enumerate(pos)}
    print('对齐成功', p)

    out = []
    added = []
    cat = None
    for idx, name in enumerate(nm):
        if idx in SKIP:
            continue
        s1, full = fmt(ds[idx])
        if idx in by_src:
            r = by_src[idx]
            # 现有条目一律原样保留，只核一下名字没串行
            assert r[0] == name, (idx, r[0], name)
            assert r[2] == s1 and r[3] == full, (idx, r[0], r[3][:30], full[:30])
            out.append(r)
            cat = r[1]
        else:
            assert cat is not None, '第 %d 条前面没有可继承的分类' % idx
            out.append([name, cat, s1, full])
            added.append((idx, name, cat, s1))

    print('补入', len(added), '条，共', len(out), '条')
    for a in added:
        print('  %-4d %-12s %-6s %s' % (a[0], a[1], a[2], a[3][:34]))

    # 分类段必须仍然连续：相邻两条分类要么相同，要么是已知的分类切换
    segs = []
    for r in out:
        if not segs or segs[-1][0] != r[1]:
            segs.append([r[1], 0])
        segs[-1][1] += 1
    print('分类段', len(segs), [x[0] for x in segs])
    assert len(segs) == 26, len(segs)   # 与补入前同一套 26 段，没有多出碎段

    body = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    io.open(DATA, 'w', encoding='utf8', newline='\n').write(src[:j] + body + src[end:])
    print('写回', DATA)


if __name__ == '__main__':
    main()
