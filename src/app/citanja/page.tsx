import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import NextReading from '@/components/NextReading';
import { readingsOfDay, readingDates } from '@/lib/readings';
import { MONTHS } from '@/lib/dates';
import { feastsOfDay, utc } from '@/lib/calendar';
import s from './readings.module.css';

export const metadata: Metadata = { title: 'Читања на Литургији' };

export default function ReadingsPage() {
  const byMonth = new Map<number, string[]>();
  for (const d of readingDates()) {
    const m = Number(d.slice(5, 7));
    byMonth.set(m, [...(byMonth.get(m) ?? []), d]);
  }
  return (
    <>
      <PageHeader eyebrow="Свето писмо" title="Читања на Литургији" subtitle="Апостол и Јеванђеље за недеље и велике празнике" />
      <div className="container" style={{ paddingBottom: 24 }}>
        <NextReading />
        {[...byMonth].map(([m, dates]) => (
          <section key={m} aria-labelledby={`m${m}`}>
            <h2 id={`m${m}`} className={`eyebrow ${s.month}`}>{MONTHS[m - 1]} 2026.</h2>
            <ul className={s.list}>
              {dates.map((d) => {
                const c = readingsOfDay(d)!;
                const [y, mm, dd] = d.split('-').map(Number) as [number, number, number];
                const feast = feastsOfDay(utc(y, mm, dd))[0];
                return (
                  <li key={d}>
                    <Link href={`/citanja/${d}/`}>
                      <span className={s.day} style={feast?.kind === 'red-letter' || feast?.kind === 'pascha' ? { color: 'var(--red)' } : undefined}>{dd}<small>{MONTHS[mm - 1]!.slice(0, 3)}</small></span>
                      <span className={s.references}>
                        {feast && <b>{feast.name}</b>}
                        <span>{c.epistle.split(';')[0]} · {c.gospel.split(';')[0]}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <p className={s.source}>
          Недељна читања према црквеном календару (crkvenikalendar.rs), читања великих празника по Типику.
          Читања за радне дане биће додата када буду преузета из провереног извора.
        </p>
      </div>
    </>
  );
}
