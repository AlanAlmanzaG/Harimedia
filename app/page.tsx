// src/app/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Film, Tv, PlaySquare, BookOpen, MonitorPlay, ScrollText, Flame, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

export default function HomePage() {
  const { user } = useAuth();
  
  // Estados para cargar los datos y mostrar estadísticas/actividad reciente
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Traemos todo para calcular estadísticas y actividad
    const q = query(collection(db, 'entries'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: any[] = [];
      querySnapshot.forEach((docSnap) => data.push({ id: docSnap.id, ...docSnap.data() }));
      setEntries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Filtramos solo las obras "Viendo" que tengan episodios/capítulos y las ordenamos por más recientes
  const recentActivity = useMemo(() => {
    return entries
      .filter(e => e.status === 'viendo' && e.type !== 'pelicula')
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 5); // Mostramos solo los últimos 5
  }, [entries]);

  const totalEntries = entries.length;

  // Lógica para aumentar episodio directo desde la pantalla de inicio
  const handleIncrement = async (entry: any) => {
    if (!entry.id) return;

    const isEpisodic = ['serie', 'anime', 'caricatura'].includes(entry.type);
    const currentProgress = isEpisodic ? (entry.currentEpisode || 0) : (entry.currentChapter || 0);
    const totalProgress = entry.totalProgress;

    if (totalProgress && currentProgress >= totalProgress) {
      toast.info('¡Ya llegaste al final!');
      return;
    }

    try {
      const docRef = doc(db, 'entries', entry.id);
      const newData: any = { updatedAt: Date.now() };

      if (isEpisodic) {
        newData.currentEpisode = currentProgress + 1;
        if (totalProgress && currentProgress + 1 === totalProgress) newData.status = 'completado';
      } else {
        newData.currentChapter = currentProgress + 1;
        if (totalProgress && currentProgress + 1 === totalProgress) newData.status = 'completado';
      }

      if (newData.status === 'completado') {
         toast.success(`¡Felicidades, terminaste ${entry.title}!`, { duration: 4000 });
      }

      await updateDoc(docRef, newData);
    } catch (error) {
      toast.error('Error al actualizar el progreso');
    }
  };

  // Definición de las categorías con sus nuevos gradientes y sombras
  const categories = [
    { href: '/peliculas', name: 'Películas', icon: Film, bg: 'bg-gradient-to-br from-red-500 to-red-700', shadow: 'shadow-red-500/40' },
    { href: '/series', name: 'Series', icon: Tv, bg: 'bg-gradient-to-br from-blue-500 to-blue-700', shadow: 'shadow-blue-500/40' },
    { href: '/anime', name: 'Anime', icon: PlaySquare, bg: 'bg-gradient-to-br from-purple-500 to-purple-700', shadow: 'shadow-purple-500/40' },
    { href: '/manga', name: 'Manga', icon: BookOpen, bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/40' },
    { href: '/caricaturas', name: 'Caricaturas', icon: MonitorPlay, bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', shadow: 'shadow-yellow-500/40' },
    { href: '/manhwa', name: 'Manhwa', icon: ScrollText, bg: 'bg-gradient-to-br from-orange-400 to-orange-600', shadow: 'shadow-orange-500/40' },
  ];

  return (
    <div className="pb-24 overflow-x-hidden">
      
      {/* 1. CABECERA Y PÍLDORA DE ESTADÍSTICAS */}
      <div className="p-5">
        <header className="mb-6 mt-4">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Harimedia
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">¿Qué vamos a registrar hoy?</p>
          
          {/* Píldora que se muestra solo cuando ya cargaron los datos */}
          {!loading && (
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold mt-4 shadow-sm border border-blue-200 dark:border-blue-800/50 animate-in fade-in slide-in-from-left-4">
              <Flame size={16} className="text-orange-500" fill="currentColor" />
              <span>{totalEntries} obras en tu bitácora</span>
            </div>
          )}
        </header>
      </div>

      {/* 2. SECCIÓN: CONTINUAR VIENDO (Solo aparece si hay algo en proceso) */}
      {!loading && recentActivity.length > 0 && (
        <div className="mb-8">
          <div className="px-5 mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Continuar viendo...</h2>
          </div>
          
          {/* Carrusel de Actividad Reciente fluido de lado a lado */}
          <div className="flex overflow-x-auto gap-4 pb-4 px-5 snap-x hide-scrollbar">
            {recentActivity.map((entry, index) => {
              const isEpisodic = ['serie', 'anime', 'caricatura'].includes(entry.type);
              const current = isEpisodic ? (entry.currentEpisode || 0) : (entry.currentChapter || 0);
              const total = entry.totalProgress;
              const progressPercent = total ? Math.min((current / total) * 100, 100) : 0;
              const isFinished = total && current >= total;

              return (
                <div key={entry.id} className={`snap-start shrink-0 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col relative group ${index === recentActivity.length - 1 ? 'pr-5' : ''}`}>
                  
                  {/* Imagen (Banner) */}
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
                    {entry.coverUrl ? (
                      <img src={entry.coverUrl} className="w-full h-full object-cover" alt={entry.title} />
                    ) : (
                      <ImageIcon className="m-auto h-full text-gray-400 opacity-50" size={40} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <h3 className="font-bold text-sm line-clamp-1">{entry.title}</h3>
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">{entry.type}</p>
                    </div>
                  </div>
                  
                  {/* Controles de progreso rápidos */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        {isEpisodic ? 'Ep' : 'Cap'}. {current} {total ? `/ ${total}` : ''}
                      </span>
                      <button 
                        onClick={() => handleIncrement(entry)} 
                        disabled={isFinished} 
                        className={`p-1.5 rounded-xl transition-all active:scale-90 ${
                          isFinished 
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-400'
                        }`}
                      >
                        <PlusCircle size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                    {total > 0 && (
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TUS CATEGORÍAS (Menú Principal con Rediseño) */}
      <div className="px-5">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tus Categorías</h2>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`
                ${cat.bg} hover:shadow-xl ${cat.shadow} 
                relative overflow-hidden text-white p-5 rounded-3xl flex flex-col items-start justify-end 
                min-h-[130px] transition-all duration-300 transform hover:-translate-y-1 hover:brightness-110 active:scale-95 group
              `}
            >
              {/* Icono de fondo gigante y sutil (Decorativo) */}
              <cat.icon 
                size={110} 
                className="absolute -right-6 -bottom-6 opacity-20 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500" 
                strokeWidth={1.5} 
              />
              
              {/* Icono pequeño principal dentro de un círculo con efecto "glass" */}
              <div className="bg-white/25 backdrop-blur-md p-2.5 rounded-2xl mb-auto shadow-sm">
                <cat.icon size={26} strokeWidth={2.5} className="text-white drop-shadow-sm" />
              </div>
              
              <span className="font-extrabold text-lg mt-3 z-10 drop-shadow-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
    </div>
  );
}