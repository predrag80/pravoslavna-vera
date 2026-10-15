import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PrayerReader from '@/components/PrayerReader';
import { prayers } from '@/lib/content';

export const dynamicParams = false;
export function generateStaticParams() {
  return prayers().map((m) => ({ slug: m.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: prayers().find((m) => m.slug === slug)?.title ?? 'Молитва' };
}

export default async function PrayerPage({ params }: Props) {
  const { slug } = await params;
  const m = prayers().find((x) => x.slug === slug);
  if (!m) notFound();
  return <PrayerReader items={[{ slug: m.slug, title: m.title, html: m.html }]} back={{ href: '/molitve/', text: 'Молитвеник' }} />;
}
