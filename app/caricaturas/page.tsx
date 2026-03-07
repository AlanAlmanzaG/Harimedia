// src/app/caricaturas/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, MonitorPlay, Edit2, Trash2, Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import MediaForm from '@/components/MediaForm';
import SkeletonCard from '@/components/SkeletonCard';
import { toast } from 'sonner';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Episodic, MediaStatus } from '@/types';

export default function CaricaturasPage() {
  const { user } = useAuth();
  
  const [caricaturasList, setCaricaturasList] = useState<Episodic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCaricatura, setEditingCaricatura] = useState<Episodic | null>(null);

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
      where('type', '==', 'caricatura'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: Episodic[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Episodic);
      });
      setCaricaturasList(data);
      setLoading(false);
    }, (error) => {
      console.error("Error obteniendo caricaturas: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este anime de tu bitácora?')) {
      try {
        await deleteDoc(doc(db, 'entries', id));
        toast.success('Eliminado correctamente'); // <-- Notificación
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error('Hubo un error al eliminar. Inténtalo de nuevo.'); // <-- Notificación
      }
    }
  };

  const handleIncrementEpisode = async (id: string | undefined, currentEp: number = 0) => {
    if (!id) return;
    try {
      const docRef = doc(db, 'entries', id);
      await updateDoc(docRef, {
        currentEpisode: currentEp + 1,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error al incrementar episodio:", error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCaricatura(null);
  };

  const filteredAndSortedCaricaturas = useMemo(() => {
    return caricaturasList
      .filter((caricatura) => {
        const matchesSearch = caricatura.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (caricatura.director && caricatura.director.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'todos' || caricatura.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'recientes') return b.createdAt - a.createdAt;
        if (sortBy === 'calificacion') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'alfabetico') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [caricaturasList, searchTerm, statusFilter, sortBy]);

  const displayedCaricaturas = filteredAndSortedCaricaturas.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedCaricaturas.length;

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
          <h1 className="text-2xl font-bold tracking-tight">Caricaturas</h1>
        </div>
        
        {!(showForm || editingCaricatura) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-yellow-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}
      </header>

      {!(showForm || editingCaricatura) && caricaturasList.length > 0 && (
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                placeholder="Buscar caricatura o creador..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${showFilters ? 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
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
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none"
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
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none"
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

      {(showForm || editingCaricatura) ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <MediaForm 
            key={editingCaricatura ? editingCaricatura.id : 'new-form'}
            type="caricatura" 
            initialData={editingCaricatura} 
            onSuccess={handleCloseForm} 
            onCancel={handleCloseForm} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : caricaturasList.length === 0 ? (
            <div className="mt-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aún no hay caricaturas</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Toca el botón de agregar para registrar tu primera caricatura.
              </p>
            </div>
          ) : (
            <>
              {displayedCaricaturas.map((caricatura) => (
                <div key={caricatura.id} className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative group">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => setEditingCaricatura(caricatura)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-yellow-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(caricatura.id)} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-md hover:text-red-600"><Trash2 size={16} /></button>
                  </div>

                  <div className="w-24 h-36 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {caricatura.coverUrl ? (
                      <img src={caricatura.coverUrl} alt={caricatura.title} className="w-full h-full object-cover" />
                    ) : (
                      <MonitorPlay className="text-gray-400" size={32} />
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-grow justify-between py-1 pr-14">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{caricatura.title}</h3>
                      {caricatura.director && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{caricatura.director}</p>}
                      
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                          {caricatura.currentSeason ? `T${caricatura.currentSeason} • ` : ''} 
                          Episodio: {caricatura.currentEpisode || 0}
                        </p>
                        <button
                          onClick={() => handleIncrementEpisode(caricatura.id, caricatura.currentEpisode)}
                          className="flex items-center justify-center p-1 rounded-full text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors active:scale-90"
                        >
                          <PlusCircle size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(caricatura.status)}`}>
                        {caricatura.status.replace('-', ' ')}
                      </span>
                      {caricatura.score && (
                        <span className="text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-md">
                          ★ {caricatura.score}/10
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