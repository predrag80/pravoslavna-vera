/**
 * Church calendar of the Serbian Orthodox Church.
 *
 * Everything is computed locally, with no external API:
 *  - Pascha by the Julian paschalion (Meeus), converted to a Gregorian date;
 *  - fixed feasts are stored by the old (Julian) calendar;
 *  - movable feasts are computed as an offset from Pascha;
 *  - fasting: for years that have data from the church calendar (src/data/fasting/<year>.json) the level is
 *    taken from the calendar; for other years it is computed by the rules (multi-day fasts, Wednesday and Friday,
 *    fast-free weeks, relaxations for feasts).
 *
 * The difference between the calendars is 13 days for the years 1900–2099.
 */
import feasts from '../data/feasts.json' with { type: 'json' };
import fasting2026 from '../data/fasting/2026.json' with { type: 'json' };

export type FeastKind = 'red-letter' | 'feast' | 'pascha' | 'fast';

export interface Feast {
  id: string;
  name: string;
  kind: FeastKind;
  description: string;
  movable: boolean;
  date: Date; // Gregorian, at UTC midnight
}

/** Fasting level, from the mildest to the strictest. */
export type FastLevel = 'none' | 'dairy' | 'fish' | 'oil' | 'water' | 'abstain';

export const FAST_LEVELS: Record<FastLevel, { name: string; description: string }> = {
  none: { name: 'Мрсно', description: 'Нема поста.' },
  dairy: { name: 'Бели мрс', description: 'Млеко, сир и јаја су дозвољени, месо није.' },
  fish: { name: 'Риба', description: 'Посна храна са рибом, уљем и вином.' },
  oil: { name: 'На уљу', description: 'Посна храна са уљем и вином, без рибе.' },
  water: { name: 'На води', description: 'Посна храна без уља и вина.' },
  abstain: { name: 'Уздржање', description: 'Најстрожи пост; по могућности без хране до вечери.' },
};

export interface DayFast {
  isFast: boolean;
  label: string; // e.g. „Божићни пост“, „Среда“, „Мрсни дан“
  level: FastLevel;
  /** Whether the level was taken from the church calendar or computed by the rules. */
  source: 'calendar' | 'rules';
}

const DAY_MS = 86_400_000;
const CALENDAR_OFFSET = 13;

