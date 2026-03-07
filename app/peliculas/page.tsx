// src/app/peliculas/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, Film, Edit2, Trash2, Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import MediaForm from '@/components/MediaForm';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MediaStatus } from '@/types';
import SkeletonCard from '@/components/SkeletonCard'; 
import { toast } from 'sonner';

export default function PeliculasPage() {
  const { user } = useAuth();
  
  // Estados de la base de datos y UI base (Cambiamos Movie por any temporalmente por las nuevas props)
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any | null>(null);

  // --- ESTADO PARA MODO DE VISTA ---
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Estados para Búsqueda, Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'recientes' | 'calificacion' | 'alfabetico'>('recientes');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid),
      where('type', '==', 'pelicula'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const moviesData: any[] = [];
      querySnapshot.forEach((doc) => {
        moviesData.push({ id: doc.id, ...doc.data() });
      });
      setMovies(moviesData);
      setLoading(false);
    }, (error) => {
      console.error("Error obteniendo películas: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar esta película de tu bitácora?')) {
      try {
        await deleteDoc(doc(db, 'entries', id));
        toast.success('Película eliminada correctamente'); 
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error('Hubo un error al eliminar. Inténtalo de nuevo.'); 
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  const filteredAndSortedMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'todos' || movie.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'recientes') return b.createdAt - a.createdAt;
        if (sortBy === 'calificacion') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'alfabetico') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [movies, searchTerm, statusFilter, sortBy]);

  const displayedMovies = filteredAndSortedMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedMovies.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'viendo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pausa': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'abandonado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="p-5">
      <header className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Películas</h1>
        </div>
        
        {!(showForm || editingMovie) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}
      </header>

      {!(showForm || editingMovie) && movies.length > 0 && (
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
                  setVisibleCount(10);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
                placeholder="Buscar película o director..."
              />
            </div>

            {/* BOTÓN PARA ALTERNAR LA VISTA (GRID / LISTA) */}
            <button
              onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              {viewMode === 'list' ? <LayoutGrid size={20} /> : <List size={20} />}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${showFilters ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setVisibleCount(10);
                  }}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option className="bg-white dark:bg-gray-800" value="todos">Todos</option>
                  <option className="bg-white dark:bg-gray-800" value="plan">Planear ver</option>
                  <option className="bg-white dark:bg-gray-800" value="viendo">Viendo</option>
                  <option className="bg-white dark:bg-gray-800" value="completado">Completado</option>
                  <option className="bg-white dark:bg-gray-800" value="pausa">En pausa</option>
                  <option className="bg-white dark:bg-gray-800" value="abandonado">Abandonado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option className="bg-white dark:bg-gray-800" value="recientes">Recientes</option>
                  <option className="bg-white dark:bg-gray-800" value="calificacion">Mejor Calificadas</option>
                  <option className="bg-white dark:bg-gray-800" value="alfabetico">Alfabético (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {(showForm || editingMovie) ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <MediaForm 
            key={editingMovie ? editingMovie.id : 'new-form'}
            type="pelicula" 
            initialData={editingMovie} 
            onSuccess={handleCloseForm} 
            onCancel={handleCloseForm} 
          />
        </div>
      ) : (
        // CONTENEDOR DINÁMICO (Cambia la clase dependiendo de viewMode)
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 gap-4 pb-10" : "space-y-4 pb-10"}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : movies.length === 0 ? (
            <div className="col-span-full mt-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aún no hay películas</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Toca el botón de agregar para registrar tu primera película.
              </p>
            </div>
          ) : displayedMovies.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No se encontraron películas con esos filtros.
            </div>
          ) : (
            <>
              {displayedMovies.map((movie) => {
                
                // ---------------------------------
                // RENDERIZADO: MODO LISTA
                // ---------------------------------
                if (viewMode === 'list') {
                  return (
                    <div key={movie.id} className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative group animate-in fade-in">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={() => setEditingMovie(movie)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Editar"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(movie.id)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                      </div>

                      <div className="w-24 h-36 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                        {movie.coverUrl ? (
                          <img src={movie.coverUrl} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <Film className="text-gray-400" size={32} />
                        )}
                      </div>
                      
                      <div className="flex flex-col flex-grow justify-between py-1 pr-14">
                        <div>
                          <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{movie.title}</h3>
                          {movie.director && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{movie.director}</p>}
                          
                          <div className="flex flex-wrap gap-2 mt-2 text-xs font-medium">
                            {movie.year && <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{movie.year}</span>}
                            {movie.genre && <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{movie.genre}</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(movie.status)}`}>
                            {movie.status.replace('-', ' ')}
                          </span>
                          {movie.score && (
                            <span className="text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-md">
                              ★ {movie.score}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // ---------------------------------
                // RENDERIZADO: MODO CUADRÍCULA (GRID)
                // ---------------------------------
                return (
                  <div key={movie.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative group animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Botones de acción flotantes */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingMovie(movie)} className="p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-blue-500 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(movie.id)} className="p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>

                    <div className="w-full aspect-[2/3] relative bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      {movie.coverUrl ? (
                        <img src={movie.coverUrl} alt={movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <Film className="text-gray-400 opacity-50" size={40} />
                      )}
                      
                      {movie.score && (
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                          ★ {movie.score}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 flex flex-col flex-grow justify-between gap-1">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2" title={movie.title}>{movie.title}</h3>
                      
                      <div className="flex items-center justify-between mt-1">
                         <span className="text-[10px] text-gray-500 font-semibold">{movie.year || ''}</span>
                         <span className="w-2 h-2 rounded-full" style={{ backgroundColor: movie.status === 'completado' ? '#3b82f6' : movie.status === 'viendo' ? '#22c55e' : '#e5e7eb' }} title={movie.status}></span>
                      </div>
                    </div>
                  </div>
                );

              })}
              
              {/* Botón de Cargar Más */}
              {hasMore && (
                <div className={viewMode === 'grid' ? "col-span-full" : "w-full"}>
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-3 mt-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cargar más películas
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}