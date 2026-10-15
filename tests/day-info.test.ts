import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayInfo } from '../src/lib/day-info.ts';
import { utc } from '../src/lib/calendar.ts';

test('day info', () => {
  const b = dayInfo(utc(2027, 1, 7));
  assert.equal(b.feasts[0]?.id, 'bozic');
  assert.equal(b.redLetter, true);
  assert.equal(b.oldStyleKey, '12-25');
  const p = dayInfo(utc(2026, 10, 14));
  assert.equal(p.feasts[0]?.id, 'pokrov');
  // A saint that is the same as the feast is not repeated.
  assert.ok(!p.saints.includes('Покров Пресвете Богородице'));
});
