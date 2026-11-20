/* Zebla Monsters — scènes 3D : combat, atelier, ville */
(function(){
'use strict';
const Z=window.Z,$=Z.$,V3=Z.V3,M=Z.M,mesh=Z.mesh;
const canvas=$('#c3d');
let renderer=null;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;}catch(e){console.warn('WebGL indisponible',e);}
Z.has3D=!!renderer;
let T=0;

/* tweens & particules */
const tweens=[];
function tween(d,fn,done,ease){tweens.push({t:0,d,fn,done,ease:ease||(k=>k)});}
const easeOut=k=>1-Math.pow(1-k,3);
const elastic=k=>k===0||k===1?k:Math.pow(2,-10*k)*Math.sin((k*10-.75)*2*Math.PI/3)+1;
function updTweens(dt){for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];w.t+=dt;const k=Math.min(w.t/w.d,1);try{w.fn(w.ease(k));}catch(e){}if(k>=1){tweens.splice(i,1);w.done&&w.done();}}}
const parts=[];const pGeo=new THREE.BoxGeometry(.08,.08,.08),pSph=new THREE.SphereGeometry(.07,8,6);
function burst(scene,pos,color,n,speed,o){o=o||{};for(let i=0;i<n;i++){const mat=new THREE.MeshBasicMaterial({color,transparent:true});const m=new THREE.Mesh(o.sphere?pSph:pGeo,mat);m.position.copy(pos);m.scale.setScalar((o.size||1)*(0.6+Math.random()*.8));scene.add(m);
  const v=V3(Math.random()-.5,Math.random()*(o.up===undefined?.9:o.up)+(o.upBias||.2),Math.random()-.5).normalize().multiplyScalar(speed*(.5+Math.random()*.7));
  parts.push({m,scene,v,life:o.life||(.7+Math.random()*.5),age:0,g:o.g===undefined?6:o.g,target:o.target||null,delay:o.delay||0,onArrive:o.onArrive,spin:Math.random()*8});}}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.age+=dt;
  if(p.target&&p.age>p.delay){p.m.position.lerp(p.target,Math.min(1,dt*7));if(p.m.position.distanceTo(p.target)<.2){p.scene.remove(p.m);parts.splice(i,1);p.onArrive&&p.onArrive();continue;}}
  else{p.v.y-=p.g*dt;p.m.position.addScaledVector(p.v,dt);p.v.multiplyScalar(.985);}
  p.m.rotation.x+=p.spin*dt;p.m.rotation.y+=p.spin*dt;
  if(!p.target){const k=p.age/p.life;p.m.material.opacity=1-k;if(k>=1){p.scene.remove(p.m);parts.splice(i,1);}}}}
function addLights(scene,sh){scene.add(new THREE.HemisphereLight(0xffffff,0x8d7b62,.75));const d=new THREE.DirectionalLight(0xffffff,.85);d.position.set(5,9,6);d.castShadow=true;d.shadow.mapSize.set(1024,1024);const s=sh||7;Object.assign(d.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:1,far:40});scene.add(d);scene.add(new THREE.AmbientLight(0xffffff,.15));return d;}
function toScreen(v,cam){const p=v.clone().project(cam);return{x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};}
function screenToWorld(el,cam,dist){const r=el.getBoundingClientRect();const x=((r.left+r.width/2)/innerWidth)*2-1,y=-((r.top+r.height/2)/innerHeight)*2+1;const v=V3(x,y,.5).unproject(cam);const dir=v.sub(cam.position).normalize();return cam.position.clone().add(dir.multiplyScalar(dist));}
let shakeT=0;function shake(t){shakeT=Math.max(shakeT,t);}
const SC={};Z._cam=n=>SC[n]&&SC[n].camera;

/* ===================== COMBAT ===================== */
(function(){const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,200);s.background=Z.gradTex('#8FD0F2','#FFE3C4');s.fog=new THREE.Fog(0xFFE3C4,14,32);addLights(s,6);
  s.add(mesh(new THREE.CylinderGeometry(4.2,4.6,.4,48),M(0xE9D3A8,{roughness:1}),0,-.2,0));
  const ring=mesh(new THREE.RingGeometry(1.4,1.6,48),M(0xD9BF8E,{roughness:1}),0,.01,0);ring.rotation.x=-Math.PI/2;s.add(ring);
  const fl=mesh(new THREE.PlaneGeometry(80,80),M(0xEFD9AE,{roughness:1}),0,-.35,0);fl.rotation.x=-Math.PI/2;s.add(fl);
  [[-5.5,-8,2.2,true,false],[-3.2,-9.5,1.6,false,true],[-.6,-10,2.8,true,false],[2.2,-9,1.8,false,true],[4.8,-8.5,2.4,true,false],[7,-10,1.7,false,false],[-7.5,-10,2,false,true]].forEach(([x,z,h,d,f])=>{const hs=Z.buildHouse(h,d,f);hs.position.set(x,-.35,z);hs.scale.setScalar(1.6);s.add(hs);});
  [[-4.3,-4.5,3],[4.4,-5,3.4],[-6.5,-6,2.6]].forEach(([x,z,h])=>{const p=Z.buildPalm(h);p.position.set(x,-.35,z);s.add(p);});
  SC.battle={scene:s,camera:cam,setup(){const a=cam.aspect;cam.fov=a<.75?62:48;cam.position.set(0,2.15,a<.75?6.6:6.2);cam.lookAt(0,1.25,0);cam.updateProjectionMatrix();}};})();

