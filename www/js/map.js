/* Zebla Monsters — carte réelle stylisée, GPS, apparitions, points de collecte */
(function(){
'use strict';
const Z=window.Z,$=Z.$;
const OMT='https://tiles.openfreemap.org/planet';
const PAL={bg:'#EADFC4',res:'#E8D9B9',park:'#8FD16E',grass:'#A6DC82',wood:'#6FBF5A',farm:'#D8E6A2',sand:'#F6E3A6',water:'#4FB8EC',waterLine:'#2E95CC',road:'#FFFFFF',roadCase:'#2F4F46',major:'#FFD25E',sec:'#FFE79A',bld:'#FBF8F0',bld2:'#DDEFF9',aero:'#DCD3BF'};
const W_ROAD=['interpolate',['exponential',1.6],['zoom'],13,['match',['get','class'],['motorway','trunk','primary'],3,'secondary',2.4,['service','track'],.6,1.2],18,['match',['get','class'],['motorway','trunk','primary'],24,'secondary',19,['service','track'],7,13]];
const W_CASE=['interpolate',['exponential',1.6],['zoom'],13,['match',['get','class'],['motorway','trunk','primary'],5,'secondary',4,['service','track'],1.4,2.4],18,['match',['get','class'],['motorway','trunk','primary'],30,'secondary',24,['service','track'],10,17]];
function gameStyle(){return{version:8,light:{anchor:'viewport',color:'#ffffff',intensity:.18,position:[1.2,200,35]},glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',sources:{omt:{type:'vector',url:OMT}},layers:[
  {id:'bg',type:'background',paint:{'background-color':PAL.bg}},
  {id:'landcover',type:'fill',source:'omt','source-layer':'landcover',paint:{'fill-color':['match',['get','class'],'grass',PAL.grass,['wood','forest'],PAL.wood,'farmland',PAL.farm,'sand',PAL.sand,PAL.grass],'fill-opacity':.9}},
  {id:'landuse',type:'fill',source:'omt','source-layer':'landuse',paint:{'fill-color':['match',['get','class'],'residential',PAL.res,'commercial','#F3D9C0','retail','#F3D9C0','industrial','#DCD6CC',['school','university','college'],'#F7E0A8','hospital','#F6CFCF','cemetery','#C9DDB0',['stadium','pitch','playground'],'#B8E39A',PAL.res],'fill-opacity':.85}},
  {id:'park',type:'fill',source:'omt','source-layer':'park',paint:{'fill-color':PAL.park,'fill-outline-color':'#5FAE48'}},
  {id:'aeroway',type:'fill',source:'omt','source-layer':'aeroway',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':PAL.aero}},
  {id:'water',type:'fill',source:'omt','source-layer':'water',paint:{'fill-color':PAL.water}},
  {id:'water-edge',type:'line',source:'omt','source-layer':'water',paint:{'line-color':PAL.waterLine,'line-width':2,'line-opacity':.55}},
  {id:'waterway',type:'line',source:'omt','source-layer':'waterway',paint:{'line-color':PAL.water,'line-width':['interpolate',['linear'],['zoom'],12,1,18,6]}},
  {id:'path',type:'line',source:'omt','source-layer':'transportation',filter:['match',['get','class'],['path','pedestrian'],true,false],paint:{'line-color':'#B07A4A','line-width':2,'line-dasharray':[2,1.5]}},
  {id:'road-case',type:'line',source:'omt','source-layer':'transportation',filter:['match',['get','class'],['motorway','trunk','primary','secondary','tertiary','minor','service','street','track'],true,false],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':PAL.roadCase,'line-width':W_CASE}},
  {id:'road',type:'line',source:'omt','source-layer':'transportation',filter:['match',['get','class'],['motorway','trunk','primary','secondary','tertiary','minor','service','street','track'],true,false],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['match',['get','class'],['motorway','trunk','primary'],PAL.major,'secondary',PAL.sec,PAL.road],'line-width':W_ROAD}},
  {id:'building',type:'fill-extrusion',source:'omt','source-layer':'building',minzoom:14,paint:{'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],6],0,PAL.bld,30,PAL.bld2],'fill-extrusion-height':['coalesce',['get','render_height'],6],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':.93}},
  {id:'poi-q',type:'circle',source:'omt','source-layer':'poi',paint:{'circle-radius':8,'circle-opacity':0,'circle-stroke-opacity':0}},
  {id:'road-label',type:'symbol',source:'omt','source-layer':'transportation_name',minzoom:15,layout:{'symbol-placement':'line','text-field':['coalesce',['get','name:fr'],['get','name:latin'],['get','name']],'text-font':['Noto Sans Regular'],'text-size':11},paint:{'text-color':'#2F4F46','text-halo-color':'#fff','text-halo-width':1.5}},
  {id:'place-label',type:'symbol',source:'omt','source-layer':'place',layout:{'text-field':['coalesce',['get','name:fr'],['get','name:latin'],['get','name']],'text-font':['Noto Sans Bold'],'text-size':['interpolate',['linear'],['zoom'],12,12,16,15]},paint:{'text-color':'#16302B','text-halo-color':'#fff','text-halo-width':2}}
]};}

/* ---- carte de secours générée (sans internet) ---- */
let fbCenter=null;
function fallbackStyle(c){fbCenter={lat:c.lat,lng:c.lng};const mLat=111320,mLng=111320*Math.cos(c.lat*Math.PI/180);const rot=.2,cs=Math.cos(rot),sn=Math.sin(rot);
  const P=(x,y)=>{const X=x*cs-y*sn,Y=x*sn+y*cs;return[c.lng+X/mLng,c.lat+Y/mLat];};
  const r=Z.rng(Z.hash('fb'+c.lat.toFixed(2)+c.lng.toFixed(2)));const roads=[],parks=[],blds=[],sand=[];const S=140,N=6;
  for(let i=-N;i<=N;i++){const cls=i===0?'primary':(i%3===0?'secondary':'minor');roads.push({type:'Feature',properties:{class:cls},geometry:{type:'LineString',coordinates:[P(i*S,-N*S),P(i*S,4.4*S)]}});roads.push({type:'Feature',properties:{class:cls},geometry:{type:'LineString',coordinates:[P(-N*S,i*S),P(N*S,i*S)]}});}
  for(let i=-N;i<N;i++)for(let j=-N;j<4;j++){const x0=i*S+14,y0=j*S+14,x1=(i+1)*S-14,y1=(j+1)*S-14;const q=r();
    if(q<.13){parks.push({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[P(x0,y0),P(x1,y0),P(x1,y1),P(x0,y1),P(x0,y0)]]}});continue;}
    if(q<.18){sand.push({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[P(x0,y0),P(x1,y0),P(x1,y1),P(x0,y1),P(x0,y0)]]}});continue;}
    const nx=2+Math.floor(r()*2),ny=2;const bw=(x1-x0)/nx,bh=(y1-y0)/ny;for(let a=0;a<nx;a++)for(let b=0;b<ny;b++){const g=4+r()*5;const X0=x0+a*bw+g,Y0=y0+b*bh+g,X1=x0+(a+1)*bw-g,Y1=y0+(b+1)*bh-g;blds.push({type:'Feature',properties:{h:6+Math.floor(r()*5)*4},geometry:{type:'Polygon',coordinates:[[P(X0,Y0),P(X1,Y0),P(X1,Y1),P(X0,Y1),P(X0,Y0)]]}});}}
  const wave=[];for(let x=-N*S-300;x<=N*S+300;x+=60)wave.push(P(x,4.5*S+Math.sin(x/90)*20));const water={type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[...wave,P(N*S+300,12*S),P(-N*S-300,12*S),wave[0]]]}};
  const fc=f=>({type:'geojson',data:{type:'FeatureCollection',features:f}});
  return{version:8,light:{anchor:'viewport',color:'#ffffff',intensity:.18,position:[1.2,200,35]},sources:{fw:fc([water]),fp:fc(parks),fs:fc(sand),fr:fc(roads),fb:fc(blds)},layers:[
    {id:'bg',type:'background',paint:{'background-color':PAL.res}},
    {id:'water',type:'fill',source:'fw',paint:{'fill-color':PAL.water}},{id:'water-edge',type:'line',source:'fw',paint:{'line-color':PAL.waterLine,'line-width':3,'line-opacity':.5}},
    {id:'park',type:'fill',source:'fp',paint:{'fill-color':PAL.park,'fill-outline-color':'#5FAE48'}},{id:'sand',type:'fill',source:'fs',paint:{'fill-color':PAL.sand}},
    {id:'road-case',type:'line',source:'fr',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':PAL.roadCase,'line-width':W_CASE}},
    {id:'road',type:'line',source:'fr',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['match',['get','class'],'primary',PAL.major,'secondary',PAL.sec,PAL.road],'line-width':W_ROAD}},
    {id:'building',type:'fill-extrusion',source:'fb',paint:{'fill-extrusion-color':['interpolate',['linear'],['get','h'],0,PAL.bld,26,PAL.bld2],'fill-extrusion-height':['get','h'],'fill-extrusion-opacity':.93}}]};}

