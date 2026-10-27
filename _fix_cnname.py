# -*- coding: utf-8 -*-
"""
按汉化版定稿译名，校正站内既有数据的残留日文与错译
  海洋（RFO）：魔物名残留日文、楼层「NF」→「N层」
  符文1（RF1）：特殊能力里的日文技能名
  边境（RFF）：节日名改用汉化定稿、全角「２回目」→「（二次战）」、角色名按汉化定稿
"""
import io, re

ROOT = r'G:/wit_tools/work/RF_WIKI/'


def read(p):
    return io.open(ROOT + p, encoding='utf-8').read()


def write(p, s):
    io.open(ROOT + p, 'w', encoding='utf-8', newline='\n').write(s)


def rep(path, pairs, note=''):
    s = read(path)
    n = 0
    for a, b in pairs:
        c = s.count(a)
        n += c
        s = s.replace(a, b)
    write(path, s)
    print('%-16s 替换 %d 处  %s' % (path, n, note))


# ---------- 海洋：魔物表 ----------
s = read('js/monrfo.js')
s = s.replace('"サムライ"', '"武士"').replace('"バッファムー"', '"水牛哞哞"')
s = s.replace('"ビートル"', '"甲虫"').replace('"デカ大豆"', '"大粒大豆"')
s = s.replace('･', '·')
s = re.sub(r'(\d)F', r'\1层', s)
write('js/monrfo.js', s)
print('js/monrfo.js     楼层与日文魔物名已汉化')

# ---------- 符文1：技能名 ----------
rep('js/rf1mon.js', [
    ('シュドルムウィント', '暴风'),
    ('インフェルノ', '地狱火'),
    ('ライフアブソーバー', '生命吸收'),
    ('ルフトメッサー', '风之刃'),
    ('ヒトダマ', '鬼火'),
], 'RF1 魔物特殊能力')

# ---------- 边境：节日名 + Boss 二次战 ----------
rep('js/festmore.js', [
    ("'大海开放日'", "'海滩开放日'"),
    ("'划船比赛'", "'划船大赛'"),
    ("'智力问答比赛'", "'知识大赛'"),
    ("'锅大会'", "'火锅大会'"),
], 'RFF 节日名按汉化定稿')

rep('js/rffmon.js', [('２回目', '（二次战）')], 'RFF Boss 二次战')

# ---------- 边境：角色名（仅 rff 段，行 141-172） ----------
lines = read('js/data.js').split('\n')
start = next(i for i, l in enumerate(lines) if "id: 'rff'" in l)
end = next(i for i, l in enumerate(lines) if i > start and "id: 'rf4'" in l)
seg = '\n'.join(lines[start:end])
pairs = [('蜜丝特', '密丝特'), ('萝洁塔', '萝赛塔'), ('碧安卡', '比安卡'),
         ('塔巴莎', '塔芭莎'), ('尤妮', '尤尼'), ('安妮特', '阿涅多')]
n = 0
for a, b in pairs:
    c = seg.count(a)
    n += c
    seg = seg.replace(a, b)
lines[start:end] = seg.split('\n')
write('js/data.js', '\n'.join(lines))
print('js/data.js       rff 段角色名替换 %d 处（行 %d-%d）' % (n, start + 1, end))
