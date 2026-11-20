/* Zebla Monsters — logique du jeu et interface */
(function(){
'use strict';
const Z=window.Z,$=Z.$,$$=Z.$$,S=Z.S;
let tab='map',battleReturn='map';

/* ================= HELPERS ================= */
Z.cityScore=()=>Math.round((S.sc.prop+S.sc.air+S.sc.vie)/3);
function renderHUD(){const L=Z.level(S.xp);$('#hLvl').textContent='Niv. '+L.l;$('#hXp').style.width=(L.cur/L.need*100)+'%';$('#hCoins').textContent=Math.floor(S.coins);$('#hGp').textContent=S.gp;
  $('#hBag').textContent=Z.bagCount()+'/'+Z.BAG_CAP;$('#hAv').textContent=((S.name||'Z')[0]||'Z').toUpperCase();
  $('#qBadge').classList.toggle('hidden',!questClaimable());}
function addXP(n){const before=Z.level(S.xp).l;S.xp+=n;const after=Z.level(S.xp).l;renderHUD();Z.save();
  if(after>before)setTimeout(()=>{Z.beep('win');Z.modal(`<div class="big">⭐</div><h3>Niveau ${after} !</h3><p>Tu deviens un chasseur de monstres plus expérimenté.</p><div class="rw"><span>+${after*20} 🪙</span></div><div class="btns"><button data-a="close">Super !</button></div>`);S.coins+=after*20;renderHUD();},400);}
function addCoins(n){S.coins+=n;renderHUD();Z.bump($('#pCoins'));}
function addGP(n){S.gp+=n;renderHUD();Z.bump($('#pGp'));}
Z.setDemo=function(on){S.demo=on;Z.save();$('#tgDemo').classList.toggle('on',on);Z.Map.startGPS();setTimeout(Z.Map.refresh,500);};

/* ================= QUESTS & BADGES ================= */
function ensureQuests(){const d=Z.today();if(S.quests.day===d)return;const r=Z.rng(Z.hash(d+S.name));const pool=Z.QUESTS.map(q=>q.id);const ids=[];while(ids.length<3){const i=Math.floor(r()*pool.length);ids.push(pool.splice(i,1)[0]);}S.quests={day:d,ids,prog:{},claimed:{}};Z.save();}
function quest(id,n){ensureQuests();if(!S.quests.ids.includes(id))return;const q=Z.QUESTS.find(x=>x.id===id);const before=S.quests.prog[id]||0;S.quests.prog[id]=Math.min(q.n,before+(n||1));
  if(before<q.n&&S.quests.prog[id]>=q.n)setTimeout(()=>Z.toast(`🎯 Quête terminée : ${q.txt.replace('{n}',q.n)} — récupère ta récompense dans Profil`,2800),600);renderHUD();Z.save();}
function questClaimable(){if(S.quests.day!==Z.today())return false;return S.quests.ids.some(id=>{const q=Z.QUESTS.find(x=>x.id===id);return (S.quests.prog[id]||0)>=q.n&&!S.quests.claimed[id];});}
function checkBadges(){Z.BADGES.forEach(b=>{if(!S.badges[b.id]&&b.ok(S)){S.badges[b.id]=Date.now();setTimeout(()=>{Z.beep('coin');Z.toast(`🏅 Nouveau badge : ${b.e} ${b.t}`,2600);},1200);}});Z.save();}

/* ================= NAVIGATION ================= */
function setTab(t){tab=t;$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===t));
  const isMap=t==='map';['#hud','#fabs','#info'].forEach(s=>$(s).classList.toggle('hidden',!isMap));
  $$('.scr').forEach(e=>e.classList.remove('show'));$$('.page').forEach(e=>e.classList.remove('show'));
  if(t==='atelier'||t==='ville'){if(!Z.has3D){Z.toast('La 3D n\'est pas disponible sur cet appareil');return setTab('map');}$('#'+t).classList.add('show');Z.three.show(t);if(t==='atelier'){renderMatChips();renderRecipes();if(!Z.Atelier.busy())$('#stepName').textContent='Choisis une recette';}else{renderCityInv();renderScores();}}
  else Z.three.hide();
  if(t==='collection'){renderCollection();$('#collection').classList.add('show');$('#collection').scrollTop=0;}
  if(t==='profile'){renderProfile();$('#profile').classList.add('show');$('#profile').scrollTop=0;}
  if(isMap)setTimeout(()=>Z.Map.resize(),50);}
