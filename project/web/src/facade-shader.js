/** Shared approximate context facade families, filtered by screen-space derivatives. */
export const CONTEXT_FACADE_GLSL=`
vec3 beijingContextFacade(vec3 baseColor,vec2 coord,float oldStyle,float buildingHeight,float style){
 float glass=1.0-step(.5,style),stone=step(.5,style)*(1.0-step(1.5,style));
 float residential=step(1.5,style)*(1.0-step(2.5,style)),podium=step(2.5,style);
 vec2 cellSize=vec2(mix(mix(1.9,3.7,stone),2.9,residential),3.35);
 cellSize=mix(cellSize,vec2(4.8,4.4),podium);cellSize=mix(cellSize,vec2(2.4,3.35),oldStyle);
 vec2 grid=coord/cellSize,cell=fract(grid),aa=fwidth(grid);
 float visible=1.0-smoothstep(.16,.55,max(aa.x,aa.y));
 float side=mix(.07,.23,stone+residential);side=mix(side,.15,oldStyle);
 float wx=smoothstep(side-aa.x,side+aa.x,cell.x)*(1.0-smoothstep(1.0-side-aa.x,1.0-side+aa.x,cell.x));
 float wy=smoothstep(.27-aa.y,.27+aa.y,cell.y)*(1.0-smoothstep(.82-aa.y,.82+aa.y,cell.y));
 float paneSeed=fract(sin(dot(floor(grid),vec2(127.1,311.7)))*43758.5453);
 vec3 pane=mix(vec3(.075,.12,.135),vec3(.15,.21,.225),paneSeed);
 vec2 broadGrid=coord/vec2(8.5,10.05),broadCell=fract(broadGrid),broadAA=fwidth(broadGrid);
 float broadVisible=1.0-smoothstep(.24,.72,max(broadAA.x,broadAA.y));
 float vertical=smoothstep(.12-broadAA.x,.12+broadAA.x,broadCell.x)*(1.0-smoothstep(.88-broadAA.x,.88+broadAA.x,broadCell.x));
 float groupedWindow=vertical*smoothstep(.28-broadAA.y,.28+broadAA.y,broadCell.y)*(1.0-smoothstep(.80-broadAA.y,.80+broadAA.y,broadCell.y));
 float horizontal=1.0-smoothstep(.20-broadAA.y,.20+broadAA.y,broadCell.y);
 vec3 broadGlass=mix(baseColor,baseColor*vec3(.30,.48,.60),vertical*.68);
 vec3 broadStone=mix(baseColor,baseColor*vec3(.57,.60,.59),groupedWindow*.36);
 vec3 broadResidential=baseColor*(1.0-horizontal*.20);
 vec3 broadPodium=baseColor*(1.0-horizontal*.10);
 vec3 broad=glass*broadGlass+stone*broadStone+residential*broadResidential+podium*broadPodium;
 vec3 painted=mix(baseColor,broad,(1.0-visible)*broadVisible*(1.0-oldStyle));
 float paneWeight=mix(.51,.38,podium);painted=mix(painted,pane,wx*wy*visible*paneWeight);
 float floorBand=(1.0-smoothstep(.025,.085,cell.y))*visible;
 float cornice=(1.0-smoothstep(.08,.65,abs(buildingHeight-coord.y-.75)))*visible;
 float foundation=(1.0-smoothstep(.0,5.0,coord.y))*.14;
 return painted*(1.0-foundation-cornice*.10-floorBand*mix(.07,.14,residential));
}
`;
