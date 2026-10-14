import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lxxUHebrejski, KATIZME } from '../src/lib/psalmi.ts';

test('LXX у хебрејску нумерацију', () => {
  assert.equal(lxxUHebrejski(50), 51);
  assert.equal(lxxUHebrejski(22), 23);
  assert.equal(lxxUHebrejski(118), 119);
  assert.equal(lxxUHebrejski(150), 150);
  assert.equal(KATIZME.length, 20);
});
