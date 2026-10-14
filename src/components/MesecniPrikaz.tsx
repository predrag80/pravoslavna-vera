'use client';

import { dodajDane, isti, STEPENI, utc } from '@/lib/kalendar';
import { MESECI } from '@/lib/datumi';
import { opisDana } from '@/lib/opis-dana';
import type { PodaciPraznika } from './ListDana';
import s from './MesecniPrikaz.module.css';

const DANI = ['Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб', 'Нед'];

interface Props {
  godina: number;
  mesec: number; // 1–12
  danas: Date;
  izabran: Date | null;
  podaci: PodaciPraznika;
  onMesec: (pomak: number) => void;
  onIzaberi: (d: Date) => void;
}

export default function MesecniPrikaz({ godina, mesec, danas, izabran, podaci, onMesec, onIzaberi }: Props) {
  const prvi = utc(godina, mesec, 1);
  const brojDana = new Date(Date.UTC(godina, mesec, 0)).getUTCDate();
  const pomeraj = (prvi.getUTCDay() + 6) % 7; // недеља почиње понедељком
  const dani = Array.from({ length: brojDana }, (_, i) => dodajDane(prvi, i));

  return (
    <section aria-label={`${MESECI[mesec - 1]} ${godina}.`}>
      <div className={s.zaglavlje}>
        <button type="button" className={s.strelica} aria-label="Претходни месец" onClick={() => onMesec(-1)}>‹</button>
        <h2>{MESECI[mesec - 1]} {godina}.</h2>
        <button type="button" className={s.strelica} aria-label="Следећи месец" onClick={() => onMesec(1)}>›</button>
      </div>
      <div className={s.mreza} role="grid">
        {DANI.map((d) => <span key={d} className={s.danUNedelji} role="columnheader">{d}</span>)}
        {Array.from({ length: pomeraj }, (_, i) => <span key={`p${i}`} aria-hidden="true" />)}
        {dani.map((d) => {
          const o = opisDana(d);
          const znacajan = o.praznici.some((p) => podaci.sadrzaj[p.id]);
          const naziv = o.praznici.find((p) => p.vrsta !== 'post')?.naziv ?? o.svetitelji[0];
          const klase = [s.dan, o.crveno && s.crveno, isti(d, danas) && s.danas, izabran && isti(d, izabran) && s.izabran].filter(Boolean).join(' ');
          return (
            <button
              key={d.getUTCDate()}
              type="button"
              role="gridcell"
              className={klase}
              aria-label={`${d.getUTCDate()}. ${MESECI[mesec - 1]}${naziv ? `, ${naziv}` : ''}${o.post.posno ? `, пост: ${STEPENI[o.post.stepen].naziv.toLowerCase()}` : ''}`}
              onClick={() => onIzaberi(d)}
            >
              {znacajan && <span className={s.znacajan} aria-hidden="true" />}
              <span className={s.broj}>{d.getUTCDate()}</span>
              <span className={s.stari} aria-hidden="true">{o.stari.split('.')[0]}</span>
              {o.post.posno && <span className={`${s.post} ${s[o.post.stepen.replace('-', '')]}`} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <ul className={s.legenda} aria-hidden="true">
        <li><i className={s.lZnacajan} />Велики празник</li>
        <li><i className={s.lCrveno} />Црвено слово</li>
        <li><i className={`${s.lPost} ${s.voda}`} />На води</li>
        <li><i className={`${s.lPost} ${s.ulje}`} />На уљу</li>
        <li><i className={`${s.lPost} ${s.riba}`} />Риба</li>
        <li><small>мали број: стари календар</small></li>
      </ul>
    </section>
  );
}
