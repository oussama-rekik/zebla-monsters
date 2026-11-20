# 👾 Zebla Monsters

Jeu mobile de recyclage géolocalisé, prototype pour le **Green Hackathon 2026** (Pôle Technologique El Ghazala).

> « Rien ne se jette, tout s'invente. »

Chaque déchet mal jeté donne naissance à un monstre. Le joueur les chasse sur une **vraie carte** de sa ville, les capture en **triant correctement**, dépose ses déchets dans un **point de collecte**, les transforme à l'**atelier** et **reconstruit sa houma**.

---

## 1. Ce que contient le jeu

| Écran | Ce qu'on y fait |
|---|---|
| 🗺️ **Carte** | Vraie carte OpenStreetMap avec des couleurs de jeu (routes blanches et jaunes, parcs verts, mer bleue, bâtiments blancs en 3D). Position GPS en direct. Les monstres apparaissent autour du joueur, selon le lieu : Compostix près des espaces verts, Plastikor près de l'eau, Kartouna et Canettor près des commerces. |
| ⚔️ **Combat 3D** | Le monstre lance des déchets, il faut toucher le bon bac. Une erreur rend le monstre plus fort. Combos, boss Mégotine, légendaires couronnés. |
| ♻️ **Points de collecte** | Les déchets triés vont dans le 🎒 sac (40 places). Ils deviennent des **matières** seulement quand on les dépose dans un point de collecte : supermarchés et points de recyclage trouvés sur la carte, plus 2 points de démo. Le dépôt rapporte aussi des 🌿 points verts. |
| 🛠️ **Atelier 3D** | Tapis roulant, machine et vraies étapes du recyclage (broyage, fusion à 660 °C, mise en pâte, compostage). Fabrication de bancs, vélos, boîtes à livres, oliviers et points de tri. |
| 🏙️ **Ville 3D** | Une houma tunisienne à nettoyer puis à construire. Indicateurs Propreté, Air et Vie. Le ciel s'éclaircit, des habitants apparaissent. |
| 📸 **Signalement** | Photo d'une décharge sauvage (GPS et heure), qui fait apparaître un **légendaire**. Ensuite : combat, photo « après », validation communautaire (simulée), puis **cooldown 30 jours**. |
| 📖 **Collection** | Zeblapédia des monstres et guide du tri. |
| 👤 **Profil** | Niveau et XP, statistiques, **3 quêtes par jour**, badges, classement des houmas (simulé), mode démo, règles anti-triche. |

**Règles anti-triche intégrées :**
- Récompense au dépôt, pas au ramassage.
- Cooldown de 30 jours par lieu nettoyé.
- Signaleur ≠ nettoyeur (sinon 20 % de la récompense).
- Photo « après » au moins 15 min après la photo « avant ».
- 5 signalements par jour maximum.
- Points verts une fois toutes les 30 min par point de collecte.

**Mode démo** (pour jouer en intérieur devant le jury) : la position part du Pôle El Ghazala et on se déplace en touchant la carte.

Sans internet, le jeu génère automatiquement une **carte de secours** stylisée.

La progression est sauvegardée sur le téléphone.

---

## 2. Obtenir l'APK (fichier d'installation Android)

L'APK est fabriqué **automatiquement par GitHub** : vous n'avez rien à installer.

### Étape A — Mettre le projet sur GitHub
1. Créez un compte gratuit sur **github.com** si vous n'en avez pas.
2. Cliquez sur **New repository**, nommez-le `zebla-monsters`, choisissez **Public**, puis **Create repository**.
3. Sur la page du dépôt, cliquez sur **uploading an existing file**.
4. Dézippez `zebla-monsters.zip` sur un ordinateur, puis **glissez tout le contenu** du dossier (`www`, `android`, `.github`, `package.json`…) dans la page.
   - ⚠️ Le dossier `.github` est caché sur certains ordinateurs : affichez les fichiers cachés pour le voir.
