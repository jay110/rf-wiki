# -*- coding: utf-8 -*-
"""
构建 js/pot_old.js —— 符文工房 2 / 3 / 边境 / 海洋 的药品数值表

源：biligame wiki
  RF2medicine  https://wiki.biligame.com/runefactory/RF2medicine
  RF3medicine  https://wiki.biligame.com/runefactory/RF3medicine
  RFFmedicine  https://wiki.biligame.com/runefactory/RFFmedicine
  RFOmedicine  https://wiki.biligame.com/runefactory/RFOmedicine

各作保留的列（列数太多会挤成一团，故按「查药时真会用到的」挑）：
  rf2  12 列：名称 种类 HP恢复 RP恢复 力量 智力 其它效果 持续(分) 配方等级 总材料 买价 卖价
  rf3  11 列：名称 制造等级 配方 买价 Lv1卖价 HP恢复 RP恢复 HP上限 RP上限 效果 入手
  rff   8 列：名称 配方 全效果 配方lv 配方书 买价 卖价 入手
  rfo  11 列：名称 药学技能 配方书 总材料 效果时间 HP恢复 RP恢复 特殊效果 买价 卖价 入手

做过的处理（只做格式规整与去污染，不改数值）：
  1. 单独一个 "-" / "—" 统一成 "—"
  2. RF3 的材料 1~6 合并成一列「配方」（同一材料重复出现时记为 ×N）
  3. RF3 的 HP%恢复 / RP%恢复 只在对应数值列为空时补进去（源表两者互斥）
  4. RF2「生命果冻」的其它来源原文混进了对白（"挖矿比赛…要不要采来些药草呢……"），
     按 FIXUP 表修回「挖矿比赛」
  5. 去掉行尾孤立的 "，"（源表多列合并留下的），保留句末 "。"
"""
import re, json, io

def cells(r):
    return [re.sub(r'<[^>]+>', '', c).strip()
            for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]

def trows(fn, idx=0):
    t = open(fn, encoding='utf-8', errors='ignore').read()
    tb = re.findall(r'<table.*?</table>', t, re.S)[idx]
    return [cells(r) for r in re.findall(r'<tr.*?</tr>', tb, re.S)]

DASH = ('', '-', '--', '－', '—', '–', '/', '−')

def c(s):
    s = (s or '').strip().replace('　', ' ')
    if s in DASH:
        return '—'
    s = re.sub(r'^[-－—–]\s*[，,、]\s*', '', s)   # 去掉开头的「-，」
    s = re.sub(r'[，,]\s*$', '', s)   # 去掉行尾孤立逗号
    return s if s else '—'

def mix(mats):
    """材料列表 -> '药草×2 + 蓝草' 形式"""
    out, cnt = [], {}
    for m in mats:
        m = c(m)
        if m == '—':
            continue
        cnt[m] = cnt.get(m, 0) + 1
    for m, n in cnt.items():
        out.append(m if n == 1 else f'{m}×{n}')
    return ' + '.join(out) if out else '—'

# ============ RF2 ============
# 列序：种类 中文名 HP RP 力量 智力 其它效果 持续 配方等级 总材料 配方课程 店铺 卖价 买价 其它来源
RF2_FIX = {
    '挖矿比赛桃乐丝2-02要不要采来些药草呢……': '挖矿比赛',
}
rf2 = trows('_tmp_RF2medicine.html')[1:]
rf2_rows = []
for r in rf2:
    if len(r) < 15:
        continue
    name = c(r[1])
    src = c(r[14])
    src = RF2_FIX.get(src, src)
    rf2_rows.append([name, c(r[0]), c(r[2]), c(r[3]), c(r[4]), c(r[5]), c(r[6]),
                     c(r[7]), c(r[8]), c(r[9]), c(r[13]), c(r[12])])

# ============ RF3 ============
# 列序：中文 制造等级 材料1..6 买价 Lv1卖价 持续 HP HP% RP RP% HP上限 RP上限 攻击 体力 魔攻 效果 入手
rf3 = trows('_tmp_RF3medicine.html')[1:]
rf3_rows = []
for r in rf3:
    if len(r) < 22:
        continue
    hp = c(r[11]); hpp = c(r[12])
    rp = c(r[13]); rpp = c(r[14])
    hp = hp if hp != '—' else hpp
    rp = rp if rp != '—' else rpp
    rf3_rows.append([c(r[0]), c(r[1]), mix(r[2:8]), c(r[8]), c(r[9]),
                     hp, rp, c(r[15]), c(r[16]), c(r[20]), c(r[21])])