let B=null;const WAIT=6;
function later(ms,fn){const id=B&&B.id;setTimeout(()=>{if(B&&B.id===id)fn();},ms);}
function updateHP(){const k=Math.max(0,B.hp)/B.max;$('#hpFill').style.width=(k*100)+'%';$('#hpTxt').textContent=Math.max(0,Math.round(B.hp))+'/'+B.max;$('#bName').textContent=(B.legendary?'👑 ':'')+Z.MONS[B.key].name+(B.legendary?' légendaire':'');}
function renderLoot(){$('#loot').innerHTML=Z.MKEYS.filter(k=>B.loot[k]).map(k=>`<div class="chip"><i class="dot" style="background:${Z.MAT[k].color}"></i>+${B.loot[k]}</div>`).join('')+(B&&Object.values(B.loot).some(v=>v)?'<div class="chip">🎒</div>':'');}
Z.Battle={
  start(o){const s=SC.battle.scene;if(B){if(B.mon)s.remove(B.mon.g);if(B.item)s.remove(B.item.m);}
    const def=Z.MONS[o.key];const mon=Z.buildMonster(o.key,o.legendary);mon.g.position.set(0,7,0);s.add(mon.g);
    const hp=o.legendary?220:def.hp;const sc=o.legendary?1.3:1;
    B={key:o.key,def,mon,hp,max:hp,combo:0,mistakes:0,item:null,phase:'intro',scale:sc,base:sc,cur:sc,o,legendary:!!o.legendary,flash:0,knock:0,throwT:0,id:Math.random(),smokeT:0,loot:{plast:0,alu:0,pap:0,org:0}};
    updateHP();renderLoot();$('#itemLabel').classList.remove('on');
    tween(.65,k=>{mon.g.position.y=7*(1-k);},()=>{shake(.3);Z.beep('hit');Z.vibrate(40);burst(s,V3(0,.1,0),0xD9BF8E,22,3,{up:.4});B.phase='fight';later(650,throwNext);},k=>k*k);},
  flee(){if(!B)return;const s=SC.battle.scene;if(B.mon)s.remove(B.mon.g);if(B.item)s.remove(B.item.m);B=null;},
  get(){return B;}
};
function pickWaste(){const own=B.def.mat?Z.WASTE.filter(w=>w.mat===B.def.mat):[];if(own.length&&Math.random()<.45)return own[Math.floor(Math.random()*own.length)];return Z.WASTE[Math.floor(Math.random()*Z.WASTE.length)];}
function throwNext(){if(!B||B.phase!=='fight')return;const w=pickWaste();const m=Z.W[w.id]();m.scale.setScalar(1.15);const from=B.mon.mouth.clone().multiplyScalar(B.cur);m.position.copy(from);SC.battle.scene.add(m);
  B.item={w,m,state:'fly',t:0,from,to:V3(0,1.0,3.1),wait:0};B.throwT=.5;$('#itemName').textContent=w.name;$('#itemLabel').classList.add('on');$('#timerFill').style.width='100%';Z.beep('throw');}
function sortTo(mk,btn){if(!B||B.phase!=='fight'||!B.item||(B.item.state!=='fly'&&B.item.state!=='wait'))return;
  const it=B.item;it.state='sorted';B.item=null;$('#itemLabel').classList.remove('on');const cam=SC.battle.camera;const target=screenToWorld(btn,cam,2.4);const from=it.m.position.clone();const ok=it.w.mat===mk;
  tween(.28,k=>{it.m.position.lerpVectors(from,target,k);it.m.scale.setScalar(1.15*(1-k*.6));it.m.rotation.y+=.3;},()=>{
    if(!B)return;
    if(ok){SC.battle.scene.remove(it.m);const kept=Z.onSorted(mk);if(kept){B.loot[mk]++;renderLoot();}Z.floatEl(btn,kept?'+1 '+Z.MAT[mk].name:'Sac plein !',kept?Z.MAT[mk].color:'#B3261E');btn.classList.remove('okf');void btn.offsetWidth;btn.classList.add('okf');B.combo++;Z.beep('ok');projectile(target,mk);}
    else{B.combo=0;B.mistakes++;Z.onWrong(it.w);Z.beep('bad');Z.vibrate([30,40,30]);btn.classList.remove('badf');void btn.offsetWidth;btn.classList.add('badf');shake(.25);
      Z.toast(`❌ ${it.w.name} → bac <b>${Z.MAT[it.w.mat].bin}</b>. Le monstre l'avale !`,2400);
      const to=B.mon.mouth.clone().multiplyScalar(B.cur);const f2=it.m.position.clone();
      tween(.45,k=>{it.m.position.lerpVectors(f2,to,k);it.m.position.y+=Math.sin(Math.PI*k)*.8;it.m.scale.setScalar(.7*(1-k*.8));},()=>{SC.battle.scene.remove(it.m);if(!B||B.phase!=='fight')return;
        B.scale=Math.min(B.scale*1.1,B.base*1.5);B.hp=Math.min(B.max,B.hp+15);updateHP();burst(SC.battle.scene,to,0x7d3cff,14,2.2);floatScreen(V3(0,2.4*B.cur,0),'+15 ❤','#7d3cff');later(900,throwNext);});}});}
