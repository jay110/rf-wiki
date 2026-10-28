# -*- coding: utf-8 -*-
"""
构建 RF1 / RF2 / 边境(RFF) / 海洋(RFO) 四作武器数值表 -> js/weapon_old.js
源：biligame 符文工房 wiki 的 RF1weapon / RF2weapon / RFFweapon / RFOweapon 页
结构：WEQ_ALL = { rf1:{cols,rows,kinds,note}, rf2:..., rff:..., rfo:... }
   每一行 = [搜索串, [单元格...]]，供 pages.js 的 ftableOwn 渲染。
原则：忠实呈现源字段，缺项写「—」，不推算、不编造。
"""
import re, json

def load_tables(fn):
    t = open(fn, encoding="utf-8", errors="ignore").read()
    return re.findall(r'<table.*?</table>', t, re.S)

def rows_of(tb):
    out = []
    for r in re.findall(r'<tr.*?</tr>', tb, re.S):
        cs = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)
        cs = [re.sub(r'<[^>]+>', '', c) for c in cs]
        cs = [re.sub(r'&nbsp;', ' ', c).replace('\u3000', ' ').strip() for c in cs]
        out.append(cs)
    return out

def cell(s):
    s = (s or '').strip()
    if s in ('', '-', '—', '－', '/'):
        return '—'
    return s

FARM = {'镰刀', '洒水壶', '锄头', '钓竿', '农具', '工具'}

# ---------------- RF1 ----------------
def build_rf1():
    tb = load_tables('_tmp_RF1weapon.html')[0]
    data = rows_of(tb)[1:]
    # 0种类 1中文名 2配方等级 3总材料 4配方书 5属性 6攻击力 7使用等级 8连续攻击 9蓄力 10特效 11属性2 12属性攻击力 13攻击速度 14命中率 15盾生效 16RP消耗 17入手 18lv1卖价 19买价
    cols = ['名称', '种类', '属性', '物攻', '使用等级', '连续攻击', '蓄力', '属性攻击', '攻击速度', '买价']
    colw = ['6.4rem', '4rem', '3rem', '4rem', '4.6rem', '4.4rem', '3rem', '5rem', '4.4rem', '4.4rem']
    rows = []
    kinds = {}
    for r in data:
        if len(r) < 20:
            continue
        kind = cell(r[0])
        if kind in FARM:
            continue
        name = cell(r[1])
        atk = cell(r[6])
        elem = cell(r[5])
        attr_atk = cell(r[12])
        cells = [name, kind, elem, atk, cell(r[7]), cell(r[8]), cell(r[9]),
                 attr_atk, cell(r[13]), cell(r[19])]
        q = f"{name} {kind} {elem} {cell(r[10])} {attr_atk} {atk}"
        rows.append([q, cells])
        kinds[kind] = kinds.get(kind, 0) + 1
    return {'cols': cols, 'colw': colw, 'rows': rows,
            'kinds': [[k, v] for k, v in kinds.items()],
            'note': '源：biligame《RF1weapon》。「物攻」为原表攻击力；「属性攻击」是带属性攻击时的额外值（无属性为—）。连续攻击＝一次挥击命中段数，蓄力＝蓄力等级。原表另含命中率、盾生效、RP消耗、配方书、lv1卖价等项未列于此表。'}

# ---------------- RF2 ----------------
def build_rf2():
    tbs = load_tables('_tmp_RF2weapon.html')
    KIND_BY_T = ['单手剑', '大剑', '长枪', '战斗锤', '战斧', '魔杖']  # T6=农具不取
    # 0中文名 1属性 2使用技能 3蓄力 4卖价 5买价 6入手 7攻击力 8魔法攻击力 9总特性 10制作lv 11制作材料1 12强化lv 13强化总材料 14配方课程
    cols = ['名称', '种类', '属性', '物攻', '魔攻', '特性', '使用技能', '卖价', '买价', '入手']
    colw = ['6.4rem', '4rem', '3rem', '3.6rem', '4rem', '8rem', '5.4rem', '4rem', '4rem', '8rem']
    rows = []
    kinds = {}
    for ti, kind in enumerate(KIND_BY_T):
        if ti >= len(tbs):
            break
        for r in rows_of(tbs[ti])[1:]:
            if len(r) < 15:
                continue
            name = cell(r[0])
            atk = cell(r[7]); matk = cell(r[8])
            feat = cell(r[9]); skill = cell(r[2])
            cells = [name, kind, cell(r[1]), atk, matk, feat, skill,
                     cell(r[4]), cell(r[5]), cell(r[6])]
            q = f"{name} {kind} {cell(r[1])} {feat} {skill}"
            rows.append([q, cells])
            kinds[kind] = kinds.get(kind, 0) + 1
    return {'cols': cols, 'colw': colw, 'rows': rows,
            'kinds': [[k, v] for k, v in kinds.items()],
            'note': '源：biligame《RF2weapon》（原页按武器种类分成 7 张表，此处合并战斗武器 6 类，农具表未纳入）。「物攻／魔攻」对应原表攻击力／魔法攻击力；「特性」是原表总特性（暴击率、属性加成等）。'}

