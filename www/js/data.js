/* Zebla Monsters — données, état, utilitaires */
(function(){
'use strict';
const Z = window.Z = {};
Z.$ = s => document.querySelector(s);
Z.$$ = s => Array.from(document.querySelectorAll(s));

Z.MAT = {
  plast:{name:'Plastique',color:'#3A9BD0',hex:0x3A9BD0,bin:'PLASTIQUE'},
  alu:{name:'Métal',color:'#8E99A3',hex:0xB8C0C8,bin:'MÉTAL'},
  pap:{name:'Papier',color:'#C8955A',hex:0xC8955A,bin:'PAPIER'},
  org:{name:'Organique',color:'#6E8B3D',hex:0x7CB342,bin:'ORGANIQUE'}
};
Z.MKEYS = ['plast','alu','pap','org'];
Z.WASTE = [
  {id:'bouteille',name:"Bouteille d'eau",mat:'plast',emoji:'🧴'},
  {id:'sac',name:'Sac plastique',mat:'plast',emoji:'🛍️'},
  {id:'canette',name:'Canette',mat:'alu',emoji:'🥤'},
  {id:'conserve',name:'Boîte de conserve',mat:'alu',emoji:'🥫'},
  {id:'carton',name:'Carton',mat:'pap',emoji:'📦'},
  {id:'journal',name:'Journal',mat:'pap',emoji:'📰'},
  {id:'banane',name:'Peau de banane',mat:'org',emoji:'🍌'},
  {id:'pomme',name:'Trognon de pomme',mat:'org',emoji:'🍎'}
];
Z.MONS = {
  canettor:{name:'Canettor',mat:'alu',hp:100,evo:'Vélo',desc:"Rapide et bruyant. L'aluminium se recycle presque à l'infini : c'est le monstre le plus « rentable »."},
  plastikor:{name:'Plastikor',mat:'plast',hp:100,evo:'Banc public',desc:"Né d'un sac ou d'une bouteille abandonnés. Il vole avec le vent et finit souvent dans la mer."},
  kartouna:{name:'Kartouna',mat:'pap',hp:100,evo:"Cahier d'école",desc:'Grand et un peu maladroit. Il pullule autour des marchés et des commerces.'},
  compostix:{name:'Compostix',mat:'org',hp:100,evo:'Olivier',desc:'Le plus gentil mais le plus nombreux. Bien traité, il devient du compost pour les agriculteurs.'},
  megotine:{name:'Mégotine',mat:null,hp:160,boss:true,evo:'Cendrier public',desc:"Petit mais redoutable : un seul mégot pollue l'eau et le sol. Le boss le plus coriace."}
};
Z.ITEMS = {
  banc:{name:'Banc public',emoji:'🪑',eff:{vie:10},effTxt:'+10 Vie'},
  velo:{name:'Station de vélos',emoji:'🚲',eff:{air:10,vie:4},effTxt:'+10 Air, +4 Vie'},
  livres:{name:'Boîte à livres',emoji:'📚',eff:{vie:10},effTxt:'+10 Vie'},
  olivier:{name:'Olivier',emoji:'🌳',eff:{air:12,prop:2},effTxt:'+12 Air'},
  tri:{name:'Point de tri',emoji:'♻️',eff:{prop:14},effTxt:'+14 Propreté'},
  cendrier:{name:'Cendrier public',emoji:'🚭',eff:{prop:10},effTxt:'+10 Propreté'}
};
Z.RECIPES = [
  {id:'banc',cost:{plast:10},coins:20,input:['bouteille','sac'],glow:0x3A9BD0,steps:['Bouteilles PET','Broyage en paillettes','Lavage','Fusion en granulés','Moulage du banc'],
   fact:'Le plastique PET est broyé en paillettes, lavé puis fondu en granulés. Ces granulés servent à fabriquer de nouveaux objets, comme du mobilier urbain.'},
  {id:'velo',cost:{alu:10},coins:30,input:['canette','conserve'],glow:0xFF7A1A,steps:['Canettes','Compactage','Fusion vers 660 °C',"Lingots d'aluminium",'Cadres de vélos'],
   fact:"L'aluminium fond vers 660 °C et se recycle sans perdre ses qualités : une canette peut redevenir une canette… ou un cadre de vélo."},
  {id:'livres',cost:{pap:8},coins:20,input:['carton','journal'],glow:0x7FC8F0,steps:['Cartons & journaux','Mise en pâte (eau)','Égouttage','Séchage en feuilles','Cahiers & livres'],
   fact:"Le papier est mélangé à l'eau pour redevenir une pâte, puis séché en nouvelles feuilles. Ses fibres peuvent être recyclées plusieurs fois."},
  {id:'olivier',cost:{org:8},coins:20,input:['banane','pomme'],glow:0x7CB342,steps:['Épluchures','Compostage','Quelques mois plus tard…','Compost mûr','Plantation'],
   fact:'Les déchets organiques forment une grande partie de nos poubelles. Compostés, ils deviennent un engrais naturel pour les sols et les cultures, comme les oliviers.'},
  {id:'tri',cost:{plast:4,alu:4},coins:40,input:['bouteille','conserve'],glow:0x2E9E5B,steps:['Plastique + métal recyclés','Découpe','Assemblage','Peinture','Point de tri du quartier'],
   fact:'Sans bacs de tri, pas de tri à la source. Chaque point de tri installé dans un quartier rend le bon geste plus facile pour tous les habitants.'}
];
Z.QUESTS = [
  {id:'capture',txt:'Capture {n} monstres',n:3,icon:'👾'},
  {id:'sorted',txt:'Fais {n} bons tris',n:25,icon:'🗑️'},
  {id:'deposit',txt:'Dépose {n} déchets dans un point de collecte',n:15,icon:'♻️'},
  {id:'craft',txt:"Fabrique {n} objet à l'atelier",n:1,icon:'🛠️'},
  {id:'place',txt:'Place {n} objets dans ta ville',n:2,icon:'🏙️'},
  {id:'report',txt:'Signale {n} décharge sauvage',n:1,icon:'📸'},
  {id:'perfect',txt:'Gagne {n} combat sans erreur',n:1,icon:'✨'}
];
Z.BADGES = [
  {id:'first',e:'👾',t:'Premier monstre',ok:s=>s.stats.captures>=1},
  {id:'hunter',e:'🎯',t:'Chasseur (10)',ok:s=>s.stats.captures>=10},
  {id:'sorter',e:'🗑️',t:'100 bons tris',ok:s=>s.stats.sorted>=100},
  {id:'perfect',e:'✨',t:'Combat parfait',ok:s=>s.stats.perfect>=1},
  {id:'depot',e:'♻️',t:'Premier dépôt',ok:s=>s.stats.deposits>=1},
  {id:'maker',e:'🛠️',t:'Artisan',ok:s=>s.stats.crafts>=3},
  {id:'reporter',e:'📸',t:'Sentinelle',ok:s=>s.stats.reports>=1},
  {id:'legend',e:'👑',t:'Nettoyeur légendaire',ok:s=>s.stats.cleaned>=1},
  {id:'houma',e:'🏆',t:'Houma modèle',ok:s=>Z.cityScore&&Z.cityScore()>=80}
];
Z.BAG_CAP = 40;
Z.DEMO_POS = {lat:36.8945, lng:10.1870}; // Pôle Technologique El Ghazala (approx.)
Z.RANGE = 60; // mètres pour interagir

/* ---------- STATE ---------- */
const KEY = 'zebla_monsters_v1';
function fresh(){return {v:1,onboarded:false,name:'',houma:'',xp:0,coins:100,gp:0,
  bag:{plast:0,alu:0,pap:0,org:0},mat:{plast:6,alu:4,pap:4,org:4},
  items:{banc:0,velo:0,livres:0,olivier:0,tri:0,cendrier:0},
  sc:{prop:20,air:30,vie:25},city:{placed:[],cleaned:[]},
  captured:{},dex:{canettor:0,plastikor:0,kartouna:0,compostix:0,megotine:0},
  stats:{sorted:0,wrong:0,captures:0,deposits:0,crafts:0,reports:0,cleaned:0,perfect:0,placed:0},
  reports:[],cleanedSpots:[],centreCd:{},quests:{day:'',ids:[],prog:{},claimed:{}},badges:{},
  demo:false,muted:false,lastPos:null,reportDay:{d:'',n:0}};}
Z.load = function(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
  const f=fresh();if(!s||s.v!==1)return f;
  for(const k in f){if(s[k]===undefined)s[k]=f[k];else if(f[k]&&typeof f[k]==='object'&&!Array.isArray(f[k]))s[k]=Object.assign({},f[k],s[k]);}
  return s;};
let saveT=null;
Z.save = function(now){clearTimeout(saveT);const go=()=>{try{localStorage.setItem(KEY,JSON.stringify(Z.S));}catch(e){
    // stockage plein : on retire les photos les plus anciennes
    try{Z.S.reports.forEach((r,i)=>{if(i<Z.S.reports.length-4){r.photo=null;r.photoAfter=null;}});localStorage.setItem(KEY,JSON.stringify(Z.S));}catch(e2){}}};
  if(now)go();else saveT=setTimeout(go,400);};
Z.reset = function(){try{localStorage.removeItem(KEY);}catch(e){}location.reload();};
Z.S = Z.load();

/* ---------- HELPERS ---------- */
Z.today = () => {const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
Z.dist = function(a,b){const R=6371000,toR=Math.PI/180;const dLat=(b.lat-a.lat)*toR,dLng=(b.lng-a.lng)*toR;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*toR)*Math.cos(b.lat*toR)*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(x));};
Z.fmtD = m => m<1000?Math.round(m)+' m':(m/1000).toFixed(1)+' km';
Z.hash = function(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return h>>>0;};
Z.rng = function(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
Z.bagCount = () => Z.MKEYS.reduce((n,k)=>n+Z.S.bag[k],0);
Z.level = function(xp){let l=1,need=100,acc=0;while(xp>=acc+need){acc+=need;l++;need=100+ (l-1)*50;}return {l,cur:xp-acc,need};};
Z.svgMon = (k,cls) => `<svg viewBox="0 0 120 120" class="${cls||''}"><use href="#s-${k}"/></svg>`;

let toastT;
Z.toast = function(msg,ms){const t=Z.$('#toast');t.innerHTML=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms||2300);};
Z.floatAt = function(x,y,txt,color){const d=document.createElement('div');d.className='float';d.style.left=x+'px';d.style.top=y+'px';d.style.color=color||'#16302B';d.textContent=txt;document.body.appendChild(d);setTimeout(()=>d.remove(),1150);};
Z.floatEl = function(el,txt,color){const r=el.getBoundingClientRect();Z.floatAt(r.left+r.width/2,r.top-6,txt,color);};
Z.bump = function(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');};
Z.modal = function(html){Z.$('#mbox').innerHTML=html;Z.$('#modal').classList.add('on');};
Z.closeModal = function(){Z.$('#modal').classList.remove('on');};

/* ---------- SOUND ---------- */
let AC=null;
Z.audioInit = function(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();}catch(e){}};
Z.beep = function(t){try{if(!AC||Z.S.muted)return;const f={ok:[660,1100],bad:[240,120],throw:[380,520],win:[523,1568],craft:[260,900],place:[520,880],hit:[900,300],coin:[1200,1800],tap:[600,700]}[t]||[440,440];
  const o=AC.createOscillator(),g=AC.createGain();o.type=t==='bad'?'sawtooth':'triangle';o.frequency.setValueAtTime(f[0],AC.currentTime);o.frequency.exponentialRampToValueAtTime(f[1],AC.currentTime+(t==='win'?.4:.16));
  g.gain.setValueAtTime(.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+(t==='win'?.5:.24));o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.55);}catch(e){}};
Z.vibrate = function(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}};
})();
