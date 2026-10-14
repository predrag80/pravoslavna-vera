'use client';

import Link from 'next/link';
import { usePlanovi } from '@/lib/kuke';
import { PLANOVI } from '@/lib/planovi';

/** Картица на екрану Данас: следећи део плана читања који је корисник започео. */
export default function AktivniPlan() {
  const [napredak] = usePlanovi();
  const aktivni = PLANOVI.filter((p) => napredak[p.id]).map((p) => {
    const procitano = new Set(napredak[p.id]!.procitano);
    const i = p.dani.findIndex((_, n) => !procitano.has(n));
    return { p, i };
  }).filter((x) => x.i !== -1);
  if (!aktivni.length) return null;
  return (
    <section aria-label="Планови читања" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {aktivni.map(({ p, i }) => (
        <Link key={p.id} href={`/planovi/${p.id}/`} className="kartica" style={{ textDecoration: 'none', color: 'var(--svod)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>
            <span className="natpis" style={{ display: 'block' }}>{p.naziv} · дан {i + 1} од {p.dani.length}</span>
            <b>{p.dani[i]!.map((d) => d.naziv).join(', ')}</b>
          </span>
          <span aria-hidden="true" style={{ color: 'var(--zlato-tamno)' }}>›</span>
        </Link>
      ))}
    </section>
  );
}
