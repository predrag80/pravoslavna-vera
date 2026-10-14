import type { Metadata } from 'next';
import Link from 'next/link';
import DrvoPredanja from '@/components/DrvoPredanja';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Свети оци' };

export default function Oci() {
  return (
    <>
      <Zaglavlje naslov="Свети оци" podnaslov="Дрво Предања, од апостола до наших дана" />
      <div className="omot">
        <Link href="/prolog/" className="dugme" style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
          Охридски пролог за данас <span aria-hidden="true">›</span>
        </Link>
        <DrvoPredanja />
      </div>
    </>
  );
}
