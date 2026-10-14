import type { Metadata } from 'next';
import ListaKnjiga from '@/components/ListaKnjiga';
import Zaglavlje from '@/components/Zaglavlje';
import { stariZavet, vanPrevoda } from '@/lib/biblija';

export const metadata: Metadata = { title: 'Стари завет' };

export default function StariZavet() {
  return (
    <>
      <Zaglavlje naslov="Стари завет" podnaslov="39 књига у преводу Ђуре Даничића. Савез Бога са изабраним народом и припрема за долазак Христов." nazad={{ href: '/pismo/', tekst: 'Свето писмо' }} />
      <div className="omot">
        <ListaKnjiga grupe={stariZavet} />
        <section style={{ paddingTop: 18 }} aria-labelledby="van">
          <h2 id="van" style={{ fontSize: 25 }}>Остале књиге</h2>
          <p className="prigusen" style={{ fontSize: 13 }}>Књиге које Православна Црква чита, а Даничић их није превео. Потребан је други извор.</p>
          <div className="mreza mreza-3">
            {vanPrevoda.map((k) => (
              <div key={k} style={{ minHeight: 60, padding: '8px 10px', border: '1.5px dashed var(--ivica-2)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--mastilo-2)' }}>
                {k}
                <br />
                <small style={{ fontWeight: 400 }}>извор у припреми</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
