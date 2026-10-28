# 符文工房攻略百科（Rune Factory Wiki · 中文）

一个纯静态、可离线运行的符文工房（ルーンファクトリー / Rune Factory）系列中文资料站。

结构参考 [mineraltown.net](https://wiki.mineraltown.net/setting) 的栏目划分与版式风格，
数据则来自各作原始表格的整理与校对，**每部作品的物品、魔物、作物、钓点数据互相独立**，
不混用通用表。

**在线地址**：<https://jay110.github.io/rf-wiki/>　（GitHub Pages，随 `main` 分支自动构建）

![站点预览](preview.png)

## 特性

- 纯静态：无 CDN、无构建步骤、无后端，双击 `index.html` 即可运行
- Hash 路由单页应用：`#/` 是站点主页，`#/wiki` 是攻略目录，`#/page/<页面key>` 是具体条目
  （主页与攻略目录分开，结构参照矿石镇的攻略百科）
- 移动端优先：430px 宽度下表格横向滚动，不压成竖排
- 全站搜索：不只搜页面标题——当前作品四千多行数据表里的每个条目名都建了索引，
  输入即出建议，点结果跳到该页并高亮那一行（同名条目自动合并，多词搜不到时退回首词）
- 人物名册：7 部作品 195 人，每位带生日、声优、四档送礼喜好与回礼；
  可按「结婚候补／居民」筛选，也能一键按生日排出春夏秋冬的顺序，
  人名与礼物名都进了全站搜索（搜「金刚花」能翻出谁最喜欢它）
- 每日行程：符文1 的 28 位村民 × 8 种星期状态 × 19 个整点，两种看法共用一套数据——
  「按人看」同一地点的连续小时并成一格，格宽即停留时长，点地点格点亮同栋建筑里的其他人；
  「按时段看」反过来，选一个整点列出全村人按建筑分组、各待至几点（`#/sched/rf1`）
- 行程也进搜索：搜地名（旅馆、卡西米尔遗迹）或俗称（6洞）能翻出谁在那儿出没
- 数据驱动：新增一部作品只需追加一个 `js/xxxdata.js`

## 本地运行

直接双击 `index.html`。若浏览器限制 `file://` 下的资源加载，可起一个本地服务：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 目录结构

```
index.html          入口（脚本加载顺序在此定义）
css/main.css        布局、导航、主题
css/content.css     正文组件：表格、区块、分节
js/app.js           路由、渲染、搜索
js/pages.js         全部页面的结构定义与正文（最大文件）
js/icons.js         内联 SVG 图标

js/data.js          系列作品一览
js/items.js         RF1–RF4 物品
js/items4.js        RF4 物品补充
js/monsters.js      魔物总表
js/mon4.js          RF4 魔物
js/monrfo.js        RFO 魔物
js/resist.js        属性抗性
js/resist4.js       RF4 属性抗性
js/recipes.js       配方
js/fish.js          鱼类资料
js/fishspot.js      RF5 钓点
js/fishspot4.js     RF4 钓点
js/npcfull.js       人物档案（7 部作品 195 人：生日 / 声优 / 喜好 / 回礼）
js/sched.js         符文1 村民每日行程表（28 人 × 8 种星期 × 19 个整点）
js/boss.js          BOSS 战数据（符文1／2／3／海洋，71 条剧情与迷宫 BOSS）
js/faces.js         角色头像映射（日文名 → assets/face/<作>/ 下的文件名，符文1／2 已接）
js/npcdata.js       村民喜好（RF4 / RF5，解包表横向统计用）
js/cropdata.js      RF4 作物
js/rf1data.js       RF1 数据
js/rf2data.js       RF2 数据
js/rf3data.js       RF3 数据
js/rffdata.js       RFF 数据
js/extradata.js     扩展数据

_build_*.py         数据构建脚本（从源表格生成 js/*.js，非运行时依赖）
_xlsx_read.py       零依赖 xlsx 解析器
```

## 数据说明

`js/*.js` 中的数据文件均由 `_build_*.py` 从原始表格脚本化生成，构建脚本一并保留，
便于日后校对与增量更新。构建脚本依赖 Python 3.9+，不需要第三方库。

人物档案（`js/npcfull.js`）由 `_build_npcfull.py` 从
[biligame 符文工厂 wiki](https://wiki.biligame.com/runefactory/) 的
`RF1characters`～`RFOcharacters` 七个页面解析而来，原站内容以 CC BY-SA 授权，
本站在此基础上做了译名统一、按日文名对齐与字段清洗。原始 wikitext 抓取件留在本地 `_npc_src/`（不入库，需要时用 API 重抓即可）。

### 角色头像
`assets/face/rf1/`、`assets/face/rf2/` 下是符文1 与符文2 的角色头像，由 `_build_faces.py` 从解包出的
NCER 立绘页裁出：一张立绘 512×256、一人一张、同人有多帧表情，裁成以头为中心的方图，一次跑完全部角色。
生成脚本依赖源目录与 Pillow，产物已入库，平时不需要重跑。

```
python _build_faces.py            # 符文1（默认）
python _build_faces.py rf2        # 符文2
python _build_faces.py rf1 --all  # 连表情差分一起出
python _preview_faces.py rf2      # 拼一张带中/日文名的总览图，检查取景
```

源目录：符文1 在 `G:/BaiduNetdiskDownload/ARFJ_NCER_ext`，符文2 在 `G:/BaiduNetdiskDownload/A6NJ_NCER_extract`。

- 认人按**日文名**，不用罗马字代号——游戏内部文件名跟各作英译对不上（拉碧丝 = Lara，文件却叫 `e_lapis`）。
- 符文2 的解包图只有 `pic_npc01` 这类流水号，没有名字，归属靠两条独立证据确认：一是反查 wiki 角色页
  引用了哪张图（`_probe_rf2_owners.py`），二是拿官网 15 周年立绘逐张比对（`_fetch_portraits.py`）。
  另外那套图里带 `_W` 后缀的婚礼差分正好是 7 位花嫁候补 + 4 位花婿候补 + 主角，可作交叉验证。
- 清单外的三个（艾泽尔巴德、吉尔伯特、主角之子）也切好了，键名以 `xt_` 开头，暂未接入名录。
- 默认每人只出一张；表情差分要的话跑 `python _build_faces.py --all`。
- 图查不到时视图退回原来的「首字色块」，所以还没做头像的作品不会出破图。
- 「海齐利格斯」曾与「赫理查科斯」并列为两条记录，实为一人（薇薇亚修家当主）。第六十三次合并为「赫理查科斯（ヘリチャコス）」，旧名保留为别名，头像表里两个日文名仍指向同一张图。

### BOSS 战数据

「BOSS 战」条目只收剧情与迷宫 BOSS（普通怪在「魔物图鉴」），四作共 71 条：

| 作品 | 条数 | 字段 | 源页 |
|---|---|---|---|
| 符文1 | 8 | 地点 / HP / EXP / 防御 / 魔防 / 物理抗 / 火水地风 | `RF1洞窟BOSS数据` |
| 符文2 | 9 | 地点 / 自身属性 / 耐性 / HP / EXP / 掉落 | `RF2boss` |
| 符文3 | 20 | 抗性要点 / 掉落 | `RF3魔物怪物抗性表`（沿用 `js/mon3.js` 的 `BOSS_RF3`） |
| 海洋 | 34 | 出现点 / LV / HP / 攻击 / 防御 / 魔攻 / 魔防 / EXP | `RFOBOSS` |

`_build_boss.py` 从 `_boss_src/*.txt`（原始 wikitext 抓取件）生成 `js/boss.js`，
符文1 的日文地名按 `js/rf1mon.js` 里已有的 `RF1_PLACE` 对照转写。

口径上必须分开读：**符文1、边境、海洋的属性是「防御点数」，数值越高越抗打，最低那项才是弱点**；
符文3 是抗性等级（−2 打三倍、3 级免疫、4 级回血）；符文2 是属性克制；符文4／5 是百分比系数。
四代、五代与边境在源 wiki 上没有独立的 BOSS 数值页，因此这个条目不对这几作显示。

### 译名口径

同一角色在各作汉化版里的用字并不统一，本站一律取一个写法，跨作对齐：

| 日文 | 本站 | 说明 |
|---|---|---|
| ミスト | 密丝特 | 取边境译法；符文1 早期写作「蜜丝特」，已全站并入 |
| ミストブルーム | 密丝特布鲁姆 | 与前条同源，随之统一；俗名「5洞」保留 |

旧写法在搜索框里仍然有效（查询时归一到现名，索引不存两套字），改名前存下的
`#/char/<作>/<旧名>` 链接也会落到同一角色上。

## 版权

本站为非官方粉丝向资料站，游戏名称与相关素材版权归 Marvelous Inc. / はしもとよしふみ 所有。
站内数据为手工整理与校对，仅供学习交流；角色头像截取自游戏本体素材，版权同样归原作者所有。
