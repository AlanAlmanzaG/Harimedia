// src/components/MediaForm.tsx
"use client";

import { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MediaType, MediaStatus } from '@/types';

interface MediaFormProps {
  type: MediaType;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any; // Agregamos esta propiedad opcional para recibir los datos a editar
}

export default function MediaForm({ type, onSuccess, onCancel, initialData }: MediaFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializamos los estados con los datos de initialData si existen (Modo Edición),
  // o con valores vacíos si no existen (Modo Creación).
  const [title, setTitle] = useState(initialData?.title || '');
  const [status, setStatus] = useState<MediaStatus>(initialData?.status || 'plan');
  const [score, setScore] = useState<number | ''>(initialData?.score || '');
  const [review, setReview] = useState(initialData?.review || '');
  
  // Para el progreso, verificamos si viene currentEpisode o currentChapter
  const initialProgress = initialData?.currentEpisode ?? initialData?.currentChapter ?? '';
  const [currentProgress, setCurrentProgress] = useState<number | ''>(initialProgress);
  const [currentSeason, setCurrentSeason] = useState<number | ''>(initialData?.currentSeason ?? ''); // <-- NUEVO ESTADO
  
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || '');
  const [director, setDirector] = useState(initialData?.director || '');
  const [year, setYear] = useState<number | ''>(initialData?.year || '');
  const [genre, setGenre] = useState(initialData?.genre || '');

  const isEpisodic = ['serie', 'anime', 'caricatura'].includes(type);
  const isReading = ['manga', 'manhwa'].includes(type);
  const showExtraFields = type !== 'manhwa';

  const isEditing = !!initialData?.id; // Sabemos que estamos editando si initialData tiene un ID

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
        updatedAt: Date.now(), // Siempre actualizamos esta fecha
      };

      // Si estamos creando, agregamos la fecha de creación
      if (!isEditing) {
        mediaData.createdAt = Date.now();
      }

      if (showExtraFields) {
        mediaData.director = director;
        mediaData.year = year === '' ? null : Number(year);
        mediaData.genre = genre;
      }

      if (isEpisodic) {
        mediaData.currentEpisode = currentProgress === '' ? 0 : Number(currentProgress);
        mediaData.currentSeason = currentSeason === '' ? null : Number(currentSeason); // <-- NUEVO
      } else if (isReading) {
        mediaData.currentChapter = currentProgress === '' ? 0 : Number(currentProgress);
      }

      if (isEditing) {
        // Modo Edición: Actualizamos el documento específico usando doc() y updateDoc()
        const docRef = doc(db, 'entries', initialData.id);
        await updateDoc(docRef, mediaData);
      } else {
        // Modo Creación: Añadimos un documento nuevo a la colección
        await addDoc(collection(db, 'entries'), mediaData);
      }
      
      onSuccess();
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'guardar'}. Inténtalo de nuevo.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-4 capitalize">
        {isEditing ? `Editar ${type}` : `Agregar ${type}`}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (Todo el resto del formulario queda exactamente igual que antes) ... */}
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL de la Portada (Imagen)</label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        {showExtraFields && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Director/Creador</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Año</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Género</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Ciencia Ficción, Drama"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MediaStatus)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="plan">Planear ver</option>
              <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="viendo">Viendo / Leyendo</option>
              <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="completado">Completado</option>
              <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="pausa">En pausa</option>
              <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="abandonado">Abandonado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Calificación (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={score}
              onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {(isEpisodic || isReading) && (
          <div className="grid grid-cols-2 gap-4">
            {/* Si es serie, anime o caricatura, mostramos el campo de Temporada */}
            {isEpisodic && (
              <div>
                <label className="block text-sm font-medium mb-1">Temporada</label>
                <input
                  type="number"
                  min="1"
                  value={currentSeason}
                  onChange={(e) => setCurrentSeason(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. 1"
                />
              </div>
            )}
            
            {/* El campo de episodio/capítulo. Si isEpisodic es falso (mangas), ocupará el 100% del ancho (col-span-2) */}
            <div className={!isEpisodic ? "col-span-2" : ""}>
              <label className="block text-sm font-medium mb-1">
                {isEpisodic ? 'Episodio actual' : 'Capítulo actual'}
              </label>
              <input
                type="number"
                min="0"
                value={currentProgress}
                onChange={(e) => setCurrentProgress(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. 5"
              />
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
}