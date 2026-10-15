import type { Metadata } from 'next';
import BookList from '@/components/BookList';
import PageHeader from '@/components/PageHeader';
import { oldTestament, notInTranslation } from '@/lib/bible';

export const metadata: Metadata = { title: 'Стари завет' };

export default function OldTestamentPage() {
  return (
    <>
      <PageHeader title="Стари завет" subtitle="39 књига у преводу Ђуре Даничића. Савез Бога са изабраним народом и припрема за долазак Христов." back={{ href: '/pismo/', text: 'Свето писмо' }} />
      <div className="container">
        <BookList groups={oldTestament} />
        <section style={{ paddingTop: 18 }} aria-labelledby="van">
          <h2 id="van" style={{ fontSize: 25 }}>Остале књиге</h2>
          <p className="muted" style={{ fontSize: 13 }}>Књиге које Православна Црква чита, а Даничић их није превео. Потребан је други извор.</p>
          <div className="grid grid-3">
            {notInTranslation.map((b) => (
              <div key={b} style={{ minHeight: 60, padding: '8px 10px', border: '1.5px dashed var(--border-2)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
                {b}
                <br />
                <small style={{ fontWeight: 400 }}>извор у припреми</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
