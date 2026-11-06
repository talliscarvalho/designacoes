/* ================= PDF vetorial: texto e formas de verdade, nítidos em qualquer tamanho ================= */
const PV={dry:false,doc:null};
PV.hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
PV.rect=(x,y,w,h,col)=>{if(PV.dry)return;PV.doc.setFillColor(...PV.hex(col));PV.doc.rect(x,y,w,h,'F')};
PV.w=(t,style,size)=>{PV.doc.setFont('helvetica',style);PV.doc.setFontSize(size);return PV.doc.getTextWidth(String(t))};
PV.fit=(t,style,size,maxW,min)=>{t=String(t||'');min=min||6.5;let s=size;while(s>min&&PV.w(t,style,s)>maxW)s-=0.25;
  if(PV.w(t,style,s)>maxW){while(t.length>1&&PV.w(t+'…',style,s)>maxW)t=t.slice(0,-1);t=t.trimEnd()+'…'}return{t,s}};
PV.text=(t,x,y,style,size,col,o)=>{o=o||{};if(PV.dry||t===''||t==null)return;const f=o.maxW?PV.fit(t,style,size,o.maxW):{t:String(t),s:size};
  const d=PV.doc;d.setFont('helvetica',style);d.setFontSize(f.s);d.setTextColor(...PV.hex(col));
  const opt={};if(o.align)opt.align=o.align;if(o.charSpace)opt.charSpace=o.charSpace;d.text(f.t,x,y,opt)};
/* nome alinhado à direita com o papel entre parênteses em cinza: "Fulano (Presidente)" */
PV.whoR=(name,role,xr,y,o)=>{o=o||{};const size=o.size||9;let rw=0;
  if(role){const r='('+role+')';rw=PV.w(r,'italic',size-1)+3;PV.text(r,xr,y,'italic',size-1,o.roleCol||'#6E8794',{align:'right'})}
  if(!name){PV.text('a designar',xr-rw,y,'normal',size-0.5,'#B5B5B5',{align:'right'});return}
  PV.text(name,xr-rw,y,o.nameStyle||'bolditalic',size,o.nameCol||'#141414',{align:'right',maxW:o.maxW?Math.max(40,o.maxW-rw):undefined})};
PV.icon=(kind,x,y,s,bg)=>{if(PV.dry)return;const d=PV.doc,k=s/24,X=v=>x+v*k,Y=v=>y+v*k;
  d.setFillColor(255,255,255);d.setDrawColor(255,255,255);
  const poly=pts=>{const rel=[];for(let i=1;i<pts.length;i++)rel.push([(pts[i][0]-pts[i-1][0])*k,(pts[i][1]-pts[i-1][1])*k]);d.lines(rel,X(pts[0][0]),Y(pts[0][1]),[1,1],'F',true)};
  if(kind==='book'){poly([[2.5,7],[11.3,7.8],[11.3,18.8],[2.5,18.1]]);poly([[21.5,7],[12.7,7.8],[12.7,18.8],[21.5,18.1]])}
  if(kind==='wheat'){d.setLineWidth(1.1*k);d.line(X(12),Y(22.5),X(12),Y(6.5));d.ellipse(X(12),Y(4.2),1.5*k,2.6*k,'F');
    [8.6,12.4,16.2].forEach(cy=>{d.ellipse(X(10.1),Y(cy),1.35*k,2.5*k,'F');d.ellipse(X(13.9),Y(cy),1.35*k,2.5*k,'F')})}
  if(kind==='sheep'){[[10,10.5,3],[13.5,9.6,3.2],[16.8,11,2.9],[11.5,13.2,3],[15.3,13.4,3]].forEach(([cx,cy,r])=>d.circle(X(cx),Y(cy),r*k,'F'));
    d.ellipse(X(6.4),Y(11),2*k,2.6*k,'F');[[9.6,15,4.6],[11.9,15.4,4.3],[15,15.4,4.3],[17.1,14.8,4.8]].forEach(([lx,ly,h])=>d.rect(X(lx),Y(ly),1.3*k,h*k,'F'));
    d.setFillColor(...PV.hex(bg));d.circle(X(5.9),Y(10.4),0.5*k,'F')}
  if(kind==='mic'){d.roundedRect(X(9),Y(2.5),6*k,11.5*k,3*k,3*k,'F');d.setLineWidth(1.7*k);let px=null,py=null;
    for(let a=0;a<=180;a+=12){const r=a*Math.PI/180,qx=X(12+6.2*Math.cos(r)),qy=Y(11+6.2*Math.sin(r));if(px!=null)d.line(px,py,qx,qy);px=qx;py=qy}
    d.line(X(12),Y(17.2),X(12),Y(20.8));d.line(X(8.6),Y(21),X(15.4),Y(21))}
  if(kind==='chat'){d.roundedRect(X(2.5),Y(3.5),19*k,13.5*k,1.6*k,1.6*k,'F');poly([[5,16],[5,21],[10,16]]);
    d.setDrawColor(...PV.hex(bg));d.setLineWidth(1.5*k);d.line(X(7),Y(8.5),X(17),Y(8.5));d.line(X(7),Y(12),X(14),Y(12))}};
