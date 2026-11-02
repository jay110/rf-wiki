# -*- coding: utf-8 -*-
"""解析极击网《RF3 全出货列表》，生成 js/rf3goods.js

源：G:/10257/Downloads/符文攻略/RF3 全出货列表-极击网_樱桃小乐乐.txt
    UTF-16LE（带 BOM），918 行，6 大类 / 41 子类 / 791 条，每条「日文名 (中文译名)」，
    鱼那一节在中文名后还带 [春][夏][秋][冬] 季节标注。

产出：RF3_GOODS.rows = [[日文名, 源译名, 大类, 子类, 季节, 站内同名], ...]
      站内同名按「中文名精确相同（含斜杠多写法拆开）」判定，对不上写 null——
      译名不同但可能是同一件东西的，本节一律不猜，留给页面写清楚。
"""
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = 'G:/10257/Downloads/符文攻略/RF3 全出货列表-极击网_樱桃小乐乐.txt'
OUT = os.path.join(HERE, 'js', 'rf3goods.js')

CATS = ['作物类', '药品类', '装备品类', '装饰品类', '食品类', '水产品类', '收集品类']


def parse_src():
    raw = open(SRC, 'rb').read()
    txt = raw.decode('utf-16')
    if txt and txt[0] == '\ufeff':
        txt = txt[1:]
    cat = sub = None
    cat_claim = {}
    sub_claim = {}
    rows = []
    for line in txt.splitlines():
        s = line.replace('\u3000', '').strip()
        if not s:
            continue
        m = re.match(r'^(' + '|'.join(CATS) + r')\s*\(共计(\d+)种\)$', s)
        if m:
            cat, cat_claim[m.group(1)] = m.group(1), int(m.group(2))
            continue
        m = re.match(r'^►\s*(\S+)\s*\((\d+)种\)$', s)
        if m:
            sub, sub_claim[(cat, m.group(1))] = m.group(1), int(m.group(2))
            continue
        m = re.match(r'^(.+?)\s*[（(]\s*([^()（）]+?)\s*[)）]\s*(?:\[(\S+?)\])?$', s)
        assert m, '解析不出的行：%r' % s
        rows.append([m.group(1).strip(), m.group(2).strip(), cat, sub, m.group(3) or None])
    return rows, cat_claim, sub_claim


def load_item_rf3():
    """直接读 js/rf3data.js 里那段合法 JSON 数组，不经中间文件。"""
    s = io.open(os.path.join(HERE, 'js', 'rf3data.js'), encoding='utf8').read()
    i = s.index('const ITEM_RF3')
    j = s.index('[', i)
    depth = 0
    for k in range(j, len(s)):
        ch = s[k]
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                return json.loads(s[j:k + 1])
    raise SystemExit('ITEM_RF3 数组没闭合')


def main():
    rows, cat_claim, sub_claim = parse_src()

    # —— 断言：每条数都与源自称的条数一致 ——
    from collections import Counter
    cn = Counter(r[2] for r in rows)
    assert len(rows) == sum(cat_claim.values()) == 791, (len(rows), sum(cat_claim.values()))
    for c, n in cat_claim.items():
        assert cn[c] == n, (c, cn[c], n)
    cs = Counter((r[2], r[3]) for r in rows)
    for k, n in sub_claim.items():
        assert cs[k] == n, (k, cs[k], n)
    print('大类', len(cat_claim), '子类', len(sub_claim), '条目', len(rows))

    IT = load_item_rf3()
    # 源子类 → 站内分类候选（同一件名字在不同类别里可能重名，如「龙牙」既是枪又是素材）
    SUB2IT = {
        '特效种子': ['种子'], '种子': ['种子'], '草花': ['草与花'],
        '水果': ['作物'], '蔬菜': ['作物'],
        '秘药': ['药与香料'], '回复瓶': ['药与香料'], '药': ['药与香料'],
        '剪子': ['农具'], '刷子': ['农具'], '钓竿': ['农具'], '锄头': ['农具'],
        '洒水壶': ['农具'], '镰刀': ['农具'],
        '脚装备': ['防具与饰品'], '头装备': ['防具与饰品'], '饰品': ['防具与饰品'],
        '盾': ['盾'], '双剑': ['双剑'], '杖': ['魔杖'], '斧': ['斧'], '锤': ['锤'],
        '枪': ['长枪'], '双手剑': ['双手剑'], '单手剑': ['单手剑'],
        '材料': ['食材'],
        '空手料理': ['料理'], '蒸锅': ['料理'], '搅拌机': ['料理'], '烤炉': ['料理'],
        '锅子': ['料理'], '平底煎锅': ['料理'], '失败作': ['料理'],
        '菜刀': ['刺身'],
        '垃圾': ['垃圾'], '鱼': ['鱼'],
        '其他': ['特殊道具', '素材'], '收集品': ['素材', '特殊道具'],
    }
    for r in rows:
        assert r[3] in SUB2IT, '没有映射的子类：%s' % r[3]
    names = {r[0]: r[0] for r in IT}

    # 译名规范化：全是可复核的字符串替换，命中即站内真实存在的名字（不是猜对应）
    def variants(cn):
        base = [x.strip() for x in re.split(r'[/／]', cn)]
        out = list(base)
        for x in base:
            out.append(x.replace('刺身', '生鱼片'))
            out.append(x.replace('仗', '杖'))
            out.append(x.replace('的', ''))
            out.append(x.replace('御神木', '神木').replace('的', ''))
            out.append(x.replace('仗', '杖').replace('的', ''))
        return out

    cnt = {1: 0, 2: 0}
    for r in rows:
        pool = {x[0] for x in IT if x[1] in SUB2IT[r[3]]}
        si = r[1] if r[1] in pool else None
        m = 1 if si else 0
        if not si:   # 斜杠多写法逐个试
            si = next((x for x in [y.strip() for y in re.split(r'[/／]', r[1])] if x in pool), None)
            m = 1 if si else 0
        if not si:   # 译名规范化
            si = next((x for x in variants(r[1]) if x in pool), None)
            m = 2 if si else 0
        r += [si, m]
        if m:
            cnt[m] += 1
    print('同名', cnt[1], '规范化后同名', cnt[2], '未对上', len(rows) - cnt[1] - cnt[2])

    data = {
        'src': '极击网《RF3 全出货列表》（樱桃小乐乐 整理），UTF-16LE，791 条',
        'claims': {'cats': cat_claim, 'subs': [[k[0], k[1], v] for k, v in sub_claim.items()]},
        'itemTotal': len(IT),
        'rows': rows,
    }
    js = ('/* RF3 极击网出货清单 —— 由 _build_rf3_goods.py 生成，勿手改。\n'
          '   源：极击网《RF3 全出货列表》（樱桃小乐乐 整理），UTF-16LE，6 大类 41 子类 791 条。\n'
          '   字段：[日文名, 源译名, 大类, 子类, 季节, 站内同名, 匹配方式(0/1/2)]\n'
          '   站内同名只按「中文名精确相同」判定，译名不同的一律不猜。 */\n'
          'var RF3_GOODS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    io.open(OUT, 'w', encoding='utf8', newline='\n').write(js)
    print('写出', OUT, len(js), '字节')


if __name__ == '__main__':
    main()
