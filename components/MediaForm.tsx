// src/components/MediaForm.tsx
"use client";

import { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MediaType, MediaStatus } from '@/types';
import { toast } from 'sonner';
import { Image as ImageIcon, Heart } from 'lucide-react'; // <-- Importamos el Corazón

interface MediaFormProps {
  type: MediaType;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export default function MediaForm({ type, onSuccess, onCancel, initialData }: MediaFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(initialData?.title || '');
  const [status, setStatus] = useState<MediaStatus>(initialData?.status || 'plan');
  const [score, setScore] = useState<number | ''>(initialData?.score || '');
  const [review, setReview] = useState(initialData?.review || '');
  
  const initialProgress = initialData?.currentEpisode ?? initialData?.currentChapter ?? '';
  const [currentProgress, setCurrentProgress] = useState<number | ''>(initialProgress);
  const [currentSeason, setCurrentSeason] = useState<number | ''>(initialData?.currentSeason ?? '');
  
  // --- NUEVOS ESTADOS ---
  const [releaseStatus, setReleaseStatus] = useState<'terminado' | 'emision'>(initialData?.releaseStatus || 'terminado');
  const [totalProgress, setTotalProgress] = useState<number | ''>(initialData?.totalProgress || '');

  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || '');
  const [director, setDirector] = useState(initialData?.director || '');
  const [year, setYear] = useState<number | ''>(initialData?.year || '');
  const [genre, setGenre] = useState(initialData?.genre || '');

  // --- ESTADO PARA FAVORITOS ---
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite || false);

  const isEpisodic = ['serie', 'anime', 'caricatura'].includes(type);
  const isReading = ['manga', 'manhwa'].includes(type);
  const showExtraFields = type !== 'manhwa';
  const isEditing = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const mediaData: any = {
        userId: user.uid,
        title,
        type,
        status,
        score: score === '' ? null : Number(score),
        coverUrl,
        review,
        isFavorite, // <-- Guardamos si es favorito en la base de datos
        updatedAt: Date.now(),
      };

      if (!isEditing) mediaData.createdAt = Date.now();

      if (showExtraFields) {
        mediaData.director = director;
        mediaData.year = year === '' ? null : Number(year);
        mediaData.genre = genre;
      }

      if (isEpisodic || isReading) {
        mediaData.releaseStatus = releaseStatus;
        mediaData.totalProgress = totalProgress === '' ? null : Number(totalProgress);
      }

      if (isEpisodic) {
        mediaData.currentEpisode = currentProgress === '' ? 0 : Number(currentProgress);
        mediaData.currentSeason = currentSeason === '' ? null : Number(currentSeason);
      } else if (isReading) {
        mediaData.currentChapter = currentProgress === '' ? 0 : Number(currentProgress);
      }

      if (isEditing) {
        const docRef = doc(db, 'entries', initialData.id);
        await updateDoc(docRef, mediaData);
        toast.success(`${type} actualizada correctamente`);
      } else {
        await addDoc(collection(db, 'entries'), mediaData);
        toast.success(`${type} agregada a tu bitácora`);
      }
      
      onSuccess();
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'guardar'}.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 relative">
      
      {/* --- BOTÓN DE FAVORITO EN LA ESQUINA --- */}
      <button
        type="button"
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-5 right-5 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
        title="Añadir a Favoritos"
      >
        <Heart 
          size={26} 
          className={isFavorite ? "text-red-500" : "text-gray-300 dark:text-gray-600"} 
          fill={isFavorite ? "currentColor" : "none"} 
        />
      </button>

      <h3 className="text-xl font-bold mb-4 capitalize pr-10">
        {isEditing ? `Editar ${type}` : `Agregar ${type}`}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Vista previa de Portada y Título */}
        <div className="flex gap-4">
          <div className="w-20 h-28 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
            {coverUrl ? (
              <img 
                src={coverUrl} 
                alt="Vista previa" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} 
              />
            ) : (
              <ImageIcon size={28} className="text-gray-400" />
            )}
          </div>
          
          <div className="flex-grow space-y-3 flex flex-col justify-center">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">URL de Portada</label>
              <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="https://..." />
            </div>
          </div>
        </div>

        {showExtraFields && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Director/Creador</label>
              <input type="text" value={director} onChange={(e) => setDirector(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Año</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Género</label>
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Ciencia Ficción, Drama" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estado en lista</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as MediaStatus)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option className="dark:bg-gray-800" value="plan">Planear ver</option>
              <option className="dark:bg-gray-800" value="viendo">Viendo / Leyendo</option>
              <option className="dark:bg-gray-800" value="completado">Completado</option>
              <option className="dark:bg-gray-800" value="pausa">En pausa</option>
              <option className="dark:bg-gray-800" value="abandonado">Abandonado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mi Nota (1-10)</label>
            <input type="number" min="1" max="10" value={score} onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* --- SECCIÓN DE PROGRESO Y EMISIÓN --- */}
        {(isEpisodic || isReading) && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Publicación</label>
                <select value={releaseStatus} onChange={(e) => setReleaseStatus(e.target.value as any)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option className="dark:bg-gray-800" value="terminado">Terminada</option>
                  <option className="dark:bg-gray-800" value="emision">En Emisión</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Total de {isEpisodic ? 'Eps.' : 'Caps.'}</label>
                <input type="number" min="1" value={totalProgress} onChange={(e) => setTotalProgress(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. 24" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {isEpisodic && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Temporada</label>
                  <input type="number" min="1" value={currentSeason} onChange={(e) => setCurrentSeason(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Opcional" />
                </div>
              )}
              <div className={!isEpisodic ? "col-span-2" : ""}>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Progreso Actual</label>
                <input type="number" min="0" value={currentProgress} onChange={(e) => setCurrentProgress(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. 5" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Reseña o Notas</label>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder="Tus pensamientos sobre esta obra..." />
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
}