import type { Metadata } from 'next';
import Hram from '@/components/Hram';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Уђи у храм' };

export default function HramStrana() {
  return (
    <>
      <Zaglavlje naslov="Уђи у храм" podnaslov="Додирните део храма да сазнате шта значи" nazad={{ href: '/ucenje/', tekst: 'Учење · први корак' }} />
      <div className="omot">
        <Hram />
      </div>
    </>
  );
}
