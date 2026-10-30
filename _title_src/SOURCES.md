# 作品卡配图来源（assets/title/*.jpg|png）

卡片图区有两种高度：
- 默认 `.wcard-fig` = 284×96（6rem 高），比例约 **2.96:1** → 图 960×325
- `.wcard-fig.is-tall`（或 `.is-tall-lg`，仅 ≥560px 三列生效）= `aspect-ratio:16/9`（284×160）→ 图 960×540

10 部作品排成 **8 张卡**：
- 单作卡 6 张，全部 16:9：RF1 / RF2 / RF3（`.is-tall-lg`）/ RF3SP（`.is-tall-lg`）/ RFF / RFO
- 双作卡 2 张，也全部 16:9：**RF4 + RF4SP**、**RF5 + 龙之天地**（一张卡里上下各一条，两条互不裁切）

**为什么两两并卡**：这四部的官方图都是 960×325（2.95:1）的横构图，单独塞进 16:9 要切掉约三成高度
（RF4SP/RF5 的群像会切到人），留在 2.96:1 的矮框里又比同排的 16:9 卡矮一截、被 grid stretch 拉出空白。
并成一张 16:9、上下各一条之后两边都不用裁，卡片总数 10 → 8，两列布局正好 4 行，不再有落单的第 10 张。

| 行 | 3 列布局（≥560px） | 2 列布局 |
|---|---|---|
| 1 | RF1 / RF2 / RF3 → 都 16:9 | RF1 / RF2 → 都 16:9 |
| 2 | RF3SP / RFF / RFO → 都 16:9 | RF3 / RF3SP → 都 16:9（`.is-tall-lg`，<560px 时两张一起回到 96px） |
| 3 | RF4+4SP / RF5+龙之天地 → 都 16:9（末行右侧空一格） | RFF / RFO → 都 16:9 |
| 4 | — | RF4+4SP / RF5+龙之天地 → 都 16:9 |

重新生成：`C:/Users/10257/.workbuddy/binaries/python/envs/default/Scripts/python.exe _title_src/build_titles.py`
（脚本末尾会输出按卡片真实尺寸 2 倍的对照图 `_cards_preview.png`；
若只想重做某一张，`import build_titles as B; B.rf3sp_tall()` 这样单独调，避免整批重跑漂移）

| 作 | 源 | 原始尺寸 | 处理 |
|---|---|---|---|
| RF1 | NDS ROM `符文工房/1/` 图层合成 → `src/rf1_native_256x192.png` | 256×192 | **原生 PNG 无损直出**，零修图；`.is-tall` 16:9 框，可见 144px 原生高，标题块 86px 居中（`object-position: 69%`） |
| RF2 | 日版 NDS ROM `符文工房2.nds` 的 `/res/obj/rune2_titleA01.{NCGR,NCLR,NSCR}` → `src/rf2_native_256x192.png` | 256×192 | **原生 PNG 无损直出**，零修图；图框单独加高到 16:9（`.wcard-fig.is-tall`），可见 144px 原生高，logo 块 134px 全装下 |
| RF3 | 本机 NDS 提取 `G:/10257/Desktop/符文工房/符文工房/3/rf3Archive-8027.NCGR.BMP`（源自 `符文工房3.nds` 的 `/res/obj/rf3Archive.arc` 第 8027 号 NCGR） | 256×192 | **原生 PNG 无损直出**，零修图；`.is-tall-lg`（仅三列 16:9）+ `object-position: 35%`，logo 块 y=58..112 在 16:9 与 96px 两档下都完整 |
| RF3SP | Steam appid 2243710 `capsule_616x353.jpg` | 616×353（1.745:1） | 16:9 只切纵向 10px，几乎零裁切；`.is-tall-lg` |
| RF4 + RF4SP | 上条 biligame wiki `Rune_Factory_4` 页官方背景画（756×425，浮空船）；下条 Steam appid 1580240 `capsule_616x353.jpg` | 756×425 + 616×353 | 先各自做成旧的 960×325（上 cover 裁 2.95:1、下边缘色延伸居中），再各压成 960×270 一条：上条按宽铺满居中裁、下条只取清晰区 192..766（两侧是官方自己做的模糊延伸）等比缩到条高、两侧用同块清晰区重模糊+压暗补齐 → 上下拼成 960×540 |
| RF5 + 龙之天地 | 上条 Steam appid 1702330 `capsule_616x353.jpg`；下条 appid 2864560 `library_hero.jpg`（1920×620） | 616×353 + 1920×620 | 同上：上条取清晰区 192..766 后补两侧，下条按宽铺满居中裁 → 960×540 |
| RFF | marv.jp Wii 官网 `img/top/main.swf` 内嵌天空底（CWS 解压后抽 JPEG）＋ `assets/logo/rff.png` | 550×523 + 371×204 | 16:9（按宽铺满后保留 54% 高度，比旧 2.95:1 版的 36% 反而少裁），居中叠官方透明 logo；`.is-tall` |
| RFO | PS3 版贴图 PSD 三层合成 → `src/rfo_title_1280x720.png`：`02207_LUGTITLE_00_960x720_RGBA8`（岛+海底图，去水印文字层/图标层）＋`02896_LUGTITLE_01_1280x720_CI8`（藤蔓前景框，去左上水印层）＋`02202_LLGTITLEJP_568x400_RGBA8`（原版日文 logo 层，含假名行） | 960×720 + 1280×720 + 568×400 | **三层 1:1 合成，零缩放零插值**：底图水平居中 (1280−960)/2=160，藤蔓 (0,0) 压其上，logo 居中 x=356、y=150；1280×720 正好 16:9 → 卡上整屏零裁切；存 JPEG q92 |
| 龙之天地 | 并入 `pair-rf5.jpg` 下条，见上表 | 1920×620 | 原比例≈3.1:1，几乎不裁 |

