/* 与本页数据同源的分组表，供菜单与标题用；正文包里有同名的 GROUPS，
   所以这里换个名字，免得多一个 <script> 就撞一次 const 重声明。 */
var GROUPS_META = [
    {
        "key": "basic",
        "title": "基础知识",
        "en": "BASICS"
    },
    {
        "key": "life",
        "title": "牧场生活",
        "en": "FARM LIFE"
    },
    {
        "key": "event",
        "title": "活动事件",
        "en": "EVENTS"
    },
    {
        "key": "item",
        "title": "物品道具",
        "en": "ITEMS"
    },
    {
        "key": "lore",
        "title": "资料与设定",
        "en": "LORE"
    }
];
var PAGES_META = [
    {
        "key": "intro",
        "group": "basic",
        "title": "游戏简介",
        "icon": "scroll"
    },
    {
        "key": "diff",
        "group": "basic",
        "title": "移植版对照",
        "icon": "books",
        "gms": [
            "rf3",
            "rf4"
        ]
    },
    {
        "key": "spec",
        "group": "basic",
        "title": "配置与模拟器",
        "icon": "gear"
    },
    {
        "key": "world",
        "group": "basic",
        "title": "世界设定·符文",
        "icon": "globe"
    },
    {
        "key": "stage",
        "group": "basic",
        "title": "舞台与主角",
        "icon": "flag"
    },
    {
        "key": "time",
        "group": "basic",
        "title": "时间与季节",
        "icon": "clock"
    },
    {
        "key": "rp",
        "group": "basic",
        "title": "体力与 RP",
        "icon": "bolt"
    },
    {
        "key": "control",
        "group": "basic",
        "title": "操作方式",
        "icon": "pad"
    },
    {
        "key": "rfomain",
        "group": "basic",
        "title": "主线流程",
        "icon": "scroll",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "rfomap",
        "group": "basic",
        "title": "地图与出没",
        "icon": "compass",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "rfosail",
        "group": "basic",
        "title": "岛屿与打捞",
        "icon": "compass",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "rffevent",
        "group": "basic",
        "title": "主线与角色事件",
        "icon": "scroll",
        "gms": [
            "rff"
        ]
    },
    {
        "key": "rf3main",
        "group": "basic",
        "title": "主线流程",
        "icon": "scroll",
        "gms": [
            "rf3"
        ]
    },
    {
        "key": "battle",
        "group": "basic",
        "title": "战斗与弱点",
        "icon": "bolt"
    },
    {
        "key": "rfotip",
        "group": "basic",
        "title": "攻略本技巧",
        "icon": "star",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "boss",
        "group": "basic",
        "title": "BOSS 战",
        "icon": "skull",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rfo",
            "rf4",
            "rf5",
            "rff"
        ]
    },
    {
        "key": "farm",
        "group": "life",
        "title": "农场与田地",
        "icon": "sprout"
    },
    {
        "key": "home",
        "group": "life",
        "title": "自宅与扩建",
        "icon": "house2"
    },
    {
        "key": "shop",
        "group": "life",
        "title": "商店与设施",
        "icon": "shop"
    },
    {
        "key": "crop",
        "group": "life",
        "title": "农作",
        "icon": "seed"
    },
    {
        "key": "beast",
        "group": "life",
        "title": "魔物与伙伴",
        "icon": "monster"
    },
    {
        "key": "mbook",
        "group": "life",
        "title": "魔物图鉴",
        "icon": "paw"
    },
    {
        "key": "mine",
        "group": "life",
        "title": "采矿与钓鱼",
        "icon": "pick"
    },
    {
        "key": "cook",
        "group": "life",
        "title": "料理",
        "icon": "pot"
    },
    {
        "key": "craft",
        "group": "life",
        "title": "锻造与药学",
        "icon": "hammer"
    },
    {
        "key": "gear",
        "group": "life",
        "title": "装备打造·毕业套",
        "icon": "sword",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rff",
            "rfo",
            "rf4",
            "rf5"
        ]
    },
    {
        "key": "decorate",
        "group": "life",
        "title": "装饰与家具",
        "icon": "chair"
    },
    {
        "key": "rfosys",
        "group": "life",
        "title": "奖杯与许愿",
        "icon": "note",
        "gms": [
            "rfo"
        ]
    },
    {
        "key": "festival",
        "group": "event",
        "title": "年度节日",
        "icon": "calendar"
    },
    {
        "key": "love",
        "group": "event",
        "title": "恋爱与结婚",
        "icon": "ring"
    },
    {
        "key": "newly",
        "group": "event",
        "title": "新婚模式",
        "icon": "star",
        "gms": [
            "rf3",
            "rf4"
        ]
    },
    {
        "key": "request",
        "group": "event",
        "title": "委托任务",
        "icon": "board"
    },
    {
        "key": "weapon",
        "group": "item",
        "title": "武器",
        "icon": "sword"
    },
    {
        "key": "armor",
        "group": "item",
        "title": "防具",
        "icon": "shield"
    },
    {
        "key": "tool",
        "group": "item",
        "title": "农具",
        "icon": "hoe"
    },
    {
        "key": "material",
        "group": "item",
        "title": "素材与矿石",
        "icon": "gem"
    },
    {
        "key": "food",
        "group": "item",
        "title": "料理与食材",
        "icon": "bowl"
    },
    {
        "key": "potion",
        "group": "item",
        "title": "药品",
        "icon": "bottle"
    },
    {
        "key": "source",
        "group": "item",
        "title": "素材出处与掉落",
        "icon": "gem",
        "gms": [
            "rf1",
            "rf2",
            "rff",
            "rfo",
            "rf3",
            "rf4",
            "rf5",
            "azuma"
        ]
    },
    {
        "key": "perfume",
        "group": "item",
        "title": "香水与喜好",
        "icon": "bottle",
        "gms": [
            "rf3"
        ]
    },
    {
        "key": "rf1list",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rf1"
        ]
    },
    {
        "key": "rf2list",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rf2"
        ]
    },
    {
        "key": "rfflist",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rff"
        ]
    },
    {
        "key": "rf3list",
        "group": "item",
        "title": "物品一览",
        "icon": "bottle",
        "gms": [
            "rf3"
        ]
    },
    {
        "key": "gift",
        "group": "life",
        "title": "魔物喜好",
        "icon": "gift",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rf4",
            "rf5",
            "rff",
            "rfo"
        ]
    },
    {
        "key": "produce",
        "group": "life",
        "title": "宠物产出",
        "icon": "pot",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rff",
            "rfo"
        ]
    },
    {
        "key": "npcgift",
        "group": "life",
        "title": "村民喜好",
        "icon": "users",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rff",
            "rfo",
            "rf4",
            "rf5",
            "azuma"
        ]
    },
    {
        "key": "recipe",
        "group": "item",
        "title": "配方大全",
        "icon": "book",
        "gms": [
            "rf1",
            "rf2",
            "rff",
            "rfo",
            "rf3",
            "rf4",
            "rf5",
            "azuma"
        ]
    },
    {
        "key": "fx",
        "group": "item",
        "title": "状态与抗性",
        "icon": "bolt",
        "gms": [
            "rf4",
            "rf5"
        ]
    },
    {
        "key": "rune",
        "group": "item",
        "title": "符文能力",
        "icon": "bolt",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rf4",
            "rf5",
            "rfo"
        ]
    },
    {
        "key": "fish",
        "group": "item",
        "title": "鱼类图鉴",
        "icon": "fish"
    },
    {
        "key": "fishspot",
        "group": "item",
        "title": "钓点与季节",
        "icon": "fish",
        "gms": [
            "rf1",
            "rf2",
            "rf3",
            "rf4",
            "rf5",
            "rfo",
            "rff",
            "azuma"
        ]
    },
    {
        "key": "series",
        "group": "lore",
        "title": "系列作品一览",
        "icon": "books"
    },
    {
        "key": "lore",
        "group": "lore",
        "title": "国家与幻龙",
        "icon": "dragon"
    },
    {
        "key": "race",
        "group": "lore",
        "title": "种族",
        "icon": "mask"
    },
    {
        "key": "zhname",
        "group": "lore",
        "title": "中文译名对照",
        "icon": "board",
        "gms": [
            "rf1",
            "rff",
            "rfo"
        ]
    },
    {
        "key": "seriescmp",
        "group": "lore",
        "title": "跨作机制对照",
        "icon": "compass"
    },
    {
        "key": "bdcheck",
        "group": "life",
        "title": "生日核对",
        "icon": "users"
    },
    {
        "key": "changelog",
        "group": "lore",
        "title": "更新日志",
        "icon": "note"
    },
    {
        "key": "azuma_skill",
        "group": "life",
        "title": "村民技能",
        "icon": "book",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_npc",
        "group": "life",
        "title": "角色详情",
        "icon": "users",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_mon",
        "group": "life",
        "title": "魔物与喜好",
        "icon": "monster",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_boss",
        "group": "life",
        "title": "BOSS 战",
        "icon": "boss",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_cook",
        "group": "life",
        "title": "料理配方",
        "icon": "pot",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_village",
        "group": "life",
        "title": "村庄升级",
        "icon": "flag",
        "gms": [
            "azuma"
        ]
    },
    {
        "key": "azuma_artifact",
        "group": "life",
        "title": "神器与舞",
        "icon": "note",
        "gms": [
            "azuma"
        ]
    }
];
var PAGE_COUNT = PAGES_META.length;

/* 条目可见性：带 gms 的条目只在指定作品下出现。
   放这里而不是 pages.js —— 首页、目录、名册都要用它，但那时正文包还没下。 */
function pageVis(p, g) {
    return !p.gms || (g && p.gms.indexOf(g.id) >= 0);
}
