import type { Metadata } from 'next';
import Link from 'next/link';
import TroparDana from '@/components/TroparDana';
import Zaglavlje from '@/components/Zaglavlje';
import { molitve, molitvePravila, PRAVILA, type GrupaMolitve, type IdPravila } from '@/lib/sadrzaj';
import s from './molitve.module.css';

export const metadata: Metadata = { title: 'Молитвеник' };

const GRUPE: { id: GrupaMolitve; naziv: string }[] = [
  { id: 'svakodnevne', naziv: 'Свакодневне молитве' },
  { id: 'akatisti', naziv: 'Акатисти' },
  { id: 'kanoni', naziv: 'Канони' },
  { id: 'ostale', naziv: 'Остале молитве' },
];

export default function Molitvenik() {
  const sve = molitve();
  return (
    <>
      <Zaglavlje naslov="Молитвеник" podnaslov="Молитвена правила, свакодневне молитве, акатисти и канони" />
      <div className="omot">
        <div className={s.pravila}>
          {(Object.keys(PRAVILA) as IdPravila[]).map((id) => (
            <Link key={id} href={`/molitve/pravilo/${id}/`} className={id === 'vecernje' ? `${s.pravilo} ${s.vece}` : s.pravilo}>
              <b>{PRAVILA[id].naziv}</b>
              <span>{PRAVILA[id].opis} · {molitvePravila(id).length} молитава</span>
              <small>Корак по корак ›</small>
            </Link>
          ))}
        </div>

        <TroparDana />

        {GRUPE.map((g) => {
          const lista = sve.filter((m) => m.grupa === g.id);
          if (!lista.length) return null;
          return (
            <section key={g.id} className={s.grupa} aria-labelledby={`g-${g.id}`}>
              <h2 id={`g-${g.id}`}>{g.naziv}</h2>
              <ul>
                {lista.map((m) => (
                  <li key={m.slug}>
                    <Link href={`/molitve/${m.slug}/`}>{m.naslov}<span aria-hidden="true">›</span></Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
