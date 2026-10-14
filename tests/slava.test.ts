import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datumSlave, narednaSlava, slava, SLAVE } from '../src/lib/slava.ts';
import { utc } from '../src/lib/kalendar.ts';

const iso = (d: Date) => d.toISOString().slice(0, 10);

test('датуми слава', () => {
  assert.equal(iso(datumSlave(slava('nikoljdan')!, 2026)), '2026-12-19');
  assert.equal(iso(datumSlave(slava('jovanjdan')!, 2027)), '2027-01-20');
  assert.equal(iso(datumSlave(slava('ignjatije')!, 2027)), '2027-01-02'); // 20. 12. по старом
  assert.equal(iso(datumSlave(slava('stevanjdan')!, 2027)), '2027-01-09');
  assert.equal(iso(datumSlave(slava('spasovdan')!, 2027)), '2027-06-10');
  assert.equal(iso(narednaSlava(slava('djurdjevdan')!, utc(2026, 10, 14))), '2027-05-06');
  assert.equal(iso(narednaSlava(slava('petka')!, utc(2026, 10, 14))), '2026-10-27');
  assert.ok(SLAVE.length >= 35);
  assert.equal(new Set(SLAVE.map((s) => s.id)).size, SLAVE.length);
});
