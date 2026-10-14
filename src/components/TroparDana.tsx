'use client';

import { useDanas } from '@/lib/kuke';
import { opisDana } from '@/lib/opis-dana';

/** Тропар и кондак дана: за празник или светитеља дана (текстови се уносе касније). */
export default function TroparDana() {
  const dan = useDanas();
  if (!dan) return null;
  const d = opisDana(dan);
  const ko = d.praznici.find((p) => p.vrsta !== 'post')?.naziv ?? d.svetitelji[0] ?? 'светитељ дана';
  return (
    <section className="kartica" style={{ marginTop: 14 }} aria-label="Тропар и кондак дана">
      <p className="natpis" style={{ margin: 0 }}>Тропар и кондак дана</p>
      <h2 style={{ fontSize: 24, marginTop: 4 }}>{ko}</h2>
      <p className="prigusen" style={{ margin: '6px 0 0', fontSize: 14 }}>[Тропар и кондак за овај дан из провереног извора.]</p>
    </section>
  );
}
