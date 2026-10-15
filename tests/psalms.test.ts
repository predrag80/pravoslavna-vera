import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lxxToHebrew, KATHISMAS } from '../src/lib/psalms.ts';

test('LXX to Hebrew numbering', () => {
  assert.equal(lxxToHebrew(50), 51);
  assert.equal(lxxToHebrew(22), 23);
  assert.equal(lxxToHebrew(118), 119);
  assert.equal(lxxToHebrew(150), 150);
  assert.equal(KATHISMAS.length, 20);
});