/* ---- état carte ---- */
let map=null,mode='game',tilesOK=false,errs=0,follow=true,pitched=true;
let pos=null,heading=null,meMarker=null,watchId=null,walkAnim=null;
const spawnMk={},centreMk={},legMk={},cleanMk={};let spawns=[],centres=[],realCentres=[];
const CELL=0.0011,WIN=20*60*1000;
Z.Map={pos:()=>pos,mode:()=>mode,spawns:()=>spawns,centres:()=>centres};

function circle(c,r){const pts=[];const mLat=111320,mLng=111320*Math.cos(c.lat*Math.PI/180);for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push([c.lng+Math.cos(a)*r/mLng,c.lat+Math.sin(a)*r/mLat]);}return{type:'Feature',geometry:{type:'Polygon',coordinates:[pts]},properties:{}};}
function addOverlays(){if(!map.getSource('me-r')){map.addSource('me-r',{type:'geojson',data:circle(pos||Z.DEMO_POS,Z.RANGE)});
  map.addLayer({id:'me-r-fill',type:'fill',source:'me-r',paint:{'fill-color':'#3A9BD0','fill-opacity':.14}});map.addLayer({id:'me-r-line',type:'line',source:'me-r',paint:{'line-color':'#3A9BD0','line-width':2,'line-dasharray':[2,2],'line-opacity':.8}});}}
