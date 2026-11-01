# -*- coding: utf-8 -*-
"""边境（RFF）主线与角色事件：解析《边境主线支线流程机翻.txt》→ js/rffevent.js

来源单一：《边境主线支线流程机翻.txt》（GB18030，机翻）。铁律：内容照录，不改写、
不补全、不合并。机翻语句不通的地方原样保留，页面上统一说明。

原文结构（行级）：
    【主线-01】            ← 事件标签
    条件：……
    结果：……
    蜜斯特：               ← 分组标题（角色名，独占一行）
    芜菁座：               ← 事件小标题（星座名等，在分组内、紧邻下一条事件）
"""
import re
import json

SRC = 'G:/10257/Downloads/符文攻略/边境主线支线流程机翻.txt'
OUT = 'js/rffevent.js'

# 分组标题 = 这些名字独占一行（后接「：」）
WHO = ['蜜斯特', '罗洁塔', '拉碧丝', '梅罗迪', '比安卡', '塔巴萨', '尤妮', '桃乐普',
       '阿奈特', '赛露菲', '卯月', '艾莉丝', '特纳/丽塔', '埃里克', '卡侬', '斯黛拉',
       '迦娜莎/马鲁克', '丹尼', '鲁特', '克罗斯', '布兰迪克', '罗兰']
# 末尾三块不是角色，用原标题
SPECIAL = ['鲸鱼岛', '遗迹攻略流程', '结婚流程']
NAMES = set(WHO + SPECIAL)


def read_lines():
    raw = open(SRC, 'rb').read().decode('gb18030')
    return [l.strip() for l in raw.split('\n')]


def close(blk):
    """把一个事件的缓冲行拆成 条件 / 结果"""
    if blk is None:
        return None
    cond, res, mode = '', [], None
    for x in blk['buf']:
        x = x.strip()
        if not x:
            continue
        if x.startswith('条件'):
            mode = 'c'
            cond = re.sub(r'^条件\s*[：:]\s*', '', x)
        elif x.startswith('结果'):
            mode = 'r'
            res.append(re.sub(r'^结果\s*[：:]\s*', '', x))
        elif mode == 'r':
            res.append(x)
        elif mode == 'c':
            cond += ' ' + x
    m = re.match(r'^(.*?)-(\d+)(\?)?$', blk['tag'])
    return {
        'who': m.group(1) if m else blk['tag'],
        'n': int(m.group(2)) if m else 0,
        'q': bool(m.group(3)) if m else False,
        'c': cond.strip(),
        'r': ' '.join(res).strip(),
    }


def parse():
    lines = read_lines()
    main, groups = [], []
    cur = None          # 当前事件缓冲
    cur_group = None    # 当前分组 [who, list]
    pending = ''        # 悬着的小标题（星座名等）

    def flush():
        nonlocal cur, cur_group, pending
        done = close(cur)
        cur = None
        if not done:
            return
        if done['who'] == '主线':
            main.append(done)
        else:
            if cur_group is None or cur_group[0] != done['who']:
                cur_group = [done['who'], []]
                groups.append(cur_group)
            done['sub'] = pending
            pending = ''
            cur_group[1].append(done)

    for ln in lines:
        if not ln or ln.endswith('.jpg') or ln.endswith('.png'):
            continue                      # 空行与原文里的图片引用行
        m = re.match(r'^【(.+?)】\s*(.*)$', ln)
        if m:
            flush()
            cur = {'tag': m.group(1), 'buf': [m.group(2)] if m.group(2) else []}
            continue
        g = re.match(r'^([^：:]{1,10})[：:]\s*$', ln)
        if g:
            name = g.group(1).strip()
            if name in NAMES:
                flush()
                cur_group = None
                pending = ''
                continue
            pending = name                # 分组内的小标题
            continue
        if cur is not None:
            cur['buf'].append(ln)
    flush()

    # 同一角色被切成相邻两段的，合并回去
    merged = []
    for name, lst in groups:
        if merged and merged[-1][0] == name:
            merged[-1][1].extend(lst)
        else:
            merged.append([name, lst])
    return main, merged


def main():
    m, g = parse()
    data = {
        'main': [{'n': x['n'], 'c': x['c'], 'r': x['r']} for x in m],
        'groups': [{'who': n, 'list': [{'n': x['n'], 'q': x['q'], 'sub': x['sub'],
                                        'c': x['c'], 'r': x['r']} for x in lst]}
                   for n, lst in g],
    }
    total = sum(len(lst) for _n, lst in g)
    js = ('/* 边境（RFF）主线与角色事件\n'
          '   来源单一：《边境主线支线流程机翻.txt》（GB18030，机翻，原文 20,896 字）。\n'
          '   主线 %d 条 + 角色事件 %d 组 %d 条。内容照录机翻原文，不改写、不补全。\n'
          '   字段：main=[{n 步号, c 条件, r 结果}]\n'
          '         groups=[{who 分组名, list=[{n 序号, q 原文标问号, sub 小标题, c, r}]}]\n'
          '   由 _build_rff_event.py 生成，勿手改。 */\n'
          'const RFF_EVENT = %s;\n'
          % (len(data['main']), len(g), total,
             json.dumps(data, ensure_ascii=False, separators=(',', ':'))))
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js)
    print('主线 %d 条' % len(data['main']))
    print('分组 %d 组，事件 %d 条' % (len(g), total))
    for n, lst in g:
        print('   %-10s %2d 条' % (n, len(lst)))


if __name__ == '__main__':
    main()
