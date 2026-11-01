# -*- coding: utf-8 -*-
"""生成 js/rfo_main.js（RFO_MAIN）与 js/rfo_misc.js（RFO_MISC）。

单一来源：《符文工厂海洋（最强攻略）.xls》
  「主线」表  → 32 步主线流程（每步一段到三段正文）
  「其他」表  → 奖杯 38 条 / 回忆影像 15 段 / 龙庭许愿 4 项 /
                巨人操作 11 条 / 合成指南（7 档难度 + 优质品概率）
  「战斗」表  → 七种武器的普攻·冲刺·蓄力·空中·奥义与三个技能

原表是攻略本作者（署「Misaki-F、威尔亚、黑夜魔影」等）的中文整理稿：
正文以中文为主，人名／任务名夹日文原文，写法不统一。
本脚本一律照录，不做译名统一、不补原文缺字、不替矛盾圆场。

用法：PYTHONPATH="G:/wit_tools/pylibs" python3 _build_rfo_misc.py
"""
import json
import os
import re

import xlrd

XLS = r'G:/10257/Downloads/符文工房攻略/符文工厂海洋（最强攻略）.xls'
OUT_MAIN = 'js/rfo_main.js'
OUT_MISC = 'js/rfo_misc.js'

STEP = re.compile(r'^(\d+)\.(.+)$')
SEP = re.compile(r'[\t\u3000]+')


def cell(sh, r, c):
    try:
        return str(sh.cell_value(r, c)).strip()
    except IndexError:
        return ''


def parse_main(sh):
    rows = [cell(sh, r, 0).replace('\u3000', ' ').strip() for r in range(sh.nrows)]
    rows = [r for r in rows if r]
    steps, cur = [], None
    for line in rows:
        m = STEP.match(line)
        if m:
            cur = {'i': int(m.group(1)), 't': m.group(2).strip(), 'd': []}
            steps.append(cur)
            continue
        if line.startswith('【'):
            continue
        if cur is not None and not line.startswith('【'):
            cur['d'].append(line)
    return steps


def parse_trophy(sh):
    out = []
    for r in range(1, sh.nrows):
        parts = [p.strip() for p in cell(sh, r, 0).split('\t') if p.strip()]
        if len(parts) < 3:
            continue
        out.append({'g': parts[0], 'jp': parts[1], 'c': ' '.join(parts[2:])})
    return out


def parse_memory(sh):
    """列 1 前三行是「1，阿泽鲁op；2，索妮娅op；…」。

    逐行处理，不跨行拼接——原表行尾没有分隔符，拼起来会把
    「5，封印解除」和下一行开头的「6，战斗」连成一条。
    """
    out = []
    for r in range(1, 4):
        for seg in re.split(r'[；;]', cell(sh, r, 1)):
            seg = seg.strip()
            if not seg:
                continue
            m = re.match(r'^(\d+)\s*[，,、.]\s*(.+)$', seg)
            if m:
                out.append({'n': int(m.group(1)), 't': m.group(2).strip()})
    return out


def parse_block(sh, start_label, end_labels):
    """取列 1 里 start_label 之后、任一 end_label 之前的行（原样，含 · 前缀）"""
    rows = [cell(sh, r, 1) for r in range(sh.nrows)]
    i0 = None
    for i, v in enumerate(rows):
        if v.startswith(start_label):
            i0 = i + 1
            break
    if i0 is None:
        return []
    out = []
    for v in rows[i0:]:
        if any(v.startswith(e) for e in end_labels):
            break
        if v:
            out.append(v)
    return out


def split_wish(lines):
    out = []
    for ln in lines:
        m = re.match(r'^(\d)[.．]\s*(.+?)[-－]\s*(\d+)\s*G\s*[（(](.+)[）)]\s*$', ln)
        if m:
            out.append({'n': m.group(1), 'jp': m.group(2).strip(),
                        'g': int(m.group(3)), 'd': m.group(4).strip()})
    return out


def parse_giant(lines):
    out = []
    for ln in lines:
        s = ln.lstrip('·').strip()
        m = re.match(r'^([^：:]{1,12})[：:]\s*(.+)$', s)
        if m:
            out.append({'k': m.group(1).strip(), 'd': m.group(2).strip()})
        elif s:
            out.append({'k': '', 'd': s})
    return out


def parse_craft(lines):
    intro, levels, star, star_b = [], [], [], []
    mode = 'intro'
    for ln in lines:
        if ln.startswith('【合成指南】') or ln == '①综述':
            mode = 'intro'
            continue
        if ln.startswith('②'):
            mode = 'star'
            continue
        if mode == 'intro':
            m = re.match(r'^\(([ⅠⅡⅢⅣⅤⅥⅦ])\)(.+?)[，,]\s*(.+)$', ln)
            if m:
                levels.append({'r': m.group(1), 'cond': m.group(2).strip(),
                               'd': m.group(3).strip().rstrip('；;。')})
            else:
                intro.append(ln)
        else:
            if '优质品的个数' in ln or '这6个难度' in ln:
                star.append(ln)
            elif '原材料包含' in ln:
                star_b.append(ln)
    return {'intro': intro, 'levels': levels, 'starA': star, 'starB': star_b}


