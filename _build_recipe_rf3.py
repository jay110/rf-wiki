# -*- coding: utf-8 -*-
"""
构建 js/recipe_rf3.js —— 符文工房3（RF3 / RF3SP）配方大全。

源：biligame 符文工厂 wiki 的四张配方页（网络来源，非官方解包，已汉化）
    RF3recipeweapon   武器：单手剑／双手剑／枪／锤／斧／双剑／杖
    RF3recipeornament 防具与饰品：盾牌／头部装备／鞋子／饰品
    RF3recipefarmtool 农具：洒水壶／锤子／钓竿／斧头／锄头／镰刀
    RF3recipepharmacy 药学

⚠️ RF3 与 RF3SP 共用这一份数据。特别版没有改锻造／药学／农具体系，只多了新婚模式等
   少量内容，站内一律用 /^rf3/ 判断，两版看到的是同一张表（不为 SP 单列一遍）。

数据结构（每张源表列位不同，故按类别保留各自表头与原单元格）：
    RECIPE_RF3 = {
      source,
      groups: [
        { k: '武器', cats: [ { n: '单手剑', head: [...], rows: [[...], ...] } ] },
        ...
      ]
    }
- 材料列（材料1～6）原样保留，空位是「—」（个别页用「-」），照录不改写
- 农具表是「一种农具一张表」，行内还带「官译（简体）／NDS汉化版翻译」两套译名
"""
import re, json

SRC = [
    ('武器', 'RF3recipeweapon', '_rf3_RF3recipeweapon.html'),
    ('防具与饰品', 'RF3recipeornament', '_rf3_RF3recipeornament.html'),
    ('农具', 'RF3recipefarmtool', '_rf3_RF3recipefarmtool.html'),
    ('药学', 'RF3recipepharmacy', '_rf3_RF3recipepharmacy.html'),
]
OUT = 'js/recipe_rf3.js'


def txt(cell):
    cell = re.sub(r'<br[^>]*>', '\u0001', cell)
    cell = re.sub(r'<[^>]+>', '', cell)
    cell = cell.replace('&nbsp;', ' ')
    cell = cell.replace('\u0001', '；')
    return re.sub(r'\s+', ' ', cell).strip()


def cells(tr):
    return [txt(c) for c in re.findall(r'<t[hd][^>]*>.*?</t[hd]>', tr, flags=re.S)]


def headings_and_tables(h):
    """按文档顺序返回 [(标题, 表格HTML)]，标题取表格前最近的 h2/h3。"""
    out, title = [], ''
    for m in re.finditer(r'(<h[23][^>]*>.*?</h[23]>)|(<table.*?</table>)', h, flags=re.S):
        s = m.group(0)
        if s.startswith('<table'):
            out.append((title, s))
        else:
            title = txt(s)
    return out


def main():
    groups, total = [], 0
    for kind, src, path in SRC:
        h = open(path, encoding='utf-8').read()
        pairs = headings_and_tables(h)
        cats = []
        for title, tab in pairs:
            if not title or title in ('RF3recipeweapon', 'RF3recipeornament',
                                      'RF3recipefarmtool', 'RF3recipepharmacy',
                                      'WIKI功能', '目录', '参考与注释'):
                continue
            rows = re.findall(r'<tr.*?</tr>', tab, flags=re.S)
            if len(rows) < 2:
                continue
            head = cells(rows[0])
            # 农具页首行是「农具-洒水壶」单格跨列标题，真正的表头在第二行
            body = rows[1:]
            if len(head) == 1 and len(cells(rows[1])) > 1:
                head = cells(rows[1])
                body = rows[2:]
                title = title.replace('农具数据-', '')
            data = [cells(r) for r in body if cells(r)]
            # 列数对齐（源表无 rowspan/colspan，理论上等长；不等则补齐「—」）
            data = [r + ['—'] * (len(head) - len(r)) if len(r) < len(head) else r for r in data]
            # 药学页只有一个大标题「符文工房3 药学配方」，页上统一写作「药学」
            nm = '药学' if kind == '药学' else title
            cats.append({'n': nm, 'src': src, 'head': head, 'rows': data})
            total += len(data)
            print('  %-10s %-12s %2d 行 × %2d 列' % (kind, title, len(data), len(head)))
        groups.append({'k': kind, 'cats': cats})

    data = {
        'source': ('biligame 符文工厂 wiki：RF3recipeweapon／RF3recipeornament／'
                   'RF3recipefarmtool／RF3recipepharmacy（网络来源，非官方解包，已汉化）'),
        'groups': groups,
    }
    out = ('/* 符文工房3（RF3 / RF3SP 共用）配方大全：武器／防具与饰品／农具／药学。\n'
           '   源：biligame 四张 RF3recipe* 页，由 _build_recipe_rf3.py 生成，勿手改。\n'
           '   料理配方不在这里——它在 js/rf3recipes.js，由料理页渲染。 */\n'
           'var RECIPE_RF3 = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(OUT, 'w', encoding='utf-8', newline='\n').write(out)
    print('合计 %d 条配方 / %d 类，已写 %s（%d 字节）'
          % (total, sum(len(g['cats']) for g in groups), OUT, len(out.encode('utf-8'))))


if __name__ == '__main__':
    main()
