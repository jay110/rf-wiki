# -*- coding: utf-8 -*-
"""生成 js/rfoforge.js —— 符文工房 海洋（RFO / Rune Factory: Tides of Destiny）锻造配方表。

单一来源：crimsontear.com《Rune Factory: Tides of Destiny》Game Guide → recipes/forge
（该页为纯文本展平表，各类武器列数不同；本脚本按「原表有什么列就出什么列」录入，
 不给缺失的列补 0，也不把 '-' 改写成数字。）

本文件只做搬运与归一（配方书 Lv 前缀剥离、材料连接符统一），不做跨源裁决。
"""
import io, json

SRC = "crimsontear.com《Rune Factory: Tides of Destiny》Game Guide「recipes/forge」（2026-11 取）"

NOTE = (
    "共 10 类 147 条。各类武器原表的列数并不统一：斧／锤／双手剑／镰刀有「攻·防·魔攻·魔防」四列，"
    "双剑／武士刀／长枪只有「攻击·魔防」两列，法杖是「攻击·魔攻·魔防」三列，魔杖只有「魔攻·魔防」两列，"
    "钓竿则完全没有战斗属性也没有效果列。本站按原表实际列数出表，缺的列不补、不当成 0。"
    "「配方书」取自原表最后一列，只剥掉与类目重复的前缀（原表写「Axes Lv 1」，本站记「Lv1」），LvS 为最高级配方书。"
    "「价值」是原表的 Value 列（物品价值），不是商店买价，本页不据此换算任何买卖价。"
)

WARNS = [
    "原表把双剑 Legendary Blades、双手剑 Legendary Sword、长枪 Legion 这三条（各类的最终武器）都标成「Lv 2」，"
    "而 fogu／IGN 的配方书清单里，最终武器对应的是 Lv S 配方书。两源不一，本页照原表录 Lv2，这一条按「跨源矛盾照录」留在原文。",
    "锤表里 Heavy Hammer（锻造 Lv 39）的配方要 Spiked Hammer（锻造 Lv 45），低等级的反而要高等级的成品，原表即如此，未做调整。",
    "原文拼写照录，未改动：镰刀 Super Sickle 的材料写「Sharp Talpn」，长枪 Legion 的效果写「Elemnetal Defense」，"
    "魔杖第二条写「Sappling Spirit Wand」。",
    "原表把 Flamberge 也写成「Flameberge」、把 Icifier 写成「Icifer」（出现在双手剑 Tyrling／Malmung 的材料里与 Omni-Elemental 的材料里），"
    "同一件东西两种拼法并存，照录。",
    "双手剑的 Tyrling／Malmung 与 GameFAQs 同名条目（Tyrfing／Balmung）拼法不同，两源不一，本页照 crimsontear 的写法。",
    "钓竿、魔杖原表没有「效果」列，故这两类的表比别类少两列；双剑的 Broad Edge 等条目在原表里效果栏就是一个「-」，本站记作「—」。",
]

# ---------------------------------------------------------------- 列定义
C10 = ["名称", "锻造Lv", "攻击", "防御", "魔攻", "魔防", "价值", "效果", "材料", "配方书"]
C8 = ["名称", "锻造Lv", "攻击", "魔防", "价值", "效果", "材料", "配方书"]          # 双剑／武士刀／长枪
C9 = ["名称", "锻造Lv", "攻击", "魔攻", "魔防", "价值", "效果", "材料", "配方书"]   # 法杖
C7 = ["名称", "锻造Lv", "魔攻", "魔防", "价值", "材料", "配方书"]                   # 魔杖
C5 = ["名称", "锻造Lv", "价值", "材料", "配方书"]                                 # 钓竿