function updRadius(){if(map&&map.getSource('me-r')&&pos)map.getSource('me-r').setData(circle(pos,Z.RANGE));}
function useFallback(why){if(mode==='fallback')return;mode='fallback';console.warn('Carte de secours :',why);const c=pos||Z.S.lastPos||Z.DEMO_POS;map.setStyle(fallbackStyle(c));Z.toast('🗺️ Carte hors-ligne générée (tuiles indisponibles)',2600);}

Z.Map.init=function(){const c=Z.S.lastPos||Z.DEMO_POS;
  map=new maplibregl.Map({container:'map',style:navigator.onLine===false?fallbackStyle(c):gameStyle(),center:[c.lng,c.lat],zoom:16.2,pitch:52,bearing:-18,maxPitch:70,attributionControl:false,dragRotate:true,pitchWithRotate:false});
  if(navigator.onLine===false)mode='fallback';
  map.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'© OpenStreetMap · OpenFreeMap'}),'bottom-left');
  map.on('style.load',addOverlays);
  map.on('data',e=>{if(e.dataType==='source'&&e.sourceId==='omt'&&e.tile)tilesOK=true;});
  map.on('error',e=>{errs++;if(mode==='game'&&!tilesOK&&errs>3)useFallback('erreurs réseau');});
  setTimeout(()=>{if(mode==='game'&&!tilesOK)useFallback('délai dépassé');},9000);
  map.on('dragstart',()=>{follow=false;});
  map.on('idle',()=>{if(mode==='game')findCentres();});
  map.on('click',e=>{const t=e.originalEvent&&e.originalEvent.target;if(t&&t.closest&&t.closest('.maplibregl-marker'))return;if(Z.S.demo){walkTo({lat:e.lngLat.lat,lng:e.lngLat.lng});}});
  const el=document.createElement('div');el.className='pl';el.innerHTML='<div class="ring"></div><div class="arrow"></div><div class="core">'+((Z.S.name||'Z')[0]||'Z').toUpperCase()+'</div>';
  meMarker=new maplibregl.Marker({element:el,pitchAlignment:'viewport',rotationAlignment:'viewport'}).setLngLat([c.lng,c.lat]).addTo(map);
  $('#fCenter').onclick=()=>{follow=true;if(pos)map.easeTo({center:[pos.lng,pos.lat],zoom:16.2,duration:600});};
  $('#fTilt').onclick=()=>{pitched=!pitched;map.easeTo({pitch:pitched?52:0,bearing:pitched?-18:0,duration:600});};
  setInterval(()=>{refreshSpawns();refreshLegends();},20000);
  return map;};
