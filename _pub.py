#!/usr/bin/env python3
"""发布后把镜像版本号锁定到刚推送的 commit。

为什么非要这样：jsDelivr 对 @main 和 @latest 都有缓存，实测推完两分钟
仍是旧包（有一次 @latest 拿到新版，是因为那个 commit 恰好刚被解析过）。
只有 commit sha 是独立 URL、永远返回确定的内容 —— 所以 index.html 里
线路用的版本号必须写死成 sha，而不是分支名。

用法（每次推送完代码后跑一次）：
    python _pub.py            # 锁定到当前 HEAD 并推送
    python _pub.py --dry      # 只看会改成什么

它做的事：取 HEAD 的短 sha → 改 index.html 里的 REF → 提交「镜像版本
锁定到 xxxxxxx」→ 推送。页面上的 HTML 永远是这一版，资源指向上一版
（就是刚推的那个 commit，内容完全一致，只差 REF 这一行）。
"""
import io
import os
import re
import subprocess
import sys

ROOT = 'G:/wit_tools/work/RF_WIKI'
DRY = '--dry' in sys.argv

# 本机的 http_proxy 走不通 github.com 的 CONNECT（一律 502），直连反而 1.8 秒就通。
# 所以 git 一律清掉代理变量再跑；真不通时 push() 里会退回带代理的环境再试一轮。
NO_PROXY_ENV = {k: v for k, v in os.environ.items()
                if k.lower() not in ('http_proxy', 'https_proxy', 'all_proxy')}


def run(*args, **kw):
    kw.setdefault('env', NO_PROXY_ENV)
    return subprocess.run(args, cwd=ROOT, capture_output=True, text=True, **kw)


def git(*args):
    r = run('git', *args)
    if r.returncode != 0:
        print('git %s 失败：%s' % (' '.join(args), r.stderr.strip()))
        sys.exit(1)
    return r.stdout.strip()


PROXY_ENV = dict(os.environ)


def push():
    """网络抖得厉害，HTTP/2 常被中途掐断，退到 1.1 再试几次；直连不行再挂代理试一轮。"""
    for env in (NO_PROXY_ENV, PROXY_ENV):
        for i in range(4):
            for extra in ([], ['-c', 'http.version=HTTP/1.1']):
                r = run('git', *extra, 'push', 'origin', 'main', env=env)
                if r.returncode == 0:
                    return True
                print('  推送失败（第 %d 次）：%s' % (i + 1, (r.stderr or '').strip().splitlines()[-1:]))
    return False


def main():
    if git('status', '--porcelain'):
        print('工作区还有未提交的改动，先提交再跑这个脚本。')
        sys.exit(1)

    sha = git('rev-parse', '--short', 'HEAD')
    path = ROOT + '/index.html'
    s = io.open(path, 'r', encoding='utf-8', newline='').read()
    m = re.search(r"var REF = '([^']*)';", s)
    if not m:
        print('index.html 里找不到 REF 定义，脚本与页面已经对不上了。')
        sys.exit(1)
    if m.group(1) == sha:
        print('REF 已经是 %s，不用改。' % sha)
        sys.exit(0)
    print('REF: %r -> %r' % (m.group(1), sha))
    if DRY:
        return

    s = s[:m.start()] + "var REF = '%s';" % sha + s[m.end():]
    io.open(path, 'w', encoding='utf-8', newline='').write(s)

    git('add', 'index.html')
    git('commit', '-q', '-m', '镜像版本锁定到 %s' % sha)
    print('已提交。推送中……')
    if not push():
        print('推送失败，改动留在本地，网络好了再 git push。')
        sys.exit(1)
    print('完成：线上 HTML 指向 @%s 的资源。' % sha)


if __name__ == '__main__':
    main()
