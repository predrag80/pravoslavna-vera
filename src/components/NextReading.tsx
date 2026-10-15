'use client';

import Link from 'next/link';
import { useToday } from '@/lib/hooks';
import { readingsOfDay, nextReadingDate } from '@/lib/readings';
import { WEEKDAYS, MONTHS } from '@/lib/dates';

/** Card with today's or the next upcoming Liturgy readings. */
export default function NextReading() {
  const today = useToday();
  if (!today) return null;
  const iso = today.toISOString().slice(0, 10);
  const date = nextReadingDate(iso);
  const c = date ? readingsOfDay(date) : null;
  if (!date || !c) return null;
  const d = new Date(`${date}T00:00:00Z`);
  const when = date === iso ? 'Данас' : `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
  return (
    <Link href={`/citanja/${date}/`} className="card" style={{ textDecoration: 'none', color: 'var(--vault)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span>
        <span className="eyebrow" style={{ display: 'block' }}>Читања на Литургији · {when}</span>
        <b style={{ display: 'block' }}>{c.epistle.split(';')[0]}</b>
        <b style={{ display: 'block' }}>{c.gospel.split(';')[0]}</b>
      </span>
      <span aria-hidden="true" style={{ color: 'var(--gold-dark)' }}>›</span>
    </Link>
  );
}