5. Cliquez sur **Commit changes**.

> Plus simple : donnez à Claude le nom de votre dépôt GitHub. Il peut y envoyer le code directement.

### Étape B — Récupérer l'APK
1. Ouvrez l'onglet **Actions** du dépôt. Le travail « Construire l'APK Android » démarre tout seul (environ 5 à 8 minutes).
2. Une fois qu'il est vert ✅, allez dans **Releases** (colonne de droite de la page d'accueil du dépôt).
3. **Depuis le téléphone**, ouvrez cette page et téléchargez `zebla-monsters.apk`.

### Étape C — Installer sur le téléphone Android
1. Ouvrez le fichier `zebla-monsters.apk` téléchargé.
2. Android demande d'autoriser l'installation depuis cette source : acceptez (**Paramètres > Installer des applis inconnues**).
3. Lancez **Zebla Monsters**, puis acceptez les autorisations **Position** et **Appareil photo**.

> Cet APK est une version « debug » non signée pour le Play Store. C'est parfait pour un prototype de hackathon. Pour publier sur Google Play, il faudra une version signée (`./gradlew bundleRelease` avec une clé).

---

## 3. Version web (iPhone + Android, sans installation)

Le même dépôt publie aussi le jeu en ligne :
1. Dans le dépôt, ouvrez **Settings > Pages > Source**, puis choisissez **GitHub Actions**.
2. Après le travail « Publier la version web », le jeu est accessible à `https://VOTRE-NOM.github.io/zebla-monsters/`.
3. Sur le téléphone, ouvrez ce lien, puis **Menu ⋮ > Ajouter à l'écran d'accueil**. Le jeu s'ouvre alors comme une application, en plein écran, avec le GPS.

---

## 4. Pour les développeurs

```
www/                  ← le jeu (HTML/CSS/JS, aucune compilation nécessaire)
  index.html          ← écrans et styles
  js/data.js          ← données (monstres, déchets, recettes, quêtes, badges), sauvegarde, utilitaires
  js/models.js        ← modèles 3D (Three.js)
  js/scenes.js        ← scènes 3D : combat, atelier, ville
  js/map.js           ← carte MapLibre stylisée, GPS, apparitions, points de collecte, légendaires
  js/app.js           ← logique du jeu, interface, onboarding, quêtes, badges
  lib/                ← Three.js r128, MapLibre GL 4.7.1 (inclus, fonctionne hors-ligne)
android/              ← projet Android (Capacitor 8), permissions GPS et caméra déjà ajoutées
.github/workflows/    ← fabrication automatique de l'APK et publication web
```

- **Tester sur ordinateur :** `cd www && python3 -m http.server 8000`, puis ouvrez `http://localhost:8000`. Dans le navigateur, le mode « téléphone » des outils de développement aide à voir l'écran mobile.
- **Fabriquer l'APK en local** (Android Studio requis) : `npm install`, puis `npx cap sync android`, puis `cd android && ./gradlew assembleDebug`.
- **Carte :** tuiles vectorielles gratuites **OpenFreeMap** (données © contributeurs OpenStreetMap), sans clé d'API. Les couleurs se modifient dans `PAL` (fichier `js/map.js`).

### Ce qui est simulé dans ce prototype (à brancher ensuite)
- Validation communautaire des photos : simulée par 3 votes automatiques. Ensuite : un backend (Firebase ou Supabase) et les votes de vrais joueurs proches, puis une IA.
- Points de collecte : les POI OpenStreetMap et 2 points de démo. Ensuite : une base des vrais points Eco-Lef, des bacs partenaires et des barbechas partenaires, avec QR code.
- Classement des houmas : valeurs d'exemple. Ensuite : un classement en ligne.
- Tableau de bord municipal : à construire à partir des signalements.

---

Prototype Green Hackathon 2026 · Carte © contributeurs OpenStreetMap, tuiles OpenFreeMap · Three.js (MIT), MapLibre GL (BSD-3).
