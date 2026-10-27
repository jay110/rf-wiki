# -*- coding: utf-8 -*-
"""从 RF4 数据解包表生成 js/items4.js 与 js/mon4.js"""
import io, json, openpyxl

SRC = r'G:/10257/Downloads/符文工房攻略/RF4数据解包汉化版 Datamining Compendium八月22日.xlsx'
OUT1 = r'G:/wit_tools/work/RF_WIKI/js/items4.js'
OUT2 = r'G:/wit_tools/work/RF_WIKI/js/mon4.js'

wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)

# ---------- 物品 ----------
iv = list(wb['Item Values'].iter_rows(values_only=True))
rows = [r for r in iv[2:] if r[1] and r[5] is not None]

# 类别编号 → (大类, 中文标签)
CAT = {
    0: ('ing', '作物'), 1: ('ing', '水果'), 2: ('ing', '药草与花'),
    3: ('pot', '药品'),
    4: ('dsh', '失败作'), 5: ('dsh', '刺身'), 6: ('dsh', '炒菜'), 7: ('dsh', '煮物与饮品'),
    8: ('dsh', '烘烤与面包'), 9: ('dsh', '果汁'), 10: ('dsh', '蒸物'), 11: ('dsh', '沙拉与腌菜'),
    12: ('dsh', '主食'),
    13: ('ing', '畜产'), 14: ('ing', '调味料'),
    46: ('seed', '种子'), 47: ('seed', '农药'),
    51: ('mat', '素材'), 52: ('ing', '鱼'), 53: ('mat', '垃圾'), 54: ('mat', '矿物与建材'),
    55: ('mat', '特殊'), 57: ('mat', '配方面包'),
}
EQ_CAT = {
    15: ('单手剑', 0), 16: ('双手剑', 0), 17: ('长枪', 0), 18: ('战锤', 0),
    19: ('战斧', 0), 24: ('魔杖', 0), 25: ('双剑', 0), 26: ('拳套', 0),
    27: ('锄头', 1), 28: ('洒水壶', 1), 29: ('镰刀', 1), 30: ('斧', 1), 31: ('锤', 1), 32: ('钓竿', 1),
    33: ('盾', 2), 34: ('饰品', 2), 35: ('头', 2), 36: ('鞋', 2), 37: ('身体', 2),
    40: ('毛刷', 1), 41: ('剪刀', 1), 45: ('放大镜', 1),
}
BUCKET = {'mat': [], 'dsh': [], 'pot': [], 'ing': [], 'seed': []}
for r in rows:
    cat = r[5]
    if cat in CAT:
        b, lab = CAT[cat]
        if r[1] == '无内容占位名称':
            continue
        BUCKET[b].append([r[1], lab, int(r[10] or 0), int(r[11] or 0), int(r[6] or 0)])

# ---------- 装备 ----------
eq = [r for r in list(wb['Equipment List'].iter_rows(values_only=True))[1:] if r[1]]
seg = [r for r in rows if r[5] in EQ_CAT]
assert len(eq) <= len(seg), (len(eq), len(seg))

ATTR = {'None': '无', 'Fire': '火', 'Water': '水', 'Earth': '地', 'Wind': '风',
        'Light': '光', 'Dark': '暗', 'Love': '爱'}
RESC = [('Fire Res%', '火'), ('Water Res%', '水'), ('Earth Res%', '地'), ('Wind Res%', '风'),
        ('Light Res%', '光'), ('Dark Res%', '暗'), ('Love Res%', '爱')]


def col(head, name):
    """按表头名取列号"""
    return head.index(name)


head = list(wb['Equipment List'].iter_rows(values_only=True))[0]
C = {h: i for i, h in enumerate(head)}

wep, arm, acc, tol = [], [], [], []
for i, e in enumerate(eq):
    cat = seg[i][5]
    lab, kind = EQ_CAT[cat]
    name = e[C['RF4S简体']]
    attr = ATTR.get(e[C['Attribute']], '无')
    atk = int(e[C['ATK']] or 0)
    matk = int(e[C['MATK']] or 0)
    df = int(e[C['DEF']] or 0)
    mdf = int(e[C['MDEF']] or 0)
    diz = int(e[C['Diz']] or 0)
    crit = int(e[C['Crit%']] or 0)
    stun = int(e[C['Stun%']] or 0)

    def ressum(a, b):
        out = []
        for k, cn in RESC[a:b]:
            v = e[C[k]] or 0
            if v:
                out.append('%s%d' % (cn, v))
        return ' '.join(out)

    if kind == 0:
        wep.append([name, lab, attr, atk, matk, crit, stun])
    elif kind == 1:
        tol.append([name, lab, attr, atk, matk, diz])
    else:
        if lab == '饰品':
            det = []
            for k, cn in [('ATK', '攻'), ('MATK', '魔攻'), ('DEF', '防'), ('MDEF', '魔防'),
                          ('STR', '力'), ('INT', '智'), ('VIT', '体')]:
                v = e[C[k]] or 0
                if v:
                    det.append('%s%d' % (cn, v))
            acc.append([name, ' '.join(det), ressum(26, 33), '%d/%d' % (int(e[C['Diz Res%']] or 0), int(e[C['Crt Res%']] or 0))])
        else:
            arm.append([name, lab, df, mdf, int(e[C['Crt Res%']] or 0), int(e[C['Diz Res%']] or 0), ressum(26, 33)])

