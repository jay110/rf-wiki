# -*- coding: utf-8 -*-
"""无依赖 xlsx 读取器：zipfile + ElementTree"""
import sys, zipfile, re
import xml.etree.ElementTree as ET

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
RNS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def col2idx(ref):
    m = re.match(r'([A-Z]+)', ref)
    c = 0
    for ch in m.group(1):
        c = c * 26 + (ord(ch) - 64)
    return c - 1


def load(path):
    z = zipfile.ZipFile(path)
    # shared strings
    sst = []
    if 'xl/sharedStrings.xml' in z.namelist():
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.findall(NS + 'si'):
            sst.append(''.join(t.text or '' for t in si.iter(NS + 't')))
    # workbook sheets
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid2t = {}
    for r in rels:
        rid2t[r.get('Id')] = r.get('Target')
    sheets = []
    for sh in wb.find(NS + 'sheets'):
        name = sh.get('name')
        rid = sh.get(RNS + 'id')
        tgt = rid2t[rid]
        if not tgt.startswith('xl/'):
            tgt = 'xl/' + tgt.lstrip('/')
        sheets.append((name, tgt))
    return z, sst, sheets


def rows(z, sst, target):
    root = ET.fromstring(z.read(target))
    data = root.find(NS + 'sheetData')
    out = []
    for row in data.findall(NS + 'row'):
        cells = {}
        for c in row.findall(NS + 'c'):
            ref = c.get('r')
            t = c.get('t')
            v = c.find(NS + 'v')
            if t == 'inlineStr':
                isn = c.find(NS + 'is')
                val = ''.join(x.text or '' for x in isn.iter(NS + 't')) if isn is not None else ''
            elif v is None:
                val = ''
            elif t == 's':
                val = sst[int(v.text)]
            else:
                val = v.text
            cells[col2idx(ref)] = val
        if cells:
            n = max(cells) + 1
            out.append([cells.get(i, '') for i in range(n)])
    return out


if __name__ == '__main__':
    path = sys.argv[1]
    z, sst, sheets = load(path)
    print('SHEETS:', [s[0] for s in sheets])
    lim = int(sys.argv[2]) if len(sys.argv) > 2 else 6
    for name, tgt in sheets:
        rs = rows(z, sst, tgt)
        print('=' * 20, name, 'rows=', len(rs))
        for r in rs[:lim]:
            print(' | '.join((x or '')[:60] for x in r))