PV.congName=()=>{const c=cfg.congregacao||'';return/^congrega/i.test(c)?c:'Congregação '+c};
PV.headCores=(sub,x,W)=>{PV.text(PV.congName(),x+W/2,50,'bold',19,'#111111',{align:'center'});PV.rect(x,59,W,1.6,'#A3A3A3');
  PV.text('Reunião Vida e Ministério Cristãos  -  '+sub,x+W/2,76,'normal',11,'#111111',{align:'center'});return 92};
PV.headFds=(sub,x,W)=>{PV.text(PV.congName(),x+W/2,50,'bold',19,'#111111',{align:'center'});PV.rect(x,59,W,1.6,'#A3A3A3');
  PV.text('REUNIÃO DO FIM DE SEMANA'+(sub?'   ·   '+sub.toUpperCase():''),x+W/2,76,'normal',10,'#111111',{align:'center',charSpace:0.6});return 92};
PV.headS140=(x,W)=>{PV.text((cfg.congregacao||'').toUpperCase(),x,48,'bold',8.5,'#333333');
  PV.text('Programação da reunião do meio de semana',x+W,48,'bold',15,'#222222',{align:'right'});PV.rect(x,54,W,1.1,'#575A5D');return 70};
PV.noMeeting=(txt,x,y,W)=>{PV.rect(x,y,W,24,'#F3F3F3');PV.text(txt,x+W/2,y+15.5,'bold',9.5,'#444444',{align:'center',maxW:W-20});return 24};

