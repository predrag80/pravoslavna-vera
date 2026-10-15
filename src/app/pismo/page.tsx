import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import s from './scripture.module.css';

export const metadata: Metadata = { title: 'Свето писмо' };

export default function ScripturePage() {
  return (
    <>
      <PageHeader title="Свето писмо" subtitle="Превод Ђуре Даничића и Вука Караџића" />
      <div className="container">
        <div className={s.doors}>
          <Link href="/pismo/stari-zavet/" className={s.old}>
            <svg width="120" height="70" viewBox="0 0 120 70" fill="none" stroke="#e6c77a" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M30 68V34a30 30 0 0 1 60 0v34" /><path d="M60 10v26M54 18h12" /></svg>
            <b>Стари завет</b>
            <span>Од стварања света до пророка</span>
            <small>39 књига</small>
          </Link>
          <Link href="/pismo/novi-zavet/" className={s.new}>
            <svg width="120" height="70" viewBox="0 0 120 70" fill="none" stroke="#e6c77a" strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><circle cx="60" cy="36" r="22" /><path d="M60 22v28M53 29h14M55 44l10 3" /></svg>
            <b>Нови завет</b>
            <span>Јеванђеља, Дела, посланице, Откривење</span>
            <small>27 књига</small>
          </Link>
        </div>
        <div className={s.quick}>
          <Link href="/citanja/">Читања дана</Link>
          <Link href="/planovi/">Планови читања</Link>
          <Link href="/psaltir/">Псалтир</Link>
          <Link href="/pismo/obelezeno/">Обележено</Link>
        </div>
      </div>
    </>
  );
}