Z.Map.resize=()=>map&&map.resize();

/* ---- position ---- */
function setPos(p,h){pos={lat:p.lat,lng:p.lng};if(h!=null&&!isNaN(h))heading=h;Z.S.lastPos=pos;Z.save();
  if(meMarker){meMarker.setLngLat([pos.lng,pos.lat]);const ar=meMarker.getElement().querySelector('.arrow');ar.style.display=heading==null?'none':'block';if(heading!=null)ar.style.transform='rotate('+heading+'deg)';}
  updRadius();if(follow&&map)map.easeTo({center:[pos.lng,pos.lat],duration:500});
  if(mode==='fallback'&&fbCenter&&Z.dist(fbCenter,pos)>650)map.setStyle(fallbackStyle(pos));
  refreshSpawns();refreshCentres();refreshLegends();}
Z.Map.setPos=setPos;
Z.Map.startGPS=function(){Z.Map.stopGPS();if(Z.S.demo){$('#demoBadge').classList.remove('hidden');setPos(Z.S.lastPos||Z.DEMO_POS);return;}
  $('#demoBadge').classList.add('hidden');
  if(!navigator.geolocation){Z.toast('GPS indisponible : passage en mode démo');Z.setDemo(true);return;}
  let first=true;
  watchId=navigator.geolocation.watchPosition(p=>{if(walkAnim)return;setPos({lat:p.coords.latitude,lng:p.coords.longitude},p.coords.heading);if(first){first=false;follow=true;map.jumpTo({center:[pos.lng,pos.lat]});}},
    err=>{console.warn(err);if(first){Z.toast('📍 Position refusée ou indisponible : mode démo activé',3000);Z.setDemo(true);}},{enableHighAccuracy:true,maximumAge:4000,timeout:20000});};
Z.Map.stopGPS=function(){if(watchId!=null&&navigator.geolocation)navigator.geolocation.clearWatch(watchId);watchId=null;};
function walkTo(t,cb){if(!pos){setPos(t);cb&&cb();return;}const from={...pos};const d=Z.dist(from,t);const dur=Math.min(4,Math.max(.6,d/35));const t0=performance.now();follow=true;
  const dx=t.lng-from.lng,dy=t.lat-from.lat;heading=(Math.atan2(dx*Math.cos(from.lat*Math.PI/180),dy)*180/Math.PI+360)%360;
  if(walkAnim)cancelAnimationFrame(walkAnim);
  const step=now=>{const k=Math.min(1,(now-t0)/(dur*1000));pos={lat:from.lat+dy*k,lng:from.lng+dx*k};meMarker.setLngLat([pos.lng,pos.lat]);updRadius();map.setCenter([pos.lng,pos.lat]);
    const ar=meMarker.getElement().querySelector('.arrow');ar.style.display='block';ar.style.transform='rotate('+(heading-map.getBearing())+'deg)';
    if(k<1)walkAnim=requestAnimationFrame(step);else{walkAnim=null;setPos(t);cb&&cb();}};walkAnim=requestAnimationFrame(step);}
Z.Map.walkTo=walkTo;