# ---------------------------------------------------------------- 数据
# 10 列：名称, 锻造Lv, 攻, 防, 魔攻, 魔防, 价值, 效果, 材料, 配方书(原表原文)
AXES = [
    ("Rusty Axe", "02", "13", "0", "0", "0", "100 G", "Plant Killer 10%", "Iron, Thin Stick", "Axes Lv 1"),
    ("Battle Axe", "05", "19", "0", "0", "0", "100 G", "HP Absorption 2%", "Iron, Sharp Talon", "Axes Lv 1"),
    ("Chopping Axe", "09", "23", "0", "0", "0", "180 G", "Giant Killer 10%", "Rusty Axe, Iron", "Axes Lv 1"),
    ("Chopping Axe Upgrade", "15", "23", "0", "0", "0", "180 G", "Giant Killer 10%", "Chopping Axe, Scrap Metal (2)", "Axes Lv 1"),
    ("Great Axe", "15", "30", "0", "0", "0", "240 G", "Animal Killer 10%; Paralysis Attack 20%", "Battle Axe, Bronze", "Axes Lv 1"),
    ("Tomahawk", "16", "36", "0", "0", "0", "360 G", "Giant Killer 10%; Wind Attack +10", "Battle Axe, Bird Feather, Wind Crystal", "Axes Lv 1"),
    ("Heat Axe", "21", "56", "0", "0", "0", "510 G", "Poison Attack 20%; Fire Attack +15", "Battle Axe, Fire Crystal, Silver", "Axes Lv 1"),
    ("Lumber Axe", "25", "70", "0", "0", "0", "670 G", "Animal Killer 15%", "Chopping Axe, Silver, Thin Stick, Sharp Talon", "Axes Lv 1"),
    ("Alldale", "37", "78", "0", "0", "0", "950 G", "Seal Attack 30%", "Battle Axe, Gold, Proof of Warrior, Knife Piece", "Axes Lv 1"),
    ("Critical Axe", "41", "81", "0", "0", "0", "950 G", "Fatigue Attack 10%", "Tomahawk, Earth Crystal, Water Crystal, Fire Crystal", "Axes Lv 2"),
    ("Crescent Axe", "45", "84", "0", "0", "0", "1100 G", "Paralysis Attack 30%; HP Absorption 2%", "Great Axe, Silver, Glittering Edge, Moondrop", "Axes Lv 2"),
    ("Mountain Axe", "47", "91", "0", "0", "0", "1800 G", "Max HP +100; Magician Killer 15%", "Lumber Axe, Gold, Thick Stick, Glittering Edge", "Axes Lv 2"),
    ("Passion", "51", "99", "0", "0", "0", "2000 G", "Sleep Attack 20%", "Maple, Glue, Gold, Sharp Talon", "Axes Lv 2"),
    ("Flame Axe", "55", "106", "0", "0", "0", "2400 G", "Seal Attack 20%; Fire Attack +15", "Heat Axe, Gold, Fire Crystal, Ruby", "Axes Lv 2"),
    ("Demon Axe", "60", "118", "0", "0", "0", "2000 G", "Sleep Attack 20%; Poison Attack 30%", "Alldale, Gold, Devil Blood, Magic Talon, Toxin", "Axes Lv 2"),
    ("Flame Tomahawk", "65", "124", "0", "0", "0", "2000 G", "Paralysis Attack 20%; Fire Attack +20", "Tomahawk, Heat Axe, Gold, Magic Talon, Glittering Edge", "Axes Lv 2"),
    ("Miracle Axe", "72", "134", "0", "0", "0", "3000 G", "Max RP +100", "Mountain Axe, Platinum, Root, Noel Flower, Magic Talon, Small Crystal", "Axes Lv 2"),
    ("Double Edge", "81", "145", "0", "0", "0", "2950 G", "Sleep Attack 20%; Paralysis Attack 30%", "Crescent Axe (2), Platinum, Magic Talon, Speckled Skin, Small Crystal", "Axes Lv 3"),
    ("Executioner", "91", "178", "0", "0", "0", "5000 G", "Seal Attack 50%; Seal Resist", "Demon Axe, Platinum, Magic Talon, Glittering Edge, Sharp Fang, Small Crystal", "Axes Lv 3"),
    ("Legendary Axe", "95", "220", "0", "0", "0", "10500 G", "HP Absorption 2%; Stun Attack 10%", "Executioner, Sapphire, Ruby, Aquamarine, Light Crystal", "Axes Lv S"),
]

