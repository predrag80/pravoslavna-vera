'use client';

import Link from 'next/link';
import { useDanas } from '@/lib/kuke';
import { citanjaDana, sledeceCitanje } from '@/lib/citanja';
import { DANI, MESECI } from '@/lib/datumi';

/** Картица са данашњим или првим следећим читањима на Литургији. */
export default function SledeceCitanje() {
  const danas = useDanas();
  if (!danas) return null;
  const iso = danas.toISOString().slice(0, 10);
  const datum = sledeceCitanje(iso);
  const c = datum ? citanjaDana(datum) : null;
  if (!datum || !c) return null;
  const d = new Date(`${datum}T00:00:00Z`);
  const kada = datum === iso ? 'Данас' : `${DANI[d.getUTCDay()]}, ${d.getUTCDate()}. ${MESECI[d.getUTCMonth()]}`;
  return (
    <Link href={`/citanja/${datum}/`} className="kartica" style={{ textDecoration: 'none', color: 'var(--svod)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span>
        <span className="natpis" style={{ display: 'block' }}>Читања на Литургији · {kada}</span>
        <b style={{ display: 'block' }}>{c.apostol.split(';')[0]}</b>
        <b style={{ display: 'block' }}>{c.jevandjelje.split(';')[0]}</b>
      </span>
      <span aria-hidden="true" style={{ color: 'var(--zlato-tamno)' }}>›</span>
    </Link>
  );
}