Z.setTab=setTab;
$('#nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b){Z.beep('tap');setTab(b.dataset.t);}});

/* ================= BATTLE ================= */
function startBattle(o){if(!Z.has3D){Z.toast('La 3D n\'est pas disponible sur cet appareil');return;}battleReturn=tab==='ville'?'ville':'map';Z.closeModal();
  $$('.scr').forEach(e=>e.classList.remove('show'));$$('.page').forEach(e=>e.classList.remove('show'));['#hud','#fabs','#info'].forEach(s=>$(s).classList.add('hidden'));$('#nav').classList.add('hidden');
  $('#battle').classList.add('show');Z.three.show('battle');Z.Battle.start(o);}
function endBattle(){Z.Battle.flee();$('#battle').classList.remove('show');$('#nav').classList.remove('hidden');setTab(battleReturn);}
$('#bins').addEventListener('click',e=>{const b=e.target.closest('.bin');if(b)Z.Battle.sortTo(b.dataset.m,b);});
$('#flee').addEventListener('click',()=>{Z.modal(`<div class="big">🏃</div><h3>Fuir le combat ?</h3><p>Les déchets déjà triés restent dans ton sac, mais le monstre reste sur place.</p><div class="btns"><button data-a="flee">Fuir</button><button class="sec2 btn" data-a="close">Continuer le combat</button></div>`);});
Z.onSorted=function(mk){S.stats.sorted++;quest('sorted');addXP(2);if(Z.bagCount()>=Z.BAG_CAP){if(!Z._fullWarned){Z._fullWarned=1;Z.toast('🎒 Sac plein ! Va déposer tes déchets dans un point de collecte ♻️',2800);}return false;}S.bag[mk]++;renderHUD();Z.save();return true;};
Z.onWrong=function(){S.stats.wrong++;Z.save();};
Z.onBattleWin=function(r){const def=Z.MONS[r.key],o=r.o;let bonus=0;
  if(def.mat){const room=Z.BAG_CAP-Z.bagCount();bonus=Math.max(0,Math.min(r.legendary?12:6,room));S.bag[def.mat]+=bonus;}
  const coins=r.legendary?80:(def.boss?100:40);addCoins(coins);addXP(r.legendary?60:(def.boss?40:20));
  S.dex[r.key]=(S.dex[r.key]||0)+1;S.stats.captures++;quest('capture');if(r.perfect){S.stats.perfect++;quest('perfect');}
  if(def.boss&&!r.legendary)S.items.cendrier++;
  if(o.spawnId)Z.Map.removeSpawn(o.spawnId);
  let cleaned=false;if(o.pileIdx!=null&&!S.city.cleaned.includes(o.pileIdx)){S.city.cleaned.push(o.pileIdx);S.sc.prop+=12;Z.Ville.cleanPile(o.pileIdx);cleaned=true;}
  checkBadges();Z.save();renderHUD();
  const lootTxt=Z.MKEYS.filter(k=>r.loot[k]+(def.mat===k?bonus:0)).map(k=>`<span style="background:#F1EEE2;color:#16302B"><i class="dot" style="background:${Z.MAT[k].color}"></i> +${r.loot[k]+(def.mat===k?bonus:0)} ${Z.MAT[k].name}</span>`).join('');
  if(r.legendary){const rep=S.reports.find(x=>x.id===o.reportId);if(rep){rep.status='fought';Z.save();}
    Z.modal(`<div class="bigsvg">${Z.svgMon(r.key)}</div><h3>Légendaire vaincu !</h3><div class="rw"><span>+${coins} 🪙</span>${lootTxt}</div><p><b>Étape 2 :</b> prouve que le lieu est vraiment propre avec une <b>photo après nettoyage</b>.</p><div class="btns"><button data-a="after" data-id="${o.reportId}">📸 Photo « après »</button><button class="btn sec2" data-a="flee">Plus tard</button></div>`);return;}
  Z.modal(`<div class="bigsvg">${Z.svgMon(r.key)}</div><h3>${def.name} capturé !</h3>
    <div class="rw"><span>+${coins} 🪙</span>${r.perfect?'<span>✨ Sans erreur</span>':''}${def.boss?'<span>+1 🚭 Cendrier public</span>':''}</div>
    <div class="rw">${lootTxt}</div>
    <p>${def.boss?"Les mégots sont parmi les déchets les plus polluants : un cendrier public évite qu'ils finissent dans l'eau et le sol.":'Tes déchets triés sont dans ton 🎒 sac. <b>Dépose-les dans un point de collecte ♻️</b> pour les transformer en matières.'}</p>
    ${cleaned?'<p><b>📍 Ce lieu de ta houma est maintenant propre !</b></p>':''}
    <div class="btns"><button data-a="flee">${battleReturn==='ville'?'Retour à ma ville':'Retour à la carte'}</button></div>`);};

/* ================= MAP INTERACTIONS ================= */
Z.onMonsterTap=function(sp,d){Z.beep('tap');const def=Z.MONS[sp.key];const ok=d<=Z.RANGE;
  Z.modal(`<div class="bigsvg">${Z.svgMon(sp.key)}</div><h3>${def.name}${def.boss?' 👑':''}</h3><p>${sp.ctx?'Apparu '+sp.ctx+'. ':''}Matière : <b>${def.mat?Z.MAT[def.mat].name:'Mégots (toxique)'}</b> · Distance : <b>${Z.fmtD(d)}</b></p>
    ${ok?'':`<p class="note">Approche-toi à moins de ${Z.RANGE} m pour le combattre.</p>`}
    <div class="btns">${ok?`<button data-a="fight" data-id="${sp.id}">Combattre ⚔️</button>`:(S.demo?`<button data-a="walk" data-id="${sp.id}">🚶 Y aller (mode démo)</button>`:'')}<button class="btn sec2" data-a="close">Fermer</button></div>`);};
Z.onCentreTap=function(c,d){Z.beep('tap');const ok=d<=Z.RANGE;const n=Z.bagCount();const cd=S.centreCd[c.id]&&Date.now()-S.centreCd[c.id]<30*60*1000;
  const rows=Z.MKEYS.map(k=>`<span style="background:#F1EEE2;color:#16302B"><i class="dot" style="background:${Z.MAT[k].color}"></i> ${S.bag[k]} ${Z.MAT[k].name}</span>`).join('');
  Z.modal(`<div class="big">♻️</div><h3>${c.name}</h3><p>${c.demo?'<i>Point fictif pour la démo — dans la version réelle : points Eco-Lef, bacs partenaires, barbechas partenaires.</i><br>':''}Distance : <b>${Z.fmtD(d)}</b></p>
    <div class="rw">${rows}</div>
    ${ok?(n?`<p>Dépose tes <b>${n} déchets triés</b> : ils deviennent des <b>matières recyclées</b> pour l'atelier${cd?'.':' et te rapportent des 🌿 points verts.'}</p>`:'<p>Ton sac est vide. Combats des monstres pour récolter des déchets triés !</p>'):`<p class="note">Approche-toi à moins de ${Z.RANGE} m pour déposer.</p>`}
    ${cd&&ok&&n?'<p class="note">🌿 Points verts déjà gagnés ici il y a moins de 30 min (anti-triche) — les matières sont quand même converties.</p>':''}
    <p class="note">En vrai : scanne le QR code collé sur le bac pour valider le dépôt.</p>
    <div class="btns">${ok&&n?`<button data-a="deposit" data-id="${c.id}">Déposer ${n} déchets ♻️</button>`:''}${!ok&&S.demo?`<button data-a="walkc" data-id="${c.id}">🚶 Y aller (mode démo)</button>`:''}<button class="btn sec2" data-a="close">Fermer</button></div>`);};
function deposit(cid){const c=Z.Map.centres().find(x=>x.id===cid);const n=Z.bagCount();if(!n)return;const cd=S.centreCd[cid]&&Date.now()-S.centreCd[cid]<30*60*1000;
  Z.MKEYS.forEach(k=>{S.mat[k]+=S.bag[k];S.bag[k]=0;});Z._fullWarned=0;const gp=cd?0:Math.max(1,Math.floor(n/4));if(gp){addGP(gp);S.centreCd[cid]=Date.now();}
  S.stats.deposits+=n;quest('deposit',n);addXP(n);checkBadges();Z.save();renderHUD();Z.beep('win');Z.vibrate(60);Z.Map.refresh();
  Z.modal(`<div class="big">🏭</div><h3>${n} déchets déposés !</h3><div class="rw">${gp?`<span>+${gp} 🌿</span>`:''}<span>+${n} XP</span></div><p>Ils sont maintenant des <b>matières recyclées</b>. Direction l'atelier pour leur donner une seconde vie !</p><div class="btns"><button data-a="tab" data-t="atelier">Aller à l'atelier ♻️</button><button class="btn sec2" data-a="close">Continuer à chasser</button></div>`);}

/* ================= SIGNALEMENT & LÉGENDAIRES ================= */
let photoCb=null;
$('#photoIn').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f||!photoCb)return;const cb=photoCb;photoCb=null;
  const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const mx=640;const sc=Math.min(1,mx/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.6));};img.onerror=()=>Z.toast('Photo illisible');img.src=rd.result;};rd.readAsDataURL(f);});
function takePhoto(cb){photoCb=cb;$('#photoIn').click();}
$('#fReport').addEventListener('click',()=>{Z.beep('tap');const pos=Z.Map.pos();if(!pos){Z.toast('Position inconnue');return;}
  const d=Z.today();if(S.reportDay.d!==d)S.reportDay={d,n:0};
  if(S.reportDay.n>=5){Z.modal(`<div class="big">⛔</div><h3>Limite atteinte</h3><p>5 signalements maximum par jour (anti-triche). Reviens demain !</p><div class="btns"><button data-a="close">OK</button></div>`);return;}
  const recent=S.cleanedSpots.find(s=>Date.now()-s.t<30*864e5&&Z.dist(s,pos)<100);
  if(recent){const days=Math.ceil((30*864e5-(Date.now()-recent.t))/864e5);Z.modal(`<div class="big">🧊</div><h3>Lieu en cooldown</h3><p>Un lieu a été nettoyé à moins de 100 m d'ici. Aucun nouveau légendaire ne peut apparaître ici avant <b>${days} jours</b>.</p><p class="note">C'est la règle anti-triche : remettre des déchets au même endroit ne rapporte rien.</p><div class="btns"><button data-a="close">Compris</button></div>`);return;}
  const open=S.reports.find(r=>r.status!=='cleaned'&&Z.dist(r,pos)<50);
  if(open){Z.modal(`<div class="big">👑</div><h3>Déjà signalé</h3><p>Une décharge est déjà signalée à moins de 50 m. Un légendaire t'y attend !</p><div class="btns"><button data-a="close">OK</button></div>`);return;}
  Z.modal(`<div class="big">📸</div><h3>Signaler une décharge sauvage</h3><ol class="steps"><li>Prends une photo <b>depuis l'appli</b> (position GPS et heure enregistrées).</li><li>Un <b>monstre légendaire</b> apparaît à cet endroit.</li><li>Un autre chasseur (ou toi, avec une récompense réduite) le combat puis prouve le nettoyage avec une photo « après ».</li></ol>
    <p class="note">⚠️ Ne touche jamais de verre cassé, de seringues ou de produits chimiques : ces signalements sont transmis à la municipalité.</p>
    <div class="btns"><button data-a="report">📸 Prendre la photo</button><button class="btn sec2" data-a="close">Annuler</button></div>`);});
function doReport(){const pos=Z.Map.pos();takePhoto(photo=>{const keys=['canettor','plastikor','kartouna','compostix'];const r={id:'r'+Date.now(),lat:pos.lat,lng:pos.lng,t:Date.now(),photo,by:'me',status:'open',key:keys[Math.floor(Math.random()*4)]};
  S.reports.unshift(r);if(S.reports.length>12)S.reports.length=12;S.reportDay.n++;S.stats.reports++;quest('report');addGP(5);addXP(15);checkBadges();Z.save();Z.Map.refreshLegends();Z.beep('win');
  Z.modal(`<img class="ph" src="${photo}" alt=""><h3>Signalement envoyé !</h3><div class="rw"><span>+5 🌿</span><span>+15 XP</span></div><p>Un <b>${Z.MONS[r.key].name} légendaire 👑</b> est apparu ici. Les chasseurs du quartier peuvent venir nettoyer.</p><p class="note">Dans la version complète, le signalement est aussi envoyé au tableau de bord de la municipalité.</p><div class="btns"><button data-a="close">Voir sur la carte</button></div>`);});}
Z.onLegendTap=function(r,d){Z.beep('tap');const ok=d<=Z.RANGE;const own=r.by==='me';
  if(r.status==='fought'||r.status==='validating'){return afterFlow(r);}
  Z.modal(`${r.photo?`<img class="ph" src="${r.photo}" alt="">`:''}<h3>👑 ${Z.MONS[r.key].name} légendaire</h3><p>Décharge sauvage signalée le ${new Date(r.t).toLocaleDateString('fr-FR')} à ${new Date(r.t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}. Distance : <b>${Z.fmtD(d)}</b></p>
    <ol class="steps"><li>Bats le légendaire (220 PV).</li><li>Nettoie le lieu (gants, en groupe).</li><li>Prends la photo « après » (au moins 15 min après la photo « avant »).</li><li>La communauté valide, et le lieu passe en cooldown 30 jours.</li></ol>
    ${own?'<p class="note">C\'est ton signalement : récompense finale réduite à 20 % (règle signaleur ≠ nettoyeur).</p>':''}
    <div class="btns">${ok?`<button data-a="legfight" data-id="${r.id}">Combattre le légendaire ⚔️</button>`:(S.demo?`<button data-a="walkl" data-id="${r.id}">🚶 Y aller (mode démo)</button>`:`<p class="note">Approche-toi à moins de ${Z.RANGE} m.</p>`)}<button class="btn sec2" data-a="close">Fermer</button></div>`);};
function afterFlow(r){const wait=15*60*1000-(Date.now()-r.t);
  if(r.status==='validating')return validate(r);
  if(wait>0&&!S.demo){const m=Math.ceil(wait/60000);Z.modal(`<div class="big">⏳</div><h3>Encore ${m} min</h3><p>La photo « après » doit être prise <b>au moins 15 minutes</b> après la photo « avant ». Profite de ce temps pour bien nettoyer !</p><div class="btns"><button data-a="close">OK</button></div>`);return;}
  takePhoto(ph=>{r.photoAfter=ph;r.status='validating';Z.save();validate(r);});}
function validate(r){Z.modal(`<div style="display:flex;gap:6px;margin-bottom:8px">${r.photo?`<img class="ph" style="width:50%;height:120px" src="${r.photo}">`:''}<img class="ph" style="width:50%;height:120px" src="${r.photoAfter||''}"></div><h3>Validation communautaire</h3><p id="vtxt">Envoi aux chasseurs du quartier…</p><div class="prog"><i id="vbar"></i></div><p class="note">Simulée dans ce prototype : dans la vraie appli, 3 joueurs proches votent sur les photos avant/après, puis une IA vérifiera.</p>`);
  let v=0;const iv=setInterval(()=>{v++;const b=$('#vbar'),t=$('#vtxt');if(!b){clearInterval(iv);return;}b.style.width=(v/3*100)+'%';t.textContent=`Votes positifs : ${v}/3`;Z.beep('coin');
    if(v>=3){clearInterval(iv);setTimeout(()=>finishClean(r),600);}},1100);}
function finishClean(r){const own=r.by==='me';const mult=own&&!S.demo?.2:1;const gp=Math.round(30*mult),coins=Math.round(50*mult),xp=Math.round(60*mult);
  r.status='cleaned';r.cleanedAt=Date.now();S.cleanedSpots.unshift({lat:r.lat,lng:r.lng,t:Date.now()});if(S.cleanedSpots.length>30)S.cleanedSpots.length=30;S.stats.cleaned++;
  addGP(gp);addCoins(coins);addXP(xp);checkBadges();Z.save();Z.Map.refreshLegends();Z.Map.refresh();Z.beep('win');Z.vibrate([60,40,160]);
  Z.modal(`<div class="big">🧹✨</div><h3>Lieu nettoyé et validé !</h3><div class="rw"><span>+${gp} 🌿</span><span>+${coins} 🪙</span><span>+${xp} XP</span></div>${own&&!S.demo?'<p class="note">Récompense réduite à 20 % : c\'était ton propre signalement.</p>':''}<p>Ce lieu passe en <b>cooldown 30 jours</b> : aucun légendaire ne pourra y réapparaître. Merci pour ta houma ! 💚</p><div class="btns"><button data-a="close">Retour à la carte</button></div>`);}

/* ================= ATELIER ================= */
function renderMatChips(){$('#matChips').innerHTML=Z.MKEYS.map(k=>`<div class="chip" id="mc-${k}"><i class="dot" style="background:${Z.MAT[k].color}"></i>${S.mat[k]} ${Z.MAT[k].name}</div>`).join('')+`<div class="chip">🪙 ${Math.floor(S.coins)}</div>`;}
const canAfford=r=>Object.entries(r.cost).every(([k,v])=>S.mat[k]>=v)&&S.coins>=r.coins;
function renderRecipes(){const busy=Z.Atelier.busy();$('#recipes').innerHTML=Z.RECIPES.map(r=>`<div class="rc"><div class="t"><span>${Z.ITEMS[r.id].emoji}</span>${Z.ITEMS[r.id].name}</div>
  <div class="cost">${Object.entries(r.cost).map(([k,v])=>`<span class="cst ${S.mat[k]<v?'miss':''}"><i class="dot" style="background:${Z.MAT[k].color};width:9px;height:9px"></i>${v} ${Z.MAT[k].name}</span>`).join('')}<span class="cst ${S.coins<r.coins?'miss':''}">🪙 ${r.coins}</span></div>
  <div class="eff">Dans ta ville : ${Z.ITEMS[r.id].effTxt}</div><button data-r="${r.id}" ${(!canAfford(r)||busy)?'disabled':''}>${busy?'…':'Fabriquer'}</button></div>`).join('');}
Z.setSteps=function(r,i){$('#stepName').textContent=i>=4?'✨ '+Z.ITEMS[r.id].name+' fabriqué !':r.steps[i]+'…';$('#stepIcon').textContent=Z.ITEMS[r.id].emoji;$('#stepList').innerHTML=r.steps.map((s,j)=>`<div class="st ${j<=i?'on':''}">${s}</div>`).join('');};
$('#recipes').addEventListener('click',e=>{const b=e.target.closest('button[data-r]');if(!b)return;const r=Z.RECIPES.find(x=>x.id===b.dataset.r);
  if(!canAfford(r)){Z.toast('Pas assez de matières : dépose des déchets triés dans un point de collecte ♻️');return;}
  Object.entries(r.cost).forEach(([k,v])=>S.mat[k]-=v);S.coins-=r.coins;renderHUD();renderMatChips();Z.save();
  Z.Atelier.craft(r,()=>{S.items[r.id]++;S.stats.crafts++;quest('craft');addXP(15);checkBadges();Z.save();renderRecipes();renderMatChips();
    setTimeout(()=>Z.modal(`<div class="big">${Z.ITEMS[r.id].emoji}</div><h3>${Z.ITEMS[r.id].name} fabriqué !</h3><div class="fact">💡 <b>Le savais-tu ?</b> ${r.fact}</div><p>Effet dans ta ville : <b>${Z.ITEMS[r.id].effTxt}</b></p><div class="btns"><button data-a="place" data-i="${r.id}">Placer dans ma ville 🏙️</button><button class="btn sec2" data-a="close">Continuer à fabriquer</button></div>`),900);});
  renderRecipes();});

/* ================= VILLE ================= */
function renderScores(){const tot=Z.Ville.look();['prop','air','vie'].forEach(k=>{$('#b-'+k).style.width=S.sc[k]+'%';$('#v-'+k).textContent=S.sc[k];});$('#cityScore').textContent=tot+' %';$('#cityTitle').textContent='🏙️ '+(S.houma||'Ma houma');return tot;}
function renderCityInv(){const C=Z.CITY;$('#invRow').innerHTML=Object.keys(Z.ITEMS).map(k=>`<button class="icb ${S.items[k]?'':'zero'} ${C.sel===k?'sel':''}" data-i="${k}"><span>${Z.ITEMS[k].emoji}</span>${Z.ITEMS[k].name}<b class="n">${S.items[k]}</b></button>`).join('');}
const HINT='Touche un tas de déchets pour combattre son monstre · Glisse pour tourner';
$('#invRow').addEventListener('click',e=>{const b=e.target.closest('.icb');if(!b)return;const k=b.dataset.i;const C=Z.CITY;
  if(!S.items[k]){Z.toast(k==='cendrier'?'Bats un boss Mégotine pour obtenir un cendrier public !':"Fabrique cet objet à l'atelier ♻️");return;}
  C.sel=C.sel===k?null:k;renderCityInv();$('#hint').textContent=C.sel?`Touche un emplacement libre (cercle jaune) : ${Z.ITEMS[k].name}`:HINT;});
let drag=null;const c3d=$('#c3d');
c3d.addEventListener('pointerdown',e=>{if(Z.three.active()!=='ville')return;drag={x:e.clientX,y:e.clientY,a:Z.CITY.angle,moved:false};});
window.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>7||Math.abs(e.clientY-drag.y)>7)drag.moved=true;if(drag.moved){Z.CITY.angle=drag.a-dx*.009;Z.CITY.placeCam();}});
window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(d.moved)return;const h=Z.Ville.pick(e.clientX,e.clientY);if(!h)return;const C=Z.CITY;
  if(h.kind==='pile'){const def=Z.MONS[h.mon];Z.modal(`<div class="bigsvg">${Z.svgMon(h.mon)}</div><h3>Un ${def.name} se cache ici !</h3><p>Ce tas de déchets abrite un monstre${def.boss?' <b>boss</b>':''}. Bats-le en triant correctement pour <b>nettoyer ce lieu</b> de ta houma.</p><div class="btns"><button data-a="pilefight" data-k="${h.mon}" data-p="${h.idx}">Combattre ⚔️</button><button class="btn sec2" data-a="close">Plus tard</button></div>`);}
  else if(h.kind==='plot'){if(C.sel){const k=C.sel;S.items[k]--;const before=Z.cityScore();const rot=Z.Ville.place(h.plot,k);S.city.placed.push({plot:h.plot.idx,item:k,rot});Object.entries(Z.ITEMS[k].eff).forEach(([a,v])=>S.sc[a]+=v);
      S.stats.placed++;quest('place');addXP(10);const tot=renderScores();if(S.items[k]<=0)C.sel=null;renderCityInv();$('#hint').textContent=HINT;checkBadges();Z.save();
      if(before<60&&tot>=60)setTimeout(()=>Z.toast("🌤️ Le ciel de ta houma s'éclaircit !"),700);
      if(before<80&&tot>=80)setTimeout(()=>Z.modal(`<div class="big">🏆</div><h3>Houma modèle !</h3><p>Ta ville dépasse 80 % : des déchets triés, recyclés et transformés en un quartier où il fait bon vivre.</p><div class="fact">« Rien ne se jette, tout s'invente. »</div><div class="btns"><button data-a="close">Continuer</button></div>`),900);}
    else Z.toast(Object.values(S.items).some(v=>v>0)?"Choisis d'abord un objet en bas, puis touche cet emplacement":"Emplacement libre : fabrique des objets à l'atelier ♻️");}
  else if(h.kind==='placed')Z.toast(`${Z.ITEMS[h.item].emoji} ${Z.ITEMS[h.item].name} · ${Z.ITEMS[h.item].effTxt}`);});

