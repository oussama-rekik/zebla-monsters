/* Zebla Monsters — modèles 3D (formes simples Three.js) */
(function(){
'use strict';
const Z=window.Z;
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);Z.V3=V3;
const M=(color,o)=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:.6,metalness:0},o||{}));Z.M=M;
function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;return m;}Z.mesh=mesh;
const DK=0x16302B;

function addEyes(g,y,z,sep,r,pupil){const w=M(0xffffff,{roughness:.25}),b=M(pupil||DK,{roughness:.2});
  [-1,1].forEach(s=>{g.add(mesh(new THREE.SphereGeometry(r,20,16),w,s*sep,y,z));g.add(mesh(new THREE.SphereGeometry(r*.55,16,12),b,s*sep,y-.01,z+r*.62));g.add(mesh(new THREE.SphereGeometry(r*.17,8,8),w,s*sep+r*.18,y+r*.2,z+r*.98));});}
function smile(g,y,z,r,col,frown){const m=mesh(new THREE.TorusGeometry(r||.18,.045,8,20,Math.PI),M(col||DK),0,y,z);m.rotation.z=frown?0:Math.PI;g.add(m);}
function arm(mat,s,y,x,len){len=len||.6;const p=new THREE.Group();p.position.set(s*x,y,0);p.add(mesh(new THREE.CylinderGeometry(.07,.07,len,10),mat,0,-len/2,0));p.add(mesh(new THREE.SphereGeometry(.11,12,10),mat,0,-len-.02,0));p.rotation.z=s*.6;return p;}
function brows(g,y,z,sep,ang){const bm=M(DK);[-1,1].forEach(s=>{const b=mesh(new THREE.BoxGeometry(.26,.06,.06),bm,s*sep,y,z);b.rotation.z=s*-ang;g.add(b);});}

