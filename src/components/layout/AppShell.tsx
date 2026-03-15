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
      <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-[var(--bg-primary)]/80 backdrop-blur-sm border-b border-[var(--border-default)]">
          <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">
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