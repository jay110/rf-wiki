# -*- coding: utf-8 -*-
"""从 gametoeasy《龙之天地 村民技能表》(post/1828) 抓表，生成 js/skill_azuma.js

数据结构（照录原表）：
    SKILL_AZUMA = {
      src:  "gametoeasy《符文工房：龙之天地》村民技能表 (post/1828)",
      head: ["村民","技能","等级","描述"],
      rows: [[村民, 技能, 等级, 描述], ...]
    }

原表两个占位写法照录：描述列 276 行写 —、134 行写 0，两者都是「没有描述」。
等级列两种体系：纯数字（含「初始」）= 角色自身等级；「牵绊LvN」= 牵绊等级。
用法：python3 _build_skill_azuma.py [html_path]
"""
import re, io, json, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else '_azuma_p1828.html'
OUT = 'js/skill_azuma.js'

h = io.open(SRC, encoding='utf-8').read()
tb = re.findall(r'<table.*?</table>', h, re.S)[0]
trs = re.findall(r'<tr.*?</tr>', tb, re.S)


def cells(tr):
    raw = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)
    out = []
    for c in raw:
        c = re.sub(r'<br\s*/?>', '、', c)
        c = re.sub(r'<[^>]+>', '', c)
        c = c.replace('\u00a0', ' ')
        out.append(re.sub(r'\s+', ' ', c).strip())
    return out


head = cells(trs[0])
assert len(head) == 4, head
rows = []
for tr in trs[1:]:
    c = cells(tr)
    if len(c) != 4:
        if any(c):
            print('跳过异常行', len(c), c[:3])
        continue
    rows.append(c)

rows = [r for r in rows if r[0] and r[1]]

body = ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rows)
txt = """/* 龙之天地 村民技能表：由 _build_skill_azuma.py 生成，勿手改
   源：gametoeasy《符文工房：龙之天地》村民技能表（post/1828）
   字段：[村民, 技能, 等级, 描述]
   说明：等级列两种体系——纯数字（含「初始」）为角色自身等级，「牵绊LvN」为牵绊等级。
        描述列 276 行写 —、134 行写 0，都是「没有描述」，照录原样。 */
const SKILL_AZUMA = {
    src: 'gametoeasy《符文工房：龙之天地》村民技能表（post/1828）',
    head: %s,
    rows: [
%s
    ]
};
""" % (json.dumps(head, ensure_ascii=False), body)

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(txt)
print('rows', len(rows), '->', OUT)
