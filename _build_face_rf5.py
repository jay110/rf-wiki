# -*- coding: utf-8 -*-
"""符文工房5 头像：从 PC 版（Unity Addressables）的 FaceIconSpriteAtlas 里取。

源不是 NDS 的 NCER 了——RF5 是 Unity 游戏，头像打包在 Addressables 里：
    Rune Factory 5_Data/StreamingAssets/aa/StandaloneWindows64/
        c594fb0012a880d725317f210d995815.bundle   Icon_ch000~ch035 基础头像
        fd604ea1093ddc1c566201e38f7c3b71.bundle   Icon_HUD_ch030/031 表情差分
bundle 名和容器路径都是哈希，只有对象名（m_Name）是人话，所以先靠
_scan_all.py 建总账，再按 Icon_chNNN 取。

ch 编号 ↔ 人物的依据（三条互相印证，见 _face_src/rf5_map.md）：
  1) NpcLifeCycleTable 的 02_Prisila / 03_Lucy / 04_Scalet … 编号；
  2) 立绘目录 Assets/Sprites/CharactorSprite/BU_03Prs 这类带编号的英文名；
  3) 发色/配饰与官网立绘的比对（_rf5_match2.py）。
ch015/ch016 两处编号表与发色相反，按发色定案。

用法：
    python _build_face_rf5.py
"""
import os
import re

import UnityPy

SRC = r'G:/BaiduNetdiskDownload/3DMGAME_Rune_Factory_5.CHS.Green/Rune Factory 5/Rune Factory 5_Data/StreamingAssets/aa/StandaloneWindows64'
BUNDLES = [
    'c594fb0012a880d725317f210d995815.bundle',   # 基础头像
]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/face/rf5')

# ch 编号 -> （站内键名，日文名）。日文名对不上 js/npcfull.js 的，宁可留空不接。
RF5_MAP = {
    0:   ('ares',      'アレス'),        # 蓝帽金发，与表情差分 ch030 同一张脸
    1:   ('alice',     'アリス'),        # 红贝雷帽金长发
    2:   ('priscilla', 'プリシラ'),
    3:   ('lucy',      'ルーシー'),
    4:   ('scarlett',  'スカーレット'),
    5:   ('fuqua',     'フーカ'),
    6:   ('beatrice',  'ベアトリス'),
    7:   ('ludmila',   'ルドミラ'),
    8:   ('martin',    'マーティン'),
    9:   ('cecile',    'セシル'),
    10:  ('murakumo',  'むらくも'),
    11:  ('lyka',      'リュカ'),
    12:  ('reinhard',  'ラインハルト'),
    13:  ('lucas',     'ルーカス'),
    14:  ('elsje',     'エルシェ'),
    15:  ('heinz',     'ハインツ'),      # 编号表作 16，按发色（亮黄）定 15
    17:  ('randolph',  'ランドルフ'),
    18:  ('yuki',      'ユキ'),
    19:  ('simone',    'シモーヌ'),
    20:  ('misasagi',  'みささぎ'),
    21:  ('terry',     'テリー'),
    22:  ('rivia',     'リヴィア'),
    24:  ('laedia',    'レディア'),
    26:  ('doug',      'ドグ'),
    27:  ('julian',    'ジュリアン'),
    28:  ('hina',      'ヒナ'),          # 阳菜，被主角救下的兽人女孩
    34:  ('oswald',    'オズワルド'),
}
# 没接进来的：ch016（编号表 15_Viviage，站内无此人）、ch032/ch033/ch035（未能核实）
KNOWN_OTHER = {
    16: '编号表 15_Viviage（站内无对应居民）',
    23: '无基础头像', 25: '无基础头像', 29: '无基础头像',
    30: '主角·亚雷斯的常服差分', 31: '主角·爱丽丝的常服差分',
    32: '未能核实', 33: '未能核实', 35: '编号表外的立绘（疑似 Gandoage）',
}


def main():
    os.makedirs(OUT, exist_ok=True)
    got = {}
    for b in BUNDLES:
        env = UnityPy.load(os.path.join(SRC, b))
        for obj in env.objects:
            if obj.type.name != 'Sprite':
                continue
            d = obj.read()
            name = getattr(d, 'm_Name', '') or ''
            m = re.fullmatch(r'Icon_ch(\d+)', name)
            if not m:
                continue
            got[int(m.group(1))] = d.image
    print('读到基础头像', len(got), '张；编号表外：',
          sorted(set(got) - set(RF5_MAP)))

    lines = []
    n = 0
    for cid, (key, jp) in sorted(RF5_MAP.items()):
        im = got.get(cid)
        if im is None:
            print(f'  缺 ch{cid:03d} {key}')
            continue
        im.save(os.path.join(OUT, key + '.png'))
        lines.append(f"        '{jp}': '{key}',")
        n += 1
        print(f'  ch{cid:03d} -> {key:10s} {im.size}')
    print(f'\n写出 {n} 张 -> {OUT}')
    print('\n粘贴进 js/faces.js：')
    print('    rf5: {')
    print('\n'.join(lines))
    print('    },')


if __name__ == '__main__':
    main()
