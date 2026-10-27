#!/usr/bin/env python3
"""把多文件站点内联成单个 standalone.html（用于网页上传 / 离线分发）。"""
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


html = re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/?>', css_repl, html)
html = re.sub(r'<script src="([^"]+)"\s*>\s*</script>', js_repl, html)

assert 'src="js/' not in html, "仍有未内联的脚本引用"
assert 'href="css/' not in html, "仍有未内联的样式引用"

out = ROOT / "standalone.html"
out.write_text(html, encoding="utf-8")
print(f"OK {out} {out.stat().st_size} bytes")
