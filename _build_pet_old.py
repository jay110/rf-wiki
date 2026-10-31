# -*- coding: utf-8 -*-
"""
生成 js/pet_old.py 的 JS 数据：旧四作（RF1／RF2／RFF）收服门槛与边境场地喜好
源：biligame 符文工厂 wiki（CC BY-SA）
  RF2pet  https://wiki.biligame.com/runefactory/RF2pet   「中文名/工作/友好手套/第一部/第二部/探索类型/特技」
  RFFpet  https://wiki.biligame.com/runefactory/RFFpet   「名字/工作/出现地点/等级/刷毛次数/元素属性/能否骑乘」
          + 「符文工厂边境 魔物属性与地点的喜好程度」表
  RFOmonster 的「喜好作物」不在本脚本（站点早有 RFO_MON），只做统计。
不做任何推断：源表空格照录为空串。
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


def spaced(s):
    """「草木迎接的小道白天」→「草木迎接的小道 白天」。只插入空格，不改字。"""
    return re.sub(r'\s*(白天|夜晚)$', r' \1', s).strip()


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


def to_int(v):
    m = re.search(r'\d+', v or '')
    return int(m.group(0)) if m else None


# ---------------- RF2 宠物（友好手套次数） ----------------
rf2 = []
for cap, head, rows in tables(read('RF2pet')):
    if head and '友好手套' in ' '.join(head):
        for c in rows:
            if len(c) < 7:
                continue
            rf2.append([c[0], c[1], to_int(c[2]), spaced(c[3]), spaced(c[4]), c[5], c[6]])
        break

# ---------------- RFF 宠物工作（刷毛次数 / 能否骑乘） ----------------
rff = []
rff_site = []
NAME_NOTE = re.compile(r'^(.*?)\s*[(（](.*?)[)）]\s*$')
for cap, head, rows in tables(read('RFFpet')):
    h = ' '.join(head)
    if '刷毛次数' in h:
        for c in rows:
            if len(c) < 7:
                continue
            m = NAME_NOTE.match(c[0])
            name, note = (m.group(1), m.group(2)) if m else (c[0], '')
            rff.append([name, c[1], c[2], to_int(c[3]), to_int(c[4]),
                        '' if c[5] in ('-', '—', '') else c[5],
                        '可以' if c[6].startswith('可以') else '',
                        note])
    elif '地点' in h and '火' in h and '喜好' in cap:
        for c in rows:
            if len(c) < 6:
                continue
            rff_site.append([c[0]] + [('' if v in ('-', '—', '') else v) for v in c[1:6]])

js = u'''/* 符文工房 旧四作收服门槛与场地喜好（gift 页的 rf1／rf2／rff／rfo 段用）
 * 源：biligame 符文工厂 wiki（CC BY-SA）
 *   RF2pet  https://wiki.biligame.com/runefactory/RF2pet
 *   RFFpet  https://wiki.biligame.com/runefactory/RFFpet
 *   RFOmonster 的「喜好作物」不在此文件：站点早有 RFO_MON（来自《符文工厂海洋（最强攻略）》怪日表）
 * 由 _build_pet_old.py 从本地 wikitext 快照（_snap/RF2pet.txt／RFFpet.txt）解析，勿手改。
 *
 * PET_RF2  [中文名, 工作, 友好手套次数, 第一部地点, 第二部地点, 探索类型, 特技]
 *          友好手套次数＝用友好手套抚摸几下才会收服，原表整数；非投喂喜好物
 * PET_RFF  [名字, 工作, 出现地点, 等级, 刷毛次数, 元素属性, 能否骑乘]
 *          刷毛次数＝用刷毛刷几下；能否骑乘原表只写「可以」或「-」
 * RFF_SITE [地点, 无, 火, 水, 风, 地]   边境「魔物属性与地点的喜好程度」，值为大／小／空（原表 -）
 */
var PET_RF2 = %s;
var PET_RFF = %s;
var RFF_SITE = %s;
''' % (json.dumps(rf2, ensure_ascii=False),
       json.dumps(rff, ensure_ascii=False),
       json.dumps(rff_site, ensure_ascii=False))

with io.open(os.path.join(HERE, 'js', 'pet_old.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(js)

print('PET_RF2', len(rf2))
print('PET_RFF', len(rff))
print('RFF_SITE', len(rff_site))
print('rf2 sample', rf2[:2])
print('rff sample', rff[:2])
print('site', rff_site)
