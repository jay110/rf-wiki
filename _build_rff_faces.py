# -*- coding: utf-8 -*-
"""边境（Rune Factory Frontier）头像构建：把 _face_src/rff/FACE##.png 裁成 160px 方图。

源是 Wii 版游戏内对话立绘（480 高半身像，每角色多张表情），由 EveryFileExplorer
从游戏 rom 批量导出，命名形如 FACE01_N_0.png（编号 + 表情代号 + 帧）。
本脚本只取每个编号的「正常表情」一张，按 alpha 边界定头部位置裁正方形。

用法：python _build_rff_faces.py
输入：_face_src/rff/FACE00.png … FACE31.png（已按编号重命名）
输出：assets/face/rff/<slug>.png
编号与人名的对应依据见 _face_src/rff_map.md。
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow：pip install pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "_face_src", "rff")
DST = os.path.join(HERE, "assets", "face", "rff")

# 编号 -> (文件名 key, 中文名)。编号规律见 rff_map.md
MAP = [
    (0, "ragna", "拉格那"), (1, "mist", "密丝特"), (2, "rosetta", "萝赛塔"),
    (3, "lapis", "拉碧丝"), (4, "melody", "美乐蒂"), (5, "bianca", "比安卡"),
    (6, "tabatha", "塔芭莎"), (7, "yuni", "尤尼"), (8, "drop", "多洛普"),
    (9, "anette", "阿涅多"), (10, "selphy", "赛尔菲"), (11, "uzuki", "卯月"),
    (12, "iris_white", "艾莉丝（白）"), (13, "iris_black", "艾莉丝（黑）"),
    (14, "turner", "特纳"), (15, "rita", "丽塔"), (16, "erik", "埃里克"),
    (17, "kanro", "坎罗"), (18, "candy", "糖糖"), (19, "stella", "斯黛拉"),
    (20, "ganesha", "甘妮萨"), (21, "marco", "马尔科"), (22, "danny", "丹尼"),
    # 24 起别按站内名册顺序排：游戏里的 FACE 顺序是 砾→米涅鲁巴→克罗斯→瓦格纳→罗兰德→杰尔文→
    # 卢西亚→雷欧娜，与名册把「砾」排在后面的写法不同。已用 ranchstory wiki 官方立绘逐张对印确认。
    (23, "lute", "卢特"), (24, "tsubute", "砾"), (25, "minerva", "米涅鲁巴"),
    (26, "cross", "克罗斯"), (27, "wagner", "瓦格纳"), (28, "roland", "罗兰德"),
    (29, "geruvain", "杰尔文"), (30, "lucia", "卢西亚"), (31, "leona", "雷欧娜"),
]

HEAD_RATIO = 0.78   # 方框边长 = alpha 高度 * 该系数，数值由肉眼比对定
TOP_NUDGE = 0.015   # 方框顶边再上移一点，避免发顶贴边


def head_crop(im):
    bb = im.getchannel("A").getbbox()
    if not bb:
        return None
    x0, y0, x1, y1 = bb
    W, H = im.size
    side = max(int((y1 - y0) * HEAD_RATIO), 120)
    left = (x0 + x1) // 2 - side // 2
    top = y0 - int(H * TOP_NUDGE)
    left = max(0, min(left, W - side))
    top = max(0, min(top, H - side))
    return im.crop((left, top, left + side, top + side)).resize((160, 160), Image.LANCZOS)


def main():
    if not os.path.isdir(SRC):
        sys.exit("找不到源目录：%s" % SRC)
    os.makedirs(DST, exist_ok=True)
    ok, skip = 0, []
    for fid, slug, cn in MAP:
        p = os.path.join(SRC, "FACE%02d.png" % fid)
        if not os.path.exists(p):
            skip.append("FACE%02d %s" % (fid, cn))
            continue
        im = Image.open(p).convert("RGBA")
        c = head_crop(im)
        if c is None:
            skip.append("FACE%02d %s（无 alpha）" % (fid, cn))
            continue
        c.save(os.path.join(DST, slug + ".png"))
        ok += 1
    print("输出 %d 张 -> %s" % (ok, DST))
    if skip:
        print("跳过：" + "、".join(skip))


if __name__ == "__main__":
    main()
