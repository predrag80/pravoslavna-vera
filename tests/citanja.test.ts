import { test } from 'node:test';
import assert from 'node:assert/strict';
import knjige from '../src/data/knjige.json' with { type: 'json' };
import { citanjaDana, datumiCitanja, rasclani, sledeceCitanje } from '../src/lib/citanja.ts';

test('једноставна референца', () => {
  assert.deepEqual(rasclani('Лк 6:31-36'), [{ knjiga: 'luka', od: { glava: 6, stih: 31 }, do: { glava: 6, stih: 36 } }]);
});

test('прелаз у следећу главу и више делова', () => {
  const r = rasclani('Мк 8:34-9:1; Лк 5:1-11');
  assert.equal(r.length, 2);
  assert.deepEqual(r[0], { knjiga: 'marko', od: { glava: 8, stih: 34 }, do: { glava: 9, stih: 1 } });
  assert.equal(r[1]!.knjiga, 'luka');
});

test('стихови одвојени зарезом и нова глава без књиге', () => {
  const r = rasclani('Мт 10:32-33,37-38; 19:27-30');
  assert.deepEqual(r.map((x) => `${x.knjiga} ${x.od.glava}:${x.od.stih}-${x.do.glava}:${x.do.stih}`), [
    'matej 10:32-10:33', 'matej 10:37-10:38', 'matej 19:27-19:30',
  ]);
  assert.deepEqual(rasclani('Јн 8:12')[0], { knjiga: 'jovan', od: { glava: 8, stih: 12 }, do: { glava: 8, stih: 12 } });
});

test('двословне скраћенице (1 Кор, 2 Тим)', () => {
  assert.equal(rasclani('1 Кор 6:12-20')[0]!.knjiga, '1kor');
  assert.equal(rasclani('2 Тим 3:10-15')[0]!.knjiga, '2tim');
});

test('сва унета читања се рашчлањују и не прелазе број глава књиге', () => {
  const glave = new Map([...knjige.noviZavet].flatMap((g) => g.knjige).map((k) => [k.id, k.glava]));
  for (const d of datumiCitanja()) {
    const c = citanjaDana(d)!;
    for (const ref of [c.apostol, c.jevandjelje]) {
      for (const o of rasclani(ref)) assert.ok(o.do.glava <= glave.get(o.knjiga)!, `${d}: ${ref}`);
    }
  }
});

test('следеће читање', () => {
  assert.equal(sledeceCitanje('2026-10-14'), '2026-10-18');
  assert.equal(citanjaDana('2026-10-18')?.jevandjelje, 'Лк 7:11-16');
});
