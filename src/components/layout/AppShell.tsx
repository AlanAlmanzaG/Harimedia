// src/components/layout/AppShell.tsx
"use client";

import { BottomNav } from "./BottomNav";
import { RouteGuard } from "./RouteGuard";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <RouteGuard requireAuth>
      <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100">
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800/50">
          <span className="font-semibold text-base tracking-tight text-neutral-100">
            Harimedia
          </span>
          <div id="header-actions" />
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        <BottomNav />
      </div>
    </RouteGuard>
  );
}