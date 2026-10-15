'use client';

import Link from 'next/link';
import { useState } from 'react';
import { daysBetween } from '@/lib/calendar';
import { MONTHS, WEEKDAYS, inDays } from '@/lib/dates';
import { useToday, useSlava } from '@/lib/hooks';
import { nextSlava, findSlava, SLAVAS } from '@/lib/slava';
import { downloadIcs } from '@/lib/ics';
import s from './SlavaPicker.module.css';

/** What is prepared for the slava; general folk-church customs, the text should be reviewed by a priest. */
const PREPARATION = [
  { name: 'Славски колач', description: 'Месе се у кући и носи у храм или се свештеник позива у дом да га пререже и освешта.' },
  { name: 'Кољиво (жито)', description: 'Кувана пшеница у спомен на преминуле претке; освећује се заједно са колачем.' },
  { name: 'Славска свећа', description: 'Пали се на дан славе и гори током славља, као знак молитве светитељу.' },
  { name: 'Вино и тамјан', description: 'Вином се прелива колач, а кућа се кади тамјаном.' },
  { name: 'Водица', description: 'Пред славу свештеник освећује водицу у дому и благосиља укућане.' },
];

export default function SlavaPicker() {
  const today = useToday();
  const [id, setSlava] = useSlava();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const selected = findSlava(id);

  if (!today) return null;

  if (!selected || editing) {
    const q = query.trim().toLocaleLowerCase('sr');
    const list = SLAVAS.filter((x) => !q || `${x.name} ${x.saint}`.toLocaleLowerCase('sr').includes(q))
      .map((x) => ({ x, date: nextSlava(x, today) }))
      .sort((a, b) => a.x.name.localeCompare(b.x.name, 'sr'));
    return (
      <section aria-label="Избор славе">
        <label className={`card ${s.search}`}>
          <span className="sr-only">Тражи славу</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Нпр. Никољдан, Свети Јован, Ђурђевдан" />
        </label>
        <ul className={s.list}>
          {list.map(({ x, date }) => (
            <li key={x.id}>
              <button type="button" aria-pressed={x.id === id} onClick={() => { setSlava(x.id); setEditing(false); setQuery(''); }}>
                <span>
                  <b>{x.name}</b>
                  <small>{x.saint}</small>
                </span>
                <span className={s.date}>{date.getUTCDate()}. {MONTHS[date.getUTCMonth()]}</span>
              </button>
            </li>
          ))}
          {!list.length && <li className="muted" style={{ padding: 16 }}>Нема славе са тим именом. Јавите нам да је додамо.</li>}
        </ul>
        {selected && <button type="button" className="button button-outline" style={{ width: '100%' }} onClick={() => setEditing(false)}>Откажи</button>}
      </section>
    );
  }

  const date = nextSlava(selected, today);
  const days = daysBetween(date, today);
  return (
    <>
      <section className={s.card} aria-live="polite">
        <span className="eyebrow">Ваша слава</span>
        <h2>{selected.name}</h2>
        <p className={s.saint}>{selected.saint}</p>
        <div className={s.countdown}>
          <b>{days === 0 ? 'Данас!' : inDays(days)}</b>
          <span>{WEEKDAYS[date.getUTCDay()]}, {date.getUTCDate()}. {MONTHS[date.getUTCMonth()]} {date.getUTCFullYear()}.{selected.fromPascha !== undefined ? ' · покретна слава' : ''}</span>
        </div>
        <div className={s.buttons}>
          <button
            type="button"
            className="button"
            onClick={() => {
              const year = date.getUTCFullYear();
              const dates = [0, 1, 2].map((n) => nextSlava(selected, new Date(Date.UTC(year + n, 0, 1))));
              downloadIcs(`slava-${selected.id}.ics`, dates.map((d) => ({
                uid: `slava-${selected.id}-${d.toISOString().slice(0, 10)}`,
                title: `Крсна слава: ${selected.name}`,
                description: selected.saint,
                date: d,
                reminder: 'day-before',
              })));
            }}
          >
            Додај у календар телефона
          </button>
          <button type="button" className="button button-outline" onClick={() => setEditing(true)}>Промени славу</button>
        </div>
      </section>

      <section className="card" style={{ marginTop: 12 }} aria-labelledby="life">
        <h2 id="life" style={{ fontSize: 24 }}>Житије и тропар</h2>
        <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>[Житије: {selected.saint}. Тропар и кондак из провереног извора.]</p>
        {selected.feast && <Link className="button button-outline" style={{ marginTop: 10 }} href={`/praznik/${selected.feast}/`}>Више о празнику</Link>}
      </section>

      <section style={{ marginTop: 16 }} aria-labelledby="preparation">
        <h2 id="preparation" style={{ fontSize: 24, marginBottom: 8 }}>Шта се припрема</h2>
        <ul className={s.preparation}>
          {PREPARATION.map((p) => (
            <li key={p.name}>
              <label>
                <input type="checkbox" />
                <span><b>{p.name}</b><small>{p.description}</small></span>
              </label>
            </li>
          ))}
        </ul>
        <p className="muted" style={{ fontSize: 12 }}>Обичаји се разликују по крајевима; питајте свог свештеника.</p>
      </section>
    </>
  );
}
