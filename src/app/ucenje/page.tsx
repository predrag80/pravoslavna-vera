import type { Metadata } from 'next';
import Link from 'next/link';
import Zaglavlje from '@/components/Zaglavlje';
import { lekcije } from '@/lib/sadrzaj';
import s from './ucenje.module.css';

export const metadata: Metadata = { title: 'Учење' };

export default function Ucenje() {
  const sve = lekcije();
  return (
    <>
      <Zaglavlje natpis="Учење" naslov="Лествица" podnaslov="Тридесет степеника кроз основе вере, по пет минута" />
      <div className="omot">
        <Link href="/hram/" className="dugme" style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
          Почни овде: уђи у храм <span aria-hidden="true">›</span>
        </Link>
        {/* Лествица се пење: први степеник је на дну. */}
        <ol className={s.lestvica} reversed>
          {[...sve].reverse().map((l) => (
            <li key={l.slug}>
              <span className={s.cvor} aria-hidden="true">{l.redniBroj}</span>
              <Link href={`/ucenje/${l.slug}/`} className={s.stepenik}>
                <b>{l.redniBroj}. {l.naslov}</b>
                <small>{l.podnaslov} · {l.trajanje} мин</small>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
