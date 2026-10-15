import fs from 'node:fs';
import path from 'node:path';
import knjige from '@/data/knjige.json';

export interface Knjiga { id: string; kratko: string; naziv: string; glava: number; zavet: 'stari' | 'novi'; usfm: string }
export interface Grupa { id: string; naziv: string; opis: string; knjige: Knjiga[] }

export const stariZavet = knjige.stariZavet as Grupa[];
export const noviZavet = knjige.noviZavet as Grupa[];
export const vanPrevoda = knjige.vanPrevoda;
export const sveKnjige: Knjiga[] = [...stariZavet, ...noviZavet].flatMap((g) => g.knjige);

export function knjiga(id: string): Knjiga | undefined {
  return sveKnjige.find((k) => k.id === id);
}

/** Текст главе, ако је увезен скриптом `npm run uvoz:biblija` (src/data/biblija/<књига>.json). */
export function tekstGlave(id: string, glava: number): string[] | null {
  const fajl = path.join(process.cwd(), 'src', 'data', 'biblija', `${id}.json`);
  if (!fs.existsSync(fajl)) return null;
  const sadrzaj = JSON.parse(fs.readFileSync(fajl, 'utf8')) as Record<string, string[]>;
  return sadrzaj[String(glava)] ?? null;
}

export function brojKnjiga(n: number): string {
  const m10 = n % 10, m100 = n % 100;
  return `${n} ${m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'књиге' : 'књига'}`;
}

export interface Stih { knjiga: string; glava: number; stih: number; tekst: string }

/** Стихови одломка (може да пређе у следећу главу); null ако текст књиге још није увезен. */
export function stihoviOdlomka(o: { knjiga: string; od: { glava: number; stih: number }; do: { glava: number; stih: number } }): Stih[] | null {
  const rezultat: Stih[] = [];
  for (let g = o.od.glava; g <= o.do.glava; g++) {
    const tekst = tekstGlave(o.knjiga, g);
    if (!tekst) return null;
    const od = g === o.od.glava ? o.od.stih : 1;
    const doS = g === o.do.glava ? Math.min(o.do.stih, tekst.length) : tekst.length;
    for (let s = od; s <= doS; s++) rezultat.push({ knjiga: o.knjiga, glava: g, stih: s, tekst: tekst[s - 1]! });
  }
  return rezultat;
}
