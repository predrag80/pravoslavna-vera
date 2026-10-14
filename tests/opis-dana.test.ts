import { test } from 'node:test';
import assert from 'node:assert/strict';
import { opisDana } from '../src/lib/opis-dana.ts';
import { utc } from '../src/lib/kalendar.ts';

test('опис дана', () => {
  const b = opisDana(utc(2027, 1, 7));
  assert.equal(b.praznici[0]?.id, 'bozic');
  assert.equal(b.crveno, true);
  assert.equal(b.kljucStarog, '12-25');
  const p = opisDana(utc(2026, 10, 14));
  assert.equal(p.praznici[0]?.id, 'pokrov');
  // Светитељ који је исто што и празник не понавља се.
  assert.ok(!p.svetitelji.includes('Покров Пресвете Богородице'));
});