function floatScreen(v,txt,col){const p=toScreen(v,SC.battle.camera);Z.floatAt(p.x,p.y,txt,col);}
function projectile(from,mk){const s=SC.battle.scene;const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),new THREE.MeshBasicMaterial({color:0xffffff})));g.add(new THREE.Mesh(new THREE.SphereGeometry(.26,16,12),new THREE.MeshBasicMaterial({color:Z.MAT[mk].hex,transparent:true,opacity:.55})));g.position.copy(from);s.add(g);
  const to=V3(0,1.15*B.cur,.2);let lastT=0;
  tween(.4,k=>{g.position.lerpVectors(from,to,k);g.position.y+=Math.sin(Math.PI*k)*.9;if(k-lastT>.08){lastT=k;burst(s,g.position,Z.MAT[mk].hex,2,.6,{g:0,life:.35});}},()=>{s.remove(g);hit(mk);});}
function hit(mk){if(!B||B.phase!=='fight')return;const s=SC.battle.scene;const dmg=18+Math.min(B.combo-1,5)*4;B.hp-=dmg;B.flash=.18;B.knock=.45;shake(.15);Z.beep('hit');Z.vibrate(25);
  burst(s,V3(0,1.2*B.cur,.6),Z.MAT[mk].hex,18,4);burst(s,V3(0,1.2*B.cur,.6),0xffffff,8,3,{sphere:true});floatScreen(V3(.5,2.3*B.cur,0),'-'+dmg,'#E8453C');
  if(B.combo>=3){const c=$('#combo');c.textContent='COMBO x'+B.combo+' !';c.classList.add('on');setTimeout(()=>c.classList.remove('on'),700);}
  updateHP();if(B.hp<=0)win();else later(420,throwNext);}
function win(){B.phase='won';$('#itemLabel').classList.remove('on');const mon=B.mon,def=B.def,s=SC.battle.scene,cur=B.cur,bb=B;Z.beep('win');Z.vibrate([60,40,120]);
  tween(1.0,k=>{mon.g.rotation.y=k*k*16;mon.g.scale.setScalar(cur*(1-k*.9));mon.g.position.y=k*.9;},()=>{s.remove(mon.g);const pos=V3(0,1.3,0);
    burst(s,pos,0xFFC94A,30,5,{sphere:true});burst(s,pos,0xffffff,16,4);
    if(def.mat){const tgt=screenToWorld($('#loot'),SC.battle.camera,4);for(let i=0;i<8;i++)burst(s,pos,Z.MAT[def.mat].hex,1,4.5,{target:tgt,delay:.35+i*.05,size:1.6});}
    setTimeout(()=>{if(B===bb)Z.onBattleWin({key:bb.key,legendary:bb.legendary,perfect:bb.mistakes===0,loot:bb.loot,o:bb.o});},1300);});}
Z.Battle.sortTo=sortTo;

