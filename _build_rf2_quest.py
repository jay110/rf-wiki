# -*- coding: utf-8 -*-
"""从《RF2 攻略合辑》（TGBUS 巴士速攻）抽出两套任务数据，生成 js/rf2quest.js。

源文件是 UTF-16LE 文本（2160 行）。里面其实是两份不同的攻略拼在一起：

同一份文件其实是好几份攻略拼起来的，任务数据有两套、作者不同：

  甲·终有依天《【RF2】【一周目】任务大全》（百度贴吧）
     条目形如：【任务名】触发条件：…。流程：…→…。奖励：…
     118 条，结构规整、带触发条件与奖励，是本页的主表。只写一周目。

  乙·安打《符文工房2 任务、居民、怪物攻略》（TGBUS 巴士速攻）
     任务段形如：任务：… / 委托人：… / 内容：…
     122 条，覆盖 23 位委托人，奖励混在内容里；含二代的凌／奥斐斯／姆&苏。

脚本只做切分与字段拆分，**不改一个字**：不补标点、不统一译名、不把
「友好度」改成「好感度」、不动内容里的口语与错字。译名到站内规范名的
映射单独放在 NAMES 里，只用于生成链接，不改表里显示的字。
用法：python3 _build_rf2_quest.py
"""
import io
import json
import os
import re

SRC = r'G:/10257/Downloads/符文攻略/RF2 攻略合辑.txt'
HERE = os.path.dirname(os.path.abspath(__file__))
NPCJS = os.path.join(HERE, 'js', 'npcfull.js')
OUT = os.path.join(HERE, 'js', 'rf2quest.js')

raw = open(SRC, 'rb').read()
text = raw.decode('utf-16')
if text.startswith('\ufeff'):
    text = text[1:]
lines = text.splitlines()

# ---------------------------------------------------------------- 站内 NPC 名
npc_src = open(NPCJS, encoding='utf-8').read()
i = npc_src.index('rf2:')
j = npc_src.index('"rf3"', i) if '"rf3"' in npc_src[i:] else i + 20000
NPC = {}
for m in re.finditer(r'\{"n":"([^"]+)","j":"([^"]*)"([^\n]*?)\}', npc_src[i:i + 22000]):
    n, jp, rest = m.group(1), m.group(2), m.group(3)
    al = re.search(r'"al":"([^"]*)"', rest)
    prop = re.search(r'"pr":"([^"]*)"', rest)
    NPC[n] = {'n': n, 'j': jp, 'al': al.group(1) if al else '',
              'prop': prop.group(1) if prop else ''}

# 甲的译名有几种写法不在站内 n / al 里，这里显式补上（只影响链接，不改显示字）
FALLBACK = {
    '阿莉希雅': '阿莉希亚',   # 安打版（莉）
    '阿利希雅': '阿莉希亚',   # 终有依天版（利）   # 站内 al 只有「阿莉西娅」，甲写「阿利希雅」
    '多罗茜': '多萝茜',       # 站内 al 只有「多萝茜」（泡芙版写法），甲写「多罗茜」
    '琳': '凌',
    '奥尔法斯': '奥斐斯',
    '穆&苏': '姆&苏',
}


def canon(name):
    """把攻略本里的中文名对到站内规范名；对不上就原样返回。"""
    name = name.strip()
    m = re.search(r'[（(]([^）)]*)[）)]\s*$', name)        # 乙委托人写作「玛娜（マナ）」
    if m:
        jp = m.group(1).strip()
        for n, d in NPC.items():
            if d['j'] == jp:
                return n
    name = re.sub(r'\s*[（(][^）)]*[）)]\s*$', '', name)
    if name in NPC:
        return name
    for n, d in NPC.items():
        if d['al'] and name in [x.strip() for x in d['al'].split('、')]:
            return n
    if name in FALLBACK:
        return FALLBACK[name]
    return name


