# -*- coding: utf-8 -*-
"""
构建 js/fishspot_azuma.js —— 龙之天地（azuma）钓点与季节分布。

源：gametoeasy.com post/1829《符文工房:龙之天地》钓鱼攻略丨钓鱼位置
     （与 js/azuma_gift.js / AZUMA_MON 同源，均为 gametoeasy 中文攻略站）

数据结构（注意方向与 RF1/RF2/边境相反：源表是「鱼 → 钓点」，不是「钓点 → 鱼」）：
    SPOT_AZUMA = {
      title: "龙之天地 钓鱼攻略",
      source: "gametoeasy《龙之天地 钓鱼攻略》(post/1829)",
      fishes: [ { n, buy, sell, spots:[钓点(可带 雨天/夜晚)], shops:[店], unlock } ]
    }
    # 不预生成 spots / rows：页面 fishspotAzumaHtml() 自己从 fishes 反查
    # 「钓点 → 鱼」，避免同一份事实在数据文件与页面里各存一遍。

源表列：名称 | 买价 | 卖价 | 获取(钓点，可多地点<br>) | 商店获取 | 解锁条件
- 「获取」= 可甩竿钓到的地点（含 雨天/夜晚 条件，照录不展开）
- 「商店获取」= 水产品店/渡濑鱼店等购买途径
- 「解锁条件」= 村等级/剧情等（多为「—」）
- 个别鱼「获取」为「—」→ spots=[] 视为仅商店可得，仍在目录列出、标注「仅商店」
"""
import re, json

HTML = "_azuma_fishing.html"

def clean(cell):
    # 拆 <br> 为列表（地点/商店可能多值；br 可能带 style 属性）
    cell = re.sub(r'<br[^>]*>', '\u0001', cell)
    # 去所有标签
    cell = re.sub(r'<[^>]+>', '', cell)
    # 去 &nbsp; 等
    cell = cell.replace('&nbsp;', ' ')
    cell = re.sub(r'\s+', ' ', cell).strip()
    parts = [p.strip() for p in cell.split('\u0001') if p.strip()]
    return parts

def main():
    h = open(HTML, encoding='utf-8').read()
    # 抓取第一个带 6 列表头的数据表
    tbodies = re.findall(r'<tbody[^>]*>(.*?)</tbody>', h, re.S)
    rows = []
    for tb in tbodies:
        trs = re.findall(r'<tr[^>]*>(.*?)</tr>', tb, re.S)
        if len(trs) < 5:           # 跳过表头空表
            continue
        for tr in trs:
            tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
            if len(tds) != 6:
                continue
            name = clean(tds[0])
            if not name or not name[0] or name[0] == '—':
                continue
            n = name[0]
            buy = clean(tds[1])[0] if clean(tds[1]) else ''
            sell = clean(tds[2])[0] if clean(tds[2]) else ''
            spots_raw = clean(tds[3])
            shops_raw = clean(tds[4])
            unlock = clean(tds[5])
            spots = [s for s in spots_raw if s and s != '—']
            shops = [s for s in shops_raw if s and s != '—']
            unlock_s = unlock[0] if (unlock and unlock[0] != '—') else ''
            rows.append({
                'n': n,
                'buy': buy,
                'sell': sell,
                'spots': spots,
                'shops': shops,
                'unlock': unlock_s,
            })
    if not rows:
        raise SystemExit("未解析到任何鱼行，检查源表结构")

    # 反查 钓点 → 鱼
    spots_map = {}
    for r in rows:
        for s in r['spots']:
            spots_map.setdefault(s, []).append(r['n'])

    fishes = sorted(rows, key=lambda x: x['n'])
    obj = {
        'title': '龙之天地 钓鱼攻略',
        'source': 'gametoeasy《龙之天地 钓鱼攻略》(post/1829)',
        'fishes': fishes,
        'spots': spots_map,
        'rows': fishes,
    }
    js = [
        "/* 龙之天地（azuma）钓点与季节分布：gametoeasy 钓鱼攻略（鱼→钓点 目录，无出现率），",
        "   由 _build_fishspot_azuma.py 生成，勿手改。结构见该脚本顶部说明。 */",
        "var SPOT_AZUMA = %s;" % json.dumps(obj, ensure_ascii=False, separators=(',', ':')),
    ]
    open("js/fishspot_azuma.js", "w", encoding="utf-8").write("\n".join(js) + "\n")
    print("SPOT_AZUMA: 鱼 %d 种 / 钓点 %d 个 / 仅商店 %d 种" % (
        len(fishes), len(spots_map), sum(1 for r in rows if not r['spots'])))

if __name__ == '__main__':
    main()
