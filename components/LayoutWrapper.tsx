// src/components/LayoutWrapper.tsx
"use client";

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      <main className={`min-h-screen ${!isLoginPage ? 'pb-20' : ''}`}>
        {children}
      </main>
      {!isLoginPage && <BottomNav />}
    </>
  );
}