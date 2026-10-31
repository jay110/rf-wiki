# -*- coding: utf-8 -*-
"""重裁 RF3 / RF4 角色头像（160x160，统一构图）。

背景（2026-10-31 复核）：
  RF3 一批头像人物偏下偏小，圆形裁切后上半圈是空白（chocolat/persia/raven/sophia…）；
  RF4 一批头像过大，头顶被切（arthur/frey/kiel/leon/lest…）；两作构图也不一致。

做法（两条路，优先第一条）：
  A) 人脸检测：用 lbpcascade_animeface（cv2）找脸框，校验是否可信
     （脸中心须在人物上部、脸宽与身高比例合理），由脸框推头框：
         head_h ≈ 脸框高 × 1.55（脸框到下巴，往上是头发）
  B) 兜底几何法：alpha 轮廓找头顶，按身高比例估头高，逐行中点定水平中心。
  最后由头框定正方形：side = head_h * HEAD_SCALE，顶部留 HEADROOM，水平居中。
  半身像（小图 / 宽高比 ≥0.62）本来就是头肩构图，取接近整图的方形。

用法：
    python _rebuild_faces34.py --dry     # 只出预览到 _preview34/，不动 assets
    python _rebuild_faces34.py           # 覆盖 assets/face/rf3 与 rf4
依赖：Pillow、numpy、opencv-python-headless(<4.11，5.x 已移除级联分类器)
      + G:/wit_tools/pylibs/models/lbpcascade_animeface.xml
"""
import os, sys, glob
import numpy as np
from PIL import Image
import cv2

RF3_SRC = r"G:/wit_tools/work/_rf3/_face_rf3_src"
RF4_SRC = r"G:/wit_tools/work/_rf3/_face_rf4_src"
CASCADE = r"G:/wit_tools/pylibs/models/lbpcascade_animeface.xml"

KEY3 = {
    'マイス': 'mais', 'シア': 'sia', 'トゥーナ': 'raven', 'マリオン': 'marion',
    'ショコラ': 'chocolat', 'イオン': 'ion', 'ペルシャ': 'persia', 'ダリア': 'dahlia',
    'さくや': 'sakuya', 'ソフィア': 'sophia', 'カリン': 'karin', 'ウェルズ': 'wells',
    'モニカ': 'monica', 'マージョリー': 'marjorie', 'ガジ': 'gadzhi', 'グルテン': 'gluten',
    'ラスク': 'rusk', 'しののめ': 'shinonome', 'ヘーゼル': 'hazel', 'ドンチャコス': 'donchacos',
    'エリザ': 'elisa', 'カルロス': 'carlos',
}
KEY4 = {
    'レスト': 'lest', 'フレイ': 'frey', 'マーガレット': 'margaret', 'コハク': 'kohaku',
    'ビシュナル': 'vishnal', 'ディラス': 'dylas', 'フォルテ': 'forte', 'ドルチェ': 'dolce',
    'アーサー': 'arthur', 'キール': 'kiel', 'シャオパイ': 'xiaopai', 'クローリカ': 'clorica',
    'ダグ': 'doug', 'レオン': 'leon', 'ヴォルカノン': 'volkanon', 'バド': 'bado',
    'ポコリーヌ': 'porcoline', 'リンファ': 'linfa', 'エルミナータ': 'illuminata',
    'ブロッサム': 'blossom', 'ジョーンズ': 'jones', 'ナンシー': 'nancy',
    'セルザウィード': 'ventuswill', 'ルーナ': 'luna', 'ノエル': 'noel', 'トゥーナ': 'raven', 'トゥーナ': 'raven',
    'バレット': 'barrett', 'レイヴン': 'raven',
}

OUT = 160
HEAD_SCALE = 1.56      # side = head_h * HEAD_SCALE → 头高约占画幅 64%
HEADROOM = 0.055
MASK_T = 24

