global.window={};
const fs=require('fs'),vm=require('vm');
const files=require('./_files.js')();
const ctx={console,window:{},document:{addEventListener(){}},setTimeout,Math,Date,JSON};
ctx.global=ctx; vm.createContext(ctx);
for(const f of files){ try{ vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f}); }catch(e){} }
vm.runInContext(fs.readFileSync(process.argv[2],'utf8'),ctx,{filename:'probe'});
