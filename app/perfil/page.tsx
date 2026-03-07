// src/app/perfil/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { User, LogOut, BarChart3, CheckCircle2, PlayCircle, Film, Tv, PlaySquare, BookOpen, MonitorPlay, ScrollText, Edit2, X, Save, Sun, Moon, Monitor, Download, Upload, DatabaseBackup, Star, PieChart as PieChartIcon, Palette, Library } from 'lucide-react';
import { collection, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

// --- IMPORTACIONES PARA GRÁFICOS (RECHARTS) ---
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerfilPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  // Cambiamos a any[] para que acepte la nueva propiedad isFavorite y score si vienen
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Referencia para el input de archivo oculto (para importar)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Estados para la edición del perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Pre-llenamos datos si el usuario existe
  useEffect(() => {
    if (user) {
      setNewName(user.displayName || '');
      setNewPhotoURL(user.photoURL || '');
    }
  }, [user]);

  // Obtenemos los registros
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'entries'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: any[] = [];
      querySnapshot.forEach((docSnap) => data.push({ id: docSnap.id, ...docSnap.data() }));
      setEntries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Guardar nuevo perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName: newName, photoURL: newPhotoURL });
      toast.success('Perfil actualizado correctamente');
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error('Hubo un error al actualizar tu perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.info('Has cerrado sesión correctamente');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error('Error al intentar cerrar sesión');
    }
  };

  // Exportar Data
  const handleExportData = () => {
    if (entries.length === 0) {
      toast.error('No tienes datos para exportar.');
      return;
    }
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `harimedia_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Copia de seguridad descargada con éxito');
  };

  // Importar Data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (!Array.isArray(importedData)) throw new Error('El archivo no tiene el formato correcto.');

        setIsRestoring(true);
        toast.info('Importando y traduciendo datos, por favor espera...');

        const batch = writeBatch(db);
        let count = 0;

        importedData.forEach((item: any) => {
          if (!item.title || !item.type) return; 
          const newDocRef = doc(collection(db, 'entries'));
          
          // Extraemos los datos viejos
          const { id, userId, ...dataToSave } = item;
          
          // --- TRADUCTOR AUTOMÁTICO DE JSON ANTIGUO AL NUEVO HARIMEDIA ---
          
          // 1. Forzamos tipo y fecha
          const safeType = item.type.toLowerCase();
          const safeCreatedAt = item.createdAt || Date.now();
          
          // 2. Mapeamos las propiedades antiguas a las nuevas (si existen)
          const currentProgress = item.currentChapter ?? item.currentEpisode ?? item.chapter ?? 0;
          const finalScore = item.score ?? item.rating ?? null;
          const finalReleaseStatus = item.releaseStatus ?? item.pubStatus ?? 'terminado';
          const finalTotalProgress = item.totalProgress ?? item.totalChapters ?? null;

          // 3. Limpiamos la basura vieja para no ensuciar la base de datos
          delete dataToSave.chapter;
          delete dataToSave.rating;
          delete dataToSave.pubStatus;
          delete dataToSave.totalChapters;

          // 4. Guardamos el objeto ya traducido
          batch.set(newDocRef, { 
            ...dataToSave, 
            type: safeType,
            userId: user.uid, 
            createdAt: safeCreatedAt,
            updatedAt: Date.now(),
            
            // Asignamos las variables traducidas
            currentChapter: safeType === 'manga' || safeType === 'manhwa' ? currentProgress : 0,
            currentEpisode: safeType === 'serie' || safeType === 'anime' || safeType === 'caricatura' ? currentProgress : 0,
            score: finalScore,
            releaseStatus: finalReleaseStatus,
            totalProgress: finalTotalProgress
          });
          
          count++;
        });

        if (count > 0) {
          await batch.commit();
          toast.success(`¡Se han restaurado y traducido ${count} obras a tu bitácora!`);
        } else {
          toast.error('No se encontraron obras válidas en el archivo.');
        }

      } catch (err) {
        console.error("Error importando:", err);
        toast.error('Error al leer el archivo. Verifica el formato.');
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Estadísticas
  const stats = useMemo(() => {
    const total = entries.length;
    const completados = entries.filter(e => e.status === 'completado').length;
    const viendo = entries.filter(e => e.status === 'viendo').length;

    const porTipo = {
      pelicula: entries.filter(e => e.type === 'pelicula').length,
      serie: entries.filter(e => e.type === 'serie').length,
      anime: entries.filter(e => e.type === 'anime').length,
      manga: entries.filter(e => e.type === 'manga').length,
      caricatura: entries.filter(e => e.type === 'caricatura').length,
      manhwa: entries.filter(e => e.type === 'manhwa').length,
    };

    return { total, completados, viendo, porTipo };
  }, [entries]);

  // --- LÓGICA DE DATOS PARA LAS GRÁFICAS ---
  const chartData = useMemo(() => {
    // Para Anillo (Estados)
    const statusCounts = { completado: 0, viendo: 0, plan: 0, pausa: 0, abandonado: 0 };
    // Para Barras (Calificaciones 1 al 10)
    const scoreCounts: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0 };

    entries.forEach(e => {
      if (e.status && statusCounts[e.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[e.status as keyof typeof statusCounts]++;
      }
      if (e.score && e.score >= 1 && e.score <= 10) {
        scoreCounts[e.score]++;
      }
    });

    const statusArray = [
      { name: 'Viendo', value: statusCounts.viendo, color: '#22c55e' }, 
      { name: 'Completado', value: statusCounts.completado, color: '#3b82f6' }, 
      { name: 'Planear', value: statusCounts.plan, color: '#94a3b8' }, 
      { name: 'En Pausa', value: statusCounts.pausa, color: '#eab308' }, 
      { name: 'Abandonado', value: statusCounts.abandonado, color: '#ef4444' },
    ].filter(d => d.value > 0); 

    const scoreArray = Object.keys(scoreCounts).map(score => ({
      nota: `${score}`,
      cantidad: scoreCounts[Number(score)]
    }));

    return { statusArray, scoreArray };
  }, [entries]);

  // --- FILTRO DE FAVORITOS ---
  const favorites = useMemo(() => {
    return entries.filter(entry => entry.isFavorite === true);
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Colores para que las gráficas se vean bien en modo oscuro y claro
  const tooltipBg = theme === 'dark' ? '#1f2937' : '#ffffff';
  const tooltipColor = theme === 'dark' ? '#f3f4f6' : '#111827';
  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  // Nota: Agregamos overflow-x-hidden al contenedor principal para evitar que el scroll horizontal rompa el diseño.
  return (
    <div className="pb-24 overflow-x-hidden">
      
      {/* Contenedor con padding para el contenido estándar */}
      <div className="p-5">
        {/* 1. CABECERA DEL PERFIL */}
        <header className="relative py-8 mb-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
          {!isEditingProfile ? (
            <div className="flex flex-col items-center justify-center">
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Edit2 size={20} />
              </button>
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-950 shadow-md overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={48} />
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.displayName || 'Usuario'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="px-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold mb-4 w-full text-center">Editar Perfil</h2>
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tu Nombre</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej. Alex" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">URL de tu foto</label>
                  <input type="url" value={newPhotoURL} onChange={(e) => setNewPhotoURL(e.target.value)} placeholder="https://ejemplo.com/mifoto.jpg" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="flex w-full gap-3 mt-6">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <X size={18} /> Cancelar
                </button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {isUpdating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />} Guardar
                </button>
              </div>
            </form>
          )}
        </header>

        {/* 2. RESUMEN GENERAL */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" /> Resumen General
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</span>
              <span className="text-xs font-semibold text-gray-500 uppercase mt-1">Obras Totales</span>
            </div>
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400 block">{stats.viendo}</span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-500 uppercase">Viendo ahora</span>
                </div>
                <PlayCircle size={24} className="text-blue-400 opacity-50" />
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400 block">{stats.completados}</span>
                  <span className="text-[10px] font-semibold text-green-600 dark:text-green-500 uppercase">Completados</span>
                </div>
                <CheckCircle2 size={24} className="text-green-400 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* --- GRÁFICAS DE ESTADÍSTICAS AVANZADAS --- */}
        {entries.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieChartIcon size={20} className="text-indigo-500" /> Análisis de Consumo
            </h2>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 text-center">Estado de tus Obras</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusArray}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.statusArray.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', color: tooltipColor, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: tooltipColor, fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {chartData.statusArray.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 text-center">Tus Calificaciones (1-10)</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.scoreArray} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="nota" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: theme === 'dark' ? '#374151' : '#f3f4f6' }}
                      contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', color: tooltipColor, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Bar dataKey="cantidad" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. FAVORITOS - DISEÑO FLUIDO DE BORDE A BORDE */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <div className="px-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" fill="currentColor" /> Favoritos
            </h2>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 px-5 snap-x hide-scrollbar">
            {favorites.map((fav, index) => (
              <div 
                key={fav.id} 
                className={`snap-start shrink-0 w-32 flex flex-col gap-2 ${index === favorites.length - 1 ? 'pr-5' : ''}`}
              >
                <div className="w-32 h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100 dark:border-gray-800">
                  {fav.coverUrl ? (
                    <img src={fav.coverUrl} alt={fav.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Star className="text-gray-400" /></div>
                  )}
                  {fav.score && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                      ★ {fav.score}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-1 px-1">{fav.title}</h3>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase px-1">{fav.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenedor con padding para el resto del contenido */}
      <div className="px-5">
        {/* 4. SELECTOR DE TEMA */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Palette size={20} className="text-pink-500" /> Apariencia
          </h2>
          <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Sun size={18} /> Claro
            </button>
            <button onClick={() => setTheme('system')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${theme === 'system' ? 'bg-gray-100 dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Monitor size={18} /> Sistema
            </button>
            <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Moon size={18} /> Oscuro
            </button>
          </div>
        </div>

        {/* 5. RESPALDO DE DATOS */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DatabaseBackup size={20} className="text-emerald-500" /> Respaldo de Datos
          </h2>
          <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button 
              onClick={handleExportData}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download size={18} className="text-blue-500" /> Descargar JSON
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isRestoring ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div> : <Upload size={18} className="text-emerald-500" />}
              Restaurar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center px-4">
            Descarga un archivo .json con toda tu información o restaura una copia anterior.
          </p>
        </div>

        {/* 6. TU COLECCIÓN */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Library size={20} className="text-indigo-500" /> Tu Colección
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3"><div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><Film size={18} /></div><span className="font-medium">Películas</span></div>
              <span className="font-bold text-gray-500">{stats.porTipo.pelicula}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Tv size={18} /></div><span className="font-medium">Series</span></div>
              <span className="font-bold text-gray-500">{stats.porTipo.serie}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><PlaySquare size={18} /></div><span className="font-medium">Anime</span></div>
              <span className="font-bold text-gray-500">{stats.porTipo.anime}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><BookOpen size={18} /></div><span className="font-medium">Manga</span></div>
              <span className="font-bold text-gray-500">{stats.porTipo.manga}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-lg"><MonitorPlay size={18} /></div><span className="font-medium">Caricaturas</span></div>
              <span className="font-bold text-gray-500">{stats.porTipo.caricatura}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3"><div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><ScrollText size={18} /></div><span className="font-medium">Manhwa</span></div>
              <span className="font-bold text-gray-500">{stats.porTipo.manhwa}</span>
            </div>
          </div>
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 dark:bg-red-900/10 dark:text-red-500 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/30 transition-colors">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}