/** Bible reading plans: portions by day, without points or streaks. */
import books from '../data/books.json' with { type: 'json' };
import { KATHISMAS, lxxToHebrew } from './psalms.ts';

export interface PlanPart { book: string; chapter: number; from?: number; to?: number; label: string }
export interface Plan { id: string; name: string; description: string; days: PlanPart[][] }

interface BookEntry { id: string; short: string; chapters: number }
const all = [...books.oldTestament, ...books.newTestament].flatMap((g) => g.books) as BookEntry[];
const book = (id: string) => all.find((x) => x.id === id)!;

function chaptersOf(ids: string[]): PlanPart[] {
  return ids.flatMap((id) => Array.from({ length: book(id).chapters }, (_, i) => ({ book: id, chapter: i + 1, label: `${book(id).short} ${i + 1}` })));
}

/** Spreads the parts evenly over the given number of days (the first days get the remainder). */
export function distribute<T>(parts: T[], dayCount: number): T[][] {
  const days: T[][] = [];
  let i = 0;
  for (let d = 0; d < dayCount; d++) {
    const n = Math.floor(parts.length / dayCount) + (d < parts.length % dayCount ? 1 : 0);
    days.push(parts.slice(i, i + n));
    i += n;
  }
  return days;
}

const ntInOrder = [...books.newTestament].flatMap((g) => g.books.map((x) => x.id));

export const PLANS: Plan[] = [
  {
    id: 'jevandjelja-40',
    name: 'Четири Јеванђеља за 40 дана',
    description: 'Матеј, Марко, Лука и Јован, две до три главе дневно. Добро за Велики или Божићни пост.',
    days: distribute(chaptersOf(['matej', 'marko', 'luka', 'jovan']), 40),
  },
  {
    id: 'psaltir-20',
    name: 'Псалтир за 20 дана',
    description: 'Једна катизма дневно, како се Псалтир чита у Цркви.',
    days: KATHISMAS.map(([from, to], i) => {
      const first = lxxToHebrew(from);
      const last = lxxToHebrew(to);
      return Array.from({ length: last - first + 1 }, (_, j) => ({ book: 'psalmi', chapter: first + j, label: `Псалам ${first + j}` })).map((x, j, arr) =>
        j === 0 ? { ...x, label: `Катизма ${i + 1}: ${x.label}${arr.length > 1 ? `–${last}` : ''}` } : x,
      );
    }),
  },
  {
    id: 'dela-28',
    name: 'Дела апостолска за 28 дана',
    description: 'Почетак Цркве, глава по глава. Чита се од Васкрса до Духова.',
    days: distribute(chaptersOf(['dela']), 28),
  },
  {
    id: 'novi-zavet-260',
    name: 'Нови завет за 260 дана',
    description: 'Једна глава дневно, црквеним редом књига.',
    days: distribute(chaptersOf(ntInOrder), 260),
  },
];

export function findPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
