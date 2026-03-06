// src/app/milista/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MediaEntry, MediaStatus, MediaType } from '@/types';

export default function MiListaPage() {
  const { user } = useAuth();
  
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'todos'>('todos');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'actualizados' | 'recientes' | 'calificacion' | 'alfabetico'>('actualizados');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    if (!user) return;

    // A diferencia de películas, aquí no filtramos por "type", traemos TODO.
    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc') // Ordenamos por lo último que modificaste
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: MediaEntry[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as MediaEntry);
      });
      setEntries(data);
      setLoading(false);
    }, (error) => {
      console.error("Error obteniendo la lista global: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Lógica de filtrado y ordenamiento
  const filteredAndSortedEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || entry.status === statusFilter;
        const matchesType = typeFilter === 'todos' || entry.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'actualizados') return b.updatedAt - a.updatedAt;
        if (sortBy === 'recientes') return b.createdAt - a.createdAt;
        if (sortBy === 'calificacion') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'alfabetico') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [entries, searchTerm, statusFilter, typeFilter, sortBy]);

  const displayedEntries = filteredAndSortedEntries.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedEntries.length;

  const handleLoadMore = () => setVisibleCount(prev => prev + 15);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'viendo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pausa': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'abandonado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pelicula': return 'bg-red-500';
      case 'serie': return 'bg-blue-500';
      case 'anime': return 'bg-purple-500';
      case 'manga': return 'bg-emerald-500';
      case 'caricatura': return 'bg-yellow-500';
      case 'manhwa': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-5">
      <header className="mb-4 mt-2">
        <h1 className="text-2xl font-bold tracking-tight">Mi Lista</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Todo tu entretenimiento en un solo lugar</p>
      </header>

      {entries.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(15);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Buscar en toda tu lista..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de contenido</label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as any);
                    setVisibleCount(15);
                  }}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option className="bg-white dark:bg-gray-800" value="todos">Todos</option>
                  <option className="bg-white dark:bg-gray-800" value="pelicula">Películas</option>
                  <option className="bg-white dark:bg-gray-800" value="serie">Series</option>
                  <option className="bg-white dark:bg-gray-800" value="anime">Anime</option>
                  <option className="bg-white dark:bg-gray-800" value="manga">Manga</option>
                  <option className="bg-white dark:bg-gray-800" value="caricatura">Caricaturas</option>
                  <option className="bg-white dark:bg-gray-800" value="manhwa">Manhwa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setVisibleCount(15);
                  }}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option className="bg-white dark:bg-gray-800" value="todos">Todos</option>
                  <option className="bg-white dark:bg-gray-800" value="viendo">Viendo / Leyendo</option>
                  <option className="bg-white dark:bg-gray-800" value="completado">Completado</option>
                  <option className="bg-white dark:bg-gray-800" value="pausa">En pausa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ordenar</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option className="bg-white dark:bg-gray-800" value="actualizados">Actividad Reciente</option>
                  <option className="bg-white dark:bg-gray-800" value="recientes">Recién Agregados</option>
                  <option className="bg-white dark:bg-gray-800" value="calificacion">Calificación</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando tu colección global...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tu lista está vacía</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ve al inicio y selecciona una categoría para empezar a agregar.
            </p>
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No se encontró contenido con estos filtros.
          </div>
        ) : (
          <>
            {displayedEntries.map((entry) => (
              <div key={entry.id} className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative">
                
                {/* Indicador visual del TIPO de contenido (Barra lateral de color) */}
                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-md ${getTypeColor(entry.type)}`}></div>

                <div className="w-20 h-28 ml-2 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {entry.coverUrl ? (
                    <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-400" size={24} />
                  )}
                </div>
                
                <div className="flex flex-col flex-grow justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-base leading-tight mb-1 line-clamp-2 pr-2">{entry.title}</h3>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded text-white shrink-0 ${getTypeColor(entry.type)}`}>
                        {entry.type}
                      </span>
                    </div>
                    
                    {/* Renderizado condicional del progreso si es serie, anime, manga, etc. */}
                    {('currentEpisode' in entry) && (
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                        Episodio: {entry.currentEpisode || 0}
                      </p>
                    )}
                    {('currentChapter' in entry) && (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                        Capítulo: {entry.currentChapter || 0}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status.replace('-', ' ')}
                    </span>
                    {entry.score && (
                      <span className="text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-md">
                        ★ {entry.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 mt-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cargar más
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}