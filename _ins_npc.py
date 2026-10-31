import io, re
p = 'js/pages.js'
s = io.open(p, encoding='utf-8').read()

anchor = "/* 龙之天地（azuma）专属：BOSS 战（不混入七作 boss.js 模板，gms 仅 azuma） */"
assert s.count(anchor) == 1

fn = r'''/* 龙之天地（azuma）专属：角色详情 16 位（post/1837–1852，一页一人）
   与「村民喜好」页的 17 位村民是两批人，两页零重叠，这里不重复收录村民。 */
function azumaNpcHtml() {
    const A = (typeof NPC_AZUMA !== 'undefined') ? NPC_AZUMA.chars : [];
    if (!A.length) return '';
    const SEA = ['春', '夏', '秋', '冬'];
    const bdKey = c => {
        const m = /^([春夏秋冬])(\d+)日$/.exec(c.bd || '');
        return m ? SEA.indexOf(m[1]) * 100 + Number(m[2]) : 9999;
    };
    const list = A.slice().sort((a, b) => bdKey(a) - bdKey(b) || a.n.localeCompare(b.n));
    const isBond = v => /牵绊/.test(v);
    const dash = '<span class="mon-no">—</span>';
    const J = a => (a && a.length) ? a.join('、') : dash;
    const has = (a, k) => a && a[k] && a[k].length;

    const nIntro = A.reduce((s, c) => s + c.intro.length, 0);
    const nSkill = A.reduce((s, c) => s + c.skills.length, 0);
    const nCvJp = A.filter(c => c.cvJp).length;
    const nCvEn = A.filter(c => c.cvEn).length;
    const nBond = A.filter(c => c.skills.some(x => isBond(x[1]))).length;

    /* 按季节数一遍生日，不手写数字 */
    const bySea = SEA.map(k => [k, list.filter(c => (c.bd || '').charAt(0) === k).length]);
    const noBd = list.filter(c => !c.bd).length;
    const mostSkill = list.slice().sort((a, b) => b.skills.length - a.skills.length)[0];
    const mostLv = list.slice().sort((a, b) =>
        b.skills.filter(x => !isBond(x[1])).length - a.skills.filter(x => !isBond(x[1])).length)[0];

    /* 与「村民技能」页（post/1828）逐人对一遍：同一批人、同一套技能，两页的条数与档位对不上 */
    const SR = (typeof SKILL_AZUMA !== 'undefined') ? SKILL_AZUMA.rows : [];
    const byP = {};
    SR.forEach(r => { (byP[r[0]] = byP[r[0]] || []).push([r[1], r[2]]); });
    const cnt2 = arr => [arr.filter(x => !isBond(x[1])).length, arr.filter(x => isBond(x[1])).length];
    const tier = arr => {
        const m = {};
        arr.forEach(x => { const g = /牵绊Lv(\d+)/.exec(x[1]); if (g) m[g[1]] = x[0]; });
        return m;
    };
    const cmp = list.map(c => {
        const mine = c.skills.map(x => [x[0], x[1]]), other = byP[c.n] || [];
        if (!other.length) return null;
        const a = cnt2(mine), b = cnt2(other);
        const ta = tier(mine), tb = tier(other);
        const diff = Object.keys(ta).filter(k => tb[k] && tb[k] !== ta[k]).sort((x, y) => x - y);
        return { n: c.n, a: a, b: b, diff: diff,
                 ex: diff.length ? [diff[0], ta[diff[0]], tb[diff[0]]] : null };
    }).filter(x => x && (x.a[0] !== x.b[0] || x.a[1] !== x.b[1] || x.diff.length));
    const tierDiff = cmp.filter(x => x.diff.length);
    const cntDiff = cmp.filter(x => x.a[0] !== x.b[0] || x.a[1] !== x.b[1]);

    const card = c => {
        const lvN = c.skills.filter(x => !isBond(x[1])).length;
        const bdN = c.skills.filter(x => isBond(x[1])).length;
        const tasteRow = (lab, o, k1, k2) => (has(o, k1) || has(o, k2))
            ? `${lab}：${has(o, k1) ? '<b>最喜欢</b> ' + J(o[k1]) : ''}${has(o, k1) && has(o, k2) ? '　／　' : ''}${has(o, k2) ? '<b>喜欢</b> ' + J(o[k2]) : ''}`
            : '';
        const badRow = (lab, o, k1, k2) => (has(o, k1) || has(o, k2))
            ? `${lab}：${has(o, k1) ? '<b>讨厌</b> ' + J(o[k1]) : ''}${has(o, k1) && has(o, k2) ? '　／　' : ''}${has(o, k2) ? '<b>最讨厌</b> ' + J(o[k2]) : ''}`
            : '';
        const g = c.gift || {};
        const giftBits = [
            has(g, 'ret') ? '<b>回礼</b> ' + J(g.ret) : '',
            has(g, 'birthday') ? '<b>给你的生日礼物</b> ' + J(g.birthday) : '',
            has(g, 'bath') ? '<b>泡澡后的乐子</b> ' + J(g.bath) : '',
            has(g, 'bento') ? '<b>便当</b> ' + J(g.bento) : '',
            has(g, 'cook') ? '<b>一起烹饪</b> ' + J(g.cook) : '',
        ].filter(Boolean);
        const rows = [
            ['礼物喜好', [tasteRow('', c.like, 'best', 'good'), badRow('', c.like, 'bad', 'worst')].filter(Boolean).join('<br>') || dash],
            ['共度时光', [tasteRow('', c.topic, 'best', 'good'), badRow('', c.topic, 'bad', 'worst')].filter(Boolean).join('<br>') || dash],
            ['互动', giftBits.length ? giftBits.join('<br>') : dash],
            ['技能', `等级型 <b>${lvN}</b> 条${bdN ? '／牵绊型 <b>' + bdN + '</b> 条' : '／<b>无牵绊型</b>'}`],
        ];
        return `
        <h3 class="h3">${c.n}${c.jp ? '（' + c.jp + (c.en ? '、' + c.en : '') + '）' : ''}</h3>
        ${c.intro.length ? c.intro.map(x => `<p class="p">${x}</p>`).join('') : ''}
        ${tbl(rows.map(r => [r[0], r[1]]), { leftFirst: true, colw: ['6.2rem', 'auto'], cls: 'azuq' })}
        <details class="mon-fold"><summary>展开 ${c.n} 的技能表（${c.skills.length} 条）</summary>
        ${tbl(['技能', '等级', '描述'], c.skills.map(x => [
        x[0], x[1], (x[2] && x[2] !== '0' && x[2] !== '—') ? x[2] : dash,
    ]), { colw: ['auto', '5.6rem', 'auto'], left: [0, 2], cls: 'azuq' })}
        </details>`;
    };

    return `
        <h2 class="h2">16 个人，一人一页，和村里那 17 位不是同一批</h2>
        <p class="p">龙之天地有 16 位角色在源站各占一篇单独的角色页（post/1837–1852），这里按<b>生日</b>排一遍收全。「村民喜好」页收录的 17 位（坂木、拓弥、铃、飞燕、翡翠、草津、小太郎、八千代、萨扎、渡濑、空、海、陆、花、露、夜、摩可绒）与这 16 位<b>零重叠</b>——两页各查各的，本页不重复列村民的礼物清单。</p>
        ${stat([
        ['角色', A.length + ' 人'],
        ['简介', nIntro + ' 段'],
        ['技能', nSkill + ' 条'],
        ['有日语配音', nCvJp + ' 人'],
    ])}
        <p class="p">源文有两种版式：<b>1837–1846</b> 是「生日、喜好物品、喜欢的话题、互动赠礼以及技能表」，<b>1847–1852</b> 是「角色图鉴」。两边字段一致，差别只在后者没有「英语配音」那一行——所以全篇只有 <b>${nCvEn} 人</b>有英配记录，其余留空，不替它们补。</p>
        <p class="p">生日按季节排开是 ${bySea.map(x => x[0] + ' ' + x[1] + ' 人').join('、')}${noBd ? '，另有 ' + noBd + ' 人源文没写生日' : '，16 人一个不缺'}；技能最多的是<b>${mostSkill.n}</b>（${mostSkill.skills.length} 条），其中等级型最多的是<b>${mostLv.n}</b>（${mostLv.skills.filter(x => !isBond(x[1])).length} 条）；有牵绊技能的 <b>${nBond} 人</b>，无牵绊的 <b>${A.length - nBond} 人</b>。</p>
        ${tbl(['生日', '名字', '原名', '日语配音', '技能'], list.map(c => [
        c.bd || dash, '<b>' + c.n + '</b>', c.jp + (c.en ? '、' + c.en : ''),
        c.cvJp || dash,
        c.skills.filter(x => !isBond(x[1])).length + (c.skills.some(x => isBond(x[1])) ? ' + 牵绊 ' + c.skills.filter(x => isBond(x[1])).length : ''),
    ]), { colw: ['5.4rem', '6.4rem', 'auto', '9rem', '7.4rem'], left: [2], cls: 'azuq' })}
        <div class="note">「原名」列照源文写法，日文在前、英文在后。「日语配音」一列<b>${A.filter(c => !c.cvJp).map(c => c.n).join('、') || '全数齐全'}</b>${A.filter(c => !c.cvJp).length ? ' 的源文是空的（写了「日语配音：」后面没填人），照录不补。' : ' 全部有记录。'}</div>

        <h2 class="h2">一位一位看</h2>
        <p class="p">简介是源文原文，<b>繁体字照录、未转简体、未改写</b>——这类人物介绍一旦顺手改成简体，就跟原文对不上了，也对不上别的资料站。礼物四档、话题四档、互动五项都是原表内容；技能表收在折叠区里，点开才展开。</p>
        ${list.map(card).join('')}

        <h2 class="h2">同一批人，「村民技能」页的数字对不上</h2>
        <p class="p">站内另有一页「村民技能」（源 post/1828），收的是同一批人的技能表。<b>两页逐人对下来，${cmp.length} 人条数或档位不一致</b>——不是解析漏了，是两份源文本身写得不一样。这里把差异原样摆出来，两边都不改：</p>
        ${tbl(['角色', '本页（等级型／牵绊型）', '技能页（等级型／牵绊型）', '同一档牵绊技名不同'], cmp.map(x => [
        '<b>' + x.n + '</b>',
        x.a[0] + ' ／ ' + x.a[1],
        x.b[0] + ' ／ ' + x.b[1],
        x.diff.length ? '<b>' + x.diff.length + '</b> 档' + (x.ex ? '（Lv' + x.ex[0] + '：本页「' + x.ex[1] + '」／技能页「' + x.ex[2] + '」）' : '') : dash,
    ]), { colw: ['6.4rem', 'auto', 'auto', 'auto'], left: [1, 2, 3], cls: 'azuq' })}
        ${cntDiff.length ? `<div class="key">条数上的差有两种：<b>${cntDiff.filter(x => x.a[1] === 0).map(x => x.n).join('、') || '无'}</b>在本页没有任何牵绊型技能（源文那一篇就没列），但技能页有 10 条；其余几位的<b>等级型</b>比技能页多，多出来的是 Lv70／Lv80 这两档——本页有、技能页停在 Lv60。</div>` : ''}
        ${tierDiff.length ? `<div class="note">最后一列的「同一档牵绊技名不同」是更麻烦的一种：同一句「牵绊Lv2」，本页写「${tierDiff[0].ex[1]}」，技能页写「${tierDiff[0].ex[2]}」，而且换个档位两边又各自对得上别的技能——<b>像是两份表把牵绊技能的解锁顺序排错了位</b>。没有第三份来源能判谁对，所以两页各留各的，谁也不改，读者按自己信的那份用。</div>` : ''}

        <div class="jump">
            <a href="#/page/npcgift"><div class="jp-t">村民喜好</div><div class="jp-s">村里那 17 位的礼物清单</div></a>
            <a href="#/page/azuma_skill"><div class="jp-t">村民技能</div><div class="jp-s">全作 502 条技能按人列出</div></a>
            <a href="#/page/request"><div class="jp-t">委托任务</div><div class="jp-s">东国任务六条线</div></a>
        </div>
        <div class="note">数据取自 ${(typeof NPC_AZUMA !== 'undefined') ? NPC_AZUMA.src : 'gametoeasy'}，一页一人、共 16 篇，由 <code>_build_npc_azuma.py</code> 解析生成。<b>源页 1842 的标题写的是「伊吕波」，正文其实是玛罗（マウロ、Mauro）</b>——标题串了页，内容为准，这里按正文收录玛罗。字段一律照录：空着的配音、没写的生日、只有两个字的列，都不替它补。</div>`;
}

'''

s = s.replace(anchor, fn + anchor)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('inserted')
