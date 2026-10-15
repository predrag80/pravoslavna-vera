'use client';

import { useToday } from '@/lib/hooks';
import { dayInfo } from '@/lib/day-info';

/** Troparion and kontakion of the day: for the feast or saint of the day (texts to be added later). */
export default function TroparionOfDay() {
  const today = useToday();
  if (!today) return null;
  const d = dayInfo(today);
  const subject = d.feasts.find((p) => p.kind !== 'fast')?.name ?? d.saints[0] ?? 'светитељ дана';
  return (
    <section className="card" style={{ marginTop: 14 }} aria-label="Тропар и кондак дана">
      <p className="eyebrow" style={{ margin: 0 }}>Тропар и кондак дана</p>
      <h2 style={{ fontSize: 24, marginTop: 4 }}>{subject}</h2>
      <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>[Тропар и кондак за овај дан из провереног извора.]</p>
    </section>
  );
}
