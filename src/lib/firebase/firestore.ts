// src/lib/firebase/firestore.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import type { MediaEntry, MediaType, MediaStatus } from "@/types/media";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function entriesRef(uid: string) {
  return collection(db, "users", uid, "entries");
}

function entryRef(uid: string, entryId: string) {
  return doc(db, "users", uid, "entries", entryId);
}

function snapshotToEntries(snap: QuerySnapshot<DocumentData>): MediaEntry[] {
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      startDate: data.startDate?.toDate(),
      endDate: data.endDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as MediaEntry;
  });
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function addEntry(
  uid: string,
  entry: Omit<MediaEntry, "id" | "userId" | "createdAt" | "updatedAt">
) {
  const ref = await addDoc(entriesRef(uid), {
    ...entry,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEntry(
  uid: string,
  entryId: string,
  data: Partial<MediaEntry>
) {
  await updateDoc(entryRef(uid, entryId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEntry(uid: string, entryId: string) {
  await deleteDoc(entryRef(uid, entryId));
}

export async function getEntry(uid: string, entryId: string) {
  const snap = await getDoc(entryRef(uid, entryId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    startDate: data.startDate?.toDate(),
    endDate: data.endDate?.toDate(),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as MediaEntry;
}

// ─── Queries para Dashboard ───────────────────────────────────────────────────

/** Obras en progreso, ordenadas por última actualización */
export async function getInProgressEntries(
  uid: string,
  max = 10
): Promise<MediaEntry[]> {
  const q = query(
    entriesRef(uid),
    where("status", "==", "IN_PROGRESS"),
    orderBy("updatedAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snapshotToEntries(snap);
}

/** Actividad reciente — cualquier estado, las más actualizadas */
export async function getRecentEntries(
  uid: string,
  max = 8
): Promise<MediaEntry[]> {
  const q = query(
    entriesRef(uid),
    orderBy("updatedAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snapshotToEntries(snap);
}

/** Conteo y promedio de calificación por estado */
export async function getDashboardStats(uid: string) {
  const snap = await getDocs(entriesRef(uid));
  const entries = snapshotToEntries(snap);

  const inProgress = entries.filter((e) => e.status === "IN_PROGRESS").length;
  const completed = entries.filter((e) => e.status === "COMPLETED").length;
  const rated = entries.filter((e) => e.rating != null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((acc, e) => acc + (e.rating ?? 0), 0) / rated.length
      : 0;

  // Conteo por tipo de medio
  const byType = entries.reduce<Partial<Record<MediaType, number>>>(
    (acc, e) => {
      acc[e.mediaType] = (acc[e.mediaType] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return {
    total: entries.length,
    inProgress,
    completed,
    avgRating: Math.round(avgRating * 10) / 10,
    byType,
  };
}

/** Suscripción en tiempo real a entradas en progreso */
export function subscribeToInProgress(
  uid: string,
  callback: (entries: MediaEntry[]) => void,
  max = 10
) {
  const q = query(
    entriesRef(uid),
    where("status", "==", "IN_PROGRESS"),
    orderBy("updatedAt", "desc"),
    limit(max)
  );
  return onSnapshot(q, (snap) => callback(snapshotToEntries(snap)));
}