#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""抓 biligame 符文工厂 wiki 的角色立绘（官网 15 周年图），用于与解包 NCER 比对。

用法：
    python _fetch_portraits.py list            # 列出各角色页用到的第一张 File
    python _fetch_portraits.py get             # 下载到 _face_src/portrait/
"""
import json
import os
import re
import subprocess
import sys
import urllib.parse

BASE = "https://wiki.biligame.com/runefactory/api.php"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
OUT = "G:/wit_tools/work/RF_WIKI/_face_src/portrait"

# 角色页标题（日文名页通常带信息栏与立绘，中文名多为重定向）
CHARS = [
    "マナ", "アリシア", "セシリア", "ジュリア", "ドロシー", "ロザリンド", "ユエ",
    "ブライ", "バレット", "ターニャ", "エンドール", "ジェイク", "ナタリー",
    "レイ", "ゴードン", "ダグラス", "ヘリチャコス", "マックス", "ロイ",
    "カノン", "オルファス", "リーン", "ムー", "スー", "ラムリア",
    "カイル", "アルス",
]


def api(**kw):
    kw.setdefault("format", "json")
    url = BASE + "?" + urllib.parse.urlencode(kw)
    r = subprocess.run(["curl", "-k", "-s", "-A", UA, url], capture_output=True)
    txt = r.stdout.decode("utf-8", "replace")
    if not txt.startswith("{"):
        raise RuntimeError("非 JSON: " + txt[:120])
    return json.loads(txt)


def wikitext(title):
    url = BASE + "?" + urllib.parse.urlencode({
        "action": "parse", "page": title, "prop": "wikitext", "format": "json",
        "formatversion": "2", "redirects": "1",
    })
    r = subprocess.run(["curl", "-k", "-s", "-A", UA, url], capture_output=True)
    txt = r.stdout.decode("utf-8", "replace")
    if not txt.startswith("{"):
        return ""
    d = json.loads(txt)
    return d.get("parse", {}).get("wikitext", "")


def image_url(name):
    url = BASE + "?" + urllib.parse.urlencode({
        "action": "query", "titles": "File:" + name, "prop": "imageinfo",
        "iiprop": "url", "format": "json", "formatversion": "2",
    })
    r = subprocess.run(["curl", "-k", "-s", "-A", UA, url], capture_output=True)
    txt = r.stdout.decode("utf-8", "replace")
    if not txt.startswith("{"):
        return ""
    d = json.loads(txt)
    p = d.get("query", {}).get("pages", [{}])[0]
    ii = p.get("imageinfo") or [{}]
    return ii[0].get("url", "")


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "list"
    os.makedirs(OUT, exist_ok=True)
    res = {}
    for t in CHARS:
        wt = wikitext(t)
        m = re.search(r"\[\[File:([^\]\|]+?\.(?:png|jpg|jpeg|gif))", wt, re.I)
        fname = m.group(1).strip() if m else ""
        res[t] = fname
        print(t, "->", fname or "(无图)")
        if mode == "get" and fname:
            u = image_url(fname)
            if not u:
                print("   !! 无直链")
                continue
            dst = os.path.join(OUT, t + os.path.splitext(fname)[1].lower())
            subprocess.run(["curl", "-k", "-s", "-A", UA, "-o", dst, u])
            print("   saved", os.path.basename(dst), os.path.getsize(dst))
    json.dump(res, open("G:/wit_tools/work/RF_WIKI/_face_src/rf2_files.json", "w",
                        encoding="utf-8"), ensure_ascii=False, indent=1)


main()
