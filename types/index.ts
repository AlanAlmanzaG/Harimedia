// src/types/index.ts

// Los tipos de contenido que soporta Harimedia
export type MediaType = 'pelicula' | 'serie' | 'anime' | 'manga' | 'caricatura' | 'manhwa';

// Los estados posibles para cualquier contenido
export type MediaStatus = 'viendo' | 'completado' | 'pausa' | 'abandonado' | 'plan';

// Campos que TODOS los elementos comparten (La base)
export interface BaseMedia {
  id?: string; // Es opcional porque al crear un registro nuevo, Firebase genera el ID
  userId: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  score?: number; // Calificacion del 1 al 10, opcional
  coverUrl?: string; // URL de la imagen de portada, opcional
  review?: string; // Notas personales o reseña
  createdAt: number; // Guardaremos la fecha en milisegundos para mayor compatibilidad
  updatedAt: number;
}

// Especifico para Peliculas (Sin capitulos)
export interface Movie extends BaseMedia {
  type: 'pelicula';
  durationMinutes?: number; 
  director?: string;
}

// Especifico para contenido en video por episodios (Series, Anime, Caricaturas)
export interface Episodic extends BaseMedia {
  type: 'serie' | 'anime' | 'caricatura';
  currentEpisode: number;
  totalEpisodes?: number;
  currentSeason?: number;
}

// Especifico para contenido de lectura (Manga, Manhwa)
export interface Reading extends BaseMedia {
  type: 'manga' | 'manhwa';
  currentChapter: number;
  totalChapters?: number;
  currentVolume?: number;
}

// Un tipo general que agrupa todos para usar en nuestras listas
export type MediaEntry = Movie | Episodic | Reading;