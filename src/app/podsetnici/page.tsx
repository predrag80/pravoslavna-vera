import type { Metadata } from 'next';
import Podsetnici from '@/components/Podsetnici';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Подсетници' };

export default function PodsetniciStrana() {
  return (
    <>
      <Zaglavlje naslov="Подсетници" podnaslov="Слава, празници и почетак постова у календару вашег телефона" />
      <div className="omot">
        <Podsetnici />
      </div>
    </>
  );
}
