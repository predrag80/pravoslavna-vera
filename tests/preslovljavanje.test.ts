import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uLatinicu } from '../src/lib/preslovljavanje.ts';

test('ћирилица у латиницу', () => {
  assert.equal(uLatinicu('Љубостиња'), 'Ljubostinja');
  assert.equal(uLatinicu('ЉУБОСТИЊА'), 'LJUBOSTINJA');
  assert.equal(uLatinicu('Ђурђеви ступови'), 'Đurđevi stupovi');
  assert.equal(uLatinicu('Џ'), 'Dž');
});

import { uCirilicu } from '../src/lib/preslovljavanje.ts';

test('латиница у ћирилицу', () => {
  assert.equal(uCirilicu('Jer Bogu tako omile svet'), 'Јер Богу тако омиле свет');
  assert.equal(uCirilicu('Ljubav, njiva, džep, Đorđe'), 'Љубав, њива, џеп, Ђорђе');
});
