import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Zaglavlje from '@/components/Zaglavlje';
import Stihovi from '@/components/Stihovi';
import { knjiga, sveKnjige, tekstGlave } from '@/lib/biblija';
import { skracenica } from '@/lib/citanja';
import s from './glava.module.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return sveKnjige.flatMap((k) => Array.from({ length: k.glava }, (_, i) => ({ knjiga: k.id, glava: String(i + 1) })));
}

type Props = { params: Promise<{ knjiga: string; glava: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const k = knjiga(p.knjiga);
  return { title: k ? `${k.naziv}, глава ${p.glava}` : 'Глава' };
}

export default async function Glava({ params }: Props) {
  const p = await params;
  const k = knjiga(p.knjiga);
  const broj = Number(p.glava);
  if (!k || !Number.isInteger(broj) || broj < 1 || broj > k.glava) notFound();
  const stihovi = tekstGlave(k.id, broj);

  return (
    <>
      <Zaglavlje natpis={k.naziv} naslov={k.id === 'psalmi' ? `Псалам ${broj}` : `Глава ${broj}`} nazad={{ href: `/pismo/${k.id}/`, tekst: k.kratko }} />
      <article className={`omot ${s.citanje}`}>
        {stihovi ? (
          <Stihovi
            stihovi={stihovi.map((tekst, i) => ({ knjiga: k.id, glava: broj, stih: i + 1, tekst }))}
            kratko={{ [k.id]: skracenica(k.id, k.kratko) }}
          />
        ) : (
          <p className="kartica prigusen">[Текст ове главе још није увезен. Покрените `npm run uvoz:biblija` према упутству у README.md.]</p>
        )}
        <nav className={s.navigacija} aria-label="Главе">
          {broj > 1 ? <Link className="dugme dugme-obrub" href={`/pismo/${k.id}/${broj - 1}/`}>‹ Глава {broj - 1}</Link> : <span />}
          {broj < k.glava && <Link className="dugme" href={`/pismo/${k.id}/${broj + 1}/`}>Глава {broj + 1} ›</Link>}
        </nav>
      </article>
    </>
  );
}
