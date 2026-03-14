// src/app/(app)/library/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntry } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { MediaDetail } from "@/components/media/MediaDetail";
import type { MediaEntry } from "@/types/media";

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [entry, setEntry] = useState<MediaEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    getEntry(user.uid, id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setEntry(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [user, id]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header con volver */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-sm px-4 py-3 border-b border-neutral-800/50 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <p className="text-sm font-semibold text-neutral-100 truncate">
          {loading ? "Cargando..." : entry?.title ?? "No encontrado"}
        </p>
      </div>

      {/* Contenido */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      )}

      {notFound && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <p className="text-sm text-neutral-500">
            Esta entrada no existe o fue eliminada.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/library")}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Volver a la biblioteca
          </button>
        </div>
      )}

      {entry && !loading && <MediaDetail entry={entry} />}
    </div>
  );
}