/* ===== 3D CONSTRUCTION SCROLL (needs three.js loaded before this file) ===== */
/* DEZIGNIST 3D scroll - needs three.js r128 loaded first */
(function(){
if(!window.THREE)return;
const STAGES=[
 [0,.07,'Welcome to the DEZIGNIST Architectural World','Scroll to begin'],
 [.07,.28,'Site excavation','Every structure starts by moving earth'],
 [.28,.40,'Basement & foundation','Retaining walls and base slab'],
 [.40,.56,'Foundation pillars','Columns rise from the footings'],
 [.56,.78,'Structural skeleton','Floor by floor, frame and slab'],
 [.78,.92,'Facade & glazing','Walls and glass close the envelope'],
 [.92,1.01,'Design Better. Deliver Faster. Spend Smarter.','DEZIGNIST']
];
/* camera keyframes: [progress, position, look-at]  (one angle per stage) */
const KF=[
 [0,[60,38,62],[0,2,0]],[.07,[48,30,52],[-4,0,0]],[.18,[6,24,44],[-10,-2,0]],[.28,[-6,11,24],[-8,-3,0]],
 [.34,[26,4,15],[0,-3,0]],[.46,[15,3.5,14],[0,1,0]],[.56,[38,10,17],[0,7,0]],[.67,[2,15,44],[0,10,0]],
 [.78,[-38,18,20],[0,11,0]],[.86,[-30,9,34],[0,10,0]],[.93,[22,6,72],[0,20,-6]],[1,[30,16,98],[2,27,-14]]
];
const cv=document.getElementById('bc'),track=document.getElementById('build-track'),cap=document.getElementById('build-cap'),
 bar=document.querySelector('#build-bar i'),hint=document.getElementById('build-hint'),shadeEl=document.getElementById('build-shade');
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),seg=(v,a,b)=>cl((v-a)/(b-a)),ease=t=>t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
let W,H,target=0,p=0,curStage=-1;

const ren=new THREE.WebGLRenderer({canvas:cv,antialias:true});
ren.setPixelRatio(Math.min(devicePixelRatio||1,2));
ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;
ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.05;ren.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(42,1,.5,700);
scene.background=new THREE.Color(0x9cc4e4);scene.fog=new THREE.Fog(0x9cc4e4,90,340);

/* ---- materials & helpers ---- */
function noiseTex(c,v,rep){
 const k=document.createElement('canvas');k.width=k.height=256;const g=k.getContext('2d');
 g.fillStyle=c;g.fillRect(0,0,256,256);
 for(let i=0;i<7000;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,255,255')+','+Math.random()*v+')';
  g.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*3)}
 const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;
}
const M=(c,r=.85,m=0,map)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,map});
const grass=M(0xffffff,1,0,noiseTex('#55703a',.35,.09)),dirt=M(0xffffff,1,0,noiseTex('#7a5c40',.4,.12)),
 soil=M(0xffffff,1,0,noiseTex('#6a4d35',.45,3)),conc=M(0xffffff,.95,0,noiseTex('#a9a69e',.22,1)),
 stone=M(0xe6e0d2,.9),glassFix=M(0x5b8299,.15,.3);
soil.side=THREE.DoubleSide;
function bx(w,h,d,mat,x,y,z,par,base){
 const g=new THREE.BoxGeometry(w,h,d);if(base)g.translate(0,h/2,0);
 const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;(par||scene).add(m);return m;
}
function holeShape(hw,hd){
 const s=new THREE.Shape();s.moveTo(-hw,-hd);s.lineTo(hw,-hd);s.lineTo(hw,hd);s.lineTo(-hw,hd);s.lineTo(-hw,-hd);
 const h=new THREE.Path();h.moveTo(-12,-9);h.lineTo(-12,9);h.lineTo(12,9);h.lineTo(12,-9);h.lineTo(-12,-9);s.holes.push(h);return s;
}

/* ---- lights ---- */
const sun=new THREE.DirectionalLight(0xfff2dd,2),hemi=new THREE.HemisphereLight(0xbfd9f2,0x5b4a38,.75);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;
Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:240});
scene.add(sun,sun.target,hemi);

/* ---- site ---- */
const g1=new THREE.Mesh(new THREE.ShapeGeometry(holeShape(220,220)),grass);g1.rotation.x=-Math.PI/2;g1.receiveShadow=true;scene.add(g1);
const g2=new THREE.Mesh(new THREE.ShapeGeometry(holeShape(38,26)),dirt);g2.rotation.x=-Math.PI/2;g2.position.y=.03;g2.receiveShadow=true;scene.add(g2);
const road=new THREE.Mesh(new THREE.PlaneGeometry(440,12),M(0x3a3c3f,.95));road.rotation.x=-Math.PI/2;road.position.set(0,.05,36);road.receiveShadow=true;scene.add(road);
const walk=new THREE.Mesh(new THREE.PlaneGeometry(440,3),M(0x9a9891,.95));walk.rotation.x=-Math.PI/2;walk.position.set(0,.06,28.5);walk.receiveShadow=true;scene.add(walk);
for(let i=0;i<40;i++){const h=20+Math.random()*55,a=i/40*6.283,r=140+Math.random()*50;
 bx(10+Math.random()*10,h,10+Math.random()*10,M(0x8d9aa8,.9),Math.cos(a)*r,h/2,Math.sin(a)*r-10)}

/* pit: walls + sinking soil fill */
[[0,-9,0,24],[0,9,0,24],[-12,0,Math.PI/2,18],[12,0,Math.PI/2,18]].forEach(o=>{
 const m=new THREE.Mesh(new THREE.PlaneGeometry(o[3],6),soil);
 if(o[2]){m.position.set(o[0],-3,o[1])}else{m.position.set(o[0],-3,o[1])}m.rotation.y=o[2];scene.add(m)});
const fg=new THREE.BoxGeometry(23.9,6,17.9);fg.translate(0,-3,0);
const fill=new THREE.Mesh(fg,soil);fill.position.y=-.05;fill.receiveShadow=true;scene.add(fill);

