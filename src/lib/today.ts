/** Data for the "Today" screen, the same at build time and in the browser. */
import { toOldStyle, feastsOfDay, fastOfDay, upcomingFeasts, pascha, addDays, daysBetween, multiDayFasts, type DayFast } from './calendar';
import { MONTHS, MONTHS_SHORT, longDate, inDays } from './dates';
import saints from '../data/saints.json' with { type: 'json' };

export interface TodayData {
  date: string;
  oldStyle: string;
  season: string;
  title: string;
  subtitle: string;
  redLetter: boolean;
  fast: DayFast;
  upcoming: { day: number; month: string; name: string; redLetter: boolean; when: string }[];
}

function seasonOf(d: Date): string {
  for (const f of multiDayFasts(d.getUTCFullYear())) {
    if (d >= f.from && d <= f.to) return f.name;
  }
  const p = pascha(d.getUTCFullYear());
  const r = daysBetween(d, p);
  if (r >= 0 && r < 7) return 'Светла седмица';
  if (r >= 0 && r <= 49) return 'Од Васкрса до Духова';
  if (r > 49) return 'Време после Педесетнице';
  return 'Време пред Васкрс';
}

export function todayData(d: Date): TodayData {
  const s = toOldStyle(d);
  const key = `${String(s.month).padStart(2, '0')}-${String(s.day).padStart(2, '0')}`;
  const days = (saints as { days: Record<string, { saints: string[] }> }).days;
  const daySaints = days[key]?.saints ?? [];
  const feast = feastsOfDay(d).find((p) => p.kind !== 'fast');

  const title = feast?.name ?? daySaints[0] ?? '[Светитељ дана]';
  const others = (feast ? daySaints : daySaints.slice(1)).filter((x) => x.toLocaleLowerCase('sr') !== title.toLocaleLowerCase('sr'));
  const subtitle = others.length ? 'и ' + others.map((x) => x.charAt(0).toLowerCase() + x.slice(1)).join(', ') : '';

  return {
    date: longDate(d),
    oldStyle: `${s.day}. ${MONTHS[s.month - 1]} по старом календару`,
    season: seasonOf(d),
    title,
    subtitle,
    redLetter: feast?.kind === 'red-letter' || feast?.kind === 'pascha',
    fast: fastOfDay(d),
    upcoming: upcomingFeasts(addDays(d, 1), 3, (p) => p.kind !== 'fast').map((p) => ({
      day: p.date.getUTCDate(),
      month: MONTHS_SHORT[p.date.getUTCMonth()]!,
      name: p.name,
      redLetter: p.kind === 'red-letter' || p.kind === 'pascha',
      when: inDays(daysBetween(p.date, d)),
    })),
  };
}
