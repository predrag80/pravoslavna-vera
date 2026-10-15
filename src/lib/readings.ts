/**
 * Liturgical readings: data by date and parsing of Bible references.
 *
 * Reference notation: „Мк 8:34-9:1; Лк 5:1-11“, „Јн 19:6-11,13-20“.
 *  - ';' starts a new part (a new chapter, or a new book if one is given);
 *  - ',' separates verses of the same chapter;
 *  - '-' may continue into the next chapter (8:34-9:1).
 */
import data2026 from '../data/readings/2026.json' with { type: 'json' };

export const ABBREVIATIONS: Record<string, string> = {
  'Мт': 'matej', 'Мк': 'marko', 'Лк': 'luka', 'Јн': 'jovan', 'Дап': 'dela',
  'Рим': 'rimljani', '1 Кор': '1kor', '2 Кор': '2kor', 'Гал': 'galati', 'Еф': 'efesci', 'Фил': 'filibljani',
  'Кол': 'kolosani', '1 Сол': '1sol', '2 Сол': '2sol', '1 Тим': '1tim', '2 Тим': '2tim', 'Тит': 'tit', 'Флм': 'filimon',
  'Јев': 'jevreji', 'Јак': 'jakov', '1 Пт': '1petar', '2 Пт': '2petar', '1 Јн': '1jovan', '2 Јн': '2jovan', '3 Јн': '3jovan',
  'Јуд': 'juda', 'Отк': 'otkrivenje',
};

export interface Location { chapter: number; verse: number }
/** A continuous run of verses in one book, from–to (inclusive). */
export interface Passage { book: string; from: Location; to: Location }

const BOOK_AT_START = new RegExp(`^(${Object.keys(ABBREVIATIONS).sort((a, b) => b.length - a.length).join('|')})\\s+`);

export function parseReference(ref: string): Passage[] {
  const result: Passage[] = [];
  let book = '';
  for (const rawPart of ref.split(';')) {
    let part = rawPart.trim();
    if (!part) continue;
    const k = BOOK_AT_START.exec(part);
    if (k) {
      book = ABBREVIATIONS[k[1]!]!;
      part = part.slice(k[0].length);
    }
    if (!book) throw new Error(`Непозната књига у „${ref}“`);
    const m = /^(\d+):(.+)$/.exec(part);
    if (!m) throw new Error(`Неисправна референца „${rawPart}“`);
    const chapter = Number(m[1]);
    for (const range of m[2]!.split(',')) {
      const [a, b] = range.trim().split('-');
      const from = { chapter, verse: Number(a) };
      let to = from;
      if (b) {
        const across = /^(\d+):(\d+)$/.exec(b);
        to = across ? { chapter: Number(across[1]), verse: Number(across[2]) } : { chapter, verse: Number(b) };
      }
      if ([from.verse, to.verse, to.chapter].some((x) => !Number.isInteger(x) || x < 1)) throw new Error(`Неисправни стихови у „${rawPart}“`);
      result.push({ book, from, to });
    }
  }
  return result;
}

export interface DayReadings { epistle: string; gospel: string; source: string }

const DATA: Record<string, DayReadings> = { ...data2026.days };

/** Readings for a date (YYYY-MM-DD), if entered. */
export function readingsOfDay(date: string): DayReadings | null {
  return DATA[date] ?? null;
}

/** All dates with readings, in order. */
export function readingDates(): string[] {
  return Object.keys(DATA).sort();
}

/** The first date with readings on or after the given day. */
export function nextReadingDate(date: string): string | null {
  return readingDates().find((d) => d >= date) ?? null;
}

const ID_TO_ABBREVIATION = Object.fromEntries(Object.entries(ABBREVIATIONS).map(([k, v]) => [v, k]));

/** Short book name for references („Лк“); for books without an abbreviation the given fallback name is returned. */
export function abbreviation(id: string, fallback: string): string {
  return ID_TO_ABBREVIATION[id] ?? fallback;
}