/* excavator */
function makeExc(){
 const g=new THREE.Group(),Y=M(0xf2b705,.45,.1),Dk=M(0x1e1e1e,.9),Gr=M(0x333333,.8);
 [-1.3,1.3].forEach(z=>bx(5.4,1.1,1,Dk,0,0,z,g,true));
 const up=new THREE.Group();up.position.y=1.1;g.add(up);
 bx(3.8,1.3,3,Y,-.3,0,0,up,true);bx(1.2,1.1,3,Gr,-2.2,0,0,up,true);
 bx(1.7,1.7,1.5,Y,.9,1.3,.8,up,true);bx(.05,1,1.2,glassFix,1.76,1.7,.8,up,true);
 const boom=new THREE.Group();boom.position.set(1.2,.9,-.6);up.add(boom);bx(7,.6,.6,Y,3.5,0,0,boom);
 const stick=new THREE.Group();stick.position.set(7,0,0);boom.add(stick);bx(5,.45,.45,M(0xd99e00,.5),2.5,0,0,stick);
 const bucket=new THREE.Group();bucket.position.set(5,0,0);stick.add(bucket);bx(1.3,1,1.3,Gr,.3,-.4,0,bucket);
 scene.add(g);return{g,up,boom,stick,bucket};
}
const ex=makeExc();ex.g.position.set(-46,0,0);
const pile=new THREE.Mesh(new THREE.ConeGeometry(1,1,28),soil);pile.position.set(-19.5,0,-6);pile.castShadow=pile.receiveShadow=true;scene.add(pile);
const DN=60,dpos=new Float32Array(DN*3),dg=new THREE.BufferGeometry();
dg.setAttribute('position',new THREE.BufferAttribute(dpos,3));
const dust=new THREE.Points(dg,new THREE.PointsMaterial({size:2.2,color:0xc2ab8a,transparent:true,opacity:.28,depthWrite:false}));dust.frustumCulled=false;scene.add(dust);

/* structure */
const S=new THREE.Group();scene.add(S);
const XS=[-10,-5,0,5,10],ZS=[-6,0,6],lvl=[],rebars=[],foots=[];
const raft=bx(22,.5,14,conc,0,-5,0,S,true);
const walls=[[-11.8,0,.4,17.2],[11.8,0,.4,17.2],[0,-8.8,23.2,.4],[0,8.8,23.2,.4]].map(o=>bx(o[2],5,o[3],conc,o[0],-5,o[1],S,true));
for(let k=0;k<7;k++){
 const y0=k?(k-1)*3.4:-5,h=k?3.4:5,cols=[];
 XS.forEach(x=>ZS.forEach(z=>{const c=bx(.6,h,.6,conc,x,y0,z,S,true);c.visible=false;cols.push(c)}));
 const slab=bx(22,.4,14,conc,0,y0+h-.4,0,S,true);slab.visible=false;lvl.push({cols,slab,y0,h});
}
XS.forEach(x=>ZS.forEach(z=>{foots.push(bx(1.6,.4,1.6,conc,x,-4.5,z,S,true));
 const r=bx(.25,1.4,.25,M(0x6d3f2a,.7,.3),x,0,z,S,true);r.visible=false;rebars.push(r)}));
const core=bx(4,1,4,conc,-7.5,-5,-3,S,true);
/* facade: colourful reflective glass, one hue per floor rising teal -> blue -> violet -> magenta */
const PAL=[0x18b9d9,0x12a9d3,0x1e9bd7,0x2a8fd0,0x1f86c8,0x2f9fd8],gold=M(0xf4fbff,.35,.15);
const envTex=(()=>{
 const pm=new THREE.PMREMGenerator(ren),es=new THREE.Scene(),geo=new THREE.SphereGeometry(60,32,16),cols=[],pa=geo.attributes.position;
 for(let i=0;i<pa.count;i++){const y=pa.getY(i)/60,h=new THREE.Color(0xf6e3c4),
  c=y>0?h.lerp(new THREE.Color(0x4f8fe0),Math.pow(y,.6)):h.lerp(new THREE.Color(0x2c3a2a),Math.min(1,-y*2));cols.push(c.r,c.g,c.b)}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
 es.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true})));
 const sm=new THREE.Mesh(new THREE.SphereGeometry(6,16,8),new THREE.MeshBasicMaterial({color:0xffffff}));sm.position.set(30,30,25);es.add(sm);
 const t=pm.fromScene(es).texture;pm.dispose();return t;
})();
const facade=[],rebarTop=[];
for(let f=1;f<=6;f++){const y0=(f-1)*3.4;
 [-1,1].forEach(s=>{for(let b=0;b<4;b++){
  const mat=new THREE.MeshStandardMaterial({color:PAL[f-1],roughness:.06,metalness:.9,envMap:envTex,envMapIntensity:1.15,transparent:true,opacity:.92,emissive:0xffc46e,emissiveIntensity:0});
  const m=bx(4.6,3,.06,mat,-7.5+b*5,y0,s*6.2,S,true);m.visible=false;m.userData={f,lit:Math.random()<.7?.35+Math.random()*.65:0};facade.push(m)}
  const w=bx(.3,3,12.6,M(PAL[f-1],.35,.25),s*10.35,y0,0,S,true);w.visible=false;w.userData={f,lit:0};facade.push(w)});
}
for(let f=1;f<=6;f++){const y0=(f-1)*3.4;
 [-1,1].forEach(s=>{
  XS.forEach(x=>{const fin=bx(.16,3,.5,gold,x,y0,s*6.35,S,true);fin.visible=false;fin.userData={f,lit:0};facade.push(fin)});
  const b1=bx(22.2,.3,.2,gold,0,f*3.4-.5,s*7.05,S,true),b2=bx(.2,.3,14.2,gold,s*11.05,f*3.4-.5,0,S,true);
  [b1,b2].forEach(b=>{b.visible=false;b.userData={f,lit:0};facade.push(b)});
 });
}
const roof=[[0,-6.4,21,.5],[0,6.4,21,.5],[-10.6,0,.5,13],[10.6,0,.5,13]].map(o=>bx(o[2],.9,o[3],gold,o[0],20.4,o[1],S,true));
const signMats=[],signMeshes=[],glow=new THREE.PointLight(0xffc27a,0,70);glow.position.set(0,6,18);scene.add(glow);
function sign(w,h,vert,pw,ph2,x,y,z,ry){
 const k=document.createElement('canvas');k.width=w;k.height=h;const g=k.getContext('2d'),tex=new THREE.CanvasTexture(k);
 tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const draw=()=>{g.clearRect(0,0,w,h);g.fillStyle=vert?'rgba(10,14,18,.6)':'#0d1216';g.fillRect(0,0,w,h);
  g.save();g.translate(w/2,h/2);if(vert)g.rotate(-Math.PI/2);
  const L=vert?h:w,gr=g.createLinearGradient(-L*.4,0,L*.4,0);['#b8862b','#f7de92','#e9c176','#a87a24'].forEach((c,i)=>gr.addColorStop(i/3,c));
  g.fillStyle=gr;g.font='600 '+(vert?w*.62:h*.62)+'px "Bodoni Moda",serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText('DEZIGNIST',0,vert?4:6);g.restore();tex.needsUpdate=true};
 draw();if(document.fonts)document.fonts.load('600 60px "Bodoni Moda"').then(draw).catch(()=>{});
 const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0}),m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph2),mat);
 m.position.set(x,y,z);m.rotation.y=ry;m.visible=false;scene.add(m);signMats.push(mat);signMeshes.push(m);
}
/* ---- final skyline (rises after the building is complete) ---- */
function facadeTex(h,st,base){
 const k=document.createElement('canvas');k.width=256;k.height=512;const g=k.getContext('2d'),rows=Math.max(6,Math.round(h/2.2)),rh=512/rows;
 if(st==='band'){g.fillStyle=base;g.fillRect(0,0,256,512);
  for(let r=0;r<rows;r++){const y=r*rh;g.fillStyle='#f4fbff';g.fillRect(0,y,256,rh*.3);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(24+(r%3)*44,y+rh*.5,70,rh*.18)}}
 else{const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#1a5f9c');gr.addColorStop(1,'#4db0e0');g.fillStyle=gr;g.fillRect(0,0,256,512);
  for(let r=0;r<rows;r++){g.fillStyle='rgba(235,248,255,'+(.22+.12*(r%3))+')';g.fillRect(0,r*rh,256,rh*.2)}
  g.fillStyle='rgba(255,255,255,.16)';g.beginPath();g.moveTo(40,512);g.lineTo(150,0);g.lineTo(210,0);g.lineTo(100,512);g.fill()}
 const t=new THREE.CanvasTexture(k);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;
}
const LH=58,
 TW=[{x:20,z:-44,w:15,d:12,h:LH,d0:.03,st:'band',b:'#2f9fd8'},{x:6,z:-30,w:14,d:12,h:44,d0:.015,st:'glass'},
  {x:34,z:-8,w:14,d:12,h:36,d0:0,st:'band',b:'#12b4d6'},{x:-33,z:-6,w:13,d:11,h:27,d0:.005,st:'glass'}];
