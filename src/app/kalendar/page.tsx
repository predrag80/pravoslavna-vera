import type { Metadata } from 'next';
import GodisnjiKrug from '@/components/GodisnjiKrug';
import TamnaTema from '@/components/TamnaTema';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Годишњи круг' };

export default function Kalendar() {
  return (
    <>
      <TamnaTema />
      <Zaglavlje naslov="Годишњи круг" podnaslov="Црквена година почиње 14. септембра" nazad={{ href: '/', tekst: 'Данас' }} />
      <div className="omot">
        <GodisnjiKrug />
      </div>
    </>
  );
}
