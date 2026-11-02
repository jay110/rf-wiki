# -*- coding: utf-8 -*-
"""从《RF2 攻略合辑》切出「商店及售价」一章 → js/rf2shop.js

源结构（2160 行，UTF-16LE 单文件，里面拼了好几份攻略）：

    商店及售价：
    杂货屋：
    春
    サクラカブの種（4天）<TAB>樱萝卜种子<TAB>
    980G
    ...
    夏 / 秋 / 冬
    武具行：
    ブロードゾード<TAB>片手剑<TAB>
    1200G
    行商:
    ...
    诊所：
    マヒロン<TAB>
    麻痹仑
    （麻痹去除，HP30+）
    750G

要点：一条商品 = 一行「日文名<TAB>中文名<TAB>」+ 下一行价格；诊所那节偶尔把中文名
另起一行、并且多一行括号备注。脚本只拆字段，不改字、不补标点、不统一译名。

另外做一次两源互校（攻略本 vs 站内数据）：
  · 种子 → 站内 CROP_RF2 的种子买价 sb 与生长天数 d
  · 其余 → 站内 ITEM_RF2 的物品名
对照用的译名写法只放在本脚本的 MAP 里，**不写回数据**，表里显示的一律是攻略本的字。
"""
import json
import os
import re

SRC = '_src_rf2guide.txt'
OUT = 'js/rf2shop.js'

lines = open(SRC, encoding='utf-8').read().split('\n')

# ---- 定位章节 ----
h0 = next(i for i, l in enumerate(lines) if l.strip() == '商店及售价：')
h1 = next(i for i, l in enumerate(lines)
          if i > h0 and l.strip() in ('【RF2】【一周目】任务大全', '作者：终有依天'))
body = lines[h0 + 1:h1]

PRICE = re.compile(r'^([\d,]+)\s*G$')
NOTE = re.compile(r'^（(.+)）$')
SEASON = re.compile(r'^[春夏秋冬]$')

sections = []
cur_sec = None
cur_sub = None
state = 'name'
pending = None

for raw in body:
    s = raw.rstrip('\n')
    t = s.strip()
    if not t:
        continue
    m = re.fullmatch(r'(杂货屋|武具行|行商|诊所)\s*[:：]', t)
    if m:
        cur_sec = {'k': m.group(1), 'subs': []}
        sections.append(cur_sec)
        cur_sub = {'k': '', 'items': []}
        cur_sec['subs'].append(cur_sub)
        state = 'name'
        continue
    if SEASON.match(t) and cur_sec and cur_sec['k'] == '杂货屋':
        cur_sub = {'k': t, 'items': []}
        cur_sec['subs'].append(cur_sub)
        state = 'name'
        continue
    mp = PRICE.match(t)
    if mp:
        if pending is None:
            raise SystemExit('价格行前面没有商品：%s' % t)
        pending['p'] = int(mp.group(1).replace(',', ''))
        cur_sub['items'].append(pending)
        pending = None
        state = 'name'
        continue
    mn = NOTE.match(t)
    if mn:
        if pending is None:
            raise SystemExit('备注行前面没有商品：%s' % t)
        pending['n'] = mn.group(1)
        continue
    if state == 'cn' and pending is not None and '\t' not in s:
        pending['c'] = t
        state = 'price'
        continue
    if '\t' in s:
        parts = s.split('\t')
        jp = parts[0].strip()
        cn = parts[1].strip() if len(parts) > 1 else ''
        pending = {'j': jp, 'c': cn, 'p': None}
        state = 'cn' if not cn else 'price'
        continue
    raise SystemExit('无法归类的行：%s' % t)

for sec in sections:
    sec['subs'] = [x for x in sec['subs'] if x['items']]

DAY = re.compile(r'^(.*)（(\d+)天）$')
for sec in sections:
    for sub in sec['subs']:
        for it in sub['items']:
            mm = DAY.match(it['j'])
            it['d'] = int(mm.group(2)) if mm else None
            if mm:
                it['j'] = mm.group(1)