# ---------------- 边境 RFF ----------------
def build_rff():
    tb = load_tables('_tmp_RFFweapon.html')[0]
    data = rows_of(tb)[1:]
    # 0种类 1中文 2锻造技能 3总材料 4攻击力 5暴击率 6SALV 7其它攻击特效 8防御特效 9使用技能等级要求 10消耗SP 11命中率 12配方书 13买价 14卖价 15入手
    cols = ['名称', '种类', '物攻', '暴击', '消耗SP', '命中', '攻击特效', '防御特效', '使用等级', '买价']
    colw = ['6.4rem', '4rem', '3.6rem', '3.6rem', '4.4rem', '3.6rem', '8rem', '7rem', '4.4rem', '4.4rem']
    rows = []
    kinds = {}
    for r in data:
        if len(r) < 16:
            continue
        kind = cell(r[0])
        if kind in FARM:
            continue
        name = cell(r[1])
        atk = cell(r[4]); crit = cell(r[5])
        cells = [name, kind, atk, crit, cell(r[10]), cell(r[11]),
                 cell(r[7]), cell(r[8]), cell(r[9]), cell(r[13])]
        q = f"{name} {kind} {cell(r[7])} {atk}"
        rows.append([q, cells])
        kinds[kind] = kinds.get(kind, 0) + 1
    return {'cols': cols, 'colw': colw, 'rows': rows,
            'kinds': [[k, v] for k, v in kinds.items()],
            'note': '源：biligame《RFFweapon》（边境）。「物攻」为原表攻击力；「暴击」为暴击率加成，「消耗SP」「命中」为原表数值；攻击／防御特效是该武器自带的附加效果。农具（镰刀／洒水壶／锄头／钓竿）已排除，见农具页。'}

# ---------------- 海洋 RFO ----------------
def build_rfo():
    tb = load_tables('_tmp_RFOweapon.html')[0]
    data = rows_of(tb)[1:]
    # 0种类 1中文名 2锻造lv 3配方书 4总材料 5攻击力 6防御力 7魔法攻击力 8魔法防御力 9暴击率 10火 11水 12地 13风 14光 15暗 16普通特效 17高质特效 18买价 19卖价 20消耗RP
    cols = ['名称', '种类', '物攻', '魔攻', '物防', '魔防', '暴击', '属性倍率', '特效', '买价']
    colw = ['6.4rem', '4rem', '3.6rem', '3.6rem', '3.4rem', '3.4rem', '3.6rem', '7rem', '9rem', '4.2rem']
    ELEMS = [('火', 10), ('水', 11), ('地', 12), ('风', 13), ('光', 14), ('暗', 15)]
    rows = []
    kinds = {}
    for r in data:
        if len(r) < 21:
            continue
        kind = cell(r[0])
        if kind in FARM:
            continue
        name = cell(r[1])
        atk = cell(r[5])
        # 属性倍率合并：非「—」的项拼成「火50 水30」
        mul = []
        for lab, idx in ELEMS:
            v = (r[idx] or '').strip()
            if v not in ('', '-', '—', '－'):
                mul.append(f"{lab}{v}")
        mul_s = ' '.join(mul) if mul else '—'
        eff = cell(r[16])
        hi = (r[17] or '').strip()
        if hi not in ('', '-', '—', '－'):
            eff = (eff + '／' + hi) if eff != '—' else hi
        cells = [name, kind, atk, cell(r[7]), cell(r[6]), cell(r[8]),
                 cell(r[9]), mul_s, eff, cell(r[18])]
        q = f"{name} {kind} {eff} {mul_s} {atk}"
        rows.append([q, cells])
        kinds[kind] = kinds.get(kind, 0) + 1
    return {'cols': cols, 'colw': colw, 'rows': rows,
            'kinds': [[k, v] for k, v in kinds.items()],
            'note': '源：biligame《RFOweapon》（海洋）。「物攻／魔攻／物防／魔防」对应原表攻击力／魔法攻击力／防御力／魔法防御力；「属性倍率」是火／水／地／风／光／暗六项中非空的加成（其余记—）；「特效」含普通特效与高质特效。镰刀／钓竿／工具已排除。'}

def main():
    data = {
        'rf1': build_rf1(),
        'rf2': build_rf2(),
        'rff': build_rff(),
        'rfo': build_rfo(),
    }
    for k, v in data.items():
        print(f"{k}: rows={len(v['rows'])} kinds={dict(v['kinds'])}")
    header = (
        "// 符文工房 RF1 / RF2 / 边境(RFF) / 海洋(RFO) 武器数值表\n"
        "// 源：biligame 符文工房 wiki —— RF1weapon / RF2weapon / RFFweapon / RFOweapon\n"
        "// 数据只做字段挑拣与农具排除，数值照原表；缺项写「—」，不推算。\n"
        "// 结构：WEQ_ALL = { 作id: { cols:[列头], colw:[列宽], rows:[[搜索串,[单元格]],...], kinds:[[种类,件数]], note } }\n"
    )
    body = "const WEQ_ALL = " + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ";\n"
    open('js/weapon_old.js', 'w', encoding='utf-8').write(header + body)
    print("wrote js/weapon_old.js")

if __name__ == '__main__':
    main()
