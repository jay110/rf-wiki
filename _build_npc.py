# -*- coding: utf-8 -*-
"""构建村民礼物喜好数据：RF4 / RF5 解包表 -> js/npcdata.js"""
import sys, io, json, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import _xlsx_read as R

F4 = 'G:/10257/Downloads/符文攻略/RF4数据解包汉化版 Datamining Compendium八月22日.xlsx'
F5 = 'G:/10257/Downloads/符文攻略/RF5_Data数据解包汉化版8月27日.xlsx'


def en2cn(x):
    return (x or '').strip()


# ---------------- RF4 ----------------
z4, sst4, sh4 = R.load(F4)
d4 = {n: R.rows(z4, sst4, t) for n, t in sh4}

# 解包表用的是它自己一套译名，与站内定稿（wiki 源页的 [[定稿|别名]]）不一致。
# 这里统一到站内口径，人物喜好页与人物名册才对得上、也才能互相跳转。
# 依据是 RF4characters 源页的条目写法，例如「[[基尔|奇尔]]（キール，Kiel）」。
F4_NAME = {
    '沃尔卡农': '沃卡农',      # ヴォルカノン Volkanon
    '基尔': '奇尔',            # キール Kiel
    '巴特': '巴德',            # バド Bado
    '铃华': '铃芳',            # リンファ Lin Fa
    '艾尔米娜达': '艾露米娜塔',  # エルミナータ Illuminata
    '布罗萨姆': '巴洛索姆',      # ブロッサム Blossom
    '雷欧': '雷昂',            # レオン Leon
    '赛尔泽薇德': '瑟尔泽薇德',  # セルザウィード Ventuswill
    '多娜': '托娜',            # トゥーナ Raven
}

m4 = {}
m4['Traveler'] = '旅行者'
for r in d4['Item Values'][2:]:
    if len(r) > 1 and r[0].strip() and r[1].strip():
        m4[r[0].strip()] = r[1].strip()

npc4 = []          # [名, 超喜欢[], 喜欢[], 讨厌[]]
idx4 = {}
for r in d4['村民喜好'][1:]:
    if not r or not r[0].strip() or r[0].strip() in ('#N/A', 'Char'):
        continue
    name = r[0].strip()
    cn = (r[1] or '').strip()
    typ = (r[2] or '').strip()
    if name not in idx4:
        idx4[name] = len(npc4)
        shown = cn or name
        npc4.append([F4_NAME.get(shown, shown), [], [], []])
    rec = npc4[idx4[name]]
    for i in range(3, len(r) - 1, 2):
        item = (r[i] or '').strip()
        fp = (r[i + 1] or '').strip()
        if not item or item.startswith('#') or item in ('#N/A',):
            continue
        # 同一行内可能混排不同 FP，按 FP 归类更稳
        try:
            v = int(fp)
        except ValueError:
            v = 0
        if v >= 15:
            tgt = 1
        elif v > 0:
            tgt = 2
        elif v < 0:
            tgt = 3
        else:
            continue
        rec[tgt].append(m4.get(item, item))

# 去重保序
for rec in npc4:
    if '旅行者' in rec[0]:
        rec[0] = '旅行者'
    for k in (1, 2, 3):
        seen = set()
        out = []
        for x in rec[k]:
            if x not in seen:
                seen.add(x)
                out.append(x)
        rec[k] = out

# ---------------- RF5 ----------------
z5, sst5, sh5 = R.load(F5)
d5 = {n: R.rows(z5, sst5, t) for n, t in sh5}

m5 = {}
for r in d5['译名表'][1:]:
    en = (r[1] if len(r) > 1 else '').strip()
    cn = (r[2] if len(r) > 2 else '').strip()
    if en and cn:
        m5[en] = cn
