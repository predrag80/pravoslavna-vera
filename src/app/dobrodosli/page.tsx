import type { Metadata } from 'next';
import Dobrodoslica from '@/components/Dobrodoslica';

export const metadata: Metadata = { title: 'Добро дошли' };

export default function DobrodosliStrana() {
  return <Dobrodoslica />;
}
