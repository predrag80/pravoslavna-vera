import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error — the script is a plain JavaScript module
import { isAllowedLicense, entryFromInfo } from '../scripts/images.mjs';

test('only free licenses', () => {
  assert.equal(isAllowedLicense('Public domain'), true);
  assert.equal(isAllowedLicense('CC BY-SA 4.0'), true);
  assert.equal(isAllowedLicense('CC BY 3.0'), true);
  assert.equal(isAllowedLicense('CC0'), true);
  assert.equal(isAllowedLicense('CC BY-NC-SA 4.0'), false);
  assert.equal(isAllowedLicense('CC BY-ND 2.0'), false);
  assert.equal(isAllowedLicense('Fair use'), false);
  assert.equal(isAllowedLicense(''), false);
});

test('entry from a Commons API response', () => {
  const page = {
    title: 'File:Primer.jpg',
    imageinfo: [{
      url: 'https://upload.wikimedia.org/a/Primer.jpg', thumburl: 'https://upload.wikimedia.org/thumb/a/Primer.jpg/1280px-Primer.jpg',
      thumbwidth: 1280, thumbheight: 853, width: 3000, height: 2000, mime: 'image/jpeg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Primer.jpg',
      extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, Artist: { value: '<a href="x">Петар Петровић</a>' }, LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' } },
    }],
  };
  const e = entryFromInfo(page, 'Рођење Христово');
  assert.equal(e.author, 'Петар Петровић');
  assert.equal(e.width, 1280);
  assert.equal(e.license, 'CC BY-SA 4.0');
  const small = structuredClone(page);
  small.imageinfo[0]!.width = 500;
  assert.equal(entryFromInfo(small, 'x'), null);
});
