'use client';

import { useCallback, useState } from 'react';
import { addDays } from '@/lib/calendar';
import { useToday } from '@/lib/hooks';
import YearWheel from './YearWheel';
import DaySheet, { type FeastData } from './DaySheet';
import MonthView from './MonthView';
import s from './Calendar.module.css';

/** Calendar with two views (Wheel and Month); tapping a date opens the day sheet. */
export default function Calendar({ data }: { data: FeastData }) {
  const today = useToday();
  const [view, setView] = useState<'wheel' | 'month'>('month');
  const [open, setOpen] = useState<Date | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const shift = useCallback((n: number) => setOpen((d) => (d ? addDays(d, n) : d)), []);
  const close = useCallback(() => setOpen(null), []);

  if (!today) return <div className={s.loading} aria-busy="true" />;

  // The shown month follows the open day, otherwise the current month plus the arrow offset.
  const base = open ?? today;
  const m = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + (open ? 0 : monthOffset), 1));

  return (
    <>
      <div className={s.toggle} role="tablist" aria-label="Приказ календара">
        <button type="button" role="tab" aria-selected={view === 'month'} onClick={() => setView('month')}>Месец</button>
        <button type="button" role="tab" aria-selected={view === 'wheel'} onClick={() => setView('wheel')}>Годишњи круг</button>
      </div>

      {view === 'month' ? (
        <MonthView
          year={m.getUTCFullYear()}
          month={m.getUTCMonth() + 1}
          today={today}
          selected={open}
          data={data}
          onMonth={(n) => {
            if (open) {
              setMonthOffset((m.getUTCFullYear() - today.getUTCFullYear()) * 12 + m.getUTCMonth() - today.getUTCMonth() + n);
              setOpen(null);
            } else setMonthOffset((p) => p + n);
          }}
          onSelect={setOpen}
        />
      ) : (
        <YearWheel onOpenDay={setOpen} />
      )}

      {open && <DaySheet date={open} data={data} onClose={close} onShift={shift} />}
    </>
  );
}
