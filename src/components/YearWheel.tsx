'use client';

import { useMemo, useState } from 'react';
import { useToday } from '@/lib/hooks';
import { addDays, churchYearStart, toOldStyle, feastsOfYear, daysBetween, multiDayFasts, type Feast } from '@/lib/calendar';
import { MONTHS, MONTHS_SHORT, inDays } from '@/lib/dates';
import s from './YearWheel.module.css';

const C = 170;
const R = 122;
const COLOR: Record<Feast['kind'], string> = { 'red-letter': '#f0675b', feast: '#f3ebd8', pascha: '#e6c77a', fast: '#b9aceb' };

/** The church year as a wheel: it starts on 14 September, Pascha is the anchor, arcs are fasts. */
export default function YearWheel({ onOpenDay }: { onOpenDay?: (d: Date) => void }) {
  // The day is determined in the browser so the wheel always shows today, not the site build date.
  const d0 = useToday();

  const k = useMemo(() => {
    if (!d0) return null;
    const start = churchYearStart(d0);
    const end = addDays(start, 364);
    const length = daysBetween(addDays(start, 365), start);
    const angle = (d: Date) => (daysBetween(d, start) / length) * 2 * Math.PI - Math.PI / 2;
    const point = (r: number, d: Date) => ({ x: C + r * Math.cos(angle(d)), y: C + r * Math.sin(angle(d)) });
    const g = start.getUTCFullYear();

    const arcs = [...multiDayFasts(g), ...multiDayFasts(g + 1)]
      .map((p) => ({ from: p.from < start ? start : p.from, to: p.to > end ? end : p.to, name: p.name }))
      .filter((p) => p.from <= p.to)
      .map((p) => {
        const a = point(R, p.from);
        const b = point(R, addDays(p.to, 1));
        const large = daysBetween(p.to, p.from) / length > 0.5 ? 1 : 0;
        return { key: p.name + p.from.toISOString(), d: `M${a.x} ${a.y} A${R} ${R} 0 ${large} 1 ${b.x} ${b.y}` };
      });

    const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(g, start.getUTCMonth() + i, 15)))
      .filter((m) => m >= start && m <= end)
      .map((m) => ({ ...point(156, m), name: MONTHS_SHORT[m.getUTCMonth()]!.toUpperCase(), key: m.toISOString() }));

    const feasts = [...feastsOfYear(g), ...feastsOfYear(g + 1)].filter((p) => p.date >= start && p.date <= end);
    return { point, arcs, months, feasts, needle: point(96, d0), today: point(R, d0) };
  }, [d0]);

  const [selected, setSelected] = useState<string | null>(null);
  const first = k && d0 ? (k.feasts.find((p) => p.date >= d0) ?? k.feasts[0]) : undefined;
  const p = k?.feasts.find((x) => x.id === selected) ?? first;

  if (!k || !d0) return <div className={s.wheel} aria-busy="true" />;
  const st = toOldStyle(d0);
  const pt = p ? k.point(R, p.date) : null;

  return (
    <>
      <div className={s.wheel} role="img" aria-label="Црквена година као круг: постови, празници и данашњи дан">
        <svg viewBox="0 0 340 340" aria-hidden="true">
          <circle cx={C} cy={C} r={R} fill="none" stroke="#24365f" strokeWidth="18" />
          {k.arcs.map((l) => <path key={l.key} d={l.d} fill="none" stroke="#8b79d1" strokeWidth="18" />)}
          <circle cx={C} cy={C} r="96" fill="#1a2a4c" stroke="#34477a" />
          <line x1={C} y1={C} x2={k.needle.x} y2={k.needle.y} stroke="#e6c77a" strokeWidth="2" strokeLinecap="round" />
          {k.months.map((m) => (
            <text key={m.key} x={m.x} y={m.y + 4} textAnchor="middle" fill="#9aa5c3" fontSize="10" fontWeight="700" fontFamily="Manrope, sans-serif">{m.name}</text>
          ))}
          {k.feasts.map((x) => {
            const t = k.point(R, x.date);
            return <circle key={x.id + x.date.toISOString()} cx={t.x} cy={t.y} r={x.kind === 'pascha' ? 8 : 4.5} fill={COLOR[x.kind]} />;
          })}
          {pt && <circle cx={pt.x} cy={pt.y} r="14" fill="none" stroke="#f3ebd8" strokeWidth="2" />}
          <rect x={k.today.x - 6} y={k.today.y - 6} width="12" height="12" rx="3" fill="#14213d" stroke="#e6c77a" strokeWidth="2" transform={`rotate(45 ${k.today.x} ${k.today.y})`} />
        </svg>
        <div className={s.center}>
          <span className="eyebrow">Данас</span>
          <span className={s.number}>{d0.getUTCDate()}</span>
          <span>{MONTHS[d0.getUTCMonth()]}</span>
          <span className={s.oldStyle}>{st.day}. {MONTHS_SHORT[st.month - 1]}. по старом</span>
        </div>
      </div>

      <ul className={s.legend} aria-hidden="true">
        <li><i style={{ background: 'var(--gold-light)', width: 12, height: 12 }} />Васкрс</li>
        <li><i style={{ background: 'var(--red-on-dark)' }} />Црвено слово</li>
        <li><i style={{ background: 'var(--ivory)' }} />Празник</li>
        <li><i style={{ background: 'var(--fast)', width: 16, height: 6, borderRadius: 3 }} />Пост</li>
      </ul>

      <div className="chip-row" role="group" aria-label="Празници">
        {k.feasts.map((x) => (
          <button key={x.id + x.date.toISOString()} type="button" className={`chip ${s.chip}`} aria-pressed={x.id === p?.id} onClick={() => setSelected(x.id)}>
            {x.name}
          </button>
        ))}
      </div>

      {p && (
        <section className={s.detail} aria-live="polite">
          <div className={s.row}>
            <div>
              <h2>{p.name}</h2>
              <p className={s.meta}>
                {p.date.getUTCDate()}. {MONTHS[p.date.getUTCMonth()]} {p.date.getUTCFullYear()}. ·{' '}
                {p.kind === 'pascha' ? 'покретни празник, сидро године' : p.kind === 'fast' ? 'почетак поста' : `${p.kind === 'red-letter' ? 'црвено слово, ' : ''}${p.movable ? 'покретни' : 'непокретни'} празник`}
              </p>
            </div>
            <span className={s.when}>{daysBetween(p.date, d0) < 0 ? 'прошао' : inDays(daysBetween(p.date, d0))}</span>
          </div>
          <p className={s.description}>{p.description}</p>
          {onOpenDay && (
            <button type="button" className={s.wholeDay} onClick={() => onOpenDay(p.date)}>Цео дан ›</button>
          )}
        </section>
      )}
    </>
  );
}