print('武器', len(wep), '防具', len(arm), '饰品', len(acc), '农具', len(tol))
print('素材', len(BUCKET['mat']), '料理', len(BUCKET['dsh']), '药品', len(BUCKET['pot']),
      '食材', len(BUCKET['ing']), '种子', len(BUCKET['seed']))

# ---------- 怪物 ----------
mr = list(wb['村民与怪物数据'].iter_rows(values_only=True))
mh = list(mr[1])
MC = {h: i for i, h in enumerate(mh) if h}
mon = []
for r in mr[2:]:
    if r[2] is None or not isinstance(r[2], (int, float)) or r[2] < 100:
        continue
    nm = r[1]
    if not nm:
        continue
    # 剔除同一 ID 段里的 UI／系统实体与传送门，它们不是可打的怪
    if any(k in nm for k in ('广告牌', '菜单', '输入名字', '商店', '新要素', '剧情',
                             '设备', '节日', '结婚', '称呼', '传送门', '转移之门',
                             '天堂之门')):
        continue
    mon.append([nm, int(r[MC['Base Level']] or 0), int(r[MC['Base HP']] or 0),
                int(r[MC['Base Atk']] or 0), int(r[MC['Base Def']] or 0),
                int(r[MC['XP']] or 0)])
print('怪物行', len(mon))
print('样例', mon[:3], mon[-3:])
wb.close()


def dump(name, data, comment):
    lines = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    return '/* %s */\nconst %s = %s;\n' % (comment, name, lines)


buf = io.StringIO()
buf.write('/* 符文工房4 物品数据：取自《RF4数据解包汉化版 Datamining Compendium》\n')
buf.write('   字段：\n')
buf.write('     EQW_RF4 武器 [名称, 种类, 属性, 物攻, 魔攻, 暴击%, 眩晕]\n')
buf.write('     EQA_RF4 防具 [名称, 部位, 物防, 魔防, 暴击抗%, 眩晕抗%, 抗性摘要]\n')
buf.write('     EQJ_RF4 饰品 [名称, 数值摘要, 抗性摘要, 眩晕抗/暴击抗]\n')
buf.write('     EQT_RF4 农具 [名称, 类型, 属性, 物攻, 魔攻, 眩晕]\n')
buf.write('     MAT_RF4 / DSH_RF4 / POT_RF4 / ING_RF4 / SEED_RF4 [名称, 分类, 买价, 卖价, 稀有度]\n')
buf.write('*/\n')
for n, d, c in [('EQW_RF4', wep, '武器：名称, 种类, 属性, 物攻, 魔攻, 暴击%, 眩晕'),
                ('EQA_RF4', arm, '防具：名称, 部位, 物防, 魔防, 暴击抗%, 眩晕抗%, 抗性摘要'),
                ('EQJ_RF4', acc, '饰品：名称, 数值摘要, 抗性摘要, 眩晕抗/暴击抗'),
                ('EQT_RF4', tol, '农具：名称, 类型, 属性, 物攻, 魔攻, 眩晕'),
                ('MAT_RF4', BUCKET['mat'], '素材：名称, 分类, 买价, 卖价, 稀有度'),
                ('DSH_RF4', BUCKET['dsh'], '料理：名称, 分类, 买价, 卖价, 稀有度'),
                ('POT_RF4', BUCKET['pot'], '药品：名称, 分类, 买价, 卖价, 稀有度'),
                ('ING_RF4', BUCKET['ing'], '食材：名称, 分类, 买价, 卖价, 稀有度'),
                ('SEED_RF4', BUCKET['seed'], '种子与农药：名称, 分类, 买价, 卖价, 稀有度')]:
    buf.write(dump(n, d, c))
io.open(OUT1, 'w', encoding='utf-8').write(buf.getvalue())

io.open(OUT2, 'w', encoding='utf-8').write(dump('MON_RF4', mon,
    'RF4 怪物基础数值：名称, 等级, HP, 攻击, 防御, 经验'))
print('written')