/* ===================== ATELIER ===================== */
const AT={};
(function(){const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,200);s.background=Z.gradTex('#BFE3CC','#E9EFE6');s.fog=new THREE.Fog(0xE9EFE6,20,45);addLights(s,7);
  const fl=mesh(new THREE.PlaneGeometry(60,60),M(0xA7B3A4,{roughness:1}),0,0,0);fl.rotation.x=-Math.PI/2;s.add(fl);
  s.add(mesh(new THREE.BoxGeometry(8.6,.12,3.2),M(0x8E9A92,{roughness:.9}),0,.06,0));
  const cv=new THREE.Group();const bc=document.createElement('canvas');bc.width=64;bc.height=16;const bx=bc.getContext('2d');bx.fillStyle='#2b2f31';bx.fillRect(0,0,64,16);bx.fillStyle='#3f4548';for(let i=0;i<64;i+=16)bx.fillRect(i,0,7,16);
  const beltT=new THREE.CanvasTexture(bc);beltT.wrapS=beltT.wrapT=THREE.RepeatWrapping;beltT.repeat.set(6,1);
  cv.add(mesh(new THREE.BoxGeometry(3.4,.12,.9),new THREE.MeshStandardMaterial({map:beltT,roughness:.8}),0,.75,0));
  [.5,-.5].forEach(z=>cv.add(mesh(new THREE.BoxGeometry(3.5,.14,.12),M(0x9AA4AD,{metalness:.6,roughness:.35}),0,.76,z)));
  [-1.5,1.5].forEach(x=>[-.4,.4].forEach(z=>cv.add(mesh(new THREE.BoxGeometry(.1,.7,.1),M(0x5E6B70),x,.35,z))));cv.position.set(-2.4,0,0);cv.scale.x=.85;s.add(cv);
  const mc=new THREE.Group();mc.add(mesh(new THREE.BoxGeometry(1.9,1.9,1.6),M(0x2E9E5B,{roughness:.45,metalness:.1}),0,1.07,0));
  mc.add(mesh(new THREE.BoxGeometry(2,.14,1.7),M(0x16302B),0,.12,0));mc.add(mesh(new THREE.BoxGeometry(2.0,.12,1.7),M(0x237A47),0,2.07,0));
  const hop=mesh(new THREE.CylinderGeometry(.55,.3,.5,4,1,true),M(0x9AA4AD,{metalness:.6,roughness:.35,side:THREE.DoubleSide}),0,2.38,0);hop.rotation.y=Math.PI/4;mc.add(hop);
  mc.add(mesh(new THREE.CylinderGeometry(.14,.16,.9,12),M(0x5E6B70,{metalness:.4}),.6,2.55,-.45));
  const glowMat=new THREE.MeshStandardMaterial({color:0x111a17,emissive:0x2E9E5B,emissiveIntensity:.2,roughness:.2});mc.add(mesh(new THREE.BoxGeometry(1.0,.55,.04),glowMat,0,1.35,.81));
  const gm=M(0xFFC94A,{metalness:.5,roughness:.35});const gears=[];
  [[-.52,.62],[.52,.62]].forEach(([x,y])=>{const gg=new THREE.Group();gg.position.set(x,y,.82);const c=mesh(new THREE.CylinderGeometry(.22,.22,.08,16),gm);c.rotation.x=Math.PI/2;gg.add(c);for(let i=0;i<8;i++){const t=mesh(new THREE.BoxGeometry(.09,.1,.08),gm);const a=i/8*Math.PI*2;t.position.set(Math.cos(a)*.26,Math.sin(a)*.26,0);t.rotation.z=a;gg.add(t);}mc.add(gg);gears.push(gg);});
  const sc=document.createElement('canvas');sc.width=256;sc.height=64;const sx=sc.getContext('2d');sx.fillStyle='#16302B';sx.fillRect(0,0,256,64);sx.fillStyle='#FFC94A';sx.font='bold 34px Poppins, sans-serif';sx.textAlign='center';sx.textBaseline='middle';sx.fillText('ZEBLA LAB',128,34);
  mc.add(mesh(new THREE.BoxGeometry(1.3,.32,.03),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(sc)}),0,1.85,.81));s.add(mc);
  const plat=new THREE.Group();plat.add(mesh(new THREE.CylinderGeometry(1,1.05,.3,40),M(0xffffff,{roughness:.4}),0,.27,0));const pr=mesh(new THREE.TorusGeometry(1.0,.04,8,48),new THREE.MeshStandardMaterial({color:0xFFC94A,emissive:0xFFC94A,emissiveIntensity:.6}),0,.43,0);pr.rotation.x=Math.PI/2;plat.add(pr);plat.position.set(2.5,0,0);plat.scale.setScalar(.9);s.add(plat);
  const ch=mesh(new THREE.BoxGeometry(.7,.08,.7),M(0x9AA4AD,{metalness:.6,roughness:.35}),1.25,.62,0);ch.rotation.z=-.25;s.add(ch);
  [0x3A9BD0,0x9AA4AD,0xC8955A,0x6E8B3D].forEach((c,i)=>s.add(mesh(new THREE.BoxGeometry(.4,.62,.4),M(c),-3.6+i*.5,.43,-1.35)));
  Object.assign(AT,{beltT,mc,gears,glowMat,display:null,running:null,ring:pr});
  SC.atelier={scene:s,camera:cam,setup(){const a=cam.aspect;cam.fov=a<.75?60:46;cam.position.set(0,a<.75?5.2:3.6,a<.75?13:8.2);cam.lookAt(0,a<.75?1.6:1.0,0);cam.updateProjectionMatrix();}};})();
