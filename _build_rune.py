# -*- coding: utf-8 -*-
"""
生成 js/rune.js 的 JS 数据：RF4／RF4S 的符文能力与符文魔法「获取地点」表
源：biligame 符文工厂 wiki（CC BY-SA）
  RF4runeability   https://wiki.biligame.com/runefactory/RF4runeability
  RF4Sruneability  https://wiki.biligame.com/runefactory/RF4Sruneability
  两页是同一张「地图上的符文能力」表（豪华版＝四代本体＋DLC，本表只列本体部分，两版相同）

表头：地点 / 出处 / 类别 / 名字 / 参数
  类别＝符文能力 或 魔法
  参数＝该能力需要的 Lv（如 Lv2、Lv3），多数写「—」（无等级要求）
源表不写每个符文能力／魔法的「效果」，只写「去哪拿」，所以本页是<b>获取地图</b>，不是效果说明。

不做任何推断：出处／参数原表空格照录为「—」。
"""
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SNAP = os.path.join(HERE, '_snap')


def read(name):
    with io.open(os.path.join(SNAP, name + '.txt'), encoding='utf-8') as f:
        return f.read()


LINK = re.compile(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]')


def plain(s):
    """[[日文|中文]] → 中文；[[名]] → 名；去 <br>／<font> 与多余空白。"""
    s = LINK.sub(lambda m: (m.group(2) or m.group(1)).strip(), s)
    s = s.replace('<br>', '、').replace('<br/>', '、').replace('<br />', '、')
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'、+', '、', s).strip('、')
    return s


def tables(text):
    """返回 [(caption, header_cells, [row_cells...]), ...]"""
    out = []
    for block in re.findall(r'\{\|.*?\n\|\}', text, re.S):
        cap = ''
        m = re.search(r'^\|\+\s*(.+)$', block, re.M)
        if m:
            cap = plain(m.group(1))
        head = []
        rows = []
        for line in block.split('\n'):
            if line.startswith('!') and not head:
                head = [plain(x) for x in re.split(r'!!|\|\|', line.lstrip('!'))]
            elif line.startswith('|') and not line.startswith('|-') and not line.startswith('|}') and not line.startswith('|+'):
                cells = [plain(x) for x in re.split(r'\|\|', line.lstrip('|'))]
                if cells and cells != ['']:
                    rows.append(cells)
        out.append((cap, head, rows))
    return out


def parse(name):
    out = []
    for cap, head, rows in tables(read(name)):
        h = ' '.join(head)
        if '类别' in h and '名字' in h:
            for c in rows:
                if len(c) < 4:
                    continue
                loc = c[0] if c[0] not in ('', '-', '—') else ''
                src = c[1] if len(c) > 1 else ''
                cat = c[2] if len(c) > 2 else ''
                nm = c[3] if len(c) > 3 else ''
                param = c[4] if len(c) > 4 and c[4] not in ('', '-', '—') else ''
                if not nm:
                    continue
                out.append([loc, src, cat, nm, param])
            break
    return out


rune4 = parse('RF4runeability')
rune4s = parse('RF4Sruneability')

js = u'''/* RF4／RF4S 符文能力与符文魔法「获取地点」表（rune 页用）
 * 源：biligame 符文工厂 wiki（CC BY-SA）
 *   RF4runeability   https://wiki.biligame.com/runefactory/RF4runeability
 *   RF4Sruneability  https://wiki.biligame.com/runefactory/RF4Sruneability
 * 由 _build_rune.py 从本地 wikitext 快照（_snap/RF4runeability.txt／RF4Sruneability.txt）解析，勿手改。
 *
 * RUNE_RF4  [地点, 出处, 类别, 名字, 参数]
 *           类别＝符文能力／魔法；参数＝需要的能力 Lv（源表多数写「—」＝无等级要求）
 *           源表只给「去哪拿」，不给每个符文的效果，本页是获取地图。
 *           两版（四代本体／豪华版）共用同一张本体获取表，故只存一份。
 */
var RUNE_RF4 = %s;
''' % json.dumps(rune4, ensure_ascii=False)

with io.open(os.path.join(HERE, 'js', 'rune.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(js)

print('RUNE_RF4', len(rune4))
print('RUNE_RF4S', len(rune4s), '(parsed; same base table, stored once as RUNE_RF4)')
print('categories', {c[2]: sum(1 for r in rune4 if r[2] == c[2]) for c in rune4})
print('with param', sum(1 for r in rune4 if r[4]))
print('sample', rune4[:3])