/* ================= COLLECTION ================= */
function renderCollection(){$('#dex').innerHTML=Object.entries(Z.MONS).map(([k,d])=>{const n=S.dex[k]||0;return `<div class="mcard ${n?'':'lock'}" data-k="${k}">${n?`<span class="cnt">×${n}</span>`:''}${Z.svgMon(k)}<b>${n?d.name:'???'}</b><small>${n?(d.mat?Z.MAT[d.mat].name:'Boss toxique')+' → '+d.evo:'Pas encore capturé'}</small></div>`;}).join('');
  $('#guide').innerHTML=Z.WASTE.map(w=>`<div class="wrow"><span style="font-size:20px">${w.emoji}</span>${w.name}<span class="bn" style="background:${Z.MAT[w.mat].color}">${Z.MAT[w.mat].bin}</span></div>`).join('')+'<div class="wrow"><span style="font-size:20px">🚬</span>Mégots<span class="bn" style="background:#5E6B70">CENDRIER</span></div>';
  $('#matList').innerHTML=Z.MKEYS.map(k=>`<div class="stat"><b style="color:${Z.MAT[k].color}">${S.mat[k]}</b><small>${Z.MAT[k].name} recyclé</small><div style="font-size:10.5px;color:#7D8984;margin-top:3px">🎒 ${S.bag[k]} dans le sac</div></div>`).join('');}
