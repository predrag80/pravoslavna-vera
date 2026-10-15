import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pascha, utc, toOldStyle, feastsOfDay, fastOfDay, fastByRules, addDays, upcomingFeasts } from '../src/lib/calendar.ts';

const iso = (d: Date) => d.toISOString().slice(0, 10);

test('Orthodox Pascha', () => {
  // Known dates of Orthodox Pascha.
  assert.equal(iso(pascha(2024)), '2024-05-05');
  assert.equal(iso(pascha(2025)), '2025-04-20');
  assert.equal(iso(pascha(2026)), '2026-04-12');
  assert.equal(iso(pascha(2027)), '2027-05-02');
  assert.equal(iso(pascha(2028)), '2028-04-16');
});

test('old calendar', () => {
  assert.deepEqual(toOldStyle(utc(2026, 10, 11)), { day: 28, month: 9 });
  assert.deepEqual(toOldStyle(utc(2027, 1, 7)), { day: 25, month: 12 });
});

test('fixed and movable feasts', () => {
  assert.equal(feastsOfDay(utc(2027, 1, 7))[0]?.name, 'Божић');
  assert.equal(feastsOfDay(utc(2026, 10, 27))[0]?.name, 'Света Петка');
  assert.equal(feastsOfDay(utc(2027, 6, 10))[0]?.name, 'Спасовдан');
  assert.equal(feastsOfDay(utc(2026, 5, 31))[0]?.name, 'Духови');
});

test('upcoming feasts roll over into the next year', () => {
  const n = upcomingFeasts(utc(2026, 12, 20), 2);
  assert.equal(n[0]?.name, 'Божић');
  assert.equal(iso(n[0]!.date), '2027-01-07');
});

test('fast', () => {
  assert.equal(fastOfDay(utc(2026, 12, 1)).label, 'Божићни пост');
  assert.equal(fastOfDay(utc(2026, 3, 10)).label, 'Велики пост');
  assert.equal(fastOfDay(utc(2026, 9, 27)).isFast, true); // Exaltation of the Cross
  assert.equal(fastOfDay(utc(2026, 10, 14)).isFast, true); // Wednesday
  assert.equal(fastOfDay(utc(2026, 10, 16)).isFast, true); // Friday
  assert.equal(fastOfDay(utc(2026, 10, 11)).isFast, false); // Sunday
  assert.equal(fastOfDay(utc(2026, 4, 17)).isFast, false); // Friday of Bright Week
  assert.equal(fastOfDay(utc(2027, 1, 8)).isFast, false); // Svyatki
  assert.equal(fastOfDay(utc(2027, 1, 18)).isFast, true); // Theophany Eve
  // 2026: Pentecost 31 May, All Saints 7 June, Apostles' Fast 8 June – 11 July.
  assert.equal(fastOfDay(utc(2026, 6, 20)).label, 'Петровски пост');
  assert.equal(fastOfDay(utc(2026, 8, 20)).label, 'Госпојински пост');
});

test('fast level', () => {
  const lv = (y: number, m: number, d: number) => fastOfDay(utc(y, m, d)).level;
  assert.equal(lv(2026, 10, 14), 'oil'); // Protection of the Theotokos, Wednesday (per the SOC calendar)
  assert.equal(lv(2026, 10, 21), 'water'); // ordinary Wednesday
  assert.equal(lv(2026, 10, 27), 'none'); // St Paraskeva, Tuesday
  assert.equal(lv(2026, 12, 1), 'oil'); // Tuesday in the Nativity Fast
  assert.equal(lv(2026, 12, 2), 'water'); // Wednesday in the Nativity Fast
  assert.equal(lv(2026, 11, 30), 'water'); // Monday in the Nativity Fast
  assert.equal(lv(2026, 12, 4), 'fish'); // Entry of the Theotokos, Friday
  assert.equal(lv(2026, 12, 19), 'fish'); // St Nicholas
  assert.equal(lv(2026, 12, 22), 'oil'); // Tuesday after St Nicholas
  assert.equal(lv(2026, 12, 26), 'fish'); // Saturday after St Nicholas
  assert.equal(lv(2027, 1, 4), 'water'); // Monday, last days of the fast
  assert.equal(lv(2027, 1, 6), 'water'); // Christmas Eve, Wednesday
  // Great Lent 2026 (Pascha 12 April)
  assert.equal(lv(2026, 3, 10), 'water');
  assert.equal(lv(2026, 3, 14), 'oil'); // Saturday
  assert.equal(lv(2026, 4, 4), 'oil'); // Lazarus Saturday
  assert.equal(lv(2026, 4, 5), 'fish'); // Palm Sunday
  assert.equal(lv(2026, 4, 7), 'fish'); // Annunciation in Holy Week
  assert.equal(lv(2026, 4, 10), 'abstain'); // Great Friday
  assert.equal(lv(2026, 2, 18), 'dairy'); // Cheesefare Week, Wednesday
  assert.equal(lv(2026, 8, 19), 'fish'); // Transfiguration
  assert.equal(lv(2026, 8, 22), 'oil'); // Saturday in the Dormition Fast
  assert.equal(lv(2026, 9, 27), 'oil'); // Exaltation of the Cross on a Sunday
  assert.equal(lv(2026, 2, 24), 'abstain'); // first days of Great Lent
  assert.equal(lv(2026, 5, 6), 'fish'); // St George and Mid-Pentecost, Wednesday
  assert.equal(lv(2026, 6, 9), 'oil'); // Tuesday in the Apostles' Fast
});

test('2026 fast from the SOC calendar, other years by the rules', () => {
  assert.equal(fastOfDay(utc(2026, 10, 14)).source, 'calendar');
  assert.equal(fastOfDay(utc(2027, 10, 14)).source, 'rules');
  assert.equal(fastOfDay(utc(2026, 1, 10)).level, 'none'); // Svyatki
});

test('fasting rules match the SOC calendar for every day of 2026', () => {
  for (let d = utc(2026, 1, 1); d.getUTCFullYear() === 2026; d = addDays(d, 1)) {
    assert.equal(fastByRules(d).level, fastOfDay(d).level, d.toISOString().slice(0, 10));
  }
});

test('fasting rules for 2027 (Pascha 2 May)', () => {
  const lv = (m: number, d: number) => fastOfDay(utc(2027, m, d)).level;
  assert.equal(lv(1, 2), 'oil'); // Saturday, last days of the Nativity Fast
  assert.equal(lv(5, 12), 'oil'); // Wednesday after Thomas Sunday
  assert.equal(lv(5, 26), 'fish'); // Mid-Pentecost Wednesday
  assert.equal(lv(6, 9), 'fish'); // Wednesday before Ascension
  assert.equal(lv(6, 23), 'none'); // Wednesday of Trinity Week
  assert.equal(lv(10, 13), 'water'); // ordinary Wednesday
});
