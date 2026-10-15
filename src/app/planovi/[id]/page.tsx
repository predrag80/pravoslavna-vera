import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReadingPlan from '@/components/ReadingPlan';
import PageHeader from '@/components/PageHeader';
import { findPlan, PLANS } from '@/lib/reading-plans';

export const dynamicParams = false;
export function generateStaticParams() {
  return PLANS.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: findPlan((await params).id)?.name ?? 'План читања' };
}

export default async function PlanPage({ params }: Props) {
  const p = findPlan((await params).id);
  if (!p) notFound();
  return (
    <>
      <PageHeader title={p.name} subtitle={p.description} back={{ href: '/planovi/', text: 'Планови читања' }} />
      <div className="container">
        <ReadingPlan id={p.id} />
      </div>
    </>
  );
}
