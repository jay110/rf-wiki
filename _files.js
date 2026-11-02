/* 源码清单的唯一来源：js/_manifest.json（按加载顺序）
 *
 * index.html 现在只引 js/k-loader.js 与 js/k-core.js 两个包，
 * 原来那 100 行 <script> 拆到清单里了。打包、校验、内联都读这里，
 * 免得改一处漏一处。
 */
const fs = require('fs'), path = require('path');

module.exports = function files() {
    const p = path.join(__dirname, 'js', '_manifest.json');
    return JSON.parse(fs.readFileSync(p, 'utf8')).files;
};
