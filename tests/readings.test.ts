import { test } from 'node:test';
import assert from 'node:assert/strict';
import books from '../src/data/books.json' with { type: 'json' };
import { readingsOfDay, readingDates, parseReference, nextReadingDate } from '../src/lib/readings.ts';

test('simple reference', () => {
  assert.deepEqual(parseReference('Лк 6:31-36'), [{ book: 'luka', from: { chapter: 6, verse: 31 }, to: { chapter: 6, verse: 36 } }]);
});

test('crossing into the next chapter and multiple parts', () => {
  const r = parseReference('Мк 8:34-9:1; Лк 5:1-11');
  assert.equal(r.length, 2);
  assert.deepEqual(r[0], { book: 'marko', from: { chapter: 8, verse: 34 }, to: { chapter: 9, verse: 1 } });
  assert.equal(r[1]!.book, 'luka');
});

test('comma-separated verses and a new chapter without a book', () => {
  const r = parseReference('Мт 10:32-33,37-38; 19:27-30');
  assert.deepEqual(r.map((x) => `${x.book} ${x.from.chapter}:${x.from.verse}-${x.to.chapter}:${x.to.verse}`), [
    'matej 10:32-10:33', 'matej 10:37-10:38', 'matej 19:27-19:30',
  ]);
  assert.deepEqual(parseReference('Јн 8:12')[0], { book: 'jovan', from: { chapter: 8, verse: 12 }, to: { chapter: 8, verse: 12 } });
});

test('two-word abbreviations (1 Кор, 2 Тим)', () => {
  assert.equal(parseReference('1 Кор 6:12-20')[0]!.book, '1kor');
  assert.equal(parseReference('2 Тим 3:10-15')[0]!.book, '2tim');
});

test('all entered readings parse and stay within the book chapter count', () => {
  const chapters = new Map([...books.newTestament].flatMap((g) => g.books).map((k) => [k.id, k.chapters]));
  for (const d of readingDates()) {
    const c = readingsOfDay(d)!;
    for (const ref of [c.epistle, c.gospel]) {
      for (const o of parseReference(ref)) assert.ok(o.to.chapter <= chapters.get(o.book)!, `${d}: ${ref}`);
    }
  }
});

test('next reading', () => {
  assert.equal(nextReadingDate('2026-10-14'), '2026-10-18');
  assert.equal(readingsOfDay('2026-10-18')?.gospel, 'Лк 7:11-16');
});
