import re, json

p = 'G:/10257/Downloads/符文攻略/RF3 符文工房3全攻略.txt'
s = open(p, 'rb').read().decode('utf-16')
lines = [l.rstrip('\r') for l in s.split('\n')]

# ---- 日历章节：1344(日历标题) ~ 1601(交流祭之前) ----
order = ['春', '夏', '秋', '冬']
events = {}
for l in lines[1344:1602]:
    m = re.match(r'^(春|夏|秋|冬)(\d+)\s+(.*)$', l)
    if not m:
        continue
    sea, day, name = m.group(1), int(m.group(2)), m.group(3).strip()
    if not name:
        continue
    events.setdefault(sea, []).append((day, name))

cal = []
for sea in order:
    items = sorted(events.get(sea, []), key=lambda x: x[0])
    parts = []
    for d, n in items:
        if n.endswith('的生日'):
            n = n[:-3] + '(生日)'
        parts.append(f'{d} {n}')
    cal.append([sea, '　'.join(parts) if parts else '—'])

# ---- 生日送礼偏好：1578 ~ 1601 ----
bgift = []
for l in lines[1578:1602]:
    if '\t' not in l:
        continue
    c = [x.strip() for x in l.split('\t')]
    if len(c) >= 2 and c[0] and c[1]:
        bgift.append([c[0], c[1]])

out = ("/* RF3 全年日程与生日送礼偏好\n"
       "   取自《符文工房3全攻略》「日历」章节（UTF-16 文本，季X 行的具体日期 + 1578-1601 生日礼物偏好表）\n"
       "   RF3_CAL:   [季节, '日期 事件 ...']（事件含生日时写作「名(生日)」）\n"
       "   RF3_BGIFT: [角色, 最爱礼物] */\n")
out += "const RF3_CAL = " + json.dumps(cal, ensure_ascii=False) + ";\n"
out += "const RF3_BGIFT = " + json.dumps(bgift, ensure_ascii=False) + ";\n"

open('js/rf3cal.js', 'w', encoding='utf-8').write(out)
print('RF3_CAL seasons:', len(cal))
for c in cal:
    print(' ', c[0], len(c[1]), 'chars ->', c[1][:50])
print('RF3_BGIFT:', len(bgift), bgift[:3])
