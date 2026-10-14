'use client';

import { narednih, razlikaDana } from '@/lib/kalendar';
import { MESECI, zaDana } from '@/lib/datumi';
import { useDanas } from '@/lib/kuke';

/** Када је празник следећи пут (рачуна се у прегледачу, јер се покретни празници померају). */
export default function SledeciDatum({ id }: { id: string }) {
  const danas = useDanas();
  if (!danas) return null;
  const p = narednih(danas, 1, (x) => x.id === id)[0];
  if (!p) return null;
  const n = razlikaDana(p.datum, danas);
  return (
    <p className="natpis" style={{ margin: 0 }}>
      {p.datum.getUTCDate()}. {MESECI[p.datum.getUTCMonth()]} {p.datum.getUTCFullYear()}. · {zaDana(n)} · {p.pokretni ? 'покретни празник' : 'непокретни празник'}
    </p>
  );
}
