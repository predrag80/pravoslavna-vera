import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vaskrs, utc, poStarom, prazniciDana, post, narednih } from '../src/lib/kalendar.ts';

const iso = (d: Date) => d.toISOString().slice(0, 10);

test('православни Васкрс', () => {
  // Познати датуми православног Васкрса.
  assert.equal(iso(vaskrs(2024)), '2024-05-05');
  assert.equal(iso(vaskrs(2025)), '2025-04-20');
  assert.equal(iso(vaskrs(2026)), '2026-04-12');
  assert.equal(iso(vaskrs(2027)), '2027-05-02');
  assert.equal(iso(vaskrs(2028)), '2028-04-16');
});

test('стари календар', () => {
  assert.deepEqual(poStarom(utc(2026, 10, 11)), { dan: 28, mesec: 9 });
  assert.deepEqual(poStarom(utc(2027, 1, 7)), { dan: 25, mesec: 12 });
});

test('непокретни и покретни празници', () => {
  assert.equal(prazniciDana(utc(2027, 1, 7))[0]?.naziv, 'Божић');
  assert.equal(prazniciDana(utc(2026, 10, 27))[0]?.naziv, 'Света Петка');
  assert.equal(prazniciDana(utc(2027, 6, 10))[0]?.naziv, 'Спасовдан');
  assert.equal(prazniciDana(utc(2026, 5, 31))[0]?.naziv, 'Духови');
});

test('наредни празници прелазе у следећу годину', () => {
  const n = narednih(utc(2026, 12, 20), 2);
  assert.equal(n[0]?.naziv, 'Божић');
  assert.equal(iso(n[0]!.datum), '2027-01-07');
});

test('пост', () => {
  assert.equal(post(utc(2026, 12, 1)).naziv, 'Божићни пост');
  assert.equal(post(utc(2026, 3, 10)).naziv, 'Велики пост');
  assert.equal(post(utc(2026, 9, 27)).posno, true); // Крстовдан
  assert.equal(post(utc(2026, 10, 14)).posno, true); // среда
  assert.equal(post(utc(2026, 10, 16)).posno, true); // петак
  assert.equal(post(utc(2026, 10, 11)).posno, false); // недеља
  assert.equal(post(utc(2026, 4, 17)).posno, false); // петак Светле седмице
  assert.equal(post(utc(2027, 1, 8)).posno, false); // Свјатки
  assert.equal(post(utc(2027, 1, 18)).posno, true); // Богојављенски Крстовдан
  // 2026: Духови 31. маја, Сви свети 7. јуна, Петровски пост 8. јун – 11. јул.
  assert.equal(post(utc(2026, 6, 20)).naziv, 'Петровски пост');
  assert.equal(post(utc(2026, 8, 20)).naziv, 'Госпојински пост');
});
