// src/hooks/useCollections.ts
"use client";

import { useEffect, useState } from "react";
import { subscribeCollections, initDefaultCollections } from "@/lib/firebase/collections";
import type { Collection } from "@/types/collection";

export function useCollections(uid: string | undefined) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    // Inicializar colecciones por defecto si es la primera vez
    initDefaultCollections(uid).catch(console.error);

    const unsubscribe = subscribeCollections(uid, (data) => {
      // Ordenar: pinned primero, luego por nombre
      const sorted = [...data].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.name.localeCompare(b.name);
      });
      setCollections(sorted);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { collections, loading };
}