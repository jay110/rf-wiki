/* 符文工房2 锻造／农具／药学配方 —— craft 页 RF2 分支用
 * 武器 7 系 + 农具 1 系：取自 almarsguides.com (Rune Factory 2 Forging Recipes，英文)
 * 农具 5 类另核 neoseeker (Rune Factory 2 Forging FAQ Tools 段)
 * 药学：取自 wiki.biligame.com RF2recipepharmacy（中文，含卖价买价）
 * 铁律：RF2 无官方中文，武器/工具名保留英文；材料名转中文圈通用译名。
 * 由 _build_rf2_forge.py 生成，勿手改。
 */
var RF2_CRAFT = {
  "src": "almarsguides.com (Rune Factory 2 Forging Recipes) + neoseeker (Forging FAQ Tools) + wiki.biligame.com (RF2recipepharmacy)",
  "note": "《符文工房2》无官方中文译名，武器／工具名保留英文；锻造材料名采用中文圈通用译名。升级链「素材一览」里若出现前一级武器名，即表示从该武器升级而来。",
  "families": [
    {
      "name": "短剑系 Shortsword",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "Steel Sword",
          "9",
          "阔剑 + 青铜 + 铁×2"
        ],
        [
          "Defender",
          "16",
          "青铜 + 公牛角 + 铁 + 豹爪 + 银 + Steel Sword"
        ],
        [
          "Cutlass",
          "17",
          "Defender + 金 + 上等布 + 骷髅×2 + 坚固绳"
        ],
        [
          "Windsword",
          "20",
          "虫皮 + 铁 + 上等布 + 蝎钳 + Steel Sword + 风之结晶"
        ],
        [
          "Gaia Sword",
          "23",
          "地之结晶 + 硬角 + 铁 + 魔法粉 + 根 + Steel Sword"
        ],
        [
          "Luck Blade",
          "23",
          "阔剑 + 火药 + 兜帽 + 铁 + 豹爪 + 蝎钳"
        ],
        [
          "Sakura",
          "25",
          "阔剑 + 魔法水晶 + 铁 + 毒粉 + 蝎尾 + 孢子"
        ],
        [
          "Burnin' Blade",
          "26",
          "箭头 + 火之结晶 + 巨人之爪 + 铁 + 孢子 + Steel Sword"
        ],
        [
          "Aquasword",
          "29",
          "铁 + 根 + Steel Sword + 坚固绳 + 龟壳 + 水之结晶"
        ],
        [
          "Platinum Sword",
          "30",
          "破损的柄 + Defender + 胶水 + 白金 + 银"
        ],
        [
          "Aerial Blade",
          "32",
          "上等布 + 银 + 闪光绳 + 斑纹皮 + 风之结晶"
        ],
        [
          "Smash Blade",
          "34",
          "金 + 硬角 + Luck Blade + 豹爪 + 植物茎 + 斑纹皮"
        ],
        [
          "Sunspot",
          "36",
          "火之结晶 + 巨人之手 + 金 + 魔法水晶 + Raventine + 闪光绳"
        ],
        [
          "Durandel",
          "36",
          "廉价布 + Cutlass + 胶水 + 小结晶 + 愤怒之牙 + 狼牙"
        ],
        [
          "Grantale",
          "40",
          "公牛角 + 地之结晶 + Gaia Sword + 虫颚 + 植物茎 + 龟壳"
        ],
        [
          "Icifier",
          "42",
          "Aquasword + 上等布 + 蝎钳 + 银 + 龟壳 + 水之结晶"
        ],
        [
          "Raventine",
          "45",
          "Burnin's Blade + 火之结晶 + 虫皮 + 南瓜 + 银 + 骷髅"
        ],
        [
          "Soul Eater",
          "47",
          "铁 + 毒粉 + 上等布 + 根 + Sakura + 蝎尾"
        ],
        [
          "Dragonslayer",
          "48",
          "恶魔之血 + 鱼化石 + 巨人之爪 + 小结晶 + 魔法水晶 + Platinum Sword"
        ],
        [
          "Chaos Blade",
          "51",
          "鸟翼 + 便宜绷带 + 巨人之手 + 魔法粉 + Soul Eater + 斑纹皮"
        ],
        [
          "Gravios",
          "52",
          "巨人之爪 + 铁 + 豹爪 + 银 + Smash Blade + 闪光绳"
        ]
      ],
      "totals": []
    },
    {
      "name": "长剑系 Longsword",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "Zweihander",
          "11",
          "青铜×2 + 阔剑 + 铁"
        ],
        [
          "Greatsword",
          "18",
          "廉价布 + 植物茎 + 闪光绳 + 斑纹皮 + 孢子 + Zweihander"
        ],
        [
          "Cyclone Blade",
          "19",
          "阔剑 + 铁 + 根 + 龟壳 + 风之结晶 + 羊毛球"
        ],
        [
          "Flame Saber",
          "22",
          "廉价布 + 阔剑 + 火之结晶 + 铁 + 植物茎 + 蝎钳"
        ],
        [
          "Sea Cutter",
          "25",
          "阔剑 + 魔法水晶 + 闪光绳 + 斑纹皮 + 龟壳 + 水之结晶"
        ],
        [
          "Earth Shade",
          "28",
          "阔剑 + 地之结晶 + 虫皮 + 植物茎 + 根 + 孢子"
        ],
        [
          "Poison Blade",
          "30",
          "箭头 + 阔剑 + 虫颚 + 毒粉 + 蝎钳 + 结实藤蔓"
        ],
        [
          "Heaven Asunder",
          "33",
          "公牛角 + Cyclone Blade + 火药 + 战士之证 + 上等布 + 风之结晶"
        ],
        [
          "Katana",
          "33",
          "鱼化石 + 胶水 + Greatsword + 小结晶 + 肩甲片 + 银"
        ],
        [
          "Flamberge",
          "36",
          "箭头 + 鸟翼 + Greatsword + 战士之证 + 上等毛皮 + 结实藤蔓"
        ],
        [
          "Shine Blade",
          "36",
          "Flame Saber + 火之结晶 + 巨人之手 + 魔法水晶 + 龟壳 + 羊毛球"
        ],
        [
          "Snow Crown",
          "39",
          "巨人之手 + 魔法粉 + 上等毛皮 + 海毛皮 + Sea Cutter + 龟壳 + 水之结晶"
        ],
        [
          "Katzbalger",
          "40",
          "箭头 + Flamberge + 魔法水晶 + 蝎钳 + 坚固绳 + 结实藤蔓"
        ],
        [
          "Grand Smasher",
          "42",
          "廉价布 + 地之结晶 + Earth Shade + 毛皮 + 火药 + 硬角"
        ],
        [
          "Dancing Dicer",
          "43",
          "箭头 + 硬角 + Katana + 豹爪 + 上等布 + 蝎尾"
        ],
        [
          "Bio Smasher",
          "44",
          "廉价布 + 巨人之爪 + 虫皮 + Poison Blade + 毒粉 + 骷髅"
        ],
        [
          "Punisher",
          "49",
          "破箱 + 恶魔之角 + Katzbalger + 小结晶 + 愤怒之牙 + 丝布"
        ],
        [
          "Blue Eyed Blade",
          "56",
          "Dancing Dicer + 巨人之爪 + 豹爪 + 蝎尾 + 坚固绳 + 结实藤蔓"
        ],
        [
          "Moon Shadow",
          "65",
          "Blue Eyed Blade + 公牛角 + 便宜绷带 + 胶水 + 小结晶 + 狼牙"
        ],
        [
          "Balmung",
          "80",
          "破箱 + 恶魔之角 + 妖精之粉 + Punisher + 愤怒之牙 + 丝布"
        ],
        [
          "Steel Slicer",
          "92",
          "恶魔之血 + 鱼化石 + Moon Shadow + 豹爪 + 白金 + Wolf"
        ]
      ],
      "totals": []
    },
    {
      "name": "斧系 Axe",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "Battle-Axe",
          "18",
          "战斧 + 青铜×2 + 铁"
        ],
        [
          "Alldale",
          "22",
          "毛皮 + 铁 + 长柄斧 + 战士之证 + 根 + 蝎尾"
        ],
        [
          "Great Axe",
          "27",
          "公牛角 + 虫皮 + 长柄斧 + 蝎尾 + 银 + 结实藤蔓"
        ],
        [
          "Demon Axe",
          "34",
          "Alldale + 鸟翼 + 金 + 魔法粉 + 毒粉 + 骷髅"
        ],
        [
          "Crescent Axe+",
          "38",
          "箭头 + 破损的柄 + Great Axe + 植物茎 + 斑纹皮 + 狼牙"
        ],
        [
          "Tomahawk",
          "40",
          "战斧 + 鸟翼 + 兜帽 + 虫颚 + 豹爪 + 风之结晶"
        ],
        [
          "Frost Axe",
          "44",
          "战斧 + 便宜绷带 + 上等毛皮 + 闪光绳 + 斑纹皮 + 水之结晶"
        ],
        [
          "Heat Axe",
          "49",
          "战斧 + 火之结晶 + 虫皮 + 魔法水晶 + 战士之证 + 孢子"
        ],
        [
          "Double Edge",
          "50",
          "破箱 + Crescent Axe + 恶魔之角 + 锤碎片 + 愤怒之牙 + 坚固绳"
        ],
        [
          "Rock Axe",
          "56",
          "破损的柄 + 地之结晶 + 妖精之粉 + 长柄斧 + 战士之证"
        ],
        [
          "Saint Axe",
          "65",
          "恶魔之血 + Double Edge + 妖精之粉 + 小结晶 + 魔法粉 + 丝布"
        ]
      ],
      "totals": []
    },
    {
      "name": "战锤系 Hammer",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "War Hammer",
          "5",
          "战锤 + 青铜×2 + 铁"
        ],
        [
          "Great Hammer",
          "22",
          "箭头 + 廉价布 + 虫皮 + 铁 + 植物茎 + War Hammer"
        ],
        [
          "Flame Hammer",
          "29",
          "战锤 + 便宜绷带 + 火之结晶 + 硬角 + 魔法粉 + 羊毛球"
        ],
        [
          "Schnabel",
          "32",
          "巨人之爪 + 巨人之手 + 战士之证 + 蝎钳 + 银 + War Hammer"
        ],
        [
          "Ice Hammer",
          "34",
          "战锤 + 妖精之粉 + 巨人之爪 + 巨人之手 + 肩甲片 + 水之结晶"
        ],
        [
          "Sky Hammer",
          "36",
          "战锤 + 鸟翼 + 毛皮 + 根 + 坚固绳 + 风之结晶"
        ],
        [
          "Spiked Hammer",
          "37",
          "廉价布 + 胶水 + Great Hammer + 上等毛皮 + 肩甲片 + 银"
        ],
        [
          "Bone Hammer",
          "40",
          "恶魔之血 + 恶魔之角 + 火药 + 锤碎片 + 愤怒之牙 + Schnabel"
        ],
        [
          "Gigant Hammer",
          "42",
          "金 + Great Hammer + 锤碎片 + 虫颚 + 孢子 + 狼牙"
        ],
        [
          "Gravit Hammer",
          "50",
          "破损的柄 + 地之结晶 + 妖精之粉 + Gigant Hammer + 兜帽 + 结实藤蔓"
        ],
        [
          "Crystal Hammer",
          "60",
          "金 + 锤碎片 + Ice Hammer + 上等布 + 丝布"
        ]
      ],
      "totals": []
    },
    {
      "name": "枪系 Spear（含长柄杖）",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "Lance",
          "12",
          "青铜×2 + 铁 + 枪"
        ],
        [
          "Wooden Staff",
          "15",
          "萝卜 + 地之结晶 + 根 + 枪 + 坚固绳 + 结实藤蔓"
        ],
        [
          "Needle Spear",
          "20",
          "青铜 + 铁 + 植物茎 + 枪 + 孢子 + 坚固绳"
        ],
        [
          "Halberd",
          "23",
          "箭头 + 硬角 + 虫皮 + 蝎尾 + 银 + 枪"
        ],
        [
          "Water Spear",
          "24",
          "廉价布 + 蝎钳 + 枪 + 坚固绳 + 龟壳 + 水之结晶"
        ],
        [
          "Poison Spear",
          "26",
          "巨人之爪 + 毒粉 + 根 + 蝎尾 + 银 + 枪"
        ],
        [
          "Corsesca",
          "27",
          "廉价布 + Halberd + 硬角 + 铁 + 豹爪 + 闪光绳"
        ],
        [
          "Heavy Lance",
          "30",
          "鸟翼 + 公牛角 + 火药 + Lance + 银 + 结实藤蔓"
        ],
        [
          "Flare Lance",
          "35",
          "箭头 + 火之结晶 + Heavy Lance + 蝎钳 + 蝎尾 + 番茄"
        ],
        [
          "Iseberk",
          "40",
          "虫颚 + 骷髅 + 龟壳 + 水之结晶 + Water Spear + 羊毛球"
        ],
        [
          "Blood Lance",
          "40",
          "便宜绷带 + Flare Lance + 毒粉 + 战士之证 + 骷髅 + 孢子"
        ],
        [
          "Monk Staff",
          "43",
          "地之结晶 + 巨人之爪 + 魔法水晶 + 上等布 + 闪光绳 + Wooden Staff"
        ],
        [
          "Silent Grave",
          "46",
          "巨人之手 + Halberd + 硬角 + 魔法水晶 + 上等布"
        ],
        [
          "Metus",
          "46",
          "Blood Lance + 巨人之手 + 豹爪 + 毒粉 + 斑纹皮 + 孢子"
        ],
        [
          "Overbreak",
          "48",
          "公牛角 + 便宜绷带 + Corsesca + 兜帽 + 虫颚 + 战士之证"
        ],
        [
          "Bjor",
          "52",
          "火药 + 虫颚 + Needle Spear + 毒粉 + Poison Spear + 蝎尾"
        ],
        [
          "Belvarose",
          "59",
          "鱼化石 + 胶水 + Metus + Monk Staff + 肩甲片 + 狼牙"
        ],
        [
          "Gae Bolg",
          "63",
          "鸟翼 + 恶魔之角 + 愤怒之牙 + Silent Grave + 狼牙 + 羊毛球"
        ],
        [
          "Dragon's Fang",
          "70",
          "Belvarose + 鱼化石 + 毛皮 + 兜帽 + 上等布 + 狼牙"
        ],
        [
          "Trident",
          "73",
          "鱼化石 + Gae Bolg + 胶水 + 豹爪 + 上等毛皮 + 肩甲片"
        ],
        [
          "Gungnir",
          "90",
          "破箱 + 恶魔之血 + 恶魔之角 + Overbreak + 愤怒之牙 + 丝布"
        ]
      ],
      "totals": []
    },
    {
      "name": "法杖系 Rod",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "Staff",
          "13",
          "虫皮 + 植物茎 + 杖 + 根 + 孢子 + 玩具草"
        ],
        [
          "Silver Staff",
          "18",
          "苹果 + 廉价布 + 岩石 + 杖 + 银 + 闪光绳"
        ],
        [
          "Flare Staff",
          "25",
          "火之结晶 + 火药 + 铁 + 魔法粉 + 上等布 + 杖"
        ],
        [
          "Earth Staff",
          "28",
          "地之结晶 + 巨人之手 + 虫颚 + 铁 + 魔法粉 + 杖"
        ],
        [
          "Ice Staff",
          "30",
          "箭头 + 魔法粉 + 铁 + 杖 + 龟壳 + 水之结晶"
        ],
        [
          "Lightning Rod",
          "34",
          "鸟翼 + 铁 + 魔法粉 + 杖 + 骷髅 + 风之结晶"
        ],
        [
          "Wizard's Staff",
          "38",
          "廉价布 + 魔法水晶 + 魔法粉 + 斑纹皮 + Staff + 羊毛球"
        ],
        [
          "Mage's Staff",
          "39",
          "小结晶 + 魔法水晶 + 根 + Silver Staff + 闪光绳"
        ],
        [
          "Rune Staff",
          "46",
          "破箱 + 破损的柄 + 毛皮 + 胶水 + 锤碎片 + Mage's Staff"
        ]
      ],
      "totals": []
    },
    {
      "name": "盾系 Shield",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "Bronze Shield",
          "16",
          "青铜×2 + 铁 + 小盾"
        ],
        [
          "Magic Shield",
          "20",
          "廉价布 + 魔水晶 + 植物茎 + 小盾 + 斑纹皮"
        ],
        [
          "Round Shield",
          "27",
          "Bronze Shield + 廉价布 + 铁×2 + 根 + 银"
        ],
        [
          "Platinum Shield",
          "34",
          "Giant's Glove + 硬角 + 白金×2 + 上等布 + Round Shield"
        ],
        [
          "Tortoise Shield",
          "35",
          "Platinum Shield + 龟壳×4"
        ],
        [
          "Prism Shield",
          "36",
          "Magic Shield + 植物茎 + 毒粉 + 根 + 闪光绳 + 孢子"
        ],
        [
          "Bone Shield",
          "37",
          "廉价布 + 巨人之爪 + 骷髅×2 + Tortoise Shield"
        ],
        [
          "Kite Shield",
          "38",
          "便宜绷带 + 金 + Heavy Shield + 兜帽 + 白金 + 战士之证"
        ],
        [
          "Chaos Shield",
          "41",
          "Bone Shield + 鱼化石 + 虫颚 + 毒粉 + 上等毛皮 + 骷髅"
        ],
        [
          "Heavy Shield",
          "43",
          "硬角 + 虫皮 + 铁×2 + 白金 + Platinum Shield"
        ],
        [
          "Magical Shield",
          "49",
          "妖精之粉 + 金 + 小结晶 + Prism Shield + 蝎钳 + 肩甲片"
        ],
        [
          "Knight Shield",
          "55",
          "虫颚 + Kite Shield + 白金 + 战士之证 + 上等毛皮 + 狼牙"
        ],
        [
          "Element Shield",
          "59",
          "破损的柄 + 恶魔之血 + 恶魔之角 + 兜帽 + Magical Shield + 丝布"
        ],
        [
          "Rune Shield",
          "68",
          "破箱 + 公牛角 + Chaos Shield + 胶水 + Knight Shield + 愤怒之牙"
        ]
      ],
      "totals": []
    },
    {
      "name": "农具系 Tools",
      "cols": [
        "名称",
        "等级",
        "素材一览"
      ],
      "rows": [
        [
          "Iron Hammer",
          "5",
          "旧锤 + 青铜×2 + 铁"
        ],
        [
          "Silver Hammer",
          "9",
          "Iron Hammer + 铁×2 + 青铜 + 银"
        ],
        [
          "Gold Hammer",
          "13",
          "Silver Hammer + 金×3 + 银×2"
        ],
        [
          "Platinum Hammer",
          "17",
          "Gold Hammer + 白金×3 + 金 + 闪光绳"
        ],
        [
          "Chopping Axe",
          "5",
          "旧斧 + 铁×2 + 青铜"
        ],
        [
          "Lumber Axe",
          "9",
          "Chopping Axe + 铁×2 + 青铜 + 银"
        ],
        [
          "Mountain Axe",
          "13",
          "Lumber Axe + 金×3 + 银×2"
        ],
        [
          "Miracle Axe",
          "17",
          "Mountain Axe + 白金×3 + 金 + 羊毛球"
        ],
        [
          "Iron Sickle",
          "5",
          "旧镰 + 铁×3"
        ],
        [
          "Quality Sickle",
          "9",
          "Iron Sickle + 铁×2 + 青铜 + 银"
        ],
        [
          "Super Sickle",
          "13",
          "Quality Sickle + 金×3 + 银×2"
        ],
        [
          "Legend Sickle",
          "17",
          "Super Sickle + 白金×3 + 金 + 箭头"
        ],
        [
          "Tin Waterpot",
          "5",
          "旧水壶 + 青铜×3"
        ],
        [
          "Lion Waterpot",
          "9",
          "Tin Waterpot + 铁×2 + 青铜 + 银"
        ],
        [
          "Rainbow Waterpot",
          "13",
          "Lion Waterpot + 金×3 + 银×2"
        ],
        [
          "Joy Waterpot",
          "17",
          "Rainbow Waterpot + 白金×2 + 金 + 红宝石 + 斑纹皮"
        ],
        [
          "Sturdy Hoe",
          "5",
          "旧锄 + 铁×2 + 青铜"
        ],
        [
          "Seasoned Hoe",
          "9",
          "Sturdy Hoe + 铁×2 + 青铜 + 银"
        ],
        [
          "Shiny Hoe",
          "13",
          "Seasoned Hoe + 金×3 + 银×2"
        ],
        [
          "Blessed Hoe",
          "17",
          "Shiny Hoe + 白金×3 + 植物茎"
        ]
      ],
      "totals": []
    }
  ],
  "pharmacy": {
    "cols": [
      "中文名",
      "等级",
      "材料",
      "效果",
      "卖价",
      "买价"
    ],
    "rows": [
      [
        "恢复壶",
        "6",
        "绿草、药草、空瓶",
        "HP恢复100",
        "—",
        "—"
      ],
      [
        "疗愈壶",
        "16",
        "蓝草、绿草、药草、空瓶",
        "HP恢复300",
        "—",
        "—"
      ],
      [
        "神秘壶",
        "26",
        "蓝草、绿草、蜂蜜、药草、空瓶",
        "HP恢复600",
        "—",
        "—"
      ],
      [
        "中和剂",
        "18",
        "青椒、魅蓝草、解毒草",
        "净化毒沼泽",
        "50",
        "100"
      ],
      [
        "速速绿",
        "51",
        "水之结晶、古代鱼的骨头、结实的藤蔓、地之结晶、小仙子的粉末",
        "农作物Lv+1",
        "4000",
        "12000"
      ],
      [
        "营养剂α",
        "37",
        "根、结实的藤蔓、地之结晶",
        "农作物早1天成熟",
        "500",
        "2000"
      ],
      [
        "营养剂β",
        "41",
        "小仙子的粉末、结实的藤蔓、地之结晶",
        "农作物早2天成熟",
        "700",
        "4000"
      ],
      [
        "营养剂γ",
        "46",
        "恶魔之血、结实的藤蔓、地之结晶",
        "农作物早3天成熟",
        "900",
        "6000"
      ],
      [
        "友情糖浆",
        "44",
        "曲奇饼干、甜甜圈、金",
        "提升村民好感度",
        "15",
        "50"
      ],
      [
        "ZOKKON",
        "52",
        "恋爱的预感、少女蜜瓜、少女蜜瓜、火热果实、战士之证",
        "提升候补爱情度",
        "15",
        "50"
      ],
      [
        "蛋・白・质",
        "55",
        "菠菜、根、战士之证、魔人之角、恶魔之血",
        "力量+1",
        "2500",
        "6250"
      ],
      [
        "智力补品",
        "46",
        "茄子、蓝草、魔法之粉、魔力结晶、黄瓜",
        "智力+1",
        "2800",
        "7000"
      ],
      [
        "生命果冻",
        "56",
        "巨人的手套、牛奶L、龟壳、巨人之爪、金刚花",
        "体力+1",
        "2500",
        "6250"
      ],
      [
        "心灵饮料",
        "51",
        "粉红猫、草莓、火热果实、根、火之结晶",
        "HP上限+3",
        "5500",
        "13750"
      ],
      [
        "解毒药",
        "16",
        "绿草、解毒草",
        "解毒",
        "130",
        "325"
      ],
      [
        "解麻药",
        "20",
        "药草、黄草",
        "HP恢复30,解麻痹",
        "300",
        "750"
      ],
      [
        "解封丸",
        "26",
        "紫草、蓝草、药草",
        "HP恢复30,解封印",
        "200",
        "500"
      ],
      [
        "感冒药",
        "32",
        "红草、葱、绿草、苦橙草",
        "HP恢复30,解感冒",
        "350",
        "875"
      ],
      [
        "超级营养药",
        "70",
        "白草、竹笋、鸡蛋M、黑草、鸡蛋S、鸡蛋L",
        "HP恢复-200、解毒封印麻痹感冒、力/智/体+30、抗性+50%",
        "700",
        "1750"
      ],
      [
        "健康之源",
        "72",
        "蜂蜜、葡萄酒、昆虫的下颚、小仙子的粉末",
        "RP恢复50、解毒封印麻痹感冒、抗性+25%",
        "1200",
        "3000"
      ],
      [
        "无敌秘药",
        "65",
        "根、龟壳、小仙子的粉末、骷髅",
        "HP恢复300、解毒封印麻痹感冒、HP上限+200、力/智/体+20、抗性+75%",
        "1800",
        "4500"
      ],
      [
        "符文药水",
        "63",
        "四叶草、奶酪L、蛋黄酱L、毛线球L、酸奶L、四叶草",
        "角色Lv+1",
        "5300",
        "13250"
      ],
      [
        "地狱辣椒",
        "10",
        "红草、红草",
        "调味料（料理材料）",
        "250",
        "625"
      ],
      [
        "甘甜粉",
        "10",
        "苹果、苹果",
        "调味料（料理材料）",
        "340",
        "850"
      ],
      [
        "酸味香料",
        "10",
        "橘子、黄草",
        "调味料（料理材料）",
        "450",
        "1125"
      ],
      [
        "混合香料",
        "10",
        "月落草、托伊药草、粉红猫、魅蓝草",
        "调味料（料理材料）",
        "2400",
        "6000"
      ],
      [
        "宠物饲料包",
        "13",
        "饲料、钩吻鲑、甘甜粉、地狱辣椒",
        "增加20个宠物饲料",
        "340",
        "680"
      ]
    ]
  }
};
