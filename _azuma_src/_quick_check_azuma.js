const fs = require('fs');
// 加载 azuma.js 的 AZUMA_MON
const s = fs.readFileSync(require('path').join(__dirname, '..', 'js', 'azuma.js'), 'utf8');
const AZUMA_MON = eval(s.match(/const AZUMA_MON\s*=\s*([\s\S]*?);\n/)[1]);

const names = AZUMA_MON.map(m => m[0]);
const uniq = new Set(names);
console.log('总条数:', AZUMA_MON.length);
console.log('唯一名称数:', uniq.size, uniq.size === names.length ? '(无重复)' : '(有重复!)');

const rideCount = {};
AZUMA_MON.forEach(m => { rideCount[m[1]] = (rideCount[m[1]] || 0) + 1; });
console.log('骑乘分布:', JSON.stringify(rideCount));

// 区域为空的（BOSS/精英节）
const noZone = AZUMA_MON.filter(m => !m[2] || !m[2].trim()).map(m => m[0]);
console.log('区域空(BOSS/精英)条数:', noZone.length);
console.log('区域空名单:', noZone.join('、'));

// 抽查关键魔物
const must = ['赤鬼','九尾能','贝隆','空乃','大狸妖','白狼','牛头鬼','温罗王能','狼能'];
console.log('关键魔物命中:', must.map(n => n + (names.includes(n) ? '✓' : '✗')).join(' '));

// 渲染 HTML（复制 azumaMonHtml 逻辑，无外部依赖）
const cell = x => (x && x.trim()) ? x : '<span class="mon-no">—</span>';
const ride = r => r === '能' ? '可骑乘' : '<span class="mon-no">' + (r === '×' ? '不可' : '—') + '</span>';
const rows = AZUMA_MON.map(m => `<tr><td class="td left mon-n">${m[0]}</td><td class="td">${ride(m[1])}</td><td class="td">${cell(m[2])}</td><td class="td">${cell(m[3])}</td><td class="td">${cell(m[4])}</td><td class="td">${cell(m[5])}</td></tr>`).join('');
const html = `<div class="table mon-table"><table><thead><tr><th>名称</th><th>骑乘</th><th>出现区域</th><th>最爱物品</th><th>喜欢物品</th><th>讨厌物品</th></tr></thead><tbody>${rows}</tbody></table></div>`;
console.log('HTML 长度:', html.length);
console.log('含赤鬼:', html.includes('赤鬼'), '| 含九尾能:', html.includes('九尾能'), '| 含贝隆:', html.includes('贝隆'));
console.log('含 table mon-table:', html.includes('table mon-table'), '| 含 mon-no:', html.includes('mon-no'));
console.log('脏串检查 undefined:', html.includes('undefined'), '| NaN:', html.includes('NaN'), '| null:', html.includes('null'), '| [object:', html.includes('[object'));
