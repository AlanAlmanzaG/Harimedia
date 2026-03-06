// src/components/BottomNav.tsx
import Link from 'next/link';
import { Home, Search, Library, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-blue-500 active:text-blue-600 transition-colors">
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Inicio</span>
        </Link>
        <Link href="/buscar" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-blue-500 active:text-blue-600 transition-colors">
          <Search size={24} />
          <span className="text-[10px] mt-1 font-medium">Buscar</span>
        </Link>
        <Link href="/milista" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-blue-500 active:text-blue-600 transition-colors">
          <Library size={24} />
          <span className="text-[10px] mt-1 font-medium">Mi Lista</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-blue-500 active:text-blue-600 transition-colors">
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}