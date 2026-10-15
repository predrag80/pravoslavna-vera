'use client';

import { addDays, sameDay, FAST_LEVELS, utc } from '@/lib/calendar';
import { MONTHS } from '@/lib/dates';
import { dayInfo } from '@/lib/day-info';
import type { FeastData } from './DaySheet';
import s from './MonthView.module.css';

const WEEKDAY_HEADERS = ['Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб', 'Нед'];

interface Props {
  year: number;
  month: number; // 1–12
  today: Date;
  selected: Date | null;
  data: FeastData;
  onMonth: (offset: number) => void;
  onSelect: (d: Date) => void;
}

export default function MonthView({ year, month, today, selected, data, onMonth, onSelect }: Props) {
  const first = utc(year, month, 1);
  const dayCount = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // the week starts on Monday
  const days = Array.from({ length: dayCount }, (_, i) => addDays(first, i));

  return (
    <section aria-label={`${MONTHS[month - 1]} ${year}.`}>
      <div className={s.header}>
        <button type="button" className={s.arrow} aria-label="Претходни месец" onClick={() => onMonth(-1)}>‹</button>
        <h2>{MONTHS[month - 1]} {year}.</h2>
        <button type="button" className={s.arrow} aria-label="Следећи месец" onClick={() => onMonth(1)}>›</button>
      </div>
      <div className={s.grid} role="grid">
        {WEEKDAY_HEADERS.map((d) => <span key={d} className={s.weekday} role="columnheader">{d}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`p${i}`} aria-hidden="true" />)}
        {days.map((d) => {
          const o = dayInfo(d);
          const major = o.feasts.some((p) => data.content[p.id]);
          const name = o.feasts.find((p) => p.kind !== 'fast')?.name ?? o.saints[0];
          const classes = [s.day, o.redLetter && s.redLetter, sameDay(d, today) && s.today, selected && sameDay(d, selected) && s.selected].filter(Boolean).join(' ');
          return (
            <button
              key={d.getUTCDate()}
              type="button"
              role="gridcell"
              className={classes}
              aria-label={`${d.getUTCDate()}. ${MONTHS[month - 1]}${name ? `, ${name}` : ''}${o.fast.isFast ? `, пост: ${FAST_LEVELS[o.fast.level].name.toLowerCase()}` : ''}`}
              onClick={() => onSelect(d)}
            >
              {major && <span className={s.major} aria-hidden="true" />}
              <span className={s.number}>{d.getUTCDate()}</span>
              <span className={s.oldStyle} aria-hidden="true">{o.oldStyle.split('.')[0]}</span>
              {o.fast.isFast && <span className={`${s.fast} ${s[o.fast.level]}`} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <ul className={s.legend} aria-hidden="true">
        <li><i className={s.lMajor} />Велики празник</li>
        <li><i className={s.lRedLetter} />Црвено слово</li>
        <li><i className={`${s.lFast} ${s.water}`} />На води</li>
        <li><i className={`${s.lFast} ${s.oil}`} />На уљу</li>
        <li><i className={`${s.lFast} ${s.fish}`} />Риба</li>
        <li><small>мали број: стари календар</small></li>
      </ul>
    </section>
  );
}
