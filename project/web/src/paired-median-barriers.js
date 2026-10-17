import {SpatialGrid} from './spatial.js';
/** Thin centre barriers only where a viewed photo identifies one and two actual
 * opposite mapped main carriageways establish a median. No guessed barriers
 * between a main road and its service road, on unmatched one-way roads or across junctions. */
export function planPairedMedianBarriers(roads,styles,{spacing=3,maximumSegments=12000}={}){
 const grid=new SpatialGrid(100),segments=[],eligible=['trunk','primary','secondary','tertiary'];
 for(const road of roads){const p=road.properties||{},style=styles[p.streetId];if(!style||style.centerTreatment!=='low-metal-fence'||road.oneway!=='yes'||road.y>3||!eligible.includes(road.class)||road.width<7)continue;
  for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<20)continue;const segment={road,a,b,l,ux:(b[0]-a[0])/l,uz:(b[1]-a[1])/l,index:i};segments.push(segment);grid.insert(segment,[Math.min(a[0],b[0])-45,Math.min(a[1],b[1])-45,Math.max(a[0],b[0])+45,Math.max(a[1],b[1])+45]);}
 }
 const crossingGrid=new SpatialGrid(100);for(const road of roads){if(road.y>3)continue;for(let j=1;j<road.points.length;j++){const a=road.points[j-1],b=road.points[j],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<.5)continue;const r=road.width*.5+2;crossingGrid.insert({road,a,b,l,ux:(b[0]-a[0])/l,uz:(b[1]-a[1])/l},[Math.min(a[0],b[0])-r,Math.min(a[1],b[1])-r,Math.max(a[0],b[0])+r,Math.max(a[1],b[1])+r]);}}
 const pieces=[],dedupe=new Set();
 for(const s of segments){for(let d=10;d<s.l-10;d+=spacing){const x=s.a[0]+s.ux*d,z=s.a[1]+s.uz*d;let best=null;
  for(const q of grid.at(x,z)){if(q.road.id===s.road.id||q.road.properties.streetId!==s.road.properties.streetId||q.road.class!==s.road.class||Math.abs(q.road.y-s.road.y)>.35||Number(q.road.properties.layer||0)!==Number(s.road.properties.layer||0)||q.road.properties.bridge!==s.road.properties.bridge||s.ux*q.ux+s.uz*q.uz>-.94)continue;
   const along=(x-q.a[0])*q.ux+(z-q.a[1])*q.uz;if(along<10||along>q.l-10)continue;const bx=q.a[0]+q.ux*along,bz=q.a[1]+q.uz*along,dist=Math.hypot(bx-x,bz-z);if(dist<5||dist>(s.road.width+q.road.width)*.5+9)continue;if(!best||dist<best.dist)best={q,bx,bz,dist};
  }
  if(!best||s.road.id>best.q.road.id)continue;const mx=(x+best.bx)*.5,mz=(z+best.bz)*.5,key=s.road.properties.streetId+':'+Math.round(mx/2)+','+Math.round(mz/2);if(dedupe.has(key))continue;let atCrossing=false;for(const q of crossingGrid.at(mx,mz)){if(q.road.id===s.road.id||q.road.id===best.q.road.id||Math.abs(q.road.y-s.road.y)>.35||Math.abs(q.ux*s.ux+q.uz*s.uz)>.65)continue;const t=Math.max(0,Math.min(q.l,(mx-q.a[0])*q.ux+(mz-q.a[1])*q.uz)),dist=Math.hypot(mx-q.a[0]-q.ux*t,mz-q.a[1]-q.uz*t);if(dist<q.road.width*.5+3){atCrossing=true;break;}}if(atCrossing)continue;dedupe.add(key);
  pieces.push({streetId:s.road.properties.streetId,x:mx,z:mz,y:s.road.y,dx:s.ux,dz:s.uz,length:spacing,sourceRoadIds:[s.road.id,best.q.road.id],evidence:'Viewed photo centreTreatment=low-metal-fence; position inferred between opposite mapped same-class, same-layer carriageways'});if(pieces.length>=maximumSegments)return{pieces,truncated:true};
 }}return{pieces,truncated:false};
}
