# -*- coding: utf-8 -*-
"""龙之天地（azuma）角色详情：post/1837-1852 十六篇

每篇结构一致（两类版式只在有无「英语配音」上不同）：
  1) 首张 table = 名片（立绘 / 名字：中（日、英）/ 日语配音、英语配音 / 生日 / 喜好物品 / 共度时光）
  2) h2「简介」→ 若干段落（源文为繁体）
  3) h2「好感攻略」→ h3「喜好物品」「共度时光」「互动」
  4) h2「技能表」→ 末张 table（技能 / 等级 / 描述）

输出 NPC_AZUMA：{src, chars:[{n, jp, en, cvJp, cvEn, bd, intro:[], like:{}, topic:{},
                                gift:{ret,birthday,bath,bento,cook}, skills:[[名, 等级, 描述]]}]}
字段一律照录，缺失留空串，不做推断。
"""
import re, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
POSTS = range(1837, 1853)


def load(n):
    p = os.path.join(HERE, '_azuma_p%d.html' % n)
    h = open(p, encoding='utf-8').read()
    a = h.find('栏目：')
    b = h.find('相关链接')
    return h[a:b]


def plain(x):
    x = re.sub(r'<script.*?</script>', '', x, flags=re.S)
    x = re.sub(r'<br[^>]*>', '\n', x)
    x = re.sub(r'</(p|div|li|tr|h[1-4])>', '\n', x)
    x = re.sub(r'</t[hd]>', '\t', x)
    x = re.sub(r'<[^>]+>', '', x)
    for a, b in [('&nbsp;', ' '), ('&quot;', '"'), ('&amp;', '&'), ('&gt;', '>'),
                 ('&lt;', '<'), ('&emsp;', ' '), ('\u3000', ' ')]:
        x = x.replace(a, b)
    return x


def lines(x):
    out = []
    for l in plain(x).split('\n'):
        l = re.sub(r'[ \t]+', ' ', l).strip()
        if l:
            out.append(l)
    return out


def split_list(s):
    s = (s or '').strip().strip('、，,')
    if not s or s in ('—', '-', '无'):
        return []
    parts = re.split(r'[、，,]', s)
    return [p.strip() for p in parts if p.strip()]


LABELS = [
    ('like.best', '最喜欢：'), ('like.good', '喜欢：'),
    ('like.bad', '讨厌：'), ('like.worst', '最讨厌：'),
    ('topic.best', '最喜欢的话题：'), ('topic.good', '喜欢的话题：'),
    ('topic.bad', '讨厌的话题：'), ('topic.worst', '最讨厌的话题：'),
    ('gift.ret', '回礼：'), ('gift.birthday', '给你的生日礼物：'),
    ('gift.bath', '泡澡后的乐子：'), ('gift.bento', '便当：'),
    ('gift.cook', '一起烹饪：'),
]


def parse(n):
    seg = load(n)

    # ---- 名片 ----
    t0 = re.search(r'<table[^>]*>(.*?)</table>', seg, flags=re.S)
    card = lines(t0.group(1))
    joined = '\n'.join(card)
    m = re.search(r'名字：(.+)', joined)
    name_line = m.group(1).strip() if m else ''
    mm = re.match(r'([^（(]+)[（(]([^）)]+)[）)]', name_line)
    cn = mm.group(1).strip() if mm else name_line
    alt = mm.group(2) if mm else ''
    parts = [p.strip() for p in re.split(r'[、，,]', alt) if p.strip()]
    jp = parts[0] if parts else ''
    en = parts[1] if len(parts) > 1 else ''

    def after(kw):
        for i, l in enumerate(card):
            if l.startswith(kw):
                return l[len(kw):].strip()
        return ''

    cv_jp = after('日语配音：')
    cv_en = after('英语配音：')
    bd = after('生日：')

    # ---- 简介 ----
    i1 = seg.find('>简介<')
    i2 = seg.find('>好感攻略<')
    intro = []
    if i1 >= 0:
        body = seg[seg.find('</h2>', i1) + 5: i2 if i2 > 0 else len(seg)]
        # 源文段落里夹着空的 <span> 残片，去掉标签后可能剩下半截属性串，一并丢掉
        intro = [l for l in lines(body) if l and '<' not in l and 'style=' not in l]

    # ---- 好感攻略 ----
    like, topic, gift = {}, {}, {}
    if i2 >= 0:
        i3 = seg.find('>技能表<')
        sec = seg[seg.find('</h2>', i2) + 5: i3 if i3 > 0 else len(seg)]
        for l in lines(sec):
            for path, lab in LABELS:
                if l.startswith(lab):
                    v = l[len(lab):]
                    tgt = {'like': like, 'topic': topic, 'gift': gift}[path.split('.')[0]]
                    tgt[path.split('.')[1]] = split_list(v)
                    break

    # ---- 技能表 ----
    tables = re.findall(r'<table.*?</table>', seg, flags=re.S)
    skills = []
    if len(tables) > 1:
        rows = re.findall(r'<tr.*?</tr>', tables[-1], flags=re.S)
        for tr in rows:
            cells = re.findall(r'<t[hd][^>]*>.*?</t[hd]>', tr, flags=re.S)
            cells = [' '.join(plain(c).split()) for c in cells]
            if len(cells) < 2:
                continue
            if cells[0].strip() in ('技能', ''):
                continue
            name = cells[0].strip()
            lv = cells[1].strip()
            desc = cells[2].strip() if len(cells) > 2 else ''
            skills.append([name, lv, desc])

    return {
        'n': cn, 'jp': jp, 'en': en,
        'cvJp': cv_jp, 'cvEn': cv_en, 'bd': bd,
        'intro': intro,
        'like': like, 'topic': topic, 'gift': gift,
        'skills': skills,
        'pg': n,
    }


chars = [parse(n) for n in POSTS]

out = {
    'src': 'gametoeasy《符文工房：龙之天地》角色页 post/1837–1852',
    'chars': chars,
}
p = os.path.join(HERE, 'js', 'npc_azuma.js')
with open(p, 'w', encoding='utf-8', newline='\n') as f:
    f.write('/* 符文工房 龙之天地（azuma）角色详情 16 位\n')
    f.write(' * 源：gametoeasy.com 角色页 post/1837–1852（CC 转载）\n')
    f.write(' * 由 _build_npc_azuma.py 解析生成，勿手改。\n')
    f.write(' * 字段：n 名 / jp en 原名 / cvJp cvEn 配音 / bd 生日 / intro 简介段落(源文繁体)\n')
    f.write(' *       like{topic}{gift} 好感攻略六节 / skills[名,等级,描述] 技能表 / pg 源文编号\n')
    f.write(' */\n')
    f.write('var NPC_AZUMA = %s;\n' % json.dumps(out, ensure_ascii=False, separators=(',', ':')))

print('角色', len(chars))
for c in chars:
    print('%-6s %-14s %-10s 生日%-7s 简介%d段 技能%2d 喜欢%d 讨厌%d 话题%d 回礼%d 便当%d 烹饪%d' % (
        c['n'], c['jp'] + '、' + c['en'], (c['cvJp'] or '—'),
        c['bd'] or '—', len(c['intro']), len(c['skills']),
        len(c['like'].get('best', [])) + len(c['like'].get('good', [])),
        len(c['like'].get('bad', [])) + len(c['like'].get('worst', [])),
        len(c['topic'].get('best', [])) + len(c['topic'].get('good', [])),
        len(c['gift'].get('ret', [])), len(c['gift'].get('bento', [])),
        len(c['gift'].get('cook', []))))
