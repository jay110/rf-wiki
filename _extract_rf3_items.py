# -*- coding: utf-8 -*-
import re, os
SRC="G:/10257/Desktop/符文工房/符文工房3文本"
def read_text(fn):
    with open(os.path.join(SRC,fn),'rb') as f: raw=f.read()
    if raw[:2]==b'\xff\xfe' or raw[:2]==b'\xfe\xff':
        return raw.decode('utf-16', errors='replace')
    return raw.decode('utf-8', errors='replace')
def parse(fn):
    rows=[]
    txt=read_text(fn)
    for i,line in enumerate(txt.split('\n'),1):
        s=line.rstrip('\r')
        if not s.strip(): continue
        m=re.match(r'^([0-9A-Fa-f]+(?:\s+[0-9A-Fa-f]+)*)\s*,\s*(\d+)\s*,\s*(.*)$', s)
        if not m: continue
        off=''.join(m.group(1).split()); typ=m.group(2); t=m.group(3)
        rows.append((i,off,typ,t))
    return rows
def has_cjk(s): return any('\u4e00'<=c<='\u9fff' for c in s)
n1=parse('rf3Archive-7721.TXET.txt')
d2=parse('rf3Archive-7722.TXET.txt')
dmap={r[0]:r[3] for r in d2}
seen=set(); out=[]
for r in n1:
    i,off,typ,name=r
    if not has_cjk(name): continue
    if name in seen: continue
    seen.add(name)
    desc=dmap.get(i,'')
    out.append((i,name,desc))
with open('_rf3_items.txt','w',encoding='utf-8') as f:
    for i,name,desc in out:
        f.write(f"{i}\t{name}\t{desc}\n")
print("中文物品配对总数:", len(out))
# 统计描述含效果关键词的（疑似料理/食物）
kw=['食用','喝了','喝下','吃了','回复','恢复','疲劳','异常','属性','抗性','暴击','状态','诅咒','中毒','睡眠','麻痹','封印','吹飞','倒地','移动速度','攻击力','防御力','力量','智力','灵巧','体质','治愈','提神','消除','减轻','减半','伤害','易陷','不容易','变得','HP','RP','生命','魔力']
cnt=0
for i,name,desc in out:
    if has_cjk(desc) and any(k in desc for k in kw): cnt+=1
print("描述含效果词（疑似食物/料理）:", cnt)

# 导出疑似食物/料理（描述含效果词或饮食相关词）到 _rf3_foods.txt
kw2=['食用','喝了','喝下','吃了','回复','恢复','疲劳','异常','属性','抗性','暴击','状态','诅咒','中毒','睡眠','麻痹','封印','吹飞','倒地','移动速度','攻击力','防御力','力量','智力','灵巧','体质','治愈','提神','消除','减轻','减半','伤害','易陷','不容易','变得','HP','RP','生命','魔力','口感','味道','好吃','烤','煮','蒸','甜','香','脆','软','饮料','茶','汤','汁','酒']
foods=[]
for i,name,desc in out:
    if not has_cjk(desc): continue
    if any(k in desc for k in kw2):
        foods.append((i,name,desc))
foods.sort()
with open('_rf3_foods.txt','w',encoding='utf-8') as f:
    for i,name,desc in foods:
        f.write(f"{i}\t{name}\t{desc}\n")
print("疑似食物/料理导出:", len(foods))
