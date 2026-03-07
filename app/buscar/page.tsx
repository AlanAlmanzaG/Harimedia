// src/app/buscar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Search as SearchIcon, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MediaEntry } from '@/types';
import Link from 'next/link';
import SkeletonCard from '@/components/SkeletonCard';

export default function BuscarPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Traemos toda la base de datos de una vez
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'entries'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: MediaEntry[] = [];
      querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as MediaEntry));
      setEntries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filtramos rápido a medida que escribe
  const searchResults = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-5 pb-24 h-screen flex flex-col">
      <header className="mb-6 mt-2">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Búsqueda Global</h1>
        
        {/* Barra de búsqueda gigante y protagonista */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon size={22} className="text-blue-500 transition-transform group-focus-within:scale-110" />
          </div>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 border-0 rounded-2xl leading-5 bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-lg transition-all"
            placeholder="¿Qué estás buscando...?"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-3 pb-10">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : searchTerm === '' ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <SearchIcon size={64} className="mb-4 text-gray-400" />
            <p className="text-gray-500 font-medium text-lg">Escribe un título para buscar</p>
            <p className="text-sm text-gray-400 mt-1">Busca entre tus {entries.length} obras registradas</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 font-medium">No se encontraron resultados para "{searchTerm}"</p>
          </div>
        ) : (
          searchResults.map((entry) => (
            <Link 
              href={`/${entry.type === 'caricatura' ? 'caricaturas' : entry.type}s`} 
              key={entry.id}
              className="flex items-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
            >
              <div className="w-14 h-20 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                {entry.coverUrl ? (
                  <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-gray-400" /></div>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{entry.title}</h3>
                <span className="text-xs font-semibold uppercase text-blue-500 tracking-wider">
                  {entry.type}
                </span>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {entry.status === 'viendo' ? 'Viendo/Leyendo' : entry.status}
                </p>
              </div>

              <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}