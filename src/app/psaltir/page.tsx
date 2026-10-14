import type { Metadata } from 'next';
import Psaltir from '@/components/Psaltir';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Псалтир' };

export default function PsaltirStrana() {
  return (
    <>
      <Zaglavlje naslov="Псалтир" podnaslov="150 псалама у 20 катизми, молитвеник Цркве" nazad={{ href: '/pismo/', tekst: 'Свето писмо' }} />
      <div className="omot">
        <Psaltir />
      </div>
    </>
  );
}
