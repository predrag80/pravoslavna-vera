'use client';

import Link from 'next/link';
import { usePlanProgress } from '@/lib/hooks';
import { PLANS } from '@/lib/reading-plans';
import s from './ReadingPlans.module.css';

export default function PlanList() {
  const [progress] = usePlanProgress();
  return (
    <ul className={s.list}>
      {PLANS.map((p) => {
        const n = progress[p.id];
        const read = n?.read.length ?? 0;
        return (
          <li key={p.id}>
            <Link href={`/planovi/${p.id}/`} className={n ? `${s.plan} ${s.active}` : s.plan}>
              <b>{p.name}</b>
              <span>{p.description}</span>
              {n ? (
                <span className={s.progress}>
                  <span className={s.bar} aria-hidden="true"><span style={{ width: `${(read / p.days.length) * 100}%` }} /></span>
                  Прочитано {read} од {p.days.length} дана
                </span>
              ) : (
                <small>{p.days.length} дана ›</small>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