$('#dex').addEventListener('click',e=>{const c=e.target.closest('.mcard');if(!c)return;const k=c.dataset.k,d=Z.MONS[k];if(!S.dex[k]){Z.toast('Capture-le pour découvrir sa fiche !');return;}
  Z.modal(`<div class="bigsvg">${Z.svgMon(k)}</div><h3>${d.name}</h3><p>${d.desc}</p><div class="rw"><span>${d.mat?Z.MAT[d.mat].name:'Mégots'}</span><span>→ ${d.evo}</span><span>Capturé ×${S.dex[k]}</span></div><div class="btns"><button data-a="close">Fermer</button></div>`);});

/* ================= PROFIL ================= */
function renderProfile(){ensureQuests();const L=Z.level(S.xp);$('#pAv').textContent=((S.name||'Z')[0]||'Z').toUpperCase();$('#pName').textContent=S.name||'Chasseur';$('#pHouma').textContent='📍 '+(S.houma||'Ma houma')+(S.demo?' · mode démo':'');
  $('#pXp').style.width=(L.cur/L.need*100)+'%';$('#pLvl').textContent=`Niveau ${L.l} · ${L.cur}/${L.need} XP · 🌿 ${S.gp} points verts`;
  const acc=S.stats.sorted+S.stats.wrong?Math.round(S.stats.sorted/(S.stats.sorted+S.stats.wrong)*100):0;
  $('#stats').innerHTML=[[S.stats.captures,'Monstres'],[S.stats.sorted,'Bons tris'],[acc+'%','Précision'],[S.stats.deposits,'Déposés'],[S.stats.crafts,'Objets'],[S.stats.cleaned,'Lieux nettoyés']].map(([v,t])=>`<div class="stat"><b>${v}</b><small>${t}</small></div>`).join('');
  $('#qDate').textContent=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  $('#quests').innerHTML=S.quests.ids.map(id=>{const q=Z.QUESTS.find(x=>x.id===id);const p=S.quests.prog[id]||0;const done=p>=q.n,cl=S.quests.claimed[id];return `<div class="quest"><span class="qi">${q.icon}</span><div class="qt">${q.txt.replace('{n}',q.n)}<div class="qb"><i style="width:${p/q.n*100}%"></i></div><small style="color:#7D8984">${p}/${q.n}</small></div><button data-q="${id}" ${!done||cl?'disabled':''}>${cl?'✓':'🎁 60🪙'}</button></div>`;}).join('');
  $('#badges').innerHTML=Z.BADGES.map(b=>`<div class="bdg ${S.badges[b.id]?'':'off'}"><span>${b.e}</span>${b.t}</div>`).join('');
  const me={n:S.houma||'Ma houma',s:Z.cityScore(),me:true};const list=[{n:'La Marsa',s:72},{n:'El Menzah',s:64},{n:'Ariana Ville',s:58},{n:'Bab Bhar',s:41},me].sort((a,b)=>b.s-a.s);
  $('#board').innerHTML=list.map((x,i)=>`<div class="lb ${x.me?'me':''}">${['🥇','🥈','🥉','4.','5.'][i]} ${x.n}${x.me?' (toi)':''}<b>${x.s} %</b></div>`).join('');
  $('#tgDemo').classList.toggle('on',!!S.demo);$('#tgSound').classList.toggle('on',!S.muted);}
