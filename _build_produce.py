# -*- coding: utf-8 -*-
"""宠物产出／工作表 —— RF1 与 边境
源：https://wiki.biligame.com/runefactory/
    RF1petfarm（RF1 魔物工作表；RF1petproduce 重定向到它）
    RFFpet（边境宠物系统解说，含「生产部分」「种地部分」「宠物生蛋」三段）
输出：js/produce.js
"""
import io, json, re, os

SNAP = '_snap'
LINK = re.compile(r'\[\[([^\[\]|]+)(?:\|([^\[\]|]+))?\]\]')


def read(name):
    with io.open(os.path.join(SNAP, name + '.txt'), encoding='utf-8') as f:
        return f.read()


def plain(s):
    s = LINK.sub(lambda m: (m.group(2) or m.group(1)).strip(), s)
    s = s.replace('<br>', '、').replace('<br/>', '、').replace('<br />', '、')
    s = s.replace('<font color=#FF6EC7>', '').replace('</font>', '')
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'、+', '、', s).strip('、')
    return s


def tables(text):
    """极简 wikitext 表解析：返回 [(caption, head, [cells])]"""
    out = []
    cap, head, rows = '', [], []
    inrow = False
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('{|'):
            cap, head, rows, inrow = '', [], [], False
        elif s.startswith('|+'):
            cap = plain(s[2:])
        elif s.startswith('!'):
            head = [plain(x) for x in re.split(r'\|\||!!', s[1:])]
            head = [h for h in head if h != '']
        elif s.startswith('|}'):
            out.append((cap, head, rows))
            cap, head, rows = '', [], []
        elif s.startswith('|-'):
            inrow = True
        elif s.startswith('|'):
            cells = [plain(x) for x in re.split(r'\|\||\|\|', s[1:])]
            # 单竖线分隔的行（|a||b 已处理；| a || b 同）——再兜一层
            if len(cells) == 1 and '||' not in s:
                cells = [plain(x) for x in s[1:].split('||')]
            rows.append(cells)
    return out


# ---------------- RF1 魔物工作表 ----------------
rf1 = []
for cap, head, rows in tables(read('RF1petfarm')):
    if '工作' not in ' '.join(head):
        continue
    for c in rows:
        if len(c) < 3 or not c[0]:
            continue
        place = re.sub(r'(\d+)洞', r'第 \1 洞窟', c[2])
        rf1.append([c[0], c[1], place])

# ---------------- 边境：宠物生产 ----------------
prod = []
for cap, head, rows in tables(read('RFFpet')):
    if '产物' in ' '.join(head) and '概率' in ' '.join(head):
        for c in rows:
            if len(c) < 3 or not c[0]:
                continue
            prob = c[1].replace('％', '%').strip()
            prod.append([c[0], prob, c[2]])
        break

# ---------------- 边境：好感度与工作范围 ----------------
job = []
for cap, head, rows in tables(read('RFFpet')):
    if '工作' in ' '.join(head) and '范围' in ' '.join(head):
        for c in rows:
            if len(c) < 4 or not c[0]:
                continue
            job.append([c[0], c[1], c[2].replace('格子', ' 格') if c[2] not in ('-', '') else '—',
                        c[3].replace('：', ':').strip()])
        break

# ---------------- 边境：宠物生蛋 ----------------
egg = []
for cap, head, rows in tables(read('RFFpet')):
    if '符文石' in ' '.join(head):
        for c in rows:
            if len(c) < 2 or not c[0]:
                continue
            egg.append([c[0], c[1]])
        break

data = {
    'source': 'https://wiki.biligame.com/runefactory/  RF1petfarm（RF1 魔物工作表）、RFFpet（边境宠物系统解说）',
    'rf1': rf1,
    'rffProd': prod,
    'rffJob': job,
    'rffEgg': egg,
}

js = u'/* 宠物产出／工作表 —— 由 _build_produce.py 生成，勿手改\n' \
     u' * 源：biligame 符文工厂 wiki「RF1petfarm」「RFFpet」（CC BY-SA）\n' \
     u' * PETWORK_RF1  [魔物, 工作, 出现地点]\n' \
     u' * PETPROD_RFF [产物, 概率, 魔物]\n' \
     u' * PETJOB_RFF  [工作, 好感度, 范围, 工作时间]\n' \
     u' * PETEGG_RFF  [符文石, 能力提升]\n' \
     u' */\n'
js += 'const PETWORK_RF1 = ' + json.dumps(rf1, ensure_ascii=False, indent=0).replace('\n', '') + ';\n'
js += 'const PETPROD_RFF = ' + json.dumps(prod, ensure_ascii=False, indent=0).replace('\n', '') + ';\n'
js += 'const PETJOB_RFF = ' + json.dumps(job, ensure_ascii=False, indent=0).replace('\n', '') + ';\n'
js += 'const PETEGG_RFF = ' + json.dumps(egg, ensure_ascii=False, indent=0).replace('\n', '') + ';\n'

with io.open('js/produce.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(js)

print('RF1 工作表', len(rf1), '行')
from collections import Counter
print('  工作分布', dict(Counter(r[1] for r in rf1)))
print('  产物型', [r[0] for r in rf1 if r[1] in ('牛奶', '软软毛', '蜂蜜', '鸡蛋')])
print('边境生产', len(prod), '行；概率合计校验：')
g = Counter()
for r in prod:
    g[r[2]] += int(r[1].rstrip('%')) if r[1].endswith('%') else 0
print('  ', dict(g))
print('边境工作表', len(job), '行'); [print('  ', r) for r in job]
print('生蛋', len(egg), '行', egg)
