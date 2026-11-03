# -*- coding: utf-8 -*-
# 符文工房2 锻造／农具／药学配方 -> js/rf2forge.js (RF2_CRAFT)
# 源：
#   武器 7 系（短剑/长剑/斧/战锤/枪/杖/盾）—— almarsguides.com (Rune Factory 2 Forging Recipes，英文)
#   农具 5 类（锤/斧/镰/水壶/锄）—— neoseeker Rune Factory 2 Forging FAQ (Tools 段，英文)
#   药学 —— wiki.biligame.com RF2recipepharmacy（中文，含中文名/等级/材料/效果/卖价/买价）
# 铁律：RF2 无官方中文译名，武器/工具/饰品名保留英文；锻造材料名转中文圈通用译名；
#       药学直接用 biligame 中文。跨源矛盾照录，机翻不润色。
import json, re

# 英文材料名 -> 中文（仅覆盖锻造/农具材料；武器/基础名不在此表则保留英文）
MAT = {
    'Bronze': '青铜', 'Iron': '铁', 'Silver': '银', 'Gold': '金', 'Platinum': '白金',
    'Claymore': '阔剑', 'Broadsword': '阔剑', 'Battle Hammer': '战锤', 'Battle-Axe': '战斧',
    'Spear': '枪', 'Rod': '杖', 'Small Shield': '小盾',
    'Old Hammer': '旧锤', 'Old Axe': '旧斧', 'Old Sickle': '旧镰', 'Old Waterpot': '旧水壶', 'Old Hoe': '旧锄',
    'Fur': '毛皮', 'Root': '根', 'Scorpion Tail': '蝎尾', 'Scorpion Pincer': '蝎钳',
    'Poison Powder': '毒粉', 'Magic Powder': '魔法粉',
    'Fire Crystal': '火之结晶', 'Water Crystal': '水之结晶', 'Wind Crystal': '风之结晶', 'Earth Crystal': '地之结晶',
    'Proof of Warrior': '战士之证', "Giant's Fingernail": '巨人之爪', "Giant's Gloves": '巨人之手',
    'Skull': '骷髅', 'Wooly Furball': '羊毛球', 'Wool Furball': '羊毛球', 'Broken Hilt': '破损的柄',
    'Broken Box': '破箱', 'Devil Horn': '恶魔之角', 'Devil Blood': '恶魔之血', 'Rage Fang': '愤怒之牙',
    'Silk Cloth': '丝布', 'Fairy Dust': '妖精之粉', 'Little Crystal': '小结晶', 'Quality Cloth': '上等布',
    'Cheap Cloth': '廉价布', 'Cheap Bandage': '便宜绷带', 'Sparkle String': '闪光绳', 'Strong String': '坚固绳',
    'Strong Vine': '结实藤蔓', 'Plant Stem': '植物茎', 'Spore': '孢子', 'Quality Fur': '上等毛皮',
    'Panther Claw': '豹爪', 'Wolf Fang': '狼牙', 'Bull Horn': '公牛角', 'Hard Horn': '硬角',
    'Insect Skin': '虫皮', 'Insect Jaw': '虫颚', 'Shoulder Piece': '肩甲片', 'Hammer Piece': '锤碎片',
    'Glue': '胶水', 'Gunpowder': '火药', 'Arrowhead': '箭头', 'Hood': '兜帽', 'Pumpkin': '南瓜', 'Tomato': '番茄',
    'Apple': '苹果', 'Fish Fossil': '鱼化石', 'Bird Wing': '鸟翼', 'Tortoise Shell': '龟壳',
    'Ruby': '红宝石', 'Emerald': '绿宝石', 'Amethyst': '紫水晶', 'Aquamarine': '蓝宝石',
    'Diamond': '钻石', 'Sapphire': '蓝宝石', 'Magic Crystal': '魔法水晶', 'Magical Crystal': '魔水晶',
    'Toyherb': '玩具草', 'Speckled Skin': '斑纹皮', 'Sea Fur': '海毛皮', 'Daikon Radish': '萝卜',
    'Rock': '岩石', 'Raventine': 'Raventine', 'Sea Cutter': 'Sea Cutter', 'Pole Axe': '长柄斧',
    'Woolly Furball': '羊毛球',
}

