# -*- coding: utf-8 -*-
"""新增 RF3 物品一览页，并把 RF3 的全年日程补进节日页。"""
import io

P = r"G:/wit_tools/work/RF_WIKI/js/pages.js"
s = io.open(P, encoding="utf-8").read()

anchor = "    {\n        key: 'recipe', group: 'item', title: '配方大全', icon: 'book',"
assert anchor in s

NEW = r"""

    {
        key: 'rf3list', group: 'item', title: '物品一览', icon: 'bottle',
        gms: ['rf3', 'rf3sp'],
        body: (g) => {
            const IT = (typeof ITEM_RF3 !== 'undefined') ? ITEM_RF3 : [];
            const CATS = [];
            IT.forEach(r => { if (CATS.indexOf(r[1]) < 0) CATS.push(r[1]); });
            const rows = IT.map(r => [r[1], `${r[0]} ${r[1]} ${r[2]}`, [r[0], r[2]]]);
            const cnt = {};
            CATS.forEach(c => { cnt[c] = IT.filter(x => x[1] === c).length; });
            const top = CATS.map(c => [c, cnt[c] + ' 件'])
                .sort((x, y) => parseInt(y[1]) - parseInt(x[1]));
            return `
            <p class="p">本页是<b>《符文工房3》</b>的完整物品清单，共 ${IT.length} 件。这一作的说明写得比前后几作都厚——不是一句「好吃的蔬菜」，而是<b>三到四行带点玩笑的正文</b>，所以顺带把全文也收进来了。</p>
            ${stat([['收录', IT.length + ' 件'], ['类别', CATS.length + ' 类'], ['带说明', IT.filter(r => r[2] !== '—').length + ' 件']])}

            <h2 class="h2">各类多少件</h2>
            ${tbl(['类别', '件数'], top, { leftFirst: true, cls: 'txt', colw: ['7rem', '5rem'] })}
            <div class="note">分类不是游戏给的，是<b>按解包表里的排列顺序</b>切出来的：作物一段、草一段、刺身一段、料理一段、武器一段……同一段内的物品性质一致，边界很清楚。所以这一栏可以放心用来筛。</div>

            <h2 class="h2">说明里最有用的两类话</h2>
            <p class="p">一是<b>素材的出处</b>。掉落素材的说明会写明它从哪只怪身上来，比如「兽人的破布」「海盗哥布林的布」「维京肩甲」——名字本身就是线索，配合说明能直接反查该刷谁。</p>
            <p class="p">二是<b>武器的属性</b>。凡带「烈焰、寒冰、风、大地、光、暗」字样的武器，说明里通常有一句「寄宿着X之魔力」，那就是它自带的攻击属性。不带属性字样的多为无属性——<b>打无弱点的敌人时，无属性反而更稳</b>。</p>

            <h2 class="h2">全物品清单</h2>
            <p class="p">${IT.length} 件，按解包顺序排列。分类多，用下拉筛比点按钮快。</p>
            ${ftable(['名称', '说明'], ['7rem'],
                rows, {
                    sel: CATS,
                    ph: '输入物品名或说明里的词筛选',
                    note: `<div class="note">取自《符文工房3》解包文本：名字表 869 条、说明表 888 条，<b>两表按索引一一对应</b>（已抽样核对：卷心菜、樱芜菁、少女蜜瓜三组全部对上）。首条「(無し)」是空位，已剔除。<b>说明列过长时可左右滑动表格。</b></div>`
                })}
            <div class="jump">
                <a href="#/page/festival">
                    <div class="jp-t">年度节日</div>
                    <div class="jp-s">本作全年日程与生日表</div>
                </a>
                <a href="#/page/cook">
                    <div class="jp-t">料理与食材</div>
                    <div class="jp-s">器具分级与礼物策略</div>
                </a>
            </div>`;
        }
    },
"""

s = s.replace(anchor, NEW.lstrip("\n") + anchor, 1)

# 节日页：用 RF3 的真实日程替换原来那句概述
old3 = """                <li class="li"><b>RF3／RF3 SP</b>：新年、撒豆比赛、摩可摩可感谢祭、春季／夏季／秋季／冬季蔬菜比赛、湖畔开放日、跳蚤市场、大胃王比赛、芜菁入侵祭、芜菁大战、交流节、除夕，另有数场钓鱼大会。</li>"""
new3 = """                <li class="li"><b>RF3／RF3 SP</b>：新年、撒豆比赛、摩可摩可感谢祭、春季蔬菜比赛、湖畔开放日、大鱼!!钓鱼大会、跳蚤市场、夏季蔬菜比赛、大胃王比赛、乌贼!钓鱼大会、芜菁入侵祭、秋季蔬菜比赛、芜菁大战、钓场遍布!钓鱼大会、冬季蔬菜比赛、除夕。这一作的<b>钓鱼大会有四场</b>，各自限定鱼种，别拿同一根竿去赶四场。</li>"""
assert old3 in s
s = s.replace(old3, new3)

# 节日页：RF3 全年日程表（插在「其他作品的节日名」之前）
old4 = """            <h2 class="h2">其他作品的节日名</h2>"""
new4 = """            <h2 class="h2">RF3：全年日程</h2>
            <p class="p">这一作的日程能从解包文本里直接读出完整顺序（含居民生日），按游戏内月份排列：</p>
            ${(() => {
                    const cal = (typeof CAL_RF3 !== 'undefined') ? CAL_RF3 : [];
                    const evs = cal.filter(x => x.indexOf('生日') < 0);
                    const bds = cal.filter(x => x.indexOf('生日') >= 0);
                    return tbl(['类型', '内容'], [
                        ['节日（' + evs.length + '）', evs.join('　·　')],
                        ['居民生日（' + bds.length + '）', bds.map(x => x.replace('的生日', '')).join('　·　')],
                    ], { leftFirst: true, cls: 'txt', colw: ['5.4rem'] });
                })()}
            <div class="note">表内顺序即游戏内时间顺序（从新年开始，到除夕结束）。<b>生日不是节日，但送礼回报很高</b>：当天送一件喜欢的礼物，好感涨幅远超平时。</div>

            <h2 class="h2">其他作品的节日名</h2>"""
assert old4 in s
s = s.replace(old4, new4, 1)

io.open(P, "w", encoding="utf-8").write(s)
print("rf3 page + festival ok")