# ---------------------------------------------------------------- 互校映射
# 种子：攻略本写法（去掉「种子」）→ 站内农作页的作物名。None = 站内没有同名作物。
SEED = {
    '樱萝卜': '樱芜菁', '月光草': '月落草', '玩具薄荷': '托伊药草', '甜瓜': '少女蜜瓜',
    '四叶草': '四叶草', '野之烟花': '原之焰火', '土豆': '马铃薯', '红薯': '番薯',
    '魅惑兰': '魅蓝草', '花红叶': '红叶花', '蓬蓬草': None, '赤水晶': '红水晶',
    '萝卜': '芜菁', '树草': '树形草', '大葱': '葱', '暖暖': '火热果实',
}
# 其余商品：攻略本写法 → 站内物品表名。None = 站内物品表里没有。
OTHER = {
    '饲料': None, '白饭': '米饭', '艾莉草': '艾丽草',
    '牛奶S': '牛奶Ｓ型', '鸡蛋S': '鸡蛋Ｓ型', '丸子粉': '糯米粉',
    '片手剑': '阔剑', '两手剑': '双手剑', '枪': '长枪', '锤子': '战锤', '斧子': '战斧',
    '杖': '魔杖', '盾': '小盾牌', '护腕': '廉价手镯', '靴子': '皮长靴',
    '烤白薯': '烤番薯', '海鲜皮萨': '海鲜披萨', '炒乌冬': '炒乌冬面',
    '奶油炖菜': '西式炖菜', '蓝宝石胸针': '海蓝宝石胸针', '海鲜锔饭': '海鲜奶焗饭',
    '鲣鱼鱼生': '鲣鱼刺身', '鲷鱼鱼生': '鲷鱼刺身', '大阪烧': '什锦烧',
    '解毒药（解毒）': '解毒药', '麻痹仑': '解麻药', '滔滔不绝丸': '解封药',
    '草药': '药草', '黑色草': '黑草', '橘色草': '橙草', '红色草': '红草',
    '黄色草': '黄草', '绿色草': '绿草', '紫色草': '紫草', '蓝色草': '靛草',
    '白色草': '白草',
}

crop = {c['n']: c for c in json.loads(
    re.search(r'CROP_RF2 = (\[.*?\]);', open('js/crop_more.js', encoding='utf-8').read(), re.S).group(1))}
items = set()
_row = json.loads(re.search(r'const ITEM_RF2 = (\[\[.*?\]\]);',
                            open('js/rf2data.js', encoding='utf-8').read(), re.S).group(1))
for r in _row:
    items.add(r[0])

# ---- 逐条互校 ----
for sec in sections:
    for sub in sec['subs']:
        for it in sub['items']:
            it['x'] = None          # 站内对应的名字
            it['xb'] = None         # 站内种子买价
            it['xd'] = None         # 站内生长天数
            if it['d'] is not None:
                cn = it['c'][:-2] if it['c'].endswith('种子') else it['c']
                name = SEED.get(cn, cn)
                c = crop.get(name) if name else None
                if c:
                    it['x'] = name
                    it['xb'] = c['sb']
                    it['xd'] = c['d']
            else:
                name = OTHER.get(it['c'], it['c'])
                if name and name in items:
                    it['x'] = name

# ---------------------------------------------------------------- 报告
print('=== 各节条数 ===')
for sec in sections:
    tot = sum(len(x['items']) for x in sec['subs'])
    subs = '/'.join('%s%d' % (x['k'] or '—', len(x['items'])) for x in sec['subs'])
    print('  %-4s %3d 条  （%s）' % (sec['k'], tot, subs))
allitems = [it for sec in sections for x in sec['subs'] for it in x['items']]
print('  合计 %d 行' % len(allitems))