const MB={
canettor(){const g=new THREE.Group();const red=M(0xE8453C,{metalness:.3,roughness:.35}),sil=M(0xD9DEE3,{metalness:.8,roughness:.25}),wh=M(0xffffff);
  g.add(mesh(new THREE.CylinderGeometry(.7,.7,1.8,40),red,0,1.1,0));g.add(mesh(new THREE.CylinderGeometry(.705,.705,.24,40),wh,0,1.78,0));
  g.add(mesh(new THREE.CylinderGeometry(.6,.7,.15,40),sil,0,2.07,0));g.add(mesh(new THREE.CylinderGeometry(.7,.6,.12,40),sil,0,.15,0));
  const tab=mesh(new THREE.TorusGeometry(.13,.035,8,20),sil,0,2.16,.08);tab.rotation.x=Math.PI/2;g.add(tab);
  addEyes(g,1.2,.62,.28,.18);brows(g,1.47,.68,.28,.35);smile(g,.85,.67,.2);
  const aL=arm(red,-1,1.05,.72),aR=arm(red,1,1.05,.72);g.add(aL,aR);return{g,arms:[aL,aR],mats:[red],mouth:V3(0,.9,.8)};},
plastikor(){const g=new THREE.Group();const bl=M(0x9AD8F6,{transparent:true,opacity:.9,roughness:.12}),dk=M(0x3A9BD0);
  const b=mesh(new THREE.SphereGeometry(.85,32,24),bl,0,1.1,0);b.scale.set(1,1.25,.78);g.add(b);
  [-1,1].forEach(s=>g.add(mesh(new THREE.TorusGeometry(.22,.07,10,24,Math.PI),dk,s*.32,2.08,0)));
  const st=mesh(new THREE.BoxGeometry(.05,.9,.02),M(0xffffff,{transparent:true,opacity:.6}),-.45,1.1,.6);st.rotation.z=.15;g.add(st);
  addEyes(g,1.25,.6,.3,.19);smile(g,.86,.64,.2);const aL=arm(bl,-1,1.0,.8),aR=arm(bl,1,1.0,.8);g.add(aL,aR);return{g,arms:[aL,aR],mats:[bl],mouth:V3(0,.9,.75)};},
kartouna(){const g=new THREE.Group();const br=M(0xC8955A,{roughness:.85}),lt=M(0xE9CFA0,{roughness:.8});
  g.add(mesh(new THREE.BoxGeometry(1.4,1.3,1.2),br,0,.8,0));
  [-1,1].forEach(s=>{const p=new THREE.Group();p.position.set(s*.7,1.45,0);p.add(mesh(new THREE.BoxGeometry(.66,.04,1.2),br,s*.33,0,0));p.rotation.z=s*.6;g.add(p);});
  g.add(mesh(new THREE.BoxGeometry(.22,1.31,.02),lt,0,.8,.605));
  addEyes(g,1.0,.62,.36,.17);const mz=M(DK);for(let i=0;i<5;i++){const z=mesh(new THREE.BoxGeometry(.11,.04,.04),mz,-.24+i*.12,.58,.62);z.rotation.z=i%2?.6:-.6;g.add(z);}
  const aL=arm(br,-1,.85,.72),aR=arm(br,1,.85,.72);g.add(aL,aR);return{g,arms:[aL,aR],mats:[br],mouth:V3(0,.6,.7)};},
compostix(){const g=new THREE.Group();const so=M(0x8A5D36,{roughness:.95,flatShading:true});
  const b=mesh(new THREE.IcosahedronGeometry(.85,2),so,0,.78,0);b.scale.set(1.1,.85,1);g.add(b);
  g.add(mesh(new THREE.CylinderGeometry(.04,.05,.45,8),M(0x3E8E3A),0,1.65,0));
  [-1,1].forEach(s=>{const l=mesh(new THREE.SphereGeometry(.2,12,8),M(0x5DBB55),s*.17,1.88,0);l.scale.set(1.3,.35,.7);l.rotation.z=s*.5;g.add(l);});
  [[0xE8453C,-.5,.4,.62],[0xF07A2A,.55,.3,.6],[0xF6D44A,.3,1.15,.55]].forEach(([c,x,y,z])=>g.add(mesh(new THREE.SphereGeometry(.07,8,8),M(c),x,y,z)));
  addEyes(g,.95,.78,.3,.18);smile(g,.6,.82,.2);[-1,1].forEach(s=>{const k=mesh(new THREE.SphereGeometry(.09,10,8),M(0xE59B8A,{transparent:true,opacity:.6}),s*.52,.72,.72);k.scale.z=.3;g.add(k);});
  const pl=M(0xF6D44A);const aL=arm(pl,-1,.8,.9,.5),aR=arm(pl,1,.8,.9,.5);g.add(aL,aR);return{g,arms:[aL,aR],mats:[so],mouth:V3(0,.65,.9)};},
megotine(){const g=new THREE.Group();const wh=M(0xF4F1EA),fi=M(0xE89A3C,{roughness:.9}),ash=M(0x5E5E5E,{roughness:1});
  g.add(mesh(new THREE.CylinderGeometry(.5,.5,1.3,32),wh,0,1.55,0));g.add(mesh(new THREE.CylinderGeometry(.51,.51,.9,32),fi,0,.5,0));
  g.add(mesh(new THREE.CylinderGeometry(.46,.5,.18,32),ash,0,2.28,0));g.add(mesh(new THREE.SphereGeometry(.12,10,8),M(0xFF5A1A,{emissive:0xFF3A00,emissiveIntensity:1}),.1,2.38,.15));
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.add(mesh(new THREE.SphereGeometry(.035,6,6),M(0xA8641C),Math.cos(a)*.51,.3+(i%3)*.2,Math.sin(a)*.51));}
  addEyes(g,1.62,.47,.22,.15,0xB3261E);brows(g,1.85,.55,.22,.45);smile(g,1.25,.52,.14,DK,true);
  const aL=arm(wh,-1,1.4,.52,.55),aR=arm(wh,1,1.4,.52,.55);g.add(aL,aR);return{g,arms:[aL,aR],mats:[wh,fi],mouth:V3(0,1.25,.6),smoke:V3(.1,2.45,.15)};}
};
Z.buildMonster=function(k,legendary){const m=MB[k]();if(legendary){const gold=M(0xFFC94A,{metalness:.7,roughness:.25,emissive:0x8a5a00,emissiveIntensity:.3});const cr=new THREE.Group();
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const sp=mesh(new THREE.ConeGeometry(.09,.3,6),gold,Math.cos(a)*.3,.15,Math.sin(a)*.3);cr.add(sp);}cr.add(mesh(new THREE.CylinderGeometry(.36,.36,.14,20,1,true),gold,0,0,0));
  const box=new THREE.Box3().setFromObject(m.g);cr.position.y=box.max.y+.12;m.g.add(cr);m.crown=cr;}return m;};

