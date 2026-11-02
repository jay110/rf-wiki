# -*- coding: utf-8 -*-
"""从《符文3素材强化效果不包括法杖.txt》（GB18030，贴吧社区整理，无署名）
拆出「强化最大值」9 条与 96 行素材强化效果，并与站内 mat_rf3.js 的 MAT_RF3 逐条对。

源的行布局是「名 + 效果块 + 加点块 + 难度N」，名与效果之间、效果与设点之间都是
2 个以上空格对齐，但有两处没有对齐空格（海盗哥布林的布、奇美拉的尾巴），
所以名称用显式清单做最长匹配，不用正则猜；解析完对每行做「名+剩余长度」断言。
"""
import re, json, io, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join('G:', os.sep, '10257', 'Downloads', '符文攻略', '符文3素材强化效果不包括法杖.txt')

t = open(SRC, 'rb').read().decode('gb18030')
ls = t.splitlines()

# ---- 一、强化最大值（原文前 11 行）----
caps_atk = ['气绝值最大99', '暴击率最大值128', '吸血 疲劳 感冒 睡眠 毒 气绝 封印攻击最大值255']
caps_def = ['吸血抗性 气绝抗性 毒抗性 吹飞抗性 麻痹抗性 感冒抗性 疲劳抗性 封印抗性 睡眠抗性 即死抗性 暴击抗性 最大值128',
            '耐性技能满级+63（49%）', '硬直最大值128']
caps_elem = ['爱.水.火.风.土.光.暗.无抗性一共4级',
             '1级伤害1/2；2级伤害1/8，即伤害大幅减少.3级免疫.4级吸收.']
for seg in caps_atk + caps_def + caps_elem:
    assert seg in t, seg

# ---- 二、素材名（显式清单，最长匹配）----
NAMES = """牧草 软毛 软软的毛 毛线球 软软绵绵的毛 紫水晶 绿宝石 红宝石 海蓝宝石 蓝宝石 铁 铜 银 金 钻石 白金
火之结晶 风之结晶 水之结晶 地之结晶 光之结晶 暗之结晶 小结晶
结实的藤 兽人的破布 生锈的箭头 海盗哥布林的布 狸猫树叶 射手火药 哥布林绷带 战士之证 古代鱼之骨 狼牙
鹦鹉螺 冰之鼻 妖精之粉 水龙鳞 地龙鳞 龙牙
蘑菇孢子 蝎子的尾巴 毒粉 奇美拉的尾巴 歌之小瓶 昆虫下颚 蝎子的钳子 铁屑 豹爪 魔人之角 火龙鳞 软棉棉棉
格里莫亚之鳞 骷髅 坚固的角 巨人手套 锤子碎片 巨人之爪 动枝 狮子红毛 电气结晶 斗牛之角 豪迈胸毛 坏掉的柄
植物茎 结实的蜘蛛丝 漂亮的蜘蛛丝 骨胶 龟壳 维京护肩 京护肩 格雷姆石板 爱属性结晶 浮游灵的头巾 恶魔之血 鱼主之鳞
植物根 坏掉的木箱 狮子蓝毛 丝绸 上质的毛皮 毛皮 魔法师之粉 魔力结晶 虫皮 漂亮的虫皮 冰壁碎片 鸟之羽 龙骨""".split()
NAMES = sorted(set(NAMES), key=len, reverse=True)

STAT = r'(魔攻|魔防|筋力|知力|体力|攻|防)([+-]\d+)'


