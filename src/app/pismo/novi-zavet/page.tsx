import type { Metadata } from 'next';
import BookList from '@/components/BookList';
import PageHeader from '@/components/PageHeader';
import { newTestament } from '@/lib/bible';

export const metadata: Metadata = { title: 'Нови завет' };

export default function NewTestamentPage() {
  return (
    <>
      <PageHeader title="Нови завет" subtitle="27 књига у преводу Вука Караџића, поређаних црквеним редом." back={{ href: '/pismo/', text: 'Свето писмо' }} />
      <div className="container">
        <BookList groups={newTestament} />
      </div>
    </>
  );
}
