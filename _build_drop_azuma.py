# -*- coding: utf-8 -*-
"""
构建 js/drop_azuma.js —— 龙之天地（azuma）魔物掉落表。

源：gametoeasy.com post/1816《符文工房:龙之天地》魔物掉落表
     （与 js/azuma_gift.js / js/fishspot_azuma.js 同站）
     同一张表 biligame「符文工房 龙之天地 材料掉落」(RRFSitemdrop) 也有收录，
     本站按 gametoeasy 版本录入，抽样与 biligame 交叉核对。

源表列：名称 | 区域 | 掉落物（以「、」分隔）
- 同一只魔物在多个区域出现时各区域单独成行，**掉落名单并不相同**（品质随区域递进）
- 区域「上空」＝后期浮空副本（游戏传送菜单里的「上空」分区），是合法区域名，照录
- 区域「???」＝源站未标注 → 存空串，页面显示「未标注」
- 掉落物「×」＝该魔物无掉落 → 存空数组，页面显示「无掉落」

结构（页面 fishspotAzumaHtml 的同族做法：只存原始行，页面自己反查）：
    DROP_AZUMA = {
      title, source,
      rows: [ [魔物, 区域, [素材, ...]], ... ]   # 原表逐行，顺序不变
    }
"""
import re
import json
import io

HTML = "_azuma_drop.html"
OUT = "js/drop_azuma.js"


def cells_of(tr):
    tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
    out = []
    for c in tds:
        c = re.sub(r'<br[^>]*>', '\u0001', c)
        c = re.sub(r'<[^>]+>', '', c)
        c = c.replace('\u0001', ' ')
        c = c.replace('&nbsp;', ' ')
        c = re.sub(r'\s+', ' ', c).strip()
        out.append(c)
    return out


def main():
    h = io.open(HTML, encoding='utf-8').read()
    tb = re.findall(r'<table.*?</table>', h, re.S)[0]
    trs = re.findall(r'<tr.*?</tr>', tb, re.S)

    rows = []
    seen_head = 0
    for tr in trs:
        c = cells_of(tr)
        if len(c) != 3:
            continue
        name, area, drop = c
        if name in ('名称', '魔物') and area in ('区域', '位置'):
            seen_head += 1
            continue
        if not name:
            continue
        if area in ('???', '×'):
            area = ''
        items = [] if drop in ('×', '', '—') else [x.strip() for x in drop.split('、') if x.strip()]
        rows.append([name, area, items])

    assert seen_head >= 1, '表头没剔除，列结构可能变了'
    assert rows, '没解析到数据行'

    mons = {}
    areas = set()
    items = set()
    for name, area, its in rows:
        mons[name] = mons.get(name, 0) + 1
        if area:
            areas.add(area)
        items.update(its)

    data = {
        'title': '龙之天地 魔物掉落表',
        'source': 'gametoeasy《符文工房:龙之天地》魔物掉落表（post/1816）｜同表亦见 biligame RRFSitemdrop',
        'rows': rows,
    }
    js = ('/* 龙之天地（azuma）魔物掉落：gametoeasy post/1816（名称｜区域｜掉落物），\n'
          '   由 _build_drop_azuma.py 生成，勿手改。结构见该脚本顶部说明。 */\n'
          'var DROP_AZUMA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(js)

    print('行数 %d（魔物 %d 只 / 区域 %d 处 / 去重素材 %d 种）'
          % (len(rows), len(mons), len(areas), len(items)))
    print('多区域魔物 %d 只；无记录区域行 %d 条；无掉落行 %d 条'
          % (sum(1 for v in mons.values() if v > 1),
             sum(1 for r in rows if not r[1]),
             sum(1 for r in rows if not r[2])))
    print('写出', OUT)


if __name__ == '__main__':
    main()
