'use client';

import { useState } from 'react';
import { useDanas } from '@/lib/kuke';
import { dodajDane, poStarom } from '@/lib/kalendar';
import { MESECI } from '@/lib/datumi';
import svetitelji from '@/data/svetitelji.json';
import s from './Prolog.module.css';

const DELOVI = [
  { id: 'zitije', naziv: 'Житије', opis: 'Живот светитеља дана' },
  { id: 'pesma', naziv: 'Песма', opis: 'Песма у част светитеља' },
  { id: 'rasudjivanje', naziv: 'Расуђивање', opis: 'Поука из живота светих' },
  { id: 'sozercanje', naziv: 'Созерцање', opis: 'Тема за размишљање током дана' },
  { id: 'beseda', naziv: 'Беседа', opis: 'Тумачење одломка из Светог писма' },
];
const dani = (svetitelji as { dani: Record<string, { svetitelji: string[] }> }).dani;

export default function Prolog() {
  const danas = useDanas();
  const [pomeraj, setPomeraj] = useState(0);
  const [deo, setDeo] = useState('zitije');
  if (!danas) return null;
  const dan = dodajDane(danas, pomeraj);

  const st = poStarom(dan);
  const sveti = dani[`${String(st.mesec).padStart(2, '0')}-${String(st.dan).padStart(2, '0')}`]?.svetitelji ?? [];
  const d = DELOVI.find((x) => x.id === deo)!;

  return (
    <>
      <div className={s.dan}>
        <button type="button" aria-label="Претходни дан" onClick={() => setPomeraj(pomeraj - 1)}>‹</button>
        <div>
          <b>{dan.getUTCDate()}. {MESECI[dan.getUTCMonth()]}</b>
          <span className="prigusen">{st.dan}. {MESECI[st.mesec - 1]} по старом</span>
        </div>
        <button type="button" aria-label="Следећи дан" onClick={() => setPomeraj(pomeraj + 1)}>›</button>
      </div>
      <h2 className={s.svetitelj}>{sveti[0] ?? '[Светитељ дана]'}</h2>
      {sveti.length > 1 && <p className={`prigusen ${s.ostali}`}>{sveti.slice(1).join(' · ')}</p>}

      <div className="red-cipova" role="tablist" aria-label="Делови Пролога" style={{ marginTop: 14 }}>
        {DELOVI.map((x) => (
          <button key={x.id} type="button" role="tab" className="cip" aria-selected={x.id === deo} onClick={() => setDeo(x.id)}>
            {x.naziv}
          </button>
        ))}
      </div>
      <article className="kartica" style={{ marginTop: 12 }}>
        <p className="natpis">{d.opis}</p>
        <p className="tekst-citanja">[{d.naziv} из Охридског пролога за овај дан. Текст се објављује уз дозволу носиоца права.]</p>
      </article>
    </>
  );
}
