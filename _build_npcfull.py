# -*- coding: utf-8 -*-
"""把 biligame 人物页解析结果 + 站内角色名单合并成 js/npcfull.js

来源：_npc_src/*.txt（wikitext 原件）
对齐：优先用日文名（不受译名差异影响），站内译名优先保留
"""
import io, json, re

SRC = {'rf1':'RF1characters','rf2':'RF2characters','rf3':'RF3characters',
       'rf4':'RF4characters','rf5':'RF5characters','rff':'RFFcharacters','rfo':'RFOcharacters'}
SITE_MAP = {'rf3sp':'rf3','rf4sp':'rf4'}
SKIP_NAMES = {'儿子','女儿','简介','参考与注释','村民互动','结婚候补','村民','其他'}

def clean(v):
    v = re.sub(r'<br\s*/?>', ' ', v)
    v = re.sub(r'\[\[File:[^\]]*\]\]', '', v)
    v = re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]', r'\2', v)
    v = re.sub(r'\[\[([^\]]+)\]\]', r'\1', v)
    v = re.sub(r"'{2,}", '', v)
    v = re.sub(r'<[^>]+>', '', v)
    v = v.replace('&nbsp;',' ').replace('&amp;','&').replace('&quot;','"')
    v = re.sub(r'\s+', ' ', v).strip()
    return v.strip('，,、；; ')

def split_items(v):
    """括号感知切分：钓竿（魚、牛乳、釣竿）这种不能被切开"""
    v = clean(v)
    if not v: return []
    out, buf, depth = [], '', 0
    for ch in v:
        if ch in '（(':
            depth += 1; buf += ch
        elif ch in '）)':
            depth = max(0, depth-1); buf += ch
        elif ch in '、,，' and depth == 0:
            out.append(buf); buf = ''
        else:
            buf += ch
    if buf: out.append(buf)
    res, seen = [], set()
    for x in out:
        x = x.strip().strip('。.；;')
        if x and x not in seen:
            seen.add(x); res.append(x)
    return res

FIELD = {'生日':'bd','CV':'cv','最喜欢':'b','最喜欢的东西':'b','喜欢':'l','喜欢的东西':'l',
         '讨厌':'h','讨厌的东西':'h','最讨厌':'w','最讨厌的东西':'w',
         '回赠品':'g','回礼':'g','自制品回礼':'g','自制物品回礼':'g',
         '生日礼物':'bg','求婚':'pr','求婚道具':'pr','喜欢的香水':'pf',
         '民译':'al','民间译名':'al','住址':'ad','结婚后的便当':'bento',
         '其它提升好感度手段':'other'}
LISTK = {'b','l','h','w'}
HEAD = re.compile(r'^(={2,4})\s*(.+?)\s*\1\s*$')
SEC  = re.compile(r'^={6,}\s*(.+?)\s*={6,}$')

def parse(name):
    t = io.open('_npc_src/%s.txt' % name, encoding='utf-8').read().replace('\r\n','\n')
    out, cur, section = [], None, ''
    for ln in t.split('\n'):
        s = ln.strip()
        ms = SEC.match(s)
        if ms:
            section = clean(ms.group(1)); cur = None; continue
        m = HEAD.match(s)
        if m:
            head = clean(m.group(2))
            if not head or head in SKIP_NAMES or len(head) > 26:
                cur = None; continue
            mm = re.match(r'^(.*?)\s*[（(]\s*([^（）()]*)[）)]\s*$', head)
            name2, tail = (mm.group(1).strip(), mm.group(2)) if mm else (head, '')
            name2 = re.sub(r'^\[\[[^\]]*\]\]', '', name2).strip()
            if not name2 or len(name2) > 18 or name2 in SKIP_NAMES:
                cur = None; continue
            jp = en = ''
            if tail:
                for sep in ('、','，',','):
                    if sep in tail:
                        jp, en = tail.split(sep, 1); break
                else:
                    jp = tail
            cur = {'n': name2, 'j': jp.strip(), 'e': en.strip()}
            if section: cur['sec'] = section
            out.append(cur); continue
        if cur is None or not s: continue
        m2 = re.match(r'^([^：:=\[\]{}<>]{2,16})\s*[：:]\s*(.*)$', s)
        if not m2:
            if len(s) <= 40 and not s.startswith(('[[File','<!--','{{','|','<',']]')):
                txt = clean(s)
                if txt and 'nt' not in cur: cur['nt'] = txt
            continue
        k, v = m2.group(1).strip(), m2.group(2)
        if k.startswith('隐藏年龄'): continue
        cond = None
        mc = re.match(r'^(讨厌|喜欢|最讨厌|最喜欢)（(.+?)）$', k)
        if mc: cond, k = mc.group(2), mc.group(1)
        key = FIELD.get(k)
        if not key: continue
        v = re.sub(r'（[^）]*仅参考[）]?', '', v).strip()
        if clean(v) in ('无', '未知', '不明', '—', '-', ''):
            continue
        if key in LISTK:
            arr = [x for x in split_items(v) if clean(x) not in ('无','未知','不明')]
            if not arr: continue
            if cond: cur.setdefault('cond', {})['%s·%s' % (cond, key)] = arr
            else: cur[key] = arr
        else:
            v = clean(v)
            if v and v not in ('↑','—','-'): cur[key] = v
    return [c for c in out if c['n'] not in SKIP_NAMES]