const towers=TW.map(o=>{
 const sd=new THREE.MeshStandardMaterial({map:facadeTex(o.h,o.st,o.b),roughness:.2,metalness:.3,envMap:envTex,envMapIntensity:.8}),tp2=M(0xdfeaee,.6),
  gm=new THREE.BoxGeometry(o.w,o.h,o.d);gm.translate(0,o.h/2,0);
 const m=new THREE.Mesh(gm,[sd,sd,tp2,tp2,sd,sd]);m.position.set(o.x,0,o.z);m.castShadow=m.receiveShadow=true;m.visible=false;scene.add(m);
 bx(o.w+.5,.7,o.d+.5,M(0x8fa5ad,.5),0,o.h,0,m,true);return{m,d0:o.d0};
});
/* sleek rooftop logo on the tallest tower */
const logoG=new THREE.Group(),logoMats=[];
const logoTex=(()=>{
 const W=1200,H=300,k=document.createElement('canvas');k.width=W;k.height=H;const g=k.getContext('2d'),t=new THREE.CanvasTexture(k);
 t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
 const spaced=(s,y,sp)=>{const ws=[...s].map(ch=>g.measureText(ch).width),tot=ws.reduce((a,b)=>a+b,0)+sp*(s.length-1);let x=290+(830-tot)/2;
  [...s].forEach((ch,i)=>{g.fillText(ch,x,y);x+=ws[i]+sp})};
 const draw=()=>{g.clearRect(0,0,W,H);
  const bg=g.createLinearGradient(0,0,W,0);bg.addColorStop(0,'rgba(5,16,34,.92)');bg.addColorStop(1,'rgba(10,46,80,.92)');
  g.fillStyle=bg;g.beginPath();g.roundRect?g.roundRect(8,8,W-16,H-16,40):g.rect(8,8,W-16,H-16);g.fill();
  const ln=g.createLinearGradient(0,0,W,0);ln.addColorStop(0,'#5ff0ff');ln.addColorStop(.5,'#fff');ln.addColorStop(1,'#3d9bff');
  g.strokeStyle=ln;g.lineWidth=5;g.stroke();
  g.fillStyle=ln;g.beginPath();g.moveTo(92,222);g.lineTo(152,78);g.lineTo(204,78);g.lineTo(144,222);g.fill();
  g.fillStyle='#fff';g.beginPath();g.moveTo(160,222);g.lineTo(220,78);g.lineTo(246,78);g.lineTo(186,222);g.fill();
  g.textBaseline='middle';g.textAlign='left';
  g.font='600 116px Montserrat,sans-serif';const tg=g.createLinearGradient(0,80,0,180);tg.addColorStop(0,'#fff');tg.addColorStop(1,'#b8ecff');g.fillStyle=tg;spaced('DEZIGNIST',132,16);
  g.font='500 30px Montserrat,sans-serif';g.fillStyle='#6fe6ff';spaced('ARCHITECTURE \u00b7 DESIGN \u00b7 BUILD',226,9);
  t.needsUpdate=true};
 draw();if(document.fonts)document.fonts.load('600 60px Montserrat').then(draw).catch(()=>{});
 return t;
})();
const lw=15,lh=lw*.25,chrome=M(0xe8eef2,.25,.7);
const mkB=c=>{const m=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,toneMapped:false});logoMats.push(m);return m};
const lm=new THREE.MeshBasicMaterial({map:logoTex,transparent:true,opacity:0,toneMapped:false,depthWrite:false});logoMats.push(lm);
const plate=new THREE.Mesh(new THREE.PlaneGeometry(lw,lh),lm);plate.position.set(0,1.4+lh/2,0);logoG.add(plate);
[-5.5,5.5].forEach(x=>bx(.28,1.4,.28,chrome,x,0,-.1,logoG,true));
[1.4+lh+.12,1.4-.12].forEach(y=>{const nb=new THREE.Mesh(new THREE.BoxGeometry(lw,.12,.2),mkB(0x7fe9ff));nb.position.set(0,y,0);logoG.add(nb)});
bx(.3,9,.3,chrome,4.5,0,-2.5,logoG,true);
const beaconM=mkB(0xff5a5a),bcn=new THREE.Mesh(new THREE.SphereGeometry(.4,12,8),beaconM);bcn.position.set(4.5,9.2,-2.5);logoG.add(bcn);
logoG.position.set(TW[0].x,0,TW[0].z+4.2);logoG.visible=false;scene.add(logoG);
/* clouds */
const sphG=new THREE.SphereGeometry(1,18,12),cloudM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,fog:false,toneMapped:false}),clouds=[];
[[-55,44,-105,14],[42,62,-115,17],[78,40,-95,12],[-95,66,-125,18],[5,80,-135,15]].forEach(o=>{
 const g=new THREE.Group();[[0,0,1],[-1.3,-.2,.75],[1.4,-.25,.8],[.5,.5,.7],[-.4,.55,.6]].forEach(b=>{
  const m=new THREE.Mesh(sphG,cloudM);m.scale.set(b[2]*o[3],b[2]*o[3]*.7,b[2]*o[3]*.6);m.position.set(b[0]*o[3],b[1]*o[3],0);g.add(m)});
 g.position.set(o[0],o[1],o[2]);g.userData.x=o[0];g.visible=false;scene.add(g);clouds.push(g)});
