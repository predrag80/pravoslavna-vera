import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PrayerReader from '@/components/PrayerReader';
import { prayersOfRule, PRAYER_RULES, type PrayerRuleId } from '@/lib/content';

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(PRAYER_RULES).map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: PRAYER_RULES[id as PrayerRuleId]?.name ?? 'Молитвено правило' };
}

export default async function PrayerRulePage({ params }: Props) {
  const { id } = await params;
  if (!(id in PRAYER_RULES)) notFound();
  const items = prayersOfRule(id as PrayerRuleId).map((m) => ({ slug: m.slug, title: m.title, html: m.html }));
  return <PrayerReader items={items} title={PRAYER_RULES[id as PrayerRuleId].name} back={{ href: '/molitve/', text: 'Молитвеник' }} />;
}
