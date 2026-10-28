# -*- coding: utf-8 -*-
"""反查 A6NJ 的每个 NCER 立绘被 wiki 哪些页面使用，作为「谁是谁」的依据。"""
import glob
import json
import os
import re
import subprocess
import urllib.parse

BASE = "https://wiki.biligame.com/runefactory/api.php"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
SRC = r'G:/BaiduNetdiskDownload/A6NJ_NCER_extract'


def q(**kw):
    kw.setdefault("format", "json")
    kw.setdefault("formatversion", "2")
    url = BASE + "?" + urllib.parse.urlencode(kw)
    r = subprocess.run(["curl", "-k", "-s", "-A", UA, url], capture_output=True)
    txt = r.stdout.decode("utf-8", "replace")
    if not txt.startswith("{"):
        return {}
    return json.loads(txt)


owners = {}
files = sorted(os.path.basename(f) for f in glob.glob(os.path.join(SRC, "*.png")))
for f in files:
    d = q(action="query", list="imageusage", iutitle="File:" + f, iulimit=30)
    pages = [x["title"] for x in d.get("query", {}).get("imageusage", [])]
    if pages:
        owners[f] = pages
        print(f, "->", " | ".join(pages))

json.dump(owners, open("G:/wit_tools/work/RF_WIKI/_face_src/rf2_owners.json", "w",
                       encoding="utf-8"), ensure_ascii=False, indent=1)
print("\n有归属的文件", len(owners), "/", len(files))

grp = {}
for f, ps in owners.items():
    g = re.match(r"(.+?)(?:_\d+)?\.NCER_\d+\.png", f).group(1)
    grp.setdefault(g, set()).update(ps)
print("\n按组：")
for g in sorted(grp):
    print("  ", g, "->", " | ".join(sorted(grp[g])))
