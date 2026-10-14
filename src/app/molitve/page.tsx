import type { Metadata } from 'next';
import Zaglavlje from '@/components/Zaglavlje';
import { molitve } from '@/lib/sadrzaj';

export const metadata: Metadata = { title: 'Молитве' };

export default function Molitve() {
  return (
    <>
      <Zaglavlje naslov="Молитве" podnaslov="Свакодневне, јутарње и вечерње молитве" nazad={{ href: '/', tekst: 'Данас' }} />
      <div className="omot" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {molitve().map((m) => (
          <details key={m.slug} className="kartica">
            <summary style={{ fontFamily: 'var(--font-naslov)', fontSize: 22, fontWeight: 600, color: 'var(--svod)', cursor: 'pointer', minHeight: 32 }}>{m.naslov}</summary>
            <div className="tekst-citanja" dangerouslySetInnerHTML={{ __html: m.html }} />
          </details>
        ))}
      </div>
    </>
  );
}