def parse_battle(sh):
    """七种武器块：• 标题行 → 总述 → 基本攻击 5 条 → 技能 3 条 → 总评"""
    rows = [cell(sh, r, 0).replace('\u3000', ' ').strip() for r in range(sh.nrows)]
    rows = [r for r in rows if r]
    out, cur, mode = [], None, ''
    for ln in rows:
        if ln.startswith('•'):
            m = re.match(r'^•(.+?)\(相关技能[：:]\s*(.+?)\)\s*$', ln)
            cur = {'n': (m.group(1) if m else ln.lstrip('•')).strip(),
                   'sk': (m.group(2).strip() if m else ''),
                   'desc': '', 'basic': [], 'skill': [], 'note': ''}
            out.append(cur)
            mode = 'desc'
            continue
        if cur is None:
            continue
        if ln == '基本攻击':
            mode = 'basic'
            continue
        if ln == '技能':
            mode = 'skill'
            continue
        if ln.startswith('总评') or ln.startswith('总结'):
            cur['note'] = ln.split('：', 1)[-1].strip()
            mode = 'note'
            continue
        if mode == 'desc':
            cur['desc'] = (cur['desc'] + ' ' + ln).strip()
        elif mode in ('basic', 'skill'):
            m = re.match(r'^[•*]?\s*([^：:]{1,14}?)[：:]\s*(.+)$', ln)
            if m:
                cur['basic' if mode == 'basic' else 'skill'].append(
                    {'k': m.group(1).strip(), 'd': m.group(2).strip()})
            else:
                cur['basic' if mode == 'basic' else 'skill'].append({'k': '', 'd': ln})
    return out


def main():
    if not os.path.exists(XLS):
        raise SystemExit('找不到源文件：%s' % XLS)
    book = xlrd.open_workbook(XLS)

    steps = parse_main(book.sheet_by_name('主线'))
    sh2 = book.sheet_by_name('其他')
    trophies = parse_trophy(sh2)
    memory = parse_memory(sh2)
    wish = split_wish(parse_block(sh2, '【龙庭许愿】', ['【巨人操作】', '【合成指南】']))
    giant = parse_giant(parse_block(sh2, '【巨人操作】', ['【合成指南】']))
    craft = parse_craft(parse_block(sh2, '【合成指南】', []))
    wstyle = parse_battle(book.sheet_by_name('战斗'))

    head_main = [
        '/* 符文工房 海洋（RFO）主线流程 —— 单一来源：《符文工厂海洋（最强攻略）》xls「主线」工作表',
        '   由 _build_rfo_misc.py 生成，不要手改。',
        '   原表是攻略本作者的中文整理稿，人名／任务名夹日文原文，写法不统一；本文件照录，',
        '   不统一译名、不补缺字、不对原表自相矛盾处做裁决。 */',
        'const RFO_MAIN = {',
        '    src: "《符文工厂海洋（最强攻略）》xls「主线」工作表（%d 步）",' % len(steps),
        '    steps: [',
    ]
    for s in steps:
        head_main.append('        ' + json.dumps(s, ensure_ascii=False, separators=(',', ':')) + ',')
    head_main += ['    ]', '};', '']
    s = '\n'.join(head_main)
    open(OUT_MAIN, 'w', encoding='utf-8', newline='\n').write(s)

    misc = {
        'src': '《符文工厂海洋（最强攻略）》xls「其他」工作表',
        'trophies': trophies,
        'memory': memory,
        'wish': wish,
        'giant': giant,
        'craft': craft,
        'wstyle': wstyle,
    }
    head_misc = [
        '/* 符文工房 海洋（RFO）其他系统 —— 单一来源：《符文工厂海洋（最强攻略）》xls「其他」「战斗」工作表',
        '   由 _build_rfo_misc.py 生成，不要手改。',
        '   奖杯、回忆影像、龙庭许愿、巨人操作、合成指南照「其他」表原样；',
        '   七种武器的招式说明照「战斗」表原样（RP 消耗与 Hit 数在原句里，不另拆列以免造数）。 */',
        'const RFO_MISC = ' + json.dumps(misc, ensure_ascii=False, separators=(',', ':')) + ';',
        '',
    ]
    s2 = '\n'.join(head_misc)
    open(OUT_MISC, 'w', encoding='utf-8', newline='\n').write(s2)

    print('主线 %d 步 → %s' % (len(steps), OUT_MAIN))
    print('奖杯 %d / 回忆 %d / 许愿 %d / 巨人 %d / 合成难度 %d / 武器 %d → %s'
          % (len(trophies), len(memory), len(wish), len(giant), len(craft['levels']), len(wstyle), OUT_MISC))
    for s in steps[:3] + steps[-2:]:
        print('  %2d %s | %d 段' % (s['i'], s['t'], len(s['d'])))
    print('  武器块：', '、'.join('%s(%d基本/%d技能)' % (w['n'], len(w['basic']), len(w['skill'])) for w in wstyle))
    print('  许愿：', '、'.join('%s %sG' % (w['jp'], w['g']) for w in wish))
    print('  合成难度：', '、'.join('%s %s' % (l['cond'], l['d']) for l in craft['levels']))
    print('  回忆：', len(memory), '段，首末：', memory[0]['t'] if memory else '-', '/', memory[-1]['t'] if memory else '-')


if __name__ == '__main__':
    main()
