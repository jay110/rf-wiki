#!/usr/bin/env python3
"""把多文件站点内联成单个 standalone.html（用于网页上传 / 离线分发）。

头像（assets/face/**.png）没有别的办法跟着走，转成 data URI 塞进 FACE_DATA，
由 app.js 的 faceSrc() 优先取用；否则单文件版里全是破图。
"""
import base64
import json
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
html = (ROOT / "index.html").read_text(encoding="utf-8")


def css_repl(m):
    p = ROOT / m.group(1)
    return "<style>\n" + p.read_text(encoding="utf-8") + "\n</style>"


def js_repl(m):
    p = ROOT / m.group(1)
    body = p.read_text(encoding="utf-8")
    body = body.replace("</script", "<\\/script")
    return "<script>\n" + body + "\n</script>"


def face_block():
    """把头像图片转成内联数据，键与外部版路径一致，便于 faceSrc 直接命中。"""
    faces = {}
    for p in sorted((ROOT / "assets" / "face").rglob("*.png")):
        rel = p.relative_to(ROOT).as_posix()
        faces[rel] = "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode("ascii")
    if not faces:
        return ""
    print(f"内联头像 {len(faces)} 张，{sum(len(v) for v in faces.values()) // 1024} KB")
    return "<script>var FACE_DATA=" + json.dumps(faces, separators=(",", ":")) + ";</script>"


html = re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/?>', css_repl, html)
html = re.sub(r'<script src="([^"]+)"\s*>\s*</script>', js_repl, html)

# 放在 </head> 前：一定早于 body 里的 app.js，faceSrc 调用时 FACE_DATA 已就绪
fb = face_block()
if fb:
    html = html.replace("</head>", fb + "\n</head>", 1)

assert 'src="js/' not in html, "仍有未内联的脚本引用"
assert 'href="css/' not in html, "仍有未内联的样式引用"

out = ROOT / "standalone.html"
out.write_text(html, encoding="utf-8")
print(f"OK {out} {out.stat().st_size} bytes")
