// src/app/manga/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, BookOpen, Edit2, Trash2, Search, SlidersHorizontal, PlusCircle, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import MediaForm from '@/components/MediaForm';
import SkeletonCard from '@/components/SkeletonCard';
import { toast } from 'sonner';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MediaStatus } from '@/types';

export default function MangaPage() {
  const { user } = useAuth();
  
  // Usamos any temporalmente para el array para no tener errores de TypeScript con las nuevas propiedades
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManga, setEditingManga] = useState<any | null>(null);

  // --- ESTADO PARA CONTROLAR LA VISTA (LISTA O CUADRÍCULA) ---
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
      where('type', '==', 'manga'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setMangaList(data);
      setLoading(false);
    }, (error) => {
      console.error("Error obteniendo manga: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este manga de tu bitácora?')) {
      try {
        await deleteDoc(doc(db, 'entries', id));
        toast.success('Eliminado correctamente'); 
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error('Hubo un error al eliminar. Inténtalo de nuevo.'); 
      }
    }
  };

  // --- LÓGICA DE INCREMENTO INTELIGENTE (CAPÍTULOS) ---
  const handleIncrementChapter = async (manga: any) => {
    if (!manga.id) return;
    
    const currentChap = manga.currentChapter || 0;
    const totalChap = manga.totalProgress;

    // Verificamos el límite
    if (totalChap && currentChap >= totalChap) {
      toast.info('¡Ya llegaste al capítulo final!');
      return;
    }

    try {
      const docRef = doc(db, 'entries', manga.id);
      
      const newData: any = {
        currentChapter: currentChap + 1,
        updatedAt: Date.now()
      };

      // Si con este clic llegó al final, la marcamos como completada automáticamente
      if (totalChap && currentChap + 1 === totalChap) {
        newData.status = 'completado';
        toast.success('¡Felicidades, terminaste este manga!', { duration: 4000 });
      }

      await updateDoc(docRef, newData);
    } catch (error) {
      console.error("Error al incrementar capítulo:", error);
      toast.error('Error al actualizar el capítulo');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingManga(null);
  };

  const filteredAndSortedManga = useMemo(() => {
    return mangaList
      .filter((manga) => {
        const matchesSearch = manga.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || manga.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'recientes') return b.createdAt - a.createdAt;
        if (sortBy === 'calificacion') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'alfabetico') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [mangaList, searchTerm, statusFilter, sortBy]);

  const displayedManga = filteredAndSortedManga.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedManga.length;

  const handleLoadMore = () => setVisibleCount(prev => prev + 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'viendo': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
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
          <h1 className="text-2xl font-bold tracking-tight">Manga</h1>
        </div>
        
        {!(showForm || editingManga) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}
      </header>

      {!(showForm || editingManga) && mangaList.length > 0 && (
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                placeholder="Buscar manga..."
              />
            </div>

            {/* --- BOTÓN PARA ALTERNAR LA VISTA (GRID / LISTA) --- */}
            <button
              onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              {viewMode === 'list' ? <LayoutGrid size={20} /> : <List size={20} />}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
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
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option className="bg-white dark:bg-gray-800" value="todos">Todos</option>
                  <option className="bg-white dark:bg-gray-800" value="plan">Planear ver</option>
                  <option className="bg-white dark:bg-gray-800" value="viendo">Leyendo</option>
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
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option className="bg-white dark:bg-gray-800" value="recientes">Recientes</option>
                  <option className="bg-white dark:bg-gray-800" value="calificacion">Mejor Calificados</option>
                  <option className="bg-white dark:bg-gray-800" value="alfabetico">Alfabético (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {(showForm || editingManga) ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <MediaForm 
            key={editingManga ? editingManga.id : 'new-form'}
            type="manga" 
            initialData={editingManga} 
            onSuccess={handleCloseForm} 
            onCancel={handleCloseForm} 
          />
        </div>
      ) : (
        // --- CONTENEDOR DINÁMICO (Cambia la clase dependiendo de viewMode) ---
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 gap-4 pb-10" : "space-y-4 pb-10"}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : mangaList.length === 0 ? (
            <div className="col-span-full mt-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aún no hay mangas</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Toca el botón de agregar para registrar tu primer manga.
              </p>
            </div>
          ) : (
            <>
              {displayedManga.map((manga) => {
                // Calcular progreso para la barra
                const currentChap = manga.currentChapter || 0;
                const totalChap = manga.totalProgress;
                const progressPercent = totalChap ? Math.min((currentChap / totalChap) * 100, 100) : 0;
                const isFinished = totalChap && currentChap >= totalChap;

                // ---------------------------------
                // RENDERIZADO: MODO LISTA
                // ---------------------------------
                if (viewMode === 'list') {
                  return (
                    <div key={manga.id} className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative group animate-in fade-in">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={() => setEditingManga(manga)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-emerald-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(manga.id)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>

                      <div className="w-24 h-36 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {manga.coverUrl ? (
                          <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="text-gray-400" size={32} />
                        )}
                        
                        {/* Etiqueta de "En Emisión" */}
                        {manga.releaseStatus === 'emision' && (
                          <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider backdrop-blur-sm">
                            En Emisión
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col flex-grow justify-between py-1 pr-14">
                        <div>
                          <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{manga.title}</h3>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <p className={`text-sm font-medium ${isFinished ? 'text-green-600 dark:text-green-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                              Cap. {currentChap} {totalChap ? `/ ${totalChap}` : ''}
                            </p>
                            
                            <button
                              onClick={() => handleIncrementChapter(manga)}
                              disabled={isFinished}
                              className={`flex items-center justify-center p-1 rounded-full transition-colors active:scale-90 ${
                                isFinished ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                              }`}
                            >
                              <PlusCircle size={18} />
                            </button>
                          </div>

                          {/* BARRA DE PROGRESO VISUAL */}
                          {totalChap > 0 && (
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${isFinished ? 'bg-green-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(manga.status)}`}>
                            {manga.status.replace('-', ' ')}
                          </span>
                          {manga.score && (
                            <span className="text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-md">
                              ★ {manga.score}/10
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
                  <div key={manga.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative group animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Botones de acción flotantes */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingManga(manga)} className="p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-emerald-500 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(manga.id)} className="p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>

                    <div className="w-full aspect-[2/3] relative bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      {manga.coverUrl ? (
                        <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="text-gray-400 opacity-50" size={40} />
                      )}
                      
                      {manga.score && (
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                          ★ {manga.score}
                        </div>
                      )}

                      {manga.releaseStatus === 'emision' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider backdrop-blur-sm">
                          En Emisión
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 flex flex-col flex-grow justify-between gap-2">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2" title={manga.title}>{manga.title}</h3>
                      
                      <div className="mt-auto space-y-2">
                        {/* Control de progreso */}
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1.5 border border-gray-100 dark:border-gray-700/50">
                          <span className={`text-xs font-bold px-1 ${isFinished ? 'text-green-600 dark:text-green-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {currentChap} {totalChap ? `/ ${totalChap}` : ''}
                          </span>
                          <button
                            onClick={() => handleIncrementChapter(manga)}
                            disabled={isFinished}
                            className={`p-1 rounded-md transition-colors ${
                              isFinished ? 'text-gray-400 cursor-not-allowed' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200'
                            }`}
                          >
                            <PlusCircle size={16} />
                          </button>
                        </div>
                        
                        {/* Barra de progreso mini */}
                        {totalChap > 0 && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                            <div className={`h-1 rounded-full ${isFinished ? 'bg-green-500' : 'bg-emerald-500'}`} style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {hasMore && (
                <div className={viewMode === 'grid' ? "col-span-full" : "w-full"}>
                  <button onClick={handleLoadMore} className="w-full py-3 mt-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-xl transition-colors">
                    Cargar más
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