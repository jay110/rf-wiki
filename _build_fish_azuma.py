# -*- coding: utf-8 -*-
"""
构建 js/fish_azuma.js —— 龙之天地（azuma）鱼类图鉴的任务奖励。

源：gametoeasy.com post/1830《符文工房:龙之天地》鱼类图鉴 任务奖励
     （与 js/fishspot_azuma.js 同站；那一篇给「鱼在哪」，这一篇给「钓到多少条、
       图鉴任务给什么配方」）

源表结构（一张表 + 一句正文）：
    图鉴数量 | 配方奖励（物品名以「、」分隔）
    10 / 20 / 30 / 40 / 45 共 5 行
    表后正文：「全满奖励是鱼笼×1」

数据结构：
    FISH_AZUMA = {
      title, source,
      rewards: [ { at: "10", items: [ ... ] } ],   # items 按源表「、」切开，不改写
      full: { item: "鱼笼", num: "1", text: "鱼笼×1" }
    }

只为「图鉴奖励」建一份数据；42 种鱼本身仍以 js/fishspot_azuma.js 的 SPOT_AZUMA.fishes
为唯一来源，不在这里复制一遍（同一条事实只存一处）。
"""
import re, json

HTML = "_azuma_p1830.html"
OUT = "js/fish_azuma.js"


def txt(cell):
    cell = re.sub(r'<br[^>]*>', '\u0001', cell)
    cell = re.sub(r'<[^>]+>', '', cell)
    cell = cell.replace('&nbsp;', ' ')
    parts = [re.sub(r'\s+', ' ', p).strip() for p in cell.split('\u0001')]
    return [p for p in parts if p]


def main():
    h = open(HTML, encoding='utf-8').read()

    # 1) 任务奖励表：表头含「图鉴数量」「配方奖励」
    tab = None
    for t in re.findall(r'<table.*?</table>', h, flags=re.S):
        if '图鉴数量' in t and '配方奖励' in t:
            tab = t
            break
    if tab is None:
        raise SystemExit('没找到「图鉴数量／配方奖励」表')
    rows = re.findall(r'<tr.*?</tr>', tab, flags=re.S)
    rewards = []
    for tr in rows[1:]:
        tds = re.findall(r'<td.*?</td>', tr, flags=re.S)
        if len(tds) < 2:
            continue
        at = txt(tds[0])[0]
        items = [x.strip() for x in txt(tds[1])[0].split('、') if x.strip()]
        rewards.append({'at': at, 'items': items})

    # 2) 全满奖励：表后正文「全满奖励是鱼笼×1」
    body = re.sub(r'<[^>]+>', '', h)
    m = re.search(r'全满奖励是\s*([^\s<]+?)\s*[×xX]\s*(\d+)', body)
    if not m:
        raise SystemExit('没找到「全满奖励」')
    full = {'item': m.group(1), 'num': m.group(2), 'text': '%s×%s' % (m.group(1), m.group(2))}

    data = {
        'title': '龙之天地 鱼类图鉴 任务奖励',
        'source': 'gametoeasy《龙之天地 鱼类图鉴 任务奖励》(post/1830)',
        'rewards': rewards,
        'full': full,
    }
    out = ('/* 龙之天地（azuma）鱼类图鉴的任务奖励：\n'
           '   源 post/1830，由 _build_fish_azuma.py 生成，勿手改。\n'
           '   只存「图鉴数量 → 配方奖励」与全满奖励；42 种鱼在 js/fishspot_azuma.js。 */\n'
           'var FISH_AZUMA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(OUT, 'w', encoding='utf-8', newline='\n').write(out)

    print('档位 %d：%s' % (len(rewards), ' / '.join(r['at'] for r in rewards)))
    print('奖励条目合计 %d 项；全满 %s' % (sum(len(r['items']) for r in rewards), full['text']))
    print('已写 %s（%d 字节）' % (OUT, len(out.encode('utf-8'))))


if __name__ == '__main__':
    main()
