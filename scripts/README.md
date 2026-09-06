# Données du Mushaf

L'écran Mushaf (`/mushaf`) lit des fichiers statiques dans `public/quran/` :

```
public/quran/
  meta.json                    # index (sourates, juz, pages)
  pages/001.json .. 604.json    # une page du Mushaf de Médine chacune
  fonts/v2/p1.woff2 .. p604.woff2   # police QCF v2, une par page
  fonts/v2/surah-name.woff2
  fonts/v2/basmallah.woff2
```

Ces fichiers **ne sont pas dans le dépôt** au départ : il faut les générer une fois,
puis les committer (ils sont légers, ~10–18 Mo au total).

## 1. Récupérer la source

Sur <https://qul.tarteel.ai> — **trois** éléments :

1. **Mushaf layout** → *Resources → Mushaf layouts* → **« KFGQPC V2 »
   (Madani, 15 lignes)**, format **SQLite** → `scripts/data-src/qpc-v2.db`.
   Contient la structure des 604 pages : `line_type` (`ayah` / `basmallah` /
   `surah_name`), `is_centered`, `first_word_id` / `last_word_id`
   (compteur global 1 → 83668), `surah_number`. **Pas les glyphes.**

2. **Texte des mots (glyphes QCF v2)** → *Resources → Ayah / Word text* →
   l'export **QPC V2 (Hafs)** en **SQLite** → `scripts/data-src/words.db`.
   Doit avoir ~**83668 lignes**, une colonne `id` (alignée sur le layout) et
   une colonne glyphe (`code_v2` ou `text`), idéalement `text_uthmani` /
   `location`.
   > À défaut, si `words.db` est absent, le script récupère les glyphes via
   > `api.quran.com` — **mais** l'alignement diverge sur ~40 pages ; ne l'utilise
   > que pour une maquette, jamais pour la prod.

   Vérifie la base avant de générer :
   ```bash
   node scripts/inspect-db.mjs scripts/data-src/words.db
   ```

3. **Polices** → *Resources → Fonts* → paquet **QCF V2 (woff2)**.
   Décompresser dans `public/quran/fonts/v2/` → `p1.woff2` … `p604.woff2`.
   > Le paquet ne contient pas de police pour les bandeaux de sourate ni la
   > basmala : ces lignes sont rendues en repli avec la police *Amiri*.
   > Si les fichiers sont nommés autrement, adapte `fontUrlForPage()` dans
   > `src/lib/mushafFont.ts`.

## 2. Générer

```bash
node scripts/build-quran-data.mjs
```

Produit `public/quran/meta.json` et `public/quran/pages/*.json`.

## 3. Committer

```bash
git add public/quran scripts/data-src/.gitkeep
git commit -m "Ajout des données du Mushaf (QCF v2)"
```

> `scripts/data-src/qpc-v2.db` peut rester hors du dépôt (il est volumineux et
> n'est qu'une source intermédiaire). Les `.gitignore` du projet ne l'excluent
> pas : ajoute `scripts/data-src/*.db` si tu préfères.

## Licence

Le texte et les polices proviennent du **King Fahd Glorious Qur'an Printing
Complex (KFGQPC)** via QUL. Conserver les fichiers de licence fournis par QUL
et l'attribution. Faire **relire le rendu** par une personne compétente avant
toute mise en production.
