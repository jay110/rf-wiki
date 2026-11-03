# -*- coding: utf-8 -*-
# 符文工房 边境（rff / Rune Factory Frontier，Wii/2008）城镇商店售卖列表（买价）
# 源：runefrontier 维基 Shops 页（runefrontier.fandom.com/wiki/Shops；2026-11 经 WebSearch 缓存核对，
#     价目与条目以该页为准）。该页在本环境无法直接 curl（fandom 被网络策略拦截），改用搜索缓存逐字核对。
# 由 _build_rff_shop.py 生成 js/rffshop.js，勿手改。
import io, json

SRC = "runefrontier 维基 Shops 页（runefrontier.fandom.com/wiki/Shops；2026-11 经搜索缓存核对，价目以该页为准）"
NOTE = "边境（Rune Factory Frontier，Wii/2008）的 Trampoli 城镇商店。仅记买价，不记卖价。进度锁主要有三类：① 锻冶屋的 Lv3/Lv5 元素水晶、Rune Archives 的进阶配方书需击败绿废墟／熔岩废墟 boss 后才上架；② 教会药房的进阶花草需好感度（FP）等级；③ Rosetta 到镇后开 Materia、Lara 到镇后开药房。Danny 杂货店在 Materia 开张后逐渐关门，两店重叠的饰品照源都收。"

