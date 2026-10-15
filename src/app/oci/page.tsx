import type { Metadata } from 'next';
import Link from 'next/link';
import FathersTree from '@/components/FathersTree';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Свети оци' };

export default function FathersPage() {
  return (
    <>
      <PageHeader title="Свети оци" subtitle="Дрво Предања, од апостола до наших дана" />
      <div className="container">
        <Link href="/prolog/" className="button" style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
          Охридски пролог за данас <span aria-hidden="true">›</span>
        </Link>
        <FathersTree />
      </div>
    </>
  );
}
