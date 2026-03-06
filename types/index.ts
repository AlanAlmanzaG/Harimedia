// src/types/index.ts

// Los tipos de contenido que soporta Harimedia
export type MediaType = 'pelicula' | 'serie' | 'anime' | 'manga' | 'caricatura' | 'manhwa';

// Los estados posibles para cualquier contenido
export type MediaStatus = 'viendo' | 'completado' | 'pausa' | 'abandonado' | 'plan';

// Campos que TODOS los elementos comparten (La base)
// src/types/index.ts (Solo actualiza BaseMedia)
export interface BaseMedia {
  id?: string;
  userId: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  score?: number;
  coverUrl?: string; // <-- Ya lo teníamos preparado
  director?: string; // <-- Nuevo
  year?: number;     // <-- Nuevo
  genre?: string;    // <-- Nuevo
  review?: string;
  createdAt: number;
  updatedAt: number;
}
// ... deja el resto del archivo igual

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