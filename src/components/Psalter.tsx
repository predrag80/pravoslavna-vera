'use client';

import Link from 'next/link';
import { useState } from 'react';
import { KATHISMAS, lxxToHebrew } from '@/lib/psalms';
import s from './Psalter.module.css';

export default function Psalter() {
  const [view, setView] = useState<'kathismas' | 'psalms'>('kathismas');
  const [kathisma, setKathisma] = useState<number | null>(null);

  const psalms = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <>
      <div className={s.toggle} role="tablist" aria-label="Приказ">
        <button type="button" role="tab" aria-selected={view === 'kathismas'} onClick={() => setView('kathismas')}>Катизме</button>
        <button type="button" role="tab" aria-selected={view === 'psalms'} onClick={() => setView('psalms')}>Псалми 1–150</button>
      </div>

      {view === 'kathismas' ? (
        <>
          <div className="grid grid-4">
            {KATHISMAS.map(([from, to], i) => (
              <button key={i} type="button" className={s.kathisma} aria-expanded={kathisma === i} onClick={() => setKathisma(kathisma === i ? null : i)}>
                <b>{i + 1}</b>
                <small>{from === to ? from : `${from}–${to}`}</small>
              </button>
            ))}
          </div>
          {kathisma !== null && (
            <section className="card" style={{ marginTop: 12 }} aria-live="polite">
              <h2>Катизма {kathisma + 1}</h2>
              <div className="grid grid-6" style={{ marginTop: 10 }}>
                {psalms(...KATHISMAS[kathisma]!).map((n) => <PsalmLink key={n} n={n} />)}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="grid grid-6">{psalms(1, 150).map((n) => <PsalmLink key={n} n={n} />)}</div>
      )}
      <p className="muted" style={{ fontSize: 12 }}>Нумерација по Септуагинти, као у богослужењу. Где се разликује, мањим бројем је дат број у Даничићевом преводу.</p>
    </>
  );
}

function PsalmLink({ n }: { n: number }) {
  const h = lxxToHebrew(n);
  return (
    <Link href={`/pismo/psalmi/${h}/`} className={s.psalm} aria-label={h === n ? `Псалам ${n}` : `Псалам ${n}, код Даничића ${h}`}>
      {n}
      {h !== n && <small>{h}</small>}
    </Link>
  );
}