let crafting=false;
Z.Atelier={busy:()=>crafting,
  craft(r,onDone){if(crafting)return false;crafting=true;Z.beep('craft');const s=SC.atelier.scene;
    if(AT.display){const d=AT.display;AT.display=null;tween(.3,k=>d.scale.setScalar(Math.max(.001,d.userData.sc*(1-k))),()=>s.remove(d));}
    Z.setSteps(r,0);
    for(let i=0;i<6;i++)setTimeout(()=>{const id=r.input[i%r.input.length];const m=Z.W[id]();m.scale.setScalar(1.5);m.position.set(-3.7,.95,(Math.random()-.5)*.4);s.add(m);
      tween(1.0,k=>{m.position.x=-3.7+2.6*k;m.rotation.y=k*2;},()=>{const f=m.position.clone();tween(.35,k=>{m.position.set(f.x*(1-k),f.y+(2.55-f.y)*k+Math.sin(Math.PI*k)*.7,f.z*(1-k));m.scale.setScalar(1.5*(1-k*.7));},()=>{s.remove(m);burst(s,V3(0,2.5,0),r.glow,4,1.5,{up:.6});});});},i*170);
    setTimeout(()=>{AT.running={r,t:0};Z.setSteps(r,1);},1500);setTimeout(()=>Z.setSteps(r,2),2300);setTimeout(()=>Z.setSteps(r,3),3100);
    setTimeout(()=>{AT.running=null;Z.setSteps(r,4);const o=Z.BUILD[r.id]();const sc=r.id==='tri'||r.id==='velo'?.95:1.15;o.userData.sc=sc;o.position.set(2.5,.42,0);o.scale.setScalar(.001);s.add(o);AT.display=o;
      burst(s,V3(1.3,.9,0),r.glow,16,2.5);tween(.9,k=>o.scale.setScalar(Math.max(.001,elastic(k)*sc)));burst(s,V3(2.5,1.2,0),0xFFC94A,26,3.5,{sphere:true});Z.beep('win');Z.vibrate(60);
      crafting=false;onDone&&onDone();},3900);return true;}};

/* ===================== VILLE ===================== */
const CITY={angle:Math.PI/4,plots:[],piles:[],pick:[],residents:[],flies:[],sel:null,tileM:new THREE.MeshStandardMaterial({color:0xC9B48C,roughness:1})};
Z.CITY=CITY;
(function(){const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,200);const skyC=Z.gradCanvas('#9C9A92','#C9BFA8');const skyT=new THREE.CanvasTexture(skyC);s.background=skyT;s.fog=new THREE.Fog(0xC9BFA8,16,34);
  const sun=addLights(s,9);s.children.forEach(l=>{if(l.isHemisphereLight)l.intensity=.55;});sun.intensity=.75;
  const ground=mesh(new THREE.PlaneGeometry(120,120),M(0xB9A988,{roughness:1}),0,-.42,0);ground.rotation.x=-Math.PI/2;s.add(ground);
  const baseM=M(0xB8AC92,{roughness:1});s.add(mesh(new THREE.BoxGeometry(11.4,.4,11.4),baseM,0,-.2,0));
  const roadM=M(0x8F8A80,{roughness:1});s.add(mesh(new THREE.BoxGeometry(11.4,.03,1.4),roadM,0,.01,0));s.add(mesh(new THREE.BoxGeometry(1.4,.03,11.4),roadM,0,.012,0));
  for(let i=-5;i<=5;i++){if(Math.abs(i)<1)continue;s.add(mesh(new THREE.BoxGeometry(.4,.035,.06),M(0xF2EEE4),i,.02,0));s.add(mesh(new THREE.BoxGeometry(.06,.035,.4),M(0xF2EEE4),0,.022,i));}
  s.add(mesh(new THREE.CylinderGeometry(.62,.68,.25,28),M(0xF7F5EE),0,.12,0));const water=mesh(new THREE.CylinderGeometry(.52,.52,.04,28),new THREE.MeshStandardMaterial({color:0x3A9BD0,roughness:.1,metalness:.2,emissive:0x1F6FB2,emissiveIntensity:.25}),0,.24,0);s.add(water);s.add(mesh(new THREE.CylinderGeometry(.08,.1,.5,10),M(0x1F6FB2),0,.4,0));
  const cells=[];[-1,1].forEach(sx=>[-1,1].forEach(sz=>[1.6,3.8].forEach(a=>[1.6,3.8].forEach(b=>cells.push({x:sx*a,z:sz*b,sx,sz,a,b})))));
  const isHouse=c=>(c.a===3.8&&c.b===3.8)||(c.a===3.8&&c.b===1.6&&c.sx===c.sz)||(c.a===1.6&&c.b===3.8&&c.sx===-1&&c.sz===1);
  let hi=0;
  cells.forEach(c=>{if(isHouse(c)){const hs=Z.buildHouse(1.1+((hi*37)%5)*.22,hi%2===0,hi%3===1);hs.position.set(c.x,0,c.z);hs.rotation.y=(Math.abs(c.z)>=Math.abs(c.x)?(c.sz>0?Math.PI:0):(c.sx>0?-Math.PI/2:Math.PI/2));s.add(hs);hi++;}
    else{s.add(mesh(new THREE.BoxGeometry(1.6,.05,1.6),M(0xB49F7A,{roughness:1}),c.x,.03,c.z));const tile=mesh(new THREE.BoxGeometry(1.4,.052,1.4),CITY.tileM,c.x,.031,c.z);s.add(tile);
      const ring=mesh(new THREE.RingGeometry(.55,.7,32),new THREE.MeshBasicMaterial({color:0xFFC94A,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),c.x,.09,c.z);ring.rotation.x=-Math.PI/2;ring.castShadow=false;s.add(ring);
      const plot={x:c.x,z:c.z,ring,content:null,obj:null,idx:CITY.plots.length};tile.userData={kind:'plot',plot};CITY.pick.push(tile);CITY.plots.push(plot);}});
  [[-5,-1],[5,1],[-1,5],[1,-5],[5,-5],[-5,5]].forEach(([x,z],i)=>{const p=Z.buildPalm(1.8+(i%3)*.4);p.position.set(x,0,z);p.scale.setScalar(.8);s.add(p);});
  Object.assign(CITY,{scene:s,skyC,skyT,baseM,ground,water});
  SC.ville={scene:s,camera:cam,setup(){const a=cam.aspect;cam.fov=a<.75?58:42;cam.updateProjectionMatrix();CITY.placeCam();}};
  CITY.placeCam=function(){const a=cam.aspect;const r=a<.75?14.5:13,h=a<.75?12.5:9.5;cam.position.set(Math.cos(CITY.angle)*r,h,Math.sin(CITY.angle)*r);cam.lookAt(0,a<.75?-.6:0,0);};})();
