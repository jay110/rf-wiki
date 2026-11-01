# -*- coding: utf-8 -*-
import re, html as ihtml, json

h = open('_snap/_azuma_cook.html', encoding='utf-8', errors='ignore').read()
tables = re.findall(r'<table.*?</table>', h, re.S)

# 每个 <td> 抓文本；去除标签、反转义、压缩空白
def cell_text(td):
    t = re.sub(r'<[^>]+>', '', td)
    t = ihtml.unescape(t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

COLS = ['名称','材料1','材料2','材料3','材料4','买价','卖价','恢复HP','恢复HP%',
        '恢复RP','恢复RP%','特效','解锁条件','宝箱获取','商店获取']

cats = ['菜肴','便当','加工品','甜点','酒']
out = {}
for ci, tbl in enumerate(tables):
    rows = re.findall(r'<tr.*?</tr>', tbl, re.S)
    data = []
    for r in rows:
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)
        if not cells:
            continue
        # 跳过表头行（首格含"名称"或整行是中文列名）
        vals = [cell_text(c) for c in cells]
        if vals and (vals[0] == '名称' or set(vals[:3]) <= set(COLS[:3])):
            continue
        if len(vals) < 13:
            # 可能列数不齐，补齐
            vals = vals + [''] * (15 - len(vals))
        vals = vals[:15]
        # 材料列、数值列清理：把全角空格等统一；保留 "×" 与 "—"
        data.append(vals)
    out[cats[ci]] = data
    print(f'[{cats[ci]}] rows={len(data)}  sample={data[0] if data else None}')

# 统计
total = sum(len(v) for v in out.values())
print('TOTAL rows:', total)
for k,v in out.items():
    print('  ', k, len(v))

# 写 JS
js = u'''/* 龙之天地（azuma）料理配方汇总 —— cook 页 azuma 分流用
 * 源：gametoeasy.com《符文工房：龙之天地》料理配方丨菜谱获取方式（post/1810）
 *     由 _build_azuma_cook.py 从本地 HTML 快照解析，勿手改。
 * 字段顺序（每类目数组）：
 *   0 名称 1 材料1 2 材料2 3 材料3 4 材料4 5 买价 6 卖价
 *   7 恢复HP 8 恢复HP% 9 恢复RP 10 恢复RP% 11 特效
 *   12 解锁条件 13 宝箱获取 14 商店获取
 * 材料格式照录源表（如「芜菁×1」、「—」）。数值列「—」表示无。
 * 本页仅作「怎么做、在哪拿」索引；源表未给每道菜的星级/难度，不补。
 */
var AZUMA_COOK = {
  cats: [
    { k: "菜肴",   rows: __DISH__ },
    { k: "便当",   rows: __BENTO__ },
    { k: "加工品", rows: __PROC__  },
    { k: "甜点",   rows: __DESS__  },
    { k: "酒",     rows: __LIQU__  }
  ],
  src: "gametoeasy.com/post/1810《符文工房：龙之天地》料理配方"
};
'''
repl = {
  '__DISH__': json.dumps(out['菜肴'], ensure_ascii=False),
  '__BENTO__': json.dumps(out['便当'], ensure_ascii=False),
  '__PROC__': json.dumps(out['加工品'], ensure_ascii=False),
  '__DESS__': json.dumps(out['甜点'], ensure_ascii=False),
  '__LIQU__': json.dumps(out['酒'], ensure_ascii=False),
}
for k,v in repl.items():
    js = js.replace(k, v)
open('js/azuma_cook.js','w',encoding='utf-8').write(js)
print('wrote js/azuma_cook.js', len(js), 'bytes')
