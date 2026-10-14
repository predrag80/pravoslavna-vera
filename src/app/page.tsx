import Danas from '@/components/Danas';
import { podaciDana } from '@/lib/dan';
import { danas } from '@/lib/kalendar';

export default function Pocetna() {
  return <Danas pocetno={podaciDana(danas())} />;
}
