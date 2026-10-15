'use client';

import { upcomingFeasts, daysBetween } from '@/lib/calendar';
import { MONTHS, inDays } from '@/lib/dates';
import { useToday } from '@/lib/hooks';

/** When the feast falls next (computed in the browser, since movable feasts shift). */
export default function NextDate({ id }: { id: string }) {
  const today = useToday();
  if (!today) return null;
  const p = upcomingFeasts(today, 1, (x) => x.id === id)[0];
  if (!p) return null;
  const n = daysBetween(p.date, today);
  return (
    <p className="eyebrow" style={{ margin: 0 }}>
      {p.date.getUTCDate()}. {MONTHS[p.date.getUTCMonth()]} {p.date.getUTCFullYear()}. · {inDays(n)} · {p.movable ? 'покретни празник' : 'непокретни празник'}
    </p>
  );
}