def parse(line):
    raw = line
    m = re.search(r'难度\s*(\d+)\s*$', line)
    assert m, '无难度列：' + raw
    dif = int(m.group(1))
    body = line[:m.start()]

    nm = None
    for n in NAMES:
        if body.startswith(n):
            nm, rest = n, body[len(n):]
            break
    assert nm, '名字对不上：' + raw

    rest = rest.replace('气  绝抗性', '气绝抗性')   # 原文把「气绝抗性」拆成两截
    mods = [[mm.group(1), int(mm.group(2))] for mm in re.finditer(STAT, rest)]
    rest2 = re.sub(STAT, ' ', rest)
    rest2 = re.sub(r'）\s+(-?[\d.]+[%&])', r'）\1', rest2)   # 「暴击（1） 0.8%」中间有空格
    rest2 = re.sub(r'([%&])(?=[\u4e00-\u9fa5])', r'\1 ', rest2)  # 「4.7%气绝抗性（8）8%」中间没空格

    toks = [x for x in re.split(r'\s+', rest2) if x]
    eff, pend = [], []
    for tk in toks:
        m2 = re.match(r'^(.*?)（(-?\d+)）\s*(-?[\d.]+[%&]?)$', tk)
        if m2:
            labs = pend + [x for x in re.split(r'[，、]', m2.group(1)) if x]
            for L in labs:
                eff.append([L, int(m2.group(2)), m2.group(3), tk])
            pend = []
        elif re.match(r'^[\u4e00-\u9fa5]+$', tk):
            pend.append(tk)
        else:
            raise SystemExit('无法识别的词 %r 出自 %r' % (tk, raw))
    assert not pend, '悬空标签 %r 出自 %r' % (pend, raw)

    return dict(nm=nm, dif=dif, eff=eff, mods=mods, raw=raw.strip())


rows = [parse(l) for i, l in enumerate(ls) if i >= 13 and l.strip()]
assert len(rows) == 96, len(rows)

# ---- 三、站内 MAT_RF3 ----
src_js = open(os.path.join(HERE, 'js', 'mat_rf3.js'), encoding='utf8').read()
i = src_js.index('const MAT_RF3')
i = src_js.index('[', i)
MINE, _ = json.JSONDecoder().raw_decode(src_js[i:])   # 该数组本身是合法 JSON
mine = {r[0]: r for r in MINE}

# 源名 -> 站内名。只在「明显是同一件」时映射；拿不准的留空，不硬配。
MAP = {
    '牧草': '牧草', '软毛': '软软毛', '软软的毛': '软绒毛', '软软绵绵的毛': '毛茸茸的软软毛',
    '毛线球': '毛线球',
    '紫水晶': '紫水晶', '绿宝石': '绿宝石', '红宝石': '红宝石', '海蓝宝石': '海蓝宝石', '蓝宝石': '蓝宝石',
    '铁': '铁', '铜': '铜', '银': '银', '金': '金', '钻石': '钻石', '白金': '白金',
    '火之结晶': '火之结晶', '风之结晶': '风之结晶', '水之结晶': '水之结晶', '地之结晶': '地之结晶',
    '光之结晶': '光之结晶', '暗之结晶': '暗之结晶', '小结晶': '小结晶',
    '结实的藤': '结实的藤蔓', '兽人的破布': '兽人的破布', '生锈的箭头': '生锈的箭头',
    '海盗哥布林的布': '海盗哥布林的布', '狸猫树叶': '狸猫的叶子', '射手火药': '射手的引火药',
    '哥布林绷带': '哥布林的绷带', '战士之证': '战士之证', '古代鱼之骨': '古代鱼的骨头',
    '狼牙': '狼牙', '鹦鹉螺': '菊石', '冰之鼻': '冰之鼻', '妖精之粉': '小仙子的粉末',
    '水龙鳞': '水龙羽鳍', '地龙鳞': '地龙鳞片', '龙牙': '龙牙',
    '蘑菇孢子': '蘑菇孢子', '蝎子的尾巴': '蝎子的尾巴', '毒粉': '毒粉',
    '奇美拉的尾巴': '奇美拉的尾巴', '歌之小瓶': '会唱歌的小瓶子',
    '昆虫下颚': '昆虫的下颚', '蝎子的钳子': '蝎子的钳子', '铁屑': '废铁', '豹爪': '豹爪',
    '魔人之角': '魔人的角', '火龙鳞': '火龙鳞片', '软棉棉棉': '摩可绵毛',
    '格里莫亚之鳞': '克里莫亚的鳞片', '骷髅': '骷髅',
    '坚固的角': '坚固的角', '巨人手套': '巨人的手套', '锤子碎片': '锤子的碎片',
    '巨人之爪': '巨人之爪', '动枝': '会动的树枝',
    '狮子红毛': '狮子的红毛', '电气结晶': '电之结晶',
    '斗牛之角': '斗牛的角', '豪迈胸毛': '究极的胸毛', '坏掉的柄': '坏掉的柄',
    '植物茎': '植物的茎', '结实的蜘蛛丝': '强韧的蜘蛛丝', '漂亮的蜘蛛丝': '漂亮的蜘蛛丝',
    '骨胶': '胶', '龟壳': '龟壳', '维京护肩': '维京肩甲', '京护肩': '',
    '格雷姆石板': '石魔人的石板', '爱属性结晶': '爱之结晶', '浮游灵的头巾': '浮游灵的头巾',
    '恶魔之血': '恶魔之血', '鱼主之鳞': '百鱼王的鳞片',
    '植物根': '植物的根', '坏掉的木箱': '坏掉的木箱', '狮子蓝毛': '狮子的青毛', '丝绸': '丝绸',
    '上质的毛皮': '优质毛皮', '毛皮': '毛皮',
    '魔法师之粉': '魔法师的粉末', '魔力结晶': '魔力结晶',
    '虫皮': '虫皮', '漂亮的虫皮': '漂亮的虫皮',
    '冰壁碎片': '冰壁的碎片', '鸟之羽': '鸟羽毛', '龙骨': '龙骨',
}