# ============ RFF ============
# 列序：名字 材料1..6 全效果 配方lv 配方书 买价 卖价 入手
rff = trows('_tmp_RFFmedicine.html')[1:]
rff_rows = []
for r in rff:
    if len(r) < 13:
        continue
    rff_rows.append([c(r[0]), mix(r[1:7]), c(r[7]), c(r[8]), c(r[9]),
                     c(r[10]), c(r[11]), c(r[12])])

# ============ RFO ============
# 列序：中文 药学技能 配方书 总材料 效果时间 HP RP 特殊效果 买价 卖价 入手
rfo = trows('_tmp_RFOmedicine.html')[1:]
rfo_rows = []
for r in rfo:
    if len(r) < 11:
        continue
    rfo_rows.append([c(x) for x in r[:11]])

DATA = {
    'rf2': {'head': ['名称', '种类', 'HP恢复', 'RP恢复', '力量', '智力', '其它效果',
                     '持续(分)', '配方等级', '总材料', '买价', '卖价'],
            'rows': rf2_rows},
    'rf3': {'head': ['名称', '制造等级', '配方', '买价', 'Lv1卖价', 'HP恢复', 'RP恢复',
                     'HP上限', 'RP上限', '效果', '入手'],
            'rows': rf3_rows},
    'rff': {'head': ['名称', '配方', '全效果', '配方Lv', '配方书', '买价', '卖价', '入手'],
            'rows': rff_rows},
    'rfo': {'head': ['名称', '药学技能', '配方书', '总材料', '效果时间', 'HP恢复', 'RP恢复',
                     '特殊效果', '买价', '卖价', '入手'],
            'rows': rfo_rows},
}

head = '''/* ============================================================
   符文工房 2 / 3 / 边境 / 海洋 —— 药品数值表（源：biligame wiki）
   RF2medicine  https://wiki.biligame.com/runefactory/RF2medicine
   RF3medicine  https://wiki.biligame.com/runefactory/RF3medicine
   RFFmedicine  https://wiki.biligame.com/runefactory/RFFmedicine
   RFOmedicine  https://wiki.biligame.com/runefactory/RFOmedicine

   结构：POT_OLD[作].head = 表头，POT_OLD[作].rows = 数据行（与 head 一一对应）

   只做格式规整，不改数值：
   - 单独一个 "-" 统一成 "—"
   - RF3 材料 1~6 合并为「配方」，重复材料记 ×N
   - RF3 的 HP%／RP% 恢复在数值列为空时补入（源表两者互斥）
   - RF2「生命果冻」入手栏原文混进对白，按源意修回「挖矿比赛」
   - 去掉行尾孤立的 "，"，保留句末 "。"

   源表自身的特点（照录，未修改）：
   - RF3 同名药常有两行：基础材料配方 + 高级材料替代配方，制造等级不同
   - RF3 部分「效果」在源表里被截断（如「全异常状态抗性+」），原文如此
   - RFO 属性提升类（蛋白质／生命果冻／智力补品）的「配方书」栏写的是效果
     （力量+1 等），源表即如此
   ============================================================ */
'''

def dump_obj(d):
    lines = ['const POT_OLD = {']
    for k in ['rf2', 'rf3', 'rff', 'rfo']:
        v = d[k]
        lines.append(f'    /* {k}：{len(v["rows"])} 条 × {len(v["head"])} 列 */')
        lines.append(f'    {k}: {{')
        lines.append('        head: ' + json.dumps(v['head'], ensure_ascii=False) + ',')
        lines.append('        rows: [')
        for row in v['rows']:
            lines.append('            ' + json.dumps(row, ensure_ascii=False) + ',')
        lines.append('        ]')
        lines.append('    },')
    lines.append('};')
    return '\n'.join(lines)

with io.open('js/pot_old.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(head + '\n' + dump_obj(DATA) + '\n')

for k in ['rf2', 'rf3', 'rff', 'rfo']:
    print(k, len(DATA[k]['rows']), '条 ×', len(DATA[k]['head']), '列')
print('RF3 配方列样例:', [r[2] for r in rf3_rows[:4]])
print('RF2 生命果冻入手:', [r for r in rf2_rows if r[0] == '生命果冻'])