## 取图时的坑

- **Steam 商店 API / store.steampowered.com 在本机不通**（代理和直连都 000），但
  `cdn.cloudflare.steamstatic.com` 通，`/steam/apps/<appid>/<文件名>` 能直接下。
  appid：RF5=1702330、RF3SP=2243710、RF4SP=1580240、龙之天地=2864560。
  龙之天地没有 `capsule_616x353.jpg`（404），只有 `library_hero` / `library_600x900` / `header`。
- **Steam 的 `library_hero.jpg` 只有人物画、不带 logo**；带 logo 的是 `capsule_616x353.jpg`
  和 `header.jpg`。本次 RF3SP/RF4SP/RF5 用 capsule（有 logo），龙之天地用 hero（质量高、比例正好）。
- **marv.jp 旧作特设页仍然存活**：`/special/game/ds/runefactory3/`、`/special/game/3ds/runefactory4/`、
  `/special/game/wii/runefactory/`、`/special/game/ds/runefactory2/`。但 RF4 那站是 Flash，
  大图都在 swf 里；RF2/RFF 的 `img/top/main.swf` 是 **CWS 压缩**，需 `zlib.decompress(b[8:])`
  后按 `FF D8 FF … FF D9` 抽内嵌 JPEG。RF1 官网路径已 404。
- **biligame 的 `patchwiki.biligame.com` 直链可 curl**（需 `--noproxy '*'`）；
  RF4 的官方 LOGO 透明图在 `Rune_Factory_4` 页内（568×258），本次没用上，留在 `_title_src/rf4w_13.png`。
- Steam 的 `logo.png`（640 宽、带 alpha）四个 appid 都能下，也留在 `_title_src/*_logo.png`，
  将来若想「纯 logo on 渐变」风格可直接用。
- **RF1/RF2 用日版 ROM 原生画面，不用汉化版**：旧图取自旧汉化版 ROM，底部有「家在矿石镇汉化组汉化」
  水印、RF2 的日文副标还被改成金色「符文工厂」。日版 ROM（`F:\BaiduNetdiskDownload\符文工房123.rar`
  解出的 `符文工房2.nds`，2009-12-29）里 `/res/obj/rune2_titleA01.*` 是干净的官方画面，两样都没有。
  提取用 `_nds_nitro.extract()` + `render()`，渲染为 256×256 后裁掉下半留白（游戏只用上屏 256×192）。

## 版权

全部为官方宣传素材（Marvelous / 各作发行方），仅用于本站非商业资料展示；不用于分发或商用。
