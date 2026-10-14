import type { Metadata } from 'next';
import Mapa from '@/components/Mapa';
import podaci from '@/data/svetinje.json';

export const metadata: Metadata = { title: 'Храмови и манастири' };

export default function MapaStrana() {
  return <Mapa svetinje={podaci.svetinje} />;
}
