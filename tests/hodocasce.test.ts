import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kraciRedosled, km, rimski, ukupnoKm, vekBroj, vezaZaPutanju } from '../src/lib/hodocasce.ts';

const beograd = { lat: 44.8125, lon: 20.4612 };
const noviSad = { lat: 45.2671, lon: 19.8335 };
const nis = { lat: 43.3209, lon: 21.8958 };

test('удаљеност Београд–Нови Сад је око 70 км', () => {
  const d = km(beograd, noviSad);
  assert.ok(d > 65 && d < 75, String(d));
});

test('векови из записа', () => {
  assert.equal(vekBroj('XII век'), 12);
  assert.equal(vekBroj('XIV–XV век'), 14);
  assert.equal(vekBroj('XIX век'), 19);
  assert.equal(vekBroj('XX–XXI век'), 20);
  assert.equal(vekBroj('непознато'), null);
  assert.equal(rimski(14), 'XIV');
  assert.equal(rimski(19), 'XIX');
});

test('краћи редослед не продужава путању и чува полазак', () => {
  const tacke = [
    { id: 'a', lat: 44.0, lon: 20.0 }, { id: 'b', lat: 44.0, lon: 22.0 },
    { id: 'c', lat: 44.0, lon: 20.5 }, { id: 'd', lat: 44.0, lon: 21.5 }, { id: 'e', lat: 44.0, lon: 21.0 },
  ];
  const r = kraciRedosled(tacke);
  assert.equal(r[0]!.id, 'a');
  assert.deepEqual(r.map((x) => x.id), ['a', 'c', 'e', 'd', 'b']);
  assert.ok(ukupnoKm(r) <= ukupnoKm(tacke));
  assert.equal(r.length, tacke.length);
});

test('веза за путању има све станице редом', () => {
  assert.equal(vezaZaPutanju([noviSad, nis], beograd), 'https://www.google.com/maps/dir/44.8125,20.4612/45.2671,19.8335/43.3209,21.8958/');
});
