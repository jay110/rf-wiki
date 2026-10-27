# -*- coding: utf-8 -*-
"""zhname 页面：改为 符文1 / 边境 / 海洋 三作分流"""
import io

P = r'G:/wit_tools/work/RF_WIKI/js/pages.js'
s = io.open(P, encoding='utf-8').read()
start = s.index("        key: 'zhname', group: 'lore'")
end = s.index("        key: 'changelog', group: 'lore'")

NEW = '''        key: 'zhname', group: 'lore', title: '中文译名对照', icon: 'board',
        gms: ['rf1', 'rff', 'rfo'],
        body: g => {
            const id = (g && g.id) || 'rfo';
            const t2 = (rows, ph) => ftableOwn(
                ['日文原文', '汉化译名'], ['11rem', ''],
                rows.map(r => [r[0] + r[1], [r[0], r[1]]]),
                { ph: ph, cls: 'term-aux' });
            const t3 = (rows, ph) => ftableOwn(
                ['日文原文', '汉化译名', '英文原名'], ['9rem', '9rem', ''],
                rows.map(r => [r[0] + r[1] + (r[2] || ''), [r[0], r[1], r[2] || '—']]),
                { ph: ph, cls: 'term-aux' });

            /* ---------------- 符文1 ---------------- */
            if (id === 'rf1') {
                const I = (typeof CN_RF1_ITEM !== 'undefined') ? CN_RF1_ITEM : [];
                const N = (typeof CN_RF1_NPC !== 'undefined') ? CN_RF1_NPC : [];
                const L = (typeof CN_RF1_PLACE !== 'undefined') ? CN_RF1_PLACE : [];
                const E = (typeof CN_RF1_EVENT !== 'undefined') ? CN_RF1_EVENT : [];
                const K = (typeof CN_RF1_KIND !== 'undefined') ? CN_RF1_KIND : [];
                const A = (typeof CN_RF1_ABI !== 'undefined') ? CN_RF1_ABI : [];
                const T = (typeof CN_RF1_TYPE !== 'undefined') ? CN_RF1_TYPE : [];
                const AT = (typeof CN_RF1_ATTR !== 'undefined') ? CN_RF1_ATTR : [];
                const tot = I.length + N.length + L.length + E.length + K.length + A.length + T.length + AT.length;
                return `
            <h2 class="h2">符文1 的汉化译名</h2>
            ${stat([['官方中文', '无（2006・NDS）'], ['民间汉化', '已完成'], ['对照条目', tot + ' 条']])}
            <p class="p">《符文工房 新牧场物语》没有官方中文，民间汉化版已完成并逐条定稿。本站 RF1 相关条目以这份译名为准，下面共 <b>${tot} 条</b>：物品、角色、地点、节日与生日，外加系统用词。日文原文一并列出，方便对照日文版与日文攻略。</p>
            <div class="key">译名优先级：<b>汉化版定稿 &gt; 英文官方 &gt; 日文直译</b>。同一角色在不同作品的汉化版里可能用字不同（例如 RF1 的メロディ作「梅洛迪」，边境作「美乐蒂」），本表按各作自己的定稿列出，不作跨作统一。</div>
            <h2 class="h2">节日与生日（${E.length} 条）</h2>
            <p class="p">RF1 的年度日程：既有节庆，也把每位居民的生日单列成条目。送礼、蹲点、安排日程都靠这张表。</p>
            ${t2(E, '输入节日或角色名筛选')}
            <h2 class="h2">角色（${N.length} 条）</h2>
            ${t2(N, '输入角色名筛选')}
            <h2 class="h2">地点与存档点（${L.length} 条）</h2>
            <p class="p">洞窟、遗迹、山川与自宅。带「中层／下层／深处」的是同一区域的不同存档点。</p>
            ${t2(L, '输入地点名筛选')}
            <h2 class="h2">物品（${I.length} 条）</h2>
            <p class="p">作物、武器、道具与料理的全表译名。日文原文可与日文攻略的物品表直接对号。</p>
            ${t2(I, '输入物品名筛选')}
            <h2 class="h2">系统用词</h2>
            <h3 class="h3">物品分类（${T.length} 条）</h3>
            ${t2(T, '输入分类名筛选')}
            <h3 class="h3">属性词条（${AT.length} 条）</h3>
            ${t2(AT, '输入属性名筛选')}
            <h3 class="h3">魔物种类（${K.length} 条）</h3>
            ${t2(K, '输入种类名筛选')}
            <h3 class="h3">魔物能力（${A.length} 条）</h3>
            ${t2(A, '输入能力名筛选')}
            <div class="note">数据来源为 RF1 汉化工程的文本导出表，已剔除「未定」占位条目。物品译名以游戏内显示为准，与日文攻略书的俗称可能有出入。</div>
        `;
            }

            /* ---------------- 海洋 ---------------- */
            if (id === 'rfo') {
                const C = (typeof CN_RFO !== 'undefined') ? CN_RFO : [];
                const cats = [['人名', '人名'], ['地名', '地名'], ['设施', '设施'],
                ['节日活动', '节日与活动'], ['用词', '常用词与按键'], ['其它', '其它']];
                const blocks = cats.map(([k, label]) => {
                    const r = C.filter(t => t[0] === k);
                    if (!r.length) return '';
                    return `<h3 class="h3">${label}（${r.length} 条）</h3>` + ftableOwn(
                        ['日文原文', '汉化译名', '备注'], ['9rem', '9rem', ''],
                        r.map(t => [t[1] + t[2] + (t[3] || ''), [t[1], t[2], t[3] || '—']]),
                        { ph: '输入日文或中文筛选', cls: 'term-aux' });
                }).join('');
                return `
            <h2 class="h2">海洋的中文版与译名</h2>
            ${stat([['官方中文', 'Wii 亚洲版：有'], ['PS3 版', '沿用同一套译名'], ['对照条目', C.length + ' 条']])}
            <p class="p">《符文工房 海洋》是系列里唯一在亚洲发行过官方中文的正统作：Wii 版自带中文文本与中文贴图。后出的 PS3 版（Tides of Destiny）没有官方中文，汉化时沿用同一套译名，所以两边是<b>同一套用词</b>。本站海洋条目的人名、地名、设施、节日全部按这套定稿，共 <b>${C.length} 条</b>。</p>
            <div class="key">几个最容易对不上的：<b>アイリス＝艾伊莉丝</b>（不是爱丽丝）、<b>エレクトラ＝伊蕾克特拉</b>、<b>キルト＝琪芦多</b>、<b>ジョー＝乔</b>、<b>ソニア＝索妮亚</b>（不是索妮娅）。地名里「精霊殿」作<b>精灵神殿</b>、楼层用「N 层」；「ウェディングチャペル」是教堂前那座石拱门与钟，定名<b>婚礼钟台</b>，不是教堂本身。</div>
            ${blocks}
            <div class="note">备注栏里的「10-02 统一」等字样是汉化过程中的定稿时间标记，不是游戏内文本。按键一栏原表按 Wii 手柄键位记录，另一版汉化时统一改成了对应键名。</div>
        `;
            }

            /* ---------------- 边境 ---------------- */
            const P = (typeof CN_RFF_PERSON !== 'undefined') ? CN_RFF_PERSON : [];
            const L = (typeof CN_RFF_PLACE !== 'undefined') ? CN_RFF_PLACE : [];
            const I = (typeof CN_RFF_ITEM !== 'undefined') ? CN_RFF_ITEM : [];
            const M = (typeof CN_RFF_MISC !== 'undefined') ? CN_RFF_MISC : [];
            const tot = P.length + L.length + I.length + M.length;
            const person = ftableOwn(
                ['日文原文', '汉化译名', '英文原名', '形象'],
                ['7.5rem', '7.5rem', '7rem', ''],
                P.map(r => [r[0] + r[1] + (r[2] || '') + (r[3] || ''), [r[0], r[1], r[2] || '—', r[3] || '—']]),
                { ph: '输入日文、中文或英文筛选', cls: 'term-aux' });
            return `
            <h2 class="h2">边境的中文版与译名</h2>
            ${stat([['官方中文', '无（2008・Wii）'], ['民间汉化', '已发布'], ['对照条目', tot + ' 条']])}
            <p class="p">《符文工房 边境》（Rune Factory Frontier，Wii・2008）没有官方中文，但民间汉化版已经发布，词条名由汉化组逐条定稿。本站边境相关的角色、地点、节日、物品一律以这份定稿译名为准，下面 <b>${tot} 条</b>全部列出，日文原文与英文原名一并给出——这样无论你玩的是日文版、英文版还是汉化版，都能互相反查。</p>
            <div class="key">译名优先级：<b>汉化版定稿 &gt; 英文官方 &gt; 日文直译</b>。三座遗迹在汉化版里是<b>若草／蔓草／雪草遗迹</b>，季节活动「海開き」作<b>海滩开放日</b>、「鍋大会」作<b>火锅大会</b>、「クイズ大会」作<b>知识大赛</b>。</div>
            <h2 class="h2">角色（${P.length} 条）</h2>
            <p class="p">花嫁候补与主要居民。第四列是汉化组标注的形象，方便确认说的是哪一个人。</p>
            ${person}
            <h2 class="h2">地名与节日（${L.length} 条）</h2>
            ${t3(L, '输入地名或节日名筛选')}
            <h2 class="h2">物品（${I.length} 条）</h2>
            <p class="p">农具、道具与料理。日文原文可用于对照日文攻略里的物品表。</p>
            ${t3(I, '输入物品名筛选')}
            <h2 class="h2">术语、星座与魔物（${M.length} 条）</h2>
            <p class="p">系列术语与世界观名词，外加边境特有的星座名与几种魔物。最容易译错的是 <b>ルーニー</b>——它是「<b>符文精灵</b>」，不是「符文」本身（符文是ルーン）；<b>アースマイト</b>作「<b>大地之伴</b>」，<b>エルフ</b>作「艾尔夫」。</p>
            ${t3(M, '输入术语或魔物名筛选')}
            <div class="note">表中带「＠…＠」的是游戏内变量占位符，实际会替换成玩家输入的名字，不是屏幕上会出现的文字。同一角色在不同作品汉化版里用字可能不同（如ミスト在边境作「密丝特」、在符文1作「蜜丝特」），各表按本作定稿列出。</div>
        `;
        }
    },
    {
'''

s = s[:start] + NEW + s[end:]
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('已改写 zhname（三作分流），文件长度', len(s))
