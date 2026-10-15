import type { Metadata } from 'next';
import Psalter from '@/components/Psalter';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Псалтир' };

export default function PsalterPage() {
  return (
    <>
      <PageHeader title="Псалтир" subtitle="150 псалама у 20 катизми, молитвеник Цркве" back={{ href: '/pismo/', text: 'Свето писмо' }} />
      <div className="container">
        <Psalter />
      </div>
    </>
  );
}