# ---------------------------------------------------------------- 甲：安打
start = next(k for k, l in enumerate(lines) if l.startswith('【') and '触发条件' in l)
end = next(k for k, l in enumerate(lines) if '任务、居民、怪物攻略' in l)
seg = lines[start:end]

quotes = []      # 原样保留的特殊行（求婚道具流程）
A = []
cur = '玛娜'      # 第一个角色标题之前就是玛娜的条目，原文没有给她单独一行标题

for raw_line in seg:
    s = raw_line.strip()
    if not s:
        continue
    m = re.fullmatch(r'【([^】]{1,8})】', s)
    if m:
        cur = m.group(1)
        continue
    if s.startswith('【') and '触发条件' in s:
        m2 = re.match(r'^【([^】]+)】\s*触发条件[:：](.*)$', s)
        if not m2:
            quotes.append(s)
            continue
        name, rest = m2.group(1), m2.group(2)
        # 「触发条件」总是以。收尾；个别条目把「流程」写成「流程，」
        mc = re.match(r'^(.*?)。\s*流程[:：，,](.*)$', rest)
        if mc:
            cond, rest2 = mc.group(1), mc.group(2)
        else:
            k = rest.find('。')
            cond, rest2 = (rest[:k], rest[k + 1:]) if k >= 0 else (rest, '')
        mr = re.match(r'^(.*?)奖励\s*[，,]?\s*[:：](.*)$', rest2)
        if mr:
            flow, rew = mr.group(1), mr.group(2)
        else:
            flow, rew = rest2, ''
        A.append({'w': cur, 't': name, 'c': cond.strip(),
                  'f': flow.rstrip('。').strip(), 'r': rew.strip(), 'next': s})
        continue
    # 既不是标题也不是条目：只可能是上一条「奖励：」后面换行续写的奖励
    # （塞西莉亚「请给寻找一下」就是这样断行的）。行首是【就不能算续行。
    if A and s.startswith('【') is False:
        A[-1]['r'] = (A[-1]['r'] + s).strip()
    else:
        quotes.append(s)

# ---------------------------------------------------------------- 乙：泡芙
b0 = next(k for k, l in enumerate(lines)
          if k > end and l.strip() == '任务攻略：')
b1 = next(k for k, l in enumerate(lines)
          if k > b0 and l.strip() == '居民攻略：')
bseg = lines[b0:b1]

B = []
contrib = []
cur_b = ''
prev = ''
for raw_line in bseg:
    s = raw_line.strip()
    if not s:
        continue
    if s.startswith('感谢会员'):
        contrib.append(s)
        continue
    if s in ('任务开启条件：', '任务攻略：'):
        continue
    if re.match(r'^[0-9]：', s):
        continue
    mt = re.match(r'^任务\s*\d*\s*[:：]\s*(.*)$', s)
    if mt:
        B.append({'w': '', 't': mt.group(1).strip(), 'x': ''})
        prev = 't'
        continue
    mc = re.match(r'^委托人\s*[:：]\s*(.*)$', s)
    if mc:
        if B:
            B[-1]['w'] = mc.group(1).strip()
        prev = 'w'
        continue
    mb = re.match(r'^内容\s*[:：]\s*(.*)$', s)
    if mb:
        if B:
            B[-1]['x'] = mb.group(1).strip()
        prev = 'x'
        continue
    # 乙的角色标题一律带日文括注：「玛娜（マナ）：」「罗萨琳德（ロザリンド）」
    if re.fullmatch(r'[^\s（(]{1,14}（[^）]*）\s*[:：]?', s):
        cur_b = s
        prev = 'h'
        continue
    if s.startswith('她的任务很多'):
        B.append({'w': '塔妮亚', 't': '', 'x': s, 'note': 1})
        prev = 'h'
        continue
    if B and prev == 'x':
        B[-1]['x'] += s      # 内容换行续行
        continue

B = [b for b in B if b['t'] or b.get('note')]

