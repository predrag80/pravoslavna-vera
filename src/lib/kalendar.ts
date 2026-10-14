/**
 * Црквени календар Српске православне цркве.
 *
 * Све се рачуна локално, без спољног API-ја:
 *  - Васкрс по јулијанској пасхалији (Meeus), претворен у грегоријански датум;
 *  - непокретни празници се чувају по старом (јулијанском) календару;
 *  - покретни празници се рачунају као померај од Васкрса;
 *  - пост се одређује из вишедневних постова, среде/петка и мрсних седмица.
 *
 * Разлика између календара је 13 дана за године 1900–2099.
 */
import praznici from '../data/praznici.json' with { type: 'json' };

export type Vrsta = 'crveno' | 'praznik' | 'vaskrs' | 'post';

export interface Praznik {
  id: string;
  naziv: string;
  vrsta: Vrsta;
  opis: string;
  pokretni: boolean;
  datum: Date; // грегоријански, у поноћ по UTC
}

export interface PostDana {
  posno: boolean;
  naziv: string; // нпр. „Божићни пост“, „Среда“, „Мрсни дан“
}

const DAN = 86_400_000;
const RAZLIKA = 13;

/** Датум као UTC поноћ, да рачунање дана не зависи од временске зоне. */
export function utc(godina: number, mesec: number, dan: number): Date {
  return new Date(Date.UTC(godina, mesec - 1, dan));
}

export function danas(): Date {
  const d = new Date();
  return utc(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function dodajDane(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAN);
}

export function razlikaDana(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DAN);
}

