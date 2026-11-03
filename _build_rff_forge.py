# -*- coding: utf-8 -*-
"""生成 js/rffforge.js —— 符文工房 边境（Rune Factory Frontier）锻造配方。
源：runefrontier.fandom.com/wiki/Recipe_Books（边境专属配方书页，经 WebSearch 缓存核对；
    fandom 直连被本环境网络策略拦截）。
铁律：只录源站明确给出的配方／材料／锻造等级；法杖两列技能无法区分故不列；未收项如实注明，不臆造。
"""
from json import dumps

SRC = "runefrontier.fandom.com/wiki/Recipe_Books（符文工房 边境 配方书页，WebSearch 缓存核对）"

NOTE = ("本页收的是「配方书 → 配方 → 材料」这三层，来自边境专属的 Recipe Books 页。"
        "武器类的锻造等级取源表单列值——源表文本抽取时相邻行首尾重复，取每行首值即得单列；"
        "并以 IGN 边境攻略独立核对：Flame Sabre=20、Defender=45、Durandel=48、Dragonslayer=75、Smash Blade=80、Rune Blade=95 全部吻合。"
        "法杖类源表每行附两个数字（魔力技能＋锻造技能），无法可靠区分哪个是哪个，故只列配方与材料。"
        "未收：进阶双手剑配方书、盾／饰品／药学配方书（源页该部分未完整抓取，待补）；材料名为源站英文原名，未译。")

COLS_W = ["配方", "材料", "锻造Lv"]
COLS_S = ["配方", "材料"]

FAMILIES = [
    ("单手剑（初级）· 武器を作ろう！1,000G", COLS_W, [
        ["Broadsword", "Iron, Knife Piece", "3"],
        ["Scimitar", "Broadsword, Copper", "10"],
        ["Windsword", "Broadsword, Wind Crystal", "20"],
        ["Aquasword", "Broadsword, Water Crystal", "22"],
    ]),
    ("双手剑（初级）· 武器を作ろう！1,000G", COLS_W, [
        ["Two-handed Sword", "Broadsword, Iron", "5"],
        ["Great Sword", "Two-handed Sword, Copper", "9"],
        ["Earth Shade", "Two-handed Sword, Earth Crystal", "19"],
        ["Flame Sabre", "Two-handed Sword, Fire Crystal", "20"],
    ]),
    ("枪 · 武器を作ろう！1,000G", COLS_W, [
        ["Spear", "Iron, Thin Stick", "7"],
        ["Pitch Fork", "Spear, Sharp Talon", "12"],
        ["Lance", "Spear, Copper", "16"],
        ["Poison Spear", "Spear, Copper, Toxin", "21"],
    ]),
    ("锤 · 武器を作ろう！1,000G", COLS_W, [
        ["Battle Hammer", "Iron, Iron", "8"],
        ["War Hammer", "Battle Hammer, Copper", "14"],
        ["Schnabel", "Battle Hammer, Copper, Toxin", "20"],
        ["Ice Hammer", "Battle Hammer, Water Crystal", "26"],
    ]),
    ("斧 · 武器を作ろう！1,000G", COLS_W, [
        ["Battle Axe", "Iron, Sharp Talon", "9"],
        ["Great Axe", "Battle Axe, Copper", "15"],
        ["Heat Axe", "Battle Axe, Fire Crystal", "21"],
        ["Tomahawk", "Battle Axe, Bird Feather, Wind Crystal", "27"],
        ["Tomahawk", "Battle Axe, Giant Cockscomb", "27"],
    ]),
    ("法杖 · 魔法杖作り 2,000G（只列配方与材料）", COLS_S, [
        ["Fire Rod", "Fire Crystal, Iron"],
        ["Earth Wand", "Earth Crystal, Thin Stick"],
        ["Storm Rod", "Wind Crystal, Iron"],
        ["Water Rod", "Water Crystal, Iron, Teardrop"],
        ["Hell Branch", "Fire Crystal, Magic Powder, Ruby, Thin Stick"],
        ["Gaea Rod", "Earth Crystal, Magic Powder, Root, Thin Stick"],
        ["Wind Rod", "Wind Crystal, Magic Powder, Copper, Emerald"],
        ["Bubble Staff", "Water Crystal, Magic Crystal, Silver, Aquamarine, Thin Stick, Fish Fossil"],
        ["Meteor Cane", "Earth Crystal, Magic Crystal, Gold, Amethyst, Thick Stick, Root"],
        ["Crimson Stick", "Fire Crystal, Magic Crystal, Gold, Ruby, Quality Cloth, Thin Stick"],
        ["Cyclone Rod", "Wind Crystal, Magic Crystal, Gold, Emerald, Bird Feather, Quality Cloth"],
    ]),
    ("单手剑（进阶）· 10,000G", COLS_W, [
        ["Gladius", "Broadsword, Silver, Iron", "18"],
        ["Cutlass", "Scimitar, Silver, Solid Point", "25"],
        ["Luck Blade", "Scimitar, Silver, Ruby, Amethyst", "35"],
        ["Sakura", "Aquasword, Silver, Glittering Edge, Toxin", "38"],
        ["Defender", "Gladius, Gold, Turtle Shell, Insect Hide, Glue", "45"],
        ["Durandel", "Cutlass, Gold, Glittering Edge, Knife Piece, Warrior Medal", "48"],
        ["Aerial Blade", "Windsword, Gold, Wind Crystal, Bird Feather, Emerald", "52"],
        ["Aerial Blade", "Windsword, Gold, Giant Cockscomb", "52"],
        ["Icifier", "Aquasword, Gold, Water Crystal, Teardrop, Aquamarine", "54"],
        ["Souleater", "Sakura, Platinum, Magic Talon, Sharp Fang, Magic Crystal, Fairy Dust", "70"],
        ["Dragonslayer", "Defender, Durandel, Platinum, Magic Talon, Sharp Fang, Wet Scale", "75"],
        ["Smash Blade", "Luck Blade, Platinum, Magic Talon, Sharp Talon, Glittering Edge, Little Crystal", "80"],
        ["Rune Blade", "Dragonslayer, Little Crystal, Water Rune Stone, Rock Rune Stone, Tree Rune Stone, Grass Rune Stone", "95"],
    ]),
]

OUT = "js/rffforge.js"


def jv(v):
    return dumps(v, ensure_ascii=False)


def build():
    fams = []
    for name, cols, rows in FAMILIES:
        fams.append({
            "name": name,
            "cols": cols,
            "rows": rows,
        })
    obj = {"src": SRC, "note": NOTE, "families": fams}
    body = dumps(obj, ensure_ascii=False, indent=1)
    js = ("// 由 _build_rff_forge.py 生成｜符文工房 边境（Rune Factory Frontier）锻造配方\n"
          "// 源：runefrontier.fandom.com/wiki/Recipe_Books（WebSearch 缓存核对）\n"
          "const RFF_FORGE = " + body + ";\n")
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(js)
    total = sum(len(r) for _, _, r in FAMILIES)
    print("wrote", OUT, "| families:", len(FAMILIES), "| rows:", total)


if __name__ == "__main__":
    build()
