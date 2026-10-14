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

/** Степен поста, од најблажег до најстрожег. */
export type StepenPosta = 'mrsno' | 'beli-mrs' | 'riba' | 'ulje' | 'voda' | 'uzdrzanje';

export const STEPENI: Record<StepenPosta, { naziv: string; opis: string }> = {
  mrsno: { naziv: 'Мрсно', opis: 'Нема поста.' },
  'beli-mrs': { naziv: 'Бели мрс', opis: 'Млеко, сир и јаја су дозвољени, месо није.' },
  riba: { naziv: 'Риба', opis: 'Посна храна са рибом, уљем и вином.' },
  ulje: { naziv: 'На уљу', opis: 'Посна храна са уљем и вином, без рибе.' },
  voda: { naziv: 'На води', opis: 'Посна храна без уља и вина.' },
  uzdrzanje: { naziv: 'Уздржање', opis: 'Најстрожи пост; по могућности без хране до вечери.' },
};

export interface PostDana {
  posno: boolean;
  naziv: string; // нпр. „Божићни пост“, „Среда“, „Мрсни дан“
  stepen: StepenPosta;
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

/** Велики (Дванаестоднебни) празници: ако падну у среду или петак ван поста, разрешава се на рибу. */
const VELIKI = new Set(['mala-gospojina', 'krstovdan', 'vavedenje', 'sretenje', 'blagovesti', 'cveti', 'spasovdan', 'duhovi', 'preobrazenje', 'velika-gospojina']);

function dan(stepen: StepenPosta, naziv: string): PostDana {
  return { posno: stepen !== 'mrsno', naziv, stepen };
}

/**
 * Пост за дати дан, по Типику, у облику какав објављују црквени календари.
 *
 * ПРЕДЛОГ ЗА ПРЕГЛЕД: правила треба да потврди свештеник пре објављивања,
 * а апликација кориснику свуда саветује да се о посту посаветује са духовником.
 *
 * Редослед провере: мрсне седмице → једнодневни строги постови → Велики пост → Сирна седмица
 * → Божићни, Петровски и Госпојински пост → среда и петак преко године.
 */
export function post(d: Date): PostDana {
  const g = d.getUTCFullYear();
  const s = poStarom(d);
  const naStarom = (m: number, dd: number) => s.mesec === m && s.dan === dd;
  const nedelja = d.getUTCDay(); // 0 = недеља, 3 = среда, 5 = петак, 6 = субота
  const vikend = nedelja === 0 || nedelja === 6;
  const praznici = prazniciDana(d).map((x) => x.id);

  // 1. Мрсне седмице: Светла, Тројичина, седмица Митара и фарисеја, Свјатки (од Божића до Крстовдана).
  for (const godina of [g - 1, g]) {
    const p = vaskrs(godina);
    const mrsne: [Date, Date, string][] = [
      [p, dodajDane(p, 6), 'Светла седмица'],
      [dodajDane(p, 50), dodajDane(p, 56), 'Тројичина седмица'],
      [dodajDane(p, -69), dodajDane(p, -64), 'Седмица Митара и фарисеја'],
    ];
    for (const [a, b, naziv] of mrsne) if (uOpsegu(d, a, b)) return dan('mrsno', `${naziv}, без поста`);
  }
  const bozic = izStarog(g - 1, 12, 25); // 7. јануар ове године
  if (uOpsegu(d, bozic, dodajDane(bozic, 10))) return dan('mrsno', 'Свјатки, без поста');

  // 2. Једнодневни строги постови (суботом и недељом се разрешава на уље).
  const strogi = naStarom(1, 5) ? 'Крстовдан (Богојављенско навечерје)' : naStarom(8, 29) ? 'Усековање' : naStarom(9, 14) ? 'Крстовдан' : naStarom(12, 24) ? 'Бадњи дан' : null;
  if (strogi) return dan(vikend ? 'ulje' : 'voda', strogi);

  const p = vaskrs(g);
  const odV = razlikaDana(d, p);

  // 3. Велики пост (Чисти понедељак до Велике суботе).
  if (odV >= -48 && odV <= -1) {
    if (odV === -2) return dan('uzdrzanje', 'Велики петак');
    if (odV === -1) return dan('voda', 'Велика субота');
    if (odV === -7) return dan('riba', 'Цвети');
    if (praznici.includes('blagovesti')) return dan('riba', 'Благовести у Великом посту');
    if (odV === -8) return dan('ulje', 'Лазарева субота');
    return dan(vikend ? 'ulje' : 'voda', 'Велики пост');
  }

  // 4. Сирна (беле мрсне) седмица пред Великим постом.
  if (odV >= -55 && odV <= -49) return dan('beli-mrs', 'Сирна седмица');

  // 5. Вишедневни постови током године.
  for (const v of visednevniPostovi(g)) {
    if (!uOpsegu(d, v.od, v.do) || v.naziv === 'Велики пост') continue;
    if (v.naziv === 'Божићни пост') {
      if (praznici.includes('vavedenje') || praznici.includes('nikoljdan')) return dan('riba', v.naziv);
      const nikoljdan = izStarog(v.od.getUTCFullYear(), 12, 6);
      const novaGodina = izStarog(v.od.getUTCFullYear(), 12, 20);
      if (d <= nikoljdan) {
        if (nedelja === 3 || nedelja === 5) return dan('voda', v.naziv);
        return dan(nedelja === 1 ? 'ulje' : 'riba', v.naziv);
      }
      if (d < novaGodina) {
        if (vikend) return dan('riba', v.naziv);
        return dan(nedelja === 3 || nedelja === 5 ? 'voda' : 'ulje', v.naziv);
      }
      return dan(vikend ? 'ulje' : 'voda', `${v.naziv}, последњи дани`);
    }
    if (v.naziv === 'Петровски пост') {
      if (nedelja === 3 || nedelja === 5) return dan('voda', v.naziv);
      return dan(nedelja === 1 ? 'ulje' : 'riba', v.naziv);
    }
    // Госпојински пост
    if (praznici.includes('preobrazenje')) return dan('riba', 'Преображење у Госпојинском посту');
    return dan(vikend ? 'ulje' : 'voda', v.naziv);
  }

  // 6. Среда и петак преко године.
  if (nedelja === 3 || nedelja === 5) {
    const naziv = nedelja === 3 ? 'Среда' : 'Петак';
    if (praznici.some((x) => VELIKI.has(x))) return dan('riba', `${naziv}, велики празник`);
    if (prazniciDana(d).some((x) => x.vrsta === 'crveno')) return dan('ulje', `${naziv}, црвено слово`);
    return dan('voda', naziv);
  }
  return dan('mrsno', 'Мрсни дан');
}

/** Почетак црквене године (1. септембар по старом = 14. септембар) у којој је дати дан. */
export function pocetakCrkveneGodine(d: Date): Date {
  const g = d.getUTCFullYear();
  const ove = izStarog(g, 9, 1);
  return d.getTime() >= ove.getTime() ? ove : izStarog(g - 1, 9, 1);
}
