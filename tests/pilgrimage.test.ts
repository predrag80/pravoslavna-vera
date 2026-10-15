import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shorterOrder, km, toRoman, totalKm, centuryNumber, directionsUrl } from '../src/lib/pilgrimage.ts';

const belgrade = { lat: 44.8125, lon: 20.4612 };
const noviSad = { lat: 45.2671, lon: 19.8335 };
const nis = { lat: 43.3209, lon: 21.8958 };

test('Belgrade–Novi Sad distance is about 70 km', () => {
  const d = km(belgrade, noviSad);
  assert.ok(d > 65 && d < 75, String(d));
});

test('centuries from notation', () => {
  assert.equal(centuryNumber('XII век'), 12);
  assert.equal(centuryNumber('XIV–XV век'), 14);
  assert.equal(centuryNumber('XIX век'), 19);
  assert.equal(centuryNumber('XX–XXI век'), 20);
  assert.equal(centuryNumber('непознато'), null);
  assert.equal(toRoman(14), 'XIV');
  assert.equal(toRoman(19), 'XIX');
});

test('shorter order does not lengthen the route and keeps the start', () => {
  const points = [
    { id: 'a', lat: 44.0, lon: 20.0 }, { id: 'b', lat: 44.0, lon: 22.0 },
    { id: 'c', lat: 44.0, lon: 20.5 }, { id: 'd', lat: 44.0, lon: 21.5 }, { id: 'e', lat: 44.0, lon: 21.0 },
  ];
  const r = shorterOrder(points);
  assert.equal(r[0]!.id, 'a');
  assert.deepEqual(r.map((x) => x.id), ['a', 'c', 'e', 'd', 'b']);
  assert.ok(totalKm(r) <= totalKm(points));
  assert.equal(r.length, points.length);
});

test('directions link has all stops in order', () => {
  assert.equal(directionsUrl([noviSad, nis], belgrade), 'https://www.google.com/maps/dir/44.8125,20.4612/45.2671,19.8335/43.3209,21.8958/');
});