# 8 列：名称, 锻造Lv, 攻, 魔防, 价值, 效果, 材料, 配方书
DUAL = [
    ("Broad Edge", "01", "7", "0", "100 G", "-", "Iron, Knife Piece", "Dual Blade Lv 1"),
    ("Scimitar", "10", "9", "0", "180 G", "-", "Broad Edge, Bronze", "Dual Blade Lv 1"),
    ("Back Scratcher", "15", "10", "0", "740 G", "Fatigue Attack 20%; Fatigue Resist", "Thin Stick (2), Sharp Talon (2)", "Dual Blade Lv 1"),
    ("Cutlass", "18", "13", "0", "360 G", "Water Defense +10", "Scimitar, Silver, Solid Point", "Dual Blade Lv 1"),
    ("Wind Edge", "20", "18", "2", "620 G", "Wind Attack +5", "Broad Edge, Wind Crystal", "Dual Blade Lv 1"),
    ("Aqua Edge", "22", "22", "3", "620 G", "Water Attack +10; Water Defense +10", "Broad Edge, Water Crystal", "Dual Blade Lv 1"),
    ("Gladius", "25", "30", "0", "270 G", "Seal Resist", "Broad Edge, Silver, Iron", "Dual Blade Lv 1"),
    ("Luck Blades", "35", "36", "0", "710 G", "Poison Resist", "Scimitar, Amethyst", "Dual Blade Lv 1"),
    ("Sakura", "38", "48", "0", "890 G", "HP Absorption 3%; Poison Attack 10%", "Aqua Edge, Silver, Glittering Edge, Toxin", "Dual Blade Lv 1"),
    ("Sparklers", "40", "49", "0", "2000 G", "Fire Attack +10", "Back Scratcher, Silver, Quality Cloth, Fire Crystal", "Dual Blade Lv 1"),
    ("Aerial Blades", "44", "55", "0", "1570 G", "Wind Attack +10; Seal Attack 10%", "Wind Edge, Gold, Wind Crystal, Bird Feather", "Dual Blade Lv 1"),
    ("Defender", "48", "62", "10", "660 G", "Stamina +20", "Gladius, Gold, Tortoise Shell, Insect Skin, Glue", "Dual Blade Lv 3"),
    ("Durandel", "55", "75", "0", "730 G", "-", "Cutlass, Gold, Glittering Edge, Knife Piece, Proof of Warrior", "Dual Blade Lv 3"),
    ("Icifer", "61", "86", "10", "1570 G", "Water Attack +10; Paralysis Attack 10%", "Aqua Edge, Gold, Water Crystal, Teardrop, Aquamarine", "Dual Blade Lv 3"),
    ("Soul Eater", "70", "91", "0", "1700 G", "Dark Attack +20; Dark Defense +20", "Sakura, Platinum, Magic Talon, Sharp Fang, Magic Crystal, Fairy Dust", "Dual Blade Lv 3"),
    ("Dragon Slayer", "75", "97", "0", "6000 G", "Paralysis Attack 10%; Fatigue Attack 5%", "Defender, Durandel, Platinum, Magic Talon, Sharp Fang, Wet Scale", "Dual Blade Lv 3"),
    ("Smash Blades", "82", "110", "0", "5000 G", "Poison Resist; Seal Resist", "Luck Blades, Platinum, Magic Talon, Sharp Talon, Glittering Edge, Small Crystal", "Dual Blade Lv S"),
    ("Rune Blades", "90", "130", "0", "10000 G", "Light Attack +30", "Dragon Slayer, Small Crystal, Green Spirit, Red Spirit, Yellow Spirit, Blue Spirit", "Dual Blade Lv S"),
    ("Legendary Blades", "95", "164", "20", "12000 G", "Paralysis Attack 100%", "Rune Blade, Emerald, Sapphire, Aquamarine, Light Crystal", "Dual Blade Lv 2"),
]

# 5 列：名称, 锻造Lv, 价值, 材料, 配方书
POLES = [
    ("Cheap Pole", "10", "120 G", "Thin Stick, Cheap Cloth", "Fishing Pole Lv 1"),
    ("Beginner's Pole", "15", "200 G", "Cheap Pole, Cheap Cloth", "Fishing Pole Lv 1"),
    ("Intermediate Pole", "25", "600 G", "Beginner's Pole, Silver, Thin Stick", "Fishing Pole Lv 1"),
    ("Famous Pole", "60", "1500 G", "Intermediate Pole, Gold, Fish Fossil, Fairy Dust", "Fishing Pole Lv 2"),
    ("Sacred Pole", "95", "4000 G", "Famous Pole, Platinum, Sharp Fang, Wet Scale", "Fishing Pole Lv S"),
]

