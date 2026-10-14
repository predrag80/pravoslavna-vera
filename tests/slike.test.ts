import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error — скрипта је обичан JavaScript модул
import { dozvoljenaLicenca, zapisIzInfo } from '../scripts/slike.mjs';

test('само слободне лиценце', () => {
  assert.equal(dozvoljenaLicenca('Public domain'), true);
  assert.equal(dozvoljenaLicenca('CC BY-SA 4.0'), true);
  assert.equal(dozvoljenaLicenca('CC BY 3.0'), true);
  assert.equal(dozvoljenaLicenca('CC0'), true);
  assert.equal(dozvoljenaLicenca('CC BY-NC-SA 4.0'), false);
  assert.equal(dozvoljenaLicenca('CC BY-ND 2.0'), false);
  assert.equal(dozvoljenaLicenca('Fair use'), false);
  assert.equal(dozvoljenaLicenca(''), false);
});

test('запис из одговора Commons API-ја', () => {
  const stranica = {
    title: 'File:Primer.jpg',
    imageinfo: [{
      url: 'https://upload.wikimedia.org/a/Primer.jpg', thumburl: 'https://upload.wikimedia.org/thumb/a/Primer.jpg/1280px-Primer.jpg',
      thumbwidth: 1280, thumbheight: 853, width: 3000, height: 2000, mime: 'image/jpeg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Primer.jpg',
      extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, Artist: { value: '<a href="x">Петар Петровић</a>' }, LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' } },
    }],
  };
  const z = zapisIzInfo(stranica, 'Рођење Христово');
  assert.equal(z.autor, 'Петар Петровић');
  assert.equal(z.sirina, 1280);
  assert.equal(z.licenca, 'CC BY-SA 4.0');
  const mala = structuredClone(stranica);
  mala.imageinfo[0]!.width = 500;
  assert.equal(zapisIzInfo(mala, 'x'), null);
});