$('#quests').addEventListener('click',e=>{const b=e.target.closest('button[data-q]');if(!b||b.disabled)return;S.quests.claimed[b.dataset.q]=1;addCoins(60);addXP(40);Z.beep('coin');Z.save();renderProfile();renderHUD();});
$('#tgDemo').addEventListener('click',()=>{Z.setDemo(!S.demo);renderProfile();Z.toast(S.demo?'🧭 Mode démo : touche la carte pour te déplacer':'📍 GPS activé');});
$('#tgSound').addEventListener('click',()=>{S.muted=!S.muted;Z.save();renderProfile();});
$('#btnReset').addEventListener('click',()=>Z.modal(`<div class="big">⚠️</div><h3>Tout recommencer ?</h3><p>Ta progression, tes objets et ta ville seront effacés.</p><div class="btns"><button class="btn warn" data-a="reset">Oui, réinitialiser</button><button class="btn sec2" data-a="close">Annuler</button></div>`));
$('#pBag').addEventListener('click',()=>{const rows=Z.MKEYS.map(k=>`<span style="background:#F1EEE2;color:#16302B"><i class="dot" style="background:${Z.MAT[k].color}"></i> ${S.bag[k]} ${Z.MAT[k].name}</span>`).join('');
  Z.modal(`<div class="big">🎒</div><h3>Mon sac (${Z.bagCount()}/${Z.BAG_CAP})</h3><div class="rw">${rows}</div><p>Les déchets triés pendant les combats restent dans ton sac jusqu'à ce que tu les déposes dans un <b>point de collecte ♻️</b> sur la carte. C'est là qu'ils deviennent des matières pour l'atelier.</p><div class="btns"><button data-a="close">OK</button></div>`);});

