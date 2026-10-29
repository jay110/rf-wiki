# 站点图标（芜菁）出处与重建

## 源图

| 项 | 内容 |
|---|---|
| 文件 | `biligame_icon.png`（23×24，RGBA，透明底） |
| 来源 | 用户指定：`https://patchwiki.biligame.com/images/runefactory/7/74/bdsvs8xlzgmbf46828x2vgqg8wn6hon.png` |
| 内容 | 游戏内的芜菁（かぶ）图标：奶白球茎＋深绿叶簇，右下带一点粉灰阴影 |
| 下载 | `curl --noproxy '*' -e https://wiki.biligame.com/runefactory/ <url>`，1.1 KB |

源图只有 23×24（本来就是按 16/32 的图标尺寸画的），所以：

- 16 / 32 / 48 基本是原生分辨率，直接缩放，最清楚；
- 64 以上靠 LANCZOS 放大 ＋ 轻量 USM（radius 1.2 / 70%），**不要再往上堆锐化**，否则叶缘会出黑边；
- 没有矢量版，所以没有 `favicon.svg`——源图放大的边界在 192 附近，再大就明显发虚。

## 产物（`assets/icon/`）

| 文件 | 尺寸 | 用途 |
|---|---|---|
| `favicon.ico` | 16 / 32 / 48 三档 | 传统 favicon，根目录另有一份副本供浏览器默认请求 `/favicon.ico` |
| `icon-16/32/48.png` | 同上 | 精确尺寸的 PNG 备选 |
| `icon-64.png` | 64 | 需要中号的场合（列表、分享卡片） |
| `icon-192.png` | 192 | Android / 首页题头 |
| `apple-touch-icon.png` | 180 | iOS 加到主屏。**不透明**：透明底在 iOS 上会变黑，所以垫了一层 `#f6f4ec` 奶色 |

`index.html` 里用三条 link 声明：`favicon.ico`（多尺寸）、`icon-192.png`、`apple-touch-icon.png`。

## 题头用法

首页封面（`viewWelcome` 的 `.wcover`）顶部放 `icon-192.png`，垫一块 0.93 透明的白色圆角板：
芜菁球茎是奶白的，直接压在本站那块深绿渐变上会被吃掉，只剩叶子看得见。

顶栏右上角的胶囊没有动——那里是 `app.js` 用 `textContent` 写入的当前作品序号（`Ⅴ` / `Ⅲ SP` / 首页的 `WIKI`），
塞 `<img>` 进去会被覆盖。

## 重建

```bash
python _build_icon.py          # 出全部尺寸并自检（四角透明 / apple-touch 不透明 / ico 三档）
```

单文件版（`standalone.html`）由 `_inline.py` 把 `assets/` 下的图标一并转成 data URI，否则离线版没有图标。