# 10 列
HAMMERS = [
    ("Cheap Hammer", "02", "13", "0", "0", "0", "100 G", "Stun Attack 10%; Max HP +20", "Thin Stick (2)", "Hammer Lv 1"),
    ("Battle Hammer", "05", "19", "0", "0", "0", "100 G", "Stun Attack 15%", "Iron (2)", "Hammer Lv 1"),
    ("Iron Hammer", "08", "22", "0", "0", "0", "240 G", "Stun Attack 15%", "Cheap Hammer, Iron", "Hammer Lv 1"),
    ("War Hammer", "14", "30", "0", "0", "0", "900 G", "Stun Attack 10%; Fatigue Attack 5%", "Battle Hammer, Bronze", "Hammer Lv 1"),
    ("Ice Hammer", "17", "35", "0", "0", "0", "900 G", "Stun Attack 15%; Water Attack +20", "Battle Hammer, Water Crystal", "Hammer Lv 1"),
    ("Schnabel", "20", "45", "0", "0", "0", "240 G", "Stun Attack 10%; Poison Attack 20%", "Battle Hammer, Bronze, Toxin", "Hammer Lv 1"),
    ("Battle Fan", "22", "47", "0", "0", "0", "670 G", "Stun Attack 30%; Seal Attack 20%", "Yarn Ball, Pom-Pom Flower, Quality Cloth, Glue", "Hammer Lv 1"),
    ("Silver Hammer", "25", "54", "0", "0", "0", "1500 G", "Stun Attack 17%; Max RP +30", "Iron Hammer, Silver (2), Insect Skin", "Hammer Lv 1"),
    ("Great Hammer", "38", "68", "0", "0", "0", "950 G", "Stun Attack 20%; Paralysis Attack 30%", "War Hammer, Silver, Proof of Warrior", "Hammer Lv 1"),
    ("Heavy Hammer", "39", "71", "0", "0", "0", "2500 G", "Stun Attack 50%", "Spiked Hammer, Silver, Hard Horn (2)", "Hammer Lv 1"),
    ("Spiked Hammer", "45", "76", "0", "0", "0", "1100 G", "Stun Attack 20%", "War Hammer, Silver, Tortoise Shell, Hard Horn", "Hammer Lv 1"),
    ("Gold Hammer", "47", "82", "0", "0", "0", "2000 G", "Stun Attack 17%", "Silver Hammer, Gold (2), Sapphire, Wet Scale", "Hammer Lv 2"),
    ("Sky Hammer", "56", "90", "0", "0", "0", "2000 G", "Stun Attack 10%; Wind Attack +20", "Schnabel, Gold, Bird Feather, Wind Crystal", "Hammer Lv 2"),
    ("Gravit Hammer", "62", "104", "0", "0", "0", "3000 G", "Stun Attack 10%; Paralysis Attack 20%", "Great Hammer, Gold, Earth Crystal, Fairy Dust, Thick Stick", "Hammer Lv 2"),
    ("Crystal Hammer", "65", "116", "0", "0", "0", "5000 G", "Stun Attack 10%; Water Attack +20", "Ice Hammer, Gold, Water Crystal, Speckled Skin, Wet Scale", "Hammer Lv 2"),
    ("Platinum Hammer", "72", "122", "0", "0", "0", "5820 G", "Stun Attack 20%", "Gold Hammer, Platinum (2), Fireflower, Speckled Skin, Small Crystal", "Hammer Lv 2"),
    ("Gigant Hammer", "82", "132", "0", "0", "0", "6500 G", "Stun Attack 15%; Fatigue Attack 10%", "Great Hammer, Platinum (2), Quality Fur, Thick Stick, Small Crystal", "Hammer Lv 3"),
    ("Myurnil", "93", "176", "0", "0", "0", "7000 G", "Stun Attack 20%; Seal Attack 20%", "Gravit Hammer, Platinum, Earth Crystal, Magic Crystal, Tortoise Shell, Small Crystal", "Hammer Lv 3"),
    ("Legendary Hammer", "95", "218", "0", "0", "0", "10500 G", "Stun Attack 50%; Fatigue Attack 10%", "Myurnil, Diamond (3), Light Crystal", "Hammer Lv S"),
]

