# 海洋（RFO）头像来源与编号推导

## 结论

`assets/face/rfo/` 下 23 张头像来自 **PS3 日版《符文工房 海洋》原始贴图**，不是同人图、不是官网立绘裁切。

- 源档：`PS3_GAME/USRDIR/RFF2.dat`（866 MB），TFAp 封装块 **1526**
- 成员：`LUfaceNL_XX.hvt` —— 游戏内对话/名册用的 **72×72** 头像，格式 **CI8（8bpp 索引）+ 外部调色板**
- 数量：52 个成员（`LUfaceNL.gfx` + 51 张图）
- 生成：`_build_rfo_faces.py`，裁掉最外 3px 浅色圆角边框，66×66 → 128×128（LANCZOS）

## 为什么不是之前那批「花屏」

先前的 `G:/BaiduNetdiskDownload/海洋图片导出/` 里有 8 张 `*_FACE` 贴图，全是 **512×256 的 3D 模型 UV 贴脸图**（一张上并排 6 个角度），不能当头像——所以看着像「游戏里没有立绘」。

实际情况：

| 位置 | 内容 | 可用性 |
|---|---|---|
| `RFF2.dat` 块 1526 `LUfaceNL_*` | 72×72 2D 头像（51 张） | ✅ 本批采用 |
| `RFF2.dat` 块 1475 `GUfaceML_*` | 72×72 2D 头像（70 张，怪物为主） | 怪物图鉴可用 |
| `PS3_GAME` 同名 `PC*_FACE*` | 512×256 DXT1 UV 贴脸图 | ❌ |
| `LUEV0_*` 141 张 | 1280×720 事件 CG | ❌ 非头像 |

**易踩的坑**：这两组 72×72 是 TFAp 块内成员，不能直接按 `ps3_tex_full.json` 里的 `abs_off` 从主 `.dat` 读——那样读出来是别人的数据，解出来全黑。必须走 `read_tfap()` 取成员字节再解码。

## 编号 → 人名 的推导

游戏里没有「编号:人名」的清单，靠两条独立证据交叉：

### 证据一：编号是「类别 + 序号」的两段式

`LUfaceNL` 出现的编号为 `00_2 / 01 / 02 / 10–18 / 20–22 / 30–38 / 40–41 / 70`。按十位分组，数量正好是：

- `10–18` = **9 位**，与官方 9 名结婚候补（Lily / Odette / Violet / Electra / Maerwen / Elena / Sierra / Mikoto / Pandora）数量一致
- `20–22` = **3 位**，与 3 名结婚候补男主（Bismark / James / Joe）一致
- `30–38` = **9 位**，与 9 名居民一致
- `01 / 02` = 男女主角（`00_2` 是两人共用身体时的合成图：白蓝发＋粉发两张脸叠在一起、带一道斜杠）
- `40 / 41` = 孩子（男/女），各 14 个表情差分，本站名册不收
- `70` = 未收录的单独角色

### 证据二：游戏内字符串表的顺序

`RFF2.dat` 偏移 `720495600` 附近是脚本标签池，其中一段按角色逐个列出「相遇标记」：

```
EM_SYSTEM_LILLY_MEET_CHECKER    リリと出会った
EM_SYSTEM_ODETTE_MEET_CHECKER   オデットと出会った
EM_SYSTEM_IRIS_MEET_CHECKER     アイリスと出会った
EM_SYSTEM_ELECTRA_MEET_CHECKER  エレクトラと出会った
EM_SYSTEM_MERUPUR_MEET_CHECKER  メルプリンと出会った
EM_SYSTEM_ELENA_MEET_CHECKER    エレナと出会った
EM_SYSTEM_SERRA_MEET_CHECKER    セーラと出会った
EM_SYSTEM_LEBEN_MEET_CHECKER    命と出会った
EM_SYSTEM_PANDORA_MEET_CHECKER  パンドラと出会った(ユーレイ状態)
EM_SYSTEM_SONIA_MEET_CHECKER    ソニアと出会った
EM_SYSTEM_JOEL_MEET_CHECKER     ジョーと出会った
EM_SYSTEM_JAMES_MEET_CHECKER    ジェームスと出会った
EM_SYSTEM_BISMARC_MEET_CHECKER  ビスマルクと出会った
EM_SYSTEM_AZERU_MEET_CHECKER    アゼルと出会った
EM_SYSTEM_BONAPAR_MEET_CHECKER  ボナパルトと出会った
EM_SYSTEM_BACCHUS_MEET_CHECKER  バッカスと出会った
EM_SYSTEM_KILTSH_MEET_CHECKER   キルトと出会った
EM_SYSTEM_NITTE_MEET_CHECKER    ニットと出会った
EM_SYSTEM_GRAY_MEET_CHECKER     グレーと出会った
EM_SYSTEM_JASLYN_MEET_CHECKER   ジャスリンと出会った
EM_SYSTEM_ANETTE_MEET_CHECKER   アネットと出会った
EM_SYSTEM_CANDY_MEET_CHECKER    キャンディと出会った
EM_SYSTEM_TABATHA_MEET_CHECKER  タバサと出会った
EM_SYSTEM_KIDWOMAN_MEET_CHECKER 子供(女の子)と出会った
EM_SYSTEM_KIDMAN_MEET_CHECKER   子供(男の子)と出会った
```

