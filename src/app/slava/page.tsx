import type { Metadata } from 'next';
import SlavaPicker from '@/components/SlavaPicker';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Крсна слава' };

export default function SlavaPage() {
  return (
    <>
      <PageHeader title="Крсна слава" subtitle="Изаберите своју славу: подсетник, житије, тропар и обичаји" />
      <div className="container">
        <SlavaPicker />
      </div>
    </>
  );
}