Z.W={
  bouteille(){const g=new THREE.Group();const m=M(0x9AD8F6,{transparent:true,opacity:.85,roughness:.1});g.add(mesh(new THREE.CylinderGeometry(.13,.13,.42,18),m));g.add(mesh(new THREE.CylinderGeometry(.05,.13,.14,18),m,0,.28,0));g.add(mesh(new THREE.CylinderGeometry(.055,.055,.06,12),M(0x2B7FAE),0,.37,0));g.add(mesh(new THREE.CylinderGeometry(.134,.134,.12,18),M(0x2E9E5B),0,.02,0));return g;},
  sac(){const g=new THREE.Group();const m=M(0xF4F4F4,{roughness:.45});const b=mesh(new THREE.SphereGeometry(.22,16,12),m);b.scale.set(1,1.2,.6);g.add(b);[-1,1].forEach(s=>g.add(mesh(new THREE.TorusGeometry(.06,.02,6,12,Math.PI),m,s*.09,.26,0)));g.add(mesh(new THREE.BoxGeometry(.16,.1,.02),M(0x3A9BD0),0,0,.13));return g;},
  canette(){const g=new THREE.Group();g.add(mesh(new THREE.CylinderGeometry(.12,.12,.34,20),M(0xE8453C,{metalness:.4,roughness:.3})));g.add(mesh(new THREE.CylinderGeometry(.1,.12,.04,20),M(0xD9DEE3,{metalness:.8,roughness:.2}),0,.19,0));g.add(mesh(new THREE.CylinderGeometry(.122,.122,.07,20),M(0xffffff),0,.05,0));return g;},
  conserve(){const g=new THREE.Group();g.add(mesh(new THREE.CylinderGeometry(.15,.15,.26,20),M(0xC9CFD4,{metalness:.8,roughness:.3})));g.add(mesh(new THREE.CylinderGeometry(.153,.153,.16,20),M(0xF6D44A)));g.add(mesh(new THREE.CylinderGeometry(.155,.155,.05,20),M(0xE8453C)));return g;},
  carton(){const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(.42,.3,.3),M(0xC8955A,{roughness:.9})));g.add(mesh(new THREE.BoxGeometry(.08,.302,.302),M(0xE9CFA0)));return g;},
  journal(){const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(.42,.05,.3),M(0xEDEDED)));[-.07,0,.07].forEach(z=>g.add(mesh(new THREE.BoxGeometry(.3,.052,.025),M(0x666666),0,0,z)));g.rotation.x=.5;return g;},
  banane(){const g=new THREE.Group();g.add(mesh(new THREE.TorusGeometry(.2,.06,10,20,Math.PI*.85),M(0xF6D44A)));g.add(mesh(new THREE.SphereGeometry(.045,8,8),M(0x5E3E22),.2,0,0));return g;},
  pomme(){const g=new THREE.Group();const m=M(0xE8453C);g.add(mesh(new THREE.SphereGeometry(.13,16,12,0,Math.PI*2,0,Math.PI/2),m,0,.08,0));g.add(mesh(new THREE.CylinderGeometry(.06,.06,.17,12),M(0xF5E6C4)));g.add(mesh(new THREE.SphereGeometry(.13,16,12,0,Math.PI*2,Math.PI/2,Math.PI/2),m,0,-.08,0));g.add(mesh(new THREE.CylinderGeometry(.012,.012,.1,6),M(0x5E3E22),0,.25,0));return g;}
};

/* objets de la ville */
function bike(col){const g=new THREE.Group();const tire=M(0x222222),fr=M(col,{metalness:.3,roughness:.4});
  [-.34,.34].forEach(x=>g.add(mesh(new THREE.TorusGeometry(.24,.03,8,24),tire,x,.27,0)));
  const tube=(p1,p2)=>{const v=new THREE.Vector3().subVectors(p2,p1);const m=mesh(new THREE.CylinderGeometry(.025,.025,v.length(),8),fr);m.position.copy(p1).add(p2).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V3(0,1,0),v.normalize());g.add(m);};
  const P=(x,y)=>V3(x,y,0);tube(P(-.34,.27),P(-.02,.27));tube(P(-.02,.27),P(.2,.55));tube(P(-.34,.27),P(-.12,.55));tube(P(-.12,.55),P(.2,.55));tube(P(-.02,.27),P(-.12,.55));tube(P(.2,.55),P(.34,.27));tube(P(.2,.55),P(.24,.68));tube(P(-.12,.55),P(-.14,.66));
  g.add(mesh(new THREE.BoxGeometry(.14,.03,.07),tire,-.14,.67,0));const bar=mesh(new THREE.CylinderGeometry(.02,.02,.3,8),tire,.24,.68,0);bar.rotation.x=Math.PI/2;g.add(bar);return g;}
