# 符文3 头像源图

源图不入库（约 900KB，可随时从官网重下），放在 `G:/wit_tools/work/_rf3/_face_rf3_src/`，
文件名就是该角色的**日文名**，`_build_faces.py rf3` 直接读这个目录。

## 出处

两处官网，都是官方透明底全身立绘：

| 来源 | 尺寸 | 覆盖 | 地址 |
| --- | --- | --- | --- |
| 15 周年站（新） | 560×940 | 主角 + 10 位花嫁候补 | https://runefactory.marv.jp/series/rf3/ ，图在 `assets/img/chara_rune3_1..11.png`，页面里 `p-chara_data__name-main` 带日文名 |
| 发售时官网（旧） | 220×360 / 270×430 | 11 位镇民（另 10 张花嫁与新站重复） | https://www.marv.jp/special/game/ds/runefactory3/chara/heroine.html 与 townspeople.html ，图在 `img/<list>/<英文名>.png`，**`alt` 属性就是日文名** |

新站那 11 张的顺序（按 `chara_rune3_N`）：
1 マイス / 2 シア / 3 トゥーナ / 4 カリン / 5 ショコラ / 6 マリオン / 7 ソフィア /
8 ペルシャ / 9 さくや / 10 イオン / 11 ダリア

## 官网没有立绘的三位（均已另找出路，现已补齐）

- **クルルファ（克璐璐法）**：通关才解锁的隐藏花嫁，两处官网的角色页都不宣传她。
  → 改用 RF3S 游戏内 `another_charaicon`（172px）。
- **オンドルファ（恩德珐）、ゼゼ（泽杰）**：旧官网镇民页只放了 11 张，不含这两位；新官网只有花嫁。
  → 改用 neoseeker 攻略 wiki（Rune Factory 3 Special · Character List 页）的官方 PerfectPortrait：

  | 角色 | 页面标注 | 源图 | 出处 |
  | --- | --- | --- | --- |
  | オンドルファ | Japanese Name: Ondolfa；Unvir 聚落的长老、爱读书 | `ondolfa_neoseeker.png` 240×380 | `cdn.staticneo.com/ew/b/b6/OndorusPerfectPortraitRF3.png` |
  | ゼゼ | Japanese Name: Zeze；住在 Unvir 聚落的矮人，爱吹牛 | `zeze_neoseeker.png` 240×380 | `cdn.staticneo.com/ew/6/67/ZaidPerfectPortraitRF3V.png` |

  英文名是 Ondorus / Zaid，**日文名是页面上明确标注的**，所以按名字直接用、不需要猜编号。
  出图脚本 `_build_rf3_extra.py`（各自一个 140 见方的裁切框，输出 160×160）。
  注意：neoseeker 主站有 Cloudflare 人机校验，脚本一律直取 `cdn.staticneo.com` 的图，别抓页面。

## 试过但不能用

- **ROM**：日版 `nrp-rf3j.nds` 主档案 103MB，有 358 个 NCER / 1546 个 NCGR / 257 张 512×256 的图，
  三件套成组排布、渲染器也写得出来，但档案内**没有文件名表**，cell 名只有 `CellAnime01` 这类流水号，
  拼得出图、说不出是谁。相关脚本留在 `G:/wit_tools/work/_rf3/_rf3_*.py`。
- **biligame 符文工厂 wiki**：有 `シア_f_3.png` 这种「日文名＋作编号」命名的图，看着最省事，
  但原图只有 24×23 像素（表格小图标），没法用。
