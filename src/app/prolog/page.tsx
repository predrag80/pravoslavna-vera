import type { Metadata } from 'next';
import Prologue from '@/components/Prologue';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Охридски пролог' };

export default function ProloguePage() {
  return (
    <>
      <PageHeader eyebrow="Охридски пролог" title="Пролог за данас" back={{ href: '/', text: 'Данас' }} />
      <div className="container">
        <Prologue />
      </div>
    </>
  );
}
