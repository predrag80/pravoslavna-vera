import type { Metadata } from 'next';
import Calendar from '@/components/Calendar';
import { feastContent } from '@/lib/content';
import { allImages } from '@/lib/images';
import DarkTheme from '@/components/DarkTheme';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Календар' };

export default function CalendarPage() {
  return (
    <>
      <DarkTheme />
      <PageHeader title="Календар" subtitle="Додирните датум да видите празник, светитеље и пост" back={{ href: '/', text: 'Данас' }} />
      <div className="container">
        <Calendar data={{ content: feastContent(), images: allImages() }} />
      </div>
    </>
  );
}
