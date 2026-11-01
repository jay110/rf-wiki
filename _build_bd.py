# -*- coding: utf-8 -*-
"""生成 js/bd_ext.js —— 外部生日对照数据（仅收录「能在站内找到同一角色」的记录）。

两个源：
  docx = G:/10257/Downloads/RFF 新手篇+人物喜好+星座.docx   （边境 26 人，日文名 + 日文生日）
  mem  = G:/10257/Downloads/符文攻略/3-角色攻略v1.1-…Memoirs…txt（RF1/2/3/边境 47 人，民间翻译中文名）

对齐规则：先用站内 n / 别名 al 精确匹配，匹配不上走人工核对过的 ALIAS 表；
两者都失败直接报错，不猜、不静默丢弃。
"""
import json, re, zipfile, io, sys, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SK = r'G:/10257/Downloads'
TX = r'<w:t(?:\s[^>]*)?>(.*?)</w:t>'

def docx_rows(p):
    z = zipfile.ZipFile(p)
    x = z.read('word/document.xml').decode('utf-8')
    rows = []
    for tr in re.findall(r'<w:tr[ >].*?</w:tr>', x, re.S):
        cells = []
        for tc in re.findall(r'<w:tc[ >].*?</w:tc>', tr, re.S):
            t = ''.join(re.findall(TX, tc, re.S))
            cells.append(t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').strip())
        rows.append(cells)
    return rows

# ---------- 提取 ----------
docx = []
JP_BD = re.compile(r'^([春夏秋冬])の(\d{1,2})日$')
for r in docx_rows(SK + '/RFF 新手篇+人物喜好+星座.docx'):
    if len(r) < 3:
        continue
    m = JP_BD.match(r[2].replace(' ', ''))
    if m and r[0] and r[0] != '名字':
        docx.append({'j': r[0].replace(' ', ''), 'bd': m.group(1) + m.group(2)})

txt = open(SK + '/符文攻略/3-角色攻略v1.1-Rune Factory Official Memoirs-Official Scan Topic.txt', 'rb')\
    .read().decode('gb18030', errors='ignore')
lines = [l.strip() for l in txt.splitlines()]
BD_CN = re.compile(r'^诞生日：\s*([春夏秋冬])之月的?(\d{1,2})日')
mem, game = [], None
for i, l in enumerate(lines):
    if l.startswith('符文工房'):
        if '新牧场物语' in l:
            game = 'rf1'
        elif re.search(r'符文工房\s*2', l):
            game = 'rf2'
        elif re.search(r'符文工房\s*3', l):
            game = 'rf3'
        elif '边境' in l:
            game = 'rff'
        elif '海洋' in l:
            game = 'rfo'
        continue
    m = BD_CN.match(l)
    if not m:
        continue
    name = ''
    for k in range(i - 1, max(-1, i - 4), -1):
        t = lines[k]
        if t and not t.startswith('结婚难易度') and not t.startswith('诞生日'):
            name = t
            break
    mem.append({'g': game, 'cn': name, 'bd': m.group(1) + m.group(2)})

# ---------- 站内数据 ----------
def load_npc():
    js = open('js/npcfull.js', encoding='utf-8').read()
    body = js[js.index('{'):js.rindex('}') + 1]
    # 顶层键是裸标识符（rf1: [...]），加引号后即为合法 JSON
    body = re.sub(r'(?m)^(\s{4})([A-Za-z_]\w*)(\s*:\s*\[)', r'\1"\2"\3', body)
    body = re.sub(r',(\s*[\]\}])', r'\1', body)   # 去尾逗号
    return json.loads(body)

NPC = load_npc()

# 人工核对的别名表：外部名 -> 站内名（同一角色的不同译名，逐个比对过）
ALIAS = {
    'rf1': {'比安卡': '碧安卡', '蜜斯特': '密丝特', '梅萝蒂': '美乐蒂', '罗洁塔': '萝洁塔', '塔巴萨': '塔巴莎'},
    'rf2': {'阿莉西娅': '阿莉希亚', '朱丽雅': '茱莉雅', '塞西莉亚': '塞西莉娅', '奥尔法斯': '奥斐斯',
            '琳': '凌', '卡侬': '卡农', '穆&苏': '姆&苏', '拉姆莉娅': '拉姆莉雅'},
    'rf3': {'伊欧': '伊奥', '克鲁鲁法': '克璐璐法', '咲夜': '咲耶', '肖可拉': '小可拉',
            '索菲娅·哈拉佩纽·薇薇安': '索菲娅', '达丽亚': '达丽娅', '托娜': '多娜', '玛丽欧': '玛丽安'},
    'rff': {'阿奈特': '阿涅多', '艾瑞丝（白·黑）': '艾莉丝（白／黑）', '塞尔菲': '赛尔菲',
            '塔巴萨': '塔芭莎', '桃洛普': '多洛普', '蜜斯特': '密丝特', '梅罗蒂': '美乐蒂',
            '尤妮': '尤尼', '罗洁塔': '萝赛塔'},
}

def find(g, name, jp=None):
    arr = NPC.get(g, [])
    if jp:
        hit = [x for x in arr if x.get('j') == jp]
        if len(hit) == 1:
            return hit[0]
        raise SystemExit('日文名未唯一命中: %s %s' % (g, jp))
    key = name.replace(' ', '')
    for x in arr:
        if x['n'] == key:
            return x
        if key in [a.strip() for a in (x.get('al') or '').replace('，', '、').split('、') if a.strip()]:
            return x
    tgt = ALIAS.get(g, {}).get(key)
    if tgt:
        hit = [x for x in arr if x['n'] == tgt]
        if len(hit) == 1:
            return hit[0]
    raise SystemExit('未对齐: %s / %s' % (g, name))

# ---------- 合并 ----------
out = {}
def put(g, n, on, bd, src):
    rec = out.setdefault(g, {})
    if n in rec:
        rec[n]['sv'][src] = bd          # 两源各自的原始生日都留着，页面里分列显示
        rec[n]['onv'][src] = on         # 两源各自的写法（日文名 / 中译名）也分开存
        if src not in rec[n]['s']:
            rec[n]['s'].append(src)
        if rec[n]['bd'] != bd:
            print('!! 两源不一致 %s %s: %s vs %s' % (g, n, rec[n]['bd'], bd), file=sys.stderr)
    else:
        rec[n] = {'n': n, 'on': on, 'bd': bd, 's': [src], 'sv': {src: bd}, 'onv': {src: on}}

for r in docx:
    x = find('rff', None, r['j'])
    put('rff', x['n'], r['j'], r['bd'], 'docx')

for r in mem:
    x = find(r['g'], r['cn'])
    put(r['g'], x['n'], r['cn'], r['bd'], 'mem')

# ---------- 与站内比对 ----------
tot = ok = missing = bad = 0
diff = []
for g, rec in out.items():
    for n, v in rec.items():
        tot += 1
        site = ([x for x in NPC[g] if x['n'] == n] or [{}])[0].get('bd') or ''
        v['site'] = site
        if not site:
            missing += 1
            diff.append((g, n, v['bd'], '站内缺'))
        elif site.replace('月', '').replace('日', '') == v['bd']:
            ok += 1
        else:
            bad += 1
            diff.append((g, n, v['bd'], site))

print('外部记录 %d（docx %d / mem %d）' % (tot, len(docx), len(mem)), file=sys.stderr)
print('一致 %d / 站内缺 %d / 不一致 %d' % (ok, missing, bad), file=sys.stderr)
for d in diff:
    print('  ', d, file=sys.stderr)

# ---------- 输出 js ----------
GORDER = ['rf1', 'rf2', 'rf3', 'rff']
SEA = '春夏秋冬'
def key(v):
    m = re.match(r'([春夏秋冬])(\d+)', (v['site'].replace('月', '').replace('日', '') if v['site'] else v['bd']))
    return (SEA.index(m.group(1)) * 100 + int(m.group(2))) if m else 9999

lines_out = []
lines_out.append('/* 外部生日对照数据：边境 26 人取自《RFF 新手篇+人物喜好+星座》(docx，日文名+日文生日)，')
lines_out.append('   RF1/2/3/边境 47 人取自《Rune Factory Official Memoirs》角色攻略（民间翻译版 txt，逐人「诞生日」条）。')
lines_out.append('   字段：n 站内名 / on 外部原名 / bd 外部生日 / s 来源(docx|mem)。由 _build_bd.py 生成，勿手改 */')
lines_out.append('var BD_EXT = {')
for g in GORDER:
    rows = sorted(out.get(g, {}).values(), key=lambda v: (key(v), v['n']))
    body = ',\n'.join('        ' + json.dumps(
        {'n': v['n'], 'on': v['on'], 'bd': v['bd'], 's': v['s'], 'sv': v['sv'], 'onv': v['onv']},
        ensure_ascii=False,
        separators=(',', ':')) for v in rows)
    lines_out.append('    %s: [\n%s\n    ],' % (g, body))
lines_out.append('};')
open('js/bd_ext.js', 'w', encoding='utf-8').write('\n'.join(lines_out) + '\n')
print('写出 js/bd_ext.js', file=sys.stderr)
