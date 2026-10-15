import type { Metadata } from 'next';
import Zaglavlje from '@/components/Zaglavlje';
import Obelezeno from '@/components/Obelezeno';
import { sveKnjige } from '@/lib/biblija';

export const metadata: Metadata = { title: 'Обележени стихови' };

export default function ObelezenoStrana() {
  const knjige = sveKnjige.map((k) => ({ id: k.id, naziv: k.naziv, kratko: k.kratko }));
  return (
    <>
      <Zaglavlje natpis="Свето писмо" naslov="Обележено" podnaslov="Стихови које сте обележили, чувају се на овом уређају" />
      <div className="omot" style={{ paddingBottom: 24 }}>
        <Obelezeno knjige={knjige} />
      </div>
    </>
  );
}
