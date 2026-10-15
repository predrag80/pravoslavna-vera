import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Verses from '@/components/Verses';
import PageHeader from '@/components/PageHeader';
import FastBadge from '@/components/FastBadge';
import { findBook, passageVerses, type Verse } from '@/lib/bible';
import { readingsOfDay, readingDates, parseReference, abbreviation, ABBREVIATIONS, type Passage } from '@/lib/readings';
import { dayInfo } from '@/lib/day-info';
import { utc } from '@/lib/calendar';
import s from '../readings.module.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return readingDates().map((date) => ({ date }));
}

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return { title: `Читања, ${date.split('-').reverse().join('. ')}.` };
}

/** Part of a reading: consecutive passages from the same book, with text if the Bible has been imported. */
interface Part { label: string; href: string; verses: Verse[] | null }

function parts(ref: string): Part[] {
  const groups: Passage[][] = [];
  for (const p of parseReference(ref)) {
    const last = groups[groups.length - 1];
    if (last && last[0]!.book === p.book) last.push(p);
    else groups.push([p]);
  }
  // Label of each group from the source reference: parts separated by ';', each starting with a book name.
  const labels: string[] = [];
  for (const part of ref.split(';').map((x) => x.trim())) {
    if (Object.keys(ABBREVIATIONS).some((k) => part.startsWith(`${k} `)) || !labels.length) labels.push(part);
    else labels[labels.length - 1] += `; ${part}`;
  }
  return groups.map((g, i) => {
    const allVerses = g.map(passageVerses);
    const first = g[0]!;
    return {
      label: labels[i] ?? '',
      href: `/pismo/${first.book}/${first.from.chapter}/#s${first.from.verse}`,
      verses: allVerses.some((x) => x === null) ? null : allVerses.flatMap((x) => x!),
    };
  });
}

export default async function ReadingsDayPage({ params }: Props) {
  const { date } = await params;
  const c = readingsOfDay(date);
  if (!c) notFound();
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const info = dayInfo(utc(y, m, d));
  const all = readingDates();
  const i = all.indexOf(date);
  const prev = all[i - 1], next = all[i + 1];
  const sections = [
    { title: 'Апостол', parts: parts(c.epistle) },
    { title: 'Јеванђеље', parts: parts(c.gospel) },
  ];
  const short = Object.fromEntries(Object.values(ABBREVIATIONS).map((id) => [id, abbreviation(id, findBook(id)?.short ?? id)]));
  const feast = info.feasts[0]?.name;

  return (
    <>
      <PageHeader eyebrow="Читања на Литургији" title={info.date.replace(/ \d{4}\.$/, '')} subtitle={feast} back={{ href: '/citanja/', text: 'Читања' }} />
      <article className={`container ${s.page}`}>
        <div className={s.meta}>
          <FastBadge fast={info.fast} />
          <span className="muted">{info.oldStyle}</span>
        </div>
        {sections.map((x) => (
          <section key={x.title} className={s.reading} aria-labelledby={`n-${x.title}`}>
            <h2 id={`n-${x.title}`} className="eyebrow">{x.title}</h2>
            {x.parts.map((part) => (
              <div key={part.label} className={s.part}>
                <Link href={part.href} className={s.ref}>{part.label}</Link>
                {part.verses ? (
                  <Verses verses={part.verses} short={short} showChapters />
                ) : (
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                    [Текст Светог писма биће додат из издања које користи Српска православна црква. До тада додир на референцу отвара главу.]
                  </p>
                )}
              </div>
            ))}
          </section>
        ))}
        <p className={s.source}>
          {c.source === 'typikon' ? 'Уобичајена читања празника по Типику.' : 'Читања према црквеном календару (crkvenikalendar.rs).'}{' '}
          Додирните стих да га обележите или копирате.
        </p>
        <nav className={s.nav} aria-label="Друга читања">
          {prev ? <Link className="button button-outline" href={`/citanja/${prev}/`}>‹ {Number(prev.slice(8))}. {Number(prev.slice(5, 7))}.</Link> : <span />}
          {next && <Link className="button" href={`/citanja/${next}/`}>{Number(next.slice(8))}. {Number(next.slice(5, 7))}. ›</Link>}
        </nav>
      </article>
    </>
  );
}