/* Meio de semana — modelo colorido */
PV.meioCores=(w,x,y,W)=>{const y0=y,tp=evTipo(w.data),ev=evOf(w.data)||{},vis=tp==='visita',RH=15.5;
  PV.rect(x,y,W,21,'#2F5249');
  if(SEM_REUNIAO(tp)){PV.text('Semana de '+br(w.data),x+8,y+14.5,'bold',12,'#FFFFFF');PV.text(EVENTOS[tp].toUpperCase(),x+W-8,y+14,'bold',7.5,'#FFFFFF',{align:'right'});
    y+=21;y+=PV.noMeeting('Não haverá reunião nesta semana: '+EVENTOS[tp],x,y,W);return y-y0}
  PV.text(br(meetDate(w)),x+8,y+14.5,'bold',12.5,'#FFFFFF');
  PV.text([vis?'VISITA DO SUPERINTENDENTE DE CIRCUITO':'',(w.leituraSemanal||'').toUpperCase()].filter(Boolean).join('  ·  '),x+W-8,y+14,'bold',7.5,'#FFFFFF',{align:'right',maxW:W-120});
  y+=23;
  const U=id=>pname(id).toUpperCase();
  const row=(n,tema,who,o)=>{o=o||{};const by=y+RH-4.6;
    if(n!==''&&n!=null){PV.rect(x+12,y+2,12,RH-4,'#D2D2D2');PV.text(String(n),x+18,by-0.3,'bold',7.5,o.numCol||'#6B6B6B',{align:'center'})}
    PV.text(tema,x+30,by,'bold',9,o.cant?'#5B7A87':'#141414',{maxW:W-30-(o.mid!=null?330:185)});
    if(o.mid!=null)PV.whoR(o.mid,'Leitor',x+W-160,by,{size:8.5,maxW:150});
    if(!o.none)PV.whoR(who,o.role,x+W-6,by,{size:9,maxW:o.mid!=null?150:175});
    y+=RH};
  row('','Cântico'+(cant(w.canticoInicial)?' '+cant(w.canticoInicial):''),U(w.oracaoInicial),{cant:1,role:'Oração'});
  row(1,'Comentários Iniciais',U(w.presidente));
  const block=(bg,ic,col,title,sub,rows)=>{const yb=y,h=3+25+rows.length*RH+5;PV.rect(x,yb,W,h,bg);y+=3;
    PV.rect(x+2,y,24,24,col);PV.icon(ic,x+4,y+2,20,col);
    PV.text(title,x+32,y+(sub?12:16.5),'normal',13,col);if(sub)PV.text(sub,x+32,y+21.5,'bold',7.5,'#5B7A87');
    y+=25;rows.forEach(r=>row(...r));y=yb+h+4};
  const tn={numCol:'#6B7F88'},mn={numCol:'#D1830C'},vn={numCol:'#B0182C'};
  block('#EDEFF1','book','#4D6873','Tesouros da Palavra de Deus','',[[10,w.tesouros.tema||'Discurso',U(w.tesouros.pub),tn],[10,'Encontre Joias Espirituais',U(w.joias.pub),tn],[4,'Leitura da Bíblia',U(w.leitura.pub),tn]]);
  block('#FAF0E6','wheat','#D1830C','Faça Seu Melhor no Ministério','',w.ministerio.map(p=>{const disc=isDiscurso(p);
    const who=isPres(p)?U(w.presidente):(disc||!p.ajudante)?U(p.pub):((U(p.pub)||'—')+' / '+(U(p.ajudante)||'—'));return[p.min,temaLabel(p),who,mn]}));
  const vr=w.vida.map(p=>[p.min,p.tema,U(p.pub),vn]);
  vr.push(vis?[30,'Discurso do superintendente de circuito'+(ev.temaSC?': '+ev.temaSC:''),(ev.superintendente||'').toUpperCase(),vn]:[30,'Estudo de Congregação',U(w.estudo.dirigente),Object.assign({mid:U(w.estudo.leitor)},vn)]);
  vr.push([3,'Comentários Finais','',Object.assign({none:1},vn)]);
  vr.push(['','Cântico'+(cant(w.canticoFinal)?' '+cant(w.canticoFinal):''),U(w.oracaoFinal),{cant:1,role:'Oração'}]);
  block('#F7E4E7','sheep','#B0182C','Nossa Vida Cristã',cant(w.canticoMeio)?'Cântico '+cant(w.canticoMeio):'',vr);
  return y-y0};

