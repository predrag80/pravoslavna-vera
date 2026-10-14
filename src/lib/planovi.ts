/** Планови читања Светог писма: делови по данима, без бодова и низова. */
import knjige from '../data/knjige.json' with { type: 'json' };
import { KATIZME, lxxUHebrejski } from './psalmi.ts';

export interface Deo { knjiga: string; glava: number; od?: number; do?: number; naziv: string }
export interface Plan { id: string; naziv: string; opis: string; dani: Deo[][] }

interface K { id: string; kratko: string; glava: number }
const sve = [...knjige.stariZavet, ...knjige.noviZavet].flatMap((g) => g.knjige) as K[];
const k = (id: string) => sve.find((x) => x.id === id)!;

function glave(ids: string[]): Deo[] {
  return ids.flatMap((id) => Array.from({ length: k(id).glava }, (_, i) => ({ knjiga: id, glava: i + 1, naziv: `${k(id).kratko} ${i + 1}` })));
}

/** Равномерно распоређује делове на дати број дана (први дани добијају вишак). */
export function rasporedi<T>(delovi: T[], brojDana: number): T[][] {
  const dani: T[][] = [];
  let i = 0;
  for (let d = 0; d < brojDana; d++) {
    const n = Math.floor(delovi.length / brojDana) + (d < delovi.length % brojDana ? 1 : 0);
    dani.push(delovi.slice(i, i + n));
    i += n;
  }
  return dani;
}

const nzRedom = [...knjige.noviZavet].flatMap((g) => g.knjige.map((x) => x.id));

export const PLANOVI: Plan[] = [
  {
    id: 'jevandjelja-40',
    naziv: 'Четири Јеванђеља за 40 дана',
    opis: 'Матеј, Марко, Лука и Јован, две до три главе дневно. Добро за Велики или Божићни пост.',
    dani: rasporedi(glave(['matej', 'marko', 'luka', 'jovan']), 40),
  },
  {
    id: 'psaltir-20',
    naziv: 'Псалтир за 20 дана',
    opis: 'Једна катизма дневно, како се Псалтир чита у Цркви.',
    dani: KATIZME.map(([od, doBr], i) => {
      const prvi = lxxUHebrejski(od);
      const poslednji = lxxUHebrejski(doBr);
      return Array.from({ length: poslednji - prvi + 1 }, (_, j) => ({ knjiga: 'psalmi', glava: prvi + j, naziv: `Псалам ${prvi + j}` })).map((x, j, niz) =>
        j === 0 ? { ...x, naziv: `Катизма ${i + 1}: ${x.naziv}${niz.length > 1 ? `–${poslednji}` : ''}` } : x,
      );
    }),
  },
  {
    id: 'dela-28',
    naziv: 'Дела апостолска за 28 дана',
    opis: 'Почетак Цркве, глава по глава. Чита се од Васкрса до Духова.',
    dani: rasporedi(glave(['dela']), 28),
  },
  {
    id: 'novi-zavet-260',
    naziv: 'Нови завет за 260 дана',
    opis: 'Једна глава дневно, црквеним редом књига.',
    dani: rasporedi(glave(nzRedom), 260),
  },
];

export function plan(id: string): Plan | undefined {
  return PLANOVI.find((p) => p.id === id);
}
