# -*- coding: utf-8 -*-
"""RF1 / RF2 村民送礼偏好 → js/gift_rf12.js

源：biligame 符文工房 wiki（现路径 /runefactory/）「RF1characters」「RF2characters」
    两份 wikitext 与本地 _npc_src/ 快照逐字节相同（2026-10-31 复核）。
两作字段不同，不合并：
    RF1  生日 / 最喜欢 / 喜欢 / 住址 / 其它提升好感度手段 / 求婚 / 结婚后的便当
    RF2  生日 / 民译 / 喜欢 / 讨厌 / 生日礼物 / 求婚道具 / 结婚记录 / 母·父
中文名按<b>日文名</b>对齐站内 NPC_FULL（源站与站内译名有出入，不靠中文名猜）。
"""
import io, re, json

PAIRS = [('rf1', 'RF1characters'), ('rf2', 'RF2characters')]

KEYS = ['生日', '最喜欢', '喜欢', '讨厌', '生日礼物', '求婚道具', '民译',
        '住址', '其它提升好感度手段', '求婚', '结婚后的便当']

LINK = re.compile(r'\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]')


def unwrap(s):
    """[[a|b]] → b，[[a]] → a"""
    return LINK.sub(lambda m: (m.group(2) or m.group(1)).strip(), s)


def split_items(raw):
    """把一行礼物拆成 (物品列表, 前缀限定语, 括注说明)"""
    s = raw.strip()
    if not s or s in ('无', '—', '-'):
        return [], '', []

    notes = []
    # 行内括注：拆出来单独记，物品名里不留
    for m in re.finditer(r'（([^）]*)）', s):
        notes.append(m.group(1))
    s_clean = re.sub(r'（[^）]*）', '', s)

    prefix = ''
    i = s_clean.find('[[')
    if i > 0:
        prefix = s_clean[:i].strip().rstrip('、，,')
        s_clean = s_clean[i:]
    items = [unwrap(x).strip() for x in re.split(r'[、，,]', s_clean) if unwrap(x).strip()]
    items = [x for x in items if x and x not in ('无',)]
    return items, prefix, notes


def parse_heading(h):
    """== [[フィル|菲尔]]（フィル,Felicity) == → (中文名, 日文名)"""
    h = h.strip().strip('=').strip()
    cn = ''
    # 源站标题的括号不统一：多数是「（…Mist)」半角右括号，RF2 是「（…Mana）」全角
    m = re.match(r'^(.*?)[（(]([^）)]+)[）)]\s*$', h)
    if m:
        head, tail = m.group(1).strip(), m.group(2)
        jp = tail.split(',')[0].strip()
    else:
        head, jp = h, ''
    # 中文名：heading 里第一个链接的显示名，没有链接就把链接语法去掉
    lk = LINK.search(head)
    if lk:
        # 含 & 的组合名（[[姆]]&[[苏]]）：逐个取显示名再拼
        if head.count('[[') > 1:
            cn = re.sub(r'&', '&', unwrap(head)).replace(' ', '')
        else:
            cn = (lk.group(2) or lk.group(1)).strip()
    else:
        cn = head
    return cn.strip(), jp.strip()


def parse(path):
    s = io.open(path, encoding='utf-8').read()
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    blocks = re.split(r'^==\s*(.+?)\s*==\s*$', s, flags=re.M)
    out = []
    for k in range(1, len(blocks), 2):
        head, body = blocks[k], blocks[k + 1]
        if '参考' in head or '简介' in head:
            continue
        cn, jp = parse_heading(head)
        rec = {'src': cn, 'j': jp, 'bd': '', 'notes': []}
        for line in body.splitlines():
            t = line.strip()
            if not t or t == '<br>':
                continue
            m = re.match(r'^(' + '|'.join(KEYS) + r')\s*[：:]\s*(.*)$', t)
            if m:
                rec[m.group(1)] = m.group(2).strip()
            else:
                rec['notes'].append(t)
        out.append(rec)
    return out


def norm_bd(v):
    v = (v or '').strip()
    if not v or v == '无':
        return ''
    m = re.search(r'([春夏秋冬])\s*(\d+)\s*日', v)
    return '%s%d日' % (m.group(1), int(m.group(2))) if m else v


def build():
    # 站在 NPC_FULL 上的「日文名 → 站内中文名」映射必须按作品分开：
    # 跨作合并会互相覆盖（RFF 也有 ロゼッタ 萝赛塔，会盖掉 RF1 的 萝洁塔）。
    # 直接读 js/npcfull.js，按作品分段取 [名, 日文名]
    src = io.open('js/npcfull.js', encoding='utf-8').read()
    jp2cn = {}
    for m in re.finditer(r'\n    (\w+): \[(.*?)\n    \]', src, re.S):
        gid, body = m.group(1), m.group(2)
        for n, j in re.findall(r'"n":"([^"]+)","j":"([^"]+)"', body):
            jp2cn.setdefault(gid, {})
            jp2cn[gid].setdefault(j, n)

    data = {}
    for gid, page in PAIRS:
        m = jp2cn.get(gid, {})
        recs = parse('_npc_src/%s.txt' % page)
        rows = []
        for r in recs:
            site = m.get(r['j'], '')
            n = site or r['src']
            row = {
                'n': n, 'src': r['src'] if site and site != r['src'] else '',
                'j': r['j'], 'bd': norm_bd(r.get('生日')),
            }
            if gid == 'rf1':
                b, bq, bn = split_items(r.get('最喜欢', ''))
                l, lq, ln = split_items(r.get('喜欢', ''))
                row.update({
                    'b': b, 'l': l,
                    'lq': lq, 'bq': bq,
                    'lnotes': ln, 'bnotes': bn,
                    'bento': unwrap(r.get('结婚后的便当', '')).strip(),
                    'prop': unwrap(r.get('求婚', '')).strip(),
                    'home': unwrap(r.get('住址', '')).strip(),
                    'extra': unwrap(r.get('其它提升好感度手段', '')).strip(),
                })
            else:
                lraw = r.get('喜欢', '')
                # 娜塔莉：分章节，第二章无喜好物
                ch2 = ''
                if '第二章' in lraw:
                    a, _, bpart = lraw.partition('第二章')
                    lraw = a
                    ch2 = '第二章' + bpart.strip()
                l, lq, ln = split_items(lraw.lstrip('第一章:：').strip())
                h, _, hn = split_items(r.get('讨厌', ''))
                row.update({
                    'l': l, 'h': h, 'lq': lq, 'ch2': ch2,
                    'lnotes': ln, 'hnotes': hn,
                    'bg': unwrap(r.get('生日礼物', '')).strip(),
                    'prop': unwrap(r.get('求婚道具', '')).strip(),
                    'alias': r.get('民译', '').strip(),
                })
            row['notes'] = [unwrap(x) for x in r['notes'] if unwrap(x).strip()]
            rows.append(row)
        data[gid] = rows
    return data


if __name__ == '__main__':
    d = build()
    js = ('/* RF1 / RF2 村民送礼偏好\n'
          ' * 源：biligame 符文工房 wiki「RF1characters」「RF2characters」（wikitext，2026-10-31 比对与本地快照一致）\n'
          ' * 由 _build_gift_rf12.py 生成，勿手改。\n'
          ' * 中文名按日文名对齐站内 NPC_FULL；src 为源站译名（与站内不同时才有值）。\n */\n'
          'var GIFT_RF12 = ' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n')
    io.open('js/gift_rf12.js', 'w', encoding='utf-8', newline='\n').write(js)
    for gid in ('rf1', 'rf2'):
        print(gid, len(d[gid]), '人')
