#!/usr/bin/env python3
"""把更新日志从 js/pages.js 里拆出来（第一百七十七次提速）

更新日志一项就 228KB 原始 / 170KB gzip，占 pages.js 三分之一。它只在打开日志页时才真正
需要，但 app.js 的 siteUpdated()（每页页脚）和 latestUpdates()（首页）都要读它——
所以先预生成一份 6 条的摘要 js/changelog-head.js 放进内核，正文改按需加载。

幂等：已经拆过就直接退出。
"""
import io
import json
import re
import sys
import zlib

P = 'js/pages.js'
s = io.open(P, encoding='utf-8', newline='').read()

if 'CHANGELOG_HTML' in s:
    print('已经拆过，退出')
    sys.exit(0)

CRLF = '\r\n'
anchor = s.find("key: 'changelog'")
if anchor < 0:
    sys.exit('找不到 changelog 条目')

# body: () => `  ...  `
m = re.compile(r"body:\s*\(\)\s*=>\s*`").search(s, anchor)
if not m:
    sys.exit('找不到 changelog 的 body 模板')
start = m.end()
# 找收尾的 `<CRLF>        `（缩进与 body 同级）
end = s.find(CRLF + '        `', start)
if end < 0:
    sys.exit('找不到 changelog 模板收尾')
body = s[start:end]
print('日志正文 %.0f KB 原始 / %.0f KB gzip'
      % (len(body.encode()) / 1024, len(zlib.compress(body.encode(), 6)) / 1024))

# ---------- 1. 正文单独成文件 ----------
io.open('js/changelog.js', 'w', encoding='utf-8', newline='\n').write(
    '/* 更新日志正文 —— 由 _split_changelog.py 从 js/pages.js 拆出，按需加载\n'
    '   改动请直接改这个文件（格式：一整段 HTML 模板字符串，%d 条） */\n'
    'const CHANGELOG_HTML = `%s`;\n' % (body.count('<h2 class="h2">'), body))

# ---------- 2. pages.js 里换成守卫 ----------
repl = ('body: () => (typeof CHANGELOG_HTML === \'undefined\'\r\n'
        '            ? \'<p class="p">更新日志正在载入……稍等一下会自动出现。</p>\'\r\n'
        '            : CHANGELOG_HTML)')
s = s[:m.start()] + repl + s[end + len(CRLF + '        `'):]
io.open(P, 'w', encoding='utf-8', newline='').write(s)

# ---------- 3. 摘要（页脚日期 + 首页最近更新） ----------
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
print('摘要：更新于 %s，最近 %d 条' % (upd, min(6, len(titles))))
out = ['/* 更新日志摘要 —— 由 _split_changelog.py 生成，勿手改',
       '   siteUpdated() 与 latestUpdates() 在正文未加载时用这份；',
       '   正文加载后仍按原文计算，两者由 _test_changelog.js 断言一致。 */',
       'const CHANGELOG_HEAD = {',
       '    updated: ' + json.dumps(upd) + ',',
       '    latest: [' + ', '.join(json.dumps(t, ensure_ascii=False) for t in titles[:6]) + '],',
       '};', '']
io.open('js/changelog-head.js', 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
print('已写 js/changelog.js 与 js/changelog-head.js')
