// src/lib/collectionConfig.ts
import {
  Heart,
  Bookmark,
  Star,
  Trophy,
  Clock,
  List,
  Flame,
  Eye,
  type LucideIcon,
} from "lucide-react";
import type { CollectionIcon } from "@/types/collection";

// ─── Íconos disponibles ───────────────────────────────────────────────────────

export const COLLECTION_ICONS: Record<CollectionIcon, LucideIcon> = {
  heart:    Heart,
  bookmark: Bookmark,
  star:     Star,
  trophy:   Trophy,
  clock:    Clock,
  list:     List,
  flame:    Flame,
  eye:      Eye,
};

// ─── Colores disponibles ──────────────────────────────────────────────────────

export const COLLECTION_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  violet:  { bg: "bg-violet-500/15",  text: "text-violet-400",  border: "border-violet-500/30",  dot: "bg-violet-400"  },
  pink:    { bg: "bg-pink-500/15",    text: "text-pink-400",    border: "border-pink-500/30",    dot: "bg-pink-400"    },
  amber:   { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-400"   },
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  blue:    { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/30",    dot: "bg-blue-400"    },
  orange:  { bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/30",  dot: "bg-orange-400"  },
  red:     { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-400"     },
  neutral: { bg: "bg-neutral-500/15", text: "text-neutral-400", border: "border-neutral-500/30", dot: "bg-neutral-400" },
};

export const COLOR_KEYS = Object.keys(COLLECTION_COLORS);
export const ICON_KEYS = Object.keys(COLLECTION_ICONS) as CollectionIcon[];