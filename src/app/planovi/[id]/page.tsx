import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlanCitanja from '@/components/PlanCitanja';
import Zaglavlje from '@/components/Zaglavlje';
import { plan, PLANOVI } from '@/lib/planovi';

export const dynamicParams = false;
export function generateStaticParams() {
  return PLANOVI.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: plan((await params).id)?.naziv ?? 'План читања' };
}

export default async function PlanStrana({ params }: Props) {
  const p = plan((await params).id);
  if (!p) notFound();
  return (
    <>
      <Zaglavlje naslov={p.naziv} podnaslov={p.opis} nazad={{ href: '/planovi/', tekst: 'Планови читања' }} />
      <div className="omot">
        <PlanCitanja id={p.id} />
      </div>
    </>
  );
}
