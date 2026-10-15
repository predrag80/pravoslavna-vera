import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toLatin } from '../src/lib/transliteration.ts';

test('Cyrillic to Latin', () => {
  assert.equal(toLatin('Љубостиња'), 'Ljubostinja');
  assert.equal(toLatin('ЉУБОСТИЊА'), 'LJUBOSTINJA');
  assert.equal(toLatin('Ђурђеви ступови'), 'Đurđevi stupovi');
  assert.equal(toLatin('Џ'), 'Dž');
});

import { toCyrillic } from '../src/lib/transliteration.ts';

test('Latin to Cyrillic', () => {
  assert.equal(toCyrillic('Jer Bogu tako omile svet'), 'Јер Богу тако омиле свет');
  assert.equal(toCyrillic('Ljubav, njiva, džep, Đorđe'), 'Љубав, њива, џеп, Ђорђе');
});
