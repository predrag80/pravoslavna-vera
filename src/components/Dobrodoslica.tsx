'use client';

import { useRouter } from 'next/navigation';
import { usePut } from '@/lib/kuke';
import { sacuvajPut, type Put } from '@/lib/put';
import DugmeNazad from './DugmeNazad';
import IzborPisma from './IzborPisma';
import TamnaTema from './TamnaTema';
import s from './Dobrodoslica.module.css';

const PUTEVI: { id: Put; broj: string; naslov: string; opis: string }[] = [
  { id: 'pocetnik', broj: 'I', naslov: 'Тек упознајем веру', opis: 'Кренимо од почетка: храм, молитва, основни појмови.' },
  { id: 'ucenje', broj: 'II', naslov: 'Желим да научим више', opis: 'Лекције, Свети оци и читање Светог писма.' },
  { id: 'zivot', broj: 'III', naslov: 'Живим црквеним животом', opis: 'Празник, пост, читања и молитве за сваки дан.' },
];

// Звезде на своду: [x %, y px, величина].
const ZVEZDE = [[7, 40, 3], [18, 120, 2], [85, 64, 3], [91, 150, 2], [77, 210, 2], [10, 230, 2], [25, 300, 2], [90, 330, 3], [6, 420, 2], [94, 470, 2], [15, 560, 2], [87, 600, 2], [46, 26, 2], [64, 110, 2]];

export default function Dobrodoslica() {
  const router = useRouter();
  const izabran = usePut();

  function izaberi(put: Put) {
    sacuvajPut(put);
    router.replace('/');
  }

  return (
    <div className={s.ekran}>
      <TamnaTema />
      {ZVEZDE.map(([x, y, v], i) => (
        <span key={i} aria-hidden="true" className={s.zvezda} style={{ left: `${x}%`, top: y, width: v, height: v }} />
      ))}
      {izabran && (
        <div className={s.gore}>
          <DugmeNazad tekst="Данас" className={s.nazad} />
        </div>
      )}
      <div className={s.sadrzaj}>
        <svg width="96" height="122" viewBox="0 0 96 122" fill="none" stroke="#c9a24b" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M8 120V48a40 40 0 0 1 80 0v72" />
          <path d="M18 120V50a30 30 0 0 1 60 0v70" />
          <path d="M48 34v62M43 41h10M37 52h22M43 84l10 4" />
          <path d="M2 120h92" />
        </svg>
        <h1 className={s.naslov}>Добро дошли</h1>
        <p className={s.podnaslov}>Упознавање, учење и живот у православној вери на једном месту.</p>

        <div className={s.pismo}>
          <IzborPisma siroko />
        </div>

        <h2 className={s.pitanje}>Где се налазите на путу?</h2>
        <div className={s.putevi}>
          {PUTEVI.map((p) => (
            <button key={p.id} type="button" className={s.put} aria-pressed={izabran === p.id} onClick={() => izaberi(p.id)}>
              <span className={s.broj} aria-hidden="true">{p.broj}</span>
              <span className={s.tekst}>
                <b>{p.naslov}</b>
                <small>{p.opis}</small>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a24b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>

        <p className={s.napomena}>Избор можете променити у сваком тренутку.</p>
      </div>
    </div>
  );
}
