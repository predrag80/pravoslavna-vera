'use client';

import Link from 'next/link';
import { usePlanProgress } from '@/lib/hooks';
import { PLANS } from '@/lib/reading-plans';

/** Card on the Today screen: the next part of each reading plan the user has started. */
export default function ActivePlan() {
  const [progress] = usePlanProgress();
  const active = PLANS.filter((p) => progress[p.id]).map((p) => {
    const read = new Set(progress[p.id]!.read);
    const i = p.days.findIndex((_, n) => !read.has(n));
    return { p, i };
  }).filter((x) => x.i !== -1);
  if (!active.length) return null;
  return (
    <section aria-label="Планови читања" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {active.map(({ p, i }) => (
        <Link key={p.id} href={`/planovi/${p.id}/`} className="card" style={{ textDecoration: 'none', color: 'var(--vault)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>
            <span className="eyebrow" style={{ display: 'block' }}>{p.name} · дан {i + 1} од {p.days.length}</span>
            <b>{p.days[i]!.map((d) => d.label).join(', ')}</b>
          </span>
          <span aria-hidden="true" style={{ color: 'var(--gold-dark)' }}>›</span>
        </Link>
      ))}
    </section>
  );
}
