import type { Metadata } from 'next';
import PlanList from '@/components/PlanList';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Планови читања' };

export default function PlansPage() {
  return (
    <>
      <PageHeader title="Планови читања" subtitle="Свето писмо део по део, својим темпом" />
      <div className="container">
        <PlanList />
      </div>
    </>
  );
}
