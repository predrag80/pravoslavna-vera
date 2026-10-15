import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANS, distribute } from '../src/lib/reading-plans.ts';

test('reading plans', () => {
  assert.deepEqual(distribute([1, 2, 3, 4, 5], 2), [[1, 2, 3], [4, 5]]);
  const j = PLANS.find((p) => p.id === 'jevandjelja-40')!;
  assert.equal(j.days.length, 40);
  assert.equal(j.days.flat().length, 89);
  assert.equal(j.days[0]![0]!.label, 'По Матеју 1');
  const ps = PLANS.find((p) => p.id === 'psaltir-20')!;
  assert.equal(ps.days.length, 20);
  assert.equal(ps.days.flat().length, 150);
  assert.equal(PLANS.find((p) => p.id === 'novi-zavet-260')!.days.flat().length, 260);
});
