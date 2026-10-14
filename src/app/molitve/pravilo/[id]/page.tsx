import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CitacMolitve from '@/components/CitacMolitve';
import { molitvePravila, PRAVILA, type IdPravila } from '@/lib/sadrzaj';

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(PRAVILA).map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: PRAVILA[id as IdPravila]?.naziv ?? 'Молитвено правило' };
}

export default async function Pravilo({ params }: Props) {
  const { id } = await params;
  if (!(id in PRAVILA)) notFound();
  const stavke = molitvePravila(id as IdPravila).map((m) => ({ slug: m.slug, naslov: m.naslov, html: m.html }));
  return <CitacMolitve stavke={stavke} naslov={PRAVILA[id as IdPravila].naziv} nazad={{ href: '/molitve/', tekst: 'Молитвеник' }} />;
}
