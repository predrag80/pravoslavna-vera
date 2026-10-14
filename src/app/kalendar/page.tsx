import type { Metadata } from 'next';
import Kalendar from '@/components/Kalendar';
import { sadrzajPraznika } from '@/lib/sadrzaj';
import { sveSlike } from '@/lib/slike';
import TamnaTema from '@/components/TamnaTema';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Календар' };

export default function KalendarStrana() {
  return (
    <>
      <TamnaTema />
      <Zaglavlje naslov="Календар" podnaslov="Додирните датум да видите празник, светитеље и пост" nazad={{ href: '/', tekst: 'Данас' }} />
      <div className="omot">
        <Kalendar podaci={{ sadrzaj: sadrzajPraznika(), slike: sveSlike() }} />
      </div>
    </>
  );
}
