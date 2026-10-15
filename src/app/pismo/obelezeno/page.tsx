import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Highlights from '@/components/Highlights';
import { allBooks } from '@/lib/bible';

export const metadata: Metadata = { title: 'Обележени стихови' };

export default function HighlightsPage() {
  const books = allBooks.map((b) => ({ id: b.id, name: b.name, short: b.short }));
  return (
    <>
      <PageHeader eyebrow="Свето писмо" title="Обележено" subtitle="Стихови које сте обележили, чувају се на овом уређају" />
      <div className="container" style={{ paddingBottom: 24 }}>
        <Highlights books={books} />
      </div>
    </>
  );
}
