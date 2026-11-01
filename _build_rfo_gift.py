# -*- coding: utf-8 -*-
"""海洋（RFO）人物喜好返工：把 24 人的 最爱/喜欢/讨厌 全部改回攻略本 xls「喜好」表的原文。

起因：站内这几列是从别作的道具池「展开」出来的——例如命的「全部烤鱼」被展开成 26 条，
里面全是 RF5 才有的鱼（山女鳟、西太公鱼、高身鲫、螯龙虾……），海洋里根本没有这些鱼；
塔芭莎的「全部生鱼片」同样被展开成一串 RF5 鱼名。原表写的是**类别**，就照类别写，不展开。
"""
import io
import json
import re

import xlrd

XLS = r'G:/10257/Downloads/符文工房攻略/符文工厂海洋（最强攻略）.xls'
P = 'js/npcfull.js'

ALIAS = {
    '索妮娅': '索妮娅', '莉莉': '莉莉', '奥黛特': '奥黛特', '爱丽丝': '艾伊利斯',
    '伊蕾克拉': '伊莱克特拉', '莎拉': '莎拉', '伊莲娜': '艾琳娜', '命': '命',
    '梅尔普琳': '梅尔普琳', '潘多拉': '潘多拉', '阿泽鲁': '亚赛尔', '詹姆斯': '詹姆斯',
    '乔伊': '乔', '俾斯麦': '俾斯麦', '巴克斯': '巴克斯', '格雷': '格雷',
    '绮尔托': '琪芦多', '尼特': '尼特', '波拿巴尔特': '波拿巴尔特', '嘉丝琳': '洁丝琳',
    '阿奈特': '阿涅多', '塔巴萨': '塔芭莎', '凯蒂': '糖糖',
}

# 原表写了「心之吊坠」，另一份攻略写「星星吊坠」，本站旧版写「太阳坠饰」——以攻略本为准，
# 另两说在页面上注明，不在这里偷偷并掉。
OVERRIDE_FAV = {'莎拉': '心之吊坠'}

# 原表用的是直译／日文残留，统一成站内道具名（只是叫法，不改内容）
NORM = {
    '水果馅饼': '水果蛋挞', '水果冰糕': '水果芭菲', '法式炖菜/蔬菜杂烩': '法式炖菜',
    '金剛花': '金刚花', '泪珠': '泪滴', '蛋白质': '蛋・白・质', '烤红叶鱼': '烤红叶比目鱼',
    '果蔬欧蕾': '混合蔬果欧蕾', '南瓜馅饼': '南瓜蛋挞', '魔力の結晶': '魔力结晶',
    '風邪薬': '感冒药', '古代魚の骨': '古代鱼的骨头', '虫の皮': '虫皮',
    '手編みのマフラー': '手织围巾', '宝石除外的全部アクセサリ素材': '除宝石外的全部饰品素材',
    '絵画': '画作', '果汁类推荐番茄汁': '果汁类（推荐番茄汁）', '十字架': '祈祷十字',
    '便宜、优质的布': '便宜的布、优质的布', '天妇罗饭/天盖饭': '天妇罗盖饭',
    '刃物の欠片': '利刃的碎片', '昆虫のアゴ': '昆虫下颚',
}



def clean(s):
    s = re.sub(r'[（(][^（）()]*[)）]', '', s)
    return s.strip(' 　')


def split_multi(s):
    parts = [clean(t) for t in re.split(r'[／/]', s)]
    return [t for t in parts if t and t not in ('-', '—')]


def read_xls():
    b = xlrd.open_workbook(XLS)
    sh = b.sheet_by_name('喜好')
    out = {}
    for r in range(sh.nrows):
        cells = [str(sh.cell_value(r, c)).strip() for c in range(sh.ncols)]
        nm = cells[1]
        m = re.match(r'^([^（(]+)[（(]', nm)
        # 「命」这一行没有日文括注，得单独放行；分组标题行（女性结婚候补…）跳过
        key = m.group(1) if m else nm
        if not key or key.endswith(('候补', '居民', '客串')):
            continue
        out[key] = {'fav': cells[3], 'like': cells[4], 'hate': cells[5]}
    return out


def main():
    xls = read_xls()
    src = io.open(P, encoding='utf-8').read()
    i0 = src.index('    rfo: [')
    i1 = src.index('\n    ],', i0) + len('\n    ],')
    block = src[i0:i1]
    body = block[block.index('['):block.rindex(']') + 1]
    data = json.loads(re.sub(r',\s*\]\s*$', ']', body.strip()))

    touched = 0
    for x in data:
        n = x['n']
        cn = next((k for k, v in ALIAS.items() if v == n), None)
        if not cn or cn not in xls:
            continue
        row = xls[cn]
        fav = OVERRIDE_FAV.get(n) or NORM.get(clean(row['fav']), clean(row['fav']))
        like = [NORM.get(t, t) for t in split_multi(row['like'])]
        hate = [NORM.get(t, t) for t in split_multi(row['hate'])]
        if fav:
            x['b'] = [fav]
        x['l'] = like
        x['h'] = hate
        touched += 1
        print('%-6s 最爱 %-10s 喜欢 %d 条 %s ｜ 讨厌 %s' % (n, fav, len(like), '／'.join(like)[:34], '／'.join(hate)[:20]))

    # 用原文件里各条目的键顺序重新序列化，风格与手写一致（无空格）
    order = ['n', 'j', 'r', 'nt', 'b', 'l', 'h', 'e', 'al', 'bd']
    lines = []
    for x in data:
        keys = [k for k in order if k in x] + [k for k in x if k not in order]
        parts = []
        for k in keys:
            parts.append(json.dumps(k, ensure_ascii=False) + ':' + json.dumps(x[k], ensure_ascii=False, separators=(',', ':')))
        lines.append('        {' + ','.join(parts) + '},')
    new_block = '    rfo: [\n' + '\n'.join(lines) + '\n    ],'

    src = src[:i0] + new_block + src[i1:]
    io.open(P, 'w', encoding='utf-8', newline='').write(src)
    print('改写 %d 人，共 %d 条' % (touched, len(data)))


if __name__ == '__main__':
    main()