# 每家店：n 中文名 / full 原名 / h 营业时间 / desc 简介 / secs 分区（c 列头，r 行，第三列约定为「解锁」）
SHOPS = [
    {
        "n": "丹尼杂货店",
        "full": "Danny's Grocery（ダニーの店）",
        "h": "工作日 9:00-18:00",
        "desc": "Trampoli 商业区唯一的杂货店，由 Danny 经营。库存很少，Rosetta 开 Materia 后此店逐渐关门。",
        "secs": [
            {"t": "杂货", "c": ["商品", "售价", "解锁"], "r": [
                ["Turnip seed（芜菁种子）", "10G", "初始"],
                ["Cooking Oil（食用油）", "260G", "初始"],
                ["Cheap Band（便宜腕带）", "500G", "初始"],
                ["Wappen（徽章）", "500G", "初始"],
                ["Pendant（吊坠）", "550G", "初始"],
            ]},
        ],
    },
    {
        "n": "Damascus 锻冶屋",
        "full": "Damascus Forge（Ganesha 的铁匠铺）",
        "h": "工作日 9:00-18:00",
        "desc": "商业区的锻冶屋，由半精灵 Ganesha 经营。开局只能买到基础武器与 Lv1 元素水晶；上级水晶随你打通废墟推进。元素水晶是自制武器的核心材料。",
        "secs": [
            {"t": "武器·水晶", "c": ["商品", "售价", "解锁"], "r": [
                ["Broadsword（阔剑）", "500G", "初始"],
                ["Two-handed Sword（双手剑）", "800G", "初始"],
                ["Spear（矛）", "500G", "初始"],
                ["Battle Hammer（战锤）", "500G", "初始"],
                ["Battle Axe（战斧）", "500G", "初始"],
                ["Elemental Crystal Lv1（一级元素水晶）", "2500G", "初始"],
                ["Elemental Crystal Lv3（三级元素水晶）", "3500G", "绿废墟后"],
                ["Elemental Crystal Lv5（五级元素水晶）", "4500G", "熔岩废墟后"],
            ]},
        ],
    },
    {
        "n": "Snowstyle 酒场",
        "full": "Snowstyle Tavern（Rita 的酒吧，附属于 Sunshine Inn）",
        "h": "工作日 18:00-3:00",
        "desc": "商业区 Rita 经营的酒吧，附在 Sunshine Inn 楼上走廊。可买基础餐食与烹饪材料。",
        "secs": [
            {"t": "食材·饮品", "c": ["商品", "售价", "解锁"], "r": [
                ["Orange Juice（橙汁）", "450G", "初始"],
                ["Rice Ball（饭团）", "400G", "初始"],
                ["Pickled Turnip（腌芜菁）", "580G", "初始"],
                ["Grilled Pike（烤梭子鱼）", "150G", "初始"],
                ["Squid Sashimi（鱿鱼刺身）", "150G", "初始"],
                ["Cornucopia Tree Fruit·上期（生命之树果·上期）", "300G", "初始"],
                ["Rice（米）", "260G", "初始"],
                ["Flour（面粉）", "260G", "初始"],
                ["Wine（葡萄酒）", "2000G", "初始"],
                ["Chocolate（巧克力）", "260G", "初始"],
                ["Curry Powder（咖喱粉）", "260G", "初始"],
                ["Cooking Oil（食用油）", "260G", "初始"],
                ["Garlic（大蒜）", "260G", "初始"],
                ["Milk（牛奶）", "120G", "初始"],
                ["Egg（蛋）", "200G", "初始"],
                ["Honey（蜂蜜）", "220G", "初始"],
            ]},
        ],
    },
    {
        "n": "Erik 种子店",
        "full": "Erik's（南区的种子与牧草店）",
        "h": "工作日 12:00-18:00",
        "desc": "南区 Erik 的店，镇上唯一能买齐果蔬种子与牧草的地方。",
        "secs": [
            {"t": "种子·牧草", "c": ["商品", "售价", "解锁"], "r": [
                ["Feed（饲料）", "300G", "初始"],
                ["Fodder Seed（牧草种子）", "30G", "初始"],
                ["Wool（羊毛）", "180G", "初始"],
                ["Cabbage（卷心菜·成品）", "1360G", "初始"],
                ["Cornucopia Tree Fruit·当期（生命之树果·当期）", "300G", "初始"],
                ["Turnip Seed（芜菁种子）", "10G", "初始"],
                ["Cucumber Seed（黄瓜种子）", "680G", "初始"],
                ["Cabbage Seed（卷心菜种子）", "1020G", "初始"],
                ["Potato Seed（土豆种子）", "600G", "初始"],
                ["Strawberry Seed（草莓种子）", "200G", "初始"],
                ["Onion Seed（洋葱种子）", "660G", "初始"],
                ["Tomato Seed（番茄种子）", "420G", "初始"],
                ["Corn Seed（玉米种子）", "300G", "初始"],
                ["Pumpkin Seed（南瓜种子）", "1125G", "初始"],
                ["Pineapple Seed（菠萝种子）", "800G", "初始"],
                ["Bell Pepper Seed（青椒种子）", "400G", "初始"],
                ["Spinach Seed（菠菜种子）", "390G", "初始"],
                ["Eggplant Seed（茄子种子）", "560G", "初始"],
                ["Yam Seed（山药种子）", "280G", "初始"],
                ["Carrot Seed（胡萝卜种子）", "810G", "初始"],
            ]},
        ],
    },
    {
        "n": "Rune Archives 图书馆",
        "full": "Rune Archives（Selphy 的图书馆·配方书）",
        "h": "极不规律（Selphy 到镇后开）",
        "desc": "教会区的图书馆，由未婚候选 Selphy 经营。可买锻造／饰品／药学／烹饪的配方书；错过基础书可在周二特卖日补。进阶书需击败废墟 boss 后才上架。",
        "secs": [
            {"t": "配方书", "c": ["商品", "售价", "解锁"], "r": [
                ["Let's Make Weapons!（武器锻造入门）", "1000G", "初始"],
                ["Make a Magic Cane（魔杖制作）", "2000G", "初始"],
                ["Jewelry Workshop（饰品工坊）", "1000G", "初始"],
                ["Lab Book（实验笔记）", "500G", "初始"],
                ["Chef's road（料理入门·刺身）", "2000G", "初始"],
                ["Fly! Frying Pan! 1（平底锅料理①）", "500G", "初始"],
                ["It's Hot!（火锅料理①）", "500G", "初始"],
                ["Fine Dining（烤箱料理①）", "500G", "初始"],
                ["Skilled Steaming（蒸锅料理①）", "500G", "初始"],
                ["Blender Mastery（搅拌器料理①）", "500G", "初始"],
                ["Forge 1-handed Swords（单手剑锻造书）", "10000G", "绿废墟后"],
                ["Make 2-handed Swords（双手剑锻造书）", "10000G", "绿废墟后"],
                ["Spear Studio（矛锻造书）", "10000G", "绿废墟后"],
                ["Hammer Lab（锤锻造书）", "8000G", "绿废墟后"],
                ["Axe Fan Weekly（斧锻造书）", "8000G", "绿废墟后"],
                ["Farm master（农具大师书）", "12000G", "绿废墟后"],
                ["Head Coordination（头部饰品书）", "5000G", "绿废墟后"],
                ["Neck Accentuation（颈部饰品书）", "5000G", "绿废墟后"],
                ["Stylish Wear（服饰书）", "5000G", "绿废墟后"],
                ["At Your Fingertips（手部饰品书）", "5000G", "绿废墟后"],
                ["Ultimate Lab Book（终极实验笔记）", "5000G", "绿废墟后"],
                ["Gourmet Cooking（进阶烹饪书）", "5000G", "绿废墟后"],
                ["Fly! Frying Pan! 2（平底锅料理②）", "2500G", "绿废墟后"],
                ["Cont'd: It's Hot!（火锅料理②）", "2500G", "绿废墟后"],
                ["More Fine Dining（烤箱料理②）", "2500G", "绿废墟后"],
                ["Expert Steaming（蒸锅料理②）", "5000G", "绿废墟后"],
                ["True Blender Mastery（搅拌器料理②）", "5000G", "绿废墟后"],
                ["Fly! Frying Pan! 3（平底锅料理③）", "5000G", "熔岩废墟后"],
                ["Final: It's Hot!（火锅料理③）", "5000G", "熔岩废墟后"],
                ["Super Fine Dining（烤箱料理③）", "5000G", "熔岩废墟后"],
                ["Beach Style!（泳装图样书）", "10000G", "熔岩废墟后"],
                ["Happy Toys（玩具书）", "30000G", "熔岩废墟后"],
            ]},
        ],
    },
    {
        "n": "Materia 杂货店",
        "full": "Materia（Rosetta 开张的杂货店）",
        "h": "9:00-18:00",
        "desc": "Rosetta 到镇后，在商业区 Danny 隔壁开的全新杂货店，商品远多于 Danny 的。主要卖饰品与花草，也有一些季节物（如南瓜面具、颈巾）。",
        "secs": [
            {"t": "饰品·花草·季节物", "c": ["商品", "售价", "解锁"], "r": [
                ["Cheap Band（便宜腕带）", "500G", "初始"],
                ["Pendant（吊坠）", "550G", "初始"],
                ["Earring（耳环）", "550G", "初始"],
                ["Wappen（徽章）", "500G", "初始"],
                ["Neck Towel（颈巾）", "850G", "初始"],
                ["Moon Drop（月下滴花）", "460G", "初始"],
                ["Toy Herb（玩具草）", "1900G", "初始"],
                ["Emeryflower（金刚花）", "26000G", "初始"],
                ["Cherry Grass（樱草）", "12000G", "初始"],
                ["Lamp Grass（灯草）", "19000G", "初始"],
                ["Blue Crystal（蓝水晶）", "22000G", "初始"],
                ["Pink Cat（粉猫花）", "1100G", "初始"],
                ["Green Crystal（绿水晶）", "22000G", "初始"],
                ["Fireflower（火花）", "19000G", "初始"],
                ["Ironleaf（铁叶）", "7000G", "初始"],
                ["Clover（四叶草）", "12000G", "初始"],
                ["Charm Blue（蓝护符）", "1500G", "初始"],
                ["Red Crystal（红水晶）", "22000G", "初始"],
                ["Pom-Pom（绒球草）", "19000G", "初始"],
                ["Noel Grass（圣诞草）", "7000G", "初始"],
            ]},
        ],
    },
    {
        "n": "Lara 教会药房",
        "full": "Infirmary（Lara 的教会药房）",
        "h": "9:00-18:00（周一·三·五与 Cinnamon 学习时 12:00-18:00，雨天除外）",
        "desc": "教会区的药房，由 Lara 经营，从春初见面即可开。卖解毒／感冒等药、土壤改良剂与各类草；进阶花草需好感度（FP）等级才上架。",
        "secs": [
            {"t": "药·草", "c": ["商品", "售价", "解锁"], "r": [
                ["Antidote Herb（解毒草）", "140G", "初始"],
                ["Para-gone（驱虫药）", "80G", "初始"],
                ["Energy Drink（能量饮）", "260G", "初始"],
                ["Cold Medicine（感冒药）", "80G", "初始"],
                ["Neutralizer（中和剂）", "80G", "初始"],
                ["Formula A（配方A）", "80G", "初始"],
                ["Greenifier（土壤改良剂）", "9200G", "初始"],
                ["Medicinal Herb（药草）", "20G", "1FP"],
                ["Orange Grass（橙草）", "20G", "1FP"],
                ["Yellow Grass（黄草）", "20G", "1FP"],
                ["Formula B（配方B）", "260G", "2FP"],
                ["Purple Grass（紫草）", "20G", "2FP"],
                ["Blue Grass（蓝草）", "20G", "2FP"],
                ["Formula C（配方C）", "960G", "3FP"],
                ["Green Grass（绿草）", "20G", "3FP"],
                ["Red Grass（红草）", "20G", "3FP"],
                ["Moon Drop Flower（月下滴花·花）", "434G", "4FP"],
                ["Pink Cat Flower（粉猫花·花）", "1040G", "6FP"],
                ["Charm Blue Flower（蓝护符花·花）", "1420G", "8FP"],
                ["Toy Herb Flower（玩具草花·花）", "1800G", "10FP"],
            ]},
        ],
    },
]


def build():
    out = io.StringIO()
    out.write("// 由 _build_rff_shop.py 生成｜RF 边境（Rune Factory Frontier）城镇商店售卖列表（买价）\n")
    out.write("// 源：runefrontier 维基 Shops 页（runefrontier.fandom.com/wiki/Shops；2026-11 经搜索缓存核对，价目以该页为准）\n")
    obj = {"src": SRC, "note": NOTE, "shops": SHOPS}
    out.write("const RFF_SHOP = " + json.dumps(obj, ensure_ascii=False, indent=2) + ";\n")
    return out.getvalue()


if __name__ == "__main__":
    data = build()
    with open("js/rffshop.js", "w", encoding="utf-8", newline="\n") as f:
        f.write(data)
    total = sum(len(s["secs"][0]["r"]) for s in SHOPS)
    print("written js/rffshop.js, shops=%d, items=%d" % (len(SHOPS), total))
