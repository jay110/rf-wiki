# -*- coding: utf-8 -*-
"""给 pages.js 打补丁：mbook 增加 RF2 / RFF 分支，新增两页物品一览。"""
import io

P = r"G:/wit_tools/work/RF_WIKI/js/pages.js"
s = io.open(P, encoding="utf-8").read()

# ---------- 1) mbook 收集可用名单 ----------
old = """            const mro = (typeof MON_RFO !== 'undefined') ? MON_RFO : [];
            const others = [
                ['rf1', '符文工房 新牧场物语', m1.length],
                ['rfo', '符文工房 海洋', mro.length],
                ['rf4', '符文工房4', m4.length],
                ['rf5', '符文工房5', mon5.length],
            ].filter(x => x[2] > 0);"""
new = """            const mro = (typeof MON_RFO !== 'undefined') ? MON_RFO : [];
            const m2 = (typeof MON_RF2 !== 'undefined') ? MON_RF2 : [];
            const mf = (typeof MON_RFF !== 'undefined') ? MON_RFF : [];
            const others = [
                ['rf1', '符文工房 新牧场物语', m1.length],
                ['rf2', '符文工房2', m2.length],
                ['rfo', '符文工房 海洋', mro.length],
                ['rff', '符文工房 边境', mf.length],
                ['rf4', '符文工房4', m4.length],
                ['rf5', '符文工房5', mon5.length],
            ].filter(x => x[2] > 0);"""
assert old in s
s = s.replace(old, new)

# ---------- 2) 插入 block2 / blockF ----------
anchor = "            /* ---------- 无数据 ---------- */"
blocks = r"""            /* ---------- RF2 ---------- */
            const block2 = () => {
                const at = [];
                m2.forEach(x => { if (x[2] && x[2] !== '—' && at.indexOf(x[2]) < 0) at.push(x[2]); });
                const sk = [];
                m2.forEach(x => { if (x[3] && x[3] !== '—' && sk.indexOf(x[3]) < 0) sk.push(x[3]); });
                const row = x => `<tr data-s="${x[0]} ${x[1]} ${x[2]} ${x[3]} ${x[4]}">
                    <td class="td left mon-n">${x[0]}</td>
                    <td class="td">${x[1]}</td>
                    <td class="td">${x[2]}</td>
                    <td class="td">${x[3]}</td>
                    <td class="td mon-f">${x[4]}</td>
                </tr>`;
                const atTop = at.map(a => [a, m2.filter(x => x[2] === a).length])
                    .sort((x, y) => y[1] - x[1]);
                return `
            <p class="p">RF2 的怪物表有一件别作没有的东西：<b>每只魔物都带一条说明文</b>，末尾写明它的<b>特技</b>与<b>属性</b>。所以这一页能回答一个很实际的问题——<b>我打它之前该换哪把武器</b>。</p>
            ${stat([['收录', m2.length + ' 只'], ['属性', at.length + ' 种'], ['特技', sk.length + ' 种'], ['数据源', '游戏文本解包']])}
            <h2 class="h2">先看属性，再挑武器</h2>
            <p class="p">属性是这个名单里最有用的字段：<b>同一族的魔物往往同属性</b>——兽人与蚂蚁是地，哥布林与维京系列是火，水牛与陆龟是水。打一整片迷宫前先扫一眼属性分布，比带三把武器轮着换省事。</p>
            ${tbl(['属性', '只数'], atTop, { leftFirst: true, cls: 'txt', colw: ['6rem', '5rem'] })}
            <h2 class="h2">全魔物清单</h2>
            <p class="p">按解包顺序排列。名字是<b>个体名</b>（奥库伊奇、哥布欧），后面一列才是<b>种类</b>（兽人、哥布林）——同一只怪在这作里有自己的名字，这正是它能把魔物当伙伴养的前提。</p>
            ${bar(m2.length)}
            <div class="table mon-table" data-list="rf2"><table><thead><tr>
                <th class="th left">魔物</th><th class="th">种类</th><th class="th">属性</th><th class="th">特技</th><th class="th">简介</th>
            </tr></thead><tbody>${m2.map(row).join('')}</tbody></table></div>
            <p class="p">简介里的描述常常直接点出打法：<b>「突进」的怪要提前横向闪，「连射攻击」的怪别站直线，「治愈」的怪拖久了会自己回满</b>。这些不是设定文字，是行为说明。</p>
            <div class="note">取自《符文工房2》汉化工程的游戏文本表（<b>monstername / monstercategory / monstercategory 三张表按行序配对</b>）。原表里另有两列数字，但解包工具没有标注它们的含义，本站不做推测、不展示。</div>`;
            };

            /* ---------- 边境 RFF ---------- */
            const blockF = () => {
                const row = (x, i) => `<tr data-s="${x[0]}">
                    <td class="td">${i + 1}</td>
                    <td class="td left mon-n">${x[0]}</td>
                </tr>`;
                return `
            <p class="p">边境这作能拿到的<b>只有名字</b>：汉化工程表里有一段完整的怪物名字表，但<b>没有等级、属性、掉落与捕捉率</b>——那些数据在这一作的文本里根本不存在，数值是写死在程序里的。</p>
            ${stat([['收录', mf.length + ' 种'], ['数值', '无'], ['数据源', '汉化工程文本表']])}
            <div class="table mon-table" data-list="rff"><table><thead><tr>
                <th class="th">序</th><th class="th left">魔物</th>
            </tr></thead><tbody>${mf.map(row).join('')}</tbody></table></div>
            <p class="p">名单里能看出这一作的怪物构成：<b>摩可摩可系（摩可摩可、摩奇摩奇）、昆虫系（黄蜂、女王蜂、蚂蚁、杀人蚁）、兽人系（兽人、高等兽人、兽人射手、兽人猎手）、哥布林系、牛头人系</b>——和 RF2 高度重合，说明两作共用了一大批怪物设计。差别在于边境加了<b>狮鹫、冰蛇、犬陶洛斯、貘</b>这些大型 Boss。</p>
            <div class="note">为什么只给名单：<b>有名字而没有数据，就把名字列全，不编造数值</b>。同样地，本站也不把「宠物个体名」（摩可、摩奇、乌伦这一批起名用的词）混进种类表。</div>`;
            };

            /* ---------- 无数据 ---------- */"""