const tank=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,2,20),M(0xb8b4aa,.6,.3));tank.position.set(6,21.4,0);tank.castShadow=true;S.add(tank);
const ant=bx(.12,7,.12,M(0xcccccc,.4,.6),-4,20.4,0,S,true);
const trees=[].map(o=>{
 const t=new THREE.Group();t.position.set(o[0],0,o[1]);
 bx(.35,2.4,.35,M(0x4a3320),0,0,0,t,true);
 const f=new THREE.Mesh(new THREE.IcosahedronGeometry(1.9,1),M(0x3f6b34,.95));f.position.y=3.6;f.castShadow=true;t.add(f);t.scale.setScalar(.001);scene.add(t);return t});

/* ---- landscaping: appears once the building is finished ---- */
const lawnM=new THREE.MeshStandardMaterial({map:noiseTex('#3f8f3a',.3,.1),roughness:1,transparent:true,opacity:0}),
 pavM=new THREE.MeshStandardMaterial({map:noiseTex('#c9b99a',.18,.2),roughness:.9,transparent:true,opacity:0});
const lawn=new THREE.Mesh(new THREE.ShapeGeometry(holeShape(30,20)),lawnM),paver=new THREE.Mesh(new THREE.ShapeGeometry(holeShape(16,13)),pavM),
 pathM=new THREE.Mesh(new THREE.PlaneGeometry(4,15),pavM);
lawn.rotation.x=paver.rotation.x=pathM.rotation.x=-Math.PI/2;lawn.position.y=.06;paver.position.y=.07;pathM.position.set(0,.08,20.5);
[lawn,paver,pathM].forEach(m=>{m.receiveShadow=true;m.visible=false;scene.add(m)});
const garden=[],trunkM=M(0x5a3d26,.95),leafG=[0x2f6b2f,0x3f8a3a,0x55a04a,0x2a5a35].map(c=>M(c,.9)),
 leafF=[0xe86aa5,0xf2c744,0xd9542e,0xb46ae0].map(c=>M(c,.85)),icoG=new THREE.IcosahedronGeometry(1,1),coneG=new THREE.ConeGeometry(1,1,10);
function blob(par,mat,r,x,y,z,sy){const m=new THREE.Mesh(icoG,mat);m.scale.set(r,r*(sy||1),r);m.position.set(x,y,z);m.castShadow=true;par.add(m);return m}
function plant(kind,x,z,i){
 const g=new THREE.Group();g.position.set(x,0,z);
 if(kind==='round'){bx(.35,2.6,.35,trunkM,0,0,0,g,true);const m=leafG[i%4];blob(g,m,1.9,0,3.8,0);blob(g,m,1.3,1,3.2,.6);blob(g,m,1.2,-.9,3.4,-.5)}
 else if(kind==='flower'){bx(.3,2.2,.3,trunkM,0,0,0,g,true);const m=leafF[i%4];blob(g,m,1.7,0,3.4,0);blob(g,m,1.1,.9,2.9,.5);blob(g,m,1,-.8,3,-.4)}
 else if(kind==='pine'){bx(.3,1.2,.3,trunkM,0,0,0,g,true);[[2.2,1.6,1.2],[1.7,1.5,2.5],[1.2,1.4,3.7]].forEach(o=>{
  const c=new THREE.Mesh(coneG,leafG[3]);c.scale.set(o[0],o[1],o[0]);c.position.y=o[2]+o[1]/2;c.castShadow=true;g.add(c)})}
 else if(kind==='palm'){const tg=new THREE.CylinderGeometry(.16,.28,7,8);tg.translate(0,3.5,0);
  const t=new THREE.Mesh(tg,trunkM);t.castShadow=true;t.rotation.z=.08;g.add(t);
  for(let j=0;j<8;j++){const pv=new THREE.Group();pv.position.set(.5,7,0);pv.rotation.y=j*Math.PI/4;g.add(pv);
   const lg=new THREE.BoxGeometry(3.2,.08,.6);lg.translate(1.6,0,0);const l=new THREE.Mesh(lg,leafG[1]);l.rotation.z=-.45;l.castShadow=true;pv.add(l)}}
 else if(kind==='shrub'){blob(g,leafG[i%3],1.1,0,.6,0,.7)}
 else if(kind==='bed'){bx(4,.3,1.6,M(0x4a3320,1),0,0,0,g,true);
  for(let j=0;j<10;j++){const f=blob(g,leafF[j%4],.24,-1.7+j*.38,.55+(j%2)*.15,(j%3-1)*.4);f.castShadow=false}}
 g.scale.setScalar(.001);g.visible=false;scene.add(g);garden.push({g,d:(garden.length%10)*.0035});
}
[[-20,-14],[-12,-17],[-4,-16.5],[4,-16.5],[12,-17],[20,-14]].forEach((o,i)=>plant('round',o[0],o[1],i));
[[-21,4],[21,4],[-18,-10.5],[18,-10.5],[-8,-21],[8,-21]].forEach((o,i)=>plant('flower',o[0],o[1],i));
[[-25,-8],[25,-8],[-25,10],[25,10]].forEach(o=>plant('pine',o[0],o[1],0));
[[-19,15],[19,15],[-23,-2],[23,-2]].forEach(o=>plant('palm',o[0],o[1],0));
for(let i=0;i<8;i++){const x=(i<4?-14+i*3.2:4.4+(i-4)*3.2);plant('shrub',x,14.6,i)}
for(let i=0;i<6;i++)[-17,17].forEach(x=>plant('shrub',x,-9+i*3.6,i));
[[-8,17.4],[8,17.4],[-15.5,17.4],[15.5,17.4]].forEach(o=>plant('bed',o[0],o[1],0));