def mat(s):
    """把英文素材串（逗号分隔，可能重复或 xN）转成「中文名 + 中文名×N」合并串。"""
    toks = [t.strip() for t in s.split(',') if t.strip()]
    merged = []
    for t in toks:
        m = re.match(r'^(.*?)\s*[x×]\s*(\d+)$', t)
        if m:
            name, n = m.group(1).strip(), int(m.group(2))
            if merged and merged[-1][0] == name:
                merged[-1][1] += n
            else:
                merged.append([name, n])
        else:
            if merged and merged[-1][0] == t:
                merged[-1][1] += 1
            else:
                merged.append([t, 1])
    out = []
    for name, n in merged:
        cn = MAT.get(name, name)  # 武器/基础名不在表内则保留英文
        out.append(cn if n == 1 else cn + '×' + str(n))
    return ' + '.join(out)

# ---- 武器 7 系 + 农具 1 系：每行 (名称, 等级, 素材英文串) ----
FAMILIES = [
    {'name': '短剑系 Shortsword', 'rows': [
        ('Steel Sword', 9, 'Broadsword, Bronze, Iron, Iron'),
        ('Defender', 16, 'Bronze, Bull Horn, Iron, Panther Claw, Silver, Steel Sword'),
        ('Cutlass', 17, 'Defender, Gold, Quality Cloth, Skull, Skull, Strong String'),
        ('Windsword', 20, 'Insect Skin, Iron, Quality Cloth, Scorpion Pincer, Steel Sword, Wind Crystal'),
        ('Gaia Sword', 23, 'Earth Crystal, Hard Horn, Iron, Magic Powder, Root, Steel Sword'),
        ('Luck Blade', 23, 'Broadsword, Gunpowder, Hood, Iron, Panther Claw, Scorpion Pincer'),
        ('Sakura', 25, 'Broadsword, Magic Crystal, Iron, Poison Powder, Scorpion Tail, Spore'),
        ("Burnin' Blade", 26, "Arrowhead, Fire Crystal, Giant's Fingernail, Iron, Spore, Steel Sword"),
        ('Aquasword', 29, 'Iron, Root, Steel Sword, Strong String, Tortoise Shell, Water Crystal'),
        ('Platinum Sword', 30, 'Broken Hilt, Defender, Glue, Platinum, Silver'),
        ('Aerial Blade', 32, 'Quality Cloth, Silver, Sparkle String, Speckled Skin, Wind Crystal'),
        ('Smash Blade', 34, 'Gold, Hard Horn, Luck Blade, Panther Claw, Plant Stem, Speckled Skin'),
        ('Sunspot', 36, "Fire Crystal, Giant's Gloves, Gold, Magic Crystal, Raventine, Sparkle String"),
        ('Durandel', 36, 'Cheap Cloth, Cutlass, Glue, Little Crystal, Rage Fang, Wolf Fang'),
        ('Grantale', 40, 'Bull Horn, Earth Crystal, Gaia Sword, Insect Jaw, Plant Stem, Tortoise Shell'),
        ('Icifier', 42, 'Aquasword, Quality Cloth, Scorpion Pincer, Silver, Tortoise Shell, Water Crystal'),
        ('Raventine', 45, "Burnin's Blade, Fire Crystal, Insect Skin, Pumpkin, Silver, Skull"),
        ('Soul Eater', 47, 'Iron, Poison Powder, Quality Cloth, Root, Sakura, Scorpion Tail'),
        ('Dragonslayer', 48, "Devil Blood, Fish Fossil, Giant's Fingernail, Little Crystal, Magic Crystal, Platinum Sword"),
        ('Chaos Blade', 51, "Bird Wing, Cheap Bandage, Giant's Gloves, Magic Powder, Soul Eater, Speckled Skin"),
        ('Gravios', 52, "Giant's Fingernail, Iron, Panther Claw, Silver, Smash Blade, Sparkle String"),
    ]},
    {'name': '长剑系 Longsword', 'rows': [
        ('Zweihander', 11, 'Bronze, Bronze, Claymore, Iron'),
        ('Greatsword', 18, 'Cheap Cloth, Plant Stem, Sparkle String, Speckled Skin, Spore, Zweihander'),
        ('Cyclone Blade', 19, 'Claymore, Iron, Root, Tortoise Shell, Wind Crystal, Wool Furball'),
        ('Flame Saber', 22, 'Cheap Cloth, Claymore, Fire Crystal, Iron, Plant Stem, Scorpion Pincer'),
        ('Sea Cutter', 25, 'Claymore, Magic Crystal, Sparkle String, Speckled Skin, Tortoise Shell, Water Crystal'),
        ('Earth Shade', 28, 'Claymore, Earth Crystal, Insect Skin, Plant Stem, Root, Spore'),
        ('Poison Blade', 30, 'Arrowhead, Claymore, Insect Jaw, Poison Powder, Scorpion Pincer, Strong Vine'),
        ('Heaven Asunder', 33, 'Bull Horn, Cyclone Blade, Gunpowder, Proof of Warrior, Quality Cloth, Wind Crystal'),
        ('Katana', 33, 'Fish Fossil, Glue, Greatsword, Little Crystal, Shoulder Piece, Silver'),
        ('Flamberge', 36, 'Arrowhead, Bird Wing, Greatsword, Proof of Warrior, Quality Fur, Strong Vine'),
        ('Shine Blade', 36, "Flame Saber, Fire Crystal, Giant's Gloves, Magic Crystal, Tortoise Shell, Wooly Furball"),
        ('Snow Crown', 39, "Giant's Gloves, Magic Powder, Quality Fur, Sea Fur, Sea Cutter, Tortoise Shell, Water Crystal"),
        ('Katzbalger', 40, 'Arrowhead, Flamberge, Magic Crystal, Scorpion Pincer, Strong String, Strong Vine'),
        ('Grand Smasher', 42, 'Cheap Cloth, Earth Crystal, Earth Shade, Fur, Gunpowder, Hard Horn'),
        ('Dancing Dicer', 43, 'Arrowhead, Hard Horn, Katana, Panther Claw, Quality Cloth, Scorpion Tail'),
        ('Bio Smasher', 44, "Cheap Cloth, Giant's Fingernail, Insect Skin, Poison Blade, Poison Powder, Skull"),
        ('Punisher', 49, 'Broken Box, Devil Horn, Katzbalger, Little Crystal, Rage Fang, Silk Cloth'),
        ('Blue Eyed Blade', 56, "Dancing Dicer, Giant's Fingernail, Panther Claw, Scorpion Tail, Strong String, Strong Vine"),
        ('Moon Shadow', 65, "Blue Eyed Blade, Bull Horn, Cheap Bandage, Glue, Little Crystal, Wolf Fang"),
        ('Balmung', 80, 'Broken Box, Devil Horn, Fairy Dust, Punisher, Rage Fang, Silk Cloth'),
        ('Steel Slicer', 92, 'Devil Blood, Fish Fossil, Moon Shadow, Panther Claw, Platinum, Wolf'),
    ]},
    {'name': '斧系 Axe', 'rows': [
        ('Battle-Axe', 18, 'Battle-Axe, Bronze, Bronze, Iron'),
        ('Alldale', 22, 'Fur, Iron, Pole Axe, Proof of Warrior, Root, Scorpion Tail'),
        ('Great Axe', 27, 'Bull Horn, Insect Skin, Pole Axe, Scorpion Tail, Silver, Strong Vine'),
        ('Demon Axe', 34, 'Alldale, Bird Wing, Gold, Magic Powder, Poison Powder, Skull'),
        ('Crescent Axe+', 38, 'Arrowhead, Broken Hilt, Great Axe, Plant Stem, Speckled Skin, Wolf Fang'),
        ('Tomahawk', 40, 'Battle-Axe, Bird Wing, Hood, Insect Jaw, Panther Claw, Wind Crystal'),
        ('Frost Axe', 44, 'Battle-Axe, Cheap Bandage, Quality Fur, Sparkle String, Speckled Skin, Water Crystal'),
        ('Heat Axe', 49, 'Battle-Axe, Fire Crystal, Insect Skin, Magic Crystal, Proof of Warrior, Spore'),
        ('Double Edge', 50, 'Broken Box, Crescent Axe, Devil Horn, Hammer Piece, Rage Fang, Strong String'),
        ('Rock Axe', 56, 'Broken Hilt, Earth Crystal, Fairy Dust, Pole Axe, Proof of Warrior'),
        ('Saint Axe', 65, 'Devil Blood, Double Edge, Fairy Dust, Little Crystal, Magic Powder, Silk Cloth'),
    ]},
    {'name': '战锤系 Hammer', 'rows': [
        ('War Hammer', 5, 'Battle Hammer, Bronze, Bronze, Iron'),
        ('Great Hammer', 22, 'Arrowhead, Cheap Cloth, Insect Skin, Iron, Plant Stem, War Hammer'),
        ('Flame Hammer', 29, 'Battle Hammer, Cheap Bandage, Fire Crystal, Hard Horn, Magic Powder, Wooly Furball'),
        ('Schnabel', 32, "Giant's Fingernail, Giant's Gloves, Proof of Warrior, Scorpion Pincer, Silver, War Hammer"),
        ('Ice Hammer', 34, "Battle Hammer, Fairy Dust, Giant's Fingernail, Giant's Gloves, Shoulder Piece, Water Crystal"),
        ('Sky Hammer', 36, 'Battle Hammer, Bird Wing, Fur, Root, Strong String, Wind Crystal'),
        ('Spiked Hammer', 37, 'Cheap Cloth, Glue, Great Hammer, Quality Fur, Shoulder Piece, Silver'),
        ('Bone Hammer', 40, 'Devil Blood, Devil Horn, Gunpowder, Hammer Piece, Rage Fang, Schnabel'),
        ('Gigant Hammer', 42, 'Gold, Great Hammer, Hammer Piece, Insect Jaw, Spore, Wolf Fang'),
        ('Gravit Hammer', 50, 'Broken Hilt, Earth Crystal, Fairy Dust, Gigant Hammer, Hood, Strong Vine'),
        ('Crystal Hammer', 60, 'Gold, Hammer Piece, Ice Hammer, Quality Cloth, Silk Cloth'),
    ]},
    {'name': '枪系 Spear（含长柄杖）', 'rows': [
        ('Lance', 12, 'Bronze, Bronze, Iron, Spear'),
        ('Wooden Staff', 15, 'Daikon Radish, Earth Crystal, Root, Spear, Strong String, Strong Vine'),
        ('Needle Spear', 20, 'Bronze, Iron, Plant Stem, Spear, Spore, Strong String'),
        ('Halberd', 23, 'Arrowhead, Hard Horn, Insect Skin, Scorpion Tail, Silver, Spear'),
        ('Water Spear', 24, 'Cheap Cloth, Scorpion Pincer, Spear, Strong String, Tortoise Shell, Water Crystal'),
        ('Poison Spear', 26, "Giant's Fingernail, Poison Powder, Root, Scorpion Tail, Silver, Spear"),
        ('Corsesca', 27, 'Cheap Cloth, Halberd, Hard Horn, Iron, Panther Claw, Sparkle String'),
        ('Heavy Lance', 30, 'Bird Wing, Bull Horn, Gunpowder, Lance, Silver, Strong Vine'),
        ('Flare Lance', 35, 'Arrowhead, Fire Crystal, Heavy Lance, Scorpion Pincer, Scorpion Tail, Tomato'),
        ('Iseberk', 40, 'Insect Jaw, Skull, Tortoise Shell, Water Crystal, Water Spear, Wooly Furball'),
        ('Blood Lance', 40, 'Cheap Bandage, Flare Lance, Poison Powder, Proof of Warrior, Skull, Spore'),
        ('Monk Staff', 43, "Earth Crystal, Giant's Fingernail, Magic Crystal, Quality Cloth, Sparkle String, Wooden Staff"),
        ('Silent Grave', 46, "Giant's Gloves, Halberd, Hard Horn, Magic Crystal, Quality Cloth"),
        ('Metus', 46, 'Blood Lance, Giant\'s Gloves, Panther Claw, Poison Powder, Speckled Skin, Spore'),
        ('Overbreak', 48, 'Bull Horn, Cheap Bandage, Corsesca, Hood, Insect Jaw, Proof of Warrior'),
        ('Bjor', 52, 'Gunpowder, Insect Jaw, Needle Spear, Poison Powder, Poison Spear, Scorpion Tail'),
        ('Belvarose', 59, 'Fish Fossil, Glue, Metus, Monk Staff, Shoulder Piece, Wolf Fang'),
        ('Gae Bolg', 63, 'Bird Wing, Devil Horn, Rage Fang, Silent Grave, Wolf Fang, Wooly Furball'),
        ("Dragon's Fang", 70, 'Belvarose, Fish Fossil, Fur, Hood, Quality Cloth, Wolf Fang'),
        ('Trident', 73, 'Fish Fossil, Gae Bolg, Glue, Panther Claw, Quality Fur, Shoulder Piece'),
        ('Gungnir', 90, 'Broken Box, Devil Blood, Devil Horn, Overbreak, Rage Fang, Silk Cloth'),
    ]},
    {'name': '法杖系 Rod', 'rows': [
        ('Staff', 13, 'Insect Skin, Plant Stem, Rod, Root, Spore, Toyherb'),
        ('Silver Staff', 18, 'Apple, Cheap Cloth, Rock, Rod, Silver, Sparkle String'),
        ('Flare Staff', 25, 'Fire Crystal, Gunpowder, Iron, Magic Powder, Quality Cloth, Rod'),
        ('Earth Staff', 28, "Earth Crystal, Giant's Gloves, Insect Jaw, Iron, Magic Powder, Rod"),
        ('Ice Staff', 30, 'Arrowhead, Magic Powder, Iron, Rod, Tortoise Shell, Water Crystal'),
        ('Lightning Rod', 34, 'Bird Wing, Iron, Magic Powder, Rod, Skull, Wind Crystal'),
        ("Wizard's Staff", 38, 'Cheap Cloth, Magic Crystal, Magic Powder, Speckled Skin, Staff, Wooly Furball'),
        ("Mage's Staff", 39, 'Little Crystal, Magic Crystal, Root, Silver Staff, Sparkle String'),
        ("Rune Staff", 46, "Broken Box, Broken Hilt, Fur, Glue, Hammer Piece, Mage's Staff"),
    ]},
    {'name': '盾系 Shield', 'rows': [
        ('Bronze Shield', 16, 'Bronze, Bronze, Iron, Small Shield'),
        ('Magic Shield', 20, 'Cheap Cloth, Magical Crystal, Plant Stem, Small Shield, Speckled Skin'),
        ('Round Shield', 27, 'Bronze Shield, Cheap Cloth, Iron, Iron, Root, Silver'),
        ('Platinum Shield', 34, "Giant's Glove, Hard Horn, Platinum, Platinum, Quality Cloth, Round Shield"),
        ('Tortoise Shield', 35, 'Platinum Shield, Tortoise Shell, Tortoise Shell, Tortoise Shell, Tortoise Shell'),
        ('Prism Shield', 36, 'Magic Shield, Plant Stem, Poison Powder, Root, Sparkle String, Spore'),
        ('Bone Shield', 37, "Cheap Cloth, Giant's Fingernail, Skull, Skull, Tortoise Shield"),
        ('Kite Shield', 38, 'Cheap Bandage, Gold, Heavy Shield, Hood, Platinum, Proof of Warrior'),
        ('Chaos Shield', 41, 'Bone Shield, Fish Fossil, Insect Jaw, Poison Powder, Quality Fur, Skull'),
        ('Heavy Shield', 43, 'Hard Horn, Insect Skin, Iron, Iron, Platinum, Platinum Shield'),
        ('Magical Shield', 49, 'Fairy Dust, Gold, Little Crystal, Prism Shield, Scorpion Pincer, Shoulder Piece'),
        ('Knight Shield', 55, 'Insect Jaw, Kite Shield, Platinum, Proof of Warrior, Quality Fur, Wolf Fang'),
        ('Element Shield', 59, 'Broken Hilt, Devil Blood, Devil Horn, Hood, Magical Shield, Silk Cloth'),
        ('Rune Shield', 68, 'Broken Box, Bull Horn, Chaos Shield, Glue, Knight Shield, Rage Fang'),
    ]},
    {'name': '农具系 Tools', 'rows': [
        ('Iron Hammer', 5, 'Old Hammer, Bronze, Bronze, Iron'),
        ('Silver Hammer', 9, 'Iron Hammer, Iron, Iron, Bronze, Silver'),
        ('Gold Hammer', 13, 'Silver Hammer, Gold, Gold, Gold, Silver, Silver'),
        ('Platinum Hammer', 17, 'Gold Hammer, Platinum, Platinum, Platinum, Gold, Sparkle String'),
        ('Chopping Axe', 5, 'Old Axe, Iron, Iron, Bronze'),
        ('Lumber Axe', 9, 'Chopping Axe, Iron, Iron, Bronze, Silver'),
        ('Mountain Axe', 13, 'Lumber Axe, Gold, Gold, Gold, Silver, Silver'),
        ('Miracle Axe', 17, 'Mountain Axe, Platinum, Platinum, Platinum, Gold, Woolly Furball'),
        ('Iron Sickle', 5, 'Old Sickle, Iron, Iron, Iron'),
        ('Quality Sickle', 9, 'Iron Sickle, Iron, Iron, Bronze, Silver'),
        ('Super Sickle', 13, 'Quality Sickle, Gold, Gold, Gold, Silver, Silver'),
        ('Legend Sickle', 17, 'Super Sickle, Platinum, Platinum, Platinum, Gold, Arrowhead'),
        ('Tin Waterpot', 5, 'Old Waterpot, Bronze, Bronze, Bronze'),
        ('Lion Waterpot', 9, 'Tin Waterpot, Iron, Iron, Bronze, Silver'),
        ('Rainbow Waterpot', 13, 'Lion Waterpot, Gold, Gold, Gold, Silver, Silver'),
        ('Joy Waterpot', 17, 'Rainbow Waterpot, Platinum, Platinum, Gold, Ruby, Speckled Skin'),
        ('Sturdy Hoe', 5, 'Old Hoe, Iron, Iron, Bronze'),
        ('Seasoned Hoe', 9, 'Sturdy Hoe, Iron, Iron, Bronze, Silver'),
        ('Shiny Hoe', 13, 'Seasoned Hoe, Gold, Gold, Gold, Silver, Silver'),
        ('Blessed Hoe', 17, 'Shiny Hoe, Platinum, Platinum, Platinum, Plant Stem'),
    ]},
]

