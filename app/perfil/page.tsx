// src/app/perfil/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { User, LogOut, BarChart3, CheckCircle2, PlayCircle, Film, Tv, PlaySquare, BookOpen, MonitorPlay, ScrollText, Edit2, X, Save } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MediaEntry } from '@/types';
import { toast } from 'sonner'; // <-- Importamos las notificaciones

export default function PerfilPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para la edición del perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Cuando el usuario carga, pre-llenamos sus datos en el formulario
  useEffect(() => {
    if (user) {
      setNewName(user.displayName || '');
      setNewPhotoURL(user.photoURL || '');
    }
  }, [user]);

  // Obtenemos TODOS los registros del usuario para calcular las estadísticas
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: MediaEntry[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as MediaEntry);
      });
      setEntries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Función para guardar el nuevo nombre y foto
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateProfile(user, {
        displayName: newName,
        photoURL: newPhotoURL
      });
      toast.success('Perfil actualizado correctamente');
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error('Hubo un error al actualizar tu perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.info('Has cerrado sesión correctamente');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error('Error al intentar cerrar sesión');
    }
  };

  // Calculamos las estadísticas usando useMemo
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-5 pb-24">
      {/* Cabecera del Perfil Dinámica */}
      <header className="relative py-8 mb-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
        
        {/* Si NO estamos editando, mostramos la info normal */}
        {!isEditingProfile ? (
          <div className="flex flex-col items-center justify-center">
            {/* Botón de editar arriba a la derecha */}
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="Editar perfil"
            >
              <Edit2 size={20} />
            </button>

            {/* Foto de perfil o Icono default */}
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
          /* MODO EDICIÓN: Formulario para cambiar nombre y foto */
          <form onSubmit={handleUpdateProfile} className="px-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-lg font-bold mb-4 w-full text-center">Editar Perfil</h2>
            
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Alex"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">URL de tu foto</label>
                <input
                  type="url"
                  value={newPhotoURL}
                  onChange={(e) => setNewPhotoURL(e.target.value)}
                  placeholder="https://ejemplo.com/mifoto.jpg"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex w-full gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setNewName(user?.displayName || '');
                  setNewPhotoURL(user?.photoURL || '');
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} /> Cancelar
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />}
                Guardar
              </button>
            </div>
          </form>
        )}
      </header>

      {/* Sección de Estadísticas Principales */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-500" />
          Resumen General
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

      {/* Desglose por Categoría */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Tu Colección</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><Film size={18} /></div>
              <span className="font-medium">Películas</span>
            </div>
            <span className="font-bold text-gray-500">{stats.porTipo.pelicula}</span>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Tv size={18} /></div>
              <span className="font-medium">Series</span>
            </div>
            <span className="font-bold text-gray-500">{stats.porTipo.serie}</span>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><PlaySquare size={18} /></div>
              <span className="font-medium">Anime</span>
            </div>
            <span className="font-bold text-gray-500">{stats.porTipo.anime}</span>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><BookOpen size={18} /></div>
              <span className="font-medium">Manga</span>
            </div>
            <span className="font-bold text-gray-500">{stats.porTipo.manga}</span>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-lg"><MonitorPlay size={18} /></div>
              <span className="font-medium">Caricaturas</span>
            </div>
            <span className="font-bold text-gray-500">{stats.porTipo.caricatura}</span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><ScrollText size={18} /></div>
              <span className="font-medium">Manhwa</span>
            </div>
            <span className="font-bold text-gray-500">{stats.porTipo.manhwa}</span>
          </div>

        </div>
      </div>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 dark:bg-red-900/10 dark:text-red-500 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/30 transition-colors"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  );
}