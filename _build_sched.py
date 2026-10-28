# -*- coding: utf-8 -*-
"""从 _npc_src/RF1charactersschedule.txt 生成 js/sched.js
源：biligame 符文工厂：新牧场物语 村民每日行程表（CC BY-SA）
28 名村民 × 8 种星期状态 × 19 个整点时段
"""
import re, json, io, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '_npc_src', 'RF1charactersschedule.txt')
OUT = os.path.join(HERE, 'js', 'sched.js')

B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

# 日程源与人物库的译名不一致（源页更新较晚，两套译名并行）
NAME_ALIAS = {
    '密丝特': '蜜丝特', '塔芭莎': '塔巴莎', '萝赛塔': '萝洁塔',
    '塞希莉娅': '塞西莉娅', '琳妮特': '莉妮特',
}
# 地点：源页同一建筑两种译名，统一
SPOT_ALIAS = {'卡尔迪亚图书馆': '图书馆'}

# 建筑分类 → 配色
CAT = {
    '密丝特的家': 'home', '镇长府': 'home', '查克里努斯豪宅': 'home',
    '诺伊曼的农场': 'home', '卡缪的农场': 'home', '拉格纳的家': 'home', '牧场': 'home',
    '旅馆': 'shop', '杂货店': 'shop', '酒馆': 'shop', '铁匠铺': 'shop',
    '海之家': 'shop', '浴场': 'shop',
    '图书馆': 'pub', '教堂': 'pub', '医院': 'pub', '中央广场': 'pub',
    '镇第1排街道': 'out', '镇第2排街道': 'out', '镇第3排街道': 'out',
    '海岸': 'out', '克莱门斯山': 'out',
    '1洞': 'cave', '5洞': 'cave', '6洞': 'cave',
    '—': 'none',
}
FLOOR_RE = re.compile(r'(大厅|门口|[0-9]F|B[0-9])$')


def unwiki(x):
    """[[a|b]] -> b, [[a]] -> a，保留链接外的尾巴（1F / 的家 / 20:40到…）"""
    x = x.strip()
    x = re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]', r'\1', x)
    x = re.sub(r'\[\[([^\]]*)\]\]', r'\1', x)
    return x.strip()


SUBS = ('1F', '2F', '3F', 'B1', '大厅', '门口')
LOST = []


def split_spot(txt):
    """'旅馆1F' -> ('旅馆','1F')；'查克里努斯豪宅大厅' -> ('查克里努斯豪宅','大厅')"""
    t = unwiki(txt)
    if t in SPOT_ALIAS:
        t = SPOT_ALIAS[t]
    if t in CAT:
        return t, ''
    m = FLOOR_RE.search(t)
    if m:
        base = SPOT_ALIAS.get(t[:m.start()], t[:m.start()])
        if base in CAT:
            return base, m.group(1)
    # '20:40到克莱门斯山' 之类带前缀的杂项：认建筑，前缀记一笔不问
    for k in sorted(CAT, key=len, reverse=True):
        if k in t:
            pre = t.replace(k, '').strip()
            if pre:
                LOST.append((t, k, pre))
            return k, ''
    LOST.append((t, '', '未归类'))
    return t, ''


def load_npcfull():
    s = open(os.path.join(HERE, 'js', 'npcfull.js'), encoding='utf-8').read()
    seg = re.search(r'rf1:\s*(\[.*?\])\s*,\s*rf2:', s, re.S).group(1)
    seg = re.sub(r',\s*\]', ']', seg)
    return json.loads(seg)


def main():
    src = open(SRC, encoding='utf-8').read()
    rows = [l for l in src.split('\n') if l.startswith('|') and '||' in l]

    npcs = load_npcfull()
    jp2n = {o['j']: o['n'] for o in npcs}
    cn2n = {o['n']: o['n'] for o in npcs}

    # ---- 收集 ----
    days = []        # 顺序
    people = {}      # 显示名 -> {'jp':, 'alt':, 'rows': {day: [19 spots]}}
    order = []
    spot_index = {}
    spots = []       # [base, floor, cat]

    def spot_id(txt):
        base, floor = split_spot(txt)
        key = base + '\u0001' + floor
        if key not in spot_index:
            spot_index[key] = len(spots)
            spots.append([base, floor, CAT.get(base, 'out')])
        return spot_index[key]

    for l in rows:
        c = l[1:].split('||')
        raw_name = unwiki(c[0])
        jp = ''
        m = re.match(r'\[\[([^\]|]+)\|', c[0].strip())
        if m and not re.search(r'[\u4e00-\u9fff]', m.group(1)):
            jp = m.group(1)
        disp = NAME_ALIAS.get(raw_name) or jp2n.get(jp) or cn2n.get(raw_name) or raw_name
        day = unwiki(c[1])
        cells = c[2:]
        assert len(cells) == 19, (raw_name, len(cells))
        if disp not in people:
            people[disp] = {'jp': jp or '', 'alt': raw_name if raw_name != disp else '', 'rows': {}}
            order.append(disp)
        people[disp]['rows'][day] = [spot_id(x) for x in cells]
        if day not in days:
            days.append(day)

    # ---- 星期排序：一~五、祝、平日雨雪、祝日雨雪 ----
    want = ['一', '二', '三', '四', '五', '祝', '平日（雨、雪）', '祝日（雨、雪）']
    assert set(days) == set(want), sorted(days)
    days = want

    # ---- 人员排序：主角 → 结婚候补 → 其他 ----
    rank = {o['n']: i for i, o in enumerate(npcs)}
    order.sort(key=lambda n: rank.get(n, 999))

    if len(spots) > 62:
        raise SystemExit('spots 超出 base62 单字符容量：%d' % len(spots))

    # ---- 输出 ----
    out = []
    out.append('/* 符文工厂1 村民每日行程表 —— 数据来自 biligame「RF1charactersschedule」（CC BY-SA） ')
    out.append('   由 _build_sched.py 生成，勿手改。')
    out.append('   times 19 个整点；spot = [建筑, 楼层, 分类]；person = [中文名, 日文名, 源页旧译, 每日编码]')
    out.append('   每日编码 = 8 天 × 19 格，base62 下标指向 spots */')
    out.append('var SCHED = {')
    out.append(' "rf1": {')
    out.append('  "name": "符文工厂1",')
    out.append('  "times": ' + json.dumps(['%d:00' % h for h in range(6, 24)] + ['0:00'], ensure_ascii=False) + ',')
    out.append('  "days": ' + json.dumps(days, ensure_ascii=False) + ',')
    out.append('  "spots": [')
    for i, s in enumerate(spots):
        out.append('   ' + json.dumps(s, ensure_ascii=False) + (',' if i < len(spots) - 1 else ''))
    out.append('  ],')
    out.append('  "people": [')
    lines = []
    for n in order:
        p = people[n]
        code = ''.join(B62[p['rows'][d][t]] for d in days for t in range(19))
        lines.append('   ' + json.dumps([n, p['jp'], p['alt'], code], ensure_ascii=False))
    out.append(',\n'.join(lines))
    out.append('  ]')
    out.append(' }')
    out.append('};')
    txt = '\n'.join(out) + '\n'
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(txt)

    print('写出', OUT, len(txt), 'bytes')
    print('人物', len(order), '地点', len(spots), '天', len(days))
    for i, s in enumerate(spots):
        print('  ', B62[i], s)


if __name__ == '__main__':
    main()