gro = next(s for s in sections if s['k'] == '杂货屋')
by_season = {sub['k']: {it['c']: it['p'] for it in sub['items']} for sub in gro['subs']}
allk = []
for sub in gro['subs']:
    for it in sub['items']:
        if it['c'] not in allk:
            allk.append(it['c'])
common = [k for k in allk if all(k in by_season[se] for se in by_season)]
samesame = [k for k in common if len(set(by_season[se][k] for se in by_season)) == 1]
print('\n=== 杂货屋 ===')
print('  四季都上架的 %d 件，四季同价的 %d 件' % (len(common), len(samesame)))
part = []
for k in allk:
    if k in common:
        continue
    where = [se for se in ('春', '夏', '秋', '冬') if k in by_season[se]]
    part.append('%s(%s)' % (k, ''.join(where)))
print('  只在部分季节上架 %d 件：%s' % (len(part), '、'.join(part)))

seeds = [it for it in allitems if it['d'] is not None]
uniq_seeds = {}
for it in seeds:
    uniq_seeds.setdefault(it['j'], it)
print('\n=== 种子 %d 行 / 去重 %d 种 ===' % (len(seeds), len(uniq_seeds)))

print('\n=== 互校：种子 vs 站内农作页 ===')
ok = bad = nodata = 0
for it in uniq_seeds.values():
    if it['x'] is None:
        nodata += 1
        print('  站内无同名作物  %-10s %-8s %sG / %d天' % (it['c'], it['j'], it['p'], it['d']))
        continue
    if it['p'] == it['xb'] and it['d'] == it['xd']:
        ok += 1
    else:
        bad += 1
        print('  对不上  %-10s 攻略 %sG/%d天  站内 %sG/%d天' % (
            it['c'], it['p'], it['d'], it['xb'], it['xd']))
print('  → 价与天数都一致 %d 种，不一致 %d 种，站内无同名作物 %d 种' % (ok, bad, nodata))

print('\n=== 互校：其余商品 vs 站内物品表 ===')
oth = [it for it in allitems if it['d'] is None]
u = {}
for it in oth:
    u.setdefault(it['c'], it)
miss = [it for it in u.values() if it['x'] is None]
print('  去重 %d 件，找到对应 %d 件，找不到 %d 件' % (len(u), len(u) - len(miss), len(miss)))
for it in miss:
    print('    ', it['c'], '|', it['j'])

print('\n=== 价格极值 ===')
sp = sorted(uniq_seeds.values(), key=lambda x: -x['p'])
print('  最贵三种子：' + '、'.join('%s %dG/%d天' % (x['c'], x['p'], x['d']) for x in sp[:3]))
print('  最便宜三种子：' + '、'.join('%s %dG/%d天' % (x['c'], x['p'], x['d']) for x in sp[-3:]))
allp = sorted(allitems, key=lambda x: -x['p'])
print('  全表最贵三条：' + '、'.join('%s %dG' % (x['c'], x['p']) for x in allp[:3]))
print('  全表最便宜三条：' + '、'.join('%s %dG' % (x['c'], x['p']) for x in allp[-3:]))

# ---------------------------------------------------------------- 输出
data = {
    'src': '《RF2 攻略合辑》（TGBUS 巴士速攻整理）「商店及售价」一章',
    'secs': [{'k': sec['k'], 'subs': [{'k': x['k'], 'items': x['items']} for x in sec['subs']]}
             for sec in sections],
}
js = ('/* 符文工房 2（RF2）商店与售价：由 _build_rf2_shop.py 从《RF2 攻略合辑》切出\n'
      '   一条 = {j 日文原名, c 攻略本中文名, p 售价(G), d 生长天数（只有种子有）,'
      ' n 原文备注, x 站内对应名, xb/xd 站内种子买价与天数} */\n'
      'const RF2_SHOP = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(OUT, 'w', encoding='utf-8', newline='\n').write(js)
print('\n写入 %s（%d 字节）' % (OUT, os.path.getsize(OUT)))