/* Meio de semana — modelo S-140 */
PV.meioS140=(w,x,y,W)=>{const y0=y,tp=evTipo(w.data),ev=evOf(w.data)||{},vis=tp==='visita',RH=12.8;
  const NAMEX=x+W-132,LABX=NAMEX-6,N=id=>tc(pname(id))||'—';
  if(SEM_REUNIAO(tp)){PV.text('SEMANA DE '+br(w.data).slice(0,5),x,y+10,'bold',9.5,'#222222');y+=16;y+=PV.noMeeting('Não haverá reunião nesta semana: '+EVENTOS[tp],x,y,W);return y+16-y0}
  PV.text(br(meetDate(w)).slice(0,5)+(w.leituraSemanal?' | '+w.leituraSemanal.toUpperCase():'')+(vis?' | VISITA DO SUPERINTENDENTE':''),x,y+10,'bold',9.5,'#222222',{maxW:W-210});
  PV.text('Presidente:',LABX,y+10,'bold',7,'#575A5D',{align:'right'});PV.text(N(w.presidente),NAMEX,y+10,'normal',8.5,'#3A3C3E',{maxW:132});y+=17;
  let t=0;const T=()=>addMin(cfg.hora,t);
  const R=(tx,lab,who,bul)=>{const by=y+9;PV.text(T(),x,by,'normal',7.5,'#7A7A7A');let x0=x+30;
    if(bul){PV.text('•',x0,by,'bold',9,'#7E0024');x0+=7}
    PV.text(tx,x0,by,'normal',8.5,'#3A3C3E',{maxW:LABX-x0-(lab?78:6)});
    if(lab)PV.text(lab,LABX,by,'bold',7,'#575A5D',{align:'right'});
    if(who)PV.text(who,NAMEX,by,'normal',8.5,'#3A3C3E',{maxW:132});y+=RH};
  const bar=(txt,col)=>{y+=2;PV.rect(x,y,W*0.58,12,col);PV.text(txt.toUpperCase(),x+5,y+8.7,'bold',7.5,'#FFFFFF');y+=14};
  R('Cântico '+(cant(w.canticoInicial)||''),'Oração:',N(w.oracaoInicial),1);t+=5;
  R('Comentários iniciais (1 min)','','',1);t+=1;
  bar('Tesouros da Palavra de Deus','#575A5D');
  R('1. '+(w.tesouros.tema||'Discurso')+' (10 min)','',N(w.tesouros.pub));t+=10;
  R('2. Joias espirituais (10 min)','',N(w.joias.pub));t+=10;
  R('3. Leitura da Bíblia (4 min)','Estudante:',N(w.leitura.pub));t+=5;
  bar('Faça Seu Melhor no Ministério','#BE8900');
  let n=4;w.ministerio.forEach(p=>{const tpp=partTipo(p),lb=(n++)+'. '+temaLabel(p)+' ('+p.min+' min)';
    if(tpp==='presidente'){R(lb,'Presidente:',N(w.presidente));t+=(+p.min||0);return}
    const disc=tpp!=='demo';R(lb,tpp==='consideracao'?'':disc?'Estudante:':'Estudante/ajudante:',disc?N(p.pub):N(p.pub)+(p.ajudante?' / '+N(p.ajudante):''));t+=(+p.min||0)+1});
  bar('Nossa Vida Cristã','#7E0024');
  R('Cântico '+(cant(w.canticoMeio)||''),'','',1);t+=5;
  w.vida.forEach(p=>{R((n++)+'. '+p.tema+' ('+p.min+' min)','',N(p.pub));t+=(+p.min||0)});
  if(vis)R((n++)+'. Discurso do superintendente de circuito'+(ev.temaSC?': '+ev.temaSC:'')+' (30 min)','',ev.superintendente||'—');
  else R((n++)+'. Estudo bíblico de congregação (30 min)','Dirigente/leitor:',N(w.estudo.dirigente)+' / '+N(w.estudo.leitor));t+=30;
  R('Comentários finais (3 min)','','',1);t+=3;
  R('Cântico '+(cant(w.canticoFinal)||''),'Oração:',N(w.oracaoFinal),1);
  return y+14-y0};

/* Fim de semana */
PV.fds=(f,x,y,W)=>{const y0=y,tp=evTipo(f.data),ev=evOf(f.data)||{},vis=tp==='visita',TW=40,TX=x+TW+8;
  const dw=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][parse(f.data).getDay()];
  PV.rect(x,y,W,21,'#3E9EA0');PV.text(dw,x+TW/2,y+14,'bold',9,'#FFFFFF',{align:'center'});PV.text(br(f.data),TX,y+14.5,'bold',12.5,'#FFFFFF');
  if(tp)PV.text(EVENTOS[tp].toUpperCase(),x+W-8,y+14,'bold',7,'#FFFFFF',{align:'right'});y+=21;
  if(SEM_REUNIAO(tp)){y+=PV.noMeeting('Não haverá reunião: '+EVENTOS[tp],x,y,W);return y+16-y0}
  const T=m=>addMin(cfg.horaFds||'09:00',m);
  const wo={size:9,nameStyle:'italic',nameCol:'#222222',roleCol:'#8A8A8A',maxW:200};
  const row=(t,tbg,txt,st,col,whoFn,h)=>{h=h||18;PV.rect(x,y,TW,h,tbg);PV.text(t,x+TW/2,y+h/2+3,'bold',8,'#333333',{align:'center'});
    PV.text(txt,TX,y+h/2+3.2,st,9,col,{maxW:W-TW-8-205});if(whoFn)whoFn(y,h);y+=h};
  const who1=(name,role)=>(yy,h)=>PV.whoR(name?tc(name):'',role,x+W-6,yy+h/2+3.2,wo);
  row(T(0),'#E3EDEF','Cântico & Oração','normal','#8A8A8A',who1(pname(f.presidente),'Presidente'));
  let orN=oradorNome(f),orC=oradorCong(f);if(vis&&!orN&&ev.superintendente){orN=ev.superintendente;orC='Superintendente de circuito'}
  const blk=(bg,ic,icCol,title,sub,tbg,rows)=>{const hh=sub?30:24,h=hh+rows.reduce((a,r)=>a+(r.h||18),0);y+=2;PV.rect(x,y,W,h,bg);
    PV.rect(x,y+2,TW,hh-4,icCol);PV.icon(ic,x+TW/2-9,y+hh/2-9,18,icCol);
    PV.text(title,TX,y+(sub?13:15.5),'bold',11.5,icCol);if(sub)PV.text(sub,TX,y+24,'normal',8,'#8A8A8A');y+=hh;
    rows.forEach(r=>row(r.t,tbg,r.txt,'bold','#1B1B1B',r.who,r.h))};
  blk('#E8EBF1','mic','#2C4A7A','DISCURSO PÚBLICO','','#A9B5CB',[{t:T(5),txt:discTema(f)||'Tema a definir',who:who1(orN,orC)}]);
  const dir=pname(f.sentinela.dirigente),lei=pname(f.sentinela.leitor);
  const who2=(yy)=>{PV.whoR(dir?tc(dir):'','Dirigente',x+W-6,yy+12,wo);PV.whoR(lei?tc(lei):'','Leitor',x+W-6,yy+24,wo)};
  blk('#EDF0EB','chat','#4D6A51',vis?'RESUMO DE A SENTINELA':'ESTUDO DE A SENTINELA',cant(f.canticoSentinela)?'Cântico '+cant(f.canticoSentinela):'','#B3C0B1',
    [vis?{t:T(40),txt:f.sentinela.tema||'Artigo de estudo',who:who1(dir,'Dirigente')}:{t:T(40),txt:f.sentinela.tema||'Artigo de estudo',who:who2,h:30}]);
  if(vis)blk('#E8EBF1','mic','#2C4A7A','DISCURSO FINAL','','#A9B5CB',[{t:T(70),txt:ev.temaFinal||'Tema a definir',who:who1(ev.superintendente||'','Superintendente de circuito')}]);
  y+=2;const of=pname(f.oracaoFinal);row(T(100),'#E3EDEF','Cântico '+(cant(f.canticoFinal)||'')+' & Oração'+(of?' ('+tc(of)+')':''),'normal','#8A8A8A',null);
  return y+16-y0};

