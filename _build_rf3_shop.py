# -*- coding: utf-8 -*-
"""从《RF3 符文工房3全攻略》（NW 旅团 qisiwole）「镇内各店铺」一章切出商店清单。

源文件：G:/10257/Downloads/符文攻略/RF3 符文工房3全攻略.txt（UTF-16LE 带 BOM）
产出：js/rf3shop.js（RF3_SHOP）

只做「按行区间取表 + 按 tab 拆列」，不改字、不补标点、不统一译名。
价格原样存字符串（含 G／本 后缀、空值），由页面决定怎么显示与统计。
"""
import io
import json
import sys

SRC = 'G:/10257/Downloads/符文攻略/RF3 符文工房3全攻略.txt'
OUT = 'js/rf3shop.js'

# 每节：(小节名, 表头行, 首数据行, 末数据行)  行号为原文 1-based
SHOPS = [
    dict(n='花店「花的庭院」', h='9:00~18:00', line=821,
         secs=[('花种', 827, 828, 846),
               ('活动种子', 851, 852, 861),
               ('花', 866, 867, 886)],
         notes=[('', 889, 889)]),
    dict(n='杂货屋「钻石」', h='9:00~18:00', line=892,
         secs=[('春季种子', 898, 899, 904),
               ('夏季种子', 909, 910, 915),
               ('秋季种子', 920, 921, 926),
               ('冬季种子', 931, 932, 937),
               ('杂货、蔬菜类', 942, 943, 975),
               ('家具', 980, 981, 983)],
         notes=[]),
    dict(n='锻冶屋「伽吉屋」', h='9:00~18:00', line=986,
         secs=[('剑·盾', 992, 993, 1030),
               ('枪·斧·锤', 1035, 1036, 1063),
               ('农具', 1068, 1069, 1082),
               ('帽子·靴子·饰品', 1087, 1088, 1132),
               ('改建', 1141, 1142, 1148)],
         notes=[('掘出物', 1137, 1137)]),
    dict(n='魔法医院「魔女的大釜」', h='9:00~18:00', line=1151,
         secs=[('商品列表', 1156, 1157, 1185),
               ('改建', 1190, 1191, 1191)],
         notes=[('', 1187, 1187)]),
    dict(n='艾莉莎的流行商店', h='周一、周三、周五 12:00~17:30', line=1194,
         secs=[('服装', 1200, 1201, 1214),
               ('家具', 1218, 1219, 1242)],
         notes=[('', 1196, 1196)]),
    dict(n='食堂「多兰里斯食堂」', h='9:00~18:00', line=1245,
         secs=[('配方面包', 1251, 1252, 1256),
               ('料理道具', 1261, 1262, 1268)],
         notes=[('', 1271, 1272)]),
    dict(n='旅馆「都」', h='', line=1275,
         secs=[('符文技能店', 1285, 1286, 1296)],
         notes=[('', 1298, 1298)]),
    dict(n='钓鱼池「卡尔罗斯休闲馆」', h='8:00~18:00', line=1322,
         secs=[('可点选的鱼', 1329, 1330, 1338)],
         notes=[('', 1326, 1326), ('', 1327, 1327)]),
]

# 旅馆底下挂着的四家子铺，原文没有价格表，只有营业时间与一句说明
INN_SUB = [
    ('露天浴场「极乐世界」／符文技能店', '10:00~22:00', None, None),
    ('土产屋', '10:30~18:00', None, None),
    ('咲夜的土产店', '', 1301, 1301),
    ('行商由绘', '', 1316, 1316),
    ('冥', '', 1319, 1319),
]

# 神签表：原文在「咲夜的土产店」说明之后，单独成表
OMIKUJI = dict(t='神签（800G，每日一次）', head=1304, first=1305, last=1312)


def main():
    raw = open(SRC, 'rb').read()
    if raw[:2] not in (b'\xff\xfe', b'\xfe\xff'):
        sys.exit('源文件不是 UTF-16，先看编码')
    lines = raw.decode('utf-16').splitlines()

    def L(n):
        # 下面的行号全部是 0-based（与 _rf3shop_raw.txt 首列一致）
        if n < 0 or n >= len(lines):
            sys.exit('行号越界：%d' % n)
        return lines[n].rstrip('\r\n')

    def cells(n):
        return [c.strip() for c in L(n).split('\t')]

    shops = []
    total = 0
    for sp in SHOPS:
        title = L(sp['line'])
        if not title.startswith(sp['n'][:2]):
            sys.exit('店名对不上：第 %d 行是「%s」，期望「%s」' % (sp['line'], title, sp['n']))
        secs = []
        for name, hrow, first, last in sp['secs']:
            head = cells(hrow)
            if len(head) < 2:
                sys.exit('表头拆不出列：第 %d 行 %r' % (hrow, L(hrow)))
            rows = []
            for i in range(first, last + 1):
                c = cells(i)
                # 原文个别行末尾多打了一个 tab（尾随空列），只在多出来的全是空串时截掉
                while len(c) > len(head) and c[-1] == '':
                    c.pop()
                if len(c) != len(head):
                    sys.exit('列数不符：第 %d 行 %r（表头 %d 列，本行 %d 列）'
                             % (i, L(i), len(head), len(c)))
                if not any(c):
                    sys.exit('第 %d 行是空行，区间划错了' % i)
                rows.append(c)
            secs.append(dict(t=name, c=head, r=rows))
            total += len(rows)
        notes = []
        for lab, a, b in sp['notes']:
            txt = ' '.join(L(i).strip() for i in range(a, b + 1) if L(i).strip())
            notes.append((lab + '：' if lab else '') + txt)
        shops.append(dict(n=sp['n'], h=sp['h'], secs=secs, notes=notes))

    # 旅馆：主表在「符文技能店」，另挂四家子铺与神签表
    inn = shops[6]
    assert inn['n'] == '旅馆「都」'
    inn['subs'] = [dict(n=a, h=b, note=(' '.join(L(i).strip() for i in range(c, d + 1) if L(i).strip())
                                        if c else ''))
                   for a, b, c, d in INN_SUB]
    om = OMIKUJI
    inn['extra'] = dict(t=om['t'], c=cells(om['head']),
                        r=[cells(i) for i in range(om['first'], om['last'] + 1)])
    total += len(inn['extra']['r'])

    data = dict(src='NW 旅团 qisiwole《符文工房3全攻略》「镇内各店铺」一章（bbs.newwise.com/thread-482165-1-1.html）',
                shops=shops)

    js = ('/* 符文工房 3（RF3）镇内各店铺：由 _build_rf3_shop.py 从《RF3 符文工房3全攻略》'
          '（NW 旅团 qisiwole）「镇内各店铺」一章切出。\n'
          '   一条 = { n 店名, h 营业时间, secs:[{t 小节, c 表头, r 行}], notes:[原文附注], '
          'subs:[子铺], extra:{神签表} }\n'
          '   价格原样存字符串（含 G／本 后缀与空值），页面渲染照原样显示、统计时才转数字。 */\n'
          'const RF3_SHOP = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(js)
    print('店 %d 家，表内条目 %d 条，数据 %d 节' % (len(shops), total, sum(len(s['secs']) for s in shops)))
    for s in shops:
        print('  %-16s %-26s %s' % (s['n'], s['h'] or '—',
                                    '、'.join('%s %d' % (x['t'], len(x['r'])) for x in s['secs'])))


if __name__ == '__main__':
    main()
