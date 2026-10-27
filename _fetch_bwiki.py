#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""抓取 biligame 符文工厂 wiki 的条目清单（MediaWiki API，走 curl 规避代理拦截）。

用法：
    python _fetch_bwiki.py titles          # 抓主空间全部条目标题 -> _bwiki_titles.json
    python _fetch_bwiki.py props           # 抓 SMW 属性清单      -> _bwiki_props.txt
    python _fetch_bwiki.py page <标题>      # 抓单页 wikitext
"""
import json
import os
import subprocess
import sys

BASE = "https://wiki.biligame.com/runefactory/api.php"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
OUT = "G:/wit_tools/work/RF_WIKI/_bwiki"


def api(**kw):
    kw.setdefault("format", "json")
    kw.setdefault("action", "query")
    url = BASE + "?" + _urlencode(kw)
    r = subprocess.run(
        ["curl", "-k", "-s", "-A", UA, url],
        capture_output=True,
    )
    txt = r.stdout.decode("utf-8", "replace")
    if not txt.startswith("{"):
        raise RuntimeError("API 返回非 JSON（可能被拦截）: " + txt[:120])
    return json.loads(txt)


def _urlencode(kw):
    import urllib.parse
    return urllib.parse.urlencode(kw)


def fetch_titles():
    titles = []
    cont = None
    while True:
        p = dict(list="allpages", aplimit=500, apnamespace=0)
        if cont:
            p["apcontinue"] = cont
        d = api(**p)
        titles += [x["title"] for x in d["query"]["allpages"]]
        if "continue" in d:
            cont = d["continue"]["apcontinue"]
        else:
            break
    json.dump(titles, open(OUT + "_titles.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=0)
    print("主空间条目总数:", len(titles))

    from collections import Counter

    def pref(t):
        for sep in ["/", "：", ":", " "]:
            if sep in t:
                return t.split(sep)[0]
        return t

    c = Counter(pref(t) for t in titles)
    print("\n=== 前缀 Top 50 ===")
    for k, v in c.most_common(50):
        print("  %-28s %d" % (k, v))
    return titles


def fetch_props():
    """SMW 属性命名空间（ns=102）"""
    props = []
    cont = None
    while True:
        p = dict(list="allpages", aplimit=500, apnamespace=102)
        if cont:
            p["apcontinue"] = cont
        d = api(**p)
        props += [x["title"] for x in d["query"]["allpages"]]
        if "continue" in d:
            cont = d["continue"]["apcontinue"]
        else:
            break
    print("SMW 属性总数:", len(props))
    for x in props:
        print("  ", x)
    open(OUT + "_props.txt", "w", encoding="utf-8").write("\n".join(props))
    return props


def fetch_page(title):
    d = api(prop="revisions", rvprop="content", rvslots="main",
            titles=title, formatversion=2)
    pg = d["query"]["pages"][0]
    if "revisions" not in pg:
        print("无内容:", title)
        return ""
    return pg["revisions"][0]["slots"]["main"]["content"]


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "titles"
    if cmd == "titles":
        fetch_titles()
    elif cmd == "props":
        fetch_props()
    elif cmd == "page":
        print(fetch_page(sys.argv[2]))
