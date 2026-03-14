// src/app/(app)/search/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MediaForm } from "@/components/media/MediaForm";
import { MEDIA_TYPE_CONFIG } from "@/lib/mediaConfig";
import type { SearchResult, MediaType } from "@/types/media";

export default function AddMediaPage() {
  const router = useRouter();
  const [prefill, setPrefill] = useState<SearchResult | null>(null);
  const [manualType, setManualType] = useState<MediaType>("MOVIE");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Leer prefill desde sessionStorage (set por la página de búsqueda)
    const raw = sessionStorage.getItem("harimedia_prefill");
    if (raw) {
      try {
        setPrefill(JSON.parse(raw));
      } catch {
        // JSON inválido — ignorar
      }
      sessionStorage.removeItem("harimedia_prefill");
    } else {
      // Entrada manual — recuperar tipo seleccionado
      const typeRaw = sessionStorage.getItem("harimedia_prefill_type");
      if (typeRaw) {
        try {
          const { mediaType } = JSON.parse(typeRaw);
          setManualType(mediaType);
        } catch {
          // ignorar
        }
        sessionStorage.removeItem("harimedia_prefill_type");
      }
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <span className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const typeConfig = MEDIA_TYPE_CONFIG[prefill?.mediaType ?? manualType];

  return (
    <div className="flex flex-col">
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
          <p className="text-sm font-semibold text-neutral-100">
            {prefill ? "Confirmar y agregar" : "Agregar manualmente"}
          </p>
          <p className={`text-xs ${typeConfig.color}`}>
            {typeConfig.label}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <MediaForm
        prefill={prefill ?? undefined}
        existingEntry={
          prefill
            ? undefined
            : ({
                mediaType: manualType,
                title: "",
                synopsis: "",
                coverUrl: "",
                status: "PENDING",
              } as any)
        }
      />
    </div>
  );
}