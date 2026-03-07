// src/app/manga/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, BookOpen, Edit2, Trash2, Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
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
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManga, setEditingManga] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'recientes' | 'calificacion' | 'alfabetico'>('recientes');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'entries'), where('userId', '==', user.uid), where('type', '==', 'manga'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: any[] = [];
      querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setMangaList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este manga?')) {
      try {
        await deleteDoc(doc(db, 'entries', id));
        toast.success('Manga eliminado correctamente');
      } catch (error) {
        toast.error('Hubo un error al eliminar.');
      }
    }
  };

  const handleIncrementChapter = async (manga: any) => {
    if (!manga.id) return;
    const currentChap = manga.currentChapter || 0;
    const totalChap = manga.totalProgress;

    if (totalChap && currentChap >= totalChap) {
      toast.info('¡Ya llegaste al capítulo final!');
      return;
    }

    try {
      const docRef = doc(db, 'entries', manga.id);
      const newData: any = { currentChapter: currentChap + 1, updatedAt: Date.now() };

      if (totalChap && currentChap + 1 === totalChap) {
        newData.status = 'completado';
        toast.success('¡Felicidades, terminaste este manga!', { duration: 4000 });
      }

      await updateDoc(docRef, newData);
    } catch (error) {
      toast.error('Error al actualizar el capítulo');
    }
  };

  const filteredAndSortedManga = useMemo(() => {
    return mangaList
      .filter((m) => (statusFilter === 'todos' || m.status === statusFilter) && m.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'recientes') return b.createdAt - a.createdAt;
        if (sortBy === 'calificacion') return (b.score || 0) - (a.score || 0);
        return a.title.localeCompare(b.title);
      });
  }, [mangaList, searchTerm, statusFilter, sortBy]);

  const displayedManga = filteredAndSortedManga.slice(0, visibleCount);

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
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={24} /></Link>
          <h1 className="text-2xl font-bold tracking-tight">Manga</h1>
        </div>
        {!(showForm || editingManga) && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
            <Plus size={18} /><span className="hidden sm:inline">Agregar</span>
          </button>
        )}
      </header>

      {!(showForm || editingManga) && mangaList.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400" /></div>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none" placeholder="Buscar manga..." />
            </div>
          </div>
        </div>
      )}

      {(showForm || editingManga) ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <MediaForm key={editingManga ? editingManga.id : 'new-form'} type="manga" initialData={editingManga} onSuccess={() => { setShowForm(false); setEditingManga(null); }} onCancel={() => { setShowForm(false); setEditingManga(null); }} />
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {loading ? ( <><SkeletonCard /><SkeletonCard /><SkeletonCard /></> ) : mangaList.length === 0 ? (
            <div className="mt-10 text-center"><Plus size={32} className="mx-auto text-gray-400 mb-4" /><h3 className="text-lg font-medium">Aún no hay mangas</h3></div>
          ) : (
            <>
              {displayedManga.map((manga) => {
                const currentChap = manga.currentChapter || 0;
                const totalChap = manga.totalProgress;
                const progressPercent = totalChap ? Math.min((currentChap / totalChap) * 100, 100) : 0;
                const isFinished = totalChap && currentChap >= totalChap;

                return (
                  <div key={manga.id} className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative group">
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => setEditingManga(manga)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md hover:text-emerald-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(manga.id)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>

                    <div className="w-24 h-36 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                      {manga.coverUrl ? <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" /> : <BookOpen className="text-gray-400" size={32} />}
                      {manga.releaseStatus === 'emision' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider backdrop-blur-sm">En Emisión</div>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-grow justify-between py-1 pr-14">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{manga.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-sm font-medium ${isFinished ? 'text-green-600 dark:text-green-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            Cap. {currentChap} {totalChap ? `/ ${totalChap}` : ''}
                          </p>
                          <button onClick={() => handleIncrementChapter(manga)} disabled={isFinished} className={`flex items-center justify-center p-1 rounded-full transition-colors active:scale-90 ${isFinished ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}>
                            <PlusCircle size={18} />
                          </button>
                        </div>
                        {totalChap > 0 && (
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div className={`h-1.5 rounded-full transition-all duration-500 ease-out ${isFinished ? 'bg-green-500' : 'bg-emerald-500'}`} style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(manga.status)}`}>{manga.status.replace('-', ' ')}</span>
                        {manga.score && <span className="text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-md">★ {manga.score}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}