Z.BUILD={
  banc(){const g=new THREE.Group();const a=M(0x3A9BD0),b=M(0x2B7FAE),l=M(DK);for(let i=0;i<3;i++)g.add(mesh(new THREE.BoxGeometry(1.3,.07,.14),i%2?a:b,0,.45,-.18+i*.17));for(let i=0;i<2;i++)g.add(mesh(new THREE.BoxGeometry(1.3,.12,.06),i?a:b,0,.68+i*.17,-.32));[-.55,.55].forEach(x=>{g.add(mesh(new THREE.BoxGeometry(.08,.45,.5),l,x,.22,-.08));g.add(mesh(new THREE.BoxGeometry(.08,.5,.06),l,x,.65,-.34));});return g;},
  velo(){const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(1.5,.06,.95),M(0xBFC6CC),0,.03,0));const b1=bike(0xE8453C);b1.position.set(-.05,.06,-.2);g.add(b1);const b2=bike(0x2E9E5B);b2.position.set(.05,.06,.22);g.add(b2);g.add(mesh(new THREE.CylinderGeometry(.03,.03,1,8),M(DK),.68,.5,-.4));g.add(mesh(new THREE.BoxGeometry(.3,.3,.03),M(0x3A9BD0),.68,1.05,-.4));return g;},
  livres(){const g=new THREE.Group();const wd=M(0xA8743F);g.add(mesh(new THREE.CylinderGeometry(.06,.06,.7,8),wd,0,.35,0));g.add(mesh(new THREE.BoxGeometry(.72,.62,.46),wd,0,1,0));[0xE8453C,0x3A9BD0,0xF6D44A,0x2E9E5B,0xF07A2A].forEach((c,i)=>g.add(mesh(new THREE.BoxGeometry(.09,.22+(i%2)*.06,.3),M(c),-.22+i*.11,.92+(i%2)*.03,0)));g.add(mesh(new THREE.BoxGeometry(.62,.52,.02),M(0xBFE6F5,{transparent:true,opacity:.35}),0,1,.24));const r=mesh(new THREE.ConeGeometry(.56,.32,4),M(0x2E9E5B),0,1.47,0);r.rotation.y=Math.PI/4;g.add(r);return g;},
  olivier(){const g=new THREE.Group();const bk=M(0x7A5230);const t1=mesh(new THREE.CylinderGeometry(.09,.16,.85,8),bk,0,.42,0);t1.rotation.z=.12;g.add(t1);const t2=mesh(new THREE.CylinderGeometry(.06,.09,.5,8),bk,.12,.88,0);t2.rotation.z=-.4;g.add(t2);const l1=M(0x86A86A,{flatShading:true}),l2=M(0x6E9E58,{flatShading:true});[[0,1.2,0,.5],[.36,1.08,.1,.36],[-.33,1.05,-.05,.38],[.05,1.02,.33,.32],[0,1.08,-.32,.34]].forEach(([x,y,z,r],i)=>g.add(mesh(new THREE.IcosahedronGeometry(r,1),i%2?l1:l2,x,y,z)));const ol=M(0x3B2A4A);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.add(mesh(new THREE.SphereGeometry(.045,6,6),ol,Math.cos(a)*.47,.92+(i%3)*.15,Math.sin(a)*.47));}g.add(mesh(new THREE.CylinderGeometry(.5,.55,.06,20),M(0x8A5D36),0,.03,0));return g;},
  tri(){const g=new THREE.Group();g.add(mesh(new THREE.BoxGeometry(1.65,.06,.62),M(0xBFC6CC),0,.03,0));[0x3A9BD0,0x9AA4AD,0xC8955A,0x6E8B3D].forEach((c,i)=>{const x=-.57+i*.38;g.add(mesh(new THREE.BoxGeometry(.32,.55,.4),M(c),x,.335,0));g.add(mesh(new THREE.BoxGeometry(.35,.06,.43),M(new THREE.Color(c).multiplyScalar(.72)),x,.64,0));g.add(mesh(new THREE.BoxGeometry(.14,.03,.02),M(0xffffff),x,.45,.205));});g.add(mesh(new THREE.CylinderGeometry(.03,.03,.75,8),M(DK),.9,.5,0));const s=mesh(new THREE.CylinderGeometry(.19,.19,.03,20),M(0x2E9E5B),.9,.98,0);s.rotation.x=Math.PI/2;g.add(s);return g;},
  cendrier(){const g=new THREE.Group();g.add(mesh(new THREE.CylinderGeometry(.04,.04,.6,8),M(0x3B4549),0,.3,0));g.add(mesh(new THREE.CylinderGeometry(.2,.17,.5,16),M(0x5E6B70,{metalness:.5,roughness:.4}),0,.8,0));g.add(mesh(new THREE.CylinderGeometry(.21,.21,.06,16),M(0xE89A3C),0,1.07,0));g.add(mesh(new THREE.CylinderGeometry(.22,.26,.06,16),M(0x3B4549),0,.03,0));return g;}
};

