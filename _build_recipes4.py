# -*- coding: utf-8 -*-
"""从 RF4 解包表生成 js/recipes4.js：锻造 / 工艺 / 料理·药学 三表配方"""
import io
import json
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import _xlsx_read as R

F = 'G:/10257/Downloads/符文攻略/RF4数据解包汉化版 Datamining Compendium八月22日.xlsx'
z, sst, sh = R.load(F)
d = {n: R.rows(z, sst, t) for n, t in sh}


def g(r, i):
    return ((r[i] if i < len(r) else '') or '').strip()


def fix(s):
    """修 UTF-8 被按 latin-1 解码造成的乱码（仅处理含 Ã/Â 的串）"""
    if 'Ã' in s or 'Â' in s:
        try:
            s = s.encode('latin-1').decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass
    return s.strip()


# ---------- 译名表 ----------
CN = {}
for r in d['译名表'][1:]:
    e, c = fix(g(r, 0)), fix(g(r, 1))
    if e and c and e not in ('???',) and c not in ('???',):
        CN.setdefault(e, c)


def tr(s):
    s = fix(s)
    if s in CN:
        return CN[s]
    m = s.rsplit(' (', 1)
    if len(m) == 2 and m[1].endswith(')') and m[0] in CN:
        return CN[m[0]]
    return s


# ---------- 分类 ----------
TYPE = {
    'Handmade': '手作', 'Knife': '菜刀', 'Frying Pan': '平底锅', 'Pot': '锅',
    'Steamer': '蒸笼', 'Oven': '烤箱', 'Mixer': '搅拌器',
    'Short Sword': '单手剑', 'Long Sword': '双手剑', 'Spear': '长枪',
    'Axe/Hammer': '斧·锤', 'Staff': '法杖', 'Dual Blade': '双剑', 'Fist': '拳套',
    'Armor': '铠甲', 'Headgear': '头饰', 'Shield': '盾', 'Shoes': '鞋',
    'Accessories': '饰品', 'Farm': '农具', 'Chemistry': '药学',
}
KIND = {
    '手作': '料理', '菜刀': '料理', '平底锅': '料理', '锅': '料理',
    '蒸笼': '料理', '烤箱': '料理', '搅拌器': '料理',
    '单手剑': '武器', '双手剑': '武器', '长枪': '武器', '斧·锤': '武器',
    '法杖': '武器', '双剑': '武器', '拳套': '武器',
    '铠甲': '防具', '头饰': '防具', '盾': '防具', '鞋': '防具',
    '饰品': '饰品', '农具': '农具', '药学': '药学',
}
ORDER = ['手作', '菜刀', '平底锅', '锅', '蒸笼', '烤箱', '搅拌器',
         '单手剑', '双手剑', '长枪', '斧·锤', '法杖', '双剑', '拳套',
         '铠甲', '头饰', '盾', '鞋', '饰品', '农具', '药学']
IDX = {c: i for i, c in enumerate(ORDER)}

SRC = [('Forge Recipes', 2), ('Craft Recipes', 3), ('Cook & Chem Recipes', 2)]

rows = []
odd_level = []
odd_len = []
for sheet, mstart in SRC:
    for r in d[sheet][2:]:
        nm = g(r, 1)
        if not nm or nm == '(nothing)':
            continue
        tp = g(r, 0)
        if tp not in TYPE:
            odd_len.append((sheet, tp, nm))
            continue
        cat = TYPE[tp]
        if len(r) - mstart - 2 <= 0:
            odd_len.append((sheet, tp, nm))
            continue
        mats = []
        for i in range(mstart, len(r) - 2):
            v = g(r, i)
            if v and v != '(nothing)':
                mats.append(tr(v))
        try:
            lv = int(float(g(r, len(r) - 2) or 0))
        except ValueError:
            lv = 0
        if not mats:
            odd_level.append((sheet, nm, lv, '无素材-已排除'))
            continue
        if lv >= 900:
            odd_level.append((sheet, nm, lv, '无等级-显示为—'))
        rows.append({'c': IDX[cat], 'n': tr(nm), 'lv': lv, 'm': mats})

rows.sort(key=lambda x: (x['c'], x['lv'], x['n']))
cnt = [0] * len(ORDER)
for x in rows:
    cnt[x['c']] += 1

js = [
    '/* RF4 全配方 —— Craft Recipes / Forge Recipes / Cook & Chem Recipes 三表合并 %d 条' % len(rows),
    '   字段：c=分类索引（对应 RECIPE4_CATS）、n=配方名、lv=制作技能等级、m=素材（最多 5 项）',
    '   素材名以「类」结尾的是素材类别（任选该类其一即可），其余为具体物品 */',
    'const RECIPE4_CATS = ' + json.dumps(ORDER, ensure_ascii=False) + ';',
    'const RECIPE4_KIND = ' + json.dumps([KIND[c] for c in ORDER], ensure_ascii=False) + ';',
    'const RECIPE4_CNT = ' + json.dumps(cnt) + ';',
    'const RECIPE4 = ' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';',
]
open('js/recipes4.js', 'w', encoding='utf-8').write('\n'.join(js) + '\n')

# ---------- 统计 ----------
print('配方总数', len(rows))
for c, n in zip(ORDER, cnt):
    print('  %-5s %-4s %3d' % (c, KIND[c], n))
print('--- 等级异常(>=900) ---', odd_level)
print('--- 未识别分类 ---', odd_len)
print('--- 等级分布 ---', sorted(set(x['lv'] for x in rows)))
print('--- 素材项数分布 ---')
from collections import Counter
print(dict(Counter(len(x['m']) for x in rows)))
cat_mats = [m for x in rows for m in x['m'] if m.endswith('类')]
print('--- 素材类别出现', len(cat_mats), '次，种类', len(set(cat_mats)))
print(sorted(set(cat_mats)))
print('--- 素材最多的配方 ---')
for x in sorted(rows, key=lambda y: -len(y['m']))[:5]:
    print('  %-10s %d %s' % (x['n'], len(x['m']), x['m']))
