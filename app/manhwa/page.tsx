// src/app/manhwa/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, ScrollText, Edit2, Trash2, Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import MediaForm from '@/components/MediaForm';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Reading, MediaStatus } from '@/types';

export default function ManhwaPage() {
  const { user } = useAuth();
  
  const [manhwaList, setManhwaList] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManhwa, setEditingManhwa] = useState<Reading | null>(null);

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
      where('type', '==', 'manhwa'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: Reading[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Reading);
      });
      setManhwaList(data);
      setLoading(false);
    }, (error) => {
      console.error("Error obteniendo manhwa: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este manhwa de tu bitácora?')) {
      await deleteDoc(doc(db, 'entries', id));
    }
  };

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
    setEditingManhwa(null);
  };

  const filteredAndSortedManhwa = useMemo(() => {
    return manhwaList
      .filter((manhwa) => {
        const matchesSearch = manhwa.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || manhwa.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'recientes') return b.createdAt - a.createdAt;
        if (sortBy === 'calificacion') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'alfabetico') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [manhwaList, searchTerm, statusFilter, sortBy]);

  const displayedManhwa = filteredAndSortedManhwa.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedManhwa.length;

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
          <h1 className="text-2xl font-bold tracking-tight">Manhwa</h1>
        </div>
        
        {!(showForm || editingManhwa) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}
      </header>

      {!(showForm || editingManhwa) && manhwaList.length > 0 && (
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                placeholder="Buscar manhwa..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
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
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
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
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
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

      {(showForm || editingManhwa) ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <MediaForm 
            key={editingManhwa ? editingManhwa.id : 'new-form'}
            type="manhwa" 
            initialData={editingManhwa} 
            onSuccess={handleCloseForm} 
            onCancel={handleCloseForm} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Cargando tu colección...</div>
          ) : manhwaList.length === 0 ? (
            <div className="mt-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aún no hay manhwa</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Toca el botón de agregar para registrar tu primer manhwa.
              </p>
            </div>
          ) : (
            <>
              {displayedManhwa.map((manhwa) => (
                <div key={manhwa.id} className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative group">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => setEditingManhwa(manhwa)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-orange-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(manhwa.id)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-red-600"><Trash2 size={16} /></button>
                  </div>

                  <div className="w-24 h-36 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {manhwa.coverUrl ? (
                      <img src={manhwa.coverUrl} alt={manhwa.title} className="w-full h-full object-cover" />
                    ) : (
                      <ScrollText className="text-gray-400" size={32} />
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-grow justify-between py-1 pr-14">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-3">{manhwa.title}</h3>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-500">
                          Capítulo actual: {manhwa.currentChapter || 0}
                        </p>
                        <button
                          onClick={() => handleIncrementChapter(manhwa.id, manhwa.currentChapter)}
                          className="flex items-center justify-center p-1 rounded-full text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors active:scale-90"
                        >
                          <PlusCircle size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(manhwa.status)}`}>
                        {manhwa.status.replace('-', ' ')}
                      </span>
                      {manhwa.score && (
                        <span className="text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-md">
                          ★ {manhwa.score}/10
                        </span>
                      )}
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