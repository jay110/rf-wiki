# 作品卡配图来源（assets/title/*.jpg|png）

10 部作品排成 **8 张卡，全部走 16:9**（`.wcard-fig.is-tall` → `aspect-ratio:16/9`，284×160）→ 图 960×540。
旧的 2.96:1 窄框（284×96 → 960×325）已经彻底不用了。

- 单作卡 6 张：RF1 / RF2 / RF5 / RFF / RFO / 龙之天地
- 双作卡 2 张：**RF3 + RF3SP**、**RF4 + RF4SP** —— 一张卡、**一张完整的 16:9 标题画面**（不拼接）

**为什么把「本作 + 强化版」并成一张**：RF3SP、RF4SP 本来就是 RF3、RF4 的移植/重制版，
素材也是同一部作品的另一套标题画面。并成一张后，卡上一眼就是「这作 + 它的新版」，
卡片总数 10 → 8，三列 3/3/2、两列正好 4 行，不再有落单的第 10 张。
（RF5 与龙之天地是两部不同的作品，不并。）

**为什么卡面只用一张图、不上下拼两条**：拼两版试做过，每条都要按宽铺满再把 4:3 / 1.75:1
的图裁掉大约一半高度才塞进 270px，接缝再平也是「两张画框叠一起」。既然两作共用同一套
标题画面，直接用强化版那一张整屏图即可——logo、角色、背景一次全在，没有接缝，也没有
二次裁切的构图损失。两部作品靠卡下方两行文字区分（当前所在的那行前面有 ›）。

| 行 | 3 列布局（≥560px） | 2 列布局 |
|---|---|---|
| 1 | RF1 / RF2 / RF3+3SP | RF1 / RF2 |
| 2 | RF4+4SP / RF5 / RFF | RF3+3SP / RF4+4SP |
| 3 | RFO / 龙之天地（右空一格） | RF5 / RFF |
| 4 | — | RFO / 龙之天地 |

重新生成：`C:/Users/10257/.workbuddy/binaries/python/envs/default/Scripts/python.exe _title_src/build_titles.py`
（脚本末尾输出按卡片真实尺寸 1.5 倍的对照图 `_cards_preview.png`；
若只想重做某一张，`import build_titles as B; B.pair_rf4()` 这样单独调，避免整批重跑漂移）

| 作 | 源 | 原始尺寸 | 处理 |
|---|---|---|---|
| RF1 | NDS ROM `符文工房/1/` 图层合成 → `src/rf1_native_256x192.png` | 256×192 | **原生 PNG 无损直出**，零修图；16:9 框可见 144px 原生高，标题块 86px 居中（`object-position: 69%`） |
| RF2 | 日版 NDS ROM `符文工房2.nds` 的 `/res/obj/rune2_titleA01.{NCGR,NCLR,NSCR}` → `src/rf2_native_256x192.png` | 256×192 | **原生 PNG 无损直出**，零修图；16:9 框可见 144px 原生高，logo 块 134px 全装下（`object-position: 0%`） |
| RF3 + RF3SP | Steam appid 2243710 `capsule_616x353.jpg`（RF3SP 官方主视觉：左「RuneFactory 3 SPECIAL」金色字标 + 右全员角色群）→ `src/rf3sp_capsule_616x353.jpg` | 616×353（1.745:1） | 16:9 只切纵向上下各 3px（logo 与五个人脸全在框内）→ 放大到 960×540；一张整图，不拼接 |
| RF4 + RF4SP | **豪华版（PC 版）OP 视频第 675 帧** → `src/rf4sp_op_logo_1280x720.png` | 1280×720（正好 16:9） | 直接缩到 960×540，**零裁切零补边**；金色字标落在画面中央偏下，四周全是云 |
| RF5 | Steam appid 1702330 `capsule_616x353.jpg` | 616×353（1.745:1） | 16:9 只切纵向 3px，几乎零裁切 |
| RFF | marv.jp Wii 官网 `img/top/main.swf` 内嵌天空底（CWS 解压后抽 JPEG）＋ `assets/logo/rff.png` | 550×523 + 371×204 | 16:9（按宽铺满后保留 54% 高度），居中叠官方透明 logo |
| RFO | PS3 版贴图 PSD 三层合成 → `src/rfo_title_1280x720.png`：`02207_LUGTITLE_00_960x720_RGBA8`（岛+海底图，去水印文字层/图标层）＋`02896_LUGTITLE_01_1280x720_CI8`（藤蔓前景框，去左上水印层）＋`02202_LLGTITLEJP_568x400_RGBA8`（原版日文 logo 层，含假名行） | 960×720 + 1280×720 + 568×400 | **三层 1:1 合成，零缩放零插值**：底图水平居中 (1280−960)/2=160，藤蔓 (0,0) 压其上，logo 居中 x=356、y=150；1280×720 正好 16:9 → 卡上整屏零裁切；存 JPEG q92 |
| 龙之天地 | jp.runefactory.com/ryu-no-kuni 官网顶部 key visual → `src/azuma_kv_2000x1123.jpg`<br>＋ 官方 fan kit「龍の国」透明 logo（**纯黑字，全透明底，无描边**）→ `src/azuma_logo_1000x600.png` | 2000×1123 + 1000×600 | key visual 是 1.781:1，按宽铺满后左右各裁约 2px → 960×540；logo 缩到 460×276、位置 (30,20)（左上樱枝 + 金屏风处最静，也避开卡片 0.6rem 圆角），再做四步「烧入」处理见下节 |

