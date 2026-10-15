'use client';

import Link from 'next/link';
import { daysBetween, utc } from '@/lib/calendar';
import { useToday, usePlanProgress } from '@/lib/hooks';
import { findPlan } from '@/lib/reading-plans';
import s from './ReadingPlans.module.css';

function fromKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return utc(y!, m!, d!);
}

/** A single plan: today's portion, all days, marking what has been read. No points, no streaks. */
export default function ReadingPlan({ id }: { id: string }) {
  const p = findPlan(id)!;
  const today = useToday();
  const [progress, setProgress] = usePlanProgress();
  const n = progress[id];
  if (!today) return null;

  if (!n) {
    return (
      <div className={s.start}>
        <p>План има {p.days.length} дана. Можете читати својим темпом; пропуштени дан не прави проблем.</p>
        <button type="button" className="button" onClick={() => setProgress(id, { start: today.toISOString().slice(0, 10), read: [] })}>Почни данас</button>
      </div>
    );
  }

  const read = new Set(n.read);
  const scheduled = Math.min(p.days.length - 1, Math.max(0, daysBetween(today, fromKey(n.start))));
  const next = p.days.findIndex((_, i) => !read.has(i));
  const current = next === -1 ? null : next;
  const finished = current === null;

  const toggle = (i: number) => {
    const set = new Set(n.read);
    if (set.has(i)) set.delete(i);
    else set.add(i);
    setProgress(id, { ...n, read: [...set].sort((a, b) => a - b) });
  };

  return (
    <>
      <section className={s.today} aria-live="polite">
        {finished ? (
          <>
            <span className="eyebrow">План је прочитан</span>
            <h2>Слава Богу за све!</h2>
          </>
        ) : (
          <>
            <span className="eyebrow">Дан {current! + 1} од {p.days.length}{current! < scheduled ? ` · по распореду сте на дану ${scheduled + 1}` : ''}</span>
            <div className={s.parts}>
              {p.days[current!]!.map((d) => (
                <Link key={`${d.book}-${d.chapter}`} href={`/pismo/${d.book}/${d.chapter}/`} className={s.part}>{d.label} ›</Link>
              ))}
            </div>
            <button type="button" className="button" onClick={() => toggle(current!)}>Прочитао сам</button>
          </>
        )}
        <div className={s.progress}>
          <span className={s.bar} aria-hidden="true"><span style={{ width: `${(read.size / p.days.length) * 100}%` }} /></span>
          Прочитано {read.size} од {p.days.length} дана
        </div>
      </section>

      <ol className={s.days}>
        {p.days.map((parts, i) => (
          <li key={i} className={i === current ? s.current : undefined}>
            <label>
              <input type="checkbox" checked={read.has(i)} onChange={() => toggle(i)} />
              <span className={s.number}>{i + 1}</span>
              <span className={s.content}>{parts.map((d) => d.label).join(', ')}</span>
            </label>
          </li>
        ))}
      </ol>
      <button type="button" className="button button-outline" style={{ width: '100%', marginBottom: 16 }} onClick={() => setProgress(id, null)}>
        Почни план испочетка
      </button>
    </>
  );
}
