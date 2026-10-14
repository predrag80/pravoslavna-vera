import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error — скрипта је обичан JavaScript модул
import { procitajUsfm } from '../scripts/uvoz-biblije.mjs';

test('читање USFM текста', () => {
  const usfm = [
    '\\id JHN',
    '\\c 3',
    '\\p',
    '\\v 16 Jer Bogu tako omile svet\\f + \\ft napomena\\f* da je i Sina',
    'svog Jedinorodnog dao.',
    '\\v 17 Jer Bog ne posla Sina svog na svet',
  ].join('\n');
  const { id, glave } = procitajUsfm(usfm);
  assert.equal(id, 'JHN');
  assert.equal(glave['3'][15], 'Јер Богу тако омиле свет да је и Сина свог Јединородног дао.');
  assert.equal(glave['3'][16], 'Јер Бог не посла Сина свог на свет');
});
