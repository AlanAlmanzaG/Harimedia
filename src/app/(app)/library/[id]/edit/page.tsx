// src/app/(app)/library/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntry } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { MediaForm } from "@/components/media/MediaForm";
import type { MediaEntry } from "@/types/media";

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [entry, setEntry] = useState<MediaEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    getEntry(user.uid, id)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [user, id]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-sm px-4 py-3 border-b border-neutral-800/50 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div>
          <p className="text-sm font-semibold text-neutral-100">Editar entrada</p>
          {entry && (
            <p className="text-xs text-neutral-500 truncate">{entry.title}</p>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && entry && (
        <MediaForm
          existingEntry={entry}
          onSuccess={(entryId) => router.replace(`/library/${entryId}`)}
        />
      )}

      {!loading && !entry && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-neutral-500">Entrada no encontrada.</p>
        </div>
      )}
    </div>
  );
}