# ---------------------------------------------------------------- 合并：乙补甲缺的
A_clients = set(canon(q['w']) for q in A)
B_clients = set(canon(b['w']) for b in B if b['w'])

CAND = ['玛娜', '罗萨琳德', '塞西莉亚', '阿莉希雅', '朱丽雅', '多罗茜', '由绘']
CAND = [canon(x) for x in CAND]   # 换成站内规范名

# 甲里提到「结婚」的委托人（用来判断某个候选人的求婚那一步甲有没有写）
A_married = set(canon(q['w']) for q in A if '结婚' in q['r'] or '结婚' in q['f'])
A_married.add(canon('多罗茜'))      # 多萝茜的求婚道具由高顿的【有要给的东西】发出，甲写在高顿名下

extra = []
for b in B:
    if b.get('note'):
        continue
    cn = canon(b['w']) if b['w'] else ''
    if cn not in A_clients:
        extra.append({'w': b['w'], 'n': cn, 't': b['t'], 'x': b['x'], 'why': '主表没有这位委托人'})
    elif cn in CAND and cn not in A_married and ('结婚' in b['x'] or '结婚' in b['t']):
        extra.append({'w': b['w'], 'n': cn, 't': b['t'], 'x': b['x'], 'why': '主表这位候选人的链条里没写求婚那一步'})

tanya_note = next((b['x'] for b in B if b.get('note')), '')

# ---------------------------------------------------------------- 机制原文（乙）
# 机制原文：安打那段在「任务攻略：」与「任务开启条件：」之间的三段说明
m0 = next(k for k, l in enumerate(lines) if '任务、居民、怪物攻略' in l)
m1 = next(k for k, l in enumerate(lines) if k > m0 and l.strip() == '任务攻略：')
m2 = next(k for k, l in enumerate(lines) if k > m1 and l.strip() == '任务开启条件：')
mech = [lines[k].strip() for k in range(m1 + 1, m2) if len(lines[k].strip()) > 20]

cond = [l.strip() for l in lines if re.match(r'^[1-4]：', l.strip())][:4]

# ---------------------------------------------------------------- 求婚道具对照
MARRIAGE = [
    ('玛娜', '婚约戒指', '拿婚约戒指就可以和她结婚了', '补表·おても大事な話です'),
    ('罗萨琳德', '100朵玫瑰的花束',
     '求婚道具获取流程：晚上5点后与麦克斯对话→交给麦克斯9个番茄（西红柿），获得100朵玫瑰的花束。',
     '主表·求婚道具获取流程'),
    ('塞西莉亚', '圆石',
     '将圆石交给塞西莉亚（友好度，爱情度10）。奖励：同塞西莉亚结婚', '主表·是非常重大的请求'),
    ('阿利希雅', '水晶球',
     '水晶球（友好度，爱情度10再次给予阿利希雅即可结婚）', '主表·是找到水晶球啊'),
    ('朱丽雅', '回忆戒指',
     '无私光矿石（交给由绘再加上10000G，3天后得到回忆戒指，朱丽雅友好度，爱情度10之后交给朱丽雅即可结婚）',
     '主表·按照我给你看的去救吧'),
    ('多罗茜', '祝福挂饰',
     '祝福挂饰（多罗茜友好度，爱情度10够交给多罗茜即可结婚）',
     '主表·有要给的东西（委托人写的是高顿）'),
    ('由绘', '由绘特制交换卷',
     '由绘特制交换卷（友好度，爱情度10之后，将由绘特制交换卷交给由绘，选择想要由绘，即可与之结婚）',
     '主表·有想说的话'),
]

# ---------------------------------------------------------------- 复核报告
def maxlove(qs):
    lv = []
    for q in qs:
        m = re.search(r'爱情度(\d+)', q['c'])
        if m:
            lv.append(int(m.group(1)))
    return max(lv) if lv else 0

