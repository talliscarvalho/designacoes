/* gera os ícones do aplicativo a partir de src/marca.txt */
const {chromium}=require('playwright');const fs=require('fs');const out=process.argv[2];
const M=fs.readFileSync(__dirname+'/src/marca.txt','utf8').trim();
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [n,sz,mask] of [['icon-180',180,1],['icon-192',192,0],['icon-512',512,0],['icon-maskable-512',512,1]]){
 await p.setViewportSize({width:sz,height:sz});const r=mask?0:sz*0.22,sc=mask?0.5:0.64;
 await p.setContent(`<html><body style="margin:0;background:transparent"><svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><rect width="24" height="24" rx="${r*24/sz}" fill="#2F5249"/><g transform="translate(12 12.3) scale(${sc}) translate(-12 -12.3)"><path fill="#fff" d="${M}"/></g></svg></body></html>`);
 await p.screenshot({path:`${out}/${n}.png`,omitBackground:true});}
await b.close()})();
