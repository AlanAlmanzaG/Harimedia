// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Toaster } from 'sonner'; // <-- 1. Importamos Sonner

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Harimedia',
  description: 'Tu bitácora personal de entretenimiento',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Harimedia',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <div className="max-w-md mx-auto min-h-screen relative bg-white dark:bg-black shadow-xl overflow-x-hidden">
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </div>
          {/* 2. Agregamos el Toaster aquí. richColors le da colores vivos (rojo error, verde éxito) */}
          <Toaster position="top-center" richColors /> 
        </AuthProvider>
      </body>
    </html>
  );
}