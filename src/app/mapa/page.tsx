import type { Metadata } from 'next';
import ShrineMap from '@/components/ShrineMap';
import data from '@/data/shrines.json';
import { eparchies } from '@/data/eparchies.json';

export const metadata: Metadata = { title: 'Храмови и манастири' };

export default function MapPage() {
  return <ShrineMap shrines={data.shrines} eparchies={eparchies} />;
}
