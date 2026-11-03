# -*- coding: utf-8 -*-
"""生成 js/rfoitems.js —— 符文工房 海洋（RFO）的防具·饰品／农具／素材／料理四张表。

源：biligame 符文工房 wiki（wiki.biligame.com/runefactory）四页的 wikitext，
    快照存在 _snap/（RFOaccessories／RFOfarmtool／RFOitem／RFOcook），可离线复现：
        curl "https://wiki.biligame.com/runefactory/<页名>?action=raw"

只做四件事：
  1. 拆 wikitext 表，按「原表有什么列就出什么列」录，缺项保留源站的「—」；
  2. 去掉 wiki 链接标记（[[页|显示名]] 取显示名）、把 <br> 换成「／」；
  3. 丢掉「卖价」列 —— 本站只记商店买价，不记卖价（全站统一规则）；
  4. 拼一条搜索串（名称＋类别＋效果＋材料），供页面顶部输入框过滤。

不改写、不合并、不补全、不换算。材料单元格里的日文原名照录。
"""
import io
import json
import re

SNAP = '_snap/'
OUT = 'js/rfoitems.js'

SRC = ('biligame 符文工厂 wiki《符文工厂 海洋》四表：RFOaccessories（饰品）／RFOfarmtool（农具）／'
       'RFOitem（材料）／RFOcook（料理），wikitext 快照存 _snap/，2026-11 取')


# ---------------------------------------------------------------- 解析
def cell(x):
    """wikitext 单元格 -> 纯文本。"""
    x = re.sub(r'\[\[([^\]\|]*)\|([^\]]*)\]\]', r'\2', x)      # [[页|显示名]] -> 显示名
    x = re.sub(r'\[\[([^\]]*)\]\]', r'\1', x)                   # [[页]] -> 页
    x = re.sub(r'<br\s*/?>', '／', x)                           # 源站的换行当作并列项分隔
    x = re.sub(r'<[^>]+>', '', x)
    x = x.replace("'''", '').replace("''", '')
    x = x.replace('&nbsp;', ' ')
    x = re.sub(r'\s*\n\s*', '', x)                             # 单元格里折行的材料名直接接上（光之结晶\n+辉木）
    x = x.replace('[[', '').replace(']]', '')
    return x.strip()


def rows_of(page, ncol):
    """取页面上第一张 wikitable 的数据行。返回 [[cell, ...], ...]。"""
    txt = io.open(SNAP + page + '.txt', encoding='utf-8', errors='ignore').read()
    tbs = re.findall(r'\{\|.*?\n\|\}', txt, re.S)
    if not tbs:
        raise SystemExit('!! %s 里没有表格' % page)
    rows, cur = [], []
    for line in tbs[0].split('\n'):
        if line.startswith('|-'):
            if cur:
                rows.append(cur)
                cur = []
        elif line.startswith('|}'):
            if cur:
                rows.append(cur)
                cur = []
        elif line.startswith('!') or line.startswith('|+') or line.startswith('{|'):
            continue
        elif line.startswith('|'):
            # 源站有把空单元格写成「||」的行（如「辉木||—||150||…」），
            # 直接切会多出空串，导致整行错位 —— 丢掉空串后再核对列数。
            cur.extend([c for c in line[1:].split('||') if c.strip() != ''])
    if cur:
        rows.append(cur)
    bad = [r for r in rows if len(r) != ncol]
    if bad:
        raise SystemExit('!! %s 有 %d 行列数与表头不符（应为 %d）：%r'
                         % (page, len(bad), ncol, [[cell(c) for c in r] for r in bad[:2]]))
    return [[cell(c) for c in r] for r in rows]


def pack(cols, colw, data_rows, cats=None):
    """-> {cols, colw, rows:[[搜索串,[单元格]], ...], n, cats}"""
    rows = []
    for r in data_rows:
        q = ' '.join([x for x in r if x and x != '—'])
        rows.append([q, r])
    o = {'cols': cols, 'colw': colw, 'rows': rows, 'n': len(rows)}
    if cats is not None:
        o['cats'] = cats
    return o


def uniq(seq):
    out = []
    for s in seq:
        if s not in out:
            out.append(s)
    return out


