'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { dayInfo } from '@/lib/day-info';
import type { FeastContent } from '@/lib/content';
import type { FeastImageInfo } from '@/lib/images';
import { downloadIcs } from '@/lib/ics';
import FastBadge from './FastBadge';
import FeastImage from './FeastImage';
import s from './DaySheet.module.css';

export interface FeastData { content: Record<string, FeastContent>; images: Record<string, FeastImageInfo> }

interface Props {
  date: Date;
  data: FeastData;
  onClose: () => void;
  onShift: (days: number) => void;
}

/** Day sheet: slides up from the bottom when a date is tapped. Swiping left/right changes the day. */
export default function DaySheet({ date, data, onClose, onShift }: Props) {
  const d = dayInfo(date);
  const major = d.feasts.find((p) => data.content[p.id]);
  const main = major ?? d.feasts.find((p) => p.kind !== 'fast');
  const text = major ? data.content[major.id] : undefined;
  const title = main?.name ?? d.saints[0] ?? '[Светитељ дана]';
  const others = main ? d.saints : d.saints.slice(1);

  const sheet = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onShift(-1);
      if (e.key === 'ArrowRight') onShift(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [onClose, onShift]);

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div
        ref={sheet}
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={`${d.date} ${title}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const p = start.current;
          start.current = null;
          if (!p) return;
          const dx = e.clientX - p.x;
          const dy = e.clientY - p.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) onShift(dx < 0 ? 1 : -1);
          else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
        }}
      >
        <span className={s.handle} aria-hidden="true" />
        <div className={s.header}>
          <button type="button" className={s.arrow} aria-label="Претходни дан" onClick={() => onShift(-1)}>‹</button>
          <div className={s.date}>
            <b>{d.date}</b>
            <span>{d.oldStyle}</span>
          </div>
          <button type="button" className={s.arrow} aria-label="Следећи дан" onClick={() => onShift(1)}>›</button>
        </div>

        <div className={s.body}>
          {major && <FeastImage image={data.images[major.id] ?? null} name={major.name} small />}
          <div className={s.badges}>
            <FastBadge fast={d.fast} showDescription />
            {d.redLetter && <span className={s.redLetter}>Црвено слово</span>}
          </div>
          <h2 className={d.redLetter ? s.redTitle : undefined}>{title}</h2>
          {others.length > 0 && <p className={s.others}>{others.join(' · ')}</p>}
          {text ? (
            <>
              <p className={s.summary}>{text.summary}</p>
              <div className={s.text} dangerouslySetInnerHTML={{ __html: text.html }} />
            </>
          ) : (
            main?.description && <p className={s.summary}>{main.description}</p>
          )}
          <div className={s.links}>
            {major && <Link className="button" href={`/praznik/${major.id}/`}>Више о празнику</Link>}
            <Link className="button button-outline" href="/prolog/">Пролог</Link>
            <button
              type="button"
              className="button button-outline"
              onClick={() => downloadIcs(`${date.toISOString().slice(0, 10)}.ics`, [{ uid: `dan-${date.toISOString().slice(0, 10)}`, title, description: d.oldStyle, date, reminder: 'day-before' }])}
            >
              Додај у календар
            </button>
          </div>
          <p className={s.note}>
            {d.fast.source === 'calendar' ? 'Пост према црквеном календару (crkvenikalendar.rs). ' : 'Пост је израчунат по правилима Типика; за ову годину још нема података из црквеног календара. '}
            О мери поста посаветујте се са својим духовником.
          </p>
        </div>
        <button type="button" className={s.close} onClick={onClose}>Затвори</button>
      </div>
    </div>
  );
}