/* tower crane */
const crane=new THREE.Group();crane.position.set(17,0,-10);scene.add(crane);
const Cy=M(0xe8a317,.5,.2);
[[-.9,-.9],[.9,-.9],[-.9,.9],[.9,.9]].forEach(o=>bx(.35,34,.35,Cy,o[0],0,o[1],crane,true));
for(let y=1;y<34;y+=3){bx(2.1,.15,.15,Cy,0,y,-.9,crane);bx(2.1,.15,.15,Cy,0,y,.9,crane);bx(.15,.15,2.1,Cy,-.9,y,0,crane);bx(.15,.15,2.1,Cy,.9,y,0,crane)}
const jib=new THREE.Group();jib.position.y=34;crane.add(jib);
bx(28,.7,1,Cy,7,0,0,jib);bx(2.4,1.8,1.8,Cy,0,1.4,0,jib,false);bx(4,1.4,1.6,M(0x666666,.8),-9,-.1,0,jib);
const rope=bx(.07,1,.07,M(0x222222),0,0,0,jib);rope.geometry.translate(0,-.5,0);
const load=bx(2,.9,1.4,M(0x8a8a86,.8),0,0,0,jib);
const trolley=bx(.9,.5,.9,M(0x222222),0,-.4,0,jib);

/* ---- people & heavy vehicles ---- */
const Gr2=M(0x2a2a2a,.85),wheelM=M(0x151515,.95);
function makeTruck(cab){
 const g=new THREE.Group();
 bx(9,.5,2.4,Gr2,0,.9,0,g,true);
 bx(2.2,1.9,2.3,M(cab,.4,.1),3.2,1.4,0,g,true);bx(.05,.9,1.9,glassFix,4.32,2.5,0,g,true);
 [3.2,-2.2,-3.6].forEach(x=>[-1.2,1.2].forEach(z=>{
  const w=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.45,18),wheelM);w.rotation.x=Math.PI/2;w.position.set(x,.6,z);w.castShadow=true;g.add(w)}));
 scene.add(g);g.visible=false;return g;
}
/* cement mixer */
const mixer=makeTruck(0xf5f5f5),drum=new THREE.Group();
const stripeTex=(()=>{const k=document.createElement('canvas');k.width=k.height=256;const g=k.getContext('2d');
 g.fillStyle='#e9e9e6';g.fillRect(0,0,256,256);g.strokeStyle='#f28c1b';g.lineWidth=38;
 for(let x=-256;x<512;x+=96){g.beginPath();g.moveTo(x,0);g.lineTo(x+256,256);g.stroke()}
 const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t})();
drum.position.set(-1,3.1,0);drum.rotation.z=Math.PI/2-.12;mixer.add(drum);
const drumMesh=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,5,28),new THREE.MeshStandardMaterial({map:stripeTex,roughness:.5,metalness:.2}));
drumMesh.castShadow=true;drum.add(drumMesh);
bx(2,.8,1.6,Gr2,-1,1.4,0,mixer,true);
const chute=bx(3.2,.3,.6,Gr2,-5.1,2.5,0,mixer);chute.rotation.z=.35;
/* dump truck */
const dump=makeTruck(0xe4572e),bed=new THREE.Group();bed.position.set(-4.4,1.4,0);dump.add(bed);
bx(6.2,1.5,2.6,M(0xf2b705,.5,.2),3.1,0,0,bed,true);bx(5.8,.25,2.3,soil,3.1,1.2,0,bed,true);
/* flatbed with bricks */
const flat=makeTruck(0x2e6fd8);bx(7,.3,2.6,Gr2,-.6,1.4,0,flat,true);
for(let i=0;i<3;i++)[-.7,.7].forEach(z=>bx(1.3,.9,1,M(0xa04a35,.9),-3.2+i*1.5,1.7,z,flat,true));
/* people */
const people=[];
function makePerson(shirt,helm,pants){
 const g=new THREE.Group(),legs=[],sm=M(shirt,.8),skin=M(0xd9a07a,.8);
 [-.11,.11].forEach(x=>{const l=new THREE.Group();l.position.set(x,.85,0);g.add(l);bx(.2,.85,.22,M(pants,.9),0,-.85,0,l,true);legs.push(l)});
 bx(.5,.62,.3,sm,0,.85,0,g,true);[-.31,.31].forEach(x=>bx(.12,.55,.14,sm,x,.88,0,g,true));
 const hd=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),skin);hd.position.y=1.66;hd.castShadow=true;g.add(hd);
 const hl=new THREE.Mesh(new THREE.SphereGeometry(.19,12,8,0,Math.PI*2,0,Math.PI/2),M(helm,.4));hl.position.y=1.68;hl.castShadow=true;g.add(hl);
 return{g,legs};
}
function addP(o){const q=makePerson(o.s,o.h,o.pt||0x24303f);q.g.visible=false;scene.add(q.g);
 people.push(Object.assign({y:0,amp:0,spd:.5,ph:Math.random()*6,minP:0,maxP:1.1,axis:'x',lv:0},o,{g:q.g,legs:q.legs}))}
const HV=0xf4a10c,LM=0xc8e21c,YL=0xffd21a,WH=0xf2f2f2,OR=0xff7a1a;
[{x:-8,z:12,amp:4,spd:.45,s:HV,h:YL,minP:.02,maxP:.34},{x:8,z:-12.5,amp:5,spd:.35,s:LM,h:WH,minP:.02,maxP:.34},
 {x:-13.5,z:8,s:HV,h:WH,ph:1,minP:.02,maxP:.34},{x:14,z:5,axis:'z',amp:3,spd:.5,s:LM,h:YL,minP:.05,maxP:.34},
 {x:-5,y:-4.5,z:3,amp:5,spd:.5,s:HV,h:YL,minP:.31,maxP:.43},{x:4,y:-4.5,z:-3,amp:5,spd:.42,s:LM,h:OR,minP:.32,maxP:.43},
 {x:2.5,y:-4.5,z:3,s:HV,h:WH,ph:2,minP:.32,maxP:.43},{x:-6.5,z:12.5,s:LM,h:YL,ph:3,minP:.28,maxP:.43},
 {x:12,z:12,amp:3.5,spd:.4,s:HV,h:WH,minP:.4},{x:-18,z:16,amp:3,spd:.5,s:LM,h:YL,minP:.42},
 {x:14,z:-4,s:HV,h:WH,ph:4,minP:.4},{x:0,z:14,amp:8,spd:.3,s:LM,h:OR,minP:.45},
 {lv:2,y:6.8,x:-3,z:3,amp:5,spd:.5,s:HV,h:YL,maxP:.88},{lv:3,y:10.2,x:3,z:-3,amp:5,spd:.45,s:LM,h:WH,maxP:.88},
 {lv:4,y:13.6,x:0,z:3,amp:6,spd:.4,s:HV,h:OR,maxP:.88},{lv:5,y:17,x:-2,z:-3,amp:6,spd:.5,s:LM,h:YL,maxP:.88},
 {lv:6,y:20.4,x:-4,z:3,amp:5,spd:.42,s:HV,h:WH,maxP:.88},
 {x:-10,y:0,z:29.5,amp:22,spd:.25,s:0xd0336a,h:0x2a1a10,pt:0x33384a,minP:.93},{x:15,z:30,amp:20,spd:.2,s:0x2f6fe0,h:0x5a3a20,pt:0x222222,minP:.93,ph:2},
 {x:0,z:29,amp:18,spd:.3,s:0xe9c176,h:0x111111,pt:0x3a3a3a,minP:.94,ph:4},{x:-20,z:30,amp:24,spd:.22,s:0x14b8a6,h:0x2a1a10,pt:0x1c2a44,minP:.94,ph:1}].forEach(addP);
