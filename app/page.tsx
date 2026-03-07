// src/app/page.tsx
"use client";

import Link from 'next/link';
import { Film, Tv, PlaySquare, BookOpen, MonitorPlay, ScrollText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const categories = [
    { href: '/peliculas', name: 'Películas', icon: Film, color: 'bg-red-500', shadow: 'hover:shadow-red-500/30' },
    { href: '/series', name: 'Series', icon: Tv, color: 'bg-blue-500', shadow: 'hover:shadow-blue-500/30' },
    { href: '/anime', name: 'Anime', icon: PlaySquare, color: 'bg-purple-500', shadow: 'hover:shadow-purple-500/30' },
    { href: '/manga', name: 'Manga', icon: BookOpen, color: 'bg-emerald-500', shadow: 'hover:shadow-emerald-500/30' },
    { href: '/caricaturas', name: 'Caricaturas', icon: MonitorPlay, color: 'bg-yellow-500', shadow: 'hover:shadow-yellow-500/30' },
    { href: '/manhwa', name: 'Manhwa', icon: ScrollText, color: 'bg-orange-500', shadow: 'hover:shadow-orange-500/30' },
  ];

  return (
    <div className="p-5 pb-24">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Harimedia</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">¿Qué vamos a registrar hoy?</p>
      </header>

      <h2 className="text-xl font-bold mb-4">Tus Categorías</h2>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            // AQUÍ ESTÁ LA MAGIA DE LA ANIMACIÓN:
            className={`${cat.color} ${cat.shadow} text-white p-6 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-md transition-all duration-300 transform hover:scale-105 hover:brightness-110 active:scale-95 cursor-pointer`}
          >
            <cat.icon size={36} strokeWidth={2} />
            <span className="font-bold text-lg">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}