'use client';

import { useState } from 'react';
import { useToday } from '@/lib/hooks';
import { addDays, toOldStyle } from '@/lib/calendar';
import { MONTHS } from '@/lib/dates';
import saints from '@/data/saints.json';
import s from './Prologue.module.css';

const SECTIONS = [
  { id: 'life', name: 'Житије', description: 'Живот светитеља дана' },
  { id: 'poem', name: 'Песма', description: 'Песма у част светитеља' },
  { id: 'reflection', name: 'Расуђивање', description: 'Поука из живота светих' },
  { id: 'contemplation', name: 'Созерцање', description: 'Тема за размишљање током дана' },
  { id: 'homily', name: 'Беседа', description: 'Тумачење одломка из Светог писма' },
];
const days = (saints as { days: Record<string, { saints: string[] }> }).days;

export default function Prologue() {
  const today = useToday();
  const [offset, setOffset] = useState(0);
  const [section, setSection] = useState('life');
  if (!today) return null;
  const day = addDays(today, offset);

  const os = toOldStyle(day);
  const daySaints = days[`${String(os.month).padStart(2, '0')}-${String(os.day).padStart(2, '0')}`]?.saints ?? [];
  const d = SECTIONS.find((x) => x.id === section)!;

  return (
    <>
      <div className={s.day}>
        <button type="button" aria-label="Претходни дан" onClick={() => setOffset(offset - 1)}>‹</button>
        <div>
          <b>{day.getUTCDate()}. {MONTHS[day.getUTCMonth()]}</b>
          <span className="muted">{os.day}. {MONTHS[os.month - 1]} по старом</span>
        </div>
        <button type="button" aria-label="Следећи дан" onClick={() => setOffset(offset + 1)}>›</button>
      </div>
      <h2 className={s.saint}>{daySaints[0] ?? '[Светитељ дана]'}</h2>
      {daySaints.length > 1 && <p className={`muted ${s.others}`}>{daySaints.slice(1).join(' · ')}</p>}

      <div className="chip-row" role="tablist" aria-label="Делови Пролога" style={{ marginTop: 14 }}>
        {SECTIONS.map((x) => (
          <button key={x.id} type="button" role="tab" className="chip" aria-selected={x.id === section} onClick={() => setSection(x.id)}>
            {x.name}
          </button>
        ))}
      </div>
      <article className="card" style={{ marginTop: 12 }}>
        <p className="eyebrow">{d.description}</p>
        <p className="reading-text">[{d.name} из Охридског пролога за овај дан. Текст се објављује уз дозволу носиоца права.]</p>
      </article>
    </>
  );
}
