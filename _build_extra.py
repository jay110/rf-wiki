# -*- coding: utf-8 -*-
"""从「符文攻略」资料包生成 js/extradata.js
   数据源：
     RF4全怪物喜好表.xlsx / Sheet1            魔物喜好（3 项）
     RF5全怪物喜好表.xlsx / Sheet1            魔物喜好（4 项 + 捕捉率）
     符文工厂4素材出处__若雪爱丽丝.xlsx        收集品来源 + 怪物分布掉落
     RF5掉率表Hyperwiki.xlsx / Sheet1         掉落率（4 项）
     符文工厂译名查询粗略表8月27日.xlsx        RF3 香水矩阵 + RF3 Boss 抗性
"""
import sys, json, io
sys.path.insert(0, '.')
import _xlsx_read as X

P = r'G:/10257/Downloads/符文攻略/'
OUT = r'G:/wit_tools/work/RF_WIKI/js/extradata.js'


def sheet(path, name):
    z, sst, sheets = X.load(path)
    for nm, tgt in sheets:
        if nm == name:
            r = X.rows(z, sst, tgt)
            z.close()
            return r
    z.close()
    raise SystemExit('sheet not found: ' + name)


# 资料包里的原表把 オリハルコン 抄成「奥利哈刚」，站内一律作「奥利哈钢」（120 处）。
# 掉落格是「阔刃剑、小盾牌、奥利哈刚、小结晶」这种顿号串起来的，所以按「、」切成
# 词逐个查表，再拼回去——只换整词，别的一律不动。
NAME_FIX = {'奥利哈刚': '奥利哈钢'}

def cell(r, i):
    v = (r[i] if i < len(r) else '').strip()
    if not v:
        return v
    return '、'.join(NAME_FIX.get(p, p) for p in v.split('、'))


# ---------- 1. RF4 魔物喜好 ----------
g4 = []
seen = set()
for r in sheet(P + 'RF4全怪物喜好表.xlsx', 'Sheet1')[1:]:
    n = cell(r, 0)
    if not n or n in seen or n == '???':   # ??? 是占位行
        continue
    # 「无」保留：Boss 与不可驯服的个体确实没有喜好，这本身是信息
    prefs = [cell(r, i) for i in (1, 2, 3)]
    prefs = [x for x in prefs if x and x != '无']
    seen.add(n)
    g4.append([n] + prefs + [''] * (3 - len(prefs)))

# ---------- 2. RF5 魔物喜好 + 捕捉率 ----------
g5 = []
seen = set()
for r in sheet(P + 'RF5全怪物喜好表.xlsx', 'Sheet1')[1:]:
    n = cell(r, 0)
    if not n or n in seen:
        continue
    seen.add(n)
    ok = cell(r, 1) or '可抓'
    rate = cell(r, 2)
    prefs = [cell(r, i) for i in (3, 4, 5, 6)]
    prefs = [x for x in prefs if x and x != '无']
    g5.append([n, ok, rate] + prefs + [''] * (4 - len(prefs)))

# ---------- 3. RF4 素材出处（采集 / 购买） ----------
src = []
for r in sheet(P + '符文工厂4素材出处__若雪爱丽丝.xlsx', '收集品'):
    n = cell(r, 0)
    if not n or n == '前言':
        continue
    src.append([n, cell(r, 1), cell(r, 2), cell(r, 3)])

# ---------- 4. RF4 怪物分布与掉落 ----------
mdrop = []
for r in sheet(P + '符文工厂4素材出处__若雪爱丽丝.xlsx', '怪物'):
    n = cell(r, 0)
    if not n:
        continue
    mdrop.append([n, cell(r, 1), cell(r, 2), cell(r, 3), cell(r, 4)])

# ---------- 5. RF5 掉落率 ----------
drop5 = []
for r in sheet(P + 'RF5掉率表Hyperwiki.xlsx', 'Sheet1'):
    n = cell(r, 1)
    if not n or n in ('怪物', '黑暗来客与后续boss') or cell(r, 0) == '数据来源：':
        continue
    if not cell(r, 0).isdigit():      # 只收有序号的正规行
        continue
    row = [n, cell(r, 2), cell(r, 3)]
    for k in range(4):
        item = cell(r, 4 + k * 2)
        rate = cell(r, 5 + k * 2)
        try:
            rate = round(float(rate) * 100, 2) if rate else ''
        except ValueError:
            rate = ''
        row += [item, rate]
    drop5.append(row)

