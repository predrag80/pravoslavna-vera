import type { Metadata } from 'next';
import Search from '@/components/Search';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Претрага' };

export default function SearchPage() {
  return (
    <>
      <PageHeader title="Претрага" subtitle="Празници, светитељи, Свето писмо, храмови" back={{ href: '/', text: 'Данас' }} />
      <div className="container">
        <Search />
      </div>
    </>
  );
}
