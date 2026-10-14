'use client';

import { useEffect } from 'react';
import { primeniSacuvanoPismo } from '@/lib/pismo-klijent';

/** Покреће оно што важи за целу апликацију: изабрано писмо и рад без интернета. */
export default function Pokretanje() {
  useEffect(() => {
    primeniSacuvanoPismo();
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
