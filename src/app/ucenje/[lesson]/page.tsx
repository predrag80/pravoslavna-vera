import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Quiz from '@/components/Quiz';
import PageHeader from '@/components/PageHeader';
import { lessons } from '@/lib/content';

export const dynamicParams = false;
export function generateStaticParams() {
  return lessons().map((l) => ({ lesson: l.slug }));
}

type Props = { params: Promise<{ lesson: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  return { title: lessons().find((x) => x.slug === p.lesson)?.title ?? 'Лекција' };
}

export default async function LessonPage({ params }: Props) {
  const { lesson } = await params;
  const all = lessons();
  const i = all.findIndex((x) => x.slug === lesson);
  const l = all[i];
  if (!l) notFound();
  const next = all[i + 1];
  return (
    <>
      <PageHeader eyebrow={`Степеник ${l.order} · ${l.minutes} мин`} title={l.title} subtitle={l.subtitle} back={{ href: '/ucenje/', text: 'Лествица' }} />
      <article className="container reading-text" dangerouslySetInnerHTML={{ __html: l.html }} />
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px auto' }}>
        {next && <Link className="button" href={`/ucenje/${next.slug}/`}>Следећи степеник: {next.title}</Link>}
        {l.questions.length > 0 && <Quiz questions={l.questions} />}
      </div>
    </>
  );
}
