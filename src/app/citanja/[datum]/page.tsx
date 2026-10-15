import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Stihovi from '@/components/Stihovi';
import Zaglavlje from '@/components/Zaglavlje';
import OznakaPosta from '@/components/OznakaPosta';
import { knjiga, stihoviOdlomka, type Stih } from '@/lib/biblija';
import { citanjaDana, datumiCitanja, rasclani, skracenica, SKRACENICE, type Odlomak } from '@/lib/citanja';
import { opisDana } from '@/lib/opis-dana';
import { utc } from '@/lib/kalendar';
import s from '../citanja.module.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return datumiCitanja().map((datum) => ({ datum }));
}

type Props = { params: Promise<{ datum: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { datum } = await params;
  return { title: `Читања, ${datum.split('-').reverse().join('. ')}.` };
}

/** Део читања: узастопни одломци исте књиге, са текстом ако је Библија увезена. */
interface Deo { oznaka: string; veza: string; stihovi: Stih[] | null }

function delovi(ref: string): Deo[] {
  const grupe: Odlomak[][] = [];
  for (const o of rasclani(ref)) {
    const poslednja = grupe[grupe.length - 1];
    if (poslednja && poslednja[0]!.knjiga === o.knjiga) poslednja.push(o);
    else grupe.push([o]);
  }
  // Ознака сваке групе из изворне референце: делови раздвојени са ';', почев од назива књиге.
  const oznake: string[] = [];
  for (const deo of ref.split(';').map((x) => x.trim())) {
    if (Object.keys(SKRACENICE).some((k) => deo.startsWith(`${k} `)) || !oznake.length) oznake.push(deo);
    else oznake[oznake.length - 1] += `; ${deo}`;
  }
  return grupe.map((g, i) => {
    const sviStihovi = g.map(stihoviOdlomka);
    const prvi = g[0]!;
    return {
      oznaka: oznake[i] ?? '',
      veza: `/pismo/${prvi.knjiga}/${prvi.od.glava}/#s${prvi.od.stih}`,
      stihovi: sviStihovi.some((x) => x === null) ? null : sviStihovi.flatMap((x) => x!),
    };
  });
}

export default async function CitanjaStrana({ params }: Props) {
  const { datum } = await params;
  const c = citanjaDana(datum);
  if (!c) notFound();
  const [g, m, d] = datum.split('-').map(Number) as [number, number, number];
  const opis = opisDana(utc(g, m, d));
  const svi = datumiCitanja();
  const i = svi.indexOf(datum);
  const preth = svi[i - 1], sled = svi[i + 1];
  const delici = [
    { naslov: 'Апостол', delovi: delovi(c.apostol) },
    { naslov: 'Јеванђеље', delovi: delovi(c.jevandjelje) },
  ];
  const kratko = Object.fromEntries(Object.values(SKRACENICE).map((id) => [id, skracenica(id, knjiga(id)?.kratko ?? id)]));
  const praznik = opis.praznici[0]?.naziv;

  return (
    <>
      <Zaglavlje natpis="Читања на Литургији" naslov={opis.datum.replace(/ \d{4}\.$/, '')} podnaslov={praznik} nazad={{ href: '/citanja/', tekst: 'Читања' }} />
      <article className={`omot ${s.strana}`}>
        <div className={s.meta}>
          <OznakaPosta post={opis.post} />
          <span className="prigusen">{opis.stari}</span>
        </div>
        {delici.map((x) => (
          <section key={x.naslov} className={s.citanje} aria-labelledby={`n-${x.naslov}`}>
            <h2 id={`n-${x.naslov}`} className="natpis">{x.naslov}</h2>
            {x.delovi.map((deo) => (
              <div key={deo.oznaka} className={s.deo}>
                <Link href={deo.veza} className={s.ref}>{deo.oznaka}</Link>
                {deo.stihovi ? (
                  <Stihovi stihovi={deo.stihovi} kratko={kratko} glave />
                ) : (
                  <p className="prigusen" style={{ margin: '4px 0 0', fontSize: 14 }}>
                    [Текст ће се појавити када се увезе Свето писмо (`npm run uvoz:biblija`). До тада, додир на референцу отвара главу.]
                  </p>
                )}
              </div>
            ))}
          </section>
        ))}
        <p className={s.izvor}>
          {c.izvor === 'T' ? 'Уобичајена читања празника по Типику.' : 'Читања према црквеном календару (crkvenikalendar.rs).'}{' '}
          Додирните стих да га обележите или копирате.
        </p>
        <nav className={s.navigacija} aria-label="Друга читања">
          {preth ? <Link className="dugme dugme-obrub" href={`/citanja/${preth}/`}>‹ {Number(preth.slice(8))}. {Number(preth.slice(5, 7))}.</Link> : <span />}
          {sled && <Link className="dugme" href={`/citanja/${sled}/`}>{Number(sled.slice(8))}. {Number(sled.slice(5, 7))}. ›</Link>}
        </nav>
      </article>
    </>
  );
}