/* ================= MODAL ACTIONS ================= */
$('#modal').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target.id==='modal')Z.closeModal();return;}const a=b.dataset.a,id=b.dataset.id;
  if(a==='after'){const r=S.reports.find(x=>x.id===id);Z.closeModal();endBattle();if(r)afterFlow(r);return;}
  if(a==='report'){Z.closeModal();doReport();return;}
  Z.closeModal();
  if(a==='flee')endBattle();
  else if(a==='tab')setTab(b.dataset.t);
  else if(a==='fight'){const sp=Z.Map.spawns().find(s=>s.id===id);if(sp)startBattle({key:sp.key,spawnId:sp.id});}
  else if(a==='walk'){const sp=Z.Map.spawns().find(s=>s.id===id);if(sp)Z.Map.walkTo(sp,()=>{const s2=Z.Map.spawns().find(s=>s.id===id);if(s2)Z.onMonsterTap(s2,Z.dist(Z.Map.pos(),s2));});}
  else if(a==='walkc'){const c=Z.Map.centres().find(x=>x.id===id);if(c)Z.Map.walkTo(c,()=>Z.onCentreTap(c,Z.dist(Z.Map.pos(),c)));}
  else if(a==='walkl'){const r=S.reports.find(x=>x.id===id);if(r)Z.Map.walkTo(r,()=>Z.onLegendTap(r,Z.dist(Z.Map.pos(),r)));}
  else if(a==='deposit')deposit(id);
  else if(a==='legfight'){const r=S.reports.find(x=>x.id===id);if(r)startBattle({key:r.key,legendary:true,reportId:r.id});}
  else if(a==='pilefight')startBattle({key:b.dataset.k,pileIdx:+b.dataset.p});
  else if(a==='place'){Z.CITY.sel=b.dataset.i;setTab('ville');renderCityInv();$('#hint').textContent=`Touche un emplacement libre (cercle jaune) : ${Z.ITEMS[Z.CITY.sel].name}`;}
  else if(a==='reset')Z.reset();});

