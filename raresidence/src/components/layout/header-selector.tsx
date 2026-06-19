'use client';

import { usePathname } from 'next/navigation';
import { PublicHeader } from './header';
import { LoginHeader } from './login-header'
import { SignupHeader } from './signup-header'

export function HeaderSelector() {
  const pathname = usePathname();

  if (pathname?.startsWith('/login')) {
    return <LoginHeader />;
  }

  if (pathname?.startsWith('/signup')) {
    return <SignupHeader />;
  }

  return <PublicHeader />;
}