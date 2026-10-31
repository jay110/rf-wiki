# -*- coding: utf-8 -*-
"""解析 gametoeasy 六篇《龙之天地》东国任务（post/1831–1836）为 js/quest_azuma.js

六篇的表结构各不相同（有的 6 列、有的 2 列、有的没有表），所以不强行合并成一张表，
按篇保留各自表头，页面再逐篇渲染。表头一律照录，包括源文没解释的「大」「小」两列。

源：https://www.gametoeasy.com/post/1831.html ~ 1836.html
"""
import re
import json

SRC = 'gametoeasy《符文工房：龙之天地》东国任务（post/1831–1836）'

# 简介原句照录（源文「简介」一栏），1835 的源文有重复标记，这里只取一次
INTRO = {
    1831: ['地图上的饭团图标，就是任务地点。', '全部完成后获得饭团模型。'],
    1832: ['找到青蛙石达到一定数量获得奖励，领取位置在 春之地 绘马架 旁边的 呱太。'],
    1833: ['不鉴定的蘑菇不能使用。',
           '和矿物一样每个点有固定的池子。',
           '只是鉴定，和其它东国任务不同，不会因为你鉴定了 10、15、20…… 等数量的蘑菇赠送你配方。',
           '全满奖励是蘑菇模型。'],
    1834: [],
    1835: ['根据打扫的数量，起床时赠送礼物。'],
    1836: ['地点是竹笋岛。', '草莓牛奶是青蛙石爱好家 50 个的奖励。'],
}


def cell(x):
    x = re.sub(r'<br[^>]*>', '', x)
    x = re.sub(r'<[^>]+>', '', x)
    x = x.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&amp;', '&')
    return re.sub(r'\s+', ' ', x).strip()


def parse(n):
    h = open('_azuma_p%d.html' % n, encoding='utf-8').read()
    m = re.search(r'<title>(.*?)让天下', h, flags=re.S)
    title = m.group(1) if m else ''
    name = title.split('——')[-1].strip()
    tabs = re.findall(r'<table.*?</table>', h, flags=re.S)
    tb = None
    if tabs:
        rows = re.findall(r'<tr.*?</tr>', tabs[0], flags=re.S)
        data = []
        for tr in rows:
            cells = [cell(c) for c in re.findall(r'<t[hd][^>]*>.*?</t[hd]>', tr, flags=re.S)]
            if cells:
                data.append(cells)
        if len(data) > 1:
            tb = {'head': data[0], 'rows': data[1:]}
    return name, tb, h


def mushroom_list(h):
    """1833 没有表，只有一段以「、」分隔的蘑菇名（5 行 × 6 个）"""
    a = h.find('蘑菇列表')
    b = h.find('相关链接')
    seg = h[a:b]
    t = re.sub(r'<br[^>]*>', '', seg)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('蘑菇列表', '')
    t = re.sub(r'\s+', '', t)
    t = t.strip('、')
    names = [x for x in t.split('、') if x]
    return names


TYPE = {
    1831: '分点交付',
    1832: '数量累计',
    1833: '纯鉴定',
    1834: '分点交付',
    1835: '数量累计',
    1836: '按题目提交',
}

WHERE = {
    1831: '地图上的饭团图标处（春之原野、夏之里、秋之草原、冬之原野、黎明岛、天之国各一处）',
    1832: '春之地 绘马架 旁的 呱太',
    1833: '各采集点的野生蘑菇',
    1834: '地图上 8 处射靶',
    1835: '全地图地藏',
    1836: '竹笋岛 的 甜点翁',
}

# 表里最后一档 / 源文写明的全满奖励，分两种写法，不混为一谈
FULL = {
    1831: {'t': '饭团模型', 'why': '源文写明「全部完成」'},
    1832: {'t': '呱太石', 'why': '末档 204 个'},
    1833: {'t': '蘑菇模型', 'why': '源文写明「全满」'},
    1834: {'t': '配方与一之弓', 'why': '第 8 个射靶'},
    1835: {'t': '三连地藏', 'why': '末档 50 个'},
    1836: {'t': '—', 'why': '源文未写'},
}

out = []
for n in range(1831, 1837):
    name, tb, h = parse(n)
    item = {
        'pg': n,
        'n': name,
        'type': TYPE[n],
        'where': WHERE[n],
        'intro': INTRO[n],
        'full': FULL[n],
    }
    if tb:
        item['head'] = tb['head']
        item['rows'] = tb['rows']
    else:
        item['head'] = None
        item['rows'] = []
        item['list'] = mushroom_list(h)
    out.append(item)

src_line = ('/* 龙之天地（azuma）东国任务：gametoeasy post/1831–1836 六篇，' +
            '每篇一个任务，表结构各不相同，按篇原样保留表头 */\n')
body = ('const QUEST_AZUMA = {\n' +
        '    src: ' + json.dumps(SRC, ensure_ascii=False) + ',\n' +
        '    tasks: ' + json.dumps(out, ensure_ascii=False, indent=2) + '\n};\n')
open('js/quest_azuma.js', 'w', encoding='utf-8', newline='\n').write(src_line + body)

for t in out:
    print('%-8s %-6s rows=%-2d head=%s' % (t['n'], t['type'], len(t['rows']),
                                          t['head'] if t['head'] else 'list×%d' % len(t.get('list', []))))
print('总计条目', sum(len(t['rows']) for t in out))