async function makePdf(){
  const btn=$('#pdfBtn');if(!window.jspdf){toast('A biblioteca de PDF não carregou. Verifique a internet e recarregue a página.');return}
  btn.disabled=true;btn.textContent='Gerando PDF…';
  try{
    const P=printState();const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'pt',format:cfg.papel==='Carta'?'letter':'a4',orientation:'portrait'});
    doc.setProperties({title:(P.C?'Saídas de campo':P.AV?'Áudio/Vídeo e Indicadores':P.L?'Designações de Limpeza':P.K?'Reunião do Fim de Semana':'Vida e Ministério Cristão')+' - '+(ui.printSub||P.autoSub),creator:PV.congName()});
    PV.doc=doc;PV.dry=false;
    const PW=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),M=32,x=M,W=PW-2*M,bottom=PH-26;
    const sub=ui.printSub||P.autoSub;const s140=!P.K&&!P.C&&cfg.modelo==='s140';
    const head=()=>P.C?PV.headCampo(x,W):P.AV?PV.headAV(x,W):P.L?PV.headLimp(x,W):P.K?PV.headFds(sub,x,W):s140?PV.headS140(x,W):PV.headCores(sub,x,W);
    const draw=(w,y)=>P.C?PV.campo(w.mon,x,y,W):P.AV?PV.av(w.ym,x,y,W):P.L?PV.limp(w.ym,x,y,W):P.K?PV.fds(w,x,y,W):s140?PV.meioS140(w,x,y,W):PV.meioCores(w,x,y,W)+14;
    let y=head(),onPage=0;
    for(const w of P.sel){PV.dry=true;const h=draw(w,y);PV.dry=false;
      if(onPage&&y+h-14>bottom){doc.addPage();y=head();onPage=0}
      y+=draw(w,y);onPage++}
    const name=(P.C?'Saidas de campo - ':P.AV?'AV e Indicadores - ':P.L?'Limpeza - ':P.K?'Fim de semana - ':'Vida e Ministerio - ')+sub.normalize('NFD').replace(/[̀-ͯ]/g,'');
    await saveFile(name+'.pdf',doc.output('blob'));
  }catch(e){toast('Erro ao gerar o PDF');console.error(e)}
  PV.dry=false;btn.disabled=false;btn.textContent='Baixar PDF para imprimir';
}

