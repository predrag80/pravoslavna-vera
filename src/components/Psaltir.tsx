'use client';

import Link from 'next/link';
import { useState } from 'react';
import { KATIZME, lxxUHebrejski } from '@/lib/psalmi';
import s from './Psaltir.module.css';

export default function Psaltir() {
  const [prikaz, setPrikaz] = useState<'katizme' | 'psalmi'>('katizme');
  const [katizma, setKatizma] = useState<number | null>(null);

  const psalmi = (od: number, doBr: number) => Array.from({ length: doBr - od + 1 }, (_, i) => od + i);

  return (
    <>
      <div className={s.prekidac} role="tablist" aria-label="Приказ">
        <button type="button" role="tab" aria-selected={prikaz === 'katizme'} onClick={() => setPrikaz('katizme')}>Катизме</button>
        <button type="button" role="tab" aria-selected={prikaz === 'psalmi'} onClick={() => setPrikaz('psalmi')}>Псалми 1–150</button>
      </div>

      {prikaz === 'katizme' ? (
        <>
          <div className="mreza mreza-4">
            {KATIZME.map(([od, doBr], i) => (
              <button key={i} type="button" className={s.katizma} aria-expanded={katizma === i} onClick={() => setKatizma(katizma === i ? null : i)}>
                <b>{i + 1}</b>
                <small>{od === doBr ? od : `${od}–${doBr}`}</small>
              </button>
            ))}
          </div>
          {katizma !== null && (
            <section className="kartica" style={{ marginTop: 12 }} aria-live="polite">
              <h2>Катизма {katizma + 1}</h2>
              <div className="mreza mreza-6" style={{ marginTop: 10 }}>
                {psalmi(...KATIZME[katizma]!).map((n) => <PsalamVeza key={n} n={n} />)}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="mreza mreza-6">{psalmi(1, 150).map((n) => <PsalamVeza key={n} n={n} />)}</div>
      )}
      <p className="prigusen" style={{ fontSize: 12 }}>Нумерација по Септуагинти, као у богослужењу. Где се разликује, мањим бројем је дат број у Даничићевом преводу.</p>
    </>
  );
}

function PsalamVeza({ n }: { n: number }) {
  const h = lxxUHebrejski(n);
  return (
    <Link href={`/pismo/psalmi/${h}/`} className={s.psalam} aria-label={h === n ? `Псалам ${n}` : `Псалам ${n}, код Даничића ${h}`}>
      {n}
      {h !== n && <small>{h}</small>}
    </Link>
  );
}
