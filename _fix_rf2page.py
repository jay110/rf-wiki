# -*- coding: utf-8 -*-
"""修正 RF2 物品页：说明里没有收获天数，真正有用的是播种季节。"""
import io

P = r"G:/wit_tools/work/RF_WIKI/js/pages.js"
s = io.open(P, encoding="utf-8").read()

old_start = "            const rows = IT.map(r => ['all', `${r[0]} ${r[1]}`, [r[0], r[1]]]);\n            /* 说明里写明了季节与天数的，基本都是种植物 */\n            const dayHit = IT.filter(r => /\\d+\\s*天/.test(r[1])).length;"
new_start = """            const rows = IT.map(r => ['all', `${r[0]} ${r[1]}`, [r[0], r[1]]]);
            /* 种子的说明写着「可以在X季播种」，这是这份表里最实在的字段 */
            const seaHit = IT.filter(r => /可以在[春夏秋冬]/.test(r[1])).length;
            const seaRows = ['春', '夏', '秋', '冬'].map(se => {
                const L = IT.filter(r => r[1].indexOf('可以在' + se) >= 0).map(r => r[0].replace(/种子$/, ''));
                const uniq = L.filter((x, i) => L.indexOf(x) === i);
                return [se + '季（' + uniq.length + '）', uniq.join('、')];
            }).filter(x => x[0].indexOf('（0）') < 0);"""
assert old_start in s
s = s.replace(old_start, new_start)

old_body = """            <p class="p">本页是<b>《符文工房2》</b>的完整物品清单，共 ${IT.length} 件。它和别作的清单有个区别：<b>每件东西都带一句说明</b>，而且这句说明不是装饰——什么时候能种、几天能收、吃了有什么用，全写在里面。</p>
            ${stat([['收录', IT.length + ' 件'], ['带说明', hasDesc + ' 件'], ['写明天数', dayHit + ' 件']])}

            <h2 class="h2">怎么读这份表</h2>
            <p class="p">说明那一列短得像广告词，但信息密度很高。举三个真实条目：</p>
            ${tbl(['条目', '说明', '能读出什么'], [
                ['芜菁种子', '春季蔬菜。4天即可收获。', '只能春播，4 天一轮'],
                ['樱芜菁', '呈现漂亮粉红色的芜菁。', '改良品种，说明不含天数'],
                ['回复饮料', '回复饮料，喝下去恢复体力。', '直接用途，不用猜'],
            ], { leftFirst: true, cls: 'txt', colw: ['5rem', '11rem'] })}
            <p class="p">所以查表的方法很直接：<b>想知道某样东西几天能收，搜它的名字看说明第一句</b>；想知道某样素材是干嘛的，同样看第一句。</p>"""

new_body = """            <p class="p">本页是<b>《符文工房2》</b>的完整物品清单，共 ${IT.length} 件，每件都带一句说明。这句说明不是装饰——<b>哪一季能种、是什么属性、拿来做什么</b>，都写在里面。</p>
            ${stat([['收录', IT.length + ' 件'], ['带说明', hasDesc + ' 件'], ['写明播种季', seaHit + ' 件']])}

            <h2 class="h2">最有用的一栏：播种季节</h2>
            <p class="p">${seaHit} 种种子的说明直接写着「<b>可以在X季播种</b>」。这一栏比价格有用得多，因为季节是硬限制——<b>种错季就是一天白干</b>。下面按季分好了：</p>
            ${tbl(['季节', '种子'], seaRows, { leftFirst: true, cls: 'txt', colw: ['5.4rem'] })}
            <div class="note">这份分季表和别作的经验不一样，别照记忆种：<b>芜菁在这作是冬播</b>（多数作品是春），草莓是春播，马铃薯与胡萝卜是秋播。数据直接来自说明文本，不是推测。</div>

            <h2 class="h2">其余说明怎么读</h2>
            <p class="p">非种子的说明短得像广告词，但定位很清楚：</p>
            ${tbl(['条目', '说明', '能读出什么'], [
                ['阔剑', '轻巧易用的剑，适合新手。', '入门武器，不是终盘货'],
                ['风之剑', '寄宿着风之魔力的剑。', '自带风属性，怕风的敌人会吃满'],
                ['卷心菜', '生吃、火烤、水煮皆可,', '食材，说明写的是吃法'],
            ], { leftFirst: true, cls: 'txt', colw: ['5rem', '11rem'] })}
            <p class="p">所以查法很直接：<b>想知道什么季节能种，搜种子名；想知道一件武器什么属性，搜它的名字看「寄宿着X之魔力」</b>。属性写在说明里的武器，强化时还能再叠一层。</p>"""

assert old_body in s
s = s.replace(old_body, new_body)

io.open(P, "w", encoding="utf-8").write(s)
print("rf2 page fixed")
