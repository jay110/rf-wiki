/* 找出内容最薄的页面：按「同一口径（剥标签去空白后的中文字符数）」统计每个页面在各作下的字数，取平均排序。
   用途：决定下一页该拆哪个。拆页前先跑一遍，别凭印象挑。
   输出三列：平均 / 最小 / 最大，后面是实例数（x8 表示八作都有）与 key。
   用法：node _thin.js          取前 22 条
        node _thin.js 40       取前 40 条 */
const fs=require('fs'),vm=require('vm');
const files=require('./_files.js')();
const stubEl={innerHTML:'',textContent:'',value:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},appendChild(){},querySelectorAll:()=>[],scrollIntoView(){}};
const ctx={console,window:{addEventListener(){},location:{hash:''},innerWidth:1280,scrollTo(){}},document:{addEventListener(){},getElementById:()=>stubEl,querySelector:()=>stubEl,querySelectorAll:()=>[],createElement:()=>stubEl,body:stubEl}};
vm.createContext(ctx);
let src=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n;\n');
src+='\n;__o={PAGES:PAGES,GAMES:GAMES};';
ctx.__o={};
vm.runInContext(src,ctx,{filename:'bundle.js'});
const {PAGES,GAMES}=ctx.__o;
const strip=s=>String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,'');
const out=[];
for(const p of PAGES){
  if(['changelog'].includes(p.key)) continue;
  const ids = p.gms && p.gms.length ? p.gms : GAMES.map(g=>g.id);
  const ns=[];
  for(const gid of ids){
    const g=GAMES.find(x=>x.id===gid);
    if(!g) continue;
    let h; try{h=p.body(g);}catch(e){continue;}
    ns.push((strip(h).match(/[\u4e00-\u9fa5]/g)||[]).length);
  }
  if(!ns.length) continue;
  const avg=Math.round(ns.reduce((a,b)=>a+b,0)/ns.length);
  const min=Math.min(...ns), max=Math.max(...ns);
  out.push({key:p.key, title:p.title, n:ns.length, avg, min, max});
}
out.sort((a,b)=>a.avg-b.avg);
const LIM = Number(process.argv[2]) || 22;
for(const r of out.slice(0,LIM)) console.log(String(r.avg).padStart(5), String(r.min).padStart(5), String(r.max).padStart(5), 'x'+r.n, r.key, r.title);
