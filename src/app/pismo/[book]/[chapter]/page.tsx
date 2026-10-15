import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import Verses from '@/components/Verses';
import { findBook, allBooks, chapterText } from '@/lib/bible';
import { abbreviation } from '@/lib/readings';
import s from './chapter.module.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return allBooks.flatMap((b) => Array.from({ length: b.chapters }, (_, i) => ({ book: b.id, chapter: String(i + 1) })));
}

type Props = { params: Promise<{ book: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const b = findBook(p.book);
  return { title: b ? `${b.name}, глава ${p.chapter}` : 'Глава' };
}

export default async function ChapterPage({ params }: Props) {
  const p = await params;
  const b = findBook(p.book);
  const number = Number(p.chapter);
  if (!b || !Number.isInteger(number) || number < 1 || number > b.chapters) notFound();
  const verses = chapterText(b.id, number);

  return (
    <>
      <PageHeader eyebrow={b.name} title={b.id === 'psalmi' ? `Псалам ${number}` : `Глава ${number}`} back={{ href: `/pismo/${b.id}/`, text: b.short }} />
      <article className={`container ${s.reading}`}>
        {verses ? (
          <Verses
            verses={verses.map((text, i) => ({ book: b.id, chapter: number, verse: i + 1, text }))}
            short={{ [b.id]: abbreviation(b.id, b.short) }}
          />
        ) : (
          <p className="card muted">[Текст Светог писма биће додат из издања које користи Српска православна црква, када се добије дозвола издавача.]</p>
        )}
        <nav className={s.nav} aria-label="Главе">
          {number > 1 ? <Link className="button button-outline" href={`/pismo/${b.id}/${number - 1}/`}>‹ Глава {number - 1}</Link> : <span />}
          {number < b.chapters && <Link className="button" href={`/pismo/${b.id}/${number + 1}/`}>Глава {number + 1} ›</Link>}
        </nav>
      </article>
    </>
  );
}
