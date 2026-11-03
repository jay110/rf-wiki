# -*- coding: utf-8 -*-
"""生成 js/azuma_armor.js —— 龙之天地（azuma）的防具三表 + 药品表。

源：gametoeasy.com（极特攻略）《符文工房：龙之天地》三篇防具配方 + 一篇药学配方：
    头部装备 post/1819、肩甲 post/1818、饰品 post/1817、药学 post/1811。
    HTML 快照存在 _snap/azuma_eq_<id>.html，可离线复现。

四张表列结构相同（13～15 列），本脚本只做：
  1. 拆表、去标签、去 <br>；
  2. 四列材料合成一列「材料」（用「・」连接，源表的「—」占位丢掉）；
  3. 丢掉「卖价」列 —— 本站只记商店买价，不记卖价；
  4. 拼搜索串。
不改写、不合并、不补全。源表「防御力／魔防」在饰品那一类是百分比，照录「1%」这种写法。
"""
import io
import json
import re

SNAP = '_snap/'
OUT = 'js/azuma_armor.js'

SRC = ('gametoeasy.com《符文工房：龙之天地》防具三篇 + 药学一篇：'
       '头部装备（post/1819）、肩甲（post/1818）、饰品（post/1817）、药学（post/1811），2026-11 取')


def clean(x):
    x = re.sub(r'<br\s*/?>', '、', x)
    x = re.sub(r'<[^>]+>', '', x)
    x = x.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    return x.strip()


def rows_of(pid):
    t = io.open('%sazuma_eq_%s.html' % (SNAP, pid), encoding='utf-8', errors='ignore').read()
    tb = re.findall(r'<table.*?</table>', t, re.S)[0]
    out = []
    for tr in re.findall(r'<tr.*?</tr>', tb, re.S):
        cs = [clean(c) for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', tr, re.S)]
        if cs:
            out.append(cs)
    return out


def mats(r):
    """材料1～4 合成一列；源表用「—」占位，丢掉。"""
    got = [x for x in r[1:5] if x and x != '—']
    return '・'.join(got) if got else '—'


def pack(cols, colw, data):
    rows = []
    for r in data:
        q = ' '.join([x for x in r if x and x != '—'])
        rows.append([q, r])
    return {'cols': cols, 'colw': colw, 'rows': rows, 'n': len(rows)}


def fam(pid, name):
    """防具一族：head 行 = 名称 材料1-4 买价 卖价 特效 升级增加 防御力 魔防 解锁 宝箱"""
    d = rows_of(pid)[1:]
    cols = ['名称', '材料', '买价', '防御力', '魔防', '升级增加', '防具特殊效果', '解锁条件', '宝箱获取']
    colw = ['8rem', '13rem', '4.6rem', '4.6rem', '4.6rem', '4.6rem', '10rem', '11rem', '6rem']
    out = []
    for r in d:
        if len(r) < 13:
            continue
        out.append([r[0], mats(r), r[5], r[9], r[10], r[8], r[7], r[11], r[12]])
    o = pack(cols, colw, out)
    o['name'] = name
    return o


def potion():
    """药学：名称 材料1-4 买价 卖价 HP HP% RP RP% 特效 解锁 宝箱 商店"""
    d = rows_of('1811')[1:]
    cols = ['名称', '材料', '买价', 'HP', 'HP%', 'RP', 'RP%', '特效', '解锁条件', '宝箱获取', '商店获取']
    colw = ['7rem', '13rem', '4.6rem', '4rem', '4rem', '4rem', '4rem', '10rem', '11rem', '7rem', '7rem']
    out = []
    for r in d:
        if len(r) < 15:
            continue
        out.append([r[0], mats(r), r[5], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14]])
    return pack(cols, colw, out)


def main():
    data = {
        'src': SRC,
        'note': ('四张表都从源站 HTML 表逐行搬过来。源表把材料分成「材料1～4」四列，本站合成一列「材料」'
                 '（用「・」连接，源表占位的「—」丢掉）；<b>本站只记商店买价、不记卖价</b>，所以四张表都没有卖价列。'
                 '饰品类源表的「防御力／魔防」是百分比（如「1%」），肩甲与头部是数值——照录，不换算、不统一。'),
        'fams': [fam('1819', '头部'), fam('1818', '肩甲'), fam('1817', '饰品')],
        'potion': potion(),
    }
    js = ('// 符文工房 龙之天地（azuma）防具三表 + 药品表。由 _build_azuma_armor.py 从 gametoeasy 生成，勿手改。\n'
          'const AZUMA_ARMOR = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(js)
    print('%s  %.1f KB' % (OUT, len(js.encode('utf-8')) / 1024.0))
    for f in data['fams']:
        print('  %-4s %3d 条  %d 列' % (f['name'], f['n'], len(f['cols'])))
    print('  药品 %3d 条  %d 列' % (data['potion']['n'], len(data['potion']['cols'])))


if __name__ == '__main__':
    main()