# 8 列
KATANAS = [
    ("Burai", "09", "6", "0", "160 G", "Max RP +20", "Iron, Knife Piece", "Katana Lv 1"),
    ("Skanda", "16", "14", "2", "240 G", "Wind Attack +10; Wind Defense +10", "Burai, Wind Crystal", "Katana Lv 1"),
    ("Basara", "24", "18", "0", "420 G", "Paralysis Attack 10%; Paralysis Resist", "Burai, Magic Powder", "Katana Lv 1"),
    ("Tsuchigumo", "30", "20", "3", "670 G", "Earth Attack +10; Earth Defense +5", "Burai, Bronze, Earth Crystal", "Katana Lv 1"),
    ("Shimohana", "37", "24", "2", "950 G", "Water Attack +10; Water Defense +20", "Skanda, Silver, Water Crystal", "Katana Lv 1"),
    ("Setsuna", "41", "32", "0", "950 G", "Seal Attack 10%", "Basara, Silver, Magic Powder", "Katana Lv 1"),
    ("Onibi", "45", "38", "3", "950 G", "Fire Attack +10; Fire Defense +5", "Tsuchigumo, Silver, Fire Crystal", "Katana Lv 1"),
    ("Yaksha", "54", "50", "3", "1100 G", "Dark Attack +20; Dark Defense +10", "Setsuna, Gold, Dark Crystal", "Katana Lv 1"),
    ("Dancing Wind", "60", "56", "4", "1540 G", "Wind Attack +20; Wind Defense +10", "Skanda, Gold, Wind Crystal", "Katana Lv 1"),
    ("Shiranui", "66", "61", "0", "1600 G", "Poison Attack 10%; Stun Resist", "Yaksha, Gold, Fairy Dust, Magic Powder", "Katana Lv 2"),
    ("Guren", "72", "67", "5", "1800 G", "Fire Attack +20; Fire Defense +10", "Onibi, Gold, Fire Crystal", "Katana Lv 2"),
    ("Asura", "81", "70", "0", "2000 G", "Fatigue Attack 5%", "Yaksha, Platinum, Quality Cloth, Fairy Dust, Glue", "Katana Lv 2"),
    ("Yumeoboro", "82", "78", "0", "3000 G", "Sleep Attack +10%", "Shiranui, Platinum, Magic Crystal, Fairy Dust", "Katana Lv 2"),
    ("Tenbu", "84", "90", "4", "3500 G", "Light Attack +20; Light Defense +10", "Yaksha, Platinum, Gold, Light Crystal", "Katana Lv 2"),
    ("Musou", "87", "92", "6", "5820 G", "Earth Attack +20", "Tsuchigumo, Platinum, Gold, Earth Crystal", "Katana Lv 3"),
    ("Yuuhi", "88", "101", "7", "6000 G", "Water Attack +20; Water Defense +10", "Shimohana, Platinum (2), Gold, Water Crystal", "Katana Lv 3"),
    ("Rakshasa", "90", "114", "6", "8250 G", "Dark Attack +30; Dark Defense +20", "Yaksha, Platinum (2), Gold, Dark Crystal", "Katana Lv 3"),
    ("Shinza", "94", "138", "10", "10500 G", "Instant Death 1%; Poison Attack 10%", "Tenbu, Platinum (2), Light Crystal (2)", "Katana Lv 3"),
    ("Muramasa", "95", "175", "20", "12000 G", "Instant Death 5%; Paralysis Attack 10%", "Shinza, Aquamarine, Sapphire, Emerald, Light Crystal, Small Crystal", "Katana Lv S"),
]

# 10 列
LONGS = [
    ("Zweihander", "05", "9", "0", "0", "0", "160 G", "-", "Iron (2)", "Longsword Lv 1"),
    ("Greatsword", "09", "16", "0", "0", "0", "240 G", "Fatigue Attack 5%", "Zweihander, Bronze", "Longsword Lv 1"),
    ("Tachi", "16", "18", "0", "0", "0", "300 G", "Paralysis Resist", "Iron, Cheap Cloth, Insect Jaw", "Longsword Lv 1"),
    ("Earth Shade", "19", "24", "0", "0", "0", "690 G", "Earth Attack +10", "Zweihander, Earth Crystal", "Longsword Lv 1"),
    ("Dancing Dicer", "24", "30", "0", "0", "0", "350 G", "Paralysis Resist; Seal Attack 10%", "Tachi, Bronze, Knife Piece", "Longsword Lv 1"),
    ("Eye Blade", "29", "38", "0", "0", "0", "670 G", "Paralysis Resist; Paralysis Attack 10%", "Dancing Dicer, Silver, Speckled Skin, Sapphire", "Longsword Lv 1"),
    ("Big Flag", "31", "40", "0", "0", "0", "2000 G", "Stun Attack 20%; Sleep Resist", "Fall Flower, Quality Cloth, Thin Stick, Glue", "Longsword Lv 1"),
    ("Claymore", "35", "45", "0", "0", "0", "420 G", "Fatigue Attack 10%", "Greatsword, Silver, Sharp Fang", "Longsword Lv 1"),
    ("Flamberge", "40", "58", "0", "0", "4", "950 G", "Fire Defense +10", "Greatsword, Gold, Fire Crystal, Glittering Edge", "Longsword Lv 1"),
    ("Flame Sabre", "45", "64", "0", "0", "4", "690 G", "Fire Attack +15; Fire Defense +15", "Zweihander, Gold, Fire Crystal", "Longsword Lv 1"),
    ("Shine Blade", "55", "70", "0", "0", "15", "1740 G", "Fire Attack +20; Fatigue Attack 10%", "Flame Sabre, Gold, Fire Crystal, Ruby", "Longsword Lv 3"),
    ("Grand Smasher", "61", "80", "0", "0", "0", "1740 G", "Earth Attack +20; Paralysis Attack 15%", "Earth Shade, Platinum, Earth Crystal, Diamond, Root", "Longsword Lv 3"),
    ("Lunar Eclipse", "63", "89", "0", "0", "0", "2500 G", "Paralysis Resist; Stun Attack 15%", "Eye Blade, Platinum, Sharp Fang, Magic Talon, Moondrop", "Longsword Lv 3"),
    ("Tyrling", "67", "100", "0", "0", "0", "4000 G", "Seal Attack 15%; Element Defense +10", "Flameberge, Platinum, Glittering Edge, Silver (2)", "Longsword Lv 3"),
    ("Malmung", "70", "108", "0", "0", "0", "6000 G", "Fatigue Resist", "Flameberge, Platinum (2), Gold, Sapphire", "Longsword Lv 3"),
    ("Omni-Elemental", "77", "114", "0", "0", "20", "7500 G", "Element Attack +10; Element Defense +10", "Shine Blade, Grand Smasher, Icifer, Aerial Blades, Platinum, Small Crystal", "Longsword Lv 3"),
    ("Steel Sushir", "83", "128", "0", "0", "0", "8250 G", "Paralysis Resist; Stun Resist", "Lunar Eclipse, Platinum, Silver, Glittering Edge, Small Crystal", "Longsword Lv S"),
    ("Heaven's Tear", "90", "152", "0", "0", "0", "10500 G", "Wind Attack +20; Wind Defense +20", "Lunar Eclipse, Claymore, Platinum, Pink Cat, Charm Blue, Small Crystal", "Longsword Lv S"),
    ("Legendary Sword", "95", "190", "0", "0", "20", "12000 G", "Fatigue Attack 10%; Poison Attack 10%", "Heaven's Tear, Sapphire, Ruby, Diamond, Light Crystal", "Longsword Lv 2"),
]

