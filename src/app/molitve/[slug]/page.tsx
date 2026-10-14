import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CitacMolitve from '@/components/CitacMolitve';
import { molitve } from '@/lib/sadrzaj';

export const dynamicParams = false;
export function generateStaticParams() {
  return molitve().map((m) => ({ slug: m.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: molitve().find((m) => m.slug === slug)?.naslov ?? 'Молитва' };
}

export default async function Molitva({ params }: Props) {
  const { slug } = await params;
  const m = molitve().find((x) => x.slug === slug);
  if (!m) notFound();
  return <CitacMolitve stavke={[{ slug: m.slug, naslov: m.naslov, html: m.html }]} nazad={{ href: '/molitve/', tekst: 'Молитвеник' }} />;
}
