import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { lessons } from '@/lib/content';
import s from './learning.module.css';

export const metadata: Metadata = { title: 'Учење' };

export default function LearningPage() {
  const all = lessons();
  return (
    <>
      <PageHeader eyebrow="Учење" title="Лествица" subtitle="Тридесет степеника кроз основе вере, по пет минута" />
      <div className="container">
        <Link href="/hram/" className="button" style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
          Почни овде: уђи у храм <span aria-hidden="true">›</span>
        </Link>
        {/* The ladder climbs upward: the first step is at the bottom. */}
        <ol className={s.ladder} reversed>
          {[...all].reverse().map((l) => (
            <li key={l.slug}>
              <span className={s.node} aria-hidden="true">{l.order}</span>
              <Link href={`/ucenje/${l.slug}/`} className={s.step}>
                <b>{l.order}. {l.title}</b>
                <small>{l.subtitle} · {l.minutes} мин</small>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
