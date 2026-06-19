'use client';

import { usePathname } from 'next/navigation';
import { PublicHeader } from './header';

export function HeaderSelector() {
  const pathname = usePathname();

  return <PublicHeader />;
}