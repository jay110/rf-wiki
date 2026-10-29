/* 构建 FISH_RF1（符文工房1 钓鱼：钓点 × 鱼 × 出现率 × 卖价）
   源：
     - Fishing (RF)  https://therunefactory.fandom.com/wiki/Fishing_(RF)  （各钓点 Catch Rate）
     - Fish (RF)     https://therunefactory.fandom.com/wiki/Fish_(RF)      （各鱼 Selling Price）
   中文名来源：汉化版《RF1文本翻译对照表（校对7）》的日文→中文映射
     （非 SE 官方，汉化组译法，不同汉化组可能有出入）。该表已覆盖大部分鱼与全部
     主要洞窟/遗迹地点名；少数原创虚构鱼（Gibelio/Jamasquid/Lover Snapper 等）
     及个别通译仍标"待核实"。
   说明：RF1 无官方中文版，此汉化表是目前可核实、最贴近玩家实际用语的中文来源。
*/
const fs = require('fs');
const path = require('path');

// 各钓点 → [[英文名, 出现率%], ...]  （顺序按源表）
const RAW_SPOTS = {
  Ocean: [["Sardine","40%"],["Squid","10%"],["Salmon","10%"],["Mackerel","10%"],["Snapper","25%"],["Lamp Squid","5%"]],
  "Farm & Rivers": [["Cherry Salmon","40%"],["Chub","30%"],["Rainbow Trout","20%"],["Can","10%"]],
  "Outside Kasimir Ruins": [["Cherry Salmon","45%"],["Rainbow Trout","20%"],["Flounder","10%"],["Turbot","5%"],["Gibelio","5%"],["Fall Flounder","1%"],["Shrimp","1%"],["Boot","13%"]],
  "Outside Misty Bloom Cave": [["Cherry Salmon","75%"],["Chub","10%"],["Boot","10%"],["Masu Trout","5%"]],
  "Carmite Cave": [["Cherry Salmon","60%"],["Needlefish","10%"],["Rainbow Trout","20%"],["Squid","10%"],["Salmon","5%"],["Lamp Squid","5%"]],
  "Toros Cave": [["Pond Smelt","75%"],["Char","10%"],["Girella","10%"],["Salmon","5%"]],
  "Clemens Cave": [["Needlefish","85%"],["Pike","5%"],["Lobster","5%"],["Jamasquid","5%"]],
  "Mt. Gigant": [["Cherry Salmon","25%"],["Crucian Carp","25%"],["Gibelio","10%"],["Rainbow Trout","25%"],["Fall Flounder","5%"],["Can","10%"]],
  "Misty Bloom Cave": [["Sardine","10%"],["Mackerel","10%"],["Snapper","10%"],["Lover Snapper","5%"],["Glitter Snapper","5%"],["Blowfish","5%"],["Flounder","10%"],["Shrimp","10%"],["Lobster","10%"],["Tuna","5%"],["Skipjack","10%"],["Yellowtail","5%"],["Lamp Squid","5%"],["Fall Flounder","5%"]],
  "Kasimir Ruins": [["Cherry Salmon","50%"],["Gibelio","30%"],["Glitter Snapper","10%"],["Can","10%"]],
  "Danaan Cave": [["Pond Smelt","65%"],["Chub","25%"],["Girella","10%"]],
  "Greed Cave": [["Masu Trout","50%"],["Taimen","10%"],["Pond Smelt","10%"],["Needlefish","10%"],["Rainbow Trout","10%"],["Crucian Carp","5%"],["Gibelio","5%"]],
};

// 各鱼卖价（Fish RF，单位 G；Taimen 即 Sea-Run Taimen）
const PRICE = {
  Sardine:"20", Squid:"50", Salmon:"70", Mackerel:"30", Snapper:"180", "Lamp Squid":"250",
  "Cherry Salmon":"10", Chub:"30", "Rainbow Trout":"40", Can:"1", Boot:"1",
  Flounder:"270", Turbot:"90", Gibelio:"200", "Fall Flounder":"320", Shrimp:"120",
  Needlefish:"45", Char:"50", Girella:"60",
  Pike:"50", Lobster:"140", Jamasquid:"240",
  "Crucian Carp":"80",
  "Masu Trout":"30", Taimen:"140",
  "Blowfish":"300", "Lover Snapper":"280", "Glitter Snapper":"500",
  Tuna:"200", Skipjack:"110", Yellowtail:"150",
};

/* 英文名 → 中文名。
   ★ 已与汉化版《RF1文本翻译对照表（校对7）》对应（日文→中文，非官方）：
     Sardine沙丁鱼 Squid乌贼 Salmon鲑鱼 Mackerel鲭鱼 Snapper鲷鱼 LampSquid灯乌贼
     RainbowTrout虹鳟 Flounder比目鱼 Turbot鲽鱼 Shrimp虾 Needlefish针鱼 Char红点鲑
     CrucianCarp银鲫鱼 Blowfish河豚 GlitterSnapper闪光鲷鱼 Tuna金枪鱼 Skipjack鲣鱼 Yellowtail鰤鱼
     + CherrySalmon→鳟鱼(アマゴ，间接对应，樱鳟/鳟鱼待核实)
   ★ 以下 11 种：汉化表能直接对应的已采用其汉化名；未能直接对应的标"待核实"
     Chub→珠星鱼(ウグイ)  Girella→黑毛鱼(メジナ)  PondSmelt→西太公鱼(ワカサギ)
     Lobster→螯龙虾(ロブスター)  Jamasquid→斑乌贼(ジャマイカ,原创)  Taimen→伊富鱼(イトウ)
     LoverSnapper→心动鲷鱼(トキメキタイ,原创)
     Gibelio→基贝里奥(原创,汉化表无,音译)  FallFlounder→秋比目鱼(汉化表无,通译)
     Pike→狗鱼(汉化表无,通译)  MasuTrout→真鳟(汉化表无マス单独对应,通译) */
