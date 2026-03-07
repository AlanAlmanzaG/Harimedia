// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider'; // <-- Importamos el tema

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
    // Agregamos suppressHydrationWarning aquí
    <html lang="es" suppressHydrationWarning> 
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider> {/* <-- Envolvemos toda la app aquí */}
          <AuthProvider>
            <div className="max-w-md mx-auto min-h-screen relative bg-white dark:bg-black shadow-xl overflow-x-hidden">
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </div>
            <Toaster position="top-center" richColors /> 
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}