import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProveraZnanja from '@/components/ProveraZnanja';
import Zaglavlje from '@/components/Zaglavlje';
import { lekcije } from '@/lib/sadrzaj';

export const dynamicParams = false;
export function generateStaticParams() {
  return lekcije().map((l) => ({ lekcija: l.slug }));
}

type Props = { params: Promise<{ lekcija: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  return { title: lekcije().find((x) => x.slug === p.lekcija)?.naslov ?? 'Лекција' };
}

export default async function Lekcija({ params }: Props) {
  const { lekcija } = await params;
  const sve = lekcije();
  const i = sve.findIndex((x) => x.slug === lekcija);
  const l = sve[i];
  if (!l) notFound();
  const sledeca = sve[i + 1];
  return (
    <>
      <Zaglavlje natpis={`Степеник ${l.redniBroj} · ${l.trajanje} мин`} naslov={l.naslov} podnaslov={l.podnaslov} nazad={{ href: '/ucenje/', tekst: 'Лествица' }} />
      <article className="omot tekst-citanja" dangerouslySetInnerHTML={{ __html: l.html }} />
      <div className="omot" style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px auto' }}>
        {sledeca && <Link className="dugme" href={`/ucenje/${sledeca.slug}/`}>Следећи степеник: {sledeca.naslov}</Link>}
        {l.pitanja.length > 0 && <ProveraZnanja pitanja={l.pitanja} />}
      </div>
    </>
  );
}
