import fs from 'node:fs';
import path from 'node:path';
import books from '@/data/books.json';

export interface Book { id: string; short: string; name: string; chapters: number; testament: 'old' | 'new' }
export interface BookGroup { id: string; name: string; description: string; books: Book[] }

export const oldTestament = books.oldTestament as BookGroup[];
export const newTestament = books.newTestament as BookGroup[];
export const notInTranslation = books.notInTranslation;
export const allBooks: Book[] = [...oldTestament, ...newTestament].flatMap((g) => g.books);

export function findBook(id: string): Book | undefined {
  return allBooks.find((k) => k.id === id);
}

/** Chapter text from src/data/bible/<book>.json, shaped { "1": ["verse 1", …], … }; null until the text is added. */
export function chapterText(id: string, chapter: number): string[] | null {
  const file = path.join(process.cwd(), 'src', 'data', 'bible', `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const content = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string[]>;
  return content[String(chapter)] ?? null;
}

export function bookCount(n: number): string {
  const m10 = n % 10, m100 = n % 100;
  return `${n} ${m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'књиге' : 'књига'}`;
}

export interface Verse { book: string; chapter: number; verse: number; text: string }

/** Verses of a passage (may continue into the next chapter); null if the book text has not been imported yet. */
export function passageVerses(o: { book: string; from: { chapter: number; verse: number }; to: { chapter: number; verse: number } }): Verse[] | null {
  const result: Verse[] = [];
  for (let c = o.from.chapter; c <= o.to.chapter; c++) {
    const text = chapterText(o.book, c);
    if (!text) return null;
    const first = c === o.from.chapter ? o.from.verse : 1;
    const last = c === o.to.chapter ? Math.min(o.to.verse, text.length) : text.length;
    for (let v = first; v <= last; v++) result.push({ book: o.book, chapter: c, verse: v, text: text[v - 1]! });
  }
  return result;
}
