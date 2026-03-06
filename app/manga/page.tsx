// src/app/manga/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, BookOpen, Edit2, Trash2, Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import MediaForm from '@/components/MediaForm';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Reading, MediaStatus } from '@/types'; // <-- Ojo: importamos Reading

export default function MangaPage() {
  const { user } = useAuth();
  
  const [mangaList, setMangaList] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManga, setEditingManga] = useState<Reading | null>(null);

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
      const data: Reading[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Reading);
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
      await deleteDoc(doc(db, 'entries', id));
    }
  };

  // Función adaptada para Capítulos en lugar de episodios
  const handleIncrementChapter = async (id: string | undefined, currentCh: number = 0) => {
    if (!id) return;
    try {
      const docRef = doc(db, 'entries', id);
      await updateDoc(docRef, {
        currentChapter: currentCh + 1,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error al incrementar capítulo:", error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingManga(null);
  };

  const filteredAndSortedManga = useMemo(() => {
    return mangaList
      .filter((manga) => {
        const matchesSearch = manga.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (manga.director && manga.director.toLowerCase().includes(searchTerm.toLowerCase()));
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

      {/* ... [Buscador y filtros iguales que en Anime, pero cambiando bg-purple por bg-emerald] ... */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-emerald-500"
                placeholder="Buscar manga o mangaka..."
              />
            </div>
          </div>
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
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Cargando tu colección...</div>
          ) : mangaList.length === 0 ? (
            <div className="mt-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aún no hay manga</h3>
            </div>
          ) : (
            <>
              {displayedManga.map((manga) => (
                <div key={manga.id} className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative group">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => setEditingManga(manga)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-emerald-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(manga.id)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-red-600"><Trash2 size={16} /></button>
                  </div>

                  <div className="w-24 h-36 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {manga.coverUrl ? (
                      <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="text-gray-400" size={32} />
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-grow justify-between py-1 pr-14">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{manga.title}</h3>
                      {manga.director && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{manga.director}</p>}
                      
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Capítulo actual: {manga.currentChapter || 0}
                        </p>
                        <button
                          onClick={() => handleIncrementChapter(manga.id, manga.currentChapter)}
                          className="flex items-center justify-center p-1 rounded-full text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors active:scale-90"
                        >
                          <PlusCircle size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(manga.status)}`}>
                        {manga.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && <button onClick={handleLoadMore} className="w-full py-3 mt-4 text-sm bg-gray-100 rounded-xl">Cargar más</button>}
            </>
          )}
        </div>
      )}
    </div>
  );
}