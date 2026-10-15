import type { Metadata } from 'next';
import ChurchGuide from '@/components/ChurchGuide';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Уђи у храм' };

export default function ChurchPage() {
  return (
    <>
      <PageHeader title="Уђи у храм" subtitle="Додирните део храма да сазнате шта значи" back={{ href: '/ucenje/', text: 'Учење · први корак' }} />
      <div className="container">
        <ChurchGuide />
      </div>
    </>
  );
}
