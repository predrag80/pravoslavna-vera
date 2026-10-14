import type { Metadata } from 'next';
import Prolog from '@/components/Prolog';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Охридски пролог' };

export default function PrologStrana() {
  return (
    <>
      <Zaglavlje natpis="Охридски пролог" naslov="Пролог за данас" nazad={{ href: '/', tekst: 'Данас' }} />
      <div className="omot">
        <Prolog />
      </div>
    </>
  );
}
