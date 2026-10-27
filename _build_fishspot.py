# -*- coding: utf-8 -*-
"""RF5 钓点与季节分布：FishingRates -> js/fishspot.js"""
import sys, io, json, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import _xlsx_read as R

F5 = 'G:/10257/Downloads/符文攻略/RF5_Data数据解包汉化版8月27日.xlsx'
z, sst, sh = R.load(F5)
d = {n: R.rows(z, sst, t) for n, t in sh}

tz = d['译名表']
jpcn = {}
for r in tz[1:]:
    jp = (r[0] if len(r) > 0 else '').strip()
    cn = (r[2] if len(r) > 2 else '').strip()
    if jp and cn:
        jpcn[jp] = cn

LOC = {
    'Rigbarth': '里格巴斯',
    'Phoros Woodlands': '福洛斯森林',
    'Kelve Volcanic Region': '凯尔贝火山地带',
    'Lake Yumina': '尤米娜湖',
    'Meline Crystal Caverns': '梅利涅水晶洞窟',
    'Whispering Woods': '私语森林',
    'Cloudheim': '克劳德海姆',
    "Basara's Hideaway": '巴萨拉的隐居处',
    "Bandit King's Old Base": '盗贼王的旧巢',
    'Forest of No Return': '不归之森',
    'Thundering Wastes': '雷鸣荒野',
    'All Other': '其他',
}
SUB = {
    'Pond of Hope': '希望之池',
    'Lake Melody': '旋律湖',
    'W Ocean': '西海',
    'E Ocean': '东海',
    'S Ocean': '南海',
    'Pier': '码头',
    'Fishing Together': '一同垂钓',
    'Keron Pond': '凯隆池',
    'Central River': '中央河',
    'N River': '北河',
    'S River': '南河',
    'W Pond': '西池',
    'E Pond': '东池',
    'S Pond': '南池',
    '1F': '一层',
    '2F': '二层',
}

rs = d['FishingRates']
g = lambda r, i: ((r[i] if i < len(r) else '') or '').strip()


def pct(r, i):
    v = g(r, i)
    if not v or v == '-':
        return 0.0
    try:
        return round(float(v) * 100, 1)
    except ValueError:
        return 0.0


rows = []
for r in rs[2:]:
    loc_en, sub_en = g(r, 14), g(r, 15)
    if not loc_en:
        continue
    jp, en = g(r, 16), g(r, 17)
    name = (jpcn.get(jp) or en or jp).replace('带魚', '带鱼')
    loc = LOC.get(loc_en, loc_en)
    sub = SUB.get(sub_en, '' if sub_en in ('-', '') else (sub_en if sub_en != '?' else '未知水域'))
    rank = g(r, 3)
    vals = [pct(r, i) for i in (19, 20, 21, 22, 23, 24, 25, 26)]   # 春0 春1 夏0 夏1 秋0 秋1 冬0 冬1
    if not any(vals):
        continue                     # 四季全 0 的是空占位块（福洛斯森林的 ? 共 14 行）
    rows.append([loc, sub, name, int(rank) if rank.isdigit() else 0] + vals)

# 统计
fish_all = collections.OrderedDict()
for r in rows:
    fish_all.setdefault(r[2], {'rank': 0, 'spots': set(), 'seasons': set()})
    f = fish_all[r[2]]
    f['rank'] = max(f['rank'], r[3])
    f['spots'].add((r[0], r[1]))
    for si in range(4):
        if r[4 + si * 2] > 0:
            f['seasons'].add(si)

spots = sorted(set((r[0], r[1]) for r in rows))

# Rank 4（最稀有）在两档里的总占比，用来证明「1 档对稀有鱼更有利」
def w(r, i):
    v = g(r, i)
    try:
        return float(v or 0)
    except ValueError:
        return 0.0


share = []
for nm, base in (('春', 5), ('夏', 7), ('秋', 9), ('冬', 11)):
    pair = []
    for k in (0, 1):
        tot = sum(w(r, base + k) for r in rs[2:])
        hi = sum(w(r, base + k) for r in rs[2:] if g(r, 3) == '4')
        pair.append(round(hi / tot * 100, 1) if tot else 0.0)
    share.append([nm] + pair)

js = ['/* RF5 钓点与季节分布：FishingRates 有效 141 条，由 _build_fishspot.py 生成，勿手改 */',
      'var SPOT_RF5 = ' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';',
      'var SPOT_SHARE = ' + json.dumps(share, ensure_ascii=False, separators=(',', ':')) + ';']
open('js/fishspot.js', 'w', encoding='utf-8').write('\n'.join(js) + '\n')

print('条目', len(rows), '钓点', len(spots), '鱼与钓物', len(fish_all))
print('Rank 分布', collections.Counter(r[3] for r in rows))
r4 = [k for k, v in fish_all.items() if v['rank'] >= 4]
print('Rank4 种类', len(r4), r4)
one = [(k, sorted(v['spots'])[0]) for k, v in fish_all.items() if len(v['spots']) == 1]
print('只在单一钓点', len(one), one[:12])
four = [k for k, v in fish_all.items() if len(v['seasons']) == 4]
print('四季都能钓', len(four), four)
print('样例', rows[0], rows[10])
print('未知水域', [r for r in rows if r[1] == '未知水域'][:3])
