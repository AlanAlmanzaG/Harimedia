// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Harimedia',
  description: 'Tu bitácora personal de entretenimiento',
  manifest: '/manifest.json', // Dejamos esto preparado para la PWA más adelante
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        {/* Contenedor principal que simula la pantalla del móvil */}
        <div className="max-w-md mx-auto min-h-screen relative bg-white dark:bg-black shadow-xl overflow-x-hidden">
          {/* El padding-bottom (pb-20) asegura que el contenido no quede oculto detrás de la barra inferior */}
          <main className="pb-20 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}