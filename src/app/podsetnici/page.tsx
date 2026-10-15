import type { Metadata } from 'next';
import Reminders from '@/components/Reminders';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Подсетници' };

export default function RemindersPage() {
  return (
    <>
      <PageHeader title="Подсетници" subtitle="Слава, празници и почетак постова у календару вашег телефона" />
      <div className="container">
        <Reminders />
      </div>
    </>
  );
}
