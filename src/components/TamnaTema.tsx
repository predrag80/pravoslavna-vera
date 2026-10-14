'use client';

import { useEffect } from 'react';

/** Укључује тамну позадину (свод) само на страни на којој се налази. */
export default function TamnaTema() {
  useEffect(() => {
    document.body.classList.add('tamno');
    return () => document.body.classList.remove('tamno');
  }, []);
  return null;
}