/* décor */
Z.buildHouse=function(h,dome,flowers){const g=new THREE.Group();const wh=M(0xF7F5EE,{roughness:.9}),bl=M(0x1F6FB2,{roughness:.5});
  g.add(mesh(new THREE.BoxGeometry(1.5,h,1.5),wh,0,h/2,0));g.add(mesh(new THREE.BoxGeometry(1.58,.1,1.58),wh,0,h+.05,0));
  g.add(mesh(new THREE.BoxGeometry(.4,.66,.05),bl,0,.33,.76));g.add(mesh(new THREE.BoxGeometry(.48,.06,.06),M(0xE9E2CF),0,.69,.77));
  [-.5,.5].forEach(x=>{g.add(mesh(new THREE.BoxGeometry(.26,.3,.04),bl,x,h-.42,.76));g.add(mesh(new THREE.BoxGeometry(.04,.3,.26),bl,.76*(x>0?1:-1),h-.42,0));});
  if(dome)g.add(mesh(new THREE.SphereGeometry(.42,20,12,0,Math.PI*2,0,Math.PI/2),wh,.25,h+.1,-.25));
  if(flowers){const pk=M(0xE0457B,{flatShading:true});[[-.62,.95,.8,.2],[-.5,1.15,.82,.15],[-.72,1.2,.7,.14]].forEach(([x,y,z,r])=>g.add(mesh(new THREE.IcosahedronGeometry(r,0),pk,x,y,z)));g.add(mesh(new THREE.BoxGeometry(.04,.9,.04),M(0x6B4A2A),-.62,.45,.78));}
  return g;};
Z.buildPalm=function(h){const g=new THREE.Group();const tr=M(0x9A7046,{flatShading:true});for(let i=0;i<5;i++)g.add(mesh(new THREE.CylinderGeometry(.09,.12,h/5,7),tr,Math.sin(i*.35)*.12,i*h/5+h/10,0));
  const lf=M(0x4E9A3E,{flatShading:true,side:THREE.DoubleSide});for(let i=0;i<7;i++){const p=new THREE.Group();p.position.set(Math.sin(4*.35)*.12,h,0);p.rotation.y=i/7*Math.PI*2;const l=mesh(new THREE.ConeGeometry(.16,1.1,4),lf,0,0,.5);l.rotation.x=Math.PI/2+.5;l.scale.set(1,1,.25);p.add(l);g.add(p);}return g;};
Z.makeLabel=function(text,bg){const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.beginPath();x.arc(64,64,54,0,Math.PI*2);x.fill();x.lineWidth=8;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.font='bold 70px Poppins, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,64,70);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.renderOrder=10;return s;};
Z.buildPile=function(monKey){const g=new THREE.Group();const md=mesh(new THREE.IcosahedronGeometry(.7,1),M(0x8C8577,{flatShading:true,roughness:1}));md.scale.set(1.05,.42,.9);g.add(md);
  const ids=Object.keys(Z.W);for(let i=0;i<8;i++){const w=Z.W[ids[i%ids.length]]();const a=i/8*Math.PI*2;w.position.set(Math.cos(a)*.38*(i%2?1:.6),.22+(i%3)*.06,Math.sin(a)*.32*(i%2?1:.6));w.rotation.set(i,i*1.7,i*.6);w.scale.setScalar(1.1);g.add(w);}
  const mon=Z.buildMonster(monKey);mon.g.scale.setScalar(.38);mon.g.position.set(0,.55,0);g.add(mon.g);
  const lab=Z.makeLabel('!','#E8453C');lab.scale.set(.42,.42,.42);lab.position.set(0,1.45,0);g.add(lab);
  g.userData={kind:'pile',mon:monKey,mini:mon.g,lab};return g;};
Z.gradCanvas=function(top,bot){const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,top);g.addColorStop(1,bot);x.fillStyle=g;x.fillRect(0,0,4,256);return c;};
Z.gradTex=(t,b)=>new THREE.CanvasTexture(Z.gradCanvas(t,b));
})();
