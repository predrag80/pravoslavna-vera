'use client';

import { useState } from 'react';
import data from '@/data/fathers.json';
import s from './FathersTree.module.css';

interface Father { id: string; name: string; short: string; era: string; meta: string; description: string; tags: string[]; links: { id: string; relation: string }[]; feast: string | null }
const FATHERS = data.fathers as Father[];
const ERAS = ['I–II', 'IV', 'VII', 'XIII–XIV', 'XX'];
const FILTERS = [['all', 'Сви'], ['east', 'Исток'], ['serbia', 'Србија'], ['athos', 'Света Гора']] as const;

export default function FathersTree() {
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState('zlatousti');
  const visible = FATHERS.filter((f) => filter === 'all' || f.tags.includes(filter));
  const f = FATHERS.find((x) => x.id === selected)!;

  return (
    <>
      <div className="chip-row" role="group" aria-label="Филтер" style={{ marginTop: 14 }}>
        {FILTERS.map(([id, name]) => (
          <button key={id} type="button" className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{name}</button>
        ))}
      </div>

      <ol className={s.timeline}>
        {ERAS.map((era) => {
          const inEra = visible.filter((x) => x.era === era);
          if (!inEra.length) return null;
          return (
            <li key={era}>
              <span className={s.era}>{era}</span>
              <div className={s.fathers}>
                {inEra.map((x) => (
                  <button key={x.id} type="button" className={s.father} aria-pressed={x.id === selected} onClick={() => setSelected(x.id)}>{x.short}</button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="card-dark" aria-live="polite">
        <h2>{f.name}</h2>
        <p className={s.meta}>{f.meta}</p>
        <p className={s.description}>{f.description}</p>
        <div className={s.footer}>
          {f.links.map((l) => {
            const other = FATHERS.find((x) => x.id === l.id);
            return other ? (
              <button key={l.id} type="button" className={s.link} onClick={() => { setFilter('all'); setSelected(l.id); }}>
                {l.relation}: {other.short} →
              </button>
            ) : null;
          })}
          {f.feast && <span className={s.feast}>Празник: {f.feast}</span>}
        </div>
      </section>
    </>
  );
}
