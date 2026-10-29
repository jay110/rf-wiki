# -*- coding: utf-8 -*-
"""符文3 最后两位（恩德珐 / 泽杰）的头像构建。

这两位的官网立绘两处都没有（见 _face_src/rf3/SOURCES.md），改用 neoseeker 攻略 wiki
（Rune Factory 3 Special 页）的官方「PerfectPortrait」图：240×380 透明底半身像，
页面明写 Japanese Name = Ondolfa / Zeze，身份也对得上（Unvir 聚落的学者 / 矮人族），
故可按名字直接采用，不需要猜编号。

用法：python _build_rf3_extra.py
输入：_face_src/rf3/ondolfa_neoseeker.png、zeze_neoseeker.png
输出：assets/face/rf3/ondolfa.png、zeze.png（160×160，取景与其余 rf3 头像一致：头顶贴边）
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow：pip install pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "_face_src", "rf3")
DST = os.path.join(HERE, "assets", "face", "rf3")

# 源图内的裁切框 (left, top, right, bottom)：240×380 里取 140 见方。
# 两人的头都长在画面左上角（右侧是斗篷/身子），所以左边界直接取 0，纵向各下移一点露出下巴。
JOBS = [
    ("ondolfa_neoseeker.png", "ondolfa.png", (0, 10, 140, 150)),
    ("zeze_neoseeker.png", "zeze.png", (0, 15, 140, 155)),
]

SIZE = 160


def main():
    os.makedirs(DST, exist_ok=True)
    for src_name, out_name, box in JOBS:
        p = os.path.join(SRC, src_name)
        if not os.path.exists(p):
            sys.exit("找不到源图：%s" % p)
        im = Image.open(p).convert("RGBA")
        if box[2] > im.width or box[3] > im.height:
            sys.exit("裁切框超出源图范围：%s %s" % (src_name, box))
        crop = im.crop(box).resize((SIZE, SIZE), Image.LANCZOS)
        crop.save(os.path.join(DST, out_name))
        print("输出 %s <- %s %s" % (out_name, src_name, box))


if __name__ == "__main__":
    main()
