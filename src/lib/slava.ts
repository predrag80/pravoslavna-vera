/** Family slava: its date in a year and the next slava day. */
import data from '../data/slavas.json' with { type: 'json' };
import { addDays, utc, pascha } from './calendar.ts';

export interface Slava { id: string; name: string; saint: string; oldStyle?: number[]; fromPascha?: number; feast: string | null }

export const SLAVAS = data.slavas as Slava[];

export function findSlava(id: string | null | undefined): Slava | null {
  return SLAVAS.find((s) => s.id === id) ?? null;
}

/** The slava date in the given Gregorian year (a fixed old-style slava always falls in the same year, except at the end of December). */
export function slavaDate(s: Slava, year: number): Date {
  if (s.fromPascha !== undefined) return addDays(pascha(year), s.fromPascha);
  const [m, d] = s.oldStyle as [number, number];
  // Old-style date + 13 days; a slava on 19–31 December old style falls in January of the next year.
  const sameYear = addDays(utc(year, m, d), 13);
  return sameYear.getUTCFullYear() === year ? sameYear : addDays(utc(year - 1, m, d), 13);
}

/** The next slava day from the given day (including that day). */
export function nextSlava(s: Slava, from: Date): Date {
  const thisYear = slavaDate(s, from.getUTCFullYear());
  return thisYear.getTime() >= from.getTime() ? thisYear : slavaDate(s, from.getUTCFullYear() + 1);
}
