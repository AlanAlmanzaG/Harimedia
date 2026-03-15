// src/hooks/useProgressLog.ts
"use client";

import { useEffect, useState } from "react";
import { subscribeProgressLog } from "@/lib/firebase/progressLog";
import type { ProgressLogEntry } from "@/types/progressLog";

export function useProgressLog(uid: string | undefined, entryId: string) {
  const [logs, setLogs] = useState<ProgressLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !entryId) return;

    const unsubscribe = subscribeProgressLog(uid, entryId, (data) => {
      setLogs(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid, entryId]);

  return { logs, loading };
}