import {STREET_GLYPHS} from './glyph-data.js';
export function streetWord(word,depth=.08){
 const vertices=[],indices=[];let cursor=0;
 for(const ch of word){if(ch===' '){cursor+=.35;continue;}const g=STREET_GLYPHS[ch];if(!g)throw Error('Missing street wayfinding glyph '+ch);const n=g.vertices.length/3,b=vertices.length/3;
  for(const z of[depth/2,-depth/2])for(let i=0;i<n;i++)vertices.push(cursor+g.vertices[i*3],g.vertices[i*3+1],z);
  const edges=new Map();for(let i=0;i<g.indices.length;i+=3){const[a,c,d]=g.indices.slice(i,i+3);indices.push(b+a,b+c,b+d,b+n+d,b+n+c,b+n+a);for(const[x,y]of[[a,c],[c,d],[d,a]]){const key=x<y?x+','+y:y+','+x,old=edges.get(key);if(old)old.count++;else edges.set(key,{x,y,count:1});}}
  for(const{x,y,count}of edges.values())if(count===1)indices.push(b+x,b+n+x,b+n+y,b+x,b+n+y,b+y);cursor+=g.advance+.065;
 }
 const xs=vertices.filter((_,i)=>i%3===0),ys=vertices.filter((_,i)=>i%3===1),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 for(let i=0;i<vertices.length;i+=3){vertices[i]-=cx;vertices[i+1]-=cy;}
 return{geometry:{type:'mesh',vertices,indices,flatShading:true},width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