def norm_bd(s):
    if not s: return ''
    s = s.replace(' ', '')
    s = re.sub(r'^([春夏秋冬])季', r'\1', s)
    m = re.match(r'^([春夏秋冬])(\d+)日?$', s)
    if m: return '%s%s日' % (m.group(1), m.group(2))
    return s

def norm_jp(s):
    return re.sub(r'\s|（.*?）|\(.*?\)', '', s or '').strip()

site = json.load(io.open('_site_chars.json', encoding='utf-8'))
res = {}
report = []
for gid, page in SRC.items():
    src = parse(page)
    sc = site.get(gid, [])
    # 站内日文名索引
    bidx = {}
    for c in sc:
        bidx.setdefault(norm_jp(c.get('jp','')), c)
    merged, used = [], set()
    # ① 先放站内名单（保留 role / note / cv 等既有字段）
    for c in sc:
        jp = c.get('jp','')
        match = None
        key = norm_jp(jp)
        cand = [x for x in src if key and norm_jp(x['j']) == key and x['n'] not in used]
        if cand:
            match = cand[0]
        else:
            # 日文名写法有出入（ディラス/デイラス）时退回中文名精确匹配
            cand = [x for x in src if x['n'] == c['name'] and x['n'] not in used]
            if cand: match = cand[0]
        item = {'n': c['name'], 'j': jp, 'r': c.get('role','')}
        if c.get('cv'): item['cv'] = c['cv']
        if c.get('note'): item['nt'] = c['note']
        if match:
            used.add(match['n'])
            for k in ('b','l','h','w','g','bg','pr','pf','ad'):
                if match.get(k): item[k] = match[k]
            if match.get('cv') and not item.get('cv'): item['cv'] = match['cv']
            if match.get('e'): item['e'] = match['e']
            if match.get('al'): item['al'] = match['al']
            if match.get('bd'): item['bd'] = norm_bd(match['bd'])
            if match.get('cond'): item['cd'] = match['cond']
            if match.get('sec') and not item.get('r'):
                item['r'] = '结婚候补' if '结婚候补' in match['sec'] else '居民'
            if match.get('nt') and not item.get('nt'): item['nt'] = match['nt']
        if item.get('bd') in ('无','',None): item.pop('bd', None)
        if not item.get('bd') and c.get('bday'): item['bd'] = norm_bd(c['bday'])
        merged.append(item)
    # ② 再补源里站内没有的人
    add = 0
    for x in src:
        if x['n'] in used: continue
        item = {'n': x['n'], 'j': x.get('j',''), 'r': ''}
        if x.get('sec'):
            item['r'] = '结婚候补' if '结婚候补' in x['sec'] else '居民'
        for k in ('e','cv','b','l','h','w','g','bg','pr','pf','al','ad'):
            if x.get(k): item[k] = x[k]
        if x.get('bd'): item['bd'] = norm_bd(x['bd'])
        if x.get('cond'): item['cd'] = x['cond']
        if x.get('nt'): item['nt'] = x['nt']
        merged.append(item); add += 1
    # 排序：主角 → 结婚候补 → 居民 → 未标注
    order = {'主角':0, '花嫁候补':1, '花婿候补':1, '结婚候补':1, '关键角色':2, '居民':3, '':4}
    merged.sort(key=lambda x: order.get(x.get('r',''), 4))
    res[gid] = merged
    report.append((gid, len(sc), len(src), add, len(merged)))

lines = ['/* 人物档案（居民 / 结婚候补 / 主角）：%d 部作品，改编自 biligame 符文工厂 wiki 的'
         ' 人物页（CC BY-SA），由 _build_npcfull.py 生成，勿手改 */' % len(res)]
lines.append('var NPC_FULL = {')
for gid, arr in res.items():
    lines.append('    %s: [' % gid)
    for it in arr:
        lines.append('        %s,' % json.dumps(it, ensure_ascii=False, separators=(',', ':')))
    lines.append('    ],')
lines.append('};')
io.open('js/npcfull.js', 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')

print('%-5s %6s %6s %6s %6s' % ('作', '站内', '源', '新增', '合计'))
for r in report:
    print('%-5s %6d %6d %6d %6d' % r)
print('总人数', sum(len(v) for v in res.values()))
import os
print('文件', os.path.getsize('js/npcfull.js'), '字节')
