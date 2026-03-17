// src/lib/firebase/collections.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import type { Collection, CollectionCreatePayload } from "@/types/collection";
import { DEFAULT_COLLECTIONS } from "@/types/collection";

// ─── Referencia ───────────────────────────────────────────────────────────────

function colRef(uid: string) {
  return collection(db, "users", uid, "collections");
}

function colDocRef(uid: string, colId: string) {
  return doc(db, "users", uid, "collections", colId);
}

// ─── Normalizar ───────────────────────────────────────────────────────────────

function snapshotToCollections(
  snap: QuerySnapshot<DocumentData>
): Collection[] {
  return snap.docs.map((d) => {
    const raw = d.data();
    return {
      ...raw,
      id: d.id,
      createdAt: raw.createdAt?.toDate() ?? new Date(),
      updatedAt: raw.updatedAt?.toDate() ?? new Date(),
    } as Collection;
  });
}

// ─── Inicializar colecciones por defecto (primera vez) ───────────────────────

export async function initDefaultCollections(uid: string): Promise<void> {
  const snap = await getDocs(colRef(uid));
  if (!snap.empty) return; // Ya existen, no reinicializar

  await Promise.all(
    DEFAULT_COLLECTIONS.map((col) =>
      addDoc(colRef(uid), {
        ...col,
        userId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    )
  );
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createCollection(
  uid: string,
  payload: CollectionCreatePayload
): Promise<string> {
  const ref = await addDoc(colRef(uid), {
    ...payload,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCollection(
  uid: string,
  colId: string,
  data: Partial<Collection>
): Promise<void> {
  await updateDoc(colDocRef(uid, colId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCollection(
  uid: string,
  colId: string
): Promise<void> {
  await deleteDoc(colDocRef(uid, colId));
}

// ─── Gestión de entradas ──────────────────────────────────────────────────────

export async function addEntryToCollection(
  uid: string,
  colId: string,
  entryId: string
): Promise<void> {
  await updateDoc(colDocRef(uid, colId), {
    entryIds: arrayUnion(entryId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeEntryFromCollection(
  uid: string,
  colId: string,
  entryId: string
): Promise<void> {
  await updateDoc(colDocRef(uid, colId), {
    entryIds: arrayRemove(entryId),
    updatedAt: serverTimestamp(),
  });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getCollections(uid: string): Promise<Collection[]> {
  const q = query(colRef(uid), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snapshotToCollections(snap);
}

export function subscribeCollections(
  uid: string,
  callback: (cols: Collection[]) => void
) {
  const q = query(colRef(uid), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => callback(snapshotToCollections(snap)));
}

// ─── Utilidad: qué colecciones contienen una entry ───────────────────────────

export function getCollectionsForEntry(
  collections: Collection[],
  entryId: string
): Collection[] {
  return collections.filter((c) => c.entryIds.includes(entryId));
}