# 符文5 头像：ch 编号 ↔ 人物

头像来自 PC 版（Unity）的 `FaceIconSpriteAtlas`，游戏内 HUD 小头像，约 62×64 像素。
bundle 名与容器路径都是哈希，只有对象名（m_Name）是 `Icon_chNNN`，所以编号是唯一的线索。

## 三条互相印证的线索

1. **NpcLifeCycleTable 编号**：`Assets/AddressableAssets/All/Event/NpcLifeCycleTable/02_Prisila`，
   对应的 TextAsset 名 `02_Prisila`、`03_Lucy`、`04_Scalet`、`05_Fuca`、`06_Beatris`、
   `07_Rudomira`、`08_Matin`、`09_Cecil`、`10_Murakumo`、`11_Ryuka`、`12_Rainhalt`、
   `13_Lucs`、`14_Elche`、`15_Viviage`、`16_Heinz`、`17_Randlf`、`18_Yuki`、`19_Simone`、
   `20_Misasagi`、`21_Terry`、`22_Rivia`、`24_Ladia`、`26_Dog`、`27_Julian`、`28_Hina`、
   `29_Baby`、`30_ChildBoy`、`31_ChildGirl`、`32_Guest1`、`33_Guest2`。
2. **立绘目录**：`Assets/Sprites/CharactorSprite/BU_02Ali`、`BU_03Prs`、`BU_04Luy`、`BU_05Sca`、
   `BU_06Fuq`、`BU_07Bea`、`BU_08Ldm`、`BU_09Mtn`、`BU_10Cec`、`BU_11Mur`、`BU_12Lyk`、
   `BU_13Reh`、`BU_14Lcs`、`BU_19Yuk`、`BU_23Riv`、`BU_24Led`、`BU_27Hna`、`BU_32CG103`、`BU_37Osw`。
   这一套比上面整体 +1（`BU_19Yuk` ↔ `18_Yuki`、`BU_23Riv` ↔ `22_Rivia`），起点是 `BU_01` = 男主。
3. **发色与配饰**：把头像与官网（runefactory.marv.jp）立绘各自取「包围盒上 30% 的主色」做比对，
   色距最小的那位即候选（见 `_rf5_match2.py`）。极端特征（Heinz 的亮黄、Viviage 的橙红帽、
   Murakumo 的紫、Misasagi 的蓝）几乎不会撞车。

## 结论

ch 编号基本等于 NpcLifeCycle 的编号（ch026=ドグ、ch027=ジュリアン、ch028=ヒナ 三连色距都在 3 以内，
可以直接钉死），但 **ch015 / ch016 两处编号表与发色相反**：编号表是 15_Viviage、16_Heinz，
色距却是 ch015=Heinz(6)、ch016=Viviage(2)，两个特征色都极鲜明，按发色定案。

| ch | 人物 | 依据 |
|----|------|------|
| 000 | アレス | 编号起点；蓝帽金发，与表情差分 ch030 是同一张脸 |
| 001 | アリス | 红贝雷帽金长发 |
| 002 | プリシラ | 编号表 02；粉长发 |
| 003 | ルーシー | 编号表 03 |
| 004 | スカーレット | 编号表 04；绿系发色 + 尖耳（半精灵）|
| 005 | フーカ | 编号表 05；兽耳 |
| 006 | ベアトリス | 编号表 06 |
| 007 | ルドミラ | 编号表 07；色距 9，红宽檐帽 |
| 008 | マーティン | 编号表 08 |
| 009 | セシル | 编号表 09；色距 7 |
| 010 | むらくも | 编号表 10；色距 6，紫发 |
| 011 | リュカ | 编号表 11；色距 3 |
| 012 | ラインハルト | 编号表 12 |
| 013 | ルーカス | 编号表 13 |
| 014 | エルシェ | 编号表 14；色距 5 |
| 015 | ハインツ | 色距 6（亮黄）；编号表作 16 |
| 017 | ランドルフ | 编号表 17；白厨师帽 |
| 018 | ユキ | 编号表 18；色距 9 |
| 019 | シモーヌ | 编号表 19；色距 4 |
| 020 | みささぎ | 编号表 20；色距 8 |
| 021 | テリー | 编号表 21；色距 2 |
| 022 | リヴィア | 编号表 22；色距 6 |
| 024 | レディア | 编号表 24 |
| 026 | ドグ | 编号表 26；色距 3 |
| 027 | ジュリアン | 编号表 27；色距 2 |
| 028 | ヒナ（阳菜）| 编号表 28；色距 1，被主角救下的兽人女孩 |
| 034 | オズワルド | 编号表之外；棕发 + 羽饰头巾 + 胡子，色距 5 |

## 没接进来的

- ch023 / ch025 / ch029：没有基础头像。
- ch030 / ch031：主角的常服差分（各 36 张表情），与 ch000 / ch001 同一张脸，暂不用。

---

# 补记：128px 那包（Icon_HUD_chNNN）与三个漏掉的人

2026-10-29 复查 PC 版时又找出**第二套头像**：`a387f7ce68116c82c1e7041b365f4dcb.bundle`
里的 `Icon_HUD_chNNN`，108 张、**128×128**（上面那套 `Icon_chNNN` 只有 64px）。
定位方式是解析 `catalog.json` 的地址表（`m_InternalIds` + `m_KeyDataString` 用
.NET 7-bit 变长长度前缀，`m_EntryDataString` 每条 7 个 int32），资源路径
`Assets/AddressableAssets/All/Sprites/Icon/FaceIconSpriteAtlas.spriteatlas` → 依赖 key → bundle 哈希。
脚本：`_build_face_rf5_hud.py`。

**两套的 15/16 是互换的，不能混用**：HUD 包里 15 = パルモ、16 = ハインツ（与编号表一致）；
上面那套 `Icon_chNNN` 反过来。原因是分两次打包，顺序不同。

**HUD 编号是紧凑排布**——把表里 23、25 两个空号跳过了，所以：

| HUD ch | 人物 | 编号表 |
|--------|------|--------|
| 023 | レディア | 24_Ladia |
| 024 | ドグ（矮人铁匠）| 26_Dog |
| 025 | ジュリアン | 27_Julian |
| 026 | ヒナ（阳菜，粉发兽耳）| 28_Hina |

**三个原先"未能核实"的已定案**：

- **ch015 = パルモ（帕尔摩）**。日文全名 Palmo Crasi Viviage —— 姓就是编号表的 `15_Viviage`；
  英文报道描述他「和 RF4 的波可琳很像，是镇上木匠/建筑师」，ch015 立绘正是那种花哨大汉，
  与 ch016（金发黄胡子 = ハインツ）分得很开。
- **ch032 = ダグ（塔克），ch033 = マルグリット（玛格丽特）**。两位是《符文工房4 豪华版》
  存档联动来客，表里记为 `32_Guest1` / `33_Guest2`；萌娘百科原文：「塔克和瑪格麗特會來到里格巴斯」。
  与站内 RF4 的 `assets/face/rf4/doug.png`（红发尖耳）和 `margaret.png`（金发精灵 + 金色角饰）
  逐张比对，**同一设计**，不是相似。

已用这 3 张补进 `assets/face/rf5/`（palmo / dag / margaret，均 128px），
`js/faces.js` 加 `'パルモ' / 'ダグ' / 'マーガレット'` 三个键。

**顺带发现名册问题（未改，待定）**：`js/npcfull.js` 的 rf5 名录里 `ヒナ`（阳菜）与
`ひな`（妃那）是同一个人的两条（假名写法不同来源各录了一次），`ひな` 至今无色块头像。
要不要合并成一条，需要拍板。

