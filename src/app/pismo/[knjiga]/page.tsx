import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Zaglavlje from '@/components/Zaglavlje';
import { knjiga, sveKnjige } from '@/lib/biblija';

export const dynamicParams = false;
export function generateStaticParams() {
  return sveKnjige.map((k) => ({ knjiga: k.id }));
}

type Props = { params: Promise<{ knjiga: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const k = knjiga((await params).knjiga);
  return { title: k?.naziv ?? 'Књига' };
}

export default async function Knjiga({ params }: Props) {
  const k = knjiga((await params).knjiga);
  if (!k) notFound();
  const nazad = k.zavet === 'stari' ? { href: '/pismo/stari-zavet/', tekst: 'Стари завет' } : { href: '/pismo/novi-zavet/', tekst: 'Нови завет' };
  return (
    <>
      <Zaglavlje naslov={k.naziv} podnaslov={`${k.glava} ${k.glava === 1 ? 'глава' : 'глава'}`} nazad={nazad} />
      <div className="omot">
        <div className="mreza mreza-6" style={{ marginTop: 12 }}>
          {Array.from({ length: k.glava }, (_, i) => (
            <Link key={i} href={`/pismo/${k.id}/${i + 1}/`} className="cip" style={{ justifyContent: 'center', minHeight: 44, borderRadius: 10 }}>
              {i + 1}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
