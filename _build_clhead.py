#!/usr/bin/env python3
"""从 js/changelog.js 重新生成 js/changelog-head.js（更新日志摘要）

改动日志之后跑一次：
    python _build_clhead.py

摘要只给两处用：页脚的「更新于」和首页的「最近更新」。正文是 430KB 的模板字符串，
按需加载；这两处要是也去读正文，首页又得多拉 170KB（gzip）。
摘要与正文是否一致由 node _test_changelog.js 断言。
"""
import io
import json
import re
import sys

src = io.open('js/changelog.js', encoding='utf-8', newline='').read()
m = re.search(r'const CHANGELOG_HTML = `([\s\S]*)`;\s*$', src)
if not m:
    sys.exit('js/changelog.js 里找不到 CHANGELOG_HTML 模板')
body = m.group(1)

hs = re.findall(r'<h2[^>]*>([\s\S]*?)</h2>', body)


def plain(x):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x)).strip()


titles = []
for h in hs:
    t = re.sub(r'^\d{4}-\d{1,2}-\d{1,2}[\s\u3000]*', '', plain(h))
    if len(t) > 42:
        t = t[:40] + '…'
    if t:
        titles.append(t)

dm = re.search(r'(\d{4})-(\d{2})-(\d{2})', body)
upd = '%s-%s-%s' % dm.groups() if dm else ''
print('条目 %d 条，更新于 %s' % (len(hs), upd))

out = ['/* 更新日志摘要 —— 由 _build_clhead.py 生成，勿手改',
       '   siteUpdated() 与 latestUpdates() 在正文未加载时用这份；',
       '   正文加载后仍按原文计算，两者由 _test_changelog.js 断言一致。 */',
       'const CHANGELOG_HEAD = {',
       '    updated: ' + json.dumps(upd) + ',',
       '    latest: [' + ', '.join(json.dumps(t, ensure_ascii=False) for t in titles[:6]) + '],',
       '};', '']
io.open('js/changelog-head.js', 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
print('已写 js/changelog-head.js（最近 %d 条）' % min(6, len(titles)))
