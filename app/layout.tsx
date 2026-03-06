// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import LayoutWrapper from '@/components/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

// Configuramos la metadata general y para dispositivos Apple
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

// Configuramos el viewport para evitar zoom accidental en celulares
// y definimos el color de la barra superior
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
        </AuthProvider>
      </body>
    </html>
  );
}