const FISH_ZH = {
  Sardine:"沙丁鱼", Squid:"乌贼", Salmon:"鲑鱼", Mackerel:"鲭鱼", Snapper:"鲷鱼", "Lamp Squid":"灯乌贼",
  "Cherry Salmon":"鳟鱼", "Rainbow Trout":"虹鳟", Can:"空罐", Boot:"高筒靴",
  Flounder:"比目鱼", Turbot:"鲽鱼", Shrimp:"虾",
  Needlefish:"针鱼", Char:"红点鲑",
  "Crucian Carp":"银鲫鱼", "Blowfish":"河豚", "Glitter Snapper":"闪光鲷鱼",
  Tuna:"金枪鱼", Skipjack:"鲣鱼", Yellowtail:"鰤鱼",
  Chub:"珠星鱼", Girella:"黑毛鱼", "Pond Smelt":"西太公鱼",
  Lobster:"螯龙虾", Jamasquid:"斑乌贼", Taimen:"伊富鱼", "Lover Snapper":"心动鲷鱼",
  Gibelio:"基贝里奥", "Fall Flounder":"秋比目鱼", Pike:"狗鱼", "Masu Trout":"真鳟",
};

// 英文名 → 中文钓点（多数与汉化版对照表地点名一致；海边/农场与河流/迷雾花洞窟 该表无存盘点记录，为通译）
const SPOT_ZH = {
  Ocean:"海边", "Farm & Rivers":"农场与河流", "Outside Kasimir Ruins":"卡西米尔遗迹外",
  "Outside Misty Bloom Cave":"密丝特布鲁姆洞窟外", "Carmite Cave":"卡麦特洞窟", "Toros Cave":"特罗斯洞窟",
  "Clemens Cave":"克莱门斯洞窟", "Mt. Gigant":"癸干忒山", "Misty Bloom Cave":"密丝特布鲁姆洞窟",
  "Kasimir Ruins":"卡西米尔遗迹", "Danaan Cave":"达努洞窟", "Greed Cave":"格力德洞窟",
};

const SPOT_NOTE = {
  Ocean:"鲷鱼需柳条竿（Willow Rod）以上方可钓获",
};

// 生成 FISH_RF1
const FISH_RF1 = [];
let fishCount = 0;
for (const enSpot of Object.keys(RAW_SPOTS)) {
  const zhSpot = SPOT_ZH[enSpot] || enSpot;
  const note = SPOT_NOTE[enSpot] || "";
  const rows = [];
  for (const [en, rate] of RAW_SPOTS[enSpot]) {
    const zh = FISH_ZH[en];
    if (!zh) { console.error("缺中文名:", en); continue; }
    const price = PRICE[en] || "—";
    rows.push([zh, rate, price]);
    fishCount++;
  }
  FISH_RF1.push([zhSpot, note, rows]);
}

// 反向表：鱼 → 各钓点出现率
const fishToSpots = {};
for (const [zhSpot, , rows] of FISH_RF1) {
  for (const [zh, rate] of rows) {
    (fishToSpots[zh] = fishToSpots[zh] || []).push([zhSpot, rate]);
  }
}

// 组装源码
let out = "/* ============================================================\n";
out += "   符文工房 1 —— 钓鱼数值表（源：fandom wiki Fishing_(RF) + Fish_(RF)）\n";
out += "   出现率(Catch Rate) 来自 Fishing_(RF)；卖价(Selling Price) 来自 Fish_(RF)。\n";
out += "   中文名取自汉化版《RF1文本翻译对照表（校对7）》（日文→中文，非 SE 官方，汉化组译法）：\n";
out += "     多数鱼已与该表对应；以下仍标\"待核实\"（汉化表未直接覆盖，为原创虚构鱼或通译）：\n";
out += "     基贝里奥(Gibelio,原创) 秋比目鱼(Fall Flounder) 狗鱼(Pike) 真鳟(Masu Trout)\n";
out += "   钓点名多数采用该对照表地点名（卡麦特/特罗斯/卡西米尔/癸干忒/达努/格力德洞窟等）；\n";
out += "     海边 / 农场与河流 / 迷雾花洞窟 为该表无存盘点记录者，仍用通译。RF1 无季节/时段机制，只按钓点列。\n";
out += "   FISH_RF1 : [钓点中文名, 钓点备注, [[鱼中文名, 出现率, 卖价], ...]]\n";
out += "   ============================================================ */\n\n";
out += "const FISH_RF1 = " + JSON.stringify(FISH_RF1, null, 4) + ";\n";

// 写回 fish_old.js（幂等：替换已有 FISH_RF1 块，否则在末尾追加）
const target = path.join(__dirname, '..', 'js', 'fish_old.js');
let src = fs.readFileSync(target, "utf8");
const re = /\/\* ={10,}\s*符文工房 1[\s\S]*?const FISH_RF1 = [\s\S]*?\]\;\n/;
if (re.test(src)) {
  src = src.replace(re, out);
} else {
  src = src.replace(/\s*$/, "\n\n" + out);
}
fs.writeFileSync(target, src, "utf8");

console.log("FISH_RF1 钓点数:", FISH_RF1.length, " 鱼-钓点记录数:", fishCount);
console.log("涉及鱼种数:", Object.keys(fishToSpots).length);
console.log("已写回", target);
