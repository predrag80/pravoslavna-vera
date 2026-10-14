import Danas from '@/components/Danas';
import { podaciDana } from '@/lib/dan';
import { danas } from '@/lib/kalendar';
import { PREUSMERI_AKO_NEMA_PUTA } from '@/lib/put';

export default function Pocetna() {
  return (
    <>
      {/* Прво отварање: екран добродошлице пре него што се почетна прикаже. */}
      <script dangerouslySetInnerHTML={{ __html: PREUSMERI_AKO_NEMA_PUTA }} />
      <Danas pocetno={podaciDana(danas())} />
    </>
  );
}
