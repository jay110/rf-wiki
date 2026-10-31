# -*- coding: utf-8 -*-
"""作物数据补齐：RF2（农作物全表）、RF3（土地／农药／宠物种地／宠物工作）
源：https://wiki.biligame.com/runefactory/
    RF2farmdata  13 列 60 行（注意：源页表头写「符文工厂1农作物数据」，是本作的，说明见页面）
    RF3farm      土地状况 6／农药 4／宠物好感度与种地 11／宠物工作列表 90
输出：js/crop_more.js
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
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('&nbsp;', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'、+', '、', s).strip('、')
    return s


def tables(text):
    out = []
    cap, head, rows = '', [], []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('{|'):
            cap, head, rows = '', [], []
        elif s.startswith('|+'):
            cap = plain(s[2:])
        elif s.startswith('!'):
            head = [plain(x) for x in re.split(r'\|\||!!', s[1:])]
            head = [h for h in head if h != '']
        elif s.startswith('|}'):
            out.append((cap, head, rows)); cap, head, rows = '', [], []
        elif s.startswith('|-'):
            pass
        elif s.startswith('|'):
            rows.append([plain(x) for x in s[1:].split('||')])
    return out


def num(v):
    """'1,234' → 1234；'316（买不到）' → 316；'-' / '' → None"""
    v = (v or '').strip()
    m = re.match(r'^-?[\d,]+', v)
    if not m:
        return None
    return int(m.group(0).replace(',', ''))


# ---------------- RF2 农作物 ----------------
rf2 = []
for cap, head, rows in tables(read('RF2farmdata')):
    if '日数' not in ' '.join(head):
        continue
    for c in rows:
        if len(c) < 13 or not c[0]:
            continue
        raw_buy = c[4]
        rf2.append({
            'n': c[0], 'se': c[1], 'd': num(c[2]), 'rep': c[3],
            'sb': num(c[4]), 'ss': num(c[5]), 'p1': num(c[6]), 'p5': num(c[7]),
            'p10': num(c[8]), 'bp': num(c[9]), 'eff': c[10], 'min': num(c[11]),
            'kind': c[12], 'sbRaw': raw_buy,
        })
    break

# ---------------- RF3 土地 / 农药 / 宠物 ----------------
soil = []
pest = []
plove = []
pwork = []
for cap, head, rows in tables(read('RF3farm')):
    h = ' '.join(head)
    if '营养值' in h and '成长速度' in h:
        for c in rows:
            if len(c) >= 5 and c[0]:
                soil.append([c[2], c[3], c[4], c[0], c[1]])
    elif '农药' in h:
        for c in rows:
            if len(c) >= 3 and c[0]:
                pest.append([c[0], c[1], c[2]])
    elif '好感度' in h and '春' in h:
        for c in rows:
            if len(c) >= 5 and c[0]:
                plove.append([c[0], c[1], c[2], c[3], c[4]])
    elif '名字' in h and '生产物' in h:
        for c in rows:
            if len(c) < 9 or not c[0]:
                continue
            pwork.append([c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8]])

data = {
    'src2': 'RF2farmdata',
    'src3': 'RF3farm',
    'rf2': rf2,
    'soil3': soil,
    'pest3': pest,
    'plove3': plove,
    'pwork3': pwork,
}

js = u'/* 作物与农活数据补齐（RF2／RF3）—— 由 _build_crop_more.py 生成，勿手改\n' \
     u' * 源：biligame 符文工厂 wiki「RF2farmdata」「RF3farm」（CC BY-SA）\n' \
     u' * CROP_RF2    {n,se,d,rep,sb,ss,p1,p5,p10,bp,eff,min,kind,sbRaw}\n' \
     u' * SOIL_RF3    [中文, 营养值, 成长速度, 日文, 英文]\n' \
     u' * PEST_RF3    [农药, 营养值, 健康值]\n' \
     u' * PLOVE_RF3   [好感度, 春, 夏, 秋, 冬]\n' \
     u' * PWORK_RF3   [名字, 地点, 生产物, 捕捉率, 浇水, 劈柴, 砸石, 收获, 骑乘]\n' \
     u' */\n'
for k, v in [('CROP_RF2', rf2), ('SOIL_RF3', soil), ('PEST_RF3', pest),
             ('PLOVE_RF3', plove), ('PWORK_RF3', pwork)]:
    js += 'const %s = %s;\n' % (k, json.dumps(v, ensure_ascii=False))

with io.open('js/crop_more.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(js)

from collections import Counter
print('RF2', len(rf2), '季', dict(Counter(x['se'] for x in rf2)), '种', dict(Counter(x['kind'] for x in rf2)))
print('  连收>0', len([x for x in rf2 if x['rep'] not in ('-', '')]))
print('  买价带字', [x['sbRaw'] for x in rf2 if '（' in (x['sbRaw'] or '')])
print('  最高Lv1', sorted(rf2, key=lambda x: -(x['p1'] or 0))[:3])
print('  最短生长', sorted([x for x in rf2 if x['d']], key=lambda x: x['d'])[:4])
print('  无季节', [x['n'] for x in rf2 if not x['se']])
print('RF3 土地', len(soil), soil[:2])
print('RF3 农药', len(pest), pest)
print('RF3 宠物好感', len(plove), plove)
print('RF3 宠物工作', len(pwork))
print('  工作列样例', pwork[0], pwork[-1])