assert anchor in s
s = s.replace(anchor, blocks, 1)

# ---------- 3) 分支选择与标题 ----------
old2 = """            const title = id === 'rf5' ? 'RF5' : (id === 'rfo' ? 'RFO'
                : (/^rf4/.test(id) ? 'RF4' : (id === 'rf1' ? 'RF1' : '')));
            const bodyText = id === 'rf5' ? block5()
                : /^rf4/.test(id) ? block4()
                    : id === 'rf1' ? block1()
                        : id === 'rfo' ? blockR()
                            : blockNone();"""
new2 = """            const cnt = id === 'rf5' ? mon5.length
                : /^rf4/.test(id) ? new Set(m4.map(x => x[0])).size
                    : id === 'rf1' ? m1.length
                        : id === 'rf2' ? m2.length
                            : id === 'rff' ? mf.length
                                : mro.length;
            const title = id === 'rf5' ? 'RF5' : (id === 'rfo' ? 'RFO'
                : (/^rf4/.test(id) ? 'RF4' : (id === 'rf1' ? 'RF1'
                    : (id === 'rf2' ? 'RF2' : (id === 'rff' ? 'RFF' : '')))));
            const bodyText = id === 'rf5' ? block5()
                : /^rf4/.test(id) ? block4()
                    : id === 'rf1' ? block1()
                        : id === 'rf2' ? block2()
                            : id === 'rff' ? blockF()
                                : id === 'rfo' ? blockR()
                                    : blockNone();"""
assert old2 in s
s = s.replace(old2, new2)

old3 = "${title ? `<h2 class=\"h2\">${title}：${id === 'rf5' ? mon5.length : (/^rf4/.test(id) ? new Set(m4.map(x => x[0])).size : (id === 'rf1' ? m1.length : mro.length))} 种魔物</h2>` : ''}"
new3 = "${title ? `<h2 class=\"h2\">${title}：${cnt} 种魔物</h2>` : ''}"
assert old3 in s
s = s.replace(old3, new3)

io.open(P, "w", encoding="utf-8").write(s)
print("mbook patched")
