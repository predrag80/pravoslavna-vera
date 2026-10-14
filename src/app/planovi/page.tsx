import type { Metadata } from 'next';
import ListaPlanova from '@/components/ListaPlanova';
import Zaglavlje from '@/components/Zaglavlje';

export const metadata: Metadata = { title: 'Планови читања' };

export default function Planovi() {
  return (
    <>
      <Zaglavlje naslov="Планови читања" podnaslov="Свето писмо део по део, својим темпом" />
      <div className="omot">
        <ListaPlanova />
      </div>
    </>
  );
}
