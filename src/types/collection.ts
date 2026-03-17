// src/types/collection.ts

export type CollectionIcon =
  | "heart"
  | "bookmark"
  | "star"
  | "trophy"
  | "clock"
  | "list"
  | "flame"
  | "eye";

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: CollectionIcon;
  color: string;          // Tailwind color key: "violet" | "emerald" | "blue" | etc.
  entryIds: string[];     // IDs de MediaEntry en orden
  isPinned: boolean;      // Aparece en el dashboard
  isDefault: boolean;     // No se puede eliminar (Favoritos, Quiero ver, Top 10)
  createdAt: Date;
  updatedAt: Date;
}

export type CollectionCreatePayload = Omit<
  Collection,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

// ─── Colecciones predefinidas ────────────────────────────────────────────────

export const DEFAULT_COLLECTIONS: Omit<
  Collection,
  "id" | "userId" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Favoritos",
    description: "Las obras que más te han marcado",
    icon: "heart",
    color: "pink",
    entryIds: [],
    isPinned: true,
    isDefault: true,
  },
  {
    name: "Quiero ver",
    description: "Tu lista de pendientes",
    icon: "bookmark",
    color: "violet",
    entryIds: [],
    isPinned: true,
    isDefault: true,
  },
  {
    name: "Top 10",
    description: "Tus 10 obras favoritas de todos los tiempos",
    icon: "trophy",
    color: "amber",
    entryIds: [],
    isPinned: true,
    isDefault: true,
  },
];