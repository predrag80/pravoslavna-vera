import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slavaDate, nextSlava, findSlava, SLAVAS } from '../src/lib/slava.ts';
import { utc } from '../src/lib/calendar.ts';

const iso = (d: Date) => d.toISOString().slice(0, 10);

test('slava dates', () => {
  assert.equal(iso(slavaDate(findSlava('nikoljdan')!, 2026)), '2026-12-19');
  assert.equal(iso(slavaDate(findSlava('jovanjdan')!, 2027)), '2027-01-20');
  assert.equal(iso(slavaDate(findSlava('ignjatije')!, 2027)), '2027-01-02'); // 20 Dec old style
  assert.equal(iso(slavaDate(findSlava('stevanjdan')!, 2027)), '2027-01-09');
  assert.equal(iso(slavaDate(findSlava('spasovdan')!, 2027)), '2027-06-10');
  assert.equal(iso(nextSlava(findSlava('djurdjevdan')!, utc(2026, 10, 14))), '2027-05-06');
  assert.equal(iso(nextSlava(findSlava('petka')!, utc(2026, 10, 14))), '2026-10-27');
  assert.ok(SLAVAS.length >= 35);
  assert.equal(new Set(SLAVAS.map((s) => s.id)).size, SLAVAS.length);
});