/* ================= ONBOARDING ================= */
const mons=['canettor','plastikor','kartouna','compostix'].map(k=>Z.svgMon(k)).join('');
function onb(step){const o=$('#onb');o.classList.remove('hidden');
  if(step===1)o.innerHTML=`<div class="badge2">GREEN HACKATHON · EL GHAZALA</div><div class="mons" style="margin-top:14px">${mons}</div><h1>Zebla<br><span>Monsters</span></h1><p>Chaque déchet mal jeté donne naissance à un monstre. Chasse-les dans ta vraie ville, trie pour les capturer, recycle, et reconstruis ta houma.</p><div class="sl">« Rien ne se jette, tout s'invente. »</div><button class="gbtn" id="o1">Commencer ▶</button>`;
  if(step===2)o.innerHTML=`<h1 style="font-size:30px">Qui es-tu,<br><span>chasseur ?</span></h1><p>Ton pseudo et ta houma (ton quartier).</p><input id="oName" maxlength="16" placeholder="Ton pseudo" value="${S.name||''}"><input id="oHouma" maxlength="22" placeholder="Ta houma (ex. El Menzah)" value="${S.houma||''}"><button class="gbtn" id="o2">Continuer</button>`;
  if(step===3)o.innerHTML=`<h1 style="font-size:30px">Comment<br><span>jouer ?</span></h1><div class="how"><div><span>🗺️</span><div><b>Explore</b> la vraie carte : des monstres apparaissent autour de toi.</div></div><div><span>⚔️</span><div><b>Combats</b> en triant les déchets dans le bon bac. Une erreur rend le monstre plus fort !</div></div><div><span>♻️</span><div><b>Dépose</b> ton sac dans un point de collecte : les déchets deviennent des matières.</div></div><div><span>🛠️</span><div><b>Fabrique</b> des bancs, des vélos et des oliviers à l'atelier…</div></div><div><span>🏙️</span><div>… et <b>reconstruis</b> ta houma. 📸 Signale aussi les décharges sauvages !</div></div></div><button class="gbtn" id="o3">J'ai compris</button>`;
  if(step===4)o.innerHTML=`<div class="big" style="font-size:60px">📍</div><h1 style="font-size:28px">Active ta<br><span>position</span></h1><p>Le jeu utilise ta position pour faire apparaître les monstres autour de toi. Elle reste sur ton téléphone.</p><button class="gbtn" id="oGps">📍 Activer ma position</button><button class="gbtn ghost" id="oDemo">🧭 Mode démo (El Ghazala, sans GPS)</button><p style="font-size:12px;margin-top:14px;opacity:.75">Joue toujours en faisant attention à la circulation. 🚸</p>`;
  const go=(fn)=>e=>{Z.audioInit();Z.beep('tap');fn();};
  if(step===1)$('#o1').onclick=go(()=>onb(2));
  if(step===2)$('#o2').onclick=go(()=>{const n=$('#oName').value.trim(),h=$('#oHouma').value.trim();if(!n){Z.toast('Choisis un pseudo');return;}S.name=n;S.houma=h||'Ma houma';Z.save();onb(3);});
  if(step===3)$('#o3').onclick=go(()=>onb(4));
  if(step===4){$('#oGps').onclick=go(()=>finishOnb(false));$('#oDemo').onclick=go(()=>finishOnb(true));}}
