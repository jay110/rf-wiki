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
seen=set(); out=[]
for r in n1:
    i,off,typ,name=r
    if not has_cjk(name): continue
    if name in seen: continue
    seen.add(name); out.append((i,name))
with open('_rf3_names.txt','w',encoding='utf-8') as f:
    for i,name in out: f.write(f"{i}\t{name}\n")
print("7721 中文名去重后总数:", len(out))
# 找 489 附近（已知的料理起点）
print("---- 行号 440~540 附近的中文名 ----")
for i,name in out:
    if 440<=i<=540: print(i, name)