/* ---- traffic on the road ---- */
const traffic=[],headM=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff2b0,emissiveIntensity:1}),
 tailM=new THREE.MeshStandardMaterial({color:0x550000,emissive:0xff2020,emissiveIntensity:.9});
function makeCar(col){
 const g=new THREE.Group();
 bx(4.2,.7,1.8,M(col,.25,.6),0,.4,0,g,true);bx(2.2,.6,1.55,M(0x1b232c,.1,.7),-.2,1.1,0,g,true);
 [1.4,-1.4].forEach(x=>[-.95,.95].forEach(z=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.3,14),wheelM);w.rotation.x=Math.PI/2;w.position.set(x,.38,z);g.add(w)}));
 [-.6,.6].forEach(z=>{bx(.08,.18,.4,headM,2.1,.75,z,g,true);bx(.08,.18,.4,tailM,-2.1,.75,z,g,true)});
 scene.add(g);return g;
}
function makeBike(col,shirt){
 const g=new THREE.Group(),dk=M(0x222222,.6,.4);
 [.8,-.8].forEach(x=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.14,14),wheelM);w.rotation.x=Math.PI/2;w.position.set(x,.36,0);g.add(w)});
 bx(1.5,.3,.3,M(col,.3,.5),0,.6,0,g,true);bx(.6,.25,.35,M(col,.3,.5),.3,.95,0,g,true);bx(.1,.1,.8,dk,.8,1.15,0,g);bx(.1,.6,.1,dk,.8,.65,0,g,true);
 bx(.08,.14,.3,headM,1,.9,0,g,true);
 const r=makePerson(shirt,0xf2f2f2,0x222222);r.g.position.set(-.15,.35,0);r.g.rotation.y=Math.PI/2;r.g.scale.setScalar(.92);
 r.legs.forEach(l=>l.rotation.x=-.9);g.add(r.g);scene.add(g);return g;
}
[[0xd62828,1],[0xf2f2f2,-1],[0x2f6fe0,1],[0xf2b705,-1],[0xb8bcc2,1],[0x1a1a1a,-1],[0x14b8a6,1],[0xe9c176,-1]].forEach((c,i)=>
 traffic.push({g:makeCar(c[0]),dir:c[1],z:c[1]>0?32.8:39.6,sp:6+(i*1.7)%5,off:i*27}));
[[0xe4572e,1,0x2f6fe0],[0x2f6fe0,-1,0xd0336a],[0x111111,1,0xf4a10c],[0xc44fb8,-1,0x14b8a6],[0xf2b705,1,0x333333]].forEach((c,i)=>
 traffic.push({g:makeBike(c[0],c[2]),dir:c[1],z:c[1]>0?35:37.6,sp:9+(i*1.3)%4,off:i*41+13}));
const dashT=(()=>{const k=document.createElement('canvas');k.width=64;k.height=4;const g=k.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,32,4);
 const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(55,1);return t})();
const dash=new THREE.Mesh(new THREE.PlaneGeometry(440,.3),new THREE.MeshBasicMaterial({map:dashT,transparent:true}));
dash.rotation.x=-Math.PI/2;dash.position.set(0,.09,36);scene.add(dash);

function actors(t,fp,ph){
 traffic.forEach(o=>{const x=(((t*o.sp*o.dir+o.off)%220)+220)%220-110;o.g.position.set(x,0,o.z);o.g.rotation.y=o.dir>0?0:Math.PI});
 [lawnM,pavM].forEach(m=>m.opacity=fp);[lawn,paver,pathM].forEach(m=>m.visible=fp>0);
 garden.forEach((o,i)=>{const k=ease(seg(p,.92+o.d,.96+o.d+.03));o.g.visible=k>.002;o.g.scale.setScalar(.001+k);o.g.rotation.z=Math.sin(t*.8+i)*.012*k});
 const dig=p>.09&&p<.28;
 dump.visible=p>.09&&p<.335;
 dump.position.set(p<.28?-75+49*ease(seg(p,.09,.16)):-26-50*ease(seg(p,.295,.335)),0,-16);
 dump.rotation.y=Math.PI*ease(seg(p,.275,.295));
 bed.rotation.z=dig&&p>.17?.55*Math.max(0,Math.sin(ph*.5-.6)):0;
 mixer.visible=p>.255&&p<.425;
 mixer.position.set(-8,0,p<.33?62-45*ease(seg(p,.26,.30)):17+45*ease(seg(p,.385,.42)));
 mixer.rotation.y=-Math.PI/2;drumMesh.rotation.y=t*(p>.30&&p<.385?2.2:.6);
 flat.visible=p>.40&&p<.85;
 flat.position.set(p<.6?-80+56*ease(seg(p,.40,.46)):-24+110*ease(seg(p,.78,.84)),0,22);
 people.forEach(o=>{
  let vis=p>=o.minP&&p<=o.maxP;if(vis&&o.lv)vis=lvl[o.lv].slab.scale.x>.99;
  o.g.visible=vis;if(!vis)return;
  const a=t*o.spd+o.ph,off=o.amp*Math.sin(a),dir=Math.cos(a)>=0?1:-1;
  o.g.position.set(o.x+(o.axis==='x'?off:0),o.y,o.z+(o.axis==='z'?off:0));
  if(o.amp){o.g.rotation.y=o.axis==='x'?dir*Math.PI/2:(dir>0?0:Math.PI);o.legs[0].rotation.x=Math.sin(a*8)*.5;o.legs[1].rotation.x=-o.legs[0].rotation.x}
  else{o.g.rotation.y=o.ph;o.g.position.y=o.y+Math.abs(Math.sin(t*2+o.ph))*.04}
 });
 glow.intensity=fp*.4;
 towers.forEach(o=>{const k=ease(seg(p,.92+o.d0,.955+o.d0));o.m.visible=k>.002;o.m.scale.y=.001+k});
 const kA=ease(seg(p,.95,.985)),kl=ease(seg(p,.965,.995));
 logoG.visible=kl>.002;logoG.position.y=LH*kA+.7;logoMats.forEach(m=>m.opacity=kl);beaconM.opacity=kl*(.65+.35*Math.sin(t*3));
 cloudM.opacity=fp*.95;clouds.forEach((c,i)=>{c.visible=fp>0;c.position.x=c.userData.x+Math.sin(t*.06+i*2)*5});
}