# ---------------------------------------------------------------- 四张表
# 源表列序：
# accessories  类别|中文名|装饰技能|配方书|总材料|攻击力|防御力|魔法攻击力|魔法防御力|普通效果|高质效果|买价|卖价
# farmtool     种类|中文名|锻造lv|配方书|总材料|攻击力|防御力|魔法攻击力|魔法防御力|暴击率|普通特效|高质特效|买价|卖价|消耗RP
# item         中文|买价|卖价|店铺|宠物生产|魔物掉落|魔物在哪|地图宝箱、罐子
# cook         厨具|中文|料理lv|配方书|总材料|持续时间|HP恢复|RP恢复|特殊效果|买价|入手|卖价

def build_armor():
    d = rows_of('RFOaccessories', 13)
    cols = ['类别', '名称', '装饰Lv', '攻击', '防御', '魔攻', '魔防', '普通效果', '高质效果', '买价', '配方书', '总材料']
    colw = ['3.6rem', '8rem', '4rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem', '9rem', '8rem', '4rem', '8rem', '14rem']
    out = [[r[0], r[1], r[2], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[3], r[4]] for r in d]
    return pack(cols, colw, out, uniq([r[0] for r in out]))


def build_tool():
    d = rows_of('RFOfarmtool', 15)
    cols = ['种类', '名称', '锻造Lv', '攻击', '防御', '魔攻', '魔防', '暴击', '普通特效', '高质特效', '消耗RP', '买价', '配方书', '总材料']
    colw = ['6rem', '8rem', '4rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem', '3.4rem', '9rem', '8rem', '4.2rem', '4rem', '8.4rem', '14rem']
    out = [[r[0], r[1], r[2], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[14], r[12], r[3], r[4]] for r in d]
    return pack(cols, colw, out, uniq([r[0] for r in out]))


def build_mat():
    d = rows_of('RFOitem', 8)
    cols = ['名称', '买价', '店铺', '宠物生产', '魔物掉落', '魔物在哪', '宝箱·罐子']
    colw = ['7rem', '4rem', '7rem', '11rem', '11rem', '13rem', '13rem']
    out = [[r[0], r[1], r[3], r[4], r[5], r[6], r[7]] for r in d]
    return pack(cols, colw, out)


def build_cook():
    d = rows_of('RFOcook', 12)
    cols = ['厨具', '名称', '料理Lv', '持续', 'HP', 'RP', '特殊效果', '入手', '买价', '配方书', '总材料']
    colw = ['5rem', '8rem', '4.2rem', '3.6rem', '3.2rem', '3.2rem', '11rem', '5rem', '3.6rem', '8.4rem', '14rem']
    out = [[r[0], r[1], r[2], r[5], r[6], r[7], r[8], r[10], r[9], r[3], r[4]] for r in d]
    return pack(cols, colw, out, uniq([r[0] for r in out]))


# ---------------------------------------------------------------- 写文件
def main():
    data = {
        'src': SRC,
        'note': ('四张表都从源站 wikitext 逐行搬过来：列名沿用源站（「攻击力／魔法攻击力」缩成「攻击／魔攻」，'
                 '「装饰技能／锻造lv／料理lv」记为「装饰Lv／锻造Lv／料理Lv」），源站的「—」原样保留。'
                 '本站<b>只记商店买价、不记卖价</b>，所以四张表里都没有「卖价」列；卖价在源表里有，'
                 '想看卖价请回源站。材料一栏是源表「总材料」原文，日文原名未译。'),
        'armor': build_armor(),
        'tool': build_tool(),
        'mat': build_mat(),
        'cook': build_cook(),
    }
    js = ('// 符文工房 海洋（rfo）防具·农具·素材·料理四表。由 _build_rfo_items.py 从 biligame wikitext 生成，勿手改。\n'
          'const RFO_ITEMS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js)
    print('%s  %.1f KB' % (OUT, len(js.encode('utf-8')) / 1024.0))
    for k in ('armor', 'tool', 'mat', 'cook'):
        print('  %-6s %4d 条  %d 列  %s' % (k, data[k]['n'], len(data[k]['cols']),
                                          ('分类 ' + '／'.join(data[k]['cats'])) if 'cats' in data[k] else ''))


if __name__ == '__main__':
    main()
