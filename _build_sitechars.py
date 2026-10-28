# -*- coding: utf-8 -*-
"""从 js/data.js 抽出各作品的 chars 名单，写成 _site_chars.json
供 _build_npcfull.py 合并源页数据时使用。
data.js 是唯一的人工维护入口，这里只做搬运，不做判断。
"""
import re, json, io, os

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    s = io.open(os.path.join(HERE, 'js', 'data.js'), encoding='utf-8').read()
    out = {}
    for m in re.finditer(r"id:\s*'(\w+)'", s):
        gid = m.group(1)
        ci = s.find('chars: [', m.end())
        if ci < 0:
            continue
        st = ci + len('chars: [') - 1
        depth = 0
        end = -1
        for i in range(st, len(s)):
            if s[i] == '[':
                depth += 1
            elif s[i] == ']':
                depth -= 1
                if depth == 0:
                    end = i
                    break
        body = s[st + 1:end]
        items = []
        for om in re.finditer(r'\{([^{}]*)\}', body):
            obj = {}
            for kv in re.finditer(r"(\w+)\s*:\s*'((?:[^'\\]|\\.)*)'", om.group(1)):
                obj[kv.group(1)] = kv.group(2).replace("\\'", "'")
            for kv in re.finditer(r'(\w+)\s*:\s*(-?\d+)', om.group(1)):
                obj.setdefault(kv.group(1), int(kv.group(2)))
            if obj.get('name'):
                items.append(obj)
        out[gid] = items

    p = os.path.join(HERE, '_site_chars.json')
    io.open(p, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(out, ensure_ascii=False, indent=1))
    for gid, v in out.items():
        print('%-5s %3d 人' % (gid, len(v)))
    print('合计', sum(len(v) for v in out.values()), '人 ->', p)


if __name__ == '__main__':
    main()