# GEOM 兜底估小了头、导致裁得过紧的个别角色：按人物身高给一个手调的头高比例
OVERRIDE = {
    'donchacos': 0.32,
    'marjorie': 0.32,
}

# 不走主源目录的三位 RF3 角色（官网没有立绘）：
#   ondolfa / zeze 用 neoseeker 攻略 wiki 的半身像（与 _build_rf3_extra.py 同源）；
#   kururfa 只有 24x21 的小图标，重裁没有意义，保持原样不动。
ALIAS = {('rf3', 'raven'): ('toona',)}

ALIAS = {('rf3', 'raven'): ('toona',)}

EXTRA3 = [
    (r"_face_src/rf3/ondolfa_neoseeker.png", "ondolfa"),
    (r"_face_src/rf3/zeze_neoseeker.png", "zeze"),
]

_face_cas = None


def face_detect(im):
    """返回最大的脸框 (x,y,w,h)，找不到返回 None。"""
    global _face_cas
    if _face_cas is None:
        _face_cas = cv2.CascadeClassifier(CASCADE)
    arr = np.array(im.convert("RGBA"))
    a = arr[..., 3]
    rgb = arr[..., :3].copy()
    rgb[a < 60] = 255
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    for sf, mn in ((1.08, 3), (1.05, 2), (1.12, 4)):
        fs = _face_cas.detectMultiScale(gray, scaleFactor=sf, minNeighbors=mn,
                                        minSize=(28, 28))
        if len(fs):
            f = max(fs, key=lambda z: z[2] * z[3])
            return tuple(int(v) for v in f)
    return None


def alpha_rows(im):
    a = np.array(im.split()[3]) > MASK_T
    h = a.shape[0]
    rows = []
    for y in range(h):
        xs = np.where(a[y])[0]
        rows.append((int(xs[0]), int(xs[-1]), len(xs)) if len(xs) else (-1, -1, 0))
    return rows


