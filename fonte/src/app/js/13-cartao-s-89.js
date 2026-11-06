/* ================= Cartão S-89 ================= */
function studentParts(w){const r=[];if(w.leitura.pub)r.push({n:3,tema:'Leitura da Bíblia',pub:w.leitura.pub,ajudante:''});
  w.ministerio.forEach((p,i)=>{const t=partTipo(p);if(t==='presidente'||t==='consideracao')return;if(p.pub||p.ajudante)r.push({n:4+i,tema:temaLabel(p),pub:p.pub,ajudante:isDiscurso(p)?'':p.ajudante})});return r}
const SF=(wt,sz,it)=>`${it?'italic ':''}${wt} ${sz}px "Noto Sans","Segoe UI",Arial,sans-serif`;
async function drawS89(w,sp){
  try{await Promise.all([SF(700,40),SF(400,38),SF(600,38),SF(400,31,1),SF(700,31)].map(f=>document.fonts.load(f)))}catch(e){}
  const W=900,H=1197,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#111';
  const L=45,Rr=W-45;
  const t1='DESIGNAÇÃO PARA A REUNIÃO',t2='NOSSA VIDA E MINISTÉRIO CRISTÃO';let fs=48;x.font=SF(700,fs);while(x.measureText(t2).width>W-90&&fs>20){fs--;x.font=SF(700,fs)}
  x.textAlign='center';x.fillText(t1,W/2,64);x.fillText(t2,W/2,64+fs*1.18);x.textAlign='left';
  const field=(label,val,y)=>{x.font=SF(700,40);x.fillStyle='#111';x.fillText(label,L,y);const st=L+x.measureText(label).width+14;
    x.fillStyle='#8A8A8A';for(let d=st;d<Rr;d+=7)x.fillRect(d,y+3,3,2.4);
    if(val){let f=38;x.font=SF(600,f);while(x.measureText(val).width>Rr-st-8&&f>18){f--;x.font=SF(600,f)}x.fillStyle='#1E3A8A';x.fillText(val,st+6,y-6)}};
  field('Nome:',tc(pname(sp.pub)),205);
  field('Ajudante:',sp.ajudante?tc(pname(sp.ajudante)):'',293);
  field('Data:',br(meetDate(w))+' ('+DIAS[parse(meetDate(w)).getDay()]+')',381);
  field('Número da parte:',sp.n+' – '+sp.tema,469);
  x.fillStyle='#111';x.font=SF(700,40);x.fillText('Local:',L,598);
  ['Salão principal','Sala B','Sala C'].forEach((t,i)=>{const y=658+i*52;x.strokeStyle='#111';x.lineWidth=2.4;x.strokeRect(98,y-28,30,30);x.font=SF(400,38);x.fillStyle='#111';x.fillText(t,158,y);
    if(i===0){x.strokeStyle='#1E3A8A';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(102,y-14);x.lineTo(111,y-4);x.lineTo(130,y-34);x.stroke()}});
  const runs=[['Observação para o estudante:',700,0],['A lição e a fonte de matéria para a sua designação estão na',400,0],['Apostila da Reunião Vida e Ministério.',400,1],['Veja as instruções para a parte que estão nas',400,0],['Instruções para a Reunião Nossa Vida e Ministério Cristão',400,1],['(S-38).',400,0]];
  const words=[];runs.forEach(([t,wt,it])=>t.split(' ').forEach(s=>words.push({s,wt,it})));
  const sz=31,lh=42,maxW=Rr-L;let y=885,line=[],lw=0;x.font=SF(400,sz);const sp0=x.measureText(' ').width;
  const out=last=>{const tot=line.reduce((a,o)=>a+o.w,0);const gap=last||line.length<2?sp0:(maxW-tot)/(line.length-1);let xx=L;
    line.forEach(o=>{x.font=SF(o.wt,sz,o.it);x.fillStyle='#111';x.fillText(o.s,xx,y);xx+=o.w+gap});y+=lh;line=[];lw=0};
  words.forEach(o=>{x.font=SF(o.wt,sz,o.it);o.w=x.measureText(o.s).width;if(line.length&&lw+sp0+o.w>maxW)out(false);lw+=(line.length?sp0:0)+o.w;line.push(o)});out(true);
  return c}
async function s89Pdf(){
  const w=weeks[ui.waWeek];const parts=w?studentParts(w):[];if(!parts.length){toast('Nenhuma parte de estudante nesta semana');return}
  if(!window.jspdf){toast('A biblioteca de PDF não carregou. Recarregue a página.');return}
  const btn=$('#s89pdfBtn');btn.disabled=true;
  try{const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'pt',format:'a4'});const cw=240.9,ch=320.3,PW=595.28,PH=841.89;
    const gx=(PW-2*cw)/3,gy=(PH-2*ch)/3;
    for(let i=0;i<parts.length;i++){if(i&&i%4===0)pdf.addPage();const k=i%4,cx=gx+(k%2)*(cw+gx),cy=gy+Math.floor(k/2)*(ch+gy);
      const c=await drawS89(w,parts[i]);pdf.addImage(c.toDataURL('image/jpeg',0.93),'JPEG',cx,cy,cw,ch);pdf.setDrawColor(190);pdf.setLineDashPattern([3,3],0);pdf.rect(cx-6,cy-6,cw+12,ch+12)}
    await saveFile('Cartoes S-89 '+br(w.data).replace(/\//g,'-')+'.pdf',pdf.output('blob'))}catch(e){toast('Erro ao gerar os cartões');console.error(e)}
  btn.disabled=false}