print('=== 甲 ===')
print('条目', len(A), '委托人', len(A_clients))
for c in sorted(A_clients, key=lambda x: -sum(1 for q in A if canon(q['w']) == x)):
    qs = [q for q in A if canon(q['w']) == c]
    print('  %-8s %2d 条  最高爱情度 %s' % (c, len(qs), maxlove(qs) or '—'))
print('原样保留行', len(quotes), [q[:40] for q in quotes])
print('空白奖励', [(q['w'], q['t']) for q in A if not q['r']])
print()
print('=== 乙 ===')
print('条目', len(B), '委托人', len(B_clients))
print('贡献者行', contrib)
print('塔妮亚说明', tanya_note)
print()
print('=== 乙补甲 ===')
for e in extra:
    print('  %s | %s | %s | %s' % (e['w'], e['t'], e['x'][:40], e['why']))
print()
print('=== 求婚道具：攻略本 vs 站内村民表 ===')
for n, item, said, where in MARRIAGE:
    p = NPC.get(canon(n), {}).get('prop', '')
    print('  %-6s 攻略本 %-12s 站内 %-14s %s' % (canon(n), item, p or '（空）',
                                              '一致' if p == item else '不同'))
print()
print('=== 机制原文 ===')
for m in mech:
    print(' ', m[:100])
print('=== 开启条件 ===', cond)

# ---------------------------------------------------------------- 写 JS
def js(x):
    return json.dumps(x, ensure_ascii=False, separators=(',', ':'))


people = []
for c in sorted(A_clients, key=lambda x: -sum(1 for q in A if canon(q['w']) == x)):
    d = NPC.get(c, {})
    people.append({'n': c, 'j': d.get('j', ''), 'w': sorted(set(q['w'] for q in A if canon(q['w']) == c))})

data = {
    'src': '《【RF2】【一周目】任务大全》（百度贴吧·终有依天）',
    'src2': '《符文工房2》任务、居民、怪物攻略（TGBUS 巴士速攻·安打）',
    'cond': cond,
    'mech': mech,
    'people': people,
    'quests': [{'w': q['w'], 'n': canon(q['w']), 't': q['t'], 'c': q['c'], 'f': q['f'], 'r': q['r']} for q in A],
    'extra': extra,
    'quotes': quotes,
    'contrib': contrib,
    'tanya': tanya_note,
    'marriage': [{'n': canon(n), 'w': n, 'item': item, 'said': said, 'where': where,
                  'prop': NPC.get(canon(n), {}).get('prop', '')} for n, item, said, where in MARRIAGE],
    'cand': CAND,
}

head = '''/* 符文工房 2 的委托任务 —— 来源：《RF2 攻略合辑》（TGBUS 巴士速攻，UTF-16LE 原文）
   同一份文件里有两套任务资料，本文件两套都用：
     甲 终有依天《【一周目】任务大全》：%d 条，带触发条件与奖励，是主表（只写一周目）
     乙 安打《任务、居民、怪物攻略》：%d 条，只写「内容」（奖励混在内容里），含二代
   乙与甲大面积重叠，只在甲没覆盖的地方补了 %d 条（见 extra 的 why 字段）。
   由 _build_rf2_quest.py 切分生成，勿手改。
   脚本只拆字段：不补标点、不统一译名、不改口语，原文里的「友好度」「爱情度」
   「报酬」「奖励」两种叫法都照录。 */
''' % (len(A), len(B), len(extra))

body = 'var RF2_QUEST = {\n'
for k in ['src', 'src2', 'cond', 'mech', 'people', 'quests', 'extra', 'quotes', 'contrib', 'tanya', 'marriage', 'cand']:
    body += '    %s: %s,\n' % (k, js(data[k]))
body += '};\n'

open(OUT, 'w', encoding='utf-8', newline='\n').write(head + body)
print()
print('写出', OUT, os.path.getsize(OUT), 'bytes')
