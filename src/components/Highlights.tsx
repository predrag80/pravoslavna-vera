'use client';

import Link from 'next/link';
import { useHighlights } from '@/lib/hooks';
import s from './Highlights.module.css';

interface B { id: string; name: string; short: string }

/** List of highlighted verses, in the order of the books in the Bible. */
export default function Highlights({ books }: { books: B[] }) {
  const [highlights, setHighlights] = useHighlights();
  const order = new Map(books.map((b, i) => [b.id, i]));
  const name = new Map(books.map((b) => [b.id, b.name]));
  const items = Object.entries(highlights)
    .map(([key, h]) => {
      const [book = '', c = '0', v = '0'] = key.split(':');
      return { key, book, chapter: Number(c), verse: Number(v), ...h };
    })
    .sort((a, b) => (order.get(a.book) ?? 999) - (order.get(b.book) ?? 999) || a.chapter - b.chapter || a.verse - b.verse);

  if (!items.length) {
    return (
      <p className="card muted">
        Још нема обележених стихова. У било којој глави или у читањима дана додирните стих, па изаберите боју.
      </p>
    );
  }
  return (
    <ul className={s.list}>
      {items.map((x) => (
        <li key={x.key} className={s[x.color]}>
          <Link href={`/pismo/${x.book}/${x.chapter}/#s${x.verse}`}>
            <span className="eyebrow">{name.get(x.book) ?? x.book} {x.chapter}:{x.verse}</span>
            <span className={s.text}>{x.text}</span>
          </Link>
          <button type="button" aria-label={`Уклони обележје ${x.chapter}:${x.verse}`} onClick={() => setHighlights({ [x.key]: null })}>×</button>
        </li>
      ))}
    </ul>
  );
}
