# -*- coding: utf-8 -*-
import json
EXCLUDE = {
 '番茄酱','黄油','黄金果汁','恋爱的预感','热果汁','放松茶的茶叶','红酒','艾丽草',
 '牛奶','优质牛奶','钙质满分牛奶','鸡蛋','优质鸡蛋','每日健康蛋',
 '蛋黄酱S','蛋黄酱','蛋黄酱L','奶酪S','奶酪','奶酪L','酸奶S','酸奶','酸奶L','蜂蜜',
 '米饭','面包','巧克力','小麦粉','油','团子粉','咖喱粉',
 '热牛奶','热可可','葡萄酒','番茄汁','水果欧蕾','蔬菜汁','蔬菜欧蕾','混合蔬果汁','放松茶',
 '菠萝汁','葡萄汁','橘子汁','苹果汁','草莓牛奶','复合果汁','混合蔬果欧蕾'}
def cat(name):
    if '失败' in name: return '失败物'
    if '生鱼片' in name or '刺身' in name or '金枪鱼大脂' in name: return '生鱼片'
    if '咖喱' in name: return '咖喱'
    if '曲奇' in name or '饼干' in name or '酱' in name: return '甜点'
    if '盐烤' in name or '照烧' in name or '田乐烧' in name or '玉米片' in name or '串' in name or ('烤' in name and '蛋糕' not in name and '面包' not in name): return '盐烤/烤物'
    if '炸' in name or '天妇罗' in name or '甜甜圈' in name or '法式吐司' in name or '爆米花' in name or '薯条' in name or '可乐饼' in name: return '油炸'
    if '蒸' in name or '烧卖' in name or '包子' in name: return '蒸制'
    if '炒' in name or '什锦烧' in name: return '炒菜'
    if '炖' in name or '煮' in name or '烩' in name or '粥' in name or '火锅' in name: return '炖煮'
    if '面包' in name or '披萨' in name or '饺' in name or '盖饭' in name or '饭团' in name or '团子' in name or '卡斯提拉' in name or '三明治' in name or '面' in name or '吐司' in name or '饭' in name: return '主食面点'
    if '蛋糕' in name or '布丁' in name or '派' in name or '松饼' in name or '蛋包饭' in name or '玉子烧' in name or '欧姆蛋' in name or '冰淇淋' in name or '拔丝地瓜' in name or '蜜番薯' in name or '柑橘酱' in name or '果酱' in name: return '甜点'
    if '腌' in name or '色拉' in name or '凉拌' in name: return '腌渍/沙拉'
    return '其它'
rows=[]
with open('_rf3_items.txt',encoding='utf-8') as f:
    for line in f:
        p=line.rstrip('\n').split('\t')
        if len(p)<3: continue
        i=int(p[0]); name=p[1]; desc=p[2]
        if not (165<=i<=567): continue
        if name in EXCLUDE: continue
        if '配方面包' in name: continue
        rows.append((i,cat(name),name,desc))
rows.sort()
with open('js/rf3cook.js','w',encoding='utf-8') as f:
    f.write('// 《符文工房3》料理一览数据（名称 + 效果描述，自动生成，勿手改）\n')
    f.write('// 来源：RF3 游戏文本 dump（符文工房3文本 / rf3Archive-7721 名 + rf3Archive-7722 描述），已汉化中文\n')
    f.write('// 说明：本源只含「料理名 + 中文效果描述」，不含材料配方组合（配方为游戏逻辑数据，不在此文本里）。\n')
    f.write('// 字段：[分类, 料理名, 效果描述]\n')
    f.write('const RF3_COOK = [\n')
    for i,c,name,desc in rows:
        f.write('    ' + json.dumps([c,name,desc], ensure_ascii=False) + ',\n')
    f.write('];\n')
from collections import Counter
cnt=Counter(c for _,c,_,_ in rows)
print("料理成品总数:", len(rows))
for k,v in sorted(cnt.items(), key=lambda x:-x[1]):
    print(f"  {k}: {v}")