# 10 列（镰刀战斗属性全 0）
SICKLES = [
    ("Rusty Sickle", "02", "0", "0", "0", "0", "100 G", "-", "Iron, Thin Stick", "Sickles Lv 1"),
    ("Iron Sickle", "05", "0", "0", "0", "0", "200 G", "-", "Rusty Sickle, Iron", "Sickles Lv 1"),
    ("Iron Sickle Upgrade", "15", "0", "0", "0", "0", "200 G", "-", "Iron Sickle, Scrap Metal (2)", "Sickles Lv 1"),
    ("Quality Sickle", "25", "0", "0", "0", "0", "400 G", "-", "Iron Sickle, Silver, Knife Piece, Cheap Cloth", "Sickles Lv 1"),
    ("Quality Sickle Upgrade", "25", "0", "0", "0", "0", "400 G", "-", "Quality Sickle, Scrap Metal (2)", "Sickles Lv 1"),
    ("Super Sickle", "60", "0", "0", "0", "0", "1000 G", "-", "Quality Sickle, Gold, Emerald, Sharp Talpn, Quality Cloth", "Sickles Lv 2"),
    ("Super Sickle Upgrade", "70", "0", "0", "0", "0", "1000 G", "-", "Super Sickle, Scrap Metal (2)", "Sickles Lv 2"),
    ("Legend Sickle", "95", "0", "0", "0", "0", "2000 G", "-", "Super Sickle, Platinum, Wind Crystal, Silver, Glittering Edge, Magic Talon", "Sickles Lv S"),
]

# 8 列
SPEARS = [
    ("Spear", "07", "7", "0", "100 G", "-", "Iron, Thin Stick", "Spear Lv 1"),
    ("Pitchfork", "12", "12", "0", "160 G", "Stamina +6", "Spear, Sharp Talon", "Spear Lv 1"),
    ("Bunbunir", "15", "15", "0", "400 G", "Earth Attack +10; Earth Defense +10", "Thin Stick, Glue, Bamboo Shoot (2)", "Spear Lv 1"),
    ("Lance", "16", "16", "0", "180 G", "Paralysis Resist", "Spear, Bronze", "Spear Lv 1"),
    ("Poison Spear", "21", "22", "0", "500 G", "Poison Attack 100%", "Spear, Bronze, Toxin", "Spear Lv 1"),
    ("Halberd", "28", "28", "0", "600 G", "Stamina +6", "Pitchfork, Silver, Sharp Fang", "Spear Lv 1"),
    ("Heavy Lance", "31", "36", "0", "500 G", "Paralysis Resist", "Lance, Silver, Bronze, Hard Horn", "Spear Lv 1"),
    ("Trident", "33", "41", "0", "830 G", "Water Attack +10; Water Defense +15", "Pitchfork, Silver, Water Crystal, Sharp Talon", "Spear Lv 1"),
    ("Feather Lance", "36", "53", "4", "1200 G", "Wind Attack +15; Wind Defense +20", "Lance, Gold, Bird Feather, Wind Crystal", "Spear Lv 1"),
    ("Corsesca", "42", "60", "0", "750 G", "Stamina +10", "Halberd, Gold, Insect Jaw, Glittering Edge", "Spear Lv 1"),
    ("Belvarose", "49", "64", "0", "840 G", "-", "Heavy Lance, Gold, Sharp Fang, Solid Point", "Spear Lv 3"),
    ("Bjor", "53", "76", "0", "660 G", "Poison Attack 10%; Paralysis Attack 10%", "Poison Spear, Gold, Toxin, Insect Jaw", "Spear Lv 3"),
    ("Monk Staff", "57", "86", "0", "2000 G", "Stamina +12", "Pitchfork, Platinum, Thick Stick, Thin Stick, Fairy Dust", "Spear Lv 3"),
    ("Drill Lance", "63", "94", "0", "2500 G", "Paralysis Resist", "Heavy Lance, Platinum, Hard Horn, Sharp Talon, Diamond, Solid Point", "Spear Lv 3"),
    ("Magical Lance", "79", "99", "10", "4000 G", "Intelligence +30; Element Defense +20", "Feather Lance, Platinum, Silver, Magic Crystal, Magic Powder", "Spear Lv 3"),
    ("Gae Bolg", "85", "105", "0", "6000 G", "Water Defense +20; Seal Attack 20%", "Trident, Platinum (2), Solid Point, Fish Fossil, Small Crystal", "Spear Lv S"),
    ("Brionac", "88", "120", "0", "8250 G", "Stun Attack 10%", "Drill Lance, Platinum, Fairy Dust, Hard Horn, Solid Point, Small Crystal", "Spear Lv S"),
    ("Gungnir", "94", "145", "0", "10500 G", "Stun Attack 4%; Wind Attack +20", "Corsesca, Feather Lance, Platinum, Thick Stick, Root, Small Crystal", "Spear Lv S"),
    ("Legion", "95", "182", "20", "12000 G", "Elemental Attack +20; Elemnetal Defense + 20", "Gungnir, Amethyst, Aquamarine, Diamond, Light Crystal", "Spear Lv 2"),
]

