# -*- coding: utf-8 -*-
"""构建 RF3 素材强化属性表 -> js/mat_rf3.js
源：biligame《RF3item》（90 条素材，含作为强化材料时提供的 攻/魔攻/防/魔防/力量/智力/体力 与特效）
结构：MAT_RF3 = [[素材, 买价, 卖价, 攻, 魔攻, 防, 魔防, 力量, 智力, 体力, 攻击特效, 防御特效, 强化难度, 入手], ...]
原则：原表照录，「-」记为 —（表示 0 或无），不推算。
"""
import re, json

def cells(r):
    return [re.sub(r'<[^>]+>', '', c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]

def norm(s):
    s = re.sub(r'&nbsp;', ' ', s).replace('\u3000', ' ').strip()
    if s in ('', '-', '—', '－', '/'):
        return '—'
    return s

t = open('_tmp_RF3item.html', encoding='utf-8', errors='ignore').read()
tb = re.findall(r'<table.*?</table>', t, re.S)[0]
rows = [cells(r) for r in re.findall(r'<tr.*?</tr>', tb, re.S)]
hdr = rows[0]
data = rows[1:]

out = []
for r in data:
    if len(r) < 15:
        continue
    name = norm(r[0])
    if not name or name == '—':
        continue
    # 0中文 1买价 2卖价 3攻 4魔攻 5防 6魔防 7力量 8智力 9体力 10攻效 11防效 12强化难度 13入手 14地点
    out.append([
        name, norm(r[1]), norm(r[2]),
        norm(r[3]), norm(r[4]), norm(r[5]), norm(r[6]),
        norm(r[7]), norm(r[8]), norm(r[9]),
        norm(r[10]), norm(r[11]), norm(r[12]),
        norm(r[13]) if len(r) > 13 else '—',
    ])

print('表头:', hdr)
print('条数:', len(out))
print('样例:', out[:3])
print('有效强化属性条数(至少一项非—):',
      sum(1 for r in out if any(v != '—' for v in r[3:10])))

h = (
    "// 符文工房3 素材强化属性表\n"
    "// 源：biligame《RF3item》——素材作为强化材料时提供的属性加成\n"
    "// 字段：[素材, 买价, 卖价, 攻, 魔攻, 防, 魔防, 力量, 智力, 体力, 攻击特效, 防御特效, 强化难度, 入手]\n"
    "// 「—」表示 0、无或原表未给；数值照原表，不推算。\n"
)
body = "const MAT_RF3 = " + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ";\n"
open('js/mat_rf3.js', 'w', encoding='utf-8').write(h + body)
print('wrote js/mat_rf3.js')
