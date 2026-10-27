# -*- coding: utf-8 -*-
"""从 RF4 Equipment List 抽取「状态赋予」与「抗性」两类隐藏数值 → js/fxdata.js

原表 48 列，其中：
  15~17  Crit% / Knock% / Stun%      → 会心、击飞、晕眩的附加率
  18~25  Psn/Seal/Par/Slp/Ftg/Sick/Faint/Drain Atk%  → 八种状态异常附加率
  26~43  Fire..Drain Res%            → 十八种抗性
这些值在游戏里不显示，只在解包表里，是本页的核心。

原表数值是 float32 存的小数（0.099853515625 其实就是 0.1），
所以先 round 到 3 位小数再乘 100，才能得到干净的 10%。
"""
import io, sys, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _xlsx_read as R

SRC = 'G:/10257/Downloads/符文攻略/RF4数据解包汉化版 Datamining Compendium八月22日.xlsx'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'js', 'fxdata.js')


def clean(s):
    """原表部分希腊字母按 Latin-1 存坏，恢复到 UTF-8"""
    if not s:
        return ''
    try:
        return s.encode('latin-1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s


def cell(r, i):
    return clean(((r[i] if i < len(r) else '') or '').strip())


def num(r, i):
    v = cell(r, i)
    try:
        return float(v)
    except ValueError:
        return 0.0


def pct(v):
    """归一成整数百分比：0.099853515625 → 10"""
    if not v:
        return 0
    return int(round(round(v, 3) * 100))


def main():
    z, sst, sheets = R.load(SRC)
    d = {n: R.rows(z, sst, t) for n, t in sheets}
    eq = [r for r in d['Equipment List'][1:] if cell(r, 0)]

    # ---- 部位：配方表的 Type 字段是最可靠的来源，三个怪物掉落手工补 ----
    raw2kind = {
        'Short Sword': '单手剑', 'Long Sword': '双手剑', 'Spear': '长枪',
        'Axe/Hammer': '斧锤', 'Staff': '魔杖', 'Dual Blade': '双剑',
        'Fist': '拳套', 'Farm': '农具', 'Accessories': '饰品',
        'Armor': '铠甲', 'Headgear': '头饰', 'Shield': '盾', 'Shoes': '鞋',
    }
    tmap = {}
    for sheet in ('Forge Recipes', 'Craft Recipes'):
        for r in d[sheet][2:]:
            nm = cell(r, 1)
            if nm and nm != '(nothing)':
                tmap.setdefault(nm, cell(r, 0))
    manual = {'Golem Punch': '拳套', 'Magic Plant Shield': '盾', 'Plant Sword': '单手剑'}

    def kind(en):
        t = tmap.get(en)
        if t:
            return raw2kind.get(t, t)
        return manual.get(en, '其他')

    # 状态赋予 11 项：8 种异常 + 会心 / 击飞 / 晕眩
    S_ATK = [(8, '毒'), (9, '封印'), (10, '麻痹'), (11, '睡眠'), (12, '疲劳'),
             (13, '病'), (14, '昏厥'), (15, '吸血'),
             (16, '暴击'), (17, '击飞'), (18, '晕眩')]
    # 抗性 18 项
    S_RES = [(i, n) for i, n in enumerate(
        ['火', '水', '土', '风', '光', '暗', '爱', '晕', '暴击', '击飞',
         '毒', '封印', '麻痹', '睡眠', '疲劳', '病', '昏厥', '吸'])]

    # 表内列号：状态赋予 15~25（Crit% 起），抗性 26~43
    A_COL = [(15, 0), (16, 1), (17, 2), (18, 3), (19, 4), (20, 5), (21, 6), (22, 7),
             (23, 8), (24, 9), (25, 10)]
    # 注意：上面 11 项对应到 S_ATK 的顺序
    # 实际列顺序是 Diz(14) Crit(15) Knock(16) Stun(17) Psn(18)...Drain(25)
    A_COL = [(15, 8), (16, 9), (17, 10),
             (18, 0), (19, 1), (20, 2), (21, 3), (22, 4), (23, 5), (24, 6), (25, 7)]

    rows = []
    statN = [0] * 11
    resN = [0] * 18
    neg = []
    for r in eq:
        atk = []
        for col, idx in A_COL:
            v = pct(num(r, col))
            if v:
                atk.append([idx, v])
                statN[idx] += 1
        res = []
        for j, (col, _) in enumerate(S_RES):
            v = pct(num(r, 26 + j))
            if v:
                res.append([j, v])
                resN[j] += 1
                if v < 0:
                    neg.append((cell(r, 1), S_RES[j][1], v))
        if atk or res:
            rows.append([cell(r, 1), kind(cell(r, 0)), atk, res])

    # 排序：先按件数多的部位，再按名字，保证同部位的挨在一起
    order = ['单手剑', '双手剑', '长枪', '斧锤', '魔杖', '双剑', '拳套', '农具',
             '盾', '铠甲', '头饰', '鞋', '饰品', '其他']
    rows.sort(key=lambda x: (order.index(x[1]) if x[1] in order else 99, x[0]))

    # 重名去掉（Gloves 出现两次，内容相同）
    seen = set()
    ded = []
    for x in rows:
        k = (x[0], x[1])
        if k in seen:
            continue
        seen.add(k)
        ded.append(x)
    rows = ded

    lines = []
    lines.append('/* RF4 装备的隐藏数值：状态异常赋予率 / 十八种抗性')
    lines.append('   来源：RF4 数据解包「Equipment List」（422 件装备，取其中有状态或抗性的）')
    lines.append('   结构：[中文名, 部位, [[状态序号, 百分比], ...], [[抗性序号, 百分比], ...]]')
    lines.append('   原表为 float32 小数（0.099853515625 实为 0.1），已归一为整数百分比 */')
    lines.append('')
    lines.append('const FX_ST = [')
    for i, (_, n) in enumerate(S_ATK):
        lines.append("    '%s'%s" % (n, ',' if i < 10 else ''))
    lines.append('];')
    lines.append('const FX_RS = [')
    for i, (_, n) in enumerate(S_RES):
        lines.append("    '%s'%s" % (n, ',' if i < 17 else ''))
    lines.append('];')
    lines.append('')
    lines.append('const FX_RF4 = [')
    for nm, kd, atk, res in rows:
        a = ','.join('[%d,%d]' % (i, v) for i, v in atk)
        q = ','.join('[%d,%d]' % (i, v) for i, v in res)
        lines.append("    ['%s','%s',[%s],[%s]]," % (nm, kd, a, q))
    lines.append('];')
    lines.append('')

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print('写入 %s' % OUT)
    print('装备条数 %d（有状态赋予 %d / 有抗性 %d）' % (
        len(rows),
        sum(1 for x in rows if x[2]),
        sum(1 for x in rows if x[3])))
    print('状态赋予分布：' + '  '.join('%s%d' % (S_ATK[i][1], statN[i]) for i in range(11)))
    print('抗性分布：' + '  '.join('%s%d' % (S_RES[i][1], resN[i]) for i in range(18)))
    print('负抗：', neg)


if __name__ == '__main__':
    main()
