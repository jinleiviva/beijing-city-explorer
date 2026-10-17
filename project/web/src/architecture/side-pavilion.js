/** Jingshan side pavilions: researched two-tier round blue / octagonal green roofs. */
import{Recipe,loftGeometry,latheGeometry,beam}from'./geometry.js';
function roofProfile(n,round,h){
 const rings=[[1,0],[.98,.08],[.81,.23],[.59,.48],[.35,.77],[.09,1]].map(([r,y])=>({y:y*h,points:Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return[Math.cos(a)*r,Math.sin(a)*r];})}));
 const g=loftGeometry(rings);if(!round){for(let j=0;j<rings.length;j++)for(let i=0;i<n;i++){const at=(j*n+i)*3;const midpoint=i%2===1; if(midpoint){g.vertices[at]*=Math.cos(Math.PI/8);g.vertices[at+2]*=Math.cos(Math.PI/8);}g.vertices[at+1]+=midpoint?0:.11*h*(1-j/(rings.length-1));}g.flatShading=true;}return g;
}
export function sidePavilion(o={}){
 const round=o.pavilionType==='round'||o.variant===1||['zhoushang','fulan'].includes(o.pavilionId),detail=o.lod==='silhouette'||o.detail===-1?0:o.detail??1;
 const w=Math.max(4,o.width??(round?9.3:11.5)),d=Math.max(4,o.depth??w),h=Math.max(7,o.height??(round?11.6:12.1)),segments=round?(detail?24:16):16,cols=round?6:8;
 const r=new Recipe(round?'Jingshan round peacock-blue side pavilion':'Jingshan octagonal green side pavilion',{family:'side_pavilion',pavilionType:round?'round':'octagonal',width:w,depth:d,height:h,approx:true,heightAccuracy:'Modelling approximation; published tourism heights conflict, no survey claim',roofEvidence:'Palace Museum study T00038_00.pdf; viewed VisitBeijing Zhoushang/Guanmiao photographs',roofSource:'https://www.dpm.org.cn/Uploads/pdf/1578/T00038_00.pdf',inference:'Main roof form and colours evidenced; fine brackets, exact column radii and steps approximate'});
 const roof=round?'roofPeacock':'roofGreen',trim=round?'roofPurple':'roofGold',base=.065*h,columnsH=.43*h,lower=base+columnsH,upper=.74*h;
 r.add({type:'cylinder',segments:round?24:8,topRadius:1},'stoneDark',[0,base/2,0],[w*.47,base,d*.47],[0,round?0:Math.PI/8,0],'stone pavilion platform');
 // A smaller closed shrine, surrounded by an open columned ambulatory.
 r.add({type:'cylinder',segments:cols,topRadius:1},'vermilionDark',[0,base+columnsH*.44,0],[w*.24,columnsH*.88,d*.24],[0,Math.PI/cols,0],'recessed red wooden central shrine');
 for(let i=0;i<cols;i++){const a=i/cols*Math.PI*2+Math.PI/cols,x=Math.cos(a)*w*.35,z=Math.sin(a)*d*.35;
  r.cylinder('vermilion',x,base+columnsH*.47,z,Math.min(w,d)*.021,columnsH*.94,'open red outer pavilion column',detail?8:6);
  if(detail){r.box('greenBeam',x,lower-.16*h,z,.65,.065*h,.65,'painted bracket capital');r.cylinder('stoneLight',x,base+.1,z,.26,.20,'column stone plinth',8);}
  const b=(i+1)/cols*Math.PI*2+Math.PI/cols;beam(r,'greenBeam',[x,lower-.06*h,z],[Math.cos(b)*w*.35,lower-.06*h,Math.sin(b)*d*.35],.12,'painted perimeter entablature');
 }
 for(const[y,radius,rise]of[[lower,.5,.20*h],[upper,.36,.20*h]]){
  r.add(roofProfile(segments,round,rise),trim,[0,y-.08,0],[w*radius,1,d*radius],[0,0,0],'contrasting glazed eave border');
  r.add(roofProfile(segments,round,rise*.97),roof,[0,y+.055,0],[w*radius*.975,1,d*radius*.975],[0,0,0],'curved two-tier glazed pavilion roof');
 }
 r.add({type:'cylinder',segments:cols,topRadius:1},'greenBeam',[0,.705*h,0],[w*.22,.14*h,d*.22],[0,Math.PI/cols,0],'upper painted octagonal roof drum');
 r.cylinder(trim,0,.955*h,0,.17,.055*h,'glazed roof finial',8,.45);
 r.cylinder(trim,0,.988*h,0,.09,.024*h,'glazed roof finial tip',8,.08);
 if(detail){for(const s of[-1,1])r.box('roofGold',s*w*.15,base+columnsH*.43,d*.245,.035,columnsH*.65,.05,'fine antique wooden window lattice');
  for(let i=0;i<3;i++)r.box('stoneLight',0,base*(i+1)/6,d*.47+(3-i)*.26,w*.28,base*(i+1)/3,.28,'south stone access step');
  r.box('roofBlue',0,lower-.05*h,d*.36+.05,.65,.105*h,.09,'blank vertical blue pavilion plaque');
 }
 return r;
}
