#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把《RF4 装备锻造/强化详解》(百度贴吧·呼兒將出換美酒) 拆成结构化数据。

原文是 GB18030 的纯文本，靠 "第N段奖励(XX TLU): ..." 这类固定句式取数，
不重写、不补数值、不翻译。英文素材清单那一节按 "Name - N RP" 取值，
再用站内 MAT_RF4 / ING_RF4 的「稀有度」逐条对照（只对名字无歧义的）。
"""
import json
import os
import re

RAW = 'G:/10257/Downloads/符文攻略/RF4 装备锻造_强化详解.txt'   # 原件是 GB18030
SRC = '_src_rf4forge.txt'
OUT = 'js/rf4forge.js'

# 原件不是 UTF-8，先转一份工作副本（副本不入库，删掉也能重新生成）
if not os.path.exists(SRC):
    open(SRC, 'w', encoding='utf-8', newline='\n').write(
        open(RAW, 'rb').read().decode('gb18030').replace('\r\n', '\n'))

text = open(SRC, encoding='utf-8').read()
lines = text.split('\n')

# ---------------- 1. 分段奖励表 ----------------
def grab(pattern, chunk):
    out = []
    for m in re.finditer(pattern, chunk):
        out.append([int(x.replace(',', '')) if x.replace(',', '').isdigit() else x
                    for x in m.groups()])
    return out


def section(start_kw, end_kw):
    i = next(k for k, l in enumerate(lines) if start_kw in l)
    j = next(k for k, l in enumerate(lines) if k > i and end_kw in l)
    return '\n'.join(lines[i:j])


wep_tlu = grab(r'第(\d)段奖励\((\d+) TLU\): ([\d,]+) Attack, ([\d,]+) Matk',
               section('武器(材料等级总数)', '武器(材料稀有度总数)'))
wep_trp = grab(r'第(\d)段奖励\((\d+) TRP\): ([\d,]+) Attack',
               section('武器(材料稀有度总数)', '防具(材料等级总数)'))
arm_tlu = grab(r'第(\d)段奖励\((\d+) TLU\): ([\d,]+) Def, ([\d,]+) M\. ?Def',
               section('防具(材料等级总数)', '防具(材料稀有度总数)'))
arm_trp = grab(r'第(\d)段奖励\((\d+) TRP\): ([\d,]+) Def',
               section('防具(材料稀有度总数)', '在装备到每一个阶段后'))

assert len(wep_tlu) == 5 and len(wep_trp) == 8, (len(wep_tlu), len(wep_trp))
assert len(arm_tlu) == 5 and len(arm_trp) == 8

tlu_rows = [[w[0], w[1], w[2], w[3], a[2], a[3]] for w, a in zip(wep_tlu, arm_tlu)]
trp_rows = [[w[0], w[1], w[2], a[2]] for w, a in zip(wep_trp, arm_trp)]

# ---------------- 2. 外国论坛补充的两张魔法表 ----------------
staff = grab(r'Tier (\d+): ([\d,]+) M\.ATK \((\d+) TRP\)', text)
mdef = grab(r'Tier (\d+): ([\d,]+) M\.DEF \((\d+) TRP\)', text)
assert len(staff) == 8 and len(mdef) == 8, (len(staff), len(mdef))

# ---------------- 3. 饰品按属性分三类 ----------------
acc = []
for m in re.finditer(r'^(DEF|MDEF|ATK): (.+)$', text, re.M):
    acc.append([m.group(1), m.group(2).strip()])
assert len(acc) == 3

# ---------------- 4. 特殊功用材料 ----------------
# 这一节原文是中英混排的一行一条，句式不统一（有的没中文名、有的英文夹在中间），
# 正则硬拆会串行。所以逐条照抄，再用断言核对「原文里确实有这一条」。
SPEC = [
    ('Magnifying Glass', '放大镜', '成品同样能检测土壤 (强化到水壸中吧)', ''),
    ('Fish', '鱼类', '强化到鱼竿中能提升该类鱼的出现机率', ''),
    ('Invisible Stone', '透光石', '武器变透明', ''),
    ('Raccoon Leaf', '狸猫叶', '增加武器攻击笵围', ''),
    ('Glitta Augite', '辉耀矿', '增加武器攻击笵围(强于狸猫叶)(砍树得的那种石)', ''),
    ('Object X', '毒素X', '后续所有材料功效相反', ''),
    ('Mealy Apple', '黑苹果', '大量负属性，和上述的X一起用', ''),
    ('Shade Stone', '', '击中时减少对方抗性(我没有用过所以不清楚)', ''),
    ('Rare Can', '稀有罐头', '只作用于武器，增加怪物稀有道具的掉落率(不知道对宝箱或捡草药等等的影响)', ''),
    ('4-Leaf Clover', '', '只作用于武器，增加怪物稀有道具的掉落率(不知道对宝箱或捡草药等等的影响)', ''),
    ('Green/Blue/Red/Yellow Cores', '四色核心', '四种颜色的核心全部强化到同一件装备中可以有对无属性攻击的10%减免。', ''),
    ('Elemental Dragon Scales', '圣龙鳞', '只作用于盾牌，拳套和双刀平常不享受盾牌属性，强化后能享有50%', ''),
    ('Elemental Crystals', '元素水晶', '加入武器后能改变武器属性.', ''),
    ('Golden Crops', '黄金植物', '加入武器中能添加即死效果(我没有测试).', ''),
    ('Light Ore', '光明石', '武器跨种继承用.', ''),
    ('Double Steel', '', '效果等同前一份强化的材料的2倍 (只能生效一次)', ''),
    ('10-Fold Steel', '', '效果等同前一份强化的材料的8倍 (只能生效一次)', ''),
    ('Scrap Metal+', '超级废铁', '使武器攻击变为1', ''),
    ('White Stone', '白色石子', '强化到装备给家庭成员后，家人的近战伤害两倍，受伤半减，弱点属性半减(有待详细测试)', '帝国雪原的'),
]
flat = re.sub(r'\s+', '', text)
spec = []
for en, cn, note, pre in SPEC:
    assert en in text, en
    assert re.sub(r'\s+', '', note)[:10] in flat, note
    spec.append({'en': en, 'cn': cn, 'note': note, 'pre': pre})
assert len(spec) == 19

# ---------------- 5. 素材稀有度(RP)清单 ----------------
CN_NAME = {
    # 矿物
    'Iron': '铁', 'Bronze': '铜', 'Silver': '银', 'Gold': '金', 'Platinum': '白金',
    'Orichalcum': '奥利哈钢', 'Dragonic Stone': '龙幻石',
    # 蔬菜
    'Cabbage': '卷心菜', 'Pink Turnip': '樱芜菁', 'Pink Melon': '少女蜜瓜',
    'Onion': '洋葱', 'Pumpkin': '南瓜', 'Cucumber': '黄瓜', 'Corn': '玉米',
    'Tomato': '番茄', 'Eggplant': '茄子', 'Yam': '番薯', 'Potato': '马铃薯',
    'Carrot': '胡萝卜', 'Green Pepper': '青椒', 'Spinach': '菠菜', 'Turnip': '芜菁',
    'Radish': '白萝卜', 'Leek': '葱', 'Bok Choy': '白菜', 'Hot-Hot Fruit': '火热果实',
    'Golden Cabbage': '金卷心菜', 'Golden Pumpkin': '金南瓜', 'Golden Potato': '金马铃薯',
    'Golden Turnip': '金芜菁', 'Bamboo Sprout': '筍',
    # 菇 / 果
    'Mushroom': '菇', 'Grape': '葡萄', 'Apple': '苹果', 'Orange': '橘子',
    'Strawberry': '草莓', 'Pineapple': '菠萝',
    'Large Golden Pumpkin': '惊悚金南瓜', 'Large Emery Flower': '大金刚花',
    # 其余少数能一对一认出来的
    'Double Steel': '倍铁', '10-Fold Steel': '10倍铁',
    'Glitta Augite': '闪耀石', 'Raccoon Leaf': '狸猫的叶子',
    'Dragon Bones': '龙骨', 'Ice Wall': '冰壁的碎片', 'Chim Tail': '奇美拉的尾巴',
    'Dragon Fang': '龙牙', 'Lightning Mane': '闪电鬃毛', 'Ambrosia Thorns': '安布洛希亚之荆',
    'Rafflesia Petal': '霸王花的花瓣', 'Ammonite': '菊石', 'Wet Scale': '湿掉的鳞片',
    'Shiny Screw': '亮晶晶的螺丝', 'Broken Box': '坏掉的木箱',
    'Glitta': '闪耀石', '10-fold': '10倍铁',
}

CATS = [('Minerals', '矿物'), ('Vegetables', '蔬菜'), ('Mushrooms', '蘑菇'), ('Fruit', '水果')]
rp = []
cat = None
tail_cat = '其他'
k0 = next(k for k, l in enumerate(lines) if l.strip() == 'Minerals')
for k in range(k0, len(lines)):
    s = lines[k].strip()
    if not s:
        continue
    if s in dict(CATS):
        cat = dict(CATS)[s]
        continue
    if s.startswith('Large Golden Pumpkin'):
        cat = tail_cat          # 这行之后是杂项，没有小标题
        continue
    if s.startswith('Large Golden Pumpkin'):
        cat = cat or '其他'
    m = re.match(r'^([A-Za-z0-9 /\+\-\.]+?)\s*-\s*([\d,]+)(\s*RP)?$', s)
    if not m:
        continue
    en, v = m.group(1).strip(), int(m.group(2).replace(',', ''))
    rp.append({'cat': cat or tail_cat, 'en': en, 'cn': CN_NAME.get(en, ''), 'v': v})

# ---------------- 6. 站内稀有度对照 ----------------
def load_arr(name, path='js/items4.js'):
    s = open(path, encoding='utf-8').read()
    m = re.search(name + r' = (\[.*?\]);', s, re.S)
    return json.loads(m.group(1))


MAT = load_arr('MAT_RF4')
ING = load_arr('ING_RF4')
rar = {}
for row in MAT + ING:
    if len(row) >= 5:
        rar.setdefault(row[0], row[4])

for it in rp:
    it['mine'] = rar.get(it['cn']) if it['cn'] else None

same = [x for x in rp if x['mine'] is not None and x['mine'] == x['v']]
diff = [x for x in rp if x['mine'] is not None and x['mine'] != x['v']]
noid = [x for x in rp if x['mine'] is None]

# 同一素材在清单里出现两次且数值不同
dupe = {}
for it in rp:
    dupe.setdefault(it['cn'] or it['en'].lower(), []).append(it)
conflict = {k: v for k, v in dupe.items() if len({x['v'] for x in v}) > 1}

# ---------------- 7. 理论最高攻击武器 ----------------
i0 = next(k for k, l in enumerate(lines) if '理论攻击最高的武器' in l)
maxw = []
for k in range(i0, len(lines)):
    s = lines[k].strip()
    if s.startswith('下面是外国论坛'):
        break
    if s:
        maxw.append(s)

# 红萝卜剑那段「点评」：原文一整行，留给页面当引文
quote = next(l.strip() for l in lines if l.strip().startswith('点评：'))

# ---------------- 输出 ----------------
data = {
    'src': '《RF4 装备锻造/强化详解》（百度贴吧·呼兒將出換美酒，2017）',
    'base': {'pos': 6, 'enh': 9},
    'tlu': {'head': ['段', 'TLU 门槛', '武器物攻', '武器魔攻', '防具物防', '防具魔防'],
            'rows': tlu_rows},
    'trp': {'head': ['段', 'TRP 门槛', '武器物攻', '防具物防'], 'rows': trp_rows},
    'staff': {'head': ['段', 'TRP 门槛', '法杖魔攻'], 'rows': [[a, c, b] for a, b, c in staff]},
    'mdef': {'head': ['段', 'TRP 门槛', '魔防'], 'rows': [[a, c, b] for a, b, c in mdef]},
    'acc': acc,
    'spec': spec,
    'rp': rp,
    'maxw': maxw,
    'quote': quote,
}

js = '/* 符文工房4 装备锻造／强化详解：取自《RF4 装备锻造_强化详解》\n'
js += '   （百度贴吧·呼兒將出換美酒）。由 _build_rf4_forge.py 生成，勿手改。\n'
js += '   字段：tlu/trp 分段奖励、staff/mdef 魔法系补充表、acc 饰品按属性分类、\n'
js += '         spec 特殊功用材料、rp 素材稀有度清单（mine = 站内稀有度）、maxw 最高攻击拆解 */\n'
js += 'const RF4_FORGE = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(OUT, 'w', encoding='utf-8', newline='\n').write(js)

# ---------------- 报告 ----------------
print('TLU 表 %d 段 / TRP 表 %d 段' % (len(tlu_rows), len(trp_rows)))
print('法杖表 %d 段 / 魔防表 %d 段 / 饰品 %d 类' % (len(staff), len(mdef), len(acc)))
print('特殊材料 %d 条' % len(spec))
for s in spec:
    print('   %-22s %-10s %s' % (s['en'][:22], s['cn'], s['note'][:40]))
print('RP 清单 %d 条' % len(rp))
from collections import Counter
print('   分类', dict(Counter(x['cat'] for x in rp)))
print('   能对上站内 %d 条：一致 %d、不一致 %d；对不上 %d' % (len(same) + len(diff), len(same), len(diff), len(noid)))
for x in diff:
    print('   不一致 %-20s %-10s 源 %-3d 站内 %s' % (x['en'], x['cn'], x['v'], x['mine']))
for x in noid:
    print('   未配 %-22s 源 %d' % (x['en'], x['v']))
print('清单内部同物不同值：')
for k, v in conflict.items():
    print('   ', k, [(x['en'], x['v']) for x in v])
print('最高武器拆解 %d 行' % len(maxw))
for l in maxw:
    print('   ', l)
print('写出', OUT)
