import Today from '@/components/Today';
import { todayData } from '@/lib/today';
import { today } from '@/lib/calendar';
import { REDIRECT_IF_NO_JOURNEY } from '@/lib/journey';

export default function HomePage() {
  return (
    <>
      {/* First visit: show the welcome screen before the home page renders. */}
      <script dangerouslySetInnerHTML={{ __html: REDIRECT_IF_NO_JOURNEY }} />
      <Today initial={todayData(today())} />
    </>
  );
}
