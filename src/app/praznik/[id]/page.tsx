import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SledeciDatum from '@/components/SledeciDatum';
import SlikaPraznika from '@/components/SlikaPraznika';
import Zaglavlje from '@/components/Zaglavlje';
import praznici from '@/data/praznici.json';
import { sadrzajPraznika } from '@/lib/sadrzaj';
import { slikaPraznika } from '@/lib/slike';

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(sadrzajPraznika()).map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

function nadji(id: string) {
  return [...praznici.nepokretni, ...praznici.pokretni].find((p) => p.id === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = nadji((await params).id);
  return { title: p?.naziv ?? 'Празник' };
}

export default async function Praznik({ params }: Props) {
  const { id } = await params;
  const p = nadji(id);
  const tekst = sadrzajPraznika()[id];
  if (!p || !tekst) notFound();
  return (
    <>
      <Zaglavlje naslov={p.naziv} podnaslov={tekst.kratko} />
      <article className="omot" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SlikaPraznika slika={slikaPraznika(id)} naziv={p.naziv} />
        <SledeciDatum id={id} />
        <div className="tekst-citanja" dangerouslySetInnerHTML={{ __html: tekst.html }} />
        <Link className="dugme dugme-obrub" href="/kalendar/">Календар</Link>
      </article>
    </>
  );
}
