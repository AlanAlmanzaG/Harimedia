// src/lib/firebase/progressLog.ts
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import type { ProgressLogEntry, ProgressLogCreatePayload } from "@/types/progressLog";

// ─── Referencia a la subcolección ────────────────────────────────────────────

function logRef(uid: string, entryId: string) {
  return collection(db, "users", uid, "entries", entryId, "progressLog");
}

// ─── Normalizar snapshot ──────────────────────────────────────────────────────

function snapshotToLogs(snap: QuerySnapshot<DocumentData>): ProgressLogEntry[] {
  return snap.docs.map((d) => {
    const raw = d.data();
    return {
      ...raw,
      id: d.id,
      date: raw.date?.toDate() ?? new Date(),
    } as ProgressLogEntry;
  });
}

// ─── Agregar entrada al log ───────────────────────────────────────────────────

export async function addProgressLog(
  uid: string,
  entryId: string,
  payload: ProgressLogCreatePayload
): Promise<string> {
  const ref = await addDoc(logRef(uid, entryId), {
    ...payload,
    date: serverTimestamp(),
  });
  return ref.id;
}

// ─── Obtener historial completo ───────────────────────────────────────────────

export async function getProgressLog(
  uid: string,
  entryId: string,
  max = 50
): Promise<ProgressLogEntry[]> {
  const q = query(logRef(uid, entryId), orderBy("date", "desc"), limit(max));
  const snap = await getDocs(q);
  return snapshotToLogs(snap);
}

// ─── Suscripción en tiempo real ───────────────────────────────────────────────

export function subscribeProgressLog(
  uid: string,
  entryId: string,
  callback: (logs: ProgressLogEntry[]) => void,
  max = 50
) {
  const q = query(logRef(uid, entryId), orderBy("date", "desc"), limit(max));
  return onSnapshot(q, (snap) => callback(snapshotToLogs(snap)));
}

// ─── Eliminar entrada del log ─────────────────────────────────────────────────

export async function deleteProgressLog(
  uid: string,
  entryId: string,
  logId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "entries", entryId, "progressLog", logId));
}