/* ---- apparitions ---- */
function ctxType(lat,lng,r){const w={canettor:1,plastikor:1,kartouna:1,compostix:1};let ctx='';
  if(map&&mode==='game'&&map.isStyleLoaded()){try{const pt=map.project([lng,lat]);const cv=map.getCanvas();if(pt.x>0&&pt.y>0&&pt.x<cv.clientWidth&&pt.y<cv.clientHeight){
    const fs=map.queryRenderedFeatures([[pt.x-35,pt.y-35],[pt.x+35,pt.y+35]],{layers:['park','landcover','water','poi-q','landuse']});
    for(const f of fs){const l=f.layer.id,cl=(f.properties&&(f.properties.class||''))+'';
      if(l==='park'||(l==='landcover'&&/grass|wood|forest|farm/.test(cl))){w.compostix+=3;ctx=ctx||'près d\'un espace vert';}
      else if(l==='water'){w.plastikor+=3;ctx=ctx||'près de l\'eau';}
      else if(l==='poi-q'&&/shop|grocery|restaurant|fast_food|cafe|bar|bakery|marketplace/.test(cl)){w.kartouna+=2;w.canettor+=2;ctx=ctx||'près des commerces';}
      else if(l==='landuse'&&/commercial|retail/.test(cl)){w.kartouna+=2;ctx=ctx||'dans une zone commerçante';}
      else if(l==='landuse'&&/school|university|college/.test(cl)){w.canettor+=2;w.plastikor+=1;ctx=ctx||'près d\'une école';}}}}catch(e){}}
  let tot=0;for(const k in w)tot+=w[k];let x=r()*tot;for(const k in w){x-=w[k];if(x<=0)return{key:k,ctx};}return{key:'compostix',ctx};}
const cache={};
function refreshSpawns(){if(!pos||!map)return;const win=Math.floor(Date.now()/WIN);const cx=Math.floor(pos.lng/CELL),cy=Math.floor(pos.lat/CELL);const R=3;const list=[];
  Object.keys(Z.S.captured).forEach(id=>{const w=+id.split('_')[2];if(w<win-1)delete Z.S.captured[id];});
  for(let dx=-R;dx<=R;dx++)for(let dy=-R;dy<=R;dy++){const id=(cx+dx)+'_'+(cy+dy)+'_'+win;const r=Z.rng(Z.hash(id));if(r()>.55)continue;if(Z.S.captured[id])continue;
    const lat=(cy+dy+.15+r()*.7)*CELL,lng=(cx+dx+.15+r()*.7)*CELL;
    if(Z.S.cleanedSpots.some(s=>Date.now()-s.t<30*864e5&&Z.dist(s,{lat,lng})<40))continue;
    if(!cache[id]){const boss=r()<.06;cache[id]=boss?{key:'megotine',ctx:'près d\'un café'}:ctxType(lat,lng,r);}
    list.push({id,lat,lng,key:cache[id].key,ctx:cache[id].ctx,d:Z.dist(pos,{lat,lng})});}
  list.sort((a,b)=>a.d-b.d);spawns=list.slice(0,18);const keep={};
  spawns.forEach(s=>{keep[s.id]=1;let m=spawnMk[s.id];if(!m){const el=document.createElement('div');el.className='mk';el.innerHTML=Z.svgMon(s.key)+'<div class="sh"></div>';el.addEventListener('click',ev=>{ev.stopPropagation();const sp=spawns.find(x=>x.id===s.id);if(sp)Z.onMonsterTap(sp,Z.dist(pos,sp));});
      m=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([s.lng,s.lat]).addTo(map);spawnMk[s.id]=m;}
    const el=m.getElement();el.classList.toggle('near',s.d<=Z.RANGE);el.classList.toggle('far',s.d>250);});
  Object.keys(spawnMk).forEach(id=>{if(!keep[id]){spawnMk[id].remove();delete spawnMk[id];}});
  refreshNear();}
Z.Map.refresh=()=>{refreshSpawns();refreshLegends();refreshCentres();};
Z.Map.removeSpawn=function(id){Z.S.captured[id]=1;Z.save();if(spawnMk[id]){spawnMk[id].remove();delete spawnMk[id];}spawns=spawns.filter(s=>s.id!==id);refreshNear();};

/* ---- points de collecte ---- */
function demoCentres(){if(!pos)return[];const out=[];const base=pos;const mLat=111320,mLng=111320*Math.cos(base.lat*Math.PI/180);
  const cx=Math.round(base.lat*200)/200,cy=Math.round(base.lng*200)/200;
  [[150,40,'Point de collecte (démo)'],[-90,-240,'Bac de tri partenaire (démo)']].forEach(([dx,dy,n],i)=>out.push({id:'demo_'+cx+'_'+cy+'_'+i,name:n,lat:cx+dy/mLat,lng:cy+dx/mLng,demo:true}));return out;}