function finishOnb(demo){S.onboarded=true;S.demo=demo;Z.save(true);const o=$('#onb');o.style.transition='opacity .4s';o.style.opacity=0;setTimeout(()=>{o.classList.add('hidden');o.style.opacity=1;},400);boot();
  setTimeout(()=>Z.toast(demo?'🧭 Touche la carte pour te déplacer, puis touche un monstre !':'👾 Approche-toi d\'un monstre et touche-le pour combattre !',3500),900);}

/* ================= BOOT ================= */
let booted=false;
function boot(){if(booted)return;booted=true;ensureQuests();renderHUD();Z.Map.init();Z.Ville.build();Z.Map.startGPS();if(S.demo)$('#demoBadge').classList.remove('hidden');setTab('map');
  const pl=document.querySelector('.pl .core');if(pl)pl.textContent=((S.name||'Z')[0]||'Z').toUpperCase();}
document.addEventListener('click',()=>Z.audioInit(),{once:true});
window.addEventListener('load',()=>{$('#loading').classList.add('hidden');
  if(typeof maplibregl==='undefined'||typeof THREE==='undefined'){$('#loading').classList.remove('hidden');$('#loading').textContent='Erreur de chargement des bibliothèques.';return;}
  if(!S.onboarded)onb(1);else boot();});
if('serviceWorker' in navigator&&location.protocol==='https:'&&!/claude|usercontent/.test(location.host)){navigator.serviceWorker.register('sw.js').catch(()=>{});}
})();
