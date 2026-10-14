import type { Metadata } from 'next';
import KrsnaSlava from '@/components/KrsnaSlava';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Крсна слава' };

export default function SlavaStrana() {
  return (
    <>
      <Zaglavlje naslov="Крсна слава" podnaslov="Изаберите своју славу: подсетник, житије, тропар и обичаји" />
      <div className="omot">
        <KrsnaSlava />
      </div>
    </>
  );
}
