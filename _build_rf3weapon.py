# -*- coding: utf-8 -*-
# 构建 js/rf3weapon.js —— 符文工房3（RF3）武器数值表 EQW_RF3
# 数据源：biligame 符文工厂 wiki《RF3weapon》页（完整 218 条武器数据）
# 字段（RF5 兼容 8 字段格式，与 EQW_RF5 一致）：
#   [中文名, 种类, 属性, 物攻, 魔攻, 占位, 暴击, 眩晕]
#   - 占位(r[5])：RF5 渲染分支未使用，填 '—'
#   - RF3 原表无「暴击／眩晕」列，r[6]/r[7] 填 '—'（页面 nz 后显示 —）
# 处理规则：
#   - 排除农具类（农具锤／农具斧／镰刀／洒水壶／锄头／钓竿）：属农具，归 tool 页，不在武器页列
#   - 种类标准化：战斗锤→锤、战斗斧→斧、杖→魔杖（对齐 RF5 渲染分支的 RAW 种类列表）
#   - 属性 '—' 表示无属性
#   - 攻击／魔攻：原表为数字字符串，空或 '—' 填 '—'
import re, os

SRC = r"G:/wit_tools/work/RF_WIKI/_tmp_rf3weapon.html"
OUT = r"G:/wit_tools/work/RF_WIKI/js/rf3weapon.js"
TOOL = {'农具锤', '农具斧', '镰刀', '洒水壶', '锄头', '钓竿'}
NORM = {'战斗锤': '锤', '战斗斧': '斧', '杖': '魔杖'}


def cells(row):
    return [re.sub(r'<[^>]+>', '', c).strip()
            for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.S)]


def main():
    html = open(SRC, encoding='utf-8', errors='ignore').read()
    tables = re.findall(r'<table.*?</table>', html, re.S)
    rows = re.findall(r'<tr.*?</tr>', tables[0], re.S)
    data = rows[1:]
    out = []
    skipped_tool = 0
    for r in data:
        c = cells(r)
        if len(c) < 11:
            continue
        kind = c[0]
        if kind in TOOL:
            skipped_tool += 1
            continue
        name = c[1]
        attr = c[4] if c[4] else '—'
        atk = int(c[5]) if c[5].isdigit() else '—'
        matk = int(c[6]) if c[6].isdigit() else '—'
        k = NORM.get(kind, kind)
        out.append([name, k, attr, atk, matk, '—', '—', '—'])
    # 写 js
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write("// RF3 武器数值表 —— 数据源：biligame 符文工厂 wiki《RF3weapon》完整 218 条武器\n")
        f.write("// 字段：[中文名, 种类, 属性, 物攻, 魔攻, 占位, 暴击, 眩晕]\n")
        f.write("// 处理：排除农具类（农具锤／农具斧／镰刀／洒水壶／锄头／钓竿，归 tool 页）；\n")
        f.write("//       种类标准化 战斗锤→锤、战斗斧→斧、杖→魔杖（对齐 RF5 渲染分支 RAW 列表）；\n")
        f.write("//       RF3 原表无暴击／眩晕列，r[6]/r[7] 填 '—'；属性 '—' 为无属性。\n")
        f.write("const EQW_RF3 = [\n")
        for o in out:
            vals = []
            for v in o:
                vals.append(str(v) if isinstance(v, int) else ("'" + v + "'"))
            f.write("  [" + ", ".join(vals) + "],\n")
        f.write("];\n")
    print("wrote", OUT, "weapons:", len(out), "skipped_tool:", skipped_tool)


if __name__ == '__main__':
    main()
