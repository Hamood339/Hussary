# Hussary Quran

Un lecteur Coran premium, hors ligne, dédié à la récitation du Cheikh
Mahmoud Khalil Al-Hussary. Construit comme une Progressive Web App :
installable, sans backend, sans connexion internet requise après
l'installation.

## Stack technique

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn-style UI
maison · Framer Motion · Zustand · React Router · IndexedDB (via `idb`) ·
Workbox (via `vite-plugin-pwa`) · Lucide Icons.

## 1. Installer les dépendances

```bash
npm install
```

## 2. Ajouter vos fichiers audio

Copiez vos 114 fichiers MP3 (déjà en votre possession) dans
`public/audio/`, nommés sur 3 chiffres :

```
public/audio/001.mp3   # Al-Fatiha
public/audio/002.mp3   # Al-Baqara
...
public/audio/114.mp3   # An-Nas
```

Toutes les métadonnées (noms arabe / français / anglais, nombre de
versets, lieu de révélation...) sont déjà intégrées dans
`src/data/surahs.ts` — vous n'avez rien à éditer. L'application ne
télécharge jamais d'audio depuis internet ; elle lit uniquement les
fichiers locaux de ce dossier.

> Les durées affichées avant la première lecture d'une sourate sont des
> estimations. Dès qu'une sourate est lue une première fois, le
> navigateur mesure sa durée réelle et l'utilise ensuite pour la barre de
> progression et l'affichage du temps restant.

## 3. Lancer en développement

```bash
npm run dev
```

## 4. Construire pour la production

```bash
npm run build
npm run preview   # pour tester le build localement
```

Le dossier `dist/` contient l'application statique complète (HTML, JS,
CSS, service worker, manifest). Déployez-le sur n'importe quel
hébergement statique (ou ouvrez-le avec `npm run preview` / un serveur
statique de votre choix). Le routage utilise `HashRouter`, donc aucune
configuration serveur particulière (réécriture d'URL) n'est nécessaire.

## Fonctionnalités

- **100 % hors ligne** après le premier chargement : app shell, icônes et
  polices sont pré-cachées par le service worker ; chaque sourate est mise
  en cache automatiquement dès sa première lecture (cache audio dédié,
  avec support des requêtes par plages pour l'avance/retour rapide).
- **Lecteur complet** : mini-lecteur persistant + lecteur plein écran,
  vitesse de lecture (0.75× à 2×), répétition (off / toutes / une seule),
  lecture automatique, contrôles sur écran verrouillé et notifications via
  la Media Session API, raccourcis clavier de base.
- **Minuterie de sommeil** : 15 / 30 / 45 min, 1 heure, ou fin de la
  sourate en cours.
- **Favoris, historique (30 dernières écoutes), reprise automatique de
  lecture et marque-pages illimités**, tous stockés localement en
  IndexedDB.
- **Recherche instantanée** (arabe, français, anglais, numéro) et tri
  (numéro, alphabétique, lieu de révélation).
- **Statistiques** : temps d'écoute total, favoris, sourates terminées,
  série de jours consécutifs.
- **PWA installable** : bannière d'installation personnalisée, écran de
  démarrage, notification de mise à jour, icônes adaptatives.
- **Thème clair / sombre / système**, réinitialisation complète des
  données, estimation du stockage utilisé.

## Structure du projet

```
src/
  components/   composants réutilisables (ui, layout, player, surah, home, common)
  data/         métadonnées générées des 114 sourates
  hooks/        hooks React (ex. invite d'installation PWA)
  layouts/      structure de page (AppShell)
  lib/          IndexedDB, utilitaires
  pages/        Accueil, Sourates, Favoris, Récemment écoutées, Réglages
  services/     moteur audio partagé (Media Session API)
  store/        stores Zustand (lecteur, bibliothèque, réglages)
  types/        types TypeScript partagés
```