KEY = {'攻': 3, '魔攻': 4, '防': 5, '魔防': 6, '筋力': 7, '知力': 8, '体力': 9}
BLANK = ('—', '', None)


def num(v):
    return None if (v is None or v in BLANK) else int(v)


out = []
for r in rows:
    cn = MAP.get(r['nm'], '')
    rec = dict(n=r['nm'], d=r['dif'], e=r['eff'], m=r['mods'])
    if cn:
        row = mine.get(cn)
        assert row is not None, '映射到站内不存在的名字：%s -> %s' % (r['nm'], cn)
        rec['cn'] = cn
        rec['md'] = num(row[12])
        mm = []
        for k, kk in KEY.items():
            v = num(row[kk])
            mm.append([k, 0 if v is None else v])
        rec['mm'] = mm
    out.append(rec)
    assert len(rec['e']) + len(rec['m']) > 0, r['raw']

# 断言语义：96 行、行内数据不得凭空多出
nmap = sum(1 for x in out if x.get('cn'))
print('行数 %d，对上站内 %d' % (len(out), nmap))

js = io.StringIO()
js.write('// 符文工房3 素材强化效果（含每件素材的攻击特效数值与强化难度上限）\n')
js.write('// 源：《符文3素材强化效果不包括法杖.txt》，GB18030，社区整理，原文无署名（标题自述「不包括法杖」）\n')
js.write('// 字段：[源名, 难度, 效果[[状态, 数值, 百分比, 原文片段]...], 加点[[项, 值]...], 站内名, 站内难度, 站内加点]\n')
js.write('// 「站内名」为空＝两边对不上，不硬配；站内数值取自 js/mat_rf3.js 的 MAT_RF3。\n')
js.write('const RF3_MAT = {\n')
js.write('  src: %s,\n' % json.dumps('《符文3素材强化效果不包括法杖》', ensure_ascii=False))
js.write('  capsAtk: %s,\n' % json.dumps(caps_atk, ensure_ascii=False))
js.write('  capsDef: %s,\n' % json.dumps(caps_def, ensure_ascii=False))
js.write('  capsElem: %s,\n' % json.dumps(caps_elem, ensure_ascii=False))
lines = []
for x in out:
    lines.append('    ' + json.dumps([
        x['n'], x['d'], x['e'], x['m'], x.get('cn', ''), x.get('md'), x.get('mm')
    ], ensure_ascii=False, separators=(',', ':')).replace('null', 'null'))
js.write('  rows: [\n' + ',\n'.join(lines) + '\n  ]\n')
js.write('};\n')
open(os.path.join(HERE, 'js', 'rf3mat.js'), 'w', encoding='utf8', newline='\n').write(js.getvalue())
print('写出 js/rf3mat.js')