def head_box(im):
    """返回 (y_top, fig_h, head_h, head_cx, mode)。"""
    w, h = im.size
    rows = alpha_rows(im)
    y_top = None
    for y in range(h):
        if rows[y][2] >= max(3, int(w * 0.012)):
            y_top = y
            break
    if y_top is None:
        return None
    y_bot = h - 1
    for y in range(h - 1, -1, -1):
        if rows[y][2] >= max(2, int(w * 0.01)):
            y_bot = y
            break
    fig_h = max(1, y_bot - y_top + 1)

    # ---- A. 人脸检测 ----
    fb = face_detect(im)
    if fb:
        fx, fy, fw, fh = fb
        fcx, fcy = fx + fw / 2, fy + fh / 2
        plausible = (y_top - 0.10 * fig_h <= fcy <= y_top + 0.40 * fig_h and
                     fig_h * 0.045 <= fw <= fig_h * 0.32)
        if plausible:
            # 脸框顶到发顶还有一段，用 alpha 头顶补足
            head_h = max(fh * 1.55, (fy - y_top) + fh * 1.55)
            return y_top, fig_h, head_h, fcx, 'face'

    # ---- B. 几何兜底 ----
    width = [0] * h
    for y in range(h):
        l, r, c = rows[y]
        width[y] = (r - l + 1) if l >= 0 else 0
    sm = [0] * h
    for y in range(h):
        lo, hi = max(0, y - 2), min(h - 1, y + 2)
        sm[y] = sum(width[lo:hi + 1]) / (hi - lo + 1)

    b0 = y_top + int(fig_h * 0.08)
    b1 = min(h - 1, y_top + int(fig_h * 0.26))
    band = sorted(sm[y] for y in range(b0, b1 + 1) if sm[y] > 0)
    head_w = band[len(band) // 2] if band else sm[y_top]

    top_lim = min(h - 1, y_top + int(fig_h * 0.30))
    seg = sm[y_top:top_lim + 1]
    y_peak = y_top + (seg.index(max(seg)) if seg else 0)
    neck_lim = min(h - 1, y_top + int(fig_h * 0.45))
    y_neck = None
    if neck_lim > y_peak + 2:
        sub = sm[y_peak:neck_lim + 1]
        y_neck = y_peak + sub.index(min(sub))

    head_h = head_w * 1.25
    if y_neck is not None:
        cand = y_neck - y_top
        if fig_h * 0.11 <= cand <= fig_h * 0.30:
            head_h = cand
    head_h = max(fig_h * 0.11, min(fig_h * 0.26, head_h))

    ya = min(h - 1, y_top + int(head_h * 0.20))
    yb = min(h - 1, y_top + int(head_h * 0.58))
    xs = sorted((rows[y][0] + rows[y][1]) / 2 for y in range(ya, yb + 1)
                if rows[y][0] >= 0 and rows[y][1] - rows[y][0] > 4)
    head_cx = xs[len(xs) // 2] if xs else w / 2
    return y_top, fig_h, head_h, head_cx, 'geom'


def crop_square(im, y_top, fig_h, head_h, head_cx):
    w, h = im.size
    rows = alpha_rows(im)
    bust = (h <= 300) or (w / h >= 0.62)
    if bust:
        side = min(w, h) * 0.94
        top = max(0, y_top - 0.05 * side)
        ya = min(h - 1, int(top + side * 0.08))
        yb = min(h - 1, int(top + side * 0.42))
        xs = sorted((rows[y][0] + rows[y][1]) / 2 for y in range(ya, yb + 1)
                    if rows[y][0] >= 0 and rows[y][1] - rows[y][0] > 4)
        if xs:
            head_cx = xs[len(xs) // 2]
    else:
        side = min(head_h * HEAD_SCALE, min(w, h) * 0.95)
        top = y_top - HEADROOM * side
    left = head_cx - side / 2

    src = im.crop((int(round(left)), int(round(top)),
                   int(round(left + side)), int(round(top + side))))
    n = int(round(side))
    canvas = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    canvas.paste(src, (0, 0))
    return canvas.resize((OUT, OUT), Image.LANCZOS), bust


def run(gid, src_dir, keymap, dry, extras=()):
    dst = os.path.join("_preview34" if dry else "assets/face", gid)
    os.makedirs(dst, exist_ok=True)
    jobs = [(f, keymap.get(os.path.splitext(os.path.basename(f))[0]))
            for f in sorted(glob.glob(os.path.join(src_dir, "*.png")))]
    for p, k in extras:
        jobs.append((p, k))
    n = 0
    for f, key in jobs:
        if not key:
            print("  [skip] 无 key 映射:", os.path.basename(f))
            continue
        im = Image.open(f).convert("RGBA")
        hb = head_box(im)
        if hb is None:
            print("  [skip] 空图:", os.path.basename(f))
            continue
        y_top, fig_h, head_h, cx, mode = hb
        if key in OVERRIDE:
            head_h = OVERRIDE[key] * fig_h
            mode = 'fix'
        out, bust = crop_square(im, y_top, fig_h, head_h, cx)
        out.save(os.path.join(dst, key + ".png"))
        for alias in ALIAS.get((gid, key), ()):
            out.save(os.path.join(dst, alias + ".png"))
        for alias in ALIAS.get((gid, key), ()):
            out.save(os.path.join(dst, alias + ".png"))
        n += 1
        print(f"  {key:12s} {mode:4s} head_h={head_h:6.1f} ({head_h/fig_h:.2f}x身高) "
              f"cx={cx:6.1f}{' 半身' if bust else ''}")
    print(f"{gid}: 输出 {n} 张 → {dst}")


if __name__ == '__main__':
    dry = '--dry' in sys.argv
    print("== rf3 =="); run('rf3', RF3_SRC, KEY3, dry, EXTRA3)
    print("== rf4 =="); run('rf4', RF4_SRC, KEY4, dry)
