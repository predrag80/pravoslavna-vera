import Link from 'next/link';
import { bookCount, type BookGroup } from '@/lib/bible';
import s from './BookList.module.css';

const COLORS: Record<string, string> = {
  zakon: '#6e5323', istorijske: '#2f4a3a', poucne: '#24365f', 'veliki-proroci': '#5b3f73', 'mali-proroci': '#5b3f73',
  jevandjelja: '#8e2a22', dela: '#24365f', saborne: '#2f4a3a', pavle: '#6e5323', otkrivenje: '#5b3f73',
};

export default function BookList({ groups }: { groups: BookGroup[] }) {
  return (
    <>
      <nav className={`chip-row ${s.jump}`} aria-label="Делови">
        {groups.map((g) => <a key={g.id} className="chip" href={`#${g.id}`}>{g.name}</a>)}
      </nav>
      {groups.map((g) => (
        <section key={g.id} id={g.id} className={s.group} aria-labelledby={`n-${g.id}`}>
          <div className={s.header}>
            <span className={s.color} style={{ background: COLORS[g.id] ?? 'var(--vault)' }} aria-hidden="true" />
            <h2 id={`n-${g.id}`}>{g.name}</h2>
            <span className="muted">{bookCount(g.books.length)}</span>
          </div>
          <p className={`muted ${s.description}`}>{g.description}</p>
          <div className="grid grid-3">
            {g.books.map((b) => (
              <Link key={b.id} href={`/pismo/${b.id}/`} className={s.book} style={{ boxShadow: `inset 0 3px 0 ${COLORS[g.id] ?? 'var(--vault)'}` }}>
                <b>{b.short}</b>
                <small>{b.chapters} {b.chapters === 1 ? 'глава' : 'глава'}</small>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
