# -*- coding: utf-8 -*-
"""把切好的头像拼成一张总览图，带中/日文名，方便人眼检查取景。

用法：python _preview_faces.py rf2
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
MAP = {
    'rf2': [
        ('kyle', '凯尔', 'カイル'), ('ars', '阿鲁斯', 'アルス'),
        ('mana', '玛娜', 'マナ'), ('julia', '茱莉雅', 'ジュリア'),
        ('alicia', '阿莉希亚', 'アリシア'), ('cecilia', '塞西莉娅', 'セシリア'),
        ('rosalind', '罗萨琳德', 'ロザリンド'), ('dorothy', '多萝茜', 'ドロシー'),
        ('yue', '由绘', 'ゆえ'), ('max', '麦克斯', 'マックス'),
        ('barrett', '巴瑞特', 'バレット'), ('ray', '雷', 'レイ'),
        ('jake', '杰克', 'ジェイク'), ('douglas', '道格拉斯', 'ダグラス'),
        ('gordon', '高顿', 'ゴードン'), ('natalie', '娜塔莉', 'ナタリー'),
        ('herman', '赫理查科斯', 'ヘリチャコス'), ('cammy', '卡农', 'カノン'),
        ('brai', '布莱伊', 'ブライ'), ('tanya', '塔喵', 'ターニャ'),
        ('endor', '恩多尔', 'エンドール'), ('roy', '罗伊', 'ロイ'),
        ('orfas', '奥斐斯', 'オルファス'), ('leen', '凌', 'リーン'),
        ('muu', '姆', 'ムー'), ('suu', '苏', 'スー'),
        ('ramlia', '拉姆莉雅', 'ラムリア'),
    ],
}


def main():
    game = sys.argv[1] if len(sys.argv) > 1 else 'rf2'
    face_dir = os.path.join(ROOT, 'assets', 'face', game)
    items = MAP[game]
    font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 20)
    small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 15)

    D, PAD, LAB = 116, 16, 52
    cols = 7
    rows = (len(items) + cols - 1) // cols
    W = cols * (D + PAD) + PAD
    H = rows * (D + LAB + PAD) + PAD
    cv = Image.new('RGB', (W, H), (247, 248, 246))
    d = ImageDraw.Draw(cv)
    mask = Image.new('L', (D, D), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, D, D), fill=255)

    for i, (key, cn, jp) in enumerate(items):
        r, c = divmod(i, cols)
        x = PAD + c * (D + PAD)
        y = PAD + r * (D + LAB + PAD)
        p = os.path.join(face_dir, key + '.png')
        if not os.path.exists(p):
            d.text((x, y + 40), '缺图', fill=(200, 0, 0), font=font)
            continue
        im = Image.open(p).convert('RGBA').resize((D, D), Image.LANCZOS)
        cv.paste(im, (x, y), mask)
        d.ellipse((x, y, x + D - 1, y + D - 1), outline=(210, 210, 205))
        d.text((x, y + D + 4), cn, fill=(30, 30, 30), font=font)
        d.text((x, y + D + 30), jp, fill=(120, 120, 120), font=small)
    out = os.path.join(ROOT, '_preview_face_%s.png' % game)
    cv.save(out)
    print(out, cv.size)


main()
