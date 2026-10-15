'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

const ITEMS = [
  { href: '/mapa/', name: 'Храмови', section: ['/mapa'], icon: <><path d="M12 2v3M10.5 3.5h3" /><path d="M8 10a4 4 0 0 1 8 0" /><path d="M5 21v-9h14v9" /><path d="M10 21v-4a2 2 0 0 1 4 0v4" /><path d="M3 21h18" /></> },
  { href: '/ucenje/', name: 'Учење', section: ['/ucenje', '/hram'], icon: <path d="M8 3v18M16 3v18M8 7h8M8 11h8M8 15h8M8 19h8" /> },
  { href: '/', name: 'Данас', section: [], icon: null },
  { href: '/pismo/', name: 'Писмо', section: ['/pismo', '/psaltir'], icon: <><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z" /><path d="M12 6v14" /></> },
  { href: '/oci/', name: 'Оци', section: ['/oci', '/prolog'], icon: <><circle cx="12" cy="8" r="5.5" /><circle cx="12" cy="8" r="2.5" /><path d="M5 21a7 7 0 0 1 14 0" /></> },
];

export default function BottomNav() {
  const pathname = usePathname() ?? '/';
  // The welcome screen has no navigation: the user first picks a journey.
  if (pathname.startsWith('/dobrodosli')) return null;
  return (
    <nav className={styles.nav} aria-label="Главна навигација">
      {ITEMS.map((s) => {
        if (s.icon === null) {
          const active = pathname === '/';
          return (
            <Link key={s.href} href={s.href} className={styles.cross} aria-label="Данас" aria-current={active ? 'page' : undefined}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                <path d="M12 2v20M9.5 5h5M7 9h10M9 15.5l6 2" />
              </svg>
            </Link>
          );
        }
        const active = s.section.some((o) => pathname.startsWith(o));
        return (
          <Link key={s.href} href={s.href} className={styles.item} aria-current={active ? 'page' : undefined}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {s.icon}
            </svg>
            <span>{s.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