# 9 列：名称, 锻造Lv, 攻, 魔攻, 魔防, 价值, 效果, 材料, 配方书
STAVES = [
    ("Fire Rod", "02", "4", "10", "2", "500 G", "Fire Attack +5; Fire Defense +5", "Fire Crystal, Iron", "Staff Lv 1"),
    ("Storm Rod", "06", "8", "17", "22", "1500 G", "Wind Attack +8; Wind Defense +5", "Wind Crystal, Iron", "Staff Lv 1"),
    ("Water Rod", "10", "10", "19", "6", "1500 G", "Water Attack +10; Water Defense +10", "Water Crystal, Iron, Teardrop", "Staff Lv 1"),
    ("Earth Rod", "15", "15", "22", "9", "2000 G", "Earth Attack +10; Earth Defense +10", "Earth Crystal, Thin Stick", "Staff Lv 1"),
    ("Bubble Staff", "21", "20", "27", "10", "950 G", "Water Attack +10; Water Defense +10", "Water Crystal, Magic Powder, Silver, Thin Stick", "Staff Lv 1"),
    ("Hell Branch", "24", "28", "41", "10", "2000 G", "Fire Attack +10; Fire Defense +10", "Fire Crystal, Magic Powder, Ruby, Thin Stick", "Staff Lv 1"),
    ("Wind Rod", "30", "40", "52", "24", "2000 G", "Wind Attack +10; Wind Defense +10", "Wind Crystal, Magic Powder, Silver, Emerald", "Staff Lv 1"),
    ("Meteor Staff", "40", "43", "59", "25", "2000 G", "Light Attack +10; Light Defense +10", "Earth Crystal, Magic Crystal, Gold, Amethyst", "Staff Lv 1"),
    ("Cyclone Rod", "50", "47", "65", "26", "2000 G", "Wind Attack +10; Wind Defense +10", "Wind Crystal, Magic Crystal, Gold, Emerald, Bird Feather", "Staff Lv 2"),
    ("Gaia Rod", "60", "51", "72", "30", "5000 G", "Earth Attack +15; Earth Defense +15", "Earth Crystal, Magic Powder, Root, Thin Stick (2)", "Staff Lv 2"),
    ("Crimson Staff", "70", "62", "80", "24", "5000 G", "Dark Attack +15; Dark Defense +15", "Fire Crystal, Magic Crystal, Gold, Ruby, Quality Cloth", "Staff Lv 2"),
    ("Light Rod", "80", "75", "102", "40", "6500 G", "Light Attack +15; Light Defense +10", "Light Crystal, Magic Crystal, Teardrop, Gold, Platinum", "Staff Lv 2"),
    ("Dark Rod", "90", "90", "132", "60", "6500 G", "Dark Attack +20; Dark Defense +20", "Dark Crystal, Magic Crystal, Devil Blood, Gold, Magic Talon", "Staff Lv 2"),
    ("Legendary Staff", "95", "110", "173", "75", "10500 G", "Elemental Attack +20; Elemental Defense +20", "Light Rod, Dark Rod, Sapphire (2), Amethyst, Ruby", "Staff Lv S"),
]

