'use client';

import { useState } from 'react';
import type { Pitanje } from '@/lib/sadrzaj';

/** Опциона провера знања: корисник је отвара само ако жели. Без бодова и такмичења. */
export default function ProveraZnanja({ pitanja }: { pitanja: Pitanje[] }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const [odgovori, setOdgovori] = useState<Record<number, number>>({});

  if (!otvoreno) {
    return (
      <button type="button" className="dugme dugme-isprekidano" onClick={() => setOtvoreno(true)}>
        Провери знање · по жељи
      </button>
    );
  }
  return (
    <section className="kartica" aria-label="Провера знања">
      {pitanja.map((p, i) => (
        <fieldset key={i} style={{ border: 'none', margin: '0 0 12px', padding: 0 }}>
          <legend style={{ fontWeight: 700, marginBottom: 6 }}>{p.pitanje}</legend>
          {p.odgovori.map((o, j) => {
            const izabran = odgovori[i] === j;
            return (
              <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                <input type="radio" name={`p${i}`} checked={izabran} onChange={() => setOdgovori({ ...odgovori, [i]: j })} />
                {o}
                {izabran && <span style={{ color: j === p.tacan ? '#2f6b3a' : 'var(--crveno)', fontWeight: 700 }}>{j === p.tacan ? '— тачно' : '— покушајте поново'}</span>}
              </label>
            );
          })}
        </fieldset>
      ))}
    </section>
  );
}
