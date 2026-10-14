import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vaskrs, utc, poStarom, prazniciDana, post, postPoPravilima, dodajDane, narednih } from '../src/lib/kalendar.ts';

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

test('степен поста', () => {
  const st = (g: number, m: number, d: number) => post(utc(g, m, d)).stepen;
  assert.equal(st(2026, 10, 14), 'ulje'); // Покров, среда (по календару СПЦ)
  assert.equal(st(2026, 10, 21), 'voda'); // обична среда
  assert.equal(st(2026, 10, 27), 'mrsno'); // Света Петка, уторак
  assert.equal(st(2026, 12, 1), 'ulje'); // уторак у Божићном посту
  assert.equal(st(2026, 12, 2), 'voda'); // среда у Божићном посту
  assert.equal(st(2026, 11, 30), 'voda'); // понедељак у Божићном посту
  assert.equal(st(2026, 12, 4), 'riba'); // Ваведење, петак
  assert.equal(st(2026, 12, 19), 'riba'); // Никољдан
  assert.equal(st(2026, 12, 22), 'ulje'); // уторак после Никољдана
  assert.equal(st(2026, 12, 26), 'riba'); // субота после Никољдана
  assert.equal(st(2027, 1, 4), 'voda'); // понедељак, последњи дани поста
  assert.equal(st(2027, 1, 6), 'voda'); // Бадњи дан, среда
  // Велики пост 2026 (Васкрс 12. април)
  assert.equal(st(2026, 3, 10), 'voda');
  assert.equal(st(2026, 3, 14), 'ulje'); // субота
  assert.equal(st(2026, 4, 4), 'ulje'); // Лазарева субота
  assert.equal(st(2026, 4, 5), 'riba'); // Цвети
  assert.equal(st(2026, 4, 7), 'riba'); // Благовести у Страсној седмици
  assert.equal(st(2026, 4, 10), 'uzdrzanje'); // Велики петак
  assert.equal(st(2026, 2, 18), 'beli-mrs'); // Сирна седмица, среда
  assert.equal(st(2026, 8, 19), 'riba'); // Преображење
  assert.equal(st(2026, 8, 22), 'ulje'); // субота у Госпојинском посту
  assert.equal(st(2026, 9, 27), 'ulje'); // Крстовдан у недељу
  assert.equal(st(2026, 2, 24), 'uzdrzanje'); // први дани Великог поста
  assert.equal(st(2026, 5, 6), 'riba'); // Ђурђевдан и Преполовљење, среда
  assert.equal(st(2026, 6, 9), 'ulje'); // уторак у Петровском посту
});

test('пост 2026. из календара СПЦ, остале године по правилима', () => {
  assert.equal(post(utc(2026, 10, 14)).izvor, 'kalendar');
  assert.equal(post(utc(2027, 10, 14)).izvor, 'pravila');
  assert.equal(post(utc(2026, 1, 10)).stepen, 'mrsno'); // Свјатки
});

test('правила поста се слажу са календаром СПЦ за сваки дан 2026.', () => {
  for (let d = utc(2026, 1, 1); d.getUTCFullYear() === 2026; d = dodajDane(d, 1)) {
    assert.equal(postPoPravilima(d).stepen, post(d).stepen, d.toISOString().slice(0, 10));
  }
});

test('правила поста за 2027. (Васкрс 2. маја)', () => {
  const st = (m: number, d: number) => post(utc(2027, m, d)).stepen;
  assert.equal(st(1, 2), 'ulje'); // субота, последњи дани Божићног поста
  assert.equal(st(5, 12), 'ulje'); // среда после Томине недеље
  assert.equal(st(5, 26), 'riba'); // среда Преполовљења
  assert.equal(st(6, 9), 'riba'); // среда пред Спасовдан
  assert.equal(st(6, 23), 'mrsno'); // среда Тројичине седмице
  assert.equal(st(10, 13), 'voda'); // обична среда
});
