'use client';

import Link from 'next/link';
import { usePlanovi } from '@/lib/kuke';
import { PLANOVI } from '@/lib/planovi';
import s from './Planovi.module.css';

export default function ListaPlanova() {
  const [napredak] = usePlanovi();
  return (
    <ul className={s.lista}>
      {PLANOVI.map((p) => {
        const n = napredak[p.id];
        const procitano = n?.procitano.length ?? 0;
        return (
          <li key={p.id}>
            <Link href={`/planovi/${p.id}/`} className={n ? `${s.plan} ${s.aktivan}` : s.plan}>
              <b>{p.naziv}</b>
              <span>{p.opis}</span>
              {n ? (
                <span className={s.napredak}>
                  <span className={s.traka} aria-hidden="true"><span style={{ width: `${(procitano / p.dani.length) * 100}%` }} /></span>
                  Прочитано {procitano} од {p.dani.length} дана
                </span>
              ) : (
                <small>{p.dani.length} дана ›</small>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