# ---------- 6. RF3 香水矩阵 ----------
perf_rows = sheet(P + '符文工厂译名查询粗略表8月27日.xlsx', 'RF3香水表')
chars = [c for c in perf_rows[0][1:] if c]
scents, mat = [], []
for r in perf_rows[1:17]:
    s = cell(r, 0)
    if not s:
        continue
    scents.append(s)
    row = []
    for i in range(1, len(chars) + 1):
        v = cell(r, i)
        row.append(1 if v else 0)
    mat.append(row)
# 一致性校验：矩阵反查出来的角色喜好数应与原表「按角色」块吻合
rev = {c: [scents[j] for j in range(len(scents)) if mat[j][i]] for i, c in enumerate(chars)}
chk = {cell(r, 0): [cell(r, k) for k in range(1, 8) if cell(r, k)] for r in perf_rows[34:58]}
mis = []
for c, v in chk.items():
    if c in rev:
        a = set(v) - {'希雅蕾丝'}
        if a != set(rev[c]):
            mis.append((c, sorted(a), sorted(rev[c])))

# ---------- 7. RF3 Boss 抗性 ----------
bres = []
for r in sheet(P + '符文工厂译名查询粗略表8月27日.xlsx', 'RF3魔物boss抗性')[1:]:
    n = cell(r, 0)
    if not n:
        continue
    vals = []
    for i in range(2, 10):
        v = cell(r, i)
        try:
            vals.append(int(float(v)))
        except ValueError:
            vals.append(0)
    bres.append([n, cell(r, 1), vals])


def js(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':'))


body = []
body.append('/* 由 _build_extra.py 生成：数据取自「符文攻略」资料包（RF4/RF5 解包与攻略表） */\n')
body.append('/* RF4 魔物喜好：[个体名, 喜好1, 喜好2, 喜好3] */')
body.append('const GIFT_RF4 = ' + js(g4) + ';\n')
body.append('/* RF5 魔物喜好：[个体名, 可抓, 初始捕捉率, 喜好1…喜好4] */')
body.append('const GIFT_RF5 = ' + js(g5) + ';\n')
body.append('/* RF4 素材出处：[名称, 日文, 英文, 取得方式] */')
body.append('const SRC_RF4 = ' + js(src) + ';\n')
body.append('/* RF4 怪物分布与掉落：[名称, 日文, 英文, 地点, 掉落物] */')
body.append('const MDROP_RF4 = ' + js(mdrop) + ';\n')
body.append('/* RF5 掉落（Hyperwiki）：[名称, 地点1, 地点2, 物1, 率1, 物2, 率2, 物3, 率3, 物4, 率4]，率为百分数 */')
body.append('const DROP_RF5 = ' + js(drop5) + ';\n')
body.append('/* RF3 香水：16 种香味 × 24 位角色，m[s][c]=1 表示该角色喜欢这款香味 */')
body.append('const PERF_RF3 = { scents: ' + js(scents) + ', chars: ' + js(chars) + ', m: ' + js(mat) + ' };\n')
body.append('/* RF3 Boss 抗性：[名称, 日文, [火,水,地,风,光,暗,爱,无]] */')
body.append('const BRES_RF3 = ' + js(bres) + ';\n')

io.open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(body))

print('GIFT_RF4', len(g4), ' 有喜好', sum(1 for x in g4 if x[1]))
print('GIFT_RF5', len(g5), ' 可抓', sum(1 for x in g5 if x[1] == '可抓'), ' 有喜好', sum(1 for x in g5 if x[3]))
print('SRC_RF4', len(src), ' MDROP_RF4', len(mdrop))
print('DROP_RF5', len(drop5), ' 有多件掉落', sum(1 for x in drop5 if x[6] or x[8] or x[10]))
print('PERF_RF3', len(scents), '香 ×', len(chars), '角色  勾选', sum(sum(r) for r in mat))
print('BRES_RF3', len(bres))
print('香水矩阵与原表「按角色」块不一致处：', len(mis))
for m in mis[:6]:
    print('   ', m)