**备而未用的素材**（留在 `src/` 里，不进 `assets/title/`）：

- `rf3_native_256x192.png` —— `符文工房3.nds` 的 `/res/obj/rf3Archive.arc` 第 8027 号 NCGR
  （8bpp 调色板，P→RGB 零重采样）。4:3 铺满 16:9 卡要切掉约一半高度，只留得住 logo 或只留得住背景，
  所以并卡改用 RF3SP 主视觉；这张仅作原生画面存档。
- `rf4w_1.jpg` —— biligame wiki `Rune_Factory_4` 页的官方背景画（756×425，浮空船）。
  曾作并卡上条；现在整卡用豪华版 OP 帧，这张不再进卡。
- `rf1_desmume_title.png`、`rf2_titleA01.png`、`rf3_jp_top_bg1.jpg` —— 更早的中间件，已被原生图取代。
- `rf4sp_capsule_616x353.jpg` —— RF4SP 的 Steam capsule（角色特写 + logo 分居上下两端），
  同比例下 16:9 只装得下其一，故用 OP 帧代替。
- `azuma_library_hero.jpg` —— Steam appid 2864560 的 `library_hero.jpg`（1920×620，3.1:1）。
  曾作龙之天地卡面（居中切掉左右各 21%），但它**不带字标**，卡上认不出是哪一作；
  现在改用官网 2000×1123 的 key visual + 官方 fan kit logo（见上表）。
- `assets/logo/azuma.png`（376×191，英文「RuneFactory Guardians of Azuma」）——
  `_logo_src/` 那批站内 logo 之一，全站没有引用；卡面用的是官方日文「龍の国」logo。

## 龙之天地的官方 fan kit（logo 与主视觉都在这）

`https://jp.runefactory.com/ryu-no-kuni/news/detail/?id=31320` 是官方「ファンキット素材」页，
素材可直接下载，官方允许用于配信 / 视频 / 静止画投稿（需遵守同站 `id=31319` 的 guideline）。

图片根地址 `https://jp.runefactory.com/ryu-no-kuni/assets/img/fankit/`：

| 文件 | 尺寸 | 内容 |
|---|---|---|
| `ryunokuni_logo_black.png` / `_white.png` | 1000×600 透明 PNG | 「龍の国」大字 + `RuneFactory` 花体 + 假名，**无宣传语**（本卡用黑版） |
| `ryunokuni_mainvisual_horizon.png` | 1920×1080 | 主视觉横版（两人对刀 + 双龙 + 四季屏风），不带 logo |
| `ryunokuni_mainvisual_vertical.png` | 1080×1920 | 同一画面的竖版 |
| `village_01..04-spring/summer/autumn/winter.png` | 1920×1080 | 四季の里场景图（春之里：樱花 + 社殿） |
| `icon_XX-<英文名>.png` | 400×400 | 17 个角色头像 |
| `mini_XX-<英文名>.png` | 600×600 | 角色 Q 版立绘 |

坑：
1. **必须带浏览器 UA**，否则这些 PNG 一律返回 404（196 字节的错误页），但页面本身 200。
   `curl -A "Mozilla/5.0 ..."` 就正常。
2. **别并发下**，连发几个请求会随机吃到 404，逐个下、中间 sleep 1 秒就稳。
3. 官网顶部那块「龍の国」`assets/img/main/kv_logo.png`（1040×704）比 fan kit 版多了顶上一行
   「「ルーンファクトリー」シリーズ最新作」宣传语，做卡面会显得像广告，所以用 fan kit 那版。
4. 官网顶部底图 `assets/img/main/kv_pc.jpg` 是 **2000×1123**，比 fan kit 的 1920×1080 分辨率高，
   本卡用的是这张（构图与 fan kit 主视觉一致）。

## 龙之天地：logo 是怎么「烧」进画面的

