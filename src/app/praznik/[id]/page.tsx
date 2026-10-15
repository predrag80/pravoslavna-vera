import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NextDate from '@/components/NextDate';
import FeastImage from '@/components/FeastImage';
import PageHeader from '@/components/PageHeader';
import feasts from '@/data/feasts.json';
import { feastContent } from '@/lib/content';
import { feastImage } from '@/lib/images';

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(feastContent()).map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

function findFeast(id: string) {
  return [...feasts.fixed, ...feasts.movable].find((p) => p.id === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = findFeast((await params).id);
  return { title: p?.name ?? 'Празник' };
}

export default async function FeastPage({ params }: Props) {
  const { id } = await params;
  const p = findFeast(id);
  const text = feastContent()[id];
  if (!p || !text) notFound();
  return (
    <>
      <PageHeader title={p.name} subtitle={text.summary} />
      <article className="container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FeastImage image={feastImage(id)} name={p.name} />
        <NextDate id={id} />
        <div className="reading-text" dangerouslySetInnerHTML={{ __html: text.html }} />
        <Link className="button button-outline" href="/kalendar/">Календар</Link>
      </article>
    </>
  );
}