const PILE_PLOTS=[0,2,4,6,8],PILE_MONS=['canettor','plastikor','kartouna','compostix','megotine'];
function lerpHex(a,b,t){return '#'+new THREE.Color(a).lerp(new THREE.Color(b),t).getHexString();}
Z.Ville={
  build(){const S=Z.S,s=CITY.scene;
    PILE_PLOTS.forEach((pi,i)=>{if(S.city.cleaned.includes(i))return;const p=CITY.plots[pi];const pile=Z.buildPile(PILE_MONS[i]);pile.position.set(p.x,.05,p.z);pile.userData.plot=p;pile.userData.idx=i;s.add(pile);p.content='pile';p.obj=pile;CITY.piles.push(pile);CITY.pick.push(pile);
      for(let f=0;f<3;f++){const fly=mesh(new THREE.SphereGeometry(.035,6,6),M(0x111111));fly.castShadow=false;s.add(fly);CITY.flies.push({m:fly,pile,ph:f*2.1+i});}});
    S.city.placed.forEach(pl=>{const p=CITY.plots[pl.plot];if(!p||p.content)return;const o=Z.BUILD[pl.item]();o.position.set(p.x,.06,p.z);o.rotation.y=pl.rot||0;s.add(o);p.content='item';p.obj=o;o.userData={kind:'placed',item:pl.item};CITY.pick.push(o);});
    Z.Ville.look();},
  look(){const sc=Z.S.sc;['prop','air','vie'].forEach(k=>{sc[k]=Math.max(0,Math.min(100,Math.round(sc[k])));});
    const tot=Z.cityScore();const t=Math.min(1,tot/85);const top=lerpHex(0x9C9A92,0x5FB8EC,t),bot=lerpHex(0xC9BFA8,0xDDF1FB,t);
    const x=CITY.skyC.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,top);g.addColorStop(1,bot);x.fillStyle=g;x.fillRect(0,0,4,256);CITY.skyT.needsUpdate=true;
    CITY.scene.fog.color.set(bot);CITY.scene.fog.near=16+t*14;CITY.scene.fog.far=34+t*40;CITY.baseM.color.set(lerpHex(0xB8AC92,0xE2D6BC,t));CITY.ground.material.color.set(lerpHex(0xA89A7C,0xA8C98A,t));CITY.tileM.color.set(lerpHex(0xC9B48C,0x9CC77A,t));
    const want=Math.min(14,Math.round(sc.vie/9));while(CITY.residents.length<want)addResident();return tot;},
  cleanPile(idx){const pile=CITY.piles.find(p=>p.userData.idx===idx);if(!pile)return;const p=pile.userData.plot;CITY.piles=CITY.piles.filter(x=>x!==pile);CITY.pick=CITY.pick.filter(x=>x!==pile);p.content=null;p.obj=null;
    CITY.flies.filter(f=>f.pile===pile).forEach(f=>CITY.scene.remove(f.m));CITY.flies=CITY.flies.filter(f=>f.pile!==pile);
    setTimeout(()=>tween(.6,k=>{pile.scale.setScalar(Math.max(.001,1-k));pile.rotation.y=k*4;},()=>{CITY.scene.remove(pile);burst(CITY.scene,V3(p.x,.5,p.z),0xFFC94A,20,3,{sphere:true});}),500);},
  place(plot,k){const o=Z.BUILD[k]();const rot=Math.round(Math.random()*4)*Math.PI/2;o.position.set(plot.x,.06,plot.z);o.rotation.y=rot;o.scale.setScalar(.001);CITY.scene.add(o);plot.content='item';plot.obj=o;o.userData={kind:'placed',item:k};CITY.pick.push(o);
    tween(.8,kk=>o.scale.setScalar(Math.max(.001,elastic(kk))));burst(CITY.scene,V3(plot.x,.4,plot.z),0xFFC94A,18,2.8,{sphere:true});burst(CITY.scene,V3(plot.x,.3,plot.z),0x2E9E5B,12,2);Z.beep('place');
    const p=toScreen(V3(plot.x,1.2,plot.z),SC.ville.camera);Z.floatAt(p.x,p.y,Z.ITEMS[k].effTxt,'#1F7A44');return rot;},
  pick(cx,cy){const ray=new THREE.Raycaster();ray.setFromCamera({x:cx/innerWidth*2-1,y:-(cy/innerHeight)*2+1},SC.ville.camera);const hits=ray.intersectObjects(CITY.pick,true);
    for(const h of hits){let o=h.object;while(o&&!(o.userData&&o.userData.kind))o=o.parent;if(!o)continue;const u=o.userData;
      if(u.kind==='pile')return{kind:'pile',idx:u.idx,mon:u.mon};if(u.kind==='plot'){if(u.plot.content)continue;return{kind:'plot',plot:u.plot};}if(u.kind==='placed')return{kind:'placed',item:u.item};}return null;}
};
function addResident(){const g=new THREE.Group();const cols=[0xE8453C,0x3A9BD0,0xF07A2A,0x2E9E5B,0x8E5BC2,0xFFC94A];g.add(mesh(new THREE.CylinderGeometry(.09,.12,.32,10),M(cols[CITY.residents.length%cols.length]),0,.2,0));g.add(mesh(new THREE.SphereGeometry(.09,10,8),M(0xC68E5E),0,.44,0));
  const r={g,axis:Math.random()<.5?'x':'z',p:(Math.random()-.5)*9,dir:Math.random()<.5?1:-1,lane:(Math.random()<.5?-1:1)*.45,sp:.6+Math.random()*.5};g.scale.setScalar(.001);CITY.scene.add(g);CITY.residents.push(r);tween(.5,k=>g.scale.setScalar(Math.max(.001,elastic(k))));}

