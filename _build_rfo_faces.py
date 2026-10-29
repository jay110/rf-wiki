# -*- coding: utf-8 -*-
"""_build_rfo_faces.py —— 由 PS3 原版贴图生成《符文工房 海洋》(RFO) 角色头像。

素材来源
--------
PS3 日版（BLJS10106 / 亚版同构）`PS3_GAME/USRDIR/RFF2.dat` 内的 TFAp 封装块：
  块 1526  LUfaceNL_XX.hvt   —— 游戏 UI 用的 72x72 对话/名册头像（CI8 + 调色板）
  块 1475  GUfaceML_XX_Y.hvt —— 同尺寸的另一套（怪物用），本脚本不用

编号规则（由游戏内字符串表反推，详见 _face_src/rfo_map.md）
  01..02   主角   アゼル / ソニア
  10..18   女主   9 位结婚候补，按「相遇标记」表顺序
  20..22   男主   3 位结婚候补
  30..38   居民   9 位
  40/41    孩子   男/女（本站名册不收，未取）
  00_2     主角二人共用身体的合成图（特殊，未取）

输出
----
assets/face/rfo/<slug>.png  128x128，已裁掉游戏内那圈 3px 浅色边框

用法
----
  python _build_rfo_faces.py            # 从 _face_src/rfo/ 读源图，写 assets/face/rfo/
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '_face_src', 'rfo')
DST = os.path.join(HERE, 'assets', 'face', 'rfo')

INSET = 3        # 游戏图最外 3px 是浅色圆角边框，裁掉
OUT = 128        # 输出边长（66 -> 128 约 1.94 倍，与站内其它作品同量级）

# (编号, 输出文件名, 日文名, 中文名)
MAP = [
    ('01', 'azel',     'アゼル',     '亚赛尔'),
    ('02', 'sonia',    'ソニア',     '索妮娅'),
    ('10', 'lily',     'リリ',       '莉莉'),
    ('11', 'odette',   'オデット',   '奥黛特'),
    ('12', 'iris',     'アイリス',   '艾伊利斯'),
    ('13', 'electra',  'エレクトラ', '伊莱克特拉'),
    ('14', 'merupur',  'メルプリン', '梅尔普琳'),
    ('15', 'elena',    'エレナ',     '艾琳娜'),
    ('16', 'serra',    'セーラ',     '莎拉'),
    ('17', 'mikoto',   'メイ',       '命'),
    ('18', 'pandora',  'パンドラ',   '潘多拉'),
    ('20', 'joel',     'ジョー',     '乔'),
    ('21', 'james',    'ジェームス', '詹姆斯'),
    ('22', 'bismarc',  'ビスマルク', '俾斯麦'),
    ('30', 'bonapar',  'ボナパルト', '波拿巴尔特'),
    ('31', 'bacchus',  'バッカス',   '巴克斯'),
    ('32', 'kilt',     'キルト',     '琪芦多'),
    ('33', 'nitte',    'ニット',     '尼特'),
    ('34', 'gray',     'グレイ',     '格雷'),
    ('35', 'jaslyn',   'ジャスリン', '洁丝琳'),
    ('36', 'anette',   'アネット',   '阿涅多'),
    ('37', 'candy',    'キャンディ', '糖糖'),
    ('38', 'tabatha',  'タバサ',     '塔芭莎'),
]


def main():
    os.makedirs(DST, exist_ok=True)
    done = miss = 0
    for tag, slug, jp, cn in MAP:
        p = os.path.join(SRC, 'LUfaceNL_%s.png' % tag)
        if not os.path.exists(p):
            print('缺少源图：%s' % p)
            miss += 1
            continue
        im = Image.open(p).convert('RGBA')
        w, h = im.size
        im = im.crop((INSET, INSET, w - INSET, h - INSET))
        im = im.resize((OUT, OUT), Image.LANCZOS)
        im.save(os.path.join(DST, slug + '.png'))
        print('%-4s %-9s %-8s %-6s -> %s.png' % (tag, slug, jp, cn, slug))
        done += 1
    print('完成 %d 张，缺 %d 张；输出目录 %s' % (done, miss, DST))
    return 0 if miss == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
