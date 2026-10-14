import type { Metadata } from 'next';
import ListaKnjiga from '@/components/ListaKnjiga';
import Zaglavlje from '@/components/Zaglavlje';
import { noviZavet } from '@/lib/biblija';

export const metadata: Metadata = { title: 'Нови завет' };

export default function NoviZavet() {
  return (
    <>
      <Zaglavlje naslov="Нови завет" podnaslov="27 књига у преводу Вука Караџића, поређаних црквеним редом." nazad={{ href: '/pismo/', tekst: 'Свето писмо' }} />
      <div className="omot">
        <ListaKnjiga grupe={noviZavet} />
      </div>
    </>
  );
}
