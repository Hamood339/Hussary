// Types partages entre le script de generation (scripts/build-quran-data.mjs)
// et l'application. Le format des fichiers dans public/quran/ DOIT rester
// aligne avec ces types.

export const MUSHAF_TOTAL_PAGES = 604;

export type MushafLineType = 'ayah' | 'surah_name' | 'basmallah';

export interface MushafWord {
  /** Glyphe QCF v2 (chaine en zone privee Unicode) a rendre avec la police de la page. */
  code: string;
  /** Vrai texte Uthmani, pour le presse-papier, l'aria-label et le mode texte simple. */
  text: string;
  /** "sourate:ayah:mot", ex. "2:6:1". Absent pour les marqueurs de fin d'ayah. */
  key?: string;
  surah: number;
  ayah: number;
  /** true pour le glyphe ornemental de fin d'ayah (numero du verset). */
  isEnd?: boolean;
}

export interface MushafLine {
  /** Numero de ligne imprime, 1..15 (moins sur les pages 1-2). */
  line: number;
  type: MushafLineType;
  centered: boolean;
  /** Mots de la ligne (uniquement pour type === 'ayah'). */
  words?: MushafWord[];
  /** Numero de sourate (uniquement pour type === 'surah_name'). */
  surah?: number;
}

export interface MushafPageData {
  page: number;
  juz: number;
  lines: MushafLine[];
}

export interface MushafSurahMeta {
  number: number;
  arabicName: string;
  name: string;
  startPage: number;
}

export interface MushafJuzMeta {
  number: number;
  startPage: number;
}

export interface ReadingPositionRecord {
  page: number;
  updatedAt: number;
}

export interface MushafMeta {
  version: number;
  totalPages: number;
  /** Index par page : sourates presentes + juz. */
  pages: { page: number; juz: number; surahs: number[] }[];
  surahs: MushafSurahMeta[];
  juz: MushafJuzMeta[];
}