# 与 RF4 同理：解包表按英文名给译名，和站内定稿（RF5characters 源页）不一致。
# 依据源页条目写法，例如「[[塞西尔]]（セシル、Cecile）」「[[流卡]]（リュカ、Lyka）」。
EXTRA5 = {'Fuuka': '芙佳', 'Great Autumn Grass': '上等秋之草', 'Manju': '馒头',
          'Livia': '莉薇亚', 'Radea': '蕾迪亚', 'Darroch': '道格', 'Julian': '朱利安',
          'Margaret': '玛格丽特', 'Cecil': '塞西尔', 'Cecile': '塞西尔',
          'Ryker': '流卡', 'Lyka': '流卡',
          'Son/Daughter': '儿子／女儿', 'Son': '儿子', 'Daughter': '女儿'}
m5.update(EXTRA5)

KEY = {'VeryFavoriteItem': 3, 'FavoriteItem': 4, 'NotFavoriteItem': 5, 'NotFavoriteBadlyItem': 6}
npc5 = []          # [名, 生日礼物, 花[], 超喜欢[], 喜欢[], 讨厌[], 极讨厌[], 婚后礼物[]]
cur = None
for r in d5['NPCGiftData'][2:]:
    g = lambda i: ((r[i] if i < len(r) else '') or '').strip()
    a, ret = g(1), g(2)
    if a == 'FocusName':
        continue
    if ret.startswith('ITEMCATEGORY') or ret.startswith('Item_Type'):
        cur = [m5.get(a, a), m5.get(g(3), g(3)),
               [m5.get(x, x) for x in [g(5), g(6), g(7)] if x and x != '-'],
               [], [], [], [],
               [m5.get(x, x) for x in r[8:] if x and x.strip() != '-']]
        npc5.append(cur)
        continue
    if a in KEY and cur is not None:
        cur[KEY[a]].extend([m5.get(x.strip(), x.strip()) for x in r[2:] if x and x.strip() != '-'])

for rec in npc5:
    for k in (2, 3, 4, 5, 6, 7):
        seen = set()
        out = []
        for x in rec[k]:
            if x not in seen:
                seen.add(x)
                out.append(x)
        rec[k] = out

# 通用雷区：多少人讨厌（RF5 不喜欢 + 极讨厌）
n5 = len(npc5)
hate5 = collections.Counter()
for b in npc5:
    for v in set(b[5]) | set(b[6]):
        hate5[v] += 1
COMMON5 = [k for k, v in hate5.items() if v >= n5 * 0.8]

# 个人禁忌 = 不喜欢里去掉通用雷区
for b in npc5:
    b.append([x for x in b[5] if x not in COMMON5])   # index 8

js = []
js.append('/* 村民礼物喜好：RF4（27 人）/ RF5（29 人） 由 _build_npc.py 生成，勿手改 */')
js.append('var NPC_RF4 = ' + json.dumps(npc4, ensure_ascii=False, separators=(',', ':')) + ';')
js.append('var NPC_RF5 = ' + json.dumps(npc5, ensure_ascii=False, separators=(',', ':')) + ';')
js.append('var HATE_RF5 = ' + json.dumps(COMMON5, ensure_ascii=False, separators=(',', ':')) + ';')
open('js/npcdata.js', 'w', encoding='utf-8').write('\n'.join(js) + '\n')

print('RF4 村民', len(npc4), '超喜欢', sum(len(x[1]) for x in npc4),
      '喜欢', sum(len(x[2]) for x in npc4), '讨厌', sum(len(x[3]) for x in npc4))
print('RF5 村民', len(npc5), '超喜欢', sum(len(x[3]) for x in npc5),
      '喜欢', sum(len(x[4]) for x in npc5), '讨厌', sum(len(x[5]) for x in npc5),
      '极讨厌', sum(len(x[6]) for x in npc5))
print('RF5 通用雷区', len(COMMON5), COMMON5)
print('RF5 无婚后礼物', [x[0] for x in npc5 if not x[7]])
print('RF5 无花', [x[0] for x in npc5 if not x[2]])
print('空超喜欢', [x[0] for x in npc5 if not x[3]])
print('空极讨厌', [x[0] for x in npc5 if not x[6]])
print('RF4 空喜欢', [x[0] for x in npc4 if not x[2]])
print('RF4 空讨厌', [x[0] for x in npc4 if not x[3]])
print('sample RF4', npc4[0])
print('sample RF5', npc5[0][:5])
