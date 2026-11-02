# -*- coding: utf-8 -*-
"""从《符文工房3全攻略》（NW 旅团 qisiwole 整理）抽出「简要攻略」章节，生成 js/rf3main.js。

源文件是 UTF-16LE 文本（3779 行）。章节结构：
    简要攻略
    基本操作        -> 9 条键位
    序幕 / 普利贝拉之森 / ... / 龙玄洞   -> 章；章内每行以「·」开头的是一条步骤
    人物介绍及委托表 -> 之后的内容不属于本章节

脚本只做切分与去前缀，**不改一个字**：不补标点、不统一译名、不合并重复。
用法：python3 _build_rf3_main.py
"""
import io
import os
import re

SRC = r'G:/10257/Downloads/符文攻略/RF3 符文工房3全攻略.txt'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'js', 'rf3main.js')

raw = open(SRC, 'rb').read()
text = raw.decode('utf-16-le')
if text.startswith('\ufeff'):
    text = text[1:]
lines = text.splitlines()

# ---- 定位章节范围：从「简要攻略」到「人物介绍及委托表」 ----
start = next(i for i, l in enumerate(lines) if l.strip() == '简要攻略')
end = next(i for i, l in enumerate(lines)
           if i > start and l.strip().startswith('人物介绍及委托表'))
body = lines[start + 1:end]

# ---- 基本操作：位于「基本操作」之后、第一个章节标题之前 ----
op_start = next(i for i, l in enumerate(body) if l.strip() == '基本操作')
ops = []
i = op_start + 1
while i < len(body):
    s = body[i].strip()
    if not s:
        i += 1
        continue
    m = re.match(r'^([A-Za-z][A-Za-z+/]*)\s+(.+)$', s)
    if not m:
        break
    ops.append([m.group(1), m.group(2)])
    i += 1

# ---- 章节：非空、不以「·」开头的行是第一层标题；「·」开头是步骤 ----
chapters = []
for l in body[i:]:
    s = l.strip()
    if not s:
        continue
    if s.startswith('·'):
        if not chapters:          # 章前的孤立步骤：不丢，挂到「未分章」
            chapters.append({'t': '未分章', 'steps': []})
        chapters[-1]['steps'].append(s[1:].strip())
    else:
        chapters.append({'t': s, 'steps': []})

chapters = [c for c in chapters if c['steps']]

n_steps = sum(len(c['steps']) for c in chapters)


def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


out = []
out.append('/* 符文工房 3（RF3 / RF3SP）主线流程 —— 单一来源：《符文工房3全攻略》'
           '（NW 旅团 qisiwole 原创+整理，bbs.newwise.com/thread-482165）「简要攻略」章节')
out.append('   由 _build_rf3_main.py 从 UTF-16LE 原文切分生成，勿手改。')
out.append('   只做切分与去「·」前缀：标点、译名、表情符号（XD／囧）一律照录，不补不改。 */')
out.append('var RF3_MAIN = {')
out.append("    src: '《符文工房3全攻略》「简要攻略」（%d 章 %d 步）'," % (len(chapters), n_steps))
out.append('    ops: [')
for k, v in ops:
    out.append('        [%s, %s],' % (js(k), js(v)))
out.append('    ],')
out.append('    chapters: [')
for c in chapters:
    out.append('        { t: %s, steps: [' % js(c['t']))
    for st in c['steps']:
        out.append('            %s,' % js(st))
    out.append('        ] },')
out.append('    ]')
out.append('};')
out.append('')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(out))

print('章节 %d，步骤 %d，键位 %d' % (len(chapters), n_steps, len(ops)))
for c in chapters:
    print('  %-12s %2d 步  | 首步：%s' % (c['t'], len(c['steps']), c['steps'][0][:26]))
