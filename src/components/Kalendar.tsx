'use client';

import { useCallback, useState } from 'react';
import { dodajDane } from '@/lib/kalendar';
import { useDanas } from '@/lib/kuke';
import GodisnjiKrug from './GodisnjiKrug';
import ListDana, { type PodaciPraznika } from './ListDana';
import MesecniPrikaz from './MesecniPrikaz';
import s from './Kalendar.module.css';

/** Календар са два приказа (Круг и Месец); додир на датум отвара „лист дана“. */
export default function Kalendar({ podaci }: { podaci: PodaciPraznika }) {
  const danas = useDanas();
  const [prikaz, setPrikaz] = useState<'krug' | 'mesec'>('mesec');
  const [otvoren, setOtvoren] = useState<Date | null>(null);
  const [pomakMeseca, setPomakMeseca] = useState(0);

  const pomeri = useCallback((n: number) => setOtvoren((d) => (d ? dodajDane(d, n) : d)), []);
  const zatvori = useCallback(() => setOtvoren(null), []);

  if (!danas) return <div className={s.cekanje} aria-busy="true" />;

  // Приказани месец прати отворени дан, иначе текући месец уз померај стрелицама.
  const osnova = otvoren ?? danas;
  const m = new Date(Date.UTC(osnova.getUTCFullYear(), osnova.getUTCMonth() + (otvoren ? 0 : pomakMeseca), 1));

  return (
    <>
      <div className={s.prekidac} role="tablist" aria-label="Приказ календара">
        <button type="button" role="tab" aria-selected={prikaz === 'mesec'} onClick={() => setPrikaz('mesec')}>Месец</button>
        <button type="button" role="tab" aria-selected={prikaz === 'krug'} onClick={() => setPrikaz('krug')}>Годишњи круг</button>
      </div>

      {prikaz === 'mesec' ? (
        <MesecniPrikaz
          godina={m.getUTCFullYear()}
          mesec={m.getUTCMonth() + 1}
          danas={danas}
          izabran={otvoren}
          podaci={podaci}
          onMesec={(n) => {
            if (otvoren) {
              setPomakMeseca((m.getUTCFullYear() - danas.getUTCFullYear()) * 12 + m.getUTCMonth() - danas.getUTCMonth() + n);
              setOtvoren(null);
            } else setPomakMeseca((p) => p + n);
          }}
          onIzaberi={setOtvoren}
        />
      ) : (
        <GodisnjiKrug onOtvoriDan={setOtvoren} />
      )}

      {otvoren && <ListDana datum={otvoren} podaci={podaci} onZatvori={zatvori} onPomeri={pomeri} />}
    </>
  );
}
