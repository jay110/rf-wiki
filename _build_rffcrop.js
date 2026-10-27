/* 生成 js/rffcrop.js —— 符文工房 边境（RFF）作物成长数据
 *
 * 数据源：RFF各作物各阶段所需时间.xls（Sheet1）
 *   列：季节 | 名字 | 种 | 芽 | 叶 | 花 | 十级出货额 | 繁荣参考 | 备注
 *   后面的「提示」行是原表自带的 5 条机制说明，一并收进 RFF_TIPS。
 *
 * 这份文件是 1997 年的 BIFF8（OLE2 复合文档），不是 zip 包着的 xlsx，
 * 仓库里的零依赖 _xlsx_read.py 读不了，所以用 SheetJS：
 *     npm i xlsx          （本机用 npmmirror 源可离线安装）
 *     node _build_rffcrop.js
 *
 * 输出：js/rffcrop.js
 *   RFF_CROP = [季节, 作物名, [种,芽,叶,花], 十级出货额(可空), 繁荣参考, 备注]
 *   RFF_TIPS = [说明文本, ...]
 */
const X = require('xlsx');
const fs = require('fs');
const path = require('path');

const SRC = 'G:/10257/Downloads/符文攻略/RFF各作物各阶段所需时间.xls';
const OUT = path.join(__dirname, 'js', 'rffcrop.js');

const wb = X.readFile(SRC);
const rows = X.utils.sheet_to_json(wb.Sheets['Sheet1'], { header: 1, raw: true, defval: '' });

let season = '';
const crops = [], tips = [];

rows.slice(1).forEach(r => {
    const s = String(r[0] || '').trim();
    if (s) season = s;                             // 季节只在每组第一行写，向下沿用
    const name = String(r[1] || '').trim();
    if (!name) return;

    // 原表末尾的「提示」行：文字在第二列（r[1]），不是第三列
    if (season === '提示') { tips.push(String(r[1] || '').trim()); return; }

    const price = String(r[6] || '').trim();
    // 四个阶段：种 / 芽 / 叶 / 花
    const stages = [2, 3, 4, 5].map(i => {
        const v = Number(String(r[i] || '').replace(/[^\d.]/g, ''));
        return isFinite(v) ? v : 0;
    });

    crops.push([
        season, name, stages,
        /^\d+$/.test(price) ? Number(price) : null,   // 牧草没有出货价
        String(r[7] || '').trim(),
        String(r[8] || '').trim(),
    ]);
});

const J = o => JSON.stringify(o);
let out = '/* 符文工房 边境（RFF）作物成长数据\n';
out += '   来源：RFF各作物各阶段所需时间.xls（Sheet1），由 _build_rffcrop.js 生成\n';
out += '   字段：[季节, 作物名, [种,芽,叶,花]天数, 十级出货额(可空), 繁荣参考, 备注] */\n';
out += 'const RFF_CROP = [\n';
crops.forEach(r => { out += '    ' + J(r) + ',\n'; });
out += '];\n\n';
out += '/* 原表末尾附的 5 条机制说明（阶段 / 肥料 / 繁荣读法 / 无繁荣参考 / 备注） */\n';
out += 'const RFF_TIPS = [\n';
tips.forEach(t => { out += '    ' + J(t) + ',\n'; });
out += '];\n';

fs.writeFileSync(OUT, out, 'utf8');
console.log('作物', crops.length, '｜提示', tips.length, '｜输出', OUT, fs.statSync(OUT).size, 'B');

const T = r => r[2].reduce((a, b) => a + b, 0);
console.log('季节分布', JSON.stringify(crops.reduce((a, r) => (a[r[0]] = (a[r[0]] || 0) + 1, a), {})));
console.log('天数区间', Math.min(...crops.map(T)), '-', Math.max(...crops.map(T)));