顺序与证据一的三个区段（9 / 3 / 9）逐一对齐，且「孩子」正好排在最后，对应 `40 / 41`。

## 逐位对照

| 编号 | 输出文件 | 日文 | 本站中文 | 画面侧印证 |
|---|---|---|---|---|
| 01 | `azel` | アゼル | 亚赛尔 | 白蓝渐变发＋蓝眼，与官方设定一致；`00_2` 合成图左半即为同一张脸 |
| 02 | `sonia` | ソニア | 索妮娅 | 粉发＋棕帽；`00_2` 右半为同一张脸 |
| 10 | `lily` | リリ | 莉莉 | 橙色长发、发间花朵 |
| 11 | `odette` | オデット | 奥黛特 | 紫色短发 |
| 12 | `iris` | アイリス | 艾伊利斯 | 褐发＋兜帽 |
| 13 | `electra` | エレクトラ | 伊莱克特拉 | 白色工作头巾＋围裙，符合铁匠/机械设定 |
| 14 | `merupur` | メルプリン | 梅尔普琳 | 绿发＋眼镜（设定：空下来就看书） |
| 15 | `elena` | エレナ | 艾琳娜 | 金发蓝眼 |
| 16 | `serra` | セーラ | 莎拉 | 橙红短发 |
| 17 | `mikoto` | 命 | 命 | 深蓝短发，和风 |
| 18 | `pandora` | パンドラ | 潘多拉 | 白发＋金冠蓝宝石，龙之巫女装束 |
| 20 | `joel` | ジョー | 乔 | 褐红发＋护目镜 |
| 21 | `james` | ジェームス | 詹姆斯 | 金发少年 |
| 22 | `bismarc` | ビスマルク | 俾斯麦 | 褐发戴眼镜的少年（杂货店双子的弟弟） |
| 30 | `bonapar` | ボナパルト | 波拿巴尔特 | 蓝帽＋编发 |
| 31 | `bacchus` | バッカス | 巴克斯 | **白胡子老者**（设定里的老发明家，主角视其为祖父） |
| 32 | `kilt` | キルト | 琪芦多 | 红发＋发间小花 |
| 33 | `nitte` | ニット | 尼特 | 金发少年 |
| 34 | `gray` | グレイ | 格雷 | 成年男性、胡渣＋疤 |
| 35 | `jaslyn` | ジャスリン | 洁丝琳 | 紫发成年女性（考古学者） |
| 36 | `anette` | アネット | 阿涅多 | 金发＋红色护目镜 |
| 37 | `candy` | キャンディ | 糖糖 | 戴帽少女 |
| 38 | `tabatha` | タバサ | 塔芭莎 | 蓝发 |

`ユミル`（优米尔）是载着主角航海的墨绿巨人，没有人物头像，本站名册保留首字色块。

## 未采用的编号

- `00_2`：亚赛尔＋索妮娅共用一个身体时的特殊合成图（两脸叠加＋斜杠），不适合当单人头像
- `40` / `41`：两人的孩子（男/女，各 14 个表情），本站名册未收
- `70`：单独一个角色，未在「相遇标记」表内，暂不接

## 复现

```bash
python _build_rfo_faces.py     # 读 _face_src/rfo/LUfaceNL_*.png，写 assets/face/rfo/*.png
```

源图（23 张 72×72，188 KB）已收进 `_face_src/rfo/`，仓库克隆后不需游戏原档即可重建。

若要把游戏档里的原始 51 张全导出来（含怪物用的 `GUfaceML`），流程见本项目 `G:/wit_tools/work/RF_Oceans_CN/` 下的 `ps3_tex_decode.py` + `oceans_ui_textures.read_tfap`。
