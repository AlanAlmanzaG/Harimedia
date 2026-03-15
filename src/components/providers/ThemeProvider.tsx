// src/components/providers/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"        // Aplica "dark" o "light" como clase en <html>
      defaultTheme="dark"      // Harimedia es dark por defecto
      enableSystem             // Respeta la preferencia del sistema si el usuario no eligió
      disableTransitionOnChange // Evita flash de transición al cambiar tema
    >
      {children}
    </NextThemesProvider>
  );
}