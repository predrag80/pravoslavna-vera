/** Everything known about a single day: dates, fast, feasts, saints. Also works in the browser. */
import { toOldStyle, fastOfDay, feastsOfDay, type DayFast, type Feast } from './calendar.ts';
import { MONTHS, longDate } from './dates.ts';
import saints from '../data/saints.json' with { type: 'json' };

export interface DayInfo {
  date: string;
  oldStyle: string;
  oldStyleKey: string; // MM-DD by the old calendar
  fast: DayFast;
  feasts: Feast[];
  saints: string[];
  redLetter: boolean;
}

const days = (saints as { days: Record<string, { saints: string[] }> }).days;

export function dayInfo(d: Date): DayInfo {
  const s = toOldStyle(d);
  const key = `${String(s.month).padStart(2, '0')}-${String(s.day).padStart(2, '0')}`;
  const feasts = feastsOfDay(d);
  const names = new Set(feasts.map((p) => p.name.toLocaleLowerCase('sr')));
  return {
    date: longDate(d),
    oldStyle: `${s.day}. ${MONTHS[s.month - 1]} по старом календару`,
    oldStyleKey: key,
    fast: fastOfDay(d),
    feasts,
    saints: (days[key]?.saints ?? []).filter((x) => !names.has(x.toLocaleLowerCase('sr'))),
    redLetter: feasts.some((p) => p.kind === 'red-letter' || p.kind === 'pascha'),
  };
}