function findCentres(){if(!map||mode!=='game'||!pos)return;let fs=[];try{fs=map.queryRenderedFeatures({layers:['poi-q']});}catch(e){return;}
  const found={};fs.forEach(f=>{const p=f.properties||{};const nm=(p['name:fr']||p['name:latin']||p.name||'')+'';const sub=(p.subclass||'')+'';
    if(/supermarket|recycling|marketplace/.test(sub)||/monoprix|carrefour|magasin g|g[ée]ant|aziza|mg /i.test(nm)){const c=f.geometry&&f.geometry.coordinates;if(!c)return;const id='poi_'+c[0].toFixed(5)+'_'+c[1].toFixed(5);
      found[id]={id,name:(sub==='recycling'?'♻️ ':'')+(nm||'Point de collecte'),lat:c[1],lng:c[0],demo:false};}});
  realCentres=Object.values(found);refreshCentres();}
function refreshCentres(){if(!map||!pos)return;centres=realCentres.filter(c=>Z.dist(pos,c)<1500).concat(demoCentres());const keep={};
  centres.forEach(c=>{keep[c.id]=1;let m=centreMk[c.id];const cd=Z.S.centreCd[c.id]&&Date.now()-Z.S.centreCd[c.id]<30*60*1000;
    if(!m){const el=document.createElement('div');el.className='ct';el.innerHTML='<div class="ic">♻️</div><div class="lb"></div>';el.querySelector('.lb').textContent=c.name;el.addEventListener('click',ev=>{ev.stopPropagation();Z.onCentreTap(c,pos?Z.dist(pos,c):1e9);});
      m=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([c.lng,c.lat]).addTo(map);centreMk[c.id]=m;}
    m.getElement().classList.toggle('cd',!!cd);});
  Object.keys(centreMk).forEach(id=>{if(!keep[id]){centreMk[id].remove();delete centreMk[id];}});refreshNear();}

/* ---- légendaires (signalements) et lieux nettoyés ---- */
function refreshLegends(){if(!map)return;const keep={};
  Z.S.reports.filter(r=>r.status!=='cleaned').forEach(r=>{keep[r.id]=1;if(legMk[r.id])return;const el=document.createElement('div');el.className='mk leg';el.innerHTML='<div class="crown">👑</div>'+Z.svgMon(r.key)+'<div class="sh"></div>';
    el.addEventListener('click',ev=>{ev.stopPropagation();Z.onLegendTap(r,pos?Z.dist(pos,r):1e9);});legMk[r.id]=new maplibregl.Marker({element:el,anchor:'bottom',offset:[30,-16]}).setLngLat([r.lng,r.lat]).addTo(map);});
  Object.keys(legMk).forEach(id=>{if(!keep[id]){legMk[id].remove();delete legMk[id];}});
  const ck={};Z.S.cleanedSpots.filter(s=>Date.now()-s.t<30*864e5).forEach((s,i)=>{const id='c'+s.t;ck[id]=1;if(cleanMk[id])return;const el=document.createElement('div');el.className='cl';el.textContent='✓';el.title='Lieu nettoyé';
    el.addEventListener('click',ev=>{ev.stopPropagation();const days=Math.ceil((30*864e5-(Date.now()-s.t))/864e5);Z.toast(`✅ Lieu nettoyé · aucune apparition légendaire ici pendant encore ${days} j`);});cleanMk[id]=new maplibregl.Marker({element:el}).setLngLat([s.lng,s.lat]).addTo(map);});
  Object.keys(cleanMk).forEach(id=>{if(!ck[id]){cleanMk[id].remove();delete cleanMk[id];}});refreshNear();}
Z.Map.refreshLegends=refreshLegends;

function refreshNear(){if(!pos)return;const near=spawns.filter(s=>s.d<=200).length;const inR=spawns.filter(s=>s.d<=Z.RANGE).length;let cn=null;centres.forEach(c=>{const d=Z.dist(pos,c);if(!cn||d<cn.d)cn={c,d};});
  const legs=Z.S.reports.filter(r=>r.status!=='cleaned').length;
  $('#nearInfo').innerHTML=(inR?`⚔️ <b>${inR}</b> monstre${inR>1?'s':''} à portée !`:`👾 <b>${near}</b> monstre${near>1?'s':''} à moins de 200 m`)+(cn?` · ♻️ ${Z.fmtD(cn.d)}`:'')+(legs?` · 👑 ${legs}`:'');}
})();
