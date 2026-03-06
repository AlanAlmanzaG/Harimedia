// src/app/page.tsx
import Link from 'next/link';
import { Film, Tv, PlaySquare, BookOpen, MonitorPlay, ScrollText } from 'lucide-react';

export default function Home() {
  const categories = [
    { name: 'Películas', path: '/peliculas', icon: Film, color: 'bg-red-500' },
    { name: 'Series', path: '/series', icon: Tv, color: 'bg-blue-500' },
    { name: 'Anime', path: '/anime', icon: PlaySquare, color: 'bg-purple-500' },
    { name: 'Manga', path: '/manga', icon: BookOpen, color: 'bg-emerald-500' },
    { name: 'Caricaturas', path: '/caricaturas', icon: MonitorPlay, color: 'bg-yellow-500' },
    { name: 'Manhwa', path: '/manhwa', icon: ScrollText, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-5">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Harimedia</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">¿Qué vamos a registrar hoy?</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-4">Tus Categorías</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.path}
                className={`${cat.color} text-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform duration-200 h-36`}
              >
                <Icon size={36} className="mb-3 opacity-90" />
                <span className="font-medium tracking-wide">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}