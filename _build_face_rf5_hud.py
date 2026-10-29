# -*- coding: utf-8 -*-
"""符文工房5 头像（128px 版）：从 PC 版 Addressables 的 FaceIconSpriteAtlas 取。

与 _build_face_rf5.py 的区别：那个脚本用的是 Icon_chNNN 那一包（64px、编号有跳号），
本脚本用 Icon_HUD_chNNN 那一包（128px、编号紧凑无跳号）。两包的编号在 15/16 处互换过，
不要混用。

来源（bundle 名是哈希，只能靠 catalog.json 反查）：
    StreamingAssets/aa/catalog.json                    地址表（50MB）
        m_InternalIds / m_InternalIdPrefixes → "270#/FaceIconSpriteAtlas.spriteatlas"
        m_KeyDataString / m_EntryDataString  → 资源 → 所在 bundle 的哈希名
    本作 atlas 落在 a387f7ce68116c82c1e7041b365f4dcb.bundle，内含 108 个 Sprite：
        Icon_HUD_ch000 ~ ch033（基础），Icon_HUD_ch030/031_XXX_YYY（主角 3 套服装×13 表情）

编号依据（三条互证）：
  1) NpcLifeCycleTable 目录名：02_Prisila / 03_Lucy / 06_Beatris / 08_Matin /
     11_Ryuka / 16_Heinz / 17_Randlf / 18_Yuki / 19_Simone / 21_Terry …
  2) 视觉锚点：06=白毛金冠（碧翠丝）、08=护目镜（马丁）、19=紫发眼镜（西蒙娜）、
     20=狐耳（御陵）、24=矮人（ドグ）、23=羊角紫发（レディア）…
  3) 跨作比对：ch032/033 与站内 RF4 的 ダグ / マーガレット 立绘同一设计 —— 这两位是
     《符文工房4 豪华版》存档联动来客（Guest1/Guest2），萌娘百科可查。

关键坑：HUD 编号是**紧凑排布**（跳过表里的 23、25 两个空号），所以
    表 24_Ladia → HUD 23，表 26_Dog → HUD 24，表 27_Julian → HUD 25，表 28_Hina → HUD 26。
另：表 15_Viviage 就是 パルモ（全名 Palmo Crasi Viviage），HUD 15 的立绘正是
     「像 RF4 波可琳那种花哨大汉」，与 16_Heinz（金发黄胡子）互换过，别按旧脚本走。

用法：
    python _build_face_rf5_hud.py            # 只导出缺的 3 张
    python _build_face_rf5_hud.py --all      # 全量重导（会覆盖现有 64px）
"""
import os
import sys

import UnityPy

SRC = r'G:/BaiduNetdiskDownload/3DMGAME_Rune_Factory_5.CHS.Green/Rune Factory 5/Rune Factory 5_Data/StreamingAssets/aa/StandaloneWindows64'
BUNDLE = 'a387f7ce68116c82c1e7041b365f4dcb.bundle'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/face/rf5')

# HUD 编号 -> (站内键名, 日文名)。只列已核实的；ch027 起是幼儿/主角差分，不接。
HUD_MAP = {
    0: ('ares', 'アレス'),
    1: ('alice', 'アリス'),
    2: ('priscilla', 'プリシラ'),
    3: ('lucy', 'ルーシー'),
    4: ('scarlett', 'スカーレット'),
    5: ('fuqua', 'フーカ'),
    6: ('beatrice', 'ベアトリス'),
    7: ('ludmila', 'ルドミラ'),
    8: ('martin', 'マーティン'),
    9: ('cecile', 'セシル'),
    10: ('murakumo', 'むらくも'),
    11: ('lyka', 'リュカ'),
    12: ('reinhard', 'ラインハルト'),
    13: ('lucas', 'ルーカス'),
    14: ('elsje', 'エルシェ'),
    15: ('palmo', 'パルモ'),        # 全名 Palmo Crasi Viviage，= 表 15_Viviage
    16: ('heinz', 'ハインツ'),
    17: ('randolph', 'ランドルフ'),
    18: ('yuki', 'ユキ'),
    19: ('simone', 'シモーヌ'),
    20: ('misasagi', 'みささぎ'),
    21: ('terry', 'テリー'),
    22: ('rivia', 'リヴィア'),
    23: ('laedia', 'レディア'),      # 表 24_Ladia
    24: ('doug', 'ドグ'),            # 表 26_Dog，矮人铁匠
    25: ('julian', 'ジュリアン'),     # 表 27_Julian
    26: ('hina', 'ヒナ'),            # 表 28_Hina，粉发兽耳女孩
    32: ('dag', 'ダグ'),             # Guest1，RF4 联动来客（塔克）
    33: ('margaret', 'マーガレット'),  # Guest2，RF4 联动来客
}
# 只有这 3 张是站内此前没有的
NEW_ONLY = {'palmo', 'dag', 'margaret'}


def main():
    do_all = '--all' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(SRC, BUNDLE)
    if not os.path.exists(path):
        sys.exit('找不到 bundle：%s\n（PC 版本体路径见脚本头部说明）' % path)

    env = UnityPy.load(path)
    got = {}
    for obj in env.objects:
        if obj.type.name != 'Sprite':
            continue
        d = obj.read()
        name = getattr(d, 'm_Name', '') or ''
        if name.startswith('Icon_HUD_') and '_00' not in name[len('Icon_HUD_'):]:
            got[name[len('Icon_HUD_'):]] = d.image

    print('读到 HUD 头像 %d 张' % len(got))
    n = 0
    for cid, (key, jp) in sorted(HUD_MAP.items()):
        if not do_all and key not in NEW_ONLY:
            continue
        im = got.get('ch%03d' % cid)
        if im is None:
            print('  缺 ch%03d %s' % (cid, key))
            continue
        im.save(os.path.join(OUT, key + '.png'))
        n += 1
        print('  ch%03d -> %-10s %s  %s' % (cid, key, im.size, jp))
    print('\n写出 %d 张 -> %s' % (n, OUT))


if __name__ == '__main__':
    main()
