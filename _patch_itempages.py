# -*- coding: utf-8 -*-
"""新增 RF2 与边境的物品一览页。"""
import io

P = r"G:/wit_tools/work/RF_WIKI/js/pages.js"
s = io.open(P, encoding="utf-8").read()

s = s.replace("（<b>monstername / monstercategory / monstercategory 三张表按行序配对</b>）",
              "（<b>monstername / monstercategory / monstercomment 三张表按行序配对</b>）")

anchor = "\n\n    {\n        key: 'recipe', group: 'item', title: '配方大全', icon: 'book',"
assert anchor in s, "anchor not found"

NEW = r"""

    {
        key: 'rf2list', group: 'item', title: '物品一览', icon: 'bottle',
        gms: ['rf2'],
        body: (g) => {
            const IT = (typeof ITEM_RF2 !== 'undefined') ? ITEM_RF2 : [];
            const hasDesc = IT.filter(r => r[1] && r[1] !== '—').length;
            const rows = IT.map(r => ['all', `${r[0]} ${r[1]}`, [r[0], r[1]]]);
            /* 说明里写明了季节与天数的，基本都是种植物 */
            const dayHit = IT.filter(r => /\d+\s*天/.test(r[1])).length;
            return `
            <p class="p">本页是<b>《符文工房2》</b>的完整物品清单，共 ${IT.length} 件。它和别作的清单有个区别：<b>每件东西都带一句说明</b>，而且这句说明不是装饰——什么时候能种、几天能收、吃了有什么用，全写在里面。</p>
            ${stat([['收录', IT.length + ' 件'], ['带说明', hasDesc + ' 件'], ['写明天数', dayHit + ' 件']])}

            <h2 class="h2">怎么读这份表</h2>
            <p class="p">说明那一列短得像广告词，但信息密度很高。举三个真实条目：</p>
            ${tbl(['条目', '说明', '能读出什么'], [
                ['芜菁种子', '春季蔬菜。4天即可收获。', '只能春播，4 天一轮'],
                ['樱芜菁', '呈现漂亮粉红色的芜菁。', '改良品种，说明不含天数'],
                ['回复饮料', '回复饮料，喝下去恢复体力。', '直接用途，不用猜'],
            ], { leftFirst: true, cls: 'txt', colw: ['5rem', '11rem'] })}
            <p class="p">所以查表的方法很直接：<b>想知道某样东西几天能收，搜它的名字看说明第一句</b>；想知道某样素材是干嘛的，同样看第一句。</p>

            <h2 class="h2">全物品清单</h2>
            <p class="p">按解包顺序排列，${IT.length} 件。这个顺序不是按类别排的——同一段里既有作物也有料理，因为解包表本身就没给分类字段。</p>
            ${ftable(['名称', '说明'], ['7rem'],
                rows, {
                    ph: '输入物品名或说明里的词筛选',
                    note: `<div class="note">取自《符文工房2》汉化工程的游戏文本表（<b>itemname 与 itemhelp 两张表按行序配对</b>，763 行逐条对应）。原表另有一列分类编号，但编号与物品类别对不上——同一编号下混着蔬菜、料理和矿石，因此本站不按它分类。<b>说明列过长时可左右滑动表格。</b></div>`
                })}
            <div class="jump">
                <a href="#/page/rf5potion">
                    <div class="jp-t">药品</div>
                    <div class="jp-s">回复药与营养剂的分工</div>
                </a>
                <a href="#/page/cook">
                    <div class="jp-t">料理与食材</div>
                    <div class="jp-s">器具分级与礼物策略</div>
                </a>
            </div>`;
        }
    },
    {
        key: 'rfflist', group: 'item', title: '物品一览', icon: 'bottle',
        gms: ['rff'],
        body: (g) => {
            const IT = (typeof ITEM_RFF !== 'undefined') ? ITEM_RFF : [];
            const CATS = [];
            IT.forEach(r => { if (CATS.indexOf(r[1]) < 0) CATS.push(r[1]); });
            const rows = IT.map(r => [r[1], `${r[0]} ${r[1]} ${r[2]}`, [r[0], r[2]]]);
            const cnt = {};
            CATS.forEach(c => { cnt[c] = IT.filter(r => r[1] === c).length; });
            const dayHit = IT.filter(r => /\d+\s*天/.test(r[2])).length;
            return `
            <p class="p">本页是<b>《符文工房 边境》</b>的物品清单，共 ${IT.length} 件、${CATS.length} 类。这一作的物品表<b>能按类别切开</b>——解包文本里物品是成段排列的，种子一段、鱼一段、料理一段、武器一段，段与段之间的边界很清楚。</p>
            ${stat([['收录', IT.length + ' 件'], ['类别', CATS.length + ' 类'], ['写明天数', dayHit + ' 件']])}

            <h2 class="h2">种子的说明最好用</h2>
            <p class="p">边境的作物说明几乎都写成「<b>某季蔬菜。N天即可收获</b>」的格式，有的还会补一句「收获后 N 天可再次收获」。这一句就是种田的全部计划依据——<b>按季节排一张轮作表，比记住每种作物叫什么更有用</b>。</p>
            <div class="note">这一作的季节是硬限制：<b>换季时上一季的作物会枯死</b>。所以规划时先看季，再看天数，最后才看卖价。</div>

            <h2 class="h2">全物品清单</h2>
            <p class="p">按解包顺序排列，按类别可以筛。${CATS.map(c => `${c} ${cnt[c]}`).join('　·　')}</p>
            ${ftable(['名称', '说明'], ['7rem'],
                rows, {
                    chips: CATS,
                    ph: '输入物品名或说明里的词筛选',
                    note: `<div class="note">取自「边境汉化」工程表的日／中对照行：名字段 ${IT.length} 条与说明段 745 条<b>按索引一一对应</b>（已逐条核对）。原名一律用汉化组的定稿译名，未做二次改写。<b>说明列过长时可左右滑动表格。</b></div>`
                })}
            <div class="jump">
                <a href="#/page/mbook">
                    <div class="jp-t">魔物图鉴</div>
                    <div class="jp-s">本作 ${(typeof MON_RFF !== 'undefined' ? MON_RFF.length : 0)} 种魔物的名字</div>
                </a>
                <a href="#/page/cook">
                    <div class="jp-t">料理与食材</div>
                    <div class="jp-s">器具分级与礼物策略</div>
                </a>
            </div>`;
        }
    },
"""

s = s.replace(anchor, NEW + anchor.lstrip("\n"), 1)
io.open(P, "w", encoding="utf-8").write(s)
print("pages added")
