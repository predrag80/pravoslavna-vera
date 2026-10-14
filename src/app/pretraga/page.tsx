import type { Metadata } from 'next';
import Pretraga from '@/components/Pretraga';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Претрага' };

export default function PretragaStrana() {
  return (
    <>
      <Zaglavlje naslov="Претрага" podnaslov="Празници, светитељи, Свето писмо, храмови" nazad={{ href: '/', tekst: 'Данас' }} />
      <div className="omot">
        <Pretraga />
      </div>
    </>
  );
}
