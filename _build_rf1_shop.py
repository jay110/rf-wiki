# 符文工房 1（RF1）商店与设施：从《RF1 符文工房·新牧场物语 全资料整合》（91KB 中文编译本，UTF-16LE）的「商店」各节切出。
# 输出 js/rf1shop.js：RF1_SHOP = { src, shops:[{ n 店名, h 营业时间, desc 简介, notes, secs:[{t 小节, c 表头, r 行, kind}] }] }
# 价格原样存字符串（含 G 后缀），页面渲染照原样显示、统计时才转数字；备注照录不改（春季种子／通关后有售／奇美拉击破后 …）。
import re, io

SRC = "G:/10257/Downloads/符文攻略/RF1 符文工房·新牧场物语 全资料整合.txt"
OUT = "js/rf1shop.js"

raw = open(SRC, 'rb').read()
txt = raw.decode('utf-16')
lines = txt.splitlines()

def short_name(full):
    m = re.match(r'^([^『（]+)', full)
    return (m.group(1) if m else full).strip()


# RF1 真实设施表头（精确匹配）；纯地点（牧场/遗迹/家）、人物描述行、宅邸均不在此列
SHOPS_EXACT = [
    "伊万的流动店",
    "浴场『巨神温泉』（温泉ギガントのゆ）",
    "诺伊曼的农场（ノイマンズ・ファーム）",
    "卡缪的农场（カミュズ・ファーム）",
    "卡尔迪亚教会（カルディア教会）",
    "卡尔迪亚图书馆（カルディア図书馆）",
    "艾德医院（エド医院）",
    "杂货屋『材料圣地』（雑货屋マテリアル）",
    "酒吧『春之野兔』（酒场スプリングラビット）",
    "旅馆『蕾蒂·安』（宿屋レディ・アン）",
    "锻冶屋『剑·利昂』（锻冶屋ソード･レオ）",
    "海之家『金枪鱼』（海の家スピアーフィッシュ）",
    "怪物小屋（モンスター小屋）",
]


def is_shop_header(s):
    return s in SHOPS_EXACT


def is_subheader(s):
    if re.match(r'^每月\d+日$', s):
        return True
    if s == '出售家具列表如下':
        return False  # 只是引导句，不立小节
    if s.endswith('一览') or s.endswith('要求') or s.endswith('如下'):
        return True
    return False


def parse_item(line):
    toks = line.split()
    if not toks:
        return None
    pidx = price = None
    for i, t in enumerate(toks):
        if re.match(r'^\d[\d,]*G?$', t):
            pidx, price = i, t
            break
    if pidx is None:
        return None
    name = ' '.join(toks[:pidx]).strip()
    note = ' '.join(toks[pidx + 1:]).strip()
    return name, price, note


def parse_upgrade(line):
    toks = line.split()
    if not toks:
        return None
    name = toks[0]
    rest = ' '.join(toks[1:])
    parts = [p.strip() for p in rest.split('，') if p.strip()]
    mat = parts[0] if parts else ''
    cost = next((p for p in parts if re.search(r'\d+\s*G', p)), '')
    days = next((p for p in parts if '日' in p), '')
    # 农具升级行必须至少带「材料／费用／日数」之一，否则只是夹在表格之间的孤立词（如源文件里的「海边」），不立为行
    if not (mat or cost or days):
        return None
    return name, mat, cost, days


shops = []
cur = None
for i, ln in enumerate(lines):
    s = ln.strip()
    if s.startswith('【'):
        cur = None  # 遇到任意「【…】」段标题（节日/单价/收获物/锻造配方/钓鱼地点…）即停止店铺收集
        continue
    if is_shop_header(s):
        cur = {'n': short_name(s), 'full': s, 'h': '', 'desc': '', 'notes': [], 'secs': []}
        shops.append(cur)
        continue
    if cur is None:
        continue
    if '开业时间' in s:
        m = re.search(r'开业时间(.+)$', s)
        cur['h'] = (m.group(1).strip() if m else s)
        continue
    if is_subheader(s):
        kind = 'upgrade' if ('升级' in s or '要求' in s) else 'item'
        cur['secs'].append({'t': s, 'c': None, 'r': [], 'kind': kind})
        continue
    if not s:
        continue
    if s.startswith('[') or '［注］' in s or '[注]' in s:
        cur['notes'].append(s)
        continue
    if cur['desc'] == '' and '开业时间' not in s and not is_subheader(s):
        cur['desc'] = s
        continue
    sec = cur['secs'][-1] if cur['secs'] else None
    if sec is None:
        continue
    if sec['kind'] == 'upgrade':
        row = parse_upgrade(ln)
        if row:
            sec['r'].append(list(row))
    else:
        row = parse_item(ln)
        if row:
            sec['r'].append([row[0], row[1], row[2]] if row[2] else [row[0], row[1]])

# 规整每节表头：item 节若全无备注则去掉「说明」列；upgrade 节固定四列
for sh in shops:
    for sec in sh['secs']:
        if sec['kind'] == 'upgrade':
            sec['c'] = ['农具', '材料', '费用', '日数']
            continue
        note_present = any(len(r) == 3 for r in sec['r'])
        if note_present:
            sec['c'] = ['商品', '售价', '说明']
            for r in sec['r']:
                if len(r) == 2:
                    r.append('')
        else:
            sec['c'] = ['商品', '售价']
    # 去掉空小节
    sh['secs'] = [s for s in sh['secs'] if s['r']]

# 输出
parts = []
parts.append("/* 符文工房 1（RF1）商店与设施：由 _build_rf1_shop.py 从《RF1 符文工房·新牧场物语 全资料整合》（91KB 中文编译本，UTF-16LE）的「商店」各节切出。")
parts.append("   一条 = { n 店名, h 营业时间, desc 简介, notes 附注, secs:[{t 小节, c 表头, r 行, kind}] }")
parts.append("   价格原样存字符串（含 G 后缀），页面渲染照原样显示、统计时才转数字；备注照录不改（春季种子／通关后有售／奇美拉击破后 …）。 */")
parts.append("const RF1_SHOP = {")
parts.append('  "src": "《RF1 符文工房·新牧场物语 全资料整合》（91KB 中文编译本，UTF-16LE）「商店」各节",')
parts.append('  "shops": [')
for sh in shops:
    parts.append('    {')
    parts.append('      "n": %s,' % repr(sh['n']))
    parts.append('      "full": %s,' % repr(sh['full']))
    parts.append('      "h": %s,' % repr(sh['h']))
    parts.append('      "desc": %s,' % repr(sh['desc']))
    if sh['notes']:
        parts.append('      "notes": %s,' % repr(sh['notes']))
    parts.append('      "secs": [')
    for sec in sh['secs']:
        parts.append('        {"t": %s, "c": %s, "kind": %s, "r": [' % (repr(sec['t']), repr(sec['c']), repr(sec['kind'])))
        for r in sec['r']:
            parts.append('          %s,' % repr(r))
        parts.append('        ]},')
    parts.append('      ]')
    parts.append('    },')
parts.append('  ]')
parts.append('};')
parts.append('')

with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(parts))

# 自检打印
total = sum(len(sec['r']) for sh in shops for sec in sh['secs'])
print("shops:", len(shops), "带货店铺:", sum(1 for sh in shops if sh['secs']))
for sh in shops:
    cnt = sum(len(sec['r']) for sec in sh['secs'])
    print("  %-14s 条目 %3d  小节 %d  营业 %s" % (sh['n'], cnt, len(sh['secs']), sh['h'][:18]))
print("合计条目:", total)