/* ---- camera path ---- */
const pc=new THREE.CatmullRomCurve3(KF.map(k=>new THREE.Vector3(...k[1])),false,'centripetal'),
 lc=new THREE.CatmullRomCurve3(KF.map(k=>new THREE.Vector3(...k[2])),false,'centripetal'),
 tp=new THREE.Vector3(),tl=new THREE.Vector3();
function camUpdate(t){
 let i=0;while(i<KF.length-2&&p>=KF[i+1][0])i++;
 const s=cl((p-KF[i][0])/(KF[i+1][0]-KF[i][0])),u=(i+s*.6+ease(s)*.4)/(KF.length-1);
 pc.getPoint(u,tp);lc.getPoint(u,tl);
 tp.x+=Math.sin(t*.6)*.12;tp.y+=Math.sin(t*.8)*.08;
 cam.position.copy(tp);cam.lookAt(tl);
}

/* ---- sky / sun ---- */
const cDay=new THREE.Color(0x9cc4e4),cDusk=new THREE.Color(0x9fdde9),cNow=new THREE.Color(),sDay=new THREE.Color(0xfff2dd),sDusk=new THREE.Color(0xfff6e6);
function env(){
 const t=ease(seg(p,.55,1));cNow.copy(cDay).lerp(cDusk,t);scene.background.copy(cNow);scene.fog.color.copy(cNow);
 const a=lerp(1.05,.75,p);sun.position.set(Math.cos(a)*45+10,Math.sin(a)*70+6,42);
 sun.color.copy(sDay).lerp(sDusk,t);sun.intensity=lerp(2.1,1.9,t);hemi.intensity=lerp(.75,.7,t);
 bar.parentElement.style.opacity=1;shadeEl.style.opacity=1-.6*seg(p,.9,.99);
}

/* ---- per-frame scene state ---- */
function update(t){
 env();
 fill.position.y=-5*ease(seg(p,.08,.28))-.05;
 /* excavator */
 const dig=p>.09&&p<.28;
 ex.g.visible=p<.345;ex.g.position.x=p<.28?-46+30*ease(seg(p,.03,.09)):-16-34*ease(seg(p,.28,.34));
 const ph=t*1.5;
 if(dig){const s=Math.sin(ph);ex.boom.rotation.z=.32+.14*s;ex.stick.rotation.z=-1.55-.45*s;ex.bucket.rotation.z=-.6+.5*Math.sin(ph+1);
  ex.up.rotation.y=2.1*ease(.5+.5*Math.sin(ph*.5-1.57))}
 else{ex.boom.rotation.z=.5;ex.stick.rotation.z=-1.9;ex.bucket.rotation.z=-1;ex.up.rotation.y=0}
 const e=ease(seg(p,.09,.28)),pr=.001+5*e,ph2=.001+3.6*e;pile.scale.set(pr,ph2,pr);pile.position.y=ph2/2;
 dust.visible=dig;if(dig)for(let i=0;i<DN;i++){const k=(t*.5+i/DN)%1;
  dpos[i*3]=-9+((i*37)%10)-k*2;dpos[i*3+1]=-4+k*7;dpos[i*3+2]=-4+((i*53)%9)*.9}
 dg.attributes.position.needsUpdate=true;
 /* foundation */
 const bs=ease(seg(p,.28,.36)),wl=ease(seg(p,.30,.40)),lv=seg(p,.40,.78)*7,wp=seg(p,.78,.90),fp=seg(p,.92,.99);
 raft.visible=bs>0;raft.scale.y=Math.max(bs,.001);
 walls.forEach(w=>{w.visible=wl>0;w.scale.y=Math.max(wl,.001)});
 foots.forEach(f=>{f.visible=lv>0;f.scale.y=Math.max(cl(lv*6),.001)});
 lvl.forEach((L,k)=>{const u=cl(lv-k),ch=cl(u/.75),sw=cl((u-.6)/.4);
  L.cols.forEach(c=>{c.visible=ch>0;c.scale.y=Math.max(ch,.001)});
  L.slab.visible=sw>0;L.slab.scale.set(Math.max(sw,.001),1,Math.max(sw,.001))});
 const ka=Math.min(Math.floor(lv),6),L=lvl[ka],ru=cl(lv-ka),topY=lv<=1?-5+5*lv:(lv-1)*3.4;
 rebars.forEach(r=>{r.visible=lv>0&&lv<7&&ru<.95;r.position.y=L.y0+L.h*cl(ru/.75)});
 core.visible=lv>0;core.scale.y=Math.max(topY+5,.001);
 /* facade */
 facade.forEach(m=>{const fu=cl(wp*6-(m.userData.f-1));m.visible=fu>0;m.scale.y=Math.max(fu,.001);
  if(m.material.emissive)m.material.emissiveIntensity=fp*m.userData.lit*.18});
 roof.forEach(r=>{r.visible=fp>0;r.scale.y=Math.max(fp,.001)});
 tank.visible=ant.visible=fp>0;
 trees.forEach(tr=>tr.scale.setScalar(.001+fp));
 /* crane */
 const ca=Math.min(ease(seg(p,.30,.38)),1-ease(seg(p,.86,.92)));crane.visible=ca>.01;crane.scale.y=Math.max(ca,.001);
 jib.rotation.y=Math.PI+.35*Math.sin(t*.35);
 const tx=8+4*Math.sin(t*.5),Lr=Math.max(3,34-(topY+3.5)+Math.sin(t*1.4)*.4);
 trolley.position.x=tx;rope.position.x=tx;rope.position.y=-.5;rope.scale.y=Lr;load.position.set(tx,-.5-Lr-.5,0);
 actors(t,fp,ph);sun.target.position.set(0,0,0);
}

