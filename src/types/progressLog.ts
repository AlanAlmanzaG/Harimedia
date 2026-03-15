// src/types/progressLog.ts

export interface ProgressLogEntry {
  id: string;
  entryId: string;      // ID de la MediaEntry padre
  userId: string;
  date: Date;           // Cuándo se registró
  previousValue: number;
  newValue: number;
  delta: number;        // newValue - previousValue (cuánto avanzó)
  unit: string;         // "ep" | "cap" | "min"
  note?: string;        // Nota opcional del usuario
}

export type ProgressLogCreatePayload = Omit<
  ProgressLogEntry,
  "id" | "date"
>;