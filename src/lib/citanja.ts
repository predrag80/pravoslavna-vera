/**
 * Литургијска читања: подаци по датуму и рашчлањивање библијских референци.
 *
 * Запис референце: „Мк 8:34-9:1; Лк 5:1-11“, „Јн 19:6-11,13-20“.
 *  - ';' почиње нови део (нова глава, или нова књига ако је наведена);
 *  - ',' одваја стихове исте главе;
 *  - '-' може да пређе у следећу главу (8:34-9:1).
 */
import podaci2026 from '../data/citanja/2026.json' with { type: 'json' };

export const SKRACENICE: Record<string, string> = {
  'Мт': 'matej', 'Мк': 'marko', 'Лк': 'luka', 'Јн': 'jovan', 'Дап': 'dela',
  'Рим': 'rimljani', '1 Кор': '1kor', '2 Кор': '2kor', 'Гал': 'galati', 'Еф': 'efesci', 'Фил': 'filibljani',
  'Кол': 'kolosani', '1 Сол': '1sol', '2 Сол': '2sol', '1 Тим': '1tim', '2 Тим': '2tim', 'Тит': 'tit', 'Флм': 'filimon',
  'Јев': 'jevreji', 'Јак': 'jakov', '1 Пт': '1petar', '2 Пт': '2petar', '1 Јн': '1jovan', '2 Јн': '2jovan', '3 Јн': '3jovan',
  'Јуд': 'juda', 'Отк': 'otkrivenje',
};

export interface Mesto { glava: number; stih: number }
/** Непрекидан низ стихова једне књиге, од–до (укључиво). */
export interface Odlomak { knjiga: string; od: Mesto; do: Mesto }

const KNJIGA_NA_POCETKU = new RegExp(`^(${Object.keys(SKRACENICE).sort((a, b) => b.length - a.length).join('|')})\\s+`);

export function rasclani(ref: string): Odlomak[] {
  const rezultat: Odlomak[] = [];
  let knjiga = '';
  for (const deo0 of ref.split(';')) {
    let deo = deo0.trim();
    if (!deo) continue;
    const k = KNJIGA_NA_POCETKU.exec(deo);
    if (k) {
      knjiga = SKRACENICE[k[1]!]!;
      deo = deo.slice(k[0].length);
    }
    if (!knjiga) throw new Error(`Непозната књига у „${ref}“`);
    const m = /^(\d+):(.+)$/.exec(deo);
    if (!m) throw new Error(`Неисправна референца „${deo0}“`);
    const glava = Number(m[1]);
    for (const opseg of m[2]!.split(',')) {
      const [a, b] = opseg.trim().split('-');
      const od = { glava, stih: Number(a) };
      let doM = od;
      if (b) {
        const preko = /^(\d+):(\d+)$/.exec(b);
        doM = preko ? { glava: Number(preko[1]), stih: Number(preko[2]) } : { glava, stih: Number(b) };
      }
      if ([od.stih, doM.stih, doM.glava].some((x) => !Number.isInteger(x) || x < 1)) throw new Error(`Неисправни стихови у „${deo0}“`);
      rezultat.push({ knjiga, od, do: doM });
    }
  }
  return rezultat;
}

export interface CitanjaDana { apostol: string; jevandjelje: string; izvor: string }

const PODACI: Record<string, CitanjaDana> = { ...podaci2026.dani };

/** Читања за датум (YYYY-MM-DD), ако су унета. */
export function citanjaDana(datum: string): CitanjaDana | null {
  return PODACI[datum] ?? null;
}

/** Сви датуми са читањима, по реду. */
export function datumiCitanja(): string[] {
  return Object.keys(PODACI).sort();
}

/** Први датум са читањима на дан или после датог дана. */
export function sledeceCitanje(datum: string): string | null {
  return datumiCitanja().find((d) => d >= datum) ?? null;
}

const ID_U_SKRACENICU = Object.fromEntries(Object.entries(SKRACENICE).map(([k, v]) => [v, k]));

/** Скраћени назив књиге за референце („Лк“); за књиге без скраћенице враћа се дати резервни назив. */
export function skracenica(id: string, rezerva: string): string {
  return ID_U_SKRACENICU[id] ?? rezerva;
}
