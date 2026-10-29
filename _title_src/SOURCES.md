# 作品卡配图来源（assets/title/*.jpg）

卡片图区在站上是 195×66（CSS `.wcard-fig` 4.1rem 高），比例约 **2.95:1**。
所有图统一预构图成 960×325 JPEG(q88)，上线后 CSS `object-fit:cover` 几乎不再裁切。

重新生成：`G:/wit_tools/tmp/sw/venv/Scripts/python.exe _title_src/build_titles.py`
（脚本末尾会输出按卡片真实尺寸 2 倍的对照图 `_cards_preview.png`）

| 作 | 源 | 原始尺寸 | 处理 |
|---|---|---|---|
| RF1 | 本机 NDS 解包 `符文工房/1/title_bgC.NCGR.BMP` | 256×192 | 完整标题画面（金框+logo），裁 2.95:1 |
| RF2 | 本机 NDS 解包 `符文工房/2/rune2_titleA01.NCGR.BMP` | 256×192 | 完整标题画面，裁 2.95:1 |
| RF3 | marv.jp 官网 `special/game/ds/runefactory3/img/top/bg1.jpg` | 981×590 | 大树村场景画，裁 2.95:1 |
| RF3SP | Steam appid 2243710 `capsule_616x353.jpg` | 616×353 | 含 logo，两侧边缘色延伸后居中 |
| RF4 | biligame wiki `Rune_Factory_4` 页官方背景画 | 756×425 | 浮空船场景，裁 2.95:1 |
| RF4SP | Steam appid 1580240 `capsule_616x353.jpg` | 616×353 | 含 logo，两侧边缘色延伸后居中 |
| RF5 | Steam appid 1702330 `capsule_616x353.jpg` | 616×353 | 含 logo，两侧边缘色延伸后居中 |
| RFF | marv.jp Wii 官网 `img/top/main.swf` 内嵌天空底（CWS 解压后抽 JPEG）＋ `assets/logo/rff.png` | 550×523 + 371×204 | 天空底裁 2.95:1 后居中叠官方透明 logo |
| RFO | `Desktop/海洋PS3版PSD/02207_LUGTITLE_00_960x720_RGBA8.psd` | 960×720 | 关掉「家在矿石镇汉化组」文字层与图标层，圆形构图裁 2.95:1 |
| 龙之天地 | Steam appid 2864560 `library_hero.jpg` | 1920×620 | 原比例≈3.1:1，几乎不裁 |

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

## 版权

全部为官方宣传素材（Marvelous / 各作发行方），仅用于本站非商业资料展示；不用于分发或商用。