# 7 列：名称, 锻造Lv, 魔攻, 魔防, 价值, 材料, 配方书
WANDS = [
    ("Sprout Spirit Wand", "10", "50", "50", "100 G", "Green Grass, Thin Stick", "Staff Lv 1"),
    ("Sappling Spirit Wand", "21", "50", "50", "1000 G", "Sprout Spirit Wand, Earth Crystal", "Staff Lv 1"),
    ("Budding Spirit Wand", "41", "50", "50", "2500 G", "Sappling Spirit Wand, Magic Powder, Oak", "Staff Lv 1"),
    ("Mature Spirit Wand", "62", "50", "50", "5000 G", "Budding Spirit Wand, Fairy Dust, Oak, Water Crystal", "Staff Lv 2"),
    ("Elder Spirit Wand", "95", "50", "50", "7500 G", "Mature Spirit Wand, Wind Crystal, Magic Crystal, Light Crystal, Maple", "Staff Lv S"),
]


def lvtag(raw):
    """'Axes Lv 1' -> 'Lv1'；只剥掉与类目重复的前缀，不改等级本身。"""
    return "Lv" + raw.rsplit(" ", 1)[1]


def fix(t):
    """原表用 '-' 表示「无」，本站统一记作全角破折号；材料连接符统一为全角『／』。"""
    if t == "-":
        return "—"
    return t


def rows10(data):
    out = []
    for n, sk, a, d, ma, md, val, eff, ing, rc in data:
        out.append([n, sk, a, d, ma, md, val, fix(eff),
                    "／".join(x.strip() for x in ing.split(",")), lvtag(rc)])
    return out


def rows8(data):
    out = []
    for n, sk, a, md, val, eff, ing, rc in data:
        out.append([n, sk, a, md, val, fix(eff),
                    "／".join(x.strip() for x in ing.split(",")), lvtag(rc)])
    return out


def rows9(data):
    out = []
    for n, sk, a, ma, md, val, eff, ing, rc in data:
        out.append([n, sk, a, ma, md, val, fix(eff),
                    "／".join(x.strip() for x in ing.split(",")), lvtag(rc)])
    return out


def rows7(data):
    out = []
    for n, sk, ma, md, val, ing, rc in data:
        out.append([n, sk, ma, md, val,
                    "／".join(x.strip() for x in ing.split(",")), lvtag(rc)])
    return out


def rows5(data):
    out = []
    for n, sk, val, ing, rc in data:
        out.append([n, sk, val,
                    "／".join(x.strip() for x in ing.split(",")), lvtag(rc)])
    return out


FAMILIES = [
    ("斧（Axes）", C10, rows10(AXES)),
    ("双剑（Dual Blades）", C8, rows8(DUAL)),
    ("双手剑（Longswords）", C10, rows10(LONGS)),
    ("长枪（Spears）", C8, rows8(SPEARS)),
    ("武士刀（Katanas）", C8, rows8(KATANAS)),
    ("锤（Hammers）", C10, rows10(HAMMERS)),
    ("法杖（Staves）", C9, rows9(STAVES)),
    ("魔杖（Wands）", C7, rows7(WANDS)),
    ("镰刀（Sickles）", C10, rows10(SICKLES)),
    ("钓竿（Fishing Poles）", C5, rows5(POLES)),
]


def main():
    fams = [{"name": n, "cols": c, "rows": r} for n, c, r in FAMILIES]
    obj = {"src": SRC, "note": NOTE, "warns": WARNS, "families": fams}
    body = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))

    head = (
        "/* 符文工房 海洋（RFO / Rune Factory: Tides of Destiny）锻造配方表。\n"
        "   由 _build_rfo_forge.py 生成，不要手改。\n"
        "   单一来源：crimsontear.com《Rune Factory: Tides of Destiny》Game Guide「recipes/forge」。\n"
        "   该源为纯文本展平表，各类武器列数不同，本文件按原表列数出表（families 各自带 cols），\n"
        "   缺的列不补、不当 0。原表跨源矛盾与拼写异常统一放在 warns 里，未在数据里做裁决。 */\n"
    )
    with io.open("js/rfoforge.js", "w", encoding="utf-8", newline="\n") as f:
        f.write(head)
        f.write("const RFO_FORGE = " + body + ";\n")

    total = sum(len(r) for _, _, r in FAMILIES)
    print("families:", len(FAMILIES), "rows:", total)
    for n, _, r in FAMILIES:
        print("  ", n, len(r))


if __name__ == "__main__":
    main()
