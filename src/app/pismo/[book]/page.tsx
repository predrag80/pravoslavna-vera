import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { findBook, allBooks } from '@/lib/bible';

export const dynamicParams = false;
export function generateStaticParams() {
  return allBooks.map((b) => ({ book: b.id }));
}

type Props = { params: Promise<{ book: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = findBook((await params).book);
  return { title: b?.name ?? 'Књига' };
}

export default async function BookPage({ params }: Props) {
  const b = findBook((await params).book);
  if (!b) notFound();
  const back = b.testament === 'old' ? { href: '/pismo/stari-zavet/', text: 'Стари завет' } : { href: '/pismo/novi-zavet/', text: 'Нови завет' };
  return (
    <>
      <PageHeader title={b.name} subtitle={`${b.chapters} ${b.chapters === 1 ? 'глава' : 'глава'}`} back={back} />
      <div className="container">
        <div className="grid grid-6" style={{ marginTop: 12 }}>
          {Array.from({ length: b.chapters }, (_, i) => (
            <Link key={i} href={`/pismo/${b.id}/${i + 1}/`} className="chip" style={{ justifyContent: 'center', minHeight: 44, borderRadius: 10 }}>
              {i + 1}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
