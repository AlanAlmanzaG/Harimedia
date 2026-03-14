// src/hooks/useLibrary.ts
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { MediaEntry, MediaType, MediaStatus } from "@/types/media";

export interface LibraryFilters {
  mediaType?: MediaType | "ALL";
  status?: MediaStatus | "ALL";
  sortBy?: "updatedAt" | "createdAt" | "title" | "rating";
  sortDir?: "asc" | "desc";
}

interface UseLibraryReturn {
  entries: MediaEntry[];
  loading: boolean;
  error: string | null;
  total: number;
}

export function useLibrary(
  uid: string | undefined,
  filters: LibraryFilters = {}
): UseLibraryReturn {
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    mediaType = "ALL",
    status = "ALL",
    sortBy = "updatedAt",
    sortDir = "desc",
  } = filters;

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    setError(null);

    const constraints: QueryConstraint[] = [];

    if (mediaType !== "ALL") {
      constraints.push(where("mediaType", "==", mediaType));
    }
    if (status !== "ALL") {
      constraints.push(where("status", "==", status));
    }

    // Firestore requiere índice compuesto para where + orderBy en campos distintos.
    // Si sortBy es "title" o "rating" con filtros activos, ordenamos en cliente.
    const canSortInFirestore =
      sortBy === "updatedAt" || sortBy === "createdAt" ||
      (mediaType === "ALL" && status === "ALL");

    if (canSortInFirestore) {
      constraints.push(orderBy(sortBy, sortDir));
    } else {
      constraints.push(orderBy("updatedAt", "desc"));
    }

    const q = query(
      collection(db, "users", uid, "entries"),
      ...constraints
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        let data: MediaEntry[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            ...raw,
            id: d.id,
            startDate: raw.startDate?.toDate(),
            endDate: raw.endDate?.toDate(),
            createdAt: raw.createdAt?.toDate(),
            updatedAt: raw.updatedAt?.toDate(),
          } as MediaEntry;
        });

        // Ordenamiento en cliente cuando Firestore no puede
        if (!canSortInFirestore) {
          data = sortEntries(data, sortBy, sortDir);
        }

        setEntries(data);
        setLoading(false);
      },
      () => {
        setError("No se pudo cargar la biblioteca.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, mediaType, status, sortBy, sortDir]);

  return { entries, loading, error, total: entries.length };
}

// ─── Ordenamiento en cliente ──────────────────────────────────────────────────

function sortEntries(
  entries: MediaEntry[],
  sortBy: string,
  sortDir: "asc" | "desc"
): MediaEntry[] {
  return [...entries].sort((a, b) => {
    let valA: string | number | Date | undefined;
    let valB: string | number | Date | undefined;

    if (sortBy === "title") {
      valA = a.title.toLowerCase();
      valB = b.title.toLowerCase();
    } else if (sortBy === "rating") {
      valA = a.rating ?? -1;
      valB = b.rating ?? -1;
    } else if (sortBy === "createdAt") {
      valA = a.createdAt;
      valB = b.createdAt;
    } else {
      valA = a.updatedAt;
      valB = b.updatedAt;
    }

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
}