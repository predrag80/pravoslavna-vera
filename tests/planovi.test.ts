import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANOVI, rasporedi } from '../src/lib/planovi.ts';

test('планови читања', () => {
  assert.deepEqual(rasporedi([1, 2, 3, 4, 5], 2), [[1, 2, 3], [4, 5]]);
  const j = PLANOVI.find((p) => p.id === 'jevandjelja-40')!;
  assert.equal(j.dani.length, 40);
  assert.equal(j.dani.flat().length, 89);
  assert.equal(j.dani[0]![0]!.naziv, 'По Матеју 1');
  const ps = PLANOVI.find((p) => p.id === 'psaltir-20')!;
  assert.equal(ps.dani.length, 20);
  assert.equal(ps.dani.flat().length, 150);
  assert.equal(PLANOVI.find((p) => p.id === 'novi-zavet-260')!.dani.flat().length, 260);
});
