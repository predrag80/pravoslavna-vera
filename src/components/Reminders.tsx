'use client';

import Link from 'next/link';
import { useState } from 'react';
import { addDays, upcomingFeasts, multiDayFasts } from '@/lib/calendar';
import { useToday, useSlava } from '@/lib/hooks';
import { nextSlava, findSlava } from '@/lib/slava';
import { downloadIcs, type CalendarEvent, type Reminder } from '@/lib/ics';
import s from './Reminders.module.css';

const MAJOR_FEASTS = new Set(['bozic', 'bogojavljenje', 'sretenje', 'blagovesti', 'cveti', 'vaskrs', 'spasovdan', 'duhovi', 'preobrazenje', 'velika-gospojina', 'mala-gospojina', 'krstovdan', 'vavedenje']);

type Choice = 'slava' | 'major' | 'redLetter' | 'fasts';

/** Server-less reminders: an .ics file is built and the phone sends notifications from its own calendar. */
export default function Reminders() {
  const today = useToday();
  const [slavaId] = useSlava();
  const selectedSlava = findSlava(slavaId);
  const [choice, setChoice] = useState<Record<Choice, boolean>>({ slava: true, major: true, redLetter: false, fasts: true });
  const [reminder, setReminder] = useState<Reminder>('day-before');
  const [done, setDone] = useState<number | null>(null);

  if (!today) return null;
  const until = addDays(today, 730);

  function events(): CalendarEvent[] {
    const list: CalendarEvent[] = [];
    if (choice.slava && selectedSlava) {
      for (let n = 0; n < 2; n++) {
        const d = nextSlava(selectedSlava, new Date(Date.UTC(today!.getUTCFullYear() + n, today!.getUTCMonth(), today!.getUTCDate())));
        list.push({ uid: `slava-${selectedSlava.id}-${d.toISOString().slice(0, 10)}`, title: `Крсна слава: ${selectedSlava.name}`, description: selectedSlava.saint, date: d, reminder });
      }
    }
    if (choice.major || choice.redLetter) {
      for (const p of upcomingFeasts(today!, 200)) {
        if (p.date > until) break;
        const major = MAJOR_FEASTS.has(p.id);
        if ((choice.major && major) || (choice.redLetter && (p.kind === 'red-letter' || p.kind === 'pascha'))) {
          list.push({ uid: `${p.id}-${p.date.toISOString().slice(0, 10)}`, title: p.name, description: p.description, date: p.date, reminder });
        }
      }
    }
    if (choice.fasts) {
      for (let g = today!.getUTCFullYear(); g <= until.getUTCFullYear(); g++) {
        for (const v of multiDayFasts(g)) {
          if (v.from < today! || v.from > until) continue;
          list.push({ uid: `post-${v.from.toISOString().slice(0, 10)}`, title: `Почиње ${v.name}`, description: `Траје до ${v.to.getUTCDate()}. ${v.to.getUTCMonth() + 1}.`, date: v.from, reminder });
        }
      }
    }
    const unique = new Map(list.map((d) => [d.uid, d]));
    return [...unique.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  const items: { id: Choice; name: string; description: string; unavailable?: boolean }[] = [
    { id: 'slava', name: 'Моја крсна слава', description: selectedSlava ? selectedSlava.name : 'Прво изаберите славу', unavailable: !selectedSlava },
    { id: 'major', name: 'Велики празници', description: 'Божић, Богојављење, Васкрс, Духови и остали Дванаестоднебни празници' },
    { id: 'redLetter', name: 'Сва црвена слова', description: 'Сви празници означени црвеним у календару' },
    { id: 'fasts', name: 'Почетак постова', description: 'Велики, Петровски, Госпојински и Божићни пост' },
  ];

  return (
    <>
      <fieldset className={s.group}>
        <legend>Шта да вас подсећа</legend>
        {items.map((x) => (
          <label key={x.id} className={x.unavailable ? s.unavailable : undefined}>
            <input type="checkbox" checked={choice[x.id] && !x.unavailable} disabled={x.unavailable} onChange={(e) => setChoice({ ...choice, [x.id]: e.target.checked })} />
            <span><b>{x.name}</b><small>{x.description}</small></span>
          </label>
        ))}
        {!selectedSlava && <Link href="/slava/" className={s.link}>Изаберите своју славу ›</Link>}
      </fieldset>

      <fieldset className={s.group}>
        <legend>Када</legend>
        {([['day-before', 'Дан раније у 19:00'], ['morning', 'Истог дана у 7:00'], ['none', 'Без обавештења, само у календару']] as const).map(([v, t]) => (
          <label key={v}>
            <input type="radio" name="reminder" checked={reminder === v} onChange={() => setReminder(v)} />
            <span><b>{t}</b></span>
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        className="button"
        style={{ width: '100%', marginTop: 14 }}
        onClick={() => {
          const d = events();
          downloadIcs('pravoslavlje-podsetnici.ics', d);
          setDone(d.length);
        }}
      >
        Додај у календар телефона
      </button>
      <p className="muted" style={{ fontSize: 13 }} aria-live="polite">
        {done !== null
          ? `Припремљено ${done} догађаја за наредне две године. Отворите преузети фајл и потврдите додавање у календар.`
          : 'Важи за наредне две године. Телефон шаље обавештења из свог календара, и када апликација није отворена.'}
      </p>
    </>
  );
}