# ---- 药学（biligame 中文，直接录入） ----
PHARMACY = {
    'cols': ['中文名', '等级', '材料', '效果', '卖价', '买价'],
    'rows': [
        ['恢复壶', '6', '绿草、药草、空瓶', 'HP恢复100', '—', '—'],
        ['疗愈壶', '16', '蓝草、绿草、药草、空瓶', 'HP恢复300', '—', '—'],
        ['神秘壶', '26', '蓝草、绿草、蜂蜜、药草、空瓶', 'HP恢复600', '—', '—'],
        ['中和剂', '18', '青椒、魅蓝草、解毒草', '净化毒沼泽', '50', '100'],
        ['速速绿', '51', '水之结晶、古代鱼的骨头、结实的藤蔓、地之结晶、小仙子的粉末', '农作物Lv+1', '4000', '12000'],
        ['营养剂α', '37', '根、结实的藤蔓、地之结晶', '农作物早1天成熟', '500', '2000'],
        ['营养剂β', '41', '小仙子的粉末、结实的藤蔓、地之结晶', '农作物早2天成熟', '700', '4000'],
        ['营养剂γ', '46', '恶魔之血、结实的藤蔓、地之结晶', '农作物早3天成熟', '900', '6000'],
        ['友情糖浆', '44', '曲奇饼干、甜甜圈、金', '提升村民好感度', '15', '50'],
        ['ZOKKON', '52', '恋爱的预感、少女蜜瓜、少女蜜瓜、火热果实、战士之证', '提升候补爱情度', '15', '50'],
        ['蛋・白・质', '55', '菠菜、根、战士之证、魔人之角、恶魔之血', '力量+1', '2500', '6250'],
        ['智力补品', '46', '茄子、蓝草、魔法之粉、魔力结晶、黄瓜', '智力+1', '2800', '7000'],
        ['生命果冻', '56', '巨人的手套、牛奶L、龟壳、巨人之爪、金刚花', '体力+1', '2500', '6250'],
        ['心灵饮料', '51', '粉红猫、草莓、火热果实、根、火之结晶', 'HP上限+3', '5500', '13750'],
        ['解毒药', '16', '绿草、解毒草', '解毒', '130', '325'],
        ['解麻药', '20', '药草、黄草', 'HP恢复30,解麻痹', '300', '750'],
        ['解封丸', '26', '紫草、蓝草、药草', 'HP恢复30,解封印', '200', '500'],
        ['感冒药', '32', '红草、葱、绿草、苦橙草', 'HP恢复30,解感冒', '350', '875'],
        ['超级营养药', '70', '白草、竹笋、鸡蛋M、黑草、鸡蛋S、鸡蛋L', 'HP恢复-200、解毒封印麻痹感冒、力/智/体+30、抗性+50%', '700', '1750'],
        ['健康之源', '72', '蜂蜜、葡萄酒、昆虫的下颚、小仙子的粉末', 'RP恢复50、解毒封印麻痹感冒、抗性+25%', '1200', '3000'],
        ['无敌秘药', '65', '根、龟壳、小仙子的粉末、骷髅', 'HP恢复300、解毒封印麻痹感冒、HP上限+200、力/智/体+20、抗性+75%', '1800', '4500'],
        ['符文药水', '63', '四叶草、奶酪L、蛋黄酱L、毛线球L、酸奶L、四叶草', '角色Lv+1', '5300', '13250'],
        ['地狱辣椒', '10', '红草、红草', '调味料（料理材料）', '250', '625'],
        ['甘甜粉', '10', '苹果、苹果', '调味料（料理材料）', '340', '850'],
        ['酸味香料', '10', '橘子、黄草', '调味料（料理材料）', '450', '1125'],
        ['混合香料', '10', '月落草、托伊药草、粉红猫、魅蓝草', '调味料（料理材料）', '2400', '6000'],
        ['宠物饲料包', '13', '饲料、钩吻鲑、甘甜粉、地狱辣椒', '增加20个宠物饲料', '340', '680'],
    ],
}

