# -*- coding: utf-8 -*-
"""逐人核对站内 NPC_FULL.rfo 的 最爱/喜欢/讨厌 与攻略本 xls「喜好」表是否对得上。"""
import io
import json
import re

import xlrd

XLS = r'G:/10257/Downloads/符文工房攻略/符文工厂海洋（最强攻略）.xls'

# 攻略本中文名 → 站内名
ALIAS = {
    '索妮娅': '索妮娅', '莉莉': '莉莉', '奥黛特': '奥黛特', '爱丽丝': '艾伊利斯',
    '伊蕾克拉': '伊莱克特拉', '莎拉': '莎拉', '伊莲娜': '艾琳娜', '命': '命',
    '梅尔普琳': '梅尔普琳', '潘多拉': '潘多拉', '阿泽鲁': '亚赛尔', '詹姆斯': '詹姆斯',
    '乔伊': '乔', '俾斯麦': '俾斯麦', '巴克斯': '巴克斯', '格雷': '格雷',
    '绮尔托': '琪芦多', '尼特': '尼特', '波拿巴尔特': '波拿巴尔特', '嘉丝琳': '洁丝琳',
    '阿奈特': '阿涅多', '塔巴萨': '塔芭莎', '凯蒂': '糖糖',
}


def xls_rows():
    b = xlrd.open_workbook(XLS)
    sh = b.sheet_by_name('喜好')
    out = []
    for r in range(sh.nrows):
        cells = [str(sh.cell_value(r, c)).strip() for c in range(sh.ncols)]
        name = cells[1]
        m = re.match(r'^([^（(]+)[（(]', name)
        if not m:
            continue
        nm = m.group(1)
        out.append({'cn': nm, 'bd': cells[2], 'fav': cells[3], 'like': cells[4], 'hate': cells[5]})
    return out


def site_rows():
    js = io.open('js/npcfull.js', encoding='utf-8').read()
    body = js[js.index('{'):js.rindex('}') + 1]
    body = re.sub(r'(?m)^(\s{4})([A-Za-z_]\w*)(\s*:\s*\[)', r'\1"\2"\3', body)
    body = re.sub(r',(\s*[\]\}])', r'\1', body)
    return json.loads(body)['rfo']


def main():
    site = {x['n']: x for x in site_rows()}
    rows = xls_rows()
    print('xls 人数 %d / 站内 %d' % (len(rows), len(site)))
    bad = 0
    for r in rows:
        sn = ALIAS.get(r['cn'])
        if not sn or sn not in site:
            print('!! 对不上：%s' % r['cn'])
            bad += 1
            continue
        s = site[sn]
        b = (s.get('b') or [''])[0]
        fav = re.sub(r'[（(].*?[)）]', '', r['fav']).strip()
        favs = [t for t in re.split(r'[／/]', fav) if t]
        ok = any(b and (b in t or t in b) for t in favs)
        if not ok:
            bad += 1
            print('× %-6s 站内最爱「%s」  vs 原表「%s」' % (sn, b, r['fav'][:46]))
            print('    站内喜欢前3：%s' % '、'.join((s.get('l') or [])[:3]))
            print('    原表喜欢：%s' % r['like'][:60])
            print('    站内讨厌：%s ｜ 原表讨厌：%s' % ('、'.join((s.get('h') or [])[:3]), r['hate'][:30]))
    print('合计对不上 %d 人' % bad)


if __name__ == '__main__':
    main()