/* ===================== LOOP ===================== */
let active=null,raf=null;const clock=new THREE.Clock();const tmpV=V3(0,0,0);
Z.three={
  show(name){if(!renderer)return;active=name;canvas.style.display='block';resize();if(!raf){clock.getDelta();raf=requestAnimationFrame(loop);}},
  hide(){active=null;canvas.style.display='none';},
  active:()=>active
};
function resize(){if(!renderer)return;const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);Object.values(SC).forEach(s=>{s.camera.aspect=w/h;s.setup();});}
window.addEventListener('resize',resize);
function update(dt){T+=dt;updTweens(dt);updParts(dt);
  if(active==='battle'&&B&&B.mon){const g=B.mon.g;if(B.phase!=='won'){B.cur+=(B.scale-B.cur)*Math.min(1,dt*6);const sq=1+Math.sin(T*4.4)*.035;g.scale.set(B.cur/Math.sqrt(sq),B.cur*sq,B.cur/Math.sqrt(sq));
      if(B.phase==='fight')g.position.y=Math.abs(Math.sin(T*2.2))*.12;g.position.z=-B.knock;B.knock*=Math.pow(.02,dt);g.rotation.x=B.throwT*.55;B.throwT=Math.max(0,B.throwT-dt*1.6);g.rotation.y=Math.sin(T*.9)*.18;
      B.mon.arms[0].rotation.z=-.6-Math.sin(T*3)*.3-B.throwT;B.mon.arms[1].rotation.z=.6+Math.sin(T*3+1)*.3+B.throwT;
      if(B.mon.crown)B.mon.crown.rotation.y+=dt;
      const fl=B.flash>0;B.mon.mats.forEach(m=>{m.emissive.setHex(fl?0xffffff:0x000000);m.emissiveIntensity=fl?.7:0;});B.flash-=dt;
      if(B.mon.smoke){B.smokeT-=dt;if(B.smokeT<=0){B.smokeT=.12;tmpV.copy(B.mon.smoke).multiplyScalar(B.cur);tmpV.y+=g.position.y;burst(SC.battle.scene,tmpV,0x9AA0A6,1,.6,{g:-1.5,up:1,upBias:.8,life:1.4,sphere:true,size:1.5});}}}
    if(B.item){const it=B.item;if(it.state==='fly'){it.t+=dt/.85;const k=Math.min(it.t,1);it.m.position.lerpVectors(it.from,it.to,easeOut(k));it.m.position.y+=Math.sin(Math.PI*k)*1.1;it.m.rotation.x+=dt*7;it.m.rotation.z+=dt*5;if(k>=1){it.state='wait';it.wait=0;}}
      else if(it.state==='wait'){it.wait+=dt;it.m.position.y=1.0+Math.sin(T*3)*.07;it.m.rotation.y+=dt*1.6;it.m.rotation.x*=.92;it.m.rotation.z*=.92;$('#timerFill').style.width=Math.max(0,(1-it.wait/WAIT)*100)+'%';
        if(it.wait>WAIT){it.state='drop';B.item=null;$('#itemLabel').classList.remove('on');const f=it.m.position.clone();tween(.5,k=>{it.m.position.set(f.x,f.y*(1-k)+.12*k,f.z-k*.6);},()=>{tween(.6,k=>it.m.scale.setScalar(Math.max(.001,1.15*(1-k))),()=>SC.battle.scene.remove(it.m));});
          B.hp=Math.min(B.max,B.hp+10);B.combo=0;updateHP();Z.toast("⏳ Déchet laissé par terre : le monstre récupère de l'énergie !");later(1100,throwNext);}}}}
  if(active==='atelier'){const run=AT.running;AT.beltT.offset.x-=dt*(run?2.4:.6);const gs=run?9:1.2;AT.gears[0].rotation.z+=dt*gs;AT.gears[1].rotation.z-=dt*gs;
    if(run){AT.mc.position.set((Math.random()-.5)*.05,(Math.random()-.5)*.03,0);AT.glowMat.emissive.setHex(run.r.glow);AT.glowMat.emissiveIntensity=1.2+Math.sin(T*18)*.5;
      if(Math.random()<dt*22)burst(SC.atelier.scene,V3((Math.random()-.5)*.6,2.45,(Math.random()-.5)*.6),run.r.glow,1,2.2,{up:1,upBias:.6,life:.8});
      if(Math.random()<dt*8)burst(SC.atelier.scene,V3(.6,3.05,-.45),0xE4F4EA,1,.8,{g:-1.2,up:1,upBias:.9,life:1.6,sphere:true,size:2.2});}
    else{AT.mc.position.set(0,0,0);AT.glowMat.emissive.setHex(0x2E9E5B);AT.glowMat.emissiveIntensity=.25+Math.sin(T*2)*.1;}
    if(AT.display){AT.display.rotation.y+=dt*.8;AT.display.position.y=.42+Math.sin(T*2)*.05;}AT.ring.material.emissiveIntensity=.4+Math.sin(T*3)*.25;}
  if(active==='ville'){CITY.piles.forEach((p,i)=>{const u=p.userData;u.mini.position.y=.55+Math.abs(Math.sin(T*2.5+i))*.18;u.mini.rotation.y=Math.sin(T+i)*.6;u.lab.position.y=1.45+Math.sin(T*3+i)*.08;});
    CITY.flies.forEach(f=>{const p=f.pile.position;const a=T*3+f.ph;f.m.position.set(p.x+Math.cos(a)*.6,p.y+.6+Math.sin(a*1.7)*.2,p.z+Math.sin(a)*.6);});
    const showR=!!CITY.sel;CITY.plots.forEach(p=>{p.ring.material.opacity=showR&&!p.content?.55+Math.sin(T*5)*.35:0;});
    CITY.residents.forEach(r=>{r.p+=r.dir*r.sp*dt;if(r.p>5||r.p<-5){r.dir*=-1;r.p=Math.max(-5,Math.min(5,r.p));}const y=.02+Math.abs(Math.sin(T*8+r.lane*10))*.05;
      if(r.axis==='x'){r.g.position.set(r.p,y,r.lane);r.g.rotation.y=r.dir>0?Math.PI/2:-Math.PI/2;}else{r.g.position.set(r.lane,y,r.p);r.g.rotation.y=r.dir>0?0:Math.PI;}});
    CITY.water.material.emissiveIntensity=.2+Math.sin(T*2)*.08;}}
function loop(){raf=null;if(!active)return;const dt=Math.min(clock.getDelta(),.05);update(dt);const sc=SC[active];const cam=sc.camera;
  let ox=0,oy=0;if(shakeT>0&&active==='battle'){shakeT-=dt;ox=(Math.random()-.5)*.18;oy=(Math.random()-.5)*.12;cam.position.x+=ox;cam.position.y+=oy;}
  renderer.render(sc.scene,cam);if(ox||oy){cam.position.x-=ox;cam.position.y-=oy;}raf=requestAnimationFrame(loop);}
// tweens continue even when hidden (lightweight)
setInterval(()=>{if(!active){updTweens(.1);}},100);
})();