export function isti(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

/** Православни Васкрс (грегоријански датум) за дату годину. */
export function vaskrs(godina: number): Date {
  const a = godina % 4;
  const b = godina % 7;
  const c = godina % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const mesec = Math.floor((d + e + 114) / 31);
  const dan = ((d + e + 114) % 31) + 1;
  return dodajDane(utc(godina, mesec, dan), RAZLIKA);
}

/** Датум по старом календару за дати грегоријански датум. */
export function poStarom(d: Date): { dan: number; mesec: number } {
  const j = dodajDane(d, -RAZLIKA);
  return { dan: j.getUTCDate(), mesec: j.getUTCMonth() + 1 };
}

/** Грегоријански датум непокретног празника (по старом m/d) у грегоријанској години. */
function izStarog(godina: number, mesec: number, dan: number): Date {
  return dodajDane(utc(godina, mesec, dan), RAZLIKA);
}

interface UlazNepokretni { id: string; naziv: string; vrsta: Vrsta; stari: [number, number]; opis: string }
interface UlazPokretni { id: string; naziv: string; vrsta: Vrsta; odVaskrsa: number; opis: string }

/** Сви празници који падају у дату грегоријанску годину, сортирани по датуму. */
export function prazniciGodine(godina: number): Praznik[] {
  const p = vaskrs(godina);
  const lista: Praznik[] = [];
  for (const u of praznici.nepokretni as UlazNepokretni[]) {
    // Празник по старом календару може да падне у ову или наредну грегоријанску годину
    // (нпр. Божић 25. 12. по старом је 7. јануар), па проверавамо обе.
    for (const g of [godina - 1, godina]) {
      const d = izStarog(g, u.stari[0], u.stari[1]);
      if (d.getUTCFullYear() === godina) {
        lista.push({ id: u.id, naziv: u.naziv, vrsta: u.vrsta, opis: u.opis, pokretni: false, datum: d });
      }
    }
  }
  for (const u of praznici.pokretni as UlazPokretni[]) {
    lista.push({ id: u.id, naziv: u.naziv, vrsta: u.vrsta, opis: u.opis, pokretni: true, datum: dodajDane(p, u.odVaskrsa) });
  }
  return lista.sort((a, b) => a.datum.getTime() - b.datum.getTime());
}

export function prazniciDana(d: Date): Praznik[] {
  return prazniciGodine(d.getUTCFullYear()).filter((x) => isti(x.datum, d));
}

/** Наредни празници од датог дана (укључујући тај дан). */
export function narednih(d: Date, koliko = 3, samo?: (p: Praznik) => boolean): Praznik[] {
  const g = d.getUTCFullYear();
  return [...prazniciGodine(g), ...prazniciGodine(g + 1)]
    .filter((x) => x.datum.getTime() >= d.getTime() && (!samo || samo(x)))
    .slice(0, koliko);
}

function uOpsegu(d: Date, od: Date, doDana: Date): boolean {
  return d.getTime() >= od.getTime() && d.getTime() <= doDana.getTime();
}

/** Вишедневни постови који додирују дату годину. */
export function visednevniPostovi(godina: number): { naziv: string; od: Date; do: Date }[] {
  const lista: { naziv: string; od: Date; do: Date }[] = [];
  for (const g of [godina - 1, godina, godina + 1]) {
    const p = vaskrs(g);
    lista.push({ naziv: 'Велики пост', od: dodajDane(p, -48), do: dodajDane(p, -1) });
    // Петровски пост почиње у понедељак после Недеље свих светих и траје до Петровдана.
    const petrovdan = izStarog(g, 6, 29);
    const pocetak = dodajDane(p, 57);
    if (pocetak.getTime() < petrovdan.getTime()) {
      lista.push({ naziv: 'Петровски пост', od: pocetak, do: dodajDane(petrovdan, -1) });
    }
    lista.push({ naziv: 'Госпојински пост', od: izStarog(g, 8, 1), do: izStarog(g, 8, 14) });
    lista.push({ naziv: 'Божићни пост', od: izStarog(g, 11, 15), do: izStarog(g, 12, 24) });
  }
  return lista;
}

/** Једнодневни постови по старом календару. */
const JEDNODNEVNI: { stari: [number, number]; naziv: string }[] = [
  { stari: [1, 5], naziv: 'Крстовдан (Богојављенско навечерје)' },
  { stari: [8, 29], naziv: 'Усековање' },
  { stari: [9, 14], naziv: 'Крстовдан' },
];

/**
 * Да ли је дан посни и зашто.
 * Ово је поједностављено правило; степен поста (на води, на уљу, риба)
 * треба да одреди и провери свештеник пре објављивања.
 */
export function post(d: Date): PostDana {
  const g = d.getUTCFullYear();
  for (const v of visednevniPostovi(g)) {
    if (uOpsegu(d, v.od, v.do)) return { posno: true, naziv: v.naziv };
  }
  const s = poStarom(d);
  for (const j of JEDNODNEVNI) {
    if (s.mesec === j.stari[0] && s.dan === j.stari[1]) return { posno: true, naziv: j.naziv };
  }
  // Мрсне седмице: Светла, Тројичина, Свјатки (од Божића до Крстовдана), седмица Митара и фарисеја.
  for (const godina of [g - 1, g]) {
    const p = vaskrs(godina);
    const mrsne: [Date, Date][] = [
      [p, dodajDane(p, 6)],
      [dodajDane(p, 50), dodajDane(p, 56)],
      [dodajDane(p, -69), dodajDane(p, -64)],
    ];
    if (mrsne.some(([a, b]) => uOpsegu(d, a, b))) return { posno: false, naziv: 'Мрсна седмица' };
  }
  const bozic = izStarog(g - 1, 12, 25); // 7. јануар ове године
  if (uOpsegu(d, bozic, dodajDane(bozic, 10))) return { posno: false, naziv: 'Свјатки, мрсна седмица' };
  const dan = d.getUTCDay();
  if (dan === 3) return { posno: true, naziv: 'Среда' };
  if (dan === 5) return { posno: true, naziv: 'Петак' };
  return { posno: false, naziv: 'Мрсни дан' };
}

/** Почетак црквене године (1. септембар по старом = 14. септембар) у којој је дати дан. */
export function pocetakCrkveneGodine(d: Date): Date {
  const g = d.getUTCFullYear();
  const ove = izStarog(g, 9, 1);
  return d.getTime() >= ove.getTime() ? ove : izStarog(g - 1, 9, 1);
}