/** A date as UTC midnight, so day arithmetic does not depend on the time zone. */
export function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function today(): Date {
  const d = new Date();
  return utc(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DAY_MS);
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

/** Orthodox Pascha (Gregorian date) for the given year. */
export function pascha(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return addDays(utc(year, month, day), CALENDAR_OFFSET);
}

/** Old-calendar date for the given Gregorian date. */
export function toOldStyle(d: Date): { day: number; month: number } {
  const j = addDays(d, -CALENDAR_OFFSET);
  return { day: j.getUTCDate(), month: j.getUTCMonth() + 1 };
}

/** Gregorian date of a fixed feast (old-style m/d) in a Gregorian year. */
function fromOldStyle(year: number, month: number, day: number): Date {
  return addDays(utc(year, month, day), CALENDAR_OFFSET);
}

interface FixedEntry { id: string; name: string; kind: FeastKind; oldStyle: [number, number]; description: string }
interface MovableEntry { id: string; name: string; kind: FeastKind; fromPascha: number; description: string }

/** All feasts falling in the given Gregorian year, sorted by date. */
export function feastsOfYear(year: number): Feast[] {
  const p = pascha(year);
  const list: Feast[] = [];
  for (const e of feasts.fixed as FixedEntry[]) {
    // An old-calendar feast can fall in this or the next Gregorian year
    // (e.g. Christmas, 25 Dec old style, is 7 January), so we check both.
    for (const y of [year - 1, year]) {
      const d = fromOldStyle(y, e.oldStyle[0], e.oldStyle[1]);
      if (d.getUTCFullYear() === year) {
        list.push({ id: e.id, name: e.name, kind: e.kind, description: e.description, movable: false, date: d });
      }
    }
  }
  for (const e of feasts.movable as MovableEntry[]) {
    list.push({ id: e.id, name: e.name, kind: e.kind, description: e.description, movable: true, date: addDays(p, e.fromPascha) });
  }
  return list.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function feastsOfDay(d: Date): Feast[] {
  return feastsOfYear(d.getUTCFullYear()).filter((x) => sameDay(x.date, d));
}

/** Upcoming feasts from the given day (including that day). */
export function upcomingFeasts(d: Date, count = 3, filter?: (f: Feast) => boolean): Feast[] {
  const y = d.getUTCFullYear();
  return [...feastsOfYear(y), ...feastsOfYear(y + 1)]
    .filter((x) => x.date.getTime() >= d.getTime() && (!filter || filter(x)))
    .slice(0, count);
}

function inRange(d: Date, from: Date, to: Date): boolean {
  return d.getTime() >= from.getTime() && d.getTime() <= to.getTime();
}

/** Multi-day fasts that touch the given year. */
export function multiDayFasts(year: number): { name: string; from: Date; to: Date }[] {
  const list: { name: string; from: Date; to: Date }[] = [];
  for (const y of [year - 1, year, year + 1]) {
    const p = pascha(y);
    list.push({ name: 'Велики пост', from: addDays(p, -48), to: addDays(p, -1) });
    // The Apostles' Fast starts on the Monday after All Saints' Sunday and lasts until Petrovdan.
    const petrovdan = fromOldStyle(y, 6, 29);
    const start = addDays(p, 57);
    if (start.getTime() < petrovdan.getTime()) {
      list.push({ name: 'Петровски пост', from: start, to: addDays(petrovdan, -1) });
    }
    list.push({ name: 'Госпојински пост', from: fromOldStyle(y, 8, 1), to: fromOldStyle(y, 8, 14) });
    list.push({ name: 'Божићни пост', from: fromOldStyle(y, 11, 15), to: fromOldStyle(y, 12, 24) });
  }
  return list;
}

/** Great (Twelve) Feasts: if they fall on a Wednesday or Friday outside a fast, fish is allowed. */
const GREAT_FEASTS = new Set(['mala-gospojina', 'krstovdan', 'vavedenje', 'sretenje', 'blagovesti', 'cveti', 'spasovdan', 'duhovi', 'preobrazenje', 'velika-gospojina']);

function ruleDay(level: FastLevel, label: string): DayFast {
  return { isFast: level !== 'none', label, level, source: 'rules' };
}

/**
 * Old-calendar feasts [month, day] that relax water-only fast days to oil and wine
 * (polyeleos and vigil-rank saints). The list is derived from the SOC calendar for 2026 and is not complete;
 * it is not used for years that have calendar data.
 */
const OIL_RELAXATION: [number, number][] = [
  [1, 15], [1, 17], [2, 13], [2, 17], [2, 24], [3, 9], [3, 26], [6, 11], [7, 2], [7, 25], [7, 30],
  [9, 3], [9, 24], [9, 26], [10, 1], [11, 12], [11, 14], [11, 24], [12, 5], [12, 10], [12, 12], [12, 17], [12, 20],
];

/** Church-calendar data by year: 'MM-DD' → level (days without a fast are not listed). */
const FAST_CALENDARS: Record<number, Record<string, string>> = { 2026: fasting2026.days };
const CALENDAR_LEVELS = new Set<string>(['dairy', 'fish', 'oil', 'water', 'abstain']);

export function hasFastCalendar(year: number): boolean {
  return year in FAST_CALENDARS;
}

/**
 * The fast for the given day, per the Typikon, in the form church calendars publish it.
 *
 * FOR REVIEW: the rules should be confirmed by a priest before publishing,
 * and the app everywhere advises the user to consult their spiritual father about fasting.
 *
 * Order of checks: fast-free weeks → strict one-day fasts → Great Lent → Cheesefare Week
 * → Nativity, Apostles' and Dormition fasts → Wednesday and Friday through the year.
 */
export function fastOfDay(d: Date): DayFast {
  const r = fastByRules(d);
  const calendar = FAST_CALENDARS[d.getUTCFullYear()];
  if (!calendar) return r;
  const entry = calendar[d.toISOString().slice(5, 10)];
  const level: FastLevel = entry && CALENDAR_LEVELS.has(entry) ? (entry as FastLevel) : 'none';
  let label = r.label;
  if (level === 'none' && r.isFast) label = 'Без поста';
  else if (level !== 'none' && !r.isFast) label = d.getUTCDay() === 3 ? 'Среда' : d.getUTCDay() === 5 ? 'Петак' : 'Посни дан';
  return { isFast: level !== 'none', label, level, source: 'calendar' };
}

/** The fast by the rules of the Typikon; used for years with no church-calendar data. */
export function fastByRules(d: Date): DayFast {
  const y = d.getUTCFullYear();
  const s = toOldStyle(d);
  const onOldStyle = (m: number, dd: number) => s.month === m && s.day === dd;
  const weekday = d.getUTCDay(); // 0 = Sunday, 3 = Wednesday, 5 = Friday, 6 = Saturday
  const weekend = weekday === 0 || weekday === 6;
  const feastIds = feastsOfDay(d).map((x) => x.id);

  // 1. Fast-free weeks: Bright Week, Trinity Week, the week of the Publican and the Pharisee, Svyatki (Christmas to Theophany Eve).
  for (const year of [y - 1, y]) {
    const p = pascha(year);
    const fastFree: [Date, Date, string][] = [
      [p, addDays(p, 6), 'Светла седмица'],
      [addDays(p, 50), addDays(p, 56), 'Тројичина седмица'],
      [addDays(p, -69), addDays(p, -64), 'Седмица Митара и фарисеја'],
    ];
    for (const [a, b, name] of fastFree) if (inRange(d, a, b)) return ruleDay('none', `${name}, без поста`);
  }
  const christmas = fromOldStyle(y - 1, 12, 25); // 7 January of this year
  if (inRange(d, christmas, addDays(christmas, 10))) return ruleDay('none', 'Свјатки, без поста');

  // 2. Strict one-day fasts (relaxed to oil on Saturday and Sunday).
  const strict = onOldStyle(1, 5) ? 'Крстовдан (Богојављенско навечерје)' : onOldStyle(8, 29) ? 'Усековање' : onOldStyle(9, 14) ? 'Крстовдан' : onOldStyle(12, 24) ? 'Бадњи дан' : null;
  if (strict) return ruleDay(weekend ? 'oil' : 'water', strict);

  const p = pascha(y);
  const fromP = daysBetween(d, p);
  const relaxed = OIL_RELAXATION.some(([m, dd]) => onOldStyle(m, dd));
  const redLetter = feastsOfDay(d).some((x) => x.kind === 'red-letter');

  // 3. Great Lent (Clean Monday to Holy Saturday).
  if (fromP >= -48 && fromP <= -1) {
    if (fromP >= -48 && fromP <= -46) return ruleDay('abstain', 'Велики пост, прва три дана');
    if (fromP === -2) return ruleDay('abstain', 'Велики петак');
    if (fromP === -1) return ruleDay('water', 'Велика субота');
    if (fromP === -3) return ruleDay('oil', 'Велики четвртак');
    if (fromP === -7) return ruleDay('fish', 'Цвети');
    if (feastIds.includes('blagovesti')) return ruleDay('fish', 'Благовести у Великом посту');
    if (fromP === -8) return ruleDay('oil', 'Лазарева субота');
    if (weekend || relaxed || onOldStyle(3, 9)) return ruleDay('oil', 'Велики пост');
    return ruleDay('water', 'Велики пост');
  }

  // 4. Cheesefare (dairy) Week before Great Lent.
  if (fromP >= -55 && fromP <= -49) return ruleDay('dairy', 'Сирна седмица');

  // 5. Multi-day fasts during the year.
  //    Nativity and Apostles' fasts: Monday, Wednesday, Friday on water; Tuesday, Thursday on oil; Saturday, Sunday fish.
  //    In the last seven days of the Nativity Fast the weekend is on oil. Dormition Fast: on water, oil at weekends.
  for (const f of multiDayFasts(y)) {
    if (!inRange(d, f.from, f.to) || f.name === 'Велики пост') continue;
    if (feastIds.some((x) => GREAT_FEASTS.has(x)) || feastIds.includes('nikoljdan') || onOldStyle(6, 24)) return ruleDay('fish', f.name);
    if (f.name === 'Госпојински пост') return ruleDay(weekend || relaxed ? 'oil' : 'water', f.name);
    const lastDays = f.name === 'Божићни пост' && d >= fromOldStyle(f.from.getUTCFullYear(), 12, 18);
    if (weekend) return ruleDay(lastDays ? 'oil' : 'fish', lastDays ? `${f.name}, последњи дани` : f.name);
    if (weekday === 2 || weekday === 4) return ruleDay('oil', f.name);
    return ruleDay(relaxed || redLetter ? 'oil' : 'water', f.name);
  }

  // 6. Wednesday and Friday through the year.
  if (weekday === 3 || weekday === 5) {
    const name = weekday === 3 ? 'Среда' : 'Петак';
    if (feastIds.some((x) => GREAT_FEASTS.has(x))) return ruleDay('fish', `${name}, велики празник`);
    // From Thomas Sunday to Pentecost: Mid-Pentecost Wednesday and the Wednesday before Ascension are fish, others oil.
    if (fromP >= 7 && fromP <= 49) {
      if (fromP === 24 || fromP === 38) return ruleDay('fish', `${name}, ${fromP === 24 ? 'Преполовљење' : 'оданије Васкрса'}`);
      return ruleDay('oil', `${name} после Васкрса`);
    }
    if (redLetter || relaxed) return ruleDay('oil', `${name}, празник`);
    return ruleDay('water', name);
  }
  return ruleDay('none', 'Мрсни дан');
}

/** Start of the church year (1 September old style = 14 September) containing the given day. */
export function churchYearStart(d: Date): Date {
  const y = d.getUTCFullYear();
  const thisYear = fromOldStyle(y, 9, 1);
  return d.getTime() >= thisYear.getTime() ? thisYear : fromOldStyle(y - 1, 9, 1);
}