/* ---- captions & scroll ---- */
function caption(){
 let i=STAGES.findIndex(s=>p>=s[0]&&p<s[1]);if(i<0)i=STAGES.length-1;
 if(i===curStage)return;curStage=i;cap.classList.add('out');
 setTimeout(()=>{cap.querySelector('h2').textContent=STAGES[i][2];cap.querySelector('p').textContent=STAGES[i][3];
  cap.classList.toggle('hero',i===0||i===STAGES.length-1);cap.classList.remove('out')},260);
}
function resize(){W=innerWidth;H=innerHeight;ren.setSize(W,H,false);cam.aspect=W/H;cam.fov=W<H?66:42;cam.updateProjectionMatrix()}
function readScroll(){const r=track.getBoundingClientRect();target=cl(-r.top/(r.height-innerHeight))}
function loop(now){
 p+=(target-p)*.08;if(Math.abs(target-p)<.0004)p=target;
 const t=now/1000;update(t);camUpdate(t);ren.render(scene,cam);
 bar.style.height=p*100+'%';hint.style.opacity=p<.03?1:0;caption();
 requestAnimationFrame(loop);
}
addEventListener('resize',()=>{resize();readScroll()});addEventListener('scroll',readScroll,{passive:true});
resize();readScroll();requestAnimationFrame(loop);
})();


/* ===== WEBSITE SCRIPT (safe: missing elements no longer crash the page) ===== */
const projects = []; // add project objects here if you use the dynamic grid
const services = [
  {title:'RESIDENTIAL',icon:'home_work',description:'Bespoke private estates and minimalist sanctuaries designed for permanence and utmost discretion.'},
  {title:'COMMERCIAL',icon:'domain',description:'Authoritative headquarters and institutional structures that project stability and forward-thinking vision.'},
  {title:'URBAN PLANNING',icon:'location_city',description:'Large-scale infrastructural interventions that redefine cityscapes with rigorous modernist principles.'}
];
const offices = ['CHENNAI'];
const $ = id => document.getElementById(id);
const on = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };

function renderProjects() {
  const c = $('projects-grid'); if (!c) return;
  c.innerHTML = projects.map(p => `
    <div onclick="openCard(${p.id})" class="group block relative aspect-[3/4] overflow-hidden border-t border-outline-variant/30 pt-4 cursor-pointer ${p.offset ? 'md:mt-16' : ''}">
      <div class="absolute top-6 left-4 z-20 bg-surface/80 backdrop-blur-md px-3 py-1 border border-outline-variant/40">
        <span class="font-label-caps text-[10px] tracking-widest text-secondary uppercase">${p.category}</span>
      </div>
      <div class="absolute inset-x-0 top-4 bottom-0 z-0 overflow-hidden">
        <img src="${p.image}" alt="${p.alt}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div class="absolute inset-0 bg-surface-dim/30 group-hover:bg-transparent transition-colors duration-500"></div>
      </div>
      <div class="relative z-10 p-4 md:p-6 flex flex-col justify-end h-full">
        <div class="bg-surface/90 backdrop-blur-sm p-4 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <span class="block font-label-caps text-xs text-secondary mb-1">${p.date}</span>
          <h3 class="font-headline-md text-lg md:text-headline-md text-on-surface">${p.title}</h3>
        </div>
      </div>
    </div>`).join('');
}
function renderServices() {
  const c = $('services-grid'); if (!c) return;
  c.innerHTML = services.map(s => `
    <div class="pt-8 md:pt-0 md:px-8 flex flex-col items-center text-center group">
      <span class="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-secondary transition-colors duration-300 mb-4">${s.icon}</span>
      <h3 class="font-headline-md text-xl md:text-headline-md text-on-surface mb-2 md:mb-4">${s.title}</h3>
      <p class="font-body-md text-sm md:text-body-md text-on-surface-variant">${s.description}</p>
    </div>`).join('');
}
function renderOffices() {
  const c = $('offices-container'); if (!c) return;
  c.innerHTML = offices.map(o => `<a href="#" class="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors">${o}</a>`).join('');
}

/* Mobile menu (only if present) */
const mobileMenu = $('mobile-menu'), mobileMenuIcon = $('mobile-menu-icon');
const closeMobile = () => { if (mobileMenu) mobileMenu.classList.add('hidden'); if (mobileMenuIcon) mobileMenuIcon.textContent = 'menu'; };
on('mobile-menu-toggle', 'click', () => {
  if (!mobileMenu) return;
  const open = !mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden', open);
  if (mobileMenuIcon) mobileMenuIcon.textContent = open ? 'menu' : 'close';
});
document.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMobile));

/* Project modal */
function openCard(id) {
  const p = projects.find(x => x.id === id); if (!p) return;
  $('modal-category-date').textContent = `${p.category} — ${p.date}`;
  $('modal-title').textContent = p.title;
  $('modal-image').src = p.image; $('modal-image').alt = p.alt;
  $('modal-description').textContent = p.description;
  $('modal-location').textContent = `LOCATION: ${p.location}`;
  $('project-modal').classList.remove('hidden');
}
function closeCard() { $('project-modal').classList.add('hidden'); }
on('close-project-modal', 'click', closeCard);
on('close-modal-btn', 'click', closeCard);
on('project-modal', 'click', e => { if (e.target.id === 'project-modal') closeCard(); });

/* Inquiry modal */
function openEnquiry() { closeMobile(); $('enquiry-modal').classList.remove('hidden'); }
function closeEnquiry() {
  $('enquiry-modal').classList.add('hidden');
  $('enquiry-form-view').classList.remove('hidden');
  $('enquiry-success-view').classList.add('hidden');
  $('enquiry-form').reset();
}
['open-inquiry-btn', 'mobile-inquiry-btn', 'cta-inquiry-btn'].forEach(id => on(id, 'click', openEnquiry));
on('close-enquiry-modal', 'click', closeEnquiry);
on('return-site-btn', 'click', closeEnquiry);
on('enquiry-modal', 'click', e => { if (e.target.id === 'enquiry-modal') closeEnquiry(); });
on('enquiry-form', 'submit', e => {
  e.preventDefault();
  $('enquiry-success-text').textContent = `Thank you, ${$('form-name').value}. Our design partners will review your site parameters for ${$('form-location').value} and contact you shortly.`;
  $('enquiry-form-view').classList.add('hidden');
  $('enquiry-success-view').classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', () => { renderProjects(); renderServices(); renderOffices(); });