官方素材里**没有任何一张自带 logo 的成品图**——官网 key visual（`kv_pc.jpg` 2000×1123）、
fan kit 主视觉（`ryunokuni_mainvisual_horizon.png` 1920×1080）都是纯画，logo 由网页 HTML 叠。
其余六张卡的 logo 都长在原画构图里，只有这一张必须自己叠，所以叠得「像不像一张图」全靠处理。

叠之前先认清素材：`ryunokuni_logo_black.png` 是**纯黑字 + 全透明底**——不透明像素只有 `(0,0,0)`，
没有描边、没有白底（早前文档里写的「米白描边」是误判，已改）。所以字与背景之间没有任何过渡，
直接 `alpha_composite` 上去就是「一张黑字贴在亮金箔上」。

`azuma_tall()` 里做了四步：

1. **椭圆暗场**（`AZUMA_DARK = 0.26`）：在 logo 位置压一层径向渐变，中心暗 26%、向外归零。
   官方 KV 常见做法，给标题让出一块暗区，字就落在渐变里而不是硬压在亮金上。
   用 `Image.radial_gradient('L')` 缩放成椭圆，再 `ImageChops.multiply` 压暗，纯 PIL 实现不需要 numpy。
2. **字芯带纸纹**：从 logo 所在区域取「原图 − 自身模糊版」的绝对差（高频细节，只留金箔颗粒、
   不含整体明暗），以 `15 + 1.2×detail` 填进字色，RGB 三通道按 1 : 0.80 : 0.62 递减做成暖墨。
   字内部因此有背景同源的颗粒，不再是矢量纯黑。
3. **边缘 0.45px 柔化 + 10% 落影**（右下 offset 2,3、blur 6）：让字贴住纸面。
4. **全图统一质感**：`GaussianBlur(0.35)` 后再 `UnsharpMask(radius=1.0, percent=40)`，
   把矢量字与手绘笔触的锐度抹到同一档。

实测：这四步在卡片实际显示尺寸（284×160）下差异极细微，肉眼几乎分不出；真要看得出差别的是
**构图**——460px 已是宽度上限（再放大「国」字右侧会压到白龙头）。

## 取图时的坑

- **Steam 商店 API / store.steampowered.com 在本机不通**（代理和直连都 000），但
  `cdn.cloudflare.steamstatic.com` 通，`/steam/apps/<appid>/<文件名>` 能直接下。
  appid：RF5=1702330、RF3SP=2243710、RF4SP=1580240、龙之天地=2864560。
- **Steam 的 `library_hero.jpg` 只有人物画、不带 logo**；带 logo 的是 `capsule_616x353.jpg`。
- **marv.jp 旧作特设页仍然存活**：`/special/game/ds/runefactory3/`、`/special/game/3ds/runefactory4/` 等。
  RF2/RFF 的 `img/top/main.swf` 是 **CWS 压缩**，需 `zlib.decompress(b[8:])` 后按 `FF D8 FF … FF D9` 抽内嵌 JPEG。
- **RF1/RF2 用日版 ROM 原生画面，不用汉化版**：旧图取自旧汉化版，底部有汉化组水印、
  RF2 的日文副标还被改成金色「符文工厂」。日版 ROM（`F:\BaiduNetdiskDownload\符文工房123.rar`）是干净的。

## 豪华版（PC 版）OP 视频怎么取

`E:\Rune.Factory.4.Special.Build.20220310.part3.rar\...\Bundle\bundleMain.mbundle`（4.78 GB）是
「bplist 索引 + 资源数据」的容器，里面 180 个 webm 视频（VP9 + Vorbis，全部 1280×720）。
文件名从头部 bplist 里能直接 grep 出来（`Rune4_OP_A_t1.webm`、`Rune4_OP_B_t1.webm`、`01_M_VIZNAR` 角色短片等）。

坑：
1. **文件名顺序 ≠ 数据块顺序**，只能靠内容认。数据块边界 = 下一个 `1A 45 DF A3`(EBML) 头的位置。
2. 块大小不能判断内容（117 MB 的块可能只有 210 帧，多余的是别处的数据），要**数帧**：
   `ffprobe -count_packets -select_streams v:0 -show_entries stream=nb_read_packets`。
   180 个块里只有两块帧数上千——`3300 帧`(110s) 与 `3144 帧`(105s)，就是 OP_A / OP_B。
3. RF4S 的 OP 是重制的，第 22 秒有完整的金色「RuneFactory 4 SPECIAL」字标 + 绿龙 + 粉花，
   1280×720、无水印无字幕。`ffmpeg -vf "select=eq(n\,675)"` 取第 675 帧即为最清晰的定格（本表 RF4SP 用这张）。

## 版权

全部为官方素材（Marvelous / 各作发行方），仅用于本站非商业资料展示；不用于分发或商用。