def build():
    families = []
    for f in FAMILIES:
        rows = [[name, str(lvl), mat(s)] for (name, lvl, s) in f['rows']]
        families.append({
            'name': f['name'],
            'cols': ['名称', '等级', '素材一览'],
            'rows': rows,
            'totals': [],
        })
    D = {
        'src': 'almarsguides.com (Rune Factory 2 Forging Recipes) + neoseeker (Forging FAQ Tools) + wiki.biligame.com (RF2recipepharmacy)',
        'note': '《符文工房2》无官方中文译名，武器／工具名保留英文；锻造材料名采用中文圈通用译名。升级链「素材一览」里若出现前一级武器名，即表示从该武器升级而来。',
        'families': families,
        'pharmacy': PHARMACY,
    }
    return D

if __name__ == '__main__':
    D = build()
    fam_rows = sum(len(f['rows']) for f in D['families'])
    head = (
        '/* 符文工房2 锻造／农具／药学配方 —— craft 页 RF2 分支用\n'
        ' * 武器 7 系 + 农具 1 系：取自 almarsguides.com (Rune Factory 2 Forging Recipes，英文)\n'
        ' * 农具 5 类另核 neoseeker (Rune Factory 2 Forging FAQ Tools 段)\n'
        ' * 药学：取自 wiki.biligame.com RF2recipepharmacy（中文，含卖价买价）\n'
        ' * 铁律：RF2 无官方中文，武器/工具名保留英文；材料名转中文圈通用译名。\n'
        ' * 由 _build_rf2_forge.py 生成，勿手改。\n'
        ' */\n'
    )
    body = 'var RF2_CRAFT = ' + json.dumps(D, ensure_ascii=False, indent=2) + ';\n'
    with open('js/rf2forge.js', 'w', encoding='utf-8', newline='') as f:
        f.write(head + body)
    print('RF2_CRAFT: families=%d rows=%d pharmacy=%d' % (len(D['families']), fam_rows, len(D['pharmacy']['rows'])))
